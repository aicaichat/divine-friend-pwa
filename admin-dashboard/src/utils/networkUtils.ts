/**
 * 网络工具函数
 */

// 获取本机IP地址（用于NFC测试）
export const getLocalIPAddress = async (): Promise<string> => {
  try {
    // 方法1: 尝试使用WebRTC获取本地IP
    const rtcConnection = new RTCPeerConnection({ iceServers: [] });
    let localIP = '';

    return new Promise((resolve) => {
      rtcConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const ipMatch = candidate.match(/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/);
          if (ipMatch && ipMatch[1] && !ipMatch[1].startsWith('127.')) {
            localIP = ipMatch[1];
            rtcConnection.close();
            resolve(localIP);
          }
        }
      };

      rtcConnection.createDataChannel('');
      rtcConnection.createOffer().then((offer) => {
        rtcConnection.setLocalDescription(offer);
      });

      // 超时处理
      setTimeout(() => {
        rtcConnection.close();
        if (!localIP) {
          resolve(getCommonIPAddress());
        }
      }, 1000);
    });
  } catch (error) {
    console.warn('获取本地IP失败，使用默认IP:', error);
    return getCommonIPAddress();
  }
};

// 获取常见的局域网IP地址
export const getCommonIPAddress = (): string => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // 当前机器的正确IP地址
    const commonIPs = [
      '172.20.10.8',
      '192.168.1.100',
      '192.168.0.100', 
      '10.0.0.100'
    ];
    // 始终使用前端端口3003
    return `${protocol}//${commonIPs[0]}:3003`;
  }
  
  return window.location.origin;
};

// 检测当前设备的网络环境
export const getNetworkInfo = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol;
  
  return {
    hostname,
    port,
    protocol,
    origin: window.location.origin,
    isLocalhost: hostname === 'localhost' || hostname === '127.0.0.1',
    isHTTPS: protocol === 'https:',
    fullURL: window.location.href
  };
};

// 生成测试用的NFC基础URL
export const generateTestBaseURL = (customIP?: string): string => {
  const networkInfo = getNetworkInfo();
  
  if (customIP) {
    const portStr = networkInfo.port ? `:${networkInfo.port}` : '';
    return `${networkInfo.protocol}//${customIP}${portStr}`;
  }
  
  if (networkInfo.isLocalhost) {
    return getCommonIPAddress();
  }
  
  return networkInfo.origin;
};

// 验证URL格式
export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 提取主机名和端口
export const parseHostFromURL = (url: string): { host: string; port?: string } | null => {
  try {
    const urlObj = new URL(url);
    return {
      host: urlObj.hostname,
      port: urlObj.port || undefined
    };
  } catch {
    return null;
  }
}; 