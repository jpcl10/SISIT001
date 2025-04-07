/**
 * Sistema Integrado de Regulação UBS - Configuração Principal
 * 
 * Arquivo centralizado de configuração para o sistema integrado,
 * combinando parâmetros da UBS Local e da Central de Regulação
 */

const configSistema = {
  // Informações do sistema
  sistema: {
    nome: "Sistema Integrado de Regulação UBS",
    versao: "1.0.0",
    ambiente: "desenvolvimento", // "desenvolvimento", "homologacao", "producao"
    dataAtualizacao: "2023-04-07"
  },
  
  // Configurações para modos de operação
  modos: {
    mockDados: true,         // Usar dados simulados em vez de API real
    debugAtivo: true,        // Ativar mensagens de debug no console
    verificarPermissoes: true, // Verificar permissões antes de exibir elementos
    modoManutencao: false    // Modo de manutenção (acesso apenas para admin)
  },
  
  // Caminhos para recursos
  caminhos: {
    // Caminhos dos módulos
    ubs: {
      painel: "paginas/ubs/ubs-painel.html",
      formularios: "modulos/ubs/formularios/",
      scripts: "modulos/ubs/scripts/"
    },
    
    central: {
      painel: "paginas/central/central-painel.html",
      scripts: "modulos/central/scripts/"
    },
    
    // Caminhos compartilhados
    compartilhados: {
      login: "paginas/comuns/login.html",
      home: "paginas/comuns/home.html",
      templates: "compartilhado/templates/",
      componentes: "compartilhado/componentes/"
    },
    
    // Caminhos de estilos
    estilos: {
      global: "estilos/comum/estilos-globais.css",
      ubs: "estilos/ubs/ubs-estilo.css",
      central: "estilos/central/central-estilo.css"
    },
    
    // Caminhos de recursos
    assets: {
      imagens: "assets/imagens/",
      icones: "assets/icones/",
      favicon: "assets/favicon.ico"
    }
  },
  
  // Configurações de armazenamento
  armazenamento: {
    prefixo: "ubs_integrado_",
    chaves: {
      usuario: "usuario",
      token: "token",
      solicitacoes: "solicitacoes",
      configuracoes: "configuracoes",
      dadosPaciente: "dados_paciente"
    },
    limparAoSair: false     // Limpar dados ao fazer logout
  },
  
  // Configurações de API
  api: {
    baseUrl: "http://localhost:5555",  // URL base para as chamadas da API (atualizado para 5555)
    timeout: 30000,                   // Timeout em milissegundos
    tentativasReconexao: 3,           // Número de tentativas em caso de falha
    endpoints: {
      autenticacao: "/api/auth",
      solicitacoes: "/api/solicitacoes",
      cotas: "/api/cotas",
      usuarios: "/api/usuarios",
      notificacoes: "/api/notificacoes",
      status: "/api/status"
    },
    // Portas específicas para cada serviço
    portas: {
      ubs: 5555,              // Porta para serviços específicos da UBS (atualizado para 5555)
      central: 5555,          // Porta para serviços específicos da Central (atualizado para 5555)
      auth: 5555,             // Porta para autenticação (atualizado para 5555)
      comum: 5555             // Porta principal para serviços compartilhados (atualizado para 5555)
    },
    // URLs completas para cada serviço
    urlServicos: {
      ubs: "http://localhost:5555",      // Atualizado para 5555
      central: "http://localhost:5555",  // Atualizado para 5555
      auth: "http://localhost:5555",     // Atualizado para 5555
      comum: "http://localhost:5555"     // Atualizado para 5555
    },
    // Configuração para proxy reverso (caso esteja sendo usado)
    proxyPath: "/api",
    usarProxy: false,         // Indica se deve usar o caminho de proxy
    headers: {
      "Content-Type": "application/json",
      "X-Sistema-Origem": "UBS-INTEGRADO"
    }
  },
  
  // Autenticação
  autenticacao: {
    duracaoToken: 8 * 60 * 60 * 1000, // 8 horas em milissegundos
    renovarAutomaticamente: true,     // Renovar token automaticamente
    redirecionarAposLogin: true,      // Redirecionar após login bem-sucedido
    paginaAposLogin: "index.html",    // Página após login
    paginaLogin: "login.html",        // Página de login
    loginEndpoint: "/api/auth/login",   // Endpoint específico para login
    refreshEndpoint: "/api/auth/refresh" // Endpoint para renovação de token
  },
  
  // Mensagens padrão
  mensagens: {
    erroServidor: "Erro de comunicação com o servidor. Tente novamente mais tarde.",
    erroAutenticacao: "Usuário ou senha inválidos. Tente novamente.",
    erroPermissao: "Você não tem permissão para acessar este recurso.",
    sucessoLogin: "Login realizado com sucesso!",
    sucessoEnvio: "Solicitação enviada com sucesso!",
    erroValidacao: "Por favor, verifique os campos destacados e tente novamente."
  },
  
  // Perfis de usuário
  perfis: {
    ubs: {
      nome: "UBS",
      permissoes: [
        "criar_solicitacao", 
        "editar_solicitacao", 
        "visualizar_cotas", 
        "cancelar_solicitacao"
      ]
    },
    regulador: {
      nome: "Regulador",
      permissoes: [
        "visualizar_solicitacao", 
        "aprovar_solicitacao", 
        "negar_solicitacao", 
        "devolver_solicitacao", 
        "priorizar_solicitacao"
      ]
    },
    admin: {
      nome: "Administrador",
      permissoes: [
        "gerenciar_usuarios", 
        "configurar_sistema", 
        "visualizar_logs",
        "gerenciar_cotas"
      ]
    }
  },
  
  // Unidades disponíveis
  unidades: [
    { id: "ubs1", nome: "UBS Central", codigo: "1001", tipo: "ubs" },
    { id: "ubs2", nome: "UBS Norte", codigo: "1002", tipo: "ubs" },
    { id: "ubs3", nome: "UBS Sul", codigo: "1003", tipo: "ubs" },
    { id: "ubs4", nome: "UBS Leste", codigo: "1004", tipo: "ubs" },
    { id: "ubs5", nome: "UBS Oeste", codigo: "1005", tipo: "ubs" },
    { id: "cr1", nome: "Central de Regulação Municipal", codigo: "2001", tipo: "central" }
  ],
  
  // Tipos de procedimento
  procedimentos: [
    { id: "ressonancia", nome: "Ressonância/Tomografia", categoria: "exame" },
    { id: "mamografia", nome: "Mamografia", categoria: "exame" },
    { id: "lme", nome: "Medicamento Especial (LME)", categoria: "medicamento" },
    { id: "aih", nome: "Internação (AIH)", categoria: "internacao" },
    { id: "ambulatorial", nome: "Procedimento Ambulatorial", categoria: "procedimento" },
    { id: "especialidades", nome: "Consulta de Especialidade", categoria: "consulta" }
  ]
};

module.exports = configSistema; 