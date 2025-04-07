# Sistema Integrado de Regulação UBS

Sistema que integra o fluxo entre Unidades Básicas de Saúde (UBS) e a Central de Regulação, facilitando o gerenciamento de solicitações e encaminhamentos de pacientes.

## Estrutura do Projeto

O projeto segue uma arquitetura modular e organizada:

```
projeto/
├── public/                  # Arquivos públicos acessíveis pelo navegador
│   ├── assets/              # Recursos estáticos
│   │   ├── images/          # Imagens
│   │   ├── fonts/           # Fontes
│   │   └── icons/           # Ícones e favicons
│   ├── css/                 # Estilos CSS
│   ├── js/                  # JavaScript do lado do cliente
│   └── *.html               # Páginas HTML
│
├── src/                     # Código-fonte do sistema
│   ├── api/                 # Definições de API
│   │   └── routes.js        # Rotas da API
│   ├── components/          # Componentes reutilizáveis
│   ├── models/              # Modelos de dados
│   ├── services/            # Serviços do sistema
│   ├── utils/               # Utilitários e helpers
│   │   └── config.js        # Configurações do sistema
│   ├── styles/              # Estilos organizados por módulo
│   └── hooks/               # Hooks personalizados
│
├── server.js                # Servidor Node.js/Express
├── package.json             # Dependências e scripts
└── README.md                # Documentação do projeto
```

## Organização do Código

O código está organizado seguindo os princípios de responsabilidade única e coesão:

- **Modelos (models/)**: Definem a estrutura de dados das entidades do sistema, como Solicitação.
- **Serviços (services/)**: Encapsulam a lógica de negócio em serviços específicos.
- **API (api/)**: Gerencia as rotas e endpoints da aplicação.
- **Componentes (components/)**: Contém componentes reutilizáveis da interface.
- **Utilitários (utils/)**: Funções auxiliares e helpers usados em todo o sistema.

## Tecnologias Utilizadas

- **Backend**: Node.js, Express
- **Frontend**: HTML5, CSS3, JavaScript
- **Autenticação**: Sistema de tokens

## Instalação

1. Clone o repositório:
   ```
   git clone [URL_DO_REPOSITORIO]
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Execute o servidor:
   ```
   npm start
   ```

4. Acesse a aplicação em:
   ```
   http://localhost:5555
   ```

## Desenvolvimento

Para iniciar o servidor em modo de desenvolvimento com recarga automática:

```
npm run dev
```

## Fluxo de Trabalho

1. **UBS**: 
   - Cadastro de solicitações para especialidades
   - Acompanhamento do status dos encaminhamentos

2. **Central de Regulação**:
   - Recebimento e análise das solicitações
   - Classificação por prioridade
   - Agendamento e encaminhamento

## Usuários de Teste

| Usuário    | Senha    | Perfil     | Unidade              |
|------------|----------|------------|----------------------|
| ubs        | ubs123   | ubs        | UBS Central          |
| regulador  | reg123   | regulador  | Central de Regulação |
| admin      | admin123 | admin      | Central de Regulação |

## Licença

MIT

---

Desenvolvido pela Equipe de Desenvolvimento - Sistema de Regulação UBS 