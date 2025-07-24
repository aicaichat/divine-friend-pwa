import React, { useState } from 'react';
import { apiService } from '../services/apiService';

const PersonalizedChatTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testPersonalizedChat = async () => {
    setIsLoading(true);
    try {
      // 测试八字计算
      const baziResponse = await apiService.calculateBazi({
        birthdate: '1990-01-01T12:00',
        name: '测试用户',
        gender: 'male'
      });

      // 测试今日运势
      const fortuneResponse = await apiService.calculateDailyFortune({
        birthdate: '1990-01-01T12:00',
        name: '测试用户',
        gender: 'male'
      });

      setTestResults({
        bazi: baziResponse.data,
        fortune: fortuneResponse.data,
        success: true
      });
    } catch (error) {
      setTestResults({
        error: error instanceof Error ? error.message : '未知错误',
        success: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="zen-page">
      <div className="zen-header">
        <h1 className="zen-title">个性化聊天功能测试</h1>
        <p className="zen-subtitle">
          测试八字计算和今日运势API，验证个性化聊天功能
        </p>
      </div>

      <div className="zen-container">
        <div className="zen-card texture-paper">
          <h3 className="zen-subtitle">API测试</h3>
          <button
            onClick={testPersonalizedChat}
            disabled={isLoading}
            className="zen-button hover-lift"
            style={{
              padding: 'var(--space-verse) var(--space-stanza)',
              background: 'var(--gradient-sunrise)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-moon)',
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              marginBottom: 'var(--space-stanza)'
            }}
          >
            {isLoading ? '测试中...' : '开始测试'}
          </button>

          {testResults && (
            <div style={{ marginTop: 'var(--space-stanza)' }}>
              {testResults.success ? (
                <div>
                  <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-verse)' }}>
                    ✅ 测试成功
                  </h4>
                  
                  {/* 八字信息 */}
                  <div style={{ marginBottom: 'var(--space-stanza)' }}>
                    <h5 style={{ color: 'var(--ink-thick)', marginBottom: 'var(--space-breath)' }}>
                      八字信息
                    </h5>
                    <div style={{ 
                      padding: 'var(--space-verse)', 
                      background: 'var(--paper-modern)', 
                      borderRadius: 'var(--radius-pebble)',
                      fontSize: 'var(--text-small)',
                      lineHeight: 'var(--leading-relaxed)'
                    }}>
                      <div>年柱：{testResults.bazi.bazi_chart.year_pillar.stem}{testResults.bazi.bazi_chart.year_pillar.branch}</div>
                      <div>月柱：{testResults.bazi.bazi_chart.month_pillar.stem}{testResults.bazi.bazi_chart.month_pillar.branch}</div>
                      <div>日柱：{testResults.bazi.bazi_chart.day_pillar.stem}{testResults.bazi.bazi_chart.day_pillar.branch}</div>
                      <div>时柱：{testResults.bazi.bazi_chart.hour_pillar.stem}{testResults.bazi.bazi_chart.hour_pillar.branch}</div>
                      <div>日主：{testResults.bazi.bazi_chart.day_master}</div>
                    </div>
                  </div>

                  {/* 今日运势 */}
                  <div style={{ marginBottom: 'var(--space-stanza)' }}>
                    <h5 style={{ color: 'var(--ink-thick)', marginBottom: 'var(--space-breath)' }}>
                      今日运势
                    </h5>
                    <div style={{ 
                      padding: 'var(--space-verse)', 
                      background: 'var(--paper-modern)', 
                      borderRadius: 'var(--radius-pebble)',
                      fontSize: 'var(--text-small)',
                      lineHeight: 'var(--leading-relaxed)'
                    }}>
                      <div>综合评分：{testResults.fortune.overall_score}分</div>
                      <div>运势等级：{testResults.fortune.overall_level}</div>
                      <div>运势描述：{testResults.fortune.overall_description}</div>
                      <div>吉利颜色：{testResults.fortune.lucky_colors.join('、')}</div>
                      <div>吉利方位：{testResults.fortune.lucky_directions.join('、')}</div>
                    </div>
                  </div>

                  {/* 测试建议 */}
                  <div style={{ 
                    padding: 'var(--space-verse)', 
                    background: 'var(--gradient-water)', 
                    borderRadius: 'var(--radius-pebble)',
                    border: '1px solid var(--earth-golden)40'
                  }}>
                    <h5 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
                      🎯 测试建议
                    </h5>
                    <ul style={{ 
                      margin: 0, 
                      paddingLeft: 'var(--space-verse)',
                      fontSize: 'var(--text-small)',
                      color: 'var(--ink-medium)'
                    }}>
                      <li>API连接正常，可以获取用户八字信息</li>
                      <li>今日运势计算功能正常</li>
                      <li>可以进入个性化聊天页面进行测试</li>
                      <li>建议使用真实用户信息进行完整测试</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  padding: 'var(--space-verse)', 
                  background: 'var(--fire-phoenix)10', 
                  borderRadius: 'var(--radius-pebble)',
                  border: '1px solid var(--fire-phoenix)40',
                  color: 'var(--fire-phoenix)'
                }}>
                  <h4 style={{ marginBottom: 'var(--space-breath)' }}>❌ 测试失败</h4>
                  <div>错误信息：{testResults.error}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="zen-card texture-silk">
          <h3 className="zen-subtitle">功能说明</h3>
          <div style={{ fontSize: 'var(--text-small)', lineHeight: 'var(--leading-relaxed)' }}>
            <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
              🎯 个性化聊天功能
            </h4>
            <ul style={{ paddingLeft: 'var(--space-verse)' }}>
              <li>基于用户八字信息进行个性化对话</li>
              <li>结合今日运势提供精准建议</li>
              <li>根据用户情感状态调整回复风格</li>
              <li>提供吉利信息和活动建议</li>
              <li>支持多种神仙角色选择</li>
            </ul>

            <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)', marginTop: 'var(--space-stanza)' }}>
              🚀 使用方法
            </h4>
            <ol style={{ paddingLeft: 'var(--space-verse)' }}>
              <li>点击导航中的"个性化对话"</li>
              <li>填写个人基本信息（姓名、出生日期、性别）</li>
              <li>系统自动计算八字和今日运势</li>
              <li>选择喜欢的神仙进行对话</li>
              <li>享受个性化的智慧指导</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedChatTestPage; 
import { apiService } from '../services/apiService';

const PersonalizedChatTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testPersonalizedChat = async () => {
    setIsLoading(true);
    try {
      // 测试八字计算
      const baziResponse = await apiService.calculateBazi({
        birthdate: '1990-01-01T12:00',
        name: '测试用户',
        gender: 'male'
      });

      // 测试今日运势
      const fortuneResponse = await apiService.calculateDailyFortune({
        birthdate: '1990-01-01T12:00',
        name: '测试用户',
        gender: 'male'
      });

      setTestResults({
        bazi: baziResponse.data,
        fortune: fortuneResponse.data,
        success: true
      });
    } catch (error) {
      setTestResults({
        error: error instanceof Error ? error.message : '未知错误',
        success: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="zen-page">
      <div className="zen-header">
        <h1 className="zen-title">个性化聊天功能测试</h1>
        <p className="zen-subtitle">
          测试八字计算和今日运势API，验证个性化聊天功能
        </p>
      </div>

      <div className="zen-container">
        <div className="zen-card texture-paper">
          <h3 className="zen-subtitle">API测试</h3>
          <button
            onClick={testPersonalizedChat}
            disabled={isLoading}
            className="zen-button hover-lift"
            style={{
              padding: 'var(--space-verse) var(--space-stanza)',
              background: 'var(--gradient-sunrise)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-moon)',
              fontSize: 'var(--text-base)',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              marginBottom: 'var(--space-stanza)'
            }}
          >
            {isLoading ? '测试中...' : '开始测试'}
          </button>

          {testResults && (
            <div style={{ marginTop: 'var(--space-stanza)' }}>
              {testResults.success ? (
                <div>
                  <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-verse)' }}>
                    ✅ 测试成功
                  </h4>
                  
                  {/* 八字信息 */}
                  <div style={{ marginBottom: 'var(--space-stanza)' }}>
                    <h5 style={{ color: 'var(--ink-thick)', marginBottom: 'var(--space-breath)' }}>
                      八字信息
                    </h5>
                    <div style={{ 
                      padding: 'var(--space-verse)', 
                      background: 'var(--paper-modern)', 
                      borderRadius: 'var(--radius-pebble)',
                      fontSize: 'var(--text-small)',
                      lineHeight: 'var(--leading-relaxed)'
                    }}>
                      <div>年柱：{testResults.bazi.bazi_chart.year_pillar.stem}{testResults.bazi.bazi_chart.year_pillar.branch}</div>
                      <div>月柱：{testResults.bazi.bazi_chart.month_pillar.stem}{testResults.bazi.bazi_chart.month_pillar.branch}</div>
                      <div>日柱：{testResults.bazi.bazi_chart.day_pillar.stem}{testResults.bazi.bazi_chart.day_pillar.branch}</div>
                      <div>时柱：{testResults.bazi.bazi_chart.hour_pillar.stem}{testResults.bazi.bazi_chart.hour_pillar.branch}</div>
                      <div>日主：{testResults.bazi.bazi_chart.day_master}</div>
                    </div>
                  </div>

                  {/* 今日运势 */}
                  <div style={{ marginBottom: 'var(--space-stanza)' }}>
                    <h5 style={{ color: 'var(--ink-thick)', marginBottom: 'var(--space-breath)' }}>
                      今日运势
                    </h5>
                    <div style={{ 
                      padding: 'var(--space-verse)', 
                      background: 'var(--paper-modern)', 
                      borderRadius: 'var(--radius-pebble)',
                      fontSize: 'var(--text-small)',
                      lineHeight: 'var(--leading-relaxed)'
                    }}>
                      <div>综合评分：{testResults.fortune.overall_score}分</div>
                      <div>运势等级：{testResults.fortune.overall_level}</div>
                      <div>运势描述：{testResults.fortune.overall_description}</div>
                      <div>吉利颜色：{testResults.fortune.lucky_colors.join('、')}</div>
                      <div>吉利方位：{testResults.fortune.lucky_directions.join('、')}</div>
                    </div>
                  </div>

                  {/* 测试建议 */}
                  <div style={{ 
                    padding: 'var(--space-verse)', 
                    background: 'var(--gradient-water)', 
                    borderRadius: 'var(--radius-pebble)',
                    border: '1px solid var(--earth-golden)40'
                  }}>
                    <h5 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
                      🎯 测试建议
                    </h5>
                    <ul style={{ 
                      margin: 0, 
                      paddingLeft: 'var(--space-verse)',
                      fontSize: 'var(--text-small)',
                      color: 'var(--ink-medium)'
                    }}>
                      <li>API连接正常，可以获取用户八字信息</li>
                      <li>今日运势计算功能正常</li>
                      <li>可以进入个性化聊天页面进行测试</li>
                      <li>建议使用真实用户信息进行完整测试</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  padding: 'var(--space-verse)', 
                  background: 'var(--fire-phoenix)10', 
                  borderRadius: 'var(--radius-pebble)',
                  border: '1px solid var(--fire-phoenix)40',
                  color: 'var(--fire-phoenix)'
                }}>
                  <h4 style={{ marginBottom: 'var(--space-breath)' }}>❌ 测试失败</h4>
                  <div>错误信息：{testResults.error}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="zen-card texture-silk">
          <h3 className="zen-subtitle">功能说明</h3>
          <div style={{ fontSize: 'var(--text-small)', lineHeight: 'var(--leading-relaxed)' }}>
            <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)' }}>
              🎯 个性化聊天功能
            </h4>
            <ul style={{ paddingLeft: 'var(--space-verse)' }}>
              <li>基于用户八字信息进行个性化对话</li>
              <li>结合今日运势提供精准建议</li>
              <li>根据用户情感状态调整回复风格</li>
              <li>提供吉利信息和活动建议</li>
              <li>支持多种神仙角色选择</li>
            </ul>

            <h4 style={{ color: 'var(--earth-golden)', marginBottom: 'var(--space-breath)', marginTop: 'var(--space-stanza)' }}>
              🚀 使用方法
            </h4>
            <ol style={{ paddingLeft: 'var(--space-verse)' }}>
              <li>点击导航中的"个性化对话"</li>
              <li>填写个人基本信息（姓名、出生日期、性别）</li>
              <li>系统自动计算八字和今日运势</li>
              <li>选择喜欢的神仙进行对话</li>
              <li>享受个性化的智慧指导</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedChatTestPage; 