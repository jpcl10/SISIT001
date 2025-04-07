/**
 * Sistema UBS - Serviço de Logging
 * 
 * Responsável pelo gerenciamento centralizado de logs da aplicação
 */

// Importar serviços necessários
const apiService = require('./ApiService');
const sessionManager = require('./SessionManager');

/**
 * Níveis de log disponíveis
 */
const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * Tipos de contexto para os logs
 */
const LogContext = {
  API: 'api',
  AUTENTICACAO: 'auth',
  APLICACAO: 'app',
  SOLICITACAO: 'solicitacao',
  FORMULARIO: 'form',
  NAVEGACAO: 'navigation',
  UI: 'ui',
  STORAGE: 'storage',
  CACHE: 'cache'
};

/**
 * Classe que gerencia os logs da aplicação
 */
class LogService {
  constructor() {
    // Flag para habilitar/desabilitar logs
    this.enabled = true;
    
    // Nível mínimo de log para exibir no console
    this.consoleLevel = LogLevel.DEBUG;
    
    // Nível mínimo de log para enviar ao servidor
    this.serverLevel = LogLevel.INFO;
    
    // Flag para envio de logs para o servidor
    this.sendToServer = false;
    
    // Endpoint para envio de logs ao servidor
    this.serverEndpoint = '/api/logs';
    
    // Buffer para armazenar logs pendentes de envio
    this.buffer = [];
    
    // Tamanho máximo do buffer antes de flush
    this.bufferSize = 20;
    
    // Intervalo de flush em milissegundos
    this.flushInterval = 30000; // 30 segundos
    
    // Configurar timer para limpeza automática do buffer
    this._setupFlushTimer();
    
    // Mapear nomes para cores no console para cada nível
    this.consoleColors = {
      [LogLevel.DEBUG]: '#6c757d', // Cinza
      [LogLevel.INFO]: '#0dcaf0',  // Azul claro
      [LogLevel.WARN]: '#ffc107',  // Amarelo
      [LogLevel.ERROR]: '#dc3545', // Vermelho
      [LogLevel.CRITICAL]: '#9c27b0' // Roxo
    };
  }

  /**
   * Configura o timer para flush automático do buffer
   * @private
   */
  _setupFlushTimer() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Determina se um log deve ser processado com base no seu nível
   * @param {string} level - Nível do log
   * @param {string} targetLevel - Nível mínimo configurado
   * @private
   */
  _shouldLog(level, targetLevel) {
    if (!this.enabled) return false;
    
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.CRITICAL];
    const levelIndex = levels.indexOf(level);
    const targetIndex = levels.indexOf(targetLevel);
    
    return levelIndex >= targetIndex;
  }

  /**
   * Adiciona informações de contexto ao log
   * @param {Object} logData - Dados básicos do log
   * @private
   */
  _addContextInfo(logData) {
    // Adicionar versão da aplicação
    logData.version = window.APP_VERSION || '1.0.0';
    
    // Adicionar informações do navegador
    logData.userAgent = navigator.userAgent;
    
    // Adicionar URL atual
    logData.url = window.location.href;
    
    // Adicionar informações do usuário se estiver logado
    const user = sessionManager.getUsuarioAtual();
    if (user) {
      logData.userId = user.id;
      logData.userRole = user.perfil;
    }
    
    // Adicionar timestamp
    logData.timestamp = new Date().toISOString();
    
    return logData;
  }

  /**
   * Imprime log no console com estilo adequado
   * @param {string} level - Nível do log
   * @param {string} message - Mensagem do log
   * @param {Object} data - Dados adicionais
   * @private
   */
  _logToConsole(level, message, data = {}) {
    if (!this._shouldLog(level, this.consoleLevel)) return;
    
    const color = this.consoleColors[level] || '#000000';
    const prefix = `%c[${level.toUpperCase()}]`;
    
    // Estilo para o prefixo do log
    const style = `font-weight: bold; color: ${color};`;
    
    // Obter timestamp formatado
    const timestamp = new Date().toLocaleTimeString();
    
    // Verificar se há dados adicionais
    if (Object.keys(data).length > 0) {
      console.groupCollapsed(`${prefix} ${timestamp} - ${message}`, style);
      console.log('Context:', data);
      
      // Mostrar stack trace para erros
      if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
        console.trace('Stack trace:');
      }
      
      console.groupEnd();
    } else {
      console.log(`${prefix} ${timestamp} - ${message}`, style);
    }
  }

  /**
   * Adiciona um log ao buffer para envio posterior ao servidor
   * @param {Object} logData - Dados do log
   * @private
   */
  _addToBuffer(logData) {
    if (!this.sendToServer) return;
    if (!this._shouldLog(logData.level, this.serverLevel)) return;
    
    // Adicionar ao buffer
    this.buffer.push(logData);
    
    // Executar flush automático se o buffer atingir o tamanho máximo
    if (this.buffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  /**
   * Envia logs do buffer para o servidor
   * @returns {Promise<void>}
   */
  async flush() {
    if (!this.sendToServer || this.buffer.length === 0) return;
    
    try {
      const logs = [...this.buffer];
      this.buffer = [];
      
      await apiService.post(this.serverEndpoint, { logs });
    } catch (error) {
      // Em caso de erro, retorna os logs para o buffer para tentar novamente
      console.error('Falha ao enviar logs para o servidor:', error);
      
      // Limitamos para não acumular infinitamente em caso de falha persistente
      if (this.buffer.length < 100) {
        this.buffer = [...this.buffer, ...this.buffer.slice(0, 20)];
      }
    }
  }

  /**
   * Método genérico para registrar logs
   * @param {string} level - Nível do log
   * @param {string} message - Mensagem do log
   * @param {string} context - Contexto do log
   * @param {Object} data - Dados adicionais
   * @private
   */
  _log(level, message, context = LogContext.APLICACAO, data = {}) {
    // Verificar se logging está habilitado
    if (!this.enabled) return;
    
    // Construir objeto do log
    const logData = {
      level,
      message,
      context,
      data
    };
    
    // Adicionar informações de contexto
    this._addContextInfo(logData);
    
    // Enviar para console
    this._logToConsole(level, message, logData);
    
    // Adicionar ao buffer para envio ao servidor
    this._addToBuffer(logData);
    
    return logData;
  }

  /**
   * Registra um log de nível DEBUG
   * @param {string} message - Mensagem do log
   * @param {string} context - Contexto do log
   * @param {Object} data - Dados adicionais
   */
  debug(message, context = LogContext.APLICACAO, data = {}) {
    return this._log(LogLevel.DEBUG, message, context, data);
  }

  /**
   * Registra um log de nível INFO
   * @param {string} message - Mensagem do log
   * @param {string} context - Contexto do log
   * @param {Object} data - Dados adicionais
   */
  info(message, context = LogContext.APLICACAO, data = {}) {
    return this._log(LogLevel.INFO, message, context, data);
  }

  /**
   * Registra um log de nível WARN
   * @param {string} message - Mensagem do log
   * @param {string} context - Contexto do log
   * @param {Object} data - Dados adicionais
   */
  warn(message, context = LogContext.APLICACAO, data = {}) {
    return this._log(LogLevel.WARN, message, context, data);
  }

  /**
   * Registra um log de nível ERROR
   * @param {string} message - Mensagem do log
   * @param {string|Error} error - Erro ou mensagem de erro
   * @param {string} context - Contexto do log
   * @param {Object} data - Dados adicionais
   */
  error(message, error = null, context = LogContext.APLICACAO, data = {}) {
    let errorData = data;
    
    // Se o erro for um objeto Error, extrair informações
    if (error instanceof Error) {
      errorData = {
        ...data,
        errorMessage: error.message,
        errorName: error.name,
        stack: error.stack
      };
    } else if (error) {
      errorData = {
        ...data,
        errorDetails: error
      };
    }
    
    return this._log(LogLevel.ERROR, message, context, errorData);
  }

  /**
   * Registra um log de nível CRITICAL
   * @param {string} message - Mensagem do log
   * @param {string|Error} error - Erro ou mensagem de erro
   * @param {string} context - Contexto do log
   * @param {Object} data - Dados adicionais
   */
  critical(message, error = null, context = LogContext.APLICACAO, data = {}) {
    let errorData = data;
    
    // Se o erro for um objeto Error, extrair informações
    if (error instanceof Error) {
      errorData = {
        ...data,
        errorMessage: error.message,
        errorName: error.name,
        stack: error.stack
      };
    } else if (error) {
      errorData = {
        ...data,
        errorDetails: error
      };
    }
    
    return this._log(LogLevel.CRITICAL, message, context, errorData);
  }

  /**
   * Registra o início de uma operação
   * @param {string} operationName - Nome da operação
   * @param {string} context - Contexto do log
   * @param {Object} data - Dados adicionais
   * @returns {Object} - Objeto para finalizar o log da operação
   */
  startOperation(operationName, context = LogContext.APLICACAO, data = {}) {
    const startTime = performance.now();
    const operationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.info(`Iniciando operação: ${operationName}`, context, {
      ...data,
      operationId,
      operationType: 'start'
    });
    
    return {
      end: (result = null, error = null) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (error) {
          this.error(`Falha na operação: ${operationName}`, error, context, {
            ...data,
            operationId,
            operationType: 'end',
            duration,
            failed: true
          });
        } else {
          this.info(`Concluída operação: ${operationName}`, context, {
            ...data,
            operationId,
            operationType: 'end',
            duration,
            result
          });
        }
        
        return duration;
      }
    };
  }

  /**
   * Obtém todos os níveis de log disponíveis
   * @returns {Object} - Objeto com os níveis de log
   */
  getLevels() {
    return { ...LogLevel };
  }

  /**
   * Obtém todos os contextos de log disponíveis
   * @returns {Object} - Objeto com os contextos
   */
  getContexts() {
    return { ...LogContext };
  }

  /**
   * Configura o serviço de logging
   * @param {Object} config - Configurações
   */
  configure(config = {}) {
    if (config.enabled !== undefined) this.enabled = Boolean(config.enabled);
    if (config.consoleLevel) this.consoleLevel = config.consoleLevel;
    if (config.serverLevel) this.serverLevel = config.serverLevel;
    if (config.sendToServer !== undefined) this.sendToServer = Boolean(config.sendToServer);
    if (config.serverEndpoint) this.serverEndpoint = config.serverEndpoint;
    if (config.bufferSize) this.bufferSize = config.bufferSize;
    if (config.flushInterval) {
      this.flushInterval = config.flushInterval;
      this._setupFlushTimer();
    }
  }
}

// Exportações
module.exports = {
  log: new LogService(),
  NIVEL_LOG: LogLevel,
  CONTEXTO_LOG: LogContext
}; 