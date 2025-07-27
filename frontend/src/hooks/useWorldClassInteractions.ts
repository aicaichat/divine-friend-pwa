import { useEffect, useRef, useCallback, useState } from 'react';

// 🌟 世界级交互系统 Hook
// 基于iOS/Android交互设计原则，提供统一的用户体验

interface GestureConfig {
  onTap?: (event: TouchEvent | MouseEvent) => void;
  onLongPress?: (event: TouchEvent | MouseEvent) => void;
  onSwipeLeft?: (event: TouchEvent) => void;
  onSwipeRight?: (event: TouchEvent) => void;
  onSwipeUp?: (event: TouchEvent) => void;
  onSwipeDown?: (event: TouchEvent) => void;
  onPinchStart?: (event: TouchEvent) => void;
  onPinchMove?: (event: TouchEvent, scale: number) => void;
  onPinchEnd?: (event: TouchEvent) => void;
  longPressDelay?: number;
  swipeThreshold?: number;
  preventScroll?: boolean;
}

interface HapticConfig {
  enabled: boolean;
  patterns: {
    light: number[];
    medium: number[];
    heavy: number[];
    success: number[];
    warning: number[];
    error: number[];
  };
}

interface SoundConfig {
  enabled: boolean;
  volume: number;
  sounds: {
    tap: string;
    success: string;
    error: string;
    swipe: string;
  };
}

interface WorldClassInteractionState {
  isPressed: boolean;
  isLongPressed: boolean;
  isGestureActive: boolean;
  lastInteraction: string | null;
  interactionCount: number;
}

const defaultHapticConfig: HapticConfig = {
  enabled: true,
  patterns: {
    light: [50],
    medium: [100],
    heavy: [200],
    success: [50, 50, 100],
    warning: [100, 50, 100],
    error: [200, 100, 200]
  }
};

const defaultSoundConfig: SoundConfig = {
  enabled: false, // 默认关闭声音，用户可以在设置中开启
  volume: 0.3,
  sounds: {
    tap: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUbBDyX4PXBciAE...',
    success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUbBDyX4PXBciAE...',
    error: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUbBDyX4PXBciAE...',
    swipe: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUbBDyX4PXBciAE...'
  }
};

export const useWorldClassInteractions = (
  gestureConfig?: GestureConfig,
  hapticConfig: HapticConfig = defaultHapticConfig,
  soundConfig: SoundConfig = defaultSoundConfig
) => {
  const elementRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<WorldClassInteractionState>({
    isPressed: false,
    isLongPressed: false,
    isGestureActive: false,
    lastInteraction: null,
    interactionCount: 0
  });

  // 触觉反馈
  const triggerHaptic = useCallback((pattern: keyof HapticConfig['patterns']) => {
    if (!hapticConfig.enabled || !navigator.vibrate) return;
    
    try {
      navigator.vibrate(hapticConfig.patterns[pattern]);
    } catch (error) {
      console.warn('Haptic feedback not supported:', error);
    }
  }, [hapticConfig]);

  // 声音反馈
  const playSound = useCallback((soundType: keyof SoundConfig['sounds']) => {
    if (!soundConfig.enabled) return;
    
    try {
      const audio = new Audio(soundConfig.sounds[soundType]);
      audio.volume = soundConfig.volume;
      audio.play().catch(() => {
        // 忽略自动播放策略错误
      });
    } catch (error) {
      console.warn('Sound feedback not supported:', error);
    }
  }, [soundConfig]);

  // 手势状态管理
  const updateState = useCallback((updates: Partial<WorldClassInteractionState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
      interactionCount: prev.interactionCount + 1
    }));
  }, []);

  // 性能监控
  const [performanceMetrics, setPerformanceMetrics] = useState({
    gestureLatency: 0,
    frameRate: 60,
    interactionResponsiveness: 100
  });

  // 监控交互延迟
  const measureLatency = useCallback((startTime: number) => {
    const latency = performance.now() - startTime;
    setPerformanceMetrics(prev => ({
      ...prev,
      gestureLatency: latency,
      interactionResponsiveness: Math.max(0, 100 - latency)
    }));
  }, []);

  // 🎯 点击/触摸处理
  const handlePointerDown = useCallback((event: PointerEvent) => {
    const startTime = performance.now();
    
    updateState({
      isPressed: true,
      isGestureActive: true,
      lastInteraction: 'press'
    });

    triggerHaptic('light');
    
    // 长按检测
    const longPressTimer = setTimeout(() => {
      if (gestureConfig?.onLongPress) {
        gestureConfig.onLongPress(event as any);
        updateState({ isLongPressed: true });
        triggerHaptic('medium');
        playSound('tap');
      }
    }, gestureConfig?.longPressDelay || 500);

    // 清理定时器
    const cleanup = () => {
      clearTimeout(longPressTimer);
      updateState({
        isPressed: false,
        isGestureActive: false
      });
      measureLatency(startTime);
    };

    // 监听释放事件
    const handlePointerUp = (upEvent: PointerEvent) => {
      cleanup();
      
      if (!state.isLongPressed && gestureConfig?.onTap) {
        gestureConfig.onTap(upEvent as any);
        triggerHaptic('light');
        playSound('tap');
      }
      
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };

    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
  }, [gestureConfig, state.isLongPressed, updateState, triggerHaptic, playSound, measureLatency]);

  // 🌊 滑动手势处理
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (gestureConfig?.preventScroll) {
      event.preventDefault();
    }

    const touch = event.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const startTime = performance.now();

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (gestureConfig?.preventScroll) {
        moveEvent.preventDefault();
      }
    };

    const handleTouchEnd = (endEvent: TouchEvent) => {
      const endTouch = endEvent.changedTouches[0];
      const deltaX = endTouch.clientX - startX;
      const deltaY = endTouch.clientY - startY;
      const threshold = gestureConfig?.swipeThreshold || 50;

      // 判断滑动方向
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0 && gestureConfig?.onSwipeRight) {
            gestureConfig.onSwipeRight(endEvent);
            triggerHaptic('light');
            playSound('swipe');
            updateState({ lastInteraction: 'swipe-right' });
          } else if (deltaX < 0 && gestureConfig?.onSwipeLeft) {
            gestureConfig.onSwipeLeft(endEvent);
            triggerHaptic('light');
            playSound('swipe');
            updateState({ lastInteraction: 'swipe-left' });
          }
        }
      } else {
        // 垂直滑动
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0 && gestureConfig?.onSwipeDown) {
            gestureConfig.onSwipeDown(endEvent);
            triggerHaptic('light');
            playSound('swipe');
            updateState({ lastInteraction: 'swipe-down' });
          } else if (deltaY < 0 && gestureConfig?.onSwipeUp) {
            gestureConfig.onSwipeUp(endEvent);
            triggerHaptic('light');
            playSound('swipe');
            updateState({ lastInteraction: 'swipe-up' });
          }
        }
      }

      measureLatency(startTime);
      
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [gestureConfig, updateState, triggerHaptic, playSound, measureLatency]);

  // 🤏 捏合手势处理
  const handlePinchGesture = useCallback((event: TouchEvent) => {
    if (event.touches.length !== 2) return;

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );

    const handlePinchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 2) return;
      
      const newTouch1 = moveEvent.touches[0];
      const newTouch2 = moveEvent.touches[1];
      const newDistance = Math.sqrt(
        Math.pow(newTouch2.clientX - newTouch1.clientX, 2) + 
        Math.pow(newTouch2.clientY - newTouch1.clientY, 2)
      );
      
      const scale = newDistance / distance;
      
      if (gestureConfig?.onPinchMove) {
        gestureConfig.onPinchMove(moveEvent, scale);
      }
    };

    const handlePinchEnd = (endEvent: TouchEvent) => {
      if (gestureConfig?.onPinchEnd) {
        gestureConfig.onPinchEnd(endEvent);
      }
      
      document.removeEventListener('touchmove', handlePinchMove);
      document.removeEventListener('touchend', handlePinchEnd);
    };

    if (gestureConfig?.onPinchStart) {
      gestureConfig.onPinchStart(event);
    }

    document.addEventListener('touchmove', handlePinchMove);
    document.addEventListener('touchend', handlePinchEnd);
  }, [gestureConfig]);

  // 🎨 视觉反馈效果
  const addVisualFeedback = useCallback((element: HTMLElement, type: 'press' | 'release' | 'success' | 'error' = 'press') => {
    if (!element) return;

    const feedbackStyles = {
      press: {
        transform: 'scale(0.98)',
        opacity: '0.8',
        transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)'
      },
      release: {
        transform: 'scale(1)',
        opacity: '1',
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
      },
      success: {
        boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
        transition: 'box-shadow 0.3s ease-out'
      },
      error: {
        boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
        transition: 'box-shadow 0.3s ease-out'
      }
    };

    const originalStyles = {
      transform: element.style.transform,
      opacity: element.style.opacity,
      boxShadow: element.style.boxShadow,
      transition: element.style.transition
    };

    // 应用反馈样式
    Object.assign(element.style, feedbackStyles[type]);

    // 恢复原始样式
    if (type === 'press') {
      setTimeout(() => {
        Object.assign(element.style, feedbackStyles.release);
      }, 100);
    } else if (type === 'success' || type === 'error') {
      setTimeout(() => {
        Object.assign(element.style, originalStyles);
      }, 1000);
    }
  }, []);

  // 🚀 性能优化的事件监听器
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 使用 Passive Event Listeners 提升性能
    const options: AddEventListenerOptions = {
      passive: !gestureConfig?.preventScroll,
      capture: false
    };

    element.addEventListener('pointerdown', handlePointerDown, options);
    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchstart', handlePinchGesture, options);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchstart', handlePinchGesture);
    };
  }, [gestureConfig, handlePointerDown, handleTouchStart, handlePinchGesture]);

  // 🎯 无障碍支持
  const a11yProps = {
    role: 'button',
    tabIndex: 0,
    'aria-pressed': state.isPressed,
    'aria-label': gestureConfig?.onTap ? '可点击元素' : undefined,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (gestureConfig?.onTap) {
          gestureConfig.onTap(event as any);
          triggerHaptic('light');
          playSound('tap');
        }
      }
    }
  };

  // 🔧 调试工具（仅开发环境）
  const debugInfo = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? {
    state,
    performanceMetrics,
    gestureConfig: gestureConfig || {},
    hapticSupported: !!navigator.vibrate,
    touchSupported: 'ontouchstart' in window
  } : null;

  return {
    ref: elementRef,
    state,
    performanceMetrics,
    addVisualFeedback,
    triggerHaptic,
    playSound,
    a11yProps,
    debugInfo
  };
};

// 🎨 预定义交互模式
export const useButtonInteractions = (
  onPress?: () => void,
  options?: { hapticPattern?: keyof HapticConfig['patterns']; soundEnabled?: boolean }
) => {
  return useWorldClassInteractions({
    onTap: onPress,
    longPressDelay: 500
  }, {
    ...defaultHapticConfig,
    patterns: {
      ...defaultHapticConfig.patterns,
      light: options?.hapticPattern ? defaultHapticConfig.patterns[options.hapticPattern] : defaultHapticConfig.patterns.light
    }
  }, {
    ...defaultSoundConfig,
    enabled: options?.soundEnabled ?? false
  });
};

export const useCardInteractions = (
  onTap?: () => void,
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void
) => {
  return useWorldClassInteractions({
    onTap,
    onSwipeLeft: onSwipe ? () => onSwipe('left') : undefined,
    onSwipeRight: onSwipe ? () => onSwipe('right') : undefined,
    onSwipeUp: onSwipe ? () => onSwipe('up') : undefined,
    onSwipeDown: onSwipe ? () => onSwipe('down') : undefined,
    swipeThreshold: 80
  });
};

export const useDrawerInteractions = (
  onOpen?: () => void,
  onClose?: () => void
) => {
  return useWorldClassInteractions({
    onSwipeRight: onOpen,
    onSwipeLeft: onClose,
    swipeThreshold: 100,
    preventScroll: true
  });
};

export const useImageInteractions = (
  onZoom?: (scale: number) => void,
  onDoubleTap?: () => void
) => {
  let lastTap = 0;
  
  return useWorldClassInteractions({
    onTap: () => {
      const now = Date.now();
      if (now - lastTap < 300) {
        onDoubleTap?.();
      }
      lastTap = now;
    },
    onPinchMove: onZoom ? (_, scale) => onZoom(scale) : undefined,
    preventScroll: true
  });
};

// 🌟 交互分析工具
export const useInteractionAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalInteractions: 0,
    averageLatency: 0,
    gestureTypes: {} as Record<string, number>,
    errorRate: 0,
    userSatisfactionScore: 100
  });

  const recordInteraction = useCallback((type: string, latency: number, success: boolean = true) => {
    setAnalytics(prev => ({
      ...prev,
      totalInteractions: prev.totalInteractions + 1,
      averageLatency: (prev.averageLatency + latency) / 2,
      gestureTypes: {
        ...prev.gestureTypes,
        [type]: (prev.gestureTypes[type] || 0) + 1
      },
      errorRate: success ? prev.errorRate : prev.errorRate + 1,
      userSatisfactionScore: success ? Math.min(100, prev.userSatisfactionScore + 1) : Math.max(0, prev.userSatisfactionScore - 5)
    }));
  }, []);

  return { analytics, recordInteraction };
};

export default useWorldClassInteractions; 