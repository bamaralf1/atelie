'use client';

import { useState } from 'react';
import { Material } from '@/lib/types';
import { formatarMoeda } from '@/lib/utils';
import { adicionarMaterialAction, removerMaterialAction } from '../actions';

const CATEGORIAS = [
  'Tinta',
  'Pincel',
  'Tela',
  'Verniz',
  'Solvente',
  'Ferramenta',
  'Moldura',
  'Outro',
];

export function TabMateriais({ obraId, materiaisIniciais }: { obraId: string; materiaisIniciais: Material[] }) {
  const [materiais, setMateriais] = useState(materiaisIniciais);
  const [categoria, setCategoria] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const total = materiais.reduce((soma, m) => soma + m.quantidade * m.custo_unitario, 0);

  const materiaisAgrupados = CATEGORIAS.map((cat) => ({
    categoria: cat,
    itens: materiais.filter((m) => (m.fornecedor === cat || (!m.fornecedor && cat === 'Outro'))),
  }));

  const porFornecedor = materiais.reduce<Record<string, Material[]>>((acc, m) => {
    const key = m.fornecedor || 'Sem categoria';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  async function handleAdicionar(formData: FormData) {
    const resultado = await adicionarMaterialAction(obraId, formData);
    if (!resultado?.erro) {
      setMateriais((prev) => [
        {
          id: crypto.randomUUID(),
          obra_id: obraId,
          nome: formData.get('nome') as string,
          quantidade: parseFloat(formData.get('quantidade') as string) || 1,
          custo_unitario: parseFloat(formData.get('custo_unitario') as string) || 0,
          fornecedor: categoria || null,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setCategoria('');
    }
  }

  async function handleRemover(materialId: string) {
    setMateriais((prev) => prev.filter((m) => m.id !== materialId));
    await removerMaterialAction(obraId, materialId);
  }

  function exportarCSV() {
    const linhas = [['Nome', 'Quantidade', 'Custo Unitário', 'Subtotal', 'Categoria'].join(',')];
    materiais.forEach((m) => {
      const subtotal = (m.quantidade * m.custo_unitario).toFixed(2);
      linhas.push([`"${m.nome}"`, m.quantidade, m.custo_unitario.toFixed(2), subtotal, `"${m.fornecedor || ''}"`].join(','));
    });
    linhas.push(['', '', '', `"Total: ${total.toFixed(2)}"`, ''].join(','));
    const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `materiais-obra-${obraId.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totaisPorCategoria = Object.entries(porFornecedor).map(([cat, itens]) => ({
    categoria: cat,
    total: itens.reduce((s, m) => s + m.quantidade * m.custo_unitario, 0),
    quantidade: itens.length,
  }));

  return (
    <div className="max-w-3xl space-y-6">
      {/* Formulário de adicionar */}
      <form
        action={handleAdicionar}
        className="bg-atelie-superficie border border-atelie-borda rounded-lg p-5 grid grid-cols-2 sm:grid-cols-6 gap-3 items-end"
      >
        <div className="col-span-2 sm:col-span-2">
          <label className="block text-xs text-atelie-textoMuted mb-1">Nome</label>
          <input name="nome" required className="input-atelie text-sm" />
        </div>
        <div>
          <label className="block text-xs text-atelie-textoMuted mb-1">Qtd.</label>
          <input name="quantidade" type="number" step="0.01" defaultValue={1} className="input-atelie text-sm" />
        </div>
        <div>
          <label className="block text-xs text-atelie-textoMuted mb-1">Custo unit. (R$)</label>
          <input name="custo_unitario" type="number" step="0.01" defaultValue={0} className="input-atelie text-sm" />
        </div>
        <button type="submit" className="btn-dourado px-3 py-1.5 text-sm">
          Adicionar
        </button>
        <div className="col-span-2 sm:col-span-4">
          <label className="block text-xs text-atelie-textoMuted mb-1">Categoria (opcional)</label>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoria(cat === categoria ? '' : cat)}
                className={`px-2 py-1 rounded text-xs border transition-colors ${
                  categoria === cat
                    ? 'bg-atelie-dourado/20 border-atelie-dourado text-atelie-douradoClaro'
                    : 'bg-atelie-superficie2 border-atelie-borda text-atelie-textoMuted hover:text-atelie-texto'
                }`}
              >
                {cat}
              </button>
            ))}
            <input type="hidden" name="fornecedor" value={categoria} />
          </div>
        </div>
      </form>

      {/* Totais por categoria */}
      {totaisPorCategoria.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {totaisPorCategoria.map(({ categoria: cat, total: tot, quantidade: qtd }) => (
            <div key={cat} className="bg-atelie-superficie border border-atelie-borda rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wide text-atelie-textoMuted">{cat}</p>
              <p className="text-sm font-mono text-atelie-douradoClaro">{formatarMoeda(tot)}</p>
              <p className="text-[10px] text-atelie-textoMuted">{qtd} item{Number(qtd) > 1 ? 'ns' : ''}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabela de materiais */}
      <div className="bg-atelie-superficie border border-atelie-borda rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-atelie-superficie2 border-b border-atelie-borda">
          <span className="text-xs text-atelie-textoMuted">
            {materiais.length} material{Number(materiais.length) !== 1 ? 'is' : ''}
          </span>
          {materiais.length > 0 && (
            <button onClick={exportarCSV} className="btn-outline px-3 py-1 text-xs">
              Exportar CSV
            </button>
          )}
        </div>

        <table className="w-full text-sm">
          <thead className="text-atelie-textoMuted text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Nome</th>
              <th className="text-right px-4 py-2">Qtd.</th>
              <th className="text-right px-4 py-2">Custo unit.</th>
              <th className="text-right px-4 py-2">Subtotal</th>
              <th className="text-left px-4 py-2">Categoria</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {materiais.map((m) => (
              <tr key={m.id} className="border-t border-atelie-borda font-mono hover:bg-atelie-superficie2/50 transition-colors">
                <td className="px-4 py-2 font-body">{m.nome}</td>
                <td className="px-4 py-2 text-right">{m.quantidade}</td>
                <td className="px-4 py-2 text-right">{formatarMoeda(m.custo_unitario)}</td>
                <td className="px-4 py-2 text-right text-atelie-douradoClaro">
                  {formatarMoeda(m.quantidade * m.custo_unitario)}
                </td>
                <td className="px-4 py-2 font-body">
                  {m.fornecedor ? (
                    <span className="text-[10px] bg-atelie-dourado/10 text-atelie-douradoClaro px-1.5 py-0.5 rounded">
                      {m.fornecedor}
                    </span>
                  ) : (
                    <span className="text-atelie-textoMuted">—</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => handleRemover(m.id)}
                    className="text-atelie-terracotaClaro hover:underline text-xs"
                  >
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
              <td colSpan={3} className="px-4 py-3 text-right text-atelie-textoMuted text-xs">Total de materiais</td>
              <td className="px-4 py-3 text-right font-mono text-atelie-douradoClaro font-semibold">{formatarMoeda(total)}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
