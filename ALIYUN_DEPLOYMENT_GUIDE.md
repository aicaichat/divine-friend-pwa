# 🚀 阿里云服务器部署指南

## 📋 阿里云环境准备

### 系统信息
- **操作系统**: Alibaba Cloud Linux 3.x
- **架构**: x86_64
- **推荐配置**: 4核8GB，100GB云盘

## 🔧 Docker安装（阿里云专用）

### 方法一：使用阿里云官方源（推荐）

```bash
# 1. 更新系统
sudo yum update -y

# 2. 安装必要的工具
sudo yum install -y yum-utils device-mapper-persistent-data lvm2

# 3. 添加阿里云Docker源
sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 4. 安装Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5. 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 6. 验证安装
sudo docker --version
sudo docker-compose --version
```

### 方法二：手动安装Docker Compose

```bash
# 安装Docker Compose v2
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 创建软链接
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# 验证安装
docker-compose --version
```

### 方法三：使用阿里云容器镜像服务

```bash
# 1. 配置阿里云镜像加速
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://registry.cn-hangzhou.aliyuncs.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
EOF

# 2. 重启Docker服务
sudo systemctl daemon-reload
sudo systemctl restart docker

# 3. 验证镜像加速
sudo docker info
```

## 🚀 项目部署

### 1. 克隆项目

```bash
# 安装Git（如果没有）
sudo yum install -y git

# 克隆项目
git clone https://github.com/aicaichat/divine-friend-pwa.git
cd divine-friend-pwa
```

### 2. 配置防火墙

```bash
# 安装firewalld
sudo yum install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# 开放必要端口
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --permanent --add-port=3002/tcp
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --permanent --add-port=8081/tcp
sudo firewall-cmd --permanent --add-port=8082/tcp
sudo firewall-cmd --permanent --add-port=8025/tcp
sudo firewall-cmd --permanent --add-port=9090/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp

# 重新加载防火墙
sudo firewall-cmd --reload

# 查看开放端口
sudo firewall-cmd --list-all
```

### 3. 一键部署

```bash
# 给部署脚本执行权限
chmod +x deploy/docker/deploy.sh

# 执行部署
./deploy/docker/deploy.sh production
```

## 🌐 域名和SSL配置

### 1. 域名解析

在阿里云DNS控制台添加以下记录：

| 类型 | 主机记录 | 记录值 | TTL |
|------|----------|--------|-----|
| A | today | 服务器公网IP | 600 |
| A | api | 服务器公网IP | 600 |
| A | admin | 服务器公网IP | 600 |
| A | tools | 服务器公网IP | 600 |
| A | monitor | 服务器公网IP | 600 |

### 2. SSL证书配置

#### 使用阿里云免费SSL证书

```bash
# 1. 在阿里云控制台申请免费SSL证书
# 2. 下载证书文件到服务器
# 3. 配置证书路径

# 创建证书目录
sudo mkdir -p /etc/nginx/ssl

# 上传证书文件（通过SCP或其他方式）
# 假设证书文件名为 bless.top.pem 和 bless.top.key

# 设置权限
sudo chmod 600 /etc/nginx/ssl/bless.top.key
sudo chmod 644 /etc/nginx/ssl/bless.top.pem
```

#### 使用Let's Encrypt证书

```bash
# 安装certbot
sudo yum install -y epel-release
sudo yum install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d today.bless.top -d api.bless.top -d admin.bless.top

# 设置自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 阿里云特定配置

### 1. 安全组配置

在阿里云ECS控制台配置安全组：

| 端口 | 协议 | 源 | 说明 |
|------|------|----|------|
| 22 | TCP | 0.0.0.0/0 | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP |
| 443 | TCP | 0.0.0.0/0 | HTTPS |
| 3001 | TCP | 0.0.0.0/0 | 前端应用 |
| 3002 | TCP | 0.0.0.0/0 | 管理后台 |
| 5000 | TCP | 0.0.0.0/0 | 后端API |

### 2. 云盘优化

```bash
# 检查磁盘使用情况
df -h

# 如果使用云盘，建议挂载到数据目录
sudo mkdir -p /data
sudo mount /dev/vdb1 /data  # 根据实际设备名调整

# 设置开机自动挂载
echo '/dev/vdb1 /data ext4 defaults 0 0' | sudo tee -a /etc/fstab
```

### 3. 系统优化

```bash
# 优化内核参数
sudo tee -a /etc/sysctl.conf << EOF
# 网络优化
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.ipv4.tcp_congestion_control = bbr
net.core.default_qdisc = fq

# 文件描述符限制
fs.file-max = 65535
EOF

# 应用配置
sudo sysctl -p

# 设置文件描述符限制
sudo tee -a /etc/security/limits.conf << EOF
* soft nofile 65535
* hard nofile 65535
EOF
```

## 📊 监控和日志

### 1. 阿里云监控集成

```bash
# 安装阿里云监控插件
sudo yum install -y aliyun_assist_agent

# 启动监控服务
sudo systemctl start aliyun_assist_agent
sudo systemctl enable aliyun_assist_agent
```

### 2. 日志管理

```bash
# 创建日志目录
sudo mkdir -p /var/log/divine-friend
sudo chown -R 1000:1000 /var/log/divine-friend

# 配置日志轮转
sudo tee /etc/logrotate.d/divine-friend << EOF
/var/log/divine-friend/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF
```

## 🔒 安全加固

### 1. 系统安全

```bash
# 更新系统
sudo yum update -y

# 安装安全工具
sudo yum install -y fail2ban

# 配置fail2ban
sudo tee /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/secure
maxretry = 3
EOF

# 启动fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 2. Docker安全

```bash
# 配置Docker安全选项
sudo tee -a /etc/docker/daemon.json << EOF
{
  "userns-remap": "default",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "live-restore": true,
  "userland-proxy": false
}
EOF

# 重启Docker
sudo systemctl restart docker
```

## 🛠️ 管理命令

### 服务管理

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

### 备份和恢复

```bash
# 备份数据库
docker exec divine-mysql mysqldump -u root -p divine_friend_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# 备份配置文件
tar -czf config_backup_$(date +%Y%m%d_%H%M%S).tar.gz .env deploy/docker/

# 上传备份到阿里云OSS（可选）
# 需要先安装ossutil
wget http://gosspublic.alicdn.com/ossutil/1.7.7/ossutil64
chmod +x ossutil64
./ossutil64 cp backup_*.sql oss://your-bucket-name/backups/
```

## 🔍 故障排除

### 常见问题

#### 1. Docker安装失败

```bash
# 清理旧版本
sudo yum remove docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine

# 重新安装
sudo yum install -y docker-ce docker-ce-cli containerd.io
```

#### 2. 端口被占用

```bash
# 查看端口占用
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# 杀死占用进程
sudo kill -9 <PID>
```

#### 3. 磁盘空间不足

```bash
# 清理Docker
docker system prune -a

# 清理日志
sudo journalctl --vacuum-time=7d

# 清理yum缓存
sudo yum clean all
```

#### 4. 网络连接问题

```bash
# 检查DNS解析
nslookup today.bless.top

# 检查防火墙
sudo firewall-cmd --list-all

# 检查安全组
# 在阿里云控制台检查安全组配置
```

## 📞 阿里云技术支持

- **阿里云文档**: https://help.aliyun.com/
- **工单系统**: 阿里云控制台 → 工单
- **技术支持**: 400-801-3260

## 🎯 部署检查清单

### 部署前检查

- [ ] 阿里云ECS实例已创建
- [ ] 安全组已配置
- [ ] 域名已解析
- [ ] SSL证书已准备
- [ ] Docker已安装
- [ ] 防火墙已配置

### 部署后检查

- [ ] 所有服务正常启动
- [ ] 域名可以访问
- [ ] SSL证书有效
- [ ] 监控正常
- [ ] 备份正常
- [ ] 安全配置生效

---

**© 2024 Divine Friend PWA Team**  
**适配**: Alibaba Cloud Linux  
**状态**: 🚀 生产就绪 