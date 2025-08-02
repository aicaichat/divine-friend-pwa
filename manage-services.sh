#!/bin/bash

# Divine Friend PWA 服务管理脚本

case "$1" in
    start)
        echo "🚀 启动所有服务..."
        if [ -f start-services.sh ]; then
            ./start-services.sh
        else
            echo "❌ start-services.sh 文件不存在，请先运行部署脚本"
        fi
        ;;
    stop)
        echo "⏹️ 停止所有服务..."
        
        # 停止后端
        if [ -f logs/backend.pid ]; then
            BACKEND_PID=$(cat logs/backend.pid)
            if kill -0 $BACKEND_PID 2>/dev/null; then
                kill $BACKEND_PID 2>/dev/null
                echo "✅ 后端服务已停止"
            else
                echo "⚠️ 后端服务进程不存在"
            fi
            rm logs/backend.pid
        fi
        
        # 停止前端
        if [ -f logs/frontend.pid ]; then
            FRONTEND_PID=$(cat logs/frontend.pid)
            if kill -0 $FRONTEND_PID 2>/dev/null; then
                kill $FRONTEND_PID 2>/dev/null
                echo "✅ 前端服务已停止"
            else
                echo "⚠️ 前端服务进程不存在"
            fi
            rm logs/frontend.pid
        fi
        
        # 停止管理后台
        if [ -f logs/admin.pid ]; then
            ADMIN_PID=$(cat logs/admin.pid)
            if kill -0 $ADMIN_PID 2>/dev/null; then
                kill $ADMIN_PID 2>/dev/null
                echo "✅ 管理后台已停止"
            else
                echo "⚠️ 管理后台进程不存在"
            fi
            rm logs/admin.pid
        fi
        
        # 强制清理可能残留的进程
        pkill -f "python.*app.py" 2>/dev/null
        pkill -f "serve.*dist" 2>/dev/null
        
        echo "✅ 所有服务已停止"
        ;;
    restart)
        echo "🔄 重启所有服务..."
        $0 stop
        sleep 3
        $0 start
        ;;
    status)
        echo "📊 检查服务状态..."
        echo ""
        
        # 检查后端API
        echo -n "后端API (端口5001): "
        if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
            echo "✅ 运行中"
        else
            echo "❌ 未运行"
        fi
        
        # 检查前端
        echo -n "前端应用 (端口3001): "
        if curl -s http://localhost:3001 > /dev/null 2>&1; then
            echo "✅ 运行中"
        else
            echo "❌ 未运行"
        fi
        
        # 检查管理后台
        echo -n "管理后台 (端口3002): "
        if curl -s http://localhost:3002 > /dev/null 2>&1; then
            echo "✅ 运行中"
        else
            echo "❌ 未运行"
        fi
        
        # 检查数据库
        echo -n "MySQL数据库: "
        if systemctl is-active mariadb > /dev/null 2>&1; then
            echo "✅ 运行中"
        else
            echo "❌ 未运行"
        fi
        
        # 检查Redis
        echo -n "Redis缓存: "
        if systemctl is-active redis > /dev/null 2>&1; then
            echo "✅ 运行中"
        else
            echo "❌ 未运行"
        fi
        
        echo ""
        echo "📡 端口监听状态:"
        sudo netstat -tlnp | grep -E ':(3001|3002|5001|3306|6379)' || echo "无相关端口监听"
        ;;
    logs)
        echo "📋 查看服务日志..."
        if [ -d logs ]; then
            tail -f logs/*.log
        else
            echo "❌ 日志目录不存在"
        fi
        ;;
    info)
        echo "📖 服务信息"
        echo "========================"
        echo "前端应用: http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost'):3001"
        echo "管理后台: http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost'):3002"
        echo "后端API: http://$(curl -s ifconfig.me 2>/dev/null || echo 'localhost'):5001"
        echo ""
        echo "本地访问地址:"
        echo "前端应用: http://localhost:3001"
        echo "管理后台: http://localhost:3002"
        echo "后端API: http://localhost:5001"
        echo ""
        echo "数据库连接:"
        echo "MySQL: localhost:3306"
        echo "Redis: localhost:6379"
        ;;
    test)
        echo "🧪 测试服务连接..."
        echo ""
        
        echo "测试后端API健康检查:"
        curl -s http://localhost:5001/api/health | python3 -m json.tool 2>/dev/null || echo "API不可访问"
        
        echo ""
        echo "测试前端页面:"
        if curl -s http://localhost:3001 > /dev/null; then
            echo "✅ 前端页面可访问"
        else
            echo "❌ 前端页面不可访问"
        fi
        
        echo ""
        echo "测试管理后台:"
        if curl -s http://localhost:3002 > /dev/null; then
            echo "✅ 管理后台可访问"
        else
            echo "❌ 管理后台不可访问"
        fi
        ;;
    *)
        echo "🔧 Divine Friend PWA 服务管理"
        echo "=============================="
        echo "用法: $0 {start|stop|restart|status|logs|info|test}"
        echo ""
        echo "命令说明:"
        echo "  start   - 启动所有服务"
        echo "  stop    - 停止所有服务"
        echo "  restart - 重启所有服务"
        echo "  status  - 检查服务状态"
        echo "  logs    - 查看服务日志"
        echo "  info    - 显示服务信息"
        echo "  test    - 测试服务连接"
        echo ""
        echo "示例:"
        echo "  $0 start    # 启动服务"
        echo "  $0 status   # 查看状态"
        echo "  $0 logs     # 查看日志"
        exit 1
        ;;
esac 