/**
 * 移动端精神导师匹配页面
 * 专为移动端优化的本命佛和本命太岁选择体验
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../components/mobile/MobileLayout'
import MobileCard from '../components/mobile/MobileCard'
import MobileGestures from '../components/mobile/MobileGestures'
import { EnhancedBaziService } from '../services/enhancedBaziService'

interface SpiritualGuide {
  type: 'buddha' | 'taisui'
  name: string
  image?: string
  description: string
  compatibility: number
  specialties: string[]
  blessings: string[]
  color: string
}

const MobileSpiritualMatchingPage: React.FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1) // 1: 选择偏好, 2: 查看匹配, 3: 详细对比
  const [selectedType, setSelectedType] = useState<'buddha' | 'taisui' | 'both'>('both')
  const [birthInfo, setBirthInfo] = useState<any>(null)
  const [buddhaGuide, setBuddhaGuide] = useState<SpiritualGuide | null>(null)
  const [taisuiGuide, setTaisuiGuide] = useState<SpiritualGuide | null>(null)
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    spiritualPath: 'both',
    guidanceStyle: 'balanced',
    focusAreas: [] as string[]
  })

  // 加载用户数据
  useEffect(() => {
    const savedBaziInfo = EnhancedBaziService.getSavedBaziInfo()
    if (savedBaziInfo) {
      setBirthInfo(savedBaziInfo.birthInfo)
    } else {
      // 如果没有八字数据，跳转到八字计算页面
      navigate('/bazi-demo', {
        state: { message: '请先完成八字计算，再进行精神导师匹配' }
      })
    }
  }, [navigate])

  // 加载精神导师数据
  const loadSpiritualGuides = async () => {
    if (!birthInfo) return

    setLoading(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))

      setBuddhaGuide({
        type: 'buddha',
        name: '大势至菩萨',
        description: '智慧光明，消除业障，引导觉悟',
        compatibility: 92,
        specialties: ['智慧开发', '业障消除', '内心平静'],
        blessings: ['增长智慧', '消除烦恼', '获得安乐'],
        color: '#9C27B0'
      })

      setTaisuiGuide({
        type: 'taisui',
        name: '甲子太岁金辨大将军',
        description: '威严护法，化解灾难，招财进宝',
        compatibility: 88,
        specialties: ['事业发展', '财运提升', '健康护佑'],
        blessings: ['事业顺利', '财源广进', '身体健康'],
        color: '#F44336'
      })

    } catch (error) {
      console.error('加载精神导师失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (birthInfo && currentStep === 2) {
      loadSpiritualGuides()
    }
  }, [birthInfo, currentStep])

  // 偏好设置选项
  const spiritualPathOptions = [
    { id: 'buddha', label: '佛教修行', desc: '慈悲智慧，内心觉悟', icon: '🙏', color: '#9C27B0' },
    { id: 'taisui', label: '道教修行', desc: '天人合一，护法庇佑', icon: '⚔️', color: '#F44336' },
    { id: 'both', label: '佛道双修', desc: '融合智慧，全面护佑', icon: '✨', color: '#3F51B5' }
  ]

  const focusAreaOptions = [
    { id: 'wisdom', label: '智慧开发', icon: '🧠' },
    { id: 'health', label: '身心健康', icon: '💪' },
    { id: 'career', label: '事业发展', icon: '💼' },
    { id: 'wealth', label: '财富积累', icon: '💰' },
    { id: 'relationships', label: '人际关系', icon: '🤝' },
    { id: 'peace', label: '内心平静', icon: '🧘' }
  ]

  // 处理手势
  const handleGesture = (event: any) => {
    if (event.type === 'swipe') {
      if (event.data.direction === 'left' && currentStep < 3) {
        setCurrentStep(currentStep + 1)
      } else if (event.data.direction === 'right' && currentStep > 1) {
        setCurrentStep(currentStep - 1)
      }
    }
  }

  // 渲染步骤指示器
  const renderStepIndicator = () => (
    <div className="flex justify-center items-center mb-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step <= currentStep 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 text-gray-400'
            }`}
            animate={{ 
              scale: step === currentStep ? 1.1 : 1,
              backgroundColor: step <= currentStep ? '#9C27B0' : '#E5E7EB'
            }}
          >
            {step}
          </motion.div>
          {step < 3 && (
            <div className={`w-12 h-1 mx-2 ${
              step < currentStep ? 'bg-purple-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  // 渲染偏好选择步骤
  const renderPreferenceStep = () => (
    <MobileGestures onGesture={handleGesture}>
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">选择您的修行偏好</h2>
          <p className="text-gray-600">让我们为您匹配最适合的精神导师</p>
        </div>

        {/* 精神路径选择 */}
        <MobileCard title="修行路径" icon="🛤️">
          <div className="space-y-3">
            {spiritualPathOptions.map((option) => (
              <motion.div
                key={option.id}
                className={`p-4 rounded-lg border-2 cursor-pointer ${
                  preferences.spiritualPath === option.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white'
                }`}
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  spiritualPath: option.id
                }))}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${option.color}20` }}
                  >
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{option.label}</h4>
                    <p className="text-sm text-gray-600">{option.desc}</p>
                  </div>
                  {preferences.spiritualPath === option.id && (
                    <div className="text-purple-500 text-xl">✓</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </MobileCard>

        {/* 关注领域选择 */}
        <MobileCard title="关注领域" subtitle="选择最需要指导的方面">
          <div className="grid grid-cols-2 gap-3">
            {focusAreaOptions.map((area) => (
              <motion.div
                key={area.id}
                className={`p-3 rounded-lg border-2 text-center cursor-pointer ${
                  preferences.focusAreas.includes(area.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white'
                }`}
                onClick={() => {
                  const newAreas = preferences.focusAreas.includes(area.id)
                    ? preferences.focusAreas.filter(id => id !== area.id)
                    : [...preferences.focusAreas, area.id]
                  setPreferences(prev => ({ ...prev, focusAreas: newAreas }))
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-2xl mb-2">{area.icon}</div>
                <div className="text-sm font-medium">{area.label}</div>
              </motion.div>
            ))}
          </div>
        </MobileCard>

        {/* 下一步按钮 */}
        <motion.button
          className="w-full bg-purple-500 text-white py-4 rounded-xl font-semibold text-lg"
          onClick={() => setCurrentStep(2)}
          whileTap={{ scale: 0.98 }}
          style={{
            background: 'linear-gradient(135deg, #9C27B0, #673AB7)'
          }}
        >
          开始匹配精神导师 ✨
        </motion.button>
      </div>
    </MobileGestures>
  )

  // 渲染匹配结果步骤
  const renderMatchingStep = () => (
    <MobileGestures onGesture={handleGesture}>
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">您的专属精神导师</h2>
          <p className="text-gray-600">根据您的八字和偏好精心匹配</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <motion.div
              className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-gray-600">正在为您匹配最合适的精神导师...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 本命佛卡片 */}
            {(selectedType === 'buddha' || selectedType === 'both') && buddhaGuide && (
              <MobileCard
                swipeable
                onSwipeRight={() => navigate('/chat', { state: { guideType: 'buddha' } })}
                elevation={3}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">🙏</div>
                  <h3 className="text-lg font-bold mb-2">{buddhaGuide.name}</h3>
                  <p className="text-gray-600 mb-4">{buddhaGuide.description}</p>
                  
                  <div className="bg-purple-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-sm text-gray-600 mr-2">匹配度</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {buddhaGuide.compatibility}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-purple-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${buddhaGuide.compatibility}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  <div className="text-left">
                    <h4 className="font-semibold mb-2">专长领域</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {buddhaGuide.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold"
                    onClick={() => navigate('/chat', { state: { guideType: 'buddha' } })}
                    whileTap={{ scale: 0.98 }}
                  >
                    开始与{buddhaGuide.name}对话 💬
                  </motion.button>
                </div>
              </MobileCard>
            )}

            {/* 本命太岁卡片 */}
            {(selectedType === 'taisui' || selectedType === 'both') && taisuiGuide && (
              <MobileCard
                swipeable
                onSwipeRight={() => navigate('/chat', { state: { guideType: 'taisui' } })}
                elevation={3}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">⚔️</div>
                  <h3 className="text-lg font-bold mb-2">{taisuiGuide.name}</h3>
                  <p className="text-gray-600 mb-4">{taisuiGuide.description}</p>
                  
                  <div className="bg-red-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-sm text-gray-600 mr-2">匹配度</span>
                      <span className="text-2xl font-bold text-red-600">
                        {taisuiGuide.compatibility}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-red-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${taisuiGuide.compatibility}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  <div className="text-left">
                    <h4 className="font-semibold mb-2">专长领域</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {taisuiGuide.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold"
                    onClick={() => navigate('/chat', { state: { guideType: 'taisui' } })}
                    whileTap={{ scale: 0.98 }}
                  >
                    开始与{taisuiGuide.name}对话 💬
                  </motion.button>
                </div>
              </MobileCard>
            )}

            {/* 对比按钮 */}
            {selectedType === 'both' && buddhaGuide && taisuiGuide && (
              <motion.button
                className="w-full bg-gradient-to-r from-purple-500 to-red-500 text-white py-4 rounded-xl font-semibold"
                onClick={() => setCurrentStep(3)}
                whileTap={{ scale: 0.98 }}
              >
                🔍 详细对比两位导师
              </motion.button>
            )}
          </div>
        )}
      </div>
    </MobileGestures>
  )

  // 渲染对比步骤
  const renderComparisonStep = () => (
    <MobileGestures onGesture={handleGesture}>
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">导师详细对比</h2>
          <p className="text-gray-600">深入了解两位导师的特点差异</p>
        </div>

        {buddhaGuide && taisuiGuide && (
          <div className="space-y-4">
            {/* 匹配度对比 */}
            <MobileCard title="匹配度对比" icon="📊">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">🙏 {buddhaGuide.name}</span>
                    <span className="text-purple-600 font-bold">{buddhaGuide.compatibility}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${buddhaGuide.compatibility}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">⚔️ {taisuiGuide.name}</span>
                    <span className="text-red-600 font-bold">{taisuiGuide.compatibility}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${taisuiGuide.compatibility}%` }}
                    />
                  </div>
                </div>
              </div>
            </MobileCard>

            {/* 特点对比 */}
            <MobileCard title="特点对比" icon="⚖️">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-purple-800">本命佛特点</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• 慈悲智慧指导</li>
                    <li>• 内心平静修行</li>
                    <li>• 业障消除净化</li>
                    <li>• 精神层面提升</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-red-800">本命太岁特点</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• 威严护法庇佑</li>
                    <li>• 现实问题解决</li>
                    <li>• 事业财运提升</li>
                    <li>• 健康平安守护</li>
                  </ul>
                </div>
              </div>
            </MobileCard>

            {/* 修行建议 */}
            <MobileCard title="修行建议" icon="📿">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-800">🌅 推荐修行计划</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>早晨 (07:00)</span>
                      <span>本命佛心咒念诵</span>
                    </div>
                    <div className="flex justify-between">
                      <span>中午 (12:00)</span>
                      <span>太岁护佑祈祷</span>
                    </div>
                    <div className="flex justify-between">
                      <span>晚上 (21:00)</span>
                      <span>感恩回向功德</span>
                    </div>
                  </div>
                </div>
              </div>
            </MobileCard>

            {/* 行动按钮 */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                className="bg-purple-500 text-white py-3 rounded-lg font-semibold"
                onClick={() => navigate('/chat', { state: { guideType: 'buddha' } })}
                whileTap={{ scale: 0.98 }}
              >
                选择本命佛
              </motion.button>
              <motion.button
                className="bg-red-500 text-white py-3 rounded-lg font-semibold"
                onClick={() => navigate('/chat', { state: { guideType: 'taisui' } })}
                whileTap={{ scale: 0.98 }}
              >
                选择本命太岁
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </MobileGestures>
  )

  return (
    <MobileLayout
      title="精神导师匹配"
      showBackButton={true}
      onBackClick={() => {
        if (currentStep > 1) {
          setCurrentStep(currentStep - 1)
        } else {
          navigate(-1)
        }
      }}
    >
      <div className="p-4 min-h-full">
        {renderStepIndicator()}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && renderPreferenceStep()}
            {currentStep === 2 && renderMatchingStep()}
            {currentStep === 3 && renderComparisonStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </MobileLayout>
  )
}

export default MobileSpiritualMatchingPage