import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics } from '../hooks/useAnalytics';

interface ChatPageOptimizedProps {
  onNavigate: (page: string) => void;
}

interface Message {
  id: string;
  type: 'user' | 'deity';
  content: string;
  timestamp: Date;
  deity?: string;
  mood?: string;
  attachments?: MessageAttachment[];
}

interface MessageAttachment {
  type: 'fortune' | 'blessing' | 'guidance';
  title: string;
  content: string;
  icon: string;
}

interface DeityInfo {
  name: string;
  title: string;
  avatar: string;
  speciality: string;
  color: string;
  description: string;
}

const ChatPageOptimized: React.FC<ChatPageOptimizedProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentDeity, setCurrentDeity] = useState<DeityInfo | null>(null);
  const [showDeitySelector, setShowDeitySelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 📊 分析追踪
  const analytics = useAnalytics();

  // 神仙信息
  const deities: DeityInfo[] = [
    {
      name: '观世音菩萨',
      title: '大慈大悲',
      avatar: '🙏',
      speciality: '慈悲救度，闻声救苦',
      color: '#D4AF37',
      description: '观世音菩萨以慈悲闻名，善于倾听众生心声，化解烦恼忧愁'
    },
    {
      name: '文殊菩萨',
      title: '智慧第一',
      avatar: '📚',
      speciality: '智慧开悟，学业事业',
      color: '#3B82F6',
      description: '文殊菩萨主管智慧，能够启发思维，帮助解决学习和工作难题'
    },
    {
      name: '地藏王菩萨',
      title: '大愿地藏',
      avatar: '🌍',
      speciality: '消除业障，超度亡灵',
      color: '#8B5CF6',
      description: '地藏王菩萨发大愿度众生，专门帮助消除业障、化解冤孽'
    },
    {
      name: '弥勒佛',
      title: '欢喜佛',
      avatar: '😊',
      speciality: '快乐幸福，心境开朗',
      color: '#F59E0B',
      description: '弥勒佛笑口常开，能够带来欢乐，化解忧愁，让人心境开朗'
    },
    {
      name: '药师佛',
      title: '东方琉璃',
      avatar: '💊',
      speciality: '健康医疗，消灾延寿',
      color: '#10B981',
      description: '药师佛主管众生健康，能够治疗疾病，保佑身体安康'
    }
  ];

  // 预设回复模板
  const responseTemplates = {
    greeting: [
      '阿弥陀佛，施主，{deity}在此聆听您的心声。',
      '善哉善哉，{deity}感受到您的虔诚之心。',
      '慈悲为怀，{deity}愿为您答疑解惑。'
    ],
    wisdom: [
      '心如明镜台，时时勤拂拭。施主，您的困惑{deity}已知晓。',
      '一切有为法，如梦幻泡影。{deity}为您开示：',
      '菩提本无树，明镜亦非台。{deity}告诉您：'
    ],
    blessing: [
      '愿您身心安康，诸事顺遂。{deity}为您送上慈悲加持。',
      '功德无量，善缘广结。{deity}为您祈福。',
      '愿您智慧增长，烦恼消除。{deity}护佑于您。'
    ],
    encouragement: [
      '山重水复疑无路，柳暗花明又一村。{deity}鼓励您要坚持。',
      '宝剑锋从磨砺出，梅花香自苦寒来。{deity}为您加油。',
      '千里之行始于足下，{deity}支持您勇敢前行。'
    ]
  };

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化
  useEffect(() => {
    // 追踪页面访问
    analytics.trackPageView('chat', '与神对话');
    analytics.trackEvent('chat_page_load');
    
    // 设置默认神仙
    setCurrentDeity(deities[0]);
    
    // 添加欢迎消息
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'deity',
      content: '阿弥陀佛，善信，欢迎来到神仙朋友！我是观世音菩萨，将以慈悲之心为您答疑解惑。有什么心事想要倾诉吗？',
      timestamp: new Date(),
      deity: '观世音菩萨',
      mood: 'compassionate'
    };
    
    setMessages([welcomeMessage]);
    
    // 聚焦输入框
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, [analytics]);

  // 发送消息
  const sendMessage = async () => {
    if (!inputText.trim() || !currentDeity) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    // 追踪消息发送
    analytics.trackUserAction('chat_message_sent', {
      messageLength: inputText.trim().length,
      deity: currentDeity.name,
      messageType: 'user'
    });

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // 模拟神仙回复
    setTimeout(() => {
      const deityReply = generateDeityReply(inputText, currentDeity);
      
      // 追踪神仙回复
      analytics.trackUserAction('deity_reply_generated', {
        deity: currentDeity.name,
        replyLength: deityReply.content.length,
        hasAttachments: (deityReply.attachments?.length || 0) > 0
      });
      
      setMessages(prev => [...prev, deityReply]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  // 生成神仙回复
  const generateDeityReply = (userInput: string, deity: DeityInfo): Message => {
    const lowerInput = userInput.toLowerCase();
    let template: string[];
    let replyContent = '';
    let attachments: MessageAttachment[] = [];

    // 根据用户输入选择回复类型
    if (lowerInput.includes('你好') || lowerInput.includes('您好') || lowerInput.includes('问候')) {
      template = responseTemplates.greeting;
    } else if (lowerInput.includes('烦恼') || lowerInput.includes('困惑') || lowerInput.includes('迷茫')) {
      template = responseTemplates.wisdom;
      
      // 添加智慧指引附件
      attachments.push({
        type: 'guidance',
        title: '智慧指引',
        content: '烦恼即菩提，当下即解脱。放下执念，心境自然清明。',
        icon: '💡'
      });
    } else if (lowerInput.includes('祝福') || lowerInput.includes('保佑') || lowerInput.includes('祈福')) {
      template = responseTemplates.blessing;
      
      // 添加加持附件
      attachments.push({
        type: 'blessing',
        title: '慈悲加持',
        content: '愿您身心安康，家庭和睦，事业顺遂，福慧双修。',
        icon: '🙏'
      });
    } else if (lowerInput.includes('鼓励') || lowerInput.includes('支持') || lowerInput.includes('加油')) {
      template = responseTemplates.encouragement;
    } else {
      template = responseTemplates.wisdom;
    }

    // 生成基础回复
    const randomTemplate = template[Math.floor(Math.random() * template.length)];
    replyContent = randomTemplate.replace('{deity}', deity.name);

    // 根据神仙特长添加专业建议
    switch (deity.name) {
      case '观世音菩萨':
        replyContent += '\n\n慈悲心是解决一切问题的良药，以慈待人，以悲济世，自然能化解心中烦恼。';
        break;
      case '文殊菩萨':
        replyContent += '\n\n智慧如明灯，能照亮前路。多读书、多思考、多实践，智慧自然增长。';
        break;
      case '地藏王菩萨':
        replyContent += '\n\n业力如影随形，但善行能消业障。多行善事，积累功德，自然化解困厄。';
        break;
      case '弥勒佛':
        replyContent += '\n\n笑一笑，十年少。保持乐观心态，以欢喜心面对生活，自然诸事顺遂。';
        break;
      case '药师佛':
        replyContent += '\n\n身心健康最重要。规律作息，适度运动，清淡饮食，保持良好心境。';
        break;
    }

    return {
      id: Date.now().toString(),
      type: 'deity',
      content: replyContent,
      timestamp: new Date(),
      deity: deity.name,
      mood: 'wise',
      attachments
    };
  };

  // 切换神仙
  const switchDeity = (deity: DeityInfo) => {
    // 追踪神仙切换
    analytics.trackUserAction('deity_switched', {
      from: currentDeity?.name,
      to: deity.name,
      deitySpeciality: deity.speciality
    });
    
    setCurrentDeity(deity);
    setShowDeitySelector(false);
    
    // 添加切换消息
    const switchMessage: Message = {
      id: Date.now().toString(),
      type: 'deity',
      content: `阿弥陀佛，${deity.name}前来与您对话。${deity.description}，有什么可以为您解答的吗？`,
      timestamp: new Date(),
      deity: deity.name,
      mood: 'welcoming'
    };
    
    setMessages(prev => [...prev, switchMessage]);
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--zen-bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(212, 175, 55, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)',
        zIndex: -1
      }} />

      {/* 顶部栏 */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: 'var(--zen-bg-card)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--zen-border-subtle)',
          padding: 'var(--zen-space-lg)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            className="zen-btn zen-btn-ghost zen-btn-sm"
            onClick={() => onNavigate('home')}
          >
            ← 返回
          </button>

          {currentDeity && (
            <motion.button
              className="zen-flex zen-items-center zen-gap-md"
              onClick={() => setShowDeitySelector(!showDeitySelector)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'var(--zen-bg-glass)',
                border: '1px solid var(--zen-border-normal)',
                borderRadius: 'var(--zen-radius-lg)',
                padding: 'var(--zen-space-md) var(--zen-space-lg)',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{currentDeity.avatar}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontSize: 'var(--zen-text-base)',
                  fontWeight: 600,
                  color: 'var(--zen-text-primary)'
                }}>
                  {currentDeity.name}
                </div>
                <div style={{
                  fontSize: 'var(--zen-text-xs)',
                  color: 'var(--zen-text-tertiary)'
                }}>
                  {currentDeity.title}
                </div>
              </div>
              <span style={{
                fontSize: 'var(--zen-text-sm)',
                color: 'var(--zen-text-tertiary)',
                marginLeft: 'var(--zen-space-sm)'
              }}>
                ▼
              </span>
            </motion.button>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--zen-space-sm)'
          }}>
            <div className="zen-status zen-status-success">
              🟢 在线
            </div>
          </div>
        </div>
      </motion.div>

      {/* 神仙选择器 */}
      <AnimatePresence>
        {showDeitySelector && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'sticky',
              top: '80px',
              zIndex: 99,
              background: 'var(--zen-bg-card)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--zen-border-normal)',
              borderTop: 'none',
              padding: 'var(--zen-space-lg)'
            }}
          >
            <div style={{
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <h4 style={{
                fontSize: 'var(--zen-text-base)',
                fontWeight: 600,
                color: 'var(--zen-text-primary)',
                marginBottom: 'var(--zen-space-lg)',
                textAlign: 'center'
              }}>
                🙏 选择您想对话的神仙
              </h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--zen-space-md)'
              }}>
                {deities.map((deity) => (
                  <motion.button
                    key={deity.name}
                    onClick={() => switchDeity(deity)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: currentDeity?.name === deity.name 
                        ? `${deity.color}20` 
                        : 'var(--zen-bg-glass)',
                      border: currentDeity?.name === deity.name 
                        ? `1px solid ${deity.color}` 
                        : '1px solid var(--zen-border-subtle)',
                      borderRadius: 'var(--zen-radius-lg)',
                      padding: 'var(--zen-space-lg)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all var(--zen-duration-normal)'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: 'var(--zen-space-sm)' }}>
                      {deity.avatar}
                    </div>
                    
                    <div style={{
                      fontSize: 'var(--zen-text-sm)',
                      fontWeight: 600,
                      color: currentDeity?.name === deity.name ? deity.color : 'var(--zen-text-primary)',
                      marginBottom: 'var(--zen-space-xs)'
                    }}>
                      {deity.name}
                    </div>
                    
                    <div style={{
                      fontSize: 'var(--zen-text-xs)',
                      color: 'var(--zen-text-tertiary)'
                    }}>
                      {deity.speciality}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 聊天区域 */}
      <div style={{
        flex: 1,
        maxWidth: '600px',
        margin: '0 auto',
        padding: 'var(--zen-space-lg)',
        paddingBottom: '120px', // 为输入框留空间
        width: '100%'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zen-space-lg)' }}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: 'var(--zen-space-md)'
              }}
            >
              {/* 神仙头像 */}
              {message.type === 'deity' && currentDeity && (
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  style={{
                    width: '40px',
                    height: '40px',
                    background: `${currentDeity.color}20`,
                    border: `2px solid ${currentDeity.color}`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}
                >
                  {currentDeity.avatar}
                </motion.div>
              )}

              {/* 消息内容 */}
              <div style={{
                maxWidth: '80%',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--zen-space-sm)'
              }}>
                {/* 消息气泡 */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  style={{
                    background: message.type === 'user' 
                      ? 'var(--zen-gradient-gold)' 
                      : 'var(--zen-bg-card)',
                    color: message.type === 'user' 
                      ? 'white' 
                      : 'var(--zen-text-primary)',
                    padding: 'var(--zen-space-lg)',
                    borderRadius: message.type === 'user' 
                      ? 'var(--zen-radius-lg) var(--zen-radius-lg) var(--zen-radius-xs) var(--zen-radius-lg)'
                      : 'var(--zen-radius-lg) var(--zen-radius-lg) var(--zen-radius-lg) var(--zen-radius-xs)',
                    border: message.type === 'deity' ? '1px solid var(--zen-border-subtle)' : 'none',
                    boxShadow: message.type === 'user' 
                      ? 'var(--zen-shadow-glow)' 
                      : 'var(--zen-shadow-md)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div style={{
                    fontSize: 'var(--zen-text-base)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {message.content}
                  </div>
                  
                  {/* 时间戳 */}
                  <div style={{
                    fontSize: 'var(--zen-text-xs)',
                    opacity: 0.7,
                    marginTop: 'var(--zen-space-sm)',
                    textAlign: message.type === 'user' ? 'right' : 'left'
                  }}>
                    {message.timestamp.toLocaleTimeString('zh-CN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </motion.div>

                {/* 附件 */}
                {message.attachments && message.attachments.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zen-space-sm)' }}>
                    {message.attachments.map((attachment, attIndex) => (
                      <motion.div
                        key={attIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{
                          background: 'var(--zen-bg-glass)',
                          border: '1px solid var(--zen-border-normal)',
                          borderRadius: 'var(--zen-radius-lg)',
                          padding: 'var(--zen-space-lg)'
                        }}
                      >
                        <div className="zen-flex zen-items-center zen-gap-md zen-mb-sm">
                          <span style={{ fontSize: '1.2rem' }}>{attachment.icon}</span>
                          <span style={{
                            fontSize: 'var(--zen-text-sm)',
                            fontWeight: 600,
                            color: 'var(--zen-primary)'
                          }}>
                            {attachment.title}
                          </span>
                        </div>
                        
                        <div style={{
                          fontSize: 'var(--zen-text-sm)',
                          color: 'var(--zen-text-secondary)',
                          lineHeight: 1.5
                        }}>
                          {attachment.content}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* 用户头像 */}
              {message.type === 'user' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: 'var(--zen-gradient-gold)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  color: 'white',
                  flexShrink: 0
                }}>
                  👤
                </div>
              )}
            </motion.div>
          ))}

          {/* 正在输入指示器 */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--zen-space-md)'
                }}
              >
                {currentDeity && (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: `${currentDeity.color}20`,
                    border: `2px solid ${currentDeity.color}`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    {currentDeity.avatar}
                  </div>
                )}
                
                <div style={{
                  background: 'var(--zen-bg-card)',
                  border: '1px solid var(--zen-border-subtle)',
                  borderRadius: 'var(--zen-radius-lg)',
                  padding: 'var(--zen-space-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--zen-space-sm)'
                }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                      style={{
                        width: '8px',
                        height: '8px',
                        background: 'var(--zen-primary)',
                        borderRadius: '50%'
                      }}
                    />
                  ))}
                  
                  <span style={{
                    fontSize: 'var(--zen-text-sm)',
                    color: 'var(--zen-text-tertiary)',
                    marginLeft: 'var(--zen-space-sm)'
                  }}>
                    {currentDeity?.name}正在输入...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--zen-bg-card)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--zen-border-subtle)',
          padding: 'var(--zen-space-lg)',
          zIndex: 100
        }}
      >
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          gap: 'var(--zen-space-md)',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`向${currentDeity?.name || '神仙'}倾诉您的心声...`}
              className="zen-input"
              style={{
                paddingRight: '50px',
                minHeight: '48px'
              }}
              disabled={isTyping}
            />
            
            {inputText && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setInputText('')}
                style={{
                  position: 'absolute',
                  right: 'var(--zen-space-lg)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--zen-text-tertiary)',
                  cursor: 'pointer',
                  fontSize: 'var(--zen-text-lg)'
                }}
              >
                ✕
              </motion.button>
            )}
          </div>
          
          <motion.button
            className="zen-btn zen-btn-primary"
            onClick={sendMessage}
            disabled={!inputText.trim() || isTyping}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              minWidth: '60px',
              height: '48px',
              padding: '0 var(--zen-space-lg)',
              opacity: (!inputText.trim() || isTyping) ? 0.5 : 1
            }}
          >
            {isTyping ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⏳
              </motion.div>
            ) : (
              '📤'
            )}
          </motion.button>
        </div>
        
        {/* 输入提示 */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          marginTop: 'var(--zen-space-sm)',
          fontSize: 'var(--zen-text-xs)',
          color: 'var(--zen-text-muted)',
          textAlign: 'center'
        }}>
          💡 您可以询问运势、寻求建议、或请求加持祝福
        </div>
      </motion.div>
    </div>
  );
};

export default ChatPageOptimized; 