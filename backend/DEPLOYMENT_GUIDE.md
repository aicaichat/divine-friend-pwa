# 🚀 Divine Friend PWA Backend 线上部署指南

## 📋 目录

1. [部署架构概览](#部署架构概览)
2. [环境准备](#环境准备)
3. [Docker部署](#docker部署)
4. [Kubernetes部署](#kubernetes部署)
5. [独立服务器部署](#独立服务器部署)
6. [云平台部署](#云平台部署)
7. [监控和日志](#监控和日志)
8. [安全配置](#安全配置)
9. [性能优化](#性能优化)
10. [故障排除](#故障排除)

## 🏗️ 部署架构概览

### 推荐架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │───▶│     Nginx       │───▶│  Divine Friend  │
│   (CloudFlare)  │    │   (Reverse      │    │    Backend      │
│                 │    │    Proxy)       │    │   (Gunicorn)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐    ┌─────────────────┐
                       │     Redis       │◀───┤     Cache       │
                       │    (Cache)      │    │    Service      │
                       └─────────────────┘    └─────────────────┘
                       
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Prometheus    │───▶│    Grafana      │
                       │  (Monitoring)   │    │  (Dashboards)   │
                       └─────────────────┘    └─────────────────┘
```

### 组件说明

- **Nginx**: 反向代理、负载均衡、SSL终止
- **Gunicorn**: WSGI应用服务器
- **Redis**: 缓存服务，存储运势计算结果
- **Prometheus**: 监控指标收集
- **Grafana**: 监控仪表板

## 🔧 环境准备

### 系统要求

- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **CPU**: 最少2核，推荐4核
- **内存**: 最少4GB，推荐8GB
- **存储**: 最少20GB，推荐50GB SSD
- **网络**: 稳定的互联网连接

### 必需软件

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y \
    git \
    curl \
    wget \
    python3 \
    python3-pip \
    python3-venv \
    nginx \
    redis-server \
    supervisor

# CentOS/RHEL
sudo yum update -y
sudo yum install -y \
    git \
    curl \
    wget \
    python3 \
    python3-pip \
    nginx \
    redis \
    supervisor
```

### Docker环境 (推荐)

```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 启动Docker服务
sudo systemctl enable docker
sudo systemctl start docker

# 添加用户到docker组
sudo usermod -aG docker $USER
```

## 🐳 Docker部署 (推荐)

### 快速部署

```bash
# 1. 克隆项目
git clone <repository-url>
cd divine-friend-pwa/backend

# 2. 配置环境变量
cp .env.example .env
# 编辑.env文件，设置必要的环境变量

# 3. 启动服务
chmod +x deploy/scripts/deploy.sh
./deploy/scripts/deploy.sh latest production docker
```

### 手动部署

```bash
# 1. 构建镜像
docker build -t divine-friend/backend:latest .

# 2. 创建网络
docker network create divine-friend-network

# 3. 启动Redis
docker run -d \
  --name divine-friend-redis \
  --network divine-friend-network \
  -p 6379:6379 \
  redis:7-alpine

# 4. 启动应用
docker run -d \
  --name divine-friend-backend \
  --network divine-friend-network \
  -p 5001:5001 \
  -e FLASK_ENV=production \
  -e REDIS_URL=redis://divine-friend-redis:6379/0 \
  divine-friend/backend:latest

# 5. 启动Nginx
docker run -d \
  --name divine-friend-nginx \
  --network divine-friend-network \
  -p 80:80 \
  -p 443:443 \
  -v $(pwd)/nginx/nginx.conf:/etc/nginx/nginx.conf \
  nginx:alpine
```

### Docker Compose部署

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## ☸️ Kubernetes部署

### 前置要求

- Kubernetes集群 (1.20+)
- kubectl配置正确
- Helm (可选)

### 部署步骤

```bash
# 1. 创建命名空间
kubectl create namespace divine-friend

# 2. 创建Secrets
kubectl create secret generic divine-friend-secrets \
  --from-literal=secret-key="your-secret-key" \
  --from-literal=redis-url="redis://redis:6379/0" \
  -n divine-friend

# 3. 部署应用
kubectl apply -f deploy/kubernetes/

# 4. 查看部署状态
kubectl get pods -n divine-friend
kubectl get services -n divine-friend
kubectl get ingress -n divine-friend

# 5. 扩展副本
kubectl scale deployment divine-friend-backend --replicas=5 -n divine-friend
```

### Helm部署 (推荐)

```bash
# 1. 添加Helm仓库
helm repo add divine-friend ./deploy/helm

# 2. 安装应用
helm install divine-friend divine-friend/divine-friend-backend \
  --namespace divine-friend \
  --create-namespace \
  --set image.tag=latest \
  --set replicaCount=3

# 3. 升级应用
helm upgrade divine-friend divine-friend/divine-friend-backend \
  --set image.tag=v1.1.0
```

## 🖥️ 独立服务器部署

### 系统用户设置

```bash
# 创建应用用户
sudo adduser divine-friend
sudo usermod -aG sudo divine-friend

# 切换到应用用户
sudo su - divine-friend
```

### 应用部署

```bash
# 1. 克隆代码
git clone <repository-url>
cd divine-friend-pwa/backend

# 2. 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 3. 安装依赖
pip install -r requirements.txt

# 4. 配置环境变量
cp config.py.example config.py
# 编辑config.py

# 5. 创建systemd服务
sudo cp deploy/systemd/divine-friend-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable divine-friend-backend
sudo systemctl start divine-friend-backend
```

### Nginx配置

```bash
# 1. 复制Nginx配置
sudo cp nginx/nginx.conf /etc/nginx/sites-available/divine-friend
sudo ln -s /etc/nginx/sites-available/divine-friend /etc/nginx/sites-enabled/

# 2. 测试配置
sudo nginx -t

# 3. 重启Nginx
sudo systemctl restart nginx
```

### Redis配置

```bash
# 1. 配置Redis
sudo cp redis.conf /etc/redis/
sudo systemctl restart redis

# 2. 设置密码 (可选)
sudo redis-cli
CONFIG SET requirepass your-password
CONFIG REWRITE
```

## ☁️ 云平台部署

### AWS部署

#### ECS部署

```bash
# 1. 创建ECR仓库
aws ecr create-repository --repository-name divine-friend/backend

# 2. 构建并推送镜像
$(aws ecr get-login --no-include-email)
docker build -t divine-friend/backend .
docker tag divine-friend/backend:latest 123456789012.dkr.ecr.us-west-2.amazonaws.com/divine-friend/backend:latest
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/divine-friend/backend:latest

# 3. 创建ECS服务
aws ecs create-service --cli-input-json file://deploy/aws/ecs-service.json
```

#### EKS部署

```bash
# 1. 创建EKS集群
eksctl create cluster --name divine-friend --region us-west-2

# 2. 部署应用
kubectl apply -f deploy/kubernetes/
```

### GCP部署

#### Cloud Run部署

```bash
# 1. 构建并推送镜像
gcloud builds submit --tag gcr.io/PROJECT-ID/divine-friend-backend

# 2. 部署到Cloud Run
gcloud run deploy divine-friend-backend \
  --image gcr.io/PROJECT-ID/divine-friend-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### GKE部署

```bash
# 1. 创建GKE集群
gcloud container clusters create divine-friend \
  --zone us-central1-a \
  --num-nodes 3

# 2. 部署应用
kubectl apply -f deploy/kubernetes/
```

### Azure部署

#### Container Instances

```bash
# 1. 创建资源组
az group create --name divine-friend --location eastus

# 2. 部署容器
az container create \
  --resource-group divine-friend \
  --name divine-friend-backend \
  --image divine-friend/backend:latest \
  --ports 5001 \
  --environment-variables FLASK_ENV=production
```

#### AKS部署

```bash
# 1. 创建AKS集群
az aks create \
  --resource-group divine-friend \
  --name divine-friend-cluster \
  --node-count 3 \
  --enable-addons monitoring

# 2. 获取凭据
az aks get-credentials --resource-group divine-friend --name divine-friend-cluster

# 3. 部署应用
kubectl apply -f deploy/kubernetes/
```

## 📊 监控和日志

### Prometheus监控

```bash
# 1. 启动Prometheus
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

# 2. 启动Grafana
docker run -d \
  --name grafana \
  -p 3000:3000 \
  grafana/grafana
```

### 日志管理

```bash
# 1. 查看应用日志
tail -f /var/log/divine-friend/app.log

# 2. 查看Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 3. 查看systemd日志
journalctl -u divine-friend-backend -f
```

### 健康检查

```bash
# API健康检查
curl http://localhost:5001/api/health

# 详细状态检查
curl http://localhost:5001/api/status
```

## 🔒 安全配置

### SSL/TLS配置

```bash
# 1. 获取Let's Encrypt证书
sudo certbot --nginx -d api.yourdomain.com

# 2. 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

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
chmod 600 config.py
chmod 755 /var/log/divine-friend

# 2. 配置SELinux (CentOS/RHEL)
sudo setsebool -P httpd_can_network_connect 1

# 3. 定期安全更新
sudo apt update && sudo apt upgrade -y  # Ubuntu
sudo yum update -y                      # CentOS
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

### 数据库优化

```bash
# Redis优化
sudo echo 'vm.overcommit_memory = 1' >> /etc/sysctl.conf
sudo echo 'net.core.somaxconn = 65535' >> /etc/sysctl.conf
sudo sysctl -p
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

## 🛠️ 故障排除

### 常见问题

#### 1. 服务无法启动

```bash
# 检查日志
journalctl -u divine-friend-backend -n 50

# 检查端口占用
sudo netstat -tlnp | grep :5001

# 检查权限
ls -la /var/log/divine-friend/
```

#### 2. Redis连接失败

```bash
# 检查Redis状态
sudo systemctl status redis

# 测试连接
redis-cli ping

# 检查配置
grep bind /etc/redis/redis.conf
```

#### 3. Nginx代理错误

```bash
# 检查Nginx配置
sudo nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log

# 重启Nginx
sudo systemctl restart nginx
```

#### 4. 性能问题

```bash
# 检查系统资源
htop
free -h
df -h

# 检查数据库性能
redis-cli info stats
```

### 维护命令

```bash
# 重启服务
sudo systemctl restart divine-friend-backend

# 重载配置
sudo systemctl reload divine-friend-backend

# 查看服务状态
sudo systemctl status divine-friend-backend

# 清理日志
sudo truncate -s 0 /var/log/divine-friend/app.log
```

## 📋 部署检查清单

### 部署前检查

- [ ] 系统要求满足
- [ ] 必需软件已安装
- [ ] 环境变量已配置
- [ ] SSL证书已准备
- [ ] 备份策略已制定

### 部署后检查

- [ ] 服务正常启动
- [ ] 健康检查通过
- [ ] API接口响应正常
- [ ] 监控指标正常
- [ ] 日志输出正常
- [ ] 性能测试通过
- [ ] 安全扫描通过

### 上线检查

- [ ] DNS解析正确
- [ ] CDN配置正确
- [ ] 负载均衡配置正确
- [ ] 监控告警配置
- [ ] 备份验证
- [ ] 灾难恢复测试

## 📞 技术支持

### 联系方式

- **技术文档**: 本文档
- **监控面板**: http://your-domain.com:3000
- **健康检查**: http://your-domain.com/api/health

### 应急响应

1. **服务宕机**: 检查日志 → 重启服务 → 回滚版本
2. **性能问题**: 检查监控 → 扩容资源 → 优化配置
3. **安全事件**: 隔离服务 → 分析日志 → 修复漏洞

---

**© 2024 世界级软件工程师和运维专家**  
**版本**: 1.0.0  
**最后更新**: 2024年1月  
**状态**: 生产就绪 🚀 