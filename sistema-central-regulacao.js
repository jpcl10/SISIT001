// Variáveis globais
let dadosFiltrados = [];
let paginaAtual = 1;
const itensPorPagina = 10;
let usuarioLogado = null;

// Função executada quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  // Carregar dados do usuário
  usuarioLogado = carregarDadosUsuario();
  
  // Verificar se o usuário tem acesso à interface da Central de Regulação
  if (usuarioLogado) {
    const perfilPermitido = ['regulador', 'admin', 'gestor'].includes(usuarioLogado.perfil);
    if (!perfilPermitido) {
      console.error('Usuário não tem permissão para acessar a interface da Central de Regulação');
      setTimeout(() => {
        alert('Seu perfil não tem autorização para acessar a Central de Regulação.');
        window.location.href = 'login-central-regulacao.html';
      }, 500);
      return;
    }
    
    // Adicionar informação da unidade ao cabeçalho
    adicionarInfoUnidade(usuarioLogado);
  }
  
  // Inicializar componentes que não dependem de Chart.js
  adicionarEventosMenu();
  adicionarEventosFiltros();
  adicionarEventosTabela();
  adicionarEventosModal();
  atualizarTimestamp();
  
  // Configurar evento de logout
  configurarLogout();

  // Ajustar interface com base no perfil do usuário
  ajustarInterfacePorPerfil();
  
  // Verificar se o Chart.js está carregado antes de inicializar os gráficos
  if (typeof Chart !== 'undefined') {
    inicializarGraficos();
  } else {
    // Esperar o script Chart.js carregar
    window.addEventListener('load', function() {
      if (typeof Chart !== 'undefined') {
        inicializarGraficos();
      } else {
        console.warn('Chart.js não foi carregado. Os gráficos não serão exibidos.');
        // Exibir mensagem alternativa nos locais dos gráficos
        document.querySelectorAll('.grafico').forEach(grafico => {
          grafico.innerHTML = '<p class="erro-grafico">Não foi possível carregar os gráficos. Verifique sua conexão.</p>';
        });
      }
    });
  }
  
  // Simular atualização automática a cada 5 minutos
  setInterval(atualizarDados, 300000);
});

/**
 * Adiciona informação da unidade do usuário ao cabeçalho
 */
function adicionarInfoUnidade(usuario) {
  if (!usuario || !usuario.unidade) return;
  
  const userElement = document.getElementById('user-name');
  if (userElement) {
    const unidadeLabel = document.createElement('small');
    unidadeLabel.className = 'unidade-label';
    unidadeLabel.textContent = usuario.unidade;
    unidadeLabel.style.display = 'block';
    unidadeLabel.style.fontSize = '0.7rem';
    unidadeLabel.style.opacity = '0.8';
    unidadeLabel.style.marginTop = '2px';
    
    // Adicionar após o nome do usuário
    userElement.parentNode.insertBefore(unidadeLabel, userElement.nextSibling);
  }
}

/**
 * Carrega os dados do usuário da sessão
 * @returns {Object|null} Dados do usuário ou null se não encontrado
 */
function carregarDadosUsuario() {
  try {
    const usuarioStr = sessionStorage.getItem('usuarioAtual');
    
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      console.log('Usuário logado:', usuario);
      
      // Atualizar nome e perfil na interface
      const userNameElement = document.getElementById('user-name');
      if (userNameElement) {
        userNameElement.textContent = usuario.nome || 'Usuário';
      }
      
      const userRoleElement = document.getElementById('user-role');
      if (userRoleElement) {
        let descricaoPerfil = 'Usuário';
        
        switch(usuario.perfil) {
          case 'admin':
            descricaoPerfil = 'Administrador';
            break;
          case 'regulador':
            descricaoPerfil = 'Médico Regulador';
            break;
          case 'gestor':
            descricaoPerfil = 'Gestor';
            break;
          default:
            descricaoPerfil = usuario.perfil.charAt(0).toUpperCase() + usuario.perfil.slice(1);
        }
        
        userRoleElement.textContent = descricaoPerfil;
        
        // Adicionar classe de estilo com base no perfil
        userRoleElement.className = userRoleElement.className.replace(/perfil-\w+/g, '').trim();
        userRoleElement.classList.add(`perfil-${usuario.perfil}`);
        
        // Adicionar estilos de cores para diferentes perfis
        const style = document.createElement('style');
        style.textContent = `
          #user-role.perfil-admin {
            background-color: #dc3545;
          }
          
          #user-role.perfil-regulador {
            background-color: #17a2b8;
          }
          
          #user-role.perfil-gestor {
            background-color: #fd7e14;
          }
        `;
        document.head.appendChild(style);
      }
      
      return usuario;
    } else {
      console.warn('Nenhum usuário logado. Redirecionando para login...');
      setTimeout(() => {
        window.location.href = 'login-central-regulacao.html';
      }, 1000);
      return null;
    }
  } catch (e) {
    console.error('Erro ao carregar dados do usuário:', e);
    return null;
  }
}

/**
 * Ajusta a interface com base no perfil e permissões do usuário
 */
function ajustarInterfacePorPerfil() {
  if (!usuarioLogado) return;
  
  const perfil = usuarioLogado.perfil;
  const permissoes = usuarioLogado.permissoes || [];
  
  console.log(`Ajustando interface para perfil: ${perfil}`, permissoes);
  
  // Ajustar visibilidade dos itens do menu
  document.querySelectorAll('.menu-item').forEach(item => {
    const perfisPermitidos = item.getAttribute('data-role')?.split(' ') || [];
    const visivel = perfisPermitidos.includes(perfil) || 
                   perfisPermitidos.includes('all') || 
                   perfil === 'admin';
                   
    item.style.display = visivel ? '' : 'none';
  });
  
  // Ajustar elementos com base nas permissões específicas
  document.querySelectorAll('[data-requer-permissao]').forEach(elemento => {
    const permissaoRequerida = elemento.getAttribute('data-requer-permissao');
    const temPermissao = permissoes.includes(permissaoRequerida) || 
                         permissoes.includes('*');
                         
    elemento.style.display = temPermissao ? '' : 'none';
  });
  
  // Personalizar a interface baseada no perfil
  switch(perfil) {
    case 'gestor':
      // Destacar seção de cotas e relatórios para gestores
      document.querySelectorAll('.grafico-container h3, .tabela-cotas').forEach(el => {
        el.style.position = 'relative';
        if (!el.querySelector('.badge-gestor')) {
          const badge = document.createElement('span');
          badge.className = 'badge-gestor';
          badge.textContent = 'Gestão';
          badge.style.position = 'absolute';
          badge.style.right = '10px';
          badge.style.top = '0';
          badge.style.fontSize = '0.7rem';
          badge.style.padding = '2px 8px';
          badge.style.backgroundColor = '#fd7e14';
          badge.style.color = 'white';
          badge.style.borderRadius = '10px';
          el.appendChild(badge);
        }
      });
      break;
      
    case 'regulador':
      // Destacar as ações de regulação
      document.querySelectorAll('.btn-grande.aprovar, .btn-grande.negar, .btn-grande.devolver').forEach(btn => {
        btn.style.fontWeight = 'bold';
        btn.style.transform = 'scale(1.05)';
      });
      break;
  }
}

// Função para inicializar os gráficos do dashboard
function inicializarGraficos() {
  // Gráfico de Status das Solicitações
  const ctxStatus = document.getElementById('statusChart').getContext('2d');
  const statusChart = new Chart(ctxStatus, {
    type: 'pie',
    data: {
      labels: ['Pendentes', 'Aprovadas', 'Negadas', 'Devolvidas'],
      datasets: [{
        data: [128, 187, 42, 30],
        backgroundColor: [
          '#ffc107',
          '#28a745',
          '#dc3545',
          '#6c757d'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        }
      }
    }
  });
  
  // Gráfico de Solicitações por Tipo
  const ctxTipos = document.getElementById('tiposChart').getContext('2d');
  const tiposChart = new Chart(ctxTipos, {
    type: 'bar',
    data: {
      labels: ['Exames', 'Consultas', 'Procedimentos', 'Medicamentos', 'Internações'],
      datasets: [{
        label: 'Quantidade',
        data: [145, 102, 58, 47, 35],
        backgroundColor: 'rgba(0, 107, 166, 0.7)',
        borderColor: 'rgba(0, 107, 166, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Função para adicionar eventos aos links do menu
function adicionarEventosMenu() {
  const menuItems = document.querySelectorAll('.menu-item a');
  
  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remover classe 'active' de todos os itens
      document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Adicionar classe 'active' ao item clicado
      this.parentElement.classList.add('active');
      
      // Obter o ID da seção a ser exibida
      const targetId = this.getAttribute('href').substring(1);
      
      // Ocultar todas as seções
      document.querySelectorAll('.section-container').forEach(section => {
        section.classList.add('hidden');
      });
      
      // Exibir a seção alvo
      const targetSection = document.getElementById(targetId + '-section');
      if (targetSection) {
        targetSection.classList.remove('hidden');
      }
    });
  });
}

// Função para adicionar eventos aos filtros
function adicionarEventosFiltros() {
  // Filtro global por período
  document.getElementById('periodo').addEventListener('change', function() {
    atualizarDados();
  });
  
  // Filtro global por unidade
  document.getElementById('unidade').addEventListener('change', function() {
    atualizarDados();
  });
  
  // Botão de atualizar dados
  document.querySelector('.btn-atualizar').addEventListener('click', function() {
    atualizarDados();
  });
  
  // Filtros avançados da fila de solicitações
  const filtrosAvancados = document.querySelectorAll('.filtros-avancados select');
  filtrosAvancados.forEach(filtro => {
    filtro.addEventListener('change', function() {
      filtrarSolicitacoes();
    });
  });
  
  // Campo de busca
  document.getElementById('busca-protocolo').addEventListener('input', function() {
    filtrarSolicitacoes();
  });
  
  // Botão de buscar
  document.querySelector('.btn-buscar').addEventListener('click', function() {
    filtrarSolicitacoes();
  });
}

// Função para adicionar eventos às ações da tabela
function adicionarEventosTabela() {
  // Botões de visualizar
  document.querySelectorAll('.btn-acao.visualizar').forEach(btn => {
    btn.addEventListener('click', function() {
      const protocolo = this.closest('tr').querySelector('td:first-child').textContent;
      abrirModal(protocolo);
    });
  });
  
  // Botões de aprovar
  document.querySelectorAll('.btn-acao.aprovar').forEach(btn => {
    btn.addEventListener('click', function() {
      const protocolo = this.closest('tr').querySelector('td:first-child').textContent;
      aprovarSolicitacao(protocolo);
    });
  });
  
  // Botões de negar
  document.querySelectorAll('.btn-acao.negar').forEach(btn => {
    btn.addEventListener('click', function() {
      const protocolo = this.closest('tr').querySelector('td:first-child').textContent;
      negarSolicitacao(protocolo);
    });
  });
  
  // Botões de devolver
  document.querySelectorAll('.btn-acao.devolver').forEach(btn => {
    btn.addEventListener('click', function() {
      const protocolo = this.closest('tr').querySelector('td:first-child').textContent;
      devolverSolicitacao(protocolo);
    });
  });
  
  // Paginação
  document.querySelector('.btn-pagina.anterior').addEventListener('click', function() {
    if (paginaAtual > 1) {
      paginaAtual--;
      renderizarPaginacao();
    }
  });
  
  document.querySelector('.btn-pagina.proxima').addEventListener('click', function() {
    const totalPaginas = Math.ceil(dadosFiltrados.length / itensPorPagina);
    if (paginaAtual < totalPaginas) {
      paginaAtual++;
      renderizarPaginacao();
    }
  });
}

// Função para adicionar eventos ao modal
function adicionarEventosModal() {
  // Fechar modal ao clicar no botão de fechar
  document.querySelector('.fechar-modal').addEventListener('click', () => {
    document.getElementById('modal-detalhes').style.display = 'none';
  });
  
  // Fechar modal ao clicar fora da área do conteúdo
  document.getElementById('modal-detalhes').addEventListener('click', function(e) {
    if (e.target === this) {
      this.style.display = 'none';
    }
  });
  
  // Botões de ação no modal
  document.getElementById('btn-aprovar-solicitacao').addEventListener('click', function() {
    const protocolo = document.getElementById('modal-protocolo').textContent;
    document.getElementById('modal-detalhes').style.display = 'none';
    aprovarSolicitacao(protocolo);
  });
  
  document.getElementById('btn-negar-solicitacao').addEventListener('click', function() {
    const protocolo = document.getElementById('modal-protocolo').textContent;
    document.getElementById('modal-detalhes').style.display = 'none';
    negarSolicitacao(protocolo);
  });
  
  document.getElementById('btn-devolver-solicitacao').addEventListener('click', function() {
    const protocolo = document.getElementById('modal-protocolo').textContent;
    document.getElementById('modal-detalhes').style.display = 'none';
    devolverSolicitacao(protocolo);
  });
  
  // Eventos para os novos botões
  document.getElementById('btn-agendar-solicitacao').addEventListener('click', function() {
    const protocolo = document.getElementById('modal-protocolo').textContent;
    document.getElementById('modal-detalhes').style.display = 'none';
    agendarSolicitacao(protocolo);
  });
  
  document.getElementById('btn-cancelar-solicitacao').addEventListener('click', function() {
    const protocolo = document.getElementById('modal-protocolo').textContent;
    document.getElementById('modal-detalhes').style.display = 'none';
    cancelarSolicitacao(protocolo);
  });
  
  document.getElementById('btn-concluir-solicitacao').addEventListener('click', function() {
    const protocolo = document.getElementById('modal-protocolo').textContent;
    document.getElementById('modal-detalhes').style.display = 'none';
    concluirSolicitacao(protocolo);
  });
  
  document.getElementById('btn-repriorizar-solicitacao').addEventListener('click', function() {
    const protocolo = document.getElementById('modal-protocolo').textContent;
    const novaPrioridade = document.getElementById('nova-prioridade').value;
    
    if (novaPrioridade) {
      document.getElementById('modal-detalhes').style.display = 'none';
      repriorizarSolicitacao(protocolo, novaPrioridade);
    } else {
      alert('Selecione uma prioridade válida.');
    }
  });
}

// Função para abrir modal com detalhes da solicitação
function abrirModal(protocolo) {
  console.log(`Abrindo modal para solicitação ${protocolo}`);
  
  // Buscar os dados da solicitação
  const solicitacao = buscarSolicitacaoPorProtocolo(protocolo);
  
  if (!solicitacao) {
    console.error(`Solicitação ${protocolo} não encontrada.`);
    alertaTemporario(`Erro ao carregar dados da solicitação ${protocolo}.`, 'erro');
    return;
  }
  
  // Preencher os dados no modal
  document.getElementById('modal-protocolo').textContent = protocolo;
  document.getElementById('det-paciente-nome').textContent = solicitacao.paciente.nome;
  document.getElementById('det-paciente-cns').textContent = solicitacao.paciente.cns;
  document.getElementById('det-paciente-idade').textContent = `${solicitacao.paciente.idade} anos`;
  document.getElementById('det-paciente-ubs').textContent = solicitacao.unidade;
  
  document.getElementById('det-tipo').textContent = solicitacao.tipo;
  document.getElementById('det-data').textContent = formatarData(solicitacao.data);
  document.getElementById('det-solicitante').textContent = solicitacao.solicitante;
  
  // Atualizar classe de prioridade
  const prioridadeElement = document.getElementById('det-prioridade');
  prioridadeElement.textContent = capitalizarPrimeiraLetra(solicitacao.prioridade);
  prioridadeElement.className = '';
  prioridadeElement.classList.add(`tag-${solicitacao.prioridade}`);
  
  document.getElementById('det-cid').textContent = solicitacao.cid;
  document.getElementById('det-justificativa').textContent = solicitacao.justificativa;
  
  // Preencher histórico
  const historicoContainer = document.getElementById('det-historico');
  historicoContainer.innerHTML = '';
  
  if (solicitacao.historico && solicitacao.historico.length > 0) {
    solicitacao.historico.forEach(item => {
      const historicoItem = document.createElement('div');
      historicoItem.className = 'historico-item';
      
      const dataSpan = document.createElement('span');
      dataSpan.className = 'hist-data';
      dataSpan.textContent = formatarData(item.data);
      
      const descricaoSpan = document.createElement('span');
      descricaoSpan.className = 'hist-descricao';
      descricaoSpan.textContent = item.descricao;
      
      historicoItem.appendChild(dataSpan);
      historicoItem.appendChild(descricaoSpan);
      historicoContainer.appendChild(historicoItem);
    });
  } else {
    historicoContainer.innerHTML = '<p class="sem-historico">Nenhum histórico disponível</p>';
  }
  
  // Limpar campo de observações
  document.getElementById('observacoes-regulador').value = '';
  
  // Atualizar o select de prioridade no modal
  document.getElementById('nova-prioridade').value = solicitacao.prioridade;
  
  // Exibir o modal
  document.getElementById('modal-detalhes').style.display = 'block';
}

/**
 * Formata uma data ISO para o formato brasileiro (dd/mm/aaaa)
 * @param {string} data - Data em formato ISO ou string
 * @returns {string} Data formatada
 */
function formatarData(data) {
  try {
    if (!data) return 'Data não informada';
    
    // Verificar se a data já está no formato dd/mm/aaaa
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
      return data;
    }
    
    const dataObj = new Date(data);
    if (isNaN(dataObj.getTime())) {
      return data;  // Retorna o valor original se não for uma data válida
    }
    
    return `${String(dataObj.getDate()).padStart(2, '0')}/${String(dataObj.getMonth() + 1).padStart(2, '0')}/${dataObj.getFullYear()}`;
  } catch (e) {
    console.error('Erro ao formatar data:', e);
    return data;
  }
}

/**
 * Converte uma string para ter a primeira letra maiúscula
 * @param {string} texto - Texto a ser convertido
 * @returns {string} Texto com primeira letra maiúscula
 */
function capitalizarPrimeiraLetra(texto) {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// Função para aprovar uma solicitação
function aprovarSolicitacao(protocolo) {
  console.log(`Aprovando solicitação: ${protocolo}`);
  
  // Atualizar o status da solicitação para "aprovado"
  atualizarStatusSolicitacao(protocolo, 'aprovado', null, () => {
    notificarUBS('aprovado', protocolo);
    atualizarDados();
  });
}

// Função para negar uma solicitação
function negarSolicitacao(protocolo) {
  console.log(`Negando solicitação: ${protocolo}`);
  
  // Exibir modal para justificativa
  exibirModalJustificativa(protocolo, 'negar', (justificativa) => {
    atualizarStatusSolicitacao(protocolo, 'negado', justificativa, () => {
      notificarUBS('negado', protocolo, justificativa);
      atualizarDados();
    });
  });
}

// Função para devolver uma solicitação para ajustes na UBS
function devolverSolicitacao(protocolo) {
  console.log(`Devolvendo solicitação: ${protocolo}`);
  
  // Exibir modal para justificativa
  exibirModalJustificativa(protocolo, 'devolver', (justificativa) => {
    atualizarStatusSolicitacao(protocolo, 'devolvido', justificativa, () => {
      notificarUBS('devolvido', protocolo, justificativa);
      atualizarDados();
    });
  });
}

// Novas funções para implementar as ações adicionais

// Função para agendar uma solicitação
function agendarSolicitacao(protocolo) {
  console.log(`Agendando solicitação: ${protocolo}`);
  
  // Exibir modal para agendamento
  exibirModalAgendamento(protocolo, (dadosAgendamento) => {
    atualizarStatusSolicitacao(protocolo, 'agendado', null, () => {
      // Salvar dados do agendamento
      salvarDadosAgendamento(protocolo, dadosAgendamento);
      notificarUBS('agendado', protocolo, null, dadosAgendamento);
      atualizarDados();
    });
  });
}

// Função para cancelar uma solicitação
function cancelarSolicitacao(protocolo) {
  console.log(`Cancelando solicitação: ${protocolo}`);
  
  // Exibir modal para justificativa de cancelamento
  exibirModalJustificativa(protocolo, 'cancelar', (justificativa) => {
    atualizarStatusSolicitacao(protocolo, 'cancelado', justificativa, () => {
      notificarUBS('cancelado', protocolo, justificativa);
      atualizarDados();
    });
  });
}

// Função para marcar uma solicitação como concluída
function concluirSolicitacao(protocolo) {
  console.log(`Concluindo solicitação: ${protocolo}`);
  
  // Exibir modal para data e observações
  exibirModalConclusao(protocolo, (dadosConclusao) => {
    atualizarStatusSolicitacao(protocolo, 'concluido', dadosConclusao.observacoes, () => {
      // Salvar data de conclusão
      salvarDataConclusao(protocolo, dadosConclusao.data);
      notificarUBS('concluido', protocolo);
      atualizarDados();
    });
  });
}

// Função para repriorizar manualmente uma solicitação
function repriorizarSolicitacao(protocolo, novaPrioridade) {
  console.log(`Repriorizando solicitação ${protocolo} para ${novaPrioridade}`);
  
  // Atualizar a prioridade da solicitação
  atualizarPrioridadeSolicitacao(protocolo, novaPrioridade, () => {
    notificarUBS('repriorizado', protocolo, null, { prioridade: novaPrioridade });
    atualizarDados();
  });
}

// Função para validar dados obrigatórios da solicitação
function validarSolicitacao(protocolo) {
  console.log(`Validando dados da solicitação: ${protocolo}`);
  
  // Buscar dados da solicitação
  const solicitacao = buscarSolicitacaoPorProtocolo(protocolo);
  
  // Verificar campos obrigatórios
  const camposObrigatorios = ['historico', 'cid', 'justificativa'];
  const camposFaltantes = camposObrigatorios.filter(campo => !solicitacao[campo]);
  
  if (camposFaltantes.length > 0) {
    console.warn(`Solicitação ${protocolo} com campos incompletos: ${camposFaltantes.join(', ')}`);
    return {
      valido: false,
      camposFaltantes: camposFaltantes
    };
  }
  
  return {
    valido: true
  };
}

// Funções auxiliares

// Exibir modal para justificativa
function exibirModalJustificativa(protocolo, acao, callback) {
  // Verificar se já existe um modal na página
  let modal = document.getElementById('modal-justificativa');
  
  // Se não existir, criar um novo
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-justificativa';
    modal.className = 'modal';
    
    const modalHTML = `
      <div class="modal-conteudo">
        <div class="modal-cabecalho">
          <h2><span id="acao-texto"></span> Solicitação <span id="modal-protocolo-justificativa"></span></h2>
          <button class="fechar-modal">&times;</button>
        </div>
        <div class="modal-corpo">
          <p>Por favor, informe a justificativa:</p>
          <textarea id="justificativa-texto" rows="5" class="form-control"></textarea>
          <div class="modal-acoes">
            <button id="confirmar-justificativa" class="btn-grande">Confirmar</button>
            <button id="cancelar-justificativa" class="btn-grande">Cancelar</button>
          </div>
        </div>
      </div>
    `;
    
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    // Adicionar evento para fechar o modal
    modal.querySelector('.fechar-modal').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // Adicionar evento para o botão cancelar
    modal.querySelector('#cancelar-justificativa').addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
  
  // Atualizar os textos do modal
  const acaoTexto = {
    'negar': 'Negar',
    'devolver': 'Devolver',
    'cancelar': 'Cancelar'
  }[acao] || 'Atualizar';
  
  modal.querySelector('#acao-texto').textContent = acaoTexto;
  modal.querySelector('#modal-protocolo-justificativa').textContent = protocolo;
  modal.querySelector('#justificativa-texto').value = '';
  
  // Adicionar evento para o botão confirmar
  const btnConfirmar = modal.querySelector('#confirmar-justificativa');
  
  // Remover eventos anteriores
  const novoBtn = btnConfirmar.cloneNode(true);
  btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);
  
  novoBtn.addEventListener('click', () => {
    const justificativa = modal.querySelector('#justificativa-texto').value.trim();
    
    if (!justificativa) {
      alert('Por favor, informe uma justificativa válida.');
      return;
    }
    
    modal.style.display = 'none';
    
    if (typeof callback === 'function') {
      callback(justificativa);
    }
  });
  
  // Exibir o modal
  modal.style.display = 'block';
}

// Exibir modal para agendamento
function exibirModalAgendamento(protocolo, callback) {
  // Verificar se já existe um modal na página
  let modal = document.getElementById('modal-agendamento');
  
  // Se não existir, criar um novo
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-agendamento';
    modal.className = 'modal';
    
    const modalHTML = `
      <div class="modal-conteudo">
        <div class="modal-cabecalho">
          <h2>Agendar Solicitação <span id="modal-protocolo-agendamento"></span></h2>
          <button class="fechar-modal">&times;</button>
        </div>
        <div class="modal-corpo">
          <div class="form-grupo">
            <label for="data-agendamento">Data do Agendamento:</label>
            <input type="date" id="data-agendamento" class="form-control" required>
          </div>
          <div class="form-grupo">
            <label for="hora-agendamento">Hora do Agendamento:</label>
            <input type="time" id="hora-agendamento" class="form-control" required>
          </div>
          <div class="form-grupo">
            <label for="local-agendamento">Local do Agendamento:</label>
            <select id="local-agendamento" class="form-control" required>
              <option value="">Selecione um local</option>
              <option value="hospital-central">Hospital Central</option>
              <option value="centro-especialidades">Centro de Especialidades</option>
              <option value="ubs-central">UBS Central</option>
              <option value="outro">Outro local</option>
            </select>
          </div>
          <div class="form-grupo" id="outro-local-grupo" style="display: none;">
            <label for="outro-local">Especifique o local:</label>
            <input type="text" id="outro-local" class="form-control">
          </div>
          <div class="form-grupo">
            <label for="instrucoes-agendamento">Instruções para o Paciente:</label>
            <textarea id="instrucoes-agendamento" rows="3" class="form-control"></textarea>
          </div>
          <div class="modal-acoes">
            <button id="confirmar-agendamento" class="btn-grande">Confirmar Agendamento</button>
            <button id="cancelar-agendamento" class="btn-grande">Cancelar</button>
          </div>
        </div>
      </div>
    `;
    
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    // Adicionar evento para fechar o modal
    modal.querySelector('.fechar-modal').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // Adicionar evento para o botão cancelar
    modal.querySelector('#cancelar-agendamento').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // Mostrar campo de outro local quando selecionado
    modal.querySelector('#local-agendamento').addEventListener('change', function() {
      const outroLocalGrupo = modal.querySelector('#outro-local-grupo');
      outroLocalGrupo.style.display = this.value === 'outro' ? 'block' : 'none';
    });
  }
  
  // Atualizar o protocolo no modal
  modal.querySelector('#modal-protocolo-agendamento').textContent = protocolo;
  
  // Limpar campos do formulário
  modal.querySelector('#data-agendamento').value = '';
  modal.querySelector('#hora-agendamento').value = '';
  modal.querySelector('#local-agendamento').value = '';
  modal.querySelector('#outro-local').value = '';
  modal.querySelector('#instrucoes-agendamento').value = '';
  modal.querySelector('#outro-local-grupo').style.display = 'none';
  
  // Adicionar evento para o botão confirmar
  const btnConfirmar = modal.querySelector('#confirmar-agendamento');
  
  // Remover eventos anteriores
  const novoBtn = btnConfirmar.cloneNode(true);
  btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);
  
  novoBtn.addEventListener('click', () => {
    const data = modal.querySelector('#data-agendamento').value;
    const hora = modal.querySelector('#hora-agendamento').value;
    const localSelecionado = modal.querySelector('#local-agendamento').value;
    const outroLocal = modal.querySelector('#outro-local').value;
    const instrucoes = modal.querySelector('#instrucoes-agendamento').value;
    
    // Validar campos obrigatórios
    if (!data || !hora || !localSelecionado) {
      alert('Por favor, preencha os campos obrigatórios: data, hora e local.');
      return;
    }
    
    // Validar outro local quando selecionado
    if (localSelecionado === 'outro' && !outroLocal) {
      alert('Por favor, especifique o local do agendamento.');
      return;
    }
    
    const local = localSelecionado === 'outro' ? outroLocal : localSelecionado;
    
    const dadosAgendamento = {
      data: data,
      hora: hora,
      local: local,
      instrucoes: instrucoes
    };
    
    modal.style.display = 'none';
    
    if (typeof callback === 'function') {
      callback(dadosAgendamento);
    }
  });
  
  // Exibir o modal
  modal.style.display = 'block';
}

// Exibir modal para conclusão
function exibirModalConclusao(protocolo, callback) {
  // Verificar se já existe um modal na página
  let modal = document.getElementById('modal-conclusao');
  
  // Se não existir, criar um novo
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-conclusao';
    modal.className = 'modal';
    
    const modalHTML = `
      <div class="modal-conteudo">
        <div class="modal-cabecalho">
          <h2>Concluir Solicitação <span id="modal-protocolo-conclusao"></span></h2>
          <button class="fechar-modal">&times;</button>
        </div>
        <div class="modal-corpo">
          <div class="form-grupo">
            <label for="data-conclusao">Data de Execução:</label>
            <input type="date" id="data-conclusao" class="form-control" required>
          </div>
          <div class="form-grupo">
            <label for="observacoes-conclusao">Observações:</label>
            <textarea id="observacoes-conclusao" rows="4" class="form-control"></textarea>
          </div>
          <div class="modal-acoes">
            <button id="confirmar-conclusao" class="btn-grande">Confirmar Conclusão</button>
            <button id="cancelar-conclusao" class="btn-grande">Cancelar</button>
          </div>
        </div>
      </div>
    `;
    
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    // Adicionar evento para fechar o modal
    modal.querySelector('.fechar-modal').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // Adicionar evento para o botão cancelar
    modal.querySelector('#cancelar-conclusao').addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
  
  // Atualizar o protocolo no modal
  modal.querySelector('#modal-protocolo-conclusao').textContent = protocolo;
  
  // Limpar campos do formulário
  modal.querySelector('#data-conclusao').value = '';
  modal.querySelector('#observacoes-conclusao').value = '';
  
  // Adicionar evento para o botão confirmar
  const btnConfirmar = modal.querySelector('#confirmar-conclusao');
  
  // Remover eventos anteriores
  const novoBtn = btnConfirmar.cloneNode(true);
  btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);
  
  novoBtn.addEventListener('click', () => {
    const data = modal.querySelector('#data-conclusao').value;
    const observacoes = modal.querySelector('#observacoes-conclusao').value;
    
    // Validar campos obrigatórios
    if (!data) {
      alert('Por favor, preencha a data de execução.');
      return;
    }
    
    const dadosConclusao = {
      data: data,
      observacoes: observacoes
    };
    
    modal.style.display = 'none';
    
    if (typeof callback === 'function') {
      callback(dadosConclusao);
    }
  });
  
  // Exibir o modal
  modal.style.display = 'block';
}

// Função para atualizar os dados exibidos
function atualizarDados() {
  console.log('Atualizando dados...');
  
  // Aqui seriam feitas as requisições para obter os dados atualizados
  // Por enquanto, apenas simularemos atualizando o timestamp
  atualizarTimestamp();
  
  // Simular atualização visual com um efeito de carregamento
  document.querySelector('.btn-atualizar').textContent = 'Atualizando...';
  document.querySelector('.btn-atualizar').disabled = true;
  
  setTimeout(() => {
    document.querySelector('.btn-atualizar').textContent = 'Atualizar Dados';
    document.querySelector('.btn-atualizar').disabled = false;
    
    // Simulação de atualização concluída
    alertaTemporario('Dados atualizados com sucesso!', 'sucesso');
  }, 1500);
}

// Função para filtrar as solicitações na tabela
function filtrarSolicitacoes() {
  console.log('Filtrando solicitações...');
  
  // Aqui seriam feitas as requisições para filtrar as solicitações
  // Por enquanto, apenas simularemos com um alerta
  alertaTemporario('Filtros aplicados!', 'info');
  
  // Reiniciar para a primeira página
  paginaAtual = 1;
  renderizarPaginacao();
}

// Função para renderizar a paginação
function renderizarPaginacao() {
  // Atualizar informações de página
  const totalPaginas = 8; // Simulação
  document.querySelector('.info-pagina').textContent = `Página ${paginaAtual} de ${totalPaginas}`;
  
  // Atualizar estado dos botões de paginação
  document.querySelector('.btn-pagina.anterior').disabled = paginaAtual === 1;
  document.querySelector('.btn-pagina.proxima').disabled = paginaAtual === totalPaginas;
}

// Função para atualizar o timestamp
function atualizarTimestamp() {
  const agora = new Date();
  const dia = agora.getDate().toString().padStart(2, '0');
  const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
  const ano = agora.getFullYear();
  const hora = agora.getHours().toString().padStart(2, '0');
  const minuto = agora.getMinutes().toString().padStart(2, '0');
  
  const timestamp = `${dia}/${mes}/${ano} ${hora}:${minuto}`;
  document.getElementById('timestamp').textContent = timestamp;
}

// Função para exibir alertas temporários
function alertaTemporario(mensagem, tipo) {
  // Criar o elemento de alerta
  const alerta = document.createElement('div');
  alerta.className = `alerta alerta-${tipo}`;
  alerta.textContent = mensagem;
  
  // Adicionar ao corpo do documento
  document.body.appendChild(alerta);
  
  // Exibir com animação
  setTimeout(() => {
    alerta.classList.add('visivel');
  }, 10);
  
  // Remover após alguns segundos
  setTimeout(() => {
    alerta.classList.remove('visivel');
    setTimeout(() => {
      alerta.remove();
    }, 300);
  }, 3000);
}

// Adicionar estilos CSS para o alerta temporário
const estiloAlerta = document.createElement('style');
estiloAlerta.textContent = `
  .alerta {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    transform: translateX(120%);
    transition: transform 0.3s ease;
    z-index: 9999;
  }
  .alerta.visivel {
    transform: translateX(0);
  }
  .alerta-sucesso {
    background-color: #28a745;
  }
  .alerta-erro {
    background-color: #dc3545;
  }
  .alerta-alerta {
    background-color: #ffc107;
    color: #856404;
  }
  .alerta-info {
    background-color: #17a2b8;
  }
`;
document.head.appendChild(estiloAlerta);

// Função para configurar o evento de logout
function configurarLogout() {
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (confirm('Tem certeza que deseja sair do sistema?')) {
        alertaTemporario('Saindo do sistema...', 'info');
        
        // Limpar possíveis dados de sessão
        try {
          localStorage.removeItem('token');
          sessionStorage.clear();
        } catch (e) {
          console.warn('Erro ao limpar dados de sessão:', e);
        }
        
        // Redirecionar para a página de login usando abordagem direta
        try {
          console.log('Redirecionando para página de login...');
          document.location.href = 'login-central-regulacao.html';
        } catch (e) {
          console.error('Erro ao redirecionar:', e);
          // Abordagem alternativa se o redirecionamento falhar
          window.open('login-central-regulacao.html', '_self');
        }
      }
    });
  } else {
    console.warn('Botão de logout não encontrado!');
  }
}

// Funções de comunicação com o backend e UBS

/**
 * Atualiza o status de uma solicitação
 * @param {string} protocolo - Protocolo da solicitação
 * @param {string} status - Novo status (aprovado, negado, devolvido, etc.)
 * @param {string} justificativa - Justificativa da alteração (opcional)
 * @param {Function} callback - Função a ser chamada após o sucesso
 */
function atualizarStatusSolicitacao(protocolo, status, justificativa, callback) {
  console.log(`Atualizando status da solicitação ${protocolo} para ${status}`);
  
  // Em um ambiente real, aqui seria feita uma requisição para o backend
  const dados = {
    protocolo: protocolo,
    status: status,
    justificativa: justificativa,
    dataAtualizacao: new Date().toISOString(),
    usuarioId: obterUsuarioAtual()?.id || 'usuario_sistema'
  };
  
  // Simulação de requisição ao backend
  setTimeout(() => {
    console.log('Status atualizado com sucesso:', dados);
    
    // Simular sucesso na operação
    if (typeof callback === 'function') {
      callback();
    }
    
    // Exibir alerta de sucesso
    const mensagens = {
      'aprovado': 'aprovada',
      'negado': 'negada',
      'devolvido': 'devolvida para ajustes',
      'agendado': 'agendada com sucesso',
      'cancelado': 'cancelada',
      'concluido': 'marcada como concluída'
    };
    
    const mensagem = mensagens[status] || 'atualizada';
    alertaTemporario(`Solicitação ${protocolo} ${mensagem} com sucesso!`, 'sucesso');
  }, 500);
}

/**
 * Atualiza a prioridade de uma solicitação
 * @param {string} protocolo - Protocolo da solicitação
 * @param {string} prioridade - Nova prioridade (urgente, alta, media, baixa)
 * @param {Function} callback - Função a ser chamada após o sucesso
 */
function atualizarPrioridadeSolicitacao(protocolo, prioridade, callback) {
  console.log(`Atualizando prioridade da solicitação ${protocolo} para ${prioridade}`);
  
  // Em um ambiente real, aqui seria feita uma requisição para o backend
  const dados = {
    protocolo: protocolo,
    prioridade: prioridade,
    dataAtualizacao: new Date().toISOString(),
    usuarioId: obterUsuarioAtual()?.id || 'usuario_sistema'
  };
  
  // Simulação de requisição ao backend
  setTimeout(() => {
    console.log('Prioridade atualizada com sucesso:', dados);
    
    // Simular sucesso na operação
    if (typeof callback === 'function') {
      callback();
    }
    
    // Exibir alerta de sucesso
    alertaTemporario(`Prioridade da solicitação ${protocolo} atualizada para ${prioridade}!`, 'sucesso');
  }, 500);
}

/**
 * Salva os dados de agendamento de uma solicitação
 * @param {string} protocolo - Protocolo da solicitação
 * @param {Object} dadosAgendamento - Dados do agendamento
 */
function salvarDadosAgendamento(protocolo, dadosAgendamento) {
  console.log(`Salvando dados de agendamento para a solicitação ${protocolo}:`, dadosAgendamento);
  
  // Em um ambiente real, aqui seria feita uma requisição para o backend
  const dados = {
    protocolo: protocolo,
    agendamento: dadosAgendamento,
    dataRegistro: new Date().toISOString(),
    usuarioId: obterUsuarioAtual()?.id || 'usuario_sistema'
  };
  
  // Simulação de requisição ao backend
  setTimeout(() => {
    console.log('Dados de agendamento salvos com sucesso:', dados);
  }, 300);
}

/**
 * Salva a data de conclusão de uma solicitação
 * @param {string} protocolo - Protocolo da solicitação
 * @param {string} dataConclusao - Data de conclusão
 */
function salvarDataConclusao(protocolo, dataConclusao) {
  console.log(`Salvando data de conclusão (${dataConclusao}) para a solicitação ${protocolo}`);
  
  // Em um ambiente real, aqui seria feita uma requisição para o backend
  const dados = {
    protocolo: protocolo,
    dataConclusao: dataConclusao,
    dataRegistro: new Date().toISOString(),
    usuarioId: obterUsuarioAtual()?.id || 'usuario_sistema'
  };
  
  // Simulação de requisição ao backend
  setTimeout(() => {
    console.log('Data de conclusão salva com sucesso:', dados);
  }, 300);
}

/**
 * Notifica a UBS sobre a atualização de uma solicitação
 * @param {string} acao - Tipo da ação realizada
 * @param {string} protocolo - Protocolo da solicitação
 * @param {string} justificativa - Justificativa (opcional)
 * @param {Object} dadosAdicionais - Dados adicionais específicos da ação
 */
function notificarUBS(acao, protocolo, justificativa, dadosAdicionais) {
  console.log(`Notificando UBS sobre ação "${acao}" na solicitação ${protocolo}`);
  
  // Em um ambiente real, aqui seria feita uma requisição para o backend
  const notificacao = {
    destino: 'UBS',
    acao: acao,
    protocolo: protocolo,
    justificativa: justificativa,
    dadosAdicionais: dadosAdicionais,
    dataNotificacao: new Date().toISOString(),
    usuarioId: obterUsuarioAtual()?.id || 'usuario_sistema'
  };
  
  // Simulação de requisição ao backend
  setTimeout(() => {
    console.log('Notificação enviada para UBS:', notificacao);
  }, 300);
}

/**
 * Busca uma solicitação pelo protocolo
 * @param {string} protocolo - Protocolo da solicitação
 * @returns {Object|null} Dados da solicitação ou null se não encontrada
 */
function buscarSolicitacaoPorProtocolo(protocolo) {
  console.log(`Buscando solicitação com protocolo ${protocolo}`);
  
  // Em um ambiente real, aqui seria feita uma requisição para o backend
  // Para fins de demonstração, vamos simular uma resposta
  
  // Dados simulados de solicitação
  const solicitacao = {
    protocolo: protocolo,
    paciente: {
      nome: 'Maria Oliveira',
      idade: 58,
      cns: '123456789012345'
    },
    tipo: 'Ressonância Magnética',
    prioridade: 'urgente',
    unidade: 'UBS Central',
    data: '2023-05-10',
    solicitante: 'Dr. Silva',
    cid: 'I20.9',
    justificativa: 'Paciente com histórico de dor torácica à esquerda, com irradiação para MSE, associado a dispneia e sudorese. ECG mostra inversão de onda T em parede anterior.',
    historico: [
      { data: '2023-04-02', descricao: 'Consulta Clínico Geral - HAS + DM2' },
      { data: '2023-04-15', descricao: 'Exame Laboratório - Colesterol elevado' },
      { data: '2023-05-05', descricao: 'Atendimento Urgência - Dor torácica' }
    ]
  };
  
  return solicitacao;
}

/**
 * Obtém o usuário atual do sistema
 * @returns {Object|null} Dados do usuário logado ou null se não encontrado
 */
function obterUsuarioAtual() {
  try {
    const usuarioStr = sessionStorage.getItem('usuarioAtual');
    if (usuarioStr) {
      return JSON.parse(usuarioStr);
    }
    return null;
  } catch (e) {
    console.error('Erro ao obter usuário atual:', e);
    return null;
  }
}

/**
 * Exibe um alerta temporário na tela
 * @param {string} mensagem - Mensagem a ser exibida
 * @param {string} tipo - Tipo do alerta (sucesso, erro, alerta)
 */
function alertaTemporario(mensagem, tipo = 'sucesso') {
  // Verificar se já existe um container de alertas
  let alertasContainer = document.getElementById('alertas-container');
  
  if (!alertasContainer) {
    alertasContainer = document.createElement('div');
    alertasContainer.id = 'alertas-container';
    alertasContainer.style.position = 'fixed';
    alertasContainer.style.top = '20px';
    alertasContainer.style.right = '20px';
    alertasContainer.style.zIndex = '1000';
    document.body.appendChild(alertasContainer);
  }
  
  // Criar o alerta
  const alerta = document.createElement('div');
  alerta.className = `alerta alerta-${tipo}`;
  alerta.textContent = mensagem;
  
  // Estilizar o alerta conforme o tipo
  const cores = {
    sucesso: { bg: '#d4edda', texto: '#155724', borda: '#c3e6cb' },
    erro: { bg: '#f8d7da', texto: '#721c24', borda: '#f5c6cb' },
    alerta: { bg: '#fff3cd', texto: '#856404', borda: '#ffeeba' },
    info: { bg: '#d1ecf1', texto: '#0c5460', borda: '#bee5eb' }
  };
  
  const corAlerta = cores[tipo] || cores.info;
  
  alerta.style.backgroundColor = corAlerta.bg;
  alerta.style.color = corAlerta.texto;
  alerta.style.border = `1px solid ${corAlerta.borda}`;
  alerta.style.borderRadius = '4px';
  alerta.style.padding = '10px 15px';
  alerta.style.marginBottom = '10px';
  alerta.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
  alerta.style.transition = 'opacity 0.5s';
  
  // Adicionar o alerta ao container
  alertasContainer.appendChild(alerta);
  
  // Remover o alerta após 5 segundos
  setTimeout(() => {
    alerta.style.opacity = '0';
    setTimeout(() => {
      alertasContainer.removeChild(alerta);
      
      // Se não houver mais alertas, remover o container
      if (alertasContainer.children.length === 0) {
        document.body.removeChild(alertasContainer);
      }
    }, 500);
  }, 5000);
} 