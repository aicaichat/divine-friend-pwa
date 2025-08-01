# 🚀 Divine Friend PWA 快速启动指南

## 📋 概述

本指南将帮助您快速启动 Divine Friend PWA 项目，解决环境配置问题，并提供完整的开发环境。

## 🎯 快速启动

### 1. 一键启动所有服务

```bash
# 进入项目目录
cd divine-friend-pwa

# 一键启动所有服务
./quick_start.sh start
```

### 2. 分步启动

```bash
# 仅设置环境
./quick_start.sh setup

# 启动所有服务
./quick_start.sh start
```

## 🛠️ 服务管理

### 启动服务
```bash
./quick_start.sh start
```

### 停止服务
```bash
./stop_services.sh
```

### 重启服务
```bash
./restart_services.sh
```

### 检查状态
```bash
./quick_start.sh status
```

## 🌐 服务访问地址

启动成功后，您可以访问以下地址：

| 服务 | 地址 | 说明 |
|------|------|------|
| **前端应用** | http://localhost:3003 | 用户端PWA应用 |
| **管理后台** | http://localhost:3001 | 管理员后台 |
| **后端API** | http://localhost:5001 | Flask API服务 |

## 🔧 环境配置

### 系统要求

- **Python**: 3.8+
- **Node.js**: 16+
- **npm**: 8+
- **操作系统**: macOS, Linux, Windows

### 自动环境设置

脚本会自动：

1. **检查依赖** - 验证Python、Node.js、npm是否安装
2. **创建虚拟环境** - 为Python后端创建隔离环境
3. **安装依赖** - 自动安装所有必要的包
4. **启动服务** - 按正确顺序启动所有服务
5. **健康检查** - 验证服务是否正常运行

## 📁 项目结构

```
divine-friend-pwa/
├── frontend/           # React前端应用
├── backend/           # Flask后端API
├── admin-dashboard/   # React管理后台
├── logs/              # 日志文件目录
├── quick_start.sh     # 快速启动脚本
├── stop_services.sh   # 停止服务脚本
└── restart_services.sh # 重启服务脚本
```

## 🐛 常见问题解决

### 1. Python命令不存在

**问题**: `zsh: command not found: python`

**解决**: 使用 `python3` 命令
```bash
# 检查Python版本
python3 --version

# 如果未安装，使用Homebrew安装
brew install python3
```

### 2. 端口冲突

**问题**: 端口被占用

**解决**: 使用停止脚本清理端口
```bash
# 强制停止所有服务
./stop_services.sh force

# 重新启动
./quick_start.sh start
```

### 3. 依赖安装失败

**问题**: npm或pip安装失败

**解决**: 清理缓存重新安装
```bash
# 清理npm缓存
npm cache clean --force

# 清理pip缓存
pip cache purge

# 重新设置环境
./quick_start.sh setup
```

### 4. 虚拟环境问题

**问题**: `source: no such file or directory: venv/bin/activate`

**解决**: 重新创建虚拟环境
```bash
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 5. Redis连接失败

**问题**: `Redis连接失败，使用内存缓存`

**解决**: 这是正常的，应用会自动使用内存缓存
```bash
# 可选：安装Redis
brew install redis

# 启动Redis服务
redis-server --daemonize yes
```

## 📊 日志管理

### 查看日志

```bash
# 查看所有日志
tail -f logs/*.log

# 查看特定服务日志
tail -f logs/backend.log
tail -f logs/frontend.log
tail -f logs/admin.log
```

### 日志文件位置

- **后端日志**: `logs/backend.log`
- **前端日志**: `logs/frontend.log`
- **管理后台日志**: `logs/admin.log`

## 🔍 调试技巧

### 1. 检查服务状态

```bash
# 检查所有服务状态
./quick_start.sh status

# 检查端口占用
lsof -i:3003
lsof -i:3001
lsof -i:5001
```

### 2. 手动启动服务

```bash
# 手动启动后端
cd backend
source venv/bin/activate
python app.py

# 手动启动前端
cd frontend
npm run dev

# 手动启动管理后台
cd admin-dashboard
npm run dev
```

### 3. API测试

```bash
# 测试后端健康检查
curl http://localhost:5001/api/health

# 测试API接口
curl http://localhost:5001/api/fortune/today
```

## 🚀 生产部署

### Docker部署

```bash
# 使用Docker Compose部署
docker-compose -f deploy/docker/docker-compose.production.yml up -d

# 或使用独立部署脚本
./deploy/docker/deploy.sh production
```

### 外部Nginx部署

```bash
# 使用外部Nginx部署
./deploy/docker/deploy-external-nginx.sh production
```

## 📞 技术支持

### 获取帮助

1. **查看日志**: 检查 `logs/` 目录下的日志文件
2. **检查状态**: 使用 `./quick_start.sh status`
3. **重启服务**: 使用 `./restart_services.sh`
4. **强制停止**: 使用 `./stop_services.sh force`

### 常见错误码

- **端口占用**: 使用停止脚本清理端口
- **依赖缺失**: 运行 `./quick_start.sh setup`
- **权限问题**: 确保脚本有执行权限 `chmod +x *.sh`

## 🎯 下一步

启动成功后，您可以：

1. **访问前端应用**: http://localhost:3003
2. **访问管理后台**: http://localhost:3001
3. **测试API接口**: http://localhost:5001/api/health
4. **查看API文档**: http://localhost:5001/api/docs

## 📝 更新日志

- **v1.0.0**: 初始版本，支持基本功能
- **v1.1.0**: 添加快速启动脚本
- **v1.2.0**: 完善服务管理功能
- **v1.3.0**: 添加Docker部署支持

---

**© 2024 Divine Friend PWA Team**  
**版本**: 1.3.0  
**状态**: 生产就绪 🚀 