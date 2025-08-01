import { useState, useEffect, useCallback, useRef } from 'react';
import { braceletService } from '../services/braceletService';

// NFC优化检测Hook
export const useNFCOptimized = () => {
  const [nfcSupported, setNfcSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [braceletInfo, setBraceletInfo] = useState(null);
  const [error, setError] = useState(null);
  
  // 防重复扫描
  const scanTimeoutRef = useRef(null);
  const lastChipIdRef = useRef(null);
  
  // 检测NFC支持
  useEffect(() => {
    const checkNFCSupport = async () => {
      if ('NDEFReader' in window) {
        try {
          const permission = await navigator.permissions.query({ name: 'nfc' });
          setNfcSupported(permission.state === 'granted' || permission.state === 'prompt');
        } catch (error) {
          console.log('NFC permission check failed:', error);
          setNfcSupported(false);
        }
      } else {
        setNfcSupported(false);
      }
    };
    
    checkNFCSupport();
  }, []);

  // 优化的NFC扫描函数
  const startNFCScan = useCallback(async () => {
    if (!nfcSupported) {
      setError('设备不支持NFC功能');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const ndef = new NDEFReader();
      
      // 请求NFC权限
      await ndef.scan();
      
      // 添加读取监听器
      ndef.addEventListener('reading', async ({ message, serialNumber }) => {
        try {
          // 防重复扫描（500ms内）
          const now = Date.now();
          if (lastScanTime && now - lastScanTime < 500) {
            return;
          }
          setLastScanTime(now);

          // 震动反馈
          if ('vibrate' in navigator) {
            navigator.vibrate([50, 50, 50]);
          }

          // 播放提示音
          playSuccessSound();

          // 处理NFC数据
          await handleNFCData(message, serialNumber);
          
        } catch (error) {
          console.error('NFC读取处理错误:', error);
          setError('读取手串信息失败，请重试');
          playErrorSound();
        }
      });

      // 添加错误监听器
      ndef.addEventListener('readingerror', () => {
        setError('NFC读取失败，请重新靠近手串');
        playErrorSound();
      });

    } catch (error) {
      console.error('NFC启动失败:', error);
      setError('无法启动NFC扫描，请检查设备设置');
      setIsScanning(false);
    }
  }, [nfcSupported, lastScanTime]);

  // 处理NFC数据
  const handleNFCData = async (message, serialNumber) => {
    try {
      let chipId = serialNumber;
      let braceletData = null;

      // 尝试从NFC消息中提取更多信息
      for (const record of message.records) {
        if (record.recordType === 'text') {
          const textDecoder = new TextDecoder(record.encoding || 'utf-8');
          const data = textDecoder.decode(record.data);
          
          try {
            const nfcData = JSON.parse(data);
            if (nfcData.chipId) chipId = nfcData.chipId;
            if (nfcData.braceletId) braceletData = nfcData;
          } catch {
            // 如果不是JSON，当作纯文本处理
            chipId = data;
          }
        }
      }

      // 避免重复处理相同芯片
      if (lastChipIdRef.current === chipId) {
        return;
      }
      lastChipIdRef.current = chipId;

      // 显示加载状态
      showToast('正在验证手串...', 'loading');

      // 验证芯片ID
      const response = await braceletService.activationCode.verifyNFC(chipId);
      
      if (response.valid && response.braceletInfo) {
        setBraceletInfo(response.braceletInfo);
        showToast('✨ 手串验证成功！', 'success');
        
        // 触发成功回调
        if (onNFCSuccess) {
          onNFCSuccess(response.braceletInfo, chipId);
        }
        
        // 保存到本地存储
        localStorage.setItem('lastNFCTime', Date.now().toString());
        localStorage.setItem('braceletInfo', JSON.stringify(response.braceletInfo));
        
      } else {
        setError(response.error || '无效的手串芯片');
        showToast('❌ 手串验证失败', 'error');
      }

    } catch (error) {
      console.error('处理NFC数据失败:', error);
      setError('处理手串数据失败');
      showToast('❌ 数据处理失败', 'error');
    }
  };

  // 停止NFC扫描
  const stopNFCScan = useCallback(() => {
    setIsScanning(false);
    lastChipIdRef.current = null;
    
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
  }, []);

  // 智能扫描模式（自动重试）
  const smartScan = useCallback(async (options = {}) => {
    const { 
      timeout = 10000, 
      retryCount = 3,
      onProgress 
    } = options;

    let attempts = 0;
    
    const attemptScan = async () => {
      attempts++;
      
      if (onProgress) {
        onProgress(attempts, retryCount);
      }

      try {
        await startNFCScan();
        
        // 设置超时
        scanTimeoutRef.current = setTimeout(() => {
          if (attempts < retryCount) {
            showToast(`第${attempts}次尝试超时，正在重试...`, 'warning');
            attemptScan();
          } else {
            setError('多次尝试失败，请检查手串位置');
            stopNFCScan();
          }
        }, timeout);

      } catch (error) {
        if (attempts < retryCount) {
          setTimeout(attemptScan, 1000);
        } else {
          setError('扫描失败，请重试');
          stopNFCScan();
        }
      }
    };

    await attemptScan();
  }, [startNFCScan, stopNFCScan]);

  // 快速验证（用于已知用户）
  const quickVerify = useCallback(async (chipId) => {
    try {
      showToast('快速验证中...', 'loading');
      
      const response = await braceletService.activationCode.verifyNFC(chipId);
      
      if (response.valid) {
        setBraceletInfo(response.braceletInfo);
        showToast('✅ 验证成功！', 'success');
        return response.braceletInfo;
      } else {
        throw new Error(response.error || '验证失败');
      }
    } catch (error) {
      setError(error.message);
      showToast('❌ 验证失败', 'error');
      return null;
    }
  }, []);

  // 工具函数
  const playSuccessSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMoCyyB0fPfeiwGKnTB8+SXRQ0VUqzn9bNTEwhCnOD2xm0nCyV+zPLbeC0HM3nI8+eTRA0SU6jj9LVZFAg+m+D2wmkrCSaAz/PdgC8HKGy+8OB8LggwdMny2YJAEAw');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (error) {
      console.log('无法播放提示音:', error);
    }
  };

  const playErrorSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU4AAAACEACgAqQAtACYALQAoAC0AJgAtAC');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (error) {
      console.log('无法播放错误音:', error);
    }
  };

  const showToast = (message, type = 'info') => {
    // 这里可以集成你的Toast组件
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  return {
    nfcSupported,
    isScanning,
    braceletInfo,
    error,
    startNFCScan,
    stopNFCScan,
    smartScan,
    quickVerify,
    lastScanTime
  };
};

// NFC状态管理Context
import { createContext, useContext } from 'react';

const NFCContext = createContext();

export const NFCProvider = ({ children, onNFCSuccess }) => {
  const nfcState = useNFCOptimized({ onNFCSuccess });
  
  return (
    <NFCContext.Provider value={nfcState}>
      {children}
    </NFCContext.Provider>
  );
};

export const useNFC = () => {
  const context = useContext(NFCContext);
  if (!context) {
    throw new Error('useNFC must be used within NFCProvider');
  }
  return context;
}; 