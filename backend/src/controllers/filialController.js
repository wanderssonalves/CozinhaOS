const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

exports.list = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT f.*,
      (SELECT COUNT(*) FROM funcionarios WHERE filial_id = f.id) AS total_funcionarios
     FROM filiais f ORDER BY f.nome`
  );
  res.json(rows);
});

exports.getById = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT f.*,
      (SELECT COUNT(*) FROM funcionarios WHERE filial_id = f.id) AS total_funcionarios
     FROM filiais f WHERE f.id = $1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: true, message: 'Filial não encontrada' });
  res.json(rows[0]);
});

exports.create = asyncHandler(async (req, res) => {
  const { nome, cidade, endereco, responsavel } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO filiais (nome, cidade, endereco, responsavel) VALUES ($1, $2, $3, $4) RETURNING id',
    [nome, cidade, endereco || null, responsavel || null]
  );
  res.status(201).json({ id: rows[0].id, message: 'Filial cadastrada' });
});

exports.update = asyncHandler(async (req, res) => {
  const { nome, cidade, endereco, responsavel } = req.body;
  const { rowCount } = await pool.query(
    'UPDATE filiais SET nome = $1, cidade = $2, endereco = $3, responsavel = $4 WHERE id = $5',
    [nome, cidade, endereco || null, responsavel || null, req.params.id]
  );
  if (!rowCount) return res.status(404).json({ error: true, message: 'Filial não encontrada' });
  res.json({ message: 'Filial atualizada' });
});

exports.remove = asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM filiais WHERE id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: true, message: 'Filial não encontrada' });
  res.json({ message: 'Filial removida' });
});
