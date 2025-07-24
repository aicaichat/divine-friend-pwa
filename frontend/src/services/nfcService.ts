// NFC 和扫码验证服务

export interface NFCReadResult {
  success: boolean
  braceletId?: string
  error?: string
}

export interface QRCodeResult {
  success: boolean
  braceletId?: string
  error?: string
}

export class NFCService {
  private static isSupported(): boolean {
    return 'NDEFReader' in window
  }

  /**
   * 检查NFC可用性
   */
  static async checkNFCAvailability(): Promise<{
    available: boolean
    message: string
  }> {
    if (!this.isSupported()) {
      return {
        available: false,
        message: '您的设备不支持NFC功能'
      }
    }

    try {
      // 检查权限
      const permission = await (navigator as any).permissions.query({ name: 'nfc' })
      
      if (permission.state === 'denied') {
        return {
          available: false,
          message: 'NFC权限被拒绝，请在设置中开启'
        }
      }

      return {
        available: true,
        message: 'NFC功能可用'
      }
    } catch (error) {
      console.error('NFC检查失败:', error)
      return {
        available: false,
        message: 'NFC功能检查失败'
      }
    }
  }

  /**
   * 读取NFC标签
   */
  static async readNFCTag(): Promise<NFCReadResult> {
    try {
      const availability = await this.checkNFCAvailability()
      if (!availability.available) {
        return {
          success: false,
          error: availability.message
        }
      }

      const ndef = new (window as any).NDEFReader()
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          resolve({
            success: false,
            error: '读取超时，请将手串贴近设备重试'
          })
        }, 30000) // 30秒超时

        ndef.addEventListener('error', () => {
          clearTimeout(timeout)
          resolve({
            success: false,
            error: '读取NFC标签时发生错误'
          })
        })

        ndef.addEventListener('reading', ({ message }: any) => {
          clearTimeout(timeout)
          
          try {
            // 解析NDEF消息
            const record = message.records[0]
            if (record && record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8')
              const braceletId = textDecoder.decode(record.data)
              
              resolve({
                success: true,
                braceletId: braceletId.trim()
              })
            } else {
              resolve({
                success: false,
                error: '无法解析手串信息，请确认标签格式正确'
              })
            }
          } catch (error) {
            console.error('解析NFC数据失败:', error)
            resolve({
              success: false,
              error: '解析手串信息失败'
            })
          }
        })

        // 开始扫描
        ndef.scan().then(() => {
          console.log('NFC扫描已启动，请将手串贴近设备...')
        }).catch((error: any) => {
          clearTimeout(timeout)
          console.error('NFC扫描启动失败:', error)
          resolve({
            success: false,
            error: '启动NFC扫描失败'
          })
        })
      })
    } catch (error) {
      console.error('NFC读取失败:', error)
      return {
        success: false,
        error: 'NFC读取功能异常'
      }
    }
  }

  /**
   * 写入NFC标签（管理员功能）
   */
  static async writeNFCTag(braceletId: string): Promise<boolean> {
    try {
      const availability = await this.checkNFCAvailability()
      if (!availability.available) {
        throw new Error(availability.message)
      }

      const ndef = new (window as any).NDEFReader()
      
      await ndef.write({
        records: [
          {
            recordType: 'text',
            data: braceletId
          }
        ]
      })

      return true
    } catch (error) {
      console.error('NFC写入失败:', error)
      return false
    }
  }
}

export class QRCodeService {
  /**
   * 检查摄像头权限
   */
  static async checkCameraPermission(): Promise<{
    available: boolean
    message: string
  }> {
    try {
      // 检查是否支持摄像头
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return {
          available: false,
          message: '您的设备不支持摄像头功能'
        }
      }

      // 检查权限
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
      
      if (permission.state === 'denied') {
        return {
          available: false,
          message: '摄像头权限被拒绝，请在设置中开启'
        }
      }

      return {
        available: true,
        message: '摄像头功能可用'
      }
    } catch (error) {
      console.error('摄像头权限检查失败:', error)
      return {
        available: false,
        message: '摄像头功能检查失败'
      }
    }
  }

  /**
   * 扫描二维码
   */
  static async scanQRCode(): Promise<QRCodeResult> {
    try {
      const permission = await this.checkCameraPermission()
      if (!permission.available) {
        return {
          success: false,
          error: permission.message
        }
      }

      // 由于需要第三方库（如 qr-scanner），这里提供接口定义
      // 实际实现需要安装相应的QR扫描库
      
      return new Promise((resolve) => {
        // 模拟扫描过程
        // 实际使用时需要集成 qr-scanner 或类似库
        setTimeout(() => {
          resolve({
            success: false,
            error: '扫码功能正在开发中，请使用手动输入'
          })
        }, 1000)
      })

    } catch (error) {
      console.error('二维码扫描失败:', error)
      return {
        success: false,
        error: '二维码扫描功能异常'
      }
    }
  }

  /**
   * 生成二维码（管理员功能）
   */
  static generateQRCode(braceletId: string): string {
    // 生成包含手串ID的二维码数据
    const qrData = {
      type: 'divine-friend-bracelet',
      id: braceletId,
      timestamp: Date.now()
    }
    
    return JSON.stringify(qrData)
  }

  /**
   * 解析二维码数据
   */
  static parseQRCode(qrText: string): { braceletId?: string; valid: boolean } {
    try {
      const data = JSON.parse(qrText)
      
      if (data.type === 'divine-friend-bracelet' && data.id) {
        return {
          braceletId: data.id,
          valid: true
        }
      }
      
      return { valid: false }
    } catch (error) {
      // 如果不是JSON格式，尝试直接解析为手串ID
      const braceletIdPattern = /^[A-Za-z0-9\-_]+$/
      if (braceletIdPattern.test(qrText.trim())) {
        return {
          braceletId: qrText.trim(),
          valid: true
        }
      }
      
      return { valid: false }
    }
  }
}

// 统一的验证服务
export class BraceletVerificationService {
  /**
   * 自动检测最佳验证方式
   */
  static async getBestVerificationMethod(): Promise<{
    method: 'nfc' | 'qr' | 'manual'
    message: string
  }> {
    // 优先检查NFC
    const nfcAvailability = await NFCService.checkNFCAvailability()
    if (nfcAvailability.available) {
      return {
        method: 'nfc',
        message: '推荐使用NFC感应验证，更快更准确'
      }
    }

    // 其次检查摄像头
    const cameraAvailability = await QRCodeService.checkCameraPermission()
    if (cameraAvailability.available) {
      return {
        method: 'qr',
        message: '推荐使用扫码验证，简单便捷'
      }
    }

    // 默认手动输入
    return {
      method: 'manual',
      message: '请手动输入手串编号进行验证'
    }
  }

  /**
   * 执行验证
   */
  static async performVerification(method: 'nfc' | 'qr' | 'manual', manualId?: string): Promise<{
    success: boolean
    braceletId?: string
    error?: string
  }> {
    switch (method) {
      case 'nfc':
        return await NFCService.readNFCTag()
      
      case 'qr':
        return await QRCodeService.scanQRCode()
      
      case 'manual':
        if (!manualId || !manualId.trim()) {
          return {
            success: false,
            error: '请输入有效的手串编号'
          }
        }
        return {
          success: true,
          braceletId: manualId.trim()
        }
      
      default:
        return {
          success: false,
          error: '不支持的验证方式'
        }
    }
  }
}