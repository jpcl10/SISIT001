/**
 * Sistema Integrado de Regulação UBS - Configurações
 * 
 * Arquivo centralizado de configurações do sistema
 */

const config = {
  // Configurações do servidor
  servidor: {
    porta: 5555,
    host: 'localhost'
  },
  
  // Configurações da aplicação
  app: {
    nome: 'Sistema Integrado de Regulação UBS',
    versao: '1.0.0',
    desenvolvedor: 'Equipe de Desenvolvimento',
    ambiente: process.env.NODE_ENV || 'development'
  },
  
  // Configurações de autenticação
  auth: {
    expiracaoToken: '24h',
    chaveSecreta: process.env.JWT_SECRET || 'chave-secreta-desenvolvimento'
  },
  
  // Configurações de banco de dados (mock)
  database: {
    host: 'localhost',
    porta: 5432,
    nome: 'db_regulacao',
    usuario: 'usuario_app',
    senha: process.env.DB_PASSWORD || 'senha_dev'
  },
  
  // Configurações de API
  api: {
    prefixo: '/api',
    versao: 'v1',
    timeout: 30000
  }
};

module.exports = config; 