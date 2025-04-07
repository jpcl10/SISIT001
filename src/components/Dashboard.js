/**
 * Dashboard.js
 * Componente principal que exibe as solicitações do usuário
 */

import { 
  obterTodasSolicitacoes, 
  removerSolicitacao, 
  limparTodasSolicitacoes,
  alterarStatusSolicitacao
} from '../scripts/storage.js';

import { 
  mostrarNotificacao, 
  formatarData 
} from '../scripts/utils.js';

export default class Dashboard {
  constructor() {
    this.solicitacoes = [];
  }

  async render() {
    return `
      <section class="card">
        <h2>Minhas Solicitações</h2>
        
        <div class="nova-solicitacao">
          <a href="#/nova-solicitacao" class="btn primario">Nova Solicitação</a>
        </div>
        
        <div class="tabela-container">
          <table id="tabelaSolicitacoes">
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Paciente</th>
                <th>Tipo</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <!-- Dados serão adicionados via JavaScript -->
            </tbody>
          </table>
          <div id="nenhumaSolicitacao" class="vazio-mensagem">
            <p>Nenhuma solicitação encontrada. Clique em "Nova Solicitação" para começar.</p>
          </div>
        </div>
      </section>
      
      <!-- Painel de Debug (apenas no ambiente de desenvolvimento) -->
      <section class="card dados-debug">
        <h3>Dados em localStorage (Debug)</h3>
        <button id="btnLimparDados" class="btn secundario">Limpar Todos os Dados</button>
        <div id="dadosLocalStorage">
          <pre>Carregando dados...</pre>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const tabelaSolicitacoes = document.getElementById('tabelaSolicitacoes');
    const nenhumaSolicitacao = document.getElementById('nenhumaSolicitacao');
    const btnLimparDados = document.getElementById('btnLimparDados');
    const dadosLocalStorage = document.getElementById('dadosLocalStorage');
    
    // Carregar solicitações
    this.carregarSolicitacoes(tabelaSolicitacoes, nenhumaSolicitacao);
    
    // Atualizar dados de debug
    this.atualizarDadosDebug(dadosLocalStorage);
    
    // Event listeners
    btnLimparDados.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja limpar todos os dados salvos? Esta ação não pode ser desfeita.')) {
        limparTodasSolicitacoes();
        mostrarNotificacao('Todos os dados foram limpos com sucesso', 'informacao');
        this.carregarSolicitacoes(tabelaSolicitacoes, nenhumaSolicitacao);
        this.atualizarDadosDebug(dadosLocalStorage);
      }
    });
    
    // Adicionar listeners de logout globalmente
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      if (confirm('Deseja realmente sair do sistema?')) {
        mostrarNotificacao('Saindo do sistema...', 'informacao');
        setTimeout(() => {
          // Em produção, aqui faria logout real
          window.location.reload();
        }, 1000);
      }
    });
  }

  // Função para carregar solicitações na tabela
  carregarSolicitacoes(tabelaSolicitacoes, nenhumaSolicitacao) {
    this.solicitacoes = obterTodasSolicitacoes();
    const tbody = tabelaSolicitacoes.querySelector('tbody');
    
    // Limpar tabela
    tbody.innerHTML = '';
    
    // Mostrar mensagem se não houver solicitações
    if (this.solicitacoes.length === 0) {
      nenhumaSolicitacao.style.display = 'block';
      tabelaSolicitacoes.style.display = 'none';
      return;
    }
    
    // Esconder mensagem e mostrar tabela
    nenhumaSolicitacao.style.display = 'none';
    tabelaSolicitacoes.style.display = 'table';
    
    // Preencher tabela com solicitações
    this.solicitacoes.forEach(solicitacao => {
      const tr = document.createElement('tr');
      
      // Formatar data para visualização
      const dataFormatada = formatarData(solicitacao._dataCriacao);
      
      // Mapear tipo de solicitação para texto legível
      const tipoSolicitacaoTexto = this.mapearTipoSolicitacao(solicitacao.tipoSolicitacao);
      
      // Definir classes CSS conforme status
      const statusClass = solicitacao._status || 'rascunho';
      
      // Mapear status para texto legível
      const statusTexto = this.mapearStatus(solicitacao._status);
      
      tr.innerHTML = `
        <td>${solicitacao._id.substring(0, 10)}</td>
        <td>${solicitacao.dadosPaciente?.nomePaciente || 'N/A'}</td>
        <td>${tipoSolicitacaoTexto}</td>
        <td>${dataFormatada}</td>
        <td><span class="status-badge ${statusClass}">${statusTexto}</span></td>
        <td class="acoes">
          <button class="btn-acao visualizar" data-id="${solicitacao._id}">Visualizar</button>
          <button class="btn-acao editar" data-id="${solicitacao._id}">Editar</button>
          <button class="btn-acao cancelar" data-id="${solicitacao._id}">Cancelar</button>
        </td>
      `;
      
      tbody.appendChild(tr);
    });
    
    // Adicionar event listeners aos botões de ação
    this.adicionarEventosAcoes(tbody);
  }

  // Adicionar eventos aos botões de ação
  adicionarEventosAcoes(tbody) {
    // Botões Visualizar
    tbody.querySelectorAll('.btn-acao.visualizar').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        mostrarNotificacao('Visualizando solicitação...', 'informacao');
        // Redirecionar para tela de visualização
        window.location.hash = `#/visualizar/${id}`;
      });
    });
    
    // Botões Editar
    tbody.querySelectorAll('.btn-acao.editar').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        mostrarNotificacao('Editando solicitação...', 'informacao');
        // Redirecionar para tela de edição
        window.location.hash = `#/editar/${id}`;
      });
    });
    
    // Botões Cancelar
    tbody.querySelectorAll('.btn-acao.cancelar').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Tem certeza que deseja cancelar esta solicitação?')) {
          removerSolicitacao(id);
          mostrarNotificacao('Solicitação cancelada com sucesso', 'sucesso');
          this.carregarSolicitacoes(
            document.getElementById('tabelaSolicitacoes'), 
            document.getElementById('nenhumaSolicitacao')
          );
          this.atualizarDadosDebug(document.getElementById('dadosLocalStorage'));
        }
      });
    });
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

  // Atualizar dados de debug
  atualizarDadosDebug(dadosLocalStorage) {
    const dados = {
      solicitacoes: obterTodasSolicitacoes(),
      etapa1: localStorage.getItem('ubs_dados_etapa1') ? 
              JSON.parse(localStorage.getItem('ubs_dados_etapa1')) : null
    };
    
    dadosLocalStorage.innerHTML = `<pre>${JSON.stringify(dados, null, 2)}</pre>`;
  }
} 