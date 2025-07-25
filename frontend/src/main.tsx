import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// 样式导入 - 恢复到工作状态
import './styles/globals.css'
import './styles/zen-design.css'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// PWA Service Worker 注册 (仅在生产环境)
if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
} else if ('serviceWorker' in navigator && window.location.hostname === 'localhost') {
  // 开发环境下清除已注册的Service Worker
  console.log('🧹 开发环境：清除Service Worker...');
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('🗑️ 已卸载Service Worker:', registration);
    }
  });
} 