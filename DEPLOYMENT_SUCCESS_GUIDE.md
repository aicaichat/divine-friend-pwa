# 🎉 Divine Friend PWA 部署成功指南

## ✅ 部署状态

恭喜！您的 Divine Friend PWA 已成功部署到阿里云服务器！

### 📡 服务访问地址

- **前端应用**: http://47.99.122.96:3001
- **管理后台**: http://47.99.122.96:3002  
- **后端API**: http://47.99.122.96:5001

### 🔐 防火墙状态

已成功开放以下端口：
- `3001/tcp` - 前端应用
- `3002/tcp` - 管理后台
- `5001/tcp` - 后端API
- `3306/tcp` - MySQL数据库
- `6379/tcp` - Redis缓存

## 🛠️ 服务管理

### 基本管理命令

```bash
# 检查所有服务状态
./manage-services.sh status

# 查看服务信息和访问地址
./manage-services.sh info

# 测试服务连接
./manage-services.sh test

# 查看实时日志
./manage-services.sh logs

# 重启所有服务
./manage-services.sh restart

# 停止所有服务
./manage-services.sh stop

# 启动所有服务
./manage-services.sh start
```

### 单独管理服务

```bash
# 重启数据库
sudo systemctl restart mariadb

# 重启Redis
sudo systemctl restart redis

# 查看系统服务状态
sudo systemctl status mariadb
sudo systemctl status redis
```

## 📊 监控和维护

### 查看服务日志

```bash
# 查看所有应用日志
tail -f logs/*.log

# 查看特定服务日志
tail -f logs/backend.log
tail -f logs/frontend.log
tail -f logs/admin.log

# 查看系统服务日志
sudo journalctl -u mariadb -f
sudo journalctl -u redis -f
```

### 检查资源使用

```bash
# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看CPU使用
top

# 查看网络连接
sudo netstat -tlnp | grep -E ':(3001|3002|5001|3306|6379)'
```

## 🔧 故障排除

### 常见问题解决

#### 1. 服务无法访问

```bash
# 检查服务是否运行
./manage-services.sh status

# 检查防火墙
sudo firewall-cmd --list-all

# 检查进程
ps aux | grep -E '(python|node|serve)'
```

#### 2. 数据库连接问题

```bash
# 检查数据库状态
sudo systemctl status mariadb

# 测试数据库连接
mysql -u divine_friend -p divine_friend_prod

# 重启数据库
sudo systemctl restart mariadb
```

#### 3. Redis连接问题

```bash
# 检查Redis状态
sudo systemctl status redis

# 测试Redis连接
redis-cli ping

# 重启Redis
sudo systemctl restart redis
```

#### 4. 应用服务问题

```bash
# 查看错误日志
tail -100 logs/backend.log
tail -100 logs/frontend.log
tail -100 logs/admin.log

# 重启应用服务
./manage-services.sh restart
```

## 🚀 性能优化

### 定期维护任务

```bash
# 清理日志文件（每周执行）
find logs/ -name "*.log" -mtime +7 -delete

# 备份数据库（每日执行）
mysqldump -u divine_friend -p divine_friend_prod > backup_$(date +%Y%m%d).sql

# 监控磁盘空间
df -h | grep -E '(8[0-9]|9[0-9])%'
```

### 配置自动重启

创建系统服务文件以确保应用开机自启：

```bash
# 创建系统服务
sudo tee /etc/systemd/system/divine-friend.service << EOF
[Unit]
Description=Divine Friend PWA
After=network.target mariadb.service redis.service

[Service]
Type=forking
User=root
WorkingDirectory=/root/divine-friend-pwa
ExecStart=/root/divine-friend-pwa/start-services.sh
ExecStop=/root/divine-friend-pwa/manage-services.sh stop
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 启用并启动服务
sudo systemctl enable divine-friend
sudo systemctl daemon-reload
```

## 📈 扩展和升级

### 代码更新

```bash
# 拉取最新代码
git pull origin main

# 重新构建和部署
./deploy-minimal.sh
```

### 添加HTTPS

```bash
# 安装SSL证书（使用Let's Encrypt）
sudo yum install -y certbot

# 申请证书（替换为您的域名）
sudo certbot certonly --standalone -d your-domain.com

# 配置Nginx反向代理（可选）
sudo yum install -y nginx
```

### 域名配置

如果您有域名，可以：

1. 在阿里云控制台配置A记录指向 `47.99.122.96`
2. 配置子域名：
   - `app.yourdomain.com` → 端口3001
   - `admin.yourdomain.com` → 端口3002
   - `api.yourdomain.com` → 端口5001

## 🔒 安全建议

### 强化安全配置

```bash
# 定期更新系统
sudo yum update -y

# 配置更严格的防火墙规则
sudo firewall-cmd --permanent --remove-service=cockpit
sudo firewall-cmd --reload

# 修改默认密码
mysql -u root -p
# 在MySQL中执行：
# ALTER USER 'divine_friend'@'localhost' IDENTIFIED BY 'new-strong-password';
```

### 备份策略

```bash
# 创建备份脚本
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p backups/$DATE

# 备份数据库
mysqldump -u divine_friend -p divine_friend_prod > backups/$DATE/database.sql

# 备份应用数据
cp -r logs backups/$DATE/
cp -r backend/data backups/$DATE/ 2>/dev/null || true

# 压缩备份
tar -czf backups/backup_$DATE.tar.gz backups/$DATE/
rm -rf backups/$DATE/

echo "备份完成: backups/backup_$DATE.tar.gz"
EOF

chmod +x backup.sh
```

## 📞 技术支持

如果遇到问题，请：

1. 首先检查日志文件：`./manage-services.sh logs`
2. 运行状态检查：`./manage-services.sh status`
3. 尝试重启服务：`./manage-services.sh restart`
4. 检查系统资源：`free -h` 和 `df -h`

---

**🎯 快速访问链接**
- 前端应用: http://47.99.122.96:3001
- 管理后台: http://47.99.122.96:3002
- 后端API: http://47.99.122.96:5001

祝您使用愉快！✨ 