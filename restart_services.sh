#!/bin/bash

# Divine Friend PWA 重启服务脚本

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

# 停止服务
stop_services() {
    log_info "停止现有服务..."
    
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
    
    # 等待进程完全停止
    sleep 3
    
    # 强制清理端口
    PORT_3003_PID=$(lsof -ti:3003 2>/dev/null || true)
    if [ ! -z "$PORT_3003_PID" ]; then
        kill -9 $PORT_3003_PID 2>/dev/null || true
    fi
    
    PORT_3001_PID=$(lsof -ti:3001 2>/dev/null || true)
    if [ ! -z "$PORT_3001_PID" ]; then
        kill -9 $PORT_3001_PID 2>/dev/null || true
    fi
    
    PORT_5001_PID=$(lsof -ti:5001 2>/dev/null || true)
    if [ ! -z "$PORT_5001_PID" ]; then
        kill -9 $PORT_5001_PID 2>/dev/null || true
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
    cd ..
}

# 等待服务启动
wait_for_services() {
    log_info "等待服务启动..."
    sleep 15
    
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
    log_success "所有服务重启完成！"
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
}

# 创建日志目录
create_logs_dir() {
    if [ ! -d "logs" ]; then
        mkdir -p logs
        log_info "创建日志目录: logs/"
    fi
}

# 主函数
main() {
    case "${1:-restart}" in
        "restart")
            log_info "开始重启 Divine Friend PWA..."
            create_logs_dir
            stop_services
            start_backend
            start_frontend
            start_admin
            wait_for_services
            show_services_info
            ;;
        "backend")
            log_info "重启后端服务..."
            create_logs_dir
            if [ -f "logs/backend.pid" ]; then
                BACKEND_PID=$(cat logs/backend.pid)
                if kill -0 $BACKEND_PID 2>/dev/null; then
                    kill $BACKEND_PID
                    rm -f logs/backend.pid
                fi
            fi
            sleep 2
            start_backend
            log_success "后端服务重启完成"
            ;;
        "frontend")
            log_info "重启前端服务..."
            create_logs_dir
            if [ -f "logs/frontend.pid" ]; then
                FRONTEND_PID=$(cat logs/frontend.pid)
                if kill -0 $FRONTEND_PID 2>/dev/null; then
                    kill $FRONTEND_PID
                    rm -f logs/frontend.pid
                fi
            fi
            sleep 2
            start_frontend
            log_success "前端服务重启完成"
            ;;
        "admin")
            log_info "重启管理后台..."
            create_logs_dir
            if [ -f "logs/admin.pid" ]; then
                ADMIN_PID=$(cat logs/admin.pid)
                if kill -0 $ADMIN_PID 2>/dev/null; then
                    kill $ADMIN_PID
                    rm -f logs/admin.pid
                fi
            fi
            sleep 2
            start_admin
            log_success "管理后台重启完成"
            ;;
        *)
            echo "用法: $0 {restart|backend|frontend|admin}"
            echo "  restart - 重启所有服务"
            echo "  backend - 仅重启后端服务"
            echo "  frontend - 仅重启前端服务"
            echo "  admin   - 仅重启管理后台"
            exit 1
            ;;
    esac
}

main "$@" 