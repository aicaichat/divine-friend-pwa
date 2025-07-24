#!/bin/bash

echo "🚀 启动Divine Friend PWA测试环境..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

# 清理之前的容器
echo "🧹 清理之前的容器..."
docker-compose -f docker-compose.test.yml down -v

# 构建并启动测试环境
echo "🔨 构建测试环境..."
docker-compose -f docker-compose.test.yml up --build -d

# 显示构建日志
echo "📋 显示构建日志..."
docker-compose -f docker-compose.test.yml logs backend

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose -f docker-compose.test.yml ps

# 测试健康检查
echo "🏥 测试健康检查..."
curl -f http://localhost:5001/api/health || echo "❌ 健康检查失败"

echo "✅ 测试环境启动完成！"
echo "📱 前端: http://localhost:3000"
echo "🔧 后端: http://localhost:5001"
echo "📊 Redis: localhost:6379"
echo ""
echo "查看日志: docker-compose -f docker-compose.test.yml logs -f"
echo "停止服务: docker-compose -f docker-compose.test.yml down" 