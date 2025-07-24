#!/bin/bash
# 交个神仙朋友 PWA 备份脚本

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/output"
MYSQL_CONTAINER="divine-friend-pwa_mysql_1"
WP_CONTAINER="divine-friend-pwa_backend_1"

echo "开始备份 - $DATE"

# 创建备份目录
mkdir -p $BACKUP_DIR/$DATE

# 备份MySQL数据库
echo "备份数据库..."
docker exec $MYSQL_CONTAINER mysqldump -u root -ppassword divine_friend_prod > $BACKUP_DIR/$DATE/database.sql
gzip $BACKUP_DIR/$DATE/database.sql

# 备份WordPress文件
echo "备份WordPress文件..."
docker exec $WP_CONTAINER tar -czf /tmp/wp-content.tar.gz -C /var/www/html wp-content
docker cp $WP_CONTAINER:/tmp/wp-content.tar.gz $BACKUP_DIR/$DATE/

# 清理旧备份（保留7天）
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +

echo "备份完成 - $DATE"