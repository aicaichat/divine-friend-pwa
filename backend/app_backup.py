import sxtwl
import collections
from datetime import datetime,timedelta,date
from bidict import bidict
from flask import Flask, request, jsonify
from flask_cors import CORS
from sssmu import  BaziGraveyard,GraveyardTracker
from baziutil import Gan,Zhi,Ten_deities,Dizhi_gx,Zhi_atts,bazi_target_zhi_f,branch_hidden_stems,rich_analysis_f,Branch_hidden_stems,Zhi_atts,\
    dayun_analysis_f,Gan_Zhi,find_key_by_value,get_di_relationship,Mu,when_zinv_f,when_bro_f,when_healthy_f,when_rich_f,rich_year_judge,rich_dayun_all,\
    rich_month_judge,today_all,score_shisheng,score_wuxing,advice_wuxing
#from openai import OpenAI
from pathlib import Path
import requests

# 导入新的服务层
from services.bazi_service import bazi_service, BaziRequest
from services.deity_matching_service import deity_matching_service
from services.daily_fortune_service import daily_fortune_service, DailyFortuneRequest
from services.taisui_database import taisui_database
from services.benming_buddha_database import benming_buddha_database
from services.fortune_cache_service import FortuneCacheService

app = Flask(__name__, static_url_path='', static_folder='static')
CORS(app)

# 创建全局服务实例
fortune_cache_service = FortuneCacheService()  # 全局缓存服务实例


@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查端点"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'divine-friend-pwa-backend'
    })


@app.route('/api/calculate-bazi', methods=['POST'])
def calculate_bazi():
    """八字计算API"""
    try:
        data = request.get_json()
        
        # 验证请求数据
        required_fields = ['birthdate', 'name', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需字段: {field}'}), 400
        
        # 创建请求对象
        bazi_request = BaziRequest(
            birthdate=data['birthdate'],
            name=data['name'],
            gender=data['gender']
        )
        
        # 计算八字
        result = bazi_service.calculate_bazi(bazi_request)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/match-deities', methods=['POST'])
def match_deities():
    """神仙匹配API"""
    try:
        data = request.get_json()
        
        if 'bazi_analysis' not in data:
            return jsonify({'error': '缺少八字分析数据'}), 400
        
        # 获取用户偏好和出生年份（可选）
        user_preferences = data.get('user_preferences')
        birth_year = data.get('birth_year')
        
        # 执行神仙匹配
        recommendation = deity_matching_service.match_deities(
            data['bazi_analysis'], 
            user_preferences,
            birth_year
        )
        
        return jsonify({
            'success': True,
            'data': {
                'primary_match': {
                    'deity': {
                        'id': recommendation.primary_match.deity.id,
                        'name': recommendation.primary_match.deity.name,
                        'title': recommendation.primary_match.deity.title,
                        'avatar_url': recommendation.primary_match.deity.avatar_url,
                        'system_prompt': recommendation.primary_match.deity.system_prompt
                    },
                    'compatibility_score': recommendation.primary_match.compatibility_score,
                    'match_reasons': recommendation.primary_match.match_reasons,
                    'personalized_blessings': recommendation.primary_match.personalized_blessings,
                    'guidance_suggestions': recommendation.primary_match.guidance_suggestions
                },
                'secondary_matches': [
                    {
                        'deity': {
                            'id': match.deity.id,
                            'name': match.deity.name,
                            'title': match.deity.title,
                            'avatar_url': match.deity.avatar_url
                        },
                        'compatibility_score': match.compatibility_score,
                        'match_reasons': match.match_reasons
                    }
                    for match in recommendation.secondary_matches
                ],
                # 添加太岁大将相关信息
                'birth_year_taisui': {
                    'general': {
                        'id': recommendation.birth_year_taisui.general.id,
                        'name': recommendation.birth_year_taisui.general.name,
                        'title': recommendation.birth_year_taisui.general.title,
                        'year_stem': recommendation.birth_year_taisui.general.year_stem,
                        'year_branch': recommendation.birth_year_taisui.general.year_branch,
                        'element': recommendation.birth_year_taisui.general.element.value,
                        'avatar_emoji': recommendation.birth_year_taisui.general.avatar_emoji,
                        'color': recommendation.birth_year_taisui.general.color
                    },
                    'compatibility_score': recommendation.birth_year_taisui.compatibility_score,
                    'match_reasons': recommendation.birth_year_taisui.match_reasons,
                    'personalized_blessings': recommendation.birth_year_taisui.personalized_blessings,
                    'guidance_suggestions': recommendation.birth_year_taisui.guidance_suggestions,
                    'is_birth_year_taisui': recommendation.birth_year_taisui.is_birth_year_taisui
                } if recommendation.birth_year_taisui else None,
                'compatible_taisui': [
                    {
                        'general': {
                            'id': match.general.id,
                            'name': match.general.name,
                            'title': match.general.title,
                            'year_stem': match.general.year_stem,
                            'year_branch': match.general.year_branch,
                            'element': match.general.element.value,
                            'avatar_emoji': match.general.avatar_emoji,
                            'color': match.general.color
                        },
                        'compatibility_score': match.compatibility_score,
                        'match_reasons': match.match_reasons,
                        'personalized_blessings': match.personalized_blessings,
                        'guidance_suggestions': match.guidance_suggestions
                    }
                    for match in recommendation.compatible_taisui
                ],
                'explanation': recommendation.explanation
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/calculate-daily-fortune', methods=['POST'])
def calculate_daily_fortune():
    """今日运势计算API - 使用盲派算法"""
    try:
        data = request.get_json()
        
        # 验证请求数据
        required_fields = ['birthdate', 'name', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需字段: {field}'}), 400
        
        # 导入盲派运势服务
        from services.blind_school_fortune_service import BlindSchoolFortuneService, BlindSchoolFortuneRequest
        
        # 创建盲派运势服务实例
        blind_fortune_service = BlindSchoolFortuneService()
        
        # 获取目标日期
        target_date = data.get('target_date', datetime.now().strftime('%Y-%m-%d'))
        
        # 尝试从缓存获取运势
        cached_fortune = fortune_cache_service.get_cached_fortune(
            data['birthdate'], 
            data['name'], 
            data['gender'], 
            target_date
        )
        
        if cached_fortune:
            print(f"从缓存获取盲派运势: {data['name']} - {target_date}")
            return jsonify({
                'success': True,
                'data': cached_fortune,
                'cached': True,
                'method': 'blind_school'
            })
        
        # 缓存未命中，计算新运势
        print(f"计算新盲派运势: {data['name']} - {target_date}")
        
        # 创建请求对象
        fortune_request = BlindSchoolFortuneRequest(
            birthdate=data['birthdate'],
            name=data['name'],
            gender=data['gender'],
            target_date=target_date
        )
        
        # 计算盲派今日运势
        result = blind_fortune_service.calculate_blind_school_fortune(fortune_request)
        
        # 准备返回数据
        fortune_data = {
            'date': result.date,
            'overall_score': result.overall_score,
            'overall_level': result.overall_level,
            'overall_description': result.overall_description,
            'career_fortune': result.career_fortune,
            'wealth_fortune': result.wealth_fortune,
            'health_fortune': result.health_fortune,
            'relationship_fortune': result.relationship_fortune,
            'study_fortune': result.study_fortune,
            'lucky_directions': result.lucky_directions,
            'lucky_colors': result.lucky_colors,
            'lucky_numbers': result.lucky_numbers,
            'avoid_directions': result.avoid_directions,
            'avoid_colors': result.avoid_colors,
            'recommended_activities': result.recommended_activities,
            'avoid_activities': result.avoid_activities,
            'timing_advice': result.timing_advice,
            'bazi_analysis': result.bazi_analysis,
            'dayun_info': result.dayun_info,
            'blind_school_analysis': result.blind_school_analysis,
            'pattern_analysis': result.pattern_analysis,
            'deity_strength_analysis': result.deity_strength_analysis
        }
        
        # 缓存运势结果
        fortune_cache_service.cache_fortune(
            data['birthdate'], 
            data['name'], 
            data['gender'], 
            target_date, 
            fortune_data
        )
        
        return jsonify({
            'success': True,
            'data': fortune_data,
            'cached': False,
            'method': 'blind_school'
        })
        
    except Exception as e:
        print(f"计算盲派今日运势错误: {str(e)}")
        return jsonify({'error': '计算失败，请稍后重试'}), 500


@app.route('/api/analyze-bazi', methods=['POST'])
def analyze_bazi():
    """八字详细分析API"""
    try:
        data = request.get_json()
        
        if 'bazi_chart' not in data or 'analysis_type' not in data:
            return jsonify({'error': '缺少必需字段'}), 400
        
        bazi_chart = data['bazi_chart']
        analysis_type = data['analysis_type']
        
        # 根据分析类型返回相应的分析结果
        analysis_result = bazi_service.get_detailed_analysis(bazi_chart, analysis_type)
        
        return jsonify({
            'success': True,
            'data': analysis_result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/get-taisui-generals', methods=['GET'])
def get_taisui_generals():
    """获取所有太岁大将信息"""
    try:
        # 获取查询参数
        year = request.args.get('year', type=int)
        element = request.args.get('element')
        search = request.args.get('search')
        
        if year:
            # 获取指定年份的太岁大将
            general = taisui_database.get_general_by_year(year)
            generals = [general]
        elif element:
            # 根据五行获取太岁大将
            from services.taisui_database import WuxingElement
            element_enum = WuxingElement(element)
            generals = taisui_database.get_generals_by_element(element_enum)
        elif search:
            # 搜索太岁大将
            generals = taisui_database.search_generals(search)
        else:
            # 获取所有太岁大将
            generals = taisui_database.get_all_generals()
        
        # 格式化返回数据
        result = []
        for general in generals:
            result.append({
                'id': general.id,
                'name': general.name,
                'title': general.title,
                'year_stem': general.year_stem,
                'year_branch': general.year_branch,
                'jiazi_position': general.jiazi_position,
                'element': general.element.value,
                'personality': general.personality,
                'specialties': general.specialties,
                'blessings': general.blessings,
                'protection_areas': general.protection_areas,
                'avatar_emoji': general.avatar_emoji,
                'color': general.color,
                'mantra': general.mantra,
                'historical_background': general.historical_background,
                'compatibility_factors': general.compatibility_factors
            })
        
        return jsonify({
            'success': True,
            'data': {
                'generals': result,
                'total_count': len(result)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/get-birth-year-taisui', methods=['POST'])
def get_birth_year_taisui():
    """根据出生年份获取本命太岁大将"""
    try:
        data = request.get_json()
        
        if 'birth_year' not in data:
            return jsonify({'error': '缺少出生年份'}), 400
        
        birth_year = data['birth_year']
        general = taisui_database.get_general_by_year(birth_year)
        
        # 如果提供了八字分析，计算匹配度
        bazi_analysis = data.get('bazi_analysis')
        compatibility_score = 95.0  # 本命太岁默认高匹配度
        match_reasons = [f"{general.name}是您的本命太岁，天生与您有缘"]
        personalized_blessings = list(general.blessings)
        guidance_suggestions = [
            f"每日向{general.name}虔诚祈祷，获得太岁护佑",
            f"在{general.year_stem}{general.year_branch}年要特别注意太岁方位"
        ]
        
        if bazi_analysis:
            # 使用神仙匹配服务计算详细匹配信息
            from services.deity_matching_service import deity_matching_service
            _, compatible_taisui = deity_matching_service._match_taisui_generals(bazi_analysis, birth_year)
            
            # 找到本命太岁的匹配信息
            birth_year_match = None
            for match in compatible_taisui:
                if match.general.jiazi_position == (birth_year - 4) % 60:
                    birth_year_match = match
                    break
            
            if birth_year_match:
                compatibility_score = birth_year_match.compatibility_score
                match_reasons = birth_year_match.match_reasons
                personalized_blessings = birth_year_match.personalized_blessings
                guidance_suggestions = birth_year_match.guidance_suggestions
        
        return jsonify({
            'success': True,
            'data': {
                'general': {
                    'id': general.id,
                    'name': general.name,
                    'title': general.title,
                    'year_stem': general.year_stem,
                    'year_branch': general.year_branch,
                    'jiazi_position': general.jiazi_position,
                    'element': general.element.value,
                    'personality': general.personality,
                    'specialties': general.specialties,
                    'blessings': general.blessings,
                    'protection_areas': general.protection_areas,
                    'avatar_emoji': general.avatar_emoji,
                    'color': general.color,
                    'mantra': general.mantra,
                    'historical_background': general.historical_background
                },
                'compatibility_score': compatibility_score,
                'match_reasons': match_reasons,
                'personalized_blessings': personalized_blessings,
                'guidance_suggestions': guidance_suggestions,
                'is_birth_year_taisui': True
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/get-benming-buddhas', methods=['GET'])
def get_benming_buddhas():
    """获取本命佛信息"""
    try:
        # 获取查询参数
        year = request.args.get('year', type=int)
        zodiac = request.args.get('zodiac')
        element = request.args.get('element')
        search = request.args.get('search')
        
        if year:
            # 获取指定年份的本命佛
            buddha = benming_buddha_database.get_buddha_by_year(year)
            buddhas = [buddha] if buddha else []
        elif zodiac:
            # 根据生肖获取本命佛
            from services.benming_buddha_database import Zodiac
            zodiac_enum = Zodiac(zodiac)
            buddhas = benming_buddha_database.get_buddha_by_zodiac(zodiac_enum)
        elif element:
            # 根据五行获取本命佛
            from services.benming_buddha_database import WuxingElement
            element_enum = WuxingElement(element)
            buddhas = benming_buddha_database.get_buddhas_by_element(element_enum)
        elif search:
            # 搜索本命佛
            buddhas = benming_buddha_database.search_buddhas(search)
        else:
            # 获取所有本命佛
            buddhas = benming_buddha_database.get_all_buddhas()
        
        # 格式化返回数据
        result = []
        for buddha in buddhas:
            result.append({
                'id': buddha.id,
                'name': buddha.name,
                'sanskrit_name': buddha.sanskrit_name,
                'title': buddha.title,
                'zodiac': [z.value for z in buddha.zodiac],
                'element': buddha.element.value,
                'personality': buddha.personality,
                'specialties': buddha.specialties,
                'blessings': buddha.blessings,
                'protection_areas': buddha.protection_areas,
                'avatar_emoji': buddha.avatar_emoji,
                'color': buddha.color,
                'mantra': buddha.mantra,
                'full_mantra': buddha.full_mantra,
                'description': buddha.description,
                'historical_background': buddha.historical_background,
                'temple_location': buddha.temple_location,
                'festival_date': buddha.festival_date,
                'sacred_items': buddha.sacred_items,
                'meditation_guidance': buddha.meditation_guidance,
                'compatibility_factors': buddha.compatibility_factors
            })
        
        return jsonify({
            'success': True,
            'data': {
                'buddhas': result,
                'total_count': len(result)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/get-birth-year-buddha', methods=['POST'])
def get_birth_year_buddha():
    """根据出生年份获取本命佛"""
    try:
        data = request.get_json()
        
        if 'birth_year' not in data:
            return jsonify({'error': '缺少出生年份'}), 400
        
        birth_year = data['birth_year']
        buddha = benming_buddha_database.get_buddha_by_year(birth_year)
        
        if not buddha:
            return jsonify({'error': '未找到对应的本命佛'}), 404
        
        # 计算匹配度和个性化信息
        bazi_analysis = data.get('bazi_analysis')
        compatibility_score = 90.0  # 本命佛默认高匹配度
        match_reasons = [f"{buddha.name}是您的本命佛，天生与您有缘"]
        personalized_blessings = list(buddha.blessings)
        guidance_suggestions = list(buddha.meditation_guidance)
        
        if bazi_analysis:
            # 根据八字分析调整匹配信息
            day_master_element = bazi_analysis.get('bazi_chart', {}).get('day_master', '')
            
            # 添加五行相关的匹配原因
            if day_master_element:
                match_reasons.append(f"您的日主与{buddha.name}的{buddha.element.value}行相应，能够获得更好的加持")
            
            # 根据八字分析添加特定祝福
            analysis = bazi_analysis.get('analysis', {})
            if analysis.get('career'):
                personalized_blessings.append(f"愿{buddha.name}护佑您事业有成，前程似锦")
            if analysis.get('health'):
                personalized_blessings.append(f"愿{buddha.name}保佑您身体健康，福寿绵长")
            if analysis.get('relationship'):
                personalized_blessings.append(f"愿{buddha.name}加持您人际和谐，感情美满")
        
        return jsonify({
            'success': True,
            'data': {
                'buddha': {
                    'id': buddha.id,
                    'name': buddha.name,
                    'sanskrit_name': buddha.sanskrit_name,
                    'title': buddha.title,
                    'zodiac': [z.value for z in buddha.zodiac],
                    'element': buddha.element.value,
                    'personality': buddha.personality,
                    'specialties': buddha.specialties,
                    'blessings': buddha.blessings,
                    'protection_areas': buddha.protection_areas,
                    'avatar_emoji': buddha.avatar_emoji,
                    'color': buddha.color,
                    'mantra': buddha.mantra,
                    'full_mantra': buddha.full_mantra,
                    'description': buddha.description,
                    'historical_background': buddha.historical_background,
                    'temple_location': buddha.temple_location,
                    'festival_date': buddha.festival_date,
                    'sacred_items': buddha.sacred_items,
                    'meditation_guidance': buddha.meditation_guidance
                },
                'compatibility_score': compatibility_score,
                'match_reasons': match_reasons,
                'personalized_blessings': personalized_blessings,
                'guidance_suggestions': guidance_suggestions,
                'is_birth_year_buddha': True
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/calculate-master-blind-fortune', methods=['POST'])
def calculate_master_blind_fortune():
    """世界级盲派今日运势计算API"""
    try:
        data = request.get_json()
        
        # 验证必要参数
        required_fields = ['birthdate', 'name', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必要参数: {field}'}), 400
        
        # 导入世界级盲派运势服务
        from services.master_blind_school_service import (
            MasterBlindSchoolService,
            MasterBlindFortuneRequest
        )
        
        # 创建世界级盲派运势服务实例
        master_service = MasterBlindSchoolService()
        
        # 检查缓存
        cache_key = f"master_blind:{data['name']}:{data['birthdate']}:{data.get('target_date', str(date.today()))}"
        cached_fortune = fortune_cache_service.get_cached_fortune(cache_key)
        
        if cached_fortune:
            print(f"从缓存获取世界级盲派运势: {data['name']} - {data.get('target_date', str(date.today()))}")
            return jsonify({
                'success': True,
                'data': cached_fortune,
                'cached': True,
                'method': 'master_blind_school'
            })
        
        # 缓存未命中，计算新运势
        print(f"计算新世界级盲派运势: {data['name']} - {data.get('target_date', str(date.today()))}")
        
        # 创建请求对象
        fortune_request = MasterBlindFortuneRequest(
            birthdate=data['birthdate'],
            name=data['name'],
            gender=data['gender'],
            target_date=data.get('target_date')
        )
        
        # 计算世界级盲派今日运势
        result = master_service.calculate_master_blind_fortune(fortune_request)
        
        # 准备返回数据
        fortune_data = {
            'date': result.date,
            'overall_score': result.overall_score,
            'overall_level': result.overall_level,
            'overall_description': result.overall_description,
            
            # 盲派核心分析
            'blind_pattern_analysis': result.blind_pattern_analysis,
            'blind_deity_analysis': result.blind_deity_analysis,
            'blind_element_analysis': result.blind_element_analysis,
            'blind_timing_analysis': result.blind_timing_analysis,
            
            # 各维度运势
            'career_fortune': result.career_fortune,
            'wealth_fortune': result.wealth_fortune,
            'health_fortune': result.health_fortune,
            'relationship_fortune': result.relationship_fortune,
            'study_fortune': result.study_fortune,
            
            # 专业建议
            'master_advice': result.master_advice,
            'timing_advice': result.timing_advice,
            'remedies': result.remedies
        }
        
        # 缓存结果
        fortune_cache_service.cache_fortune(cache_key, fortune_data)
        
        return jsonify({
            'success': True,
            'data': fortune_data,
            'cached': False,
            'method': 'master_blind_school'
        })
        
    except Exception as e:
        print(f"计算世界级盲派今日运势错误: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': '计算失败，请稍后重试'}), 500


# 保留原有的API端点以保持兼容性
@app.route('/calculate-fortune', methods=['POST'])
def calculate_fortune():
    data = request.get_json()

    birthdate = data.get('birthdate')
    name = data.get('name')
    gender = data.get('gender')

    # 使用新的服务层
    bazi_request = BaziRequest(
        birthdate=birthdate,
        name=name,
        gender=gender
    )
    
    fortune_result = bazi_service.calculate_bazi(bazi_request)
    
    return jsonify({
        'success': True,
        'fortune_result': fortune_result,
    })


@app.route('/api/calculate-master-blind-fortune', methods=['POST'])
def calculate_master_blind_fortune():
    """世界级盲派今日运势计算API"""
    try:
        data = request.get_json()
        
        # 验证必要参数
        required_fields = ['birthdate', 'name', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必要参数: {field}'}), 400
        
        # 导入世界级盲派运势服务
        from services.master_blind_school_service import (
            MasterBlindSchoolService,
            MasterBlindFortuneRequest
        )
        
        # 创建世界级盲派运势服务实例
        master_service = MasterBlindSchoolService()
        
        # 检查缓存
        cache_key = f"master_blind:{data['name']}:{data['birthdate']}:{data.get('target_date', str(date.today()))}"
        cached_fortune = fortune_cache_service.get_cached_fortune(cache_key)
        
        if cached_fortune:
            print(f"从缓存获取世界级盲派运势: {data['name']} - {data.get('target_date', str(date.today()))}")
            return jsonify({
                'success': True,
                'data': cached_fortune,
                'cached': True,
                'method': 'master_blind_school'
            })
        
        # 缓存未命中，计算新运势
        print(f"计算新世界级盲派运势: {data['name']} - {data.get('target_date', str(date.today()))}")
        
        # 创建请求对象
        fortune_request = MasterBlindFortuneRequest(
            birthdate=data['birthdate'],
            name=data['name'],
            gender=data['gender'],
            target_date=data.get('target_date')
        )
        
        # 计算世界级盲派今日运势
        result = master_service.calculate_master_blind_fortune(fortune_request)
        
        # 准备返回数据
        fortune_data = {
            'date': result.date,
            'overall_score': result.overall_score,
            'overall_level': result.overall_level,
            'overall_description': result.overall_description,
            
            # 盲派核心分析
            'blind_pattern_analysis': result.blind_pattern_analysis,
            'blind_deity_analysis': result.blind_deity_analysis,
            'blind_element_analysis': result.blind_element_analysis,
            'blind_timing_analysis': result.blind_timing_analysis,
            
            # 各维度运势
            'career_fortune': result.career_fortune,
            'wealth_fortune': result.wealth_fortune,
            'health_fortune': result.health_fortune,
            'relationship_fortune': result.relationship_fortune,
            'study_fortune': result.study_fortune,
            
            # 专业建议
            'master_advice': result.master_advice,
            'timing_advice': result.timing_advice,
            'remedies': result.remedies
        }
        
        # 缓存结果
        fortune_cache_service.cache_fortune(cache_key, fortune_data)
        
        return jsonify({
            'success': True,
            'data': fortune_data,
            'cached': False,
            'method': 'master_blind_school'
        })
        
    except Exception as e:
        print(f"计算世界级盲派今日运势错误: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': '计算失败，请稍后重试'}), 500

@app.route('/ask', methods=['POST'])
def ask_fortune():
    # client = OpenAI(api_key="") # This line is removed as per the new_code, as the service is now imported directly.
    data = request.json
    prompt = data['prompt']
    
    try:
        # response = client.ChatCompletion.create( # This line is removed as per the new_code, as the service is now imported directly.
        #   model="gpt-4-turbo-preview",
        #   messages=[
        #       {"role": "system", "content": "You are an AI specialized in fortune and wealth advice."},
        #       {"role": "user", "content": prompt}
        #   ]
        # )
        # 根据实际返回结构调整 # This line is removed as per the new_code, as the service is now imported directly.
        return jsonify({"response": "Fortune advice API is currently unavailable."}) # This line is removed as per the new_code, as the service is now imported directly.
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/wtwt', methods=['post'])
def wtwt():
    data = request.get_json()
    #print(data)
    result=today_all(data["userid"],data["min_summary"])
   
    return jsonify(result)

@app.route('/api/createOrder', methods=['POST'])
def payment():
    data = {
        'appid': 'wx67f7bff9ea982f70',
        'mch_id': 'your_merchant_id',
        'nonce_str': 'random_string',
        'sign': 'generated_signature',
        'body': 'Order Description',
        'out_trade_no': 'order_id',
        'total_fee': 'order_amount',
        'spbill_create_ip': 'client_ip',
        'notify_url': 'https://yourserver.com/notify',
        'trade_type': 'JSAPI',
        'openid': 'user_openid'
    }
    response = requests.post('https://api.mch.weixin.qq.com/pay/unifiedorder', data=data)
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)