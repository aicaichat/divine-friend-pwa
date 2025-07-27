/**
 * 世界级移动端首页
 * 基于Material Design 3和现代移动端设计规范
 * 提供直观、流畅、高效的用户体验
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../components/mobile/MobileLayout'
import MobileCard from '../components/mobile/MobileCard'
import MobileGestures from '../components/mobile/MobileGestures'
import { EnhancedBaziService } from '../services/enhancedBaziService'

interface UserStats {
  consecutiveDays: number
  totalSessions: number
  fortuneAccuracy: number
  spiritualLevel: number
}

interface QuickAction {
  id: string
  title: string
  subtitle: string
  icon: string
  color: string
  path: string
  badge?: number
  featured?: boolean
}

const MobileHomeOptimized: React.FC = () => {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [greeting, setGreeting] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)
  const [dailyFortune, setDailyFortune] = useState<any>(null)
  const [userStats, setUserStats] = useState<UserStats>({
    consecutiveDays: 7,
    totalSessions: 42,
    fortuneAccuracy: 85,
    spiritualLevel: 3
  })
  const [loading, setLoading] = useState(true)

  // 时间和问候语更新
  useEffect(() => {
    const updateTimeAndGreeting = () => {
      const now = new Date()
      setCurrentTime(now)
      
      const hour = now.getHours()
      if (hour < 6) setGreeting('夜深了，愿您安眠')
      else if (hour < 9) setGreeting('早安，开启美好的一天')
      else if (hour < 12) setGreeting('上午好，精神饱满')
      else if (hour < 14) setGreeting('午安，片刻休憩')
      else if (hour < 18) setGreeting('下午好，继续努力')
      else if (hour < 22) setGreeting('晚上好，放松时光')
      else setGreeting('夜晚静谧，内心平和')
    }

    updateTimeAndGreeting()
    const timer = setInterval(updateTimeAndGreeting, 60000)
    return () => clearInterval(timer)
  }, [])

  // 加载用户数据
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true)
        
        // 获取保存的八字数据
        const savedBaziInfo = EnhancedBaziService.getSavedBaziInfo()
        if (savedBaziInfo) {
          setUserInfo(savedBaziInfo.birthInfo)
        }

        // 模拟加载今日运势
        await new Promise(resolve => setTimeout(resolve, 1000))
        setDailyFortune({
          overall_level: '吉',
          fortune_score: 82,
          wealth_luck: 4,
          health_luck: 5,
          career_luck: 3,
          love_luck: 4,
          suggestion: '今日宜静心修行，忌急躁冒进'
        })
        
      } catch (error) {
        console.error('数据加载失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  // 快捷操作配置
  const quickActions: QuickAction[] = [
    {
      id: 'spiritual-guide',
      title: '精神导师',
      subtitle: '与本命佛太岁对话',
      icon: '🙏',
      color: '#FF6B6B',
      path: '/mobile-spiritual',
      featured: true
    },
    {
      id: 'daily-fortune',
      title: '今日运势',
      subtitle: '查看详细运程',
      icon: '🔮',
      color: '#4ECDC4',
      path: '/daily-fortune'
    },
    {
      id: 'bazi-analysis',
      title: '八字分析',
      subtitle: '深度命理解读',
      icon: '📊',
      color: '#45B7D1',
      path: '/bazi-demo'
    },
    {
      id: 'chat',
      title: 'AI对话',
      subtitle: '智能问答助手',
      icon: '💬',
      color: '#96CEB4',
      path: '/mobile-chat',
      badge: 3
    }
  ]

  const handleQuickAction = (action: QuickAction) => {
    navigate(action.path)
  }

  const handleGesture = (event: any) => {
    switch (event.type) {
      case 'swipe':
        if (event.data.direction === 'down') {
          // 下滑刷新
          window.location.reload()
        }
        break
      case 'doubleTap':
        // 双击快速进入精神导师页面
        navigate('/spiritual-matching')
        break
    }
  }

  // 渲染用户状态卡片
  const renderUserStatusCard = () => (
    <MobileCard
      className="mb-4"
      elevation={3}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}
    >
      <div className="text-center">
        <motion.div
          className="mb-3"
          animate={{ 
            scale: [1, 1.05, 1],
            filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)']
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="text-4xl mb-2">
            {userInfo?.name ? '🌟' : '👤'}
          </div>
          <h2 className="text-xl font-bold mb-1">
            {greeting}
          </h2>
          <p className="text-sm opacity-90">
            {userInfo?.name || '新用户'}，欢迎回来
          </p>
        </motion.div>

        {/* 用户统计 */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{userStats.consecutiveDays}</div>
            <div className="text-xs opacity-80">连续天数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{userStats.totalSessions}</div>
            <div className="text-xs opacity-80">总使用次</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{userStats.fortuneAccuracy}%</div>
            <div className="text-xs opacity-80">准确率</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">Lv.{userStats.spiritualLevel}</div>
            <div className="text-xs opacity-80">修行等级</div>
          </div>
        </div>
      </div>
    </MobileCard>
  )

  // 渲染今日运势卡片
  const renderFortuneCard = () => (
    <MobileCard
      title="今日运势"
      subtitle={currentTime.toLocaleDateString('zh-CN', { 
        month: 'long', 
        day: 'numeric',
        weekday: 'long' 
      })}
      icon="🔮"
      className="mb-4"
      onClick={() => navigate('/daily-fortune')}
      loading={loading}
      elevation={2}
    >
      {!loading && dailyFortune && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {dailyFortune.fortune_score}
              </div>
              <div className="text-sm text-gray-600">综合得分</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-2xl mb-1">
                {dailyFortune.overall_level === '吉' ? '🌟' : 
                 dailyFortune.overall_level === '中' ? '🌤️' : '⛅'}
              </div>
              <div className="text-sm text-gray-600">运势等级</div>
            </div>
          </div>

          {/* 运势详情 */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '财运', value: dailyFortune.wealth_luck, color: '#FFD700' },
              { label: '健康', value: dailyFortune.health_luck, color: '#32CD32' },
              { label: '事业', value: dailyFortune.career_luck, color: '#4169E1' },
              { label: '感情', value: dailyFortune.love_luck, color: '#FF69B4' }
            ].map((item, index) => (
              <div 
                key={item.label}
                className="bg-gray-50 rounded-lg p-3 text-center"
              >
                <div className="text-sm text-gray-600 mb-1">{item.label}</div>
                <div className="flex justify-center">
                  {'★'.repeat(item.value).split('').map((star, i) => (
                    <motion.span
                      key={i}
                      style={{ color: item.color }}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    >
                      {star}
                    </motion.span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 今日建议 */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              💡 今日建议：{dailyFortune.suggestion}
            </div>
          </div>
        </div>
      )}
    </MobileCard>
  )

  // 渲染快捷操作网格
  const renderQuickActions = () => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 px-1">快捷功能</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MobileCard
              title={action.title}
              subtitle={action.subtitle}
              icon={action.icon}
              onClick={() => handleQuickAction(action)}
              elevation={action.featured ? 3 : 2}
              style={{
                background: action.featured 
                  ? `linear-gradient(135deg, ${action.color}20, ${action.color}10)`
                  : undefined,
                borderLeft: `4px solid ${action.color}`,
                position: 'relative'
              }}
            >
              {action.badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '10px',
                    backgroundColor: '#FF6B6B',
                    color: 'white',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  {action.badge}
                </div>
              )}
            </MobileCard>
          </motion.div>
        ))}
      </div>
    </div>
  )

  return (
    <MobileLayout 
      title="神易友"
      showNavigation={true}
      backgroundColor="#f8fafc"
    >
      <MobileGestures
        onGesture={handleGesture}
        enableSwipe={true}
        enableDoubleTap={true}
        className="min-h-full"
      >
        <div className="p-4 pb-8">
          {/* 用户状态卡片 */}
          {renderUserStatusCard()}

          {/* 今日运势卡片 */}
          {renderFortuneCard()}

          {/* 快捷操作 */}
          {renderQuickActions()}

          {/* 修行提醒 */}
          <MobileCard
            title="修行提醒"
            subtitle="今日修行计划"
            icon="📿"
            className="mb-4"
            elevation={1}
          >
            <div className="space-y-3">
              {[
                { task: '晨起静心冥想', done: true, time: '07:00' },
                { task: '念诵本命佛心咒', done: true, time: '12:00' },
                { task: '晚间感恩祈祷', done: false, time: '21:00' }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      item.done ? 'bg-green-500' : 'bg-gray-300'
                    } flex items-center justify-center`}>
                      {item.done && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                    <span className={`text-sm ${
                      item.done ? 'text-gray-500 line-through' : 'text-gray-800'
                    }`}>
                      {item.task}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
              ))}
            </div>
          </MobileCard>

          {/* 最近活动 */}
          <MobileCard
            title="最近活动"
            subtitle="您的修行足迹"
            icon="📋"
            elevation={1}
          >
            <div className="space-y-2">
              {[
                { action: '完成今日运势查看', time: '2小时前', icon: '🔮' },
                { action: '与观音菩萨对话', time: '5小时前', icon: '🙏' },
                { action: '分析八字命盘', time: '1天前', icon: '📊' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2">
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.action}</div>
                    <div className="text-xs text-gray-500">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </MobileCard>
        </div>
      </MobileGestures>
    </MobileLayout>
  )
}

export default MobileHomeOptimized