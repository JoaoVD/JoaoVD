// app.js - VERSÃO FINAL, COMPLETA E CORRIGIDA

document.addEventListener('DOMContentLoaded', () => {

  // --- ESTADO DA APLICAÇÃO ---
  let pedidoAtual = [];
  let totalPedido = 0;
  let dadosRelatorioAtual = [];

  // --- CONSTANTES ---
  const API_URL = 'http://localhost:3000';
  const ID_CAIXA = 1;

  // --- MAPEAMENTO DE ELEMENTOS GLOBAIS ---
  const loginContainer = document.getElementById('login-container');
  const loginForm = document.getElementById('login-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginError = document.getElementById('login-error');

  const appContainer = document.getElementById('app-container');
  const displayUsername = document.getElementById('display-username');
  const btnLogout = document.getElementById('btn-logout');

  const navCaixa = document.getElementById('nav-caixa');
  const navAdmin = document.getElementById('nav-admin');
  const navRelatorios = document.getElementById('nav-relatorios');
  const viewCaixa = document.getElementById('view-caixa');
  const viewAdmin = document.getElementById('view-admin');
  const viewRelatorios = document.getElementById('view-relatorios');

  // --- VARIÁVEIS PARA ELEMENTOS INTERNOS (serão mapeadas após o login) ---
  let produtosGrid, pedidoAtualItens, totalValor, btnPagar, btnCancelar, modalPagamento,
    totalModalValor, btnFecharModal, metodosPagamentoContainer, dinheiroSecao,
    valorPagoInput, trocoValor, btnConfirmarDinheiro, formProduto, produtoIdInput,
    produtoNomeInput, produtoPrecoInput, produtoCategoriaInput, btnSalvar,
    btnCancelarEdicao, tabelaProdutosBody, dataInicioInput, dataFimInput,
    btnGerarRelatorio, resumoTotalFaturado, resumoNumVendas, resumoTicketMedio,
    tabelaVendasBody, btnExportarCSV, btnAbrirModalReset, modalReset, btnFecharModalReset,
    inputConfirmarReset, btnConfirmarResetFinal, reciboIdVenda, reciboData, reciboItens,
    reciboQtdTotal, reciboValorTotal, reciboPagamento, linhaTroco, reciboTroco;

  // --- LÓGICA DE LOGIN/LOGOUT ---

  async function handleLogin(event) {
    event.preventDefault();
    loginError.classList.add('hidden');
    const nome_usuario = usernameInput.value;
    const senha = passwordInput.value;

    const loginButton = loginForm.querySelector('button[type="submit"]');
    if (loginButton) loginButton.disabled = true;

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({nome_usuario, senha})
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erro ${response.status} do servidor.`);
      }

      loginContainer.classList.add('hidden');
      appContainer.classList.remove('hidden');
      displayUsername.textContent = `Usuário: ${data.usuario.nome_usuario}`;

      await carregarViews();
      navegarPara('view-caixa');

    } catch (error) {
      loginError.textContent = error.message || "Falha na comunicação com o servidor.";
      loginError.classList.remove('hidden');
      if (loginButton) loginButton.disabled = false;
    }
  }

  function handleLogout() {
    location.reload();
  }

  // --- CARREGAMENTO DINÂMICO DO HTML DAS VIEWS ---
  async function carregarViews() {
    try {
      const [caixaRes, adminRes, relatoriosRes] = await Promise.all([
        fetch('./views/caixa.html'),
        fetch('./views/admin.html'),
        fetch('./views/relatorios.html')
      ]);

      viewCaixa.innerHTML = await caixaRes.text();
      viewAdmin.innerHTML = await adminRes.text();
      viewRelatorios.innerHTML = await relatoriosRes.text();

      remapearElementosPosLogin();
      adicionarEventosPosLogin();

    } catch (error) {
      console.error("Erro ao carregar as views HTML:", error);
      appContainer.innerHTML = `<h1>Erro Crítico: Não foi possível carregar a interface.</h1>`;
    }
  }

  function remapearElementosPosLogin() {
    // Caixa e Modal de Pagamento
    produtosGrid = document.getElementById('produtos-grid');
    pedidoAtualItens = document.getElementById('pedido-atual-itens');
    totalValor = document.getElementById('total-valor');
    btnPagar = document.getElementById('btn-pagar');
    btnCancelar = document.getElementById('btn-cancelar');
    modalPagamento = document.getElementById('modal-pagamento');
    totalModalValor = document.getElementById('total-modal-valor');
    btnFecharModal = document.getElementById('btn-fechar-modal');
    metodosPagamentoContainer = document.querySelector('#modal-pagamento .metodos-pagamento');
    dinheiroSecao = document.getElementById('dinheiro-secao');
    valorPagoInput = document.getElementById('valor-pago');
    trocoValor = document.getElementById('troco-valor');
    btnConfirmarDinheiro = document.getElementById('btn-confirmar-dinheiro');

    // Admin
    formProduto = document.getElementById('form-produto');
    produtoIdInput = document.getElementById('produto-id');
    produtoNomeInput = document.getElementById('produto-nome');
    produtoPrecoInput = document.getElementById('produto-preco');
    produtoCategoriaInput = document.getElementById('produto-categoria');
    btnSalvar = document.getElementById('btn-salvar-produto');
    btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');
    tabelaProdutosBody = document.querySelector('#tabela-produtos-body');

    // Relatórios e Modal de Reset
    dataInicioInput = document.getElementById('data-inicio');
    dataFimInput = document.getElementById('data-fim');
    btnGerarRelatorio = document.getElementById('btn-gerar-relatorio');
    resumoTotalFaturado = document.getElementById('resumo-total-faturado');
    resumoNumVendas = document.getElementById('resumo-num-vendas');
    resumoTicketMedio = document.getElementById('resumo-ticket-medio');
    tabelaVendasBody = document.getElementById('tabela-vendas-body');
    btnExportarCSV = document.getElementById('btn-exportar-csv');
    btnAbrirModalReset = document.getElementById('btn-abrir-modal-reset');
    modalReset = document.getElementById('modal-reset');
    btnFecharModalReset = document.getElementById('btn-fechar-modal-reset');
    inputConfirmarReset = document.getElementById('input-confirmar-reset');
    btnConfirmarResetFinal = document.getElementById('btn-confirmar-reset-final');

    // Recibo de Impressão
    reciboIdVenda = document.getElementById('recibo-id-venda');
    reciboData = document.getElementById('recibo-data');
    reciboItens = document.getElementById('recibo-itens');
    reciboQtdTotal = document.getElementById('recibo-qtd-total');
    reciboValorTotal = document.getElementById('recibo-valor-total');
    reciboPagamento = document.getElementById('recibo-pagamento');
    linhaTroco = document.getElementById('linha-troco');
    reciboTroco = document.getElementById('recibo-troco');
  }

  function adicionarEventosPosLogin() {
    navCaixa.addEventListener('click', () => navegarPara('view-caixa'));
    navAdmin.addEventListener('click', () => navegarPara('view-admin'));
    navRelatorios.addEventListener('click', () => navegarPara('view-relatorios'));

    btnPagar.addEventListener('click', abrirModalPagamento);
    btnCancelar.addEventListener('click', cancelarPedido);
    btnFecharModal.addEventListener('click', fecharModalPagamento);
    valorPagoInput.addEventListener('input', calcularTroco);
    btnConfirmarDinheiro.addEventListener('click', () => finalizarVenda('Dinheiro'));
    metodosPagamentoContainer.addEventListener('click', (event) => {
      const target = event.target;
      if (!target.classList.contains('btn-metodo') || target.id === 'btn-confirmar-dinheiro') return;
      const metodo = target.dataset.metodo;
      if (metodo === 'Dinheiro') {
        dinheiroSecao.classList.remove('hidden');
        metodosPagamentoContainer.querySelectorAll('.btn-metodo').forEach(btn => {
          if (btn.id !== 'btn-confirmar-dinheiro') btn.classList.add('hidden');
        });
        btnConfirmarDinheiro.classList.remove('hidden');
        valorPagoInput.focus();
      } else {
        finalizarVenda(metodo);
      }
    });

    btnSalvar.addEventListener('click', salvarProduto);
    btnCancelarEdicao.addEventListener('click', limparFormulario);
    tabelaProdutosBody.addEventListener('click', (event) => {
      const target = event.target;
      const tr = target.closest('tr');
      if (!tr || !tr.dataset.produto) return;
      const produto = JSON.parse(tr.dataset.produto);
      if (target.classList.contains('btn-editar')) preencherFormularioParaEdicao(produto);
      else if (target.classList.contains('btn-excluir')) deletarProduto(produto.id);
    });

    btnGerarRelatorio.addEventListener('click', gerarRelatorioVendas);
    btnExportarCSV.addEventListener('click', exportarParaCSV);
    btnAbrirModalReset.addEventListener('click', abrirModalReset);
    btnFecharModalReset.addEventListener('click', fecharModalReset);
    inputConfirmarReset.addEventListener('input', validarResetConfirm);
    btnConfirmarResetFinal.addEventListener('click', executarResetSistema);
  }

  // --- FUNÇÕES DE NAVEGAÇÃO, CAIXA, ADMIN, RELATÓRIOS ---

  function navegarPara(viewElementId) {
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(viewElementId).classList.remove('hidden');
    const navBtn = document.getElementById(`nav-${viewElementId.split('-')[1]}`);
    if (navBtn) navBtn.classList.add('active');

    if (viewElementId === 'view-caixa') carregarProdutos();
    else if (viewElementId === 'view-admin') carregarProdutosAdmin();
    else if (viewElementId === 'view-relatorios') {
      const hoje = new Date().toISOString().split('T')[0];
      dataInicioInput.value = hoje;
      dataFimInput.value = hoje;
      gerarRelatorioVendas();
    }
  }

  async function carregarProdutos() {
    try {
      const response = await fetch(`${API_URL}/produtos`);
      if (!response.ok) throw new Error('Erro ao buscar produtos');
      const data = await response.json();
      produtosGrid.innerHTML = '';
      if (data.data.length === 0) {
        produtosGrid.innerHTML = '<p>Nenhum produto cadastrado.</p>';
        return;
      }
      data.data.forEach(produto => {
        const btn = document.createElement('button');
        btn.className = 'produto-btn';
        btn.innerHTML = `${produto.nome}<span class="preco">${produto.preco.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })}</span>`;
        btn.onclick = () => adicionarAoPedido(produto);
        produtosGrid.appendChild(btn);
      });
    } catch (error) {
      console.error('Falha ao carregar produtos:', error);
      produtosGrid.innerHTML = '<p>Não foi possível carregar os produtos. O servidor está rodando?</p>';
    }
  }

  function adicionarAoPedido(produto) {
    pedidoAtual.push(produto);
    atualizarPedido();
  }

  function atualizarPedido() {
    pedidoAtualItens.innerHTML = '';
    totalPedido = 0;
    if (pedidoAtual.length === 0) {
      pedidoAtualItens.innerHTML = '<p>Nenhum item adicionado.</p>';
      totalValor.textContent = 'R$ 0,00';
      return;
    }
    pedidoAtual.forEach(item => {
      const itemElemento = document.createElement('div');
      itemElemento.className = 'item-pedido';
      itemElemento.innerHTML = `<span>${item.nome}</span><span>${item.preco.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })}</span>`;
      pedidoAtualItens.appendChild(itemElemento);
      totalPedido += item.preco;
    });
    totalValor.textContent = totalPedido.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  }

  function cancelarPedido() {
    pedidoAtual = [];
    atualizarPedido();
  }

  async function finalizarVenda(formaPagamento) {
    if (pedidoAtual.length === 0) return;
    const vendaData = {
      total: totalPedido,
      forma_pagamento: formaPagamento,
      id_caixa: ID_CAIXA,
      itens: pedidoAtual.map(item => ({id: item.id, nome: item.nome, preco: item.preco}))
    };
    try {
      const response = await fetch(`${API_URL}/vendas`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(vendaData),
      });
      if (!response.ok) throw new Error('Erro ao registrar a venda.');
      const result = await response.json();
      alert(`Venda #${result.id_venda} registrada com sucesso!`);
      fecharModalPagamento();
      cancelarPedido();
    } catch (error) {
      console.error('Falha ao finalizar venda:', error);
      alert('Ocorreu um erro. A venda não foi registrada.');
    }
  }

  function abrirModalPagamento() {
    if (pedidoAtual.length === 0) {
      alert("Adicione itens ao pedido antes de pagar!");
      return;
    }
    dinheiroSecao.classList.add('hidden');
    metodosPagamentoContainer.querySelectorAll('.btn-metodo').forEach(btn => btn.classList.remove('hidden'));
    btnConfirmarDinheiro.classList.add('hidden');
    valorPagoInput.value = '';
    trocoValor.textContent = 'R$ 0,00';
    totalModalValor.textContent = totalValor.textContent;
    modalPagamento.classList.remove('hidden');
  }

  function fecharModalPagamento() {
    modalPagamento.classList.add('hidden');
  }

  function calcularTroco() {
    const valorPago = parseFloat(valorPagoInput.value) || 0;
    btnConfirmarDinheiro.disabled = valorPago < totalPedido;
    if (valorPago < totalPedido) {
      trocoValor.textContent = 'VALOR INSUFICIENTE';
      return;
    }
    const troco = valorPago - totalPedido;
    trocoValor.textContent = troco.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  }

  async function carregarProdutosAdmin() {
    try {
      const response = await fetch(`${API_URL}/produtos`);
      const data = await response.json();
      tabelaProdutosBody.innerHTML = '';
      data.data.forEach(produto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
                    <td>${produto.nome}</td>
                    <td>${produto.preco.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
                    <td>${produto.categoria}</td>
                    <td>
                        <button class="btn-editar">Editar</button>
                        <button class="btn-excluir">Excluir</button>
                    </td>
                `;
        tr.dataset.produto = JSON.stringify(produto);
        tabelaProdutosBody.appendChild(tr);
      });
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      tabelaProdutosBody.innerHTML = '<tr><td colspan="4">Não foi possível carregar os produtos.</td></tr>';
    }
  }

  async function salvarProduto(event) {
    event.preventDefault();
    const id = produtoIdInput.value;
    const nome = produtoNomeInput.value;
    const preco = parseFloat(produtoPrecoInput.value);
    const categoria = produtoCategoriaInput.value;
    if (!nome || isNaN(preco) || !categoria) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }
    const produtoData = {nome, preco, categoria};
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/produtos/${id}` : `${API_URL}/produtos`;
    try {
      const response = await fetch(url, {
        method: method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(produtoData)
      });
      if (!response.ok) throw new Error("Erro ao salvar o produto.");
      limparFormulario();
      await carregarProdutosAdmin();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Não foi possível salvar o produto.");
    }
  }

  function preencherFormularioParaEdicao(produto) {
    produtoIdInput.value = produto.id;
    produtoNomeInput.value = produto.nome;
    produtoPrecoInput.value = produto.preco;
    produtoCategoriaInput.value = produto.categoria;
    btnCancelarEdicao.classList.remove('hidden');
    produtoNomeInput.focus();
  }

  async function deletarProduto(id) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      const response = await fetch(`${API_URL}/produtos/${id}`, {method: 'DELETE'});
      if (!response.ok) throw new Error("Erro ao deletar o produto.");
      await carregarProdutosAdmin();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Não foi possível deletar o produto.");
    }
  }

  function limparFormulario() {
    formProduto.reset();
    produtoIdInput.value = '';
    btnCancelarEdicao.classList.add('hidden');
    produtoNomeInput.focus();
  }

  async function gerarRelatorioVendas() {
    const dataInicio = dataInicioInput.value;
    const dataFim = dataFimInput.value;
    if (!dataInicio || !dataFim) {
      alert("Por favor, selecione as datas de início e fim.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/relatorios/vendas?dataInicio=${dataInicio}&dataFim=${dataFim}`);
      if (!response.ok) throw new Error("Falha ao buscar relatório.");
      const relatorio = await response.json();

      dadosRelatorioAtual = relatorio.vendas;

      resumoTotalFaturado.textContent = relatorio.resumo.totalFaturado.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
      resumoNumVendas.textContent = relatorio.resumo.numeroDeVendas;
      resumoTicketMedio.textContent = relatorio.resumo.ticketMedio.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });

      tabelaVendasBody.innerHTML = '';
      if (relatorio.vendas.length === 0) {
        tabelaVendasBody.innerHTML = '<tr><td colspan="5">Nenhuma venda encontrada para este período.</td></tr>';
        return;
      }
      relatorio.vendas.forEach(venda => {
        const tr = document.createElement('tr');
        const dataFormatada = new Date(venda.data_hora + 'Z').toLocaleString('pt-BR');
        const itens = `"${JSON.parse(venda.itens).map(item => item.nome).join(', ')}"`;
        tr.innerHTML = `
                    <td>${venda.id}</td>
                    <td>${dataFormatada}</td>
                    <td>${itens.replace(/"/g, '')}</td>
                    <td>${venda.forma_pagamento}</td>
                    <td>${venda.total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
                `;
        tabelaVendasBody.appendChild(tr);
      });
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      dadosRelatorioAtual = [];
      tabelaVendasBody.innerHTML = '<tr><td colspan="5">Ocorreu um erro ao buscar os dados.</td></tr>';
    }
  }

  function exportarParaCSV() {
    if (dadosRelatorioAtual.length === 0) {
      alert("Não há dados para exportar. Gere um relatório primeiro.");
      return;
    }
    const headers = ['ID Venda', 'Data/Hora', 'Itens', 'Forma de Pagamento', 'Total'];
    const rows = dadosRelatorioAtual.map(venda => {
      const dataFormatada = new Date(venda.data_hora + 'Z').toLocaleString('pt-BR');
      const itensFormatados = `"${JSON.parse(venda.itens).map(item => item.nome).join(', ')}"`;
      const totalFormatado = venda.total.toFixed(2).replace('.', ',');
      return [venda.id, dataFormatada, itensFormatados, venda.forma_pagamento, totalFormatado].join(';');
    });
    const csvContent = [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const dataInicio = dataInicioInput.value;
      const dataFim = dataFimInput.value;
      link.setAttribute("href", url);
      link.setAttribute("download", `relatorio-vendas_${dataInicio}_a_${dataFim}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // --- INICIALIZAÇÃO E EVENTOS GLOBAIS ---
  loginForm.addEventListener('submit', handleLogin);
  btnLogout.addEventListener('click', handleLogout);
});
