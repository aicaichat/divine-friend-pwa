# 🚀 Divine Friend PWA 生产环境部署指南

## 📋 部署方案概览

我们提供了三种生产环境部署方案，您可以根据服务器环境选择最适合的方案：

### 方案对比

| 方案 | 适用场景 | 优点 | 缺点 | 推荐度 |
|------|----------|------|------|--------|
| **独立Docker部署** | 全新服务器 | 完全控制，配置简单 | 占用80/443端口 | ⭐⭐⭐⭐⭐ |
| **外部Nginx部署** | 已有Nginx | 复用现有Nginx，灵活配置 | 需要额外配置 | ⭐⭐⭐⭐ |
| **云平台部署** | 云服务器 | 弹性扩展，管理简单 | 成本较高 | ⭐⭐⭐ |

## 🎯 方案一：独立Docker部署（推荐）

### 前置要求

```bash
# 系统要求
- Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- Docker 20.10+
- Docker Compose 2.0+
- 至少4GB内存，50GB磁盘空间

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 一键部署

```bash
# 1. 克隆项目到服务器
git clone https://github.com/aicaichat/divine-friend-pwa.git
cd divine-friend-pwa

# 2. 给部署脚本执行权限
chmod +x deploy/docker/deploy.sh

# 3. 一键部署
./deploy/docker/deploy.sh production
```

### 部署过程

脚本会自动执行以下步骤：

1. **环境检查** - 验证Docker和系统要求
2. **配置生成** - 创建.env文件和SSL证书
3. **镜像构建** - 构建前端、后端、管理后台镜像
4. **服务启动** - 启动所有Docker服务
5. **健康检查** - 验证所有服务正常运行
6. **域名配置** - 配置bless.top子域名

### 服务架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx (80/443)│───▶│  Frontend (3003)│    │  Admin (3001)   │
│   (Reverse Proxy)│    │   (React PWA)   │    │  (React Admin)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Backend (5001) │    │   MySQL (3306)  │    │   Redis (6379)  │
│  (Flask API)    │    │   (Database)    │    │   (Cache)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Prometheus     │    │   Grafana       │    │   phpMyAdmin    │
│  (Monitoring)   │    │  (Dashboard)    │    │  (DB Admin)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 访问地址

部署成功后，您可以访问：

| 服务 | 地址 | 说明 |
|------|------|------|
| **前端应用** | https://today.bless.top | 用户端PWA应用 |
| **管理后台** | https://admin.bless.top | 管理员后台 |
| **API服务** | https://api.bless.top | 后端API接口 |
| **数据库管理** | https://tools.bless.top/phpmyadmin/ | phpMyAdmin |
| **Redis管理** | https://tools.bless.top/redis/ | Redis Commander |
| **监控面板** | https://monitor.bless.top/grafana/ | Grafana监控 |
| **邮件测试** | https://tools.bless.top/mail/ | MailHog |

## 🎯 方案二：外部Nginx部署

### 适用场景
- 服务器已有Nginx
- 需要复用现有SSL证书
- 需要更灵活的配置

### 部署步骤

```bash
# 1. 克隆项目
git clone https://github.com/aicaichat/divine-friend-pwa.git
cd divine-friend-pwa

# 2. 执行外部Nginx部署
chmod +x deploy/docker/deploy-external-nginx.sh
./deploy/docker/deploy-external-nginx.sh production
```

### Nginx配置

脚本会自动生成Nginx配置文件：

```nginx
# 上游服务器配置
upstream divine_frontend {
    server 127.0.0.1:3001;
}

upstream divine_admin {
    server 127.0.0.1:3002;
}

upstream divine_backend {
    server 127.0.0.1:5000;
}

# 前端应用
server {
    listen 443 ssl http2;
    server_name today.bless.top;
    
    ssl_certificate /etc/ssl/certs/bless.top.crt;
    ssl_certificate_key /etc/ssl/private/bless.top.key;
    
    location / {
        proxy_pass http://divine_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 管理后台
server {
    listen 443 ssl http2;
    server_name admin.bless.top;
    
    location / {
        proxy_pass http://divine_admin;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# API服务
server {
    listen 443 ssl http2;
    server_name api.bless.top;
    
    location / {
        proxy_pass http://divine_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🎯 方案三：云平台部署

### AWS部署

```bash
# 1. 创建ECR仓库
aws ecr create-repository --repository-name divine-friend/backend
aws ecr create-repository --repository-name divine-friend/frontend
aws ecr create-repository --repository-name divine-friend/admin

# 2. 构建并推送镜像
docker build -t divine-friend/backend ./backend
docker tag divine-friend/backend:latest 123456789012.dkr.ecr.us-west-2.amazonaws.com/divine-friend/backend:latest
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/divine-friend/backend:latest

# 3. 创建ECS服务
aws ecs create-service --cli-input-json file://deploy/aws/ecs-service.json
```

### GCP部署

```bash
# 1. 构建并推送镜像
gcloud builds submit --tag gcr.io/PROJECT-ID/divine-friend-backend ./backend
gcloud builds submit --tag gcr.io/PROJECT-ID/divine-friend-frontend ./frontend

# 2. 部署到Cloud Run
gcloud run deploy divine-friend-backend \
  --image gcr.io/PROJECT-ID/divine-friend-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 🔧 域名和SSL配置

### DNS配置

在您的域名管理面板中添加以下DNS记录：

| 类型 | 名称 | 值 | TTL | 说明 |
|------|------|----|-----|------|
| A | today | 服务器IP | 自动 | 前端应用 |
| A | api | 服务器IP | 自动 | 后端API |
| A | admin | 服务器IP | 自动 | 管理后台 |
| A | tools | 服务器IP | 自动 | 管理工具 |
| A | monitor | 服务器IP | 自动 | 监控面板 |

### SSL证书

#### Let's Encrypt证书（推荐）

```bash
# 安装certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d today.bless.top -d api.bless.top -d admin.bless.top

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 自签名证书（开发测试）

```bash
# 生成自签名证书
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/bless.top.key \
  -out /etc/ssl/certs/bless.top.crt \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=Divine Friend/CN=bless.top"
```

## 📊 监控和日志

### 监控面板

- **Grafana**: https://monitor.bless.top/grafana/
  - 系统性能监控
  - 应用指标监控
  - 自定义仪表板

- **Prometheus**: https://monitor.bless.top/prometheus/
  - 指标收集
  - 告警规则
  - 数据查询

### 日志管理

```bash
# 查看应用日志
docker-compose -f deploy/docker/docker-compose.production.yml logs -f

# 查看特定服务日志
docker-compose -f deploy/docker/docker-compose.production.yml logs -f backend
docker-compose -f deploy/docker/docker-compose.production.yml logs -f frontend

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔒 安全配置

### 防火墙配置

```bash
# Ubuntu UFW
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# CentOS firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 安全增强

```bash
# 1. 设置文件权限
chmod 600 .env
chmod 755 /var/log/divine-friend

# 2. 配置SELinux (CentOS/RHEL)
sudo setsebool -P httpd_can_network_connect 1

# 3. 定期安全更新
sudo apt update && sudo apt upgrade -y
```

## 🚀 性能优化

### 应用层优化

```python
# config.py
WORKERS = multiprocessing.cpu_count() * 2 + 1
WORKER_CONNECTIONS = 1000
MAX_REQUESTS = 1000
PRELOAD_APP = True
```

### 系统优化

```bash
# 增加文件描述符限制
echo '* soft nofile 65535' | sudo tee -a /etc/security/limits.conf
echo '* hard nofile 65535' | sudo tee -a /etc/security/limits.conf

# 优化内核参数
echo 'net.ipv4.tcp_keepalive_time = 120' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv4.tcp_keepalive_intvl = 30' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 🛠️ 管理命令

### 服务管理

```bash
# 查看服务状态
docker-compose -f deploy/docker/docker-compose.production.yml ps

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
# 备份数据库
docker exec divine-mysql mysqldump -u root -p divine_friend_prod > backup.sql

# 恢复数据库
docker exec -i divine-mysql mysql -u root -p divine_friend_prod < backup.sql

# 备份配置文件
tar -czf config-backup.tar.gz .env deploy/docker/
```

## 🔍 故障排除

### 常见问题

#### 1. 服务无法启动

```bash
# 检查日志
docker-compose -f deploy/docker/docker-compose.production.yml logs

# 检查端口占用
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# 检查磁盘空间
df -h
```

#### 2. SSL证书问题

```bash
# 检查证书路径
sudo ls -la /etc/ssl/certs/bless.top.crt
sudo ls -la /etc/ssl/private/bless.top.key

# 检查证书有效性
sudo openssl x509 -in /etc/ssl/certs/bless.top.crt -text -noout

# 更新Let's Encrypt证书
sudo certbot renew
```

#### 3. 性能问题

```bash
# 检查系统资源
htop
free -h
df -h

# 检查Docker资源使用
docker stats

# 检查网络连接
curl -I https://today.bless.top
curl -I https://api.bless.top/api/health
```

## 📋 部署检查清单

### 部署前检查

- [ ] 系统要求满足
- [ ] Docker和Docker Compose已安装
- [ ] 域名DNS已配置
- [ ] SSL证书已准备
- [ ] 防火墙已配置
- [ ] 备份策略已制定

### 部署后检查

- [ ] 所有服务正常启动
- [ ] 健康检查通过
- [ ] SSL证书有效
- [ ] 域名解析正确
- [ ] 监控指标正常
- [ ] 日志输出正常
- [ ] 性能测试通过
- [ ] 安全扫描通过

### 上线检查

- [ ] 用户访问正常
- [ ] API接口响应正常
- [ ] 管理后台功能正常
- [ ] 监控告警配置
- [ ] 备份验证
- [ ] 灾难恢复测试

## 📞 技术支持

### 联系方式

- **技术文档**: 本文档
- **GitHub仓库**: https://github.com/aicaichat/divine-friend-pwa
- **问题反馈**: GitHub Issues
- **紧急支持**: 项目维护者

### 应急响应

1. **服务宕机**: 检查日志 → 重启服务 → 回滚版本
2. **性能问题**: 检查监控 → 扩容资源 → 优化配置
3. **安全事件**: 隔离服务 → 分析日志 → 修复漏洞

---

**© 2024 Divine Friend PWA Team**  
**版本**: 1.3.0  
**状态**: 生产就绪 🚀 