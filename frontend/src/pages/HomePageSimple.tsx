import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HomePageSimpleProps {
  onNavigate: (page: string) => void;
}

interface UserState {
  name?: string;
  birthdate?: string;
  gender?: string;
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
  birthHour?: number;
  birthMinute?: number;
  hasBaziSetup: boolean;
  hasBraceletActivated: boolean;
  setupProgress: number;
}

// 运势显示组件
const FortuneDisplay: React.FC<{ userState: UserState; currentTime: Date }> = ({ userState, currentTime }) => {
  const [fortuneData, setFortuneData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟获取运势数据
    const fetchFortuneData = async () => {
      setLoading(true);
      try {
        // 这里可以调用实际的API获取运势数据
        // 暂时使用模拟数据
        const mockFortuneData = {
          overallScore: Math.floor(Math.random() * 20) + 80, // 80-99
          deity: ['观音菩萨', '文殊菩萨', '普贤菩萨', '地藏菩萨', '大势至菩萨'][Math.floor(Math.random() * 5)],
          guidance: [
            "今日是您与菩萨缘分最深的一天，诸事皆宜，财运亨通，贵人相助，是难得的吉日",
            "今日宜修身养性，多行善事，积累功德，将有意想不到的收获",
            "今日运势平稳，适合处理重要事务，保持心平气和，诸事顺利",
            "今日贵人运旺盛，多与他人交流合作，将带来新的机遇和发展",
            "今日财运亨通，投资理财皆有所获，但切记不可贪心，适可而止"
          ][Math.floor(Math.random() * 5)],
          categories: [
            { label: '事业', icon: '💼', score: Math.floor(Math.random() * 20) + 80 },
            { label: '财运', icon: '💰', score: Math.floor(Math.random() * 20) + 80 },
            { label: '健康', icon: '🏥', score: Math.floor(Math.random() * 20) + 80 },
            { label: '感情', icon: '💕', score: Math.floor(Math.random() * 20) + 80 }
          ],
          luckyColor: ['金色', '红色', '绿色', '蓝色', '紫色'][Math.floor(Math.random() * 5)],
          luckyNumber: Math.floor(Math.random() * 9) + 1,
          recommendation: [
            "今日宜佩戴开光手串，增强护身能量",
            "建议诵读心经三遍，净化心灵",
            "今日宜多行善事，积累功德",
            "建议与神仙对话，获取更多指引"
          ][Math.floor(Math.random() * 4)]
        };

        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFortuneData(mockFortuneData);
      } catch (error) {
        console.error('获取运势数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFortuneData();
  }, [userState.name, userState.birthdate, userState.birthYear, userState.birthMonth, userState.birthDay]);

  if (loading) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '2rem', marginBottom: '1rem' }}
        >
          🔮
        </motion.div>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>正在为您计算今日运势...</p>
      </div>
    );
  }

  if (!fortuneData) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>运势数据获取失败，请稍后重试</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'white',
            margin: 0
          }}>
            {userState.name || '善信'}的今日运势 • {currentTime.toLocaleDateString('zh-CN')}
          </h3>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.875rem',
            margin: '0.25rem 0 0 0'
          }}>
            护持神明：{fortuneData.deity}
          </p>
        </div>
        
        <div style={{
          width: '70px',
          height: '70px',
          background: `linear-gradient(135deg, ${
            fortuneData.overallScore >= 95 ? '#10B981, #059669' :
            fortuneData.overallScore >= 90 ? '#3B82F6, #1D4ED8' :
            fortuneData.overallScore >= 85 ? '#8B5CF6, #7C3AED' :
            '#F59E0B, #D97706'
          })`,
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '700',
          cursor: 'pointer'
        }}>
          <div style={{ fontSize: '1.2rem' }}>
            {fortuneData.overallScore >= 95 ? '🌟' :
             fortuneData.overallScore >= 90 ? '✨' :
             fortuneData.overallScore >= 85 ? '💫' : '⭐'}
          </div>
          <div style={{ fontSize: '1.2rem' }}>{fortuneData.overallScore}</div>
        </div>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        borderLeft: '4px solid #10B981'
      }}>
        <p style={{
          color: 'white',
          fontSize: '1rem',
          lineHeight: '1.6',
          margin: 0,
          fontStyle: 'italic'
        }}>
          "{fortuneData.guidance}"
        </p>
      </div>

      {/* 运势分类详情 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {fortuneData.categories.map((category: any) => (
          <motion.div
            key={category.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {category.icon}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '0.25rem'
            }}>
              {category.label}
            </div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: category.score >= 90 ? '#10B981' : category.score >= 80 ? '#3B82F6' : '#F59E0B'
            }}>
              {category.score}分
            </div>
          </motion.div>
        ))}
      </div>

      {/* 幸运元素 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.25rem' }}>
            幸运颜色
          </div>
          <div style={{ fontSize: '0.875rem', color: 'white', fontWeight: '600' }}>
            {fortuneData.luckyColor}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.25rem' }}>
            幸运数字
          </div>
          <div style={{ fontSize: '0.875rem', color: 'white', fontWeight: '600' }}>
            {fortuneData.luckyNumber}
          </div>
        </div>
      </div>

      {/* 今日建议 */}
      <div style={{
        background: 'rgba(212, 175, 55, 0.1)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '12px',
        padding: '1rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.875rem', color: '#D4AF37', marginBottom: '0.5rem' }}>
          💡 今日建议
        </div>
        <div style={{ fontSize: '0.875rem', color: 'white', lineHeight: '1.4' }}>
          {fortuneData.recommendation}
        </div>
      </div>
    </motion.div>
  );
};

const HomePageSimple: React.FC<HomePageSimpleProps> = ({ onNavigate }) => {
  const [userState, setUserState] = useState<UserState>({
    hasBaziSetup: false,
    hasBraceletActivated: false,
    setupProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());


  // 检查用户状态
  const checkUserState = async () => {
    try {
      console.log('🔍 检查用户状态...');
      const savedUserInfo = localStorage.getItem('userInfo');
      const savedUserProfile = localStorage.getItem('userProfile');
      const braceletStatus = localStorage.getItem('braceletActivated');
      
      let newUserState: UserState = {
        hasBaziSetup: false,
        hasBraceletActivated: false,
        setupProgress: 0
      };

      if (savedUserInfo) {
        const userInfo = JSON.parse(savedUserInfo);
        const hasBraceletActivated = braceletStatus === 'true';
        
        // 统一数据格式：优先使用新格式（分离字段），兼容旧格式（birthdate字符串）
        let birthdate = userInfo.birthdate;
        let birthYear = userInfo.birthYear;
        let birthMonth = userInfo.birthMonth;
        let birthDay = userInfo.birthDay;
        let birthHour = userInfo.birthHour;
        let birthMinute = userInfo.birthMinute;
        
        // 如果有分离的年月日字段，生成birthdate字符串
        if (birthYear && birthMonth && birthDay) {
          birthdate = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
        }
        // 如果只有birthdate字符串，解析成分离字段
        else if (birthdate && !birthYear) {
          const dateParts = birthdate.split('-');
          if (dateParts.length === 3) {
            birthYear = parseInt(dateParts[0]);
            birthMonth = parseInt(dateParts[1]);
            birthDay = parseInt(dateParts[2]);
            // 更新localStorage中的数据结构
            const updatedUserInfo = {
              ...userInfo,
              birthYear,
              birthMonth,
              birthDay,
              birthHour: birthHour || 12,
              birthMinute: birthMinute || 0
            };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
          }
        }
        
        // 同步用户资料数据
        if (savedUserProfile) {
          try {
            const userProfile = JSON.parse(savedUserProfile);
            // 确保用户资料和八字信息同步
            if (birthdate && (!userProfile.birthday || userProfile.birthday !== birthdate)) {
              const updatedProfile = {
                ...userProfile,
                birthday: birthdate,
                birthHour: birthHour || 12,
                birthMinute: birthMinute || 0,
                gender: userInfo.gender || userProfile.gender
              };
              localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
              console.log('🔄 同步用户资料:', updatedProfile);
            }
          } catch (error) {
            console.error('同步用户资料失败:', error);
          }
        }
        
        // 检查八字设置是否完整（需要姓名、性别、出生日期）
        const hasBaziSetup = !!(userInfo.name && userInfo.gender && (birthdate || (birthYear && birthMonth && birthDay)));
        
        newUserState = {
          name: userInfo.name,
          birthdate,
          gender: userInfo.gender,
          birthYear,
          birthMonth,
          birthDay,
          birthHour: birthHour || 12,
          birthMinute: birthMinute || 0,
          hasBaziSetup,
          hasBraceletActivated,
          setupProgress: calculateProgress({
            ...userInfo,
            birthdate,
            birthYear,
            birthMonth,
            birthDay
          }, hasBraceletActivated)
        };
        
        console.log('📊 用户信息详情:', {
          name: userInfo.name,
          birthdate,
          gender: userInfo.gender,
          birthYear,
          birthMonth,
          birthDay,
          birthHour,
          birthMinute,
          hasBaziSetup,
          hasBraceletActivated,
          progress: newUserState.setupProgress
        });
      }

      setUserState(newUserState);
      console.log('✅ 用户状态:', newUserState);
    } catch (error) {
      console.error('❌ 检查用户状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 计算设置进度
  const calculateProgress = (userInfo: any, braceletActivated: boolean) => {
    let progress = 0;
    if (userInfo?.name) progress += 20;
    if (userInfo?.birthdate || (userInfo?.birthYear && userInfo?.birthMonth && userInfo?.birthDay)) progress += 30;
    if (userInfo?.gender) progress += 20;
    // 移除手串激活进度
    // if (braceletActivated) progress += 30;
    return progress;
  };

  // 时间问候
  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return { text: '夜深了，菩萨与您同在', icon: '🌙' };
    if (hour < 9) return { text: '晨光初现，新的一天开始了', icon: '🌅' };
    if (hour < 12) return { text: '上午好，愿您今日顺遂', icon: '☀️' };
    if (hour < 14) return { text: '午时已至，稍作休憩', icon: '🌞' };
    if (hour < 18) return { text: '下午好，继续加油', icon: '🌤️' };
    if (hour < 22) return { text: '夜幕降临，愿您安康', icon: '🌆' };
    return { text: '夜深人静，祝您安眠', icon: '🌌' };
  };

  // 获取引导信息
  const getGuidanceInfo = () => {
    if (!userState.hasBaziSetup) {
      return {
        title: '开启您的神仙之旅',
        description: '设置您的八字信息，获取专属的每日运势指引',
        buttonText: '🔮 设置八字信息',
        icon: '✨',
                          action: () => onNavigate('settings-enhanced')
      };
    }
    
    if (!userState.hasBraceletActivated) {
      return {
        title: '激活您的专属手串',
        description: '激活手串后，即可享受完整的神仙朋友服务',
        buttonText: '📿 激活手串',
        icon: '📿',
        action: () => onNavigate('bracelet')
      };
    }

    return null;
  };

  // 初始化
  useEffect(() => {
    checkUserState();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 监听页面可见性变化，用户从设置页面返回时重新检查状态
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 页面重新可见，检查用户状态...');
        checkUserState();
      }
    };

    const handleFocus = () => {
      console.log('🔄 页面重新获得焦点，检查用户状态...');
      checkUserState();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const greeting = getTimeGreeting();
  const guidanceInfo = getGuidanceInfo();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F1419 0%, #1A1B26 50%, #2D2E3F 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '2rem', marginBottom: '1rem' }}
        >
          🔮
        </motion.div>
        <div>正在为您准备神仙服务...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F1419 0%, #1A1B26 50%, #2D2E3F 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
        zIndex: -1
      }} />



      <div style={{
        padding: '2rem 1.5rem',
        maxWidth: '400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* 状态栏 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.875rem'
        }}>
          <div>{currentTime.toLocaleDateString('zh-CN', { 
            month: 'long', 
            day: 'numeric',
            weekday: 'short' 
          })}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: userState.hasBraceletActivated ? '#10B981' : '#F59E0B',
              borderRadius: '50%'
            }} />
            {userState.hasBraceletActivated ? '手串已连接' : '待激活'}
          </div>
        </div>

        {/* 问候区域 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.1
            }}
            style={{ fontSize: '3rem', marginBottom: '1rem' }}
          >
            {greeting.icon}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.2
            }}
            style={{
              fontSize: '1.75rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '0.5rem'
            }}
          >
            {greeting.text}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.3
            }}
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1rem',
              margin: 0
            }}
          >
            {userState.name ? `${userState.name}，` : ''}菩萨在此护佑您
          </motion.p>
        </motion.div>

        {/* 主要内容 */}
        {guidanceInfo ? (
          // 引导卡片
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.1
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '2rem',
              marginBottom: '1.5rem',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)'
            }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                {guidanceInfo.icon}
              </div>
              
              <h3 style={{
                color: 'white',
                fontSize: '1.25rem',
                marginBottom: '0.5rem'
              }}>
                {guidanceInfo.title}
              </h3>
              
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.875rem',
                lineHeight: '1.5'
              }}>
                {guidanceInfo.description}
              </p>
            </div>

            {/* 进度条 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              height: '8px',
              marginBottom: '1.5rem',
              overflow: 'hidden'
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${userState.setupProgress}%` }}
                transition={{ 
                  duration: 1.2, 
                  ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuart
                }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #D4AF37, #F59E0B)',
                  borderRadius: '10px',
                  boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '1rem'
            }}>
              <span>设置进度</span>
              <span>{userState.setupProgress}%</span>
            </div>

            <motion.button
              onClick={guidanceInfo.action}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 0 30px rgba(212, 175, 55, 0.5)'
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #D4AF37, #F59E0B)',
                border: 'none',
                borderRadius: '15px',
                padding: '1rem',
                color: 'white',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)'
              }}
            >
              {guidanceInfo.buttonText}
            </motion.button>
          </motion.div>

        ) : (
          // 设置完成后显示真实运势
          <FortuneDisplay userState={userState} currentTime={currentTime} />
        )}

        {/* 快捷功能 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.3
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem'
          }}
        >
          {[
            { icon: '💬', title: '与神对话', desc: '智慧指引', page: 'deity-chat', primary: true },
            { icon: '📿', title: '手串状态', desc: '功德进度', page: 'bracelet' },
            { icon: '📊', title: '命理分析', desc: '八字解读', page: 'bazi-analysis' },
            { icon: '⚙️', title: '个人设置', desc: '偏好配置', page: 'settings' }
          ].map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.4 + index * 0.1
              }}
              whileHover={{ 
                y: -8, 
                scale: 1.05,
                transition: { 
                  type: "spring",
                  stiffness: 400,
                  damping: 20
                }
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
              onClick={() => onNavigate(action.page)}
              style={{
                background: action.primary 
                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)'
                  : 'rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                border: action.primary 
                  ? '1px solid rgba(212, 175, 55, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: action.primary 
                  ? '0 4px 20px rgba(212, 175, 55, 0.2)'
                  : '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
            >
              <motion.div 
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ duration: 0.3 }}
                style={{
                  fontSize: '2rem',
                  marginBottom: '0.75rem',
                  filter: action.primary ? 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))' : 'none'
                }}
              >
                {action.icon}
              </motion.div>
              
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 0.25rem 0'
              }}>
                {action.title}
              </h4>
              
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.6)',
                margin: 0
              }}>
                {action.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HomePageSimple; 