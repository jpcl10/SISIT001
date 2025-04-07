/**
 * SISTEMA UBS - Gerenciamento de Armazenamento Local
 * Funções para manipular dados no localStorage/sessionStorage
 */

import config from './config.js';

// Prefixo para as chaves do localStorage
const STORAGE_PREFIX = config.storage.prefixo;
const KEYS = config.storage.keys;

/**
 * Salva dados da etapa 1 (dados comuns) no localStorage
 * @param {Object} dados - Objeto com os dados da etapa 1
 */
function salvarDadosEtapa1(dados) {
  // Adicionar timestamp para controle
  const dadosComTimestamp = {
    ...dados,
    _timestamp: Date.now(),
    _ultimaAtualizacao: new Date().toISOString()
  };
  
  localStorage.setItem(`${STORAGE_PREFIX}${KEYS.dadosEtapa1}`, JSON.stringify(dadosComTimestamp));
}

/**
 * Recupera dados da etapa 1 do localStorage
 * @returns {Object} - Objeto com os dados da etapa 1 ou objeto vazio se não existir
 */
function obterDadosEtapa1() {
  const dadosJSON = localStorage.getItem(`${STORAGE_PREFIX}${KEYS.dadosEtapa1}`);
  
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
 */
function salvarFormulario(tipoFormulario, dados) {
  // Recupera os dados da etapa 1
  const dadosEtapa1 = obterDadosEtapa1();
  
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
  const solicitacoes = obterTodasSolicitacoes();
  solicitacoes.push(dadosCompletos);
  
  localStorage.setItem(`${STORAGE_PREFIX}${KEYS.solicitacoes}`, JSON.stringify(solicitacoes));
  return dadosCompletos._id; // Retorna o ID gerado
}

/**
 * Atualiza uma solicitação existente
 * @param {string} id - ID da solicitação 
 * @param {Object} novosDados - Novos dados para atualizar
 * @returns {boolean} - Indica se a atualização foi concluída com sucesso
 */
function atualizarSolicitacao(id, novosDados) {
  const solicitacoes = obterTodasSolicitacoes();
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
  
  localStorage.setItem(`${STORAGE_PREFIX}${KEYS.solicitacoes}`, JSON.stringify(solicitacoes));
  return true;
}

/**
 * Recupera todas as solicitações salvas
 * @returns {Array} - Array de objetos com as solicitações
 */
function obterTodasSolicitacoes() {
  const solicitacoesJSON = localStorage.getItem(`${STORAGE_PREFIX}${KEYS.solicitacoes}`);
  
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
function buscarSolicitacaoPorId(id) {
  const solicitacoes = obterTodasSolicitacoes();
  return solicitacoes.find(item => item._id === id) || null;
}

/**
 * Remove uma solicitação pelo ID
 * @param {string} id - ID da solicitação a ser removida
 * @returns {boolean} - Indica se a remoção foi bem-sucedida
 */
function removerSolicitacao(id) {
  const solicitacoes = obterTodasSolicitacoes();
  const novaLista = solicitacoes.filter(item => item._id !== id);
  
  if (novaLista.length === solicitacoes.length) {
    return false; // Nada foi removido
  }
  
  localStorage.setItem(`${STORAGE_PREFIX}${KEYS.solicitacoes}`, JSON.stringify(novaLista));
  return true;
}

/**
 * Altera o status de uma solicitação
 * @param {string} id - ID da solicitação
 * @param {string} novoStatus - Novo status ('rascunho', 'enviado', 'aprovado', 'rejeitado')
 * @returns {boolean} - Indica se a alteração foi bem-sucedida
 */
function alterarStatusSolicitacao(id, novoStatus) {
  return atualizarSolicitacao(id, { 
    _status: novoStatus,
    _dataAlteracaoStatus: new Date().toISOString()
  });
}

/**
 * Limpa todos os dados de solicitações do localStorage
 */
function limparTodasSolicitacoes() {
  localStorage.removeItem(`${STORAGE_PREFIX}${KEYS.solicitacoes}`);
}

/**
 * Exporta os dados para um arquivo JSON
 * @returns {string} - URL do blob para download
 */
function exportarDadosJSON() {
  const dados = {
    solicitacoes: obterTodasSolicitacoes(),
    dadosEtapa1: obterDadosEtapa1(),
    metadata: {
      dataExportacao: new Date().toISOString(),
      versaoApp: config.app.versao
    }
  };
  
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  return URL.createObjectURL(blob);
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