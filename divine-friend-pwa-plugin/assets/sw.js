/* 交个神仙朋友 PWA - 世界级 Service Worker v3.0 */
/* 现代化离线体验与性能优化 */

const CACHE_NAME = 'divine-friend-v3.0.0'
const STATIC_CACHE = 'divine-friend-static-v3.0.0'
const DYNAMIC_CACHE = 'divine-friend-dynamic-v3.0.0'
const API_CACHE = 'divine-friend-api-v3.0.0'

// 核心静态资源 - 立即缓存
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/styles/zen-design.css',
  '/src/styles/zen-animations.css',
  '/src/styles/zen-textures.css',
  '/src/styles/globals.css'
]

// 字体和图标资源
const FONT_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200;300;400;500;600;700;900&family=Ma+Shan+Zheng&family=ZCOOL+KuaiLe&family=Zhi+Mang+Xing&display=swap'
]

// API 端点模式
const API_PATTERNS = [
  /\/api\//,
  /\/divine\//,
  /\/bazi\//,
  /\/nfc\//,
  /\/sutra\//
]

// 🚀 Service Worker 安装
self.addEventListener('install', event => {
  console.log('🌟 [SW] 神仙朋友 Service Worker 安装中...')
  
  event.waitUntil(
    Promise.all([
      // 缓存核心资源
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 [SW] 缓存核心静态资源')
        return cache.addAll(CORE_ASSETS.concat(FONT_ASSETS))
      }),
      
      // 跳过等待，立即激活
      self.skipWaiting()
    ])
  )
})

// 🔄 Service Worker 激活
self.addEventListener('activate', event => {
  console.log('✨ [SW] 神仙朋友 Service Worker 激活中...')
  
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🧹 [SW] 清理旧缓存:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // 声明控制权
      self.clients.claim()
    ])
  )
})

// 🌐 网络请求拦截 - 智能缓存策略
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // 忽略非 HTTP 请求
  if (!request.url.startsWith('http')) return
  
  // 忽略 Chrome 扩展请求
  if (url.protocol === 'chrome-extension:') return
  
  event.respondWith(handleRequest(request))
})

// 🎯 请求处理策略
async function handleRequest(request) {
  const url = new URL(request.url)
  
  try {
    // 📄 HTML 文档 - Network First with Cache Fallback
    if (request.destination === 'document') {
      return await networkFirstStrategy(request, STATIC_CACHE)
    }
    
    // 🎨 静态资源 - Cache First with Network Fallback
    if (request.destination === 'style' || 
        request.destination === 'script' || 
        request.destination === 'font' ||
        url.pathname.includes('/src/')) {
      return await cacheFirstStrategy(request, STATIC_CACHE)
    }
    
    // 🖼️ 图片资源 - Cache First with Network Fallback
    if (request.destination === 'image') {
      return await cacheFirstStrategy(request, DYNAMIC_CACHE)
    }
    
    // 🔌 API 请求 - Network First with Cache Fallback
    if (API_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await networkFirstWithTimeout(request, API_CACHE, 3000)
    }
    
    // 🌐 其他请求 - Network First
    return await networkFirstStrategy(request, DYNAMIC_CACHE)
    
  } catch (error) {
    console.warn('🚫 [SW] 请求处理失败:', request.url, error)
    return await getOfflineFallback(request)
  }
}

// 📡 Network First 策略
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request.clone(), networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      console.log('📋 [SW] 使用缓存:', request.url)
      return cachedResponse
    }
    throw error
  }
}

// 🗃️ Cache First 策略
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    console.log('⚡ [SW] 缓存命中:', request.url)
    
    // 后台更新缓存
    fetch(request).then(response => {
      if (response.ok) {
        caches.open(cacheName).then(cache => {
          cache.put(request.clone(), response.clone())
        })
      }
    }).catch(() => {}) // 静默失败
    
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request.clone(), networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.warn('🌐 [SW] 网络请求失败:', request.url)
    throw error
  }
}

// ⏱️ 带超时的 Network First 策略
async function networkFirstWithTimeout(request, cacheName, timeout = 3000) {
  return Promise.race([
    fetch(request).then(async response => {
      if (response.ok) {
        const cache = await caches.open(cacheName)
        cache.put(request.clone(), response.clone())
      }
      return response
    }),
    
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    })
  ]).catch(async () => {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      console.log('🕐 [SW] 超时使用缓存:', request.url)
      return cachedResponse
    }
    throw new Error('No cache available')
  })
}

// 🔄 离线回退策略
async function getOfflineFallback(request) {
  const url = new URL(request.url)
  
  // HTML 文档回退到首页
  if (request.destination === 'document') {
    const cachedIndex = await caches.match('/')
    if (cachedIndex) return cachedIndex
    
    return new Response(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>交个神仙朋友 - 离线模式</title>
        <style>
          body { 
            font-family: 'Noto Serif SC', serif; 
            text-align: center; 
            padding: 2rem; 
            background: linear-gradient(135deg, #f5f4e8 0%, #faf9f0 100%);
            color: #2c2c2c;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
          .offline-title { font-size: 1.5rem; margin-bottom: 1rem; color: #d4af37; }
          .offline-message { font-size: 1rem; line-height: 1.6; opacity: 0.8; }
        </style>
      </head>
      <body>
        <div class="offline-icon">🧘‍♂️</div>
        <h1 class="offline-title">交个神仙朋友</h1>
        <div class="offline-message">
          网络连接中断，请检查网络设置<br/>
          或稍后重试访问
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
  
  // 图片回退到占位符
  if (request.destination === 'image') {
    return new Response(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f5f4e8"/>
        <text x="100" y="100" font-family="serif" font-size="40" text-anchor="middle" 
              dominant-baseline="middle" fill="#d4af37">🙏</text>
      </svg>
    `, {
      headers: { 'Content-Type': 'image/svg+xml' }
    })
  }
  
  // API 请求回退
  if (API_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return new Response(JSON.stringify({
      error: 'offline',
      message: '当前处于离线模式，请稍后重试',
      timestamp: Date.now()
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 503
    })
  }
  
  throw new Error('No offline fallback available')
}

// 📱 推送通知处理
self.addEventListener('push', event => {
  if (!event.data) return
  
  try {
    const data = event.data.json()
    const options = {
      body: data.body || '来自神仙朋友的智慧提醒',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      image: data.image,
      tag: 'divine-friend',
      renotify: true,
      requireInteraction: data.requireInteraction || false,
      actions: [
        {
          action: 'open',
          title: '打开应用',
          icon: '/action-open.png'
        },
        {
          action: 'dismiss',
          title: '稍后查看',
          icon: '/action-dismiss.png'
        }
      ],
      data: {
        url: data.url || '/',
        timestamp: Date.now()
      }
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || '交个神仙朋友', options)
    )
  } catch (error) {
    console.error('🔔 [SW] 推送通知处理失败:', error)
  }
})

// 📱 通知点击处理
self.addEventListener('notificationclick', event => {
  event.notification.close()
  
  const { action, data } = event
  const url = data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // 查找已有窗口
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => {
            if (action === 'open' && client.navigate) {
              return client.navigate(url)
            }
          })
        }
      }
      
      // 打开新窗口
      if (action === 'open' || !action) {
        return clients.openWindow(url)
      }
    })
  )
})

// 🔄 后台同步
self.addEventListener('sync', event => {
  console.log('🔄 [SW] 后台同步:', event.tag)
  
  if (event.tag === 'divine-sync') {
    event.waitUntil(performBackgroundSync())
  }
})

// 执行后台同步
async function performBackgroundSync() {
  try {
    // 同步用户数据
    await syncUserData()
    
    // 更新缓存内容
    await updateCachedContent()
    
    console.log('✅ [SW] 后台同步完成')
  } catch (error) {
    console.error('❌ [SW] 后台同步失败:', error)
  }
}

// 同步用户数据
async function syncUserData() {
  // 这里可以实现具体的数据同步逻辑
  // 例如：同步用户设置、对话历史等
}

// 更新缓存内容
async function updateCachedContent() {
  const cache = await caches.open(STATIC_CACHE)
  
  // 预缓存重要资源
  const importantResources = [
    '/src/components/features/deity-friend/DeityFriend.tsx',
    '/src/components/features/fortune-analysis/BaziAnalysis.tsx',
    '/src/components/features/nfc-integration/NFCBracelet.tsx',
    '/src/components/features/audio-player/SutraPlayer.tsx'
  ]
  
  await Promise.allSettled(
    importantResources.map(resource => 
      fetch(resource).then(response => {
        if (response.ok) {
          return cache.put(resource, response)
        }
      }).catch(() => {}) // 静默失败
    )
  )
}

// 📊 性能监控
self.addEventListener('message', event => {
  const { type, data } = event.data || {}
  
  switch (type) {
    case 'GET_CACHE_STATS':
      getCacheStats().then(stats => {
        event.ports[0].postMessage(stats)
      })
      break
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true })
      })
      break
      
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    default:
      console.log('📨 [SW] 收到消息:', type, data)
  }
})

// 获取缓存统计
async function getCacheStats() {
  const cacheNames = await caches.keys()
  const stats = {}
  
  for (const name of cacheNames) {
    const cache = await caches.open(name)
    const keys = await cache.keys()
    stats[name] = {
      count: keys.length,
      size: await calculateCacheSize(cache, keys)
    }
  }
  
  return stats
}

// 计算缓存大小
async function calculateCacheSize(cache, keys) {
  let totalSize = 0
  
  for (const key of keys.slice(0, 10)) { // 限制检查数量以避免性能问题
    try {
      const response = await cache.match(key)
      if (response) {
        const blob = await response.blob()
        totalSize += blob.size
      }
    } catch (error) {
      // 忽略单个文件错误
    }
  }
  
  return totalSize
}

// 清理所有缓存
async function clearAllCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(cacheNames.map(name => caches.delete(name)))
  console.log('🧹 [SW] 所有缓存已清理')
}

// 错误处理
self.addEventListener('error', event => {
  console.error('❌ [SW] Service Worker 错误:', event.error)
})

self.addEventListener('unhandledrejection', event => {
  console.error('❌ [SW] 未处理的 Promise 拒绝:', event.reason)
})

console.log('🌟 [SW] 交个神仙朋友 Service Worker v3.0 已加载')
console.log('🚀 [SW] 功能特性：智能缓存、离线支持、推送通知、后台同步') 
 