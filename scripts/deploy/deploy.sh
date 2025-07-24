#!/bin/bash
# 交个神仙朋友 PWA 部署脚本

set -e

echo "🚀 开始部署交个神仙朋友 PWA..."

# 检查环境
if [ "$1" = "prod" ]; then
    echo "📦 生产环境部署"
    COMPOSE_FILE="docker-compose.prod.yml"
    ENV_FILE=".env.production"
else
    echo "🧪 开发环境部署"
    COMPOSE_FILE="docker-compose.yml"
    ENV_FILE=".env.development"
fi

# 加载环境变量
if [ -f $ENV_FILE ]; then
    export $(cat $ENV_FILE | xargs)
fi

# 构建镜像
echo "🔨 构建Docker镜像..."
docker-compose -f $COMPOSE_FILE build --no-cache

# 停止旧容器
echo "⏹️ 停止旧服务..."
docker-compose -f $COMPOSE_FILE down

# 启动新容器
echo "▶️ 启动新服务..."
docker-compose -f $COMPOSE_FILE up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 健康检查
echo "🩺 健康检查..."
if curl -f http://localhost/health; then
    echo "✅ 部署成功！"
else
    echo "❌ 部署失败，请检查日志"
    docker-compose -f $COMPOSE_FILE logs
    exit 1
fi

echo "🎉 部署完成！"