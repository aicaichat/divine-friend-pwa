#!/usr/bin/env python3
"""
测试sxtwl API
"""

import sxtwl

def test_sxtwl_api():
    """测试sxtwl的API"""
    print("🔍 测试sxtwl API...")
    
    # 检查可用的属性和方法
    print("📋 sxtwl模块属性:")
    for attr in dir(sxtwl):
        if not attr.startswith('_'):
            print(f"  - {attr}")
    
    # 尝试不同的API调用方式
    try:
        # 方式1: 直接调用
        print("\n🔧 测试方式1: sxtwl.fromSolar()")
        day_info = sxtwl.fromSolar(2024, 1, 1)
        print("✅ fromSolar() 可用")
    except Exception as e:
        print(f"❌ fromSolar() 失败: {e}")
    
    try:
        # 方式2: 使用Lunar类
        print("\n🔧 测试方式2: sxtwl.Lunar()")
        lunar = sxtwl.Lunar()
        day_info = lunar.getDayBySolar(2024, 1, 1)
        print("✅ Lunar.getDayBySolar() 可用")
    except Exception as e:
        print(f"❌ Lunar.getDayBySolar() 失败: {e}")
    
    try:
        # 方式3: 检查其他可能的API
        print("\n🔧 测试方式3: 其他API")
        if hasattr(sxtwl, 'Lunar'):
            lunar = sxtwl.Lunar()
            print("✅ Lunar类可用")
            
            # 测试获取干支
            if hasattr(day_info, 'getYearGZ'):
                year_gz = day_info.getYearGZ()
                print(f"✅ getYearGZ() 可用: {year_gz}")
            else:
                print("❌ getYearGZ() 不可用")
        else:
            print("❌ Lunar类不可用")
    except Exception as e:
        print(f"❌ 其他API测试失败: {e}")

if __name__ == "__main__":
    test_sxtwl_api() 