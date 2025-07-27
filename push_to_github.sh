#!/bin/bash

# Divine Friend PWA GitHub推送脚本
# 用户名: aicaichat
# 仓库名: divine-friend-pwa

echo "🚀 开始推送Divine Friend PWA到GitHub..."

# 检查Git状态
echo "📋 检查Git状态..."
git status

# 添加远程仓库
echo "🔗 添加远程仓库..."
git remote add origin https://github.com/aicaichat/divine-friend-pwa.git

# 验证远程仓库
echo "✅ 验证远程仓库配置..."
git remote -v

# 推送代码
echo "📤 推送代码到GitHub..."
git push -u origin main

# 检查推送结果
if [ $? -eq 0 ]; then
    echo "🎉 代码推送成功!"
    echo "📖 仓库地址: https://github.com/aicaichat/divine-friend-pwa"
    echo "🔗 克隆地址: git clone https://github.com/aicaichat/divine-friend-pwa.git"
else
    echo "❌ 推送失败，请检查:"
    echo "1. GitHub仓库是否已创建"
    echo "2. 网络连接是否正常"
    echo "3. GitHub认证是否正确"
fi
