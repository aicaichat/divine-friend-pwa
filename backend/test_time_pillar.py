#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sxtwl
from datetime import datetime

def test_time_pillar_calculation():
    """测试时柱计算"""
    
    # 测试用例
    test_cases = [
        {"year": 1990, "month": 1, "day": 1, "hour": 12, "expected": "甲午"},
        {"year": 1990, "month": 1, "day": 1, "hour": 0, "expected": "甲子"},
        {"year": 1990, "month": 1, "day": 1, "hour": 6, "expected": "甲卯"},
        {"year": 1990, "month": 1, "day": 1, "hour": 18, "expected": "甲酉"},
    ]
    
    lunar = sxtwl.Lunar()
    
    for case in test_cases:
        year = case["year"]
        month = case["month"]
        day = case["day"]
        hour = case["hour"]
        expected = case["expected"]
        
        print(f"\n测试: {year}年{month}月{day}日{hour}时")
        print(f"期望时柱: {expected}")
        
        # 获取日信息
        day_info = lunar.getDayBySolar(year, month, day)
        
        # 获取日柱
        dTG = day_info.Lday2
        print(f"日柱: {dTG.tg}{dTG.dz}")
        
        # 获取时柱
        try:
            gz = lunar.getShiGz(day_info, hour)
            actual = f"{gz.tg}{gz.dz}"
            print(f"实际时柱: {actual}")
            
            if actual == expected:
                print("✅ 正确")
            else:
                print("❌ 错误")
                
        except Exception as e:
            print(f"❌ 计算失败: {e}")
        
        # 手动计算时柱
        try:
            # 根据日干计算时干
            day_stem_index = Gan.index(dTG.tg)
            hour_stem_index = (day_stem_index * 2 + hour // 2) % 10
            hour_stem = Gan[hour_stem_index]
            
            # 根据时辰计算时支
            hour_branch_index = (hour + 1) // 2 % 12
            hour_branch = Zhi[hour_branch_index]
            
            manual_result = f"{hour_stem}{hour_branch}"
            print(f"手动计算时柱: {manual_result}")
            
        except Exception as e:
            print(f"手动计算失败: {e}")

def test_hour_to_branch():
    """测试时辰到地支的转换"""
    print("\n=== 时辰到地支转换测试 ===")
    
    for hour in range(24):
        branch_index = (hour + 1) // 2 % 12
        branch = Zhi[branch_index]
        print(f"{hour:2d}时 -> {branch}")

def test_day_stem_to_hour_stem():
    """测试日干到时干的转换"""
    print("\n=== 日干到时干转换测试 ===")
    
    for day_stem in Gan:
        print(f"\n日干: {day_stem}")
        for hour in [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]:
            day_stem_index = Gan.index(day_stem)
            hour_stem_index = (day_stem_index * 2 + hour // 2) % 10
            hour_stem = Gan[hour_stem_index]
            print(f"  {hour:2d}时 -> {hour_stem}")

if __name__ == "__main__":
    # 导入必要的变量
    Gan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
    Zhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
    
    test_time_pillar_calculation()
    test_hour_to_branch()
    test_day_stem_to_hour_stem() 