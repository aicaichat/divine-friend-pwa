import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics } from '../hooks/useAnalytics';

interface SettingsPageEnhancedProps {
  onNavigate: (page: string) => void;
}

interface UserBirthInfo {
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  birthPlace: {
    province: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

interface FormErrors {
  name?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
}

// 🌍 中国省市数据
const chinaProvinces = [
  { code: 'BJ', name: '北京市', cities: ['北京市'] },
  { code: 'SH', name: '上海市', cities: ['上海市'] },
  { code: 'TJ', name: '天津市', cities: ['天津市'] },
  { code: 'CQ', name: '重庆市', cities: ['重庆市'] },
  { code: 'GD', name: '广东省', cities: ['广州市', '深圳市', '珠海市', '汕头市', '佛山市', '韶关市', '湛江市', '肇庆市', '江门市', '茂名市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市'] },
  { code: 'JS', name: '江苏省', cities: ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市'] },
  { code: 'ZJ', name: '浙江省', cities: ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'] },
  { code: 'SD', name: '山东省', cities: ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市'] },
  { code: 'HN', name: '河南省', cities: ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市'] },
  { code: 'HB', name: '河北省', cities: ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'] },
  { code: 'HUB', name: '湖北省', cities: ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市'] },
  { code: 'HUN', name: '湖南省', cities: ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市'] },
  { code: 'SC', name: '四川省', cities: ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市'] },
  { code: 'SX', name: '山西省', cities: ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市'] },
  { code: 'LN', name: '辽宁省', cities: ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市'] },
  { code: 'JL', name: '吉林省', cities: ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市'] },
  { code: 'HL', name: '黑龙江省', cities: ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市'] },
  { code: 'AH', name: '安徽省', cities: ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市'] },
  { code: 'FJ', name: '福建省', cities: ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市'] },
  { code: 'JX', name: '江西省', cities: ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市'] },
  { code: 'GX', name: '广西壮族自治区', cities: ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市'] },
  { code: 'YN', name: '云南省', cities: ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市'] },
  { code: 'GZ', name: '贵州省', cities: ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市'] },
  { code: 'XZ', name: '西藏自治区', cities: ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市', '阿里地区'] },
  { code: 'SN', name: '陕西省', cities: ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市'] },
  { code: 'GS', name: '甘肃省', cities: ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市'] },
  { code: 'QH', name: '青海省', cities: ['西宁市', '海东市'] },
  { code: 'NX', name: '宁夏回族自治区', cities: ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'] },
  { code: 'XJ', name: '新疆维吾尔自治区', cities: ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市'] },
  { code: 'HK', name: '香港特别行政区', cities: ['香港'] },
  { code: 'MO', name: '澳门特别行政区', cities: ['澳门'] },
  { code: 'TW', name: '台湾省', cities: ['台北市', '高雄市', '台中市', '台南市', '新北市', '桃园市'] }
];

const SettingsPageEnhanced: React.FC<SettingsPageEnhancedProps> = ({ onNavigate }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [birthInfo, setBirthInfo] = useState<UserBirthInfo>({
    name: '游客用户', // 临时设置默认姓名
    gender: 'male',
    birthYear: new Date().getFullYear() - 25,
    birthMonth: 1,
    birthDay: 1,
    birthHour: 12,
    birthMinute: 0,
    birthPlace: {
      province: '',
      city: ''
    }
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  // 📊 分析追踪
  const analytics = useAnalytics();

  // 🎨 步骤配置
  const steps = [
    { 
      step: 1, 
      icon: '👤', 
      label: '个人信息',
      title: '告诉我们关于您的基本信息',
      description: '姓名和性别将影响八字的解读方式'
    },
    { 
      step: 2, 
      icon: '📅', 
      label: '出生信息',
      title: '精确的出生时间和地点',
      description: '准确的时间地点对八字计算至关重要'
    },
    { 
      step: 3, 
      icon: '🎯', 
      label: '确认完成',
      title: '确认您的八字信息',
      description: '检查信息无误后即可开始您的修行之旅'
    }
  ];

  // 🕐 时间选项生成
  const yearOptions = Array.from({ length: 100 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year, label: `${year}年` };
  });

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}月`
  }));

  const getDayOptions = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}日`
    }));
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${i.toString().padStart(2, '0')}时`
  }));

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    label: `${i.toString().padStart(2, '0')}分`
  }));

  // 🌍 处理省份变化
  useEffect(() => {
    if (birthInfo.birthPlace.province) {
      const selectedProvince = chinaProvinces.find(p => p.name === birthInfo.birthPlace.province);
      if (selectedProvince) {
        setAvailableCities(selectedProvince.cities);
        // 重置城市选择
        setBirthInfo(prev => ({
          ...prev,
          birthPlace: { ...prev.birthPlace, city: '' }
        }));
      }
    }
  }, [birthInfo.birthPlace.province]);

  // 📍 获取时辰描述
  const getTimeDescription = () => {
    const hour = birthInfo.birthHour;
    if (hour >= 23 || hour < 1) return '子时';
    if (hour >= 1 && hour < 3) return '丑时';
    if (hour >= 3 && hour < 5) return '寅时';
    if (hour >= 5 && hour < 7) return '卯时';
    if (hour >= 7 && hour < 9) return '辰时';
    if (hour >= 9 && hour < 11) return '巳时';
    if (hour >= 11 && hour < 13) return '午时';
    if (hour >= 13 && hour < 15) return '未时';
    if (hour >= 15 && hour < 17) return '申时';
    if (hour >= 17 && hour < 19) return '酉时';
    if (hour >= 19 && hour < 21) return '戌时';
    if (hour >= 21 && hour < 23) return '亥时';
    return '午时';
  };

  // ✅ 验证表单
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!birthInfo.name.trim()) {
        newErrors.name = '请输入您的姓名';
      } else if (birthInfo.name.trim().length < 2) {
        newErrors.name = '姓名至少需要2个字符';
      }
    }

    if (step === 2) {
      if (!birthInfo.birthYear || !birthInfo.birthMonth || !birthInfo.birthDay) {
        newErrors.birthDate = '请选择完整的出生日期';
      }
      
      // 临时放宽出生地验证
      if (!birthInfo.birthPlace.province) {
        newErrors.birthPlace = '请选择出生省份';
      }
      // 暂时不强制要求选择城市
      // else if (!birthInfo.birthPlace.city) {
      //   newErrors.birthPlace = '请选择出生城市';
      // }
    }

    setErrors(newErrors);
    console.log('🔍 验证步骤', step, '错误:', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ➡️ 下一步
  const handleNext = () => {
    console.log('🎯 尝试下一步:', {
      currentStep: activeStep,
      birthInfo: {
        name: birthInfo.name,
        birthPlace: birthInfo.birthPlace,
        birthYear: birthInfo.birthYear,
        birthMonth: birthInfo.birthMonth,
        birthDay: birthInfo.birthDay
      }
    });
    
    // 临时跳过验证，直接进入下一步
    if (activeStep < 3) {
      console.log('🚀 强制进入下一步:', activeStep + 1);
      setActiveStep(prev => prev + 1);
      return;
    }
    
    const isValid = validateStep(activeStep);
    console.log('✅ 验证结果:', isValid, 'errors:', errors);
    
    if (isValid) {
      if (activeStep < 3) {
        console.log('🚀 进入下一步:', activeStep + 1);
        setActiveStep(prev => prev + 1);
        // 临时移除analytics调用
        // analytics.trackUserAction('step_forward', { 
        //   from: activeStep, 
        //   to: activeStep + 1,
        //   page: 'bazi-settings'
        // });
      }
    } else {
      console.log('❌ 验证失败，停留在当前步骤');
    }
  };

  // ⬅️ 上一步
  const handlePrevious = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
      // 临时移除analytics调用
      // analytics.trackUserAction('step_backward', { 
      //   from: activeStep, 
      //   to: activeStep - 1,
      //   page: 'bazi-settings'
      // });
    }
  };

  // 💾 提交表单
  const handleSubmit = async () => {
    console.log('🎯 开始提交表单');
    
    // 临时跳过验证，直接提交
    // if (!validateStep(2)) return;

    setIsSubmitting(true);
    
    try {
      // 构建完整的用户信息
      const userInfo = {
        name: birthInfo.name,
        gender: birthInfo.gender,
        birthYear: birthInfo.birthYear,
        birthMonth: birthInfo.birthMonth,
        birthDay: birthInfo.birthDay,
        birthHour: birthInfo.birthHour,
        birthMinute: birthInfo.birthMinute,
        birthPlace: birthInfo.birthPlace,
        birthdate: `${birthInfo.birthYear}-${birthInfo.birthMonth.toString().padStart(2, '0')}-${birthInfo.birthDay.toString().padStart(2, '0')}`,
        setupComplete: true,
        setupTime: new Date().toISOString()
      };

      console.log('💾 保存用户信息:', userInfo);
      
      // 保存到本地存储
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      console.log('✅ 用户信息已保存到localStorage');
      
      // 临时移除analytics调用
      // analytics.trackUserAction('bazi_setup_complete', {
      //   hasName: !!birthInfo.name,
      //   hasGender: !!birthInfo.gender,
      //   hasBirthDate: !!(birthInfo.birthYear && birthInfo.birthMonth && birthInfo.birthDay),
      //   hasBirthTime: !!(birthInfo.birthHour !== undefined && birthInfo.birthMinute !== undefined),
      //   hasBirthPlace: !!(birthInfo.birthPlace.province && birthInfo.birthPlace.city)
      // });

      console.log('🎉 显示成功动画');
      setShowSuccess(true);
      
      setTimeout(() => {
        console.log('🏠 准备导航到首页');
        console.log('onNavigate函数:', typeof onNavigate, onNavigate);
        
        try {
          onNavigate('today');
          console.log('✅ onNavigate调用成功');
        } catch (error) {
          console.error('❌ onNavigate调用失败:', error);
          // 备用导航方式
          console.log('🔄 尝试备用导航方式');
          window.location.href = window.location.origin + '/?page=today';
        }
      }, 2000);

    } catch (error) {
      console.error('❌ 保存用户信息失败:', error);
      setErrors({ name: '保存失败，请重试' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔄 加载已有数据
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      try {
        const parsed = JSON.parse(savedUserInfo);
        if (parsed.name || parsed.birthYear) {
          setBirthInfo(prev => ({
            ...prev,
            name: parsed.name || '',
            gender: parsed.gender || 'male',
            birthYear: parsed.birthYear || prev.birthYear,
            birthMonth: parsed.birthMonth || prev.birthMonth,
            birthDay: parsed.birthDay || prev.birthDay,
            birthHour: parsed.birthHour || prev.birthHour,
            birthMinute: parsed.birthMinute || prev.birthMinute,
            birthPlace: parsed.birthPlace || prev.birthPlace
          }));
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
      }
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0B1426 0%, #1A1B26 40%, #2D2E3F 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 🌟 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.06) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)
        `,
        zIndex: 0
      }} />

      {/* ✨ 成功动画 */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: '24px',
                padding: '3rem 2rem',
                textAlign: 'center',
                color: 'white',
                boxShadow: '0 25px 50px rgba(16, 185, 129, 0.4)'
              }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ fontSize: '4rem', marginBottom: '1rem' }}
              >
                ✨
              </motion.div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                八字信息设置完成！
              </h2>
              <p style={{ opacity: 0.9, margin: 0 }}>
                正在为您开启专属的修行之旅...
              </p>
              
              {/* 调试：立即导航按钮 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  console.log('🚀 立即导航按钮被点击');
                  try {
                    onNavigate('today');
                  } catch (error) {
                    console.error('导航失败:', error);
                    window.location.href = window.location.origin + '/?page=today';
                  }
                }}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                🏠 立即前往首页
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        padding: '2rem 1rem 8rem 1rem', // 增加底部padding
        position: 'relative',
        zIndex: 1
      }}>
        {/* 🔝 顶部导航 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem'
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('today')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem',
              color: 'white',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            ← 返回
          </motion.button>
          
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'white',
              margin: '0 0 0.25rem 0'
            }}>
              八字信息设置
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0
            }}>
              第 {activeStep} 步，共 {steps.length} 步
            </p>
          </div>
          
          <div style={{ width: '48px' }} />
        </motion.div>

        {/* 📊 进度指示器 */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            height: '6px',
            borderRadius: '3px',
            marginBottom: '2rem',
            overflow: 'hidden'
          }}
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${(activeStep / steps.length) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #D4AF37 0%, #F59E0B 100%)',
              borderRadius: '3px'
            }}
          />
        </motion.div>

        {/* 🎯 步骤导航 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '3rem'
          }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              whileHover={{ scale: 1.05 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: step.step <= activeStep ? 'pointer' : 'default',
                opacity: step.step <= activeStep ? 1 : 0.5
              }}
              onClick={() => step.step <= activeStep && setActiveStep(step.step)}
            >
              <motion.div
                animate={{
                  scale: step.step === activeStep ? 1.1 : 1,
                  background: step.step === activeStep 
                    ? 'linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%)'
                    : step.step < activeStep
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : 'rgba(255, 255, 255, 0.1)'
                }}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  color: 'white',
                  marginBottom: '0.75rem',
                  border: step.step === activeStep ? '3px solid rgba(212, 175, 55, 0.3)' : 'none',
                  boxShadow: step.step === activeStep ? '0 0 20px rgba(212, 175, 55, 0.4)' : 'none'
                }}
              >
                {step.step < activeStep ? '✓' : step.icon}
              </motion.div>
              <span style={{
                fontSize: '0.75rem',
                color: step.step === activeStep ? '#D4AF37' : 'rgba(255, 255, 255, 0.7)',
                fontWeight: step.step === activeStep ? '600' : '400',
                textAlign: 'center'
              }}>
                {step.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* 📋 表单内容 */}
        <motion.div
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}
        >
          <AnimatePresence mode="wait">
            {/* 第一步：个人信息 */}
            {activeStep === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    style={{ fontSize: '3rem', marginBottom: '1rem' }}
                  >
                    👤
                  </motion.div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'white',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {steps[0].title}
                  </h2>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                    margin: 0
                  }}>
                    {steps[0].description}
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '0.75rem'
                  }}>
                    您的姓名 <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <motion.input
                    type="text"
                    placeholder="请输入您的真实姓名"
                    value={birthInfo.name}
                    onChange={(e) => setBirthInfo(prev => ({ ...prev, name: e.target.value }))}
                    whileFocus={{ scale: 1.02 }}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: errors.name ? '2px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      backdropFilter: 'blur(10px)',
                      boxShadow: errors.name ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
                    }}
                  />
                  {errors.name && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        color: '#FCA5A5',
                        fontSize: '0.8rem',
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      ⚠️ {errors.name}
                    </motion.div>
                  )}
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.75rem',
                    marginTop: '0.5rem'
                  }}>
                    💡 真实姓名有助于更准确的八字分析
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '0.75rem'
                  }}>
                    性别
                  </label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {[
                      { value: 'male', label: '男', icon: '👨', color: '#3B82F6' },
                      { value: 'female', label: '女', icon: '👩', color: '#EC4899' }
                    ].map((option) => (
                      <motion.label
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.75rem',
                          padding: '1rem',
                          background: birthInfo.gender === option.value 
                            ? `linear-gradient(135deg, ${option.color}40, ${option.color}20)`
                            : 'rgba(255, 255, 255, 0.05)',
                          border: birthInfo.gender === option.value 
                            ? `2px solid ${option.color}`
                            : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          color: 'white',
                          fontWeight: '600',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={birthInfo.gender === option.value}
                          onChange={(e) => setBirthInfo(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                          style={{ display: 'none' }}
                        />
                        <span style={{ fontSize: '1.5rem' }}>{option.icon}</span>
                        <span>{option.label}</span>
                      </motion.label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 第二步：出生信息 */}
            {activeStep === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                    }}
                    style={{ fontSize: '3rem', marginBottom: '1rem' }}
                  >
                    🌍
                  </motion.div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'white',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {steps[1].title}
                  </h2>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                    margin: 0
                  }}>
                    {steps[1].description}
                  </p>
                </div>

                {/* 出生日期 */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '0.75rem'
                  }}>
                    出生日期 <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    {[
                      { value: birthInfo.birthYear, options: yearOptions, onChange: (value: number) => setBirthInfo(prev => ({ ...prev, birthYear: value })) },
                      { value: birthInfo.birthMonth, options: monthOptions, onChange: (value: number) => setBirthInfo(prev => ({ ...prev, birthMonth: value })) },
                      { value: birthInfo.birthDay, options: getDayOptions(birthInfo.birthYear, birthInfo.birthMonth), onChange: (value: number) => setBirthInfo(prev => ({ ...prev, birthDay: value })) }
                    ].map((select, index) => (
                      <motion.select
                        key={index}
                        value={select.value}
                        onChange={(e) => select.onChange(parseInt(e.target.value))}
                        whileFocus={{ scale: 1.02 }}
                        style={{
                          padding: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '0.9rem',
                          outline: 'none',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        {select.options.map(option => (
                          <option key={option.value} value={option.value} style={{ background: '#1A1B26', color: 'white' }}>
                            {option.label}
                          </option>
                        ))}
                      </motion.select>
                    ))}
                  </div>
                  {errors.birthDate && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        color: '#FCA5A5',
                        fontSize: '0.8rem',
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      ⚠️ {errors.birthDate}
                    </motion.div>
                  )}
                </div>

                {/* 出生时间 */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '0.75rem'
                  }}>
                    出生时间
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <motion.select
                      value={birthInfo.birthHour}
                      onChange={(e) => setBirthInfo(prev => ({ ...prev, birthHour: parseInt(e.target.value) }))}
                      whileFocus={{ scale: 1.02 }}
                      style={{
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '0.9rem',
                        outline: 'none',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {hourOptions.map(option => (
                        <option key={option.value} value={option.value} style={{ background: '#1A1B26', color: 'white' }}>
                          {option.label}
                        </option>
                      ))}
                    </motion.select>
                    
                    <motion.select
                      value={birthInfo.birthMinute}
                      onChange={(e) => setBirthInfo(prev => ({ ...prev, birthMinute: parseInt(e.target.value) }))}
                      whileFocus={{ scale: 1.02 }}
                      style={{
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '0.9rem',
                        outline: 'none',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {minuteOptions.map(option => (
                        <option key={option.value} value={option.value} style={{ background: '#1A1B26', color: 'white' }}>
                          {option.label}
                        </option>
                      ))}
                    </motion.select>
                  </div>
                  
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '12px',
                      padding: '1rem',
                      marginTop: '1rem',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ 
                      color: 'rgba(147, 197, 253, 0.9)', 
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      marginBottom: '0.25rem'
                    }}>
                      🕐 {getTimeDescription()} | {birthInfo.birthHour.toString().padStart(2, '0')}:{birthInfo.birthMinute.toString().padStart(2, '0')}
                    </div>
                    <div style={{ 
                      color: 'rgba(255, 255, 255, 0.6)', 
                      fontSize: '0.75rem' 
                    }}>
                      传统时辰对应现代时间
                    </div>
                  </motion.div>
                </div>

                {/* 出生地点 */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '0.75rem'
                  }}>
                    出生地点 <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <motion.select
                      value={birthInfo.birthPlace.province}
                      onChange={(e) => {
                        console.log('省份选择:', e.target.value);
                        setBirthInfo(prev => ({ 
                          ...prev, 
                          birthPlace: { ...prev.birthPlace, province: e.target.value }
                        }));
                      }}
                      whileFocus={{ scale: 1.02 }}
                      style={{
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: errors.birthPlace ? '2px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '0.9rem',
                        outline: 'none',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <option value="" style={{ background: '#1A1B26', color: 'white' }}>选择省份</option>
                      {chinaProvinces.map(province => (
                        <option key={province.code} value={province.name} style={{ background: '#1A1B26', color: 'white' }}>
                          {province.name}
                        </option>
                      ))}
                    </motion.select>
                    
                    <motion.select
                      value={birthInfo.birthPlace.city}
                      onChange={(e) => {
                        console.log('城市选择:', e.target.value);
                        setBirthInfo(prev => ({ 
                          ...prev, 
                          birthPlace: { ...prev.birthPlace, city: e.target.value }
                        }));
                      }}
                      whileFocus={{ scale: 1.02 }}
                      disabled={!birthInfo.birthPlace.province}
                      style={{
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: errors.birthPlace ? '2px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '0.9rem',
                        outline: 'none',
                        backdropFilter: 'blur(10px)',
                        opacity: !birthInfo.birthPlace.province ? 0.5 : 1
                      }}
                    >
                      <option value="" style={{ background: '#1A1B26', color: 'white' }}>选择城市</option>
                      {availableCities.map(city => (
                        <option key={city} value={city} style={{ background: '#1A1B26', color: 'white' }}>
                          {city}
                        </option>
                      ))}
                    </motion.select>
                  </div>
                  {errors.birthPlace && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        color: '#FCA5A5',
                        fontSize: '0.8rem',
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      ⚠️ {errors.birthPlace}
                    </motion.div>
                  )}
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.75rem',
                    marginTop: '0.5rem'
                  }}>
                    🗺️ 出生地影响时区计算和地域运势分析
                  </div>
                </div>
              </motion.div>
            )}

            {/* 第三步：确认信息 */}
            {activeStep === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ fontSize: '3rem', marginBottom: '1rem' }}
                  >
                    ✨
                  </motion.div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'white',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {steps[2].title}
                  </h2>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                    margin: 0
                  }}>
                    {steps[2].description}
                  </p>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>姓名</div>
                    <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600' }}>{birthInfo.name}</div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>性别</div>
                    <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600' }}>
                      {birthInfo.gender === 'male' ? '👨 男' : '👩 女'}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>出生日期</div>
                    <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600' }}>
                      {birthInfo.birthYear}年{birthInfo.birthMonth}月{birthInfo.birthDay}日
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>出生时间</div>
                    <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600' }}>
                      {getTimeDescription()} {birthInfo.birthHour.toString().padStart(2, '0')}:{birthInfo.birthMinute.toString().padStart(2, '0')}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>出生地点</div>
                    <div style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600' }}>
                      {birthInfo.birthPlace.province} {birthInfo.birthPlace.city}
                    </div>
                  </div>
                </div>

                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(245, 158, 11, 0.1))',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginTop: '1.5rem',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ 
                    color: 'rgba(251, 191, 36, 0.9)', 
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem'
                  }}>
                    🎯 您的专属八字信息即将生成
                  </div>
                  <div style={{ 
                    color: 'rgba(255, 255, 255, 0.6)', 
                    fontSize: '0.75rem' 
                  }}>
                    基于传统八字学说为您提供个性化指导
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 🎮 操作按钮 */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem'
          }}
        >
          {activeStep > 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrevious}
              style={{
                flex: 1,
                padding: '1rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                minHeight: '56px'
              }}
            >
              ← 上一步
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              console.log('🖱️ 按钮被点击!', 'activeStep:', activeStep, 'isSubmitting:', isSubmitting);
              if (activeStep === 3) {
                console.log('🎯 调用handleSubmit');
                handleSubmit();
              } else {
                console.log('➡️ 调用handleNext');
                handleNext();
              }
            }}
            disabled={isSubmitting}
            style={{
              flex: activeStep === 1 ? 1 : 2,
              padding: '1rem 1.5rem',
              background: isSubmitting 
                ? 'rgba(107, 114, 128, 0.5)'
                : 'linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%)',
              border: 'none',
              borderRadius: '16px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 25px rgba(212, 175, 55, 0.3)',
              opacity: isSubmitting ? 0.7 : 1,
              minHeight: '56px'
            }}
          >
            {isSubmitting ? '保存中...' : activeStep === 3 ? '🎯 完成设置' : '下一步 →'}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPageEnhanced; 