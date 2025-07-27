import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/apiService';

// 菩萨圣像背景图片（您可以替换为实际的图片路径）
const DIVINE_BACKGROUND = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600'%3E%3Cdefs%3E%3CradialGradient id='divine' cx='50%25' cy='30%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFD700;stop-opacity:0.8'/%3E%3Cstop offset='40%25' style='stop-color:%23FFA500;stop-opacity:0.6'/%3E%3Cstop offset='100%25' style='stop-color:%23FF6B47;stop-opacity:0.3'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23divine)'/%3E%3C/svg%3E";

const MobileHomePage = ({ onNavigate }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [dailyFortune, setDailyFortune] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [fortuneLevel, setFortuneLevel] = useState('');

  // 🌅 时间和问候语更新
  useEffect(() => {
    const updateTimeAndGreeting = () => {
      const now = new Date();
      setCurrentTime(now);
      
      const hour = now.getHours();
      if (hour < 6) setGreeting('深夜好');
      else if (hour < 9) setGreeting('早上好');
      else if (hour < 12) setGreeting('上午好');
      else if (hour < 14) setGreeting('中午好');
      else if (hour < 18) setGreeting('下午好');
      else if (hour < 22) setGreeting('晚上好');
      else setGreeting('夜深了');
    };

    updateTimeAndGreeting();
    const timer = setInterval(updateTimeAndGreeting, 60000);
    return () => clearInterval(timer);
  }, []);

  // 📊 数据加载与状态管理
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUserInfo = localStorage.getItem('userInfo');
        if (savedUserInfo) {
          const info = JSON.parse(savedUserInfo);
          setUserInfo(info);

          // 获取今日运势
          if (info.birthdate) {
            const fortuneResponse = await apiService.calculateDailyFortune({
              birthdate: info.birthdate,
              name: info.name,
              gender: info.gender
            });
            
            if (fortuneResponse.success) {
              setDailyFortune(fortuneResponse.data);
              setFortuneLevel(fortuneResponse.data.overall_level || '中等');
            }
          }
        }
      } catch (error) {
        console.error('数据加载失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // 🎨 视觉样式工具函数
  const getFortuneColor = (level) => {
    const colorMap = {
      '极好': '#22c55e',
      '很好': '#16a34a', 
      '好': '#65a30d',
      '一般': '#f59e0b',
      '差': '#ea580c',
      '很差': '#dc2626'
    };
    return colorMap[level] || '#6b7280';
  };

  const getFortuneEmoji = (level) => {
    const emojiMap = {
      '极好': '🌟',
      '很好': '✨',
      '好': '🌅',
      '一般': '🌤️',
      '差': '⛅',
      '很差': '🌧️'
    };
    return emojiMap[level] || '🌤️';
  };

  // 🎭 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      scale: 1.02,
      y: -4,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  // 🎨 震撼魔法卡片组件
  const FeatureCard = ({ icon, title, subtitle, color, onClick, highlight = false, disabled = false }) => (
    <motion.div
      variants={itemVariants}
      whileHover={!disabled ? "hover" : {}}
      whileTap={!disabled ? "tap" : {}}
      onClick={disabled ? undefined : onClick}
      className={`feature-card ${highlight ? 'highlight' : ''} ${disabled ? 'disabled' : ''}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '20px',
        padding: '2rem',
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backdropFilter: 'blur(25px) saturate(180%)',
        boxShadow: highlight 
          ? '0 20px 60px rgba(255, 215, 0, 0.4), 0 10px 30px rgba(255, 215, 0, 0.3), 0 5px 15px rgba(255, 215, 0, 0.2)' 
          : '0 15px 45px rgba(108, 92, 231, 0.3), 0 8px 20px rgba(108, 92, 231, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        opacity: disabled ? 0.6 : 1
      }}
    >
      {/* 魔法边框 */}
      <div style={{
        position: 'absolute',
        top: -3,
        left: -3,
        right: -3,
        bottom: -3,
        background: highlight ? 'linear-gradient(135deg, #ffd700 0%, #ff6b6b 25%, #4ecdc4 50%, #45b7d1 75%, #96ceb4 100%)' : 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        zIndex: -1,
        opacity: highlight ? 1 : 0,
        transition: 'opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }} />
      
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: -30,
        right: -30,
        width: 80,
        height: 80,
        background: `conic-gradient(from 0deg at 50% 50%, ${color}30, transparent, ${color}20)`,
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: 'cosmicSpin 15s linear infinite'
      }} />
      
      {/* 神秘粒子 */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: color,
            borderRadius: '50%',
            top: `${20 + i * 15}%`,
            right: `${10 + i * 8}%`,
            opacity: 0.6,
            animation: `particles ${3 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`
          }}
        />
      ))}
      
      <motion.div 
        style={{ 
          fontSize: '3.2rem', 
          marginBottom: 'var(--space-md)',
          filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))',
          position: 'relative',
          zIndex: 2
        }}
        whileHover={{ 
          scale: 1.2, 
          rotate: 10,
          filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 1))'
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="zen-glow"
      >
        {icon}
      </motion.div>
      
      <h3 style={{ 
        color: 'var(--divine-gold)', 
        margin: '0 0 var(--space-sm) 0',
        fontSize: '1.4rem',
        fontWeight: '800',
        fontFamily: 'var(--font-divine)',
        textShadow: '0 0 10px rgba(255, 215, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 2
      }}>
        {title}
      </h3>
      
      <p style={{ 
        color: 'var(--text-mystic)', 
        margin: '0',
        fontSize: '0.95rem',
        lineHeight: 1.6,
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 2
      }}>
        {subtitle}
      </p>
    </motion.div>
  );

  // 🌟 神圣运势概览卡片
  const FortuneOverview = () => (
    <motion.div
      variants={itemVariants}
      className="fortune-overview mystic-pulse"
      style={{
        background: 'var(--gradient-divine)',
        borderRadius: 'var(--card-radius)',
        padding: 'var(--space-2xl)',
        marginBottom: 'var(--space-xl)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-cosmic)'
      }}
    >
      {/* 动态背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '120px',
        height: '120px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        transform: 'translate(40px, -40px)'
      }} />

      {/* 浮动光点装饰 */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: 'rgba(255,255,255,0.6)',
            borderRadius: '50%',
            top: `${30 + i * 20}%`,
            left: `${80 + i * 5}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: 'var(--space-lg)' 
        }}>
          <div>
            <motion.h2 
              style={{ 
                margin: '0', 
                fontSize: 'var(--text-2xl)', 
                fontWeight: '800',
                fontFamily: 'var(--font-display)'
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {greeting}，{userInfo?.name || '朋友'}
            </motion.h2>
            <motion.p 
              style={{ 
                margin: 'var(--space-sm) 0 0 0', 
                opacity: 0.9, 
                fontSize: 'var(--text-sm)',
                fontWeight: '500'
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 0.9, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {currentTime.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </motion.p>
          </div>
          
          <motion.div 
            style={{ textAlign: 'right' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-xs)' }}>
              {getFortuneEmoji(fortuneLevel)}
            </div>
            <div style={{ 
              fontSize: 'var(--text-sm)', 
              opacity: 0.9,
              fontWeight: '600'
            }}>
              {currentTime.toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </div>
          </motion.div>
        </div>

        {loading ? (
          <motion.div 
            style={{ textAlign: 'center', padding: 'var(--space-lg)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              ✨
            </motion.div>
            <p style={{ fontSize: 'var(--text-base)', fontWeight: '500' }}>
              正在为您准备今日运势...
            </p>
          </motion.div>
        ) : dailyFortune ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: 'var(--radius-xl)', 
              padding: 'var(--space-lg)',
              marginBottom: 'var(--space-md)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 'var(--space-md)'
              }}>
                <span style={{ 
                  fontSize: 'var(--text-lg)', 
                  fontWeight: '700',
                  fontFamily: 'var(--font-display)'
                }}>
                  今日运势
                </span>
                <motion.span 
                  style={{ 
                    fontSize: 'var(--text-xl)', 
                    fontWeight: '800',
                    color: '#fef3cd',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {fortuneLevel}
                </motion.span>
              </div>

              {/* 运势详情网格 */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-lg)'
              }}>
                {['财运', '健康', '事业', '感情'].map((category, index) => (
                  <motion.div
                    key={category}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-md)',
                      textAlign: 'center',
                      backdropFilter: 'blur(5px)'
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                  >
                    <div style={{ fontSize: 'var(--text-xs)', opacity: 0.8, marginBottom: '2px' }}>
                      {category}
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: '600' }}>
                      {'★'.repeat(3 + (index % 3))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 幸运元素 */}
            {dailyFortune.lucky_colors && dailyFortune.lucky_colors.length > 0 && (
              <motion.div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 'var(--space-sm)', 
                  marginBottom: 'var(--space-lg)',
                  flexWrap: 'wrap'
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <span style={{ 
                  fontSize: 'var(--text-sm)', 
                  opacity: 0.9,
                  fontWeight: '600'
                }}>
                  🎨 幸运色彩：
                </span>
                <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                  {dailyFortune.lucky_colors.slice(0, 3).map((color, index) => (
                    <motion.span 
                      key={index}
                      style={{
                        background: 'rgba(255,255,255,0.25)',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: '600',
                        backdropFilter: 'blur(5px)'
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {color}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            <div style={{ textAlign: 'center' }}>
              <motion.button
                onClick={() => onNavigate('daily-fortune')}
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-md) var(--space-xl)',
                  color: 'white',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  fontFamily: 'var(--font-display)'
                }}
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: 'rgba(255,255,255,0.35)',
                  boxShadow: '0 8px 32px rgba(255,255,255,0.2)'
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                🔮 查看详细运势
              </motion.button>
            </div>
          </motion.div>
        ) : userInfo ? (
          <motion.div 
            style={{ textAlign: 'center', padding: 'var(--space-lg)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>🌸</div>
            <p style={{ marginBottom: 'var(--space-lg)', fontSize: 'var(--text-base)' }}>
              今日运势暂无数据
            </p>
            <motion.button
              onClick={() => onNavigate('daily-fortune')}
              style={{
                background: 'rgba(255,255,255,0.25)',
                border: '2px solid rgba(255,255,255,0.4)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-md) var(--space-xl)',
                color: 'white',
                fontSize: 'var(--text-sm)',
                fontWeight: '700',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📊 获取今日运势
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            style={{ textAlign: 'center', padding: 'var(--space-lg)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>👋</div>
            <p style={{ marginBottom: 'var(--space-lg)', fontSize: 'var(--text-base)' }}>
              欢迎使用神仙朋友
            </p>
            <motion.button
              onClick={() => onNavigate('settings')}
              style={{
                background: 'rgba(255,255,255,0.25)',
                border: '2px solid rgba(255,255,255,0.4)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-md) var(--space-xl)',
                color: 'white',
                fontSize: 'var(--text-sm)',
                fontWeight: '700',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ⚙️ 完善个人信息
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  // 🎯 主要功能区域
  const mainFeatures = [
    {
      icon: '💬',
      title: '与神对话',
      subtitle: '获得智慧指引',
      color: '#0ea5e9',
      action: () => onNavigate('deity-chat'),
      highlight: true
    },
    {
      icon: '📿',
      title: '手串状态',
      subtitle: '功德圆满进度',
      color: '#22c55e',
      action: () => onNavigate('bracelet')
    },
    {
      icon: '📊',
      title: '命理分析',
      subtitle: '深度八字解读',
      color: '#f59e0b',
      action: () => onNavigate('bazi-analysis')
    },
    {
      icon: '⚙️',
      title: '个人设置',
      subtitle: '偏好与隐私',
      color: '#6b7280',
      action: () => onNavigate('settings')
    }
  ];

  // 🚀 快速操作
  const quickActions = [
    { emoji: '🎯', label: '每日签到', action: () => console.log('签到') },
    { emoji: '🎁', label: '运势提醒', action: () => console.log('提醒') },
    { emoji: '📚', label: '学习中心', action: () => console.log('学习') },
    { emoji: '👥', label: '社区交流', action: () => console.log('社区') }
  ];

  return (
    <motion.div
      className="divine-home-immersive"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent'
      }}
    >
      {/* 运势概览卡片 */}
      <FortuneOverview />

      {/* 主要功能网格 */}
      <motion.div
        variants={itemVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-xl)'
        }}
      >
        {mainFeatures.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            subtitle={feature.subtitle}
            color={feature.color}
            onClick={feature.action}
            highlight={feature.highlight}
          />
        ))}
      </motion.div>

      {/* 🚀 神秘快速操作栏 */}
      <motion.div
        variants={itemVariants}
        className="divine-shimmer"
        style={{
          background: 'var(--gradient-glass)',
          borderRadius: 'var(--card-radius)',
          padding: 'var(--space-xl)',
          backdropFilter: 'blur(25px) saturate(180%)',
          border: '2px solid var(--border-ethereal)',
          boxShadow: 'var(--shadow-celestial)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <h3 style={{
          margin: '0 0 var(--space-lg) 0',
          fontSize: '1.3rem',
          fontWeight: '800',
          color: 'var(--divine-gold)',
          textAlign: 'center',
          fontFamily: 'var(--font-divine)',
          textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          zIndex: 2
        }}>
          ✨ 神秘操作
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--space-md)'
        }}>
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              onClick={action.action}
              style={{
                background: 'var(--gradient-glass)',
                border: '1px solid var(--border-shadow)',
                borderRadius: 'var(--button-radius)',
                padding: 'var(--space-lg)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                transition: 'all var(--duration-normal) var(--ease-celestial)',
                backdropFilter: 'blur(15px)',
                position: 'relative',
                overflow: 'hidden'
              }}
              whileHover={{
                scale: 1.1,
                backgroundColor: 'var(--gradient-mystic)',
                boxShadow: 'var(--shadow-mystic)',
                borderColor: 'var(--border-celestial)'
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
            >
              <div style={{ 
                fontSize: '2rem',
                filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))',
                transition: 'all var(--duration-normal) var(--ease-divine)'
              }}>
                {action.emoji}
              </div>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: '700',
                color: 'var(--text-mystic)',
                textAlign: 'center',
                lineHeight: 1.3,
                fontFamily: 'var(--font-mystic)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                zIndex: 2
              }}>
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 🌟 神秘浮动装饰元素 */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`cosmic-orb-${i}`}
          className="floating-orb zen-glow"
          style={{
            position: 'absolute',
            width: `${15 + i * 8}px`,
            height: `${15 + i * 8}px`,
            background: `radial-gradient(circle, var(--divine-gold) 0%, var(--mystic-purple) 50%, transparent 100%)`,
            borderRadius: '50%',
            top: `${5 + i * 12}%`,
            left: `${3 + i * 11}%`,
            zIndex: -1,
            opacity: 0.6,
            filter: 'blur(2px)',
            boxShadow: `0 0 ${10 + i * 5}px rgba(255, 215, 0, 0.4)`
          }}
          animate={{
            y: [-30, 30, -30],
            x: [-15, 15, -15],
            scale: [0.8, 1.4, 0.8],
            opacity: [0.3, 0.8, 0.3],
            rotate: [0, 360, 0]
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5
          }}
        />
      ))}
      
      {/* ✨ 神秘粒子效果 */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          style={{
            position: 'absolute',
            width: '3px',
            height: '3px',
            background: i % 2 === 0 ? 'var(--divine-gold)' : 'var(--mystic-purple)',
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            zIndex: -1,
            opacity: 0.7
          }}
          animate={{
            y: [-50, 50, -50],
            x: [-25, 25, -25],
            opacity: [0.3, 0.9, 0.3],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: 8 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3
          }}
        />
      ))}
    </motion.div>
  );
};

export default MobileHomePage; 