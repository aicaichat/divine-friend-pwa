#!/usr/bin/env python3
"""
缓存功能测试脚本
"""

import requests
import json
import time

def test_cache_functionality():
    """测试缓存功能"""
    url = 'http://localhost:5001/api/calculate-daily-fortune'
    data = {
        'birthdate': '1990-01-01T12:00:00',
        'name': '测试用户',
        'gender': '男',
        'target_date': '2024-01-15'
    }
    
    print("🧪 开始测试盲派运势缓存功能...")
    
    # 第一次请求
    print("\n📤 第一次请求 (应该计算新运势)")
    response1 = requests.post(url, json=data)
    if response1.status_code == 200:
        result1 = response1.json()
        print(f"✅ 第一次请求成功")
        print(f"   缓存状态: {result1.get('cached', 'unknown')}")
        print(f"   综合评分: {result1['data']['overall_score']}")
        print(f"   运势等级: {result1['data']['overall_level']}")
        print(f"   主要格局: {result1['data']['pattern_analysis']['main_pattern']}")
    else:
        print(f"❌ 第一次请求失败: {response1.status_code}")
        return
    
    # 等待一秒
    time.sleep(1)
    
    # 第二次请求
    print("\n📤 第二次请求 (应该从缓存获取)")
    response2 = requests.post(url, json=data)
    if response2.status_code == 200:
        result2 = response2.json()
        print(f"✅ 第二次请求成功")
        print(f"   缓存状态: {result2.get('cached', 'unknown')}")
        print(f"   综合评分: {result2['data']['overall_score']}")
        print(f"   运势等级: {result2['data']['overall_level']}")
        print(f"   主要格局: {result2['data']['pattern_analysis']['main_pattern']}")
        
        # 验证结果一致性
        if (result1['data']['overall_score'] == result2['data']['overall_score'] and
            result1['data']['overall_level'] == result2['data']['overall_level']):
            print("✅ 结果一致性验证通过")
        else:
            print("❌ 结果一致性验证失败")
    else:
        print(f"❌ 第二次请求失败: {response2.status_code}")
        return
    
    # 测试不同用户
    print("\n📤 测试不同用户 (应该计算新运势)")
    data_different_user = {
        'birthdate': '1985-06-15T08:30:00',
        'name': '不同用户',
        'gender': '女',
        'target_date': '2024-01-15'
    }
    
    response3 = requests.post(url, json=data_different_user)
    if response3.status_code == 200:
        result3 = response3.json()
        print(f"✅ 不同用户请求成功")
        print(f"   缓存状态: {result3.get('cached', 'unknown')}")
        print(f"   综合评分: {result3['data']['overall_score']}")
        print(f"   运势等级: {result3['data']['overall_level']}")
        print(f"   主要格局: {result3['data']['pattern_analysis']['main_pattern']}")
    else:
        print(f"❌ 不同用户请求失败: {response3.status_code}")
    
    print("\n🎯 缓存功能测试完成!")

if __name__ == "__main__":
    test_cache_functionality() 