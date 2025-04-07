/**
 * Modelo de Solicitação
 * 
 * Define a estrutura e validação de uma solicitação no sistema
 */

class Solicitacao {
  constructor(dados = {}) {
    this.id = dados.id || null;
    this.paciente = dados.paciente || { 
      nome: '', 
      cpf: '', 
      dataNascimento: '',
      cartaoSUS: '',
      telefone: '',
      endereco: ''
    };
    this.tipo = dados.tipo || '';
    this.especialidade = dados.especialidade || '';
    this.prioridade = dados.prioridade || 'normal';
    this.status = dados.status || 'pendente';
    this.dataCriacao = dados.dataCriacao || new Date().toISOString();
    this.dataAtualizacao = dados.dataAtualizacao || new Date().toISOString();
    this.unidadeOrigem = dados.unidadeOrigem || '';
    this.unidadeDestino = dados.unidadeDestino || '';
    this.profissionalSolicitante = dados.profissionalSolicitante || '';
    this.justificativa = dados.justificativa || '';
    this.anexos = dados.anexos || [];
    this.observacoes = dados.observacoes || '';
    this.historico = dados.historico || [];
  }

  // Verifica se os dados obrigatórios foram preenchidos
  validar() {
    const erros = [];
    
    if (!this.paciente.nome) {
      erros.push('Nome do paciente é obrigatório');
    }
    
    if (!this.paciente.cpf) {
      erros.push('CPF do paciente é obrigatório');
    }
    
    if (!this.tipo) {
      erros.push('Tipo de solicitação é obrigatório');
    }
    
    if (!this.especialidade) {
      erros.push('Especialidade é obrigatória');
    }
    
    if (!this.unidadeOrigem) {
      erros.push('Unidade de origem é obrigatória');
    }
    
    if (!this.profissionalSolicitante) {
      erros.push('Profissional solicitante é obrigatório');
    }
    
    return {
      valido: erros.length === 0,
      erros
    };
  }

  // Adiciona um item ao histórico
  adicionarHistorico(usuario, acao, detalhes = '') {
    this.historico.push({
      data: new Date().toISOString(),
      usuario,
      acao,
      detalhes
    });
    
    this.dataAtualizacao = new Date().toISOString();
  }

  // Atualiza o status da solicitação
  atualizarStatus(novoStatus, usuario, observacao = '') {
    const statusAntigo = this.status;
    this.status = novoStatus;
    this.dataAtualizacao = new Date().toISOString();
    
    this.adicionarHistorico(
      usuario,
      `Alteração de status: ${statusAntigo} → ${novoStatus}`,
      observacao
    );
  }

  // Converte o objeto para JSON
  toJSON() {
    return {
      id: this.id,
      paciente: this.paciente,
      tipo: this.tipo,
      especialidade: this.especialidade,
      prioridade: this.prioridade,
      status: this.status,
      dataCriacao: this.dataCriacao,
      dataAtualizacao: this.dataAtualizacao,
      unidadeOrigem: this.unidadeOrigem,
      unidadeDestino: this.unidadeDestino,
      profissionalSolicitante: this.profissionalSolicitante,
      justificativa: this.justificativa,
      anexos: this.anexos,
      observacoes: this.observacoes,
      historico: this.historico
    };
  }
}

module.exports = Solicitacao; 