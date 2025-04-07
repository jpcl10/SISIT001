/**
 * Sistema UBS - Índice de Serviços
 * 
 * Exporta todos os serviços da aplicação para facilitar o uso
 */

// Serviços principais
import apiService from './ApiService';
import authService from './AuthService';
import storageService from './StorageService';
import solicitacaoService from './SolicitacaoService';

// Serviços de interface e utilidades
import notificacaoService from './NotificacaoService';
import validacaoService from './ValidacaoService';
import cacheService from './CacheService';
import sessionManager from './SessionManager';
import logService, { NIVEL_LOG, CONTEXTO_LOG } from './LogService';

// Serviços específicos das unidades
import ubsService from './ubs-service';
import centralRegulacaoService from './central-regulacao-service';

// Exportações
export {
  // Serviços principais
  apiService,
  authService,
  storageService,
  solicitacaoService,
  
  // Serviços de interface e utilidades
  notificacaoService,
  validacaoService,
  cacheService,
  sessionManager,
  logService,
  NIVEL_LOG,
  CONTEXTO_LOG,
  
  // Serviços específicos
  ubsService,
  centralRegulacaoService
};

// Export default para facilitar o carregamento dinâmico
export default {
  apiService,
  authService,
  storageService,
  solicitacaoService,
  notificacaoService,
  validacaoService,
  cacheService,
  sessionManager,
  logService,
  ubsService,
  centralRegulacaoService
}; 