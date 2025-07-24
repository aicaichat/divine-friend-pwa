import React, { useState, useEffect } from 'react';
import { BraceletInfo, VerificationResult, BlessingInfo, NFCData } from '../../../types';

const NFCBracelet: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<VerificationResult | null>(null);
  const [isNFCSupported, setIsNFCSupported] = useState(false);
  const [braceletHistory, setBraceletHistory] = useState<BraceletInfo[]>([]);

  useEffect(() => {
    // 检查NFC支持
    if ('NDEFReader' in window) {
      setIsNFCSupported(true);
    }
    
    // 加载历史记录
    loadBraceletHistory();
  }, []);

  const loadBraceletHistory = () => {
    // 从localStorage加载历史记录
    const history = localStorage.getItem('bracelet-history');
    if (history) {
      setBraceletHistory(JSON.parse(history));
    }
  };

  const saveBraceletHistory = (bracelet: BraceletInfo) => {
    const newHistory = [bracelet, ...braceletHistory.slice(0, 9)]; // 保留最近10个
    setBraceletHistory(newHistory);
    localStorage.setItem('bracelet-history', JSON.stringify(newHistory));
  };

  const startNFCScan = async () => {
    if (!isNFCSupported) {
      alert('您的设备不支持NFC功能');
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      // 实际NFC扫描代码
      // const ndef = new NDEFReader();
      // await ndef.scan();
      // ndef.addEventListener("reading", ({ message, serialNumber }) => {
      //   // 处理NFC数据
      // });

      // 模拟NFC扫描过程
      setTimeout(() => {
        const mockResult = simulateNFCScan();
        setScanResult(mockResult);
        setIsScanning(false);
        
        if (mockResult.isValid && mockResult.braceletInfo) {
          saveBraceletHistory(mockResult.braceletInfo);
        }
      }, 3000);

    } catch (error) {
      console.error('NFC扫描失败:', error);
      setIsScanning(false);
      alert('NFC扫描失败，请重试');
    }
  };

  const simulateNFCScan = (): VerificationResult => {
    const isAuthentic = Math.random() > 0.3; // 70%概率为正品
    
    if (isAuthentic) {
      const braceletInfo: BraceletInfo = {
        id: `BR${Date.now()}`,
        name: ['观音护身手串', '金刚菩提手串', '沉香木手串', '翡翠平安手串'][Math.floor(Math.random() * 4)],
        material: ['天然菩提', '沉香木', '和田玉', '翡翠'][Math.floor(Math.random() * 4)],
        blessing: '由普陀山观音寺高僧开光，蕴含慈悲护佑之力',
        isAuthentic: true,
        manufactureDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      };

      return {
        isValid: true,
        message: '验证成功！这是一件正宗的开光手串。',
        braceletInfo,
      };
    } else {
      return {
        isValid: false,
        message: '验证失败！此手串可能不是正品或未经过正规开光。',
      };
    }
  };

  const getBlessingInfo = async (braceletId: string): Promise<BlessingInfo> => {
    // 模拟获取祝福信息
    return {
      id: `BL${Date.now()}`,
      braceletId,
      blessing: '愿佛光普照，消灾免难，平安吉祥，福慧双增。',
      monk: '慧能大师',
      temple: '普陀山观音寺',
      date: new Date(),
    };
  };

  const mockBracelets = [
    {
      id: 'BR001',
      name: '观音护身手串',
      material: '天然菩提',
      blessing: '观音菩萨慈悲护佑',
      isAuthentic: true,
      manufactureDate: new Date('2024-01-15'),
    },
    {
      id: 'BR002', 
      name: '金刚菩提手串',
      material: '金刚菩提',
      blessing: '金刚护法，驱邪避凶',
      isAuthentic: true,
      manufactureDate: new Date('2024-02-20'),
    },
    {
      id: 'BR003',
      name: '沉香木手串',
      material: '天然沉香',
      blessing: '沉香静心，净化心灵',
      isAuthentic: true,
      manufactureDate: new Date('2024-03-10'),
    },
  ];

  return (
    <div className="zen-container">
      <div className="zen-card">
        <div className="zen-icon">📿</div>
        <h1 className="zen-title">NFC智能手串</h1>
        <p className="zen-text zen-text-center">
          扫描您的智能手串，验证真伪并获取专属祝福
        </p>
      </div>

      {/* NFC扫描区域 */}
      <div className="zen-card zen-text-center">
        <div 
          className={`zen-divine-light ${isScanning ? 'zen-glow' : ''}`}
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            margin: '2rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid var(--zen-gold)',
            background: 'rgba(212, 175, 55, 0.1)',
            cursor: isNFCSupported ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
          }}
          onClick={startNFCScan}
        >
          {isScanning ? (
            <div>
              <div className="zen-loader"></div>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>扫描中...</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>📿</div>
              <p style={{ fontSize: '0.9rem' }}>
                {isNFCSupported ? '点击开始扫描' : 'NFC不可用'}
              </p>
            </div>
          )}
        </div>

        {!isNFCSupported && (
          <p className="zen-text-muted">
            您的设备不支持NFC功能，可以尝试以下手串样品
          </p>
        )}
      </div>

      {/* 扫描结果 */}
      {scanResult && (
        <div className="zen-card">
          <h3 className="zen-subtitle">
            {scanResult.isValid ? '✅ 验证成功' : '❌ 验证失败'}
          </h3>
          
          <div className={`zen-card ${scanResult.isValid ? 'zen-glow' : ''}`}>
            <p className="zen-text zen-text-center">{scanResult.message}</p>
            
            {scanResult.braceletInfo && (
              <div style={{ marginTop: '1.5rem' }}>
                <div className="zen-grid zen-grid-2">
                  <div>
                    <strong>手串名称:</strong> {scanResult.braceletInfo.name}
                  </div>
                  <div>
                    <strong>材质:</strong> {scanResult.braceletInfo.material}
                  </div>
                  <div>
                    <strong>制作日期:</strong> {scanResult.braceletInfo.manufactureDate.toLocaleDateString()}
                  </div>
                  <div>
                    <strong>认证状态:</strong> 
                    <span style={{ color: 'var(--zen-gold)', fontWeight: 'bold' }}>
                      {scanResult.braceletInfo.isAuthentic ? ' 正品认证' : ' 未认证'}
                    </span>
                  </div>
                </div>
                
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '0.5rem' }}>
                  <strong>开光祝福:</strong>
                  <p className="zen-text" style={{ margin: '0.5rem 0 0 0' }}>
                    {scanResult.braceletInfo.blessing}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 手串样品展示 */}
      <div className="zen-card">
        <h3 className="zen-subtitle">精品手串展示</h3>
        <div className="zen-grid zen-grid-2">
          {mockBracelets.map((bracelet) => (
            <div 
              key={bracelet.id}
              className="zen-card"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                const mockResult: VerificationResult = {
                  isValid: true,
                  message: '这是展示样品，实际使用请扫描真实手串',
                  braceletInfo: bracelet,
                };
                setScanResult(mockResult);
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📿</div>
                <h4>{bracelet.name}</h4>
                <p className="zen-text-muted">{bracelet.material}</p>
              </div>
              
              <div style={{ fontSize: '0.85rem' }}>
                <div><strong>祝福:</strong> {bracelet.blessing}</div>
                <div><strong>日期:</strong> {bracelet.manufactureDate.toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 扫描历史 */}
      {braceletHistory.length > 0 && (
        <div className="zen-card">
          <h3 className="zen-subtitle">扫描历史</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {braceletHistory.map((bracelet, index) => (
              <div 
                key={`${bracelet.id}-${index}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  background: 'rgba(212, 175, 55, 0.05)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>{bracelet.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--zen-wisdom)' }}>
                    {bracelet.material} • {bracelet.manufactureDate.toLocaleDateString()}
                  </div>
                </div>
                <div style={{ color: bracelet.isAuthentic ? 'var(--zen-gold)' : '#cd5c5c' }}>
                  {bracelet.isAuthentic ? '✅' : '❌'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 功能说明 */}
      <div className="zen-card">
        <h3 className="zen-subtitle">功能说明</h3>
        <div className="zen-grid zen-grid-2">
          <div>
            <h4>🔍 真伪验证</h4>
            <p className="zen-text">通过NFC芯片验证手串的真实性和开光认证</p>
          </div>
          <div>
            <h4>🙏 祝福查询</h4>
            <p className="zen-text">查看手串的开光信息和专属祝福</p>
          </div>
          <div>
            <h4>📊 历史记录</h4>
            <p className="zen-text">保存扫描历史，方便后续查看</p>
          </div>
          <div>
            <h4>🛡️ 防伪保护</h4>
            <p className="zen-text">采用加密技术，确保认证信息安全</p>
          </div>
        </div>
        
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '0.5rem' }}>
          <p className="zen-text zen-text-muted zen-text-center">
            💡 提示：请将手机靠近手串的NFC标签进行扫描。如果您的设备不支持NFC，可以尝试上方的展示样品。
          </p>
        </div>
      </div>
    </div>
  );
};

export default NFCBracelet; 
 
 
 
 