/**
 * Sistema de Regulação UBS - Inicialização
 * Arquivo principal que inicializa todos os serviços do sistema
 */

import apiService from './api.js';
import authService from './auth.js';
import dependenciasManager from './dependencias.js';
import config from './config.js';
import { mostrarNotificacao } from './utils.js';

/**
 * Inicializa a aplicação
 */
async function inicializarAplicacao() {
  console.log('Inicializando aplicação...');
  
  try {
    // Configurar serviço de API
    apiService.configure({
      baseUrl: config.api.baseUrl,
      mockMode: config.api.mockMode,
      timeout: config.api.timeout
    });
    console.log('Serviço de API configurado');
    
    // Verificar status das dependências
    const statusDep = await dependenciasManager.verificarStatus();
    console.log('Status das dependências:', statusDep);
    
    // Verificar autenticação
    if (!authService.isAutenticado()) {
      // Redirecionar para login se não estiver na página de login
      const path = window.location.pathname;
      const filename = path.substring(path.lastIndexOf('/') + 1);
      
      if (filename !== 'login-central-regulacao.html' && filename !== 'login.html') {
        console.log('Usuário não autenticado. Redirecionando para login...');
        window.location.href = 'login-central-regulacao.html';
        return;
      }
    } else {
      console.log('Usuário autenticado:', authService.getUsuarioAtual().nome);
    }
    
    // Carregar componentes específicos da página atual (se houver função)
    if (typeof carregarComponentesPagina === 'function') {
      await carregarComponentesPagina();
    }
    
    // Verificar se há atualizações pendentes
    verificarAtualizacoesPendentes();
    
  } catch (error) {
    console.error('Erro na inicialização da aplicação:', error);
    mostrarNotificacao('Erro ao inicializar a aplicação. Tente novamente.', 'erro');
  }
}

/**
 * Verifica se há atualizações pendentes no sistema
 */
function verificarAtualizacoesPendentes() {
  // Esta é uma função simulada para ilustrar a verificação de atualizações
  // Em um ambiente real, isso poderia verificar com o backend
  const versaoAtual = config.app.versao;
  
  // Simulação de verificação de atualização
  if (config.app.env === 'development') {
    setTimeout(() => {
      console.log('Verificação de atualizações pendentes concluída');
    }, 1000);
  }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarAplicacao);

// Exportar funções e serviços para uso global
window.api = apiService;
window.auth = authService;
window.config = config;
window.mostrarNotificacao = mostrarNotificacao;

// Exportar para uso em módulos
export {
  apiService,
  authService,
  dependenciasManager,
  config,
  mostrarNotificacao
}; 