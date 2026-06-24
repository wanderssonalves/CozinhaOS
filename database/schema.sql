-- ============================================================
-- CozinhaOS — Gestão Industrial
-- Script DDL Completo para MySQL 8+
-- ============================================================

CREATE DATABASE IF NOT EXISTS cozinhaos
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE cozinhaos;

-- ============================================================
-- 1. FILIAIS
-- ============================================================
CREATE TABLE filiais (
  id          INT           NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(120)  NOT NULL,
  cidade      VARCHAR(80)   NOT NULL,
  endereco    VARCHAR(255)  DEFAULT NULL,
  responsavel VARCHAR(120)  DEFAULT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ============================================================
-- 2. FUNCIONÁRIOS
-- ============================================================
CREATE TABLE funcionarios (
  id          INT           NOT NULL AUTO_INCREMENT,
  nome        VARCHAR(150)  NOT NULL,
  cargo       VARCHAR(80)   NOT NULL,
  filial_id   INT           NOT NULL,
  salario     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  admissao    DATE          NOT NULL,
  status      ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_funcionarios_filial
    FOREIGN KEY (filial_id) REFERENCES filiais (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_funcionarios_filial ON funcionarios (filial_id);
CREATE INDEX idx_funcionarios_status ON funcionarios (status);

-- ============================================================
-- 3. TRANSAÇÕES (Financeiro)
-- ============================================================
CREATE TABLE transacoes (
  id          INT           NOT NULL AUTO_INCREMENT,
  tipo        ENUM('ganho','gasto') NOT NULL,
  descricao   VARCHAR(255)  NOT NULL,
  categoria   VARCHAR(80)   NOT NULL,
  valor       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  data        DATE          NOT NULL,
  filial_id   INT           DEFAULT NULL COMMENT 'NULL = Todas as Filiais (global)',
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_transacoes_filial
    FOREIGN KEY (filial_id) REFERENCES filiais (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_transacoes_data    ON transacoes (data);
CREATE INDEX idx_transacoes_tipo    ON transacoes (tipo);
CREATE INDEX idx_transacoes_filial  ON transacoes (filial_id);

-- ============================================================
-- 4. PRODUÇÃO DIÁRIA
-- ============================================================
CREATE TABLE producao (
  id          INT           NOT NULL AUTO_INCREMENT,
  data        DATE          NOT NULL,
  prato       VARCHAR(150)  NOT NULL,
  porcoes     INT           NOT NULL DEFAULT 0,
  filial_id   INT           NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_producao_filial
    FOREIGN KEY (filial_id) REFERENCES filiais (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_producao_data    ON producao (data);
CREATE INDEX idx_producao_filial  ON producao (filial_id);

-- ============================================================
-- SEED (dados iniciais para desenvolvimento/testes)
-- ============================================================
INSERT INTO filiais (id, nome, cidade, endereco, responsavel) VALUES
  (1, 'Matriz — Recife',  'Recife',  'Av. Boa Viagem, 1200, Boa Viagem', 'Carlos Lima'),
  (2, 'Unidade Olinda',   'Olinda',  'R. do Amparo, 320, Centro',         'Fernanda Reis'),
  (3, 'Unidade Caruaru',  'Caruaru', 'Av. Rio Branco, 450, Centro',       'Lúcia Ferreira');

INSERT INTO funcionarios (id, nome, cargo, filial_id, salario, admissao, status) VALUES
  (1, 'João Silva',     'Cozinheiro',           1, 2000.00, '2021-03-15', 'ativo'),
  (2, 'Ana Souza',      'Nutricionista',        2, 3500.00, '2020-07-01', 'ativo'),
  (3, 'Pedro Melo',     'Auxiliar de Cozinha',  1, 1400.00, '2022-11-10', 'ativo'),
  (4, 'Lúcia Ferreira', 'Gerente',              3, 4200.00, '2019-01-20', 'ativo'),
  (5, 'Marcos Vidal',   'Cozinheiro',           3, 2100.00, '2023-04-05', 'inativo'),
  (6, 'Roberta Neves',  'Atendente',            1, 1600.00, '2022-08-18', 'ativo'),
  (7, 'Felipe Costa',   'Entregador',           2, 1500.00, '2023-02-14', 'ativo');

INSERT INTO transacoes (id, tipo, descricao, categoria, valor, data, filial_id) VALUES
  (1,  'ganho', 'Contrato Empresa ABC',       'Contrato Empresarial', 12000.00, '2025-03-05', 1),
  (2,  'ganho', 'Contrato Empresa XYZ',       'Contrato Empresarial',  8500.00, '2025-03-08', 2),
  (3,  'gasto', 'Compra de alimentos',        'Alimentos / Insumos',   4200.00, '2025-03-02', 1),
  (4,  'gasto', 'Conta de energia',           'Energia Elétrica',      1800.00, '2025-03-10', 1),
  (5,  'ganho', 'Evento Corporativo',         'Evento',                6000.00, '2025-03-15', 3),
  (6,  'gasto', 'Salários março',             'Folha de Pagamento',   18500.00, '2025-03-31', NULL),
  (7,  'gasto', 'Manutenção equipamentos',    'Manutenção',             900.00, '2025-03-18', 2),
  (8,  'ganho', 'Contrato Escola Municipal',  'Contrato Empresarial',  5000.00, '2025-03-20', 1),
  (9,  'gasto', 'Aluguel março',              'Aluguel',               3500.00, '2025-03-01', NULL),
  (10, 'ganho', 'Marmitas avulsas',           'Venda Direta',          2200.00, '2025-03-25', 1);

INSERT INTO producao (id, data, prato, porcoes, filial_id) VALUES
  (1, '2025-03-12', 'Arroz + Frango Grelhado', 320, 1),
  (2, '2025-03-12', 'Feijoada Completa',       140, 1),
  (3, '2025-03-13', 'Arroz + Peixe Grelhado', 200, 2),
  (4, '2025-03-13', 'Macarrão à Bolonhesa',     90, 3),
  (5, '2025-03-14', 'Frango Assado + Legumes', 280, 1),
  (6, '2025-03-15', 'Carne de Sol + Pirão',    180, 2),
  (7, '2025-03-18', 'Arroz + Bife Acebolado',  310, 1);
