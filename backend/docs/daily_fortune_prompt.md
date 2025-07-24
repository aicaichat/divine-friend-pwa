# 今日运势计算提示词系统

## 概述

基于用户的八字、出生信息和大运数据，结合当前日期，计算用户的今日运势。系统采用传统命理学的五行相生相克理论，结合现代数据分析方法，为用户提供专业的运势分析。

## 核心算法

### 1. 八字基础分析

```python
# 用户八字信息
user_bazi = {
    'year_pillar': {'stem': '甲', 'branch': '子', 'element': 'wood'},
    'month_pillar': {'stem': '乙', 'branch': '丑', 'element': 'wood'},
    'day_pillar': {'stem': '丙', 'branch': '寅', 'element': 'fire'},
    'hour_pillar': {'stem': '丁', 'branch': '卯', 'element': 'fire'},
    'day_master': '丙',  # 日主
    'elements': {'wood': 2, 'fire': 4, 'earth': 1, 'metal': 0, 'water': 1}
}
```

### 2. 今日干支分析

```python
# 今日干支信息
today_info = {
    'stem': '戊',  # 今日天干
    'branch': '辰',  # 今日地支
    'element': 'earth'  # 今日五行
}
```

### 3. 五行相性计算

#### 相生关系
- 木生火：木运助火运
- 火生土：火运助土运
- 土生金：土运助金运
- 金生水：金运助水运
- 水生木：水运助木运

#### 相克关系
- 木克土：木运克土运
- 土克水：土运克水运
- 水克火：水运克火运
- 火克金：火运克金运
- 金克木：金运克木运

### 4. 运势评分算法

```python
def calculate_compatibility_score(today_stem, today_branch, user_day_master, user_elements):
    base_score = 50
    
    # 今日干支五行
    today_stem_element = get_stem_element(today_stem)
    today_branch_element = get_branch_element(today_branch)
    
    # 用户日主五行
    user_day_element = get_stem_element(user_day_master)
    
    # 五行相生相克关系
    if is_generating(today_stem_element, user_day_element):
        score += 20  # 相生
    elif is_controlling(today_stem_element, user_day_element):
        score -= 15  # 相克
    elif today_stem_element == user_day_element:
        score += 10  # 相同
    
    # 考虑用户八字中五行平衡
    user_strongest_element = max(user_elements.items(), key=lambda x: x[1])[0]
    if today_stem_element == user_strongest_element:
        score += 10
    elif is_generating(today_stem_element, user_strongest_element):
        score += 15
    
    return max(0, min(100, score))
```

## 运势维度分析

### 1. 事业运势 (Career Fortune)

**计算因素：**
- 今日五行与用户日主的相性
- 用户八字中的事业相关元素
- 大运对事业的影响

**运势等级：**
- 90-100分：极好 - 适合重要决策、签约合作
- 80-89分：很好 - 适合开展新项目、主持会议
- 70-79分：好 - 适合日常事务、团队合作
- 50-69分：一般 - 适合稳定工作、按计划行事
- 1-49分：差 - 建议低调行事、避免重要决策

### 2. 财运 (Wealth Fortune)

**计算因素：**
- 今日五行与财运的关联
- 用户八字中的财富元素
- 大运对财运的影响

**运势建议：**
- 木日：适合投资理财，财运渐入佳境
- 火日：财运旺盛，可能有意外收获
- 土日：财运稳定，适合储蓄
- 金日：财运稳健，适合长期投资
- 水日：财运流动，适合灵活理财

### 3. 健康运势 (Health Fortune)

**计算因素：**
- 今日五行与健康的关联
- 用户八字中的健康元素
- 大运对健康的影响

**健康建议：**
- 木日：适合户外运动，增强体质
- 火日：注意心脏健康，避免过度劳累
- 土日：脾胃功能良好，注意饮食规律
- 金日：呼吸系统健康，适合深呼吸
- 水日：肾脏功能活跃，多喝水

### 4. 人际关系运势 (Relationship Fortune)

**计算因素：**
- 今日五行与人际关系的关联
- 用户八字中的社交元素
- 大运对人际关系的影响

**社交建议：**
- 木日：人际关系和谐，适合社交活动
- 火日：热情开朗，容易获得他人好感
- 土日：稳重可靠，朋友信任度高
- 金日：原则性强，人际关系清晰
- 水日：思维灵活，善于沟通

### 5. 学习运势 (Study Fortune)

**计算因素：**
- 今日五行与学习的关联
- 用户八字中的学习元素
- 大运对学习的影响

**学习建议：**
- 木日：学习能力强，适合学习新知识
- 火日：思维活跃，创造力强
- 土日：学习稳定，适合复习巩固
- 金日：逻辑思维强，适合学习理科
- 水日：记忆力好，适合学习文科

## 吉利信息生成

### 1. 吉利方位

```python
directions_mapping = {
    'wood': ['东', '东南'],
    'fire': ['南', '东南'],
    'earth': ['中央', '西南', '东北'],
    'metal': ['西', '西北'],
    'water': ['北', '东北']
}
```

### 2. 吉利颜色

```python
colors_mapping = {
    'wood': ['绿色', '青色', '蓝色'],
    'fire': ['红色', '橙色', '紫色'],
    'earth': ['黄色', '棕色', '橙色'],
    'metal': ['白色', '银色', '金色'],
    'water': ['黑色', '蓝色', '灰色']
}
```

### 3. 吉利数字

```python
numbers_mapping = {
    'wood': [1, 2, 3],
    'fire': [2, 3, 7],
    'earth': [5, 6, 8],
    'metal': [4, 9, 0],
    'water': [1, 6, 9]
}
```

## 时辰建议

### 木日时辰建议
- 子时(23:00-01:00)：适合冥想思考
- 寅时(03:00-05:00)：适合早起运动
- 午时(11:00-13:00)：适合重要决策
- 申时(15:00-17:00)：适合学习工作

### 火日时辰建议
- 巳时(09:00-11:00)：适合创意工作
- 午时(11:00-13:00)：适合社交活动
- 未时(13:00-15:00)：适合团队合作
- 戌时(19:00-21:00)：适合娱乐放松

### 土日时辰建议
- 辰时(07:00-09:00)：适合稳定工作
- 午时(11:00-13:00)：适合日常事务
- 未时(13:00-15:00)：适合整理内务
- 戌时(19:00-21:00)：适合家庭活动

### 金日时辰建议
- 申时(15:00-17:00)：适合精细工作
- 酉时(17:00-19:00)：适合总结反思
- 戌时(19:00-21:00)：适合学习进修
- 亥时(21:00-23:00)：适合规划未来

### 水日时辰建议
- 子时(23:00-01:00)：适合深度思考
- 寅时(03:00-05:00)：适合学习新知识
- 申时(15:00-17:00)：适合创意工作
- 亥时(21:00-23:00)：适合阅读写作

## 活动建议生成

### 高分运势 (80-100分)
**推荐活动：**
- 适合重要决策
- 适合签约合作
- 适合投资理财
- 适合社交活动

### 中分运势 (60-79分)
**推荐活动：**
- 适合日常事务
- 适合学习进修
- 适合运动健身

### 低分运势 (1-59分)
**推荐活动：**
- 适合休息放松
- 适合整理内务
- 适合阅读思考

**避免活动：**
- 避免重要决策
- 避免高风险活动
- 避免冲突争执

## API接口

### 请求格式
```json
{
  "birthdate": "1990-01-01T12:00",
  "name": "张三",
  "gender": "male",
  "target_date": "2024-01-15"  // 可选，默认为今天
}
```

### 响应格式
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "overall_score": 85,
    "overall_level": "很好",
    "overall_description": "今日运势很好，大部分事情都能顺利进行，适合积极行动。",
    "career_fortune": {
      "score": 88,
      "advice": ["适合开展新项目，创新思维活跃"],
      "lucky_time": "午时(11:00-13:00)",
      "description": "今日事业运势良好"
    },
    "wealth_fortune": {...},
    "health_fortune": {...},
    "relationship_fortune": {...},
    "study_fortune": {...},
    "lucky_directions": ["东", "东南"],
    "lucky_colors": ["绿色", "青色", "蓝色"],
    "lucky_numbers": [1, 2, 3],
    "avoid_directions": ["西", "西北"],
    "avoid_colors": ["白色", "银色"],
    "recommended_activities": ["适合重要决策", "适合签约合作"],
    "avoid_activities": ["避免重要决策", "避免高风险活动"],
    "timing_advice": {
      "子时(23:00-01:00)": "适合冥想思考",
      "寅时(03:00-05:00)": "适合早起运动"
    }
  }
}
```

## 使用示例

### 1. 计算今日运势
```python
from services.daily_fortune_service import daily_fortune_service, DailyFortuneRequest

# 创建请求
request = DailyFortuneRequest(
    birthdate="1990-01-01T12:00",
    name="张三",
    gender="male"
)

# 计算运势
result = daily_fortune_service.calculate_daily_fortune(request)

# 获取结果
print(f"今日运势评分: {result.overall_score}")
print(f"运势等级: {result.overall_level}")
print(f"综合描述: {result.overall_description}")
```

### 2. 获取各维度运势
```python
# 事业运势
career = result.career_fortune
print(f"事业运势评分: {career.score}")
print(f"事业建议: {career.advice}")

# 财运
wealth = result.wealth_fortune
print(f"财运评分: {wealth.score}")
print(f"财运建议: {wealth.advice}")
```

### 3. 获取吉利信息
```python
# 吉利方位
print(f"吉利方位: {result.lucky_directions}")

# 吉利颜色
print(f"吉利颜色: {result.lucky_colors}")

# 吉利数字
print(f"吉利数字: {result.lucky_numbers}")
```

## 注意事项

1. **数据准确性**：确保用户输入的出生信息准确无误
2. **时区处理**：统一使用北京时间进行计算
3. **边界情况**：处理特殊日期和时间的边界情况
4. **性能优化**：缓存常用的计算结果
5. **错误处理**：妥善处理计算过程中的异常情况

## 扩展功能

1. **历史运势**：支持查询历史日期的运势
2. **运势趋势**：分析运势变化趋势
3. **个性化建议**：根据用户特点提供个性化建议
4. **运势对比**：对比不同日期的运势差异
5. **运势提醒**：重要日期的运势提醒功能 