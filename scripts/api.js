/**
 * Sistema de Regulação UBS - Serviço de API
 * Centraliza todas as chamadas de API/fetch do sistema
 */

/**
 * Classe que gerencia as chamadas à API do sistema
 */
class APIService {
  constructor() {
    this.baseUrl = '';
    this.headers = {
      'Content-Type': 'application/json'
    };
    this.mockMode = true; // Usar dados simulados em vez de chamadas de API reais
  }

  /**
   * Configura o serviço de API
   * @param {Object} config - Configurações do serviço
   */
  configure(config = {}) {
    this.baseUrl = config.baseUrl || '';
    this.headers = { ...this.headers, ...config.headers };
    this.mockMode = config.mockMode !== undefined ? config.mockMode : true;
    console.log('API configurada:', { baseUrl: this.baseUrl, mockMode: this.mockMode });
  }

  /**
   * Executa uma chamada fetch com tratamento de erro padronizado
   * @param {string} endpoint - Endpoint da API
   * @param {Object} options - Opções da chamada fetch
   * @returns {Promise} - Promise com a resposta
   */
  async fetch(endpoint, options = {}) {
    if (this.mockMode && options.mock) {
      console.log(`[API Mock] ${options.method || 'GET'} ${endpoint}`);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(options.mock);
        }, 300); // Simula um delay de rede
      });
    }

    const url = this.baseUrl + endpoint;
    const config = {
      ...options,
      headers: { ...this.headers, ...options.headers }
    };

    try {
      console.log(`[API] ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      return response.text();
    } catch (error) {
      console.error('Erro na chamada de API:', error);
      throw error;
    }
  }

  /**
   * Carrega um componente HTML
   * @param {string} caminhoComponente - Caminho para o arquivo HTML
   * @returns {Promise<string>} - Promise com o HTML do componente
   */
  async carregarComponente(caminhoComponente) {
    try {
      const response = await fetch(caminhoComponente);
      if (!response.ok) {
        throw new Error(`Erro ao carregar componente: ${response.status}`);
      }
      return response.text();
    } catch (erro) {
      console.error(`Falha ao carregar componente ${caminhoComponente}:`, erro);
      return `<p>Erro ao carregar componente</p>`;
    }
  }

  /**
   * Carrega um formulário específico
   * @param {string} tipoFormulario - Tipo de formulário a ser carregado
   * @returns {Promise<string>} - Promise com o HTML do formulário
   */
  async carregarFormulario(tipoFormulario) {
    return this.carregarComponente(`forms/${tipoFormulario}.html`);
  }

  /**
   * Verifica o status da API
   * @returns {Promise<Object>} - Promise com o status da API
   */
  async verificarStatus() {
    if (this.mockMode) {
      return {
        online: true,
        versao: '1.0.0',
        timestamp: new Date().toISOString()
      };
    }

    return this.fetch('/api/status');
  }

  /**
   * Obtém solicitações da API
   * @param {Object} filtros - Filtros para as solicitações
   * @returns {Promise<Array>} - Promise com a lista de solicitações
   */
  async obterSolicitacoes(filtros = {}) {
    // Mock para desenvolvimento
    if (this.mockMode) {
      // Obter do localStorage se existir
      const storage = localStorage.getItem('ubs_solicitacoes');
      if (storage) {
        try {
          const solicitacoes = JSON.parse(storage);
          return { data: solicitacoes, total: solicitacoes.length };
        } catch (e) {
          console.error('Erro ao processar solicitações do localStorage:', e);
        }
      }
      
      // Mock padrão
      return {
        data: [],
        total: 0
      };
    }

    const queryParams = new URLSearchParams();
    
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const queryString = queryParams.toString();
    return this.fetch(`/api/solicitacoes${queryString ? '?' + queryString : ''}`);
  }
}

// Exporta uma instância única do serviço
const apiService = new APIService();
export default apiService; 