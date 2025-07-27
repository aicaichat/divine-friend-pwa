# 经文共修功能提升完整提示词

## 🎯 核心目标
为"成长"页面的经文修炼功能设计一套完整的共修体验，让用户能够：
1. 跟随视频诵读佛经
2. 通过文字阅读修炼经文
3. 获得沉浸式的修行体验
4. 建立持续的学习习惯

## 📋 功能需求分析

### 当前状态
- ✅ 已有6部经典佛经（心经、金刚经、法华经、药师经、阿弥陀经、地藏经）
- ✅ 基础的学习统计和进度跟踪
- ✅ 视频播放功能
- ❌ 缺少文字诵读模式
- ❌ 缺少经文内容展示
- ❌ 缺少跟读功能

### 需要实现的功能

#### 1. 经文内容展示系统
```typescript
interface ScriptureContent {
  id: string;
  title: string;
  subtitle: string;
  fullText: string[];
  paragraphs: string[];
  audioUrl?: string;
  readingGuide: {
    pace: 'slow' | 'normal' | 'fast';
    pauseBetweenParagraphs: number; // seconds
    highlightCurrentLine: boolean;
  };
}
```

#### 2. 诵读模式组件
- **跟读模式**：显示经文文字，支持TTS语音播放
- **默读模式**：纯文字阅读，无语音
- **诵读模式**：用户录音跟读，AI评分
- **冥想模式**：背景音乐+文字展示

#### 3. 学习进度深度跟踪
```typescript
interface DetailedProgress {
  sutraId: string;
  readingProgress: {
    currentParagraph: number;
    totalParagraphs: number;
    timeSpent: number;
    readingSpeed: number; // words per minute
  };
  practiceHistory: {
    date: string;
    duration: number;
    mode: 'video' | 'reading' | 'recitation' | 'meditation';
    completionRate: number;
  }[];
  achievements: {
    firstReading: boolean;
    weeklyStreak: number;
    monthlyGoal: boolean;
    perfectReading: boolean;
  };
}
```

## 🛠️ 技术实现方案

### 1. 创建经文数据文件
为每部经典创建完整的JSON数据文件：

```json
{
  "id": "heart-sutra",
  "title": "般若波罗蜜多心经",
  "subtitle": "心经",
  "description": "观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。",
  "difficulty": "beginner",
  "duration": 15,
  "benefits": ["开启智慧", "消除烦恼", "增长定力"],
  "content": {
    "fullText": [
      "观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。",
      "舍利子，色不异空，空不异色，色即是空，空即是色，受想行识，亦复如是。",
      "舍利子，是诸法空相，不生不灭，不垢不净，不增不减。",
      "是故空中无色，无受想行识，无眼耳鼻舌身意，无色声香味触法，",
      "无眼界，乃至无意识界，无无明，亦无无明尽，乃至无老死，亦无老死尽，",
      "无苦集灭道，无智亦无得。以无所得故，",
      "菩提萨埵，依般若波罗蜜多故，心无挂碍。无挂碍故，无有恐怖，远离颠倒梦想，究竟涅槃。",
      "三世诸佛，依般若波罗蜜多故，得阿耨多罗三藐三菩提。",
      "故知般若波罗蜜多，是大神咒，是大明咒，是无上咒，是无等等咒，",
      "能除一切苦，真实不虚。故说般若波罗蜜多咒，即说咒曰：",
      "揭谛揭谛，波罗揭谛，波罗僧揭谛，菩提萨婆诃。"
    ],
    "readingGuide": {
      "pace": "normal",
      "pauseBetweenParagraphs": 3,
      "highlightCurrentLine": true,
      "autoScroll": true
    }
  },
  "videoUrl": "https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/669_raw.mp4",
  "icon": "🌸",
  "color": "#FF6B9D",
  "gradient": "linear-gradient(135deg, #FF6B9D, #C44569)"
}
```

### 2. 创建诵读组件
```typescript
// components/ScriptureReader.tsx
interface ScriptureReaderProps {
  scripture: ScriptureContent;
  mode: 'reading' | 'recitation' | 'meditation';
  onProgress: (progress: number) => void;
  onComplete: () => void;
}

const ScriptureReader: React.FC<ScriptureReaderProps> = ({
  scripture,
  mode,
  onProgress,
  onComplete
}) => {
  // 实现诵读逻辑
  // - 文字高亮显示
  // - TTS语音播放
  // - 进度跟踪
  // - 用户录音（如果需要）
};
```

### 3. 增强学习统计
```typescript
// hooks/useScriptureProgress.ts
const useScriptureProgress = (sutraId: string) => {
  const [progress, setProgress] = useState<DetailedProgress>();
  
  const updateReadingProgress = (currentParagraph: number, timeSpent: number) => {
    // 更新阅读进度
  };
  
  const recordPracticeSession = (mode: string, duration: number, completionRate: number) => {
    // 记录练习会话
  };
  
  const checkAchievements = () => {
    // 检查成就解锁
  };
  
  return {
    progress,
    updateReadingProgress,
    recordPracticeSession,
    checkAchievements
  };
};
```

## 🎨 用户体验设计

### 1. 学习模式选择
```
┌─────────────────────────────────────┐
│  📚 般若波罗蜜多心经                │
├─────────────────────────────────────┤
│  🎥 视频跟读                        │
│  📖 文字诵读                        │
│  🎤 录音跟读                        │
│  🧘 冥想模式                        │
└─────────────────────────────────────┘
```

### 2. 诵读界面设计
```
┌─────────────────────────────────────┐
│  [播放控制] [进度条] [设置]         │
├─────────────────────────────────────┤
│                                     │
│  观自在菩萨，行深般若波罗蜜多时，   │ ← 当前高亮
│  照见五蕴皆空，度一切苦厄。         │
│                                     │
│  舍利子，色不异空，空不异色，       │
│  色即是空，空即是色，受想行识，     │
│  亦复如是。                         │
│                                     │
│  [上一句] [暂停/播放] [下一句]      │
└─────────────────────────────────────┘
```

### 3. 进度可视化
- 圆形进度条显示整体完成度
- 段落进度条显示当前章节进度
- 学习时长统计
- 连续学习天数
- 成就徽章系统

## 📊 数据分析与反馈

### 1. 学习行为分析
```typescript
interface LearningAnalytics {
  sessionData: {
    startTime: Date;
    endTime: Date;
    duration: number;
    mode: string;
    completionRate: number;
    readingSpeed: number;
    pauses: number;
  };
  userBehavior: {
    preferredMode: string;
    averageSessionLength: number;
    peakLearningTime: string;
    retentionRate: number;
  };
}
```

### 2. 个性化推荐
- 基于学习历史推荐适合的经文
- 根据难度调整推荐顺序
- 提供学习建议和技巧

## 🔧 实现步骤

### 第一阶段：基础诵读功能
1. 创建经文数据文件（JSON格式）
2. 实现基础的文字显示组件
3. 集成Web Speech API进行TTS
4. 添加进度跟踪功能

### 第二阶段：高级功能
1. 实现用户录音功能
2. 添加冥想模式（背景音乐）
3. 完善学习统计和分析
4. 添加成就系统

### 第三阶段：优化体验
1. 性能优化和缓存
2. 离线功能支持
3. 社交分享功能
4. 个性化设置

## 🎯 成功指标

### 用户参与度
- 平均学习时长 > 15分钟
- 日活跃用户率 > 60%
- 周留存率 > 40%

### 学习效果
- 完成率 > 80%
- 重复学习率 > 30%
- 用户满意度 > 4.5/5

### 技术指标
- 页面加载时间 < 2秒
- 音频播放延迟 < 500ms
- 离线功能可用性 > 95%

## 🚀 创新特色

### 1. 智能诵读助手
- AI语音识别用户诵读
- 实时发音纠正
- 个性化学习建议

### 2. 沉浸式体验
- 3D背景音效
- 动态视觉效果
- 禅意UI设计

### 3. 社交共修
- 在线共修房间
- 学习小组功能
- 功德回向系统

## 📝 开发注意事项

### 1. 性能优化
- 使用虚拟滚动处理长文本
- 音频文件预加载
- 图片懒加载

### 2. 可访问性
- 支持屏幕阅读器
- 键盘导航支持
- 高对比度模式

### 3. 国际化
- 多语言支持
- 文化适应性
- 本地化内容

### 4. 数据安全
- 用户隐私保护
- 数据加密存储
- 合规性检查

## 🎨 设计原则

### 1. 禅意美学
- 简约而不简单
- 留白艺术
- 自然色彩

### 2. 用户体验
- 直观易用
- 情感共鸣
- 沉浸感强

### 3. 功能完整
- 功能丰富
- 逻辑清晰
- 扩展性强

---

**总结**：这个提示词提供了一个完整的框架来指导经文共修功能的开发和优化，涵盖了技术实现、用户体验、数据分析等各个方面，确保最终产品能够为用户提供优质的修行体验。 