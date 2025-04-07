/**
 * Sistema UBS - Constantes
 * 
 * Arquivo centralizado para armazenar constantes utilizadas em toda a aplicação
 */

// Versão da aplicação
export const APP_VERSION = '1.0.0';

// Modos de ambiente
export const AMBIENTE = {
  PRODUCAO: 'producao',
  HOMOLOGACAO: 'homologacao',
  DESENVOLVIMENTO: 'desenvolvimento',
  TESTE: 'teste'
};

// Status de solicitações
export const STATUS_SOLICITACAO = {
  RASCUNHO: 'rascunho',
  ENVIADO: 'enviado',
  EM_ANALISE: 'em_analise',
  APROVADO: 'aprovado',
  NEGADO: 'negado',
  DEVOLVIDO: 'devolvido',
  CANCELADO: 'cancelado'
};

// Status formatados para exibição
export const STATUS_SOLICITACAO_DISPLAY = {
  [STATUS_SOLICITACAO.RASCUNHO]: 'Rascunho',
  [STATUS_SOLICITACAO.ENVIADO]: 'Enviado',
  [STATUS_SOLICITACAO.EM_ANALISE]: 'Em Análise',
  [STATUS_SOLICITACAO.APROVADO]: 'Aprovado',
  [STATUS_SOLICITACAO.NEGADO]: 'Negado',
  [STATUS_SOLICITACAO.DEVOLVIDO]: 'Devolvido',
  [STATUS_SOLICITACAO.CANCELADO]: 'Cancelado'
};

// Cores para status
export const STATUS_SOLICITACAO_COR = {
  [STATUS_SOLICITACAO.RASCUNHO]: 'secondary',
  [STATUS_SOLICITACAO.ENVIADO]: 'info',
  [STATUS_SOLICITACAO.EM_ANALISE]: 'primary',
  [STATUS_SOLICITACAO.APROVADO]: 'success',
  [STATUS_SOLICITACAO.NEGADO]: 'danger',
  [STATUS_SOLICITACAO.DEVOLVIDO]: 'warning',
  [STATUS_SOLICITACAO.CANCELADO]: 'dark'
};

// Prioridades de solicitações
export const PRIORIDADE_SOLICITACAO = {
  BAIXA: 'baixa',
  NORMAL: 'normal',
  MEDIA: 'media',
  ALTA: 'alta',
  URGENTE: 'urgente'
};

// Prioridades formatadas para exibição
export const PRIORIDADE_SOLICITACAO_DISPLAY = {
  [PRIORIDADE_SOLICITACAO.BAIXA]: 'Baixa',
  [PRIORIDADE_SOLICITACAO.NORMAL]: 'Normal',
  [PRIORIDADE_SOLICITACAO.MEDIA]: 'Média',
  [PRIORIDADE_SOLICITACAO.ALTA]: 'Alta',
  [PRIORIDADE_SOLICITACAO.URGENTE]: 'Urgente'
};

// Cores para prioridades
export const PRIORIDADE_SOLICITACAO_COR = {
  [PRIORIDADE_SOLICITACAO.BAIXA]: 'info',
  [PRIORIDADE_SOLICITACAO.NORMAL]: 'secondary',
  [PRIORIDADE_SOLICITACAO.MEDIA]: 'primary',
  [PRIORIDADE_SOLICITACAO.ALTA]: 'warning',
  [PRIORIDADE_SOLICITACAO.URGENTE]: 'danger'
};

// Tipos de solicitações
export const TIPO_SOLICITACAO = {
  CONSULTA: 'consulta',
  EXAME: 'exame',
  PROCEDIMENTO: 'procedimento',
  MEDICAMENTO: 'medicamento',
  INTERNACAO: 'internacao',
  OUTRO: 'outro'
};

// Tipos formatados para exibição
export const TIPO_SOLICITACAO_DISPLAY = {
  [TIPO_SOLICITACAO.CONSULTA]: 'Consulta',
  [TIPO_SOLICITACAO.EXAME]: 'Exame',
  [TIPO_SOLICITACAO.PROCEDIMENTO]: 'Procedimento',
  [TIPO_SOLICITACAO.MEDICAMENTO]: 'Medicamento',
  [TIPO_SOLICITACAO.INTERNACAO]: 'Internação',
  [TIPO_SOLICITACAO.OUTRO]: 'Outro'
};

// Perfis de usuários
export const PERFIL_USUARIO = {
  ADMIN: 'admin',
  COORDENADOR: 'coordenador',
  MEDICO: 'medico',
  ENFERMEIRO: 'enfermeiro',
  ATENDENTE: 'atendente',
  FARMACEUTICO: 'farmaceutico',
  REGULADOR: 'regulador'
};

// Perfis formatados para exibição
export const PERFIL_USUARIO_DISPLAY = {
  [PERFIL_USUARIO.ADMIN]: 'Administrador',
  [PERFIL_USUARIO.COORDENADOR]: 'Coordenador',
  [PERFIL_USUARIO.MEDICO]: 'Médico',
  [PERFIL_USUARIO.ENFERMEIRO]: 'Enfermeiro',
  [PERFIL_USUARIO.ATENDENTE]: 'Atendente',
  [PERFIL_USUARIO.FARMACEUTICO]: 'Farmacêutico',
  [PERFIL_USUARIO.REGULADOR]: 'Regulador'
};

// Localidades comuns
export const ESTADO_UF = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins'
};

// Lista de estados para uso em formulários
export const ESTADOS_LISTA = Object.entries(ESTADO_UF).map(([sigla, nome]) => ({
  sigla,
  nome
}));

// Formatos de data
export const FORMATO_DATA = {
  PADRAO: 'DD/MM/YYYY',
  ISO: 'YYYY-MM-DD',
  COMPLETO: 'DD/MM/YYYY HH:mm:ss',
  ISO_COMPLETO: 'YYYY-MM-DDTHH:mm:ss'
};

// Constantes de tempo
export const TEMPO = {
  SEGUNDO: 1000,
  MINUTO: 60 * 1000,
  HORA: 60 * 60 * 1000,
  DIA: 24 * 60 * 60 * 1000,
  SEMANA: 7 * 24 * 60 * 60 * 1000,
  MES: 30 * 24 * 60 * 60 * 1000
};

// Configurações de paginação
export const PAGINACAO = {
  ITENS_POR_PAGINA: 10,
  ITENS_POR_PAGINA_OPCOES: [5, 10, 20, 50, 100]
};

// URLs da API
export const API = {
  BASE_URL: process.env.API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000
};

// Chaves para localStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ubs_auth_token',
  USER_DATA: 'ubs_user_data',
  ULTIMO_ACESSO: 'ubs_ultimo_acesso',
  CONFIGURACOES: 'ubs_config',
  FORMULARIOS_DRAFT: 'ubs_formularios_draft'
};

// Eventos personalizados
export const EVENTOS = {
  LOGIN: 'ubs:login',
  LOGOUT: 'ubs:logout',
  SOLICITACAO_ATUALIZADA: 'ubs:solicitacao_atualizada',
  SOLICITACAO_CRIADA: 'ubs:solicitacao_criada',
  NOTIFICACAO_RECEBIDA: 'ubs:notificacao_recebida'
};

// Configurações default da aplicação
export const CONFIG_PADRAO = {
  theme: 'light',
  language: 'pt-BR',
  notifications: true,
  autoSave: true,
  timeoutSession: 30 // minutos
};

// Tipos de erros conhecidos
export const TIPOS_ERRO = {
  REDE: 'erro_rede',
  SERVIDOR: 'erro_servidor',
  AUTENTICACAO: 'erro_autenticacao',
  AUTORIZACAO: 'erro_autorizacao',
  VALIDACAO: 'erro_validacao',
  NAO_ENCONTRADO: 'erro_nao_encontrado',
  DESCONHECIDO: 'erro_desconhecido'
};

// Códigos HTTP comuns
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Unidades de saúde ficticias para exemplo
export const UNIDADES_SAUDE = [
  { id: 1, nome: 'UBS Central', cnes: '1234567', endereco: 'Rua Principal, 123' },
  { id: 2, nome: 'UBS Norte', cnes: '2345678', endereco: 'Av. Norte, 456' },
  { id: 3, nome: 'UBS Sul', cnes: '3456789', endereco: 'Av. Sul, 789' },
  { id: 4, nome: 'UBS Leste', cnes: '4567890', endereco: 'Rua Leste, 101' },
  { id: 5, nome: 'UBS Oeste', cnes: '5678901', endereco: 'Rua Oeste, 202' }
];

// Especialidades médicas
export const ESPECIALIDADES = [
  'Clínica Geral',
  'Pediatria',
  'Ginecologia',
  'Obstetrícia',
  'Cardiologia',
  'Dermatologia',
  'Neurologia',
  'Ortopedia',
  'Psiquiatria',
  'Oftalmologia',
  'Otorrinolaringologia',
  'Urologia',
  'Endocrinologia',
  'Gastroenterologia',
  'Geriatria',
  'Hematologia',
  'Infectologia',
  'Nefrologia',
  'Pneumologia',
  'Reumatologia'
];

// Examês comuns
export const EXAMES = [
  'Hemograma Completo',
  'Glicemia em Jejum',
  'Colesterol Total e Frações',
  'Triglicerídeos',
  'Ácido Úrico',
  'Ureia',
  'Creatinina',
  'TGO/TGP',
  'TSH',
  'T4 Livre',
  'Eletrocardiograma',
  'Raio-X de Tórax',
  'Ultrassonografia Abdominal',
  'Ultrassonografia Pélvica',
  'Ultrassonografia Transvaginal',
  'Mamografia',
  'Densitometria Óssea',
  'Exame de Urina',
  'Parasitológico de Fezes',
  'Teste de Esforço'
]; 