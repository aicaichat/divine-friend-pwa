import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/apiService';

const MobileDailyFortunePage = ({ onNavigate }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [dailyFortune, setDailyFortune] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('overall');

  // 📊 数据加载
  useEffect(() => {
    loadFortuneData();
  }, []);

  const loadFortuneData = async () => {
    try {
      const savedUserInfo = localStorage.getItem('userInfo');
      if (savedUserInfo) {
        const info = JSON.parse(savedUserInfo);
        setUserInfo(info);

        if (info.birthdate) {
          const fortuneResponse = await apiService.calculateDailyFortune({
            birthdate: info.birthdate,
            name: info.name,
            gender: info.gender
          });
          
          if (fortuneResponse.success) {
            setDailyFortune(fortuneResponse.data);
          }
        }
      }
    } catch (error) {
      console.error('运势数据加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFortuneData();
    setRefreshing(false);
  };

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

  const getGradientForLevel = (level) => {
    const gradientMap = {
      '极好': 'linear-gradient(135deg, #22c55e, #16a34a)',
      '很好': 'linear-gradient(135deg, #16a34a, #65a30d)',
      '好': 'linear-gradient(135deg, #65a30d, #84cc16)',
      '一般': 'linear-gradient(135deg, #f59e0b, #d97706)',
      '差': 'linear-gradient(135deg, #ea580c, #dc2626)',
      '很差': 'linear-gradient(135deg, #dc2626, #b91c1c)'
    };
    return gradientMap[level] || 'linear-gradient(135deg, #6b7280, #4b5563)';
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

  // 🎨 运势详情卡片组件
  const FortuneDetailCard = ({ title, items, icon, color }) => (
    <motion.div
      variants={itemVariants}
      className="fortune-detail-card"
      style={{
        background: 'var(--glass-light)',
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-lg)',
        border: `2px solid ${color}20`,
        backdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: `0 8px 32px ${color}15`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: -30,
        right: -30,
        width: 80,
        height: 80,
        background: `radial-gradient(circle, ${color}15, transparent)`,
        borderRadius: '50%'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-lg)'
        }}>
          <motion.div 
            style={{
              fontSize: '2rem',
              padding: 'var(--space-md)',
              background: `${color}15`,
              borderRadius: 'var(--radius-xl)',
              border: `2px solid ${color}30`
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {icon}
          </motion.div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: 'var(--text-xl)',
              fontWeight: '800',
              color: color,
              fontFamily: 'var(--font-display)'
            }}>
              {title}
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {items.map((item, index) => (
            <motion.div
              key={index}
              style={{
                padding: 'var(--space-md)',
                background: `${color}08`,
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${color}20`,
                fontSize: 'var(--text-sm)',
                color: 'var(--neutral-700)',
                lineHeight: 1.6
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // 🏆 分数显示组件
  const ScoreDisplay = ({ label, value, maxValue = 100, color }) => {
    const percentage = (value / maxValue) * 100;
    
    return (
      <motion.div
        variants={itemVariants}
        style={{
          background: 'var(--glass-light)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-lg)',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          border: `2px solid ${color}20`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{
          fontSize: 'var(--text-sm)',
          fontWeight: '600',
          color: 'var(--neutral-600)',
          marginBottom: 'var(--space-sm)'
        }}>
          {label}
        </div>
        
        <motion.div
          style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: color,
            marginBottom: 'var(--space-sm)',
            fontFamily: 'var(--font-display)'
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
        >
          {value}
        </motion.div>
        
        {/* 进度环 */}
        <div style={{ position: 'relative', width: '60px', height: '60px', margin: '0 auto' }}>
          <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle
              cx="30"
              cy="30"
              r="25"
              fill="none"
              stroke={`${color}20`}
              strokeWidth="4"
            />
            <motion.circle
              cx="30"
              cy="30"
              r="25"
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 25}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 25 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 25 * (1 - percentage / 100) }}
              transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 'var(--text-xs)',
            fontWeight: '700',
            color: color
          }}>
            {Math.round(percentage)}%
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <motion.div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: 'var(--space-xl)'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          🔮
        </motion.div>
        <h2 style={{
          fontSize: 'var(--text-xl)',
          fontWeight: '700',
          color: 'var(--neutral-800)',
          marginBottom: 'var(--space-md)',
          textAlign: 'center'
        }}>
          正在为您解析今日运势
        </h2>
        <p style={{
          fontSize: 'var(--text-base)',
          color: 'var(--neutral-600)',
          textAlign: 'center',
          lineHeight: 1.6
        }}>
          星象运转，命理显现...
        </p>
      </motion.div>
    );
  }

  if (!dailyFortune) {
    return (
      <motion.div
        style={{
          padding: 'var(--space-xl)',
          textAlign: 'center',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}>🌸</div>
        <h2 style={{
          fontSize: 'var(--text-xl)',
          fontWeight: '700',
          color: 'var(--neutral-800)',
          marginBottom: 'var(--space-md)'
        }}>
          暂无运势数据
        </h2>
        <p style={{
          fontSize: 'var(--text-base)',
          color: 'var(--neutral-600)',
          marginBottom: 'var(--space-xl)',
          lineHeight: 1.6
        }}>
          请先完善个人信息以获取专属运势
        </p>
        <motion.button
          onClick={() => onNavigate('settings')}
          style={{
            background: 'var(--gradient-divine)',
            border: 'none',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-md) var(--space-xl)',
            color: 'white',
            fontSize: 'var(--text-base)',
            fontWeight: '700',
            cursor: 'pointer',
            margin: '0 auto'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ⚙️ 前往设置
        </motion.button>
      </motion.div>
    );
  }

  const fortuneLevel = dailyFortune.overall_level || '中等';
  const fortuneColor = getFortuneColor(fortuneLevel);
  const fortuneEmoji = getFortuneEmoji(fortuneLevel);

  // 运势数据解构
  const categories = [
    {
      id: 'overall',
      label: '总体',
      emoji: '🌟',
      color: fortuneColor,
      score: 85
    },
    {
      id: 'wealth',
      label: '财运',
      emoji: '💰',
      color: '#f59e0b',
      score: 78
    },
    {
      id: 'health',
      label: '健康',
      emoji: '🍃',
      color: '#22c55e',
      score: 92
    },
    {
      id: 'career',
      label: '事业',
      emoji: '📈',
      color: '#3b82f6',
      score: 73
    },
    {
      id: 'love',
      label: '感情',
      emoji: '💖',
      color: '#ec4899',
      score: 66
    }
  ];

  return (
    <motion.div
      className="mobile-daily-fortune-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        minHeight: '100%',
        padding: 'var(--space-lg)',
        paddingTop: 'var(--space-md)',
        background: 'transparent'
      }}
    >
      {/* 顶部导航 */}
      <motion.div
        variants={itemVariants}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-xl)'
        }}
      >
        <motion.button
          onClick={() => onNavigate('home')}
          style={{
            background: 'var(--glass-light)',
            border: '2px solid rgba(238, 108, 25, 0.2)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-md)',
            cursor: 'pointer',
            backdropFilter: 'blur(20px)',
            fontSize: 'var(--text-lg)'
          }}
          whileHover={{ scale: 1.05, backgroundColor: 'var(--glass-medium)' }}
          whileTap={{ scale: 0.95 }}
        >
          ← 
        </motion.button>
        
        <h1 style={{
          margin: 0,
          fontSize: 'var(--text-xl)',
          fontWeight: '800',
          color: 'var(--neutral-800)',
          fontFamily: 'var(--font-display)'
        }}>
          今日运势详解
        </h1>
        
        <motion.button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            background: 'var(--glass-light)',
            border: '2px solid rgba(238, 108, 25, 0.2)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-md)',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            backdropFilter: 'blur(20px)',
            fontSize: 'var(--text-lg)',
            opacity: refreshing ? 0.6 : 1
          }}
          whileHover={!refreshing ? { scale: 1.05 } : {}}
          whileTap={!refreshing ? { scale: 0.95 } : {}}
          animate={refreshing ? { rotate: 360 } : {}}
          transition={refreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
        >
          🔄
        </motion.button>
      </motion.div>

      {/* 主运势卡片 */}
      <motion.div
        variants={itemVariants}
        style={{
          background: getGradientForLevel(fortuneLevel),
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-xl)',
          color: 'white',
          marginBottom: 'var(--space-xl)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 20px 40px ${fortuneColor}30`
        }}
      >
        {/* 背景装饰 */}
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          background: 'radial-gradient(circle, rgba(255,255,255,0.2), transparent)',
          borderRadius: '50%'
        }} />

        {/* 浮动粒子 */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: '6px',
              height: '6px',
              background: 'rgba(255,255,255,0.7)',
              borderRadius: '50%',
              top: `${20 + i * 20}%`,
              left: `${70 + i * 8}%`
            }}
            animate={{
              y: [-15, 15, -15],
              opacity: [0.7, 1, 0.7],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <motion.div
            style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {fortuneEmoji}
          </motion.div>
          
          <h2 style={{
            margin: '0 0 var(--space-md) 0',
            fontSize: 'var(--text-3xl)',
            fontWeight: '900',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            fontFamily: 'var(--font-display)'
          }}>
            {fortuneLevel}
          </h2>
          
          <p style={{
            margin: '0 0 var(--space-lg) 0',
            fontSize: 'var(--text-base)',
            opacity: 0.9,
            lineHeight: 1.6
          }}>
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
          
          <motion.div
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-lg)',
              backdropFilter: 'blur(10px)',
              fontSize: 'var(--text-base)',
              lineHeight: 1.6
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {dailyFortune.today_advice || '今日宜保持平和心态，顺应自然规律，积极面对挑战。'}
          </motion.div>
        </div>
      </motion.div>

      {/* 运势分数网格 */}
      <motion.div
        variants={itemVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)'
        }}
      >
        {categories.slice(1, 4).map((category, index) => (
          <ScoreDisplay
            key={category.id}
            label={category.label}
            value={category.score}
            color={category.color}
          />
        ))}
      </motion.div>

      {/* 感情运势单独显示 */}
      <motion.div
        variants={itemVariants}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)'
        }}
      >
        <ScoreDisplay
          label="感情"
          value={66}
          color="#ec4899"
        />
        <motion.div
          style={{
            background: 'var(--glass-light)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-lg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(238, 108, 25, 0.1)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>🎯</div>
          <div style={{
            fontSize: 'var(--text-sm)',
            fontWeight: '600',
            color: 'var(--neutral-600)',
            textAlign: 'center'
          }}>
            综合指数
          </div>
          <div style={{
            fontSize: 'var(--text-xl)',
            fontWeight: '800',
            color: fortuneColor,
            fontFamily: 'var(--font-display)'
          }}>
            {Math.round((85 + 78 + 92 + 73 + 66) / 5)}
          </div>
        </motion.div>
      </motion.div>

      {/* 幸运信息 */}
      {dailyFortune.lucky_colors && (
        <FortuneDetailCard
          title="幸运色彩"
          icon="🎨"
          color="#f59e0b"
          items={dailyFortune.lucky_colors}
        />
      )}

      {dailyFortune.lucky_numbers && (
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <FortuneDetailCard
            title="幸运数字"
            icon="🔢"
            color="#3b82f6"
            items={dailyFortune.lucky_numbers}
          />
        </div>
      )}

      {/* 建议事项 */}
      <div style={{ marginTop: 'var(--space-lg)' }}>
        <FortuneDetailCard
          title="今日宜忌"
          icon="📝"
          color="#22c55e"
          items={[
            '宜：保持积极心态，多与他人交流',
            '宜：适量运动，注意身体健康',
            '宜：处理重要事务，把握机会',
            '忌：做重大决定，避免冲动行为',
            '忌：熬夜劳累，注意休息'
          ]}
        />
      </div>

      {/* 底部操作 */}
      <motion.div
        variants={itemVariants}
        style={{
          marginTop: 'var(--space-xl)',
          display: 'flex',
          gap: 'var(--space-md)'
        }}
      >
        <motion.button
          onClick={() => onNavigate('deity-chat')}
          style={{
            flex: 1,
            background: 'var(--gradient-divine)',
            border: 'none',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-lg)',
            color: 'white',
            fontSize: 'var(--text-base)',
            fontWeight: '700',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)'
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          💬 求神指引
        </motion.button>
        
        <motion.button
          onClick={() => onNavigate('bracelet')}
          style={{
            flex: 1,
            background: 'var(--glass-light)',
            border: '2px solid rgba(238, 108, 25, 0.3)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-lg)',
            color: 'var(--neutral-800)',
            fontSize: 'var(--text-base)',
            fontWeight: '700',
            cursor: 'pointer',
            backdropFilter: 'blur(20px)',
            fontFamily: 'var(--font-display)'
          }}
          whileHover={{ scale: 1.02, backgroundColor: 'var(--glass-medium)' }}
          whileTap={{ scale: 0.98 }}
        >
          📿 查看手串
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default MobileDailyFortunePage; 