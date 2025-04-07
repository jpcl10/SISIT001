/**
 * app.js
 * Script principal da aplicação UBS Local
 * Gerencia o roteamento e carregamento de componentes
 */

import Dashboard from '../components/Dashboard.js';
import Etapa1 from '../components/Etapa1.js';
import FormularioEspecifico from '../components/FormularioEspecifico.js';
import VisualizarSolicitacao from '../components/VisualizarSolicitacao.js';
import { mostrarNotificacao } from './utils.js';
import apiService from './api.js';
import config from './config.js';

// Inicializar o serviço de API
apiService.configure({
  baseUrl: config.api.baseUrl,
  mockMode: config.api.mockMode
});

// Definição de rotas
const routes = {
  '/': Dashboard,
  '/nova-solicitacao': Etapa1,
  '/formulario/:tipo': FormularioEspecifico,  
  '/visualizar/:id': VisualizarSolicitacao,
  '/editar/:id': FormularioEspecifico
};

// Elemento onde os componentes serão renderizados
const appContainer = document.getElementById('app-container');

// Carrega os componentes de cabeçalho e rodapé
async function carregarComponentesBase() {
  try {
    // Carregar cabeçalho
    const headerHtml = await apiService.carregarComponente('includes/header.html');
    document.getElementById('header-container').innerHTML = headerHtml;
    
    // Carregar rodapé
    const footerHtml = await apiService.carregarComponente('includes/footer.html');
    document.getElementById('footer-container').innerHTML = footerHtml;
  } catch (error) {
    console.error('Erro ao carregar componentes base:', error);
    mostrarNotificacao('Erro ao carregar componentes da interface.', 'erro');
  }
}

// Analisa a URL atual e retorna a rota correspondente e os parâmetros
function parseLocation() {
  let hash = window.location.hash.slice(1) || '/';
  let path = hash.split('?')[0];
  let queryParams = {};
  
  // Extrair parâmetros de consulta (se houver)
  const queryString = hash.includes('?') ? hash.split('?')[1] : '';
  if (queryString) {
    const pairs = queryString.split('&');
    queryParams = pairs.reduce((params, pair) => {
      const [key, value] = pair.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      return params;
    }, {});
  }
  
  return { path, queryParams };
}

// Encontra a rota correspondente, incluindo rotas com parâmetros dinâmicos
function findRouteMatch(path) {
  // Primeiro verifica rotas exatas
  if (routes[path]) {
    return { 
      route: routes[path], 
      params: {}
    };
  }
  
  // Depois verifica rotas com parâmetros
  for (const routePattern in routes) {
    if (routePattern.includes(':')) {
      const routeParts = routePattern.split('/');
      const pathParts = path.split('/');
      
      if (routeParts.length !== pathParts.length) {
        continue;
      }
      
      const params = {};
      let isMatch = true;
      
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
          // Extrair o nome do parâmetro sem os dois pontos
          const paramName = routeParts[i].substring(1);
          params[paramName] = pathParts[i];
        } else if (routeParts[i] !== pathParts[i]) {
          isMatch = false;
          break;
        }
      }
      
      if (isMatch) {
        return { 
          route: routes[routePattern], 
          params: params 
        };
      }
    }
  }
  
  // Nenhuma rota encontrada
  return null;
}

// Renderiza o componente correspondente à rota atual
async function router() {
  const { path, queryParams } = parseLocation();
  
  // Encontrar a rota correspondente
  const match = findRouteMatch(path);
  
  if (!match) {
    // Rota não encontrada, redirecionar para a página inicial
    window.location.hash = '#/';
    return;
  }
  
  // Combinação de parâmetros de rota e consulta
  const params = { 
    ...match.params, 
    ...queryParams
  };
  
  // Instanciar e renderizar o componente
  try {
    // Mostrar indicador de carregamento
    appContainer.innerHTML = '<div class="carregando-container"><div class="carregando"></div></div>';
    
    const Component = match.route;
    const component = new Component(params);
    
    // Renderizar componente
    const html = await component.render();
    appContainer.innerHTML = html;
    
    // Executar lógica após renderização
    if (component.afterRender) {
      await component.afterRender();
    }
  } catch (error) {
    console.error('Erro ao renderizar componente:', error);
    appContainer.innerHTML = `
      <section class="card erro-card">
        <h2>Erro ao carregar página</h2>
        <p>${error.message || 'Ocorreu um erro inesperado.'}</p>
        <a href="#/" class="btn primario">Voltar ao Início</a>
      </section>
    `;
  }
}

// Inicialização da aplicação
async function inicializarApp() {
  // Carregar componentes base
  await carregarComponentesBase();
  
  // Configurar router
  window.addEventListener('hashchange', router);
  
  // Carregar a página inicial ou a rota atual
  await router();
  
  // Adicionar estilos dinâmicos para carregamento
  const style = document.createElement('style');
  style.textContent = `
    .carregando-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }
    
    .carregando {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid var(--cor-destaque);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .erro-card {
      border-left: 4px solid var(--cor-erro);
    }
    
    .cabecalho-visualizacao {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .detalhes-solicitacao {
      margin: 1.5rem 0;
    }
    
    .info-grupo {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }
    
    .info-grupo:last-child {
      border-bottom: none;
    }
    
    .info-grupo h3 {
      color: var(--cor-destaque);
      margin-bottom: 0.75rem;
    }
    
    .acoes-visualizacao {
      display: flex;
      justify-content: space-between;
      margin-top: 1.5rem;
    }
    
    .acoes-direita {
      display: flex;
      gap: 0.5rem;
    }
    
    .dados-especificos-lista {
      display: grid;
      grid-template-columns: 30% 70%;
      gap: 0.5rem;
    }
    
    .dados-especificos-lista dt {
      font-weight: bold;
    }
    
    .dados-especificos-lista dd {
      margin-left: 0;
    }
    
    .mensagem {
      padding: 0.75rem;
      border-radius: var(--borda-arredondada);
      margin: 1rem 0;
    }
    
    .mensagem.erro {
      background-color: rgba(231, 76, 60, 0.1);
      border-left: 4px solid var(--cor-erro);
      color: var(--cor-erro);
    }
  `;
  
  document.head.appendChild(style);
}

// Iniciar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializarApp);

// Adicionar métodos auxiliares ao window para depuração
window.appHelpers = {
  router,
  routes,
}; 