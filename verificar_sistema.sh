#!/bin/bash
#
# Script de Verificação do Sistema Integrado de Regulação UBS
# Este script realiza verificações rápidas no sistema para garantir que
# todos os componentes estão funcionando corretamente após a migração
#

# Definições de cores para output
VERMELHO='\033[0;31m'
VERDE='\033[0;32m'
AMARELO='\033[0;33m'
AZUL='\033[0;34m'
RESET='\033[0m'

# Função para exibir mensagens
exibir() {
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
}

echo -e "\n${AZUL}=== Verificação do Sistema Integrado de Regulação UBS ===${RESET}\n"

# 1. Verificar estrutura de arquivos
exibir "info" "Verificando estrutura de arquivos..."

STATUS=0

# Arquivos críticos para verificação
ARQUIVOS_CRITICOS=(
  "server.js"
  "package.json"
  "sistema-central-regulacao.html"
  "sistema-ubs.html"
  "login-central-regulacao.html"
  "db/db.json"
)

for arquivo in "${ARQUIVOS_CRITICOS[@]}"; do
  if [ -f "$arquivo" ]; then
    exibir "sucesso" "✅ $arquivo: Encontrado"
  else
    exibir "erro" "❌ $arquivo: FALTANDO!"
    STATUS=1
  fi
done

# 2. Verificar banco de dados
exibir "info" "Verificando banco de dados..."

if [ -f "db/db.json" ]; then
  if command -v jq >/dev/null 2>&1; then
    cat db/db.json | jq empty >/dev/null 2>&1
    if [ $? -eq 0 ]; then
      exibir "sucesso" "✅ Banco de dados JSON válido"
    else
      exibir "erro" "❌ Banco de dados com formato JSON inválido"
      STATUS=1
    fi
  else
    exibir "aviso" "⚠️ Ferramenta 'jq' não encontrada. Pulando verificação do formato JSON."
  fi
else
  exibir "erro" "❌ Arquivo de banco de dados não encontrado"
  STATUS=1
fi

# 3. Verificar dependências do Node.js
exibir "info" "Verificando dependências do Node.js..."

if [ -d "node_modules" ]; then
  exibir "sucesso" "✅ Pasta node_modules encontrada"
  
  # Verificar principais dependências
  if [ -d "node_modules/express" ]; then
    exibir "sucesso" "✅ Express instalado"
  else
    exibir "erro" "❌ Express não encontrado"
    STATUS=1
  fi
  
  if [ -d "node_modules/path" ]; then
    exibir "sucesso" "✅ Path instalado"
  else
    exibir "erro" "❌ Path não encontrado"
    STATUS=1
  fi
else
  exibir "erro" "❌ Pasta node_modules não encontrada. Dependências não instaladas."
  STATUS=1
fi

# 4. Verificar porta disponível
exibir "info" "Verificando disponibilidade da porta 5555..."

if command -v lsof >/dev/null 2>&1; then
  lsof -i :5555 >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    exibir "aviso" "⚠️ A porta 5555 já está em uso"
  else
    exibir "sucesso" "✅ Porta 5555 disponível"
  fi
else
  exibir "aviso" "⚠️ Ferramenta 'lsof' não encontrada. Pulando verificação de porta."
fi

# 5. Teste de inicialização rápida
exibir "info" "Executando teste de inicialização rápida..."

# Usar nohup para executar em segundo plano
nohup node server.js > .verificacao_servidor.log 2>&1 &
PID=$!

exibir "info" "Servidor iniciado com PID $PID"
exibir "info" "Aguardando 5 segundos para inicialização..."
sleep 5

# Verificar se o processo ainda está em execução
if ps -p $PID > /dev/null; then
  exibir "sucesso" "✅ Servidor iniciou e está em execução"
  
  # Verificar resposta da API
  if command -v curl >/dev/null 2>&1; then
    RESPOSTA=$(curl -s http://localhost:5555/api/status 2>&1)
    if [[ $RESPOSTA == *"status"* && $RESPOSTA == *"online"* ]]; then
      exibir "sucesso" "✅ API respondendo corretamente"
    else
      exibir "erro" "❌ API não está respondendo corretamente"
      STATUS=1
    fi
  else
    exibir "aviso" "⚠️ Ferramenta 'curl' não encontrada. Pulando teste de API."
  fi
  
  # Matar o processo de teste
  kill $PID
  exibir "info" "Servidor de teste encerrado"
else
  exibir "erro" "❌ Servidor não conseguiu iniciar ou foi encerrado"
  STATUS=1
fi

# 6. Verificar logs
exibir "info" "Verificando logs e arquivos de erro..."

if [ -f .verificacao_servidor.log ]; then
  # Verificar erros no log
  if grep -i "error\|exception\|fail" .verificacao_servidor.log > /dev/null; then
    exibir "erro" "❌ Encontrados erros no log do servidor"
    grep -i "error\|exception\|fail" .verificacao_servidor.log | head -5
    STATUS=1
  else
    exibir "sucesso" "✅ Nenhum erro encontrado no log do servidor"
  fi
  
  # Limpar arquivo de log temporário
  rm .verificacao_servidor.log
fi

# Resumo final
echo -e "\n${AZUL}=== Resumo da Verificação ===${RESET}\n"

if [ $STATUS -eq 0 ]; then
  echo -e "${VERDE}✅ Todas as verificações foram concluídas com sucesso! O sistema parece estar funcionando corretamente.${RESET}"
  echo -e "${VERDE}✅ Você pode iniciar o servidor normalmente com 'npm start' e acessar em http://localhost:5555${RESET}"
else
  echo -e "${VERMELHO}❌ Foram encontrados problemas na verificação do sistema. Verifique os erros acima.${RESET}"
  echo -e "${AMARELO}⚠️ Recomendação: Verifique os logs em registros_migracao/ para mais detalhes.${RESET}"
fi

echo ""
exit $STATUS 