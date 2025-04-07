# Sistema Integrado de Regulação UBS

Sistema unificado que integra as funcionalidades da UBS Local e da Central de Regulação em uma única aplicação, mantendo os recursos únicos de cada sistema.

## Estrutura do Projeto

O projeto foi reorganizado para uma arquitetura modular e unificada:

```
src/
├── assets/               # Recursos estáticos (imagens, ícones, etc.)
├── compartilhado/        # Componentes e utilitários compartilhados
│   ├── componentes/      # Componentes reutilizáveis
│   ├── templates/        # Templates HTML (cabeçalho, rodapé, navegação)
│   └── utils/            # Funções utilitárias
├── core/                 # Núcleo do sistema
│   ├── api.js            # Serviço centralizado de API
│   ├── auth.js           # Gerenciamento de autenticação
│   ├── config.js         # Configurações do sistema
│   ├── integracao.js     # Integração entre os sistemas
│   ├── main.js           # Ponto de entrada principal
│   └── storage.js        # Gerenciamento de armazenamento
├── estilos/              # Estilos CSS organizados
│   ├── central/          # Estilos específicos da Central
│   ├── comum/            # Estilos globais compartilhados
│   └── ubs/              # Estilos específicos da UBS
├── modulos/              # Módulos específicos
│   ├── central/          # Funcionalidades da Central de Regulação
│   │   └── scripts/      # Scripts específicos da Central
│   └── ubs/              # Funcionalidades da UBS Local
│       ├── formularios/  # Formulários específicos da UBS
│       └── scripts/      # Scripts específicos da UBS
└── paginas/              # Páginas do sistema
    ├── central/          # Páginas da Central de Regulação
    ├── comuns/           # Páginas compartilhadas
    └── ubs/              # Páginas da UBS Local
```

## Arquivos Renomeados

Os arquivos foram renomeados para seguir uma nomenclatura mais clara e consistente:

### Páginas:
- `sistema-ubs.html` → `paginas/ubs/ubs-painel.html`
- `sistema-central-regulacao.html` → `paginas/central/central-painel.html`
- `login-central-regulacao.html` → `paginas/comuns/login.html`
- `index.html` → `paginas/comuns/home.html`

### Estilos:
- `style.css` → `estilos/ubs/ubs-estilo.css`
- `style-central.css` → `estilos/central/central-estilo.css`
- (Novo) `estilos/comum/estilos-globais.css`

### Scripts:
- `ubs-scripts.js` → `modulos/ubs/scripts/ubs-funcoes.js`
- `sistema-central-regulacao.js` → `modulos/central/scripts/central-funcoes.js`

### Componentes:
- `includes/header.html` → `compartilhado/templates/cabecalho.html`
- `includes/footer.html` → `compartilhado/templates/rodape.html`
- `includes/navigation.html` → `compartilhado/templates/navegacao.html`

## Serviços Centralizados

O sistema agora utiliza serviços centralizados:

- **API Service**: Centraliza todas as chamadas de API
- **Auth Service**: Gerencia autenticação e controle de acesso
- **Storage Service**: Gerencia o armazenamento local de dados
- **Integração**: Integra as funcionalidades dos dois sistemas

## Como Executar

Para executar o sistema integrado:

1. Abra o arquivo `src/index.html` no navegador
2. Faça login com uma das credenciais a seguir:

| Usuário    | Senha    | Perfil     | Descrição                          |
|------------|----------|------------|-----------------------------------|
| ubs        | ubs123   | ubs        | Acesso à interface da UBS         |
| regulador  | reg123   | regulador  | Acesso à Central de Regulação     |
| admin      | admin123 | admin      | Acesso completo a todos os módulos |

## Funcionalidades Preservadas

### UBS Local
- Formulários específicos para solicitações (ressonância, mamografia, etc.)
- Interface para criação e gerenciamento de solicitações
- Dashboard com visão focada em solicitações da unidade

### Central de Regulação
- Fila de regulação para análise de solicitações
- Gerenciamento de cotas de procedimentos
- Dashboard com visão global do sistema de regulação
- Funções administrativas (usuários, logs, etc.)

## Integração

Os sistemas agora compartilham:
- Autenticação unificada
- Base de dados comum
- Notificações entre sistemas
- Navigation unificada
- Visual padronizado

## Próximos Passos

- Implementar APIs reais para substituir os mocks
- Adicionar mais validações nos formulários
- Melhorar a responsividade para dispositivos móveis
- Implementar PWA para uso offline 