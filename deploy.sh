#!/bin/bash

# 神仙朋友 PWA 一键部署脚本
# 支持开发环境和生产环境部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 显示帮助信息
show_help() {
    echo -e "${BLUE}神仙朋友 PWA 部署脚本${NC}"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -e, --env ENV        指定环境 (dev|prod) 默认: dev"
    echo "  -d, --down          停止服务"
    echo "  -r, --rebuild       重新构建镜像"
    echo "  -c, --clean         清理所有数据"
    echo "  -l, --logs          查看日志"
    echo "  -s, --status        查看服务状态"
    echo "  -h, --help          显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 --env dev         # 启动开发环境"
    echo "  $0 --env prod        # 启动生产环境"
    echo "  $0 --down           # 停止服务"
    echo "  $0 --rebuild        # 重新构建并启动"
}

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    log_info "依赖检查完成"
}

# 环境检查
check_environment() {
    log_info "检查环境配置..."
    
    if [ "$ENVIRONMENT" = "prod" ]; then
        if [ ! -f ".env.prod" ]; then
            log_warn "生产环境配置文件 .env.prod 不存在，创建示例文件"
            create_prod_env
        fi
    else
        if [ ! -f ".env" ]; then
            log_warn "开发环境配置文件 .env 不存在，创建示例文件"
            create_dev_env
        fi
    fi
}

# 创建开发环境配置
create_dev_env() {
    cat > .env << EOF
# 开发环境配置
FLASK_ENV=development
FLASK_DEBUG=true
SECRET_KEY=dev-secret-key-change-in-production
DATABASE_URL=sqlite:///data/divine_friend_dev.db
REDIS_URL=redis://localhost:6379/0
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
EOF
    log_info "已创建开发环境配置文件 .env"
}

# 创建生产环境配置
create_prod_env() {
    cat > .env.prod << EOF
# 生产环境配置
FLASK_ENV=production
SECRET_KEY=change-this-to-a-secure-secret-key
DATABASE_URL=sqlite:///data/divine_friend.db
REDIS_URL=redis://redis:6379/0
CORS_ORIGINS=https://divine-friend.com,https://www.divine-friend.com
GRAFANA_PASSWORD=change-this-password
EOF
    log_info "已创建生产环境配置文件 .env.prod"
    log_warn "请修改 .env.prod 中的敏感信息（SECRET_KEY, GRAFANA_PASSWORD等）"
}

# 启动服务
start_services() {
    local compose_file="docker-compose.yml"
    
    if [ "$ENVIRONMENT" = "dev" ]; then
        compose_file="docker-compose.dev.yml"
        log_info "启动开发环境..."
    else
        compose_file="docker-compose.prod.yml"
        log_info "启动生产环境..."
    fi
    
    if [ "$REBUILD" = true ]; then
        log_info "重新构建镜像..."
        docker-compose -f "$compose_file" build --no-cache
    fi
    
    log_info "启动服务..."
    docker-compose -f "$compose_file" up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 10
    
    # 健康检查
    check_health
}

# 停止服务
stop_services() {
    log_info "停止所有服务..."
    
    if [ -f "docker-compose.dev.yml" ]; then
        docker-compose -f docker-compose.dev.yml down
    fi
    
    if [ -f "docker-compose.prod.yml" ]; then
        docker-compose -f docker-compose.prod.yml down
    fi
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose down
    fi
    
    log_info "服务已停止"
}

# 清理数据
clean_data() {
    log_warn "这将删除所有数据，包括数据库、缓存和日志文件"
    read -p "确定要继续吗？ (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "清理数据..."
        
        # 停止服务
        stop_services
        
        # 删除卷
        docker volume prune -f
        
        # 删除数据文件
        sudo rm -rf data/* logs/*
        
        log_info "数据清理完成"
    else
        log_info "已取消清理操作"
    fi
}

# 查看日志
show_logs() {
    local compose_file="docker-compose.yml"
    
    if [ "$ENVIRONMENT" = "dev" ]; then
        compose_file="docker-compose.dev.yml"
    else
        compose_file="docker-compose.prod.yml"
    fi
    
    if [ -f "$compose_file" ]; then
        docker-compose -f "$compose_file" logs -f
    else
        log_error "找不到 Docker Compose 文件"
    fi
}

# 查看服务状态
show_status() {
    log_info "服务状态:"
    
    echo -e "\n${BLUE}Docker 容器状态:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo -e "\n${BLUE}健康检查:${NC}"
    check_health
}

# 健康检查
check_health() {
    local services=("frontend" "backend" "redis")
    
    for service in "${services[@]}"; do
        if [ "$ENVIRONMENT" = "dev" ]; then
            container_name="divine-friend-pwa-${service}-1"
        else
            container_name="divine-${service}"
        fi
        
        if docker ps --format '{{.Names}}' | grep -q "$container_name"; then
            echo -e "  ${GREEN}✓${NC} $service - 运行中"
        else
            echo -e "  ${RED}✗${NC} $service - 未运行"
        fi
    done
    
    # 检查端口
    if [ "$ENVIRONMENT" = "dev" ]; then
        echo -e "\n${BLUE}访问地址:${NC}"
        echo -e "  前端: ${GREEN}http://localhost:5173${NC}"
        echo -e "  后端: ${GREEN}http://localhost:5000${NC}"
        echo -e "  Redis管理: ${GREEN}http://localhost:8081${NC}"
    else
        echo -e "\n${BLUE}访问地址:${NC}"
        echo -e "  应用: ${GREEN}http://localhost${NC}"
        echo -e "  监控: ${GREEN}http://localhost:3001${NC} (Grafana)"
        echo -e "  指标: ${GREEN}http://localhost:9090${NC} (Prometheus)"
    fi
}

# 参数解析
ENVIRONMENT="dev"
REBUILD=false
ACTION="start"

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -d|--down)
            ACTION="stop"
            shift
            ;;
        -r|--rebuild)
            REBUILD=true
            shift
            ;;
        -c|--clean)
            ACTION="clean"
            shift
            ;;
        -l|--logs)
            ACTION="logs"
            shift
            ;;
        -s|--status)
            ACTION="status"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 验证环境参数
if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
    log_error "无效的环境: $ENVIRONMENT (只支持 dev 或 prod)"
    exit 1
fi

# 主逻辑
case $ACTION in
    start)
        check_dependencies
        check_environment
        start_services
        ;;
    stop)
        stop_services
        ;;
    clean)
        clean_data
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
esac

log_info "部署脚本执行完成" 