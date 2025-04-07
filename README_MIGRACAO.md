# Instruções para Migração do Sistema Integrado de Regulação UBS

Este documento descreve os procedimentos para migração do Sistema Integrado de Regulação UBS para um novo ambiente ou HD externo, utilizando as ferramentas automatizadas fornecidas.

## Pré-requisitos

Antes de iniciar a migração, verifique se o ambiente possui os seguintes componentes:

1. Sistema operacional Linux (Ubuntu/Debian recomendado)
2. Ferramentas necessárias:
   - `rsync` (para cópia eficiente de arquivos)
   - `sha256sum` (para verificação de integridade)
   - `jq` (para validação do banco de dados JSON)
   - `curl` (para teste de API)
   - `node.js` e `npm` (para execução do sistema)
   - `rclone` (opcional, para backup em nuvem)

Para instalar as ferramentas necessárias no Ubuntu/Debian:

```bash
sudo apt update
sudo apt install rsync curl jq
```

## Preparação para Migração

1. Monte o HD externo/dispositivo de destino no sistema
2. Verifique o ponto de montagem (ex: `/media/usuario/HD_EXTERNO`)
3. Se necessário, ajuste o caminho do HD externo no script:

```bash
# Abra o script para edição
nano migracao_automatizada.sh

# Altere a linha que define HD_DESTINO para o caminho correto:
HD_DESTINO="/media/seu_usuario/NOME_DO_HD"
```

## Execução da Migração

Para iniciar o processo de migração, execute o script de migração automatizada:

```bash
# Conceder permissão de execução ao script (se ainda não estiver)
chmod +x migracao_automatizada.sh

# Executar o script
./migracao_automatizada.sh
```

O script irá:
1. Verificar o espaço disponível no destino
2. Limpar arquivos desnecessários na origem
3. Gerar manifesto de arquivos e hashes para verificação de integridade
4. Copiar todos os arquivos para o destino
5. Verificar a integridade dos arquivos copiados
6. Instalar dependências e testar a aplicação no destino
7. Gerar documentação e relatórios
8. Criar backup adicional compactado
9. Apresentar checklist final

## Plano de Migração Detalhado

Um plano de migração detalhado está disponível no arquivo `plano-migracao-detalhado.md`, que pode ser consultado para entender cada etapa do processo em profundidade.

## Verificação Pós-Migração

Após concluir a migração, é importante validar o sistema:

1. Navegue até o diretório do sistema migrado:
   ```bash
   cd /media/seu_usuario/NOME_DO_HD/sistema_regulacao_ubs
   ```

2. Inicie o servidor:
   ```bash
   npm start
   ```

3. Acesse a aplicação em um navegador:
   ```
   http://localhost:5555
   ```

4. Verifique se todas as funcionalidades estão operando corretamente.

## Solução de Problemas

Se ocorrerem problemas durante a migração:

1. Consulte os logs em `registros_migracao/` no diretório de destino
2. Verifique o relatório de verificação de integridade em `registros_migracao/resultado_verificacao.txt`
3. Consulte o log de teste do servidor em `registros_migracao/server_test.log`

## Restauração em Caso de Falha

O script inclui procedimentos para restauração do sistema em caso de falha na migração. Para restaurar o sistema original:

```bash
# Restauração manual através do rsync
rsync -avh --progress \
  --exclude=registros_migracao \
  /media/seu_usuario/NOME_DO_HD/sistema_regulacao_ubs/ \
  /caminho/para/diretorio/original/

# Reinstalar dependências
cd /caminho/para/diretorio/original/
npm install
```

## Informações Adicionais

- O sistema utiliza o Node.js com Express como servidor
- O banco de dados está no formato JSON em `db/db.json`
- A porta padrão do servidor é 5555

## Suporte

Em caso de dúvidas ou problemas durante a migração, consulte a equipe de Desenvolvimento do Sistema de Regulação UBS. 