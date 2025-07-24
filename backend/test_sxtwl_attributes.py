#!/usr/bin/env python3
"""
测试day_info对象的属性值
"""

import sxtwl

def test_day_info_attributes():
    """测试day_info对象的属性值"""
    print("🔍 测试day_info对象属性值...")
    
    try:
        lunar = sxtwl.Lunar()
        day_info = lunar.getDayBySolar(2024, 1, 1)
        
        print("📋 day_info属性值:")
        for attr in dir(day_info):
            if not attr.startswith('_'):
                try:
                    value = getattr(day_info, attr)
                    print(f"  - {attr}: {value}")
                except Exception as e:
                    print(f"  - {attr}: 无法获取值 ({e})")
        
        print("\n🔧 特别关注干支相关属性:")
        gan_zhi_attrs = ['cur_cn', 'cur_dz', 'cur_mz', 'cur_xz', 'cur_xs']
        for attr in gan_zhi_attrs:
            if hasattr(day_info, attr):
                try:
                    value = getattr(day_info, attr)
                    print(f"  - {attr}: {value}")
                except Exception as e:
                    print(f"  - {attr}: 无法获取值 ({e})")
        
        # 尝试使用getShiGz方法
        print("\n🔧 测试getShiGz方法:")
        try:
            shi_gz = lunar.getShiGz(day_info, 12)  # 12点
            print(f"✅ getShiGz(): {shi_gz}")
        except Exception as e:
            print(f"❌ getShiGz() 失败: {e}")
        
    except Exception as e:
        print(f"❌ 测试失败: {e}")

if __name__ == "__main__":
    test_day_info_attributes() 