import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ChangePasswordPageProps {
  onNavigate?: (page: string) => void;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({ onNavigate }) => {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 显示消息
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // 密码强度检查
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { level: 0, text: '', color: '#gray' };
    if (password.length < 6) return { level: 1, text: '弱', color: '#ff4757' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 2, text: '中', color: '#ffa502' };
    if (score <= 4) return { level: 3, text: '强', color: '#2ed573' };
    return { level: 4, text: '很强', color: '#1dd1a1' };
  };

  // 处理密码修改
  const handleChangePassword = async () => {
    // 表单验证
    if (!passwordData.currentPassword) {
      showMessage('error', '请输入当前密码');
      return;
    }
    
    if (!passwordData.newPassword) {
      showMessage('error', '请输入新密码');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', '两次输入的密码不一致');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showMessage('error', '新密码至少需要6位');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      showMessage('error', '新密码不能与当前密码相同');
      return;
    }

    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 清空表单
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMessage('success', '密码修改成功！请重新登录');
      
      // 3秒后返回设置页面
      setTimeout(() => {
        onNavigate?.('profile');
      }, 3000);
    } catch (error) {
      showMessage('error', '密码修改失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '2rem 1rem',
      paddingBottom: '6rem'
    }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* 头部 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '2rem',
            textAlign: 'center'
          }}
        >
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: '0.5rem'
          }}>
            🔐 修改密码
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1rem',
            marginBottom: '1.5rem'
          }}>
            为了账户安全，请设置复杂的密码
          </p>

          {/* 返回按钮 */}
          <motion.button
            onClick={() => onNavigate?.('profile')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            ← 返回设置
          </motion.button>
        </motion.div>

        {/* 消息提示 */}
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              borderRadius: '10px',
              background: message.type === 'success' 
                ? 'rgba(46, 213, 115, 0.2)' 
                : 'rgba(255, 71, 87, 0.2)',
              border: `1px solid ${message.type === 'success' ? '#2ed573' : '#ff4757'}40`,
              color: message.type === 'success' ? '#2ed573' : '#ff4757',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}
          >
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </motion.div>
        )}

        {/* 密码修改表单 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '2rem',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* 当前密码 */}
            <div>
              <label style={{
                display: 'block',
                color: '#FFFFFF',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                当前密码 *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                  placeholder="请输入当前密码"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '3rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FFD700'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  {showCurrentPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* 新密码 */}
            <div>
              <label style={{
                display: 'block',
                color: '#FFFFFF',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                新密码 *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                  placeholder="请输入新密码"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '3rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FFD700'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  {showNewPassword ? '🙈' : '👁️'}
                </button>
              </div>
              
              {/* 密码强度指示器 */}
              {passwordData.newPassword && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.25rem'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      密码强度:
                    </span>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      color: passwordStrength.color,
                      fontWeight: '500'
                    }}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div style={{
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(passwordStrength.level / 4) * 100}%`,
                      background: passwordStrength.color,
                      transition: 'all 0.3s ease'
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* 确认密码 */}
            <div>
              <label style={{
                display: 'block',
                color: '#FFFFFF',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                确认密码 *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                  placeholder="请再次输入新密码"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '3rem',
                    borderRadius: '10px',
                    border: `1px solid ${
                      passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                        ? '#ff4757'
                        : passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword
                        ? '#2ed573'
                        : 'rgba(255, 255, 255, 0.3)'
                    }`,
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FFD700'}
                  onBlur={(e) => {
                    if (passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword) {
                      e.target.style.borderColor = '#ff4757';
                    } else if (passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword) {
                      e.target.style.borderColor = '#2ed573';
                    } else {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              
              {/* 密码匹配提示 */}
              {passwordData.confirmPassword && (
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: passwordData.newPassword === passwordData.confirmPassword ? '#2ed573' : '#ff4757'
                }}>
                  {passwordData.newPassword === passwordData.confirmPassword 
                    ? '✅ 密码匹配' 
                    : '❌ 密码不匹配'}
                </div>
              )}
            </div>

            {/* 密码要求提示 */}
            <div style={{
              padding: '1rem',
              background: 'rgba(255, 215, 0, 0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 215, 0, 0.3)'
            }}>
              <h4 style={{
                color: '#FFD700',
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
                fontWeight: '600'
              }}>
                💡 密码要求
              </h4>
              <ul style={{
                margin: 0,
                paddingLeft: '1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.8rem',
                lineHeight: 1.6
              }}>
                <li>至少6位字符</li>
                <li>建议包含大小写字母</li>
                <li>建议包含数字和特殊字符</li>
                <li>不要使用常见密码</li>
              </ul>
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <motion.button
                onClick={() => onNavigate?.('profile')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                取消
              </motion.button>
              
              <motion.button
                onClick={handleChangePassword}
                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                style={{
                  flex: 2,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: loading 
                    ? 'rgba(255, 215, 0, 0.5)' 
                    : 'linear-gradient(135deg, #FFD700, #FFA500)',
                  color: '#000',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(0, 0, 0, 0.3)',
                    borderTop: '2px solid #000',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                )}
                {loading ? '修改中...' : '确认修改'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChangePasswordPage; 