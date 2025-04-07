/**
 * Sistema UBS - Serviço de Notificações
 * 
 * Responsável por exibir notificações e mensagens ao usuário
 */

/**
 * Classe que gerencia notificações e mensagens
 */
class NotificacaoService {
  constructor() {
    this.containerId = 'notificacoes-container';
    this.initNotificacoesContainer();
    
    // Configurações padrão
    this.defaultConfig = {
      duration: 5000,       // Duração em ms (5 segundos)
      autoHide: true,       // Esconder automaticamente
      position: 'top-right', // Posição da notificação
      closeButton: true     // Mostrar botão de fechar
    };
    
    // Tipos de notificação
    this.tipos = {
      SUCESSO: 'success',
      ERRO: 'danger',
      ALERTA: 'warning',
      INFO: 'info'
    };
  }

  /**
   * Inicializa o container de notificações
   */
  initNotificacoesContainer() {
    // Verificar se já existe
    let container = document.getElementById(this.containerId);
    
    if (!container) {
      // Criar container
      container = document.createElement('div');
      container.id = this.containerId;
      container.className = 'notificacoes-container';
      
      // Adicionar estilos
      const estilos = `
        .notificacoes-container {
          position: fixed;
          width: 300px;
          max-width: 100%;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .notificacoes-container.top-right {
          top: 20px;
          right: 20px;
        }
        .notificacoes-container.top-left {
          top: 20px;
          left: 20px;
        }
        .notificacoes-container.bottom-right {
          bottom: 20px;
          right: 20px;
        }
        .notificacoes-container.bottom-left {
          bottom: 20px;
          left: 20px;
        }
        .notificacao {
          margin-bottom: 10px;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          opacity: 0;
          transform: translateY(-20px);
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .notificacao.show {
          opacity: 1;
          transform: translateY(0);
        }
        .notificacao-conteudo {
          padding: 15px 20px;
          display: flex;
          align-items: center;
        }
        .notificacao-sucesso {
          background-color: #d4edda;
          border-left: 4px solid #28a745;
          color: #155724;
        }
        .notificacao-erro {
          background-color: #f8d7da;
          border-left: 4px solid #dc3545;
          color: #721c24;
        }
        .notificacao-alerta {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          color: #856404;
        }
        .notificacao-info {
          background-color: #d1ecf1;
          border-left: 4px solid #17a2b8;
          color: #0c5460;
        }
        .notificacao-fechar {
          background: none;
          border: none;
          color: inherit;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
          opacity: 0.5;
          padding: 0 0 0 10px;
          margin-left: auto;
        }
        .notificacao-fechar:hover {
          opacity: 1;
        }
      `;
      
      // Adicionar estilos ao head
      const style = document.createElement('style');
      style.textContent = estilos;
      document.head.appendChild(style);
      
      // Adicionar container ao body
      document.body.appendChild(container);
    }
    
    this.container = container;
  }

  /**
   * Exibe uma notificação
   * @param {string} mensagem - Mensagem a ser exibida
   * @param {string} tipo - Tipo de notificação (success, error, warning, info)
   * @param {Object} config - Configurações personalizadas
   */
  mostrar(mensagem, tipo = this.tipos.INFO, config = {}) {
    // Mesclar configurações
    const configuracao = { ...this.defaultConfig, ...config };
    
    // Atualizar posição do container
    this.container.className = `notificacoes-container ${configuracao.position}`;
    
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    
    // Conteúdo da notificação
    const conteudo = document.createElement('div');
    conteudo.className = 'notificacao-conteudo';
    
    // Mensagem
    const mensagemElement = document.createElement('div');
    mensagemElement.className = 'notificacao-mensagem';
    mensagemElement.textContent = mensagem;
    conteudo.appendChild(mensagemElement);
    
    // Botão fechar
    if (configuracao.closeButton) {
      const botaoFechar = document.createElement('button');
      botaoFechar.type = 'button';
      botaoFechar.className = 'notificacao-fechar';
      botaoFechar.innerHTML = '&times;';
      botaoFechar.setAttribute('aria-label', 'Fechar');
      
      botaoFechar.addEventListener('click', () => {
        this.fechar(notificacao);
      });
      
      conteudo.appendChild(botaoFechar);
    }
    
    notificacao.appendChild(conteudo);
    
    // Adicionar ao container
    this.container.appendChild(notificacao);
    
    // Exibir com animação
    setTimeout(() => {
      notificacao.classList.add('show');
    }, 10);
    
    // Auto-esconder
    if (configuracao.autoHide) {
      setTimeout(() => {
        this.fechar(notificacao);
      }, configuracao.duration);
    }
    
    return notificacao;
  }

  /**
   * Fecha uma notificação
   * @param {HTMLElement} notificacao - Elemento de notificação
   */
  fechar(notificacao) {
    if (!notificacao) return;
    
    // Remover classe show para animar
    notificacao.classList.remove('show');
    
    // Remover após animação
    setTimeout(() => {
      if (notificacao.parentNode) {
        notificacao.parentNode.removeChild(notificacao);
      }
    }, 300);
  }

  /**
   * Mostra uma notificação de sucesso
   * @param {string} mensagem - Mensagem a ser exibida
   * @param {Object} config - Configurações personalizadas
   */
  sucesso(mensagem, config = {}) {
    return this.mostrar(mensagem, this.tipos.SUCESSO, config);
  }

  /**
   * Mostra uma notificação de erro
   * @param {string} mensagem - Mensagem a ser exibida
   * @param {Object} config - Configurações personalizadas
   */
  erro(mensagem, config = {}) {
    return this.mostrar(mensagem, this.tipos.ERRO, config);
  }

  /**
   * Mostra uma notificação de alerta
   * @param {string} mensagem - Mensagem a ser exibida
   * @param {Object} config - Configurações personalizadas
   */
  alerta(mensagem, config = {}) {
    return this.mostrar(mensagem, this.tipos.ALERTA, config);
  }

  /**
   * Mostra uma notificação informativa
   * @param {string} mensagem - Mensagem a ser exibida
   * @param {Object} config - Configurações personalizadas
   */
  info(mensagem, config = {}) {
    return this.mostrar(mensagem, this.tipos.INFO, config);
  }

  /**
   * Mostra uma notificação de confirmação
   * @param {string} mensagem - Mensagem a ser exibida
   * @param {Function} onConfirm - Callback quando confirmado
   * @param {Function} onCancel - Callback quando cancelado
   * @param {Object} config - Configurações personalizadas
   */
  confirmar(mensagem, onConfirm, onCancel = null, config = {}) {
    // Configurações padrão para confirmação
    const configuracao = { 
      ...this.defaultConfig, 
      autoHide: false, 
      closeButton: false,
      ...config
    };
    
    // Criar notificação base
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${this.tipos.INFO}`;
    
    // Conteúdo da notificação
    const conteudo = document.createElement('div');
    conteudo.className = 'notificacao-conteudo';
    
    // Mensagem
    const mensagemElement = document.createElement('div');
    mensagemElement.className = 'notificacao-mensagem';
    mensagemElement.textContent = mensagem;
    conteudo.appendChild(mensagemElement);
    
    // Container para botões
    const botoesContainer = document.createElement('div');
    botoesContainer.className = 'notificacao-botoes';
    botoesContainer.style.marginTop = '10px';
    botoesContainer.style.display = 'flex';
    botoesContainer.style.justifyContent = 'flex-end';
    botoesContainer.style.gap = '5px';
    
    // Botão de confirmação
    const botaoConfirmar = document.createElement('button');
    botaoConfirmar.type = 'button';
    botaoConfirmar.className = 'btn btn-sm btn-success';
    botaoConfirmar.textContent = 'Confirmar';
    
    botaoConfirmar.addEventListener('click', () => {
      this.fechar(notificacao);
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    });
    
    // Botão de cancelamento
    const botaoCancelar = document.createElement('button');
    botaoCancelar.type = 'button';
    botaoCancelar.className = 'btn btn-sm btn-secondary';
    botaoCancelar.textContent = 'Cancelar';
    
    botaoCancelar.addEventListener('click', () => {
      this.fechar(notificacao);
      if (typeof onCancel === 'function') {
        onCancel();
      }
    });
    
    botoesContainer.appendChild(botaoCancelar);
    botoesContainer.appendChild(botaoConfirmar);
    
    conteudo.appendChild(botoesContainer);
    notificacao.appendChild(conteudo);
    
    // Adicionar ao container
    this.container.appendChild(notificacao);
    
    // Exibir com animação
    setTimeout(() => {
      notificacao.classList.add('show');
    }, 10);
    
    return notificacao;
  }

  /**
   * Remove todas as notificações
   */
  limparTodas() {
    const notificacoes = this.container.querySelectorAll('.notificacao');
    notificacoes.forEach(notificacao => {
      this.fechar(notificacao);
    });
  }
}

// Exporta instância única do serviço
const notificacaoService = new NotificacaoService();
export default notificacaoService; 