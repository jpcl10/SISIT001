/**
 * FormularioEspecifico.js
 * Componente que carrega e gerencia formulários específicos por tipo
 */

import { 
  obterDadosEtapa1, 
  salvarFormulario,
  atualizarSolicitacao,
  buscarSolicitacaoPorId
} from '../scripts/storage.js';
import { validarFormulario } from '../scripts/validacoes.js';
import { mostrarNotificacao } from '../scripts/utils.js';
import apiService from '../scripts/api.js';

export default class FormularioEspecifico {
  constructor(params) {
    this.tipoFormulario = params?.tipo || '';
    this.idSolicitacao = params?.id || '';
    this.modoEdicao = Boolean(this.idSolicitacao);
    this.dadosPaciente = obterDadosEtapa1();
    this.dadosSolicitacao = null;
    
    // Se estiver no modo edição, carrega a solicitação
    if (this.modoEdicao) {
      this.dadosSolicitacao = buscarSolicitacaoPorId(this.idSolicitacao);
      this.tipoFormulario = this.dadosSolicitacao?.tipoSolicitacao || '';
      this.dadosPaciente = this.dadosSolicitacao?.dadosPaciente || this.dadosPaciente;
    }
  }

  async render() {
    // Verificar se o tipo de formulário é válido
    if (!this.tipoFormulario) {
      return `
        <section class="card erro-card">
          <h2>Erro ao carregar formulário</h2>
          <p>Tipo de formulário não especificado ou inválido.</p>
          <a href="#/" class="btn primario">Voltar ao Início</a>
        </section>
      `;
    }
    
    // Carregar o HTML do formulário específico
    try {
      const htmlCompleto = await apiService.carregarFormulario(this.tipoFormulario);
      
      // Extrair apenas o conteúdo do formulário (sem o HTML principal)
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlCompleto, 'text/html');
      
      // Pegar a seção card principal
      const cardSection = doc.querySelector('.card');
      if (!cardSection) {
        throw new Error('Estrutura do formulário inválida');
      }
      
      // Adicionar botões de navegação
      const botoesNav = document.createElement('div');
      botoesNav.className = 'botoes-navegacao';
      botoesNav.innerHTML = `
        <button type="button" class="btn secundario" id="btnVoltarForm">Voltar</button>
        <button type="button" class="btn secundario" id="btnSalvarRascunhoForm">Salvar Rascunho</button>
        <button type="button" class="btn primario" id="btnEnviarForm">
          ${this.modoEdicao ? 'Atualizar' : 'Enviar'} Solicitação
        </button>
      `;
      
      // Adicionar uma div para mensagens
      const divMensagem = document.createElement('div');
      divMensagem.id = 'mensagemValidacaoForm';
      divMensagem.className = 'mensagem erro';
      divMensagem.style.display = 'none';
      divMensagem.textContent = 'Por favor, preencha todos os campos obrigatórios antes de enviar.';
      
      // Pegar o formulário e adicionar os botões
      const formElement = cardSection.querySelector('form') || cardSection;
      formElement.appendChild(divMensagem);
      formElement.appendChild(botoesNav);
      
      return cardSection.outerHTML;
    } catch (erro) {
      console.error('Erro ao carregar formulário:', erro);
      return `
        <section class="card erro-card">
          <h2>Erro ao carregar formulário</h2>
          <p>${erro.message}</p>
          <a href="#/" class="btn primario">Voltar ao Início</a>
        </section>
      `;
    }
  }

  async afterRender() {
    // Preencher os dados do resumo do paciente
    this.preencherResumoPaciente();
    
    // Se é modo edição, preencher o formulário com os dados existentes
    if (this.modoEdicao && this.dadosSolicitacao) {
      this.preencherFormularioEdicao();
    }
    
    // Configurar os botões do formulário
    const form = document.querySelector('form');
    const btnVoltarForm = document.getElementById('btnVoltarForm');
    const btnSalvarRascunhoForm = document.getElementById('btnSalvarRascunhoForm');
    const btnEnviarForm = document.getElementById('btnEnviarForm');
    const mensagemValidacaoForm = document.getElementById('mensagemValidacaoForm');
    
    if (btnVoltarForm) {
      btnVoltarForm.addEventListener('click', () => {
        if (this.modoEdicao) {
          window.location.hash = '#/';
        } else {
          window.location.hash = '#/nova-solicitacao';
        }
      });
    }
    
    if (form && btnSalvarRascunhoForm) {
      btnSalvarRascunhoForm.addEventListener('click', () => {
        const formData = new FormData(form);
        const dados = Object.fromEntries(formData.entries());
        
        // Verificar checkboxes (que podem ter multiple values)
        const checkboxesGroups = form.querySelectorAll('input[type="checkbox"][name]');
        const gruposCheckbox = {};
        
        checkboxesGroups.forEach(checkbox => {
          const name = checkbox.getAttribute('name');
          if (!gruposCheckbox[name]) {
            gruposCheckbox[name] = [];
          }
          
          if (checkbox.checked) {
            gruposCheckbox[name].push(checkbox.value);
          }
        });
        
        // Adicionar valores dos checkboxes ao objeto de dados
        Object.keys(gruposCheckbox).forEach(grupo => {
          dados[grupo] = gruposCheckbox[grupo];
        });
        
        if (this.modoEdicao) {
          // Atualizar solicitação existente
          atualizarSolicitacao(this.idSolicitacao, {
            dadosEspecificos: dados
          });
          mostrarNotificacao('Solicitação atualizada com sucesso!', 'sucesso');
        } else {
          // Salvar como nova solicitação (rascunho)
          salvarFormulario(this.tipoFormulario, dados);
          mostrarNotificacao('Rascunho salvo com sucesso!', 'sucesso');
        }
      });
    }
    
    if (form && btnEnviarForm) {
      btnEnviarForm.addEventListener('click', () => {
        // Validar formulário
        const resultadoValidacao = validarFormulario(form);
        
        if (resultadoValidacao.valido) {
          const formData = new FormData(form);
          const dados = Object.fromEntries(formData.entries());
          
          // Processar checkboxes
          const checkboxesGroups = form.querySelectorAll('input[type="checkbox"][name]');
          const gruposCheckbox = {};
          
          checkboxesGroups.forEach(checkbox => {
            const name = checkbox.getAttribute('name');
            if (!gruposCheckbox[name]) {
              gruposCheckbox[name] = [];
            }
            
            if (checkbox.checked) {
              gruposCheckbox[name].push(checkbox.value);
            }
          });
          
          // Adicionar valores dos checkboxes ao objeto de dados
          Object.keys(gruposCheckbox).forEach(grupo => {
            dados[grupo] = gruposCheckbox[grupo];
          });
          
          if (this.modoEdicao) {
            // Atualizar solicitação existente e marcar como enviada
            atualizarSolicitacao(this.idSolicitacao, {
              dadosEspecificos: dados,
              _status: 'enviado',
              _dataEnvio: new Date().toISOString()
            });
            mostrarNotificacao('Solicitação atualizada e enviada com sucesso!', 'sucesso');
          } else {
            // Salvar como nova solicitação e marcar como enviada
            const idNovaSolicitacao = salvarFormulario(this.tipoFormulario, dados);
            atualizarSolicitacao(idNovaSolicitacao, {
              _status: 'enviado',
              _dataEnvio: new Date().toISOString()
            });
            mostrarNotificacao('Solicitação enviada com sucesso!', 'sucesso');
          }
          
          // Redirecionar para a tela inicial
          setTimeout(() => {
            window.location.hash = '#/';
          }, 1500);
        } else {
          if (mensagemValidacaoForm) {
            mensagemValidacaoForm.style.display = 'block';
          }
        }
      });
    }
  }

  // Preencher os dados do resumo do paciente no formulário
  preencherResumoPaciente() {
    const elements = {
      resumoNomePaciente: this.dadosPaciente.nomePaciente || '-',
      resumoDataNascimento: this.dadosPaciente.dataNascimento || '-',
      resumoCnsPaciente: this.dadosPaciente.cnsPaciente || '-',
      resumoNomeUnidade: this.dadosPaciente.nomeUnidade || '-'
    };
    
    Object.keys(elements).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = elements[id];
      }
    });
  }
  
  // Preencher o formulário com os dados existentes (modo edição)
  preencherFormularioEdicao() {
    if (!this.dadosSolicitacao || !this.dadosSolicitacao.dadosEspecificos) return;
    
    const dados = this.dadosSolicitacao.dadosEspecificos;
    const form = document.querySelector('form');
    
    if (!form) return;
    
    // Preencher os campos de input text, select, textarea
    Object.keys(dados).forEach(key => {
      const campo = form.querySelector(`[name="${key}"]`);
      if (!campo) return;
      
      if (campo.type === 'checkbox') {
        // Checkboxes requerem tratamento especial
        return;
      } else if (campo.type === 'radio') {
        // Radio buttons também
        const radioBtn = form.querySelector(`[name="${key}"][value="${dados[key]}"]`);
        if (radioBtn) radioBtn.checked = true;
      } else {
        // Campos de texto, selects, etc.
        campo.value = dados[key];
      }
    });
    
    // Tratamento especial para checkboxes (que podem ser arrays)
    Object.keys(dados).forEach(key => {
      const checkboxes = form.querySelectorAll(`[name="${key}"][type="checkbox"]`);
      if (checkboxes.length === 0) return;
      
      const valores = Array.isArray(dados[key]) ? dados[key] : [dados[key]];
      
      checkboxes.forEach(checkbox => {
        checkbox.checked = valores.includes(checkbox.value);
      });
    });
  }
} 