'use client';

import { useState, useTransition } from 'react';
import { Material } from '@/lib/types';
import { formatarMoeda } from '@/lib/utils';
import { adicionarMaterialAction, removerMaterialAction } from '../actions';

export function TabMateriais({ obraId, materiaisIniciais }: { obraId: string; materiaisIniciais: Material[] }) {
  const [materiais, setMateriais] = useState(materiaisIniciais);
  const [pending, startTransition] = useTransition();

  const total = materiais.reduce((soma, m) => soma + m.quantidade * m.custo_unitario, 0);

  async function handleAdicionar(formData: FormData) {
    const resultado = await adicionarMaterialAction(obraId, formData);
    if (!resultado?.erro) {
      startTransition(() => {
        // Otimista: em produção real recarregaríamos via revalidatePath (server) — aqui refletimos localmente.
        setMateriais((prev) => [
          {
            id: crypto.randomUUID(),
            obra_id: obraId,
            nome: formData.get('nome') as string,
            quantidade: parseFloat(formData.get('quantidade') as string) || 1,
            custo_unitario: parseFloat(formData.get('custo_unitario') as string) || 0,
            fornecedor: (formData.get('fornecedor') as string) || null,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      });
    }
  }

  async function handleRemover(materialId: string) {
    setMateriais((prev) => prev.filter((m) => m.id !== materialId));
    await removerMaterialAction(obraId, materialId);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <form
        action={handleAdicionar}
        className="bg-atelie-superficie border border-atelie-borda rounded-lg p-5 grid grid-cols-2 sm:grid-cols-5 gap-3 items-end"
      >
        <div className="col-span-2 sm:col-span-2">
          <label className="block text-xs text-atelie-textoMuted mb-1">Nome</label>
          <input name="nome" required className="w-full bg-atelie-fundo border border-atelie-borda rounded-md px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-atelie-textoMuted mb-1">Qtd.</label>
          <input name="quantidade" type="number" step="0.01" defaultValue={1} className="w-full bg-atelie-fundo border border-atelie-borda rounded-md px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-atelie-textoMuted mb-1">Custo unit. (R$)</label>
          <input name="custo_unitario" type="number" step="0.01" defaultValue={0} className="w-full bg-atelie-fundo border border-atelie-borda rounded-md px-2 py-1.5 text-sm" />
        </div>
        <button type="submit" className="bg-atelie-dourado text-atelie-fundo rounded-md px-3 py-1.5 text-sm font-medium hover:bg-atelie-douradoClaro transition-colors">
          Adicionar
        </button>
        <div className="col-span-2 sm:col-span-5">
          <label className="block text-xs text-atelie-textoMuted mb-1">Fornecedor (opcional)</label>
          <input name="fornecedor" className="w-full bg-atelie-fundo border border-atelie-borda rounded-md px-2 py-1.5 text-sm" />
        </div>
      </form>

      <div className="bg-atelie-superficie border border-atelie-borda rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-atelie-superficie2 text-atelie-textoMuted text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Nome</th>
              <th className="text-right px-4 py-2">Qtd.</th>
              <th className="text-right px-4 py-2">Custo unit.</th>
              <th className="text-right px-4 py-2">Subtotal</th>
              <th className="text-left px-4 py-2">Fornecedor</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {materiais.map((m) => (
              <tr key={m.id} className="border-t border-atelie-borda font-mono">
                <td className="px-4 py-2 font-body">{m.nome}</td>
                <td className="px-4 py-2 text-right">{m.quantidade}</td>
                <td className="px-4 py-2 text-right">{formatarMoeda(m.custo_unitario)}</td>
                <td className="px-4 py-2 text-right text-atelie-douradoClaro">
                  {formatarMoeda(m.quantidade * m.custo_unitario)}
                </td>
                <td className="px-4 py-2 font-body text-atelie-textoMuted">{m.fornecedor ?? '—'}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => handleRemover(m.id)} className="text-atelie-terracotaClaro hover:underline">
                    remover
                  </button>
                </td>
              </tr>
            ))}
            {materiais.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-atelie-textoMuted">Nenhum material cadastrado.</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-atelie-borda bg-atelie-superficie2">
              <td colSpan={3} className="px-4 py-3 text-right text-atelie-textoMuted">Total de materiais</td>
              <td className="px-4 py-3 text-right font-mono text-atelie-douradoClaro font-semibold">{formatarMoeda(total)}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
