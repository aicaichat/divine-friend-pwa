import React, { useState } from 'react';
import { NotificationTestService } from '../services/notificationTestService';

interface NotificationTestComponentProps {
  onNavigate?: (page: string) => void;
}

const NotificationTestComponent: React.FC<NotificationTestComponentProps> = ({ onNavigate }) => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    try {
      const results = await NotificationTestService.runAllTests();
      setTestResults(results);
      console.log('测试结果:', results);
    } catch (error) {
      console.error('测试失败:', error);
      setTestResults({ error: (error as Error).message || '未知错误' });
    }
    setIsLoading(false);
  };

  const testNotificationSettingsState = () => {
    console.log('测试通知设置状态变量:', {
      showNotificationSettings,
      setShowNotificationSettings: typeof setShowNotificationSettings
    });
    
    // 测试状态切换
    setShowNotificationSettings(!showNotificationSettings);
  };

  return (
    <div style={{
      padding: '20px',
      border: '2px solid #667eea',
      borderRadius: '8px',
      margin: '20px',
      background: '#f8f9ff'
    }}>
      <h3 style={{ color: '#667eea', textAlign: 'center' }}>🔔 通知功能测试组件</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>状态测试</h4>
        <p>showNotificationSettings: {showNotificationSettings ? 'true' : 'false'}</p>
        <button
          onClick={testNotificationSettingsState}
          style={{
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          切换通知设置状态
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={runTests}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            background: isLoading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '测试中...' : '运行通知测试'}
        </button>
      </div>

      {testResults && (
        <div style={{
          padding: '15px',
          background: 'white',
          borderRadius: '4px',
          border: '1px solid #ddd'
        }}>
          <h4>测试结果:</h4>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}

      {showNotificationSettings && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#e8f5e8',
          borderRadius: '4px',
          border: '1px solid #28a745'
        }}>
          <h4>通知设置模拟窗口</h4>
          <p>这是一个模拟的通知设置组件</p>
          <button
            onClick={() => setShowNotificationSettings(false)}
            style={{
              padding: '5px 10px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            关闭
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationTestComponent; 