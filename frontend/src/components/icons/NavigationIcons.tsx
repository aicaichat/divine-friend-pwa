/**
 * 专业级导航图标系统
 * 基于佛教、道教文化的现代设计语言
 */

import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

// 今日运势 - 莲花日出
export const TodayIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 1.5, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* 太阳 */}
    <circle cx="12" cy="8" r="3" />
    <path d="M12 1v2" />
    <path d="M12 13v2" />
    <path d="m20.2 7.8-1.4-1.4" />
    <path d="m5.2 5.2-1.4 1.4" />
    <path d="M22 12h-2" />
    <path d="M4 12H2" />
    <path d="m20.2 16.2-1.4 1.4" />
    <path d="m5.2 18.8-1.4-1.4" />
    
    {/* 莲花 */}
    <path d="M8 18c0-2.21 1.79-4 4-4s4 1.79 4 4" />
    <path d="M6 20c0-3.31 2.69-6 6-6s6 2.69 6 6" />
    <path d="M4 22c0-4.42 3.58-8 8-8s8 3.58 8 8" />
  </svg>
);

// 法宝手串 - 佛珠
export const TreasureIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 1.5, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* 主珠 */}
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    
    {/* 108颗珠子 */}
    <circle cx="12" cy="4" r="1.5" />
    <circle cx="16.24" cy="5.76" r="1" />
    <circle cx="18.24" cy="9.76" r="1" />
    <circle cx="18.24" cy="14.24" r="1" />
    <circle cx="16.24" cy="18.24" r="1" />
    <circle cx="12" cy="20" r="1.5" />
    <circle cx="7.76" cy="18.24" r="1" />
    <circle cx="5.76" cy="14.24" r="1" />
    <circle cx="5.76" cy="9.76" r="1" />
    <circle cx="7.76" cy="5.76" r="1" />
    
    {/* 内圈小珠 */}
    <circle cx="12" cy="8" r="0.8" />
    <circle cx="15.5" cy="12" r="0.8" />
    <circle cx="12" cy="16" r="0.8" />
    <circle cx="8.5" cy="12" r="0.8" />
  </svg>
);

// 问仙对话 - 香炉祈福
export const OracleIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 1.5, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* 香炉底座 */}
    <path d="M6 18h12l-2 4H8l-2-4z" />
    <rect x="4" y="14" width="16" height="4" rx="2" />
    
    {/* 香炉装饰 */}
    <path d="M7 14v-2" />
    <path d="M12 14v-2" />
    <path d="M17 14v-2" />
    
    {/* 三柱香 */}
    <path d="M10 12V6" />
    <path d="M12 12V4" />
    <path d="M14 12V6" />
    
    {/* 香烟 */}
    <path d="M10 6c0-1 0-2 1-2s1 1 1 2" />
    <path d="M12 4c0-1 0-2 1-2s1 1 1 2" />
    <path d="M14 6c0-1 0-2 1-2s1 1 1 2" />
    
    {/* 祈福烟雾 */}
    <path d="M9 4c-1-1-1-2 0-2s1 1 0 2" strokeWidth="1" opacity="0.6" />
    <path d="M15 4c1-1 1-2 0-2s-1 1 0 2" strokeWidth="1" opacity="0.6" />
  </svg>
);

// 修行成长 - 菩提叶
export const GrowthIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 1.5, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* 菩提叶主体 */}
    <path d="M12 2c-4 0-8 4-8 8 0 6 8 12 8 12s8-6 8-12c0-4-4-8-8-8z" />
    
    {/* 叶脉 */}
    <path d="M12 6v12" strokeWidth="1" />
    <path d="M12 8c-2 0-4 1-4 3" strokeWidth="1" />
    <path d="M12 8c2 0 4 1 4 3" strokeWidth="1" />
    <path d="M12 12c-1.5 0-3 1-3 2.5" strokeWidth="1" />
    <path d="M12 12c1.5 0 3 1 3 2.5" strokeWidth="1" />
    
    {/* 莲花纹理 */}
    <circle cx="12" cy="10" r="2" fill="none" strokeWidth="1" opacity="0.4" />
    <path d="M10 10c0-1 1-2 2-2s2 1 2 2" strokeWidth="1" opacity="0.4" />
    
    {/* 智慧光芒 */}
    <path d="M12 2l1 2-1-2-1 2z" strokeWidth="1" opacity="0.6" />
    <path d="M20 10l-2 1 2-1 2 1z" strokeWidth="1" opacity="0.6" />
    <path d="M4 10l2 1-2-1-2 1z" strokeWidth="1" opacity="0.6" />
  </svg>
);

// 个人中心 - 打坐禅修
export const ProfileIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', strokeWidth = 1.5, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* 头部光环 */}
    <circle cx="12" cy="8" r="5" strokeWidth="1" opacity="0.3" />
    <circle cx="12" cy="8" r="3" strokeWidth="1" opacity="0.5" />
    
    {/* 人物头部 */}
    <circle cx="12" cy="8" r="2" />
    
    {/* 莲花坐姿身体 */}
    <path d="M7 14c0-2.5 2-4.5 5-4.5s5 2 5 4.5" />
    <path d="M6 18c0-3 3-5.5 6-5.5s6 2.5 6 5.5" />
    
    {/* 禅修手势 */}
    <circle cx="9" cy="15" r="1" strokeWidth="1" />
    <circle cx="15" cy="15" r="1" strokeWidth="1" />
    <path d="M9 15h6" strokeWidth="0.8" opacity="0.6" />
    
    {/* 莲花座 */}
    <path d="M5 20c0-1 2-2 7-2s7 1 7 2" />
    <path d="M6 22c0-1 2-1.5 6-1.5s6 0.5 6 1.5" strokeWidth="1" opacity="0.6" />
    
    {/* 内心光明 */}
    <circle cx="12" cy="13" r="0.8" fill={color} opacity="0.4" />
  </svg>
);

export const NavigationIcons = {
  TodayIcon,
  TreasureIcon,
  OracleIcon,
  GrowthIcon,
  ProfileIcon
};