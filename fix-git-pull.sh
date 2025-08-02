#!/bin/bash

# 修复Git pull冲突脚本
# 解决服务器上未跟踪文件与远程代码冲突的问题

echo "🔧 修复Git pull冲突"
echo "==================="

# 检查冲突文件
echo "检查冲突文件..."
if [ -f "deploy-minimal.sh" ]; then
    echo "发现冲突文件: deploy-minimal.sh"
    
    # 备份现有文件
    if [ -s "deploy-minimal.sh" ]; then
        echo "备份现有文件为 deploy-minimal.sh.local"
        cp deploy-minimal.sh deploy-minimal.sh.local
    fi
    
    # 删除冲突文件
    echo "删除冲突文件..."
    rm -f deploy-minimal.sh
else
    echo "未发现冲突文件"
fi

# 清理其他可能的冲突文件
echo "清理其他未跟踪文件..."
git clean -fd

# 重置工作区
echo "重置工作区..."
git reset --hard HEAD

# 执行git pull
echo "执行git pull..."
git pull

# 检查结果
if [ $? -eq 0 ]; then
    echo "✅ Git pull 成功完成！"
    echo ""
    echo "📁 可用的部署脚本:"
    ls -la *.sh 2>/dev/null || echo "未找到.sh脚本文件"
    echo ""
    echo "🚀 下一步操作:"
    echo "1. 检查服务状态: ./manage-services.sh status"
    echo "2. 配置域名SSL: sudo ./setup-domain-ssl.sh"
    echo "3. 重启服务: ./manage-services.sh restart"
else
    echo "❌ Git pull 失败，请检查网络连接或权限"
fi 