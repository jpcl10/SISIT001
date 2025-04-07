/**
 * Mapeador de Solicitações
 * 
 * Responsável por converter objetos de solicitação entre diferentes formatos
 * como objetos de API (DTO) e objetos de modelo (domínio).
 */

/**
 * Converte um objeto de resposta da API para o modelo de domínio
 * @param {Object} apiResponse - Resposta da API com dados da solicitação
 * @returns {Object} - Modelo de domínio
 */
const toModel = (apiResponse) => {
  if (!apiResponse) return null;
  
  // Extrair dados básicos
  const {
    id,
    paciente,
    tipo,
    especialidade,
    prioridade,
    status,
    dataCriacao,
    dataAtualizacao,
    unidadeOrigem,
    unidadeDestino,
    profissionalSolicitante,
    justificativa,
    anexos,
    observacoes,
    historico
  } = apiResponse;
  
  // Mapear para o formato do modelo
  return {
    id,
    tipoSolicitacao: tipo,
    dadosPaciente: {
      nomePaciente: paciente.nome,
      cpf: paciente.cpf,
      dataNascimento: paciente.dataNascimento,
      cartaoSUS: paciente.cartaoSUS,
      telefone: paciente.telefone,
      endereco: paciente.endereco,
      nomeUnidade: unidadeOrigem
    },
    dadosEspecificos: {
      especialidade,
      // Dados adicionais dependendo do tipo
      ...extrairDadosEspecificos(apiResponse)
    },
    _status: status,
    _prioridade: prioridade,
    _dataCriacao: dataCriacao,
    _dataAtualizacao: dataAtualizacao,
    _unidadeDestino: unidadeDestino,
    _profissionalSolicitante: profissionalSolicitante,
    justificativa,
    observacoes,
    _anexos: anexos || [],
    _historico: historico || []
  };
};

/**
 * Extrai dados específicos baseados no tipo de solicitação
 * @param {Object} apiResponse - Resposta da API com dados da solicitação
 * @returns {Object} - Objeto com dados específicos
 * @private
 */
const extrairDadosEspecificos = (apiResponse) => {
  const { tipo, dadosAdicionais = {} } = apiResponse;
  
  switch (tipo) {
    case 'exame':
      return {
        tipoExame: dadosAdicionais.tipoExame,
        requisitos: dadosAdicionais.requisitos,
        resultadosAnteriores: dadosAdicionais.resultadosAnteriores
      };
      
    case 'consulta':
      return {
        especialidade: dadosAdicionais.especialidade,
        motivoConsulta: dadosAdicionais.motivoConsulta,
        consultasAnteriores: dadosAdicionais.consultasAnteriores
      };
      
    case 'cirurgia':
      return {
        procedimento: dadosAdicionais.procedimento,
        urgencia: dadosAdicionais.urgencia,
        examesPreOperatorios: dadosAdicionais.examesPreOperatorios
      };
      
    default:
      return {};
  }
};

/**
 * Converte um modelo de domínio para o formato da API
 * @param {Object} model - Modelo de domínio da solicitação
 * @returns {Object} - Objeto no formato da API
 */
const toApiRequest = (model) => {
  if (!model) return null;
  
  const {
    tipoSolicitacao,
    dadosPaciente,
    dadosEspecificos,
    _status,
    _prioridade,
    justificativa,
    observacoes
  } = model;
  
  // Extrair dados do paciente
  const {
    nomePaciente,
    cpf,
    dataNascimento,
    cartaoSUS,
    telefone,
    endereco,
    nomeUnidade
  } = dadosPaciente || {};
  
  // Construir objeto para a API
  return {
    paciente: {
      nome: nomePaciente,
      cpf,
      dataNascimento,
      cartaoSUS,
      telefone,
      endereco
    },
    tipo: tipoSolicitacao,
    especialidade: dadosEspecificos?.especialidade,
    prioridade: _prioridade,
    status: _status,
    unidadeOrigem: nomeUnidade,
    justificativa,
    observacoes,
    dadosAdicionais: {
      ...removerCamposComuns(dadosEspecificos)
    }
  };
};

/**
 * Remove campos comuns de um objeto de dados específicos
 * @param {Object} dadosEspecificos - Dados específicos com possíveis campos comuns
 * @returns {Object} - Objeto sem campos comuns
 * @private
 */
const removerCamposComuns = (dadosEspecificos) => {
  if (!dadosEspecificos) return {};
  
  // Criar cópia para não modificar o original
  const dados = { ...dadosEspecificos };
  
  // Remover campos que já estão mapeados separadamente
  delete dados.especialidade;
  
  return dados;
};

/**
 * Cria um objeto de registro para o histórico
 * @param {string} mensagem - Mensagem descritiva
 * @param {Object} usuario - Usuário que realizou a ação
 * @param {Object} detalhes - Detalhes adicionais
 * @returns {Object} - Objeto formatado para histórico
 */
const criarRegistroHistorico = (mensagem, usuario, detalhes = {}) => {
  return {
    data: new Date().toISOString(),
    mensagem,
    usuario: usuario ? {
      id: usuario.id,
      nome: usuario.nome,
      perfil: usuario.perfil
    } : undefined,
    detalhes
  };
};

// Exporta as funções do mapeador
module.exports = {
  toModel,
  toApiRequest,
  criarRegistroHistorico
}; 