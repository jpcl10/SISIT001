/**
 * Serviço de Mock para API
 * Fornece respostas simuladas para endpoints da API em modo de desenvolvimento
 */

/**
 * Retorna um status mock da API
 * @returns {Object} Status simulado
 */
export function getStatusMock() {
  return { 
    online: true, 
    versao: '1.0.0', 
    ambiente: 'development' 
  };
}

/**
 * Processa requisições mock baseadas no endpoint
 * @param {string} endpoint - Endpoint simulado
 * @param {Object} options - Opções da requisição
 * @returns {Promise<Object>} Resposta simulada
 */
export function handleMockRequest(endpoint, options = {}) {
  console.log(`[MOCK] Requisição para ${endpoint}`, options);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simular diferentes endpoints
      if (endpoint.includes('/solicitacoes')) {
        resolve(getMockSolicitacoes());
      } else if (endpoint.includes('/usuarios')) {
        resolve(getMockUsuarios());
      } else if (endpoint.includes('/notificacoes')) {
        resolve(getMockNotificacoes());
      } else {
        resolve({ success: true, message: 'Operação simulada com sucesso' });
      }
    }, 300);
  });
}

/**
 * Retorna dados simulados de solicitações
 * @returns {Object} Dados mock de solicitações
 */
function getMockSolicitacoes() {
  return { 
    success: true, 
    data: [
      { id: 1, paciente: 'João Silva', especialidade: 'Cardiologia', status: 'PENDENTE' },
      { id: 2, paciente: 'Maria Oliveira', especialidade: 'Neurologia', status: 'AGENDADA' },
      { id: 3, paciente: 'Ana Santos', especialidade: 'Oftalmologia', status: 'CONCLUIDA' },
      { id: 4, paciente: 'Carlos Pereira', especialidade: 'Ortopedia', status: 'PENDENTE' }
    ]
  };
}

/**
 * Retorna dados simulados de usuários
 * @returns {Object} Dados mock de usuários
 */
function getMockUsuarios() {
  return { 
    success: true, 
    data: { id: 1, nome: 'Usuário Teste', perfil: 'REGULADOR' }
  };
}

/**
 * Retorna dados simulados de notificações
 * @returns {Object} Dados mock de notificações
 */
function getMockNotificacoes() {
  return {
    success: true,
    data: [
      { id: 1, titulo: 'Nova solicitação', mensagem: 'Uma nova solicitação foi recebida', data: '2023-08-15', lida: false },
      { id: 2, titulo: 'Atualização de status', mensagem: 'A solicitação #2 foi aprovada', data: '2023-08-14', lida: true }
    ]
  };
}

export default {
  getStatusMock,
  handleMockRequest
}; 