/**
 * Sistema UBS Local - JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM carregado. Iniciando sistema UBS Local...');
  
  // Inicializar componentes após carregamento da página
  setTimeout(() => {
    inicializarSistema();
  }, 100); // Pequeno atraso para garantir que tudo esteja carregado
});

/**
 * Inicializa o sistema e seus componentes
 */
function inicializarSistema() {
  console.log('Inicializando sistema UBS Local');
  
  // Carregar informações do usuário logado
  const usuarioAtual = carregarInformacoesUsuario();
  
  // Verificar se o usuário tem acesso à interface da UBS
  if (usuarioAtual) {
    const perfilPermitido = ['ubs', 'medico', 'atendente', 'admin'].includes(usuarioAtual.perfil);
    console.log(`Perfil do usuário: ${usuarioAtual.perfil}, Permitido: ${perfilPermitido}`);
    
    if (!perfilPermitido) {
      console.error('Usuário não tem permissão para acessar a interface UBS');
      setTimeout(() => {
        alert('Seu perfil não tem autorização para acessar a interface da UBS.');
        window.location.href = 'login-central-regulacao.html';
      }, 500);
      return;
    }

    console.log(`Acesso autorizado para usuário ${usuarioAtual.nome} com perfil ${usuarioAtual.perfil}`);
    
    // Inicializar componentes da interface
    inicializarComponentesInterface(usuarioAtual);
  } else {
    // Se não há usuário logado, redirecionar para login
    console.error('Nenhum usuário logado');
    setTimeout(() => {
      alert('Você precisa fazer login para acessar o sistema.');
      window.location.href = 'login-central-regulacao.html';
    }, 500);
    return;
  }
}

/**
 * Inicializa os componentes da interface após confirmação de usuário válido
 */
function inicializarComponentesInterface(usuario) {
  console.log('Inicializando componentes da interface para:', usuario.nome);
  
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
  
  // Configurar elementos baseado no perfil do usuário
  ajustarInterfacePorPerfil();
  
  // Adicionar barra de identificação do usuário
  adicionarBarraIdentificacao(usuario);
}

/**
 * Adiciona uma barra na parte superior identificando o usuário logado
 */
function adicionarBarraIdentificacao(usuario) {
  if (!usuario) return;
  
  const header = document.querySelector('.header');
  if (!header) return;
  
  // Criar elemento para exibir informações do perfil
  const perfilInfo = document.createElement('div');
  perfilInfo.className = 'perfil-info';
  perfilInfo.innerHTML = `
    <span class="perfil-badge ${usuario.perfil}">${getDescricaoPerfil(usuario.perfil)}</span>
    <span class="unidade-info">${usuario.unidade}</span>
  `;
  
  // Inserir no cabeçalho
  const userInfo = header.querySelector('.user-info');
  if (userInfo) {
    userInfo.insertBefore(perfilInfo, userInfo.firstChild);
  }
  
  // Adicionar estilos CSS para a identificação do perfil
  const style = document.createElement('style');
  style.textContent = `
    .perfil-info {
      display: flex;
      flex-direction: column;
      margin-right: 15px;
      text-align: right;
    }
    
    .perfil-badge {
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 10px;
      color: white;
      display: inline-block;
      margin-bottom: 4px;
    }
    
    .perfil-badge.admin {
      background-color: #dc3545;
    }
    
    .perfil-badge.regulador {
      background-color: #17a2b8;
    }
    
    .perfil-badge.ubs, .perfil-badge.medico {
      background-color: #28a745;
    }
    
    .perfil-badge.atendente {
      background-color: #6c757d;
    }
    
    .perfil-badge.gestor {
      background-color: #fd7e14;
    }
    
    .unidade-info {
      font-size: 0.75rem;
      color: #6c757d;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Retorna uma descrição legível do perfil
 */
function getDescricaoPerfil(perfil) {
  switch(perfil) {
    case 'admin':
      return 'Administrador';
    case 'regulador':
      return 'Regulador';
    case 'ubs':
      return 'UBS';
    case 'medico':
      return 'Médico';
    case 'atendente':
      return 'Atendente';
    case 'gestor':
      return 'Gestor';
    default:
      return perfil.charAt(0).toUpperCase() + perfil.slice(1);
  }
}

/**
 * Carrega as informações do usuário da sessão e atualiza a interface
 */
function carregarInformacoesUsuario() {
  try {
    // Tentar obter dados do usuário da sessão
    const usuarioStr = sessionStorage.getItem('usuarioAtual');
    console.log('Verificando sessão do usuário...', usuarioStr ? 'Sessão encontrada' : 'Sessão não encontrada');
    
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      console.log('Usuário logado:', usuario.nome, 'Perfil:', usuario.perfil);
      
      // Atualizar nome do usuário na interface
      const userNameElement = document.getElementById('user-name');
      if (userNameElement) {
        userNameElement.textContent = usuario.nome || 'Usuário';
      }
      
      return usuario;
    } else {
      console.warn('Nenhum usuário logado. Redirecionando para login...');
      
      // Usar setTimeout para dar tempo à interface de carregar antes do redirecionamento
      setTimeout(() => {
        console.log('Redirecionando para página de login');
        window.location.href = 'login-central-regulacao.html';
      }, 1000);
      
      return null;
    }
  } catch (e) {
    console.error('Erro ao carregar dados do usuário:', e);
    
    // Em caso de erro, redirecionar para login
    setTimeout(() => {
      alert('Erro ao carregar dados do usuário. Por favor, faça login novamente.');
      window.location.href = 'login-central-regulacao.html';
    }, 1000);
    
    return null;
  }
}

/**
 * Ajusta a interface baseada no perfil e permissões do usuário
 */
function ajustarInterfacePorPerfil() {
  try {
    const usuarioStr = sessionStorage.getItem('usuarioAtual');
    if (!usuarioStr) return;
    
    const usuario = JSON.parse(usuarioStr);
    const perfil = usuario.perfil;
    const permissoes = usuario.permissoes || [];
    
    console.log(`Ajustando interface para perfil ${perfil} com permissões:`, permissoes);
    
    // Elementos específicos para cada perfil
    const elementosPorPerfil = {
      ubs: document.querySelectorAll('.apenas-ubs'),
      medico: document.querySelectorAll('.apenas-medico'),
      atendente: document.querySelectorAll('.apenas-atendente'),
      gestor: document.querySelectorAll('.apenas-gestor')
    };
    
    // Ajustar visibilidade com base no perfil
    Object.keys(elementosPorPerfil).forEach(tipo => {
      const visivel = (tipo === perfil || perfil === 'admin');
      elementosPorPerfil[tipo].forEach(el => {
        el.style.display = visivel ? '' : 'none';
      });
    });
    
    // Ajustar elementos com base nas permissões
    document.querySelectorAll('[data-requer-permissao]').forEach(el => {
      const permissaoRequerida = el.getAttribute('data-requer-permissao');
      const temPermissao = permissoes.includes(permissaoRequerida) || 
                          permissoes.includes('*');
      
      el.style.display = temPermissao ? '' : 'none';
    });
    
    // Ajustar funcionalidades específicas com base no perfil
    if (perfil === 'atendente') {
      // Atendentes só podem criar solicitações, não podem editar ou cancelar
      document.querySelectorAll('.btn-acao.corrigir, .btn-acao.cancelar').forEach(btn => {
        btn.style.display = 'none';
      });
    }
    
    if (perfil === 'medico') {
      // Adicionar campo de assinatura digital para médicos
      document.querySelectorAll('form.formulario-especializado').forEach(form => {
        const botoes = form.querySelector('.form-buttons');
        if (botoes && !form.querySelector('.campo-assinatura')) {
          const divAssinatura = document.createElement('div');
          divAssinatura.className = 'form-section campo-assinatura';
          divAssinatura.innerHTML = `
            <h4>Assinatura Digital Médica</h4>
            <div class="campo">
              <label for="assinatura-digital" class="required">Confirme sua identidade</label>
              <input type="password" id="assinatura-digital" placeholder="Digite sua senha para assinar digitalmente" required>
              <small>A assinatura digital é obrigatória para submissão de solicitações médicas.</small>
            </div>
          `;
          form.insertBefore(divAssinatura, botoes);
        }
      });
    }
    
    if (perfil === 'admin') {
      // Adicionar botões e funcionalidades administrativas
      const dashboard = document.querySelector('.dashboard');
      if (dashboard) {
        // Adicionar card de administração no dashboard
        const adminCard = document.createElement('div');
        adminCard.className = 'dashboard-card admin-card';
        adminCard.innerHTML = `
          <h3>Painel Administrativo</h3>
          <p class="card-value"><span class="admin-icon">⚙️</span></p>
          <div class="admin-links">
            <a href="admin/admin-usuarios.html" class="admin-link">Gerenciar Usuários</a>
            <a href="admin/admin-cotas.html" class="admin-link">Gerenciar Cotas</a>
            <a href="admin/admin-procedimentos.html" class="admin-link">Procedimentos</a>
            <a href="admin/admin-relatorios.html" class="admin-link">Relatórios</a>
          </div>
        `;
        dashboard.appendChild(adminCard);
        
        // Adicionar estilos para admin card
        const adminStyle = document.createElement('style');
        adminStyle.textContent = `
          .admin-card {
            background-color: #f8f9fa;
            border-left: 4px solid #dc3545;
          }
          .admin-icon {
            font-size: 24px;
          }
          .admin-links {
            display: flex;
            flex-direction: column;
            margin-top: 10px;
          }
          .admin-link {
            background-color: #007bff;
            color: white;
            padding: 6px 10px;
            margin: 3px 0;
            border-radius: 4px;
            text-decoration: none;
            text-align: center;
            font-size: 14px;
          }
          .admin-link:hover {
            background-color: #0069d9;
          }
        `;
        document.head.appendChild(adminStyle);
      }
      
      // Adicionar opção de modo administrador na barra superior
      const userInfo = document.querySelector('.user-info');
      if (userInfo) {
        const adminModeToggle = document.createElement('button');
        adminModeToggle.id = 'admin-mode-toggle';
        adminModeToggle.className = 'admin-mode-btn';
        adminModeToggle.textContent = 'Modo Admin';
        adminModeToggle.addEventListener('click', toggleAdminMode);
        userInfo.insertBefore(adminModeToggle, userInfo.querySelector('#logout-btn'));
        
        // Adicionar estilos para o botão admin
        const btnStyle = document.createElement('style');
        btnStyle.textContent = `
          .admin-mode-btn {
            background-color: #dc3545;
            color: white;
            border: none;
            padding: 5px 10px;
            margin-right: 10px;
            border-radius: 4px;
            cursor: pointer;
          }
          .admin-mode-active {
            background-color: #28a745;
          }
        `;
        document.head.appendChild(btnStyle);
      }
    }
    
  } catch (e) {
    console.error('Erro ao ajustar interface por perfil:', e);
  }
}

/**
 * Alterna o modo administrador (para perfil admin)
 */
function toggleAdminMode() {
  const btn = document.getElementById('admin-mode-toggle');
  if (!btn) return;
  
  // Alternar classe ativa
  const isActive = btn.classList.toggle('admin-mode-active');
  
  // Atualizar texto do botão
  btn.textContent = isActive ? 'Modo Admin: ON' : 'Modo Admin';
  
  // Mostrar notificação
  mostrarNotificacao(
    isActive ? 'Modo administrador ativado. Acesso total liberado!' : 'Modo administrador desativado.',
    isActive ? 'sucesso' : 'informacao'
  );
  
  // Em um sistema real, isso habilitaria funcionalidades específicas de admin
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isActive ? 'block' : 'none';
  });
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