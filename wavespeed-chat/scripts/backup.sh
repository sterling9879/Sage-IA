#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configurações
BACKUP_DIR="/var/backups/wavespeed"
DB_NAME="wavespeed_chat"
DB_USER="wavespeed"
RETENTION_DAYS=7

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Nome do arquivo de backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo -e "${YELLOW}Iniciando backup do banco de dados...${NC}"

# Realizar backup
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Backup criado com sucesso: $BACKUP_FILE${NC}"

    # Mostrar tamanho do backup
    SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo -e "${GREEN}Tamanho: $SIZE${NC}"
else
    echo -e "${RED}Erro ao criar backup!${NC}"
    exit 1
fi

# Remover backups antigos
echo -e "${YELLOW}Removendo backups com mais de $RETENTION_DAYS dias...${NC}"
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Listar backups existentes
echo -e "${GREEN}Backups disponíveis:${NC}"
ls -lh $BACKUP_DIR/*.sql.gz 2>/dev/null || echo "Nenhum backup encontrado"
