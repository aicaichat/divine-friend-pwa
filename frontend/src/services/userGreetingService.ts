// 用户问候服务
// 提供个性化问候和基于时间的特殊问候

interface UserInfo {
  name?: string;
  gender?: 'male' | 'female';
  birthDate?: string;
  preferredTitle?: string;
  customGreeting?: string;
}

interface SpecialTimeGreeting {
  condition: () => boolean;
  greeting: string;
  priority: number;
}

// 获取用户信息
function getUserInfo(): UserInfo {
  try {
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to parse user info:', error);
  }
  return {};
}

// 获取个性化问候
export function getPersonalizedGreeting(baseGreeting: string): string {
  const userInfo = getUserInfo();
  
  // 如果用户设置了自定义问候
  if (userInfo.customGreeting) {
    return userInfo.customGreeting;
  }

  // 如果有用户名，添加个性化称呼
  if (userInfo.name) {
    const title = userInfo.preferredTitle || (userInfo.gender === 'female' ? '女士' : '先生');
    return `${userInfo.name}${title}，${baseGreeting}`;
  }

  // 根据性别添加合适的称呼
  if (userInfo.gender) {
    const title = userInfo.gender === 'female' ? '女士' : '先生';
    return `尊敬的${title}，${baseGreeting}`;
  }

  // 返回原始问候
  return baseGreeting;
}

// 特殊时间问候配置
const SPECIAL_TIME_GREETINGS: SpecialTimeGreeting[] = [
  // 节气问候
  {
    condition: () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      
      // 立春 (约2月4日)
      return (month === 2 && day >= 3 && day <= 5);
    },
    greeting: '🌱 立春时节，万物复苏，愿您如春草般生机勃勃',
    priority: 10
  },
  {
    condition: () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      
      // 春分 (约3月21日)
      return (month === 3 && day >= 20 && day <= 22);
    },
    greeting: '🌸 春分时节，昼夜平分，愿您身心平衡，和谐安康',
    priority: 10
  },
  {
    condition: () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      
      // 夏至 (约6月21日)
      return (month === 6 && day >= 20 && day <= 22);
    },
    greeting: '☀️ 夏至时节，阳气最盛，愿您如日中天，前程似锦',
    priority: 10
  },
  {
    condition: () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      
      // 秋分 (约9月23日)
      return (month === 9 && day >= 22 && day <= 24);
    },
    greeting: '🍂 秋分时节，收获满满，愿您硕果累累，心满意足',
    priority: 10
  },
  {
    condition: () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      
      // 冬至 (约12月22日)
      return (month === 12 && day >= 21 && day <= 23);
    },
    greeting: '❄️ 冬至时节，阴极阳生，愿您如冬日暖阳，温暖如春',
    priority: 10
  },
  
  // 传统节日问候
  {
    condition: () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      
      // 元旦
      return (month === 1 && day === 1);
    },
    greeting: '🎊 新年伊始，万象更新，愿您新年新气象，好运连连',
    priority: 15
  },
  {
    condition: () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      
      // 清明节 (约4月5日)
      return (month === 4 && day >= 4 && day <= 6);
    },
    greeting: '🌿 清明时节，缅怀先祖，愿您慎终追远，德泽后人',
    priority: 8
  },
  {
    condition: () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      
      // 中秋节 (农历八月十五，这里用公历近似)
      return (month === 9 && day >= 13 && day <= 17);
    },
    greeting: '🌕 中秋佳节，月圆人团圆，愿您阖家幸福，和和美美',
    priority: 15
  },
  
  // 特殊时间段问候
  {
    condition: () => {
      const hour = new Date().getHours();
      // 凌晨时分 (2-4点)
      return hour >= 2 && hour < 4;
    },
    greeting: '🌙 夜深人静，愿您在这宁静时刻获得内心的平静',
    priority: 5
  },
  {
    condition: () => {
      const hour = new Date().getHours();
      // 日出时分 (5-7点)
      return hour >= 5 && hour < 7;
    },
    greeting: '🌅 晨光熹微，新的一天开始了，愿您精神饱满，活力充沛',
    priority: 6
  },
  {
    condition: () => {
      const hour = new Date().getHours();
      // 正午时分 (11-13点)
      return hour >= 11 && hour < 13;
    },
    greeting: '🌞 正午时光，阳气正盛，愿您事业如日中天',
    priority: 4
  },
  {
    condition: () => {
      const hour = new Date().getHours();
      // 黄昏时分 (17-19点)
      return hour >= 17 && hour < 19;
    },
    greeting: '🌅 夕阳西下，愿您收获满满，心情如晚霞般绚烂',
    priority: 4
  },
  
  // 周末特殊问候
  {
    condition: () => {
      const day = new Date().getDay();
      return day === 0 || day === 6; // 周日或周六
    },
    greeting: '🎉 美好的周末时光，愿您休憩身心，享受生活',
    priority: 3
  },
  
  // 月初月末问候
  {
    condition: () => {
      const day = new Date().getDate();
      return day === 1;
    },
    greeting: '📅 新月伊始，愿您本月心想事成，步步高升',
    priority: 7
  },
  {
    condition: () => {
      const now = new Date();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return now.getDate() === lastDay;
    },
    greeting: '📅 月末时光，回顾收获，展望未来，愿您越来越好',
    priority: 6
  },
  
  // 生日问候 (需要用户设置生日)
  {
    condition: () => {
      const userInfo = getUserInfo();
      if (!userInfo.birthDate) return false;
      
      const today = new Date();
      const birthDate = new Date(userInfo.birthDate);
      
      return today.getMonth() === birthDate.getMonth() && 
             today.getDate() === birthDate.getDate();
    },
    greeting: '🎂 生日快乐！愿您年年有今日，岁岁有今朝，福寿安康',
    priority: 20
  }
];

// 获取基于时间的特殊问候
export function getTimeBasedSpecialGreeting(): string | null {
  // 找到所有符合条件的问候
  const applicableGreetings = SPECIAL_TIME_GREETINGS
    .filter(greeting => greeting.condition())
    .sort((a, b) => b.priority - a.priority); // 按优先级排序

  // 返回优先级最高的问候
  return applicableGreetings.length > 0 ? applicableGreetings[0].greeting : null;
}

// 获取节气信息
export function getCurrentSolarTerm(): { name: string; description: string } | null {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // 简化的节气判断 (实际应该使用精确的天文计算)
  const solarTerms = [
    { name: '立春', start: [2, 3], end: [2, 5], desc: '春季开始，万物复苏' },
    { name: '雨水', start: [2, 18], end: [2, 20], desc: '降雨增多，草木萌动' },
    { name: '惊蛰', start: [3, 5], end: [3, 7], desc: '春雷始鸣，蛰虫惊醒' },
    { name: '春分', start: [3, 20], end: [3, 22], desc: '昼夜平分，春暖花开' },
    { name: '清明', start: [4, 4], end: [4, 6], desc: '天气清朗，万物明净' },
    { name: '谷雨', start: [4, 19], end: [4, 21], desc: '雨生百谷，农事繁忙' },
    { name: '立夏', start: [5, 5], end: [5, 7], desc: '夏季开始，万物繁茂' },
    { name: '小满', start: [5, 20], end: [5, 22], desc: '麦粒渐满，雨水增多' },
    { name: '芒种', start: [6, 5], end: [6, 7], desc: '麦类成熟，农忙时节' },
    { name: '夏至', start: [6, 20], end: [6, 22], desc: '白昼最长，阳气极盛' },
    { name: '小暑', start: [7, 6], end: [7, 8], desc: '天气炎热，但非最热' },
    { name: '大暑', start: [7, 22], end: [7, 24], desc: '酷暑炎热，雷雨频繁' },
    { name: '立秋', start: [8, 7], end: [8, 9], desc: '秋季开始，暑去凉来' },
    { name: '处暑', start: [8, 22], end: [8, 24], desc: '暑气渐消，秋高气爽' },
    { name: '白露', start: [9, 7], end: [9, 9], desc: '露水增多，天气转凉' },
    { name: '秋分', start: [9, 22], end: [9, 24], desc: '昼夜平分，秋收时节' },
    { name: '寒露', start: [10, 8], end: [10, 10], desc: '露水寒冷，深秋降临' },
    { name: '霜降', start: [10, 23], end: [10, 25], desc: '初霜出现，草木枯黄' },
    { name: '立冬', start: [11, 7], end: [11, 9], desc: '冬季开始，万物收藏' },
    { name: '小雪', start: [11, 22], end: [11, 24], desc: '初雪飘飞，气温下降' },
    { name: '大雪', start: [12, 6], end: [12, 8], desc: '雪花纷飞，寒冬深入' },
    { name: '冬至', start: [12, 21], end: [12, 23], desc: '白昼最短，阴极阳生' },
    { name: '小寒', start: [1, 5], end: [1, 7], desc: '天气寒冷，但非最寒' },
    { name: '大寒', start: [1, 20], end: [1, 22], desc: '最为寒冷，冰雪严寒' }
  ];

  for (const term of solarTerms) {
    const [startMonth, startDay] = term.start;
    const [endMonth, endDay] = term.end;
    
    if ((month === startMonth && day >= startDay) || 
        (month === endMonth && day <= endDay) ||
        (startMonth !== endMonth && month > startMonth && month < endMonth)) {
      return {
        name: term.name,
        description: term.desc
      };
    }
  }

  return null;
}

// 获取当前时辰信息
export function getCurrentHour(): { name: string; description: string; time: string } {
  const hour = new Date().getHours();
  
  const hourInfo = [
    { name: '子时', time: '23:00-1:00', desc: '夜深人静，宜休息养神' },
    { name: '丑时', time: '1:00-3:00', desc: '万籁俱寂，宜静心修行' },
    { name: '寅时', time: '3:00-5:00', desc: '晨光初现，万物复苏' },
    { name: '卯时', time: '5:00-7:00', desc: '旭日东升，生机勃发' },
    { name: '辰时', time: '7:00-9:00', desc: '朝阳初升，事业启程' },
    { name: '巳时', time: '9:00-11:00', desc: '日上三竿，宜主动出击' },
    { name: '午时', time: '11:00-13:00', desc: '日正当中，阳气最盛' },
    { name: '未时', time: '13:00-15:00', desc: '午后时光，宜修身养性' },
    { name: '申时', time: '15:00-17:00', desc: '夕阳西下，收获满满' },
    { name: '酉时', time: '17:00-19:00', desc: '日落西山，宜总结收获' },
    { name: '戌时', time: '19:00-21:00', desc: '华灯初上，家人团聚' },
    { name: '亥时', time: '21:00-23:00', desc: '夜幕降临，宜静心修行' }
  ];

  // 根据小时确定时辰
  let timeIndex;
  if (hour >= 23 || hour < 1) timeIndex = 0;
  else if (hour >= 1 && hour < 3) timeIndex = 1;
  else if (hour >= 3 && hour < 5) timeIndex = 2;
  else if (hour >= 5 && hour < 7) timeIndex = 3;
  else if (hour >= 7 && hour < 9) timeIndex = 4;
  else if (hour >= 9 && hour < 11) timeIndex = 5;
  else if (hour >= 11 && hour < 13) timeIndex = 6;
  else if (hour >= 13 && hour < 15) timeIndex = 7;
  else if (hour >= 15 && hour < 17) timeIndex = 8;
  else if (hour >= 17 && hour < 19) timeIndex = 9;
  else if (hour >= 19 && hour < 21) timeIndex = 10;
  else timeIndex = 11;

  return hourInfo[timeIndex];
}
