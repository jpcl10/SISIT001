/**
 * Sistema Integrado de Regulação UBS - Serviço de API
 * 
 * IMPORTANTE: Este arquivo foi mantido para compatibilidade com código existente.
 * Para novos desenvolvimentos, utilize o serviço em src/services/ApiService.js
 */

// NOTE: Evitando dependência circular entre ApiService e este arquivo
const ApiService = require('../services/ApiService');

// Reexportar o serviço de API
module.exports = ApiService; 