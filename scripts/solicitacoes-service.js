/**
 * Sistema de Regulação UBS - Serviço de Solicitações
 * 
 * Serviço unificado que gerencia as solicitações tanto da perspectiva
 * da UBS (criação e acompanhamento) quanto da Central de Regulação (análise e decisão).
 */

import apiService from './api.js';
import authService from './auth.js';
import config from './config.js';
import { mostrarNotificacao } from './utils.js';
import {
  obterTodasSolicitacoes,
  buscarSolicitacaoPorId,
  salvarFormulario,
  atualizarSolicitacao
} from './storage.js';

class SolicitacoesService {
  constructor() {
    // Status possíveis para solicitações
    this.statusSolicitacao = {
      RASCUNHO: 'rascunho',
      ENVIADO: 'enviado',
      ANALISE: 'em_analise',
      APROVADO: 'aprovado',
      NEGADO: 'negado',
      DEVOLVIDO: 'devolvido',
      CANCELADO: 'cancelado'
    };
    
    // Prioridades possíveis para solicitações
    this.prioridadeSolicitacao = {
      BAIXA: 'baixa',
      MEDIA: 'media', 
      ALTA: 'alta',
      URGENTE: 'urgente'
    };
    
    // Fluxo de aprovação - transições permitidas entre status
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
    try {
      const { status, tipo, unidade, paciente, dataInicial, dataFinal, minhasSolicitacoes } = filtros;
      
      // Obter todas as solicitações
      let solicitacoes = obterTodasSolicitacoes();
      
      // Se for para mostrar apenas solicitações do usuário atual
      if (minhasSolicitacoes) {
        const usuario = authService.getUsuarioAtual();
        if (usuario) {
          solicitacoes = solicitacoes.filter(s => {
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
        solicitacoes = solicitacoes.filter(s => s._status === status);
      }
      
      if (tipo) {
        solicitacoes = solicitacoes.filter(s => s.tipoSolicitacao === tipo);
      }
      
      if (unidade) {
        solicitacoes = solicitacoes.filter(s => 
          s.dadosPaciente.nomeUnidade && 
          s.dadosPaciente.nomeUnidade.toLowerCase().includes(unidade.toLowerCase())
        );
      }
      
      if (paciente) {
        solicitacoes = solicitacoes.filter(s => 
          s.dadosPaciente.nomePaciente && 
          s.dadosPaciente.nomePaciente.toLowerCase().includes(paciente.toLowerCase())
        );
      }
      
      if (dataInicial) {
        const dataInicialObj = new Date(dataInicial);
        solicitacoes = solicitacoes.filter(s => new Date(s._dataCriacao) >= dataInicialObj);
      }
      
      if (dataFinal) {
        const dataFinalObj = new Date(dataFinal);
        dataFinalObj.setHours(23, 59, 59); // Fim do dia
        solicitacoes = solicitacoes.filter(s => new Date(s._dataCriacao) <= dataFinalObj);
      }
      
      return solicitacoes;
    } catch (error) {
      console.error('Erro ao obter solicitações:', error);
      mostrarNotificacao('Erro ao carregar solicitações.', 'erro');
      return [];
    }
  }

  /**
   * Cria uma nova solicitação
   * @param {string} tipoSolicitacao - Tipo de solicitação (ressonancia, mamografia, etc)
   * @param {Object} dadosFormulario - Dados específicos do formulário
   * @param {boolean} salvarComoRascunho - Se a solicitação deve ser salva como rascunho
   * @returns {Promise<string>} - ID da solicitação criada
   */
  async criarSolicitacao(tipoSolicitacao, dadosFormulario, salvarComoRascunho = false) {
    try {
      // Salvar solicitação
      const idSolicitacao = salvarFormulario(tipoSolicitacao, dadosFormulario);
      
      // Se não for rascunho, marcar como enviada
      if (!salvarComoRascunho) {
        atualizarSolicitacao(idSolicitacao, {
          _status: this.statusSolicitacao.ENVIADO,
          _dataEnvio: new Date().toISOString()
        });
        
        // Registrar usuário que criou
        const usuario = authService.getUsuarioAtual();
        if (usuario) {
          atualizarSolicitacao(idSolicitacao, {
            _criadoPor: {
              id: usuario.id,
              nome: usuario.nome,
              perfil: usuario.perfil,
              unidade: usuario.unidade
            }
          });
        }
        
        // Registrar evento de sistema
        this.registrarEvento(idSolicitacao, 'Solicitação enviada à Central de Regulação');
      }
      
      return idSolicitacao;
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      mostrarNotificacao('Erro ao criar solicitação.', 'erro');
      throw error;
    }
  }

  /**
   * Executa uma ação na solicitação (aprovar, negar, devolver, etc)
   * @param {string} idSolicitacao - ID da solicitação
   * @param {string} acao - Ação a ser executada
   * @param {Object} detalhes - Detalhes adicionais da ação (justificativa, etc)
   * @returns {Promise<boolean>} - Indica se a ação foi executada com sucesso
   */
  async executarAcao(idSolicitacao, acao, detalhes = {}) {
    try {
      // Buscar solicitação
      const solicitacao = buscarSolicitacaoPorId(idSolicitacao);
      if (!solicitacao) {
        throw new Error('Solicitação não encontrada');
      }
      
      // Verificar permissão do usuário
      const usuario = authService.getUsuarioAtual();
      if (!usuario) {
        throw new Error('Usuário não autenticado');
      }
      
      // Verificar transição de status permitida
      const statusAtual = solicitacao._status;
      let novoStatus;
      let mensagemEvento;
      
      switch (acao) {
        case 'aprovar':
          novoStatus = this.statusSolicitacao.APROVADO;
          mensagemEvento = 'Solicitação aprovada';
          
          // Verificar se é regulador ou admin
          if (!['regulador', 'admin'].includes(usuario.perfil)) {
            throw new Error('Apenas reguladores e administradores podem aprovar solicitações');
          }
          break;
          
        case 'negar':
          novoStatus = this.statusSolicitacao.NEGADO;
          mensagemEvento = `Solicitação negada: ${detalhes.justificativa || 'Sem justificativa'}`;
          
          // Verificar se é regulador ou admin
          if (!['regulador', 'admin'].includes(usuario.perfil)) {
            throw new Error('Apenas reguladores e administradores podem negar solicitações');
          }
          
          // Verificar se tem justificativa
          if (!detalhes.justificativa) {
            throw new Error('É necessário informar uma justificativa para negar a solicitação');
          }
          break;
          
        case 'devolver':
          novoStatus = this.statusSolicitacao.DEVOLVIDO;
          mensagemEvento = `Solicitação devolvida: ${detalhes.motivo || 'Sem motivo especificado'}`;
          
          // Verificar se é regulador ou admin
          if (!['regulador', 'admin'].includes(usuario.perfil)) {
            throw new Error('Apenas reguladores e administradores podem devolver solicitações');
          }
          break;
          
        case 'cancelar':
          novoStatus = this.statusSolicitacao.CANCELADO;
          mensagemEvento = `Solicitação cancelada: ${detalhes.motivo || 'Sem motivo especificado'}`;
          
          // Qualquer perfil pode cancelar, mas apenas solicitações da própria unidade (exceto admin)
          if (usuario.perfil === 'ubs' && solicitacao.dadosPaciente.nomeUnidade !== usuario.unidade) {
            throw new Error('Você só pode cancelar solicitações da sua unidade');
          }
          break;
          
        case 'analisar':
          novoStatus = this.statusSolicitacao.ANALISE;
          mensagemEvento = 'Solicitação em análise';
          
          // Verificar se é regulador ou admin
          if (!['regulador', 'admin'].includes(usuario.perfil)) {
            throw new Error('Apenas reguladores e administradores podem analisar solicitações');
          }
          break;
          
        case 'reenviar':
          novoStatus = this.statusSolicitacao.ENVIADO;
          mensagemEvento = 'Solicitação reenviada após devolução';
          
          // Apenas UBS ou admin podem reenviar e apenas solicitações devolvidas
          if (usuario.perfil === 'ubs' && solicitacao.dadosPaciente.nomeUnidade !== usuario.unidade) {
            throw new Error('Você só pode reenviar solicitações da sua unidade');
          }
          
          if (solicitacao._status !== this.statusSolicitacao.DEVOLVIDO) {
            throw new Error('Apenas solicitações devolvidas podem ser reenviadas');
          }
          break;
          
        default:
          throw new Error(`Ação desconhecida: ${acao}`);
      }
      
      // Verificar se transição é permitida
      if (!this.fluxoAprovacao[statusAtual].includes(novoStatus)) {
        throw new Error(`Não é possível ${acao} uma solicitação com status ${statusAtual}`);
      }
      
      // Atualizar solicitação
      const dataAcao = new Date().toISOString();
      const dadosAtualizacao = {
        _status: novoStatus,
        _dataAlteracaoStatus: dataAcao,
        _alteradoPor: {
          id: usuario.id,
          nome: usuario.nome,
          perfil: usuario.perfil
        }
      };
      
      // Adicionar detalhes específicos de cada ação
      if (acao === 'aprovar') {
        dadosAtualizacao._dataAprovacao = dataAcao;
        dadosAtualizacao._aprovadoPor = {
          id: usuario.id,
          nome: usuario.nome
        };
        
        if (detalhes.observacoes) {
          dadosAtualizacao._observacoesAprovacao = detalhes.observacoes;
        }
      } else if (acao === 'negar') {
        dadosAtualizacao._dataNegacao = dataAcao;
        dadosAtualizacao._negadoPor = {
          id: usuario.id,
          nome: usuario.nome
        };
        dadosAtualizacao._justificativaNegacao = detalhes.justificativa;
      } else if (acao === 'devolver') {
        dadosAtualizacao._dataDevolucao = dataAcao;
        dadosAtualizacao._devolvidoPor = {
          id: usuario.id,
          nome: usuario.nome
        };
        dadosAtualizacao._motivoDevolucao = detalhes.motivo;
      } else if (acao === 'cancelar') {
        dadosAtualizacao._dataCancelamento = dataAcao;
        dadosAtualizacao._canceladoPor = {
          id: usuario.id,
          nome: usuario.nome
        };
        dadosAtualizacao._motivoCancelamento = detalhes.motivo;
      } else if (acao === 'analisar') {
        dadosAtualizacao._dataInicioAnalise = dataAcao;
        dadosAtualizacao._reguladorId = usuario.id;
        dadosAtualizacao._reguladorNome = usuario.nome;
      }
      
      // Atualizar solicitação
      const sucesso = atualizarSolicitacao(idSolicitacao, dadosAtualizacao);
      
      if (sucesso) {
        // Registrar evento
        this.registrarEvento(idSolicitacao, mensagemEvento, usuario);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Erro ao ${acao} solicitação:`, error);
      mostrarNotificacao(`Erro ao ${acao} solicitação: ${error.message}`, 'erro');
      throw error;
    }
  }

  /**
   * Registra um evento no histórico da solicitação
   * @param {string} idSolicitacao - ID da solicitação
   * @param {string} mensagem - Mensagem do evento
   * @param {Object} usuario - Usuário que realizou a ação (opcional)
   */
  registrarEvento(idSolicitacao, mensagem, usuario = null) {
    try {
      // Buscar solicitação
      const solicitacao = buscarSolicitacaoPorId(idSolicitacao);
      if (!solicitacao) {
        console.error('Solicitação não encontrada para registrar evento', idSolicitacao);
        return;
      }
      
      // Criar evento
      const evento = {
        data: new Date().toISOString(),
        mensagem,
        usuario: usuario ? {
          id: usuario.id,
          nome: usuario.nome,
          perfil: usuario.perfil
        } : null
      };
      
      // Adicionar evento ao histórico
      const historico = solicitacao._historico || [];
      historico.push(evento);
      
      // Atualizar solicitação
      atualizarSolicitacao(idSolicitacao, {
        _historico: historico
      });
    } catch (error) {
      console.error('Erro ao registrar evento:', error);
    }
  }

  /**
   * Obtém estatísticas das solicitações
   * @returns {Promise<Object>} - Estatísticas
   */
  async obterEstatisticas() {
    try {
      const solicitacoes = await this.obterSolicitacoes();
      
      // Contagem por status
      const contagens = {
        rascunho: 0,
        enviado: 0,
        em_analise: 0,
        aprovado: 0,
        negado: 0,
        devolvido: 0,
        cancelado: 0
      };
      
      // Contagem por tipo
      const tiposSolicitacao = {};
      
      // Tempo médio de análise (em dias)
      let tempoTotalAnalise = 0;
      let quantidadeAprovadas = 0;
      
      solicitacoes.forEach(solicitacao => {
        // Contagem por status
        const status = solicitacao._status;
        if (contagens.hasOwnProperty(status)) {
          contagens[status]++;
        }
        
        // Contagem por tipo
        const tipo = solicitacao.tipoSolicitacao;
        if (!tiposSolicitacao[tipo]) {
          tiposSolicitacao[tipo] = 0;
        }
        tiposSolicitacao[tipo]++;
        
        // Tempo de análise (para aprovadas)
        if (status === this.statusSolicitacao.APROVADO && solicitacao._dataEnvio && solicitacao._dataAprovacao) {
          const dataEnvio = new Date(solicitacao._dataEnvio);
          const dataAprovacao = new Date(solicitacao._dataAprovacao);
          const diferencaDias = (dataAprovacao - dataEnvio) / (1000 * 60 * 60 * 24);
          
          tempoTotalAnalise += diferencaDias;
          quantidadeAprovadas++;
        }
      });
      
      // Calcular tempo médio de análise
      const tempoMedioAnalise = quantidadeAprovadas > 0 
        ? parseFloat((tempoTotalAnalise / quantidadeAprovadas).toFixed(1))
        : 0;
      
      return {
        total: solicitacoes.length,
        status: contagens,
        tipos: tiposSolicitacao,
        tempoMedioAnalise
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        total: 0,
        status: {},
        tipos: {},
        tempoMedioAnalise: 0
      };
    }
  }
}

// Exporta instância única do serviço
const solicitacoesService = new SolicitacoesService();
export default solicitacoesService; 