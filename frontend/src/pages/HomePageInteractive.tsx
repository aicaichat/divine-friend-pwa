import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/apiService';

interface HomePageInteractiveProps {
  onNavigate: (page: string) => void;
}

interface UserState {
  name?: string;
  birthdate?: string;
  gender?: string;
  hasBaziSetup: boolean;
  hasBraceletActivated: boolean;
  setupProgress: number; // 0-100
}

interface DailyFortune {
  date: string;
  overall_score: number;
  overall_level: string;
  overall_description: string;
  career_fortune: {
    score: number;
    description: string;
    advice: string[];
  };
  wealth_fortune: {
    score: number;
    description: string;
    advice: string[];
  };
  health_fortune: {
    score: number;
    description: string;
    advice: string[];
  };
  relationship_fortune: {
    score: number;
    description: string;
    advice: string[];
  };
  lucky_colors: string[];
  lucky_numbers: number[];
  lucky_directions: string[];
  recommended_activities: string[];
  avoid_activities: string[];
}

interface TodayGuidance {
  morning: string;
  afternoon: string;
  evening: string;
  specialReminder: string;
}

// 🎨 增强的设计系统
const designSystem = {
  colors: {
    primary: '#D4AF37',
    primaryLight: 'rgba(212, 175, 55, 0.8)',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: 'linear-gradient(135deg, #0F1419 0%, #1A1B26 50%, #2D2E3F 100%)',
    card: 'rgba(255, 255, 255, 0.08)',
    cardHover: 'rgba(255, 255, 255, 0.12)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    textMuted: 'rgba(255, 255, 255, 0.6)'
  },
  shadows: {
    card: '0 8px 32px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(212, 175, 55, 0.3)',
    hover: '0 12px 40px rgba(0, 0, 0, 0.4)'
  },
  animation: {
    spring: { type: "spring", stiffness: 300, damping: 30 },
    smooth: { duration: 0.3, ease: "easeInOut" },
    slow: { duration: 0.6, ease: "easeInOut" }
  }
};

const HomePageInteractive: React.FC<HomePageInteractiveProps> = ({ onNavigate }) => {
  const [userState, setUserState] = useState<UserState>({
    hasBaziSetup: false,
    hasBraceletActivated: false,
    setupProgress: 0
  });
  const [dailyFortune, setDailyFortune] = useState<DailyFortune | null>(null);
  const [todayGuidance, setTodayGuidance] = useState<TodayGuidance | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'fortune' | 'guidance'>('fortune');

  // 🕐 智能时间问候
  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return { text: '夜深了，菩萨与您同在', icon: '🌙' };
    if (hour < 9) return { text: '晨光初现，新的一天开始了', icon: '🌅' };
    if (hour < 12) return { text: '上午好，愿您今日顺遂', icon: '☀️' };
    if (hour < 14) return { text: '午时已至，稍作休憩', icon: '🌞' };
    if (hour < 18) return { text: '下午好，继续加油', icon: '🌤️' };
    if (hour < 22) return { text: '夜幕降临，愿您安康', icon: '🌆' };
    return { text: '夜深人静，祝您安眠', icon: '🌌' };
  };

  // 🌟 运势等级颜色和图标
  const getFortuneStyle = (level: string) => {
    const styles: Record<string, { color: string; icon: string; bg: string }> = {
      '极好': { color: '#10B981', icon: '🌟', bg: 'linear-gradient(135deg, #10B981, #059669)' },
      '很好': { color: '#3B82F6', icon: '✨', bg: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
      '好': { color: '#8B5CF6', icon: '💫', bg: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
      '一般': { color: '#F59E0B', icon: '🌤️', bg: 'linear-gradient(135deg, #F59E0B, #D97706)' },
      '差': { color: '#EF4444', icon: '⛅', bg: 'linear-gradient(135deg, #EF4444, #DC2626)' }
    };
    return styles[level] || styles['一般'];
  };

  // 📊 检查用户状态
  const checkUserState = async () => {
    try {
      console.log('🔍 开始检查用户状态...');
      // 检查本地存储
      const savedUserInfo = localStorage.getItem('userInfo');
      const braceletStatus = localStorage.getItem('braceletActivated');
      console.log('📱 本地存储状态:', { savedUserInfo, braceletStatus });
      
      let newUserState: UserState = {
        hasBaziSetup: false,
        hasBraceletActivated: false,
        setupProgress: 0
      };

      if (savedUserInfo) {
        const userInfo = JSON.parse(savedUserInfo);
        newUserState = {
          ...userInfo,
          hasBaziSetup: !!(userInfo.birthdate && userInfo.name && userInfo.gender),
          hasBraceletActivated: braceletStatus === 'true',
          setupProgress: calculateSetupProgress(userInfo, braceletStatus === 'true')
        };

        // 如果用户已完全设置，获取运势数据
        if (newUserState.hasBaziSetup && newUserState.hasBraceletActivated) {
          await loadFortuneData(userInfo);
        }
      }

      setUserState(newUserState);
    } catch (error) {
      console.error('检查用户状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 📈 计算设置进度
  const calculateSetupProgress = (userInfo: any, braceletActivated: boolean) => {
    let progress = 0;
    if (userInfo.name) progress += 20;
    if (userInfo.birthdate) progress += 30;
    if (userInfo.gender) progress += 20;
    // 移除手串激活的进度计算，只计算八字设置进度
    // if (braceletActivated) progress += 30;
    return progress;
  };

  // 🔮 加载运势数据
  const loadFortuneData = async (userInfo: any) => {
    try {
      const fortuneResponse = await apiService.calculateDailyFortune({
        birthdate: userInfo.birthdate,
        name: userInfo.name,
        gender: userInfo.gender
      });

      if (fortuneResponse.success) {
        setDailyFortune(fortuneResponse.data);
        
        // 生成今日指引
        const guidance = generateTodayGuidance(fortuneResponse.data);
        setTodayGuidance(guidance);
      }
    } catch (error) {
      console.error('加载运势数据失败:', error);
    }
  };

  // 📝 生成今日指引
  const generateTodayGuidance = (fortune: DailyFortune): TodayGuidance => {
    return {
      morning: `早晨适合${fortune.recommended_activities[0] || '静心冥想'}，今日幸运方位为${fortune.lucky_directions[0] || '东方'}`,
      afternoon: `下午宜${fortune.recommended_activities[1] || '处理重要事务'}，避免${fortune.avoid_activities[0] || '冲动决策'}`,
      evening: `夜晚可${fortune.recommended_activities[2] || '整理思绪'}，穿戴${fortune.lucky_colors[0] || '金色'}系服装有助运势`,
      specialReminder: `特别提醒：今日幸运数字为${fortune.lucky_numbers.join('、')}，可多加运用`
    };
  };

  // 🎯 引导用户设置八字
  const handleBaziSetup = () => {
    onNavigate('settings-optimized');
  };

  // 📿 引导用户激活手串
  const handleBraceletActivation = () => {
    onNavigate('bracelet');
  };

  // 🔄 数据初始化
  useEffect(() => {
    checkUserState();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 📱 渲染引导卡片
  const renderGuidanceCard = () => {
    if (userState.hasBaziSetup && userState.hasBraceletActivated) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={designSystem.animation.smooth}
        style={{
          background: designSystem.colors.card,
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          boxShadow: designSystem.shadows.glow
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: '2.5rem', marginBottom: '1rem' }}
          >
            {!userState.hasBaziSetup ? '✨' : '📿'}
          </motion.div>
          
          <h3 style={{
            color: designSystem.colors.textPrimary,
            fontSize: '1.25rem',
            marginBottom: '0.5rem'
          }}>
            {!userState.hasBaziSetup ? '开启您的神仙之旅' : '激活您的专属手串'}
          </h3>
          
          <p style={{
            color: designSystem.colors.textSecondary,
            fontSize: '0.875rem',
            lineHeight: '1.5'
          }}>
            {!userState.hasBaziSetup 
              ? '设置您的八字信息，获取专属的每日运势指引'
              : '激活手串后，即可享受完整的神仙朋友服务'
            }
          </p>
        </div>

        {/* 进度条 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          height: '8px',
          marginBottom: '1.5rem',
          overflow: 'hidden'
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${userState.setupProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #D4AF37, #F59E0B)',
              borderRadius: '10px',
              boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)'
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: designSystem.colors.textMuted
        }}>
          <span>设置进度</span>
          <span>{userState.setupProgress}%</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={!userState.hasBaziSetup ? handleBaziSetup : handleBraceletActivation}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #D4AF37, #F59E0B)',
            border: 'none',
            borderRadius: '15px',
            padding: '1rem',
            color: 'white',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '1rem',
            boxShadow: designSystem.shadows.glow
          }}
        >
          {!userState.hasBaziSetup ? '🔮 设置八字信息' : '📿 激活手串'}
        </motion.button>
      </motion.div>
    );
  };

  // 🔮 渲染运势卡片
  const renderFortuneCard = () => {
    if (!dailyFortune) return null;

    const fortuneStyle = getFortuneStyle(dailyFortune.overall_level);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={designSystem.animation.smooth}
        style={{
          background: designSystem.colors.card,
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: designSystem.shadows.card
        }}
      >
        {/* 运势头部 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: designSystem.colors.textPrimary,
              margin: 0
            }}>
              今日运势 • {dailyFortune.date}
            </h3>
            <p style={{
              color: designSystem.colors.textMuted,
              fontSize: '0.875rem',
              margin: '0.25rem 0 0 0'
            }}>
              大势至菩萨
            </p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.1 }}
            style={{
              width: '70px',
              height: '70px',
              background: fortuneStyle.bg,
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              boxShadow: `0 8px 24px ${fortuneStyle.color}40`,
              cursor: 'pointer'
            }}
            onClick={() => onNavigate('daily-fortune')}
          >
            <div style={{ fontSize: '1.2rem' }}>{fortuneStyle.icon}</div>
            <div style={{ fontSize: '1.2rem' }}>{dailyFortune.overall_score}</div>
          </motion.div>
        </div>

        {/* 运势描述 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          borderLeft: `4px solid ${fortuneStyle.color}`
        }}>
          <p style={{
            color: designSystem.colors.textPrimary,
            fontSize: '1rem',
            lineHeight: '1.6',
            margin: 0,
            fontStyle: 'italic'
          }}>
            "{dailyFortune.overall_description}"
          </p>
        </div>

        {/* 标签切换 */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '15px',
          padding: '4px',
          marginBottom: '1rem'
        }}>
          {[
            { key: 'fortune', label: '运势详情', icon: '🔮' },
            { key: 'guidance', label: '今日指引', icon: '📝' }
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1,
                background: activeTab === tab.key ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem',
                color: activeTab === tab.key ? designSystem.colors.primary : designSystem.colors.textSecondary,
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.icon} {tab.label}
            </motion.button>
          ))}
        </div>

        {/* 内容区域 */}
        <AnimatePresence mode="wait">
          {activeTab === 'fortune' ? (
            <motion.div
              key="fortune"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={designSystem.animation.smooth}
            >
              {renderFortuneDetails()}
            </motion.div>
          ) : (
            <motion.div
              key="guidance"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={designSystem.animation.smooth}
            >
              {renderTodayGuidance()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // 📊 渲染运势详情
  const renderFortuneDetails = () => {
    if (!dailyFortune) return null;

    const categories = [
      { key: 'career_fortune', label: '事业', icon: '💼', data: dailyFortune.career_fortune },
      { key: 'wealth_fortune', label: '财运', icon: '💰', data: dailyFortune.wealth_fortune },
      { key: 'health_fortune', label: '健康', icon: '🏥', data: dailyFortune.health_fortune },
      { key: 'relationship_fortune', label: '感情', icon: '💕', data: dailyFortune.relationship_fortune }
    ];

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {categories.map((category, index) => (
          <motion.div
            key={category.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {category.icon}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: designSystem.colors.textMuted,
              marginBottom: '0.25rem'
            }}>
              {category.label}
            </div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: getFortuneStyle(category.data.score >= 80 ? '很好' : category.data.score >= 60 ? '好' : '一般').color
            }}>
              {category.data.score}分
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  // 📝 渲染今日指引
  const renderTodayGuidance = () => {
    if (!todayGuidance) return null;

    const guidanceItems = [
      { time: '上午', content: todayGuidance.morning, icon: '🌅' },
      { time: '下午', content: todayGuidance.afternoon, icon: '☀️' },
      { time: '晚上', content: todayGuidance.evening, icon: '🌙' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {guidanceItems.map((item, index) => (
          <motion.div
            key={item.time}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px'
            }}
          >
            <div style={{
              fontSize: '1.25rem',
              flexShrink: 0,
              marginTop: '0.125rem'
            }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: designSystem.colors.primary,
                marginBottom: '0.25rem'
              }}>
                {item.time}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: designSystem.colors.textSecondary,
                lineHeight: '1.4'
              }}>
                {item.content}
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* 特别提醒 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(245, 158, 11, 0.1))',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>💫</div>
          <div style={{
            fontSize: '0.875rem',
            color: designSystem.colors.textPrimary,
            fontWeight: '500'
          }}>
            {todayGuidance.specialReminder}
          </div>
        </motion.div>
      </div>
    );
  };

  // 🎯 渲染快捷功能
  const renderQuickActions = () => {
    const actions = [
      { icon: '💬', title: '与神对话', desc: '智慧指引', action: () => onNavigate('deity-chat'), primary: true },
      { icon: '📿', title: '手串状态', desc: '功德进度', action: () => onNavigate('bracelet') },
      { icon: '📊', title: '命理分析', desc: '八字解读', action: () => onNavigate('bazi-analysis') },
      { icon: '⚙️', title: '个人设置', desc: '偏好配置', action: () => onNavigate('settings') }
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...designSystem.animation.smooth, delay: 0.4 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            whileHover={{ 
              y: -4, 
              scale: 1.02,
              boxShadow: action.primary ? designSystem.shadows.glow : designSystem.shadows.hover
            }}
            whileTap={{ scale: 0.98 }}
            onClick={action.action}
            style={{
              background: action.primary 
                ? `linear-gradient(135deg, ${designSystem.colors.primary}20 0%, ${designSystem.colors.primary}10 100%)`
                : designSystem.colors.card,
              borderRadius: '18px',
              padding: '1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              border: action.primary 
                ? `1px solid ${designSystem.colors.primary}40`
                : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: designSystem.shadows.card,
              transition: 'all 0.3s ease'
            }}
          >
            <motion.div
              whileHover={{ scale: 1.2, rotate: 5 }}
              style={{
                fontSize: '2rem',
                marginBottom: '0.75rem',
                filter: action.primary 
                  ? `drop-shadow(0 0 8px ${designSystem.colors.primary}60)`
                  : 'none'
              }}
            >
              {action.icon}
            </motion.div>
            
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: designSystem.colors.textPrimary,
              margin: '0 0 0.25rem 0'
            }}>
              {action.title}
            </h4>
            
            <p style={{
              fontSize: '0.875rem',
              color: designSystem.colors.textMuted,
              margin: 0
            }}>
              {action.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  const greeting = getTimeGreeting();

  return (
    <div style={{
      minHeight: '100vh',
      background: designSystem.colors.background,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(212, 175, 55, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
        zIndex: -1
      }} />

      {/* 粒子系统 */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: i % 3 === 0 ? '3px' : '2px',
            height: i % 3 === 0 ? '3px' : '2px',
            background: designSystem.colors.primary,
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.6
          }}
          animate={{
            y: [-30, 30],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.4, 0.8]
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3
          }}
        />
      ))}

      <div style={{
        padding: '2rem 1.5rem',
        maxWidth: '400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* 状态栏 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={designSystem.animation.smooth}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            color: designSystem.colors.textSecondary,
            fontSize: '0.875rem'
          }}
        >
          <div>{currentTime.toLocaleDateString('zh-CN', { 
            month: 'long', 
            day: 'numeric',
            weekday: 'short' 
          })}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: '8px',
                height: '8px',
                background: userState.hasBraceletActivated ? designSystem.colors.success : designSystem.colors.warning,
                borderRadius: '50%'
              }}
            />
            {userState.hasBraceletActivated ? '手串已连接' : '待激活'}
          </div>
        </motion.div>

        {/* 问候区域 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...designSystem.animation.smooth, delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ fontSize: '3rem', marginBottom: '1rem' }}
          >
            {greeting.icon}
          </motion.div>
          
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '600',
            color: designSystem.colors.textPrimary,
            marginBottom: '0.5rem'
          }}>
            {greeting.text}
          </h1>
          
          <p style={{
            color: designSystem.colors.textSecondary,
            fontSize: '1rem',
            margin: 0
          }}>
            {userState.name ? `${userState.name}，` : ''}菩萨在此护佑您
          </p>
        </motion.div>

        {/* 主要内容区域 */}
        <AnimatePresence>
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                textAlign: 'center',
                padding: '3rem 0',
                color: designSystem.colors.textSecondary
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{ fontSize: '2rem', marginBottom: '1rem' }}
              >
                🔮
              </motion.div>
              正在为您准备神仙服务...
            </motion.div>
          ) : (
            <>
              {/* 引导卡片 */}
              {renderGuidanceCard()}
              
              {/* 运势卡片 */}
              {renderFortuneCard()}
              
              {/* 快捷功能 */}
              {renderQuickActions()}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HomePageInteractive; 