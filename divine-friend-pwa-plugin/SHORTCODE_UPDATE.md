# 短代码名称更新说明

## 🔄 重要变更

为了避免与现有项目产生冲突，我们已将短代码名称从 `divine_friend_pwa` 更改为 `shenxian_pwa_app`。

## 📝 新的短代码语法

### 基础使用
```
[shenxian_pwa_app]
```

### 带参数使用
```
[shenxian_pwa_app deity="guanyin" height="600px"]
```

### 完整定制
```
[shenxian_pwa_app 
    deity="wenshu" 
    theme="zen" 
    height="700px" 
    width="100%" 
    show_header="true"
]
```

## 🎯 避免冲突的原因

原短代码名称 `divine_friend_pwa` 可能与以下项目产生冲突：
- `bless-friend-theme` 
- `bracelet-info-api`
- 其他相关插件或主题

新名称 `shenxian_pwa_app` 具有以下优势：
- ✅ 唯一性更强，避免命名冲突
- ✅ 中文拼音标识，更符合产品特色
- ✅ 包含 `pwa` 和 `app` 标识，语义更清晰
- ✅ 遵循WordPress短代码命名规范

## 🔧 CSS类名更新

相应的CSS类名也已更新：
- `.divine-friend-pwa-container` → `.shenxian-pwa-app-container`
- `.divine-friend-pwa-loading` → `.shenxian-pwa-app-loading`
- `.divine-friend-app-container` → `.shenxian-pwa-app-content`
- `.divine-friend-theme-*` → `.shenxian-pwa-theme-*`

## 📋 兼容性说明

- **向后兼容**: 如果您之前使用了旧的短代码名称，需要手动更新
- **ID生成**: 容器ID从 `divine-friend-pwa-*` 更改为 `shenxian-pwa-app-*`
- **JavaScript**: 所有相关的JavaScript选择器已同步更新

## 🚀 快速迁移指南

如果您之前使用过旧版本，请按以下步骤迁移：

### 1. 替换短代码
在您的WordPress内容中查找并替换：
```
查找: [divine_friend_pwa
替换: [shenxian_pwa_app
```

### 2. 更新自定义CSS（如有）
如果您有自定义CSS样式，请更新类名：
```css
/* 旧的 */
.divine-friend-pwa-container { }

/* 新的 */
.shenxian-pwa-app-container { }
```

### 3. 更新JavaScript（如有）
如果您有自定义JavaScript，请更新选择器：
```javascript
// 旧的
document.querySelector('.divine-friend-pwa-container')

// 新的  
document.querySelector('.shenxian-pwa-app-container')
```

## 📞 技术支持

如果您在迁移过程中遇到任何问题，请联系：
- 邮箱：support@divine-friend.app
- 文档：https://docs.divine-friend.app
- 社区：https://community.divine-friend.app

---

*此更新确保了与其他项目的完美兼容，为您带来更稳定的使用体验* ✨