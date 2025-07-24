from bidict import bidict
from datetime import datetime,timedelta
import sxtwl
from knowledge import zuogong,rich_summary,rich_year,rich_yun,rich_day,rich_month,rich_hour

Gan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
Zhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
Ten_deities = {
    '甲':bidict({'甲':'比', "乙":'劫', "丙":'食', "丁":'伤', "戊":'才',
                  "己":'财', "庚":'杀', "辛":'官', "壬":'枭', "癸":'印', "子":'沐', 
                  "丑":'冠', "寅":'建', "卯":'帝', "辰":'衰', "巳":'病', "午":'死', 
                  "未":'墓', "申":'绝', "酉":'胎', "戌":'养', "亥":'长', '库':'未', 
                  '本':'木', '克':'土', '被克':'金', '生我':'水', '生':'火','合':'己','冲':'庚'}),
    '乙':bidict({'甲':'劫', "乙":'比', "丙":'伤', "丁":'食', "戊":'财',
                  "己":'才', "庚":'官', "辛":'杀', "壬":'印',"癸":'枭', "子":'病', 
                  "丑":'衰', "寅":'帝', "卯":'建', "辰":'冠', "巳":'沐', "午":'长',
                  "未":'养', "申":'胎', "酉":'绝', "戌":'墓', "亥":'死', '库':'未',
                  '本':'木', '克':'土', '被克':'金', '生我':'水', '生':'火','合':'庚','冲':'辛'}),
    '丙':bidict({'丙':'比', "丁":'劫', "戊":'食', "己":'伤', "庚":'才',
                  "辛":'财', "壬":'杀', "癸":'官', "甲":'枭', "乙":'印',"子":'胎', 
                  "丑":'养', "寅":'长', "卯":'沐', "辰":'冠', "巳":'建', "午":'帝',
                  "未":'衰', "申":'病', "酉":'死', "戌":'墓', "亥":'绝', '库':'戌',
                  '本':'火', '克':'金', '被克':'水', '生我':'木', '生':'土','合':'辛','冲':'壬'}),
    '丁':bidict({'丙':'劫', "丁":'比', "戊":'伤', "己":'食', "庚":'财',
                  "辛":'才', "壬":'官', "癸":'杀', "甲":'印',"乙":'枭', "子":'绝', 
                  "丑":'墓', "寅":'死', "卯":'病', "辰":'衰', "巳":'帝', "午":'建',
                  "未":'冠', "申":'沐', "酉":'长', "戌":'养', "亥":'胎', '库':'戌',
                  '本':'火', '克':'金', '被克':'水', '生我':'木', '生':'土','合':'壬','冲':'癸'}),
    '戊':bidict({'戊':'比', "己":'劫', "庚":'食', "辛":'伤', "壬":'才',
                  "癸":'财', "甲":'杀', "乙":'官', "丙":'枭', "丁":'印',"子":'胎', 
                  "丑":'养', "寅":'长', "卯":'沐', "辰":'冠', "巳":'建', "午":'帝',
                  "未":'衰', "申":'病', "酉":'死', "戌":'墓', "亥":'绝', '库':'辰',
                  '本':'土', '克':'水', '被克':'木', '生我':'火', '生':'金','合':'癸','冲':''}),
    '己':bidict({'戊':'劫', "己":'比', "庚":'伤', "辛":'食', "壬":'财',
                  "癸":'才', "甲":'官', "乙":'杀', "丙":'印',"丁":'枭',"子":'绝', 
                  "丑":'墓', "寅":'死', "卯":'病', "辰":'衰', "巳":'帝', "午":'建',
                  "未":'冠', "申":'沐', "酉":'长', "戌":'养', "亥":'胎', '库':'辰',
                  '本':'土', '克':'水', '被克':'木', '生我':'火', '生':'金','合':'甲','冲':''}),
    '庚':bidict({'庚':'比', "辛":'劫', "壬":'食', "癸":'伤', "甲":'才',
                  "乙":'财', "丙":'杀', "丁":'官', "戊":'枭', "己":'印',"子":'死', 
                  "丑":'墓', "寅":'绝', "卯":'胎', "辰":'养', "巳":'长', "午":'沐',
                  "未":'冠', "申":'建', "酉":'帝', "戌":'衰', "亥":'病', '库':'丑',
                  '本':'金', '克':'木', '被克':'火', '生我':'土', '生':'水','合':'乙','冲':'甲'}), 
    '辛':bidict({'庚':'劫', "辛":'比', "壬":'伤', "癸":'食', "甲":'财',
                  "乙":'才', "丙":'官', "丁":'杀', "戊":'印', "己":'枭', "子":'长', 
                  "丑":'养', "寅":'胎', "卯":'绝', "辰":'墓', "巳":'死', "午":'病',
                  "未":'衰', "申":'帝', "酉":'建', "戌":'冠', "亥":'沐', '库':'丑',
                  '本':'金', '克':'木', '被克':'火', '生我':'土', '生':'水','合':'丙','冲':'乙'}),
    '壬':bidict({'壬':'比', "癸":'劫', "甲":'食', "乙":'伤', "丙":'才',
                  "丁":'财', "戊":'杀', "己":'官', "庚":'枭', "辛":'印',"子":'帝', 
                  "丑":'衰', "寅":'病', "卯":'死', "辰":'墓', "巳":'绝', "午":'胎',
                  "未":'养', "申":'长', "酉":'沐', "戌":'冠', "亥":'建', '库':'辰',
                  '本':'水', '克':'火', '被克':'土', '生我':'金', '生':'木','合':'丁','冲':'丙'}),
    '癸':bidict({'壬':'劫', "癸":'比', "甲":'伤', "乙":'食', "丙":'财',
                  "丁":'才', "戊":'官', "己":'杀', "庚":'印',"辛":'枭', "子":'建', 
                  "丑":'冠', "寅":'沐', "卯":'长', "辰":'养', "巳":'胎', "午":'绝',
                  "未":'墓', "申":'死', "酉":'病', "戌":'衰', "亥":'帝', '库':'辰',
                  '本':'水', '克':'火', '被克':'土', '生我':'金', '生':'木','合':'戊','冲':'丁'}), 

}    
Dizhi_gx = {
    '子':{'甲':{'生','-'}, "乙":{'生','-'}, "丙":{'克','-'}, "丁":{'克',"-"}, "戊":{'合','-'},
                  "己":{'被克','-'}, "庚":{'被生','+'}, "辛":{'被生','+'}, "壬":{'劫',"+"}, "癸":{'比',"+"}, "子":{'伏吟','+'}, 
                  "丑":{'六合','+'}, "寅":{'生','-'}, "卯":{'刑','-'}, "辰":{'三会','+'}, "巳":{'克','-'}, "午":{'冲','-'}, 
                  "未":{'害','-'}, "申":{'三合','+'}, "酉":{'破','+'}, "戌":{'被克','-'}, "亥":{'三会','+'}, '性':'阴','库':'辰', 
                  '本':'水', '克':'火', '被克':'土', '生我':'金', '生':'木','合':'丑','冲':'午'},
    '丑':{'甲':{'被克','-'}, "乙":{'被克',"-"}, "丙":{'克',"-"}, "丁":{'害',"-"}, "戊":{'劫',"-"},
                  "己":{'害',"-"}, "庚":{'生','+'}, "辛":{'生',"+"}, "壬":{'克',"+"},"癸":{'克',"+"}, "子":{'六合','+'}, 
                  "丑":{'伏吟','+'}, "寅":{'被克','-'}, "卯":{'被克','-'}, "辰":{'无','+'}, "巳":{'三合','-'}, "午":{'害','-'},
                  "未":{'冲','-'}, "申":{'生','+'}, "酉":{'三合','+'}, "戌":{'三刑','-'}, "亥":{'三会','-'}, '性':'阴','库':'辰',
                  '本':'土', '克':'水', '被克':'木', '生我':'火', '生':'金','合':'子','冲':'未'},
    '寅':{'丙':{'害',"+"}, "丁":{'生',"+"}, "戊":{'害',"+"}, "己":{'克',"+"}, "庚":{'被克',"-"},
                  "辛":{'被克',"-"}, "壬":{'被生',"+"}, "癸":{'被生',"+"}, "甲":{'比',"+"}, "乙":{'劫',"+"},"子":{'生','+'}, 
                  "丑":{'克','-'}, "寅":{'伏吟','+'}, "卯":{'三会','+'}, "辰":{'三会','+'}, "巳":{'害','+'}, "午":{'三合','+'},
                  "未":{'克','+'}, "申":{'冲','-'}, "酉":{'被克','-'}, "戌":{'三合','+'}, "亥":{'合','-'}, '性':'阳','库':'未',
                  '本':'木', '克':'土', '被克':'金', '生我':'水', '生':'火','合':'亥','冲':'申'},
    '卯':{'丙':{'生',""}, "丁":{'生',"+"}, "戊":{'克',"+"}, "己":{'克',"+"}, "庚":{'被克',"-"},
                  "辛":{'被克',"-"}, "壬":{'被生',"-"}, "癸":{'被生',"+"}, "甲":{'劫',"+"},"乙":{'比',"+"},"子":{'刑','-'}, 
                  "丑":{'克','-'}, "寅":{'三会','+'}, "卯":{'伏吟','+'}, "辰":{'害','-'}, "巳":{'泄','+'}, "午":{'破','+'},
                  "未":{'三合','+'}, "申":{'克','-'}, "酉":{'冲','-'}, "戌":{'六合','+'}, "亥":{'三合','-'}, '性':'阳','库':'未',
                  '本':'木', '克':'土', '被克':'金', '生我':'水', '生':'火','合':'序','冲':'酉'},
    '辰':{'戊':{'被克',"-"}, "己":{'被克',"-"}, "庚":{'被生',"+"}, "辛":{'被生',"+"}, "壬":{'墓',"+"},
                  "癸":{'墓',"+"}, "甲":{'生',"-"}, "乙":{'生',"-"}, "丙":{'克',"-"}, "丁":{'克',"-"},"子":{'三合','+'}, 
                  "丑":{'破','+'}, "寅":{'会','-'}, "卯":{'害','-'}, "辰":{'伏吟','+'}, "巳":{'克','-'}, "午":{'克','-'},
                  "未":{'克','-'}, "申":{'三合','+'}, "酉":{'合','+'}, "戌":{'冲','-'}, "亥":{'耗','+'}, '性':'阴','库':'辰',
                  '本':'土', '克':'水', '被克':'木', '生我':'火', '生':'金','合':'酉','冲':'戌'},
    '巳':{'戊':{'生',"+"}, "己":{'生',"+"}, "庚":{'克',"-"}, "辛":{'克',"-"}, "壬":{'被克',"-"},
                  "癸":{'被克',"-"}, "甲":{'被生',"+"}, "乙":{'被生',"+"}, "丙":{'比',"+"},"丁":{'劫',"+"},"子":{'克','-'}, 
                  "丑":{'合','-'}, "寅":{'害','+'}, "卯":{'生','+'}, "辰":{'克','-'}, "巳":{'伏吟','+'}, "午":{'三会','+'},
                  "未":{'泄','+'}, "申":{'合','-'}, "酉":{'耗','-'}, "戌":{'泄','+'}, "亥":{'冲','-'}, '性':'阳','库':'戌',
                  '本':'火', '克':'金', '被克':'水', '生我':'木', '生':'土','合':'申','冲':'亥'},
    '午':{'庚':{'克',"-","路旁土"}, "辛":{'克',"-"}, "壬":{'被克',"-"}, "癸":{'被克',"-"}, "甲":{'被生',"+"},
                  "乙":{'被生',"+"}, "丙":{'劫',"+"}, "丁":{'比',"+"}, "戊":{'生',"+"}, "己":{'生',"+"},"子":{'冲','-'}, 
                  "丑":{'害','-'}, "寅":{'三合','+'}, "卯":{'破','+'}, "辰":{'克','-'}, "巳":{'三会','+'}, "午":{'自刑','+'},
                  "未":{'合','+'}, "申":{'耗','-'}, "酉":{'耗','-'}, "戌":{'三合','+'}, "亥":{'克','-'}, '性':'阳','库':'戌',
                  '本':'火', '克':'土', '被克':'金', '生我':'水', '生':'火','合':'未','冲':'子'}, 
    '未':{'庚':{'生',"-"}, "辛":{'生',"-"}, "壬":{'克',"-"}, "癸":{'克',"-"}, "甲":{'被克',"+"},
                  "乙":{'被克',"+"}, "丙":{'被生',"+"}, "丁":{'被生',"+"}, "戊":{'劫',"+"}, "己":{'比',"+"}, "子":{'害','-'}, 
                  "丑":{'冲','-'}, "寅":{'克','+'}, "卯":{'三会','+'}, "辰":{'克','-'}, "巳":{'生','+'}, "午":{'三会','+'},
                  "未":{'伏吟','+'}, "申":{'泄','-'}, "酉":{'泄','-'}, "戌":{'破','+'}, "亥":{'三合','-'}, '性':'阳','库':'未',
                  '本':'土', '克':'水', '被克':'木', '生我':'火', '生':'金','合':'戊','冲':'丑'},
    '申':{'壬':{'生',"+"}, "癸":{'生',"+"}, "甲":{'克',"-"}, "乙":{'克',"-"}, "丙":{'被克',"-"},
                  "丁":{'被克',"-"}, "戊":{'被生',"+"}, "己":{'被生',"+"}, "庚":{'比',"+"}, "辛":{'劫',"+"},"子":{'三合','+'}, 
                  "丑":{'生','+'}, "寅":{'冲','-'}, "卯":{'耗','-'}, "辰":{'三合','+'}, "巳":{'合','-'}, "午":{'克','-'},
                  "未":{'生','+'}, "申":{'伏吟','+'}, "酉":{'三会','+'}, "戌":{'三会','+'}, "亥":{'害','+'}, '性':'阴','库':'丑',
                  '本':'金', '克':'木', '被克':'火', '生我':'土', '生':'水','合':'巳','冲':'寅'},
    '酉':{'壬':{'生',"+"}, "癸":{'生',"+"}, "甲":{'克',"-"}, "乙":{'克',"-"}, "丙":{'被克',"-"},
                  "丁":{'被克',"-"}, "戊":{'被生',"+"}, "己":{'被生',"+"}, "庚":{'劫',"+"},"辛":{'比',"+"}, "子":{'破','+'}, 
                  "丑":{'三合','+'}, "寅":{'耗','-'}, "卯":{'冲','-'}, "辰":{'合','+'}, "巳":{'三合','-'}, "午":{'克','-'},
                  "未":{'生','+'}, "申":{'三会','+'}, "酉":{'自刑','+'}, "戌":{'三会','-'}, "亥":{'泄','+'}, '性':'阴','库':'丑',
                  '本':'金', '克':'木', '被克':'火', '生我':'土', '生':'水','合':'辰','冲':'卯'},
    '戌':{'壬':{'克',"-"}, "癸":{'克',"-"}, "甲":{'被克',"+"}, "乙":{'被克',"+"}, "丙":{'被生',"+"},
                  "丁":{'被生',"+"}, "戊":{'比',"+"}, "己":{'劫',"+"}, "庚":{'生',"-"},"辛":{'生',"-"},"子":{'耗','-'}, 
                  "丑":{'三刑','-'}, "寅":{'三合','+'}, "卯":{'合','+'}, "辰":{'冲','-'}, "巳":{'生','+'}, "午":{'三合','+'},
                  "未":{'破','+'}, "申":{'三会','-'}, "酉":{'害','-'}, "戌":{'伏吟','+'}, "亥":{'耗','-'}, '性':'阳','库':'戌',
                  '本':'土', '克':'水', '被克':'木', '生我':'火', '生':'金','合':'卯','冲':'辰'},
    '亥':{'壬':{'比',"+"}, "癸":{'劫',"+"}, "甲":{'生',"-"}, "乙":{'生',"-"}, "丙":{'克',"-"},
                  "丁":{'克',"-"}, "戊":{'被克',"-"}, "己":{'被克',"-"}, "庚":{'生',"+"},"辛":{'生',"+"},"子":{'三会','+'}, 
                  "丑":{'三会','+'}, "寅":{'合','-'}, "卯":{'三合','-'}, "辰":{'克','+'}, "巳":{'冲','-'}, "午":{'耗','-'},
                  "未":{'三合','-'}, "申":{'害','+'}, "酉":{'生','+'}, "戌":{'克','-'}, "亥":{'自刑','+'}, '性':'阴','库':'辰',
                  '本':'水', '克':'火', '被克':'土', '生我':'金', '生':'木','合':'寅','冲':'巳'}

}

Zhi_atts = {
    "子":{"冲":"午", "刑":"卯", "被刑":"卯", "合":("申","辰"), "会":("亥","丑"), '害':'未', '破':'酉', "六":"丑","暗":"","墓":"辰",},
    "丑":{"冲":"未", "刑":"戌", "被刑":"未", "合":("巳","酉"), "会":("子","亥"), '害':'午', '破':'辰', "六":"子","暗":"寅","墓":"辰",},
    "寅":{"冲":"申", "刑":"巳", "被刑":"巳", "合":("午","戌"), "会":("卯","辰"), '害':'巳', '破':'亥', "六":"亥","暗":"丑","墓":"未",},
    "卯":{"冲":"酉", "刑":"子", "被刑":"子", "合":("未","亥"), "会":("寅","辰"), '害':'辰', '破':'午', "六":"戌","暗":"申","墓":"未",},
    "辰":{"冲":"戌", "刑":"辰", "被刑":"辰", "合":("子","申"), "会":("寅","卯"), '害':'卯', '破':'丑', "六":"酉","暗":"","墓":"",},
    "巳":{"冲":"亥", "刑":"申", "被刑":"寅", "合":("酉","丑"), "会":("午","未"), '害':'寅', '破':'申', "六":"申","暗":"","墓":"戌",},
    "午":{"冲":"子", "刑":"午", "被刑":"午", "合":("寅","戌"), "会":("巳","未"), '害':'丑', '破':'卯', "六":"未","暗":"亥","墓":"戌",},
    "未":{"冲":"丑", "刑":"丑", "被刑":"戌", "合":("卯","亥"), "会":("巳","午"), '害':'子', '破':'戌', "六":"午","暗":"","墓":"",},
    "申":{"冲":"寅", "刑":"寅", "被刑":"巳", "合":("子","辰"), "会":("酉","戌"), '害':'亥', '破':'巳', "六":"巳","暗":"卯","墓":"丑",},
    "酉":{"冲":"卯", "刑":"酉", "被刑":"酉", "合":("巳","丑"), "会":("申","戌"), '害':'戌', '破':'子', "六":"辰","暗":"","墓":"丑",},
    "戌":{"冲":"辰", "刑":"未", "被刑":"丑", "合":("午","寅"), "会":("申","酉"), '害':'酉', '破':'未', "六":"卯","暗":"","墓":"",},
    "亥":{"冲":"巳", "刑":"亥", "被刑":"亥", "合":("卯","未"), "会":("子","丑"), '害':'申', '破':'寅', "六":"寅","暗":"午","墓":"辰",},
}
Huajia ={
   "甲子":"海中金",
   "乙丑":"海中金",
   "丙寅":"炉中火",
   "丁卯":"炉中火",
   "戊辰":"大林木",
   "己巳":"大林木",
   "庚午":"路旁土",
   "辛未":"路旁土",
   "壬申":"剑锋金",
   "癸酉":"剑锋金",
   "甲戌":"山头火",
   "乙亥":"山头火",
   "丙子":"涧下水",
   "丁丑":"涧下水",
   "戊寅":"城头土",
   "己卯":"城头土",
   "庚辰":"白蜡金",
   "辛巳":"白蜡金",
   "壬午":"杨柳木",
   "癸未":"杨柳木",
   "甲申":"井泉水",
   "乙酉":"井泉水",
   "丙戌":"屋上土",
   "丁亥":"屋上土",
   "戊子":"霹雳火",
   "己丑":"霹雳火",
   "庚寅":"松柏木",
   "辛卯":"松柏木",
   "壬辰":"长流水",
   "癸巳":"长流水",
   "甲午":"沙中金",
   "乙未":"沙中金",
   "丙申":"山下火",
   "丁酉":"山下火",
   "戊戌":"平地木",
   "己亥":"平地木",
   "庚子":"璧上土",
   "辛丑":"璧上土",
   "壬寅":"金铂金",
   "癸卯":"金铂金",
   "甲辰":"覆灯火",
   "乙巳":"覆灯火",
   "丙午":"天河水",
   "丁未":"天河水",
   "戊申":"大驿土",
   "己酉":"大驿土",
   "庚戌":"钗钏金",
   "辛亥":"钗钏金",
   "壬子":"桑柘木",
   "癸丑":"桑柘木",
   "甲寅":"大溪水",
   "乙卯":"大溪水",
   "丙辰":"沙中土",
   "丁巳":"沙中土",
   "戊午":"天上火",
   "己未":"天上火",
   "庚申":"石榴木",
   "辛酉":"石榴木",
   "壬戌":"大海水",
   "癸亥":"大海水"
}
Branch_hidden_stems = {
    '子': ['癸'],
    '丑': ['癸', '辛', '己'],
    '寅': ['甲', '丙', '戊'],
    '卯': ['乙'],
    '辰': ['乙', '戊', '癸'],
    '巳': ['庚', '丙', '戊'],
    '午': ['丁', '己'],
    '未': ['乙', '己', '丁'],
    '申': ['戊', '庚', '壬'],
    '酉': ['辛'],
    '戌': ['辛', '丁', '戊'],
    '亥': ['甲', '壬']
    }
Mu = {
    '丑': {'墓':['庚', '辛', '申','酉'],"闭":"子","冲":"未",'害':'午'},
    '辰': {'墓':['壬', '癸', '子','亥','丑'],"闭":"酉","冲":"戌",'害':'卯'},
    '未': {'墓':['甲', '乙', '寅', '卯'],"闭":"午","冲":"丑",'害':'子'},  
    '戌': {'墓':['丙', '丁', '戊', '己', '巳', '午'],"闭":"卯","冲":"辰",'害':'酉'}
    }
graveyard_zhi = ['辰', '戌', '丑', '未']
enter_grave_zhi = ['寅', '申', '巳', '亥', '丑']
Gan_Zhi={
    '子': ['癸'],
    '丑': ['癸', '辛'],
    '寅': ['甲', '丙'],
    '卯': ['乙'],
    '辰': ['乙', '癸'],
    '巳': ['丙', '戊'],
    '午': ['丁', '己'],
    '未': ['乙', '己', '丁'],
    '申': [ '庚', '壬'],
    '酉': ['辛'],
    '戌': [ '丁', '戊'],
    '亥': ['甲', '壬'],
    '甲': ['亥','寅' ],
    '乙': ['卯', '未','辰'],
    '丙': ['寅', '巳'],
    '丁': ['午','戌','未'],
    '戊': ['巳', '戌'],
    '己': ['午', '未'],
    '庚': ['申'],
    '辛': ['酉', '丑'],
    '壬': [ '亥', '申'],
    '癸': ['子','辰','丑']  
}

Gan_Zhi_Score={
    '子': {'癸': 100},
    '丑': {'己': 60,'癸': 30,'辛': 30},
    '寅': {'甲': 60,'丙': 30,'戊': 30},
    '卯': {'乙': 100},
    '辰': {'戊': 60, '乙': 30, '癸': 10},
    '巳': {'丙': 60, '戊': 30, '庚': 10},
    '午': {'丁': 70, '己': 30},
    '未': {'己': 60, '丁': 30, '乙': 10},
    '申': {'庚': 60, '壬': 30, '戊': 10},
    '酉': {'辛': 100},
    '戌': {'戊': 60, '辛': 30, '丁': 10},
    '亥': {'壬': 70, '甲': 30} 
}

wangdu_coefficients = {
    '子': [1.414, 0.500, 0.707, 1.000, 2.000],  # 木火土金水
    '丑': [0.898, 0.821, 1.512, 1.348, 1.041],  # 木火土金水
    '寅': [1.571, 1.548, 0.924, 0.716, 0.862],  # 木火土金水
    '卯': [2.000, 1.414, 0.500, 0.707, 1.000],  # 木火土金水
    '辰': [1.166, 1.074, 1.421, 1.161, 0.800],  # 木火土金水
    '巳': [0.862, 1.571, 1.548, 0.924, 0.716],  # 木火土金水
    '午': [0.912, 1.700, 1.590, 0.774, 0.645],  # 木火土金水
    '未': [0.924, 1.341, 1.674, 1.069, 0.612],  # 木火土金水
    '申': [0.795, 0.674, 1.012, 1.641, 1.498],  # 木火土金水
    '酉': [0.500, 0.707, 1.000, 2.000, 1.414],  # 木火土金水
    '戌': [0.674, 1.012, 1.641, 1.498, 0.795],  # 木火土金水
    '亥': [1.590, 0.774, 0.645, 0.912, 1.700],  # 木火土金水
 }

tgdz_yin_yang = {
        # 天干
        '甲': '阳', '乙': '阳', '丙': '阳', '丁': '阳', '戊': '阳',
        '己': '阴', '庚': '阴', '辛': '阴', '壬': '阴', '癸': '阴',
        # 地支
        '子': '阴', '丑': '阴', '寅': '阳', '卯': '阳', '辰': '阴',
        '巳': '阳', '午': '阳', '未': '阳', '申': '阴', '酉': '阴',
        '戌': '阳', '亥': '阴'
    }

Month_ganzhi={
       '甲':'丙',
       '乙':'戊',
       '丙':'庚',
       '丁':'壬',
       '戊':'甲',
       '己':'丙',
       '庚':'戊',
       '辛':'庚',
       '壬':'壬',
       '癸':'甲',
    }

def bazi_target_zhi_f(gans,zhis,min_summary):
      
    dizhi_yy= [tgdz_yin_yang[element] for element in zhis]
    tg_yy= [tgdz_yin_yang[element] for element in gans]

    # 计算阴阳比例
    yang_count = dizhi_yy.count('阳')
    yin_count = dizhi_yy.count('阴')
    yang_count_gan=tg_yy.count('阳')
    yin_count_gan=tg_yy.count('阴')
    zg_type=[]
    result_bazi_target_zhi=[]

    near_gan=[]
    zhis_gan=[]
    near_gan.append(gans[1])
    near_gan.append(gans[3])
    for i in Branch_hidden_stems[zhis[2]]:
      near_gan.append(i)
    
    # for j in Branch_hidden_stems[zhis[1]]:
    #    near_gan.append(j)
    for i in zhis:
       for j in Branch_hidden_stems[i]:
        zhis_gan.append(j)
    for k in gans:
        zhis_gan.append(k)

    if (Ten_deities[gans[2]].inverse["食"] in zhis_gan or Ten_deities[gans[2]].inverse["伤"] in zhis_gan ) and (Ten_deities[gans[2]].inverse["财"] in zhis_gan or Ten_deities[gans[2]].inverse["才"] in zhis_gan):
        if Ten_deities[gans[2]].inverse["食"] in Branch_hidden_stems[zhis[2]] or Ten_deities[gans[2]].inverse["伤"] in Branch_hidden_stems[zhis[2]]:
            if (("食伤生财"),zuogong["食伤生财"]) not in zg_type:
               zg_type.append((("食伤生财"),zuogong["食伤生财"]))
        if Ten_deities[gans[2]].inverse["财"] in Branch_hidden_stems[zhis[2]] or Ten_deities[gans[2]].inverse["才"] in Branch_hidden_stems[zhis[2]]:
            if (("食伤生财"),zuogong["食伤生财"]) not in zg_type:
               zg_type.append((("食伤生财"),zuogong["食伤生财"]))
        if Ten_deities[gans[2]].inverse["官"] in Branch_hidden_stems[zhis[2]] or Ten_deities[gans[2]].inverse["杀"] in Branch_hidden_stems[zhis[2]]:
            if (("食伤生财"),zuogong["食伤生财"]) not in zg_type:
               zg_type.append((("食伤生财"),zuogong["食伤生财"]))
    
    if  (Ten_deities[gans[2]].inverse["印"] in near_gan or Ten_deities[gans[2]].inverse["枭"] in near_gan ):
       if (Ten_deities[gans[2]].inverse["官"] in zhis_gan or Ten_deities[gans[2]].inverse["杀"] in zhis_gan):
            if (("印化官杀"),zuogong["印化官杀"]) not in zg_type:
               zg_type.append((("印化官杀"),zuogong["印化官杀"]))
       
    year_branch, month_branch, day_branch, hour_branch = zhis

    if yang_count == 3:
        # 阳占3，阴占1
        result_bazi_target_zhi = [(index, zhi) for index, (zhi, yy) in enumerate(zip(zhis, dizhi_yy)) if yy == '阴']
        for i in range(4):
               if tg_yy[i]=="阴": 
                 min_summary["被制天干"].append((i,gans[i]))
        #print(f"三阳制一阴典型制用做功 {result_bazi_target_zhi}")
        if "三阳制阴" not in zg_type:
               zg_type.append((("三阳制阴"),zuogong["三阳制阴"]))
        

    elif yin_count == 3:
        # 阴占3，阳占1
        result_bazi_target_zhi = [(index, zhi) for index, (zhi, yy) in enumerate(zip(zhis, dizhi_yy)) if yy == '阳']
        for i in range(4):
               if tg_yy[i]=="阳": 
                 min_summary["被制天干"].append((i,gans[i]))
        #print(f"三阴制一阳典型制用做功 {result_bazi_target_zhi}")
        if "三阴制阳" not in zg_type:
               zg_type.append((("三阴制阳"),zuogong["三阴制阳"]))
     
      

    elif yang_count == 2 and yin_count == 2:
        if dizhi_yy[0] == dizhi_yy[3]:
            result_bazi_target_zhi = [(index, zhi) for index, (zhi, yy) in enumerate(zip(zhis, dizhi_yy)) if yy == dizhi_yy[1]]
            for i in range(4):
               if tg_yy[i]==tg_yy[2]: 
                 min_summary["被制天干"].append((i,gans[i]))
            #print(f"外制内一般制用做功 {result_bazi_target_zhi}")
            if dizhi_yy[2]=="阳" and "阴制阳" not in zg_type:
                 zg_type.append((("阴制阳"),zuogong["阴制阳"]))
            elif dizhi_yy[2]=="阴" and "阳制阴" not in zg_type:
                 zg_type.append((("阳制阴"),zuogong["阳制阴"]))
               
    
        elif dizhi_yy[0] == dizhi_yy[1]:
            result_bazi_target_zhi = [(index, zhi) for index, (zhi, yy) in enumerate(zip(zhis, dizhi_yy)) if yy == dizhi_yy[1]]
            for i in range(4):
               if tg_yy[i]==tg_yy[2]: 
                 min_summary["被制天干"].append((i,gans[i]))
            #print(f"年月制日时一般制用做功 {result_bazi_target_zhi}")
            if dizhi_yy[2]=="阳" and "阴制阳" not in zg_type:
                 zg_type.append((("阴制阳"),zuogong["阴制阳"]))
            elif dizhi_yy[2]=="阴" and "阳制阴" not in zg_type:
                 zg_type.append((("阳制阴"),zuogong["阳制阴"]))
            
            
        elif yang_count+yang_count_gan == 6 and yin_count == 2:
        # 6:2模式
            result_bazi_target_zhi = [(index, zhi) for index, (zhi, yy) in enumerate(zip(zhis, dizhi_yy)) if yy == '阴']
            for i in range(4):
               if tg_yy[i]=="阴": 
                 min_summary["被制天干"].append((i,gans[i]))
            #print(f"年月制日时一般制用做功 {result_bazi_target_zhi}")
            if "阳制阴" not in zg_type:
             zg_type.append((("阳制阴"),zuogong["阳制阴"]))
            
           
        
        elif yin_count+yin_count_gan == 6 and yang_count == 2:
        # 6:2模式
            result_bazi_target_zhi = [(index, zhi) for index, (zhi, yy) in enumerate(zip(zhis, dizhi_yy)) if yy == '阳']
            for i in range(4):
               if tg_yy[i]=="阳": 
                 min_summary["被制天干"].append((i,gans[i]))
            #print(f"年月制日时一般制用做功 {result_bazi_target_zhi}")
            if "阴制阳" not in zg_type:
             zg_type.append((("阴制阳"),zuogong["阴制阳"]))
    
    elif yang_count == 4:
        if yang_count_gan==2 and tg_yy[0]==tg_yy[1] and tg_yy[0]=="阴" and Ten_deities[gans[0]][gans[1]] in ["比","劫","食","伤"]:
           result_bazi_target_zhi=zhis
           if "贼捕阳制阴" not in zg_type:
            zg_type.append((("贼捕阳制阴"),zuogong["贼捕阳制阴"]))
        if tg_yy[2]=="阴" and Ten_deities[gans[1]][gans[2]] in ["比","劫","食","伤"]:
           result_bazi_target_zhi=zhis
           if "贼捕阳制阴" not in zg_type:
             zg_type.append((("贼捕阳制阴"),zuogong["贼捕阳制阴"]))
        if yang_count_gan <2:
           result_bazi_target_zhi=zhis
           if "贼捕阳制阴" not in zg_type:
            zg_type.append((("贼捕阳制阴"),zuogong["贼捕阳制阴"]))
        else:
           for i in range(4):
               if tg_yy[i]=="阴": 
                 min_summary["被制天干"].append((i,gans[i]))
           if "木火阳一气" not in zg_type:
            zg_type.append((("木火阳一气"),zuogong["木火阳一气"]))
        return
    elif yin_count == 4:
        if yang_count_gan==2 and tg_yy[0]==tg_yy[1] and tg_yy[0]=="阳" and Ten_deities[gans[0]][gans[1]] in ["比","劫","食","伤"] and gans[0] not in ["丙","丁"] and gans[1] not in ["丙","丁"] :
           result_bazi_target_zhi=zhis
           if "贼捕阴制阳" not in zg_type:
            zg_type.append((("贼捕阴制阳"),zuogong["贼捕阴制阳"]))
        if tg_yy[2]=="阳" and Ten_deities[gans[1]][gans[2]] in ["比","劫","食","伤"] and gans[2] not in ["丙","丁"] and gans[1] not in ["丙","丁"] :
           result_bazi_target_zhi=zhis
           if "贼捕阴制阳" not in zg_type:
            zg_type.append((("贼捕阴制阳"),zuogong["贼捕阴制阳"]))
        if yang_count_gan >2:
           result_bazi_target_zhi=zhis
           if "贼捕阴制阳" not in zg_type:
            zg_type.append((("贼捕阴制阳"),zuogong["贼捕阴制阳"]))
        else:
           for i in range(4):
               if tg_yy[i]=="阳": 
                 min_summary["被制天干"].append((i,gans[i]))
           if "金水阴一气" not in zg_type:
            zg_type.append((("金水阴一气"),zuogong["金水阴一气"]))
 
    min_summary["做功类型"]=zg_type 
    min_summary["做功"]=zg_type 
    #print(zg_type)
    return result_bazi_target_zhi
     
    

def branch_hidden_stems(day_master,bazi_branch,ten_deities):
    branch_hidden_stems = {
    '子': ['癸'],
    '丑': ['癸', '辛', '己'],
    '寅': ['甲', '丙', '戊'],
    '卯': ['乙'],
    '辰': ['乙', '戊', '癸'],
    '巳': ['庚', '丙', '戊'],
    '午': ['丁', '己'],
    '未': ['乙', '己', '丁'],
    '申': ['戊', '庚', '壬'],
    '酉': ['辛'],
    '戌': ['辛', '丁', '戊'],
    '亥': ['甲', '壬']
    }
    daymaster_relationships=[]
    controlled_branch_hidden_stems=[]
    if bazi_branch:
        for position, zhi in bazi_branch:
            controlled_branch_hidden_stems.append((zhi,branch_hidden_stems[zhi]))
    
        for zhi,stem in controlled_branch_hidden_stems:
            for element in stem:
                relationship = get_deity_relationship(day_master, element, ten_deities)
        # daymaster_relationships[stem] = relationship
                daymaster_relationships.append((zhi,element,relationship))
               # print(f"The relationship between Day Master {day_master} and element {controlled_branch_hidden_stems} is {relationship}.")
       # print(f"{daymaster_relationships}")
    return daymaster_relationships
   
def get_deity_relationship(day_master, element, ten_deities):
    # Check if the day_master and element are in the ten_deities mapping
    if day_master in ten_deities and element in ten_deities[day_master]:
        return ten_deities[day_master][element]
    else:
        return 'Unknown'
    
def get_shisheng(gans,zhis,shisheng,ten_deities):
    # Check if the day_master and element are in the ten_deities mapping
    day_master=gans[2]
    element=""
    if day_master in ten_deities and element in ten_deities[day_master]:
        return ten_deities[day_master][element]
    else:
        return 'Unknown'

def check_dizhi_relationships(zhi1,bazi,dizhi):
    relationships = dizhi[zhi1][bazi]
   # print(f"dizhi1 {zhi1} bazi {bazi} {relationships}")
    return relationships
def get_di_relationship(day_master,dizhi,ten_deities):
    branch_hidden_stems = {
    '子': ['癸'],
    '丑': ['癸', '辛', '己'],
    '寅': ['甲', '丙', '戊'],
    '卯': ['乙'],
    '辰': ['乙', '戊', '癸'],
    '巳': ['庚', '丙', '戊'],
    '午': ['丁', '己'],
    '未': ['乙', '己', '丁'],
    '申': ['戊', '庚', '壬'],
    '酉': ['辛'],
    '戌': ['辛', '丁', '戊'],
    '亥': ['甲', '壬']
    }
    relationships=[]
    for stem in branch_hidden_stems[dizhi]:
        result=get_deity_relationship(day_master, stem, ten_deities)
       # daymaster_relationships[stem] = relationship
        relationships.append((stem,result))
        #print(f"The relationship between Day Master {day_master} and element {stem} is {result}.")
    #print(f"{relationships}")
    return relationships

#分析八字格局和做功方式的大小，以及被制方的顺利程度和制约结果如何
def rich_analysis_f(gans,zhis,dizhi_gx,ten_deities,min_summary):
    rich_result={   
        "richlevel":"normal",
        "richnum": 0,
        "diys": [],
        "dijs": [],
        "tgys": [],
        "tgjs": [],
        "team": [],
        "objteam":[],
        "dayun":[],
        "yun_ys":[],
        "year_ys":[],
        "month_ys":[],
        "day_ys":[],
        "hour_ys":[]
    }
    keywords={"六合","冲","害","刑","暗","三合","三会","合","克"}
    if min_summary["被制地支"]:
     for postion,dizhi in min_summary["被制地支"]:
       # if postion=="0":
         #result_yearzhi=check_dizhi_relationships(dizhi,zhis.year,zhi_atts)
         rich_result['dijs'].append(dizhi)
         if postion== 0:
            result_monthzhi=check_dizhi_relationships(dizhi,zhis.month,dizhi_gx)
            if "-" in result_monthzhi:
                rich_result['richnum']+=8
                if zhis.month not in rich_result['diys']:
                  rich_result["diys"].append(zhis.month)
                if any(keyword in result_monthzhi for keyword in keywords):
                    rich_result['richnum']+=8 
        
            elif "+" in result_monthzhi: 
                rich_result['richnum']-=8
                if zhis.month not in rich_result['dijs']:
                 rich_result['dijs'].append(zhis.month)

            result_yeargan=check_dizhi_relationships(dizhi,gans.year,dizhi_gx)
            if "-" in result_yeargan:
                rich_result['richnum']+=4
                if gans.year not in rich_result['tgys']:
                 rich_result['tgys'].append(gans.year)
            elif "+" in result_yeargan: 
                rich_result['richnum']-=4
                if gans.year not in rich_result['tgjs']:
                 rich_result['tgjs'].append(gans.year)

            result_dayzhi=check_dizhi_relationships(dizhi,zhis.day,dizhi_gx)
            if "-" in result_dayzhi:
                rich_result['richnum']+=4
                if zhis.day not in rich_result['diys']:
                 rich_result['diys'].append(zhis.day)
                if any(keyword in result_dayzhi for keyword in keywords):
                    rich_result['richnum']+=4 
            elif "+" in result_dayzhi: 
                rich_result['richnum']-=4
                if zhis.day not in rich_result['dijs']:
                 rich_result['dijs'].append(zhis.day)

            result_timezhi=check_dizhi_relationships(dizhi,zhis.time,dizhi_gx)
            if "-" in result_timezhi:
                rich_result['richnum']+=2
                if zhis.time not in rich_result['diys']:
                 rich_result['diys'].append(zhis.time)
                if any(keyword in result_timezhi for keyword in keywords):
                    rich_result['richnum']+=2 
            elif "+" in result_timezhi: 
                rich_result['richnum']-=2
                if zhis.time not in rich_result['dijs']:
                 rich_result['dijs'].append(zhis.time)
            result_monthgan=check_dizhi_relationships(dizhi,gans.month,dizhi_gx)
            if "-" in result_monthgan:
                rich_result['richnum']+=2
                if gans.month not in rich_result['tgys']:
                  rich_result['tgys'].append(gans.month)
            elif "+" in result_monthgan: 
                rich_result['richnum']-=2
                if gans.month not in rich_result['tgjs']:
                 rich_result['tgjs'].append(gans.month)
            result_daymaster=check_dizhi_relationships(dizhi,gans.day,dizhi_gx)
            if "-" in result_daymaster:
                rich_result['richnum']+=1
                if gans.day not in rich_result['tgys']:
                 rich_result['tgys'].append(gans.day)
            elif "+" in result_daymaster: 
                rich_result['richnum']-=1
                if gans.day not in rich_result['tgjs']:
                 rich_result['tgjs'].append(gans.day)
            result_timegan=check_dizhi_relationships(dizhi,gans.time,dizhi_gx)
            if "-" in result_timegan:
                rich_result['richnum']+=1
                if gans.time not in rich_result['tgys']:
                 rich_result['tgys'].append(gans.time)
            elif "+" in result_timegan: 
                rich_result['richnum']-=1
                if gans.time not in rich_result['tgjs']:
                 rich_result['tgjs'].append(gans.time)
               
         elif postion== 1:
            result_yearzhi=check_dizhi_relationships(dizhi,zhis.year,dizhi_gx)
            if "-" in result_yearzhi:
                rich_result['richnum']+=6
                if zhis.year not in rich_result['diys']:
                 rich_result['diys'].append(zhis.year)
                if any(keyword in result_yearzhi for keyword in keywords):
                    rich_result['richnum']+=6
        
            elif "+" in result_yearzhi: 
                rich_result['richnum']-=6
                if zhis.year not in rich_result['dijs']:
                 rich_result['dijs'].append(zhis.year)

            result_monthgan=check_dizhi_relationships(dizhi,gans.month,dizhi_gx)
            if "-" in result_monthgan:
                rich_result['richnum']+=4
                if gans.month not in rich_result['tgys']:
                 rich_result['tgys'].append(gans.month)
            elif "+" in result_monthgan: 
                rich_result['richnum']-=4
                if gans.month not in rich_result['tgjs']:
                 rich_result['tgjs'].append(gans.month)

            result_dayzhi=check_dizhi_relationships(dizhi,zhis.day,dizhi_gx)
            if "-" in result_dayzhi:
                rich_result['richnum']+=6
                if zhis.day not in rich_result['diys']:
                 rich_result['diys'].append(zhis.day)
                if any(keyword in result_dayzhi for keyword in keywords):
                    rich_result['richnum']+=6 
            elif "+" in result_dayzhi: 
                rich_result['richnum']-=6
                if zhis.year not in rich_result['dijs']:
                 rich_result['dijs'].append(zhis.day)

            result_timezhi=check_dizhi_relationships(dizhi,zhis.time,dizhi_gx)
            if "-" in result_timezhi:
                rich_result['richnum']+=2
                if zhis.time not in rich_result['diys']:
                 rich_result['diys'].append(zhis.time)
                if any(keyword in result_timezhi for keyword in keywords):
                    rich_result['richnum']+=2 
            elif "+" in result_timezhi: 
                rich_result['richnum']-=2
                if zhis.time not in rich_result['dijs']:
                 rich_result['dijs'].append(zhis.time)
            result_yeargan=check_dizhi_relationships(dizhi,gans.year,dizhi_gx)
            if "-" in result_yeargan:
                rich_result['richnum']+=2
                if gans.year not in rich_result['tgys']:
                 rich_result['tgys'].append(gans.year)
            elif "+" in result_yeargan: 
                rich_result['richnum']-=2
                if gans.year not in rich_result['tgjs']:
                 rich_result['tgjs'].append(gans.year)
            result_daymaster=check_dizhi_relationships(dizhi,gans.day,dizhi_gx)
            if "-" in result_daymaster:
                rich_result['richnum']+=1
                if gans.day not in rich_result['tgys']:
                 rich_result['tgys'].append(gans.day)
            elif "+" in result_daymaster: 
                rich_result['richnum']-=1
                if gans.day not in rich_result['tgjs']:
                 rich_result['tgjs'].append(gans.day)
            result_timegan=check_dizhi_relationships(dizhi,gans.time,dizhi_gx)
            if "-" in result_timegan:
                rich_result['richnum']+=1
                if gans.time not in rich_result['tgys']:
                 rich_result['tgys'].append(gans.time)
            elif "+" in result_timegan: 
                rich_result['richnum']-=1
                if gans.time not in rich_result['tgjs']:
                 rich_result['tgjs'].append(gans.time)
         elif postion== 2:
            result_monthzhi=check_dizhi_relationships(dizhi,zhis.month,dizhi_gx)
            if "-" in result_monthzhi:
                rich_result['richnum']+=8
                if zhis.month not in rich_result['diys']:
                 rich_result['diys'].append(zhis.month)
                if any(keyword in result_monthzhi for keyword in keywords):
                    rich_result['richnum']+=8 
        
            elif "+" in result_monthzhi: 
                rich_result['richnum']-=8
                if zhis.month not in rich_result['dijs']:
                 rich_result['dijs'].append(zhis.month)

            result_yeargan=check_dizhi_relationships(dizhi,gans.year,dizhi_gx)
            if "-" in result_yeargan:
                rich_result['richnum']+=1
                if gans.year not in rich_result['tgys']:
                 rich_result['tgys'].append(gans.year)
            elif "+" in result_yeargan: 
                rich_result['richnum']-=1
                if gans.year not in rich_result['tgjs']:
                 rich_result['tgjs'].append(gans.year)

            result_yearzhi=check_dizhi_relationships(dizhi,zhis.year,dizhi_gx)
            if "-" in result_yearzhi:
                rich_result['richnum']+=2
                if zhis.year not in rich_result['diys']:
                 rich_result['diys'].append(zhis.year)
                if any(keyword in result_yearzhi for keyword in keywords):
                    rich_result['richnum']+=2
            elif "+" in result_yearzhi: 
                rich_result['richnum']-=2
                if zhis.year not in rich_result['dijs']:
                 rich_result['dijs'].append(zhis.year)

            result_timezhi=check_dizhi_relationships(dizhi,zhis.time,dizhi_gx)
            if "-" in result_timezhi:
                rich_result['richnum']+=6
                if zhis.time not in rich_result['diys']:
                 rich_result['diys'].append(zhis.time)
                if any(keyword in result_timezhi for keyword in keywords):
                    rich_result['richnum']+=6 
            elif "+" in result_timezhi: 
                rich_result['richnum']-=6
                if zhis.time not in rich_result['dijs']:
                 rich_result['dijs'].append(zhis.time)
            result_monthgan=check_dizhi_relationships(dizhi,gans.month,dizhi_gx)
            if "-" in result_monthgan:
                rich_result['richnum']+=4
                if gans.month not in rich_result['diys']:
                 rich_result['tgys'].append(gans.month)
            elif "+" in result_monthgan: 
                rich_result['richnum']-=4
                if gans.month not in rich_result['tgjs']:
                 rich_result['tgjs'].append(gans.month)
            result_daymaster=check_dizhi_relationships(dizhi,gans.day,dizhi_gx)
            if "-" in result_daymaster:
                rich_result['richnum']+=6
                if gans.day not in rich_result['tgys']:
                 rich_result['tgys'].append(gans.day)
            elif "+" in result_daymaster: 
                rich_result['richnum']-=6
                if gans.day not in rich_result['tgjs']:
                 rich_result['tgjs'].append(gans.day)
            result_timegan=check_dizhi_relationships(dizhi,gans.time,dizhi_gx)
            if "-" in result_timegan:
                rich_result['richnum']+=2
                if gans.time not in rich_result['tgys']:
                 rich_result['tgys'].append(gans.time)
            elif "+" in result_timegan: 
                rich_result['richnum']-=2
                if gans.time not in rich_result['tgjs']:
                 rich_result['tgjs'].append(gans.time)
         elif postion== 3:
            result_monthzhi=check_dizhi_relationships(dizhi,zhis.month,dizhi_gx)
            if "-" in result_monthzhi:
                rich_result['richnum']+=4
                if zhis.month not in rich_result['diys']:
                 rich_result['diys'].append(zhis.month)
                if any(keyword in result_monthzhi for keyword in keywords):
                    rich_result['richnum']+=4 
        
            elif "+" in result_monthzhi: 
                rich_result['richnum']-=4
                if zhis.month not in rich_result['dijs']:
                 rich_result['dijs'].append(zhis.month)

            result_yeargan=check_dizhi_relationships(dizhi,gans.year,dizhi_gx)
            if "-" in result_yeargan:
                rich_result['richnum']+=1
                if gans.year not in rich_result['tgys']:
                 rich_result['tgys'].append(gans.year)
            elif "+" in result_yeargan: 
                rich_result['richnum']-=1
                if zhis.year not in rich_result['diys']:
                 rich_result['tgjs'].append(zhis.year)

            result_dayzhi=check_dizhi_relationships(dizhi,zhis.day,dizhi_gx)
            if "-" in result_dayzhi:
                rich_result['richnum']+=6
                if zhis.day not in rich_result['diys']:
                 rich_result['diys'].append(zhis.day)
                if any(keyword in result_dayzhi for keyword in keywords):
                    rich_result['richnum']+=6 
            elif "+" in result_dayzhi: 
                rich_result['richnum']-=6
                if zhis.day not in rich_result['dijs']:
                 rich_result['dijs'].append(zhis.day)

            result_yearzhi=check_dizhi_relationships(dizhi,zhis.year,dizhi_gx)
            if "-" in result_yearzhi:
                rich_result['richnum']+=2
                if zhis.year not in rich_result['diys']:
                 rich_result['diys'].append(zhis.year)
                if any(keyword in result_yearzhi for keyword in keywords):
                    rich_result['richnum']+=2 
            elif "+" in result_yearzhi: 
                rich_result['richnum']-=2
                if zhis.year not in rich_result['dijs']:
                 rich_result['dijs'].append(zhis.year)
            result_monthgan=check_dizhi_relationships(dizhi,gans.month,dizhi_gx)
            if "-" in result_monthgan:
                rich_result['richnum']+=2
                if gans.month not in rich_result['tgys']:
                 rich_result['tgys'].append(gans.month)
            elif "+" in result_monthgan: 
                rich_result['richnum']-=2
                if gans.month not in rich_result['tgjs']:
                 rich_result['tgjs'].append(gans.month)
            result_daymaster=check_dizhi_relationships(dizhi,gans.day,dizhi_gx)
            if "-" in result_daymaster:
                rich_result['richnum']+=2
                if gans.day not in rich_result['tgys']:
                 rich_result['tgys'].append(gans.day)
            elif "+" in result_daymaster: 
                rich_result['richnum']-=2
                if gans.month not in rich_result['tgjs']:
                 rich_result['tgjs'].append(gans.day)
            result_timegan=check_dizhi_relationships(dizhi,gans.time,dizhi_gx)
            if "-" in result_timegan:
                rich_result['richnum']+=4
                if gans.time not in rich_result['tgys']:
                 rich_result['tgys'].append(gans.time)
            elif "+" in result_timegan: 
                rich_result['richnum']-=4
                if gans.time not in rich_result['tgjs']:
                 rich_result['tgjs'].append(gans.time)

    for zhi in rich_result['diys']:
        diysrelationship=get_di_relationship(gans.day,zhi,ten_deities)
        rich_result['team'].append((zhi,diysrelationship))

    for tg in rich_result['tgys']:
        tgrelationship=get_deity_relationship(gans.day,tg,ten_deities)
        rich_result['team'].append((tg,tgrelationship))

    for zhi in rich_result['dijs']:
        diysrelationship=get_di_relationship(gans.day,zhi,ten_deities)
        rich_result['objteam'].append((zhi,diysrelationship))

    for tg in rich_result['tgjs']:
        tgrelationship=get_deity_relationship(gans.day,tg,ten_deities)
        rich_result['objteam'].append((tg,tgrelationship))

    if rich_result['richnum'] >=10 :
       min_summary['事业'].append(("吉",f"{rich_result['richnum']}",rich_summary["吉"])),
    elif rich_result['richnum'] >=20 :
       min_summary['事业'].append(("大吉",f"{rich_result['richnum']}",rich_summary["大吉"])),
    elif rich_result['richnum']<=-5 :
       min_summary['事业'].append(("凶",f"{rich_result['richnum']}",rich_summary["凶"])),
    elif rich_result['richnum']<=-15 :
       min_summary['事业'].append(("大凶",f"{rich_result['richnum']}",rich_summary["大凶"])),
    else:
       min_summary['事业'].append(("平",f"{rich_result['richnum']}",rich_summary["平"])),
    
    min_summary['天干用神']=rich_result['tgys']
    min_summary['地支用神']=rich_result['diys']
    min_summary['天干忌神']=rich_result['tgjs']
    min_summary['地支忌神']=rich_result['dijs']
    min_summary['财富用神']=min_summary['天干用神']
    min_summary['财富用神'] = [min_summary['天干用神'], rich_result.get('diys', '')]  
    return rich_result

def dayun_analysis_f(Gan,Zhi,gender,gans,zhis,min_summary,day):

    # 计算大运
    seq = Gan.index(gans.year)
    if gender=="female":
        if seq % 2 == 0:
         direction = -1
        else:
         direction = 1
    else:
        if seq % 2 == 0:
         direction = 1
        else:
         direction = -1

    dayuns = []
    gan_seq = Gan.index(gans.month)
    zhi_seq = Zhi.index(zhis.month)
    for i in range(12):
        gan_seq += direction
        zhi_seq += direction
        dayuns.append((Gan[gan_seq%10],Zhi[zhi_seq%12]))
    #print(f"大运是{dayuns}")
    min_summary['大运']=dayuns

    birthday = datetime(day.getSolarYear(), day.getSolarMonth(), day.getSolarDay()) 
    count = 0
    for i in range(30):    
        #print(birthday)
        day_ = sxtwl.fromSolar(birthday.year, birthday.month, birthday.day)
        #if day_.hasJieQi() and day_.getJieQiJD() % 2 == 1
        if day_.hasJieQi() and day_.getJieQi() % 2 == 1:
                break
            #break        
        birthday += timedelta(days=direction)
        count += 1

    ages = [(round(count/3 + 10*i), round(int(birthday.year) + 10*i + count//3)) for i in range(12)]  
    min_summary['起运时间']=ages
    #print(f"起运时间是{ages}")


        #判断是否是吉是做功的用神字段，如果是，对应的是什么事情，程度多少
        #判断是否是婚姻的用神字段，如果是
        #判断是非是健康的用神字段
        #判断是是否是
        # for zhi in min_summary['地支忌神']:    
        #   result_zhi = check_dizhi_relationships(zhi,yunZhi,Dizhi_gx)
        #   result_gan = check_dizhi_relationships(zhi,yunGan,Dizhi_gx)
        #   if '-' in  result_zhi and '-' in result_gan:
        #      dayun_rich+=3           
        #   if '-' in  result_zhi and '+' in result_gan:
        #      dayun_rich+=1
        #   if '+' in  result_zhi and '-' in result_gan:
        #      dayun_rich-=1
        #   if '+' in result_zhi and '+' in result_gan:
        #      dayun_rich-=3
           
        # keywords={"六合","冲","害","刑","暗","三合","三会","合","克"}
        # if any(keyword in result_zhi for keyword in keywords) and '-' in  result_zhi:
        #      dayun_rich+=2
        # rich_result['yun_ys'].append((yunGan+yunZhi,dayun_rich))   
           
    # print(f"{rich_result['yun_ys']}")
    return dayuns

def find_key_by_value(dictionary, value):
    for key, val in dictionary.items():
        if val == value:
            return key
    return None

def when_zinv_f(Gan,Zhi,gender,gans,zhis,min_summary,day):
    fumu=min_summary["儿女"]
    dayuns=min_summary["大运"]
    ages=min_summary["起运时间"]
    start=ages[0][0]
    marragetime=""
    birthday = datetime(day.getSolarYear(), day.getSolarMonth(), day.getSolarDay()) 
    # prints birthday
    count = 0
    gan_seq = Gan.index(gans.year)
    zhi_seq = Zhi.index(zhis.year)
    start_year=birthday.year+ages[0][0]
    for i in range(8):
      for a in range(10):   
            yearGan=Gan[(gan_seq+start)%10]
            yearZhi=Zhi[(zhi_seq+start)%12]
            yunGan=dayuns[i][0]
            yunZhi=dayuns[i][1]
            love=zinv_judge(yunGan,yunZhi,yearGan,yearZhi,start_year,birthday,gender,gans,zhis,min_summary)
            min_summary["儿女"].append((start_year,love))
            start_year+=1
            start+=1
    return

def zinv_judge(yunGan,yunZhi,yearGan,yearZhi,year,birthday,gender,gans,zhis,min_summary):
        love=0
        love_reason=[]
        yungan_shens=[]
        for i in Branch_hidden_stems[yunZhi]:
         yungan_shens.append(i)
        yungan_shens.append(yunGan)
        yunzhi_shens=[]
        yunzhi_shens.append(Gan_Zhi[yunGan])

        yeargan_shens=[]
        for i in Branch_hidden_stems[yearZhi]:
         yeargan_shens.append(i)
        yeargan_shens.append(yearGan)
        yearzhi_shens=[]
        yearzhi_shens.append(Gan_Zhi[yearGan])
        yearzhi_shens.append(yearZhi)

        love_gong=min_summary['儿子用神'][0]['宫']
        love_xin=min_summary['儿子用神'][1]['星']
        love_xin.append(min_summary['女儿用神'][1]['星'])

        yun_appear_gong=[element for element in love_gong if element in yunzhi_shens]
        yun_appear_xin=[element for element in love_xin if element in yungan_shens] 
        
        year_appear_gong=[element for element in love_gong if element in yearzhi_shens]
        year_appear_xin=[element for element in love_xin if element in yeargan_shens] 
        
        if yun_appear_gong:
            for item in yun_appear_gong:
             # print("yun love gong appears")
              love+=2
              love_reason.append("宫出现，且旺相+2")
        if yun_appear_xin:
            for item in yun_appear_xin:
              love+=10
              love_reason.append("星出现，且旺相+2")
        
        if year_appear_gong:
            for item in year_appear_gong:
             # print("year love gong appears")
              love+=2
              love_reason.append("宫出现，且旺相+2")
        if year_appear_xin:
            for item in year_appear_xin:
              love+=10
              love_reason.append("星出现，且旺相+2")  

        for gongi in love_gong:
            #大运打分
          for gong in gongi:
            if Zhi_atts[gong]["害"] in yunzhi_shens:
                love-=10
            if Zhi_atts[Zhi_atts[gong]["六"]]["害"] in yunzhi_shens:
                love-=10
            for he in Zhi_atts[gong]["合"]:
                if Zhi_atts[he]["害"] in yunzhi_shens:
                    love-=10   
            for hui in Zhi_atts[gong]["会"]:
                if Zhi_atts[hui]["害"] in yunzhi_shens:
                    love-=10  
            if Zhi_atts[gong]["墓"] in yunzhi_shens:
                love-=5
                if Mu[Zhi_atts[gong]["墓"]]["闭"] in yunzhi_shens:
                    love-=10
                if Mu[Zhi_atts[gong]["墓"]]["害"] in yunzhi_shens:
                    love-=10
                if Mu[Zhi_atts[gong]["墓"]]["冲"] in yunzhi_shens:
                    love+=5
            #流年打分
            if Zhi_atts[gong]["害"] in yearzhi_shens:
                love-=10
            if Zhi_atts[Zhi_atts[gong]["六"]]["害"] in yearzhi_shens:
                love-=10
            for he in Zhi_atts[gong]["合"]:
                if Zhi_atts[he]["害"] in yearzhi_shens:
                    love-=10   
            for hui in Zhi_atts[gong]["会"]:
                if Zhi_atts[hui]["害"] in yearzhi_shens:
                    love-=10  
            if Zhi_atts[gong]["墓"] in yearzhi_shens:
                love-=5
                if Mu[Zhi_atts[gong]["墓"]]["闭"] in yearzhi_shens:
                    love-=10
                if Mu[Zhi_atts[gong]["墓"]]["害"] in yearzhi_shens:
                    love-=10
                if Mu[Zhi_atts[gong]["墓"]]["冲"] in yearzhi_shens:
                    love+=5
        #print(f"{year} {love}")
        return love

def when_bro_f(Gan,Zhi,gender,gans,zhis,min_summary,day):
    fumu=min_summary["兄妹"]
    dayuns=min_summary["大运"]
    ages=min_summary["起运时间"]
    start=ages[0][0]
    marragetime=""
    birthday = datetime(day.getSolarYear(), day.getSolarMonth(), day.getSolarDay()) 
    # prints birthday
    count = 0
    gan_seq = Gan.index(gans.year)
    zhi_seq = Zhi.index(zhis.year)
    start_year=birthday.year+ages[0][0]
    for i in range(8):
      for a in range(10):   
            yearGan=Gan[(gan_seq+start)%10]
            yearZhi=Zhi[(zhi_seq+start)%12]
            yunGan=dayuns[i][0]
            yunZhi=dayuns[i][1]
            love=bro_judge(yunGan,yunZhi,yearGan,yearZhi,start_year,birthday,gender,gans,zhis,min_summary)
           # print(f"brobrobro{start_year},{love}")
            min_summary["兄妹"].append((start_year,love))
            start_year+=1
            start+=1
    return

def bro_judge(yunGan,yunZhi,yearGan,yearZhi,year,birthday,gender,gans,zhis,min_summary):
        love=0
        love_reason=[]
        yungan_shens=[]
        for i in Branch_hidden_stems[yunZhi]:
         yungan_shens.append(i)
        yungan_shens.append(yunGan)
        yunzhi_shens=[]
        yunzhi_shens.append(Gan_Zhi[yunGan])

        yeargan_shens=[]
        for i in Branch_hidden_stems[yearZhi]:
         yeargan_shens.append(i)
        yeargan_shens.append(yearGan)
        yearzhi_shens=[]
        yearzhi_shens.append(Gan_Zhi[yearGan])
        yearzhi_shens.append(yearZhi)

        love_gong=min_summary['兄妹用神'][0]['宫']
        love_xin=min_summary['兄妹用神'][1]['星']

        yun_appear_gong=[element for element in love_gong if element in yunzhi_shens]
        yun_appear_xin=[element for element in love_xin if element in yungan_shens] 
        
        year_appear_gong=[element for element in love_gong if element in yearzhi_shens]
        year_appear_xin=[element for element in love_xin if element in yeargan_shens] 
        
        for gongi in love_gong:
            #大运打分
          for gong in gongi:
            if Zhi_atts[gong]["害"] in yunzhi_shens:
                love-=10
            if Zhi_atts[Zhi_atts[gong]["六"]]["害"] in yunzhi_shens:
                love-=10
            for he in Zhi_atts[gong]["合"]:
                if Zhi_atts[he]["害"] in yunzhi_shens:
                    love-=10   
            for hui in Zhi_atts[gong]["会"]:
                if Zhi_atts[hui]["害"] in yunzhi_shens:
                    love-=10  
            if Zhi_atts[gong]["墓"] in yunzhi_shens:
                love-=5
                if Mu[Zhi_atts[gong]["墓"]]["闭"] in yunzhi_shens:
                    love-=10
                if Mu[Zhi_atts[gong]["墓"]]["害"] in yunzhi_shens:
                    love-=10
                if Mu[Zhi_atts[gong]["墓"]]["冲"] in yunzhi_shens:
                    love+=5
            #流年打分
            if Zhi_atts[gong]["害"] in yearzhi_shens:
                love-=10
            if Zhi_atts[Zhi_atts[gong]["六"]]["害"] in yearzhi_shens:
                love-=10
            for he in Zhi_atts[gong]["合"]:
                if Zhi_atts[he]["害"] in yearzhi_shens:
                    love-=10   
            for hui in Zhi_atts[gong]["会"]:
                if Zhi_atts[hui]["害"] in yearzhi_shens:
                    love-=10  
            if Zhi_atts[gong]["墓"] in yearzhi_shens:
                love-=5
                if Mu[Zhi_atts[gong]["墓"]]["闭"] in yearzhi_shens:
                    love-=10
                if Mu[Zhi_atts[gong]["墓"]]["害"] in yearzhi_shens:
                    love-=10
                if Mu[Zhi_atts[gong]["墓"]]["冲"] in yearzhi_shens:
                    love+=5

        # for xin in love_xin:
        #     for item in xin:
        #         if item in Gan:
        #             if item in min_summary["墓"]["食伤库"] or item in min_summary["墓"]["官杀库"]:
        #                 if item==yunGan:
        #                     love-=10
        #                 if item==yearGan:
        #                     love-=10
        #                 if item in yungan_shens:
        #                     love-=5
        #                 if item in yeargan_shens:
        #                     love-=5
        #             if Ten_deities[item]["克"]==yunGan:
        #                 love-=3   
        #             if Ten_deities[item]["克"]==yearGan:
        #                 love-=3     
        #             if Ten_deities[item]["合"]==yunGan:
        #                 love-=2   
        #             if Ten_deities[item]["合"]==yearGan:
        #                 love-=2
        #         if item in Zhi:
        #             if Zhi_atts[item]["害"] in yearzhi_shens:
        #                 love-=10
        #             if Zhi_atts[Zhi_atts[item]["六"]]["害"] in yearzhi_shens:
        #                 love-=10
        #             for he in Zhi_atts[item]["合"]:
        #                 if Zhi_atts[he]["害"] in yearzhi_shens:
        #                     love-=10   
        #             for hui in Zhi_atts[item]["会"]:
        #                 if Zhi_atts[hui]["害"] in yearzhi_shens:
        #                     love-=10  
        #             if Zhi_atts[item]["墓"] in yearzhi_shens:
        #                 love-=5
        #                 if Mu[Zhi_atts[item]["墓"]]["闭"] in yearzhi_shens:
        #                     love-=10
        #                 if Mu[Zhi_atts[item]["墓"]]["害"] in yearzhi_shens:
        #                     love-=10
        #                 if Mu[Zhi_atts[item]["墓"]]["冲"] in yearzhi_shens:
        #                     love+=5   

        #             if Zhi_atts[item]["害"] in yunzhi_shens:
        #                 love-=10
        #             if Zhi_atts[Zhi_atts[item]["六"]]["害"] in yunzhi_shens:
        #                 love-=10
        #             for he in Zhi_atts[item]["合"]:
        #                 if Zhi_atts[he]["害"] in yunzhi_shens:
        #                     love-=10   
        #             for hui in Zhi_atts[item]["会"]:
        #                 if Zhi_atts[hui]["害"] in yunzhi_shens:
        #                     love-=10  
        #             if Zhi_atts[item]["墓"] in yunzhi_shens:
        #                 love-=5
        #                 if Mu[Zhi_atts[item]["墓"]]["闭"] in yunzhi_shens:
        #                     love-=10
        #                 if Mu[Zhi_atts[item]["墓"]]["害"] in yunzhi_shens:
        #                     love-=10
        #                 if Mu[Zhi_atts[item]["墓"]]["冲"] in yunzhi_shens:
        #                     love+=5   

        #             if   item in min_summary["墓"]["食伤库"] or item in min_summary["墓"]["官库"] :
        #                 if item==yunZhi:
        #                     love-=10
        #                 if item==yearZhi:
        #                     love-=10
        #                 if item in yunzhi_shens:
        #                     love-=5
        #                 if item in yearzhi_shens:
        #                     love-=5 
                    
        #             if item in ["申","辰"] and all(itemi in [zhis[0],zhis[1],zhis[2],zhis[3]] for itemi in ["申","子","辰"]):
        #                 love-=8
            
        #             if item in ["巳","丑"] and all(itemi in [zhis[0],zhis[1],zhis[2],zhis[3]] for itemi in ["巳","酉","丑"]):
        #                 love-=8
                      
        #             if item in ["亥","未"] and all(itemi in [zhis[0],zhis[1],zhis[2],zhis[3]] for itemi in ["亥","卯","未"]):
        #                 love-=8
                     
        #             if item in ["寅","戌"] and all(itemi in [zhis[0],zhis[1],zhis[2],zhis[3]] for itemi in ["寅","卯","戌"]):
        #                 love-=8
                    

        #print(f"{year} {love}")
        return love

def when_healthy_f(Gan,Zhi,gender,gans,zhis,min_summary,day):
    fumu=min_summary["健康"]
    dayuns=min_summary["大运"]
    ages=min_summary["起运时间"]
    start=ages[0][0]
    marragetime=""
    birthday = datetime(day.getSolarYear(), day.getSolarMonth(), day.getSolarDay()) 
    # prints birthday
    count = 0
    gan_seq = Gan.index(gans.year)
    zhi_seq = Zhi.index(zhis.year)
    start_year=birthday.year+ages[0][0]
    for i in range(8):
      for a in range(10):   
            yearGan=Gan[(gan_seq+start)%10]
            yearZhi=Zhi[(zhi_seq+start)%12]
            yunGan=dayuns[i][0]
            yunZhi=dayuns[i][1]
            love=healthy_judge(yunGan,yunZhi,yearGan,yearZhi,start_year,birthday,gender,gans,zhis,min_summary)
            #print(f"healthy{start_year},{love}")
            min_summary["健康"].append((start_year,love))
            start_year+=1
            start+=1
    return

def healthy_judge(yunGan,yunZhi,yearGan,yearZhi,year,birthday,gender,gans,zhis,min_summary):
        love=0
        love_reason=[]
        yungan_shens=[]
        for i in Branch_hidden_stems[yunZhi]:
         yungan_shens.append(i)
        yungan_shens.append(yunGan)
        yunzhi_shens=[]
        yunzhi_shens.append(Gan_Zhi[yunGan])

        yeargan_shens=[]
        for i in Branch_hidden_stems[yearZhi]:
         yeargan_shens.append(i)
        yeargan_shens.append(yearGan)
        yearzhi_shens=[]
        yearzhi_shens.append(Gan_Zhi[yearGan])
        yearzhi_shens.append(yearZhi)

        love_gong=min_summary['健康用神']
        #print(f"heeeee {love_gong}")
    
        # yun_appear_gong=[element for element in love_gong if element in yunzhi_shens]
        # # yun_appear_xin=[element for element in love_xin if element in yungan_shens] 
        
        # year_appear_gong=[element for element in love_gong if element in yearzhi_shens]
        # # year_appear_xin=[element for element in love_xin if element in yeargan_shens] 
        
        for gongi in love_gong:
            #大运打分
          for gong in gongi:
            if Zhi_atts[gong]["害"] in yunzhi_shens:
                love-=10
            if Zhi_atts[Zhi_atts[gong]["六"]]["害"] in yunzhi_shens:
                love-=10
            for he in Zhi_atts[gong]["合"]:
                if Zhi_atts[he]["害"] in yunzhi_shens:
                    love-=10   
            for hui in Zhi_atts[gong]["会"]:
                if Zhi_atts[hui]["害"] in yunzhi_shens:
                    love-=10  
            if Zhi_atts[gong]["墓"] in yunzhi_shens:
                love-=5
                if Mu[Zhi_atts[gong]["墓"]]["闭"] in yunzhi_shens:
                    love-=10
                if Mu[Zhi_atts[gong]["墓"]]["害"] in yunzhi_shens:
                    love-=10
                if Mu[Zhi_atts[gong]["墓"]]["冲"] in yunzhi_shens:
                    love+=5
            #流年打分
            if Zhi_atts[gong]["害"] in yearzhi_shens:
                love-=10
            if Zhi_atts[Zhi_atts[gong]["六"]]["害"] in yearzhi_shens:
                love-=10
            for he in Zhi_atts[gong]["合"]:
                if Zhi_atts[he]["害"] in yearzhi_shens:
                    love-=10   
            for hui in Zhi_atts[gong]["会"]:
                if Zhi_atts[hui]["害"] in yearzhi_shens:
                    love-=10  
            if Zhi_atts[gong]["墓"] in yearzhi_shens:
                love-=5
                if Mu[Zhi_atts[gong]["墓"]]["闭"] in yearzhi_shens:
                    love-=10
                if Mu[Zhi_atts[gong]["墓"]]["害"] in yearzhi_shens:
                    love-=10
                if Mu[Zhi_atts[gong]["墓"]]["冲"] in yearzhi_shens:
                    love+=5
           
            if gong in ["申","辰"] and all(itemi in [zhis[0],zhis[1],zhis[2],zhis[3]] for itemi in ["申","子","辰"]):
                        love-=8
            
            if gong in ["巳","丑"] and all(itemi in [zhis[0],zhis[1],zhis[2],zhis[3]] for itemi in ["巳","酉","丑"]):
                        love-=8
                      
            if gong in ["亥","未"] and all(itemi in [zhis[0],zhis[1],zhis[2],zhis[3]] for itemi in ["亥","卯","未"]):
                        love-=8
                     
            if gong in ["寅","戌"] and all(itemi in [zhis[0],zhis[1],zhis[2],zhis[3]] for itemi in ["寅","卯","戌"]):
                        love-=8

        #print(f"{year} {love}")
        return love


def when_rich_f(Gan,Zhi,gender,gans,zhis,min_summary,day):
    # fumu=min_summary["事业"]
    dayuns=min_summary["大运"]
    ages=min_summary["起运时间"]
    start=ages[0][0]
    marragetime=""
    birthday = datetime(day.getSolarYear(), day.getSolarMonth(), day.getSolarDay()) 
    # prints birthday
    count = 0
    gan_seq = Gan.index(gans.year)
    zhi_seq = Zhi.index(zhis.year)
    start_year=birthday.year+ages[0][0]
    for i in range(8):
      for a in range(10):   
            yearGan=Gan[(gan_seq+start)%10]
            yearZhi=Zhi[(zhi_seq+start)%12]
            yunGan=dayuns[i][0]
            yunZhi=dayuns[i][1]
            love=rich_judge(yunGan,yunZhi,yearGan,yearZhi,start_year,birthday,gender,gans,zhis,min_summary)
            #print(f"rich{start_year},{love}")
            if "事业" not in min_summary:
                 min_summary["事业"] = [] 
            #print(min_summary["事业"])
            min_summary["事业"].append((start_year,love))
            start_year+=1
            start+=1
    return

def rich_judge(yunGan,yunZhi,yearGan,yearZhi,year,birthday,gender,gans,zhis,min_summary):
        love=0
        love_reason=[]
        yungan_shens=[]
        for i in Branch_hidden_stems[yunZhi]:
         yungan_shens.append(i)
        yungan_shens.append(yunGan)
        yunzhi_shens=[]
        yunzhi_shens.append(Gan_Zhi[yunGan])

        yeargan_shens=[]
        for i in Branch_hidden_stems[yearZhi]:
         yeargan_shens.append(i)
        yeargan_shens.append(yearGan)
        yearzhi_shens=[]
        yearzhi_shens.append(Gan_Zhi[yearGan])
        yearzhi_shens.append(yearZhi)

        love_gong=min_summary['被制地支']
        #print(f"heeeee {love_gong}")
    
        # yun_appear_gong=[element for element in love_gong if element in yunzhi_shens]
        # # yun_appear_xin=[element for element in love_xin if element in yungan_shens] 
        
        # year_appear_gong=[element for element in love_gong if element in yearzhi_shens]
        # # year_appear_xin=[element for element in love_xin if element in yeargan_shens] 
        
        if love_gong:
         for index,gongi in love_gong:
            #大运打分
          for gong in gongi:
           if gong:
            if Zhi_atts[gong]["害"] in yunzhi_shens:
                love-=10
            if Zhi_atts[Zhi_atts[gong]["六"]]["害"] in yunzhi_shens:
                love-=10
            for he in Zhi_atts[gong]["合"]:
                if Zhi_atts[he]["害"] in yunzhi_shens:
                    love-=10   
            for hui in Zhi_atts[gong]["会"]:
                if Zhi_atts[hui]["害"] in yunzhi_shens:
                    love-=10  
            if Zhi_atts[gong]["墓"] in yunzhi_shens:
                love-=5
                if Mu[Zhi_atts[gong]["墓"]]["闭"] in yunzhi_shens:
                    love-=10
                if Mu[Zhi_atts[gong]["墓"]]["害"] in yunzhi_shens:
                    love-=10
                if Mu[Zhi_atts[gong]["墓"]]["冲"] in yunzhi_shens:
                    love+=5
            #流年打分
            if Zhi_atts[gong]["害"] in yearzhi_shens:
                love-=10
            if Zhi_atts[Zhi_atts[gong]["六"]]["害"] in yearzhi_shens:
                love-=10
            for he in Zhi_atts[gong]["合"]:
                if Zhi_atts[he]["害"] in yearzhi_shens:
                    love-=10   
            for hui in Zhi_atts[gong]["会"]:
                if Zhi_atts[hui]["害"] in yearzhi_shens:
                    love-=10  
            if Zhi_atts[gong]["墓"] in yearzhi_shens:
                love-=5
                if Mu[Zhi_atts[gong]["墓"]]["闭"] in yearzhi_shens:
                    love-=10
                if Mu[Zhi_atts[gong]["墓"]]["害"] in yearzhi_shens:
                    love-=10
                if Mu[Zhi_atts[gong]["墓"]]["冲"] in yearzhi_shens:
                    love+=5
           
            if gong in ["申","辰"] and all(itemi in [zhis[0],zhis[1],zhis[2],zhis[3]] for itemi in ["申","子","辰"]):
                        love-=8
            
            if gong in ["巳","丑"] and all(itemi in [zhis[0],zhis[1],zhis[2],zhis[3]] for itemi in ["巳","酉","丑"]):
                        love-=8
                      
            if gong in ["亥","未"] and all(itemi in [zhis[0],zhis[1],zhis[2],zhis[3]] for itemi in ["亥","卯","未"]):
                        love-=8
                     
            if gong in ["寅","戌"] and all(itemi in [zhis[0],zhis[1],zhis[2],zhis[3]] for itemi in ["寅","卯","戌"]):
                        love-=8

        #print(f"{year} {love}")
        return love

def rich_year_judge(year,gans,zhis,min_summary):
    rich_score,reason,i=rich_year_judge_dd(year,gans,zhis,min_summary)
    if rich_score >=10 :
              min_summary['今年情况'].append(("吉",rich_score,rich_year["吉"],reason)),
    elif rich_score >=20 :
                min_summary['今年情况'].append(("大吉",rich_score,rich_year["大吉"],reason)),
    elif rich_score<=-5 :
                min_summary['今年情况'].append(("凶",rich_score,rich_year["凶"],reason)),
    elif rich_score<=-15 :
                min_summary['今年情况'].append(("大凶",rich_score,rich_year["大凶"],reason)),
    else:
                min_summary['今年情况'].append(("平",rich_score,rich_year["平"],reason)),
    min_summary["当前大运"]=min_summary["大运情况"][i]  

    rich_score,reason,i=rich_year_judge_dd(year-1,gans,zhis,min_summary)
    if rich_score >=10 :
              min_summary['去年情况'].append(("吉",rich_score,rich_year["吉"],reason)),
    elif rich_score >=20 :
                min_summary['去年情况'].append(("大吉",rich_score,rich_year["大吉"],reason)),
    elif rich_score<=-5 :
                min_summary['去年情况'].append(("凶",rich_score,rich_year["凶"],reason)),
    elif rich_score<=-15 :
                min_summary['去年情况'].append(("大凶",rich_score,rich_year["大凶"],reason)),
    else:
                min_summary['去年情况'].append(("平",rich_score,rich_year["平"],reason)),
    min_summary["去年大运"]=min_summary["大运情况"][i]  


    rich_score,reason,i=rich_year_judge_dd(year+1,gans,zhis,min_summary)
    if rich_score >=10 :
              min_summary['明年情况'].append(("吉",rich_score,rich_year["吉"],reason)),
    elif rich_score >=20 :
                min_summary['明年情况'].append(("大吉",rich_score,rich_year["大吉"],reason)),
    elif rich_score<=-5 :
                min_summary['明年情况'].append(("凶",rich_score,rich_year["凶"],reason)),
    elif rich_score<=-15 :
                min_summary['明年情况'].append(("大凶",rich_score,rich_year["大凶"],reason)),
    else:
                min_summary['明年情况'].append(("平",rich_score,rich_year["平"],reason)),
    min_summary["明年大运"]=min_summary["大运情况"][i]  


def rich_month_judge(year,gans,zhis,min_summary):
   rich_monthi=rich_month_judge_dd(2024,gans,zhis,min_summary)
   min_summary["今年详细情况"]=rich_monthi
   rich_monthl=rich_month_judge_dd(2023,gans,zhis,min_summary)
   min_summary["去年详细情况"]=rich_monthl
   rich_monthn=rich_month_judge_dd(2025,gans,zhis,min_summary)
   min_summary["明年详细情况"]=rich_monthn


def rich_month_judge_dd(year,gans,zhis,min_summary):   
    day = sxtwl.fromSolar(year,2,11)
    yTG = day.getYearGZ()
    yearGan=Gan[yTG.tg]
    yearZhi=Zhi[yTG.dz]
    #print(f"{year} {yearGan} {yearZhi}")
    firtMonthGan=Month_ganzhi[yearGan]
    seqG=Gan.index(firtMonthGan)
    seqZ=2;
    rich_monthi=[]
    result_zhi=[]
    month= ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]
    for i in range(12):
        rich=0
        for zhi in min_summary["地支忌神"]:    
          result_zhi = check_dizhi_relationships(zhi,Zhi[seqZ%12],Dizhi_gx)
          result_gan = check_dizhi_relationships(zhi,Gan[seqG%10],Dizhi_gx)
          if '-' in  result_zhi and '-' in result_gan:
             rich+=3
                      
          if '-' in  result_zhi and '+' in result_gan:
             rich+=1
             
          if '+' in  result_zhi and '-' in result_gan:
             rich-=1
                
          if '+' in result_zhi and '+' in result_gan:
             rich-=3
              
           
        keywords={"六合","冲","害","刑","暗","三合","三会","合","克"}
        if result_zhi:
            if any(keyword in result_zhi for keyword in keywords) and '-' in  result_zhi:
                rich+=2

            if rich >=2 :
                rich_monthi.append((f"{month[i]}:{Gan[seqG%10]}{Zhi[seqZ%12]}","吉",rich,rich_month[month[i]]["吉"])),
            elif rich >=5 :
                    rich_monthi.append((f"{month[i]}:{Gan[seqG%10]}{Zhi[seqZ%12]}","大吉",rich,rich_month[month[i]]["大吉"])),
            elif rich<=0 :
                rich_monthi.append((f"{month[i]}:{Gan[seqG%10]}{Zhi[seqZ%12]}","凶",rich,rich_month[month[i]]["凶"])),
            elif rich<=-3 :
                    rich_monthi.append((f"{month[i]}:{Gan[seqG%10]}{Zhi[seqZ%12]}","大凶",rich,rich_month[month[i]]["大凶"])),
            else:
                    rich_monthi.append((f"{month[i]}:{Gan[seqG%10]}{Zhi[seqZ%12]}","平",rich,rich_month[month[i]]["平"])),
   
        seqG+=1
        seqZ+=1  
    #print(f"{year} {yearGan} {yearZhi} {rich_monthi}")
    return rich_monthi

       
                  

def rich_year_judge_dd(year,gans,zhis,min_summary):
    #首先找到大运干支
    data=min_summary["起运时间"]
    for i in range(len(data) - 1):
        if data[i][1] <= year < data[i + 1][1]:
            break # Return the group interval (1-indexed)
    yunGan=min_summary["大运"][i][0]
    yunZhi=min_summary["大运"][i][1]
    gan,zhi,x,yunscore,reason,y=min_summary["大运情况"][i]
   # print(f"yunyunyunyunscore{yunscore}")
    yunscore=int(yunscore)
    rich_score=int(yunscore)
   # print(f"yunscore:{yunscore} richscore: {rich_score}")
    good=[]
    day = sxtwl.fromSolar(year,2,11)
    yTG = day.getYearGZ()
    yearGan=Gan[yTG.tg]
    yearZhi=Zhi[yTG.dz]
   
    for zgtype,des in min_summary["做功"]:
        if zgtype in ("三阳制阴","阳制阴","贼捕阴制阳","木火阳一气"):
           good.append("阳")
        if zgtype in ("三阴制阳","阴制阳","贼捕阳制阴","金水阴一气"):
           good.append("阴")
        if zgtype in ("印化官杀"):
           good.append("化")
        if zgtype in ("食伤生财"):
           good.append("生")
        if zgtype in ("入墓"):
           good.append("墓")
        if zgtype in ("年时贯穿"):
           good.append("贯")
    
    if tgdz_yin_yang[yearZhi] in good: 
       rich_score+=10
       reason.append(f"{tgdz_yin_yang[yearZhi]}{yearZhi}流年到，为事业吉运")
       if "+" in Dizhi_gx[yearZhi][yearGan]:
          rich_score+=2
          reason.append(f"流年天干地支正向作用，为事业吉运")
          if "合" in Dizhi_gx[yearZhi][yearGan]:
             rich_score+=4
             reason.append(f"流年天干地支合，为事业吉运")
          if "生" in Dizhi_gx[yearZhi][yearGan]:
             rich_score+=2
             reason.append(f"流年地支生天干，为事业吉运")
          if "被生" in Dizhi_gx[yearZhi][yearGan]:
             rich_score+=2
             reason.append(f"流年天干生地支，为事业吉运")
          if "害" in Dizhi_gx[yearZhi][yearGan]:
             rich_score-=2
             reason.append(f"流年天干地支相害，相害会应凶，要多加注意")
       if "-" in Dizhi_gx[yearZhi][yearGan]:
          rich_score-=2
          reason.append(f"流年天干地支反向作用")
          if "害" in Dizhi_gx[yearZhi][yearGan]:
             rich_score-=6
             reason.append(f"流年天干地支相害应凶，要多加注意")
          if "合" in Dizhi_gx[yearZhi][yearGan]:
             rich_score-=4
             reason.append(f"流年天干地支相合减力较大，要多加注意")
          if "克" in Dizhi_gx[yearZhi][yearGan]:
             rich_score-=6
             reason.append(f"流年天干地支克减力较大天干虚透，要多加注意")
          if "被克" in Dizhi_gx[yearZhi][yearGan]:
             rich_score-=3
             reason.append(f"流年天干地支克减力较大，要多加注意")
          
          for i,zhi in  min_summary["被制地支"]:
             if "-" in Dizhi_gx[zhi][yearZhi]:
                rich_score+=5
                reason.append(f"流年制地支有力，事业运吉")
                if "合" in Dizhi_gx[zhi][yearZhi]:
                 rich_score+=5
                 reason.append(f"流年合制地支非常有力，事业运吉")
                if "冲" in Dizhi_gx[zhi][yearZhi]:
                 rich_score+=6
                 reason.append(f"流年冲制地支非常有力，事业运吉")
                if "害" in Dizhi_gx[zhi][yearZhi]:
                 rich_score+=3
                 reason.append(f"流年穿害制地支非常有力，事业运吉，但要注意健康及六亲健康")
                if "会" in Dizhi_gx[zhi][yearZhi]:
                 rich_score+=3
                 reason.append(f"流年三会制地支非常有力，事业运吉，但要注意健康及六亲健康")
                if "墓" in Dizhi_gx[zhi][yearZhi]:
                 rich_score+=3
                 reason.append(f"流年墓制地支非常有力，事业运吉，但要注意健康及六亲健康")
             if "+" in Dizhi_gx[zhi][yearZhi]:
                rich_score-=5
                reason.append(f"流年为被制地支增力，事业运不吉")
                if "合" in Dizhi_gx[zhi][yearZhi]:
                 rich_score-=5
                 reason.append(f"流年合为被制地支增力，事业运不吉")
                if "冲" in Dizhi_gx[zhi][yearZhi]:
                 rich_score-=6
                 reason.append(f"流年冲为被制地支增力，事业运不吉")
                if "害" in Dizhi_gx[zhi][yearZhi]:
                 rich_score-=8
                 reason.append(f"流年害为被制地支增力，事业运不吉，要多加注意")
                if "会" in Dizhi_gx[zhi][yearZhi]:
                 rich_score-=3
                 reason.append(f"流年三会为被制地支增力，事业运不吉")
                if "墓" in Dizhi_gx[zhi][yearZhi]:
                 rich_score-=3
                 reason.append(f"流年墓库为被制地支增力，事业运不吉")  
          for i,zhi in  min_summary["被制天干"]:
           if "-" in Dizhi_gx[yearZhi][zhi]:
                rich_score+=5
                reason.append(f"流年制天干有力，事业运吉")
                if "合" in Dizhi_gx[yearZhi][zhi]:
                 rich_score+=5
                 reason.append(f"流年合制天干非常有力，事业运吉")
                if "冲" in Dizhi_gx[yunZhi][zhi]:
                 rich_score+=6
                 reason.append(f"流年冲制天干非常有力，事业运吉")
                if "害" in Dizhi_gx[yearZhi][zhi]:
                 rich_score+=3
                 reason.append(f"流年穿害制天干非常有力，事业运吉，但要注意健康及六亲健康")
                if "会" in Dizhi_gx[yearZhi][zhi]:
                 rich_score+=3
                 reason.append(f"流年三会制天干非常有力，事业运吉，但要注意健康及六亲健康")
                if "墓" in Dizhi_gx[yearZhi][zhi]:
                 rich_score+=3
                 reason.append(f"流年墓制天干非常有力，事业运吉，但要注意健康及六亲健康")
           if "+" in Dizhi_gx[yearZhi][zhi]:
                rich_score-=5
                reason.append(f"流年为被制天干增力，事业运不吉")
                if "合" in Dizhi_gx[yearZhi][zhi]:
                 rich_score-=5
                 reason.append(f"流年合为被制天干增力，事业运不吉")
                if "冲" in Dizhi_gx[yearZhi][zhi]:
                 rich_score-=6
                 reason.append(f"流年冲为被制天干增力，事业运不吉")
                if "害" in Dizhi_gx[yearZhi][zhi]:
                 rich_score-=8
                 reason.append(f"流年害为被制天干增力，事业运不吉，要多加注意")
                if "会" in Dizhi_gx[yearZhi][zhi]:
                 rich_score-=3
                 reason.append(f"流年三会为被制天干增力，事业运不吉")
                if "墓" in Dizhi_gx[yearZhi][zhi]:
                 rich_score-=3
                 reason.append(f"流年墓库为被制天干增力，事业运不吉")
           if "-" in Ten_deities[yearGan][zhi]:
                rich_score+=5
                reason.append(f"流年制天干有力，事业运吉")
                if "合" in Ten_deities[yearGan][zhi]:
                 rich_score+=5
                 reason.append(f"流年合制天干非常有力，事业运吉")
           if "+" in Ten_deities[yearGan][zhi]:
                rich_score-=5
                reason.append(f"流年为被制天干增力，事业运不吉")
                if "合" in Ten_deities[yearGan][zhi]:
                 rich_score-=5
                 reason.append(f"流年合为被制天干增力，事业运不吉")

    elif "化" in good:
       if Ten_deities[gans[2]][yearGan] in ("印","枭"):
          #print(f"richscore is {rich_score}")
          rich_score+=5
          reason.append(f"大运进入印化官杀，事业运吉")
       for cagan in Branch_hidden_stems[yearZhi]:
          if Ten_deities[gans[2]][cagan] in ("印","枭"):
           rich_score+=3
           reason.append(f"大运地支含印枭，进入印化官杀，事业运吉")
          if Ten_deities[gans[2]][cagan] in ("官","杀"):
           rich_score+=3
           reason.append(f"大运地支含官杀，进入印化官杀，事业运吉")

    elif "生" in good:
        if Ten_deities[gans[2]][yunGan] in ("食","伤"):
          rich_score+=5
          reason.append(f"大运进入食伤生财，事业运吉")
        for cagan in Branch_hidden_stems[yunZhi]:
          if Ten_deities[gans[2]][cagan] in ("食","伤"):
           rich_score+=3
           reason.append(f"大运地支含食伤，进入印化官杀，事业运吉")
          if Ten_deities[gans[2]][cagan] in ("财","才"):
           rich_score+=3
           reason.append(f"大运地支含正偏财，进入印化官杀，事业运吉")  
    
    else:
       rich_score-=10
       reason.append(f"{tgdz_yin_yang[yearZhi]}{yearZhi}流年到，为事业反运")
       if "+" in Dizhi_gx[yearZhi][yearGan]:
          rich_score-=2
          reason.append(f"流年天干地支正向作用，为事业反运")
          if "合" in Dizhi_gx[yearZhi][yearGan]:
             rich_score-=4
             reason.append(f"流年天干地支合，为事业反运")
          if "生" in Dizhi_gx[yearZhi][yearGan]:
             rich_score-=2
             reason.append(f"流年地支生天干，为事业反运")
          if "被生" in Dizhi_gx[yearZhi][yearGan]:
             rich_score-=2
             reason.append(f"流年天干生地支，为事业反运")
          if "害" in Dizhi_gx[yearZhi][yearGan]:
             rich_score-=2
             reason.append(f"流年天干地支相害，相害会应凶，要多加注意")
       if "-" in Dizhi_gx[yearZhi][yearGan]:
          rich_score+=2
          reason.append(f"流年天干地支反向作用")
          if "害" in Dizhi_gx[yearZhi][yearGan]:
             rich_score+=6
             reason.append(f"流年天干地支相害")
          if "合" in Dizhi_gx[yearZhi][yearGan]:
             rich_score+=4
             reason.append(f"流年天干地支相合减力较大")
          if "克" in Dizhi_gx[yearZhi][yearGan]:
             rich_score+=6
             reason.append(f"流年天干地支克减力较大天干虚透，要多加注意")
          if "被克" in Dizhi_gx[yearZhi][yearGan]:
             rich_score+=3
             reason.append(f"流年天干地支克减力较大")
       if min_summary["被制地支"]:  
          for i,zhi in  min_summary["被制地支"]:
             if "-" in Dizhi_gx[zhi][yearZhi]:
                rich_score+=5
                reason.append(f"流年制地支有力，事业运吉")
                if "合" in Dizhi_gx[zhi][yearZhi]:
                 rich_score+=5
                 reason.append(f"流年合制地支非常有力，事业运吉")
                if "冲" in Dizhi_gx[zhi][yearZhi]:
                 rich_score+=6
                 reason.append(f"流年冲制地支非常有力，事业运吉")
                if "害" in Dizhi_gx[zhi][yearZhi]:
                 rich_score+=3
                 reason.append(f"流年穿害制地支非常有力，事业运吉，但要注意健康及六亲健康")
                if "会" in Dizhi_gx[zhi][yearZhi]:
                 rich_score+=3
                 reason.append(f"流年三会制地支非常有力，事业运吉，但要注意健康及六亲健康")
                if "墓" in Dizhi_gx[zhi][yearZhi]:
                 rich_score+=3
                 reason.append(f"流年墓制地支非常有力，事业运吉，但要注意健康及六亲健康")
             if "+" in Dizhi_gx[zhi][yearZhi]:
                rich_score-=5
                reason.append(f"流年为被制地支增力，事业运不吉")
                if "合" in Dizhi_gx[zhi][yearZhi]:
                 rich_score-=5
                 reason.append(f"流年合为被制地支增力，事业运不吉")
                if "冲" in Dizhi_gx[zhi][yearZhi]:
                 rich_score-=6
                 reason.append(f"流年冲为被制地支增力，事业运不吉")
                if "害" in Dizhi_gx[zhi][yearZhi]:
                 rich_score-=8
                 reason.append(f"流年害为被制地支增力，事业运不吉，要多加注意")
                if "会" in Dizhi_gx[zhi][yearZhi]:
                 rich_score-=3
                 reason.append(f"流年三会为被制地支增力，事业运不吉")
                if "墓" in Dizhi_gx[zhi][yearZhi]:
                 rich_score-=3
                 reason.append(f"流年墓库为被制地支增力，事业运不吉")  
          for i,zhi in  min_summary["被制天干"]:
           if "-" in Dizhi_gx[yearZhi][zhi]:
                rich_score+=5
                reason.append(f"流年制天干有力，事业运吉")
                if "合" in Dizhi_gx[yearZhi][zhi]:
                 rich_score+=5
                 reason.append(f"流年合制天干非常有力，事业运吉")
                if "冲" in Dizhi_gx[yunZhi][zhi]:
                 rich_score+=6
                 reason.append(f"流年冲制天干非常有力，事业运吉")
                if "害" in Dizhi_gx[yearZhi][zhi]:
                 rich_score+=3
                 reason.append(f"流年穿害制天干非常有力，事业运吉，但要注意健康及六亲健康")
                if "会" in Dizhi_gx[yearZhi][zhi]:
                 rich_score+=3
                 reason.append(f"流年三会制天干非常有力，事业运吉，但要注意健康及六亲健康")
                if "墓" in Dizhi_gx[yearZhi][zhi]:
                 rich_score+=3
                 reason.append(f"流年墓制天干非常有力，事业运吉，但要注意健康及六亲健康")
           if "+" in Dizhi_gx[yearZhi][zhi]:
                rich_score-=5
                reason.append(f"流年为被制天干增力，事业运不吉")
                if "合" in Dizhi_gx[yearZhi][zhi]:
                 rich_score-=5
                 reason.append(f"流年合为被制天干增力，事业运不吉")
                if "冲" in Dizhi_gx[yearZhi][zhi]:
                 rich_score-=6
                 reason.append(f"流年冲为被制天干增力，事业运不吉")
                if "害" in Dizhi_gx[yearZhi][zhi]:
                 rich_score-=8
                 reason.append(f"流年害为被制天干增力，事业运不吉，要多加注意")
                if "会" in Dizhi_gx[yearZhi][zhi]:
                 rich_score-=3
                 reason.append(f"流年三会为被制天干增力，事业运不吉")
                if "墓" in Dizhi_gx[yearZhi][zhi]:
                 rich_score-=3
                 reason.append(f"流年墓库为被制天干增力，事业运不吉")
           if "-" in Ten_deities[yearGan][zhi]:
                rich_score+=5
                reason.append(f"流年制天干有力，事业运吉")
                if "合" in Ten_deities[yearGan][zhi]:
                 rich_score+=5
                 reason.append(f"流年合制天干非常有力，事业运吉")
           if "+" in Ten_deities[yearGan][zhi]:
                rich_score-=5
                reason.append(f"流年为被制天干增力，事业运不吉")
                if "合" in Ten_deities[yearGan][zhi]:
                 rich_score-=5
                 reason.append(f"流年合为被制天干增力，事业运不吉")
    
    if "+" in Dizhi_gx[yearZhi][yunZhi]:
       if yunscore>0:
        rich_score+=5
        if  Dizhi_gx[yearZhi][yunZhi] in ("三合","六合","冲","墓"):
           rich_score+=5
       if yunscore<0:
        rich_score-=5
        if  Dizhi_gx[yearZhi][yunZhi] in ("三合","六合","冲","墓"):
           rich_score-=5
 
    if "-" in Dizhi_gx[yearZhi][yunZhi]:
       if yunscore>0:
        rich_score-=5
        if  Dizhi_gx[yearZhi][yunZhi] in ("害","刑","冲","墓","破" ):
           rich_score-=5
       if yunscore<0:
        rich_score+=5
        if  Dizhi_gx[yearZhi][yunZhi] in ("害","刑","冲","墓","破"):
           rich_score+=5

    if "+" in Dizhi_gx[yearZhi][yunGan]:
       if yunscore>0:
        rich_score+=5
        if  Dizhi_gx[yearZhi][yunGan] in ("生","被生","比","劫"):
           rich_score+=5
       if yunscore<0:
        rich_score-=5
        if  Dizhi_gx[yearZhi][yunGan] in ("生","被生","比","劫"):
           rich_score-=5
 
    if "-" in Dizhi_gx[yearZhi][yunGan]:
       if yunscore>0:
        rich_score-=5
        if  Dizhi_gx[yearZhi][yunGan] in ("克","被克","害"):
           rich_score-=5
       if yunscore<0:
        rich_score+=5
        if  Dizhi_gx[yearZhi][yunGan] in ("克","被克","害"):
           rich_score+=5

    if "+" in Ten_deities[yearGan][yunGan]:
       if yunscore>0:
        rich_score+=5
        if  Ten_deities[yearGan][yunGan] in ("生","被生","比","劫","合"):
           rich_score+=5
       if yunscore<0:
        rich_score-=5
        if  Ten_deities[yearGan][yunGan] in ("生","被生","比","劫","合"):
           rich_score-=5
 
    if "-" in Ten_deities[yearGan][yunGan]:
       if yunscore>0:
        rich_score-=5
        if  Ten_deities[yearGan][yunGan] in ("克","被克"):
           rich_score-=5
       if yunscore<0:
        rich_score+=5
        if  Ten_deities[yearGan][yunGan] in ("克","被克"):
           rich_score+=5

   
    # print(f"dayun{yunGan} {yunZhi} liunian {yearGan} {yearZhi}")
    # for item in min_summary["事业"]:
    # # Check if the first element of the tuple is an integer (a year)
    #  if isinstance(item[0], int):
    #     # Check if the year matches the target year
    #     if item[0] == year:
    #         print(f"The score for the year {year} is {item[1]}")
    #         score=item[1]
    #         if score >=10 :
    #             min_summary['今年情况'].append(("吉",f"{score}",rich_year["吉"])),
    #         elif score >=20 :
    #             min_summary['今年情况'].append(("大吉",f"{score}",rich_year["大吉"])),
    #         elif score<=-5 :
    #             min_summary['今年情况'].append(("凶",f"{score}",rich_year["凶"])),
    #         elif score<=-15 :
    #             min_summary['今年情况'].append(("大凶",f"{score}",rich_year["大凶"])),
    #         else:
    #             min_summary['今年情况'].append(("平",f"{score}",rich_year["平"])),
    #         break
    return rich_score,reason,i


def rich_yun_judge(yunGan,yunZhi,gans,zhis,min_summary):
    good=[]
    reason=[]
    rich_score=0
    #判断做功类型
    for zgtype,des in min_summary["做功"]:
        if zgtype in ("三阳制阴","阳制阴","贼捕阴制阳","木火阳一气"):
           good.append("阳")
        if zgtype in ("三阴制阳","阴制阳","贼捕阳制阴","金水阴一气"):
           good.append("阴")
        if zgtype in ("印化官杀"):
           good.append("化")
        if zgtype in ("食伤生财"):
           good.append("生")
        if zgtype in ("入墓"):
           good.append("墓")
        if zgtype in ("年时贯穿"):
           good.append("贯")
    
    if tgdz_yin_yang[yunZhi] in good: 
       rich_score+=10
       reason.append(f"行{tgdz_yin_yang[yunZhi]}{yunZhi}运，为事业吉运")
       if "+" in Dizhi_gx[yunZhi][yunGan]:
          rich_score+=2
          reason.append(f"大运天干地支正向作用，为事业吉运")
          if "合" in Dizhi_gx[yunZhi][yunGan]:
             rich_score+=4
             reason.append(f"大运天干地支合，为事业吉运")
          if "生" in Dizhi_gx[yunZhi][yunGan]:
             rich_score+=2
             reason.append(f"大运地支生天干，为事业吉运")
          if "被生" in Dizhi_gx[yunZhi][yunGan]:
             rich_score+=2
             reason.append(f"大运天干生地支，为事业吉运")
          if "害" in Dizhi_gx[yunZhi][yunGan]:
             rich_score-=2
             reason.append(f"大运天干地支相害，相害会应凶，要多加注意")
       if "-" in Dizhi_gx[yunZhi][yunGan]:
          rich_score-=2
          reason.append(f"大运天干地支反向作用")
          if "害" in Dizhi_gx[yunZhi][yunGan]:
             rich_score-=6
             reason.append(f"大运天干地支相害应凶，要多加注意")
          if "合" in Dizhi_gx[yunZhi][yunGan]:
             rich_score-=4
             reason.append(f"大运天干地支相合减力较大，要多加注意")
          if "克" in Dizhi_gx[yunZhi][yunGan]:
             rich_score-=5
             reason.append(f"大运天干地支克减力较大天干虚透，要多加注意")
          if "被克" in Dizhi_gx[yunZhi][yunGan]:
             rich_score-=3
             reason.append(f"大运天干地支克减力较大，要多加注意")
        
       for i,zhi in  min_summary["被制地支"]:
             if "-" in Dizhi_gx[zhi][yunZhi]:
                rich_score+=5
                reason.append(f"大运制地支有力，事业运吉")
                if "合" in Dizhi_gx[zhi][yunZhi]:
                 rich_score+=5
                 reason.append(f"大运合制地支非常有力，事业运吉")
                if "冲" in Dizhi_gx[zhi][yunZhi]:
                 rich_score+=6
                 reason.append(f"大运冲制地支非常有力，事业运吉")
                if "害" in Dizhi_gx[zhi][yunZhi]:
                 rich_score+=3
                 reason.append(f"大运穿害制地支非常有力，事业运吉，但要注意健康及六亲健康")
                if "会" in Dizhi_gx[zhi][yunZhi]:
                 rich_score+=3
                 reason.append(f"大运三会制地支非常有力，事业运吉，但要注意健康及六亲健康")
                if "墓" in Dizhi_gx[zhi][yunZhi]:
                 rich_score+=3
                 reason.append(f"大运墓制地支非常有力，事业运吉，但要注意健康及六亲健康")
             if "+" in Dizhi_gx[zhi][yunZhi]:
                rich_score-=5
                reason.append(f"大运为被制地支增力，事业运不吉")
                if "合" in Dizhi_gx[zhi][yunZhi]:
                 rich_score-=5
                 reason.append(f"大运合为被制地支增力，事业运不吉")
                if "冲" in Dizhi_gx[zhi][yunZhi]:
                 rich_score-=6
                 reason.append(f"大运冲为被制地支增力，事业运不吉")
                if "害" in Dizhi_gx[zhi][yunZhi]:
                 rich_score-=8
                 reason.append(f"大运害为被制地支增力，事业运不吉，要多加注意")
                if "会" in Dizhi_gx[zhi][yunZhi]:
                 rich_score-=3
                 reason.append(f"大运三会为被制地支增力，事业运不吉")
                if "墓" in Dizhi_gx[zhi][yunZhi]:
                 rich_score-=3
                 reason.append(f"大运墓库为被制地支增力，事业运不吉")
       for i,zhi in  min_summary["被制天干"]:
           if "-" in Dizhi_gx[yunZhi][zhi]:
                rich_score+=5
                reason.append(f"大运制天干有力，事业运吉")
                if "合" in Dizhi_gx[yunZhi][zhi]:
                 rich_score+=5
                 reason.append(f"大运合制天干非常有力，事业运吉")
                if "冲" in Dizhi_gx[yunZhi][zhi]:
                 rich_score+=6
                 reason.append(f"大运冲制天干非常有力，事业运吉")
                if "害" in Dizhi_gx[yunZhi][zhi]:
                 rich_score+=3
                 reason.append(f"大运穿害制天干非常有力，事业运吉，但要注意健康及六亲健康")
                if "会" in Dizhi_gx[yunZhi][zhi]:
                 rich_score+=3
                 reason.append(f"大运三会制天干非常有力，事业运吉，但要注意健康及六亲健康")
                if "墓" in Dizhi_gx[yunZhi][zhi]:
                 rich_score+=3
                 reason.append(f"大运墓制天干非常有力，事业运吉，但要注意健康及六亲健康")
           if "+" in Dizhi_gx[yunZhi][zhi]:
                rich_score-=5
                reason.append(f"大运为被制天干增力，事业运不吉")
                if "合" in Dizhi_gx[yunZhi][zhi]:
                 rich_score-=5
                 reason.append(f"大运合为被制天干增力，事业运不吉")
                if "冲" in Dizhi_gx[yunZhi][zhi]:
                 rich_score-=6
                 reason.append(f"大运冲为被制天干增力，事业运不吉")
                if "害" in Dizhi_gx[yunZhi][zhi]:
                 rich_score-=8
                 reason.append(f"大运害为被制天干增力，事业运不吉，要多加注意")
                if "会" in Dizhi_gx[yunZhi][zhi]:
                 rich_score-=3
                 reason.append(f"大运三会为被制天干增力，事业运不吉")
                if "墓" in Dizhi_gx[yunZhi][zhi]:
                 rich_score-=3
                 reason.append(f"大运墓库为被制天干增力，事业运不吉")
           if "-" in Ten_deities[yunGan][zhi]:
                rich_score+=5
                reason.append(f"大运制天干有力，事业运吉")
                if "合" in Ten_deities[yunGan][Zhi]:
                 rich_score+=5
                 reason.append(f"大运合制天干非常有力，事业运吉")
           if "+" in Ten_deities[yunGan][zhi]:
                rich_score-=5
                reason.append(f"大运为被制天干增力，事业运不吉")
                if "合" in Ten_deities[yunZhi][zhi]:
                 rich_score-=5
                 reason.append(f"大运合为被制天干增力，事业运不吉")
                
    elif "化" in good:
       if Ten_deities[gans[2]][yunGan] in ("印","枭"):
          rich_score+=5
          reason.append(f"大运进入印化官杀，事业运吉")
       for cagan in Branch_hidden_stems[yunZhi]:
          if Ten_deities[gans[2]][cagan] in ("印","枭"):
           rich_score+=3
           reason.append(f"大运地支含印枭，进入印化官杀，事业运吉")
          if Ten_deities[gans[2]][cagan] in ("官","杀"):
           rich_score+=3
           reason.append(f"大运地支含官杀，进入印化官杀，事业运吉")
          
    elif "生" in good:
        if Ten_deities[gans[2]][yunGan] in ("食","伤"):
          rich_score+=5
          reason.append(f"大运进入食伤生财，事业运吉")
        for cagan in Branch_hidden_stems[yunZhi]:
          if Ten_deities[gans[2]][cagan] in ("食","伤"):
           rich_score+=3
           reason.append(f"大运地支含食伤，进入印化官杀，事业运吉")
          if Ten_deities[gans[2]][cagan] in ("财","才"):
           rich_score+=3
           reason.append(f"大运地支含正偏财，进入印化官杀，事业运吉")
    else:
       rich_score-=10
       reason.append(f"行{tgdz_yin_yang[yunZhi]}{yunZhi}运，为事业反运")
       if "+" in Dizhi_gx[yunZhi][yunGan]:
          rich_score-=2
          reason.append(f"大运天干地支正向作用，为事业反运")
          if "合" in Dizhi_gx[yunZhi][yunGan]:
             rich_score-=4
             reason.append(f"大运天干地支合，为事业吉反运")
          if "生" in Dizhi_gx[yunZhi][yunGan]:
             rich_score-=2
             reason.append(f"大运地支生天干，为事业反运")
          if "被生" in Dizhi_gx[yunZhi][yunGan]:
             rich_score-=2
             reason.append(f"大运天干生地支，为事业反运")
          if "害" in Dizhi_gx[yunZhi][yunGan]:
             rich_score-=2
             reason.append(f"大运天干地支相害，相害会应凶，要多加注意")
       if "-" in Dizhi_gx[yunZhi][yunGan]:
          rich_score+=2
          reason.append(f"大运天干地支反向作用")
          if "害" in Dizhi_gx[yunZhi][yunGan]:
             rich_score+=6
             reason.append(f"大运天干地支相害应凶，要多加注意")
          if "合" in Dizhi_gx[yunZhi][yunGan]:
             rich_score+=4
             reason.append(f"大运天干地支相合减力较大，要多加注意")
          if "克" in Dizhi_gx[yunZhi][yunGan]:
             rich_score+=3
             reason.append(f"大运天干地支克减力较大，要多加注意")
          if "被克" in Dizhi_gx[yunZhi][yunGan]:
             rich_score+=3
             reason.append(f"大运天干地支克减力较大，要多加注意")
       if min_summary["被制地支"]:
         for i,zhi in  min_summary["被制地支"]:
             if "-" in Dizhi_gx[zhi][yunZhi]:
                rich_score+=5
                reason.append(f"大运制地支有力，事业运吉")
                if "合" in Dizhi_gx[zhi][yunZhi]:
                 rich_score+=5
                 reason.append(f"大运合制地支非常有力，事业运吉")
                if "冲" in Dizhi_gx[zhi][yunZhi]:
                 rich_score+=6
                 reason.append(f"大运冲制地支非常有力，事业运吉")
                if "害" in Dizhi_gx[zhi][yunZhi]:
                 rich_score+=3
                 reason.append(f"大运穿害制地支非常有力，事业运吉，但要注意健康及六亲健康")
                if "会" in Dizhi_gx[zhi][yunZhi]:
                 rich_score+=3
                 reason.append(f"大运三会制地支非常有力，事业运吉，但要注意健康及六亲健康")
                if "墓" in Dizhi_gx[zhi][yunZhi]:
                 rich_score+=3
                 reason.append(f"大运墓制地支非常有力，事业运吉，但要注意健康及六亲健康")
             if "+" in Dizhi_gx[zhi][yunZhi]:
                rich_score-=5
                reason.append(f"大运为被制地支增力，事业运不吉")
                if "合" in Dizhi_gx[zhi][yunZhi]:
                 rich_score-=5
                 reason.append(f"大运合为被制地支增力，事业运不吉")
                if "冲" in Dizhi_gx[zhi][yunZhi]:
                 rich_score-=6
                 reason.append(f"大运冲为被制地支增力，事业运不吉")
                if "害" in Dizhi_gx[zhi][yunZhi]:
                 rich_score-=8
                 reason.append(f"大运害为被制地支增力，事业运不吉，要多加注意")
                if "会" in Dizhi_gx[zhi][yunZhi]:
                 rich_score-=3
                 reason.append(f"大运三会为被制地支增力，事业运不吉")
                if "墓" in Dizhi_gx[zhi][yunZhi]:
                 rich_score-=3
                 reason.append(f"大运墓库为被制地支增力，事业运不吉")
       for i,zhi in  min_summary["被制天干"]:
           if "-" in Dizhi_gx[yunZhi][zhi]:
                rich_score+=5
                reason.append(f"大运制天干有力，事业运吉")
                if "合" in Dizhi_gx[yunZhi][zhi]:
                 rich_score+=5
                 reason.append(f"大运合制天干非常有力，事业运吉")
                if "冲" in Dizhi_gx[yunZhi][zhi]:
                 rich_score+=6
                 reason.append(f"大运冲制天干非常有力，事业运吉")
                if "害" in Dizhi_gx[yunZhi][zhi]:
                 rich_score+=3
                 reason.append(f"大运穿害制天干非常有力，事业运吉，但要注意健康及六亲健康")
                if "会" in Dizhi_gx[yunZhi][zhi]:
                 rich_score+=3
                 reason.append(f"大运三会制天干非常有力，事业运吉，但要注意健康及六亲健康")
                if "墓" in Dizhi_gx[yunZhi][zhi]:
                 rich_score+=3
                 reason.append(f"大运墓制天干非常有力，事业运吉，但要注意健康及六亲健康")
           if "+" in Dizhi_gx[yunZhi][zhi]:
                rich_score-=5
                reason.append(f"大运为被制天干增力，事业运不吉")
                if "合" in Dizhi_gx[yunZhi][zhi]:
                 rich_score-=5
                 reason.append(f"大运合为被制天干增力，事业运不吉")
                if "冲" in Dizhi_gx[yunZhi][zhi]:
                 rich_score-=6
                 reason.append(f"大运冲为被制天干增力，事业运不吉")
                if "害" in Dizhi_gx[yunZhi][zhi]:
                 rich_score-=8
                 reason.append(f"大运害为被制天干增力，事业运不吉，要多加注意")
                if "会" in Dizhi_gx[yunZhi][zhi]:
                 rich_score-=3
                 reason.append(f"大运三会为被制天干增力，事业运不吉")
                if "墓" in Dizhi_gx[yunZhi][zhi]:
                 rich_score-=3
                 reason.append(f"大运墓库为被制天干增力，事业运不吉")
           if "-" in Ten_deities[yunGan][zhi]:
                rich_score+=5
                reason.append(f"大运制天干有力，事业运吉")
                if "合" in Dizhi_gx[yunGan][Zhi]:
                 rich_score+=5
                 reason.append(f"大运合制天干非常有力，事业运吉")
           if "+" in Ten_deities[yunGan][zhi]:
                rich_score-=5
                reason.append(f"大运为被制天干增力，事业运不吉")
                if "合" in Dizhi_gx[yunZhi][zhi]:
                 rich_score-=5
                 reason.append(f"大运合为被制天干增力，事业运不吉")
       
    #print(f"{rich_score} {reason}")

  
    return rich_score,reason


def rich_dayun_all(gans,zhis,min_summary):
   i=0
   for yunGan,yunZhi in min_summary["大运"]:
      rich_score,reason=rich_yun_judge(yunGan,yunZhi,gans,zhis,min_summary)
      
      if rich_score >=10 :
                min_summary['大运情况'].append((f"{yunGan}{yunZhi}",min_summary["起运时间"][i][0],"吉",rich_score,reason,rich_yun["吉"])),
      elif rich_score >=20 :
                min_summary['大运情况'].append((f"{yunGan}{yunZhi}",min_summary["起运时间"][i][0],"大吉",rich_score,reason,rich_yun["大吉"])),
      elif rich_score<=-5 :
                min_summary['大运情况'].append((f"{yunGan}{yunZhi}",min_summary["起运时间"][i][0],"凶",rich_score,reason,rich_yun["凶"])),
      elif rich_score<=-15 :
                min_summary['大运情况'].append((f"{yunGan}{yunZhi}",min_summary["起运时间"][i][0],"大凶",rich_score,reason,rich_yun["大凶"])),
      else:
                min_summary['大运情况'].append((f"{yunGan}{yunZhi}",min_summary["起运时间"][i][0],"平",rich_score,reason,rich_yun["平"])),
      i=i+1
   return i

def today_all(userid,min_summary):
    #获取到今天的时间，取得年月日的干支信息：
    today_result={
        "lunarDate": '',
        "gregorianDate": '',
        "weekDay": '',
        "inspirationalQuote": '内心强大的秘诀是，我永远善意积极向上。',
        "day_good":'',
        "day_bad":'',
        "gan_score":[],
        "gan_reason":[],
        "min_score":[],
        "min_reason":[],
        "min_good":'',
        "min_bad":'',
        "outfitStyles":[],   
    }
    year = datetime.now().year
    month = datetime.now().month
    day1 = datetime.now().day
    lunar=sxtwl.fromSolar(year,month,day1)
    year_ganzhi = lunar.getYearGZ()      # 年干支
    month_ganzhi = lunar.getMonthGZ()    # 月干支
    day_ganzhi = lunar.getDayGZ() 

    #获取到今天的干支，增强的十天干是，被消弱的十天干是，可以中和的十天干是    

    data=min_summary["起运时间"]
    for i in range(len(data) - 1):
        if data[i][1] <= year < data[i + 1][1]:
            break # Return the group interval (1-indexed)
    yunGan=min_summary["大运"][i][0]
    yunZhi=min_summary["大运"][i][1]
    
    today_result["lunarDate"]=f"{Gan[year_ganzhi.tg]}{Zhi[year_ganzhi.dz]}{Gan[month_ganzhi.tg]}{Zhi[month_ganzhi.dz]}{Gan[day_ganzhi.tg]}{Zhi[day_ganzhi.dz]}"    
    relation=[]
    yearGan=Gan[year_ganzhi.tg]
    yearZhi=Zhi[year_ganzhi.dz]
    monthGan=Gan[month_ganzhi.tg]
    monthZhi=Zhi[month_ganzhi.dz]
    dayGan=Gan[day_ganzhi.tg]
    dayZhi=Zhi[day_ganzhi.dz]
    ln_gans=[yunGan,yearGan,monthGan,dayGan]
    ln_zhis=[yunZhi,yearZhi,monthZhi,dayZhi]
    gan_zhi=[yunGan,yunZhi,yearGan,yearZhi,monthGan,monthZhi,dayGan,dayZhi]
    #print(gan_zhi)
    # Initialize score for each Heavenly Stem
    score_gan = {gan: 0 for gan in Gan}
    for i in ln_gans:
          score_gan[i]+=1
    
    for j in ln_zhis:
        for i in Branch_hidden_stems[j]:
           score_gan[i]+=1

    #print(score_gan)
    #干支之间相互作用
    for zhi,gan in [[yearZhi,yearGan],(monthZhi,monthGan),(dayZhi,dayGan)]:
       for j in Branch_hidden_stems[zhi]:
            interaction=Ten_deities[gan][j]
            if interaction in ["食","伤"]:
                  relation.append(gan+"生"+zhi+"中"+j)
                  score_gan[j]+=1
            if interaction in ["财","才"]:
                  relation.append(gan+"克"+zhi+"中"+j)
                  score_gan[j]-=1
            if interaction in ["官","杀"]:
                  relation.append(zhi+"中"+j+"克"+gan)
                  score_gan[gan]-=1
            if interaction in ["印","枭"]:
                  relation.append(zhi+"中"+j+"生"+gan)
                  score_gan[gan]+=1
    
    #print(relation)
    #print(score_gan)

    for i in range(len(ln_gans) - 1):
        for j in range(i + 1, len(ln_gans)):
            element1 = ln_gans[i]
            element2 = ln_gans[j]
            interaction=Ten_deities[element1][element2]
            if interaction in ["食","伤"]:
                  relation.append(element1+"生"+element2)
                  score_gan[element2]+=1
            if interaction in ["财","才"]:
                  relation.append(element1+"克"+element2)
                  score_gan[element2]-=1
            if interaction in ["官","杀"]:
                  relation.append(element2+"克"+element1)
                  score_gan[element1]-=1
            if interaction in ["印","枭"]:
                  relation.append(element2+"生"+element1)
                  score_gan[element1]+=1
    #print(relation)
    #print(score_gan)


    # #支之间相互作用
    # Zhi_atts[yearZhi]['冲'] 
    for a in range(len(ln_zhis) - 1):
        for b in range(a + 1, len(ln_zhis)):
          element1 = ln_zhis[a]
          element2 = ln_zhis[b]
          cangan1=Branch_hidden_stems[element1]
          cangan2=Branch_hidden_stems[element2]
          interaction=Dizhi_gx[element1][element2]
          if "害" in interaction:
              relation.append(element1+"害"+element2)
              for i in cangan1:
                 score_gan[i]-=2
              for i in cangan2:
                 score_gan[i]-=2
          if "刑" in interaction:
              relation.append(element1+"刑"+element2)
              for i in cangan1:
                 score_gan[i]-=1
              for i in cangan2:
                 score_gan[i]-=1
          if "冲" in interaction:
              relation.append(element1+"冲"+element2)
              for i in cangan1:
                 score_gan[i]-=1
              for i in cangan2:
                 score_gan[i]-=1 
          if "破" in interaction:
              relation.append(element1+"破"+element2)
              for i in cangan1:
                 score_gan[i]-=1
              for i in cangan2:
                 score_gan[i]-=1 
          if "合" in interaction:
              relation.append(element1+"破"+element2)
              for i in cangan1:
                 score_gan[i]+=1
              for i in cangan2:
                 score_gan[i]+=1 

    #print(relation)
    #print(score_gan)
    
    if all(item in ln_zhis for item in ["寅", "卯", "辰"]):
      relation.append("寅卯辰三会木局")
      score_gan["甲"]+=3
      score_gan["乙"]+=3
    if all(item in ln_zhis for item in ["亥", "卯", "未"]):
      relation.append("亥卯未三合木局")
      score_gan["乙"]+=3
      score_gan["亥"]-=2
      score_gan["未"]-=2
    if all(item in ln_zhis for item in ["巳", "午", "未"]):
      relation.append("巳午未三会火局")
      score_gan["丙"]+=3
      score_gan["丁"]+=3
      score_gan["戊"]+=2
    if all(item in ln_zhis for item in ["寅", "午", "戌"]):
      relation.append("寅午戌三合火局")
      score_gan["丁"]+=3
      score_gan["甲"]-=2
      score_gan["戊"]-=2

    if all(item in ln_zhis for item in ["申", "酉", "戌"]):
      relation.append("申酉戌三会金局")
      score_gan["庚"]+=3
      score_gan["辛"]+=3

    if all(item in ln_zhis for item in ["巳", "酉", "丑"]):
      relation.append("巳酉丑三合金局")
      score_gan["辛"]+=3
      score_gan["丁"]-=2
      score_gan["癸"]-=2

    if all(item in ln_zhis for item in ["亥", "子", "丑"]):
      relation.append("亥子丑三会水局")
      score_gan["壬"]+=3
      score_gan["癸"]+=3

    if all(item in ln_zhis for item in ["申", "子", "辰"]):
      relation.append("申子辰三合水局")
      score_gan["癸"]+=3
      score_gan["庚"]-=2
      score_gan["戊"]-=2
 
    # print(relation)
    # print(score_gan)

    sorted_score_gan=sorted(score_gan.items(), key=lambda x: x[1], reverse=True)
    #print(sorted_score_gan)
    wanggan=[]
    shuigan=[]
    for i,score in sorted_score_gan:
       if score>0:
         wanggan.append((i,score)) 
    for i,score in sorted_score_gan:
       if score<0:
          shuigan.append((i,score))

    today_result["day_good"]=wanggan
    today_result["day_bad"]=shuigan
    today_result["gan_score"]=sorted_score_gan
    today_result["gan_reason"]=relation
    #print(f"今天是{gan_zhi},旺天干有{wanggan},受伤天干有{shuigan}")

    
    #找到八字命局的财富用神，事业用神，学习用神，健康用神，婚姻用神，父母用神，儿女用神，兄妹用神，逐一看影响
    #赵大八字里的大运用神，找到重点方向
    type_dayun=[]
    score_shisheng=[]
    score_shisheng={gan: 0 for gan in Gan}
    relation_shisheng=[]
    types=[]
    gans=min_summary["天干"]
    zhis=min_summary["地支"]
    for i in gans:
          score_shisheng[i]+=1  
    for j in zhis:
        for i in Branch_hidden_stems[j]:
           score_shisheng[i]+=1


    # daymaster=gans[2]
    # Ten_deities[daymaster][yunGan]
    # for i in Branch_hidden_stems[yunZhi]: 
    #     types.append(Ten_deities[[gans[2]]][i]) 
    
    for gan,zhi in [[gans[0],zhis[0]],[gans[1],zhis[1]],[gans[2],zhis[2]],[gans[3],zhis[3]]]:
       for j in Branch_hidden_stems[zhi]:
            interaction=Ten_deities[gan][j]
            if interaction in ["食","伤"]:
                  relation_shisheng.append(gan+"生"+zhi+"中"+j)
                  score_shisheng[j]+=1
            if interaction in ["财","才"]:
                  relation_shisheng.append(gan+"克"+zhi+"中"+j)
                  score_shisheng[j]-=1
            if interaction in ["官","杀"]:
                  relation_shisheng.append(zhi+"中"+j+"克"+gan)
                  score_shisheng[gan]-=1
            if interaction in ["印","枭"]:
                  relation_shisheng.append(zhi+"中"+j+"生"+gan)
                  score_shisheng[gan]+=1

   

    for i in range(len(gans) - 1):
        for j in range(i + 1, len(gans)):
            element1 = gans[i]
            element2 = gans[j]
            interaction=Ten_deities[element1][element2]
            if interaction in ["食","伤"]:
                  relation_shisheng.append(element1+"生"+element2)
                  score_shisheng[element2]+=1
            if interaction in ["财","才"]:
                  relation_shisheng.append(element1+"克"+element2)
                  score_shisheng[element2]-=1
            if interaction in ["官","杀"]:
                  relation_shisheng.append(element2+"克"+element1)
                  score_shisheng[element1]-=1
            if interaction in ["印","枭"]:
                  relation_shisheng.append(element2+"生"+element1)
                  score_shisheng[element1]+=1
   
    
    for a in range(len(zhis) - 1):
        for b in range(a + 1, len(zhis)):
          element1 = zhis[a]
          element2 = zhis[b]
          cangan1=Branch_hidden_stems[element1]
          cangan2=Branch_hidden_stems[element2]
          interaction=Dizhi_gx[element1][element2]
          if "害" in interaction:
              relation_shisheng.append(element1+"害"+element2)
              for i in cangan1:
                 score_shisheng[i]-=2
              for i in cangan2:
                 score_shisheng[i]-=2
          if "刑" in interaction:
              relation_shisheng.append(element1+"刑"+element2)
              for i in cangan1:
                 score_shisheng[i]-=1
              for i in cangan2:
                 score_shisheng[i]-=1
          if "冲" in interaction:
              relation_shisheng.append(element1+"冲"+element2)
              for i in cangan1:
                 score_shisheng[i]-=1
              for i in cangan2:
                 score_shisheng[i]-=1 
          if "破" in interaction:
              relation_shisheng.append(element1+"破"+element2)
              for i in cangan1:
                 score_shisheng[i]-=1
              for i in cangan2:
                 score_shisheng[i]-=1 
          if "合" in interaction:
              relation_shisheng.append(element1+"破"+element2)
              for i in cangan1:
                 score_shisheng[i]+=1
              for i in cangan2:
                 score_shisheng[i]+=1 
           
    combined_zhis = list(set(list(zhis) + ln_zhis))
    for i in zhis:
        if Zhi_atts[i]["墓"] in combined_zhis:
              for j in Branch_hidden_stems[i]:
                relation_shisheng.append(i+"中"+j+"入"+Zhi_atts[i]["墓"]+"墓")  
                if Mu[Zhi_atts[i]["墓"]]["闭"] in zhis or Mu[Zhi_atts[i]["墓"]]["闭"] in ln_zhis:
                    score_shisheng[j]-=3
                if Mu[Zhi_atts[i]["墓"]]["害"] in zhis or Mu[Zhi_atts[i]["墓"]]["闭"] in ln_zhis:
                    score_shisheng[j]-=3
                if Mu[Zhi_atts[i]["墓"]]["冲"] in zhis or Mu[Zhi_atts[i]["墓"]]["闭"] in ln_zhis:
                    score_shisheng[j]+=3
    
    if all(item in combined_zhis for item in ["寅", "卯", "辰"]):
      relation.append("寅卯辰三会木局")
      score_gan["甲"]+=3
      score_gan["乙"]+=3
    if all(item in combined_zhis for item in ["亥", "卯", "未"]):
      relation.append("亥卯未三合木局")
      score_gan["乙"]+=3
      score_gan["亥"]-=2
      score_gan["未"]-=2
    if all(item in combined_zhis for item in ["巳", "午", "未"]):
      relation.append("巳午未三会火局")
      score_gan["丙"]+=3
      score_gan["丁"]+=3
      score_gan["戊"]+=2
    if all(item in combined_zhis for item in ["寅", "午", "戌"]):
      relation.append("寅午戌三合火局")
      score_gan["丁"]+=3
      score_gan["甲"]-=2
      score_gan["戊"]-=2

    if all(item in combined_zhis for item in ["申", "酉", "戌"]):
      relation.append("申酉戌三会金局")
      score_gan["庚"]+=3
      score_gan["辛"]+=3

    if all(item in combined_zhis for item in ["巳", "酉", "丑"]):
      relation.append("巳酉丑三合金局")
      score_gan["辛"]+=3
      score_gan["丁"]-=2
      score_gan["癸"]-=2

    if all(item in combined_zhis for item in ["亥", "子", "丑"]):
      relation.append("亥子丑三会水局")
      score_gan["壬"]+=3
      score_gan["癸"]+=3

    if all(item in combined_zhis for item in ["申", "子", "辰"]):
      relation.append("申子辰三合水局")
      score_gan["癸"]+=3
      score_gan["庚"]-=2
      score_gan["戊"]-=2



    sorted_score_shisheng=sorted(score_shisheng.items(), key=lambda x: x[1], reverse=True)
    wanggan_shisheng=[]
    shuigan_shisheng=[]
    for i,score in sorted_score_shisheng:
       if score>0:
         wanggan_shisheng.append((i,score)) 
    for i,score in sorted_score_shisheng:
       if score<0:
          shuigan_shisheng.append((i,score))
    
    today_result["min_good"]=wanggan_shisheng
    today_result["min_bad"]=shuigan_shisheng
    today_result["min_score"]=sorted_score_shisheng
    today_result["min_reason"]=relation_shisheng

    #print(f"八字是{gans}{zhis},旺天干有{wanggan_shisheng},受伤天干有{shuigan_shisheng}")

    today_result["outfitStyles"]= [
        {
            "title": "越穿越富美搭",
            "imgUrl": "cloud://cloud1-2gmwwqw05c1debc0.636c-cloud1-2gmwwqw05c1debc0-1325385845/Xnip2024-04-20_17-06-32.jpg",
            "description": "休闲风格适合日常穿搭...",
            "components": [
                {"type": "Top", "description": "White T-Shirt", "imgUrl": "/images/white_tshirt.jpg"},
                {"type": "Bottom", "description": "Blue Jeans", "imgUrl": "/images/blue_jeans.jpg"},
                {"type": "Shoes", "description": "Sneakers", "imgUrl": "/images/sneakers.jpg"},
                {"type": "Accessory", "description": "Leather Watch", "imgUrl": "/images/leather_watch.jpg"},
            ],
            "isLiked": None
        },
         {
            "title": "越穿越美美搭",
            "imgUrl": "cloud://cloud1-2gmwwqw05c1debc0.636c-cloud1-2gmwwqw05c1debc0-1325385845/Xnip2024-04-20_17-10-14.jpg",
            "description": "休闲风格适合日常穿搭...",
            "components": [
                {"type": "Top", "description": "White T-Shirt", "imgUrl": "/images/white_tshirt.jpg"},
                {"type": "Bottom", "description": "Blue Jeans", "imgUrl": "/images/blue_jeans.jpg"},
                {"type": "Shoes", "description": "Sneakers", "imgUrl": "/images/sneakers.jpg"},
                {"type": "Accessory", "description": "Leather Watch", "imgUrl": "/images/leather_watch.jpg"},
            ],
            "isLiked": None
        },
         {
            "title": "越穿越瘦美搭",
            "imgUrl": "cloud://cloud1-2gmwwqw05c1debc0.636c-cloud1-2gmwwqw05c1debc0-1325385845/today.jpg",
            "description": "休闲风格适合日常穿搭...",
            "components": [
                {"type": "Top", "description": "White T-Shirt", "imgUrl": "/images/white_tshirt.jpg"},
                {"type": "Bottom", "description": "Blue Jeans", "imgUrl": "/images/blue_jeans.jpg"},
                {"type": "Shoes", "description": "Sneakers", "imgUrl": "/images/sneakers.jpg"},
                {"type": "Accessory", "description": "Leather Watch", "imgUrl": "/images/leather_watch.jpg"},
            ],
            "isLiked": None
        },
          {
            "title": "越穿越爱美搭",
            "imgUrl": "cloud://cloud1-2gmwwqw05c1debc0.636c-cloud1-2gmwwqw05c1debc0-1325385845/today2.jpg",
            "description": "休闲风格适合日常穿搭...",
            "components": [
                {"type": "Top", "description": "White T-Shirt", "imgUrl": "/images/white_tshirt.jpg"},
                {"type": "Bottom", "description": "Blue Jeans", "imgUrl": "/images/blue_jeans.jpg"},
                {"type": "Shoes", "description": "Sneakers", "imgUrl": "/images/sneakers.jpg"},
                {"type": "Accessory", "description": "Leather Watch", "imgUrl": "/images/leather_watch.jpg"},
            ],
            "isLiked": None
        }
        # 添加更多穿搭数据
    ]

    today_result["inspirationalQuote"]="不求而得的，往往求而不得"

    return today_result


def score_shisheng(gans,zhis,min_summary): 
    today_result=[]
    score_shisheng=[]
    relation_shisheng=[]
    score_shisheng={gan: 0 for gan in Gan}
    relation_shisheng={gan: [] for gan in Gan}
    for i in gans:
          score_shisheng[i]+=1  
    for j in zhis:
          for i in Branch_hidden_stems[j]:
            score_shisheng[i]+=1
    
    min_summary["五行"][0]=score_shisheng["庚"]+score_shisheng['辛']
    min_summary["五行"][1]=score_shisheng["甲"]+score_shisheng['乙']
    min_summary["五行"][2]=score_shisheng["壬"]+score_shisheng['癸']
    min_summary["五行"][3]=score_shisheng["丙"]+score_shisheng['丁']
    min_summary["五行"][4]=score_shisheng["戊"]+score_shisheng['己']

    # daymaster=gans[2]
    # Ten_deities[daymaster][yunGan]
    # for i in Branch_hidden_stems[yunZhi]: 
    #     types.append(Ten_deities[[gans[2]]][i]) 
    
    for gan,zhi in [[gans[0],zhis[0]],[gans[1],zhis[1]],[gans[2],zhis[2]],[gans[3],zhis[3]]]:
       for j in Branch_hidden_stems[zhi]:
            interaction=Ten_deities[gan][j]
            if interaction in ["食","伤"]:
                  relation_shisheng[j].append(gan+"生"+zhi+"中"+j)
                  score_shisheng[j]+=1
            if interaction in ["财","才"]:
                  relation_shisheng[j].append(gan+"克"+zhi+"中"+j)
                  score_shisheng[j]-=1
            if interaction in ["官","杀"]:
                  relation_shisheng[gan].append(zhi+"中"+j+"克"+gan)
                  score_shisheng[gan]-=1
            if interaction in ["印","枭"]:
                  relation_shisheng[gan].append(zhi+"中"+j+"生"+gan)
                  score_shisheng[gan]+=1

    #print("mingju")
    #print(score_shisheng)
    #print(relation_shisheng)

    for i in range(len(gans) - 1):
        for j in range(i + 1, len(gans)):
            element1 = gans[i]
            element2 = gans[j]
            interaction=Ten_deities[element1][element2]
            if interaction in ["食","伤"]:
                  relation_shisheng[element2].append(element1+"生"+element2)
                  score_shisheng[element2]+=1
            if interaction in ["财","才"]:
                  relation_shisheng[element2].append(element1+"克"+element2)
                  score_shisheng[element2]-=1
            if interaction in ["官","杀"]:
                  relation_shisheng[element1].append(element2+"克"+element1)
                  score_shisheng[element1]-=1
            if interaction in ["印","枭"]:
                  relation_shisheng[element1].append(element2+"生"+element1)
                  score_shisheng[element1]+=1

    
    for a in range(len(zhis) - 1):
        for b in range(a + 1, len(zhis)):
          element1 = zhis[a]
          element2 = zhis[b]
          cangan1=Branch_hidden_stems[element1]
          cangan2=Branch_hidden_stems[element2]
          interaction=Dizhi_gx[element1][element2]
          if "害" in interaction: 
              for i in cangan1:
                 score_shisheng[i]-=1
                 relation_shisheng[i].append(element1+"害"+element2)
              for i in cangan2:
                 score_shisheng[i]-=1
                 relation_shisheng[i].append(element1+"害"+element2)

          if "刑" in interaction:
              
              for i in cangan1:
                 score_shisheng[i]-=1
                 relation_shisheng[i].append(element1+"刑"+element2)
              for i in cangan2:
                 score_shisheng[i]-=1
                 relation_shisheng[i].append(element1+"刑"+element2)
          if "冲" in interaction:
              for i in cangan1:
                 score_shisheng[i]-=1
                 relation_shisheng[i].append(element1+"冲"+element2)
              for i in cangan2:
                 score_shisheng[i]-=1 
                 relation_shisheng[i].append(element1+"冲"+element2)
          if "破" in interaction:
             
              for i in cangan1:
                 score_shisheng[i]-=1
                 relation_shisheng[i].append(element1+"破"+element2)
              for i in cangan2:
                 score_shisheng[i]-=1 
                 relation_shisheng[i].append(element1+"破"+element2)
          if "合" in interaction:
              
              for i in cangan1:
                 score_shisheng[i]+=1
                 relation_shisheng[i].append(element1+"破"+element2)
              for i in cangan2:
                 score_shisheng[i]+=1 
                 relation_shisheng[i].append(element1+"破"+element2)
           
   
    for i in zhis:
        if Zhi_atts[i]["墓"] in zhis:
              for j in Branch_hidden_stems[i]:
               
                if Mu[Zhi_atts[i]["墓"]]["闭"] in zhis or Mu[Zhi_atts[i]["墓"]]["闭"] in zhis:
                    score_shisheng[j]-=1
                    relation_shisheng[j].append(i+"中"+j+"入"+Zhi_atts[i]["墓"]+"墓")  
                if Mu[Zhi_atts[i]["墓"]]["害"] in zhis or Mu[Zhi_atts[i]["墓"]]["闭"] in zhis:
                    score_shisheng[j]-=1
                    relation_shisheng[j].append(i+"中"+j+"入"+Zhi_atts[i]["墓"]+"墓")  
                if Mu[Zhi_atts[i]["墓"]]["冲"] in zhis or Mu[Zhi_atts[i]["墓"]]["闭"] in zhis:
                    score_shisheng[j]+=2
                    relation_shisheng[j].append(i+"中"+j+"入"+Zhi_atts[i]["墓"]+"墓")  
    
    if all(item in zhis for item in ["寅", "卯", "辰"]):
      relation_shisheng["甲"].append("寅卯辰三会木局")
      relation_shisheng["乙"].append("寅卯辰三会木局")
      score_shisheng["甲"]+=3
      score_shisheng["乙"]+=3
    if all(item in zhis for item in ["亥", "卯", "未"]):
      relation_shisheng["乙"].append("亥卯未三合木局")
      score_shisheng["乙"]+=3
      score_shisheng["壬"]-=1
      score_shisheng["己"]-=1
    if all(item in zhis for item in ["巳", "午", "未"]):
      relation_shisheng["丙"].append("巳午未三会火局")
      relation_shisheng["丁"].append("巳午未三会火局")
      score_shisheng["丙"]+=3
      score_shisheng["丁"]+=3
      score_shisheng["戊"]+=2
    if all(item in zhis for item in ["寅", "午", "戌"]):
      relation_shisheng["丁"].append("寅午戌三合火局")
      score_shisheng["丁"]+=3
      score_shisheng["甲"]-=1
      score_shisheng["戊"]-=1

    if all(item in zhis for item in ["申", "酉", "戌"]):
      relation_shisheng["庚"].append("申酉戌三会金局")
      relation_shisheng["辛"].append("申酉戌三会金局")
      score_shisheng["庚"]+=3
      score_shisheng["辛"]+=3

    if all(item in zhis for item in ["巳", "酉", "丑"]):
      relation_shisheng["辛"].append("巳酉丑三合金局")
      score_shisheng["辛"]+=3
      score_shisheng["丁"]-=1
      score_shisheng["癸"]-=1

    if all(item in zhis for item in ["亥", "子", "丑"]):
      relation_shisheng["壬"].append("亥子丑三会水局")
      relation_shisheng["癸"].append("亥子丑三会水局")
      score_shisheng["壬"]+=3
      score_shisheng["癸"]+=3

    if all(item in zhis for item in ["申", "子", "辰"]):
      relation_shisheng["癸"].append("申子辰三合水局")
      score_shisheng["癸"]+=3
      score_shisheng["庚"]-=1
      score_shisheng["戊"]-=1


    sorted_score_shisheng=sorted(score_shisheng.items(), key=lambda x: x[1], reverse=True)
  
    wanggan_shisheng=[]
    shuigan_shisheng=[]
    for i,score in sorted_score_shisheng:
       if score>0:
         wanggan_shisheng.append((i,score)) 
    for i,score in sorted_score_shisheng:
       if score<0:
          shuigan_shisheng.append((i,score))
    

    min_summary['十神']=sorted_score_shisheng
    min_summary['十神关系']=relation_shisheng
    min_summary['旺干']=wanggan_shisheng
    min_summary['衰干']=shuigan_shisheng

    return today_result


def score_wuxing(gans,zhis,min_summary):
    WuXing=['木','火','土','金','水']
    total_score=[]
    score_shisheng=[]
    score_shisheng={gan: 0 for gan in Gan}
    for i in gans:
          score_shisheng[i]+=100  
    for j in zhis:
        for i in Gan_Zhi_Score[j]:
          score_shisheng[i]+=Gan_Zhi_Score[j][i]
    #print(f"八字是{gans}{zhis},五行分数{score_shisheng},月令旺衰{wangdu_coefficients[zhis[1]]} ")

    min_summary["五行"][0]=(score_shisheng["庚"]+score_shisheng['辛'])*wangdu_coefficients[zhis[1]][3]
    min_summary["五行"][1]=(score_shisheng["甲"]+score_shisheng['乙'])*wangdu_coefficients[zhis[1]][0]
    min_summary["五行"][2]=(score_shisheng["壬"]+score_shisheng['癸'])*wangdu_coefficients[zhis[1]][4]
    min_summary["五行"][3]=(score_shisheng["丙"]+score_shisheng['丁'])*wangdu_coefficients[zhis[1]][1]
    min_summary["五行"][4]=(score_shisheng["戊"]+score_shisheng['己'])*wangdu_coefficients[zhis[1]][2]


    score_wuxing=min_summary["五行"][0]+min_summary["五行"][1]+min_summary["五行"][2]+min_summary["五行"][3]+min_summary["五行"][4]
    
    for i in range(5):
        min_summary["五行"][i] /= score_wuxing
        min_summary["五行"][i] *= 10  # 转换为百分比
    
    
    return score_shisheng


def advice_wuxing(gans,zhis,min_summary):
    min_summary["财运五行用神"]=["木","火"]
    min_summary["平安五行用神"]=["土"] 
    min_summary["智慧五行用神"]=["土"] 
    return score_shisheng