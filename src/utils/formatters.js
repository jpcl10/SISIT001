/**
 * Sistema UBS - Utilitários de Formatação
 * 
 * Funções auxiliares para formatação de diversos tipos de dados
 */

import { FORMATO_DATA, STATUS_SOLICITACAO_DISPLAY, PRIORIDADE_SOLICITACAO_DISPLAY } from './constants';

/**
 * Formatadores de data
 */
export const formatData = {
  /**
   * Formata uma data para formato brasileiro (DD/MM/YYYY)
   * @param {string|Date} data - Data a ser formatada
   * @returns {string} - Data formatada
   */
  paraExibicao(data) {
    if (!data) return '';
    
    try {
      let dataObj;
      if (typeof data === 'string') {
        // Verificar formato ISO
        if (data.includes('T') || data.includes('-')) {
          dataObj = new Date(data);
        } else if (data.includes('/')) {
          // Já está no formato brasileiro
          const [dia, mes, ano] = data.split('/');
          if (dia.length === 2 && mes.length === 2 && ano.length === 4) {
            return data;
          }
          
          dataObj = new Date(`${ano}-${mes}-${dia}`);
        } else {
          dataObj = new Date(parseInt(data));
        }
      } else if (data instanceof Date) {
        dataObj = data;
      } else {
        return '';
      }
      
      if (isNaN(dataObj.getTime())) return '';
      
      const dia = String(dataObj.getDate()).padStart(2, '0');
      const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
      const ano = dataObj.getFullYear();
      
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '';
    }
  },
  
  /**
   * Formata uma data para o formato ISO (YYYY-MM-DD)
   * @param {string|Date} data - Data a ser formatada
   * @returns {string} - Data formatada
   */
  paraISO(data) {
    if (!data) return '';
    
    try {
      let dataObj;
      if (typeof data === 'string') {
        // Verificar se já está no formato ISO
        if (data.includes('-') && !data.includes('/')) {
          if (data.includes('T')) {
            return data.split('T')[0];
          }
          return data;
        } else if (data.includes('/')) {
          // Formato brasileiro
          const [dia, mes, ano] = data.split('/');
          dataObj = new Date(`${ano}-${mes}-${dia}`);
        } else {
          dataObj = new Date(parseInt(data));
        }
      } else if (data instanceof Date) {
        dataObj = data;
      } else {
        return '';
      }
      
      if (isNaN(dataObj.getTime())) return '';
      
      const dia = String(dataObj.getDate()).padStart(2, '0');
      const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
      const ano = dataObj.getFullYear();
      
      return `${ano}-${mes}-${dia}`;
    } catch (error) {
      console.error('Erro ao formatar data para ISO:', error);
      return '';
    }
  },
  
  /**
   * Formata uma data e hora para exibição (DD/MM/YYYY HH:MM)
   * @param {string|Date} data - Data a ser formatada
   * @returns {string} - Data e hora formatadas
   */
  dataHora(data) {
    if (!data) return '';
    
    try {
      let dataObj;
      if (typeof data === 'string') {
        dataObj = new Date(data);
      } else if (data instanceof Date) {
        dataObj = data;
      } else {
        return '';
      }
      
      if (isNaN(dataObj.getTime())) return '';
      
      const dia = String(dataObj.getDate()).padStart(2, '0');
      const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
      const ano = dataObj.getFullYear();
      const hora = String(dataObj.getHours()).padStart(2, '0');
      const minuto = String(dataObj.getMinutes()).padStart(2, '0');
      
      return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
    } catch (error) {
      console.error('Erro ao formatar data e hora:', error);
      return '';
    }
  },
  
  /**
   * Formata uma data relativa (ex: "há 2 dias", "há 5 horas")
   * @param {string|Date} data - Data a ser formatada
   * @returns {string} - Data relativa formatada
   */
  relativa(data) {
    if (!data) return '';
    
    try {
      let dataObj;
      if (typeof data === 'string') {
        dataObj = new Date(data);
      } else if (data instanceof Date) {
        dataObj = data;
      } else {
        return '';
      }
      
      if (isNaN(dataObj.getTime())) return '';
      
      const agora = new Date();
      const diff = agora.getTime() - dataObj.getTime();
      
      // Menos de 1 minuto
      if (diff < 60 * 1000) {
        return 'agora mesmo';
      }
      
      // Menos de 1 hora
      if (diff < 60 * 60 * 1000) {
        const minutos = Math.floor(diff / (60 * 1000));
        return `há ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
      }
      
      // Menos de 1 dia
      if (diff < 24 * 60 * 60 * 1000) {
        const horas = Math.floor(diff / (60 * 60 * 1000));
        return `há ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
      }
      
      // Menos de 7 dias
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        const dias = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `há ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
      }
      
      // Mais de 7 dias
      return formatData.paraExibicao(dataObj);
    } catch (error) {
      console.error('Erro ao formatar data relativa:', error);
      return '';
    }
  }
};

/**
 * Formatadores de números
 */
export const formatNumero = {
  /**
   * Formata um número para moeda brasileira (R$)
   * @param {number} valor - Valor a ser formatado
   * @returns {string} - Valor formatado
   */
  moeda(valor) {
    if (valor === undefined || valor === null) return '';
    
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valor);
    } catch (error) {
      console.error('Erro ao formatar moeda:', error);
      return '';
    }
  },
  
  /**
   * Formata um número com separador de milhares
   * @param {number} valor - Valor a ser formatado
   * @param {number} casasDecimais - Número de casas decimais
   * @returns {string} - Valor formatado
   */
  decimal(valor, casasDecimais = 2) {
    if (valor === undefined || valor === null) return '';
    
    try {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: casasDecimais,
        maximumFractionDigits: casasDecimais
      }).format(valor);
    } catch (error) {
      console.error('Erro ao formatar número decimal:', error);
      return '';
    }
  },
  
  /**
   * Formata um número como percentual
   * @param {number} valor - Valor a ser formatado (0.1 = 10%)
   * @returns {string} - Valor formatado
   */
  percentual(valor) {
    if (valor === undefined || valor === null) return '';
    
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(valor);
    } catch (error) {
      console.error('Erro ao formatar percentual:', error);
      return '';
    }
  },
  
  /**
   * Formata um número como inteiro
   * @param {number} valor - Valor a ser formatado
   * @returns {string} - Valor formatado
   */
  inteiro(valor) {
    if (valor === undefined || valor === null) return '';
    
    try {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(valor);
    } catch (error) {
      console.error('Erro ao formatar número inteiro:', error);
      return '';
    }
  }
};

/**
 * Formatadores de documentos e dados pessoais
 */
export const formatDocumento = {
  /**
   * Formata um CPF (xxx.xxx.xxx-xx)
   * @param {string} cpf - CPF a ser formatado
   * @returns {string} - CPF formatado
   */
  cpf(cpf) {
    if (!cpf) return '';
    
    // Remover caracteres não numéricos
    const numeros = cpf.replace(/\D/g, '');
    
    if (numeros.length !== 11) return cpf;
    
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },
  
  /**
   * Formata um CNPJ (xx.xxx.xxx/xxxx-xx)
   * @param {string} cnpj - CNPJ a ser formatado
   * @returns {string} - CNPJ formatado
   */
  cnpj(cnpj) {
    if (!cnpj) return '';
    
    // Remover caracteres não numéricos
    const numeros = cnpj.replace(/\D/g, '');
    
    if (numeros.length !== 14) return cnpj;
    
    return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  },
  
  /**
   * Formata um telefone ((xx) xxxxx-xxxx)
   * @param {string} telefone - Telefone a ser formatado
   * @returns {string} - Telefone formatado
   */
  telefone(telefone) {
    if (!telefone) return '';
    
    // Remover caracteres não numéricos
    const numeros = telefone.replace(/\D/g, '');
    
    if (numeros.length < 10) return telefone;
    
    if (numeros.length === 11) {
      return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  },
  
  /**
   * Formata um CEP (xxxxx-xxx)
   * @param {string} cep - CEP a ser formatado
   * @returns {string} - CEP formatado
   */
  cep(cep) {
    if (!cep) return '';
    
    // Remover caracteres não numéricos
    const numeros = cep.replace(/\D/g, '');
    
    if (numeros.length !== 8) return cep;
    
    return numeros.replace(/(\d{5})(\d{3})/, '$1-$2');
  },
  
  /**
   * Formata um cartão SUS
   * @param {string} cartaoSus - Cartão SUS a ser formatado
   * @returns {string} - Cartão SUS formatado
   */
  cartaoSus(cartaoSus) {
    if (!cartaoSus) return '';
    
    // Remover caracteres não numéricos
    const numeros = cartaoSus.replace(/\D/g, '');
    
    if (numeros.length !== 15) return cartaoSus;
    
    return numeros.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
  }
};

/**
 * Formatadores de status e dados de solicitações
 */
export const formatSolicitacao = {
  /**
   * Formata um status de solicitação para exibição
   * @param {string} status - Status da solicitação
   * @returns {string} - Status formatado
   */
  status(status) {
    if (!status) return '';
    
    return STATUS_SOLICITACAO_DISPLAY[status] || status;
  },
  
  /**
   * Formata uma prioridade de solicitação para exibição
   * @param {string} prioridade - Prioridade da solicitação
   * @returns {string} - Prioridade formatada
   */
  prioridade(prioridade) {
    if (!prioridade) return '';
    
    return PRIORIDADE_SOLICITACAO_DISPLAY[prioridade] || prioridade;
  },
  
  /**
   * Formata o histórico de uma solicitação para exibição
   * @param {Array} historico - Histórico da solicitação
   * @returns {Array} - Histórico formatado
   */
  historico(historico) {
    if (!historico || !Array.isArray(historico)) return [];
    
    return historico.map(item => ({
      ...item,
      dataFormatada: formatData.dataHora(item.data),
      dataRelativa: formatData.relativa(item.data)
    }));
  }
};

/**
 * Formatadores de texto
 */
export const formatTexto = {
  /**
   * Limita um texto a um número máximo de caracteres
   * @param {string} texto - Texto a ser limitado
   * @param {number} limite - Limite de caracteres
   * @param {string} sufixo - Sufixo a ser adicionado quando o texto é cortado
   * @returns {string} - Texto limitado
   */
  limitar(texto, limite = 100, sufixo = '...') {
    if (!texto) return '';
    
    if (texto.length <= limite) {
      return texto;
    }
    
    return texto.substring(0, limite) + sufixo;
  },
  
  /**
   * Formata um texto para URL amigável (slug)
   * @param {string} texto - Texto a ser formatado
   * @returns {string} - Texto formatado como slug
   */
  slug(texto) {
    if (!texto) return '';
    
    // Converter para minúsculas e remover acentos
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
  
  /**
   * Capitaliza a primeira letra de cada palavra
   * @param {string} texto - Texto a ser formatado
   * @returns {string} - Texto com a primeira letra de cada palavra em maiúscula
   */
  capitalizar(texto) {
    if (!texto) return '';
    
    return texto
      .toLowerCase()
      .split(' ')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  },
  
  /**
   * Converte quebras de linha em tags HTML <br>
   * @param {string} texto - Texto a ser formatado
   * @returns {string} - Texto com tags <br>
   */
  quebrasLinha(texto) {
    if (!texto) return '';
    
    return texto.replace(/\n/g, '<br>');
  }
};

/**
 * Formatador geral que combina todos os outros formatadores
 */
export default {
  data: formatData,
  numero: formatNumero,
  documento: formatDocumento,
  solicitacao: formatSolicitacao,
  texto: formatTexto
}; 