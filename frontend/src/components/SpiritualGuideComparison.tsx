/**
 * 精神导师对比组件
 * 详细对比本命佛和本命太岁的特点、功能和适用场景
 */

import React, { useState } from 'react'

interface SpiritualGuideComparisonProps {
  buddhaData?: any
  taisuiData?: any
  className?: string
}

const SpiritualGuideComparison: React.FC<SpiritualGuideComparisonProps> = ({
  buddhaData,
  taisuiData,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'practices'>('overview')

  if (!buddhaData || !taisuiData) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-6 text-center ${className}`}>
        <div className="text-gray-400 text-4xl mb-4">📊</div>
        <p className="text-gray-600">需要同时加载本命佛和本命太岁数据才能进行对比</p>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: '概览对比', icon: '📊' },
    { id: 'detailed', label: '详细分析', icon: '🔍' },
    { id: 'practices', label: '修行指导', icon: '🧘' }
  ]

  const renderOverviewComparison = () => (
    <div className="space-y-6">
      {/* 匹配度对比 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-purple-50 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-purple-800 flex items-center">
              <span className="mr-2">🙏</span>
              本命佛 - {buddhaData.buddha?.name}
            </h4>
            <div className="text-2xl font-bold text-purple-600">
              {buddhaData.compatibility_score}%
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">主要特征</div>
              <div className="text-gray-600">{buddhaData.buddha?.traits?.join(', ')}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">守护领域</div>
              <div className="text-gray-600">{buddhaData.buddha?.protection_areas?.join(', ')}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">修行方式</div>
              <div className="text-gray-600">禅修、念佛、持咒</div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-red-800 flex items-center">
              <span className="mr-2">⚔️</span>
              本命太岁 - {taisuiData.general?.name}
            </h4>
            <div className="text-2xl font-bold text-red-600">
              {taisuiData.compatibility_score}%
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">主要特征</div>
              <div className="text-gray-600">{taisuiData.general?.personality}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">守护领域</div>
              <div className="text-gray-600">{taisuiData.general?.specialties?.join(', ')}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">修行方式</div>
              <div className="text-gray-600">祈祷、供奉、仪式</div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能对比表格 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">⚖️</span>
          功能特点对比
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2">特点</th>
                <th className="text-center py-3 px-2 text-purple-700">本命佛</th>
                <th className="text-center py-3 px-2 text-red-700">本命太岁</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-2 font-medium">修行路径</td>
                <td className="text-center py-3 px-2">佛教 - 内心觉悟</td>
                <td className="text-center py-3 px-2">道教 - 天人合一</td>
              </tr>
              <tr>
                <td className="py-3 px-2 font-medium">主要功能</td>
                <td className="text-center py-3 px-2">智慧开发</td>
                <td className="text-center py-3 px-2">护佑平安</td>
              </tr>
              <tr>
                <td className="py-3 px-2 font-medium">适用时机</td>
                <td className="text-center py-3 px-2">日常修行</td>
                <td className="text-center py-3 px-2">困难时期</td>
              </tr>
              <tr>
                <td className="py-3 px-2 font-medium">修行难度</td>
                <td className="text-center py-3 px-2">循序渐进</td>
                <td className="text-center py-3 px-2">相对简单</td>
              </tr>
              <tr>
                <td className="py-3 px-2 font-medium">效果侧重</td>
                <td className="text-center py-3 px-2">精神提升</td>
                <td className="text-center py-3 px-2">现实改善</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderDetailedAnalysis = () => (
    <div className="space-y-6">
      {/* 匹配原因详细分析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-l-4 border-purple-500 p-6 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
            <span className="mr-2">🔍</span>
            本命佛匹配分析
          </h4>
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-gray-700 mb-2">匹配原因</h5>
              <ul className="space-y-1">
                {buddhaData.match_reasons?.map((reason: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span className="text-gray-600 text-sm">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 mb-2">个性化庇佑</h5>
              <ul className="space-y-1">
                {buddhaData.personalized_blessings?.map((blessing: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span className="text-gray-600 text-sm">{blessing}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
            <span className="mr-2">🔍</span>
            本命太岁匹配分析
          </h4>
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-gray-700 mb-2">匹配原因</h5>
              <ul className="space-y-1">
                {taisuiData.match_reasons?.map((reason: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span className="text-gray-600 text-sm">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 mb-2">个性化庇佑</h5>
              <ul className="space-y-1">
                {taisuiData.personalized_blessings?.map((blessing: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span className="text-gray-600 text-sm">{blessing}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 五行属性对比 */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🌿</span>
          五行属性对比
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg">
            <h5 className="font-medium text-purple-700 mb-3">本命佛五行属性</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>属性</span>
                <span className="font-medium">{buddhaData.buddha?.element || '多元素'}</span>
              </div>
              <div className="flex justify-between">
                <span>互补性</span>
                <span className="font-medium text-green-600">高</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h5 className="font-medium text-red-700 mb-3">本命太岁五行属性</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>属性</span>
                <span className="font-medium">{taisuiData.general?.element?.name || '未知'}</span>
              </div>
              <div className="flex justify-between">
                <span>互补性</span>
                <span className="font-medium text-green-600">高</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPracticeGuide = () => (
    <div className="space-y-6">
      {/* 修行建议对比 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-purple-50 p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
            <span className="mr-2">🧘</span>
            本命佛修行指导
          </h4>
          <div className="space-y-4">
            {buddhaData.guidance_suggestions?.map((suggestion: string, index: number) => (
              <div key={index} className="bg-white p-3 rounded-lg">
                <div className="flex items-start">
                  <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 text-sm">{suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
            <span className="mr-2">🙏</span>
            本命太岁修行指导
          </h4>
          <div className="space-y-4">
            {taisuiData.guidance_suggestions?.map((suggestion: string, index: number) => (
              <div key={index} className="bg-white p-3 rounded-lg">
                <div className="flex items-start">
                  <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 text-sm">{suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 综合修行建议 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">✨</span>
          佛道双修综合建议
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl mb-2">🌅</div>
            <h5 className="font-medium text-gray-800 mb-2">晨修</h5>
            <p className="text-sm text-gray-600">
              晨起面向东方，先念本命佛心咒，后向本命太岁祈祷护佑
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl mb-2">☀️</div>
            <h5 className="font-medium text-gray-800 mb-2">日修</h5>
            <p className="text-sm text-gray-600">
              白天遇到困难时求太岁护佑，平静时进行佛法修行
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl mb-2">🌙</div>
            <h5 className="font-medium text-gray-800 mb-2">晚修</h5>
            <p className="text-sm text-gray-600">
              晚间感恩本命佛智慧指导，感谢太岁一日护佑
            </p>
          </div>
        </div>
      </div>

      {/* 修行时间建议 */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📅</span>
          修行时间安排
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">每日修行</span>
            <span className="text-sm text-gray-600">佛法10分钟 + 太岁祈祷5分钟</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">每周专修</span>
            <span className="text-sm text-gray-600">周日本命佛 + 周六本命太岁</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">特殊时期</span>
            <span className="text-sm text-gray-600">困难时重点求太岁，平顺时重点修佛法</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* 头部和标签页 */}
      <div className="bg-gradient-to-r from-purple-500 to-red-500 text-white p-6">
        <h3 className="text-2xl font-bold mb-4 flex items-center">
          <span className="mr-3">⚖️</span>
          精神导师深度对比
        </h3>
        <div className="flex space-x-1 bg-white bg-opacity-20 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600'
                  : 'text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        {activeTab === 'overview' && renderOverviewComparison()}
        {activeTab === 'detailed' && renderDetailedAnalysis()}
        {activeTab === 'practices' && renderPracticeGuide()}
      </div>
    </div>
  )
}

export default SpiritualGuideComparison