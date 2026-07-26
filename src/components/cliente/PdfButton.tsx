'use client';

import { useState } from 'react';
import { Obra, Material, HistoricoStatus } from '@/lib/types';
import { formatarData, formatarMoeda, formatarDataHora } from '@/lib/utils';

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
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      let y = 20;

      // Capa
      doc.setFillColor(14, 13, 12);
      doc.rect(0, 0, pageW, pageH, 'F');

      doc.setTextColor(198, 161, 91);
      doc.setFontSize(14);
      doc.text('Ateliê', pageW / 2, pageH / 2 - 30, { align: 'center' });

      doc.setTextColor(237, 231, 220);
      doc.setFontSize(28);
      doc.text(obra.titulo, pageW / 2, pageH / 2 + 10, { align: 'center' });

      doc.setTextColor(154, 144, 134);
      doc.setFontSize(12);
      doc.text(`Cliente: ${obra.cliente_nome}`, pageW / 2, pageH / 2 + 30, { align: 'center' });
      doc.text(`Gerado em ${formatarData(new Date().toISOString())}`, pageW / 2, pageH / 2 + 44, { align: 'center' });

      // Conteúdo
      doc.addPage();
      y = 20;

      doc.setTextColor(237, 231, 220);
      doc.setFontSize(22);
      doc.text(obra.titulo, 14, y);
      y += 10;
      doc.setFontSize(11);
      doc.setTextColor(154, 144, 134);
      doc.text(`Cliente: ${obra.cliente_nome}`, 14, y);
      if (obra.cliente_email) {
        y += 6;
        doc.text(`E-mail: ${obra.cliente_email}`, 14, y);
      }
      y += 14;

      // Status
      doc.setDrawColor(51, 46, 36);
      doc.line(14, y, pageW - 14, y);
      y += 8;
      doc.setTextColor(237, 231, 220);
      doc.setFontSize(14);
      doc.text('Status atual', 14, y);
      y += 8;
      doc.setFontSize(11);
      doc.setTextColor(224, 194, 126);
      doc.text(`${obra.status_atual} — ${obra.percentual_conclusao}% concluído`, 14, y);
      y += 6;
      doc.setTextColor(154, 144, 134);
      doc.text(`Previsão de conclusão: ${formatarData(obra.estimativa_conclusao)}`, 14, y);
      y += 14;

      // Descrição
      if (obra.descricao) {
        doc.setDrawColor(51, 46, 36);
        doc.line(14, y, pageW - 14, y);
        y += 8;
        doc.setTextColor(237, 231, 220);
        doc.setFontSize(14);
        doc.text('Descrição', 14, y);
        y += 8;
        doc.setFontSize(10);
        doc.setTextColor(154, 144, 134);
        const descLinhas = doc.splitTextToSize(obra.descricao, pageW - 28);
        doc.text(descLinhas, 14, y);
        y += descLinhas.length * 5 + 10;
      }

      // Materiais
      if (obra.exibir_custos && materiais.length > 0) {
        if (y > 200) { doc.addPage(); y = 20; }
        doc.setDrawColor(51, 46, 36);
        doc.line(14, y, pageW - 14, y);
        y += 8;
        doc.setTextColor(237, 231, 220);
        doc.setFontSize(14);
        doc.text('Materiais e custos', 14, y);
        y += 8;
        doc.setFontSize(10);
        doc.setTextColor(154, 144, 134);

        // Tabela simples
        materiais.forEach((m) => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(
            `${m.nome}`,
            14, y
          );
          doc.setTextColor(224, 194, 126);
          doc.text(
            `${formatarMoeda(m.quantidade * m.custo_unitario)}`,
            pageW - 14, y, { align: 'right' }
          );
          doc.setTextColor(154, 144, 134);
          doc.text(
            `${m.quantidade}x ${formatarMoeda(m.custo_unitario)}`,
            80, y
          );
          y += 6;
        });
        y += 4;
        doc.setDrawColor(51, 46, 36);
        doc.line(14, y, pageW - 14, y);
        y += 6;
        doc.setFontSize(11);
        doc.setTextColor(224, 194, 126);
        doc.text(`Total: ${formatarMoeda(obra.custo_materiais)}`, pageW - 14, y, { align: 'right' });
        y += 14;
      }

      // Timeline
      if (y > 210) { doc.addPage(); y = 20; }
      doc.setDrawColor(51, 46, 36);
      doc.line(14, y, pageW - 14, y);
      y += 8;
      doc.setTextColor(237, 231, 220);
      doc.setFontSize(14);
      doc.text('Linha do tempo', 14, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(154, 144, 134);

      historico.forEach((h) => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.setTextColor(224, 194, 126);
        doc.text(h.status_novo, 14, y);
        doc.setTextColor(154, 144, 134);
        doc.text(formatarDataHora(h.data_mudanca), pageW - 14, y, { align: 'right' });
        y += 5;
        if (h.observacao) {
          doc.text(h.observacao, 18, y);
          y += 5;
        }
      });

      // Observações
      if (obra.observacoes) {
        y += 8;
        if (y > 220) { doc.addPage(); y = 20; }
        doc.setDrawColor(51, 46, 36);
        doc.line(14, y, pageW - 14, y);
        y += 8;
        doc.setTextColor(237, 231, 220);
        doc.setFontSize(14);
        doc.text('Observações do artista', 14, y);
        y += 8;
        doc.setFontSize(10);
        doc.setTextColor(154, 144, 134);
        const obsLinhas = doc.splitTextToSize(obra.observacoes, pageW - 28);
        doc.text(obsLinhas, 14, y);
      }

      // Rodapé
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(51, 46, 36);
        doc.text(`Ateliê • ${obra.titulo} • Página ${i} de ${totalPages}`, pageW / 2, pageH - 10, { align: 'center' });
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
      className="btn-outline px-5 py-2.5 text-sm"
    >
      {gerando ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Gerando...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Gerar relatório em PDF
        </span>
      )}
    </button>
  );
}
