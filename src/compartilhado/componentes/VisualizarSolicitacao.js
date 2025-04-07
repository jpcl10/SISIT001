/**
 * VisualizarSolicitacao.js
 * Componente para visualizar os detalhes de uma solicitação
 */

import { 
  buscarSolicitacaoPorId,
  alterarStatusSolicitacao,
  removerSolicitacao
} from '../scripts/storage.js';

import { formatarData, mostrarNotificacao } from '../scripts/utils.js';

export default class VisualizarSolicitacao {
  constructor(params) {
    this.id = params?.id || '';
    this.solicitacao = null;
  }

  async render() {
    // Buscar a solicitação pelo ID
    this.solicitacao = buscarSolicitacaoPorId(this.id);

    if (!this.solicitacao) {
      return `
        <section class="card erro-card">
          <h2>Solicitação não encontrada</h2>
          <p>A solicitação com o ID "${this.id}" não existe ou foi removida.</p>
          <a href="#/" class="btn primario">Voltar ao Início</a>
        </section>
      `;
    }

    // Mapear tipo para exibição
    const tipoTexto = this.mapearTipoSolicitacao(this.solicitacao.tipoSolicitacao);
    const statusTexto = this.mapearStatus(this.solicitacao._status);
    const statusClass = this.solicitacao._status || 'rascunho';
    
    // Extrair dados do paciente e solicitação
    const { dadosPaciente, dadosEspecificos } = this.solicitacao;
    
    return `
      <section class="card">
        <div class="cabecalho-visualizacao">
          <h2>Visualizar Solicitação</h2>
          <span class="status-badge ${statusClass}">${statusTexto}</span>
        </div>
        
        <div class="detalhes-solicitacao">
          <div class="info-grupo">
            <h3>Informações da Solicitação</h3>
            <p><strong>Protocolo:</strong> ${this.solicitacao._id}</p>
            <p><strong>Tipo:</strong> ${tipoTexto}</p>
            <p><strong>Data de Criação:</strong> ${formatarData(this.solicitacao._dataCriacao)}</p>
            <p><strong>Última Atualização:</strong> ${formatarData(this.solicitacao._ultimaAtualizacao || this.solicitacao._dataCriacao)}</p>
          </div>
          
          <div class="info-grupo">
            <h3>Dados do Paciente</h3>
            <p><strong>Nome:</strong> ${dadosPaciente.nomePaciente || '-'}</p>
            <p><strong>Data de Nascimento:</strong> ${dadosPaciente.dataNascimento ? formatarData(dadosPaciente.dataNascimento) : '-'}</p>
            <p><strong>CNS:</strong> ${dadosPaciente.cnsPaciente || '-'}</p>
            <p><strong>CPF:</strong> ${dadosPaciente.cpfPaciente || '-'}</p>
            <p><strong>Endereço:</strong> ${dadosPaciente.enderecoPaciente || '-'}</p>
            <p><strong>Telefone:</strong> ${dadosPaciente.telefonePaciente || '-'}</p>
          </div>
          
          <div class="info-grupo">
            <h3>Dados da Unidade</h3>
            <p><strong>Nome:</strong> ${dadosPaciente.nomeUnidade || '-'}</p>
            <p><strong>CNES:</strong> ${dadosPaciente.cnesUnidade || '-'}</p>
            <p><strong>Endereço:</strong> ${dadosPaciente.enderecoUnidade || '-'}</p>
            <p><strong>Telefone:</strong> ${dadosPaciente.telefoneUnidade || '-'}</p>
          </div>
          
          <div class="info-grupo">
            <h3>Dados Específicos da Solicitação</h3>
            <div class="dados-especificos">
              ${this.gerarHtmlDadosEspecificos(dadosEspecificos)}
            </div>
          </div>
        </div>
        
        <div class="acoes-visualizacao">
          <button class="btn secundario" id="btnVoltar">Voltar</button>
          <div class="acoes-direita">
            ${this.solicitacao._status === 'rascunho' ? `
              <button class="btn destaque" id="btnEditar">Editar</button>
              <button class="btn primario" id="btnEnviar">Enviar</button>
            ` : ''}
            <button class="btn erro" id="btnCancelar">Cancelar</button>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const btnVoltar = document.getElementById('btnVoltar');
    const btnEditar = document.getElementById('btnEditar');
    const btnEnviar = document.getElementById('btnEnviar');
    const btnCancelar = document.getElementById('btnCancelar');

    // Botão Voltar
    if (btnVoltar) {
      btnVoltar.addEventListener('click', () => {
        window.history.back();
      });
    }

    // Botão Editar (só disponível para rascunhos)
    if (btnEditar) {
      btnEditar.addEventListener('click', () => {
        window.location.hash = `#/editar/${this.id}`;
      });
    }

    // Botão Enviar (só disponível para rascunhos)
    if (btnEnviar) {
      btnEnviar.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja enviar esta solicitação?')) {
          alterarStatusSolicitacao(this.id, 'enviado');
          mostrarNotificacao('Solicitação enviada com sucesso!', 'sucesso');
          // Recarregar a página para atualizar o status
          window.location.reload();
        }
      });
    }

    // Botão Cancelar (disponível para todas as solicitações)
    if (btnCancelar) {
      btnCancelar.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja cancelar esta solicitação? Esta ação não pode ser desfeita.')) {
          removerSolicitacao(this.id);
          mostrarNotificacao('Solicitação cancelada com sucesso!', 'sucesso');
          // Redirecionar para a tela inicial
          window.location.hash = '#/';
        }
      });
    }
  }

  // Mapear tipo de solicitação para texto legível
  mapearTipoSolicitacao(tipo) {
    const mapeamento = {
      'ressonancia': 'Ressonância Magnética',
      'mamografia': 'Mamografia',
      'lme': 'LME - Medicação Especializada',
      'aih': 'AIH - Internação Hospitalar',
      'ambulatorial': 'Procedimento Ambulatorial',
      'especialidades': 'Consulta de Especialidade'
    };
    
    return mapeamento[tipo] || tipo;
  }

  // Mapear status para texto legível
  mapearStatus(status) {
    const mapeamento = {
      'rascunho': 'Rascunho',
      'enviado': 'Enviado',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado'
    };
    
    return mapeamento[status] || 'Rascunho';
  }

  // Gerar HTML para exibir os dados específicos da solicitação
  gerarHtmlDadosEspecificos(dados) {
    if (!dados || Object.keys(dados).length === 0) {
      return '<p>Nenhum dado específico disponível.</p>';
    }

    let html = '<dl class="dados-especificos-lista">';
    
    // Formatação de chaves para exibição mais legível
    const formatarChave = (chave) => {
      return chave
        .replace(/([A-Z])/g, ' $1') // Adicionar espaço antes de letras maiúsculas
        .replace(/^./, (str) => str.toUpperCase()) // Primeira letra maiúscula
        .replace(/([a-z])([0-9])/g, '$1 $2') // Espaço entre letras e números
        .replace(/_/g, ' '); // Substituir underscores por espaços
    };
    
    // Processar cada campo
    Object.keys(dados).forEach(chave => {
      // Ignorar campos internos (que começam com _)
      if (chave.startsWith('_')) return;
      
      const valor = dados[chave];
      const chaveFormatada = formatarChave(chave);
      
      // Tratamento diferente para arrays (usado em checkboxes)
      if (Array.isArray(valor)) {
        html += `<dt>${chaveFormatada}:</dt>`;
        html += '<dd><ul>';
        
        if (valor.length === 0) {
          html += '<li>Nenhuma opção selecionada</li>';
        } else {
          valor.forEach(item => {
            html += `<li>${formatarChave(item)}</li>`;
          });
        }
        
        html += '</ul></dd>';
      } else {
        html += `<dt>${chaveFormatada}:</dt>`;
        html += `<dd>${valor || '-'}</dd>`;
      }
    });
    
    html += '</dl>';
    return html;
  }
} 