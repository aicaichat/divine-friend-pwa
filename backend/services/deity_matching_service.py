"""
神仙匹配服务
基于八字分析为用户推荐最适合的神仙朋友
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import json


class WuxingElement(Enum):
    """五行元素"""
    WOOD = "wood"
    FIRE = "fire"
    EARTH = "earth"
    METAL = "metal"
    WATER = "water"


class Season(Enum):
    """季节"""
    SPRING = "spring"
    SUMMER = "summer"
    AUTUMN = "autumn"
    WINTER = "winter"


@dataclass
class Deity:
    """神仙信息"""
    id: str
    name: str
    title: str
    elements: List[WuxingElement]
    personality: List[str]
    specialties: List[str]
    seasonal_affinity: List[Season]
    blessing_style: str
    guidance_style: str
    avatar_url: str
    system_prompt: str
    compatibility_factors: Dict[str, float]


@dataclass
class DeityMatch:
    """神仙匹配结果"""
    deity: Deity
    compatibility_score: float
    match_reasons: List[str]
    personalized_blessings: List[str]
    guidance_suggestions: List[str]


@dataclass
class DeityRecommendation:
    """神仙推荐结果"""
    primary_match: DeityMatch
    secondary_matches: List[DeityMatch]
    seasonal_recommendation: Optional[DeityMatch]
    explanation: str


class DeityMatchingService:
    """神仙匹配服务"""
    
    def __init__(self):
        self.deities = self._load_deities()
    
    def _load_deities(self) -> List[Deity]:
        """加载神仙数据库"""
        return [
            Deity(
                id="guanyin",
                name="观世音菩萨",
                title="大慈大悲救苦救难观世音菩萨",
                elements=[WuxingElement.WATER, WuxingElement.WOOD],
                personality=["慈悲", "智慧", "包容", "温和", "耐心"],
                specialties=["情感咨询", "心灵慰藉", "人际关系", "内心平静"],
                seasonal_affinity=[Season.SPRING, Season.SUMMER],
                blessing_style="慈悲关怀",
                guidance_style="温和引导",
                avatar_url="/avatars/guanyin.png",
                system_prompt="你是观世音菩萨，以慈悲心肠和智慧引导众生。说话温和有耐心，善于倾听和安慰。",
                compatibility_factors={
                    "water_affinity": 0.9,
                    "wood_affinity": 0.8,
                    "emotional_support": 0.95,
                    "relationship_guidance": 0.9
                }
            ),
            Deity(
                id="amitabha",
                name="阿弥陀佛",
                title="西方极乐世界教主阿弥陀佛",
                elements=[WuxingElement.EARTH, WuxingElement.METAL],
                personality=["庄严", "慈悲", "智慧", "包容", "清净"],
                specialties=["心灵净化", "智慧开示", "修行指导", "内心平静"],
                seasonal_affinity=[Season.AUTUMN, Season.WINTER],
                blessing_style="庄严慈悲",
                guidance_style="智慧开示",
                avatar_url="/avatars/amitabha.png",
                system_prompt="你是阿弥陀佛，以庄严慈悲和智慧开示众生。说话庄重有智慧，善于引导修行。",
                compatibility_factors={
                    "earth_affinity": 0.9,
                    "metal_affinity": 0.8,
                    "spiritual_guidance": 0.95,
                    "wisdom_teaching": 0.9
                }
            ),
            Deity(
                id="wenshu",
                name="文殊菩萨",
                title="大智文殊师利菩萨",
                elements=[WuxingElement.WOOD, WuxingElement.FIRE],
                personality=["智慧", "勇敢", "果断", "慈悲", "博学"],
                specialties=["智慧开示", "学业指导", "决策建议", "知识传授"],
                seasonal_affinity=[Season.SPRING, Season.SUMMER],
                blessing_style="智慧加持",
                guidance_style="智慧开示",
                avatar_url="/avatars/wenshu.png",
                system_prompt="你是文殊菩萨，以智慧和勇气著称。说话睿智有见地，善于开导和指导。",
                compatibility_factors={
                    "wood_affinity": 0.9,
                    "fire_affinity": 0.8,
                    "wisdom_guidance": 0.95,
                    "academic_support": 0.9
                }
            ),
            Deity(
                id="puxian",
                name="普贤菩萨",
                title="大行普贤菩萨",
                elements=[WuxingElement.EARTH, WuxingElement.WATER],
                personality=["慈悲", "智慧", "行动力", "包容", "实践"],
                specialties=["行动指导", "实践建议", "事业帮助", "执行力"],
                seasonal_affinity=[Season.SUMMER, Season.AUTUMN],
                blessing_style="行动加持",
                guidance_style="实践指导",
                avatar_url="/avatars/puxian.png",
                system_prompt="你是普贤菩萨，以慈悲和行动力著称。说话务实有行动力，善于指导实践。",
                compatibility_factors={
                    "earth_affinity": 0.8,
                    "water_affinity": 0.9,
                    "action_guidance": 0.95,
                    "career_support": 0.9
                }
            ),
            Deity(
                id="dizang",
                name="地藏王菩萨",
                title="大愿地藏王菩萨",
                elements=[WuxingElement.EARTH, WuxingElement.METAL],
                personality=["慈悲", "坚韧", "耐心", "智慧", "大愿"],
                specialties=["心灵慰藉", "困难帮助", "坚持指导", "愿力加持"],
                seasonal_affinity=[Season.AUTUMN, Season.WINTER],
                blessing_style="愿力加持",
                guidance_style="慈悲指导",
                avatar_url="/avatars/dizang.png",
                system_prompt="你是地藏王菩萨，以慈悲和坚韧著称。说话温和有耐心，善于安慰和鼓励。",
                compatibility_factors={
                    "earth_affinity": 0.9,
                    "metal_affinity": 0.8,
                    "emotional_support": 0.9,
                    "perseverance_guidance": 0.95
                }
            ),
            Deity(
                id="yaoshi",
                name="药师佛",
                title="东方琉璃世界药师琉璃光如来",
                elements=[WuxingElement.WOOD, WuxingElement.WATER],
                personality=["慈悲", "智慧", "治愈", "关怀", "清净"],
                specialties=["健康指导", "心灵治愈", "身心平衡", "养生建议"],
                seasonal_affinity=[Season.SPRING, Season.WINTER],
                blessing_style="健康加持",
                guidance_style="治愈指导",
                avatar_url="/avatars/yaoshi.png",
                system_prompt="你是药师佛，以慈悲和治愈著称。说话温和有治愈力，善于关怀身心健康。",
                compatibility_factors={
                    "wood_affinity": 0.8,
                    "water_affinity": 0.9,
                    "health_guidance": 0.95,
                    "healing_support": 0.9
                }
            )
        ]
    
    def match_deities(self, bazi_analysis: Dict[str, Any], user_preferences: Optional[Dict] = None) -> DeityRecommendation:
        """匹配神仙"""
        matches = []
        
        for deity in self.deities:
            compatibility_score = self._calculate_compatibility(deity, bazi_analysis, user_preferences)
            match_reasons = self._get_match_reasons(deity, bazi_analysis)
            personalized_blessings = self._get_personalized_blessings(deity, bazi_analysis)
            guidance_suggestions = self._get_guidance_suggestions(deity, bazi_analysis)
            
            matches.append(DeityMatch(
                deity=deity,
                compatibility_score=compatibility_score,
                match_reasons=match_reasons,
                personalized_blessings=personalized_blessings,
                guidance_suggestions=guidance_suggestions
            ))
        
        # 按匹配度排序
        matches.sort(key=lambda x: x.compatibility_score, reverse=True)
        
        # 获取主要匹配
        primary_match = matches[0]
        secondary_matches = matches[1:4]  # 前3个次要匹配
        
        # 获取季节性推荐
        seasonal_recommendation = self._get_seasonal_recommendation(matches)
        
        # 生成解释
        explanation = self._generate_explanation(primary_match, bazi_analysis)
        
        return DeityRecommendation(
            primary_match=primary_match,
            secondary_matches=secondary_matches,
            seasonal_recommendation=seasonal_recommendation,
            explanation=explanation
        )
    
    def _calculate_compatibility(self, deity: Deity, bazi_analysis: Dict, user_preferences: Optional[Dict]) -> float:
        """计算匹配度"""
        score = 0.0
        
        # 五行匹配
        element_score = self._calculate_element_compatibility(deity, bazi_analysis)
        score += element_score * 0.3
        
        # 性格匹配
        personality_score = self._calculate_personality_match(deity, bazi_analysis)
        score += personality_score * 0.25
        
        # 需求匹配
        need_score = self._calculate_need_alignment(deity, bazi_analysis)
        score += need_score * 0.25
        
        # 季节匹配
        seasonal_score = self._calculate_seasonal_alignment(deity)
        score += seasonal_score * 0.1
        
        # 用户偏好
        if user_preferences:
            preference_score = self._calculate_user_preference(deity, user_preferences)
            score += preference_score * 0.1
        
        return min(score, 1.0)
    
    def _calculate_element_compatibility(self, deity: Deity, bazi_analysis: Dict) -> float:
        """计算五行匹配度 - 基于相生相克理论"""
        bazi_elements = bazi_analysis.get('bazi_chart', {}).get('elements', {})
        deity_elements = [element.value for element in deity.elements]
        
        # 五行相生关系：木生火，火生土，土生金，金生水，水生木
        sheng_relations = {
            'wood': 'fire',
            'fire': 'earth', 
            'earth': 'metal',
            'metal': 'water',
            'water': 'wood'
        }
        
        # 五行相克关系：木克土，土克水，水克火，火克金，金克木
        ke_relations = {
            'wood': 'earth',
            'earth': 'water',
            'water': 'fire', 
            'fire': 'metal',
            'metal': 'wood'
        }
        
        score = 0.0
        total_weight = 0.0
        
        # 找出用户八字中最弱的五行
        min_count = min(bazi_elements.values()) if bazi_elements else 0
        weak_elements = [elem for elem, count in bazi_elements.items() if count == min_count]
        
        # 找出用户八字中最强的五行
        max_count = max(bazi_elements.values()) if bazi_elements else 0
        strong_elements = [elem for elem, count in bazi_elements.items() if count == max_count]
        
        for deity_element in deity_elements:
            element_score = 0.0
            weight = 1.0
            
            # 神仙五行能补充用户缺乏的五行（直接补充）
            if deity_element in weak_elements:
                element_score += 0.9
                weight += 0.5
            
            # 神仙五行能生用户缺乏的五行（相生补充）
            for weak_elem in weak_elements:
                if sheng_relations.get(deity_element) == weak_elem:
                    element_score += 0.8
                    weight += 0.4
            
            # 神仙五行能克制用户过旺的五行（相克调节）
            for strong_elem in strong_elements:
                if ke_relations.get(deity_element) == strong_elem:
                    element_score += 0.7
                    weight += 0.3
            
            # 神仙五行与用户日主的关系
            day_master_element = self._get_day_master_element(bazi_analysis)
            if day_master_element:
                # 神仙五行生扶日主
                if sheng_relations.get(deity_element) == day_master_element:
                    element_score += 0.6
                    weight += 0.2
                # 神仙五行与日主同类
                elif deity_element == day_master_element:
                    element_score += 0.5
                    weight += 0.1
                # 神仙五行克制日主（需要克制时才好）
                elif ke_relations.get(deity_element) == day_master_element and day_master_element in strong_elements:
                    element_score += 0.4
                    weight += 0.1
            
            score += element_score * weight
            total_weight += weight
        
        return min(score / total_weight if total_weight > 0 else 0, 1.0)
    
    def _get_day_master_element(self, bazi_analysis: Dict) -> str:
        """获取日主五行"""
        day_master = bazi_analysis.get('bazi_chart', {}).get('day_master', '')
        
        # 天干五行对应
        stem_elements = {
            '甲': 'wood', '乙': 'wood',
            '丙': 'fire', '丁': 'fire', 
            '戊': 'earth', '己': 'earth',
            '庚': 'metal', '辛': 'metal',
            '壬': 'water', '癸': 'water'
        }
        
        return stem_elements.get(day_master, 'earth')
    
    def _calculate_personality_match(self, deity: Deity, bazi_analysis: Dict) -> float:
        """计算性格匹配度"""
        personality_traits = bazi_analysis.get('analysis', {}).get('personality', [])
        deity_personality = deity.personality
        
        # 简单的关键词匹配
        match_count = 0
        for trait in deity_personality:
            for analysis_trait in personality_traits:
                if trait in analysis_trait or analysis_trait in trait:
                    match_count += 1
                    break
        
        return min(match_count / len(deity_personality), 1.0)
    
    def _calculate_need_alignment(self, deity: Deity, bazi_analysis: Dict) -> float:
        """计算需求匹配度"""
        analysis = bazi_analysis.get('analysis', {})
        score = 0.0
        
        # 检查各维度需求
        if analysis.get('career') and '事业' in deity.specialties:
            score += 0.3
        if analysis.get('health') and '健康' in deity.specialties:
            score += 0.3
        if analysis.get('relationship') and '情感' in deity.specialties:
            score += 0.2
        if analysis.get('education') and '学业' in deity.specialties:
            score += 0.2
        
        return min(score, 1.0)
    
    def _calculate_seasonal_alignment(self, deity: Deity) -> float:
        """计算季节匹配度"""
        # 这里可以根据当前季节计算
        # 简化实现，返回基础分数
        return 0.5
    
    def _calculate_user_preference(self, deity: Deity, user_preferences: Dict) -> float:
        """计算用户偏好匹配度"""
        preferred_deities = user_preferences.get('preferred_deities', [])
        if deity.id in preferred_deities:
            return 1.0
        return 0.5
    
    def _get_match_reasons(self, deity: Deity, bazi_analysis: Dict) -> List[str]:
        """获取匹配原因"""
        reasons = []
        
        # 基于五行匹配
        bazi_elements = bazi_analysis.get('bazi_chart', {}).get('elements', {})
        deity_elements = [element.value for element in deity.elements]
        
        for element in deity_elements:
            if element in bazi_elements and bazi_elements[element] <= 1:
                reasons.append(f"您的八字中{element}元素较弱，{deity.name}可以为您补充")
        
        # 基于性格匹配
        personality_traits = bazi_analysis.get('analysis', {}).get('personality', [])
        for trait in deity.personality:
            if any(trait in pt for pt in personality_traits):
                reasons.append(f"您的性格特点与{deity.name}的{trait}特质相契合")
        
        # 基于需求匹配
        analysis = bazi_analysis.get('analysis', {})
        if analysis.get('career') and '事业' in deity.specialties:
            reasons.append(f"{deity.name}在事业指导方面有特殊专长")
        
        if not reasons:
            reasons.append(f"{deity.name}的慈悲智慧与您有缘")
        
        return reasons
    
    def _get_personalized_blessings(self, deity: Deity, bazi_analysis: Dict) -> List[str]:
        """获取个性化祝福"""
        blessings = [
            f"愿{deity.name}保佑您身心健康，平安吉祥",
            f"愿{deity.name}加持您智慧增长，事业有成",
            f"愿{deity.name}护佑您家庭和睦，幸福美满"
        ]
        
        # 根据八字分析添加特定祝福
        analysis = bazi_analysis.get('analysis', {})
        if analysis.get('career'):
            blessings.append(f"愿{deity.name}加持您事业顺利，前程似锦")
        if analysis.get('health'):
            blessings.append(f"愿{deity.name}护佑您身体健康，远离疾病")
        if analysis.get('relationship'):
            blessings.append(f"愿{deity.name}保佑您感情美满，姻缘和合")
        
        return blessings
    
    def _get_guidance_suggestions(self, deity: Deity, bazi_analysis: Dict) -> List[str]:
        """获取指导建议"""
        suggestions = [
            f"建议您多与{deity.name}交流，获得智慧指导",
            f"可以在心中默念{deity.name}的名号，获得加持",
            f"建议您学习{deity.name}的慈悲精神，提升自我"
        ]
        
        # 根据神仙特点添加建议
        if "智慧" in deity.personality:
            suggestions.append("建议您多读经典，增长智慧")
        if "慈悲" in deity.personality:
            suggestions.append("建议您多行善事，培养慈悲心")
        if "行动" in deity.specialties:
            suggestions.append("建议您制定计划，积极行动")
        
        return suggestions
    
    def _get_seasonal_recommendation(self, matches: List[DeityMatch]) -> Optional[DeityMatch]:
        """获取季节性推荐"""
        # 简化实现，返回第一个匹配
        return matches[0] if matches else None
    
    def _generate_explanation(self, primary_match: DeityMatch, bazi_analysis: Dict) -> str:
        """生成匹配解释"""
        deity = primary_match.deity
        score = primary_match.compatibility_score
        
        explanation = f"根据您的八字分析，{deity.name}与您有{score:.1%}的匹配度。"
        
        if score >= 0.8:
            explanation += f"{deity.name}是您的最佳神仙朋友，能够为您提供全面的指导和加持。"
        elif score >= 0.6:
            explanation += f"{deity.name}与您有良好的缘分，可以成为您的重要神仙朋友。"
        else:
            explanation += f"虽然匹配度一般，但{deity.name}的慈悲智慧仍然可以为您提供帮助。"
        
        return explanation


# 全局服务实例
deity_matching_service = DeityMatchingService() 