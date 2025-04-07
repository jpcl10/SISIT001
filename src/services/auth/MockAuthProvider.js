/**
 * Provedor de Autenticação Mock
 * 
 * Fornece autenticação simulada para desenvolvimento e testes
 */

class MockAuthProvider {
  constructor() {
    // Lista de usuários para teste
    this.usuarios = [
      { id: 1, nome: 'Dr. Silva', usuario: 'ubs', senha: 'ubs123', perfil: 'ubs', unidade: 'UBS Central' },
      { id: 2, nome: 'Dr. Santos', usuario: 'regulador', senha: 'reg123', perfil: 'regulador', unidade: 'Central de Regulação' },
      { id: 3, nome: 'Administrador', usuario: 'admin', senha: 'admin123', perfil: 'admin', unidade: 'Central de Regulação' }
    ];
  }

  /**
   * Simula login no modo de desenvolvimento
   * @param {string} usuario - Nome de usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise<Object>} - Informações do usuário logado
   */
  async login(usuario, senha) {
    // Buscar usuário
    const usuarioEncontrado = this.usuarios.find(u => 
      u.usuario === usuario && u.senha === senha
    );
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (usuarioEncontrado) {
          // Criar cópia sem senha
          const { senha, ...dadosUsuario } = usuarioEncontrado;
          
          // Gerar token simulado
          const token = btoa(`${usuario}:${Date.now()}`);
          
          // Definir no serviço
          this.token = token;
          
          resolve(dadosUsuario);
        } else {
          reject(new Error('Usuário ou senha inválidos'));
        }
      }, 300); // Simular delay de rede
    });
  }

  /**
   * Verifica se um usuário tem determinada permissão
   * @param {string} perfil - Perfil do usuário
   * @param {string} permissao - Permissão a verificar
   * @returns {boolean} - Se o usuário tem a permissão
   */
  verificarPermissao(perfil, permissao) {
    // Implementação simplificada de permissões
    const permissoes = {
      admin: ['*'], // Admin pode tudo
      regulador: ['visualizar_solicitacoes', 'atualizar_status', 'visualizar_estatisticas'],
      ubs: ['criar_solicitacao', 'visualizar_solicitacoes', 'editar_solicitacao', 'visualizar_historico']
    };

    const permissoesUsuario = permissoes[perfil] || [];
    return permissoesUsuario.includes('*') || permissoesUsuario.includes(permissao);
  }
}

module.exports = MockAuthProvider; 