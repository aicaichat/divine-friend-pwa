import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import '../styles/userCenter.css';

interface UserCenterOptimizedProps {
  onNavigate: (page: string) => void;
}

interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  email: string;
  phone: string;
  gender: 'male' | 'female';
  birthday: string;
  birthHour?: number;
  birthMinute?: number;
  joinDate: string;
  level: number;
  experience: number;
  meritPoints: number;
  totalMerit: number;
  consecutiveDays: number;
}

interface BaziInfo {
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  isCompleted: boolean;
  lastModified: string;
}

interface Order {
  id: string;
  type: 'bracelet' | 'blessing' | 'consultation';
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  amount: number;
  date: string;
  image: string;
}

interface Wish {
  id: string;
  content: string;
  category: 'health' | 'career' | 'love' | 'family' | 'wealth' | 'study';
  status: 'active' | 'fulfilled' | 'cancelled';
  createDate: string;
  fulfillDate?: string;
  priority: 'high' | 'medium' | 'low';
}

const UserCenterOptimized: React.FC<UserCenterOptimizedProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'bazi' | 'orders' | 'merit' | 'wishes' | 'settings'>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [baziInfo, setBaziInfo] = useState<BaziInfo | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBazi, setEditingBazi] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showWishModal, setShowWishModal] = useState(false);
  const [newWish, setNewWish] = useState({ content: '', category: 'health', priority: 'medium' });

  const analytics = useAnalytics();

  // 模拟数据
  const mockUserProfile: UserProfile = {
    id: 'user001',
    nickname: '善心居士',
    avatar: '',
    email: 'user@example.com',
    phone: '138****8888',
    gender: 'male',
    birthday: '1990-06-15',
    birthHour: 14,
    birthMinute: 30,
    joinDate: '2024-01-15',
    level: 7,
    experience: 2150,
    meritPoints: 1248,
    totalMerit: 3567,
    consecutiveDays: 28
  };

  const mockOrders: Order[] = [
    {
      id: 'order001',
      type: 'bracelet',
      title: '小叶紫檀开光手串',
      status: 'completed',
      amount: 299,
      date: '2024-07-20',
      image: '📿'
    },
    {
      id: 'order002',
      type: 'blessing',
      title: '文殊菩萨智慧加持',
      status: 'processing',
      amount: 88,
      date: '2024-07-25',
      image: '🙏'
    },
    {
      id: 'order003',
      type: 'consultation',
      title: '大师八字详批',
      status: 'pending',
      amount: 168,
      date: '2024-07-27',
      image: '📋'
    }
  ];

  const mockWishes: Wish[] = [
    {
      id: 'wish001',
      content: '希望工作顺利，能够升职加薪',
      category: 'career',
      status: 'active',
      createDate: '2024-07-15',
      priority: 'high'
    },
    {
      id: 'wish002',
      content: '祈求家人身体健康，平安无事',
      category: 'health',
      status: 'active',
      createDate: '2024-07-10',
      priority: 'high'
    },
    {
      id: 'wish003',
      content: '希望能够找到真爱，早日结婚',
      category: 'love',
      status: 'fulfilled',
      createDate: '2024-06-01',
      fulfillDate: '2024-07-20',
      priority: 'medium'
    }
  ];

  useEffect(() => {
    loadUserData();
    analytics.trackPageView('user_center', '个人中心');
  }, []);

  const loadUserData = async () => {
    try {
      // 加载用户资料
      const savedProfile = localStorage.getItem('userProfile');
      let loadedProfile;
      if (savedProfile) {
        loadedProfile = JSON.parse(savedProfile);
        setUserProfile(loadedProfile);
      } else {
        loadedProfile = mockUserProfile;
        setUserProfile(loadedProfile);
      }

      // 加载八字信息
      const savedUserInfo = localStorage.getItem('userInfo');
      let loadedBazi;
      if (savedUserInfo) {
        const userInfo = JSON.parse(savedUserInfo);
        loadedBazi = {
          name: userInfo.name || '',
          gender: userInfo.gender || 'male',
          birthYear: userInfo.birthYear || new Date().getFullYear() - 25,
          birthMonth: userInfo.birthMonth || 1,
          birthDay: userInfo.birthDay || 1,
          birthHour: userInfo.birthHour || 12,
          birthMinute: userInfo.birthMinute || 0,
          isCompleted: !!userInfo.name,
          lastModified: userInfo.lastModified || new Date().toISOString()
        };
        setBaziInfo(loadedBazi);
      }

      // 数据同步：如果八字信息存在但个人资料的时辰信息缺失，则同步
      if (loadedBazi && loadedProfile && !loadedProfile.birthHour) {
        const birthdayString = `${loadedBazi.birthYear}-${loadedBazi.birthMonth.toString().padStart(2, '0')}-${loadedBazi.birthDay.toString().padStart(2, '0')}`;
        const syncedProfile = {
          ...loadedProfile,
          birthday: birthdayString,
          birthHour: loadedBazi.birthHour,
          birthMinute: loadedBazi.birthMinute,
          gender: loadedBazi.gender
        };
        setUserProfile(syncedProfile);
        localStorage.setItem('userProfile', JSON.stringify(syncedProfile));
      }

      // 加载订单和愿望
      setOrders(mockOrders);
      setWishes(mockWishes);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      
      // 同步生日和时辰信息到八字信息
      if (userProfile?.birthday && baziInfo) {
        const birthDate = new Date(userProfile.birthday);
        const updatedBazi = {
          ...baziInfo,
          birthYear: birthDate.getFullYear(),
          birthMonth: birthDate.getMonth() + 1,
          birthDay: birthDate.getDate(),
          birthHour: userProfile.birthHour ?? baziInfo.birthHour,
          birthMinute: userProfile.birthMinute ?? baziInfo.birthMinute,
          gender: userProfile.gender,
          lastModified: new Date().toISOString()
        };
        setBaziInfo(updatedBazi);
        localStorage.setItem('userInfo', JSON.stringify(updatedBazi));
      }
      
      setIsEditing(false);
      analytics.trackUserAction('profile_updated');
      // 显示成功提示
      alert('个人信息保存成功！\n✓ 出生日期已同步到八字信息\n✓ 时辰信息已同步到八字信息');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('保存失败，请重试');
    }
  };

  const handleSaveBazi = async () => {
    try {
      if (baziInfo) {
        const updatedBazi = {
          ...baziInfo,
          isCompleted: true,
          lastModified: new Date().toISOString()
        };
        localStorage.setItem('userInfo', JSON.stringify(updatedBazi));
        setBaziInfo(updatedBazi);
        
        // 同步八字信息到个人资料
        if (userProfile) {
          const birthdayString = `${baziInfo.birthYear}-${baziInfo.birthMonth.toString().padStart(2, '0')}-${baziInfo.birthDay.toString().padStart(2, '0')}`;
          const updatedProfile = {
            ...userProfile,
            birthday: birthdayString,
            birthHour: baziInfo.birthHour,
            birthMinute: baziInfo.birthMinute,
            gender: baziInfo.gender
          };
          setUserProfile(updatedProfile);
          localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        }
        
        setEditingBazi(false);
        analytics.trackUserAction('bazi_updated');
        alert('八字信息保存成功！\n✓ 出生日期已同步到个人资料\n✓ 时辰信息已同步到个人资料');
      }
    } catch (error) {
      console.error('Failed to save bazi:', error);
      alert('保存失败，请重试');
    }
  };

  const handleAddWish = async () => {
    try {
      const wish: Wish = {
        id: `wish${Date.now()}`,
        content: newWish.content,
        category: newWish.category as any,
        status: 'active',
        createDate: new Date().toISOString().split('T')[0],
        priority: newWish.priority as any
      };
      
      setWishes(prev => [wish, ...prev]);
      setNewWish({ content: '', category: 'health', priority: 'medium' });
      setShowWishModal(false);
      analytics.trackUserAction('wish_added', { category: wish.category });
      alert('愿望添加成功！');
    } catch (error) {
      console.error('Failed to add wish:', error);
      alert('添加失败，请重试');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: '#faad14',
      processing: '#1890ff',
      completed: '#52c41a',
      cancelled: '#ff4d4f',
      active: '#1890ff',
      fulfilled: '#52c41a'
    };
    return colors[status as keyof typeof colors] || '#666';
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: '待处理',
      processing: '处理中',
      completed: '已完成',
      cancelled: '已取消',
      active: '许愿中',
      fulfilled: '已实现'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      health: '🏥',
      career: '💼',
      love: '💕',
      family: '👨‍👩‍👧‍👦',
      wealth: '💰',
      study: '📚',
      bracelet: '📿',
      blessing: '🙏',
      consultation: '📋'
    };
    return icons[category as keyof typeof icons] || '✨';
  };

  const getLevelInfo = (level: number, experience: number) => {
    const nextLevelExp = level * 500;
    const currentLevelExp = (level - 1) * 500;
    const progress = ((experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    
    return {
      currentLevel: level,
      nextLevel: level + 1,
      progress: Math.min(progress, 100),
      expToNext: nextLevelExp - experience
    };
  };

  const renderProfileTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 用户头像和基本信息 */}
      <div className="zen-card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
              {userProfile?.avatar || userProfile?.nickname?.charAt(0) || '👤'}
            </div>
            {isEditing && (
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full text-xs">
                📷
              </button>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {userProfile?.nickname || '未设置昵称'}
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-500 text-sm"
              >
                {isEditing ? '取消' : '编辑'}
              </button>
            </div>
            
            {userProfile && (
              <div className="mt-2">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded">
                    Lv.{userProfile.level}
                  </span>
                  <span className="text-sm text-gray-600">
                    修行者
                  </span>
                </div>
                
                {/* 经验条 */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getLevelInfo(userProfile.level, userProfile.experience).progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  距离下一级还需 {getLevelInfo(userProfile.level, userProfile.experience).expToNext} 经验
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 个人信息表单 */}
        {userProfile && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={userProfile.nickname}
                    onChange={(e) => setUserProfile(prev => prev ? {...prev, nickname: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-900">{userProfile.nickname}</div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
                {isEditing ? (
                  <select
                    value={userProfile.gender}
                    onChange={(e) => setUserProfile(prev => prev ? {...prev, gender: e.target.value as 'male' | 'female'} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="male">男</option>
                    <option value="female">女</option>
                  </select>
                ) : (
                  <div className="text-gray-900">{userProfile.gender === 'male' ? '男' : '女'}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile(prev => prev ? {...prev, email: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-900">{userProfile.email}</div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-900">{userProfile.phone}</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">出生信息</label>
              <p className="text-xs text-gray-500 mb-2">与八字信息同步</p>
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="date"
                    value={userProfile.birthday}
                    onChange={(e) => setUserProfile(prev => prev ? {...prev, birthday: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={userProfile.birthHour || 12}
                      onChange={(e) => setUserProfile(prev => prev ? {...prev, birthHour: parseInt(e.target.value)} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{i.toString().padStart(2, '0')}时</option>
                      ))}
                    </select>
                    <select
                      value={userProfile.birthMinute || 0}
                      onChange={(e) => setUserProfile(prev => prev ? {...prev, birthMinute: parseInt(e.target.value)} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {[0, 15, 30, 45].map(minute => (
                        <option key={minute} value={minute}>{minute.toString().padStart(2, '0')}分</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="text-gray-900">
                  <div>{userProfile.birthday}</div>
                  {(userProfile.birthHour !== undefined || userProfile.birthMinute !== undefined) && (
                    <div className="text-sm text-gray-600 mt-1">
                      {(userProfile.birthHour || 0).toString().padStart(2, '0')}时{(userProfile.birthMinute || 0).toString().padStart(2, '0')}分
                    </div>
                  )}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  取消
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 快速操作 */}
      <div className="zen-card">
        <h3 className="text-lg font-semibold mb-4">快速操作</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span>🔐</span>
            <span>修改密码</span>
          </button>
          <button
            onClick={() => {
              // 导航到现有的多步骤设置页面
              navigate('/settings-optimized');
            }}
            className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span>📅</span>
            <span>八字设置</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span>📋</span>
            <span>我的订单</span>
          </button>
          <button
            onClick={() => setActiveTab('wishes')}
            className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span>🌟</span>
            <span>许愿管理</span>
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="zen-card">
        <h3 className="text-lg font-semibold mb-4">修行统计</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{userProfile?.meritPoints || 0}</div>
            <div className="text-sm text-gray-600">当前功德</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{userProfile?.totalMerit || 0}</div>
            <div className="text-sm text-gray-600">总功德</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg">
            <div className="text-2xl font-bold text-teal-600">{userProfile?.consecutiveDays || 0}</div>
            <div className="text-sm text-gray-600">连续天数</div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderBaziTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="zen-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">八字信息</h3>
            <p className="text-xs text-gray-500 mt-1">与个人资料中的出生信息同步</p>
          </div>
          <div className="flex items-center space-x-3">
            {baziInfo?.isCompleted && (
              <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                ✓ 已完成
              </span>
            )}
            <button
              onClick={() => setEditingBazi(!editingBazi)}
              className="text-blue-500 text-sm"
            >
              {editingBazi ? '取消' : '编辑'}
            </button>
          </div>
        </div>

        {baziInfo ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                {editingBazi ? (
                  <input
                    type="text"
                    value={baziInfo.name}
                    onChange={(e) => setBaziInfo(prev => prev ? {...prev, name: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-900">{baziInfo.name || '未设置'}</div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
                {editingBazi ? (
                  <select
                    value={baziInfo.gender}
                    onChange={(e) => setBaziInfo(prev => prev ? {...prev, gender: e.target.value as 'male' | 'female'} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="male">男</option>
                    <option value="female">女</option>
                  </select>
                ) : (
                  <div className="text-gray-900">{baziInfo.gender === 'male' ? '男' : '女'}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">出生年</label>
                {editingBazi ? (
                  <input
                    type="number"
                    value={baziInfo.birthYear}
                    onChange={(e) => setBaziInfo(prev => prev ? {...prev, birthYear: parseInt(e.target.value)} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-900">{baziInfo.birthYear}年</div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">出生月</label>
                {editingBazi ? (
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={baziInfo.birthMonth}
                    onChange={(e) => setBaziInfo(prev => prev ? {...prev, birthMonth: parseInt(e.target.value)} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-900">{baziInfo.birthMonth}月</div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">出生日</label>
                {editingBazi ? (
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={baziInfo.birthDay}
                    onChange={(e) => setBaziInfo(prev => prev ? {...prev, birthDay: parseInt(e.target.value)} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-900">{baziInfo.birthDay}日</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">出生时</label>
                {editingBazi ? (
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={baziInfo.birthHour}
                    onChange={(e) => setBaziInfo(prev => prev ? {...prev, birthHour: parseInt(e.target.value)} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-900">{baziInfo.birthHour}时</div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">出生分</label>
                {editingBazi ? (
                  <select
                    value={baziInfo.birthMinute}
                    onChange={(e) => setBaziInfo(prev => prev ? {...prev, birthMinute: parseInt(e.target.value)} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>00分</option>
                    <option value={15}>15分</option>
                    <option value={30}>30分</option>
                    <option value={45}>45分</option>
                  </select>
                ) : (
                  <div className="text-gray-900">{baziInfo.birthMinute.toString().padStart(2, '0')}分</div>
                )}
              </div>
            </div>

            {baziInfo.lastModified && (
              <div className="text-sm text-gray-500 pt-2 border-t">
                最后修改: {new Date(baziInfo.lastModified).toLocaleString()}
              </div>
            )}

            {editingBazi && (
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSaveBazi}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  保存八字
                </button>
                <button
                  onClick={() => setEditingBazi(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  取消
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📅</div>
            <div className="text-gray-500 mb-4">还未设置八字信息</div>
            <button
              onClick={() => setEditingBazi(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              立即设置
            </button>
          </div>
        )}
      </div>

      {/* 八字解读 */}
      {baziInfo?.isCompleted && (
        <div className="zen-card">
          <h3 className="text-lg font-semibold mb-4">八字解读</h3>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">根据您的出生信息分析：</div>
            <div className="space-y-2 text-sm">
              <div>• 五行属性：木旺，需要金来平衡</div>
              <div>• 性格特点：积极进取，富有创造力</div>
              <div>• 适合职业：创意、教育、医疗相关</div>
              <div>• 幸运颜色：白色、金色</div>
              <div>• 幸运数字：4、9</div>
            </div>
            <button
              onClick={() => onNavigate('deity-chat')}
              className="mt-3 text-blue-500 text-sm hover:text-blue-600"
            >
              找神仙详细解读 →
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderOrdersTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {orders.map((order) => (
        <div key={order.id} className="zen-card">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">{getCategoryIcon(order.type)}</div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{order.title}</h4>
                <span 
                  className="text-sm px-2 py-1 rounded"
                  style={{ 
                    backgroundColor: `${getStatusColor(order.status)}20`,
                    color: getStatusColor(order.status)
                  }}
                >
                  {getStatusText(order.status)}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-gray-500">
                  {order.date}
                </div>
                <div className="text-lg font-bold text-orange-600">
                  ¥{order.amount}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            {order.status === 'pending' && (
              <button className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg text-sm">
                取消订单
              </button>
            )}
            {order.status === 'processing' && (
              <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm">
                查看进度
              </button>
            )}
            {order.status === 'completed' && (
              <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg text-sm">
                再次购买
              </button>
            )}
            <button className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm">
              订单详情
            </button>
          </div>
        </div>
      ))}
      
      {orders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <div className="text-gray-500 mb-4">暂无订单记录</div>
          <button
            onClick={() => onNavigate('home')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            去逛逛
          </button>
        </div>
      )}
    </motion.div>
  );

  const renderMeritTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 功德概览 */}
      <div className="zen-card">
        <h3 className="text-lg font-semibold mb-4">功德概览</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-orange-600">{userProfile?.meritPoints || 0}</div>
            <div className="text-sm text-gray-600">当前功德</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-600">{userProfile?.totalMerit || 0}</div>
            <div className="text-sm text-gray-600">累计功德</div>
          </div>
        </div>
      </div>

      {/* 功德等级 */}
      <div className="zen-card">
        <h3 className="text-lg font-semibold mb-4">修行等级</h3>
        <div className="flex items-center space-x-3 mb-3">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Lv.{userProfile?.level || 1}
          </span>
          <span className="text-gray-600">善心居士</span>
        </div>
        
        {userProfile && (
          <div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getLevelInfo(userProfile.level, userProfile.experience).progress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>经验: {userProfile.experience}</span>
              <span>下一级: {getLevelInfo(userProfile.level, userProfile.experience).expToNext} exp</span>
            </div>
          </div>
        )}
      </div>

      {/* 功德记录 */}
      <div className="zen-card">
        <h3 className="text-lg font-semibold mb-4">功德记录</h3>
        <div className="space-y-3">
          {[
            { action: '每日签到', points: '+10', date: '2024-07-27', type: 'earn' },
            { action: '诵读心经', points: '+20', date: '2024-07-27', type: 'earn' },
            { action: '购买手串', points: '-150', date: '2024-07-25', type: 'spend' },
            { action: '祈福许愿', points: '+15', date: '2024-07-24', type: 'earn' },
            { action: '分享好友', points: '+25', date: '2024-07-23', type: 'earn' }
          ].map((record, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <div className="font-medium text-gray-900">{record.action}</div>
                <div className="text-sm text-gray-500">{record.date}</div>
              </div>
              <div className={`font-bold ${record.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                {record.points}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 功德兑换 */}
      <div className="zen-card">
        <h3 className="text-lg font-semibold mb-4">功德兑换</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-2xl mb-1">🙏</div>
            <div className="text-sm font-medium">祈福服务</div>
            <div className="text-xs text-gray-500">50功德</div>
          </button>
          <button className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-2xl mb-1">📿</div>
            <div className="text-sm font-medium">开光手串</div>
            <div className="text-xs text-gray-500">200功德</div>
          </button>
          <button className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-2xl mb-1">📋</div>
            <div className="text-sm font-medium">命理详批</div>
            <div className="text-xs text-gray-500">100功德</div>
          </button>
          <button className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="text-2xl mb-1">🎁</div>
            <div className="text-sm font-medium">专属礼品</div>
            <div className="text-xs text-gray-500">300功德</div>
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderWishesTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* 添加愿望按钮 */}
      <button
        onClick={() => setShowWishModal(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
      >
        <span className="text-2xl">✨</span>
        <span className="text-gray-600">添加新愿望</span>
      </button>

      {/* 愿望列表 */}
      {wishes.map((wish) => (
        <div key={wish.id} className="zen-card">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">{getCategoryIcon(wish.category)}</div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span 
                  className="text-xs px-2 py-1 rounded"
                  style={{ 
                    backgroundColor: `${getStatusColor(wish.status)}20`,
                    color: getStatusColor(wish.status)
                  }}
                >
                  {getStatusText(wish.status)}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  wish.priority === 'high' ? 'bg-red-100 text-red-600' :
                  wish.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {wish.priority === 'high' ? '重要' : wish.priority === 'medium' ? '一般' : '不急'}
                </span>
              </div>
              
              <div className="text-gray-900 mb-2">{wish.content}</div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>许愿时间: {wish.createDate}</span>
                {wish.fulfillDate && (
                  <span className="text-green-600">实现时间: {wish.fulfillDate}</span>
                )}
              </div>
            </div>
          </div>
          
          {wish.status === 'active' && (
            <div className="flex space-x-2 mt-4">
              <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg text-sm">
                标记实现
              </button>
              <button className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm">
                取消愿望
              </button>
            </div>
          )}
        </div>
      ))}
      
      {wishes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🌟</div>
          <div className="text-gray-500 mb-4">还没有许愿记录</div>
          <button
            onClick={() => setShowWishModal(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            许下第一个愿望
          </button>
        </div>
      )}
    </motion.div>
  );

  const renderSettingsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* 通知设置 */}
      <div className="zen-card">
        <h3 className="text-lg font-semibold mb-4">通知设置</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>每日提醒</span>
            <button className="w-12 h-6 bg-blue-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span>功德更新通知</span>
            <button className="w-12 h-6 bg-gray-300 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span>愿望实现提醒</span>
            <button className="w-12 h-6 bg-blue-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </button>
          </div>
        </div>
      </div>

      {/* 隐私设置 */}
      <div className="zen-card">
        <h3 className="text-lg font-semibold mb-4">隐私设置</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>个人资料公开</span>
            <button className="w-12 h-6 bg-gray-300 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span>修行记录可见</span>
            <button className="w-12 h-6 bg-blue-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </button>
          </div>
        </div>
      </div>

      {/* 其他设置 */}
      <div className="zen-card">
        <h3 className="text-lg font-semibold mb-4">其他</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>缓存清理</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>关于我们</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span>用户协议</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full flex items-center justify-between p-3 bg-red-50 rounded-lg text-red-600">
            <span>退出登录</span>
            <span className="text-red-400">→</span>
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--zen-bg-primary)',
      padding: 'var(--zen-space-xl) var(--zen-space-lg) 100px',
      position: 'relative'
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 50%)',
        zIndex: -1
      }} />

      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* 标题 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">个人中心</h1>
          <p className="text-gray-600">管理您的修行之路</p>
        </motion.div>

        {/* 标签导航 */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-1">
          <div className="grid grid-cols-6 gap-1">
            {[
              { key: 'profile', icon: '👤', label: '资料' },
              { key: 'bazi', icon: '📅', label: '八字' },
              { key: 'orders', icon: '📋', label: '订单' },
              { key: 'merit', icon: '🏆', label: '功德' },
              { key: 'wishes', icon: '🌟', label: '愿望' },
              { key: 'settings', icon: '⚙️', label: '设置' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`p-3 rounded-lg text-center transition-all ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="text-lg mb-1">{tab.icon}</div>
                <div className="text-xs">{tab.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="min-h-[500px]">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'bazi' && renderBaziTab()}
          {activeTab === 'orders' && renderOrdersTab()}
          {activeTab === 'merit' && renderMeritTab()}
          {activeTab === 'wishes' && renderWishesTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>
      </div>

      {/* 修改密码模态框 */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 m-4 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">修改密码</h3>
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="当前密码"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder="新密码"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder="确认新密码"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    alert('密码修改成功！');
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg"
                >
                  确认
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 添加愿望模态框 */}
      <AnimatePresence>
        {showWishModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowWishModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 m-4 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">许下愿望</h3>
              <div className="space-y-4">
                <textarea
                  placeholder="写下您的愿望..."
                  value={newWish.content}
                  onChange={(e) => setNewWish(prev => ({...prev, content: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                />
                <select
                  value={newWish.category}
                  onChange={(e) => setNewWish(prev => ({...prev, category: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="health">健康</option>
                  <option value="career">事业</option>
                  <option value="love">爱情</option>
                  <option value="family">家庭</option>
                  <option value="wealth">财富</option>
                  <option value="study">学业</option>
                </select>
                <select
                  value={newWish.priority}
                  onChange={(e) => setNewWish(prev => ({...prev, priority: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="high">重要</option>
                  <option value="medium">一般</option>
                  <option value="low">不急</option>
                </select>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowWishModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={handleAddWish}
                  disabled={!newWish.content.trim()}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg disabled:opacity-50"
                >
                  许愿
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserCenterOptimized; 