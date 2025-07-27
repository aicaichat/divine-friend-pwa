"""
WSGI入口文件
用于Gunicorn等WSGI服务器部署
"""

import os
import sys
from pathlib import Path

# 添加项目路径到Python路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# 设置环境变量
os.environ.setdefault('FLASK_ENV', 'production')

from app import app
from config import config

# 配置应用
app.config.update(
    SECRET_KEY=config.SECRET_KEY,
    MAX_CONTENT_LENGTH=config.MAX_CONTENT_LENGTH
)

if __name__ == "__main__":
    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.FLASK_DEBUG
    ) 