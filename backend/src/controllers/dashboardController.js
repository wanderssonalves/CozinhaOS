const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

exports.stats = asyncHandler(async (req, res) => {
  const hoje = new Date().toISOString().split('T')[0];
  const mesAtual = hoje.slice(0, 7); // YYYY-MM

  const [[ganhosMes]] = await pool.query(
    `SELECT COALESCE(SUM(valor), 0) AS total FROM transacoes
     WHERE tipo = 'ganho' AND DATE_FORMAT(data, '%Y-%m') = ?`,
    [mesAtual]
  );

  const [[gastosMes]] = await pool.query(
    `SELECT COALESCE(SUM(valor), 0) AS total FROM transacoes
     WHERE tipo = 'gasto' AND DATE_FORMAT(data, '%Y-%m') = ?`,
    [mesAtual]
  );

  const [[funcsAtivos]] = await pool.query(
    "SELECT COUNT(*) AS total FROM funcionarios WHERE status = 'ativo'"
  );

  const [[filiaisCount]] = await pool.query(
    'SELECT COUNT(*) AS total FROM filiais'
  );

  const [[porcoesHoje]] = await pool.query(
    'SELECT COALESCE(SUM(porcoes), 0) AS total FROM producao WHERE data = ?',
    [hoje]
  );

  const [producaoHoje] = await pool.query(
    `SELECT p.*, fl.nome AS filial_nome
     FROM producao p
     JOIN filiais fl ON fl.id = p.filial_id
     WHERE p.data = ?
     ORDER BY p.porcoes DESC`,
    [hoje]
  );

  const [recentes] = await pool.query(
    `SELECT t.*, fl.nome AS filial_nome
     FROM transacoes t
     LEFT JOIN filiais fl ON fl.id = t.filial_id
     ORDER BY t.data DESC, t.id DESC
     LIMIT 5`
  );

  const [mensal] = await pool.query(
    `SELECT
       DATE_FORMAT(data, '%Y-%m') AS mes_ano,
       SUM(CASE WHEN tipo = 'ganho' THEN valor ELSE 0 END) AS ganhos,
       SUM(CASE WHEN tipo = 'gasto' THEN valor ELSE 0 END) AS gastos
     FROM transacoes
     GROUP BY mes_ano
     ORDER BY mes_ano
     LIMIT 12`
  );

  const ganhoGeral = ganhosMes.total;
  const gastoGeral = gastosMes.total;
  const lucro = ganhoGeral - gastoGeral;

  res.json({
    kpis: {
      ganhos: ganhoGeral,
      gastos: gastoGeral,
      lucro,
      funcionarios: funcsAtivos.total,
      filiais: filiaisCount.total,
      porcoes_hoje: porcoesHoje.total,
    },
    mensal,
    producao_hoje: producaoHoje,
    transacoes_recentes: recentes,
  });
});
