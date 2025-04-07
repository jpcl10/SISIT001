/**
 * Etapa1.js
 * Componente que gerencia a primeira etapa da solicitação (dados do paciente)
 */

import { salvarDadosEtapa1, obterDadosEtapa1 } from '../scripts/storage.js';
import { validarFormulario } from '../scripts/validacoes.js';
import { mostrarNotificacao } from '../scripts/utils.js';

export default class Etapa1 {
  constructor() {
    this.dadosSalvos = obterDadosEtapa1();
  }

  async render() {
    return `
      <section class="card">
        <h2>Etapa 1: Dados do Paciente e Unidade</h2>
        <p>Preencha os dados básicos do paciente e da unidade de saúde para prosseguir.</p>
        
        <form id="formEtapa1">
          <div class="secao-form">
            <h3>Dados da Unidade de Saúde</h3>
            
            <div class="campo-grupo">
              <div class="campo">
                <label for="nomeUnidade" class="obrigatorio">Nome da Unidade</label>
                <input type="text" id="nomeUnidade" name="nomeUnidade" required>
              </div>
              
              <div class="campo">
                <label for="cnesUnidade" class="obrigatorio">CNES</label>
                <input type="text" id="cnesUnidade" name="cnesUnidade" 
                      required pattern="\\d{7}" maxlength="7">
              </div>
            </div>
            
            <div class="campo-grupo">
              <div class="campo">
                <label for="enderecoUnidade">Endereço</label>
                <input type="text" id="enderecoUnidade" name="enderecoUnidade">
              </div>
              
              <div class="campo">
                <label for="telefoneUnidade">Telefone</label>
                <input type="tel" id="telefoneUnidade" name="telefoneUnidade">
              </div>
            </div>
          </div>
          
          <div class="secao-form">
            <h3>Dados do Paciente</h3>
            
            <div class="campo-grupo">
              <div class="campo">
                <label for="nomePaciente" class="obrigatorio">Nome Completo</label>
                <input type="text" id="nomePaciente" name="nomePaciente" required>
              </div>
            </div>
            
            <div class="campo-grupo">
              <div class="campo">
                <label for="dataNascimento" class="obrigatorio">Data de Nascimento</label>
                <input type="date" id="dataNascimento" name="dataNascimento" required>
              </div>
              
              <div class="campo">
                <label for="cpfPaciente">CPF</label>
                <input type="text" id="cpfPaciente" name="cpfPaciente" 
                      pattern="\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{11}">
              </div>
              
              <div class="campo">
                <label for="cnsPaciente" class="obrigatorio">CNS</label>
                <input type="text" id="cnsPaciente" name="cnsPaciente" 
                      required pattern="\\d{15}" maxlength="15">
              </div>
            </div>
            
            <div class="campo-grupo">
              <div class="campo">
                <label for="enderecoPaciente" class="obrigatorio">Endereço</label>
                <input type="text" id="enderecoPaciente" name="enderecoPaciente" required>
              </div>
              
              <div class="campo">
                <label for="telefonePaciente">Telefone</label>
                <input type="tel" id="telefonePaciente" name="telefonePaciente">
              </div>
            </div>
          </div>
          
          <div class="secao-form">
            <h3>Tipo de Procedimento</h3>
            <div class="campo">
              <label for="seletorProcedimento" class="obrigatorio">Selecione o procedimento</label>
              <select id="seletorProcedimento" name="tipoProcedimento" required>
                <option value="">Selecione...</option>
                <option value="ressonancia">Ressonância Magnética</option>
                <option value="mamografia">Mamografia</option>
                <option value="lme">LME - Laudo para Medicação Especializada</option>
                <option value="aih">AIH - Autorização para Internação Hospitalar</option>
                <option value="ambulatorial">Procedimento Ambulatorial</option>
                <option value="especialidades">Consulta de Especialidade</option>
              </select>
            </div>
          </div>
          
          <div id="mensagemValidacao" class="mensagem erro" style="display: none;">
            Por favor, preencha todos os campos obrigatórios antes de prosseguir.
          </div>
          
          <div class="botoes-navegacao">
            <button type="button" class="btn secundario" id="btnVoltar">Voltar</button>
            <button type="button" class="btn secundario" id="btnSalvarRascunho">Salvar Rascunho</button>
            <button type="button" class="btn primario" id="btnProsseguir">Prosseguir</button>
          </div>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('formEtapa1');
    const btnProsseguir = document.getElementById('btnProsseguir');
    const btnSalvarRascunho = document.getElementById('btnSalvarRascunho');
    const btnVoltar = document.getElementById('btnVoltar');
    const mensagemValidacao = document.getElementById('mensagemValidacao');
    const seletorProcedimento = document.getElementById('seletorProcedimento');
    
    // Carregar dados salvos (se existirem)
    this.carregarDadosSalvos(form);
    
    // Handler para o botão Prosseguir
    btnProsseguir.addEventListener('click', () => {
      // Validar formulário
      const resultadoValidacao = validarFormulario(form);
      
      if (resultadoValidacao.valido) {
        // Salvar dados
        const formData = new FormData(form);
        const dados = Object.fromEntries(formData.entries());
        
        salvarDadosEtapa1(dados);
        
        // Redirecionar para o formulário específico
        const tipoProcedimento = seletorProcedimento.value;
        if (tipoProcedimento) {
          window.location.hash = `#/formulario/${tipoProcedimento}`;
        } else {
          mensagemValidacao.textContent = 'Selecione um tipo de procedimento para prosseguir.';
          mensagemValidacao.style.display = 'block';
        }
      } else {
        mensagemValidacao.style.display = 'block';
      }
    });
    
    // Handler para salvar rascunho
    btnSalvarRascunho.addEventListener('click', () => {
      const formData = new FormData(form);
      const dados = Object.fromEntries(formData.entries());
      
      salvarDadosEtapa1(dados);
      mostrarNotificacao('Rascunho salvo com sucesso!', 'sucesso');
    });
    
    // Handler para o botão voltar
    btnVoltar.addEventListener('click', () => {
      window.history.back();
    });
  }

  // Função para carregar dados salvos
  carregarDadosSalvos(form) {
    try {
      if (Object.keys(this.dadosSalvos).length > 0) {
        // Preencher campos com dados salvos
        Object.keys(this.dadosSalvos).forEach(key => {
          if (key !== '_timestamp' && key !== '_ultimaAtualizacao') {
            const campo = form.querySelector(`[name="${key}"]`);
            if (campo) {
              campo.value = this.dadosSalvos[key];
            }
          }
        });
        
        // Se há dados salvos e tipo de procedimento, mostrar mensagem
        if (this.dadosSalvos.tipoProcedimento) {
          mostrarNotificacao('Dados carregados do rascunho anterior', 'informacao');
        }
      }
    } catch (erro) {
      console.error('Erro ao carregar dados salvos:', erro);
    }
  }
} 