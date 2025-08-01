import React, { useState, useEffect } from 'react'

// 导入样式 - 世界级视觉设计系统
import './App.css' // 主样式文件，包含所有导入

// 导入类型定义
import type { AppPage } from './types'

// 导入页面组件
import HomePage from './pages/HomePage'
import HomePageOptimized from './pages/HomePageOptimized'
import ChatPage from './pages/ChatPage'
import PersonalizedChatPage from './pages/PersonalizedChatPage' // 个性化对话页面
import FreeChatRedirectPage from './pages/FreeChatRedirectPage' // free-chat重定向页面
import DeepSeekDemo from './components/DeepSeekDemo'
import BraceletPage from './pages/BraceletPage'
import GrowthPage from './pages/GrowthPage'
import CommunityPage from './pages/CommunityPage'
import SettingsPage from './pages/SettingsPage'

import BaziDemoPage from './pages/BaziDemoPage'
import DayunDemoPage from './pages/DayunDemoPage'
import SettingsTestPage from './pages/SettingsTestPage'
import DailyFortuneTestPage from './pages/DailyFortuneTestPage'

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppPage>('home')

  // 解析URL参数并设置初始页面
  useEffect(() => {
    // 检查查询字符串参数
    const urlParams = new URLSearchParams(window.location.search)
    const pageParam = urlParams.get('page')
    
    // 也检查hash参数（向后兼容）
    const hash = window.location.hash
    
    if (pageParam === 'today' || pageParam === 'home') {
      setCurrentPage('home')
    } else if (pageParam === 'free-chat' || hash.includes('page=free-chat')) {
      setCurrentPage('free-chat')
    } else if (pageParam === 'chat' || hash.includes('page=chat')) {
      setCurrentPage('chat')
    } else if (pageParam === 'bracelet' || hash.includes('page=bracelet')) {
      setCurrentPage('bracelet')
    } else if (pageParam === 'growth' || hash.includes('page=growth')) {
      setCurrentPage('growth')
    } else if (pageParam === 'community' || hash.includes('page=community')) {
      setCurrentPage('community')
    } else if (pageParam === 'settings' || hash.includes('page=settings')) {
      setCurrentPage('settings')
    } else if (pageParam === 'test' || hash.includes('page=test')) {
      setCurrentPage('test')
    } else if (pageParam === 'bazi-demo' || hash.includes('page=bazi-demo')) {
      setCurrentPage('bazi-demo')
    } else if (pageParam === 'dayun-demo' || hash.includes('page=dayun-demo')) {
      setCurrentPage('dayun-demo')
    } else {
      // 默认显示首页
      setCurrentPage('home')
    }
  }, [])

  const handleNavigate = (page: AppPage) => {
    setCurrentPage(page)
    // 更新URL查询字符串
    const url = new URL(window.location.href)
    url.searchParams.set('page', page)
    window.history.pushState({}, '', url.toString())
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePageOptimized onNavigate={handleNavigate} />
      case 'chat':
        return <ChatPage onNavigate={handleNavigate} />
      case 'free-chat':
        return <FreeChatRedirectPage />
      case 'deepseek-demo':
        return <DeepSeekDemo />
      case 'bracelet':
        return <BraceletPage onNavigate={handleNavigate} />
      case 'growth':
        return <GrowthPage onNavigate={handleNavigate} />
      case 'community':
        return <CommunityPage onNavigate={handleNavigate} />
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} />
      case 'test':
        return <SettingsTestPage />
      case 'bazi-demo':
        return <BaziDemoPage />
      case 'dayun-demo':
        return <DayunDemoPage />
      case 'daily-fortune-demo':
        return <DailyFortuneTestPage />
      default:
        return <HomePageOptimized onNavigate={handleNavigate} />
    }
  }

  // 神仙朋友导航架构 - 5个关系维度
  const navigationItems = [
    {
      id: 'home' as AppPage,
      icon: '🏠',
      label: '今日相伴',
      description: '每日问候',
      value: '温暖陪伴感'
    },
    {
      id: 'free-chat' as AppPage,
      icon: '💬', 
      label: '个性化对话',
      description: '八字运势',
      value: 'AI神仙陪伴'
    },
    {
      id: 'bracelet' as AppPage,
      icon: '📿',
      label: '我的手串',
      description: '法宝护佑',
      value: '拥有安全感'
    },
    {
      id: 'growth' as AppPage,
      icon: '🌱',
      label: '修心',
      description: '修行历程',
      value: '成就进步感'
    },
    {
      id: 'community' as AppPage,
      icon: '👥',
      label: '神仙圈子',
      description: '善友同修',
      value: '归属社交感'
    },
    {
      id: 'settings' as AppPage,
      icon: '⚙️',
      label: '我的设置',
      description: '个性化',
      value: '掌控定制感'
    }
  ]

  return (
    <div className="zen-container zen-optimized">
      {/* 主要内容区域 */}
      <main 
        className="zen-scroll zen-nebula"
        style={{
          paddingBottom: (currentPage === 'chat' || currentPage === 'free-chat') ? '0px' : '120px',
          minHeight: '100vh'
        }}
      >
        <div className="page-transition-enter zen-divine-light">
          {renderPage()}
        </div>
      </main>

      {/* 底部导航栏 - 神仙朋友关系维度导航 */}
      <nav className="divine-nav">
          <div className="divine-nav-items">
            {navigationItems.map((item) => (
              <div
                key={item.id}
                className={`divine-nav-item zen-ripple zen-particles ${
                  currentPage === item.id ? 'active' : ''
                }`}
                onClick={() => handleNavigate(item.id)}
                title={item.value}
              >
                <div className="divine-nav-icon">
                  {item.icon}
                </div>
                <div className="divine-nav-label">
                  {item.label}
                </div>
                <div className="zen-nav-desc" style={{ fontSize: '0.6rem', opacity: 0.7 }}>
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </nav>
    </div>
  )
}

export default App 
 
 
 
 