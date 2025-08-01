# 📱 PWA环境下的NFC手串兼容性设计方案

## 🎯 PWA + NFC 兼容性挑战

### 当前技术限制
- **iOS Safari**: 完全不支持 Web NFC API
- **Android Chrome**: 需要 Android 6.0+ 和 Chrome 81+
- **其他浏览器**: 支持有限或不支持
- **PWA安装**: 不同平台的PWA权限机制差异很大

## 🔧 渐进式增强策略

### 1. 多层级兼容方案

```typescript
// PWA NFC兼容性检测
interface NFCCompatibility {
  hasWebNFC: boolean          // Web NFC API支持
  hasNativeNFC: boolean       // 设备NFC硬件支持
  canUseCamera: boolean       // 相机权限（QR码扫描）
  platform: 'ios' | 'android' | 'other'
  browserSupport: 'full' | 'partial' | 'none'
  recommendedMethod: 'nfc' | 'qr' | 'manual'
}

const useNFCCompatibility = (): NFCCompatibility => {
  const [compatibility, setCompatibility] = useState<NFCCompatibility>({
    hasWebNFC: false,
    hasNativeNFC: false,
    canUseCamera: false,
    platform: 'other',
    browserSupport: 'none',
    recommendedMethod: 'manual'
  })

  useEffect(() => {
    const detectCompatibility = async () => {
      // 检测平台
      const platform = detectPlatform()
      
      // 检测 Web NFC 支持
      const hasWebNFC = 'NDEFReader' in window
      
      // 检测 NFC 硬件（通过权限API间接检测）
      let hasNativeNFC = false
      try {
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'nfc' as PermissionName })
          hasNativeNFC = permission.state !== 'denied'
        }
      } catch (error) {
        // 如果没有NFC权限API，通过其他方式检测
        hasNativeNFC = platform === 'android'
      }
      
      // 检测相机权限（用于QR码扫描）
      const canUseCamera = await checkCameraPermission()
      
      // 确定浏览器支持级别
      let browserSupport: 'full' | 'partial' | 'none' = 'none'
      if (hasWebNFC && hasNativeNFC) {
        browserSupport = 'full'
      } else if (canUseCamera) {
        browserSupport = 'partial'
      }
      
      // 推荐验证方式
      let recommendedMethod: 'nfc' | 'qr' | 'manual' = 'manual'
      if (browserSupport === 'full') {
        recommendedMethod = 'nfc'
      } else if (browserSupport === 'partial') {
        recommendedMethod = 'qr'
      }
      
      setCompatibility({
        hasWebNFC,
        hasNativeNFC,
        canUseCamera,
        platform,
        browserSupport,
        recommendedMethod
      })
    }
    
    detectCompatibility()
  }, [])

  return compatibility
}

const detectPlatform = (): 'ios' | 'android' | 'other' => {
  const userAgent = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios'
  } else if (/android/.test(userAgent)) {
    return 'android'
  }
  return 'other'
}

const checkCameraPermission = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    stream.getTracks().forEach(track => track.stop())
    return true
  } catch (error) {
    return false
  }
}
```

### 2. 智能验证方式选择

```jsx
const SmartVerificationSelector = () => {
  const compatibility = useNFCCompatibility()
  const [selectedMethod, setSelectedMethod] = useState(compatibility.recommendedMethod)

  const verificationMethods = [
    {
      key: 'nfc',
      name: 'NFC感应',
      icon: '📱',
      description: '将手串靠近手机背面',
      available: compatibility.hasWebNFC,
      recommended: compatibility.recommendedMethod === 'nfc',
      speed: '极快 (0.2秒)',
      reliability: '99%'
    },
    {
      key: 'qr',
      name: '扫码验证',
      icon: '📷',
      description: '扫描手串上的二维码',
      available: compatibility.canUseCamera,
      recommended: compatibility.recommendedMethod === 'qr',
      speed: '很快 (1-2秒)',
      reliability: '95%'
    },
    {
      key: 'manual',
      name: '手动输入',
      icon: '⌨️',
      description: '输入手串激活码',
      available: true,
      recommended: compatibility.recommendedMethod === 'manual',
      speed: '一般 (10-30秒)',
      reliability: '100%'
    }
  ]

  return (
    <div className="verification-selector">
      <div className="compatibility-info">
        <Alert
          message={getCompatibilityMessage(compatibility)}
          type={compatibility.browserSupport === 'full' ? 'success' : 
                compatibility.browserSupport === 'partial' ? 'warning' : 'info'}
          showIcon
          style={{ marginBottom: 16 }}
        />
      </div>

      <div className="method-cards">
        {verificationMethods.map(method => (
          <motion.div
            key={method.key}
            className={`method-card ${!method.available ? 'disabled' : ''} ${selectedMethod === method.key ? 'selected' : ''}`}
            whileHover={method.available ? { scale: 1.02 } : {}}
            onClick={() => method.available && setSelectedMethod(method.key)}
          >
            <div className="method-header">
              <span className="method-icon">{method.icon}</span>
              <h3>{method.name}</h3>
              {method.recommended && (
                <Badge count="推荐" style={{ backgroundColor: '#52c41a' }} />
              )}
            </div>
            
            <p className="method-description">{method.description}</p>
            
            <div className="method-stats">
              <div className="stat">
                <span className="label">速度:</span>
                <span className="value">{method.speed}</span>
              </div>
              <div className="stat">
                <span className="label">可靠性:</span>
                <span className="value">{method.reliability}</span>
              </div>
            </div>
            
            {!method.available && (
              <div className="unavailable-overlay">
                <span>当前设备不支持</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const getCompatibilityMessage = (compatibility: NFCCompatibility): string => {
  if (compatibility.browserSupport === 'full') {
    return '🎉 您的设备完全支持NFC功能，可享受最佳体验！'
  } else if (compatibility.browserSupport === 'partial') {
    return '📷 您的设备支持扫码验证，体验依然流畅！'
  } else {
    return '⌨️ 请使用手动输入方式验证您的手串'
  }
}
```

## 🔄 iOS特殊优化方案

### 1. iOS App Clips 集成
```javascript
// 检测是否可以启动 App Clips
const detectAppClipsSupport = () => {
  // iOS 14+ 支持 App Clips
  const isIOS14Plus = /OS 1[4-9]_/.test(navigator.userAgent)
  return isIOS14Plus && 'serviceWorker' in navigator
}

// 启动 App Clips 进行 NFC 验证
const launchAppClips = async (braceletId: string) => {
  try {
    const appClipsUrl = `https://appclips.apple.com/id?p=com.yourapp.nfc&bracelet=${braceletId}`
    
    // 尝试启动 App Clips
    if (window.navigator.standalone) {
      // 已安装的PWA环境
      window.location.href = appClipsUrl
    } else {
      // 浏览器环境，显示引导
      showAppClipsGuide(appClipsUrl)
    }
  } catch (error) {
    console.error('App Clips启动失败:', error)
    // 降级到其他验证方式
    fallbackToAlternativeMethod()
  }
}
```

### 2. iOS快捷指令集成
```javascript
// 创建 iOS 快捷指令链接
const createShortcutLink = (braceletId: string): string => {
  const shortcutData = {
    name: "手串验证",
    actions: [
      {
        type: "nfc.scan",
        parameters: {
          url: `${window.location.origin}/verify?bracelet=${braceletId}&method=nfc`
        }
      }
    ]
  }
  
  const encodedData = encodeURIComponent(JSON.stringify(shortcutData))
  return `shortcuts://import-shortcut/?url=${encodedData}`
}

const IOSShortcutGuide = ({ braceletId }: { braceletId: string }) => {
  const shortcutUrl = createShortcutLink(braceletId)
  
  return (
    <div className="ios-shortcut-guide">
      <h3>📱 iOS用户专享</h3>
      <p>创建快捷指令，实现一键NFC验证！</p>
      
      <div className="guide-steps">
        <div className="step">
          <span className="step-number">1</span>
          <span>点击下方按钮安装快捷指令</span>
        </div>
        <div className="step">
          <span className="step-number">2</span>
          <span>在控制中心添加NFC快捷指令</span>
        </div>
        <div className="step">
          <span className="step-number">3</span>
          <span>一键启动NFC扫描验证</span>
        </div>
      </div>
      
      <Button 
        type="primary" 
        icon="⚡"
        onClick={() => window.open(shortcutUrl)}
      >
        安装iOS快捷指令
      </Button>
    </div>
  )
}
```

## 📷 增强QR码验证体验

### 1. PWA优化的相机扫描
```jsx
import { BrowserQRCodeReader } from '@zxing/browser'

const EnhancedQRScanner = ({ onScanSuccess, onError }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserQRCodeReader | null>(null)

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        // 请求相机权限
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', // 后置摄像头
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        })
        
        setHasPermission(true)
        
        // 初始化QR码读取器
        readerRef.current = new BrowserQRCodeReader()
        
        // 清理stream
        stream.getTracks().forEach(track => track.stop())
        
      } catch (error) {
        console.error('相机权限获取失败:', error)
        setHasPermission(false)
        onError?.('无法访问相机，请检查权限设置')
      }
    }
    
    initializeScanner()
    
    return () => {
      stopScanning()
    }
  }, [])

  const startScanning = async () => {
    if (!readerRef.current || !hasPermission) return
    
    setIsScanning(true)
    
    try {
      const result = await readerRef.current.decodeOnceFromVideoDevice(
        undefined, // 使用默认相机
        videoRef.current!
      )
      
      if (result) {
        // 解析QR码内容
        const qrData = parseQRData(result.getText())
        if (qrData.valid) {
          onScanSuccess?.(qrData)
          
          // 成功反馈
          if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100])
          }
          playSuccessSound()
        } else {
          onError?.('无效的手串二维码')
        }
      }
    } catch (error) {
      console.error('扫描失败:', error)
      onError?.('扫描失败，请重试')
    } finally {
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset()
    }
    setIsScanning(false)
  }

  const parseQRData = (qrText: string): { valid: boolean; data?: any } => {
    try {
      // 支持多种QR码格式
      if (qrText.startsWith('bracelet:')) {
        // 自定义格式: bracelet:chipId:braceletId
        const parts = qrText.split(':')
        return {
          valid: true,
          data: {
            chipId: parts[1],
            braceletId: parts[2],
            source: 'qr'
          }
        }
      } else if (qrText.startsWith('http')) {
        // URL格式: https://yourapp.com/verify?chip=xxx&bracelet=yyy
        const url = new URL(qrText)
        const chipId = url.searchParams.get('chip')
        const braceletId = url.searchParams.get('bracelet')
        
        if (chipId && braceletId) {
          return {
            valid: true,
            data: { chipId, braceletId, source: 'qr' }
          }
        }
      } else {
        // 纯文本格式（芯片ID）
        return {
          valid: /^CHIP-\d{4}-\d{3,}$/.test(qrText),
          data: { chipId: qrText, source: 'qr' }
        }
      }
      
      return { valid: false }
    } catch (error) {
      return { valid: false }
    }
  }

  return (
    <div className="qr-scanner">
      {hasPermission ? (
        <div className="scanner-container">
          <video
            ref={videoRef}
            style={{
              width: '100%',
              maxWidth: '400px',
              height: '300px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
            playsInline
            muted
          />
          
          {/* 扫描框 */}
          <div className="scan-overlay">
            <div className="scan-frame">
              <div className="corner top-left"></div>
              <div className="corner top-right"></div>
              <div className="corner bottom-left"></div>
              <div className="corner bottom-right"></div>
            </div>
            <p className="scan-hint">将二维码对准扫描框</p>
          </div>
          
          <div className="scanner-controls">
            <Button
              type="primary"
              size="large"
              loading={isScanning}
              onClick={isScanning ? stopScanning : startScanning}
            >
              {isScanning ? '停止扫描' : '开始扫描'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="permission-prompt">
          <h3>需要相机权限</h3>
          <p>请允许访问相机以扫描手串二维码</p>
          <Button onClick={() => window.location.reload()}>
            重新获取权限
          </Button>
        </div>
      )}
    </div>
  )
}
```

## 🔄 智能降级策略

### 1. 逐步降级流程
```typescript
enum VerificationMethod {
  NFC = 'nfc',
  QR = 'qr', 
  MANUAL = 'manual',
  APP_CLIPS = 'app_clips',
  SHORTCUT = 'shortcut'
}

const useSmartVerification = () => {
  const compatibility = useNFCCompatibility()
  const [currentMethod, setCurrentMethod] = useState<VerificationMethod>(
    VerificationMethod.MANUAL
  )
  const [fallbackStack, setFallbackStack] = useState<VerificationMethod[]>([])

  useEffect(() => {
    // 根据兼容性设置验证方法优先级
    const methods: VerificationMethod[] = []
    
    if (compatibility.hasWebNFC) {
      methods.push(VerificationMethod.NFC)
    }
    
    if (compatibility.platform === 'ios') {
      methods.push(VerificationMethod.APP_CLIPS, VerificationMethod.SHORTCUT)
    }
    
    if (compatibility.canUseCamera) {
      methods.push(VerificationMethod.QR)
    }
    
    methods.push(VerificationMethod.MANUAL) // 最后的兜底方案
    
    setFallbackStack(methods)
    setCurrentMethod(methods[0])
  }, [compatibility])

  const attemptVerification = async (data: any): Promise<boolean> => {
    try {
      // 尝试当前方法
      const result = await verifyWithMethod(currentMethod, data)
      if (result.success) {
        return true
      }
      
      // 失败则尝试下一个方法
      const currentIndex = fallbackStack.indexOf(currentMethod)
      if (currentIndex < fallbackStack.length - 1) {
        const nextMethod = fallbackStack[currentIndex + 1]
        setCurrentMethod(nextMethod)
        showFallbackMessage(nextMethod)
        return false // 让用户用新方法重试
      }
      
      throw new Error('所有验证方法都失败了')
    } catch (error) {
      console.error('验证失败:', error)
      return false
    }
  }

  const verifyWithMethod = async (method: VerificationMethod, data: any) => {
    switch (method) {
      case VerificationMethod.NFC:
        return await braceletService.activationCode.verifyNFC(data.chipId)
      case VerificationMethod.QR:
        return await braceletService.activationCode.verifyQR(data)
      case VerificationMethod.MANUAL:
        return await braceletService.activationCode.verify(data.code)
      default:
        throw new Error('不支持的验证方法')
    }
  }

  const showFallbackMessage = (method: VerificationMethod) => {
    const messages = {
      [VerificationMethod.NFC]: '正在启用NFC验证...',
      [VerificationMethod.QR]: '切换到扫码验证模式',
      [VerificationMethod.MANUAL]: '请使用手动输入验证',
      [VerificationMethod.APP_CLIPS]: '启动iOS App Clips...',
      [VerificationMethod.SHORTCUT]: '使用iOS快捷指令验证'
    }
    
    message.info(messages[method])
  }

  return {
    currentMethod,
    fallbackStack,
    attemptVerification,
    compatibility
  }
}
```

## 📊 PWA性能优化

### 1. 离线缓存策略
```javascript
// Service Worker中的NFC数据缓存
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/bracelet/verify')) {
    event.respondWith(
      caches.open('nfc-cache-v1').then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            // 有缓存，先返回缓存
            fetchAndCache(event.request, cache) // 后台更新
            return response
          } else {
            // 无缓存，网络请求
            return fetchAndCache(event.request, cache)
          }
        })
      })
    )
  }
})

const fetchAndCache = async (request, cache) => {
  try {
    const response = await fetch(request)
    if (response.status === 200) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    // 网络失败，返回离线页面
    return new Response(JSON.stringify({
      success: false,
      offline: true,
      message: '网络连接失败，请稍后重试'
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
```

### 2. 预加载和预缓存
```typescript
const usePreloadResources = () => {
  useEffect(() => {
    // 预加载NFC相关资源
    const preloadList = [
      '/sounds/nfc-success.mp3',
      '/sounds/nfc-error.mp3', 
      '/images/nfc-guide.webp',
      '/api/bracelet/metadata' // 预加载手串元数据
    ]
    
    preloadList.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = url
      document.head.appendChild(link)
    })
    
    // 预缓存用户常用数据
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({
          type: 'CACHE_USER_DATA',
          data: { userId: getCurrentUserId() }
        })
      })
    }
  }, [])
}
```

## 🎨 UI适配优化

### 1. 响应式NFC引导界面
```jsx
const ResponsiveNFCGuide = () => {
  const [screenHeight] = useWindowSize()
  const isMobile = screenHeight < 800
  
  return (
    <div className={`nfc-guide ${isMobile ? 'mobile' : 'desktop'}`}>
      <div className="guide-content">
        {isMobile ? (
          // 移动端紧凑布局
          <div className="mobile-layout">
            <div className="icon-area">
              <NFCIcon size={isMobile ? 60 : 80} />
            </div>
            <div className="text-area">
              <h3>靠近手串</h3>
              <p>将手串轻触手机背面NFC区域</p>
            </div>
          </div>
        ) : (
          // 桌面端展开布局
          <div className="desktop-layout">
            <NFCAnimation />
            <div className="instructions">
              <h2>NFC验证指南</h2>
              <ul>
                <li>将手串平放在手机背面</li>
                <li>保持1-2秒直到震动提示</li>
                <li>验证成功后手串信息将显示</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* 设备特定提示 */}
      <DeviceSpecificHints />
    </div>
  )
}

const DeviceSpecificHints = () => {
  const deviceInfo = useDeviceInfo()
  
  const getDeviceHints = () => {
    switch (deviceInfo.model) {
      case 'iPhone':
        return {
          title: 'iPhone用户提示',
          hints: [
            '由于iOS限制，建议使用扫码验证',
            '可安装快捷指令实现NFC功能',
            '或使用手动输入激活码'
          ]
        }
      case 'Samsung':
        return {
          title: 'Samsung设备提示', 
          hints: [
            'NFC感应区域通常在手机背面中上部',
            '确保NFC功能已开启',
            '移除手机壳可提高感应成功率'
          ]
        }
      case 'Xiaomi':
        return {
          title: '小米设备提示',
          hints: [
            '进入设置→更多连接方式→NFC',
            '确保"NFC"和"Android Beam"都已开启',
            'NFC感应区域在摄像头附近'
          ]
        }
      default:
        return {
          title: '通用提示',
          hints: [
            '确保设备支持并开启了NFC功能',
            '移除厚重的手机保护壳',
            '手串需要包含NFC芯片'
          ]
        }
    }
  }

  const hints = getDeviceHints()
  
  return (
    <Card size="small" className="device-hints">
      <h4>{hints.title}</h4>
      <ul>
        {hints.hints.map((hint, index) => (
          <li key={index}>{hint}</li>
        ))}
      </ul>
    </Card>
  )
}
```

## 🔍 兼容性测试矩阵

### 测试覆盖范围
```typescript
const CompatibilityTestMatrix = {
  iOS: {
    Safari: {
      versions: ['14.0+', '15.0+', '16.0+'],
      nfcSupport: false,
      qrSupport: true,
      pwaSupport: true,
      shortcuts: true
    },
    Chrome: {
      versions: ['90+', '100+'],
      nfcSupport: false,
      qrSupport: true, 
      pwaSupport: true,
      shortcuts: false
    }
  },
  Android: {
    Chrome: {
      versions: ['81+', '90+', '100+'],
      nfcSupport: true,
      qrSupport: true,
      pwaSupport: true,
      nativeShare: true
    },
    Samsung: {
      versions: ['14+', '15+'],
      nfcSupport: true,
      qrSupport: true,
      pwaSupport: true,
      nativeShare: true
    },
    Firefox: {
      versions: ['90+', '100+'],
      nfcSupport: false,
      qrSupport: true,
      pwaSupport: true,
      nativeShare: false
    }
  }
}

// 自动化兼容性报告
const generateCompatibilityReport = () => {
  const currentEnv = detectCurrentEnvironment()
  const supportedFeatures = checkFeatureSupport()
  
  return {
    platform: currentEnv.platform,
    browser: currentEnv.browser,
    version: currentEnv.version,
    features: supportedFeatures,
    recommendations: generateRecommendations(supportedFeatures),
    fallbackPlan: createFallbackPlan(supportedFeatures)
  }
}
```

## 🎯 实施建议

### 优先级排序
1. **第一优先级**: 完善手动输入和QR码扫描（兼容性100%）
2. **第二优先级**: Android NFC优化（覆盖70%+用户）
3. **第三优先级**: iOS快捷指令集成（提升iOS体验）
4. **第四优先级**: 高级功能（AR引导、AI助手等）

### 部署策略
```javascript
// 渐进式功能开启
const FeatureFlags = {
  WEB_NFC: process.env.NODE_ENV === 'production' ? 
    checkBrowserCompatibility('nfc') : true,
  QR_SCANNER: true, // 始终开启
  IOS_SHORTCUTS: checkPlatform() === 'ios',
  OFFLINE_MODE: 'serviceWorker' in navigator,
  ANALYTICS: true
}

// 用户体验监控
const trackNFCUsage = (method: string, success: boolean, timing: number) => {
  analytics.track('nfc_verification', {
    method,
    success,
    timing,
    platform: getPlatform(),
    browser: getBrowser(),
    device: getDeviceModel()
  })
}
```

---

**💡 核心设计原则**:
1. **优雅降级**: 从最佳体验逐步降级到基础功能
2. **平台适配**: 针对iOS/Android不同特性优化
3. **性能优先**: PWA离线能力和快速响应
4. **用户引导**: 清晰的操作指引和错误处理

这样的设计确保了在PWA环境下，无论用户使用什么设备，都能有流畅的手串验证体验！ 🚀📱 