/**
 * Módulo de API - Integração com backend
 */

import config from './config.js';
import mockService from './mock/mockService.js';

// Configuração padrão
const defaultConfig = {
  baseUrl: 'http://localhost:5555/api',
  mockMode: true,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * Inicializa o módulo de API
 */
export function initAPI() {
  console.log('Inicializando módulo de API...');
}

/**
 * Configura o módulo de API com novas opções
 * @param {Object} options - Opções de configuração
 */
export function configure(options = {}) {
  console.log('Configurando API com:', options);
  Object.assign(defaultConfig, options);
}

/**
 * Verifica o status da API
 * @returns {Promise<Object>} Status da API
 */
export async function verificarStatus() {
  try {
    if (defaultConfig.mockMode) {
      // Em modo mock, utilizar serviço de mock separado
      console.log('[MOCK] Verificando status da API');
      return mockService.getStatusMock();
    }
    
    // Em modo real, fazer chamada para endpoint de status
    const response = await fetch(`${defaultConfig.baseUrl}/status`, {
      method: 'GET',
      headers: defaultConfig.headers,
      timeout: defaultConfig.timeout
    });
    
    if (!response.ok) {
      throw new Error(`Erro na verificação de status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao verificar status da API:', error);
    return { online: false, error: error.message };
  }
}

/**
 * Realiza chamadas para a API
 * @param {string} endpoint - Endpoint da API
 * @param {Object} options - Opções da requisição
 * @returns {Promise<Object>} Resultado da requisição
 */
export async function fetchAPI(endpoint, options = {}) {
  const url = `${defaultConfig.baseUrl}${endpoint}`;
  
  const fetchOptions = {
    ...options,
    headers: {
      ...defaultConfig.headers,
      ...(options.headers || {})
    },
    timeout: options.timeout || defaultConfig.timeout
  };
  
  try {
    if (defaultConfig.mockMode) {
      return mockService.handleMockRequest(endpoint, options);
    }
    
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// Exportar funções do módulo
export default {
  initAPI,
  fetchAPI,
  configure,
  verificarStatus
}; 