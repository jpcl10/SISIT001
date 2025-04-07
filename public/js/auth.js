/**
 * Sistema de Regulação UBS - Serviço de Autenticação
 * Gerencia autenticação e controle de acesso
 */

import config from './config.js';
import apiService from './api.js';
import { mostrarNotificacao } from './utils.js';

const STORAGE_PREFIX = config.storage.prefixo;
const KEY_USUARIO = `${STORAGE_PREFIX}${config.storage.keys.usuario}`;
const KEY_TOKEN = `${STORAGE_PREFIX}${config.storage.keys.token}`;

/**
 * Serviço de autenticação do sistema
 */
class AuthService {
  constructor() {
    this.usuarioAtual = null;
    this.token = null;
    this.inicializar();
  }

  /**
   * Inicializa o serviço, tentando restaurar a sessão
   */
  inicializar() {
    try {
      // Tentar restaurar dados da sessão
      const usuarioStr = sessionStorage.getItem(KEY_USUARIO);
      const tokenStr = sessionStorage.getItem(KEY_TOKEN);
      
      if (usuarioStr && tokenStr) {
        this.usuarioAtual = JSON.parse(usuarioStr);
        this.token = tokenStr;
        
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
      if (apiService.mockMode) {
        // Em modo mock, simular autenticação
        return await this.mockLogin(usuario, senha);
      }
      
      // Em modo real, chamar API de autenticação
      const resposta = await apiService.fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ usuario, senha })
      });
      
      // Armazenar dados da sessão
      this.usuarioAtual = resposta.usuario;
      this.token = resposta.token;
      
      sessionStorage.setItem(KEY_USUARIO, JSON.stringify(this.usuarioAtual));
      sessionStorage.setItem(KEY_TOKEN, this.token);
      
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
   * Simula login no modo de desenvolvimento
   * @param {string} usuario - Nome de usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise<Object>} - Informações do usuário logado
   */
  async mockLogin(usuario, senha) {
    // Lista de usuários para teste
    const usuarios = [
      { id: 1, nome: 'Dr. Silva', usuario: 'ubs', senha: 'ubs123', perfil: 'ubs', unidade: 'UBS Central' },
      { id: 2, nome: 'Dr. Santos', usuario: 'regulador', senha: 'reg123', perfil: 'regulador', unidade: 'Central de Regulação' },
      { id: 3, nome: 'Administrador', usuario: 'admin', senha: 'admin123', perfil: 'admin', unidade: 'Central de Regulação' }
    ];
    
    // Buscar usuário
    const usuarioEncontrado = usuarios.find(u => 
      u.usuario === usuario && u.senha === senha
    );
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (usuarioEncontrado) {
          // Criar cópia sem senha
          const { senha, ...dadosUsuario } = usuarioEncontrado;
          
          // Gerar token simulado
          const token = btoa(`${usuario}:${Date.now()}`);
          
          // Armazenar na sessão
          this.usuarioAtual = dadosUsuario;
          this.token = token;
          
          sessionStorage.setItem(KEY_USUARIO, JSON.stringify(this.usuarioAtual));
          sessionStorage.setItem(KEY_TOKEN, token);
          
          resolve(dadosUsuario);
        } else {
          reject(new Error('Usuário ou senha inválidos'));
        }
      }, 300);
    });
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
    
    sessionStorage.removeItem(KEY_USUARIO);
    sessionStorage.removeItem(KEY_TOKEN);
    
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

/**
 * Módulo de autenticação
 */
export function setupAuth() {
  console.log('Inicializando módulo de autenticação...');
  
  // Configurar eventos de login
  setupLoginEvents();
}

function setupLoginEvents() {
  const loginForm = document.getElementById('login-form');
  
  if (loginForm) {
    // Já existe manipulação inline no HTML, apenas complementar
    console.log('Formulário de login detectado e configurado');
  }
}

// Função para fazer login
export function fazerLogin(usuario, senha) {
  return new Promise((resolve, reject) => {
    // Simulação de autenticação
    if ((usuario === 'regulador' && senha === 'senha123') || 
        (usuario === 'admin' && senha === 'admin123')) {
      
      const userData = {
        nome: usuario === 'admin' ? 'Administrador' : 'Regulador',
        perfil: usuario === 'admin' ? 'ADMIN' : 'REGULADOR',
        token: 'token-simulado-' + Math.random().toString(36).substring(2)
      };
      
      // Armazenar dados do usuário
      localStorage.setItem('usuarioLogado', JSON.stringify(userData));
      
      resolve(userData);
    } else {
      reject(new Error('Credenciais inválidas'));
    }
  });
}

// Exportando a instância authService como padrão
export default authService; 