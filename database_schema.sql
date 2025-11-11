-- =====================================================
-- SCHEMA DO BANCO DE DADOS - SISTEMA HECA ALMOXARIFADO
-- =====================================================
-- Este arquivo contém a estrutura completa das tabelas
-- necessárias para o funcionamento do sistema
-- =====================================================

-- Criar banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS heca_almoxarifado 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE heca_almoxarifado;

-- =====================================================
-- TABELA: almoxarifados
-- =====================================================
CREATE TABLE IF NOT EXISTS almoxarifados (
    cod_almoxarifado INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    localizacao VARCHAR(200),
    responsavel VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nome (nome),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: fornecedores
-- =====================================================
CREATE TABLE IF NOT EXISTS fornecedores (
    cod_fornecedor INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    razao_social VARCHAR(200),
    cnpj VARCHAR(18) UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(100),
    endereco TEXT,
    contato VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nome (nome),
    INDEX idx_cnpj (cnpj),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: produtos
-- =====================================================
CREATE TABLE IF NOT EXISTS produtos (
    cod_produto INT PRIMARY KEY AUTO_INCREMENT,
    codigo_interno VARCHAR(50) UNIQUE,
    descricao VARCHAR(200) NOT NULL,
    unidade VARCHAR(10) DEFAULT 'UN',
    categoria VARCHAR(50),
    subcategoria VARCHAR(50),
    estoque_minimo DECIMAL(10,2) DEFAULT 0,
    estoque_maximo DECIMAL(10,2) DEFAULT 0,
    valor_medio DECIMAL(10,2) DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    observacao TEXT,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo_interno),
    INDEX idx_descricao (descricao),
    INDEX idx_categoria (categoria),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: estoque
-- =====================================================
CREATE TABLE IF NOT EXISTS estoque (
    cod_estoque INT PRIMARY KEY AUTO_INCREMENT,
    cod_produto INT NOT NULL,
    cod_almoxarifado INT NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantidade_reservada DECIMAL(10,2) DEFAULT 0,
    quantidade_disponivel DECIMAL(10,2) GENERATED ALWAYS AS (quantidade - quantidade_reservada) STORED,
    valor_unitario_medio DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * valor_unitario_medio) STORED,
    data_ultima_movimentacao DATETIME,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_produto_almoxarifado (cod_produto, cod_almoxarifado),
    FOREIGN KEY (cod_produto) REFERENCES produtos(cod_produto) ON DELETE RESTRICT,
    FOREIGN KEY (cod_almoxarifado) REFERENCES almoxarifados(cod_almoxarifado) ON DELETE RESTRICT,
    INDEX idx_produto (cod_produto),
    INDEX idx_almoxarifado (cod_almoxarifado),
    INDEX idx_quantidade (quantidade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: movimentacoes
-- =====================================================
CREATE TABLE IF NOT EXISTS movimentacoes (
    cod_movimentacao INT PRIMARY KEY AUTO_INCREMENT,
    tipo_movimentacao CHAR(1) NOT NULL COMMENT 'E=Entrada, S=Saída, T=Transferência',
    data_movimentacao DATE NOT NULL,
    cod_almoxarifado INT NOT NULL,
    cod_almoxarifado_destino INT NULL COMMENT 'Usado em transferências',
    
    -- Campos específicos de ENTRADA
    nf VARCHAR(50) COMMENT 'Nota Fiscal',
    of VARCHAR(50) COMMENT 'Ordem de Fornecimento',
    cod_fornecedor INT,
    
    -- Campos específicos de SAÍDA
    solicitante VARCHAR(100),
    autorizante VARCHAR(100),
    servico_associado VARCHAR(200),
    
    -- Campos comuns
    responsavel VARCHAR(100) NOT NULL,
    observacao TEXT,
    valor_total DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'CONCLUIDO' COMMENT 'CONCLUIDO, CANCELADO, PENDENTE',
    
    -- Auditoria
    usuario_cadastro VARCHAR(100),
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cod_almoxarifado) REFERENCES almoxarifados(cod_almoxarifado) ON DELETE RESTRICT,
    FOREIGN KEY (cod_almoxarifado_destino) REFERENCES almoxarifados(cod_almoxarifado) ON DELETE RESTRICT,
    FOREIGN KEY (cod_fornecedor) REFERENCES fornecedores(cod_fornecedor) ON DELETE RESTRICT,
    
    INDEX idx_tipo (tipo_movimentacao),
    INDEX idx_data (data_movimentacao),
    INDEX idx_almoxarifado (cod_almoxarifado),
    INDEX idx_fornecedor (cod_fornecedor),
    INDEX idx_status (status),
    INDEX idx_data_cadastro (data_cadastro),
    
    CHECK (tipo_movimentacao IN ('E', 'S', 'T')),
    CHECK (status IN ('CONCLUIDO', 'CANCELADO', 'PENDENTE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: movimentacoes_itens
-- =====================================================
CREATE TABLE IF NOT EXISTS movimentacoes_itens (
    cod_item INT PRIMARY KEY AUTO_INCREMENT,
    cod_movimentacao INT NOT NULL,
    cod_produto INT NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    valor_unitario DECIMAL(10,2) DEFAULT 0,
    valor_total DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
    
    -- Campos adicionais para SAÍDA
    observacao TEXT,
    origem_destino VARCHAR(200),
    local VARCHAR(200),
    responsavel_item VARCHAR(100),
    solic_autor VARCHAR(200),
    servico VARCHAR(200),
    
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cod_movimentacao) REFERENCES movimentacoes(cod_movimentacao) ON DELETE CASCADE,
    FOREIGN KEY (cod_produto) REFERENCES produtos(cod_produto) ON DELETE RESTRICT,
    
    INDEX idx_movimentacao (cod_movimentacao),
    INDEX idx_produto (cod_produto),
    
    CHECK (quantidade > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: usuarios (opcional - para controle de acesso)
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    cod_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nivel_acesso ENUM('ADMIN', 'GERENTE', 'OPERADOR', 'VISUALIZADOR') DEFAULT 'OPERADOR',
    ativo BOOLEAN DEFAULT TRUE,
    ultimo_acesso DATETIME,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: log_auditoria (opcional - para rastreamento)
-- =====================================================
CREATE TABLE IF NOT EXISTS log_auditoria (
    cod_log INT PRIMARY KEY AUTO_INCREMENT,
    tabela VARCHAR(50) NOT NULL,
    operacao ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    cod_registro INT,
    usuario VARCHAR(100),
    dados_anteriores JSON,
    dados_novos JSON,
    ip_address VARCHAR(45),
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tabela (tabela),
    INDEX idx_operacao (operacao),
    INDEX idx_data (data_hora),
    INDEX idx_usuario (usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Estoque com informações completas
CREATE OR REPLACE VIEW vw_estoque_completo AS
SELECT 
    e.cod_estoque,
    e.cod_produto,
    p.codigo_interno,
    p.descricao AS produto,
    p.unidade,
    p.categoria,
    e.cod_almoxarifado,
    a.nome AS almoxarifado,
    e.quantidade,
    e.quantidade_reservada,
    e.quantidade_disponivel,
    e.valor_unitario_medio,
    e.valor_total,
    p.estoque_minimo,
    p.estoque_maximo,
    CASE 
        WHEN e.quantidade <= p.estoque_minimo THEN 'CRÍTICO'
        WHEN e.quantidade <= (p.estoque_minimo * 1.5) THEN 'BAIXO'
        WHEN e.quantidade >= p.estoque_maximo THEN 'EXCESSO'
        ELSE 'NORMAL'
    END AS status_estoque,
    e.data_ultima_movimentacao,
    e.data_atualizacao
FROM estoque e
INNER JOIN produtos p ON e.cod_produto = p.cod_produto
INNER JOIN almoxarifados a ON e.cod_almoxarifado = a.cod_almoxarifado
WHERE p.ativo = TRUE AND a.ativo = TRUE;

-- View: Movimentações com detalhes
CREATE OR REPLACE VIEW vw_movimentacoes_completas AS
SELECT 
    m.cod_movimentacao,
    m.tipo_movimentacao,
    CASE m.tipo_movimentacao
        WHEN 'E' THEN 'Entrada'
        WHEN 'S' THEN 'Saída'
        WHEN 'T' THEN 'Transferência'
    END AS tipo_descricao,
    m.data_movimentacao,
    m.cod_almoxarifado,
    a.nome AS almoxarifado,
    m.nf,
    m.of,
    f.nome AS fornecedor,
    m.solicitante,
    m.autorizante,
    m.responsavel,
    m.servico_associado,
    m.observacao,
    m.valor_total,
    m.status,
    m.data_cadastro,
    COUNT(mi.cod_item) AS total_itens
FROM movimentacoes m
INNER JOIN almoxarifados a ON m.cod_almoxarifado = a.cod_almoxarifado
LEFT JOIN fornecedores f ON m.cod_fornecedor = f.cod_fornecedor
LEFT JOIN movimentacoes_itens mi ON m.cod_movimentacao = mi.cod_movimentacao
GROUP BY m.cod_movimentacao;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Atualizar estoque após inserção de item de movimentação
DELIMITER //

CREATE TRIGGER trg_after_insert_movimentacao_item
AFTER INSERT ON movimentacoes_itens
FOR EACH ROW
BEGIN
    DECLARE v_tipo_mov CHAR(1);
    DECLARE v_cod_almoxarifado INT;
    
    -- Buscar tipo de movimentação e almoxarifado
    SELECT tipo_movimentacao, cod_almoxarifado 
    INTO v_tipo_mov, v_cod_almoxarifado
    FROM movimentacoes 
    WHERE cod_movimentacao = NEW.cod_movimentacao;
    
    -- Atualizar estoque baseado no tipo
    IF v_tipo_mov = 'E' THEN
        -- ENTRADA: Adiciona ao estoque
        INSERT INTO estoque (cod_produto, cod_almoxarifado, quantidade, valor_unitario_medio, data_ultima_movimentacao)
        VALUES (NEW.cod_produto, v_cod_almoxarifado, NEW.quantidade, NEW.valor_unitario, NOW())
        ON DUPLICATE KEY UPDATE 
            quantidade = quantidade + NEW.quantidade,
            valor_unitario_medio = ((quantidade * valor_unitario_medio) + (NEW.quantidade * NEW.valor_unitario)) / (quantidade + NEW.quantidade),
            data_ultima_movimentacao = NOW();
            
    ELSEIF v_tipo_mov = 'S' THEN
        -- SAÍDA: Subtrai do estoque
        UPDATE estoque 
        SET quantidade = quantidade - NEW.quantidade,
            data_ultima_movimentacao = NOW()
        WHERE cod_produto = NEW.cod_produto 
        AND cod_almoxarifado = v_cod_almoxarifado;
    END IF;
END//

DELIMITER ;

-- =====================================================
-- DADOS INICIAIS (EXEMPLOS)
-- =====================================================

-- Inserir almoxarifados de exemplo
INSERT INTO almoxarifados (nome, descricao, localizacao, responsavel) VALUES
('Almoxarifado Central', 'Almoxarifado principal da empresa', 'Galpão A - Setor 1', 'João Silva'),
('Almoxarifado Obra 01', 'Almoxarifado da Obra Residencial', 'Rua das Flores, 123', 'Maria Santos'),
('Almoxarifado Ferramentas', 'Almoxarifado de ferramentas e equipamentos', 'Galpão B - Setor 2', 'Pedro Costa');

-- Inserir fornecedores de exemplo
INSERT INTO fornecedores (nome, razao_social, cnpj, telefone, email) VALUES
('Fornecedor ABC Ltda', 'ABC Materiais de Construção Ltda', '12.345.678/0001-99', '(11) 3456-7890', 'contato@abc.com.br'),
('Distribuidora XYZ', 'XYZ Distribuidora de Materiais S.A.', '98.765.432/0001-11', '(11) 9876-5432', 'vendas@xyz.com.br');

-- Inserir produtos de exemplo
INSERT INTO produtos (codigo_interno, descricao, unidade, categoria, estoque_minimo, estoque_maximo) VALUES
('001.001', 'Cimento CP-II 50kg', 'SC', 'Materiais Básicos', 100, 500),
('001.002', 'Areia Média m³', 'M3', 'Materiais Básicos', 50, 200),
('002.001', 'Tijolo Cerâmico 6 furos', 'UN', 'Alvenaria', 1000, 5000),
('003.001', 'Vergalhão 10mm CA-50', 'KG', 'Ferragens', 500, 2000),
('004.001', 'Tinta Acrílica Branca 18L', 'LT', 'Acabamento', 20, 100);

-- Inserir usuário admin padrão (senha: admin123 - ALTERAR EM PRODUÇÃO!)
INSERT INTO usuarios (nome, email, senha, nivel_acesso) VALUES
('Administrador', 'admin@heca.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN');

-- =====================================================
-- PROCEDURES ÚTEIS
-- =====================================================

-- Procedure: Consultar estoque de um produto
DELIMITER //

CREATE PROCEDURE sp_consultar_estoque(
    IN p_cod_produto INT,
    IN p_cod_almoxarifado INT
)
BEGIN
    SELECT 
        p.codigo_interno,
        p.descricao,
        p.unidade,
        e.quantidade,
        e.quantidade_reservada,
        e.quantidade_disponivel,
        e.valor_unitario_medio,
        e.valor_total,
        e.data_ultima_movimentacao
    FROM estoque e
    INNER JOIN produtos p ON e.cod_produto = p.cod_produto
    WHERE e.cod_produto = p_cod_produto
    AND e.cod_almoxarifado = p_cod_almoxarifado;
END//

-- Procedure: Relatório de movimentações por período
CREATE PROCEDURE sp_relatorio_movimentacoes(
    IN p_data_inicio DATE,
    IN p_data_fim DATE,
    IN p_tipo_movimentacao CHAR(1)
)
BEGIN
    SELECT 
        m.cod_movimentacao,
        m.tipo_movimentacao,
        m.data_movimentacao,
        a.nome AS almoxarifado,
        m.responsavel,
        m.valor_total,
        COUNT(mi.cod_item) AS total_itens
    FROM movimentacoes m
    INNER JOIN almoxarifados a ON m.cod_almoxarifado = a.cod_almoxarifado
    LEFT JOIN movimentacoes_itens mi ON m.cod_movimentacao = mi.cod_movimentacao
    WHERE m.data_movimentacao BETWEEN p_data_inicio AND p_data_fim
    AND (p_tipo_movimentacao IS NULL OR m.tipo_movimentacao = p_tipo_movimentacao)
    GROUP BY m.cod_movimentacao
    ORDER BY m.data_movimentacao DESC;
END//

DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índices compostos para consultas frequentes
CREATE INDEX idx_estoque_produto_almox ON estoque(cod_produto, cod_almoxarifado);
CREATE INDEX idx_mov_data_tipo ON movimentacoes(data_movimentacao, tipo_movimentacao);
CREATE INDEX idx_mov_itens_mov_prod ON movimentacoes_itens(cod_movimentacao, cod_produto);

-- =====================================================
-- GRANTS (PERMISSÕES) - AJUSTAR CONFORME NECESSÁRIO
-- =====================================================

-- Criar usuário para a aplicação (ALTERAR SENHA EM PRODUÇÃO!)
-- CREATE USER 'heca_app'@'localhost' IDENTIFIED BY 'senha_segura_aqui';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON heca_almoxarifado.* TO 'heca_app'@'localhost';
-- FLUSH PRIVILEGES;

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================

-- Verificar criação das tabelas
SHOW TABLES;

-- Verificar estrutura das principais tabelas
DESCRIBE movimentacoes;
DESCRIBE movimentacoes_itens;
DESCRIBE estoque;
DESCRIBE produtos;
