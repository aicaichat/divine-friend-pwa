import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScriptureReader, { Scripture } from '../components/ScriptureReader';
import { useScriptureProgress } from '../hooks/useScriptureProgress';
import { useAnalytics } from '../hooks/useAnalytics';

interface GrowthPageOptimizedProps {
  onNavigate: (page: string) => void;
}

interface SutraProgress {
  sutraId: string;
  completed: boolean;
  progress: number; // 0-100
  studyTime: number; // minutes
  completedAt?: string;
}

interface StudyStats {
  totalStudyTime: number; // minutes
  streakDays: number;
  completedSutras: number;
  todayStudyTime: number;
  level: number;
  exp: number;
  nextLevelExp: number;
}

interface SutraItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  videoUrl?: string; // 可选，如果没有视频则使用阅读模式
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  icon: string;
  color: string;
  gradient: string;
  hasVideo: boolean; // 是否有视频
}

const GrowthPageOptimized: React.FC<GrowthPageOptimizedProps> = ({ onNavigate }) => {
  const [studyStats, setStudyStats] = useState<StudyStats | null>(null);
  const [sutraProgress, setSutraProgress] = useState<Record<string, SutraProgress>>({});
  const [selectedSutra, setSelectedSutra] = useState<SutraItem | null>(null);
  const [isStudying, setIsStudying] = useState(false);
  const [studyStartTime, setStudyStartTime] = useState<Date | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [showReader, setShowReader] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scriptureData, setScriptureData] = useState<Scripture | null>(null);

  // 📊 分析追踪
  const analytics = useAnalytics();
  
  // 📖 经文进度追踪
  const { recordReadingSession, getScriptureProgress, stats: scriptureStats } = useScriptureProgress();

  // 经文库
  const sutras: SutraItem[] = [
    {
      id: 'heart-sutra',
      title: '般若波罗蜜多心经',
      subtitle: '心经',
      description: '观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空...',
      videoUrl: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/669_raw.mp4',
      duration: 15,
      difficulty: 'beginner',
      benefits: ['开启智慧', '消除烦恼', '增长定力'],
      icon: '🌸',
      color: '#FF6B9D',
      gradient: 'linear-gradient(135deg, #FF6B9D, #C44569)',
      hasVideo: true
    },
    {
      id: 'diamond-sutra',
      title: '金刚般若波罗蜜经',
      subtitle: '金刚经',
      description: '如是我闻，一时，佛在舍卫国祇树给孤独园...',
      duration: 45,
      difficulty: 'intermediate',
      benefits: ['破除执着', '证悟空性', '福慧双修'],
      icon: '💎',
      color: '#4834D4',
      gradient: 'linear-gradient(135deg, #4834D4, #686DE0)',
      hasVideo: false
    },
    {
      id: 'lotus-sutra',
      title: '妙法莲华经',
      subtitle: '法华经',
      description: '如是我闻，一时佛住王舍城耆阇崛山中...',
      duration: 120,
      difficulty: 'advanced',
      benefits: ['究竟解脱', '普度众生', '成就佛道'],
      icon: '🪷',
      color: '#FD79A8',
      gradient: 'linear-gradient(135deg, #FD79A8, #E84393)',
      hasVideo: false
    },
    {
      id: 'medicine-buddha',
      title: '药师琉璃光如来本愿功德经',
      subtitle: '药师经',
      description: '如是我闻，一时薄伽梵游化诸国...',
      duration: 30,
      difficulty: 'beginner',
      benefits: ['身心健康', '消灾延寿', '福报增长'],
      icon: '💊',
      color: '#00B894',
      gradient: 'linear-gradient(135deg, #00B894, #00A085)',
      hasVideo: false
    },
    {
      id: 'amitabha-sutra',
      title: '佛说阿弥陀经',
      subtitle: '阿弥陀经',
      description: '如是我闻，一时佛在舍卫国祇树给孤独园...',
      duration: 30,
      difficulty: 'beginner',
      benefits: ['往生净土', '消业除障', '增长善根'],
      icon: '🕉️',
      color: '#FDCB6E',
      gradient: 'linear-gradient(135deg, #FDCB6E, #E17055)',
      hasVideo: false
    },
    {
      id: 'ksitigarbha-sutra',
      title: '地藏菩萨本愿经',
      subtitle: '地藏经',
      description: '如是我闻，一时佛在忉利天为母说法...',
      duration: 60,
      difficulty: 'advanced',
      benefits: ['消业除障', '超度亡灵', '增长孝心'],
      icon: '🏛️',
      color: '#6C5CE7',
      gradient: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
      hasVideo: false
    }
  ];

  // 获取难度标签
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return { label: '入门', color: '#00B894' };
      case 'intermediate': return { label: '进阶', color: '#FDCB6E' };
      case 'advanced': return { label: '高级', color: '#E17055' };
      default: return { label: '入门', color: '#00B894' };
    }
  };

  // 加载学习数据
  useEffect(() => {
    const loadStudyData = async () => {
      setLoading(true);
      try {
        // 从本地存储加载数据
        const savedStats = localStorage.getItem('studyStats');
        const savedProgress = localStorage.getItem('sutraProgress');
        
        if (savedStats) {
          setStudyStats(JSON.parse(savedStats));
        } else {
          // 初始化数据
          const initialStats: StudyStats = {
            totalStudyTime: 0,
            streakDays: 0,
            completedSutras: 0,
            todayStudyTime: 0,
            level: 1,
            exp: 0,
            nextLevelExp: 100
          };
          setStudyStats(initialStats);
          localStorage.setItem('studyStats', JSON.stringify(initialStats));
        }
        
        if (savedProgress) {
          setSutraProgress(JSON.parse(savedProgress));
        }
      } catch (error) {
        console.error('加载学习数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudyData();
  }, []);

  // 加载经文数据
  const loadScriptureData = async (scriptureId: string): Promise<Scripture | null> => {
    try {
      const response = await fetch(`/src/data/scriptures/${scriptureId}.json`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('加载经文数据失败:', error);
    }
    return null;
  };

  // 开始学习
  const startStudy = async (sutra: SutraItem) => {
    setSelectedSutra(sutra);
    setIsStudying(true);
    setStudyStartTime(new Date());
    
    // 追踪学习开始
    analytics.trackUserAction('scripture_study_started', {
      scriptureId: sutra.id,
      scriptureTitle: sutra.title,
      hasVideo: sutra.hasVideo,
      difficulty: sutra.difficulty
    });

    if (sutra.hasVideo && sutra.videoUrl) {
      // 有视频的经文
      setShowVideo(true);
    } else {
      // 没有视频的经文，使用阅读模式
      const scriptureData = await loadScriptureData(sutra.id);
      if (scriptureData) {
        setScriptureData(scriptureData);
        setShowReader(true);
      } else {
        // 如果加载失败，显示错误
        alert('经文数据加载失败，请稍后重试');
        setIsStudying(false);
        setSelectedSutra(null);
      }
    }
  };

  // 完成学习
  const completeStudy = () => {
    if (!selectedSutra || !studyStartTime || !studyStats) return;

    const studyDuration = Math.floor((new Date().getTime() - studyStartTime.getTime()) / 1000 / 60);
    
    // 记录阅读会话
    if (scriptureData) {
      const paragraphsCount = scriptureData.content?.fullText?.length || scriptureData.paragraphs?.length || 0;
      recordReadingSession(selectedSutra.id, {
        duration: studyDuration,
        paragraphsRead: paragraphsCount,
        readingMode: 'follow',
        completed: true
      });
    }
    
    // 追踪学习完成
    analytics.trackUserAction('scripture_study_completed', {
      scriptureId: selectedSutra.id,
      scriptureTitle: selectedSutra.title,
      studyDuration: studyDuration,
      hasVideo: selectedSutra.hasVideo
    });
    
    // 更新进度
    const newProgress: SutraProgress = {
      sutraId: selectedSutra.id,
      completed: true,
      progress: 100,
      studyTime: studyDuration,
      completedAt: new Date().toISOString()
    };

    const updatedProgress = {
      ...sutraProgress,
      [selectedSutra.id]: newProgress
    };

    // 更新统计
    const newStats: StudyStats = {
      ...studyStats,
      totalStudyTime: studyStats.totalStudyTime + studyDuration,
      todayStudyTime: studyStats.todayStudyTime + studyDuration,
      completedSutras: Object.values(updatedProgress).filter(p => p.completed).length,
      exp: studyStats.exp + studyDuration * 10,
      level: Math.floor((studyStats.exp + studyDuration * 10) / 100) + 1
    };

    newStats.nextLevelExp = newStats.level * 100;

    // 保存数据
    setSutraProgress(updatedProgress);
    setStudyStats(newStats);
    localStorage.setItem('sutraProgress', JSON.stringify(updatedProgress));
    localStorage.setItem('studyStats', JSON.stringify(newStats));

    // 重置状态
    setIsStudying(false);
    setShowVideo(false);
    setShowReader(false);
    setSelectedSutra(null);
    setStudyStartTime(null);
    setScriptureData(null);

    // 震动反馈
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  // 经文阅读完成回调
  const handleScriptureFinish = () => {
    completeStudy();
  };

  // 获取等级称号
  const getLevelTitle = (level: number) => {
    if (level < 5) return '初学者';
    if (level < 10) return '修行者';
    if (level < 20) return '居士';
    if (level < 30) return '法师';
    if (level < 50) return '大师';
    return '觉者';
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--zen-bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ fontSize: '3rem' }}
        >
          🌱
        </motion.div>
      </div>
    );
  }

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
        background: 'radial-gradient(circle at 20% 30%, rgba(255, 107, 157, 0.05) 0%, transparent 50%)',
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
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ fontSize: '3rem', marginBottom: 'var(--zen-space-lg)' }}
          >
            🌱
          </motion.div>
          
          <h1 style={{
            fontSize: 'var(--zen-text-3xl)',
            fontWeight: 700,
            color: 'var(--zen-text-primary)',
            marginBottom: 'var(--zen-space-sm)'
          }}>
            经文学习中心
          </h1>
          
          <p style={{
            fontSize: 'var(--zen-text-base)',
            color: 'var(--zen-text-secondary)',
            lineHeight: 1.6
          }}>
            跟随视频一起诵读佛经，积累智慧功德
          </p>
        </motion.div>

        {/* 学习统计 */}
        {studyStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="zen-card zen-mb-xl"
          >
            <div className="zen-flex zen-justify-between zen-items-center zen-mb-lg">
              <h3 style={{
                fontSize: 'var(--zen-text-lg)',
                fontWeight: 600,
                color: 'var(--zen-text-primary)'
              }}>
                修行进度
              </h3>
              
              <div className="zen-status" style={{
                background: '#FFB3BA20',
                color: '#FFB3BA'
              }}>
                Lv.{studyStats.level} {getLevelTitle(studyStats.level)}
              </div>
            </div>
            
            {/* 经验值进度条 */}
            <div style={{ marginBottom: 'var(--zen-space-lg)' }}>
              <div className="zen-flex zen-justify-between zen-mb-sm">
                <span style={{
                  fontSize: 'var(--zen-text-sm)',
                  color: 'var(--zen-text-secondary)'
                }}>
                  经验值
                </span>
                <span style={{
                  fontSize: 'var(--zen-text-sm)',
                  color: 'var(--zen-text-primary)',
                  fontWeight: 600
                }}>
                  {studyStats.exp} / {studyStats.nextLevelExp}
                </span>
              </div>
              
              <div style={{
                background: 'var(--zen-bg-glass)',
                borderRadius: 'var(--zen-radius-full)',
                height: '8px',
                overflow: 'hidden'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(studyStats.exp / studyStats.nextLevelExp) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #FFB3BA, #FFD3E1)',
                    borderRadius: 'var(--zen-radius-full)'
                  }}
                />
              </div>
            </div>

            {/* 统计数据 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 'var(--zen-space-lg)'
            }}>
              <div className="zen-text-center">
                <div style={{
                  fontSize: 'var(--zen-text-xl)',
                  fontWeight: 700,
                  color: '#FF6B9D',
                  marginBottom: 'var(--zen-space-xs)'
                }}>
                  {Math.floor(studyStats.totalStudyTime / 60)}h
                </div>
                <div style={{
                  fontSize: 'var(--zen-text-xs)',
                  color: 'var(--zen-text-tertiary)'
                }}>
                  总学习
                </div>
              </div>
              
              <div className="zen-text-center">
                <div style={{
                  fontSize: 'var(--zen-text-xl)',
                  fontWeight: 700,
                  color: '#4834D4',
                  marginBottom: 'var(--zen-space-xs)'
                }}>
                  {studyStats.completedSutras}
                </div>
                <div style={{
                  fontSize: 'var(--zen-text-xs)',
                  color: 'var(--zen-text-tertiary)'
                }}>
                  完成经文
                </div>
              </div>
              
              <div className="zen-text-center">
                <div style={{
                  fontSize: 'var(--zen-text-xl)',
                  fontWeight: 700,
                  color: '#00B894',
                  marginBottom: 'var(--zen-space-xs)'
                }}>
                  {studyStats.streakDays}
                </div>
                <div style={{
                  fontSize: 'var(--zen-text-xs)',
                  color: 'var(--zen-text-tertiary)'
                }}>
                  连续天数
                </div>
              </div>
              
              <div className="zen-text-center">
                <div style={{
                  fontSize: 'var(--zen-text-xl)',
                  fontWeight: 700,
                  color: '#FDCB6E',
                  marginBottom: 'var(--zen-space-xs)'
                }}>
                  {studyStats.todayStudyTime}
                </div>
                <div style={{
                  fontSize: 'var(--zen-text-xs)',
                  color: 'var(--zen-text-tertiary)'
                }}>
                  今日学习
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 经文列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: 'var(--zen-space-xl)' }}
        >
          <h3 style={{
            fontSize: 'var(--zen-text-lg)',
            fontWeight: 600,
            color: 'var(--zen-text-primary)',
            marginBottom: 'var(--zen-space-lg)',
            textAlign: 'center'
          }}>
            📚 经文库
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--zen-space-lg)'
          }}>
            {sutras.map((sutra, index) => {
              const progress = sutraProgress[sutra.id];
              const difficulty = getDifficultyLabel(sutra.difficulty);
              
              return (
                <motion.div
                  key={sutra.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="zen-card"
                  style={{
                    background: `linear-gradient(135deg, ${sutra.color}10, transparent)`,
                    border: `1px solid ${sutra.color}30`,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startStudy(sutra)}
                >
                  {/* 完成标识 */}
                  {progress?.completed && (
                    <div style={{
                      position: 'absolute',
                      top: 'var(--zen-space-lg)',
                      right: 'var(--zen-space-lg)',
                      background: '#00B894',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      ✓
                    </div>
                  )}
                  
                  <div className="zen-flex zen-items-start zen-gap-lg">
                    <div style={{
                      fontSize: '2.5rem',
                      filter: `drop-shadow(0 0 8px ${sutra.color}60)`
                    }}>
                      {sutra.icon}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div className="zen-flex zen-justify-between zen-items-start zen-mb-sm">
                        <div>
                          <h4 style={{
                            fontSize: 'var(--zen-text-lg)',
                            fontWeight: 600,
                            color: 'var(--zen-text-primary)',
                            marginBottom: 'var(--zen-space-xs)'
                          }}>
                            {sutra.subtitle}
                          </h4>
                          
                          <p style={{
                            fontSize: 'var(--zen-text-sm)',
                            color: 'var(--zen-text-secondary)',
                            marginBottom: 'var(--zen-space-sm)',
                            lineHeight: 1.4
                          }}>
                            {sutra.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* 标签和信息 */}
                      <div className="zen-flex zen-items-center zen-gap-md zen-mb-md">
                        <div className="zen-status" style={{
                          background: difficulty.color + '20',
                          color: difficulty.color,
                          fontSize: '10px'
                        }}>
                          {difficulty.label}
                        </div>
                        
                        <div className="zen-status" style={{
                          background: sutra.hasVideo ? '#FF6B9D20' : '#4834D420',
                          color: sutra.hasVideo ? '#FF6B9D' : '#4834D4',
                          fontSize: '10px'
                        }}>
                          {sutra.hasVideo ? '🎥 视频' : '📖 阅读'}
                        </div>
                        
                        <span style={{
                          fontSize: 'var(--zen-text-xs)',
                          color: 'var(--zen-text-tertiary)'
                        }}>
                          约 {sutra.duration} 分钟
                        </span>
                      </div>
                      
                      {/* 功德效果 */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'var(--zen-space-xs)',
                        marginBottom: 'var(--zen-space-md)'
                      }}>
                        {sutra.benefits.map((benefit, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '10px',
                              background: sutra.color + '15',
                              color: sutra.color,
                              padding: '2px 6px',
                              borderRadius: 'var(--zen-radius-sm)',
                              border: `1px solid ${sutra.color}30`
                            }}
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                      
                      {/* 学习进度 */}
                      {progress && (
                        <div style={{
                          background: 'var(--zen-bg-glass)',
                          borderRadius: 'var(--zen-radius-md)',
                          padding: 'var(--zen-space-sm)',
                          marginTop: 'var(--zen-space-md)'
                        }}>
                          <div className="zen-flex zen-justify-between zen-mb-xs">
                            <span style={{
                              fontSize: 'var(--zen-text-xs)',
                              color: 'var(--zen-text-tertiary)'
                            }}>
                              学习进度
                            </span>
                            <span style={{
                              fontSize: 'var(--zen-text-xs)',
                              color: sutra.color,
                              fontWeight: 600
                            }}>
                              {progress.progress}%
                            </span>
                          </div>
                          
                          <div style={{
                            background: 'var(--zen-bg-glass)',
                            borderRadius: 'var(--zen-radius-full)',
                            height: '4px',
                            overflow: 'hidden'
                          }}>
                            <div
                              style={{
                                width: `${progress.progress}%`,
                                height: '100%',
                                background: sutra.gradient,
                                borderRadius: 'var(--zen-radius-full)',
                                transition: 'width 0.3s ease'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* 学习视频模态框 */}
      <AnimatePresence>
        {showVideo && selectedSutra && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'var(--zen-bg-overlay)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--zen-space-lg)',
              zIndex: 1000
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="zen-card"
              style={{ maxWidth: '90vw', width: '100%', maxHeight: '90vh', overflow: 'auto' }}
            >
              <div className="zen-flex zen-justify-between zen-items-center zen-mb-lg">
                <h3 style={{
                  fontSize: 'var(--zen-text-lg)',
                  fontWeight: 600,
                  color: 'var(--zen-text-primary)'
                }}>
                  🎥 {selectedSutra.subtitle}
                </h3>
                
                <button
                  onClick={() => setShowVideo(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--zen-text-tertiary)',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div style={{
                borderRadius: 'var(--zen-radius-lg)',
                overflow: 'hidden',
                background: '#000',
                marginBottom: 'var(--zen-space-lg)'
              }}>
                <video
                  controls
                  autoPlay
                  style={{
                    width: '100%',
                    height: '250px',
                    objectFit: 'cover'
                  }}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWEyMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWtpuS5oOe7j+aWh+ivteivu+WujzwvdGV4dD48L3N2Zz4="
                >
                  <source src={selectedSutra.videoUrl} type="video/mp4" />
                  您的浏览器不支持视频播放
                </video>
              </div>

              <div style={{
                background: 'var(--zen-info-alpha)',
                border: '1px solid var(--zen-info)',
                borderRadius: 'var(--zen-radius-md)',
                padding: 'var(--zen-space-md)',
                marginBottom: 'var(--zen-space-lg)',
                color: 'var(--zen-info-light)',
                fontSize: 'var(--zen-text-sm)',
                textAlign: 'center'
              }}>
                📖 请跟随视频一起诵读，专心致志，心诚则灵
              </div>
              
              <motion.button
                className="zen-btn zen-btn-success"
                onClick={completeStudy}
                disabled={!isStudying}
                whileHover={{ scale: isStudying ? 1.02 : 1 }}
                whileTap={{ scale: isStudying ? 0.98 : 1 }}
                style={{
                  width: '100%',
                  opacity: isStudying ? 1 : 0.5
                }}
              >
                ✅ 完成学习 +{selectedSutra.duration * 10} 经验
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📖 经文阅读器模态框 */}
      <AnimatePresence>
        {showReader && selectedSutra && scriptureData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'var(--zen-bg-overlay)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--zen-space-lg)',
              zIndex: 1000
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="zen-card"
              style={{ maxWidth: '90vw', width: '100%', maxHeight: '90vh', overflow: 'auto' }}
            >
              <div className="zen-flex zen-justify-between zen-items-center zen-mb-lg">
                <h3 style={{
                  fontSize: 'var(--zen-text-lg)',
                  fontWeight: 600,
                  color: 'var(--zen-text-primary)'
                }}>
                  📖 {selectedSutra.subtitle}
                </h3>
                
                <button
                  onClick={() => {
                    setShowReader(false);
                    setIsStudying(false);
                    setSelectedSutra(null);
                    setScriptureData(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--zen-text-tertiary)',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div style={{
                background: 'var(--zen-info-alpha)',
                border: '1px solid var(--zen-info)',
                borderRadius: 'var(--zen-radius-md)',
                padding: 'var(--zen-space-md)',
                marginBottom: 'var(--zen-space-lg)',
                color: 'var(--zen-info-light)',
                fontSize: 'var(--zen-text-sm)',
                textAlign: 'center'
              }}>
                🎧 点击"开始跟读"按钮，跟随语音一起诵读经文
              </div>

              <ScriptureReader 
                scripture={scriptureData}
                onFinish={handleScriptureFinish}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GrowthPageOptimized; 