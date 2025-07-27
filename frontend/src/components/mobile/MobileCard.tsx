/**
 * 世界级移动端卡片组件
 * 支持手势交互、触觉反馈和高级动画
 */

import React, { useState } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'

interface MobileCardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  icon?: string
  onClick?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
  style?: React.CSSProperties
  elevation?: 1 | 2 | 3 | 4 | 5
  interactive?: boolean
  disabled?: boolean
  loading?: boolean
  swipeable?: boolean
  hapticFeedback?: boolean
}

const MobileCard: React.FC<MobileCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  onClick,
  onSwipeLeft,
  onSwipeRight,
  className = '',
  style,
  elevation = 2,
  interactive = true,
  disabled = false,
  loading = false,
  swipeable = false,
  hapticFeedback = true
}) => {
  const [isPressed, setIsPressed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  // 手势相关
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5])
  const rotate = useTransform(x, [-150, 0, 150], [-10, 0, 10])

  // 触觉反馈
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!hapticFeedback || !navigator.vibrate) return
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30, 10, 30]
    }
    
    navigator.vibrate(patterns[type])
  }

  // 阴影等级映射
  const elevationShadows = {
    1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    2: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    3: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
    4: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
    5: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)'
  }

  const handleClick = () => {
    if (disabled || loading) return
    
    triggerHaptic('light')
    onClick?.()
  }

  const handlePanStart = () => {
    if (!swipeable) return
    setIsDragging(true)
    triggerHaptic('light')
  }

  const handlePanEnd = (event: any, info: PanInfo) => {
    if (!swipeable) return
    
    setIsDragging(false)
    const threshold = 100
    
    if (Math.abs(info.offset.x) > threshold) {
      triggerHaptic('medium')
      
      if (info.offset.x > threshold && onSwipeRight) {
        onSwipeRight()
      } else if (info.offset.x < -threshold && onSwipeLeft) {
        onSwipeLeft()
      }
    }
    
    // 重置位置
    x.set(0)
  }

  const cardVariants = {
    idle: { 
      scale: 1,
      boxShadow: elevationShadows[elevation]
    },
    pressed: { 
      scale: 0.98,
      boxShadow: elevationShadows[Math.min(elevation + 1, 5) as keyof typeof elevationShadows]
    },
    disabled: {
      scale: 1,
      opacity: 0.6,
      boxShadow: elevationShadows[1]
    }
  }

  const contentVariants = {
    idle: { opacity: 1 },
    loading: { opacity: 0.7 }
  }

  return (
    <motion.div
      className={`mobile-card ${className}`}
      style={{
        position: 'relative',
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        cursor: interactive && !disabled ? 'pointer' : 'default',
        touchAction: swipeable ? 'pan-y' : 'manipulation',
        willChange: 'transform',
        ...style,
        x: swipeable ? x : 0,
        opacity: swipeable ? opacity : 1,
        rotate: swipeable ? rotate : 0
      }}
      variants={cardVariants}
      initial="idle"
      animate={
        disabled ? 'disabled' : 
        isPressed ? 'pressed' : 'idle'
      }
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25
      }}
      onTapStart={() => setIsPressed(true)}
      onTap={() => {
        setIsPressed(false)
        handleClick()
      }}
      onTapCancel={() => setIsPressed(false)}
      onPanStart={handlePanStart}
      onPanEnd={handlePanEnd}
      whileTap={interactive && !disabled ? { scale: 0.98 } : {}}
    >
      {/* 背景渐变效果 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)',
          opacity: isPressed ? 1 : 0,
          transition: 'opacity 0.2s ease'
        }}
      />

      {/* 卡片头部 */}
      {(title || subtitle || icon) && (
        <div style={{
          padding: '16px 16px 8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {icon && (
            <motion.div
              style={{
                fontSize: '24px',
                width: '40px',
                height: '40px',
                borderRadius: '20px',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              animate={loading ? {
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              } : {}}
              transition={loading ? {
                rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' }
              } : {}}
            >
              {icon}
            </motion.div>
          )}
          
          <div style={{ flex: 1 }}>
            {title && (
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#333',
                lineHeight: 1.3
              }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                color: '#666',
                lineHeight: 1.3
              }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 卡片内容 */}
      <motion.div
        variants={contentVariants}
        animate={loading ? 'loading' : 'idle'}
        style={{
          padding: (title || subtitle || icon) ? '8px 16px 16px 16px' : '16px'
        }}
      >
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60px'
          }}>
            <motion.div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #FF6B6B',
                borderRadius: '50%'
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </div>
        ) : (
          children
        )}
      </motion.div>

      {/* 滑动指示器 */}
      {swipeable && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '8px',
          right: '8px',
          transform: 'translateY(-50%)',
          display: 'flex',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          zIndex: 1
        }}>
          <motion.div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 107, 107, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: 'white'
            }}
            animate={{ 
              opacity: isDragging ? 1 : 0,
              x: isDragging ? -20 : 0 
            }}
            transition={{ duration: 0.2 }}
          >
            ←
          </motion.div>
          
          <motion.div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '12px',
              backgroundColor: 'rgba(78, 205, 196, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: 'white'
            }}
            animate={{ 
              opacity: isDragging ? 1 : 0,
              x: isDragging ? 20 : 0 
            }}
            transition={{ duration: 0.2 }}
          >
            →
          </motion.div>
        </div>
      )}

      {/* 禁用状态覆盖层 */}
      {disabled && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: '#999',
          zIndex: 10
        }}>
          暂不可用
        </div>
      )}
    </motion.div>
  )
}

export default MobileCard