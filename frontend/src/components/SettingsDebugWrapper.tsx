import React, { useState } from 'react';
import SettingsPageOptimized from '../pages/SettingsPageOptimized';

interface SettingsDebugWrapperProps {
  onNavigate: (page: string) => void;
}

const SettingsDebugWrapper: React.FC<SettingsDebugWrapperProps> = ({ onNavigate }) => {
  const [debugInfo, setDebugInfo] = useState({
    renderCount: 0,
    lastError: null as string | null,
    componentLoaded: false
  });

  React.useEffect(() => {
    setDebugInfo(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      componentLoaded: true
    }));
  }, []);

  const handleError = (error: Error) => {
    console.error('SettingsDebugWrapper caught error:', error);
    setDebugInfo(prev => ({
      ...prev,
      lastError: error.message
    }));
  };

  React.useEffect(() => {
    const originalError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (typeof message === 'string' && message.includes('showNotificationSettings')) {
        handleError(new Error(`ReferenceError at ${source}:${lineno} - ${message}`));
      }
      if (originalError) {
        return originalError(message, source, lineno, colno, error);
      }
      return false;
    };

    return () => {
      window.onerror = originalError;
    };
  }, []);

  if (debugInfo.lastError) {
    return (
      <div style={{
        padding: '20px',
        background: '#ffe6e6',
        border: '2px solid #ff4444',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h3 style={{ color: '#cc0000' }}>⚠️ 设置页面错误</h3>
        <p><strong>错误信息:</strong> {debugInfo.lastError}</p>
        <p><strong>渲染次数:</strong> {debugInfo.renderCount}</p>
        <button
          onClick={() => setDebugInfo(prev => ({ ...prev, lastError: null }))}
          style={{
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          重试加载设置页面
        </button>
        <button
          onClick={() => onNavigate('today')}
          style={{
            padding: '10px 20px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px',
            marginLeft: '10px'
          }}
        >
          返回首页
        </button>
      </div>
    );
  }

  try {
    return (
      <div>
        <SettingsPageOptimized onNavigate={onNavigate} />
      </div>
    );
  } catch (error) {
    handleError(error as Error);
    return (
      <div style={{
        padding: '20px',
        background: '#fff3cd',
        border: '2px solid #ffc107',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h3 style={{ color: '#856404' }}>🚨 设置页面加载失败</h3>
        <p>设置页面遇到了问题，请尝试刷新页面或返回首页。</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            background: '#ffc107',
            color: '#212529',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          刷新页面
        </button>
      </div>
    );
  }
};

export default SettingsDebugWrapper; 