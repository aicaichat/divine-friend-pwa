#!/usr/bin/env python3
"""
应用启动脚本
"""

import subprocess
import sys
import os

def test_dependencies():
    """测试依赖"""
    print("🔍 开始测试依赖...")
    try:
        result = subprocess.run([sys.executable, "test_dependencies.py"], 
                              capture_output=True, text=True)
        print(result.stdout)
        if result.returncode == 0:
            print("✅ 依赖测试通过！")
            return True
        else:
            print("❌ 依赖测试失败！")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ 依赖测试异常: {e}")
        return False

def start_app():
    """启动Flask应用"""
    print("🚀 启动Flask应用...")
    try:
        # 启动Flask应用
        os.execv(sys.executable, [sys.executable, "app.py"])
    except Exception as e:
        print(f"❌ 启动应用失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # 先测试依赖
    if test_dependencies():
        # 依赖测试通过，启动应用
        start_app()
    else:
        # 依赖测试失败，但仍然尝试启动应用
        print("⚠️ 依赖测试失败，但仍尝试启动应用...")
        start_app() 