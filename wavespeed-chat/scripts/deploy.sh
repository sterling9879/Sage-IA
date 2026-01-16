#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="/var/www/wavespeed-chat"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   WaveSpeed Chat - Deploy             ${NC}"
echo -e "${GREEN}========================================${NC}"

cd $PROJECT_DIR

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo -e "${RED}Arquivo .env não encontrado!${NC}"
    echo "Copie .env.example para .env e configure"
    exit 1
fi

# Pull das últimas alterações
echo -e "${YELLOW}[1/6] Atualizando código...${NC}"
git pull origin main

# Instalar dependências
echo -e "${YELLOW}[2/6] Instalando dependências...${NC}"
pnpm install

# Gerar Prisma Client
echo -e "${YELLOW}[3/6] Gerando Prisma Client...${NC}"
pnpm --filter database db:generate

# Rodar migrations
echo -e "${YELLOW}[4/6] Executando migrations...${NC}"
pnpm --filter database db:migrate

# Build dos apps
echo -e "${YELLOW}[5/6] Building apps...${NC}"
pnpm build

# Restart PM2
echo -e "${YELLOW}[6/6] Reiniciando serviços...${NC}"
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js

# Salvar configuração PM2
pm2 save

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Deploy concluído!                   ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Status dos serviços:${NC}"
pm2 status
