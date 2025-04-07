# Plano de Migração do Sistema Integrado de Regulação UBS

## 1. Preparação da Migração

### 1.1 Verificação do ambiente atual
```bash
# Verificar espaço disponível no sistema atual
df -h /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente

# Listar todos os arquivos, incluindo os ocultos
find /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente -type f | sort > arquivos_sistema.txt

# Contar arquivos e obter tamanho total
find /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente -type f -not -path "*/node_modules/*" -exec du -ch {} \; | grep total$
```

### 1.2 Limpeza de arquivos desnecessários
```bash
# Remover node_modules (será reinstalado posteriormente)
rm -rf /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente/node_modules

# Remover arquivos de cache
find /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente -name "*.log" -delete
find /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente -name ".DS_Store" -delete
find /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente -name "Thumbs.db" -delete
find /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente -name ".cache" -type d -exec rm -rf {} +
find /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente -name "dist" -type d -exec rm -rf {} +
find /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente -name "build" -type d -exec rm -rf {} +
```

## 2. Criação de Manifesto e Verificações

### 2.1 Geração de hashes para verificação de integridade
```bash
# Criar diretório para logs e manifesto
mkdir -p /tmp/migracao_sistema_ubs

# Gerar manifesto com SHA256 de todos os arquivos
find /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  | sort \
  | xargs sha256sum > /tmp/migracao_sistema_ubs/manifesto_sha256.txt

# Criar lista de diretórios para recriar estrutura
find /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente -type d \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  | sort > /tmp/migracao_sistema_ubs/estrutura_diretorios.txt
```

### 2.2 Criação de metadados e relatório
```bash
# Gerar metadados importantes
{
  echo "Data e hora da migração: $(date)"
  echo "Versão do sistema: $(cat /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente/package.json | grep version | head -1)"
  echo "Total de arquivos: $(find /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente -type f -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l)"
  echo "Tamanho total: $(du -sh /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente --exclude=node_modules | cut -f1)"
  echo "Sistema operacional: $(uname -a)"
  echo "Usuário que realizou a migração: $(whoami)"
} > /tmp/migracao_sistema_ubs/metadados.txt
```

## 3. Processo de Migração

### 3.1 Verificação do HD externo
```bash
# Supondo que o HD externo esteja montado em /media/paulomv/HD_EXTERNO
# Verificar espaço disponível no destino
df -h /media/paulomv/HD_EXTERNO

# Criar diretório específico para o sistema no HD
mkdir -p /media/paulomv/HD_EXTERNO/sistema_regulacao_ubs
```

### 3.2 Processo de cópia com verificação
```bash
# Copiar todos os arquivos, preservando permissões e timestamps
rsync -avh --progress \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=*.log \
  --log-file=/tmp/migracao_sistema_ubs/rsync_log.txt \
  /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente/ \
  /media/paulomv/HD_EXTERNO/sistema_regulacao_ubs/

# Copiar também os arquivos de manifesto e logs
cp -r /tmp/migracao_sistema_ubs/ /media/paulomv/HD_EXTERNO/sistema_regulacao_ubs/registros_migracao/
```

### 3.3 Verificação de integridade pós-migração
```bash
# Navegar até o diretório do sistema no HD externo
cd /media/paulomv/HD_EXTERNO/sistema_regulacao_ubs

# Gerar novo manifesto para comparação
find . -type f \
  -not -path "*/registros_migracao/*" \
  | sort \
  | xargs sha256sum > ./registros_migracao/manifesto_destino.txt

# Comparar manifestos para garantir integridade
diff -u ./registros_migracao/manifesto_sha256.txt ./registros_migracao/manifesto_destino.txt > ./registros_migracao/resultado_verificacao.txt

# Verificar se houve diferenças
if [ $? -eq 0 ]; then
  echo "Verificação completa: todos os arquivos migrados com sucesso e integridade preservada." > ./registros_migracao/status_migracao.txt
else
  echo "ATENÇÃO: Foram encontradas diferenças na verificação de integridade. Verifique o arquivo resultado_verificacao.txt" > ./registros_migracao/status_migracao.txt
fi
```

## 4. Validação da Aplicação no Destino

### 4.1 Instalação das dependências no novo ambiente
```bash
# Navegar até o diretório do sistema
cd /media/paulomv/HD_EXTERNO/sistema_regulacao_ubs

# Instalar dependências
npm install
```

### 4.2 Verificação da integridade do banco de dados
```bash
# Validar estrutura do JSON do banco de dados
cat ./db/db.json | jq empty && echo "Banco de dados válido" || echo "ERRO: Banco de dados com formato JSON inválido"

# Criar backup do banco de dados
cp ./db/db.json ./registros_migracao/db_backup.json
```

### 4.3 Teste de inicialização do sistema
```bash
# Iniciar o servidor em modo de teste
NODE_ENV=test node server.js

# Verificar se o servidor está respondendo (em outro terminal)
curl http://localhost:5555/api/status -s | jq .
```

## 5. Documentação e Encerramento

### 5.1 Geração de documentação da migração
```bash
# Criar relatório de migração
{
  echo "# Relatório de Migração do Sistema Integrado de Regulação UBS"
  echo ""
  echo "## Informações Gerais"
  echo ""
  cat ./registros_migracao/metadados.txt
  echo ""
  echo "## Status da Migração"
  echo ""
  cat ./registros_migracao/status_migracao.txt
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
} > ./registros_migracao/relatorio_migracao.md
```

### 5.2 Verificação dos requisitos específicos do sistema
```bash
# Verificar existência de todos os arquivos críticos
for arquivo in server.js package.json sistema-central-regulacao.html sistema-ubs.html
do
  [ -f $arquivo ] && echo "$arquivo: OK" || echo "$arquivo: FALTANDO!"
done > ./registros_migracao/verificacao_arquivos_criticos.txt
```

## 6. Plano de Contingência

### 6.1 Backup adicional em nuvem
```bash
# Criar um arquivo compactado do sistema
tar -czf sistema_regulacao_ubs_backup.tar.gz \
  --exclude="node_modules" \
  --exclude="registros_migracao" \
  /media/paulomv/HD_EXTERNO/sistema_regulacao_ubs/

# Enviar para armazenamento em nuvem (exemplo usando rclone configurado)
rclone copy sistema_regulacao_ubs_backup.tar.gz remote:backups/sistema_ubs/
```

### 6.2 Procedimentos em caso de falha
1. Identificar o ponto de falha no log detalhado
2. Restaurar do backup original se necessário
3. Verificar a integridade do banco de dados
4. Reinstalar dependências e tentar novamente

### 6.3 Restauração do ambiente original
```bash
# Em caso de problemas, restaurar o sistema original
rsync -avh --progress \
  --exclude=registros_migracao \
  /media/paulomv/HD_EXTERNO/sistema_regulacao_ubs/ \
  /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente/

# Instalar dependências
cd /home/paulomv/%C3%81rea%20de%20Trabalho/fragmentado/fragmento2independente/
npm install
```

## 7. Considerações para Atualizações Futuras

### 7.1 Recomendações de melhorias
1. Implementar um sistema de migração automatizada usando Docker
2. Criar scripts de backup periódicos e automáticos
3. Configurar pipeline CI/CD para deploy automatizado
4. Migrar o banco de dados para uma solução SQL ou NoSQL mais robusta
5. Implementar versionamento de APIs e migrations de banco de dados

### 7.2 Documentação técnica
- Manter um registro das migrações e atualizações
- Documentar todas as alterações nos arquivos de configuração
- Criar documentação para desenvolvedores sobre a estrutura do projeto
- Elaborar manuais de manutenção e solução de problemas

### 7.3 Monitoramento pós-migração
- Estabelecer KPIs para avaliar o desempenho pós-migração
- Implementar monitoramento de logs e erros
- Configurar notificações para eventos críticos
- Realizar verificações periódicas de integridade

## 8. Checklist Final de Migração

- [ ] Sistema limpo e preparado para migração
- [ ] Manifesto de arquivos gerado e validado
- [ ] Cópia completa realizada para o HD externo
- [ ] Verificação de integridade confirmada
- [ ] Dependências instaladas no novo ambiente
- [ ] Testes de inicialização bem-sucedidos
- [ ] Documentação completa gerada
- [ ] Backup adicional em nuvem realizado
- [ ] Plano de contingência revisado e validado
- [ ] Relatório final de migração aprovado 