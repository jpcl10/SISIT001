/**
 * Sistema Integrado de Regulação UBS - Módulo de Integração
 * 
 * Este módulo gerencia a integração entre os diferentes componentes do sistema,
 * permitindo a comunicação entre UBS e Central de Regulação.
 */

import apiService from './api.js';
import authService from './auth.js';
import { mostrarNotificacao, carregarComponente } from './utils.js';
import config from './config.js';

/**
 * Classe que gerencia a integração entre os módulos do sistema
 */
class IntegracaoSistema {
  constructor() {
    this.componentes = {
      header: 'includes/header.html',
      footer: 'includes/footer.html',
      sidebar: 'includes/navigation.html'
    };
    
    this.interfaces = {
      ubs: '/sistema-ubs.html',
      central: '/sistema-central-regulacao.html',
      login: '/login-central-regulacao.html',
      home: '/index.html'
    };
  }

  /**
   * Inicializa os componentes comuns em todas as páginas
   */
  async inicializarComponentesComuns() {
    try {
      // Carregar header se existir
      const headerContainer = document.getElementById('header-container');
      if (headerContainer) {
        await carregarComponente('#header-container', this.componentes.header);
      }
      
      // Carregar footer se existir
      const footerContainer = document.getElementById('footer-container');
      if (footerContainer) {
        await carregarComponente('#footer-container', this.componentes.footer);
      }
      
      // Carregar sidebar/navigation se existir
      const navContainer = document.getElementById('nav-container');
      if (navContainer) {
        await carregarComponente('#nav-container', this.componentes.sidebar);
      }
      
      console.log('Componentes comuns inicializados');
    } catch (erro) {
      console.error('Erro ao inicializar componentes comuns:', erro);
    }
  }

  /**
   * Carrega dados compartilhados entre as interfaces
   */
  async carregarDadosCompartilhados() {
    try {
      // Preencher dados do usuário na interface
      const usuario = authService.getUsuarioAtual();
      this.atualizarDadosUsuario(usuario);
      
      // Verificar status do sistema
      const dadosStatus = await this.verificarStatusServiços();
      
      // Atualizar contadores e indicadores
      this.atualizarIndicadores();
      
      return { usuario, dadosStatus };
    } catch (erro) {
      console.error('Erro ao carregar dados compartilhados:', erro);
      return null;
    }
  }

  /**
   * Atualiza os dados do usuário na interface
   * @param {Object} usuario - Dados do usuário
   */
  atualizarDadosUsuario(usuario) {
    if (!usuario) return;
    
    // Atualizar nome do usuário nos elementos apropriados
    const elementosNomeUsuario = document.querySelectorAll('.nome-usuario');
    elementosNomeUsuario.forEach(elemento => {
      elemento.textContent = usuario.nome || 'Usuário';
    });
    
    // Atualizar unidade do usuário nos elementos apropriados
    const elementosUnidade = document.querySelectorAll('.unidade-usuario');
    elementosUnidade.forEach(elemento => {
      elemento.textContent = usuario.unidade || '';
    });
    
    // Atualizar perfil do usuário nos elementos apropriados
    const elementosPerfil = document.querySelectorAll('.perfil-usuario');
    elementosPerfil.forEach(elemento => {
      elemento.textContent = usuario.perfil || '';
    });
  }

  /**
   * Ajusta a interface baseado no perfil do usuário
   */
  ajustarInterfaceParaPerfil() {
    const usuario = authService.getUsuarioAtual();
    
    if (!usuario) {
      // Usuário não autenticado - exibir apenas elementos públicos
      const elementosAutenticados = document.querySelectorAll('.requer-autenticacao');
      elementosAutenticados.forEach(el => el.style.display = 'none');
      return;
    }
    
    // Ocultar elementos baseados no perfil
    const perfil = usuario.perfil;
    
    // Elementos específicos da UBS (visíveis apenas para perfil 'ubs')
    const elementosUbs = document.querySelectorAll('.apenas-ubs');
    elementosUbs.forEach(el => {
      el.style.display = perfil === 'ubs' ? '' : 'none';
    });
    
    // Elementos específicos da Central (visíveis apenas para perfil 'regulador')
    const elementosCentral = document.querySelectorAll('.apenas-central');
    elementosCentral.forEach(el => {
      el.style.display = perfil === 'regulador' ? '' : 'none';
    });
    
    // Elementos administrativos (visíveis apenas para perfil 'admin')
    const elementosAdmin = document.querySelectorAll('.apenas-admin');
    elementosAdmin.forEach(el => {
      el.style.display = perfil === 'admin' ? '' : 'none';
    });
    
    // Elementos que requerem permissões específicas
    this.ajustarElementosPorPermissao(usuario);
  }

  /**
   * Ajusta visibilidade de elementos baseado nas permissões do usuário
   * @param {Object} usuario - Dados do usuário
   */
  ajustarElementosPorPermissao(usuario) {
    if (!usuario || !usuario.permissoes) return;
    
    // Elementos que requerem permissões específicas
    const permissoes = usuario.permissoes;
    
    // Para cada permissão, verificar e ajustar os elementos correspondentes
    const elementosPermissao = document.querySelectorAll('[data-requer-permissao]');
    elementosPermissao.forEach(el => {
      const permissaoRequerida = el.getAttribute('data-requer-permissao');
      el.style.display = permissoes.includes(permissaoRequerida) ? '' : 'none';
    });
  }

  /**
   * Verifica status dos serviços do sistema
   */
  async verificarStatusServiços() {
    try {
      const status = await apiService.verificarStatus();
      return status;
    } catch (erro) {
      console.error('Erro ao verificar status dos serviços:', erro);
      return { online: false, erro: erro.message };
    }
  }

  /**
   * Atualiza os indicadores numéricos na interface
   */
  atualizarIndicadores() {
    // Estes são valores simulados para o modo de desenvolvimento
    // Em produção, seriam carregados da API
    
    // Atualizar contador de solicitações total
    const totalSolicitacoesElement = document.getElementById('total-solicitacoes');
    if (totalSolicitacoesElement) {
      totalSolicitacoesElement.textContent = '387';
    }
    
    // Atualizar contador de solicitações pendentes
    const contadorEnviadoElement = document.getElementById('contador-enviado');
    if (contadorEnviadoElement) {
      contadorEnviadoElement.textContent = '128';
    }
    
    // Atualizar contador de rascunhos
    const contadorRascunhoElement = document.getElementById('contador-rascunho');
    if (contadorRascunhoElement) {
      contadorRascunhoElement.textContent = '14';
    }
    
    // Atualizar contador de urgências pendentes
    const urgenciasPendentesElement = document.getElementById('urgencias-pendentes');
    if (urgenciasPendentesElement) {
      urgenciasPendentesElement.textContent = '37';
    }
    
    // Atualizar cotas disponíveis
    const cotasDisponiveisElement = document.getElementById('cotas-disponiveis');
    if (cotasDisponiveisElement) {
      cotasDisponiveisElement.textContent = '215';
    }
  }
}

// Exporta uma instância única do serviço
const integracaoSistema = new IntegracaoSistema();
export default integracaoSistema; 