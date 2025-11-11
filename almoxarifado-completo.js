"use strict";
/* =========================================================
   SISTEMA DE ALMOXARIFADO HECA - VERSÃO COMPLETA ATUALIZADA
   - PDF Profissional e Elegante
   - Correção de Saída de Materiais
   ========================================================= */

/* =========================================================
   1) UTILITÁRIOS (toast, modal, navegação, filtros etc.)
   ========================================================= */
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container') || (() => {
        const el = document.createElement('div');
        el.id = 'toast-container';
        el.style.position = 'fixed';
        el.style.top = '16px';
        el.style.right = '16px';
        el.style.zIndex = '9999';
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        el.style.gap = '8px';
        document.body.appendChild(el);
        return el;
    })();
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.style.padding = '12px 16px';
    toast.style.borderRadius = '10px';
    toast.style.boxShadow = '0 6px 16px rgba(0,0,0,.18)';
    toast.style.background = {
        success: '#059669',
        warning: '#d97706',
        danger: '#dc2626',
        info: '#2563eb'
    }[type] || '#2563eb';
    toast.style.color = '#fff';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '500';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all .3s ease';
    const icons = { success:'check-circle', warning:'exclamation-triangle', danger:'times-circle', info:'info-circle' };
    toast.innerHTML = `<i class="fas fa-${icons[type]} fa-lg"></i><span>${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity='1'; toast.style.transform='translateX(0)'; });
    setTimeout(() => {
        toast.style.opacity='0';
        toast.style.transform='translateX(20px)';
        setTimeout(() => toast.remove(), 350);
    }, duration);
}

function showModal(id){ document.getElementById(id)?.classList.add('show'); }
function closeModal(id){ document.getElementById(id)?.classList.remove('show'); }

function navigateToPage(pageId){
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    document.querySelectorAll('.page-content').forEach(c=>c.classList.remove('active'));
    const link = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    const content = document.getElementById(pageId);
    if(link) link.classList.add('active');
    if(content) content.classList.add('active');
    const txt = link?.querySelector('span')?.textContent?.trim()||'Página';
    document.getElementById('page-title')?.replaceChildren(`${txt} - HECA Construtora`);
    document.getElementById('breadcrumb-current')?.replaceChildren(txt);
    if(window.innerWidth<=768) document.getElementById('sidebar')?.classList.remove('show');
}

function registrarClicksGlobais(){
    document.addEventListener('click', e=>{
        const item = e.target.closest('.nav-item');
        if(item?.dataset.page){ e.preventDefault(); navigateToPage(item.dataset.page); }
    });
    document.addEventListener('click', e=>{
        if(!e.target.closest('.user-info') && !e.target.closest('#user-menu'))
            document.getElementById('user-menu')?.classList.remove('show');
        if(!e.target.closest('.notification-icon') && !e.target.closest('#notification-panel'))
            document.getElementById('notification-panel')?.classList.remove('show');
    });
}

function sortTable(tbodyId, colIndex){
    const tbody = document.getElementById(tbodyId);
    if(!tbody) return;
    const table = tbody.closest('table') || tbody;
    const rows = Array.from(tbody.rows);
    const isAsc = table.dataset.sortCol!==String(colIndex) || table.dataset.sortDir!=='asc';
    table.dataset.sortCol = colIndex; table.dataset.sortDir = isAsc?'asc':'desc';
    rows.sort((a,b)=>{
        let av = a.cells[colIndex]?.textContent.trim()??'';
        let bv = b.cells[colIndex]?.textContent.trim()??'';
        const cur = v=>parseFloat(v.replace(/[^\d,.-]/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.'))||0;
        const isMoney = s => /^R\$\s*/.test(s);
        if(isMoney(av)) av=cur(av); if(isMoney(bv)) bv=cur(bv);
        if(!isNaN(av)&&!isNaN(bv)){ av=parseFloat(av); bv=parseFloat(bv); }
        else if(Date.parse(av)&&Date.parse(bv)){ av=new Date(av).getTime(); bv=new Date(bv).getTime(); }
        else{ av=av.toLowerCase(); bv=bv.toLowerCase(); }
        return (av<bv?-1:av>bv?1:0)*(isAsc?1:-1);
    });
    tbody.innerHTML=''; rows.forEach(r=>tbody.appendChild(r));
}

function filterTable(tbodyId, query){
    const tbody = document.getElementById(tbodyId);
    if(!tbody) return;
    const q = (query||'').toLowerCase().trim();
    Array.from(tbody.rows).forEach(row=>{
        const visible = q==='' || Array.from(row.cells).slice(0,-1).some(c=>c.textContent.toLowerCase().includes(q));
        row.style.display = visible?'':'none';
    });
}

/* =========================================================
   2) ENTRADA DE MATERIAIS
   ========================================================= */
class EntradaMaterial{
    constructor(){ this.itensEntrada=[]; this.initEventListeners(); }
    initEventListeners(){
        document.getElementById('entry-item-product')?.addEventListener('change',()=>this.updateItemDetails('entry'));
        document.getElementById('add-item-entry')?.addEventListener('click',()=>this.addItemToEntry());
        document.addEventListener('input',e=>{ if(e.target.matches('.item-qty,.item-value')) this.atualizarTotais(); });
    }
    updateItemDetails(t){
        const p=document.getElementById(`${t}-item-product`), u=document.getElementById(`${t}-item-unit`);
        if(!p||!u) return;
        const m=p.value.match(/^(\d+(?:\.\d+)*)/);
        p.dataset.codigo=m?m[1]:''; if(!u.value) u.value='UN';
    }
    addItemToEntry(){
        const p=document.getElementById('entry-item-product'),
              q=document.getElementById('entry-item-qty'),
              v=document.getElementById('entry-item-value'),
              u=document.getElementById('entry-item-unit');
        if(!this.validarItemEntrada(p,q,v)) return;
        const m=p.value.match(/^(\d+(?:\.\d+)*)/);
        const item={
            cod_produto:m?m[1]:p.value,
            descricao:(p.value.split(' - ')[1]||p.value).trim(),
            unidade:(u.value||'UN').trim(),
            quantidade:parseFloat(q.value),
            valor_unitario:parseFloat(v.value)
        };
        this.itensEntrada.push(item);
        this.atualizarTabelaItens();
        this.limparCamposItem();
        this.atualizarTotais();
        this.gerarCamposOcultos();
        showToast(`Item "${item.descricao}" adicionado à entrada.`, 'success');
    }
    validarItemEntrada(p,q,v){
        if(!p?.value.trim()){ showToast('Campo obrigatório: Selecione um produto.', 'warning'); p?.focus(); return false; }
        if(!q?.value||parseFloat(q.value)<=0){ showToast('Campo obrigatório: Informe uma quantidade válida.', 'warning'); q?.focus(); return false; }
        if(!v?.value||parseFloat(v.value)<=0){ showToast('Campo obrigatório: Informe um valor unitário válido.', 'warning'); v?.focus(); return false; }
        return true;
    }
    atualizarTabelaItens(){
        const tb=document.getElementById('entry-items-table'); if(!tb) return; tb.innerHTML='';
        this.itensEntrada.forEach((i,idx)=>{
            const tot=i.quantidade*i.valor_unitario;
            const tr=document.createElement('tr');
            tr.innerHTML=`<td>${i.cod_produto}</td><td>${i.descricao}</td><td>${i.unidade}</td><td>${i.quantidade}</td><td>R$ ${i.valor_unitario.toFixed(2)}</td><td>R$ ${tot.toFixed(2)}</td>
                <td><button type="button" class="btn btn-danger btn-sm" title="Remover"><i class="fas fa-trash"></i></button></td>`;
            tr.querySelector('button')?.addEventListener('click',()=>this.removerItemEntrada(idx));
            tb.appendChild(tr);
        });
    }
    removerItemEntrada(i){
        const rem=this.itensEntrada[i];
        this.itensEntrada.splice(i,1);
        this.atualizarTabelaItens();
        this.atualizarTotais();
        this.gerarCamposOcultos();
        showToast(`Item "${rem.descricao}" removido da entrada.`, 'info');
    }
    limparCamposItem(){
        ['entry-item-product','entry-item-unit','entry-item-qty','entry-item-value'].forEach(id=>{
            const el = document.getElementById(id);
            if(el) el.value = '';
        });
    }
    atualizarTotais(){
        const totItens=this.itensEntrada.length;
        const totGeral=this.itensEntrada.reduce((s,i)=>s+i.quantidade*i.valor_unitario,0);
        document.getElementById('entry-total-items')?.replaceChildren(totItens);
        document.getElementById('entry-grand-total')?.replaceChildren(`R$ ${totGeral.toFixed(2).replace('.',',')}`);
    }
    gerarCamposOcultos(){
        let c=document.getElementById('itens-container-entry');
        if(!c){
            c=document.createElement('div');
            c.id='itens-container-entry';
            c.style.display='none';
            document.getElementById('new-entry-form')?.appendChild(c);
        }
        c.innerHTML='';
        this.itensEntrada.forEach(i=>{
            c.innerHTML+=`<input type="hidden" name="cod_produto[]" value="${i.cod_produto}">
            <input type="hidden" name="quantidade[]" value="${i.quantidade}"><input type="hidden" name="valor_unitario[]" value="${i.valor_unitario}">`;
        });
    }
    validarFormularioEntrada(){
        const campos=[
            {name:'data_entrada',label:'Data da Entrada'},
            {name:'nf',label:'Nota Fiscal'},
            {name:'of',label:'Ordem de Fornecimento'},
            {name:'tipo_entrada',label:'Tipo de Entrada'},
            {name:'cod_almoxarifado',label:'Almoxarifado'},
            {name:'cod_fornecedor',label:'Fornecedor'}
        ];
        for(const f of campos){
            const el=document.querySelector(`[name="${f.name}"]`);
            if(!el?.value.trim()){ showToast(`Campo obrigatório: ${f.label}`, 'warning'); el?.focus(); return false; }
        }
        return true;
    }
    async saveEntry(e){
        if(e?.preventDefault) e.preventDefault();
        if(this.itensEntrada.length===0){ showToast('Nenhum item adicionado. Inclua pelo menos um produto.', 'warning'); return; }
        if(!this.validarFormularioEntrada()) return;
        const btn=document.querySelector('#new-entry-form button[type="submit"]');
        if(btn){ btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Processando...'; }
        try{
            const dados={
                data_entrada:document.querySelector('[name="data_entrada"]').value,
                nf:document.querySelector('[name="nf"]').value,
                of:document.querySelector('[name="of"]').value,
                tipo_entrada:document.querySelector('[name="tipo_entrada"]').value,
                cod_almoxarifado:document.querySelector('[name="cod_almoxarifado"]').value,
                cod_fornecedor:document.querySelector('[name="cod_fornecedor"]').value,
                observacao:document.querySelector('[name="observacao"]')?.value||'',
                responsavel:'Sistema Dashboard',
                itens:JSON.stringify(this.itensEntrada.map(i=>({cod_produto:i.cod_produto,quantidade:i.quantidade,valor_unitario:i.valor_unitario})))
            };
            const r=await fetch('../Banco/movimentacao.php',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(dados)});
            const t=await r.text();
            if(r.ok){
                showToast('Entrada registrada com sucesso!', 'success');
                this.clearEntryForm();
                setTimeout(()=>App.renderDashboard?.(),600);
            } else {
                showToast('Falha ao registrar entrada: '+t.substring(0,100), 'danger');
            }
        }catch(err){
            console.error(err);
            showToast('Erro de conexão com o servidor.', 'danger');
        } finally {
            if(btn){ btn.disabled=false; btn.innerHTML='<i class="fas fa-save"></i> Salvar Entrada'; }
        }
    }
    clearEntryForm(){
        document.getElementById('new-entry-form')?.reset();
        this.itensEntrada=[];
        this.atualizarTabelaItens();
        this.atualizarTotais();
        this.gerarCamposOcultos();
        const d=document.getElementById('entry-date');
        if(d) d.value=new Date().toISOString().split('T')[0];
    }
    updateWarehouseDetails(t){
        const el=document.getElementById(`${t}-warehouse`)||document.getElementById('entry-warehouse'); if(!el) return;
        const m=el.value.match(/^(\d+)/); el.dataset.codigo=m?m[1]:''; }
}

/* =========================================================
   3) SAÍDA DE MATERIAIS - CORRIGIDO
   ========================================================= */
class SaidaMaterial {
    constructor() { 
        this.itensSaida = []; 
        this.setDefaultDate(); 
        this.bindEvents(); 
    }
    
    setDefaultDate() { 
        const el = document.getElementById('exit-date'); 
        if (el && !el.value) el.value = new Date().toISOString().split('T')[0]; 
    }
    
    bindEvents() {
        const qty = document.getElementById('exit-item-qty');
        const prod = document.getElementById('exit-item-product');
        const addBtn = document.querySelector('button[onclick="App.addItemToExit()"]');
        
        if (qty) qty.addEventListener('keypress', e => { 
            if (e.key === 'Enter') { e.preventDefault(); this.addItemToExit(); } 
        });
        
        if (prod) {
            prod.addEventListener('keypress', e => { 
                if (e.key === 'Enter') { e.preventDefault(); qty?.focus(); } 
            });
            prod.addEventListener('change', () => this.updateItemDetails('exit'));
        }
        
        if (addBtn) {
            addBtn.removeAttribute('onclick');
            addBtn.addEventListener('click', e => { e.preventDefault(); this.addItemToExit(); });
        }
        
        const form = document.getElementById('new-exit-form');
        if (form) {
            form.removeAttribute('onsubmit');
            form.addEventListener('submit', e => { 
                e.preventDefault(); 
                this.saveExit(); 
            });
        }
    }
    
    updateItemDetails(t) {
        const p = document.getElementById(`${t}-item-product`),
              u = document.getElementById(`${t}-item-unit`),
              v = document.getElementById(`${t}-item-value`);
        if (!p || !u || !v) return;
        const m = p.value.match(/^(\d+)/);
        p.dataset.codigo = m ? m[1] : ''; 
        if (!u.value) u.value = 'UN'; 
        if (!v.value) v.value = '0.00';
    }
    
    validarItemSaida(p, q) {
        if (!p?.value.trim()) { 
            showToast('Campo obrigatório: Selecione um produto.', 'warning'); 
            p?.focus(); 
            return false; 
        }
        if (!q?.value || parseFloat(q.value) <= 0) { 
            showToast('Campo obrigatório: Informe uma quantidade válida.', 'warning'); 
            q?.focus(); 
            return false; 
        }
        return true;
    }
    
    addItemToExit() {
        const p = document.getElementById('exit-item-product'),
              u = document.getElementById('exit-item-unit'),
              q = document.getElementById('exit-item-qty'),
              v = document.getElementById('exit-item-value'),
              o = document.getElementById('exit-item-observation');
              
        if (!p || !u || !q || !v || !o) { 
            showToast('Erro interno: campos não encontrados.', 'danger'); 
            return; 
        }
        
        if (!this.validarItemSaida(p, q)) return;
        
        const m = p.value.match(/^(\d+)/);
        const origemDestino = document.getElementById('exit-origin-destination')?.value || 
                             document.getElementById('exit-warehouse')?.value || '-';
        const local = document.getElementById('exit-location')?.value || '-';
        const responsavel = document.getElementById('exit-responsible')?.value || '-';
        const solicitante = document.getElementById('exit-requester')?.value || '-';
        const autorizante = document.getElementById('exit-authorizer')?.value || '-';
        const solicAutor = `${solicitante} / ${autorizante}`.replace(/^ \//, '').replace(/\/ $/, '').trim();
        const servico = document.getElementById('exit-service')?.value || '-';
        
        const item = {
            cod_produto: m ? m[1] : p.value,
            descricao: (p.value.split(' - ')[1] || p.value).trim(),
            unidade: (u.value || 'UN').trim(),
            quantidade: parseFloat(q.value),
            valor_unitario: parseFloat(v.value) || 0,
            observacao: o.value.trim(),
            origemDestino,
            local,
            responsavel,
            solicAutor,
            servico
        };
        
        this.itensSaida.push(item);
        this.renderTable();
        this.clearItemInputs();
        this.updateTotals();
        this.createHiddenFields();
        showToast(`Item "${item.descricao}" adicionado à saída.`, 'success');
        setTimeout(() => p.focus(), 100);
    }
    
    renderTable() {
        const tb = document.getElementById('exit-items-table'); 
        if (!tb) return; 
        tb.innerHTML = '';
        
        this.itensSaida.forEach((i, idx) => {
            const tot = i.quantidade * i.valor_unitario;
            const tr = document.createElement('tr');
            tr.innerHTML =
                `<td>${i.cod_produto}</td>
                 <td>${i.descricao}</td>
                 <td>${i.origemDestino || '-'}</td>
                 <td>${i.local || '-'}</td>
                 <td>${i.unidade}</td>
                 <td>${i.quantidade}</td>
                 <td class="currency">R$ ${tot.toFixed(2)}</td>
                 <td>${i.responsavel || '-'}</td>
                 <td>${i.solicAutor || '-'}</td>
                 <td>${i.servico || '-'}</td>
                 <td>${i.observacao || '-'}</td>
                 <td>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-danger btn-sm" title="Remover"><i class="fas fa-trash"></i></button>
                    </div>
                 </td>`;
            tr.querySelector('button')?.addEventListener('click', () => this.removeItem(idx));
            tb.appendChild(tr);
        });
    }
    
    removeItem(i) {
        const rem = this.itensSaida[i];
        this.itensSaida.splice(i, 1);
        this.renderTable();
        this.updateTotals();
        this.createHiddenFields();
        showToast(`Item "${rem.descricao}" removido da saída.`, 'info');
    }
    
    clearItemInputs() {
        ['exit-item-product', 'exit-item-unit', 'exit-item-qty', 'exit-item-value', 'exit-item-observation']
            .forEach(id => { 
                const el = document.getElementById(id); 
                if (el) el.value = ''; 
            });
    }
    
    updateTotals() {
        const tot = this.itensSaida.reduce((s, i) => s + i.quantidade * i.valor_unitario, 0);
        document.getElementById('exit-total-items')?.replaceChildren(this.itensSaida.length);
        document.getElementById('exit-grand-total')?.replaceChildren(`R$ ${tot.toFixed(2).replace('.', ',')}`);
    }
    
    createHiddenFields() {
        let c = document.getElementById('itens-container-exit');
        if (!c) {
            c = document.createElement('div');
            c.id = 'itens-container-exit';
            c.style.display = 'none';
            document.getElementById('new-exit-form')?.appendChild(c);
        }
        c.innerHTML = '';
        
        this.itensSaida.forEach(i => {
            c.innerHTML += `<input type="hidden" name="cod_produto[]" value="${i.cod_produto}">
            <input type="hidden" name="quantidade[]" value="${i.quantidade}">
            <input type="hidden" name="valor_unitario[]" value="${i.valor_unitario}">
            <input type="hidden" name="observacao_item[]" value="${i.observacao}">
            <input type="hidden" name="origem_destino[]" value="${i.origemDestino || ''}">
            <input type="hidden" name="local[]" value="${i.local || ''}">
            <input type="hidden" name="responsavel_item[]" value="${i.responsavel || ''}">
            <input type="hidden" name="solic_autor[]" value="${i.solicAutor || ''}">
            <input type="hidden" name="servico_item[]" value="${i.servico || ''}">`;
        });
    }
    
    clearExitForm() {
        document.getElementById('new-exit-form')?.reset();
        this.itensSaida = [];
        this.renderTable();
        this.updateTotals();
        this.createHiddenFields();
        this.setDefaultDate();
    }
    
    async saveExit() {
        console.log('=== INÍCIO DO SALVAMENTO DE SAÍDA ===');
        
        if (this.itensSaida.length === 0) { 
            showToast('Nenhum item adicionado. Inclua pelo menos um produto.', 'warning'); 
            return; 
        }
        
        // Validação de campos obrigatórios
        const campos = [
            { id: 'exit-date', label: 'Data da Saída' },
            { id: 'exit-warehouse', label: 'Almoxarifado' },
            { id: 'exit-requester', label: 'Solicitante' },
            { id: 'exit-authorizer', label: 'Autorizante' },
            { id: 'exit-responsible', label: 'Responsável' }
        ];
        
        for (const c of campos) {
            const el = document.getElementById(c.id);
            if (!el?.value.trim()) { 
                showToast(`Campo obrigatório: ${c.label}`, 'warning'); 
                el?.focus(); 
                return; 
            }
        }
        
        const btn = document.querySelector('#new-exit-form button[type="submit"]');
        if (btn) { 
            btn.disabled = true; 
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...'; 
        }
        
        // Extração do código do almoxarifado
        const warehouseValue = document.getElementById('exit-warehouse').value;
        const warehouseMatch = warehouseValue.match(/^(\d+)/);
        const cod_almoxarifado = warehouseMatch ? warehouseMatch[1] : warehouseValue;
        
        // Preparação dos dados - FORMATO CORRETO
        const data = {
            tipo_movimentacao: 'S', // IMPORTANTE: Tipo de movimentação = Saída
            data_saida: document.getElementById('exit-date').value,
            cod_almoxarifado: cod_almoxarifado,
            solicitante: document.getElementById('exit-requester').value,
            autorizante: document.getElementById('exit-authorizer').value,
            responsavel: document.getElementById('exit-responsible').value,
            servico_associado: document.getElementById('exit-service')?.value || '',
            observacao: document.getElementById('exit-observation')?.value || '',
            itens: JSON.stringify(this.itensSaida.map(i => ({
                cod_produto: i.cod_produto,
                quantidade: i.quantidade,
                valor_unitario: i.valor_unitario,
                observacao: i.observacao || '',
                origem_destino: i.origemDestino || '',
                local: i.local || '',
                responsavel: i.responsavel || '',
                solic_autor: i.solicAutor || '',
                servico: i.servico || ''
            })))
        };
        
        console.log('Dados preparados para envio:', data);
        console.log('Itens parseados:', JSON.parse(data.itens));
        
        try {
            const r = await fetch("../Banco/movimentacao_saida.php", { 
                method: "POST", 
                headers: { 
                    "Content-Type": "application/x-www-form-urlencoded" 
                }, 
                body: new URLSearchParams(data) 
            });
            
            const responseText = await r.text();
            console.log('Status da resposta:', r.status);
            console.log('Resposta do servidor:', responseText);
            
            if (r.ok && responseText.includes('sucesso')) {
                showToast('Saída registrada com sucesso!', 'success');
                this.clearExitForm();
                setTimeout(() => {
                    if (typeof App !== 'undefined' && App.renderDashboard) {
                        App.renderDashboard();
                    }
                    // Recarregar a página de movimentações se existir
                    if (typeof App !== 'undefined' && App.loadMovimentacoes) {
                        App.loadMovimentacoes();
                    }
                }, 600);
            } else {
                console.error('Erro na resposta:', responseText);
                showToast('Falha ao registrar saída: ' + responseText.substring(0, 150), 'danger');
            }
        } catch (e) {
            console.error('Erro na requisição:', e);
            showToast('Erro de conexão com o servidor: ' + e.message, 'danger');
        } finally {
            if (btn) { 
                btn.disabled = false; 
                btn.innerHTML = '<i class="fas fa-save"></i> Salvar Saída'; 
            }
        }
        
        console.log('=== FIM DO SALVAMENTO DE SAÍDA ===');
    }
}

/* =========================================================
   4) FUNÇÕES AUXILIARES PARA EXPORTAÇÃO
   ========================================================= */
const Currency = {
    toNumber(brl){
        if(typeof brl!=='string') return Number(brl)||0;
        return Number(brl.replace(/[^\d,.-]/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.'))||0;
    },
    fmt(num){
        try { return num.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }); }
        catch { return `R$ ${Number(num||0).toFixed(2)}`; }
    }
};

function getClosestTableFromId(idOrTbodyId){
    const el = document.getElementById(idOrTbodyId);
    if(!el) return null;
    if(el.tagName?.toLowerCase()==='table') return el;
    const table = el.closest('table');
    return table || null;
}

function getVisibleRowsFromTbodyId(tbodyId){
    const tbody = document.getElementById(tbodyId);
    if(!tbody) return [];
    return Array.from(tbody.querySelectorAll('tr')).filter(tr => tr.style.display !== 'none');
}

function extractHeaders(table, excludeLastActions = true){
    const head = table.tHead || table.querySelector('thead');
    if(!head) return [];
    const tr = head.rows[0];
    if(!tr) return [];
    const cells = Array.from(tr.cells);
    return (excludeLastActions ? cells.slice(0, -1) : cells).map(th => th.textContent.trim());
}

function extractBodyRows(tbodyId, excludeLastActions = true){
    const rows = getVisibleRowsFromTbodyId(tbodyId);
    return rows.map(tr=>{
        const cells = Array.from(tr.cells);
        const use = excludeLastActions ? cells.slice(0,-1) : cells;
        return use.map(td=>{
            const txt = td.textContent.trim();
            return txt === '' ? '-' : txt;
        });
    });
}

/* =========================================================
   5) PDF EXPORTER — PROFISSIONAL, ELEGANTE E CASUAL
   ========================================================= */
class PDFExporter {
    constructor() { this.doc = null; }
    
    get palette() {
        return {
            // Paleta moderna e profissional com toque casual
            primary: [41, 128, 185],        // Azul profissional suave
            secondary: [52, 152, 219],      // Azul claro elegante
            accent: [230, 126, 34],         // Laranja casual e amigável
            headerBg: [44, 62, 80],         // Cinza azulado escuro
            headerText: [255, 255, 255],    // Branco puro
            text: [52, 73, 94],             // Cinza escuro legível
            lightText: [127, 140, 141],     // Cinza médio
            line: [236, 240, 241],          // Cinza muito claro
            altRow: [250, 252, 253],        // Branco azulado
            background: [255, 255, 255],    // Branco
            success: [39, 174, 96],         // Verde profissional
            warning: [243, 156, 18],        // Laranja aviso
            danger: [231, 76, 60],          // Vermelho profissional
            info: [52, 152, 219]            // Azul informativo
        };
    }
    
    initPDF(title = 'Relatório HECA') {
        const { jsPDF } = window.jspdf || window;
        if (!jsPDF) { 
            showToast('jsPDF não carregado.', 'danger'); 
            return null; 
        }
        
        this.doc = new jsPDF('l', 'pt', 'a4'); // Modo paisagem
        this.doc.setDocumentProperties({
            title,
            author: 'HECA Construtora',
            creator: 'Sistema de Almoxarifado HECA',
            subject: 'Relatório de Movimentações'
        });
        return this.doc;
    }
    
    addModernHeader(title, subtitle = 'Sistema de Gestão de Almoxarifado') {
        const doc = this.doc;
        const w = doc.internal.pageSize.getWidth();
        
        // Fundo do cabeçalho com gradiente simulado
        doc.setFillColor(...this.palette.headerBg);
        doc.rect(0, 0, w, 100, 'F');
        
        // Barra de acento colorida
        doc.setFillColor(...this.palette.accent);
        doc.rect(0, 95, w, 5, 'F');
        
        // Logo/Ícone HECA (círculo moderno)
        doc.setFillColor(255, 255, 255);
        doc.circle(50, 50, 25, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(...this.palette.primary);
        doc.text('HECA', 50, 55, { align: 'center' });
        
        // Título principal
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text(title, 90, 40);
        
        // Subtítulo
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(200, 210, 220);
        doc.text(subtitle, 90, 58);
        
        // Informações da empresa
        doc.setFontSize(9);
        doc.setTextColor(180, 190, 200);
        doc.text('HECA Construtora • CNPJ: 12.345.678/0001-99', 90, 72);
        
        // Data de geração (alinhada à direita)
        const dataGeracao = `Gerado em: ${new Date().toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`;
        doc.setFontSize(9);
        doc.setTextColor(180, 190, 200);
        doc.text(dataGeracao, w - 40, 50, { align: 'right' });
        
        return 110; // Retorna a posição Y após o cabeçalho
    }
    
    analyzeMovementsData(rows) {
        let totalValor = 0, entradas = 0, saidas = 0, transferencias = 0, maiorValor = 0, dataMaisRecente = '';
        let valorEntradas = 0, valorSaidas = 0, valorTransferencias = 0;
        
        rows.forEach(row => {
            const valorCell = row.find(cell => cell.includes('R$') || cell.match(/[\d,.]+\s*R?$/));
            if (valorCell) {
                const valor = Currency.toNumber(valorCell);
                totalValor += Math.abs(valor);
                if (valor > maiorValor) maiorValor = valor;
            }
            
            const dataCell = row.find(cell => cell.match(/\d{2}\/\d{2}\/\d{4}/));
            if (dataCell && (!dataMaisRecente || new Date(dataCell.split('/').reverse().join('-')) > new Date(dataMaisRecente.split('/').reverse().join('-')))) {
                dataMaisRecente = dataCell;
            }
            
            const tipoCell = row.find(cell => ['E', 'S', 'T', 'Entrada', 'Saída', 'Saida', 'Transferência', 'Transferencia'].includes(cell.trim()));
            if (tipoCell) {
                const tipo = tipoCell.trim().toUpperCase();
                const valor = valorCell ? Currency.toNumber(valorCell) : 0;
                if (tipo.startsWith('E')) { entradas++; valorEntradas += valor; }
                else if (tipo.startsWith('S')) { saidas++; valorSaidas += valor; }
                else if (tipo.startsWith('T')) { transferencias++; valorTransferencias += valor; }
            }
        });
        
        const totalRegistros = rows.length;
        const valorMedio = totalRegistros > 0 ? totalValor / totalRegistros : 0;
        
        return {
            totalValor, entradas, saidas, transferencias, totalRegistros, maiorValor,
            dataMaisRecente: dataMaisRecente || 'N/A', valorMedio, valorEntradas, valorSaidas, valorTransferencias
        };
    }
    
    addExecutiveSummary(analysis, periodo, y) {
        const doc = this.doc;
        const w = doc.internal.pageSize.getWidth();
        
        // Card de resumo com sombra suave
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(...this.palette.line);
        doc.setLineWidth(1);
        doc.roundedRect(40, y, w - 80, 180, 10, 10, 'FD');
        
        // Título do resumo
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(...this.palette.primary);
        doc.text('RESUMO EXECUTIVO', w / 2, y + 25, { align: 'center' });
        
        // Linha decorativa
        doc.setDrawColor(...this.palette.accent);
        doc.setLineWidth(2);
        doc.line(w / 2 - 80, y + 32, w / 2 + 80, y + 32);
        
        // Layout em 3 colunas
        const col1X = 60;
        const col2X = w / 2 - 80;
        const col3X = w - 220;
        let currentY = y + 55;
        const lineHeight = 20;
        
        doc.setFontSize(9);
        
        // Coluna 1
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.palette.text);
        doc.text('Período:', col1X, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...this.palette.lightText);
        doc.text(periodo, col1X + 50, currentY);
        
        currentY += lineHeight;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.palette.text);
        doc.text('Total de Registros:', col1X, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...this.palette.lightText);
        doc.text(analysis.totalRegistros.toString(), col1X + 100, currentY);
        
        currentY += lineHeight;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.palette.text);
        doc.text('Data Mais Recente:', col1X, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...this.palette.lightText);
        doc.text(analysis.dataMaisRecente, col1X + 100, currentY);
        
        // Coluna 2
        currentY = y + 55;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.palette.text);
        doc.text('Valor Total:', col2X, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...this.palette.success);
        doc.text(Currency.fmt(analysis.totalValor), col2X + 70, currentY);
        
        currentY += lineHeight;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.palette.text);
        doc.text('Maior Valor:', col2X, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...this.palette.lightText);
        doc.text(Currency.fmt(analysis.maiorValor), col2X + 70, currentY);
        
        currentY += lineHeight;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.palette.text);
        doc.text('Valor Médio:', col2X, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...this.palette.lightText);
        doc.text(Currency.fmt(analysis.valorMedio), col2X + 70, currentY);
        
        // Coluna 3 - Estatísticas por tipo
        currentY = y + 55;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.palette.success);
        doc.text(`↑ Entradas: ${analysis.entradas}`, col3X, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...this.palette.lightText);
        doc.text(Currency.fmt(analysis.valorEntradas), col3X, currentY + 12);
        
        currentY += lineHeight + 12;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.palette.danger);
        doc.text(`↓ Saídas: ${analysis.saidas}`, col3X, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...this.palette.lightText);
        doc.text(Currency.fmt(analysis.valorSaidas), col3X, currentY + 12);
        
        currentY += lineHeight + 12;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.palette.info);
        doc.text(`⇄ Transferências: ${analysis.transferencias}`, col3X, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...this.palette.lightText);
        doc.text(Currency.fmt(analysis.valorTransferencias), col3X, currentY + 12);
        
        // Insight de balanço
        const balanco = analysis.valorEntradas - analysis.valorSaidas;
        const balancoColor = balanco >= 0 ? this.palette.success : this.palette.danger;
        const balancoIcon = balanco >= 0 ? '✓' : '✗';
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...balancoColor);
        doc.text(`${balancoIcon} Balanço: ${Currency.fmt(balanco)}`, w / 2, y + 165, { align: 'center' });
        
        return y + 195;
    }
    
    addModernFooter() {
        const doc = this.doc;
        const w = doc.internal.pageSize.getWidth();
        const h = doc.internal.pageSize.getHeight();
        
        // Linha superior
        doc.setDrawColor(...this.palette.line);
        doc.setLineWidth(1);
        doc.line(40, h - 50, w - 40, h - 50);
        
        // Informações do footer
        doc.setFontSize(8);
        doc.setTextColor(...this.palette.lightText);
        
        // Esquerda
        doc.text('HECA Construtora Ltda.', 40, h - 35);
        doc.text('Av. das Construções, 123 - São Paulo/SP', 40, h - 25);
        
        // Centro - Número da página
        const pageNum = doc.getCurrentPageInfo().pageNumber;
        doc.text(`Página ${pageNum}`, w / 2, h - 30, { align: 'center' });
        
        // Direita
        doc.text('Tel: (11) 3456-7890', w - 40, h - 35, { align: 'right' });
        doc.text('contato@heca.com.br', w - 40, h - 25, { align: 'right' });
        
        // Barra de rodapé
        doc.setFillColor(...this.palette.primary);
        doc.rect(0, h - 15, w, 15, 'F');
        
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text('Sistema de Almoxarifado HECA • Confidencial • © 2024 HECA Construtora', w / 2, h - 7, { align: 'center' });
    }
    
    organizeColumnsForPDF(headers, rows) {
        const columnMapping = [
            { name: 'Data/Hora', key: 'datahora', width: 65, align: 'center' },
            { name: 'Produto', key: 'produto', width: 100, align: 'left' },
            { name: 'Tipo', key: 'tipo', width: 35, align: 'center' },
            { name: 'NF / OF', key: 'nfof', width: 55, align: 'center' },
            { name: 'Quantidade', key: 'quantidade', width: 45, align: 'right' },
            { name: 'Valor', key: 'valor', width: 65, align: 'right' },
            { name: 'Origem/Destino', key: 'origemdestino', width: 85, align: 'left' },
            { name: 'Local', key: 'local', width: 65, align: 'left' },
            { name: 'Responsável', key: 'responsavel', width: 75, align: 'left' },
            { name: 'Solic./Autor.', key: 'solicautor', width: 85, align: 'left' },
            { name: 'Serviço', key: 'servico', width: 75, align: 'left' }
        ];
        
        const norm = s => s.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s|[^a-z/\.]/g, '');
        
        const existingColumns = [];
        const columnStyles = {};
        
        columnMapping.forEach((col, index) => {
            const foundIndex = headers.findIndex(h => {
                const hN = norm(h);
                const cN = norm(col.name) || col.key;
                return hN.includes(cN) || cN.includes(hN) || hN === cN;
            });
            
            if (foundIndex !== -1) {
                existingColumns.push({
                    originalIndex: foundIndex,
                    name: col.name,
                    width: col.width,
                    align: col.align
                });
                
                columnStyles[index] = {
                    cellWidth: col.width,
                    halign: col.align,
                    valign: 'middle',
                    fontSize: 8,
                    cellPadding: 5,
                    fontStyle: 'normal',
                    overflow: 'linebreak'
                };
            }
        });
        
        if (existingColumns.length < columnMapping.length) {
            headers.forEach((header, index) => {
                if (!existingColumns.some(ec => ec.originalIndex === index)) {
                    existingColumns.push({
                        originalIndex: index,
                        name: header,
                        width: 65,
                        align: 'left'
                    });
                    columnStyles[existingColumns.length - 1] = {
                        cellWidth: 65,
                        halign: 'left',
                        valign: 'middle',
                        fontSize: 8,
                        cellPadding: 5
                    };
                }
            });
        }
        
        const finalHeaders = existingColumns.map(col => col.name);
        const finalRows = rows.map(row => existingColumns.map(col => {
            let value = row[col.originalIndex] || '-';
            if (col.name === 'Valor' && value !== '-' && !value.includes('R$')) {
                value = `R$ ${parseFloat(value).toFixed(2)}`;
            }
            return value;
        }));
        
        const finalWidths = existingColumns.map(col => col.width);
        
        return {
            headers: finalHeaders,
            rows: finalRows,
            styles: columnStyles,
            widths: finalWidths
        };
    }
    
    splitColumnsForWidth(organizedData, marginLeft = 40, marginRight = 40) {
        const pageW = this.doc.internal.pageSize.getWidth();
        const usableW = pageW - marginLeft - marginRight;
        const groups = [];
        let curGroup = [];
        let curWidth = 0;
        
        organizedData.headers.forEach((h, idx) => {
            let w = organizedData.widths[idx] || 65;
            const totalWidth = organizedData.widths.reduce((a, b) => a + b, 0);
            
            if (totalWidth > usableW) {
                const scale = usableW / totalWidth;
                w *= scale;
                organizedData.widths[idx] = w;
            }
            
            if (curWidth + w > usableW && curGroup.length > 0) {
                groups.push(curGroup);
                curGroup = [idx];
                curWidth = w;
            } else {
                curGroup.push(idx);
                curWidth += w;
            }
        });
        
        if (curGroup.length) groups.push(curGroup);
        
        const datasets = groups.map((idxs) => {
            const headers = idxs.map(i => organizedData.headers[i]);
            const rows = organizedData.rows.map(r => idxs.map(i => r[i]));
            const styles = {};
            
            idxs.forEach((i, pos) => {
                const style = organizedData.styles[i];
                styles[pos] = style || {
                    cellWidth: 65,
                    fontSize: 8,
                    cellPadding: 5,
                    halign:'left',
                    valign:'middle'
                };
            });
            
            return { headers, rows, styles };
        });
        
        return datasets;
    }
    
    autoTableWithHeaderFooter({ startY, head, body, columnStyles, margin, theme='striped' }) {
        this.doc.autoTable({
            startY,
            head: [head],
            body,
            theme,
            headStyles: {
                fillColor: this.palette.primary,
                textColor: this.palette.headerText,
                fontStyle: 'bold',
                fontSize: 9,
                cellPadding: 7,
                lineWidth: 0,
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 8,
                cellPadding: 5,
                lineColor: this.palette.line,
                lineWidth: 0.5,
                textColor: this.palette.text
            },
            alternateRowStyles: {
                fillColor: this.palette.altRow
            },
            columnStyles,
            margin,
            didDrawPage: () => this.addModernFooter(),
            styles: {
                font: 'helvetica',
                fontSize: 8,
                cellPadding: 5,
                lineColor: this.palette.line,
                lineWidth: 0.5,
                overflow: 'linebreak'
            }
        });
    }
    
    exportMovementsToPDF(filter = {}) {
        try {
            const table = getClosestTableFromId('movimentacoes-table');
            if (!table) { 
                showToast('Tabela de movimentações não encontrada.', 'danger'); 
                return; 
            }
            
            const headers = extractHeaders(table, true);
            const rows = extractBodyRows('movimentacoes-table', true);
            
            if (!rows.length) { 
                showToast('Nenhum dado encontrado para exportar.', 'warning'); 
                return; 
            }
            
            const periodo = filter.periodo || 'Período completo';
            const analysis = this.analyzeMovementsData(rows);
            const organizedData = this.organizeColumnsForPDF(headers, rows);
            
            this.initPDF('Relatório de Movimentações - HECA');
            let y = this.addModernHeader('RELATÓRIO DE MOVIMENTAÇÕES', 'Controle de Entradas, Saídas e Transferências');
            y = this.addExecutiveSummary(analysis, periodo, y);
            
            const datasets = this.splitColumnsForWidth(organizedData, 40, 40);
            
            datasets.forEach((ds, idx) => {
                if (idx > 0) {
                    this.doc.addPage();
                    y = this.addModernHeader(`RELATÓRIO DE MOVIMENTAÇÕES - Parte ${idx + 1}`, `Continuação (${idx + 1} de ${datasets.length})`);
                }
                
                this.autoTableWithHeaderFooter({
                    startY: y + 10,
                    head: ds.headers,
                    body: ds.rows,
                    columnStyles: ds.styles,
                    margin: { top: y + 10, bottom: 70, left: 40, right: 40 },
                    theme: 'striped'
                });
            });
            
            const fileName = `Relatorio_Movimentacoes_HECA_${new Date().toISOString().split('T')[0]}.pdf`;
            this.doc.save(fileName);
            showToast('PDF profissional gerado com sucesso!', 'success');
            
        } catch (e) {
            console.error('Erro ao gerar PDF:', e);
            showToast('Erro ao gerar PDF profissional.', 'danger');
        }
    }
    
    exportTableToPDF(id, fileName, title, subtitle = []) {
        try {
            const table = getClosestTableFromId(id);
            if (!table) { 
                showToast('Tabela não encontrada.', 'danger'); 
                return; 
            }
            
            const rows = extractBodyRows(id, true);
            const headers = extractHeaders(table, true);
            
            if (!rows.length) { 
                showToast('Nenhum dado para exportar.', 'warning'); 
                return; 
            }
            
            this.initPDF(title);
            let y = this.addModernHeader(title);
            
            if (subtitle.length) {
                this.doc.setFontSize(10);
                this.doc.setTextColor(...this.palette.text);
                subtitle.forEach((txt, i) => this.doc.text(txt, 40, y + i * 16));
                y += subtitle.length * 16 + 12;
            }
            
            const organizedData = this.organizeColumnsForPDF(headers, rows);
            const datasets = this.splitColumnsForWidth(organizedData, 40, 40);
            
            datasets.forEach((ds, idx) => {
                if (idx > 0) {
                    this.doc.addPage();
                    y = this.addModernHeader(`${title} - Continuação`);
                }
                
                this.autoTableWithHeaderFooter({
                    startY: y,
                    head: ds.headers,
                    body: ds.rows,
                    columnStyles: ds.styles,
                    margin: { top: y, bottom: 70, left: 40, right: 40 },
                    theme: 'striped'
                });
            });
            
            this.doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
            showToast('PDF exportado com sucesso!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Erro ao gerar PDF.', 'danger');
        }
    }
}

const pdfExporter = new PDFExporter();

/* =========================================================
   6) APP UNIFICADO
   ========================================================= */
(function iniciarAplicacao(){
    registrarClicksGlobais();
    
    const first=document.querySelector('.nav-item.active')||document.querySelector('.nav-item');
    if(first) navigateToPage(first.dataset.page);
    
    const obra=localStorage.getItem('obraPadrao')||''; 
    const sel=document.getElementById('obra-select'); 
    if(sel) sel.value=obra;
    
    const entrada = new EntradaMaterial();
    const saida = new SaidaMaterial();
    
    [
        ['produtos-filter','produtos-table'],
        ['almoxarifado-filter','almoxarifado-table'],
        ['fornecedores-filter','fornecedores-table'],
        ['obras-filter','obras-table'],
        ['usuarios-filter','usuarios-table'],
        ['gestao-estoque-filter','gestao-estoque-table']
    ].forEach(([i,t])=>{
        const el=document.getElementById(i); 
        if(el) el.addEventListener('input',()=>filterTable(t,el.value));
    });
    
    window.App = {
        clearAllNotifications(){
            const b=document.getElementById('notification-badge'); 
            const l=document.getElementById('notification-list');
            if(b){ b.textContent='0'; b.style.display='none'; }
            if(l) l.innerHTML='<div class="notification-item"><p>Nenhuma nova notificação.</p></div>';
            showToast('Notificações limpas.', 'success');
        },
        
        setObraPadrao(o){
            localStorage.setItem('obraPadrao',o||'');
            showToast(`Obra padrão: ${o||'—'}`, 'info');
        },
        
        addItemToEntry:()=>entrada.addItemToEntry(),
        removerItemEntrada:i=>entrada.removerItemEntrada(i),
        saveEntry:e=>entrada.saveEntry(e),
        clearEntryForm:()=>entrada.clearEntryForm(),
        
        addItemToExit:()=>saida.addItemToExit(),
        saveExit:()=>saida.saveExit(),
        clearExitForm:()=>saida.clearExitForm(),
        
        exportMovementsReport: (format) => {
            if (format === 'pdf') {
                const dateFrom = document.getElementById('movimentacoes-date-from')?.value || '';
                const dateTo = document.getElementById('movimentacoes-date-to')?.value || '';
                const periodo = dateFrom && dateTo ? `${dateFrom} a ${dateTo}` : 'Período completo';
                pdfExporter.exportMovementsToPDF({ periodo });
            } else {
                App.exportTableToCSV('movimentacoes-table', 'movimentacoes');
            }
        },
        
        exportTableToCSV: (tbodyOrTableId, filename) => {
            const table = getClosestTableFromId(tbodyOrTableId);
            if (!table) { 
                showToast('Tabela não encontrada', 'danger'); 
                return; 
            }
            
            const tbody = document.getElementById(tbodyOrTableId)?.tagName?.toLowerCase()==='tbody'
                ? document.getElementById(tbodyOrTableId)
                : (table.tBodies?.[0] || table);
            
            const visibleRows = Array.from(tbody.querySelectorAll('tr')).filter(tr => tr.style.display !== 'none');
            
            if(!visibleRows.length){ 
                showToast('Nenhum dado para exportar', 'warning'); 
                return; 
            }
            
            const headRow = extractHeaders(table, true);
            const csv = [];
            csv.push(headRow.map(h=>`"${h.replace(/"/g,'""')}"`).join(';'));
            
            visibleRows.forEach(row=>{
                const cells = Array.from(row.cells).slice(0, -1);
                const rowData = cells.map(cell => {
                    const txt = cell.textContent.trim();
                    return `"${(txt===''?'-':txt).replace(/"/g, '""')}"`;
                });
                csv.push(rowData.join(';'));
            });
            
            const csvContent = csv.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast(`CSV "${filename}" exportado com sucesso!`, 'success');
        }
    };
    
    document.addEventListener('DOMContentLoaded',()=>saida.setDefaultDate());
})();
