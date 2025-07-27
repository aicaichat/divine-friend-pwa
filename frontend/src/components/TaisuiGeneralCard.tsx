/**
 * 太岁大将卡片组件
 * 用于显示太岁大将的详细信息和匹配结果
 */

import React, { useState } from 'react'

interface TaisuiGeneral {
  id: string
  name: string
  title: string
  year_stem: string
  year_branch: string
  jiazi_position: number
  element: string
  personality: string[]
  specialties: string[]
  blessings: string[]
  protection_areas: string[]
  avatar_emoji: string
  color: string
  mantra: string
  historical_background: string
}

interface TaisuiMatch {
  general: TaisuiGeneral
  compatibility_score: number
  match_reasons: string[]
  personalized_blessings: string[]
  guidance_suggestions: string[]
  is_birth_year_taisui: boolean
}

interface TaisuiGeneralCardProps {
  taisuiMatch: TaisuiMatch
  className?: string
}

const TaisuiGeneralCard: React.FC<TaisuiGeneralCardProps> = ({ 
  taisuiMatch, 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'blessings' | 'guidance'>('info')
  const { general, compatibility_score, match_reasons, personalized_blessings, guidance_suggestions, is_birth_year_taisui } = taisuiMatch

  // 五行对应的渐变色
  const getElementGradient = (element: string) => {
    const gradients = {
      wood: 'from-green-400 to-green-600',
      fire: 'from-red-400 to-red-600', 
      earth: 'from-yellow-400 to-orange-500',
      metal: 'from-gray-400 to-gray-600',
      water: 'from-blue-400 to-blue-600'
    }
    return gradients[element as keyof typeof gradients] || 'from-gray-400 to-gray-600'
  }

  // 获取兼容度等级
  const getCompatibilityLevel = (score: number) => {
    if (score >= 90) return { level: '极佳', color: 'text-green-600', bg: 'bg-green-100' }
    if (score >= 80) return { level: '很好', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (score >= 70) return { level: '良好', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    if (score >= 60) return { level: '一般', color: 'text-orange-600', bg: 'bg-orange-100' }
    return { level: '较差', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const compatibilityInfo = getCompatibilityLevel(compatibility_score)

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* 头部 - 太岁大将基本信息 */}
      <div className={`bg-gradient-to-r ${getElementGradient(general.element)} p-6 text-white relative`}>
        {is_birth_year_taisui && (
          <div className="absolute top-4 right-4">
            <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
              本命太岁
            </span>
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          <div className="text-6xl">{general.avatar_emoji}</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-1">{general.name}</h3>
            <p className="text-lg opacity-90 mb-2">{general.title}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                {general.year_stem}{general.year_branch}年
              </span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                {general.element}行
              </span>
            </div>
          </div>
        </div>

        {/* 匹配度显示 */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm opacity-90">匹配度:</span>
            <span className="text-2xl font-bold">{compatibility_score}%</span>
            <span className={`${compatibilityInfo.bg} ${compatibilityInfo.color} px-2 py-1 rounded-full text-xs font-medium`}>
              {compatibilityInfo.level}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">{general.mantra}</p>
          </div>
        </div>
      </div>

      {/* 选项卡导航 */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[
            { key: 'info', label: '基本信息', icon: '📋' },
            { key: 'blessings', label: '祝福语录', icon: '🙏' },
            { key: 'guidance', label: '修行指导', icon: '🧭' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
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
                <span className="mr-2">🔮</span>
                匹配原因
              </h4>
              <div className="space-y-2">
                {match_reasons.map((reason, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-gray-700">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 性格特征 */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="mr-2">✨</span>
                性格特征
              </h4>
              <div className="flex flex-wrap gap-2">
                {general.personality.map((trait, index) => (
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
                <span className="mr-2">🛡️</span>
                专长能力
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {general.specialties.map((specialty, index) => (
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
                <span className="mr-2">🏮</span>
                保护领域
              </h4>
              <div className="flex flex-wrap gap-2">
                {general.protection_areas.map((area, index) => (
                  <span
                    key={index}
                    className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* 历史背景 */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="mr-2">📜</span>
                历史背景
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {general.historical_background}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'blessings' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">🌟</span>
              个性化祝福
            </h4>
            {personalized_blessings.map((blessing, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-yellow-600 text-xl mt-1">🙏</span>
                  <p className="text-gray-800 leading-relaxed">{blessing}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'guidance' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">🧭</span>
              修行指导
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
      </div>

      {/* 底部操作按钮 */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex space-x-3">
          <button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-colors">
            <span className="mr-2">💬</span>
            与太岁对话
          </button>
          <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-colors">
            <span className="mr-2">🔮</span>
            祈福仪式
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaisuiGeneralCard