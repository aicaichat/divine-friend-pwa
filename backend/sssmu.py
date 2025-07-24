from baziutil import Gan,Zhi,Ten_deities,Dizhi_gx,Zhi_atts,Branch_hidden_stems,Mu,graveyard_zhi,enter_grave_zhi
import logging
class BaziGraveyard:
    def __init__(self, name, daymater,gans,zhis, major_cycle):
        self.name = name  # 人名
        self.birth_chart = [zhis.year,zhis.month,zhis.day,zhis.time]  # 八字地支
        self.major_cycle = major_cycle  # 大运流年地支
        self.daymaster=daymater
        self.graveyard_types = {'比劫库': [], '食伤库': [], '官库': [], '印库': [], '财库': []}  # 墓库类型
        self.min_graveyart=[]
        self.yun_graveyart=[]
        self.graveyard_status = []  # 墓库状态变化记录
    
    def min_sss_graveyard(self):
        found_graveyard_zhi = [zhi for zhi in self.birth_chart if zhi in graveyard_zhi]                     
        # 移除列表中的重复元素
        # found_graveyard_zhi = list(set(found_graveyard_zhi))
        if found_graveyard_zhi:
            #print(f"{self.name} 的命局墓库地支有: {', '.join(found_graveyard_zhi)}。")
            self.min_graveyart=found_graveyard_zhi
            self.update_graveyard_status("命局",f"有{found_graveyard_zhi}墓",'正常')
       

        found_graveyard_zhi = [zhi for zhi in self.birth_chart if zhi in enter_grave_zhi] 
        #print(f"{found_graveyard_zhi} {self.birth_chart} {enter_grave_zhi}")
        
        # 移除列表中的重复元素,找到自动入墓的地支
        for i in self.min_graveyart:
          ru_mu=[zhi for zhi in found_graveyard_zhi if zhi in Mu[i]["墓"]] 
          bi_mu=[zhi for zhi in self.birth_chart if zhi in Mu[i]["闭"]]
          chong_mu=[zhi for zhi in self.birth_chart if zhi in Mu[i]["冲"]]
          chuan_mu=[zhi for zhi in self.birth_chart if zhi in Mu[i]["害"]]
          if ru_mu:
            #print(f"{ru_mu} : 入墓于 {i}。")
            logging.info(f"{ru_mu} : 入墓于 {i}。")
            for x in ru_mu:
              for gan in Branch_hidden_stems[x]:
                type=self.get_deity_relationship(gan) 
                #print(f"{i}的墓库类型是{type} 。")
                if type== "食" or type == "伤":
                    self.add_graveyard_type("食伤库", x)

                if type == "财" or type == "才":
                    self.add_graveyard_type("财库", x)

                if type == "官" or type == "杀":
                    self.add_graveyard_type("官库", x)  

                if type == "印" or type== "枭":
                    self.add_graveyard_type("印库", x)

                if type == "比" or type == "劫":
                    self.add_graveyard_type("比劫库", x)     
            self.update_graveyard_status("命局",f"{ru_mu}入墓",'正常')
          if bi_mu:
            #print(f"{bi_mu} : 闭墓于 {i}。")
            self.update_graveyard_status("命局",f"{bi_mu}闭墓",'重要' )
          else:
             #print(f"命局无闭{i}墓")
             logging.info(f"{ru_mu} : 入墓于 {i}。")
          if chong_mu:
            #print(f"{chong_mu} : 冲墓于 {i}。")
            self.update_graveyard_status("命局",f"{chong_mu}冲墓",'重要' )
          if chuan_mu:
            #print(f"{chong_mu} : 穿害墓于 {i}。")
            self.update_graveyard_status("命局",f"{chuan_mu}穿害墓",'重要' )
      
    
    def yun_sss_graveyard(self,yunGZ,yearGZ,year):

        found_yun_graveyard_zhi = [zhi for zhi in yunGZ if zhi in graveyard_zhi]                     
        # 移除列表中的重复元素
        # found_graveyard_zhi = list(set(found_graveyard_zhi))
        if found_yun_graveyard_zhi:
            #print(f"{self.name} 的大运墓库地支有: {', '.join(found_yun_graveyard_zhi)}。")
            self.yun_graveyart=found_yun_graveyard_zhi
            self.update_graveyard_status(f"{yunGZ}",f"有{found_yun_graveyard_zhi}墓",'正常')
       

        found_year_graveyard_zhi = [zhi for zhi in yearGZ if zhi in graveyard_zhi]                     
        # 移除列表中的重复元素
        # found_graveyard_zhi = list(set(found_graveyard_zhi))
        if found_year_graveyard_zhi:
            #print(f"{self.name} 流年墓库地支有: {', '.join(found_year_graveyard_zhi)}。")
            self.yun_graveyart=found_year_graveyard_zhi
            self.update_graveyard_status(f"{year}",f"有{found_year_graveyard_zhi}墓",'正常')

        chuan_graveyard_zhi=[]
        #局中被穿害的字会入大运和流年墓
        for i in self.birth_chart:
          j=Zhi_atts[i]['害']
          if j in self.birth_chart:
             chuan_graveyard_zhi.append(i)
             chuan_graveyard_zhi.append(j)
        
        #print(f"局中穿害的字有{chuan_graveyard_zhi} ")
       # print(f"大运墓有{self.yun_graveyart} ")

        #运中被穿害的字会入大运和流年墓
        for b in [zhi for zhi in yunGZ if zhi in Zhi_atts.keys()]:
          j=Zhi_atts[b]['害']
          if j in self.birth_chart:
             chuan_graveyard_zhi.append(b)
           
       # print(f"局中穿害的字有{chuan_graveyard_zhi} ")
       # print(f"大运墓有{self.yun_graveyart} ")

        chuan_graveyard_zhi = list(set(chuan_graveyard_zhi))
        
        # 移除列表中的重复元素,找到自动入墓的地支
        for i in self.yun_graveyart:
          ru_mu=[zhi for zhi in chuan_graveyard_zhi if zhi in Mu[i]["墓"]] 
        #   bi_mu=[zhi for zhi in self.birth_chart if zhi in Mu[i]["闭"]]
        #   chong_mu=[zhi for zhi in self.birth_chart if zhi in Mu[i]["冲"]]
        #   chuan_mu=[zhi for zhi in self.birth_chart if zhi in Mu[i]["害"]]
          if ru_mu:
           # print(f"{ru_mu} : 入墓于 {i}。")
            self.update_graveyard_status(f"{year}",f"{yunGZ}大运 {ru_mu}入墓",'注意' )
  
        #   if bi_mu:
        #     print(f"{bi_mu} : 闭墓于 {i}。")
        #     self.update_graveyard_status("命局",f"{bi_mu}闭墓" )
        #   else:
        #      print(f"大运无闭{i}墓")
        #   if chong_mu:
        #     print(f"{chong_mu} : 冲墓于 {i}。")
        #     self.update_graveyard_status("大运",f"{chong_mu}冲墓" )
        #   else:
        #      print(f"大运无冲{i}墓")
        #   if chuan_mu:
        #     print(f"{chong_mu} : 穿害墓于 {i}。")
        #     self.update_graveyard_status("大运",f"{chuan_mu}穿害墓" )
        #   else:
        #      print(f"大运无穿害{i}墓")
                  
        for i in self.min_graveyart:
           bi_mu=[zhi for zhi in yunGZ if zhi in Mu[i]["闭"]]
           chong_mu=[zhi for zhi in yunGZ if zhi in Mu[i]["冲"]]
           chuan_mu=[zhi for zhi in yunGZ if zhi in Mu[i]["害"]]
           if bi_mu:
            #print(f"{bi_mu} : 闭墓于 {i}。")
            self.update_graveyard_status(f"{yunGZ}大运",f"{bi_mu}闭墓",'注意' )
          
           if chong_mu:
            #print(f"{chong_mu} : 冲墓于 {i}。")
            self.update_graveyard_status(f"{yunGZ}大运",f"{chong_mu}冲墓",'注意' )
       
           if chuan_mu:
            self.update_graveyard_status(f"{yunGZ}大运",f"{chuan_mu}穿害墓",'注意' )
          
        
        for i in self.min_graveyart:
           bi_mu=[zhi for zhi in yearGZ if zhi in Mu[i]["闭"]]
           chong_mu=[zhi for zhi in yearGZ if zhi in Mu[i]["冲"]]
           chuan_mu=[zhi for zhi in yearGZ if zhi in Mu[i]["害"]]
           if bi_mu:
            #print(f"{bi_mu} : 闭墓于 {i}。")
            self.update_graveyard_status(f" {year} ",f" {yearGZ} {bi_mu}闭墓",'重要' )
          
           if chong_mu:
            #print(f"{chong_mu} : 冲墓于 {i}。")
            self.update_graveyard_status(f"{year}",f"{yearGZ} {chong_mu}冲墓",'重要' )
          
           if chuan_mu:
            #print(f"{chong_mu} : 穿害墓于 {i}。")
            self.update_graveyard_status(f"{year}",f"{yearGZ} {chuan_mu}穿害墓",'重要')
          


    def get_history(self):
        for item in self.major_cycle:
           yunGZ,yearGZ=item
           #print(f"8888888888{yunGZ} {yearGZ} ")
           year=1983
           self.yun_sss_graveyard(yunGZ,yearGZ,year)

    
    def get_deity_relationship(self,gan):
        # Check if the day_master and element are in the ten_deities mapping
        if gan in Ten_deities and  gan in Ten_deities[self.daymaster]:
            #print(f'{Ten_deities[self.daymaster][gan]}')
            return Ten_deities[self.daymaster][gan]
        else:
            return 'Unknown'

    
    def add_graveyard_type(self, type_name, zhi):
        """添加墓库类型"""
        if type_name in self.graveyard_types:
            self.graveyard_types[type_name].append(zhi)

    def update_graveyard_status(self, year, status,important):
        """记录墓库的状态变化"""
        self.graveyard_status.append({'year': year, 'status': status,'important':important})



class GraveyardTracker:
    def __init__(self):
        self.bazi_records = []

    def add_bazi_record(self, bazi_record):
        """添加八字记录"""
        self.bazi_records.append(bazi_record)

    def find_bazi_by_name(self, name):
        """通过名字查找八字记录"""
        for record in self.bazi_records:
            if record.name == name:
                return record
        return None

# 使用示例


