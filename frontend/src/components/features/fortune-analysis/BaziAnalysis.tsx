import React, { useState, useRef, useEffect } from 'react';
import { BaziAnalysis, FiveElements, FortuneReading, LifeAdvice } from '../../../types';

// 天干地支对照表
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 五行对应关系
const ELEMENT_MAP: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', 
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  '寅': '木', '卯': '木', '巳': '火', '午': '火', '辰': '土', 
  '戌': '土', '丑': '土', '未': '土', '申': '金', '酉': '金', 
  '子': '水', '亥': '水'
};

// 五行相生相克
const ELEMENT_RELATIONSHIPS = {
  生: {
    '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
  },
  克: {
    '木': '土', '火': '金', '土': '水', '金': '木', '水': '火'
  }
};

// 季节对应关系
const SEASON_MAP: Record<number, string> = {
  3: '春', 4: '春', 5: '春',
  6: '夏', 7: '夏', 8: '夏',
  9: '秋', 10: '秋', 11: '秋',
  12: '冬', 1: '冬', 2: '冬'
};

// 计算天干地支
function calculateStemsBranches(year: number, month: number, day: number, hour: number): {
  year: string;
  month: string;
  day: string;
  hour: string;
  yearZodiac: string;
} {
  // 简化计算（实际应用需要精确的万年历）
  const yearIndex = (year - 4) % 60;
  const yearStem = HEAVENLY_STEMS[yearIndex % 10];
  const yearBranch = EARTHLY_BRANCHES[yearIndex % 12];
  const yearZodiac = ZODIAC_ANIMALS[yearIndex % 12];
  
  // 月柱计算（简化）
  const monthIndex = ((year - 1900) * 12 + month - 1) % 60;
  const monthStem = HEAVENLY_STEMS[monthIndex % 10];
  const monthBranch = EARTHLY_BRANCHES[monthIndex % 12];
  
  // 日柱计算（简化）
  const dayIndex = (year * 365 + month * 30 + day) % 60;
  const dayStem = HEAVENLY_STEMS[dayIndex % 10];
  const dayBranch = EARTHLY_BRANCHES[dayIndex % 12];
  
  // 时柱计算
  const hourIndex = Math.floor(hour / 2) % 12;
  const hourStem = HEAVENLY_STEMS[(dayIndex * 2 + hourIndex) % 10];
  const hourBranch = EARTHLY_BRANCHES[hourIndex];
  
  return {
    year: `${yearStem}${yearBranch}`,
    month: `${monthStem}${monthBranch}`,
    day: `${dayStem}${dayBranch}`,
    hour: `${hourStem}${hourBranch}`,
    yearZodiac
  };
}

// 分析五行分布
function analyzeFiveElements(stems: string[], branches: string[]): FiveElements {
  const count = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  
  [...stems, ...branches].forEach(char => {
    const element = ELEMENT_MAP[char];
    if (element) count[element as keyof FiveElements]++;
  });
  
  return count;
}

// 生成运势解读
function generateFortuneReading(
  fiveElements: FiveElements, 
  gender: 'male' | 'female',
  season: string,
  yearZodiac: string
): FortuneReading {
  const dominant = Object.entries(fiveElements).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const lacking = Object.entries(fiveElements).filter(([_, count]) => count === 0).map(([element]) => element);
  
  let personality = '';
  let career = '';
  let health = '';
  let wealth = '';
  let relationships = '';
  
  // 根据主导五行分析性格
  switch (dominant) {
    case '木':
      personality = '性格如春木生发，积极向上，富有创造力，但有时过于理想主义。适合从事创新、教育、环保等行业。';
      career = '木旺之人适合在东方发展，春夏季运势更佳。宜从事绿色产业、文化教育等。';
      health = '注意肝胆健康，多接触自然，保持规律作息。';
      break;
    case '火':
      personality = '热情如火，善于表达，具有领导才能，但需控制急躁情绪。适合从事传媒、艺术、销售等。';
      career = '火旺之人适合在南方发展，夏季运势最佳。宜从事能源、娱乐、服务业。';
      health = '注意心血管健康，避免过度兴奋，适度运动。';
      break;
    case '土':
      personality = '稳重踏实，诚信可靠，但有时过于保守。适合从事房地产、农业、管理等。';
      career = '土旺之人四季平衡，适合稳定发展。宜从事实业、建筑、金融等。';
      health = '注意脾胃健康，饮食规律，避免过度思虑。';
      break;
    case '金':
      personality = '理性严谨，执行力强，但有时过于刚硬。适合从事金融、科技、法律等。';
      career = '金旺之人适合在西方发展，秋季运势更佳。宜从事金融、制造、技术等。';
      health = '注意肺部健康，多做有氧运动，保持空气清新。';
      break;
    case '水':
      personality = '智慧灵活，适应性强，但有时过于变化无常。适合从事贸易、旅游、咨询等。';
      career = '水旺之人适合在北方发展，冬季运势更佳。宜从事流通、物流、信息等。';
      health = '注意肾脏健康，避免过度劳累，保持充足睡眠。';
      break;
  }
  
  // 根据缺失五行分析
  if (lacking.length > 0) {
    const lackingElements = lacking.join('、');
    personality += `\n\n命中缺${lackingElements}，建议通过颜色、方位、职业等方式进行补充。`;
  }
  
  // 财运分析
  if (fiveElements.金 > 2) {
    wealth = '金旺财运佳，善于理财投资，但需防范过度投机。';
  } else if (fiveElements.土 > 2) {
    wealth = '土旺积财稳，适合长期投资和实业经营。';
  } else {
    wealth = '财运平稳，需要通过努力和智慧积累财富。';
  }
  
  // 感情分析
  if (gender === 'male') {
    if (fiveElements.火 > 2) {
      relationships = '桃花运旺，异性缘佳，但需注意专一。';
    } else if (fiveElements.水 > 2) {
      relationships = '感情丰富，善解人意，适合找互补性格的伴侣。';
    } else {
      relationships = '感情稳定，宜晚婚，注重精神契合。';
    }
  } else {
    if (fiveElements.水 > 2) {
      relationships = '温柔如水，魅力十足，但需防范烂桃花。';
    } else if (fiveElements.土 > 2) {
      relationships = '贤淑持家，感情专一，是良妻益母型。';
    } else {
      relationships = '独立自主，感情理性，适合找事业型伴侣。';
    }
  }
  
  return {
    overall: `${yearZodiac}年生人，主导五行为${dominant}，在${season}季节出生，整体运势${Math.random() > 0.5 ? '较好' : '平稳'}。`,
    personality,
    career,
    health,
    wealth,
    relationships,
    luckyElements: lacking.length > 0 ? lacking : [dominant],
    warnings: ['避免冲动决策', '注意身体健康', '维护人际关系']
  };
}

const BaziAnalysisComponent: React.FC = () => {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear() - 25,
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    hour: 12,
    gender: 'male' as 'male' | 'female',
    name: ''
  });
  
  const [analysis, setAnalysis] = useState<BaziAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'result' | 'detail'>('input');
  const resultsRef = useRef<HTMLDivElement>(null);

  // 执行八字分析
  const performAnalysis = async () => {
    if (!formData.name.trim()) {
      alert('请输入姓名');
      return;
    }
    
    setIsAnalyzing(true);
    
    // 模拟分析过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { year, month, day, hour } = formData;
    const stemsBranches = calculateStemsBranches(year, month, day, hour);
    const stems = [stemsBranches.year[0], stemsBranches.month[0], stemsBranches.day[0], stemsBranches.hour[0]];
    const branches = [stemsBranches.year[1], stemsBranches.month[1], stemsBranches.day[1], stemsBranches.hour[1]];
    const fiveElements = analyzeFiveElements(stems, branches);
    const season = SEASON_MAP[month];
    const fortuneReading = generateFortuneReading(fiveElements, formData.gender, season, stemsBranches.yearZodiac);
    
    const result: BaziAnalysis = {
      name: formData.name,
      birthDate: new Date(year, month - 1, day, hour),
      gender: formData.gender,
      fourPillars: {
        year: stemsBranches.year,
        month: stemsBranches.month,
        day: stemsBranches.day,
        hour: stemsBranches.hour
      },
      fiveElements,
      dominantElement: Object.entries(fiveElements).reduce((a, b) => a[1] > b[1] ? a : b)[0] as keyof FiveElements,
      zodiacSign: stemsBranches.yearZodiac,
      season,
      fortuneReading,
      advice: {
        career: fortuneReading.career,
        health: fortuneReading.health,
        wealth: fortuneReading.wealth,
        relationships: fortuneReading.relationships,
        general: '保持平常心，顺应自然规律，积德行善，必有好运。'
      },
      compatibleElements: fortuneReading.luckyElements,
      luckyNumbers: [1, 6, 8].map(n => n + Math.floor(Math.random() * 9)),
      luckyColors: ['红色', '金色', '绿色', '蓝色', '黄色'].slice(0, 3),
      luckyDirections: ['东', '南', '西', '北'].slice(0, 2),
      yearFortune: Math.floor(Math.random() * 40) + 60 // 60-100分
    };
    
    setAnalysis(result);
    setIsAnalyzing(false);
    setActiveTab('result');
    
    // 滚动到结果区域
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setActiveTab('input');
    setFormData({
      year: new Date().getFullYear() - 25,
      month: new Date().getMonth() + 1,
      day: new Date().getDate(),
      hour: 12,
      gender: 'male',
      name: ''
    });
  };

  return (
    <div className="zen-container fade-in">
      {/* 标题区域 */}
      <div className="zen-card texture-paper zen-text-center">
        <div className="zen-icon zen-float">☯️</div>
        <h1 className="zen-title">命理八字分析</h1>
        <div className="zen-text-poetry">
          "天机不可泄露，命理可窥一斑<br/>
          生辰八字蕴含的人生密码"
        </div>
      </div>

      {/* 导航标签 */}
      <div className="zen-card">
        <div style={{
          display: 'flex',
          gap: 'var(--space-verse)',
          marginBottom: 'var(--space-stanza)',
          borderBottom: '2px solid var(--earth-golden)20'
        }}>
          {[
            { id: 'input', label: '信息输入', icon: '📝' },
            { id: 'result', label: '分析结果', icon: '📊' },
            { id: 'detail', label: '详细解读', icon: '📖' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              disabled={tab.id !== 'input' && !analysis}
              style={{
                padding: 'var(--space-verse) var(--space-stanza)',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid var(--earth-golden)' : '3px solid transparent',
                background: activeTab === tab.id ? 'var(--earth-golden)10' : 'transparent',
                color: activeTab === tab.id ? 'var(--earth-golden)' : 'var(--ink-medium)',
                fontSize: 'var(--text-base)',
                fontWeight: activeTab === tab.id ? '700' : '400',
                cursor: tab.id === 'input' || analysis ? 'pointer' : 'not-allowed',
                opacity: tab.id === 'input' || analysis ? 1 : 0.5,
                transition: 'all var(--duration-smooth)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-breath)'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 信息输入区域 */}
      {activeTab === 'input' && (
        <div className="zen-card texture-silk">
          <h3 className="zen-subtitle">请输入您的出生信息</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-verse)',
            marginBottom: 'var(--space-stanza)'
          }}>
            {/* 姓名 */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--space-breath)',
                fontSize: 'var(--text-small)',
                fontWeight: '600',
                color: 'var(--ink-thick)'
              }}>
                姓名 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="请输入您的姓名"
                style={{
                  width: '100%',
                  padding: 'var(--space-verse)',
                  border: '2px solid var(--earth-golden)40',
                  borderRadius: 'var(--radius-pebble)',
                  fontSize: 'var(--text-base)',
                  background: 'var(--paper-modern)',
                  color: 'var(--ink-thick)',
                  outline: 'none',
                  transition: 'all var(--duration-smooth)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--earth-golden)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--earth-golden)20'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--earth-golden)40'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* 性别 */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--space-breath)',
                fontSize: 'var(--text-small)',
                fontWeight: '600',
                color: 'var(--ink-thick)'
              }}>
                性别 *
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-verse)' }}>
                {['male', 'female'].map(gender => (
                  <button
                    key={gender}
                    onClick={() => setFormData({...formData, gender: gender as 'male' | 'female'})}
                    style={{
                      padding: 'var(--space-verse)',
                      border: `2px solid ${formData.gender === gender ? 'var(--earth-golden)' : 'var(--earth-golden)40'}`,
                      borderRadius: 'var(--radius-pebble)',
                      background: formData.gender === gender ? 'var(--earth-golden)10' : 'transparent',
                      color: formData.gender === gender ? 'var(--earth-golden)' : 'var(--ink-medium)',
                      fontSize: 'var(--text-base)',
                      cursor: 'pointer',
                      transition: 'all var(--duration-smooth)',
                      flex: 1
                    }}
                  >
                    {gender === 'male' ? '👨 男' : '👩 女'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 出生日期 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 'var(--space-verse)',
            marginBottom: 'var(--space-stanza)'
          }}>
            {/* 年 */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--space-breath)',
                fontSize: 'var(--text-small)',
                fontWeight: '600',
                color: 'var(--ink-thick)'
              }}>
                出生年份
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value) || new Date().getFullYear()})}
                min="1900"
                max={new Date().getFullYear()}
                style={{
                  width: '100%',
                  padding: 'var(--space-verse)',
                  border: '2px solid var(--earth-golden)40',
                  borderRadius: 'var(--radius-pebble)',
                  fontSize: 'var(--text-base)',
                  background: 'var(--paper-modern)',
                  color: 'var(--ink-thick)',
                  outline: 'none',
                  transition: 'all var(--duration-smooth)'
                }}
              />
            </div>

            {/* 月 */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--space-breath)',
                fontSize: 'var(--text-small)',
                fontWeight: '600',
                color: 'var(--ink-thick)'
              }}>
                出生月份
              </label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
                style={{
                  width: '100%',
                  padding: 'var(--space-verse)',
                  border: '2px solid var(--earth-golden)40',
                  borderRadius: 'var(--radius-pebble)',
                  fontSize: 'var(--text-base)',
                  background: 'var(--paper-modern)',
                  color: 'var(--ink-thick)',
                  outline: 'none',
                  transition: 'all var(--duration-smooth)'
                }}
              >
                {Array.from({length: 12}, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}月</option>
                ))}
              </select>
            </div>

            {/* 日 */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--space-breath)',
                fontSize: 'var(--text-small)',
                fontWeight: '600',
                color: 'var(--ink-thick)'
              }}>
                出生日期
              </label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({...formData, day: parseInt(e.target.value)})}
                style={{
                  width: '100%',
                  padding: 'var(--space-verse)',
                  border: '2px solid var(--earth-golden)40',
                  borderRadius: 'var(--radius-pebble)',
                  fontSize: 'var(--text-base)',
                  background: 'var(--paper-modern)',
                  color: 'var(--ink-thick)',
                  outline: 'none',
                  transition: 'all var(--duration-smooth)'
                }}
              >
                {Array.from({length: 31}, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}日</option>
                ))}
              </select>
            </div>

            {/* 时 */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: 'var(--space-breath)',
                fontSize: 'var(--text-small)',
                fontWeight: '600',
                color: 'var(--ink-thick)'
              }}>
                出生时辰
              </label>
              <select
                value={formData.hour}
                onChange={(e) => setFormData({...formData, hour: parseInt(e.target.value)})}
                style={{
                  width: '100%',
                  padding: 'var(--space-verse)',
                  border: '2px solid var(--earth-golden)40',
                  borderRadius: 'var(--radius-pebble)',
                  fontSize: 'var(--text-base)',
                  background: 'var(--paper-modern)',
                  color: 'var(--ink-thick)',
                  outline: 'none',
                  transition: 'all var(--duration-smooth)'
                }}
              >
                {Array.from({length: 24}, (_, i) => (
                  <option key={i} value={i}>{i}点 ({EARTHLY_BRANCHES[Math.floor(i/2)]}时)</option>
                ))}
              </select>
            </div>
          </div>

          {/* 分析按钮 */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={performAnalysis}
              disabled={isAnalyzing || !formData.name.trim()}
              className="zen-button hover-lift"
              style={{
                padding: 'var(--space-stanza) var(--space-chapter)',
                background: isAnalyzing ? 'var(--ink-light)' : 'var(--gradient-sunrise)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sun)',
                fontSize: 'var(--text-title)',
                fontWeight: '700',
                cursor: isAnalyzing || !formData.name.trim() ? 'not-allowed' : 'pointer',
                opacity: isAnalyzing || !formData.name.trim() ? 0.6 : 1,
                transition: 'all var(--duration-smooth)',
                position: 'relative',
                minWidth: '200px'
              }}
            >
              {isAnalyzing ? (
                <>
                  <div className="zen-loader" style={{ display: 'inline-flex', marginRight: 'var(--space-breath)' }}>
                    <span>●</span><span>●</span><span>●</span>
                  </div>
                  正在分析命理...
                </>
              ) : (
                <>
                  ✨ 开始分析八字
                </>
              )}
            </button>
          </div>

          {/* 说明文字 */}
          <div className="zen-card" style={{
            marginTop: 'var(--space-stanza)',
            background: 'var(--gradient-water)',
            border: '1px solid var(--water-essence)40'
          }}>
            <h4 style={{ 
              color: 'var(--water-essence)', 
              marginBottom: 'var(--space-breath)' 
            }}>
              📋 使用说明
            </h4>
            <ul style={{
              fontSize: 'var(--text-small)',
              color: 'var(--ink-medium)',
              lineHeight: 'var(--leading-relaxed)',
              paddingLeft: 'var(--space-verse)'
            }}>
              <li>请确保出生时间的准确性，时辰对八字分析影响很大</li>
              <li>如不确定具体时辰，可选择大概时间段</li>
              <li>本分析基于传统命理学，仅供参考娱乐</li>
              <li>人生命运掌握在自己手中，积极面对生活</li>
            </ul>
          </div>
        </div>
      )}

      {/* 分析结果区域 */}
      {activeTab === 'result' && analysis && (
        <div ref={resultsRef} className="fade-in">
          {/* 基本信息卡片 */}
          <div className="zen-card texture-jade">
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-stanza)' }}>
              <h2 style={{ 
                color: 'var(--earth-golden)', 
                fontSize: 'var(--text-heading)',
                marginBottom: 'var(--space-breath)'
              }}>
                {analysis.name} 的命理分析
              </h2>
              <div style={{
                fontSize: 'var(--text-base)',
                color: 'var(--ink-medium)',
                marginBottom: 'var(--space-verse)'
              }}>
                生于 {analysis.birthDate.getFullYear()}年{analysis.birthDate.getMonth() + 1}月{analysis.birthDate.getDate()}日 
                {analysis.birthDate.getHours()}时 ({analysis.season}季)
              </div>
              <div style={{
                fontSize: 'var(--text-large)',
                color: 'var(--earth-golden)',
                fontWeight: '700'
              }}>
                属{analysis.zodiacSign} · 主导五行：{analysis.dominantElement}
              </div>
            </div>

            {/* 四柱八字 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 'var(--space-verse)',
              marginBottom: 'var(--space-stanza)'
            }}>
              {Object.entries(analysis.fourPillars).map(([pillar, chars]) => (
                <div
                  key={pillar}
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-verse)',
                    background: 'var(--gradient-zen-mist)',
                    borderRadius: 'var(--radius-pebble)',
                    border: '2px solid var(--earth-golden)30'
                  }}
                >
                  <div style={{
                    fontSize: 'var(--text-small)',
                    color: 'var(--ink-medium)',
                    marginBottom: 'var(--space-breath)'
                  }}>
                    {pillar === 'year' && '年柱'}
                    {pillar === 'month' && '月柱'}
                    {pillar === 'day' && '日柱'}
                    {pillar === 'hour' && '时柱'}
                  </div>
                  <div style={{
                    fontSize: 'var(--text-title)',
                    fontWeight: '700',
                    color: 'var(--earth-golden)',
                    fontFamily: 'var(--font-display)'
                  }}>
                    {chars}
                  </div>
                  <div style={{
                    fontSize: 'var(--text-micro)',
                    color: 'var(--ink-light)',
                    marginTop: 'var(--space-breath)'
                  }}>
                    {ELEMENT_MAP[chars[0]]}{ELEMENT_MAP[chars[1]]}
                  </div>
                </div>
              ))}
            </div>

            {/* 五行分布 */}
            <div>
              <h4 style={{ 
                color: 'var(--earth-golden)', 
                marginBottom: 'var(--space-verse)',
                textAlign: 'center'
              }}>
                五行分布
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 'var(--space-breath)'
              }}>
                {Object.entries(analysis.fiveElements).map(([element, count]) => (
                  <div
                    key={element}
                    style={{
                      textAlign: 'center',
                      padding: 'var(--space-breath)',
                      background: count > 0 ? 'var(--earth-golden)20' : 'var(--ink-mist)',
                      borderRadius: 'var(--radius-hair)',
                      border: `1px solid ${count > 0 ? 'var(--earth-golden)' : 'var(--ink-light)'}`,
                      opacity: count > 0 ? 1 : 0.5
                    }}
                  >
                    <div style={{
                      fontSize: 'var(--text-small)',
                      fontWeight: '700',
                      color: count > 0 ? 'var(--earth-golden)' : 'var(--ink-medium)'
                    }}>
                      {element}
                    </div>
                    <div style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: '700',
                      color: count > 0 ? 'var(--earth-golden)' : 'var(--ink-light)'
                    }}>
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 运势概览 */}
          <div className="zen-card texture-silk">
            <h3 className="zen-subtitle">整体运势 ({analysis.yearFortune}分)</h3>
            
            {/* 运势评分条 */}
            <div style={{
              marginBottom: 'var(--space-stanza)',
              background: 'var(--ink-mist)',
              borderRadius: 'var(--radius-pebble)',
              height: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  width: `${analysis.yearFortune}%`,
                  height: '100%',
                  background: analysis.yearFortune >= 80 ? 'var(--gradient-sunrise)' : 
                             analysis.yearFortune >= 60 ? 'var(--gradient-mountain)' : 'var(--gradient-water)',
                  borderRadius: 'var(--radius-pebble)',
                  transition: 'width 2s ease-out',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  fontSize: 'var(--text-small)',
                  fontWeight: '700'
                }}>
                  {analysis.yearFortune}分
                </div>
              </div>
            </div>

            <div style={{
              fontSize: 'var(--text-base)',
              color: 'var(--ink-thick)',
              lineHeight: 'var(--leading-relaxed)',
              marginBottom: 'var(--space-stanza)'
            }}>
              {analysis.fortuneReading.overall}
            </div>

            {/* 幸运元素 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-verse)'
            }}>
              <div>
                <h4 style={{ color: 'var(--fire-phoenix)', marginBottom: 'var(--space-breath)' }}>
                  🍀 幸运数字
                </h4>
                <div style={{ display: 'flex', gap: 'var(--space-breath)' }}>
                  {analysis.luckyNumbers.map(num => (
                    <span
                      key={num}
                      style={{
                        display: 'inline-block',
                        width: '32px',
                        height: '32px',
                        background: 'var(--fire-phoenix)',
                        color: 'white',
                        borderRadius: '50%',
                        textAlign: 'center',
                        lineHeight: '32px',
                        fontSize: 'var(--text-small)',
                        fontWeight: '700'
                      }}
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ color: 'var(--wood-spring)', marginBottom: 'var(--space-breath)' }}>
                  🎨 幸运颜色
                </h4>
                <div style={{ display: 'flex', gap: 'var(--space-breath)', flexWrap: 'wrap' }}>
                  {analysis.luckyColors.map(color => (
                    <span
                      key={color}
                      style={{
                        padding: 'var(--space-breath) var(--space-verse)',
                        background: 'var(--wood-spring)20',
                        color: 'var(--wood-spring)',
                        borderRadius: 'var(--radius-pebble)',
                        fontSize: 'var(--text-small)',
                        fontWeight: '600',
                        border: '1px solid var(--wood-spring)40'
                      }}
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ color: 'var(--water-ocean)', marginBottom: 'var(--space-breath)' }}>
                  🧭 幸运方位
                </h4>
                <div style={{ display: 'flex', gap: 'var(--space-breath)' }}>
                  {analysis.luckyDirections.map(direction => (
                    <span
                      key={direction}
                      style={{
                        padding: 'var(--space-breath) var(--space-verse)',
                        background: 'var(--water-ocean)20',
                        color: 'var(--water-ocean)',
                        borderRadius: 'var(--radius-pebble)',
                        fontSize: 'var(--text-small)',
                        fontWeight: '600',
                        border: '1px solid var(--water-ocean)40'
                      }}
                    >
                      {direction}方
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-verse)',
            justifyContent: 'center',
            marginTop: 'var(--space-stanza)'
          }}>
            <button
              onClick={() => setActiveTab('detail')}
              className="zen-button hover-lift"
              style={{
                padding: 'var(--space-verse) var(--space-stanza)',
                background: 'var(--gradient-mountain)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-pebble)',
                fontSize: 'var(--text-base)',
                fontWeight: '600'
              }}
            >
              📖 查看详细解读
            </button>
            
            <button
              onClick={resetAnalysis}
              className="zen-button-ghost hover-lift"
              style={{
                padding: 'var(--space-verse) var(--space-stanza)',
                background: 'transparent',
                color: 'var(--ink-medium)',
                border: '2px solid var(--ink-light)',
                borderRadius: 'var(--radius-pebble)',
                fontSize: 'var(--text-base)',
                fontWeight: '600'
              }}
            >
              🔄 重新分析
            </button>
          </div>
        </div>
      )}

      {/* 详细解读区域 */}
      {activeTab === 'detail' && analysis && (
        <div className="fade-in">
          <div className="zen-card texture-ancient-paper">
            <h3 className="zen-subtitle">详细命理解读</h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 'var(--space-stanza)'
            }}>
              {/* 性格分析 */}
              <div>
                <h4 style={{ 
                  color: 'var(--fire-phoenix)', 
                  marginBottom: 'var(--space-verse)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-breath)'
                }}>
                  👤 性格特质
                </h4>
                <div style={{
                  padding: 'var(--space-verse)',
                  background: 'var(--fire-phoenix)10',
                  borderRadius: 'var(--radius-pebble)',
                  border: '1px solid var(--fire-phoenix)30',
                  fontSize: 'var(--text-base)',
                  lineHeight: 'var(--leading-relaxed)',
                  color: 'var(--ink-thick)'
                }}>
                  {analysis.fortuneReading.personality}
                </div>
              </div>

              {/* 事业运 */}
              <div>
                <h4 style={{ 
                  color: 'var(--wood-spring)', 
                  marginBottom: 'var(--space-verse)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-breath)'
                }}>
                  💼 事业发展
                </h4>
                <div style={{
                  padding: 'var(--space-verse)',
                  background: 'var(--wood-spring)10',
                  borderRadius: 'var(--radius-pebble)',
                  border: '1px solid var(--wood-spring)30',
                  fontSize: 'var(--text-base)',
                  lineHeight: 'var(--leading-relaxed)',
                  color: 'var(--ink-thick)'
                }}>
                  {analysis.fortuneReading.career}
                </div>
              </div>

              {/* 财运 */}
              <div>
                <h4 style={{ 
                  color: 'var(--earth-golden)', 
                  marginBottom: 'var(--space-verse)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-breath)'
                }}>
                  💰 财运分析
                </h4>
                <div style={{
                  padding: 'var(--space-verse)',
                  background: 'var(--earth-golden)10',
                  borderRadius: 'var(--radius-pebble)',
                  border: '1px solid var(--earth-golden)30',
                  fontSize: 'var(--text-base)',
                  lineHeight: 'var(--leading-relaxed)',
                  color: 'var(--ink-thick)'
                }}>
                  {analysis.fortuneReading.wealth}
                </div>
              </div>

              {/* 感情运 */}
              <div>
                <h4 style={{ 
                  color: 'var(--water-ocean)', 
                  marginBottom: 'var(--space-verse)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-breath)'
                }}>
                  💕 感情运势
                </h4>
                <div style={{
                  padding: 'var(--space-verse)',
                  background: 'var(--water-ocean)10',
                  borderRadius: 'var(--radius-pebble)',
                  border: '1px solid var(--water-ocean)30',
                  fontSize: 'var(--text-base)',
                  lineHeight: 'var(--leading-relaxed)',
                  color: 'var(--ink-thick)'
                }}>
                  {analysis.fortuneReading.relationships}
                </div>
              </div>

              {/* 健康运 */}
              <div>
                <h4 style={{ 
                  color: 'var(--metal-essence)', 
                  marginBottom: 'var(--space-verse)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-breath)'
                }}>
                  🏥 健康提醒
                </h4>
                <div style={{
                  padding: 'var(--space-verse)',
                  background: 'var(--metal-essence)10',
                  borderRadius: 'var(--radius-pebble)',
                  border: '1px solid var(--metal-essence)30',
                  fontSize: 'var(--text-base)',
                  lineHeight: 'var(--leading-relaxed)',
                  color: 'var(--ink-thick)'
                }}>
                  {analysis.fortuneReading.health}
                </div>
              </div>
            </div>

            {/* 综合建议 */}
            <div style={{
              marginTop: 'var(--space-stanza)',
              padding: 'var(--space-stanza)',
              background: 'var(--gradient-zen-mist)',
              borderRadius: 'var(--radius-sun)',
              border: '2px solid var(--earth-golden)40'
            }}>
              <h4 style={{ 
                color: 'var(--earth-golden)', 
                marginBottom: 'var(--space-verse)',
                textAlign: 'center'
              }}>
                🌟 人生建议
              </h4>
              <div style={{
                fontSize: 'var(--text-base)',
                lineHeight: 'var(--leading-relaxed)',
                color: 'var(--ink-thick)',
                textAlign: 'center',
                fontStyle: 'italic'
              }}>
                {analysis.advice.general}
              </div>
            </div>

            {/* 注意事项 */}
            <div style={{
              marginTop: 'var(--space-verse)',
              padding: 'var(--space-verse)',
              background: 'var(--gradient-water)',
              borderRadius: 'var(--radius-pebble)',
              border: '1px solid var(--water-essence)40'
            }}>
              <h4 style={{ 
                color: 'var(--water-essence)', 
                marginBottom: 'var(--space-breath)',
                fontSize: 'var(--text-small)'
              }}>
                ⚠️ 注意事项
              </h4>
              <ul style={{
                fontSize: 'var(--text-small)',
                color: 'var(--ink-medium)',
                lineHeight: 'var(--leading-relaxed)',
                paddingLeft: 'var(--space-verse)'
              }}>
                {analysis.fortuneReading.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
                <li>本分析基于传统命理学理论，仅供参考娱乐</li>
                <li>人的命运并非完全由生辰决定，后天努力同样重要</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaziAnalysisComponent; 
 
 