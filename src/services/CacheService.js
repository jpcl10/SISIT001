/**
 * Sistema UBS - Serviço de Cache
 * 
 * Responsável pelo gerenciamento de cache de dados
 * para melhorar a performance da aplicação.
 */

/**
 * Classe que gerencia o cache de dados
 */
class CacheService {
  constructor() {
    this.caches = {};
    this.timeouts = {};
    
    // Configurações padrão
    this.defaultConfig = {
      ttl: 5 * 60 * 1000, // Tempo de vida padrão (5 minutos)
      capacity: 50,       // Capacidade máxima de itens por cache
      updatePolicy: 'LRU' // Política de atualização (Least Recently Used)
    };
    
    // Iniciar limpeza periódica
    this.iniciarLimpezaPeriodica();
  }

  /**
   * Obtém configurações mescladas para um cache
   * @param {Object} config - Configurações personalizadas
   * @returns {Object} - Configurações mescladas
   */
  getConfig(config = {}) {
    return { ...this.defaultConfig, ...config };
  }

  /**
   * Inicializa um cache específico se não existir
   * @param {string} cacheName - Nome do cache
   * @param {Object} config - Configurações personalizadas
   */
  initCache(cacheName, config = {}) {
    if (!this.caches[cacheName]) {
      this.caches[cacheName] = {
        items: {},
        keys: [], // Para controle de LRU
        config: this.getConfig(config)
      };
    }
  }

  /**
   * Define um item no cache
   * @param {string} cacheName - Nome do cache
   * @param {string} key - Chave do item
   * @param {*} data - Dados a serem armazenados
   * @param {Object} config - Configurações personalizadas
   * @returns {Object} - Dados armazenados
   */
  set(cacheName, key, data, config = {}) {
    this.initCache(cacheName, config);
    const cache = this.caches[cacheName];
    const cacheConfig = cache.config;
    
    // Verificar se a chave já existe
    const keyExists = key in cache.items;
    
    // Se a chave não existe e atingimos a capacidade, remover o item menos recente
    if (!keyExists && cache.keys.length >= cacheConfig.capacity) {
      const oldestKey = cache.keys.shift();
      delete cache.items[oldestKey];
    }
    
    // Atualizar posição da chave na lista LRU
    if (keyExists) {
      const keyIndex = cache.keys.indexOf(key);
      if (keyIndex !== -1) {
        cache.keys.splice(keyIndex, 1);
      }
    }
    
    // Adicionar chave no final (mais recente)
    cache.keys.push(key);
    
    // Armazenar dados com metadados
    cache.items[key] = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + cacheConfig.ttl
    };
    
    // Definir timeout para expiração
    if (this.timeouts[`${cacheName}_${key}`]) {
      clearTimeout(this.timeouts[`${cacheName}_${key}`]);
    }
    
    this.timeouts[`${cacheName}_${key}`] = setTimeout(() => {
      this.remove(cacheName, key);
    }, cacheConfig.ttl);
    
    return data;
  }

  /**
   * Obtém um item do cache
   * @param {string} cacheName - Nome do cache
   * @param {string} key - Chave do item
   * @param {Object} options - Opções adicionais
   * @returns {*} - Dados armazenados ou undefined se não encontrado/expirado
   */
  get(cacheName, key, options = {}) {
    const { ignoreExpiration = false } = options;
    
    // Verificar se o cache existe
    if (!this.caches[cacheName] || !this.caches[cacheName].items[key]) {
      return undefined;
    }
    
    const cache = this.caches[cacheName];
    const item = cache.items[key];
    
    // Verificar expiração a menos que seja ignorada
    if (!ignoreExpiration && item.expires < Date.now()) {
      this.remove(cacheName, key);
      return undefined;
    }
    
    // Atualizar posição na lista LRU
    const keyIndex = cache.keys.indexOf(key);
    if (keyIndex !== -1) {
      cache.keys.splice(keyIndex, 1);
      cache.keys.push(key);
    }
    
    return item.data;
  }

  /**
   * Remove um item do cache
   * @param {string} cacheName - Nome do cache
   * @param {string} key - Chave do item
   * @returns {boolean} - True se o item foi removido, false caso contrário
   */
  remove(cacheName, key) {
    // Verificar se o cache existe
    if (!this.caches[cacheName] || !this.caches[cacheName].items[key]) {
      return false;
    }
    
    const cache = this.caches[cacheName];
    
    // Remover timeout
    if (this.timeouts[`${cacheName}_${key}`]) {
      clearTimeout(this.timeouts[`${cacheName}_${key}`]);
      delete this.timeouts[`${cacheName}_${key}`];
    }
    
    // Remover da lista de chaves
    const keyIndex = cache.keys.indexOf(key);
    if (keyIndex !== -1) {
      cache.keys.splice(keyIndex, 1);
    }
    
    // Remover item
    delete cache.items[key];
    
    return true;
  }

  /**
   * Limpa todos os itens de um cache
   * @param {string} cacheName - Nome do cache
   * @returns {boolean} - True se o cache foi limpo, false caso não exista
   */
  clear(cacheName) {
    if (!this.caches[cacheName]) {
      return false;
    }
    
    // Limpar todos os timeouts associados
    Object.keys(this.timeouts).forEach(timeoutKey => {
      if (timeoutKey.startsWith(`${cacheName}_`)) {
        clearTimeout(this.timeouts[timeoutKey]);
        delete this.timeouts[timeoutKey];
      }
    });
    
    // Reiniciar cache
    this.caches[cacheName] = {
      items: {},
      keys: [],
      config: this.caches[cacheName].config
    };
    
    return true;
  }

  /**
   * Limpa todos os caches
   */
  clearAll() {
    // Limpar todos os timeouts
    Object.keys(this.timeouts).forEach(timeoutKey => {
      clearTimeout(this.timeouts[timeoutKey]);
    });
    
    this.timeouts = {};
    this.caches = {};
  }

  /**
   * Verifica se um item está no cache e não expirou
   * @param {string} cacheName - Nome do cache
   * @param {string} key - Chave do item
   * @returns {boolean} - True se o item existe e não expirou
   */
  has(cacheName, key) {
    // Verificar se o cache existe
    if (!this.caches[cacheName] || !this.caches[cacheName].items[key]) {
      return false;
    }
    
    const item = this.caches[cacheName].items[key];
    
    // Verificar expiração
    if (item.expires < Date.now()) {
      this.remove(cacheName, key);
      return false;
    }
    
    return true;
  }

  /**
   * Renova o tempo de expiração de um item
   * @param {string} cacheName - Nome do cache
   * @param {string} key - Chave do item
   * @param {number} ttl - Novo tempo de vida (opcional)
   * @returns {boolean} - True se o item foi renovado
   */
  renovar(cacheName, key, ttl = null) {
    // Verificar se o cache existe
    if (!this.caches[cacheName] || !this.caches[cacheName].items[key]) {
      return false;
    }
    
    const cache = this.caches[cacheName];
    const item = cache.items[key];
    
    // Calcular nova expiração
    const novoTtl = ttl || cache.config.ttl;
    item.expires = Date.now() + novoTtl;
    
    // Atualizar timeout
    if (this.timeouts[`${cacheName}_${key}`]) {
      clearTimeout(this.timeouts[`${cacheName}_${key}`]);
    }
    
    this.timeouts[`${cacheName}_${key}`] = setTimeout(() => {
      this.remove(cacheName, key);
    }, novoTtl);
    
    return true;
  }

  /**
   * Inicia a limpeza periódica de itens expirados
   */
  iniciarLimpezaPeriodica() {
    // Executar limpeza a cada 15 minutos
    setInterval(() => {
      this.limparItensExpirados();
    }, 15 * 60 * 1000);
  }

  /**
   * Limpa todos os itens expirados em todos os caches
   */
  limparItensExpirados() {
    const agora = Date.now();
    
    Object.keys(this.caches).forEach(cacheName => {
      const cache = this.caches[cacheName];
      const itensExpirados = [];
      
      // Identificar itens expirados
      Object.keys(cache.items).forEach(key => {
        if (cache.items[key].expires < agora) {
          itensExpirados.push(key);
        }
      });
      
      // Remover itens expirados
      itensExpirados.forEach(key => {
        this.remove(cacheName, key);
      });
    });
  }

  /**
   * Obtém estatísticas sobre um cache
   * @param {string} cacheName - Nome do cache
   * @returns {Object} - Estatísticas do cache
   */
  getStats(cacheName) {
    if (!this.caches[cacheName]) {
      return {
        exists: false,
        items: 0,
        size: 0,
        hitRatio: 0
      };
    }
    
    const cache = this.caches[cacheName];
    const itemCount = Object.keys(cache.items).length;
    
    return {
      exists: true,
      items: itemCount,
      size: itemCount,
      capacity: cache.config.capacity,
      usage: itemCount / cache.config.capacity
    };
  }

  /**
   * Obtém ou define um item em cache com callback para criar o item se não existir
   * @param {string} cacheName - Nome do cache
   * @param {string} key - Chave do item
   * @param {Function} callback - Função para gerar o valor se não existir
   * @param {Object} config - Configurações personalizadas
   * @returns {Promise<*>} - Dados armazenados
   */
  async getOrSet(cacheName, key, callback, config = {}) {
    // Verificar se o item existe no cache
    const cachedData = this.get(cacheName, key);
    
    if (cachedData !== undefined) {
      return cachedData;
    }
    
    // Se não existe, chamar o callback para obter os dados
    try {
      const data = await callback();
      
      // Armazenar no cache e retornar
      return this.set(cacheName, key, data, config);
    } catch (error) {
      console.error(`Erro ao buscar dados para cache ${cacheName}/${key}:`, error);
      throw error;
    }
  }
}

// Exporta instância única do serviço
const cacheService = new CacheService();
export default cacheService; 