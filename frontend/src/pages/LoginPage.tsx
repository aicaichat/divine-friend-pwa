import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginPageProps {
  onLogin: () => void;
}

interface LoginCredentials {
  username: string;
  password: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [loginMethod, setLoginMethod] = useState<'password' | 'nfc'>('password');
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nfcStatus, setNfcStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [nfcSupported, setNfcSupported] = useState(false);

  // 检查NFC支持
  useEffect(() => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    }
  }, []);

  // 密码登录
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 简单的演示验证（实际应用中应该调用真实API）
      if (credentials.username === 'admin' && credentials.password === '123456') {
        // 登录成功，设置用户信息
        const userInfo = {
          name: '虔诚修行者',
          email: 'user@example.com',
          loginTime: new Date().toISOString(),
          loginMethod: 'password'
        };
        
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        localStorage.setItem('isLoggedIn', 'true');
        
        onLogin();
      } else {
        setError('用户名或密码错误');
      }
    } catch (error) {
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // NFC登录
  const handleNFCLogin = async () => {
    if (!nfcSupported) {
      setError('您的设备不支持NFC功能');
      return;
    }

    setNfcStatus('scanning');
    setError('');

    try {
      // @ts-ignore - NFC API可能不在类型定义中
      const ndef = new NDEFReader();
      
      await ndef.scan();
      
             // 监听NFC标签
       ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
        console.log('🏷️ NFC标签检测到:', serialNumber);
        
        // 检查是否是有效的神仙朋友手串
        const validSerials = ['BLESS001', 'BLESS002', 'BLESS003']; // 示例序列号
        
        if (validSerials.includes(serialNumber) || serialNumber.startsWith('BLESS')) {
          setNfcStatus('success');
          
          // 登录成功
          const userInfo = {
            name: '手串持有者',
            email: 'bracelet@example.com',
            loginTime: new Date().toISOString(),
            loginMethod: 'nfc',
            braceletSerial: serialNumber
          };
          
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('braceletActivated', 'true');
          
          setTimeout(() => {
            onLogin();
          }, 1500);
        } else {
          setNfcStatus('error');
          setError('无效的神仙朋友手串，请检查您的手串是否正确');
        }
      });

      // 超时处理
      setTimeout(() => {
        if (nfcStatus === 'scanning') {
          setNfcStatus('error');
          setError('NFC扫描超时，请重试');
        }
      }, 15000);

    } catch (error) {
      console.error('NFC扫描错误:', error);
      setNfcStatus('error');
      
      if ((error as Error).name === 'NotAllowedError') {
        setError('请允许访问NFC功能');
      } else if ((error as Error).name === 'NotSupportedError') {
        setError('您的设备不支持NFC功能');
      } else {
        setError('NFC扫描失败，请重试');
      }
    }
  };

  // 游客登录
  const handleGuestLogin = () => {
    const guestInfo = {
      name: '游客用户',
      email: 'guest@example.com',
      loginTime: new Date().toISOString(),
      loginMethod: 'guest',
      isGuest: true
    };
    
    localStorage.setItem('userInfo', JSON.stringify(guestInfo));
    localStorage.setItem('isLoggedIn', 'true');
    
    onLogin();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F1419 0%, #1A1B26 50%, #2D2E3F 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          padding: '2rem',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* 标题 */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            style={{ fontSize: '3rem', marginBottom: '1rem' }}
          >
            🙏
          </motion.div>
          <h1 style={{ 
            color: 'white', 
            fontSize: '1.5rem', 
            fontWeight: '600',
            margin: '0 0 0.5rem 0'
          }}>
            神仙朋友
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontSize: '0.9rem',
            margin: 0
          }}>
            欢迎回来，请选择登录方式
          </p>
        </div>

        {/* 登录方式选择 */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => setLoginMethod('password')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: loginMethod === 'password' ? 'rgba(212, 175, 55, 0.3)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🔑 密码登录
          </button>
          <button
            onClick={() => setLoginMethod('nfc')}
            disabled={!nfcSupported}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: loginMethod === 'nfc' ? 'rgba(212, 175, 55, 0.3)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: nfcSupported ? 'white' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.9rem',
              cursor: nfcSupported ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease'
            }}
          >
            📿 手串登录
          </button>
        </div>

        {/* 错误提示 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #EF4444',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '1rem',
                color: '#FCA5A5',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 密码登录表单 */}
        {loginMethod === 'password' && (
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handlePasswordLogin}
            style={{ marginBottom: '1rem' }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="用户名"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="password"
                placeholder="密码"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading || !credentials.username || !credentials.password}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: loading ? 'rgba(107, 114, 128, 0.5)' : 'linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: (!credentials.username || !credentials.password) ? 0.5 : 1
              }}
            >
              {loading ? '登录中...' : '🔑 密码登录'}
            </motion.button>
            
            {/* 演示账号提示 */}
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: 'rgba(147, 197, 253, 0.9)'
            }}>
              💡 演示账号：<br/>
              用户名: <strong>admin</strong><br/>
              密码: <strong>123456</strong>
            </div>
          </motion.form>
        )}

        {/* NFC登录界面 */}
        {loginMethod === 'nfc' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ textAlign: 'center', marginBottom: '1rem' }}
          >
            <motion.div
              animate={{
                scale: nfcStatus === 'scanning' ? [1, 1.1, 1] : 1,
                rotate: nfcStatus === 'scanning' ? [0, 180, 360] : 0
              }}
              transition={{
                scale: { duration: 1.5, repeat: nfcStatus === 'scanning' ? Infinity : 0 },
                rotate: { duration: 2, repeat: nfcStatus === 'scanning' ? Infinity : 0, ease: 'linear' }
              }}
              style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                filter: nfcStatus === 'success' ? 'drop-shadow(0 0 20px #10B981)' : 
                       nfcStatus === 'error' ? 'drop-shadow(0 0 20px #EF4444)' : 'none'
              }}
            >
              {nfcStatus === 'success' ? '✅' : 
               nfcStatus === 'error' ? '❌' : '📿'}
            </motion.div>
            
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}>
              {nfcStatus === 'idle' && '将您的神仙朋友手串靠近设备'}
              {nfcStatus === 'scanning' && '正在扫描手串...'}
              {nfcStatus === 'success' && '手串验证成功！'}
              {nfcStatus === 'error' && '扫描失败，请重试'}
            </p>

            <motion.button
              onClick={handleNFCLogin}
              disabled={!nfcSupported || nfcStatus === 'scanning'}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: nfcStatus === 'scanning' ? 'rgba(107, 114, 128, 0.5)' : 
                           'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: (!nfcSupported || nfcStatus === 'scanning') ? 'not-allowed' : 'pointer',
                opacity: !nfcSupported ? 0.5 : 1
              }}
            >
              {nfcStatus === 'scanning' ? '🔍 扫描中...' : '📿 开始扫描手串'}
            </motion.button>

            {!nfcSupported && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: 'rgba(252, 211, 77, 0.9)'
              }}>
                ⚠️ 您的设备不支持NFC功能，请使用密码登录
              </div>
            )}
          </motion.div>
        )}

        {/* 游客登录 */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleGuestLogin}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              color: 'rgba(255, 255, 255, 0.7)',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
            }}
          >
            👤 游客登录
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage; 