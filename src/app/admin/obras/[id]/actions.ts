'use server';

import { criarClientAdmin } from '@/lib/supabase/admin';
import { enviarEmailAtualizacaoObra, AlteracaoObra } from '@/lib/email';
import { formatarData } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

/** Resume um texto longo para caber no e-mail de atualização. */
function resumo(texto: string | null, limite = 140): string {
  if (!texto) return '—';
  const limpo = texto.replace(/\s+/g, ' ').trim();
  return limpo.length > limite ? `${limpo.slice(0, limite)}…` : limpo;
}

async function apagarArquivoStorage(url: string | null) {
  if (!url) return;
  try {
    const partes = new URL(url).pathname.split('/');
    const idx = partes.indexOf('public');
    if (idx < 0 || partes.length <= idx + 1) return;
    const bucket = partes[idx + 1];
    const caminho = partes.slice(idx + 2).join('/');
    if (!caminho) return;
    const supabase = criarClientAdmin();
    await supabase.storage.from(bucket).remove([caminho]);
  } catch {}
}

/** Atualiza os dados gerais da obra (aba "Visão Geral"). O trigger no banco
 * registra automaticamente o histórico quando status_atual muda. */
export async function atualizarVisaoGeralAction(obraId: string, formData: FormData) {
  const supabase = criarClientAdmin();

  const status_atual = formData.get('status_atual') as string;
  const percentual_conclusao = parseInt((formData.get('percentual_conclusao') as string) || '0', 10);
  const estimativa_conclusao = (formData.get('estimativa_conclusao') as string) || null;
  const descricao = (formData.get('descricao') as string) || null;
  const observacoes = (formData.get('observacoes') as string) || null;
  const exibir_custos = formData.get('exibir_custos') === 'on';
  const titulo = (formData.get('titulo') as string)?.trim() || null;
  const orcamento_total = parseFloat((formData.get('orcamento_total') as string) || '0') || 0;
  const valor_recebido = parseFloat((formData.get('valor_recebido') as string) || '0') || 0;
  const desconto = parseFloat((formData.get('desconto') as string) || '0') || 0;
  const entrega_status = (formData.get('entrega_status') as string) || null;
  const rotulos = ((formData.get('rotulos') as string) || '')
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);

  const { data: obraAntes, error: erroLeitura } = await supabase
    .from('obras')
    .select('*')
    .eq('id', obraId)
    .single();

  if (erroLeitura) console.error('[action] Falha ao ler obra:', erroLeitura.message);

  const { error } = await supabase
    .from('obras')
    .update({
      status_atual,
      percentual_conclusao,
      estimativa_conclusao,
      descricao,
      observacoes,
      exibir_custos,
      titulo,
      orcamento_total,
      valor_recebido,
      desconto,
      entrega_status,
      rotulos,
    })
    .eq('id', obraId);

  console.log('[action] atualizarVisaoGeral', obraId, status_atual, `${percentual_conclusao}%`, error ? `ERRO: ${error.message}` : 'ok');

  revalidatePath(`/admin/obras/${obraId}`);

  if (!error && obraAntes) {
    // Avisa o cliente apenas quando algo visível na página de acompanhamento mudou.
    const alteracoes: AlteracaoObra[] = [];

    if (status_atual !== obraAntes.status_atual) {
      alteracoes.push({ rotulo: 'Status da obra', de: obraAntes.status_atual, para: status_atual });
    }
    if (percentual_conclusao !== obraAntes.percentual_conclusao) {
      alteracoes.push({
        rotulo: 'Percentual de conclusão',
        de: `${obraAntes.percentual_conclusao}%`,
        para: `${percentual_conclusao}%`,
      });
    }
    if ((estimativa_conclusao ?? null) !== (obraAntes.estimativa_conclusao ?? null)) {
      alteracoes.push({
        rotulo: 'Estimativa de conclusão',
        de: formatarData(obraAntes.estimativa_conclusao),
        para: formatarData(estimativa_conclusao),
      });
    }
    if ((entrega_status ?? null) !== (obraAntes.entrega_status ?? null)) {
      alteracoes.push({
        rotulo: 'Etapa de entrega',
        de: obraAntes.entrega_status || 'Sem etapa',
        para: entrega_status || 'Sem etapa',
      });
    }
    if ((titulo ?? null) !== (obraAntes.titulo ?? null)) {
      alteracoes.push({ rotulo: 'Título da obra', de: obraAntes.titulo, para: titulo });
    }
    if ((descricao ?? null) !== (obraAntes.descricao ?? null)) {
      alteracoes.push({ rotulo: 'Descrição da obra', para: resumo(descricao) });
    }
    if ((observacoes ?? null) !== (obraAntes.observacoes ?? null)) {
      alteracoes.push({ rotulo: 'Observações para o cliente', para: resumo(observacoes) });
    }
    const rotulosAntes = (obraAntes.rotulos ?? []).join(', ');
    const rotulosDepois = rotulos.join(', ');
    if (rotulosAntes !== rotulosDepois) {
      alteracoes.push({ rotulo: 'Rótulos', de: rotulosAntes || '—', para: rotulosDepois || '—' });
    }

    if (alteracoes.length > 0) {
      const { data: obraDepois } = await supabase
        .from('obras')
        .select('*')
        .eq('id', obraId)
        .single();

      if (obraDepois) {
        const email = await enviarEmailAtualizacaoObra({ obra: obraDepois, alteracoes });
        return {
          erro: null,
          emailEnviado: email.enviado,
          emailErro: email.enviado ? null : email.erro ?? 'E-mail não enviado.',
        };
      }
    }
  }

  return { erro: error?.message, emailEnviado: false, emailErro: null };
}

/** Edita nome e e-mail do cliente (aba "Cliente"). */
export async function atualizarClienteAction(obraId: string, formData: FormData) {
  const supabase = criarClientAdmin();

  const cliente_nome = (formData.get('cliente_nome') as string)?.trim() || null;
  const cliente_email = (formData.get('cliente_email') as string)?.trim() || null;

  if (!cliente_nome) return { erro: 'Informe o nome do cliente.' };

  const { error } = await supabase
    .from('obras')
    .update({ cliente_nome, cliente_email })
    .eq('id', obraId);

  revalidatePath(`/admin/obras/${obraId}`);
  return { erro: error?.message };
}

/** Substitui a imagem de referência da obra. */
export async function atualizarReferenciaAction(obraId: string, formData: FormData) {
  const supabase = criarClientAdmin();

  const arquivo = formData.get('referencia') as File | null;
  if (!arquivo || arquivo.size === 0) return { erro: 'Selecione uma imagem.' };

  const extensao = arquivo.name.split('.').pop();
  const caminho = `${obraId}/referencia-${uuidv4()}.${extensao}`;

  const { error: erroUpload } = await supabase.storage
    .from('referencias')
    .upload(caminho, arquivo, { contentType: arquivo.type, upsert: true });

  if (erroUpload) return { erro: erroUpload.message };

  const { data: publicUrl } = supabase.storage.from('referencias').getPublicUrl(caminho);

  const { data: obraAtual } = await supabase
    .from('obras')
    .select('imagem_referencia_url')
    .eq('id', obraId)
    .single();

  const { error } = await supabase
    .from('obras')
    .update({ imagem_referencia_url: publicUrl.publicUrl })
    .eq('id', obraId);

  if (!error && obraAtual?.imagem_referencia_url) {
    await apagarArquivoStorage(obraAtual.imagem_referencia_url);
  }

  revalidatePath(`/admin/obras/${obraId}`);
  return { erro: error?.message };
}

/** Exclui a obra e tudo associado (fotos, histórico, comentários, materiais). */
export async function excluirObraAction(obraId: string) {
  const supabase = criarClientAdmin();

  const { data: obra } = await supabase
    .from('obras')
    .select('imagem_referencia_url')
    .eq('id', obraId)
    .single();
  await apagarArquivoStorage(obra?.imagem_referencia_url ?? null);

  const { data: fotos } = await supabase
    .from('fotos_progresso')
    .select('url_foto')
    .eq('obra_id', obraId);
  for (const f of fotos ?? []) {
    await apagarArquivoStorage(f.url_foto);
  }

  const { error } = await supabase.from('obras').delete().eq('id', obraId);

  revalidatePath('/admin');
  revalidatePath(`/admin/obras/${obraId}`);
  return { erro: error?.message };
}

/** Adiciona um material à obra. O custo total é recalculado por trigger. */
export async function adicionarMaterialAction(obraId: string, formData: FormData) {
  const supabase = criarClientAdmin();

  const nome = formData.get('nome') as string;
  const quantidade = parseFloat((formData.get('quantidade') as string) || '1');
  const custo_unitario = parseFloat((formData.get('custo_unitario') as string) || '0');
  const fornecedor = (formData.get('fornecedor') as string) || null;

  if (!nome) return { erro: 'Informe o nome do material.' };

  const { error } = await supabase
    .from('materiais')
    .insert({ obra_id: obraId, nome, quantidade, custo_unitario, fornecedor });

  revalidatePath(`/admin/obras/${obraId}`);
  return { erro: error?.message };
}

export async function removerMaterialAction(obraId: string, materialId: string) {
  const supabase = criarClientAdmin();
  const { error } = await supabase.from('materiais').delete().eq('id', materialId);
  revalidatePath(`/admin/obras/${obraId}`);
  return { erro: error?.message };
}

/** Sobe uma foto de progresso e atualiza imagem_obra_atual_url da obra. */
export async function enviarFotoProgressoAction(obraId: string, formData: FormData) {
  const supabase = criarClientAdmin();

  const arquivo = formData.get('foto') as File | null;
  const legenda = (formData.get('legenda') as string) || null;
  const etapa = (formData.get('etapa') as string) || null;

  if (!arquivo || arquivo.size === 0) return { erro: 'Selecione uma foto.' };

  const extensao = arquivo.name.split('.').pop();
  const caminho = `${obraId}/${uuidv4()}.${extensao}`;

  const { error: erroUpload } = await supabase.storage
    .from('progresso')
    .upload(caminho, arquivo, { contentType: arquivo.type });

  if (erroUpload) return { erro: erroUpload.message };

  const { data: publicUrl } = supabase.storage.from('progresso').getPublicUrl(caminho);

  const { error: erroInsert } = await supabase
    .from('fotos_progresso')
    .insert({ obra_id: obraId, url_foto: publicUrl.publicUrl, legenda, etapa });

  if (erroInsert) return { erro: erroInsert.message };

  // A última foto enviada substitui a imagem de destaque da obra.
  await supabase.from('obras').update({ imagem_obra_atual_url: publicUrl.publicUrl }).eq('id', obraId);

  revalidatePath(`/admin/obras/${obraId}`);

  const { data: obra } = await supabase
    .from('obras')
    .select('*')
    .eq('id', obraId)
    .single();

  if (obra) {
    await enviarEmailAtualizacaoObra({
      obra,
      alteracoes: [
        {
          rotulo: 'Nova foto de progresso',
          para: legenda || etapa || 'Publicada no acompanhamento',
        },
      ],
      imagemUrl: publicUrl.publicUrl,
    });
  }

  return { erro: null };
}

export async function removerFotoAction(obraId: string, fotoId: string) {
  const supabase = criarClientAdmin();
  const { error } = await supabase.from('fotos_progresso').delete().eq('id', fotoId);
  revalidatePath(`/admin/obras/${obraId}`);
  return { erro: error?.message };
}
