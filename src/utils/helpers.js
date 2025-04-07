/**
 * Sistema UBS - Funções Auxiliares
 * 
 * Conjunto de funções utilitárias para uso em todo o sistema
 */

import { STORAGE_KEYS } from './constants';

/**
 * Funções para trabalhar com objetos
 */
export const objetos = {
  /**
   * Verifica se um objeto está vazio
   * @param {Object} obj - Objeto a ser verificado
   * @returns {boolean} - True se o objeto estiver vazio
   */
  estaVazio(obj) {
    if (!obj) return true;
    return Object.keys(obj).length === 0;
  },

  /**
   * Obtém o valor de uma propriedade aninhada de um objeto de forma segura
   * @param {Object} obj - Objeto a ser acessado
   * @param {string} path - Caminho da propriedade (ex: "pessoa.nome")
   * @param {*} valorPadrao - Valor padrão caso a propriedade não exista
   * @returns {*} - Valor da propriedade ou valorPadrao
   */
  get(obj, path, valorPadrao = undefined) {
    if (!obj || !path) return valorPadrao;
    
    const partes = path.split('.');
    let resultado = obj;
    
    for (const parte of partes) {
      if (resultado === null || resultado === undefined || typeof resultado !== 'object') {
        return valorPadrao;
      }
      
      resultado = resultado[parte];
    }
    
    return resultado === undefined ? valorPadrao : resultado;
  },

  /**
   * Define o valor de uma propriedade aninhada de um objeto de forma segura
   * @param {Object} obj - Objeto a ser modificado
   * @param {string} path - Caminho da propriedade (ex: "pessoa.nome")
   * @param {*} valor - Valor a ser definido
   * @returns {Object} - Objeto modificado
   */
  set(obj, path, valor) {
    if (!obj || !path) return obj;
    
    const resultado = { ...obj };
    const partes = path.split('.');
    let atual = resultado;
    
    for (let i = 0; i < partes.length - 1; i++) {
      const parte = partes[i];
      
      if (!atual[parte] || typeof atual[parte] !== 'object') {
        atual[parte] = {};
      }
      
      atual = atual[parte];
    }
    
    atual[partes[partes.length - 1]] = valor;
    
    return resultado;
  },

  /**
   * Remove propriedades undefined ou null de um objeto
   * @param {Object} obj - Objeto a ser limpo
   * @returns {Object} - Objeto sem propriedades vazias
   */
  limparVazios(obj) {
    if (!obj) return {};
    
    const resultado = {};
    
    Object.keys(obj).forEach(key => {
      const valor = obj[key];
      
      if (valor !== null && valor !== undefined) {
        if (typeof valor === 'object' && !Array.isArray(valor)) {
          const limpo = this.limparVazios(valor);
          
          if (!this.estaVazio(limpo)) {
            resultado[key] = limpo;
          }
        } else {
          resultado[key] = valor;
        }
      }
    });
    
    return resultado;
  },

  /**
   * Mescla objetos profundamente
   * @param {Object} target - Objeto alvo
   * @param {Object} source - Objeto fonte
   * @returns {Object} - Objeto mesclado
   */
  mesclar(target, source) {
    if (!target) return source || {};
    if (!source) return target;
    
    const resultado = { ...target };
    
    Object.keys(source).forEach(key => {
      const valorSource = source[key];
      
      if (
        typeof valorSource === 'object' && 
        valorSource !== null && 
        !Array.isArray(valorSource) &&
        typeof resultado[key] === 'object' && 
        resultado[key] !== null && 
        !Array.isArray(resultado[key])
      ) {
        resultado[key] = this.mesclar(resultado[key], valorSource);
      } else {
        resultado[key] = valorSource;
      }
    });
    
    return resultado;
  }
};

/**
 * Funções para trabalhar com arrays
 */
export const arrays = {
  /**
   * Agrupa um array de objetos por uma propriedade
   * @param {Array} array - Array a ser agrupado
   * @param {string|Function} chave - Propriedade ou função para agrupar
   * @returns {Object} - Objeto agrupado
   */
  agrupar(array, chave) {
    if (!array || !Array.isArray(array)) return {};
    
    return array.reduce((acc, item) => {
      const valorChave = typeof chave === 'function' ? chave(item) : item[chave];
      
      if (!acc[valorChave]) {
        acc[valorChave] = [];
      }
      
      acc[valorChave].push(item);
      
      return acc;
    }, {});
  },

  /**
   * Ordena um array de objetos por uma propriedade
   * @param {Array} array - Array a ser ordenado
   * @param {string|Function} chave - Propriedade ou função para ordenar
   * @param {boolean} decrescente - Se verdadeiro, ordena em ordem decrescente
   * @returns {Array} - Array ordenado
   */
  ordenar(array, chave, decrescente = false) {
    if (!array || !Array.isArray(array)) return [];
    
    const copia = [...array];
    
    copia.sort((a, b) => {
      const valorA = typeof chave === 'function' ? chave(a) : a[chave];
      const valorB = typeof chave === 'function' ? chave(b) : b[chave];
      
      if (valorA < valorB) return decrescente ? 1 : -1;
      if (valorA > valorB) return decrescente ? -1 : 1;
      return 0;
    });
    
    return copia;
  },

  /**
   * Filtra valores únicos de um array
   * @param {Array} array - Array a ser filtrado
   * @param {string|Function} chave - Propriedade ou função para comparar (opcional)
   * @returns {Array} - Array com valores únicos
   */
  unicos(array, chave = null) {
    if (!array || !Array.isArray(array)) return [];
    
    if (!chave) {
      return [...new Set(array)];
    }
    
    const visto = new Set();
    
    return array.filter(item => {
      const valorChave = typeof chave === 'function' ? chave(item) : item[chave];
      
      if (visto.has(valorChave)) {
        return false;
      }
      
      visto.add(valorChave);
      return true;
    });
  },

  /**
   * Divide um array em grupos de tamanho específico
   * @param {Array} array - Array a ser dividido
   * @param {number} tamanho - Tamanho de cada grupo
   * @returns {Array} - Array de arrays agrupados
   */
  dividir(array, tamanho) {
    if (!array || !Array.isArray(array) || tamanho <= 0) return [];
    
    const resultado = [];
    
    for (let i = 0; i < array.length; i += tamanho) {
      resultado.push(array.slice(i, i + tamanho));
    }
    
    return resultado;
  },

  /**
   * Cria um array com um intervalo de números
   * @param {number} inicio - Número inicial
   * @param {number} fim - Número final
   * @param {number} passo - Incremento
   * @returns {Array} - Array com o intervalo
   */
  intervalo(inicio, fim, passo = 1) {
    const resultado = [];
    
    if (passo === 0 || (inicio < fim && passo < 0) || (inicio > fim && passo > 0)) {
      return resultado;
    }
    
    if (inicio < fim) {
      for (let i = inicio; i <= fim; i += passo) {
        resultado.push(i);
      }
    } else {
      for (let i = inicio; i >= fim; i -= Math.abs(passo)) {
        resultado.push(i);
      }
    }
    
    return resultado;
  }
};

/**
 * Funções para manipulação de strings
 */
export const strings = {
  /**
   * Remove acentos de uma string
   * @param {string} texto - Texto a ser processado
   * @returns {string} - Texto sem acentos
   */
  removerAcentos(texto) {
    if (!texto) return '';
    
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  },

  /**
   * Gera um ID único baseado em timestamp e caracteres aleatórios
   * @param {string} prefixo - Prefixo para o ID
   * @returns {string} - ID único
   */
  gerarId(prefixo = '') {
    const timestamp = new Date().getTime().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    
    return `${prefixo}${timestamp}${random}`;
  },

  /**
   * Verifica se uma string é um JSON válido
   * @param {string} texto - Texto a ser verificado
   * @returns {boolean} - True se for um JSON válido
   */
  ehJson(texto) {
    if (!texto || typeof texto !== 'string') return false;
    
    try {
      JSON.parse(texto);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Verifica se uma string está vazia ou só tem espaços
   * @param {string} texto - Texto a ser verificado
   * @returns {boolean} - True se a string estiver vazia
   */
  estaVazia(texto) {
    return texto === undefined || texto === null || texto.trim() === '';
  }
};

/**
 * Funções para trabalhar com o localStorage
 */
export const storage = {
  /**
   * Salva um item no localStorage com prefixo do sistema
   * @param {string} chave - Chave do item
   * @param {*} valor - Valor a ser salvo
   * @returns {boolean} - True se o item foi salvo com sucesso
   */
  salvar(chave, valor) {
    try {
      const valorString = JSON.stringify(valor);
      localStorage.setItem(chave, valorString);
      return true;
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
      return false;
    }
  },

  /**
   * Obtém um item do localStorage
   * @param {string} chave - Chave do item
   * @param {*} padrao - Valor padrão caso o item não exista
   * @returns {*} - Valor do item ou valor padrão
   */
  obter(chave, padrao = null) {
    try {
      const item = localStorage.getItem(chave);
      
      if (item === null) {
        return padrao;
      }
      
      return JSON.parse(item);
    } catch (e) {
      console.error('Erro ao obter item do localStorage:', e);
      return padrao;
    }
  },

  /**
   * Remove um item do localStorage
   * @param {string} chave - Chave do item
   * @returns {boolean} - True se o item foi removido com sucesso
   */
  remover(chave) {
    try {
      localStorage.removeItem(chave);
      return true;
    } catch (e) {
      console.error('Erro ao remover item do localStorage:', e);
      return false;
    }
  },

  /**
   * Limpa todos os itens do localStorage relacionados ao sistema
   * @returns {boolean} - True se os itens foram removidos com sucesso
   */
  limpar() {
    try {
      Object.values(STORAGE_KEYS).forEach(chave => {
        localStorage.removeItem(chave);
      });
      return true;
    } catch (e) {
      console.error('Erro ao limpar localStorage:', e);
      return false;
    }
  }
};

/**
 * Funções para manipulação de URLs e parâmetros
 */
export const urls = {
  /**
   * Constrói uma URL com parâmetros
   * @param {string} base - URL base
   * @param {Object} parametros - Parâmetros a serem adicionados
   * @returns {string} - URL completa
   */
  construir(base, parametros = {}) {
    if (!base) return '';
    if (!parametros || objetos.estaVazio(parametros)) return base;
    
    const url = new URL(base, window.location.origin);
    
    Object.entries(parametros).forEach(([chave, valor]) => {
      if (valor !== undefined && valor !== null) {
        url.searchParams.append(chave, valor);
      }
    });
    
    return url.toString();
  },

  /**
   * Extrai parâmetros de uma URL
   * @param {string} url - URL a ser processada (opcional, usa window.location.search por padrão)
   * @returns {Object} - Objeto com os parâmetros
   */
  extrairParametros(url = null) {
    const params = url ? new URL(url).searchParams : new URLSearchParams(window.location.search);
    const resultado = {};
    
    for (const [chave, valor] of params.entries()) {
      resultado[chave] = valor;
    }
    
    return resultado;
  },

  /**
   * Verifica se uma URL é válida
   * @param {string} url - URL a ser verificada
   * @returns {boolean} - True se a URL for válida
   */
  ehValida(url) {
    if (!url) return false;
    
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
};

/**
 * Funções para manipulação de datas
 */
export const datas = {
  /**
   * Adiciona uma quantidade de dias a uma data
   * @param {Date|string} data - Data inicial
   * @param {number} dias - Quantidade de dias a adicionar
   * @returns {Date} - Nova data
   */
  adicionarDias(data, dias) {
    const dataObj = data instanceof Date ? new Date(data.getTime()) : new Date(data);
    dataObj.setDate(dataObj.getDate() + dias);
    return dataObj;
  },

  /**
   * Calcula a diferença em dias entre duas datas
   * @param {Date|string} data1 - Primeira data
   * @param {Date|string} data2 - Segunda data
   * @returns {number} - Diferença em dias
   */
  diferencaDias(data1, data2) {
    const d1 = data1 instanceof Date ? data1 : new Date(data1);
    const d2 = data2 instanceof Date ? data2 : new Date(data2);
    
    // Normalizar as datas para ignorar horas/minutos/segundos
    const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
    
    const MS_POR_DIA = 1000 * 60 * 60 * 24;
    
    return Math.floor((utc2 - utc1) / MS_POR_DIA);
  },

  /**
   * Verifica se uma data está entre duas outras
   * @param {Date|string} data - Data a ser verificada
   * @param {Date|string} inicio - Data de início
   * @param {Date|string} fim - Data de fim
   * @returns {boolean} - True se a data estiver no intervalo
   */
  estaEntre(data, inicio, fim) {
    const dataObj = data instanceof Date ? data : new Date(data);
    const inicioObj = inicio instanceof Date ? inicio : new Date(inicio);
    const fimObj = fim instanceof Date ? fim : new Date(fim);
    
    return dataObj >= inicioObj && dataObj <= fimObj;
  },

  /**
   * Verifica se uma data é hoje
   * @param {Date|string} data - Data a ser verificada
   * @returns {boolean} - True se a data for hoje
   */
  ehHoje(data) {
    const dataObj = data instanceof Date ? data : new Date(data);
    const hoje = new Date();
    
    return (
      dataObj.getDate() === hoje.getDate() &&
      dataObj.getMonth() === hoje.getMonth() &&
      dataObj.getFullYear() === hoje.getFullYear()
    );
  }
};

/**
 * Funções para debounce e throttle
 */
export const controleFluxo = {
  /**
   * Cria uma função com debounce
   * @param {Function} fn - Função a ser executada
   * @param {number} atraso - Atraso em milissegundos
   * @returns {Function} - Função com debounce
   */
  debounce(fn, atraso = 300) {
    let timeoutId;
    
    return function(...args) {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        fn.apply(this, args);
      }, atraso);
    };
  },

  /**
   * Cria uma função com throttle
   * @param {Function} fn - Função a ser executada
   * @param {number} limite - Limite de tempo em milissegundos
   * @returns {Function} - Função com throttle
   */
  throttle(fn, limite = 300) {
    let esperando = false;
    let ultimosArgs = null;
    
    return function(...args) {
      if (esperando) {
        ultimosArgs = args;
        return;
      }
      
      fn.apply(this, args);
      esperando = true;
      
      setTimeout(() => {
        esperando = false;
        
        if (ultimosArgs) {
          fn.apply(this, ultimosArgs);
          ultimosArgs = null;
        }
      }, limite);
    };
  }
};

// Exportar todas as funções em um único objeto
export default {
  objetos,
  arrays,
  strings,
  storage,
  urls,
  datas,
  controleFluxo
}; 