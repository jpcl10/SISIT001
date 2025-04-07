/**
 * Sistema UBS - Manipulador de Solicitações na Interface
 * 
 * Responsável por gerenciar listagens e ações de solicitações na UI
 */

import solicitacaoService from '../services/SolicitacaoService.js';
import authService from '../services/AuthService.js';

/**
 * Classe que gerencia solicitações na UI
 */
class SolicitacaoHandler {
  /**
   * Inicializa um manipulador de solicitações
   * @param {string} containerId - ID do container que exibirá as solicitações
   * @param {Object} options - Opções de configuração
   */
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.containerElement = document.getElementById(containerId);
    this.options = {
      template: options.template || this.getDefaultTemplate(),
      filtros: options.filtros || {},
      atualizacaoAutomatica: options.atualizacaoAutomatica !== undefined ? options.atualizacaoAutomatica : false,
      intervaloAtualizacao: options.intervaloAtualizacao || 60000, // 1 minuto
      onItemClick: options.onItemClick || null,
      onAcaoClick: options.onAcaoClick || null,
      onCarregamento: options.onCarregamento || null
    };

    if (!this.containerElement) {
      console.error(`Container #${containerId} não encontrado no documento.`);
      return;
    }

    this.solicitacoes = [];
    this.intervalId = null;
    this.loading = false;
    this.inicializar();
  }

  /**
   * Inicializa o manipulador
   */
  inicializar() {
    // Carregar solicitações iniciais
    this.carregarSolicitacoes();

    // Configurar atualização automática se habilitada
    if (this.options.atualizacaoAutomatica) {
      this.iniciarAtualizacaoAutomatica();
    }

    // Delegação de eventos para o container
    this.containerElement.addEventListener('click', this.handleContainerClick.bind(this));
  }

  /**
   * Carrega solicitações com os filtros configurados
   * @returns {Promise<Array>} - Lista de solicitações carregadas
   */
  async carregarSolicitacoes() {
    try {
      this.setLoading(true);

      // Obter solicitações do serviço
      this.solicitacoes = await solicitacaoService.obterSolicitacoes(this.options.filtros);
      
      // Renderizar a lista
      this.renderizar();

      // Chamar callback de carregamento
      if (this.options.onCarregamento) {
        this.options.onCarregamento(this.solicitacoes);
      }

      this.setLoading(false);
      return this.solicitacoes;
    } catch (erro) {
      console.error('Erro ao carregar solicitações:', erro);
      this.mostrarErro('Não foi possível carregar as solicitações');
      this.setLoading(false);
      return [];
    }
  }

  /**
   * Atualiza os filtros e recarrega as solicitações
   * @param {Object} filtros - Novos filtros a serem aplicados
   */
  atualizarFiltros(filtros) {
    this.options.filtros = { ...this.options.filtros, ...filtros };
    this.carregarSolicitacoes();
  }

  /**
   * Inicia a atualização automática das solicitações
   */
  iniciarAtualizacaoAutomatica() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.carregarSolicitacoes();
    }, this.options.intervaloAtualizacao);
  }

  /**
   * Para a atualização automática das solicitações
   */
  pararAtualizacaoAutomatica() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Define o estado de carregamento
   * @param {boolean} isLoading - Se está carregando ou não
   */
  setLoading(isLoading) {
    this.loading = isLoading;
    
    // Adicionar/remover classe de loading
    if (isLoading) {
      this.containerElement.classList.add('loading');
    } else {
      this.containerElement.classList.remove('loading');
    }
  }

  /**
   * Renderiza a lista de solicitações
   */
  renderizar() {
    // Verificar se há solicitações
    if (this.solicitacoes.length === 0) {
      this.containerElement.innerHTML = `
        <div class="alert alert-info">
          Nenhuma solicitação encontrada com os filtros selecionados.
        </div>
      `;
      return;
    }

    // Construir HTML da lista
    let html = '';
    
    this.solicitacoes.forEach(solicitacao => {
      html += this.renderizarItem(solicitacao);
    });

    this.containerElement.innerHTML = html;
  }

  /**
   * Renderiza um item de solicitação
   * @param {Object} solicitacao - Dados da solicitação
   * @returns {string} - HTML do item
   */
  renderizarItem(solicitacao) {
    const usuario = authService.getUsuarioAtual();
    const perfil = usuario ? usuario.perfil : '';
    
    // Determinar ações disponíveis para esta solicitação com base no status e perfil
    const acoes = this.obterAcoesDisponiveis(solicitacao, perfil);
    
    // Renderizar acões
    let botoesAcoes = '';
    acoes.forEach(acao => {
      const classesBotao = acao.classe || 'btn-secondary';
      botoesAcoes += `
        <button 
          class="btn btn-sm ${classesBotao}" 
          data-acao="${acao.id}" 
          data-solicitacao-id="${solicitacao._id}"
          title="${acao.titulo || acao.texto}"
        >
          ${acao.texto}
        </button>
      `;
    });
    
    // Substituir placeholders no template
    return this.options.template
      .replace('{ID}', solicitacao._id)
      .replace('{PACIENTE}', solicitacao.dadosPaciente?.nomePaciente || 'Não informado')
      .replace('{TIPO}', solicitacao.tipoSolicitacao || 'Não informado')
      .replace('{UNIDADE}', solicitacao.dadosPaciente?.nomeUnidade || 'Não informado')
      .replace('{DATA}', this.formatarData(solicitacao._dataCriacao))
      .replace('{STATUS}', this.formatarStatus(solicitacao._status))
      .replace('{PRIORIDADE}', this.formatarPrioridade(solicitacao.prioridade))
      .replace('{ACOES}', botoesAcoes);
  }

  /**
   * Obtém ações disponíveis para uma solicitação
   * @param {Object} solicitacao - Dados da solicitação
   * @param {string} perfil - Perfil do usuário
   * @returns {Array} - Lista de ações disponíveis
   */
  obterAcoesDisponiveis(solicitacao, perfil) {
    const acoes = [];
    const status = solicitacao._status;
    
    // Ação de visualizar (sempre disponível)
    acoes.push({
      id: 'visualizar',
      texto: 'Visualizar',
      titulo: 'Visualizar detalhes da solicitação',
      classe: 'btn-info'
    });
    
    // Ações com base no status e perfil
    if (status === 'rascunho' && (perfil === 'ubs' || perfil === 'admin')) {
      acoes.push({
        id: 'editar',
        texto: 'Editar',
        titulo: 'Editar solicitação',
        classe: 'btn-primary'
      });
      
      acoes.push({
        id: 'enviar',
        texto: 'Enviar',
        titulo: 'Enviar solicitação',
        classe: 'btn-success'
      });
      
      acoes.push({
        id: 'excluir',
        texto: 'Excluir',
        titulo: 'Excluir solicitação',
        classe: 'btn-danger'
      });
    }
    
    if (status === 'enviado' && (perfil === 'regulador' || perfil === 'admin')) {
      acoes.push({
        id: 'analisar',
        texto: 'Analisar',
        titulo: 'Marcar para análise',
        classe: 'btn-primary'
      });
      
      acoes.push({
        id: 'aprovar',
        texto: 'Aprovar',
        titulo: 'Aprovar solicitação',
        classe: 'btn-success'
      });
      
      acoes.push({
        id: 'devolver',
        texto: 'Devolver',
        titulo: 'Devolver para correção',
        classe: 'btn-warning'
      });
      
      acoes.push({
        id: 'negar',
        texto: 'Negar',
        titulo: 'Negar solicitação',
        classe: 'btn-danger'
      });
    }
    
    if (status === 'em_analise' && (perfil === 'regulador' || perfil === 'admin')) {
      acoes.push({
        id: 'aprovar',
        texto: 'Aprovar',
        titulo: 'Aprovar solicitação',
        classe: 'btn-success'
      });
      
      acoes.push({
        id: 'devolver',
        texto: 'Devolver',
        titulo: 'Devolver para correção',
        classe: 'btn-warning'
      });
      
      acoes.push({
        id: 'negar',
        texto: 'Negar',
        titulo: 'Negar solicitação',
        classe: 'btn-danger'
      });
    }
    
    if (status === 'devolvido' && (perfil === 'ubs' || perfil === 'admin')) {
      acoes.push({
        id: 'editar',
        texto: 'Editar',
        titulo: 'Editar solicitação',
        classe: 'btn-primary'
      });
      
      acoes.push({
        id: 'enviar',
        texto: 'Reenviar',
        titulo: 'Reenviar solicitação',
        classe: 'btn-success'
      });
      
      acoes.push({
        id: 'cancelar',
        texto: 'Cancelar',
        titulo: 'Cancelar solicitação',
        classe: 'btn-danger'
      });
    }
    
    // Ação de cancelamento (disponível para solicitação não finalizadas)
    const statusFinais = ['aprovado', 'negado', 'cancelado'];
    if (!statusFinais.includes(status) && 
        (perfil === 'admin' || 
         (perfil === 'ubs' && status !== 'em_analise') || 
         (perfil === 'regulador' && ['enviado', 'em_analise'].includes(status)))) {
      
      if (!acoes.some(a => a.id === 'cancelar')) {
        acoes.push({
          id: 'cancelar',
          texto: 'Cancelar',
          titulo: 'Cancelar solicitação',
          classe: 'btn-outline-danger'
        });
      }
    }
    
    return acoes;
  }

  /**
   * Manipulador de cliques no container
   * @param {Event} evento - Evento de clique
   */
  handleContainerClick(evento) {
    // Verificar se clicou em um botão de ação
    const botaoAcao = evento.target.closest('[data-acao]');
    if (botaoAcao) {
      const acao = botaoAcao.dataset.acao;
      const idSolicitacao = botaoAcao.dataset.solicitacaoId;
      
      if (acao && idSolicitacao) {
        evento.preventDefault();
        this.executarAcao(acao, idSolicitacao);
      }
      return;
    }
    
    // Verificar se clicou em um item de solicitação
    const itemSolicitacao = evento.target.closest('[data-solicitacao-id]');
    if (itemSolicitacao && !botaoAcao) {
      const idSolicitacao = itemSolicitacao.dataset.solicitacaoId;
      
      if (idSolicitacao && this.options.onItemClick) {
        evento.preventDefault();
        const solicitacao = this.solicitacoes.find(s => s._id === idSolicitacao);
        this.options.onItemClick(solicitacao);
      }
    }
  }

  /**
   * Executa uma ação em uma solicitação
   * @param {string} acao - Ação a executar
   * @param {string} idSolicitacao - ID da solicitação
   */
  async executarAcao(acao, idSolicitacao) {
    try {
      // Ações que não requerem chamada ao serviço
      if (acao === 'visualizar' || acao === 'editar') {
        if (this.options.onAcaoClick) {
          const solicitacao = this.solicitacoes.find(s => s._id === idSolicitacao);
          this.options.onAcaoClick(acao, solicitacao);
        }
        return;
      }

      // Ações que requerem confirmação
      const acoesComConfirmacao = ['excluir', 'cancelar', 'negar'];
      if (acoesComConfirmacao.includes(acao)) {
        const confirmacao = confirm(`Deseja realmente ${acao} esta solicitação?`);
        if (!confirmacao) return;
      }

      // Ações que requerem justificativa ou observações
      let detalhes = {};
      
      if (acao === 'negar') {
        const justificativa = prompt('Informe a justificativa para negar esta solicitação:');
        if (!justificativa) return;
        detalhes.justificativa = justificativa;
      }
      
      if (acao === 'devolver') {
        const motivo = prompt('Informe o motivo para devolver esta solicitação:');
        if (!motivo) return;
        detalhes.motivo = motivo;
      }
      
      if (acao === 'cancelar') {
        const motivo = prompt('Informe o motivo para cancelar esta solicitação:');
        if (!motivo) return;
        detalhes.motivo = motivo;
      }
      
      if (acao === 'aprovar') {
        const observacoes = prompt('Observações para aprovação (opcional):');
        if (observacoes) detalhes.observacoes = observacoes;
      }

      // Executar ação de acordo com o tipo
      let sucesso = false;
      
      if (acao === 'excluir') {
        sucesso = await solicitacaoService.remover(idSolicitacao);
      } else if (acao === 'enviar') {
        // Em caso de envio ou reenvio, mudar para o status "enviado"
        sucesso = await solicitacaoService.alterarStatus(idSolicitacao, 'enviado', detalhes);
      } else {
        // Para outras ações, executar via adapter de solicitações
        sucesso = await solicitacaoService.alterarStatus(
          idSolicitacao, 
          this.mapearAcaoParaStatus(acao), 
          detalhes
        );
      }

      // Se a ação foi bem-sucedida, recarregar a lista
      if (sucesso) {
        this.mostrarMensagem(`Solicitação ${this.getTextoAcao(acao)} com sucesso`);
        this.carregarSolicitacoes();
        
        // Chamar callback de ação
        if (this.options.onAcaoClick) {
          const solicitacao = this.solicitacoes.find(s => s._id === idSolicitacao);
          this.options.onAcaoClick(acao, solicitacao, true);
        }
      } else {
        throw new Error(`Não foi possível ${acao} a solicitação`);
      }
    } catch (erro) {
      console.error(`Erro ao ${acao} solicitação:`, erro);
      this.mostrarErro(`Erro ao ${this.getTextoAcao(acao)} solicitação: ${erro.message}`);
      
      // Chamar callback de ação com erro
      if (this.options.onAcaoClick) {
        const solicitacao = this.solicitacoes.find(s => s._id === idSolicitacao);
        this.options.onAcaoClick(acao, solicitacao, false, erro);
      }
    }
  }

  /**
   * Mapeia uma ação para o status correspondente
   * @param {string} acao - Ação a ser mapeada
   * @returns {string} - Status correspondente
   */
  mapearAcaoParaStatus(acao) {
    const mapeamento = {
      'aprovar': 'aprovado',
      'negar': 'negado',
      'analisar': 'em_analise',
      'devolver': 'devolvido',
      'cancelar': 'cancelado',
      'enviar': 'enviado'
    };

    return mapeamento[acao] || acao;
  }

  /**
   * Obtém texto para uma ação (para mensagens)
   * @param {string} acao - Ação
   * @returns {string} - Texto para a ação
   */
  getTextoAcao(acao) {
    const mapeamento = {
      'aprovar': 'aprovada',
      'negar': 'negada',
      'analisar': 'em análise',
      'devolver': 'devolvida',
      'cancelar': 'cancelada',
      'enviar': 'enviada',
      'excluir': 'excluída',
      'editar': 'editada',
      'visualizar': 'visualizada'
    };

    return mapeamento[acao] || acao;
  }

  /**
   * Formata uma data para exibição
   * @param {string} dataISO - Data em formato ISO
   * @returns {string} - Data formatada
   */
  formatarData(dataISO) {
    if (!dataISO) return 'Não informado';
    
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formata um status para exibição
   * @param {string} status - Status da solicitação
   * @returns {string} - HTML com status formatado
   */
  formatarStatus(status) {
    const classesCss = {
      'rascunho': 'bg-secondary',
      'enviado': 'bg-primary',
      'em_analise': 'bg-info',
      'aprovado': 'bg-success',
      'negado': 'bg-danger',
      'devolvido': 'bg-warning',
      'cancelado': 'bg-dark'
    };

    const textos = {
      'rascunho': 'Rascunho',
      'enviado': 'Enviado',
      'em_analise': 'Em Análise',
      'aprovado': 'Aprovado',
      'negado': 'Negado',
      'devolvido': 'Devolvido',
      'cancelado': 'Cancelado'
    };

    const classe = classesCss[status] || 'bg-secondary';
    const texto = textos[status] || status;

    return `<span class="badge ${classe}">${texto}</span>`;
  }

  /**
   * Formata uma prioridade para exibição
   * @param {string} prioridade - Prioridade da solicitação
   * @returns {string} - HTML com prioridade formatada
   */
  formatarPrioridade(prioridade) {
    const classesCss = {
      'baixa': 'bg-success',
      'normal': 'bg-info',
      'media': 'bg-primary',
      'alta': 'bg-warning',
      'urgente': 'bg-danger'
    };

    const textos = {
      'baixa': 'Baixa',
      'normal': 'Normal',
      'media': 'Média',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };

    const classe = classesCss[prioridade] || 'bg-info';
    const texto = textos[prioridade] || prioridade || 'Normal';

    return `<span class="badge ${classe}">${texto}</span>`;
  }

  /**
   * Mostra uma mensagem de sucesso
   * @param {string} mensagem - Mensagem a ser exibida
   */
  mostrarMensagem(mensagem) {
    // Verificar se existe um container de mensagens
    let containerMensagens = document.getElementById(`${this.containerId}-mensagens`);
    
    if (!containerMensagens) {
      // Criar container de mensagens
      containerMensagens = document.createElement('div');
      containerMensagens.id = `${this.containerId}-mensagens`;
      containerMensagens.className = 'alert alert-success alert-dismissible fade show';
      containerMensagens.setAttribute('role', 'alert');
      containerMensagens.innerHTML = `
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
      `;
      this.containerElement.before(containerMensagens);
    } else {
      containerMensagens.className = 'alert alert-success alert-dismissible fade show';
    }

    // Adicionar mensagem
    containerMensagens.innerHTML = `
      ${mensagem}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    
    // Auto-fechar após 5 segundos
    setTimeout(() => {
      const alert = bootstrap.Alert.getOrCreateInstance(containerMensagens);
      if (alert) alert.close();
    }, 5000);
  }

  /**
   * Mostra uma mensagem de erro
   * @param {string} mensagem - Mensagem a ser exibida
   */
  mostrarErro(mensagem) {
    // Verificar se existe um container de mensagens
    let containerMensagens = document.getElementById(`${this.containerId}-mensagens`);
    
    if (!containerMensagens) {
      // Criar container de mensagens
      containerMensagens = document.createElement('div');
      containerMensagens.id = `${this.containerId}-mensagens`;
      containerMensagens.className = 'alert alert-danger alert-dismissible fade show';
      containerMensagens.setAttribute('role', 'alert');
      containerMensagens.innerHTML = `
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
      `;
      this.containerElement.before(containerMensagens);
    } else {
      containerMensagens.className = 'alert alert-danger alert-dismissible fade show';
    }

    // Adicionar mensagem
    containerMensagens.innerHTML = `
      ${mensagem}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
  }

  /**
   * Obtém o template padrão para renderização de itens
   * @returns {string} Template HTML
   */
  getDefaultTemplate() {
    return `
      <div class="card mb-3" data-solicitacao-id="{ID}">
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <strong>Paciente:</strong> {PACIENTE}
            </div>
            <div class="col-md-3">
              <strong>Tipo:</strong> {TIPO}
            </div>
            <div class="col-md-3">
              <strong>Unidade:</strong> {UNIDADE}
            </div>
            <div class="col-md-3">
              <strong>Data:</strong> {DATA}
            </div>
          </div>
          <div class="row mt-2">
            <div class="col-md-3">
              <strong>Status:</strong> {STATUS}
            </div>
            <div class="col-md-3">
              <strong>Prioridade:</strong> {PRIORIDADE}
            </div>
            <div class="col-md-6 text-end">
              {ACOES}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Define o callback para clique em item
   * @param {Function} callback - Função a ser chamada quando um item for clicado
   * @returns {SolicitacaoHandler} - Instância para encadeamento
   */
  onItemClick(callback) {
    this.options.onItemClick = callback;
    return this;
  }

  /**
   * Define o callback para ações
   * @param {Function} callback - Função a ser chamada quando uma ação for executada
   * @returns {SolicitacaoHandler} - Instância para encadeamento
   */
  onAcaoClick(callback) {
    this.options.onAcaoClick = callback;
    return this;
  }

  /**
   * Define o callback para carregamento
   * @param {Function} callback - Função a ser chamada quando as solicitações forem carregadas
   * @returns {SolicitacaoHandler} - Instância para encadeamento
   */
  onCarregamento(callback) {
    this.options.onCarregamento = callback;
    return this;
  }
}

export default SolicitacaoHandler; 