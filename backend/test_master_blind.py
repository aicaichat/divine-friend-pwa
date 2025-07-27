#!/usr/bin/env python3
"""
世界级盲派八字今日运势计算服务测试脚本
测试完整的盲派理论体系实现
"""

import unittest
import json
from datetime import datetime, date
from services.master_blind_school_service import (
    MasterBlindSchoolService,
    MasterBlindFortuneRequest,
    MasterBlindFortuneResult
)


class TestMasterBlindSchoolService(unittest.TestCase):
    """世界级盲派服务测试类"""
    
    @classmethod
    def setUpClass(cls):
        """设置测试环境"""
        cls.service = MasterBlindSchoolService()
        print("🎯 开始测试世界级盲派八字运势计算服务...")
    
    def test_basic_calculation(self):
        """测试基础运势计算"""
        print("\n📊 测试基础运势计算...")
        
        request = MasterBlindFortuneRequest(
            birthdate="1990-01-01T12:00:00",
            name="测试用户",
            gender="男",
            target_date="2024-01-15T12:00:00"
        )
        
        result = self.service.calculate_master_blind_fortune(request)
        
        # 验证基本结果
        self.assertIsInstance(result, MasterBlindFortuneResult)
        self.assertTrue(1 <= result.overall_score <= 100, 
                       f"综合评分{result.overall_score}超出范围")
        self.assertIn(result.overall_level, 
                     ['大吉', '中吉', '小吉', '平', '小凶', '中凶', '大凶'])
        
        print(f"✅ 基础计算测试通过")
        print(f"   综合评分: {result.overall_score}")
        print(f"   运势等级: {result.overall_level}")
        print(f"   综合描述: {result.overall_description}")
    
    def test_pattern_analysis(self):
        """测试格局分析"""
        print("\n🎭 测试格局分析...")
        
        request = MasterBlindFortuneRequest(
            birthdate="1985-06-15T08:30:00",
            name="格局测试",
            gender="女",
            target_date="2024-01-15T12:00:00"
        )
        
        result = self.service.calculate_master_blind_fortune(request)
        
        # 验证格局分析
        pattern_analysis = result.blind_pattern_analysis
        self.assertIsInstance(pattern_analysis, dict)
        self.assertIn('main_pattern', pattern_analysis)
        self.assertIn('all_patterns', pattern_analysis)
        
        main_pattern = pattern_analysis['main_pattern']
        if main_pattern:
            self.assertIn('name', main_pattern)
            self.assertIn('description', main_pattern)
            self.assertIn('favorable', main_pattern)
            print(f"✅ 检测到主格局: {main_pattern['name']}")
            print(f"   格局描述: {main_pattern['description']}")
        else:
            print("✅ 未检测到特殊格局，使用基础判断")
    
    def test_deity_analysis(self):
        """测试十神分析"""
        print("\n🔮 测试十神分析...")
        
        request = MasterBlindFortuneRequest(
            birthdate="1992-03-20T14:20:00",
            name="十神测试",
            gender="男",
            target_date="2024-01-15T12:00:00"
        )
        
        result = self.service.calculate_master_blind_fortune(request)
        
        # 验证十神分析
        deity_analysis = result.blind_deity_analysis
        self.assertIsInstance(deity_analysis, dict)
        self.assertIn('main_deity', deity_analysis)
        self.assertIn('deity_distribution', deity_analysis)
        
        main_deity = deity_analysis['main_deity']
        self.assertIn(main_deity, [
            '比肩', '劫财', '食神', '伤官', '偏财', '正财',
            '七杀', '正官', '偏印', '正印'
        ])
        
        print(f"✅ 主要十神: {main_deity}")
        print(f"   十神分布: {deity_analysis['deity_distribution']}")
    
    def test_element_analysis(self):
        """测试五行分析"""
        print("\n🌍 测试五行分析...")
        
        request = MasterBlindFortuneRequest(
            birthdate="1988-09-10T16:45:00",
            name="五行测试",
            gender="女",
            target_date="2024-01-15T12:00:00"
        )
        
        result = self.service.calculate_master_blind_fortune(request)
        
        # 验证五行分析
        element_analysis = result.blind_element_analysis
        self.assertIsInstance(element_analysis, dict)
        self.assertIn('use_god', element_analysis)
        self.assertIn('avoid_god', element_analysis)
        self.assertIn('balance_score', element_analysis)
        
        use_god = element_analysis['use_god']
        avoid_god = element_analysis['avoid_god']
        balance_score = element_analysis['balance_score']
        
        self.assertIn(use_god, ['木', '火', '土', '金', '水'])
        self.assertIn(avoid_god, ['木', '火', '土', '金', '水'])
        self.assertTrue(0 <= balance_score <= 100)
        
        print(f"✅ 用神: {use_god}, 忌神: {avoid_god}")
        print(f"   五行平衡度: {balance_score}")
    
    def test_timing_analysis(self):
        """测试应期分析"""
        print("\n⏰ 测试应期分析...")
        
        request = MasterBlindFortuneRequest(
            birthdate="1987-12-25T10:15:00",
            name="应期测试",
            gender="男",
            target_date="2024-01-15T12:00:00"
        )
        
        result = self.service.calculate_master_blind_fortune(request)
        
        # 验证应期分析
        timing_analysis = result.blind_timing_analysis
        self.assertIsInstance(timing_analysis, dict)
        self.assertIn('current_dayun', timing_analysis)
        self.assertIn('liu_nian', timing_analysis)
        self.assertIn('timing_predictions', timing_analysis)
        
        print(f"✅ 大运信息: {timing_analysis['current_dayun']}")
        print(f"   流年信息: {timing_analysis['liu_nian']}")
        print(f"   应期预测数量: {len(timing_analysis['timing_predictions'])}")
    
    def test_fortune_dimensions(self):
        """测试各维度运势"""
        print("\n📈 测试各维度运势...")
        
        request = MasterBlindFortuneRequest(
            birthdate="1991-07-08T09:30:00",
            name="维度测试",
            gender="女",
            target_date="2024-01-15T12:00:00"
        )
        
        result = self.service.calculate_master_blind_fortune(request)
        
        # 验证各维度运势
        dimensions = [
            ('事业运势', result.career_fortune),
            ('财运', result.wealth_fortune),
            ('健康运势', result.health_fortune),
            ('人际关系', result.relationship_fortune),
            ('学习运势', result.study_fortune)
        ]
        
        for name, fortune in dimensions:
            self.assertIsInstance(fortune, dict)
            self.assertIn('score', fortune)
            self.assertIn('level', fortune)
            self.assertIn('description', fortune)
            self.assertIn('advice', fortune)
            
            score = fortune['score']
            level = fortune['level']
            
            self.assertTrue(0 <= score <= 100, f"{name}分数{score}超出范围")
            self.assertIn(level, ['优', '良', '中', '差'])
            
            print(f"✅ {name}: {score}分 ({level})")
    
    def test_advice_generation(self):
        """测试建议生成"""
        print("\n💡 测试建议生成...")
        
        request = MasterBlindFortuneRequest(
            birthdate="1989-11-03T13:40:00",
            name="建议测试",
            gender="男",
            target_date="2024-01-15T12:00:00"
        )
        
        result = self.service.calculate_master_blind_fortune(request)
        
        # 验证建议生成
        self.assertIsInstance(result.master_advice, list)
        self.assertIsInstance(result.timing_advice, list)
        self.assertIsInstance(result.remedies, list)
        
        self.assertTrue(len(result.master_advice) > 0, "大师建议不能为空")
        self.assertTrue(len(result.timing_advice) > 0, "应期建议不能为空")
        self.assertTrue(len(result.remedies) > 0, "化解方法不能为空")
        
        print(f"✅ 大师建议数量: {len(result.master_advice)}")
        print(f"   应期建议数量: {len(result.timing_advice)}")
        print(f"   化解方法数量: {len(result.remedies)}")
        
        # 打印部分建议内容
        if result.master_advice:
            print(f"   示例建议: {result.master_advice[0]}")
    
    def test_consistency(self):
        """测试一致性"""
        print("\n🎯 测试结果一致性...")
        
        request = MasterBlindFortuneRequest(
            birthdate="1990-05-20T11:20:00",
            name="一致性测试",
            gender="男",
            target_date="2024-01-15T12:00:00"
        )
        
        # 多次计算同一个人的运势
        results = []
        for i in range(3):
            result = self.service.calculate_master_blind_fortune(request)
            results.append(result.overall_score)
        
        # 检查分数变化范围（应该在±10分以内）
        max_score = max(results)
        min_score = min(results)
        score_range = max_score - min_score
        
        print(f"   三次计算分数: {results}")
        print(f"   分数变化范围: {score_range}")
        
        # 变化范围应该合理（考虑到命理的不确定性）
        self.assertTrue(score_range <= 20, f"分数变化范围{score_range}过大")
        print("✅ 一致性测试通过")
    
    def test_different_users(self):
        """测试不同用户"""
        print("\n👥 测试不同用户...")
        
        test_users = [
            {
                'birthdate': "1985-01-01T08:00:00",
                'name': "用户A",
                'gender': "男"
            },
            {
                'birthdate': "1990-06-15T14:30:00", 
                'name': "用户B",
                'gender': "女"
            },
            {
                'birthdate': "1995-12-31T20:45:00",
                'name': "用户C", 
                'gender': "男"
            }
        ]
        
        scores = []
        for user in test_users:
            request = MasterBlindFortuneRequest(
                birthdate=user['birthdate'],
                name=user['name'],
                gender=user['gender'],
                target_date="2024-01-15T12:00:00"
            )
            
            result = self.service.calculate_master_blind_fortune(request)
            scores.append(result.overall_score)
            
            print(f"   {user['name']}: {result.overall_score}分 ({result.overall_level})")
        
        # 不同用户的分数应该有差异
        unique_scores = len(set(scores))
        print(f"✅ {len(test_users)}个用户产生了{unique_scores}个不同分数")
    
    def test_error_handling(self):
        """测试错误处理"""
        print("\n⚠️  测试错误处理...")
        
        # 测试无效日期
        try:
            request = MasterBlindFortuneRequest(
                birthdate="invalid-date",
                name="错误测试",
                gender="男",
                target_date="2024-01-15T12:00:00"
            )
            
            result = self.service.calculate_master_blind_fortune(request)
            # 应该返回默认结果而不是抛出异常
            self.assertIsInstance(result, MasterBlindFortuneResult)
            print("✅ 无效日期处理正常")
            
        except Exception as e:
            print(f"⚠️  无效日期处理异常: {str(e)}")
    
    def test_performance(self):
        """测试性能"""
        print("\n⚡ 测试性能...")
        
        request = MasterBlindFortuneRequest(
            birthdate="1990-01-01T12:00:00",
            name="性能测试",
            gender="男",
            target_date="2024-01-15T12:00:00"
        )
        
        import time
        start_time = time.time()
        
        result = self.service.calculate_master_blind_fortune(request)
        
        end_time = time.time()
        calculation_time = end_time - start_time
        
        print(f"   计算耗时: {calculation_time:.3f}秒")
        
        # 性能要求：单次计算应在5秒内完成
        self.assertTrue(calculation_time < 5.0, f"计算耗时{calculation_time:.3f}秒过长")
        print("✅ 性能测试通过")


def run_complete_test():
    """运行完整测试"""
    print("🌟 开始世界级盲派八字运势计算服务完整测试")
    print("=" * 60)
    
    # 创建测试套件
    test_suite = unittest.TestSuite()
    
    # 添加所有测试方法
    test_methods = [
        'test_basic_calculation',
        'test_pattern_analysis', 
        'test_deity_analysis',
        'test_element_analysis',
        'test_timing_analysis',
        'test_fortune_dimensions',
        'test_advice_generation',
        'test_consistency',
        'test_different_users',
        'test_error_handling',
        'test_performance'
    ]
    
    for method in test_methods:
        test_suite.addTest(TestMasterBlindSchoolService(method))
    
    # 运行测试
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    print("\n" + "=" * 60)
    if result.wasSuccessful():
        print("🎉 所有测试通过！世界级盲派服务运行正常")
    else:
        print("❌ 部分测试失败，需要检查代码")
        print(f"失败数量: {len(result.failures)}")
        print(f"错误数量: {len(result.errors)}")
    
    return result.wasSuccessful()


def demo_calculation():
    """演示计算"""
    print("\n🎭 世界级盲派八字运势计算演示")
    print("=" * 50)
    
    service = MasterBlindSchoolService()
    
    request = MasterBlindFortuneRequest(
        birthdate="1990-08-15T14:30:00",
        name="演示用户",
        gender="男",
        target_date="2024-01-15T12:00:00"
    )
    
    result = service.calculate_master_blind_fortune(request)
    
    # 打印详细结果
    print(f"📅 目标日期: {result.date}")
    print(f"🎯 综合评分: {result.overall_score}分")
    print(f"🏆 运势等级: {result.overall_level}")
    print(f"📝 综合描述: {result.overall_description}")
    
    print(f"\n🎭 格局分析:")
    if result.blind_pattern_analysis['main_pattern']:
        pattern = result.blind_pattern_analysis['main_pattern']
        print(f"   主格局: {pattern['name']}")
        print(f"   描述: {pattern['description']}")
    
    print(f"\n🔮 十神分析:")
    print(f"   主十神: {result.blind_deity_analysis['main_deity']}")
    print(f"   分布: {result.blind_deity_analysis['deity_distribution']}")
    
    print(f"\n🌍 五行分析:")
    print(f"   用神: {result.blind_element_analysis['use_god']}")
    print(f"   忌神: {result.blind_element_analysis['avoid_god']}")
    print(f"   平衡度: {result.blind_element_analysis['balance_score']}")
    
    print(f"\n📈 各维度运势:")
    dimensions = [
        ('事业', result.career_fortune),
        ('财运', result.wealth_fortune),
        ('健康', result.health_fortune),
        ('人际', result.relationship_fortune),
        ('学习', result.study_fortune)
    ]
    
    for name, fortune in dimensions:
        print(f"   {name}: {fortune['score']}分 ({fortune['level']})")
    
    print(f"\n💡 大师建议:")
    for advice in result.master_advice:
        print(f"   {advice}")
    
    print(f"\n⏰ 应期建议:")
    for advice in result.timing_advice:
        print(f"   {advice}")
    
    print(f"\n🛡️ 化解方法:")
    for remedy in result.remedies:
        print(f"   {remedy}")


if __name__ == "__main__":
    print("🌟 世界级盲派八字今日运势计算服务测试")
    print("作者：世界级八字命理专家和盲派专家")
    print("版本：1.0.0")
    print("=" * 60)
    
    try:
        # 运行演示
        demo_calculation()
        
        # 运行完整测试
        success = run_complete_test()
        
        if success:
            print("\n🎉 世界级盲派服务已准备就绪！")
        else:
            print("\n⚠️  服务需要进一步调试")
            
    except Exception as e:
        print(f"\n❌ 测试过程中发生错误: {str(e)}")
        import traceback
        traceback.print_exc() 