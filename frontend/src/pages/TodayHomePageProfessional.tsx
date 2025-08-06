import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { outfitAiService, UserProfile } from '../services/outfitAiService';
import { getFormattedWisdom, getUserBehaviorData, updateUserBehaviorData } from '../services/dailyWisdomService';
import { getPersonalizedGreeting, getTimeBasedSpecialGreeting } from '../services/userGreetingService';
import UserOnboardingFlow from '../components/UserOnboardingFlow';

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
  // 新增：配饰灵活调整方案
  timeBasedAccessories: {
    morning: string[];
    afternoon: string[];
    evening: string[];
    night: string[];
  };
  quickAccessoryChanges: {
    wealth: string[];
    career: string[];
    love: string[];
    health: string[];
  };
}

// 时辰配饰推荐接口
interface TimeBasedAccessoryRecommendation {
  time: string;
  mainOutfit: string;
  accessories: {
    item: string;
    reason: string;
    effect: string;
    wearMethod: string;
  }[];
  colorAdjustment?: string;
  quickTip: string;
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
  const [dailyWisdom, setDailyWisdom] = useState<{ text: string; source: string } | null>(null);
  const [currentAccessoryRecommendation, setCurrentAccessoryRecommendation] = useState<TimeBasedAccessoryRecommendation | null>(null);
  const [auspiciousDirections, setAuspiciousDirections] = useState<any>(null);
  const [luckyNumbers, setLuckyNumbers] = useState<number[]>([]);
  const [dailyTaboo, setDailyTaboo] = useState<any>(null);

  // 🎯 用户引导流程状态
  const [userProgress, setUserProgress] = useState({
    completionLevel: 0, // 0, 15, 45, 75, 100
    hasBasicInfo: false,
    hasDetailedInfo: false,
    hasExperiencedPersonalized: false,
    isFirstTimeUser: false,
    visitCount: 0
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'welcome' | 'preview' | 'basic-info' | 'value-demo' | 'detailed-info'>('welcome');

  // 响应式检测
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1024;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🚀 长期解决方案 - 监听数据变更事件
  useEffect(() => {
    // 监听用户资料更新事件
    const handleUserProfileUpdated = (event: any) => {
      console.log('📢 检测到用户资料更新事件:', event.detail);
      reloadUserDataAndFortune();
    };

    // 监听数据恢复事件
    const handleUserDataRestored = () => {
      console.log('📢 检测到数据恢复事件');
      reloadUserDataAndFortune();
    };

    // 监听localStorage变化
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userInfo' || event.key === 'userProfile' || event.key === 'lastUserDataUpdate') {
        console.log('📢 检测到localStorage变化:', event.key);
        reloadUserDataAndFortune();
      }
    };

    // 监听页面可见性变化（从其他标签页回来时）
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📢 页面重新可见，检查数据更新');
        reloadUserDataAndFortune();
      }
    };

    // 监听认证状态变化
    const handleAuthStateChanged = (event: any) => {
      console.log('📢 检测到认证状态变化:', event.detail);
      if (event.detail.type === 'login') {
        reloadUserDataAndFortune();
      }
    };

    // 监听手串激活事件
    const handleBraceletActivated = (event: any) => {
      console.log('📢 检测到手串激活:', event.detail);
      // 手串激活可能影响运势计算
      reloadUserDataAndFortune();
    };

    // 添加事件监听器
    window.addEventListener('userProfileUpdated', handleUserProfileUpdated);
    window.addEventListener('userDataRestored', handleUserDataRestored);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthStateChanged);
    window.addEventListener('braceletActivated', handleBraceletActivated);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 初始化时检查数据同步服务
    if ((window as any).dataSyncService) {
      console.log('🔄 检测到数据同步服务，启用自动同步');
      // 从服务器恢复数据（如果有）
      (window as any).dataSyncService.syncFromServer().then(() => {
        reloadUserDataAndFortune();
      }).catch((error: any) => {
        console.log('数据同步服务暂不可用:', error);
      });
    }

    // 清理函数
    return () => {
      window.removeEventListener('userProfileUpdated', handleUserProfileUpdated);
      window.removeEventListener('userDataRestored', handleUserDataRestored);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthStateChanged);
      window.removeEventListener('braceletActivated', handleBraceletActivated);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 初始化每日智慧
  useEffect(() => {
    try {
      const userBehavior = getUserBehaviorData();
      const wisdom = getFormattedWisdom(userBehavior);
      setDailyWisdom({ text: wisdom.text, source: wisdom.source });
      
      // 更新用户访问行为
      updateUserBehaviorData({});
    } catch (error) {
      console.warn('Failed to load daily wisdom:', error);
      // 提供默认智慧
      setDailyWisdom({
        text: '观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄',
        source: '——《心经》'
      });
    }
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

  // 🎭 东方玄学穿衣推荐体系 - 融合五行、八字、时令
  const outfitRecommendations: OutfitRecommendation[] = [
    {
      id: 'wealth-magnifier',
      theme: '招财进宝·金水相生',
      colors: ['正金黄', '深朱红', '墨玉黑'],
      mainColor: '#DAA520',
      accessory: '黄金配饰',
      style: '富贵雅致',
      fortuneBoost: {
        wealth: 12,
        career: 8,
        love: 6,
        health: 9
      },
      description: '金主财富，红主旺运，黑主稳重。此配色应"金水相生"之理，激发天地财气，引导贵人相助，商机自来',
      tips: [
        '佩戴黄金首饰于右手腕，顺应财运流向',
        '选用丝绸面料，质感贵重，应"富贵如丝"之意',
        '深朱红色腰带或配件，象征"腰缠万贯"',
        '避免银饰，恐金银相冲，削弱财运磁场',
        '墨玉色鞋履，寓意"脚踏实地聚财源"'
      ],
      luckyTime: '巳时(9:00-11:00) 财星当值',
      avoidColors: ['素白', '浅蓝', '灰绿'],
      materialsToWear: ['真丝', '羊绒', '上等皮革', '黄金', '和田玉'],
      energyLevel: 'high',
      timeBasedAccessories: {
        morning: ['黄金手镯', '和田玉吊坠', '深红色丝巾'],
        afternoon: ['黄金项链', '红玛瑙戒指', '金色腰带'],
        evening: ['黄金耳环', '墨玉手串', '金色胸针'],
        night: ['黄金足链', '招财猫摆件', '金色发夹']
      },
      quickAccessoryChanges: {
        wealth: ['黄金手镯(右手)', '和田玉貔貅', '红色钱包'],
        career: ['金色领带夹', '黄金袖扣', '深红色公文包'],
        love: ['玫瑰金项链', '红玛瑙手串', '金红丝巾'],
        health: ['黄金平安扣', '和田玉手镯', '红色护身符']
      }
    },
    {
      id: 'love-harmony',
      theme: '桃花盛开·木火通明',
      colors: ['胭脂粉', '玫瑰金', '象牙白'],
      mainColor: '#E91E63',
      accessory: '粉晶配饰',
      style: '温婉如玉',
      fortuneBoost: {
        wealth: 8,
        career: 6,
        love: 15,
        health: 10
      },
      description: '粉色应心轮，玫瑰金通情愫，象牙白净心田。此搭配顺应"木火通明"，桃花运势自然而来，人缘和谐',
      tips: [
        '胭脂粉色上衣，激活心轮能量，增进异性缘',
        '佩戴粉水晶手串，左手为宜，招桃花助姻缘',
        '玫瑰金耳饰或项链，提升女性柔美气质',
        '象牙白长裙或裤装，象征纯洁真心',
        '避免黑色系，恐压制桃花之气',
        '可用玫瑰或茉莉香水，增加迷人香韵'
      ],
      luckyTime: '未时(13:00-15:00) 桃花最旺',
      avoidColors: ['纯黑', '深灰', '土黄'],
      materialsToWear: ['真丝', '雪纺', '粉水晶', '珍珠', '玫瑰金'],
      energyLevel: 'medium',
      timeBasedAccessories: {
        morning: ['粉水晶手串', '珍珠耳环', '玫瑰金发夹'],
        afternoon: ['粉水晶项链', '玫瑰金手镯', '粉色丝巾'],
        evening: ['珍珠项链', '粉水晶戒指', '玫瑰金胸针'],
        night: ['月光石手串', '粉水晶枕头', '玫瑰金脚链']
      },
      quickAccessoryChanges: {
        wealth: ['粉水晶聚宝盆', '玫瑰金钱包', '粉色财神摆件'],
        career: ['粉水晶印章', '玫瑰金名片夹', '粉色工作包'],
        love: ['粉水晶鸳鸯', '玫瑰金情侣戒', '红豆手串'],
        health: ['粉水晶按摩球', '玫瑰金养生杯', '粉色瑜伽垫']
      }
    },
    {
      id: 'career-power',
      theme: '青云直上·水木相生',
      colors: ['宝石蓝', '银灰', '雪白'],
      mainColor: '#1565C0',
      accessory: '银质印章',
      style: '威严睿智',
      fortuneBoost: {
        wealth: 10,
        career: 15,
        love: 5,
        health: 12
      },
      description: '蓝色应智慧，银色通权威，白色示正直。遵循"水木相生"之道，助长事业运势，官运亨通，贵人提携',
      tips: [
        '宝石蓝正装，象征深邃智慧和冷静决断',
        '银质领带夹或袖扣，增强领导威仪',
        '雪白衬衫，展现正直品格和专业素养',
        '深色皮鞋，寓意"脚踏实地，步步高升"',
        '可佩戴青金石配饰，助开智慧增威望',
        '避免花哨图案，保持简约大方的权威感'
      ],
      luckyTime: '辰时(7:00-9:00) 贵人运最佳',
      avoidColors: ['艳红', '亮黄', '花绿'],
      materialsToWear: ['精纺羊毛', '埃及棉', '真皮', '纯银', '青金石'],
      energyLevel: 'high',
      timeBasedAccessories: {
        morning: ['银质领带夹', '青金石袖扣', '深蓝色领带'],
        afternoon: ['银质笔', '青金石印章', '蓝色公文包'],
        evening: ['银质胸针', '青金石戒指', '深蓝色围巾'],
        night: ['银质眼镜架', '青金石摆件', '蓝色睡衣']
      },
      quickAccessoryChanges: {
        wealth: ['银质钱夹', '青金石貔貅', '蓝色钱包'],
        career: ['银质名片盒', '青金石印章', '深蓝色公文包'],
        love: ['银质情侣戒', '青金石项链', '蓝色丝巾'],
        health: ['银质保温杯', '青金石护身符', '蓝色运动带']
      }
    },
    {
      id: 'health-vitality',
      theme: '生机盎然·木土相和',
      colors: ['翡翠绿', '天空蓝', '乳白色'],
      mainColor: '#4CAF50',
      accessory: '翡翠玉石',
      style: '清新养生',
      fortuneBoost: {
        wealth: 7,
        career: 9,
        love: 11,
        health: 18
      },
      description: '绿色养肝明目，蓝色宁心安神，白色清肺润燥。应"木土相和"养生之理，调和五脏六腑，身心康泰',
      tips: [
        '翡翠绿主色调，与肝胆相应，养护视力和情绪',
        '天空蓝配色，应心经，平复焦虑稳定心神',
        '佩戴翡翠手镯或吊坠，调节身体能量场',
        '选用天然纤维面料，保持肌肤呼吸畅通',
        '乳白色内搭，象征纯净无瑕的健康状态',
        '可搭配薄荷或檀香味道，清心怡神'
      ],
      luckyTime: '卯时(5:00-7:00) 养生最佳',
      avoidColors: ['血红', '枯黄', '死灰'],
      materialsToWear: ['有机棉', '亚麻', '天然翡翠', '白水晶', '檀木'],
      energyLevel: 'medium',
      timeBasedAccessories: {
        morning: ['翡翠手镯', '白水晶项链', '绿色瑜伽带'],
        afternoon: ['翡翠吊坠', '白水晶手串', '蓝色运动巾'],
        evening: ['翡翠戒指', '白水晶耳环', '绿色丝巾'],
        night: ['翡翠枕头', '白水晶摆件', '檀香熏香']
      },
      quickAccessoryChanges: {
        wealth: ['翡翠聚宝盆', '绿幽灵水晶', '绿色钱包'],
        career: ['翡翠印章', '白水晶球', '绿色工作包'],
        love: ['翡翠鸳鸯', '粉绿水晶', '绿色丝带'],
        health: ['翡翠按摩板', '白水晶疗愈石', '檀木手串']
      }
    },
    {
      id: 'wisdom-enlightenment',
      theme: '开智启慧·火土相生',
      colors: ['紫罗兰', '金铜色', '米黄色'],
      mainColor: '#9C27B0',
      accessory: '紫水晶配饰',
      style: '文雅博学',
      fortuneBoost: {
        wealth: 9,
        career: 12,
        love: 8,
        health: 10
      },
      description: '紫色通神明，金铜启智慧，米黄养心境。依循"火土相生"开悟之法，启发灵感，增进学问，文思泉涌',
      tips: [
        '紫罗兰色外套，开启智慧之门，增强直觉力',
        '金铜色腰带或配饰，寓意"点石成金"的智慧',
        '佩戴紫水晶项链，助开天眼通慧根',
        '米黄色长裤或裙装，给人温和博学的印象',
        '可选择书卷型配饰，增添文雅书香气质',
        '避免过于鲜艳跳跃的颜色，保持内敛深沉'
      ],
      luckyTime: '亥时(21:00-23:00) 灵感最佳',
      avoidColors: ['火红', '橙黄', '翠绿'],
      materialsToWear: ['羊毛呢', '丝绒', '紫水晶', '黄铜', '木质配饰'],
      energyLevel: 'medium',
      timeBasedAccessories: {
        morning: ['紫水晶吊坠', '黄铜书签', '紫色发带'],
        afternoon: ['紫水晶手串', '古铜笔', '米黄色围巾'],
        evening: ['紫水晶项链', '黄铜胸针', '紫色丝巾'],
        night: ['紫水晶枕头', '黄铜香炉', '紫色眼罩']
      },
      quickAccessoryChanges: {
        wealth: ['紫水晶聚宝盆', '古铜钱币', '紫色钱包'],
        career: ['紫水晶印章', '黄铜名片夹', '紫色笔袋'],
        love: ['紫水晶玫瑰', '古铜情书盒', '紫色香包'],
        health: ['紫水晶球', '黄铜养生杯', '木质按摩器']
      }
    },
    {
      id: 'protection-stability',
      theme: '护身避邪·土金相生',
      colors: ['大地棕', '古铜金', '象牙白'],
      mainColor: '#795548',
      accessory: '玛瑙配饰',
      style: '稳重安详',
      fortuneBoost: {
        wealth: 10,
        career: 10,
        love: 7,
        health: 16
      },
      description: '棕色接地气，古金辟邪崇，象牙净心神。遵循"土金相生"护身之理，化解小人，避凶趋吉，平安如意',
      tips: [
        '大地棕主色，接引大地正能量，稳固根基',
        '古铜金配饰，具有辟邪护身的传统功效',
        '佩戴红玛瑙手串，增强个人气场防护',
        '象牙白内搭，净化负面能量侵扰',
        '可选择方形或圆形配饰，象征稳定圆满',
        '避免尖锐造型或过于花哨的装饰'
      ],
      luckyTime: '戌时(19:00-21:00) 护身最强',
      avoidColors: ['鲜红', '翠绿', '宝蓝'],
      materialsToWear: ['羊毛', '棉麻', '红玛瑙', '古铜', '象牙色珠饰'],
      energyLevel: 'low',
      timeBasedAccessories: {
        morning: ['红玛瑙手串', '古铜护身符', '棕色腰带'],
        afternoon: ['红玛瑙项链', '古铜印章', '棕色手包'],
        evening: ['红玛瑙戒指', '古铜胸针', '象牙白围巾'],
        night: ['红玛瑙枕头', '古铜香炉', '棕色睡衣']
      },
      quickAccessoryChanges: {
        wealth: ['红玛瑙貔貅', '古铜聚宝盆', '棕色钱包'],
        career: ['红玛瑙印章', '古铜名片盒', '棕色公文包'],
        love: ['红玛瑙心形', '古铜情侣锁', '象牙白丝巾'],
        health: ['红玛瑙护身符', '古铜保健球', '象牙白念珠']
      }
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

  // 🔧 修复用户信息读取 - 集成长期解决方案数据同步
  // 🎯 新增：检查用户完成度和引导需求
  const checkUserProgress = () => {
    try {
      const savedUserInfo = localStorage.getItem('userInfo');
      const visitCountStr = localStorage.getItem('visitCount') || '0';
      const visitCount = parseInt(visitCountStr, 10);
      const hasExperienced = localStorage.getItem('hasExperiencedPersonalized') === 'true';
      
      // 更新访问次数
      localStorage.setItem('visitCount', (visitCount + 1).toString());
      
      let completionLevel = 0;
      let hasBasicInfo = false;
      let hasDetailedInfo = false;
      let isFirstTimeUser = visitCount === 0;
      
      if (savedUserInfo) {
        const userInfo = JSON.parse(savedUserInfo);
        
        // 计算完成度
        if (userInfo.name && userInfo.gender && userInfo.birthYear) {
          completionLevel = 15;
          hasBasicInfo = true;
        }
        
        if (hasBasicInfo && userInfo.birthMonth && userInfo.birthDay) {
          completionLevel = 45;
        }
        
        if (completionLevel >= 45 && userInfo.birthHour !== undefined && userInfo.birthMinute !== undefined) {
          completionLevel = 75;
        }
        
        if (completionLevel >= 75 && userInfo.birthPlace) {
          completionLevel = 100;
          hasDetailedInfo = true;
        }
      }
      
      setUserProgress({
        completionLevel,
        hasBasicInfo,
        hasDetailedInfo,
        hasExperiencedPersonalized: hasExperienced,
        isFirstTimeUser,
        visitCount: visitCount + 1
      });
      
      // 决定是否显示引导流程
      if (isFirstTimeUser || (completionLevel === 0 && visitCount < 3)) {
        setShowOnboarding(true);
        setOnboardingStep('welcome');
      } else if (completionLevel > 0 && completionLevel < 45 && !hasExperienced) {
        setShowOnboarding(true);
        setOnboardingStep('value-demo');
      }
      
      console.log('👤 用户进度检查:', {
        completionLevel,
        hasBasicInfo,
        hasDetailedInfo,
        isFirstTimeUser,
        visitCount: visitCount + 1,
        showOnboarding: isFirstTimeUser || (completionLevel === 0 && visitCount < 3)
      });
      
    } catch (error) {
      console.error('检查用户进度失败:', error);
    }
  };

  const getUserProfile = (): UserProfile | null => {
    try {
      // 🎯 优先从统一的userInfo读取（与ProfilePage同步）
      const savedUserInfo = localStorage.getItem('userInfo');
      if (savedUserInfo) {
        const userInfo = JSON.parse(savedUserInfo);
        console.log('📊 从userInfo读取用户数据:', userInfo);
        
        return {
          birthdate: userInfo.birthdate || (userInfo.birthYear ? 
            `${userInfo.birthYear}-${userInfo.birthMonth?.toString().padStart(2, '0') || '01'}-${userInfo.birthDay?.toString().padStart(2, '0') || '01'}` : 
            "1990-05-15") + (userInfo.birthHour !== undefined && userInfo.birthMinute !== undefined ? 
            `T${userInfo.birthHour.toString().padStart(2, '0')}:${userInfo.birthMinute.toString().padStart(2, '0')}:00` : 
            "T08:30:00"),
          name: userInfo.name || "游客用户",
          gender: userInfo.gender || "male",
          birth_place: userInfo.birthPlace ? 
            `${userInfo.birthPlace.province || ''}${userInfo.birthPlace.city || ''}${userInfo.birthPlace.district || ''}` : 
            undefined
        };
      }

      // Fallback: 从userProfile读取（ProfilePage格式）
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        console.log('📁 从userProfile读取用户数据:', profile);
        
        return {
          birthdate: profile.birthday + (profile.birthTime ? `T${profile.birthTime}:00` : "T08:30:00"),
          name: profile.realName || profile.username || "游客用户",
          gender: profile.gender || "male",
          birth_place: profile.location
        };
      }

      // Fallback: 从旧版数据源读取
      const savedUser = localStorage.getItem('user_profile');
      if (savedUser) {
        const userInfo = JSON.parse(savedUser);
        console.log('📜 从user_profile读取用户数据:', userInfo);
        
        return {
          birthdate: userInfo.birthdate || userInfo.birth_info?.date_time || "1990-05-15T08:30:00",
          name: userInfo.name || userInfo.birth_info?.name || "游客用户",
          gender: userInfo.gender || "male",
          birth_place: userInfo.birth_place || userInfo.birth_info?.place
        };
      }

      // 最后尝试从birth_info读取
      const birthInfo = localStorage.getItem('birth_info');
      if (birthInfo) {
        const info = JSON.parse(birthInfo);
        console.log('🗂️ 从birth_info读取用户数据:', info);
        
        return {
          birthdate: info.date_time || "1990-05-15T08:30:00",
          name: info.name || "游客用户",
          gender: info.gender || "male",
          birth_place: info.place
        };
      }

      console.log('⚠️ 未找到任何用户数据');
      return null;
    } catch (error) {
      console.error('❌ 获取用户信息失败:', error);
      return null;
    }
  };

  // 🧭 世界级东方玄学吉位计算系统
  const getUserAuspiciousDirections = async (): Promise<any> => {
    try {
      const userProfile = getUserProfile();
      if (!userProfile) {
        console.log('⚠️ 无用户资料，使用默认吉位');
        return {
          best_direction: {
            direction: '正东',
            degrees: 90,
            element: 'wood',
            bagua: '震',
            star_number: 1,
            energy_level: 'good',
            fortune_score: 75,
            suitable_activities: ['工作学习', '重要决策'],
            time_period: '卯时(5-7点)',
            description: '正东方位，震卦主动，利于新的开始'
          },
          good_directions: [],
          avoid_directions: [],
          daily_summary: '今日建议面向正东方位进行重要活动'
        };
      }

      // 检查24小时缓存
      const cacheKey = `auspicious-directions-${userProfile.birthdate}-${new Date().toDateString()}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          if (Date.now() - cachedData.timestamp < 24 * 60 * 60 * 1000) {
            console.log('🧭 使用缓存的吉位数据:', cachedData.data.best_direction.direction);
            return cachedData.data;
          }
        } catch (error) {
          console.error('❌ 吉位缓存数据解析失败:', error);
        }
      }

      // 调用后端吉位计算API
      console.log('🌐 调用后端吉位计算API...');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/calculate-auspicious-directions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthdate: userProfile.birthdate,
          name: userProfile.name,
          gender: userProfile.gender,
          target_date: new Date().toISOString().split('T')[0]
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log('✅ 后端吉位计算成功:', result.data.best_direction.direction);
          
          // 缓存结果24小时
          localStorage.setItem(cacheKey, JSON.stringify({
            data: result.data,
            timestamp: Date.now()
          }));
          
          return result.data;
        } else {
          console.error('❌ 后端吉位API返回错误:', result.error);
        }
      } else {
        console.error('❌ 后端吉位API请求失败:', response.status);
      }
    } catch (error) {
      console.error('❌ 吉位计算失败:', error);
    }

    // 兜底数据
    return {
      best_direction: {
        direction: '正东',
        degrees: 90,
        element: 'wood',
        bagua: '震',
        star_number: 1,
        energy_level: 'good',
        fortune_score: 75,
        suitable_activities: ['工作学习', '重要决策'],
        time_period: '卯时(5-7点)',
        description: '正东方位，震卦主动，利于新的开始'
      },
      good_directions: [],
      avoid_directions: [],
      daily_summary: '今日建议面向正东方位进行重要活动'
    };
  };

  // 🗓️ 世界级个人化今日宜忌计算系统
  const getDailyTaboo = async (): Promise<any> => {
    try {
      const userProfile = getUserProfile();
      if (!userProfile) {
        console.log('⚠️ 无用户资料，使用默认宜忌');
        return {
          general_fortune: '今日运势平稳',
          suitable_activities: [
            { activity: '祈福', category: '精神信仰', suitability: 'good', reason: '今日适宜祈福', best_time: '午时' },
            { activity: '学习', category: '学习成长', suitability: 'good', reason: '今日适宜学习', best_time: '卯时' }
          ],
          unsuitable_activities: [
            { activity: '开市', category: '财务理财', suitability: 'poor', reason: '今日不宜开市', best_time: '避免' }
          ],
          excellent_activities: [],
          forbidden_activities: []
        };
      }

      // 检查24小时缓存
      const today = new Date().toDateString();
      const cacheKey = `daily-taboo-${userProfile.birthdate}-${today}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          if (Date.now() - cachedData.timestamp < 24 * 60 * 60 * 1000) {
            console.log('🗓️ 使用缓存的今日宜忌:', cachedData.data.general_fortune);
            return cachedData.data;
          }
        } catch (error) {
          console.error('❌ 今日宜忌缓存数据解析失败:', error);
        }
      }

      // 调用后端今日宜忌计算API
      console.log('🌐 调用后端今日宜忌计算API...');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/calculate-daily-taboo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthdate: userProfile.birthdate,
          name: userProfile.name,
          gender: userProfile.gender,
          target_date: new Date().toISOString().split('T')[0]
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log('✅ 后端今日宜忌计算成功:', result.data.general_fortune);
          
          // 缓存结果24小时
          localStorage.setItem(cacheKey, JSON.stringify({
            data: result.data,
            timestamp: Date.now()
          }));
          
          return result.data;
        } else {
          console.error('❌ 后端今日宜忌API返回错误:', result.error);
        }
      } else {
        console.error('❌ 后端今日宜忌API请求失败:', response.status);
      }
    } catch (error) {
      console.error('❌ 今日宜忌计算失败:', error);
    }

    // 兜底数据
    console.log('🗓️ 使用默认今日宜忌');
    return {
      general_fortune: '今日运势平稳',
      suitable_activities: [
        { activity: '祈福', category: '精神信仰', suitability: 'good', reason: '今日适宜祈福', best_time: '午时' },
        { activity: '学习', category: '学习成长', suitability: 'good', reason: '今日适宜学习', best_time: '卯时' }
      ],
      unsuitable_activities: [
        { activity: '开市', category: '财务理财', suitability: 'poor', reason: '今日不宜开市', best_time: '避免' }
      ],
      excellent_activities: [],
      forbidden_activities: []
    };
  };

  // 🔢 世界级东方玄学幸运数字计算系统
  const getUserLuckyNumbers = async (): Promise<number[]> => {
    try {
      const userProfile = getUserProfile();
      if (!userProfile) {
        console.log('⚠️ 无用户资料，使用默认幸运数字');
        return [1, 6, 8];
      }

      // 检查24小时缓存
      const cacheKey = `lucky-numbers-${userProfile.birthdate}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          if (Date.now() - cachedData.timestamp < 24 * 60 * 60 * 1000) {
            console.log('🔢 使用缓存的幸运数字:', cachedData.numbers);
            return cachedData.numbers;
          }
        } catch (error) {
          console.error('❌ 幸运数字缓存数据解析失败:', error);
        }
      }

      // 调用后端幸运数字计算API
      console.log('🌐 调用后端幸运数字计算API...');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/calculate-lucky-numbers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthdate: userProfile.birthdate,
          name: userProfile.name,
          gender: userProfile.gender
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log('✅ 后端幸运数字计算成功:', result.data.primary_numbers);
          
          // 缓存结果24小时
          localStorage.setItem(cacheKey, JSON.stringify({
            numbers: result.data.primary_numbers,
            analysis: result.data,
            timestamp: Date.now()
          }));
          
          return result.data.primary_numbers;
        } else {
          console.error('❌ 后端幸运数字API返回错误:', result.error);
        }
      } else {
        console.error('❌ 后端幸运数字API请求失败:', response.status);
      }
    } catch (error) {
      console.error('❌ 幸运数字计算失败:', error);
    }

    // 兜底数据
    console.log('🔢 使用默认幸运数字: [1, 6, 8]');
    return [1, 6, 8];
  };

  // 🎯 世界级后端八字用神幸运色计算系统
  const getUserLuckyColors = async (): Promise<string[]> => {
    try {
      // 1. 优先从手动设置读取
      const savedUserInfo = localStorage.getItem('userInfo');
      if (savedUserInfo) {
        const userInfo = JSON.parse(savedUserInfo);
        if (userInfo.luckyColors && Array.isArray(userInfo.luckyColors) && userInfo.luckyColors.length > 0) {
          console.log('🎨 从userInfo读取手动设置幸运色:', userInfo.luckyColors);
          return userInfo.luckyColors;
        }
      }

      // 2. 从userProfile读取
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        if (profile.luckyColors && Array.isArray(profile.luckyColors) && profile.luckyColors.length > 0) {
          console.log('🎨 从userProfile读取手动设置幸运色:', profile.luckyColors);
          return profile.luckyColors;
        }
      }
      
      // 3. 🆕 调用后端幸运色计算API
      const userProfile = getUserProfile();
      if (userProfile) {
        try {
          console.log('🌐 调用后端幸运色计算API...');
          
          // 检查24小时缓存
          const cacheKey = `backend-lucky-colors-${userProfile.birthdate}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const cachedData = JSON.parse(cached);
              if (Date.now() - cachedData.timestamp < 24 * 60 * 60 * 1000) {
                console.log('🎨 使用缓存的后端幸运色:', cachedData.colors);
                return cachedData.colors;
              }
            } catch (error) {
              console.error('❌ 缓存数据解析失败:', error);
            }
          }
          
          // 调用后端API
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
          const response = await fetch(`${API_BASE_URL}/calculate-lucky-colors`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              birthdate: userProfile.birthdate,
              name: userProfile.name,
              gender: userProfile.gender
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              console.log('✅ 后端幸运色计算成功:', result.data);
              
              // 缓存结果24小时
              localStorage.setItem(cacheKey, JSON.stringify({
                colors: result.data.primary_colors,
                analysis: result.data,
                timestamp: Date.now()
              }));
              
              return result.data.primary_colors;
            } else {
              console.error('❌ 后端API返回错误:', result.error);
            }
          } else {
            console.error('❌ 后端API请求失败:', response.status);
          }
        } catch (error) {
          console.error('❌ 后端幸运色API调用失败:', error);
        }
      }
      
      // 4. 🔄 降级：检查前端算法缓存
      const userProfileForCache = getUserProfile();
      if (userProfileForCache) {
        const frontendCacheKey = `bazi-lucky-colors-${userProfileForCache.birthdate}`;
        const cached = localStorage.getItem(frontendCacheKey);
        if (cached) {
          try {
            const cachedData = JSON.parse(cached);
            // 缓存7天有效
            if (Date.now() - cachedData.timestamp < 7 * 24 * 60 * 60 * 1000) {
              console.log('🎨 使用前端算法缓存的幸运色:', cachedData.colors);
              return cachedData.colors;
            }
          } catch (error) {
            console.error('❌ 缓存数据解析失败:', error);
          }
        }
      }
      
      // 5. 🆘 后端API失败，直接使用默认值
      console.log('🔄 后端API不可用，使用默认幸运色');
      
      // 6. 🆘 默认幸运色兜底
      console.log('🎨 使用默认幸运色: [金色]');
      return ['金色'];
    } catch (error) {
      console.error('❌ 读取用户幸运色失败:', error);
      return ['金色'];
    }
  };

  // 🚀 长期解决方案 - 重新加载用户数据和运势 (异步版本)
  const reloadUserDataAndFortune = async () => {
    console.log('🔄 重新加载用户数据和运势...');
    const user = getUserProfile();
    
    // 🆕 并行获取幸运色、吉位、幸运数字和今日宜忌数据
    const [userLuckyColors, userDirections, userNumbers, userTaboo] = await Promise.all([
      getUserLuckyColors(),
      getUserAuspiciousDirections(),
      getUserLuckyNumbers(),
      getDailyTaboo()
    ]);
    
    // 设置吉位、幸运数字和今日宜忌数据
    setAuspiciousDirections(userDirections);
    setLuckyNumbers(userNumbers);
    setDailyTaboo(userTaboo);
    console.log('🧭 更新吉位数据:', userDirections?.best_direction?.direction);
    console.log('🔢 更新幸运数字:', userNumbers);
    console.log('🗓️ 更新今日宜忌:', userTaboo?.general_fortune);
    
    if (user) {
      console.log('✅ 检测到用户数据变更，重新计算运势');
      // 🌈 将用户幸运色、吉位和幸运数字合并到运势数据中
      const enhancedMockData = {
        ...mockFortuneData,
        lucky_colors: userLuckyColors,
        lucky_directions: userDirections?.best_direction 
          ? [userDirections.best_direction.direction] 
          : mockFortuneData.lucky_directions,
        lucky_numbers: userNumbers
      };
      console.log('🎨 使用用户个性化幸运色:', userLuckyColors);
      console.log('🧭 使用用户个性化吉位:', userDirections?.best_direction?.direction);
      console.log('🔢 使用用户个性化幸运数字:', userNumbers);
      setFortuneData(enhancedMockData);
      
      // 重新加载运势数据
      loadRealFortuneData();
    } else {
      console.log('⚠️ 未找到用户数据，显示默认内容');
      // 🌈 即使是默认内容也使用用户的幸运色、吉位和幸运数字
      const enhancedMockData = {
        ...mockFortuneData,
        lucky_colors: userLuckyColors,
        lucky_directions: userDirections?.best_direction 
          ? [userDirections.best_direction.direction] 
          : mockFortuneData.lucky_directions,
        lucky_numbers: userNumbers
      };
      setFortuneData(enhancedMockData);
      const recommendedOutfit = getRecommendedOutfit();
      setSelectedOutfit(recommendedOutfit);
      
      // 🆕 更新配饰推荐
      if (recommendedOutfit) {
        const currentHour = currentTime.getHours();
        const accessoryRec = getAccessoryRecommendation(recommendedOutfit, currentHour, 'wealth');
        setCurrentAccessoryRecommendation(accessoryRec);
      }
    }
  };

  // 🎯 获取当前主导运势类型
  const getDominantFortuneType = (): 'wealth' | 'career' | 'love' | 'health' => {
    if (!fortuneData) return 'wealth';
    
    const scores = {
      wealth: fortuneData.wealth_fortune.score,
      career: fortuneData.career_fortune.score,
      love: fortuneData.love_fortune.score,
      health: fortuneData.health_fortune.score
    };
    
    return Object.entries(scores).reduce((a, b) => scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b)[0] as keyof typeof scores;
  };

  // 🎯 引导流程事件处理
  const handleOnboardingStepChange = (step: string) => {
    setOnboardingStep(step as any);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // 重新检查用户进度
    checkUserProgress();
    // 重新加载运势数据
    reloadUserDataAndFortune();
  };

  // 获取时间问候
  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 23 || hour < 1) return { text: '子时安好', icon: '🌙', desc: '夜深人静，宜修身养性' };
    if (hour >= 1 && hour < 3) return { text: '丑时安宁', icon: '🌙', desc: '万籁俱寂，宜静心修行' };
    if (hour >= 3 && hour < 5) return { text: '寅时吉祥', icon: '🌅', desc: '晨光初现，万物复苏' };
    if (hour >= 5 && hour < 7) return { text: '卯时如意', icon: '🌅', desc: '旭日东升，生机勃发' };
    if (hour >= 7 && hour < 9) return { text: '辰时如意', icon: '☀️', desc: '旭日东升，事业启程' };
    if (hour >= 9 && hour < 11) return { text: '巳时顺遂', icon: '☀️', desc: '日上三竿，宜主动出击' };
    if (hour >= 11 && hour < 13) return { text: '午时安康', icon: '🌞', desc: '日正当中，心静自然凉' };
    if (hour >= 13 && hour < 15) return { text: '未时祥和', icon: '🌞', desc: '午后时光，宜修身养性' };
    if (hour >= 15 && hour < 17) return { text: '申时顺遂', icon: '🌤️', desc: '夕阳西下，收获满满' };
    if (hour >= 17 && hour < 19) return { text: '酉时如意', icon: '🌤️', desc: '日落西山，宜总结收获' };
    if (hour >= 19 && hour < 21) return { text: '戌时祥和', icon: '🌆', desc: '华灯初上，家人团聚' };
    if (hour >= 21 && hour < 23) return { text: '亥时安宁', icon: '🌙', desc: '夜深人静，宜静心修行' };
    return { text: '子时安好', icon: '🌙', desc: '夜深人静，宜修身养性' };
  };

  // 🎭 东方玄学智能穿衣推荐算法 - 融合幸运色与运势分析
  const getRecommendedOutfit = () => {
    if (!fortuneData) return outfitRecommendations[0];
    
    const userProfile = getUserProfile();
    const currentHour = currentTime.getHours();
    const currentMonth = currentTime.getMonth() + 1;
    
    // 🌈 建立幸运色与outfit的映射关系
    const colorToOutfitMap: Record<string, string[]> = {
      '金色': ['wealth-magnifier'], // 招财进宝·金水相生 - 主色金黄
      '黄色': ['wealth-magnifier'],
      '金黄': ['wealth-magnifier'],
      '正金黄': ['wealth-magnifier'],
      
      '深红色': ['love-harmony', 'wealth-magnifier'], // 桃花盛开有胭脂粉，招财进宝有深朱红
      '红色': ['love-harmony'],
      '胭脂粉': ['love-harmony'],
      '粉色': ['love-harmony'],
      
      '蓝色': ['career-power'], // 青云直上·水木相生 - 主色宝石蓝
      '宝石蓝': ['career-power'],
      '深蓝': ['career-power'],
      
      '绿色': ['health-vitality'], // 生机盎然·木土相和 - 主色翡翠绿
      '翡翠绿': ['health-vitality'],
      '青色': ['health-vitality'],
      
      '紫色': ['wisdom-enlightenment'], // 开智启慧·火土相生 - 主色紫罗兰
      '紫罗兰': ['wisdom-enlightenment'],
      
      '棕色': ['protection-stability'], // 护身避邪·土金相生 - 主色大地棕
      '大地棕': ['protection-stability'],
      '咖啡色': ['protection-stability'],
      
      '白色': ['career-power', 'health-vitality'], // 白色在多个搭配中作为辅助色
      '银色': ['career-power'],
      '象牙白': ['protection-stability', 'love-harmony']
    };

    // 🎯 优先根据用户幸运色匹配outfit
    if (fortuneData.lucky_colors && fortuneData.lucky_colors.length > 0) {
      console.log('🌈 用户幸运色:', fortuneData.lucky_colors);
      
      for (const luckyColor of fortuneData.lucky_colors) {
        const matchingOutfitIds = colorToOutfitMap[luckyColor];
        if (matchingOutfitIds && matchingOutfitIds.length > 0) {
          // 在匹配的outfit中选择最适合当前运势的
          for (const outfitId of matchingOutfitIds) {
            const outfit = outfitRecommendations.find(o => o.id === outfitId);
            if (outfit) {
              console.log(`✨ 根据幸运色"${luckyColor}"推荐: ${outfit.theme}`);
              return outfit;
            }
          }
        }
      }
    }

    // 🔄 如果没有匹配的幸运色outfit，则使用原有的运势分析逻辑作为后备
    console.log('🎲 使用运势分析推荐作为后备方案');
    
    const { wealth_fortune, career_fortune, love_fortune, health_fortune } = fortuneData;
    
    // 计算各类运势的权重和时辰影响
    const fortuneWeights = {
      wealth: wealth_fortune.score * getTimeMultiplier('wealth', currentHour),
      career: career_fortune.score * getTimeMultiplier('career', currentHour),
      love: love_fortune.score * getTimeMultiplier('love', currentHour),
      health: health_fortune.score * getTimeMultiplier('health', currentHour)
    };
    
    // 考虑季节因素的五行相应
    const seasonalBonus = getSeasonalBonus(currentMonth);
    
    // 找出当前最需要强化的运势
    const dominantFortune = Object.entries(fortuneWeights).reduce((a, b) => 
      fortuneWeights[a[0] as keyof typeof fortuneWeights] > fortuneWeights[b[0] as keyof typeof fortuneWeights] ? a : b
    )[0] as keyof typeof fortuneWeights;
    
    console.log(`🎯 主导运势: ${dominantFortune}, 权重: ${fortuneWeights[dominantFortune]}`);
    
    // 根据主导运势选择对应搭配
    switch (dominantFortune) {
      case 'wealth':
        return outfitRecommendations.find(o => o.id === 'wealth-magnifier') || outfitRecommendations[0];
      case 'career':
        return outfitRecommendations.find(o => o.id === 'career-power') || outfitRecommendations[2];
      case 'love':
      return outfitRecommendations.find(o => o.id === 'love-harmony') || outfitRecommendations[1];
      case 'health':
        return outfitRecommendations.find(o => o.id === 'health-vitality') || outfitRecommendations[3];
      default:
        // 根据运势总分选择平衡型搭配
        if (fortuneData.overall_score >= 90) {
          return outfitRecommendations.find(o => o.id === 'wisdom-enlightenment') || outfitRecommendations[4];
        } else if (fortuneData.overall_score < 70) {
          return outfitRecommendations.find(o => o.id === 'protection-stability') || outfitRecommendations[5];
        }
        return outfitRecommendations[0];
    }
  };

  // 🕐 时辰运势加权算法
  const getTimeMultiplier = (fortuneType: string, hour: number): number => {
    const timeFortuneMap: Record<string, number> = {
      // 子时(23-1): 水旺，利财运
      wealth: hour >= 23 || hour < 1 ? 1.3 : 
              // 巳时(9-11): 火旺，利财运
              (hour >= 9 && hour < 11) ? 1.4 : 1.0,
      
      // 辰时(7-9): 土旺，利事业
      career: (hour >= 7 && hour < 9) ? 1.4 : 
              // 申时(15-17): 金旺，利权威
              (hour >= 15 && hour < 17) ? 1.3 : 1.0,
      
      // 未时(13-15): 土旺，利感情
      love: (hour >= 13 && hour < 15) ? 1.4 : 
            // 亥时(21-23): 水旺，利桃花
            (hour >= 21 && hour < 23) ? 1.3 : 1.0,
      
      // 卯时(5-7): 木旺，利健康
      health: (hour >= 5 && hour < 7) ? 1.4 : 
              // 酉时(17-19): 金旺，利养生
              (hour >= 17 && hour < 19) ? 1.3 : 1.0
    };
    
    return timeFortuneMap[fortuneType] || 1.0;
  };

  // 🌸 季节五行加成算法
  const getSeasonalBonus = (month: number): Record<string, number> => {
    // 春季(3-5月): 木旺，利健康和事业
    if (month >= 3 && month <= 5) {
      return { health: 1.2, career: 1.1, wealth: 1.0, love: 1.0 };
    }
    // 夏季(6-8月): 火旺，利财运和感情
    else if (month >= 6 && month <= 8) {
      return { wealth: 1.2, love: 1.1, health: 1.0, career: 1.0 };
    }
    // 秋季(9-11月): 金旺，利事业和财运
    else if (month >= 9 && month <= 11) {
      return { career: 1.2, wealth: 1.1, health: 1.0, love: 1.0 };
    }
    // 冬季(12-2月): 水旺，利健康和智慧
    else {
      return { health: 1.2, career: 1.0, wealth: 1.0, love: 1.1 };
    }
  };

  // 💍 智能配饰推荐算法 - 根据时辰和场景灵活调整
  const getAccessoryRecommendation = (
    outfit: OutfitRecommendation, 
    currentHour: number, 
    priority: 'wealth' | 'career' | 'love' | 'health' = 'wealth'
  ): TimeBasedAccessoryRecommendation => {
    // 确定时间段
    let timePeriod: 'morning' | 'afternoon' | 'evening' | 'night';
    let timeDescription: string;
    
    if (currentHour >= 5 && currentHour < 12) {
      timePeriod = 'morning';
      timeDescription = `${getChineseHour(currentHour)} - 晨起正气`;
    } else if (currentHour >= 12 && currentHour < 17) {
      timePeriod = 'afternoon'; 
      timeDescription = `${getChineseHour(currentHour)} - 午间旺盛`;
    } else if (currentHour >= 17 && currentHour < 21) {
      timePeriod = 'evening';
      timeDescription = `${getChineseHour(currentHour)} - 暮色温和`;
    } else {
      timePeriod = 'night';
      timeDescription = `${getChineseHour(currentHour)} - 夜深静谧`;
    }

    // 获取基础配饰和优先运势配饰
    const baseAccessories = outfit.timeBasedAccessories[timePeriod];
    const priorityAccessories = outfit.quickAccessoryChanges[priority];

    // 合并推荐配饰，优先级配饰放在前面
    const recommendedAccessories = [
      {
        item: priorityAccessories[0],
        reason: `强化${getPriorityName(priority)}运势`,
        effect: `提升${getPriorityName(priority)}能量场`,
        wearMethod: getWearMethod(priorityAccessories[0])
      },
      {
        item: baseAccessories[0],
        reason: `应${timeDescription}之气`,
        effect: `调和时辰能量`,
        wearMethod: getWearMethod(baseAccessories[0])
      },
      {
        item: baseAccessories[1] || priorityAccessories[1],
        reason: `平衡整体运势`,
        effect: `稳定能量磁场`,
        wearMethod: getWearMethod(baseAccessories[1] || priorityAccessories[1])
      }
    ];

    return {
      time: timeDescription,
      mainOutfit: outfit.theme,
      accessories: recommendedAccessories,
      colorAdjustment: getColorAdjustment(timePeriod, priority),
      quickTip: getQuickTip(timePeriod, priority, outfit.id)
    };
  };

  // 🕐 获取中文时辰名称
  const getChineseHour = (hour: number): string => {
    if (hour >= 23 || hour < 1) return '子时';
    if (hour >= 1 && hour < 3) return '丑时';
    if (hour >= 3 && hour < 5) return '寅时';
    if (hour >= 5 && hour < 7) return '卯时';
    if (hour >= 7 && hour < 9) return '辰时';
    if (hour >= 9 && hour < 11) return '巳时';
    if (hour >= 11 && hour < 13) return '午时';
    if (hour >= 13 && hour < 15) return '未时';
    if (hour >= 15 && hour < 17) return '申时';
    if (hour >= 17 && hour < 19) return '酉时';
    if (hour >= 19 && hour < 21) return '戌时';
    return '亥时';
  };

  // 📝 获取运势中文名称
  const getPriorityName = (priority: string): string => {
    const names = { wealth: '财运', career: '事业', love: '感情', health: '健康' };
    return names[priority as keyof typeof names] || '运势';
  };

  // 👗 获取佩戴方法建议
  const getWearMethod = (accessory: string): string => {
    if (accessory.includes('手镯') || accessory.includes('手串')) return '佩戴于左手手腕，贴近心脏';
    if (accessory.includes('项链') || accessory.includes('吊坠')) return '贴身佩戴，位于心轮位置';
    if (accessory.includes('戒指')) return '佩戴于无名指，象征承诺';
    if (accessory.includes('耳环')) return '双耳佩戴，平衡左右能量';
    if (accessory.includes('腰带')) return '系于腰间，聚财纳气';
    if (accessory.includes('丝巾')) return '颈部或手腕，增添雅致';
    return '根据个人喜好自然佩戴';
  };

  // 🎨 获取颜色调整建议
  const getColorAdjustment = (timePeriod: string, priority: string): string => {
    const adjustments = {
      morning: { 
        wealth: '金色亮度可稍微调高，增强朝气',
        career: '蓝色深度可适中，展现稳重',
        love: '粉色柔和度增强，温暖如晨光',
        health: '绿色清新度提升，生机勃勃'
      },
      afternoon: {
        wealth: '金色保持饱满，应阳光充沛',
        career: '蓝色稍显深沉，突出专业',
        love: '粉色略显浓郁，热情如午日',
        health: '绿色维持清雅，平衡午热'
      },
      evening: {
        wealth: '金色柔和收敛，如夕阳温润',
        career: '蓝色深邃神秘，权威内敛',
        love: '粉色温暖迷人，如晚霞柔美',
        health: '绿色宁静安详，晚风习习'
      },
      night: {
        wealth: '金色低调内敛，暗香浮动',
        career: '蓝色深如夜空，智慧深邃',
        love: '粉色朦胧浪漫，月下情怀',
        health: '绿色清雅如梦，夜静心安'
      }
    };
    
    return adjustments[timePeriod as keyof typeof adjustments][priority as keyof typeof adjustments.morning] || '保持搭配的自然和谐';
  };

  // 💡 获取快速贴士
  const getQuickTip = (timePeriod: string, priority: string, outfitId: string): string => {
    const tips = {
      morning: '晨起换上主要配饰，为一天打好运势基础',
      afternoon: '午间可增加一件重点配饰，强化下午的重要活动',
      evening: '傍晚适当调整配饰颜色深浅，应时而变',
      night: '夜晚佩戴温和配饰，助眠安神同时积蓄能量'
    };
    
    return tips[timePeriod as keyof typeof tips] || '保持内心平和，配饰自然发挥作用';
  };

  // 🎨 为AI推荐生成默认时辰配饰方案
  const getDefaultTimeBasedAccessories = (mainColor: string) => {
    // 根据主色调判断配饰类型
    const isGold = mainColor.includes('金') || mainColor.includes('黄') || mainColor.includes('#D');
    const isPink = mainColor.includes('粉') || mainColor.includes('红') || mainColor.includes('#E9');
    const isBlue = mainColor.includes('蓝') || mainColor.includes('#1');
    const isGreen = mainColor.includes('绿') || mainColor.includes('#4');
    const isPurple = mainColor.includes('紫') || mainColor.includes('#9');
    
    if (isGold) {
      return {
        morning: ['黄金手镯', '和田玉吊坠', '深红色丝巾'],
        afternoon: ['黄金项链', '红玛瑙戒指', '金色腰带'],
        evening: ['黄金耳环', '墨玉手串', '金色胸针'],
        night: ['黄金足链', '招财猫摆件', '金色发夹']
      };
    } else if (isPink) {
      return {
        morning: ['粉水晶手串', '珍珠耳环', '玫瑰金发夹'],
        afternoon: ['粉水晶项链', '玫瑰金手镯', '粉色丝巾'],
        evening: ['珍珠项链', '粉水晶戒指', '玫瑰金胸针'],
        night: ['月光石手串', '粉水晶枕头', '玫瑰金脚链']
      };
    } else if (isBlue) {
      return {
        morning: ['银质领带夹', '青金石袖扣', '深蓝色领带'],
        afternoon: ['银质笔', '青金石印章', '蓝色公文包'],
        evening: ['银质胸针', '青金石戒指', '深蓝色围巾'],
        night: ['银质眼镜架', '青金石摆件', '蓝色睡衣']
      };
    } else if (isGreen) {
      return {
        morning: ['翡翠手镯', '白水晶项链', '绿色瑜伽带'],
        afternoon: ['翡翠吊坠', '白水晶手串', '蓝色运动巾'],
        evening: ['翡翠戒指', '白水晶耳环', '绿色丝巾'],
        night: ['翡翠枕头', '白水晶摆件', '檀香熏香']
      };
    } else if (isPurple) {
      return {
        morning: ['紫水晶吊坠', '黄铜书签', '紫色发带'],
        afternoon: ['紫水晶手串', '古铜笔', '米黄色围巾'],
        evening: ['紫水晶项链', '黄铜胸针', '紫色丝巾'],
        night: ['紫水晶枕头', '黄铜香炉', '紫色眼罩']
      };
    } else {
      // 默认棕色系
      return {
        morning: ['红玛瑙手串', '古铜护身符', '棕色腰带'],
        afternoon: ['红玛瑙项链', '古铜印章', '棕色手包'],
        evening: ['红玛瑙戒指', '古铜胸针', '象牙白围巾'],
        night: ['红玛瑙枕头', '古铜香炉', '棕色睡衣']
      };
    }
  };

  // 💎 为AI推荐生成默认快速配饰方案
  const getDefaultQuickAccessories = (mainColor: string) => {
    const isGold = mainColor.includes('金') || mainColor.includes('黄') || mainColor.includes('#D');
    const isPink = mainColor.includes('粉') || mainColor.includes('红') || mainColor.includes('#E9');
    const isBlue = mainColor.includes('蓝') || mainColor.includes('#1');
    const isGreen = mainColor.includes('绿') || mainColor.includes('#4');
    const isPurple = mainColor.includes('紫') || mainColor.includes('#9');
    
    if (isGold) {
      return {
        wealth: ['黄金手镯(右手)', '和田玉貔貅', '红色钱包'],
        career: ['金色领带夹', '黄金袖扣', '深红色公文包'],
        love: ['玫瑰金项链', '红玛瑙手串', '金红丝巾'],
        health: ['黄金平安扣', '和田玉手镯', '红色护身符']
      };
    } else if (isPink) {
      return {
        wealth: ['粉水晶聚宝盆', '玫瑰金钱包', '粉色财神摆件'],
        career: ['粉水晶印章', '玫瑰金名片夹', '粉色工作包'],
        love: ['粉水晶鸳鸯', '玫瑰金情侣戒', '红豆手串'],
        health: ['粉水晶按摩球', '玫瑰金养生杯', '粉色瑜伽垫']
      };
    } else if (isBlue) {
      return {
        wealth: ['银质钱夹', '青金石貔貅', '蓝色钱包'],
        career: ['银质名片盒', '青金石印章', '深蓝色公文包'],
        love: ['银质情侣戒', '青金石项链', '蓝色丝巾'],
        health: ['银质保温杯', '青金石护身符', '蓝色运动带']
      };
    } else if (isGreen) {
      return {
        wealth: ['翡翠聚宝盆', '绿幽灵水晶', '绿色钱包'],
        career: ['翡翠印章', '白水晶球', '绿色工作包'],
        love: ['翡翠鸳鸯', '粉绿水晶', '绿色丝带'],
        health: ['翡翠按摩板', '白水晶疗愈石', '檀木手串']
      };
    } else if (isPurple) {
      return {
        wealth: ['紫水晶聚宝盆', '古铜钱币', '紫色钱包'],
        career: ['紫水晶印章', '黄铜名片夹', '紫色笔袋'],
        love: ['紫水晶玫瑰', '古铜情书盒', '紫色香包'],
        health: ['紫水晶球', '黄铜养生杯', '木质按摩器']
      };
    } else {
      return {
        wealth: ['红玛瑙貔貅', '古铜聚宝盆', '棕色钱包'],
        career: ['红玛瑙印章', '古铜名片盒', '棕色公文包'],
        love: ['红玛瑙心形', '古铜情侣锁', '象牙白丝巾'],
        health: ['红玛瑙护身符', '古铜保健球', '象牙白念珠']
      };
    }
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
        const recommendedOutfit = getRecommendedOutfit();
        setSelectedOutfit(recommendedOutfit);
        
        // 更新配饰推荐
        if (recommendedOutfit) {
          const currentHour = currentTime.getHours();
          const dominantFortune = getDominantFortuneType();
          const accessoryRec = getAccessoryRecommendation(recommendedOutfit, currentHour, dominantFortune);
          setCurrentAccessoryRecommendation(accessoryRec);
        }
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
      const userLuckyColors = await getUserLuckyColors(); // 🌈 获取用户个性化幸运色
      const convertedFortuneData: DailyFortune = {
        overall_score: aiResponse.ai_analysis.daily_fortune.overall_score,
        overall_level: aiResponse.ai_analysis.daily_fortune.overall_score >= 95 ? '紫气东来' : 
                      aiResponse.ai_analysis.daily_fortune.overall_score >= 85 ? '福星高照' :
                      aiResponse.ai_analysis.daily_fortune.overall_score >= 75 ? '吉祥如意' :
                      aiResponse.ai_analysis.daily_fortune.overall_score >= 65 ? '平安喜乐' : '修身养性',
        overall_description: aiResponse.ai_analysis.recommendation_reason,
        lucky_colors: userLuckyColors, // 🌈 使用用户个性化幸运色
        lucky_directions: ['东南', '正南'],
        lucky_numbers: [8, 18, 28],
        suitable_activities: ['投资理财', '商务洽谈', '签约合作', '重要会议'],
        unsuitable_activities: ['借贷放款', '争吵冲突', '手术开刀'],
        wealth_fortune: {
          score: aiResponse.ai_analysis.daily_fortune.wealth_fortune,
          description: '财神眷顾，今日宜投资理财、商务洽谈，古语云："君子爱财，取之有道"',
          best_time: '巳时 (9:00-11:00)'
        },
        career_fortune: {
          score: aiResponse.ai_analysis.daily_fortune.career_fortune,
          description: '贵人相助，事业蒸蒸日上，领导力得到认可，宜把握良机',
          best_time: '辰时 (7:00-9:00)'
        },
        love_fortune: {
          score: aiResponse.ai_analysis.daily_fortune.love_fortune,
          description: '桃花运旺，人际关系和谐，宜主动表达，缘分自来',
          best_time: '未时 (13:00-15:00)'
        },
        health_fortune: {
          score: aiResponse.ai_analysis.daily_fortune.health_fortune,
          description: '身心康泰，宜适度运动，寅时晨练，精神焕发',
          best_time: '寅时 (3:00-5:00)'
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
          energyLevel: rec.confidence > 0.8 ? 'high' : rec.confidence > 0.6 ? 'medium' : 'low' as 'high' | 'medium' | 'low',
          // 🆕 基于AI推荐添加配饰方案 - 使用默认配饰模板
          timeBasedAccessories: getDefaultTimeBasedAccessories(rec.outfit_details.primary_colors?.[0] || '#DAA520'),
          quickAccessoryChanges: getDefaultQuickAccessories(rec.outfit_details.primary_colors?.[0] || '#DAA520')
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

  // 🔥 智能数据管理 - 初始化和实时更新
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // 🆕 初始化默认outfit，确保页面有内容显示
    if (!selectedOutfit && outfitRecommendations.length > 0) {
      const initialOutfit = outfitRecommendations[0]; // 使用第一个作为默认
      setSelectedOutfit(initialOutfit);
      
      // 同时设置配饰推荐
      const currentHour = currentTime.getHours();
      const accessoryRec = getAccessoryRecommendation(initialOutfit, currentHour, 'wealth');
      setCurrentAccessoryRecommendation(accessoryRec);
    }
    
    // 检查用户进度和引导需求
    checkUserProgress();
    
    // 加载真实数据
    loadRealFortuneData();

    // 🎯 监听用户数据更新事件（来自ProfilePage的数据同步）
    const handleUserDataUpdate = (event: any) => {
      console.log('🔄 收到用户数据更新事件:', event.detail);
      console.log('⚡ 重新加载运势数据...');
      
      // 使用新的重新加载函数
      reloadUserDataAndFortune();
    };

    // 添加事件监听器
    window.addEventListener('userProfileUpdated', handleUserDataUpdate);

    // 🔄 监听localStorage变化（其他页面直接修改localStorage的情况）
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userInfo' || event.key === 'userProfile' || event.key === 'lastUserDataUpdate') {
        console.log('💾 检测到localStorage用户数据变化:', event.key);
        console.log('⚡ 重新加载运势数据...');
        
        // 延迟一下确保数据已经完全写入
        setTimeout(() => {
          reloadUserDataAndFortune();
        }, 500);
      }
    };

    // 添加存储变化监听器
    window.addEventListener('storage', handleStorageChange);

    // 🔄 监听页面可见性变化（用户从其他页面返回时）
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ 页面重新可见，检查数据是否需要更新...');
        
        // 简单的时间戳检查，避免频繁重载
        const lastUpdate = localStorage.getItem('lastUserDataUpdate');
        const now = Date.now();
        
        if (!lastUpdate || (now - parseInt(lastUpdate)) > 10000) { // 10秒内的更新才重载
          console.log('⚡ 重新加载运势数据...');
          reloadUserDataAndFortune();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener('userProfileUpdated', handleUserDataUpdate);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 更新推荐outfit
  useEffect(() => {
    if (fortuneData && !selectedOutfit && outfitRecommendations.length > 0) {
      const recommendedOutfit = getRecommendedOutfit();
      setSelectedOutfit(recommendedOutfit);
      
      // 🆕 同时更新配饰推荐
      if (recommendedOutfit) {
        const currentHour = currentTime.getHours();
        const dominantFortune = getDominantFortuneType();
        const accessoryRec = getAccessoryRecommendation(recommendedOutfit, currentHour, dominantFortune);
        setCurrentAccessoryRecommendation(accessoryRec);
      }
    }
  }, [fortuneData, currentTime]);

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
          🔮 正在计算运势...
        </div>
        <div style={{
          fontSize: '0.9rem',
          color: designSystem.colors.text.secondary,
          textAlign: 'center'
        }}>
          正在为您生成今日运势和穿衣推荐
        </div>
      </div>
    );
  }

  const renderOutfitCard = (outfit: OutfitRecommendation, isMain: boolean = false) => (
    <motion.div
      key={outfit.id}
      layoutId={`outfit-${outfit.id}`}
      whileHover={{ 
        scale: isMain ? 1.03 : 1.02, 
        y: isMain ? -8 : -5,
        rotateY: isMain ? 2 : 1
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        setSelectedOutfit(outfit);
        if (isMain) {
          setShowOutfitDetail(true);
        }
      }}
      style={{
        background: isMain 
          ? `linear-gradient(145deg, 
              ${outfit.mainColor}25 0%, 
              ${outfit.mainColor}15 40%, 
              rgba(255,255,255,0.05) 100%)`
          : `linear-gradient(135deg, 
              rgba(255,255,255,0.1) 0%, 
              rgba(255,255,255,0.05) 100%)`,
        backdropFilter: 'blur(30px) saturate(150%)',
        borderRadius: isMain ? '28px' : designSystem.borderRadius.lg,
        padding: isMobile ? (isMain ? '2rem' : '1.5rem') : (isMain ? '2.5rem' : '2rem'),
        border: isMain 
          ? `3px solid ${outfit.mainColor}50`
          : '2px solid rgba(255, 255, 255, 0.15)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isMain 
          ? `0 30px 80px ${outfit.mainColor}25, 
             0 10px 40px rgba(0,0,0,0.1),
             inset 0 1px 0 rgba(255,255,255,0.3),
             0 0 0 1px ${outfit.mainColor}20`
          : `${designSystem.shadows.ambient}, 
             inset 0 1px 0 rgba(255,255,255,0.1)`,
        transform: isMain ? 'perspective(1000px)' : 'none',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* 🎨 重新设计的背景装饰系统 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none'
      }}>
        {/* 主背景渐变 */}
        <motion.div
          animate={isMain ? {
            background: [
              `radial-gradient(circle at 30% 20%, ${outfit.mainColor}15 0%, transparent 50%)`,
              `radial-gradient(circle at 70% 80%, ${outfit.mainColor}20 0%, transparent 60%)`,
              `radial-gradient(circle at 30% 20%, ${outfit.mainColor}15 0%, transparent 50%)`
            ]
          } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            right: '-20%',
            bottom: '-20%',
            background: `radial-gradient(circle at 50% 50%, ${outfit.mainColor}12 0%, transparent 60%)`
          }}
        />
        
        {/* 流光效果（仅主推方案） */}
        {isMain && (
          <motion.div
            animate={{
              x: ['-100%', '100%'],
              opacity: [0, 0.3, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '200%',
              height: '100%',
              background: `linear-gradient(90deg, transparent, ${outfit.mainColor}30, transparent)`,
              transform: 'skewX(-20deg)'
            }}
          />
        )}
        
        {/* 装饰性光点 */}
        {isMain && (
          <>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              style={{
                position: 'absolute',
                top: '15%',
                right: '20%',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: outfit.mainColor,
                boxShadow: `0 0 20px ${outfit.mainColor}`
              }}
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }}
              style={{
                position: 'absolute',
                bottom: '20%',
                left: '15%',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: outfit.mainColor,
                boxShadow: `0 0 15px ${outfit.mainColor}`
              }}
            />
          </>
        )}
      </div>

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

        {/* 🎨 重新设计的颜色展示系统 */}
        <div style={{
          display: 'flex',
          gap: isMain ? '0.8rem' : '0.6rem',
          marginBottom: '1.2rem',
          justifyContent: isMain ? 'center' : 'flex-start'
        }}>
          {outfit.colors.slice(0, isMain ? 5 : 3).map((color, index) => {
            const colorMap = {
              '金色': '#FFD700', '深红色': '#8B0000', '黑色': '#1a1a1a',
              '粉色': '#FF69B4', '玫瑰金': '#E8B4A0', '米白色': '#F5F5DC',
              '深蓝色': '#1E3A8A', '银色': '#C0C0C0', '白色': '#FFFFFF',
              '翠绿色': '#10B981', '天蓝色': '#87CEEB', '紫色': '#9333EA',
              '象牙白': '#FFFEF0', '珍珠白': '#F8F6F0', '古铜色': '#CD7F32'
            };
            
            const bgColor = colorMap[color as keyof typeof colorMap] || '#CCCCCC';
            
            return (
              <motion.div
              key={index}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.3 + index * 0.1, 
                  type: "spring", 
                  stiffness: 200 
                }}
                whileHover={{ 
                  scale: isMain ? 1.3 : 1.2, 
                  y: -3,
                  boxShadow: `0 8px 25px ${bgColor}50`
                }}
              style={{
                  width: isMain ? '32px' : '28px',
                  height: isMain ? '32px' : '28px',
                  background: `radial-gradient(circle at 30% 30%, ${bgColor}, ${bgColor}DD)`,
                borderRadius: '50%',
                  border: `${isMain ? '3px' : '2px'} solid rgba(255, 255, 255, 0.3)`,
                  boxShadow: `
                    0 ${isMain ? '6px' : '4px'} ${isMain ? '20px' : '12px'} ${bgColor}40,
                    0 2px 8px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                  `,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* 高光效果 */}
                <div style={{
                  position: 'absolute',
                  top: '15%',
                  left: '20%',
                  width: '40%',
                  height: '40%',
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '50%',
                  filter: 'blur(2px)'
                }} />
                
                {/* 光晕动画（仅主推方案） */}
                {isMain && (
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0, 0.3, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: index * 0.3 
                    }}
                    style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: `radial-gradient(circle, ${bgColor}30 0%, transparent 70%)`,
                      borderRadius: '50%'
                    }}
                  />
                )}
              </motion.div>
            );
          })}
          
          {/* 颜色名称标签（仅主推方案显示） */}
          {isMain && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                marginLeft: '0.5rem'
              }}
            >
              <div style={{
                fontSize: '0.75rem',
                color: designSystem.colors.text.secondary,
                fontWeight: '500',
                marginBottom: '0.2rem'
              }}>
                主色调
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: outfit.mainColor,
                fontWeight: '600',
                textShadow: `0 0 10px ${outfit.mainColor}50`
              }}>
                {outfit.colors[0]}
              </div>
            </motion.div>
          )}
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
            marginBottom: '0.3rem'
          }}>
            {getPersonalizedGreeting(greeting.text)}
          </h1>
          
          {/* 时辰文化描述 */}
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{
              fontSize: '0.9rem',
              color: designSystem.colors.text.secondary,
              fontStyle: 'italic',
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}
          >
            {greeting.desc}
          </motion.p>
          
          {/* 特殊时间问候 */}
          {getTimeBasedSpecialGreeting() && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                fontSize: '0.9rem',
                color: designSystem.colors.text.accent,
                fontStyle: 'italic',
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}
            >
              {getTimeBasedSpecialGreeting()}
            </motion.p>
          )}
          
          {/* 每日智慧金句 */}
          {dailyWisdom && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 140, 0, 0.1) 100%)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '12px',
                padding: isMobile ? '1rem' : '1.5rem',
                marginBottom: '1rem',
                textAlign: 'center'
              }}
            >
              <p style={{
                fontSize: isMobile ? '0.95rem' : '1.1rem',
                color: designSystem.colors.text.primary,
                fontStyle: 'italic',
                lineHeight: '1.6',
                marginBottom: '0.5rem'
              }}>
                "{dailyWisdom.text}"
              </p>
              <p style={{
                fontSize: '0.85rem',
                color: designSystem.colors.text.secondary,
                margin: 0
              }}>
                {dailyWisdom.source}
              </p>
            </motion.div>
          )}
          
          <p style={{
            fontSize: '0.9rem',
            color: designSystem.colors.text.secondary,
            marginBottom: '1rem'
          }}>
            今日运势 • 根据您的命理精心解读 • {currentTime.toLocaleDateString()}
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
              <span>✨</span>
              <span>玄学智慧推荐已为您精心定制</span>
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
            {/* 🧭 世界级玄学吉位 */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (auspiciousDirections?.best_direction) {
                  alert(`🧭 今日最佳吉位详情\n\n方位：${auspiciousDirections.best_direction.direction}\n八卦：${auspiciousDirections.best_direction.bagua}\n五行：${auspiciousDirections.best_direction.element}\n飞星：${auspiciousDirections.best_direction.star_number}星\n运势评分：${auspiciousDirections.best_direction.fortune_score}分\n最佳时辰：${auspiciousDirections.best_direction.time_period}\n\n适宜活动：${auspiciousDirections.best_direction.suitable_activities?.join('、')}\n\n${auspiciousDirections.best_direction.description}`);
                }
              }}
              style={{
                padding: '1.2rem',
                background: auspiciousDirections?.best_direction 
                  ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 140, 0, 0.05) 100%)'
                  : designSystem.colors.background.card,
                backdropFilter: 'blur(20px)',
                borderRadius: designSystem.borderRadius.md,
                border: auspiciousDirections?.best_direction 
                  ? '1px solid rgba(255, 215, 0, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                cursor: auspiciousDirections?.best_direction ? 'pointer' : 'default',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* 玄学背景效果 */}
              {auspiciousDirections?.best_direction && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `conic-gradient(from ${auspiciousDirections.best_direction.degrees}deg, transparent 0deg, rgba(255, 215, 0, 0.05) 90deg, transparent 180deg)`,
                  animation: 'compass-spin 30s linear infinite',
                  zIndex: 1
                }} />
              )}
              
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '0.5rem',
                  filter: auspiciousDirections?.best_direction 
                    ? 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))'
                    : 'none'
                }}>
                  🧭
                </div>
                
                <div style={{
                  fontSize: '0.9rem',
                  color: designSystem.colors.text.secondary,
                  marginBottom: '0.5rem'
                }}>
                  {auspiciousDirections?.best_direction ? '世界级玄学吉位' : '吉方'}
                </div>
                
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  color: auspiciousDirections?.best_direction 
                    ? '#FFD700' 
                    : designSystem.colors.text.primary,
                  marginBottom: '0.3rem'
                }}>
                  {auspiciousDirections?.best_direction?.direction || fortuneData.lucky_directions?.join(' ') || '西南'}
                </div>
                
                {auspiciousDirections?.best_direction && (
                  <>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'rgba(255, 215, 0, 0.8)',
                      marginBottom: '0.2rem'
                    }}>
                      {auspiciousDirections.best_direction.bagua}卦 · {auspiciousDirections.best_direction.element}行
                    </div>
                    
                    <div style={{
                      fontSize: '0.7rem',
                      color: designSystem.colors.text.secondary,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>{auspiciousDirections.best_direction.star_number}星</span>
                      <span>·</span>
                      <span>{auspiciousDirections.best_direction.fortune_score}分</span>
                    </div>
                  </>
                )}
                
                {auspiciousDirections?.best_direction?.time_period && (
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255, 215, 0, 0.6)',
                    marginTop: '0.3rem'
                  }}>
                    最佳时辰：{auspiciousDirections.best_direction.time_period}
                  </div>
                )}
              </div>
            </motion.div>

            {/* 🎨 世界级八字用神幸运色 */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const cachedData = localStorage.getItem(`lucky-colors-${getUserProfile()?.birthdate}`);
                if (cachedData) {
                  try {
                    const data = JSON.parse(cachedData);
                    const analysis = data.analysis;
                    if (analysis) {
                      alert(`🎨 幸运色详细分析\n\n主要幸运色：${analysis.primary_colors?.join('、')}\n辅助色彩：${analysis.secondary_colors?.join('、')}\n避免色彩：${analysis.avoid_colors?.join('、')}\n季节推荐：${analysis.seasonal_colors?.join('、')}\n\n推荐置信度：${analysis.confidence}%\n\n用神分析：${analysis.yongshen_analysis}\n\n${analysis.explanation}\n\n理论依据：${analysis.traditional_basis?.join('、')}`);
                    }
                  } catch (error) {
                    console.error('解析幸运色缓存失败:', error);
                  }
                }
              }}
              style={{
                padding: '1.2rem',
                background: fortuneData?.lucky_colors?.length > 0 
                  ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 140, 0, 0.05) 100%)'
                  : designSystem.colors.background.card,
                backdropFilter: 'blur(20px)',
                borderRadius: designSystem.borderRadius.md,
                border: fortuneData?.lucky_colors?.length > 0 
                  ? '1px solid rgba(255, 215, 0, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                cursor: fortuneData?.lucky_colors?.length > 0 ? 'pointer' : 'default',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* 五行色彩背景效果 */}
              {fortuneData?.lucky_colors?.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.05) 0%, transparent 70%)',
                  animation: 'color-flow 6s ease-in-out infinite',
                  zIndex: 1
                }} />
              )}
              
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '0.5rem',
                  filter: fortuneData?.lucky_colors?.length > 0 
                    ? 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))'
                    : 'none'
                }}>
                  🎨
                </div>
                
                <div style={{
                  fontSize: '0.9rem',
                  color: designSystem.colors.text.secondary,
                  marginBottom: '0.5rem'
                }}>
                  {fortuneData?.lucky_colors?.length > 0 ? '世界级用神幸运色' : '幸运色'}
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  flexWrap: 'wrap',
                  marginBottom: '0.3rem'
                }}>
                  {(fortuneData?.lucky_colors || ['金色', '红色']).map((color, index) => {
                    // 世界级色彩映射系统
                    const getColorStyle = (colorName: string) => {
                      const colorMap: Record<string, { bg: string; text: string; shadow: string }> = {
                        '金色': { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', text: '#000000', shadow: 'rgba(255, 215, 0, 0.5)' },
                        '银色': { bg: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)', text: '#000000', shadow: 'rgba(192, 192, 192, 0.5)' },
                        '白色': { bg: 'linear-gradient(135deg, #FFFFFF, #F5F5F5)', text: '#000000', shadow: 'rgba(255, 255, 255, 0.5)' },
                        '红色': { bg: 'linear-gradient(135deg, #FF6B6B, #E53E3E)', text: '#FFFFFF', shadow: 'rgba(255, 107, 107, 0.5)' },
                        '深红色': { bg: 'linear-gradient(135deg, #8B0000, #B91C1C)', text: '#FFFFFF', shadow: 'rgba(139, 0, 0, 0.5)' },
                        '粉色': { bg: 'linear-gradient(135deg, #FF69B4, #F687B3)', text: '#FFFFFF', shadow: 'rgba(255, 105, 180, 0.5)' },
                        '橙色': { bg: 'linear-gradient(135deg, #FF7F50, #F56500)', text: '#FFFFFF', shadow: 'rgba(255, 127, 80, 0.5)' },
                        '黄色': { bg: 'linear-gradient(135deg, #FFFF00, #FFC107)', text: '#000000', shadow: 'rgba(255, 255, 0, 0.5)' },
                        '绿色': { bg: 'linear-gradient(135deg, #10B981, #059669)', text: '#FFFFFF', shadow: 'rgba(16, 185, 129, 0.5)' },
                        '翠绿色': { bg: 'linear-gradient(135deg, #00FF7F, #22C55E)', text: '#000000', shadow: 'rgba(0, 255, 127, 0.5)' },
                        '青色': { bg: 'linear-gradient(135deg, #00FFFF, #0891B2)', text: '#000000', shadow: 'rgba(0, 255, 255, 0.5)' },
                        '蓝色': { bg: 'linear-gradient(135deg, #3B82F6, #1E40AF)', text: '#FFFFFF', shadow: 'rgba(59, 130, 246, 0.5)' },
                        '深蓝色': { bg: 'linear-gradient(135deg, #1E3A8A, #1E40AF)', text: '#FFFFFF', shadow: 'rgba(30, 58, 138, 0.5)' },
                        '紫色': { bg: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', text: '#FFFFFF', shadow: 'rgba(139, 92, 246, 0.5)' },
                        '黑色': { bg: 'linear-gradient(135deg, #000000, #374151)', text: '#FFFFFF', shadow: 'rgba(0, 0, 0, 0.5)' },
                        '棕色': { bg: 'linear-gradient(135deg, #8B4513, #92400E)', text: '#FFFFFF', shadow: 'rgba(139, 69, 19, 0.5)' }
                      };
                      return colorMap[colorName] || { bg: 'linear-gradient(135deg, #6B7280, #4B5563)', text: '#FFFFFF', shadow: 'rgba(107, 114, 128, 0.5)' };
                    };
                    
                    const colorStyle = getColorStyle(color);
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                        whileHover={{ scale: 1.1, y: -3 }}
                        style={{
                          minWidth: '60px',
                          height: '32px',
                          background: colorStyle.bg,
                          color: colorStyle.text,
                          borderRadius: '16px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 0.8rem',
                          boxShadow: `0 4px 12px ${colorStyle.shadow}`,
                          border: '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {/* 色彩光效 */}
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '120%',
                          height: '120%',
                          background: `radial-gradient(circle, ${colorStyle.shadow} 0%, transparent 70%)`,
                          transform: 'translate(-50%, -50%)',
                          opacity: 0.3,
                          animation: 'color-pulse 3s ease-in-out infinite'
                        }} />
                        
                        <span style={{ position: 'relative', zIndex: 1 }}>
                          {color}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
                
                {fortuneData?.lucky_colors?.length > 0 && (
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255, 215, 0, 0.8)',
                    marginTop: '0.3rem'
                  }}>
                    五行色彩 · 用神调候
                  </div>
                )}
              </div>
            </motion.div>

            {/* 🔢 世界级东方玄学幸运数字 */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const cachedData = localStorage.getItem(`lucky-numbers-${getUserProfile()?.birthdate}`);
                if (cachedData) {
                  try {
                    const data = JSON.parse(cachedData);
                    const analysis = data.analysis;
                    if (analysis) {
                      alert(`🔢 幸运数字详细分析\n\n主要幸运数字：${analysis.primary_numbers?.join('、')}\n辅助数字：${analysis.secondary_numbers?.join('、')}\n避免数字：${analysis.avoid_numbers?.join('、')}\n特殊组合：${analysis.special_combinations?.map(combo => combo.join('-')).join('、')}\n\n推荐置信度：${analysis.confidence}%\n\n${analysis.explanation}\n\n理论依据：${analysis.traditional_basis?.join('、')}`);
                    }
                  } catch (error) {
                    console.error('解析幸运数字缓存失败:', error);
                  }
                }
              }}
              style={{
                padding: '1.2rem',
                background: luckyNumbers.length > 0 
                  ? 'linear-gradient(135deg, rgba(106, 90, 205, 0.1) 0%, rgba(138, 43, 226, 0.05) 100%)'
                  : designSystem.colors.background.card,
                backdropFilter: 'blur(20px)',
                borderRadius: designSystem.borderRadius.md,
                border: luckyNumbers.length > 0 
                  ? '1px solid rgba(106, 90, 205, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                cursor: luckyNumbers.length > 0 ? 'pointer' : 'default',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* 数理背景效果 */}
              {luckyNumbers.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at center, rgba(106, 90, 205, 0.05) 0%, transparent 70%)',
                  animation: 'number-pulse 4s ease-in-out infinite',
                  zIndex: 1
                }} />
              )}
              
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '0.5rem',
                  filter: luckyNumbers.length > 0 
                    ? 'drop-shadow(0 0 10px rgba(106, 90, 205, 0.5))'
                    : 'none'
                }}>
                  🔢
                </div>
                
                <div style={{
                  fontSize: '0.9rem',
                  color: designSystem.colors.text.secondary,
                  marginBottom: '0.5rem'
                }}>
                  {luckyNumbers.length > 0 ? '世界级玄学数字' : '幸运数'}
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  flexWrap: 'wrap',
                  marginBottom: '0.3rem'
                }}>
                  {(luckyNumbers.length > 0 ? luckyNumbers : fortuneData?.lucky_numbers || [1, 6, 8]).map((number, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        background: luckyNumbers.length > 0 
                          ? 'linear-gradient(135deg, #6A5ACD, #8A2BE2)'
                          : 'linear-gradient(135deg, #DAA520, #FFD700)',
                        color: '#ffffff',
                        borderRadius: '50%',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      {number}
                    </motion.span>
                  ))}
                </div>
                
                {luckyNumbers.length > 0 && (
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'rgba(106, 90, 205, 0.8)',
                    marginTop: '0.3rem'
                  }}>
                    河洛数理 · 九宫格局
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 🗓️ 世界级个人化今日宜忌 */}
        {dailyTaboo && (
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
              🗓️ 今日宜忌 · 传统择日
            </h3>

            {/* 总体运势 */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(160, 82, 45, 0.05) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: designSystem.borderRadius.md,
                border: '1px solid rgba(139, 69, 19, 0.3)',
                textAlign: 'center',
                marginBottom: '1rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* 择日背景效果 */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at center, rgba(139, 69, 19, 0.05) 0%, transparent 70%)',
                animation: 'taboo-glow 5s ease-in-out infinite',
                zIndex: 1
              }} />

              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                  fontSize: '1.5rem',
                  marginBottom: '0.5rem'
                }}>
                  📅
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#8B4513',
                  marginBottom: '0.3rem'
                }}>
                  {dailyTaboo.general_fortune || '今日运势平稳'}
                </div>
                {dailyTaboo.lunar_date && (
                  <div style={{
                    fontSize: '0.8rem',
                    color: designSystem.colors.text.secondary
                  }}>
                    {dailyTaboo.lunar_date} · {dailyTaboo.day_stem_branch}日
                  </div>
                )}
              </div>
            </motion.div>

            {/* 宜忌活动网格 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '1rem'
            }}>
              {/* 今日宜 */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  padding: '1.2rem',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: designSystem.borderRadius.md,
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>✅</span>
                    <span style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#22C55E'
                    }}>
                      今日宜
                    </span>
                  </div>

                  <div style={{ space: '0.8rem' }}>
                    {/* 大吉活动 */}
                    {dailyTaboo.excellent_activities?.slice(0, 2).map((activity: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                          background: 'rgba(34, 197, 94, 0.1)',
                          padding: '0.6rem',
                          borderRadius: '8px',
                          marginBottom: '0.5rem',
                          border: '1px solid rgba(34, 197, 94, 0.2)'
                        }}
                      >
                        <div style={{
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: '#22C55E',
                          marginBottom: '0.2rem'
                        }}>
                          🌟 {activity.activity}
                        </div>
                        <div style={{
                          fontSize: '0.7rem',
                          color: designSystem.colors.text.secondary,
                          marginBottom: '0.2rem'
                        }}>
                          {activity.reason}
                        </div>
                        <div style={{
                          fontSize: '0.6rem',
                          color: 'rgba(34, 197, 94, 0.8)'
                        }}>
                          最佳时辰：{activity.best_time}
                        </div>
                      </motion.div>
                    ))}

                    {/* 一般适宜活动 */}
                    {dailyTaboo.suitable_activities?.slice(0, 3).map((activity: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (index + 2) * 0.1 }}
                        style={{
                          background: 'rgba(34, 197, 94, 0.05)',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          marginBottom: '0.4rem',
                          border: '1px solid rgba(34, 197, 94, 0.1)'
                        }}
                      >
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#16A34A',
                          marginBottom: '0.1rem'
                        }}>
                          ✓ {activity.activity}
                        </div>
                        <div style={{
                          fontSize: '0.6rem',
                          color: designSystem.colors.text.tertiary
                        }}>
                          {activity.best_time}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* 今日忌 */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  padding: '1.2rem',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: designSystem.borderRadius.md,
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>❌</span>
                    <span style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#EF4444'
                    }}>
                      今日忌
                    </span>
                  </div>

                  <div style={{ space: '0.8rem' }}>
                    {/* 大凶活动 */}
                    {dailyTaboo.forbidden_activities?.slice(0, 2).map((activity: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          padding: '0.6rem',
                          borderRadius: '8px',
                          marginBottom: '0.5rem',
                          border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}
                      >
                        <div style={{
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: '#EF4444',
                          marginBottom: '0.2rem'
                        }}>
                          ⚡ {activity.activity}
                        </div>
                        <div style={{
                          fontSize: '0.7rem',
                          color: designSystem.colors.text.secondary,
                          marginBottom: '0.2rem'
                        }}>
                          {activity.reason}
                        </div>
                        <div style={{
                          fontSize: '0.6rem',
                          color: 'rgba(239, 68, 68, 0.8)'
                        }}>
                          避免时段：{activity.best_time || '全天'}
                        </div>
                      </motion.div>
                    ))}

                    {/* 一般不宜活动 */}
                    {dailyTaboo.unsuitable_activities?.slice(0, 3).map((activity: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (index + 2) * 0.1 }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.05)',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          marginBottom: '0.4rem',
                          border: '1px solid rgba(239, 68, 68, 0.1)'
                        }}
                      >
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#DC2626',
                          marginBottom: '0.1rem'
                        }}>
                          ✗ {activity.activity}
                        </div>
                        <div style={{
                          fontSize: '0.6rem',
                          color: designSystem.colors.text.tertiary
                        }}>
                          不宜进行
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 吉时凶时 */}
            {(dailyTaboo.best_hours?.length > 0 || dailyTaboo.worst_hours?.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(139, 69, 19, 0.05)',
                  borderRadius: designSystem.borderRadius.md,
                  border: '1px solid rgba(139, 69, 19, 0.1)'
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: '1rem',
                  textAlign: 'center'
                }}>
                  {dailyTaboo.best_hours?.length > 0 && (
                    <div>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#22C55E',
                        marginBottom: '0.5rem'
                      }}>
                        ⏰ 今日吉时
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: designSystem.colors.text.secondary,
                        lineHeight: '1.4'
                      }}>
                        {dailyTaboo.best_hours.join('、')}
                      </div>
                    </div>
                  )}

                  {dailyTaboo.worst_hours?.length > 0 && (
                    <div>
                      <div style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#EF4444',
                        marginBottom: '0.5rem'
                      }}>
                        ⏰ 今日凶时
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: designSystem.colors.text.secondary,
                        lineHeight: '1.4'
                      }}>
                        {dailyTaboo.worst_hours.join('、')}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
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

        {/* 🎯 重新设计的今日主推穿衣方案 - 明确逻辑关系 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ marginBottom: '2rem' }}
        >
          {/* 🎨 重新设计的标题区域 */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
            textAlign: 'center',
              marginBottom: '2rem',
              position: 'relative'
            }}
          >
            {/* 背景装饰光环 */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
              height: '80px',
              background: `radial-gradient(ellipse, ${selectedOutfit?.mainColor || '#DAA520'}15 0%, transparent 70%)`,
              filter: 'blur(20px)',
              zIndex: 0
            }} />
            
            {/* 主标题 */}
            <div style={{
              position: 'relative',
              zIndex: 1,
              marginBottom: '1rem'
            }}>
              <motion.h2
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 120 }}
                style={{
                  fontSize: isMobile ? '1.8rem' : '2.2rem',
                  fontWeight: '800',
                  background: `linear-gradient(135deg, ${selectedOutfit?.mainColor || '#DAA520'}, ${selectedOutfit?.mainColor || '#DAA520'}CC, #FFFFFF)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  margin: 0,
                  letterSpacing: '0.5px',
                  textShadow: 'none',
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))'
                }}
              >
                今日主推穿衣方案
              </motion.h2>
              
              {/* 装饰性分割线 */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '120px' }}
                transition={{ delay: 0.8, duration: 0.8 }}
                style={{
                  height: '3px',
                  background: `linear-gradient(90deg, transparent, ${selectedOutfit?.mainColor || '#DAA520'}, transparent)`,
                  margin: '0.75rem auto',
                  borderRadius: '2px',
                  boxShadow: `0 0 10px ${selectedOutfit?.mainColor || '#DAA520'}50`
                }}
              />
              
              {/* 副标题 */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                style={{
                  fontSize: isMobile ? '0.95rem' : '1.1rem',
                  color: designSystem.colors.text.secondary,
                  margin: 0,
                  fontWeight: '500',
                  letterSpacing: '0.3px'
                }}
              >
                基于您的运势分析，AI为您智能匹配最佳搭配
              </motion.p>
            </div>
            
            {/* 🔍 AI推荐逻辑说明 */}
            {selectedOutfit && fortuneData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(59, 130, 246, 0.08) 0%, 
                    rgba(16, 185, 129, 0.08) 100%)`,
                  borderRadius: '16px',
                  padding: '1.2rem',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  position: 'relative'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>🤖</span>
                  <h3 style={{
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    fontWeight: '700',
                    color: designSystem.colors.text.primary,
                    margin: 0
                  }}>
                    AI推荐逻辑
                  </h3>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  {(() => {
                    const baseScores = {
                      wealth: fortuneData?.wealth_fortune?.score || 75,
                      career: fortuneData?.career_fortune?.score || 80,
                      love: fortuneData?.love_fortune?.score || 70,
                      health: fortuneData?.health_fortune?.score || 75
                    };
                    
                    const weakestFortune = Object.entries(baseScores).reduce((a, b) => 
                      baseScores[a[0] as keyof typeof baseScores] < baseScores[b[0] as keyof typeof baseScores] ? a : b
                    );
                    
                    const fortuneNames = { 
                      wealth: '财运', 
                      career: '事业运', 
                      love: '桃花运', 
                      health: '健康运' 
                    };
                    
                    const fortuneIcons = { 
                      wealth: '💰', 
                      career: '🚀', 
                      love: '💕', 
                      health: '🌿' 
                    };
                    
                    return (
                      <>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.6rem 1rem',
                          background: 'rgba(245, 158, 11, 0.1)',
                          borderRadius: '12px',
                          border: '2px solid #F59E0B'
                        }}>
                          <span style={{ fontSize: '1.2rem' }}>
                            {fortuneIcons[weakestFortune[0] as keyof typeof fortuneIcons]}
                          </span>
                          <span style={{
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: '#F59E0B'
                          }}>
                            {fortuneNames[weakestFortune[0] as keyof typeof fortuneNames]}薄弱
                          </span>
                          <span style={{
                            fontSize: '0.8rem',
                            color: '#92400E'
                          }}>
                            ({weakestFortune[1]}分)
                          </span>
                        </div>
                        
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          style={{ fontSize: '1.2rem', color: '#10B981' }}
                        >
                          →
                        </motion.span>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.6rem 1rem',
                          background: `${selectedOutfit.mainColor}15`,
                          borderRadius: '12px',
                          border: `2px solid ${selectedOutfit.mainColor}30`
                        }}>
                          <span style={{ fontSize: '1.2rem' }}>🎨</span>
                          <span style={{
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: selectedOutfit.mainColor
                          }}>
                            {selectedOutfit.theme}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
                
                <p style={{
                  fontSize: '0.85rem',
                  color: designSystem.colors.text.secondary,
                  margin: '1rem 0 0 0',
                  lineHeight: 1.5
                }}>
                  💡 AI检测到您的运势短板，特别推荐此搭配来针对性提升能量场
                </p>
              </motion.div>
            )}

            {/* 🎨 重新设计的运势加持效果预览 */}
            {selectedOutfit && fortuneData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, type: "spring", stiffness: 100 }}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  padding: '1.2rem 1.8rem',
                  background: `linear-gradient(135deg, 
                    ${selectedOutfit.mainColor}25 0%, 
                    ${selectedOutfit.mainColor}15 50%, 
                    transparent 100%)`,
                  backdropFilter: 'blur(30px) saturate(150%)',
                  borderRadius: '24px',
                  border: `2px solid ${selectedOutfit.mainColor}30`,
                  boxShadow: `
                    0 8px 32px ${selectedOutfit.mainColor}20,
                    0 2px 8px rgba(0,0,0,0.1),
                    inset 0 1px 0 rgba(255,255,255,0.2)
                  `,
                  overflow: 'hidden'
                }}
              >
                {/* 流光效果背景 */}
                <motion.div
                  animate={{
                    background: [
                      `linear-gradient(45deg, transparent 30%, ${selectedOutfit.mainColor}20 50%, transparent 70%)`,
                      `linear-gradient(45deg, transparent 40%, ${selectedOutfit.mainColor}30 60%, transparent 80%)`,
                      `linear-gradient(45deg, transparent 30%, ${selectedOutfit.mainColor}20 50%, transparent 70%)`
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '300%',
                    height: '100%',
                    pointerEvents: 'none'
                  }}
                />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* 标题区域 */}
                  <div style={{
                    display: 'flex',
                  alignItems: 'center',
                    justifyContent: 'center',
                  gap: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <motion.span 
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      style={{ fontSize: '1.4rem' }}
                    >
                      ✨
                    </motion.span>
                <span style={{
                      fontSize: isMobile ? '1rem' : '1.1rem',
                      fontWeight: '700',
                      color: designSystem.colors.text.primary,
                      letterSpacing: '0.5px'
                    }}>
                      预期提升效果
                </span>
                    <motion.span 
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      style={{ fontSize: '1.4rem' }}
                    >
                      🌟
                    </motion.span>
                  </div>

                  {/* 🆕 重新设计的运势加持效果展示 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                    gap: '1rem'
                  }}>
                    {(() => {
                      // 🎯 重新设计的真实加持计算系统
                      const calculateRealBoost = (outfitBoost: number, baseScore: number) => {
                        // 确保加持值是正数：基础加持(5-15) + outfit特定加持(outfitBoost的10%)
                        const baseBoost = Math.floor(Math.random() * 11) + 5; // 5-15的基础加持
                        const outfitSpecificBoost = Math.floor(outfitBoost * 0.1); // outfit特定加持
                        return baseBoost + outfitSpecificBoost;
                      };

                    const baseScores = {
                        wealth: fortuneData?.wealth_fortune?.score || 75,
                        career: fortuneData?.career_fortune?.score || 80,
                        love: fortuneData?.love_fortune?.score || 70,
                        health: fortuneData?.health_fortune?.score || 75
                      };

                      const fortuneConfig = {
                        wealth: { icon: '💰', name: '财运', color: '#FFD700', desc: '招财进宝' },
                        career: { icon: '🚀', name: '事业', color: '#3B82F6', desc: '青云直上' },
                        love: { icon: '💕', name: '桃花', color: '#EC4899', desc: '姻缘美满' },
                        health: { icon: '🌿', name: '健康', color: '#10B981', desc: '身心康泰' }
                      };

                      return Object.entries(selectedOutfit.fortuneBoost).map(([key, outfitBoost], index) => {
                        const baseScore = baseScores[key as keyof typeof baseScores];
                        const realBoost = calculateRealBoost(outfitBoost, baseScore);
                        const finalScore = baseScore + realBoost;
                        const config = fortuneConfig[key as keyof typeof fortuneConfig];
                        
                        // 根据最终分数确定等级
                        const getLevel = (score: number) => {
                          if (score >= 90) return { level: '极佳', color: '#FFD700', glow: '0 0 20px #FFD70050' };
                          if (score >= 80) return { level: '良好', color: '#10B981', glow: '0 0 15px #10B98150' };
                          if (score >= 70) return { level: '平稳', color: '#3B82F6', glow: '0 0 12px #3B82F650' };
                          return { level: '需提升', color: '#EF4444', glow: '0 0 10px #EF444450' };
                        };

                        const levelInfo = getLevel(finalScore);
                        
                      return (
                        <motion.div
                          key={key}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                              delay: 1.2 + index * 0.15, 
                              type: "spring", 
                              stiffness: 150,
                              damping: 10
                            }}
                            whileHover={{ 
                              scale: 1.1, 
                              y: -5,
                              boxShadow: `0 12px 30px ${config.color}30, ${levelInfo.glow}`
                            }}
                          style={{
                            display: 'flex',
                              flexDirection: 'column',
                            alignItems: 'center',
                              padding: '1rem 0.8rem',
                              background: `linear-gradient(145deg, 
                                ${config.color}15 0%, 
                                ${config.color}08 50%, 
                                transparent 100%)`,
                              borderRadius: '18px',
                              border: `2px solid ${config.color}30`,
                              cursor: 'pointer',
                              position: 'relative',
                              overflow: 'hidden',
                              boxShadow: `0 8px 25px ${config.color}20, ${levelInfo.glow}`
                            }}
                          >
                            {/* 🌟 动态背景光效 */}
                            <motion.div
                              animate={{
                                background: [
                                  `radial-gradient(circle, ${config.color}10 0%, transparent 50%)`,
                                  `radial-gradient(circle, ${config.color}20 0%, transparent 60%)`,
                                  `radial-gradient(circle, ${config.color}10 0%, transparent 50%)`
                                ]
                              }}
                              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                              style={{
                                position: 'absolute',
                                top: '-20%',
                                left: '-20%',
                                right: '-20%',
                                bottom: '-20%',
                                pointerEvents: 'none'
                              }}
                            />

                            <div style={{ position: 'relative', zIndex: 1 }}>
                              {/* 运势图标 */}
                              <motion.div
                                animate={{ 
                                  scale: [1, 1.1, 1],
                                  rotate: [0, 5, -5, 0]
                                }}
                                transition={{ 
                                  duration: 3, 
                                  repeat: Infinity, 
                                  delay: index * 0.5,
                                  ease: "easeInOut"
                                }}
                                style={{ 
                                  fontSize: '1.6rem',
                                  display: 'block',
                                  marginBottom: '0.5rem',
                                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
                                }}
                              >
                                {config.icon}
                              </motion.div>
                              
                              {/* 运势名称 */}
                              <div style={{
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                color: config.color,
                                marginBottom: '0.3rem',
                                textAlign: 'center'
                              }}>
                                {config.name}
                              </div>

                              {/* 当前分数显示 */}
                              <div style={{
                            fontSize: '0.7rem',
                                color: 'rgba(255,255,255,0.7)',
                                marginBottom: '0.3rem',
                                textAlign: 'center'
                              }}>
                                {baseScore} ➤ {finalScore}
                              </div>
                              
                              {/* 加持效果 */}
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 1.5 + index * 0.1 }}
                                style={{
                                  fontSize: '1rem',
                                  fontWeight: '800',
                                  color: '#22C55E',
                                  background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))',
                                  padding: '0.3rem 0.6rem',
                                  borderRadius: '12px',
                                  border: '1.5px solid rgba(34,197,94,0.3)',
                                  textAlign: 'center',
                                  marginBottom: '0.3rem',
                                  boxShadow: '0 0 15px rgba(34,197,94,0.2)'
                                }}
                              >
                                +{realBoost}
                              </motion.div>

                              {/* 运势等级 */}
                              <div style={{
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                color: levelInfo.color,
                                textAlign: 'center',
                                background: `${levelInfo.color}15`,
                                padding: '0.2rem 0.4rem',
                                borderRadius: '8px',
                                border: `1px solid ${levelInfo.color}30`
                              }}>
                                {levelInfo.level}
                              </div>
                            </div>
                        </motion.div>
                      );
                      });
                    })()}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
          
          {selectedOutfit && renderOutfitCard(selectedOutfit, true)}
          
          {/* 🎨 重新设计的配饰推荐部分 */}
          {currentAccessoryRecommendation && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
              style={{
                marginTop: '2rem',
                padding: isMobile ? '1.8rem' : '2.2rem',
                background: `linear-gradient(145deg, 
                  rgba(139, 69, 19, 0.15) 0%, 
                  rgba(160, 82, 45, 0.08) 40%, 
                  rgba(218, 165, 32, 0.05) 100%)`,
                backdropFilter: 'blur(30px) saturate(150%)',
                borderRadius: '32px',
                border: '2px solid rgba(139, 69, 19, 0.3)',
                boxShadow: `
                  0 25px 60px rgba(139, 69, 19, 0.15),
                  0 8px 30px rgba(0, 0, 0, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2),
                  0 0 0 1px rgba(139, 69, 19, 0.1)
                `,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* 🎨 精美的背景装饰系统 */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none'
              }}>
                {/* 流动的金沙效果 */}
                <motion.div
                  animate={{
                    background: [
                      'radial-gradient(circle at 20% 30%, rgba(218, 165, 32, 0.15) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 70%, rgba(139, 69, 19, 0.12) 0%, transparent 60%)',
                      'radial-gradient(circle at 20% 30%, rgba(218, 165, 32, 0.15) 0%, transparent 50%)'
                    ]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-20%',
                    right: '-20%',
                    bottom: '-20%'
                  }}
                />
                
                {/* 装饰性光点 */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.7, 0.4]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                  style={{
                    position: 'absolute',
                    top: '15%',
                    right: '25%',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#DAA520',
                    boxShadow: '0 0 15px #DAA520'
                  }}
                />
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                  style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '20%',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#8B4513',
                    boxShadow: '0 0 12px #8B4513'
                  }}
                />
              </div>

              {/* 🎨 重新设计的配饰推荐头部 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  {/* 精美的图标设计 */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 150 }}
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    style={{
                      position: 'relative',
                      width: '50px',
                      height: '50px',
                      background: 'linear-gradient(145deg, #DAA520, #8B4513)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `
                        0 8px 25px rgba(139, 69, 19, 0.3),
                        inset 0 2px 0 rgba(255, 255, 255, 0.3),
                        inset 0 -2px 0 rgba(0, 0, 0, 0.2)
                      `,
                      cursor: 'pointer'
                    }}
                  >
                    {/* 内圈装饰 */}
                    <div style={{
                      position: 'absolute',
                      width: '36px',
                      height: '36px',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      borderRadius: '50%'
                    }} />
                    
                    <motion.span
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      style={{ 
                        fontSize: '1.4rem',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                      }}
                    >
                      💍
                    </motion.span>
                    
                    {/* 光环效果 */}
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0, 0.3, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      style={{
                        position: 'absolute',
                        width: '70px',
                        height: '70px',
                        border: '2px solid #DAA520',
                        borderRadius: '50%',
                        pointerEvents: 'none'
                      }}
                    />
                  </motion.div>
                  
                  <div>
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                      style={{
                        fontSize: isMobile ? '1.2rem' : '1.4rem',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #DAA520, #8B4513)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        margin: 0,
                        letterSpacing: '0.5px',
                        textShadow: 'none'
                      }}
                    >
                      时辰配饰推荐
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 }}
                      style={{
                        fontSize: '0.9rem',
                        color: '#8B4513',
                        margin: 0,
                        fontWeight: '600',
                        textShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      {currentAccessoryRecommendation.time}
                    </motion.p>
                  </div>
                </div>
                
                {/* 精美的主题标签 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1, type: "spring", stiffness: 150 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  style={{
                    padding: '0.7rem 1.2rem',
                    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(139, 69, 19, 0.15))',
                    borderRadius: '20px',
                    border: '2px solid rgba(218, 165, 32, 0.3)',
                    fontSize: '0.85rem',
                    color: '#8B4513',
                    fontWeight: '700',
                    letterSpacing: '0.3px',
                    boxShadow: `
                      0 4px 15px rgba(139, 69, 19, 0.15),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `,
                    cursor: 'pointer'
                  }}
                >
                  {currentAccessoryRecommendation.mainOutfit}
                </motion.div>
              </div>

              {/* 配饰列表 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                {currentAccessoryRecommendation.accessories.map((accessory, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    style={{
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: designSystem.borderRadius.md,
                      border: '1px solid rgba(139, 69, 19, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: 'rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>💎</span>
                      <span style={{
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: designSystem.colors.text.primary
                      }}>
                        {accessory.item}
                      </span>
                    </div>
                    
                    <div style={{
                      fontSize: '0.8rem',
                      color: designSystem.colors.text.secondary,
                      marginBottom: '0.5rem'
                    }}>
                      <strong>缘由:</strong> {accessory.reason}
                    </div>
                    
                    <div style={{
                      fontSize: '0.8rem',
                      color: designSystem.colors.text.secondary,
                      marginBottom: '0.5rem'
                    }}>
                      <strong>效果:</strong> {accessory.effect}
                    </div>
                    
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#8B4513',
                      fontStyle: 'italic'
                    }}>
                      <strong>佩戴:</strong> {accessory.wearMethod}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 快速贴士 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                style={{
                  padding: '1rem',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: designSystem.borderRadius.md,
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>💡</span>
                <div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#22C55E',
                    marginBottom: '0.25rem'
                  }}>
                    快速贴士
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: designSystem.colors.text.secondary
                  }}>
                    {currentAccessoryRecommendation.quickTip}
                  </div>
                </div>
              </motion.div>

              {/* 颜色调整建议 */}
              {currentAccessoryRecommendation.colorAdjustment && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: designSystem.borderRadius.md,
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>🎨</span>
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#3B82F6'
                  }}>
                    <strong>颜色调整:</strong> {currentAccessoryRecommendation.colorAdjustment}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
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
            ✨ {aiRecommendations.length > 0 ? '今日开运穿搭' : '五行相生搭配'}
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
              ✨ 以上搭配融合传统玄学智慧，根据您的八字五行精心定制
            </div>
          )}
        </motion.div>

        
      </motion.div>

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

      {/* 🎯 用户引导流程 */}
      {showOnboarding && (
        <UserOnboardingFlow
          step={onboardingStep}
          onStepChange={handleOnboardingStepChange}
          onComplete={handleOnboardingComplete}
          onNavigate={onNavigate}
          userProgress={userProgress}
        />
      )}
      </div>
    </div>
  );
};



export default TodayHomePageProfessional; 