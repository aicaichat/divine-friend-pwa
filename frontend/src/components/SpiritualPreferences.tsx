/**
 * 精神导师偏好设置组件
 * 允许用户设置和管理他们的精神导师偏好
 */

import React, { useState, useEffect } from 'react'

interface SpiritualPreference {
  id: string
  label: string
  description: string
  icon: string
}

interface SpiritualPreferencesProps {
  onPreferencesChange?: (preferences: any) => void
  initialPreferences?: any
  className?: string
}

const SpiritualPreferences: React.FC<SpiritualPreferencesProps> = ({
  onPreferencesChange,
  initialPreferences,
  className = ''
}) => {
  const [preferences, setPreferences] = useState({
    spiritualPath: 'both', // 'buddha', 'taisui', 'both'
    guidanceStyle: 'balanced', // 'gentle', 'strict', 'balanced'
    focusAreas: [] as string[],
    ritualPreference: 'moderate', // 'simple', 'moderate', 'elaborate'
    languagePreference: 'chinese', // 'chinese', 'sanskrit', 'both'
    notificationTime: '08:00',
    dailyPractice: true,
    personalGoals: [] as string[]
  })

  const [isExpanded, setIsExpanded] = useState(false)

  // 精神路径选项
  const spiritualPaths: SpiritualPreference[] = [
    {
      id: 'buddha',
      label: '佛教路径',
      description: '专注于佛教修行，追求智慧与慈悲',
      icon: '🙏'
    },
    {
      id: 'taisui',
      label: '道教路径',
      description: '专注于道教修行，注重平衡与护佑',
      icon: '⚔️'
    },
    {
      id: 'both',
      label: '佛道双修',
      description: '融合佛道两家智慧，全面发展',
      icon: '✨'
    }
  ]

  // 指导风格选项
  const guidanceStyles: SpiritualPreference[] = [
    {
      id: 'gentle',
      label: '温和指导',
      description: '温和耐心的指导方式，循序渐进',
      icon: '🌸'
    },
    {
      id: 'strict',
      label: '严格督促',
      description: '严格的修行要求，快速提升',
      icon: '🔥'
    },
    {
      id: 'balanced',
      label: '平衡适中',
      description: '温和与严格并济，适中发展',
      icon: '⚖️'
    }
  ]

  // 关注领域选项
  const focusAreaOptions = [
    { id: 'wisdom', label: '智慧开发', icon: '🧠' },
    { id: 'compassion', label: '慈悲培养', icon: '❤️' },
    { id: 'health', label: '身心健康', icon: '💪' },
    { id: 'career', label: '事业发展', icon: '💼' },
    { id: 'relationships', label: '人际关系', icon: '🤝' },
    { id: 'family', label: '家庭和谐', icon: '👨‍👩‍👧‍👦' },
    { id: 'wealth', label: '财富积累', icon: '💰' },
    { id: 'peace', label: '内心平静', icon: '🧘' }
  ]

  // 个人目标选项
  const personalGoalOptions = [
    { id: 'enlightenment', label: '开悟觉醒', icon: '🌟' },
    { id: 'karma_purification', label: '业障净化', icon: '✨' },
    { id: 'merit_accumulation', label: '功德积累', icon: '🙏' },
    { id: 'wisdom_growth', label: '智慧增长', icon: '📚' },
    { id: 'compassion_development', label: '慈悲心培养', icon: '💝' },
    { id: 'inner_peace', label: '内心平静', icon: '🕯️' },
    { id: 'protection', label: '护佑平安', icon: '🛡️' },
    { id: 'success', label: '人生成功', icon: '🏆' }
  ]

  useEffect(() => {
    if (initialPreferences) {
      setPreferences({ ...preferences, ...initialPreferences })
    }
  }, [initialPreferences])

  useEffect(() => {
    if (onPreferencesChange) {
      onPreferencesChange(preferences)
    }
  }, [preferences, onPreferencesChange])

  const handleSpiritualPathChange = (path: string) => {
    setPreferences(prev => ({ ...prev, spiritualPath: path }))
  }

  const handleGuidanceStyleChange = (style: string) => {
    setPreferences(prev => ({ ...prev, guidanceStyle: style }))
  }

  const handleFocusAreaToggle = (areaId: string) => {
    setPreferences(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(areaId)
        ? prev.focusAreas.filter(id => id !== areaId)
        : [...prev.focusAreas, areaId]
    }))
  }

  const handlePersonalGoalToggle = (goalId: string) => {
    setPreferences(prev => ({
      ...prev,
      personalGoals: prev.personalGoals.includes(goalId)
        ? prev.personalGoals.filter(id => id !== goalId)
        : [...prev.personalGoals, goalId]
    }))
  }

  const handleRitualPreferenceChange = (preference: string) => {
    setPreferences(prev => ({ ...prev, ritualPreference: preference }))
  }

  const handleLanguagePreferenceChange = (language: string) => {
    setPreferences(prev => ({ ...prev, languagePreference: language }))
  }

  const handleNotificationTimeChange = (time: string) => {
    setPreferences(prev => ({ ...prev, notificationTime: time }))
  }

  const handleDailyPracticeToggle = () => {
    setPreferences(prev => ({ ...prev, dailyPractice: !prev.dailyPractice }))
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 ${className}`}>
      {/* 头部 */}
      <div 
        className="p-6 border-b border-gray-200 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h3 className="text-xl font-bold text-gray-800">精神导师偏好设置</h3>
              <p className="text-gray-600 text-sm">自定义您的修行偏好和指导方式</p>
            </div>
          </div>
          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <span className="text-gray-400 text-xl">▼</span>
          </div>
        </div>
      </div>

      {/* 展开内容 */}
      {isExpanded && (
        <div className="p-6 space-y-8">
          {/* 精神路径选择 */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">🛤️</span>
              精神修行路径
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {spiritualPaths.map((path) => (
                <button
                  key={path.id}
                  onClick={() => handleSpiritualPathChange(path.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    preferences.spiritualPath === path.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{path.icon}</div>
                  <h5 className="font-semibold text-gray-800">{path.label}</h5>
                  <p className="text-sm text-gray-600">{path.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 指导风格选择 */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              指导风格偏好
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {guidanceStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleGuidanceStyleChange(style.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    preferences.guidanceStyle === style.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{style.icon}</div>
                  <h5 className="font-semibold text-gray-800">{style.label}</h5>
                  <p className="text-sm text-gray-600">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 关注领域 */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">🎪</span>
              重点关注领域
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {focusAreaOptions.map((area) => (
                <button
                  key={area.id}
                  onClick={() => handleFocusAreaToggle(area.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    preferences.focusAreas.includes(area.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xl mb-1">{area.icon}</div>
                  <span className="text-sm font-medium">{area.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 个人目标 */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              个人修行目标
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {personalGoalOptions.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handlePersonalGoalToggle(goal.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    preferences.personalGoals.includes(goal.id)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xl mb-1">{goal.icon}</div>
                  <span className="text-sm font-medium">{goal.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 仪式偏好和其他设置 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 仪式偏好 */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="mr-2">🕯️</span>
                仪式复杂度
              </h4>
              <div className="space-y-2">
                {[
                  { id: 'simple', label: '简单仪式', desc: '简洁的日常修行' },
                  { id: 'moderate', label: '适中仪式', desc: '平衡的修行方式' },
                  { id: 'elaborate', label: '详细仪式', desc: '完整的传统仪式' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleRitualPreferenceChange(option.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      preferences.ritualPreference === option.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 语言偏好 */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="mr-2">🗣️</span>
                语言偏好
              </h4>
              <div className="space-y-2">
                {[
                  { id: 'chinese', label: '中文', desc: '使用中文咒语和经文' },
                  { id: 'sanskrit', label: '梵文', desc: '使用传统梵文咒语' },
                  { id: 'both', label: '双语', desc: '中文和梵文并用' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleLanguagePreferenceChange(option.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      preferences.languagePreference === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 日常设置 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 提醒时间 */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="mr-2">⏰</span>
                每日提醒时间
              </h4>
              <input
                type="time"
                value={preferences.notificationTime}
                onChange={(e) => handleNotificationTimeChange(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* 每日修行 */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <span className="mr-2">📿</span>
                每日修行提醒
              </h4>
              <button
                onClick={handleDailyPracticeToggle}
                className={`w-full p-3 rounded-lg border-2 transition-all ${
                  preferences.dailyPractice
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>{preferences.dailyPractice ? '✅' : '⭕'}</span>
                  <span className="font-medium">
                    {preferences.dailyPractice ? '已开启每日修行提醒' : '点击开启每日修行提醒'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="flex justify-center pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsExpanded(false)}
              className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-700 transition-colors"
            >
              <span className="mr-2">💾</span>
              保存偏好设置
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpiritualPreferences