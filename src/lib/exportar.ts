import { Obra, Material, HistoricoStatus } from './types';
import { formatarData, formatarDataHora, formatarMoeda } from './utils';

export function exportarObrasExcel(obras: Obra[]) {
  import('xlsx').then((XLSX) => {
    const dados = obras.map((o) => ({
      Título: o.titulo,
      Cliente: o.cliente_nome,
      'E-mail': o.cliente_email ?? '',
      Status: o.status_atual,
      '% Conclusão': o.percentual_conclusao,
      Orçamento: o.orcamento_total,
      'Custo Materiais': o.custo_materiais,
      'Estimativa': o.estimativa_conclusao ?? '',
      Criada: formatarData(o.created_at),
    }));

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Obras');

    // Ajustar largura
    ws['!cols'] = Object.keys(dados[0] ?? {}).map(() => ({ wch: 25 }));

    XLSX.writeFile(wb, `atelie-obras-${new Date().toISOString().slice(0, 10)}.xlsx`);
  });
}

export function exportarMateriaisExcel(obraId: string, materiais: Material[], nomeObra: string) {
  import('xlsx').then((XLSX) => {
    const total = materiais.reduce((s, m) => s + m.quantidade * m.custo_unitario, 0);

    const dados = materiais.map((m) => ({
      Nome: m.nome,
      Quantidade: m.quantidade,
      'Custo Unitário': m.custo_unitario,
      Subtotal: m.quantidade * m.custo_unitario,
      Fornecedor: m.fornecedor ?? '',
    }));

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Materiais');

    // Linha de total
    XLSX.utils.sheet_add_aoa(ws, [['', '', '', `Total: ${total.toFixed(2)}`]], { origin: -1 });

    ws['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];

    XLSX.writeFile(wb, `atelie-${nomeObra.replace(/\s+/g, '-')}-materiais.xlsx`);
  });
}
