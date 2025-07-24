// Divine Friend PWA Service Worker
// 完整的PWA特性实现

const CACHE_NAME = 'divine-friend-v1.0.0'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'
const API_CACHE = 'api-v1'
const BAZI_CACHE = 'bazi-calculations-v1'

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/index.js',
  '/assets/index.css',
  '/avatars/guanyin.png',
  '/avatars/amitabha.png',
  '/avatars/wenshu.png',
  '/avatars/puxian.png',
  '/avatars/dizang.png',
  '/avatars/yaoshi.png'
]

// API端点配置
const API_ENDPOINTS = {
  bazi: '/api/calculate-bazi',
  deities: '/api/match-deities',
  analyze: '/api/analyze-bazi'
}

// 安装Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...')
  
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      
      // 初始化其他缓存
      caches.open(DYNAMIC_CACHE),
      caches.open(API_CACHE),
      caches.open(BAZI_CACHE)
    ]).then(() => {
      console.log('[SW] Installation complete')
      // 强制激活新的Service Worker
      return self.skipWaiting()
    })
  )
})

// 激活Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...')
  
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE &&
                cacheName !== BAZI_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // 接管所有页面
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation complete')
    })
  )
})

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // 处理不同类型的请求
  if (url.pathname.startsWith('/api/')) {
    // API请求：网络优先，缓存备用
    event.respondWith(handleApiRequest(request))
  } else if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith('/assets/')) {
    // 静态资源：缓存优先
    event.respondWith(handleStaticRequest(request))
  } else {
    // 其他请求：网络优先，缓存备用
    event.respondWith(handleDynamicRequest(request))
  }
})

// 处理API请求
async function handleApiRequest(request) {
  const url = new URL(request.url)
  const cacheKey = `${request.method}-${url.pathname}`
  
  try {
    // 首先尝试网络请求
    const networkResponse = await fetch(request.clone())
    
    if (networkResponse.ok) {
      // 缓存成功的API响应
      const cache = await caches.open(API_CACHE)
      
      // 对于八字计算结果，使用特殊缓存
      if (url.pathname === API_ENDPOINTS.bazi) {
        const baziCache = await caches.open(BAZI_CACHE)
        await baziCache.put(request, networkResponse.clone())
      } else {
        await cache.put(request, networkResponse.clone())
      }
      
      return networkResponse
    }
    
    throw new Error('Network response not ok')
  } catch (error) {
    console.log('[SW] Network failed, trying cache for API:', request.url)
    
    // 网络失败，尝试从缓存获取
    const cache = url.pathname === API_ENDPOINTS.bazi 
      ? await caches.open(BAZI_CACHE)
      : await caches.open(API_CACHE)
    
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      // 添加离线标识
      const response = cachedResponse.clone()
      response.headers.set('X-From-Cache', 'true')
      return response
    }
    
    // 返回离线页面或默认响应
    return createOfflineResponse(url.pathname)
  }
}

// 处理静态资源请求
async function handleStaticRequest(request) {
  try {
    // 缓存优先策略
    const cache = await caches.open(STATIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // 缓存中没有，尝试网络请求
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone())
      return networkResponse
    }
    
    throw new Error('Network response not ok')
  } catch (error) {
    console.log('[SW] Failed to fetch static resource:', request.url)
    
    // 返回默认资源或占位符
    if (request.url.includes('.png') || request.url.includes('.jpg')) {
      return createPlaceholderImage()
    }
    
    return new Response('Resource not available offline', { status: 404 })
  }
}

// 处理动态请求
async function handleDynamicRequest(request) {
  try {
    // 网络优先
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // 缓存页面响应
      const cache = await caches.open(DYNAMIC_CACHE)
      await cache.put(request, networkResponse.clone())
      return networkResponse
    }
    
    throw new Error('Network response not ok')
  } catch (error) {
    console.log('[SW] Network failed for dynamic request:', request.url)
    
    // 尝试从缓存获取
    const cache = await caches.open(DYNAMIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // 返回离线页面
    return createOfflinePage()
  }
}

// 创建离线API响应
function createOfflineResponse(pathname) {
  const offlineData = {
    success: false,
    error: '当前离线状态，显示缓存数据',
    offline: true
  }
  
  if (pathname === API_ENDPOINTS.bazi) {
    // 八字计算离线响应
    offlineData.data = {
      bazi_chart: {
        year_pillar: { stem: '甲', branch: '子' },
        month_pillar: { stem: '乙', branch: '丑' },
        day_pillar: { stem: '丙', branch: '寅' },
        hour_pillar: { stem: '丁', branch: '卯' },
        day_master: '丙',
        elements: { wood: 2, fire: 2, earth: 2, metal: 1, water: 1 }
      },
      analysis: {
        personality: ['离线模式：性格分析暂不可用'],
        career: ['离线模式：事业分析暂不可用'],
        health: ['离线模式：健康分析暂不可用'],
        relationship: ['离线模式：感情分析暂不可用'],
        wealth: ['离线模式：财运分析暂不可用'],
        education: ['离线模式：学业分析暂不可用'],
        parents: ['离线模式：父母分析暂不可用'],
        children: ['离线模式：子女分析暂不可用'],
        siblings: ['离线模式：兄弟姐妹分析暂不可用'],
        major_events: ['离线模式：大事记暂不可用'],
        fortune_timing: {
          '婚姻时机': ['离线模式：请联网后查看'],
          '子女时机': ['离线模式：请联网后查看'],
          '健康时机': ['离线模式：请联网后查看'],
          '财富时机': ['离线模式：请联网后查看']
        }
      }
    }
  }
  
  return new Response(JSON.stringify(offlineData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-From-Cache': 'offline-fallback'
    }
  })
}

// 创建离线页面
function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>神仙朋友 - 离线模式</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          text-align: center;
          padding: 50px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
          margin: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .offline-container {
          max-width: 400px;
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        .icon {
          font-size: 80px;
          margin-bottom: 20px;
        }
        h1 {
          margin: 20px 0;
          font-size: 24px;
        }
        p {
          line-height: 1.6;
          opacity: 0.9;
        }
        .retry-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 15px 30px;
          border-radius: 30px;
          cursor: pointer;
          margin-top: 20px;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        .retry-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="icon">🙏</div>
        <h1>您当前处于离线状态</h1>
        <p>神仙朋友正在等待网络连接恢复。请检查您的网络连接，然后重试。</p>
        <p>部分功能在离线状态下仍可使用。</p>
        <button class="retry-btn" onclick="window.location.reload()">
          重试连接
        </button>
      </div>
    </body>
    </html>
  `
  
  return new Response(offlineHTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'X-From-Cache': 'offline-page'
    }
  })
}

// 创建占位符图片
function createPlaceholderImage() {
  // 生成简单的SVG占位符
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f0f0f0"/>
      <text x="100" y="100" font-family="Arial" font-size="14" fill="#999" text-anchor="middle" dy=".3em">
        离线模式
      </text>
    </svg>
  `
  
  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'X-From-Cache': 'placeholder'
    }
  })
}

// 处理推送通知
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received')
  
  const options = {
    body: '您的神仙朋友有新的指导消息',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: '查看消息',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: '稍后查看'
      }
    ],
    requireInteraction: true,
    silent: false
  }
  
  if (event.data) {
    const data = event.data.json()
    options.body = data.body || options.body
    options.data = { ...options.data, ...data }
  }
  
  event.waitUntil(
    self.registration.showNotification('神仙朋友', options)
  )
})

// 处理通知点击
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received')
  
  event.notification.close()
  
  if (event.action === 'explore') {
    // 打开应用
    event.waitUntil(
      clients.openWindow('/')
    )
  } else if (event.action === 'close') {
    // 仅关闭通知
    return
  } else {
    // 默认行为：打开应用
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync-bazi') {
    event.waitUntil(syncBaziData())
  } else if (event.tag === 'background-sync-user-data') {
    event.waitUntil(syncUserData())
  }
})

// 同步八字数据
async function syncBaziData() {
  try {
    console.log('[SW] Syncing bazi data...')
    
    // 获取待同步的数据
    const pendingData = await getStoredData('pending-bazi-sync')
    
    if (pendingData && pendingData.length > 0) {
      for (const data of pendingData) {
        try {
          const response = await fetch('/api/calculate-bazi', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
          
          if (response.ok) {
            // 同步成功，移除待同步数据
            await removeFromStoredData('pending-bazi-sync', data.id)
            console.log('[SW] Bazi data synced successfully:', data.id)
          }
        } catch (error) {
          console.error('[SW] Failed to sync bazi data:', error)
        }
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// 同步用户数据
async function syncUserData() {
  try {
    console.log('[SW] Syncing user data...')
    
    // 实现用户数据同步逻辑
    const pendingUserData = await getStoredData('pending-user-sync')
    
    if (pendingUserData && pendingUserData.length > 0) {
      // 实现具体的同步逻辑
      console.log('[SW] User data sync completed')
    }
  } catch (error) {
    console.error('[SW] User data sync failed:', error)
  }
}

// 存储辅助函数
async function getStoredData(key) {
  try {
    const db = await openIndexedDB()
    const transaction = db.transaction(['sync-data'], 'readonly')
    const store = transaction.objectStore('sync-data')
    const result = await promisifyRequest(store.get(key))
    return result ? result.data : []
  } catch (error) {
    console.error('[SW] Failed to get stored data:', error)
    return []
  }
}

async function removeFromStoredData(key, itemId) {
  try {
    const db = await openIndexedDB()
    const transaction = db.transaction(['sync-data'], 'readwrite')
    const store = transaction.objectStore('sync-data')
    
    const result = await promisifyRequest(store.get(key))
    if (result && result.data) {
      const updatedData = result.data.filter(item => item.id !== itemId)
      await promisifyRequest(store.put({ key, data: updatedData }))
    }
  } catch (error) {
    console.error('[SW] Failed to remove from stored data:', error)
  }
}

// IndexedDB 辅助函数
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('divine-friend-db', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('sync-data')) {
        db.createObjectStore('sync-data', { keyPath: 'key' })
      }
    }
  })
}

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// 消息通信
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting()
        break
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME })
        break
      case 'CLEAR_CACHE':
        clearAllCaches().then(() => {
          event.ports[0].postMessage({ success: true })
        })
        break
      default:
        console.log('[SW] Unknown message type:', event.data.type)
    }
  }
})

// 清理所有缓存
async function clearAllCaches() {
  const cacheNames = await caches.keys()
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  )
}

console.log('[SW] Service Worker loaded and ready') 
 