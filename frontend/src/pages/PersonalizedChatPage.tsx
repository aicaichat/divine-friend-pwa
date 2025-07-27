import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PersonalizedDeityFriend from '../components/features/deity-friend/PersonalizedDeityFriend';

const PersonalizedChatPage = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [blessing, setBlessing] = useState('');

  // 🌅 时间更新和祝福语
  useEffect(() => {
    const updateTimeAndBlessing = () => {
      const now = new Date();
      setCurrentTime(now);
      
      const hour = now.getHours();
      if (hour < 6) setBlessing('夜深人静，正是修行悟道的好时机');
      else if (hour < 9) setBlessing('晨光初照，万象更新，愿您今日如意');
      else if (hour < 12) setBlessing('上午时光，阳气正盛，适合求索智慧');
      else if (hour < 14) setBlessing('正午时分，天地能量最强，宜静心对话');
      else if (hour < 18) setBlessing('午后温暖，正是与神仙交流的美好时光');
      else if (hour < 22) setBlessing('夜幕降临，星辰指引，神仙在此等候');
      else setBlessing('夜深了，让神仙的智慧伴您入梦');
    };

    updateTimeAndBlessing();
    const timer = setInterval(updateTimeAndBlessing, 60000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <motion.div
      className="zen-chat-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        minHeight: '100vh',
        background: 'transparent',
        position: 'relative',
        padding: 'var(--space-lg)',
        paddingTop: 'var(--space-md)'
      }}
    >
      {/* 🌌 神圣背景装饰 */}
      <div className="chat-cosmic-bg" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at 30% 20%, rgba(255, 215, 0, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 70% 80%, rgba(108, 92, 231, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 20% 70%, rgba(255, 107, 107, 0.1) 0%, transparent 50%)
        `,
        zIndex: -2,
        animation: 'cosmicFlow var(--duration-eternal) ease-in-out infinite alternate'
      }} />

      {/* ✨ 神圣头部区域 */}
      <motion.div
        variants={itemVariants}
        className="zen-chat-header"
        style={{
          background: 'var(--gradient-divine)',
          borderRadius: 'var(--card-radius)',
          padding: 'var(--space-2xl)',
          marginBottom: 'var(--space-xl)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-cosmic)',
          border: '3px solid transparent',
          backgroundClip: 'padding-box'
        }}
      >
        {/* 神圣边框动画 */}
        <div style={{
          position: 'absolute',
          top: -3,
          left: -3,
          right: -3,
          bottom: -3,
          background: 'var(--gradient-divine)',
          borderRadius: 'var(--card-radius)',
          zIndex: -1,
          animation: 'fortuneBorder var(--duration-cosmic) linear infinite'
        }} />

        {/* 流动光效 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 215, 0, 0.2) 0%, transparent 50%)
          `,
          zIndex: 1,
          pointerEvents: 'none',
          animation: 'fortuneAura var(--duration-eternal) ease-in-out infinite alternate'
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <motion.h1
            style={{
              fontSize: '2rem',
              fontWeight: '900',
              fontFamily: 'var(--font-divine)',
              margin: '0 0 var(--space-md) 0',
              textShadow: `
                0 0 20px rgba(255, 215, 0, 1),
                0 0 40px rgba(255, 215, 0, 0.8),
                0 4px 8px rgba(0, 0, 0, 0.5)
              `,
              background: 'linear-gradient(135deg, #ffffff 0%, #ffd700 50%, #ffffff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            animate={{ 
              textShadow: [
                '0 0 20px rgba(255, 215, 0, 1), 0 0 40px rgba(255, 215, 0, 0.8), 0 4px 8px rgba(0, 0, 0, 0.5)',
                '0 0 30px rgba(255, 215, 0, 1), 0 0 60px rgba(255, 215, 0, 1), 0 4px 8px rgba(0, 0, 0, 0.5)',
                '0 0 20px rgba(255, 215, 0, 1), 0 0 40px rgba(255, 215, 0, 0.8), 0 4px 8px rgba(0, 0, 0, 0.5)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            🙏 与神仙对话 🙏
          </motion.h1>

          <motion.p
            style={{
              fontSize: '1.1rem',
              fontFamily: 'var(--font-celestial)',
              opacity: 0.95,
              marginBottom: 'var(--space-lg)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.95, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {blessing}
          </motion.p>

          <motion.div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--space-md)',
              fontSize: '0.9rem',
              opacity: 0.8
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.8, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <span>🕐 {currentTime.toLocaleTimeString('zh-CN', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}</span>
            <span>|</span>
            <span>📅 {currentTime.toLocaleDateString('zh-CN', {
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}</span>
          </motion.div>
        </div>

        {/* 神秘粒子效果 */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '50%',
              top: `${20 + i * 12}%`,
              left: `${10 + i * 15}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.5, 0.8]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
      </motion.div>

      {/* 💬 聊天组件容器 */}
      <motion.div
        variants={itemVariants}
        style={{
          background: 'var(--gradient-glass)',
          borderRadius: 'var(--card-radius)',
          padding: 'var(--space-lg)',
          backdropFilter: 'blur(25px) saturate(180%)',
          border: '2px solid var(--border-ethereal)',
          boxShadow: 'var(--shadow-celestial)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <PersonalizedDeityFriend />
      </motion.div>

      {/* 🌟 浮动装饰元素 */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`chat-orb-${i}`}
          className="zen-glow"
          style={{
            position: 'absolute',
            width: `${12 + i * 6}px`,
            height: `${12 + i * 6}px`,
            background: `radial-gradient(circle, var(--divine-gold) 0%, var(--mystic-purple) 70%, transparent 100%)`,
            borderRadius: '50%',
            top: `${10 + i * 18}%`,
            right: `${5 + i * 12}%`,
            zIndex: -1,
            opacity: 0.4,
            filter: 'blur(1px)',
            boxShadow: `0 0 ${8 + i * 4}px rgba(255, 215, 0, 0.6)`
          }}
          animate={{
            y: [-25, 25, -25],
            x: [-10, 10, -10],
            scale: [0.8, 1.3, 0.8],
            opacity: [0.2, 0.6, 0.2],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8
          }}
        />
      ))}
    </motion.div>
  );
};

export default PersonalizedChatPage; 