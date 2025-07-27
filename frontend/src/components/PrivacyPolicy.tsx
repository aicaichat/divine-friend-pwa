import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrivacyPolicyProps {
  onAccept?: () => void;
  onDecline?: () => void;
  onClose?: () => void;
  showActions?: boolean;
  embedded?: boolean;
}

interface PolicySection {
  title: string;
  content: string[];
  icon: string;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ 
  onAccept, 
  onDecline, 
  onClose, 
  showActions = false,
  embedded = false 
}) => {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  // 隐私政策内容
  const policySections: PolicySection[] = [
    {
      title: '信息收集',
      icon: '📊',
      content: [
        '我们收集以下类型的信息：',
        '• 账户信息：您提供的姓名、出生日期、性别等基本信息，用于生成个性化的八字运势',
        '• 使用数据：您的修行记录、手串使用情况、经文学习进度等，用于提供个性化体验',
        '• 设备信息：设备类型、操作系统、浏览器信息等，用于优化应用性能',
        '• 位置信息：仅在您明确授权时收集，用于提供基于地理位置的运势服务',
        '• 通知偏好：您的通知设置和偏好，用于提供个性化的提醒服务'
      ]
    },
    {
      title: '信息使用',
      icon: '🎯',
      content: [
        '我们使用收集的信息用于：',
        '• 提供核心服务：生成八字运势、计算每日指引、管理修行记录',
        '• 个性化体验：根据您的喜好和习惯定制内容和功能',
        '• 服务改进：分析使用模式以改进应用功能和用户体验',
        '• 安全保障：保护您的账户安全，防范欺诈和滥用行为',
        '• 客户支持：回应您的询问和提供技术支持',
        '• 法律合规：满足适用的法律法规要求'
      ]
    },
    {
      title: '信息共享',
      icon: '🔒',
      content: [
        '我们承诺保护您的隐私，不会出售、租借或以其他方式商业化您的个人信息。',
        '在以下有限情况下，我们可能会共享您的信息：',
        '• 服务提供商：与帮助我们运营应用的可信第三方服务商（如云存储、数据分析）',
        '• 法律要求：根据法律法规、法院命令或政府要求',
        '• 安全保护：为保护我们或其他用户的权利、财产或安全',
        '• 业务转让：在合并、收购或资产转让的情况下（会提前通知用户）',
        '• 用户同意：在获得您明确同意的其他情况下'
      ]
    },
    {
      title: '数据安全',
      icon: '🛡️',
      content: [
        '我们采用多层次的安全措施保护您的数据：',
        '• 加密传输：所有数据传输均使用HTTPS/TLS加密',
        '• 数据加密：敏感数据在存储时进行加密处理',
        '• 访问控制：严格限制员工对用户数据的访问权限',
        '• 安全审计：定期进行安全评估和漏洞检测',
        '• 备份机制：建立数据备份和灾难恢复机制',
        '• 监控系统：实时监控异常访问和潜在威胁',
        '• 数据最小化：仅收集和保留必要的数据'
      ]
    },
    {
      title: '用户权利',
      icon: '👤',
      content: [
        '您对自己的个人信息享有以下权利：',
        '• 访问权：查看我们持有的关于您的个人信息',
        '• 更正权：修改不准确或不完整的个人信息',
        '• 删除权：要求删除您的个人信息（符合法律要求的情况下）',
        '• 限制处理权：限制我们处理您个人信息的方式',
        '• 数据可携带权：以结构化、机器可读的格式接收您的数据',
        '• 反对权：反对基于合法利益的数据处理',
        '• 撤回同意权：随时撤回您之前给予的同意'
      ]
    },
    {
      title: 'Cookie和跟踪',
      icon: '🍪',
      content: [
        '我们使用Cookie和类似技术来：',
        '• 功能性Cookie：记住您的登录状态和偏好设置',
        '• 分析性Cookie：了解应用使用情况，改进用户体验',
        '• 性能Cookie：监控应用性能，识别和修复问题',
        '• 本地存储：在您的设备上存储应用数据和设置',
        '您可以通过浏览器设置管理Cookie偏好，但这可能影响某些功能的使用。',
        '我们不使用第三方广告跟踪或行为定向技术。'
      ]
    },
    {
      title: '数据保留',
      icon: '📅',
      content: [
        '我们根据以下原则保留您的数据：',
        '• 账户信息：在您的账户有效期内保留',
        '• 修行记录：保留3年，用于长期进度追踪',
        '• 运势数据：保留1年，用于个性化服务优化',
        '• 系统日志：保留90天，用于故障排查和安全监控',
        '• 已删除数据：在删除后30天内完全清除',
        '• 法律要求：根据适用法律可能需要保留更长时间',
        '您可以随时请求删除您的账户和相关数据。'
      ]
    },
    {
      title: '第三方服务',
      icon: '🔗',
      content: [
        '我们的应用可能集成以下第三方服务：',
        '• 云服务提供商：用于数据存储和计算服务',
        '• 分析服务：帮助我们了解应用使用情况',
        '• 推送服务：用于发送通知消息',
        '• 支付服务：处理付费功能的交易（如适用）',
        '• 客服系统：提供用户支持服务',
        '这些第三方服务都有自己的隐私政策，我们建议您仔细阅读。',
        '我们会谨慎选择合作伙伴，确保他们遵守适当的数据保护标准。'
      ]
    },
    {
      title: '未成年人保护',
      icon: '👶',
      content: [
        '我们特别关注未成年人的隐私保护：',
        '• 年龄限制：本应用主要面向18岁以上用户',
        '• 监护人同意：13-18岁用户需要监护人同意才能使用',
        '• 数据最小化：对未成年用户收集最少必要的信息',
        '• 特殊保护：对未成年用户的数据采用更严格的保护措施',
        '• 教育内容：确保内容适合未成年人观看',
        '如果我们发现无意中收集了13岁以下儿童的信息，会立即删除。',
        '家长或监护人可以联系我们查看、修改或删除未成年人的信息。'
      ]
    },
    {
      title: '国际传输',
      icon: '🌍',
      content: [
        '关于数据的国际传输：',
        '• 数据位置：您的数据主要存储在中国境内的服务器',
        '• 跨境传输：某些服务可能涉及数据的跨境传输',
        '• 保护措施：跨境传输时采用标准合同条款等保护措施',
        '• 法律遵循：遵守相关国家和地区的数据保护法律',
        '• 透明度：我们会告知您数据传输的目的地和原因',
        '如果您对数据跨境传输有疑虑，请联系我们讨论替代方案。'
      ]
    },
    {
      title: '政策更新',
      icon: '🔄',
      content: [
        '关于隐私政策的更新：',
        '• 更新通知：政策发生重大变更时会提前30天通知您',
        '• 通知方式：通过应用内通知、邮件或网站公告',
        '• 生效时间：新政策在通知期满后生效',
        '• 持续使用：继续使用应用视为接受新政策',
        '• 版本控制：我们会保留政策的历史版本供查阅',
        '• 反馈机制：欢迎您对政策变更提出意见和建议',
        '最新版本的政策始终可在应用内查看。'
      ]
    },
    {
      title: '联系我们',
      icon: '📞',
      content: [
        '如有隐私相关问题，请通过以下方式联系我们：',
        '• 邮箱：privacy@shenxianpengyou.com',
        '• 电话：400-888-8888（工作日9:00-18:00）',
        '• 地址：中国北京市朝阳区XX路XX号XX大厦XX层',
        '• 在线客服：应用内"联系客服"功能',
        '• 邮寄地址：上述地址（请注明"隐私事务"）',
        '我们会在30天内回复您的隐私相关询问。',
        '对于紧急安全问题，请直接拨打客服电话。'
      ]
    }
  ];

  // 处理滚动事件
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrolled = target.scrollTop > 100;
    setHasScrolled(scrolled);
  };

  // 展开/收起章节
  const toggleSection = (index: number) => {
    setActiveSection(activeSection === index ? null : index);
  };

  // 接受协议
  const handleAccept = () => {
    localStorage.setItem('privacyPolicyAccepted', JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }));
    onAccept?.();
  };

  return (
    <motion.div 
      className={`privacy-policy ${embedded ? 'embedded' : 'standalone'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 头部 */}
      <div className="privacy-header">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <h1 className="privacy-title">
            🔐 隐私安全协议
          </h1>
          <p className="privacy-subtitle">
            我们重视并保护您的隐私权利
          </p>
        </motion.div>

        {onClose && !embedded && (
          <button 
            onClick={onClose}
            className="close-button"
            aria-label="关闭"
          >
            ✕
          </button>
        )}
      </div>

      {/* 概述 */}
      <motion.div
        className="privacy-overview"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="overview-content">
          <h2>📋 协议概述</h2>
          <p>
            本隐私政策描述了神仙朋友（"我们"、"应用"）如何收集、使用、存储和保护您的个人信息。
            使用我们的服务即表示您同意本政策中描述的做法。
          </p>
          <div className="key-points">
            <div className="point-item">
              <span className="point-icon">🔒</span>
              <span>我们采用业界标准的安全措施保护您的数据</span>
            </div>
            <div className="point-item">
              <span className="point-icon">🎯</span>
              <span>我们只收集提供服务所必需的信息</span>
            </div>
            <div className="point-item">
              <span className="point-icon">👤</span>
              <span>您拥有访问、修改和删除数据的权利</span>
            </div>
            <div className="point-item">
              <span className="point-icon">🚫</span>
              <span>我们不会出售或商业化您的个人信息</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 政策内容 */}
      <div 
        className="privacy-content"
        onScroll={handleScroll}
      >
        <div className="content-inner">
          {policySections.map((section, index) => (
            <motion.div
              key={section.title}
              className="policy-section"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
            >
              <div 
                className="section-header"
                onClick={() => toggleSection(index)}
              >
                <div className="section-title">
                  <span className="section-icon">{section.icon}</span>
                  <h3>{section.title}</h3>
                </div>
                <motion.span 
                  className="expand-icon"
                  animate={{ rotate: activeSection === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  ▼
                </motion.span>
              </div>

              <AnimatePresence>
                {activeSection === index && (
                  <motion.div
                    className="section-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="content-text">
                      {section.content.map((paragraph, pIndex) => (
                        <p key={pIndex}>{paragraph}</p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 重要提醒 */}
      <motion.div
        className="privacy-notice"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <div className="notice-content">
          <h3>⚠️ 重要提醒</h3>
          <ul>
            <li>请仔细阅读本隐私政策的所有条款</li>
            <li>如果您不同意任何条款，请停止使用我们的服务</li>
            <li>我们可能会不时更新本政策，请定期查看</li>
            <li>如有疑问，请随时联系我们的客服团队</li>
          </ul>
        </div>
      </motion.div>

      {/* 操作按钮 */}
      {showActions && (
        <motion.div
          className="privacy-actions"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <div className="action-buttons">
            {onDecline && (
              <motion.button
                className="btn btn-ghost btn-lg"
                onClick={onDecline}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                不同意
              </motion.button>
            )}
            
            <motion.button
              className="btn btn-primary btn-lg"
              onClick={handleAccept}
              disabled={!hasScrolled && !embedded}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {hasScrolled || embedded ? '同意并继续' : '请先阅读完整协议'}
            </motion.button>
          </div>
          
          {!hasScrolled && !embedded && (
            <p className="scroll-hint">
              💡 请滚动阅读完整的隐私政策后再进行选择
            </p>
          )}
        </motion.div>
      )}

      {/* 生效信息 */}
      <motion.div
        className="privacy-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.3 }}
      >
        <div className="footer-info">
          <p>本隐私政策生效日期：2024年1月1日</p>
          <p>最后更新日期：2024年1月1日</p>
          <p>版本：v1.0</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PrivacyPolicy; 