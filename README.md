# 🏗️ Sistema de Almoxarifado HECA - Versão Completa Atualizada

<div align="center">

![Status](https://img.shields.io/badge/Status-Pronto%20para%20Produ%C3%A7%C3%A3o-success)
![Versão](https://img.shields.io/badge/Vers%C3%A3o-2.0-blue)
![PHP](https://img.shields.io/badge/PHP-7.4%2B-purple)
![MySQL](https://img.shields.io/badge/MySQL-5.7%2B-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow)

**Sistema completo de gestão de almoxarifado com PDF profissional e saída de materiais corrigida**

[Documentação Completa](#-documentação) • [Instalação Rápida](#-instalação-rápida) • [Guia de Uso](#-guia-de-uso) • [Suporte](#-suporte)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Novidades da Versão 2.0](#-novidades-da-versão-20)
- [Arquivos Incluídos](#-arquivos-incluídos)
- [Instalação Rápida](#-instalação-rápida)
- [Documentação](#-documentação)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Screenshots](#-screenshots)
- [Troubleshooting](#-troubleshooting)
- [Suporte](#-suporte)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O **Sistema de Almoxarifado HECA** é uma solução completa para gestão de materiais de construção, desenvolvido especificamente para a HECA Construtora. O sistema permite controle total de entradas, saídas e transferências de materiais, com geração de relatórios profissionais em PDF.

### Principais Características

- ✅ **Gestão Completa**: Controle de entradas, saídas e transferências
- ✅ **PDF Profissional**: Relatórios elegantes e modernos
- ✅ **Atualização Automática**: Estoque atualizado em tempo real
- ✅ **Interface Intuitiva**: Fácil de usar e navegar
- ✅ **Segurança**: Transações de banco de dados e validações robustas
- ✅ **Logs Completos**: Sistema de auditoria e rastreamento

---

## 🆕 Novidades da Versão 2.0

### 🎨 PDF Profissional e Elegante

#### Antes vs Depois

| Aspecto | Versão 1.0 | Versão 2.0 ✨ |
|---------|-----------|--------------|
| **Design** | Corporativo rígido | Profissional e casual |
| **Cores** | Azul marinho + Dourado | Azul moderno + Laranja vibrante |
| **Cabeçalho** | Simples | Logo + Gradiente + Informações |
| **Resumo** | Básico | Executivo com 3 colunas e ícones |
| **Tabelas** | Grid padrão | Striped moderno com cores suaves |
| **Rodapé** | Texto simples | Barra colorida + Informações completas |

#### Melhorias Visuais

```
✨ Paleta de Cores Moderna
   - Azul Profissional: rgb(41, 128, 185)
   - Azul Claro: rgb(52, 152, 219)
   - Laranja Casual: rgb(230, 126, 34)
   - Cinza Elegante: rgb(44, 62, 80)

✨ Elementos Visuais
   - Logo HECA em círculo branco
   - Barra de acento laranja
   - Indicadores coloridos (↑ ↓ ⇄)
   - Ícones de status (✓ ✗)

✨ Layout Otimizado
   - Resumo executivo em 3 colunas
   - Tabelas com linhas alternadas
   - Espaçamento profissional
   - Tipografia moderna
```

### 🔧 Saída de Materiais Corrigida

#### Problema Resolvido

**Antes:** Saída não salvava no banco de dados  
**Depois:** Saída salva corretamente com todas as informações ✅

#### Correções Implementadas

1. **Tipo de Movimentação**
   ```javascript
   tipo_movimentacao: 'S' // Agora definido corretamente
   ```

2. **Extração de Código**
   ```javascript
   const warehouseMatch = warehouseValue.match(/^(\d+)/);
   const cod_almoxarifado = warehouseMatch ? warehouseMatch[1] : warehouseValue;
   ```

3. **Validação Robusta**
   ```javascript
   // Valida todos os campos obrigatórios
   // Mostra mensagens específicas
   // Foca no campo com erro
   ```

4. **Logs de Debug**
   ```javascript
   console.log('=== INÍCIO DO SALVAMENTO ===');
   console.log('Dados:', data);
   console.log('Resposta:', response);
   ```

5. **Transações Seguras**
   ```php
   $pdo->beginTransaction();
   // Operações...
   $pdo->commit();
   ```

---

## 📦 Arquivos Incluídos

```
📁 Sistema de Almoxarifado HECA/
│
├── 📄 almoxarifado-completo.js          ⭐ JavaScript completo atualizado
├── 📄 movimentacao_saida.php            ⭐ Backend PHP para saídas
├── 📄 conexao.php                       ⭐ Conexão com banco de dados
├── 📄 database_schema.sql               ⭐ Estrutura completa do banco
│
├── 📄 exemplo_integracao.html           📚 Exemplo prático de uso
├── 📄 ALTERACOES_REALIZADAS.md          📚 Documentação técnica completa
├── 📄 GUIA_RAPIDO.md                    📚 Guia de instalação rápida
└── 📄 README.md                         📚 Este arquivo
```

### Descrição dos Arquivos

| Arquivo | Descrição | Tamanho Aprox. |
|---------|-----------|----------------|
| `almoxarifado-completo.js` | JavaScript com todas as funcionalidades | ~25 KB |
| `movimentacao_saida.php` | Backend para processar saídas | ~8 KB |
| `conexao.php` | Conexão e funções auxiliares | ~6 KB |
| `database_schema.sql` | Estrutura completa do banco | ~15 KB |
| `exemplo_integracao.html` | Exemplo funcional | ~12 KB |
| `ALTERACOES_REALIZADAS.md` | Documentação detalhada | ~20 KB |
| `GUIA_RAPIDO.md` | Guia de instalação | ~8 KB |

---

## ⚡ Instalação Rápida

### Pré-requisitos

- PHP 7.4 ou superior
- MySQL 5.7 ou superior
- Servidor web (Apache/Nginx)
- Navegador moderno (Chrome, Firefox, Edge)

### Passo a Passo (5 minutos)

#### 1️⃣ Banco de Dados (2 min)

```sql
-- Abra o phpMyAdmin ou MySQL Workbench
-- Execute o arquivo: database_schema.sql
-- Verifique: SHOW TABLES;
```

#### 2️⃣ Backend PHP (1 min)

```bash
# Copie os arquivos para a pasta correta
cp conexao.php ../Banco/
cp movimentacao_saida.php ../Banco/

# Edite conexao.php e configure:
# - DB_HOST
# - DB_NAME
# - DB_USER
# - DB_PASS
```

#### 3️⃣ Frontend JavaScript (1 min)

```html
<!-- Adicione no HTML -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>
<script src="almoxarifado-completo.js"></script>
```

#### 4️⃣ Teste (1 min)

```
1. Abra o sistema no navegador
2. Faça uma saída de teste
3. Verifique o console (F12)
4. Confirme no banco de dados
5. Exporte um PDF
```

### Instalação Detalhada

Para instruções detalhadas, consulte: [GUIA_RAPIDO.md](GUIA_RAPIDO.md)

---

## 📚 Documentação

### Documentos Disponíveis

| Documento | Conteúdo | Para Quem |
|-----------|----------|-----------|
| [README.md](README.md) | Visão geral do projeto | Todos |
| [GUIA_RAPIDO.md](GUIA_RAPIDO.md) | Instalação em 5 minutos | Desenvolvedores |
| [ALTERACOES_REALIZADAS.md](ALTERACOES_REALIZADAS.md) | Detalhes técnicos completos | Desenvolvedores avançados |
| [exemplo_integracao.html](exemplo_integracao.html) | Exemplo prático funcional | Desenvolvedores |

### Estrutura do Banco de Dados

```
┌─────────────────┐
│  almoxarifados  │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
┌────────▼────────┐  ┌────▼──────────┐
│  movimentacoes  │  │    estoque    │
└────────┬────────┘  └───────────────┘
         │
         │
┌────────▼──────────────┐
│  movimentacoes_itens  │
└───────────────────────┘
```

---

## 🚀 Funcionalidades

### Gestão de Materiais

- ✅ **Entrada de Materiais**
  - Registro com NF e OF
  - Múltiplos itens por entrada
  - Cálculo automático de totais
  - Validação de campos obrigatórios

- ✅ **Saída de Materiais** (CORRIGIDO ✨)
  - Solicitante e autorizante
  - Controle por serviço
  - Atualização automática de estoque
  - Logs completos de auditoria

- ✅ **Transferências**
  - Entre almoxarifados
  - Rastreamento completo
  - Histórico de movimentações

### Relatórios e Exportação

- ✅ **PDF Profissional** (NOVO VISUAL ✨)
  - Design moderno e elegante
  - Resumo executivo completo
  - Gráficos e indicadores visuais
  - Múltiplas páginas automáticas

- ✅ **Exportação CSV**
  - Dados completos
  - Compatível com Excel
  - Filtros aplicados

### Controle de Estoque

- ✅ **Atualização Automática**
  - Entrada: adiciona ao estoque
  - Saída: subtrai do estoque
  - Transferência: move entre almoxarifados

- ✅ **Alertas de Estoque**
  - Estoque mínimo
  - Estoque crítico
  - Estoque em excesso

### Segurança e Auditoria

- ✅ **Transações de Banco**
  - Rollback em caso de erro
  - Integridade garantida

- ✅ **Logs Completos**
  - Todas as operações registradas
  - Rastreamento de usuários
  - Histórico de alterações

---

## 🛠️ Tecnologias

### Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| JavaScript | ES6+ | Lógica da aplicação |
| jsPDF | 2.5.1 | Geração de PDF |
| jsPDF-AutoTable | 3.5.31 | Tabelas em PDF |
| Font Awesome | 6.4.0 | Ícones |
| HTML5 | - | Estrutura |
| CSS3 | - | Estilização |

### Backend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| PHP | 7.4+ | Lógica do servidor |
| PDO | - | Conexão com banco |
| MySQL | 5.7+ | Banco de dados |

### Bibliotecas JavaScript

```javascript
// Principais classes
- EntradaMaterial    // Gestão de entradas
- SaidaMaterial      // Gestão de saídas (CORRIGIDA)
- PDFExporter        // Exportação de PDF (NOVO VISUAL)
- Currency           // Formatação de moeda
```

---

## 📸 Screenshots

### Novo Visual do PDF

```
┌─────────────────────────────────────────────────────┐
│  [HECA]  RELATÓRIO DE MOVIMENTAÇÕES                 │
│          Sistema de Gestão de Almoxarifado          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ ← Barra laranja
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │      RESUMO EXECUTIVO                      │    │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │    │
│  │                                             │    │
│  │  Período: 01/01/2024 a 31/01/2024          │    │
│  │  Total: 150 registros                      │    │
│  │  Valor Total: R$ 125.450,00                │    │
│  │                                             │    │
│  │  ↑ Entradas: 80 (R$ 85.200,00)            │    │
│  │  ↓ Saídas: 65 (R$ 38.150,00)              │    │
│  │  ⇄ Transferências: 5 (R$ 2.100,00)        │    │
│  │                                             │    │
│  │  ✓ Balanço: R$ 47.050,00                  │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ Data/Hora │ Produto │ Tipo │ Qtd │ Valor  │    │
│  ├───────────┼─────────┼──────┼─────┼────────┤    │
│  │ 15/01 10h │ Cimento │  S   │ 100 │ 3.500  │    │ ← Linha branca
│  │ 14/01 14h │ Areia   │  E   │  50 │ 7.500  │    │ ← Linha cinza clara
│  │ 13/01 09h │ Tijolo  │  S   │ 500 │ 1.250  │    │ ← Linha branca
│  └────────────────────────────────────────────┘    │
│                                                      │
├─────────────────────────────────────────────────────┤
│  HECA Construtora • Tel: (11) 3456-7890            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ ← Barra azul
│  Sistema de Almoxarifado HECA • Página 1           │
└─────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Saída não salva no banco

**Sintomas:**
- Mensagem de erro no console
- Dados não aparecem no banco
- Toast de erro aparece

**Soluções:**
```javascript
// Verifique no console:
1. Tipo de movimentação está como 'S'?
2. Código do almoxarifado foi extraído corretamente?
3. Todos os campos obrigatórios estão preenchidos?
4. A resposta do servidor é 200 OK?

// Verifique no PHP:
1. Arquivo movimentacao_saida.php existe?
2. Conexão com banco está funcionando?
3. Tabelas existem no banco?
4. Logs PHP mostram algum erro?
```

#### 2. PDF não gera

**Sintomas:**
- Botão não responde
- Erro no console
- PDF em branco

**Soluções:**
```html
<!-- Verifique se as bibliotecas estão carregadas: -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>

<!-- Verifique no console: -->
console.log(window.jspdf); // Deve retornar objeto
```

#### 3. Erro de conexão

**Sintomas:**
- "Erro de conexão com o servidor"
- Requisição falha

**Soluções:**
```php
// Em conexao.php, verifique:
define('DB_HOST', 'localhost');     // Correto?
define('DB_NAME', 'heca_almoxarifado'); // Existe?
define('DB_USER', 'root');          // Correto?
define('DB_PASS', '');              // Correto?

// Teste a conexão:
php -r "new PDO('mysql:host=localhost;dbname=heca_almoxarifado', 'root', '');"
```

### Logs de Debug

#### JavaScript (Console)
```javascript
// Habilite logs detalhados:
console.log('=== DEBUG ===');
console.log('Dados:', data);
console.log('Resposta:', response);
```

#### PHP (error_log)
```php
// Em conexao.php:
define('DEBUG_MODE', true);

// Verifique os logs:
tail -f /var/log/apache2/error.log
```

---

## 💬 Suporte

### Documentação

- 📖 [Documentação Completa](ALTERACOES_REALIZADAS.md)
- 🚀 [Guia Rápido](GUIA_RAPIDO.md)
- 💻 [Exemplo de Integração](exemplo_integracao.html)

### Checklist de Verificação

Antes de reportar um problema, verifique:

- [ ] Banco de dados criado e populado
- [ ] Arquivo conexao.php configurado corretamente
- [ ] Bibliotecas jsPDF carregadas
- [ ] Console do navegador sem erros
- [ ] Logs PHP habilitados
- [ ] Permissões de arquivo corretas
- [ ] Versões compatíveis (PHP 7.4+, MySQL 5.7+)

### Informações para Suporte

Ao reportar um problema, inclua:

1. **Mensagem de erro completa**
2. **Logs do console (F12)**
3. **Logs do PHP**
4. **Versões** (PHP, MySQL, navegador)
5. **Passos para reproduzir**

---

## 📄 Licença

Este projeto foi desenvolvido especificamente para a **HECA Construtora**.

```
Copyright (c) 2024 HECA Construtora
Todos os direitos reservados.

Este software é propriedade da HECA Construtora e não pode ser
reproduzido, distribuído ou modificado sem autorização expressa.
```

---

## 🎉 Conclusão

Você agora possui um sistema completo e profissional de gestão de almoxarifado com:

- ✅ **PDF Elegante**: Design moderno e profissional
- ✅ **Saída Funcionando**: Salvamento correto no banco
- ✅ **Código Limpo**: Bem documentado e organizado
- ✅ **Segurança**: Transações e validações robustas
- ✅ **Documentação**: Guias completos e exemplos

### Próximos Passos

1. ✅ Instale o sistema seguindo o [Guia Rápido](GUIA_RAPIDO.md)
2. ✅ Teste todas as funcionalidades
3. ✅ Personalize conforme necessário
4. ✅ Coloque em produção
5. ✅ Aproveite! 🚀

---

<div align="center">

**Sistema de Almoxarifado HECA**  
*Versão 2.0 - Profissional e Elegante*

Desenvolvido com ❤️ para HECA Construtora

[⬆ Voltar ao topo](#-sistema-de-almoxarifado-heca---versão-completa-atualizada)

</div>
