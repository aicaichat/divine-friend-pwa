import React, { useState, useEffect } from 'react'
import type { AppPage } from '../types'

interface HomePageProps {
  onNavigate: (page: AppPage) => void
}

interface FortuneData {
  verse: string
  elements: {
    wood: number
    fire: number
    earth: number
    metal: number
    water: number
  }
  advice: {
    bestTime: string
    luckyDirection: string
    luckyColor: string
    recommendation: string
  }
}

interface TaskItem {
  id: string
  icon: string
  title: string
  description: string
  completed: boolean
  reward: number
  completedAt?: string
}

interface BlessingItem {
  id: string
  userName: string
  avatar: string
  content: string
  timestamp: string
  likes: number
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userName] = useState('道友')
  const [daysSinceStart] = useState(127)
  const [braceletConnected] = useState(true)
  const [blessingEnergy] = useState(98)
  
  const [todayFortune] = useState<FortuneData>({
    verse: '心如止水，福自天来',
    elements: {
      wood: 85,
      fire: 92, 
      earth: 76,
      metal: 88,
      water: 79
    },
    advice: {
      bestTime: '上午9-11点 (巳时)',
      luckyDirection: '东南方',
      luckyColor: '翠绿色',
      recommendation: '适合签约、投资，忌争执'
    }
  })

  const [dailyTasks, setDailyTasks] = useState<TaskItem[]>([
    {
      id: 'morning-chant',
      icon: '🙏',
      title: '晨起诵读心经',
      description: '已完成 - 07:15',
      completed: true,
      reward: 5,
      completedAt: '07:15'
    },
    {
      id: 'meditation',
      icon: '📿',
      title: '佩戴手串冥想10分钟',
      description: '建议在15:00-17:00进行',
      completed: false,
      reward: 10
    },
    {
      id: 'blessing',
      icon: '💝',
      title: '向朋友发送祝福',
      description: '分享正能量，收获好运气',
      completed: false,
      reward: 8
    }
  ])

  const [recentBlessings] = useState<BlessingItem[]>([
    {
      id: '1',
      userName: '心如莲花',
      avatar: '🌸',
      content: '愿所有朋友都平安喜乐',
      timestamp: '3分钟前',
      likes: 12
    },
    {
      id: '2', 
      userName: '禅心若水',
      avatar: '💧',
      content: '今日按神仙指引投资，收获颇丰，感恩',
      timestamp: '8分钟前',
      likes: 8
    }
  ])

  const [progressStats] = useState({
    companionDays: 127,
    guidanceReceived: 89,
    conversations: 156,
    adoptionRate: 92
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getTimeGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 6) return '夜深了，菩萨与您同在'
    if (hour < 12) return `早安，${userName} 🌅`
    if (hour < 18) return `午安，${userName} ☀️`
    return `晚安，${userName} 🌙`
  }

  const formatTime = () => {
    return currentTime.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getLunarDate = () => {
    // 简化的农历日期显示
    return '农历三月初八'
  }

  const getTodayDate = () => {
    return currentTime.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const getCompletedTasksCount = () => {
    return dailyTasks.filter(task => task.completed).length
  }

  const getCompletionPercentage = () => {
    return Math.round((getCompletedTasksCount() / dailyTasks.length) * 100)
  }

  const handleTaskStart = (taskId: string) => {
    // 根据任务类型导航到相应页面
    switch (taskId) {
      case 'meditation':
        onNavigate('bracelet')
        break
      case 'blessing':
        onNavigate('community')
        break
      default:
        console.log(`Starting task: ${taskId}`)
    }
  }

  const getPersonalizedContent = () => {
    if (daysSinceStart < 7) {
      return {
        greeting: '新手上路，菩萨护佑',
        advice: '建议每日佩戴2-4小时，循序渐进'
      }
    } else if (daysSinceStart < 30) {
      return {
        greeting: '修行有成，善根渐深', 
        advice: '可以尝试更深层的冥想练习'
      }
    } else {
    return { 
        greeting: '虔诚修行者，功德无量',
        advice: '您已养成良好习惯，可指导他人'
      }
    }
  }

  const personalizedContent = getPersonalizedContent()

  return (
    <div className="zen-container zen-nebula" style={{ paddingBottom: '120px' }}>
      {/* 第一屏 - 温暖问候 */}
      <div className="zen-card zen-card-divine zen-hologram">
        <div className="flow-loose">
          {/* 时间感知问候 */}
          <div className="greeting-container warm-aura companion-float mobile-mb-md">
            <div className="text-subtle-caption mb-2">{formatTime()}</div>
            <h1 className="zen-title">
              {getTimeGreeting()}
            </h1>
            <p className="text-radiant-body mt-4 mobile-text-center">
              观音菩萨说：今日是您与手串相伴的第 <span className="text-brand-highlight">{daysSinceStart}</span> 天
            </p>
            <p className="text-subtle-caption mt-2 mobile-text-center">{personalizedContent.greeting}</p>
        </div>
        
          {/* 手串状态卡片 */}
          <div className="zen-card zen-card-aurora zen-crystal zen-particles">
            <div className="flex-between mobile-text-center">
              <div className="flex-divine gap-3 mobile-full-width">
                <div className={`icon-brand ${braceletConnected ? 'text-hope' : 'text-passion'}`}>
                  📿
                </div>
                <div className="text-left mobile-text-center mobile-full-width">
                  <div className="text-ethereal-title">
                    {braceletConnected ? '沉香手串已连接' : '手串未连接'}
                  </div>
                  <div className="text-subtle-caption">
                    ✨ 开光能量：充满 ({blessingEnergy}%)
                  </div>
                </div>
              </div>
                        <button 
            onClick={() => onNavigate('bracelet')}
            className="divine-button zen-button-3d zen-ripple"
          >
            验证真伪
          </button>
          </div>
          
            {/* 能量进度条 */}
            <div className="mobile-mt-md">
              <div className="flex-between text-sm">
                <span>开光能量</span>
                <span>{blessingEnergy}%</span>
              </div>
              <div className="immersive-progress mobile-mt-sm">
                <div 
                  className="immersive-progress-fill"
                  style={{ width: `${blessingEnergy}%` }}
                />
              </div>
          </div>
          </div>
        </div>
      </div>

      {/* 第二屏 - 今日核心服务 */}
      <div className="section-content">
        <div className="fortune-card-premium zen-quantum-ripple">
          <div className="text-center mb-8">
            <h2 className="zen-subtitle">
              🌟 今日专属指引
            </h2>
            
            {/* 日期信息 */}
            <div className="flex-between text-subtle-caption mb-6 mobile-text-center">
              <span className="mobile-full-width">{getTodayDate()}</span>
              <span className="mobile-full-width mobile-hidden">{getLunarDate()}</span>
            </div>
            <div className="mobile-only mobile-text-center mobile-mb-sm">
              <span>{getLunarDate()}</span>
            </div>
          </div>

          {/* 运势诗句 */}
          <div className="fortune-verse text-glow-divine text-center mb-8">
            "{todayFortune.verse}"
          </div>

          {/* 五行能量分布 */}
          <div className="mb-8">
            <h3 className="text-ethereal-title text-center mb-6">
              五行能量分布
            </h3>
            
            <div className="five-elements-container">
              {Object.entries(todayFortune.elements).map(([element, value]: [string, number]) => (
                <div key={element} className="text-center">
                  <div className="text-lg mb-2 font-bold">
                    {element === 'wood' ? '🌿木' : 
                     element === 'fire' ? '🔥火' :
                     element === 'earth' ? '🌍土' :
                     element === 'metal' ? '⚱️金' : '💧水'}
                  </div>
                  <div className={`element-bar element-${element}`}>
                    <div 
                      className="element-fill"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <div className="text-subtle-caption mt-2 font-semibold">
                    {value}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 今日行动建议 */}
          <div className="card-cosmic">
            <h3 className="text-ethereal-title text-wisdom mb-4">
              📿 今日行动建议
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-brand-highlight text-sm">最佳时辰</div>
                <div className="text-radiant-body">{todayFortune.advice.bestTime}</div>
              </div>
              <div>
                <div className="text-brand-highlight text-sm">幸运方位</div>
                <div className="text-radiant-body">{todayFortune.advice.luckyDirection}</div>
              </div>
              <div>
                <div className="text-brand-highlight text-sm">幸运色彩</div>
                <div className="text-radiant-body">{todayFortune.advice.luckyColor}</div>
              </div>
              <div>
                <div className="text-brand-highlight text-sm">建议行动</div>
                <div className="text-radiant-body">{todayFortune.advice.recommendation}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 第三屏 - 神仙朋友对话 */}
      <div className="section-content">
        <div className="card-divine animate-divine-entrance mobile-mb-md" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-cosmic-hero text-flowing text-center mb-6">
            🧘‍♂️ 与观音菩萨对话
          </h2>
          
          {/* 神仙朋友状态 */}
          <div className="flex-divine gap-4 mb-6 mobile-text-center">
            <div className="deity-avatar-container">
              <div className="icon-brand-large divine-aura">
                🧘‍♀️
              </div>
              <div className="deity-online-indicator"></div>
            </div>
            <div className="text-left mobile-text-center mobile-full-width">
              <div className="text-ethereal-title">观音菩萨</div>
              <div className="text-subtle-caption flex items-center gap-2 mobile-text-center">
                <span className="w-2 h-2 bg-hope rounded-full animate-ethereal-pulse mobile-hidden"></span>
                在线 · 随时为您答疑解惑
              </div>
            </div>
          </div>

          {/* 最近对话预览 */}
          <div className="recent-message-bubble mb-6">
            <div className="text-radiant-body mb-2">
              "今日水星逆行结束，您的财运将有所提升。记住，心怀善念，福报自来。"
            </div>
            <div className="text-subtle-caption">2分钟前</div>
          </div>

          {/* 快捷提问 */}
          <div className="mb-6">
            <h4 className="text-ethereal-title mb-4">💭 快捷咨询</h4>
            <div className="quick-question-grid">
              <button 
                onClick={() => onNavigate('chat')}
                className="quick-question-btn mobile-ripple"
              >
                💰 今日财运如何？
              </button>
              <button 
                onClick={() => onNavigate('chat')}
                className="quick-question-btn mobile-ripple"
              >
                💕 感情运势咨询
              </button>
              <button 
                onClick={() => onNavigate('chat')}
                className="quick-question-btn mobile-ripple"
              >
                🏥 健康注意事项
              </button>
              <button 
                onClick={() => onNavigate('chat')}
                className="quick-question-btn mobile-ripple"
              >
                💼 工作发展建议
              </button>
            </div>
              </div>
              
          {/* 对话入口 */}
          <button 
            onClick={() => onNavigate('chat')}
            className="btn-brand-primary w-full mobile-ripple"
          >
            💬 开始深度对话
            </button>
        </div>
      </div>
      
      {/* 第四屏 - 个人修行记录 */}
      <div className="section-content">
        <div className="card-cosmic animate-divine-entrance mobile-mb-md" style={{ animationDelay: '0.9s' }}>
          <h2 className="text-cosmic-hero text-flowing text-center mb-6">
            📈 我的修行历程
          </h2>

          {/* 修行统计 */}
          <div className="progress-stats-grid mb-8">
            <div className="stat-card mobile-ripple">
              <div className="stat-number text-hope animate-divine-glow">{progressStats.companionDays}</div>
              <div className="text-subtle-caption">相伴天数</div>
            </div>
            <div className="stat-card mobile-ripple">
              <div className="stat-number text-abundance animate-divine-glow">{progressStats.guidanceReceived}</div>
              <div className="text-subtle-caption">获得指引</div>
            </div>
            <div className="stat-card mobile-ripple">
              <div className="stat-number text-serenity animate-divine-glow">{progressStats.conversations}</div>
              <div className="text-subtle-caption">对话次数</div>
            </div>
            <div className="stat-card mobile-ripple">
              <div className="stat-number text-wisdom animate-divine-glow">{progressStats.adoptionRate}%</div>
              <div className="text-subtle-caption">建议采纳率</div>
            </div>
          </div>
          
          {/* 最近成就 */}
          <div className="achievement-badge mobile-text-center">
            <div className="icon-brand">💎</div>
            <div className="flex-column mobile-text-center">
              <div className="text-radiant-body font-bold">连续使用30天</div>
              <div className="text-subtle-caption">获得"虔诚修行者"称号</div>
              <div className="text-subtle-caption">3天前</div>
            </div>
          </div>
        </div>
      </div>

      {/* 第五屏 - 今日修行任务 */}
      <div className="section-content">
        <div className="card-brand-feature animate-divine-entrance mobile-mb-md" style={{ animationDelay: '1.2s' }}>
          <h2 className="text-cosmic-hero text-flowing text-center mb-6">
            ✅ 今日修行清单
          </h2>

          {/* 任务列表 */}
          <div className="daily-task-list mb-6">
            {dailyTasks.map((task) => (
              <div key={task.id} className={`task-item mobile-ripple ${task.completed ? 'completed opacity-75' : ''}`}>
                <div className="flex-between">
                  <div className="flex-divine gap-4">
                    <div className="task-icon">{task.icon}</div>
                    <div className="flex-column">
                      <div className="text-ethereal-title">{task.title}</div>
                      <div className="text-subtle-caption">
                        {task.completed ? task.description : task.description}
                      </div>
                    </div>
              </div>
                  <div className="flex-divine gap-3 mobile-full-width">
                    {task.completed ? (
                      <div className="task-reward-badge">+{task.reward} 功德</div>
                    ) : (
                      <button 
                        onClick={() => handleTaskStart(task.id)}
                        className="btn-brand-secondary mobile-full-width"
                      >
                        开始
                      </button>
                    )}
              </div>
            </div>
              </div>
            ))}
              </div>

          {/* 完成度显示 */}
          <div className="completion-progress">
            <div className="flex-between mb-2">
              <span className="text-radiant-body">今日完成度</span>
              <span className="text-brand-highlight font-bold">
                {getCompletionPercentage()}% ({getCompletedTasksCount()}/{dailyTasks.length})
              </span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ width: `${getCompletionPercentage()}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* 第六屏 - 社区互动 */}
      <div className="section-content">
        <div className="card-divine animate-divine-entrance mobile-mb-md" style={{ animationDelay: '1.5s' }}>
          <h2 className="text-cosmic-hero text-flowing text-center mb-6">
            👥 神仙朋友圈
          </h2>

          {/* 今日祝福流 */}
          <div className="mb-6">
            <h3 className="text-ethereal-title mb-4">💫 今日祝福</h3>
            <div className="blessing-stream mobile-scroll-indicator">
              {recentBlessings.map((blessing) => (
                <div key={blessing.id} className="blessing-item mobile-ripple">
                  <div className="flex-divine gap-3 mb-3">
                    <div className="user-avatar-emoji">{blessing.avatar}</div>
                    <div className="flex-column mobile-full-width">
                      <div className="text-radiant-body font-bold">{blessing.userName}</div>
                      <div className="text-subtle-caption">{blessing.timestamp}</div>
                    </div>
                  </div>
                  <div className="blessing-text mb-3">{blessing.content}</div>
                  <div className="blessing-actions">
                    <button className="blessing-action-btn mobile-ripple">
                      🙏 阿弥陀佛 ({blessing.likes})
                    </button>
                    <button className="blessing-action-btn mobile-ripple">
                      💬 回复
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 快捷分享 */}
          <div className="share-input-container">
            <h3 className="text-ethereal-title mb-4">📤 分享今日感悟</h3>
            <textarea 
              placeholder="分享您今天的收获或感悟..."
              className="share-textarea mobile-full-width"
              rows={3}
            />
            <div className="flex-divine gap-3 mt-4">
              <button 
                onClick={() => onNavigate('community')}
                className="btn-brand-primary flex-1 mobile-ripple"
              >
                分享到朋友圈
              </button>
              <button className="btn-brand-secondary mobile-ripple">
                私人记录
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 古典诗句装饰 */}
      <div className="text-center mt-12 animate-divine-entrance mobile-text-center mobile-p-md" style={{ animationDelay: '1.8s' }}>
        <div className="text-radiant-body font-serif italic opacity-70">
          "日日是好日，步步起清风"
        </div>
      </div>
    </div>
  )
}

export default HomePage 
 
 
 
 