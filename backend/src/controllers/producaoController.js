const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

exports.list = asyncHandler(async (req, res) => {
  let sql = `SELECT p.*, fl.nome AS filial_nome
             FROM producao p
             JOIN filiais fl ON fl.id = p.filial_id`;
  const params = [];

  if (req.query.q) {
    sql += ' WHERE p.prato ILIKE $1 OR fl.nome ILIKE $2';
    const q = `%${req.query.q}%`;
    params.push(q, q);
  }

  sql += ' ORDER BY p.data DESC, p.id DESC';
  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

exports.getById = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.*, fl.nome AS filial_nome
     FROM producao p
     JOIN filiais fl ON fl.id = p.filial_id
     WHERE p.id = $1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: true, message: 'Produção não encontrada' });
  res.json(rows[0]);
});

exports.create = asyncHandler(async (req, res) => {
  const { data, prato, porcoes, filial_id } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO producao (data, prato, porcoes, filial_id) VALUES ($1, $2, $3, $4) RETURNING id',
    [data, prato, porcoes, filial_id]
  );
  res.status(201).json({ id: rows[0].id, message: 'Produção registrada' });
});

exports.remove = asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM producao WHERE id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: true, message: 'Produção não encontrada' });
  res.json({ message: 'Produção removida' });
});
