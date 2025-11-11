<?php
/**
 * BACKEND PHP PARA SAÍDA DE MATERIAIS - HECA CONSTRUTORA
 * Arquivo: movimentacao_saida.php
 * 
 * IMPORTANTE: Este arquivo deve estar na pasta ../Banco/
 */

// Configurações de erro para debug (remover em produção)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers para permitir requisições
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Responder a requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar se é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido. Use POST.']);
    exit();
}

// Log de debug
error_log("=== INÍCIO DO PROCESSAMENTO DE SAÍDA ===");
error_log("POST recebido: " . print_r($_POST, true));

try {
    // Incluir arquivo de conexão com banco de dados
    // AJUSTE O CAMINHO CONFORME SUA ESTRUTURA
    require_once 'conexao.php'; // ou include 'config.php';
    
    // Se você não tem um arquivo de conexão, use este exemplo:
    /*
    $host = 'localhost';
    $dbname = 'heca_almoxarifado';
    $username = 'root';
    $password = '';
    
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        throw new Exception("Erro de conexão: " . $e->getMessage());
    }
    */
    
    // Validar campos obrigatórios
    $camposObrigatorios = [
        'data_saida' => 'Data da Saída',
        'cod_almoxarifado' => 'Almoxarifado',
        'solicitante' => 'Solicitante',
        'autorizante' => 'Autorizante',
        'responsavel' => 'Responsável',
        'itens' => 'Itens'
    ];
    
    foreach ($camposObrigatorios as $campo => $label) {
        if (!isset($_POST[$campo]) || empty(trim($_POST[$campo]))) {
            throw new Exception("Campo obrigatório não preenchido: $label");
        }
    }
    
    // Extrair dados do POST
    $data_saida = trim($_POST['data_saida']);
    $cod_almoxarifado = trim($_POST['cod_almoxarifado']);
    $solicitante = trim($_POST['solicitante']);
    $autorizante = trim($_POST['autorizante']);
    $responsavel = trim($_POST['responsavel']);
    $servico_associado = isset($_POST['servico_associado']) ? trim($_POST['servico_associado']) : '';
    $observacao = isset($_POST['observacao']) ? trim($_POST['observacao']) : '';
    $tipo_movimentacao = isset($_POST['tipo_movimentacao']) ? trim($_POST['tipo_movimentacao']) : 'S';
    
    // Decodificar itens JSON
    $itensJSON = $_POST['itens'];
    $itens = json_decode($itensJSON, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Erro ao decodificar JSON dos itens: " . json_last_error_msg());
    }
    
    if (empty($itens) || !is_array($itens)) {
        throw new Exception("Nenhum item foi enviado ou formato inválido.");
    }
    
    error_log("Itens decodificados: " . print_r($itens, true));
    
    // Iniciar transação
    $pdo->beginTransaction();
    
    // 1. Inserir na tabela de movimentações (ajuste o nome da tabela conforme seu banco)
    $sqlMovimentacao = "INSERT INTO movimentacoes 
        (tipo_movimentacao, data_movimentacao, cod_almoxarifado, solicitante, autorizante, 
         responsavel, servico_associado, observacao, data_registro) 
        VALUES 
        (:tipo, :data_saida, :cod_almoxarifado, :solicitante, :autorizante, 
         :responsavel, :servico_associado, :observacao, NOW())";
    
    $stmtMovimentacao = $pdo->prepare($sqlMovimentacao);
    $stmtMovimentacao->execute([
        ':tipo' => $tipo_movimentacao,
        ':data_saida' => $data_saida,
        ':cod_almoxarifado' => $cod_almoxarifado,
        ':solicitante' => $solicitante,
        ':autorizante' => $autorizante,
        ':responsavel' => $responsavel,
        ':servico_associado' => $servico_associado,
        ':observacao' => $observacao
    ]);
    
    $cod_movimentacao = $pdo->lastInsertId();
    error_log("Movimentação inserida com ID: $cod_movimentacao");
    
    // 2. Inserir itens da saída (ajuste o nome da tabela conforme seu banco)
    $sqlItem = "INSERT INTO movimentacoes_itens 
        (cod_movimentacao, cod_produto, quantidade, valor_unitario, observacao, 
         origem_destino, local, responsavel_item, solic_autor, servico) 
        VALUES 
        (:cod_movimentacao, :cod_produto, :quantidade, :valor_unitario, :observacao,
         :origem_destino, :local, :responsavel_item, :solic_autor, :servico)";
    
    $stmtItem = $pdo->prepare($sqlItem);
    
    foreach ($itens as $item) {
        // Validar item
        if (!isset($item['cod_produto']) || !isset($item['quantidade'])) {
            throw new Exception("Item inválido: faltam campos obrigatórios (cod_produto ou quantidade)");
        }
        
        $stmtItem->execute([
            ':cod_movimentacao' => $cod_movimentacao,
            ':cod_produto' => $item['cod_produto'],
            ':quantidade' => $item['quantidade'],
            ':valor_unitario' => isset($item['valor_unitario']) ? $item['valor_unitario'] : 0,
            ':observacao' => isset($item['observacao']) ? $item['observacao'] : '',
            ':origem_destino' => isset($item['origem_destino']) ? $item['origem_destino'] : '',
            ':local' => isset($item['local']) ? $item['local'] : '',
            ':responsavel_item' => isset($item['responsavel']) ? $item['responsavel'] : '',
            ':solic_autor' => isset($item['solic_autor']) ? $item['solic_autor'] : '',
            ':servico' => isset($item['servico']) ? $item['servico'] : ''
        ]);
        
        error_log("Item inserido: " . $item['cod_produto'] . " - Qtd: " . $item['quantidade']);
        
        // 3. Atualizar estoque (IMPORTANTE: ajuste conforme sua lógica de estoque)
        // Esta é uma implementação básica - ajuste conforme necessário
        $sqlEstoque = "UPDATE estoque 
                       SET quantidade = quantidade - :quantidade,
                           data_ultima_movimentacao = NOW()
                       WHERE cod_produto = :cod_produto 
                       AND cod_almoxarifado = :cod_almoxarifado";
        
        $stmtEstoque = $pdo->prepare($sqlEstoque);
        $stmtEstoque->execute([
            ':quantidade' => $item['quantidade'],
            ':cod_produto' => $item['cod_produto'],
            ':cod_almoxarifado' => $cod_almoxarifado
        ]);
        
        // Verificar se o estoque ficou negativo (opcional)
        $sqlVerificar = "SELECT quantidade FROM estoque 
                         WHERE cod_produto = :cod_produto 
                         AND cod_almoxarifado = :cod_almoxarifado";
        $stmtVerificar = $pdo->prepare($sqlVerificar);
        $stmtVerificar->execute([
            ':cod_produto' => $item['cod_produto'],
            ':cod_almoxarifado' => $cod_almoxarifado
        ]);
        $estoqueAtual = $stmtVerificar->fetch();
        
        if ($estoqueAtual && $estoqueAtual['quantidade'] < 0) {
            error_log("AVISO: Estoque negativo para produto " . $item['cod_produto']);
            // Você pode optar por lançar uma exceção aqui se não permitir estoque negativo
            // throw new Exception("Estoque insuficiente para o produto " . $item['cod_produto']);
        }
    }
    
    // Commit da transação
    $pdo->commit();
    
    error_log("=== SAÍDA REGISTRADA COM SUCESSO ===");
    
    // Resposta de sucesso
    http_response_code(200);
    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Saída registrada com sucesso!',
        'cod_movimentacao' => $cod_movimentacao,
        'total_itens' => count($itens)
    ]);
    
} catch (Exception $e) {
    // Rollback em caso de erro
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("ERRO ao processar saída: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'sucesso' => false,
        'erro' => $e->getMessage(),
        'detalhes' => 'Verifique os logs do servidor para mais informações.'
    ]);
}

error_log("=== FIM DO PROCESSAMENTO ===");
?>
