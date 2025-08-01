#!/bin/bash

# Divine Friend PWA 生产环境一键部署脚本
# 使用方法: ./deploy.sh [production|staging|development]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker和Docker Compose
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装"
        exit 1
    fi
    
    log_success "依赖检查通过"
}

# 检查环境变量文件
check_env_file() {
    if [ ! -f ".env" ]; then
        log_warning "未找到 .env 文件，创建默认配置..."
        cat > .env << EOF
# Divine Friend PWA 生产环境配置

# 应用配置
SECRET_KEY=your-super-secret-key-change-this-in-production
REDIS_PASSWORD=your-redis-password
GRAFANA_PASSWORD=admin

# 数据库配置
MYSQL_ROOT_PASSWORD=root-password-change-this
MYSQL_PASSWORD=divine-friend-password-change-this
MYSQL_DATABASE=divine_friend_prod

# 域名配置 (请修改为您的实际域名)
DOMAIN=your-domain.com
ADMIN_DOMAIN=admin.your-domain.com
API_DOMAIN=api.your-domain.com

# 邮件配置
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# 监控配置
PROMETHEUS_RETENTION=200h
GRAFANA_ADMIN_PASSWORD=admin

# 日志配置
LOG_LEVEL=INFO

# 系统资源限制
ELASTICSEARCH_MEMORY=512m
REDIS_MEMORY=256mb
MYSQL_MEMORY=512m
EOF
        log_success "已创建默认 .env 文件，请根据实际情况修改配置"
    fi
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."
    
    mkdir -p data logs/nginx deploy/docker/ssl
    mkdir -p deploy/docker/monitoring/grafana
    
    log_success "目录创建完成"
}

# 生成SSL证书 (自签名，生产环境请使用Let's Encrypt)
generate_ssl_cert() {
    log_info "生成SSL证书..."
    
    if [ ! -f "deploy/docker/ssl/cert.pem" ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout deploy/docker/ssl/key.pem \
            -out deploy/docker/ssl/cert.pem \
            -subj "/C=CN/ST=Beijing/L=Beijing/O=DivineFriend/OU=IT/CN=your-domain.com"
        log_success "SSL证书生成完成"
    else
        log_info "SSL证书已存在，跳过生成"
    fi
}

# 构建镜像
build_images() {
    log_info "构建Docker镜像..."
    
    # 构建前端镜像
    log_info "构建前端镜像..."
    docker build -f deploy/docker/Dockerfile.frontend -t divine-friend/frontend:latest ../../frontend
    
    # 构建管理后台镜像
    log_info "构建管理后台镜像..."
    docker build -f deploy/docker/Dockerfile.admin -t divine-friend/admin:latest ../../admin-dashboard
    
    # 构建后端镜像
    log_info "构建后端镜像..."
    docker build -f deploy/docker/Dockerfile.backend -t divine-friend/backend:latest ../../backend
    
    log_success "镜像构建完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    # 停止现有服务
    docker-compose -f deploy/docker/docker-compose.production.yml down
    
    # 启动服务
    docker-compose -f deploy/docker/docker-compose.production.yml up -d
    
    log_success "服务启动完成"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 等待服务启动
    sleep 60
    
    # 检查后端API
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        log_success "后端API健康检查通过"
    else
        log_error "后端API健康检查失败"
        return 1
    fi
    
    # 检查前端
    if curl -f http://localhost > /dev/null 2>&1; then
        log_success "前端健康检查通过"
    else
        log_error "前端健康检查失败"
        return 1
    fi
    
    # 检查管理后台
    if curl -f http://localhost/admin > /dev/null 2>&1; then
        log_success "管理后台健康检查通过"
    else
        log_error "管理后台健康检查失败"
        return 1
    fi
    
    # 检查MySQL数据库
    if docker exec divine-mysql mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD:-root-password} > /dev/null 2>&1; then
        log_success "MySQL数据库健康检查通过"
    else
        log_error "MySQL数据库健康检查失败"
        return 1
    fi
    
    # 检查Redis
    if docker exec divine-redis redis-cli ping > /dev/null 2>&1; then
        log_success "Redis健康检查通过"
    else
        log_error "Redis健康检查失败"
        return 1
    fi
    
    # 检查Prometheus
    if curl -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
        log_success "Prometheus健康检查通过"
    else
        log_error "Prometheus健康检查失败"
        return 1
    fi
    
    # 检查Grafana
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        log_success "Grafana健康检查通过"
    else
        log_error "Grafana健康检查失败"
        return 1
    fi
    
    # 检查phpMyAdmin
    if curl -f http://localhost:8081 > /dev/null 2>&1; then
        log_success "phpMyAdmin健康检查通过"
    else
        log_error "phpMyAdmin健康检查失败"
        return 1
    fi
    
    # 检查Redis Commander
    if curl -f http://localhost:8082 > /dev/null 2>&1; then
        log_success "Redis Commander健康检查通过"
    else
        log_error "Redis Commander健康检查失败"
        return 1
    fi
    
    # 检查MailHog
    if curl -f http://localhost:8025 > /dev/null 2>&1; then
        log_success "MailHog健康检查通过"
    else
        log_error "MailHog健康检查失败"
        return 1
    fi
    
    log_success "所有服务健康检查通过"
}

# 显示部署信息
show_deployment_info() {
    log_success "部署完成！"
    echo ""
    echo "=== 服务访问地址 ==="
    echo "前端应用: https://your-domain.com"
    echo "管理后台: https://admin.your-domain.com"
    echo "API接口: https://api.your-domain.com"
    echo ""
    echo "=== 管理工具 ==="
    echo "数据库管理: http://localhost:8081 (phpMyAdmin)"
    echo "Redis管理: http://localhost:8082 (Redis Commander)"
    echo "邮件测试: http://localhost:8025 (MailHog)"
    echo ""
    echo "=== 监控面板 ==="
    echo "Grafana监控: http://localhost:3001"
    echo "Prometheus指标: http://localhost:9090"
    echo "系统监控: http://localhost:9100 (Node Exporter)"
    echo "Docker监控: http://localhost:8080 (cAdvisor)"
    echo ""
    echo "=== 日志分析 ==="
    echo "Kibana日志: http://localhost:5601 (可选)"
    echo ""
    echo "=== 管理命令 ==="
    echo "查看服务状态: docker-compose -f deploy/docker/docker-compose.production.yml ps"
    echo "查看日志: docker-compose -f deploy/docker/docker-compose.production.yml logs -f"
    echo "停止服务: docker-compose -f deploy/docker/docker-compose.production.yml down"
    echo "重启服务: docker-compose -f deploy/docker/docker-compose.production.yml restart"
    echo ""
    echo "=== 数据库管理 ==="
    echo "MySQL连接: mysql -h localhost -P 3306 -u divine_friend -p"
    echo "Redis连接: redis-cli -h localhost -p 6379 -a your-redis-password"
    echo ""
    echo "=== 重要提醒 ==="
    echo "1. 请修改 .env 文件中的域名配置"
    echo "2. 生产环境请使用Let's Encrypt获取SSL证书"
    echo "3. 请修改默认密码和密钥"
    echo "4. 建议配置防火墙和安全组"
    echo "5. 定期备份数据库和配置文件"
    echo "6. 监控系统资源使用情况"
}

# 主函数
main() {
    echo "🚀 Divine Friend PWA 生产环境部署脚本"
    echo "========================================"
    
    # 检查参数
    ENVIRONMENT=${1:-production}
    
    case $ENVIRONMENT in
        production|staging|development)
            log_info "部署环境: $ENVIRONMENT"
            ;;
        *)
            log_error "无效的部署环境: $ENVIRONMENT"
            echo "使用方法: $0 [production|staging|development]"
            exit 1
            ;;
    esac
    
    # 执行部署步骤
    check_dependencies
    check_env_file
    create_directories
    generate_ssl_cert
    build_images
    start_services
    health_check
    show_deployment_info
}

# 执行主函数
main "$@" 