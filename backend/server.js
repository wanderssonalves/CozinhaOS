require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'CozinhaOS API' });
});

app.use('/api/filiais',      require('./src/routes/filiais'));
app.use('/api/funcionarios', require('./src/routes/funcionarios'));
app.use('/api/transacoes',   require('./src/routes/transacoes'));
app.use('/api/producao',     require('./src/routes/producao'));
app.use('/api/dashboard',    require('./src/routes/dashboard'));

app.use(errorHandler);

// Só inicia o servidor se não estiver em ambiente serverless (Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🔥 CozinhaOS API rodando na porta ${PORT}`);
  });
}

module.exports = app;
