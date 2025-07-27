import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// 注册Service Worker (PWA支持)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('🎉 Service Worker 注册成功:', registration.scope);
      
      // 检查是否有等待的Service Worker
      if (registration.waiting) {
        console.log('🔄 发现新版本的Service Worker');
        // 可以提示用户刷新页面
        showUpdateAvailable();
      }
      
      // 监听Service Worker更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🆕 新版本的Service Worker已安装');
              showUpdateAvailable();
            }
          });
        }
      });
      
    } catch (error) {
      console.error('❌ Service Worker 注册失败:', error);
    }
  });
  
  // 监听Service Worker消息
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
      showUpdateAvailable();
    }
  });
}

// 显示更新可用通知
function showUpdateAvailable() {
  // 简单的更新通知，实际应用中可以使用更美观的组件
  const updateBanner = document.createElement('div');
  updateBanner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 12px 16px;
    text-align: center;
    z-index: 1000;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  
  updateBanner.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; max-width: 400px; margin: 0 auto;">
      <span>🚀 新版本可用，点击更新</span>
      <button onclick="window.location.reload()" style="
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      ">更新</button>
    </div>
  `;
  
  document.body.appendChild(updateBanner);
  
  // 5秒后自动消失
  setTimeout(() => {
    if (updateBanner.parentNode) {
      updateBanner.parentNode.removeChild(updateBanner);
    }
  }, 5000);
}

// PWA安装提示
let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('💾 PWA安装提示可用');
  e.preventDefault();
  deferredPrompt = e;
  
  // 显示自定义安装按钮
  showInstallPrompt();
});

// 显示安装提示
function showInstallPrompt() {
  // 检查是否已经在PWA模式下运行
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return;
  }
  
  const installBanner = document.createElement('div');
  installBanner.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background: linear-gradient(135deg, #f093fb, #f5576c);
    color: white;
    padding: 16px;
    border-radius: 12px;
    z-index: 1000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    max-width: 400px;
    margin: 0 auto;
  `;
  
  installBanner.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
      <div>
        <div style="font-weight: 600; margin-bottom: 4px;">🙏 安装神仙朋友</div>
        <div style="font-size: 13px; opacity: 0.9;">添加到主屏幕，获得更好的体验</div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button onclick="installPWA()" style="
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        ">安装</button>
        <button onclick="dismissInstallPrompt()" style="
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        ">稍后</button>
      </div>
    </div>
  `;
  
  installBanner.id = 'pwa-install-banner';
  document.body.appendChild(installBanner);
}

// 安装PWA
const installPWA = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ 用户同意安装PWA');
    } else {
      console.log('❌ 用户拒绝安装PWA');
    }
    
    deferredPrompt = null;
    dismissInstallPrompt();
  }
};

// 关闭安装提示
const dismissInstallPrompt = () => {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.remove();
  }
};

// 将函数添加到window对象
(window as any).installPWA = installPWA;
(window as any).dismissInstallPrompt = dismissInstallPrompt;

// 监听PWA安装成功
window.addEventListener('appinstalled', () => {
  console.log('🎉 PWA安装成功');
  dismissInstallPrompt();
  
  // 显示欢迎消息
  setTimeout(() => {
    alert('🙏 欢迎使用神仙朋友！现在您可以直接从主屏幕启动应用了。');
  }, 500);
});

// 检测网络状态
window.addEventListener('online', () => {
  console.log('🌐 网络已连接');
  const offlineBanner = document.getElementById('offline-banner');
  if (offlineBanner) {
    offlineBanner.remove();
  }
});

window.addEventListener('offline', () => {
  console.log('📱 当前离线');
  
  const offlineBanner = document.createElement('div');
  offlineBanner.id = 'offline-banner';
  offlineBanner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #f97316;
    color: white;
    padding: 8px 16px;
    text-align: center;
    z-index: 1000;
    font-size: 14px;
    font-weight: 500;
  `;
  
  offlineBanner.textContent = '📱 当前离线模式，部分功能可能受限';
  document.body.appendChild(offlineBanner);
});

// 启动React应用
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 