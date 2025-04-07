/**
 * Sistema Integrado de Regulação UBS - Rotas da API
 * 
 * Define todas as rotas da API utilizadas no sistema
 */

const express = require('express');
const config = require('../utils/config');
const solicitacaoService = require('../services/SolicitacaoService');
const authService = require('../services/AuthService');
const router = express.Router();

// Middleware de log para todas as rotas de API
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware de autenticação
const autenticar = (req, res, next) => {
  // Rotas públicas que não necessitam de autenticação
  const rotasPublicas = ['/auth/login', '/status'];
  
  if (rotasPublicas.some(rota => req.path.startsWith(rota))) {
    return next();
  }
  
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token de autenticação não fornecido'
    });
  }
  
  const resultado = authService.validarToken(token);
  
  if (!resultado.valido) {
    return res.status(401).json({
      sucesso: false,
      mensagem: resultado.mensagem
    });
  }
  
  // Adiciona o usuário ao objeto de requisição para uso nas rotas
  req.usuario = resultado.usuario;
  next();
};

// Aplicar middleware de autenticação a todas as rotas
router.use(autenticar);

// ===== ROTAS DE AUTENTICAÇÃO =====

// Rota de login
router.post('/auth/login', (req, res) => {
  const { usuario, senha } = req.body;
  
  if (!usuario || !senha) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Usuário e senha são obrigatórios'
    });
  }
  
  const resultado = authService.login(usuario, senha);
  
  if (!resultado.sucesso) {
    return res.status(401).json(resultado);
  }
  
  res.json({
    ...resultado,
    versao: config.app.versao
  });
});

// Rota de logout
router.post('/auth/logout', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Token não fornecido'
    });
  }
  
  const resultado = authService.logout(token);
  res.json(resultado);
});

// Rota de status do sistema
router.get('/status', (req, res) => {
  res.json({
    online: true,
    versao: config.app.versao,
    timestamp: new Date().toISOString(),
    ambiente: config.app.ambiente,
    servicos: {
      comum: { status: "ok", latencia: 12 },
      ubs: { status: "ok", latencia: 15 },
      central: { status: "ok", latencia: 14 },
      auth: { status: "ok", latencia: 10 }
    }
  });
});

// ===== ROTAS DE SOLICITAÇÕES =====

// Listar todas as solicitações (com filtros opcionais)
router.get('/solicitacoes', (req, res) => {
  const filtros = req.query;
  const solicitacoes = solicitacaoService.buscarTodas(filtros);
  res.json({ sucesso: true, solicitacoes });
});

// Obter uma solicitação por ID
router.get('/solicitacoes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const solicitacao = solicitacaoService.buscarPorId(id);
  
  if (!solicitacao) {
    return res.status(404).json({
      sucesso: false,
      mensagem: 'Solicitação não encontrada'
    });
  }
  
  res.json({ sucesso: true, solicitacao });
});

// Criar nova solicitação
router.post('/solicitacoes', (req, res) => {
  // Verificar permissão
  if (!authService.verificarPermissao(req.usuario, 'criar_solicitacao')) {
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Você não tem permissão para criar solicitações'
    });
  }
  
  const resultado = solicitacaoService.adicionar({
    ...req.body,
    profissionalSolicitante: req.body.profissionalSolicitante || req.usuario.nome,
    unidadeOrigem: req.body.unidadeOrigem || req.usuario.unidade
  });
  
  if (!resultado.sucesso) {
    return res.status(400).json(resultado);
  }
  
  res.status(201).json(resultado);
});

// Atualizar solicitação existente
router.put('/solicitacoes/:id', (req, res) => {
  // Verificar permissão
  if (!authService.verificarPermissao(req.usuario, 'editar_solicitacao')) {
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Você não tem permissão para editar solicitações'
    });
  }
  
  const id = parseInt(req.params.id);
  const usuario = req.usuario.nome;
  
  const resultado = solicitacaoService.atualizar(id, req.body, usuario);
  
  if (!resultado.sucesso) {
    return res.status(404).json(resultado);
  }
  
  res.json(resultado);
});

// Atualizar status de uma solicitação
router.patch('/solicitacoes/:id/status', (req, res) => {
  // Verificar permissão
  if (!authService.verificarPermissao(req.usuario, 'atualizar_status')) {
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Você não tem permissão para atualizar o status de solicitações'
    });
  }
  
  const id = parseInt(req.params.id);
  const { novoStatus, observacao } = req.body;
  
  if (!novoStatus) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Novo status é obrigatório'
    });
  }
  
  const resultado = solicitacaoService.atualizarStatus(
    id, 
    novoStatus, 
    req.usuario.nome, 
    observacao
  );
  
  if (!resultado.sucesso) {
    return res.status(404).json(resultado);
  }
  
  res.json(resultado);
});

// Remover solicitação
router.delete('/solicitacoes/:id', (req, res) => {
  // Apenas admins podem excluir
  if (req.usuario.perfil !== 'admin') {
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Apenas administradores podem excluir solicitações'
    });
  }
  
  const id = parseInt(req.params.id);
  const resultado = solicitacaoService.remover(id);
  
  if (!resultado.sucesso) {
    return res.status(404).json(resultado);
  }
  
  res.json(resultado);
});

// ===== ROTAS ESPECÍFICAS POR PERFIL =====

// Rota para solicitações da UBS
router.get('/ubs/solicitacoes', (req, res) => {
  // Filtra apenas solicitações da unidade específica
  const filtros = { 
    unidadeOrigem: req.usuario.unidade,
    ...req.query
  };
  
  const solicitacoes = solicitacaoService.buscarTodas(filtros);
  res.json({ sucesso: true, solicitacoes });
});

// Rota para solicitações da Central de Regulação
router.get('/central/solicitacoes', (req, res) => {
  // Verificar se é um usuário da central
  if (req.usuario.perfil !== 'regulador' && req.usuario.perfil !== 'admin') {
    return res.status(403).json({
      sucesso: false,
      mensagem: 'Você não tem permissão para acessar as solicitações da central'
    });
  }
  
  // Sem filtro de unidade, a central vê todas
  const solicitacoes = solicitacaoService.buscarTodas(req.query);
  res.json({ sucesso: true, solicitacoes });
});

module.exports = router; 