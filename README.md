# CozinhaOS — Gestão Industrial

Sistema de gestão industrial para cozinhas industriais. Divide-se em três camadas: MySQL, API Node.js e Frontend React.

---

## Requisitos

- Node.js 18+
- MySQL 8+
- NPM

---

## Como executar

### 1. Banco de dados

Abra o MySQL Workbench (ou terminal) e execute:

```
mysql -u root -p < database/schema.sql
```

Isso cria o banco `cozinhaos` com todas as tabelas e dados de exemplo.

### 2. Backend (API)

```
cd backend
npm install
npm run dev
```

A API será iniciada em `http://localhost:3001`.

> Se precisar alterar senha do MySQL, edite o arquivo `backend/.env`.

### 3. Frontend (React)

Em outro terminal:

```
cd frontend
npm install
npm run dev
```

O frontend será iniciado em `http://localhost:5173`.

> Pronto! Acesse `http://localhost:5173` no navegador.

---

## Parar a aplicação

Pressione `Ctrl + C` nos dois terminais (backend e frontend).
