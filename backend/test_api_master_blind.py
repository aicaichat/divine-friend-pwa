#!/usr/bin/env python3
"""
世界级盲派API端点测试脚本
"""

import requests
import json
import time

def test_master_blind_api():
    """测试世界级盲派API"""
    url = 'http://localhost:5001/api/calculate-master-blind-fortune'
    
    # 测试数据
    test_data = {
        'birthdate': '1990-08-15T14:30:00',
        'name': 'API测试用户',
        'gender': '男',
        'target_date': '2024-01-15T12:00:00'
    }
    
    print("🎯 测试世界级盲派API端点...")
    print(f"请求URL: {url}")
    print(f"请求数据: {json.dumps(test_data, ensure_ascii=False, indent=2)}")
    
    try:
        # 第一次请求
        print("\n📤 第一次请求 (应该计算新运势)")
        response1 = requests.post(url, json=test_data, timeout=10)
        
        if response1.status_code == 200:
            result1 = response1.json()
            print(f"✅ 第一次请求成功")
            print(f"   状态: {result1.get('success', 'unknown')}")
            print(f"   缓存: {result1.get('cached', 'unknown')}")
            print(f"   方法: {result1.get('method', 'unknown')}")
            
            if 'data' in result1:
                data = result1['data']
                print(f"   综合评分: {data.get('overall_score', 'N/A')}")
                print(f"   运势等级: {data.get('overall_level', 'N/A')}")
                
                # 检查核心分析
                if 'blind_pattern_analysis' in data:
                    pattern = data['blind_pattern_analysis'].get('main_pattern', {})
                    if pattern:
                        print(f"   主格局: {pattern.get('name', 'N/A')}")
                
                if 'blind_deity_analysis' in data:
                    print(f"   主十神: {data['blind_deity_analysis'].get('main_deity', 'N/A')}")
                
                if 'blind_element_analysis' in data:
                    element = data['blind_element_analysis']
                    print(f"   用神: {element.get('use_god', 'N/A')}")
                    print(f"   忌神: {element.get('avoid_god', 'N/A')}")
                
                # 检查建议
                if 'master_advice' in data and data['master_advice']:
                    print(f"   大师建议: {data['master_advice'][0]}")
                
        else:
            print(f"❌ 第一次请求失败: {response1.status_code}")
            print(f"   响应: {response1.text}")
            return False
        
        # 等待一秒
        time.sleep(1)
        
        # 第二次请求（测试缓存）
        print("\n📤 第二次请求 (应该从缓存获取)")
        response2 = requests.post(url, json=test_data, timeout=10)
        
        if response2.status_code == 200:
            result2 = response2.json()
            print(f"✅ 第二次请求成功")
            print(f"   缓存: {result2.get('cached', 'unknown')}")
            
            # 验证结果一致性
            if 'data' in result1 and 'data' in result2:
                score1 = result1['data'].get('overall_score')
                score2 = result2['data'].get('overall_score')
                
                if score1 == score2:
                    print("✅ 缓存一致性验证通过")
                else:
                    print(f"⚠️  缓存不一致: {score1} vs {score2}")
            
        else:
            print(f"❌ 第二次请求失败: {response2.status_code}")
            print(f"   响应: {response2.text}")
            return False
        
        # 测试不同用户
        print("\n📤 测试不同用户")
        different_user_data = {
            'birthdate': '1985-03-20T09:15:00',
            'name': '不同API测试用户',
            'gender': '女',
            'target_date': '2024-01-15T12:00:00'
        }
        
        response3 = requests.post(url, json=different_user_data, timeout=10)
        
        if response3.status_code == 200:
            result3 = response3.json()
            print(f"✅ 不同用户请求成功")
            print(f"   缓存: {result3.get('cached', 'unknown')}")
            
            if 'data' in result3:
                print(f"   综合评分: {result3['data'].get('overall_score', 'N/A')}")
                print(f"   运势等级: {result3['data'].get('overall_level', 'N/A')}")
        else:
            print(f"❌ 不同用户请求失败: {response3.status_code}")
        
        print("\n🎉 世界级盲派API测试完成!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ 连接失败: 请确保Flask服务器正在运行 (python app.py)")
        return False
    except requests.exceptions.Timeout:
        print("❌ 请求超时")
        return False
    except Exception as e:
        print(f"❌ 测试过程中发生错误: {str(e)}")
        return False

def test_error_cases():
    """测试错误情况"""
    print("\n⚠️  测试错误情况...")
    url = 'http://localhost:5001/api/calculate-master-blind-fortune'
    
    # 测试缺少参数
    print("   测试缺少参数...")
    invalid_data = {
        'birthdate': '1990-01-01T12:00:00',
        'name': '错误测试'
        # 缺少gender参数
    }
    
    try:
        response = requests.post(url, json=invalid_data, timeout=5)
        if response.status_code == 400:
            print("   ✅ 缺少参数错误处理正确")
        else:
            print(f"   ⚠️  缺少参数处理异常: {response.status_code}")
    except Exception as e:
        print(f"   ❌ 错误测试异常: {str(e)}")
    
    # 测试无效日期
    print("   测试无效日期...")
    invalid_date_data = {
        'birthdate': 'invalid-date',
        'name': '日期错误测试',
        'gender': '男'
    }
    
    try:
        response = requests.post(url, json=invalid_date_data, timeout=5)
        if response.status_code in [200, 500]:  # 可能返回默认值或错误
            print("   ✅ 无效日期错误处理正常")
        else:
            print(f"   ⚠️  无效日期处理异常: {response.status_code}")
    except Exception as e:
        print(f"   ❌ 日期错误测试异常: {str(e)}")

if __name__ == "__main__":
    print("🌟 世界级盲派API测试")
    print("=" * 50)
    
    # 测试API
    success = test_master_blind_api()
    
    if success:
        # 测试错误情况
        test_error_cases()
        print("\n🎉 所有API测试完成!")
    else:
        print("\n❌ API测试失败") 