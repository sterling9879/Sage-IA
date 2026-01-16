#!/bin/bash

#===============================================================================
# WaveSpeed Chat - Script de Instalação Completa para VPS Ubuntu 22.04
#===============================================================================
# Este script instala e configura todo o ambiente necessário para rodar
# o WaveSpeed Chat em uma VPS Ubuntu 22.04
#
# Uso: sudo bash install.sh
#===============================================================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações padrão
PROJECT_DIR="/var/www/wavespeed-chat"
REPO_URL="https://github.com/sterling9879/Sage-IA.git"
BRANCH="claude/ai-chat-saas-platform-Xlk6a"

# Função para imprimir cabeçalho
print_header() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}$1${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Função para imprimir status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Função para imprimir sucesso
print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

# Função para imprimir erro
print_error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

# Função para imprimir aviso
print_warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

# Função para gerar senha aleatória
generate_password() {
    openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 24
}

# Função para gerar secret
generate_secret() {
    openssl rand -base64 32
}

# Verificar se está rodando como root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Este script precisa ser executado como root (sudo)"
        exit 1
    fi
}

# Detectar usuário que executou o sudo
detect_user() {
    if [ -n "$SUDO_USER" ]; then
        INSTALL_USER=$SUDO_USER
    else
        INSTALL_USER=$(whoami)
    fi
    print_status "Usuário detectado: $INSTALL_USER"
}

# Banner inicial
show_banner() {
    clear
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════════════╗"
    echo "║                                                                   ║"
    echo "║   ██╗    ██╗ █████╗ ██╗   ██╗███████╗███████╗██████╗ ███████╗██████╗  ║"
    echo "║   ██║    ██║██╔══██╗██║   ██║██╔════╝██╔════╝██╔══██╗██╔════╝██╔══██╗ ║"
    echo "║   ██║ █╗ ██║███████║██║   ██║█████╗  ███████╗██████╔╝█████╗  ██║  ██║ ║"
    echo "║   ██║███╗██║██╔══██║╚██╗ ██╔╝██╔══╝  ╚════██║██╔═══╝ ██╔══╝  ██║  ██║ ║"
    echo "║   ╚███╔███╔╝██║  ██║ ╚████╔╝ ███████╗███████║██║     ███████╗██████╔╝ ║"
    echo "║    ╚══╝╚══╝ ╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚══════╝╚═╝     ╚══════╝╚═════╝  ║"
    echo "║                                                                   ║"
    echo "║                    AI Chat SaaS Platform                          ║"
    echo "║                    Instalador Automático                          ║"
    echo "║                                                                   ║"
    echo "╚═══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
}

# Coletar informações do usuário
collect_info() {
    print_header "CONFIGURAÇÃO INICIAL"

    # Domínio principal
    read -p "Digite o domínio para o chat (ex: chat.seudominio.com): " CHAT_DOMAIN
    if [ -z "$CHAT_DOMAIN" ]; then
        print_error "Domínio é obrigatório!"
        exit 1
    fi

    # Domínio admin
    read -p "Digite o domínio para o admin (ex: admin.seudominio.com): " ADMIN_DOMAIN
    if [ -z "$ADMIN_DOMAIN" ]; then
        print_error "Domínio admin é obrigatório!"
        exit 1
    fi

    # Email do admin
    read -p "Digite o email do administrador: " ADMIN_EMAIL
    if [ -z "$ADMIN_EMAIL" ]; then
        ADMIN_EMAIL="admin@$CHAT_DOMAIN"
    fi

    # Senha do admin (gerar automaticamente ou perguntar)
    read -p "Digite a senha do admin (deixe vazio para gerar automaticamente): " ADMIN_PASSWORD
    if [ -z "$ADMIN_PASSWORD" ]; then
        ADMIN_PASSWORD=$(generate_password)
        print_warning "Senha do admin gerada: $ADMIN_PASSWORD"
    fi

    # Senha do banco de dados
    DB_PASSWORD=$(generate_password)
    print_status "Senha do banco de dados gerada automaticamente"

    # Secrets
    NEXTAUTH_SECRET=$(generate_secret)
    ADMIN_SECRET=$(generate_secret)
    ENCRYPTION_KEY=$(openssl rand -hex 16)

    # Google OAuth (opcional)
    read -p "Deseja configurar Google OAuth? (s/n): " CONFIGURE_GOOGLE
    if [ "$CONFIGURE_GOOGLE" = "s" ] || [ "$CONFIGURE_GOOGLE" = "S" ]; then
        read -p "Google Client ID: " GOOGLE_CLIENT_ID
        read -p "Google Client Secret: " GOOGLE_CLIENT_SECRET
    else
        GOOGLE_CLIENT_ID=""
        GOOGLE_CLIENT_SECRET=""
    fi

    # SSL
    read -p "Deseja configurar SSL com Let's Encrypt? (s/n): " CONFIGURE_SSL
    if [ "$CONFIGURE_SSL" = "s" ] || [ "$CONFIGURE_SSL" = "S" ]; then
        read -p "Email para Let's Encrypt: " SSL_EMAIL
    fi

    echo ""
    print_header "RESUMO DA CONFIGURAÇÃO"
    echo -e "  Domínio Chat:    ${GREEN}$CHAT_DOMAIN${NC}"
    echo -e "  Domínio Admin:   ${GREEN}$ADMIN_DOMAIN${NC}"
    echo -e "  Email Admin:     ${GREEN}$ADMIN_EMAIL${NC}"
    echo -e "  Google OAuth:    ${GREEN}$([ -n "$GOOGLE_CLIENT_ID" ] && echo "Sim" || echo "Não")${NC}"
    echo -e "  SSL:             ${GREEN}$([ "$CONFIGURE_SSL" = "s" ] && echo "Sim" || echo "Não")${NC}"
    echo ""

    read -p "As informações estão corretas? (s/n): " CONFIRM
    if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
        print_error "Instalação cancelada pelo usuário"
        exit 1
    fi
}

# Atualizar sistema
update_system() {
    print_header "ATUALIZANDO SISTEMA"

    print_status "Atualizando lista de pacotes..."
    apt update -y

    print_status "Atualizando pacotes instalados..."
    apt upgrade -y

    print_success "Sistema atualizado!"
}

# Instalar dependências básicas
install_dependencies() {
    print_header "INSTALANDO DEPENDÊNCIAS"

    print_status "Instalando pacotes básicos..."
    apt install -y curl git wget unzip build-essential software-properties-common

    print_status "Instalando Nginx..."
    apt install -y nginx

    print_status "Instalando Certbot para SSL..."
    apt install -y certbot python3-certbot-nginx

    print_success "Dependências instaladas!"
}

# Instalar Node.js 20
install_nodejs() {
    print_header "INSTALANDO NODE.JS 20"

    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_status "Node.js já instalado: $NODE_VERSION"

        if [[ "$NODE_VERSION" == v20* ]]; then
            print_success "Node.js 20 já está instalado!"
            return
        fi
    fi

    print_status "Adicionando repositório NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

    print_status "Instalando Node.js..."
    apt install -y nodejs

    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    print_success "Node.js $NODE_VERSION instalado!"
    print_success "npm $NPM_VERSION instalado!"
}

# Instalar pnpm
install_pnpm() {
    print_header "INSTALANDO PNPM"

    if command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm -v)
        print_success "pnpm já instalado: $PNPM_VERSION"
        return
    fi

    print_status "Instalando pnpm globalmente..."
    npm install -g pnpm

    PNPM_VERSION=$(pnpm -v)
    print_success "pnpm $PNPM_VERSION instalado!"
}

# Instalar PM2
install_pm2() {
    print_header "INSTALANDO PM2"

    if command -v pm2 &> /dev/null; then
        PM2_VERSION=$(pm2 -v)
        print_success "PM2 já instalado: $PM2_VERSION"
        return
    fi

    print_status "Instalando PM2 globalmente..."
    npm install -g pm2

    PM2_VERSION=$(pm2 -v)
    print_success "PM2 $PM2_VERSION instalado!"
}

# Instalar PostgreSQL
install_postgresql() {
    print_header "INSTALANDO POSTGRESQL"

    if command -v psql &> /dev/null; then
        print_status "PostgreSQL já instalado"
    else
        print_status "Instalando PostgreSQL..."
        apt install -y postgresql postgresql-contrib
    fi

    print_status "Iniciando PostgreSQL..."
    systemctl start postgresql
    systemctl enable postgresql

    print_status "Configurando banco de dados..."

    # Criar usuário e banco de dados
    sudo -u postgres psql -c "DROP DATABASE IF EXISTS wavespeed_chat;" 2>/dev/null || true
    sudo -u postgres psql -c "DROP USER IF EXISTS wavespeed;" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE USER wavespeed WITH PASSWORD '$DB_PASSWORD';"
    sudo -u postgres psql -c "CREATE DATABASE wavespeed_chat OWNER wavespeed;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE wavespeed_chat TO wavespeed;"

    print_success "PostgreSQL configurado!"
}

# Clonar repositório
clone_repository() {
    print_header "CLONANDO REPOSITÓRIO"

    # Criar diretório se não existir
    if [ -d "$PROJECT_DIR" ]; then
        print_warning "Diretório já existe. Removendo..."
        rm -rf "$PROJECT_DIR"
    fi

    print_status "Criando diretório do projeto..."
    mkdir -p "$PROJECT_DIR"

    print_status "Clonando repositório..."
    git clone --branch "$BRANCH" "$REPO_URL" "$PROJECT_DIR-temp"

    # Mover apenas a pasta wavespeed-chat
    if [ -d "$PROJECT_DIR-temp/wavespeed-chat" ]; then
        mv "$PROJECT_DIR-temp/wavespeed-chat/"* "$PROJECT_DIR/"
        mv "$PROJECT_DIR-temp/wavespeed-chat/".[!.]* "$PROJECT_DIR/" 2>/dev/null || true
        rm -rf "$PROJECT_DIR-temp"
    else
        mv "$PROJECT_DIR-temp/"* "$PROJECT_DIR/"
        mv "$PROJECT_DIR-temp/".[!.]* "$PROJECT_DIR/" 2>/dev/null || true
        rm -rf "$PROJECT_DIR-temp"
    fi

    # Ajustar permissões
    chown -R $INSTALL_USER:$INSTALL_USER "$PROJECT_DIR"

    print_success "Repositório clonado!"
}

# Configurar variáveis de ambiente
configure_env() {
    print_header "CONFIGURANDO VARIÁVEIS DE AMBIENTE"

    print_status "Criando arquivo .env..."

    cat > "$PROJECT_DIR/.env" << EOF
# ===========================================
# DATABASE
# ===========================================
DATABASE_URL="postgresql://wavespeed:$DB_PASSWORD@localhost:5432/wavespeed_chat"

# ===========================================
# NEXTAUTH
# ===========================================
NEXTAUTH_URL="https://$CHAT_DOMAIN"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"

# Google OAuth
GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"

# ===========================================
# APP CONFIG
# ===========================================
NEXT_PUBLIC_APP_NAME="AI Chat"
NEXT_PUBLIC_APP_URL="https://$CHAT_DOMAIN"

# ===========================================
# ADMIN
# ===========================================
ADMIN_URL="https://$ADMIN_DOMAIN"
ADMIN_SECRET="$ADMIN_SECRET"

# Email do admin
ADMIN_EMAIL="$ADMIN_EMAIL"
ADMIN_PASSWORD="$ADMIN_PASSWORD"

# ===========================================
# ENCRYPTION
# ===========================================
ENCRYPTION_KEY="$ENCRYPTION_KEY"
EOF

    # Copiar .env para os apps
    cp "$PROJECT_DIR/.env" "$PROJECT_DIR/apps/web/.env"
    cp "$PROJECT_DIR/.env" "$PROJECT_DIR/apps/admin/.env"

    chown $INSTALL_USER:$INSTALL_USER "$PROJECT_DIR/.env"
    chown $INSTALL_USER:$INSTALL_USER "$PROJECT_DIR/apps/web/.env"
    chown $INSTALL_USER:$INSTALL_USER "$PROJECT_DIR/apps/admin/.env"
    chmod 600 "$PROJECT_DIR/.env"
    chmod 600 "$PROJECT_DIR/apps/web/.env"
    chmod 600 "$PROJECT_DIR/apps/admin/.env"

    print_success "Arquivo .env configurado!"
}

# Instalar dependências do projeto
install_project_deps() {
    print_header "INSTALANDO DEPENDÊNCIAS DO PROJETO"

    cd "$PROJECT_DIR"

    print_status "Instalando dependências com pnpm..."
    sudo -u $INSTALL_USER pnpm install

    print_success "Dependências instaladas!"
}

# Configurar banco de dados
setup_database() {
    print_header "CONFIGURANDO BANCO DE DADOS"

    cd "$PROJECT_DIR"

    print_status "Gerando Prisma Client..."
    sudo -u $INSTALL_USER pnpm --filter database db:generate

    print_status "Executando migrations..."
    sudo -u $INSTALL_USER pnpm --filter database db:migrate

    print_status "Executando seed..."
    sudo -u $INSTALL_USER pnpm --filter database db:seed

    print_success "Banco de dados configurado!"
}

# Build do projeto
build_project() {
    print_header "CONSTRUINDO PROJETO"

    cd "$PROJECT_DIR"

    print_status "Executando build..."
    sudo -u $INSTALL_USER pnpm build

    print_success "Build concluído!"
}

# Configurar PM2
configure_pm2() {
    print_header "CONFIGURANDO PM2"

    cd "$PROJECT_DIR"

    # Criar diretório de logs
    mkdir -p "$PROJECT_DIR/logs"
    chown -R $INSTALL_USER:$INSTALL_USER "$PROJECT_DIR/logs"

    print_status "Iniciando aplicações com PM2..."
    sudo -u $INSTALL_USER pm2 start ecosystem.config.js

    print_status "Salvando configuração do PM2..."
    sudo -u $INSTALL_USER pm2 save

    print_status "Configurando PM2 para iniciar no boot..."
    env PATH=$PATH:/usr/bin pm2 startup systemd -u $INSTALL_USER --hp /home/$INSTALL_USER

    print_success "PM2 configurado!"
}

# Configurar Nginx
configure_nginx() {
    print_header "CONFIGURANDO NGINX"

    print_status "Criando configuração do Nginx..."

    cat > /etc/nginx/sites-available/wavespeed << EOF
# WaveSpeed Chat - Nginx Configuration

# Upstream para o app principal
upstream wavespeed_web {
    server 127.0.0.1:3000;
    keepalive 64;
}

# Upstream para o painel admin
upstream wavespeed_admin {
    server 127.0.0.1:3001;
    keepalive 64;
}

# App Principal
server {
    listen 80;
    server_name $CHAT_DOMAIN;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Logs
    access_log /var/log/nginx/wavespeed-web-access.log;
    error_log /var/log/nginx/wavespeed-web-error.log;

    location / {
        proxy_pass http://wavespeed_web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    location /_next/static {
        proxy_pass http://wavespeed_web;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}

# Painel Admin
server {
    listen 80;
    server_name $ADMIN_DOMAIN;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Logs
    access_log /var/log/nginx/wavespeed-admin-access.log;
    error_log /var/log/nginx/wavespeed-admin-error.log;

    location / {
        proxy_pass http://wavespeed_admin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    location /_next/static {
        proxy_pass http://wavespeed_admin;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
EOF

    # Remover configuração default se existir
    rm -f /etc/nginx/sites-enabled/default

    # Criar link simbólico
    ln -sf /etc/nginx/sites-available/wavespeed /etc/nginx/sites-enabled/

    print_status "Testando configuração do Nginx..."
    nginx -t

    print_status "Reiniciando Nginx..."
    systemctl restart nginx
    systemctl enable nginx

    print_success "Nginx configurado!"
}

# Configurar SSL
configure_ssl() {
    if [ "$CONFIGURE_SSL" != "s" ] && [ "$CONFIGURE_SSL" != "S" ]; then
        print_warning "Configuração SSL pulada"
        return
    fi

    print_header "CONFIGURANDO SSL"

    print_status "Obtendo certificado SSL para $CHAT_DOMAIN..."
    certbot --nginx -d $CHAT_DOMAIN --non-interactive --agree-tos --email $SSL_EMAIL --redirect

    print_status "Obtendo certificado SSL para $ADMIN_DOMAIN..."
    certbot --nginx -d $ADMIN_DOMAIN --non-interactive --agree-tos --email $SSL_EMAIL --redirect

    print_status "Configurando renovação automática..."
    systemctl enable certbot.timer
    systemctl start certbot.timer

    print_success "SSL configurado!"
}

# Configurar firewall
configure_firewall() {
    print_header "CONFIGURANDO FIREWALL"

    print_status "Configurando UFW..."

    ufw allow ssh
    ufw allow http
    ufw allow https
    ufw --force enable

    print_success "Firewall configurado!"
}

# Criar script de backup
create_backup_script() {
    print_header "CRIANDO SCRIPTS DE MANUTENÇÃO"

    # Tornar scripts executáveis
    chmod +x "$PROJECT_DIR/scripts/"*.sh

    # Criar cron para backup diário
    print_status "Configurando backup diário..."

    cat > /etc/cron.d/wavespeed-backup << EOF
# Backup diário às 3:00 AM
0 3 * * * $INSTALL_USER $PROJECT_DIR/scripts/backup.sh >> /var/log/wavespeed-backup.log 2>&1
EOF

    # Criar cron para resetar mensagens diárias
    cat > /etc/cron.d/wavespeed-reset << EOF
# Resetar contagem de mensagens diárias à meia-noite
0 0 * * * $INSTALL_USER cd $PROJECT_DIR && pnpm --filter database prisma db execute --stdin <<< "UPDATE \"User\" SET \"messagesUsed\" = 0;" >> /var/log/wavespeed-reset.log 2>&1
EOF

    print_success "Scripts de manutenção configurados!"
}

# Salvar credenciais
save_credentials() {
    print_header "SALVANDO CREDENCIAIS"

    CREDENTIALS_FILE="$PROJECT_DIR/CREDENCIAIS.txt"

    cat > "$CREDENTIALS_FILE" << EOF
╔══════════════════════════════════════════════════════════════════════════════╗
║                    WAVESPEED CHAT - CREDENCIAIS DE ACESSO                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

DATA DE INSTALAÇÃO: $(date)

═══════════════════════════════════════════════════════════════════════════════
URLS DE ACESSO
═══════════════════════════════════════════════════════════════════════════════

App Principal (Chat):    https://$CHAT_DOMAIN
Painel Admin:            https://$ADMIN_DOMAIN

═══════════════════════════════════════════════════════════════════════════════
CREDENCIAIS DO ADMIN
═══════════════════════════════════════════════════════════════════════════════

Email:    $ADMIN_EMAIL
Senha:    $ADMIN_PASSWORD

═══════════════════════════════════════════════════════════════════════════════
BANCO DE DADOS
═══════════════════════════════════════════════════════════════════════════════

Host:     localhost
Porta:    5432
Banco:    wavespeed_chat
Usuário:  wavespeed
Senha:    $DB_PASSWORD

Connection String:
postgresql://wavespeed:$DB_PASSWORD@localhost:5432/wavespeed_chat

═══════════════════════════════════════════════════════════════════════════════
SECRETS (NÃO COMPARTILHE)
═══════════════════════════════════════════════════════════════════════════════

NEXTAUTH_SECRET:   $NEXTAUTH_SECRET
ADMIN_SECRET:      $ADMIN_SECRET
ENCRYPTION_KEY:    $ENCRYPTION_KEY

═══════════════════════════════════════════════════════════════════════════════
COMANDOS ÚTEIS
═══════════════════════════════════════════════════════════════════════════════

# Ver status dos serviços
pm2 status

# Ver logs em tempo real
pm2 logs

# Reiniciar serviços
pm2 restart all

# Executar backup manual
$PROJECT_DIR/scripts/backup.sh

# Atualizar projeto
cd $PROJECT_DIR && git pull && pnpm install && pnpm build && pm2 restart all

═══════════════════════════════════════════════════════════════════════════════
IMPORTANTE
═══════════════════════════════════════════════════════════════════════════════

1. Guarde este arquivo em local seguro
2. Altere a senha do admin no primeiro acesso
3. Configure a API Key do WaveSpeed no painel admin
4. Configure os limites de mensagens conforme necessário

═══════════════════════════════════════════════════════════════════════════════
EOF

    chmod 600 "$CREDENTIALS_FILE"
    chown $INSTALL_USER:$INSTALL_USER "$CREDENTIALS_FILE"

    print_success "Credenciais salvas em: $CREDENTIALS_FILE"
}

# Mostrar resumo final
show_summary() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                              ║${NC}"
    echo -e "${GREEN}║                    INSTALAÇÃO CONCLUÍDA COM SUCESSO!                        ║${NC}"
    echo -e "${GREEN}║                                                                              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  ACESSO AO SISTEMA${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${YELLOW}App Principal:${NC}  https://$CHAT_DOMAIN"
    echo -e "  ${YELLOW}Painel Admin:${NC}   https://$ADMIN_DOMAIN"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  CREDENCIAIS DO ADMIN${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${YELLOW}Email:${NC}    $ADMIN_EMAIL"
    echo -e "  ${YELLOW}Senha:${NC}    $ADMIN_PASSWORD"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  PRÓXIMOS PASSOS${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  1. ${GREEN}Acesse o painel admin${NC} e configure a API Key do WaveSpeed"
    echo -e "  2. ${GREEN}Configure os modelos${NC} que deseja disponibilizar"
    echo -e "  3. ${GREEN}Ajuste os limites${NC} de mensagens por plano"
    echo -e "  4. ${GREEN}Teste o sistema${NC} criando uma conta no app principal"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  ARQUIVOS IMPORTANTES${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${YELLOW}Credenciais:${NC}    $PROJECT_DIR/CREDENCIAIS.txt"
    echo -e "  ${YELLOW}Configuração:${NC}   $PROJECT_DIR/.env"
    echo -e "  ${YELLOW}Logs PM2:${NC}       pm2 logs"
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}  Obrigado por usar o WaveSpeed Chat!${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Função principal
main() {
    show_banner
    check_root
    detect_user
    collect_info

    update_system
    install_dependencies
    install_nodejs
    install_pnpm
    install_pm2
    install_postgresql
    clone_repository
    configure_env
    install_project_deps
    setup_database
    build_project
    configure_pm2
    configure_nginx
    configure_ssl
    configure_firewall
    create_backup_script
    save_credentials
    show_summary
}

# Executar
main "$@"
