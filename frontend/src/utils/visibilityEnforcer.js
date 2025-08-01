/**
 * 🔧 强制可见性修复工具 - 确保用户中心页面所有文字都可见
 */

class VisibilityEnforcer {
  constructor() {
    this.isEnabled = !document.body.classList.contains('accessibility-mode');
    this.observer = null;
    this.init();
  }

  init() {
    if (!this.isEnabled) return;
    
    // 立即修复
    this.forceVisibility();
    
    // 设置观察器监听DOM变化
    this.setupMutationObserver();
    
    // 每500ms检查一次
    setInterval(() => this.forceVisibility(), 500);
    
    console.log('🔧 可见性强制修复器已启动');
  }

  forceVisibility() {
    try {
      // 修复所有灰色文字
      this.fixGrayText();
      
      // 修复所有灰色背景
      this.fixGrayBackgrounds();
      
      // 修复用户中心特定元素
      this.fixUserCenterElements();
      
      // 修复任何颜色为灰色或接近背景色的元素
      this.fixLowContrastElements();
      
    } catch (error) {
      console.warn('可见性修复出错:', error);
    }
  }

  fixGrayText() {
    // 修复所有灰色文字类
    const grayTextSelectors = [
      '.text-gray-900', '.text-gray-800', '.text-gray-700', 
      '.text-gray-600', '.text-gray-500', '.text-gray-400', '.text-gray-300'
    ];
    
    grayTextSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        if (!this.isInWhiteContainer(element)) {
          element.style.setProperty('color', 'rgba(255, 255, 255, 0.95)', 'important');
          element.style.setProperty('text-shadow', '0 1px 3px rgba(0, 0, 0, 0.6)', 'important');
        }
      });
    });
  }

  fixGrayBackgrounds() {
    const grayBgSelectors = [
      '.bg-gray-50', '.bg-gray-100', '.bg-gray-200', '.bg-gray-300'
    ];
    
    grayBgSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        element.style.setProperty('background-color', 'rgba(255, 255, 255, 0.15)', 'important');
        element.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.25)', 'important');
        element.style.setProperty('backdrop-filter', 'blur(15px) saturate(180%)', 'important');
      });
    });
  }

  fixUserCenterElements() {
    // 修复设置页面的特定元素
    document.querySelectorAll('[class*="space-y"] > *').forEach(element => {
      if (!this.isInWhiteContainer(element)) {
        element.style.setProperty('background', 'rgba(255, 255, 255, 0.08)', 'important');
        element.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.15)', 'important');
        element.style.setProperty('border-radius', '12px', 'important');
      }
    });

    // 修复所有文字颜色
    document.querySelectorAll('span, p, div, label').forEach(element => {
      if (!this.isInWhiteContainer(element) && this.hasLowContrast(element)) {
        element.style.setProperty('color', 'rgba(255, 255, 255, 0.9)', 'important');
      }
    });

    // 修复箭头
    document.querySelectorAll('*').forEach(element => {
      if (element.textContent === '→' && !this.isInWhiteContainer(element)) {
        element.style.setProperty('color', 'rgba(255, 255, 255, 0.8)', 'important');
        element.style.setProperty('font-size', '1.3em', 'important');
      }
    });
  }

  fixLowContrastElements() {
    document.querySelectorAll('*').forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      
      // 检查是否是低对比度的灰色
      if (this.isLowContrastGray(color) && !this.isInWhiteContainer(element)) {
        element.style.setProperty('color', 'rgba(255, 255, 255, 0.9)', 'important');
        element.style.setProperty('text-shadow', '0 1px 2px rgba(0, 0, 0, 0.5)', 'important');
      }
    });
  }

  isInWhiteContainer(element) {
    let current = element;
    while (current && current !== document.body) {
      const bg = window.getComputedStyle(current).backgroundColor;
      if (bg.includes('255, 255, 255') && !bg.includes('0.')) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  hasLowContrast(element) {
    const style = window.getComputedStyle(element);
    const color = style.color;
    
    // 检查是否是灰色系颜色
    return this.isLowContrastGray(color);
  }

  isLowContrastGray(colorString) {
    if (!colorString) return false;
    
    // 解析RGB值
    const rgbMatch = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!rgbMatch) return false;
    
    const [, r, g, b] = rgbMatch.map(Number);
    
    // 如果是灰色系且亮度较低，则认为是低对比度
    const isGrayish = Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30;
    const isLowBrightness = (r + g + b) / 3 < 160;
    
    return isGrayish && isLowBrightness;
  }

  setupMutationObserver() {
    this.observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldCheck = true;
        }
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          shouldCheck = true;
        }
      });
      
      if (shouldCheck) {
        setTimeout(() => this.forceVisibility(), 100);
      }
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// 导出工具类
window.VisibilityEnforcer = VisibilityEnforcer;

// 在页面加载完成后自动启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new VisibilityEnforcer();
  });
} else {
  new VisibilityEnforcer();
}

export default VisibilityEnforcer; 