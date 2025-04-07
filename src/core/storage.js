/**
 * SISTEMA UBS - Gerenciamento de Armazenamento Local
 * 
 * IMPORTANTE: Este arquivo foi mantido para compatibilidade com código existente.
 * Para novos desenvolvimentos, utilize o serviço em src/services/StorageService.js
 */

import storageService from '../services/StorageService.js';

// Re-exporta as funções do serviço para manter compatibilidade

/**
 * Salva dados da etapa 1 (dados comuns) no localStorage
 * @param {Object} dados - Objeto com os dados da etapa 1
 */
function salvarDadosEtapa1(dados) {
  return storageService.salvarDadosEtapa1(dados);
}

/**
 * Recupera dados da etapa 1 do localStorage
 * @returns {Object} - Objeto com os dados da etapa 1 ou objeto vazio se não existir
 */
function obterDadosEtapa1() {
  return storageService.obterDadosEtapa1();
}

/**
 * Salva um formulário específico no localStorage
 * @param {string} tipoFormulario - Identificador do tipo de formulário
 * @param {Object} dados - Dados do formulário
 */
function salvarFormulario(tipoFormulario, dados) {
  return storageService.salvarFormulario(tipoFormulario, dados);
}

/**
 * Atualiza uma solicitação existente
 * @param {string} id - ID da solicitação 
 * @param {Object} novosDados - Novos dados para atualizar
 * @returns {boolean} - Indica se a atualização foi concluída com sucesso
 */
function atualizarSolicitacao(id, novosDados) {
  return storageService.atualizarSolicitacao(id, novosDados);
}

/**
 * Recupera todas as solicitações salvas
 * @returns {Array} - Array de objetos com as solicitações
 */
function obterTodasSolicitacoes() {
  return storageService.obterTodasSolicitacoes();
}

/**
 * Busca uma solicitação específica pelo ID
 * @param {string} id - ID da solicitação
 * @returns {Object|null} - A solicitação encontrada ou null se não existir
 */
function buscarSolicitacaoPorId(id) {
  return storageService.buscarSolicitacaoPorId(id);
}

/**
 * Remove uma solicitação pelo ID
 * @param {string} id - ID da solicitação a ser removida
 * @returns {boolean} - Indica se a remoção foi bem-sucedida
 */
function removerSolicitacao(id) {
  return storageService.removerSolicitacao(id);
}

/**
 * Altera o status de uma solicitação
 * @param {string} id - ID da solicitação
 * @param {string} novoStatus - Novo status ('rascunho', 'enviado', 'aprovado', 'rejeitado')
 * @returns {boolean} - Indica se a alteração foi bem-sucedida
 */
function alterarStatusSolicitacao(id, novoStatus) {
  return storageService.alterarStatusSolicitacao(id, novoStatus);
}

/**
 * Limpa todos os dados de solicitações do localStorage
 */
function limparTodasSolicitacoes() {
  storageService.limparTodasSolicitacoes();
}

/**
 * Exporta os dados para um arquivo JSON
 * @returns {string} - URL do blob para download
 */
function exportarDadosJSON() {
  return storageService.exportarDadosJSON();
}

export {
  salvarDadosEtapa1,
  obterDadosEtapa1,
  salvarFormulario,
  atualizarSolicitacao,
  obterTodasSolicitacoes,
  buscarSolicitacaoPorId,
  removerSolicitacao,
  alterarStatusSolicitacao,
  limparTodasSolicitacoes,
  exportarDadosJSON
}; 