import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyFortunePageOptimizedProps {
  onNavigate: (page: string) => void;
}

interface FortuneCategory {
  key: string;
  label: string;
  icon: string;
  score: number;
  level: string;
  description: string;
  advice: string[];
  luckyTime: string;
  color: string;
}

interface DailyFortune {
  date: string;
  overall_score: number;
  overall_level: string;
  overall_description: string;
  categories: FortuneCategory[];
  lucky_colors: string[];
  lucky_numbers: number[];
  lucky_directions: string[];
  recommended_activities: string[];
  avoid_activities: string[];
}

const DailyFortunePageOptimized: React.FC<DailyFortunePageOptimizedProps> = ({ onNavigate }) => {
  const [fortune, setFortune] = useState<DailyFortune | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('career');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'details' | 'guidance'>('overview');
  const [currentTime, setCurrentTime] = useState(new Date());

  // 模拟运势数据
  const mockFortune: DailyFortune = {
    date: new Date().toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    }),
    overall_score: 92,
    overall_level: '极好',
    overall_description: '今日是您与菩萨缘分最深的一天，诸事皆宜，财运亨通，贵人相助，是难得的吉日。宜早起祈福，多行善事，必有意外之喜。',
    categories: [
      {
        key: 'career',
        label: '事业运',
        icon: '💼',
        score: 95,
        level: '极好',
        description: '事业运势极佳，适合签署重要合同和推进重大项目',
        advice: ['主动与上级沟通工作计划', '把握商机，积极拓展业务', '团队合作将带来意外收获'],
        luckyTime: '上午 9:00-11:00',
        color: '#10B981'
      },
      {
        key: 'wealth',
        label: '财运',
        icon: '💰',
        score: 88,
        level: '很好',
        description: '财运亨通，投资理财有不错的机会',
        advice: ['适合进行稳健的投资', '注意控制开支，避免冲动消费', '可考虑购买理财产品'],
        luckyTime: '下午 2:00-4:00',
        color: '#3B82F6'
      },
      {
        key: 'health',
        label: '健康运',
        icon: '🏥',
        score: 90,
        level: '极好',
        description: '身体状态良好，精力充沛',
        advice: ['保持规律作息', '适度运动，增强体质', '多喝水，注意营养均衡'],
        luckyTime: '早晨 6:00-8:00',
        color: '#8B5CF6'
      },
      {
        key: 'relationship',
        label: '感情运',
        icon: '💕',
        score: 85,
        level: '很好',
        description: '人际关系和谐，容易获得他人支持',
        advice: ['主动联系老朋友，增进感情', '单身者有望遇到心仪对象', '情侣关系升温，可考虑进一步发展'],
        luckyTime: '晚上 7:00-9:00',
        color: '#F59E0B'
      }
    ],
    lucky_colors: ['金色', '红色', '绿色'],
    lucky_numbers: [8, 18, 28],
    lucky_directions: ['东南', '正南'],
    recommended_activities: ['签约', '投资', '社交', '学习', '运动'],
    avoid_activities: ['争吵', '大额消费', '熬夜', '饮酒过量']
  };

  // 加载运势数据
  useEffect(() => {
    const loadFortune = async () => {
      setLoading(true);
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500));
        setFortune(mockFortune);
      } catch (error) {
        console.error('加载运势失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFortune();
    
    // 定时更新时间
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 获取运势等级样式
  const getFortuneStyle = (level: string) => {
    const styles: Record<string, { color: string; bg: string; icon: string }> = {
      '极好': { color: '#10B981', bg: 'linear-gradient(135deg, #10B981, #059669)', icon: '🌟' },
      '很好': { color: '#3B82F6', bg: 'linear-gradient(135deg, #3B82F6, #2563EB)', icon: '✨' },
      '好': { color: '#8B5CF6', bg: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', icon: '💫' },
      '一般': { color: '#F59E0B', bg: 'linear-gradient(135deg, #F59E0B, #D97706)', icon: '🌤️' },
      '差': { color: '#EF4444', bg: 'linear-gradient(135deg, #EF4444, #DC2626)', icon: '⛅' }
    };
    return styles[level] || styles['一般'];
  };

  // 获取时间问候
  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return { text: '夜深了', icon: '🌙' };
    if (hour < 9) return { text: '晨光初现', icon: '🌅' };
    if (hour < 12) return { text: '上午时光', icon: '☀️' };
    if (hour < 14) return { text: '午时吉祥', icon: '🌞' };
    if (hour < 18) return { text: '下午安康', icon: '🌤️' };
    if (hour < 22) return { text: '夜幕降临', icon: '🌆' };
    return { text: '夜深人静', icon: '🌌' };
  };

  // 加载状态
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--zen-bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--zen-space-2xl)'
      }}>
        <motion.div
          className="zen-card zen-text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ maxWidth: '300px' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '3rem', marginBottom: 'var(--zen-space-lg)' }}
          >
            🔮
          </motion.div>
          
          <h3 style={{
            fontSize: 'var(--zen-text-xl)',
            color: 'var(--zen-text-primary)',
            marginBottom: 'var(--zen-space-sm)'
          }}>
            正在为您计算今日运势
          </h3>
          
          <p style={{
            color: 'var(--zen-text-secondary)',
            fontSize: 'var(--zen-text-sm)'
          }}>
            菩萨正在为您推演今日吉凶...
          </p>
          
          <div style={{
            background: 'var(--zen-bg-glass)',
            borderRadius: 'var(--zen-radius-full)',
            height: '4px',
            marginTop: 'var(--zen-space-xl)',
            overflow: 'hidden'
          }}>
            <motion.div
              style={{
                height: '100%',
                background: 'var(--zen-gradient-gold)',
                borderRadius: 'var(--zen-radius-full)'
              }}
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!fortune) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--zen-bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--zen-space-2xl)'
      }}>
        <div className="zen-card zen-text-center">
          <div style={{ fontSize: '3rem', marginBottom: 'var(--zen-space-lg)' }}>😔</div>
          <h3 style={{ color: 'var(--zen-text-primary)', marginBottom: 'var(--zen-space-sm)' }}>
            暂无运势数据
          </h3>
          <p style={{ color: 'var(--zen-text-secondary)', marginBottom: 'var(--zen-space-xl)' }}>
            请确保已完成个人信息设置
          </p>
          <button
            className="zen-btn zen-btn-primary"
            onClick={() => onNavigate('settings')}
          >
            前往设置
          </button>
        </div>
      </div>
    );
  }

  const greeting = getTimeGreeting();
  const fortuneStyle = getFortuneStyle(fortune.overall_level);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--zen-bg-primary)',
      position: 'relative'
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
        zIndex: -1
      }} />

      <div style={{
        padding: 'var(--zen-space-2xl) var(--zen-space-lg)',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        {/* 标题区域 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="zen-text-center zen-mb-2xl"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ fontSize: '3rem', marginBottom: 'var(--zen-space-lg)' }}
          >
            {greeting.icon}
          </motion.div>
          
          <h1 style={{
            fontSize: 'var(--zen-text-3xl)',
            fontWeight: 700,
            color: 'var(--zen-text-primary)',
            marginBottom: 'var(--zen-space-sm)'
          }}>
            {greeting.text}，今日运势
          </h1>
          
          <p style={{
            fontSize: 'var(--zen-text-base)',
            color: 'var(--zen-text-secondary)'
          }}>
            {fortune.date}
          </p>
        </motion.div>

        {/* 标签切换 */}
        <div style={{
          display: 'flex',
          background: 'var(--zen-bg-glass)',
          borderRadius: 'var(--zen-radius-xl)',
          padding: 'var(--zen-space-xs)',
          marginBottom: 'var(--zen-space-2xl)',
          backdropFilter: 'blur(10px)'
        }}>
          {[
            { key: 'overview', label: '总览', icon: '📊' },
            { key: 'details', label: '详情', icon: '🔍' },
            { key: 'guidance', label: '指引', icon: '📝' }
          ].map((tab) => (
            <motion.button
              key={tab.key}
              className="zen-btn"
              onClick={() => setSelectedTab(tab.key as any)}
              whileTap={{ scale: 0.98 }}
              style={{
                flex: 1,
                background: selectedTab === tab.key ? 'var(--zen-primary-alpha-20)' : 'transparent',
                border: selectedTab === tab.key ? '1px solid var(--zen-primary)' : '1px solid transparent',
                color: selectedTab === tab.key ? 'var(--zen-primary)' : 'var(--zen-text-secondary)',
                minHeight: '44px'
              }}
            >
              <span style={{ marginRight: 'var(--zen-space-xs)' }}>{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* 内容区域 */}
        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* 总体运势卡片 */}
              <div className="zen-card zen-card-accent zen-mb-xl">
                <div className="zen-flex zen-items-center zen-justify-between zen-mb-lg">
                  <div>
                    <h3 style={{
                      fontSize: 'var(--zen-text-xl)',
                      fontWeight: 600,
                      color: 'var(--zen-text-primary)',
                      marginBottom: 'var(--zen-space-xs)'
                    }}>
                      今日总运势
                    </h3>
                    <div className="zen-flex zen-items-center zen-gap-sm">
                      <span style={{ fontSize: 'var(--zen-text-lg)' }}>{fortuneStyle.icon}</span>
                      <span style={{
                        color: fortuneStyle.color,
                        fontWeight: 600,
                        fontSize: 'var(--zen-text-lg)'
                      }}>
                        {fortune.overall_level}
                      </span>
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    style={{
                      width: '80px',
                      height: '80px',
                      background: fortuneStyle.bg,
                      borderRadius: 'var(--zen-radius-xl)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      boxShadow: `0 8px 24px ${fortuneStyle.color}40`,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: 'var(--zen-text-lg)' }}>{fortuneStyle.icon}</div>
                    <div style={{ fontSize: 'var(--zen-text-xl)' }}>{fortune.overall_score}</div>
                  </motion.div>
                </div>

                <div style={{
                  background: 'var(--zen-bg-glass)',
                  borderRadius: 'var(--zen-radius-lg)',
                  padding: 'var(--zen-space-xl)',
                  borderLeft: `4px solid ${fortuneStyle.color}`
                }}>
                  <p style={{
                    color: 'var(--zen-text-primary)',
                    fontSize: 'var(--zen-text-base)',
                    lineHeight: 1.6,
                    margin: 0,
                    fontStyle: 'italic'
                  }}>
                    "{fortune.overall_description}"
                  </p>
                </div>
              </div>

              {/* 分类运势网格 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--zen-space-lg)',
                marginBottom: 'var(--zen-space-xl)'
              }}>
                {fortune.categories.map((category, index) => {
                  const categoryStyle = getFortuneStyle(category.level);
                  return (
                    <motion.div
                      key={category.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      onClick={() => setActiveCategory(category.key)}
                      className="zen-card"
                      style={{
                        cursor: 'pointer',
                        border: activeCategory === category.key ? `2px solid ${categoryStyle.color}` : undefined
                      }}
                    >
                      <div className="zen-text-center">
                        <div style={{
                          fontSize: '2rem',
                          marginBottom: 'var(--zen-space-sm)',
                          filter: `drop-shadow(0 0 8px ${categoryStyle.color}60)`
                        }}>
                          {category.icon}
                        </div>
                        
                        <h4 style={{
                          fontSize: 'var(--zen-text-sm)',
                          color: 'var(--zen-text-tertiary)',
                          marginBottom: 'var(--zen-space-xs)'
                        }}>
                          {category.label}
                        </h4>
                        
                        <div style={{
                          fontSize: 'var(--zen-text-2xl)',
                          fontWeight: 700,
                          color: categoryStyle.color,
                          marginBottom: 'var(--zen-space-xs)'
                        }}>
                          {category.score}
                        </div>
                        
                        <div style={{
                          fontSize: 'var(--zen-text-xs)',
                          color: categoryStyle.color,
                          fontWeight: 500
                        }}>
                          {category.level}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* 幸运元素 */}
              <div className="zen-card zen-card-flat">
                <h4 style={{
                  fontSize: 'var(--zen-text-lg)',
                  fontWeight: 600,
                  color: 'var(--zen-text-primary)',
                  marginBottom: 'var(--zen-space-lg)',
                  textAlign: 'center'
                }}>
                  💫 今日幸运元素
                </h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--zen-space-lg)'
                }}>
                  <div className="zen-text-center">
                    <div style={{
                      fontSize: 'var(--zen-text-base)',
                      color: 'var(--zen-text-tertiary)',
                      marginBottom: 'var(--zen-space-xs)'
                    }}>
                      🎨 幸运颜色
                    </div>
                    <div style={{
                      fontSize: 'var(--zen-text-sm)',
                      color: 'var(--zen-text-primary)',
                      fontWeight: 500
                    }}>
                      {fortune.lucky_colors.join('、')}
                    </div>
                  </div>
                  
                  <div className="zen-text-center">
                    <div style={{
                      fontSize: 'var(--zen-text-base)',
                      color: 'var(--zen-text-tertiary)',
                      marginBottom: 'var(--zen-space-xs)'
                    }}>
                      🔢 幸运数字
                    </div>
                    <div style={{
                      fontSize: 'var(--zen-text-sm)',
                      color: 'var(--zen-text-primary)',
                      fontWeight: 500
                    }}>
                      {fortune.lucky_numbers.join('、')}
                    </div>
                  </div>
                  
                  <div className="zen-text-center">
                    <div style={{
                      fontSize: 'var(--zen-text-base)',
                      color: 'var(--zen-text-tertiary)',
                      marginBottom: 'var(--zen-space-xs)'
                    }}>
                      🧭 幸运方位
                    </div>
                    <div style={{
                      fontSize: 'var(--zen-text-sm)',
                      color: 'var(--zen-text-primary)',
                      fontWeight: 500
                    }}>
                      {fortune.lucky_directions.join('、')}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {selectedTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* 详细运势 */}
              {fortune.categories.map((category) => {
                const categoryStyle = getFortuneStyle(category.level);
                return (
                  <motion.div
                    key={category.key}
                    className="zen-card zen-mb-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="zen-flex zen-items-center zen-gap-lg zen-mb-lg">
                      <div style={{
                        fontSize: '2rem',
                        filter: `drop-shadow(0 0 8px ${categoryStyle.color}60)`
                      }}>
                        {category.icon}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: 'var(--zen-text-lg)',
                          fontWeight: 600,
                          color: 'var(--zen-text-primary)',
                          marginBottom: 'var(--zen-space-xs)'
                        }}>
                          {category.label}
                        </h4>
                        
                        <div className="zen-flex zen-items-center zen-gap-md">
                          <div style={{
                            fontSize: 'var(--zen-text-xl)',
                            fontWeight: 700,
                            color: categoryStyle.color
                          }}>
                            {category.score}分
                          </div>
                          
                          <div className="zen-status" style={{
                            background: `${categoryStyle.color}20`,
                            color: categoryStyle.color
                          }}>
                            {categoryStyle.icon} {category.level}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      background: 'var(--zen-bg-glass)',
                      borderRadius: 'var(--zen-radius-lg)',
                      padding: 'var(--zen-space-lg)',
                      marginBottom: 'var(--zen-space-lg)'
                    }}>
                      <p style={{
                        color: 'var(--zen-text-secondary)',
                        fontSize: 'var(--zen-text-sm)',
                        lineHeight: 1.6,
                        margin: 0
                      }}>
                        {category.description}
                      </p>
                    </div>

                    <div>
                      <div style={{
                        fontSize: 'var(--zen-text-sm)',
                        color: 'var(--zen-text-tertiary)',
                        marginBottom: 'var(--zen-space-sm)'
                      }}>
                        💡 建议事项：
                      </div>
                      
                      <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0
                      }}>
                        {category.advice.map((advice, index) => (
                          <li key={index} style={{
                            fontSize: 'var(--zen-text-sm)',
                            color: 'var(--zen-text-secondary)',
                            marginBottom: 'var(--zen-space-xs)',
                            paddingLeft: 'var(--zen-space-lg)',
                            position: 'relative'
                          }}>
                            <span style={{
                              position: 'absolute',
                              left: 0,
                              color: categoryStyle.color
                            }}>
                              •
                            </span>
                            {advice}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{
                      marginTop: 'var(--zen-space-lg)',
                      padding: 'var(--zen-space-md)',
                      background: `${categoryStyle.color}10`,
                      borderRadius: 'var(--zen-radius-md)',
                      fontSize: 'var(--zen-text-xs)',
                      color: categoryStyle.color,
                      textAlign: 'center'
                    }}>
                      ⏰ 最佳时机：{category.luckyTime}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {selectedTab === 'guidance' && (
            <motion.div
              key="guidance"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* 宜做事项 */}
              <div className="zen-card zen-mb-lg">
                <h4 style={{
                  fontSize: 'var(--zen-text-lg)',
                  fontWeight: 600,
                  color: 'var(--zen-text-primary)',
                  marginBottom: 'var(--zen-space-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--zen-space-sm)'
                }}>
                  ✅ 今日宜做
                </h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: 'var(--zen-space-md)'
                }}>
                  {fortune.recommended_activities.map((activity, index) => (
                    <motion.div
                      key={activity}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      style={{
                        background: 'var(--zen-success-alpha)',
                        border: '1px solid var(--zen-success)',
                        borderRadius: 'var(--zen-radius-lg)',
                        padding: 'var(--zen-space-md)',
                        textAlign: 'center',
                        color: 'var(--zen-success-light)',
                        fontSize: 'var(--zen-text-sm)',
                        fontWeight: 500
                      }}
                    >
                      {activity}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 忌做事项 */}
              <div className="zen-card zen-mb-lg">
                <h4 style={{
                  fontSize: 'var(--zen-text-lg)',
                  fontWeight: 600,
                  color: 'var(--zen-text-primary)',
                  marginBottom: 'var(--zen-space-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--zen-space-sm)'
                }}>
                  ❌ 今日忌做
                </h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: 'var(--zen-space-md)'
                }}>
                  {fortune.avoid_activities.map((activity, index) => (
                    <motion.div
                      key={activity}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      style={{
                        background: 'var(--zen-error-alpha)',
                        border: '1px solid var(--zen-error)',
                        borderRadius: 'var(--zen-radius-lg)',
                        padding: 'var(--zen-space-md)',
                        textAlign: 'center',
                        color: 'var(--zen-error-light)',
                        fontSize: 'var(--zen-text-sm)',
                        fontWeight: 500
                      }}
                    >
                      {activity}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 菩萨寄语 */}
              <div className="zen-card zen-deity-card">
                <div style={{
                  textAlign: 'center',
                  marginBottom: 'var(--zen-space-lg)'
                }}>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ fontSize: '3rem', marginBottom: 'var(--zen-space-sm)' }}
                  >
                    🙏
                  </motion.div>
                  
                  <h4 style={{
                    fontSize: 'var(--zen-text-lg)',
                    fontWeight: 600,
                    marginBottom: 'var(--zen-space-lg)'
                  }}>
                    大势至菩萨寄语
                  </h4>
                </div>
                
                <p className="zen-sacred-text" style={{
                  fontSize: 'var(--zen-text-base)',
                  lineHeight: 1.8,
                  margin: 0,
                  color: 'white'
                }}>
                  "心如明镜台，时时勤拂拭。今日运势佳，把握当下时。行善积德业，必有福报临。"
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 底部操作 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="zen-flex zen-gap-md zen-mt-xl"
        >
          <button
            className="zen-btn zen-btn-secondary"
            onClick={() => onNavigate('home')}
            style={{ flex: 1 }}
          >
            🏠 返回首页
          </button>
          
          <button
            className="zen-btn zen-btn-primary"
            onClick={() => onNavigate('deity-chat')}
            style={{ flex: 1 }}
          >
            💬 与神对话
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default DailyFortunePageOptimized; 