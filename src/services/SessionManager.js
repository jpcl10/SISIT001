/**
 * Gerenciador de Sessão
 * 
 * Responsável por gerenciar o armazenamento e recuperação de sessões do usuário
 */

class SessionManager {
  /**
   * @param {Object} configArmazenamento - Configuração de armazenamento
   */
  constructor(configArmazenamento) {
    this.prefixo = configArmazenamento.prefixo;
    this.chaveUsuario = `${this.prefixo}${configArmazenamento.chaves.usuario}`;
    this.chaveToken = `${this.prefixo}${configArmazenamento.chaves.token}`;
    this.tipoArmazenamento = configArmazenamento.tipo || 'session'; // 'session' ou 'local'
    
    // Verificar se estamos em ambiente Node.js (servidor) ou navegador
    this.isNodeEnvironment = typeof window === 'undefined';
    
    // Criar armazenamento em memória para ambiente Node.js
    if (this.isNodeEnvironment) {
      this.memoryStorage = {};
      console.log('SessionManager: Usando armazenamento em memória para ambiente Node.js');
    }
  }

  /**
   * Obtém o objeto de armazenamento apropriado (sessionStorage ou localStorage)
   * @returns {Storage} Objeto de armazenamento
   * @private
   */
  _getStorage() {
    // Em ambiente Node.js, usar o armazenamento em memória
    if (this.isNodeEnvironment) {
      return {
        getItem: (key) => this.memoryStorage[key] || null,
        setItem: (key, value) => this.memoryStorage[key] = value,
        removeItem: (key) => delete this.memoryStorage[key]
      };
    }
    
    // Em ambiente navegador, usar localStorage ou sessionStorage
    return this.tipoArmazenamento === 'local' ? localStorage : sessionStorage;
  }

  /**
   * Salva os dados da sessão no armazenamento
   * @param {Object} usuario - Dados do usuário
   * @param {string} token - Token de autenticação
   */
  salvarSessao(usuario, token) {
    const storage = this._getStorage();
    storage.setItem(this.chaveUsuario, JSON.stringify(usuario));
    storage.setItem(this.chaveToken, token);
  }

  /**
   * Recupera os dados da sessão do armazenamento
   * @returns {Object|null} Dados da sessão ou null se não existir
   */
  recuperarSessao() {
    const storage = this._getStorage();
    const usuarioStr = storage.getItem(this.chaveUsuario);
    const token = storage.getItem(this.chaveToken);

    if (!usuarioStr || !token) {
      return null;
    }

    try {
      return {
        usuario: JSON.parse(usuarioStr),
        token
      };
    } catch (erro) {
      console.error('Erro ao recuperar sessão:', erro);
      return null;
    }
  }

  /**
   * Remove os dados da sessão do armazenamento
   */
  limparSessao() {
    const storage = this._getStorage();
    storage.removeItem(this.chaveUsuario);
    storage.removeItem(this.chaveToken);
  }
}

module.exports = SessionManager; 