import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AIResponse, Wisdom, WisdomCategory, Blessing, BlessingType } from '../../../types';

// 消息接口
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'deity';
  timestamp: Date;
  deityName?: string;
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'worried' | 'excited';
  wisdom?: Wisdom;
  blessing?: Blessing;
  attachments?: Array<{
    type: 'image' | 'audio' | 'text';
    content: string;
    url?: string;
  }>;
}

// 神仙配置接口
interface DeityConfig {
  name: string;
  avatar: string;
  specialty: string;
  description: string;
  color: string;
  element: string;
  personality: string[];
  wisdomTypes: WisdomCategory[];
  blessingTypes: BlessingType[];
  responsePatterns: string[];
}

// 增强的神仙配置
const deities: DeityConfig[] = [
  {
    name: '观音菩萨',
    avatar: '🙏',
    specialty: '慈悲与智慧',
    description: '大慈大悲救苦救难，智慧无量',
    color: 'var(--water-essence)',
    element: '水',
    personality: ['慈悲', '智慧', '温和', '包容'],
    wisdomTypes: ['life', 'spiritual', 'love'],
    blessingTypes: ['peace', 'wisdom', 'love'],
    responsePatterns: [
      '慈悲心是解决一切烦恼的良药',
      '智慧如水，能润泽万物而不争',
      '放下执念，心境自然清净',
      '慈悲喜舍，是人生最大的修行'
    ]
  },
  {
    name: '文殊菩萨',
    avatar: '📚',
    specialty: '智慧与学习',
    description: '智慧第一，开启心智明灯',
    color: 'var(--wood-spring)',
    element: '木',
    personality: ['智慧', '博学', '启发', '深邃'],
    wisdomTypes: ['career', 'spiritual', 'life'],
    blessingTypes: ['wisdom', 'health'],
    responsePatterns: [
      '智慧从观察开始，从思考中成长',
      '学而时习之，不亦说乎',
      '知识的力量在于运用，智慧的价值在于分享',
      '心如明镜，映照万物真相'
    ]
  },
  {
    name: '弥勒佛',
    avatar: '😊',
    specialty: '欢喜与包容',
    description: '慈颜常笑，心量如海',
    color: 'var(--earth-golden)',
    element: '土',
    personality: ['欢喜', '包容', '乐观', '宽容'],
    wisdomTypes: ['life', 'love', 'health'],
    blessingTypes: ['peace', 'health', 'love'],
    responsePatterns: [
      '笑口常开，好彩自然来',
      '心宽体胖，福气满满',
      '包容他人，就是善待自己',
      '快乐是一种选择，幸福是一种能力'
    ]
  },
  {
    name: '地藏王菩萨',
    avatar: '💪',
    specialty: '坚毅与护佑',
    description: '地狱不空，誓不成佛',
    color: 'var(--earth-essence)',
    element: '土',
    personality: ['坚毅', '慈悲', '勇敢', '守护'],
    wisdomTypes: ['life', 'career', 'spiritual'],
    blessingTypes: ['peace', 'health', 'wisdom'],
    responsePatterns: [
      '坚持是成功的唯一秘诀',
      '困难只是成长的垫脚石',
      '真正的勇敢是面对内心的恐惧',
      '守护他人，也是守护自己的心'
    ]
  },
  {
    name: '太上老君',
    avatar: '🧙‍♂️',
    specialty: '道法与自然',
    description: '道法自然，无为而治',
    color: 'var(--qian-heaven)',
    element: '金',
    personality: ['睿智', '超脱', '自然', '深邃'],
    wisdomTypes: ['spiritual', 'life', 'health'],
    blessingTypes: ['wisdom', 'peace', 'health'],
    responsePatterns: [
      '道法自然，顺其自然最为上策',
      '无为而无不为，静中有动',
      '天地有大美而不言',
      '真正的力量来自内心的宁静'
    ]
  }
];

// 情感分析
const analyzeEmotion = (text: string): Message['emotion'] => {
  const sadWords = ['难过', '悲伤', '痛苦', '失望', '沮丧', '郁闷', '烦恼'];
  const happyWords = ['开心', '快乐', '高兴', '兴奋', '愉快', '欣喜', '满足'];
  const angryWords = ['生气', '愤怒', '恼火', '烦躁', '不爽', '气愤'];
  const worriedWords = ['担心', '焦虑', '忧虑', '不安', '紧张', '害怕'];
  const excitedWords = ['激动', '兴奋', '期待', '热情', '振奋'];

  if (sadWords.some(word => text.includes(word))) return 'sad';
  if (happyWords.some(word => text.includes(word))) return 'happy';
  if (angryWords.some(word => text.includes(word))) return 'angry';
  if (worriedWords.some(word => text.includes(word))) return 'worried';
  if (excitedWords.some(word => text.includes(word))) return 'excited';
  
  return 'neutral';
};

// 生成智慧回复
const generateWisdomResponse = (deity: DeityConfig, userEmotion: Message['emotion'], userText: string): string => {
  const { responsePatterns, personality } = deity;
  
  // 根据情感选择合适的回复
  let responses: string[] = [];
  
  switch (userEmotion) {
    case 'sad':
      responses = [
        `${personality[0]}如春风，抚慰心灵的创伤。${responsePatterns[0]}`,
        `人生如四季，冬天过后必有春天。愿你心中常有温暖的阳光。`,
        `痛苦是成长的催化剂，经历风雨才能见彩虹。`
      ];
      break;
    case 'happy':
      responses = [
        `见你心中有喜悦，我也为你感到欢喜。${responsePatterns[Math.floor(Math.random() * responsePatterns.length)]}`,
        `快乐是会传染的，愿你的喜悦如涟漪般传播。`,
        `保持这份美好的心境，它会为你带来更多的幸福。`
      ];
      break;
    case 'worried':
      responses = [
        `担心如云雾，只会遮蔽心中的阳光。${responsePatterns[0]}`,
        `未来的路虽然未卜，但每一步都是成长的足迹。`,
        `信心比黄金更珍贵，相信自己的力量。`
      ];
      break;
    case 'angry':
      responses = [
        `愤怒如火，烧毁的往往是自己的心田。${responsePatterns[2]}`,
        `深呼吸，让心境如水般平静下来。`,
        `理解他人的不易，宽容是最大的智慧。`
      ];
      break;
    default:
      responses = responsePatterns;
  }
  
  // 根据用户问题类型调整回复
  if (userText.includes('工作') || userText.includes('事业')) {
    responses.push(`在${deity.element}的能量加持下，你的事业会如${deity.element}般稳固发展。`);
  }
  if (userText.includes('感情') || userText.includes('爱情')) {
    responses.push(`爱如甘露，滋润心田。愿你的感情如${deity.element}般纯净美好。`);
  }
  if (userText.includes('健康') || userText.includes('身体')) {
    responses.push(`身心健康是最大的财富，愿${deity.element}的能量为你带来活力。`);
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
};

// 生成个性化建议
const generatePersonalizedAdvice = (deity: DeityConfig, userText: string, emotion: Message['emotion']): string[] => {
  const advice: string[] = [];
  
  // 基于神仙专长的建议
  if (deity.name === '观音菩萨') {
    advice.push('每日冥想十分钟，培养慈悲心');
    advice.push('多做善事，积累功德');
    advice.push('学会宽恕，释放内心的负担');
  } else if (deity.name === '文殊菩萨') {
    advice.push('多读书学习，增长智慧');
    advice.push('保持思考的习惯，质疑和探索');
    advice.push('分享知识，教学相长');
  } else if (deity.name === '弥勒佛') {
    advice.push('保持乐观的心态，笑对人生');
    advice.push('学会感恩，珍惜当下');
    advice.push('包容他人的不完美');
  }
  
  // 基于情感状态的建议
  switch (emotion) {
    case 'sad':
      advice.push('适当的运动能释放内啡肽，改善心情');
      advice.push('与信任的朋友分享你的感受');
      break;
    case 'worried':
      advice.push('制定具体的计划，化解无序的焦虑');
      advice.push('练习正念呼吸，专注当下');
      break;
    case 'angry':
      advice.push('数到十再回应，给情绪降温的时间');
      advice.push('通过写日记来梳理情绪');
      break;
  }
  
  return advice.slice(0, 3); // 返回最多3条建议
};

const DeityFriend: React.FC = () => {
  const [selectedDeity, setSelectedDeity] = useState<DeityConfig>(deities[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStarter, setConversationStarter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userProfile, setUserProfile] = useState({
    mood: 'neutral' as Message['emotion'],
    recentTopics: [] as string[],
    preferredWisdomType: 'life' as WisdomCategory
  });

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化对话
  useEffect(() => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `🙏 我是${selectedDeity.name}，${selectedDeity.description}。今日有何困扰，愿为你指点迷津。`,
      sender: 'deity',
      timestamp: new Date(),
      deityName: selectedDeity.name,
      emotion: 'neutral'
    };
    setMessages([welcomeMessage]);
    
    // 设置对话引导
    const starters = [
      '我最近工作压力很大，该如何调节？',
      '感情方面遇到了困难，请给我一些建议',
      '对未来感到迷茫，不知道方向在哪里',
      '身体健康出了问题，心情很低落'
    ];
    setConversationStarter(starters[Math.floor(Math.random() * starters.length)]);
  }, [selectedDeity]);

  // 发送消息
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // 用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: 'user',
      timestamp: new Date(),
      emotion: analyzeEmotion(text)
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // 更新用户档案
    setUserProfile(prev => ({
      ...prev,
      mood: userMessage.emotion || 'neutral',
      recentTopics: [...prev.recentTopics.slice(-4), text] // 保持最近5个话题
    }));

    // 模拟AI思考时间
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // 生成AI回复
    const aiResponse = generateWisdomResponse(selectedDeity, userMessage.emotion!, text);
    const personalizedAdvice = generatePersonalizedAdvice(selectedDeity, text, userMessage.emotion!);

    const deityMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: aiResponse,
      sender: 'deity',
      timestamp: new Date(),
      deityName: selectedDeity.name,
      emotion: 'neutral',
      attachments: personalizedAdvice.length > 0 ? [{
        type: 'text',
        content: `💡 个性化建议：\n${personalizedAdvice.map((advice, index) => `${index + 1}. ${advice}`).join('\n')}`
      }] : undefined
    };

    setMessages(prev => [...prev, deityMessage]);
    setIsTyping(false);
  }, [selectedDeity]);

  // 切换神仙
  const handleDeityChange = (deity: DeityConfig) => {
    setSelectedDeity(deity);
    setMessages([]);
  };

  // 请求智慧
  const requestWisdom = useCallback(async (category: WisdomCategory) => {
    setIsTyping(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const wisdomMap: Record<WisdomCategory, string[]> = {
      life: [
        '人生如梦，但梦可以很美好',
        '每一次跌倒，都是为了更好地站起来',
        '生命的意义在于体验，而不是结果'
      ],
      love: [
        '真爱不是占有，而是给对方自由飞翔的空间',
        '爱情需要理解，更需要包容',
        '相爱容易相处难，珍惜眼前人'
      ],
      career: [
        '成功不在于你爬得多高，而在于你摔倒后能否重新站起',
        '专业技能是立身之本，人际关系是成功之道',
        '职场如战场，但要保持一颗慈悲的心'
      ],
      health: [
        '身体是革命的本钱，健康是最大的财富',
        '心理健康与身体健康同样重要',
        '适度运动，合理饮食，规律作息'
      ],
      spiritual: [
        '内心的平静比外在的成就更珍贵',
        '修心如修行，每日反省自己',
        '慈悲喜舍，是心灵成长的四个阶段'
      ]
    };

    const wisdom = wisdomMap[category][Math.floor(Math.random() * wisdomMap[category].length)];
    
    const wisdomMessage: Message = {
      id: Date.now().toString(),
      content: `💎 ${selectedDeity.name}赐予的智慧：\n\n"${wisdom}"\n\n愿这份智慧能照亮你前行的路。`,
      sender: 'deity',
      timestamp: new Date(),
      deityName: selectedDeity.name,
      emotion: 'neutral'
    };

    setMessages(prev => [...prev, wisdomMessage]);
    setIsTyping(false);
  }, [selectedDeity]);

  // 请求祝福
  const requestBlessing = useCallback(async (type: BlessingType) => {
    setIsTyping(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const blessingMap: Record<BlessingType, string[]> = {
      health: ['身体健康，精神饱满', '远离疾病，长寿安康'],
      wealth: ['财源广进，富贵安康', '正财偏财，源源不断'],
      love: ['姻缘美满，白头偕老', '爱情甜蜜，家庭和睦'],
      wisdom: ['智慧如海，学问精深', '明理开悟，慧眼识真'],
      peace: ['心境平和，万事如意', '内心宁静，外境和谐']
    };

    const blessing = blessingMap[type][Math.floor(Math.random() * blessingMap[type].length)];
    
    const blessingMessage: Message = {
      id: Date.now().toString(),
      content: `🙏 ${selectedDeity.name}的祝福：\n\n愿你${blessing}。\n\n此祝福将伴随你七天，心诚则灵。`,
      sender: 'deity',
      timestamp: new Date(),
      deityName: selectedDeity.name,
      emotion: 'happy'
    };

    setMessages(prev => [...prev, blessingMessage]);
    setIsTyping(false);
  }, [selectedDeity]);

  // 快捷回复
  const quickReplies = [
    '请给我一些人生建议',
    '我想要一个祝福',
    '最近感到很困惑',
    '谢谢您的指导'
  ];

  return (
    <div className="zen-container fade-in">
      {/* 神仙选择 - 五行布局 */}
      <div className="zen-card texture-paper">
        <h3 className="zen-subtitle">选择你的神仙朋友</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-verse)',
          marginBottom: 'var(--space-stanza)'
        }}>
          {deities.map((deity, index) => (
            <button
              key={deity.name}
              onClick={() => handleDeityChange(deity)}
              className={`zen-button-ghost hover-lift ${selectedDeity.name === deity.name ? 'active' : ''}`}
              style={{
                background: selectedDeity.name === deity.name 
                  ? `linear-gradient(135deg, ${deity.color}20 0%, ${deity.color}10 100%)`
                  : `${deity.color}05`,
                border: `2px solid ${selectedDeity.name === deity.name ? deity.color : deity.color + '40'}`,
                borderRadius: 'var(--radius-moon)',
                padding: 'var(--space-verse)',
                textAlign: 'center',
                transition: 'all var(--duration-smooth) var(--ease-spring)',
                position: 'relative'
              }}
            >
              {/* 五行标识 */}
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                fontSize: 'var(--text-micro)',
                opacity: '0.6',
                color: deity.color,
                background: `${deity.color}20`,
                padding: '0.2rem 0.4rem',
                borderRadius: 'var(--radius-hair)',
                border: `1px solid ${deity.color}40`
              }}>
                {deity.element}
              </div>
              
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-breath)' }}>
                {deity.avatar}
              </div>
              <h4 style={{ 
                fontSize: 'var(--text-large)', 
                fontWeight: '700',
                color: deity.color,
                marginBottom: 'var(--space-breath)'
              }}>
                {deity.name}
              </h4>
              <div style={{ 
                fontSize: 'var(--text-small)', 
                fontWeight: '600',
                color: deity.color,
                marginBottom: 'var(--space-breath)',
                opacity: '0.8'
              }}>
                {deity.specialty}
              </div>
              <p style={{ 
                fontSize: 'var(--text-small)', 
                color: 'var(--ink-medium)',
                lineHeight: 'var(--leading-relaxed)'
              }}>
                {deity.description}
              </p>
              
              {/* 专长标签 */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-feather)',
                marginTop: 'var(--space-breath)',
                justifyContent: 'center'
              }}>
                {deity.personality.slice(0, 2).map(trait => (
                  <span
                    key={trait}
                    style={{
                      fontSize: 'var(--text-micro)',
                      background: `${deity.color}15`,
                      color: deity.color,
                      padding: '0.2rem 0.4rem',
                      borderRadius: 'var(--radius-hair)',
                      border: `1px solid ${deity.color}30`
                    }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 当前神仙信息面板 */}
      <div className="zen-card texture-silk" style={{
        background: `linear-gradient(135deg, ${selectedDeity.color}10 0%, ${selectedDeity.color}05 100%)`,
        border: `2px solid ${selectedDeity.color}30`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-verse)' }}>
          <div style={{ fontSize: '3rem' }}>{selectedDeity.avatar}</div>
          <div>
            <h3 style={{ 
              color: selectedDeity.color, 
              marginBottom: 'var(--space-breath)',
              fontSize: 'var(--text-title)'
            }}>
              正在与 {selectedDeity.name} 对话
            </h3>
            <p style={{ 
              color: 'var(--ink-medium)', 
              fontSize: 'var(--text-small)',
              marginBottom: 'var(--space-breath)'
            }}>
              {selectedDeity.description}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-breath)', flexWrap: 'wrap' }}>
              {selectedDeity.personality.map(trait => (
                <span
                  key={trait}
                  style={{
                    fontSize: 'var(--text-micro)',
                    background: `${selectedDeity.color}20`,
                    color: selectedDeity.color,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-pebble)',
                    border: `1px solid ${selectedDeity.color}40`,
                    fontWeight: '500'
                  }}
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 对话区域 - 卷轴效果 */}
      <div className="zen-card zen-scroll texture-ancient-paper" style={{
        maxHeight: '500px',
        overflowY: 'auto',
        padding: 'var(--space-stanza)',
        background: 'var(--gradient-zen-mist)',
        border: '3px solid var(--earth-golden)',
        borderRadius: 'var(--radius-sun)',
        position: 'relative'
      }}>
        {/* 传统装饰 */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          fontSize: '1.5rem',
          opacity: '0.2',
          color: 'var(--earth-golden)'
        }}>☯</div>
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          fontSize: '1.5rem',
          opacity: '0.2',
          color: 'var(--earth-golden)'
        }}>☯</div>

        <div style={{ paddingTop: 'var(--space-stanza)' }}>
          {messages.map((message, index) => (
            <div
              key={message.id}
              className="fade-in"
              style={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 'var(--space-verse)',
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div style={{
                maxWidth: '80%',
                padding: 'var(--space-verse)',
                borderRadius: 'var(--radius-moon)',
                background: message.sender === 'user' 
                  ? 'var(--gradient-sunrise)' 
                  : `linear-gradient(135deg, ${selectedDeity.color}20 0%, ${selectedDeity.color}10 100%)`,
                border: message.sender === 'user' 
                  ? '2px solid var(--earth-golden)' 
                  : `2px solid ${selectedDeity.color}40`,
                position: 'relative',
                boxShadow: 'var(--shadow-paper)'
              }}>
                {/* 神仙消息的头像 */}
                {message.sender === 'deity' && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '15px',
                    fontSize: '1.5rem',
                    background: `${selectedDeity.color}20`,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-pebble)',
                    border: `1px solid ${selectedDeity.color}40`
                  }}>
                    {selectedDeity.avatar}
                  </div>
                )}

                <div style={{
                  color: message.sender === 'user' ? 'white' : 'var(--ink-thick)',
                  fontSize: 'var(--text-base)',
                  lineHeight: 'var(--leading-relaxed)',
                  marginTop: message.sender === 'deity' ? 'var(--space-breath)' : '0'
                }}>
                  {message.content}
                </div>

                {/* 附件显示 */}
                {message.attachments && message.attachments.map((attachment, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginTop: 'var(--space-verse)',
                      padding: 'var(--space-verse)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 'var(--radius-pebble)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      fontSize: 'var(--text-small)',
                      lineHeight: 'var(--leading-relaxed)',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {attachment.content}
                  </div>
                ))}

                <div style={{
                  fontSize: 'var(--text-micro)',
                  opacity: '0.7',
                  marginTop: 'var(--space-breath)',
                  textAlign: message.sender === 'user' ? 'right' : 'left'
                }}>
                  {message.timestamp.toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* 打字指示器 */}
          {isTyping && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: 'var(--space-verse)'
            }}>
              <div style={{
                padding: 'var(--space-verse)',
                borderRadius: 'var(--radius-moon)',
                background: `linear-gradient(135deg, ${selectedDeity.color}20 0%, ${selectedDeity.color}10 100%)`,
                border: `2px solid ${selectedDeity.color}40`,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-breath)'
              }}>
                <div className="zen-loader" style={{ fontSize: '0.8rem' }}>
                  <span>●</span><span>●</span><span>●</span>
                </div>
                <span style={{ 
                  color: 'var(--ink-medium)', 
                  fontSize: 'var(--text-small)',
                  fontStyle: 'italic'
                }}>
                  {selectedDeity.name}正在思考...
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 - 古典样式 */}
      <div className="zen-card texture-jade">
        {/* 对话引导 */}
        {messages.length <= 1 && (
          <div style={{
            marginBottom: 'var(--space-verse)',
            padding: 'var(--space-verse)',
            background: 'var(--gradient-water)',
            borderRadius: 'var(--radius-pebble)',
            border: '1px solid rgba(255, 215, 0, 0.2)'
          }}>
            <div style={{ 
              fontSize: 'var(--text-small)', 
              color: 'var(--ink-medium)',
              marginBottom: 'var(--space-breath)'
            }}>
              💡 不知道说什么？试试这个：
            </div>
            <button
              onClick={() => sendMessage(conversationStarter)}
              style={{
                background: 'transparent',
                border: '1px dashed var(--earth-golden)',
                borderRadius: 'var(--radius-pebble)',
                padding: 'var(--space-breath)',
                fontSize: 'var(--text-small)',
                color: 'var(--ink-medium)',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'all var(--duration-smooth)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--earth-golden)10'
                e.currentTarget.style.borderStyle = 'solid'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderStyle = 'dashed'
              }}
            >
              "{conversationStarter}"
            </button>
          </div>
        )}

        {/* 快捷回复 */}
        {messages.length > 1 && (
          <div style={{
            marginBottom: 'var(--space-verse)',
            display: 'flex',
            gap: 'var(--space-breath)',
            flexWrap: 'wrap'
          }}>
            {quickReplies.map(reply => (
              <button
                key={reply}
                onClick={() => sendMessage(reply)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--earth-golden)40',
                  borderRadius: 'var(--radius-pebble)',
                  padding: 'var(--space-breath) var(--space-verse)',
                  fontSize: 'var(--text-micro)',
                  color: 'var(--ink-medium)',
                  cursor: 'pointer',
                  transition: 'all var(--duration-smooth)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--earth-golden)10'
                  e.currentTarget.style.borderColor = 'var(--earth-golden)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'var(--earth-golden)40'
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-verse)' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
            placeholder={`向${selectedDeity.name}说出你的心声...`}
            style={{
              flex: 1,
              padding: 'var(--space-verse)',
              border: '2px solid var(--earth-golden)40',
              borderRadius: 'var(--radius-moon)',
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
          <button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isTyping}
            className="zen-button hover-lift"
            style={{
              padding: 'var(--space-verse) var(--space-stanza)',
              background: 'var(--gradient-sunrise)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-moon)',
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              cursor: inputText.trim() && !isTyping ? 'pointer' : 'not-allowed',
              opacity: inputText.trim() && !isTyping ? 1 : 0.6,
              transition: 'all var(--duration-smooth)'
            }}
          >
            发送 📤
          </button>
        </div>

        {/* 快捷功能 - 传统分类 */}
        <div style={{
          marginTop: 'var(--space-stanza)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 'var(--space-verse)'
        }}>
          <div>
            <h4 style={{ 
              fontSize: 'var(--text-small)', 
              marginBottom: 'var(--space-breath)',
              color: 'var(--ink-thick)'
            }}>
              🧠 请求智慧
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-feather)' }}>
              {selectedDeity.wisdomTypes.map(type => (
                <button
                  key={type}
                  onClick={() => requestWisdom(type)}
                  disabled={isTyping}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--wood-spring)40',
                    borderRadius: 'var(--radius-pebble)',
                    padding: 'var(--space-breath)',
                    fontSize: 'var(--text-micro)',
                    color: 'var(--wood-spring)',
                    cursor: isTyping ? 'not-allowed' : 'pointer',
                    opacity: isTyping ? 0.6 : 1,
                    transition: 'all var(--duration-smooth)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isTyping) {
                      e.currentTarget.style.background = 'var(--wood-spring)10'
                      e.currentTarget.style.borderColor = 'var(--wood-spring)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'var(--wood-spring)40'
                  }}
                >
                  {type === 'life' && '人生智慧'}
                  {type === 'love' && '情感指导'}
                  {type === 'career' && '事业建议'}
                  {type === 'health' && '健康养生'}
                  {type === 'spiritual' && '心灵成长'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ 
              fontSize: 'var(--text-small)', 
              marginBottom: 'var(--space-breath)',
              color: 'var(--ink-thick)'
            }}>
              🙏 祈求祝福
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-feather)' }}>
              {selectedDeity.blessingTypes.map(type => (
                <button
                  key={type}
                  onClick={() => requestBlessing(type)}
                  disabled={isTyping}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--fire-phoenix)40',
                    borderRadius: 'var(--radius-pebble)',
                    padding: 'var(--space-breath)',
                    fontSize: 'var(--text-micro)',
                    color: 'var(--fire-phoenix)',
                    cursor: isTyping ? 'not-allowed' : 'pointer',
                    opacity: isTyping ? 0.6 : 1,
                    transition: 'all var(--duration-smooth)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isTyping) {
                      e.currentTarget.style.background = 'var(--fire-phoenix)10'
                      e.currentTarget.style.borderColor = 'var(--fire-phoenix)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'var(--fire-phoenix)40'
                  }}
                >
                  {type === 'health' && '身体健康'}
                  {type === 'wealth' && '财运亨通'}
                  {type === 'love' && '姻缘美满'}
                  {type === 'wisdom' && '智慧增长'}
                  {type === 'peace' && '平安顺遂'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="zen-card texture-calligraphy-paper">
        <h3 className="zen-subtitle">与神仙对话的礼仪</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--space-verse)',
          fontSize: 'var(--text-small)',
          color: 'var(--ink-medium)',
          lineHeight: 'var(--leading-relaxed)'
        }}>
          <div>
            <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
              🎯 对话要点
            </h4>
            <ul style={{ paddingLeft: 'var(--space-verse)' }}>
              <li>保持诚心，说出真实想法</li>
              <li>详细描述你的困惑或问题</li>
              <li>耐心等待，给AI思考的时间</li>
              <li>可以追问或要求更详细的解释</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
              🌟 智能特性
            </h4>
            <ul style={{ paddingLeft: 'var(--space-verse)' }}>
              <li>情感分析：AI会理解你的情绪状态</li>
              <li>个性化回复：基于不同神仙的特点</li>
              <li>实用建议：针对性的生活指导</li>
              <li>文化传承：融入传统智慧精髓</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeityFriend; 
 
 