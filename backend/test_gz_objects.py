#!/usr/bin/env python3
"""
测试GZ对象
"""

import sxtwl

def test_gz_objects():
    """测试GZ对象"""
    print("🔍 测试GZ对象...")
    
    try:
        lunar = sxtwl.Lunar()
        day_info = lunar.getDayBySolar(2024, 1, 1)
        
        print("📋 GZ对象属性:")
        gz_attrs = ['Lyear2', 'Lmonth2', 'Lday2']
        for attr in gz_attrs:
            if hasattr(day_info, attr):
                gz_obj = getattr(day_info, attr)
                print(f"\n🔧 {attr}:")
                print(f"  - 类型: {type(gz_obj)}")
                print(f"  - 值: {gz_obj}")
                
                # 检查GZ对象的属性
                if hasattr(gz_obj, '__dict__'):
                    print(f"  - 属性: {dir(gz_obj)}")
                
                # 尝试常见的属性名
                for prop in ['tg', 'dz', 'gan', 'zhi', 'tian_gan', 'di_zhi']:
                    if hasattr(gz_obj, prop):
                        value = getattr(gz_obj, prop)
                        print(f"  - {prop}: {value}")
        
        # 尝试获取时柱
        print("\n🔧 测试时柱:")
        try:
            # 尝试不同的参数类型
            shi_gz = lunar.getShiGz(day_info, 12)  # 整数
            print(f"✅ getShiGz(12): {shi_gz}")
        except Exception as e:
            print(f"❌ getShiGz(12) 失败: {e}")
            
        try:
            shi_gz = lunar.getShiGz(day_info, 12.0)  # 浮点数
            print(f"✅ getShiGz(12.0): {shi_gz}")
        except Exception as e:
            print(f"❌ getShiGz(12.0) 失败: {e}")
            
        try:
            shi_gz = lunar.getShiGz(day_info, int(12))  # 显式转换
            print(f"✅ getShiGz(int(12)): {shi_gz}")
        except Exception as e:
            print(f"❌ getShiGz(int(12)) 失败: {e}")
        
    except Exception as e:
        print(f"❌ 测试失败: {e}")

if __name__ == "__main__":
    test_gz_objects() 