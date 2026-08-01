import { criarClientAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = criarClientAdmin();

    const { data: obras, error } = await supabase
      .from('obras')
      .select('id, titulo')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

    if (obras.length <= 2) {
      return NextResponse.json({ mensagem: 'Já existem 2 obras ou menos. Nada removido.', obras: obras.length });
    }

    const idsRemover = obras.slice(2).map((o: { id: string }) => o.id);
    const titulosRemovidos = obras.slice(2).map((o: { titulo: string }) => o.titulo);

    const { error: errDel } = await supabase.from('obras').delete().in('id', idsRemover);

    if (errDel) return NextResponse.json({ erro: errDel.message }, { status: 500 });

    return NextResponse.json({
      mensagem: `${titulosRemovidos.length} obra(s) removida(s). Restam 2.`,
      removidos: titulosRemovidos,
    });
  } catch (erro) {
    return NextResponse.json({ erro: String(erro) }, { status: 500 });
  }
}
