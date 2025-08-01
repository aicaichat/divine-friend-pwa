import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccessibilityToggleProps {
  className?: string;
}

const AccessibilityToggle: React.FC<AccessibilityToggleProps> = ({ className = '' }) => {
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // 初始化时检查用户偏好
  useEffect(() => {
    const savedMode = localStorage.getItem('accessibility-mode');
    const preferAccessibility = savedMode === 'true';
    setIsAccessibilityMode(preferAccessibility);
    applyAccessibilityMode(preferAccessibility);
  }, []);

  // 应用适老化模式
  const applyAccessibilityMode = (enabled: boolean) => {
    const rootElement = document.documentElement;
    const bodyElement = document.body;
    
    if (enabled) {
      rootElement.classList.add('accessibility-mode');
      bodyElement.classList.add('accessibility-mode');
      
      // 禁用复杂动画
      rootElement.style.setProperty('--duration-lightning', '0.01s');
      rootElement.style.setProperty('--duration-fast', '0.01s');
      rootElement.style.setProperty('--duration-normal', '0.01s');
      rootElement.style.setProperty('--duration-slow', '0.01s');
      
      // 确保高对比度和文字可见性
      rootElement.style.setProperty('--text-celestial', '#000000');
      rootElement.style.setProperty('--text-mystic', '#2d2d2d');
      rootElement.style.setProperty('--text-mortal', '#4a4a4a');
      
      // 强制设置安全的文字颜色
      rootElement.style.setProperty('--safe-text-color', '#000000');
      rootElement.style.setProperty('--safe-text-light', '#333333');
      rootElement.style.setProperty('--safe-text-lighter', '#666666');
      
      console.log('✅ 适老化模式已启用');
    } else {
      rootElement.classList.remove('accessibility-mode');
      bodyElement.classList.remove('accessibility-mode');
      
      // 恢复原有动画
      rootElement.style.removeProperty('--duration-lightning');
      rootElement.style.removeProperty('--duration-fast');
      rootElement.style.removeProperty('--duration-normal');
      rootElement.style.removeProperty('--duration-slow');
      
      // 恢复原有深色背景的白色文字
      rootElement.style.setProperty('--text-celestial', '#ffffff');
      rootElement.style.setProperty('--text-mystic', 'rgba(255, 255, 255, 0.8)');
      rootElement.style.setProperty('--text-mortal', 'rgba(255, 255, 255, 0.6)');
      
      // 确保深色背景保持
      rootElement.style.setProperty('--safe-text-color', '#ffffff');
      rootElement.style.setProperty('--safe-text-light', 'rgba(255, 255, 255, 0.8)');
      rootElement.style.setProperty('--safe-text-lighter', 'rgba(255, 255, 255, 0.6)');
      
      // 强制确保深色背景
      bodyElement.style.background = 'var(--gradient-cosmic)';
      bodyElement.style.backgroundAttachment = 'fixed';
      
      console.log('✅ 标准模式已启用（文字可见性已优化）');
    }
  };

  const toggleAccessibilityMode = () => {
    const newMode = !isAccessibilityMode;
    setIsAccessibilityMode(newMode);
    localStorage.setItem('accessibility-mode', newMode.toString());
    applyAccessibilityMode(newMode);
    
    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // 音频反馈（可选）
    if (newMode) {
      console.log('🔊 切换到适老化模式');
    } else {
      console.log('🔊 切换到标准模式');
    }
  };

  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: isAccessibilityMode ? '3px solid #000000' : '2px solid rgba(255, 255, 255, 0.3)',
    background: isAccessibilityMode 
      ? 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    backdropFilter: 'blur(10px)',
    color: isAccessibilityMode ? '#000000' : '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    boxShadow: isAccessibilityMode 
      ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
      : '0 4px 20px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    outline: 'none',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  };

  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    top: '70px',
    right: '0',
    background: isAccessibilityMode ? '#ffffff' : 'rgba(0, 0, 0, 0.8)',
    color: isAccessibilityMode ? '#000000' : '#ffffff',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    border: isAccessibilityMode ? '1px solid #e0e0e0' : 'none',
  };

  return (
    <div className={className}>
      <motion.button
        style={buttonStyle}
        onClick={toggleAccessibilityMode}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        whileHover={{ 
          scale: 1.1,
          boxShadow: isAccessibilityMode 
            ? '0 6px 25px rgba(0, 0, 0, 0.4)' 
            : '0 6px 25px rgba(255, 215, 0, 0.3)'
        }}
        whileTap={{ scale: 0.95 }}
        aria-label={isAccessibilityMode ? '关闭适老化模式' : '开启适老化模式'}
        title={isAccessibilityMode ? '点击关闭适老化模式' : '点击开启适老化模式'}
      >
        {isAccessibilityMode ? '👁️' : '🔍'}
      </motion.button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            style={tooltipStyle}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {isAccessibilityMode 
              ? '💡 当前：适老化模式 (点击关闭)' 
              : '👀 点击启用适老化模式'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 屏幕阅读器专用说明 */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {isAccessibilityMode 
          ? '适老化模式已启用：大字体、高对比度、简化界面'
          : '标准模式：完整视觉效果和动画'}
      </div>
    </div>
  );
};

export default AccessibilityToggle; 