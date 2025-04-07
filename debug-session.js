/**
 * Script de verificação de integridade de sessão
 * Este script ajuda a diagnosticar problemas de sessionStorage
 */

(function() {
  // Verificar se o sessionStorage está disponível
  function verificarSessionStorage() {
    try {
      // Teste de gravação e leitura
      sessionStorage.setItem('teste-sessao', 'funcionando');
      const valorTeste = sessionStorage.getItem('teste-sessao');
      sessionStorage.removeItem('teste-sessao');
      
      if (valorTeste === 'funcionando') {
        console.log('✅ SessionStorage está funcionando corretamente');
        return true;
      } else {
        console.error('❌ SessionStorage falhou no teste de leitura');
        return false;
      }
    } catch (e) {
      console.error('❌ Erro ao acessar SessionStorage:', e);
      return false;
    }
  }

  // Verificar dados do usuário na sessão
  function verificarDadosUsuario() {
    try {
      const usuarioStr = sessionStorage.getItem('usuarioAtual');
      if (!usuarioStr) {
        console.warn('⚠️ Nenhum usuário logado na sessão');
        return null;
      }
      
      const usuario = JSON.parse(usuarioStr);
      console.log('✅ Dados do usuário na sessão:', {
        nome: usuario.nome, 
        perfil: usuario.perfil,
        unidade: usuario.unidade
      });
      
      return usuario;
    } catch (e) {
      console.error('❌ Erro ao verificar dados do usuário:', e);
      return null;
    }
  }

  // Verificar problema de codificação de string
  function verificarCodificacaoJSON() {
    try {
      const objTeste = {
        nome: "Usuário Teste",
        perfil: "teste",
        unidade: "Unidade Teste"
      };
      
      sessionStorage.setItem('teste-json', JSON.stringify(objTeste));
      const strRecuperada = sessionStorage.getItem('teste-json');
      const objRecuperado = JSON.parse(strRecuperada);
      
      sessionStorage.removeItem('teste-json');
      
      if (objRecuperado && objRecuperado.nome === objTeste.nome) {
        console.log('✅ Codificação JSON funcionando corretamente');
        return true;
      } else {
        console.error('❌ Problema na codificação/decodificação JSON');
        return false;
      }
    } catch (e) {
      console.error('❌ Erro no teste de codificação JSON:', e);
      return false;
    }
  }

  // Adicionar evento para verificar a sessão ao carregar a página
  document.addEventListener('DOMContentLoaded', function() {
    console.group('🔍 Diagnóstico de Sessão');
    
    // Verificar se sessionStorage funciona
    const storageOk = verificarSessionStorage();
    const jsonOk = verificarCodificacaoJSON();
    
    if (storageOk && jsonOk) {
      // Verificar dados do usuário
      const usuario = verificarDadosUsuario();
      
      // Verificar a URL atual
      const paginaAtual = window.location.pathname.split('/').pop();
      console.log('📄 Página atual:', paginaAtual);
      
      // Detectar possíveis problemas
      if (usuario) {
        // Se estiver na página de login com usuário na sessão
        if (paginaAtual.includes('login-central-regulacao.html')) {
          console.warn('⚠️ Usuário já logado, mas está na página de login');
        }
        
        // Verificar se a página corresponde ao perfil
        const perfisUBS = ['ubs', 'medico', 'atendente'];
        if (paginaAtual.includes('sistema-ubs.html') && !perfisUBS.includes(usuario.perfil) && usuario.perfil !== 'admin') {
          console.error('❌ Usuário não autorizado para acessar a página UBS');
        } else if (paginaAtual.includes('sistema-central-regulacao.html') && perfisUBS.includes(usuario.perfil)) {
          console.warn('⚠️ Usuário UBS tentando acessar página da Central de Regulação');
        }
      } else if (!paginaAtual.includes('login-central-regulacao.html')) {
        // Se não houver usuário e não estiver na página de login
        console.error('❌ Não há usuário logado. Deveria estar na página de login');
      }
    } else {
      console.error('❌ Problemas com o armazenamento de sessão detectados. O login pode falhar.');
      
      // Adicionar alerta visual na página
      if (document.body) {
        const alertaDiv = document.createElement('div');
        alertaDiv.style.position = 'fixed';
        alertaDiv.style.top = '10px';
        alertaDiv.style.left = '10px';
        alertaDiv.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
        alertaDiv.style.color = 'white';
        alertaDiv.style.padding = '10px';
        alertaDiv.style.borderRadius = '5px';
        alertaDiv.style.zIndex = '9999';
        alertaDiv.style.fontSize = '14px';
        alertaDiv.innerHTML = '⚠️ Problema detectado com o armazenamento de sessão. O login pode não funcionar corretamente.';
        
        document.body.appendChild(alertaDiv);
        
        // Remover após 5 segundos
        setTimeout(() => {
          if (document.body.contains(alertaDiv)) {
            document.body.removeChild(alertaDiv);
          }
        }, 5000);
      }
    }
    
    console.groupEnd();
  });
})(); 