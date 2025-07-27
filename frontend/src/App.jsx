import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles.css';
import './styles/zen-design-system.css';
import './styles/world-class-design-system.css';
import './styles/professional-navigation.css';

// 移动端页面组件
import MobileHomePage from './pages/MobileHomePage';
import MobileDailyFortunePage from './pages/MobileDailyFortunePage';
import MobileBraceletPage from './pages/MobileBraceletPage';

// 原有页面组件
import HomePageOptimized from './pages/HomePageOptimized';
// 🚀 新的交互优化组件
import HomePageInteractive from './pages/HomePageInteractive';
import HomePageDemo from './pages/HomePageDemo';
import HomePageSimple from './pages/HomePageSimple';
import BaziDemoPage from './pages/BaziDemoPage';
import SettingsPage from './pages/SettingsPage';
import SettingsPageOptimized from './pages/SettingsPageOptimized';
import SettingsTestPage from './pages/SettingsTestPage';
import DailyFortuneTestPage from './pages/DailyFortuneTestPage';
import DailyFortunePageOptimized from './pages/DailyFortunePageOptimized';
import BraceletPageOptimized from './pages/BraceletPageOptimized';
import PersonalizedChatPage from './pages/PersonalizedChatPage';
import ChatPageOptimized from './pages/ChatPageOptimized';
import PersonalizedChatTestPage from './pages/PersonalizedChatTestPage';
import DeepSeekIntegrationTestPage from './pages/DeepSeekIntegrationTestPage';
import APITestPage from './pages/APITestPage';
// 🌱 新的成长页面
import NotificationTestComponent from './components/NotificationTestComponent';
import SettingsDebugWrapper from './components/SettingsDebugWrapper';
import GrowthPageOptimized from './pages/GrowthPageOptimized';


// 组件
import PersonalizedDeityFriend from './components/features/deity-friend/PersonalizedDeityFriend';
import ProfessionalBaziDisplay from './components/ProfessionalBaziDisplay';
import DayunDisplay from './components/DayunDisplay';
import DailyFortuneDisplay from './components/DailyFortuneDisplay';
import PrivacyPolicy from './components/PrivacyPolicy';

// 🌟 世界级交互和可访问性系统
import { useAccessibility } from './hooks/useAccessibilitySimple';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics } from './hooks/useAnalytics';

// 🎨 专业级导航图标系统
import { NavigationIcons } from './components/icons/NavigationIcons';

function App() {
  const [currentPage, setCurrentPage] = useState('today');
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageTransition, setPageTransition] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);


  // 🎯 可访问性增强
  const accessibility = useAccessibility({
    enableKeyboardNav: true,
    focusIndicators: true,
    colorContrastEnhancement: true
  });

  // 📊 分析追踪
  const analytics = useAnalytics();

  // 检测是否为移动设备
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // 从URL参数获取页面
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    if (page) {
      setCurrentPage(page);
      // 追踪页面访问
      analytics.trackPageView(page, getPageTitle(page));
    } else {
      // 默认跳转到今日页面
      setCurrentPage('today');
      analytics.trackPageView('today', '今日运势');
    }
  }, [analytics]);

  // 应用初始化
  useEffect(() => {
    const initApp = async () => {
      // 检查隐私政策接受状态
      // const privacyAccepted = localStorage.getItem('privacyPolicyAccepted');
      // if (!privacyAccepted) {
      //   setShowPrivacyPolicy(true);
      // }
      
      // 模拟初始化过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };

    initApp();

    // 性能监控
    if ('performance' in window && 'navigation' in performance) {
      const navTiming = performance.getEntriesByType('navigation')[0];
      console.log('🚀 应用加载性能:', {
        loadTime: navTiming.loadEventEnd - navTiming.loadEventStart,
        domComplete: navTiming.domComplete - navTiming.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
      });
    }


  }, []);

    // 页面切换处理（带过渡动画）
  const handleNavigate = (page) => {
    if (page === currentPage) return;

    setPageTransition(true);
    accessibility.announce(`正在跳转到${getPageTitle(page)}`);
    
    // 追踪页面切换
    analytics.trackUserAction('page_navigation', {
      from: currentPage,
      to: page,
      title: getPageTitle(page)
    });
    
    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    setTimeout(() => {
      setCurrentPage(page);
      window.history.pushState({}, '', `?page=${page}`);
      setPageTransition(false);

      // 追踪新页面访问
      analytics.trackPageView(page, getPageTitle(page));

      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  // 获取页面标题
  const getPageTitle = (pageId) => {
    const titles = {
      today: '今日运势',
      treasure: '我的法宝',
      oracle: '问仙对话',
      growth: '修行成长',
      profile: '个人中心'
    };
    return titles[pageId] || '神仙朋友';
  };

  // 🌟 全新的页面架构设计
  const corePages = {
    // 💫 今日 - 每日运势、指引、任务
    today: <HomePageSimple onNavigate={handleNavigate} />,
    'daily-fortune': <DailyFortunePageOptimized onNavigate={handleNavigate} />,
    
    // 📿 法宝 - 手串管理、功德系统、修行记录
    treasure: <BraceletPageOptimized onNavigate={handleNavigate} />,
    
    // 🧘 问仙 - 智能对话、命理咨询、占卜求签
    oracle: <ChatPageOptimized onNavigate={handleNavigate} />,
    'bazi-analysis': <BaziDemoPage onNavigate={handleNavigate} />,
    
    // 🌱 成长 - 经文学习、跟读视频、修行历程
    growth: <GrowthPageOptimized onNavigate={handleNavigate} />,
    
    // 👤 我的 - 个人设置、账户管理、帮助中心
    profile: <SettingsPageOptimized onNavigate={handleNavigate} />,
    
    // 🎯 兼容旧版页面路由
    home: <HomePageSimple onNavigate={handleNavigate} />,
    'home-interactive': <HomePageInteractive onNavigate={handleNavigate} />,
    'home-demo': <HomePageDemo onNavigate={handleNavigate} />,
    'home-old': <MobileHomePage onNavigate={handleNavigate} />,
    'daily-fortune-old': <MobileDailyFortunePage onNavigate={handleNavigate} />,
    'deity-chat': <ChatPageOptimized onNavigate={handleNavigate} />,
    'deity-chat-old': <PersonalizedChatPage onNavigate={handleNavigate} />,
    bracelet: <BraceletPageOptimized onNavigate={handleNavigate} />,
    'bracelet-old': <MobileBraceletPage onNavigate={handleNavigate} />,
    settings: <SettingsPageOptimized onNavigate={handleNavigate} />,
    'settings-old': <SettingsPage onNavigate={handleNavigate} />,
    'bazi-demo': <BaziDemoPage onNavigate={handleNavigate} />,
    'settings-test': <SettingsTestPage onNavigate={handleNavigate} />,
    'daily-fortune-test': <DailyFortuneTestPage onNavigate={handleNavigate} />,
    'personalized-chat': <PersonalizedChatPage onNavigate={handleNavigate} />,
    'personalized-chat-test': <PersonalizedChatTestPage onNavigate={handleNavigate} />,
    'free-chat': <PersonalizedChatPage onNavigate={handleNavigate} />,
    'deepseek-test': <DeepSeekIntegrationTestPage onNavigate={handleNavigate} />,
    'api-test': <APITestPage onNavigate={handleNavigate} />
  };

  const pages = corePages;

  // 🎨 专业级底部导航设计 - 融合传统文化与现代美学
  const navigationItems = [
    {
      id: 'today',
      Icon: NavigationIcons.TodayIcon,
      label: '今日',
      description: '运势指引',
      color: '#2C1810',
      activeColor: '#D4AF37'
    },
    {
      id: 'treasure',
      Icon: NavigationIcons.TreasureIcon,
      label: '法宝',
      description: '手串功德',
      color: '#2C1810',
      activeColor: '#D4AF37'
    },
    {
      id: 'oracle',
      Icon: NavigationIcons.OracleIcon,
      label: '问仙',
      description: '智慧对话',
      color: '#2C1810',
      activeColor: '#D4AF37'
    },
    {
      id: 'growth',
      Icon: NavigationIcons.GrowthIcon,
      label: '成长',
      description: '修行学习',
      color: '#2C1810',
      activeColor: '#D4AF37'
    },
    {
      id: 'profile',
      Icon: NavigationIcons.ProfileIcon,
      label: '我的',
      description: '个人中心',
      color: '#2C1810',
      activeColor: '#D4AF37'
    }
  ];

  // 加载界面
  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ background: 'var(--bg-primary)' }}
        {...accessibility.getAriaProps({ live: 'polite' })}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            className="text-6xl mb-6"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }}
          >
            🙏
          </motion.div>
          
          <motion.h1
            className="text-2xl font-bold text-white mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            神仙朋友
          </motion.h1>
          
          <motion.p
            className="text-neutral-400 text-sm"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            正在为您准备专属的修行体验...
          </motion.p>
          
          {/* 加载进度条 */}
          <motion.div
            className="w-48 h-1 bg-neutral-700 rounded-full mt-6 mx-auto overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              className="h-full bg-gradient-brand rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div 
        className={`zen-app ${isMobile ? 'mobile' : 'desktop'}`}
        {...accessibility.keyboardNavigation.containerRef}
      >
        {/* 🌟 全新的头部设计 */}
        <motion.header 
          className={`zen-header-redesign ${isMobile ? 'mobile' : 'desktop'}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="zen-header-content">
            {/* 品牌区域 */}
            <motion.div 
              className="zen-brand-redesign"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="zen-brand-icon-wrapper">
                <span className="zen-brand-icon">🙏</span>
                <div className="zen-brand-glow"></div>
              </div>
              <div className="zen-brand-info">
                <span className="zen-brand-text">神仙朋友</span>
                <span className="zen-brand-subtitle">AI修行伴侣</span>
              </div>
            </motion.div>
            
            {/* 状态区域 */}
            <motion.div 
              className="zen-status-redesign"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="zen-time-display">
                {new Date().toLocaleTimeString('zh-CN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="zen-date-display">
                {new Date().toLocaleDateString('zh-CN', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </motion.div>
          </div>
          
          {/* 动态背景效果 */}
          <div className="zen-header-bg">
            <motion.div 
              className="zen-particle zen-particle-1"
              animate={{ 
                y: [0, -10, 0],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
            />
            <motion.div 
              className="zen-particle zen-particle-2"
              animate={{ 
                y: [0, -15, 0],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: 'easeInOut',
                delay: 1
              }}
            />
            <motion.div 
              className="zen-particle zen-particle-3"
              animate={{ 
                y: [0, -8, 0],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: 'easeInOut',
                delay: 0.5
              }}
            />
          </div>
        </motion.header>

        {/* 主要内容区域 */}
        <main 
          className="zen-main-content-redesign"
          id="main-content"
          {...accessibility.getAriaProps({ 
            label: `当前页面: ${getPageTitle(currentPage)}`,
            live: 'polite'
          })}
        >
          <div className="zen-page-container-redesign">
            <AnimatePresence mode="wait">
              {!pageTransition && (
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 1.05 }}
                  transition={{ 
                    duration: 0.3, 
                    ease: accessibility.state.reducedMotion ? 'linear' : 'easeInOut'
                  }}
                >
                  {pages[currentPage] || pages.today}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* 页面切换加载状态 */}
            <AnimatePresence>
              {pageTransition && (
                <motion.div
                  className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="text-center text-white"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                  >
                    <motion.div
                      className="text-3xl mb-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      🌟
                    </motion.div>
                    <p className="text-sm">切换页面中...</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* 🎨 专业级底部导航栏 */}
        <motion.nav 
          className="professional-nav"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
          {...accessibility.getAriaProps({ 
            label: '主导航',
            role: 'navigation'
          })}
        >
          <div className="professional-nav__content">
            {navigationItems.map((item, index) => {
              const isActive = currentPage === item.id;
              const { Icon } = item;
              
              const ariaProps = accessibility.getAriaProps({
                label: `${item.label} - ${item.description}`,
                selected: isActive
              });
              
              return (
                <motion.button
                  key={item.id}
                  className={`professional-nav__item ${isActive ? 'professional-nav__item--active' : ''}`}
                  onClick={() => handleNavigate(item.id)}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ 
                    delay: 0.4 + index * 0.1, 
                    duration: 0.4,
                    ease: 'easeOut'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  {...ariaProps}
                >
                  {/* 活跃指示器 */}
                  <div className="professional-nav__indicator"></div>
                  
                  {/* 图标 */}
                  <div className="professional-nav__icon">
                    <Icon 
                      size={24} 
                      color={isActive ? 'white' : item.color}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                  </div>
                  
                  {/* 标签 */}
                  <div className="professional-nav__label">
                    {item.label}
                  </div>
                  
                  {/* 波纹效果 */}
                  <div className="professional-nav__ripple"></div>
                </motion.button>
              );
            })}
          </div>
        </motion.nav>

        {/* 路由配置 */}
        <Routes>
          <Route path="/" element={<Navigate to="/?page=today" replace />} />
          <Route path="/today" element={<HomePageSimple onNavigate={handleNavigate} />} />
          <Route path="/treasure" element={<BraceletPageOptimized onNavigate={handleNavigate} />} />
          <Route path="/oracle" element={<ChatPageOptimized onNavigate={handleNavigate} />} />
          <Route path="/growth" element={<GrowthPageOptimized onNavigate={handleNavigate} />} />
          <Route path="/profile" element={<SettingsDebugWrapper onNavigate={handleNavigate} />} />
          
          {/* 兼容旧版路由 */}
          <Route path="/home" element={<HomePageSimple onNavigate={handleNavigate} />} />
          <Route path="/home-interactive" element={<HomePageInteractive onNavigate={handleNavigate} />} />
          <Route path="/home-demo" element={<HomePageDemo onNavigate={handleNavigate} />} />
          <Route path="/home-old" element={isMobile ? <MobileHomePage onNavigate={handleNavigate} /> : <HomePageOptimized onNavigate={handleNavigate} />} />
          <Route path="/daily-fortune" element={<DailyFortunePageOptimized onNavigate={handleNavigate} />} />
          <Route path="/daily-fortune-old" element={<MobileDailyFortunePage onNavigate={handleNavigate} />} />
          <Route path="/deity-chat" element={<ChatPageOptimized onNavigate={handleNavigate} />} />
          <Route path="/deity-chat-old" element={<PersonalizedChatPage onNavigate={handleNavigate} />} />
          <Route path="/bracelet" element={<BraceletPageOptimized onNavigate={handleNavigate} />} />
          <Route path="/bracelet-old" element={<MobileBraceletPage onNavigate={handleNavigate} />} />
          <Route path="/bazi-demo" element={<BaziDemoPage onNavigate={handleNavigate} />} />
          <Route path="/bazi-analysis" element={<BaziDemoPage onNavigate={handleNavigate} />} />
          <Route path="/settings" element={<SettingsDebugWrapper onNavigate={handleNavigate} />} />
          <Route path="/settings-old" element={<SettingsPage onNavigate={handleNavigate} />} />
          <Route path="/settings-test" element={<SettingsTestPage onNavigate={handleNavigate} />} />
          <Route path="/daily-fortune-test" element={<DailyFortuneTestPage onNavigate={handleNavigate} />} />
          <Route path="/personalized-chat" element={<PersonalizedChatPage onNavigate={handleNavigate} />} />
          <Route path="/personalized-chat-test" element={<PersonalizedChatTestPage onNavigate={handleNavigate} />} />
          <Route path="/free-chat" element={<PersonalizedChatPage onNavigate={handleNavigate} />} />
          <Route path="/deepseek-test" element={<DeepSeekIntegrationTestPage onNavigate={handleNavigate} />} />
          <Route path="/api-test" element={<APITestPage onNavigate={handleNavigate} />} />
          <Route path="/notification-test" element={<NotificationTestComponent onNavigate={handleNavigate} />} />
        </Routes>

        {/* 🔊 无障碍公告区域 */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          {...accessibility.getAriaProps({ live: 'polite' })}
        >
          {accessibility.announcements.map((announcement, index) => (
            <div key={index}>{announcement}</div>
          ))}
        </div>



        {/* 🔒 隐私政策模态框 */}
        <AnimatePresence>
          {showPrivacyPolicy && (
            <motion.div
              className="zen-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(10px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--zen-space-lg)'
              }}
            >
              <motion.div
                className="zen-modal-content"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                style={{
                  background: 'var(--zen-bg-card)',
                  borderRadius: 'var(--zen-radius-xl)',
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  overflow: 'hidden',
                  boxShadow: 'var(--zen-shadow-2xl)',
                  border: '1px solid var(--zen-border-subtle)'
                }}
              >
                <PrivacyPolicy 
                  showActions={true}
                  onAccept={() => {
                    localStorage.setItem('privacyPolicyAccepted', 'true');
                    setShowPrivacyPolicy(false);
                  }}
                  onDecline={() => {
                    // 用户拒绝隐私政策，可以选择退出应用
                    alert('您需要接受隐私政策才能使用本应用');
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App; 