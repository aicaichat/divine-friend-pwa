#!/usr/bin/env python3
"""
详细测试sxtwl API
"""

import sxtwl

def test_sxtwl_detailed():
    """详细测试sxtwl的API"""
    print("🔍 详细测试sxtwl API...")
    
    try:
        lunar = sxtwl.Lunar()
        day_info = lunar.getDayBySolar(2024, 1, 1)
        
        print("📋 Lunar类方法:")
        for method in dir(lunar):
            if not method.startswith('_'):
                print(f"  - {method}")
        
        print("\n📋 day_info对象属性:")
        for attr in dir(day_info):
            if not attr.startswith('_'):
                print(f"  - {attr}")
        
        print("\n🔧 测试获取干支:")
        try:
            year_gz = lunar.getYearGZ(day_info)
            print(f"✅ getYearGZ(): {year_gz}")
        except Exception as e:
            print(f"❌ getYearGZ() 失败: {e}")
        
        try:
            month_gz = lunar.getMonthGZ(day_info)
            print(f"✅ getMonthGZ(): {month_gz}")
        except Exception as e:
            print(f"❌ getMonthGZ() 失败: {e}")
        
        try:
            day_gz = lunar.getDayGZ(day_info)
            print(f"✅ getDayGZ(): {day_gz}")
        except Exception as e:
            print(f"❌ getDayGZ() 失败: {e}")
        
        try:
            hour_gz = lunar.getHourGZ(day_info, 12)
            print(f"✅ getHourGZ(): {hour_gz}")
        except Exception as e:
            print(f"❌ getHourGZ() 失败: {e}")
        
        # 尝试其他可能的方法名
        possible_hour_methods = ['getHourGZ', 'getHourGanZhi', 'getHourGZ', 'getHour']
        for method_name in possible_hour_methods:
            if hasattr(lunar, method_name):
                try:
                    if method_name == 'getHourGZ':
                        result = lunar.getHourGZ(day_info, 12)
                    else:
                        result = getattr(lunar, method_name)(day_info, 12)
                    print(f"✅ {method_name}(): {result}")
                except Exception as e:
                    print(f"❌ {method_name}() 失败: {e}")
        
    except Exception as e:
        print(f"❌ 测试失败: {e}")

if __name__ == "__main__":
    test_sxtwl_detailed() 