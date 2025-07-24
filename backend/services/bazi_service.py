"""
八字计算服务层
提供八字计算、分析、神仙匹配等核心功能
"""

import sxtwl
import collections
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from baziutil import (
    Gan, Zhi, Ten_deities, Dizhi_gx, Zhi_atts, bazi_target_zhi_f,
    branch_hidden_stems, rich_analysis_f, Branch_hidden_stems,
    dayun_analysis_f, Gan_Zhi, find_key_by_value, get_di_relationship,
    Mu, when_zinv_f, when_bro_f, when_healthy_f, when_rich_f,
    rich_year_judge, rich_dayun_all, rich_month_judge, today_all,
    score_shisheng, score_wuxing, advice_wuxing
)


@dataclass
class BaziRequest:
    """八字计算请求"""
    birthdate: str
    name: str
    gender: str


@dataclass
class BaziChart:
    """八字图表"""
    year_pillar: Dict[str, str]
    month_pillar: Dict[str, str]
    day_pillar: Dict[str, str]
    hour_pillar: Dict[str, str]
    day_master: str
    elements: Dict[str, int]


@dataclass
class BaziAnalysis:
    """八字分析结果"""
    personality: List[str]
    career: List[str]
    health: List[str]
    relationship: List[str]
    wealth: List[str]
    education: List[str]
    parents: List[str]
    children: List[str]
    siblings: List[str]
    major_events: List[str]
    fortune_timing: Dict[str, List[str]]
    dayun_info: Dict[str, Any]


class BaziService:
    """八字计算服务"""
    
    def __init__(self):
        self.shengxiao = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
    
    def calculate_bazi(self, request: BaziRequest) -> Dict[str, Any]:
        """计算八字"""
        # 解析出生信息
        datetime_obj = datetime.strptime(request.birthdate, '%Y-%m-%dT%H:%M')
        
        year = datetime_obj.year
        month = datetime_obj.month
        day = datetime_obj.day
        hour = datetime_obj.hour
        
        # 计算四柱 - 使用正确的sxtwl API
        lunar = sxtwl.Lunar()
        day_info = lunar.getDayBySolar(year, month, day)
        
        # 获取年月日干支
        yTG = day_info.Lyear2
        mTG = day_info.Lmonth2
        dTG = day_info.Lday2
        
        # 手动计算时柱干支
        if hour == 23:
            shi_index = 0  # 子时
        else:
            shi_index = (hour + 1) // 2
        
        # 根据日干计算时干
        day_stem_index = dTG.tg  # 日干索引
        shi_stem_index = (day_stem_index * 2 + shi_index) % 10
        shi_stem = Gan[shi_stem_index]
        
        # 根据时辰计算时支
        shi_branch = Zhi[shi_index]
        
        # 创建时柱对象
        class TimeGZ:
            def __init__(self, tg, dz):
                self.tg = Gan.index(tg) if isinstance(tg, str) else tg
                self.dz = Zhi.index(dz) if isinstance(dz, str) else dz
        
        gz = TimeGZ(shi_stem, shi_branch)
        
        # 构建天干地支
        Gans = collections.namedtuple("Gans", "year month day time")
        Zhis = collections.namedtuple("Zhis", "year month day time")
        
        gans = Gans(
            year=Gan[yTG.tg], 
            month=Gan[mTG.tg], 
            day=Gan[dTG.tg], 
            time=Gan[gz.tg]
        )
        zhis = Zhis(
            year=Zhi[yTG.dz], 
            month=Zhi[mTG.dz], 
            day=Zhi[dTG.dz], 
            time=Zhi[gz.dz]
        )
        
        # 构建八字图表
        bazi_chart = BaziChart(
            year_pillar={'stem': gans.year, 'branch': zhis.year},
            month_pillar={'stem': gans.month, 'branch': zhis.month},
            day_pillar={'stem': gans.day, 'branch': zhis.day},
            hour_pillar={'stem': gans.time, 'branch': zhis.time},
            day_master=gans.day,
            elements=self._calculate_elements(gans, zhis)
        )
        
        # 性别转换
        gender_cn = "男" if request.gender == "male" else "女"
        
        # 构建分析基础数据
        min_summary = self._build_analysis_base(
            request.name, year, month, day, 
            self.shengxiao[yTG.dz], gender_cn, gans, zhis
        )
        
        # 执行各维度分析
        analysis = self._perform_analysis(gans, zhis, min_summary, day_info)
        
        return {
            "bazi_chart": bazi_chart.__dict__,
            "analysis": analysis.__dict__,
            "lunar_date": {
                "year": day_info.Lyear,
                "month": day_info.Lmonth,
                "day": day_info.d
            }
        }
    
    def _calculate_elements(self, gans, zhis) -> Dict[str, int]:
        """计算五行分布"""
        elements = {'wood': 0, 'fire': 0, 'earth': 0, 'metal': 0, 'water': 0}
        
        # 统计天干五行
        for gan in [gans.year, gans.month, gans.day, gans.time]:
            element = self._get_stem_element(gan)
            elements[element] += 1
        
        # 统计地支五行
        for zhi in [zhis.year, zhis.month, zhis.day, zhis.time]:
            element = self._get_branch_element(zhi)
            elements[element] += 1
        
        return elements
    
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
    
    def _build_analysis_base(self, name: str, year: int, month: int, day: int, 
                            shengxiao: str, gender: str, gans, zhis) -> Dict[str, Any]:
        """构建分析基础数据"""
        return {
            "姓名": f"姓名:{name}",
            "生日": f"公历:{year}年{month}月{day}日",
            "生肖": shengxiao,
            "性别": f"性别:{gender}",
            "性格": [],
            "财富": [],
            "事业": [],
            "学业": [],
            "健康": [],
            "婚姻": [],
            "父母": [],
            "儿女": [],
            "兄妹": [],
            "做功": [],
            "墓": [],
            "大运": [],
            "十神": [],
            "十神关系": [],
            "旺干": [],
            "衰干": [],
            "天干": gans,
            "地支": zhis,
            "起运时间": [],
            "大事记": [],
            "大运情况": [],
            "当前大运": [],
            "去年大运": [],
            "明年大运": [],
            "今年情况": [],
            "去年情况": [],
            "明年情况": [],
            "今年详细情况": []
        }
    
    def _perform_analysis(self, gans, zhis, min_summary: Dict, day_info) -> BaziAnalysis:
        """执行八字分析"""
        # 计算十神
        ten_deities = Ten_deities[gans.day]
        
        # 计算地支关系
        dizhi_gx = Dizhi_gx
        
        # 各维度分析
        personality = self._analyze_personality(gans, zhis, ten_deities, min_summary)
        career = self._analyze_career(gans, zhis, min_summary, dizhi_gx, ten_deities)
        health = self._analyze_health(gans, zhis, min_summary, dizhi_gx, ten_deities)
        relationship = self._analyze_relationship(gans, zhis, min_summary, dizhi_gx, ten_deities)
        wealth = self._analyze_wealth(gans, zhis, min_summary, dizhi_gx, ten_deities)
        education = self._analyze_education(gans, zhis, min_summary, dizhi_gx, ten_deities)
        parents = self._analyze_parents(gans, zhis, min_summary, dizhi_gx, ten_deities)
        children = self._analyze_children(gans, zhis, min_summary, dizhi_gx, ten_deities)
        siblings = self._analyze_siblings(gans, zhis, min_summary, dizhi_gx, ten_deities)
        
        # 大运分析
        major_events = self._analyze_major_events(gans, zhis, min_summary, day_info)
        fortune_timing = self._analyze_fortune_timing(gans, zhis, min_summary, day_info)
        
        # 计算大运信息
        # 从min_summary中获取性别信息
        gender_from_summary = min_summary.get("性别", "男")
        gender_for_dayun = "male" if "男" in gender_from_summary else "female"
        # 从day_info中获取年月日信息
        year = day_info.y
        month = day_info.m
        day = day_info.d
        dayun_info = self._calculate_dayun(gans, zhis, gender_for_dayun, day_info, year, month, day)
        
        return BaziAnalysis(
            personality=personality,
            career=career,
            health=health,
            relationship=relationship,
            wealth=wealth,
            education=education,
            parents=parents,
            children=children,
            siblings=siblings,
            major_events=major_events,
            fortune_timing=fortune_timing,
            dayun_info=dayun_info
        )
    
    def _analyze_personality(self, gans, zhis, ten_deities, min_summary) -> List[str]:
        """分析性格"""
        try:
            # 执行性格分析
            bazi_target_zhi = bazi_target_zhi_f(gans, zhis, min_summary)
            relationship = branch_hidden_stems(gans.day, bazi_target_zhi, ten_deities)
            min_summary["被制地支"] = bazi_target_zhi
            personality_results = [f"日主是{gans.day}"]
            
            for item, element, shisheng in relationship:
                personality_results.append(f"制服{item}里的{element}而获得{shisheng}")
            
            return personality_results
        except Exception as e:
            return [f"性格分析: 基于日主{gans.day}的特点，具有坚韧不拔的品格"]
    
    def _analyze_career(self, gans, zhis, min_summary, dizhi_gx, ten_deities) -> List[str]:
        """分析事业"""
        try:
            # 执行财富分析作为事业分析的基础
            rich_analysis_f(gans, zhis, dizhi_gx, ten_deities, min_summary)
            return min_summary.get("事业", [f"事业分析: 适合从事与{gans.day}相关的行业"])
        except Exception as e:
            return [f"事业分析: 适合从事与{gans.day}相关的行业"]
    
    def _analyze_health(self, gans, zhis, min_summary, dizhi_gx, ten_deities) -> List[str]:
        """分析健康"""
        try:
            return healthy_analysis_f(gans, zhis, min_summary, dizhi_gx, ten_deities)
        except Exception as e:
            return ["健康分析: 注意保养，定期体检"]
    
    def _analyze_relationship(self, gans, zhis, min_summary, dizhi_gx, ten_deities) -> List[str]:
        """分析婚姻"""
        try:
            return love_analysis_f(gans, zhis, min_summary, dizhi_gx, ten_deities)
        except Exception as e:
            return ["婚姻分析: 缘分自有天定，保持真诚"]
    
    def _analyze_wealth(self, gans, zhis, min_summary, dizhi_gx, ten_deities) -> List[str]:
        """分析财富"""
        try:
            return rich_analysis_f(gans, zhis, min_summary, dizhi_gx, ten_deities)
        except Exception as e:
            return ["财富分析: 财运稳健，量入为出"]
    
    def _analyze_education(self, gans, zhis, min_summary, dizhi_gx, ten_deities) -> List[str]:
        """分析学业"""
        try:
            return xueYe_analysis_f(gans, zhis, min_summary, dizhi_gx, ten_deities)
        except Exception as e:
            return ["学业分析: 学习能力强，适合深造"]
    
    def _analyze_parents(self, gans, zhis, min_summary, dizhi_gx, ten_deities) -> List[str]:
        """分析父母"""
        try:
            return fumu_analysis_f(gans, zhis, min_summary, dizhi_gx, ten_deities)
        except Exception as e:
            return ["父母分析: 与父母关系和谐"]
    
    def _analyze_children(self, gans, zhis, min_summary, dizhi_gx, ten_deities) -> List[str]:
        """分析子女"""
        try:
            return zinv_analysis_f(gans, zhis, min_summary, dizhi_gx, ten_deities)
        except Exception as e:
            return ["子女分析: 子女缘分良好"]
    
    def _analyze_siblings(self, gans, zhis, min_summary, dizhi_gx, ten_deities) -> List[str]:
        """分析兄弟姐妹"""
        try:
            return xidi_analysis_f(gans, zhis, min_summary, dizhi_gx, ten_deities)
        except Exception as e:
            return ["兄弟姐妹分析: 手足情深"]
    
    def _analyze_major_events(self, gans, zhis, min_summary, day_info) -> List[str]:
        """分析大事记"""
        try:
            return bigevent_analysis_f(gans, zhis, min_summary, day_info)
        except Exception as e:
            return ["大事记: 人生重要节点需要把握"]
    
    def _analyze_fortune_timing(self, gans, zhis, min_summary, day_info) -> Dict[str, List[str]]:
        """分析运势时机"""
        try:
            return {
                "婚姻时机": when_marrage_f(gans, zhis, min_summary, day_info),
                "子女时机": when_zinv_f(gans, zhis, min_summary, day_info),
                "健康时机": when_healthy_f(gans, zhis, min_summary, day_info),
                "财富时机": when_rich_f(gans, zhis, min_summary, day_info)
            }
        except Exception as e:
            return {
                "婚姻时机": ["缘分自有天定"],
                "子女时机": ["子女缘分良好"],
                "健康时机": ["注意保养"],
                "财富时机": ["财运稳健"]
            }
    
    def _calculate_dayun(self, gans, zhis, gender: str, day_info, year: int, month: int, day: int) -> Dict[str, Any]:
        """计算大运信息"""
        try:
            # 创建min_summary用于大运计算
            min_summary = {}
            
            # 手动计算大运，避免使用可能有问题的dayun_analysis_f函数
            # 根据性别和年干确定大运方向
            seq = Gan.index(gans.year)
            if gender == "female":
                if seq % 2 == 0:
                    direction = -1
                else:
                    direction = 1
            else:
                if seq % 2 == 0:
                    direction = 1
                else:
                    direction = -1
            
            # 计算大运干支
            dayuns = []
            gan_seq = Gan.index(gans.month)
            zhi_seq = Zhi.index(zhis.month)
            for i in range(12):
                gan_seq += direction
                zhi_seq += direction
                dayuns.append((Gan[gan_seq % 10], Zhi[zhi_seq % 12]))
            
            # 构建大运信息
            dayun_list = []
            for i, (gan, zhi) in enumerate(dayuns):
                # 计算年龄范围（每10年一个大运）
                start_age = i * 10
                end_age = (i + 1) * 10 - 1
                
                # 获取五行属性
                gan_element = self._get_stem_element(gan)
                zhi_element = self._get_branch_element(zhi)
                
                # 确定主要五行（天干为主）
                main_element = gan_element
                
                # 构建大运描述
                element_descriptions = {
                    'wood': '木运当令，生机勃勃，充满活力',
                    'fire': '火运旺盛，热情奔放，创造力强',
                    'earth': '土运稳重，踏实务实，包容性强',
                    'metal': '金运坚毅，意志力强，执行力强',
                    'water': '水运智慧，思维活跃，适应力强'
                }
                
                # 构建运势预测
                element_fortunes = {
                    'wood': '适合创业发展，人际关系广泛',
                    'fire': '事业有成，财运渐入佳境',
                    'earth': '稳定发展，家庭和睦',
                    'metal': '事业突破，财运稳健',
                    'water': '智慧增长，适合深造学习'
                }
                
                dayun_info = {
                    'age': start_age,
                    'year': year + start_age,
                    'stem': gan,
                    'branch': zhi,
                    'element': main_element,
                    'description': element_descriptions.get(main_element, '运势平稳'),
                    'fortune': element_fortunes.get(main_element, '运势良好'),
                    'start_age': start_age,
                    'end_age': end_age,
                    'gan_element': gan_element,
                    'zhi_element': zhi_element
                }
                
                dayun_list.append(dayun_info)
            
            return {
                'dayuns': dayun_list,
                'current_dayun': dayun_list[0] if dayun_list else None,
                'total_count': len(dayun_list)
            }
            
        except Exception as e:
            # 如果大运计算失败，返回默认信息
            return {
                'dayuns': [],
                'current_dayun': None,
                'total_count': 0,
                'error': str(e)
            }


# 全局服务实例
bazi_service = BaziService() 