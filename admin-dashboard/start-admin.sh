#!/bin/bash

# Divine Friend PWA 管理后台启动脚本
echo "🌟 Divine Friend PWA 管理后台系统 🌟"
echo "版本: v1.0.0"
echo "======================================="

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 16.0+"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo "✅ npm 版本: $(npm -v)"

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，安装依赖..."
    npm install
else
    echo "📦 检查依赖..."
fi

# 启动开发服务器
echo "🚀 启动管理后台开发服务器..."
echo "📱 访问地址: http://localhost:3001"
echo "🔑 默认登录: admin / admin123"
echo ""

npm run dev
