/**
 * 移动端下拉刷新组件
 * 提供原生感受的下拉刷新交互
 */

import React, { useState, useRef, useEffect } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'

interface MobilePullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  refreshingText?: string
  pullText?: string
  releaseText?: string
  threshold?: number
  className?: string
  disabled?: boolean
}

const MobilePullToRefresh: React.FC<MobilePullToRefreshProps> = ({
  children,
  onRefresh,
  refreshingText = '正在刷新...',
  pullText = '下拉刷新',
  releaseText = '松开刷新',
  threshold = 80,
  className = '',
  disabled = false
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canRefresh, setCanRefresh] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const y = useMotionValue(0)
  const scrollY = useRef(0)

  // 转换拖拽距离为刷新指示器的位置和旋转
  const refresherY = useTransform(y, [0, threshold * 2], [0, threshold])
  const refresherOpacity = useTransform(y, [0, threshold], [0, 1])
  const refresherRotate = useTransform(y, [0, threshold * 2], [0, 360])
  const refresherScale = useTransform(y, [0, threshold], [0.8, 1.2])

  // 监听滚动位置
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      scrollY.current = container.scrollTop
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // 处理拖拽开始
  const handleDragStart = () => {
    if (disabled || isRefreshing || scrollY.current > 0) return
    setIsDragging(true)
  }

  // 处理拖拽中
  const handleDrag = (event: any, info: PanInfo) => {
    if (disabled || isRefreshing || scrollY.current > 0) return

    const dragDistance = info.offset.y
    
    if (dragDistance > 0) {
      // 向下拖拽
      y.set(Math.min(dragDistance * 0.6, threshold * 1.5)) // 添加阻尼效果
      setCanRefresh(dragDistance > threshold)
      
      // 触觉反馈
      if (dragDistance > threshold && !canRefresh && navigator.vibrate) {
        navigator.vibrate(10)
      }
    }
  }

  // 处理拖拽结束
  const handleDragEnd = async (event: any, info: PanInfo) => {
    if (disabled || isRefreshing || scrollY.current > 0) {
      y.set(0)
      setIsDragging(false)
      setCanRefresh(false)
      return
    }

    setIsDragging(false)

    if (canRefresh) {
      setIsRefreshing(true)
      y.set(threshold) // 保持在刷新位置
      
      // 强触觉反馈
      if (navigator.vibrate) {
        navigator.vibrate([20, 10, 20])
      }

      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setIsRefreshing(false)
        setCanRefresh(false)
        y.set(0) // 恢复位置
      }
    } else {
      y.set(0) // 弹回原位
      setCanRefresh(false)
    }
  }

  // 获取当前状态文字
  const getStatusText = () => {
    if (isRefreshing) return refreshingText
    if (canRefresh) return releaseText
    return pullText
  }

  // 获取状态图标
  const getStatusIcon = () => {
    if (isRefreshing) {
      return (
        <motion.div
          className="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )
    }

    if (canRefresh) {
      return (
        <motion.div
          className="text-2xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          🔄
        </motion.div>
      )
    }

    return (
      <motion.div
        className="text-xl"
        style={{ rotate: refresherRotate }}
      >
        ⬇️
      </motion.div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 刷新指示器 */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-10 flex flex-col items-center justify-center bg-white"
        style={{
          y: refresherY,
          opacity: refresherOpacity,
          scale: refresherScale,
          height: threshold
        }}
      >
        <div className="flex flex-col items-center justify-center py-4">
          {getStatusIcon()}
          <motion.p
            className={`text-sm mt-2 font-medium ${
              canRefresh ? 'text-purple-600' : 'text-gray-600'
            }`}
            animate={{
              color: canRefresh ? '#9C27B0' : '#6B7280'
            }}
          >
            {getStatusText()}
          </motion.p>
        </div>

        {/* 进度指示器 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
          <motion.div
            className="h-full bg-purple-500"
            style={{
              width: useTransform(y, [0, threshold], ['0%', '100%'])
            }}
          />
        </div>
      </motion.div>

      {/* 内容区域 */}
      <motion.div
        ref={containerRef}
        className="h-full overflow-auto"
        style={{ y }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.3, bottom: 0 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: 'grabbing' }}
      >
        {/* 顶部留白用于显示刷新指示器 */}
        <div style={{ height: isDragging || isRefreshing ? threshold : 0 }} />
        
        {children}
      </motion.div>

      {/* 拖拽提示 */}
      {isDragging && !isRefreshing && (
        <motion.div
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-xs">
            {canRefresh ? '松开刷新' : `继续下拉 ${Math.max(0, threshold - y.get()).toFixed(0)}px`}
          </div>
        </motion.div>
      )}

      {/* 刷新成功提示 */}
      {!isRefreshing && canRefresh && (
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          <div className="bg-green-500 text-white p-3 rounded-full shadow-lg">
            <div className="text-2xl">✅</div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default MobilePullToRefresh