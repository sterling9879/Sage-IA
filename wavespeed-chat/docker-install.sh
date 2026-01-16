#!/bin/bash

#===============================================================================
# WaveSpeed Chat - Docker Installation Script
#===============================================================================
# Este script instala o WaveSpeed Chat usando Docker em uma VPS Ubuntu
#
# Uso: sudo bash docker-install.sh
#===============================================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configurações
PROJECT_DIR="/opt/wavespeed-chat"
REPO_URL="https://github.com/sterling9879/Sage-IA.git"
BRANCH="claude/ai-chat-saas-platform-Xlk6a"

# Funções de utilidade
print_header() {
    echo ""
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[OK]${NC} $1"; }
print_error() { echo -e "${RED}[ERRO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[AVISO]${NC} $1"; }

generate_password() { openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 24; }
generate_secret() { openssl rand -base64 32; }

# Banner
show_banner() {
    clear
    echo -e "${PURPLE}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   ██╗    ██╗ █████╗ ██╗   ██╗███████╗███████╗██████╗ ███████╗██████╗  ║
║   ██║    ██║██╔══██╗██║   ██║██╔════╝██╔════╝██╔══██╗██╔════╝██╔══██╗ ║
║   ██║ █╗ ██║███████║██║   ██║█████╗  ███████╗██████╔╝█████╗  ██║  ██║ ║
║   ██║███╗██║██╔══██║╚██╗ ██╔╝██╔══╝  ╚════██║██╔═══╝ ██╔══╝  ██║  ██║ ║
║   ╚███╔███╔╝██║  ██║ ╚████╔╝ ███████╗███████║██║     ███████╗██████╔╝ ║
║    ╚══╝╚══╝ ╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚══════╝╚═╝     ╚══════╝╚═════╝  ║
║                                                                       ║
║                    Docker Installation Script                         ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Verificar root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Execute como root: sudo bash docker-install.sh"
        exit 1
    fi
}

# Coletar informações
collect_info() {
    print_header "CONFIGURAÇÃO"

    read -p "Domínio do chat (ex: chat.seudominio.com): " CHAT_DOMAIN
    [ -z "$CHAT_DOMAIN" ] && { print_error "Domínio obrigatório!"; exit 1; }

    read -p "Domínio do admin (ex: admin.seudominio.com): " ADMIN_DOMAIN
    [ -z "$ADMIN_DOMAIN" ] && { print_error "Domínio admin obrigatório!"; exit 1; }

    read -p "Email do administrador: " ADMIN_EMAIL
    [ -z "$ADMIN_EMAIL" ] && ADMIN_EMAIL="admin@$CHAT_DOMAIN"

    read -p "Senha do admin (Enter para gerar): " ADMIN_PASSWORD
    [ -z "$ADMIN_PASSWORD" ] && { ADMIN_PASSWORD=$(generate_password); print_warning "Senha gerada: $ADMIN_PASSWORD"; }

    read -p "Configurar SSL com Let's Encrypt? (s/n): " CONFIGURE_SSL
    [ "$CONFIGURE_SSL" = "s" ] && read -p "Email para SSL: " SSL_EMAIL

    # Gerar secrets
    DB_PASSWORD=$(generate_password)
    NEXTAUTH_SECRET=$(generate_secret)
    ADMIN_SECRET=$(generate_secret)

    echo ""
    print_header "RESUMO"
    echo -e "  Chat:   ${GREEN}$CHAT_DOMAIN${NC}"
    echo -e "  Admin:  ${GREEN}$ADMIN_DOMAIN${NC}"
    echo -e "  Email:  ${GREEN}$ADMIN_EMAIL${NC}"
    echo -e "  SSL:    ${GREEN}$([ "$CONFIGURE_SSL" = "s" ] && echo "Sim" || echo "Não")${NC}"
    echo ""

    read -p "Confirmar? (s/n): " CONFIRM
    [ "$CONFIRM" != "s" ] && { print_error "Cancelado"; exit 1; }
}

# Instalar Docker
install_docker() {
    print_header "INSTALANDO DOCKER"

    if command -v docker &> /dev/null; then
        print_success "Docker já instalado: $(docker --version)"
    else
        print_status "Instalando Docker..."
        curl -fsSL https://get.docker.com | bash
        systemctl enable docker
        systemctl start docker
        print_success "Docker instalado!"
    fi

    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        print_success "Docker Compose já instalado"
    else
        print_status "Instalando Docker Compose..."
        apt-get install -y docker-compose-plugin
        print_success "Docker Compose instalado!"
    fi
}

# Clonar repositório
clone_repo() {
    print_header "CLONANDO PROJETO"

    [ -d "$PROJECT_DIR" ] && { print_warning "Removendo instalação anterior..."; rm -rf "$PROJECT_DIR"; }

    print_status "Clonando repositório..."
    git clone --branch "$BRANCH" "$REPO_URL" "$PROJECT_DIR-temp"

    if [ -d "$PROJECT_DIR-temp/wavespeed-chat" ]; then
        mkdir -p "$PROJECT_DIR"
        mv "$PROJECT_DIR-temp/wavespeed-chat/"* "$PROJECT_DIR/"
        mv "$PROJECT_DIR-temp/wavespeed-chat/".[!.]* "$PROJECT_DIR/" 2>/dev/null || true
        rm -rf "$PROJECT_DIR-temp"
    else
        mv "$PROJECT_DIR-temp" "$PROJECT_DIR"
    fi

    print_success "Projeto clonado!"
}

# Criar arquivo .env
create_env() {
    print_header "CONFIGURANDO AMBIENTE"

    cat > "$PROJECT_DIR/.env" << EOF
# ===================================
# WaveSpeed Chat - Docker Environment
# ===================================

# Database
DB_USER=wavespeed
DB_PASSWORD=$DB_PASSWORD
DB_NAME=wavespeed_chat

# URLs
NEXTAUTH_URL=https://$CHAT_DOMAIN
ADMIN_URL=https://$ADMIN_DOMAIN

# Secrets
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ADMIN_SECRET=$ADMIN_SECRET

# Admin
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD

# App
APP_NAME=AI Chat

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Domains (para nginx)
CHAT_DOMAIN=$CHAT_DOMAIN
ADMIN_DOMAIN=$ADMIN_DOMAIN
EOF

    chmod 600 "$PROJECT_DIR/.env"
    print_success "Arquivo .env criado!"
}

# Configurar nginx
configure_nginx() {
    print_header "CONFIGURANDO NGINX"

    mkdir -p "$PROJECT_DIR/docker/certbot/conf"
    mkdir -p "$PROJECT_DIR/docker/certbot/www"

    # Substituir variáveis no nginx config
    sed -i "s/\${CHAT_DOMAIN}/$CHAT_DOMAIN/g" "$PROJECT_DIR/docker/nginx/conf.d/default.conf"
    sed -i "s/\${ADMIN_DOMAIN}/$ADMIN_DOMAIN/g" "$PROJECT_DIR/docker/nginx/conf.d/default.conf"

    print_success "Nginx configurado!"
}

# Build e start dos containers
start_containers() {
    print_header "INICIANDO CONTAINERS"

    cd "$PROJECT_DIR"

    print_status "Construindo imagens (pode demorar alguns minutos)..."
    docker compose build

    print_status "Iniciando containers..."
    docker compose up -d postgres

    print_status "Aguardando PostgreSQL..."
    sleep 10

    print_status "Executando migrations..."
    docker compose up migrate

    print_status "Iniciando aplicações..."
    docker compose up -d web admin

    print_success "Containers iniciados!"
}

# Configurar SSL
configure_ssl() {
    [ "$CONFIGURE_SSL" != "s" ] && return

    print_header "CONFIGURANDO SSL"

    cd "$PROJECT_DIR"

    print_status "Iniciando nginx para validação..."
    docker compose --profile production up -d nginx

    print_status "Obtendo certificado para $CHAT_DOMAIN..."
    docker compose run --rm certbot certonly --webroot \
        --webroot-path=/var/www/certbot \
        --email "$SSL_EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$CHAT_DOMAIN"

    print_status "Obtendo certificado para $ADMIN_DOMAIN..."
    docker compose run --rm certbot certonly --webroot \
        --webroot-path=/var/www/certbot \
        --email "$SSL_EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$ADMIN_DOMAIN"

    # Ativar SSL no nginx
    print_status "Ativando SSL..."
    sed -i "s/\${CHAT_DOMAIN}/$CHAT_DOMAIN/g" "$PROJECT_DIR/docker/nginx/conf.d/ssl.conf.template"
    sed -i "s/\${ADMIN_DOMAIN}/$ADMIN_DOMAIN/g" "$PROJECT_DIR/docker/nginx/conf.d/ssl.conf.template"
    mv "$PROJECT_DIR/docker/nginx/conf.d/ssl.conf.template" "$PROJECT_DIR/docker/nginx/conf.d/ssl.conf"

    # Habilitar redirect HTTP -> HTTPS
    sed -i 's/# location \/ {/location \/ {/' "$PROJECT_DIR/docker/nginx/conf.d/default.conf"
    sed -i 's/#     return 301/    return 301/' "$PROJECT_DIR/docker/nginx/conf.d/default.conf"
    sed -i 's/# }/}/' "$PROJECT_DIR/docker/nginx/conf.d/default.conf"

    docker compose --profile production restart nginx

    print_success "SSL configurado!"
}

# Salvar credenciais
save_credentials() {
    print_header "SALVANDO CREDENCIAIS"

    cat > "$PROJECT_DIR/CREDENCIAIS.txt" << EOF
╔══════════════════════════════════════════════════════════════════════════════╗
║                    WAVESPEED CHAT - CREDENCIAIS (DOCKER)                      ║
╚══════════════════════════════════════════════════════════════════════════════╝

Data: $(date)

═══════════════════════════════════════════════════════════════════════════════
URLS
═══════════════════════════════════════════════════════════════════════════════

Chat:   https://$CHAT_DOMAIN
Admin:  https://$ADMIN_DOMAIN

═══════════════════════════════════════════════════════════════════════════════
ADMIN
═══════════════════════════════════════════════════════════════════════════════

Email:  $ADMIN_EMAIL
Senha:  $ADMIN_PASSWORD

═══════════════════════════════════════════════════════════════════════════════
BANCO DE DADOS
═══════════════════════════════════════════════════════════════════════════════

Host:     postgres (interno) / localhost:5432 (se exposto)
Banco:    wavespeed_chat
Usuário:  wavespeed
Senha:    $DB_PASSWORD

═══════════════════════════════════════════════════════════════════════════════
COMANDOS DOCKER
═══════════════════════════════════════════════════════════════════════════════

# Ver status
cd $PROJECT_DIR && docker compose ps

# Ver logs
docker compose logs -f

# Logs de um serviço específico
docker compose logs -f web
docker compose logs -f admin

# Reiniciar tudo
docker compose restart

# Parar tudo
docker compose down

# Atualizar
git pull && docker compose build && docker compose up -d

# Backup do banco
docker compose exec postgres pg_dump -U wavespeed wavespeed_chat > backup.sql

# Restaurar backup
docker compose exec -T postgres psql -U wavespeed wavespeed_chat < backup.sql

═══════════════════════════════════════════════════════════════════════════════
EOF

    chmod 600 "$PROJECT_DIR/CREDENCIAIS.txt"
    print_success "Credenciais salvas em: $PROJECT_DIR/CREDENCIAIS.txt"
}

# Criar script de atualização
create_update_script() {
    cat > "$PROJECT_DIR/update.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "Atualizando WaveSpeed Chat..."
git pull
docker compose build
docker compose up -d
echo "Atualização concluída!"
EOF
    chmod +x "$PROJECT_DIR/update.sh"
}

# Criar script de backup
create_backup_script() {
    cat > "$PROJECT_DIR/backup.sh" << 'EOF'
#!/bin/bash
BACKUP_DIR="$HOME/wavespeed-backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cd "$(dirname "$0")"
docker compose exec -T postgres pg_dump -U wavespeed wavespeed_chat | gzip > "$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
echo "Backup criado: $BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
EOF
    chmod +x "$PROJECT_DIR/backup.sh"
}

# Resumo final
show_summary() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                     INSTALAÇÃO CONCLUÍDA COM SUCESSO!                        ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "  ${YELLOW}Chat:${NC}   https://$CHAT_DOMAIN"
    echo -e "  ${YELLOW}Admin:${NC}  https://$ADMIN_DOMAIN"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${YELLOW}Email Admin:${NC}  $ADMIN_EMAIL"
    echo -e "  ${YELLOW}Senha Admin:${NC}  $ADMIN_PASSWORD"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "  ${YELLOW}Comandos úteis:${NC}"
    echo ""
    echo -e "    Ver status:      ${GREEN}cd $PROJECT_DIR && docker compose ps${NC}"
    echo -e "    Ver logs:        ${GREEN}docker compose logs -f${NC}"
    echo -e "    Atualizar:       ${GREEN}$PROJECT_DIR/update.sh${NC}"
    echo -e "    Backup:          ${GREEN}$PROJECT_DIR/backup.sh${NC}"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "  ${YELLOW}Próximos passos:${NC}"
    echo ""
    echo -e "    1. Acesse o admin e configure a API Key do WaveSpeed"
    echo -e "    2. Configure os modelos disponíveis"
    echo -e "    3. Teste criando uma conta no app principal"
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════════════${NC}"
}

# Main
main() {
    show_banner
    check_root
    collect_info
    install_docker
    clone_repo
    create_env
    configure_nginx
    start_containers
    configure_ssl
    save_credentials
    create_update_script
    create_backup_script
    show_summary
}

main "$@"
