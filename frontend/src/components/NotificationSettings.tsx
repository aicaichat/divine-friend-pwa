import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  notificationService, 
  NotificationSettings, 
  notificationPreferences 
} from '../services/notificationService';

interface NotificationSettingsProps {
  onClose?: () => void;
}

const NotificationSettingsComponent: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [permission, setPermission] = useState<NotificationPermission>(notificationService.getPermissionStatus());
  const [isLoading, setIsLoading] = useState(false);
  const [showTestResult, setShowTestResult] = useState(false);

  // 权限状态更新
  useEffect(() => {
    const checkPermission = () => {
      setPermission(notificationService.getPermissionStatus());
    };

    // 监听权限变化
    const interval = setInterval(checkPermission, 1000);
    return () => clearInterval(interval);
  }, []);

  // 请求通知权限
  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const result = await notificationService.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setSettings(notificationService.getSettings());
        // 启动通知调度
        notificationService.scheduleNotifications();
      }
    } catch (error) {
      console.error('请求权限失败:', error);
      alert('请求通知权限失败，请在浏览器设置中手动开启通知权限。');
    } finally {
      setIsLoading(false);
    }
  };

  // 更新设置
  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationService.updateSettings({ [key]: value });
    
    // 如果启用了通知，重新调度
    if (newSettings.enabled) {
      notificationService.scheduleNotifications();
    }
  };

  // 更新勿扰时间
  const updateQuietHours = (key: 'enabled' | 'startTime' | 'endTime', value: boolean | string) => {
    const newQuietHours = { ...settings.quietHours, [key]: value };
    const newSettings = { ...settings, quietHours: newQuietHours };
    setSettings(newSettings);
    notificationService.updateSettings({ quietHours: newQuietHours });
  };

  // 测试通知
  const handleTestNotification = async () => {
    if (permission !== 'granted') {
      alert('请先开启通知权限');
      return;
    }

    try {
      await notificationService.testNotification();
      setShowTestResult(true);
      setTimeout(() => setShowTestResult(false), 3000);
    } catch (error) {
      console.error('测试通知失败:', error);
      alert('测试通知失败，请检查浏览器设置');
    }
  };

  // 获取权限状态样式
  const getPermissionStatusStyle = () => {
    switch (permission) {
      case 'granted':
        return { color: '#10B981', icon: '✅' };
      case 'denied':
        return { color: '#EF4444', icon: '❌' };
      default:
        return { color: '#F59E0B', icon: '⚠️' };
    }
  };

  const permissionStatus = getPermissionStatusStyle();

  return (
    <div className="notification-settings">
      {/* 标题区域 */}
      <div className="settings-header">
        <motion.div
          className="header-content"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="settings-title">
            🔔 推送通知设置
          </h2>
          <p className="settings-subtitle">
            个性化您的通知体验，不错过重要的修行提醒
          </p>
        </motion.div>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="close-button"
            aria-label="关闭设置"
          >
            ✕
          </button>
        )}
      </div>

      {/* 权限状态卡片 */}
      <motion.div 
        className="permission-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="permission-status">
          <div className="status-indicator">
            <span 
              className="status-icon"
              style={{ color: permissionStatus.color }}
            >
              {permissionStatus.icon}
            </span>
            <div className="status-text">
              <h3>通知权限状态</h3>
              <p style={{ color: permissionStatus.color }}>
                {permission === 'granted' && '已授权 - 可以接收通知'}
                {permission === 'denied' && '已拒绝 - 无法接收通知'}
                {permission === 'default' && '未设置 - 需要授权'}
              </p>
            </div>
          </div>
          
          {permission !== 'granted' && (
            <motion.button
              className="btn btn-primary btn-md"
              onClick={handleRequestPermission}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  请求中...
                </>
              ) : (
                '开启通知权限'
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* 主开关 */}
      {permission === 'granted' && (
        <motion.div 
          className="main-toggle-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="toggle-item">
            <div className="toggle-info">
              <h3>启用推送通知</h3>
              <p>开启后将根据您的设置推送相关通知</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => updateSetting('enabled', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </motion.div>
      )}

      {/* 通知类型设置 */}
      <AnimatePresence>
        {permission === 'granted' && settings.enabled && (
          <motion.div
            className="notification-types"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="section-header">
              <h3>通知类型</h3>
              <p>选择您希望接收的通知类型</p>
            </div>

            <div className="notification-list">
              {notificationPreferences.map((pref, index) => (
                <motion.div
                  key={pref.type}
                  className="notification-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                >
                  <div className="item-icon">
                    {pref.icon}
                  </div>
                  <div className="item-content">
                    <h4>{pref.title}</h4>
                    <p>{pref.description}</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings[pref.type]}
                      onChange={(e) => updateSetting(pref.type, e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 勿扰时间设置 */}
      <AnimatePresence>
        {permission === 'granted' && settings.enabled && (
          <motion.div
            className="quiet-hours-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <div className="section-header">
              <h3>勿扰时间</h3>
              <p>设置您不希望接收通知的时间段</p>
            </div>

            <div className="quiet-hours-toggle">
              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>启用勿扰模式</h4>
                  <p>在指定时间段内不会收到通知</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.quietHours.enabled}
                    onChange={(e) => updateQuietHours('enabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <AnimatePresence>
              {settings.quietHours.enabled && (
                <motion.div
                  className="time-range-picker"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="time-inputs">
                    <div className="time-input-group">
                      <label>开始时间</label>
                      <input
                        type="time"
                        value={settings.quietHours.startTime}
                        onChange={(e) => updateQuietHours('startTime', e.target.value)}
                        className="time-input"
                      />
                    </div>
                    <div className="time-separator">-</div>
                    <div className="time-input-group">
                      <label>结束时间</label>
                      <input
                        type="time"
                        value={settings.quietHours.endTime}
                        onChange={(e) => updateQuietHours('endTime', e.target.value)}
                        className="time-input"
                      />
                    </div>
                  </div>
                  <p className="time-hint">
                    🌙 勿扰时间: {settings.quietHours.startTime} - {settings.quietHours.endTime}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 通知偏好设置 */}
      <AnimatePresence>
        {permission === 'granted' && settings.enabled && (
          <motion.div
            className="notification-preferences"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <div className="section-header">
              <h3>通知偏好</h3>
              <p>自定义通知的表现形式</p>
            </div>

            <div className="preference-list">
              <div className="preference-item">
                <div className="preference-info">
                  <h4>🔊 声音提醒</h4>
                  <p>通知时播放提示音</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.sound}
                    onChange={(e) => updateSetting('sound', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <h4>📳 震动反馈</h4>
                  <p>通知时设备震动（移动设备）</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.vibration}
                    onChange={(e) => updateSetting('vibration', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 测试和管理 */}
      <AnimatePresence>
        {permission === 'granted' && settings.enabled && (
          <motion.div
            className="notification-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <div className="section-header">
              <h3>测试与管理</h3>
              <p>测试通知功能或清除现有通知</p>
            </div>

            <div className="action-buttons">
              <motion.button
                className="btn btn-secondary btn-md"
                onClick={handleTestNotification}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🧪 测试通知
              </motion.button>

              <motion.button
                className="btn btn-ghost btn-md"
                onClick={() => notificationService.clearAllNotifications()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🗑️ 清除通知
              </motion.button>
            </div>

            <AnimatePresence>
              {showTestResult && (
                <motion.div
                  className="test-result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  ✅ 测试通知已发送！请查看您的通知栏。
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 帮助信息 */}
      <motion.div
        className="help-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.3 }}
      >
        <div className="help-content">
          <h4>💡 小贴士</h4>
          <ul>
            <li>• 通知权限被拒绝后，需要在浏览器设置中手动开启</li>
            <li>• 勿扰时间支持跨日设置（如晚10点到早8点）</li>
            <li>• 关闭应用后，某些通知可能需要Service Worker支持</li>
            <li>• 不同浏览器的通知表现可能略有差异</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationSettingsComponent; 