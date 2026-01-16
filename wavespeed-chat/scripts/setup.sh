#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   WaveSpeed Chat - Setup Inicial      ${NC}"
echo -e "${GREEN}========================================${NC}"

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Por favor, execute como root (sudo)${NC}"
    exit 1
fi

# Atualizar sistema
echo -e "${YELLOW}[1/8] Atualizando sistema...${NC}"
apt update && apt upgrade -y

# Instalar dependências básicas
echo -e "${YELLOW}[2/8] Instalando dependências básicas...${NC}"
apt install -y curl git nginx certbot python3-certbot-nginx build-essential

# Instalar Node.js 20
echo -e "${YELLOW}[3/8] Instalando Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Instalar pnpm
echo -e "${YELLOW}[4/8] Instalando pnpm...${NC}"
npm install -g pnpm

# Instalar PM2
echo -e "${YELLOW}[5/8] Instalando PM2...${NC}"
npm install -g pm2

# Instalar PostgreSQL
echo -e "${YELLOW}[6/8] Instalando PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib

# Iniciar PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Configurar PostgreSQL
echo -e "${YELLOW}[7/8] Configurando PostgreSQL...${NC}"
read -p "Digite a senha para o banco de dados: " DB_PASSWORD
sudo -u postgres psql -c "CREATE USER wavespeed WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE wavespeed_chat OWNER wavespeed;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE wavespeed_chat TO wavespeed;"

# Criar diretório do projeto
echo -e "${YELLOW}[8/8] Criando diretório do projeto...${NC}"
mkdir -p /var/www/wavespeed-chat
chown -R $SUDO_USER:$SUDO_USER /var/www/wavespeed-chat

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Setup inicial concluído!            ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. Clone o repositório em /var/www/wavespeed-chat"
echo "2. Copie .env.example para .env e configure"
echo "3. Execute ./scripts/deploy.sh"
echo ""
echo -e "${YELLOW}DATABASE_URL:${NC}"
echo "postgresql://wavespeed:$DB_PASSWORD@localhost:5432/wavespeed_chat"
