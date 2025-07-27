# 📊 页面打点功能使用说明

## 功能概述

本项目已集成完整的页面打点和分析功能，用于追踪用户行为和页面访问情况。

## 🚀 主要功能

### 1. 自动追踪
- **页面访问**: 自动记录用户访问的页面和停留时间
- **会话管理**: 自动生成会话ID，追踪用户会话生命周期
- **错误监控**: 自动捕获和记录应用错误
- **性能监控**: 记录页面加载性能指标

### 2. 用户行为追踪
- **页面导航**: 记录用户在不同页面间的跳转
- **功能点击**: 追踪用户对各个功能的点击行为
- **表单操作**: 记录设置页面的表单填写和提交
- **手串操作**: 追踪手串验证、修持等关键操作

### 3. 开发调试
- **实时调试面板**: 开发环境下可查看实时分析数据
- **数据导出**: 支持导出分析数据为JSON格式
- **键盘快捷键**: `Ctrl + Shift + A` 打开/关闭调试面板

## 📋 追踪事件列表

### 页面访问事件
- `page_view`: 页面访问
- `page_load`: 页面加载
- `page_navigation`: 页面导航

### 用户行为事件
- `user_action`: 用户操作
- `feature_click`: 功能点击
- `settings_step_next`: 设置步骤前进
- `settings_step_previous`: 设置步骤后退
- `settings_completed`: 设置完成
- `chat_message_sent`: 聊天消息发送
- `deity_reply_generated`: 神仙回复生成
- `deity_switched`: 神仙切换
- `bracelet_verification_started`: 手串验证开始
- `bracelet_verification_success`: 手串验证成功
- `practice_completed`: 修持完成

### 系统事件
- `session_start`: 会话开始
- `session_end`: 会话结束
- `page_hide`: 页面隐藏
- `page_show`: 页面显示
- `error`: 错误事件

### 业务事件
- `fortune_loaded`: 运势加载
- `new_user_visit`: 新用户访问
- `settings_existing_user`: 现有用户设置
- `settings_new_user`: 新用户设置
- `bracelet_already_activated`: 手串已激活
- `bracelet_not_activated`: 手串未激活

## 🛠️ 使用方法

### 1. 在组件中使用

```typescript
import { useAnalytics } from '../hooks/useAnalytics';

const MyComponent = () => {
  const analytics = useAnalytics();
  
  // 追踪页面访问
  useEffect(() => {
    analytics.trackPageView('my-page', '我的页面');
  }, [analytics]);
  
  // 追踪用户操作
  const handleClick = () => {
    analytics.trackUserAction('button_click', { button: 'submit' });
  };
  
  // 追踪错误
  const handleError = (error: Error) => {
    analytics.trackError(error, 'my_component_error');
  };
};
```

### 2. 直接使用服务

```typescript
import analyticsService from '../hooks/useAnalytics';

// 追踪事件
analyticsService.trackEvent('custom_event', { data: 'value' });

// 获取会话数据
const sessionData = analyticsService.getSessionData();
```

## 🔧 配置选项

### 开发环境
- 所有事件会在控制台打印
- 支持实时调试面板
- 数据不会发送到服务器

### 生产环境
- 重要事件会实时发送到服务器
- 会话结束时批量发送数据
- 支持离线数据缓存

## 📊 数据结构

### 事件数据结构
```typescript
interface AnalyticsEvent {
  event: string;           // 事件名称
  page?: string;          // 页面标识
  action?: string;        // 操作类型
  data?: Record<string, any>; // 附加数据
  timestamp: number;      // 时间戳
  sessionId: string;      // 会话ID
}
```

### 页面访问数据结构
```typescript
interface PageView {
  page: string;           // 页面标识
  title: string;          // 页面标题
  timestamp: number;      // 时间戳
  sessionId: string;      // 会话ID
  referrer?: string;      // 来源页面
}
```

## 🎯 最佳实践

### 1. 事件命名规范
- 使用下划线分隔的小写字母
- 动词_名词 格式
- 例如: `user_login`, `feature_click`, `error_occurred`

### 2. 数据收集原则
- 只收集必要的用户行为数据
- 避免收集敏感个人信息
- 确保数据匿名化处理

### 3. 性能考虑
- 避免在关键路径中频繁调用
- 使用批量发送减少网络请求
- 支持离线数据缓存

## 🔍 调试技巧

### 1. 查看实时数据
- 开发环境下按 `Ctrl + Shift + A` 打开调试面板
- 查看事件列表和会话信息
- 导出数据进行分析

### 2. 控制台日志
- 所有事件都会在控制台打印
- 查看 `📊 Analytics Event:` 开头的日志
- 查看 `📄 Page View:` 开头的日志

### 3. 网络请求
- 生产环境下查看网络请求
- 检查 `/api/analytics` 和 `/api/analytics/batch` 接口
- 确认数据发送成功

## 📈 扩展功能

### 1. 自定义事件
```typescript
// 在组件中定义自定义事件
const trackCustomEvent = (eventName: string, data?: any) => {
  analytics.trackEvent(eventName, data);
};
```

### 2. 性能监控
```typescript
// 监控页面性能
useEffect(() => {
  const startTime = performance.now();
  
  return () => {
    const loadTime = performance.now() - startTime;
    analytics.trackEvent('page_performance', { loadTime });
  };
}, []);
```

### 3. 用户画像
```typescript
// 收集用户偏好
const trackUserPreference = (preference: string, value: any) => {
  analytics.trackEvent('user_preference', { preference, value });
};
```

## 🚨 注意事项

1. **隐私保护**: 确保不收集敏感个人信息
2. **性能影响**: 避免在关键路径中频繁调用
3. **数据安全**: 生产环境需要配置安全的API端点
4. **合规要求**: 遵守相关法律法规和隐私政策

## 📞 技术支持

如有问题或建议，请联系开发团队。 