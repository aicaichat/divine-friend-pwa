# 神仙朋友PWA完整架构设计

## 1. 整体架构概览

### 1.1 技术栈
- **前端**: React + TypeScript + Vite
- **后端**: Python Flask + sxtwl (八字计算库)
- **数据库**: SQLite (本地存储) + Redis (缓存)
- **部署**: Docker + Nginx
- **PWA特性**: Service Worker + Manifest

### 1.2 核心功能模块
```
divine-friend-pwa/
├── frontend/                 # React前端
│   ├── src/
│   │   ├── components/      # UI组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # 业务服务
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── types/          # TypeScript类型
│   │   └── utils/          # 工具函数
├── backend/                 # Python后端
│   ├── app.py              # Flask主应用
│   ├── baziutil.py         # 八字计算工具
│   ├── sssmu.py           # 神仙匹配算法
│   └── services/           # 业务服务层
├── shared/                  # 共享类型和常量
└── docs/                   # 文档
```

## 2. 八字计算核心架构

### 2.1 后端八字计算服务

#### 核心API端点
```python
# 八字计算主接口
POST /api/calculate-bazi
{
  "birthdate": "1990-01-01T12:00",
  "name": "张三",
  "gender": "male"
}

# 八字详细分析
POST /api/analyze-bazi
{
  "baziChart": {...},
  "analysisType": "personality|career|health|relationship"
}

# 神仙匹配推荐
POST /api/match-deities
{
  "baziAnalysis": {...},
  "userPreferences": {...}
}
```

#### 八字计算流程
```python
def calculate_user_fortune(birthdate, gender, name):
    # 1. 解析出生信息
    datetime_obj = datetime.strptime(birthdate, '%Y-%m-%dT%H:%M')
    
    # 2. 计算四柱
    day = sxtwl.fromSolar(year, month, day, hour)
    gz = day.getHourGZ(hour)
    
    # 3. 构建八字图表
    gans = Gans(year=Gan[yTG.tg], month=Gan[mTG.tg], 
               day=Gan[dTG.tg], time=Gan[gz.tg])
    zhis = Zhis(year=Zhi[yTG.dz], month=Zhi[mTG.dz], 
                day=Zhi[dTG.dz], time=Zhi[gz.dz])
    
    # 4. 分析各维度
    personality = personality_analysis_f(gans, zhis, ten_deities, min_summary)
    career = shiYe_analysis_f(gans, zhis, min_summary, Dizhi_gx, Ten_deities)
    health = healthy_analysis_f(gans, zhis, min_summary, Dizhi_gx, Ten_deities)
    relationship = love_analysis_f(gans, zhis, min_summary, Dizhi_gx, Ten_deities)
    
    return {
        "baziChart": {...},
        "analysis": {
            "personality": personality,
            "career": career,
            "health": health,
            "relationship": relationship
        }
    }
```

### 2.2 前端八字服务集成

#### BaziService增强版
```typescript
export class BaziService {
  private static API_BASE = '/api'
  
  // 调用后端八字计算
  static async calculateBaziFromServer(birthInfo: UserBirthInfo): Promise<BaziAnalysis> {
    const response = await fetch(`${this.API_BASE}/calculate-bazi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birthdate: `${birthInfo.birthYear}-${birthInfo.birthMonth}-${birthInfo.birthDay}T${birthInfo.birthHour}:${birthInfo.birthMinute}`,
        name: birthInfo.name,
        gender: birthInfo.gender
      })
    })
    
    if (!response.ok) {
      throw new Error('八字计算失败')
    }
    
    return await response.json()
  }
  
  // 获取详细分析
  static async getDetailedAnalysis(baziChart: BaziChart, analysisType: string): Promise<any> {
    const response = await fetch(`${this.API_BASE}/analyze-bazi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baziChart, analysisType })
    })
    
    return await response.json()
  }
  
  // 神仙匹配推荐
  static async getDeityRecommendations(baziAnalysis: BaziAnalysis): Promise<DeityRecommendation> {
    const response = await fetch(`${this.API_BASE}/match-deities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baziAnalysis })
    })
    
    return await response.json()
  }
}
```

## 3. 神仙匹配算法架构

### 3.1 匹配维度
```typescript
interface DeityMatchCriteria {
  // 五行匹配
  elementCompatibility: number
  // 性格匹配
  personalityMatch: number
  // 需求匹配
  needAlignment: number
  // 季节匹配
  seasonalAlignment: number
  // 用户偏好
  userPreference: number
}
```

### 3.2 神仙数据库
```typescript
interface Deity {
  id: string
  name: string
  title: string
  elements: WuxingElement[]
  personality: string[]
  specialties: string[]
  seasonalAffinity: Season[]
  blessingStyle: string
  guidanceStyle: string
  avatarUrl: string
  systemPrompt: string
}
```

## 4. PWA特性实现

### 4.1 Service Worker
```typescript
// sw.js
const CACHE_NAME = 'divine-friend-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'

// 缓存策略
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    // API请求：网络优先，缓存备用
    event.respondWith(networkFirst(event.request))
  } else {
    // 静态资源：缓存优先
    event.respondWith(cacheFirst(event.request))
  }
})
```

### 4.2 离线功能
```typescript
// 离线八字计算
export class OfflineBaziService {
  static async calculateBasicBazi(birthInfo: UserBirthInfo): Promise<BaziChart> {
    // 使用前端简化算法
    return BaziService.calculateBazi(birthInfo)
  }
  
  static getCachedAnalysis(): BaziAnalysis | null {
    return localStorage.getItem('cached-bazi-analysis')
  }
}
```

## 5. 数据流架构

### 5.1 状态管理
```typescript
// 使用Context API管理全局状态
interface AppState {
  user: UserProfile
  baziAnalysis: BaziAnalysis | null
  currentDeity: Deity | null
  chatHistory: ChatMessage[]
  braceletInfo: BraceletInfo | null
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
}>(null)
```

### 5.2 数据持久化
```typescript
// 本地存储策略
export class StorageService {
  static saveBaziData(data: BaziAnalysis): void {
    localStorage.setItem('bazi-analysis', JSON.stringify(data))
  }
  
  static getBaziData(): BaziAnalysis | null {
    const data = localStorage.getItem('bazi-analysis')
    return data ? JSON.parse(data) : null
  }
}
```

## 6. 性能优化架构

### 6.1 前端优化
- **代码分割**: 按路由懒加载
- **图片优化**: WebP格式 + 响应式图片
- **缓存策略**: 静态资源长期缓存
- **预加载**: 关键资源预加载

### 6.2 后端优化
- **缓存层**: Redis缓存八字计算结果
- **数据库优化**: 索引优化 + 查询优化
- **API限流**: 防止滥用
- **异步处理**: 复杂计算异步化

## 7. 安全架构

### 7.1 数据安全
```typescript
// 敏感数据加密
export class SecurityService {
  static encryptBirthInfo(birthInfo: UserBirthInfo): string {
    // 使用AES加密敏感信息
    return CryptoJS.AES.encrypt(JSON.stringify(birthInfo), SECRET_KEY).toString()
  }
  
  static decryptBirthInfo(encryptedData: string): UserBirthInfo {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
  }
}
```

### 7.2 API安全
```python
# 后端安全中间件
from functools import wraps
from flask import request, jsonify

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not validate_token(token):
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function
```

## 8. 部署架构

### 8.1 Docker配置
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=sqlite:///app.db
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

### 8.2 Nginx配置
```nginx
# nginx.conf
server {
    listen 80;
    server_name divine-friend.com;
    
    # 前端静态文件
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api/ {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 9. 监控和日志

### 9.1 前端监控
```typescript
// 性能监控
export class PerformanceMonitor {
  static trackPageLoad() {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0]
      analytics.track('page_load_time', {
        loadTime: perfData.loadEventEnd - perfData.loadEventStart
      })
    })
  }
}
```

### 9.2 后端监控
```python
# 日志配置
import logging
from flask import request

@app.before_request
def log_request_info():
    logging.info('Request: %s %s', request.method, request.url)

@app.after_request
def log_response_info(response):
    logging.info('Response: %s', response.status)
    return response
```

## 10. 测试架构

### 10.1 单元测试
```typescript
// 八字计算测试
describe('BaziService', () => {
  test('should calculate correct bazi chart', () => {
    const birthInfo = {
      birthYear: 1990,
      birthMonth: 1,
      birthDay: 1,
      birthHour: 12,
      birthMinute: 0,
      name: '测试',
      gender: 'male'
    }
    
    const result = BaziService.calculateBazi(birthInfo)
    expect(result.dayMaster).toBe('earth')
  })
})
```

### 10.2 集成测试
```python
# 后端API测试
def test_calculate_fortune():
    response = client.post('/calculate-fortune', json={
        'birthdate': '1990-01-01T12:00',
        'name': '测试',
        'gender': 'male'
    })
    
    assert response.status_code == 200
    assert 'fortune_result' in response.json
```

## 11. 开发工作流

### 11.1 开发环境
```bash
# 启动开发环境
docker-compose -f docker-compose.dev.yml up

# 前端开发
cd frontend && npm run dev

# 后端开发
cd backend && python app.py
```

### 11.2 部署流程
```bash
# 构建生产版本
docker-compose -f docker-compose.prod.yml build

# 部署到服务器
docker-compose -f docker-compose.prod.yml up -d
```

这个架构设计提供了完整的PWA实现方案，包括八字计算、神仙匹配、离线功能、性能优化等核心特性。通过模块化设计和清晰的接口定义，确保了系统的可维护性和可扩展性。 