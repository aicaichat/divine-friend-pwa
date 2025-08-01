# 🌐 Divine Friend PWA bless.top 域名部署指南

## 📋 **概述**

本指南专门针对 `bless.top` 域名结构进行部署配置，支持二级域名部署，同时保留主域名的现有官网。

## 🎯 **域名架构**

```
bless.top (主域名 - 现有官网)
├── today.bless.top (前端应用)
├── api.bless.top (后端API)
├── admin.bless.top (管理后台)
├── tools.bless.top (管理工具 - 可选)
└── monitor.bless.top (监控面板 - 可选)
```

## 🚀 **快速部署**

### **1. 一键部署**
```bash
# 给脚本执行权限
chmod +x deploy/docker/deploy-external-nginx.sh

# 执行部署
./deploy/docker/deploy-external-nginx.sh production
```

### **2. 手动部署**
```bash
# 构建镜像
docker-compose -f deploy/docker/docker-compose.production-nginx-external.yml build

# 启动服务
docker-compose -f deploy/docker/docker-compose.production-nginx-external.yml up -d

# 配置Nginx
sudo cp deploy/docker/nginx-external/nginx.conf /etc/nginx/sites-available/divine-friend
sudo ln -s /etc/nginx/sites-available/divine-friend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 🔧 **DNS配置**

### **必需DNS记录**
| 类型 | 名称 | 值 | TTL | 说明 |
|------|------|----|-----|------|
| A | today | 服务器IP | 自动 | 前端应用 |
| A | api | 服务器IP | 自动 | 后端API |
| A | admin | 服务器IP | 自动 | 管理后台 |

### **可选DNS记录**
| 类型 | 名称 | 值 | TTL | 说明 |
|------|------|----|-----|------|
| A | tools | 服务器IP | 自动 | 管理工具 |
| A | monitor | 服务器IP | 自动 | 监控面板 |

## 🔒 **SSL证书配置**

### **方案1: 通配符证书 (推荐)**
```bash
# 申请通配符证书
sudo certbot certonly --manual -d *.bless.top

# 证书路径
ssl_certificate /etc/letsencrypt/live/bless.top/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/bless.top/privkey.pem;
```

### **方案2: 单独证书**
```bash
# 为每个子域名申请证书
sudo certbot certonly --nginx -d today.bless.top -d api.bless.top -d admin.bless.top
```

## 🌐 **访问地址**

### **生产环境**
| 服务 | 地址 | 说明 |
|------|------|------|
| **前端应用** | https://today.bless.top | 用户端PWA应用 |
| **API接口** | https://api.bless.top | 后端API服务 |
| **管理后台** | https://admin.bless.top | 管理员后台 |
| **数据库管理** | https://tools.bless.top/phpmyadmin/ | phpMyAdmin |
| **Redis管理** | https://tools.bless.top/redis/ | Redis Commander |
| **邮件测试** | https://tools.bless.top/mail/ | MailHog |
| **Grafana监控** | https://monitor.bless.top/grafana/ | 监控仪表板 |
| **Prometheus** | https://monitor.bless.top/prometheus/ | 指标监控 |

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

#### **1. DNS解析问题**
```bash
# 检查DNS解析
dig today.bless.top +short
dig api.bless.top +short
dig admin.bless.top +short

# 检查本地hosts文件
cat /etc/hosts | grep bless.top
```

#### **2. SSL证书问题**
```bash
# 检查证书路径
sudo ls -la /etc/ssl/certs/bless.top.crt
sudo ls -la /etc/ssl/private/bless.top.key

# 检查证书有效性
sudo openssl x509 -in /etc/ssl/certs/bless.top.crt -text -noout

# 更新Let's Encrypt证书
sudo certbot renew
```

#### **3. 端口冲突**
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

## 🎯 **部署检查清单**

### **部署前检查**
- [ ] DNS记录已配置
- [ ] SSL证书已准备
- [ ] 服务器防火墙已配置
- [ ] 端口未被占用
- [ ] 磁盘空间充足

### **部署后检查**
- [ ] 所有服务正常启动
- [ ] 健康检查通过
- [ ] 域名解析正常
- [ ] SSL证书有效
- [ ] 监控指标正常

### **上线检查**
- [ ] 前端应用可访问
- [ ] API接口响应正常
- [ ] 管理后台可登录
- [ ] 数据库连接正常
- [ ] 监控面板可用

## 📞 **技术支持**

### **联系方式**
- **技术文档**: 本文档
- **监控面板**: https://monitor.bless.top/grafana/
- **健康检查**: https://api.bless.top/api/health

### **应急响应**
1. **服务宕机**: 检查日志 → 重启服务 → 回滚版本
2. **性能问题**: 检查监控 → 扩容资源 → 优化配置
3. **安全事件**: 隔离服务 → 分析日志 → 修复漏洞

---

**© 2024 Divine Friend PWA Team**  
**版本**: 1.0.0  
**最后更新**: 2024年1月  
**状态**: bless.top 域名部署就绪 🌐 