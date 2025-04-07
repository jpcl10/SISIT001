#!/bin/bash
#
# Script de Migração Automatizada - Sistema Integrado de Regulação UBS
# Este script realiza a migração completa do sistema para um HD externo
# com verificações de integridade e backups de segurança
#

set -e  # Encerra o script se algum comando falhar

# Definições de cores para output
VERMELHO='\033[0;31m'
VERDE='\033[0;32m'
AMARELO='\033[0;33m'
AZUL='\033[0;34m'
RESET='\033[0m'

# Definição de variáveis
DIRETORIO_ORIGEM="/home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente"
HD_DESTINO="/media/paulomv/HD_EXTERNO" # Altere conforme necessário
DIR_DESTINO="$HD_DESTINO/sistema_regulacao_ubs"
DIR_LOGS="/tmp/migracao_sistema_ubs"
DATA_HORA=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$DIR_LOGS/migracao_${DATA_HORA}.log"

# Função para exibir mensagens
log() {
  local tipo=$1
  local mensagem=$2
  
  case $tipo in
    "info")
      echo -e "${AZUL}[INFO]${RESET} $mensagem"
      ;;
    "sucesso")
      echo -e "${VERDE}[SUCESSO]${RESET} $mensagem"
      ;;
    "aviso")
      echo -e "${AMARELO}[AVISO]${RESET} $mensagem"
      ;;
    "erro")
      echo -e "${VERMELHO}[ERRO]${RESET} $mensagem"
      ;;
  esac
  
  echo "$(date +"%Y-%m-%d %H:%M:%S") [$tipo] $mensagem" >> "$LOG_FILE"
}

# Função para confirmar ações
confirmar() {
  local mensagem=$1
  echo -e "${AMARELO}$mensagem [s/N]${RESET}"
  read resposta
  
  if [[ "$resposta" != "s" && "$resposta" != "S" ]]; then
    log "info" "Operação cancelada pelo usuário"
    exit 0
  fi
}

# Função para verificar espaço em disco
verificar_espaco() {
  local origem=$1
  local destino=$2
  
  log "info" "Verificando espaço em disco..."
  
  # Tamanho da origem (excluindo node_modules)
  tamanho_origem=$(du -sh --exclude=node_modules "$origem" | cut -f1)
  espaco_livre_destino=$(df -h "$destino" | grep -v Filesystem | awk '{print $4}')
  
  log "info" "Tamanho do sistema: $tamanho_origem"
  log "info" "Espaço livre no destino: $espaco_livre_destino"
  
  # A verificação exata requereria conversão de unidades, que é complicada em shell
  # Então apenas informamos e solicitamos confirmação
  confirmar "Continuar com a migração com o espaço disponível?"
}

# Função para criar estrutura de logs
preparar_estrutura() {
  log "info" "Preparando estrutura de diretórios..."
  
  mkdir -p "$DIR_LOGS"
  mkdir -p "$DIR_DESTINO/registros_migracao"
  
  log "sucesso" "Estrutura de diretórios preparada"
}

# Função para limpar arquivos desnecessários
limpar_arquivos() {
  log "info" "Limpando arquivos desnecessários..."
  
  # Solicitar confirmação antes de remover node_modules
  confirmar "Remover a pasta node_modules para acelerar a migração? Ela será reinstalada posteriormente."
  
  # Remover node_modules
  if [ -d "$DIRETORIO_ORIGEM/node_modules" ]; then
    rm -rf "$DIRETORIO_ORIGEM/node_modules"
    log "sucesso" "Diretório node_modules removido"
  fi
  
  # Remover logs e caches
  find "$DIRETORIO_ORIGEM" -name "*.log" -delete
  find "$DIRETORIO_ORIGEM" -name ".DS_Store" -delete
  find "$DIRETORIO_ORIGEM" -name "Thumbs.db" -delete
  
  # Remover caches e builds
  find "$DIRETORIO_ORIGEM" -name ".cache" -type d -exec rm -rf {} \; 2>/dev/null || true
  find "$DIRETORIO_ORIGEM" -name "dist" -type d -exec rm -rf {} \; 2>/dev/null || true
  find "$DIRETORIO_ORIGEM" -name "build" -type d -exec rm -rf {} \; 2>/dev/null || true
  
  log "sucesso" "Limpeza de arquivos concluída"
}

# Função para gerar manifesto e metadados
gerar_manifesto() {
  log "info" "Gerando manifesto de arquivos e metadados..."
  
  # Gerar manifesto com SHA256
  find "$DIRETORIO_ORIGEM" -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    | sort \
    | xargs sha256sum > "$DIR_LOGS/manifesto_sha256.txt"
  
  # Listar diretórios
  find "$DIRETORIO_ORIGEM" -type d \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    | sort > "$DIR_LOGS/estrutura_diretorios.txt"
  
  # Gerar metadados
  {
    echo "Data e hora da migração: $(date)"
    echo "Versão do sistema: $(grep -m1 version "$DIRETORIO_ORIGEM/package.json" | sed 's/[",]//g' | sed 's/version://g' | sed 's/ //g')"
    echo "Total de arquivos: $(find "$DIRETORIO_ORIGEM" -type f -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l)"
    echo "Tamanho total: $(du -sh "$DIRETORIO_ORIGEM" --exclude=node_modules | cut -f1)"
    echo "Sistema operacional: $(uname -a)"
    echo "Usuário que realizou a migração: $(whoami)"
  } > "$DIR_LOGS/metadados.txt"
  
  log "sucesso" "Manifesto e metadados gerados com sucesso"
}

# Função para executar a cópia dos arquivos
copiar_arquivos() {
  log "info" "Iniciando cópia dos arquivos para o destino..."
  
  # Verificar se o HD externo está montado
  if [ ! -d "$HD_DESTINO" ]; then
    log "erro" "HD externo não encontrado em $HD_DESTINO. Verifique se está montado corretamente."
    exit 1
  fi
  
  # Criar diretório de destino
  mkdir -p "$DIR_DESTINO"
  
  # Copiar arquivos com rsync
  rsync -avh --progress \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=*.log \
    --log-file="$DIR_LOGS/rsync_log.txt" \
    "$DIRETORIO_ORIGEM/" \
    "$DIR_DESTINO/"
  
  # Copiar também os arquivos de manifesto e logs
  cp -r "$DIR_LOGS/" "$DIR_DESTINO/registros_migracao/"
  
  log "sucesso" "Arquivos copiados com sucesso para o destino"
}

# Função para verificar integridade dos arquivos
verificar_integridade() {
  log "info" "Verificando integridade dos arquivos copiados..."
  
  # Mudar para o diretório de destino
  cd "$DIR_DESTINO"
  
  # Gerar novo manifesto para comparação
  find . -type f \
    -not -path "*/registros_migracao/*" \
    | sort \
    | xargs sha256sum > "./registros_migracao/manifesto_destino.txt"
  
  # Comparar manifestos
  diff -u "./registros_migracao/manifesto_sha256.txt" "./registros_migracao/manifesto_destino.txt" > "./registros_migracao/resultado_verificacao.txt"
  
  # Verificar resultado
  if [ $? -eq 0 ]; then
    log "sucesso" "Verificação completa: todos os arquivos migrados com sucesso e integridade preservada."
    echo "Verificação completa: todos os arquivos migrados com sucesso e integridade preservada." > "./registros_migracao/status_migracao.txt"
  else
    log "erro" "ATENÇÃO: Foram encontradas diferenças na verificação de integridade. Verifique o arquivo resultado_verificacao.txt"
    echo "ATENÇÃO: Foram encontradas diferenças na verificação de integridade. Verifique o arquivo resultado_verificacao.txt" > "./registros_migracao/status_migracao.txt"
    
    # Mesmo com diferenças, continuamos o processo
    confirmar "Continuar mesmo com diferenças na verificação de integridade?"
  fi
}

# Função para instalar dependências e verificar o sistema
validar_aplicacao() {
  log "info" "Validando aplicação no destino..."
  
  # Verificar a integridade do banco de dados
  if [ -f "$DIR_DESTINO/db/db.json" ]; then
    if command -v jq >/dev/null 2>&1; then
      cat "$DIR_DESTINO/db/db.json" | jq empty >/dev/null 2>&1
      if [ $? -eq 0 ]; then
        log "sucesso" "Banco de dados válido"
        cp "$DIR_DESTINO/db/db.json" "$DIR_DESTINO/registros_migracao/db_backup.json"
      else
        log "erro" "ERRO: Banco de dados com formato JSON inválido"
        confirmar "Continuar mesmo com o banco de dados inválido?"
      fi
    else
      log "aviso" "Ferramenta 'jq' não encontrada. Pulando verificação do banco de dados."
    fi
  else
    log "aviso" "Arquivo de banco de dados não encontrado em db/db.json"
  fi
  
  # Perguntar se deseja instalar dependências
  confirmar "Instalar dependências do Node.js agora? Isso pode demorar alguns minutos."
  
  cd "$DIR_DESTINO"
  npm install
  
  log "sucesso" "Dependências instaladas com sucesso"
  
  # Perguntar se deseja testar a inicialização
  confirmar "Testar inicialização do sistema? Isso iniciará o servidor em modo de teste."
  
  # Usar nohup para executar em segundo plano
  log "info" "Iniciando servidor em modo de teste por 10 segundos..."
  nohup node server.js > "$DIR_DESTINO/registros_migracao/server_test.log" 2>&1 &
  
  # Capturar PID do processo
  SERVER_PID=$!
  
  # Aguardar 5 segundos para inicialização
  sleep 5
  
  # Testar se o servidor está respondendo
  if command -v curl >/dev/null 2>&1; then
    curl http://localhost:5555/api/status -s > "$DIR_DESTINO/registros_migracao/api_teste.json"
    if [ $? -eq 0 ]; then
      log "sucesso" "Servidor respondendo corretamente"
    else
      log "erro" "Servidor não está respondendo corretamente"
    fi
  else
    log "aviso" "Ferramenta 'curl' não encontrada. Pulando teste de API."
  fi
  
  # Aguardar mais 5 segundos e matar o processo
  sleep 5
  kill $SERVER_PID
  
  log "info" "Teste de servidor finalizado"
}

# Função para gerar documentação
gerar_documentacao() {
  log "info" "Gerando documentação da migração..."
  
  cd "$DIR_DESTINO"
  
  # Criar relatório de migração
  {
    echo "# Relatório de Migração do Sistema Integrado de Regulação UBS"
    echo ""
    echo "## Informações Gerais"
    echo ""
    cat "./registros_migracao/metadados.txt"
    echo ""
    echo "## Status da Migração"
    echo ""
    cat "./registros_migracao/status_migracao.txt"
    echo ""
    echo "## Arquivos Migrados"
    echo ""
    echo "Total de arquivos: $(find . -type f -not -path "*/node_modules/*" -not -path "*/registros_migracao/*" | wc -l)"
    echo "Total de diretórios: $(find . -type d -not -path "*/node_modules/*" -not -path "*/registros_migracao/*" | wc -l)"
    echo ""
    echo "## Estrutura de Diretórios"
    echo '```'
    find . -type d -not -path "*/node_modules/*" -not -path "*/registros_migracao/*" -maxdepth 3 | sort
    echo '```'
    echo ""
    echo "## Instruções para Inicialização"
    echo ""
    echo "1. Instalar dependências: \`npm install\`"
    echo "2. Iniciar servidor: \`npm start\`"
    echo "3. Acessar: http://localhost:5555"
  } > "./registros_migracao/relatorio_migracao.md"
  
  # Verificar existência de arquivos críticos
  for arquivo in server.js package.json sistema-central-regulacao.html sistema-ubs.html
  do
    [ -f $arquivo ] && echo "$arquivo: OK" || echo "$arquivo: FALTANDO!"
  done > "./registros_migracao/verificacao_arquivos_criticos.txt"
  
  log "sucesso" "Documentação gerada com sucesso"
}

# Função para criar backup adicional
criar_backup_adicional() {
  log "info" "Criando backup adicional compactado..."
  
  cd "$HD_DESTINO"
  
  # Criar arquivo tar.gz
  tar -czf sistema_regulacao_ubs_backup_${DATA_HORA}.tar.gz \
    --exclude="node_modules" \
    --exclude="registros_migracao" \
    sistema_regulacao_ubs/
  
  log "sucesso" "Backup adicional criado: sistema_regulacao_ubs_backup_${DATA_HORA}.tar.gz"
  
  # Verificar se rclone está instalado para enviar para a nuvem
  if command -v rclone >/dev/null 2>&1; then
    confirmar "Enviar backup para armazenamento em nuvem usando rclone?"
    
    # Listar configurações rclone disponíveis
    echo "Configurações rclone disponíveis:"
    rclone listremotes
    
    echo "Digite o nome da configuração rclone a ser usada (ex: gdrive:):"
    read remote_config
    
    if [ -n "$remote_config" ]; then
      rclone copy "sistema_regulacao_ubs_backup_${DATA_HORA}.tar.gz" "${remote_config}backups/sistema_ubs/"
      if [ $? -eq 0 ]; then
        log "sucesso" "Backup enviado para a nuvem com sucesso"
      else
        log "erro" "Falha ao enviar backup para a nuvem"
      fi
    else
      log "aviso" "Nenhuma configuração rclone fornecida. Pulando upload."
    fi
  else
    log "aviso" "Ferramenta 'rclone' não encontrada. Pulando backup em nuvem."
  fi
}

# Função para apresentar checklist final
checklist_final() {
  log "info" "Gerando checklist final..."
  
  echo -e "\n${AZUL}=== Checklist Final de Migração ===${RESET}\n"
  
  # Verificar itens do checklist
  local itens=(
    "Sistema limpo e preparado para migração"
    "Manifesto de arquivos gerado e validado"
    "Cópia completa realizada para o HD externo"
    "Verificação de integridade confirmada"
    "Dependências instaladas no novo ambiente"
    "Testes de inicialização bem-sucedidos"
    "Documentação completa gerada"
    "Backup adicional realizado"
    "Plano de contingência revisado"
    "Relatório final de migração aprovado"
  )
  
  local respostas=()
  
  for item in "${itens[@]}"; do
    echo -e "${AMARELO}$item${RESET} [s/N]"
    read resp
    
    if [[ "$resp" == "s" || "$resp" == "S" ]]; then
      respostas+=("✅ $item")
      echo -e "${VERDE}✅ $item${RESET}"
    else
      respostas+=("❌ $item")
      echo -e "${VERMELHO}❌ $item${RESET}"
    fi
  done
  
  # Salvar checklist no relatório
  {
    echo "# Checklist Final - $(date)"
    echo ""
    for resp in "${respostas[@]}"; do
      echo "- $resp"
    done
  } > "$DIR_DESTINO/registros_migracao/checklist_final.md"
  
  log "sucesso" "Checklist final gerado em registros_migracao/checklist_final.md"
}

# Função principal
main() {
  echo -e "\n${AZUL}=== Sistema de Migração Automatizada - Sistema Integrado de Regulação UBS ===${RESET}\n"
  
  log "info" "Iniciando processo de migração automatizada..."
  
  # Perguntar antes de continuar
  confirmar "Este script realizará a migração completa do Sistema Integrado de Regulação UBS para um HD externo. Continuar?"
  
  # Verificar destino da migração
  echo -e "${AMARELO}O destino da migração está configurado para: $DIR_DESTINO${RESET}"
  confirmar "O caminho do HD externo está correto?"
  
  # Executar cada etapa
  verificar_espaco "$DIRETORIO_ORIGEM" "$HD_DESTINO"
  preparar_estrutura
  limpar_arquivos
  gerar_manifesto
  copiar_arquivos
  verificar_integridade
  validar_aplicacao
  gerar_documentacao
  criar_backup_adicional
  checklist_final
  
  # Finalização
  log "sucesso" "Processo de migração concluído com sucesso!"
  echo -e "\n${VERDE}Migração concluída com sucesso! Verifique o relatório em:${RESET}"
  echo -e "${AZUL}$DIR_DESTINO/registros_migracao/relatorio_migracao.md${RESET}\n"
  
  echo -e "Obrigado por utilizar o Sistema de Migração Automatizada!\n"
}

# Executar a função principal
main 