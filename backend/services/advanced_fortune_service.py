"""
深度优化的今日运势计算服务
基于传统八字命理学，结合现代算法，提供准确的运势预测
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
class AdvancedFortuneRequest:
    """高级运势计算请求"""
    birthdate: str  # 出生日期时间
    name: str
    gender: str
    target_date: Optional[str] = None  # 目标日期，默认为今天


@dataclass
class AdvancedFortuneResult:
    """高级运势结果"""
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
    
    # 新增：详细分析
    element_analysis: Dict[str, Any]  # 五行分析
    deity_analysis: Dict[str, Any]  # 十神分析
    conflict_analysis: Dict[str, Any]  # 冲克分析


class AdvancedFortuneService:
    """深度优化的今日运势计算服务"""
    
    def __init__(self):
        self.bazi_service = BaziService()
        self.lunar = sxtwl.Lunar()
        
        # 五行属性映射
        self.element_attributes = {
            'wood': {
                'colors': ['绿色', '青色', '蓝色'],
                'directions': ['东', '东南'],
                'numbers': [1, 2, 3],
                'seasons': ['春'],
                'characteristics': ['生长', '扩展', '创新']
            },
            'fire': {
                'colors': ['红色', '橙色', '紫色'],
                'directions': ['南', '东南'],
                'numbers': [2, 3, 7],
                'seasons': ['夏'],
                'characteristics': ['热情', '活力', '领导']
            },
            'earth': {
                'colors': ['黄色', '棕色', '橙色'],
                'directions': ['中央', '西南', '东北'],
                'numbers': [5, 6, 8],
                'seasons': ['长夏'],
                'characteristics': ['稳定', '包容', '务实']
            },
            'metal': {
                'colors': ['白色', '银色', '金色'],
                'directions': ['西', '西北'],
                'numbers': [4, 9, 0],
                'seasons': ['秋'],
                'characteristics': ['果断', '精确', '执行']
            },
            'water': {
                'colors': ['黑色', '蓝色', '灰色'],
                'directions': ['北', '东北'],
                'numbers': [1, 6, 9],
                'seasons': ['冬'],
                'characteristics': ['智慧', '灵活', '适应']
            }
        }
        
        # 十神关系映射
        self.deity_relations = {
            '比肩': {'relation': '同我', 'favorable': True},
            '劫财': {'relation': '同我', 'favorable': False},
            '食神': {'relation': '我生', 'favorable': True},
            '伤官': {'relation': '我生', 'favorable': False},
            '偏财': {'relation': '我克', 'favorable': True},
            '正财': {'relation': '我克', 'favorable': True},
            '七杀': {'relation': '克我', 'favorable': False},
            '正官': {'relation': '克我', 'favorable': True},
            '偏印': {'relation': '生我', 'favorable': True},
            '正印': {'relation': '生我', 'favorable': True}
        }
        
        # 地支藏干
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
    
    def calculate_advanced_fortune(self, request: AdvancedFortuneRequest) -> AdvancedFortuneResult:
        """计算高级今日运势"""
        # 解析目标日期
        target_date = datetime.strptime(request.target_date, '%Y-%m-%d') if request.target_date else datetime.now()
        
        # 计算用户八字
        bazi_result = self.bazi_service.calculate_bazi(request)
        
        # 获取今日干支信息
        today_info = self.lunar.getDayBySolar(target_date.year, target_date.month, target_date.day)
        
        # 深度分析今日运势
        fortune = self._calculate_advanced_fortune(bazi_result, today_info, target_date)
        
        return fortune
    
    def _calculate_advanced_fortune(self, bazi_result: Dict, today_info, target_date: datetime) -> AdvancedFortuneResult:
        """深度计算今日运势"""
        bazi_analysis = bazi_result['analysis']
        bazi_chart = bazi_result['bazi_chart']
        
        # 获取今日干支
        today_stem = Gan[today_info.Lday2.tg]
        today_branch = Zhi[today_info.Lday2.dz]
        
        # 获取用户八字信息
        user_day_master = bazi_chart['day_master']
        user_elements = bazi_chart['elements']
        
        # 1. 五行深度分析
        element_analysis = self._analyze_elements_deep(today_stem, today_branch, user_day_master, user_elements)
        
        # 2. 十神关系分析
        deity_analysis = self._analyze_deity_relations(today_stem, today_branch, user_day_master, bazi_chart)
        
        # 3. 冲克关系分析
        conflict_analysis = self._analyze_conflicts(today_stem, today_branch, bazi_chart)
        
        # 4. 计算综合运势分数
        overall_score = self._calculate_advanced_score(element_analysis, deity_analysis, conflict_analysis, bazi_analysis)
        overall_level = self._get_advanced_fortune_level(overall_score)
        
        # 5. 计算各维度运势
        career_fortune = self._calculate_advanced_career_fortune(element_analysis, deity_analysis, conflict_analysis, bazi_analysis)
        wealth_fortune = self._calculate_advanced_wealth_fortune(element_analysis, deity_analysis, conflict_analysis, bazi_analysis)
        health_fortune = self._calculate_advanced_health_fortune(element_analysis, deity_analysis, conflict_analysis, bazi_analysis)
        relationship_fortune = self._calculate_advanced_relationship_fortune(element_analysis, deity_analysis, conflict_analysis, bazi_analysis)
        study_fortune = self._calculate_advanced_study_fortune(element_analysis, deity_analysis, conflict_analysis, bazi_analysis)
        
        # 6. 生成吉利信息
        lucky_info = self._generate_advanced_lucky_info(element_analysis, deity_analysis, conflict_analysis)
        
        # 7. 生成活动建议
        activity_advice = self._generate_advanced_activity_advice(element_analysis, deity_analysis, overall_score)
        
        # 8. 生成时辰建议
        timing_advice = self._generate_advanced_timing_advice(element_analysis, deity_analysis, target_date)
        
        # 9. 生成综合描述
        overall_description = self._generate_advanced_description(overall_score, element_analysis, deity_analysis)
        
        return AdvancedFortuneResult(
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
            element_analysis=element_analysis,
            deity_analysis=deity_analysis,
            conflict_analysis=conflict_analysis
        )
    
    def _analyze_elements_deep(self, today_stem: str, today_branch: str, user_day_master: str, user_elements: Dict) -> Dict[str, Any]:
        """深度五行分析"""
        today_stem_element = self._get_stem_element(today_stem)
        today_branch_element = self._get_branch_element(today_branch)
        user_day_element = self._get_stem_element(user_day_master)
        
        # 计算五行力量
        element_strength = self._calculate_element_strength(today_stem, today_branch, user_elements)
        
        # 分析相生相克关系
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
        
        # 分析地支藏干
        hidden_stems = self.branch_hidden_stems.get(today_branch, [])
        hidden_relations = []
        for hidden_stem in hidden_stems:
            hidden_element = self._get_stem_element(hidden_stem)
            if self._is_generating(hidden_element, user_day_element):
                hidden_relations.append(f"{hidden_stem}({hidden_element})生{user_day_element}")
            elif self._is_controlling(hidden_element, user_day_element):
                hidden_relations.append(f"{hidden_stem}({hidden_element})克{user_day_element}")
        
        return {
            'today_stem_element': today_stem_element,
            'today_branch_element': today_branch_element,
            'user_day_element': user_day_element,
            'element_strength': element_strength,
            'generation_relations': generation_relations,
            'control_relations': control_relations,
            'hidden_relations': hidden_relations,
            'overall_balance': self._calculate_element_balance(element_strength)
        }
    
    def _analyze_deity_relations(self, today_stem: str, today_branch: str, user_day_master: str, bazi_chart: Dict) -> Dict[str, Any]:
        """十神关系分析"""
        try:
            # 计算今日天干对日主的十神关系
            # Ten_deities是一个字典，键是日主天干，值是bidict
            if user_day_master in Ten_deities and today_stem in Ten_deities[user_day_master]:
                today_deity = Ten_deities[user_day_master][today_stem]
            else:
                today_deity = "正印"  # 默认值
        except Exception as e:
            print(f"十神计算错误: {e}, user_day_master={user_day_master}, today_stem={today_stem}")
            today_deity = "正印"  # 默认值
        
        # 分析十神性质
        deity_info = self.deity_relations.get(today_deity, {})
        
        # 计算十神力量
        deity_strength = self._calculate_deity_strength(today_stem, today_branch, bazi_chart)
        
        return {
            'today_deity': today_deity,
            'deity_relation': deity_info.get('relation', ''),
            'is_favorable': deity_info.get('favorable', True),
            'deity_strength': deity_strength,
            'deity_advice': self._get_deity_advice(today_deity, deity_strength)
        }
    
    def _analyze_conflicts(self, today_stem: str, today_branch: str, bazi_chart: Dict) -> Dict[str, Any]:
        """冲克关系分析"""
        conflicts = []
        harmonies = []
        
        # 检查今日地支与用户八字的冲克关系
        user_pillars = bazi_chart.get('pillars', {})
        
        for pillar_type, pillar_info in user_pillars.items():
            if 'branch' in pillar_info:
                user_branch = pillar_info['branch']
                
                # 检查冲克
                if self._is_conflicting(today_branch, user_branch):
                    conflicts.append(f"今日{today_branch}冲{pillar_type}支{user_branch}")
                
                # 检查合化
                if self._is_harmonizing(today_branch, user_branch):
                    harmonies.append(f"今日{today_branch}合{pillar_type}支{user_branch}")
        
        return {
            'conflicts': conflicts,
            'harmonies': harmonies,
            'conflict_level': len(conflicts),
            'harmony_level': len(harmonies)
        }
    
    def _calculate_advanced_score(self, element_analysis: Dict, deity_analysis: Dict, conflict_analysis: Dict, bazi_analysis: Dict) -> int:
        """计算高级运势分数"""
        base_score = 50
        
        # 1. 五行分析权重 (40%)
        element_score = self._calculate_element_score(element_analysis)
        base_score += element_score * 0.4
        
        # 2. 十神分析权重 (30%)
        deity_score = self._calculate_deity_score(deity_analysis)
        base_score += deity_score * 0.3
        
        # 3. 冲克分析权重 (20%)
        conflict_score = self._calculate_conflict_score(conflict_analysis)
        base_score += conflict_score * 0.2
        
        # 4. 大运影响权重 (10%)
        dayun_score = self._calculate_dayun_score(bazi_analysis)
        base_score += dayun_score * 0.1
        
        return max(1, min(100, int(base_score)))
    
    def _calculate_element_score(self, element_analysis: Dict) -> int:
        """计算五行分析分数"""
        score = 0
        
        # 相生关系加分
        generation_count = len(element_analysis['generation_relations'])
        score += generation_count * 15
        
        # 相克关系减分
        control_count = len(element_analysis['control_relations'])
        score -= control_count * 10
        
        # 地支藏干关系
        hidden_favorable = len([r for r in element_analysis['hidden_relations'] if '生' in r])
        hidden_unfavorable = len([r for r in element_analysis['hidden_relations'] if '克' in r])
        score += hidden_favorable * 8
        score -= hidden_unfavorable * 5
        
        # 五行平衡加分
        balance = element_analysis['overall_balance']
        if balance > 0.7:
            score += 20
        elif balance > 0.5:
            score += 10
        
        return score
    
    def _calculate_deity_score(self, deity_analysis: Dict) -> int:
        """计算十神分析分数"""
        score = 0
        
        if deity_analysis['is_favorable']:
            score += 20
        else:
            score -= 15
        
        # 十神力量影响
        strength = deity_analysis['deity_strength']
        if strength > 0.7:
            score += 15
        elif strength < 0.3:
            score -= 10
        
        return score
    
    def _calculate_conflict_score(self, conflict_analysis: Dict) -> int:
        """计算冲克分析分数"""
        score = 0
        
        # 冲克减分
        score -= conflict_analysis['conflict_level'] * 8
        
        # 合化加分
        score += conflict_analysis['harmony_level'] * 12
        
        return score
    
    def _calculate_dayun_score(self, bazi_analysis: Dict) -> int:
        """计算大运影响分数"""
        dayun_info = bazi_analysis.get('dayun_info', {})
        current_dayun = dayun_info.get('current_dayun', {})
        
        if not current_dayun:
            return 0
        
        # 大运与今日相性分析
        dayun_element = current_dayun.get('element', 'earth')
        today_element = 'wood'  # 简化处理
        
        if self._is_generating(dayun_element, today_element):
            return 20
        elif self._is_controlling(dayun_element, today_element):
            return -10
        else:
            return 5
    
    def _get_advanced_fortune_level(self, score: int) -> str:
        """获取高级运势等级"""
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
    
    def _is_conflicting(self, branch1: str, branch2: str) -> bool:
        """判断地支冲克"""
        conflict_pairs = [
            ('子', '午'), ('丑', '未'), ('寅', '申'),
            ('卯', '酉'), ('辰', '戌'), ('巳', '亥')
        ]
        return (branch1, branch2) in conflict_pairs or (branch2, branch1) in conflict_pairs
    
    def _is_harmonizing(self, branch1: str, branch2: str) -> bool:
        """判断地支合化"""
        harmony_pairs = [
            ('子', '丑'), ('寅', '亥'), ('卯', '戌'),
            ('辰', '酉'), ('巳', '申'), ('午', '未')
        ]
        return (branch1, branch2) in harmony_pairs or (branch2, branch1) in harmony_pairs
    
    def _calculate_element_strength(self, today_stem: str, today_branch: str, user_elements: Dict) -> Dict[str, float]:
        """计算五行力量"""
        # 简化实现，实际应该更复杂
        return user_elements
    
    def _calculate_element_balance(self, element_strength: Dict[str, float]) -> float:
        """计算五行平衡度"""
        if not element_strength:
            return 0.5
        
        values = list(element_strength.values())
        if not values:
            return 0.5
        
        mean_val = sum(values) / len(values)
        variance = sum((x - mean_val) ** 2 for x in values) / len(values)
        
        # 方差越小，平衡度越高
        balance = 1 / (1 + variance)
        return min(1.0, max(0.0, balance))
    
    def _calculate_deity_strength(self, today_stem: str, today_branch: str, bazi_chart: Dict) -> float:
        """计算十神力量"""
        # 简化实现
        return 0.6
    
    def _get_deity_advice(self, deity: str, strength: float) -> str:
        """获取十神建议"""
        advice_map = {
            '比肩': '今日适合与朋友合作，共同发展',
            '劫财': '今日需谨慎处理人际关系，避免冲突',
            '食神': '今日思维活跃，适合学习创新',
            '伤官': '今日需控制情绪，避免冲动',
            '偏财': '今日财运不错，可适当投资',
            '正财': '今日正财运佳，适合稳定收益',
            '七杀': '今日压力较大，需保持冷静',
            '正官': '今日事业运佳，适合处理公务',
            '偏印': '今日学习运佳，适合进修',
            '正印': '今日贵人运佳，易得长辈帮助'
        }
        return advice_map.get(deity, '今日运势平稳，保持平常心')
    
    # 各维度运势计算方法（简化实现）
    def _calculate_advanced_career_fortune(self, element_analysis: Dict, deity_analysis: Dict, conflict_analysis: Dict, bazi_analysis: Dict) -> Dict[str, Any]:
        """计算高级事业运势"""
        score = 60 + len(element_analysis['generation_relations']) * 10 - len(conflict_analysis['conflicts']) * 5
        
        return {
            'score': max(1, min(100, score)),
            'advice': [deity_analysis['deity_advice']],
            'lucky_time': '上午9-11点',
            'description': f"今日事业运势{'良好' if score > 70 else '平稳'}"
        }
    
    def _calculate_advanced_wealth_fortune(self, element_analysis: Dict, deity_analysis: Dict, conflict_analysis: Dict, bazi_analysis: Dict) -> Dict[str, Any]:
        """计算高级财运"""
        score = 60 + len(element_analysis['hidden_relations']) * 8 - len(conflict_analysis['conflicts']) * 3
        
        return {
            'score': max(1, min(100, score)),
            'advice': ['今日财运平稳，适合稳健投资'],
            'lucky_time': '下午2-4点',
            'description': f"今日财运{'不错' if score > 70 else '一般'}"
        }
    
    def _calculate_advanced_health_fortune(self, element_analysis: Dict, deity_analysis: Dict, conflict_analysis: Dict, bazi_analysis: Dict) -> Dict[str, Any]:
        """计算高级健康运势"""
        score = 70 - len(conflict_analysis['conflicts']) * 8
        
        return {
            'score': max(1, min(100, score)),
            'advice': ['今日注意休息，保持良好作息'],
            'lucky_time': '晚上7-9点',
            'description': f"今日健康运势{'良好' if score > 70 else '需注意'}"
        }
    
    def _calculate_advanced_relationship_fortune(self, element_analysis: Dict, deity_analysis: Dict, conflict_analysis: Dict, bazi_analysis: Dict) -> Dict[str, Any]:
        """计算高级人际关系运势"""
        score = 60 + len(conflict_analysis.get('harmonies', [])) * 15 - len(conflict_analysis.get('conflicts', [])) * 10
        
        return {
            'score': max(1, min(100, score)),
            'advice': ['今日人际关系和谐，适合社交'],
            'lucky_time': '中午12-2点',
            'description': f"今日人际关系{'和谐' if score > 70 else '平稳'}"
        }
    
    def _calculate_advanced_study_fortune(self, element_analysis: Dict, deity_analysis: Dict, conflict_analysis: Dict, bazi_analysis: Dict) -> Dict[str, Any]:
        """计算高级学习运势"""
        score = 65 + len(element_analysis['generation_relations']) * 12
        
        return {
            'score': max(1, min(100, score)),
            'advice': ['今日学习效率高，适合吸收新知识'],
            'lucky_time': '上午8-10点',
            'description': f"今日学习运势{'优秀' if score > 75 else '良好'}"
        }
    
    def _generate_advanced_lucky_info(self, element_analysis: Dict, deity_analysis: Dict, conflict_analysis: Dict) -> Dict[str, Any]:
        """生成高级吉利信息"""
        favorable_element = element_analysis['user_day_element']
        element_attrs = self.element_attributes.get(favorable_element, {})
        
        return {
            'directions': element_attrs.get('directions', ['东']),
            'colors': element_attrs.get('colors', ['绿色']),
            'numbers': element_attrs.get('numbers', [1]),
            'avoid_directions': self._get_avoid_directions(favorable_element),
            'avoid_colors': self._get_avoid_colors(favorable_element)
        }
    
    def _generate_advanced_activity_advice(self, element_analysis: Dict, deity_analysis: Dict, overall_score: int) -> Dict[str, Any]:
        """生成高级活动建议"""
        if overall_score >= 80:
            return {
                'recommended': ['开展新项目', '重要会议', '投资理财', '社交活动'],
                'avoid': ['冲动决策', '过度劳累']
            }
        elif overall_score >= 60:
            return {
                'recommended': ['日常事务', '学习进修', '适度运动'],
                'avoid': ['重大决策', '冒险活动']
            }
        else:
            return {
                'recommended': ['休息调整', '整理思绪', '轻度活动'],
                'avoid': ['重要决策', '社交活动', '投资理财']
            }
    
    def _generate_advanced_timing_advice(self, element_analysis: Dict, deity_analysis: Dict, target_date: datetime) -> Dict[str, str]:
        """生成高级时辰建议"""
        return {
            'morning': '早晨适合静心冥想，调整状态',
            'afternoon': '下午适合处理重要事务',
            'evening': '夜晚适合总结反思，规划明日'
        }
    
    def _generate_advanced_description(self, score: int, element_analysis: Dict, deity_analysis: Dict) -> str:
        """生成高级综合描述"""
        if score >= 90:
            return f"今日运势极佳，{deity_analysis['deity_advice']}，适合积极行动。"
        elif score >= 80:
            return f"今日运势良好，{deity_analysis['deity_advice']}，可大胆尝试。"
        elif score >= 70:
            return f"今日运势平稳，{deity_analysis['deity_advice']}，保持正常节奏。"
        elif score >= 60:
            return f"今日运势一般，{deity_analysis['deity_advice']}，需谨慎行事。"
        else:
            return f"今日运势欠佳，{deity_analysis['deity_advice']}，建议低调行事。"
    
    def _get_avoid_directions(self, element: str) -> List[str]:
        """获取避免方位"""
        avoid_map = {
            'wood': ['西', '西北'],
            'fire': ['北', '东北'],
            'earth': ['东', '东南'],
            'metal': ['南', '东南'],
            'water': ['南', '东南']
        }
        return avoid_map.get(element, ['西'])
    
    def _get_avoid_colors(self, element: str) -> List[str]:
        """获取避免颜色"""
        avoid_map = {
            'wood': ['白色', '银色'],
            'fire': ['黑色', '蓝色'],
            'earth': ['绿色', '青色'],
            'metal': ['红色', '橙色'],
            'water': ['黄色', '棕色']
        }
        return avoid_map.get(element, ['白色']) 