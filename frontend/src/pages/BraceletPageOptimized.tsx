import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics } from '../hooks/useAnalytics';

interface BraceletPageOptimizedProps {
  onNavigate: (page: string) => void;
}

interface BraceletInfo {
  id: string;
  owner: string;
  chipId: string;
  material: string;
  beadCount: number;
  imageUrl?: string;
  energyLevel: number;
  consecrationDate?: string;
  consecrationTemple?: string;
  consecrationMaster?: string;
  consecrationVideo?: string;
}

interface MeritRecord {
  count: number;
  dailyCount: number;
  totalDays: number;
}

interface MeritLevel {
  level: string;
  color: string;
  progress: number;
  nextLevelAt: number;
}

const BraceletPageOptimized: React.FC<BraceletPageOptimizedProps> = ({ onNavigate }) => {
  const [braceletInfo, setBraceletInfo] = useState<BraceletInfo | null>(null);
  const [meritRecord, setMeritRecord] = useState<MeritRecord | null>(null);
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'verifying' | 'error'>('disconnected');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 验证相关状态
  const [braceletIdInput, setBraceletIdInput] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'manual' | 'nfc' | 'qr'>('manual');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // 心经修持相关状态
  const [sutraPlaying, setSutraPlaying] = useState(false);
  const [showSutraText, setShowSutraText] = useState(false);
  const [showSutraVideo, setShowSutraVideo] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // 能量分析相关状态
  const [showEnergyDetails, setShowEnergyDetails] = useState(false);
  
  // 开光视频相关状态
  const [showConsecrationVideo, setShowConsecrationVideo] = useState(false);
  
  // 📊 分析追踪
  const analytics = useAnalytics();

  // 心经文本
  const sutraText = `
    观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。
    舍利子，色不异空，空不异色；色即是空，空即是色；受想行识，亦复如是。
    舍利子，是诸法空相，不生不灭，不垢不净，不增不减。
    是故空中无色，无受想行识；无眼耳鼻舌身意，无色声香味触法；
    无眼界，乃至无意识界；无无明，亦无无明尽，乃至无老死，亦无老死尽；
    无苦集灭道，无智亦无得，以无所得故，菩提萨埵，依般若波罗蜜多故，
    心无罣碍，无罣碍故，无有恐怖，远离颠倒梦想，究竟涅槃。
    三世诸佛，依般若波罗蜜多故，得阿耨多罗三藐三菩提。
    故知般若波罗蜜多，是大神咒，是大明咒，是无上咒，是无等等咒，
    能除一切苦，真实不虚。
    故说般若波罗蜜多咒，即说咒曰：揭谛，揭谛，波罗揭谛，波罗僧揭谛，菩提萨婆诃。
  `;

  // 模拟数据
  const mockBraceletInfo: BraceletInfo = {
    id: 'BR001',
    owner: '张三',
    chipId: 'CHIP-2024-001',
    material: '小叶紫檀',
    beadCount: 108,
    energyLevel: 85,
    consecrationDate: '2024年1月15日',
    consecrationTemple: '灵隐寺',
    consecrationMaster: '慧明法师',
    consecrationVideo: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/669_raw.mp4'
  };

  const mockMeritRecord: MeritRecord = {
    count: 1248,
    dailyCount: 73,
    totalDays: 45
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return '#10B981';
      case 'disconnected': return '#EF4444';
      case 'verifying': return '#F59E0B';
      case 'error': return '#DC2626';
      default: return '#6B7280';
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return '已连接';
      case 'disconnected': return '未连接';
      case 'verifying': return '验证中';
      case 'error': return '连接错误';
      default: return '未知状态';
    }
  };

  // 获取功德等级
  const getMeritLevel = (): MeritLevel | null => {
    if (!meritRecord) return null;
    
    const count = meritRecord.count;
    if (count < 100) {
      return {
        level: '初心者',
        color: '#10B981',
        progress: (count / 100) * 100,
        nextLevelAt: 100
      };
    } else if (count < 500) {
      return {
        level: '修行者',
        color: '#3B82F6',
        progress: ((count - 100) / 400) * 100,
        nextLevelAt: 500
      };
    } else if (count < 1000) {
      return {
        level: '善行者',
        color: '#8B5CF6',
        progress: ((count - 500) / 500) * 100,
        nextLevelAt: 1000
      };
    } else if (count < 2000) {
      return {
        level: '慈悲者',
        color: '#F59E0B',
        progress: ((count - 1000) / 1000) * 100,
        nextLevelAt: 2000
      };
    } else {
      return {
        level: '觉悟者',
        color: '#D4AF37',
        progress: 100,
        nextLevelAt: count
      };
    }
  };

  // 验证手串
  const handleVerifyBracelet = async () => {
    if (verificationMethod === 'manual' && !braceletIdInput.trim()) return;
    
    // 追踪手串验证
    analytics.trackUserAction('bracelet_verification_started', {
      method: verificationMethod,
      hasInput: !!braceletIdInput.trim()
    });
    
    setIsVerifying(true);
    setError(null);
    
    try {
      // 模拟验证过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟验证成功
      setBraceletInfo(mockBraceletInfo);
      setMeritRecord(mockMeritRecord);
      setStatus('connected');
      setShowVerificationModal(false);
      setBraceletIdInput('');
      
      // 追踪验证成功
      analytics.trackUserAction('bracelet_verification_success', {
        method: verificationMethod,
        braceletId: mockBraceletInfo.id,
        material: mockBraceletInfo.material
      });
      
      // 保存到本地存储
      localStorage.setItem('braceletActivated', 'true');
      localStorage.setItem('braceletInfo', JSON.stringify(mockBraceletInfo));
      localStorage.setItem('meritRecord', JSON.stringify(mockMeritRecord));
      
    } catch (error) {
      setError('验证失败，请检查手串编号是否正确');
      if (error instanceof Error) {
        analytics.trackError(error, 'bracelet_verification_failed');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // NFC验证
  const handleNFCVerification = async () => {
    setVerificationMethod('nfc');
    setIsVerifying(true);
    setError(null);
    
    try {
      // 模拟NFC读取
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟成功
      setBraceletInfo(mockBraceletInfo);
      setMeritRecord(mockMeritRecord);
      setStatus('connected');
      
      localStorage.setItem('braceletActivated', 'true');
      localStorage.setItem('braceletInfo', JSON.stringify(mockBraceletInfo));
      localStorage.setItem('meritRecord', JSON.stringify(mockMeritRecord));
      
    } catch (error) {
      setError('NFC读取失败，请确保手串靠近手机');
    } finally {
      setIsVerifying(false);
    }
  };

  // 扫码验证
  const handleQRVerification = async () => {
    setVerificationMethod('qr');
    setIsVerifying(true);
    setError(null);
    
    try {
      // 模拟扫码
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟成功
      setBraceletInfo(mockBraceletInfo);
      setMeritRecord(mockMeritRecord);
      setStatus('connected');
      
      localStorage.setItem('braceletActivated', 'true');
      localStorage.setItem('braceletInfo', JSON.stringify(mockBraceletInfo));
      localStorage.setItem('meritRecord', JSON.stringify(mockMeritRecord));
      
    } catch (error) {
      setError('扫码失败，请重试');
    } finally {
      setIsVerifying(false);
    }
  };

  // 完成修持
  const handleCompletePractice = () => {
    if (!meritRecord) return;
    
    // 追踪修持完成
    analytics.trackUserAction('practice_completed', {
      previousCount: meritRecord.count,
      previousDailyCount: meritRecord.dailyCount,
      practiceType: sutraPlaying ? 'sutra' : 'video'
    });
    
    const newMeritRecord = {
      ...meritRecord,
      count: meritRecord.count + 1,
      dailyCount: meritRecord.dailyCount + 1
    };
    
    setMeritRecord(newMeritRecord);
    setSutraPlaying(false);
    setIsVideoPlaying(false);
    
    // 保存到本地存储
    localStorage.setItem('meritRecord', JSON.stringify(newMeritRecord));
    
    // 震动反馈
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }
  };

  // 处理视频播放/暂停
  const handleVideoToggle = () => {
    setIsVideoPlaying(!isVideoPlaying);
    setSutraPlaying(!isVideoPlaying);
  };

  // 处理视频结束
  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
    setSutraPlaying(false);
  };

  // 刷新状态
  const refreshStatus = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // 模拟状态刷新
      setStatus('connected');
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // 加载现有数据
  useEffect(() => {
    // 追踪手串页面访问
    analytics.trackPageView('bracelet', '手串状态');
    analytics.trackEvent('bracelet_page_load');
    
    const loadExistingData = async () => {
      const isActivated = localStorage.getItem('braceletActivated') === 'true';
      
      if (isActivated) {
        try {
          const savedBraceletInfo = localStorage.getItem('braceletInfo');
          const savedMeritRecord = localStorage.getItem('meritRecord');
          
          if (savedBraceletInfo) {
            setBraceletInfo(JSON.parse(savedBraceletInfo));
          }
          
          if (savedMeritRecord) {
            setMeritRecord(JSON.parse(savedMeritRecord));
          }
          
          setStatus('connected');
          analytics.trackEvent('bracelet_already_activated');
        } catch (error) {
          console.error('加载手串数据失败:', error);
          if (error instanceof Error) {
            analytics.trackError(error, 'bracelet_load_data');
          }
        }
      } else {
        analytics.trackEvent('bracelet_not_activated');
      }
    };

    loadExistingData();
  }, [analytics]);

  // 如果没有手串信息，显示验证界面
  if (!braceletInfo) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--zen-bg-primary)',
        position: 'relative'
      }}>
        {/* 背景装饰 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 50%)',
          zIndex: -1
        }} />

        <div style={{
          padding: 'var(--zen-space-2xl) var(--zen-space-lg)',
          maxWidth: '500px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="zen-card"
            style={{ width: '100%' }}
          >
            <div className="zen-text-center zen-mb-2xl">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ fontSize: '4rem', marginBottom: 'var(--zen-space-lg)' }}
              >
                📿
              </motion.div>
              
              <h1 style={{
                fontSize: 'var(--zen-text-3xl)',
                fontWeight: 700,
                color: 'var(--zen-text-primary)',
                marginBottom: 'var(--zen-space-lg)'
              }}>
                我的法宝手串
              </h1>
              
              <p style={{
                fontSize: 'var(--zen-text-base)',
                color: 'var(--zen-text-secondary)',
                lineHeight: 1.6
              }}>
                验证您的开光手串，开启修行之路
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'var(--zen-error-alpha)',
                  border: '1px solid var(--zen-error)',
                  borderRadius: 'var(--zen-radius-lg)',
                  padding: 'var(--zen-space-lg)',
                  marginBottom: 'var(--zen-space-xl)',
                  color: 'var(--zen-error-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--zen-space-sm)'
                }}
              >
                <span>⚠️</span>
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    marginLeft: 'auto'
                  }}
                >
                  ✕
                </button>
              </motion.div>
            )}

            <div className="zen-form-group">
              <label className="zen-label zen-label-required">手串编号</label>
              <input
                type="text"
                value={braceletIdInput}
                onChange={(e) => setBraceletIdInput(e.target.value)}
                placeholder="请输入您的手串编号"
                className="zen-input"
                disabled={isVerifying}
              />
            </div>

            <motion.button
              className="zen-btn zen-btn-primary zen-btn-lg"
              onClick={handleVerifyBracelet}
              disabled={isVerifying || !braceletIdInput.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                marginBottom: 'var(--zen-space-xl)',
                opacity: (!braceletIdInput.trim() || isVerifying) ? 0.5 : 1
              }}
            >
              {isVerifying ? (
                <div className="zen-flex zen-items-center zen-gap-md">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    ⏳
                  </motion.div>
                  验证中...
                </div>
              ) : (
                '验证手串'
              )}
            </motion.button>

            <div style={{ marginBottom: 'var(--zen-space-xl)' }}>
              <p style={{
                fontSize: 'var(--zen-text-sm)',
                color: 'var(--zen-text-tertiary)',
                textAlign: 'center',
                marginBottom: 'var(--zen-space-lg)'
              }}>
                其他验证方式
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--zen-space-lg)'
              }}>
                <motion.button
                  className="zen-btn zen-btn-secondary"
                  onClick={handleNFCVerification}
                  disabled={isVerifying}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    opacity: isVerifying ? 0.5 : 1
                  }}
                >
                  <div className="zen-flex zen-flex-col zen-items-center zen-gap-sm">
                    <span style={{ fontSize: '1.5rem' }}>📱</span>
                    <span style={{ fontSize: 'var(--zen-text-sm)' }}>NFC感应</span>
                    <small style={{ fontSize: 'var(--zen-text-xs)' }}>
                      {isVerifying && verificationMethod === 'nfc' ? '读取中...' : '快速验证'}
                    </small>
                  </div>
                </motion.button>
                
                <motion.button
                  className="zen-btn zen-btn-secondary"
                  onClick={handleQRVerification}
                  disabled={isVerifying}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    opacity: isVerifying ? 0.5 : 1
                  }}
                >
                  <div className="zen-flex zen-flex-col zen-items-center zen-gap-sm">
                    <span style={{ fontSize: '1.5rem' }}>📷</span>
                    <span style={{ fontSize: 'var(--zen-text-sm)' }}>扫码验证</span>
                    <small style={{ fontSize: 'var(--zen-text-xs)' }}>
                      {isVerifying && verificationMethod === 'qr' ? '扫描中...' : '扫码识别'}
                    </small>
                  </div>
                </motion.button>
              </div>
            </div>

            <div style={{
              background: 'var(--zen-info-alpha)',
              border: '1px solid var(--zen-info)',
              borderRadius: 'var(--zen-radius-lg)',
              padding: 'var(--zen-space-lg)',
              color: 'var(--zen-info-light)',
              fontSize: 'var(--zen-text-sm)',
              textAlign: 'center'
            }}>
              💡 请确保手串已开光，验证后可获得菩萨加持
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const meritLevel = getMeritLevel();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--zen-bg-primary)',
      position: 'relative'
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 50%)',
        zIndex: -1
      }} />

      <div style={{
        padding: 'var(--zen-space-2xl) var(--zen-space-lg)',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        {/* 标题区域 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="zen-text-center zen-mb-2xl"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ fontSize: '3rem', marginBottom: 'var(--zen-space-lg)' }}
          >
            📿
          </motion.div>
          
          <h1 style={{
            fontSize: 'var(--zen-text-3xl)',
            fontWeight: 700,
            color: 'var(--zen-text-primary)',
            marginBottom: 'var(--zen-space-sm)'
          }}>
            我的神仙手串
          </h1>
          
          <div className="zen-flex zen-items-center zen-justify-center zen-gap-lg">
            <div className="zen-status" style={{
              background: getStatusColor(status) + '20',
              color: getStatusColor(status)
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                background: getStatusColor(status),
                borderRadius: '50%',
                marginRight: 'var(--zen-space-sm)'
              }} />
              {getStatusText(status)}
            </div>
          </div>
        </motion.div>

        {/* 手串状态卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="zen-card zen-mb-xl"
        >
          <div className="zen-flex zen-items-center zen-gap-lg">
            <div style={{ position: 'relative' }}>
              {braceletInfo.imageUrl ? (
                <img
                  src={braceletInfo.imageUrl}
                  alt={`${braceletInfo.owner}的手串`}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--zen-radius-lg)',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'var(--zen-bg-glass)',
                  borderRadius: 'var(--zen-radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  border: '2px solid var(--zen-border-normal)'
                }}>
                  📿
                </div>
              )}
              
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '20px',
                  height: '20px',
                  background: getStatusColor(status),
                  borderRadius: '50%',
                  border: '2px solid var(--zen-bg-primary)'
                }}
              />
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: 'var(--zen-text-lg)',
                fontWeight: 600,
                color: 'var(--zen-text-primary)',
                marginBottom: 'var(--zen-space-sm)'
              }}>
                {braceletInfo.owner}的法宝
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--zen-space-sm)',
                fontSize: 'var(--zen-text-xs)'
              }}>
                <div>
                  <div style={{ color: 'var(--zen-text-tertiary)' }}>芯片编号</div>
                  <div style={{ color: 'var(--zen-text-primary)', fontWeight: 500 }}>
                    {braceletInfo.chipId}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--zen-text-tertiary)' }}>材质</div>
                  <div style={{ color: 'var(--zen-text-primary)', fontWeight: 500 }}>
                    {braceletInfo.material}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--zen-text-tertiary)' }}>佛珠</div>
                  <div style={{ color: 'var(--zen-text-primary)', fontWeight: 500 }}>
                    {braceletInfo.beadCount}颗
                  </div>
                </div>
              </div>
            </div>
            
            <motion.button
              onClick={refreshStatus}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--zen-text-tertiary)',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
              disabled={loading}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  ⏳
                </motion.div>
              ) : (
                '🔄'
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* 能量状态分析 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="zen-card zen-mb-xl"
        >
          <div className="zen-flex zen-justify-between zen-items-center zen-mb-lg">
            <h3 style={{
              fontSize: 'var(--zen-text-lg)',
              fontWeight: 600,
              color: 'var(--zen-text-primary)'
            }}>
              能量状态分析
            </h3>
            
            <button
              onClick={() => setShowEnergyDetails(!showEnergyDetails)}
              className="zen-btn zen-btn-ghost zen-btn-sm"
            >
              {showEnergyDetails ? '简化' : '详情'}
            </button>
          </div>
          
          <div className="zen-flex zen-items-center zen-gap-lg">
            <div style={{ position: 'relative' }}>
              <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="var(--zen-border-subtle)"
                  strokeWidth="6"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="var(--zen-primary)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '0 220' }}
                  animate={{ 
                    strokeDasharray: `${(braceletInfo.energyLevel / 100) * 220} 220` 
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: 'var(--zen-text-lg)',
                  fontWeight: 700,
                  color: 'var(--zen-primary)'
                }}>
                  {braceletInfo.energyLevel}%
                </div>
                <div style={{
                  fontSize: 'var(--zen-text-xs)',
                  color: 'var(--zen-text-tertiary)'
                }}>
                  能量
                </div>
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 'var(--zen-text-base)',
                color: 'var(--zen-text-secondary)',
                marginBottom: 'var(--zen-space-sm)'
              }}>
                {(() => {
                  const level = braceletInfo.energyLevel;
                  if (level >= 90) return '✨ 能量充沛，法力强大';
                  if (level >= 70) return '🌟 能量良好，状态稳定';
                  if (level >= 50) return '💫 能量中等，需要补充';
                  return '🔋 能量不足，急需充能';
                })()}
              </div>
              
              {showEnergyDetails && (
                <div style={{
                  background: 'var(--zen-bg-glass)',
                  borderRadius: 'var(--zen-radius-md)',
                  padding: 'var(--zen-space-md)',
                  fontSize: 'var(--zen-text-sm)',
                  color: 'var(--zen-text-tertiary)'
                }}>
                  <div>趋势: 📈 上升</div>
                  <div>7日平均: 82.3%</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 功德显示 */}
        {meritRecord && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="zen-card zen-mb-xl"
          >
            <div className="zen-flex zen-justify-between zen-items-center zen-mb-lg">
              <h3 style={{
                fontSize: 'var(--zen-text-lg)',
                fontWeight: 600,
                color: 'var(--zen-text-primary)'
              }}>
                修行功德
              </h3>
              
              {meritLevel && (
                <div className="zen-status" style={{
                  background: meritLevel.color + '20',
                  color: meritLevel.color
                }}>
                  {meritLevel.level}
                </div>
              )}
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--zen-space-lg)',
              marginBottom: 'var(--zen-space-lg)'
            }}>
              <div className="zen-text-center">
                <div style={{
                  fontSize: 'var(--zen-text-2xl)',
                  fontWeight: 700,
                  color: 'var(--zen-primary)',
                  marginBottom: 'var(--zen-space-xs)'
                }}>
                  {meritRecord.count}
                </div>
                <div style={{
                  fontSize: 'var(--zen-text-xs)',
                  color: 'var(--zen-text-tertiary)'
                }}>
                  总功德
                </div>
              </div>
              
              <div className="zen-text-center">
                <div style={{
                  fontSize: 'var(--zen-text-2xl)',
                  fontWeight: 700,
                  color: 'var(--zen-success)',
                  marginBottom: 'var(--zen-space-xs)'
                }}>
                  {meritRecord.dailyCount}
                </div>
                <div style={{
                  fontSize: 'var(--zen-text-xs)',
                  color: 'var(--zen-text-tertiary)'
                }}>
                  今日修持
                </div>
              </div>
              
              <div className="zen-text-center">
                <div style={{
                  fontSize: 'var(--zen-text-2xl)',
                  fontWeight: 700,
                  color: 'var(--zen-info)',
                  marginBottom: 'var(--zen-space-xs)'
                }}>
                  {meritRecord.totalDays}
                </div>
                <div style={{
                  fontSize: 'var(--zen-text-xs)',
                  color: 'var(--zen-text-tertiary)'
                }}>
                  修行天数
                </div>
              </div>
            </div>

            {meritLevel && meritLevel.progress < 100 && (
              <div>
                <div style={{
                  fontSize: 'var(--zen-text-sm)',
                  color: 'var(--zen-text-secondary)',
                  marginBottom: 'var(--zen-space-sm)'
                }}>
                  距离下一级还需 {meritLevel.nextLevelAt - meritRecord.count} 功德
                </div>
                
                <div style={{
                  background: 'var(--zen-bg-glass)',
                  borderRadius: 'var(--zen-radius-full)',
                  height: '8px',
                  overflow: 'hidden'
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${meritLevel.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${meritLevel.color}, var(--zen-primary))`,
                      borderRadius: 'var(--zen-radius-full)'
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* 修持心经 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="zen-card zen-mb-xl"
        >
          <div className="zen-text-center zen-mb-lg">
            <h3 style={{
              fontSize: 'var(--zen-text-lg)',
              fontWeight: 600,
              color: 'var(--zen-text-primary)',
              marginBottom: 'var(--zen-space-sm)'
            }}>
              修持心经
            </h3>
            
            <p style={{
              fontSize: 'var(--zen-text-sm)',
              color: 'var(--zen-text-secondary)'
            }}>
              诵读心经，增长智慧，积累功德
            </p>
          </div>

                     <AnimatePresence>
             {showSutraText && (
               <motion.div
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 exit={{ opacity: 0, height: 0 }}
                 style={{
                   background: 'var(--zen-bg-glass)',
                   borderRadius: 'var(--zen-radius-lg)',
                   padding: 'var(--zen-space-lg)',
                   marginBottom: 'var(--zen-space-lg)',
                   overflow: 'hidden'
                 }}
               >
                 <div style={{
                   fontSize: 'var(--zen-text-sm)',
                   color: 'var(--zen-text-secondary)',
                   lineHeight: 1.8,
                   whiteSpace: 'pre-line'
                 }}>
                   {sutraText.trim()}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

           <AnimatePresence>
             {showSutraVideo && (
               <motion.div
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 exit={{ opacity: 0, height: 0 }}
                 style={{
                   background: 'var(--zen-bg-glass)',
                   borderRadius: 'var(--zen-radius-lg)',
                   padding: 'var(--zen-space-lg)',
                   marginBottom: 'var(--zen-space-lg)',
                   overflow: 'hidden'
                 }}
               >
                 <div style={{
                   textAlign: 'center',
                   marginBottom: 'var(--zen-space-md)'
                 }}>
                   <h5 style={{
                     fontSize: 'var(--zen-text-base)',
                     fontWeight: 600,
                     color: 'var(--zen-text-primary)',
                     marginBottom: 'var(--zen-space-sm)'
                   }}>
                     🎥 心经诵读视频
                   </h5>
                   <p style={{
                     fontSize: 'var(--zen-text-sm)',
                     color: 'var(--zen-text-secondary)'
                   }}>
                     跟随法师一起诵读心经，感受佛法的庄严与慈悲
                   </p>
                 </div>
                 
                 <div style={{
                   borderRadius: 'var(--zen-radius-lg)',
                   overflow: 'hidden',
                   background: '#000'
                 }}>
                   <video
                     controls
                     autoPlay={isVideoPlaying}
                     onEnded={handleVideoEnded}
                     style={{
                       width: '100%',
                       height: '200px',
                       objectFit: 'cover'
                     }}
                     poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWEyMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuW/g+e7j+ivteivu+inhumikTwvdGV4dD48L3N2Zz4="
                   >
                     <source src="https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/669_raw.mp4" type="video/mp4" />
                     您的浏览器不支持视频播放
                   </video>
                 </div>

                 <div style={{
                   background: 'var(--zen-info-alpha)',
                   border: '1px solid var(--zen-info)',
                   borderRadius: 'var(--zen-radius-md)',
                   padding: 'var(--zen-space-md)',
                   marginTop: 'var(--zen-space-md)',
                   color: 'var(--zen-info-light)',
                   fontSize: 'var(--zen-text-sm)',
                   textAlign: 'center'
                 }}>
                   💡 建议佩戴耳机，在安静的环境中观看，效果更佳
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

                     <div style={{
             display: 'grid',
             gridTemplateColumns: 'repeat(3, 1fr)',
             gap: 'var(--zen-space-sm)',
             marginBottom: 'var(--zen-space-md)'
           }}>
             <button
               className="zen-btn zen-btn-secondary zen-btn-sm"
               onClick={() => setShowSutraText(!showSutraText)}
             >
               📖 经文
             </button>
             
             <button
               className="zen-btn zen-btn-secondary zen-btn-sm"
               onClick={() => setShowSutraVideo(!showSutraVideo)}
             >
               🎥 视频
             </button>
             
             <button
               className={`zen-btn zen-btn-sm ${sutraPlaying || isVideoPlaying ? 'zen-btn-warning' : 'zen-btn-primary'}`}
               onClick={() => {
                 if (showSutraVideo && !isVideoPlaying) {
                   handleVideoToggle();
                 } else {
                   setSutraPlaying(!sutraPlaying);
                 }
               }}
             >
               {(sutraPlaying || isVideoPlaying) ? '⏸️ 暂停' : '▶️ 开始'}
             </button>
           </div>
          
                     <motion.button
             className="zen-btn zen-btn-success"
             onClick={handleCompletePractice}
             disabled={!sutraPlaying && !isVideoPlaying}
             whileHover={{ scale: (sutraPlaying || isVideoPlaying) ? 1.02 : 1 }}
             whileTap={{ scale: (sutraPlaying || isVideoPlaying) ? 0.98 : 1 }}
             style={{
               width: '100%',
               opacity: (sutraPlaying || isVideoPlaying) ? 1 : 0.5
             }}
           >
             ✅ 完成修持 +1
           </motion.button>
        </motion.div>

        {/* 开光信息 */}
        {braceletInfo.consecrationDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="zen-card zen-mb-xl"
          >
            <h3 style={{
              fontSize: 'var(--zen-text-lg)',
              fontWeight: 600,
              color: 'var(--zen-text-primary)',
              marginBottom: 'var(--zen-space-lg)'
            }}>
              开光信息
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--zen-space-lg)'
            }}>
              <div className="zen-flex zen-items-center zen-gap-lg">
                <span style={{ fontSize: '1.5rem' }}>📅</span>
                <div>
                  <div style={{
                    fontSize: 'var(--zen-text-xs)',
                    color: 'var(--zen-text-tertiary)',
                    marginBottom: 'var(--zen-space-xs)'
                  }}>
                    开光时间
                  </div>
                  <div style={{
                    fontSize: 'var(--zen-text-base)',
                    color: 'var(--zen-text-primary)',
                    fontWeight: 500
                  }}>
                    {braceletInfo.consecrationDate}
                  </div>
                </div>
              </div>
              
              {braceletInfo.consecrationTemple && (
                <div className="zen-flex zen-items-center zen-gap-lg">
                  <span style={{ fontSize: '1.5rem' }}>🏛️</span>
                  <div>
                    <div style={{
                      fontSize: 'var(--zen-text-xs)',
                      color: 'var(--zen-text-tertiary)',
                      marginBottom: 'var(--zen-space-xs)'
                    }}>
                      开光寺院
                    </div>
                    <div style={{
                      fontSize: 'var(--zen-text-base)',
                      color: 'var(--zen-text-primary)',
                      fontWeight: 500
                    }}>
                      {braceletInfo.consecrationTemple}
                    </div>
                  </div>
                </div>
              )}
              
              {braceletInfo.consecrationMaster && (
                <div className="zen-flex zen-items-center zen-gap-lg">
                  <span style={{ fontSize: '1.5rem' }}>👨‍🦲</span>
                  <div>
                    <div style={{
                      fontSize: 'var(--zen-text-xs)',
                      color: 'var(--zen-text-tertiary)',
                      marginBottom: 'var(--zen-space-xs)'
                    }}>
                      主持法师
                    </div>
                    <div style={{
                      fontSize: 'var(--zen-text-base)',
                      color: 'var(--zen-text-primary)',
                      fontWeight: 500
                    }}>
                      {braceletInfo.consecrationMaster}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {braceletInfo.consecrationVideo && (
              <AnimatePresence>
                {showConsecrationVideo ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      marginTop: 'var(--zen-space-lg)'
                    }}
                  >
                    <h4 style={{
                      fontSize: 'var(--zen-text-base)',
                      fontWeight: 600,
                      color: 'var(--zen-text-primary)',
                      marginBottom: 'var(--zen-space-md)',
                      textAlign: 'center'
                    }}>
                      🎥 开光仪式视频
                    </h4>
                    
                    <div style={{
                      borderRadius: 'var(--zen-radius-lg)',
                      overflow: 'hidden',
                      background: '#000',
                      marginBottom: 'var(--zen-space-md)'
                    }}>
                      <video
                        controls
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover'
                        }}
                        poster={braceletInfo.imageUrl || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWEyMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuW8gOWFieS7quW8jzwvdGV4dD48L3N2Zz4="}
                      >
                        <source src={braceletInfo.consecrationVideo} type="video/mp4" />
                        您的浏览器不支持视频播放
                      </video>
                    </div>

                    <div style={{
                      background: 'var(--zen-success-alpha)',
                      border: '1px solid var(--zen-success)',
                      borderRadius: 'var(--zen-radius-md)',
                      padding: 'var(--zen-space-md)',
                      color: 'var(--zen-success-light)',
                      fontSize: 'var(--zen-text-sm)',
                      textAlign: 'center'
                    }}>
                      🙏 此视频记录了您手串的开光仪式全过程，请珍藏
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="zen-btn zen-btn-ghost zen-btn-sm"
                    onClick={() => setShowConsecrationVideo(true)}
                    style={{
                      width: '100%',
                      marginTop: 'var(--zen-space-md)',
                      background: 'var(--zen-primary-alpha-10)',
                      border: '1px solid var(--zen-primary-alpha-30)',
                      color: 'var(--zen-primary)'
                    }}
                  >
                    🎥 观看开光仪式视频
                  </motion.button>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        )}

        {/* 底部操作 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="zen-flex zen-gap-md"
        >
          <button
            className="zen-btn zen-btn-secondary"
            onClick={() => setShowVerificationModal(true)}
            style={{ flex: 1 }}
          >
            更换手串
          </button>
          
          <button
            className="zen-btn zen-btn-primary"
            onClick={() => onNavigate('deity-chat')}
            style={{ flex: 1 }}
          >
            与神仙对话
          </button>
        </motion.div>
      </div>

      {/* 验证模态框 */}
      <AnimatePresence>
        {showVerificationModal && (
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
              background: 'var(--zen-bg-overlay)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--zen-space-lg)',
              zIndex: 1000
            }}
            onClick={() => setShowVerificationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="zen-card"
              style={{ maxWidth: '400px', width: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="zen-flex zen-justify-between zen-items-center zen-mb-lg">
                <h3 style={{
                  fontSize: 'var(--zen-text-lg)',
                  fontWeight: 600,
                  color: 'var(--zen-text-primary)'
                }}>
                  更换手串
                </h3>
                
                <button
                  onClick={() => setShowVerificationModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--zen-text-tertiary)',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div className="zen-form-group">
                <label className="zen-label">新的手串编号</label>
                <input
                  type="text"
                  value={braceletIdInput}
                  onChange={(e) => setBraceletIdInput(e.target.value)}
                  placeholder="请输入手串编号"
                  className="zen-input"
                />
              </div>
              
              <div className="zen-flex zen-gap-md">
                <button
                  className="zen-btn zen-btn-ghost"
                  onClick={() => setShowVerificationModal(false)}
                  style={{ flex: 1 }}
                >
                  取消
                </button>
                
                <button
                  className="zen-btn zen-btn-primary"
                  onClick={handleVerifyBracelet}
                  disabled={isVerifying || !braceletIdInput.trim()}
                  style={{ flex: 1 }}
                >
                  {isVerifying ? '验证中...' : '验证'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BraceletPageOptimized; 