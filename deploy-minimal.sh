#!/bin/bash

echo "🚀 Divine Friend PWA 最简化部署"
echo "=============================="

# 1. 安装系统依赖
echo "安装系统依赖..."
sudo yum update -y
sudo yum install -y python3 python3-pip nodejs npm git mariadb-server redis

# 2. 启动系统服务
echo "启动系统服务..."
sudo systemctl start mariadb
sudo systemctl enable mariadb
sudo systemctl start redis
sudo systemctl enable redis

# 3. 配置数据库
echo "配置数据库..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS divine_friend_prod;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'divine_friend'@'localhost' IDENTIFIED BY 'divine-friend-password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON divine_friend_prod.* TO 'divine_friend'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 4. 创建Python虚拟环境
echo "创建Python虚拟环境..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements-simple.txt
cd ..

# 5. 安装Node.js依赖
echo "安装Node.js依赖..."
cd frontend
npm config set registry https://registry.npmmirror.com
npm install
npm run build
cd ..

cd admin-dashboard
npm install
npm run build
cd ..

# 6. 创建启动脚本
cat > start-services.sh << 'SERVICE_EOF'
#!/bin/bash

# 启动后端
cd backend
source venv/bin/activate
export DATABASE_URL="mysql://divine_friend:divine-friend-password@localhost:3306/divine_friend_prod"
export REDIS_URL="redis://localhost:6379/0"
export FLASK_ENV=production
nohup python app.py > ../logs/backend.log 2>&1 &
echo $! > ../logs/backend.pid
cd ..

# 启动前端
cd frontend
nohup npx serve -s dist -l 3001 > ../logs/frontend.log 2>&1 &
echo $! > ../logs/frontend.pid
cd ..

# 启动管理后台
cd admin-dashboard
nohup npx serve -s dist -l 3002 > ../logs/admin.log 2>&1 &
echo $! > ../logs/admin.pid
cd ..

echo "所有服务已启动！"
echo "前端: http://$(curl -s ifconfig.me):3001"
echo "管理后台: http://$(curl -s ifconfig.me):3002"
echo "后端API: http://$(curl -s ifconfig.me):5001"
SERVICE_EOF

chmod +x start-services.sh

# 7. 创建日志目录
mkdir -p logs

# 8. 启动服务
./start-services.sh

echo "✅ 部署完成！" 