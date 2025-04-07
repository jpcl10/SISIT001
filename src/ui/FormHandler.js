/**
 * Sistema UBS - Manipulador de Formulários
 * 
 * Responsável por gerenciar formulários na UI, incluindo
 * validação, serialização, e interação com os serviços.
 */

import solicitacaoService from '../services/SolicitacaoService.js';
import apiService from '../services/ApiService.js';
import storageService from '../services/StorageService.js';
import solicitacaoValidator from '../services/validators/SolicitacaoValidator.js';

/**
 * Classe que gerencia formulários na UI
 */
class FormHandler {
  /**
   * Inicializa um manipulador de formulário
   * @param {string} formId - ID do elemento do formulário
   * @param {Object} options - Opções de configuração
   */
  constructor(formId, options = {}) {
    this.formId = formId;
    this.formElement = document.getElementById(formId);
    this.options = {
      validarAoMudar: options.validarAoMudar !== undefined ? options.validarAoMudar : true,
      salvarAlteracoes: options.salvarAlteracoes !== undefined ? options.salvarAlteracoes : true,
      tipoFormulario: options.tipoFormulario || '',
      callbackSucesso: options.callbackSucesso || null,
      callbackErro: options.callbackErro || null,
      callbackValidacao: options.callbackValidacao || null,
      camposObrigatorios: options.camposObrigatorios || []
    };

    if (!this.formElement) {
      console.error(`Formulário #${formId} não encontrado no documento.`);
      return;
    }

    this.inicializar();
  }

  /**
   * Inicializa o manipulador de formulário
   */
  inicializar() {
    // Adicionar manipuladores de eventos
    this.formElement.addEventListener('submit', this.handleSubmit.bind(this));

    if (this.options.validarAoMudar) {
      this.formElement.addEventListener('change', this.handleChange.bind(this));
      this.formElement.addEventListener('input', this.handleInput.bind(this));
    }

    // Inicializar campos com valores existentes (se houver)
    this.carregarDadosSalvos();
  }

  /**
   * Carrega dados salvos anteriormente
   */
  carregarDadosSalvos() {
    try {
      if (this.options.tipoFormulario === 'etapa1') {
        const dadosEtapa1 = storageService.obterDadosEtapa1();
        this.preencherFormulario(dadosEtapa1);
      } else if (this.options.tipoFormulario && this.options.idSolicitacao) {
        const solicitacao = storageService.buscarSolicitacaoPorId(this.options.idSolicitacao);
        if (solicitacao) {
          this.preencherFormulario(solicitacao.dadosEspecificos);
        }
      }
    } catch (erro) {
      console.error('Erro ao carregar dados salvos:', erro);
    }
  }

  /**
   * Preenche o formulário com os dados fornecidos
   * @param {Object} dados - Dados para preencher o formulário
   */
  preencherFormulario(dados) {
    if (!dados || Object.keys(dados).length === 0) return;

    Object.entries(dados).forEach(([chave, valor]) => {
      const campo = this.formElement.elements[chave];
      if (!campo) return;

      if (campo.type === 'checkbox') {
        campo.checked = Boolean(valor);
      } else if (campo.type === 'radio') {
        const radio = this.formElement.querySelector(`input[name="${chave}"][value="${valor}"]`);
        if (radio) radio.checked = true;
      } else if (campo.tagName === 'SELECT') {
        campo.value = valor;
      } else {
        campo.value = valor;
      }
    });
  }

  /**
   * Valida o formulário
   * @returns {Object} - Resultado da validação
   */
  validar() {
    const erros = [];
    const campos = Array.from(this.formElement.elements);

    // Verificar campos obrigatórios
    this.options.camposObrigatorios.forEach(nomeCampo => {
      const campo = campos.find(c => c.name === nomeCampo);
      if (!campo) return;

      let valorCampo = '';
      if (campo.type === 'checkbox') {
        valorCampo = campo.checked;
      } else if (campo.type === 'radio') {
        const radioSelecionado = this.formElement.querySelector(`input[name="${nomeCampo}"]:checked`);
        valorCampo = radioSelecionado ? radioSelecionado.value : '';
      } else {
        valorCampo = campo.value.trim();
      }

      if (!valorCampo) {
        erros.push(`O campo ${campo.dataset.label || nomeCampo} é obrigatório`);
        campo.classList.add('is-invalid');
      } else {
        campo.classList.remove('is-invalid');
        campo.classList.add('is-valid');
      }
    });

    // Validações específicas do tipo de formulário
    if (this.options.tipoFormulario === 'etapa1') {
      const dadosPaciente = this.obterDados();
      const errosValidacao = solicitacaoValidator.validarDadosPaciente(dadosPaciente);
      
      if (errosValidacao.length > 0) {
        erros.push(...errosValidacao);
        
        // Marcar campos com erro
        errosValidacao.forEach(erroMsg => {
          const campoComErro = erroMsg.split(' ')[0].toLowerCase();
          const campo = campos.find(c => c.name.toLowerCase().includes(campoComErro));
          if (campo) {
            campo.classList.add('is-invalid');
          }
        });
      }
    }

    // Executar callback de validação personalizada
    if (this.options.callbackValidacao) {
      const errosCallback = this.options.callbackValidacao(this.obterDados());
      if (errosCallback && errosCallback.length > 0) {
        erros.push(...errosCallback);
      }
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }

  /**
   * Obtém os dados do formulário
   * @returns {Object} - Dados do formulário
   */
  obterDados() {
    const formData = new FormData(this.formElement);
    const dados = {};

    formData.forEach((valor, chave) => {
      dados[chave] = valor;
    });

    // Tratar checkboxes não marcados (que não são incluídos no FormData)
    Array.from(this.formElement.querySelectorAll('input[type="checkbox"]')).forEach(checkbox => {
      if (!checkbox.checked && !formData.has(checkbox.name)) {
        dados[checkbox.name] = false;
      }
    });

    return dados;
  }

  /**
   * Salva os dados do formulário
   * @param {boolean} comoRascunho - Se deve salvar como rascunho
   * @returns {Promise<Object>} - Resultado da operação
   */
  async salvar(comoRascunho = true) {
    try {
      const dados = this.obterDados();

      if (this.options.tipoFormulario === 'etapa1') {
        storageService.salvarDadosEtapa1(dados);
        return {
          sucesso: true,
          mensagem: 'Dados do paciente salvos com sucesso'
        };
      } else if (this.options.tipoFormulario) {
        if (this.options.idSolicitacao) {
          // Atualizar solicitação existente
          await solicitacaoService.atualizar(this.options.idSolicitacao, {
            dadosEspecificos: dados
          });
          return {
            sucesso: true,
            mensagem: 'Solicitação atualizada com sucesso',
            id: this.options.idSolicitacao
          };
        } else {
          // Criar nova solicitação
          const idSolicitacao = await solicitacaoService.criar(
            this.options.tipoFormulario, 
            dados, 
            comoRascunho
          );
          return {
            sucesso: true,
            mensagem: comoRascunho ? 'Rascunho salvo com sucesso' : 'Solicitação enviada com sucesso',
            id: idSolicitacao
          };
        }
      }

      return {
        sucesso: false,
        mensagem: 'Tipo de formulário não especificado'
      };
    } catch (erro) {
      console.error('Erro ao salvar formulário:', erro);
      return {
        sucesso: false,
        mensagem: erro.message || 'Erro ao salvar dados'
      };
    }
  }

  /**
   * Limpa o formulário
   */
  limpar() {
    this.formElement.reset();
    
    // Remover classes de validação
    Array.from(this.formElement.elements).forEach(campo => {
      campo.classList.remove('is-valid', 'is-invalid');
    });
  }

  /**
   * Manipulador de evento de envio do formulário
   * @param {Event} evento - Evento de submit
   */
  async handleSubmit(evento) {
    evento.preventDefault();

    // Validar formulário
    const validacao = this.validar();
    
    if (!validacao.valido) {
      // Mostrar erros
      this.mostrarErros(validacao.erros);
      
      // Chamar callback de erro
      if (this.options.callbackErro) {
        this.options.callbackErro(validacao.erros);
      }
      
      return;
    }

    try {
      // Salvar formulário
      const resultado = await this.salvar(false); // Salvar como enviado (não rascunho)
      
      // Chamar callback de sucesso
      if (resultado.sucesso && this.options.callbackSucesso) {
        this.options.callbackSucesso(resultado);
      } else if (!resultado.sucesso && this.options.callbackErro) {
        this.options.callbackErro([resultado.mensagem]);
      }
    } catch (erro) {
      console.error('Erro ao processar formulário:', erro);
      
      // Chamar callback de erro
      if (this.options.callbackErro) {
        this.options.callbackErro([erro.message || 'Erro ao processar formulário']);
      }
    }
  }

  /**
   * Manipulador de evento de alteração de campo
   * @param {Event} evento - Evento de change
   */
  handleChange(evento) {
    if (!this.options.validarAoMudar) return;

    const campo = evento.target;
    this.validarCampo(campo);

    // Salvar alterações automaticamente se configurado
    if (this.options.salvarAlteracoes) {
      this.salvarAlteracaoAutomatica();
    }
  }

  /**
   * Manipulador de evento de entrada em campo
   * @param {Event} evento - Evento de input
   */
  handleInput(evento) {
    // Throttle para não validar a cada tecla
    clearTimeout(this._inputTimeout);
    this._inputTimeout = setTimeout(() => {
      this.validarCampo(evento.target);
    }, 500);
  }

  /**
   * Valida um campo específico
   * @param {HTMLElement} campo - Campo a ser validado
   */
  validarCampo(campo) {
    // Skip if it's not a field we care about
    if (!campo.name || campo.disabled) return;

    // Check if it's a required field
    const ehObrigatorio = this.options.camposObrigatorios.includes(campo.name);
    
    if (ehObrigatorio) {
      let valorCampo = '';
      
      if (campo.type === 'checkbox') {
        valorCampo = campo.checked;
      } else if (campo.type === 'radio') {
        const radioSelecionado = this.formElement.querySelector(`input[name="${campo.name}"]:checked`);
        valorCampo = radioSelecionado ? radioSelecionado.value : '';
      } else {
        valorCampo = campo.value.trim();
      }

      if (!valorCampo) {
        campo.classList.add('is-invalid');
        campo.classList.remove('is-valid');
      } else {
        campo.classList.remove('is-invalid');
        campo.classList.add('is-valid');
      }
    }
  }

  /**
   * Salva alterações automaticamente (como rascunho)
   */
  async salvarAlteracaoAutomatica() {
    clearTimeout(this._autoSaveTimeout);
    this._autoSaveTimeout = setTimeout(async () => {
      await this.salvar(true);
    }, 1000);
  }

  /**
   * Mostra erros de validação
   * @param {Array} erros - Lista de mensagens de erro
   */
  mostrarErros(erros) {
    // Verificar se existe um container de erros
    let containerErros = document.getElementById(`${this.formId}-erros`);
    
    if (!containerErros) {
      // Criar container de erros
      containerErros = document.createElement('div');
      containerErros.id = `${this.formId}-erros`;
      containerErros.className = 'alert alert-danger mt-3';
      containerErros.setAttribute('role', 'alert');
      this.formElement.before(containerErros);
    }

    // Limpar container
    containerErros.innerHTML = '';
    
    // Adicionar título
    const titulo = document.createElement('h5');
    titulo.textContent = 'Por favor, corrija os seguintes erros:';
    containerErros.appendChild(titulo);
    
    // Adicionar lista de erros
    const lista = document.createElement('ul');
    erros.forEach(erro => {
      const item = document.createElement('li');
      item.textContent = erro;
      lista.appendChild(item);
    });
    containerErros.appendChild(lista);
    
    // Scroll para o container
    containerErros.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Configura o callback de sucesso
   * @param {Function} callback - Função a ser chamada em caso de sucesso
   * @returns {FormHandler} - Instância para encadeamento
   */
  onSucesso(callback) {
    this.options.callbackSucesso = callback;
    return this;
  }

  /**
   * Configura o callback de erro
   * @param {Function} callback - Função a ser chamada em caso de erro
   * @returns {FormHandler} - Instância para encadeamento
   */
  onErro(callback) {
    this.options.callbackErro = callback;
    return this;
  }

  /**
   * Configura o callback de validação
   * @param {Function} callback - Função a ser chamada para validação personalizada
   * @returns {FormHandler} - Instância para encadeamento
   */
  onValidar(callback) {
    this.options.callbackValidacao = callback;
    return this;
  }
}

export default FormHandler; 