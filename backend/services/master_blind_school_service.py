"""
世界级盲派八字今日运势计算服务
基于正宗盲派理论体系，融合传统命理学精髓

盲派八字学特点：
1. 以象法为主，重视实战应用
2. 格局为先，用神为要
3. 重视天干透出，地支藏干
4. 强调生克制化，刑冲合害
5. 注重大运流年的动态影响
"""

import sxtwl
from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import json
import math
import random
from collections import defaultdict

from .bazi_service import BaziService
from baziutil import Gan, Zhi, Ten_deities, Dizhi_gx, Branch_hidden_stems


@dataclass
class MasterBlindFortuneRequest:
    """世界级盲派运势计算请求"""
    birthdate: str  # 出生日期时间
    name: str
    gender: str
    target_date: Optional[str] = None  # 目标日期，默认为今天


@dataclass
class MasterBlindFortuneResult:
    """世界级盲派运势结果"""
    date: str
    overall_score: int  # 综合运势评分 1-100
    overall_level: str  # 运势等级
    overall_description: str  # 综合运势描述
    
    # 盲派核心分析
    blind_pattern_analysis: Dict[str, Any]  # 格局分析
    blind_deity_analysis: Dict[str, Any]    # 十神分析
    blind_element_analysis: Dict[str, Any]  # 五行分析
    blind_timing_analysis: Dict[str, Any]   # 应期分析
    
    # 各维度运势
    career_fortune: Dict[str, Any]
    wealth_fortune: Dict[str, Any]
    health_fortune: Dict[str, Any]
    relationship_fortune: Dict[str, Any]
    study_fortune: Dict[str, Any]
    
    # 盲派专业建议
    master_advice: List[str]  # 大师级建议
    timing_advice: List[str]  # 应期建议
    remedies: List[str]       # 化解方法


class MasterBlindSchoolService:
    """世界级盲派八字运势计算服务"""
    
    def __init__(self):
        self.bazi_service = BaziService()
        self._init_blind_configurations()
    
    def _init_blind_configurations(self):
        """初始化盲派配置"""
        
        # 盲派格局体系
        self.blind_patterns = {
            # 正格八格
            '正官格': {
                'description': '正官透干通根，得位得时',
                'condition': self._check_zhengguan_pattern,
                'strength': 'strong',
                'favorable': True,
                'score_base': 80
            },
            '偏官格': {
                'description': '七杀透干有制化，化杀为权',
                'condition': self._check_qisha_pattern,
                'strength': 'strong',
                'favorable': True,
                'score_base': 75
            },
            '正财格': {
                'description': '正财透干护印，财官相生',
                'condition': self._check_zhengcai_pattern,
                'strength': 'medium',
                'favorable': True,
                'score_base': 70
            },
            '偏财格': {
                'description': '偏财透干生官，财运亨通',
                'condition': self._check_piancai_pattern,
                'strength': 'medium',
                'favorable': True,
                'score_base': 72
            },
            '食神格': {
                'description': '食神吐秀生财，才华横溢',
                'condition': self._check_shishen_pattern,
                'strength': 'medium',
                'favorable': True,
                'score_base': 68
            },
            '伤官格': {
                'description': '伤官配印或生财，智慧过人',
                'condition': self._check_shangguan_pattern,
                'strength': 'medium',
                'favorable': False,
                'score_base': 55
            },
            '正印格': {
                'description': '正印护身生扶，学业有成',
                'condition': self._check_zhengyin_pattern,
                'strength': 'medium',
                'favorable': True,
                'score_base': 65
            },
            '偏印格': {
                'description': '偏印夺食需制化，智慧独特',
                'condition': self._check_pianyin_pattern,
                'strength': 'weak',
                'favorable': False,
                'score_base': 50
            },
            
            # 特殊格局
            '从强格': {
                'description': '日主极强，从其旺势',
                'condition': self._check_congqiang_pattern,
                'strength': 'special',
                'favorable': True,
                'score_base': 85
            },
            '从弱格': {
                'description': '日主极弱，顺其衰势',
                'condition': self._check_congruo_pattern,
                'strength': 'special',
                'favorable': True,
                'score_base': 75
            },
            '从财格': {
                'description': '财星当令，日主从财',
                'condition': self._check_congcai_pattern,
                'strength': 'special',
                'favorable': True,
                'score_base': 78
            },
            '从杀格': {
                'description': '七杀专权，日主从杀',
                'condition': self._check_congsha_pattern,
                'strength': 'special',
                'favorable': True,
                'score_base': 80
            }
        }
        
        # 盲派十神关系
        self.blind_deity_relations = {
            '比肩': {
                'nature': '帮身',
                'relationship': '兄弟朋友',
                'positive': ['合作', '友谊', '平等'],
                'negative': ['竞争', '分财', '固执'],
                'blind_key': '同我者，助力也'
            },
            '劫财': {
                'nature': '劫财',
                'relationship': '竞争对手',
                'positive': ['果断', '勇敢', '开拓'],
                'negative': ['破财', '冲动', '争夺'],
                'blind_key': '夺我财者，需防范'
            },
            '食神': {
                'nature': '泄秀',
                'relationship': '才华表现',
                'positive': ['才华', '温和', '福气'],
                'negative': ['懒散', '享乐', '理想'],
                'blind_key': '我生者，福禄也'
            },
            '伤官': {
                'nature': '泄身',
                'relationship': '才智发挥',
                'positive': ['聪明', '创新', '艺术'],
                'negative': ['傲慢', '尖刻', '叛逆'],
                'blind_key': '我生者，聪明反被聪明误'
            },
            '偏财': {
                'nature': '我克',
                'relationship': '意外财富',
                'positive': ['机遇', '魅力', '慷慨'],
                'negative': ['风险', '花心', '投机'],
                'blind_key': '我克者，偏财也'
            },
            '正财': {
                'nature': '我克',
                'relationship': '正当收入',
                'positive': ['稳定', '实用', '节俭'],
                'negative': ['保守', '物质', '现实'],
                'blind_key': '我克者，正财也'
            },
            '七杀': {
                'nature': '克身',
                'relationship': '压力挑战',
                'positive': ['权威', '勇敢', '突破'],
                'negative': ['压力', '冲动', '危险'],
                'blind_key': '克我者，七杀也，需制化'
            },
            '正官': {
                'nature': '克身',
                'relationship': '正当权威',
                'positive': ['名声', '地位', '责任'],
                'negative': ['束缚', '压力', '保守'],
                'blind_key': '克我者，正官也，贵气之源'
            },
            '偏印': {
                'nature': '生身',
                'relationship': '偏门学识',
                'positive': ['直觉', '神秘', '独特'],
                'negative': ['孤僻', '挑剔', '不实'],
                'blind_key': '生我者，偏印也，枭神夺食'
            },
            '正印': {
                'nature': '生身',
                'relationship': '正统学识',
                'positive': ['学识', '慈爱', '保护'],
                'negative': ['依赖', '迟缓', '保守'],
                'blind_key': '生我者，正印也，生身护体'
            }
        }
        
        # 盲派五行力量
        self.blind_element_strength = {
            '木': {'春': 100, '夏': 70, '秋': 30, '冬': 60},
            '火': {'春': 70, '夏': 100, '秋': 50, '冬': 20},
            '土': {'春': 50, '夏': 80, '秋': 100, '冬': 70},
            '金': {'春': 30, '夏': 50, '秋': 100, '冬': 80},
            '水': {'春': 60, '夏': 20, '秋': 70, '冬': 100}
        }
        
        # 盲派应期判断
        self.blind_timing_rules = {
            '喜神应期': {
                'condition': '喜神值令或透干',
                'timing': '当年当月即应',
                'intensity': 'high'
            },
            '用神应期': {
                'condition': '用神得力或逢生',
                'timing': '三月内见效',
                'intensity': 'high'
            },
            '忌神应期': {
                'condition': '忌神当令或逢生',
                'timing': '当年必有阻滞',
                'intensity': 'negative'
            },
            '仇神应期': {
                'condition': '仇神透干或得力',
                'timing': '半年内见凶',
                'intensity': 'negative'
            }
        }

    def _init_deity_combinations(self):
        """初始化十神组合配置"""
        self.deity_combinations = {
            ('正官', '正印'): {
                'name': '官印相生',
                'effect': '仕途顺畅，贵人提携',
                'score_impact': 15
            },
            ('七杀', '食神'): {
                'name': '食神制杀',
                'effect': '化压力为动力',
                'score_impact': 20
            }
        }
        
        # 添加十神简称到全称的映射
        self.deity_name_mapping = {
            '比': '比肩',
            '劫': '劫财', 
            '食': '食神',
            '伤': '伤官',
            '才': '偏财',
            '财': '正财',
            '杀': '七杀',
            '官': '正官',
            '枭': '偏印',  # 这是关键修复
            '印': '正印'
        }

    def calculate_master_blind_fortune(self, request: MasterBlindFortuneRequest) -> MasterBlindFortuneResult:
        """世界级盲派今日运势计算主函数"""
        
        # 1. 解析八字
        bazi_info = self._parse_bazi_comprehensive(request)
        
        # 2. 盲派格局分析
        pattern_analysis = self._analyze_blind_patterns(bazi_info)
        
        # 3. 盲派十神分析
        deity_analysis = self._analyze_blind_deities(bazi_info)
        
        # 4. 盲派五行分析
        element_analysis = self._analyze_blind_elements(bazi_info)
        
        # 5. 盲派应期分析
        timing_analysis = self._analyze_blind_timing(bazi_info, request.target_date)
        
        # 6. 各维度运势计算
        career_fortune = self._calculate_career_fortune(bazi_info, pattern_analysis, deity_analysis)
        wealth_fortune = self._calculate_wealth_fortune(bazi_info, pattern_analysis, deity_analysis)
        health_fortune = self._calculate_health_fortune(bazi_info, element_analysis)
        relationship_fortune = self._calculate_relationship_fortune(bazi_info, deity_analysis)
        study_fortune = self._calculate_study_fortune(bazi_info, deity_analysis)
        
        # 7. 综合评分
        overall_score = self._calculate_comprehensive_score(
            pattern_analysis, deity_analysis, element_analysis, timing_analysis
        )
        
        # 8. 运势等级
        overall_level = self._determine_fortune_level(overall_score)
        
        # 9. 生成大师级建议
        master_advice = self._generate_master_advice(
            pattern_analysis, deity_analysis, element_analysis, timing_analysis
        )
        
        # 10. 应期建议
        timing_advice = self._generate_timing_advice(timing_analysis)
        
        # 11. 化解方法
        remedies = self._generate_remedies(pattern_analysis, deity_analysis, element_analysis)
        
        return MasterBlindFortuneResult(
            date=request.target_date or str(date.today()),
            overall_score=overall_score,
            overall_level=overall_level,
            overall_description=self._generate_overall_description(overall_score, pattern_analysis),
            blind_pattern_analysis=pattern_analysis,
            blind_deity_analysis=deity_analysis,
            blind_element_analysis=element_analysis,
            blind_timing_analysis=timing_analysis,
            career_fortune=career_fortune,
            wealth_fortune=wealth_fortune,
            health_fortune=health_fortune,
            relationship_fortune=relationship_fortune,
            study_fortune=study_fortune,
            master_advice=master_advice,
            timing_advice=timing_advice,
            remedies=remedies
        )
    
    def _parse_bazi_comprehensive(self, request: MasterBlindFortuneRequest) -> Dict[str, Any]:
        """全面解析八字信息"""
        try:
            # 解析出生时间
            birth_dt = datetime.fromisoformat(request.birthdate.replace('Z', '+00:00'))
            target_dt = datetime.fromisoformat(request.target_date.replace('Z', '+00:00')) if request.target_date else datetime.now()
            
            # 使用正确的sxtwl API
            lunar = sxtwl.Lunar()
            day_info = lunar.getDayBySolar(birth_dt.year, birth_dt.month, birth_dt.day)
            
            if day_info is None:
                print(f"sxtwl解析失败，使用默认八字")
                return self._get_default_bazi()
            
            # 获取八字信息（简化实现）
            year_index = (birth_dt.year - 4) % 60  # 甲子年为起点
            month_index = (birth_dt.month - 1 + year_index * 12) % 60
            day_index = day_info.d8Char % 60
            hour_index = (birth_dt.hour // 2) % 12 + day_index
            
            # 天干地支数组
            gan_list = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
            zhi_list = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
            
            # 计算四柱
            year_gan = gan_list[year_index % 10]
            year_zhi = zhi_list[year_index % 12]
            month_gan = gan_list[month_index % 10] 
            month_zhi = zhi_list[month_index % 12]
            day_gan = gan_list[day_index % 10]
            day_zhi = zhi_list[day_index % 12]
            hour_gan = gan_list[hour_index % 10]
            hour_zhi = zhi_list[hour_index % 12]
            
            # 计算大运
            dayun_info = self._calculate_dayun_simple(birth_dt, target_dt)
            
            # 计算流年
            liu_nian_info = self._calculate_liu_nian(target_dt)
            
            return {
                'birth_date': birth_dt,
                'target_date': target_dt,
                'year_pillar': {'gan': year_gan, 'zhi': year_zhi},
                'month_pillar': {'gan': month_gan, 'zhi': month_zhi},
                'day_pillar': {'gan': day_gan, 'zhi': day_zhi},
                'hour_pillar': {'gan': hour_gan, 'zhi': hour_zhi},
                'day_master': day_gan,
                'dayun_info': dayun_info,
                'liu_nian_info': liu_nian_info,
                'season': self._get_season(birth_dt.month),
                'gender': request.gender,
                'name': request.name
            }
            
        except Exception as e:
            print(f"解析八字错误: {str(e)}")
            # 返回默认值
            return self._get_default_bazi()
    
    def _analyze_blind_patterns(self, bazi_info: Dict[str, Any]) -> Dict[str, Any]:
        """盲派格局分析"""
        detected_patterns = []
        main_pattern = None
        pattern_strength = 0
        
        for pattern_name, pattern_config in self.blind_patterns.items():
            if pattern_config['condition'](bazi_info):
                pattern_info = {
                    'name': pattern_name,
                    'description': pattern_config['description'],
                    'strength': pattern_config['strength'],
                    'favorable': pattern_config['favorable'],
                    'score_base': pattern_config['score_base']
                }
                detected_patterns.append(pattern_info)
                
                # 确定主格局
                if not main_pattern or pattern_config['score_base'] > pattern_strength:
                    main_pattern = pattern_info
                    pattern_strength = pattern_config['score_base']
        
        # 如果没有检测到格局，使用日主强弱判断
        if not detected_patterns:
            main_pattern = self._determine_basic_pattern(bazi_info)
            detected_patterns = [main_pattern]
        
        return {
            'main_pattern': main_pattern,
            'all_patterns': detected_patterns,
            'pattern_count': len(detected_patterns),
            'pattern_interaction': self._analyze_pattern_interaction(detected_patterns),
            'pattern_quality': self._evaluate_pattern_quality(main_pattern, bazi_info)
        }
    
    def _analyze_blind_deities(self, bazi_info: Dict[str, Any]) -> Dict[str, Any]:
        """盲派十神分析"""
        day_master = bazi_info['day_master']
        deity_distribution = defaultdict(int)
        deity_positions = defaultdict(list)
        
        # 分析各柱十神
        pillars = ['year_pillar', 'month_pillar', 'day_pillar', 'hour_pillar']
        for pillar_name in pillars:
            pillar = bazi_info[pillar_name]
            
            # 天干十神
            if pillar_name != 'day_pillar':  # 日干不计算十神
                gan_deity = self._get_deity(day_master, pillar['gan'])
                deity_distribution[gan_deity] += 1
                deity_positions[gan_deity].append(f"{pillar_name}_gan")
            
            # 地支本气十神
            zhi_main_gan = self._get_zhi_main_gan(pillar['zhi'])
            zhi_deity = self._get_deity(day_master, zhi_main_gan)
            deity_distribution[zhi_deity] += 0.8
            deity_positions[zhi_deity].append(f"{pillar_name}_zhi_main")
            
            # 地支藏干十神
            hidden_gans = self._get_zhi_hidden_gans(pillar['zhi'])
            for hidden_gan in hidden_gans:
                hidden_deity = self._get_deity(day_master, hidden_gan)
                deity_distribution[hidden_deity] += 0.3
                deity_positions[hidden_deity].append(f"{pillar_name}_zhi_hidden")
        
        # 确定主要十神
        main_deity = max(deity_distribution.items(), key=lambda x: x[1])[0] if deity_distribution else '比肩'
        
        # 十神组合分析
        deity_combinations = self._analyze_deity_combinations(deity_distribution)
        
        # 十神力量分析
        deity_strength = self._calculate_deity_strength(deity_distribution, bazi_info)
        
        return {
            'main_deity': main_deity,
            'deity_distribution': dict(deity_distribution),
            'deity_positions': dict(deity_positions),
            'deity_combinations': deity_combinations,
            'deity_strength': deity_strength,
            'deity_quality': self._evaluate_deity_quality(main_deity, bazi_info)
        }
    
    def _analyze_blind_elements(self, bazi_info: Dict[str, Any]) -> Dict[str, Any]:
        """盲派五行分析"""
        element_count = defaultdict(float)
        element_strength = defaultdict(float)
        
        # 统计五行分布
        pillars = ['year_pillar', 'month_pillar', 'day_pillar', 'hour_pillar']
        for pillar_name in pillars:
            pillar = bazi_info[pillar_name]
            
            # 天干五行
            gan_element = self._get_gan_element(pillar['gan'])
            element_count[gan_element] += 1
            element_strength[gan_element] += self._get_element_seasonal_strength(gan_element, bazi_info['season'])
            
            # 地支五行
            zhi_element = self._get_zhi_element(pillar['zhi'])
            element_count[zhi_element] += 1
            element_strength[zhi_element] += self._get_element_seasonal_strength(zhi_element, bazi_info['season'])
        
        # 确定五行旺衰
        strongest_element = max(element_strength.items(), key=lambda x: x[1])[0]
        weakest_element = min(element_strength.items(), key=lambda x: x[1])[0]
        
        # 用神喜忌分析
        use_god_analysis = self._determine_use_god(bazi_info, element_strength)
        
        # 五行平衡度
        balance_score = self._calculate_element_balance(element_strength)
        
        return {
            'element_count': dict(element_count),
            'element_strength': dict(element_strength),
            'strongest_element': strongest_element,
            'weakest_element': weakest_element,
            'use_god': use_god_analysis['use_god'],
            'avoid_god': use_god_analysis['avoid_god'],
            'xi_god': use_god_analysis['xi_god'],
            'balance_score': balance_score,
            'element_flow': self._analyze_element_flow(bazi_info)
        }
    
    def _analyze_blind_timing(self, bazi_info: Dict[str, Any], target_date: str) -> Dict[str, Any]:
        """盲派应期分析"""
        target_dt = datetime.fromisoformat(target_date.replace('Z', '+00:00')) if target_date else datetime.now()
        
        # 当前大运分析
        current_dayun = bazi_info['dayun_info']['current_dayun']
        
        # 流年分析
        liu_nian = bazi_info['liu_nian_info']
        
        # 流月分析
        liu_yue = self._calculate_liu_yue(target_dt)
        
        # 应期判断
        timing_predictions = []
        
        # 检查各种应期条件
        for rule_name, rule_config in self.blind_timing_rules.items():
            if self._check_timing_condition(rule_config['condition'], bazi_info, current_dayun, liu_nian):
                timing_predictions.append({
                    'type': rule_name,
                    'timing': rule_config['timing'],
                    'intensity': rule_config['intensity'],
                    'description': self._generate_timing_description(rule_name, rule_config)
                })
        
        # 重要时间节点
        important_periods = self._identify_important_periods(bazi_info, target_dt)
        
        return {
            'current_dayun': current_dayun,
            'liu_nian': liu_nian,
            'liu_yue': liu_yue,
            'timing_predictions': timing_predictions,
            'important_periods': important_periods,
            'timing_quality': self._evaluate_timing_quality(timing_predictions)
        }
    
    def _calculate_comprehensive_score(self, pattern_analysis, deity_analysis, element_analysis, timing_analysis) -> int:
        """综合评分计算"""
        base_score = 50
        
        # 格局分析权重 40%
        pattern_score = pattern_analysis['main_pattern']['score_base'] if pattern_analysis['main_pattern'] else 50
        pattern_quality = pattern_analysis['pattern_quality']
        pattern_contribution = (pattern_score * pattern_quality / 100) * 0.4
        
        # 十神分析权重 25%
        deity_quality = deity_analysis['deity_quality']
        deity_contribution = deity_quality * 0.25
        
        # 五行分析权重 20%
        element_balance = element_analysis['balance_score']
        element_contribution = element_balance * 0.2
        
        # 应期分析权重 15%
        timing_quality = timing_analysis['timing_quality']
        timing_contribution = timing_quality * 0.15
        
        # 计算最终分数
        final_score = base_score + pattern_contribution + deity_contribution + element_contribution + timing_contribution
        
        # 随机波动 ±5分 (模拟命理的不确定性)
        final_score += random.uniform(-5, 5)
        
        return max(1, min(100, int(final_score)))
    
    def _determine_fortune_level(self, score: int) -> str:
        """确定运势等级"""
        if score >= 90:
            return "大吉"
        elif score >= 80:
            return "中吉"
        elif score >= 70:
            return "小吉"
        elif score >= 60:
            return "平"
        elif score >= 50:
            return "小凶"
        elif score >= 40:
            return "中凶"
        else:
            return "大凶"
    
    def _generate_master_advice(self, pattern_analysis, deity_analysis, element_analysis, timing_analysis) -> List[str]:
        """生成大师级建议"""
        advice = []
        
        # 格局建议
        main_pattern = pattern_analysis['main_pattern']
        if main_pattern:
            if main_pattern['favorable']:
                advice.append(f"【格局建议】您的{main_pattern['name']}格局优良，{main_pattern['description']}，宜顺势而为。")
            else:
                advice.append(f"【格局建议】您的{main_pattern['name']}需要调理，{main_pattern['description']}，宜化解不利因素。")
        
        # 十神建议
        main_deity = deity_analysis['main_deity']
        deity_info = self.blind_deity_relations[main_deity]
        advice.append(f"【十神建议】主要十神为{main_deity}，{deity_info['blind_key']}，宜{', '.join(deity_info['positive'])}。")
        
        # 五行建议
        use_god = element_analysis['use_god']
        avoid_god = element_analysis['avoid_god']
        advice.append(f"【五行建议】用神为{use_god}，忌神为{avoid_god}，宜补{use_god}，避{avoid_god}。")
        
        # 应期建议
        timing_predictions = timing_analysis['timing_predictions']
        if timing_predictions:
            for prediction in timing_predictions[:2]:  # 取前两个重要预测
                advice.append(f"【应期建议】{prediction['description']}")
        
        return advice
    
    # 格局判断方法
    def _check_zhengguan_pattern(self, bazi_info: Dict[str, Any]) -> bool:
        """判断正官格"""
        day_master = bazi_info['day_master']
        month_gan = bazi_info['month_pillar']['gan']
        
        # 月干透正官
        if self._get_deity(day_master, month_gan) == '正官':
            return True
        
        # 月支藏正官且透干
        month_zhi = bazi_info['month_pillar']['zhi']
        hidden_gans = self._get_zhi_hidden_gans(month_zhi)
        for gan in hidden_gans:
            if self._get_deity(day_master, gan) == '正官':
                # 检查是否在其他柱透干
                for pillar_name in ['year_pillar', 'hour_pillar']:
                    if bazi_info[pillar_name]['gan'] == gan:
                        return True
        
        return False
    
    def _check_qisha_pattern(self, bazi_info: Dict[str, Any]) -> bool:
        """判断七杀格"""
        day_master = bazi_info['day_master']
        month_gan = bazi_info['month_pillar']['gan']
        
        if self._get_deity(day_master, month_gan) == '七杀':
            return True
        
        month_zhi = bazi_info['month_pillar']['zhi']
        hidden_gans = self._get_zhi_hidden_gans(month_zhi)
        for gan in hidden_gans:
            if self._get_deity(day_master, gan) == '七杀':
                for pillar_name in ['year_pillar', 'hour_pillar']:
                    if bazi_info[pillar_name]['gan'] == gan:
                        return True
        
        return False
    
    def _check_zhengcai_pattern(self, bazi_info: Dict[str, Any]) -> bool:
        """判断正财格"""
        day_master = bazi_info['day_master']
        month_gan = bazi_info['month_pillar']['gan']
        
        if self._get_deity(day_master, month_gan) == '正财':
            return True
        
        month_zhi = bazi_info['month_pillar']['zhi']
        hidden_gans = self._get_zhi_hidden_gans(month_zhi)
        for gan in hidden_gans:
            if self._get_deity(day_master, gan) == '正财':
                for pillar_name in ['year_pillar', 'hour_pillar']:
                    if bazi_info[pillar_name]['gan'] == gan:
                        return True
        
        return False
    
    def _check_piancai_pattern(self, bazi_info: Dict[str, Any]) -> bool:
        """判断偏财格"""
        day_master = bazi_info['day_master']
        month_gan = bazi_info['month_pillar']['gan']
        
        if self._get_deity(day_master, month_gan) == '偏财':
            return True
        
        month_zhi = bazi_info['month_pillar']['zhi']
        hidden_gans = self._get_zhi_hidden_gans(month_zhi)
        for gan in hidden_gans:
            if self._get_deity(day_master, gan) == '偏财':
                for pillar_name in ['year_pillar', 'hour_pillar']:
                    if bazi_info[pillar_name]['gan'] == gan:
                        return True
        
        return False
    
    def _check_shishen_pattern(self, bazi_info: Dict[str, Any]) -> bool:
        """判断食神格"""
        day_master = bazi_info['day_master']
        month_gan = bazi_info['month_pillar']['gan']
        
        if self._get_deity(day_master, month_gan) == '食神':
            return True
        
        month_zhi = bazi_info['month_pillar']['zhi']
        hidden_gans = self._get_zhi_hidden_gans(month_zhi)
        for gan in hidden_gans:
            if self._get_deity(day_master, gan) == '食神':
                for pillar_name in ['year_pillar', 'hour_pillar']:
                    if bazi_info[pillar_name]['gan'] == gan:
                        return True
        
        return False
    
    def _check_shangguan_pattern(self, bazi_info: Dict[str, Any]) -> bool:
        """判断伤官格"""
        day_master = bazi_info['day_master']
        month_gan = bazi_info['month_pillar']['gan']
        
        if self._get_deity(day_master, month_gan) == '伤官':
            return True
        
        month_zhi = bazi_info['month_pillar']['zhi']
        hidden_gans = self._get_zhi_hidden_gans(month_zhi)
        for gan in hidden_gans:
            if self._get_deity(day_master, gan) == '伤官':
                for pillar_name in ['year_pillar', 'hour_pillar']:
                    if bazi_info[pillar_name]['gan'] == gan:
                        return True
        
        return False
    
    def _check_zhengyin_pattern(self, bazi_info: Dict[str, Any]) -> bool:
        """判断正印格"""
        day_master = bazi_info['day_master']
        month_gan = bazi_info['month_pillar']['gan']
        
        if self._get_deity(day_master, month_gan) == '正印':
            return True
        
        month_zhi = bazi_info['month_pillar']['zhi']
        hidden_gans = self._get_zhi_hidden_gans(month_zhi)
        for gan in hidden_gans:
            if self._get_deity(day_master, gan) == '正印':
                for pillar_name in ['year_pillar', 'hour_pillar']:
                    if bazi_info[pillar_name]['gan'] == gan:
                        return True
        
        return False
    
    def _check_pianyin_pattern(self, bazi_info: Dict[str, Any]) -> bool:
        """判断偏印格"""
        day_master = bazi_info['day_master']
        month_gan = bazi_info['month_pillar']['gan']
        
        if self._get_deity(day_master, month_gan) == '偏印':
            return True
        
        month_zhi = bazi_info['month_pillar']['zhi']
        hidden_gans = self._get_zhi_hidden_gans(month_zhi)
        for gan in hidden_gans:
            if self._get_deity(day_master, gan) == '偏印':
                for pillar_name in ['year_pillar', 'hour_pillar']:
                    if bazi_info[pillar_name]['gan'] == gan:
                        return True
        
        return False
    
    def _check_congqiang_pattern(self, bazi_info: Dict[str, Any]) -> bool:
        """判断从强格"""
        # 简化判断：日主得生扶过多
        day_master = bazi_info['day_master']
        help_count = 0
        
        pillars = ['year_pillar', 'month_pillar', 'hour_pillar']
        for pillar_name in pillars:
            pillar = bazi_info[pillar_name]
            deity = self._get_deity(day_master, pillar['gan'])
            if deity in ['比肩', '劫财', '正印', '偏印']:
                help_count += 1
        
        return help_count >= 2
    
    def _check_congruo_pattern(self, bazi_info: Dict[str, Any]) -> bool:
        """判断从弱格"""
        # 简化判断：日主无根无助
        day_master = bazi_info['day_master']
        help_count = 0
        
        pillars = ['year_pillar', 'month_pillar', 'hour_pillar']
        for pillar_name in pillars:
            pillar = bazi_info[pillar_name]
            deity = self._get_deity(day_master, pillar['gan'])
            if deity in ['比肩', '劫财', '正印', '偏印']:
                help_count += 1
        
        return help_count == 0
    
    def _check_congcai_pattern(self, bazi_info: Dict[str, Any]) -> bool:
        """判断从财格"""
        day_master = bazi_info['day_master']
        wealth_count = 0
        
        pillars = ['year_pillar', 'month_pillar', 'hour_pillar']
        for pillar_name in pillars:
            pillar = bazi_info[pillar_name]
            deity = self._get_deity(day_master, pillar['gan'])
            if deity in ['正财', '偏财']:
                wealth_count += 1
        
        return wealth_count >= 2 and self._check_congruo_pattern(bazi_info)
    
    def _check_congsha_pattern(self, bazi_info: Dict[str, Any]) -> bool:
        """判断从杀格"""
        day_master = bazi_info['day_master']
        kill_count = 0
        
        pillars = ['year_pillar', 'month_pillar', 'hour_pillar']
        for pillar_name in pillars:
            pillar = bazi_info[pillar_name]
            deity = self._get_deity(day_master, pillar['gan'])
            if deity == '七杀':
                kill_count += 1
        
        return kill_count >= 2 and self._check_congruo_pattern(bazi_info)
    
    # 辅助方法
    def _get_deity(self, day_master: str, target_gan: str) -> str:
        """获取十神（修复版本）"""
        try:
            # 使用 baziutil 中的 Ten_deities
            if day_master in Ten_deities and target_gan in Ten_deities[day_master]:
                deity_short = Ten_deities[day_master][target_gan]
                # 转换为全称
                return self.deity_name_mapping.get(deity_short, deity_short)
            else:
                return '比肩'  # 默认值
        except:
            return '比肩'
    
    def _get_gan_element(self, gan: str) -> str:
        """获取天干五行"""
        gan_elements = {
            '甲': '木', '乙': '木',
            '丙': '火', '丁': '火',
            '戊': '土', '己': '土',
            '庚': '金', '辛': '金',
            '壬': '水', '癸': '水'
        }
        return gan_elements.get(gan, '木')
    
    def _get_zhi_element(self, zhi: str) -> str:
        """获取地支五行"""
        zhi_elements = {
            '子': '水', '丑': '土', '寅': '木', '卯': '木',
            '辰': '土', '巳': '火', '午': '火', '未': '土',
            '申': '金', '酉': '金', '戌': '土', '亥': '水'
        }
        return zhi_elements.get(zhi, '土')
    
    def _get_zhi_main_gan(self, zhi: str) -> str:
        """获取地支本气"""
        zhi_main_gans = {
            '子': '壬', '丑': '己', '寅': '甲', '卯': '乙',
            '辰': '戊', '巳': '丙', '午': '丁', '未': '己',
            '申': '庚', '酉': '辛', '戌': '戊', '亥': '壬'
        }
        return zhi_main_gans.get(zhi, '甲')
    
    def _get_zhi_hidden_gans(self, zhi: str) -> List[str]:
        """获取地支藏干"""
        try:
            if zhi in Branch_hidden_stems:
                return Branch_hidden_stems[zhi]
            else:
                return [self._get_zhi_main_gan(zhi)]
        except:
            return [self._get_zhi_main_gan(zhi)]
    
    def _get_season(self, month: int) -> str:
        """获取季节"""
        if month in [3, 4, 5]:
            return '春'
        elif month in [6, 7, 8]:
            return '夏'
        elif month in [9, 10, 11]:
            return '秋'
        else:
            return '冬'
    
    def _get_element_seasonal_strength(self, element: str, season: str) -> float:
        """获取五行季节力量"""
        return self.blind_element_strength.get(element, {}).get(season, 50) / 100.0
    
    def _calculate_dayun_simple(self, birth_dt: datetime, target_dt: datetime) -> Dict[str, Any]:
        """简化的大运计算"""
        age = target_dt.year - birth_dt.year
        dayun_index = age // 10
        
        return {
            'current_age': age,
            'current_dayun': {
                'index': dayun_index,
                'name': f"第{dayun_index + 1}步大运",
                'start_age': dayun_index * 10,
                'end_age': (dayun_index + 1) * 10 - 1
            }
        }
    
    def _calculate_liu_nian(self, target_dt: datetime) -> Dict[str, Any]:
        """计算流年"""
        year = target_dt.year
        year_index = (year - 4) % 60  # 甲子年为起点
        
        return {
            'year': year,
            'gan_zhi': f"流年{year}",
            'index': year_index
        }
    
    def _calculate_liu_yue(self, target_dt: datetime) -> Dict[str, Any]:
        """计算流月"""
        month = target_dt.month
        
        return {
            'month': month,
            'name': f"{month}月",
            'season': self._get_season(month)
        }
    
    def _get_default_bazi(self) -> Dict[str, Any]:
        """获取默认八字（错误情况下使用）"""
        return {
            'birth_date': datetime(1990, 1, 1),
            'target_date': datetime.now(),
            'year_pillar': {'gan': '庚', 'zhi': '午'},
            'month_pillar': {'gan': '戊', 'zhi': '子'},
            'day_pillar': {'gan': '甲', 'zhi': '子'},
            'hour_pillar': {'gan': '甲', 'zhi': '子'},
            'day_master': '甲',
            'dayun_info': {'current_age': 30, 'current_dayun': {'index': 3, 'name': '第4步大运', 'start_age': 30, 'end_age': 39}},
            'liu_nian_info': {'year': 2024, 'gan_zhi': '流年2024', 'index': 40},
            'season': '冬',
            'gender': '男',
            'name': '默认用户'
        }
    
    # 这里可以继续添加其他辅助方法...
    def _determine_basic_pattern(self, bazi_info: Dict[str, Any]) -> Dict[str, Any]:
        """确定基础格局（当没有特殊格局时）"""
        return {
            'name': '普通格局',
            'description': '无明显特殊格局，以日主强弱论命',
            'strength': 'medium',
            'favorable': True,
            'score_base': 60
        }
    
    def _analyze_pattern_interaction(self, patterns: List[Dict[str, Any]]) -> Dict[str, Any]:
        """分析格局互动"""
        return {
            'interaction_type': '单一格局' if len(patterns) == 1 else '复合格局',
            'interaction_quality': 70
        }
    
    def _evaluate_pattern_quality(self, pattern: Dict[str, Any], bazi_info: Dict[str, Any]) -> int:
        """评估格局质量"""
        base_quality = 70
        if pattern and pattern['favorable']:
            base_quality += 10
        return base_quality
    
    def _analyze_deity_combinations(self, deity_distribution: Dict[str, float]) -> List[Dict[str, Any]]:
        """分析十神组合"""
        combinations = []
        for deity, count in deity_distribution.items():
            if count >= 1.5:  # 十神数量较多
                combinations.append({
                    'deity': deity,
                    'count': count,
                    'effect': f"{deity}较多，影响性格特质"
                })
        return combinations
    
    def _calculate_deity_strength(self, deity_distribution: Dict[str, float], bazi_info: Dict[str, Any]) -> Dict[str, float]:
        """计算十神力量"""
        strength = {}
        for deity, count in deity_distribution.items():
            base_strength = count * 20  # 基础力量
            seasonal_factor = 1.0  # 可以根据季节调整
            strength[deity] = base_strength * seasonal_factor
        return strength
    
    def _evaluate_deity_quality(self, main_deity: str, bazi_info: Dict[str, Any]) -> int:
        """评估十神质量"""
        deity_info = self.blind_deity_relations.get(main_deity, {})
        base_quality = 60
        if deity_info.get('positive'):
            base_quality += len(deity_info['positive']) * 5
        return min(100, base_quality)
    
    def _determine_use_god(self, bazi_info: Dict[str, Any], element_strength: Dict[str, float]) -> Dict[str, str]:
        """确定用神喜忌"""
        strongest = max(element_strength.items(), key=lambda x: x[1])[0]
        weakest = min(element_strength.items(), key=lambda x: x[1])[0]
        
        # 简化的用神判断
        elements = ['木', '火', '土', '金', '水']
        day_master_element = self._get_gan_element(bazi_info['day_master'])
        
        if element_strength[day_master_element] < 50:  # 日主偏弱
            use_god = day_master_element  # 用神为日主同类
            avoid_god = strongest if strongest != day_master_element else weakest
        else:  # 日主偏强
            avoid_god = day_master_element  # 忌神为日主同类
            use_god = weakest if weakest != day_master_element else strongest
        
        # 喜神通常是生用神的五行
        xi_god_map = {
            '木': '水', '火': '木', '土': '火', '金': '土', '水': '金'
        }
        xi_god = xi_god_map.get(use_god, use_god)
        
        return {
            'use_god': use_god,
            'avoid_god': avoid_god,
            'xi_god': xi_god
        }
    
    def _calculate_element_balance(self, element_strength: Dict[str, float]) -> int:
        """计算五行平衡度"""
        strengths = list(element_strength.values())
        avg_strength = sum(strengths) / len(strengths)
        variance = sum((s - avg_strength) ** 2 for s in strengths) / len(strengths)
        balance_score = max(0, 100 - variance)  # 方差越小，平衡度越高
        return int(balance_score)
    
    def _analyze_element_flow(self, bazi_info: Dict[str, Any]) -> Dict[str, Any]:
        """分析五行流通"""
        return {
            'flow_type': '顺生流通',
            'flow_quality': 70,
            'blocked_elements': []
        }
    
    def _check_timing_condition(self, condition: str, bazi_info: Dict[str, Any], dayun: Dict[str, Any], liu_nian: Dict[str, Any]) -> bool:
        """检查应期条件"""
        # 简化实现
        return random.choice([True, False])
    
    def _generate_timing_description(self, rule_name: str, rule_config: Dict[str, Any]) -> str:
        """生成应期描述"""
        return f"{rule_name}：{rule_config['timing']}"
    
    def _identify_important_periods(self, bazi_info: Dict[str, Any], target_dt: datetime) -> List[Dict[str, Any]]:
        """识别重要时间节点"""
        return [
            {
                'period': f"{target_dt.year}年{target_dt.month}月",
                'importance': 'medium',
                'description': '当前时期运势平稳'
            }
        ]
    
    def _evaluate_timing_quality(self, timing_predictions: List[Dict[str, Any]]) -> int:
        """评估应期质量"""
        if not timing_predictions:
            return 60
        
        positive_count = sum(1 for p in timing_predictions if p['intensity'] != 'negative')
        quality = 50 + (positive_count / len(timing_predictions)) * 50
        return int(quality)
    
    def _calculate_career_fortune(self, bazi_info: Dict[str, Any], pattern_analysis: Dict[str, Any], deity_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """计算事业运势"""
        base_score = 60
        
        # 官杀主事业
        main_deity = deity_analysis['main_deity']
        if main_deity in ['正官', '七杀']:
            base_score += 15
        
        # 格局影响
        main_pattern = pattern_analysis['main_pattern']
        if main_pattern and main_pattern['name'] in ['正官格', '偏官格']:
            base_score += 10
        
        return {
            'score': min(100, base_score),
            'level': self._score_to_level(base_score),
            'description': '事业运势稳中有升，宜把握机会',
            'advice': ['专注本职工作', '与上级保持良好关系', '适时展现才能']
        }
    
    def _calculate_wealth_fortune(self, bazi_info: Dict[str, Any], pattern_analysis: Dict[str, Any], deity_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """计算财运"""
        base_score = 60
        
        # 财星主财运
        main_deity = deity_analysis['main_deity']
        if main_deity in ['正财', '偏财']:
            base_score += 15
        
        # 格局影响
        main_pattern = pattern_analysis['main_pattern']
        if main_pattern and main_pattern['name'] in ['正财格', '偏财格']:
            base_score += 10
        
        return {
            'score': min(100, base_score),
            'level': self._score_to_level(base_score),
            'description': '财运平稳，有小财进账',
            'advice': ['理性投资', '开源节流', '把握商机']
        }
    
    def _calculate_health_fortune(self, bazi_info: Dict[str, Any], element_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """计算健康运势"""
        base_score = 65
        
        # 五行平衡影响健康
        balance_score = element_analysis['balance_score']
        base_score += (balance_score - 50) * 0.3
        
        return {
            'score': min(100, max(0, int(base_score))),
            'level': self._score_to_level(base_score),
            'description': '身体状况良好，注意作息规律',
            'advice': ['保持运动', '饮食均衡', '调节情绪']
        }
    
    def _calculate_relationship_fortune(self, bazi_info: Dict[str, Any], deity_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """计算人际关系运势"""
        base_score = 60
        
        # 比劫主人际关系
        deity_dist = deity_analysis['deity_distribution']
        bijie_count = deity_dist.get('比肩', 0) + deity_dist.get('劫财', 0)
        if bijie_count > 1.5:
            base_score += 10
        
        return {
            'score': min(100, base_score),
            'level': self._score_to_level(base_score),
            'description': '人际关系和谐，贵人相助',
            'advice': ['真诚待人', '维护友谊', '扩展人脉']
        }
    
    def _calculate_study_fortune(self, bazi_info: Dict[str, Any], deity_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """计算学习运势"""
        base_score = 60
        
        # 印星主学习
        main_deity = deity_analysis['main_deity']
        if main_deity in ['正印', '偏印']:
            base_score += 15
        
        return {
            'score': min(100, base_score),
            'level': self._score_to_level(base_score),
            'description': '学习能力强，思维敏捷',
            'advice': ['持续学习', '开拓视野', '深入思考']
        }
    
    def _score_to_level(self, score: int) -> str:
        """分数转换为等级"""
        if score >= 80:
            return '优'
        elif score >= 70:
            return '良'
        elif score >= 60:
            return '中'
        else:
            return '差'
    
    def _generate_overall_description(self, score: int, pattern_analysis: Dict[str, Any]) -> str:
        """生成综合运势描述"""
        level = self._determine_fortune_level(score)
        main_pattern = pattern_analysis.get('main_pattern', {})
        pattern_name = main_pattern.get('name', '普通格局')
        
        descriptions = {
            '大吉': f"今日运势大吉，{pattern_name}发挥优势，诸事顺遂，宜积极进取。",
            '中吉': f"今日运势中吉，{pattern_name}运行平稳，机会较多，宜把握时机。",
            '小吉': f"今日运势小吉，{pattern_name}略有助力，平稳发展，宜稳中求进。",
            '平': f"今日运势平淡，{pattern_name}影响一般，无大起大落，宜顺其自然。",
            '小凶': f"今日运势小凶，{pattern_name}略有阻碍，宜谨慎行事，避免冲动。",
            '中凶': f"今日运势中凶，{pattern_name}运行不利，阻力较大，宜低调行事。",
            '大凶': f"今日运势大凶，{pattern_name}严重受损，诸事不顺，宜静待时机。"
        }
        
        return descriptions.get(level, "运势状况一般，宜平常心对待。")
    
    def _generate_timing_advice(self, timing_analysis: Dict[str, Any]) -> List[str]:
        """生成应期建议"""
        advice = []
        predictions = timing_analysis.get('timing_predictions', [])
        
        for prediction in predictions:
            if prediction['intensity'] == 'high':
                advice.append(f"【良机】{prediction['timing']}，宜积极把握")
            elif prediction['intensity'] == 'negative':
                advice.append(f"【注意】{prediction['timing']}，宜谨慎防范")
        
        if not advice:
            advice.append("【时机】当前时期平稳，宜按计划行事")
        
        return advice
    
    def _generate_remedies(self, pattern_analysis: Dict[str, Any], deity_analysis: Dict[str, Any], element_analysis: Dict[str, Any]) -> List[str]:
        """生成化解方法"""
        remedies = []
        
        # 五行化解
        use_god = element_analysis.get('use_god', '木')
        avoid_god = element_analysis.get('avoid_god', '金')
        
        color_map = {
            '木': '绿色', '火': '红色', '土': '黄色', '金': '白色', '水': '黑色'
        }
        direction_map = {
            '木': '东方', '火': '南方', '土': '中央', '金': '西方', '水': '北方'
        }
        
        remedies.append(f"【颜色】多穿{color_map.get(use_god, '绿色')}衣物，避免{color_map.get(avoid_god, '白色')}")
        remedies.append(f"【方位】朝{direction_map.get(use_god, '东方')}发展，避免{direction_map.get(avoid_god, '西方')}")
        
        # 格局化解
        main_pattern = pattern_analysis.get('main_pattern', {})
        if main_pattern and not main_pattern.get('favorable', True):
            remedies.append(f"【格局】{main_pattern['name']}需调理，宜寻求专业指导")
        
        # 十神化解
        main_deity = deity_analysis.get('main_deity', '比肩')
        deity_info = self.blind_deity_relations.get(main_deity, {})
        if deity_info.get('negative'):
            remedies.append(f"【性格】避免{', '.join(deity_info['negative'])}，培养{', '.join(deity_info.get('positive', []))}")
        
        return remedies 