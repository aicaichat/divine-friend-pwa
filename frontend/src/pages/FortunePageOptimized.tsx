import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics } from '../hooks/useAnalytics';

interface FortunePageOptimizedProps {
  onNavigate: (page: string) => void;
}

interface BraceletItem {
  id: string;
  name: string;
  material: string;
  effect: string;
  price: number;
  image: string;
  description: string;
  energy: number;
}

interface ZodiacInfo {
  sign: string;
  today: string;
  tomorrow: string;
  lucky_number: number;
  lucky_color: string;
  advice: string;
}

interface BlessingCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
}

const FortunePageOptimized: React.FC<FortunePageOptimizedProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'bracelets' | 'blessing' | 'zodiac' | 'fengshui'>('bracelets');
  const [selectedBracelet, setSelectedBracelet] = useState<BraceletItem | null>(null);
  const [userZodiac, setUserZodiac] = useState<string>('双子座');
  const [showBlessingModal, setShowBlessingModal] = useState(false);
  const [selectedBlessing, setSelectedBlessing] = useState<string>('');

  const analytics = useAnalytics();

  // 开运手串数据
  const bracelets: BraceletItem[] = [
    {
      id: 'bracelet001',
      name: '小叶紫檀开光手串',
      material: '小叶紫檀',
      effect: '辟邪护身，增强贵人运',
      price: 299,
      image: '📿',
      description: '选用印度老料小叶紫檀，经寺庙高僧开光加持，具有强大的护身功效',
      energy: 95
    },
    {
      id: 'bracelet002',
      name: '黄金转运珠手串',
      material: '黄金+天然水晶',
      effect: '招财进宝，转运化煞',
      price: 888,
      image: '✨',
      description: '纯金转运珠搭配天然水晶，助力财运亨通，事业顺遂',
      energy: 90
    },
    {
      id: 'bracelet003',
      name: '和田玉平安扣',
      material: '新疆和田玉',
      effect: '平安健康，家庭和睦',
      price: 568,
      image: '🔮',
      description: '天然和田玉雕刻，温润如脂，寓意平安如意',
      energy: 88
    },
    {
      id: 'bracelet004',
      name: '天珠九眼护身符',
      material: '天然九眼天珠',
      effect: '消灾解厄，增强智慧',
      price: 1299,
      image: '👁️',
      description: '西藏传统九眼天珠，具有神秘的保护力量',
      energy: 98
    },
    {
      id: 'bracelet005',
      name: '沉香木念珠',
      material: '天然沉香木',
      effect: '静心安神，提升修行',
      price: 699,
      image: '🌿',
      description: '千年沉香木制作，香气怡人，有助冥想修行',
      energy: 85
    },
    {
      id: 'bracelet006',
      name: '朱砂辟邪手串',
      material: '天然朱砂',
      effect: '强力辟邪，镇宅化煞',
      price: 388,
      image: '🔴',
      description: '纯天然朱砂制作，红色光泽，辟邪效果显著',
      energy: 92
    }
  ];

  // 祈福分类
  const blessingCategories: BlessingCategory[] = [
    { id: 'health', name: '健康祈福', icon: '🏥', description: '祈求身体健康，远离病痛', count: 1248 },
    { id: 'wealth', name: '财运祈福', icon: '💰', description: '祈求财源广进，生意兴隆', count: 2156 },
    { id: 'career', name: '事业祈福', icon: '💼', description: '祈求事业顺利，升职加薪', count: 987 },
    { id: 'love', name: '姻缘祈福', icon: '💕', description: '祈求姻缘美满，家庭和睦', count: 1543 },
    { id: 'study', name: '学业祈福', icon: '📚', description: '祈求学业进步，考试顺利', count: 678 },
    { id: 'travel', name: '出行祈福', icon: '🛡️', description: '祈求出行平安，旅途顺遂', count: 432 }
  ];

  // 星座运势
  const zodiacSigns = [
    '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
    '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'
  ];

  const getZodiacInfo = (sign: string): ZodiacInfo => {
    const zodiacData: { [key: string]: ZodiacInfo } = {
      '双子座': {
        sign: '双子座',
        today: '今日运势较佳，适合进行沟通交流和学习新知识。财运方面有小幅提升，感情运势平稳。',
        tomorrow: '明日需注意人际关系，避免因言语不当引起误会。工作上会有新的机遇出现。',
        lucky_number: 7,
        lucky_color: '淡蓝色',
        advice: '保持开放的心态，多倾听他人意见，会有意想不到的收获。'
      },
      '白羊座': {
        sign: '白羊座',
        today: '活力满满的一天，适合开展新项目。贵人运强，容易得到他人帮助。',
        tomorrow: '需要控制情绪，避免冲动决策。健康方面注意休息。',
        lucky_number: 3,
        lucky_color: '火红色',
        advice: '积极进取的同时，也要学会耐心等待时机。'
      }
    };
    
    return zodiacData[sign] || zodiacData['双子座'];
  };

  // 风水知识
  const fengShuiTips = [
    {
      title: '家居风水布局',
      content: '客厅应保持整洁明亮，沙发背后要有实墙支撑，象征有靠山。',
      icon: '🏠'
    },
    {
      title: '办公桌风水',
      content: '办公桌面向门口，但不要正对，左边放植物，右边放水晶。',
      icon: '💻'
    },
    {
      title: '卧室风水禁忌',
      content: '床头不宜靠窗，镜子不要正对床铺，保持空气流通。',
      icon: '🛏️'
    },
    {
      title: '财位布置',
      content: '在客厅45度角位置放置绿植或水晶，有助于聚财。',
      icon: '💎'
    }
  ];

  useEffect(() => {
    analytics.trackPageView('fortune', '开运页面');
    // 获取用户星座信息
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      try {
        const userInfo = JSON.parse(savedUserInfo);
        if (userInfo.zodiac) {
          setUserZodiac(userInfo.zodiac);
        }
      } catch (error) {
        console.error('Error loading user zodiac:', error);
      }
    }
  }, []);

  const handleBraceletPurchase = (bracelet: BraceletItem) => {
    analytics.trackUserAction('bracelet_purchase_intent', {
      bracelet_id: bracelet.id,
      bracelet_name: bracelet.name,
      price: bracelet.price
    });
    alert(`您选择了${bracelet.name}，即将跳转到购买页面...`);
  };

  const handleBlessing = (category: string) => {
    setSelectedBlessing(category);
    setShowBlessingModal(true);
    analytics.trackUserAction('blessing_request', { category });
  };

  const renderBraceletsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bracelets.map((bracelet) => (
          <motion.div
            key={bracelet.id}
            className="zen-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start space-x-4">
              <div className="text-4xl">{bracelet.image}</div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{bracelet.name}</h4>
                  <span className="text-lg font-bold text-orange-600">¥{bracelet.price}</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">材质:</span> {bracelet.material}</div>
                  <div><span className="text-gray-600">功效:</span> {bracelet.effect}</div>
                  
                  {/* 能量条 */}
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 text-xs">能量:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${bracelet.energy}%` }}
                      />
                    </div>
                    <span className="text-xs text-orange-600">{bracelet.energy}%</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{bracelet.description}</p>
                
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => setSelectedBracelet(bracelet)}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                  >
                    查看详情
                  </button>
                  <button
                    onClick={() => handleBraceletPurchase(bracelet)}
                    className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-orange-600 transition-colors"
                  >
                    立即购买
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderBlessingTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 祈福统计 */}
      <div className="zen-card">
        <h3 className="text-lg font-semibold mb-4">祈福统计</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">1,247</div>
            <div className="text-sm text-gray-600">今日祈福</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">28,956</div>
            <div className="text-sm text-gray-600">总祈福数</div>
          </div>
        </div>
      </div>

      {/* 祈福分类 */}
      <div className="grid grid-cols-2 gap-3">
        {blessingCategories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => handleBlessing(category.name)}
            className="zen-card text-left hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-3xl">{category.icon}</span>
              <div>
                <h4 className="font-medium text-gray-900">{category.name}</h4>
                <p className="text-xs text-gray-500">{category.count}人参与</p>
              </div>
            </div>
            <p className="text-xs text-gray-600">{category.description}</p>
          </motion.button>
        ))}
      </div>

      {/* 今日祈福榜 */}
      <div className="zen-card">
        <h3 className="text-lg font-semibold mb-4">今日祈福榜</h3>
        <div className="space-y-3">
          {[
            { rank: 1, name: '善心居士', category: '健康祈福', time: '08:30' },
            { rank: 2, name: '慈悲心', category: '财运祈福', time: '09:15' },
            { rank: 3, name: '觉悟者', category: '事业祈福', time: '10:22' },
            { rank: 4, name: '清净心', category: '姻缘祈福', time: '11:45' },
            { rank: 5, name: '智慧光', category: '学业祈福', time: '14:30' }
          ].map((item) => (
            <div key={item.rank} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  item.rank === 1 ? 'bg-yellow-500' : item.rank === 2 ? 'bg-gray-400' : item.rank === 3 ? 'bg-orange-400' : 'bg-blue-400'
                }`}>
                  {item.rank}
                </span>
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.category}</div>
                </div>
              </div>
              <span className="text-xs text-gray-500">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderZodiacTab = () => {
    const zodiacInfo = getZodiacInfo(userZodiac);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* 星座选择 */}
        <div className="zen-card">
          <h3 className="text-lg font-semibold mb-4">选择星座</h3>
          <div className="grid grid-cols-4 gap-2">
            {zodiacSigns.map((sign) => (
              <button
                key={sign}
                onClick={() => setUserZodiac(sign)}
                className={`p-2 rounded-lg text-sm transition-colors ${
                  userZodiac === sign
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sign}
              </button>
            ))}
          </div>
        </div>

        {/* 今日运势 */}
        <div className="zen-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">🌟</span>
            {zodiacInfo.sign} 今日运势
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">{zodiacInfo.today}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">幸运数字</div>
              <div className="text-2xl font-bold text-orange-600">{zodiacInfo.lucky_number}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">幸运颜色</div>
              <div className="text-lg font-medium text-purple-600">{zodiacInfo.lucky_color}</div>
            </div>
          </div>
        </div>

        {/* 明日预测 */}
        <div className="zen-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">🔮</span>
            明日预测
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">{zodiacInfo.tomorrow}</p>
        </div>

        {/* 专属建议 */}
        <div className="zen-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">💡</span>
            专属建议
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed">{zodiacInfo.advice}</p>
        </div>

        {/* 本周运势图表 */}
        <div className="zen-card">
          <h3 className="text-lg font-semibold mb-4">本周运势走向</h3>
          <div className="space-y-3">
            {['综合运势', '事业运势', '财运运势', '感情运势', '健康运势'].map((item, index) => {
              const value = Math.floor(Math.random() * 40) + 60; // 60-100随机值
              return (
                <div key={item} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 w-16">{item}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-sm text-orange-600 w-8">{value}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderFengShuiTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 风水知识 */}
      <div className="space-y-4">
        {fengShuiTips.map((tip, index) => (
          <motion.div
            key={index}
            className="zen-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start space-x-3">
              <span className="text-3xl">{tip.icon}</span>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{tip.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{tip.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 今日宜忌 */}
      <div className="zen-card">
        <h3 className="text-lg font-semibold mb-4">今日宜忌</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-green-600 font-medium mb-2 flex items-center">
              <span className="mr-1">✅</span> 宜
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 开业开张</li>
              <li>• 签订合同</li>
              <li>• 搬家入宅</li>
              <li>• 投资理财</li>
            </ul>
          </div>
          <div>
            <h4 className="text-red-600 font-medium mb-2 flex items-center">
              <span className="mr-1">❌</span> 忌
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 动土施工</li>
              <li>• 重大决策</li>
              <li>• 借贷放款</li>
              <li>• 长途出行</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 风水罗盘 */}
      <div className="zen-card text-center">
        <h3 className="text-lg font-semibold mb-4">今日方位指南</h3>
        <div className="relative w-32 h-32 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-yellow-400 rounded-full"></div>
          <div className="absolute inset-2 border-2 border-orange-300 rounded-full"></div>
          <div className="absolute inset-4 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">🧭</span>
          </div>
          {/* 方位标识 */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs font-bold">北</div>
          <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 text-xs font-bold">东</div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-bold">南</div>
          <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 text-xs font-bold">西</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-green-50 p-2 rounded">
            <div className="text-green-600 font-medium">财位</div>
            <div className="text-green-700">东南方</div>
          </div>
          <div className="bg-red-50 p-2 rounded">
            <div className="text-red-600 font-medium">忌方</div>
            <div className="text-red-700">西北方</div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--zen-bg-primary)',
      padding: 'var(--zen-space-xl) var(--zen-space-lg) 100px',
      position: 'relative'
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255, 165, 0, 0.05) 0%, transparent 50%)',
        zIndex: -1
      }} />

      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* 标题 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ fontSize: '3rem', marginBottom: 'var(--zen-space-lg)' }}
          >
            🎊
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">开运中心</h1>
          <p className="text-gray-600">手串、祈福、星座、风水一站式开运服务</p>
        </motion.div>

        {/* 标签导航 */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-1">
          <div className="grid grid-cols-4 gap-1">
            {[
              { key: 'bracelets', icon: '📿', label: '开运手串' },
              { key: 'blessing', icon: '🙏', label: '祈福许愿' },
              { key: 'zodiac', icon: '⭐', label: '星座运势' },
              { key: 'fengshui', icon: '🧭', label: '风水指南' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`p-3 rounded-lg text-center transition-all ${
                  activeTab === tab.key
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="text-lg mb-1">{tab.icon}</div>
                <div className="text-xs">{tab.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="min-h-[500px]">
          {activeTab === 'bracelets' && renderBraceletsTab()}
          {activeTab === 'blessing' && renderBlessingTab()}
          {activeTab === 'zodiac' && renderZodiacTab()}
          {activeTab === 'fengshui' && renderFengShuiTab()}
        </div>
      </div>

      {/* 手串详情模态框 */}
      <AnimatePresence>
        {selectedBracelet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedBracelet(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 m-4 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="text-6xl mb-3">{selectedBracelet.image}</div>
                <h3 className="text-xl font-bold">{selectedBracelet.name}</h3>
                <div className="text-2xl font-bold text-orange-600 mt-2">¥{selectedBracelet.price}</div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div><strong>材质:</strong> {selectedBracelet.material}</div>
                <div><strong>功效:</strong> {selectedBracelet.effect}</div>
                <div><strong>详情:</strong> {selectedBracelet.description}</div>
                
                <div className="flex items-center space-x-2">
                  <strong>能量等级:</strong>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
                      style={{ width: `${selectedBracelet.energy}%` }}
                    />
                  </div>
                  <span className="text-orange-600 font-bold">{selectedBracelet.energy}%</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedBracelet(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg"
                >
                  关闭
                </button>
                <button
                  onClick={() => {
                    handleBraceletPurchase(selectedBracelet);
                    setSelectedBracelet(null);
                  }}
                  className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg"
                >
                  立即购买
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 祈福模态框 */}
      <AnimatePresence>
        {showBlessingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowBlessingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 m-4 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🙏</div>
                <h3 className="text-lg font-semibold">{selectedBlessing}</h3>
                <p className="text-sm text-gray-600 mt-2">请虔诚许下您的心愿</p>
              </div>
              
              <textarea
                placeholder="请输入您的祈福内容..."
                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowBlessingModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setShowBlessingModal(false);
                    alert('祈福成功！愿您心想事成🙏');
                  }}
                  className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg"
                >
                  祈福
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FortunePageOptimized; 