/**
 * 移动端标签栏导航组件
 * 基于iOS和Android设计规范的现代化导航
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'

interface TabItem {
  id: string
  label: string
  icon: string
  activeIcon?: string
  path: string
  badge?: number
  color: string
}

interface MobileTabBarProps {
  className?: string
  style?: React.CSSProperties
  onTabChange?: (tabId: string) => void
}

const MobileTabBar: React.FC<MobileTabBarProps> = ({
  className = '',
  style,
  onTabChange
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('')
  const [safeAreaBottom, setSafeAreaBottom] = useState(0)

  // 标签配置
  const tabs: TabItem[] = [
    {
      id: 'home',
      label: '首页',
      icon: '🏠',
      activeIcon: '🏠',
      path: '/mobile-home',
      color: '#FF6B6B'
    },
    {
      id: 'spiritual',
      label: '灵修',
      icon: '🙏',
      activeIcon: '🙏',
      path: '/mobile-spiritual',
      color: '#4ECDC4'
    },
    {
      id: 'fortune',
      label: '运势',
      icon: '🔮',
      activeIcon: '🔮',
      path: '/daily-fortune',
      color: '#45B7D1'
    },
    {
      id: 'chat',
      label: '对话',
      icon: '💬',
      activeIcon: '💬',
      path: '/mobile-chat',
      badge: 2,
      color: '#96CEB4'
    },
    {
      id: 'profile',
      label: '我的',
      icon: '👤',
      activeIcon: '👤',
      path: '/profile',
      color: '#FFEAA7'
    }
  ]

  // 检测安全区域
  useEffect(() => {
    const checkSafeArea = () => {
      const style = getComputedStyle(document.documentElement)
      const bottom = parseInt(style.getPropertyValue('--sab') || '0')
      setSafeAreaBottom(bottom)
    }

    checkSafeArea()
    window.addEventListener('resize', checkSafeArea)
    return () => window.removeEventListener('resize', checkSafeArea)
  }, [])

  // 同步当前路由
  useEffect(() => {
    const currentTab = tabs.find(tab => 
      location.pathname === tab.path || 
      location.pathname.startsWith(tab.path)
    )
    if (currentTab) {
      setActiveTab(currentTab.id)
    }
  }, [location.pathname])

  // 处理标签点击
  const handleTabClick = (tab: TabItem) => {
    if (tab.id === activeTab) {
      // 如果点击当前活跃标签，触发页面刷新或回到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setActiveTab(tab.id)
      navigate(tab.path)
      onTabChange?.(tab.id)
      
      // 触觉反馈
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
    }
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 ${className}`}
      style={{
        paddingBottom: `max(${safeAreaBottom}px, env(safe-area-inset-bottom))`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        zIndex: 1000,
        ...style
      }}
    >
      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className="flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-2 relative"
              whileTap={{ scale: 0.9 }}
              animate={{
                scale: isActive ? 1.05 : 1
              }}
              transition={{ duration: 0.2 }}
            >
              {/* 活跃状态背景 */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{ backgroundColor: `${tab.color}15` }}
                  layoutId="activeBackground"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* 图标容器 */}
              <div className="relative mb-1">
                <motion.div
                  className="text-2xl"
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    filter: isActive 
                      ? `drop-shadow(0 0 8px ${tab.color}60)` 
                      : 'none'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {isActive ? (tab.activeIcon || tab.icon) : tab.icon}
                </motion.div>

                {/* 徽章 */}
                {tab.badge && tab.badge > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </motion.div>
                )}
              </div>

              {/* 标签文字 */}
              <motion.span
                className={`text-xs font-medium leading-none ${
                  isActive ? 'text-gray-900' : 'text-gray-500'
                }`}
                animate={{
                  color: isActive ? tab.color : '#6B7280',
                  fontWeight: isActive ? 600 : 400
                }}
                transition={{ duration: 0.2 }}
              >
                {tab.label}
              </motion.span>

              {/* 活跃指示器 */}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 w-4 h-1 rounded-full"
                  style={{ backgroundColor: tab.color }}
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* 底部安全区域指示器 */}
      {safeAreaBottom > 0 && (
        <div 
          className="bg-gray-50"
          style={{ height: `${safeAreaBottom}px` }}
        />
      )}
    </div>
  )
}

export default MobileTabBar