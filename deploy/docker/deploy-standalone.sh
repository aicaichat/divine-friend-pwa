#!/bin/bash

# Divine Friend PWA 独立Docker部署脚本
# 不依赖外部Nginx，使用内置Nginx容器

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

# 检查依赖
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

# 检查端口占用
check_ports() {
    log_info "检查端口占用..."
    
    local ports=(80 443)
    
    for port in "${ports[@]}"; do
        if netstat -tlnp 2>/dev/null | grep ":$port " > /dev/null; then
            log_warning "端口 $port 已被占用，请检查现有服务"
            log_info "建议停止占用端口的服务或修改端口映射"
        else
            log_info "端口 $port 可用"
        fi
    done
}

# 检查环境变量文件
check_env_file() {
    if [ ! -f ".env" ]; then
        log_warning "未找到 .env 文件，创建默认配置..."
        cat > .env << EOF
# Divine Friend PWA 独立Docker配置

# 应用配置
SECRET_KEY=your-super-secret-key-change-this-in-production
REDIS_PASSWORD=your-redis-password
GRAFANA_PASSWORD=admin

# 数据库配置
MYSQL_ROOT_PASSWORD=root-password-change-this
MYSQL_PASSWORD=divine-friend-password-change-this
MYSQL_DATABASE=divine_friend_prod

# 域名配置
DOMAIN=bless.top
FRONTEND_DOMAIN=today.bless.top
API_DOMAIN=api.bless.top
ADMIN_DOMAIN=admin.bless.top
TOOLS_DOMAIN=tools.bless.top
MONITOR_DOMAIN=monitor.bless.top

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
    
    mkdir -p data logs deploy/docker/nginx/ssl deploy/docker/nginx/logs
    mkdir -p deploy/docker/monitoring/grafana
    
    log_success "目录创建完成"
}

# 生成SSL证书
generate_ssl_cert() {
    log_info "生成SSL证书..."
    
    local ssl_dir="deploy/docker/nginx/ssl"
    
    if [ ! -f "$ssl_dir/bless.top.crt" ] || [ ! -f "$ssl_dir/bless.top.key" ]; then
        log_warning "未找到SSL证书，生成自签名证书..."
        
        # 生成自签名证书
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$ssl_dir/bless.top.key" \
            -out "$ssl_dir/bless.top.crt" \
            -subj "/C=CN/ST=Beijing/L=Beijing/O=Divine Friend/OU=IT/CN=*.bless.top"
        
        log_success "自签名证书生成完成"
        log_warning "生产环境请使用正式的SSL证书替换自签名证书"
    else
        log_success "SSL证书已存在"
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
    docker-compose -f deploy/docker/docker-compose.production-standalone.yml down
    
    # 启动服务
    docker-compose -f deploy/docker/docker-compose.production-standalone.yml up -d
    
    log_success "服务启动完成"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 等待服务启动
    sleep 60
    
    # 检查Nginx
    if curl -f http://localhost:80 > /dev/null 2>&1; then
        log_success "Nginx健康检查通过"
    else
        log_error "Nginx健康检查失败"
        return 1
    fi
    
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
    
    log_success "所有服务健康检查通过"
}

# 显示部署信息
show_deployment_info() {
    log_success "部署完成！"
    echo ""
    echo "=== 服务访问地址 ==="
    echo "前端应用: https://today.bless.top"
    echo "API接口: https://api.bless.top"
    echo "管理后台: https://admin.bless.top"
    echo ""
    echo "=== 管理工具 (可选) ==="
    echo "数据库管理: https://tools.bless.top/phpmyadmin/"
    echo "Redis管理: https://tools.bless.top/redis/"
    echo "邮件测试: https://tools.bless.top/mail/"
    echo ""
    echo "=== 监控面板 (可选) ==="
    echo "Grafana监控: https://monitor.bless.top/grafana/"
    echo "Prometheus指标: https://monitor.bless.top/prometheus/"
    echo "Docker监控: https://monitor.bless.top/cadvisor/"
    echo ""
    echo "=== 本地访问地址 ==="
    echo "前端应用: http://localhost"
    echo "API接口: http://localhost/api"
    echo "管理后台: http://localhost/admin"
    echo "phpMyAdmin: http://localhost/tools/phpmyadmin/"
    echo "Redis Commander: http://localhost/tools/redis/"
    echo "MailHog: http://localhost/tools/mail/"
    echo "Grafana: http://localhost/monitor/grafana/"
    echo "Prometheus: http://localhost/monitor/prometheus/"
    echo ""
    echo "=== 管理命令 ==="
    echo "查看服务状态: docker-compose -f deploy/docker/docker-compose.production-standalone.yml ps"
    echo "查看日志: docker-compose -f deploy/docker/docker-compose.production-standalone.yml logs -f"
    echo "停止服务: docker-compose -f deploy/docker/docker-compose.production-standalone.yml down"
    echo "重启服务: docker-compose -f deploy/docker/docker-compose.production-standalone.yml restart"
    echo ""
    echo "=== DNS配置 ==="
    echo "请确保以下DNS记录已配置："
    echo "A     today   -> 服务器IP"
    echo "A     api     -> 服务器IP"
    echo "A     admin   -> 服务器IP"
    echo "A     tools   -> 服务器IP (可选)"
    echo "A     monitor -> 服务器IP (可选)"
    echo ""
    echo "=== SSL证书 ==="
    echo "当前使用自签名证书，生产环境请替换为正式证书："
    echo "证书路径: deploy/docker/nginx/ssl/bless.top.crt"
    echo "私钥路径: deploy/docker/nginx/ssl/bless.top.key"
    echo ""
    echo "=== 重要提醒 ==="
    echo "1. 请修改 .env 文件中的密码和密钥"
    echo "2. 生产环境请使用正式的SSL证书"
    echo "3. 建议配置防火墙和安全组"
    echo "4. 定期备份数据库和配置文件"
    echo "5. 监控系统资源使用情况"
    echo ""
    echo "=== 优势说明 ==="
    echo "✅ 完全独立，不依赖外部Nginx"
    echo "✅ 一键部署，配置简单"
    echo "✅ 内置SSL证书支持"
    echo "✅ 完整的监控和管理工具"
    echo "✅ 支持多域名配置"
}

# 主函数
main() {
    echo "🚀 Divine Friend PWA 独立Docker部署脚本"
    echo "=========================================="
    
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
    check_ports
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