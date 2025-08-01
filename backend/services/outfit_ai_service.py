"""
AI智能穿衣推荐服务
基于八字运势分析的个性化穿衣建议系统
"""

import json
import hashlib
from datetime import datetime, date
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
import logging

from .bazi_service import BaziService
from .blind_school_fortune_service import BlindSchoolFortuneService, BlindSchoolFortuneRequest
from .daily_fortune_service import DailyFortuneService, DailyFortuneRequest

logger = logging.getLogger(__name__)


@dataclass
class UserProfile:
    """用户基础信息"""
    birthdate: str  # ISO格式: "1990-05-15T08:30:00"
    name: str
    gender: str  # "male" 或 "female"
    birth_place: Optional[str] = None


@dataclass
class UserPreferences:
    """用户偏好设置"""
    occasion: List[str] = None  # ["business", "casual", "formal"]
    season: str = "spring"  # "spring", "summer", "autumn", "winter"
    weather: Dict[str, Any] = None  # {"temperature": 20, "condition": "sunny"}
    style_preference: List[str] = None  # ["modern", "traditional", "minimalist"]
    color_preferences: List[str] = None  # ["avoid_red", "prefer_blue"]


@dataclass
class UserConstraints:
    """用户约束条件"""
    budget_range: List[int] = None  # [100, 1000]
    avoid_colors: List[str] = None
    avoid_materials: List[str] = None


@dataclass
class OutfitRecommendationRequest:
    """穿衣推荐请求"""
    user_profile: UserProfile
    target_date: str = None  # "2024-01-15"
    preferences: UserPreferences = None
    constraints: UserConstraints = None
    
    @classmethod
    def from_dict(cls, data: dict):
        """从字典创建请求对象"""
        user_profile = UserProfile(**data.get('user_profile', {}))
        preferences = UserPreferences(**(data.get('preferences', {})))
        constraints = UserConstraints(**(data.get('constraints', {})))
        
        return cls(
            user_profile=user_profile,
            target_date=data.get('target_date'),
            preferences=preferences,
            constraints=constraints
        )


@dataclass
class FortuneBoost:
    """运势加持效果"""
    wealth: int = 0
    career: int = 0
    love: int = 0
    health: int = 0


@dataclass
class OutfitDetails:
    """穿衣方案详情"""
    primary_colors: List[str]
    secondary_colors: List[str] = None
    materials: List[str] = None
    accessories: List[str] = None
    style: str = None


@dataclass
class FiveElementsAnalysis:
    """五行分析"""
    element_match: str
    enhancement_theory: str
    warning: str = None


@dataclass
class TimingAdvice:
    """时间建议"""
    best_wear_time: str
    optimal_activities: List[str]
    avoid_activities: List[str] = None


@dataclass
class OutfitRecommendation:
    """穿衣推荐结果"""
    id: str
    rank: int
    confidence: float  # 0.0-1.0
    theme: str
    base_fortune_boost: FortuneBoost
    outfit_details: OutfitDetails
    five_elements_analysis: FiveElementsAnalysis
    timing_advice: TimingAdvice
    
    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class AIAnalysis:
    """AI分析结果"""
    bazi_summary: Dict[str, Any]
    daily_fortune: Dict[str, Any]
    recommendation_reason: str


@dataclass
class OutfitRecommendationResponse:
    """穿衣推荐响应"""
    ai_analysis: AIAnalysis
    recommendations: List[OutfitRecommendation]
    meta: Dict[str, Any]
    
    def to_dict(self) -> dict:
        return {
            'ai_analysis': asdict(self.ai_analysis),
            'recommendations': [rec.to_dict() for rec in self.recommendations],
            'meta': self.meta
        }


class FiveElementsMatcher:
    """五行穿衣匹配引擎"""
    
    def __init__(self):
        # 五行与颜色映射
        self.element_color_map = {
            'wood': {
                'primary': ['绿色', '青色', '蓝色'],
                'secondary': ['黑色'],  # 水生木
                'avoid': ['白色', '银色', '金色']  # 金克木
            },
            'fire': {
                'primary': ['红色', '橙色', '紫色', '粉色'],
                'secondary': ['绿色', '青色'],  # 木生火
                'avoid': ['黑色', '蓝色', '深蓝色']  # 水克火
            },
            'earth': {
                'primary': ['黄色', '棕色', '土色', '咖啡色'],
                'secondary': ['红色', '橙色'],  # 火生土
                'avoid': ['绿色', '青色']  # 木克土
            },
            'metal': {
                'primary': ['白色', '银色', '金色', '灰色'],
                'secondary': ['黄色', '土色'],  # 土生金
                'avoid': ['红色', '橙色']  # 火克金
            },
            'water': {
                'primary': ['黑色', '深蓝色', '蓝色'],
                'secondary': ['白色', '银色'],  # 金生水
                'avoid': ['黄色', '土色']  # 土克水
            }
        }
        
        # 五行与材质映射
        self.element_material_map = {
            'wood': ['棉质', '麻质', '天然纤维', '竹纤维'],
            'fire': ['丝绸', '亮面材质', '光泽面料'],
            'earth': ['羊毛', '厚实材质', '粗纺面料'],
            'metal': ['金属装饰', '光泽材质', '硬挺面料'],
            'water': ['流动面料', '柔软材质', '垂坠感面料']
        }
        
        # 运势增强规则
        self.fortune_enhancement_rules = {
            'wealth': {
                'primary_elements': ['metal', 'earth'],
                'boost_colors': ['金色', '黄色', '深红色'],
                'boost_materials': ['丝绸', '金属装饰'],
                'max_boost': 15
            },
            'career': {
                'primary_elements': ['fire', 'wood'],
                'boost_colors': ['红色', '橙色', '深蓝色'],
                'boost_materials': ['正装面料', '笔挺材质'],
                'max_boost': 12
            },
            'love': {
                'primary_elements': ['water', 'wood'],
                'boost_colors': ['粉色', '淡蓝色', '白色'],
                'boost_materials': ['柔软面料', '飘逸材质'],
                'max_boost': 18
            },
            'health': {
                'primary_elements': ['wood', 'earth'],
                'boost_colors': ['绿色', '自然色'],
                'boost_materials': ['天然纤维', '透气材质'],
                'max_boost': 10
            }
        }
    
    def calculate_fortune_boost(
        self, 
        outfit_colors: List[str], 
        outfit_materials: List[str], 
        base_fortune: Dict[str, Any],
        bazi_analysis: Dict[str, Any]
    ) -> FortuneBoost:
        """计算穿衣对运势的加持效果"""
        
        boost = FortuneBoost()
        
        # 获取用户五行喜忌
        favorable_elements = bazi_analysis.get('favorable_elements', [])
        avoid_elements = bazi_analysis.get('avoid_elements', [])
        
        for fortune_type, rules in self.fortune_enhancement_rules.items():
            base_score = base_fortune.get(f'{fortune_type}_fortune', {}).get('score', 80)
            
            # 计算颜色加持
            color_boost = self._calculate_color_boost(
                outfit_colors, 
                rules['boost_colors'], 
                favorable_elements,
                avoid_elements
            )
            
            # 计算材质加持
            material_boost = self._calculate_material_boost(
                outfit_materials, 
                rules['boost_materials']
            )
            
            # 计算五行匹配度
            element_boost = self._calculate_element_boost(
                rules['primary_elements'],
                favorable_elements,
                avoid_elements
            )
            
            # 综合计算
            total_boost = min(
                int(color_boost + material_boost + element_boost),
                rules['max_boost']
            )
            
            setattr(boost, fortune_type, total_boost)
        
        return boost
    
    def _calculate_color_boost(
        self, 
        outfit_colors: List[str], 
        boost_colors: List[str],
        favorable_elements: List[str],
        avoid_elements: List[str]
    ) -> float:
        """计算颜色加持效果"""
        boost = 0.0
        
        for color in outfit_colors:
            if color in boost_colors:
                boost += 3.0
            
            # 检查颜色对应的五行
            for element, color_data in self.element_color_map.items():
                if color in color_data['primary']:
                    if element in favorable_elements:
                        boost += 2.0
                    elif element in avoid_elements:
                        boost -= 3.0
        
        return boost
    
    def _calculate_material_boost(
        self, 
        outfit_materials: List[str], 
        boost_materials: List[str]
    ) -> float:
        """计算材质加持效果"""
        boost = 0.0
        
        for material in outfit_materials:
            if material in boost_materials:
                boost += 2.0
        
        return boost
    
    def _calculate_element_boost(
        self,
        primary_elements: List[str],
        favorable_elements: List[str],
        avoid_elements: List[str]
    ) -> float:
        """计算五行匹配加持"""
        boost = 0.0
        
        for element in primary_elements:
            if element in favorable_elements:
                boost += 4.0
            elif element in avoid_elements:
                boost -= 4.0
        
        return boost


class OutfitGenerator:
    """穿衣方案生成器"""
    
    def __init__(self):
        self.five_elements_matcher = FiveElementsMatcher()
        
        # 预定义穿衣套装模板
        self.outfit_templates = {
            'wealth_boost': {
                'theme': '财运加持套装',
                'primary_colors': ['金色', '深红色'],
                'secondary_colors': ['黑色'],
                'materials': ['丝绸', '羊毛', '金属装饰'],
                'accessories': ['金质手表', '红色围巾', '玉石饰品'],
                'style': '商务精英',
                'target_fortune': 'wealth'
            },
            'career_power': {
                'theme': '事业运势套装',
                'primary_colors': ['深蓝色', '红色'],
                'secondary_colors': ['白色', '银色'],
                'materials': ['正装面料', '笔挺材质'],
                'accessories': ['领带', '胸针', '公文包'],
                'style': '权威专业',
                'target_fortune': 'career'
            },
            'love_harmony': {
                'theme': '桃花运旺套装',
                'primary_colors': ['粉色', '淡蓝色'],
                'secondary_colors': ['白色', '米色'],
                'materials': ['柔软面料', '飘逸材质', '蕾丝'],
                'accessories': ['花饰', '珍珠', '丝巾'],
                'style': '温柔优雅',
                'target_fortune': 'love'
            },
            'health_vitality': {
                'theme': '健康活力套装',
                'primary_colors': ['绿色', '自然色'],
                'secondary_colors': ['白色', '浅黄色'],
                'materials': ['天然纤维', '透气材质', '运动面料'],
                'accessories': ['运动配件', '天然石材'],
                'style': '自然活力',
                'target_fortune': 'health'
            }
        }
    
    def generate_recommendations(
        self,
        bazi_analysis: Dict[str, Any],
        daily_fortune: Dict[str, Any],
        preferences: UserPreferences,
        constraints: UserConstraints
    ) -> List[OutfitRecommendation]:
        """生成穿衣推荐"""
        
        recommendations = []
        
        # 确定运势优先级
        fortune_priorities = self._determine_fortune_priorities(daily_fortune)
        
        # 为每个高优先级运势生成推荐
        for rank, (fortune_type, score) in enumerate(fortune_priorities, 1):
            if score >= 75:  # 只为75分以上的运势生成推荐
                recommendation = self._generate_targeted_recommendation(
                    fortune_type,
                    rank,
                    bazi_analysis,
                    daily_fortune,
                    preferences,
                    constraints
                )
                
                if recommendation:
                    recommendations.append(recommendation)
        
        return recommendations
    
    def _determine_fortune_priorities(self, daily_fortune: Dict[str, Any]) -> List[Tuple[str, int]]:
        """确定运势优先级"""
        fortunes = []
        
        for fortune_type in ['wealth', 'career', 'love', 'health']:
            score = daily_fortune.get(f'{fortune_type}_fortune', {}).get('score', 0)
            fortunes.append((fortune_type, score))
        
        # 按分数排序，高分优先
        return sorted(fortunes, key=lambda x: x[1], reverse=True)
    
    def _generate_targeted_recommendation(
        self,
        fortune_type: str,
        rank: int,
        bazi_analysis: Dict[str, Any],
        daily_fortune: Dict[str, Any],
        preferences: UserPreferences,
        constraints: UserConstraints
    ) -> Optional[OutfitRecommendation]:
        """生成针对性推荐"""
        
        # 根据运势类型选择模板
        template_key = f'{fortune_type}_boost'
        if template_key not in self.outfit_templates:
            template_key = list(self.outfit_templates.keys())[0]
        
        template = self.outfit_templates[template_key]
        
        # 应用用户偏好和约束
        outfit_colors = self._apply_color_preferences(
            template['primary_colors'], 
            preferences, 
            constraints
        )
        
        outfit_materials = self._apply_material_preferences(
            template['materials'], 
            constraints
        )
        
        # 计算运势加持效果
        fortune_boost = self.five_elements_matcher.calculate_fortune_boost(
            outfit_colors,
            outfit_materials,
            daily_fortune,
            bazi_analysis
        )
        
        # 生成五行分析
        five_elements_analysis = self._generate_elements_analysis(
            bazi_analysis,
            outfit_colors
        )
        
        # 生成时间建议
        timing_advice = self._generate_timing_advice(
            fortune_type,
            daily_fortune
        )
        
        # 计算置信度
        confidence = self._calculate_confidence(
            fortune_boost,
            bazi_analysis,
            daily_fortune
        )
        
        return OutfitRecommendation(
            id=f'{fortune_type}_{rank}',
            rank=rank,
            confidence=confidence,
            theme=template['theme'],
            base_fortune_boost=fortune_boost,
            outfit_details=OutfitDetails(
                primary_colors=outfit_colors,
                secondary_colors=template['secondary_colors'],
                materials=outfit_materials,
                accessories=template['accessories'],
                style=template['style']
            ),
            five_elements_analysis=five_elements_analysis,
            timing_advice=timing_advice
        )
    
    def _apply_color_preferences(
        self, 
        base_colors: List[str], 
        preferences: UserPreferences, 
        constraints: UserConstraints
    ) -> List[str]:
        """应用颜色偏好"""
        filtered_colors = base_colors.copy()
        
        # 应用约束条件
        if constraints and constraints.avoid_colors:
            filtered_colors = [c for c in filtered_colors if c not in constraints.avoid_colors]
        
        # 应用偏好设置
        if preferences and preferences.color_preferences:
            for pref in preferences.color_preferences:
                if pref.startswith('avoid_'):
                    avoid_color = pref.replace('avoid_', '')
                    filtered_colors = [c for c in filtered_colors if avoid_color not in c.lower()]
        
        return filtered_colors if filtered_colors else base_colors
    
    def _apply_material_preferences(
        self, 
        base_materials: List[str], 
        constraints: UserConstraints
    ) -> List[str]:
        """应用材质偏好"""
        if constraints and constraints.avoid_materials:
            return [m for m in base_materials if m not in constraints.avoid_materials]
        
        return base_materials
    
    def _generate_elements_analysis(
        self, 
        bazi_analysis: Dict[str, Any], 
        outfit_colors: List[str]
    ) -> FiveElementsAnalysis:
        """生成五行分析"""
        day_master = bazi_analysis.get('day_master', '甲木')
        main_element = bazi_analysis.get('main_element', 'wood')
        
        # 简化版五行分析
        element_match = f"{main_element}为主，与穿衣色彩相辅相成"
        enhancement_theory = f"基于{day_master}的五行特性，选择的颜色能够增强个人气场"
        
        return FiveElementsAnalysis(
            element_match=element_match,
            enhancement_theory=enhancement_theory,
            warning="避免过度单一色系，保持五行平衡"
        )
    
    def _generate_timing_advice(
        self, 
        fortune_type: str, 
        daily_fortune: Dict[str, Any]
    ) -> TimingAdvice:
        """生成时间建议"""
        
        timing_map = {
            'wealth': {
                'best_time': '09:00-11:00',
                'activities': ['商务洽谈', '投资决策', '重要会议']
            },
            'career': {
                'best_time': '08:00-10:00',
                'activities': ['工作汇报', '项目推进', '团队协作']
            },
            'love': {
                'best_time': '14:00-16:00',
                'activities': ['约会聚餐', '情感沟通', '社交活动']
            },
            'health': {
                'best_time': '06:00-08:00',
                'activities': ['运动健身', '户外活动', '健康检查']
            }
        }
        
        timing_info = timing_map.get(fortune_type, timing_map['wealth'])
        
        return TimingAdvice(
            best_wear_time=timing_info['best_time'],
            optimal_activities=timing_info['activities'],
            avoid_activities=['重要决策', '冲突争执'] if fortune_type != 'career' else []
        )
    
    def _calculate_confidence(
        self, 
        fortune_boost: FortuneBoost, 
        bazi_analysis: Dict[str, Any], 
        daily_fortune: Dict[str, Any]
    ) -> float:
        """计算推荐置信度"""
        
        # 基础置信度
        base_confidence = 0.7
        
        # 根据运势加持效果调整
        max_boost = max([
            abs(fortune_boost.wealth),
            abs(fortune_boost.career),
            abs(fortune_boost.love),
            abs(fortune_boost.health)
        ])
        
        boost_factor = min(max_boost / 15.0, 0.3)  # 最多增加30%
        
        # 根据八字匹配度调整
        element_match_factor = 0.1  # 简化处理
        
        final_confidence = min(base_confidence + boost_factor + element_match_factor, 1.0)
        
        return round(final_confidence, 2)


class OutfitAIService:
    """AI智能穿衣推荐主服务"""
    
    def __init__(self):
        self.bazi_service = BaziService()
        self.fortune_service = BlindSchoolFortuneService()
        self.outfit_generator = OutfitGenerator()
    
    def generate_outfit_recommendations(
        self, 
        request: OutfitRecommendationRequest
    ) -> OutfitRecommendationResponse:
        """生成AI穿衣推荐"""
        
        try:
            # 1. 八字分析
            bazi_analysis = self._analyze_bazi(request.user_profile)
            
            # 2. 运势计算
            daily_fortune = self._calculate_daily_fortune(
                request.user_profile, 
                request.target_date or datetime.now().strftime('%Y-%m-%d')
            )
            
            # 3. 生成AI推荐
            recommendations = self.outfit_generator.generate_recommendations(
                bazi_analysis,
                daily_fortune,
                request.preferences or UserPreferences(),
                request.constraints or UserConstraints()
            )
            
            # 4. 构建响应
            response = self._build_response(
                bazi_analysis,
                daily_fortune,
                recommendations
            )
            
            return response
            
        except Exception as e:
            logger.error(f"生成穿衣推荐失败: {str(e)}")
            raise
    
    def _analyze_bazi(self, user_profile: UserProfile) -> Dict[str, Any]:
        """分析用户八字"""
        
        bazi_request = {
            'birthdate': user_profile.birthdate,
            'name': user_profile.name,
            'gender': user_profile.gender
        }
        
        bazi_result = self.bazi_service.calculate_bazi(bazi_request)
        
        return {
            'day_master': bazi_result.get('day_master', '甲木'),
            'main_element': bazi_result.get('main_element', 'wood'),
            'favorable_elements': bazi_result.get('favorable_elements', ['water', 'wood']),
            'avoid_elements': bazi_result.get('avoid_elements', ['metal']),
            'bazi_chart': bazi_result.get('bazi_chart', {}),
            'analysis': bazi_result.get('analysis', {})
        }
    
    def _calculate_daily_fortune(
        self, 
        user_profile: UserProfile, 
        target_date: str
    ) -> Dict[str, Any]:
        """计算今日运势"""
        
        fortune_request = BlindSchoolFortuneRequest(
            birthdate=user_profile.birthdate,
            name=user_profile.name,
            gender=user_profile.gender,
            target_date=target_date
        )
        
        fortune_result = self.fortune_service.calculate_blind_school_fortune(fortune_request)
        
        return {
            'overall_score': fortune_result.overall_score,
            'overall_level': fortune_result.overall_level,
            'wealth_fortune': fortune_result.wealth_fortune,
            'career_fortune': fortune_result.career_fortune,
            'love_fortune': fortune_result.relationship_fortune,
            'health_fortune': fortune_result.health_fortune
        }
    
    def _build_response(
        self,
        bazi_analysis: Dict[str, Any],
        daily_fortune: Dict[str, Any],
        recommendations: List[OutfitRecommendation]
    ) -> OutfitRecommendationResponse:
        """构建响应数据"""
        
        # 生成推荐理由
        top_fortune = max([
            ('财运', daily_fortune.get('wealth_fortune', {}).get('score', 0)),
            ('事业', daily_fortune.get('career_fortune', {}).get('score', 0)),
            ('情感', daily_fortune.get('love_fortune', {}).get('score', 0)),
            ('健康', daily_fortune.get('health_fortune', {}).get('score', 0))
        ], key=lambda x: x[1])
        
        recommendation_reason = f"今日{top_fortune[0]}运势突出({top_fortune[1]}分)，AI智能推荐相应的穿衣方案以强化运势表现"
        
        ai_analysis = AIAnalysis(
            bazi_summary={
                'day_master': bazi_analysis.get('day_master'),
                'main_element': bazi_analysis.get('main_element'),
                'weak_element': 'metal',  # 简化处理
                'strong_element': 'water'
            },
            daily_fortune={
                'overall_score': daily_fortune.get('overall_score'),
                'wealth_fortune': daily_fortune.get('wealth_fortune', {}).get('score'),
                'career_fortune': daily_fortune.get('career_fortune', {}).get('score'),
                'love_fortune': daily_fortune.get('love_fortune', {}).get('score'),
                'health_fortune': daily_fortune.get('health_fortune', {}).get('score')
            },
            recommendation_reason=recommendation_reason
        )
        
        meta = {
            'calculation_time': datetime.now().isoformat(),
            'ai_model_version': 'outfit-ai-v1.0',
            'cache_expires': f"{datetime.now().date()}T23:59:59Z"
        }
        
        return OutfitRecommendationResponse(
            ai_analysis=ai_analysis,
            recommendations=recommendations,
            meta=meta
        )
    
    def _generate_cache_key(self, request: OutfitRecommendationRequest) -> str:
        """生成缓存键"""
        key_data = {
            'birthdate': request.user_profile.birthdate,
            'target_date': request.target_date,
            'preferences': asdict(request.preferences) if request.preferences else {},
            'constraints': asdict(request.constraints) if request.constraints else {}
        }
        
        key_string = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_string.encode()).hexdigest() 