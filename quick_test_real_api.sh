#!/bin/bash

echo "🚀 AI智能穿衣推荐系统 - 真实API测试启动脚本"
echo "============================================================"

# 检查当前目录
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ 错误: 请在 divine-friend-pwa 目录下运行此脚本"
    exit 1
fi

echo "📁 当前目录: $(pwd)"

# 检查后端依赖
echo "🔍 检查后端依赖..."
cd backend

if [ ! -f "app.py" ]; then
    echo "❌ 未找到 app.py，请检查后端文件"
    exit 1
fi

if ! command -v python &> /dev/null; then
    echo "❌ Python 未安装或不在 PATH 中"
    exit 1
fi

echo "✅ 后端环境检查通过"

# 启动后端服务
echo "🚀 启动后端服务..."
echo "提示: 按 Ctrl+C 停止服务"
echo "访问地址: http://localhost:5001"
echo ""

# 设置环境变量
export FLASK_ENV=development
export FLASK_DEBUG=1

# 启动应用
python app.py

echo ""
echo "🎯 测试完成！"
echo ""
echo "📋 下一步操作:"
echo "1. 在浏览器中访问: http://localhost:3008/?page=today"
echo "2. 在控制台中设置用户信息:"
echo "   localStorage.setItem('user_profile', JSON.stringify({"
echo "     birthdate: '1990-05-15T08:30:00',"
echo "     name: '测试用户',"
echo "     gender: 'male'"
echo "   }));"
echo "3. 刷新页面查看真实AI推荐效果"
echo ""
echo "📖 详细测试指南请查看: frontend/TEST_REAL_API.md" 