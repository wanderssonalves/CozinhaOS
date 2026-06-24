-- ============================================================
-- CozinhaOS — Gestão Industrial
-- Script DDL para PostgreSQL 15+
-- ============================================================

-- ============================================================
-- 1. FILIAIS
-- ============================================================
CREATE TABLE filiais (
  id          SERIAL        NOT NULL,
  nome        VARCHAR(120)  NOT NULL,
  cidade      VARCHAR(80)   NOT NULL,
  endereco    VARCHAR(255)  DEFAULT NULL,
  responsavel VARCHAR(120)  DEFAULT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  PRIMARY KEY (id)
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_filiais_updated_at
  BEFORE UPDATE ON filiais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 2. FUNCIONÁRIOS
-- ============================================================
CREATE TABLE funcionarios (
  id          SERIAL         NOT NULL,
  nome        VARCHAR(150)   NOT NULL,
  cargo       VARCHAR(80)    NOT NULL,
  filial_id   INT            NOT NULL,
  salario     DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  admissao    DATE           NOT NULL,
  status      VARCHAR(10)    NOT NULL DEFAULT 'ativo'
                             CHECK (status IN ('ativo','inativo')),
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  PRIMARY KEY (id),
  CONSTRAINT fk_funcionarios_filial
    FOREIGN KEY (filial_id) REFERENCES filiais (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TRIGGER trg_funcionarios_updated_at
  BEFORE UPDATE ON funcionarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_funcionarios_filial ON funcionarios (filial_id);
CREATE INDEX idx_funcionarios_status ON funcionarios (status);

-- ============================================================
-- 3. TRANSAÇÕES (Financeiro)
-- ============================================================
CREATE TABLE transacoes (
  id          SERIAL         NOT NULL,
  tipo        VARCHAR(10)    NOT NULL
                             CHECK (tipo IN ('ganho','gasto')),
  descricao   VARCHAR(255)   NOT NULL,
  categoria   VARCHAR(80)    NOT NULL,
  valor       DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  data        DATE           NOT NULL,
  filial_id   INT            DEFAULT NULL,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  PRIMARY KEY (id),
  CONSTRAINT fk_transacoes_filial
    FOREIGN KEY (filial_id) REFERENCES filiais (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TRIGGER trg_transacoes_updated_at
  BEFORE UPDATE ON transacoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_transacoes_data    ON transacoes (data);
CREATE INDEX idx_transacoes_tipo    ON transacoes (tipo);
CREATE INDEX idx_transacoes_filial  ON transacoes (filial_id);

-- ============================================================
-- 4. PRODUÇÃO DIÁRIA
-- ============================================================
CREATE TABLE producao (
  id          SERIAL         NOT NULL,
  data        DATE           NOT NULL,
  prato       VARCHAR(150)   NOT NULL,
  porcoes     INT            NOT NULL DEFAULT 0,
  filial_id   INT            NOT NULL,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  PRIMARY KEY (id),
  CONSTRAINT fk_producao_filial
    FOREIGN KEY (filial_id) REFERENCES filiais (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TRIGGER trg_producao_updated_at
  BEFORE UPDATE ON producao
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_producao_data    ON producao (data);
CREATE INDEX idx_producao_filial  ON producao (filial_id);

-- ============================================================
-- SEED (dados iniciais)
-- ============================================================
INSERT INTO filiais (nome, cidade, endereco, responsavel) VALUES
  ('Matriz — Recife',  'Recife',  'Av. Boa Viagem, 1200, Boa Viagem', 'Carlos Lima'),
  ('Unidade Olinda',   'Olinda',  'R. do Amparo, 320, Centro',         'Fernanda Reis'),
  ('Unidade Caruaru',  'Caruaru', 'Av. Rio Branco, 450, Centro',       'Lúcia Ferreira');

INSERT INTO funcionarios (nome, cargo, filial_id, salario, admissao, status) VALUES
  ('João Silva',     'Cozinheiro',           1, 2000.00, '2021-03-15', 'ativo'),
  ('Ana Souza',      'Nutricionista',        2, 3500.00, '2020-07-01', 'ativo'),
  ('Pedro Melo',     'Auxiliar de Cozinha',  1, 1400.00, '2022-11-10', 'ativo'),
  ('Lúcia Ferreira', 'Gerente',              3, 4200.00, '2019-01-20', 'ativo'),
  ('Marcos Vidal',   'Cozinheiro',           3, 2100.00, '2023-04-05', 'inativo'),
  ('Roberta Neves',  'Atendente',            1, 1600.00, '2022-08-18', 'ativo'),
  ('Felipe Costa',   'Entregador',           2, 1500.00, '2023-02-14', 'ativo');

INSERT INTO transacoes (tipo, descricao, categoria, valor, data, filial_id) VALUES
  ('ganho', 'Contrato Empresa ABC',       'Contrato Empresarial', 12000.00, '2025-03-05', 1),
  ('ganho', 'Contrato Empresa XYZ',       'Contrato Empresarial',  8500.00, '2025-03-08', 2),
  ('gasto', 'Compra de alimentos',        'Alimentos / Insumos',   4200.00, '2025-03-02', 1),
  ('gasto', 'Conta de energia',           'Energia Elétrica',      1800.00, '2025-03-10', 1),
  ('ganho', 'Evento Corporativo',         'Evento',                6000.00, '2025-03-15', 3),
  ('gasto', 'Salários março',             'Folha de Pagamento',   18500.00, '2025-03-31', NULL),
  ('gasto', 'Manutenção equipamentos',    'Manutenção',             900.00, '2025-03-18', 2),
  ('ganho', 'Contrato Escola Municipal',  'Contrato Empresarial',  5000.00, '2025-03-20', 1),
  ('gasto', 'Aluguel março',              'Aluguel',               3500.00, '2025-03-01', NULL),
  ('ganho', 'Marmitas avulsas',           'Venda Direta',          2200.00, '2025-03-25', 1);

INSERT INTO producao (data, prato, porcoes, filial_id) VALUES
  ('2025-03-12', 'Arroz + Frango Grelhado', 320, 1),
  ('2025-03-12', 'Feijoada Completa',       140, 1),
  ('2025-03-13', 'Arroz + Peixe Grelhado', 200, 2),
  ('2025-03-13', 'Macarrão à Bolonhesa',     90, 3),
  ('2025-03-14', 'Frango Assado + Legumes', 280, 1),
  ('2025-03-15', 'Carne de Sol + Pirão',    180, 2),
  ('2025-03-18', 'Arroz + Bife Acebolado',  310, 1);
