/**
 * 本命佛卡片组件
 * 用于显示本命佛的详细信息和匹配结果
 */

import React, { useState } from 'react'

interface BenmingBuddha {
  id: string
  name: string
  sanskrit_name: string
  title: string
  zodiac: string[]
  element: string
  personality: string[]
  specialties: string[]
  blessings: string[]
  protection_areas: string[]
  avatar_emoji: string
  color: string
  mantra: string
  full_mantra: string
  description: string
  historical_background: string
  temple_location: string
  festival_date: string
  sacred_items: string[]
  meditation_guidance: string[]
}

interface BuddhaMatch {
  buddha: BenmingBuddha
  compatibility_score: number
  match_reasons: string[]
  personalized_blessings: string[]
  guidance_suggestions: string[]
  is_birth_year_buddha: boolean
}

interface BenmingBuddhaCardProps {
  buddhaMatch: BuddhaMatch
  className?: string
}

const BenmingBuddhaCard: React.FC<BenmingBuddhaCardProps> = ({ 
  buddhaMatch, 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'blessings' | 'meditation' | 'culture'>('info')
  const { buddha, compatibility_score, match_reasons, personalized_blessings, guidance_suggestions, is_birth_year_buddha } = buddhaMatch

  // 五行对应的渐变色
  const getElementGradient = (element: string) => {
    const gradients = {
      wood: 'from-green-400 to-green-600',
      fire: 'from-red-400 to-red-600', 
      earth: 'from-yellow-400 to-orange-500',
      metal: 'from-gray-400 to-gray-600',
      water: 'from-blue-400 to-blue-600'
    }
    return gradients[element as keyof typeof gradients] || 'from-purple-400 to-purple-600'
  }

  // 获取兼容度等级
  const getCompatibilityLevel = (score: number) => {
    if (score >= 95) return { level: '天作之合', color: 'text-purple-600', bg: 'bg-purple-100' }
    if (score >= 90) return { level: '极佳', color: 'text-green-600', bg: 'bg-green-100' }
    if (score >= 80) return { level: '很好', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (score >= 70) return { level: '良好', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { level: '一般', color: 'text-orange-600', bg: 'bg-orange-100' }
  }

  const compatibilityInfo = getCompatibilityLevel(compatibility_score)

  // 生肖对应的emoji
  const getZodiacEmoji = (zodiac: string) => {
    const zodiacEmojis = {
      '鼠': '🐭', '牛': '🐮', '虎': '🐯', '兔': '🐰',
      '龙': '🐲', '蛇': '🐍', '马': '🐴', '羊': '🐑',
      '猴': '🐵', '鸡': '🐔', '狗': '🐶', '猪': '🐷'
    }
    return zodiacEmojis[zodiac as keyof typeof zodiacEmojis] || '⭐'
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* 头部 - 本命佛基本信息 */}
      <div className={`bg-gradient-to-r ${getElementGradient(buddha.element)} p-6 text-white relative overflow-hidden`}>
        {/* 装饰性背景图案 */}
        <div className="absolute top-0 right-0 opacity-10 text-8xl">🕯️</div>
        
        {is_birth_year_buddha && (
          <div className="absolute top-4 right-4">
            <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              本命佛
            </span>
          </div>
        )}
        
        <div className="flex items-center space-x-4 relative z-10">
          <div className="text-6xl">{buddha.avatar_emoji}</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-1">{buddha.name}</h3>
            <p className="text-lg opacity-90 mb-1">{buddha.sanskrit_name}</p>
            <p className="text-base opacity-80 mb-2">{buddha.title}</p>
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-1">
                {buddha.zodiac.map((z, index) => (
                  <span key={index} className="bg-white bg-opacity-20 px-2 py-1 rounded-full flex items-center space-x-1">
                    <span>{getZodiacEmoji(z)}</span>
                    <span>{z}</span>
                  </span>
                ))}
              </div>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                {buddha.element}行
              </span>
            </div>
          </div>
        </div>

        {/* 匹配度显示 */}
        <div className="mt-4 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-sm opacity-90">佛缘匹配度:</span>
            <span className="text-2xl font-bold">{compatibility_score}%</span>
            <span className={`${compatibilityInfo.bg} ${compatibilityInfo.color} px-2 py-1 rounded-full text-xs font-medium`}>
              {compatibilityInfo.level}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90 font-semibold">{buddha.mantra}</p>
          </div>
        </div>
      </div>

      {/* 选项卡导航 */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[
            { key: 'info', label: '基本信息', icon: '📋' },
            { key: 'blessings', label: '祝福加持', icon: '🙏' },
            { key: 'meditation', label: '修行指导', icon: '🧘' },
            { key: 'culture', label: '文化背景', icon: '📿' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-purple-500 text-purple-600 bg-purple-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 选项卡内容 */}
      <div className="p-6">
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* 匹配原因 */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="mr-2">✨</span>
                佛缘匹配原因
              </h4>
              <div className="space-y-2">
                {match_reasons.map((reason, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span className="text-gray-700">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 佛陀特质 */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="mr-2">🌟</span>
                佛陀特质
              </h4>
              <div className="flex flex-wrap gap-2">
                {buddha.personality.map((trait, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* 专长能力 */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="mr-2">🔮</span>
                专长能力
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {buddha.specialties.map((specialty, index) => (
                  <div
                    key={index}
                    className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-sm text-center"
                  >
                    {specialty}
                  </div>
                ))}
              </div>
            </div>

            {/* 保护领域 */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="mr-2">🛡️</span>
                保护领域
              </h4>
              <div className="flex flex-wrap gap-2">
                {buddha.protection_areas.map((area, index) => (
                  <span
                    key={index}
                    className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* 圣物法器 */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="mr-2">⚱️</span>
                圣物法器
              </h4>
              <div className="flex flex-wrap gap-2">
                {buddha.sacred_items.map((item, index) => (
                  <span
                    key={index}
                    className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blessings' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">🌸</span>
              个性化祝福
            </h4>
            {personalized_blessings.map((blessing, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-purple-600 text-xl mt-1">🙏</span>
                  <p className="text-gray-800 leading-relaxed">{blessing}</p>
                </div>
              </div>
            ))}
            
            {/* 完整咒语 */}
            <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
              <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                <span className="mr-2">📿</span>
                完整咒语
              </h5>
              <p className="text-gray-700 text-center text-lg font-medium">
                {buddha.full_mantra}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'meditation' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">🧘‍♀️</span>
              禅修指导
            </h4>
            {guidance_suggestions.map((guidance, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200"
              >
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center font-bold mt-1">
                    {index + 1}
                  </span>
                  <p className="text-gray-800 leading-relaxed">{guidance}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'culture' && (
          <div className="space-y-6">
            {/* 佛陀描述 */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="mr-2">📖</span>
                佛陀介绍
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {buddha.description}
              </p>
            </div>

            {/* 历史背景 */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="mr-2">📜</span>
                历史背景
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {buddha.historical_background}
              </p>
            </div>

            {/* 道场信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="mr-2">🏛️</span>
                  主要道场
                </h5>
                <p className="text-gray-700">{buddha.temple_location}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="mr-2">📅</span>
                  纪念日期
                </h5>
                <p className="text-gray-700">{buddha.festival_date}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部操作按钮 */}
      <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-purple-50">
        <div className="flex space-x-3">
          <button className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-colors">
            <span className="mr-2">💬</span>
            与佛陀对话
          </button>
          <button className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-700 transition-colors">
            <span className="mr-2">🙏</span>
            虔诚祈福
          </button>
        </div>
      </div>
    </div>
  )
}

export default BenmingBuddhaCard