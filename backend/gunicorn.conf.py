"""
Gunicorn配置文件
生产环境WSGI服务器配置
"""

import os
import multiprocessing
from config import config

# 服务器配置
bind = f"{config.HOST}:{config.PORT}"
workers = config.WORKERS or multiprocessing.cpu_count() * 2 + 1
worker_class = "gevent"
worker_connections = 1000

# 性能配置
max_requests = 1000
max_requests_jitter = 50
preload_app = True
timeout = config.REQUEST_TIMEOUT
keepalive = 2

# 日志配置
accesslog = "/var/log/divine-friend/access.log"
errorlog = "/var/log/divine-friend/error.log"
loglevel = config.LOG_LEVEL.lower()
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# 进程配置
daemon = False
pidfile = "/var/run/divine-friend/gunicorn.pid"
user = "divine-friend"
group = "divine-friend"
tmp_upload_dir = None

# 安全配置
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

# SSL配置 (如果需要)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"

# 启动和关闭钩子
def on_starting(server):
    """服务器启动时执行"""
    server.log.info("🚀 Divine Friend PWA Backend 启动中...")

def on_reload(server):
    """重载时执行"""
    server.log.info("🔄 Divine Friend PWA Backend 重载中...")

def worker_init(worker):
    """工作进程初始化"""
    worker.log.info(f"👷 Worker {worker.pid} 初始化完成")

def on_exit(server):
    """服务器退出时执行"""
    server.log.info("🛑 Divine Friend PWA Backend 已停止") 