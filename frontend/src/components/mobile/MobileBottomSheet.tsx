/**
 * 移动端底部抽屉组件
 * 提供原生感受的底部弹出交互
 */

import React, { useState, useRef, useEffect } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { createPortal } from 'react-dom'

interface MobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  height?: 'auto' | 'half' | 'full'
  snapPoints?: number[]
  initialSnap?: number
  enableDrag?: boolean
  enableBackdrop?: boolean
  className?: string
}

const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  height = 'auto',
  snapPoints = [0.3, 0.7, 0.95],
  initialSnap = 1,
  enableDrag = true,
  enableBackdrop = true,
  className = ''
}) => {
  const [currentSnapIndex, setCurrentSnapIndex] = useState(initialSnap)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const y = useMotionValue(0)
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)

  // 响应窗口大小变化
  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 计算当前高度
  const getCurrentHeight = () => {
    const snapPoint = snapPoints[currentSnapIndex]
    return windowHeight * snapPoint
  }

  // 背景遮罩透明度
  const backdropOpacity = useTransform(
    y,
    [0, getCurrentHeight()],
    [0.5, 0]
  )

  // 处理拖拽结束
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    
    const currentHeight = getCurrentHeight()
    const dragDistance = info.offset.y
    const dragVelocity = info.velocity.y
    
    // 基于拖拽距离和速度决定吸附点
    let targetSnapIndex = currentSnapIndex
    
    if (dragVelocity > 500 || dragDistance > currentHeight * 0.3) {
      // 向下拖拽，降低高度或关闭
      if (currentSnapIndex === 0) {
        onClose()
        return
      } else {
        targetSnapIndex = Math.max(0, currentSnapIndex - 1)
      }
    } else if (dragVelocity < -500 || dragDistance < -currentHeight * 0.3) {
      // 向上拖拽，增加高度
      targetSnapIndex = Math.min(snapPoints.length - 1, currentSnapIndex + 1)
    }
    
    // 检查是否需要关闭
    if (targetSnapIndex === 0 && (dragDistance > currentHeight * 0.5 || dragVelocity > 300)) {
      onClose()
      return
    }
    
    setCurrentSnapIndex(targetSnapIndex)
    y.set(0) // 重置位置
  }

  // 处理背景点击
  const handleBackdropClick = () => {
    if (enableBackdrop) {
      onClose()
    }
  }

  // 触觉反馈
  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  // 计算高度样式
  const getHeightStyle = () => {
    switch (height) {
      case 'half':
        return { height: '50vh' }
      case 'full':
        return { height: '100vh' }
      default:
        return { height: `${getCurrentHeight()}px` }
    }
  }

  if (!isOpen) return null

  const sheetContent = (
    <div className="fixed inset-0 z-50">
      {/* 背景遮罩 */}
      {enableBackdrop && (
        <motion.div
          className="absolute inset-0 bg-black"
          style={{ opacity: backdropOpacity }}
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* 底部抽屉 */}
      <motion.div
        ref={containerRef}
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl ${className}`}
        style={{
          ...getHeightStyle(),
          y: isDragging ? y : 0
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300
        }}
        drag={enableDrag ? 'y' : false}
        dragConstraints={{ top: -getCurrentHeight() * 0.2, bottom: getCurrentHeight() }}
        dragElastic={0.1}
        onDragStart={() => {
          setIsDragging(true)
          triggerHaptic()
        }}
        onDragEnd={handleDragEnd}
      >
        {/* 拖拽指示器 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 标题栏 */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* 吸附点指示器 */}
        {snapPoints.length > 1 && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-2">
            {snapPoints.map((_, index) => (
              <motion.button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSnapIndex ? 'bg-purple-500' : 'bg-gray-300'
                }`}
                onClick={() => {
                  setCurrentSnapIndex(index)
                  triggerHaptic()
                }}
                whileTap={{ scale: 1.2 }}
              />
            ))}
          </div>
        )}

        {/* 安全区域底部填充 */}
        <div 
          style={{ 
            height: `max(16px, env(safe-area-inset-bottom))`,
            background: 'transparent'
          }} 
        />
      </motion.div>
    </div>
  )

  return createPortal(sheetContent, document.body)
}

export default MobileBottomSheet