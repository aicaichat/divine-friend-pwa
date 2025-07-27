/**
 * 世界级移动端布局系统
 * 基于Material Design 3和iOS设计规范
 * 提供顶级用户体验的移动端容器
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface MobileLayoutProps {
  children: React.ReactNode
  title?: string
  showNavigation?: boolean
  showBackButton?: boolean
  onBackClick?: () => void
  backgroundColor?: string
  statusBarStyle?: 'light' | 'dark'
  safeAreaColor?: string
  className?: string
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  showNavigation = true,
  showBackButton = false,
  onBackClick,
  backgroundColor = '#ffffff',
  statusBarStyle = 'light',
  safeAreaColor,
  className = ''
}) => {
  const navigate = useNavigate()
  const [safeArea, setSafeArea] = useState({ top: 0, bottom: 0 })
  const [scrollY, setScrollY] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)

  // 检测设备安全区域
  useEffect(() => {
    const detectSafeArea = () => {
      const style = getComputedStyle(document.documentElement)
      const top = parseInt(style.getPropertyValue('--sat') || '0')
      const bottom = parseInt(style.getPropertyValue('--sab') || '0')
      setSafeArea({ top, bottom })
    }

    detectSafeArea()
    window.addEventListener('resize', detectSafeArea)
    return () => window.removeEventListener('resize', detectSafeArea)
  }, [])

  // 滚动监听
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement
      setScrollY(target.scrollTop)
      setIsScrolling(true)
      
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setIsScrolling(false), 150)
    }

    const scrollContainer = document.querySelector('.mobile-scroll-container')
    scrollContainer?.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      scrollContainer?.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [])

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      navigate(-1)
    }
  }

  // 导航项配置
  const navigationItems = [
    {
      id: 'home',
      icon: '🏠',
      label: '首页',
      path: '/mobile-home',
      color: '#FF6B6B'
    },
    {
      id: 'spiritual',
      icon: '🙏',
      label: '灵修',
      path: '/mobile-spiritual',
      color: '#4ECDC4'
    },
    {
      id: 'fortune',
      icon: '🔮',
      label: '运势',
      path: '/daily-fortune',
      color: '#45B7D1'
    },
    {
      id: 'chat',
      icon: '💬',
      label: '对话',
      path: '/mobile-chat',
      color: '#96CEB4'
    },
    {
      id: 'profile',
      icon: '👤',
      label: '我的',
      path: '/profile',
      color: '#FFEAA7'
    }
  ]

  return (
    <div 
      className={`mobile-layout ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor,
        zIndex: 1000,
        maxWidth: '100vw',
        overflow: 'hidden'
      }}
    >
      {/* 状态栏安全区域 */}
      <div 
        style={{
          height: `max(${safeArea.top}px, env(safe-area-inset-top))`,
          backgroundColor: safeAreaColor || backgroundColor,
          position: 'relative',
          zIndex: 1001
        }}
      />

      {/* 顶部导航栏 */}
      <motion.header
        className="mobile-header"
        style={{
          position: 'relative',
          zIndex: 1001,
          backgroundColor: backgroundColor,
          padding: '12px 16px',
          borderBottom: scrollY > 20 ? '1px solid rgba(0,0,0,0.1)' : 'none',
          backdropFilter: scrollY > 20 ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrollY > 20 ? 'blur(20px)' : 'none'
        }}
        animate={{
          boxShadow: scrollY > 20 
            ? '0 2px 20px rgba(0,0,0,0.1)' 
            : '0 0 0 rgba(0,0,0,0)'
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="header-content" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '44px'
        }}>
          {/* 左侧返回按钮 */}
          {showBackButton && (
            <motion.button
              onClick={handleBackClick}
              className="back-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                borderRadius: '22px',
                border: 'none',
                backgroundColor: 'rgba(0,0,0,0.05)',
                color: '#333',
                fontSize: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
            >
              ←
            </motion.button>
          )}

          {/* 中央标题 */}
          <motion.h1
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '18px',
              fontWeight: '600',
              color: '#333',
              margin: 0,
              padding: showBackButton ? '0 44px 0 0' : '0 44px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            animate={{ opacity: scrollY > 40 ? 1 : 0.8 }}
          >
            {title || '神易友'}
          </motion.h1>

          {/* 右侧占位或功能按钮 */}
          <div style={{ width: '44px', height: '44px' }} />
        </div>
      </motion.header>

      {/* 主内容区域 */}
      <main 
        className="mobile-scroll-container"
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch', // iOS平滑滚动
          paddingBottom: showNavigation ? `max(${safeArea.bottom + 80}px, env(safe-area-inset-bottom, 80px))` : `max(${safeArea.bottom}px, env(safe-area-inset-bottom))`
        }}
      >
        {/* 滚动指示器 */}
        <motion.div
          className="scroll-indicator"
          style={{
            position: 'fixed',
            top: `calc(${safeArea.top + 70}px)`,
            right: '4px',
            width: '2px',
            height: '60px',
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '1px',
            zIndex: 1002,
            overflow: 'hidden'
          }}
          animate={{ opacity: isScrolling ? 1 : 0 }}
        >
          <motion.div
            style={{
              width: '100%',
              backgroundColor: '#FF6B6B',
              borderRadius: '1px',
              transformOrigin: 'top'
            }}
            animate={{
              height: `${Math.min((scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100, 100)}%`
            }}
          />
        </motion.div>

        {children}
      </main>

      {/* 底部导航栏 */}
      {showNavigation && (
        <motion.nav
          className="mobile-navigation"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderTop: '1px solid rgba(0,0,0,0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 1001,
            paddingBottom: `max(${safeArea.bottom}px, env(safe-area-inset-bottom))`
          }}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            height: '80px',
            padding: '0 16px'
          }}>
            {navigationItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="nav-item"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 12px',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: window.location.pathname === item.path ? item.color : '#666',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '60px'
                }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  color: window.location.pathname === item.path ? item.color : '#666'
                }}
              >
                <motion.div
                  style={{
                    fontSize: '24px',
                    marginBottom: '4px',
                    filter: window.location.pathname === item.path 
                      ? `drop-shadow(0 0 8px ${item.color}40)` 
                      : 'none'
                  }}
                  animate={{
                    scale: window.location.pathname === item.path ? 1.1 : 1
                  }}
                >
                  {item.icon}
                </motion.div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: window.location.pathname === item.path ? '600' : '400',
                  lineHeight: 1
                }}>
                  {item.label}
                </span>
                
                {/* 活跃指示器 */}
                {window.location.pathname === item.path && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      width: '4px',
                      height: '4px',
                      borderRadius: '2px',
                      backgroundColor: item.color
                    }}
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.nav>
      )}

      {/* 全局样式 */}
      <style jsx>{`
        .mobile-layout {
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }
        
        .mobile-scroll-container {
          scroll-behavior: smooth;
        }
        
        .mobile-scroll-container::-webkit-scrollbar {
          display: none;
        }
        
        .nav-item {
          position: relative;
        }
        
        @media (hover: hover) {
          .nav-item:hover {
            background-color: rgba(0,0,0,0.05);
          }
        }
        
        /* 系统级触觉反馈样式 */
        .mobile-layout * {
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
      `}</style>
    </div>
  )
}

export default MobileLayout