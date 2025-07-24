"""
今日运势计算服务
基于八字、大运和当前日期计算用户的今日运势
"""

import sxtwl
from datetime import datetime, date
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import json

from .bazi_service import BaziService
from baziutil import Gan, Zhi, Ten_deities, Dizhi_gx


@dataclass
class DailyFortuneRequest:
    """今日运势计算请求"""
    birthdate: str  # 出生日期时间
    name: str
    gender: str
    target_date: Optional[str] = None  # 目标日期，默认为今天


@dataclass
class DailyFortuneResult:
    """今日运势结果"""
    date: str
    overall_score: int  # 综合运势评分 1-100
    overall_level: str  # 运势等级：极好/很好/好/一般/差
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


class DailyFortuneService:
    """今日运势计算服务"""
    
    def __init__(self):
        self.bazi_service = BaziService()
        self.lunar = sxtwl.Lunar()
        
        # 五行颜色映射
        self.element_colors = {
            'wood': ['绿色', '青色', '蓝色'],
            'fire': ['红色', '橙色', '紫色'],
            'earth': ['黄色', '棕色', '橙色'],
            'metal': ['白色', '银色', '金色'],
            'water': ['黑色', '蓝色', '灰色']
        }
        
        # 方位映射
        self.directions = {
            'wood': ['东', '东南'],
            'fire': ['南', '东南'],
            'earth': ['中央', '西南', '东北'],
            'metal': ['西', '西北'],
            'water': ['北', '东北']
        }
        
        # 数字映射
        self.element_numbers = {
            'wood': [1, 2, 3],
            'fire': [2, 3, 7],
            'earth': [5, 6, 8],
            'metal': [4, 9, 0],
            'water': [1, 6, 9]
        }
    
    def calculate_daily_fortune(self, request: DailyFortuneRequest) -> DailyFortuneResult:
        """计算今日运势"""
        # 解析目标日期
        target_date = datetime.strptime(request.target_date, '%Y-%m-%d') if request.target_date else datetime.now()
        
        # 计算八字
        bazi_result = self.bazi_service.calculate_bazi(request)
        
        # 获取今日干支信息
        today_info = self.lunar.getDayBySolar(target_date.year, target_date.month, target_date.day)
        
        # 计算今日运势
        fortune = self._calculate_fortune(bazi_result, today_info, target_date)
        
        return fortune
    
    def _calculate_fortune(self, bazi_result: Dict, today_info, target_date: datetime) -> DailyFortuneResult:
        """计算具体运势"""
        bazi_analysis = bazi_result['analysis']
        bazi_chart = bazi_result['bazi_chart']
        
        # 获取今日干支
        today_stem = Gan[today_info.Lday2.tg]
        today_branch = Zhi[today_info.Lday2.dz]
        
        # 获取用户八字信息
        user_day_master = bazi_chart['day_master']
        user_elements = bazi_chart['elements']
        
        # 计算今日与用户八字的相性
        compatibility_score = self._calculate_compatibility(today_stem, today_branch, user_day_master, user_elements)
        
        # 计算综合运势
        overall_score = self._calculate_overall_score(compatibility_score, bazi_analysis)
        overall_level = self._get_fortune_level(overall_score)
        
        # 计算各维度运势
        career_fortune = self._calculate_career_fortune(bazi_analysis, today_info, target_date)
        wealth_fortune = self._calculate_wealth_fortune(bazi_analysis, today_info, target_date)
        health_fortune = self._calculate_health_fortune(bazi_analysis, today_info, target_date)
        relationship_fortune = self._calculate_relationship_fortune(bazi_analysis, today_info, target_date)
        study_fortune = self._calculate_study_fortune(bazi_analysis, today_info, target_date)
        
        # 生成吉利信息
        lucky_info = self._generate_lucky_info(bazi_analysis, today_info)
        
        # 生成活动建议
        activity_advice = self._generate_activity_advice(bazi_analysis, today_info, overall_score)
        
        # 生成时辰建议
        timing_advice = self._generate_timing_advice(bazi_analysis, today_info)
        
        return DailyFortuneResult(
            date=target_date.strftime('%Y-%m-%d'),
            overall_score=overall_score,
            overall_level=overall_level,
            overall_description=self._generate_overall_description(overall_score, bazi_analysis),
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
            dayun_info=bazi_analysis.get('dayun_info', {})
        )
    
    def _calculate_compatibility(self, today_stem: str, today_branch: str, user_day_master: str, user_elements: Dict) -> float:
        """计算今日与用户八字的相性"""
        score = 50  # 基础分数
        
        # 今日干支五行
        today_stem_element = self._get_stem_element(today_stem)
        today_branch_element = self._get_branch_element(today_branch)
        
        # 用户日主五行
        user_day_element = self._get_stem_element(user_day_master)
        
        # 五行相生相克关系
        if self._is_generating(today_stem_element, user_day_element):
            score += 20  # 相生
        elif self._is_controlling(today_stem_element, user_day_element):
            score -= 15  # 相克
        elif today_stem_element == user_day_element:
            score += 10  # 相同
        
        # 考虑用户八字中五行平衡
        user_strongest_element = max(user_elements.items(), key=lambda x: x[1])[0]
        if today_stem_element == user_strongest_element:
            score += 10
        elif self._is_generating(today_stem_element, user_strongest_element):
            score += 15
        
        return max(0, min(100, score))
    
    def _calculate_overall_score(self, compatibility_score: float, bazi_analysis: Dict) -> int:
        """计算综合运势分数"""
        base_score = compatibility_score
        
        # 考虑大运影响
        dayun_info = bazi_analysis.get('dayun_info', {})
        current_dayun = dayun_info.get('current_dayun')
        if current_dayun:
            dayun_element = current_dayun.get('element', 'earth')
            # 大运与今日相性
            if self._is_generating(dayun_element, 'wood') or self._is_generating(dayun_element, 'fire'):
                base_score += 10
            elif self._is_controlling(dayun_element, 'wood') or self._is_controlling(dayun_element, 'fire'):
                base_score -= 5
        
        # 考虑性格特征
        personality = bazi_analysis.get('personality', [])
        if any('热情' in p for p in personality):
            base_score += 5
        if any('稳重' in p for p in personality):
            base_score += 3
        
        return max(1, min(100, int(base_score)))
    
    def _get_fortune_level(self, score: int) -> str:
        """根据分数获取运势等级"""
        if score >= 90:
            return "极好"
        elif score >= 80:
            return "很好"
        elif score >= 70:
            return "好"
        elif score >= 50:
            return "一般"
        else:
            return "差"
    
    def _calculate_career_fortune(self, bazi_analysis: Dict, today_info, target_date: datetime) -> Dict[str, Any]:
        """计算事业运势"""
        career_analysis = bazi_analysis.get('career', [])
        
        # 基于今日干支分析
        today_stem = Gan[today_info.Lday2.tg]
        today_element = self._get_stem_element(today_stem)
        
        # 事业建议
        career_advice = []
        if today_element == 'wood':
            career_advice.append("适合开展新项目，创新思维活跃")
        elif today_element == 'fire':
            career_advice.append("领导能力突出，适合主持会议")
        elif today_element == 'earth':
            career_advice.append("稳定发展，适合处理日常事务")
        elif today_element == 'metal':
            career_advice.append("执行力强，适合完成重要任务")
        elif today_element == 'water':
            career_advice.append("思维敏捷，适合学习新技能")
        
        return {
            'score': self._calculate_dimension_score('career', bazi_analysis, today_element),
            'advice': career_advice,
            'lucky_time': self._get_lucky_time(today_element, 'career'),
            'description': f"今日事业运势{'良好' if today_element in ['wood', 'fire'] else '平稳'}"
        }
    
    def _calculate_wealth_fortune(self, bazi_analysis: Dict, today_info, target_date: datetime) -> Dict[str, Any]:
        """计算财运"""
        wealth_analysis = bazi_analysis.get('wealth', [])
        today_stem = Gan[today_info.Lday2.tg]
        today_element = self._get_stem_element(today_stem)
        
        wealth_advice = []
        if today_element == 'wood':
            wealth_advice.append("适合投资理财，财运渐入佳境")
        elif today_element == 'fire':
            wealth_advice.append("财运旺盛，可能有意外收获")
        elif today_element == 'earth':
            wealth_advice.append("财运稳定，适合储蓄")
        elif today_element == 'metal':
            wealth_advice.append("财运稳健，适合长期投资")
        elif today_element == 'water':
            wealth_advice.append("财运流动，适合灵活理财")
        
        return {
            'score': self._calculate_dimension_score('wealth', bazi_analysis, today_element),
            'advice': wealth_advice,
            'lucky_time': self._get_lucky_time(today_element, 'wealth'),
            'description': f"今日财运{'良好' if today_element in ['fire', 'wood'] else '平稳'}"
        }
    
    def _calculate_health_fortune(self, bazi_analysis: Dict, today_info, target_date: datetime) -> Dict[str, Any]:
        """计算健康运势"""
        health_analysis = bazi_analysis.get('health', [])
        today_stem = Gan[today_info.Lday2.tg]
        today_element = self._get_stem_element(today_stem)
        
        health_advice = []
        if today_element == 'wood':
            health_advice.append("适合户外运动，增强体质")
        elif today_element == 'fire':
            health_advice.append("注意心脏健康，避免过度劳累")
        elif today_element == 'earth':
            health_advice.append("脾胃功能良好，注意饮食规律")
        elif today_element == 'metal':
            health_advice.append("呼吸系统健康，适合深呼吸")
        elif today_element == 'water':
            health_advice.append("肾脏功能活跃，多喝水")
        
        return {
            'score': self._calculate_dimension_score('health', bazi_analysis, today_element),
            'advice': health_advice,
            'lucky_time': self._get_lucky_time(today_element, 'health'),
            'description': f"今日健康运势{'良好' if today_element in ['wood', 'earth'] else '平稳'}"
        }
    
    def _calculate_relationship_fortune(self, bazi_analysis: Dict, today_info, target_date: datetime) -> Dict[str, Any]:
        """计算人际关系运势"""
        relationship_analysis = bazi_analysis.get('relationship', [])
        today_stem = Gan[today_info.Lday2.tg]
        today_element = self._get_stem_element(today_stem)
        
        relationship_advice = []
        if today_element == 'wood':
            relationship_advice.append("人际关系和谐，适合社交活动")
        elif today_element == 'fire':
            relationship_advice.append("热情开朗，容易获得他人好感")
        elif today_element == 'earth':
            relationship_advice.append("稳重可靠，朋友信任度高")
        elif today_element == 'metal':
            relationship_advice.append("原则性强，人际关系清晰")
        elif today_element == 'water':
            relationship_advice.append("思维灵活，善于沟通")
        
        return {
            'score': self._calculate_dimension_score('relationship', bazi_analysis, today_element),
            'advice': relationship_advice,
            'lucky_time': self._get_lucky_time(today_element, 'relationship'),
            'description': f"今日人际关系运势{'良好' if today_element in ['wood', 'fire'] else '平稳'}"
        }
    
    def _calculate_study_fortune(self, bazi_analysis: Dict, today_info, target_date: datetime) -> Dict[str, Any]:
        """计算学习运势"""
        education_analysis = bazi_analysis.get('education', [])
        today_stem = Gan[today_info.Lday2.tg]
        today_element = self._get_stem_element(today_stem)
        
        study_advice = []
        if today_element == 'wood':
            study_advice.append("学习能力强，适合学习新知识")
        elif today_element == 'fire':
            study_advice.append("思维活跃，创造力强")
        elif today_element == 'earth':
            study_advice.append("学习稳定，适合复习巩固")
        elif today_element == 'metal':
            study_advice.append("逻辑思维强，适合学习理科")
        elif today_element == 'water':
            study_advice.append("记忆力好，适合学习文科")
        
        return {
            'score': self._calculate_dimension_score('education', bazi_analysis, today_element),
            'advice': study_advice,
            'lucky_time': self._get_lucky_time(today_element, 'study'),
            'description': f"今日学习运势{'良好' if today_element in ['wood', 'water'] else '平稳'}"
        }
    
    def _generate_lucky_info(self, bazi_analysis: Dict, today_info) -> Dict[str, Any]:
        """生成吉利信息"""
        today_stem = Gan[today_info.Lday2.tg]
        today_element = self._get_stem_element(today_stem)
        
        # 吉利方位
        lucky_directions = self.directions.get(today_element, ['东'])
        
        # 吉利颜色
        lucky_colors = self.element_colors.get(today_element, ['白色'])
        
        # 吉利数字
        lucky_numbers = self.element_numbers.get(today_element, [1])
        
        # 避免方位（相克方位）
        avoid_directions = self._get_avoid_directions(today_element)
        
        # 避免颜色（相克颜色）
        avoid_colors = self._get_avoid_colors(today_element)
        
        return {
            'directions': lucky_directions,
            'colors': lucky_colors,
            'numbers': lucky_numbers,
            'avoid_directions': avoid_directions,
            'avoid_colors': avoid_colors
        }
    
    def _generate_activity_advice(self, bazi_analysis: Dict, today_info, overall_score: int) -> Dict[str, Any]:
        """生成活动建议"""
        today_stem = Gan[today_info.Lday2.tg]
        today_element = self._get_stem_element(today_stem)
        
        recommended = []
        avoid = []
        
        if overall_score >= 80:
            recommended.extend([
                "适合重要决策",
                "适合签约合作",
                "适合投资理财",
                "适合社交活动"
            ])
        elif overall_score >= 60:
            recommended.extend([
                "适合日常事务",
                "适合学习进修",
                "适合运动健身"
            ])
        else:
            recommended.extend([
                "适合休息放松",
                "适合整理内务",
                "适合阅读思考"
            ])
            avoid.extend([
                "避免重要决策",
                "避免高风险活动",
                "避免冲突争执"
            ])
        
        # 根据今日五行添加特定建议
        if today_element == 'wood':
            recommended.append("适合户外活动")
        elif today_element == 'fire':
            recommended.append("适合创意工作")
        elif today_element == 'earth':
            recommended.append("适合稳定工作")
        elif today_element == 'metal':
            recommended.append("适合精细工作")
        elif today_element == 'water':
            recommended.append("适合学习思考")
        
        return {
            'recommended': recommended,
            'avoid': avoid
        }
    
    def _generate_timing_advice(self, bazi_analysis: Dict, today_info) -> Dict[str, str]:
        """生成时辰建议"""
        today_stem = Gan[today_info.Lday2.tg]
        today_element = self._get_stem_element(today_stem)
        
        timing_advice = {}
        
        # 根据五行给出时辰建议
        if today_element == 'wood':
            timing_advice = {
                "子时(23:00-01:00)": "适合冥想思考",
                "寅时(03:00-05:00)": "适合早起运动",
                "午时(11:00-13:00)": "适合重要决策",
                "申时(15:00-17:00)": "适合学习工作"
            }
        elif today_element == 'fire':
            timing_advice = {
                "巳时(09:00-11:00)": "适合创意工作",
                "午时(11:00-13:00)": "适合社交活动",
                "未时(13:00-15:00)": "适合团队合作",
                "戌时(19:00-21:00)": "适合娱乐放松"
            }
        elif today_element == 'earth':
            timing_advice = {
                "辰时(07:00-09:00)": "适合稳定工作",
                "午时(11:00-13:00)": "适合日常事务",
                "未时(13:00-15:00)": "适合整理内务",
                "戌时(19:00-21:00)": "适合家庭活动"
            }
        elif today_element == 'metal':
            timing_advice = {
                "申时(15:00-17:00)": "适合精细工作",
                "酉时(17:00-19:00)": "适合总结反思",
                "戌时(19:00-21:00)": "适合学习进修",
                "亥时(21:00-23:00)": "适合规划未来"
            }
        elif today_element == 'water':
            timing_advice = {
                "子时(23:00-01:00)": "适合深度思考",
                "寅时(03:00-05:00)": "适合学习新知识",
                "申时(15:00-17:00)": "适合创意工作",
                "亥时(21:00-23:00)": "适合阅读写作"
            }
        
        return timing_advice
    
    def _generate_overall_description(self, score: int, bazi_analysis: Dict) -> str:
        """生成综合运势描述"""
        if score >= 90:
            return "今日运势极佳，诸事顺遂，适合把握机会，开展重要事务。"
        elif score >= 80:
            return "今日运势很好，大部分事情都能顺利进行，适合积极行动。"
        elif score >= 70:
            return "今日运势良好，整体平稳，适合按计划行事。"
        elif score >= 50:
            return "今日运势一般，需要谨慎行事，避免冒险。"
        else:
            return "今日运势较差，建议低调行事，避免重要决策。"
    
    # 辅助方法
    def _get_stem_element(self, stem: str) -> str:
        """获取天干五行"""
        stem_elements = {
            '甲': 'wood', '乙': 'wood',
            '丙': 'fire', '丁': 'fire',
            '戊': 'earth', '己': 'earth',
            '庚': 'metal', '辛': 'metal',
            '壬': 'water', '癸': 'water'
        }
        return stem_elements.get(stem, 'earth')
    
    def _get_branch_element(self, branch: str) -> str:
        """获取地支五行"""
        branch_elements = {
            '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood',
            '辰': 'earth', '巳': 'fire', '午': 'fire', '未': 'earth',
            '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water'
        }
        return branch_elements.get(branch, 'earth')
    
    def _is_generating(self, element1: str, element2: str) -> bool:
        """判断五行相生"""
        generating_relations = {
            'wood': 'fire',
            'fire': 'earth',
            'earth': 'metal',
            'metal': 'water',
            'water': 'wood'
        }
        return generating_relations.get(element1) == element2
    
    def _is_controlling(self, element1: str, element2: str) -> bool:
        """判断五行相克"""
        controlling_relations = {
            'wood': 'earth',
            'earth': 'water',
            'water': 'fire',
            'fire': 'metal',
            'metal': 'wood'
        }
        return controlling_relations.get(element1) == element2
    
    def _calculate_dimension_score(self, dimension: str, bazi_analysis: Dict, today_element: str) -> int:
        """计算各维度运势分数"""
        base_score = 60
        
        # 根据今日五行调整分数
        if dimension == 'career' and today_element in ['wood', 'fire']:
            base_score += 15
        elif dimension == 'wealth' and today_element in ['fire', 'wood']:
            base_score += 15
        elif dimension == 'health' and today_element in ['wood', 'earth']:
            base_score += 15
        elif dimension == 'relationship' and today_element in ['wood', 'fire']:
            base_score += 15
        elif dimension == 'education' and today_element in ['wood', 'water']:
            base_score += 15
        
        return max(1, min(100, base_score))
    
    def _get_lucky_time(self, element: str, dimension: str) -> str:
        """获取吉利时辰"""
        time_mapping = {
            'wood': '寅时(03:00-05:00)',
            'fire': '午时(11:00-13:00)',
            'earth': '辰时(07:00-09:00)',
            'metal': '申时(15:00-17:00)',
            'water': '子时(23:00-01:00)'
        }
        return time_mapping.get(element, '午时(11:00-13:00)')
    
    def _get_avoid_directions(self, element: str) -> List[str]:
        """获取避免方位"""
        avoid_mapping = {
            'wood': ['西', '西北'],
            'fire': ['北', '东北'],
            'earth': ['东', '东南'],
            'metal': ['南', '东南'],
            'water': ['南', '西南']
        }
        return avoid_mapping.get(element, [])
    
    def _get_avoid_colors(self, element: str) -> List[str]:
        """获取避免颜色"""
        avoid_mapping = {
            'wood': ['白色', '银色'],
            'fire': ['黑色', '蓝色'],
            'earth': ['绿色', '青色'],
            'metal': ['红色', '橙色'],
            'water': ['黄色', '棕色']
        }
        return avoid_mapping.get(element, [])


# 全局服务实例
daily_fortune_service = DailyFortuneService() 