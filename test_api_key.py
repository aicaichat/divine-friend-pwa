#!/usr/bin/env python3
"""
DeepSeek API密钥测试脚本
"""

import requests
import json
import sys

def test_deepseek_api(api_key):
    """测试DeepSeek API连接"""
    
    url = "https://api.deepseek.com/v1/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    data = {
        "model": "deepseek-chat",
        "messages": [
            {
                "role": "system",
                "content": "你是观音菩萨，大慈大悲救苦救难的菩萨。请用慈悲的语气回复用户。"
            },
            {
                "role": "user",
                "content": "你好，请给我一些人生建议"
            }
        ],
        "max_tokens": 200,
        "temperature": 0.7,
        "top_p": 0.9,
        "stream": False
    }
    
    try:
        print("🔍 正在测试DeepSeek API连接...")
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            print("✅ API连接成功！")
            print(f"📝 回复内容: {content}")
            return True
        else:
            print(f"❌ API连接失败，状态码: {response.status_code}")
            print(f"错误信息: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 网络请求错误: {e}")
        return False
    except Exception as e:
        print(f"❌ 未知错误: {e}")
        return False

def main():
    # 使用您提供的API密钥
    api_key = "sk-dc146c694369404abbc1eb7bac2eb41d"
    
    print("🚀 DeepSeek API密钥测试")
    print("=" * 50)
    print(f"🔑 API密钥: {api_key[:10]}...{api_key[-4:]}")
    print()
    
    success = test_deepseek_api(api_key)
    
    print()
    print("=" * 50)
    if success:
        print("🎉 测试成功！您的API密钥有效，可以正常使用。")
        print("💡 现在您可以访问以下页面进行完整测试：")
        print("   - http://localhost:5173/#?page=api-test")
        print("   - http://localhost:5173/#?page=free-chat")
    else:
        print("⚠️  测试失败！请检查API密钥是否正确。")
        print("💡 请确保：")
        print("   - API密钥格式正确")
        print("   - 账户有足够的API调用额度")
        print("   - 网络连接正常")

if __name__ == "__main__":
    main() 
"""
DeepSeek API密钥测试脚本
"""

import requests
import json
import sys

def test_deepseek_api(api_key):
    """测试DeepSeek API连接"""
    
    url = "https://api.deepseek.com/v1/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    data = {
        "model": "deepseek-chat",
        "messages": [
            {
                "role": "system",
                "content": "你是观音菩萨，大慈大悲救苦救难的菩萨。请用慈悲的语气回复用户。"
            },
            {
                "role": "user",
                "content": "你好，请给我一些人生建议"
            }
        ],
        "max_tokens": 200,
        "temperature": 0.7,
        "top_p": 0.9,
        "stream": False
    }
    
    try:
        print("🔍 正在测试DeepSeek API连接...")
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            print("✅ API连接成功！")
            print(f"📝 回复内容: {content}")
            return True
        else:
            print(f"❌ API连接失败，状态码: {response.status_code}")
            print(f"错误信息: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 网络请求错误: {e}")
        return False
    except Exception as e:
        print(f"❌ 未知错误: {e}")
        return False

def main():
    # 使用您提供的API密钥
    api_key = "sk-dc146c694369404abbc1eb7bac2eb41d"
    
    print("🚀 DeepSeek API密钥测试")
    print("=" * 50)
    print(f"🔑 API密钥: {api_key[:10]}...{api_key[-4:]}")
    print()
    
    success = test_deepseek_api(api_key)
    
    print()
    print("=" * 50)
    if success:
        print("🎉 测试成功！您的API密钥有效，可以正常使用。")
        print("💡 现在您可以访问以下页面进行完整测试：")
        print("   - http://localhost:5173/#?page=api-test")
        print("   - http://localhost:5173/#?page=free-chat")
    else:
        print("⚠️  测试失败！请检查API密钥是否正确。")
        print("💡 请确保：")
        print("   - API密钥格式正确")
        print("   - 账户有足够的API调用额度")
        print("   - 网络连接正常")

if __name__ == "__main__":
    main() 