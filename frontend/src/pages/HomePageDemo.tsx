import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HomePageDemoProps {
  onNavigate: (page: string) => void;
}

// 🎭 演示模式状态
type DemoState = 'initial' | 'bazi-setup' | 'bracelet-activation' | 'complete';

// 🎨 设计系统
const designSystem = {
  colors: {
    primary: '#D4AF37',
    success: '#10B981',
    warning: '#F59E0B',
    background: 'linear-gradient(135deg, #0F1419 0%, #1A1B26 50%, #2D2E3F 100%)',
    card: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    textMuted: 'rgba(255, 255, 255, 0.6)'
  },
  shadows: {
    card: '0 8px 32px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(212, 175, 55, 0.3)'
  },
  animation: {
    spring: { type: "spring", stiffness: 300, damping: 30 },
    smooth: { duration: 0.4, ease: "easeInOut" }
  }
};

// 🎲 演示数据
const mockFortuneData = {
  date: '2024年12月18日',
  overall_score: 92,
  overall_level: '极好',
  overall_description: '今日是您与菩萨缘分最深的一天，诸事皆宜，财运亨通，贵人相助，是难得的吉日',
  career_fortune: { score: 95, description: '事业运势极佳', advice: ['适合签署重要合同', '与上级沟通效果佳'] },
  wealth_fortune: { score: 88, description: '财运亨通', advice: ['投资理财时机良好', '意外收入可能出现'] },
  health_fortune: { score: 90, description: '身体健康', advice: ['早睡早起', '适度运动'] },
  relationship_fortune: { score: 85, description: '人际关系和谐', advice: ['主动联系老友', '化解误会良机'] },
  lucky_colors: ['金色', '红色'],
  lucky_numbers: [8, 18, 28],
  lucky_directions: ['东南', '正南'],
  recommended_activities: ['签约', '投资', '社交'],
  avoid_activities: ['争吵', '大额消费']
};

const mockGuidance = {
  morning: '早晨7-9点适合处理重要工作，今日幸运方位为东南方',
  afternoon: '下午1-3点宜与人沟通合作，避免冲动决策',
  evening: '夜晚9-11点可静心冥想，穿戴金色饰品有助运势',
  specialReminder: '特别提醒：今日幸运数字为8、18、28，可多加运用'
};

const HomePageDemo: React.FC<HomePageDemoProps> = ({ onNavigate }) => {
  const [demoState, setDemoState] = useState<DemoState>('initial');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'fortune' | 'guidance'>('fortune');
  const [showNotification, setShowNotification] = useState(false);

  // 🚀 演示流程控制
  const progressDemo = () => {
    switch (demoState) {
      case 'initial':
        setDemoState('bazi-setup');
        showSuccessNotification('八字设置完成！');
        break;
      case 'bazi-setup':
        setDemoState('bracelet-activation');
        showSuccessNotification('手串激活成功！');
        break;
      case 'bracelet-activation':
        setDemoState('complete');
        showSuccessNotification('神仙朋友服务已开启！');
        break;
      default:
        break;
    }
  };

  // 📢 显示成功通知
  const showSuccessNotification = (message: string) => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // 📊 计算进度
  const getProgress = () => {
    switch (demoState) {
      case 'initial': return 0;
      case 'bazi-setup': return 60;
      case 'bracelet-activation': return 90;
      case 'complete': return 100;
      default: return 0;
    }
  };

  // 🎯 获取状态信息
  const getStateInfo = () => {
    switch (demoState) {
      case 'initial':
        return {
          title: '开启您的神仙之旅',
          description: '设置您的八字信息，获取专属的每日运势指引',
          buttonText: '🔮 设置八字信息',
          icon: '✨'
        };
      case 'bazi-setup':
        return {
          title: '激活您的专属手串',
          description: '激活手串后，即可享受完整的神仙朋友服务',
          buttonText: '📿 激活手串',
          icon: '📿'
        };
      case 'bracelet-activation':
        return {
          title: '正在连接神仙网络...',
          description: '即将为您呈现完整的运势指引体验',
          buttonText: '🚀 完成设置',
          icon: '🔮'
        };
      default:
        return null;
    }
  };

  // 🕐 时间问候
  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 9) return { text: '晨光初现，新的一天开始了', icon: '🌅' };
    if (hour < 12) return { text: '上午好，愿您今日顺遂', icon: '☀️' };
    if (hour < 18) return { text: '下午好，继续加油', icon: '🌤️' };
    return { text: '夜幕降临，愿您安康', icon: '🌆' };
  };

  // 🎨 运势样式
  const getFortuneStyle = (level: string) => {
    return {
      color: '#10B981',
      icon: '🌟',
      bg: 'linear-gradient(135deg, #10B981, #059669)'
    };
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const greeting = getTimeGreeting();
  const stateInfo = getStateInfo();

  return (
    <div style={{
      minHeight: '100vh',
      background: designSystem.colors.background,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 通知横幅 */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '15px',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
              zIndex: 1000,
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            ✅ 设置完成！体验升级中...
          </motion.div>
        )}
      </AnimatePresence>

      {/* 演示控制器 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '15px',
          padding: '1rem',
          zIndex: 1000,
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <div style={{
          color: designSystem.colors.textSecondary,
          fontSize: '0.75rem',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          🎭 演示模式
        </div>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexDirection: 'column'
        }}>
          <button
            onClick={() => setDemoState('initial')}
            style={{
              background: demoState === 'initial' ? designSystem.colors.primary : 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              padding: '0.5rem',
              color: 'white',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            初始状态
          </button>
          <button
            onClick={() => setDemoState('complete')}
            style={{
              background: demoState === 'complete' ? designSystem.colors.primary : 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              padding: '0.5rem',
              color: 'white',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            完整体验
          </button>
        </div>
      </motion.div>

      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
        zIndex: -1
      }} />

      {/* 粒子系统 */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            background: designSystem.colors.primary,
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.6
          }}
          animate={{
            y: [-20, 20],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2
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
                background: demoState === 'complete' ? designSystem.colors.success : designSystem.colors.warning,
                borderRadius: '50%'
              }}
            />
            {demoState === 'complete' ? '手串已连接' : '待激活'}
          </div>
        </motion.div>

        {/* 问候区域 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
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
            道友，菩萨在此护佑您
          </p>
        </motion.div>

        {/* 主要内容 */}
        <AnimatePresence mode="wait">
          {demoState !== 'complete' && stateInfo ? (
            <motion.div
              key="guidance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
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
                  {stateInfo.icon}
                </motion.div>
                
                <h3 style={{
                  color: designSystem.colors.textPrimary,
                  fontSize: '1.25rem',
                  marginBottom: '0.5rem'
                }}>
                  {stateInfo.title}
                </h3>
                
                <p style={{
                  color: designSystem.colors.textSecondary,
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}>
                  {stateInfo.description}
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
                  animate={{ width: `${getProgress()}%` }}
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
                color: designSystem.colors.textMuted,
                marginBottom: '1rem'
              }}>
                <span>设置进度</span>
                <span>{getProgress()}%</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={progressDemo}
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
                  boxShadow: designSystem.shadows.glow
                }}
              >
                {stateInfo.buttonText}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* 完整运势展示 */}
              <motion.div
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
                      今日运势 • {mockFortuneData.date}
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
                      background: getFortuneStyle(mockFortuneData.overall_level).bg,
                      borderRadius: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '1.2rem' }}>🌟</div>
                    <div style={{ fontSize: '1.2rem' }}>{mockFortuneData.overall_score}</div>
                  </motion.div>
                </div>

                {/* 运势描述 */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '15px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  borderLeft: '4px solid #10B981'
                }}>
                  <p style={{
                    color: designSystem.colors.textPrimary,
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    margin: 0,
                    fontStyle: 'italic'
                  }}>
                    "{mockFortuneData.overall_description}"
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
                      style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}
                    >
                      {[
                        { label: '事业', icon: '💼', data: mockFortuneData.career_fortune },
                        { label: '财运', icon: '💰', data: mockFortuneData.wealth_fortune },
                        { label: '健康', icon: '🏥', data: mockFortuneData.health_fortune },
                        { label: '感情', icon: '💕', data: mockFortuneData.relationship_fortune }
                      ].map((category, index) => (
                        <motion.div
                          key={category.label}
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
                            color: '#10B981'
                          }}>
                            {category.data.score}分
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="guidance"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                    >
                      {[
                        { time: '上午', content: mockGuidance.morning, icon: '🌅' },
                        { time: '下午', content: mockGuidance.afternoon, icon: '☀️' },
                        { time: '晚上', content: mockGuidance.evening, icon: '🌙' }
                      ].map((item, index) => (
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
                          <div style={{ fontSize: '1.25rem', flexShrink: 0, marginTop: '0.125rem' }}>
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
                          {mockGuidance.specialReminder}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* 快捷功能 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem'
                }}
              >
                {[
                  { icon: '💬', title: '与神对话', desc: '智慧指引' },
                  { icon: '📿', title: '手串状态', desc: '功德进度' },
                  { icon: '📊', title: '命理分析', desc: '八字解读' },
                  { icon: '⚙️', title: '个人设置', desc: '偏好配置' }
                ].map((action, index) => (
                  <motion.div
                    key={action.title}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: index === 0 
                        ? `linear-gradient(135deg, ${designSystem.colors.primary}20 0%, ${designSystem.colors.primary}10 100%)`
                        : designSystem.colors.card,
                      borderRadius: '18px',
                      padding: '1.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: index === 0 
                        ? `1px solid ${designSystem.colors.primary}40`
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: designSystem.shadows.card
                    }}
                  >
                    <div style={{
                      fontSize: '2rem',
                      marginBottom: '0.75rem',
                      filter: index === 0 ? `drop-shadow(0 0 8px ${designSystem.colors.primary}60)` : 'none'
                    }}>
                      {action.icon}
                    </div>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HomePageDemo; 