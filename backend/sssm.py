# 使用示例
tracker = GraveyardTracker()

# 创建一个八字记录
john_doe_bazi = BaziGraveyard('John Doe', ['丑', '酉', '辰', '亥','子','未','申' ], ['子', '丑'])
john_doe_bazi.min_sss_graveyard()
john_doe_bazi.yun_sss_graveyard()

tracker.add_bazi_record(john_doe_bazi)
record = tracker.find_bazi_by_name('John Doe')
print(record.name, record.graveyard_status,john_doe_bazi.graveyard_types)
