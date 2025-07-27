import React, { useEffect, useState, useCallback, useRef } from 'react';

// === 🎯 可访问性增强系统 ===

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
  voiceControl: boolean;
  
  // 当前状态
  focusVisible: boolean;
  announcements: string[];
}

interface AccessibilityConfig {
  // 自动功能
  autoFocus?: boolean;
  skipLinks?: boolean;
  landmarkNavigation?: boolean;
  
  // 键盘导航
  enableKeyboardNav?: boolean;
  focusTrapEnabled?: boolean;
  
  // 声音反馈
  audioDescriptions?: boolean;
  soundFeedback?: boolean;
  
  // 视觉辅助
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
    largeText: window.matchMedia('(prefers-font-size: large)').matches,
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    screenReader: !!(navigator as any).userAgent.match(/(JAWS|NVDA|ORCA|VoiceOver|TalkBack)/i) ||
                  'speechSynthesis' in window,
    keyboardNavigation: !('ontouchstart' in window),
    voiceControl: 'speechRecognition' in window || 'webkitSpeechRecognition' in window
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
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]'
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

    const { key, shiftKey, ctrlKey, altKey } = event;
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
        // 失去焦点，返回父容器
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

// 🔒 焦点陷阱
export const useFocusTrap = (active: boolean = false) => {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    previousFocusRef.current = document.activeElement as HTMLElement;

    // 获取容器内的可聚焦元素
    const focusableElements = container.querySelectorAll(
      'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return;

    // 聚焦第一个元素
    focusableElements[0].focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
    };
  }, [active]);

  return containerRef;
};

// 📢 屏幕阅读器公告
export const useScreenReaderAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const announcementRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!message.trim()) return;

    setAnnouncements(prev => [...prev, message]);

    // 创建临时的live region
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
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
    announcements,
    announcementRef
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
    voiceControl: false,
    focusVisible: false,
    announcements: []
  });

  const keyboardNav = useKeyboardNavigation(config.enableKeyboardNav !== false);
  const focusTrap = useFocusTrap(config.focusTrapEnabled);
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

  // 跳转链接生成器
  const createSkipLink = useCallback((targetId: string, label: string) => {
    return {
      href: `#${targetId}`,
      className: 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-brand-primary-500 focus:text-white focus:rounded-md',
      onClick: () => {
        const target = document.getElementById(targetId);
        if (target) {
          target.focus();
          announce(`跳转到${label}`);
        }
      },
      children: `跳转到${label}`
    };
  }, [announce]);

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

  // 高对比度样式类
  const getContrastClasses = useCallback((baseClasses: string = '') => {
    if (!state.highContrast) return baseClasses;
    
    return `${baseClasses} high-contrast:border-2 high-contrast:border-white high-contrast:bg-black high-contrast:text-white`;
  }, [state.highContrast]);

  // 动画控制
  const getAnimationClasses = useCallback((animationClasses: string = '') => {
    if (state.reducedMotion) return '';
    return animationClasses;
  }, [state.reducedMotion]);

  // 字体大小调整
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

  // 触摸目标大小确保
  const getTouchTargetClasses = useCallback((baseClasses: string = '') => {
    if (!state.touchSupport) return baseClasses;
    
    // 确保触摸目标至少44x44px
    return `${baseClasses} min-h-[44px] min-w-[44px]`;
  }, [state.touchSupport]);

  return {
    // 状态
    state,
    
    // 导航
    keyboardNavigation: keyboardNav,
    focusTrap,
    
    // 屏幕阅读器
    announce,
    clearAnnouncements,
    announcements,
    
    // 工具函数
    createSkipLink,
    getAriaProps,
    getContrastClasses,
    getAnimationClasses,
    getFontSizeClasses,
    getTouchTargetClasses,
    
    // 配置
    config
  };
};

// 🛠️ 实用工具组件
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

export const VisuallyHidden: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement('span', {
    className: 'absolute overflow-hidden whitespace-nowrap border-0',
    style: { 
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0
    }
  }, children);
};

export const FocusVisible: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return React.createElement('div', {
    className: `focus-visible:outline-2 focus-visible:outline-brand-primary-500 focus-visible:outline-offset-2 ${className}`
  }, children);
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

    // 检查标题层级
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        foundIssues.push(`标题 ${index + 1} 层级跳跃（从H${lastLevel}到H${level}）`);
      }
      lastLevel = level;
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