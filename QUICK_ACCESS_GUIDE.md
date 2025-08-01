# 🚀 Divine Friend PWA 快速访问指南

## ✅ **服务状态 - 全部正常运行**

| 服务 | 地址 | 状态 | 说明 |
|------|------|------|------|
| 📱 **前端应用** | http://localhost:3003 | ✅ 正常 | 用户端主应用 |
| 🖥️ **管理后台** | http://localhost:3001 | ✅ 正常 | 管理员后台系统 |
| 🔧 **后端API** | http://localhost:5001 | ✅ 正常 | 后端服务接口 |

## 🎯 **快速访问**

### **1. 用户端应用**
```
http://localhost:3003
```
- 🌟 **今日穿衣** - AI智能穿衣推荐
- 👥 **贵人匹配** - 八字交友系统
- 🧘 **修心** - 修行学习中心
- 💎 **法宝** - 手串功德管理
- 👤 **我的** - 个人中心设置

### **2. 管理后台**
```
http://localhost:3001
```
- 📊 **仪表盘** - 系统概览和关键指标
- 👥 **用户管理** - 用户列表、权限管理
- 📈 **运势分析** - 数据分析报表
- 📝 **内容管理** - 经文、内容编辑
- 📋 **API日志** - 接口调用记录
- 🔍 **系统监控** - 性能监控
- ⚙️ **系统设置** - 配置管理

### **3. 后端API**
```
http://localhost:5001
```
- 🔍 **健康检查**: http://localhost:5001/api/health
- 🤖 **AI穿衣推荐**: http://localhost:5001/api/ai/outfit-recommendations
- 📊 **运势分析**: http://localhost:5001/api/fortune/analysis
- 🧮 **八字计算**: http://localhost:5001/api/bazi/calculate

## 🔧 **技术架构**

### **前端技术栈**
- **用户端**: React + TypeScript + Vite
- **管理后台**: React + TypeScript + Ant Design
- **状态管理**: Zustand
- **路由**: React Router
- **UI组件**: Ant Design 5.x

### **后端技术栈**
- **框架**: Flask (Python)
- **数据库**: SQLite + Redis缓存
- **API**: RESTful API
- **算法**: 八字命理 + AI推荐

## 📱 **功能特色**

### **用户端特色功能**
- 🎨 **AI智能穿衣推荐** - 基于八字和运势的个性化推荐
- 👥 **贵人匹配系统** - 八字交友和贵人推荐
- 📿 **经文诵读** - 高级TTS语音诵读系统
- 💎 **法宝管理** - 手串功德和NFC功能
- 🧘 **修心学习** - 修行历程和学习中心

### **管理后台特色功能**
- 📊 **实时监控** - 系统状态和性能监控
- 👥 **用户管理** - 完整的用户权限管理
- 📈 **数据分析** - 运势分析和用户行为统计
- 🔧 **系统配置** - 灵活的系统参数配置
- 📋 **日志管理** - API调用和系统日志

## 🚀 **启动命令**

### **快速启动所有服务**
```bash
# 1. 启动后端API
cd divine-friend-pwa/backend
source venv/bin/activate
python app.py

# 2. 启动用户端前端
cd divine-friend-pwa/frontend
npm run dev

# 3. 启动管理后台
cd divine-friend-pwa/admin-dashboard
npm run dev
```

### **服务端口配置**
- **用户端前端**: 3003
- **管理后台**: 3001
- **后端API**: 5001

## 🔍 **故障排除**

### **常见问题**

#### **1. 端口被占用**
```bash
# 查看端口占用
lsof -i :3001
lsof -i :3003
lsof -i :5001

# 杀死占用进程
kill -9 <PID>
```

#### **2. 后端服务无法启动**
```bash
# 检查Python环境
cd divine-friend-pwa/backend
source venv/bin/activate
python -c "import app; print('后端模块正常')"
```

#### **3. 前端依赖问题**
```bash
# 重新安装依赖
cd divine-friend-pwa/frontend
rm -rf node_modules package-lock.json
npm install

cd divine-friend-pwa/admin-dashboard
rm -rf node_modules package-lock.json
npm install
```

## 📞 **技术支持**

### **服务状态检查**
```bash
# 检查所有服务状态
curl http://localhost:3003  # 前端应用
curl http://localhost:3001  # 管理后台
curl http://localhost:5001/api/health  # 后端API
```

### **日志查看**
- **前端日志**: 浏览器开发者工具 Console
- **后端日志**: 终端输出
- **管理后台日志**: 浏览器开发者工具 Console

---

**🎉 现在您可以正常访问所有服务了！**

- **用户端**: http://localhost:3003
- **管理后台**: http://localhost:3001
- **后端API**: http://localhost:5001 