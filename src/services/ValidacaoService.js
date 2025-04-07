/**
 * Sistema UBS - Serviço de Validação
 * 
 * Responsável por validações gerais de dados
 */

/**
 * Classe que fornece métodos de validação para formulários e dados
 */
class ValidacaoService {
  /**
   * Valida se um valor não está vazio
   * @param {*} valor - Valor a ser validado
   * @param {string} mensagem - Mensagem de erro personalizada
   * @returns {Object} - Resultado da validação
   */
  requerido(valor, mensagem = 'Este campo é obrigatório') {
    const valido = valor !== undefined && valor !== null && valor !== '';
    return {
      valido,
      mensagem: valido ? '' : mensagem
    };
  }

  /**
   * Valida um campo de e-mail
   * @param {string} email - E-mail a ser validado
   * @param {string} mensagem - Mensagem de erro personalizada
   * @returns {Object} - Resultado da validação
   */
  email(email, mensagem = 'E-mail inválido') {
    if (!email) {
      return { valido: true, mensagem: '' };
    }
    
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const valido = regex.test(email);
    
    return {
      valido,
      mensagem: valido ? '' : mensagem
    };
  }

  /**
   * Valida um número de CPF
   * @param {string} cpf - CPF a ser validado
   * @param {string} mensagem - Mensagem de erro personalizada
   * @returns {Object} - Resultado da validação
   */
  cpf(cpf, mensagem = 'CPF inválido') {
    if (!cpf) {
      return { valido: true, mensagem: '' };
    }
    
    // Remover caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');
    
    // Verificar tamanho
    if (cpf.length !== 11) {
      return { valido: false, mensagem };
    }
    
    // Verificar dígitos repetidos (caso inválido)
    if (/^(\d)\1{10}$/.test(cpf)) {
      return { valido: false, mensagem };
    }
    
    // Validar dígitos verificadores
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) {
      return { valido: false, mensagem };
    }
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) {
      return { valido: false, mensagem };
    }
    
    return { valido: true, mensagem: '' };
  }

  /**
   * Valida um número de cartão SUS
   * @param {string} cartaoSus - Cartão SUS a ser validado
   * @param {string} mensagem - Mensagem de erro personalizada
   * @returns {Object} - Resultado da validação
   */
  cartaoSus(cartaoSus, mensagem = 'Cartão SUS inválido') {
    if (!cartaoSus) {
      return { valido: true, mensagem: '' };
    }
    
    // Remover caracteres não numéricos
    cartaoSus = cartaoSus.replace(/[^\d]/g, '');
    
    // Verificar tamanho
    const valido = cartaoSus.length === 15;
    
    return {
      valido,
      mensagem: valido ? '' : mensagem
    };
  }

  /**
   * Valida uma data
   * @param {string} data - Data a ser validada (YYYY-MM-DD ou DD/MM/YYYY)
   * @param {string} mensagem - Mensagem de erro personalizada
   * @returns {Object} - Resultado da validação
   */
  data(data, mensagem = 'Data inválida') {
    if (!data) {
      return { valido: true, mensagem: '' };
    }
    
    let dataObj;
    
    if (data.includes('-')) {
      // Formato ISO (YYYY-MM-DD)
      dataObj = new Date(data);
    } else if (data.includes('/')) {
      // Formato brasileiro (DD/MM/YYYY)
      const [dia, mes, ano] = data.split('/');
      dataObj = new Date(`${ano}-${mes}-${dia}`);
    } else {
      return { valido: false, mensagem };
    }
    
    const valido = !isNaN(dataObj.getTime());
    
    return {
      valido,
      mensagem: valido ? '' : mensagem
    };
  }

  /**
   * Valida se uma data é menor ou igual à data atual
   * @param {string} data - Data a ser validada (YYYY-MM-DD ou DD/MM/YYYY)
   * @param {string} mensagem - Mensagem de erro personalizada
   * @returns {Object} - Resultado da validação
   */
  dataPassado(data, mensagem = 'A data deve ser no passado') {
    // Primeiro valida o formato da data
    const validacao = this.data(data);
    if (!validacao.valido) {
      return validacao;
    }
    
    if (!data) {
      return { valido: true, mensagem: '' };
    }
    
    let dataObj;
    
    if (data.includes('-')) {
      // Formato ISO (YYYY-MM-DD)
      dataObj = new Date(data);
    } else if (data.includes('/')) {
      // Formato brasileiro (DD/MM/YYYY)
      const [dia, mes, ano] = data.split('/');
      dataObj = new Date(`${ano}-${mes}-${dia}`);
    }
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const valido = dataObj <= hoje;
    
    return {
      valido,
      mensagem: valido ? '' : mensagem
    };
  }

  /**
   * Valida se uma string tem comprimento mínimo
   * @param {string} valor - Valor a ser validado
   * @param {number} min - Comprimento mínimo
   * @param {string} mensagem - Mensagem de erro personalizada
   * @returns {Object} - Resultado da validação
   */
  tamanhoMinimo(valor, min, mensagem = `Deve ter pelo menos ${min} caracteres`) {
    if (!valor) {
      return { valido: true, mensagem: '' };
    }
    
    const valido = valor.length >= min;
    
    return {
      valido,
      mensagem: valido ? '' : mensagem
    };
  }

  /**
   * Valida se uma string tem comprimento máximo
   * @param {string} valor - Valor a ser validado
   * @param {number} max - Comprimento máximo
   * @param {string} mensagem - Mensagem de erro personalizada
   * @returns {Object} - Resultado da validação
   */
  tamanhoMaximo(valor, max, mensagem = `Deve ter no máximo ${max} caracteres`) {
    if (!valor) {
      return { valido: true, mensagem: '' };
    }
    
    const valido = valor.length <= max;
    
    return {
      valido,
      mensagem: valido ? '' : mensagem
    };
  }

  /**
   * Valida se um valor numérico está dentro de um intervalo
   * @param {number} valor - Valor a ser validado
   * @param {number} min - Valor mínimo
   * @param {number} max - Valor máximo
   * @param {string} mensagem - Mensagem de erro personalizada
   * @returns {Object} - Resultado da validação
   */
  intervalo(valor, min, max, mensagem = `Deve estar entre ${min} e ${max}`) {
    if (valor === undefined || valor === null || valor === '') {
      return { valido: true, mensagem: '' };
    }
    
    const numero = parseFloat(valor);
    
    if (isNaN(numero)) {
      return { valido: false, mensagem: 'Deve ser um número válido' };
    }
    
    const valido = numero >= min && numero <= max;
    
    return {
      valido,
      mensagem: valido ? '' : mensagem
    };
  }

  /**
   * Valida um número de telefone
   * @param {string} telefone - Telefone a ser validado
   * @param {string} mensagem - Mensagem de erro personalizada
   * @returns {Object} - Resultado da validação
   */
  telefone(telefone, mensagem = 'Telefone inválido') {
    if (!telefone) {
      return { valido: true, mensagem: '' };
    }
    
    // Remover caracteres não numéricos
    const numeros = telefone.replace(/[^\d]/g, '');
    
    // Verificar tamanho (8-9 dígitos + 2 DDD = 10-11)
    const valido = numeros.length >= 10 && numeros.length <= 11;
    
    return {
      valido,
      mensagem: valido ? '' : mensagem
    };
  }

  /**
   * Valida se duas senhas são iguais
   * @param {string} senha - Senha
   * @param {string} confirmacao - Confirmação da senha
   * @param {string} mensagem - Mensagem de erro personalizada
   * @returns {Object} - Resultado da validação
   */
  senhasIguais(senha, confirmacao, mensagem = 'As senhas não coincidem') {
    const valido = senha === confirmacao;
    
    return {
      valido,
      mensagem: valido ? '' : mensagem
    };
  }

  /**
   * Valida a força de uma senha
   * @param {string} senha - Senha a ser validada
   * @param {string} mensagem - Mensagem de erro personalizada
   * @returns {Object} - Resultado da validação
   */
  forcaSenha(senha, mensagem = 'A senha deve ter pelo menos 8 caracteres, incluindo letras, números e símbolos') {
    if (!senha) {
      return { valido: true, mensagem: '' };
    }
    
    // Verificar comprimento mínimo
    if (senha.length < 8) {
      return { 
        valido: false, 
        mensagem: 'A senha deve ter pelo menos 8 caracteres'
      };
    }
    
    // Verificar combinação de tipos de caracteres
    const temLetraMinuscula = /[a-z]/.test(senha);
    const temLetraMaiuscula = /[A-Z]/.test(senha);
    const temNumero = /\d/.test(senha);
    const temSimbolo = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
    
    const pontuacao = [temLetraMinuscula, temLetraMaiuscula, temNumero, temSimbolo]
      .filter(Boolean).length;
    
    if (pontuacao < 3) {
      return { 
        valido: false, 
        mensagem
      };
    }
    
    return { valido: true, mensagem: '' };
  }

  /**
   * Valida um formulário completo
   * @param {Object} dados - Dados do formulário
   * @param {Object} regras - Regras de validação
   * @returns {Object} - Resultado da validação
   */
  validarFormulario(dados, regras) {
    const erros = {};
    let formValido = true;
    
    // Verificar cada campo com suas regras
    Object.keys(regras).forEach(campo => {
      const valorCampo = dados[campo];
      const regrasField = regras[campo];
      
      // Verificar cada regra deste campo
      for (const validador of regrasField) {
        let resultado;
        
        if (typeof validador === 'function') {
          // Validação personalizada
          resultado = validador(valorCampo, dados);
        } else {
          // Validação padrão
          const { tipo, params = [], mensagem } = validador;
          
          if (tipo && this[tipo]) {
            resultado = this[tipo](valorCampo, ...params, mensagem);
          } else {
            console.error(`Validador "${tipo}" não encontrado`);
            continue;
          }
        }
        
        // Se a validação falhou
        if (!resultado.valido) {
          if (!erros[campo]) {
            erros[campo] = [];
          }
          erros[campo].push(resultado.mensagem);
          formValido = false;
          break; // Não continuar verificando regras para este campo
        }
      }
    });
    
    return {
      valido: formValido,
      erros
    };
  }

  /**
   * Formata uma mensagem de erro para exibição
   * @param {Object} erros - Objeto com erros do formulário
   * @returns {string[]} - Array com mensagens formatadas
   */
  formatarErros(erros) {
    const mensagens = [];
    
    Object.keys(erros).forEach(campo => {
      if (Array.isArray(erros[campo])) {
        erros[campo].forEach(erro => {
          mensagens.push(`${campo}: ${erro}`);
        });
      } else {
        mensagens.push(`${campo}: ${erros[campo]}`);
      }
    });
    
    return mensagens;
  }
}

// Exporta instância única do serviço
const validacaoService = new ValidacaoService();
export default validacaoService; 