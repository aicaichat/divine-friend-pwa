"""
基于盲派理论的今日运势计算服务
盲派八字以其独特的理论体系和精准的预测方法著称
"""

import sxtwl
from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import json
import math
from collections import defaultdict

from .bazi_service import BaziService
from baziutil import Gan, Zhi, Ten_deities, Dizhi_gx, Branch_hidden_stems


@dataclass
class BlindSchoolFortuneRequest:
    """盲派运势计算请求"""
    birthdate: str  # 出生日期时间
    name: str
    gender: str
    target_date: Optional[str] = None  # 目标日期，默认为今天


@dataclass
class BlindSchoolFortuneResult:
    """盲派运势结果"""
    date: str
    overall_score: int  # 综合运势评分 1-100
    overall_level: str  # 运势等级：大吉/中吉/小吉/平/小凶/中凶/大凶
    overall_description: str  # 综合运势描述
    
    # 各维度运势
    career_fortune: Dict[str, Any]  # 事业运势
    wealth_fortune: Dict[str, Any]  # 财运
    health_fortune: Dict[str, Any]  # 健康运势
    relationship_fortune: Dict[str, Any]  # 人际关系运势
    study_fortune: Dict[str, Any]  # 学习运势
    
    # 今日建议
    lucky_directions: List[str]  # 吉利方位
    lucky_colors: List[str]  # 吉利颜色
    lucky_numbers: List[int]  # 吉利数字
    avoid_directions: List[str]  # 避免方位
    avoid_colors: List[str]  # 避免颜色
    
    # 今日活动建议
    recommended_activities: List[str]  # 推荐活动
    avoid_activities: List[str]  # 避免活动
    timing_advice: Dict[str, str]  # 时辰建议
    
    # 八字分析
    bazi_analysis: Dict[str, Any]  # 八字分析信息
    dayun_info: Dict[str, Any]  # 大运信息
    
    # 盲派特有分析
    blind_school_analysis: Dict[str, Any]  # 盲派分析
    pattern_analysis: Dict[str, Any]  # 格局分析
    deity_strength_analysis: Dict[str, Any]  # 十神力量分析


class BlindSchoolFortuneService:
    """基于盲派理论的今日运势计算服务"""
    
    def __init__(self):
        self.bazi_service = BaziService()
        self.lunar = sxtwl.Lunar()
        
        # 盲派五行属性映射
        self.blind_element_attributes = {
            'wood': {
                'colors': ['绿色', '青色', '蓝色'],
                'directions': ['东', '东南'],
                'numbers': [1, 2, 3],
                'seasons': ['春'],
                'characteristics': ['生长', '扩展', '创新'],
                'blind_properties': {
                    'nature': '阳',
                    'strength': '中',
                    'favorable_time': '寅卯时',
                    'unfavorable_time': '申酉时'
                }
            },
            'fire': {
                'colors': ['红色', '橙色', '紫色'],
                'directions': ['南', '东南'],
                'numbers': [2, 3, 7],
                'seasons': ['夏'],
                'characteristics': ['热情', '活力', '领导'],
                'blind_properties': {
                    'nature': '阳',
                    'strength': '强',
                    'favorable_time': '巳午时',
                    'unfavorable_time': '亥子时'
                }
            },
            'earth': {
                'colors': ['黄色', '棕色', '橙色'],
                'directions': ['中央', '西南', '东北'],
                'numbers': [5, 6, 8],
                'seasons': ['长夏'],
                'characteristics': ['稳定', '包容', '务实'],
                'blind_properties': {
                    'nature': '中',
                    'strength': '稳',
                    'favorable_time': '辰戌丑未时',
                    'unfavorable_time': '寅申时'
                }
            },
            'metal': {
                'colors': ['白色', '银色', '金色'],
                'directions': ['西', '西北'],
                'numbers': [4, 9, 0],
                'seasons': ['秋'],
                'characteristics': ['果断', '精确', '执行'],
                'blind_properties': {
                    'nature': '阴',
                    'strength': '中',
                    'favorable_time': '申酉时',
                    'unfavorable_time': '巳午时'
                }
            },
            'water': {
                'colors': ['黑色', '蓝色', '灰色'],
                'directions': ['北', '东北'],
                'numbers': [1, 6, 9],
                'seasons': ['冬'],
                'characteristics': ['智慧', '灵活', '适应'],
                'blind_properties': {
                    'nature': '阴',
                    'strength': '弱',
                    'favorable_time': '亥子时',
                    'unfavorable_time': '巳午时'
                }
            }
        }
        
        # 盲派十神关系映射
        self.blind_deity_relations = {
            '比肩': {'relation': '同我', 'favorable': True, 'blind_nature': '阳', 'strength': '中'},
            '劫财': {'relation': '同我', 'favorable': False, 'blind_nature': '阴', 'strength': '弱'},
            '食神': {'relation': '我生', 'favorable': True, 'blind_nature': '阳', 'strength': '强'},
            '伤官': {'relation': '我生', 'favorable': False, 'blind_nature': '阴', 'strength': '中'},
            '偏财': {'relation': '我克', 'favorable': True, 'blind_nature': '阳', 'strength': '强'},
            '正财': {'relation': '我克', 'favorable': True, 'blind_nature': '阳', 'strength': '中'},
            '七杀': {'relation': '克我', 'favorable': False, 'blind_nature': '阴', 'strength': '强'},
            '正官': {'relation': '克我', 'favorable': True, 'blind_nature': '阳', 'strength': '中'},
            '偏印': {'relation': '生我', 'favorable': True, 'blind_nature': '阳', 'strength': '强'},
            '正印': {'relation': '生我', 'favorable': True, 'blind_nature': '阳', 'strength': '中'}
        }
        
        # 盲派格局类型
        self.blind_patterns = {
            '正官格': {'description': '正官为用神，官运亨通', 'favorable': True, 'score_bonus': 15},
            '七杀格': {'description': '七杀为用神，事业有成', 'favorable': True, 'score_bonus': 10},
            '正财格': {'description': '正财为用神，财运稳定', 'favorable': True, 'score_bonus': 12},
            '偏财格': {'description': '偏财为用神，财运亨通', 'favorable': True, 'score_bonus': 15},
            '食神格': {'description': '食神为用神，才华横溢', 'favorable': True, 'score_bonus': 10},
            '伤官格': {'description': '伤官为用神，创新思维', 'favorable': False, 'score_bonus': -5},
            '正印格': {'description': '正印为用神，学业有成', 'favorable': True, 'score_bonus': 12},
            '偏印格': {'description': '偏印为用神，智慧超群', 'favorable': True, 'score_bonus': 10},
            '比肩格': {'description': '比肩为用神，朋友众多', 'favorable': True, 'score_bonus': 8},
            '劫财格': {'description': '劫财为用神，竞争激烈', 'favorable': False, 'score_bonus': -8}
        }
        
        # 地支藏干（盲派版本）
        self.branch_hidden_stems = {
            '子': ['癸'],
            '丑': ['己', '辛', '癸'],
            '寅': ['甲', '丙', '戊'],
            '卯': ['乙'],
            '辰': ['戊', '乙', '癸'],
            '巳': ['丙', '戊', '庚'],
            '午': ['丁', '己'],
            '未': ['己', '丁', '乙'],
            '申': ['庚', '壬', '戊'],
            '酉': ['辛'],
            '戌': ['戊', '辛', '丁'],
            '亥': ['壬', '甲']
        }
    
    def calculate_blind_school_fortune(self, request: BlindSchoolFortuneRequest) -> BlindSchoolFortuneResult:
        """计算盲派今日运势"""
        # 解析目标日期
        target_date = datetime.strptime(request.target_date, '%Y-%m-%d') if request.target_date else datetime.now()
        
        # 计算用户八字
        bazi_result = self.bazi_service.calculate_bazi(request)
        
        # 获取今日干支信息
        today_info = self.lunar.getDayBySolar(target_date.year, target_date.month, target_date.day)
        
        # 盲派深度分析今日运势
        fortune = self._calculate_blind_school_fortune(bazi_result, today_info, target_date)
        
        return fortune
    
    def _calculate_blind_school_fortune(self, bazi_result: Dict, today_info, target_date: datetime) -> BlindSchoolFortuneResult:
        """盲派深度计算今日运势"""
        bazi_analysis = bazi_result['analysis']
        bazi_chart = bazi_result['bazi_chart']
        
        # 获取今日干支
        today_stem = Gan[today_info.Lday2.tg]
        today_branch = Zhi[today_info.Lday2.dz]
        
        # 获取用户八字信息
        user_day_master = bazi_chart['day_master']
        user_elements = bazi_chart['elements']
        
        # 1. 盲派五行深度分析
        element_analysis = self._analyze_blind_elements(today_stem, today_branch, user_day_master, user_elements)
        
        # 2. 盲派十神关系分析
        deity_analysis = self._analyze_blind_deity_relations(today_stem, today_branch, user_day_master, bazi_chart)
        
        # 3. 盲派格局分析
        pattern_analysis = self._analyze_blind_patterns(bazi_chart, today_stem, today_branch)
        
        # 4. 盲派十神力量分析
        deity_strength_analysis = self._analyze_blind_deity_strength(bazi_chart, today_stem, today_branch)
        
        # 5. 计算盲派综合运势分数
        overall_score = self._calculate_blind_school_score(element_analysis, deity_analysis, pattern_analysis, deity_strength_analysis, bazi_analysis)
        overall_level = self._get_blind_fortune_level(overall_score)
        
        # 6. 计算各维度运势
        career_fortune = self._calculate_blind_career_fortune(element_analysis, deity_analysis, pattern_analysis, deity_strength_analysis, bazi_analysis)
        wealth_fortune = self._calculate_blind_wealth_fortune(element_analysis, deity_analysis, pattern_analysis, deity_strength_analysis, bazi_analysis)
        health_fortune = self._calculate_blind_health_fortune(element_analysis, deity_analysis, pattern_analysis, deity_strength_analysis, bazi_analysis)
        relationship_fortune = self._calculate_blind_relationship_fortune(element_analysis, deity_analysis, pattern_analysis, deity_strength_analysis, bazi_analysis)
        study_fortune = self._calculate_blind_study_fortune(element_analysis, deity_analysis, pattern_analysis, deity_strength_analysis, bazi_analysis)
        
        # 7. 生成盲派吉利信息
        lucky_info = self._generate_blind_lucky_info(element_analysis, deity_analysis, pattern_analysis)
        
        # 8. 生成盲派活动建议
        activity_advice = self._generate_blind_activity_advice(element_analysis, deity_analysis, overall_score)
        
        # 9. 生成盲派时辰建议
        timing_advice = self._generate_blind_timing_advice(element_analysis, deity_analysis, target_date)
        
        # 10. 生成盲派综合描述
        overall_description = self._generate_blind_description(overall_score, element_analysis, deity_analysis, pattern_analysis)
        
        return BlindSchoolFortuneResult(
            date=target_date.strftime('%Y-%m-%d'),
            overall_score=overall_score,
            overall_level=overall_level,
            overall_description=overall_description,
            career_fortune=career_fortune,
            wealth_fortune=wealth_fortune,
            health_fortune=health_fortune,
            relationship_fortune=relationship_fortune,
            study_fortune=study_fortune,
            lucky_directions=lucky_info['directions'],
            lucky_colors=lucky_info['colors'],
            lucky_numbers=lucky_info['numbers'],
            avoid_directions=lucky_info['avoid_directions'],
            avoid_colors=lucky_info['avoid_colors'],
            recommended_activities=activity_advice['recommended'],
            avoid_activities=activity_advice['avoid'],
            timing_advice=timing_advice,
            bazi_analysis=bazi_analysis,
            dayun_info=bazi_analysis.get('dayun_info', {}),
            blind_school_analysis={
                'element_analysis': element_analysis,
                'deity_analysis': deity_analysis,
                'pattern_analysis': pattern_analysis,
                'deity_strength_analysis': deity_strength_analysis
            },
            pattern_analysis=pattern_analysis,
            deity_strength_analysis=deity_strength_analysis
        )
    
    def _analyze_blind_elements(self, today_stem: str, today_branch: str, user_day_master: str, user_elements: Dict) -> Dict[str, Any]:
        """盲派五行深度分析"""
        today_stem_element = self._get_stem_element(today_stem)
        today_branch_element = self._get_branch_element(today_branch)
        user_day_element = self._get_stem_element(user_day_master)
        
        # 盲派五行力量计算
        element_strength = self._calculate_blind_element_strength(today_stem, today_branch, user_elements)
        
        # 盲派相生相克关系分析
        generation_relations = []
        control_relations = []
        
        # 今日天干与日主关系
        if self._is_generating(today_stem_element, user_day_element):
            generation_relations.append(f"{today_stem_element}生{user_day_element}")
        elif self._is_controlling(today_stem_element, user_day_element):
            control_relations.append(f"{today_stem_element}克{user_day_element}")
        
        # 今日地支与日主关系
        if self._is_generating(today_branch_element, user_day_element):
            generation_relations.append(f"{today_branch_element}生{user_day_element}")
        elif self._is_controlling(today_branch_element, user_day_element):
            control_relations.append(f"{today_branch_element}克{user_day_element}")
        
        # 盲派地支藏干分析
        hidden_stems = self.branch_hidden_stems.get(today_branch, [])
        hidden_relations = []
        for hidden_stem in hidden_stems:
            hidden_element = self._get_stem_element(hidden_stem)
            if self._is_generating(hidden_element, user_day_element):
                hidden_relations.append(f"{hidden_stem}({hidden_element})生{user_day_element}")
            elif self._is_controlling(hidden_element, user_day_element):
                hidden_relations.append(f"{hidden_stem}({hidden_element})克{user_day_element}")
        
        # 盲派五行平衡度计算
        element_balance = self._calculate_blind_element_balance(element_strength)
        
        return {
            'today_stem_element': today_stem_element,
            'today_branch_element': today_branch_element,
            'user_day_element': user_day_element,
            'element_strength': element_strength,
            'generation_relations': generation_relations,
            'control_relations': control_relations,
            'hidden_relations': hidden_relations,
            'overall_balance': element_balance,
            'blind_properties': self.blind_element_attributes.get(today_stem_element, {})
        }
    
    def _analyze_blind_deity_relations(self, today_stem: str, today_branch: str, user_day_master: str, bazi_chart: Dict) -> Dict[str, Any]:
        """盲派十神关系分析"""
        try:
            # 计算今日天干对日主的十神关系
            if user_day_master in Ten_deities and today_stem in Ten_deities[user_day_master]:
                today_deity = Ten_deities[user_day_master][today_stem]
            else:
                today_deity = "正印"  # 默认值
        except Exception as e:
            print(f"盲派十神计算错误: {e}, user_day_master={user_day_master}, today_stem={today_stem}")
            today_deity = "正印"  # 默认值
        
        # 盲派十神性质分析
        deity_info = self.blind_deity_relations.get(today_deity, {})
        
        # 盲派十神力量计算
        deity_strength = self._calculate_blind_deity_strength(today_stem, today_branch, bazi_chart)
        
        return {
            'today_deity': today_deity,
            'deity_relation': deity_info.get('relation', ''),
            'is_favorable': deity_info.get('favorable', True),
            'deity_strength': deity_strength,
            'blind_nature': deity_info.get('blind_nature', '阳'),
            'blind_strength': deity_info.get('strength', '中'),
            'deity_advice': self._get_blind_deity_advice(today_deity, deity_strength)
        }
    
    def _analyze_blind_patterns(self, bazi_chart: Dict, today_stem: str, today_branch: str) -> Dict[str, Any]:
        """盲派格局分析"""
        patterns = []
        pattern_scores = []
        
        # 分析八字格局
        user_day_master = bazi_chart['day_master']
        user_elements = bazi_chart['elements']
        
        # 判断主要格局
        strongest_element = max(user_elements.items(), key=lambda x: x[1])[0] if user_elements else 'earth'
        
        # 根据日主和最强五行判断格局
        if strongest_element == 'wood':
            if user_day_master in ['甲', '乙']:
                patterns.append('正印格')
                pattern_scores.append(12)
        elif strongest_element == 'fire':
            if user_day_master in ['丙', '丁']:
                patterns.append('食神格')
                pattern_scores.append(10)
        elif strongest_element == 'earth':
            if user_day_master in ['戊', '己']:
                patterns.append('正官格')
                pattern_scores.append(15)
        elif strongest_element == 'metal':
            if user_day_master in ['庚', '辛']:
                patterns.append('七杀格')
                pattern_scores.append(10)
        elif strongest_element == 'water':
            if user_day_master in ['壬', '癸']:
                patterns.append('偏印格')
                pattern_scores.append(10)
        
        # 今日格局影响
        today_element = self._get_stem_element(today_stem)
        if today_element == strongest_element:
            patterns.append('今日助格')
            pattern_scores.append(8)
        
        return {
            'patterns': patterns,
            'pattern_scores': pattern_scores,
            'main_pattern': patterns[0] if patterns else '无特殊格局',
            'pattern_description': self.blind_patterns.get(patterns[0], {}).get('description', '格局平稳') if patterns else '格局平稳'
        }
    
    def _analyze_blind_deity_strength(self, bazi_chart: Dict, today_stem: str, today_branch: str) -> Dict[str, Any]:
        """盲派十神力量分析"""
        deity_strengths = {}
        
        # 分析各十神的力量
        for deity_name in self.blind_deity_relations.keys():
            # 简化计算，实际应该更复杂
            base_strength = 0.5
            if deity_name in ['正官', '正财', '食神']:
                base_strength = 0.7
            elif deity_name in ['七杀', '偏财', '伤官']:
                base_strength = 0.6
            elif deity_name in ['正印', '偏印']:
                base_strength = 0.8
            elif deity_name in ['比肩', '劫财']:
                base_strength = 0.4
            
            deity_strengths[deity_name] = base_strength
        
        return {
            'deity_strengths': deity_strengths,
            'strongest_deity': max(deity_strengths.items(), key=lambda x: x[1])[0] if deity_strengths else '正印',
            'overall_deity_strength': sum(deity_strengths.values()) / len(deity_strengths) if deity_strengths else 0.5
        }
    
    def _calculate_blind_school_score(self, element_analysis: Dict, deity_analysis: Dict, pattern_analysis: Dict, deity_strength_analysis: Dict, bazi_analysis: Dict) -> int:
        """计算盲派综合运势分数"""
        base_score = 50
        
        # 1. 盲派五行分析权重 (35%)
        element_score = self._calculate_blind_element_score(element_analysis)
        base_score += element_score * 0.35
        
        # 2. 盲派十神分析权重 (25%)
        deity_score = self._calculate_blind_deity_score(deity_analysis)
        base_score += deity_score * 0.25
        
        # 3. 盲派格局分析权重 (25%)
        pattern_score = self._calculate_blind_pattern_score(pattern_analysis)
        base_score += pattern_score * 0.25
        
        # 4. 盲派十神力量分析权重 (15%)
        deity_strength_score = self._calculate_blind_deity_strength_score(deity_strength_analysis)
        base_score += deity_strength_score * 0.15
        
        return max(1, min(100, int(base_score)))
    
    def _calculate_blind_element_score(self, element_analysis: Dict) -> int:
        """计算盲派五行分析分数"""
        score = 0
        
        # 相生关系加分
        generation_count = len(element_analysis['generation_relations'])
        score += generation_count * 18
        
        # 相克关系减分
        control_count = len(element_analysis['control_relations'])
        score -= control_count * 12
        
        # 地支藏干关系
        hidden_favorable = len([r for r in element_analysis['hidden_relations'] if '生' in r])
        hidden_unfavorable = len([r for r in element_analysis['hidden_relations'] if '克' in r])
        score += hidden_favorable * 10
        score -= hidden_unfavorable * 6
        
        # 盲派五行平衡加分
        balance = element_analysis['overall_balance']
        if balance > 0.75:
            score += 25
        elif balance > 0.6:
            score += 15
        
        # 盲派特性加分
        blind_props = element_analysis.get('blind_properties', {})
        if blind_props.get('nature') == '阳':
            score += 8
        if blind_props.get('strength') == '强':
            score += 12
        
        return score
    
    def _calculate_blind_deity_score(self, deity_analysis: Dict) -> int:
        """计算盲派十神分析分数"""
        score = 0
        
        if deity_analysis['is_favorable']:
            score += 25
        else:
            score -= 18
        
        # 盲派十神性质影响
        if deity_analysis['blind_nature'] == '阳':
            score += 10
        elif deity_analysis['blind_nature'] == '阴':
            score -= 5
        
        # 盲派十神力量影响
        if deity_analysis['blind_strength'] == '强':
            score += 15
        elif deity_analysis['blind_strength'] == '弱':
            score -= 10
        
        # 十神力量影响
        strength = deity_analysis['deity_strength']
        if strength > 0.75:
            score += 18
        elif strength < 0.35:
            score -= 12
        
        return score
    
    def _calculate_blind_pattern_score(self, pattern_analysis: Dict) -> int:
        """计算盲派格局分析分数"""
        score = 0
        
        # 格局加分
        for pattern in pattern_analysis['patterns']:
            pattern_info = self.blind_patterns.get(pattern, {})
            score += pattern_info.get('score_bonus', 0)
        
        # 主要格局影响
        main_pattern = pattern_analysis['main_pattern']
        if main_pattern != '无特殊格局':
            pattern_info = self.blind_patterns.get(main_pattern, {})
            if pattern_info.get('favorable', True):
                score += 20
            else:
                score -= 15
        
        return score
    
    def _calculate_blind_deity_strength_score(self, deity_strength_analysis: Dict) -> int:
        """计算盲派十神力量分析分数"""
        score = 0
        
        overall_strength = deity_strength_analysis.get('overall_deity_strength', 0.5)
        
        if overall_strength > 0.7:
            score += 20
        elif overall_strength > 0.5:
            score += 10
        elif overall_strength < 0.3:
            score -= 15
        
        return score
    
    def _get_blind_fortune_level(self, score: int) -> str:
        """获取盲派运势等级"""
        if score >= 95:
            return "大吉"
        elif score >= 85:
            return "中吉"
        elif score >= 75:
            return "小吉"
        elif score >= 60:
            return "平"
        elif score >= 45:
            return "小凶"
        elif score >= 30:
            return "中凶"
        else:
            return "大凶"
    
    # 辅助方法
    def _get_stem_element(self, stem: str) -> str:
        """获取天干五行"""
        element_map = {
            '甲': 'wood', '乙': 'wood',
            '丙': 'fire', '丁': 'fire',
            '戊': 'earth', '己': 'earth',
            '庚': 'metal', '辛': 'metal',
            '壬': 'water', '癸': 'water'
        }
        return element_map.get(stem, 'earth')
    
    def _get_branch_element(self, branch: str) -> str:
        """获取地支五行"""
        element_map = {
            '寅': 'wood', '卯': 'wood',
            '巳': 'fire', '午': 'fire',
            '辰': 'earth', '戌': 'earth', '丑': 'earth', '未': 'earth',
            '申': 'metal', '酉': 'metal',
            '子': 'water', '亥': 'water'
        }
        return element_map.get(branch, 'earth')
    
    def _is_generating(self, element1: str, element2: str) -> bool:
        """判断相生关系"""
        generation_map = {
            'wood': 'fire',
            'fire': 'earth',
            'earth': 'metal',
            'metal': 'water',
            'water': 'wood'
        }
        return generation_map.get(element1) == element2
    
    def _is_controlling(self, element1: str, element2: str) -> bool:
        """判断相克关系"""
        control_map = {
            'wood': 'earth',
            'earth': 'water',
            'water': 'fire',
            'fire': 'metal',
            'metal': 'wood'
        }
        return control_map.get(element1) == element2
    
    def _calculate_blind_element_strength(self, today_stem: str, today_branch: str, user_elements: Dict) -> Dict[str, float]:
        """计算盲派五行力量"""
        # 盲派特有的五行力量计算
        return user_elements
    
    def _calculate_blind_element_balance(self, element_strength: Dict[str, float]) -> float:
        """计算盲派五行平衡度"""
        if not element_strength:
            return 0.5
        
        values = list(element_strength.values())
        if not values:
            return 0.5
        
        mean_val = sum(values) / len(values)
        variance = sum((x - mean_val) ** 2 for x in values) / len(values)
        
        # 盲派平衡度计算
        balance = 1 / (1 + variance * 0.8)  # 盲派调整系数
        return min(1.0, max(0.0, balance))
    
    def _calculate_blind_deity_strength(self, today_stem: str, today_branch: str, bazi_chart: Dict) -> float:
        """计算盲派十神力量"""
        # 盲派十神力量计算
        return 0.65
    
    def _get_blind_deity_advice(self, deity: str, strength: float) -> str:
        """获取盲派十神建议"""
        advice_map = {
            '比肩': '盲派：今日适合与朋友合作，共同发展，比肩助运',
            '劫财': '盲派：今日需谨慎处理人际关系，避免冲突，劫财不利',
            '食神': '盲派：今日思维活跃，适合学习创新，食神生财',
            '伤官': '盲派：今日需控制情绪，避免冲动，伤官克官',
            '偏财': '盲派：今日财运不错，可适当投资，偏财助运',
            '正财': '盲派：今日正财运佳，适合稳定收益，正财为用',
            '七杀': '盲派：今日压力较大，需保持冷静，七杀制身',
            '正官': '盲派：今日事业运佳，适合处理公务，正官为贵',
            '偏印': '盲派：今日学习运佳，适合进修，偏印生身',
            '正印': '盲派：今日贵人运佳，易得长辈帮助，正印护身'
        }
        return advice_map.get(deity, '盲派：今日运势平稳，保持平常心')
    
    # 各维度运势计算方法
    def _calculate_blind_career_fortune(self, element_analysis: Dict, deity_analysis: Dict, pattern_analysis: Dict, deity_strength_analysis: Dict, bazi_analysis: Dict) -> Dict[str, Any]:
        """计算盲派事业运势"""
        score = 60 + len(element_analysis['generation_relations']) * 12 - len(element_analysis.get('control_relations', [])) * 6
        
        # 盲派格局影响
        for pattern in pattern_analysis['patterns']:
            if '官' in pattern or '杀' in pattern:
                score += 15
        
        return {
            'score': max(1, min(100, score)),
            'advice': [deity_analysis['deity_advice']],
            'lucky_time': '上午9-11点',
            'description': f"盲派：今日事业运势{'良好' if score > 70 else '平稳'}"
        }
    
    def _calculate_blind_wealth_fortune(self, element_analysis: Dict, deity_analysis: Dict, pattern_analysis: Dict, deity_strength_analysis: Dict, bazi_analysis: Dict) -> Dict[str, Any]:
        """计算盲派财运"""
        score = 60 + len(element_analysis.get('hidden_relations', [])) * 10 - len(element_analysis.get('control_relations', [])) * 4
        
        # 盲派格局影响
        for pattern in pattern_analysis['patterns']:
            if '财' in pattern:
                score += 18
        
        return {
            'score': max(1, min(100, score)),
            'advice': ['盲派：今日财运平稳，适合稳健投资'],
            'lucky_time': '下午2-4点',
            'description': f"盲派：今日财运{'不错' if score > 70 else '一般'}"
        }
    
    def _calculate_blind_health_fortune(self, element_analysis: Dict, deity_analysis: Dict, pattern_analysis: Dict, deity_strength_analysis: Dict, bazi_analysis: Dict) -> Dict[str, Any]:
        """计算盲派健康运势"""
        score = 70 - len(element_analysis.get('control_relations', [])) * 10
        
        return {
            'score': max(1, min(100, score)),
            'advice': ['盲派：今日注意休息，保持良好作息'],
            'lucky_time': '晚上7-9点',
            'description': f"盲派：今日健康运势{'良好' if score > 70 else '需注意'}"
        }
    
    def _calculate_blind_relationship_fortune(self, element_analysis: Dict, deity_analysis: Dict, pattern_analysis: Dict, deity_strength_analysis: Dict, bazi_analysis: Dict) -> Dict[str, Any]:
        """计算盲派人际关系运势"""
        score = 60 + len(element_analysis.get('generation_relations', [])) * 15 - len(element_analysis.get('control_relations', [])) * 8
        
        return {
            'score': max(1, min(100, score)),
            'advice': ['盲派：今日人际关系和谐，适合社交'],
            'lucky_time': '中午12-2点',
            'description': f"盲派：今日人际关系{'和谐' if score > 70 else '平稳'}"
        }
    
    def _calculate_blind_study_fortune(self, element_analysis: Dict, deity_analysis: Dict, pattern_analysis: Dict, deity_strength_analysis: Dict, bazi_analysis: Dict) -> Dict[str, Any]:
        """计算盲派学习运势"""
        score = 65 + len(element_analysis.get('generation_relations', [])) * 15
        
        # 盲派格局影响
        for pattern in pattern_analysis['patterns']:
            if '印' in pattern:
                score += 20
        
        return {
            'score': max(1, min(100, score)),
            'advice': ['盲派：今日学习效率高，适合吸收新知识'],
            'lucky_time': '上午8-10点',
            'description': f"盲派：今日学习运势{'优秀' if score > 75 else '良好'}"
        }
    
    def _generate_blind_lucky_info(self, element_analysis: Dict, deity_analysis: Dict, pattern_analysis: Dict) -> Dict[str, Any]:
        """生成盲派吉利信息"""
        favorable_element = element_analysis['user_day_element']
        element_attrs = self.blind_element_attributes.get(favorable_element, {})
        
        return {
            'directions': element_attrs.get('directions', ['东']),
            'colors': element_attrs.get('colors', ['绿色']),
            'numbers': element_attrs.get('numbers', [1]),
            'avoid_directions': self._get_blind_avoid_directions(favorable_element),
            'avoid_colors': self._get_blind_avoid_colors(favorable_element)
        }
    
    def _generate_blind_activity_advice(self, element_analysis: Dict, deity_analysis: Dict, overall_score: int) -> Dict[str, Any]:
        """生成盲派活动建议"""
        if overall_score >= 80:
            return {
                'recommended': ['盲派：开展新项目', '盲派：重要会议', '盲派：投资理财', '盲派：社交活动'],
                'avoid': ['盲派：冲动决策', '盲派：过度劳累']
            }
        elif overall_score >= 60:
            return {
                'recommended': ['盲派：日常事务', '盲派：学习进修', '盲派：适度运动'],
                'avoid': ['盲派：重大决策', '盲派：冒险活动']
            }
        else:
            return {
                'recommended': ['盲派：休息调整', '盲派：整理思绪', '盲派：轻度活动'],
                'avoid': ['盲派：重要决策', '盲派：社交活动', '盲派：投资理财']
            }
    
    def _generate_blind_timing_advice(self, element_analysis: Dict, deity_analysis: Dict, target_date: datetime) -> Dict[str, str]:
        """生成盲派时辰建议"""
        return {
            'morning': '盲派：早晨适合静心冥想，调整状态',
            'afternoon': '盲派：下午适合处理重要事务',
            'evening': '盲派：夜晚适合总结反思，规划明日'
        }
    
    def _generate_blind_description(self, score: int, element_analysis: Dict, deity_analysis: Dict, pattern_analysis: Dict) -> str:
        """生成盲派综合描述"""
        if score >= 90:
            return f"盲派：今日运势极佳，{deity_analysis['deity_advice']}，适合积极行动。"
        elif score >= 80:
            return f"盲派：今日运势良好，{deity_analysis['deity_advice']}，可大胆尝试。"
        elif score >= 70:
            return f"盲派：今日运势平稳，{deity_analysis['deity_advice']}，保持正常节奏。"
        elif score >= 60:
            return f"盲派：今日运势一般，{deity_analysis['deity_advice']}，需谨慎行事。"
        else:
            return f"盲派：今日运势欠佳，{deity_analysis['deity_advice']}，建议低调行事。"
    
    def _get_blind_avoid_directions(self, element: str) -> List[str]:
        """获取盲派避免方位"""
        avoid_map = {
            'wood': ['西', '西北'],
            'fire': ['北', '东北'],
            'earth': ['东', '东南'],
            'metal': ['南', '东南'],
            'water': ['南', '东南']
        }
        return avoid_map.get(element, ['西'])
    
    def _get_blind_avoid_colors(self, element: str) -> List[str]:
        """获取盲派避免颜色"""
        avoid_map = {
            'wood': ['白色', '银色'],
            'fire': ['黑色', '蓝色'],
            'earth': ['绿色', '青色'],
            'metal': ['红色', '橙色'],
            'water': ['黄色', '棕色']
        }
        return avoid_map.get(element, ['白色']) 