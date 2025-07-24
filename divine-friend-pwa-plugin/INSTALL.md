# 交个神仙朋友 PWA 插件安装指南

## 问题诊断

如果您遇到短代码显示网站首页而不是PWA功能的问题，这通常是由于缺少WordPress插件的PHP处理文件造成的。

## 解决方案

### 步骤1: 检查插件文件结构

确保您的插件目录 `divine-friend-pwa-plugin` 包含以下文件：

```
divine-friend-pwa-plugin/
├── divine-friend-pwa-plugin.php  (主插件文件 - 必需!)
├── README.md
├── INSTALL.md
└── assets/
    ├── index.html
    ├── manifest.json
    ├── assets/
    │   ├── index-00615e99.js
    │   └── index-eecd1ac5.css
    └── ...其他资源文件
```

**重要**: `divine-friend-pwa-plugin.php` 文件是处理短代码的核心文件，如果缺少这个文件，短代码将不会工作。

### 步骤2: 安装插件

#### 方法A: 直接上传文件夹

1. 将整个 `divine-friend-pwa-plugin` 文件夹上传到您的WordPress安装目录的 `/wp-content/plugins/` 下
2. 确保路径为：`/wp-content/plugins/divine-friend-pwa-plugin/`
3. 在WordPress后台访问 "插件" 页面
4. 找到 "交个神仙朋友 PWA" 并点击 "激活"

#### 方法B: ZIP文件安装

1. 将 `divine-friend-pwa-plugin` 文件夹压缩为 `.zip` 文件
2. 在WordPress后台选择 "插件 > 安装插件 > 上传插件"
3. 选择ZIP文件并安装
4. 激活插件

### 步骤3: 验证安装

1. 插件激活后，访问 "设置 > 神仙朋友 PWA"
2. 如果能看到设置页面，说明插件安装成功
3. 在任意页面或文章中测试短代码：
   ```
   [shenxian_pwa_app deity="guanyin" height="600px"]
   ```

### 步骤4: 故障排除

如果短代码仍然不工作：

#### 检查1: 文件权限
确保插件文件夹和文件具有正确的权限：
- 文件夹权限：755
- 文件权限：644

#### 检查2: 插件是否激活
在WordPress后台的"插件"页面确认"交个神仙朋友 PWA"已激活。

#### 检查3: 短代码语法
确保短代码语法正确：
```
✅ 正确: [shenxian_pwa_app deity="guanyin"]
❌ 错误: [shenxian_pwa_app deity=guanyin]
❌ 错误: [shenxian-pwa-app deity="guanyin"]
```

#### 检查4: 主题兼容性
某些主题可能不支持短代码。尝试切换到默认主题测试。

#### 检查5: 插件冲突
暂时停用其他插件，测试是否有冲突。

### 步骤5: 高级配置

#### 自定义资源路径
如果需要使用CDN或自定义资源路径，在 `wp-config.php` 中添加：
```php
define('DIVINE_FRIEND_PWA_CUSTOM_ASSETS_URL', 'https://your-cdn.com/divine-friend-pwa/');
```

#### 启用调试模式
在 `wp-config.php` 中添加：
```php
define('DIVINE_FRIEND_PWA_DEBUG', true);
```

## 常见使用场景

### 场景1: 在文章中嵌入
在文章编辑器中直接使用短代码：
```
欢迎与观音菩萨对话：
[shenxian_pwa_app deity="guanyin" height="700px"]
```

### 场景2: 在页面中嵌入
创建专门的神仙对话页面：
```
[shenxian_pwa_app deity="wenshu" height="800px" show_header="false"]
```

### 场景3: 在小工具中使用
如果您的主题支持，可以在侧边栏小工具中使用：
```
[shenxian_pwa_app deity="amitabha" height="400px" width="100%"]
```

### 场景4: 多个神仙选择页面
创建一个包含多个选项的页面：
```
选择您想对话的神仙：

观音菩萨 - 慈悲智慧
[shenxian_pwa_app deity="guanyin" height="500px"]

文殊菩萨 - 智慧修行  
[shenxian_pwa_app deity="wenshu" height="500px"]
```

## 技术支持

如果您在安装过程中遇到问题：

1. **检查系统要求**:
   - WordPress 5.0+
   - PHP 7.4+
   - 现代浏览器

2. **联系支持**:
   - 邮箱：support@divine-friend.app
   - 网站：https://divine-friend.app
   - 文档：https://docs.divine-friend.app

3. **错误报告**:
   请提供以下信息：
   - WordPress版本
   - PHP版本
   - 活跃插件列表
   - 使用的主题
   - 错误截图或日志

## 更新说明

当插件有更新时：

1. 备份当前插件文件夹
2. 下载新版本
3. 替换旧文件夹
4. 重新激活插件（如需要）

**注意**: 更新前请备份您的网站数据。