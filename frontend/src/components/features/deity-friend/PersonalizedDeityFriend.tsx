import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiService } from '../../../services/apiService';
import { DeepSeekAPI, DEITY_PERSONALITIES } from '../../../utils/deepseek-api';
import { validateAPIKey, getAPIConfig } from '../../../config/api';

// 消息接口
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'deity';
  timestamp: Date;
  deityName?: string;
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'worried' | 'excited';
  attachments?: Array<{
    type: 'image' | 'audio' | 'text';
    content: string;
    url?: string;
  }>;
}

// 用户信息接口
interface UserInfo {
  name: string;
  birthdate: string;
  gender: string;
  bazi?: any;
  dailyFortune?: any;
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
  wisdomTypes: string[];
  blessingTypes: string[];
  responsePatterns: string[];
  deepseekId?: string; // 添加DeepSeek ID映射
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
    ],
    deepseekId: 'guanyin'
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
    ],
    deepseekId: 'wenshu'
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
    ],
    deepseekId: 'amitabha'
  },
  {
    name: '地藏王菩萨',
    avatar: '💪',
    specialty: '坚毅与护佑',
    description: '地狱不空，誓不成佛',
    color: 'var(--fire-phoenix)',
    element: '火',
    personality: ['坚毅', '护佑', '勇敢', '坚定'],
    wisdomTypes: ['career', 'spiritual', 'health'],
    blessingTypes: ['protection', 'strength', 'courage'],
    responsePatterns: [
      '坚毅如金刚，无坚不摧',
      '护佑众生，慈悲济世',
      '勇敢面对困难，必能克服',
      '坚定信念，终有所成'
    ],
    deepseekId: 'budongzun'
  },
  {
    name: '太上老君',
    avatar: '☯️',
    specialty: '道法与自然',
    description: '道法自然，无为而治',
    color: 'var(--metal-autumn)',
    element: '金',
    personality: ['智慧', '自然', '无为', '深邃'],
    wisdomTypes: ['spiritual', 'life', 'career'],
    blessingTypes: ['wisdom', 'peace', 'health'],
    responsePatterns: [
      '道法自然，顺其自然',
      '无为而治，不争而胜',
      '上善若水，厚德载物',
      '知足常乐，随遇而安'
    ],
    deepseekId: 'dashizhi'
  }
];

// 情感分析函数
const analyzeEmotion = (text: string): Message['emotion'] => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('开心') || lowerText.includes('高兴') || lowerText.includes('快乐') || lowerText.includes('😊') || lowerText.includes('😄')) {
    return 'happy';
  } else if (lowerText.includes('难过') || lowerText.includes('伤心') || lowerText.includes('悲伤') || lowerText.includes('😢') || lowerText.includes('😭')) {
    return 'sad';
  } else if (lowerText.includes('生气') || lowerText.includes('愤怒') || lowerText.includes('恼火') || lowerText.includes('😠') || lowerText.includes('😡')) {
    return 'angry';
  } else if (lowerText.includes('担心') || lowerText.includes('忧虑') || lowerText.includes('焦虑') || lowerText.includes('😰') || lowerText.includes('😨')) {
    return 'worried';
  } else if (lowerText.includes('兴奋') || lowerText.includes('激动') || lowerText.includes('期待') || lowerText.includes('😃') || lowerText.includes('🤩')) {
    return 'excited';
  }
  
  return 'neutral';
};

const PersonalizedDeityFriend: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedDeity, setSelectedDeity] = useState<DeityConfig>(deities[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showUserInfoForm, setShowUserInfoForm] = useState(true);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);
  const [deepseekAPI, setDeepseekAPI] = useState<DeepSeekAPI | null>(null);
  const [isAPIConfigured, setIsAPIConfigured] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Record<string, any[]>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化DeepSeek API
  useEffect(() => {
    const initDeepSeekAPI = () => {
      const config = getAPIConfig();
      if (validateAPIKey() && config.deepseek.apiKey) {
        const api = new DeepSeekAPI(config.deepseek.apiKey);
        setDeepseekAPI(api);
        setIsAPIConfigured(true);
      } else {
        setIsAPIConfigured(false);
      }
    };

    initDeepSeekAPI();
  }, []);

  // 加载用户信息
  const loadUserInfo = useCallback(async () => {
    if (!userInfo) return;
    
    setIsLoadingUserInfo(true);
    try {
      // 获取八字信息
      const baziResponse = await apiService.calculateBazi({
        birthdate: userInfo.birthdate,
        name: userInfo.name,
        gender: userInfo.gender
      });

      // 获取今日运势
      const fortuneResponse = await apiService.calculateDailyFortune({
        birthdate: userInfo.birthdate,
        name: userInfo.name,
        gender: userInfo.gender
      });

      setUserInfo(prev => ({
        ...prev!,
        bazi: baziResponse.data,
        dailyFortune: fortuneResponse.data
      }));

      // 更新本地存储
      localStorage.setItem('userInfo', JSON.stringify({
        ...userInfo,
        bazi: baziResponse.data,
        dailyFortune: fortuneResponse.data
      }));

    } catch (error) {
      console.error('加载用户信息失败:', error);
    } finally {
      setIsLoadingUserInfo(false);
    }
  }, [userInfo]);

  // 保存用户信息
  const saveUserInfo = useCallback((info: UserInfo) => {
    setUserInfo(info);
    setShowUserInfoForm(false);
    // 保存到本地存储
    localStorage.setItem('userInfo', JSON.stringify(info));
  }, []);

  // 从本地存储加载用户信息
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      const info = JSON.parse(savedUserInfo);
      setUserInfo(info);
      setShowUserInfoForm(false);
    }
  }, []);

  // 加载用户信息后获取八字和运势
  useEffect(() => {
    if (userInfo && !userInfo.bazi) {
      loadUserInfo();
    }
  }, [userInfo, loadUserInfo]);

  // 生成个性化提示词
  const generatePersonalizedPrompt = useCallback((deity: DeityConfig, userText: string, emotion: Message['emotion']): string => {
    let prompt = `用户信息：姓名${userInfo?.name || '未知'}，`;
    
    // 添加八字信息
    if (userInfo?.bazi) {
      const bazi = userInfo.bazi;
      const dayMaster = bazi.bazi_chart?.day_master;
      const elements = bazi.bazi_chart?.elements;
      
      prompt += `日主${dayMaster || '未知'}，`;
      
      if (elements) {
        const strongestElement = Object.entries(elements).reduce((a, b) => (a[1] as number) > (b[1] as number) ? a : b)[0];
        prompt += `${strongestElement}气较旺，`;
      }
    }
    
    // 添加今日运势信息
    if (userInfo?.dailyFortune) {
      const fortune = userInfo.dailyFortune;
      prompt += `今日运势${fortune.overall_level || '一般'}，`;
      
      if (fortune.lucky_colors && fortune.lucky_colors.length > 0) {
        prompt += `吉利颜色：${fortune.lucky_colors.join('、')}，`;
      }
      
      if (fortune.lucky_directions && fortune.lucky_directions.length > 0) {
        prompt += `吉利方位：${fortune.lucky_directions.join('、')}，`;
      }
    }
    
    // 添加情感状态
    if (emotion && emotion !== 'neutral') {
      const emotionMap = {
        'happy': '心情愉悦',
        'sad': '心情低落',
        'angry': '心情愤怒',
        'worried': '心情忧虑',
        'excited': '心情兴奋'
      };
      prompt += `当前${emotionMap[emotion]}，`;
    }
    
    prompt += `用户说："${userText}"。请以${deity.name}的身份，结合用户信息提供个性化回复。`;
    
    return prompt;
  }, [userInfo]);

  // 生成个性化建议
  const generatePersonalizedAdvice = useCallback((deity: DeityConfig, userText: string, emotion: Message['emotion']): string[] => {
    const advice: string[] = [];
    
    // 基于八字分析的建议
    if (userInfo?.bazi?.analysis) {
      const analysis = userInfo.bazi.analysis;
      
      // 性格建议
      if (analysis.personality && analysis.personality.length > 0) {
        advice.push(`基于你的八字特点：${analysis.personality[0]}`);
      }
      
      // 事业建议
      if (analysis.career && analysis.career.length > 0) {
        advice.push(`事业方面：${analysis.career[0]}`);
      }
      
      // 健康建议
      if (analysis.health && analysis.health.length > 0) {
        advice.push(`健康提醒：${analysis.health[0]}`);
      }
    }
    
    // 基于今日运势的建议
    if (userInfo?.dailyFortune) {
      const fortune = userInfo.dailyFortune;
      
      // 吉利信息
      if (fortune.lucky_colors && fortune.lucky_colors.length > 0) {
        advice.push(`今日吉利颜色：${fortune.lucky_colors.join('、')}`);
      }
      
      if (fortune.lucky_directions && fortune.lucky_directions.length > 0) {
        advice.push(`今日吉利方位：${fortune.lucky_directions.join('、')}`);
      }
      
      // 活动建议
      if (fortune.recommended_activities && fortune.recommended_activities.length > 0) {
        advice.push(`今日建议：${fortune.recommended_activities[0]}`);
      }
    }
    
    // 基于神仙专长的建议
    if (deity.name === '观音菩萨') {
      advice.push('每日冥想十分钟，培养慈悲心');
    } else if (deity.name === '文殊菩萨') {
      advice.push('多读书学习，增长智慧');
    } else if (deity.name === '弥勒佛') {
      advice.push('保持乐观的心态，笑对人生');
    }
    
    return advice.slice(0, 3); // 返回最多3条建议
  }, [userInfo]);

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

    try {
      let aiResponse = '';
      
      // 如果DeepSeek API可用，使用真实AI回复
      if (isAPIConfigured && deepseekAPI && selectedDeity.deepseekId) {
        // 生成个性化提示词
        const personalizedPrompt = generatePersonalizedPrompt(selectedDeity, text, userMessage.emotion!);
        
        // 获取对话历史
        const history = conversationHistory[selectedDeity.deepseekId] || [];
        
        // 调用DeepSeek API
        aiResponse = await deepseekAPI.chatWithDeity(selectedDeity.deepseekId, personalizedPrompt, history);
        
        // 更新对话历史
        setConversationHistory(prev => ({
          ...prev,
          [selectedDeity.deepseekId!]: [
            ...history,
            { role: 'user', content: personalizedPrompt },
            { role: 'assistant', content: aiResponse }
          ]
        }));
      } else {
        // 使用本地生成的回复
        const { responsePatterns } = selectedDeity;
        const baseResponse = responsePatterns[Math.floor(Math.random() * responsePatterns.length)];
        
        // 根据用户信息个性化回复
        if (userInfo?.bazi) {
          const bazi = userInfo.bazi;
          const dayMaster = bazi.bazi_chart?.day_master;
          
          if (dayMaster) {
            aiResponse += `根据你的日主${dayMaster}，`;
          }
        }
        
        // 根据今日运势个性化
        if (userInfo?.dailyFortune) {
          const fortune = userInfo.dailyFortune;
          const overallLevel = fortune.overall_level;
          
          if (overallLevel === '极好' || overallLevel === '很好') {
            aiResponse += `今日运势${overallLevel}，`;
          } else if (overallLevel === '差') {
            aiResponse += `虽然今日运势稍差，但`;
          }
        }
        
        aiResponse += baseResponse;
      }

      // 生成个性化建议
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
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 错误回复
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，神仙暂时无法回应，请稍后再试...',
        sender: 'deity',
        timestamp: new Date(),
        deityName: selectedDeity.name,
        emotion: 'neutral'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [selectedDeity, generatePersonalizedPrompt, generatePersonalizedAdvice, userInfo, isAPIConfigured, deepseekAPI, conversationHistory]);

  // 切换神仙
  const handleDeityChange = (deity: DeityConfig) => {
    setSelectedDeity(deity);
    setMessages([]);
  };

  // 用户信息表单组件
  const UserInfoForm: React.FC = () => {
    const [formData, setFormData] = useState({
      name: '',
      birthdate: '',
      gender: 'male'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.name && formData.birthdate) {
        saveUserInfo({
          name: formData.name,
          birthdate: formData.birthdate,
          gender: formData.gender
        });
      }
    };

    return (
      <div className="zen-card texture-paper" style={{
        background: 'var(--gradient-zen-mist)',
        border: '2px solid var(--earth-golden)',
        borderRadius: 'var(--radius-sun)',
        padding: 'var(--space-stanza)'
      }}>
        <h3 className="zen-subtitle" style={{ textAlign: 'center', marginBottom: 'var(--space-stanza)' }}>
          🎯 个性化设置
        </h3>
        <p style={{ textAlign: 'center', marginBottom: 'var(--space-stanza)', color: 'var(--ink-medium)' }}>
          为了给您提供更精准的指导，请填写以下信息
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-verse)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-breath)', color: 'var(--ink-thick)' }}>
              姓名 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              style={{
                width: '100%',
                padding: 'var(--space-verse)',
                border: '2px solid var(--earth-golden)40',
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-base)',
                background: 'var(--paper-modern)',
                color: 'var(--ink-thick)',
                outline: 'none'
              }}
              placeholder="请输入您的姓名"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-breath)', color: 'var(--ink-thick)' }}>
              出生日期时间 *
            </label>
            <input
              type="datetime-local"
              value={formData.birthdate}
              onChange={(e) => setFormData(prev => ({ ...prev, birthdate: e.target.value }))}
              required
              style={{
                width: '100%',
                padding: 'var(--space-verse)',
                border: '2px solid var(--earth-golden)40',
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-base)',
                background: 'var(--paper-modern)',
                color: 'var(--ink-thick)',
                outline: 'none'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-breath)', color: 'var(--ink-thick)' }}>
              性别 *
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              style={{
                width: '100%',
                padding: 'var(--space-verse)',
                border: '2px solid var(--earth-golden)40',
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-base)',
                background: 'var(--paper-modern)',
                color: 'var(--ink-thick)',
                outline: 'none'
              }}
            >
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={!formData.name || !formData.birthdate}
            style={{
              padding: 'var(--space-verse) var(--space-stanza)',
              background: 'var(--gradient-sunrise)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-moon)',
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              cursor: formData.name && formData.birthdate ? 'pointer' : 'not-allowed',
              opacity: formData.name && formData.birthdate ? 1 : 0.6,
              marginTop: 'var(--space-verse)'
            }}
          >
            开始个性化对话
          </button>
        </form>
      </div>
    );
  };

  // 用户信息面板组件
  const UserInfoPanel: React.FC = () => {
    if (!userInfo) return null;

    return (
      <div className="zen-card texture-silk" style={{
        background: 'var(--gradient-water)',
        border: '2px solid var(--earth-golden)',
        borderRadius: 'var(--radius-sun)',
        padding: 'var(--space-verse)',
        marginBottom: 'var(--space-stanza)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: 'var(--earth-golden)', margin: '0 0 var(--space-breath) 0' }}>
              👤 {userInfo.name}
            </h4>
            <p style={{ color: 'var(--ink-medium)', margin: '0', fontSize: 'var(--text-small)' }}>
              {userInfo.birthdate} | {userInfo.gender === 'male' ? '男' : '女'}
            </p>
          </div>
          
          {isLoadingUserInfo && (
            <div style={{ color: 'var(--earth-golden)' }}>
              🔄 加载中...
            </div>
          )}
          
          {userInfo.bazi && userInfo.dailyFortune && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--earth-golden)', fontSize: 'var(--text-small)' }}>
                📊 八字已加载
              </div>
              <div style={{ color: 'var(--ink-medium)', fontSize: 'var(--text-small)' }}>
                🎯 运势已计算
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 快捷回复组件
  const QuickReplies: React.FC = () => {
    const quickReplies = [
      '我想了解我的事业运势',
      '请给我一些人生建议',
      '我最近心情不好，怎么办？',
      '我想学习一些智慧',
      '请给我一些祝福'
    ];

    return (
      <div style={{ marginBottom: 'var(--space-stanza)' }}>
        <p style={{ color: 'var(--ink-medium)', marginBottom: 'var(--space-breath)', fontSize: 'var(--text-small)' }}>
          💡 快捷回复：
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-breath)' }}>
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => sendMessage(reply)}
              style={{
                padding: 'var(--space-feather) var(--space-breath)',
                background: 'var(--paper-modern)',
                border: '1px solid var(--earth-golden)40',
                borderRadius: 'var(--radius-pebble)',
                fontSize: 'var(--text-small)',
                color: 'var(--ink-medium)',
                cursor: 'pointer',
                transition: 'all var(--duration-smooth)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--earth-golden)10';
                e.currentTarget.style.borderColor = 'var(--earth-golden)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--paper-modern)';
                e.currentTarget.style.borderColor = 'var(--earth-golden)40';
              }}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // 神仙选择组件
  const DeitySelector: React.FC = () => {
    return (
      <div style={{ marginBottom: 'var(--space-stanza)' }}>
        <p style={{ color: 'var(--ink-medium)', marginBottom: 'var(--space-breath)', fontSize: 'var(--text-small)' }}>
          🏛️ 选择神仙：
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-breath)' }}>
          {deities.map((deity) => (
            <button
              key={deity.name}
              onClick={() => handleDeityChange(deity)}
              style={{
                padding: 'var(--space-breath) var(--space-verse)',
                background: selectedDeity.name === deity.name ? 'var(--earth-golden)20' : 'var(--paper-modern)',
                border: `2px solid ${selectedDeity.name === deity.name ? 'var(--earth-golden)' : 'var(--earth-golden)40'}`,
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-small)',
                color: selectedDeity.name === deity.name ? 'var(--earth-golden)' : 'var(--ink-medium)',
                cursor: 'pointer',
                transition: 'all var(--duration-smooth)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-feather)'
              }}
            >
              <span style={{ fontSize: 'var(--text-base)' }}>{deity.avatar}</span>
              <span>{deity.name}</span>
              {deity.deepseekId && isAPIConfigured && (
                <span style={{ fontSize: 'var(--text-small)', opacity: 0.7 }}>🤖</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // 聊天界面组件
  const ChatInterface: React.FC = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '60vh' }}>
        {/* 消息列表 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-verse)',
          background: 'var(--paper-modern)',
          borderRadius: 'var(--radius-moon)',
          border: '2px solid var(--earth-golden)20',
          marginBottom: 'var(--space-verse)'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--ink-medium)', padding: 'var(--space-stanza)' }}>
              <div style={{ fontSize: 'var(--text-large)', marginBottom: 'var(--space-breath)' }}>
                {selectedDeity.avatar}
              </div>
              <p>开始与{selectedDeity.name}对话吧！</p>
              <p style={{ fontSize: 'var(--text-small)', marginTop: 'var(--space-breath)' }}>
                {selectedDeity.description}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                style={{
                  marginBottom: 'var(--space-verse)',
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: 'var(--space-breath) var(--space-verse)',
                  background: message.sender === 'user' 
                    ? 'var(--gradient-sunrise)' 
                    : 'var(--gradient-water)',
                  color: message.sender === 'user' ? 'white' : 'var(--ink-thick)',
                  borderRadius: 'var(--radius-moon)',
                  border: message.sender === 'deity' ? '1px solid var(--earth-golden)40' : 'none',
                  position: 'relative'
                }}>
                  {message.sender === 'deity' && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      left: 'var(--space-breath)',
                      background: 'var(--earth-golden)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-pebble)',
                      fontSize: 'var(--text-small)',
                      fontWeight: '600'
                    }}>
                      {message.deityName}
                    </div>
                  )}
                  
                  <div style={{ marginTop: message.sender === 'deity' ? 'var(--space-breath)' : '0' }}>
                    {message.content}
                  </div>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div style={{
                      marginTop: 'var(--space-breath)',
                      padding: 'var(--space-breath)',
                      background: 'var(--paper-modern)',
                      borderRadius: 'var(--radius-pebble)',
                      fontSize: 'var(--text-small)',
                      whiteSpace: 'pre-line'
                    }}>
                      {message.attachments[0].content}
                    </div>
                  )}
                  
                  <div style={{
                    fontSize: 'var(--text-small)',
                    opacity: 0.7,
                    marginTop: 'var(--space-feather)',
                    textAlign: 'right'
                  }}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: 'var(--space-breath) var(--space-verse)',
                background: 'var(--gradient-water)',
                borderRadius: 'var(--radius-moon)',
                border: '1px solid var(--earth-golden)40',
                color: 'var(--ink-medium)',
                fontSize: 'var(--text-small)'
              }}>
                {selectedDeity.avatar} {selectedDeity.name}正在思考...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div style={{ display: 'flex', gap: 'var(--space-breath)' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(inputText);
              }
            }}
            placeholder={`与${selectedDeity.name}对话...`}
            disabled={isTyping}
            style={{
              flex: 1,
              padding: 'var(--space-verse)',
              border: '2px solid var(--earth-golden)40',
              borderRadius: 'var(--radius-moon)',
              fontSize: 'var(--text-base)',
              background: 'var(--paper-modern)',
              color: 'var(--ink-thick)',
              outline: 'none'
            }}
          />
          <button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isTyping}
            style={{
              padding: 'var(--space-verse) var(--space-stanza)',
              background: 'var(--gradient-sunrise)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-moon)',
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              cursor: inputText.trim() && !isTyping ? 'pointer' : 'not-allowed',
              opacity: inputText.trim() && !isTyping ? 1 : 0.6
            }}
          >
            发送
          </button>
        </div>
      </div>
    );
  };

  // API配置提示组件
  const APIConfigNotice: React.FC = () => {
    if (isAPIConfigured) return null;

    return (
      <div style={{
        padding: 'var(--space-verse)',
        background: 'var(--fire-phoenix)10',
        border: '1px solid var(--fire-phoenix)40',
        borderRadius: 'var(--radius-moon)',
        marginBottom: 'var(--space-stanza)',
        color: 'var(--fire-phoenix)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-breath)' }}>
          <span>🔑</span>
          <div>
            <strong>DeepSeek API未配置</strong>
            <p style={{ margin: 'var(--space-feather) 0 0 0', fontSize: 'var(--text-small)' }}>
              当前使用本地回复模式。配置API密钥后可获得更智能的对话体验。
            </p>
          </div>
        </div>
      </div>
    );
  };

  // 主界面
  if (showUserInfoForm) {
    return (
      <div className="zen-container">
        <UserInfoForm />
      </div>
    );
  }

  return (
    <div className="zen-container">
      <UserInfoPanel />
      <APIConfigNotice />
      <DeitySelector />
      <QuickReplies />
      <ChatInterface />
    </div>
  );
};

export default PersonalizedDeityFriend; 
import { apiService } from '../../../services/apiService';
import { DeepSeekAPI, DEITY_PERSONALITIES } from '../../../utils/deepseek-api';
import { validateAPIKey, getAPIConfig } from '../../../config/api';

// 消息接口
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'deity';
  timestamp: Date;
  deityName?: string;
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'worried' | 'excited';
  attachments?: Array<{
    type: 'image' | 'audio' | 'text';
    content: string;
    url?: string;
  }>;
}

// 用户信息接口
interface UserInfo {
  name: string;
  birthdate: string;
  gender: string;
  bazi?: any;
  dailyFortune?: any;
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
  wisdomTypes: string[];
  blessingTypes: string[];
  responsePatterns: string[];
  deepseekId?: string; // 添加DeepSeek ID映射
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
    ],
    deepseekId: 'guanyin'
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
    ],
    deepseekId: 'wenshu'
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
    ],
    deepseekId: 'amitabha'
  },
  {
    name: '地藏王菩萨',
    avatar: '💪',
    specialty: '坚毅与护佑',
    description: '地狱不空，誓不成佛',
    color: 'var(--fire-phoenix)',
    element: '火',
    personality: ['坚毅', '护佑', '勇敢', '坚定'],
    wisdomTypes: ['career', 'spiritual', 'health'],
    blessingTypes: ['protection', 'strength', 'courage'],
    responsePatterns: [
      '坚毅如金刚，无坚不摧',
      '护佑众生，慈悲济世',
      '勇敢面对困难，必能克服',
      '坚定信念，终有所成'
    ],
    deepseekId: 'budongzun'
  },
  {
    name: '太上老君',
    avatar: '☯️',
    specialty: '道法与自然',
    description: '道法自然，无为而治',
    color: 'var(--metal-autumn)',
    element: '金',
    personality: ['智慧', '自然', '无为', '深邃'],
    wisdomTypes: ['spiritual', 'life', 'career'],
    blessingTypes: ['wisdom', 'peace', 'health'],
    responsePatterns: [
      '道法自然，顺其自然',
      '无为而治，不争而胜',
      '上善若水，厚德载物',
      '知足常乐，随遇而安'
    ],
    deepseekId: 'dashizhi'
  }
];

// 情感分析函数
const analyzeEmotion = (text: string): Message['emotion'] => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('开心') || lowerText.includes('高兴') || lowerText.includes('快乐') || lowerText.includes('😊') || lowerText.includes('😄')) {
    return 'happy';
  } else if (lowerText.includes('难过') || lowerText.includes('伤心') || lowerText.includes('悲伤') || lowerText.includes('😢') || lowerText.includes('😭')) {
    return 'sad';
  } else if (lowerText.includes('生气') || lowerText.includes('愤怒') || lowerText.includes('恼火') || lowerText.includes('😠') || lowerText.includes('😡')) {
    return 'angry';
  } else if (lowerText.includes('担心') || lowerText.includes('忧虑') || lowerText.includes('焦虑') || lowerText.includes('😰') || lowerText.includes('😨')) {
    return 'worried';
  } else if (lowerText.includes('兴奋') || lowerText.includes('激动') || lowerText.includes('期待') || lowerText.includes('😃') || lowerText.includes('🤩')) {
    return 'excited';
  }
  
  return 'neutral';
};

const PersonalizedDeityFriend: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedDeity, setSelectedDeity] = useState<DeityConfig>(deities[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showUserInfoForm, setShowUserInfoForm] = useState(true);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);
  const [deepseekAPI, setDeepseekAPI] = useState<DeepSeekAPI | null>(null);
  const [isAPIConfigured, setIsAPIConfigured] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Record<string, any[]>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化DeepSeek API
  useEffect(() => {
    const initDeepSeekAPI = () => {
      const config = getAPIConfig();
      if (validateAPIKey() && config.deepseek.apiKey) {
        const api = new DeepSeekAPI(config.deepseek.apiKey);
        setDeepseekAPI(api);
        setIsAPIConfigured(true);
      } else {
        setIsAPIConfigured(false);
      }
    };

    initDeepSeekAPI();
  }, []);

  // 加载用户信息
  const loadUserInfo = useCallback(async () => {
    if (!userInfo) return;
    
    setIsLoadingUserInfo(true);
    try {
      // 获取八字信息
      const baziResponse = await apiService.calculateBazi({
        birthdate: userInfo.birthdate,
        name: userInfo.name,
        gender: userInfo.gender
      });

      // 获取今日运势
      const fortuneResponse = await apiService.calculateDailyFortune({
        birthdate: userInfo.birthdate,
        name: userInfo.name,
        gender: userInfo.gender
      });

      setUserInfo(prev => ({
        ...prev!,
        bazi: baziResponse.data,
        dailyFortune: fortuneResponse.data
      }));

      // 更新本地存储
      localStorage.setItem('userInfo', JSON.stringify({
        ...userInfo,
        bazi: baziResponse.data,
        dailyFortune: fortuneResponse.data
      }));

    } catch (error) {
      console.error('加载用户信息失败:', error);
    } finally {
      setIsLoadingUserInfo(false);
    }
  }, [userInfo]);

  // 保存用户信息
  const saveUserInfo = useCallback((info: UserInfo) => {
    setUserInfo(info);
    setShowUserInfoForm(false);
    // 保存到本地存储
    localStorage.setItem('userInfo', JSON.stringify(info));
  }, []);

  // 从本地存储加载用户信息
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      const info = JSON.parse(savedUserInfo);
      setUserInfo(info);
      setShowUserInfoForm(false);
    }
  }, []);

  // 加载用户信息后获取八字和运势
  useEffect(() => {
    if (userInfo && !userInfo.bazi) {
      loadUserInfo();
    }
  }, [userInfo, loadUserInfo]);

  // 生成个性化提示词
  const generatePersonalizedPrompt = useCallback((deity: DeityConfig, userText: string, emotion: Message['emotion']): string => {
    let prompt = `用户信息：姓名${userInfo?.name || '未知'}，`;
    
    // 添加八字信息
    if (userInfo?.bazi) {
      const bazi = userInfo.bazi;
      const dayMaster = bazi.bazi_chart?.day_master;
      const elements = bazi.bazi_chart?.elements;
      
      prompt += `日主${dayMaster || '未知'}，`;
      
      if (elements) {
        const strongestElement = Object.entries(elements).reduce((a, b) => (a[1] as number) > (b[1] as number) ? a : b)[0];
        prompt += `${strongestElement}气较旺，`;
      }
    }
    
    // 添加今日运势信息
    if (userInfo?.dailyFortune) {
      const fortune = userInfo.dailyFortune;
      prompt += `今日运势${fortune.overall_level || '一般'}，`;
      
      if (fortune.lucky_colors && fortune.lucky_colors.length > 0) {
        prompt += `吉利颜色：${fortune.lucky_colors.join('、')}，`;
      }
      
      if (fortune.lucky_directions && fortune.lucky_directions.length > 0) {
        prompt += `吉利方位：${fortune.lucky_directions.join('、')}，`;
      }
    }
    
    // 添加情感状态
    if (emotion && emotion !== 'neutral') {
      const emotionMap = {
        'happy': '心情愉悦',
        'sad': '心情低落',
        'angry': '心情愤怒',
        'worried': '心情忧虑',
        'excited': '心情兴奋'
      };
      prompt += `当前${emotionMap[emotion]}，`;
    }
    
    prompt += `用户说："${userText}"。请以${deity.name}的身份，结合用户信息提供个性化回复。`;
    
    return prompt;
  }, [userInfo]);

  // 生成个性化建议
  const generatePersonalizedAdvice = useCallback((deity: DeityConfig, userText: string, emotion: Message['emotion']): string[] => {
    const advice: string[] = [];
    
    // 基于八字分析的建议
    if (userInfo?.bazi?.analysis) {
      const analysis = userInfo.bazi.analysis;
      
      // 性格建议
      if (analysis.personality && analysis.personality.length > 0) {
        advice.push(`基于你的八字特点：${analysis.personality[0]}`);
      }
      
      // 事业建议
      if (analysis.career && analysis.career.length > 0) {
        advice.push(`事业方面：${analysis.career[0]}`);
      }
      
      // 健康建议
      if (analysis.health && analysis.health.length > 0) {
        advice.push(`健康提醒：${analysis.health[0]}`);
      }
    }
    
    // 基于今日运势的建议
    if (userInfo?.dailyFortune) {
      const fortune = userInfo.dailyFortune;
      
      // 吉利信息
      if (fortune.lucky_colors && fortune.lucky_colors.length > 0) {
        advice.push(`今日吉利颜色：${fortune.lucky_colors.join('、')}`);
      }
      
      if (fortune.lucky_directions && fortune.lucky_directions.length > 0) {
        advice.push(`今日吉利方位：${fortune.lucky_directions.join('、')}`);
      }
      
      // 活动建议
      if (fortune.recommended_activities && fortune.recommended_activities.length > 0) {
        advice.push(`今日建议：${fortune.recommended_activities[0]}`);
      }
    }
    
    // 基于神仙专长的建议
    if (deity.name === '观音菩萨') {
      advice.push('每日冥想十分钟，培养慈悲心');
    } else if (deity.name === '文殊菩萨') {
      advice.push('多读书学习，增长智慧');
    } else if (deity.name === '弥勒佛') {
      advice.push('保持乐观的心态，笑对人生');
    }
    
    return advice.slice(0, 3); // 返回最多3条建议
  }, [userInfo]);

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

    try {
      let aiResponse = '';
      
      // 如果DeepSeek API可用，使用真实AI回复
      if (isAPIConfigured && deepseekAPI && selectedDeity.deepseekId) {
        // 生成个性化提示词
        const personalizedPrompt = generatePersonalizedPrompt(selectedDeity, text, userMessage.emotion!);
        
        // 获取对话历史
        const history = conversationHistory[selectedDeity.deepseekId] || [];
        
        // 调用DeepSeek API
        aiResponse = await deepseekAPI.chatWithDeity(selectedDeity.deepseekId, personalizedPrompt, history);
        
        // 更新对话历史
        setConversationHistory(prev => ({
          ...prev,
          [selectedDeity.deepseekId!]: [
            ...history,
            { role: 'user', content: personalizedPrompt },
            { role: 'assistant', content: aiResponse }
          ]
        }));
      } else {
        // 使用本地生成的回复
        const { responsePatterns } = selectedDeity;
        const baseResponse = responsePatterns[Math.floor(Math.random() * responsePatterns.length)];
        
        // 根据用户信息个性化回复
        if (userInfo?.bazi) {
          const bazi = userInfo.bazi;
          const dayMaster = bazi.bazi_chart?.day_master;
          
          if (dayMaster) {
            aiResponse += `根据你的日主${dayMaster}，`;
          }
        }
        
        // 根据今日运势个性化
        if (userInfo?.dailyFortune) {
          const fortune = userInfo.dailyFortune;
          const overallLevel = fortune.overall_level;
          
          if (overallLevel === '极好' || overallLevel === '很好') {
            aiResponse += `今日运势${overallLevel}，`;
          } else if (overallLevel === '差') {
            aiResponse += `虽然今日运势稍差，但`;
          }
        }
        
        aiResponse += baseResponse;
      }

      // 生成个性化建议
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
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 错误回复
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，神仙暂时无法回应，请稍后再试...',
        sender: 'deity',
        timestamp: new Date(),
        deityName: selectedDeity.name,
        emotion: 'neutral'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [selectedDeity, generatePersonalizedPrompt, generatePersonalizedAdvice, userInfo, isAPIConfigured, deepseekAPI, conversationHistory]);

  // 切换神仙
  const handleDeityChange = (deity: DeityConfig) => {
    setSelectedDeity(deity);
    setMessages([]);
  };

  // 用户信息表单组件
  const UserInfoForm: React.FC = () => {
    const [formData, setFormData] = useState({
      name: '',
      birthdate: '',
      gender: 'male'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.name && formData.birthdate) {
        saveUserInfo({
          name: formData.name,
          birthdate: formData.birthdate,
          gender: formData.gender
        });
      }
    };

    return (
      <div className="zen-card texture-paper" style={{
        background: 'var(--gradient-zen-mist)',
        border: '2px solid var(--earth-golden)',
        borderRadius: 'var(--radius-sun)',
        padding: 'var(--space-stanza)'
      }}>
        <h3 className="zen-subtitle" style={{ textAlign: 'center', marginBottom: 'var(--space-stanza)' }}>
          🎯 个性化设置
        </h3>
        <p style={{ textAlign: 'center', marginBottom: 'var(--space-stanza)', color: 'var(--ink-medium)' }}>
          为了给您提供更精准的指导，请填写以下信息
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-verse)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-breath)', color: 'var(--ink-thick)' }}>
              姓名 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              style={{
                width: '100%',
                padding: 'var(--space-verse)',
                border: '2px solid var(--earth-golden)40',
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-base)',
                background: 'var(--paper-modern)',
                color: 'var(--ink-thick)',
                outline: 'none'
              }}
              placeholder="请输入您的姓名"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-breath)', color: 'var(--ink-thick)' }}>
              出生日期时间 *
            </label>
            <input
              type="datetime-local"
              value={formData.birthdate}
              onChange={(e) => setFormData(prev => ({ ...prev, birthdate: e.target.value }))}
              required
              style={{
                width: '100%',
                padding: 'var(--space-verse)',
                border: '2px solid var(--earth-golden)40',
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-base)',
                background: 'var(--paper-modern)',
                color: 'var(--ink-thick)',
                outline: 'none'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-breath)', color: 'var(--ink-thick)' }}>
              性别 *
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              style={{
                width: '100%',
                padding: 'var(--space-verse)',
                border: '2px solid var(--earth-golden)40',
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-base)',
                background: 'var(--paper-modern)',
                color: 'var(--ink-thick)',
                outline: 'none'
              }}
            >
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={!formData.name || !formData.birthdate}
            style={{
              padding: 'var(--space-verse) var(--space-stanza)',
              background: 'var(--gradient-sunrise)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-moon)',
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              cursor: formData.name && formData.birthdate ? 'pointer' : 'not-allowed',
              opacity: formData.name && formData.birthdate ? 1 : 0.6,
              marginTop: 'var(--space-verse)'
            }}
          >
            开始个性化对话
          </button>
        </form>
      </div>
    );
  };

  // 用户信息面板组件
  const UserInfoPanel: React.FC = () => {
    if (!userInfo) return null;

    return (
      <div className="zen-card texture-silk" style={{
        background: 'var(--gradient-water)',
        border: '2px solid var(--earth-golden)',
        borderRadius: 'var(--radius-sun)',
        padding: 'var(--space-verse)',
        marginBottom: 'var(--space-stanza)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: 'var(--earth-golden)', margin: '0 0 var(--space-breath) 0' }}>
              👤 {userInfo.name}
            </h4>
            <p style={{ color: 'var(--ink-medium)', margin: '0', fontSize: 'var(--text-small)' }}>
              {userInfo.birthdate} | {userInfo.gender === 'male' ? '男' : '女'}
            </p>
          </div>
          
          {isLoadingUserInfo && (
            <div style={{ color: 'var(--earth-golden)' }}>
              🔄 加载中...
            </div>
          )}
          
          {userInfo.bazi && userInfo.dailyFortune && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--earth-golden)', fontSize: 'var(--text-small)' }}>
                📊 八字已加载
              </div>
              <div style={{ color: 'var(--ink-medium)', fontSize: 'var(--text-small)' }}>
                🎯 运势已计算
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 快捷回复组件
  const QuickReplies: React.FC = () => {
    const quickReplies = [
      '我想了解我的事业运势',
      '请给我一些人生建议',
      '我最近心情不好，怎么办？',
      '我想学习一些智慧',
      '请给我一些祝福'
    ];

    return (
      <div style={{ marginBottom: 'var(--space-stanza)' }}>
        <p style={{ color: 'var(--ink-medium)', marginBottom: 'var(--space-breath)', fontSize: 'var(--text-small)' }}>
          💡 快捷回复：
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-breath)' }}>
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => sendMessage(reply)}
              style={{
                padding: 'var(--space-feather) var(--space-breath)',
                background: 'var(--paper-modern)',
                border: '1px solid var(--earth-golden)40',
                borderRadius: 'var(--radius-pebble)',
                fontSize: 'var(--text-small)',
                color: 'var(--ink-medium)',
                cursor: 'pointer',
                transition: 'all var(--duration-smooth)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--earth-golden)10';
                e.currentTarget.style.borderColor = 'var(--earth-golden)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--paper-modern)';
                e.currentTarget.style.borderColor = 'var(--earth-golden)40';
              }}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // 神仙选择组件
  const DeitySelector: React.FC = () => {
    return (
      <div style={{ marginBottom: 'var(--space-stanza)' }}>
        <p style={{ color: 'var(--ink-medium)', marginBottom: 'var(--space-breath)', fontSize: 'var(--text-small)' }}>
          🏛️ 选择神仙：
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-breath)' }}>
          {deities.map((deity) => (
            <button
              key={deity.name}
              onClick={() => handleDeityChange(deity)}
              style={{
                padding: 'var(--space-breath) var(--space-verse)',
                background: selectedDeity.name === deity.name ? 'var(--earth-golden)20' : 'var(--paper-modern)',
                border: `2px solid ${selectedDeity.name === deity.name ? 'var(--earth-golden)' : 'var(--earth-golden)40'}`,
                borderRadius: 'var(--radius-moon)',
                fontSize: 'var(--text-small)',
                color: selectedDeity.name === deity.name ? 'var(--earth-golden)' : 'var(--ink-medium)',
                cursor: 'pointer',
                transition: 'all var(--duration-smooth)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-feather)'
              }}
            >
              <span style={{ fontSize: 'var(--text-base)' }}>{deity.avatar}</span>
              <span>{deity.name}</span>
              {deity.deepseekId && isAPIConfigured && (
                <span style={{ fontSize: 'var(--text-small)', opacity: 0.7 }}>🤖</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // 聊天界面组件
  const ChatInterface: React.FC = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '60vh' }}>
        {/* 消息列表 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-verse)',
          background: 'var(--paper-modern)',
          borderRadius: 'var(--radius-moon)',
          border: '2px solid var(--earth-golden)20',
          marginBottom: 'var(--space-verse)'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--ink-medium)', padding: 'var(--space-stanza)' }}>
              <div style={{ fontSize: 'var(--text-large)', marginBottom: 'var(--space-breath)' }}>
                {selectedDeity.avatar}
              </div>
              <p>开始与{selectedDeity.name}对话吧！</p>
              <p style={{ fontSize: 'var(--text-small)', marginTop: 'var(--space-breath)' }}>
                {selectedDeity.description}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                style={{
                  marginBottom: 'var(--space-verse)',
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: 'var(--space-breath) var(--space-verse)',
                  background: message.sender === 'user' 
                    ? 'var(--gradient-sunrise)' 
                    : 'var(--gradient-water)',
                  color: message.sender === 'user' ? 'white' : 'var(--ink-thick)',
                  borderRadius: 'var(--radius-moon)',
                  border: message.sender === 'deity' ? '1px solid var(--earth-golden)40' : 'none',
                  position: 'relative'
                }}>
                  {message.sender === 'deity' && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      left: 'var(--space-breath)',
                      background: 'var(--earth-golden)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-pebble)',
                      fontSize: 'var(--text-small)',
                      fontWeight: '600'
                    }}>
                      {message.deityName}
                    </div>
                  )}
                  
                  <div style={{ marginTop: message.sender === 'deity' ? 'var(--space-breath)' : '0' }}>
                    {message.content}
                  </div>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div style={{
                      marginTop: 'var(--space-breath)',
                      padding: 'var(--space-breath)',
                      background: 'var(--paper-modern)',
                      borderRadius: 'var(--radius-pebble)',
                      fontSize: 'var(--text-small)',
                      whiteSpace: 'pre-line'
                    }}>
                      {message.attachments[0].content}
                    </div>
                  )}
                  
                  <div style={{
                    fontSize: 'var(--text-small)',
                    opacity: 0.7,
                    marginTop: 'var(--space-feather)',
                    textAlign: 'right'
                  }}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: 'var(--space-breath) var(--space-verse)',
                background: 'var(--gradient-water)',
                borderRadius: 'var(--radius-moon)',
                border: '1px solid var(--earth-golden)40',
                color: 'var(--ink-medium)',
                fontSize: 'var(--text-small)'
              }}>
                {selectedDeity.avatar} {selectedDeity.name}正在思考...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div style={{ display: 'flex', gap: 'var(--space-breath)' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(inputText);
              }
            }}
            placeholder={`与${selectedDeity.name}对话...`}
            disabled={isTyping}
            style={{
              flex: 1,
              padding: 'var(--space-verse)',
              border: '2px solid var(--earth-golden)40',
              borderRadius: 'var(--radius-moon)',
              fontSize: 'var(--text-base)',
              background: 'var(--paper-modern)',
              color: 'var(--ink-thick)',
              outline: 'none'
            }}
          />
          <button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isTyping}
            style={{
              padding: 'var(--space-verse) var(--space-stanza)',
              background: 'var(--gradient-sunrise)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-moon)',
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              cursor: inputText.trim() && !isTyping ? 'pointer' : 'not-allowed',
              opacity: inputText.trim() && !isTyping ? 1 : 0.6
            }}
          >
            发送
          </button>
        </div>
      </div>
    );
  };

  // API配置提示组件
  const APIConfigNotice: React.FC = () => {
    if (isAPIConfigured) return null;

    return (
      <div style={{
        padding: 'var(--space-verse)',
        background: 'var(--fire-phoenix)10',
        border: '1px solid var(--fire-phoenix)40',
        borderRadius: 'var(--radius-moon)',
        marginBottom: 'var(--space-stanza)',
        color: 'var(--fire-phoenix)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-breath)' }}>
          <span>🔑</span>
          <div>
            <strong>DeepSeek API未配置</strong>
            <p style={{ margin: 'var(--space-feather) 0 0 0', fontSize: 'var(--text-small)' }}>
              当前使用本地回复模式。配置API密钥后可获得更智能的对话体验。
            </p>
          </div>
        </div>
      </div>
    );
  };

  // 主界面
  if (showUserInfoForm) {
    return (
      <div className="zen-container">
        <UserInfoForm />
      </div>
    );
  }

  return (
    <div className="zen-container">
      <UserInfoPanel />
      <APIConfigNotice />
      <DeitySelector />
      <QuickReplies />
      <ChatInterface />
    </div>
  );
};

export default PersonalizedDeityFriend; 