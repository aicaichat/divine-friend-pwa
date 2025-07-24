import React, { useState } from 'react'
import DailyFortuneDisplay from '../components/DailyFortuneDisplay'

const DailyFortuneTestPage: React.FC = () => {
  const [testData] = useState({
    date: '2024-01-15',
    overall_score: 85,
    overall_level: '很好',
    overall_description: '今日运势很好，大部分事情都能顺利进行，适合积极行动。',
    career_fortune: {
      score: 88,
      advice: ['适合开展新项目，创新思维活跃', '领导能力突出，适合主持会议'],
      lucky_time: '午时(11:00-13:00)',
      description: '今日事业运势良好'
    },
    wealth_fortune: {
      score: 82,
      advice: ['适合投资理财，财运渐入佳境', '财运旺盛，可能有意外收获'],
      lucky_time: '巳时(09:00-11:00)',
      description: '今日财运良好'
    },
    health_fortune: {
      score: 75,
      advice: ['适合户外运动，增强体质', '注意心脏健康，避免过度劳累'],
      lucky_time: '寅时(03:00-05:00)',
      description: '今日健康运势平稳'
    },
    relationship_fortune: {
      score: 90,
      advice: ['人际关系和谐，适合社交活动', '热情开朗，容易获得他人好感'],
      lucky_time: '午时(11:00-13:00)',
      description: '今日人际关系运势良好'
    },
    study_fortune: {
      score: 78,
      advice: ['学习能力强，适合学习新知识', '思维活跃，创造力强'],
      lucky_time: '申时(15:00-17:00)',
      description: '今日学习运势平稳'
    },
    lucky_directions: ['东', '东南'],
    lucky_colors: ['绿色', '青色', '蓝色'],
    lucky_numbers: [1, 2, 3],
    avoid_directions: ['西', '西北'],
    avoid_colors: ['白色', '银色'],
    recommended_activities: [
      '适合重要决策',
      '适合签约合作',
      '适合投资理财',
      '适合社交活动',
      '适合户外活动'
    ],
    avoid_activities: [
      '避免重要决策',
      '避免高风险活动',
      '避免冲突争执'
    ],
    timing_advice: {
      '子时(23:00-01:00)': '适合冥想思考',
      '寅时(03:00-05:00)': '适合早起运动',
      '午时(11:00-13:00)': '适合重要决策',
      '申时(15:00-17:00)': '适合学习工作'
    }
  })

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '30px',
          borderBottom: '1px solid #e9ecef',
          backgroundColor: '#f8f9fa'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#333',
            margin: 0,
            textAlign: 'center'
          }}>
            🌟 今日运势测试页面
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            textAlign: 'center',
            margin: '10px 0 0 0'
          }}>
            基于八字、大运和当前日期的专业运势分析
          </p>
        </div>
        
        <DailyFortuneDisplay fortuneData={testData} />
      </div>
    </div>
  )
}

export default DailyFortuneTestPage 