import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// 添加CSS动画样式
const styles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 注入样式到页面
if (typeof document !== 'undefined' && !document.getElementById('settings-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'settings-animations';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

interface UserCenterSimplifiedProps {
  onNavigate?: (page: string) => void;
}

interface SettingsState {
  notifications: {
    dailyReminder: boolean;
    meritUpdates: boolean;
    wishFulfillment: boolean;
  };
  privacy: {
    profilePublic: boolean;
    practiceRecordsVisible: boolean;
  };
  display: {
    elderlyMode: boolean;
    darkMode: boolean;
  };
}

interface UserProfile {
  name?: string;
  email?: string;
  avatar?: string;
  joinDate?: string;
  totalMerit?: number;
  practicesDays?: number;
}

const UserCenterSimplified: React.FC<UserCenterSimplifiedProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  
  // 设置状态管理
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      dailyReminder: true,
      meritUpdates: false,
      wishFulfillment: true,
    },
    privacy: {
      profilePublic: false,
      practiceRecordsVisible: true,
    },
    display: {
      elderlyMode: false,
      darkMode: true,
    }
  });

  // 用户资料状态
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '虔诚修行者',
    email: 'user@example.com',
    joinDate: '2024-01-01',
    totalMerit: 1250,
    practicesDays: 89
  });

  // 加载状态
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 初始化加载设置
  useEffect(() => {
    console.log('🚀 初始化设置页面');
    loadSettings();
    loadUserProfile();
  }, []);

  // 调试：监听设置变化
  useEffect(() => {
    console.log('⚙️ 当前设置状态:', settings);
  }, [settings]);

  // 加载设置
  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      console.log('📂 从本地存储加载设置:', savedSettings);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('✅ 解析的设置:', parsedSettings);
        setSettings(prevSettings => ({
          ...prevSettings,
          ...parsedSettings
        }));
      } else {
        console.log('📝 使用默认设置');
      }
    } catch (error) {
      console.error('❌ 加载设置失败:', error);
    }
  };

  // 加载用户资料
  const loadUserProfile = () => {
    try {
      const savedProfile = localStorage.getItem('userInfo');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setUserProfile(prevProfile => ({
          ...prevProfile,
          name: parsedProfile.name || prevProfile.name,
          email: parsedProfile.email || prevProfile.email
        }));
      }
    } catch (error) {
      console.error('加载用户资料失败:', error);
    }
  };

  // 保存设置
  const saveSettings = async (newSettings: SettingsState) => {
    setLoading(true);
    try {
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      
      // 显示成功提示
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      // 应用主题设置
      if (newSettings.display.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      console.log('✅ 设置已保存');
    } catch (error) {
      console.error('❌ 保存设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 切换设置项 - 优化版本
  const toggleSetting = async (category: keyof SettingsState, key: string) => {
    try {
      console.log(`🔄 开始切换设置: ${category}.${key}`);
      console.log('📊 当前设置状态:', settings);
      
      const currentCategory = settings[category] as any;
      const currentValue = currentCategory[key];
      const newValue = !currentValue;
      
      console.log(`📝 ${key}: ${currentValue} → ${newValue}`);
      
      const newSettings = {
        ...settings,
        [category]: {
          ...currentCategory,
          [key]: newValue
        }
      };
      
      console.log('🆕 新设置对象:', newSettings);
      
      // 立即更新状态，提供即时反馈
      setSettings(newSettings);
      
      // 异步保存到localStorage
      await saveSettings(newSettings);
      
      console.log(`✅ 设置切换完成: ${category}.${key} = ${newValue}`);
    } catch (error) {
      console.error(`❌ 切换设置失败 ${category}.${key}:`, error);
      // 发生错误时恢复原始状态
      loadSettings();
    }
  };

  // 清理缓存
  const clearCache = async () => {
    setLoading(true);
    try {
      // 清理应用缓存（保留用户数据和设置）
      const keysToKeep = ['userInfo', 'appSettings', 'braceletActivated'];
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      // 清理 Service Worker 缓存
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      console.log('✅ 缓存已清理');
    } catch (error) {
      console.error('❌ 清理缓存失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 退出登录
  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？这将清除所有本地数据。')) {
      localStorage.clear();
      // 重定向到登录页面
      window.location.href = window.location.origin + '?page=login';
    }
  };

  // 显示关于我们
  const showAbout = () => {
    alert(`神仙朋友 v1.0.0
    
一款融合传统文化与现代科技的修行助手应用

功能特色：
• 智能八字分析与每日运势
• 个性化修行指导
• 功德积累与成长追踪
• 虚拟手串念佛计数

开发团队：禅心科技
技术支持：contact@zentech.com`);
  };

  // 显示用户协议
  const showUserAgreement = () => {
    alert(`神仙朋友用户协议

1. 服务说明
本应用为个人修行辅助工具，提供的运势分析仅供参考。

2. 隐私保护
我们重视您的隐私，所有个人信息均在本地存储。

3. 免责声明
本应用提供的建议不构成专业指导，请理性看待。

4. 服务条款
用户应合法合规使用本应用，不得用于违法活动。

如有疑问，请联系客服：service@zentech.com`);
  };

  // 导航处理
  const handleNavigation = (page: string) => {
    // 优先使用 onNavigate 回调（应用内部的页面管理系统）
    if (onNavigate) {
      onNavigate(page);
      return;
    }
    
    // 如果没有 onNavigate 回调，则使用 react-router 的 navigate
    const navigationMap: { [key: string]: string } = {
      'profile-edit': '/profile-edit',
      'profile': '/profile-edit',
      'orders': '/',
      'merit': '/growth',
      'wishes': '/fortune',
      'bracelet': '/bracelet',
      'bazi-analysis': '/bazi-analysis',
      'settings-optimized': '/settings-optimized',
      'change-password': '/change-password' // 新增的导航目标
    };

    const target = navigationMap[page];
    if (target) {
      navigate(target);
    }
  };

  // 渲染开关组件 - 增强版
  const renderToggle = (isOn: boolean, onClick: () => void) => (
    <motion.button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`🖱️ Toggle被点击! 当前状态: ${isOn}, 即将变为: ${!isOn}`);
        onClick();
      }}
      disabled={loading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        width: '52px',
        height: '28px',
        borderRadius: '14px',
        position: 'relative',
        background: isOn 
          ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' 
          : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: isOn 
          ? '0 4px 15px rgba(16, 185, 129, 0.4)' 
          : '0 2px 10px rgba(107, 114, 128, 0.3)',
        opacity: loading ? 0.6 : 1
      }}
    >
      <motion.div
        animate={{ 
          x: isOn ? 26 : 2,
          scale: isOn ? 1.1 : 1
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25,
          duration: 0.3
        }}
        style={{
          width: '22px',
          height: '22px',
          backgroundColor: 'white',
          borderRadius: '11px',
          position: 'absolute',
          top: '3px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* 内部状态指示器 */}
        <motion.div
          animate={{ 
            scale: isOn ? 1 : 0,
            rotate: isOn ? 0 : 180
          }}
          transition={{ duration: 0.2 }}
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#10B981',
            borderRadius: '4px'
          }}
        />
      </motion.div>
      
      {/* 加载状态指示器 */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '16px',
          height: '16px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      )}
    </motion.button>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--zen-bg-primary)',
      padding: 'var(--zen-space-xl) var(--zen-space-lg) 100px',
      position: 'relative'
    }}>
      {/* 成功提示 */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          ✅ 设置已保存
        </motion.div>
      )}

      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 50%)',
        zIndex: -1
      }} />

      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* 标题 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">设置</h1>
          <p className="text-white opacity-80">管理您的应用偏好</p>
        </motion.div>

        {/* 设置内容 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* 通知设置 */}
          <motion.div 
            className="zen-card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
              🔔 通知设置
            </h3>
            <div className="space-y-4">
              <motion.div 
                className="flex items-center justify-between p-3 rounded-lg bg-white bg-opacity-5 hover:bg-opacity-10 transition-all duration-200"
                whileHover={{ x: 5 }}
              >
                <div className="flex flex-col">
                  <span className="text-white font-medium">每日提醒</span>
                  <span className="text-gray-300 text-sm">每天定时提醒修行</span>
                </div>
                {renderToggle(settings.notifications.dailyReminder, () => 
                  toggleSetting('notifications', 'dailyReminder')
                )}
              </motion.div>
              <motion.div 
                className="flex items-center justify-between p-3 rounded-lg bg-white bg-opacity-5 hover:bg-opacity-10 transition-all duration-200"
                whileHover={{ x: 5 }}
              >
                <div className="flex flex-col">
                  <span className="text-white font-medium">功德更新通知</span>
                  <span className="text-gray-300 text-sm">功德积累变化提醒</span>
                </div>
                {renderToggle(settings.notifications.meritUpdates, () => 
                  toggleSetting('notifications', 'meritUpdates')
                )}
              </motion.div>
              <motion.div 
                className="flex items-center justify-between p-3 rounded-lg bg-white bg-opacity-5 hover:bg-opacity-10 transition-all duration-200"
                whileHover={{ x: 5 }}
              >
                <div className="flex flex-col">
                  <span className="text-white font-medium">愿望实现提醒</span>
                  <span className="text-gray-300 text-sm">愿望达成时通知</span>
                </div>
                {renderToggle(settings.notifications.wishFulfillment, () => 
                  toggleSetting('notifications', 'wishFulfillment')
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* 隐私设置 */}
          <motion.div 
            className="zen-card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
              🔒 隐私设置
            </h3>
            <div className="space-y-4">
              <motion.div 
                className="flex items-center justify-between p-3 rounded-lg bg-white bg-opacity-5 hover:bg-opacity-10 transition-all duration-200"
                whileHover={{ x: 5 }}
              >
                <div className="flex flex-col">
                  <span className="text-white font-medium">个人资料公开</span>
                  <span className="text-gray-300 text-sm">允许他人查看个人信息</span>
                </div>
                {renderToggle(settings.privacy.profilePublic, () => 
                  toggleSetting('privacy', 'profilePublic')
                )}
              </motion.div>
              <motion.div 
                className="flex items-center justify-between p-3 rounded-lg bg-white bg-opacity-5 hover:bg-opacity-10 transition-all duration-200"
                whileHover={{ x: 5 }}
              >
                <div className="flex flex-col">
                  <span className="text-white font-medium">修行记录可见</span>
                  <span className="text-gray-300 text-sm">分享修行进度和成就</span>
                </div>
                {renderToggle(settings.privacy.practiceRecordsVisible, () => 
                  toggleSetting('privacy', 'practiceRecordsVisible')
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* 显示设置 */}
          <motion.div 
            className="zen-card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
              🎨 显示设置
            </h3>
            <div className="space-y-4">
              <motion.div 
                className="flex items-center justify-between p-3 rounded-lg bg-white bg-opacity-5 hover:bg-opacity-10 transition-all duration-200"
                whileHover={{ x: 5 }}
              >
                <div className="flex flex-col">
                  <span className="text-white font-medium">适老化模式</span>
                  <span className="text-gray-300 text-sm">大字体，简化界面</span>
                </div>
                {renderToggle(settings.display.elderlyMode, () => 
                  toggleSetting('display', 'elderlyMode')
                )}
              </motion.div>
              <motion.div 
                className="flex items-center justify-between p-3 rounded-lg bg-white bg-opacity-5 hover:bg-opacity-10 transition-all duration-200"
                whileHover={{ x: 5 }}
              >
                <div className="flex flex-col">
                  <span className="text-white font-medium">夜间模式</span>
                  <span className="text-gray-300 text-sm">深色主题，护眼模式</span>
                </div>
                {renderToggle(settings.display.darkMode, () => 
                  toggleSetting('display', 'darkMode')
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* 账户管理 */}
          <motion.div 
            className="zen-card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
              👤 账户管理
            </h3>
            <div className="space-y-3">
              <motion.button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log('🔑 点击修改密码');
                  handleNavigation('change-password');
                }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🔑</span>
                  <div className="text-left">
                    <span className="text-white font-medium block">修改密码</span>
                    <span className="text-blue-200 text-sm">更新账户密码</span>
                  </div>
                </div>
                <span className="text-white opacity-70">→</span>
              </motion.button>
              
              <motion.button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log('📝 点击个人资料');
                  handleNavigation('profile-edit');
                }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📝</span>
                  <div className="text-left">
                    <span className="text-white font-medium block">个人资料</span>
                    <span className="text-green-200 text-sm">编辑基本信息</span>
                  </div>
                </div>
                <span className="text-white opacity-70">→</span>
              </motion.button>
              
              <motion.button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log('🛒 点击我的订单');
                  handleNavigation('orders');
                }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🛒</span>
                  <div className="text-left">
                    <span className="text-white font-medium block">我的订单</span>
                    <span className="text-purple-200 text-sm">查看购买记录</span>
                  </div>
                </div>
                <span className="text-white opacity-70">→</span>
              </motion.button>
            </div>
          </motion.div>

          {/* 其他设置 */}
          <motion.div 
            className="zen-card"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
              ⚙️ 其他设置
            </h3>
            <div className="space-y-3">
              <motion.button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log('🧹 点击缓存清理');
                  clearCache();
                }}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02, x: loading ? 0 : 5 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:hover:scale-100"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🧹</span>
                  <div className="text-left">
                    <span className="text-white font-medium block">
                      {loading ? '清理中...' : '缓存清理'}
                    </span>
                    <span className="text-orange-200 text-sm">清理应用缓存数据</span>
                  </div>
                </div>
                <span className="text-white opacity-70">→</span>
              </motion.button>
              
              <motion.button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log('ℹ️ 点击关于我们');
                  showAbout();
                }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">ℹ️</span>
                  <div className="text-left">
                    <span className="text-white font-medium block">关于我们</span>
                    <span className="text-indigo-200 text-sm">了解应用信息</span>
                  </div>
                </div>
                <span className="text-white opacity-70">→</span>
              </motion.button>
              
              <motion.button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log('📋 点击用户协议');
                  showUserAgreement();
                }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📋</span>
                  <div className="text-left">
                    <span className="text-white font-medium block">用户协议</span>
                    <span className="text-gray-200 text-sm">查看服务条款</span>
                  </div>
                </div>
                <span className="text-white opacity-70">→</span>
              </motion.button>
              
              <motion.button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log('🚪 点击退出登录');
                  handleLogout();
                }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🚪</span>
                  <div className="text-left">
                    <span className="text-white font-medium block">退出登录</span>
                    <span className="text-red-200 text-sm">注销当前账户</span>
                  </div>
                </div>
                <span className="text-white opacity-70">→</span>
              </motion.button>
            </div>
          </motion.div>

          {/* 快捷操作 */}
          <div className="zen-card">
            <h3 className="text-lg font-semibold mb-4 text-white">快捷操作</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleNavigation('merit')}
                className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white hover:shadow-lg transition-all"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm">功德统计</div>
              </button>
              <button 
                onClick={() => handleNavigation('wishes')}
                className="p-4 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg text-white hover:shadow-lg transition-all"
              >
                <div className="text-2xl mb-2">🌟</div>
                <div className="text-sm">许愿管理</div>
              </button>
              <button 
                onClick={() => handleNavigation('bracelet')}
                className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg text-white hover:shadow-lg transition-all"
              >
                <div className="text-2xl mb-2">📿</div>
                <div className="text-sm">手串状态</div>
              </button>
              <button 
                onClick={() => handleNavigation('settings-optimized')}
                className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg text-white hover:shadow-lg transition-all"
              >
                <div className="text-2xl mb-2">📅</div>
                <div className="text-sm">八字设置</div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserCenterSimplified; 