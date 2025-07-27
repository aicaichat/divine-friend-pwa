#!/bin/bash

# Divine Friend PWA Backend 部署脚本
# 作者: 世界级软件工程师和运维专家
# 版本: 1.0.0

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="divine-friend-pwa"
BACKEND_IMAGE="divine-friend/backend"
VERSION="${1:-latest}"
ENVIRONMENT="${2:-production}"
DEPLOY_TYPE="${3:-docker}" # docker, kubernetes, standalone

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
    log_info "检查部署依赖..."
    
    case $DEPLOY_TYPE in
        "docker")
            if ! command -v docker &> /dev/null; then
                log_error "Docker 未安装"
                exit 1
            fi
            if ! command -v docker-compose &> /dev/null; then
                log_error "Docker Compose 未安装"
                exit 1
            fi
            ;;
        "kubernetes")
            if ! command -v kubectl &> /dev/null; then
                log_error "kubectl 未安装"
                exit 1
            fi
            ;;
        "standalone")
            if ! command -v python3 &> /dev/null; then
                log_error "Python3 未安装"
                exit 1
            fi
            ;;
    esac
    
    log_success "依赖检查完成"
}

# 构建镜像
build_image() {
    log_info "构建 Docker 镜像..."
    
    docker build -t ${BACKEND_IMAGE}:${VERSION} .
    docker tag ${BACKEND_IMAGE}:${VERSION} ${BACKEND_IMAGE}:latest
    
    log_success "镜像构建完成: ${BACKEND_IMAGE}:${VERSION}"
}

# 部署到Docker
deploy_docker() {
    log_info "使用 Docker Compose 部署..."
    
    # 停止现有服务
    docker-compose down || true
    
    # 清理旧容器
    docker container prune -f
    
    # 启动服务
    docker-compose up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 健康检查
    if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
        log_success "Docker 部署成功! 服务运行在 http://localhost:5001"
    else
        log_error "Docker 部署失败，服务健康检查不通过"
        docker-compose logs
        exit 1
    fi
}

# 部署到Kubernetes
deploy_kubernetes() {
    log_info "部署到 Kubernetes..."
    
    # 创建命名空间
    kubectl create namespace divine-friend || true
    
    # 应用配置
    kubectl apply -f deploy/kubernetes/
    
    # 等待部署完成
    kubectl rollout status deployment/divine-friend-backend -n divine-friend
    
    log_success "Kubernetes 部署成功!"
    kubectl get pods -n divine-friend
}

# 独立部署
deploy_standalone() {
    log_info "独立部署..."
    
    # 创建虚拟环境
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    # 激活虚拟环境
    source venv/bin/activate
    
    # 安装依赖
    pip install -r requirements.txt
    
    # 创建systemd服务文件
    create_systemd_service
    
    # 启动服务
    sudo systemctl enable divine-friend-backend
    sudo systemctl start divine-friend-backend
    
    log_success "独立部署成功! 服务已作为 systemd 服务启动"
}

# 创建systemd服务
create_systemd_service() {
    log_info "创建 systemd 服务..."
    
    sudo tee /etc/systemd/system/divine-friend-backend.service > /dev/null <<EOF
[Unit]
Description=Divine Friend PWA Backend
After=network.target

[Service]
Type=exec
User=divine-friend
Group=divine-friend
WorkingDirectory=$(pwd)
Environment=PATH=$(pwd)/venv/bin
ExecStart=$(pwd)/venv/bin/gunicorn --config gunicorn.conf.py wsgi:app
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
}

# 备份数据
backup_data() {
    log_info "备份数据..."
    
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    # 备份Redis数据 (如果存在)
    if [ -f "/var/lib/redis/dump.rdb" ]; then
        cp /var/lib/redis/dump.rdb $BACKUP_DIR/
    fi
    
    # 备份配置文件
    cp -r config $BACKUP_DIR/ || true
    
    log_success "数据备份完成: $BACKUP_DIR"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
            log_success "健康检查通过"
            return 0
        fi
        
        log_info "健康检查失败，重试 ($attempt/$max_attempts)..."
        sleep 5
        ((attempt++))
    done
    
    log_error "健康检查失败"
    return 1
}

# 回滚
rollback() {
    log_warning "执行回滚..."
    
    case $DEPLOY_TYPE in
        "docker")
            docker-compose down
            docker-compose up -d
            ;;
        "kubernetes")
            kubectl rollout undo deployment/divine-friend-backend -n divine-friend
            ;;
        "standalone")
            sudo systemctl restart divine-friend-backend
            ;;
    esac
    
    log_success "回滚完成"
}

# 清理
cleanup() {
    log_info "清理资源..."
    
    # 清理旧的Docker镜像
    docker image prune -f
    
    # 清理旧的备份 (保留最近10个)
    if [ -d "backups" ]; then
        ls -t backups/ | tail -n +11 | xargs -I {} rm -rf backups/{}
    fi
    
    log_success "清理完成"
}

# 显示帮助
show_help() {
    echo "Divine Friend PWA Backend 部署脚本"
    echo ""
    echo "用法: $0 [版本] [环境] [部署类型]"
    echo ""
    echo "参数:"
    echo "  版本      Docker镜像版本 (默认: latest)"
    echo "  环境      部署环境 (development/production, 默认: production)"
    echo "  部署类型   部署方式 (docker/kubernetes/standalone, 默认: docker)"
    echo ""
    echo "示例:"
    echo "  $0 v1.0.0 production docker"
    echo "  $0 latest development kubernetes"
    echo "  $0 v1.0.0 production standalone"
    echo ""
    echo "环境变量:"
    echo "  SKIP_BUILD=true   跳过镜像构建"
    echo "  SKIP_BACKUP=true  跳过数据备份"
}

# 主函数
main() {
    if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        show_help
        exit 0
    fi
    
    log_info "开始部署 Divine Friend PWA Backend"
    log_info "版本: $VERSION, 环境: $ENVIRONMENT, 部署类型: $DEPLOY_TYPE"
    
    # 检查依赖
    check_dependencies
    
    # 备份数据
    if [ "$SKIP_BACKUP" != "true" ]; then
        backup_data
    fi
    
    # 构建镜像
    if [ "$DEPLOY_TYPE" = "docker" ] || [ "$DEPLOY_TYPE" = "kubernetes" ]; then
        if [ "$SKIP_BUILD" != "true" ]; then
            build_image
        fi
    fi
    
    # 部署
    case $DEPLOY_TYPE in
        "docker")
            deploy_docker
            ;;
        "kubernetes")
            deploy_kubernetes
            ;;
        "standalone")
            deploy_standalone
            ;;
        *)
            log_error "不支持的部署类型: $DEPLOY_TYPE"
            exit 1
            ;;
    esac
    
    # 健康检查
    if ! health_check; then
        log_error "部署失败，执行回滚..."
        rollback
        exit 1
    fi
    
    # 清理
    cleanup
    
    log_success "🎉 Divine Friend PWA Backend 部署成功!"
    log_info "API地址: http://localhost:5001"
    log_info "健康检查: http://localhost:5001/api/health"
    log_info "监控地址: http://localhost:9090 (如果启用了Prometheus)"
}

# 错误处理
trap 'log_error "部署脚本执行失败!"; exit 1' ERR

# 执行主函数
main "$@" 