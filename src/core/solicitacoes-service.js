/**
 * Sistema de Regulação UBS - Serviço de Solicitações
 * 
 * IMPORTANTE: Este arquivo foi mantido para compatibilidade com código existente.
 * Para novos desenvolvimentos, utilize o serviço em src/services/SolicitacaoService.js
 */

import solicitacaoService from '../services/SolicitacaoService.js';
import authService from './auth.js';

class SolicitacoesAdapter {
  constructor() {
    // Status possíveis para solicitações
    this.statusSolicitacao = solicitacaoService.statusSolicitacao;
    
    // Prioridades possíveis para solicitações
    this.prioridadeSolicitacao = solicitacaoService.prioridadeSolicitacao;
    
    // Fluxo de aprovação
    this.fluxoAprovacao = {
      [this.statusSolicitacao.RASCUNHO]: [
        this.statusSolicitacao.ENVIADO,
        this.statusSolicitacao.CANCELADO
      ],
      [this.statusSolicitacao.ENVIADO]: [
        this.statusSolicitacao.ANALISE,
        this.statusSolicitacao.APROVADO,
        this.statusSolicitacao.DEVOLVIDO,
        this.statusSolicitacao.NEGADO,
        this.statusSolicitacao.CANCELADO
      ],
      [this.statusSolicitacao.ANALISE]: [
        this.statusSolicitacao.APROVADO,
        this.statusSolicitacao.DEVOLVIDO,
        this.statusSolicitacao.NEGADO
      ],
      [this.statusSolicitacao.DEVOLVIDO]: [
        this.statusSolicitacao.ENVIADO,
        this.statusSolicitacao.CANCELADO
      ],
      [this.statusSolicitacao.APROVADO]: [],
      [this.statusSolicitacao.NEGADO]: [],
      [this.statusSolicitacao.CANCELADO]: []
    };
  }

  /**
   * Obtém todas as solicitações, com opção de filtros
   * @param {Object} filtros - Filtros a serem aplicados
   * @returns {Promise<Array>} - Lista de solicitações
   */
  async obterSolicitacoes(filtros = {}) {
    return solicitacaoService.obterSolicitacoes(filtros);
  }

  /**
   * Cria uma nova solicitação
   * @param {string} tipoSolicitacao - Tipo de solicitação (ressonancia, mamografia, etc)
   * @param {Object} dadosFormulario - Dados específicos do formulário
   * @param {boolean} salvarComoRascunho - Se a solicitação deve ser salva como rascunho
   * @returns {Promise<string>} - ID da solicitação criada
   */
  async criarSolicitacao(tipoSolicitacao, dadosFormulario, salvarComoRascunho = false) {
    return solicitacaoService.criar(tipoSolicitacao, dadosFormulario, salvarComoRascunho);
  }

  /**
   * Executa uma ação na solicitação (aprovar, negar, devolver, etc)
   * @param {string} idSolicitacao - ID da solicitação
   * @param {string} acao - Ação a ser executada
   * @param {Object} detalhes - Detalhes adicionais da ação (justificativa, etc)
   * @returns {Promise<boolean>} - Indica se a ação foi executada com sucesso
   */
  async executarAcao(idSolicitacao, acao, detalhes = {}) {
    // Mapear a ação para o status correspondente
    let novoStatus;
    
    switch (acao) {
      case 'aprovar':
        novoStatus = this.statusSolicitacao.APROVADO;
        break;
      case 'negar':
        novoStatus = this.statusSolicitacao.NEGADO;
        break;
      case 'devolver':
        novoStatus = this.statusSolicitacao.DEVOLVIDO;
        break;
      case 'cancelar':
        novoStatus = this.statusSolicitacao.CANCELADO;
        break;
      case 'analisar':
        novoStatus = this.statusSolicitacao.ANALISE;
        break;
      case 'enviar':
        novoStatus = this.statusSolicitacao.ENVIADO;
        break;
      default:
        throw new Error(`Ação desconhecida: ${acao}`);
    }
    
    return solicitacaoService.alterarStatus(idSolicitacao, novoStatus, detalhes);
  }

  /**
   * Registra um evento no histórico da solicitação
   * @param {string} idSolicitacao - ID da solicitação
   * @param {string} mensagem - Mensagem do evento
   * @param {Object} usuario - Usuário que realizou a ação (opcional)
   */
  registrarEvento(idSolicitacao, mensagem, usuario = null) {
    return solicitacaoService.registrarEvento(idSolicitacao, mensagem, usuario);
  }

  /**
   * Obtém estatísticas das solicitações
   * @returns {Promise<Object>} - Estatísticas das solicitações
   */
  async obterEstatisticas() {
    try {
      const solicitacoes = await solicitacaoService.obterSolicitacoes();
      
      // Calcular estatísticas
      const total = solicitacoes.length;
      
      // Contagem por status
      const porStatus = {};
      Object.values(this.statusSolicitacao).forEach(status => {
        porStatus[status] = solicitacoes.filter(s => s._status === status).length;
      });
      
      // Contagem por tipo
      const porTipo = {};
      solicitacoes.forEach(s => {
        const tipo = s.tipoSolicitacao;
        porTipo[tipo] = (porTipo[tipo] || 0) + 1;
      });
      
      // Tempo médio de processamento (em dias)
      const tempoProcessamento = solicitacoes
        .filter(s => s._status === this.statusSolicitacao.APROVADO || s._status === this.statusSolicitacao.NEGADO)
        .map(s => {
          const inicio = new Date(s._dataCriacao);
          const fim = new Date(s._dataAlteracaoStatus || s._ultimaAtualizacao);
          return Math.round((fim - inicio) / (1000 * 60 * 60 * 24)); // Dias
        });
      
      const tempoMedio = tempoProcessamento.length > 0
        ? tempoProcessamento.reduce((acc, val) => acc + val, 0) / tempoProcessamento.length
        : 0;
      
      return {
        total,
        porStatus,
        porTipo,
        tempoMedioProcessamento: tempoMedio
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw new Error('Não foi possível calcular as estatísticas');
    }
  }
}

// Exporta instância única do adaptador
const solicitacoesService = new SolicitacoesAdapter();
export default solicitacoesService; 