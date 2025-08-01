#!/bin/bash

# Divine Friend PWA Git推送脚本
# 解决网络连接和认证问题

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Git状态
check_git_status() {
    log_info "检查Git状态..."
    
    if [ ! -d ".git" ]; then
        log_error "当前目录不是Git仓库"
        exit 1
    fi
    
    # 检查是否有未提交的更改
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "发现未提交的更改"
        git status --short
        return 1
    else
        log_success "工作目录干净"
        return 0
    fi
}

# 配置Git
setup_git() {
    log_info "配置Git..."
    
    # 检查远程仓库
    if ! git remote get-url origin > /dev/null 2>&1; then
        log_error "未配置远程仓库"
        exit 1
    fi
    
    # 显示当前远程配置
    log_info "当前远程仓库配置:"
    git remote -v
    
    # 询问用户选择推送方式
    echo ""
    echo "请选择推送方式:"
    echo "1. HTTPS (需要用户名和密码/Token)"
    echo "2. SSH (需要SSH密钥)"
    echo "3. 自动尝试 (先HTTPS，失败后SSH)"
    read -p "请输入选择 (1-3): " choice
    
    case $choice in
        1)
            setup_https_push
            ;;
        2)
            setup_ssh_push
            ;;
        3)
            setup_auto_push
            ;;
        *)
            log_error "无效选择"
            exit 1
            ;;
    esac
}

# 设置HTTPS推送
setup_https_push() {
    log_info "配置HTTPS推送..."
    
    # 检查是否已配置HTTPS
    if git remote get-url origin | grep -q "^https://"; then
        log_success "已配置HTTPS远程仓库"
    else
        log_info "切换到HTTPS远程仓库..."
        git remote set-url origin https://github.com/aicaichat/divine-friend-pwa.git
    fi
    
    log_info "准备推送..."
    log_warning "注意: 推送时可能需要输入GitHub用户名和密码/Token"
}

# 设置SSH推送
setup_ssh_push() {
    log_info "配置SSH推送..."
    
    # 检查SSH密钥
    if [ ! -f ~/.ssh/id_rsa ]; then
        log_error "未找到SSH密钥 (~/.ssh/id_rsa)"
        log_info "请先生成SSH密钥:"
        echo "ssh-keygen -t rsa -b 4096 -C 'your_email@example.com'"
        exit 1
    fi
    
    # 检查SSH密钥是否添加到GitHub
    log_info "检查SSH连接..."
    if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        log_success "SSH密钥配置正确"
    else
        log_warning "SSH密钥可能未添加到GitHub"
        log_info "请将公钥添加到GitHub:"
        echo "cat ~/.ssh/id_rsa.pub"
        echo "然后复制到 GitHub Settings > SSH and GPG keys"
    fi
    
    # 切换到SSH远程仓库
    git remote set-url origin git@github.com:aicaichat/divine-friend-pwa.git
    log_success "已配置SSH远程仓库"
}

# 设置自动推送
setup_auto_push() {
    log_info "配置自动推送..."
    
    # 先尝试HTTPS
    log_info "尝试HTTPS推送..."
    git remote set-url origin https://github.com/aicaichat/divine-friend-pwa.git
    
    if try_push; then
        log_success "HTTPS推送成功"
        return 0
    else
        log_warning "HTTPS推送失败，尝试SSH..."
        setup_ssh_push
        if try_push; then
            log_success "SSH推送成功"
            return 0
        else
            log_error "所有推送方式都失败"
            return 1
        fi
    fi
}

# 尝试推送
try_push() {
    # 静默推送，捕获错误
    if git push origin main 2>&1 | grep -q "fatal\|error"; then
        return 1
    else
        return 0
    fi
}

# 执行推送
execute_push() {
    log_info "执行Git推送..."
    
    # 获取当前分支
    current_branch=$(git branch --show-current)
    log_info "当前分支: $current_branch"
    
    # 检查是否需要切换分支
    if [ "$current_branch" != "main" ]; then
        log_warning "当前不在main分支，切换到main分支"
        git checkout main
    fi
    
    # 拉取最新更改
    log_info "拉取最新更改..."
    if ! git pull origin main; then
        log_warning "拉取失败，可能没有远程更改"
    fi
    
    # 推送更改
    log_info "推送更改到GitHub..."
    if git push origin main; then
        log_success "推送成功！"
        return 0
    else
        log_error "推送失败"
        return 1
    fi
}

# 显示推送信息
show_push_info() {
    log_success "推送完成！"
    echo ""
    echo "=== 仓库信息 ==="
    echo "仓库地址: https://github.com/aicaichat/divine-friend-pwa"
    echo "分支: main"
    echo ""
    echo "=== 最近提交 ==="
    git log --oneline -5
    echo ""
    echo "=== 远程状态 ==="
    git remote -v
}

# 主函数
main() {
    case "${1:-push}" in
        "push")
            log_info "开始Git推送流程..."
            if check_git_status; then
                log_info "没有需要推送的更改"
                show_push_info
                exit 0
            fi
            
            setup_git
            execute_push
            show_push_info
            ;;
        "status")
            check_git_status
            ;;
        "setup")
            setup_git
            ;;
        "force")
            log_warning "强制推送..."
            git push origin main --force
            show_push_info
            ;;
        *)
            echo "用法: $0 {push|status|setup|force}"
            echo "  push   - 执行Git推送"
            echo "  status - 检查Git状态"
            echo "  setup  - 配置Git推送"
            echo "  force  - 强制推送"
            exit 1
            ;;
    esac
}

main "$@"
