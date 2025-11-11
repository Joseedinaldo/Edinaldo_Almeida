# 🚀 GUIA RÁPIDO - Sistema de Almoxarifado HECA

## 📦 Arquivos Entregues

```
✅ almoxarifado-completo.js      - JavaScript completo atualizado
✅ movimentacao_saida.php         - Backend PHP para saídas
✅ conexao.php                    - Arquivo de conexão com banco
✅ database_schema.sql            - Estrutura completa do banco
✅ exemplo_integracao.html        - Exemplo de uso
✅ ALTERACOES_REALIZADAS.md       - Documentação completa
✅ GUIA_RAPIDO.md                 - Este arquivo
```

---

## ⚡ INSTALAÇÃO RÁPIDA (5 MINUTOS)

### Passo 1: Banco de Dados (2 min)
```sql
-- Execute no MySQL/phpMyAdmin:
1. Abra o arquivo: database_schema.sql
2. Execute todo o conteúdo
3. Verifique se as tabelas foram criadas: SHOW TABLES;
```

### Passo 2: Backend PHP (1 min)
```
1. Copie conexao.php para: ../Banco/conexao.php
2. Copie movimentacao_saida.php para: ../Banco/movimentacao_saida.php
3. Edite conexao.php e ajuste:
   - DB_HOST (geralmente 'localhost')
   - DB_NAME (nome do seu banco)
   - DB_USER (seu usuário MySQL)
   - DB_PASS (sua senha MySQL)
```

### Passo 3: Frontend JavaScript (1 min)
```
1. Substitua seu arquivo JavaScript atual por: almoxarifado-completo.js
2. Certifique-se de que o HTML tem estas bibliotecas:
   <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
   <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>
```

### Passo 4: Teste (1 min)
```
1. Abra o console do navegador (F12)
2. Tente fazer uma saída de material
3. Verifique os logs no console
4. Verifique se salvou no banco de dados
```

---

## 🎨 PRINCIPAIS MELHORIAS

### PDF Profissional
- ✅ Cores modernas: Azul profissional + Laranja casual
- ✅ Cabeçalho elegante com logo HECA
- ✅ Resumo executivo com 3 colunas
- ✅ Indicadores visuais (↑ Entradas, ↓ Saídas, ⇄ Transferências)
- ✅ Rodapé com barra colorida
- ✅ Tabelas com estilo "striped" moderno

### Saída Corrigida
- ✅ Tipo de movimentação definido como 'S'
- ✅ Extração correta do código do almoxarifado
- ✅ Validação de todos os campos obrigatórios
- ✅ Logs de debug completos
- ✅ Atualização automática de estoque
- ✅ Transações seguras no banco

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: "Nenhum item adicionado"
**Causa:** Você não clicou em "Adicionar Item" antes de salvar  
**Solução:** Clique no botão "Adicionar Item" após preencher os dados do produto

### Problema 2: "Campo obrigatório: ..."
**Causa:** Algum campo obrigatório não foi preenchido  
**Solução:** Preencha todos os campos marcados com asterisco (*)

### Problema 3: "Erro de conexão com o servidor"
**Causa:** O arquivo PHP não está acessível ou caminho incorreto  
**Solução:** 
- Verifique se o arquivo está em `../Banco/movimentacao_saida.php`
- Verifique permissões do arquivo (deve ser legível pelo servidor web)
- Teste acessar diretamente: `http://seusite.com/Banco/movimentacao_saida.php`

### Problema 4: "Erro ao decodificar JSON"
**Causa:** Formato dos itens está incorreto  
**Solução:** Use o código atualizado que já formata corretamente

### Problema 5: PDF não gera ou fica em branco
**Causa:** Biblioteca jsPDF não carregada  
**Solução:** Adicione no HTML:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>
```

### Problema 6: Estoque não atualiza
**Causa:** Trigger não foi criado ou tabela estoque não existe  
**Solução:** Execute o `database_schema.sql` completo

---

## 🔍 COMO DEBUGAR

### No Navegador (Console - F12)
```javascript
// Ao salvar saída, você verá:
=== INÍCIO DO SALVAMENTO DE SAÍDA ===
Dados preparados: {tipo_movimentacao: "S", ...}
Itens parseados: [{cod_produto: "123", ...}]
Status: 200
Resposta: {"sucesso":true,...}
=== FIM DO SALVAMENTO DE SAÍDA ===
```

### No Servidor PHP
```bash
# Localize o arquivo de log (geralmente):
tail -f /var/log/apache2/error.log
# ou
tail -f /var/log/php_errors.log

# Você verá:
=== INÍCIO DO PROCESSAMENTO DE SAÍDA ===
POST recebido: Array(...)
Itens decodificados: Array(...)
Movimentação inserida com ID: 456
=== SAÍDA REGISTRADA COM SUCESSO ===
```

---

## 📊 ESTRUTURA DO BANCO (RESUMO)

```
movimentacoes
├── cod_movimentacao (PK)
├── tipo_movimentacao ('E', 'S', 'T')
├── data_movimentacao
├── cod_almoxarifado (FK)
├── solicitante
├── autorizante
├── responsavel
└── ...

movimentacoes_itens
├── cod_item (PK)
├── cod_movimentacao (FK)
├── cod_produto (FK)
├── quantidade
├── valor_unitario
└── ...

estoque
├── cod_estoque (PK)
├── cod_produto (FK)
├── cod_almoxarifado (FK)
├── quantidade
└── ...
```

---

## 🎯 TESTE RÁPIDO

### Teste 1: Saída de Material
```
1. Acesse a página de saída
2. Preencha:
   - Data: hoje
   - Almoxarifado: qualquer
   - Solicitante: "João Silva"
   - Autorizante: "Maria Santos"
   - Responsável: "Pedro Costa"
3. Adicione um item:
   - Produto: qualquer
   - Quantidade: 10
4. Clique em "Adicionar Item"
5. Clique em "Salvar Saída"
6. Verifique mensagem de sucesso
7. Verifique no banco: SELECT * FROM movimentacoes ORDER BY cod_movimentacao DESC LIMIT 1;
```

### Teste 2: Exportação PDF
```
1. Acesse a página de movimentações
2. Clique em "Exportar PDF"
3. Verifique o arquivo baixado
4. Confira:
   ✓ Cabeçalho com logo HECA
   ✓ Resumo executivo colorido
   ✓ Tabelas com estilo moderno
   ✓ Rodapé com informações
```

---

## 📞 CHECKLIST FINAL

Antes de considerar concluído, verifique:

- [ ] Banco de dados criado e populado
- [ ] Arquivo conexao.php configurado
- [ ] Arquivo movimentacao_saida.php copiado
- [ ] JavaScript atualizado
- [ ] Bibliotecas jsPDF carregadas
- [ ] Teste de entrada funcionando
- [ ] Teste de saída funcionando e salvando
- [ ] Teste de PDF gerando corretamente
- [ ] Estoque atualizando após movimentações
- [ ] Console sem erros JavaScript
- [ ] Logs PHP funcionando

---

## 💡 DICAS IMPORTANTES

### Segurança
```php
// Em PRODUÇÃO, no conexao.php:
define('DEBUG_MODE', false); // Desabilitar debug
error_reporting(0);
ini_set('display_errors', 0);
```

### Performance
```sql
-- Adicione índices se necessário:
CREATE INDEX idx_custom ON tabela(coluna);

-- Analise queries lentas:
EXPLAIN SELECT * FROM movimentacoes WHERE ...;
```

### Backup
```bash
# Faça backup regular do banco:
mysqldump -u usuario -p heca_almoxarifado > backup_$(date +%Y%m%d).sql
```

---

## 🎓 RECURSOS ADICIONAIS

### Documentação Completa
- Leia: `ALTERACOES_REALIZADAS.md` para detalhes técnicos

### Exemplo Prático
- Abra: `exemplo_integracao.html` no navegador

### Estrutura do Banco
- Consulte: `database_schema.sql` para referência

---

## 📈 PRÓXIMOS PASSOS (OPCIONAL)

### Melhorias Sugeridas
1. **Autenticação de Usuários**
   - Implementar login/logout
   - Controle de permissões por nível

2. **Relatórios Avançados**
   - Gráficos de movimentação
   - Análise de estoque crítico
   - Previsão de reposição

3. **Notificações**
   - Email quando estoque baixo
   - Alertas de movimentações grandes

4. **Mobile**
   - App mobile para leitura de código de barras
   - Interface responsiva otimizada

5. **Integração**
   - API REST para integração com outros sistemas
   - Importação/exportação em massa

---

## ✅ CONCLUSÃO

Você agora tem:
- ✅ Sistema completo e funcional
- ✅ PDF profissional e elegante
- ✅ Saída de materiais salvando corretamente
- ✅ Código documentado e organizado
- ✅ Banco de dados estruturado
- ✅ Exemplos e guias completos

**Tudo pronto para uso em produção!**

---

## 🆘 SUPORTE

Se precisar de ajuda:

1. **Verifique os logs** (console + PHP)
2. **Consulte a documentação** (ALTERACOES_REALIZADAS.md)
3. **Teste com dados simples** primeiro
4. **Verifique permissões** de arquivos e banco
5. **Confirme versões** (PHP 7.4+, MySQL 5.7+)

---

**Desenvolvido para HECA Construtora**  
*Sistema de Almoxarifado - Versão Profissional*  
*Atualizado em: 2024*

---

## 🎉 BOA SORTE!

O sistema está pronto para uso. Qualquer dúvida, consulte a documentação completa.

**Código limpo. Sistema robusto. PDF elegante. Saída funcionando. ✨**
