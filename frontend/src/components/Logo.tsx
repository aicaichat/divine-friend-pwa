import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'white' | 'gold';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 40, 
  className = '', 
  showText = true,
  variant = 'default'
}) => {
  const getColors = () => {
    switch (variant) {
      case 'white':
        return {
          circle: '#ffffff',
          elements: '#000000',
          text: '#000000'
        };
      case 'gold':
        return {
          circle: '#d97706',
          elements: '#ffffff',
          text: '#ffffff'
        };
      default:
        return {
          circle: '#d97706', // 更亮的金色，在深色背景上更可见
          elements: '#ffffff', // 白色图案
          text: '#ffffff' // 白色文字
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`logo-container ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Logo SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* 圆形背景 */}
        <circle
          cx="20"
          cy="20"
          r="18"
          fill={colors.circle}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
        
        {/* 内层装饰圆 */}
        <circle
          cx="20"
          cy="20"
          r="15"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="0.5"
        />
        
        {/* 中央神字符号 - 简化的神字图案 */}
        <g transform="translate(20, 20)">
          {/* 左部：示字旁（礻）抽象设计 */}
          <g transform="translate(-4, 0)">
            {/* 示字旁的三点 */}
            <circle cx="0" cy="-6" r="1.2" fill={colors.elements} />
            <circle cx="0" cy="0" r="1.2" fill={colors.elements} />
            <circle cx="0" cy="6" r="1.2" fill={colors.elements} />
            
            {/* 示字旁的竖线 */}
            <path
              d="M 2 -8 L 2 8"
              stroke={colors.elements}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
          
          {/* 右部：申字抽象设计 */}
          <g transform="translate(3, 0)">
            {/* 申字的外框 */}
            <rect
              x="-3"
              y="-7"
              width="6"
              height="14"
              fill="none"
              stroke={colors.elements}
              strokeWidth="1.5"
              rx="1"
            />
            
            {/* 申字的横线 */}
            <path
              d="M -2 -2 L 2 -2"
              stroke={colors.elements}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M -2 2 L 2 2"
              stroke={colors.elements}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            
            {/* 申字的竖线 */}
            <path
              d="M 0 -6 L 0 6"
              stroke={colors.elements}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        </g>
        
        {/* 装饰性小点 */}
        <circle cx="12" cy="12" r="1" fill={colors.elements} opacity="0.6" />
        <circle cx="28" cy="12" r="1" fill={colors.elements} opacity="0.6" />
        <circle cx="12" cy="28" r="1" fill={colors.elements} opacity="0.6" />
        <circle cx="28" cy="28" r="1" fill={colors.elements} opacity="0.6" />
      </svg>

      {/* Logo文字 */}
      {showText && (
        <div className="logo-text" style={{ 
          fontSize: `${Math.max(14, size * 0.4)}px`,
          fontWeight: 600,
          color: colors.text,
          lineHeight: 1.2
        }}>
          <div style={{ fontSize: '1em', fontWeight: 700 }}>
            神仙朋友
          </div>
          <div style={{ 
            fontSize: '0.7em', 
            fontWeight: 400, 
            opacity: 0.7,
            marginTop: '2px'
          }}>
            Divine Friend
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo; 