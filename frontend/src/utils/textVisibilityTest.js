// 🔧 文字可见性测试工具
// 帮助检测和验证文字可见性修复是否生效

export const TextVisibilityTest = {
  
  // 检测所有可能的文字可见性问题
  detectWhiteTextIssues() {
    const issues = [];
    const elements = document.querySelectorAll('*');
    
    elements.forEach((el, index) => {
      const style = window.getComputedStyle(el);
      const textColor = style.color;
      const backgroundColor = style.backgroundColor;
      const text = el.textContent?.trim();
      
      if (text && text.length > 0) {
        // 检测白色文字在白色背景上
        if (textColor.includes('rgb(255, 255, 255)') || textColor.includes('#ffffff') || textColor.includes('white')) {
          if (backgroundColor.includes('rgb(255, 255, 255)') || backgroundColor.includes('#ffffff') || backgroundColor.includes('white')) {
            issues.push({
              element: el,
              issue: 'white_text_on_white_background',
              textColor,
              backgroundColor,
              text: text.substring(0, 50),
              selector: this.getElementSelector(el)
            });
          }
        }
        
        // 检测黑色文字在深色背景上
        if (textColor.includes('rgb(0, 0, 0)') || textColor.includes('#000000') || textColor.includes('black') || 
            textColor.includes('rgb(45, 45, 45)') || textColor.includes('#2d2d2d')) {
          if (backgroundColor.includes('rgb(0, 0, 0)') || backgroundColor.includes('#000000') || backgroundColor.includes('black') ||
              backgroundColor === 'transparent' || backgroundColor === 'rgba(0, 0, 0, 0)') {
            // 检查父元素是否有深色背景
            let hasDeepBg = false;
            let parent = el.parentElement;
            while (parent && parent !== document.body) {
              const parentBg = window.getComputedStyle(parent).backgroundColor;
              if (parentBg.includes('rgb(') && !parentBg.includes('255, 255, 255')) {
                hasDeepBg = true;
                break;
              }
              parent = parent.parentElement;
            }
            
            // 检查body背景
            const bodyBg = window.getComputedStyle(document.body).background;
            if (bodyBg.includes('gradient') || bodyBg.includes('linear-gradient') || bodyBg.includes('radial-gradient')) {
              hasDeepBg = true;
            }
            
            if (hasDeepBg) {
              issues.push({
                element: el,
                issue: 'dark_text_on_dark_background',
                textColor,
                backgroundColor,
                text: text.substring(0, 50),
                selector: this.getElementSelector(el)
              });
            }
          }
        }
      }
    });
    
    return issues;
  },
  
  // 生成元素选择器
  getElementSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  },
  
  // 验证修复是否生效
  verifyFixes() {
    console.log('🔍 开始文字可见性验证...');
    
    const results = {
      passed: true,
      issues: [],
      summary: {}
    };
    
    // 检测文字可见性问题
    const textIssues = this.detectWhiteTextIssues();
    if (textIssues.length > 0) {
      results.passed = false;
      results.issues.push(...textIssues);
    }
    
    // 检测背景问题
    const backgroundIssues = this.detectBackgroundIssues();
    if (backgroundIssues.length > 0) {
      results.passed = false;
      results.issues.push(...backgroundIssues);
    }
    
    // 检查CSS变量是否正确设置
    const rootStyle = window.getComputedStyle(document.documentElement);
    const zenTextPrimary = rootStyle.getPropertyValue('--zen-text-primary').trim();
    const safeTextColor = rootStyle.getPropertyValue('--safe-text-color').trim();
    
    results.summary = {
      textVisibilityIssues: textIssues.length,
      zenTextPrimary,
      safeTextColor,
      accessibilityMode: document.documentElement.classList.contains('accessibility-mode'),
      bodyBackground: window.getComputedStyle(document.body).background.substring(0, 100)
    };
    
    // 输出结果
    if (results.passed) {
      console.log('✅ 文字可见性验证通过！');
      console.log('📊 摘要:', results.summary);
    } else {
      console.warn('⚠️ 发现文字可见性问题:', results.issues);
      console.log('📊 摘要:', results.summary);
    }
    
    return results;
  },
  
  // 检测背景问题
  detectBackgroundIssues() {
    const issues = [];
    const bodyStyle = window.getComputedStyle(document.body);
    const bodyBg = bodyStyle.backgroundColor;
    
    // 检测body背景是否为白色
    if (bodyBg.includes('rgb(255, 255, 255)') || bodyBg.includes('#ffffff') || bodyBg === 'white') {
      issues.push({
        element: document.body,
        issue: 'white_body_background',
        currentBackground: bodyBg,
        expectedBackground: 'gradient or dark color'
      });
    }
    
    return issues;
  },

  // 应用紧急修复
  applyEmergencyFix() {
    console.log('🚨 应用紧急文字可见性和背景修复...');
    
    const style = document.createElement('style');
    style.id = 'emergency-fix';
    style.textContent = `
      /* 紧急背景修复 */
      html, body {
        background: linear-gradient(135deg, #0F1419 0%, #1A1B26 50%, #2D2E3F 100%) !important;
        background-attachment: fixed !important;
        color: #ffffff !important;
      }
      
      /* 紧急文字可见性修复 */
      body * {
        color: #ffffff !important;
      }
      
      /* 卡片和组件使用半透明背景 */
      .zen-card, .card, .modal-content {
        background: rgba(255, 255, 255, 0.1) !important;
        color: #ffffff !important;
      }
      
      /* 适老化模式保护 */
      .accessibility-mode html,
      .accessibility-mode body {
        background: #ffffff !important;
        color: #000000 !important;
      }
      
      .accessibility-mode * {
        color: #000000 !important;
      }
    `;
    
    // 移除旧的紧急修复
    const oldFix = document.getElementById('emergency-fix');
    if (oldFix) oldFix.remove();
    
    document.head.appendChild(style);
    
    // 直接设置body样式作为双重保险
    document.body.style.background = 'linear-gradient(135deg, #0F1419 0%, #1A1B26 50%, #2D2E3F 100%)';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.color = '#ffffff';
    
    console.log('✅ 紧急背景和文字修复已应用');
  },

  // 应用深色主题强制修复
  forceDarkTheme() {
    console.log('🌙 强制应用深色主题...');
    
    document.documentElement.classList.add('force-dark-theme');
    document.body.classList.add('force-dark-theme');
    
    // 设置CSS变量
    document.documentElement.style.setProperty('--gradient-cosmic', 'linear-gradient(135deg, #0F1419 0%, #1A1B26 50%, #2D2E3F 100%)');
    document.documentElement.style.setProperty('--text-celestial', '#ffffff');
    
    console.log('✅ 深色主题强制应用完成');
  },
  
  // 移除紧急修复
  removeEmergencyFix() {
    const fix = document.getElementById('emergency-fix');
    if (fix) {
      fix.remove();
      console.log('✅ 紧急修复已移除');
    }
    
    // 移除强制类
    document.documentElement.classList.remove('force-dark-theme');
    document.body.classList.remove('force-dark-theme');
    
    // 清除直接设置的样式
    document.body.style.removeProperty('background');
    document.body.style.removeProperty('background-attachment');
    document.body.style.removeProperty('color');
  },
  
  // 生成测试报告
  generateReport() {
    const results = this.verifyFixes();
    
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      results,
      recommendations: []
    };
    
    if (!results.passed) {
      report.recommendations.push('应用紧急修复: TextVisibilityTest.applyEmergencyFix()');
      report.recommendations.push('强制深色主题: TextVisibilityTest.forceDarkTheme()');
      report.recommendations.push('强制刷新页面清除缓存 (Ctrl+Shift+R)');
      report.recommendations.push('检查 background-fix.css 和 text-visibility-fix.css 是否正确加载');
    }
    
    console.log('📋 文字可见性测试报告:', report);
    return report;
  },
  
  // 自动测试所有页面
  async testAllPages(pages = ['today', 'treasure', 'oracle', 'growth', 'fortune', 'profile']) {
    console.log('🔄 开始测试所有页面的文字可见性...');
    
    const results = {};
    
    for (const page of pages) {
      console.log(`📄 测试页面: ${page}`);
      
      // 模拟导航到页面（如果有导航函数）
      if (window.navigateToPage) {
        window.navigateToPage(page);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待页面加载
      }
      
      results[page] = this.verifyFixes();
    }
    
    console.log('📊 所有页面测试完成:', results);
    return results;
  }
};

// 全局暴露测试工具
if (typeof window !== 'undefined') {
  window.TextVisibilityTest = TextVisibilityTest;
  
  // 页面加载完成后自动运行一次检测
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      console.log('🔍 自动运行文字可见性检测...');
      TextVisibilityTest.verifyFixes();
    }, 2000);
  });
}

export default TextVisibilityTest; 