/**
 * Serviço de Solicitações
 * 
 * Gerencia todas as operações relacionadas a solicitações de encaminhamentos
 */

const apiService = require('./ApiService');
const authService = require('./AuthService');
const storageService = require('./StorageService');
const solicitacaoMapper = require('./mappers/SolicitacaoMapper');
const solicitacaoValidator = require('./validators/SolicitacaoValidator');
const { NIVEL_LOG, CONTEXTO_LOG } = require('./LogService');

/**
 * Classe responsável por gerenciar filtros de solicitações
 * Extraída da classe principal para melhorar a modularidade
 */
class SolicitacaoFilterManager {
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * Aplica filtros em uma lista de solicitações
   * @param {Array} solicitacoes - Lista de solicitações
   * @param {Object} filtros - Filtros a aplicar
   * @returns {Array} - Lista filtrada
   */
  aplicarFiltros(solicitacoes, filtros) {
    const { status, tipo, unidade, paciente, dataInicial, dataFinal, minhasSolicitacoes } = filtros;
    let resultado = [...solicitacoes];
    
    // Se for para mostrar apenas solicitações do usuário atual
    if (minhasSolicitacoes) {
      const usuario = this.authService.getUsuarioAtual();
      if (usuario) {
        resultado = resultado.filter(s => {
          if (usuario.perfil === 'ubs') {
            // Para UBS, filtrar por unidade
            return s.dadosPaciente.nomeUnidade === usuario.unidade;
          } else if (usuario.perfil === 'regulador') {
            // Para regulador, mostrar solicitações atribuídas a ele
            return s._reguladorId === usuario.id;
          }
          return true; // Admin vê tudo
        });
      }
    }
    
    // Aplicar outros filtros
    if (status) {
      resultado = resultado.filter(s => s._status === status);
    }
    
    if (tipo) {
      resultado = resultado.filter(s => s.tipoSolicitacao === tipo);
    }
    
    if (unidade) {
      resultado = resultado.filter(s => 
        s.dadosPaciente.nomeUnidade && 
        s.dadosPaciente.nomeUnidade.toLowerCase().includes(unidade.toLowerCase())
      );
    }
    
    if (paciente) {
      resultado = resultado.filter(s => 
        s.dadosPaciente.nomePaciente && 
        s.dadosPaciente.nomePaciente.toLowerCase().includes(paciente.toLowerCase())
      );
    }
    
    // Filtro por data
    resultado = this._aplicarFiltrosData(resultado, dataInicial, dataFinal);
    
    return resultado;
  }

  /**
   * Aplica filtros de data em uma lista de solicitações
   * @param {Array} solicitacoes - Lista de solicitações
   * @param {string} dataInicial - Data inicial (yyyy-mm-dd)
   * @param {string} dataFinal - Data final (yyyy-mm-dd)
   * @returns {Array} - Lista filtrada por data
   * @private
   */
  _aplicarFiltrosData(solicitacoes, dataInicial, dataFinal) {
    let resultado = [...solicitacoes];
    
    if (dataInicial) {
      const dataInicialObj = new Date(dataInicial);
      resultado = resultado.filter(s => new Date(s._dataCriacao) >= dataInicialObj);
    }
    
    if (dataFinal) {
      const dataFinalObj = new Date(dataFinal);
      dataFinalObj.setHours(23, 59, 59); // Fim do dia
      resultado = resultado.filter(s => new Date(s._dataCriacao) <= dataFinalObj);
    }
    
    return resultado;
  }
}

/**
 * Gerenciador de eventos e histórico de solicitações
 * Extrai a lógica relacionada a registros históricos e eventos
 */
class SolicitacaoHistoricoManager {
  /**
   * Registra um evento no histórico da solicitação
   * @param {object} solicitacao - Objeto de solicitação a atualizar
   * @param {string} mensagem - Mensagem descritiva do evento
   * @param {object} usuario - Usuário que executou a ação
   * @param {object} detalhes - Detalhes adicionais do evento
   * @returns {object} - Solicitação atualizada com novo evento no histórico
   */
  registrarEvento(solicitacao, mensagem, usuario = null, detalhes = {}) {
    // Garantir que o histórico existe
    if (!solicitacao._historico) {
      solicitacao._historico = [];
    }
    
    // Criar objeto do evento
    const evento = {
      data: new Date().toISOString(),
      mensagem,
      detalhes: { ...detalhes }
    };
    
    // Adicionar usuário se fornecido
    if (usuario) {
      evento.usuario = {
        id: usuario.id,
        nome: usuario.nome,
        perfil: usuario.perfil
      };
    }
    
    // Adicionar ao histórico
    solicitacao._historico.push(evento);
    
    // Atualizar data da modificação
    solicitacao._dataAtualizacao = new Date().toISOString();
    
    return solicitacao;
  }
  
  /**
   * Obtém o histórico completo de uma solicitação
   * @param {string} idSolicitacao - ID da solicitação
   * @param {object} solicitacao - Opcional: objeto de solicitação já carregado
   * @returns {array} - Lista de eventos no histórico
   */
  async obterHistorico(idSolicitacao, solicitacao = null) {
    // Se não foi fornecida a solicitação, buscar pelo ID
    if (!solicitacao) {
      try {
        if (apiService.mockMode) {
          solicitacao = storageService.buscarSolicitacaoPorId(idSolicitacao);
        } else {
          const resposta = await apiService.fetch(`${apiService.endpoints.solicitacoes}/${idSolicitacao}/historico`);
          return resposta.data;
        }
      } catch (error) {
        console.error(`Erro ao obter histórico da solicitação ${idSolicitacao}:`, error);
        throw new Error('Não foi possível obter o histórico da solicitação');
      }
    }
    
    // Retorna o histórico ou um array vazio se não existir
    return solicitacao._historico || [];
  }
}

class SolicitacaoService {
  constructor() {
    this.statusSolicitacao = {
      RASCUNHO: 'rascunho',
      ENVIADO: 'enviado',
      ANALISE: 'em_analise',
      APROVADO: 'aprovado',
      NEGADO: 'negado',
      DEVOLVIDO: 'devolvido',
      CANCELADO: 'cancelado'
    };
    
    this.prioridadeSolicitacao = {
      BAIXA: 'baixa',
      MEDIA: 'media',
      ALTA: 'alta',
      URGENTE: 'urgente'
    };

    // Inicialização dos gerenciadores 
    this.filterManager = new SolicitacaoFilterManager(authService);
    this.historicoManager = new SolicitacaoHistoricoManager();
  }

  /**
   * Obtém todas as solicitações, com opção de filtros
   * @param {Object} filtros - Filtros a serem aplicados
   * @returns {Promise<Array>} - Lista de solicitações
   */
  async obterSolicitacoes(filtros = {}) {
    try {
      let solicitacoes;
      
      // Verifica se deve usar a API ou armazenamento local
      if (apiService.mockMode) {
        solicitacoes = storageService.obterTodasSolicitacoes();
        
        // Aplica filtros localmente usando o gerenciador de filtros
        solicitacoes = this.filterManager.aplicarFiltros(solicitacoes, filtros);
      } else {
        // Obtém da API
        const resposta = await apiService.obterSolicitacoes(filtros);
        solicitacoes = resposta.data.map(item => solicitacaoMapper.toModel(item));
      }
      
      return solicitacoes;
    } catch (error) {
      console.error('Erro ao obter solicitações:', error);
      throw new Error('Não foi possível obter as solicitações');
    }
  }

  /**
   * Obtém uma solicitação pelo ID
   * @param {string} id - ID da solicitação
   * @returns {Promise<Object>} - Dados da solicitação
   */
  async obterPorId(id) {
    try {
      if (apiService.mockMode) {
        const solicitacao = storageService.buscarSolicitacaoPorId(id);
        if (!solicitacao) {
          throw new Error('Solicitação não encontrada');
        }
        return solicitacao;
      } else {
        const resposta = await apiService.fetch(`${apiService.endpoints.solicitacoes}/${id}`);
        return solicitacaoMapper.toModel(resposta);
      }
    } catch (error) {
      console.error(`Erro ao obter solicitação ${id}:`, error);
      throw new Error('Não foi possível obter a solicitação');
    }
  }

  /**
   * Cria uma nova solicitação
   * @param {string} tipoSolicitacao - Tipo de solicitação (ressonancia, mamografia, etc)
   * @param {Object} dadosFormulario - Dados específicos do formulário
   * @param {boolean} salvarComoRascunho - Se a solicitação deve ser salva como rascunho
   * @returns {Promise<string>} - ID da solicitação criada
   */
  async criar(tipoSolicitacao, dadosFormulario, salvarComoRascunho = false) {
    try {
      // Criar objeto solicitação
      const solicitacao = {
        tipoSolicitacao,
        dadosEspecificos: dadosFormulario,
        dadosPaciente: storageService.obterDadosEtapa1(),
        _status: salvarComoRascunho ? this.statusSolicitacao.RASCUNHO : this.statusSolicitacao.ENVIADO,
        _dataCriacao: new Date().toISOString()
      };

      // Validar solicitação
      const validacao = solicitacaoValidator.validarSolicitacao(solicitacao);
      if (!validacao.valido) {
        throw new Error(`Dados inválidos: ${validacao.erros.join(', ')}`);
      }

      // Registrar usuário que criou
      const usuario = authService.getUsuarioAtual();
      if (usuario) {
        solicitacao._criadoPor = {
          id: usuario.id,
          nome: usuario.nome,
          perfil: usuario.perfil,
          unidade: usuario.unidade
        };
      }

      // Salvar solicitação (local ou API)
      let idSolicitacao;
      
      if (apiService.mockMode) {
        // Modo local
        idSolicitacao = storageService.salvarFormulario(tipoSolicitacao, dadosFormulario);
        
        // Atualizar status e metadados
        if (!salvarComoRascunho) {
          storageService.atualizarSolicitacao(idSolicitacao, {
            _status: this.statusSolicitacao.ENVIADO,
            _dataEnvio: new Date().toISOString(),
            _criadoPor: solicitacao._criadoPor
          });
        }
      } else {
        // Modo API
        const resposta = await apiService.fetch(apiService.endpoints.solicitacoes, {
          method: 'POST',
          body: JSON.stringify(solicitacaoMapper.toApi(solicitacao))
        });
        
        idSolicitacao = resposta.id;
      }
      
      // Registrar evento no histórico
      if (!salvarComoRascunho) {
        this.registrarEvento(
          idSolicitacao, 
          'Solicitação enviada à Central de Regulação',
          usuario
        );
      }
      
      return idSolicitacao;
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma solicitação existente
   * @param {string} id - ID da solicitação
   * @param {Object} dados - Novos dados para a solicitação
   * @returns {Promise<boolean>} - Indica se a atualização foi bem-sucedida
   */
  async atualizar(id, dados) {
    try {
      // Obter solicitação atual
      const solicitacaoAtual = await this.obterPorId(id);
      
      // Mesclar dados
      const solicitacaoAtualizada = {
        ...solicitacaoAtual,
        ...dados,
        _ultimaAtualizacao: new Date().toISOString()
      };
      
      // Validar solicitação
      const validacao = solicitacaoValidator.validarSolicitacao(solicitacaoAtualizada);
      if (!validacao.valido) {
        throw new Error(`Dados inválidos: ${validacao.erros.join(', ')}`);
      }
      
      // Salvar solicitação
      if (apiService.mockMode) {
        return storageService.atualizarSolicitacao(id, dados);
      } else {
        await apiService.fetch(`${apiService.endpoints.solicitacoes}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(solicitacaoMapper.toApi(solicitacaoAtualizada))
        });
        return true;
      }
    } catch (error) {
      console.error(`Erro ao atualizar solicitação ${id}:`, error);
      throw new Error('Não foi possível atualizar a solicitação');
    }
  }

  /**
   * Altera o status de uma solicitação
   * @param {string} id - ID da solicitação
   * @param {string} novoStatus - Novo status
   * @param {Object} detalhes - Detalhes adicionais
   * @returns {Promise<boolean>} - Indica se a alteração foi bem-sucedida
   */
  async alterarStatus(id, novoStatus, detalhes = {}) {
    try {
      // Buscar solicitação atual
      const solicitacao = await this.obterPorId(id);
      
      // Verificar se a transição de status é válida
      const validacao = solicitacaoValidator.validarTransicaoStatus(solicitacao._status, novoStatus);
      if (!validacao.valido) {
        throw new Error(validacao.mensagem);
      }
      
      // Verificar permissões do usuário
      const usuario = authService.getUsuarioAtual();
      if (!usuario) {
        throw new Error('Usuário não autenticado');
      }
      
      // Preparar dados para atualização
      const dadosAtualizacao = {
        _status: novoStatus,
        _dataAlteracaoStatus: new Date().toISOString()
      };
      
      // Adicionar detalhes conforme o status
      if (novoStatus === this.statusSolicitacao.NEGADO && !detalhes.justificativa) {
        throw new Error('É necessário informar uma justificativa para negar a solicitação');
      }
      
      if (detalhes.justificativa) {
        dadosAtualizacao.justificativa = detalhes.justificativa;
      }
      
      if (detalhes.observacoes) {
        dadosAtualizacao.observacoes = detalhes.observacoes;
      }
      
      // Executar alteração de status
      let sucesso;
      
      if (apiService.mockMode) {
        sucesso = storageService.alterarStatusSolicitacao(id, novoStatus);
        
        // Atualizar outros dados além do status
        if (sucesso && Object.keys(dadosAtualizacao).length > 2) {
          sucesso = storageService.atualizarSolicitacao(id, dadosAtualizacao);
        }
      } else {
        await apiService.fetch(`${apiService.endpoints.solicitacoes}/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: solicitacaoMapper._normalizarStatusParaApi(novoStatus),
            ...detalhes
          })
        });
        sucesso = true;
      }
      
      // Registrar evento no histórico
      if (sucesso) {
        let mensagemEvento;
        
        switch (novoStatus) {
          case this.statusSolicitacao.APROVADO:
            mensagemEvento = 'Solicitação aprovada';
            break;
          case this.statusSolicitacao.NEGADO:
            mensagemEvento = `Solicitação negada: ${detalhes.justificativa || 'Sem justificativa'}`;
            break;
          case this.statusSolicitacao.DEVOLVIDO:
            mensagemEvento = `Solicitação devolvida: ${detalhes.motivo || 'Sem motivo especificado'}`;
            break;
          case this.statusSolicitacao.CANCELADO:
            mensagemEvento = `Solicitação cancelada: ${detalhes.motivo || 'Sem motivo especificado'}`;
            break;
          case this.statusSolicitacao.ANALISE:
            mensagemEvento = 'Solicitação em análise';
            break;
          case this.statusSolicitacao.ENVIADO:
            mensagemEvento = 'Solicitação enviada à Central de Regulação';
            break;
          default:
            mensagemEvento = `Status alterado para: ${novoStatus}`;
        }
        
        this.registrarEvento(id, mensagemEvento, usuario, detalhes);
      }
      
      return sucesso;
    } catch (error) {
      console.error(`Erro ao alterar status da solicitação ${id}:`, error);
      throw error;
    }
  }

  /**
   * Registra um evento no histórico da solicitação
   * @param {string} idSolicitacao - ID da solicitação
   * @param {string} mensagem - Mensagem descritiva do evento
   * @param {object} usuario - Usuário que executou a ação (opcional)
   * @param {object} detalhes - Detalhes adicionais do evento (opcional)
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async registrarEvento(idSolicitacao, mensagem, usuario = null, detalhes = {}) {
    try {
      if (apiService.mockMode) {
        // Buscar solicitação
        const solicitacao = await this.obterPorId(idSolicitacao);
        if (!solicitacao) {
          throw new Error('Solicitação não encontrada');
        }
        
        // Registrar evento usando o gerenciador de histórico
        const atualizada = this.historicoManager.registrarEvento(
          solicitacao, 
          mensagem,
          usuario || authService.getUsuarioAtual(),
          detalhes
        );
        
        // Salvar solicitação atualizada
        storageService.atualizarSolicitacao(idSolicitacao, atualizada);
      } else {
        // Enviar para API
        await apiService.fetch(`${apiService.endpoints.solicitacoes}/${idSolicitacao}/eventos`, {
          method: 'POST',
          body: JSON.stringify({
            mensagem,
            detalhes
          })
        });
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao registrar evento na solicitação ${idSolicitacao}:`, error);
      throw new Error('Não foi possível registrar o evento na solicitação');
    }
  }

  /**
   * Remove uma solicitação
   * @param {string} id - ID da solicitação
   * @returns {Promise<boolean>} - Indica se a remoção foi bem-sucedida
   */
  async remover(id) {
    try {
      // Verificar permissões
      const usuario = authService.getUsuarioAtual();
      if (!usuario) {
        throw new Error('Usuário não autenticado');
      }
      
      // Apenas admin pode remover solicitações aprovadas ou negadas
      const solicitacao = await this.obterPorId(id);
      const statusFinais = [this.statusSolicitacao.APROVADO, this.statusSolicitacao.NEGADO];
      
      if (statusFinais.includes(solicitacao._status) && usuario.perfil !== 'admin') {
        throw new Error('Apenas administradores podem remover solicitações aprovadas ou negadas');
      }
      
      // Executar remoção
      if (apiService.mockMode) {
        return storageService.removerSolicitacao(id);
      } else {
        await apiService.fetch(`${apiService.endpoints.solicitacoes}/${id}`, {
          method: 'DELETE'
        });
        return true;
      }
    } catch (error) {
      console.error(`Erro ao remover solicitação ${id}:`, error);
      throw new Error('Não foi possível remover a solicitação');
    }
  }
}

// Exporta instância única do serviço
const solicitacaoService = new SolicitacaoService();
module.exports = solicitacaoService; 