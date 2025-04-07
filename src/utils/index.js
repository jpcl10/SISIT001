/**
 * Sistema UBS - Utilitários
 * 
 * Exporta todas as funções utilitárias para uso em toda a aplicação
 */

// Importar utilitários
import * as constants from './constants';
import formatters from './formatters';
import helpers from './helpers';

// Exportação individual de cada módulo
export { constants, formatters, helpers };

// Exportação de constantes específicas
export {
  APP_VERSION,
  AMBIENTE,
  STATUS_SOLICITACAO,
  STATUS_SOLICITACAO_DISPLAY,
  STATUS_SOLICITACAO_COR,
  PRIORIDADE_SOLICITACAO,
  PRIORIDADE_SOLICITACAO_DISPLAY,
  PRIORIDADE_SOLICITACAO_COR,
  TIPO_SOLICITACAO,
  TIPO_SOLICITACAO_DISPLAY,
  PERFIL_USUARIO,
  PERFIL_USUARIO_DISPLAY,
  ESTADO_UF,
  ESTADOS_LISTA,
  FORMATO_DATA,
  TEMPO,
  PAGINACAO,
  API,
  STORAGE_KEYS,
  EVENTOS,
  CONFIG_PADRAO,
  TIPOS_ERRO,
  HTTP_STATUS,
  UNIDADES_SAUDE,
  ESPECIALIDADES,
  EXAMES
} from './constants';

// Exportação de funções de formatação
export {
  formatData,
  formatNumero,
  formatDocumento,
  formatSolicitacao,
  formatTexto
} from './formatters';

// Exportação de funções auxiliares
export {
  objetos,
  arrays,
  strings,
  storage,
  urls,
  datas,
  controleFluxo
} from './helpers';

// Exportação padrão
export default {
  constants,
  formatters,
  helpers
}; 