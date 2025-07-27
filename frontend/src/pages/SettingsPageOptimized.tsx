import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationSettingsComponent from '../components/NotificationSettings';
import PrivacyPolicy from '../components/PrivacyPolicy';
import { useAnalytics } from '../hooks/useAnalytics';

interface SettingsPageOptimizedProps {
  onNavigate: (page: string) => void;
}

interface UserBirthInfo {
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
}

interface FormErrors {
  name?: string;
  birthDate?: string;
  birthTime?: string;
}

const SettingsPageOptimized: React.FC<SettingsPageOptimizedProps> = ({ onNavigate }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [birthInfo, setBirthInfo] = useState<UserBirthInfo>({
    name: '',
    gender: 'male',
    birthYear: new Date().getFullYear() - 25,
    birthMonth: 1,
    birthDay: 1,
    birthHour: 12,
    birthMinute: 0
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  
  // 📊 分析追踪
  const analytics = useAnalytics();

  // 生成年份选项
  const yearOptions = Array.from({ length: 100 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year, label: `${year}年` };
  });

  // 生成月份选项
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}月`
  }));

  // 生成日期选项
  const getDayOptions = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}日`
    }));
  };

  // 生成时间选项
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${i.toString().padStart(2, '0')}时`
  }));

  const minuteOptions = [0, 15, 30, 45].map(minute => ({
    value: minute,
    label: `${minute.toString().padStart(2, '0')}分`
  }));

  // 加载现有数据
  useEffect(() => {
    // 追踪设置页面访问
    analytics.trackPageView('settings', '个人设置');
    analytics.trackEvent('settings_page_load');
    
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      try {
        const userInfo = JSON.parse(savedUserInfo);
        
        // 处理birthdate格式的数据
        let processedUserInfo = { ...userInfo };
        if (userInfo.birthdate && !userInfo.birthYear) {
          // 如果有birthdate但没有birthYear，解析birthdate
          const dateParts = userInfo.birthdate.split('-');
          if (dateParts.length === 3) {
            processedUserInfo = {
              ...userInfo,
              birthYear: parseInt(dateParts[0]),
              birthMonth: parseInt(dateParts[1]),
              birthDay: parseInt(dateParts[2])
            };
          }
        }
        
        setBirthInfo(prev => ({
          ...prev,
          ...processedUserInfo
        }));
        
        // 如果有完整数据，跳到最后一步
        if (processedUserInfo.name && processedUserInfo.birthYear && processedUserInfo.birthMonth && processedUserInfo.birthDay) {
          setActiveStep(3);
          analytics.trackEvent('settings_existing_user');
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
        if (error instanceof Error) {
          analytics.trackError(error, 'settings_load_user_info');
        }
      }
    } else {
      analytics.trackEvent('settings_new_user');
    }
  }, [analytics]);

  // 验证表单
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!birthInfo.name.trim()) {
        newErrors.name = '请输入您的姓名';
      } else if (birthInfo.name.trim().length < 2) {
        newErrors.name = '姓名至少需要2个字符';
      }
    }

    if (step === 2) {
      if (!birthInfo.birthYear || !birthInfo.birthMonth || !birthInfo.birthDay) {
        newErrors.birthDate = '请完整填写出生日期';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 下一步
  const handleNext = () => {
    if (validateStep(activeStep)) {
      if (activeStep < 3) {
        // 追踪步骤前进
        analytics.trackUserAction('settings_step_next', {
          fromStep: activeStep,
          toStep: activeStep + 1
        });
        setActiveStep(activeStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  // 上一步
  const handlePrevious = () => {
    if (activeStep > 1) {
      // 追踪步骤后退
      analytics.trackUserAction('settings_step_previous', {
        fromStep: activeStep,
        toStep: activeStep - 1
      });
      setActiveStep(activeStep - 1);
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 追踪设置完成
      analytics.trackUserAction('settings_completed', {
        hasName: !!birthInfo.name,
        hasBirthInfo: !!(birthInfo.birthYear && birthInfo.birthMonth && birthInfo.birthDay),
        hasTimeInfo: !!(birthInfo.birthHour !== 12 || birthInfo.birthMinute !== 0),
        gender: birthInfo.gender
      });

      // 生成birthdate格式
      const birthdate = `${birthInfo.birthYear}-${birthInfo.birthMonth.toString().padStart(2, '0')}-${birthInfo.birthDay.toString().padStart(2, '0')}`;
      
      // 保存用户信息（包含birthdate字段）
      const userInfoToSave = {
        ...birthInfo,
        birthdate: birthdate
      };
      localStorage.setItem('userInfo', JSON.stringify(userInfoToSave));
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowSuccess(true);
      
      // 延迟后返回首页
      setTimeout(() => {
        onNavigate('home');
      }, 2000);

    } catch (error) {
      console.error('保存失败:', error);
      if (error instanceof Error) {
        analytics.trackError(error, 'settings_submit');
      }
      alert('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 获取时间描述
  const getTimeDescription = () => {
    const hour = birthInfo.birthHour;
    if (hour >= 6 && hour < 12) return '上午';
    if (hour >= 12 && hour < 18) return '下午';
    if (hour >= 18 && hour < 22) return '晚上';
    return '深夜';
  };

  // 步骤指示器
  const StepIndicator = () => (
    <div className="zen-flex zen-items-center zen-justify-center zen-mb-xl">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <motion.div
            className={`zen-flex zen-items-center zen-justify-center zen-radius-full`}
            style={{
              width: '40px',
              height: '40px',
              background: step <= activeStep ? 'var(--zen-gradient-gold)' : 'var(--zen-bg-glass)',
              border: step <= activeStep ? 'none' : '1px solid var(--zen-border-normal)',
              color: step <= activeStep ? 'white' : 'var(--zen-text-tertiary)',
              fontWeight: 600
            }}
            animate={{
              scale: step === activeStep ? 1.1 : 1,
              boxShadow: step === activeStep ? 'var(--zen-shadow-glow)' : 'none'
            }}
            transition={{ duration: 0.3 }}
          >
            {step <= activeStep ? '✓' : step}
          </motion.div>
          {step < 3 && (
            <div
              style={{
                width: '60px',
                height: '2px',
                background: step < activeStep ? 'var(--zen-primary)' : 'var(--zen-border-subtle)',
                margin: '0 12px',
                transition: 'background var(--zen-duration-normal)'
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // 成功页面
  if (showSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--zen-bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--zen-space-2xl)'
      }}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="zen-card zen-text-center"
          style={{ maxWidth: '400px' }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: '4rem', marginBottom: 'var(--zen-space-xl)' }}
          >
            🎉
          </motion.div>
          
          <h2 style={{
            fontSize: 'var(--zen-text-2xl)',
            fontWeight: 700,
            color: 'var(--zen-text-primary)',
            marginBottom: 'var(--zen-space-lg)'
          }}>
            设置完成！
          </h2>
          
          <p style={{
            color: 'var(--zen-text-secondary)',
            fontSize: 'var(--zen-text-base)',
            lineHeight: 1.6,
            marginBottom: 'var(--zen-space-xl)'
          }}>
            您的个人信息已保存成功<br/>
            即将为您开启神仙朋友之旅...
          </p>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid var(--zen-primary-alpha-20)',
              borderTop: '3px solid var(--zen-primary)',
              borderRadius: '50%',
              margin: '0 auto'
            }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--zen-bg-primary)',
      padding: 'var(--zen-space-2xl) var(--zen-space-lg)',
      position: 'relative'
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
        zIndex: -1
      }} />

      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* 标题区域 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="zen-text-center zen-mb-2xl"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ fontSize: '3rem', marginBottom: 'var(--zen-space-lg)' }}
          >
            ⚙️
          </motion.div>
          
          <h1 style={{
            fontSize: 'var(--zen-text-3xl)',
            fontWeight: 700,
            color: 'var(--zen-text-primary)',
            marginBottom: 'var(--zen-space-sm)'
          }}>
            我的设置
          </h1>
          
          <p style={{
            fontSize: 'var(--zen-text-base)',
            color: 'var(--zen-text-secondary)'
          }}>
            个性化您的神仙体验
          </p>
        </motion.div>

        {/* 标签指示器 */}
        <div className="zen-mb-2xl">
          <div className="zen-flex zen-items-center zen-justify-center zen-gap-lg zen-mb-lg">
            {[
              { step: 1, icon: '👤', label: '个人信息' },
              { step: 2, icon: '📅', label: '出生信息' },
              { step: 3, icon: '✨', label: '完成设置' }
            ].map((item) => (
              <div key={item.step} className="zen-flex zen-flex-col zen-items-center zen-gap-sm">
                <div 
                  className={`zen-radius-full zen-flex zen-items-center zen-justify-center`}
                  style={{
                    width: '48px',
                    height: '48px',
                    background: item.step === activeStep 
                      ? 'var(--zen-primary-alpha-20)' 
                      : 'var(--zen-bg-glass)',
                    border: item.step === activeStep 
                      ? '2px solid var(--zen-primary)' 
                      : '1px solid var(--zen-border-subtle)',
                    fontSize: 'var(--zen-text-lg)'
                  }}
                >
                  {item.icon}
                </div>
                <span style={{
                  fontSize: 'var(--zen-text-xs)',
                  color: item.step === activeStep ? 'var(--zen-primary)' : 'var(--zen-text-tertiary)',
                  fontWeight: item.step === activeStep ? 600 : 400
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          
          <StepIndicator />
        </div>

        {/* 表单内容 */}
        <motion.div
          className="zen-card"
          layout
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {activeStep === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{
                  fontSize: 'var(--zen-text-xl)',
                  fontWeight: 600,
                  color: 'var(--zen-text-primary)',
                  marginBottom: 'var(--zen-space-xl)',
                  textAlign: 'center'
                }}>
                  🎭 告诉我您的基本信息
                </h3>

                <div className="zen-form-group">
                  <label className="zen-label zen-label-required">姓名</label>
                  <input
                    type="text"
                    className="zen-input"
                    placeholder="请输入您的姓名"
                    value={birthInfo.name}
                    onChange={(e) => setBirthInfo(prev => ({ ...prev, name: e.target.value }))}
                    style={{
                      borderColor: errors.name ? 'var(--zen-error)' : undefined,
                      boxShadow: errors.name ? '0 0 0 3px var(--zen-error-alpha)' : undefined
                    }}
                  />
                  {errors.name && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        color: 'var(--zen-error-light)',
                        fontSize: 'var(--zen-text-sm)',
                        marginTop: 'var(--zen-space-sm)'
                      }}
                    >
                      ⚠️ {errors.name}
                    </motion.div>
                  )}
                  <div style={{
                    color: 'var(--zen-text-muted)',
                    fontSize: 'var(--zen-text-xs)',
                    marginTop: 'var(--zen-space-sm)'
                  }}>
                    💡 后续服务不可用，将使用本地计算
                  </div>
                </div>

                <div className="zen-form-group">
                  <label className="zen-label">性别</label>
                  <div className="zen-radio-group">
                    {[
                      { value: 'male', label: '男', icon: '👨' },
                      { value: 'female', label: '女', icon: '👩' }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`zen-radio-item ${birthInfo.gender === option.value ? 'active' : ''}`}
                        style={{ flex: 1 }}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={birthInfo.gender === option.value}
                          onChange={(e) => setBirthInfo(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                        />
                        <span style={{ fontSize: 'var(--zen-text-lg)' }}>{option.icon}</span>
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{
                  fontSize: 'var(--zen-text-xl)',
                  fontWeight: 600,
                  color: 'var(--zen-text-primary)',
                  marginBottom: 'var(--zen-space-xl)',
                  textAlign: 'center'
                }}>
                  📅 您的出生时间
                </h3>

                <div className="zen-form-group">
                  <label className="zen-label zen-label-required">出生日期</label>
                  <div className="zen-form-row zen-form-row-3">
                    <div className="zen-select">
                      <select
                        value={birthInfo.birthYear}
                        onChange={(e) => setBirthInfo(prev => ({ ...prev, birthYear: parseInt(e.target.value) }))}
                      >
                        {yearOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="zen-select">
                      <select
                        value={birthInfo.birthMonth}
                        onChange={(e) => setBirthInfo(prev => ({ ...prev, birthMonth: parseInt(e.target.value) }))}
                      >
                        {monthOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="zen-select">
                      <select
                        value={birthInfo.birthDay}
                        onChange={(e) => setBirthInfo(prev => ({ ...prev, birthDay: parseInt(e.target.value) }))}
                      >
                        {getDayOptions(birthInfo.birthYear, birthInfo.birthMonth).map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {errors.birthDate && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        color: 'var(--zen-error-light)',
                        fontSize: 'var(--zen-text-sm)',
                        marginTop: 'var(--zen-space-sm)'
                      }}
                    >
                      ⚠️ {errors.birthDate}
                    </motion.div>
                  )}
                </div>

                <div className="zen-form-group">
                  <label className="zen-label">出生时间</label>
                  <div className="zen-form-row zen-form-row-2">
                    <div className="zen-select">
                      <select
                        value={birthInfo.birthHour}
                        onChange={(e) => setBirthInfo(prev => ({ ...prev, birthHour: parseInt(e.target.value) }))}
                      >
                        {hourOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="zen-select">
                      <select
                        value={birthInfo.birthMinute}
                        onChange={(e) => setBirthInfo(prev => ({ ...prev, birthMinute: parseInt(e.target.value) }))}
                      >
                        {minuteOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'var(--zen-info-alpha)',
                    border: '1px solid var(--zen-info)',
                    borderRadius: 'var(--zen-radius-lg)',
                    padding: 'var(--zen-space-lg)',
                    marginTop: 'var(--zen-space-lg)',
                    color: 'var(--zen-info-light)'
                  }}>
                    <div style={{ fontSize: 'var(--zen-text-sm)' }}>
                      📍 您选择的时间：{getTimeDescription()} {birthInfo.birthHour.toString().padStart(2, '0')}:{birthInfo.birthMinute.toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{
                  fontSize: 'var(--zen-text-xl)',
                  fontWeight: 600,
                  color: 'var(--zen-text-primary)',
                  marginBottom: 'var(--zen-space-xl)',
                  textAlign: 'center'
                }}>
                  ✨ 确认您的信息
                </h3>

                <div style={{
                  background: 'var(--zen-bg-glass)',
                  borderRadius: 'var(--zen-radius-lg)',
                  padding: 'var(--zen-space-xl)',
                  marginBottom: 'var(--zen-space-xl)'
                }}>
                  <div className="zen-flex zen-items-center zen-gap-lg zen-mb-lg">
                    <div style={{ fontSize: '2rem' }}>
                      {birthInfo.gender === 'male' ? '👨' : '👩'}
                    </div>
                    <div>
                      <div style={{
                        fontSize: 'var(--zen-text-lg)',
                        fontWeight: 600,
                        color: 'var(--zen-text-primary)',
                        marginBottom: 'var(--zen-space-xs)'
                      }}>
                        {birthInfo.name}
                      </div>
                      <div style={{
                        fontSize: 'var(--zen-text-sm)',
                        color: 'var(--zen-text-secondary)'
                      }}>
                        {birthInfo.gender === 'male' ? '男' : '女'}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--zen-space-lg)',
                    padding: 'var(--zen-space-lg)',
                    background: 'var(--zen-bg-card)',
                    borderRadius: 'var(--zen-radius-md)'
                  }}>
                    <div>
                      <div style={{
                        fontSize: 'var(--zen-text-xs)',
                        color: 'var(--zen-text-muted)',
                        marginBottom: 'var(--zen-space-xs)'
                      }}>
                        出生日期
                      </div>
                      <div style={{
                        fontSize: 'var(--zen-text-sm)',
                        color: 'var(--zen-text-primary)',
                        fontWeight: 500
                      }}>
                        {birthInfo.birthYear}年{birthInfo.birthMonth}月{birthInfo.birthDay}日
                      </div>
                    </div>
                    
                    <div>
                      <div style={{
                        fontSize: 'var(--zen-text-xs)',
                        color: 'var(--zen-text-muted)',
                        marginBottom: 'var(--zen-space-xs)'
                      }}>
                        出生时间
                      </div>
                      <div style={{
                        fontSize: 'var(--zen-text-sm)',
                        color: 'var(--zen-text-primary)',
                        fontWeight: 500
                      }}>
                        {getTimeDescription()} {birthInfo.birthHour.toString().padStart(2, '0')}:{birthInfo.birthMinute.toString().padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'var(--zen-success-alpha)',
                  border: '1px solid var(--zen-success)',
                  borderRadius: 'var(--zen-radius-lg)',
                  padding: 'var(--zen-space-lg)',
                  color: 'var(--zen-success-light)',
                  textAlign: 'center'
                }}>
                  🎯 点击"完成设置"后，系统将为您计算专属的八字运势
                </div>

                {/* 设置选项 */}
                <div style={{
                  marginTop: 'var(--zen-space-2xl)',
                  padding: 'var(--zen-space-xl)',
                  background: 'var(--zen-bg-card)',
                  borderRadius: 'var(--zen-radius-lg)',
                  border: '1px solid var(--zen-border-subtle)'
                }}>
                  <h4 style={{
                    fontSize: 'var(--zen-text-lg)',
                    fontWeight: 600,
                    color: 'var(--zen-text-primary)',
                    marginBottom: 'var(--zen-space-lg)',
                    textAlign: 'center'
                  }}>
                    ⚙️ 应用设置
                  </h4>

                  <div className="zen-flex zen-flex-col zen-gap-md">
                    <button
                      className="zen-btn zen-btn-ghost"
                      onClick={() => setShowNotificationSettings(true)}
                      style={{
                        justifyContent: 'flex-start',
                        padding: 'var(--zen-space-lg)',
                        borderRadius: 'var(--zen-radius-md)',
                        border: '1px solid var(--zen-border-subtle)',
                        background: 'var(--zen-bg-glass)'
                      }}
                    >
                      <div style={{ fontSize: 'var(--zen-text-xl)', marginRight: 'var(--zen-space-md)' }}>
                        🔔
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{
                          fontSize: 'var(--zen-text-sm)',
                          fontWeight: 600,
                          color: 'var(--zen-text-primary)',
                          marginBottom: 'var(--zen-space-xs)'
                        }}>
                          推送通知设置
                        </div>
                        <div style={{
                          fontSize: 'var(--zen-text-xs)',
                          color: 'var(--zen-text-muted)'
                        }}>
                          管理每日运势提醒和修行指导
                        </div>
                      </div>
                      <div style={{ marginLeft: 'auto', fontSize: 'var(--zen-text-lg)' }}>
                        →
                      </div>
                    </button>

                    <button
                      className="zen-btn zen-btn-ghost"
                      onClick={() => setShowPrivacyPolicy(true)}
                      style={{
                        justifyContent: 'flex-start',
                        padding: 'var(--zen-space-lg)',
                        borderRadius: 'var(--zen-radius-md)',
                        border: '1px solid var(--zen-border-subtle)',
                        background: 'var(--zen-bg-glass)'
                      }}
                    >
                      <div style={{ fontSize: 'var(--zen-text-xl)', marginRight: 'var(--zen-space-md)' }}>
                        🔒
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{
                          fontSize: 'var(--zen-text-sm)',
                          fontWeight: 600,
                          color: 'var(--zen-text-primary)',
                          marginBottom: 'var(--zen-space-xs)'
                        }}>
                          隐私安全协议
                        </div>
                        <div style={{
                          fontSize: 'var(--zen-text-xs)',
                          color: 'var(--zen-text-muted)'
                        }}>
                          了解我们如何保护您的隐私
                        </div>
                      </div>
                      <div style={{ marginLeft: 'auto', fontSize: 'var(--zen-text-lg)' }}>
                        →
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 操作按钮 */}
          <div className="zen-flex zen-justify-between zen-items-center" style={{ marginTop: 'var(--zen-space-2xl)' }}>
            <button
              className="zen-btn zen-btn-ghost"
              onClick={handlePrevious}
              disabled={activeStep === 1}
              style={{ opacity: activeStep === 1 ? 0.5 : 1 }}
            >
              ← 上一步
            </button>

            <div className="zen-flex zen-gap-sm">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: step <= activeStep ? 'var(--zen-primary)' : 'var(--zen-border-subtle)',
                    transition: 'background var(--zen-duration-normal)'
                  }}
                />
              ))}
            </div>

            <button
              className="zen-btn zen-btn-primary"
              onClick={handleNext}
              disabled={isSubmitting}
              style={{
                minWidth: '120px',
                position: 'relative'
              }}
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ fontSize: 'var(--zen-text-lg)' }}
                >
                  ⏳
                </motion.div>
              ) : (
                activeStep === 3 ? '完成设置 ✨' : '下一步 →'
              )}
            </button>
          </div>
        </motion.div>

        {/* 安全提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            textAlign: 'center',
            marginTop: 'var(--zen-space-xl)',
            color: 'var(--zen-text-muted)',
            fontSize: 'var(--zen-text-xs)'
          }}
        >
          🔒 您的个人信息将安全保存在本地，我们承诺保护您的隐私
        </motion.div>
      </div>

      {/* 推送通知设置模态框 */}
      <AnimatePresence>
        {showNotificationSettings && (
          <motion.div
            className="zen-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNotificationSettings(false)}
          >
            <motion.div
              className="zen-modal-content zen-modal-large"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="zen-modal-header">
                <h2>推送通知设置</h2>
                <button
                  className="zen-modal-close"
                  onClick={() => setShowNotificationSettings(false)}
                >
                  ✕
                </button>
              </div>
              <NotificationSettingsComponent 
                onClose={() => setShowNotificationSettings(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 隐私政策模态框 */}
      <AnimatePresence>
        {showPrivacyPolicy && (
          <motion.div
            className="zen-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPrivacyPolicy(false)}
          >
            <motion.div
              className="zen-modal-content zen-modal-large"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="zen-modal-header">
                <h2>隐私安全协议</h2>
                <button
                  className="zen-modal-close"
                  onClick={() => setShowPrivacyPolicy(false)}
                >
                  ✕
                </button>
              </div>
              <PrivacyPolicy 
                embedded={true}
                onClose={() => setShowPrivacyPolicy(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPageOptimized; 