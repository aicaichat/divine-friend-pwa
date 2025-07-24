#!/usr/bin/env python3
"""
简单的八字计算测试
"""

import sxtwl
from datetime import datetime

def test_bazi_simple():
    """简单的八字计算测试"""
    print("🔍 简单八字计算测试...")
    
    try:
        # 解析出生信息
        birthdate = "1990-01-01T12:00"
        datetime_obj = datetime.strptime(birthdate, '%Y-%m-%dT%H:%M')
        
        year = datetime_obj.year
        month = datetime_obj.month
        day = datetime_obj.day
        hour = datetime_obj.hour
        
        print(f"📅 出生时间: {year}年{month}月{day}日{hour}时")
        
        # 计算四柱
        lunar = sxtwl.Lunar()
        day_info = lunar.getDayBySolar(year, month, day)
        
        print("✅ 获取日信息成功")
        
        # 获取年月日干支
        yTG = day_info.Lyear2
        mTG = day_info.Lmonth2
        dTG = day_info.Lday2
        
        print(f"✅ 年柱: tg={yTG.tg}, dz={yTG.dz}")
        print(f"✅ 月柱: tg={mTG.tg}, dz={mTG.dz}")
        print(f"✅ 日柱: tg={dTG.tg}, dz={dTG.dz}")
        
        # 获取时柱干支
        try:
            gz = lunar.getShiGz(day_info, int(hour))
            print(f"✅ 时柱: tg={gz.tg}, dz={gz.dz}")
        except Exception as e:
            print(f"❌ 时柱获取失败: {e}")
            gz = dTG  # 使用日柱作为时柱的默认值
            print(f"⚠️ 使用日柱作为时柱: tg={gz.tg}, dz={gz.dz}")
        
        # 天干地支数组
        Gan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
        Zhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
        
        # 构建天干地支
        year_gan = Gan[yTG.tg]
        year_zhi = Zhi[yTG.dz]
        month_gan = Gan[mTG.tg]
        month_zhi = Zhi[mTG.dz]
        day_gan = Gan[dTG.tg]
        day_zhi = Zhi[dTG.dz]
        hour_gan = Gan[gz.tg]
        hour_zhi = Zhi[gz.dz]
        
        print(f"🎯 八字: {year_gan}{year_zhi} {month_gan}{month_zhi} {day_gan}{day_zhi} {hour_gan}{hour_zhi}")
        
        return True
        
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_bazi_simple() 