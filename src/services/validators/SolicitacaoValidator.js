/**
 * Validador de Solicitações
 * 
 * Responsável por centralizar todas as validações relacionadas a solicitações,
 * garantindo integridade dos dados e consistência das regras de negócio.
 */

// Formatos e validadores de dados básicos
const REGEX_CPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const REGEX_CARTAO_SUS = /^\d{15}$/;
const REGEX_TELEFONE = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

/**
 * Valida um CPF
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} - Resultado da validação
 */
const validarCPF = (cpf) => {
  if (!cpf) return false;
  // Remove pontos e traços para o cálculo
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  // CPF deve ter 11 dígitos
  if (cpfLimpo.length !== 11) return false;
  
  // Verificar se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
  
  // Cálculo do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let dv1 = (resto === 10 || resto === 11) ? 0 : resto;
  
  // Cálculo do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let dv2 = (resto === 10 || resto === 11) ? 0 : resto;
  
  // Verificar se os dígitos calculados são iguais aos informados
  return (parseInt(cpfLimpo.charAt(9)) === dv1 && 
          parseInt(cpfLimpo.charAt(10)) === dv2);
};

/**
 * Valida uma data de nascimento
 * @param {string} data - Data de nascimento a ser validada
 * @returns {boolean} - Resultado da validação
 */
const validarDataNascimento = (data) => {
  if (!data) return false;
  
  // Converter para objeto Date
  const dataNascimento = new Date(data);
  const hoje = new Date();
  
  // Data inválida
  if (isNaN(dataNascimento.getTime())) return false;
  
  // Data de nascimento não pode ser no futuro
  if (dataNascimento > hoje) return false;
  
  // Idade máxima razoável (120 anos)
  const idadeMaxima = 120;
  const dataMinima = new Date();
  dataMinima.setFullYear(hoje.getFullYear() - idadeMaxima);
  
  if (dataNascimento < dataMinima) return false;
  
  return true;
};

/**
 * Validação principal de solicitação
 * @param {Object} solicitacao - Solicitação a ser validada
 * @returns {Object} - Resultado da validação {valido: boolean, erros: string[]}
 */
const validarSolicitacao = (solicitacao) => {
  const resultado = {
    valido: true,
    erros: []
  };
  
  // Validar existência da solicitação
  if (!solicitacao) {
    resultado.valido = false;
    resultado.erros.push('Solicitação não fornecida');
    return resultado;
  }
  
  // Validar dados do paciente
  if (!solicitacao.dadosPaciente) {
    resultado.valido = false;
    resultado.erros.push('Dados do paciente não fornecidos');
  } else {
    const paciente = solicitacao.dadosPaciente;
    
    // Validar nome do paciente
    if (!paciente.nomePaciente || paciente.nomePaciente.trim().length < 3) {
      resultado.valido = false;
      resultado.erros.push('Nome do paciente inválido');
    }
    
    // Validar CPF
    if (!paciente.cpf || !REGEX_CPF.test(paciente.cpf) || !validarCPF(paciente.cpf)) {
      resultado.valido = false;
      resultado.erros.push('CPF inválido');
    }
    
    // Validar data de nascimento
    if (!paciente.dataNascimento || !validarDataNascimento(paciente.dataNascimento)) {
      resultado.valido = false;
      resultado.erros.push('Data de nascimento inválida');
    }
    
    // Validar cartão SUS (quando fornecido)
    if (paciente.cartaoSUS && !REGEX_CARTAO_SUS.test(paciente.cartaoSUS)) {
      resultado.valido = false;
      resultado.erros.push('Cartão SUS inválido');
    }
    
    // Validar telefone (quando fornecido)
    if (paciente.telefone && !REGEX_TELEFONE.test(paciente.telefone)) {
      resultado.valido = false;
      resultado.erros.push('Telefone inválido');
    }
  }
  
  // Validar tipo de solicitação
  if (!solicitacao.tipoSolicitacao) {
    resultado.valido = false;
    resultado.erros.push('Tipo de solicitação não fornecido');
  }
  
  // Validar dados específicos
  if (!solicitacao.dadosEspecificos) {
    resultado.valido = false;
    resultado.erros.push('Dados específicos da solicitação não fornecidos');
  } else {
    // Validações específicas por tipo de solicitação
    switch (solicitacao.tipoSolicitacao) {
      case 'exame':
        if (!solicitacao.dadosEspecificos.tipoExame) {
          resultado.valido = false;
          resultado.erros.push('Tipo de exame não especificado');
        }
        break;
        
      case 'consulta':
        if (!solicitacao.dadosEspecificos.especialidade) {
          resultado.valido = false;
          resultado.erros.push('Especialidade não especificada');
        }
        break;
        
      case 'cirurgia':
        if (!solicitacao.dadosEspecificos.procedimento) {
          resultado.valido = false;
          resultado.erros.push('Procedimento cirúrgico não especificado');
        }
        if (!solicitacao.dadosEspecificos.justificativa || solicitacao.dadosEspecificos.justificativa.length < 20) {
          resultado.valido = false;
          resultado.erros.push('Justificativa do procedimento insuficiente');
        }
        break;
    }
  }
  
  // Validações adicionais para solicitações não rascunho
  if (solicitacao._status && solicitacao._status !== 'rascunho') {
    // Exigir justificativa para solicitações enviadas
    if (!solicitacao.justificativa || solicitacao.justificativa.trim().length < 10) {
      resultado.valido = false;
      resultado.erros.push('Justificativa não fornecida ou muito curta');
    }
  }
  
  return resultado;
};

// Exportações
module.exports = {
  validarSolicitacao,
  validarCPF,
  validarDataNascimento,
  REGEX_CPF,
  REGEX_CARTAO_SUS,
  REGEX_TELEFONE
}; 