import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/apiService';

// 菩萨圣像背景图片（您可以替换为实际的图片路径）
// 千手观音菩萨背景图片
const DIVINE_BACKGROUND = "https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/%E5%8D%83%E6%89%8B%E8%A7%82%E9%9F%B3.jpg";

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
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

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
      {/* 🙏 神圣菩萨背景 */}
      <div className="divine-background-container" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -2,
        overflow: 'hidden'
      }}>
        {/* 主背景图片 */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          height: '70%',
          backgroundImage: `url(${DIVINE_BACKGROUND})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderRadius: '20px',
          opacity: 0.3,
          filter: 'blur(0.5px)',
          animation: 'zen-glow 8s ease-in-out infinite'
        }} />
        
        {/* 神圣光芒效果 */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '60%',
          background: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.3) 0%, rgba(255, 107, 107, 0.2) 40%, transparent 70%)',
          borderRadius: '50%',
          animation: 'mysticPulse 6s ease-in-out infinite'
        }} />
      </div>

      {/* 🌟 浮动祝福语 */}
      <motion.div
        variants={itemVariants}
        style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 5
        }}
      >
        <motion.div
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 107, 107, 0.8) 100%)',
            borderRadius: '25px',
            padding: '1rem 2rem',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 215, 0, 0.6)',
            boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)',
            color: 'white',
            fontFamily: '"Ma Shan Zheng", serif',
            fontSize: '1.1rem',
            fontWeight: '800',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            minWidth: '280px'
          }}
          animate={{
            scale: [1, 1.02, 1],
            boxShadow: [
              '0 8px 32px rgba(255, 215, 0, 0.4)',
              '0 12px 40px rgba(255, 215, 0, 0.6)',
              '0 8px 32px rgba(255, 215, 0, 0.4)'
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {greeting}，{userInfo?.name || '善信'}
        </motion.div>
      </motion.div>

      {/* 💫 今日运势悬浮卡片 */}
      <motion.div
        variants={itemVariants}
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '85%',
          zIndex: 3
        }}
      >
        {loading ? (
          <motion.div 
            style={{ 
              textAlign: 'center', 
              padding: '2rem',
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '20px',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 215, 0, 0.3)'
            }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🙏</div>
            <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600' }}>
              菩萨正在为您测算运势...
            </p>
          </motion.div>
        ) : dailyFortune ? (
          <motion.div
            className="fortune-floating-card"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%)',
              borderRadius: '25px',
              padding: '2rem',
              backdropFilter: 'blur(25px) saturate(180%)',
              border: '2px solid rgba(255, 215, 0, 0.4)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 32px rgba(255, 215, 0, 0.2)',
              color: 'white'
            }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4), 0 12px 40px rgba(255, 215, 0, 0.3)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <motion.div 
                style={{
                  fontSize: '2.5rem',
                  marginBottom: '0.5rem',
                  filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))'
                }}
                animate={{ 
                  scale: [1, 1.1, 1],
                  filter: [
                    'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))',
                    'drop-shadow(0 0 20px rgba(255, 215, 0, 1))',
                    'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {getFortuneEmoji(fortuneLevel)}
              </motion.div>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: '900',
                color: '#FFD700',
                fontFamily: '"Ma Shan Zheng", serif',
                textShadow: '0 0 15px rgba(255, 215, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)',
                margin: 0
              }}>
                今日运势：{fortuneLevel}
              </h2>
            </div>

            {/* 运势详情网格 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              {['财运', '健康', '事业', '感情'].map((category, index) => (
                <motion.div
                  key={category}
                  style={{
                    background: 'rgba(255, 215, 0, 0.15)',
                    borderRadius: '15px',
                    padding: '1rem',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 215, 0, 0.3)'
                  }}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 215, 0, 0.25)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.3rem', fontWeight: '600' }}>
                    {category}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#FFD700' }}>
                    {'★'.repeat(3 + (index % 3))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <motion.button
                onClick={() => onNavigate('daily-fortune')}
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FF6B6B 100%)',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '1rem 2rem',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
                  fontFamily: '"Ma Shan Zheng", serif'
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 12px 35px rgba(255, 215, 0, 0.6)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                🔮 查看详细运势
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 215, 0, 0.3)'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌸</div>
            <p style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              欢迎来到神仙朋友
            </p>
            <motion.button
              onClick={() => onNavigate('settings')}
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FF6B6B 100%)',
                border: 'none',
                borderRadius: '20px',
                padding: '1rem 2rem',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ⚙️ 完善个人信息
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* 🎯 功能快捷入口 */}
      <motion.div
        variants={itemVariants}
        style={{
          position: 'absolute',
          bottom: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          zIndex: 4
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem'
        }}>
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              onClick={feature.action}
              style={{
                background: feature.highlight 
                  ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 107, 107, 0.8) 100%)'
                  : 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%)',
                borderRadius: '20px',
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(20px)',
                border: feature.highlight 
                  ? '2px solid rgba(255, 215, 0, 0.8)'
                  : '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: feature.highlight 
                  ? '0 15px 45px rgba(255, 215, 0, 0.3)'
                  : '0 10px 30px rgba(0, 0, 0, 0.3)',
                color: 'white'
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: feature.highlight 
                  ? '0 20px 60px rgba(255, 215, 0, 0.4)'
                  : '0 15px 40px rgba(0, 0, 0, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <motion.div 
                style={{ 
                  fontSize: '2.5rem', 
                  marginBottom: '0.5rem',
                  filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))'
                }}
                whileHover={{ 
                  scale: 1.2, 
                  rotate: 10,
                  filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 1))'
                }}
              >
                {feature.icon}
              </motion.div>
              
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '800',
                margin: '0 0 0.3rem 0',
                fontFamily: '"Ma Shan Zheng", serif',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
              }}>
                {feature.title}
              </h3>
              
              <p style={{
                fontSize: '0.85rem',
                opacity: 0.9,
                margin: 0,
                lineHeight: 1.4
              }}>
                {feature.subtitle}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ✨ 神圣粒子系统 */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`divine-particle-${i}`}
          style={{
            position: 'absolute',
            width: i % 3 === 0 ? '4px' : '2px',
            height: i % 3 === 0 ? '4px' : '2px',
            background: i % 2 === 0 ? '#FFD700' : '#FFFFFF',
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            zIndex: 1,
            opacity: 0.8,
            filter: 'blur(0.5px)',
            boxShadow: '0 0 6px rgba(255, 215, 0, 0.8)'
          }}
          animate={{
            y: [-40, 40, -40],
            x: [-20, 20, -20],
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5
          }}
        />
      ))}
    </motion.div>
  );
};

export default MobileHomePage;