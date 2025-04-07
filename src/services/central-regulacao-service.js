// Variáveis globais
let dadosFiltrados = [];
let paginaAtual = 1;
const itensPorPagina = 10;

// Função executada quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar gráficos
  inicializarGraficos();
  
  // Adicionar listeners para navegação no menu
  adicionarEventosMenu();
  
  // Adicionar listeners para filtros
  adicionarEventosFiltros();
  
  // Adicionar listeners para ações na tabela de solicitações
  adicionarEventosTabela();
  
  // Adicionar listeners para modal
  adicionarEventosModal();
  
  // Inicializar hora da última atualização
  atualizarTimestamp();
  
  // Simular atualização automática a cada 5 minutos
  setInterval(atualizarDados, 300000);
});

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
  // Fechar modal
  document.querySelector('.fechar-modal').addEventListener('click', function() {
    fecharModal();
  });
  
  // Clicar fora do modal para fechar
  document.getElementById('modal-detalhes').addEventListener('click', function(e) {
    if (e.target === this) {
      fecharModal();
    }
  });
  
  // Botões de ação no modal
  document.querySelector('.btn-grande.aprovar').addEventListener('click', function() {
    const protocolo = document.getElementById('modal-protocolo').textContent;
    aprovarSolicitacao(protocolo);
    fecharModal();
  });
  
  document.querySelector('.btn-grande.negar').addEventListener('click', function() {
    const protocolo = document.getElementById('modal-protocolo').textContent;
    negarSolicitacao(protocolo);
    fecharModal();
  });
  
  document.querySelector('.btn-grande.devolver').addEventListener('click', function() {
    const protocolo = document.getElementById('modal-protocolo').textContent;
    devolverSolicitacao(protocolo);
    fecharModal();
  });
}

// Funções para manipulação do modal
function abrirModal(protocolo) {
  document.getElementById('modal-protocolo').textContent = protocolo;
  document.getElementById('modal-detalhes').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  document.getElementById('modal-detalhes').style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Funções para ações nas solicitações
function aprovarSolicitacao(protocolo) {
  const observacoes = document.getElementById('observacoes-regulador').value;
  console.log(`Aprovando solicitação ${protocolo} com observações: ${observacoes}`);
  
  // Aqui seria feita a requisição para aprovar a solicitação
  // Por enquanto, apenas simularemos com um alerta
  alertaTemporario(`Solicitação ${protocolo} aprovada com sucesso!`, 'sucesso');
  
  // Atualizar dados e interface
  atualizarDados();
}

function negarSolicitacao(protocolo) {
  const observacoes = document.getElementById('observacoes-regulador').value;
  console.log(`Negando solicitação ${protocolo} com observações: ${observacoes}`);
  
  // Aqui seria feita a requisição para negar a solicitação
  // Por enquanto, apenas simularemos com um alerta
  alertaTemporario(`Solicitação ${protocolo} negada!`, 'erro');
  
  // Atualizar dados e interface
  atualizarDados();
}

function devolverSolicitacao(protocolo) {
  const observacoes = document.getElementById('observacoes-regulador').value;
  console.log(`Devolvendo solicitação ${protocolo} com observações: ${observacoes}`);
  
  // Aqui seria feita a requisição para devolver a solicitação
  // Por enquanto, apenas simularemos com um alerta
  alertaTemporario(`Solicitação ${protocolo} devolvida para ajustes!`, 'alerta');
  
  // Atualizar dados e interface
  atualizarDados();
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