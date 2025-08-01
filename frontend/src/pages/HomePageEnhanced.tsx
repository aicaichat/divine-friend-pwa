import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HomePageEnhancedProps {
  onNavigate: (page: string) => void;
}

// 🎯 今日运势示例数据（为未设置八字的用户展示）
const todayFortuneExample = {
  date: new Date().toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }),
  overall: {
    score: 78,
    trend: 'rising',
    description: '今日运势整体向好，适合新的开始'
  },
  elements: {
    love: { score: 82, tip: '感情运势较佳，适合表达心意' },
    career: { score: 75, tip: '工作中保持积极态度，会有好的回报' },
    wealth: { score: 80, tip: '财运稳定，适合理性投资' },
    health: { score: 70, tip: '注意休息，保持规律作息' }
  },
  luckyNumbers: [7, 14, 23],
  luckyColors: ['金色', '蓝色'],
  luckyDirection: '东南方',
  suggestion: '今日宜：谈判、签约、求财；忌：争执、冲动决定'
};

const HomePageEnhanced: React.FC<HomePageEnhancedProps> = ({ onNavigate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userState, setUserState] = useState({
    hasBaziSetup: false,
    hasBraceletActivated: false,
    userName: '游客用户'
  });
  const [showFortunePreview, setShowFortunePreview] = useState(false);
  const [step, setStep] = useState<'welcome' | 'preview' | 'guide'>('welcome');

  // 🌅 获取问候语
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return { text: '夜深了，愿您好梦', icon: '🌙' };
    if (hour < 12) return { text: '上午好，愿您今日顺遂', icon: '☀️' };
    if (hour < 18) return { text: '下午好，继续加油', icon: '🌤️' };
    if (hour < 22) return { text: '夜幕降临，愿您安康', icon: '🌆' };
    return { text: '夜深人静，祝您安眠', icon: '🌌' };
  };

  // 🔍 检查用户状态
  const checkUserState = () => {
    const userInfo = localStorage.getItem('userInfo');
    const braceletStatus = localStorage.getItem('braceletActivated');
    
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        const hasBaziSetup = !!(parsed.name && parsed.gender && 
          (parsed.birthdate || (parsed.birthYear && parsed.birthMonth && parsed.birthDay)));
        
        setUserState({
          hasBaziSetup,
          hasBraceletActivated: braceletStatus === 'true',
          userName: parsed.name || '游客用户'
        });
      } catch (error) {
        console.error('解析用户信息失败:', error);
      }
    }
  };

  // 🎬 开始体验流程
  const startExperience = () => {
    setStep('preview');
    setShowFortunePreview(true);
  };

  // 🎯 进入设置
  const startSetup = () => {
    onNavigate('settings-enhanced');
  };

  // 🔄 查看更多运势
  const viewMoreFortune = () => {
    setStep('guide');
  };

  // 初始化
  useEffect(() => {
    checkUserState();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 监听页面可见性变化
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkUserState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const greeting = getGreeting();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0B1426 0%, #1A1B26 40%, #2D2E3F 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 🌟 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.06) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)
        `,
        zIndex: 0
      }} />

      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        padding: '2rem 1rem 8rem 1rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* 🌅 问候区域 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            textAlign: 'center',
            marginBottom: '3rem'
          }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ fontSize: '3rem', marginBottom: '1rem' }}
          >
            {greeting.icon}
          </motion.div>
          
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 0.5rem 0'
          }}>
            {greeting.text}
          </h1>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
            margin: 0
          }}>
            {userState.userName}，菩萨在此护佑您
          </p>
        </motion.div>

        {/* 🎭 主要交互区域 */}
        <AnimatePresence mode="wait">
          {/* 欢迎阶段 */}
          {step === 'welcome' && !userState.hasBaziSetup && (
            <motion.div
              key="welcome"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: '4rem', marginBottom: '1.5rem' }}
              >
                ✨
              </motion.div>
              
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 1rem 0'
              }}>
                开启您的神仙之旅
              </h2>
              
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                margin: '0 0 2rem 0'
              }}>
                每个人都有独特的命运轨迹<br/>
                让我们先看看今日的运势，体验神仙朋友的魅力
              </p>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={startExperience}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px rgba(212, 175, 55, 0.3)'
                }}
              >
                🔮 体验今日运势
              </motion.button>

              <p style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.8rem',
                marginTop: '1rem',
                margin: 0
              }}>
                👆 先看看运势示例，再设置专属八字
              </p>
            </motion.div>
          )}

          {/* 运势预览阶段 */}
          {step === 'preview' && (
            <motion.div
              key="preview"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '2rem',
                  marginBottom: '1.5rem',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    style={{ fontSize: '2.5rem', marginBottom: '1rem' }}
                  >
                    🌟
                  </motion.div>
                  
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    color: 'white',
                    margin: '0 0 0.5rem 0'
                  }}>
                    今日运势预览
                  </h3>
                  
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                    margin: 0
                  }}>
                    以今日出生的人为例 • {todayFortuneExample.date}
                  </p>
                </div>

                {/* 综合运势 */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      综合运势
                    </span>
                    <div style={{
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      fontWeight: '700'
                    }}>
                      {todayFortuneExample.overall.score}分
                    </div>
                  </div>
                  
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {todayFortuneExample.overall.description}
                  </p>
                </div>

                {/* 运势详情 */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  {Object.entries(todayFortuneExample.elements).map(([key, data], index) => {
                    const icons = {
                      love: '💝',
                      career: '💼',
                      wealth: '💰',
                      health: '🍃'
                    };
                    const names = {
                      love: '感情',
                      career: '事业',
                      wealth: '财运',
                      health: '健康'
                    };
                    
                    return (
                      <motion.div
                        key={key}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '12px',
                          padding: '1rem',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                          {icons[key as keyof typeof icons]}
                        </div>
                        <div style={{
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          marginBottom: '0.25rem'
                        }}>
                          {names[key as keyof typeof names]}
                        </div>
                        <div style={{
                          color: data.score >= 80 ? '#10B981' : data.score >= 60 ? '#F59E0B' : '#EF4444',
                          fontSize: '1.1rem',
                          fontWeight: '700'
                        }}>
                          {data.score}分
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* 幸运元素 */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(245, 158, 11, 0.1))',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <h4 style={{
                    color: '#D4AF37',
                    fontSize: '1rem',
                    fontWeight: '600',
                    margin: '0 0 1rem 0'
                  }}>
                    🍀 今日幸运
                  </h4>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    fontSize: '0.85rem'
                  }}>
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>幸运数字</span>
                      <div style={{ color: 'white', fontWeight: '600', marginTop: '0.25rem' }}>
                        {todayFortuneExample.luckyNumbers.join(', ')}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>幸运方位</span>
                      <div style={{ color: 'white', fontWeight: '600', marginTop: '0.25rem' }}>
                        {todayFortuneExample.luckyDirection}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>幸运颜色</span>
                      <div style={{ color: 'white', fontWeight: '600', marginTop: '0.25rem' }}>
                        {todayFortuneExample.luckyColors.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep('welcome')}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '16px',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    ← 返回
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={viewMoreFortune}
                    style={{
                      flex: 2,
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                      border: 'none',
                      borderRadius: '16px',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)'
                    }}
                  >
                    ✨ 想要专属运势？
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* 引导设置阶段 */}
          {step === 'guide' && (
            <motion.div
              key="guide"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
              }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ fontSize: '4rem', marginBottom: '1.5rem' }}
              >
                🎯
              </motion.div>
              
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 1rem 0'
              }}>
                获取您的专属运势
              </h2>
              
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                margin: '0 0 1.5rem 0'
              }}>
                刚才看到的只是通用运势示例<br/>
                设置您的八字信息后，每天都能获得：
              </p>

              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                {[
                  { icon: '🎯', text: '专属个人运势分析' },
                  { icon: '📅', text: '每日定制化指引' },
                  { icon: '🔮', text: '精准的时运建议' },
                  { icon: '💎', text: '个性化幸运提醒' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: index < 3 ? '1rem' : 0,
                      color: 'white',
                      fontSize: '0.9rem'
                    }}
                  >
                    <span style={{ marginRight: '1rem', fontSize: '1.2rem' }}>
                      {item.icon}
                    </span>
                    {item.text}
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 15px 35px rgba(212, 175, 55, 0.4)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={startSetup}
                style={{
                  width: '100%',
                  padding: '1.2rem',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px rgba(212, 175, 55, 0.3)',
                  marginBottom: '1rem'
                }}
              >
                🔮 立即设置我的八字
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('preview')}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                再看看运势示例
              </motion.button>
            </motion.div>
          )}

          {/* 已设置八字的用户 */}
          {userState.hasBaziSetup && (
            <motion.div
              key="completed"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '24px',
                padding: '2rem',
                textAlign: 'center'
              }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{ fontSize: '3rem', marginBottom: '1rem' }}
              >
                ✅
              </motion.div>
              
              <h2 style={{
                fontSize: '1.3rem',
                fontWeight: '700',
                color: '#10B981',
                margin: '0 0 0.5rem 0'
              }}>
                您的神仙之旅已开启！
              </h2>
              
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9rem',
                margin: '0 0 1.5rem 0'
              }}>
                您的专属运势正在为您生成中...
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('fortune')}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
                }}
              >
                🔮 查看我的专属运势
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HomePageEnhanced; 