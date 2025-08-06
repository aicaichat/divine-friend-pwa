import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserOnboardingFlowProps {
  step: 'welcome' | 'preview' | 'basic-info' | 'value-demo' | 'detailed-info';
  onStepChange: (step: string) => void;
  onComplete: () => void;
  onNavigate?: (page: string) => void;
  userProgress: {
    completionLevel: number;
    hasBasicInfo: boolean;
    hasDetailedInfo: boolean;
    hasExperiencedPersonalized: boolean;
    isFirstTimeUser: boolean;
    visitCount: number;
  };
}

const UserOnboardingFlow: React.FC<UserOnboardingFlowProps> = ({
  step,
  onStepChange,
  onComplete,
  onNavigate,
  userProgress
}) => {
  const [currentStep, setCurrentStep] = useState(step);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setCurrentStep(step);
  }, [step]);

  const handleNext = () => {
    const steps = ['welcome', 'preview', 'basic-info', 'value-demo', 'detailed-info'] as const;
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep);
      onStepChange(nextStep);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleBack = () => {
    const steps = ['welcome', 'preview', 'basic-info', 'value-demo', 'detailed-info'] as const;
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      setCurrentStep(prevStep);
      onStepChange(prevStep);
    }
  };

  const renderWelcomeStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="onboarding-step"
      style={{
        textAlign: 'center',
        padding: '2rem',
        maxWidth: '500px',
        margin: '0 auto'
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          fontSize: '4rem',
          marginBottom: '1rem'
        }}
      >
        🧘‍♀️
      </motion.div>
      
      <h2 style={{
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: '1rem'
      }}>
        欢迎来到神仙朋友
      </h2>
      
      <p style={{
        fontSize: '1.1rem',
        color: '#666',
        lineHeight: 1.6,
        marginBottom: '2rem'
      }}>
        这是一个融合东方玄学与现代科技的智能陪伴应用。
        让我们花几分钟时间，为您打造专属的个性化体验。
      </p>

      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleSkip}
          style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: 'transparent',
            color: '#666',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          跳过引导
        </button>
        <button
          onClick={handleNext}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          开始体验
        </button>
      </div>
    </motion.div>
  );

  const renderPreviewStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="onboarding-step"
      style={{
        textAlign: 'center',
        padding: '2rem',
        maxWidth: '600px',
        margin: '0 auto'
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}
      >
        ✨
      </motion.div>
      
      <h2 style={{
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: '1rem'
      }}>
        功能预览
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { icon: '🔮', title: '每日运势', desc: '精准的八字运势分析' },
          { icon: '👔', title: '穿衣搭配', desc: '玄学智能穿衣推荐' },
          { icon: '💬', title: '智能对话', desc: '个性化AI陪伴' },
          { icon: '📿', title: '手串管理', desc: 'NFC智能手串' }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            style={{
              padding: '1rem',
              border: '1px solid #eee',
              borderRadius: '12px',
              background: 'white'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {feature.icon}
            </div>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '0.25rem'
            }}>
              {feature.title}
            </h3>
            <p style={{
              fontSize: '0.85rem',
              color: '#666'
            }}>
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleBack}
          style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: 'transparent',
            color: '#666',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          上一步
        </button>
        <button
          onClick={handleNext}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          下一步
        </button>
      </div>
    </motion.div>
  );

  const renderBasicInfoStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="onboarding-step"
      style={{
        padding: '2rem',
        maxWidth: '500px',
        margin: '0 auto'
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          fontSize: '3rem',
          textAlign: 'center',
          marginBottom: '1rem'
        }}
      >
        📝
      </motion.div>
      
      <h2 style={{
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        基本信息设置
      </h2>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#333'
          }}>
            您的姓名
          </label>
          <input
            type="text"
            placeholder="请输入您的姓名"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>
        
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#333'
          }}>
            出生日期
          </label>
          <input
            type="date"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>
        
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#333'
          }}>
            性别
          </label>
          <select
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          >
            <option value="">请选择性别</option>
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleBack}
          style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: 'transparent',
            color: '#666',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          上一步
        </button>
        <button
          onClick={handleNext}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          下一步
        </button>
      </div>
    </motion.div>
  );

  const renderValueDemoStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="onboarding-step"
      style={{
        textAlign: 'center',
        padding: '2rem',
        maxWidth: '600px',
        margin: '0 auto'
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}
      >
        🎯
      </motion.div>
      
      <h2 style={{
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: '1rem'
      }}>
        价值演示
      </h2>
      
      <p style={{
        fontSize: '1.1rem',
        color: '#666',
        lineHeight: 1.6,
        marginBottom: '2rem'
      }}>
        体验一下我们的核心功能，感受个性化服务的魅力
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            padding: '1.5rem',
            border: '1px solid #eee',
            borderRadius: '12px',
            background: 'white',
            cursor: 'pointer'
          }}
          onClick={() => onNavigate?.('fortune')}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔮</div>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            今日运势
          </h3>
          <p style={{
            fontSize: '0.9rem',
            color: '#666'
          }}>
            查看您的专属运势分析
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            padding: '1.5rem',
            border: '1px solid #eee',
            borderRadius: '12px',
            background: 'white',
            cursor: 'pointer'
          }}
          onClick={() => onNavigate?.('outfit')}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👔</div>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            穿衣推荐
          </h3>
          <p style={{
            fontSize: '0.9rem',
            color: '#666'
          }}>
            获取玄学穿衣建议
          </p>
        </motion.div>
      </div>

      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleBack}
          style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: 'transparent',
            color: '#666',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          上一步
        </button>
        <button
          onClick={handleNext}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          下一步
        </button>
      </div>
    </motion.div>
  );

  const renderDetailedInfoStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="onboarding-step"
      style={{
        padding: '2rem',
        maxWidth: '500px',
        margin: '0 auto'
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          fontSize: '3rem',
          textAlign: 'center',
          marginBottom: '1rem'
        }}
      >
        ⚙️
      </motion.div>
      
      <h2 style={{
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        详细设置
      </h2>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#333'
          }}>
            出生时间
          </label>
          <input
            type="time"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>
        
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#333'
          }}>
            出生地点
          </label>
          <input
            type="text"
            placeholder="请输入出生城市"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>
        
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#333'
          }}>
            偏好设置
          </label>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {[
              '每日运势提醒',
              '穿衣搭配推荐',
              '智能对话陪伴',
              '手串管理功能'
            ].map((preference, index) => (
              <label key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  defaultChecked
                  style={{
                    width: '1rem',
                    height: '1rem'
                  }}
                />
                <span style={{ fontSize: '0.9rem' }}>{preference}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleBack}
          style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: 'transparent',
            color: '#666',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          上一步
        </button>
        <button
          onClick={handleComplete}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          完成设置
        </button>
      </div>
    </motion.div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcomeStep();
      case 'preview':
        return renderPreviewStep();
      case 'basic-info':
        return renderBasicInfoStep();
      case 'value-demo':
        return renderValueDemoStep();
      case 'detailed-info':
        return renderDetailedInfoStep();
      default:
        return renderWelcomeStep();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
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
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default UserOnboardingFlow; 