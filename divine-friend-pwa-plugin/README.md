# 交个神仙朋友 PWA WordPress 插件

这个插件允许您将"交个神仙朋友"PWA应用嵌入到您的WordPress网站中。

## 功能特性

- **短代码支持**: 使用简单的短代码在任何页面或文章中嵌入PWA
- **多神仙选择**: 支持6位不同的神仙角色（观音菩萨、不动尊菩萨等）
- **响应式设计**: 自动适配不同设备和屏幕尺寸
- **完整PWA功能**: 支持离线使用、推送通知、语音交互等
- **管理员设置**: 通过WordPress后台进行配置管理

## 安装方法

### 方法一：手动安装

1. 将整个 `divine-friend-pwa-plugin` 文件夹上传到 `/wp-content/plugins/` 目录
2. 在WordPress后台的"插件"页面激活"交个神仙朋友 PWA"插件
3. 前往"设置 > 神仙朋友 PWA"进行基本配置

### 方法二：ZIP安装

1. 将 `divine-friend-pwa-plugin` 文件夹打包为ZIP文件
2. 在WordPress后台选择"插件 > 安装插件 > 上传插件"
3. 选择ZIP文件并安装
4. 激活插件

## 使用方法

### 基本短代码

```
[shenxian_pwa_app]
```

### 自定义参数

```
[shenxian_pwa_app deity="guanyin" height="600px" width="100%" theme="default"]
```

### 可用参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `deity` | `guanyin` | 选择神仙（见下方神仙列表） |
| `height` | `600px` | 容器高度 |
| `width` | `100%` | 容器宽度 |
| `theme` | `default` | 主题样式 |
| `mode` | `embed` | 嵌入模式 |
| `show_header` | `true` | 是否显示顶部栏 |
| `show_footer` | `true` | 是否显示底部导航 |
| `initial_page` | `home` | 初始页面 |
| `custom_css` | `` | 自定义CSS样式 |

### 可用神仙列表

- `guanyin` - 观音菩萨 (慈悲智慧)
- `budongzun` - 不动尊菩萨 (破除障碍)
- `dashizhi` - 大势至菩萨 (智慧光明)
- `wenshu` - 文殊菩萨 (智慧修行)
- `xukong` - 虚空藏菩萨 (财富智慧)
- `amitabha` - 阿弥陀佛 (净土往生)

## 示例用法

### 1. 基础嵌入
```
[shenxian_pwa_app]
```

### 2. 指定神仙和尺寸
```
[shenxian_pwa_app deity="wenshu" height="700px"]
```

### 3. 完整定制
```
[shenxian_pwa_app deity="guanyin" height="800px" width="90%" theme="zen" show_header="false" custom_css="border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);"]
```

### 4. 在小工具中使用
如果您想在侧边栏或其他小工具区域使用，请确保您的主题支持在小工具中执行短代码。

## 配置选项

### 后台设置

1. 前往 **设置 > 神仙朋友 PWA**
2. 设置默认神仙
3. 配置API密钥（如需要）
4. 保存设置

### 高级配置

插件支持通过WordPress的`wp_config.php`进行高级配置：

```php
// 自定义资源URL
define('DIVINE_FRIEND_PWA_CUSTOM_ASSETS_URL', 'https://your-cdn.com/assets/');

// 启用调试模式
define('DIVINE_FRIEND_PWA_DEBUG', true);
```

## 技术要求

- WordPress 5.0 或更高版本
- PHP 7.4 或更高版本
- 现代浏览器（支持PWA功能）

## 功能特性详解

### PWA功能
- 离线访问
- 添加到主屏幕
- 推送通知
- 后台同步

### AI对话功能
- 智能对话
- 语音交互
- 情感分析
- 个性化回应

### 传统文化功能
- 八字分析
- 运势计算
- 经典诵读
- 开光验证

## 故障排除

### 常见问题

**Q: 短代码显示但PWA不加载**
A: 请检查插件是否正确激活，资源文件是否完整上传

**Q: iframe显示空白**
A: 检查服务器是否支持iframe嵌入，某些安全设置可能阻止iframe

**Q: 样式显示异常**
A: 确保CSS文件正确加载，检查主题是否有冲突样式

**Q: 语音功能不工作**
A: 语音功能需要HTTPS环境和用户授权

### 调试模式

在`wp-config.php`中添加：
```php
define('DIVINE_FRIEND_PWA_DEBUG', true);
```

这将启用控制台日志输出，帮助诊断问题。

## 更新日志

### 1.0.0 (2025-07-22)
- 初始版本发布
- 基础短代码功能
- 多神仙支持
- 管理员设置面板
- PWA完整功能集成

## 支持

如需技术支持，请联系：
- 邮箱：support@divine-friend.app
- 网站：https://divine-friend.app
- 文档：https://docs.divine-friend.app

## 许可证

本插件采用 GPL v2 或更高版本许可证。

## 开发者信息

由交个神仙朋友团队开发和维护。
更多信息请访问：https://divine-friend.app