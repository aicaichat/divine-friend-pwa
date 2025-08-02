# 🌐 DNS配置指南 - today.bless.top

## 📋 域名结构

为了让 `today.bless.top` 子域名正常工作，您需要在域名提供商处配置以下DNS记录：

### 必需的DNS记录

| 类型 | 名称 | 值 | TTL |
|------|------|-----|-----|
| A | today | 47.99.122.96 | 300 |
| A | api | 47.99.122.96 | 300 |
| A | admin | 47.99.122.96 | 300 |

## 🔧 配置步骤

### 1. 登录域名管理控制台

根据您的域名注册商，登录相应的控制台：

- **阿里云万网**: https://dns.console.aliyun.com/
- **腾讯云**: https://console.cloud.tencent.com/cns
- **Cloudflare**: https://dash.cloudflare.com/
- **其他**: 登录您的域名注册商控制台

### 2. 添加DNS记录

在DNS管理页面添加以下记录：

#### 记录1: 前端应用
```
类型: A
名称: today
值: 47.99.122.96
TTL: 300秒（5分钟）
```

#### 记录2: API接口
```
类型: A
名称: api
值: 47.99.122.96
TTL: 300秒（5分钟）
```

#### 记录3: 管理后台
```
类型: A
名称: admin
值: 47.99.122.96
TTL: 300秒（5分钟）
```

### 3. 验证DNS配置

在本地计算机上验证DNS配置是否生效：

```bash
# 检查 today.bless.top
nslookup today.bless.top

# 检查 api.bless.top
nslookup api.bless.top

# 检查 admin.bless.top
nslookup admin.bless.top

# 使用dig命令检查（更详细）
dig today.bless.top
dig api.bless.top
dig admin.bless.top
```

预期结果应该显示所有域名都指向 `47.99.122.96`

## ⏰ DNS生效时间

- **最快**: 5-10分钟（TTL=300秒）
- **通常**: 30分钟到2小时
- **最长**: 24-48小时（极少情况）

## 🚀 部署SSL证书

DNS配置完成后，在服务器上执行：

```bash
# 给脚本执行权限
chmod +x setup-domain-ssl.sh
chmod +x check-server-status.sh

# 首先检查服务状态
sudo ./check-server-status.sh

# 完整配置域名和SSL证书
sudo ./setup-domain-ssl.sh

# 或者分步执行：
# sudo ./setup-domain-ssl.sh services    # 修复服务
# sudo ./setup-domain-ssl.sh nginx       # 配置Nginx
# sudo ./setup-domain-ssl.sh ssl         # 申请SSL证书
# sudo ./setup-domain-ssl.sh verify      # 验证部署
```

## 🎯 最终访问地址

配置完成后，您可以通过以下HTTPS地址访问：

- **前端应用**: https://today.bless.top
- **API接口**: https://api.bless.top
- **管理后台**: https://admin.bless.top

## 🔍 故障排除

### DNS未生效

```bash
# 清除本地DNS缓存
# Windows:
ipconfig /flushdns

# macOS:
sudo dscacheutil -flushcache

# Linux:
sudo systemctl restart systemd-resolved
```

### SSL证书申请失败

常见原因和解决方案：

1. **DNS未生效**
   - 等待DNS完全生效（可能需要几小时）
   - 使用 `nslookup` 验证域名解析

2. **端口80被占用**
   ```bash
   # 检查端口占用
   sudo netstat -tlnp | grep :80
   
   # 停止可能冲突的服务
   sudo systemctl stop apache2  # 如果安装了Apache
   ```

3. **防火墙阻止**
   ```bash
   # 确保开放HTTP端口
   sudo firewall-cmd --permanent --add-service=http
   sudo firewall-cmd --reload
   ```

4. **重新申请证书**
   ```bash
   # 删除失败的证书
   sudo certbot delete --cert-name today.bless.top
   
   # 重新申请
   sudo ./setup-domain-ssl.sh ssl
   ```

### 服务无法访问

```bash
# 检查服务状态
./manage-services.sh status

# 重启服务
./manage-services.sh restart

# 检查Nginx状态
sudo systemctl status nginx

# 查看Nginx错误日志
sudo tail -f /var/log/nginx/error.log
```

## 📞 技术支持

如果遇到问题：

1. 检查DNS是否生效：`nslookup today.bless.top`
2. 检查服务状态：`./manage-services.sh status`
3. 查看详细日志：`sudo tail -f /var/log/nginx/error.log`
4. 验证SSL证书：`sudo certbot certificates`

---

**重要提醒**: 
- DNS配置需要在域名注册商处完成
- SSL证书申请需要DNS完全生效后进行
- 配置过程中请保持耐心，DNS生效可能需要一些时间 