/**
 * 移动端手势交互组件
 * 提供滑动、拖拽、双击、长按等手势支持
 */

import React, { useState, useRef, useEffect } from 'react'
import { motion, PanInfo, useMotionValue, useTransform, useAnimation } from 'framer-motion'

interface GestureEvent {
  type: 'tap' | 'doubleTap' | 'longPress' | 'swipe' | 'pinch' | 'drag'
  data?: any
  originalEvent?: TouchEvent | MouseEvent
}

interface MobileGesturesProps {
  children: React.ReactNode
  onGesture?: (event: GestureEvent) => void
  enableSwipe?: boolean
  enablePinch?: boolean
  enableLongPress?: boolean
  enableDoubleTap?: boolean
  swipeThreshold?: number
  longPressThreshold?: number
  doubleTapThreshold?: number
  className?: string
  style?: React.CSSProperties
}

const MobileGestures: React.FC<MobileGesturesProps> = ({
  children,
  onGesture,
  enableSwipe = true,
  enablePinch = false,
  enableLongPress = true,
  enableDoubleTap = true,
  swipeThreshold = 50,
  longPressThreshold = 500,
  doubleTapThreshold = 300,
  className = '',
  style
}) => {
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [lastTap, setLastTap] = useState(0)
  const [scale, setScale] = useState(1)
  const [initialDistance, setInitialDistance] = useState(0)
  
  const longPressTimer = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  
  // 双指距离计算
  const getDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0
    const [touch1, touch2] = [touches[0], touches[1]]
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }

  // 触觉反馈
  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (navigator.vibrate) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50, 50, 50]
      }
      navigator.vibrate(patterns[type])
    }
  }

  // 长按处理
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableLongPress) return
    
    // 开始长按计时
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true)
      hapticFeedback('heavy')
      onGesture?.({
        type: 'longPress',
        data: { position: { x: e.touches[0].clientX, y: e.touches[0].clientY } },
        originalEvent: e.nativeEvent
      })
    }, longPressThreshold)

    // 处理双指缩放
    if (enablePinch && e.touches.length === 2) {
      const distance = getDistance(e.touches)
      setInitialDistance(distance)
      e.preventDefault()
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // 如果移动则取消长按
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      setIsLongPressing(false)
    }

    // 处理双指缩放
    if (enablePinch && e.touches.length === 2) {
      const distance = getDistance(e.touches)
      if (initialDistance > 0) {
        const newScale = distance / initialDistance
        setScale(Math.max(0.5, Math.min(3, newScale)))
        onGesture?.({
          type: 'pinch',
          data: { scale: newScale, distance },
          originalEvent: e.nativeEvent
        })
      }
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    // 清理长按计时器
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }

    // 处理双击
    if (enableDoubleTap && !isLongPressing) {
      const now = Date.now()
      if (now - lastTap < doubleTapThreshold) {
        hapticFeedback('medium')
        onGesture?.({
          type: 'doubleTap',
          data: { timestamp: now },
          originalEvent: e.nativeEvent
        })
      }
      setLastTap(now)
    }

    setIsLongPressing(false)
    setInitialDistance(0)
  }

  // 滑动处理
  const handlePanEnd = (event: any, info: PanInfo) => {
    if (!enableSwipe) return

    const { offset, velocity } = info
    const distance = Math.sqrt(offset.x ** 2 + offset.y ** 2)
    
    if (distance > swipeThreshold || Math.abs(velocity.x) > 500 || Math.abs(velocity.y) > 500) {
      let direction = ''
      
      if (Math.abs(offset.x) > Math.abs(offset.y)) {
        direction = offset.x > 0 ? 'right' : 'left'
      } else {
        direction = offset.y > 0 ? 'down' : 'up'
      }

      hapticFeedback('light')
      onGesture?.({
        type: 'swipe',
        data: { 
          direction,
          distance,
          velocity: { x: velocity.x, y: velocity.y },
          offset: { x: offset.x, y: offset.y }
        },
        originalEvent: event
      })
    }
  }

  // 清理定时器
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  return (
    <motion.div
      ref={containerRef}
      className={`mobile-gestures ${className}`}
      style={{
        touchAction: enablePinch ? 'none' : 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        ...style
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onPanEnd={enableSwipe ? handlePanEnd : undefined}
      drag={enableSwipe}
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      dragElastic={0.1}
      animate={controls}
      whileTap={{ scale: 0.98 }}
    >
      {/* 长按状态指示器 */}
      {isLongPressing && (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            borderRadius: '12px',
            zIndex: 1,
            pointerEvents: 'none'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        />
      )}

      {/* 缩放容器 */}
      <motion.div
        style={{
          scale: enablePinch ? scale : 1,
          transformOrigin: 'center'
        }}
        animate={{ scale: enablePinch ? scale : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>

      {/* 手势提示层 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 2
        }}
      >
        {/* 滑动指示器 */}
        {enableSwipe && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            fontSize: '12px',
            color: 'rgba(0,0,0,0.3)',
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: '4px 8px',
            borderRadius: '8px',
            opacity: 0.7
          }}>
            ↔️
          </div>
        )}

        {/* 长按指示器 */}
        {enableLongPress && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            fontSize: '12px',
            color: 'rgba(0,0,0,0.3)',
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: '4px 8px',
            borderRadius: '8px',
            opacity: 0.7
          }}>
            👆
          </div>
        )}

        {/* 双击指示器 */}
        {enableDoubleTap && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            fontSize: '12px',
            color: 'rgba(0,0,0,0.3)',
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: '4px 8px',
            borderRadius: '8px',
            opacity: 0.7
          }}>
            👆👆
          </div>
        )}

        {/* 缩放指示器 */}
        {enablePinch && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            fontSize: '12px',
            color: 'rgba(0,0,0,0.3)',
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: '4px 8px',
            borderRadius: '8px',
            opacity: 0.7
          }}>
            🤏
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default MobileGestures