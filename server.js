/**
 * Sistema Integrado de Regulação UBS - Servidor
 * 
 * Servidor Express simplificado para servir os arquivos estáticos na porta 5555
 */

const express = require('express');
const path = require('path');
const app = express();

console.log('Iniciando servidor...');

// Middleware para debug de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Configuração do MIME type para arquivos CSS e JS
app.use((req, res, next) => {
  if (req.path.endsWith('.css')) {
    res.type('text/css');
  } else if (req.path.endsWith('.js')) {
    res.type('application/javascript');
  }
  next();
});

// Servir arquivos estáticos da pasta atual
app.use(express.static(__dirname));

// Middleware para processar JSON
app.use(express.json());

// Rota de diagnóstico
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    serverAddress: req.headers.host
  });
});

// Iniciar o servidor em todas as interfaces
try {
  const PORT = 5555;
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse em: http://localhost:${PORT}`);
    console.log(`Acesse página de login: http://localhost:${PORT}/login-central-regulacao.html`);
    console.log('='.repeat(50));
  });
  
  // Tratar erros de servidor
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`\n\nERRO: Porta ${PORT} já está em uso!`);
      console.error('Tente fechar todos os processos Node.js e iniciar novamente.');
      console.error('Execute: pkill -f node && node server.js\n\n');
    } else {
      console.error('Erro no servidor:', e);
    }
  });
} catch (e) {
  console.error('Erro ao iniciar o servidor:', e);
} 