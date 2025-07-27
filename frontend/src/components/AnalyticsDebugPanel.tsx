import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import analyticsService from '../hooks/useAnalytics';

interface AnalyticsDebugPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

const AnalyticsDebugPanel: React.FC<AnalyticsDebugPanelProps> = ({ isVisible, onToggle }) => {
  const [sessionData, setSessionData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const updateData = () => {
      const data = analyticsService.getSessionData();
      setSessionData(data);
      setEvents(data.events || []);
    };

    // 初始更新
    updateData();

    // 定期更新数据
    const interval = setInterval(updateData, 2000);
    return () => clearInterval(interval);
  }, []);

  const exportData = () => {
    const data = analyticsService.getSessionData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    // 清除本地数据（实际应用中应该发送到服务器）
    console.log('📊 Analytics data cleared');
    setEvents([]);
  };

  const getEventIcon = (event: string) => {
    const icons: Record<string, string> = {
      'page_view': '📄',
      'user_action': '👆',
      'session_start': '🚀',
      'session_end': '🛑',
      'page_hide': '👁️',
      'page_show': '👁️',
      'page_load': '📱',
      'fortune_loaded': '🔮',
      'new_user_visit': '🆕',
      'error': '❌'
    };
    return icons[event] || '📊';
  };

  const getEventColor = (event: string) => {
    const colors: Record<string, string> = {
      'page_view': '#3B82F6',
      'user_action': '#10B981',
      'session_start': '#8B5CF6',
      'session_end': '#EF4444',
      'page_hide': '#F59E0B',
      'page_show': '#10B981',
      'page_load': '#3B82F6',
      'fortune_loaded': '#8B5CF6',
      'new_user_visit': '#F59E0B',
      'error': '#EF4444'
    };
    return colors[event] || '#6B7280';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '350px',
            maxHeight: '80vh',
            background: 'rgba(15, 20, 25, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            zIndex: 10000,
            overflow: 'hidden',
            fontFamily: 'monospace'
          }}
        >
          {/* 头部 */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📊</span>
              <span style={{ color: 'white', fontWeight: '600' }}>分析数据</span>
            </div>
            <button
              onClick={onToggle}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              ✕
            </button>
          </div>

          {/* 会话信息 */}
          {sessionData && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
                会话ID: {sessionData.sessionId?.substring(0, 16)}...
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '11px' }}>
                事件数: {events.length} | 页面访问: {sessionData.pageViews?.length || 0}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div style={{
            padding: '12px 16px',
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button
              onClick={exportData}
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10B981',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              导出数据
            </button>
            <button
              onClick={clearData}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              清除数据
            </button>
          </div>

          {/* 事件列表 */}
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '8px'
          }}>
            {events.length === 0 ? (
              <div style={{
                color: 'rgba(255, 255, 255, 0.4)',
                textAlign: 'center',
                padding: '20px',
                fontSize: '12px'
              }}>
                暂无事件数据
              </div>
            ) : (
              events.slice().reverse().map((event, index) => (
                <motion.div
                  key={`${event.timestamp}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    padding: '8px',
                    margin: '4px 0',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    border: `1px solid ${getEventColor(event.event)}30`
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '14px' }}>
                      {getEventIcon(event.event)}
                    </span>
                    <span style={{
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {event.event}
                    </span>
                    <span style={{
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontSize: '10px',
                      marginLeft: 'auto'
                    }}>
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {event.data && Object.keys(event.data).length > 0 && (
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all'
                    }}>
                      {JSON.stringify(event.data, null, 2)}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnalyticsDebugPanel; 