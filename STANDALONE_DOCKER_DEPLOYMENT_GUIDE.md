# 🐳 Divine Friend PWA 独立Docker部署指南

## 📋 **概述**

本指南提供完全独立的Docker部署方案，不依赖外部Nginx，使用内置的Nginx容器处理所有服务。适合全新服务器或不想配置外部Nginx的环境。

## 🎯 **架构特点**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx容器     │───▶│   前端容器      │    │   后端容器      │
│   (80/443端口)  │    │   (React PWA)   │    │   (Flask API)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
         │   MySQL容器     │    │   Redis容器     │    │   监控容器      │
         │   (数据库)      │    │   (缓存)        │    │   (Prometheus)  │
         └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 **快速部署**

### **1. 一键部署**
```bash
# 给脚本执行权限
chmod +x deploy/docker/deploy-standalone.sh

# 执行部署
./deploy/docker/deploy-standalone.sh production
```

### **2. 手动部署**
```bash
# 构建镜像
docker-compose -f deploy/docker/docker-compose.production-standalone.yml build

# 启动服务
docker-compose -f deploy/docker/docker-compose.production-standalone.yml up -d

# 查看服务状态
docker-compose -f deploy/docker/docker-compose.production-standalone.yml ps
```

## 🔧 **端口配置**

### **对外端口**
| 端口 | 服务 | 说明 |
|------|------|------|
| 80 | Nginx | HTTP重定向到HTTPS |
| 443 | Nginx | HTTPS服务 |

### **内部端口**
| 服务 | 容器端口 | 说明 |
|------|----------|------|
| 前端应用 | 80 | React PWA |
| 管理后台 | 80 | React Admin |
| 后端API | 5000 | Flask API |
| MySQL | 3306 | 数据库 |
| Redis | 6379 | 缓存 |
| phpMyAdmin | 80 | 数据库管理 |
| Redis Commander | 8081 | Redis管理 |
| MailHog | 8025 | 邮件测试 |
| Grafana | 3000 | 监控面板 |
| Prometheus | 9090 | 指标收集 |

## 🌐 **域名配置**

### **DNS记录**
| 类型 | 名称 | 值 | 说明 |
|------|------|----|------|
| A | today | 服务器IP | 前端应用 |
| A | api | 服务器IP | 后端API |
| A | admin | 服务器IP | 管理后台 |
| A | tools | 服务器IP | 管理工具 |
| A | monitor | 服务器IP | 监控面板 |

### **访问地址**
| 服务 | 生产地址 | 本地地址 |
|------|----------|----------|
| **前端应用** | https://today.bless.top | http://localhost |
| **API接口** | https://api.bless.top | http://localhost/api |
| **管理后台** | https://admin.bless.top | http://localhost/admin |
| **数据库管理** | https://tools.bless.top/phpmyadmin/ | http://localhost/tools/phpmyadmin/ |
| **Redis管理** | https://tools.bless.top/redis/ | http://localhost/tools/redis/ |
| **邮件测试** | https://tools.bless.top/mail/ | http://localhost/tools/mail/ |
| **Grafana监控** | https://monitor.bless.top/grafana/ | http://localhost/monitor/grafana/ |
| **Prometheus** | https://monitor.bless.top/prometheus/ | http://localhost/monitor/prometheus/ |

## 🔒 **SSL证书配置**

### **自动生成自签名证书**
部署脚本会自动生成自签名证书：
```bash
# 证书位置
deploy/docker/nginx/ssl/bless.top.crt
deploy/docker/nginx/ssl/bless.top.key
```

### **使用正式证书**
```bash
# 替换自签名证书
cp your-certificate.crt deploy/docker/nginx/ssl/bless.top.crt
cp your-private-key.key deploy/docker/nginx/ssl/bless.top.key

# 重启Nginx容器
docker-compose -f deploy/docker/docker-compose.production-standalone.yml restart nginx
```

### **Let's Encrypt证书**
```bash
# 申请证书
sudo certbot certonly --standalone -d today.bless.top -d api.bless.top -d admin.bless.top

# 复制证书
sudo cp /etc/letsencrypt/live/today.bless.top/fullchain.pem deploy/docker/nginx/ssl/bless.top.crt
sudo cp /etc/letsencrypt/live/today.bless.top/privkey.pem deploy/docker/nginx/ssl/bless.top.key
```

## 🛠️ **管理命令**

### **服务管理**
```bash
# 查看服务状态
docker-compose -f deploy/docker/docker-compose.production-standalone.yml ps

# 查看日志
docker-compose -f deploy/docker/docker-compose.production-standalone.yml logs -f

# 重启服务
docker-compose -f deploy/docker/docker-compose.production-standalone.yml restart

# 停止服务
docker-compose -f deploy/docker/docker-compose.production-standalone.yml down

# 更新服务
docker-compose -f deploy/docker/docker-compose.production-standalone.yml up -d --build
```

### **容器管理**
```bash
# 查看所有容器
docker ps -a

# 查看容器日志
docker logs divine-nginx
docker logs divine-frontend
docker logs divine-backend

# 进入容器
docker exec -it divine-nginx sh
docker exec -it divine-mysql mysql -u root -p
docker exec -it divine-redis redis-cli
```

### **数据备份**
```bash
# 备份MySQL数据
docker exec divine-mysql mysqldump -u root -p divine_friend_prod > backup.sql

# 备份Redis数据
docker exec divine-redis redis-cli --rdb /data/dump.rdb

# 备份配置文件
tar -czf config-backup.tar.gz deploy/docker/nginx/ssl/ .env
```

## 🔍 **故障排除**

### **常见问题**

#### **1. 端口冲突**
```bash
# 检查端口占用
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# 停止占用端口的服务
sudo systemctl stop nginx  # 如果系统有Nginx
sudo systemctl stop apache2  # 如果系统有Apache
```

#### **2. SSL证书问题**
```bash
# 检查证书文件
ls -la deploy/docker/nginx/ssl/

# 重新生成证书
rm deploy/docker/nginx/ssl/bless.top.*
./deploy/docker/deploy-standalone.sh production
```

#### **3. 容器无法启动**
```bash
# 查看容器状态
docker ps -a

# 查看详细日志
docker logs divine-nginx
docker logs divine-frontend
docker logs divine-backend

# 检查磁盘空间
df -h

# 检查内存使用
free -h
```

#### **4. 域名无法访问**
```bash
# 检查DNS解析
dig today.bless.top +short
dig api.bless.top +short

# 检查防火墙
sudo ufw status
sudo iptables -L

# 检查Nginx配置
docker exec divine-nginx nginx -t
```

### **调试命令**
```bash
# 检查所有服务状态
./deploy/docker/deploy-standalone.sh health-check

# 查看系统资源
docker stats

# 检查网络连接
curl -I http://localhost
curl -I http://localhost/api/health
curl -I https://localhost

# 查看Nginx访问日志
docker exec divine-nginx tail -f /var/log/nginx/access.log
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

### **自动备份脚本**
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup_$DATE"

mkdir -p $BACKUP_DIR

# 备份MySQL数据
docker exec divine-mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} divine_friend_prod > $BACKUP_DIR/mysql_backup.sql

# 备份Redis数据
docker exec divine-redis redis-cli --rdb /data/dump.rdb
docker cp divine-redis:/data/dump.rdb $BACKUP_DIR/redis_backup.rdb

# 备份配置文件
cp -r deploy/docker/nginx/ssl/ $BACKUP_DIR/
cp .env $BACKUP_DIR/

# 压缩备份
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

echo "备份完成: $BACKUP_DIR.tar.gz"
```

### **恢复数据**
```bash
# 恢复MySQL数据
docker exec -i divine-mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} divine_friend_prod < backup.sql

# 恢复Redis数据
docker cp redis_backup.rdb divine-redis:/data/dump.rdb
docker exec divine-redis redis-cli BGREWRITEAOF

# 恢复配置文件
cp -r backup/ssl/* deploy/docker/nginx/ssl/
cp backup/.env ./
```

## 🎯 **部署检查清单**

### **部署前检查**
- [ ] Docker和Docker Compose已安装
- [ ] 80和443端口未被占用
- [ ] 磁盘空间充足（至少10GB）
- [ ] 内存充足（至少4GB）

### **部署后检查**
- [ ] 所有容器正常启动
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

## 📊 **监控和维护**

### **监控指标**
- CPU使用率
- 内存使用率
- 磁盘使用率
- 网络流量
- 响应时间
- 错误率

### **定期维护**
- 每周备份数据
- 每月更新SSL证书
- 每季度更新Docker镜像
- 定期检查日志文件
- 监控系统资源使用

## 🎯 **优势总结**

### **独立Docker方案的优势**
✅ **完全独立** - 不依赖外部Nginx，配置简单  
✅ **一键部署** - 自动化部署脚本，减少人工操作  
✅ **内置SSL** - 自动生成SSL证书，支持HTTPS  
✅ **完整监控** - 内置Prometheus、Grafana监控  
✅ **管理工具** - 内置phpMyAdmin、Redis Commander  
✅ **多域名支持** - 支持多个子域名配置  
✅ **易于维护** - 容器化部署，便于管理和升级  
✅ **资源隔离** - 各服务独立运行，互不影响  

**现在您可以轻松地在任何服务器上部署Divine Friend PWA！** 🚀

---

**© 2024 Divine Friend PWA Team**  
**版本**: 1.0.0  
**最后更新**: 2024年1月  
**状态**: 独立Docker部署就绪 🐳 