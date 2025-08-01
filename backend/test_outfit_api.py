#!/usr/bin/env python3
"""
AI智能穿衣推荐API测试脚本
"""

import requests
import json
from datetime import datetime

# API基础URL
BASE_URL = "http://localhost:5001"

def test_outfit_recommendations():
    """测试AI穿衣推荐API"""
    
    # 测试数据
    test_data = {
        "user_profile": {
            "birthdate": "1990-05-15T08:30:00",
            "name": "张三",
            "gender": "male",
            "birth_place": "北京市朝阳区"
        },
        "target_date": "2024-01-15",
        "preferences": {
            "occasion": ["business", "casual"],
            "season": "winter",
            "weather": {
                "temperature": 5,
                "condition": "sunny"
            },
            "style_preference": ["modern"],
            "color_preferences": ["prefer_blue"]
        },
        "constraints": {
            "budget_range": [100, 1000],
            "avoid_colors": ["red"]
        }
    }
    
    print("🤖 测试AI智能穿衣推荐API...")
    print(f"📋 请求数据: {json.dumps(test_data, indent=2, ensure_ascii=False)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/ai/outfit-recommendations",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\n📡 响应状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API调用成功!")
            print(f"📊 响应数据: {json.dumps(result, indent=2, ensure_ascii=False)}")
            
            # 解析推荐结果
            if result.get('success') and result.get('data'):
                data = result['data']
                ai_analysis = data.get('ai_analysis', {})
                recommendations = data.get('recommendations', [])
                
                print(f"\n🎯 AI分析结果:")
                print(f"   八字日主: {ai_analysis.get('bazi_summary', {}).get('day_master')}")
                print(f"   主要五行: {ai_analysis.get('bazi_summary', {}).get('main_element')}")
                print(f"   推荐理由: {ai_analysis.get('recommendation_reason')}")
                
                print(f"\n👔 穿衣推荐 ({len(recommendations)}个方案):")
                for i, rec in enumerate(recommendations, 1):
                    print(f"   {i}. {rec.get('theme')} (置信度: {rec.get('confidence')})")
                    
                    boost = rec.get('base_fortune_boost', {})
                    print(f"      💰财运: {boost.get('wealth', 0):+d} | "
                          f"🚀事业: {boost.get('career', 0):+d} | "
                          f"💕情感: {boost.get('love', 0):+d} | "
                          f"🌿健康: {boost.get('health', 0):+d}")
                    
                    outfit = rec.get('outfit_details', {})
                    print(f"      主色调: {', '.join(outfit.get('primary_colors', []))}")
                    print(f"      风格: {outfit.get('style')}")
                    print(f"      最佳时间: {rec.get('timing_advice', {}).get('best_wear_time')}")
                    print()
        else:
            print(f"❌ API调用失败: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ 连接失败: 请确保后端服务已启动 (python app.py)")
    except Exception as e:
        print(f"❌ 测试失败: {str(e)}")


def test_outfit_elements():
    """测试穿衣元素库API"""
    
    print("\n🎨 测试穿衣元素库API...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/ai/outfit-elements")
        
        print(f"📡 响应状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 元素库API调用成功!")
            
            if result.get('success') and result.get('data'):
                data = result['data']
                
                print(f"\n🌈 可用颜色:")
                for element, colors in data.get('colors', {}).items():
                    print(f"   {element}: {', '.join(colors)}")
                
                print(f"\n🧵 可用材质:")
                for element, materials in data.get('materials', {}).items():
                    print(f"   {element}: {', '.join(materials)}")
                
                print(f"\n👗 可用风格: {', '.join(data.get('styles', []))}")
                print(f"\n🎪 适用场合: {', '.join(data.get('occasions', []))}")
        else:
            print(f"❌ 元素库API调用失败: {response.text}")
            
    except Exception as e:
        print(f"❌ 元素库测试失败: {str(e)}")


def test_fortune_analysis():
    """测试运势分析API"""
    
    print("\n📊 测试运势分析API...")
    
    try:
        user_id = "test_user_123"
        target_date = datetime.now().strftime('%Y-%m-%d')
        
        response = requests.get(
            f"{BASE_URL}/api/ai/fortune-analysis/{user_id}?date={target_date}"
        )
        
        print(f"📡 响应状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 运势分析API调用成功!")
            
            if result.get('success') and result.get('data'):
                data = result['data']
                bazi = data.get('bazi_summary', {})
                fortune = data.get('daily_fortune', {})
                
                print(f"\n🔮 八字分析:")
                print(f"   日主: {bazi.get('day_master')}")
                print(f"   主要五行: {bazi.get('main_element')}")
                print(f"   喜用五行: {', '.join(bazi.get('favorable_elements', []))}")
                print(f"   忌讳五行: {', '.join(bazi.get('avoid_elements', []))}")
                
                print(f"\n📈 今日运势:")
                print(f"   综合: {fortune.get('overall_score')}分")
                print(f"   财运: {fortune.get('wealth_fortune')}分")
                print(f"   事业: {fortune.get('career_fortune')}分")
                print(f"   情感: {fortune.get('love_fortune')}分")
                print(f"   健康: {fortune.get('health_fortune')}分")
        else:
            print(f"❌ 运势分析API调用失败: {response.text}")
            
    except Exception as e:
        print(f"❌ 运势分析测试失败: {str(e)}")


def test_api_health():
    """测试API健康状态"""
    
    print("🏥 测试API健康状态...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 后端服务健康: {result.get('service')}")
            print(f"   状态: {result.get('status')}")
            print(f"   时间: {result.get('timestamp')}")
        else:
            print(f"❌ 健康检查失败: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到后端服务，请检查服务是否已启动")
    except Exception as e:
        print(f"❌ 健康检查失败: {str(e)}")


if __name__ == "__main__":
    print("=" * 60)
    print("🚀 AI智能穿衣推荐系统API测试")
    print("=" * 60)
    
    # 1. 健康检查
    test_api_health()
    
    # 2. 测试穿衣元素库
    test_outfit_elements()
    
    # 3. 测试运势分析
    test_fortune_analysis()
    
    # 4. 测试AI穿衣推荐
    test_outfit_recommendations()
    
    print("\n" + "=" * 60)
    print("✨ 测试完成!")
    print("=" * 60) 