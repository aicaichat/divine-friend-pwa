import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileBraceletPage = ({ onNavigate }) => {
  const [braceletInfo, setBraceletInfo] = useState(null);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [meritProgress, setMeritProgress] = useState(0);
  const [dailyCheckins, setDailyCheckins] = useState([]);

  // 检查NFC支持
  useEffect(() => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    }
    
    // 从本地存储加载手串信息
    const savedBraceletInfo = localStorage.getItem('braceletInfo');
    if (savedBraceletInfo) {
      setBraceletInfo(JSON.parse(savedBraceletInfo));
    }
    
    // 从本地存储加载功德进度
    const savedMerit = localStorage.getItem('meritProgress');
    if (savedMerit) {
      setMeritProgress(parseInt(savedMerit));
    }
    
    // 从本地存储加载签到记录
    const savedCheckins = localStorage.getItem('dailyCheckins');
    if (savedCheckins) {
      setDailyCheckins(JSON.parse(savedCheckins));
    }
    
    // 模拟手串信息（实际应用中从NFC或API获取）
    if (!savedBraceletInfo) {
      const mockBraceletInfo = {
        id: 'BL20241225001',
        name: '观音心咒手串',
        material: '沉香木',
        beadCount: 108,
        blessing: '观音菩萨加持',
        activationDate: '2024-01-15',
        owner: '信众',
        verified: true,
        serialNumber: 'GY-SX-2024-001',
        craftsman: '妙音师父',
        temple: '普陀山观音禅寺'
      };
      setBraceletInfo(mockBraceletInfo);
      localStorage.setItem('braceletInfo', JSON.stringify(mockBraceletInfo));
    }
  }, []);

  // 模拟NFC扫描
  const startNFCScan = async () => {
    if (!nfcSupported) {
      alert('您的设备不支持NFC功能');
      return;
    }

    setScanning(true);
    
    // 模拟扫描过程
    setTimeout(() => {
      setScanning(false);
      setLastScanTime(new Date());
      
      // 更新功德进度
      const newMerit = Math.min(meritProgress + 10, 1000);
      setMeritProgress(newMerit);
      localStorage.setItem('meritProgress', newMerit.toString());
      
      // 添加今日签到
      const today = new Date().toDateString();
      if (!dailyCheckins.includes(today)) {
        const newCheckins = [...dailyCheckins, today];
        setDailyCheckins(newCheckins);
        localStorage.setItem('dailyCheckins', JSON.stringify(newCheckins));
      }
      
      alert('✅ NFC验证成功！功德+10');
    }, 2000);
  };

  // 功德等级计算
  const getMeritLevel = (merit) => {
    if (merit >= 1000) return { level: '功德圆满', icon: '🌟', color: '#ffd700' };
    if (merit >= 800) return { level: '功德深厚', icon: '✨', color: '#ff6b6b' };
    if (merit >= 600) return { level: '功德有成', icon: '🔮', color: '#4ecdc4' };
    if (merit >= 400) return { level: '功德增长', icon: '💎', color: '#45b7d1' };
    if (merit >= 200) return { level: '初有功德', icon: '🌸', color: '#96ceb4' };
    return { level: '功德初开', icon: '🌱', color: '#ffeaa7' };
  };

  const meritInfo = getMeritLevel(meritProgress);

  // 手串状态卡片
  const BraceletStatusCard = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        background: 'linear-gradient(135deg, var(--earth-golden), var(--earth-golden)80)',
        borderRadius: 'var(--radius-sun)',
        padding: 'var(--space-stanza)',
        marginBottom: 'var(--space-stanza)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 装饰背景 */}
      <div style={{
        position: 'absolute',
        top: '-30px',
        right: '-30px',
        width: '120px',
        height: '120px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%'
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-verse)'
        }}>
          <div>
            <h2 style={{
              margin: '0',
              fontSize: 'var(--text-xl)',
              fontWeight: '700',
              marginBottom: 'var(--space-feather)'
            }}>
              📿 {braceletInfo?.name || '我的手串'}
            </h2>
            <p style={{
              margin: '0',
              fontSize: 'var(--text-base)',
              opacity: 0.9
            }}>
              {braceletInfo?.verified ? '✅ 已验证' : '⚠️ 未验证'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-feather)' }}>
              📿
            </div>
          </div>
        </div>

        {braceletInfo && (
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 'var(--radius-moon)',
            padding: 'var(--space-verse)',
            marginBottom: 'var(--space-verse)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-breath)' }}>
              <div>
                <p style={{ margin: '0', fontSize: 'var(--text-small)', opacity: 0.8 }}>材质</p>
                <p style={{ margin: '0', fontSize: 'var(--text-base)', fontWeight: '600' }}>
                  {braceletInfo.material}
                </p>
              </div>
              <div>
                <p style={{ margin: '0', fontSize: 'var(--text-small)', opacity: 0.8 }}>珠数</p>
                <p style={{ margin: '0', fontSize: 'var(--text-base)', fontWeight: '600' }}>
                  {braceletInfo.beadCount}颗
                </p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ margin: '0', fontSize: 'var(--text-small)', opacity: 0.8 }}>加持</p>
                <p style={{ margin: '0', fontSize: 'var(--text-base)', fontWeight: '600' }}>
                  {braceletInfo.blessing}
                </p>
              </div>
            </div>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={startNFCScan}
          disabled={scanning}
          style={{
            width: '100%',
            background: scanning ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 'var(--radius-moon)',
            padding: 'var(--space-verse)',
            color: 'white',
            fontSize: 'var(--text-base)',
            fontWeight: '600',
            cursor: scanning ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-breath)'
          }}
        >
          {scanning ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                📡
              </motion.div>
              扫描中...
            </>
          ) : (
            <>
              📱 NFC验证签到
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );

  // 功德进度卡片
  const MeritProgressCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        background: 'var(--paper-modern)',
        borderRadius: 'var(--radius-sun)',
        padding: 'var(--space-verse)',
        marginBottom: 'var(--space-verse)',
        border: '1px solid var(--earth-golden)20'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-verse)'
      }}>
        <h3 style={{
          margin: '0',
          color: 'var(--ink-thick)',
          fontSize: 'var(--text-base)',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-breath)'
        }}>
          {meritInfo.icon} 功德进度
        </h3>
        <span style={{
          background: meritInfo.color,
          color: 'white',
          padding: 'var(--space-feather) var(--space-breath)',
          borderRadius: 'var(--radius-pebble)',
          fontSize: 'var(--text-small)',
          fontWeight: '600'
        }}>
          {meritInfo.level}
        </span>
      </div>

      <div style={{
        background: 'var(--earth-golden)10',
        borderRadius: 'var(--radius-moon)',
        padding: 'var(--space-verse)',
        marginBottom: 'var(--space-verse)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-breath)'
        }}>
          <span style={{ color: 'var(--ink-thick)', fontSize: 'var(--text-base)', fontWeight: '600' }}>
            {meritProgress} / 1000
          </span>
          <span style={{ color: 'var(--ink-medium)', fontSize: 'var(--text-small)' }}>
            {Math.round((meritProgress / 1000) * 100)}%
          </span>
        </div>
        
        <div style={{
          width: '100%',
          height: '12px',
          background: 'var(--earth-golden)20',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(meritProgress / 1000) * 100}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${meritInfo.color}, ${meritInfo.color}80)`,
              borderRadius: '6px'
            }}
          />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-breath)',
        fontSize: 'var(--text-small)'
      }}>
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-breath)',
          background: 'var(--water-essence)10',
          borderRadius: 'var(--radius-pebble)',
          border: '1px solid var(--water-essence)20'
        }}>
          <div style={{ color: 'var(--water-essence)', fontWeight: '600', fontSize: 'var(--text-base)' }}>
            {dailyCheckins.length}
          </div>
          <div style={{ color: 'var(--ink-medium)' }}>累计签到</div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-breath)',
          background: 'var(--fire-phoenix)10',
          borderRadius: 'var(--radius-pebble)',
          border: '1px solid var(--fire-phoenix)20'
        }}>
          <div style={{ color: 'var(--fire-phoenix)', fontWeight: '600', fontSize: 'var(--text-base)' }}>
            {Math.floor(meritProgress / 100)}
          </div>
          <div style={{ color: 'var(--ink-medium)' }}>功德等级</div>
        </div>
      </div>
    </motion.div>
  );

  // 手串详情卡片
  const BraceletDetailsCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      style={{
        background: 'var(--paper-modern)',
        borderRadius: 'var(--radius-sun)',
        padding: 'var(--space-verse)',
        marginBottom: 'var(--space-verse)',
        border: '1px solid var(--earth-golden)20'
      }}
    >
      <h3 style={{
        margin: '0 0 var(--space-verse) 0',
        color: 'var(--ink-thick)',
        fontSize: 'var(--text-base)',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-breath)'
      }}>
        📋 手串详情
      </h3>

      {braceletInfo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-breath)' }}>
          {[
            { label: '序列号', value: braceletInfo.serialNumber, icon: '🔢' },
            { label: '制作师父', value: braceletInfo.craftsman, icon: '👨‍🏭' },
            { label: '加持寺庙', value: braceletInfo.temple, icon: '🏛️' },
            { label: '开光日期', value: braceletInfo.activationDate, icon: '📅' }
          ].map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              padding: 'var(--space-breath)',
              background: 'var(--gradient-zen-mist)',
              borderRadius: 'var(--radius-pebble)',
              border: '1px solid var(--earth-golden)15'
            }}>
              <span style={{ fontSize: '1.2rem', marginRight: 'var(--space-breath)' }}>
                {item.icon}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  color: 'var(--ink-medium)', 
                  fontSize: 'var(--text-small)',
                  marginBottom: 'var(--space-feather)'
                }}>
                  {item.label}
                </div>
                <div style={{ 
                  color: 'var(--ink-thick)', 
                  fontSize: 'var(--text-base)',
                  fontWeight: '500'
                }}>
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );

  // 最近活动卡片
  const RecentActivityCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      style={{
        background: 'var(--paper-modern)',
        borderRadius: 'var(--radius-sun)',
        padding: 'var(--space-verse)',
        marginBottom: 'var(--space-verse)',
        border: '1px solid var(--earth-golden)20'
      }}
    >
      <h3 style={{
        margin: '0 0 var(--space-verse) 0',
        color: 'var(--ink-thick)',
        fontSize: 'var(--text-base)',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-breath)'
      }}>
        📝 最近活动
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-breath)' }}>
        {lastScanTime && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: 'var(--space-breath)',
            background: 'var(--success-green)10',
            borderRadius: 'var(--radius-pebble)',
            border: '1px solid var(--success-green)20'
          }}>
            <span style={{ fontSize: '1.2rem', marginRight: 'var(--space-breath)' }}>✅</span>
            <div>
              <div style={{ color: 'var(--ink-thick)', fontSize: 'var(--text-small)', fontWeight: '500' }}>
                NFC验证成功
              </div>
              <div style={{ color: 'var(--ink-medium)', fontSize: 'var(--text-small)' }}>
                {lastScanTime.toLocaleString('zh-CN')}
              </div>
            </div>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: 'var(--space-breath)',
          background: 'var(--water-essence)10',
          borderRadius: 'var(--radius-pebble)',
          border: '1px solid var(--water-essence)20'
        }}>
          <span style={{ fontSize: '1.2rem', marginRight: 'var(--space-breath)' }}>🙏</span>
          <div>
            <div style={{ color: 'var(--ink-thick)', fontSize: 'var(--text-small)', fontWeight: '500' }}>
              每日诵经完成
            </div>
            <div style={{ color: 'var(--ink-medium)', fontSize: 'var(--text-small)' }}>
              今日 06:30
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: 'var(--space-breath)',
          background: 'var(--earth-golden)10',
          borderRadius: 'var(--radius-pebble)',
          border: '1px solid var(--earth-golden)20'
        }}>
          <span style={{ fontSize: '1.2rem', marginRight: 'var(--space-breath)' }}>💬</span>
          <div>
            <div style={{ color: 'var(--ink-thick)', fontSize: 'var(--text-small)', fontWeight: '500' }}>
              与观音菩萨对话
            </div>
            <div style={{ color: 'var(--ink-medium)', fontSize: 'var(--text-small)' }}>
              昨日 20:15
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gradient-zen-mist)',
      paddingBottom: '100px'
    }}>
      {/* 顶部导航 */}
      <div style={{
        padding: 'var(--space-verse)',
        background: 'var(--paper-modern)',
        borderBottom: '1px solid var(--earth-golden)20',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('home')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ink-thick)',
              fontSize: 'var(--text-base)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-feather)'
            }}
          >
            ← 返回首页
          </motion.button>
          
          <h1 style={{
            margin: '0',
            color: 'var(--ink-thick)',
            fontSize: 'var(--text-large)',
            fontWeight: '600'
          }}>
            手串状态
          </h1>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('settings')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ink-thick)',
              fontSize: 'var(--text-base)',
              cursor: 'pointer'
            }}
          >
            ⚙️
          </motion.button>
        </div>
      </div>

      <div style={{ padding: 'var(--space-verse)' }}>
        <BraceletStatusCard />
        <MeritProgressCard />
        <BraceletDetailsCard />
        <RecentActivityCard />
        
        {/* 底部操作 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          style={{
            marginTop: 'var(--space-stanza)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-breath)'
          }}
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('deity-chat')}
            style={{
              background: 'var(--gradient-sunrise)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-moon)',
              padding: 'var(--space-verse)',
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🙏 与神仙对话增加功德
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('daily-fortune')}
            style={{
              background: 'transparent',
              color: 'var(--ink-thick)',
              border: '2px solid var(--earth-golden)40',
              borderRadius: 'var(--radius-moon)',
              padding: 'var(--space-verse)',
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🌅 查看今日运势
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default MobileBraceletPage; 