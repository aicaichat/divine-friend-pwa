// 每日智慧服务
// 提供个性化的每日智慧金句和用户行为数据管理

interface UserBehaviorData {
  visitCount: number;
  lastVisit: string;
  preferences: {
    wisdomType: 'classical' | 'modern' | 'mixed';
    source: 'buddhist' | 'taoist' | 'confucian' | 'mixed';
  };
  favoriteWisdoms: string[];
  totalInteractions: number;
}

interface WisdomData {
  text: string;
  source: string;
  category: 'motivational' | 'philosophical' | 'spiritual' | 'practical';
  tags: string[];
}

// 默认智慧数据库
const WISDOM_DATABASE: WisdomData[] = [
  {
    text: '观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄',
    source: '——《心经》',
    category: 'spiritual',
    tags: ['佛教', '般若', '智慧']
  },
  {
    text: '道生一，一生二，二生三，三生万物',
    source: '——《道德经》',
    category: 'philosophical',
    tags: ['道教', '宇宙', '生成']
  },
  {
    text: '知者不言，言者不知',
    source: '——老子',
    category: 'philosophical',
    tags: ['智慧', '谦逊', '道家']
  },
  {
    text: '学而时习之，不亦说乎',
    source: '——《论语》',
    category: 'motivational',
    tags: ['学习', '成长', '儒家']
  },
  {
    text: '天行健，君子以自强不息',
    source: '——《周易》',
    category: 'motivational',
    tags: ['自强', '奋斗', '易经']
  },
  {
    text: '不以物喜，不以己悲',
    source: '——范仲淹',
    category: 'philosophical',
    tags: ['平静', '心境', '修养']
  },
  {
    text: '山不在高，有仙则名；水不在深，有龙则灵',
    source: '——刘禹锡',
    category: 'philosophical',
    tags: ['内涵', '品质', '修养']
  },
  {
    text: '宠辱不惊，看庭前花开花落；去留无意，望天上云卷云舒',
    source: '——《菜根谭》',
    category: 'spiritual',
    tags: ['平静', '超脱', '禅意']
  },
  {
    text: '静以修身，俭以养德',
    source: '——诸葛亮',
    category: 'practical',
    tags: ['修身', '养德', '品格']
  },
  {
    text: '莲花不著水，日月不住空',
    source: '——禅宗语录',
    category: 'spiritual',
    tags: ['超脱', '自在', '禅宗']
  }
];

// 时间段相关的智慧
const TIME_BASED_WISDOM: Record<string, WisdomData[]> = {
  morning: [
    {
      text: '一日之计在于晨，一年之计在于春',
      source: '——古谚',
      category: 'motivational',
      tags: ['晨起', '计划', '开始']
    },
    {
      text: '日出而作，日入而息',
      source: '——《击壤歌》',
      category: 'practical',
      tags: ['作息', '自然', '规律']
    }
  ],
  afternoon: [
    {
      text: '午后清茶，静心养神',
      source: '——茶经',
      category: 'practical',
      tags: ['休息', '清净', '修养']
    }
  ],
  evening: [
    {
      text: '夜深人静好读书',
      source: '——古谚',
      category: 'motivational',
      tags: ['学习', '夜读', '修养']
    },
    {
      text: '三省吾身',
      source: '——《论语》',
      category: 'practical',
      tags: ['反思', '自省', '成长']
    }
  ]
};

// 获取用户行为数据
export function getUserBehaviorData(): UserBehaviorData {
  try {
    const stored = localStorage.getItem('userBehaviorData');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to parse user behavior data:', error);
  }

  // 返回默认数据
  return {
    visitCount: 1,
    lastVisit: new Date().toISOString(),
    preferences: {
      wisdomType: 'mixed',
      source: 'mixed'
    },
    favoriteWisdoms: [],
    totalInteractions: 0
  };
}

// 更新用户行为数据
export function updateUserBehaviorData(updates: Partial<UserBehaviorData>): void {
  try {
    const current = getUserBehaviorData();
    const updated = {
      ...current,
      ...updates,
      visitCount: current.visitCount + 1,
      lastVisit: new Date().toISOString(),
      totalInteractions: (current.totalInteractions || 0) + 1
    };
    
    localStorage.setItem('userBehaviorData', JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to update user behavior data:', error);
  }
}

// 获取格式化的智慧金句
export function getFormattedWisdom(userBehavior?: UserBehaviorData): { text: string; source: string } {
  const behavior = userBehavior || getUserBehaviorData();
  const currentHour = new Date().getHours();
  
  // 根据时间段选择合适的智慧
  let timeBasedWisdoms: WisdomData[] = [];
  if (currentHour >= 5 && currentHour < 12) {
    timeBasedWisdoms = TIME_BASED_WISDOM.morning || [];
  } else if (currentHour >= 12 && currentHour < 18) {
    timeBasedWisdoms = TIME_BASED_WISDOM.afternoon || [];
  } else {
    timeBasedWisdoms = TIME_BASED_WISDOM.evening || [];
  }

  // 结合用户偏好和时间段选择智慧
  let candidateWisdoms = [...WISDOM_DATABASE];
  
  // 如果有时间段相关的智慧，有30%概率选择时间段特定的智慧
  if (timeBasedWisdoms.length > 0 && Math.random() < 0.3) {
    candidateWisdoms = timeBasedWisdoms;
  }

  // 根据用户偏好过滤
  if (behavior.preferences.source !== 'mixed') {
    candidateWisdoms = candidateWisdoms.filter(wisdom => {
      const sourceLower = wisdom.source.toLowerCase();
      switch (behavior.preferences.source) {
        case 'buddhist':
          return sourceLower.includes('佛') || sourceLower.includes('心经') || wisdom.tags.includes('佛教');
        case 'taoist':
          return sourceLower.includes('道') || sourceLower.includes('老子') || wisdom.tags.includes('道教') || wisdom.tags.includes('道家');
        case 'confucian':
          return sourceLower.includes('论语') || sourceLower.includes('孔') || wisdom.tags.includes('儒家');
        default:
          return true;
      }
    });
  }

  // 避免重复显示用户最近看过的智慧
  const recentWisdoms = behavior.favoriteWisdoms.slice(-3);
  const availableWisdoms = candidateWisdoms.filter(wisdom => 
    !recentWisdoms.includes(wisdom.text)
  );

  // 如果过滤后没有可用的智慧，回退到全部候选
  const finalWisdoms = availableWisdoms.length > 0 ? availableWisdoms : candidateWisdoms;
  
  // 随机选择一条智慧
  const selectedWisdom = finalWisdoms[Math.floor(Math.random() * finalWisdoms.length)];
  
  // 记录用户查看过的智慧
  try {
    const updatedFavorites = [...behavior.favoriteWisdoms, selectedWisdom.text].slice(-10); // 只保留最近10条
    updateUserBehaviorData({
      favoriteWisdoms: updatedFavorites
    });
  } catch (error) {
    console.warn('Failed to update wisdom history:', error);
  }

  return {
    text: selectedWisdom.text,
    source: selectedWisdom.source
  };
}

// 获取智慧统计信息
export function getWisdomStats(): {
  totalViewed: number;
  favoriteCategories: string[];
  preferredSources: string[];
} {
  const behavior = getUserBehaviorData();
  return {
    totalViewed: behavior.favoriteWisdoms.length,
    favoriteCategories: [], // 可以根据需要扩展
    preferredSources: [] // 可以根据需要扩展
  };
}

// 重置用户行为数据
export function resetUserBehaviorData(): void {
  try {
    localStorage.removeItem('userBehaviorData');
  } catch (error) {
    console.warn('Failed to reset user behavior data:', error);
  }
}
