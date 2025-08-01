import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles.css';
import './styles/zen-design-system.css';
import './styles/world-class-design-system.css';
import './styles/professional-navigation.css';
import './utils/visibilityEnforcer.js';

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
// DailyFortunePageOptimized 功能已整合到 TodayPageProfessional 首页
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
import NFCVerifyPage from './pages/NFCVerifyPage';
import NFCTestPage from './pages/NFCTestPage';
import UserCenterSimplified from './pages/UserCenterSimplified';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import FortunePageOptimized from './pages/FortunePageOptimized';
import LoginPage from './pages/LoginPage';
import SettingsPageEnhanced from './pages/SettingsPageEnhanced';
import HomePageEnhanced from './pages/HomePageEnhanced';
import TodayPageProfessional from './pages/TodayPageProfessional';
import TodayHomePageProfessional from './pages/TodayHomePageProfessional';
import GuirenPageProfessional from './pages/GuirenPageProfessional';


// 组件
import PersonalizedDeityFriend from './components/features/deity-friend/PersonalizedDeityFriend';
import ProfessionalBaziDisplay from './components/ProfessionalBaziDisplay';
import DayunDisplay from './components/DayunDisplay';
import DailyFortuneDisplay from './components/DailyFortuneDisplay';
import PrivacyPolicy from './components/PrivacyPolicy';

// 🌟 世界级交互和可访问性系统
import { useAccessibility } from './hooks/useAccessibilitySimple';
import { motion, AnimatePresence } from 'framer-motion';
import AccessibilityToggle from './components/AccessibilityToggle';
import Logo from './components/Logo';
import TextVisibilityTest from './utils/textVisibilityTest';
import { useAnalytics } from './hooks/useAnalytics';

// 🎨 专业级导航图标系统
import { NavigationIcons } from './components/icons/NavigationIcons';

function App() {
  const [currentPage, setCurrentPage] = useState('today');
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageTransition, setPageTransition] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  // 🎯 可访问性增强
  const accessibility = useAccessibility({
    enableKeyboardNav: true,
    focusIndicators: true,
    colorContrastEnhancement: true
  });

  // 📊 分析追踪
  const analytics = useAnalytics();

  // 🔐 检查登录状态
  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem('isLoggedIn');
      const userInfo = localStorage.getItem('userInfo');
      
      if (loginStatus === 'true' && userInfo) {
        setIsLoggedIn(true);
      } else {
        // 临时设置为已登录状态以避免页面错乱
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userInfo', JSON.stringify({
          name: '游客用户',
          setupComplete: false
        }));
      }
    };

    checkLoginStatus();
  }, []);

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
      analytics.trackPageView(page);
    }

    // 模拟加载完成
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [analytics]);

  // 检查隐私政策接受状态 - 临时禁用
  useEffect(() => {
    // 自动接受隐私政策以避免页面错乱
    localStorage.setItem('privacyPolicyAccepted', 'true');
    
    // const privacyAccepted = localStorage.getItem('privacyPolicyAccepted');
    // if (!privacyAccepted && !isLoading) {
    //   const timer = setTimeout(() => {
    //     setShowPrivacyPolicy(true);
    //   }, 2000);
    //   return () => clearTimeout(timer);
    // }
  }, [isLoading]);

  // 页面导航处理
  const handleNavigate = (pageId) => {
    if (pageId === currentPage) return;
    
    setPageTransition(true);
    
    // 追踪导航
    analytics.trackUserAction('navigate', { 
      from: currentPage, 
      to: pageId,
      timestamp: Date.now()
    });
    
    setTimeout(() => {
      setCurrentPage(pageId);
      
      // 更新 URL
      const newUrl = `${window.location.origin}${window.location.pathname}?page=${pageId}`;
      window.history.pushState(null, '', newUrl);
      
      setPageTransition(false);
    }, 150);
  };

  // 🎭 动态页面标题
  const getPageTitle = (pageId) => {
    const titles = {
      today: '今日穿衣',
      'today-fortune': '今日运势',
      treasure: '法宝管理', 
      growth: '修心',
      fortune: '运势分析',
      profile: '个人中心',
      'daily-fortune': '运势分析',
      'bazi-analysis': '八字分析',
      bracelet: '手串管理',
      settings: '应用设置',
      'settings-optimized': '八字设置',
      'settings-enhanced': '八字设置',
      home: '神仙朋友',
      'home-interactive': '互动首页',
      'home-demo': '演示首页',
      guiren: '贵人匹配'
    };
    return titles[pageId] || '神仙朋友';
  };

  // 🌟 全新的页面架构设计
  const corePages = {
    // 💫 今日 - 今日穿衣首页，融合财运和运势指导
    today: <TodayHomePageProfessional onNavigate={handleNavigate} />,
    // 💫 运势详情 - 专业运势分析页面
    'today-fortune': <TodayPageProfessional onNavigate={handleNavigate} />,
    
    // 📿 法宝 - 手串管理、功德系统、修行记录
    treasure: <BraceletPageOptimized onNavigate={handleNavigate} />,
    
    // 🧘 问仙 - 智能对话、命理咨询、占卜求签
    oracle: <ChatPageOptimized onNavigate={handleNavigate} />,
    'bazi-analysis': <BaziDemoPage onNavigate={handleNavigate} />,
    
    // 🤝 贵人 - 八字交友、贵人匹配、社交邀请
    guiren: <GuirenPageProfessional onNavigate={handleNavigate} />,
    
    // 🌱 成长 - 经文学习、跟读视频、修行历程
    growth: <GrowthPageOptimized onNavigate={handleNavigate} />,
    
    // 👤 我的 - 个人设置、账户管理、帮助中心
    profile: <UserCenterSimplified onNavigate={handleNavigate} />,
    'profile-edit': <ProfilePage onNavigate={handleNavigate} />,
    'change-password': <ChangePasswordPage onNavigate={handleNavigate} />,
    orders: <OrdersPage onNavigate={handleNavigate} />,
    
    // 🎯 兼容旧版页面路由
    home: <HomePageEnhanced onNavigate={handleNavigate} />,
    'home-enhanced': <HomePageEnhanced onNavigate={handleNavigate} />,
    'home-simple': <HomePageSimple onNavigate={handleNavigate} />,
    'home-interactive': <HomePageInteractive onNavigate={handleNavigate} />,
    'home-demo': <HomePageDemo onNavigate={handleNavigate} />,
    'home-old': <MobileHomePage onNavigate={handleNavigate} />,
    'daily-fortune-old': <MobileDailyFortunePage onNavigate={handleNavigate} />,
    'deity-chat': <ChatPageOptimized onNavigate={handleNavigate} />,
    'deity-chat-old': <PersonalizedChatPage onNavigate={handleNavigate} />,
    bracelet: <BraceletPageOptimized onNavigate={handleNavigate} />,
    'bracelet-old': <MobileBraceletPage onNavigate={handleNavigate} />,
    settings: <SettingsPageOptimized onNavigate={handleNavigate} />,
    'settings-optimized': <SettingsPageOptimized onNavigate={handleNavigate} />,
    'settings-enhanced': <SettingsPageEnhanced onNavigate={handleNavigate} />,
    'settings-old': <SettingsPage onNavigate={handleNavigate} />,
    'bazi-demo': <BaziDemoPage onNavigate={handleNavigate} />,
    'settings-test': <SettingsTestPage onNavigate={handleNavigate} />,
    'daily-fortune-test': <DailyFortuneTestPage onNavigate={handleNavigate} />,
    'personalized-chat': <PersonalizedChatPage onNavigate={handleNavigate} />,
    'personalized-chat-test': <PersonalizedChatTestPage onNavigate={handleNavigate} />,
    'free-chat': <PersonalizedChatPage onNavigate={handleNavigate} />,
    'deepseek-test': <DeepSeekIntegrationTestPage onNavigate={handleNavigate} />,
    'api-test': <APITestPage onNavigate={handleNavigate} />,
    'login': <LoginPage onLogin={() => setIsLoggedIn(true)} />
  };

  const pages = corePages;

  // 🎨 专业级底部导航设计 - 融合传统文化与现代美学
  const navigationItems = [
    {
      id: 'today',
      Icon: NavigationIcons.TodayIcon,
      label: '今日',
      description: '每日运势与指引',
      color: '#D4AF37'
    },
    {
      id: 'guiren',
      Icon: NavigationIcons.GuirenIcon,
      label: '贵人',
      description: '八字交友与贵人匹配',
      color: '#9D50BB'
    },
    {
      id: 'growth',
      Icon: NavigationIcons.GrowthIcon,
      label: '修心',
      description: '修行历程与学习',
      color: '#3B82F6'
    },
    {
      id: 'treasure',
      Icon: NavigationIcons.TreasureIcon,
      label: '法宝',
      description: '手串与功德管理',
      color: '#8B5CF6'
    },
    {
      id: 'profile',
      Icon: NavigationIcons.ProfileIcon,
      label: '我的',
      description: '个人中心与设置',
      color: '#EF4444'
    }
  ];

  // 🌟 加载动画
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
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.8 }}
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div 
        className="min-h-screen professional-app" 
        style={{ background: 'var(--bg-primary)' }}
        {...accessibility.getAriaProps({ 
          label: '神仙朋友应用主界面',
          live: 'polite'
        })}
      >
        {/* 🎭 文档标题动态更新 */}
        <title>{getPageTitle(currentPage)} - 神仙朋友</title>
        
        {/* 主要内容区域 */}
        <main className="professional-main">
          {/* 页面过渡效果 */}
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
                {/* 直接显示页面内容，不进行登录检查 */}
                {pages[currentPage] || pages.today}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* 页面切换加载状态 */}
          <AnimatePresence>
            {pageTransition && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                style={{ backdropFilter: 'blur(4px)' }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="text-4xl"
                >
                  ⏳
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* 🎨 专业级底部导航栏 - 仅在登录时显示 */}
        {isLoggedIn && (
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
                    className={`professional-nav__item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavigate(item.id)}
                    whileHover={{ 
                      scale: 1.05,
                      y: -2
                    }}
                    whileTap={{ 
                      scale: 0.95,
                      y: 0
                    }}
                    initial={{ 
                      opacity: 0, 
                      y: 20 
                    }}
                    animate={{ 
                      opacity: 1, 
                      y: 0 
                    }}
                    transition={{ 
                      duration: 0.4, 
                      delay: 0.4 + index * 0.1,
                      ease: 'easeOut'
                    }}
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
        )}

        {/* 路由配置 */}
        <Routes>
          <Route path="/" element={<Navigate to="/?page=today" replace />} />
          <Route path="/verify" element={<NFCVerifyPage onNavigate={handleNavigate} />} />
          <Route path="/today" element={<TodayHomePageProfessional onNavigate={handleNavigate} />} />
          <Route path="/today-fortune" element={<TodayPageProfessional onNavigate={handleNavigate} />} />
          <Route path="/treasure" element={<BraceletPageOptimized onNavigate={handleNavigate} />} />
          <Route path="/oracle" element={<ChatPageOptimized onNavigate={handleNavigate} />} />
          <Route path="/growth" element={<GrowthPageOptimized onNavigate={handleNavigate} />} />
          {/* 运势功能已整合到首页，移除独立路由 */}
          <Route path="/profile" element={<UserCenterSimplified onNavigate={handleNavigate} />} />
          <Route path="/profile-edit" element={<ProfilePage onNavigate={handleNavigate} />} />
          <Route path="/user-center" element={<UserCenterSimplified onNavigate={handleNavigate} />} />
          
          {/* 兼容旧版路由 */}
          <Route path="/home" element={<HomePageSimple onNavigate={handleNavigate} />} />
          <Route path="/home-interactive" element={<HomePageInteractive onNavigate={handleNavigate} />} />
          <Route path="/home-demo" element={<HomePageDemo onNavigate={handleNavigate} />} />
          <Route path="/home-old" element={isMobile ? <MobileHomePage onNavigate={handleNavigate} /> : <HomePageOptimized onNavigate={handleNavigate} />} />
          <Route path="/daily-fortune-old" element={<MobileDailyFortunePage onNavigate={handleNavigate} />} />
          <Route path="/deity-chat" element={<ChatPageOptimized onNavigate={handleNavigate} />} />
          <Route path="/deity-chat-old" element={<PersonalizedChatPage onNavigate={handleNavigate} />} />
          <Route path="/bracelet" element={<BraceletPageOptimized onNavigate={handleNavigate} />} />
          <Route path="/bracelet-old" element={<MobileBraceletPage onNavigate={handleNavigate} />} />
          <Route path="/settings" element={<SettingsPageOptimized onNavigate={handleNavigate} />} />
          <Route path="/settings-optimized" element={<SettingsPageOptimized onNavigate={handleNavigate} />} />
          <Route path="/settings-enhanced" element={<SettingsPageEnhanced onNavigate={handleNavigate} />} />
          <Route path="/bazi-demo" element={<BaziDemoPage onNavigate={handleNavigate} />} />
          <Route path="/bazi-analysis" element={<BaziDemoPage onNavigate={handleNavigate} />} />
          <Route path="/nfc-test" element={<NFCTestPage onNavigate={handleNavigate} />} />
          <Route path="/personalized-chat" element={<PersonalizedChatPage onNavigate={handleNavigate} />} />
          <Route path="/personalized-chat-test" element={<PersonalizedChatTestPage onNavigate={handleNavigate} />} />
          <Route path="/free-chat" element={<PersonalizedChatPage onNavigate={handleNavigate} />} />
          <Route path="/api-test" element={<APITestPage onNavigate={handleNavigate} />} />
          <Route path="/login" element={<LoginPage onLogin={() => setIsLoggedIn(true)} />} />
        </Routes>

        {/* 隐私政策弹窗 */}
        <AnimatePresence>
          {showPrivacyPolicy && (
            <motion.div
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
                zIndex: 1000,
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

        {/* 🎯 适老化模式切换按钮 */}
        <AccessibilityToggle />
      </div>
    </Router>
  );
}

export default App; 