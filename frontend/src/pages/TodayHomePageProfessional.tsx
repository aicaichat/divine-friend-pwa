import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { outfitAiService, UserProfile } from '../services/outfitAiService';

interface TodayHomePageProfessionalProps {
  onNavigate?: (page: string) => void;
}

// 穿衣搭配数据接口
interface OutfitRecommendation {
  id: string;
  theme: string;
  colors: string[];
  mainColor: string;
  accessory: string;
  style: string;
  fortuneBoost: {
    wealth: number;
    career: number;
    love: number;
    health: number;
  };
  description: string;
  tips: string[];
  luckyTime: string;
  avoidColors?: string[];
  materialsToWear: string[];
  energyLevel: 'high' | 'medium' | 'low';
}

// 运势数据接口
interface DailyFortune {
  overall_score: number;
  overall_level: string;
  overall_description: string;
  lucky_colors: string[];
  lucky_directions: string[];
  lucky_numbers: number[];
  suitable_activities: string[];
  unsuitable_activities: string[];
  wealth_fortune: {
    score: number;
    description: string;
    best_time: string;
  };
  career_fortune: {
    score: number;
    description: string;
    best_time: string;
  };
  love_fortune: {
    score: number;
    description: string;
    best_time: string;
  };
  health_fortune: {
    score: number;
    description: string;
    best_time: string;
  };
}

const TodayHomePageProfessional: React.FC<TodayHomePageProfessionalProps> = ({ onNavigate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitRecommendation | null>(null);
  const [showOutfitDetail, setShowOutfitDetail] = useState(false);
  const [fortuneData, setFortuneData] = useState<DailyFortune | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // 响应式检测
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1024;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 设计系统
  const designSystem = {
    colors: {
      primary: {
        gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 30%, #FF8C00 100%)',
        light: '#FFE55C',
        dark: '#CC8400',
        glow: 'rgba(255, 215, 0, 0.3)'
      },
      fashion: {
        luxury: 'linear-gradient(135deg, #8B5A3C 0%, #A0522D 100%)',
        elegant: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
        vibrant: 'linear-gradient(135deg, #E74C3C 0%, #F39C12 100%)',
        peaceful: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)',
        mysterious: 'linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%)'
      },
      background: {
        primary: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
        overlay: 'linear-gradient(45deg, rgba(255, 215, 0, 0.03) 0%, rgba(138, 43, 226, 0.03) 100%)',
        card: 'rgba(255, 255, 255, 0.08)',
        cardHover: 'rgba(255, 255, 255, 0.12)'
      },
      text: {
        primary: '#FFFFFF',
        secondary: 'rgba(255, 255, 255, 0.85)',
        muted: 'rgba(255, 255, 255, 0.65)',
        accent: '#FFD700'
      }
    },
    shadows: {
      ambient: '0 8px 40px rgba(0, 0, 0, 0.12)',
      elevated: '0 16px 64px rgba(0, 0, 0, 0.24)',
      floating: '0 24px 80px rgba(0, 0, 0, 0.36)',
      glow: {
        primary: '0 0 40px rgba(255, 215, 0, 0.4)',
        wealth: '0 0 30px rgba(255, 215, 0, 0.6)'
      }
    },
    borderRadius: {
      sm: '12px',
      md: '20px',
      lg: '28px',
      xl: '36px'
    },
    animations: {
      smooth: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
      bouncy: { duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] },
      gentle: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  // 今日穿衣推荐数据
  const outfitRecommendations: OutfitRecommendation[] = [
    {
      id: 'wealth-magnifier',
      theme: '财运加持套装',
      colors: ['金色', '深红色', '黑色'],
      mainColor: '#FFD700',
      accessory: '金质饰品',
      style: '商务精英',
      fortuneBoost: {
        wealth: 95,
        career: 88,
        love: 75,
        health: 80
      },
      description: '金色主调搭配深红色点缀，激发财富磁场，助力事业腾飞',
      tips: [
        '佩戴金质手表或项链增强财运磁场',
        '选择有光泽的面料提升贵气',
        '深红色配件象征红火生意',
        '避免过多银色，以免冲突金运'
      ],
      luckyTime: '上午9:00-11:00',
      avoidColors: ['白色', '浅蓝色'],
      materialsToWear: ['丝绸', '羊毛', '真皮'],
      energyLevel: 'high'
    },
    {
      id: 'love-harmony',
      theme: '桃花运旺套装',
      colors: ['粉色', '玫瑰金', '米白色'],
      mainColor: '#FF69B4',
      accessory: '玫瑰金饰品',
      style: '温柔优雅',
      fortuneBoost: {
        wealth: 70,
        career: 75,
        love: 92,
        health: 85
      },
      description: '粉色系搭配玫瑰金，提升个人魅力，增强人际关系运势',
      tips: [
        '粉色系激活心轮能量',
        '玫瑰金饰品增加温柔气质',
        '米白色平衡整体能量',
        '避免黑色系压制桃花运'
      ],
      luckyTime: '下午2:00-4:00',
      avoidColors: ['黑色', '深灰色'],
      materialsToWear: ['棉质', '雪纺', '珍珠'],
      energyLevel: 'medium'
    },
    {
      id: 'career-power',
      theme: '事业运势套装',
      colors: ['深蓝色', '银色', '白色'],
      mainColor: '#1E3A8A',
      accessory: '银质胸针',
      style: '权威专业',
      fortuneBoost: {
        wealth: 85,
        career: 95,
        love: 70,
        health: 88
      },
      description: '深蓝色象征智慧与权威，银色配饰增强决策力和领导气质',
      tips: [
        '深蓝色激发智慧和冷静',
        '银色饰品增强沟通能力',
        '白色衬衫提升专业形象',
        '避免花俏图案影响专业度'
      ],
      luckyTime: '上午8:00-10:00',
      avoidColors: ['鲜艳颜色', '花纹图案'],
      materialsToWear: ['羊毛', '棉质', '金属配饰'],
      energyLevel: 'high'
    },
    {
      id: 'health-vitality',
      theme: '健康活力套装',
      colors: ['翠绿色', '天蓝色', '白色'],
      mainColor: '#10B981',
      accessory: '天然石饰品',
      style: '自然清新',
      fortuneBoost: {
        wealth: 75,
        career: 80,
        love: 85,
        health: 95
      },
      description: '绿色系代表生命力，天蓝色带来平和，提升整体健康运势',
      tips: [
        '绿色系激活生命能量',
        '天然石饰品增强地气连接',
        '天蓝色平衡情绪和压力',
        '白色净化负面能量'
      ],
      luckyTime: '清晨6:00-8:00',
      avoidColors: ['深色系', '黑色'],
      materialsToWear: ['天然纤维', '天然石', '木质配饰'],
      energyLevel: 'medium'
    }
  ];

  // 模拟运势数据
  const mockFortuneData: DailyFortune = {
    overall_score: 82,
    overall_level: '吉',
    overall_description: '今日运势整体向好，穿衣搭配将为您带来额外的运势加持',
    lucky_colors: ['金色', '深红色', '翠绿色'],
    lucky_directions: ['东南', '正南'],
    lucky_numbers: [8, 18, 28],
    suitable_activities: ['投资理财', '商务洽谈', '签约合作', '重要会议', '求婚表白', '搬家装修'],
    unsuitable_activities: ['借贷放款', '争吵冲突', '手术开刀', '丧事白事', '分手离婚', '赌博投机'],
    wealth_fortune: {
      score: 88,
      description: '财运旺盛，适合投资和商务洽谈',
      best_time: '上午9:00-11:00'
    },
    career_fortune: {
      score: 85,
      description: '事业运势良好，领导力得到认可',
      best_time: '上午8:00-10:00'
    },
    love_fortune: {
      score: 78,
      description: '人际关系和谐，桃花运渐旺',
      best_time: '下午2:00-4:00'
    },
    health_fortune: {
      score: 80,
      description: '身体状况稳定，注意适度运动',
      best_time: '清晨6:00-8:00'
    }
  };

  // 获取用户信息
  const getUserProfile = (): UserProfile | null => {
    try {
      // 从localStorage获取用户信息
      const savedUser = localStorage.getItem('user_profile');
      if (savedUser) {
        const userInfo = JSON.parse(savedUser);
        return {
          birthdate: userInfo.birthdate || userInfo.birth_info?.date_time || "1990-05-15T08:30:00",
          name: userInfo.name || userInfo.birth_info?.name || "游客用户",
          gender: userInfo.gender || "male",
          birth_place: userInfo.birth_place || userInfo.birth_info?.place
        };
      }

      // 如果没有保存的用户信息，尝试从其他地方获取
      const birthInfo = localStorage.getItem('birth_info');
      if (birthInfo) {
        const info = JSON.parse(birthInfo);
        return {
          birthdate: info.date_time || "1990-05-15T08:30:00",
          name: info.name || "游客用户",
          gender: info.gender || "male",
          birth_place: info.place
        };
      }

      return null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  };

  // 获取时间问候
  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return { text: '夜深了', icon: '🌙' };
    if (hour < 9) return { text: '早安', icon: '🌅' };
    if (hour < 12) return { text: '上午好', icon: '☀️' };
    if (hour < 14) return { text: '午安', icon: '🌞' };
    if (hour < 18) return { text: '下午好', icon: '🌤️' };
    if (hour < 22) return { text: '晚上好', icon: '🌆' };
    return { text: '夜安', icon: '🌙' };
  };

  // 获取推荐穿衣
  const getRecommendedOutfit = () => {
    if (!fortuneData) return outfitRecommendations[0];
    
    // 根据运势数据智能推荐
    const { wealth_fortune, career_fortune, love_fortune } = fortuneData;
    
    if (wealth_fortune.score >= 85) {
      return outfitRecommendations.find(o => o.id === 'wealth-magnifier') || outfitRecommendations[0];
    }
    if (career_fortune.score >= 85) {
      return outfitRecommendations.find(o => o.id === 'career-power') || outfitRecommendations[2];
    }
    if (love_fortune.score >= 85) {
      return outfitRecommendations.find(o => o.id === 'love-harmony') || outfitRecommendations[1];
    }
    
    return outfitRecommendations[3]; // 默认健康活力套装
  };

  // 加载真实运势和穿衣数据
  const loadRealFortuneData = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      const userProfile = getUserProfile();
      
      if (!userProfile) {
        console.log('🔄 未找到用户信息，使用模拟数据');
        setFortuneData(mockFortuneData);
        setSelectedOutfit(getRecommendedOutfit());
        setIsLoading(false);
        return;
      }

      console.log('🤖 开始获取真实AI推荐数据...');
      console.log('👤 用户信息:', userProfile);

      // 1. 获取AI穿衣推荐
      const aiResponse = await outfitAiService.getOutfitRecommendations({
        user_profile: userProfile,
        target_date: new Date().toISOString().split('T')[0],
        preferences: {
          season: getCurrentSeason(),
          occasion: ['business', 'casual']
        }
      });

      console.log('✅ AI推荐获取成功:', aiResponse);

      // 2. 转换AI数据为前端格式
      const convertedFortuneData: DailyFortune = {
        overall_score: aiResponse.ai_analysis.daily_fortune.overall_score,
        overall_level: aiResponse.ai_analysis.daily_fortune.overall_score >= 85 ? '大吉' : 
                      aiResponse.ai_analysis.daily_fortune.overall_score >= 75 ? '吉' :
                      aiResponse.ai_analysis.daily_fortune.overall_score >= 65 ? '中吉' : '平',
        overall_description: aiResponse.ai_analysis.recommendation_reason,
        lucky_colors: ['金色', '深红色', '翠绿色'], // 从AI推荐中提取
        lucky_directions: ['东南', '正南'],
        lucky_numbers: [8, 18, 28],
        suitable_activities: ['投资理财', '商务洽谈', '签约合作', '重要会议'],
        unsuitable_activities: ['借贷放款', '争吵冲突', '手术开刀'],
        wealth_fortune: {
          score: aiResponse.ai_analysis.daily_fortune.wealth_fortune,
          description: '财运旺盛，适合投资和商务洽谈',
          best_time: '上午9:00-11:00'
        },
        career_fortune: {
          score: aiResponse.ai_analysis.daily_fortune.career_fortune,
          description: '事业运势良好，领导力得到认可',
          best_time: '上午8:00-10:00'
        },
        love_fortune: {
          score: aiResponse.ai_analysis.daily_fortune.love_fortune,
          description: '人际关系和谐，桃花运渐旺',
          best_time: '下午2:00-4:00'
        },
        health_fortune: {
          score: aiResponse.ai_analysis.daily_fortune.health_fortune,
          description: '身体状况稳定，注意适度运动',
          best_time: '清晨6:00-8:00'
        }
      };

      // 3. 转换AI推荐的穿衣方案
      if (aiResponse.recommendations && aiResponse.recommendations.length > 0) {
        const aiOutfitRecommendations = aiResponse.recommendations.map((rec, index) => ({
          id: `ai-${rec.id}`,
          theme: rec.theme,
          colors: rec.outfit_details.primary_colors,
          mainColor: rec.outfit_details.primary_colors[0] || '#FFD700',
          accessory: rec.outfit_details.accessories?.[0] || '智能配饰',
          style: rec.outfit_details.style || '智能搭配',
          fortuneBoost: {
            wealth: rec.base_fortune_boost.wealth,
            career: rec.base_fortune_boost.career,
            love: rec.base_fortune_boost.love,
            health: rec.base_fortune_boost.health
          },
          description: rec.five_elements_analysis.enhancement_theory,
          tips: [
            `最佳穿着时间: ${rec.timing_advice.best_wear_time}`,
            `适合活动: ${rec.timing_advice.optimal_activities.join(', ')}`,
            `五行匹配: ${rec.five_elements_analysis.element_match}`
          ],
          luckyTime: rec.timing_advice.best_wear_time,
          materialsToWear: rec.outfit_details.materials || ['优质面料'],
          energyLevel: rec.confidence > 0.8 ? 'high' : rec.confidence > 0.6 ? 'medium' : 'low' as 'high' | 'medium' | 'low'
        }));

        setAiRecommendations(aiOutfitRecommendations);
        
        // 使用AI推荐的第一个作为选中项
        if (aiOutfitRecommendations.length > 0) {
          setSelectedOutfit(aiOutfitRecommendations[0]);
        }
      }

      // 4. 更新状态
      setFortuneData(convertedFortuneData);
      
      console.log('🎯 真实数据加载完成');

    } catch (error) {
      console.error('❌ 加载真实数据失败:', error);
      setApiError('获取AI推荐失败，使用模拟数据');
      
      // 降级到模拟数据
      setFortuneData(mockFortuneData);
      setSelectedOutfit(getRecommendedOutfit());
    } finally {
      setIsLoading(false);
    }
  };

  // 获取当前季节
  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  };

  // 初始化数据
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // 加载真实数据
    loadRealFortuneData();

    return () => clearInterval(timer);
  }, []);

  // 更新推荐outfit
  useEffect(() => {
    if (fortuneData && !selectedOutfit && outfitRecommendations.length > 0) {
      setSelectedOutfit(getRecommendedOutfit());
    }
  }, [fortuneData]);

  const greeting = getTimeGreeting();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: designSystem.colors.background.primary,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            width: '60px',
            height: '60px',
            border: '3px solid rgba(255, 215, 0, 0.3)',
            borderTop: '3px solid #FFD700',
            borderRadius: '50%',
            marginBottom: '1rem'
          }}
        />
        <div style={{
          fontSize: '1.1rem',
          color: designSystem.colors.text.primary,
          textAlign: 'center',
          marginBottom: '0.5rem'
        }}>
          🤖 AI智能分析中...
        </div>
        <div style={{
          fontSize: '0.9rem',
          color: designSystem.colors.text.secondary,
          textAlign: 'center'
        }}>
          正在计算您的八字运势和穿衣推荐
        </div>
      </div>
    );
  }

  const renderOutfitCard = (outfit: OutfitRecommendation, isMain: boolean = false) => (
    <motion.div
      key={outfit.id}
      layoutId={`outfit-${outfit.id}`}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        setSelectedOutfit(outfit);
        if (isMain) {
          setShowOutfitDetail(true);
        }
      }}
      style={{
        background: isMain 
          ? `linear-gradient(135deg, ${outfit.mainColor}20 0%, ${outfit.mainColor}10 100%)`
          : designSystem.colors.background.card,
        backdropFilter: 'blur(20px)',
        borderRadius: designSystem.borderRadius.lg,
        padding: isMobile ? '1.5rem' : '2rem',
        border: `2px solid ${isMain ? outfit.mainColor + '40' : 'rgba(255, 255, 255, 0.1)'}`,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isMain 
          ? `0 20px 60px ${outfit.mainColor}30, ${designSystem.shadows.elevated}`
          : designSystem.shadows.ambient
      }}
    >
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '200%',
        height: '200%',
        background: `radial-gradient(circle, ${outfit.mainColor}08 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* 标题和能量等级 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            fontSize: isMain ? (isMobile ? '1.3rem' : '1.5rem') : '1.1rem',
            fontWeight: '700',
            color: designSystem.colors.text.primary,
            margin: 0
          }}>
            {outfit.theme}
          </h3>
          
          <div style={{
            display: 'flex',
            gap: '2px'
          }}>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  width: '6px',
                  height: '20px',
                  background: i <= (outfit.energyLevel === 'high' ? 3 : outfit.energyLevel === 'medium' ? 2 : 1)
                    ? outfit.mainColor
                    : 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '3px'
                }}
              />
            ))}
          </div>
        </div>

        {/* 主要颜色展示 */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          {outfit.colors.slice(0, 3).map((color, index) => (
            <div
              key={index}
              style={{
                width: '24px',
                height: '24px',
                background: color === '金色' ? '#FFD700' :
                           color === '深红色' ? '#8B0000' :
                           color === '黑色' ? '#1a1a1a' :
                           color === '粉色' ? '#FF69B4' :
                           color === '玫瑰金' ? '#E8B4A0' :
                           color === '米白色' ? '#F5F5DC' :
                           color === '深蓝色' ? '#1E3A8A' :
                           color === '银色' ? '#C0C0C0' :
                           color === '白色' ? '#FFFFFF' :
                           color === '翠绿色' ? '#10B981' :
                           color === '天蓝色' ? '#87CEEB' : '#CCCCCC',
                borderRadius: '50%',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            />
          ))}
        </div>

        {/* 运势加持显示 */}
        <div style={{ marginBottom: '1rem' }}>
          {/* 简化版运势显示（非主推方案） */}
          {!isMain && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.4rem',
              marginBottom: '0.75rem'
            }}>
              {[
                { key: 'wealth', icon: '💰', value: outfit.fortuneBoost.wealth, color: '#FFD700' },
                { key: 'career', icon: '🚀', value: outfit.fortuneBoost.career, color: '#3B82F6' },
                { key: 'love', icon: '💕', value: outfit.fortuneBoost.love, color: '#EC4899' },
                { key: 'health', icon: '🌿', value: outfit.fortuneBoost.health, color: '#22C55E' }
              ].map(item => {
                const baseScores = {
                  wealth: fortuneData?.wealth_fortune?.score || 88,
                  career: fortuneData?.career_fortune?.score || 85,
                  love: fortuneData?.love_fortune?.score || 78,
                  health: fortuneData?.health_fortune?.score || 80
                };
                
                const baseValue = baseScores[item.key as keyof typeof baseScores];
                const difference = item.value - baseValue;
                const isPositive = difference > 0;
                
                return (
                  <div
                    key={item.key}
                    style={{
                      textAlign: 'center',
                      padding: '0.4rem',
                      background: `${item.color}15`,
                      borderRadius: designSystem.borderRadius.sm,
                      border: `1px solid ${item.color}30`,
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                      {item.icon}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: item.color,
                      marginBottom: '0.1rem'
                    }}>
                      {item.value}
                    </div>
                    {difference !== 0 && (
                      <div style={{
                        fontSize: '0.6rem',
                        color: isPositive ? '#22C55E' : '#EF4444',
                        fontWeight: '500'
                      }}>
                        {isPositive ? `+${difference}` : difference}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 详细版运势显示（主推方案） */}
          {isMain && (
          <div style={{ marginBottom: '1rem' }}>
            {/* 加持效果标题 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <span style={{ fontSize: '1.1rem' }}>🔥</span>
              <span style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: designSystem.colors.text.primary
              }}>
                穿衣加持效果
              </span>
              <span style={{
                fontSize: '0.7rem',
                color: designSystem.colors.text.secondary,
                background: 'rgba(255, 215, 0, 0.2)',
                padding: '0.15rem 0.4rem',
                borderRadius: '8px'
              }}>
                AI智能计算
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.6rem'
            }}>
              {[
                { key: 'wealth', label: '财运', icon: '💰', value: outfit.fortuneBoost.wealth, color: '#FFD700' },
                { key: 'career', label: '事业', icon: '🚀', value: outfit.fortuneBoost.career, color: '#3B82F6' },
                { key: 'love', label: '情感', icon: '💕', value: outfit.fortuneBoost.love, color: '#EC4899' },
                { key: 'health', label: '健康', icon: '🌿', value: outfit.fortuneBoost.health, color: '#22C55E' }
              ].map(item => {
                // 获取今日基础运势分数
                const baseScores = {
                  wealth: fortuneData?.wealth_fortune?.score || 88,
                  career: fortuneData?.career_fortune?.score || 85,
                  love: fortuneData?.love_fortune?.score || 78,
                  health: fortuneData?.health_fortune?.score || 80
                };
                
                const baseValue = baseScores[item.key as keyof typeof baseScores];
                const boostedValue = item.value;
                const difference = boostedValue - baseValue;
                const isPositive = difference > 0;
                const isNegative = difference < 0;

                return (
                  <motion.div
                    key={item.key}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    style={{
                      padding: '0.75rem',
                      background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}08 100%)`,
                      borderRadius: designSystem.borderRadius.md,
                      border: `1px solid ${item.color}30`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* 背景光效 */}
                    {isPositive && (
                      <motion.div
                        animate={{ 
                          opacity: [0.2, 0.4, 0.2],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `radial-gradient(circle, ${item.color}20 0%, transparent 70%)`,
                          borderRadius: designSystem.borderRadius.md,
                          pointerEvents: 'none'
                        }}
                      />
                    )}

                    <div style={{ position: 'relative', zIndex: 1 }}>
                      {/* 图标和标签 */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                        <span style={{ 
                          fontSize: '0.8rem',
                          color: designSystem.colors.text.secondary,
                          fontWeight: '500'
                        }}>
                          {item.label}
                        </span>
                      </div>

                      {/* 分数变化展示 */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.3rem'
                      }}>
                        {/* 基础分数 */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}>
                          <span style={{
                            fontSize: '0.85rem',
                            color: designSystem.colors.text.muted,
                            textDecoration: 'line-through',
                            opacity: 0.7
                          }}>
                            {baseValue}
                          </span>
                          
                          {/* 变化箭头 */}
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{
                              fontSize: '0.7rem',
                              color: isPositive ? '#22C55E' : isNegative ? '#EF4444' : '#6B7280'
                            }}
                          >
                            {isPositive ? '↗️' : isNegative ? '↘️' : '➡️'}
                          </motion.span>
                          
                          {/* 变化值 */}
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            color: isPositive ? '#22C55E' : isNegative ? '#EF4444' : '#6B7280'
                          }}>
                            {isPositive ? `+${difference}` : difference === 0 ? '±0' : difference}
                          </span>
                        </div>

                        {/* 加持后分数 */}
                        <motion.span
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                          style={{ 
                            fontSize: '1.1rem',
                            color: item.color,
                            fontWeight: '700',
                            textShadow: `0 0 8px ${item.color}40`
                          }}
                        >
                          {boostedValue}
                        </motion.span>
                      </div>

                      {/* 效果标签 */}
                      <div style={{
                        fontSize: '0.65rem',
                        color: isPositive ? '#22C55E' : isNegative ? '#EF4444' : designSystem.colors.text.muted,
                        fontWeight: '500',
                        textAlign: 'right'
                      }}>
                        {isPositive ? `强化 +${difference}` : isNegative ? `影响 ${difference}` : '保持'}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          )}
        </div>

        {/* 描述 */}
        <p style={{
          fontSize: '0.9rem',
          color: designSystem.colors.text.secondary,
          lineHeight: 1.5,
          margin: isMain ? '1rem 0' : '0.5rem 0 1rem 0'
        }}>
          {outfit.description}
        </p>

        {/* 吉时显示 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem',
          background: `linear-gradient(135deg, ${outfit.mainColor}20 0%, ${outfit.mainColor}10 100%)`,
          borderRadius: designSystem.borderRadius.sm,
          border: `1px solid ${outfit.mainColor}30`
        }}>
          <span style={{ fontSize: '1rem' }}>⏰</span>
          <span style={{ 
            fontSize: '0.85rem',
            color: designSystem.colors.text.accent,
            fontWeight: '600'
          }}>
            最佳穿着时间：{outfit.luckyTime}
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: designSystem.colors.background.primary,
      position: 'relative'
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: designSystem.colors.background.overlay,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* 主容器 */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: isMobile ? '1rem' : '1.5rem',
        paddingBottom: '6rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* 头部问候 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: 'center',
            marginBottom: '2rem',
            padding: isMobile ? '2rem 1.5rem' : '3rem 2rem',
            background: designSystem.colors.background.card,
            backdropFilter: 'blur(20px)',
            borderRadius: designSystem.borderRadius.xl,
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ fontSize: '3rem', marginBottom: '1rem' }}
          >
            {greeting.icon}
          </motion.div>
          
          <h1 style={{
            fontSize: isMobile ? '1.8rem' : '2.2rem',
            fontWeight: '700',
            color: designSystem.colors.text.primary,
            marginBottom: '0.5rem'
          }}>
            {greeting.text}，今日穿衣指南
          </h1>
          
          <p style={{
            fontSize: '1rem',
            color: designSystem.colors.text.secondary,
            marginBottom: '1rem'
          }}>
            专业AI分析 • 基于您的八字运势 • {currentTime.toLocaleDateString()}
          </p>

          {/* API状态提示 */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(255, 165, 0, 0.2)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 165, 0, 0.4)',
                fontSize: '0.85rem',
                color: '#FF8C00',
                marginBottom: '1rem'
              }}
            >
              <span>⚠️</span>
              <span>{apiError}</span>
            </motion.div>
          )}

          {!apiError && aiRecommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'rgba(34, 197, 94, 0.2)',
                borderRadius: '20px',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                fontSize: '0.85rem',
                color: '#22C55E',
                marginBottom: '1rem'
              }}
            >
              <span>🤖</span>
              <span>AI智能推荐已生成</span>
            </motion.div>
          )}

                  {/* 今日运势概览 */}
        {fortuneData && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(255, 215, 0, 0.1)',
            borderRadius: designSystem.borderRadius.md,
            border: '1px solid rgba(255, 215, 0, 0.3)',
            marginBottom: '1rem'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '900',
              color: designSystem.colors.text.accent
            }}>
              {fortuneData.overall_score}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: designSystem.colors.text.primary
              }}>
                运势等级：{fortuneData.overall_level}
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: designSystem.colors.text.secondary
              }}>
                {fortuneData.overall_description}
              </div>
            </div>
          </div>
        )}

        {/* 完整运势详情 */}
        {fortuneData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '1rem'
            }}
          >
            {/* 吉方 */}
            <div style={{
              padding: '1.2rem',
              background: designSystem.colors.background.card,
              backdropFilter: 'blur(20px)',
              borderRadius: designSystem.borderRadius.md,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2rem',
                marginBottom: '0.5rem'
              }}>
                🧭
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: designSystem.colors.text.secondary,
                marginBottom: '0.5rem'
              }}>
                吉方
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: designSystem.colors.text.primary
              }}>
                {fortuneData.lucky_directions?.join(' ') || '西南'}
              </div>
            </div>

            {/* 幸运色 */}
            <div style={{
              padding: '1.2rem',
              background: designSystem.colors.background.card,
              backdropFilter: 'blur(20px)',
              borderRadius: designSystem.borderRadius.md,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2rem',
                marginBottom: '0.5rem'
              }}>
                🎨
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: designSystem.colors.text.secondary,
                marginBottom: '0.5rem'
              }}>
                幸运色
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.3rem',
                flexWrap: 'wrap'
              }}>
                {(fortuneData.lucky_colors || ['金色', '红色']).map((color, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '0.3rem 0.6rem',
                      background: color === '金色' ? '#FFD700' :
                                 color === '红色' ? '#FF6B6B' :
                                 color === '深红色' ? '#8B0000' :
                                 color === '翠绿色' ? '#10B981' : '#CCCCCC',
                      color: color === '金色' ? '#000' : '#FFF',
                      borderRadius: designSystem.borderRadius.sm,
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>

            {/* 幸运数 */}
            <div style={{
              padding: '1.2rem',
              background: designSystem.colors.background.card,
              backdropFilter: 'blur(20px)',
              borderRadius: designSystem.borderRadius.md,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '2rem',
                marginBottom: '0.5rem'
              }}>
                🔢
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: designSystem.colors.text.secondary,
                marginBottom: '0.5rem'
              }}>
                幸运数
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: designSystem.colors.text.accent
              }}>
                {(fortuneData.lucky_numbers || [7, 14, 23, 8]).join(' ')}
              </div>
            </div>
          </motion.div>
        )}

        {/* 四维运势详情 */}
        {fortuneData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ marginBottom: '2rem' }}
          >
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: designSystem.colors.text.primary,
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              ✨ 今日四维运势详情
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '1rem'
            }}>
              {/* 财运 */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                style={{
                  padding: '1.5rem',
                  background: `linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)`,
                  backdropFilter: 'blur(20px)',
                  borderRadius: designSystem.borderRadius.lg,
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    💰
                  </div>
                  <div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: designSystem.colors.text.primary
                    }}>
                      财运
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#FFD700'
                    }}>
                      {fortuneData.wealth_fortune?.score || 88}分
                    </div>
                  </div>
                </div>
                <p style={{
                  fontSize: '0.9rem',
                  color: designSystem.colors.text.secondary,
                  lineHeight: 1.4,
                  margin: '0 0 0.75rem 0'
                }}>
                  {fortuneData.wealth_fortune?.description || '财运旺盛，适合投资和商务洽谈'}
                </p>
                
                {/* 最佳时间段 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(255, 215, 0, 0.2)',
                  borderRadius: designSystem.borderRadius.sm,
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}>
                  <span style={{ fontSize: '0.9rem' }}>⏰</span>
                  <div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: designSystem.colors.text.secondary,
                      marginBottom: '2px'
                    }}>
                      最佳时间
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: '#FFD700'
                    }}>
                      {fortuneData.wealth_fortune?.best_time || '上午9:00-11:00'}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 事业运 */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                style={{
                  padding: '1.5rem',
                  background: `linear-gradient(135deg, rgba(30, 58, 138, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)`,
                  backdropFilter: 'blur(20px)',
                  borderRadius: designSystem.borderRadius.lg,
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    🚀
                  </div>
                  <div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: designSystem.colors.text.primary
                    }}>
                      事业运
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#3B82F6'
                    }}>
                      {fortuneData.career_fortune?.score || 85}分
                    </div>
                  </div>
                </div>
                <p style={{
                  fontSize: '0.9rem',
                  color: designSystem.colors.text.secondary,
                  lineHeight: 1.4,
                  margin: '0 0 0.75rem 0'
                }}>
                  {fortuneData.career_fortune?.description || '事业运势良好，领导力得到认可'}
                </p>
                
                {/* 最佳时间段 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: designSystem.borderRadius.sm,
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <span style={{ fontSize: '0.9rem' }}>⏰</span>
                  <div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: designSystem.colors.text.secondary,
                      marginBottom: '2px'
                    }}>
                      最佳时间
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: '#3B82F6'
                    }}>
                      {fortuneData.career_fortune?.best_time || '上午8:00-10:00'}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 健康运 */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                style={{
                  padding: '1.5rem',
                  background: `linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)`,
                  backdropFilter: 'blur(20px)',
                  borderRadius: designSystem.borderRadius.lg,
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    background: 'linear-gradient(135deg, #10B981, #22C55E)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    🌿
                  </div>
                  <div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: designSystem.colors.text.primary
                    }}>
                      健康运
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#22C55E'
                    }}>
                      {fortuneData.health_fortune?.score || 80}分
                    </div>
                  </div>
                </div>
                <p style={{
                  fontSize: '0.9rem',
                  color: designSystem.colors.text.secondary,
                  lineHeight: 1.4,
                  margin: '0 0 0.75rem 0'
                }}>
                  {fortuneData.health_fortune?.description || '身体状况稳定，注意适度运动'}
                </p>
                
                {/* 最佳时间段 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(34, 197, 94, 0.2)',
                  borderRadius: designSystem.borderRadius.sm,
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                  <span style={{ fontSize: '0.9rem' }}>⏰</span>
                  <div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: designSystem.colors.text.secondary,
                      marginBottom: '2px'
                    }}>
                      最佳时间
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: '#22C55E'
                    }}>
                      {fortuneData.health_fortune?.best_time || '清晨6:00-8:00'}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 感情运 */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                style={{
                  padding: '1.5rem',
                  background: `linear-gradient(135deg, rgba(255, 105, 180, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)`,
                  backdropFilter: 'blur(20px)',
                  borderRadius: designSystem.borderRadius.lg,
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    background: 'linear-gradient(135deg, #FF69B4, #EC4899)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    💕
                  </div>
                  <div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: designSystem.colors.text.primary
                    }}>
                      感情运
                    </div>
                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: '#EC4899'
                    }}>
                      {fortuneData.love_fortune?.score || 78}分
                    </div>
                  </div>
                </div>
                <p style={{
                  fontSize: '0.9rem',
                  color: designSystem.colors.text.secondary,
                  lineHeight: 1.4,
                  margin: '0 0 0.75rem 0'
                }}>
                  {fortuneData.love_fortune?.description || '人际关系和谐，桃花运渐旺'}
                </p>
                
                {/* 最佳时间段 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(236, 72, 153, 0.2)',
                  borderRadius: designSystem.borderRadius.sm,
                  border: '1px solid rgba(236, 72, 153, 0.3)'
                }}>
                  <span style={{ fontSize: '0.9rem' }}>⏰</span>
                  <div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: designSystem.colors.text.secondary,
                      marginBottom: '2px'
                    }}>
                      最佳时间
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: '#EC4899'
                    }}>
                      {fortuneData.love_fortune?.best_time || '下午2:00-4:00'}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* 今日宜忌指导 */}
        {fortuneData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ marginBottom: '2rem' }}
          >
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: designSystem.colors.text.primary,
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              📋 今日宜忌指导
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '1rem'
            }}>
              {/* 宜 */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                style={{
                  padding: '1.5rem',
                  background: `linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)`,
                  backdropFilter: 'blur(20px)',
                  borderRadius: designSystem.borderRadius.lg,
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    background: 'linear-gradient(135deg, #22C55E, #10B981)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    ✅
                  </div>
                  <div>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#22C55E'
                    }}>
                      宜
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: designSystem.colors.text.secondary
                    }}>
                      今日适宜进行
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {(fortuneData.suitable_activities || ['投资理财', '商务洽谈', '签约合作']).map((activity, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(34, 197, 94, 0.2)',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                        borderRadius: designSystem.borderRadius.sm,
                        fontSize: '0.85rem',
                        color: '#22C55E',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: 'rgba(34, 197, 94, 0.3)'
                      }}
                    >
                      {activity}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* 忌 */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                style={{
                  padding: '1.5rem',
                  background: `linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)`,
                  backdropFilter: 'blur(20px)',
                  borderRadius: designSystem.borderRadius.lg,
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    ❌
                  </div>
                  <div>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: '#EF4444'
                    }}>
                      忌
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: designSystem.colors.text.secondary
                    }}>
                      今日不宜进行
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {(fortuneData.unsuitable_activities || ['借贷放款', '争吵冲突', '手术开刀']).map((activity, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: designSystem.borderRadius.sm,
                        fontSize: '0.85rem',
                        color: '#EF4444',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: 'rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      {activity}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
        </motion.div>

        {/* 今日主推穿衣方案 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ marginBottom: '2rem' }}
        >
          <div style={{
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: isMobile ? '1.3rem' : '1.5rem',
              fontWeight: '700',
              color: designSystem.colors.text.primary,
              marginBottom: '0.5rem'
            }}>
              🎯 今日主推穿衣方案
            </h2>
            
            {/* 穿衣加持效果预览 */}
            {selectedOutfit && fortuneData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: `linear-gradient(135deg, ${selectedOutfit.mainColor}20 0%, ${selectedOutfit.mainColor}10 100%)`,
                  borderRadius: '20px',
                  border: `1px solid ${selectedOutfit.mainColor}40`,
                  marginBottom: '0.5rem'
                }}
              >
                <span style={{ fontSize: '1rem' }}>✨</span>
                <span style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: designSystem.colors.text.primary
                }}>
                  AI智能推荐
                </span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {Object.entries(selectedOutfit.fortuneBoost).map(([key, boostedValue]) => {
                    const baseScores = {
                      wealth: fortuneData?.wealth_fortune?.score || 88,
                      career: fortuneData?.career_fortune?.score || 85,
                      love: fortuneData?.love_fortune?.score || 78,
                      health: fortuneData?.health_fortune?.score || 80
                    };
                    
                    const baseValue = baseScores[key as keyof typeof baseScores];
                    const difference = boostedValue - baseValue;
                    
                    if (difference > 0) {
                      const icons = { wealth: '💰', career: '🚀', love: '💕', health: '🌿' };
                      return (
                        <motion.div
                          key={key}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            padding: '0.2rem 0.4rem',
                            background: 'rgba(34, 197, 94, 0.2)',
                            borderRadius: '10px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            color: '#22C55E'
                          }}
                        >
                          <span style={{ fontSize: '0.8rem' }}>{icons[key as keyof typeof icons]}</span>
                          <span>+{difference}</span>
                        </motion.div>
                      );
                    }
                    return null;
                  }).filter(Boolean)}
                </div>
              </motion.div>
            )}
          </div>
          
          {selectedOutfit && renderOutfitCard(selectedOutfit, true)}
        </motion.div>

        {/* 其他穿衣选择 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: '2rem' }}
        >
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: designSystem.colors.text.primary,
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            ✨ {aiRecommendations.length > 0 ? 'AI智能推荐方案' : '其他风格选择'}
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {/* 优先显示AI推荐的方案 */}
            {aiRecommendations.length > 0 ? (
              aiRecommendations
                .filter(outfit => outfit.id !== selectedOutfit?.id)
                .map(outfit => renderOutfitCard(outfit))
            ) : (
              outfitRecommendations
                .filter(outfit => outfit.id !== selectedOutfit?.id)
                .map(outfit => renderOutfitCard(outfit))
            )}
          </div>
          
          {/* AI推荐状态提示 */}
          {aiRecommendations.length > 0 && (
            <div style={{
              textAlign: 'center',
              marginTop: '1rem',
              fontSize: '0.85rem',
              color: designSystem.colors.text.secondary
            }}>
              🤖 以上方案由AI基于您的八字运势智能生成
            </div>
          )}
        </motion.div>

        
      </div>

      {/* 穿衣详情弹窗 */}
      <AnimatePresence>
        {showOutfitDetail && selectedOutfit && (
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
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
            onClick={() => setShowOutfitDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: designSystem.colors.background.card,
                backdropFilter: 'blur(24px)',
                borderRadius: designSystem.borderRadius.xl,
                padding: isMobile ? '1.5rem' : '2rem',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto',
                border: `2px solid ${selectedOutfit.mainColor}40`
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  color: designSystem.colors.text.primary,
                  margin: 0
                }}>
                  {selectedOutfit.theme}
                </h3>
                <button
                  onClick={() => setShowOutfitDetail(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: designSystem.colors.text.secondary,
                    fontSize: '1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* 详细搭配建议 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: designSystem.colors.text.accent,
                  marginBottom: '1rem'
                }}>
                  🎨 详细搭配建议
                </h4>
                
                {selectedOutfit.tips.map((tip, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: designSystem.borderRadius.sm
                    }}
                  >
                    <span style={{ 
                      color: selectedOutfit.mainColor,
                      fontWeight: '600',
                      minWidth: '1.5rem'
                    }}>
                      {index + 1}.
                    </span>
                    <span style={{
                      color: designSystem.colors.text.secondary,
                      fontSize: '0.9rem',
                      lineHeight: 1.5
                    }}>
                      {tip}
                    </span>
                  </div>
                ))}
              </div>

              {/* 推荐材质 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: designSystem.colors.text.accent,
                  marginBottom: '0.75rem'
                }}>
                  🧵 推荐材质
                </h4>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {selectedOutfit.materialsToWear.map((material, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '0.5rem 1rem',
                        background: `${selectedOutfit.mainColor}20`,
                        border: `1px solid ${selectedOutfit.mainColor}40`,
                        borderRadius: designSystem.borderRadius.sm,
                        fontSize: '0.85rem',
                        color: designSystem.colors.text.primary
                      }}
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>

              {/* 避免颜色 */}
              {selectedOutfit.avoidColors && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#ff6b6b',
                    marginBottom: '0.75rem'
                  }}>
                    ⚠️ 今日避免颜色
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {selectedOutfit.avoidColors.map((color, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'rgba(255, 107, 107, 0.2)',
                          border: '1px solid rgba(255, 107, 107, 0.4)',
                          borderRadius: designSystem.borderRadius.sm,
                          fontSize: '0.85rem',
                          color: '#ff6b6b'
                        }}
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TodayHomePageProfessional; 