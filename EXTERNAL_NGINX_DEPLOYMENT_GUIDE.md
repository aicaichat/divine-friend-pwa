# 🌐 Divine Friend PWA 外部Nginx部署指南

## 📋 **概述**

如果您的服务器上已经有Nginx，我们提供了专门的部署方案来与现有Nginx集成，避免端口冲突和配置冲突。

## 🎯 **部署方案对比**

| 方案 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| **内置Nginx** | 全新服务器 | 完全控制，配置简单 | 占用80/443端口 |
| **外部Nginx** | 已有Nginx | 复用现有Nginx，灵活配置 | 需要额外配置 |

## 🚀 **外部Nginx部署步骤**

### **1. 环境准备**

```bash
# 检查现有Nginx
nginx -v
systemctl status nginx

# 检查端口占用
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

### **2. 一键部署**

```bash
# 给脚本执行权限
chmod +x deploy/docker/deploy-external-nginx.sh

# 执行部署
./deploy/docker/deploy-external-nginx.sh production
```

### **3. 手动配置Nginx**

如果自动配置失败，可以手动配置：

```bash
# 复制配置文件
sudo cp deploy/docker/nginx-external/nginx.conf /etc/nginx/sites-available/divine-friend

# 启用配置
sudo ln -s /etc/nginx/sites-available/divine-friend /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重新加载
sudo systemctl reload nginx
```

## 🔧 **端口映射配置**

### **容器端口映射**

| 服务 | 容器端口 | 主机端口 | 说明 |
|------|----------|----------|------|
| 前端应用 | 80 | 3001 | React PWA |
| 管理后台 | 80 | 3002 | React Admin |
| 后端API | 5000 | 5000 | Flask API |
| phpMyAdmin | 80 | 8081 | 数据库管理 |
| Redis Commander | 8081 | 8082 | Redis管理 |
| MailHog Web | 8025 | 8025 | 邮件测试 |
| Grafana | 3000 | 3003 | 监控面板 |
| Prometheus | 9090 | 9090 | 指标收集 |
| Node Exporter | 9100 | 9100 | 系统监控 |
| cAdvisor | 8080 | 8080 | 容器监控 |

### **Nginx代理配置**

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
```

## 🌐 **域名配置**

### **主要域名**

```nginx
# 前端应用
server_name your-domain.com www.your-domain.com;

# 管理后台
server_name admin.your-domain.com;

# 管理工具 (可选)
server_name tools.your-domain.com;

# 监控面板 (可选)
server_name monitor.your-domain.com;
```

### **子路径配置**

```nginx
# 管理工具子路径
location /phpmyadmin/ {
    proxy_pass http://divine_phpmyadmin/;
}

location /redis/ {
    proxy_pass http://divine_redis_commander/;
}

location /mail/ {
    proxy_pass http://divine_mailhog/;
}

# 监控面板子路径
location /grafana/ {
    proxy_pass http://divine_grafana/;
}

location /prometheus/ {
    proxy_pass http://divine_prometheus/;
}
```

## 🔒 **SSL证书配置**

### **使用现有证书**

```nginx
# SSL配置 (使用现有证书)
ssl_certificate /etc/ssl/certs/your-domain.com.crt;
ssl_certificate_key /etc/ssl/private/your-domain.com.key;
```

### **Let's Encrypt证书**

```bash
# 获取证书
sudo certbot certonly --nginx -d your-domain.com -d admin.your-domain.com

# 证书路径
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
```

## 📊 **访问地址**

### **生产环境访问**

| 服务 | 地址 | 说明 |
|------|------|------|
| **前端应用** | https://your-domain.com | 用户端PWA应用 |
| **管理后台** | https://admin.your-domain.com | 管理员后台 |
| **数据库管理** | https://tools.your-domain.com/phpmyadmin/ | phpMyAdmin |
| **Redis管理** | https://tools.your-domain.com/redis/ | Redis Commander |
| **邮件测试** | https://tools.your-domain.com/mail/ | MailHog |
| **Grafana监控** | https://monitor.your-domain.com/grafana/ | 监控仪表板 |
| **Prometheus** | https://monitor.your-domain.com/prometheus/ | 指标监控 |

### **本地访问**

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost:3001 | 直接访问容器 |
| 管理后台 | http://localhost:3002 | 直接访问容器 |
| 后端API | http://localhost:5000 | 直接访问容器 |
| phpMyAdmin | http://localhost:8081 | 直接访问容器 |
| Redis Commander | http://localhost:8082 | 直接访问容器 |
| MailHog | http://localhost:8025 | 直接访问容器 |
| Grafana | http://localhost:3003 | 直接访问容器 |
| Prometheus | http://localhost:9090 | 直接访问容器 |

## 🛠️ **管理命令**

### **Docker服务管理**

```bash
# 查看服务状态
docker-compose -f deploy/docker/docker-compose.production-nginx-external.yml ps

# 查看日志
docker-compose -f deploy/docker/docker-compose.production-nginx-external.yml logs -f

# 重启服务
docker-compose -f deploy/docker/docker-compose.production-nginx-external.yml restart

# 停止服务
docker-compose -f deploy/docker/docker-compose.production-nginx-external.yml down
```

### **Nginx管理**

```bash
# 测试配置
sudo nginx -t

# 重新加载配置
sudo systemctl reload nginx

# 重启Nginx
sudo systemctl restart nginx

# 查看Nginx状态
sudo systemctl status nginx

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔍 **故障排除**

### **常见问题**

#### **1. 端口冲突**

```bash
# 检查端口占用
sudo netstat -tlnp | grep :3001
sudo netstat -tlnp | grep :3002
sudo netstat -tlnp | grep :5000

# 修改端口映射
# 编辑 .env 文件中的端口配置
FRONTEND_PORT=3001
ADMIN_PORT=3002
BACKEND_PORT=5000
```

#### **2. Nginx配置错误**

```bash
# 测试Nginx配置
sudo nginx -t

# 查看详细错误
sudo nginx -T | grep -A 10 -B 10 "error"

# 回滚配置
sudo cp /etc/nginx/nginx.conf.backup.* /etc/nginx/nginx.conf
sudo nginx -t && sudo systemctl reload nginx
```

#### **3. SSL证书问题**

```bash
# 检查证书路径
sudo ls -la /etc/ssl/certs/your-domain.com.crt
sudo ls -la /etc/ssl/private/your-domain.com.key

# 检查证书有效性
sudo openssl x509 -in /etc/ssl/certs/your-domain.com.crt -text -noout

# 更新Let's Encrypt证书
sudo certbot renew
```

#### **4. 容器无法访问**

```bash
# 检查容器状态
docker ps -a

# 查看容器日志
docker logs divine-frontend
docker logs divine-backend

# 检查网络连接
docker network ls
docker network inspect divine-friend-pwa_divine-network
```

### **调试命令**

```bash
# 检查所有服务状态
./deploy/docker/deploy-external-nginx.sh health-check

# 查看系统资源
docker stats

# 检查磁盘空间
df -h

# 检查内存使用
free -h

# 检查网络连接
curl -I http://localhost:3001
curl -I http://localhost:3002
curl -I http://localhost:5000/api/health
```

## 📈 **性能优化**

### **Nginx优化**

```nginx
# 在nginx.conf中添加
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
gzip_comp_level 6;
client_max_body_size 100M;
```

### **容器资源限制**

```yaml
# 在docker-compose.yml中添加
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

### **缓存配置**

```nginx
# 静态文件缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# API缓存
location /api/ {
    proxy_cache_valid 200 5m;
    proxy_cache_valid 404 1m;
}
```

## 🔄 **备份和恢复**

### **配置备份**

```bash
# 备份Nginx配置
sudo cp /etc/nginx/nginx.conf /backup/nginx.conf.$(date +%Y%m%d)
sudo cp -r /etc/nginx/sites-available /backup/
sudo cp -r /etc/nginx/sites-enabled /backup/

# 备份Docker数据
docker run --rm -v divine-friend-pwa_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-backup.tar.gz -C /data .
docker run --rm -v divine-friend-pwa_redis_data:/data -v $(pwd):/backup alpine tar czf /backup/redis-backup.tar.gz -C /data .
```

### **恢复配置**

```bash
# 恢复Nginx配置
sudo cp /backup/nginx.conf.20240101 /etc/nginx/nginx.conf
sudo nginx -t && sudo systemctl reload nginx

# 恢复Docker数据
docker run --rm -v divine-friend-pwa_mysql_data:/data -v $(pwd):/backup alpine tar xzf /backup/mysql-backup.tar.gz -C /data
```

## 🎯 **总结**

外部Nginx部署方案的优势：

✅ **复用现有Nginx** - 避免重复安装和配置  
✅ **灵活配置** - 可以根据需要调整代理规则  
✅ **统一管理** - 所有服务通过一个Nginx管理  
✅ **SSL统一** - 使用现有的SSL证书配置  
✅ **性能优化** - 可以应用现有的Nginx优化配置  
✅ **监控集成** - 可以与现有的监控系统集成  

**现在您可以轻松地在有Nginx的服务器上部署Divine Friend PWA！** 🚀

---

**© 2024 Divine Friend PWA Team**  
**版本**: 1.0.0  
**最后更新**: 2024年1月  
**状态**: 外部Nginx部署就绪 🌐 