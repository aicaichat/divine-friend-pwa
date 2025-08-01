import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScriptureData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  content: string[];
  metadata: {
    totalCharacters: number;
    recommendedTimes: string[];
    benefits: string[];
  };
}

interface ScriptureLibraryPageProps {
  onNavigate?: (page: string) => void;
}

const ScriptureLibraryPage: React.FC<ScriptureLibraryPageProps> = ({ onNavigate }) => {
  const [selectedScripture, setSelectedScripture] = useState<ScriptureData | null>(null);
  const [showReader, setShowReader] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [isFollowReading, setIsFollowReading] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(0.8);
  const [fontSize, setFontSize] = useState(18);
  const [readingStats, setReadingStats] = useState({
    totalReadingTime: 0,
    completedScriptures: 0,
    currentStreak: 7
  });

  const paragraphRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);

  // 经文库数据
  const scriptures: ScriptureData[] = [
    {
      id: 'heart-sutra',
      title: '般若波罗蜜多心经',
      subtitle: '心经',
      description: '观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄',
      icon: '🌸',
      color: '#FF6B9D',
      gradient: 'linear-gradient(135deg, #FF6B9D 0%, #C44569 100%)',
      duration: 15,
      difficulty: 'beginner',
      benefits: ['开启智慧', '消除烦恼', '增长定力'],
      content: [
        '观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。',
        '舍利子，色不异空，空不异色，色即是空，空即是色，受想行识，亦复如是。',
        '舍利子，是诸法空相，不生不灭，不垢不净，不增不减。',
        '是故空中无色，无受想行识，无眼耳鼻舌身意，无色声香味触法。',
        '无眼界，乃至无意识界，无无明，亦无无明尽，乃至无老死，亦无老死尽。',
        '无苦集灭道，无智亦无得，以无所得故。',
        '菩提萨埵，依般若波罗蜜多故，心无挂碍，无挂碍故，无有恐怖，远离颠倒梦想，究竟涅槃。',
        '三世诸佛，依般若波罗蜜多故，得阿耨多罗三藐三菩提。',
        '故知般若波罗蜜多，是大神咒，是大明咒，是无上咒，是无等等咒。',
        '能除一切苦，真实不虚。',
        '故说般若波罗蜜多咒，即说咒曰：',
        '揭谛，揭谛，波罗揭谛，波罗僧揭谛，菩提萨婆诃。'
      ],
      metadata: {
        totalCharacters: 260,
        recommendedTimes: ['清晨', '正午', '黄昏'],
        benefits: ['智慧开启', '内心平静', '烦恼消除']
      }
    },
    {
      id: 'diamond-sutra',
      title: '金刚般若波罗蜜经',
      subtitle: '金刚经',
      description: '如是我闻，一时，佛在舍卫国祇树给孤独园，与大比丘众千二百五十人俱',
      icon: '💎',
      color: '#4834D4',
      gradient: 'linear-gradient(135deg, #4834D4 0%, #686DE0 100%)',
      duration: 45,
      difficulty: 'intermediate',
      benefits: ['破除执着', '证悟空性', '福慧双修'],
      content: [
        '如是我闻，一时，佛在舍卫国祇树给孤独园，与大比丘众千二百五十人俱。',
        '尔时，世尊食时，著衣持钵，入舍卫大城乞食。',
        '于其城中，次第乞已，还至本处。',
        '饭食讫，收衣钵，洗足已，敷座而坐。',
        '时，长老须菩提在大众中即从座起，偏袒右肩，右膝著地，合掌恭敬而白佛言：',
        '"希有！世尊！如来善护念诸菩萨，善付嘱诸菩萨。"',
        '"世尊！善男子、善女人，发阿耨多罗三藐三菩提心，应云何住，云何降伏其心？"',
        '佛言："善哉，善哉。须菩提！如汝所说，如来善护念诸菩萨，善付嘱诸菩萨。"',
        '"汝今谛听！当为汝说：善男子、善女人，发阿耨多罗三藐三菩提心，应如是住，如是降伏其心。"',
        '"唯然，世尊！愿乐欲闻。"'
      ],
      metadata: {
        totalCharacters: 5000,
        recommendedTimes: ['清晨', '夜晚'],
        benefits: ['破除我执', '智慧增长', '福德圆满']
      }
    },
    {
      id: 'lotus-sutra',
      title: '妙法莲华经',
      subtitle: '法华经',
      description: '如是我闻，一时佛住王舍城耆阇崛山中，与大比丘众万二千人俱',
      icon: '🪷',
      color: '#FD79A8',
      gradient: 'linear-gradient(135deg, #FD79A8 0%, #E84393 100%)',
      duration: 120,
      difficulty: 'advanced',
      benefits: ['究竟解脱', '普度众生', '成就佛道'],
      content: [
        '如是我闻，一时佛住王舍城耆阇崛山中，与大比丘众万二千人俱。',
        '皆是阿罗汉，诸漏已尽，无复烦恼，逮得己利，尽诸有结，心得自在。',
        '其名曰：阿若憍陈如、摩诃迦叶、优楼频螺迦叶、伽耶迦叶、那提迦叶。',
        '舍利弗、大目犍连、摩诃迦旃延、阿难陀、罗睺罗、憍梵波提、宾头卢颇罗堕。',
        '迦留陀夷、摩诃劫宾那、薄拘罗、阿楼驮，如是众所知识大阿罗汉等。',
        '复有学无学二千人，摩诃波阇波提比丘尼，与眷属六千人俱。',
        '罗睺罗母耶输陀罗比丘尼，亦与眷属俱。',
        '菩萨摩诃萨八万人，皆于阿耨多罗三藐三菩提不退转。',
        '皆得陀罗尼，乐说辩才，转不退转法轮，供养无量百千诸佛。',
        '于诸佛所，植众德本，常为诸佛之所称叹。'
      ],
      metadata: {
        totalCharacters: 8000,
        recommendedTimes: ['清晨'],
        benefits: ['成佛之道', '慈悲心增', '智慧圆满']
      }
    }
  ];

  // 初始化语音合成
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis;
    }
  }, []);

  // 自动滚动到当前段落
  useEffect(() => {
    if (paragraphRefs.current[currentParagraph]) {
      paragraphRefs.current[currentParagraph]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentParagraph]);

  // 跟读功能
  const handleFollowReading = () => {
    if (!selectedScripture || !speechSynthRef.current) return;

    if (isFollowReading) {
      speechSynthRef.current.cancel();
      setIsFollowReading(false);
      return;
    }

    setIsFollowReading(true);
    setCurrentParagraph(0);
    readNextParagraph(0);
  };

  const readNextParagraph = (paragraphIndex: number) => {
    if (!selectedScripture || !speechSynthRef.current || paragraphIndex >= selectedScripture.content.length) {
      setIsFollowReading(false);
      handleReadingComplete();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(selectedScripture.content[paragraphIndex]);
    utterance.lang = 'zh-CN';
    utterance.rate = readingSpeed;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setCurrentParagraph(paragraphIndex);
    };

    utterance.onend = () => {
      setTimeout(() => {
        readNextParagraph(paragraphIndex + 1);
      }, 800); // 段落间停顿
    };

    utterance.onerror = () => {
      setIsFollowReading(false);
    };

    speechSynthRef.current.speak(utterance);
  };

  // 阅读完成处理
  const handleReadingComplete = () => {
    if (!selectedScripture) return;

    // 更新阅读统计
    setReadingStats(prev => ({
      ...prev,
      totalReadingTime: prev.totalReadingTime + selectedScripture.duration,
      completedScriptures: prev.completedScriptures + 1
    }));

    // 保存到本地存储
    const completedScriptures = JSON.parse(localStorage.getItem('completedScriptures') || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    const newRecord = {
      scriptureId: selectedScripture.id,
      date: today,
      duration: selectedScripture.duration,
      type: isFollowReading ? 'follow-reading' : 'silent-reading'
    };

    completedScriptures.push(newRecord);
    localStorage.setItem('completedScriptures', JSON.stringify(completedScriptures));

    // 显示完成提示
    alert(`🎉 恭喜完成《${selectedScripture.subtitle}》诵读！\n功德 +${selectedScripture.duration}，智慧 +1`);
  };

  // 设计系统
  const designSystem = {
    colors: {
      primary: '#D4AF37',
      secondary: '#8B7355',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      card: 'rgba(255, 255, 255, 0.1)',
      text: {
        primary: '#FFFFFF',
        secondary: 'rgba(255, 255, 255, 0.8)',
        accent: '#D4AF37'
      }
    },
    shadows: {
      card: '0 8px 32px rgba(0, 0, 0, 0.1)',
      elevated: '0 12px 40px rgba(0, 0, 0, 0.15)'
    },
    borderRadius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px'
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '入门';
      case 'intermediate': return '进阶';
      case 'advanced': return '高级';
      default: return '未知';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: designSystem.colors.background,
      padding: '1rem'
    }}>
      {/* 页面头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          padding: '0 1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => onNavigate?.('home')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: designSystem.borderRadius.md,
              color: designSystem.colors.text.primary,
              fontSize: '1.5rem',
              width: '48px',
              height: '48px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            ←
          </button>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: designSystem.colors.text.primary,
              margin: 0,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              📚 经文库
            </h1>
            <p style={{
              fontSize: '1rem',
              color: designSystem.colors.text.secondary,
              margin: '0.25rem 0 0 0'
            }}>
              诵读经典，开启智慧
            </p>
          </div>
        </div>

        {/* 阅读统计 */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: designSystem.borderRadius.lg,
            padding: '1rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: designSystem.colors.text.accent
          }}>
            {readingStats.currentStreak}
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: designSystem.colors.text.secondary
          }}>
            连续天数
          </div>
        </motion.div>
      </motion.div>

      {!showReader ? (
        <>
          {/* 经文列表 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {scriptures.map((scripture, index) => (
              <motion.div
                key={scripture.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedScripture(scripture);
                  setShowReader(true);
                  setCurrentParagraph(0);
                }}
                style={{
                  background: scripture.gradient,
                  borderRadius: designSystem.borderRadius.xl,
                  padding: '2rem',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: designSystem.shadows.elevated,
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                {/* 背景装饰 */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* 图标和标题 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ fontSize: '3rem' }}>{scripture.icon}</span>
                    <div>
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'white',
                        margin: 0,
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        {scripture.subtitle}
                      </h3>
                      <p style={{
                        fontSize: '0.9rem',
                        color: 'rgba(255, 255, 255, 0.9)',
                        margin: '0.25rem 0 0 0'
                      }}>
                        {scripture.title}
                      </p>
                    </div>
                  </div>

                  {/* 描述 */}
                  <p style={{
                    fontSize: '1rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem'
                  }}>
                    {scripture.description}
                  </p>

                  {/* 标签和信息 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        background: `${getDifficultyColor(scripture.difficulty)}40`,
                        color: getDifficultyColor(scripture.difficulty),
                        padding: '0.25rem 0.75rem',
                        borderRadius: designSystem.borderRadius.sm,
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        border: `1px solid ${getDifficultyColor(scripture.difficulty)}60`
                      }}>
                        {getDifficultyLabel(scripture.difficulty)}
                      </span>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: designSystem.borderRadius.sm,
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        约 {scripture.duration} 分钟
                      </span>
                    </div>

                    <div style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: designSystem.borderRadius.md,
                      padding: '0.5rem 1rem',
                      fontSize: '0.9rem',
                      color: 'white',
                      fontWeight: '600'
                    }}>
                      点击阅读 →
                    </div>
                  </div>

                  {/* 功德标签 */}
                  <div style={{
                    marginTop: '1rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {scripture.benefits.slice(0, 3).map((benefit, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: designSystem.borderRadius.sm,
                          fontSize: '0.75rem',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <AnimatePresence>
          {/* 经文阅读器 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: designSystem.borderRadius.xl,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden',
              boxShadow: designSystem.shadows.elevated
            }}
          >
            {/* 阅读器头部 */}
            <div style={{
              background: selectedScripture?.gradient,
              padding: '2rem',
              textAlign: 'center',
              position: 'relative'
            }}>
              <button
                onClick={() => {
                  setShowReader(false);
                  setSelectedScripture(null);
                  if (speechSynthRef.current) {
                    speechSynthRef.current.cancel();
                  }
                  setIsFollowReading(false);
                }}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  color: 'white',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)'
                }}
              >
                ✕
              </button>

              <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>
                {selectedScripture?.icon}
              </span>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'white',
                margin: 0,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {selectedScripture?.subtitle}
              </h2>
              <p style={{
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: '0.5rem 0 0 0'
              }}>
                {selectedScripture?.title}
              </p>
            </div>

            {/* 控制面板 */}
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                {/* 阅读控制 */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFollowReading}
                    style={{
                      background: isFollowReading 
                        ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                        : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      border: 'none',
                      borderRadius: designSystem.borderRadius.md,
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    {isFollowReading ? '⏸️ 暂停跟读' : '🎧 开始跟读'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsReading(!isReading);
                      setCurrentParagraph(0);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                      border: 'none',
                      borderRadius: designSystem.borderRadius.md,
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    📖 {isReading ? '阅读中' : '开始阅读'}
                  </motion.button>
                </div>

                {/* 设置控制 */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: designSystem.colors.text.secondary
                  }}>
                    <span style={{ fontSize: '0.9rem' }}>语速:</span>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.1"
                      value={readingSpeed}
                      onChange={(e) => setReadingSpeed(parseFloat(e.target.value))}
                      style={{
                        width: '80px',
                        accentColor: designSystem.colors.primary
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', minWidth: '30px' }}>
                      {readingSpeed}x
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: designSystem.colors.text.secondary
                  }}>
                    <span style={{ fontSize: '0.9rem' }}>字号:</span>
                    <input
                      type="range"
                      min="14"
                      max="24"
                      step="2"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      style={{
                        width: '80px',
                        accentColor: designSystem.colors.primary
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', minWidth: '30px' }}>
                      {fontSize}px
                    </span>
                  </div>
                </div>
              </div>

              {/* 进度指示器 */}
              <div style={{
                marginTop: '1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                height: '8px',
                overflow: 'hidden'
              }}>
                <motion.div
                  animate={{
                    width: selectedScripture ? 
                      `${((currentParagraph + 1) / selectedScripture.content.length) * 100}%` : '0%'
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    height: '100%',
                    background: designSystem.colors.primary,
                    borderRadius: '10px'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                color: designSystem.colors.text.secondary
              }}>
                <span>
                  {currentParagraph + 1} / {selectedScripture?.content.length || 0}
                </span>
                <span>
                  {Math.round(((currentParagraph + 1) / (selectedScripture?.content.length || 1)) * 100)}%
                </span>
              </div>
            </div>

            {/* 经文内容 */}
            <div style={{
              padding: '2rem',
              maxHeight: '60vh',
              overflowY: 'auto',
              lineHeight: 1.8
            }}>
              {selectedScripture?.content.map((paragraph, index) => (
                <motion.p
                  key={index}
                  ref={(el) => paragraphRefs.current[index] = el}
                  animate={{
                    opacity: currentParagraph === index ? 1 : 0.5,
                    scale: currentParagraph === index ? 1.02 : 1,
                    background: currentParagraph === index ? 
                      'rgba(212, 175, 55, 0.2)' : 'transparent'
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    fontSize: `${fontSize}px`,
                    color: currentParagraph === index ? 
                      designSystem.colors.text.primary : 
                      designSystem.colors.text.secondary,
                    margin: '1rem 0',
                    padding: '1rem',
                    borderRadius: designSystem.borderRadius.md,
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                  onClick={() => setCurrentParagraph(index)}
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>

            {/* 底部信息 */}
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '0.9rem',
                color: designSystem.colors.text.secondary,
                margin: 0
              }}>
                🙏 愿以此功德，普及于一切，我等与众生，皆共成佛道
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default ScriptureLibraryPage; 