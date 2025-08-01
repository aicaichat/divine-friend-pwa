#!/bin/bash

# Divine Friend PWA 快速启动脚本
# 解决环境问题并提供完整启动方案

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
    log_info "检查系统依赖..."
    
    # 检查Python
    if command -v python3 &> /dev/null; then
        log_success "Python3 已安装: $(python3 --version)"
    else
        log_error "Python3 未安装，请先安装Python3"
        exit 1
    fi
    
    # 检查Node.js
    if command -v node &> /dev/null; then
        log_success "Node.js 已安装: $(node --version)"
    else
        log_error "Node.js 未安装，请先安装Node.js"
        exit 1
    fi
    
    # 检查npm
    if command -v npm &> /dev/null; then
        log_success "npm 已安装: $(npm --version)"
    else
        log_error "npm 未安装，请先安装npm"
        exit 1
    fi
}

# 设置后端环境
setup_backend() {
    log_info "设置后端环境..."
    
    cd backend
    
    # 检查虚拟环境
    if [ ! -d "venv" ]; then
        log_info "创建Python虚拟环境..."
        python3 -m venv venv
    fi
    
    # 激活虚拟环境
    log_info "激活虚拟环境..."
    source venv/bin/activate
    
    # 安装依赖
    log_info "安装Python依赖..."
    if [ -f "requirements-simple.txt" ]; then
        pip install -r requirements-simple.txt
    else
        pip install -r requirements.txt
    fi
    
    log_success "后端环境设置完成"
    cd ..
}

# 设置前端环境
setup_frontend() {
    log_info "设置前端环境..."
    
    cd frontend
    
    # 安装依赖
    log_info "安装前端依赖..."
    npm install
    
    log_success "前端环境设置完成"
    cd ..
}

# 设置管理后台环境
setup_admin() {
    log_info "设置管理后台环境..."
    
    cd admin-dashboard
    
    # 安装依赖
    log_info "安装管理后台依赖..."
    npm install
    
    log_success "管理后台环境设置完成"
    cd ..
}

# 启动Redis (可选)
start_redis() {
    log_info "检查Redis服务..."
    
    if command -v redis-server &> /dev/null; then
        if ! pgrep -x "redis-server" > /dev/null; then
            log_info "启动Redis服务..."
            redis-server --daemonize yes
            log_success "Redis服务已启动"
        else
            log_success "Redis服务已在运行"
        fi
    else
        log_warning "Redis未安装，将使用内存缓存"
    fi
}

# 启动后端服务
start_backend() {
    log_info "启动后端服务..."
    
    cd backend
    source venv/bin/activate
    
    # 在后台启动Flask应用
    nohup python app.py > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../logs/backend.pid
    
    log_success "后端服务已启动 (PID: $BACKEND_PID)"
    log_info "后端日志: logs/backend.log"
    cd ..
}

# 启动前端服务
start_frontend() {
    log_info "启动前端服务..."
    
    cd frontend
    
    # 在后台启动前端开发服务器
    nohup npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../logs/frontend.pid
    
    log_success "前端服务已启动 (PID: $FRONTEND_PID)"
    log_info "前端日志: logs/frontend.log"
    cd ..
}

# 启动管理后台
start_admin() {
    log_info "启动管理后台..."
    
    cd admin-dashboard
    
    # 在后台启动管理后台开发服务器
    nohup npm run dev > ../logs/admin.log 2>&1 &
    ADMIN_PID=$!
    echo $ADMIN_PID > ../logs/admin.pid
    
    log_success "管理后台已启动 (PID: $ADMIN_PID)"
    log_info "管理后台日志: logs/admin.log"
    cd ..
}

# 等待服务启动
wait_for_services() {
    log_info "等待服务启动..."
    sleep 10
    
    # 检查后端
    if curl -s http://localhost:5001/api/health > /dev/null; then
        log_success "后端服务健康检查通过"
    else
        log_warning "后端服务健康检查失败"
    fi
    
    # 检查前端
    if curl -s http://localhost:3003 > /dev/null; then
        log_success "前端服务健康检查通过"
    else
        log_warning "前端服务健康检查失败"
    fi
    
    # 检查管理后台
    if curl -s http://localhost:3001 > /dev/null; then
        log_success "管理后台健康检查通过"
    else
        log_warning "管理后台健康检查失败"
    fi
}

# 显示服务信息
show_services_info() {
    log_success "所有服务启动完成！"
    echo ""
    echo "=== 服务访问地址 ==="
    echo "前端应用: http://localhost:3003"
    echo "管理后台: http://localhost:3001"
    echo "后端API: http://localhost:5001"
    echo ""
    echo "=== 管理命令 ==="
    echo "查看日志: tail -f logs/*.log"
    echo "停止服务: ./stop_services.sh"
    echo "重启服务: ./restart_services.sh"
    echo ""
    echo "=== 开发工具 ==="
    echo "API文档: http://localhost:5001/api/docs"
    echo "健康检查: http://localhost:5001/api/health"
    echo ""
    echo "=== 注意事项 ==="
    echo "1. 前端端口: 3003 (避免冲突)"
    echo "2. 管理后台端口: 3001"
    echo "3. 后端API端口: 5001"
    echo "4. 所有日志文件在 logs/ 目录"
}

# 创建日志目录
create_logs_dir() {
    if [ ! -d "logs" ]; then
        mkdir -p logs
        log_info "创建日志目录: logs/"
    fi
}

# 停止所有服务
stop_services() {
    log_info "停止所有服务..."
    
    # 停止后端
    if [ -f "logs/backend.pid" ]; then
        BACKEND_PID=$(cat logs/backend.pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            log_success "后端服务已停止"
        fi
        rm -f logs/backend.pid
    fi
    
    # 停止前端
    if [ -f "logs/frontend.pid" ]; then
        FRONTEND_PID=$(cat logs/frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            log_success "前端服务已停止"
        fi
        rm -f logs/frontend.pid
    fi
    
    # 停止管理后台
    if [ -f "logs/admin.pid" ]; then
        ADMIN_PID=$(cat logs/admin.pid)
        if kill -0 $ADMIN_PID 2>/dev/null; then
            kill $ADMIN_PID
            log_success "管理后台已停止"
        fi
        rm -f logs/admin.pid
    fi
    
    log_success "所有服务已停止"
}

# 主函数
main() {
    case "${1:-start}" in
        "start")
            log_info "开始启动 Divine Friend PWA..."
            check_dependencies
            create_logs_dir
            setup_backend
            setup_frontend
            setup_admin
            start_redis
            start_backend
            start_frontend
            start_admin
            wait_for_services
            show_services_info
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            sleep 2
            main start
            ;;
        "setup")
            log_info "仅设置环境..."
            check_dependencies
            setup_backend
            setup_frontend
            setup_admin
            log_success "环境设置完成"
            ;;
        "status")
            log_info "检查服务状态..."
            if [ -f "logs/backend.pid" ] && kill -0 $(cat logs/backend.pid) 2>/dev/null; then
                log_success "后端服务运行中"
            else
                log_error "后端服务未运行"
            fi
            if [ -f "logs/frontend.pid" ] && kill -0 $(cat logs/frontend.pid) 2>/dev/null; then
                log_success "前端服务运行中"
            else
                log_error "前端服务未运行"
            fi
            if [ -f "logs/admin.pid" ] && kill -0 $(cat logs/admin.pid) 2>/dev/null; then
                log_success "管理后台运行中"
            else
                log_error "管理后台未运行"
            fi
            ;;
        *)
            echo "用法: $0 {start|stop|restart|setup|status}"
            echo "  start   - 启动所有服务"
            echo "  stop    - 停止所有服务"
            echo "  restart - 重启所有服务"
            echo "  setup   - 仅设置环境"
            echo "  status  - 检查服务状态"
            exit 1
            ;;
    esac
}

main "$@" 