'use server';

import { criarClientAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { StatusObra } from '@/lib/types';

export async function atualizarStatusKanbanAction(obraId: string, novoStatus: StatusObra) {
  const supabase = criarClientAdmin();

  const { error } = await supabase
    .from('obras')
    .update({ status_atual: novoStatus })
    .eq('id', obraId);

  if (error) return { erro: error.message };

  revalidatePath('/admin');
  return { erro: null };
}
