const pool = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

exports.list = asyncHandler(async (req, res) => {
  let sql = `SELECT f.*, fl.nome AS filial_nome
             FROM funcionarios f
             JOIN filiais fl ON fl.id = f.filial_id`;
  const params = [];

  if (req.query.q) {
    sql += ' WHERE f.nome ILIKE $1 OR f.cargo ILIKE $2';
    const q = `%${req.query.q}%`;
    params.push(q, q);
  }

  sql += ' ORDER BY f.nome';
  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

exports.getById = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT f.*, fl.nome AS filial_nome
     FROM funcionarios f
     JOIN filiais fl ON fl.id = f.filial_id
     WHERE f.id = $1`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: true, message: 'Funcionário não encontrado' });
  res.json(rows[0]);
});

exports.create = asyncHandler(async (req, res) => {
  const { nome, cargo, filial_id, salario, admissao, status } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO funcionarios (nome, cargo, filial_id, salario, admissao, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [nome, cargo, filial_id, salario, admissao, status || 'ativo']
  );
  res.status(201).json({ id: rows[0].id, message: 'Funcionário cadastrado' });
});

exports.update = asyncHandler(async (req, res) => {
  const { nome, cargo, filial_id, salario, admissao, status } = req.body;
  const { rowCount } = await pool.query(
    'UPDATE funcionarios SET nome = $1, cargo = $2, filial_id = $3, salario = $4, admissao = $5, status = $6 WHERE id = $7',
    [nome, cargo, filial_id, salario, admissao, status, req.params.id]
  );
  if (!rowCount) return res.status(404).json({ error: true, message: 'Funcionário não encontrado' });
  res.json({ message: 'Funcionário atualizado' });
});

exports.remove = asyncHandler(async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM funcionarios WHERE id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: true, message: 'Funcionário não encontrado' });
  res.json({ message: 'Funcionário removido' });
});
