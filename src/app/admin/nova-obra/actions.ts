'use server';

import { criarClientAdmin } from '@/lib/supabase/admin';
import { v4 as uuidv4 } from 'uuid';

/**
 * Cria uma nova obra no banco, sobe a imagem de referência (se enviada)
 * para o bucket "referencias" e devolve o id da obra criada.
 * O token_acesso é gerado automaticamente pelo default da coluna no Postgres.
 */
export async function criarObraAction(formData: FormData) {
  try {
    const supabase = criarClientAdmin();

    const titulo = formData.get('titulo') as string;
    const cliente_nome = formData.get('cliente_nome') as string;
    const cliente_email = (formData.get('cliente_email') as string) || null;
    const descricao = (formData.get('descricao') as string) || null;
    const orcamento_total = parseFloat((formData.get('orcamento_total') as string) || '0') || 0;
    const estimativa_conclusao = (formData.get('estimativa_conclusao') as string) || null;
    const imagem = formData.get('imagem_referencia') as File | null;

    if (!titulo || !cliente_nome) {
      return { erro: 'Título e nome do cliente são obrigatórios.' };
    }

    let imagem_referencia_url: string | null = null;

    if (imagem && imagem.size > 0) {
      const extensao = imagem.name.split('.').pop();
      const caminho = `${uuidv4()}.${extensao}`;

      const { error: erroUpload } = await supabase.storage
        .from('referencias')
        .upload(caminho, imagem, { contentType: imagem.type, upsert: false });

      if (erroUpload) {
        return { erro: `Falha no upload da imagem: ${erroUpload.message}` };
      }

      const { data: publicUrl } = supabase.storage.from('referencias').getPublicUrl(caminho);
      imagem_referencia_url = publicUrl.publicUrl;
    }

    const { data, error } = await supabase
      .from('obras')
      .insert({
        titulo,
        cliente_nome,
        cliente_email,
        descricao,
        orcamento_total,
        estimativa_conclusao,
        imagem_referencia_url,
      })
      .select('id')
      .single();

    if (error) {
      return { erro: error.message };
    }

    return { id: data.id };
  } catch (err) {
    console.error('[criarObraAction]', err);
    return { erro: err instanceof Error ? err.message : 'Erro inesperado ao criar obra.' };
  }
}
