/**
 * SISTEMA UBS - Serviço de Armazenamento Local
 * Gerencia persistência de dados no localStorage e sessionStorage
 */

const config = require('../core/config');

/**
 * Classe responsável pelo gerenciamento do armazenamento local
 */
class StorageService {
  constructor() {
    // Prefixo para as chaves do localStorage
    this.prefix = config.storage.prefixo;
    this.keys = config.storage.keys;
  }

  /**
   * Obtém a chave completa com prefixo
   * @param {string} key - Nome da chave
   * @returns {string} - Chave com prefixo
   */
  getFullKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Salva dados da etapa 1 (dados comuns) no localStorage
   * @param {Object} dados - Objeto com os dados da etapa 1
   */
  salvarDadosEtapa1(dados) {
    // Adicionar timestamp para controle
    const dadosComTimestamp = {
      ...dados,
      _timestamp: Date.now(),
      _ultimaAtualizacao: new Date().toISOString()
    };
    
    localStorage.setItem(this.getFullKey(this.keys.dadosEtapa1), JSON.stringify(dadosComTimestamp));
    return dadosComTimestamp;
  }

  /**
   * Recupera dados da etapa 1 do localStorage
   * @returns {Object} - Objeto com os dados da etapa 1 ou objeto vazio se não existir
   */
  obterDadosEtapa1() {
    const dadosJSON = localStorage.getItem(this.getFullKey(this.keys.dadosEtapa1));
    
    if (!dadosJSON) {
      return {};
    }
    
    try {
      return JSON.parse(dadosJSON);
    } catch (erro) {
      console.error('Erro ao processar dados da etapa 1:', erro);
      return {};
    }
  }

  /**
   * Salva um formulário específico no localStorage
   * @param {string} tipoFormulario - Identificador do tipo de formulário
   * @param {Object} dados - Dados do formulário
   * @returns {string} - ID gerado para a solicitação
   */
  salvarFormulario(tipoFormulario, dados) {
    // Recupera os dados da etapa 1
    const dadosEtapa1 = this.obterDadosEtapa1();
    
    // Combina com os dados específicos
    const dadosCompletos = {
      dadosPaciente: dadosEtapa1,
      dadosEspecificos: dados,
      tipoSolicitacao: tipoFormulario,
      _id: `${tipoFormulario}_${Date.now()}`,
      _dataCriacao: new Date().toISOString(),
      _status: 'rascunho'
    };
    
    // Salva na lista de solicitações
    const solicitacoes = this.obterTodasSolicitacoes();
    solicitacoes.push(dadosCompletos);
    
    localStorage.setItem(this.getFullKey(this.keys.solicitacoes), JSON.stringify(solicitacoes));
    return dadosCompletos._id; // Retorna o ID gerado
  }

  /**
   * Atualiza uma solicitação existente
   * @param {string} id - ID da solicitação 
   * @param {Object} novosDados - Novos dados para atualizar
   * @returns {boolean} - Indica se a atualização foi concluída com sucesso
   */
  atualizarSolicitacao(id, novosDados) {
    const solicitacoes = this.obterTodasSolicitacoes();
    const indice = solicitacoes.findIndex(item => item._id === id);
    
    if (indice === -1) {
      return false;
    }
    
    // Mescla os dados existentes com os novos dados
    solicitacoes[indice] = {
      ...solicitacoes[indice],
      ...novosDados,
      _ultimaAtualizacao: new Date().toISOString()
    };
    
    localStorage.setItem(this.getFullKey(this.keys.solicitacoes), JSON.stringify(solicitacoes));
    return true;
  }

  /**
   * Recupera todas as solicitações salvas
   * @returns {Array} - Array de objetos com as solicitações
   */
  obterTodasSolicitacoes() {
    const solicitacoesJSON = localStorage.getItem(this.getFullKey(this.keys.solicitacoes));
    
    if (!solicitacoesJSON) {
      return [];
    }
    
    try {
      return JSON.parse(solicitacoesJSON);
    } catch (erro) {
      console.error('Erro ao processar solicitações:', erro);
      return [];
    }
  }

  /**
   * Busca uma solicitação específica pelo ID
   * @param {string} id - ID da solicitação
   * @returns {Object|null} - A solicitação encontrada ou null se não existir
   */
  buscarSolicitacaoPorId(id) {
    const solicitacoes = this.obterTodasSolicitacoes();
    return solicitacoes.find(item => item._id === id) || null;
  }

  /**
   * Remove uma solicitação pelo ID
   * @param {string} id - ID da solicitação a ser removida
   * @returns {boolean} - Indica se a remoção foi bem-sucedida
   */
  removerSolicitacao(id) {
    const solicitacoes = this.obterTodasSolicitacoes();
    const novaLista = solicitacoes.filter(item => item._id !== id);
    
    if (novaLista.length === solicitacoes.length) {
      return false; // Nada foi removido
    }
    
    localStorage.setItem(this.getFullKey(this.keys.solicitacoes), JSON.stringify(novaLista));
    return true;
  }

  /**
   * Altera o status de uma solicitação
   * @param {string} id - ID da solicitação
   * @param {string} novoStatus - Novo status ('rascunho', 'enviado', 'aprovado', 'rejeitado')
   * @returns {boolean} - Indica se a alteração foi bem-sucedida
   */
  alterarStatusSolicitacao(id, novoStatus) {
    return this.atualizarSolicitacao(id, { 
      _status: novoStatus,
      _dataAlteracaoStatus: new Date().toISOString()
    });
  }

  /**
   * Limpa todos os dados de solicitações do localStorage
   */
  limparTodasSolicitacoes() {
    localStorage.removeItem(this.getFullKey(this.keys.solicitacoes));
  }

  /**
   * Salva um item genérico no localStorage com prefixo
   * @param {string} chave - Chave para o item
   * @param {any} valor - Valor a ser salvo
   */
  salvar(chave, valor) {
    localStorage.setItem(this.getFullKey(chave), 
      typeof valor === 'object' ? JSON.stringify(valor) : valor);
  }

  /**
   * Recupera um item genérico do localStorage
   * @param {string} chave - Chave do item
   * @param {boolean} parseJSON - Se deve fazer parse do JSON
   * @returns {any} - Valor recuperado
   */
  obter(chave, parseJSON = true) {
    const valor = localStorage.getItem(this.getFullKey(chave));
    
    if (!valor) return null;
    
    if (parseJSON) {
      try {
        return JSON.parse(valor);
      } catch (e) {
        return valor;
      }
    }
    
    return valor;
  }

  /**
   * Remove um item genérico do localStorage
   * @param {string} chave - Chave do item
   */
  remover(chave) {
    localStorage.removeItem(this.getFullKey(chave));
  }

  /**
   * Exporta os dados para um arquivo JSON
   * @returns {string} - URL do blob para download
   */
  exportarDadosJSON() {
    const dados = {
      solicitacoes: this.obterTodasSolicitacoes(),
      dadosEtapa1: this.obterDadosEtapa1(),
      metadata: {
        dataExportacao: new Date().toISOString(),
        versaoApp: config.app.versao
      }
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    return URL.createObjectURL(blob);
  }
}

// Exporta instância única do serviço
const storageService = new StorageService();
module.exports = storageService; 