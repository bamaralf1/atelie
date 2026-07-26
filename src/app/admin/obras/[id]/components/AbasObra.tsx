'use client';

import { useState } from 'react';
import { Obra, Material, FotoProgresso } from '@/lib/types';
import { TabVisaoGeral } from './TabVisaoGeral';
import { TabMateriais } from './TabMateriais';
import { TabFotos } from './TabFotos';
import { TabCliente } from './TabCliente';

type NomeAba = 'visao-geral' | 'materiais' | 'fotos' | 'cliente';

const ABAS: { id: NomeAba; label: string }[] = [
  { id: 'visao-geral', label: 'Visão Geral' },
  { id: 'materiais', label: 'Materiais' },
  { id: 'fotos', label: 'Fotos' },
  { id: 'cliente', label: 'Cliente' },
];

export function AbasObra({
  obra,
  materiaisIniciais,
  fotosIniciais,
}: {
  obra: Obra;
  materiaisIniciais: Material[];
  fotosIniciais: FotoProgresso[];
}) {
  const [abaAtiva, setAbaAtiva] = useState<NomeAba>('visao-geral');

  return (
    <div>
      <div className="flex gap-1 border-b border-atelie-borda mb-6">
        {ABAS.map((aba) => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              abaAtiva === aba.id
                ? 'border-atelie-dourado text-atelie-douradoClaro'
                : 'border-transparent text-atelie-textoMuted hover:text-atelie-texto'
            }`}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {abaAtiva === 'visao-geral' && <TabVisaoGeral obra={obra} />}
      {abaAtiva === 'materiais' && <TabMateriais obraId={obra.id} materiaisIniciais={materiaisIniciais} />}
      {abaAtiva === 'fotos' && <TabFotos obraId={obra.id} fotosIniciais={fotosIniciais} />}
      {abaAtiva === 'cliente' && <TabCliente obra={obra} />}
    </div>
  );
}
