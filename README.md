# 交个神仙朋友 PWA 🌟

> 东方禅意的AI陪伴应用 - Divine Friend PWA

## 项目简介

交个神仙朋友是一款融合传统东方玄学文化与现代AI技术的Progressive Web App，为用户提供个性化的神仙朋友陪伴、运势分析、求卦问事、经典诵读等功能。

## 主要功能

- 🤖 **AI神仙朋友** - 基于用户八字的个性化AI陪伴
- 🔮 **运势分析** - 专业的八字命理分析和建议
- 🎯 **求卦问事** - 传统六爻求卦功能
- 📿 **经典诵读** - 心经、金刚经、道德经等经典音频
- 💌 **祝福系统** - 好友间互发祝福消息
- 📱 **NFC手串** - 支持NFC验证的开光手串商品

## 技术架构

### 前端技术栈
- **框架**: React 18 + TypeScript
- **状态管理**: Zustand + React Query
- **路由**: React Router v6
- **构建工具**: Vite + PWA Plugin
- **UI库**: 自研东方禅意设计系统
- **PWA**: Workbox + Service Worker

### 后端技术栈
- **CMS**: WordPress 6.4+
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **API**: WordPress REST API + 自定义插件
- **AI集成**: OpenAI GPT-4 / Claude

### DevOps
- **容器化**: Docker + Docker Compose
- **编排**: Kubernetes
- **CI/CD**: GitHub Actions
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack

## 快速开始

### 环境要求
- Node.js 18+
- PHP 8.2+
- MySQL 8.0+
- Redis 7+
- Docker & Docker Compose

### 本地开发

1. 克隆项目
```bash
git clone https://github.com/divine-friend/divine-friend-pwa.git
cd divine-friend-pwa
```

2. 启动开发环境
```bash
# 使用 Docker Compose
docker-compose up -d

# 或者分别启动前后端
cd frontend && npm install && npm run dev
cd backend && composer install
```

3. 访问应用
- 前端: http://localhost:3000
- 后端: http://localhost:8080

### 项目结构
```
divine-friend-pwa/
├── frontend/              # 前端 PWA 应用
├── backend/               # WordPress 后端
├── database/              # 数据库相关
├── devops/                # DevOps 配置
├── docs/                  # 项目文档
├── tests/                 # 测试文件
├── scripts/               # 构建脚本
└── config/                # 配置文件
```

## 开发指南

详细的开发文档请参考 [docs/development](./docs/development/) 目录。

## 部署指南

生产环境部署请参考 [docs/deployment](./docs/deployment/) 目录。

## 贡献指南

欢迎贡献代码！请先阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](./LICENSE) 文件。

## 联系我们

- 项目主页: https://divine-friend.com
- 邮箱: team@divine-friend.com
- 微信群: 扫描二维码加入

---

**愿科技与禅意完美融合，为用户带来内心的平静与智慧的启发。** 🙏✨
