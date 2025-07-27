"""
运势缓存服务
确保同一天同一用户的运势结果保持一致，避免重复计算
"""

import json
import hashlib
from datetime import datetime, date
from typing import Dict, Any, Optional
import redis
import os


class FortuneCacheService:
    """运势缓存服务"""
    
    def __init__(self):
        # 初始化Redis连接（如果可用）
        self.redis_client = None
        try:
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            # 测试连接
            self.redis_client.ping()
        except Exception as e:
            print(f"Redis连接失败，使用内存缓存: {e}")
            self.redis_client = None
        
        # 内存缓存作为备选
        self.memory_cache = {}
    
    def _generate_cache_key(self, user_id: str, target_date: str) -> str:
        """生成缓存键"""
        key_data = f"{user_id}:{target_date}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def _generate_user_id(self, birthdate: str, name: str, gender: str) -> str:
        """生成用户唯一标识"""
        user_data = f"{birthdate}:{name}:{gender}"
        return hashlib.md5(user_data.encode()).hexdigest()
    
    def get_cached_fortune(self, birthdate: str, name: str, gender: str, target_date: str) -> Optional[Dict[str, Any]]:
        """获取缓存的运势结果"""
        user_id = self._generate_user_id(birthdate, name, gender)
        cache_key = self._generate_cache_key(user_id, target_date)
        
        try:
            if self.redis_client:
                # 尝试从Redis获取
                cached_data = self.redis_client.get(cache_key)
                if cached_data:
                    return json.loads(cached_data)
            else:
                # 从内存缓存获取
                if cache_key in self.memory_cache:
                    cached_data = self.memory_cache[cache_key]
                    # 检查缓存是否过期（24小时）
                    if datetime.now().timestamp() - cached_data.get('timestamp', 0) < 86400:
                        return cached_data.get('data')
                    else:
                        # 删除过期缓存
                        del self.memory_cache[cache_key]
        except Exception as e:
            print(f"获取缓存失败: {e}")
        
        return None
    
    def cache_fortune(self, birthdate: str, name: str, gender: str, target_date: str, fortune_data: Dict[str, Any]) -> bool:
        """缓存运势结果"""
        user_id = self._generate_user_id(birthdate, name, gender)
        cache_key = self._generate_cache_key(user_id, target_date)
        
        cache_data = {
            'data': fortune_data,
            'timestamp': datetime.now().timestamp(),
            'user_id': user_id,
            'target_date': target_date
        }
        
        try:
            if self.redis_client:
                # 存储到Redis，24小时过期
                self.redis_client.setex(cache_key, 86400, json.dumps(cache_data))
                return True
            else:
                # 存储到内存缓存
                self.memory_cache[cache_key] = cache_data
                # 清理过期缓存
                self._cleanup_memory_cache()
                return True
        except Exception as e:
            print(f"缓存运势失败: {e}")
            return False
    
    def _cleanup_memory_cache(self):
        """清理内存缓存中的过期数据"""
        current_time = datetime.now().timestamp()
        expired_keys = []
        
        for key, data in self.memory_cache.items():
            if current_time - data.get('timestamp', 0) > 86400:
                expired_keys.append(key)
        
        for key in expired_keys:
            del self.memory_cache[key]
    
    def invalidate_user_cache(self, birthdate: str, name: str, gender: str) -> bool:
        """清除用户的所有缓存"""
        user_id = self._generate_user_id(birthdate, name, gender)
        
        try:
            if self.redis_client:
                # 删除Redis中该用户的所有缓存
                pattern = f"*:{user_id}:*"
                keys = self.redis_client.keys(pattern)
                if keys:
                    self.redis_client.delete(*keys)
            else:
                # 删除内存缓存中该用户的所有缓存
                keys_to_delete = []
                for key, data in self.memory_cache.items():
                    if data.get('user_id') == user_id:
                        keys_to_delete.append(key)
                
                for key in keys_to_delete:
                    del self.memory_cache[key]
            
            return True
        except Exception as e:
            print(f"清除用户缓存失败: {e}")
            return False
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """获取缓存统计信息"""
        try:
            if self.redis_client:
                # Redis统计
                info = self.redis_client.info()
                return {
                    'type': 'redis',
                    'connected_clients': info.get('connected_clients', 0),
                    'used_memory': info.get('used_memory_human', '0B'),
                    'total_commands_processed': info.get('total_commands_processed', 0)
                }
            else:
                # 内存缓存统计
                return {
                    'type': 'memory',
                    'cache_size': len(self.memory_cache),
                    'memory_usage': 'unknown'
                }
        except Exception as e:
            return {
                'type': 'unknown',
                'error': str(e)
            } 