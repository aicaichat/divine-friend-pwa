"""
生产级配置管理模块
支持多环境配置和环境变量覆盖
"""

import os
from typing import Optional
from dataclasses import dataclass
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()


@dataclass
class Config:
    """基础配置类"""
    
    # 应用配置
    SECRET_KEY: str = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    APP_NAME: str = os.getenv('APP_NAME', 'divine-friend-pwa')
    APP_VERSION: str = os.getenv('APP_VERSION', '1.0.0')
    
    # 服务器配置
    HOST: str = os.getenv('HOST', '0.0.0.0')
    PORT: int = int(os.getenv('PORT', '5001'))
    WORKERS: int = int(os.getenv('WORKERS', '4'))
    
    # Flask配置
    FLASK_ENV: str = os.getenv('FLASK_ENV', 'development')
    FLASK_DEBUG: bool = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    # Redis配置
    REDIS_URL: str = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    REDIS_PASSWORD: Optional[str] = os.getenv('REDIS_PASSWORD')
    REDIS_DB: int = int(os.getenv('REDIS_DB', '0'))
    CACHE_TTL: int = int(os.getenv('CACHE_TTL', '86400'))
    
    # 日志配置
    LOG_LEVEL: str = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT: str = os.getenv('LOG_FORMAT', 'json')
    LOG_FILE: str = os.getenv('LOG_FILE', '/var/log/divine-friend/app.log')
    
    # 监控配置
    METRICS_ENABLED: bool = os.getenv('METRICS_ENABLED', 'true').lower() == 'true'
    METRICS_PORT: int = int(os.getenv('METRICS_PORT', '9090'))
    
    # 安全配置
    CORS_ORIGINS: str = os.getenv('CORS_ORIGINS', '*')
    RATE_LIMIT_ENABLED: bool = os.getenv('RATE_LIMIT_ENABLED', 'true').lower() == 'true'
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv('RATE_LIMIT_PER_MINUTE', '60'))
    
    # 盲派服务配置
    BLIND_SCHOOL_CACHE_ENABLED: bool = os.getenv('BLIND_SCHOOL_CACHE_ENABLED', 'true').lower() == 'true'
    BLIND_SCHOOL_CACHE_TTL: int = int(os.getenv('BLIND_SCHOOL_CACHE_TTL', '86400'))
    MASTER_FORTUNE_CACHE_PREFIX: str = os.getenv('MASTER_FORTUNE_CACHE_PREFIX', 'master_blind:')
    
    # 性能配置
    MAX_CONTENT_LENGTH: int = int(os.getenv('MAX_CONTENT_LENGTH', '16777216'))
    REQUEST_TIMEOUT: int = int(os.getenv('REQUEST_TIMEOUT', '30'))


@dataclass 
class DevelopmentConfig(Config):
    """开发环境配置"""
    FLASK_ENV: str = 'development'
    FLASK_DEBUG: bool = True
    LOG_LEVEL: str = 'DEBUG'
    REDIS_URL: str = 'redis://localhost:6379/1'  # 使用不同的DB


@dataclass
class TestingConfig(Config):
    """测试环境配置"""
    FLASK_ENV: str = 'testing'
    FLASK_DEBUG: bool = True
    LOG_LEVEL: str = 'DEBUG'
    REDIS_URL: str = 'redis://localhost:6379/2'  # 使用不同的DB
    CACHE_TTL: int = 60  # 短缓存时间


@dataclass
class ProductionConfig(Config):
    """生产环境配置"""
    FLASK_ENV: str = 'production'
    FLASK_DEBUG: bool = False
    LOG_LEVEL: str = 'INFO'
    
    def __post_init__(self):
        # 生产环境必须设置的配置检查
        if self.SECRET_KEY == 'dev-secret-key-change-in-production':
            raise ValueError("生产环境必须设置SECRET_KEY环境变量")


# 配置工厂
def get_config(env: Optional[str] = None) -> Config:
    """根据环境获取配置"""
    env = env or os.getenv('FLASK_ENV', 'development')
    
    config_map = {
        'development': DevelopmentConfig,
        'testing': TestingConfig,
        'production': ProductionConfig
    }
    
    config_class = config_map.get(env, DevelopmentConfig)
    return config_class()


# 全局配置实例
config = get_config() 