/**
 * Sistema de Regulação de Saúde - Módulo de Dependências
 * 
 * Este arquivo integra as dependências listadas em DependenciasAplicacao
 * com o sistema modular atual.
 */

import config from './config.js';
import apiService from './api.js';

// Lista de dependências do sistema
const dependenciasList = {
  // Bibliotecas Front-end
  frontend: {
    frameworks: [
      { nome: "Bootstrap", versao: "5.3.0-alpha1", url: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" },
      { nome: "Bootstrap Icons", versao: "1.10.3", url: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css" }
    ],
    javascript: [
      { nome: "Auth Service", arquivo: "scripts/auth.js", descricao: "Serviço de autenticação e autorização" },
      { nome: "API Service", arquivo: "scripts/api.js", descricao: "Serviço de comunicação com a API" },
      { nome: "Utils", arquivo: "scripts/utils.js", descricao: "Funções utilitárias" },
      { nome: "Cotas Service", arquivo: "scripts/cotas-service.js", descricao: "Gerenciamento de cotas de procedimentos" },
      { nome: "Storage Service", arquivo: "scripts/storage.js", descricao: "Gerenciamento de armazenamento local" }
    ]
  },
  
  // Módulos do Sistema
  modulos: [
    { nome: "Dashboard", rota: "/index.html", descricao: "Painel principal do sistema" },
    { nome: "Central de Regulação", rota: "/sistema-central-regulacao.html", descricao: "Interface da central de regulação" },
    { nome: "UBS", rota: "/sistema-ubs.html", descricao: "Interface para Unidades Básicas de Saúde" },
    { nome: "Etapa 1", rota: "/etapa1.html", descricao: "Formulário inicial de solicitação" },
    { nome: "Documentação", rota: "/solucao.html", descricao: "Documentação do sistema" }
  ],
  
  // APIs e Serviços Backend
  apis: [
    { nome: "API de Cotas", rota: "/api/cotas", metodos: ["GET", "POST", "PUT"], descricao: "Gerenciamento de cotas de procedimentos" },
    { nome: "API de Usuários", rota: "/api/usuarios", metodos: ["GET", "POST", "PUT", "DELETE"], descricao: "Gerenciamento de usuários" },
    { nome: "API de Solicitações", rota: "/api/solicitacoes", metodos: ["GET", "POST", "PUT"], descricao: "Gerenciamento de solicitações" },
    { nome: "API de Notificações", rota: "/api/notificacoes", metodos: ["GET", "POST"], descricao: "Sistema de notificações" },
    { nome: "API de Autenticação", rota: "/api/auth", metodos: ["POST"], descricao: "Autenticação e autorização" }
  ]
};

/**
 * Classe que gerencia as dependências do sistema
 */
class DependenciasManager {
  constructor() {
    this.dependencias = dependenciasList;
  }

  /**
   * Verifica o status das dependências
   * @returns {Promise<Object>} Status das dependências
   */
  async verificarStatus() {
    console.log("Verificando status das dependências...");
    
    try {
      // Verificar conexão com a API usando o serviço centralizado
      const status = await apiService.verificarStatus();
      
      // Atualizar elemento de status se ele existir
      this._atualizarElementoStatus(status);
      
      console.log("Status da API:", status.online ? "Online" : "Offline");
      return status;
    } catch (error) {
      console.error("Erro ao verificar status das dependências:", error);
      
      // Atualizar elemento de status em caso de erro
      this._atualizarElementoStatus({ online: false });
      
      return { online: false, error: error.message };
    }
  }

  /**
   * Atualiza o elemento de status da API na UI
   * @private
   * @param {Object} status - Status da API
   */
  _atualizarElementoStatus(status) {
    const statusElement = document.getElementById('api-status');
    if (statusElement) {
      statusElement.textContent = status.online ? 'API Online' : 'API Offline';
      statusElement.className = `api-status ${status.online ? 'online' : 'offline'}`;
    }
  }

  /**
   * Carrega dinamicamente as dependências CSS
   */
  carregarDependenciasCSS() {
    this.dependencias.frontend.frameworks.forEach(framework => {
      if (framework.url && framework.url.endsWith('.css')) {
        // Verificar se o CSS já está carregado
        const cssExistente = document.querySelector(`link[href="${framework.url}"]`);
        if (!cssExistente) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = framework.url;
          document.head.appendChild(link);
          console.log(`CSS carregado: ${framework.nome}`);
        }
      }
    });
  }

  /**
   * Obtém a lista de dependências
   * @returns {Object} Lista de dependências
   */
  obterDependencias() {
    return this.dependencias;
  }
}

// Exporta instância única do gerenciador de dependências
const dependenciasManager = new DependenciasManager();

// Carregar CSS automaticamente quando este módulo é importado
dependenciasManager.carregarDependenciasCSS();

export default dependenciasManager; 