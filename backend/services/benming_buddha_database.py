"""
本命佛数据库
基于12生肖配置的本命佛系统，为用户提供专属的佛教守护神匹配
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


class Zodiac(Enum):
    """十二生肖"""
    RAT = "鼠"
    OX = "牛"
    TIGER = "虎"
    RABBIT = "兔"
    DRAGON = "龙"
    SNAKE = "蛇"
    HORSE = "马"
    GOAT = "羊"
    MONKEY = "猴"
    ROOSTER = "鸡"
    DOG = "狗"
    PIG = "猪"


@dataclass
class BenmingBuddha:
    """本命佛信息"""
    id: str
    name: str
    sanskrit_name: str
    title: str
    zodiac: List[Zodiac]  # 对应的生肖
    element: WuxingElement
    personality: List[str]
    specialties: List[str]
    blessings: List[str]
    protection_areas: List[str]
    avatar_emoji: str
    color: str
    mantra: str
    full_mantra: str  # 完整咒语
    description: str
    historical_background: str
    temple_location: str
    festival_date: str
    sacred_items: List[str]  # 圣物
    meditation_guidance: List[str]  # 禅修指导
    compatibility_factors: Dict[str, float]


class BenmingBuddhaDatabase:
    """本命佛数据库"""
    
    def __init__(self):
        self.buddhas = self._load_benming_buddhas()
    
    def _load_benming_buddhas(self) -> List[BenmingBuddha]:
        """加载本命佛数据"""
        
        buddhas = [
            # 千手观音菩萨 - 鼠年生人
            BenmingBuddha(
                id="qianshou_guanyin",
                name="千手观音菩萨",
                sanskrit_name="Avalokiteśvara Sahasrabhuja",
                title="大慈大悲千手千眼观世音菩萨",
                zodiac=[Zodiac.RAT],
                element=WuxingElement.WATER,
                personality=["慈悲", "智慧", "包容", "灵活"],
                specialties=["化解困厄", "增长智慧", "护佑平安", "消灾解难"],
                blessings=[
                    "千手护佑，万事如意",
                    "智慧如海，福慧双增",
                    "慈悲加持，平安喜乐",
                    "观音护佑，心想事成"
                ],
                protection_areas=["事业发展", "智慧开启", "人际关系", "身心健康"],
                avatar_emoji="🙏",
                color="#87CEEB",
                mantra="嗡嘛呢叭咪吽",
                full_mantra="南无大慈大悲救苦救难广大灵感观世音菩萨",
                description="千手观音菩萨是观音菩萨的化身之一，以慈悲和智慧著称，能够满足众生的各种愿望。",
                historical_background="千手观音菩萨是佛教中最受尊崇的菩萨之一，传说有千手千眼，能够观察世间一切苦难，并以千手救度众生。",
                temple_location="普陀山观音寺",
                festival_date="农历二月十九（观音诞辰）",
                sacred_items=["净水瓶", "杨柳枝", "念珠", "莲花"],
                meditation_guidance=[
                    "每日晨起面向东方念诵观音心咒108遍",
                    "观想观音菩萨慈悲光明照耀全身",
                    "在遇到困难时默念观音圣号",
                    "每月十九日进行慈悲禅修"
                ],
                compatibility_factors={
                    "water_affinity": 0.95,
                    "wisdom_enhancement": 0.9,
                    "compassion_development": 0.95,
                    "obstacle_removal": 0.9
                }
            ),
            
            # 虚空藏菩萨 - 牛虎年生人
            BenmingBuddha(
                id="xukong_zang",
                name="虚空藏菩萨",
                sanskrit_name="Ākāśagarbha",
                title="虚空藏菩萨摩诃萨",
                zodiac=[Zodiac.OX, Zodiac.TIGER],
                element=WuxingElement.EARTH,
                personality=["智慧", "坚韧", "包容", "慈悲"],
                specialties=["增长智慧", "消除业障", "增强记忆", "学业有成"],
                blessings=[
                    "智慧如虚空，学业有成就",
                    "记忆力增强，考试顺利",
                    "业障消除，福慧增长",
                    "虚空藏护佑，前程似锦"
                ],
                protection_areas=["学业教育", "智慧开发", "记忆增强", "业障消除"],
                avatar_emoji="📿",
                color="#DEB887",
                mantra="嗡啊喇巴扎那谛",
                full_mantra="南无虚空藏菩萨摩诃萨",
                description="虚空藏菩萨以智慧著称，能够增强学业运势，提升记忆力和理解力。",
                historical_background="虚空藏菩萨是八大菩萨之一，因其智慧广大如虚空而得名，专门护佑学子和求知者。",
                temple_location="峨眉山华藏寺",
                festival_date="农历八月二十三（虚空藏菩萨圣诞）",
                sacred_items=["如意宝珠", "智慧剑", "经书", "宝塔"],
                meditation_guidance=[
                    "每日早晚念诵虚空藏菩萨心咒",
                    "学习前祈请虚空藏菩萨加持智慧",
                    "观想虚空藏菩萨手持如意宝珠放光",
                    "定期抄写经书回向给虚空藏菩萨"
                ],
                compatibility_factors={
                    "wisdom_enhancement": 0.95,
                    "memory_improvement": 0.9,
                    "academic_success": 0.95,
                    "karmic_purification": 0.85
                }
            ),
            
            # 文殊菩萨 - 兔年生人  
            BenmingBuddha(
                id="wenshu_pusa",
                name="文殊菩萨",
                sanskrit_name="Mañjuśrī",
                title="大智文殊师利菩萨",
                zodiac=[Zodiac.RABBIT],
                element=WuxingElement.WOOD,
                personality=["智慧", "理性", "博学", "慈悲"],
                specialties=["开启智慧", "学业进步", "文艺创作", "消除愚痴"],
                blessings=[
                    "文殊智慧剑，斩断无明暗",
                    "智慧如日月，照亮人生路",
                    "学业有成就，考试得佳绩",
                    "文思如泉涌，创作有灵感"
                ],
                protection_areas=["智慧开发", "学业成就", "文艺创作", "理性思维"],
                avatar_emoji="⚔️",
                color="#32CD32",
                mantra="嗡阿啰巴札那谛",
                full_mantra="南无大智文殊师利菩萨",
                description="文殊菩萨是智慧的化身，能够开启智慧，帮助学业进步和文艺创作。",
                historical_background="文殊菩萨是佛教四大菩萨之一，以智慧第一著称，手持智慧剑能斩断一切烦恼。",
                temple_location="五台山文殊寺",
                festival_date="农历四月初四（文殊菩萨圣诞）",
                sacred_items=["智慧剑", "青莲花", "经书", "狮子"],
                meditation_guidance=[
                    "每日念诵文殊菩萨心咒开启智慧",
                    "学习前观想文殊菩萨加持",
                    "阅读经书时祈请文殊菩萨指导",
                    "创作时观想智慧剑斩断思维障碍"
                ],
                compatibility_factors={
                    "wisdom_enhancement": 0.98,
                    "academic_achievement": 0.95,
                    "creative_inspiration": 0.9,
                    "rational_thinking": 0.92
                }
            ),
            
            # 普贤菩萨 - 龙蛇年生人
            BenmingBuddha(
                id="puxian_pusa",
                name="普贤菩萨",
                sanskrit_name="Samantabhadra",
                title="大行普贤菩萨",
                zodiac=[Zodiac.DRAGON, Zodiac.SNAKE],
                element=WuxingElement.FIRE,
                personality=["实干", "坚韧", "慈悲", "包容"],
                specialties=["增强行动力", "成就事业", "修行精进", "愿力加持"],
                blessings=[
                    "普贤行愿力，成就诸善业",
                    "六牙白象载，事业步步高",
                    "十大愿王力，福慧皆圆满",
                    "普贤加持下，修行得精进"
                ],
                protection_areas=["事业成就", "行动执行", "修行精进", "愿望成就"],
                avatar_emoji="🐘",
                color="#FF6B6B",
                mantra="嗡梭哈",
                full_mantra="南无大行普贤菩萨",
                description="普贤菩萨以大行愿著称，能够增强行动力，帮助事业成就和修行精进。",
                historical_background="普贤菩萨是佛教四大菩萨之一，以十大愿王闻名，代表实践和行动的力量。",
                temple_location="峨眉山普贤寺",
                festival_date="农历二月二十一（普贤菩萨圣诞）",
                sacred_items=["六牙白象", "如意", "莲花", "经书"],
                meditation_guidance=[
                    "每日发愿效学普贤十大愿王",
                    "行动前祈请普贤菩萨加持",
                    "观想骑乘六牙白象的普贤菩萨",
                    "定期行善积德回向普贤菩萨"
                ],
                compatibility_factors={
                    "action_enhancement": 0.95,
                    "career_success": 0.92,
                    "spiritual_progress": 0.9,
                    "wish_fulfillment": 0.88
                }
            ),
            
            # 阿弥陀佛 - 马年生人
            BenmingBuddha(
                id="amitabha_fo", 
                name="阿弥陀佛",
                sanskrit_name="Amitābha",
                title="南无阿弥陀佛",
                zodiac=[Zodiac.HORSE],
                element=WuxingElement.FIRE,
                personality=["光明", "慈悲", "包容", "清净"],
                specialties=["净化心灵", "消除业障", "延寿增福", "往生净土"],
                blessings=[
                    "阿弥陀佛光，照破诸黑暗",
                    "无量寿无量光，福寿皆绵长",
                    "净土莲花开，心灵得清净",
                    "弥陀慈悲力，业障尽消除"
                ],
                protection_areas=["心灵净化", "业障消除", "寿命延长", "精神安康"],
                avatar_emoji="🪔",
                color="#FFD700",
                mantra="南无阿弥陀佛",
                full_mantra="南无阿弥陀佛",
                description="阿弥陀佛是西方极乐世界的教主，以无量光明和无量寿命著称。",
                historical_background="阿弥陀佛是净土宗的主要崇拜对象，发四十八大愿建立极乐净土，接引众生。",
                temple_location="净土宗各大寺院",
                festival_date="农历十一月十七（阿弥陀佛圣诞）",
                sacred_items=["莲花台", "净水瓶", "念珠", "光明灯"],
                meditation_guidance=[
                    "每日念诵南无阿弥陀佛圣号",
                    "观想西方极乐净土的庄严",
                    "临睡前念佛回向求生净土",
                    "定期放生念佛积累净土资粮"
                ],
                compatibility_factors={
                    "spiritual_purification": 0.95,
                    "karmic_cleansing": 0.9,
                    "longevity_blessing": 0.92,
                    "mental_peace": 0.88
                }
            ),
            
            # 大势至菩萨 - 羊年生人
            BenmingBuddha(
                id="dashizhi_pusa",
                name="大势至菩萨",
                sanskrit_name="Mahāsthāmaprāpta",
                title="大势至菩萨摩诃萨",
                zodiac=[Zodiac.GOAT],
                element=WuxingElement.EARTH,
                personality=["智慧", "力量", "慈悲", "精进"],
                specialties=["增强智慧", "提升力量", "念佛三昧", "破除邪见"],
                blessings=[
                    "大势至威神力，智慧光普照",
                    "念佛三昧力，心得大自在",
                    "菩萨加持下，邪见自消除",
                    "势至菩萨护，修行得精进"
                ],
                protection_areas=["智慧增长", "力量提升", "念佛修行", "正见建立"],
                avatar_emoji="👑",
                color="#DEB887",
                mantra="嗡么抳叭咪吽",
                full_mantra="南无大势至菩萨摩诃萨",
                description="大势至菩萨以智慧光普照三千大千世界，与观音菩萨一起辅佐阿弥陀佛。",
                historical_background="大势至菩萨是西方三圣之一，以智慧光照耀一切，令众生离三途苦，得无上力。",
                temple_location="净土宗寺院",
                festival_date="农历七月十三（大势至菩萨圣诞）",
                sacred_items=["宝瓶", "莲花", "念珠", "智慧光"],
                meditation_guidance=[
                    "每日念诵大势至菩萨心咒",
                    "修持念佛三昧法门",
                    "观想菩萨智慧光照耀自身",
                    "定期阅读《大势至菩萨念佛圆通章》"
                ],
                compatibility_factors={
                    "wisdom_amplification": 0.92,
                    "inner_strength": 0.9,
                    "meditation_focus": 0.88,
                    "right_view": 0.85
                }
            ),
            
            # 不动明王 - 猴年生人
            BenmingBuddha(
                id="budong_mingwang",
                name="不动明王",
                sanskrit_name="Acala",
                title="不动尊明王",
                zodiac=[Zodiac.MONKEY],
                element=WuxingElement.METAL,
                personality=["坚定", "勇猛", "正义", "威严"],
                specialties=["破除障碍", "降伏魔障", "坚定意志", "护法驱邪"],
                blessings=[
                    "不动明王火，烧尽诸烦恼",
                    "智慧剑锋利，斩断业习气",
                    "明王威神力，魔障自消除",
                    "不动如山岳，意志更坚定"
                ],
                protection_areas=["意志坚定", "障碍清除", "护法除魔", "正义维护"],
                avatar_emoji="🔥",
                color="#DC143C",
                mantra="南么三曼多伐折啰赧憾",
                full_mantra="南无不动尊明王",
                description="不动明王是大日如来的教令轮身，以降伏一切魔障和烦恼著称。",
                historical_background="不动明王是密教五大明王之首，形象威猛，能够降伏一切恶魔邪障，护持正法。",
                temple_location="密教寺院",
                festival_date="农历六月二十八（不动明王护摩法会）",
                sacred_items=["智慧剑", "羂索", "护摩火", "金刚杵"],
                meditation_guidance=[
                    "每日念诵不动明王真言",
                    "观想明王威猛相降伏内心魔障", 
                    "遇到困难时祈请明王加持",
                    "定期参加护摩火供法会"
                ],
                compatibility_factors={
                    "obstacle_removal": 0.95,
                    "willpower_strengthening": 0.92,
                    "protection_power": 0.9,
                    "demon_subjugation": 0.88
                }
            ),
            
            # 阿弥陀佛 - 鸡年生人
            BenmingBuddha(
                id="amitabha_fo_rooster",
                name="阿弥陀佛",
                sanskrit_name="Amitābha", 
                title="南无阿弥陀佛",
                zodiac=[Zodiac.ROOSTER],
                element=WuxingElement.METAL,
                personality=["光明", "慈悲", "清净", "智慧"],
                specialties=["净化心灵", "消除业障", "智慧开启", "往生净土"],
                blessings=[
                    "弥陀光明照，心境得清净",
                    "无量寿佛力，福慧皆增长",
                    "净土莲花开，业障尽消除",
                    "阿弥陀佛护，智慧自开显"
                ],
                protection_areas=["心灵净化", "智慧开启", "业障消除", "精神安宁"],
                avatar_emoji="🌅",
                color="#FFD700",
                mantra="南无阿弥陀佛",
                full_mantra="南无阿弥陀佛",
                description="阿弥陀佛以无量光明普照十方，为鸡年生人带来智慧和清净。",
                historical_background="阿弥陀佛的光明能够照破黑暗，为属鸡之人带来智慧的启发和心灵的净化。",
                temple_location="净土宗各大寺院",
                festival_date="农历十一月十七（阿弥陀佛圣诞）",
                sacred_items=["光明灯", "净水瓶", "莲花", "念珠"],
                meditation_guidance=[
                    "每日清晨念诵阿弥陀佛圣号",
                    "观想佛陀光明照耀内心",
                    "定期参加净土念佛法会",
                    "临睡前念佛回向净土"
                ],
                compatibility_factors={
                    "mental_clarity": 0.95,
                    "wisdom_enhancement": 0.9,
                    "karmic_purification": 0.92,
                    "spiritual_elevation": 0.88
                }
            ),
            
            # 阿弥陀佛 - 狗年生人
            BenmingBuddha(
                id="amitabha_fo_dog",
                name="阿弥陀佛",
                sanskrit_name="Amitābha",
                title="南无阿弥陀佛",
                zodiac=[Zodiac.DOG],
                element=WuxingElement.EARTH,
                personality=["忠诚", "慈悲", "守护", "光明"],
                specialties=["忠诚守护", "慈悲加持", "光明照耀", "净土接引"],
                blessings=[
                    "弥陀慈悲心，如犬忠诚护",
                    "无量光照耀，忠义得圆满",
                    "净土接引力，守护诸众生",
                    "阿弥陀佛慈，忠犬得解脱"
                ],
                protection_areas=["忠诚品格", "守护他人", "慈悲心培养", "光明智慧"],
                avatar_emoji="🏮",
                color="#DEB887",
                mantra="南无阿弥陀佛",
                full_mantra="南无阿弥陀佛",
                description="阿弥陀佛的慈悲与狗年生人的忠诚相应，带来守护和光明的力量。",
                historical_background="阿弥陀佛的慈悲光明与属狗人的忠诚守护天性完美结合，带来内心的安宁与外在的护佑。",
                temple_location="净土宗各大寺院",
                festival_date="农历十一月十七（阿弥陀佛圣诞）",
                sacred_items=["护身符", "念珠", "光明灯", "经书"],
                meditation_guidance=[
                    "每日念佛培养慈悲心",
                    "观想佛陀光明护佑他人",
                    "以忠诚心念诵佛号",
                    "定期为众生念佛回向"
                ],
                compatibility_factors={
                    "loyalty_enhancement": 0.95,
                    "protective_instinct": 0.9,
                    "compassion_development": 0.92,
                    "spiritual_guidance": 0.88
                }
            ),
            
            # 阿弥陀佛 - 猪年生人
            BenmingBuddha(
                id="amitabha_fo_pig",
                name="阿弥陀佛",
                sanskrit_name="Amitābha",
                title="南无阿弥陀佛",
                zodiac=[Zodiac.PIG],
                element=WuxingElement.WATER,
                personality=["慈悲", "包容", "智慧", "清净"],
                specialties=["福德增长", "智慧开启", "净化身心", "圆满功德"],
                blessings=[
                    "弥陀福德海，如猪福满载",
                    "无量寿光明，智慧得开启",
                    "净土妙庄严，身心皆清净",
                    "阿弥陀佛力，功德得圆满"
                ],
                protection_areas=["福德积累", "智慧增长", "身心净化", "圆满成就"],
                avatar_emoji="🪷",
                color="#4169E1",
                mantra="南无阿弥陀佛",
                full_mantra="南无阿弥陀佛",
                description="阿弥陀佛的无量功德与猪年生人的福德天性相应，带来圆满的加持。",
                historical_background="阿弥陀佛的无量福德与属猪人的福德因缘相应，能够带来身心的净化和功德的圆满。",
                temple_location="净土宗各大寺院",
                festival_date="农历十一月十七（阿弥陀佛圣诞）",
                sacred_items=["功德箱", "莲花", "净水", "念珠"],
                meditation_guidance=[
                    "每日念佛积累功德",
                    "观想极乐净土的庄严",
                    "以清净心念诵佛号",
                    "定期布施回向净土"
                ],
                compatibility_factors={
                    "merit_accumulation": 0.95,
                    "wisdom_development": 0.9,
                    "purification_power": 0.92,
                    "perfect_completion": 0.88
                }
            )
        ]
        
        return buddhas
    
    def get_buddha_by_zodiac(self, zodiac: Zodiac) -> List[BenmingBuddha]:
        """根据生肖获取本命佛"""
        return [buddha for buddha in self.buddhas if zodiac in buddha.zodiac]
    
    def get_buddha_by_year(self, year: int) -> BenmingBuddha:
        """根据出生年份获取本命佛"""
        zodiac_cycle = [
            Zodiac.RAT, Zodiac.OX, Zodiac.TIGER, Zodiac.RABBIT,
            Zodiac.DRAGON, Zodiac.SNAKE, Zodiac.HORSE, Zodiac.GOAT,
            Zodiac.MONKEY, Zodiac.ROOSTER, Zodiac.DOG, Zodiac.PIG
        ]
        
        zodiac_index = (year - 4) % 12  # 以甲子年为起点
        zodiac = zodiac_cycle[zodiac_index]
        
        buddhas = self.get_buddha_by_zodiac(zodiac)
        return buddhas[0] if buddhas else None
    
    def get_buddha_by_id(self, buddha_id: str) -> BenmingBuddha:
        """根据ID获取本命佛"""
        for buddha in self.buddhas:
            if buddha.id == buddha_id:
                return buddha
        return None
    
    def get_buddhas_by_element(self, element: WuxingElement) -> List[BenmingBuddha]:
        """根据五行获取本命佛列表"""
        return [buddha for buddha in self.buddhas if buddha.element == element]
    
    def get_all_buddhas(self) -> List[BenmingBuddha]:
        """获取所有本命佛"""
        return self.buddhas.copy()
    
    def search_buddhas(self, keyword: str) -> List[BenmingBuddha]:
        """搜索本命佛"""
        results = []
        keyword = keyword.lower()
        
        for buddha in self.buddhas:
            if (keyword in buddha.name.lower() or 
                keyword in buddha.sanskrit_name.lower() or
                keyword in buddha.title.lower() or
                any(keyword in spec.lower() for spec in buddha.specialties) or
                any(keyword in trait.lower() for trait in buddha.personality)):
                results.append(buddha)
        
        return results


# 全局本命佛数据库实例
benming_buddha_database = BenmingBuddhaDatabase()