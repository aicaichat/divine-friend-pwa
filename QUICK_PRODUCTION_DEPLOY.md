# 🚀 生产环境快速部署指南

## ⚡ 一键部署（推荐）

### 1. 服务器准备

```bash
# 系统要求
- Ubuntu 20.04+ / CentOS 8+
- 4GB+ 内存
- 50GB+ 磁盘空间
- 公网IP地址

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 项目部署

```bash
# 克隆项目
git clone https://github.com/aicaichat/divine-friend-pwa.git
cd divine-friend-pwa

# 一键部署
chmod +x deploy/docker/deploy.sh
./deploy/docker/deploy.sh production
```

### 3. 域名配置

在您的域名管理面板添加DNS记录：

```
A    today.bless.top    →    服务器IP
A    api.bless.top      →    服务器IP  
A    admin.bless.top    →    服务器IP
A    tools.bless.top    →    服务器IP
A    monitor.bless.top  →    服务器IP
```

### 4. 访问地址

部署完成后，访问以下地址：

- **前端应用**: https://today.bless.top
- **管理后台**: https://admin.bless.top
- **API接口**: https://api.bless.top
- **数据库管理**: https://tools.bless.top/phpmyadmin/
- **监控面板**: https://monitor.bless.top/grafana/

## 🔧 管理命令

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
git pull
docker-compose -f deploy/docker/docker-compose.production.yml up -d --build
```

## 🔒 安全配置

```bash
# 防火墙配置
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# SSL证书（Let's Encrypt）
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d today.bless.top -d api.bless.top -d admin.bless.top
```

## 📊 监控和备份

```bash
# 备份数据库
docker exec divine-mysql mysqldump -u root -p divine_friend_prod > backup.sql

# 查看监控
# 访问 https://monitor.bless.top/grafana/

# 查看日志
docker-compose -f deploy/docker/docker-compose.production.yml logs -f
```

## 🆘 故障排除

### 常见问题

1. **服务无法启动**
   ```bash
   docker-compose -f deploy/docker/docker-compose.production.yml logs
   ```

2. **域名无法访问**
   ```bash
   # 检查DNS解析
   nslookup today.bless.top
   
   # 检查端口
   sudo netstat -tlnp | grep :80
   sudo netstat -tlnp | grep :443
   ```

3. **SSL证书问题**
   ```bash
   sudo certbot renew
   sudo systemctl reload nginx
   ```

## 📞 技术支持

- **文档**: 查看 `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **GitHub**: https://github.com/aicaichat/divine-friend-pwa
- **问题反馈**: GitHub Issues

---

**© 2024 Divine Friend PWA Team**  
**状态**: 🚀 生产就绪 