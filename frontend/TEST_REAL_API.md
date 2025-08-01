# 🧪 真实API集成测试指南

## 🎯 测试目标
验证前端页面是否成功连接到后端AI API，并正确显示真实的八字穿衣推荐数据。

## 🚀 测试步骤

### 1. 启动后端服务
```bash
cd divine-friend-pwa/backend
python app.py
```
**预期输出**: 
```
* Running on http://0.0.0.0:5001 (Press CTRL+C to quit)
```

### 2. 验证API健康状态
```bash
curl http://localhost:5001/api/health
```
**预期响应**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T...",
  "service": "divine-friend-pwa-backend"
}
```

### 3. 测试AI推荐API
```bash
cd divine-friend-pwa/backend
python test_outfit_api.py
```

### 4. 准备前端用户数据

在浏览器控制台中设置测试用户信息：
```javascript
// 设置用户八字信息
localStorage.setItem('user_profile', JSON.stringify({
  birthdate: "1990-05-15T08:30:00",
  name: "测试用户",
  gender: "male",
  birth_place: "北京市朝阳区"
}));

// 或者使用birth_info格式
localStorage.setItem('birth_info', JSON.stringify({
  date_time: "1990-05-15T08:30:00",
  name: "测试用户",
  gender: "male",
  place: "北京市朝阳区"
}));
```

### 5. 访问前端页面
```
http://localhost:3008/?page=today
```

## 🔍 预期效果

### ✅ 成功加载的标志

#### **1. 加载界面**
- 显示 "🤖 AI智能分析中..."
- 显示 "正在计算您的八字运势和穿衣推荐"

#### **2. 页面头部**
- 显示 "🤖 AI智能推荐已生成" 绿色标签
- 没有错误提示

#### **3. 运势数据**
- 运势分数来自真实API (而非固定的88、85、78、80)
- 运势等级动态计算
- 推荐理由显示AI分析结果

#### **4. 穿衣推荐**
- 主推方案标题为AI推荐的主题 (如 "财运加持套装")
- 运势加持效果为真实计算的数值
- "其他风格选择" 标题变为 "AI智能推荐方案"
- 底部显示 "🤖 以上方案由AI基于您的八字运势智能生成"

#### **5. 控制台日志**
```
🤖 开始获取真实AI推荐数据...
👤 用户信息: {birthdate: "1990-05-15T08:30:00", ...}
✅ AI推荐获取成功: {ai_analysis: {...}, recommendations: [...]}
🎯 真实数据加载完成
```

### ⚠️ 降级处理的标志

#### **如果后端未启动或API失败**
- 显示 "⚠️ 获取AI推荐失败，使用模拟数据" 橙色标签
- 运势数据使用预设的模拟值
- 穿衣推荐使用默认方案
- 控制台显示错误信息

#### **如果用户信息缺失**
- 控制台显示 "🔄 未找到用户信息，使用模拟数据"
- 页面正常显示，但使用模拟数据

## 🔧 调试技巧

### 1. 检查用户信息
```javascript
// 在浏览器控制台中执行
console.log('user_profile:', localStorage.getItem('user_profile'));
console.log('birth_info:', localStorage.getItem('birth_info'));
```

### 2. 检查API连接
```javascript
// 测试API健康状态
fetch('http://localhost:5001/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### 3. 手动触发数据重新加载
```javascript
// 在页面上重新加载数据
window.location.reload();
```

### 4. 查看网络请求
- 打开开发者工具 → Network 选项卡
- 查找 `/api/ai/outfit-recommendations` 请求
- 检查请求和响应数据

## 🐛 常见问题

### 问题1: 一直显示加载界面
**原因**: 后端服务未启动或API请求失败
**解决**: 
1. 确认后端服务在 `http://localhost:5001` 运行
2. 检查控制台错误信息
3. 验证用户信息格式正确

### 问题2: 显示模拟数据而非真实数据
**原因**: 用户信息缺失或格式错误
**解决**:
1. 按上述步骤设置用户信息
2. 确认birthdate格式为ISO字符串
3. 刷新页面重新加载

### 问题3: API请求被CORS阻止
**原因**: 跨域访问限制
**解决**:
1. 确认后端已启用CORS
2. 检查 `app.py` 中的 `CORS(app)` 配置

### 问题4: 运势加持效果显示异常
**原因**: API数据结构不匹配
**解决**:
1. 检查后端API响应格式
2. 对比前端期望的数据结构
3. 调整数据转换逻辑

## ✨ 成功标准

- [ ] 后端API正常启动 (5001端口)
- [ ] 前端页面正常加载
- [ ] 用户信息正确设置
- [ ] API请求成功发送和接收
- [ ] 运势数据来自真实计算
- [ ] 穿衣推荐显示AI生成的方案
- [ ] 降级机制正常工作
- [ ] 控制台无错误信息

**🎉 当所有标准都满足时，说明真实API集成成功！** 