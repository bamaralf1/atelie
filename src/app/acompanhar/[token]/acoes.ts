'use server';

import { criarClientServidor } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function enviarComentarioAction(token: string, obraId: string, texto: string) {
  const supabase = criarClientServidor();

  const { error } = await supabase.from('comentarios').insert({
    obra_id: obraId,
    autor: 'cliente',
    texto,
  });

  if (error) return { erro: error.message };
  revalidatePath(`/acompanhar/${token}`);
  return { erro: null };
}
