#!/bin/bash

# Divine Friend PWA 外部Nginx环境部署脚本
# 适配 bless.top 域名结构

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
    
    if ! command -v nginx &> /dev/null; then
        log_error "Nginx 未安装"
        exit 1
    fi
    
    log_success "依赖检查通过"
}

# 检查端口占用
check_ports() {
    log_info "检查端口占用..."
    
    local ports=(3001 3002 5000 8081 8082 8025 3003 9090 9100 8080)
    
    for port in "${ports[@]}"; do
        if netstat -tlnp 2>/dev/null | grep ":$port " > /dev/null; then
            log_warning "端口 $port 已被占用，请检查现有服务"
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
# Divine Friend PWA bless.top 域名配置

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

# 容器端口映射
FRONTEND_PORT=3001
ADMIN_PORT=3002
BACKEND_PORT=5000
PMA_PORT=8081
REDIS_COMMANDER_PORT=8082
MAILHOG_WEB_PORT=8025
GRAFANA_PORT=3003
PROMETHEUS_PORT=9090
NODE_EXPORTER_PORT=9100
CADVISOR_PORT=8080

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
    
    mkdir -p data logs deploy/docker/nginx-external
    mkdir -p deploy/docker/monitoring/grafana
    
    log_success "目录创建完成"
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
    docker-compose -f deploy/docker/docker-compose.production-nginx-external.yml down
    
    # 启动服务
    docker-compose -f deploy/docker/docker-compose.production-nginx-external.yml up -d
    
    log_success "服务启动完成"
}

# 配置外部Nginx
configure_external_nginx() {
    log_info "配置外部Nginx..."
    
    # 检查Nginx配置目录
    local nginx_conf_dir="/etc/nginx"
    if [ ! -d "$nginx_conf_dir" ]; then
        log_error "Nginx配置目录不存在: $nginx_conf_dir"
        exit 1
    fi
    
    # 备份现有配置
    if [ -f "$nginx_conf_dir/nginx.conf" ]; then
        cp "$nginx_conf_dir/nginx.conf" "$nginx_conf_dir/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)"
        log_info "已备份现有Nginx配置"
    fi
    
    # 复制Nginx配置
    cp deploy/docker/nginx-external/nginx.conf "$nginx_conf_dir/sites-available/divine-friend"
    
    # 创建软链接
    if [ ! -L "$nginx_conf_dir/sites-enabled/divine-friend" ]; then
        ln -s "$nginx_conf_dir/sites-available/divine-friend" "$nginx_conf_dir/sites-enabled/"
        log_info "已创建Nginx站点配置软链接"
    fi
    
    # 测试Nginx配置
    if nginx -t; then
        log_success "Nginx配置测试通过"
        
        # 重新加载Nginx
        systemctl reload nginx
        log_success "Nginx配置已重新加载"
    else
        log_error "Nginx配置测试失败"
        exit 1
    fi
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 等待服务启动
    sleep 60
    
    # 检查后端API
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        log_success "后端API健康检查通过"
    else
        log_error "后端API健康检查失败"
        return 1
    fi
    
    # 检查前端
    if curl -f http://localhost:3001 > /dev/null 2>&1; then
        log_success "前端健康检查通过"
    else
        log_error "前端健康检查失败"
        return 1
    fi
    
    # 检查管理后台
    if curl -f http://localhost:3002 > /dev/null 2>&1; then
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
    
    # 检查Nginx
    if systemctl is-active --quiet nginx; then
        log_success "Nginx服务健康检查通过"
    else
        log_error "Nginx服务健康检查失败"
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
    echo "前端应用: http://localhost:3001"
    echo "管理后台: http://localhost:3002"
    echo "后端API: http://localhost:5000"
    echo "phpMyAdmin: http://localhost:8081"
    echo "Redis Commander: http://localhost:8082"
    echo "MailHog: http://localhost:8025"
    echo "Grafana: http://localhost:3003"
    echo "Prometheus: http://localhost:9090"
    echo ""
    echo "=== 管理命令 ==="
    echo "查看服务状态: docker-compose -f deploy/docker/docker-compose.production-nginx-external.yml ps"
    echo "查看日志: docker-compose -f deploy/docker/docker-compose.production-nginx-external.yml logs -f"
    echo "停止服务: docker-compose -f deploy/docker/docker-compose.production-nginx-external.yml down"
    echo "重启服务: docker-compose -f deploy/docker/docker-compose.production-nginx-external.yml restart"
    echo "重启Nginx: sudo systemctl reload nginx"
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
    echo "请确保 bless.top 的SSL证书支持以下域名："
    echo "- *.bless.top (通配符证书)"
    echo "或单独为每个子域名配置证书"
    echo ""
    echo "=== 重要提醒 ==="
    echo "1. 请修改 .env 文件中的密码和密钥"
    echo "2. 请确保SSL证书路径正确"
    echo "3. 建议配置防火墙和安全组"
    echo "4. 定期备份数据库和配置文件"
    echo "5. 监控系统资源使用情况"
    echo ""
    echo "=== Nginx配置说明 ==="
    echo "配置文件位置: /etc/nginx/sites-available/divine-friend"
    echo "启用配置: sudo ln -s /etc/nginx/sites-available/divine-friend /etc/nginx/sites-enabled/"
    echo "测试配置: sudo nginx -t"
    echo "重新加载: sudo systemctl reload nginx"
}

# 主函数
main() {
    echo "🚀 Divine Friend PWA bless.top 域名部署脚本"
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
    build_images
    start_services
    configure_external_nginx
    health_check
    show_deployment_info
}

# 执行主函数
main "$@" 