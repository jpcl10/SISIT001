/**
 * SISTEMA UBS - Funções utilitárias
 * Contém funções comuns usadas em toda a aplicação
 */

import apiService from './api.js';

/**
 * Exibe uma notificação temporária na tela
 * @param {string} mensagem - A mensagem a ser exibida
 * @param {string} tipo - O tipo de notificação ('sucesso', 'erro', 'informacao', 'aviso')
 * @param {number} duracao - Duração em milissegundos (padrão: 3000ms)
 */
function mostrarNotificacao(mensagem, tipo = 'informacao', duracao = 3000) {
  // Remover notificações existentes
  const notificacoesExistentes = document.querySelectorAll('.notificacao');
  notificacoesExistentes.forEach(notif => notif.remove());
  
  // Criar nova notificação
  const notificacao = document.createElement('div');
  notificacao.className = `notificacao ${tipo}`;
  notificacao.textContent = mensagem;
  
  // Adicionar ao corpo do documento
  document.body.appendChild(notificacao);
  
  // Remover após a duração especificada
  setTimeout(() => {
    if (document.body.contains(notificacao)) {
      document.body.removeChild(notificacao);
    }
  }, duracao);
}

/**
 * Carrega componentes HTML em elementos usando fetch
 * @param {string} seletor - Seletor CSS do elemento onde o componente será inserido
 * @param {string} caminhoComponente - Caminho para o arquivo HTML do componente
 * @param {Function} callback - Função opcional a ser executada após o carregamento
 */
async function carregarComponente(seletor, caminhoComponente, callback = null) {
  const elemento = document.querySelector(seletor);
  
  if (!elemento) {
    console.error(`Elemento com seletor '${seletor}' não encontrado`);
    return;
  }
  
  try {
    const html = await apiService.carregarComponente(caminhoComponente);
    elemento.innerHTML = html;
    
    if (callback && typeof callback === 'function') {
      callback();
    }
  } catch (erro) {
    console.error(`Falha ao carregar componente ${caminhoComponente}:`, erro);
    elemento.innerHTML = `<p>Erro ao carregar componente</p>`;
  }
}

/**
 * Formata data no padrão brasileiro (DD/MM/YYYY)
 * @param {Date|string} data - A data a ser formatada
 * @returns {string} - A data formatada
 */
function formatarData(data) {
  const dataObj = data instanceof Date ? data : new Date(data);
  
  if (isNaN(dataObj.getTime())) {
    return '';
  }
  
  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  const ano = dataObj.getFullYear();
  
  return `${dia}/${mes}/${ano}`;
}

/**
 * Formata um valor numérico como moeda brasileira
 * @param {number} valor - O valor a ser formatado
 * @returns {string} - O valor formatado como moeda
 */
function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/**
 * Formata um CPF (adiciona pontuação)
 * @param {string} cpf - O CPF a ser formatado
 * @returns {string} - O CPF formatado
 */
function formatarCPF(cpf) {
  // Remove caracteres não numéricos
  const apenasNumeros = cpf.replace(/\D/g, '');
  
  if (apenasNumeros.length !== 11) {
    return cpf;
  }
  
  return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Gera um ID único simples
 * @returns {string} - Um ID único
 */
function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Sanitiza uma string para evitar injeção de scripts
 * @param {string} texto - O texto a ser sanitizado
 * @returns {string} - O texto sanitizado
 */
function sanitizarTexto(texto) {
  const temp = document.createElement('div');
  temp.textContent = texto;
  return temp.innerHTML;
}

/**
 * Limita um texto a um número específico de caracteres
 * @param {string} texto - O texto a ser limitado
 * @param {number} limite - O número máximo de caracteres
 * @param {boolean} adicionarReticencias - Se deve adicionar reticências no final
 * @returns {string} - O texto limitado
 */
function limitarTexto(texto, limite = 100, adicionarReticencias = true) {
  if (texto.length <= limite) {
    return texto;
  }
  
  return texto.slice(0, limite) + (adicionarReticencias ? '...' : '');
}

// Exportar funções para uso em outros módulos
export {
  mostrarNotificacao,
  carregarComponente,
  formatarData,
  formatarMoeda,
  formatarCPF,
  gerarId,
  sanitizarTexto,
  limitarTexto
}; 