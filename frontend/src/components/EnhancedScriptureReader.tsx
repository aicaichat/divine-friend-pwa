import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { advancedTTSService } from '../services/advancedTTSService';

interface Scripture {
  id: string;
  title: string;
  type: string;
  content: string[];
  description?: string;
}

interface EnhancedScriptureReaderProps {
  scripture: Scripture;
  onFinish?: () => void;
  onClose?: () => void;
}

const EnhancedScriptureReader: React.FC<EnhancedScriptureReaderProps> = ({ 
  scripture, 
  onFinish, 
  onClose 
}) => {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voiceQuality, setVoiceQuality] = useState<{voice: string; quality: string} | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(0.7);
  const [fontSize, setFontSize] = useState(18);
  const [autoScroll, setAutoScroll] = useState(true);
  
  const paragraphRefs = useRef<Array<HTMLDivElement | null>>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // 设计系统
  const designSystem = {
    colors: {
      primary: '#D4AF37',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      card: 'rgba(255, 255, 255, 0.1)',
      text: {
        primary: '#FFFFFF',
        secondary: 'rgba(255, 255, 255, 0.7)',
        accent: '#D4AF37'
      },
      button: {
        primary: 'linear-gradient(135deg, #FFD700, #FFA500)',
        secondary: 'rgba(255, 255, 255, 0.1)'
      }
    },
    borderRadius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    }
  };

  // 初始化语音质量检测
  useEffect(() => {
    const checkVoiceQuality = async () => {
      try {
        const quality = await advancedTTSService.testVoiceQuality();
        setVoiceQuality(quality);
      } catch (error) {
        console.error('语音质量检测失败:', error);
      }
    };

    checkVoiceQuality();
  }, []);

  // 自动滚动到当前段落
  useEffect(() => {
    if (autoScroll && paragraphRefs.current[currentParagraph]) {
      paragraphRefs.current[currentParagraph]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentParagraph, autoScroll]);

  // 更新进度
  useEffect(() => {
    const newProgress = scripture.content.length > 0 
      ? (currentParagraph / scripture.content.length) * 100 
      : 0;
    setProgress(newProgress);
  }, [currentParagraph, scripture.content.length]);

  // 开始/暂停播放
  const togglePlayback = async () => {
    if (isPlaying) {
      if (isPaused) {
        advancedTTSService.resume();
        setIsPaused(false);
      } else {
        advancedTTSService.pausePlayback();
        setIsPaused(true);
      }
    } else {
      setIsPlaying(true);
      setIsPaused(false);
      
      try {
        await advancedTTSService.speakScriptureSequence(
          scripture.content.slice(currentParagraph),
          scripture.type,
          (current, total) => {
            setCurrentParagraph(currentParagraph + current);
          },
          () => {
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentParagraph(0);
            onFinish?.();
          },
          (error) => {
            console.error('播放错误:', error);
            setIsPlaying(false);
            setIsPaused(false);
          }
        );
      } catch (error) {
        console.error('播放失败:', error);
        setIsPlaying(false);
        setIsPaused(false);
      }
    }
  };

  // 停止播放
  const stopPlayback = () => {
    advancedTTSService.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentParagraph(0);
  };

  // 跳转到指定段落
  const jumpToParagraph = (index: number) => {
    if (isPlaying) {
      advancedTTSService.stop();
      setIsPlaying(false);
      setIsPaused(false);
    }
    setCurrentParagraph(index);
  };

  // 调整语音设置
  const handleSpeedChange = (speed: number) => {
    setReadingSpeed(speed);
    advancedTTSService.setConfig({ rate: speed });
  };

  // 获取播放按钮图标和文本
  const getPlayButtonContent = () => {
    if (!isPlaying) {
      return { icon: '▶️', text: '开始诵读' };
    }
    if (isPaused) {
      return { icon: '▶️', text: '继续' };
    }
    return { icon: '⏸️', text: '暂停' };
  };

  const playButton = getPlayButtonContent();

  // 获取语音质量指示器
  const getQualityIndicator = () => {
    if (!voiceQuality) return '🔍 检测中...';
    
    const indicators = {
      'excellent': '🌟 优秀',
      'good': '✅ 良好',
      'basic': '⚠️ 基础',
      'poor': '❌ 较差'
    };
    
    return indicators[voiceQuality.quality as keyof typeof indicators] || '❓ 未知';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: designSystem.colors.background,
      padding: designSystem.spacing.md,
      paddingBottom: '6rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* 头部标题栏 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: designSystem.spacing.lg,
            padding: designSystem.spacing.md,
            background: designSystem.colors.card,
            borderRadius: designSystem.borderRadius.lg,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          <div>
            <h1 style={{
              color: designSystem.colors.text.primary,
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: 0,
              marginBottom: '0.25rem'
            }}>
              📜 {scripture.title}
            </h1>
            <p style={{
              color: designSystem.colors.text.secondary,
              fontSize: '0.9rem',
              margin: 0
            }}>
              {scripture.description || '经典诵读'}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: designSystem.spacing.sm }}>
            <motion.button
              onClick={() => setShowSettings(!showSettings)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '0.5rem',
                borderRadius: designSystem.borderRadius.md,
                border: 'none',
                background: designSystem.colors.button.secondary,
                color: designSystem.colors.text.primary,
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ⚙️
            </motion.button>
            
            {onClose && (
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '0.5rem',
                  borderRadius: designSystem.borderRadius.md,
                  border: 'none',
                  background: designSystem.colors.button.secondary,
                  color: designSystem.colors.text.primary,
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                ✕
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* 语音质量和进度指示器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            marginBottom: designSystem.spacing.lg,
            padding: designSystem.spacing.md,
            background: designSystem.colors.card,
            borderRadius: designSystem.borderRadius.lg,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: designSystem.spacing.sm
          }}>
            <div style={{
              color: designSystem.colors.text.secondary,
              fontSize: '0.8rem'
            }}>
              语音质量: {getQualityIndicator()}
              {voiceQuality && (
                <span style={{ marginLeft: '0.5rem', opacity: 0.7 }}>
                  ({voiceQuality.voice})
                </span>
              )}
            </div>
            <div style={{
              color: designSystem.colors.text.secondary,
              fontSize: '0.8rem'
            }}>
              {currentParagraph + 1} / {scripture.content.length}
            </div>
          </div>
          
          {/* 进度条 */}
          <div style={{
            height: '4px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              style={{
                height: '100%',
                background: designSystem.colors.primary,
                borderRadius: '2px'
              }}
            />
          </div>
        </motion.div>

        {/* 设置面板 */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                marginBottom: designSystem.spacing.lg,
                padding: designSystem.spacing.md,
                background: designSystem.colors.card,
                borderRadius: designSystem.borderRadius.lg,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                overflow: 'hidden'
              }}
            >
              <h3 style={{
                color: designSystem.colors.text.primary,
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: designSystem.spacing.md
              }}>
                🎛️ 诵读设置
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: designSystem.spacing.md
              }}>
                {/* 语速调节 */}
                <div>
                  <label style={{
                    display: 'block',
                    color: designSystem.colors.text.secondary,
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem'
                  }}>
                    语速: {readingSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.3"
                    max="1.2"
                    step="0.1"
                    value={readingSpeed}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      height: '4px',
                      borderRadius: '2px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  />
                </div>
                
                {/* 字体大小 */}
                <div>
                  <label style={{
                    display: 'block',
                    color: designSystem.colors.text.secondary,
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem'
                  }}>
                    字体大小: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="14"
                    max="28"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      height: '4px',
                      borderRadius: '2px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  />
                </div>
                
                {/* 自动滚动 */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: designSystem.colors.text.secondary,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={autoScroll}
                      onChange={(e) => setAutoScroll(e.target.checked)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    自动滚动
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 控制按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: designSystem.spacing.md,
            marginBottom: designSystem.spacing.lg
          }}
        >
          <motion.button
            onClick={togglePlayback}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: `${designSystem.spacing.md} ${designSystem.spacing.lg}`,
              borderRadius: designSystem.borderRadius.xl,
              border: 'none',
              background: designSystem.colors.button.primary,
              color: '#000',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{playButton.icon}</span>
            {playButton.text}
          </motion.button>
          
          {isPlaying && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={stopPlayback}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: `${designSystem.spacing.md} ${designSystem.spacing.lg}`,
                borderRadius: designSystem.borderRadius.xl,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: designSystem.colors.button.secondary,
                color: designSystem.colors.text.primary,
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>⏹️</span>
              停止
            </motion.button>
          )}
        </motion.div>

        {/* 经文内容 */}
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: designSystem.colors.card,
            borderRadius: designSystem.borderRadius.lg,
            padding: designSystem.spacing.lg,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            maxHeight: '60vh',
            overflowY: 'auto'
          }}
        >
          {scripture.content.map((paragraph, index) => (
            <motion.div
              key={index}
              ref={(el) => (paragraphRefs.current[index] = el)}
              onClick={() => jumpToParagraph(index)}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              style={{
                padding: designSystem.spacing.md,
                borderRadius: designSystem.borderRadius.md,
                marginBottom: designSystem.spacing.sm,
                cursor: 'pointer',
                border: currentParagraph === index 
                  ? `2px solid ${designSystem.colors.primary}` 
                  : '2px solid transparent',
                background: currentParagraph === index 
                  ? 'rgba(212, 175, 55, 0.1)' 
                  : 'transparent',
                transition: 'all 0.3s ease'
              }}
            >
              <p style={{
                color: currentParagraph === index 
                  ? designSystem.colors.text.primary 
                  : designSystem.colors.text.secondary,
                fontSize: `${fontSize}px`,
                lineHeight: 1.8,
                margin: 0,
                fontWeight: currentParagraph === index ? '500' : '400'
              }}>
                {paragraph}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedScriptureReader; 