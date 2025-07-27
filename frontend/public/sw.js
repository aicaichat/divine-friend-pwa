// Service Worker for Divine Friend PWA
// 支持推送通知和离线功能

const CACHE_NAME = 'divine-friend-pwa-v1.0.0';
const STATIC_CACHE_NAME = 'divine-friend-static-v1.0.0';

// 缓存资源列表
const CACHE_URLS = [
  '/',
  '/today',
  '/treasure', 
  '/oracle',
  '/growth',
  '/profile',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/favicon.ico'
];

// 安装事件 - 预缓存资源
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker 安装中...');
  
  event.waitUntil(
    Promise.all([
      // 预缓存静态资源
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('📦 预缓存静态资源');
        return cache.addAll(CACHE_URLS);
      }),
      
      // 立即激活新的 Service Worker
      self.skipWaiting()
    ])
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker 激活中...');
  
  event.waitUntil(
    Promise.all([
      // 清理旧版本缓存
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('🗑️ 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
      }),
      
      // 立即控制所有客户端
      self.clients.claim()
    ])
  );
});

// 网络请求拦截 - 缓存优先策略
self.addEventListener('fetch', (event) => {
  // 只处理同源请求
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 如果有缓存，返回缓存
      if (cachedResponse) {
        return cachedResponse;
      }

      // 否则发起网络请求
      return fetch(event.request).then((response) => {
        // 只缓存成功的响应
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // 克隆响应用于缓存
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // 网络失败时返回离线页面
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

// 推送通知事件处理
self.addEventListener('push', (event) => {
  console.log('📬 收到推送通知:', event);

  let notificationData = {
    title: '神仙朋友提醒',
    body: '您有新的修行指导',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/notification-badge-72x72.png',
    tag: 'divine-friend',
    data: {
      url: '/today',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: '查看详情',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: '稍后提醒',
        icon: '/icons/action-dismiss.png'
      }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: false,
    silent: false
  };

  // 解析推送数据
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
  } catch (error) {
      console.warn('推送数据解析失败:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  // 显示通知
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// 通知点击事件处理
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 通知被点击:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });

      // 处理不同的操作
      switch (action) {
        case 'view':
          const urlToOpen = data.url || '/today';
          
          // 查找已打开的窗口
          for (const client of clients) {
            if (client.url.includes(self.location.origin)) {
              // 聚焦现有窗口并导航
              await client.focus();
              return client.navigate(urlToOpen);
            }
          }
          
          // 打开新窗口
          return self.clients.openWindow(urlToOpen);
          
        case 'dismiss':
          // 设置稍后提醒
          setTimeout(() => {
            self.registration.showNotification('神仙朋友提醒', {
              ...event.notification,
              body: '您之前推迟的提醒',
              data: { ...data, isReminder: true }
            });
          }, 30 * 60 * 1000); // 30分钟后提醒
          break;
          
        default:
          // 默认行为：打开应用
          if (clients.length > 0) {
            return clients[0].focus();
          }
          return self.clients.openWindow('/today');
      }
    })()
  );
});

// 通知关闭事件处理
self.addEventListener('notificationclose', (event) => {
  console.log('❌ 通知被关闭:', event.notification.tag);
  
  // 可以在这里记录用户行为分析
  event.waitUntil(
    fetch('/api/analytics/notification-closed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tag: event.notification.tag,
        timestamp: Date.now(),
        data: event.notification.data
      })
    }).catch(() => {
      // 忽略分析请求失败
    })
  );
});

// 后台同步事件处理
self.addEventListener('sync', (event) => {
  console.log('🔄 后台同步:', event.tag);
  
  if (event.tag === 'daily-fortune-sync') {
    event.waitUntil(syncDailyFortune());
  } else if (event.tag === 'practice-reminder-sync') {
    event.waitUntil(syncPracticeReminder());
  }
});

// 同步今日运势
async function syncDailyFortune() {
  try {
    console.log('🔮 同步今日运势...');
    
    const response = await fetch('/api/daily-fortune');
    if (response.ok) {
      const fortuneData = await response.json();
      
      // 显示运势通知
      await self.registration.showNotification('🌟 今日运势已更新', {
        body: fortuneData.summary || '您的今日运势指导已准备就绪',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/notification-badge-72x72.png',
        tag: 'daily-fortune',
        data: {
          url: '/today',
          type: 'daily-fortune',
          fortuneData
        },
        actions: [
          {
            action: 'view',
            title: '查看运势',
            icon: '/icons/action-view.png'
          }
        ]
      });
    }
  } catch (error) {
    console.error('同步今日运势失败:', error);
  }
}

// 同步修行提醒
async function syncPracticeReminder() {
  try {
    console.log('🧘‍♀️ 同步修行提醒...');
  
    // 检查用户修行进度
    const practiceData = await checkPracticeProgress();
    
    if (practiceData.shouldRemind) {
      await self.registration.showNotification('🙏 修行提醒', {
        body: practiceData.message || '今日还未进行修行，愿您保持清净心',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/notification-badge-72x72.png',
        tag: 'practice-reminder',
        data: {
          url: '/growth',
          type: 'practice-reminder'
        },
        actions: [
          {
            action: 'view',
            title: '开始修行',
            icon: '/icons/action-view.png'
          },
          {
            action: 'dismiss',
            title: '稍后提醒',
            icon: '/icons/action-dismiss.png'
          }
        ]
      });
    }
  } catch (error) {
    console.error('同步修行提醒失败:', error);
  }
}

// 检查修行进度
async function checkPracticeProgress() {
  try {
    const response = await fetch('/api/practice-progress');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('检查修行进度失败:', error);
  }
  
  // 默认返回
  return {
    shouldRemind: true,
    message: '每日修行，功德无量'
  };
}

// 消息通信处理
self.addEventListener('message', (event) => {
  console.log('📨 收到消息:', event.data);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({
        version: CACHE_NAME,
        timestamp: Date.now()
      });
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }).then(() => {
      event.ports[0].postMessage({ success: true });
        })
      );
      break;
      
    case 'SCHEDULE_NOTIFICATION':
      event.waitUntil(scheduleNotification(data));
      break;
      
    default:
      console.warn('未知消息类型:', type);
  }
});

// 调度通知
async function scheduleNotification(notificationData) {
  const { delay, ...options } = notificationData;
  
  setTimeout(async () => {
    try {
      await self.registration.showNotification(options.title, options);
      console.log('📅 定时通知已发送:', options.title);
    } catch (error) {
      console.error('定时通知发送失败:', error);
    }
  }, delay || 0);
}

// 错误处理
self.addEventListener('error', (event) => {
  console.error('❌ Service Worker 错误:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ 未处理的 Promise 拒绝:', event.reason);
});

// 定期清理过期数据
setInterval(async () => {
  try {
    // 清理过期的缓存条目
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseDate = new Date(dateHeader);
          const now = new Date();
          const daysSinceResponse = (now - responseDate) / (1000 * 60 * 60 * 24);

          // 删除超过7天的缓存
          if (daysSinceResponse > 7) {
            await cache.delete(request);
            console.log('🗑️ 清理过期缓存:', request.url);
          }
        }
      }
    }
  } catch (error) {
    console.error('清理缓存失败:', error);
  }
}, 24 * 60 * 60 * 1000); // 每24小时运行一次

console.log('🎉 神仙朋友 Service Worker 已加载'); 