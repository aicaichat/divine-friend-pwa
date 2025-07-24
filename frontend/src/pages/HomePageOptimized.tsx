import React, { useState, useEffect, useRef } from 'react'
import type { AppPage } from '../types'
import { apiService, type DailyFortuneAPIResponse } from '../services/apiService'

interface HomePageOptimizedProps {
  onNavigate: (page: AppPage) => void
}

interface DeityInfo {
  id: string
  name: string
  title: string
  imageUrl: string
  fallbackEmoji: string
  specialty: string
  todayMessage: string
  fortuneType: 'excellent' | 'good' | 'normal' | 'challenging'
  fortuneScore: number
  guidance: string[]
}

const HomePageOptimized: React.FC<HomePageOptimizedProps> = ({ onNavigate }) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userName] = useState('道友')
  const [braceletConnected] = useState(true)
  const [blessingEnergy] = useState(98)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [currentDeityIndex, setCurrentDeityIndex] = useState(0)
  const [showFortuneDetails, setShowFortuneDetails] = useState(false)
  const [todayFortune, setTodayFortune] = useState<DailyFortuneAPIResponse['data'] | null>(null)
  const [isLoadingFortune, setIsLoadingFortune] = useState(false)
  const [fortuneError, setFortuneError] = useState<string | null>(null)
  
  // 移动端触摸优化
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 })
  const conversationCardRef = useRef<HTMLDivElement>(null)

  // 神仙信息数据库
  const deities: DeityInfo[] = [
    {
      id: 'guanyin',
      name: '观音菩萨',
      title: '大慈大悲救苦救难',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E5%8D%83%E6%89%8B%E8%A7%82%E9%9F%B3.jpg',
      fallbackEmoji: '🧘‍♀️',
      specialty: '慈悲智慧 • 情感疗愈',
      todayMessage: '今日水逆散去，您的慈悲心将为您带来意外的贵人相助',
      fortuneType: 'excellent',
      fortuneScore: 89,
      guidance: ['保持善念，助人为乐', '适合处理人际关系', '晚间诵经效果佳']
    },
    {
      id: 'budongzun',
      name: '不动尊菩萨',
      title: '降魔护法明王',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E4%B8%8D%E5%8A%A8%E5%B0%8A%E8%8F%A9%E8%90%A8.jpg',
      fallbackEmoji: '⚔️',
      specialty: '破除障碍 • 坚定意志',
      todayMessage: '今日宜坚定决心，排除万难，您的毅力将战胜一切挑战',
      fortuneType: 'good',
      fortuneScore: 85,
      guidance: ['面对困难不退缩', '适合做重要决定', '练习专注冥想']
    },
    {
      id: 'dashizhi',
      name: '大势至菩萨',
      title: '智慧光明遍照',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E5%A4%A7%E5%8A%BF%E8%87%B3%E8%8F%A9%E8%90%A8.jpg',
      fallbackEmoji: '💡',
      specialty: '智慧开启 • 学业事业',
      todayMessage: '智慧之光照耀前程，今日学习工作将有重大突破',
      fortuneType: 'excellent',
      fortuneScore: 92,
      guidance: ['专注学习新知识', '适合规划未来', '多与智者交流']
    },
    {
      id: 'dairiruiai',
      name: '大日如来',
      title: '法界体性智',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E5%A4%A7%E6%97%A5%E5%A6%82%E6%9D%A5.jpg',
      fallbackEmoji: '☀️',
      specialty: '光明普照 • 消除业障',
      todayMessage: '法界光明遍照十方，今日是消除业障的绝佳时机',
      fortuneType: 'good',
      fortuneScore: 88,
      guidance: ['早起修行效果佳', '适合忏悔净化', '沐浴阳光冥想']
    },
    {
      id: 'wenshu',
      name: '文殊菩萨',
      title: '大智文殊师利',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E6%96%87%E6%AE%8A%E8%8F%A9%E8%90%A8.jpg',
      fallbackEmoji: '📚',
      specialty: '智慧第一 • 学问精进',
      todayMessage: '智慧剑斩断无明，今日思维清晰，适合深度思考',
      fortuneType: 'excellent',
      fortuneScore: 94,
      guidance: ['阅读经典著作', '思考人生哲理', '分享智慧给他人']
    },
    {
      id: 'xukong',
      name: '虚空藏菩萨',
      title: '福智如虚空',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E8%99%9A%E7%A9%BA%E8%8F%A9%E8%90%A8.jpg',
      fallbackEmoji: '🌌',
      specialty: '财富智慧 • 心愿成就',
      todayMessage: '虚空藏纳万物，今日心愿易成，财运亨通',
      fortuneType: 'good',
      fortuneScore: 86,
      guidance: ['许下美好心愿', '适合投资理财', '感恩现有福报']
    },
    {
      id: 'amitabha',
      name: '阿弥陀佛',
      title: '无量光无量寿',
      imageUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E9%98%BF%E5%BC%A5%E9%99%80%E4%BD%9B.jpg',
      fallbackEmoji: '🙏',
      specialty: '净土往生 • 慈悲接引',
      todayMessage: '无量光明照耀众生，今日宜念佛修行，心得安宁',
      fortuneType: 'excellent',
      fortuneScore: 91,
      guidance: ['念佛修心', '放下执着', '慈悲对待万物']
    }
  ]

  const currentDeity = deities[currentDeityIndex]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 加载今日运势
  const loadTodayFortune = async () => {
    if (isLoadingFortune) return
    
    setIsLoadingFortune(true)
    setFortuneError(null)
    
    try {
      // 使用默认用户信息（实际应用中应该从用户设置获取）
      const request = {
        birthdate: '1990-01-01T12:00',
        name: '道友',
        gender: 'male',
        target_date: new Date().toISOString().split('T')[0]
      }
      
      const response = await apiService.calculateDailyFortune(request)
      
      if (response.success) {
        setTodayFortune(response.data)
      } else {
        setFortuneError('运势计算失败')
      }
    } catch (error) {
      console.error('加载运势失败:', error)
      setFortuneError('网络连接失败，使用默认运势')
    } finally {
      setIsLoadingFortune(false)
    }
  }

  // 组件加载时获取运势
  useEffect(() => {
    loadTodayFortune()
  }, [])

  // 预加载当前神仙图片
  useEffect(() => {
    const img = new Image()
    img.src = currentDeity.imageUrl
    img.onload = () => setImageLoaded(true)
    img.onerror = () => setImageError(true)
  }, [currentDeity.imageUrl])

  // 每30秒自动切换神仙（可选）
  useEffect(() => {
    const deityRotation = setInterval(() => {
      setCurrentDeityIndex((prev) => (prev + 1) % deities.length)
      setImageLoaded(false) // 重置加载状态
    }, 30000) // 30秒切换一次
    
    return () => clearInterval(deityRotation)
  }, [deities.length])

  const getTimeGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 6) return '夜深了，菩萨与您同在'
    if (hour < 12) return `早安，${userName} 🌅`
    if (hour < 18) return `午安，${userName} ☀️`
    return `晚安，${userName} 🌙`
  }

  const formatTime = () => {
    return currentTime.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getFortuneColor = (type: DeityInfo['fortuneType']) => {
    const colors = {
      excellent: 'var(--color-excellent)',
      good: 'var(--color-good)', 
      normal: 'var(--color-normal)',
      challenging: 'var(--color-challenging)'
    }
    return colors[type]
  }

  const getFortuneText = (type: DeityInfo['fortuneType']) => {
    const texts = {
      excellent: '大吉',
      good: '吉',
      normal: '平',
      challenging: '需谨慎'
    }
    return texts[type]
  }

  const handleDeitySwitch = (direction: 'prev' | 'next') => {
    // 触觉反馈
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
    
    if (direction === 'next') {
      setCurrentDeityIndex((prev) => (prev + 1) % deities.length)
    } else {
      setCurrentDeityIndex((prev) => (prev - 1 + deities.length) % deities.length)
    }
    setImageLoaded(false)
  }

  // 移动端滑动手势处理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    })
  }

  const handleTouchEnd = () => {
    if (!touchStart.x || !touchEnd.x) return
    
    const deltaX = touchStart.x - touchEnd.x
    const deltaY = Math.abs(touchStart.y - touchEnd.y)
    
    // 只有水平滑动距离大于50px且垂直滑动小于100px才触发切换
    if (Math.abs(deltaX) > 50 && deltaY < 100) {
      if (deltaX > 0) {
        // 向左滑动，切换到下一个
        handleDeitySwitch('next')
      } else {
        // 向右滑动，切换到上一个
        handleDeitySwitch('prev')
      }
    }
    
    // 重置触摸状态
    setTouchStart({ x: 0, y: 0 })
    setTouchEnd({ x: 0, y: 0 })
  }

  // 触觉反馈辅助函数
  const hapticFeedback = (pattern: number | number[] = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  const handleChatClick = () => {
    hapticFeedback([50, 50, 50]) // 三次短震动
    onNavigate('chat')
  }

  const handleQuickAction = (action: string) => {
    hapticFeedback(30) // 短震动
    console.log(action)
  }

  return (
    <div className="home-optimized">
      {/* 🌟 时间问候区 */}
      <div className="hero-section">
        <div className="time-greeting">
          <div className="greeting-text">{getTimeGreeting()}</div>
          <div className="current-time">{formatTime()}</div>
        </div>
      </div>

      {/* 💬 神仙对话预览区 - 核心功能 */}
      <div 
        className="deity-conversation-card priority-hero"
        ref={conversationCardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="conversation-header">
          <div className="deity-avatar">
            <div className="avatar-container">
              {!imageError ? (
                <img 
                  src={currentDeity.imageUrl}
                  alt={currentDeity.name}
                  className={`guanyin-avatar ${imageLoaded ? 'loaded' : 'loading'} deity-${currentDeity.id}`}
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="guanyin-fallback">
                  {currentDeity.fallbackEmoji}
                </div>
              )}
              <div className="online-indicator animate-pulse"></div>
            </div>
            
            {/* 神仙切换按钮 */}
            <div className="deity-switch-controls">
              <button 
                className="deity-switch-btn prev"
                onClick={() => handleDeitySwitch('prev')}
                onTouchStart={(e) => e.stopPropagation()}
                title="上一位神仙"
                aria-label="切换到上一位神仙"
              >
                ◀
              </button>
              <button 
                className="deity-switch-btn next"
                onClick={() => handleDeitySwitch('next')}
                onTouchStart={(e) => e.stopPropagation()}
                title="下一位神仙"
                aria-label="切换到下一位神仙"
              >
                ▶
              </button>
            </div>
          </div>
          
          <div className="conversation-content">
            <div className="deity-info-header">
              <h2 className="deity-name">{currentDeity.name}</h2>
              <div className="deity-title">{currentDeity.title}</div>
              <div className="deity-specialty">{currentDeity.specialty}</div>
            </div>

            {/* 今日运势核心信息 */}
            <div className="today-fortune-card">
              <div className="fortune-header">
                <span className="fortune-label">今日运势</span>
                <div className="fortune-score-container">
                  <span 
                    className="fortune-badge"
                    style={{ backgroundColor: getFortuneColor(currentDeity.fortuneType) }}
                  >
                    {getFortuneText(currentDeity.fortuneType)}
                  </span>
                  <span className="fortune-score">{todayFortune?.overall_score || currentDeity.fortuneScore}分</span>
                </div>
              </div>
              
              <div className="fortune-message">
                "{todayFortune?.overall_description || currentDeity.todayMessage}"
              </div>

              {/* 今日五行和方位 */}
              {todayFortune && (
                <div className="fortune-mystical-info">
                  <div className="mystical-row">
                    <div className="mystical-item">
                      <span className="mystical-label">今日五行:</span>
                      <span 
                        className="mystical-value wuxing-display"
                        style={{ 
                          color: '#22c55e',
                          textShadow: `0 0 8px #22c55e30`
                        }}
                      >
                        {todayFortune.lucky_colors[0] || '木'}
                      </span>
                    </div>
                    <div className="mystical-item">
                      <span className="mystical-label">幸运方位:</span>
                      <span 
                        className="mystical-value direction-display"
                        style={{ 
                          color: '#3b82f6',
                          textShadow: `0 0 8px #3b82f630`
                        }}
                      >
                        {todayFortune.lucky_directions[0] || '东'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mystical-row">
                    <div className="mystical-item">
                      <span className="mystical-label">运势等级:</span>
                      <span className="mystical-value">{todayFortune.overall_level}</span>
                    </div>
                    <div className="mystical-item">
                      <span className="mystical-label">幸运数字:</span>
                      <span className="mystical-value">{todayFortune.lucky_numbers.join(', ')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 可展开的详细运势 */}
              <div className={`fortune-details ${showFortuneDetails ? 'expanded' : ''}`}>
                <button 
                  className="details-toggle"
                  onClick={() => {
                    hapticFeedback(30)
                    setShowFortuneDetails(!showFortuneDetails)
                  }}
                  aria-expanded={showFortuneDetails}
                  aria-label={showFortuneDetails ? '收起运势详情' : '展开运势详情'}
                >
                  <span>详细运势</span>
                  <span className={`toggle-icon ${showFortuneDetails ? 'rotated' : ''}`}>▼</span>
                </button>
                
                {showFortuneDetails && todayFortune && (
                  <div className="fortune-breakdown-list">
                    {/* 今日宜忌 */}
                    <div className="today-auspicious-taboos">
                      <div className="auspicious-section">
                        <h4 className="section-title" style={{ color: '#22c55e' }}>✅ 今日宜</h4>
                        <div className="auspicious-list">
                          {todayFortune.recommended_activities.map((item: string, index: number) => (
                            <span key={index} className="auspicious-tag">{item}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="taboos-section">
                        <h4 className="section-title" style={{ color: '#ef4444' }}>❌ 今日忌</h4>
                        <div className="taboos-list">
                          {todayFortune.avoid_activities.map((item: string, index: number) => (
                            <span key={index} className="taboo-tag">{item}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 个性化建议 */}
                    <div className="personalized-advice">
                      <h4 className="advice-title">🌟 个性化建议</h4>
                      
                      {todayFortune.career_fortune.advice.length > 0 && (
                        <div className="advice-category">
                          <span className="advice-icon">💼</span>
                          <span className="advice-label">事业:</span>
                          <span className="advice-text">{todayFortune.career_fortune.advice[0]}</span>
                        </div>
                      )}
                      
                      {todayFortune.wealth_fortune.advice.length > 0 && (
                        <div className="advice-category">
                          <span className="advice-icon">💰</span>
                          <span className="advice-label">财运:</span>
                          <span className="advice-text">{todayFortune.wealth_fortune.advice[0]}</span>
                        </div>
                      )}
                      
                      {todayFortune.relationship_fortune.advice.length > 0 && (
                        <div className="advice-category">
                          <span className="advice-icon">💕</span>
                          <span className="advice-label">感情:</span>
                          <span className="advice-text">{todayFortune.relationship_fortune.advice[0]}</span>
                        </div>
                      )}
                      
                      {todayFortune.health_fortune.advice.length > 0 && (
                        <div className="advice-category">
                          <span className="advice-icon">🏥</span>
                          <span className="advice-label">健康:</span>
                          <span className="advice-text">{todayFortune.health_fortune.advice[0]}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* 今日指引 - 保留神仙特定指引 */}
                    <div className="today-guidance">
                      <h4 className="guidance-title">💫 神仙指引</h4>
                      <div className="guidance-list" role="list">
                        {currentDeity.guidance.map((guide, index) => (
                          <div key={index} className="guidance-item" role="listitem">
                            <span className="guidance-bullet">•</span>
                            <span className="guidance-text">{guide}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="message-meta">
              <span className="message-time">2分钟前</span>
              <span className="deity-indicator">
                {currentDeityIndex + 1}/{deities.length}
              </span>
            </div>
          </div>

          <div className="chat-action-area">
            <button 
              className="primary-chat-btn mobile-haptic-feedback"
              onClick={handleChatClick}
              aria-label="开始与神仙深度对话"
            >
              💬 开始深度对话
            </button>
            
            <div className="quick-fortune-actions" role="group" aria-label="快速功能操作">
              <button 
                className="quick-action-small"
                onClick={() => handleQuickAction('求签')}
                aria-label="快速求签"
              >
                🎯 求签
              </button>
              <button 
                className="quick-action-small"
                onClick={() => {
                  hapticFeedback(30)
                  setShowFortuneDetails(!showFortuneDetails)
                }}
                aria-label="查看今日宜忌"
              >
                📅 宜忌
              </button>
              <button 
                className="quick-action-small"
                onClick={() => handleQuickAction('分享运势')}
                aria-label="分享今日运势"
              >
                🔗 分享
              </button>
              <button 
                className="quick-action-small"
                onClick={() => onNavigate('deepseek-demo')}
                aria-label="测试DeepSeek API"
                style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}
              >
                🤖 AI测试
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📿 手串状态指示器 - 简化版 */}
      <div className={`bracelet-status priority-high ${braceletConnected ? 'connected' : 'disconnected'}`}>
        <div className="status-indicator">
          <span className="status-icon" role="img" aria-label="沉香手串">📿</span>
          <div className="status-text">
            <div className="connection-text">
              {braceletConnected ? '沉香手串已连接' : '手串未连接'}
            </div>
            <div className="energy-text">开光能量：{blessingEnergy}%</div>
          </div>
        </div>
        
        <div className="energy-bar" role="progressbar" aria-valuenow={blessingEnergy} aria-valuemin={0} aria-valuemax={100}>
          <div 
            className="energy-fill"
            style={{ width: `${blessingEnergy}%` }}
          />
        </div>
      </div>





      {/* 移动端滑动提示 - 首次访问显示 */}
      <div className="mobile-gesture-hint" style={{ 
        position: 'fixed',
        bottom: '120px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        opacity: '0',
        pointerEvents: 'none',
        transition: 'opacity 0.3s ease',
        zIndex: '1000'
      }}>
        👆 左右滑动切换神仙朋友
      </div>
    </div>
  )
}

export default HomePageOptimized 