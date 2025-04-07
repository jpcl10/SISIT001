/**
 * SISTEMA UBS - Módulo de Validações
 * Funções para validação de dados em formulários
 */

/**
 * Valida se um CPF é válido (incluindo dígito verificador)
 * @param {string} cpf - CPF a ser validado (com ou sem formatação)
 * @returns {boolean} - Indica se o CPF é válido
 */
function validarCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica tamanho
  if (cpf.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  
  let resto = soma % 11;
  let digitoVerificador1 = resto < 2 ? 0 : 11 - resto;
  
  if (digitoVerificador1 !== parseInt(cpf.charAt(9))) {
    return false;
  }
  
  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  
  resto = soma % 11;
  let digitoVerificador2 = resto < 2 ? 0 : 11 - resto;
  
  return digitoVerificador2 === parseInt(cpf.charAt(10));
}

/**
 * Valida se um CNS (Cartão Nacional de Saúde) é válido
 * @param {string} cns - CNS a ser validado (15 dígitos)
 * @returns {boolean} - Indica se o CNS é válido
 */
function validarCNS(cns) {
  // Remove caracteres não numéricos
  cns = cns.replace(/[^\d]/g, '');
  
  // Verifica tamanho
  if (cns.length !== 15) {
    return false;
  }
  
  // Verificação básica - implementar algoritmo completo futuramente
  // Definição CNS: http://cartaonet.datasus.gov.br/
  const digitoInicial = parseInt(cns.charAt(0));
  
  // CNS Provisório (começa com 7, 8 ou 9)
  if (digitoInicial >= 7 && digitoInicial <= 9) {
    return validarCNSProvisorio(cns);
  }
  
  // CNS Definitivo (começa com 1, 2)
  if (digitoInicial === 1 || digitoInicial === 2) {
    return validarCNSDefinitivo(cns);
  }
  
  return false;
}

/**
 * Validação simplificada de CNS Provisório
 * @param {string} cns - CNS a ser validado
 * @returns {boolean} - Indica se o CNS é válido
 */
function validarCNSProvisorio(cns) {
  // Simplificando - validação completa requer algoritmo específico
  return cns.length === 15 && /^[789]\d{14}$/.test(cns);
}

/**
 * Validação simplificada de CNS Definitivo
 * @param {string} cns - CNS a ser validado
 * @returns {boolean} - Indica se o CNS é válido
 */
function validarCNSDefinitivo(cns) {
  // Soma ponderada
  let soma = 0;
  for (let i = 0; i < 15; i++) {
    soma += parseInt(cns.charAt(i)) * (15 - i);
  }
  
  return soma % 11 === 0;
}

/**
 * Valida um código CNES (Cadastro Nacional de Estabelecimentos de Saúde)
 * @param {string} cnes - CNES a ser validado
 * @returns {boolean} - Indica se o CNES é válido
 */
function validarCNES(cnes) {
  // Remove caracteres não numéricos
  cnes = cnes.replace(/[^\d]/g, '');
  
  // Verificação básica de tamanho (7 dígitos)
  return cnes.length === 7;
}

/**
 * Valida campos obrigatórios em um formulário
 * @param {HTMLFormElement} formulario - O formulário a ser validado
 * @returns {boolean} - Indica se todos os campos obrigatórios estão preenchidos
 */
function validarCamposObrigatorios(formulario) {
  const camposObrigatorios = formulario.querySelectorAll('[required]');
  let valido = true;
  
  camposObrigatorios.forEach(campo => {
    // Remove mensagens de erro anteriores
    limparErro(campo);
    
    if (!campo.value.trim()) {
      destacarCampoInvalido(campo, 'Campo obrigatório');
      valido = false;
    }
  });
  
  return valido;
}

/**
 * Destaca um campo como inválido
 * @param {HTMLElement} campo - O campo que está inválido
 * @param {string} mensagem - A mensagem de erro
 */
function destacarCampoInvalido(campo, mensagem) {
  campo.classList.add('campo-invalido');
  
  // Verificar se já existe mensagem de erro
  let msgErro = campo.nextElementSibling;
  if (!msgErro || !msgErro.classList.contains('erro-mensagem')) {
    msgErro = document.createElement('span');
    msgErro.classList.add('erro-mensagem');
    campo.parentNode.insertBefore(msgErro, campo.nextSibling);
  }
  
  msgErro.textContent = mensagem;
  msgErro.style.display = 'block';
}

/**
 * Remove a formatação de erro de um campo
 * @param {HTMLElement} campo - O campo a ser limpo
 */
function limparErro(campo) {
  campo.classList.remove('campo-invalido');
  
  // Remover mensagem de erro
  const msgErro = campo.nextElementSibling;
  if (msgErro && msgErro.classList.contains('erro-mensagem')) {
    msgErro.textContent = '';
    msgErro.style.display = 'none';
  }
}

/**
 * Valida um formulário completo
 * @param {HTMLFormElement} formulario - O formulário a ser validado
 * @returns {Object} - Objeto com status e mensagens de erro
 */
function validarFormulario(formulario) {
  // Valida campos obrigatórios
  const camposObrigatoriosValidos = validarCamposObrigatorios(formulario);
  
  // Validações específicas
  const validacoesEspecificas = [];
  
  // Validar CPF se existir
  const campoCPF = formulario.querySelector('input[name="cpf"]');
  if (campoCPF && campoCPF.value) {
    const cpfValido = validarCPF(campoCPF.value);
    if (!cpfValido) {
      destacarCampoInvalido(campoCPF, 'CPF inválido');
      validacoesEspecificas.push(false);
    }
  }
  
  // Validar CNS se existir
  const campoCNS = formulario.querySelector('input[name="cns"]');
  if (campoCNS && campoCNS.value) {
    const cnsValido = validarCNS(campoCNS.value);
    if (!cnsValido) {
      destacarCampoInvalido(campoCNS, 'CNS inválido');
      validacoesEspecificas.push(false);
    }
  }
  
  // Validação geral
  const valido = camposObrigatoriosValidos && validacoesEspecificas.every(v => v !== false);
  
  return {
    valido,
    mensagem: valido ? 'Formulário válido' : 'Verifique os campos destacados'
  };
}

export {
  validarCPF,
  validarCNS,
  validarCNES,
  validarCamposObrigatorios,
  destacarCampoInvalido,
  limparErro,
  validarFormulario
}; 