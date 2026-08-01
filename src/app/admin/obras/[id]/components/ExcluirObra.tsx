'use client';

import { useState } from 'react';
import { excluirObraAction } from '../actions';

export function ExcluirObra({ obraId, titulo }: { obraId: string; titulo: string }) {
  const [excluindo, setExcluindo] = useState(false);

  async function handleExcluir() {
    const ok = window.confirm(
      `Excluir definitivamente a obra "${titulo}"? Materiais, histórico e fotos também serão removidos. Esta ação não pode ser desfeita.`
    );
    if (!ok) return;
    setExcluindo(true);
    await excluirObraAction(obraId);
  }

  return (
    <button
      onClick={handleExcluir}
      disabled={excluindo}
      className="text-atelie-terracotaClaro text-sm border border-atelie-terracota/40 rounded-md px-3 py-1.5 hover:bg-atelie-terracota/10 transition-colors disabled:opacity-50"
    >
      {excluindo ? 'Excluindo...' : 'Excluir obra'}
    </button>
  );
}
