"""
60甲子太岁大将数据库
包含完整的60位太岁大将信息，用于八字神仙匹配系统
"""

from typing import Dict, List, Any
from dataclasses import dataclass
from enum import Enum


class WuxingElement(Enum):
    """五行元素"""
    WOOD = "wood"
    FIRE = "fire"
    EARTH = "earth"
    METAL = "metal"
    WATER = "water"


@dataclass
class TaisuiGeneral:
    """太岁大将信息"""
    id: str
    name: str
    title: str
    year_stem: str
    year_branch: str
    jiazi_position: int  # 甲子序号 (0-59)
    element: WuxingElement
    personality: List[str]
    specialties: List[str]
    blessings: List[str]
    protection_areas: List[str]
    avatar_emoji: str
    color: str
    mantra: str
    historical_background: str
    compatibility_factors: Dict[str, float]


class TaisuiDatabase:
    """太岁大将数据库"""
    
    def __init__(self):
        self.generals = self._load_taisui_generals()
    
    def _load_taisui_generals(self) -> List[TaisuiGeneral]:
        """加载60甲子太岁大将数据"""
        
        # 天干地支
        heavenly_stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
        earthly_branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
        
        # 天干五行
        stem_elements = {
            '甲': WuxingElement.WOOD, '乙': WuxingElement.WOOD,
            '丙': WuxingElement.FIRE, '丁': WuxingElement.FIRE,
            '戊': WuxingElement.EARTH, '己': WuxingElement.EARTH,
            '庚': WuxingElement.METAL, '辛': WuxingElement.METAL,
            '壬': WuxingElement.WATER, '癸': WuxingElement.WATER
        }
        
        # 60甲子太岁大将名录（传统道教记载）
        taisui_names = [
            # 甲子到癸亥的60位太岁大将
            "金赤大将军", "陈材大将军", "耿章大将军", "沈兴大将军", "赵达大将军", "郭灿大将军",
            "王清大将军", "李素大将军", "刘旺大将军", "康志大将军", "施广大将军", "任保大将军",
            "郭嘉大将军", "汪文大将军", "鲁先大将军", "方章大将军", "蒋崇大将军", "向般大将军",
            "白敏大将军", "高丙大将军", "邬桓大将军", "范宁大将军", "隋文大将军", "郑但大将军",
            "李诚大将军", "刘洪大将军", "张朝大将军", "方清大将军", "辛亚大将军", "易彦大将军",
            "章词大将军", "杨信大将军", "贺谔大将军", "叶坚大将军", "邱德大将军", "叶卦大将军",
            "程寅大将军", "缪丙大将军", "徐舜大将军", "张词大将军", "杨彦大将军", "李移大将军",
            "姚黎大将军", "傅佑大将军", "毛梓大将军", "文哲大将军", "缪卯大将军", "丁卯大将军",
            "封济大将军", "郢班大将军", "潘盖大将军", "郑祖大将军", "路秘大将军", "魏仁大将军",
            "方杰大将军", "蒋锐大将军", "谢燮大将军", "卢秘大将军", "张嘉大将军", "杨彦大将军"
        ]
        
        # 太岁大将职能特色
        specialties_pool = [
            "消灾解厄", "招财进宝", "保佑平安", "增进智慧", "化解小人", "促进事业",
            "守护健康", "和谐人际", "学业有成", "婚姻美满", "子嗣兴旺", "长寿延年",
            "辟邪护身", "旅途平安", "官运亨通", "文昌加持", "武运昌隆", "商贾兴隆"
        ]
        
        # 性格特征池
        personality_pool = [
            "威严", "慈祥", "智慧", "勇敢", "仁慈", "正直", "严谨", "温和",
            "果断", "包容", "坚韧", "敏锐", "稳重", "活力", "深沉", "开朗"
        ]
        
        # 祝福内容池
        blessings_pool = [
            "身体健康，万事如意", "事业兴旺，财源广进", "家庭和睦，子孙满堂",
            "学业进步，智慧增长", "出入平安，贵人相助", "心想事成，福寿绵长",
            "化险为夷，逢凶化吉", "官运亨通，名利双收", "婚姻美满，白头偕老",
            "子女孝顺，传承有序", "健康长寿，福如东海", "生意兴隆，客似云来"
        ]
        
        # 保护领域池
        protection_areas_pool = [
            "事业发展", "财富积累", "健康养生", "家庭关系", "学业教育", "感情婚姻",
            "子女成长", "长辈安康", "出行安全", "投资理财", "人际交往", "官场仕途"
        ]
        
        generals = []
        
        for i in range(60):
            stem = heavenly_stems[i % 10]
            branch = earthly_branches[i % 12]
            element = stem_elements[stem]
            name = taisui_names[i]
            
            # 根据五行和位置生成个性化属性
            specialties = self._generate_specialties(element, i, specialties_pool)
            personality = self._generate_personality(element, personality_pool)
            blessings = self._generate_blessings(element, blessings_pool)
            protection_areas = self._generate_protection_areas(element, protection_areas_pool)
            
            # 生成兼容性因子
            compatibility_factors = self._generate_compatibility_factors(element, stem, branch)
            
            # 生成颜色和emoji
            color, emoji = self._get_element_style(element)
            
            general = TaisuiGeneral(
                id=f"taisui_{stem}{branch}",
                name=name,
                title=f"{stem}{branch}年太岁",
                year_stem=stem,
                year_branch=branch,
                jiazi_position=i,
                element=element,
                personality=personality,
                specialties=specialties,
                blessings=blessings,
                protection_areas=protection_areas,
                avatar_emoji=emoji,
                color=color,
                mantra=f"南无{stem}{branch}年太岁{name}",
                historical_background=f"{name}为{stem}{branch}年太岁大将军，专司{stem}{branch}年出生之人的命运守护，具有{element.value}之德性，善于{specialties[0]}。",
                compatibility_factors=compatibility_factors
            )
            
            generals.append(general)
        
        return generals
    
    def _generate_specialties(self, element: WuxingElement, position: int, pool: List[str]) -> List[str]:
        """根据五行和位置生成专长"""
        specialties = []
        
        # 基于五行的基础专长
        if element == WuxingElement.WOOD:
            specialties.extend(["学业有成", "事业发展", "健康养生"])
        elif element == WuxingElement.FIRE:
            specialties.extend(["增进智慧", "官运亨通", "文昌加持"])
        elif element == WuxingElement.EARTH:
            specialties.extend(["招财进宝", "保佑平安", "家庭和睦"])
        elif element == WuxingElement.METAL:
            specialties.extend(["化解小人", "武运昌隆", "辟邪护身"])
        elif element == WuxingElement.WATER:
            specialties.extend(["增进智慧", "婚姻美满", "长寿延年"])
        
        # 根据位置添加特殊专长
        if position % 12 < 3:  # 子丑寅月份
            specialties.append("消灾解厄")
        elif position % 12 < 6:  # 卯辰巳月份
            specialties.append("促进事业")
        elif position % 12 < 9:  # 午未申月份
            specialties.append("和谐人际")
        else:  # 酉戌亥月份
            specialties.append("旅途平安")
        
        return specialties[:4]  # 返回前4个专长
    
    def _generate_personality(self, element: WuxingElement, pool: List[str]) -> List[str]:
        """根据五行生成性格特征"""
        personality = []
        
        if element == WuxingElement.WOOD:
            personality = ["仁慈", "正直", "温和", "活力"]
        elif element == WuxingElement.FIRE:
            personality = ["威严", "智慧", "开朗", "果断"]
        elif element == WuxingElement.EARTH:
            personality = ["慈祥", "稳重", "包容", "坚韧"]
        elif element == WuxingElement.METAL:
            personality = ["严谨", "勇敢", "正直", "敏锐"]
        elif element == WuxingElement.WATER:
            personality = ["智慧", "深沉", "温和", "包容"]
        
        return personality
    
    def _generate_blessings(self, element: WuxingElement, pool: List[str]) -> List[str]:
        """根据五行生成祝福内容"""
        blessings = []
        
        # 通用祝福
        blessings.append("身体健康，万事如意")
        
        # 基于五行的特色祝福
        if element == WuxingElement.WOOD:
            blessings.extend(["学业进步，智慧增长", "事业兴旺，财源广进"])
        elif element == WuxingElement.FIRE:
            blessings.extend(["官运亨通，名利双收", "心想事成，福寿绵长"])
        elif element == WuxingElement.EARTH:
            blessings.extend(["家庭和睦，子孙满堂", "生意兴隆，客似云来"])
        elif element == WuxingElement.METAL:
            blessings.extend(["化险为夷，逢凶化吉", "出入平安，贵人相助"])
        elif element == WuxingElement.WATER:
            blessings.extend(["婚姻美满，白头偕老", "健康长寿，福如东海"])
        
        return blessings[:4]
    
    def _generate_protection_areas(self, element: WuxingElement, pool: List[str]) -> List[str]:
        """根据五行生成保护领域"""
        areas = []
        
        if element == WuxingElement.WOOD:
            areas = ["学业教育", "事业发展", "健康养生", "子女成长"]
        elif element == WuxingElement.FIRE:
            areas = ["官场仕途", "人际交往", "智慧开发", "名声声望"]
        elif element == WuxingElement.EARTH:
            areas = ["财富积累", "家庭关系", "房产置业", "稳定发展"]
        elif element == WuxingElement.METAL:
            areas = ["投资理财", "法律纠纷", "安全保护", "决断执行"]
        elif element == WuxingElement.WATER:
            areas = ["感情婚姻", "智慧学习", "流动变化", "长辈安康"]
        
        return areas
    
    def _generate_compatibility_factors(self, element: WuxingElement, stem: str, branch: str) -> Dict[str, float]:
        """生成兼容性因子"""
        factors = {}
        
        # 五行亲和度
        factors[f"{element.value}_affinity"] = 0.9
        
        # 相生关系亲和度
        if element == WuxingElement.WOOD:
            factors["fire_affinity"] = 0.8  # 木生火
            factors["water_affinity"] = 0.7  # 水生木
        elif element == WuxingElement.FIRE:
            factors["earth_affinity"] = 0.8  # 火生土
            factors["wood_affinity"] = 0.7   # 木生火
        elif element == WuxingElement.EARTH:
            factors["metal_affinity"] = 0.8  # 土生金
            factors["fire_affinity"] = 0.7   # 火生土
        elif element == WuxingElement.METAL:
            factors["water_affinity"] = 0.8  # 金生水
            factors["earth_affinity"] = 0.7  # 土生金
        elif element == WuxingElement.WATER:
            factors["wood_affinity"] = 0.8   # 水生木
            factors["metal_affinity"] = 0.7  # 金生水
        
        # 特殊能力亲和度
        factors["protection_power"] = 0.85
        factors["blessing_strength"] = 0.9
        factors["wisdom_guidance"] = 0.8
        
        return factors
    
    def _get_element_style(self, element: WuxingElement) -> tuple:
        """获取五行对应的颜色和emoji"""
        styles = {
            WuxingElement.WOOD: ("#32CD32", "🌲"),
            WuxingElement.FIRE: ("#FF4500", "🔥"),
            WuxingElement.EARTH: ("#DEB887", "⛰️"),
            WuxingElement.METAL: ("#C0C0C0", "⚔️"),
            WuxingElement.WATER: ("#4169E1", "🌊")
        }
        return styles[element]
    
    def get_general_by_year(self, year: int) -> TaisuiGeneral:
        """根据年份获取对应的太岁大将"""
        jiazi_position = (year - 4) % 60  # 以甲子年为起点
        return self.generals[jiazi_position]
    
    def get_general_by_jiazi(self, stem: str, branch: str) -> TaisuiGeneral:
        """根据干支获取太岁大将"""
        for general in self.generals:
            if general.year_stem == stem and general.year_branch == branch:
                return general
        raise ValueError(f"未找到{stem}{branch}年太岁大将")
    
    def get_generals_by_element(self, element: WuxingElement) -> List[TaisuiGeneral]:
        """根据五行获取太岁大将列表"""
        return [g for g in self.generals if g.element == element]
    
    def get_all_generals(self) -> List[TaisuiGeneral]:
        """获取所有太岁大将"""
        return self.generals.copy()
    
    def search_generals(self, keyword: str) -> List[TaisuiGeneral]:
        """搜索太岁大将"""
        results = []
        keyword = keyword.lower()
        
        for general in self.generals:
            if (keyword in general.name.lower() or 
                keyword in general.title.lower() or
                any(keyword in spec.lower() for spec in general.specialties) or
                any(keyword in trait.lower() for trait in general.personality)):
                results.append(general)
        
        return results


# 全局太岁数据库实例
taisui_database = TaisuiDatabase()