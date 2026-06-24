const R = v => 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const N = v => Number(v).toLocaleString('pt-BR');
const DT = d => {
  if (!d) return '—';
  const p = d instanceof Date ? d.toISOString().split('T')[0].split('-') : d.split('-');
  return `${p[2]}/${p[1]}/${p[0]}`;
};

module.exports = { R, N, DT };
