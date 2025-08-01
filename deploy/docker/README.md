# 🐳 Divine Friend PWA Docker 生产环境部署指南

## 📋 目录

1. [部署架构](#部署架构)
2. [环境要求](#环境要求)
3. [快速部署](#快速部署)
4. [详细配置](#详细配置)
5. [监控配置](#监控配置)
6. [安全配置](#安全配置)
7. [维护管理](#维护管理)
8. [故障排除](#故障排除)

## 🏗️ 部署架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │───▶│     Nginx       │───▶│  Frontend       │
│   (CloudFlare)  │    │   (Reverse      │    │  (React App)    │
│                 │    │    Proxy)       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Admin Panel   │    │  Backend API    │
                       │  (React Admin)  │    │  (Flask)        │
                       └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐    ┌─────────────────┐
                       │     Redis       │◀───┤   Prometheus    │
                       │    (Cache)      │    │  (Monitoring)   │
                       └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐    ┌─────────────────┐
                       │    Grafana      │◀───┤   Node Exporter │
                       │  (Dashboard)    │    │  (System Metrics)│
                       └─────────────────┘    └─────────────────┘
```

## 🔧 环境要求

### 系统要求
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **CPU**: 最少2核，推荐4核
- **内存**: 最少4GB，推荐8GB
- **存储**: 最少20GB，推荐50GB SSD
- **网络**: 稳定的互联网连接

### 软件要求
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 最新版本

## 🚀 快速部署

### 1. 克隆项目
```bash
git clone <repository-url>
cd divine-friend-pwa
```

### 2. 一键部署
```bash
# 给部署脚本执行权限
chmod +x deploy/docker/deploy.sh

# 执行部署
./deploy/docker/deploy.sh production
```

### 3. 验证部署
```bash
# 检查服务状态
docker-compose -f deploy/docker/docker-compose.production.yml ps

# 健康检查
curl http://localhost/api/health
```

## ⚙️ 详细配置

### 环境变量配置

编辑 `.env` 文件：

```bash
# 应用配置
SECRET_KEY=your-super-secret-key-change-this-in-production
REDIS_PASSWORD=your-redis-password
GRAFANA_PASSWORD=admin

# 域名配置
DOMAIN=your-domain.com
ADMIN_DOMAIN=admin.your-domain.com
API_DOMAIN=api.your-domain.com

# 数据库配置
DATABASE_URL=sqlite:///data/divine_friend.db

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# 监控配置
PROMETHEUS_RETENTION=200h
GRAFANA_ADMIN_PASSWORD=admin

# 日志配置
LOG_LEVEL=INFO
```

### SSL证书配置

#### 使用Let's Encrypt (推荐)
```bash
# 安装certbot
sudo apt install certbot

# 获取证书
sudo certbot certonly --standalone -d your-domain.com -d admin.your-domain.com -d api.your-domain.com

# 复制证书到Docker目录
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem deploy/docker/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem deploy/docker/ssl/key.pem
```

#### 自签名证书 (开发环境)
```bash
# 生成自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout deploy/docker/ssl/key.pem \
    -out deploy/docker/ssl/cert.pem \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=DivineFriend/OU=IT/CN=your-domain.com"
```

## 📊 监控配置

### Prometheus配置

编辑 `deploy/docker/monitoring/prometheus.yml`：

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'divine-friend-backend'
    static_configs:
      - targets: ['backend:5000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/nginx_status'
```

### Grafana仪表板

访问 `http://localhost:3001` 配置Grafana：

1. **数据源配置**
   - 添加Prometheus数据源
   - URL: `http://prometheus:9090`

2. **仪表板导入**
   - 导入 `deploy/docker/monitoring/grafana/dashboards/divine-friend-dashboard.json`

## 🔒 安全配置

### 防火墙配置
```bash
# 开放必要端口
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 安全头配置
Nginx已配置以下安全头：
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### 密码安全
```bash
# 生成强密码
openssl rand -base64 32

# 更新环境变量
sed -i 's/SECRET_KEY=.*/SECRET_KEY=your-generated-secret/' .env
sed -i 's/REDIS_PASSWORD=.*/REDIS_PASSWORD=your-generated-password/' .env
```

## 🛠️ 维护管理

### 服务管理命令
```bash
# 查看服务状态
docker-compose -f deploy/docker/docker-compose.production.yml ps

# 查看日志
docker-compose -f deploy/docker/docker-compose.production.yml logs -f

# 重启服务
docker-compose -f deploy/docker/docker-compose.production.yml restart

# 停止服务
docker-compose -f deploy/docker/docker-compose.production.yml down

# 更新服务
docker-compose -f deploy/docker/docker-compose.production.yml pull
docker-compose -f deploy/docker/docker-compose.production.yml up -d
```

### 备份和恢复
```bash
# 备份数据
docker run --rm -v divine-friend-pwa_data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz -C /data .

# 恢复数据
docker run --rm -v divine-friend-pwa_data:/data -v $(pwd):/backup alpine tar xzf /backup/data-backup.tar.gz -C /data
```

### 日志管理
```bash
# 查看应用日志
tail -f logs/app.log

# 查看Nginx日志
tail -f logs/nginx/access.log
tail -f logs/nginx/error.log

# 清理旧日志
find logs -name "*.log" -mtime +7 -delete
```

## 🔍 故障排除

### 常见问题

#### 1. 服务无法启动
```bash
# 检查Docker状态
docker info

# 检查端口占用
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# 查看详细错误
docker-compose -f deploy/docker/docker-compose.production.yml logs
```

#### 2. SSL证书问题
```bash
# 检查证书有效性
openssl x509 -in deploy/docker/ssl/cert.pem -text -noout

# 重新生成证书
./deploy/docker/deploy.sh production
```

#### 3. 数据库连接问题
```bash
# 检查Redis连接
docker exec -it divine-redis redis-cli ping

# 检查数据库文件权限
ls -la data/
```

#### 4. 性能问题
```bash
# 检查资源使用
docker stats

# 检查磁盘空间
df -h

# 检查内存使用
free -h
```

### 性能优化

#### 1. Nginx优化
```nginx
# 在nginx.conf中添加
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
gzip_comp_level 6;
```

#### 2. Redis优化
```bash
# 在redis.conf中添加
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

#### 3. 应用优化
```python
# 在app.py中添加
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 31536000
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024
```

## 📞 技术支持

### 监控面板
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090

### 日志位置
- **应用日志**: `logs/app.log`
- **Nginx日志**: `logs/nginx/`
- **Docker日志**: `docker-compose logs`

### 联系信息
- **文档**: 本文档
- **GitHub**: 项目仓库
- **邮箱**: support@divine-friend.com

---

**© 2024 Divine Friend PWA Team**  
**版本**: 1.0.0  
**最后更新**: 2024年1月  
**状态**: 生产就绪 🚀 