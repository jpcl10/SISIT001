/**
 * Sistema UBS Local - JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar componentes após carregamento da página
  inicializarSistema();
});

/**
 * Inicializa o sistema e seus componentes
 */
function inicializarSistema() {
  console.log('Inicializando sistema UBS Local');
  
  // Adicionar handler para logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', fazerLogout);
  }

  // Inicializar formulários
  const seletor = document.getElementById('seletorFormulario');
  if (seletor) {
    seletor.addEventListener('change', mostrarFormularioEspecifico);
  }

  // Inicializar handlers de botões
  inicializarBotoesAcao();
  
  // Carregar dados simulados (em produção, seriam carregados da API)
  carregarDadosSimulados();
}

/**
 * Mostra o formulário específico selecionado e esconde os outros
 */
function mostrarFormularioEspecifico() {
  console.log('Iniciando mostrarFormularioEspecifico');
  const seletor = document.getElementById('seletorFormulario'); // <select> que define o tipo de formulário
  const areaFormulario = document.getElementById('formularioEspecifico'); // <div> que contém os formulários

  if (!seletor || !areaFormulario) {
    console.error('Elementos de formulário não encontrados');
    return;
  }

  // Referência aos contêineres de formulário específico
  const forms = {
    ressonancia: document.getElementById('formRessonancia'),
    mamografia: document.getElementById('formMamografia'),
    lme: document.getElementById('formLME'),
    aih: document.getElementById('formAIH'),
    ambulatorial: document.getElementById('formAmbulatorial'),
    especialidades: document.getElementById('formEspecialidades')
    // 👉 Aqui você poderá adicionar outros formulários no futuro, como:
    // exameLaboratorial: document.getElementById('formExameLaboratorial')
  };

  if (seletor.value) {
    // Mostrar a área de formulário
    areaFormulario.style.display = 'block';

    // Esconde todos os formulários
    for (let key in forms) {
      if (forms[key]) {
        forms[key].style.display = 'none';
      }
    }

    // Exibe o formulário correspondente à seleção
    if (forms[seletor.value]) {
      console.log(`Exibindo formulário: ${seletor.value}`);
      forms[seletor.value].style.display = 'block';

      // Focar no primeiro campo do formulário para melhorar usabilidade
      setTimeout(() => {
        const primeiroCampo = forms[seletor.value].querySelector('input, select, textarea');
        if (primeiroCampo) {
          primeiroCampo.focus();
        }
      }, 100);
    }
  } else {
    areaFormulario.style.display = 'none';
  }
}

/**
 * Inicializa os handlers de botões de ação na interface
 */
function inicializarBotoesAcao() {
  // Selecionar todos os botões de ação
  const botoesAcao = document.querySelectorAll('.btn-acao');
  
  // Adicionar evento de clique a cada botão
  botoesAcao.forEach(botao => {
    botao.addEventListener('click', function(e) {
      const acao = this.textContent.trim().toLowerCase();
      const itemParent = this.closest('.card-item') || this.closest('tr');
      
      if (acao === 'visualizar') {
        visualizarSolicitacao(itemParent);
      } else if (acao === 'corrigir') {
        corrigirSolicitacao(itemParent);
      } else if (acao === 'cancelar') {
        cancelarSolicitacao(itemParent);
      }
    });
  });
  
  // Inicializar botões de enviar formulário
  const botoesEnviar = document.querySelectorAll('.btn-primary');
  botoesEnviar.forEach(botao => {
    botao.addEventListener('click', function(e) {
      // Evitar envio se for um botão em um formulário (deixar o submit do form funcionar)
      if (this.type !== 'submit') {
        e.preventDefault();
      }
      
      // Se for um botão de submissão de formulário, validar antes de enviar
      if (this.closest('form')) {
        const form = this.closest('form');
        if (validarFormulario(form)) {
          enviarFormulario(form);
        }
      }
    });
  });
  
  // Inicializar botões para salvar rascunho
  const botoesSalvar = document.querySelectorAll('.btn-secondary');
  botoesSalvar.forEach(botao => {
    if (botao.textContent.trim().toLowerCase().includes('rascunho')) {
      botao.addEventListener('click', function(e) {
        e.preventDefault();
        const form = this.closest('form');
        if (form) {
          salvarRascunho(form);
        }
      });
    }
  });
}

/**
 * Valida um formulário antes de enviar
 * @param {HTMLFormElement} form - O formulário a ser validado
 * @returns {boolean} - Indica se o formulário é válido
 */
function validarFormulario(form) {
  // Verificar campos obrigatórios
  const camposObrigatorios = form.querySelectorAll('[required]');
  let valido = true;
  
  camposObrigatorios.forEach(campo => {
    if (!campo.value.trim()) {
      destacarCampoInvalido(campo, 'Campo obrigatório');
      valido = false;
    } else {
      limparErro(campo);
    }
  });
  
  // Validar padrões específicos (se necessário)
  const camposCNS = form.querySelectorAll('input[pattern="\\d{15}"]');
  camposCNS.forEach(campo => {
    if (campo.value && !validarCNS(campo.value)) {
      destacarCampoInvalido(campo, 'CNS inválido - Deve ter 15 dígitos');
      valido = false;
    }
  });
  
  return valido;
}

/**
 * Destaca um campo inválido com mensagem de erro
 * @param {HTMLElement} campo - O campo que está inválido
 * @param {string} mensagem - A mensagem de erro
 */
function destacarCampoInvalido(campo, mensagem) {
  campo.classList.add('campo-invalido');
  
  // Verificar se já existe mensagem de erro
  let msgErro = campo.nextElementSibling;
  if (!msgErro || !msgErro.classList.contains('erro-mensagem')) {
    msgErro = document.createElement('span');
    msgErro.classList.add('erro-mensagem');
    campo.parentNode.insertBefore(msgErro, campo.nextSibling);
  }
  
  msgErro.textContent = mensagem;
  msgErro.style.color = 'var(--cor-erro)';
  msgErro.style.fontSize = '0.8rem';
  msgErro.style.display = 'block';
  
  // Estilizar campo
  campo.style.borderColor = 'var(--cor-erro)';
}

/**
 * Limpa indicadores de erro de um campo
 * @param {HTMLElement} campo - O campo para limpar erros
 */
function limparErro(campo) {
  campo.classList.remove('campo-invalido');
  campo.style.borderColor = '';
  
  // Remover mensagem de erro
  const msgErro = campo.nextElementSibling;
  if (msgErro && msgErro.classList.contains('erro-mensagem')) {
    msgErro.remove();
  }
}

/**
 * Valida um número de CNS
 * @param {string} cns - Número do CNS para validar
 * @returns {boolean} - Indica se o CNS é válido
 */
function validarCNS(cns) {
  // Implementação básica - apenas verifica se tem 15 dígitos numéricos
  return /^\d{15}$/.test(cns);
}

/**
 * Função que envia o formulário (simula o envio para API)
 * @param {HTMLFormElement} form - Formulário a ser enviado
 */
function enviarFormulario(form) {
  // Simulação de envio - em produção, isso seria uma chamada à API
  console.log('Enviando formulário:', form.id);
  
  // Coleta os dados do formulário
  const formData = new FormData(form);
  const dadosForm = {};
  
  for (let [key, value] of formData.entries()) {
    dadosForm[key] = value;
  }
  
  console.log('Dados do formulário:', dadosForm);
  
  // Simular resposta de sucesso após 1 segundo
  setTimeout(() => {
    form.reset();
    mostrarNotificacao('Solicitação enviada com sucesso!', 'sucesso');
    document.getElementById('seletorFormulario').value = '';
    document.getElementById('formularioEspecifico').style.display = 'none';
  }, 1000);
}

/**
 * Salva o formulário como rascunho
 * @param {HTMLFormElement} form - Formulário a ser salvo como rascunho
 */
function salvarRascunho(form) {
  console.log('Salvando rascunho do formulário:', form.id);
  
  // Coleta os dados do formulário
  const formData = new FormData(form);
  const dadosForm = {};
  
  for (let [key, value] of formData.entries()) {
    dadosForm[key] = value;
  }
  
  // Em produção, isso seria salvo no banco de dados ou localStorage
  localStorage.setItem(`rascunho_${form.id}`, JSON.stringify(dadosForm));
  
  mostrarNotificacao('Rascunho salvo com sucesso!', 'informacao');
}

/**
 * Exibe uma notificação na interface
 * @param {string} mensagem - Mensagem a ser exibida
 * @param {string} tipo - Tipo de notificação (sucesso, erro, informacao, alerta)
 */
function mostrarNotificacao(mensagem, tipo = 'informacao') {
  // Criar elemento de notificação
  const notificacao = document.createElement('div');
  notificacao.className = `notificacao ${tipo}`;
  notificacao.innerHTML = mensagem;
  
  // Estilos para a notificação
  Object.assign(notificacao.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: 'var(--borda-arredondada)',
    backgroundColor: tipo === 'sucesso' ? 'var(--cor-destaque)' : 
                     tipo === 'erro' ? 'var(--cor-erro)' :
                     tipo === 'alerta' ? 'var(--cor-aviso)' : 'var(--cor-secundaria)',
    color: 'white',
    boxShadow: 'var(--sombra-padrao)',
    zIndex: '1000',
    opacity: '0',
    transition: 'opacity 0.3s ease'
  });
  
  // Adicionar à página
  document.body.appendChild(notificacao);
  
  // Exibir com animação
  setTimeout(() => {
    notificacao.style.opacity = '1';
  }, 10);
  
  // Remover após 4 segundos
  setTimeout(() => {
    notificacao.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(notificacao);
    }, 300);
  }, 4000);
}

/**
 * Funções para lidar com solicitações
 */
function visualizarSolicitacao(item) {
  const protocolo = item.querySelector('td')?.textContent || 
                   item.querySelector('.card-titulo')?.textContent || 
                   'Protocolo não identificado';
                   
  console.log('Visualizando solicitação:', protocolo);
  mostrarNotificacao(`Visualizando detalhes de ${protocolo}`, 'informacao');
  
  // Em produção: abrir modal ou navegar para página de detalhes
}

function corrigirSolicitacao(item) {
  const protocolo = item.querySelector('.card-titulo')?.textContent || 'Protocolo não identificado';
  console.log('Corrigindo solicitação:', protocolo);
  mostrarNotificacao(`Preparando correção de ${protocolo}`, 'informacao');
  
  // Em produção: carregar dados do rascunho e mostrar formulário para edição
}

function cancelarSolicitacao(item) {
  const protocolo = item.querySelector('.card-titulo')?.textContent || 'Protocolo não identificado';
  
  // Em produção: criar modal de confirmação
  if (confirm(`Tem certeza que deseja cancelar a solicitação ${protocolo}?`)) {
    console.log('Cancelando solicitação:', protocolo);
    mostrarNotificacao(`Solicitação ${protocolo} cancelada`, 'alerta');
    
    // Em produção: fazer requisição para cancelar no backend
    item.remove(); // Remove o item da interface
  }
}

/**
 * Simula logout do sistema
 */
function fazerLogout() {
  if (confirm('Tem certeza que deseja sair do sistema?')) {
    mostrarNotificacao('Saindo do sistema...', 'informacao');
    
    setTimeout(() => {
      // Em produção: redirecionar para página de login
      window.location.reload();
    }, 1500);
  }
}

/**
 * Carrega dados simulados no sistema
 * Em produção, estes dados viriam da API
 */
function carregarDadosSimulados() {
  console.log('Carregando dados simulados');
  
  // Dados poderiam ser carregados de APIs em produção
}

// Adicionar estilo CSS para os campos inválidos
const style = document.createElement('style');
style.textContent = `
  .campo-invalido {
    border-color: var(--cor-erro) !important;
  }
  
  .erro-mensagem {
    color: var(--cor-erro);
    font-size: 0.8rem;
    margin-top: 4px;
  }
`;
document.head.appendChild(style); 