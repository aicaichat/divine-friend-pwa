import { useEffect, useState, useCallback, useRef } from 'react';

// === 🎯 可访问性增强系统（简化版） ===

interface AccessibilityState {
  // 用户偏好
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  darkMode: boolean;
  
  // 设备支持
  screenReader: boolean;
  keyboardNavigation: boolean;
  touchSupport: boolean;
  
  // 当前状态
  focusVisible: boolean;
  announcements: string[];
}

interface AccessibilityConfig {
  enableKeyboardNav?: boolean;
  focusTrapEnabled?: boolean;
  soundFeedback?: boolean;
  focusIndicators?: boolean;
  colorContrastEnhancement?: boolean;
}

// 🔍 检测用户偏好和能力
const detectAccessibilityFeatures = (): Partial<AccessibilityState> => {
  if (typeof window === 'undefined') {
    return {};
  }

  return {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highContrast: window.matchMedia('(prefers-contrast: high)').matches,
    largeText: false, // 简化检测
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    screenReader: 'speechSynthesis' in window,
    keyboardNavigation: !('ontouchstart' in window)
  };
};

// 🎹 键盘导航管理
export const useKeyboardNavigation = (enabled: boolean = true) => {
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  const focusableElementsRef = useRef<HTMLElement[]>([]);
  const containerRef = useRef<HTMLElement>(null);

  // 获取可聚焦元素
  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return;

    const selector = [
      'button',
      'input',
      'select', 
      'textarea',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]'
    ].join(', ');

    const elements = Array.from(
      containerRef.current.querySelectorAll(selector)
    ) as HTMLElement[];

    focusableElementsRef.current = elements.filter(
      el => !el.hasAttribute('disabled') && 
            el.offsetParent !== null && 
            !el.hasAttribute('aria-hidden')
    );
  }, []);

  // 键盘事件处理
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || focusableElementsRef.current.length === 0) return;

    const { key, shiftKey, ctrlKey } = event;
    const elements = focusableElementsRef.current;

    switch (key) {
      case 'Tab':
        event.preventDefault();
        const nextIndex = shiftKey 
          ? (currentFocusIndex - 1 + elements.length) % elements.length
          : (currentFocusIndex + 1) % elements.length;
        
        setCurrentFocusIndex(nextIndex);
        elements[nextIndex]?.focus();
        break;

      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        const direction = key === 'ArrowUp' ? -1 : 1;
        const newIndex = Math.max(0, Math.min(
          elements.length - 1,
          currentFocusIndex + direction
        ));
        
        setCurrentFocusIndex(newIndex);
        elements[newIndex]?.focus();
        break;

      case 'Home':
        if (ctrlKey) {
          event.preventDefault();
          setCurrentFocusIndex(0);
          elements[0]?.focus();
        }
        break;

      case 'End':
        if (ctrlKey) {
          event.preventDefault();
          const lastIndex = elements.length - 1;
          setCurrentFocusIndex(lastIndex);
          elements[lastIndex]?.focus();
        }
        break;

      case 'Escape':
        containerRef.current?.focus();
        setCurrentFocusIndex(-1);
        break;
    }
  }, [enabled, currentFocusIndex]);

  useEffect(() => {
    updateFocusableElements();
    
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      
      // 监听DOM变化
      const observer = new MutationObserver(updateFocusableElements);
      if (containerRef.current) {
        observer.observe(containerRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['disabled', 'tabindex', 'aria-hidden']
        });
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        observer.disconnect();
      };
    }
  }, [enabled, handleKeyDown, updateFocusableElements]);

  return {
    containerRef,
    currentFocusIndex,
    focusableElements: focusableElementsRef.current,
    updateFocusableElements
  };
};

// 📢 屏幕阅读器公告
export const useScreenReaderAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!message.trim()) return;

    setAnnouncements(prev => [...prev, message]);

    // 创建临时的live region
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    liveRegion.textContent = message;

    document.body.appendChild(liveRegion);

    // 清理
    setTimeout(() => {
      if (document.body.contains(liveRegion)) {
        document.body.removeChild(liveRegion);
      }
      setAnnouncements(prev => prev.filter(a => a !== message));
    }, 1000);
  }, []);

  const clearAnnouncements = useCallback(() => {
    setAnnouncements([]);
  }, []);

  return {
    announce,
    clearAnnouncements,
    announcements
  };
};

// 🎨 主要的可访问性Hook
export const useAccessibility = (config: AccessibilityConfig = {}) => {
  const [state, setState] = useState<AccessibilityState>({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    darkMode: false,
    screenReader: false,
    keyboardNavigation: false,
    touchSupport: false,
    focusVisible: false,
    announcements: []
  });

  const keyboardNav = useKeyboardNavigation(config.enableKeyboardNav !== false);
  const { announce, clearAnnouncements, announcements } = useScreenReaderAnnouncements();

  // 初始化可访问性检测
  useEffect(() => {
    const detectedFeatures = detectAccessibilityFeatures();
    setState(prev => ({ ...prev, ...detectedFeatures }));

    // 监听媒体查询变化
    const mediaQueries = [
      { query: '(prefers-reduced-motion: reduce)', key: 'reducedMotion' as keyof AccessibilityState },
      { query: '(prefers-contrast: high)', key: 'highContrast' as keyof AccessibilityState },
      { query: '(prefers-color-scheme: dark)', key: 'darkMode' as keyof AccessibilityState }
    ];

    const listeners = mediaQueries.map(({ query, key }) => {
      const mq = window.matchMedia(query);
      const handler = (e: MediaQueryListEvent) => {
        setState(prev => ({ ...prev, [key]: e.matches }));
      };
      
      mq.addEventListener('change', handler);
      return { mq, handler };
    });

    return () => {
      listeners.forEach(({ mq, handler }) => {
        mq.removeEventListener('change', handler);
      });
    };
  }, []);

  // 焦点可见性管理
  useEffect(() => {
    let isKeyboardUser = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        isKeyboardUser = true;
        setState(prev => ({ ...prev, focusVisible: true }));
      }
    };

    const handleMouseDown = () => {
      isKeyboardUser = false;
      setState(prev => ({ ...prev, focusVisible: false }));
    };

    const handleFocus = () => {
      setState(prev => ({ ...prev, focusVisible: isKeyboardUser }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('focusin', handleFocus);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('focusin', handleFocus);
    };
  }, []);

  // ARIA属性生成器
  const getAriaProps = useCallback((options: {
    label?: string;
    description?: string;
    expanded?: boolean;
    selected?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    required?: boolean;
    role?: string;
    level?: number;
    live?: 'polite' | 'assertive' | 'off';
  } = {}) => {
    const props: Record<string, any> = {};

    if (options.label) props['aria-label'] = options.label;
    if (options.description) props['aria-describedby'] = options.description;
    if (options.expanded !== undefined) props['aria-expanded'] = options.expanded;
    if (options.selected !== undefined) props['aria-selected'] = options.selected;
    if (options.disabled) props['aria-disabled'] = true;
    if (options.invalid) props['aria-invalid'] = true;
    if (options.required) props['aria-required'] = true;
    if (options.role) props['role'] = options.role;
    if (options.level) props['aria-level'] = options.level;
    if (options.live) props['aria-live'] = options.live;

    return props;
  }, []);

  // 样式类生成器
  const getContrastClasses = useCallback((baseClasses: string = '') => {
    if (!state.highContrast) return baseClasses;
    return `${baseClasses} high-contrast:border-2 high-contrast:border-white high-contrast:bg-black high-contrast:text-white`;
  }, [state.highContrast]);

  const getAnimationClasses = useCallback((animationClasses: string = '') => {
    if (state.reducedMotion) return '';
    return animationClasses;
  }, [state.reducedMotion]);

  const getFontSizeClasses = useCallback((baseSize: string = '') => {
    if (!state.largeText) return baseSize;
    
    const sizeMap: Record<string, string> = {
      'text-xs': 'text-sm',
      'text-sm': 'text-base',
      'text-base': 'text-lg',
      'text-lg': 'text-xl',
      'text-xl': 'text-2xl'
    };
    
    return sizeMap[baseSize] || baseSize;
  }, [state.largeText]);

  const getTouchTargetClasses = useCallback((baseClasses: string = '') => {
    if (!state.touchSupport) return baseClasses;
    return `${baseClasses} min-h-[44px] min-w-[44px]`;
  }, [state.touchSupport]);

  return {
    // 状态
    state,
    
    // 导航
    keyboardNavigation: keyboardNav,
    
    // 屏幕阅读器
    announce,
    clearAnnouncements,
    announcements,
    
    // 工具函数
    getAriaProps,
    getContrastClasses,
    getAnimationClasses,
    getFontSizeClasses,
    getTouchTargetClasses,
    
    // 配置
    config
  };
};

// 🔧 可访问性检查工具
export const useAccessibilityChecker = () => {
  const [issues, setIssues] = useState<string[]>([]);

  const checkAccessibility = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    const foundIssues: string[] = [];

    // 检查图片alt属性
    const images = element.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.getAttribute('alt')) {
        foundIssues.push(`图片 ${index + 1} 缺少alt属性`);
      }
    });

    // 检查表单标签
    const inputs = element.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const hasLabel = input.hasAttribute('aria-label') || 
                     input.hasAttribute('aria-labelledby') ||
                     element.querySelector(`label[for="${input.id}"]`);
      
      if (!hasLabel) {
        foundIssues.push(`表单元素 ${index + 1} 缺少标签`);
      }
    });

    // 检查按钮文本
    const buttons = element.querySelectorAll('button');
    buttons.forEach((button, index) => {
      const hasText = button.textContent?.trim() || 
                     button.hasAttribute('aria-label') ||
                     button.hasAttribute('aria-labelledby');
      
      if (!hasText) {
        foundIssues.push(`按钮 ${index + 1} 缺少文本或标签`);
      }
    });

    setIssues(foundIssues);
    return foundIssues;
  }, []);

  return {
    issues,
    checkAccessibility
  };
};

export default useAccessibility; 