/**
 * 精神导师选择器组件
 * 让用户在本命佛和本命太岁之间选择
 */

import React, { useState, useEffect } from 'react'
import BenmingBuddhaCard from './BenmingBuddhaCard'
import TaisuiGeneralCard from './TaisuiGeneralCard'
import { EnhancedBaziService } from '../services/enhancedBaziService'
import { APIClient } from '../services/apiClient'

interface SpiritualGuideType {
  id: 'buddha' | 'taisui' | 'both'
  name: string
  description: string
  icon: string
  color: string
}

interface SpiritualGuideSelectorProps {
  birthYear: number
  baziAnalysis?: any
  onSelectionChange?: (selection: string) => void
  onDataUpdate?: (type: 'buddha' | 'taisui', data: any) => void
  className?: string
}

const SpiritualGuideSelector: React.FC<SpiritualGuideSelectorProps> = ({
  birthYear,
  baziAnalysis,
  onSelectionChange,
  onDataUpdate,
  className = ''
}) => {
  const [selectedType, setSelectedType] = useState<'buddha' | 'taisui' | 'both'>('both')
  const [buddhaData, setBuddhaData] = useState<any>(null)
  const [taisuiData, setTaisuiData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const guideTypes: SpiritualGuideType[] = [
    {
      id: 'buddha',
      name: '本命佛',
      description: '佛教护法，慈悲智慧，净化心灵',
      icon: '🙏',
      color: 'from-purple-400 to-pink-500'
    },
    {
      id: 'taisui',
      name: '本命太岁',
      description: '道教护法，威严正义，趋吉避凶',
      icon: '⚔️',
      color: 'from-red-400 to-orange-500'
    },
    {
      id: 'both',
      name: '双重护佑',
      description: '佛道双修，全方位守护',
      icon: '✨',
      color: 'from-blue-400 to-purple-500'
    }
  ]

  useEffect(() => {
    loadSpiritualGuides()
  }, [birthYear, baziAnalysis])

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedType)
    }
  }, [selectedType, onSelectionChange])

  const loadSpiritualGuides = async () => {
    setLoading(true)
    setError(null)

    try {
      // 同时加载本命佛和本命太岁数据
      const [buddhaResponse, taisuiResponse] = await Promise.all([
        APIClient.getBirthYearBuddha(birthYear, baziAnalysis),
        APIClient.getBirthYearTaisui(birthYear, baziAnalysis)
      ])

      if (buddhaResponse.success) {
        setBuddhaData(buddhaResponse.data)
        if (onDataUpdate) {
          onDataUpdate('buddha', buddhaResponse.data)
        }
      } else {
        console.error('获取本命佛失败:', buddhaResponse.error)
      }

      if (taisuiResponse.success) {
        setTaisuiData(taisuiResponse.data)
        if (onDataUpdate) {
          onDataUpdate('taisui', taisuiResponse.data)
        }
      } else {
        console.error('获取本命太岁失败:', taisuiResponse.error)
      }

    } catch (err) {
      console.error('加载精神导师数据失败:', err)
      setError('加载数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleTypeSelection = (type: 'buddha' | 'taisui' | 'both') => {
    setSelectedType(type)
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-8 text-center ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-600">正在为您寻找专属的精神导师...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-8 text-center ${className}`}>
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadSpiritualGuides}
          className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          重新加载
        </button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 选择器头部 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            选择您的精神导师
          </h2>
          <p className="text-gray-600">
            根据您的出生年份为您匹配最适合的精神导师
          </p>
        </div>

        {/* 选择按钮 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guideTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeSelection(type.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                selectedType === type.id
                  ? 'border-purple-500 bg-purple-50 transform scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`text-4xl mb-2 bg-gradient-to-r ${type.color} bg-clip-text text-transparent`}>
                {type.icon}
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">
                {type.name}
              </h3>
              <p className="text-sm text-gray-600">
                {type.description}
              </p>
            </button>
          ))}
        </div>

        {/* 年份信息 */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full">
            <span className="text-2xl mr-2">🎂</span>
            <span className="text-gray-700">
              出生年份: <strong>{birthYear}年</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 显示选中的精神导师 */}
      <div className="space-y-6">
        {(selectedType === 'buddha' || selectedType === 'both') && buddhaData && (
          <div className="transform transition-all duration-500 ease-in-out">
            <BenmingBuddhaCard 
              buddhaMatch={{
                buddha: buddhaData.buddha,
                compatibility_score: buddhaData.compatibility_score,
                match_reasons: buddhaData.match_reasons,
                personalized_blessings: buddhaData.personalized_blessings,
                guidance_suggestions: buddhaData.guidance_suggestions,
                is_birth_year_buddha: buddhaData.is_birth_year_buddha
              }}
            />
          </div>
        )}

        {(selectedType === 'taisui' || selectedType === 'both') && taisuiData && (
          <div className="transform transition-all duration-500 ease-in-out">
            <TaisuiGeneralCard
              taisuiMatch={{
                general: taisuiData.general,
                compatibility_score: taisuiData.compatibility_score,
                match_reasons: taisuiData.match_reasons,
                personalized_blessings: taisuiData.personalized_blessings,
                guidance_suggestions: taisuiData.guidance_suggestions,
                is_birth_year_taisui: taisuiData.is_birth_year_taisui
              }}
            />
          </div>
        )}
      </div>

      {/* 比较信息 */}
      {selectedType === 'both' && buddhaData && taisuiData && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">⚖️</span>
            双重护佑对比
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 本命佛特点 */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                <span className="mr-2">🙏</span>
                本命佛 - {buddhaData.buddha.name}
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  匹配度: {buddhaData.compatibility_score}%
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  特色: 慈悲智慧，净化心灵
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  适合: 精神修养，内心平静
                </li>
              </ul>
            </div>

            {/* 本命太岁特点 */}
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                <span className="mr-2">⚔️</span>
                本命太岁 - {taisuiData.general.name}
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  匹配度: {taisuiData.compatibility_score}%
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  特色: 威严护法，趋吉避凶
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  适合: 事业发展，化解困难
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <p className="text-gray-700 text-center">
              <span className="font-semibold">💡 建议：</span>
              佛道双修，内修慈悲智慧，外得护法庇佑，可获得最全面的精神指导与现实护佑。
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpiritualGuideSelector