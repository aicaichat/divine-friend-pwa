#!/bin/bash

echo "🔍 检查服务器状态"
echo "=================="

echo "1. 检查进程状态:"
ps aux | grep -E '(python|node|serve)' | grep -v grep

echo ""
echo "2. 检查端口监听:"
sudo netstat -tlnp | grep -E ':(3001|3002|5001)'

echo ""
echo "3. 检查防火墙状态:"
sudo firewall-cmd --list-ports

echo ""
echo "4. 检查日志文件:"
if [ -d "logs" ]; then
    echo "日志文件存在:"
    ls -la logs/
    echo ""
    echo "最新日志内容:"
    for logfile in logs/*.log; do
        if [ -f "$logfile" ]; then
            echo "--- $logfile ---"
            tail -5 "$logfile"
            echo ""
        fi
    done
else
    echo "日志目录不存在"
fi

echo ""
echo "5. 检查服务启动脚本:"
if [ -f "start-services.sh" ]; then
    echo "✅ start-services.sh 存在"
else
    echo "❌ start-services.sh 不存在"
fi

echo ""
echo "6. 测试本地连接:"
echo "测试后端 API:"
curl -s http://localhost:5001/api/health || echo "后端 API 连接失败"

echo ""
echo "测试前端服务:"
curl -s http://localhost:3001 > /dev/null && echo "前端服务正常" || echo "前端服务连接失败"

echo ""
echo "测试管理后台:"
curl -s http://localhost:3002 > /dev/null && echo "管理后台正常" || echo "管理后台连接失败" 