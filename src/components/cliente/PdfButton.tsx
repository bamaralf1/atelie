'use client';

import { useState } from 'react';
import { Obra, Material, HistoricoStatus } from '@/lib/types';
import { formatarData, formatarMoeda, formatarDataHora } from '@/lib/utils';

/**
 * Gera um relatório simples em PDF com o andamento da obra, usando jsPDF.
 * Optamos por montar o PDF via texto (jsPDF puro) em vez de html2canvas,
 * o que produz um arquivo mais leve e com texto selecionável.
 */
export function PdfButton({
  obra,
  materiais,
  historico,
}: {
  obra: Obra;
  materiais: Material[];
  historico: HistoricoStatus[];
}) {
  const [gerando, setGerando] = useState(false);

  async function gerarPdf() {
    setGerando(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      let y = 20;

      doc.setFontSize(18);
      doc.text(obra.titulo, 14, y);
      y += 8;
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Cliente: ${obra.cliente_nome}`, 14, y);
      y += 10;

      doc.setTextColor(0);
      doc.setFontSize(13);
      doc.text('Status atual', 14, y);
      y += 6;
      doc.setFontSize(11);
      doc.text(`${obra.status_atual} — ${obra.percentual_conclusao}% concluído`, 14, y);
      y += 6;
      doc.text(`Estimativa de conclusão: ${formatarData(obra.estimativa_conclusao)}`, 14, y);
      y += 10;

      if (obra.exibir_custos) {
        doc.setFontSize(13);
        doc.text('Materiais e custos', 14, y);
        y += 6;
        doc.setFontSize(10);
        materiais.forEach((m) => {
          doc.text(
            `- ${m.nome} (${m.quantidade}x ${formatarMoeda(m.custo_unitario)}) = ${formatarMoeda(m.quantidade * m.custo_unitario)}`,
            14,
            y
          );
          y += 5;
        });
        y += 3;
        doc.setFontSize(11);
        doc.text(`Total: ${formatarMoeda(obra.custo_materiais)}`, 14, y);
        y += 10;
      }

      doc.setFontSize(13);
      doc.text('Linha do tempo', 14, y);
      y += 6;
      doc.setFontSize(10);
      historico.forEach((h) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${formatarDataHora(h.data_mudanca)} — ${h.status_novo}`, 14, y);
        y += 5;
      });

      if (obra.observacoes) {
        y += 8;
        doc.setFontSize(13);
        doc.text('Observações', 14, y);
        y += 6;
        doc.setFontSize(10);
        doc.text(doc.splitTextToSize(obra.observacoes, 180), 14, y);
      }

      doc.save(`${obra.titulo.replace(/\s+/g, '-').toLowerCase()}-relatorio.pdf`);
    } finally {
      setGerando(false);
    }
  }

  return (
    <button
      onClick={gerarPdf}
      disabled={gerando}
      className="border border-atelie-dourado/50 text-atelie-douradoClaro rounded-md px-4 py-2 text-sm font-medium hover:bg-atelie-dourado/10 transition-colors disabled:opacity-50"
    >
      {gerando ? 'Gerando PDF...' : 'Gerar relatório em PDF'}
    </button>
  );
}
