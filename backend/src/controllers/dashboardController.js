const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

exports.stats = asyncHandler(async (req, res) => {
  const hoje = new Date().toISOString().split('T')[0];
  const mesAtual = hoje.slice(0, 7); // YYYY-MM

  const { rows: ganhosMes } = await pool.query(
    `SELECT COALESCE(SUM(valor), 0) AS total FROM transacoes
     WHERE tipo = 'ganho' AND TO_CHAR(data, 'YYYY-MM') = $1`,
    [mesAtual]
  );

  const { rows: gastosMes } = await pool.query(
    `SELECT COALESCE(SUM(valor), 0) AS total FROM transacoes
     WHERE tipo = 'gasto' AND TO_CHAR(data, 'YYYY-MM') = $1`,
    [mesAtual]
  );

  const { rows: funcsAtivos } = await pool.query(
    "SELECT COUNT(*)::int AS total FROM funcionarios WHERE status = 'ativo'"
  );

  const { rows: filiaisCount } = await pool.query(
    'SELECT COUNT(*)::int AS total FROM filiais'
  );

  const { rows: porcoesHoje } = await pool.query(
    'SELECT COALESCE(SUM(porcoes), 0)::int AS total FROM producao WHERE data = $1',
    [hoje]
  );

  const { rows: producaoHoje } = await pool.query(
    `SELECT p.*, fl.nome AS filial_nome
     FROM producao p
     JOIN filiais fl ON fl.id = p.filial_id
     WHERE p.data = $1
     ORDER BY p.porcoes DESC`,
    [hoje]
  );

  const { rows: recentes } = await pool.query(
    `SELECT t.*, fl.nome AS filial_nome
     FROM transacoes t
     LEFT JOIN filiais fl ON fl.id = t.filial_id
     ORDER BY t.data DESC, t.id DESC
     LIMIT 5`
  );

  const { rows: mensal } = await pool.query(
    `SELECT
       TO_CHAR(data, 'YYYY-MM') AS mes_ano,
       SUM(CASE WHEN tipo = 'ganho' THEN valor ELSE 0 END) AS ganhos,
       SUM(CASE WHEN tipo = 'gasto' THEN valor ELSE 0 END) AS gastos
     FROM transacoes
     GROUP BY mes_ano
     ORDER BY mes_ano
     LIMIT 12`
  );

  const ganhoGeral = ganhosMes[0]?.total || 0;
  const gastoGeral = gastosMes[0]?.total || 0;
  const lucro = ganhoGeral - gastoGeral;

  res.json({
    kpis: {
      ganhos: ganhoGeral,
      gastos: gastoGeral,
      lucro,
      funcionarios: funcsAtivos[0]?.total || 0,
      filiais: filiaisCount[0]?.total || 0,
      porcoes_hoje: porcoesHoje[0]?.total || 0,
    },
    mensal,
    producao_hoje: producaoHoje,
    transacoes_recentes: recentes,
  });
});
