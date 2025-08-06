#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Divine Friend PWA 后端API服务
长期解决方案 - 用户管理和手串激活服务器端验证
"""

from flask import Flask, request, jsonify, session
from flask_cors import CORS
import mysql.connector
import redis
import hashlib
import json
import uuid
import time
from datetime import datetime, timedelta
import jwt
from functools import wraps
import os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'divine-friend-secret-key-2024'
CORS(app, supports_credentials=True)

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'divine_friend',
    'password': 'password',
    'database': 'divine_friend_dev',
    'charset': 'utf8mb4'
}

# Redis配置
REDIS_CONFIG = {
    'host': 'localhost',
    'port': 6379,
    'db': 0,
    'decode_responses': True
}

# JWT配置
JWT_SECRET = 'divine-friend-jwt-secret'
JWT_EXPIRATION = 7 * 24 * 60 * 60  # 7天

class DatabaseManager:
    """数据库管理类"""
    
    def __init__(self):
        self.connection = None
        self.redis_client = None
        self.connect()
    
    def connect(self):
        """连接数据库"""
        try:
            self.connection = mysql.connector.connect(**DB_CONFIG)
            print("✅ MySQL数据库连接成功")
        except Exception as e:
            print(f"❌ MySQL连接失败: {e}")
            self.connection = None
        
        try:
            self.redis_client = redis.Redis(**REDIS_CONFIG)
            self.redis_client.ping()
            print("✅ Redis缓存连接成功")
        except Exception as e:
            print(f"❌ Redis连接失败: {e}")
            self.redis_client = None
    
    def execute_query(self, query, params=None, fetch=False):
        """执行数据库查询"""
        if not self.connection:
            self.connect()
        
        if not self.connection:
            return None
        
        try:
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute(query, params or ())
            
            if fetch:
                result = cursor.fetchall()
                cursor.close()
                return result
            else:
                self.connection.commit()
                cursor.close()
                return True
        except Exception as e:
            print(f"数据库查询错误: {e}")
            return None
    
    def cache_set(self, key, value, expiration=3600):
        """设置缓存"""
        if self.redis_client:
            try:
                self.redis_client.setex(key, expiration, json.dumps(value))
                return True
            except Exception as e:
                print(f"缓存设置失败: {e}")
        return False
    
    def cache_get(self, key):
        """获取缓存"""
        if self.redis_client:
            try:
                value = self.redis_client.get(key)
                return json.loads(value) if value else None
            except Exception as e:
                print(f"缓存获取失败: {e}")
        return None

# 全局数据库管理器
db = DatabaseManager()

def token_required(f):
    """JWT令牌验证装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if token and token.startswith('Bearer '):
            token = token.split(' ')[1]
        
        if not token:
            return jsonify({'error': '缺少访问令牌'}), 401
        
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            current_user_id = data['user_id']
            request.current_user_id = current_user_id
        except jwt.ExpiredSignatureError:
            return jsonify({'error': '令牌已过期'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': '无效令牌'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

# ============ 用户管理API ============

@app.route('/api/users/register', methods=['POST'])
def register_user():
    """用户注册"""
    try:
        data = request.get_json()
        
        # 验证必需字段
        required_fields = ['username', 'email', 'password', 'gender', 'birthdate']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'缺少必需字段: {field}'}), 400
        
        # 检查用户是否已存在
        existing_user = db.execute_query(
            "SELECT id FROM users WHERE email = %s OR username = %s",
            (data['email'], data['username']),
            fetch=True
        )
        
        if existing_user:
            return jsonify({'success': False, 'error': '用户名或邮箱已存在'}), 400
        
        # 创建新用户
        user_id = str(uuid.uuid4())
        
        query = """
        INSERT INTO users (id, username, real_name, email, phone, gender, 
                          birthdate, birth_time, birth_location, settings)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        settings = {
            'setupComplete': True,
            'setupTime': datetime.now().isoformat(),
            'dataSync': True,
            'notifications': True
        }
        
        params = (
            user_id,
            data['username'],
            data.get('realName', data['username']),
            data['email'],
            data.get('phone'),
            data['gender'],
            data['birthdate'],
            data.get('birthTime'),
            data.get('birthLocation'),
            json.dumps(settings)
        )
        
        if db.execute_query(query, params):
            # 生成JWT令牌
            token = jwt.encode({
                'user_id': user_id,
                'exp': datetime.utcnow() + timedelta(seconds=JWT_EXPIRATION)
            }, JWT_SECRET, algorithm='HS256')
            
            return jsonify({
                'success': True,
                'message': '注册成功',
                'user': {
                    'id': user_id,
                    'username': data['username'],
                    'email': data['email']
                },
                'token': token
            })
        else:
            return jsonify({'success': False, 'error': '注册失败'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/users/login', methods=['POST'])
def login_user():
    """用户登录"""
    try:
        data = request.get_json()
        email = data.get('email')
        username = data.get('username')  # 支持用户名登录
        
        if not (email or username):
            return jsonify({'success': False, 'error': '邮箱或用户名不能为空'}), 400
        
        # 查找用户（支持邮箱或用户名登录）
        query = "SELECT * FROM users WHERE status = 'active'"
        params = []
        
        if email:
            query += " AND email = %s"
            params.append(email)
        else:
            query += " AND username = %s"
            params.append(username)
        
        user = db.execute_query(query, params, fetch=True)
        
        if not user:
            return jsonify({'success': False, 'error': '用户不存在或已被禁用'}), 401
        
        user = user[0]
        
        # 更新最后登录时间
        db.execute_query(
            "UPDATE users SET last_login = NOW() WHERE id = %s",
            (user['id'],)
        )
        
        # 生成JWT令牌
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.utcnow() + timedelta(seconds=JWT_EXPIRATION)
        }, JWT_SECRET, algorithm='HS256')
        
        # 缓存用户信息
        db.cache_set(f"user:{user['id']}", user, 3600)
        
        return jsonify({
            'success': True,
            'message': '登录成功',
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'realName': user['real_name']
            },
            'token': token
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/users/profile', methods=['GET'])
@token_required
def get_user_profile():
    """获取用户资料"""
    try:
        user_id = request.current_user_id
        
        # 先尝试从缓存获取
        cached_user = db.cache_get(f"user:{user_id}")
        if cached_user:
            return jsonify({'success': True, 'user': cached_user})
        
        # 从数据库查询
        user = db.execute_query(
            "SELECT * FROM users WHERE id = %s",
            (user_id,),
            fetch=True
        )
        
        if not user:
            return jsonify({'success': False, 'error': '用户不存在'}), 404
        
        user = user[0]
        
        # 缓存用户信息
        db.cache_set(f"user:{user_id}", user, 3600)
        
        return jsonify({'success': True, 'user': user})
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/users/profile', methods=['PUT'])
@token_required
def update_user_profile():
    """更新用户资料"""
    try:
        user_id = request.current_user_id
        data = request.get_json()
        
        # 构建更新语句
        update_fields = []
        params = []
        
        allowed_fields = [
            'username', 'real_name', 'phone', 'gender', 
            'birthdate', 'birth_time', 'birth_location', 'settings'
        ]
        
        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = %s")
                if field == 'settings':
                    params.append(json.dumps(data[field]))
                else:
                    params.append(data[field])
        
        if not update_fields:
            return jsonify({'success': False, 'error': '没有可更新的字段'}), 400
        
        # 添加更新时间
        update_fields.append("updated_at = NOW()")
        params.append(user_id)
        
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
        
        if db.execute_query(query, params):
            # 清除缓存
            if db.redis_client:
                db.redis_client.delete(f"user:{user_id}")
            
            return jsonify({'success': True, 'message': '资料更新成功'})
        else:
            return jsonify({'success': False, 'error': '更新失败'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ============ 数据同步API ============

@app.route('/api/data/sync', methods=['POST'])
@token_required
def sync_user_data():
    """同步用户数据到服务器"""
    try:
        user_id = request.current_user_id
        data = request.get_json()
        
        # 备份用户数据
        backup_data = {
            'user_id': user_id,
            'backup_type': 'auto',
            'data_type': 'complete',
            'backup_data': data,
            'file_size': len(json.dumps(data)),
            'source_device': request.headers.get('User-Agent', 'Unknown')[:100],
            'backup_version': '1.0'
        }
        
        query = """
        INSERT INTO user_data_backups (user_id, backup_type, data_type, backup_data, 
                                      file_size, source_device, backup_version)
        VALUES (%(user_id)s, %(backup_type)s, %(data_type)s, %(backup_data)s,
                %(file_size)s, %(source_device)s, %(backup_version)s)
        """
        
        if db.execute_query(query, backup_data):
            # 缓存最新数据
            db.cache_set(f"user_data:{user_id}", data, 7200)  # 2小时缓存
            
            return jsonify({
                'success': True,
                'message': '数据同步成功',
                'sync_time': datetime.now().isoformat()
            })
        else:
            return jsonify({'success': False, 'error': '数据同步失败'}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/data/restore', methods=['GET'])
@token_required
def restore_user_data():
    """恢复用户数据"""
    try:
        user_id = request.current_user_id
        
        # 先尝试从缓存获取
        cached_data = db.cache_get(f"user_data:{user_id}")
        if cached_data:
            return jsonify({
                'success': True,
                'data': cached_data,
                'source': 'cache'
            })
        
        # 从数据库获取最新备份
        backup = db.execute_query(
            """
            SELECT backup_data, created_at 
            FROM user_data_backups 
            WHERE user_id = %s 
            ORDER BY created_at DESC 
            LIMIT 1
            """,
            (user_id,),
            fetch=True
        )
        
        if backup:
            data = backup[0]['backup_data']
            # 缓存数据
            db.cache_set(f"user_data:{user_id}", data, 7200)
            
            return jsonify({
                'success': True,
                'data': data,
                'source': 'database',
                'backup_time': backup[0]['created_at'].isoformat()
            })
        else:
            return jsonify({
                'success': False,
                'error': '未找到备份数据'
            }), 404
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ============ 手串验证API ============

@app.route('/api/bracelets/verify', methods=['POST'])
def verify_bracelet():
    """验证手串NFC芯片"""
    try:
        data = request.get_json()
        chip_id = data.get('chip_id')
        user_id = data.get('user_id')
        
        if not chip_id:
            return jsonify({'success': False, 'error': '缺少芯片ID'}), 400
        
        # 记录验证日志
        log_data = {
            'chip_id': chip_id,
            'user_id': user_id,
            'verification_type': 'verification',
            'request_ip': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', '')[:500],
            'device_info': json.dumps({
                'timestamp': datetime.now().isoformat(),
                'source': 'api'
            })
        }
        
        start_time = time.time()
        
        # 查找手串信息
        bracelet = db.execute_query(
            "SELECT * FROM bracelets WHERE chip_id = %s AND status IN ('consecrated', 'activated')",
            (chip_id,),
            fetch=True
        )
        
        if not bracelet:
            # 创建模拟手串数据（开发阶段）
            bracelet_info = {
                'id': f'bracelet_{chip_id}',
                'chipId': chip_id,
                'material': '小叶紫檀',
                'beadCount': 108,
                'consecrationDate': '2024年1月15日',
                'consecrationTemple': '灵隐寺',
                'consecrationMaster': '慧明法师',
                'consecrationVideo': 'https://ssswork.oss-cn-hangzhou.aliyuncs.com/jss/669_raw.mp4',
                'energyLevel': 100,
                'activationTime': datetime.now().isoformat(),
                'lastVerified': datetime.now().isoformat()
            }
            
            log_data.update({
                'verification_result': 'success',
                'response_time_ms': int((time.time() - start_time) * 1000)
            })
            
            # 记录模拟验证
            if db.connection:
                db.execute_query(
                    """
                    INSERT INTO nfc_verification_logs (chip_id, user_id, verification_type, 
                                                      verification_result, request_ip, user_agent, 
                                                      device_info, response_time_ms)
                    VALUES (%(chip_id)s, %(user_id)s, %(verification_type)s, %(verification_result)s,
                            %(request_ip)s, %(user_agent)s, %(device_info)s, %(response_time_ms)s)
                    """,
                    log_data
                )
            
            return jsonify({
                'success': True,
                'bracelet_info': bracelet_info,
                'needs_reactivation': False,
                'days_since_last_use': 0,
                'verification_time': datetime.now().isoformat(),
                'note': '模拟数据 - 数据库中无此手串记录'
            })
        
        bracelet = bracelet[0]
        
        # 处理真实手串数据的逻辑...
        # （省略详细的数据库操作代码）
        
        return jsonify({
            'success': True,
            'bracelet_info': {
                'id': bracelet['id'],
                'chipId': bracelet['chip_id'],
                'material': bracelet['material'],
                'beadCount': bracelet['bead_count']
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ============ 吉位计算API ============

@app.route('/api/calculate-auspicious-directions', methods=['POST'])
def calculate_auspicious_directions():
    """世界级东方玄学吉位计算API"""
    try:
        from services.auspicious_direction_service import AuspiciousDirectionService, AuspiciousDirectionRequest
        
        data = request.get_json()
        
        # 验证请求数据
        required_fields = ['birthdate', 'name', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需字段: {field}'}), 400
        
        # 创建吉位计算服务实例
        direction_service = AuspiciousDirectionService()
        
        # 创建请求对象
        direction_request = AuspiciousDirectionRequest(
            birthdate=data['birthdate'],
            name=data['name'],
            gender=data['gender'],
            target_date=data.get('target_date'),
            current_location=data.get('current_location')
        )
        
        # 计算吉位
        result = direction_service.calculate_auspicious_directions(direction_request)
        
        # 准备返回数据
        def direction_to_dict(direction_analysis):
            return {
                'direction': direction_analysis.direction,
                'degrees': direction_analysis.degrees,
                'element': direction_analysis.element,
                'bagua': direction_analysis.bagua,
                'star_number': direction_analysis.star_number,
                'energy_level': direction_analysis.energy_level,
                'fortune_score': direction_analysis.fortune_score,
                'suitable_activities': direction_analysis.suitable_activities,
                'avoid_activities': direction_analysis.avoid_activities,
                'time_period': direction_analysis.time_period,
                'description': direction_analysis.description
            }
        
        response_data = {
            'date': result.date,
            'best_direction': direction_to_dict(result.best_direction),
            'good_directions': [direction_to_dict(d) for d in result.good_directions],
            'neutral_directions': [direction_to_dict(d) for d in result.neutral_directions],
            'avoid_directions': [direction_to_dict(d) for d in result.avoid_directions],
            'personal_analysis': result.personal_analysis,
            'flying_star_pattern': result.flying_star_pattern,
            'qimen_analysis': result.qimen_analysis,
            'daily_summary': result.daily_summary,
            'recommendations': result.recommendations
        }
        
        return jsonify({
            'success': True,
            'data': response_data,
            'method': 'traditional_xuanxue'
        })
        
    except Exception as e:
        print(f"吉位计算错误: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============ 今日宜忌计算API ============

@app.route('/api/calculate-daily-taboo', methods=['POST'])
def calculate_daily_taboo():
    """世界级个人化今日宜忌计算API"""
    try:
        from services.daily_taboo_service import DailyTabooService, DailyTabooRequest
        
        data = request.get_json()
        
        # 验证请求数据
        required_fields = ['birthdate', 'name', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需字段: {field}'}), 400
        
        # 创建今日宜忌服务实例
        taboo_service = DailyTabooService()
        
        # 创建请求对象
        taboo_request = DailyTabooRequest(
            birthdate=data['birthdate'],
            name=data['name'],
            gender=data['gender'],
            target_date=data.get('target_date'),
            current_location=data.get('current_location')
        )
        
        # 计算今日宜忌
        result = taboo_service.calculate_daily_taboo(taboo_request)
        
        # 准备返回数据
        def activity_to_dict(activity):
            return {
                'activity': activity.activity,
                'category': activity.category,
                'suitability': activity.suitability,
                'reason': activity.reason,
                'best_time': activity.best_time,
                'duration': activity.duration
            }
        
        response_data = {
            'date': result.date,
            'lunar_date': result.lunar_date,
            'day_stem_branch': result.day_stem_branch,
            'suitable_activities': [activity_to_dict(a) for a in result.suitable_activities],
            'unsuitable_activities': [activity_to_dict(a) for a in result.unsuitable_activities],
            'excellent_activities': [activity_to_dict(a) for a in result.excellent_activities],
            'forbidden_activities': [activity_to_dict(a) for a in result.forbidden_activities],
            'general_fortune': result.general_fortune,
            'daily_summary': result.daily_summary,
            'best_hours': result.best_hours,
            'worst_hours': result.worst_hours,
            'personal_analysis': result.personal_analysis,
            'traditional_basis': result.traditional_basis
        }
        
        return jsonify({
            'success': True,
            'data': response_data,
            'method': 'traditional_calendar'
        })
        
    except Exception as e:
        print(f"今日宜忌计算错误: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============ 幸运数字计算API ============

@app.route('/api/calculate-lucky-numbers', methods=['POST'])
def calculate_lucky_numbers():
    """世界级东方玄学幸运数字计算API"""
    try:
        from services.lucky_number_service import LuckyNumberService, LuckyNumberRequest
        
        data = request.get_json()
        
        # 验证请求数据
        required_fields = ['birthdate', 'name', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需字段: {field}'}), 400
        
        # 创建幸运数字服务实例
        lucky_number_service = LuckyNumberService()
        
        # 创建请求对象
        number_request = LuckyNumberRequest(
            birthdate=data['birthdate'],
            name=data['name'],
            gender=data['gender'],
            target_date=data.get('target_date')
        )
        
        # 计算幸运数字
        result = lucky_number_service.calculate_lucky_numbers(number_request)
        
        # 准备返回数据
        response_data = {
            'primary_numbers': result.primary_numbers,
            'secondary_numbers': result.secondary_numbers,
            'avoid_numbers': result.avoid_numbers,
            'special_combinations': result.special_combinations,
            'explanation': result.explanation,
            'confidence': result.confidence,
            'traditional_basis': result.traditional_basis,
            'number_analysis': result.number_analysis,
            'bazi_numbers': result.bazi_numbers
        }
        
        return jsonify({
            'success': True,
            'data': response_data,
            'method': 'traditional_numerology'
        })
        
    except Exception as e:
        print(f"幸运数字计算错误: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============ 幸运色计算API ============

@app.route('/api/calculate-lucky-colors', methods=['POST'])
def calculate_lucky_colors():
    """世界级八字用神幸运色计算API"""
    try:
        from services.lucky_color_service import LuckyColorService, LuckyColorRequest
        
        data = request.get_json()
        
        # 验证请求数据
        required_fields = ['birthdate', 'name', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需字段: {field}'}), 400
        
        # 创建幸运色服务实例
        lucky_color_service = LuckyColorService()
        
        # 创建请求对象
        color_request = LuckyColorRequest(
            birthdate=data['birthdate'],
            name=data['name'],
            gender=data['gender'],
            target_date=data.get('target_date')
        )
        
        # 计算幸运色
        result = lucky_color_service.calculate_lucky_colors(color_request)
        
        # 准备返回数据
        response_data = {
            'primary_colors': result.primary_colors,
            'secondary_colors': result.secondary_colors,
            'avoid_colors': result.avoid_colors,
            'seasonal_colors': result.seasonal_colors,
            'explanation': result.explanation,
            'confidence': result.confidence,
            'traditional_basis': result.traditional_basis,
            'yongshen_analysis': result.yongshen_analysis,
            'bazi_chart': result.bazi_chart
        }
        
        return jsonify({
            'success': True,
            'data': response_data,
            'method': 'master_bazi_yongshen'
        })
        
    except Exception as e:
        print(f"幸运色计算错误: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============ 健康检查和状态API ============

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    try:
        # 检查数据库连接
        mysql_status = "connected" if db.connection else "disconnected"
        redis_status = "connected" if db.redis_client else "disconnected"
        
        # 检查数据库中的数据
        user_count = 0
        bracelet_count = 0
        
        if db.connection:
            try:
                users = db.execute_query("SELECT COUNT(*) as count FROM users", fetch=True)
                user_count = users[0]['count'] if users else 0
                
                bracelets = db.execute_query("SELECT COUNT(*) as count FROM bracelets", fetch=True)
                bracelet_count = bracelets[0]['count'] if bracelets else 0
            except:
                pass
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'database': {
                'mysql': mysql_status,
                'redis': redis_status
            },
            'data': {
                'users': user_count,
                'bracelets': bracelet_count
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    print("🚀 启动Divine Friend PWA后端服务")
    print("=" * 50)
    print("📊 数据库状态:")
    
    # 测试数据库连接
    if db.connection:
        print("  ✅ MySQL: 已连接")
    else:
        print("  ❌ MySQL: 连接失败")
    
    if db.redis_client:
        print("  ✅ Redis: 已连接")
    else:
        print("  ❌ Redis: 连接失败")
    
    print("\n🔗 API端点:")
    print("  - POST /api/users/register - 用户注册")
    print("  - POST /api/users/login - 用户登录")
    print("  - GET  /api/users/profile - 获取用户资料")
    print("  - PUT  /api/users/profile - 更新用户资料")
    print("  - POST /api/data/sync - 数据同步")
    print("  - GET  /api/data/restore - 数据恢复")
    print("  - POST /api/bracelets/verify - 手串验证")
    print("  - GET  /api/health - 健康检查")
    
    print(f"\n🌐 服务启动: http://localhost:5001")
    print("=" * 50)
    
    # 开发模式启动 - 使用5001端口避免macOS AirPlay冲突
    app.run(host='0.0.0.0', port=5001, debug=True)