from datetime import datetime,timedelta
import sxtwl
from baziutil import Gan,Zhi,Dizhi_gx,Ten_deities,Zhi_atts,Branch_hidden_stems 

def today_all(year,gans,zhis,min_summary):
    #获取到今天的时间，取得年月日的干支信息：
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
    
    today_info=f"{Gan[year_ganzhi.tg]},{Zhi[year_ganzhi.dz]},{Gan[month_ganzhi.tg]},{Zhi[month_ganzhi.dz]},{Gan[day_ganzhi.tg]},{Zhi[day_ganzhi.dz]}"    
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
    score_gan={}
    for i in ln_gans:
         if i not in score_gan.index:
          score_gan.append({i:1})
         else:
          score_gan[i]+=1
    
    for j in ln_zhis:
        for i in Branch_hidden_stems[j]:
            if i not in score_gan.index:
                score_gan.append({i:1})
            else:
                score_gan[i]+=1

    print(score_gan)
    #干支之间相互作用
    # for zhi,gan in [[yearZhi,yearGan],(monthZhi,monthGan),(dayZhi,dayGan)]:
    #     interaction=Dizhi_gx[zhi][gan]  
    #     if "生" in interaction:
    #          relation.append(zhi+"生"+gan)
    #          score_gan=+1;
    #     if "被生" in interaction:
    #          relation.append(zhi+"生"+gan)
    #          score_gan=+1;
    #     if "克" in interaction:
    #          relation.append(zhi+"克"+gan)
    #          score_gan=-1;
    #     if "被克" in interaction:
    #          relation.append(zhi+"生"+gan)
    #          score_gan=-1;
   
    # #干之间相互作用
    # Ten_deities[yearGan][monthGan]
    # Ten_deities[yearGan][dayGan]
    # Ten_deities[monthGan][dayGan]

    # #支之间相互作用
    # Zhi_atts[yearZhi]['冲'] 

    return gan_zhi


print(today_all(2024,))