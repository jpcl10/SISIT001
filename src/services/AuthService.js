/**
 * Serviço de Autenticação
 * 
 * Gerencia autenticação, usuários e permissões no sistema
 */

const configSistema = require('../core/config-sistema');
// Removendo importação circular
// const apiService = require('../core/api');
const { mostrarNotificacao } = require('../utils/utils');
const SessionManager = require('./SessionManager');
const MockAuthProvider = require('./auth/MockAuthProvider');

/**
 * Serviço de autenticação do sistema
 */
class AuthService {
  constructor() {
    this.usuarioAtual = null;
    this.token = null;
    this.sessionManager = new SessionManager(configSistema.armazenamento);
    this.mockAuthProvider = new MockAuthProvider();
    this.inicializar();
  }

  /**
   * Inicializa o serviço, tentando restaurar a sessão
   */
  inicializar() {
    try {
      const sessao = this.sessionManager.recuperarSessao();
      
      if (sessao) {
        this.usuarioAtual = sessao.usuario;
        this.token = sessao.token;
        
        // Definir header de autorização
        apiService.configure({
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        
        console.log('Sessão restaurada para:', this.usuarioAtual.nome);
      }
    } catch (error) {
      console.error('Erro ao restaurar sessão:', error);
      this.logout();
    }
  }

  /**
   * Efetua login no sistema
   * @param {string} usuario - Nome de usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise<Object>} Informações do usuário logado
   */
  async login(usuario, senha) {
    try {
      let dadosUsuario;
      
      if (apiService.mockMode) {
        // Em modo mock, simular autenticação
        dadosUsuario = await this.mockAuthProvider.login(usuario, senha);
      } else {
        // Em modo real, chamar API de autenticação
        const resposta = await apiService.fetch(configSistema.autenticacao.loginEndpoint, {
          method: 'POST',
          body: JSON.stringify({ usuario, senha })
        });
        dadosUsuario = resposta.usuario;
        this.token = resposta.token;
      }
      
      // Armazenar dados da sessão
      this.usuarioAtual = dadosUsuario;
      
      // Persistir a sessão
      this.sessionManager.salvarSessao(this.usuarioAtual, this.token);
      
      // Configurar header de autorização para requisições futuras
      apiService.configure({
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      return this.usuarioAtual;
    } catch (error) {
      console.error('Erro no login:', error);
      throw new Error('Falha na autenticação. Verifique suas credenciais.');
    }
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} Indica se o usuário está autenticado
   */
  isAutenticado() {
    return Boolean(this.usuarioAtual && this.token);
  }

  /**
   * Verifica se o usuário tem um determinado perfil
   * @param {string|string[]} perfis - Perfil ou array de perfis a verificar
   * @returns {boolean} Indica se o usuário tem o perfil
   */
  temPerfil(perfis) {
    if (!this.isAutenticado()) {
      return false;
    }
    
    if (Array.isArray(perfis)) {
      return perfis.includes(this.usuarioAtual.perfil);
    }
    
    return this.usuarioAtual.perfil === perfis;
  }

  /**
   * Efetua logout do sistema
   */
  logout() {
    this.usuarioAtual = null;
    this.token = null;
    
    this.sessionManager.limparSessao();
    
    apiService.configure({
      headers: { 'Authorization': null }
    });
  }

  /**
   * Obtém informações do usuário atual
   * @returns {Object|null} Informações do usuário ou null se não estiver autenticado
   */
  getUsuarioAtual() {
    return this.usuarioAtual;
  }
}

// Exporta instância única do serviço
const authService = new AuthService();
module.exports = authService; 