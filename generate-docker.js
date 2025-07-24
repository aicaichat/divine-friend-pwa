#!/usr/bin/env node

/**
 * 交个神仙朋友 PWA - Docker配置生成器
 * Divine Friend PWA - Docker Configuration Generator
 */

const fs = require('fs');
const path = require('path');

// Docker配置模板
const dockerTemplates = {
  // 前端Dockerfile
  frontendDockerfile: () => `# 交个神仙朋友 PWA - 前端构建镜像
FROM node:18-alpine as builder

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产环境镜像
FROM nginx:alpine

# 复制构建结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制PWA配置文件
COPY --from=builder /app/dist/manifest.json /usr/share/nginx/html/
COPY --from=builder /app/dist/sw.js /usr/share/nginx/html/

# 设置权限
RUN chown -R nginx:nginx /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]`,

  // 后端Dockerfile
  backendDockerfile: () => `# 交个神仙朋友 PWA - WordPress后端镜像
FROM wordpress:6.4-php8.2-apache

# 设置环境变量
ENV WORDPRESS_DEBUG=1
ENV WORDPRESS_CONFIG_EXTRA="define('WP_ENVIRONMENT_TYPE', 'development');"

# 安装额外的PHP扩展
RUN apt-get update && apt-get install -y \\
    libzip-dev \\
    zip \\
    unzip \\
    git \\
    curl \\
    libpng-dev \\
    libjpeg62-turbo-dev \\
    libfreetype6-dev \\
    libmagickwand-dev \\
    && docker-php-ext-configure gd --with-freetype --with-jpeg \\
    && docker-php-ext-install -j$(nproc) gd zip pdo_mysql \\
    && pecl install imagick redis \\
    && docker-php-ext-enable imagick redis

# 安装Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 复制自定义php.ini
COPY php.ini /usr/local/etc/php/

# 设置Apache配置
RUN a2enmod rewrite headers expires

# 复制自定义插件和主题
COPY plugins/ /var/www/html/wp-content/plugins/
COPY themes/ /var/www/html/wp-content/themes/

# 设置权限
RUN chown -R www-data:www-data /var/www/html

# 创建上传目录
RUN mkdir -p /var/www/html/wp-content/uploads \\
    && chown -R www-data:www-data /var/www/html/wp-content/uploads

EXPOSE 80`,

  // Nginx配置
  nginxConfig: () => `# 交个神仙朋友 PWA - Nginx配置
upstream frontend {
    server frontend:3000;
}

upstream backend {
    server backend:80;
}

# 缓存配置
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=app_cache:10m max_size=1g inactive=60m use_temp_path=off;

server {
    listen 80;
    server_name localhost;
    client_max_body_size 100M;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml application/xml+rss application/json;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # PWA缓存控制
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
    }

    # Service Worker
    location /sw.js {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Manifest
    location /manifest.json {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        add_header Content-Type "application/manifest+json";
        expires 1d;
    }

    # API路由到WordPress后端
    location /wp-json/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # API缓存
        proxy_cache app_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_valid 404 1m;
        proxy_cache_bypass $http_cache_control;
        add_header X-Proxy-Cache $upstream_cache_status;
    }

    # WordPress管理后台
    location /wp-admin/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 管理后台不缓存
        proxy_cache off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # WordPress登录页面
    location /wp-login.php {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 其他WordPress文件
    location ~ \\.php$ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 前端应用 (默认)
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 缓存HTML
        proxy_cache app_cache;
        proxy_cache_valid 200 1m;
        proxy_cache_bypass $http_cache_control;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
}

# HTTPS配置 (生产环境)
server {
    listen 443 ssl http2;
    server_name localhost;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # 重用上面的location配置
    include /etc/nginx/conf.d/locations.conf;
}`,

  // Docker Compose开发环境
  dockerComposeDev: () => `version: '3.8'

services:
  # 前端开发服务
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://localhost:8080/wp-json
      - VITE_WS_URL=ws://localhost:3001
      - CHOKIDAR_USEPOLLING=true
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.vite
    depends_on:
      - backend
    command: npm run dev

  # 后端WordPress
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8080:80"
    environment:
      - WORDPRESS_DB_HOST=mysql:3306
      - WORDPRESS_DB_NAME=divine_friend_dev
      - WORDPRESS_DB_USER=root
      - WORDPRESS_DB_PASSWORD=password
      - WORDPRESS_DEBUG=1
      - WORDPRESS_DEBUG_LOG=1
      - WORDPRESS_DEBUG_DISPLAY=1
    volumes:
      - ./backend/plugins:/var/www/html/wp-content/plugins
      - ./backend/themes:/var/www/html/wp-content/themes
      - ./backend/uploads:/var/www/html/wp-content/uploads
      - wp_data_dev:/var/www/html
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy

  # 数据库
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=divine_friend_dev
      - MYSQL_USER=divine_friend
      - MYSQL_PASSWORD=password
    volumes:
      - mysql_data_dev:/var/lib/mysql
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
      - ./database/my.cnf:/etc/mysql/conf.d/my.cnf
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  # Redis缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data_dev:/data
      - ./devops/redis/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # 邮件测试服务
  mailhog:
    image: mailhog/mailhog:latest
    ports:
      - "1025:1025"
      - "8025:8025"

  # phpMyAdmin
  phpmyadmin:
    image: phpmyadmin:latest
    ports:
      - "8081:80"
    environment:
      - PMA_HOST=mysql
      - PMA_USER=root
      - PMA_PASSWORD=password
      - UPLOAD_LIMIT=1G
    depends_on:
      - mysql

  # Redis管理界面
  redis-commander:
    image: rediscommander/redis-commander:latest
    ports:
      - "8082:8081"
    environment:
      - REDIS_HOSTS=local:redis:6379
    depends_on:
      - redis

volumes:
  mysql_data_dev:
  redis_data_dev:
  wp_data_dev:

networks:
  default:
    driver: bridge`,

  // Docker Compose生产环境
  dockerComposeProd: () => `version: '3.8'

services:
  # Nginx反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./devops/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./devops/nginx/ssl:/etc/nginx/ssl
      - nginx_cache:/var/cache/nginx
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

  # 前端PWA
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - VITE_API_URL=https://api.divine-friend.com/wp-json
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # 后端WordPress
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - WORDPRESS_DB_HOST=mysql:3306
      - WORDPRESS_DB_NAME=divine_friend_prod
      - WORDPRESS_DB_USER=divine_friend
      - WORDPRESS_DB_PASSWORD_FILE=/run/secrets/db_password
      - WORDPRESS_DEBUG=0
      - WORDPRESS_CONFIG_EXTRA="define('WP_CACHE', true); define('WP_REDIS_HOST', 'redis');"
    volumes:
      - wp_data:/var/www/html/wp-content
      - ./backend/uploads:/var/www/html/wp-content/uploads
    depends_on:
      - mysql
      - redis
    restart: unless-stopped
    secrets:
      - db_password
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/wp-admin/admin-ajax.php?action=heartbeat"]
      interval: 30s
      timeout: 10s
      retries: 3

  # 数据库主从
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD_FILE=/run/secrets/mysql_root_password
      - MYSQL_DATABASE=divine_friend_prod
      - MYSQL_USER=divine_friend
      - MYSQL_PASSWORD_FILE=/run/secrets/db_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/my.cnf:/etc/mysql/conf.d/my.cnf
    restart: unless-stopped
    secrets:
      - mysql_root_password
      - db_password
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10
    
  # Redis集群
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
      - ./devops/redis/redis-prod.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # 备份服务
  backup:
    image: alpine:latest
    volumes:
      - mysql_data:/backup/mysql:ro
      - wp_data:/backup/wordpress:ro
      - ./backups:/backup/output
    environment:
      - BACKUP_SCHEDULE=0 2 * * *  # 每天凌晨2点备份
    command: |
      sh -c '
        apk add --no-cache mysql-client gzip tar
        echo "$BACKUP_SCHEDULE /backup/backup.sh" | crontab -
        crond -f
      '
    restart: unless-stopped

  # 监控服务
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./devops/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    restart: unless-stopped

  # 图表服务
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD_FILE=/run/secrets/grafana_password
    volumes:
      - grafana_data:/var/lib/grafana
      - ./devops/monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./devops/monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    secrets:
      - grafana_password
    restart: unless-stopped

secrets:
  db_password:
    file: ./secrets/db_password.txt
  mysql_root_password:
    file: ./secrets/mysql_root_password.txt
  grafana_password:
    file: ./secrets/grafana_password.txt

volumes:
  mysql_data:
  redis_data:
  wp_data:
  nginx_cache:
  prometheus_data:
  grafana_data:

networks:
  default:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16`,

  // Kubernetes配置
  kubernetesManifest: () => `# 交个神仙朋友 PWA - Kubernetes部署配置
apiVersion: v1
kind: Namespace
metadata:
  name: divine-friend
---
# ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: divine-friend
data:
  WORDPRESS_DB_HOST: "mysql-service"
  WORDPRESS_DB_NAME: "divine_friend"
  REDIS_HOST: "redis-service"
  NODE_ENV: "production"
---
# Secret
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: divine-friend
type: Opaque
data:
  WORDPRESS_DB_PASSWORD: <base64-encoded-password>
  MYSQL_ROOT_PASSWORD: <base64-encoded-password>
  JWT_SECRET: <base64-encoded-secret>
---
# Frontend Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: divine-friend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: divine-friend/frontend:latest
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: NODE_ENV
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
# Backend Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: divine-friend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: divine-friend/backend:latest
        ports:
        - containerPort: 80
        env:
        - name: WORDPRESS_DB_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: WORDPRESS_DB_HOST
        - name: WORDPRESS_DB_NAME
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: WORDPRESS_DB_NAME
        - name: WORDPRESS_DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: WORDPRESS_DB_PASSWORD
        volumeMounts:
        - name: wp-content
          mountPath: /var/www/html/wp-content
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: wp-content
        persistentVolumeClaim:
          claimName: wp-content-pvc
---
# MySQL StatefulSet
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
  namespace: divine-friend
spec:
  serviceName: mysql-service
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        ports:
        - containerPort: 3306
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: MYSQL_ROOT_PASSWORD
        - name: MYSQL_DATABASE
          value: divine_friend
        volumeMounts:
        - name: mysql-storage
          mountPath: /var/lib/mysql
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
  volumeClaimTemplates:
  - metadata:
      name: mysql-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
---
# Services
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: divine-friend
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: divine-friend
spec:
  selector:
    app: backend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
---
apiVersion: v1
kind: Service
metadata:
  name: mysql-service
  namespace: divine-friend
spec:
  selector:
    app: mysql
  ports:
  - port: 3306
    targetPort: 3306
  type: ClusterIP
---
# Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: divine-friend
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - divine-friend.com
    secretName: divine-friend-tls
  rules:
  - host: divine-friend.com
    http:
      paths:
      - path: /wp-json
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 80
      - path: /wp-admin
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80`
};

// 创建文件函数
function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

// 主生成函数
function generateDockerConfigs() {
  console.log('🐳 交个神仙朋友 PWA - Docker配置生成器');
  console.log('=====================================\n');

  // 创建前端Dockerfile
  createFile('frontend/Dockerfile', dockerTemplates.frontendDockerfile());
  createFile('frontend/Dockerfile.dev', `FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 开发模式启动
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]`);

  // 创建后端Dockerfile
  createFile('backend/Dockerfile', dockerTemplates.backendDockerfile());
  createFile('backend/Dockerfile.dev', `FROM wordpress:6.4-php8.2-apache

# 开发环境配置
ENV WORDPRESS_DEBUG=1
ENV WORDPRESS_DEBUG_LOG=1
ENV WORDPRESS_DEBUG_DISPLAY=1

# 安装开发工具
RUN apt-get update && apt-get install -y \\
    vim \\
    wget \\
    curl \\
    git \\
    unzip \\
    libzip-dev \\
    && docker-php-ext-install zip \\
    && pecl install xdebug \\
    && docker-php-ext-enable xdebug

# Xdebug配置
RUN echo "xdebug.mode=debug" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \\
    && echo "xdebug.client_host=host.docker.internal" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \\
    && echo "xdebug.client_port=9003" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

# 设置权限
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80`);

  // 创建Nginx配置
  createFile('devops/nginx/nginx.conf', dockerTemplates.nginxConfig());

  // 创建Docker Compose文件
  createFile('docker-compose.yml', dockerTemplates.dockerComposeDev());
  createFile('docker-compose.prod.yml', dockerTemplates.dockerComposeProd());

  // 创建Kubernetes配置
  createFile('devops/kubernetes/deployments/app.yaml', dockerTemplates.kubernetesManifest());

  // 创建其他配置文件
  createAdditionalConfigs();

  console.log('✅ Docker配置文件生成完成！\n');
  console.log('📁 生成的文件：');
  console.log('  - frontend/Dockerfile');
  console.log('  - frontend/Dockerfile.dev');
  console.log('  - backend/Dockerfile');
  console.log('  - backend/Dockerfile.dev');
  console.log('  - devops/nginx/nginx.conf');
  console.log('  - docker-compose.yml');
  console.log('  - docker-compose.prod.yml');
  console.log('  - devops/kubernetes/deployments/app.yaml');
  console.log('\n🚀 使用指南：');
  console.log('  开发环境: docker-compose up -d');
  console.log('  生产环境: docker-compose -f docker-compose.prod.yml up -d');
  console.log('  Kubernetes: kubectl apply -f devops/kubernetes/');
  console.log('\n🌟 愿你的容器运行如禅意般稳定！');
}

// 创建额外配置文件
function createAdditionalConfigs() {
  // PHP配置
  createFile('backend/php.ini', `; PHP配置 - 交个神仙朋友 PWA
memory_limit = 256M
upload_max_filesize = 100M
post_max_size = 100M
max_execution_time = 300
max_input_vars = 3000

; 错误报告
display_errors = Off
log_errors = On
error_log = /var/log/php_errors.log

; OPcache
opcache.enable = 1
opcache.memory_consumption = 128
opcache.max_accelerated_files = 4000
opcache.revalidate_freq = 60

; Session
session.gc_maxlifetime = 7200
session.cookie_httponly = 1
session.cookie_secure = 1`);

  // MySQL配置
  createFile('database/my.cnf', `[mysqld]
# 基本配置
default-storage-engine = InnoDB
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# 内存配置
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 1
innodb_flush_method = O_DIRECT

# 连接配置
max_connections = 200
max_connect_errors = 10
wait_timeout = 600
interactive_timeout = 600

# 查询缓存
query_cache_type = 1
query_cache_size = 32M

# 慢查询日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# 二进制日志
log-bin = mysql-bin
binlog_format = ROW
expire_logs_days = 7

[mysql]
default-character-set = utf8mb4

[client]
default-character-set = utf8mb4`);

  // Redis配置
  createFile('devops/redis/redis.conf', `# Redis配置 - 开发环境
bind 0.0.0.0
port 6379
timeout 0
tcp-keepalive 300

# 内存配置
maxmemory 256mb
maxmemory-policy allkeys-lru

# 持久化
save 900 1
save 300 10
save 60 10000

# 日志
loglevel notice
logfile ""

# 安全
# requirepass yourpassword

# 客户端
timeout 0`);

  createFile('devops/redis/redis-prod.conf', `# Redis配置 - 生产环境
bind 0.0.0.0
port 6379
timeout 0
tcp-keepalive 300

# 内存配置
maxmemory 2gb
maxmemory-policy allkeys-lru

# 持久化
save 900 1
save 300 10
save 60 10000
dir /data

# AOF
appendonly yes
appendfsync everysec

# 日志
loglevel notice
logfile /var/log/redis/redis.log

# 安全
requirepass changeme

# 性能
tcp-backlog 511
databases 16`);

  // 前端Nginx配置
  createFile('frontend/nginx.conf', `server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # PWA支持
    location / {
        try_files $uri $uri/ /index.html;
        
        # 缓存控制
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        location = /index.html {
            expires off;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }

    # Service Worker
    location = /sw.js {
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Manifest
    location = /manifest.json {
        add_header Content-Type "application/manifest+json";
        expires 1d;
    }

    # 健康检查
    location = /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
}`);

  // 备份脚本
  createFile('scripts/backup/backup.sh', `#!/bin/bash
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

echo "备份完成 - $DATE"`);

  // 部署脚本
  createFile('scripts/deploy/deploy.sh', `#!/bin/bash
# 交个神仙朋友 PWA 部署脚本

set -e

echo "🚀 开始部署交个神仙朋友 PWA..."

# 检查环境
if [ "$1" = "prod" ]; then
    echo "📦 生产环境部署"
    COMPOSE_FILE="docker-compose.prod.yml"
    ENV_FILE=".env.production"
else
    echo "🧪 开发环境部署"
    COMPOSE_FILE="docker-compose.yml"
    ENV_FILE=".env.development"
fi

# 加载环境变量
if [ -f $ENV_FILE ]; then
    export $(cat $ENV_FILE | xargs)
fi

# 构建镜像
echo "🔨 构建Docker镜像..."
docker-compose -f $COMPOSE_FILE build --no-cache

# 停止旧容器
echo "⏹️ 停止旧服务..."
docker-compose -f $COMPOSE_FILE down

# 启动新容器
echo "▶️ 启动新服务..."
docker-compose -f $COMPOSE_FILE up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 健康检查
echo "🩺 健康检查..."
if curl -f http://localhost/health; then
    echo "✅ 部署成功！"
else
    echo "❌ 部署失败，请检查日志"
    docker-compose -f $COMPOSE_FILE logs
    exit 1
fi

echo "🎉 部署完成！"`);

  // 监控配置
  createFile('devops/monitoring/prometheus.yml', `global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'divine-friend-frontend'
    static_configs:
      - targets: ['frontend:80']
    metrics_path: /metrics

  - job_name: 'divine-friend-backend'
    static_configs:
      - targets: ['backend:80']
    metrics_path: /wp-json/zen/metrics/v1/prometheus

  - job_name: 'mysql'
    static_configs:
      - targets: ['mysql:3306']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']`);

  // Grafana数据源
  createFile('devops/monitoring/grafana/datasources/prometheus.yml', `apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true`);

  // 环境变量模板
  createFile('.env.example', `# 交个神仙朋友 PWA 环境变量配置

# 数据库配置
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_PASSWORD=your_db_password
WORDPRESS_DB_NAME=divine_friend
WORDPRESS_DB_USER=divine_friend
WORDPRESS_DB_PASSWORD=your_db_password

# WordPress配置
WORDPRESS_DEBUG=false
WORDPRESS_CONFIG_EXTRA=define('WP_CACHE', true);

# Redis配置
REDIS_PASSWORD=your_redis_password

# AI服务配置
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# 支付配置
WECHAT_PAY_APP_ID=your_wechat_app_id
WECHAT_PAY_MCH_ID=your_merchant_id
WECHAT_PAY_API_KEY=your_wechat_api_key

# JWT配置
JWT_SECRET=your_jwt_secret

# 邮件配置
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_email_password

# 文件上传配置
UPLOAD_MAX_SIZE=100M
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif,pdf,doc,docx

# 监控配置
GRAFANA_ADMIN_PASSWORD=your_grafana_password

# SSL证书配置
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem`);
}

// 运行生成器
generateDockerConfigs(); 