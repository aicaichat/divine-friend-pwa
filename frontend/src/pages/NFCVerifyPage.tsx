import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NFCVerifyPageProps {
  onNavigate: (page: string) => void;
}

interface VerificationResult {
  success: boolean;
  braceletInfo?: any;
  error?: string;
  needsReactivation?: boolean;
  daysSinceLastUse?: number;
  currentEnergyLevel?: number;
  newEnergyLevel?: number;
  rewards?: Array<{
    type: string;
    value: number | string;
    description: string;
  }>;
  message?: string;
}

const NFCVerifyPage: React.FC<NFCVerifyPageProps> = ({ onNavigate }) => {
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error' | 'expired' | 'quick_access' | 'daily_practice' | 'welcome_back' | 'reactivation_required' | 'reactivation_ritual' | 'reactivation_complete'>('loading');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [urlParams, setUrlParams] = useState<any>({});
  const [accessType, setAccessType] = useState<string>('first_time');
  const [localState, setLocalState] = useState<any>(null);

  useEffect(() => {
    handleNFCURLVerification();
  }, []);

  const handleNFCURLVerification = async () => {
    try {
      // 解析URL参数
      const searchParams = new URLSearchParams(window.location.search);
      const params = {
        chip: searchParams.get('chip'),
        bracelet: searchParams.get('bracelet'),
        hash: searchParams.get('hash'),
        timestamp: searchParams.get('timestamp'),
        source: searchParams.get('source'),
        quick: searchParams.get('quick') === 'true'
      };

      setUrlParams(params);

      // 基础参数验证
      if (!params.chip || !params.bracelet || !params.hash || !params.timestamp) {
        throw new Error('验证链接参数不完整');
      }

      // 智能状态检查
      const detectedAccessType = checkBraceletState(params);
      setAccessType(detectedAccessType);

      // 根据访问类型选择处理策略
      switch (detectedAccessType) {
        case 'quick_access':
          await handleQuickAccess(params);
          break;
          
        case 'daily_practice':
          await handleDailyPractice(params);
          break;
          
        case 'regular_return':
          await handleRegularReturn(params);
          break;
          
        case 'long_term_return':
          await handleLongTermReturn(params);
          break;
          
        case 'different_bracelet':
          await handleDifferentBracelet(params);
          break;
          
        default: // first_time
          await handleFirstTimeVerification(params);
          break;
      }

    } catch (error: any) {
      console.error('NFC URL验证失败:', error);
      setResult({ success: false, error: error.message });
      setVerificationState('error');
      
      // 错误追踪
      trackVerificationError(error, urlParams);
    }
  };

  // 智能状态检查
  const checkBraceletState = (params: any): string => {
    const stored = localStorage.getItem('bracelet_states');
    if (!stored) return 'first_time';

    try {
      const states = JSON.parse(stored);
      const chipState = states[params.chip];
      
      if (!chipState) return 'first_time';
      
      const timeSinceLastAccess = Date.now() - chipState.lastVerified;
      const ONE_HOUR = 60 * 60 * 1000;
      const ONE_DAY = 24 * ONE_HOUR;
      const ONE_WEEK = 7 * ONE_DAY;

      if (timeSinceLastAccess < ONE_HOUR) {
        setLocalState(chipState);
        return 'quick_access';
      } else if (timeSinceLastAccess < ONE_DAY) {
        setLocalState(chipState);
        return 'daily_practice';
      } else if (timeSinceLastAccess < ONE_WEEK) {
        setLocalState(chipState);
        return 'regular_return';
      } else {
        setLocalState(chipState);
        return 'long_term_return';
      }
    } catch {
      return 'first_time';
    }
  };

  // 快速访问处理
  const handleQuickAccess = async (params: any) => {
    setVerificationState('quick_access');
    
    // 震动反馈
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]);
    }
    
    // 1秒后自动跳转
    setTimeout(() => {
      onNavigate('bracelet');
    }, 1000);
    
    // 更新访问记录
    updateAccessHistory(params, 'quick_access');
  };

  // 日常修行处理
  const handleDailyPractice = async (params: any) => {
    setVerificationState('daily_practice');
    
    try {
      // 轻量级验证（检查状态更新）
      const quickVerify = await fetch('/api/bracelets/quick-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chipId: params.chip })
      });
      
      if (quickVerify.ok) {
        const updates = await quickVerify.json();
        // 更新本地数据
        if (updates.energyLevel) {
          const braceletInfo = JSON.parse(localStorage.getItem('braceletInfo') || '{}');
          braceletInfo.energyLevel = updates.energyLevel;
          localStorage.setItem('braceletInfo', JSON.stringify(braceletInfo));
        }
      } else {
        // 使用模拟更新
        const braceletInfo = JSON.parse(localStorage.getItem('braceletInfo') || '{}');
        braceletInfo.energyLevel = Math.min(100, (braceletInfo.energyLevel || 85) + Math.floor(Math.random() * 5));
        localStorage.setItem('braceletInfo', JSON.stringify(braceletInfo));
      }
    } catch (error) {
      console.warn('Quick verify failed, using cached data');
    }
    
    updateAccessHistory(params, 'daily_practice');
  };

  // 常规返回处理
  const handleRegularReturn = async (params: any) => {
    setVerificationState('welcome_back');
    
    try {
      // 中等程度验证
      const response = await fetch('/api/bracelets/verify-with-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(data);
        
        // 3秒后跳转
        setTimeout(() => {
          setVerificationState('success');
          setTimeout(() => onNavigate('bracelet'), 2000);
        }, 3000);
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.warn('中等验证失败，降级到完整验证:', error);
      // 降级到完整验证
      await handleFirstTimeVerification(params);
    }
    
    updateAccessHistory(params, 'regular_return');
  };

  // 长期重访处理（超过1周）- 重新激活流程
  const handleLongTermReturn = async (params: any) => {
    setVerificationState('reactivation_required');
    
    // 计算离开天数
    const daysSinceLastUse = localState?.lastVerified ? 
      Math.floor((Date.now() - localState.lastVerified) / (24 * 60 * 60 * 1000)) : 30;
    
    // 模拟能量衰减
    const currentEnergyLevel = Math.max(20, (localState?.braceletInfo?.energyLevel || 85) - Math.floor(daysSinceLastUse * 1.5));
    
    setResult({
      success: true,
      needsReactivation: true,
      daysSinceLastUse,
      currentEnergyLevel,
      message: `您的法宝手串已经休眠了 ${daysSinceLastUse} 天`,
      braceletInfo: {
        ...localState?.braceletInfo,
        energyLevel: currentEnergyLevel
      }
    });
  };

  // 开始重新激活仪式
  const startReactivationRitual = async () => {
    setVerificationState('reactivation_ritual');
    
    // 模拟重新激活过程（30秒仪式）
    let progress = 0;
    const ritualInterval = setInterval(() => {
      progress += 3.33; // 30秒完成
      
      if (progress >= 100) {
        clearInterval(ritualInterval);
        completeReactivation();
      }
    }, 1000);
  };

  // 完成重新激活
  const completeReactivation = async () => {
    try {
      // 调用重新激活API
      const reactivationData = await fetch('/api/bracelets/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chipId: urlParams.chip,
          daysSinceLastUse: result?.daysSinceLastUse || 0
        })
      });

      let newData;
      if (reactivationData.ok) {
        newData = await reactivationData.json();
      } else {
        // 模拟重新激活结果
        const energyBoost = 30;
        const newEnergyLevel = Math.min(100, (result?.currentEnergyLevel || 50) + energyBoost);
        
        newData = {
          success: true,
          newEnergyLevel,
          rewards: [
            { type: 'energy', value: energyBoost, description: '能量大幅恢复' },
            { type: 'practice_bonus', value: 7, description: '7天修行功德双倍' },
            { type: 'streak_protection', value: 3, description: '3天断签保护' }
          ],
          braceletInfo: {
            ...result?.braceletInfo,
            energyLevel: newEnergyLevel
          }
        };
      }

      setResult(prev => ({ ...prev, ...newData }));
      setVerificationState('reactivation_complete');
      
      // 更新本地数据
      updateAccessHistory(urlParams, 'reactivation_complete', newData.braceletInfo);
      
      // 震动反馈
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
      
      // 5秒后跳转到主应用
      setTimeout(() => {
        onNavigate('bracelet');
      }, 5000);
      
    } catch (error) {
      console.error('Reactivation failed:', error);
      setVerificationState('error');
    }
  };

  // 不同手串处理
  const handleDifferentBracelet = async (params: any) => {
    // 这里可以显示确认对话框，暂时简化为完整验证
    await handleFirstTimeVerification(params);
  };

  // 首次验证处理
  const handleFirstTimeVerification = async (params: any) => {
    // 检查链接是否过期
    const timestampAge = Date.now() - parseInt(params.timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24小时
    
    if (timestampAge > maxAge) {
      setVerificationState('expired');
      return;
    }

    // 调用验证API (先尝试真实API，失败则使用模拟数据)
    let data;
    try {
      const response = await fetch('/api/bracelets/verify-nfc-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });

      if (response.ok) {
        data = await response.json();
      } else {
        throw new Error('API not available');
      }
    } catch (error) {
      console.warn('API调用失败，使用模拟数据:', error);
      // 使用模拟数据进行测试
      data = {
        success: true,
        message: 'NFC验证成功 (模拟数据)',
        braceletInfo: {
          id: params.bracelet,
          owner: '测试用户',
          chipId: params.chip,
          material: '小叶紫檀',
          beadCount: 108,
          energyLevel: 85,
          consecrationDate: '2024年1月15日',
          consecrationTemple: '灵隐寺',
          consecrationMaster: '慧明法师',
          consecrationVideo: 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/669_raw.mp4'
        }
      };
    }

    if (data.success && data.braceletInfo) {
      // 验证成功
      setResult(data);
      setVerificationState('success');
      
      // 保存手串信息到本地
      localStorage.setItem('braceletActivated', 'true');
      localStorage.setItem('braceletInfo', JSON.stringify(data.braceletInfo));
      
      // 保存到状态管理
      updateAccessHistory(params, 'first_time', data.braceletInfo);
      
      // 用户反馈
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
      
      playSuccessSound();
      
      // 追踪成功事件
      trackVerificationSuccess(params, data);
      
      // 快速模式自动跳转
      if (params.quick) {
        setTimeout(() => {
          onNavigate('bracelet');
        }, 2000);
      }
      
    } else {
      throw new Error(data.error || '验证失败');
    }
  };

  // 更新访问历史
  const updateAccessHistory = (params: any, accessType: string, braceletInfo?: any) => {
    try {
      const stored = localStorage.getItem('bracelet_states') || '{}';
      const states = JSON.parse(stored);
      
      states[params.chip] = {
        chipId: params.chip,
        braceletId: params.bracelet,
        lastVerified: Date.now(),
        accessCount: (states[params.chip]?.accessCount || 0) + 1,
        accessType: accessType,
        braceletInfo: braceletInfo || localState?.braceletInfo
      };
      
      localStorage.setItem('bracelet_states', JSON.stringify(states));
    } catch (error) {
      console.warn('Failed to update access history:', error);
    }
  };

  const playSuccessSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMoCyyB0fPfeiwGKnTB8+SXRQ0VUqzn9bNTEwhCnOD2xm0nCyV+zPLbeC0HM3nI8+eTRA0SU6jj9LVZFAg+m+D2wmkrCSaAz/PdgC8HKGy+8OB8LggwdMny2YJAEAw');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {}
  };

  const trackVerificationSuccess = (params: any, data: any) => {
    try {
      const analytics = {
        event: 'nfc_url_verification_success',
        timestamp: Date.now(),
        method: 'nfc_url',
        source: params.source,
        braceletId: params.bracelet,
        chipId: params.chip,
        responseTime: Date.now() - parseInt(params.timestamp),
        userAgent: navigator.userAgent,
        platform: getPlatform()
      };
      
      // 发送到分析服务
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/verification', JSON.stringify(analytics));
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  };

  const trackVerificationError = (error: any, params: any) => {
    try {
      const analytics = {
        event: 'nfc_url_verification_error',
        timestamp: Date.now(),
        error: error.message,
        params: params,
        userAgent: navigator.userAgent,
        platform: getPlatform()
      };
      
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/verification-error', JSON.stringify(analytics));
      }
    } catch {}
  };

  const getPlatform = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
    if (/android/.test(userAgent)) return 'android';
    return 'other';
  };

  // 工具函数
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '深夜静修时光';
    if (hour < 12) return '清晨好！';
    if (hour < 18) return '下午好！';
    return '晚上好！';
  };

  const getTimeAgo = (timestamp?: number) => {
    if (!timestamp) return '首次使用';
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
  };

  const getTimeAway = (timestamp?: number) => {
    if (!timestamp) return '很久';
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    if (days < 1) return '不到一天';
    if (days < 7) return `${days}天`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}周`;
    const months = Math.floor(days / 30);
    return `${months}个月`;
  };

  const handleRetry = () => {
    setVerificationState('loading');
    handleNFCURLVerification();
  };

  const handleManualInput = () => {
    onNavigate('home'); // 回到主页进行手动输入
  };

  // 渲染不同状态的界面
  const renderContent = () => {
    switch (verificationState) {
      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="verification-loading"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ fontSize: '4rem', marginBottom: '2rem' }}
            >
              📿
            </motion.div>
            <h2>正在验证您的手串...</h2>
            <p style={{ color: '#666', marginTop: '1rem' }}>
              请稍候，我们正在确认您的手串信息
            </p>
            <div className="loading-dots" style={{ marginTop: '2rem' }}>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              >●</motion.span>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              >●</motion.span>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
              >●</motion.span>
            </div>
          </motion.div>
        );

      case 'quick_access':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="quick-access-welcome"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: '4rem', marginBottom: '2rem' }}
            >
              📿
            </motion.div>
            
            <h2 style={{ color: '#52c41a', marginBottom: '1rem' }}>欢迎回来！</h2>
            <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2rem' }}>
              {localState?.braceletInfo?.name || '您的法宝手串'}
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              marginBottom: '2rem',
              padding: '1rem',
              background: '#f6ffed',
              borderRadius: '8px',
              border: '1px solid #b7eb8f'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#52c41a',
                  marginBottom: '0.5rem'
                }}>
                  {localState?.braceletInfo?.energyLevel || 85}%
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>当前能量</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#1890ff',
                  marginBottom: '0.5rem'
                }}>
                  {localState?.accessCount || 1}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>使用次数</div>
              </div>
            </div>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1 }}
              style={{
                height: '4px',
                background: 'linear-gradient(90deg, #52c41a, #1890ff)',
                borderRadius: '2px',
                marginBottom: '1rem'
              }}
            />
            
            <p style={{ fontSize: '0.9rem', color: '#999' }}>
              正在进入手串功能...
            </p>
          </motion.div>
        );

      case 'daily_practice':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="daily-practice-welcome"
          >
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ color: '#722ed1', marginBottom: '0.5rem' }}>
                {getTimeGreeting()}
              </h2>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>
                🧘‍♂️ 新的一天，新的修行
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem',
              padding: '1rem',
              background: '#f9f0ff',
              borderRadius: '12px',
              border: '1px solid #d3adf7'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: '#722ed1',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                📿
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#722ed1' }}>
                  {localState?.braceletInfo?.name || '神仙手串'}
                </h3>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  能量: {localState?.braceletInfo?.energyLevel || 85}% • 
                  上次使用: {getTimeAgo(localState?.lastVerified)}
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#722ed1', marginBottom: '1rem' }}>💡 今日修行建议</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: '#fff',
                    borderRadius: '6px',
                    border: '1px solid #f0f0f0'
                  }}
                >
                  <span>🌅</span>
                  <span style={{ fontSize: '0.9rem' }}>开始您的晨练修行</span>
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: '#fff',
                    borderRadius: '6px',
                    border: '1px solid #f0f0f0'
                  }}
                >
                  <span>📖</span>
                  <span style={{ fontSize: '0.9rem' }}>诵读心经增长智慧</span>
                </motion.div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('bracelet')}
                style={{
                  flex: 2,
                  background: '#722ed1',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                🧘‍♂️ 开始修行
              </motion.button>
              <button
                onClick={() => onNavigate('bracelet')}
                style={{
                  flex: 1,
                  background: '#f0f0f0',
                  color: '#666',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                📿 查看手串
              </button>
            </div>
          </motion.div>
        );

      case 'welcome_back':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="welcome-back"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              style={{ fontSize: '4rem', marginBottom: '2rem' }}
            >
              🙏
            </motion.div>
            
            <h2 style={{ color: '#fa8c16', marginBottom: '1rem' }}>欢迎回来！</h2>
            <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2rem' }}>
              您的法宝一直在等待您的归来
            </p>
            
            <div style={{
              background: '#fff7e6',
              border: '1px solid #ffd591',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem'
            }}>
              <p style={{ margin: 0, color: '#d48806' }}>
                距离上次使用已过去 <strong>{getTimeAway(localState?.lastVerified)}</strong>
              </p>
            </div>
            
            <div className="loading-dots" style={{ marginTop: '2rem' }}>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                style={{ color: '#fa8c16' }}
              >●</motion.span>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                style={{ color: '#fa8c16' }}
              >●</motion.span>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                style={{ color: '#fa8c16' }}
              >●</motion.span>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '1rem' }}>
              正在更新您的手串状态...
            </p>
          </motion.div>
        );

      case 'reactivation_required':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="reactivation-required"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              style={{ fontSize: '4rem', marginBottom: '2rem' }}
            >
              🌟
            </motion.div>
            
            <h2 style={{ color: '#722ed1', marginBottom: '1rem' }}>欢迎回来！</h2>
            <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '1rem' }}>
              {result?.message || '您的法宝手串需要重新激活'}
            </p>
            
            <div style={{
              background: '#fff7e6',
              border: '1px solid #ffd591',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>离开时间:</span>
                <strong>{result?.daysSinceLastUse} 天</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>当前能量:</span>
                <span style={{ color: result?.currentEnergyLevel && result.currentEnergyLevel < 50 ? '#ff4d4f' : '#52c41a' }}>
                  {result?.currentEnergyLevel}%
                </span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startReactivationRitual}
              style={{
                background: '#722ed1',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                marginBottom: '1rem'
              }}
            >
              🔥 开始重新激活
            </motion.button>
            
            <p style={{ fontSize: '0.9rem', color: '#999' }}>
              重新激活将恢复您的手串能量并解锁修行奖励
            </p>
          </motion.div>
        );

      case 'reactivation_ritual':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="reactivation-ritual"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotateZ: [0, 360],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ fontSize: '4rem', marginBottom: '2rem' }}
            >
              ✨
            </motion.div>
            
            <h2 style={{ color: '#722ed1', marginBottom: '1rem' }}>重新激活仪式</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              请静心冥想，让您的法宝重新焕发灵性...
            </p>
            
            <div style={{
              background: '#f9f0ff',
              border: '1px solid #d3adf7',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#722ed1' }}>
                🧘‍♂️ 请跟随以下步骤：
              </div>
              <div style={{ textAlign: 'left', lineHeight: '2' }}>
                <div>1. 📿 双手握持您的手串</div>
                <div>2. 🌬️ 深呼吸，放松身心</div>
                <div>3. 🙏 默念心经片段</div>
                <div>4. ✨ 感受能量流动</div>
              </div>
            </div>
            
            <div style={{
              width: '100%',
              height: '8px',
              background: '#f0f0f0',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 30 }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #722ed1, #52c41a)',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            <p style={{ fontSize: '0.9rem', color: '#999' }}>
              仪式进行中，请保持专注...
            </p>
          </motion.div>
        );

      case 'reactivation_complete':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="reactivation-complete"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              style={{ fontSize: '4rem', marginBottom: '2rem' }}
            >
              🎉
            </motion.div>
            
            <h2 style={{ color: '#52c41a', marginBottom: '1rem' }}>重新激活成功！</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              您的法宝手串已重新焕发活力，修行之路重新开启！
            </p>
            
            <div style={{
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>能量等级:</span>
                <strong style={{ color: '#52c41a' }}>{result?.newEnergyLevel}%</strong>
              </div>
              {result?.rewards && result.rewards.length > 0 && (
                <div>
                  <div style={{ marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    🎁 重新激活奖励:
                  </div>
                  {result.rewards.map((reward, index) => (
                    <div key={index} style={{ fontSize: '0.9rem', color: '#52c41a', marginBottom: '0.3rem' }}>
                      • {reward.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('bracelet')}
              style={{
                background: '#52c41a',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1.1rem'
              }}
            >
              🚀 进入手串管理
            </motion.button>
            
            <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '1rem' }}>
              5秒后自动跳转...
            </p>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="verification-success"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              style={{ fontSize: '4rem', marginBottom: '2rem' }}
            >
              ✅
            </motion.div>
            <h2 style={{ color: '#52c41a', marginBottom: '1rem' }}>验证成功！</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              您的手串已成功激活，现在可以开始修行之旅了
            </p>
            
            {result?.braceletInfo && (
              <div className="bracelet-info" style={{
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#389e0d' }}>手串信息</h4>
                <p><strong>主人:</strong> {result.braceletInfo.owner}</p>
                <p><strong>材质:</strong> {result.braceletInfo.material}</p>
                <p><strong>珠子数量:</strong> {result.braceletInfo.beadCount}颗</p>
                <p><strong>能量等级:</strong> {result.braceletInfo.energyLevel}%</p>
                {result.braceletInfo.consecrationTemple && (
                  <p><strong>开光寺院:</strong> {result.braceletInfo.consecrationTemple}</p>
                )}
              </div>
            )}
            
            <div className="action-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn primary"
                onClick={() => onNavigate('bracelet')}
                style={{
                  background: '#52c41a',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                查看我的手串
              </motion.button>
              
              {urlParams.quick && (
                <p style={{ fontSize: '0.8rem', color: '#999', margin: '1rem 0 0 0' }}>
                  2秒后自动跳转到手串页面...
                </p>
              )}
            </div>
          </motion.div>
        );

      case 'expired':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="verification-expired"
          >
            <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>⏰</div>
            <h2 style={{ color: '#faad14', marginBottom: '1rem' }}>验证链接已过期</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              此验证链接已超过24小时有效期，请重新靠近手串获取新的验证链接
            </p>
            <div className="action-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn secondary"
                onClick={handleManualInput}
                style={{
                  background: '#faad14',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                手动输入验证
              </motion.button>
            </div>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="verification-error"
          >
            <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>❌</div>
            <h2 style={{ color: '#ff4d4f', marginBottom: '1rem' }}>验证失败</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              {result?.error || '无法验证您的手串，请重试或联系客服'}
            </p>
            <div className="action-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn primary"
                onClick={handleRetry}
                style={{
                  background: '#1890ff',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                重试验证
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn secondary"
                onClick={handleManualInput}
                style={{
                  background: '#52c41a',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                手动验证
              </motion.button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '3rem',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default NFCVerifyPage; 