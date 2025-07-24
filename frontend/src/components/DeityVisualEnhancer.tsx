import React, { useState, useEffect, useRef } from 'react'

interface DeityVisualEnhancerProps {
  deityId: string
  deityName: string
  imageUrl: string
  fallbackEmoji: string
  mood: string
  isActive: boolean
  size?: 'small' | 'medium' | 'large'
  showAura?: boolean
  showMoodIndicator?: boolean
  onClick?: () => void
}

/**
 * 🌟 神仙视觉增强组件
 * 提供动态光环、情绪指示、粒子效果等视觉增强
 */
const DeityVisualEnhancer: React.FC<DeityVisualEnhancerProps> = ({
  deityId,
  deityName,
  imageUrl,
  fallbackEmoji,
  mood,
  isActive,
  size = 'medium',
  showAura = true,
  showMoodIndicator = true,
  onClick
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, opacity: number}>>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  // 神仙专属颜色主题
  const deityThemes = {
    guanyin: {
      primary: '#FFE4B5',
      secondary: '#F0E68C',
      aura: 'rgba(255, 228, 181, 0.6)',
      particles: '#FFD700'
    },
    budongzun: {
      primary: '#FF6B6B',
      secondary: '#FF8E8E',
      aura: 'rgba(255, 107, 107, 0.6)',
      particles: '#FF4757'
    },
    dashizhi: {
      primary: '#4FACFE',
      secondary: '#00F2FE',
      aura: 'rgba(79, 172, 254, 0.6)',
      particles: '#0984e3'
    },
    wenshu: {
      primary: '#43E97B',
      secondary: '#38F9D7',
      aura: 'rgba(67, 233, 123, 0.6)',
      particles: '#00b894'
    },
    xukong: {
      primary: '#A8E6CF',
      secondary: '#C4E1F0',
      aura: 'rgba(168, 230, 207, 0.6)',
      particles: '#74b9ff'
    },
    amitabha: {
      primary: '#FFB347',
      secondary: '#FFCC70',
      aura: 'rgba(255, 179, 71, 0.6)',
      particles: '#fdcb6e'
    },
    dairiruiai: {
      primary: '#FF9F7A',
      secondary: '#FFB997',
      aura: 'rgba(255, 159, 122, 0.6)',
      particles: '#fd79a8'
    }
  }

  const theme = deityThemes[deityId as keyof typeof deityThemes] || deityThemes.guanyin

  // 尺寸配置
  const sizeConfig = {
    small: { width: 60, height: 60, fontSize: '1.5rem' },
    medium: { width: 100, height: 100, fontSize: '2.5rem' },
    large: { width: 140, height: 140, fontSize: '3.5rem' }
  }

  const { width, height, fontSize } = sizeConfig[size]

  // 粒子动画系统
  useEffect(() => {
    if (!isActive || !showAura) return

    const generateParticles = () => {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * width,
        y: Math.random() * height,
        opacity: Math.random() * 0.8 + 0.2
      }))
      setParticles(newParticles)
    }

    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: particle.y - 1,
        opacity: particle.opacity - 0.01
      })).filter(p => p.opacity > 0))

      // 每隔一段时间生成新粒子
      if (Math.random() > 0.9) {
        generateParticles()
      }

      animationRef.current = requestAnimationFrame(animateParticles)
    }

    generateParticles()
    animationRef.current = requestAnimationFrame(animateParticles)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, showAura, width, height])

  // 情绪颜色映射
  const getMoodColor = (mood: string): string => {
    const moodColors = {
      '慈悲': '#FFE4B5',
      '坚定': '#FF6B6B', 
      '智慧': '#4FACFE',
      '博学': '#43E97B',
      '神秘': '#A8E6CF',
      '光明': '#FFB347',
      '平静': '#C4E1F0'
    }
    return moodColors[mood as keyof typeof moodColors] || theme.primary
  }

  return (
    <div
      ref={containerRef}
      className="deity-visual-enhancer"
      onClick={onClick}
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: '50%',
        overflow: 'visible'
      }}
    >
      {/* 动态光环系统 */}
      {showAura && isActive && (
        <>
          {/* 主光环 */}
          <div
            className="deity-main-aura"
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              background: `conic-gradient(from 0deg, ${theme.primary}, ${theme.secondary}, ${theme.primary})`,
              animation: 'deity-rotate 4s linear infinite',
              zIndex: -1
            }}
          />
          
          {/* 脉冲光环 */}
          <div
            className="deity-pulse-aura"
            style={{
              position: 'absolute',
              inset: '-8px',
              borderRadius: '50%',
              background: `radial-gradient(circle, transparent 60%, ${theme.aura})`,
              animation: 'deity-pulse 2s ease-in-out infinite',
              zIndex: -2
            }}
          />
          
          {/* 呼吸光环 */}
          <div
            className="deity-breath-aura"
            style={{
              position: 'absolute',
              inset: '-12px',
              borderRadius: '50%',
              background: `radial-gradient(circle, transparent 70%, ${theme.aura})`,
              animation: 'deity-breathe 3s ease-in-out infinite',
              zIndex: -3,
              opacity: 0.5
            }}
          />
        </>
      )}

      {/* 主头像容器 */}
      <div
        className="deity-avatar-container"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          border: `3px solid ${theme.primary}`,
          boxShadow: `0 0 20px ${theme.aura}`,
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          transition: 'all 0.4s ease',
          transform: isActive ? 'scale(1.05)' : 'scale(1)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {!imageError ? (
          <img
            src={imageUrl}
            alt={deityName}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'all 0.5s ease',
              filter: isActive ? 'brightness(1.1) saturate(1.2)' : 'brightness(1)',
              opacity: imageLoaded ? 1 : 0
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize,
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
            }}
          >
            {fallbackEmoji}
          </div>
        )}
      </div>

      {/* 粒子效果系统 */}
      {showAura && particles.map(particle => (
        <div
          key={particle.id}
          className="deity-particle"
          style={{
            position: 'absolute',
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: theme.particles,
            opacity: particle.opacity,
            boxShadow: `0 0 6px ${theme.particles}`,
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      ))}

      {/* 状态指示器 */}
      <div
        className="deity-status-indicator"
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, #00ff88, #00ccff)`,
          border: '3px solid white',
          boxShadow: '0 0 15px rgba(0, 255, 136, 0.5)',
          animation: isActive ? 'pulse-divine 2s ease-in-out infinite' : 'none',
          zIndex: 2
        }}
      />

      {/* 情绪指示器 */}
      {showMoodIndicator && (
        <div
          className="deity-mood-indicator"
          style={{
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '4px 8px',
            borderRadius: '12px',
            background: getMoodColor(mood),
            color: 'rgba(0, 0, 0, 0.8)',
            fontSize: '10px',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 3,
            whiteSpace: 'nowrap'
          }}
        >
          {mood}
        </div>
      )}

      {/* 交互涟漪效果 */}
      {onClick && (
        <div
          className="deity-ripple-effect"
          style={{
            position: 'absolute',
            inset: '0',
            borderRadius: '50%',
            background: 'transparent',
            zIndex: 4,
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            if (containerRef.current) {
              containerRef.current.style.transform = 'scale(1.1)'
            }
          }}
          onMouseLeave={(e) => {
            if (containerRef.current) {
              containerRef.current.style.transform = 'scale(1)'
            }
          }}
        />
      )}

      {/* CSS动画定义 */}
      <style>{`
        @keyframes deity-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes deity-pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.6; 
          }
          50% { 
            transform: scale(1.1); 
            opacity: 1; 
          }
        }
        
        @keyframes deity-breathe {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.3; 
          }
          50% { 
            transform: scale(1.2); 
            opacity: 0.7; 
          }
        }
        
        @keyframes pulse-divine {
          0%, 100% { 
            transform: scale(1); 
            opacity: 1; 
          }
          50% { 
            transform: scale(1.3); 
            opacity: 0.8; 
          }
        }
        
        .deity-visual-enhancer {
          transition: transform 0.3s ease;
        }
        
        .deity-visual-enhancer:hover {
          filter: drop-shadow(0 0 20px ${theme.aura});
        }
      `}</style>
    </div>
  )
}

export default DeityVisualEnhancer