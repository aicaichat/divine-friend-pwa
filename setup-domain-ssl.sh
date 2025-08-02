#!/bin/bash

# Divine Friend PWA 域名和SSL配置脚本
# 配置 today.bless.top 子域名并申请HTTPS证书

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 域名配置
DOMAIN="today.bless.top"
API_DOMAIN="api.bless.top"
ADMIN_DOMAIN="admin.bless.top"
EMAIL="admin@bless.top"  # 请替换为您的邮箱

echo "🌐 Divine Friend PWA 域名和SSL配置"
echo "=================================="
echo "主域名: $DOMAIN"
echo "API域名: $API_DOMAIN"
echo "管理域名: $ADMIN_DOMAIN"
echo ""

# 1. 检查并修复服务状态
check_and_fix_services() {
    log_info "检查并修复服务状态..."
    
    # 停止可能的冲突进程
    pkill -f "python.*app.py" 2>/dev/null || true
    pkill -f "serve.*dist" 2>/dev/null || true
    pkill -f "node.*serve" 2>/dev/null || true
    
    # 清理PID文件
    rm -f logs/*.pid 2>/dev/null || true
    
    # 重新启动服务
    if [ -f "start-services.sh" ]; then
        log_info "重新启动应用服务..."
        chmod +x start-services.sh
        ./start-services.sh
        sleep 5
    else
        log_error "start-services.sh 不存在，请先运行部署脚本"
        return 1
    fi
}

# 2. 安装必要的软件
install_dependencies() {
    log_info "安装必要的软件..."
    
    # 安装Nginx和Certbot
    sudo yum update -y
    sudo yum install -y nginx certbot python3-certbot-nginx
    
    # 启动并启用Nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    log_success "软件安装完成"
}

# 3. 配置Nginx反向代理
configure_nginx() {
    log_info "配置Nginx反向代理..."
    
    # 创建Nginx配置文件
    sudo tee /etc/nginx/conf.d/divine-friend.conf << 'EOF'
# Divine Friend PWA Nginx配置

# 前端应用 - today.bless.top
server {
    listen 80;
    server_name today.bless.top;
    
    # 允许Let's Encrypt验证
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # 反向代理到前端应用
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # 处理WebSocket连接（如果需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# API服务 - api.bless.top
server {
    listen 80;
    server_name api.bless.top;
    
    # 允许Let's Encrypt验证
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # 反向代理到后端API
    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}

# 管理后台 - admin.bless.top
server {
    listen 80;
    server_name admin.bless.top;
    
    # 允许Let's Encrypt验证
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # 反向代理到管理后台
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # 处理WebSocket连接
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

    # 创建网站根目录
    sudo mkdir -p /var/www/html
    sudo chown -R nginx:nginx /var/www/html
    
    # 测试Nginx配置
    sudo nginx -t
    
    # 重新加载Nginx
    sudo systemctl reload nginx
    
    log_success "Nginx配置完成"
}

# 4. 申请SSL证书
request_ssl_certificates() {
    log_info "申请SSL证书..."
    
    # 为所有域名申请证书
    log_info "为 $DOMAIN 申请证书..."
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL
    
    log_info "为 $API_DOMAIN 申请证书..."
    sudo certbot --nginx -d $API_DOMAIN --non-interactive --agree-tos --email $EMAIL
    
    log_info "为 $ADMIN_DOMAIN 申请证书..."
    sudo certbot --nginx -d $ADMIN_DOMAIN --non-interactive --agree-tos --email $EMAIL
    
    # 设置自动续期
    sudo systemctl enable certbot-renew.timer
    sudo systemctl start certbot-renew.timer
    
    log_success "SSL证书申请完成"
}

# 5. 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."
    
    # 开放HTTP和HTTPS端口
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    
    # 保持原有端口开放（用于直接访问）
    sudo firewall-cmd --permanent --add-port=3001/tcp
    sudo firewall-cmd --permanent --add-port=3002/tcp
    sudo firewall-cmd --permanent --add-port=5001/tcp
    
    # 重新加载防火墙
    sudo firewall-cmd --reload
    
    log_success "防火墙配置完成"
}

# 6. 验证部署
verify_deployment() {
    log_info "验证部署..."
    
    echo ""
    echo "🧪 测试本地服务:"
    
    # 测试本地服务
    if curl -s http://localhost:3001 > /dev/null; then
        log_success "前端服务 (3001) 正常"
    else
        log_error "前端服务 (3001) 异常"
    fi
    
    if curl -s http://localhost:3002 > /dev/null; then
        log_success "管理后台 (3002) 正常"
    else
        log_error "管理后台 (3002) 异常"
    fi
    
    if curl -s http://localhost:5001/api/health > /dev/null; then
        log_success "后端API (5001) 正常"
    else
        log_error "后端API (5001) 异常"
    fi
    
    echo ""
    echo "🌐 测试域名访问:"
    
    # 测试域名访问
    if curl -s -k https://$DOMAIN > /dev/null; then
        log_success "前端域名 ($DOMAIN) 可访问"
    else
        log_warning "前端域名 ($DOMAIN) 可能需要等待DNS生效"
    fi
    
    if curl -s -k https://$API_DOMAIN/api/health > /dev/null; then
        log_success "API域名 ($API_DOMAIN) 可访问"
    else
        log_warning "API域名 ($API_DOMAIN) 可能需要等待DNS生效"
    fi
    
    if curl -s -k https://$ADMIN_DOMAIN > /dev/null; then
        log_success "管理域名 ($ADMIN_DOMAIN) 可访问"
    else
        log_warning "管理域名 ($ADMIN_DOMAIN) 可能需要DNS生效"
    fi
}

# 7. 显示部署信息
show_deployment_info() {
    log_success "域名和SSL配置完成！"
    echo ""
    echo "🎉 Divine Friend PWA 已配置完成"
    echo "=================================="
    echo ""
    echo "📡 HTTPS访问地址:"
    echo "• 前端应用: https://$DOMAIN"
    echo "• API接口: https://$API_DOMAIN"
    echo "• 管理后台: https://$ADMIN_DOMAIN"
    echo ""
    echo "🔒 SSL证书状态:"
    sudo certbot certificates
    echo ""
    echo "🔥 HTTP访问地址 (自动跳转HTTPS):"
    echo "• 前端应用: http://$DOMAIN"
    echo "• API接口: http://$API_DOMAIN"
    echo "• 管理后台: http://$ADMIN_DOMAIN"
    echo ""
    echo "🛠️ 直接端口访问 (备用):"
    echo "• 前端应用: http://47.99.122.96:3001"
    echo "• 管理后台: http://47.99.122.96:3002"
    echo "• 后端API: http://47.99.122.96:5001"
    echo ""
    echo "🔧 管理命令:"
    echo "• 查看服务状态: ./manage-services.sh status"
    echo "• 重启服务: ./manage-services.sh restart"
    echo "• 查看Nginx状态: sudo systemctl status nginx"
    echo "• 重新加载Nginx: sudo systemctl reload nginx"
    echo "• 查看SSL证书: sudo certbot certificates"
    echo "• 续期SSL证书: sudo certbot renew"
    echo ""
    echo "⚠️ 重要提醒:"
    echo "1. 请确保DNS记录已正确配置:"
    echo "   A    today   ->  47.99.122.96"
    echo "   A    api     ->  47.99.122.96"
    echo "   A    admin   ->  47.99.122.96"
    echo ""
    echo "2. SSL证书将自动续期"
    echo "3. 所有HTTP请求将自动跳转到HTTPS"
    echo "4. 如果域名无法访问，请检查DNS配置和等待生效时间"
}

# 主函数
main() {
    log_info "开始配置域名和SSL证书..."
    
    # 检查是否为root用户
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用root用户运行此脚本"
        exit 1
    fi
    
    case "${1:-all}" in
        "services")
            check_and_fix_services
            ;;
        "nginx")
            install_dependencies
            configure_nginx
            configure_firewall
            ;;
        "ssl")
            request_ssl_certificates
            ;;
        "verify")
            verify_deployment
            ;;
        "all")
            check_and_fix_services
            install_dependencies
            configure_nginx
            configure_firewall
            request_ssl_certificates
            verify_deployment
            show_deployment_info
            ;;
        *)
            echo "用法: $0 {all|services|nginx|ssl|verify}"
            echo "  all      - 完整配置（默认）"
            echo "  services - 仅修复服务"
            echo "  nginx    - 仅配置Nginx"
            echo "  ssl      - 仅申请SSL证书"
            echo "  verify   - 仅验证部署"
            exit 1
            ;;
    esac
}

main "$@" 