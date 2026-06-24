import * as XLSX from 'xlsx';

export function exportRelatorio(trans, funcs, filiais) {
  const wb = XLSX.utils.book_new();

  const cats = {};
  trans.filter(t => t.tipo === 'gasto').forEach(t => { cats[t.categoria] = (cats[t.categoria] || 0) + Number(t.valor || 0); });
  const sortC = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const sheet1 = XLSX.utils.json_to_sheet(sortC.map(([c, v]) => ({ Categoria: c, Total: v })));
  XLSX.utils.book_append_sheet(wb, sheet1, 'Gastos por Categoria');

  const filG = filiais.map(f => ({
    Filial: f.nome,
    Faturamento: trans.filter(t => t.tipo === 'ganho' && t.filial_id === f.id).reduce((a, t) => a + Number(t.valor || 0), 0),
  })).sort((a, b) => b.Faturamento - a.Faturamento);
  const sheet2 = XLSX.utils.json_to_sheet(filG);
  XLSX.utils.book_append_sheet(wb, sheet2, 'Ranking de Filiais');

  const ativos = funcs.filter(f => f.status === 'ativo');
  const folha = ativos.reduce((a, f) => a + Number(f.salario || 0), 0);
  const ganhoT = trans.filter(t => t.tipo === 'ganho').reduce((a, t) => a + Number(t.valor || 0), 0);
  const sheet3 = XLSX.utils.json_to_sheet([
    { Indicador: 'Folha Mensal Total', Valor: folha },
    { Indicador: '% do Faturamento', Valor: ganhoT > 0 ? parseFloat(((folha / ganhoT) * 100).toFixed(1)) : 0 },
    { Indicador: 'Funcionários Ativos', Valor: ativos.length },
  ]);
  XLSX.utils.book_append_sheet(wb, sheet3, 'Custo com Pessoal');

  const sheet4 = XLSX.utils.json_to_sheet(trans.map(t => ({
    Descricao: t.descricao,
    Tipo: t.tipo === 'ganho' ? 'Ganho' : 'Gasto',
    Categoria: t.categoria,
    Valor: t.valor,
    Data: t.data,
    Filial: t.filial_nome || 'Todas as Filiais',
  })));
  XLSX.utils.book_append_sheet(wb, sheet4, 'Transacoes');

  const sheet5 = XLSX.utils.json_to_sheet(funcs.map(f => ({
    Nome: f.nome,
    Cargo: f.cargo,
    Filial: f.filial_nome,
    Salario: f.salario,
    Admissao: f.admissao,
    Status: f.status === 'ativo' ? 'Ativo' : 'Inativo',
  })));
  XLSX.utils.book_append_sheet(wb, sheet5, 'Funcionarios');

  XLSX.writeFile(wb, `relatorio_cozinhaos_${new Date().toISOString().split('T')[0]}.xlsx`);
}
