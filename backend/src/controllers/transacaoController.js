const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

exports.list = asyncHandler(async (req, res) => {
  let sql = `SELECT t.*, fl.nome AS filial_nome
             FROM transacoes t
             LEFT JOIN filiais fl ON fl.id = t.filial_id`;
  const params = [];

  if (req.query.q) {
    sql += ' WHERE t.descricao ILIKE $1 OR t.categoria ILIKE $2';
    const q = `%${req.query.q}%`;
    params.push(q, q);
  }

  sql += ' ORDER BY t.data DESC, t.id DESC';
  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

exports.getById = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT t.*, fl.nome AS filial_nome
     FROM transacoes t
     LEFT JOIN filiais fl ON fl.id = t.filial_id
     WHERE t.id = $1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: true, message: 'Transação não encontrada' });
  res.json(rows[0]);
});

exports.create = asyncHandler(async (req, res) => {
  const { tipo, descricao, categoria, valor, data, filial_id } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO transacoes (tipo, descricao, categoria, valor, data, filial_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [tipo, descricao, categoria, valor, data, filial_id || null]
  );
  res.status(201).json({ id: rows[0].id, message: 'Transação registrada' });
});

exports.remove = asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM transacoes WHERE id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: true, message: 'Transação não encontrada' });
  res.json({ message: 'Transação removida' });
});
