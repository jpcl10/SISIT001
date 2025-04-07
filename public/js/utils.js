/**
 * Módulo de utilidades
 */

/**
 * Inicializa o módulo de utilidades
 */
export function setupUtils() {
  console.log('Inicializando módulo de utilidades...');
}

/**
 * Exibe uma notificação na tela
 * @param {string} mensagem - Mensagem a ser exibida
 * @param {string} tipo - Tipo da notificação (sucesso, erro, info, aviso)
 * @param {number} duracao - Duração em milissegundos
 */
export function mostrarNotificacao(mensagem, tipo = 'info', duracao = 4000) {
  // Criar elemento de notificação
  const notificacao = document.createElement('div');
  notificacao.className = `notificacao notificacao-${tipo}`;
  notificacao.textContent = mensagem;
  
  // Adicionar à página
  document.body.appendChild(notificacao);
  
  // Mostrar com animação
  setTimeout(() => {
    notificacao.classList.add('visivel');
  }, 10);
  
  // Remover após duração
  setTimeout(() => {
    notificacao.classList.remove('visivel');
    setTimeout(() => {
      document.body.removeChild(notificacao);
    }, 300);
  }, duracao);
}

/**
 * Formata uma data para exibição
 * @param {string|Date} data - Data a ser formatada
 * @param {string} formato - Formato de saída (curto, longo, hora)
 * @returns {string} Data formatada
 */
export function formatarData(data, formato = 'curto') {
  const dataObj = data instanceof Date ? data : new Date(data);
  
  if (isNaN(dataObj.getTime())) {
    return '';
  }
  
  const options = {
    curto: { day: '2-digit', month: '2-digit', year: 'numeric' },
    longo: { day: '2-digit', month: 'long', year: 'numeric' },
    hora: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  };
  
  return dataObj.toLocaleDateString('pt-BR', options[formato] || options.curto);
}

/**
 * Carrega componentes HTML em elementos usando fetch
 * @param {string} seletor - Seletor CSS do elemento onde o componente será inserido
 * @param {string} caminhoComponente - Caminho para o arquivo HTML do componente
 * @param {Function} callback - Função opcional a ser executada após o carregamento
 */
async function carregarComponente(seletor, caminhoComponente, callback = null) {
  const elemento = document.querySelector(seletor);
  
  if (!elemento) {
    console.error(`Elemento com seletor '${seletor}' não encontrado`);
    return;
  }
  
  try {
    const html = await apiService.carregarComponente(caminhoComponente);
    elemento.innerHTML = html;
    
    if (callback && typeof callback === 'function') {
      callback();
    }
  } catch (erro) {
    console.error(`Falha ao carregar componente ${caminhoComponente}:`, erro);
    elemento.innerHTML = `<p>Erro ao carregar componente</p>`;
  }
}

/**
 * Formata um valor numérico como moeda brasileira
 * @param {number} valor - O valor a ser formatado
 * @returns {string} - O valor formatado como moeda
 */
function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/**
 * Formata um CPF (adiciona pontuação)
 * @param {string} cpf - O CPF a ser formatado
 * @returns {string} - O CPF formatado
 */
function formatarCPF(cpf) {
  // Remove caracteres não numéricos
  const apenasNumeros = cpf.replace(/\D/g, '');
  
  if (apenasNumeros.length !== 11) {
    return cpf;
  }
  
  return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Gera um ID único simples
 * @returns {string} - Um ID único
 */
function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Sanitiza uma string para evitar injeção de scripts
 * @param {string} texto - O texto a ser sanitizado
 * @returns {string} - O texto sanitizado
 */
function sanitizarTexto(texto) {
  const temp = document.createElement('div');
  temp.textContent = texto;
  return temp.innerHTML;
}

/**
 * Limita um texto a um número específico de caracteres
 * @param {string} texto - O texto a ser limitado
 * @param {number} limite - O número máximo de caracteres
 * @param {boolean} adicionarReticencias - Se deve adicionar reticências no final
 * @returns {string} - O texto limitado
 */
function limitarTexto(texto, limite = 100, adicionarReticencias = true) {
  if (texto.length <= limite) {
    return texto;
  }
  
  return texto.slice(0, limite) + (adicionarReticencias ? '...' : '');
}

// Exportar todas as funções
export default {
  setupUtils,
  mostrarNotificacao,
  formatarData,
  carregarComponente,
  formatarMoeda,
  formatarCPF,
  gerarId,
  sanitizarTexto,
  limitarTexto
}; 