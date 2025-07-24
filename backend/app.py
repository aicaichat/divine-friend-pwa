import sxtwl
import collections
from datetime import datetime,timedelta
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

app = Flask(__name__, static_url_path='', static_folder='static')
CORS(app)


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
        
        # 获取用户偏好（可选）
        user_preferences = data.get('user_preferences')
        
        # 执行神仙匹配
        recommendation = deity_matching_service.match_deities(
            data['bazi_analysis'], 
            user_preferences
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
    """今日运势计算API"""
    try:
        data = request.get_json()
        
        # 验证请求数据
        required_fields = ['birthdate', 'name', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'缺少必需字段: {field}'}), 400
        
        # 创建请求对象
        fortune_request = DailyFortuneRequest(
            birthdate=data['birthdate'],
            name=data['name'],
            gender=data['gender'],
            target_date=data.get('target_date')  # 可选的目标日期
        )
        
        # 计算今日运势
        result = daily_fortune_service.calculate_daily_fortune(fortune_request)
        
        return jsonify({
            'success': True,
            'data': {
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
                'dayun_info': result.dayun_info
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


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


@app.route('/ask', methods=['POST'])
def ask_fortune():
    client = OpenAI(api_key="")
    data = request.json
    prompt = data['prompt']
    
    try:
        response = client.ChatCompletion.create(
          model="gpt-4-turbo-preview",
          messages=[
              {"role": "system", "content": "You are an AI specialized in fortune and wealth advice."},
              {"role": "user", "content": prompt}
          ]
        )
        # 根据实际返回结构调整
        return jsonify({"response": response.choices[0].message['content']})
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