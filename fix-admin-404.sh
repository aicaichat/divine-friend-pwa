#!/bin/bash

# 修复管理后台404错误脚本
# 诊断和解决 admin.bless.top 访问问题

echo "🔧 修复管理后台404错误"
echo "======================="

# 1. 检查服务状态
echo "1. 检查服务状态..."
echo ""

echo "检查管理后台端口3002:"
if netstat -tlnp 2>/dev/null | grep :3002; then
    echo "✅ 端口3002正在监听"
else
    echo "❌ 端口3002未监听"
fi

echo ""
echo "检查前端端口3001:"
if netstat -tlnp 2>/dev/null | grep :3001; then
    echo "✅ 端口3001正在监听"
else
    echo "❌ 端口3001未监听"
fi

echo ""
echo "检查后端端口5001:"
if netstat -tlnp 2>/dev/null | grep :5001; then
    echo "✅ 端口5001正在监听"
else
    echo "❌ 端口5001未监听"
fi

# 2. 检查进程状态
echo ""
echo "2. 检查进程状态..."
echo "Node.js进程:"
ps aux | grep -E "(node|serve)" | grep -v grep || echo "未找到Node.js进程"

echo ""
echo "Python进程:"
ps aux | grep python | grep -v grep || echo "未找到Python进程"

# 3. 测试本地连接
echo ""
echo "3. 测试本地连接..."

echo "测试管理后台(3002):"
if curl -s http://localhost:3002 > /dev/null; then
    echo "✅ 本地3002端口可访问"
else
    echo "❌ 本地3002端口不可访问"
fi

echo "测试前端(3001):"
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ 本地3001端口可访问"
else
    echo "❌ 本地3001端口不可访问"
fi

echo "测试后端(5001):"
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ 本地5001端口可访问"
else
    echo "❌ 本地5001端口不可访问"
fi

# 4. 检查Nginx配置
echo ""
echo "4. 检查Nginx配置..."
if [ -f "/etc/nginx/conf.d/divine-friend.conf" ]; then
    echo "✅ Nginx配置文件存在"
    echo "检查admin.bless.top配置:"
    grep -A 10 "admin.bless.top" /etc/nginx/conf.d/divine-friend.conf || echo "❌ 未找到admin.bless.top配置"
else
    echo "❌ Nginx配置文件不存在"
fi

echo ""
echo "Nginx状态:"
systemctl is-active nginx && echo "✅ Nginx运行中" || echo "❌ Nginx未运行"

# 5. 修复方案
echo ""
echo "5. 🚀 开始修复..."

# 修复1: 重启应用服务
echo "重启应用服务..."
if [ -f "manage-services.sh" ]; then
    chmod +x manage-services.sh
    ./manage-services.sh stop
    sleep 3
    ./manage-services.sh start
    sleep 5
else
    echo "❌ manage-services.sh 不存在"
fi

# 修复2: 检查并修复Nginx配置
echo ""
echo "检查Nginx配置..."
if ! nginx -t 2>/dev/null; then
    echo "❌ Nginx配置有错误，重新生成配置..."
    
    # 重新生成Nginx配置
    cat > /tmp/divine-friend.conf << 'EOF'
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
        
        # 处理WebSocket连接
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
    
    # 备份原配置
    if [ -f "/etc/nginx/conf.d/divine-friend.conf" ]; then
        cp /etc/nginx/conf.d/divine-friend.conf /etc/nginx/conf.d/divine-friend.conf.backup
    fi
    
    # 应用新配置
    cp /tmp/divine-friend.conf /etc/nginx/conf.d/divine-friend.conf
    
    # 测试配置
    if nginx -t; then
        echo "✅ Nginx配置修复成功"
        systemctl reload nginx
    else
        echo "❌ Nginx配置仍有错误"
    fi
else
    echo "✅ Nginx配置正常"
fi

# 修复3: 重启Nginx
echo ""
echo "重启Nginx..."
systemctl restart nginx
sleep 2

# 6. 验证修复结果
echo ""
echo "6. 🧪 验证修复结果..."

sleep 5

echo "测试域名访问:"
echo "前端(today.bless.top):"
if curl -s -k https://today.bless.top > /dev/null; then
    echo "✅ 前端可访问"
else
    echo "❌ 前端不可访问"
fi

echo "API(api.bless.top):"
if curl -s -k https://api.bless.top/api/health > /dev/null; then
    echo "✅ API可访问"
else
    echo "❌ API不可访问"
fi

echo "管理后台(admin.bless.top):"
if curl -s -k https://admin.bless.top > /dev/null; then
    echo "✅ 管理后台可访问"
else
    echo "❌ 管理后台仍不可访问"
    
    # 额外调试信息
    echo ""
    echo "🔍 额外调试信息:"
    echo "端口3002状态:"
    netstat -tlnp | grep :3002 || echo "端口3002未监听"
    
    echo "管理后台日志:"
    if [ -f "logs/admin.log" ]; then
        tail -10 logs/admin.log
    else
        echo "未找到管理后台日志"
    fi
fi

# 7. 显示当前状态
echo ""
echo "7. 📊 当前状态总结..."
echo "服务端口状态:"
netstat -tlnp | grep -E ':(3001|3002|5001)' || echo "无相关端口监听"

echo ""
echo "访问地址:"
echo "前端: https://today.bless.top"
echo "API: https://api.bless.top"
echo "管理后台: https://admin.bless.top"

echo ""
echo "管理命令:"
echo "./manage-services.sh status   # 查看服务状态"
echo "./manage-services.sh restart  # 重启服务"
echo "systemctl status nginx        # 查看Nginx状态"
echo "tail -f logs/admin.log        # 查看管理后台日志" 