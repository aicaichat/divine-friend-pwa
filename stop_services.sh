#!/bin/bash

# Divine Friend PWA 停止服务脚本

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

# 停止所有服务
stop_services() {
    log_info "停止所有服务..."
    
    # 停止后端
    if [ -f "logs/backend.pid" ]; then
        BACKEND_PID=$(cat logs/backend.pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            log_success "后端服务已停止 (PID: $BACKEND_PID)"
        else
            log_warning "后端服务进程不存在"
        fi
        rm -f logs/backend.pid
    else
        log_warning "未找到后端PID文件"
    fi
    
    # 停止前端
    if [ -f "logs/frontend.pid" ]; then
        FRONTEND_PID=$(cat logs/frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            log_success "前端服务已停止 (PID: $FRONTEND_PID)"
        else
            log_warning "前端服务进程不存在"
        fi
        rm -f logs/frontend.pid
    else
        log_warning "未找到前端PID文件"
    fi
    
    # 停止管理后台
    if [ -f "logs/admin.pid" ]; then
        ADMIN_PID=$(cat logs/admin.pid)
        if kill -0 $ADMIN_PID 2>/dev/null; then
            kill $ADMIN_PID
            log_success "管理后台已停止 (PID: $ADMIN_PID)"
        else
            log_warning "管理后台进程不存在"
        fi
        rm -f logs/admin.pid
    else
        log_warning "未找到管理后台PID文件"
    fi
    
    # 强制停止可能残留的进程
    log_info "清理残留进程..."
    
    # 停止端口3003的进程
    PORT_3003_PID=$(lsof -ti:3003 2>/dev/null || true)
    if [ ! -z "$PORT_3003_PID" ]; then
        kill -9 $PORT_3003_PID 2>/dev/null || true
        log_success "清理端口3003进程"
    fi
    
    # 停止端口3001的进程
    PORT_3001_PID=$(lsof -ti:3001 2>/dev/null || true)
    if [ ! -z "$PORT_3001_PID" ]; then
        kill -9 $PORT_3001_PID 2>/dev/null || true
        log_success "清理端口3001进程"
    fi
    
    # 停止端口5001的进程
    PORT_5001_PID=$(lsof -ti:5001 2>/dev/null || true)
    if [ ! -z "$PORT_5001_PID" ]; then
        kill -9 $PORT_5001_PID 2>/dev/null || true
        log_success "清理端口5001进程"
    fi
    
    log_success "所有服务已停止"
}

# 检查服务状态
check_status() {
    log_info "检查服务状态..."
    
    if [ -f "logs/backend.pid" ] && kill -0 $(cat logs/backend.pid) 2>/dev/null; then
        log_warning "后端服务仍在运行"
    else
        log_success "后端服务已停止"
    fi
    
    if [ -f "logs/frontend.pid" ] && kill -0 $(cat logs/frontend.pid) 2>/dev/null; then
        log_warning "前端服务仍在运行"
    else
        log_success "前端服务已停止"
    fi
    
    if [ -f "logs/admin.pid" ] && kill -0 $(cat logs/admin.pid) 2>/dev/null; then
        log_warning "管理后台仍在运行"
    else
        log_success "管理后台已停止"
    fi
    
    # 检查端口占用
    if lsof -i:3003 >/dev/null 2>&1; then
        log_warning "端口3003仍被占用"
    else
        log_success "端口3003已释放"
    fi
    
    if lsof -i:3001 >/dev/null 2>&1; then
        log_warning "端口3001仍被占用"
    else
        log_success "端口3001已释放"
    fi
    
    if lsof -i:5001 >/dev/null 2>&1; then
        log_warning "端口5001仍被占用"
    else
        log_success "端口5001已释放"
    fi
}

# 主函数
main() {
    case "${1:-stop}" in
        "stop")
            stop_services
            check_status
            ;;
        "status")
            check_status
            ;;
        "force")
            log_info "强制停止所有服务..."
            stop_services
            # 强制杀死所有相关进程
            pkill -f "python.*app.py" 2>/dev/null || true
            pkill -f "npm.*dev" 2>/dev/null || true
            pkill -f "vite" 2>/dev/null || true
            log_success "强制停止完成"
            check_status
            ;;
        *)
            echo "用法: $0 {stop|status|force}"
            echo "  stop   - 正常停止所有服务"
            echo "  status - 检查服务状态"
            echo "  force  - 强制停止所有服务"
            exit 1
            ;;
    esac
}

main "$@" 