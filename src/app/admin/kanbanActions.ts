'use server';

import { criarClientAdmin } from '@/lib/supabase/admin';
import { enviarEmailAtualizacaoObra } from '@/lib/email';
import { revalidatePath } from 'next/cache';
import { StatusObra } from '@/lib/types';

export async function atualizarStatusKanbanAction(obraId: string, novoStatus: StatusObra) {
  const supabase = criarClientAdmin();

  const { data: obraAntes } = await supabase
    .from('obras')
    .select('*')
    .eq('id', obraId)
    .single();

  const { error } = await supabase
    .from('obras')
    .update({ status_atual: novoStatus })
    .eq('id', obraId);

  if (error) return { erro: error.message };

  revalidatePath('/admin');

  if (obraAntes && obraAntes.status_atual !== novoStatus) {
    const { data: obraDepois } = await supabase
      .from('obras')
      .select('*')
      .eq('id', obraId)
      .single();

    if (obraDepois) {
      await enviarEmailAtualizacaoObra({
        obra: obraDepois,
        alteracoes: [
          {
            rotulo: 'Status da obra',
            de: obraAntes.status_atual,
            para: novoStatus,
          },
        ],
      });
    }
  }

  return { erro: null };
}
