import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GuirenPageProfessionalProps {
  onNavigate: (page: string) => void;
}

// 用户八字信息接口
interface UserBaziInfo {
  name: string;
  gender: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  zodiac: string;
  element: string;
  dayPillar: string;
  monthPillar: string;
  yearPillar: string;
  hourPillar: string;
}

// 贵人信息接口
interface GuirenProfile {
  id: string;
  name: string;
  avatar: string;
  age: number;
  gender: string;
  profession: string;
  location: string;
  zodiac: string;
  element: string;
  compatibility: {
    career: number;    // 事业帮扶指数
    wealth: number;    // 财运帮扶指数
    overall: number;   // 综合匹配度
  };
  strengths: string[];  // 贵人优势
  helpType: '事业导师' | '财富顾问' | '合作伙伴' | '投资人' | '人脉资源' | '太极名师' | '易学名师';
  introduction: string; // 个人简介
  achievements: string[]; // 成就标签
  baziAnalysis: string; // 八字匹配分析
  isOnline: boolean;
  lastActive: string;
  verified: boolean; // 认证状态
}

// 设计系统
const designSystem = {
  colors: {
    primary: {
      main: '#9D50BB',
      light: '#B968D1',
      dark: '#7E3A99',
      gradient: 'linear-gradient(135deg, #9D50BB 0%, #6366F1 50%, #3B82F6 100%)',
      glow: 'rgba(157, 80, 187, 0.3)'
    },
    career: {
      main: '#10B981',
      light: '#34D399',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      bg: 'rgba(16, 185, 129, 0.1)'
    },
    wealth: {
      main: '#F59E0B',
      light: '#FBBF24',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      bg: 'rgba(245, 158, 11, 0.1)'
    },
    tradition: {
      main: '#8B5CF6',
      light: '#A78BFA',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      bg: 'rgba(139, 92, 246, 0.1)'
    },
    background: {
      primary: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
      card: 'rgba(255, 255, 255, 0.08)',
      cardHover: 'rgba(255, 255, 255, 0.12)'
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.85)',
      muted: 'rgba(255, 255, 255, 0.65)',
      accent: '#9D50BB'
    }
  },
  shadows: {
    card: '0 8px 32px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(157, 80, 187, 0.3)',
    career: '0 4px 20px rgba(16, 185, 129, 0.3)',
    wealth: '0 4px 20px rgba(245, 158, 11, 0.3)',
    tradition: '0 4px 20px rgba(139, 92, 246, 0.3)'
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px'
  }
};

const GuirenPageProfessional: React.FC<GuirenPageProfessionalProps> = ({ onNavigate }) => {
  const [userBazi, setUserBazi] = useState<UserBaziInfo | null>(null);
  const [selectedTab, setSelectedTab] = useState<'recommended' | 'career' | 'wealth' | 'tradition'>('recommended');
  const [guirenList, setGuirenList] = useState<GuirenProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuiren, setSelectedGuiren] = useState<GuirenProfile | null>(null);

  // 获取用户八字信息
  useEffect(() => {
    const loadUserBazi = () => {
      const savedProfile = localStorage.getItem('userProfile');
      const savedBirthInfo = localStorage.getItem('userBirthInfo');
      
      if (savedProfile && savedBirthInfo) {
        const profile = JSON.parse(savedProfile);
        const birthInfo = JSON.parse(savedBirthInfo);
        
        setUserBazi({
          name: profile.name || '用户',
          gender: profile.gender || '男',
          birthYear: new Date(birthInfo.birthDate).getFullYear(),
          birthMonth: new Date(birthInfo.birthDate).getMonth() + 1,
          birthDay: new Date(birthInfo.birthDate).getDate(),
          birthHour: birthInfo.birthHour || 12,
          zodiac: '金牛座', // 可以根据生日计算
          element: '金',    // 可以根据八字计算
          dayPillar: '庚金',
          monthPillar: '戊土',
          yearPillar: '壬水',
          hourPillar: '丙火'
        });
      } else {
        // 默认用户信息
        setUserBazi({
          name: '求助者',
          gender: '男',
          birthYear: 1990,
          birthMonth: 5,
          birthDay: 15,
          birthHour: 14,
          zodiac: '金牛座',
          element: '金',
          dayPillar: '庚金',
          monthPillar: '戊土',
          yearPillar: '壬水',
          hourPillar: '丙火'
        });
      }
    };

    loadUserBazi();
    generateGuirenRecommendations();
    
    setTimeout(() => setLoading(false), 1500);
  }, []);

  // 生成贵人推荐
  const generateGuirenRecommendations = () => {
    const mockGuiren: GuirenProfile[] = [
      // 事业导师型贵人
      {
        id: 'career_mentor_1',
        name: '张企业家',
        avatar: '👨‍💼',
        age: 45,
        gender: '男',
        profession: '互联网公司CEO',
        location: '北京·朝阳区',
        zodiac: '摩羯座',
        element: '土',
        compatibility: {
          career: 95,
          wealth: 88,
          overall: 92
        },
        strengths: ['战略规划', '团队建设', '商业模式', '融资经验'],
        helpType: '事业导师',
        introduction: '20年互联网行业经验，曾带领3家公司成功上市，擅长0到1的商业模式设计和团队管理。',
        achievements: ['连续创业者', '天使投资人', '行业领袖', '演讲导师'],
        baziAnalysis: '您的庚金日柱与其戊土月柱形成"土生金"的有利格局，在事业上能得到强力扶持。',
        isOnline: true,
        lastActive: '2分钟前',
        verified: true
      },
      {
        id: 'wealth_advisor_1',
        name: '李理财师',
        avatar: '👩‍💼',
        age: 38,
        gender: '女',
        profession: '财富管理顾问',
        location: '上海·陆家嘴',
        zodiac: '处女座',
        element: '水',
        compatibility: {
          career: 82,
          wealth: 96,
          overall: 89
        },
        strengths: ['资产配置', '风险控制', '投资策略', '税务优化'],
        helpType: '财富顾问',
        introduction: '15年金融行业经验，管理资产超过10亿元，专注于高净值人群的财富保值增值。',
        achievements: ['金融分析师', '财富规划师', '投资专家', '理财达人'],
        baziAnalysis: '其壬水年柱与您形成"金水相生"的财富流通格局，有利于财运提升。',
        isOnline: true,
        lastActive: '5分钟前',
        verified: true
      },
      {
        id: 'business_partner_1',
        name: '王合伙人',
        avatar: '🤝',
        age: 35,
        gender: '男',
        profession: '科技公司联合创始人',
        location: '深圳·南山区',
        zodiac: '天秤座',
        element: '木',
        compatibility: {
          career: 91,
          wealth: 85,
          overall: 88
        },
        strengths: ['技术创新', '市场拓展', '产品设计', '用户增长'],
        helpType: '合作伙伴',
        introduction: '技术出身的连续创业者，在AI和区块链领域有深厚积累，寻找志同道合的合作伙伴。',
        achievements: ['技术专家', '产品经理', '创业导师', '投资人'],
        baziAnalysis: '木与金的组合形成"金木交战"中的互补格局，在合作中能实现优势互补。',
        isOnline: false,
        lastActive: '1小时前',
        verified: true
      },
      {
        id: 'investor_1',
        name: '陈投资人',
        avatar: '💎',
        age: 50,
        gender: '男',
        profession: '风险投资合伙人',
        location: '香港·中环',
        zodiac: '狮子座',
        element: '火',
        compatibility: {
          career: 87,
          wealth: 93,
          overall: 90
        },
        strengths: ['项目评估', '资本运作', '行业资源', '财务规划'],
        helpType: '投资人',
        introduction: '20年投资经验，投资过50+项目，其中8个成功IPO，专注早期和成长期项目。',
        achievements: ['知名投资人', '行业导师', '财富自由', '慈善家'],
        baziAnalysis: '丙火与庚金形成"火克金"的锤炼格局，虽有压力但能激发您的潜能。',
        isOnline: true,
        lastActive: '刚刚',
        verified: true
      },
      {
        id: 'network_resource_1',
        name: '赵人脉王',
        avatar: '🌐',
        age: 42,
        gender: '女',
        profession: '商会秘书长',
        location: '广州·天河区',
        zodiac: '双子座',
        element: '土',
        compatibility: {
          career: 89,
          wealth: 84,
          overall: 87
        },
        strengths: ['人脉整合', '资源对接', '商务合作', '活动策划'],
        helpType: '人脉资源',
        introduction: '在商界有广泛的人脉网络，致力于为企业家提供资源对接和商务合作机会。',
        achievements: ['社交达人', '资源整合师', '活动策划专家', '商界名人'],
        baziAnalysis: '土土相助形成"比肩帮身"的格局，在人际关系和资源整合方面能给您强力支持。',
        isOnline: true,
        lastActive: '10分钟前',
        verified: true
      },
      // 太极名师
      {
        id: 'taiji_master_1',
        name: '孙太极师',
        avatar: '🥋',
        age: 58,
        gender: '男',
        profession: '太极拳宗师',
        location: '武当山·紫霄宫',
        zodiac: '双鱼座',
        element: '水',
        compatibility: {
          career: 86,
          wealth: 80,
          overall: 91
        },
        strengths: ['太极内功', '身心调和', '气血运行', '修身养性'],
        helpType: '太极名师',
        introduction: '武当派第十五代传人，修习太极40年，精通内家心法，擅长通过太极调理身心，提升个人气场和运势。',
        achievements: ['武当传人', '太极宗师', '养生专家', '内功大师'],
        baziAnalysis: '您的八字缺水，其水命太极内功可以为您补充先天不足，调和阴阳，助您身心平衡，事业稳固。',
        isOnline: true,
        lastActive: '刚刚',
        verified: true
      },
      {
        id: 'taiji_master_2',
        name: '李太极师',
        avatar: '🧘‍♀️',
        age: 45,
        gender: '女',
        profession: '太极养生导师',
        location: '北京·颐和园',
        zodiac: '天蝎座',
        element: '水',
        compatibility: {
          career: 84,
          wealth: 82,
          overall: 88
        },
        strengths: ['太极养生', '经络调理', '静心冥想', '女性保养'],
        helpType: '太极名师',
        introduction: '陈式太极拳第十九代传人，专注女性太极养生20年，通过太极帮助现代人缓解压力，提升生命能量。',
        achievements: ['太极传承人', '养生导师', '女性导师', '冥想大师'],
        baziAnalysis: '太极柔中带刚，正如您八字中需要的平衡之道，能助您在柔和中积蓄力量，在宁静中获得智慧。',
        isOnline: false,
        lastActive: '30分钟前',
        verified: true
      },
      // 易学名师
      {
        id: 'yixue_master_1',
        name: '张易学师',
        avatar: '📜',
        age: 62,
        gender: '男',
        profession: '易学研究院院长',
        location: '西安·大明宫',
        zodiac: '处女座',
        element: '土',
        compatibility: {
          career: 94,
          wealth: 92,
          overall: 96
        },
        strengths: ['八卦推演', '奇门遁甲', '风水布局', '人生指导'],
        helpType: '易学名师',
        introduction: '易学研究40年，精通梅花易数、奇门遁甲、六爻预测，曾为多位企业家提供战略决策指导，准确率极高。',
        achievements: ['易学泰斗', '国学大师', '预测专家', '风水宗师'],
        baziAnalysis: '您的命局正需要土的厚重与稳定，其易学造诣可为您指点迷津，运用天时地利，化解命理中的不利因素。',
        isOnline: true,
        lastActive: '5分钟前',
        verified: true
      },
      {
        id: 'yixue_master_2',
        name: '王易学师',
        avatar: '🔯',
        age: 55,
        gender: '男',
        profession: '紫微斗数大师',
        location: '成都·青城山',
        zodiac: '射手座',
        element: '火',
        compatibility: {
          career: 89,
          wealth: 91,
          overall: 93
        },
        strengths: ['紫微斗数', '择日选时', '姓名学', '运程规划'],
        helpType: '易学名师',
        introduction: '紫微斗数研究30年，擅长通过星盘分析人生轨迹，为求问者提供精准的人生规划和关键时机把握。',
        achievements: ['紫微专家', '择日大师', '起名专家', '人生导师'],
        baziAnalysis: '火能生土助金，其紫微造诣能为您精准定位人生方向，把握关键时机，让您的努力事半功倍。',
        isOnline: true,
        lastActive: '15分钟前',
        verified: true
      },
      {
        id: 'yixue_master_3',
        name: '赵易学师',
        avatar: '☯️',
        age: 48,
        gender: '女',
        profession: '现代易学应用专家',
        location: '深圳·南山书院',
        zodiac: '金牛座',
        element: '土',
        compatibility: {
          career: 87,
          wealth: 89,
          overall: 90
        },
        strengths: ['商业风水', '办公布局', '投资择时', '现代应用'],
        helpType: '易学名师',
        introduction: '将传统易学与现代商业完美融合，为500+企业提供风水咨询，帮助现代人在商业社会中运用古老智慧。',
        achievements: ['现代易学家', '商业顾问', '风水专家', '投资导师'],
        baziAnalysis: '同为土命，能与您形成强力共振，其现代易学应用能帮您在当今时代更好地运用传统智慧获得成功。',
        isOnline: false,
        lastActive: '1小时前',
        verified: true
      }
    ];

    setGuirenList(mockGuiren);
  };

  // 根据类型筛选贵人
  const getFilteredGuiren = () => {
    switch (selectedTab) {
      case 'career':
        return guirenList.filter(g => 
          g.helpType === '事业导师' || 
          g.helpType === '合作伙伴' || 
          g.helpType === '人脉资源'
        ).sort((a, b) => b.compatibility.career - a.compatibility.career);
      case 'wealth':
        return guirenList.filter(g => 
          g.helpType === '财富顾问' || 
          g.helpType === '投资人'
        ).sort((a, b) => b.compatibility.wealth - a.compatibility.wealth);
      case 'tradition':
        return guirenList.filter(g => 
          g.helpType === '太极名师' || 
          g.helpType === '易学名师'
        ).sort((a, b) => b.compatibility.overall - a.compatibility.overall);
      default:
        return guirenList.sort((a, b) => b.compatibility.overall - a.compatibility.overall);
    }
  };

  // 渲染用户八字概览
  const renderUserBaziOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: designSystem.colors.background.card,
        borderRadius: designSystem.borderRadius.lg,
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid rgba(157, 80, 187, 0.2)',
        backdropFilter: 'blur(12px)'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          background: designSystem.colors.primary.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem'
        }}>
          👤
        </div>
        <div>
          <h3 style={{
            color: designSystem.colors.text.primary,
            margin: 0,
            fontSize: '1.2rem',
            fontWeight: '600'
          }}>
            {userBazi?.name}的贵人求助
          </h3>
          <p style={{
            color: designSystem.colors.text.secondary,
            margin: 0,
            fontSize: '0.9rem'
          }}>
            {userBazi?.zodiac} · {userBazi?.element}命 · {userBazi?.dayPillar}日柱
          </p>
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{
          background: designSystem.colors.career.bg,
          borderRadius: designSystem.borderRadius.sm,
          padding: '1rem',
          border: `1px solid ${designSystem.colors.career.main}40`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '1.2rem' }}>💼</span>
            <span style={{
              color: designSystem.colors.text.primary,
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              事业求助
            </span>
          </div>
          <p style={{
            color: designSystem.colors.text.secondary,
            margin: 0,
            fontSize: '0.8rem'
          }}>
            寻找能在事业发展、团队管理、战略规划方面给予指导的贵人
          </p>
        </div>
        
        <div style={{
          background: designSystem.colors.wealth.bg,
          borderRadius: designSystem.borderRadius.sm,
          padding: '1rem',
          border: `1px solid ${designSystem.colors.wealth.main}40`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '1.2rem' }}>💰</span>
            <span style={{
              color: designSystem.colors.text.primary,
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              财富求助
            </span>
          </div>
          <p style={{
            color: designSystem.colors.text.secondary,
            margin: 0,
            fontSize: '0.8rem'
          }}>
            寻找在投资理财、财富管理、资金筹措方面有经验的贵人
          </p>
        </div>
      </div>
      
      <div style={{
        background: designSystem.colors.tradition.bg,
        borderRadius: designSystem.borderRadius.sm,
        padding: '1rem',
        border: `1px solid ${designSystem.colors.tradition.main}40`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '1.2rem' }}>☯️</span>
          <span style={{
            color: designSystem.colors.text.primary,
            fontWeight: '600',
            fontSize: '0.9rem'
          }}>
            传统文化求助
          </span>
        </div>
        <p style={{
          color: designSystem.colors.text.secondary,
          margin: 0,
          fontSize: '0.8rem'
        }}>
          寻找在太极养生、易学预测、风水布局、传统智慧方面的名师指导
        </p>
      </div>
    </motion.div>
  );

  // 渲染标签页
  const renderTabs = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem'
      }}
    >
      {[
        { id: 'recommended', label: '🌟 推荐贵人', desc: '综合匹配' },
        { id: 'career', label: '💼 事业贵人', desc: '事业帮扶' },
        { id: 'wealth', label: '💰 财富贵人', desc: '财运提升' },
        { id: 'tradition', label: '☯️ 传统文化', desc: '修身养性' }
      ].map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => setSelectedTab(tab.id as any)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            flex: 1,
            padding: '1rem',
            borderRadius: designSystem.borderRadius.md,
            border: selectedTab === tab.id 
              ? `2px solid ${designSystem.colors.primary.main}`
              : '1px solid rgba(255, 255, 255, 0.1)',
            background: selectedTab === tab.id
              ? designSystem.colors.primary.glow
              : designSystem.colors.background.card,
            color: designSystem.colors.text.primary,
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '0.25rem'
          }}>
            {tab.label}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: designSystem.colors.text.muted
          }}>
            {tab.desc}
          </div>
        </motion.button>
      ))}
    </motion.div>
  );

  // 渲染贵人卡片
  const renderGuirenCard = (guiren: GuirenProfile, index: number) => (
    <motion.div
      key={guiren.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => setSelectedGuiren(guiren)}
      style={{
        background: designSystem.colors.background.card,
        borderRadius: designSystem.borderRadius.lg,
        padding: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '1rem'
      }}
    >
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle, ${
          guiren.helpType === '事业导师' || guiren.helpType === '合作伙伴' || guiren.helpType === '人脉资源'
            ? 'rgba(16, 185, 129, 0.1)'
            : guiren.helpType === '财富顾问' || guiren.helpType === '投资人'
            ? 'rgba(245, 158, 11, 0.1)'
            : 'rgba(139, 92, 246, 0.1)'
        } 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />
      
      {/* 认证徽章 */}
      {guiren.verified && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: designSystem.colors.primary.main,
          borderRadius: '50%',
          width: '1.5rem',
          height: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem'
        }}>
          ✓
        </div>
      )}
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* 头部信息 */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            fontSize: '2.5rem',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            width: '4rem',
            height: '4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {guiren.avatar}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.25rem'
            }}>
              <h3 style={{
                color: designSystem.colors.text.primary,
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                {guiren.name}
              </h3>
              {guiren.isOnline && (
                <div style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '50%',
                  background: '#10B981'
                }} />
              )}
            </div>
            
            <p style={{
              color: designSystem.colors.text.secondary,
              margin: 0,
              fontSize: '0.85rem',
              marginBottom: '0.25rem'
            }}>
              {guiren.profession} · {guiren.age}岁
            </p>
            
            <p style={{
              color: designSystem.colors.text.muted,
              margin: 0,
              fontSize: '0.8rem'
            }}>
              📍 {guiren.location} · {guiren.zodiac} · {guiren.element}命
            </p>
          </div>
        </div>
        
        {/* 贵人类型标签 */}
        <div style={{
          display: 'inline-block',
          background: guiren.helpType === '事业导师' || guiren.helpType === '合作伙伴' || guiren.helpType === '人脉资源'
            ? designSystem.colors.career.gradient
            : guiren.helpType === '财富顾问' || guiren.helpType === '投资人'
            ? designSystem.colors.wealth.gradient
            : designSystem.colors.tradition.gradient,
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: designSystem.borderRadius.sm,
          fontSize: '0.8rem',
          fontWeight: '600',
          marginBottom: '1rem'
        }}>
          {guiren.helpType}
        </div>
        
        {/* 匹配度指标 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              color: designSystem.colors.career.main,
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '0.25rem'
            }}>
              {guiren.compatibility.career}%
            </div>
            <div style={{
              color: designSystem.colors.text.muted,
              fontSize: '0.75rem'
            }}>
              事业帮扶
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{
              color: designSystem.colors.wealth.main,
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '0.25rem'
            }}>
              {guiren.compatibility.wealth}%
            </div>
            <div style={{
              color: designSystem.colors.text.muted,
              fontSize: '0.75rem'
            }}>
              财运提升
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{
              color: designSystem.colors.primary.main,
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '0.25rem'
            }}>
              {guiren.compatibility.overall}%
            </div>
            <div style={{
              color: designSystem.colors.text.muted,
              fontSize: '0.75rem'
            }}>
              综合匹配
            </div>
          </div>
        </div>
        
        {/* 简介 */}
        <p style={{
          color: designSystem.colors.text.secondary,
          fontSize: '0.85rem',
          lineHeight: 1.5,
          margin: '0 0 1rem 0'
        }}>
          {guiren.introduction}
        </p>
        
        {/* 优势标签 */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          {guiren.strengths.slice(0, 3).map((strength, i) => (
            <span
              key={i}
              style={{
                background: 'rgba(157, 80, 187, 0.2)',
                color: designSystem.colors.text.primary,
                padding: '0.25rem 0.5rem',
                borderRadius: designSystem.borderRadius.sm,
                fontSize: '0.75rem',
                border: '1px solid rgba(157, 80, 187, 0.3)'
              }}
            >
              {strength}
            </span>
          ))}
        </div>
        
        {/* 八字分析预览 */}
        <div style={{
          background: 'rgba(157, 80, 187, 0.1)',
          borderRadius: designSystem.borderRadius.sm,
          padding: '0.75rem',
          border: '1px solid rgba(157, 80, 187, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '1rem' }}>🔮</span>
            <span style={{
              color: designSystem.colors.text.primary,
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              八字匹配分析
            </span>
          </div>
          <p style={{
            color: designSystem.colors.text.secondary,
            fontSize: '0.8rem',
            margin: 0,
            lineHeight: 1.4
          }}>
            {guiren.baziAnalysis}
          </p>
        </div>
        
        {/* 在线状态 */}
        <div style={{
          marginTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            color: designSystem.colors.text.muted,
            fontSize: '0.75rem'
          }}>
            {guiren.isOnline ? '🟢 在线' : `🔘 ${guiren.lastActive}`}
          </span>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: designSystem.colors.primary.gradient,
              color: 'white',
              border: 'none',
              borderRadius: designSystem.borderRadius.sm,
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            查看详情
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  // 渲染贵人详情模态框
  const renderGuirenDetail = () => {
    if (!selectedGuiren) return null;
    
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedGuiren(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: designSystem.colors.background.card,
              borderRadius: designSystem.borderRadius.lg,
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* 详情页内容 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                fontSize: '3rem',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                width: '5rem',
                height: '5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {selectedGuiren.avatar}
              </div>
              
              <div>
                <h2 style={{
                  color: designSystem.colors.text.primary,
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '0.5rem'
                }}>
                  {selectedGuiren.name}
                </h2>
                <p style={{
                  color: designSystem.colors.text.secondary,
                  margin: 0,
                  fontSize: '1rem'
                }}>
                  {selectedGuiren.profession}
                </p>
              </div>
            </div>
            
            {/* 成就标签 */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '2rem'
            }}>
              {selectedGuiren.achievements.map((achievement, i) => (
                <span
                  key={i}
                  style={{
                    background: designSystem.colors.primary.gradient,
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: designSystem.borderRadius.sm,
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}
                >
                  {achievement}
                </span>
              ))}
            </div>
            
            {/* 详细介绍 */}
            <div style={{
              marginBottom: '2rem'
            }}>
              <h3 style={{
                color: designSystem.colors.text.primary,
                fontSize: '1.1rem',
                marginBottom: '1rem'
              }}>
                💡 专业能力
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem'
              }}>
                {selectedGuiren.strengths.map((strength, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(157, 80, 187, 0.2)',
                      padding: '0.75rem',
                      borderRadius: designSystem.borderRadius.sm,
                      color: designSystem.colors.text.primary,
                      fontSize: '0.85rem',
                      textAlign: 'center',
                      border: '1px solid rgba(157, 80, 187, 0.3)'
                    }}
                  >
                    {strength}
                  </div>
                ))}
              </div>
            </div>
            
            {/* 八字详细分析 */}
            <div style={{
              background: 'rgba(157, 80, 187, 0.1)',
              borderRadius: designSystem.borderRadius.md,
              padding: '1.5rem',
              marginBottom: '2rem',
              border: '1px solid rgba(157, 80, 187, 0.2)'
            }}>
              <h3 style={{
                color: designSystem.colors.text.primary,
                fontSize: '1.1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>🔮</span>
                八字匹配详细分析
              </h3>
              <p style={{
                color: designSystem.colors.text.secondary,
                fontSize: '0.9rem',
                lineHeight: 1.6,
                margin: 0
              }}>
                {selectedGuiren.baziAnalysis}
              </p>
            </div>
            
            {/* 联系按钮 */}
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  flex: 1,
                  background: designSystem.colors.primary.gradient,
                  color: 'white',
                  border: 'none',
                  borderRadius: designSystem.borderRadius.md,
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🤝 发起求助
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedGuiren(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: designSystem.colors.text.primary,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: designSystem.borderRadius.md,
                  padding: '1rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                关闭
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: designSystem.colors.background.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{
            fontSize: '3rem'
          }}
        >
          🔮
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: designSystem.colors.background.primary,
      position: 'relative'
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(157, 80, 187, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
        zIndex: -1
      }} />

      <div style={{
        padding: '2rem 1rem',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}
        >
          <h1 style={{
            color: designSystem.colors.text.primary,
            fontSize: '2rem',
            fontWeight: '700',
            margin: '0 0 0.5rem 0',
            background: designSystem.colors.primary.gradient,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🤝 寻找贵人
          </h1>
          <p style={{
            color: designSystem.colors.text.secondary,
            fontSize: '1rem',
            margin: 0
          }}>
            基于八字匹配，寻找事业和财运的帮扶贵人
          </p>
        </motion.div>

        {/* 用户八字概览 */}
        {renderUserBaziOverview()}

        {/* 标签页 */}
        {renderTabs()}

        {/* 贵人列表 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {getFilteredGuiren().map((guiren, index) => 
            renderGuirenCard(guiren, index)
          )}
        </motion.div>

        {/* 贵人详情模态框 */}
        {renderGuirenDetail()}
      </div>
    </div>
  );
};

export default GuirenPageProfessional; 