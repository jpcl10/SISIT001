/**
 * Sistema de Regulação UBS - Configurações
 * Centraliza todas as configurações do sistema
 */

const config = {
  // Configurações gerais
  app: {
    nome: 'Sistema de Regulação UBS',
    versao: '1.0.0',
    env: 'development', // 'development', 'test', 'production'
  },

  // Configurações de API
  api: {
    baseUrl: '',
    mockMode: true, // Usar dados simulados em vez de APIs reais
    timeout: 10000,
    endpoints: {
      status: '/api/status',
      solicitacoes: '/api/solicitacoes',
      cotas: '/api/cotas',
      usuarios: '/api/usuarios',
      notificacoes: '/api/notificacoes',
      auth: '/api/auth'
    }
  },

  // Portas para os diferentes serviços
  portas: {
    centralRegulacao: '/sistema-central-regulacao.html',
    ubs: '/sistema-ubs.html',
    login: '/login-central-regulacao.html'
  },

  // Configurações de armazenamento
  storage: {
    prefixo: 'ubs_',
    keys: {
      dadosEtapa1: 'dados_etapa1',
      solicitacoes: 'solicitacoes',
      usuario: 'usuario',
      token: 'token',
      configuracoes: 'configuracoes'
    }
  },

  // Mensagens padrão
  mensagens: {
    erroCarregamento: 'Erro ao carregar dados. Tente novamente mais tarde.',
    sucessoEnvio: 'Solicitação enviada com sucesso!',
    camposObrigatorios: 'Por favor, preencha todos os campos obrigatórios.',
    errorPermissao: 'Você não tem permissão para acessar este recurso.',
    falhaConexao: 'Falha na conexão. Verifique sua internet.'
  }
};

export default config; 