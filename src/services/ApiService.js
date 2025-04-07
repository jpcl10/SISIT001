/**
 * Sistema Integrado de Regulação UBS - Serviço de API
 * Centraliza todas as chamadas de API/fetch do sistema
 */

const configSistema = require('../core/config-sistema');

/**
 * Classe que gerencia as chamadas à API do sistema
 */
class ApiService {
  constructor() {
    this.baseUrl = configSistema.api.baseUrl;
    this.headers = configSistema.api.headers || {
      'Content-Type': 'application/json'
    };
    this.mockMode = configSistema.modos.mockDados;
    this.timeout = configSistema.api.timeout;
    this.retries = configSistema.api.tentativasReconexao;
    this.usarProxy = configSistema.api.usarProxy;
    this.proxyPath = configSistema.api.proxyPath;
    this.endpoints = configSistema.api.endpoints;
    this.urlServicos = configSistema.api.urlServicos;
    this.debugAtivo = configSistema.modos.debugAtivo;
  }

  /**
   * Configura o serviço de API
   * @param {Object} config - Configurações do serviço
   */
  configure(config = {}) {
    if (config.baseUrl !== undefined) this.baseUrl = config.baseUrl;
    if (config.headers) this.headers = { ...this.headers, ...config.headers };
    if (config.mockMode !== undefined) this.mockMode = config.mockMode;
    if (config.timeout) this.timeout = config.timeout;
    if (config.retries) this.retries = config.retries;
    
    if (this.debugAtivo) {
      console.log('API configurada:', { 
        baseUrl: this.baseUrl, 
        mockMode: this.mockMode,
        timeout: this.timeout,
        headers: this.headers
      });
    }
  }

  /**
   * Determina a URL base correta para o tipo de serviço
   * @param {string} endpoint - Endpoint da API
   * @returns {string} URL base apropriada
   */
  determinarUrlBase(endpoint) {
    // Autenticação
    if (endpoint.startsWith('/api/auth')) {
      return this.urlServicos.auth;
    }
    
    // Serviços específicos da UBS
    if (endpoint.includes('/solicitacoes') || endpoint.includes('/formularios')) {
      return this.urlServicos.ubs;
    }
    
    // Serviços específicos da Central
    if (endpoint.includes('/cotas') || endpoint.includes('/regulacao')) {
      return this.urlServicos.central;
    }
    
    // Padrão para outros serviços
    return this.urlServicos.comum;
  }

  /**
   * Constrói a URL completa para um endpoint
   * @param {string} endpoint - Endpoint da API
   * @returns {string} URL completa
   */
  construirUrl(endpoint) {
    const urlBase = this.determinarUrlBase(endpoint);
    
    // Se o endpoint já começar com http, está completo
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    // Se não usar proxy, concatena diretamente
    if (!this.usarProxy) {
      return `${urlBase}${endpoint}`;
    }
    
    // Se usar proxy, verifica se o endpoint já tem o prefixo
    if (endpoint.startsWith(this.proxyPath)) {
      return `${urlBase}${endpoint}`;
    }
    
    // Adiciona o prefixo do proxy
    return `${urlBase}${this.proxyPath}${endpoint}`;
  }

  /**
   * Executa uma chamada fetch com tratamento de erro padronizado
   * @param {string} endpoint - Endpoint da API
   * @param {Object} options - Opções da chamada fetch
   * @returns {Promise} - Promise com a resposta
   */
  async fetch(endpoint, options = {}) {
    // Em modo mock, retorna dados simulados se fornecidos
    if (this.mockMode && options.mock) {
      if (this.debugAtivo) {
        console.log(`[API Mock] ${options.method || 'GET'} ${endpoint}`);
      }
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(options.mock);
        }, 300); // Simula um delay de rede
      });
    }

    const url = this.construirUrl(endpoint);
    
    // Configura opções da requisição
    const config = {
      ...options,
      headers: { ...this.headers, ...options.headers }
    };
    
    // Adiciona timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      if (this.debugAtivo) {
        console.log(`[API] ${options.method || 'GET'} ${url}`);
      }
      
      // Executa a requisição com retry em caso de falha
      let response;
      let error;
      let retryCount = 0;
      
      while (retryCount <= this.retries) {
        try {
          response = await fetch(url, config);
          if (response.ok) break;
          
          error = new Error(`Erro na API: ${response.status} ${response.statusText}`);
          retryCount++;
          
          if (retryCount <= this.retries) {
            // Espera um tempo antes de tentar novamente (exponential backoff)
            const delay = Math.pow(2, retryCount) * 300;
            if (this.debugAtivo) {
              console.log(`Tentativa ${retryCount}/${this.retries} falhou. Tentando novamente em ${delay}ms...`);
            }
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } catch (e) {
          error = e;
          retryCount++;
          
          if (e.name === 'AbortError') {
            error = new Error(`Timeout da requisição (${this.timeout}ms)`);
            break; // Não tenta novamente em caso de timeout
          }
          
          if (retryCount <= this.retries) {
            const delay = Math.pow(2, retryCount) * 300;
            if (this.debugAtivo) {
              console.log(`Erro na tentativa ${retryCount}/${this.retries}: ${e.message}. Tentando novamente em ${delay}ms...`);
            }
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // Limpa o timeout
      clearTimeout(timeoutId);
      
      // Se todas as tentativas falharam
      if (!response || !response.ok) {
        throw error || new Error('Falha na requisição após várias tentativas');
      }
      
      // Processa a resposta
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      return response.text();
    } catch (error) {
      clearTimeout(timeoutId);
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
    const caminhoFormulario = `${configSistema.caminhos.ubs.formularios}${tipoFormulario}.html`;
    return this.carregarComponente(caminhoFormulario);
  }

  /**
   * Verifica o status da API
   * @returns {Promise<Object>} - Promise com o status da API
   */
  async verificarStatus() {
    if (this.mockMode) {
      return {
        online: true,
        versao: configSistema.sistema.versao,
        timestamp: new Date().toISOString(),
        servicos: {
          comum: { status: "ok", latencia: 12 },
          ubs: { status: "ok", latencia: 15 },
          central: { status: "ok", latencia: 14 },
          auth: { status: "ok", latencia: 10 }
        }
      };
    }

    return this.fetch(this.endpoints.status);
  }

  /**
   * Autenticação de usuário
   * @param {string} usuario - Nome de usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise<Object>} - Promise com os dados do usuário autenticado
   */
  async autenticar(usuario, senha) {
    return this.fetch(this.endpoints.autenticacao, {
      method: 'POST',
      body: JSON.stringify({ usuario, senha })
    });
  }

  /**
   * Obtém lista de solicitações de acordo com filtros
   * @param {Object} filtros - Filtros a serem aplicados
   * @returns {Promise<Array>} - Promise com a lista de solicitações
   */
  async obterSolicitacoes(filtros = {}) {
    let queryParams = '';
    
    if (Object.keys(filtros).length > 0) {
      queryParams = '?' + new URLSearchParams(filtros).toString();
    }
    
    return this.fetch(`${this.endpoints.solicitacoes}${queryParams}`);
  }

  /**
   * Obtém informações sobre cotas disponíveis
   * @param {string} tipo - Tipo de cota (especialidade, exame, etc)
   * @returns {Promise<Object>} - Promise com as informações de cotas
   */
  async obterCotas(tipo = '') {
    return this.fetch(`${this.endpoints.cotas}${tipo ? `/${tipo}` : ''}`);
  }

  /**
   * Obtém as notificações do usuário logado
   * @returns {Promise<Array>} - Promise com a lista de notificações
   */
  async obterNotificacoes() {
    return this.fetch(this.endpoints.notificacoes);
  }
}

// Exporta instância única do serviço
const apiService = new ApiService();
module.exports = apiService; 