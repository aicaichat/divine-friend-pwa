/**
 * 优化的精神导师匹配页面
 * 整合本命佛和本命太岁的选择与匹配功能
 */

import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SpiritualGuideSelector from '../components/SpiritualGuideSelector'
import SpiritualPreferences from '../components/SpiritualPreferences'
import SpiritualGuideComparison from '../components/SpiritualGuideComparison'
import { EnhancedBaziService } from '../services/enhancedBaziService'

interface LocationState {
  birthInfo?: any
  baziAnalysis?: any
}

const OptimizedSpiritualMatchingPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState

  const [birthInfo, setBirthInfo] = useState<any>(null)
  const [baziAnalysis, setBaziAnalysis] = useState<any>(null)
  const [selectedGuideType, setSelectedGuideType] = useState<string>('both')
  const [userPreferences, setUserPreferences] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buddhaData, setBuddhaData] = useState<any>(null)
  const [taisuiData, setTaisuiData] = useState<any>(null)
  const [showComparison, setShowComparison] = useState(false)

  useEffect(() => {
    initializePage()
  }, [])

  const initializePage = async () => {
    try {
      // 从 URL state 或本地存储获取数据
      if (state?.birthInfo && state?.baziAnalysis) {
        setBirthInfo(state.birthInfo)
        setBaziAnalysis(state.baziAnalysis)
      } else {
        // 尝试从本地存储加载
        const savedBaziInfo = EnhancedBaziService.getSavedBaziInfo()
        if (savedBaziInfo?.birthInfo && savedBaziInfo?.baziData) {
          setBirthInfo(savedBaziInfo.birthInfo)
          setBaziAnalysis(savedBaziInfo.baziData)
        } else {
          // 如果没有数据，重定向到八字计算页面
          navigate('/bazi-demo', { 
            state: { 
              message: '请先完成八字计算，再进行精神导师匹配' 
            }
          })
          return
        }
      }

      // 加载用户偏好
      const savedPreferences = localStorage.getItem('spiritual-preferences')
      if (savedPreferences) {
        setUserPreferences(JSON.parse(savedPreferences))
      }

    } catch (err) {
      console.error('初始化页面失败:', err)
      setError('页面初始化失败，请重试')
    }
  }

  const handleGuideTypeChange = (type: string) => {
    setSelectedGuideType(type)
  }

  const handlePreferencesChange = (preferences: any) => {
    setUserPreferences(preferences)
    // 保存到本地存储
    localStorage.setItem('spiritual-preferences', JSON.stringify(preferences))
  }

  const handleRecalculate = () => {
    navigate('/bazi-demo')
  }

  const handleStartChat = (guideType: 'buddha' | 'taisui') => {
    // 导航到对应的聊天页面
    navigate('/personalized-chat', {
      state: {
        guideType,
        birthInfo,
        baziAnalysis,
        userPreferences
      }
    })
  }

  const handleSpiritualDataUpdate = (type: 'buddha' | 'taisui', data: any) => {
    if (type === 'buddha') {
      setBuddhaData(data)
    } else if (type === 'taisui') {
      setTaisuiData(data)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">正在为您匹配精神导师</h3>
          <p className="text-gray-600">请稍候，我们正在分析您的八字与神仙缘分...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">😅</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">出现了一些问题</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              重新加载
            </button>
            <button
              onClick={handleRecalculate}
              className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              重新计算八字
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!birthInfo || !baziAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">需要八字信息</h3>
          <p className="text-gray-600 mb-6">请先完成八字计算，再进行精神导师匹配</p>
          <button
            onClick={handleRecalculate}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            开始八字计算
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span className="text-2xl">←</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">精神导师匹配</h1>
                <p className="text-gray-600">为您寻找最适合的精神导师</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {birthInfo.name} ({birthInfo.birthYear}年)
              </span>
              <button
                onClick={handleRecalculate}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                重新计算
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* 用户偏好设置 */}
          <SpiritualPreferences
            onPreferencesChange={handlePreferencesChange}
            initialPreferences={userPreferences}
          />

          {/* 精神导师选择器 */}
          <SpiritualGuideSelector
            birthYear={birthInfo.birthYear}
            baziAnalysis={baziAnalysis}
            onSelectionChange={handleGuideTypeChange}
            onDataUpdate={handleSpiritualDataUpdate}
          />

          {/* 精神导师对比功能 */}
          {buddhaData && taisuiData && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="mr-2">⚖️</span>
                  深度对比分析
                </h3>
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    showComparison
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {showComparison ? '隐藏对比' : '显示对比'}
                </button>
              </div>
              {showComparison && (
                <SpiritualGuideComparison
                  buddhaData={buddhaData}
                  taisuiData={taisuiData}
                />
              )}
            </div>
          )}

          {/* 快速行动按钮 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              开始您的精神之旅
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => handleStartChat('buddha')}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-colors"
              >
                <div className="text-2xl mb-2">🙏</div>
                <div>与本命佛对话</div>
                <div className="text-sm opacity-90">获得慈悲智慧指导</div>
              </button>
              
              <button
                onClick={() => handleStartChat('taisui')}
                className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-4 rounded-xl font-medium hover:from-red-600 hover:to-orange-700 transition-colors"
              >
                <div className="text-2xl mb-2">⚔️</div>
                <div>与本命太岁对话</div>
                <div className="text-sm opacity-90">获得护法庇佑指导</div>
              </button>
              
              <button
                onClick={() => navigate('/daily-fortune', { state: { birthInfo, baziAnalysis } })}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-colors"
              >
                <div className="text-2xl mb-2">🔮</div>
                <div>查看今日运势</div>
                <div className="text-sm opacity-90">了解今日吉凶宜忌</div>
              </button>

              {buddhaData && taisuiData && (
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-xl font-medium hover:from-green-600 hover:to-teal-700 transition-colors"
                >
                  <div className="text-2xl mb-2">⚖️</div>
                  <div>深度对比</div>
                  <div className="text-sm opacity-90">详细分析两位导师</div>
                </button>
              )}
            </div>
          </div>

          {/* 修行建议 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📿</span>
              今日修行建议
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 佛教修行 */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <span className="mr-2">🙏</span>
                  佛教修行
                </h4>
                <ul className="space-y-2 text-sm text-purple-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    晨起念诵本命佛心咒108遍
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    中午进行10分钟慈悲禅修
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    晚间回向功德给一切众生
                  </li>
                </ul>
              </div>

              {/* 道教修行 */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                  <span className="mr-2">⚔️</span>
                  道教修行
                </h4>
                <ul className="space-y-2 text-sm text-red-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    面向太岁方位祈祷护佑
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    默念太岁大将军圣号
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    在家中供奉一杯清水
                  </li>
                </ul>
              </div>
            </div>

            {/* 个性化建议 */}
            {userPreferences && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-2 flex items-center">
                  <span className="mr-2">✨</span>
                  根据您的偏好个性化建议
                </h4>
                <div className="text-sm text-indigo-700">
                  {userPreferences.spiritualPath === 'both' && (
                    <p>建议您佛道双修，上午进行佛教禅修，下午进行道教祈祷，获得全面的精神指导。</p>
                  )}
                  {userPreferences.spiritualPath === 'buddha' && (
                    <p>专注于佛教修行，建议深入学习经典，培养慈悲心和智慧。</p>
                  )}
                  {userPreferences.spiritualPath === 'taisui' && (
                    <p>专注于道教修行，建议了解太岁文化，祈求护法庇佑。</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部导航 */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <button 
              onClick={() => navigate('/home')}
              className="hover:text-gray-800 transition-colors"
            >
              🏠 首页
            </button>
            <button 
              onClick={() => navigate('/bazi-demo')}
              className="hover:text-gray-800 transition-colors"
            >
              📊 八字分析
            </button>
            <button 
              onClick={() => navigate('/daily-fortune')}
              className="hover:text-gray-800 transition-colors"
            >
              🔮 今日运势
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="hover:text-gray-800 transition-colors"
            >
              ⚙️ 设置
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OptimizedSpiritualMatchingPage