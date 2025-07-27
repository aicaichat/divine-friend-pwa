import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/apiService';
import type { AppPage } from '../types';
import { useAnalytics } from '../hooks/useAnalytics';

interface HomePageOptimizedProps {
  onNavigate: (page: AppPage) => void;
}

interface UserInfo {
  name?: string;
  birthdate?: string;
  gender?: string;
}

interface DailyFortune {
  overall_score: number;
  overall_level: string;
  overall_description: string;
}

// 🎨 优雅的设计系统
const designSystem = {
  colors: {
    primary: '#D4AF37',
    background: 'linear-gradient(135deg, #0F1419 0%, #1A1B26 50%, #2D2E3F 100%)',
    card: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    textMuted: 'rgba(255, 255, 255, 0.6)'
  },
  shadows: {
    card: '0 8px 32px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(212, 175, 55, 0.3)'
  }
};

const HomePageOptimized: React.FC<HomePageOptimizedProps> = ({ onNavigate }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [dailyFortune, setDailyFortune] = useState<DailyFortune | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // 📊 分析追踪
  const analytics = useAnalytics();

  // 🕐 智能时间问候
  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return '夜深了，菩萨与您同在';
    if (hour < 9) return '晨光初现，新的一天开始了';
    if (hour < 12) return '上午好，愿您今日顺遂';
    if (hour < 14) return '午时已至，稍作休憩';
    if (hour < 18) return '下午好，继续加油';
    if (hour < 22) return '夜幕降临，愿您安康';
    return '夜深人静，祝您安眠';
  };

  // 🌟 运势等级颜色映射
  const getFortuneColor = (level: string) => {
    switch (level) {
      case '极好': return '#10B981';
      case '很好': return '#3B82F6';
      case '好': return '#8B5CF6';
      case '一般': return '#F59E0B';
      case '差': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // 📊 数据加载
  useEffect(() => {
    const loadData = async () => {
      try {
        // 追踪页面加载
        analytics.trackEvent('page_load', { page: 'home' });
        
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
              // 追踪运势加载成功
              analytics.trackEvent('fortune_loaded', { 
                hasUserInfo: true,
                fortuneLevel: fortuneResponse.data.overall_level 
              });
            }
          }
        } else {
          // 追踪新用户访问
          analytics.trackEvent('new_user_visit');
        }
              } catch (error) {
          console.error('数据加载失败:', error);
          if (error instanceof Error) {
            analytics.trackError(error, 'home_page_data_load');
          }
        } finally {
        setLoading(false);
      }
    };

    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [analytics]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: designSystem.colors.background,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 🌌 优雅的背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(212, 175, 55, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
        zIndex: -1
      }} />

      {/* ✨ 微妙的粒子系统 */}
      {[...Array(8)].map((_, i) => (
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
            opacity: 0.4
          }}
          animate={{
            y: [-20, 20],
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5
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
        {/* 📱 顶部状态栏 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            color: designSystem.colors.textSecondary,
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          <div>{currentTime.toLocaleDateString('zh-CN', { 
            month: 'long', 
            day: 'numeric',
            weekday: 'short' 
          })}</div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#10B981',
              borderRadius: '50%'
            }} />
            在线
          </div>
        </motion.div>

        {/* 🙏 主要问候区域 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            textAlign: 'center',
            marginBottom: '3rem'
          }}
        >
          <motion.div
            style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.4))'
            }}
            animate={{
              scale: [1, 1.05, 1],
              filter: [
                'drop-shadow(0 0 10px rgba(212, 175, 55, 0.4))',
                'drop-shadow(0 0 20px rgba(212, 175, 55, 0.6))',
                'drop-shadow(0 0 10px rgba(212, 175, 55, 0.4))'
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            🙏
          </motion.div>
          
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '600',
            color: designSystem.colors.textPrimary,
            marginBottom: '0.5rem',
            letterSpacing: '0.025em'
          }}>
            {getTimeGreeting()}
          </h1>
          
          <p style={{
            color: designSystem.colors.textSecondary,
            fontSize: '1rem',
            margin: 0
          }}>
            {userInfo?.name ? `${userInfo.name}，` : ''}菩萨在此护佑您
          </p>
        </motion.div>

        {/* 🔮 今日运势卡片 */}
        <AnimatePresence>
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -8, scale: 1.02 }}
              style={{
                background: designSystem.colors.card,
                backdropFilter: 'blur(16px) saturate(180%)',
                borderRadius: '24px',
                padding: '2rem',
                marginBottom: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: designSystem.shadows.card,
                cursor: 'pointer'
              }}
              onClick={() => {
                if (dailyFortune) {
                  analytics.trackUserAction('fortune_card_click', { 
                    fortuneLevel: dailyFortune.overall_level,
                    fortuneScore: dailyFortune.overall_score 
                  });
                } else {
                  analytics.trackUserAction('fortune_card_click', { 
                    hasFortune: false 
                  });
                }
                onNavigate('daily-fortune');
              }}
            >
              {dailyFortune ? (
                <>
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
                        margin: '0 0 0.25rem 0'
                      }}>
                        今日运势
                      </h3>
                      <p style={{
                        color: designSystem.colors.textMuted,
                        fontSize: '0.875rem',
                        margin: 0
                      }}>
                        大势至菩萨
                      </p>
                    </div>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: `linear-gradient(135deg, ${getFortuneColor(dailyFortune.overall_level)} 0%, ${getFortuneColor(dailyFortune.overall_level)}AA 100%)`,
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      boxShadow: `0 8px 24px ${getFortuneColor(dailyFortune.overall_level)}40`
                    }}>
                      {dailyFortune.overall_score}
                    </div>
                  </div>

                  <div style={{
                    color: designSystem.colors.textSecondary,
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem'
                  }}>
                    "{dailyFortune.overall_description?.substring(0, 60)}..."
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '0.75rem'
                  }}>
                    {[
                      { label: '财运', icon: '💰', value: '★★★★☆' },
                      { label: '健康', icon: '🏥', value: '★★★☆☆' },
                      { label: '事业', icon: '💼', value: '★★★★★' },
                      { label: '感情', icon: '💕', value: '★★★☆☆' }
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        style={{
                          textAlign: 'center',
                          padding: '0.75rem 0.5rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                          {item.icon}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: designSystem.colors.textMuted,
                          marginBottom: '0.25rem'
                        }}>
                          {item.label}
                        </div>
                        <div style={{
                          fontSize: '0.625rem',
                          color: designSystem.colors.primary
                        }}>
                          {item.value}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✨</div>
                  <h3 style={{
                    color: designSystem.colors.textPrimary,
                    marginBottom: '0.5rem'
                  }}>
                    开启您的神仙之旅
                  </h3>
                  <p style={{
                    color: designSystem.colors.textSecondary,
                    fontSize: '0.875rem'
                  }}>
                    完善信息，获取专属运势指引
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🎯 功能快捷入口 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          {[
            { icon: '💬', title: '与神对话', desc: '智慧指引', action: () => {
              analytics.trackUserAction('feature_click', { feature: 'deity-chat', title: '与神对话' });
              onNavigate('deity-chat');
            }, primary: true },
            { icon: '📿', title: '手串状态', desc: '功德进度', action: () => {
              analytics.trackUserAction('feature_click', { feature: 'bracelet', title: '手串状态' });
              onNavigate('bracelet');
            } },
            { icon: '📊', title: '命理分析', desc: '八字解读', action: () => {
              analytics.trackUserAction('feature_click', { feature: 'bazi-analysis', title: '命理分析' });
              onNavigate('bazi-analysis');
            } },
            { icon: '⚙️', title: '个人设置', desc: '偏好配置', action: () => {
              analytics.trackUserAction('feature_click', { feature: 'settings', title: '个人设置' });
              onNavigate('settings');
            } }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={feature.action}
              style={{
                background: feature.primary 
                  ? `linear-gradient(135deg, ${designSystem.colors.primary}20 0%, ${designSystem.colors.primary}10 100%)`
                  : designSystem.colors.card,
                backdropFilter: 'blur(16px) saturate(180%)',
                borderRadius: '20px',
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                border: feature.primary 
                  ? `1px solid ${designSystem.colors.primary}40`
                  : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: feature.primary 
                  ? designSystem.shadows.glow
                  : designSystem.shadows.card
              }}
            >
              <motion.div
                style={{
                  fontSize: '2rem',
                  marginBottom: '0.75rem',
                  filter: feature.primary 
                    ? `drop-shadow(0 0 8px ${designSystem.colors.primary}60)`
                    : 'none'
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {feature.icon}
              </motion.div>
              
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: designSystem.colors.textPrimary,
                margin: '0 0 0.25rem 0'
              }}>
                {feature.title}
              </h4>
              
              <p style={{
                fontSize: '0.875rem',
                color: designSystem.colors.textMuted,
                margin: 0
              }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* 📈 每日提醒 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            textAlign: 'center'
          }}
        >
          <div style={{
            fontSize: '1.5rem',
            marginBottom: '0.75rem'
          }}>
            🌸
          </div>
          
          <h4 style={{
            color: designSystem.colors.textPrimary,
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            今日修行提醒
          </h4>
          
          <p style={{
            color: designSystem.colors.textSecondary,
            fontSize: '0.875rem',
            lineHeight: '1.5',
            margin: 0
          }}>
            静心念佛，感恩生活中的每一个美好瞬间
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePageOptimized; 