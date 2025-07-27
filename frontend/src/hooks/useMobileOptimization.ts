/**
 * 移动端性能优化Hook
 * 提供图片懒加载、虚拟滚动、内存管理等优化功能
 */

import { useState, useEffect, useRef, useCallback } from 'react'

interface MobileOptimizationOptions {
  enableLazyLoading?: boolean
  enableVirtualScroll?: boolean
  enableImageOptimization?: boolean
  enableMemoryManagement?: boolean
  enableOfflineSupport?: boolean
}

interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

interface LazyImageOptions {
  threshold?: number
  rootMargin?: string
  placeholder?: string
}

export const useMobileOptimization = (options: MobileOptimizationOptions = {}) => {
  const {
    enableLazyLoading = true,
    enableVirtualScroll = false,
    enableImageOptimization = true,
    enableMemoryManagement = true,
    enableOfflineSupport = true
  } = options

  // 网络状态监听
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [networkType, setNetworkType] = useState<string>('unknown')
  const [memoryUsage, setMemoryUsage] = useState<number>(0)

  // 性能监控
  const performanceRef = useRef<{
    startTime: number
    renderCount: number
    memoryPeaks: number[]
  }>({
    startTime: Date.now(),
    renderCount: 0,
    memoryPeaks: []
  })

  // 网络状态监听
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 检测网络类型
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      setNetworkType(connection.effectiveType || 'unknown')
      
      connection.addEventListener('change', () => {
        setNetworkType(connection.effectiveType || 'unknown')
      })
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 内存监控
  useEffect(() => {
    if (!enableMemoryManagement) return

    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usage = memory.usedJSHeapSize / memory.totalJSHeapSize
        setMemoryUsage(usage)
        
        // 记录内存峰值
        performanceRef.current.memoryPeaks.push(usage)
        if (performanceRef.current.memoryPeaks.length > 100) {
          performanceRef.current.memoryPeaks.shift()
        }

        // 内存使用过高时触发垃圾回收
        if (usage > 0.8) {
          console.warn('High memory usage detected, suggesting cleanup')
          requestIdleCallback(() => {
            // 触发垃圾回收的建议
            if (window.gc) {
              window.gc()
            }
          })
        }
      }
    }

    const interval = setInterval(monitorMemory, 5000)
    return () => clearInterval(interval)
  }, [enableMemoryManagement])

  // 虚拟滚动Hook
  const useVirtualScroll = useCallback((
    items: any[],
    options: VirtualScrollOptions
  ) => {
    const [scrollTop, setScrollTop] = useState(0)
    const { itemHeight, containerHeight, overscan = 5 } = options

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    )

    const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
      ...item,
      index: startIndex + index
    }))

    const totalHeight = items.length * itemHeight
    const offsetY = startIndex * itemHeight

    return {
      visibleItems,
      totalHeight,
      offsetY,
      onScroll: (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop)
      }
    }
  }, [])

  // 懒加载Hook
  const useLazyImage = useCallback((options: LazyImageOptions = {}) => {
    const { threshold = 0.1, rootMargin = '50px', placeholder } = options
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(false)
    const imgRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
      if (!enableLazyLoading || !imgRef.current) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.unobserve(entry.target)
          }
        },
        { threshold, rootMargin }
      )

      observer.observe(imgRef.current)

      return () => observer.disconnect()
    }, [threshold, rootMargin])

    const onLoad = useCallback(() => {
      setIsLoaded(true)
    }, [])

    return {
      imgRef,
      isLoaded,
      isInView,
      onLoad,
      shouldLoad: isInView
    }
  }, [enableLazyLoading])

  // 图片优化
  const optimizeImage = useCallback((
    src: string,
    width?: number,
    height?: number,
    quality: number = 80
  ) => {
    if (!enableImageOptimization) return src

    // 根据设备像素比调整图片尺寸
    const devicePixelRatio = window.devicePixelRatio || 1
    const optimizedWidth = width ? Math.ceil(width * devicePixelRatio) : undefined
    const optimizedHeight = height ? Math.ceil(height * devicePixelRatio) : undefined

    // 根据网络条件调整质量
    let adjustedQuality = quality
    if (networkType === 'slow-2g' || networkType === '2g') {
      adjustedQuality = Math.min(quality, 50)
    } else if (networkType === '3g') {
      adjustedQuality = Math.min(quality, 70)
    }

    // 如果支持WebP格式，优先使用
    const supportsWebP = document.createElement('canvas')
      .toDataURL('image/webp')
      .indexOf('webp') !== -1

    // 构建优化后的URL（这里假设有图片处理服务）
    const params = new URLSearchParams()
    if (optimizedWidth) params.append('w', optimizedWidth.toString())
    if (optimizedHeight) params.append('h', optimizedHeight.toString())
    params.append('q', adjustedQuality.toString())
    if (supportsWebP) params.append('f', 'webp')

    return `${src}?${params.toString()}`
  }, [enableImageOptimization, networkType])

  // 预加载关键资源
  const preloadResource = useCallback((
    url: string,
    type: 'image' | 'script' | 'style' = 'image'
  ) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    
    switch (type) {
      case 'image':
        link.as = 'image'
        break
      case 'script':
        link.as = 'script'
        break
      case 'style':
        link.as = 'style'
        break
    }

    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  // 缓存管理
  const cacheManager = {
    set: (key: string, data: any, ttl: number = 3600000) => {
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      }
      try {
        localStorage.setItem(`mobile_cache_${key}`, JSON.stringify(item))
      } catch (error) {
        console.warn('Failed to set cache:', error)
      }
    },

    get: (key: string) => {
      try {
        const item = localStorage.getItem(`mobile_cache_${key}`)
        if (!item) return null

        const parsed = JSON.parse(item)
        if (Date.now() - parsed.timestamp > parsed.ttl) {
          localStorage.removeItem(`mobile_cache_${key}`)
          return null
        }

        return parsed.data
      } catch (error) {
        console.warn('Failed to get cache:', error)
        return null
      }
    },

    clear: () => {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('mobile_cache_')) {
          localStorage.removeItem(key)
        }
      })
    }
  }

  // 性能指标
  const getPerformanceMetrics = useCallback(() => {
    const now = Date.now()
    const runtime = now - performanceRef.current.startTime
    
    return {
      runtime,
      renderCount: performanceRef.current.renderCount,
      averageMemoryUsage: performanceRef.current.memoryPeaks.length > 0
        ? performanceRef.current.memoryPeaks.reduce((a, b) => a + b, 0) / performanceRef.current.memoryPeaks.length
        : 0,
      currentMemoryUsage: memoryUsage,
      networkType,
      isOnline
    }
  }, [memoryUsage, networkType, isOnline])

  // 触觉反馈
  const hapticFeedback = useCallback((
    type: 'light' | 'medium' | 'heavy' = 'light'
  ) => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30]
      }
      navigator.vibrate(patterns[type])
    }
  }, [])

  // 增加渲染计数
  useEffect(() => {
    performanceRef.current.renderCount++
  })

  return {
    // 状态
    isOnline,
    networkType,
    memoryUsage,

    // Hooks
    useVirtualScroll: enableVirtualScroll ? useVirtualScroll : undefined,
    useLazyImage: enableLazyLoading ? useLazyImage : undefined,

    // 功能函数
    optimizeImage,
    preloadResource,
    cacheManager,
    getPerformanceMetrics,
    hapticFeedback,

    // 性能建议
    shouldReduceAnimations: networkType === 'slow-2g' || networkType === '2g' || memoryUsage > 0.7,
    shouldUseOfflineMode: !isOnline && enableOfflineSupport,
    shouldOptimizeImages: networkType === 'slow-2g' || networkType === '2g' || networkType === '3g'
  }
}

export default useMobileOptimization