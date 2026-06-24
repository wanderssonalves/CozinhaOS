const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

exports.list = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT f.*,
      (SELECT COUNT(*) FROM funcionarios WHERE filial_id = f.id) AS total_funcionarios
     FROM filiais f ORDER BY f.nome`
  );
  res.json(rows);
});

exports.getById = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT f.*,
      (SELECT COUNT(*) FROM funcionarios WHERE filial_id = f.id) AS total_funcionarios
     FROM filiais f WHERE f.id = ?`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: true, message: 'Filial não encontrada' });
  res.json(rows[0]);
});

exports.create = asyncHandler(async (req, res) => {
  const { nome, cidade, endereco, responsavel } = req.body;
  const [result] = await pool.query(
    'INSERT INTO filiais (nome, cidade, endereco, responsavel) VALUES (?, ?, ?, ?)',
    [nome, cidade, endereco || null, responsavel || null]
  );
  res.status(201).json({ id: result.insertId, message: 'Filial cadastrada' });
});

exports.update = asyncHandler(async (req, res) => {
  const { nome, cidade, endereco, responsavel } = req.body;
  const [result] = await pool.query(
    'UPDATE filiais SET nome = ?, cidade = ?, endereco = ?, responsavel = ? WHERE id = ?',
    [nome, cidade, endereco || null, responsavel || null, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ error: true, message: 'Filial não encontrada' });
  res.json({ message: 'Filial atualizada' });
});

exports.remove = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM filiais WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: true, message: 'Filial não encontrada' });
  res.json({ message: 'Filial removida' });
});
