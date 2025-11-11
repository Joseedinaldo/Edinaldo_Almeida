<?php
/**
 * ARQUIVO DE CONEXÃO COM BANCO DE DADOS
 * Sistema de Almoxarifado HECA
 * 
 * Este arquivo deve estar na pasta ../Banco/
 */

// Configurações do banco de dados
define('DB_HOST', 'localhost');
define('DB_NAME', 'heca_almoxarifado');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Configurações de erro (DESABILITAR EM PRODUÇÃO)
define('DEBUG_MODE', true);

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/logs/php_errors.log');
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Timezone
date_default_timezone_set('America/Sao_Paulo');

try {
    // Criar conexão PDO
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
    ];
    
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    
    // Log de sucesso (apenas em debug)
    if (DEBUG_MODE) {
        error_log("Conexão com banco de dados estabelecida com sucesso.");
    }
    
} catch (PDOException $e) {
    // Log do erro
    error_log("ERRO DE CONEXÃO COM BANCO DE DADOS: " . $e->getMessage());
    
    // Resposta para o cliente
    if (DEBUG_MODE) {
        die(json_encode([
            'erro' => 'Erro de conexão com banco de dados',
            'detalhes' => $e->getMessage(),
            'codigo' => $e->getCode()
        ]));
    } else {
        die(json_encode([
            'erro' => 'Erro de conexão com banco de dados. Contate o administrador.'
        ]));
    }
}

/**
 * Função auxiliar para executar queries com prepared statements
 * 
 * @param PDO $pdo Conexão PDO
 * @param string $sql Query SQL
 * @param array $params Parâmetros para bind
 * @return PDOStatement
 */
function executarQuery($pdo, $sql, $params = []) {
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    } catch (PDOException $e) {
        error_log("ERRO AO EXECUTAR QUERY: " . $e->getMessage());
        error_log("SQL: " . $sql);
        error_log("PARAMS: " . print_r($params, true));
        throw $e;
    }
}

/**
 * Função para sanitizar entrada de dados
 * 
 * @param mixed $data Dados a serem sanitizados
 * @return mixed Dados sanitizados
 */
function sanitizar($data) {
    if (is_array($data)) {
        return array_map('sanitizar', $data);
    }
    
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    
    return $data;
}

/**
 * Função para validar CNPJ
 * 
 * @param string $cnpj CNPJ a ser validado
 * @return bool
 */
function validarCNPJ($cnpj) {
    $cnpj = preg_replace('/[^0-9]/', '', $cnpj);
    
    if (strlen($cnpj) != 14) {
        return false;
    }
    
    // Validação básica (pode ser expandida)
    if (preg_match('/(\d)\1{13}/', $cnpj)) {
        return false;
    }
    
    return true;
}

/**
 * Função para formatar valor monetário
 * 
 * @param float $valor Valor a ser formatado
 * @return string Valor formatado
 */
function formatarMoeda($valor) {
    return 'R$ ' . number_format($valor, 2, ',', '.');
}

/**
 * Função para converter data BR para SQL
 * 
 * @param string $data Data no formato DD/MM/YYYY
 * @return string Data no formato YYYY-MM-DD
 */
function dataBRparaSQL($data) {
    if (empty($data)) return null;
    
    $partes = explode('/', $data);
    if (count($partes) != 3) return null;
    
    return $partes[2] . '-' . $partes[1] . '-' . $partes[0];
}

/**
 * Função para converter data SQL para BR
 * 
 * @param string $data Data no formato YYYY-MM-DD
 * @return string Data no formato DD/MM/YYYY
 */
function dataSQLparaBR($data) {
    if (empty($data)) return '';
    
    $partes = explode('-', $data);
    if (count($partes) != 3) return '';
    
    return $partes[2] . '/' . $partes[1] . '/' . $partes[0];
}

/**
 * Função para registrar log de auditoria
 * 
 * @param PDO $pdo Conexão PDO
 * @param string $tabela Nome da tabela
 * @param string $operacao Tipo de operação (INSERT, UPDATE, DELETE)
 * @param int $cod_registro ID do registro
 * @param string $usuario Nome do usuário
 * @param array $dados_anteriores Dados antes da operação
 * @param array $dados_novos Dados após a operação
 */
function registrarAuditoria($pdo, $tabela, $operacao, $cod_registro, $usuario, $dados_anteriores = null, $dados_novos = null) {
    try {
        $sql = "INSERT INTO log_auditoria 
                (tabela, operacao, cod_registro, usuario, dados_anteriores, dados_novos, ip_address) 
                VALUES 
                (:tabela, :operacao, :cod_registro, :usuario, :dados_anteriores, :dados_novos, :ip_address)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':tabela' => $tabela,
            ':operacao' => $operacao,
            ':cod_registro' => $cod_registro,
            ':usuario' => $usuario,
            ':dados_anteriores' => $dados_anteriores ? json_encode($dados_anteriores) : null,
            ':dados_novos' => $dados_novos ? json_encode($dados_novos) : null,
            ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);
    } catch (PDOException $e) {
        error_log("ERRO AO REGISTRAR AUDITORIA: " . $e->getMessage());
    }
}

/**
 * Função para verificar se estoque é suficiente
 * 
 * @param PDO $pdo Conexão PDO
 * @param int $cod_produto Código do produto
 * @param int $cod_almoxarifado Código do almoxarifado
 * @param float $quantidade Quantidade necessária
 * @return bool
 */
function verificarEstoque($pdo, $cod_produto, $cod_almoxarifado, $quantidade) {
    try {
        $sql = "SELECT quantidade_disponivel 
                FROM estoque 
                WHERE cod_produto = :cod_produto 
                AND cod_almoxarifado = :cod_almoxarifado";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':cod_produto' => $cod_produto,
            ':cod_almoxarifado' => $cod_almoxarifado
        ]);
        
        $estoque = $stmt->fetch();
        
        if (!$estoque) {
            return false;
        }
        
        return $estoque['quantidade_disponivel'] >= $quantidade;
        
    } catch (PDOException $e) {
        error_log("ERRO AO VERIFICAR ESTOQUE: " . $e->getMessage());
        return false;
    }
}

/**
 * Função para obter informações do produto
 * 
 * @param PDO $pdo Conexão PDO
 * @param int $cod_produto Código do produto
 * @return array|null
 */
function obterProduto($pdo, $cod_produto) {
    try {
        $sql = "SELECT * FROM produtos WHERE cod_produto = :cod_produto AND ativo = TRUE";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':cod_produto' => $cod_produto]);
        return $stmt->fetch();
    } catch (PDOException $e) {
        error_log("ERRO AO OBTER PRODUTO: " . $e->getMessage());
        return null;
    }
}

/**
 * Função para responder com JSON
 * 
 * @param array $data Dados a serem retornados
 * @param int $status_code Código HTTP de status
 */
function responderJSON($data, $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Função para validar sessão de usuário (implementar conforme necessário)
 * 
 * @return array|null Dados do usuário ou null se não autenticado
 */
function validarSessao() {
    session_start();
    
    if (!isset($_SESSION['usuario_logado']) || $_SESSION['usuario_logado'] !== true) {
        return null;
    }
    
    return [
        'cod_usuario' => $_SESSION['cod_usuario'] ?? null,
        'nome' => $_SESSION['nome_usuario'] ?? 'Sistema',
        'email' => $_SESSION['email_usuario'] ?? '',
        'nivel_acesso' => $_SESSION['nivel_acesso'] ?? 'OPERADOR'
    ];
}

// Exportar conexão para uso global
$GLOBALS['pdo'] = $pdo;

?>
