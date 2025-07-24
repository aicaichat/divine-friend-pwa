#!/usr/bin/env python3
"""
测试依赖安装脚本
"""

def test_imports():
    """测试所有关键依赖的导入"""
    try:
        import sxtwl
        print("✅ sxtwl 导入成功")
    except ImportError as e:
        print(f"❌ sxtwl 导入失败: {e}")
        return False
    
    try:
        import flask
        print("✅ Flask 导入成功")
    except ImportError as e:
        print(f"❌ Flask 导入失败: {e}")
        return False
    
    try:
        import pandas
        print("✅ pandas 导入成功")
    except ImportError as e:
        print(f"❌ pandas 导入失败: {e}")
        return False
    
    try:
        from bidict import bidict
        print("✅ bidict 导入成功")
    except ImportError as e:
        print(f"❌ bidict 导入失败: {e}")
        return False
    
    try:
        import requests
        print("✅ requests 导入成功")
    except ImportError as e:
        print(f"❌ requests 导入失败: {e}")
        return False
    
    return True

def test_sxtwl_functionality():
    """测试sxtwl库的基本功能"""
    try:
        import sxtwl
        
        # 测试基本功能
        lunar = sxtwl.Lunar()
        day = lunar.getDayBySolar(2024, 1, 1)
        
        print("✅ sxtwl 基本功能测试通过")
        return True
    except Exception as e:
        print(f"❌ sxtwl 功能测试失败: {e}")
        return False

if __name__ == "__main__":
    print("🔍 开始测试依赖...")
    
    imports_ok = test_imports()
    sxtwl_ok = test_sxtwl_functionality()
    
    if imports_ok and sxtwl_ok:
        print("🎉 所有依赖测试通过！")
        exit(0)
    else:
        print("❌ 依赖测试失败！")
        exit(1) 