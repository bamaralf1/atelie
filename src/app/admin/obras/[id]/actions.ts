'use server';

import { criarClientAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

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

  const { error } = await supabase
    .from('obras')
    .update({ status_atual, percentual_conclusao, estimativa_conclusao, descricao, observacoes, exibir_custos })
    .eq('id', obraId);

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
  return { erro: null };
}

export async function removerFotoAction(obraId: string, fotoId: string) {
  const supabase = criarClientAdmin();
  const { error } = await supabase.from('fotos_progresso').delete().eq('id', fotoId);
  revalidatePath(`/admin/obras/${obraId}`);
  return { erro: error?.message };
}
