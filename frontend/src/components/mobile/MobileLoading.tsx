/**
 * 移动端加载组件
 * 提供多种加载状态和骨架屏效果
 */

import React from 'react'
import { motion } from 'framer-motion'

interface MobileLoadingProps {
  type?: 'spinner' | 'skeleton' | 'dots' | 'progress' | 'spiritual'
  size?: 'small' | 'medium' | 'large'
  message?: string
  progress?: number
  className?: string
  fullScreen?: boolean
}

const MobileLoading: React.FC<MobileLoadingProps> = ({
  type = 'spinner',
  size = 'medium',
  message,
  progress,
  className = '',
  fullScreen = false
}) => {
  const sizeMap = {
    small: { spinner: 'w-6 h-6', text: 'text-sm' },
    medium: { spinner: 'w-8 h-8', text: 'text-base' },
    large: { spinner: 'w-12 h-12', text: 'text-lg' }
  }

  const containerClass = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex items-center justify-center p-4'

  // 旋转加载器
  const renderSpinner = () => (
    <motion.div
      className={`border-4 border-gray-200 border-t-purple-500 rounded-full ${sizeMap[size].spinner}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  )

  // 点状加载器
  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-purple-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )

  // 进度条加载器
  const renderProgress = () => (
    <div className="w-full max-w-xs">
      <div className="bg-gray-200 rounded-full h-2 mb-2">
        <motion.div
          className="bg-purple-500 h-2 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progress || 0}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      {progress !== undefined && (
        <div className="text-center text-sm text-gray-600">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )

  // 骨架屏加载器
  const renderSkeleton = () => (
    <div className="w-full space-y-4 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="flex space-x-4">
        <div className="h-20 bg-gray-200 rounded flex-1"></div>
        <div className="h-20 bg-gray-200 rounded flex-1"></div>
      </div>
    </div>
  )

  // 精神主题加载器
  const renderSpiritual = () => (
    <div className="text-center">
      <motion.div
        className="relative mb-4"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <div className="text-6xl">🙏</div>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-purple-300"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      
      <motion.div
        className="flex justify-center space-x-1 mb-4"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {['✨', '🌟', '💫'].map((star, i) => (
          <motion.span
            key={i}
            className="text-2xl"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5
            }}
          >
            {star}
          </motion.span>
        ))}
      </motion.div>
    </div>
  )

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="text-center">
        {type === 'spinner' && renderSpinner()}
        {type === 'dots' && renderDots()}
        {type === 'progress' && renderProgress()}
        {type === 'skeleton' && renderSkeleton()}
        {type === 'spiritual' && renderSpiritual()}
        
        {message && type !== 'skeleton' && (
          <motion.p
            className={`mt-4 text-gray-600 ${sizeMap[size].text}`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  )
}

export default MobileLoading