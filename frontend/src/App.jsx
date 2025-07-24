import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles.css';

// 页面组件
import HomePageOptimized from './pages/HomePageOptimized';
import BaziDemoPage from './pages/BaziDemoPage';
import SettingsPage from './pages/SettingsPage';
import SettingsTestPage from './pages/SettingsTestPage';
import DailyFortuneTestPage from './pages/DailyFortuneTestPage';
import PersonalizedChatPage from './pages/PersonalizedChatPage';
import PersonalizedChatTestPage from './pages/PersonalizedChatTestPage';
import DeepSeekIntegrationTestPage from './pages/DeepSeekIntegrationTestPage';
import APITestPage from './pages/APITestPage';

// 组件
import PersonalizedDeityFriend from './components/features/deity-friend/PersonalizedDeityFriend';
import ProfessionalBaziDisplay from './components/ProfessionalBaziDisplay';
import DayunDisplay from './components/DayunDisplay';
import DailyFortuneDisplay from './components/DailyFortuneDisplay';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // 从URL参数获取页面
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    if (page) {
      setCurrentPage(page);
    }
  }, []);

  // 页面切换处理
  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.history.pushState({}, '', `?page=${page}`);
  };

  // 页面路由配置
  const pages = {
    home: <HomePageOptimized onNavigate={handleNavigate} />,
    'bazi-demo': <BaziDemoPage onNavigate={handleNavigate} />,
    settings: <SettingsPage onNavigate={handleNavigate} />,
    'settings-test': <SettingsTestPage onNavigate={handleNavigate} />,
    'daily-fortune-test': <DailyFortuneTestPage onNavigate={handleNavigate} />,
    'personalized-chat': <PersonalizedChatPage onNavigate={handleNavigate} />,
    'personalized-chat-test': <PersonalizedChatTestPage onNavigate={handleNavigate} />,
    'free-chat': <PersonalizedChatPage onNavigate={handleNavigate} />,
    'deepseek-test': <DeepSeekIntegrationTestPage onNavigate={handleNavigate} />,
    'api-test': <APITestPage onNavigate={handleNavigate} />
  };

  // 导航项配置
  const navigationItems = [
    {
      id: 'home',
      icon: '🏠',
      label: '首页',
      description: '智慧之家'
    },
    {
      id: 'free-chat',
      icon: '💬',
      label: '个性化对话',
      description: '八字运势'
    },
    {
      id: 'bazi-demo',
      icon: '📊',
      label: '八字分析',
      description: '命理解读'
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: '设置',
      description: '个人中心'
    }
  ];

  return (
    <Router>
      <div className="zen-app">
        {/* 头部状态栏 */}
        <header className="zen-header">
          <div className="zen-header-content">
            <div className="zen-brand">
              <span className="zen-brand-icon">🙏</span>
              <span className="zen-brand-text">神仙朋友</span>
            </div>
            <div className="zen-status">
              <span className="zen-time">{new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </header>

        {/* 主要内容区域 */}
        <main className="zen-main-content">
          <div className="zen-page-container">
            {pages[currentPage] || <HomePageOptimized onNavigate={handleNavigate} />}
          </div>
        </main>

        {/* 底部导航栏 */}
        <nav className="zen-bottom-nav">
          <div className="zen-nav-container">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                className={`zen-nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleNavigate(item.id)}
                aria-label={item.label}
              >
                <span className="zen-nav-icon">{item.icon}</span>
                <span className="zen-nav-label">{item.label}</span>
                <span className="zen-nav-description">{item.description}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* 路由配置 */}
        <Routes>
          <Route path="/" element={<Navigate to="/?page=home" replace />} />
          <Route path="/home" element={<HomePageOptimized onNavigate={handleNavigate} />} />
          <Route path="/bazi-demo" element={<BaziDemoPage onNavigate={handleNavigate} />} />
          <Route path="/settings" element={<SettingsPage onNavigate={handleNavigate} />} />
          <Route path="/settings-test" element={<SettingsTestPage onNavigate={handleNavigate} />} />
          <Route path="/daily-fortune-test" element={<DailyFortuneTestPage onNavigate={handleNavigate} />} />
          <Route path="/personalized-chat" element={<PersonalizedChatPage onNavigate={handleNavigate} />} />
          <Route path="/personalized-chat-test" element={<PersonalizedChatTestPage onNavigate={handleNavigate} />} />
          <Route path="/free-chat" element={<PersonalizedChatPage onNavigate={handleNavigate} />} />
          <Route path="/deepseek-test" element={<DeepSeekIntegrationTestPage onNavigate={handleNavigate} />} />
          <Route path="/api-test" element={<APITestPage onNavigate={handleNavigate} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles.css';

// 页面组件
import HomePageOptimized from './pages/HomePageOptimized';
import BaziDemoPage from './pages/BaziDemoPage';
import SettingsPage from './pages/SettingsPage';
import SettingsTestPage from './pages/SettingsTestPage';
import DailyFortuneTestPage from './pages/DailyFortuneTestPage';
import PersonalizedChatPage from './pages/PersonalizedChatPage';
import PersonalizedChatTestPage from './pages/PersonalizedChatTestPage';
import DeepSeekIntegrationTestPage from './pages/DeepSeekIntegrationTestPage';
import APITestPage from './pages/APITestPage';

// 组件
import PersonalizedDeityFriend from './components/features/deity-friend/PersonalizedDeityFriend';
import ProfessionalBaziDisplay from './components/ProfessionalBaziDisplay';
import DayunDisplay from './components/DayunDisplay';
import DailyFortuneDisplay from './components/DailyFortuneDisplay';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // 从URL参数获取页面
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page');
    if (page) {
      setCurrentPage(page);
    }
  }, []);

  // 页面切换处理
  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.history.pushState({}, '', `?page=${page}`);
  };

  // 页面路由配置
  const pages = {
    home: <HomePageOptimized onNavigate={handleNavigate} />,
    'bazi-demo': <BaziDemoPage onNavigate={handleNavigate} />,
    settings: <SettingsPage onNavigate={handleNavigate} />,
    'settings-test': <SettingsTestPage onNavigate={handleNavigate} />,
    'daily-fortune-test': <DailyFortuneTestPage onNavigate={handleNavigate} />,
    'personalized-chat': <PersonalizedChatPage onNavigate={handleNavigate} />,
    'personalized-chat-test': <PersonalizedChatTestPage onNavigate={handleNavigate} />,
    'free-chat': <PersonalizedChatPage onNavigate={handleNavigate} />,
    'deepseek-test': <DeepSeekIntegrationTestPage onNavigate={handleNavigate} />,
    'api-test': <APITestPage onNavigate={handleNavigate} />
  };

  // 导航项配置
  const navigationItems = [
    {
      id: 'home',
      icon: '🏠',
      label: '首页',
      description: '智慧之家'
    },
    {
      id: 'free-chat',
      icon: '💬',
      label: '个性化对话',
      description: '八字运势'
    },
    {
      id: 'bazi-demo',
      icon: '📊',
      label: '八字分析',
      description: '命理解读'
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: '设置',
      description: '个人中心'
    }
  ];

  return (
    <Router>
      <div className="zen-app">
        {/* 头部状态栏 */}
        <header className="zen-header">
          <div className="zen-header-content">
            <div className="zen-brand">
              <span className="zen-brand-icon">🙏</span>
              <span className="zen-brand-text">神仙朋友</span>
            </div>
            <div className="zen-status">
              <span className="zen-time">{new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </header>

        {/* 主要内容区域 */}
        <main className="zen-main-content">
          <div className="zen-page-container">
            {pages[currentPage] || <HomePageOptimized onNavigate={handleNavigate} />}
          </div>
        </main>

        {/* 底部导航栏 */}
        <nav className="zen-bottom-nav">
          <div className="zen-nav-container">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                className={`zen-nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleNavigate(item.id)}
                aria-label={item.label}
              >
                <span className="zen-nav-icon">{item.icon}</span>
                <span className="zen-nav-label">{item.label}</span>
                <span className="zen-nav-description">{item.description}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* 路由配置 */}
        <Routes>
          <Route path="/" element={<Navigate to="/?page=home" replace />} />
          <Route path="/home" element={<HomePageOptimized onNavigate={handleNavigate} />} />
          <Route path="/bazi-demo" element={<BaziDemoPage onNavigate={handleNavigate} />} />
          <Route path="/settings" element={<SettingsPage onNavigate={handleNavigate} />} />
          <Route path="/settings-test" element={<SettingsTestPage onNavigate={handleNavigate} />} />
          <Route path="/daily-fortune-test" element={<DailyFortuneTestPage onNavigate={handleNavigate} />} />
          <Route path="/personalized-chat" element={<PersonalizedChatPage onNavigate={handleNavigate} />} />
          <Route path="/personalized-chat-test" element={<PersonalizedChatTestPage onNavigate={handleNavigate} />} />
          <Route path="/free-chat" element={<PersonalizedChatPage onNavigate={handleNavigate} />} />
          <Route path="/deepseek-test" element={<DeepSeekIntegrationTestPage onNavigate={handleNavigate} />} />
          <Route path="/api-test" element={<APITestPage onNavigate={handleNavigate} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 