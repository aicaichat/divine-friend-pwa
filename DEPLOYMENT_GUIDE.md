# 神仙朋友 PWA 完整部署指南

## 📋 部署概览

这个指南将帮助您完整部署神仙朋友PWA应用，包含前端、后端、数据库和PWA特性的完整配置。

## 🏗️ 架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (React)   │    │   后端 (Flask)   │    │  数据库 (SQLite) │
│                 │    │                 │    │                 │
│ - PWA 特性      │◄──►│ - 八字计算 API   │◄──►│ - 用户数据      │
│ - Service Worker│    │ - 神仙匹配算法   │    │ - 八字分析结果   │
│ - 离线缓存      │    │ - 数据持久化     │    │ - 聊天记录      │
│ - 推送通知      │    │ - 实时同步       │    │ - 神仙推荐      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Nginx 代理    │
                    │                 │
                    │ - 静态文件服务   │
                    │ - API 路由      │
                    │ - HTTPS 配置    │
                    │ - 缓存策略      │
                    └─────────────────┘
```

## 🚀 快速开始

### 1. 环境要求

#### 开发环境
- Node.js 18+ 
- Python 3.8+
- Git

#### 生产环境
- Docker & Docker Compose
- Nginx
- SSL 证书 (Let's Encrypt 推荐)

### 2. 项目克隆

```bash
git clone <repository-url>
cd divine-friend-pwa
```

## 🔧 开发环境部署

### 前端开发

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问地址: http://localhost:5173
```

### 后端开发

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
python app.py

# 访问地址: http://localhost:5000
```

### 开发环境配置

#### 前端环境变量 (.env)
```bash
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=神仙朋友
VITE_APP_VERSION=1.0.0
VITE_ENABLE_PWA=true
VITE_ENABLE_NOTIFICATIONS=true
```

#### 后端环境变量 (.env)
```bash
FLASK_ENV=development
FLASK_DEBUG=true
DATABASE_URL=sqlite:///divine_friend.db
SECRET_KEY=your-secret-key-here
SXTWL_DATA_PATH=./data
```

## 🐳 Docker 部署

### 构建镜像

```bash
# 构建前端镜像
docker build -f frontend/Dockerfile -t divine-friend-frontend ./frontend

# 构建后端镜像  
docker build -f backend/Dockerfile -t divine-friend-backend ./backend
```

### Docker Compose 部署

```bash
# 开发环境
docker-compose -f docker-compose.dev.yml up -d

# 生产环境
docker-compose -f docker-compose.prod.yml up -d
```

### Docker Compose 配置详解

#### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    volumes:
      - ./frontend/dist:/usr/share/nginx/html
    restart: unless-stopped
    
  backend:
    build:
      context: ./backend  
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=sqlite:///data/divine_friend.db
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped
    depends_on:
      - redis
      
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./frontend/dist:/usr/share/nginx/html
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  redis_data:
```

## 🌐 生产环境部署

### 1. 服务器准备

#### 系统要求
- Ubuntu 20.04+ / CentOS 8+
- 4GB+ RAM
- 20GB+ 磁盘空间
- 公网 IP

#### 安装依赖
```bash
# Ubuntu
sudo apt update
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx

# CentOS
sudo yum install -y docker docker-compose nginx certbot python3-certbot-nginx

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. 域名配置

#### DNS 设置
```
A     divine-friend.com          -> YOUR_SERVER_IP
A     api.divine-friend.com      -> YOUR_SERVER_IP  
CNAME www.divine-friend.com      -> divine-friend.com
```

#### SSL 证书申请
```bash
# 使用 Let's Encrypt
sudo certbot --nginx -d divine-friend.com -d www.divine-friend.com -d api.divine-friend.com
```

### 3. Nginx 配置

#### /etc/nginx/sites-available/divine-friend
```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name divine-friend.com www.divine-friend.com;
    return 301 https://$server_name$request_uri;
}

# 主应用 HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name divine-friend.com www.divine-friend.com;

    # SSL 配置
    ssl_certificate /etc/letsencrypt/live/divine-friend.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/divine-friend.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 根目录 - 前端应用
    location / {
        root /var/www/divine-friend/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # PWA 缓存策略
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        location = /manifest.json {
            expires 1d;
            add_header Cache-Control "public";
        }
        
        location = /sw.js {
            expires 0;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }

    # API 代理到后端
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 长连接支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket 支持 (如果需要)
    location /ws/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    # 日志配置
    access_log /var/log/nginx/divine-friend.access.log;
    error_log /var/log/nginx/divine-friend.error.log;
}
```

### 4. 部署脚本

#### deploy.sh
```bash
#!/bin/bash

# 神仙朋友 PWA 生产部署脚本

set -e

echo "🚀 开始部署神仙朋友 PWA..."

# 1. 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 2. 构建前端
echo "🔨 构建前端应用..."
cd frontend
npm ci --production
npm run build
cd ..

# 3. 构建后端 Docker 镜像
echo "🐳 构建后端镜像..."
docker build -t divine-friend-backend:latest ./backend

# 4. 停止旧服务
echo "🛑 停止旧服务..."
docker-compose -f docker-compose.prod.yml down

# 5. 启动新服务
echo "▶️ 启动新服务..."
docker-compose -f docker-compose.prod.yml up -d

# 6. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 7. 健康检查
echo "🔍 执行健康检查..."
if curl -f http://localhost:5000/api/health; then
    echo "✅ 后端服务正常"
else
    echo "❌ 后端服务异常"
    exit 1
fi

if curl -f http://localhost:3000; then
    echo "✅ 前端服务正常"
else
    echo "❌ 前端服务异常"
    exit 1
fi

# 8. 重载 Nginx
echo "🔄 重载 Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "🎉 部署完成！"
echo "🌐 访问地址: https://divine-friend.com"
```

### 5. 监控和日志

#### 系统监控
```bash
# 安装监控工具
sudo apt install -y htop iotop nethogs

# Docker 容器监控
docker stats

# 查看容器日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### 日志配置
```bash
# 创建日志目录
sudo mkdir -p /var/log/divine-friend

# 日志轮转配置 /etc/logrotate.d/divine-friend
/var/log/divine-friend/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        docker-compose -f /path/to/docker-compose.prod.yml restart backend
    endscript
}
```

## 🔒 安全配置

### 1. 防火墙设置
```bash
# UFW 配置
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw status
```

### 2. 数据库安全
```bash
# 数据库文件权限
chmod 600 /path/to/divine_friend.db
chown www-data:www-data /path/to/divine_friend.db
```

### 3. 备份策略
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/divine-friend"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
cp /path/to/divine_friend.db $BACKUP_DIR/db_$DATE.db

# 备份配置文件
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /etc/nginx/sites-available/divine-friend

# 清理旧备份 (保留7天)
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "备份完成: $DATE"
```

## 📱 PWA 特性验证

### 1. PWA 检查清单
- [ ] Service Worker 注册成功
- [ ] Manifest 文件正确
- [ ] HTTPS 配置
- [ ] 离线功能正常
- [ ] 安装提示显示
- [ ] 推送通知权限

### 2. 测试工具
```bash
# Lighthouse PWA 审计
npx lighthouse https://divine-friend.com --view

# PWA Builder 分析
# 访问: https://www.pwabuilder.com/
```

## 🔧 故障排除

### 常见问题

#### 1. Service Worker 未注册
```javascript
// 检查 SW 注册状态
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Registered SWs:', registrations.length)
  })
}
```

#### 2. API 连接失败
```bash
# 检查后端服务状态
docker-compose ps
docker-compose logs backend

# 检查网络连接
curl -v http://localhost:5000/api/health
```

#### 3. 数据库连接问题
```bash
# 检查数据库文件权限
ls -la /path/to/divine_friend.db

# 检查磁盘空间
df -h
```

### 性能优化

#### 1. 前端优化
```javascript
// 代码分割
const LazyComponent = lazy(() => import('./LazyComponent'))

// 图片优化
<img src="image.webp" alt="..." loading="lazy" />
```

#### 2. 后端优化
```python
# Redis 缓存
import redis
r = redis.Redis(host='localhost', port=6379, db=0)

@cache_decorator(expire=3600)
def calculate_bazi(birth_info):
    # 八字计算逻辑
    pass
```

## 📞 支持联系

如果您在部署过程中遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查 GitHub Issues
3. 联系技术支持团队

---

**部署成功后，您将拥有一个完整的神仙朋友PWA应用，支持：**
- 📱 移动端安装
- 🔄 离线使用
- 🔔 推送通知  
- 🎯 八字分析
- 🤖 神仙对话
- 📿 手串验证
- 🎵 经典诵读

祝您部署顺利！🎉 