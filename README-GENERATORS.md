# 交个神仙朋友 PWA - 代码生成器工具集 🛠️

> 快速构建东方禅意的AI陪伴应用开发环境

## 📋 工具概览

本工具集提供了完整的项目脚手架和代码生成功能，帮助开发者快速搭建"交个神仙朋友"PWA应用的开发环境。

### 🔧 生成器列表

| 工具名称 | 功能描述 | 使用场景 |
|---------|---------|---------|
| `create-project-structure.sh` | 项目目录结构生成器 | 初始化完整项目结构 |
| `generate-components.js` | React组件生成器 | 快速创建前端组件 |
| `generate-backend.js` | WordPress插件生成器 | 快速创建后端插件 |
| `generate-docker.js` | Docker配置生成器 | 生成容器化配置 |

## 🚀 快速开始

### 1. 项目初始化

```bash
# 生成完整项目结构
./create-project-structure.sh

# 进入项目目录
cd divine-friend-pwa

# 初始化Git仓库
git init
git add .
git commit -m "🎉 初始化交个神仙朋友PWA项目"
```

### 2. 前端组件开发

```bash
# 进入前端目录
cd frontend

# 生成React组件
node ../generate-components.js

# 示例：创建神仙朋友组件
# 选择 7 (special) -> 1 (DeityFriend)
# 组件名称: DeityFriend
# 描述: AI神仙朋友交互组件
```

### 3. 后端插件开发

```bash
# 进入后端目录
cd backend

# 生成WordPress插件
node ../generate-backend.js

# 示例：创建核心功能插件
# 选择 1 (core)
# 插件名称: Core Functions
# 描述: 交个神仙朋友核心功能插件
```

### 4. 容器化部署

```bash
# 生成Docker配置
node generate-docker.js

# 启动开发环境
docker-compose up -d

# 启动生产环境
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 项目结构说明

执行 `create-project-structure.sh` 后，会生成以下完整的项目结构：

```
divine-friend-pwa/
├── frontend/                 # 前端 PWA 应用
│   ├── src/
│   │   ├── components/       # 组件库
│   │   │   ├── ui/          # 基础UI组件
│   │   │   ├── layout/      # 布局组件
│   │   │   └── features/    # 功能组件
│   │   │       ├── deity-friend/      # 神仙朋友组件
│   │   │       ├── fortune-analysis/  # 运势分析组件
│   │   │       ├── blessing-system/   # 祝福系统组件
│   │   │       ├── nfc-integration/   # NFC集成组件
│   │   │       └── ai-chat/           # AI对话组件
│   │   ├── pages/           # 页面组件
│   │   │   ├── home/        # 首页
│   │   │   ├── bazi/        # 八字分析
│   │   │   ├── divination/  # 求卦问事
│   │   │   ├── sutra/       # 经典诵读
│   │   │   ├── profile/     # 个人资料
│   │   │   ├── bracelet/    # 手串展示
│   │   │   └── chat/        # AI对话
│   │   ├── hooks/           # 自定义Hook
│   │   ├── services/        # API服务
│   │   │   ├── api/         # 基础API
│   │   │   ├── auth/        # 认证服务
│   │   │   ├── ai/          # AI服务
│   │   │   ├── nfc/         # NFC服务
│   │   │   └── payment/     # 支付服务
│   │   ├── stores/          # 状态管理
│   │   ├── styles/          # 样式文件
│   │   │   ├── base/        # 基础样式
│   │   │   ├── components/  # 组件样式
│   │   │   ├── layouts/     # 布局样式
│   │   │   └── utilities/   # 工具样式
│   │   └── utils/           # 工具函数
│   ├── public/              # 静态资源
│   └── package.json         # 依赖配置
├── backend/                 # WordPress 后端
│   ├── plugins/             # 自定义插件
│   │   ├── zen-core/            # 核心功能插件
│   │   ├── zen-ai-integration/  # AI集成插件
│   │   ├── zen-nfc-manager/     # NFC管理插件
│   │   ├── zen-payment-gateway/ # 支付网关插件
│   │   └── zen-user-management/ # 用户管理插件
│   └── themes/              # 自定义主题
├── database/                # 数据库相关
│   ├── migrations/          # 数据库迁移
│   ├── seeds/               # 初始数据
│   └── schemas/             # 数据库模式
├── devops/                  # DevOps配置
│   ├── docker/              # Docker配置
│   ├── kubernetes/          # K8s配置
│   ├── nginx/               # Nginx配置
│   ├── monitoring/          # 监控配置
│   └── logging/             # 日志配置
├── docs/                    # 项目文档
├── tests/                   # 测试文件
├── scripts/                 # 构建脚本
├── config/                  # 配置文件
├── docker-compose.yml       # 开发环境
├── docker-compose.prod.yml  # 生产环境
└── README.md                # 项目说明
```

## 🎨 组件生成器详解

### 支持的组件类型

1. **基础组件 (component)**
   - 通用UI组件
   - 支持TypeScript
   - 包含Framer Motion动画
   - 遵循禅意设计系统

2. **页面组件 (page)**
   - 完整页面结构
   - SEO优化配置
   - 响应式布局
   - 路由配置

3. **自定义Hook (hook)**
   - 业务逻辑封装
   - 状态管理
   - 副作用处理
   - TypeScript类型定义

4. **API服务 (service)**
   - RESTful API封装
   - 错误处理
   - 请求拦截
   - 响应格式化

5. **状态管理 (store)**
   - Zustand状态存储
   - DevTools支持
   - 持久化配置
   - 类型安全

6. **类型定义 (types)**
   - TypeScript接口
   - 数据模型
   - API响应类型
   - 组件Props类型

7. **特殊组件 (special)**
   - 神仙朋友交互组件
   - 运势分析组件
   - 求卦问事组件
   - NFC读取组件
   - 祝福发送组件

### 特殊组件功能

#### 神仙朋友组件 (DeityFriend)
```typescript
// 主要功能
- AI对话交互
- 动态头像动画
- 祝福气泡显示
- 神圣光效
- 语音合成
- 情感表达

// 技术特性
- Framer Motion动画
- WebSpeech API
- Canvas粒子效果
- 响应式设计
```

#### 运势分析组件 (FortuneAnalysis)
```typescript
// 主要功能
- 五行雷达图
- 运势评分显示
- 详细分析报告
- 今日建议
- 历史记录

// 技术特性
- D3.js数据可视化
- Canvas绘图
- 动态数据更新
- 图表交互
```

#### 求卦组件 (DivinationCast)
```typescript
// 主要功能
- 手机摇动检测
- 铜钱旋转动画
- 卦象生成
- 结果解读
- 历史记录

// 技术特性
- DeviceMotion API
- CSS3动画
- 随机算法
- 触觉反馈
```

## 🔧 后端插件生成器详解

### 支持的插件类型

1. **核心功能插件 (core)**
   - 用户管理
   - 数据模型
   - REST API
   - 权限控制

2. **AI集成插件 (ai-integration)**
   - OpenAI/Claude集成
   - 提示词管理
   - 对话历史
   - 内容审核

3. **NFC管理插件 (nfc-manager)**
   - NFC标签验证
   - 手串信息管理
   - 真伪验证
   - 库存管理

4. **支付网关插件 (payment-gateway)**
   - 微信支付
   - 支付宝
   - 订单管理
   - 退款处理

5. **用户管理插件 (user-management)**
   - 扩展用户信息
   - 八字数据管理
   - 权限角色
   - 社交功能

### 插件文件结构

每个生成的插件包含：

```php
zen-plugin/
├── zen-plugin.php           # 主插件文件
├── includes/
│   ├── api/                 # REST API控制器
│   ├── models/              # 数据模型
│   ├── services/            # 业务逻辑
│   ├── controllers/         # 控制器
│   ├── class-zen-activator.php      # 激活器
│   ├── class-zen-deactivator.php    # 停用器
│   ├── class-zen-post-types.php     # 自定义文章类型
│   └── class-zen-taxonomies.php     # 自定义分类法
├── admin/                   # 管理界面
├── public/                  # 公共文件
├── assets/                  # 静态资源
├── languages/               # 语言文件
├── templates/               # 模板文件
└── README.md                # 插件说明
```

## 🐳 Docker配置生成器详解

### 生成的配置文件

1. **开发环境配置**
   - `docker-compose.yml`
   - 热重载支持
   - 调试工具集成
   - 开发数据库

2. **生产环境配置**
   - `docker-compose.prod.yml`
   - 性能优化
   - 安全配置
   - 监控集成

3. **Kubernetes配置**
   - Deployment配置
   - Service配置
   - Ingress配置
   - ConfigMap/Secret

4. **Nginx配置**
   - 反向代理
   - 静态文件服务
   - 缓存策略
   - HTTPS配置

### 服务架构

```yaml
services:
  frontend:     # React PWA应用
  backend:      # WordPress API
  mysql:        # 数据库
  redis:        # 缓存
  nginx:        # 反向代理
  prometheus:   # 监控
  grafana:      # 图表
  mailhog:      # 邮件测试 (开发环境)
```

## 📚 使用示例

### 创建完整的神仙朋友功能

1. **生成项目结构**
```bash
./create-project-structure.sh
cd divine-friend-pwa
```

2. **创建神仙朋友组件**
```bash
cd frontend
node ../generate-components.js
# 选择: 7 (special) -> 1 (DeityFriend)
```

3. **创建运势分析页面**
```bash
node ../generate-components.js
# 选择: 2 (page)
# 名称: Fortune
# 描述: 运势分析页面
```

4. **创建API服务**
```bash
node ../generate-components.js
# 选择: 4 (service)
# 名称: Fortune
# 描述: 运势分析API服务
```

5. **创建WordPress插件**
```bash
cd ../backend
node ../generate-backend.js
# 选择: 1 (core)
# 名称: Core Functions
# 描述: 核心功能插件
```

6. **启动开发环境**
```bash
cd ..
node generate-docker.js
docker-compose up -d
```

### 自定义组件开发

创建一个新的祝福发送组件：

```bash
node generate-components.js
# 选择: 1 (component)
# 名称: BlessingSender
# 描述: 祝福消息发送组件
```

生成的组件将包含：
- TypeScript类型定义
- Framer Motion动画
- 禅意设计样式
- 响应式布局
- 无障碍支持

## 🔄 工作流程建议

### 日常开发流程

1. **功能开发**
   ```bash
   # 创建新功能组件
   node generate-components.js
   
   # 创建对应的API服务
   node generate-components.js
   
   # 创建状态管理
   node generate-components.js
   ```

2. **后端扩展**
   ```bash
   # 创建新的WordPress插件
   node generate-backend.js
   
   # 或扩展现有插件功能
   # 手动编辑 backend/plugins/zen-*/
   ```

3. **部署更新**
   ```bash
   # 重新生成Docker配置（如需要）
   node generate-docker.js
   
   # 重新构建并部署
   docker-compose build
   docker-compose up -d
   ```

### 团队协作建议

1. **统一工具使用**
   - 所有团队成员使用相同的生成器
   - 遵循生成的代码结构
   - 保持一致的命名规范

2. **代码审查重点**
   - 检查生成代码的自定义部分
   - 确保遵循禅意设计原则
   - 验证TypeScript类型定义

3. **文档维护**
   - 更新组件文档
   - 记录API变更
   - 维护部署文档

## ⚠️ 注意事项

### 环境要求

- Node.js 18+
- Docker & Docker Compose
- Git
- 文本编辑器/IDE

### 安全考虑

1. **敏感信息**
   - 不要将API密钥提交到代码库
   - 使用环境变量管理配置
   - 定期更新密码和密钥

2. **权限控制**
   - 合理设置文件权限
   - 限制数据库访问
   - 配置防火墙规则

### 性能优化

1. **前端优化**
   - 使用代码分割
   - 压缩静态资源
   - 配置合适的缓存策略

2. **后端优化**
   - 使用Redis缓存
   - 优化数据库查询
   - 配置CDN加速

## 🤝 贡献指南

欢迎贡献代码和改进建议！

1. Fork本项目
2. 创建功能分支
3. 提交代码更改
4. 发起Pull Request

### 贡献内容

- 新的组件模板
- 插件模板优化
- Docker配置改进
- 文档完善
- Bug修复

## 📞 技术支持

如果在使用过程中遇到问题，请：

1. 查看本文档的常见问题部分
2. 检查生成的README文件
3. 查看项目日志文件
4. 联系技术支持团队

---

**愿你的代码如禅意般优雅，项目如神仙朋友般智慧！** 🙏✨ 