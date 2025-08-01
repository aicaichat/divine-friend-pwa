import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  realName: string;
  gender: 'male' | 'female' | 'other';
  birthday: string;
  birthTime: string; // 出生时间 (HH:mm)
  birthTimeZone: string; // 时区
  lunarBirthday?: string; // 农历生日（可选）
  location: string;
  bio: string;
  createdAt: string;
  lastLoginAt: string;
}

// 传统时辰对照表
const TRADITIONAL_HOURS = [
  { key: '23:00-01:00', name: '子时', description: '夜半，又名子夜、中夜' },
  { key: '01:00-03:00', name: '丑时', description: '鸡鸣，又名荒鸡' },
  { key: '03:00-05:00', name: '寅时', description: '平旦，又名黎明、早晨、日旦' },
  { key: '05:00-07:00', name: '卯时', description: '日出，又名日始、破晓、旭日' },
  { key: '07:00-09:00', name: '辰时', description: '食时，又名早食' },
  { key: '09:00-11:00', name: '巳时', description: '隅中，又名日禺' },
  { key: '11:00-13:00', name: '午时', description: '日中，又名日正、中午' },
  { key: '13:00-15:00', name: '未时', description: '日昳，又名日跌、日央' },
  { key: '15:00-17:00', name: '申时', description: '晡时，又名日铺、夕食' },
  { key: '17:00-19:00', name: '酉时', description: '日入，又名日落、日沉、傍晚' },
  { key: '19:00-21:00', name: '戌时', description: '黄昏，又名日夕、日暮、日晚' },
  { key: '21:00-23:00', name: '亥时', description: '人定，又名定昏' }
];

interface ProfilePageProps {
  onNavigate?: (page: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  // 检查 URL 参数来确定显示模式
  const [currentMode, setCurrentMode] = useState<'profile' | 'settings'>('profile');
  
  const [profile, setProfile] = useState<UserProfile>({
    id: 'user_001',
    username: '修行者',
    email: 'user@example.com',
    phone: '138****8888',
    avatar: '',
    realName: '张三',
    gender: 'male',
    birthday: '1990-01-01',
    birthTime: '08:30', // 默认辰时
    birthTimeZone: '+08:00', // 北京时间
    lunarBirthday: '',
    location: '北京市',
    bio: '心向佛法，追求内心的平静与智慧',
    createdAt: '2024-01-01',
    lastLoginAt: '2024-01-27'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<UserProfile>(profile);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTimeHelper, setShowTimeHelper] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // 解析 URL 参数，确定当前模式
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    
    if (pageParam === 'settings') {
      setCurrentMode('settings');
      setIsEditing(true); // 如果是设置模式，直接进入编辑状态
    } else {
      setCurrentMode('profile');
    }
  }, []);

  // 获取时间对应的传统时辰
  const getTraditionalHour = (time: string): string => {
    // 参数验证 - 防止undefined或空字符串
    if (!time || typeof time !== 'string' || !time.includes(':')) {
      return '未设置';
    }
    
    try {
      const [hours, minutes] = time.split(':').map(Number);
      
      // 验证小时和分钟是否为有效数字
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return '无效时间';
      }
      
      const totalMinutes = hours * 60 + minutes;
      
      // 子时特殊处理（跨日）
      if (totalMinutes >= 23 * 60 || totalMinutes < 1 * 60) return '子时';
      if (totalMinutes >= 1 * 60 && totalMinutes < 3 * 60) return '丑时';
      if (totalMinutes >= 3 * 60 && totalMinutes < 5 * 60) return '寅时';
      if (totalMinutes >= 5 * 60 && totalMinutes < 7 * 60) return '卯时';
      if (totalMinutes >= 7 * 60 && totalMinutes < 9 * 60) return '辰时';
      if (totalMinutes >= 9 * 60 && totalMinutes < 11 * 60) return '巳时';
      if (totalMinutes >= 11 * 60 && totalMinutes < 13 * 60) return '午时';
      if (totalMinutes >= 13 * 60 && totalMinutes < 15 * 60) return '未时';
      if (totalMinutes >= 15 * 60 && totalMinutes < 17 * 60) return '申时';
      if (totalMinutes >= 17 * 60 && totalMinutes < 19 * 60) return '酉时';
      if (totalMinutes >= 19 * 60 && totalMinutes < 21 * 60) return '戌时';
      if (totalMinutes >= 21 * 60 && totalMinutes < 23 * 60) return '亥时';
      
      return '未知';
    } catch (error) {
      console.error('时辰计算错误:', error);
      return '计算错误';
    }
  };

  // 生成八字信息预览
  const generateBaziPreview = (birthday: string, birthTime: string): string => {
    if (!birthday || !birthTime) return '需要完整的出生日期和时间';
    
    try {
      const date = new Date(birthday);
      
      // 验证日期是否有效
      if (isNaN(date.getTime())) {
        return '出生日期格式无效';
      }
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const traditionalHour = getTraditionalHour(birthTime);
      
      // 检查时辰是否有效
      if (traditionalHour === '未设置' || traditionalHour === '无效时间' || traditionalHour === '计算错误') {
        return `${year}年${month}月${day}日 ${birthTime} (时辰待设置)`;
      }
      
      return `${year}年${month}月${day}日 ${birthTime} (${traditionalHour})`;
    } catch (error) {
      console.error('八字预览生成错误:', error);
      return '八字信息生成失败';
    }
  };

  useEffect(() => {
    // 模拟从后端加载用户资料
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 从localStorage获取用户数据（如果有的话）
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        
        // 合并默认值，确保新字段有默认值
        const mergedProfile = {
          ...profile, // 默认值
          ...parsedProfile, // 覆盖已保存的值
          // 确保关键字段有默认值
          birthTime: parsedProfile.birthTime || '08:30',
          birthTimeZone: parsedProfile.birthTimeZone || '+08:00',
          lunarBirthday: parsedProfile.lunarBirthday || ''
        };
        
        setProfile(mergedProfile);
        setEditProfile(mergedProfile);
      }
    } catch (error) {
      showMessage('error', '加载用户资料失败');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // 验证必填字段
      if (!editProfile.username.trim()) {
        showMessage('error', '用户名不能为空');
        return;
      }
      
      if (!editProfile.email.trim()) {
        showMessage('error', '邮箱不能为空');
        return;
      }

      if (!editProfile.birthday) {
        showMessage('error', '请选择出生日期');
        return;
      }

      if (!editProfile.birthTime) {
        showMessage('error', '请选择出生时间');
        return;
      }

      // 验证时间格式
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(editProfile.birthTime)) {
        showMessage('error', '出生时间格式不正确');
        return;
      }
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 保存到localStorage
      localStorage.setItem('userProfile', JSON.stringify(editProfile));
      
      setProfile(editProfile);
      setIsEditing(false);
      showMessage('success', '个人资料保存成功');
    } catch (error) {
      showMessage('error', '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      showMessage('error', '请输入当前密码');
      return;
    }
    
    if (!passwordData.newPassword) {
      showMessage('error', '请输入新密码');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', '两次输入的密码不一致');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showMessage('error', '新密码至少6位');
      return;
    }

    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMessage('success', '密码修改成功');
    } catch (error) {
      showMessage('error', '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatar = e.target?.result as string;
        setEditProfile(prev => ({ ...prev, avatar }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderViewMode = () => (
    <div className="space-y-6">
      {/* 头像和基本信息 */}
      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
        <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
          {profile.avatar ? (
            <img src={profile.avatar} alt="头像" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl text-gray-600">👤</span>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{profile.username}</h2>
          <p className="text-blue-100">{profile.realName}</p>
          <p className="text-blue-200 text-sm">最后登录: {profile.lastLoginAt}</p>
        </div>
      </div>

      {/* 详细信息 */}
      <div className="space-y-4">
        <div className="zen-card">
          <h3 className="text-lg font-semibold mb-4 text-white">基本信息</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white opacity-80">邮箱</span>
              <span className="text-white">{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white opacity-80">手机</span>
              <span className="text-white">{profile.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white opacity-80">性别</span>
              <span className="text-white">
                {profile.gender === 'male' ? '男' : profile.gender === 'female' ? '女' : '其他'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white opacity-80">生日</span>
              <span className="text-white">{profile.birthday}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white opacity-80">出生时间</span>
              <span className="text-white">
                {profile.birthTime || '未设置'} ({getTraditionalHour(profile.birthTime)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white opacity-80">所在地</span>
              <span className="text-white">{profile.location}</span>
            </div>
          </div>
        </div>

        <div className="zen-card">
          <h3 className="text-lg font-semibold mb-4 text-white">八字信息预览</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white opacity-80">出生信息</span>
              <span className="text-white">{generateBaziPreview(profile.birthday, profile.birthTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white opacity-80">时辰</span>
              <span className="text-white">{getTraditionalHour(profile.birthTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white opacity-80">时区</span>
              <span className="text-white">{profile.birthTimeZone}</span>
            </div>
            {profile.lunarBirthday && (
              <div className="flex justify-between">
                <span className="text-white opacity-80">农历生日</span>
                <span className="text-white">{profile.lunarBirthday}</span>
              </div>
            )}
          </div>
          <div className="mt-4 p-3 bg-yellow-500 bg-opacity-20 rounded-lg border border-yellow-500 border-opacity-30">
            <p className="text-yellow-300 text-sm">
              💡 完整的出生时间信息有助于精确计算八字和个人运势
            </p>
          </div>
        </div>

        <div className="zen-card">
          <h3 className="text-lg font-semibold mb-4 text-white">个人简介</h3>
          <p className="text-white opacity-80">{profile.bio || '暂无个人简介'}</p>
        </div>

        <div className="zen-card">
          <h3 className="text-lg font-semibold mb-4 text-white">账户信息</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white opacity-80">用户ID</span>
              <span className="text-white text-sm">{profile.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white opacity-80">注册时间</span>
              <span className="text-white">{profile.createdAt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-3">
        <button
          onClick={() => setIsEditing(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
        >
          编辑资料
        </button>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all"
        >
          修改密码
        </button>
        <button
          onClick={() => onNavigate?.('home')}
          className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all"
        >
          返回首页
        </button>
      </div>
    </div>
  );

  const renderEditMode = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">编辑资料</h2>
        <button
          onClick={() => {
            setIsEditing(false);
            setEditProfile(profile);
          }}
          className="text-gray-400 hover:text-white"
        >
          取消
        </button>
      </div>

      {/* 头像编辑 */}
      <div className="zen-card">
        <h3 className="text-lg font-semibold mb-4 text-white">头像</h3>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
            {editProfile.avatar ? (
              <img src={editProfile.avatar} alt="头像" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl text-gray-600">👤</span>
            )}
          </div>
          <div>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <label
              htmlFor="avatar-upload"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600"
            >
              选择头像
            </label>
          </div>
        </div>
      </div>

      {/* 基本信息编辑 */}
      <div className="zen-card">
        <h3 className="text-lg font-semibold mb-4 text-white">基本信息</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white opacity-80 mb-2">用户名 *</label>
            <input
              type="text"
              value={editProfile.username}
              onChange={(e) => setEditProfile(prev => ({...prev, username: e.target.value}))}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
              placeholder="请输入用户名"
            />
          </div>
          <div>
            <label className="block text-white opacity-80 mb-2">真实姓名</label>
            <input
              type="text"
              value={editProfile.realName}
              onChange={(e) => setEditProfile(prev => ({...prev, realName: e.target.value}))}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
              placeholder="请输入真实姓名"
            />
          </div>
          <div>
            <label className="block text-white opacity-80 mb-2">邮箱 *</label>
            <input
              type="email"
              value={editProfile.email}
              onChange={(e) => setEditProfile(prev => ({...prev, email: e.target.value}))}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
              placeholder="请输入邮箱"
            />
          </div>
          <div>
            <label className="block text-white opacity-80 mb-2">手机号</label>
            <input
              type="tel"
              value={editProfile.phone}
              onChange={(e) => setEditProfile(prev => ({...prev, phone: e.target.value}))}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
              placeholder="请输入手机号"
            />
          </div>
          <div>
            <label className="block text-white opacity-80 mb-2">性别</label>
            <select
              value={editProfile.gender}
              onChange={(e) => setEditProfile(prev => ({...prev, gender: e.target.value as any}))}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
            >
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div>
            <label className="block text-white opacity-80 mb-2">生日</label>
            <input
              type="date"
              value={editProfile.birthday}
              onChange={(e) => setEditProfile(prev => ({...prev, birthday: e.target.value}))}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-white opacity-80 mb-2">出生时间 *</label>
            <div className="space-y-3">
              <input
                type="time"
                value={editProfile.birthTime}
                onChange={(e) => setEditProfile(prev => ({...prev, birthTime: e.target.value}))}
                className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
              />
              <div className="flex items-center justify-between p-3 bg-blue-500 bg-opacity-20 rounded-lg border border-blue-500 border-opacity-30">
                <div>
                  <span className="text-blue-300">当前时辰: </span>
                  <span className="text-blue-200 font-semibold">{getTraditionalHour(editProfile.birthTime)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTimeHelper(!showTimeHelper)}
                  className="text-blue-300 hover:text-blue-200 text-sm"
                >
                  {showTimeHelper ? '隐藏' : '时辰对照'}
                </button>
              </div>
              
              {showTimeHelper && (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                  <h4 className="text-white font-semibold mb-3">传统时辰对照表</h4>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {TRADITIONAL_HOURS.map((hour) => {
                      const isSelected = hour.name === getTraditionalHour(editProfile.birthTime);
                      return (
                        <button
                          key={hour.key}
                          type="button"
                          onClick={() => {
                            // 设置为时辰的中间时间
                            const [start] = hour.key.split('-');
                            const [hours, minutes] = start.split(':').map(Number);
                            const midTime = `${String(hours + 1).padStart(2, '0')}:00`;
                            setEditProfile(prev => ({...prev, birthTime: midTime}));
                          }}
                          className={`text-left p-2 rounded transition-colors ${
                            isSelected 
                              ? 'bg-blue-500 bg-opacity-30 border border-blue-500' 
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          <div className="text-white font-medium">{hour.name}</div>
                          <div className="text-gray-400 text-sm">{hour.key}</div>
                          <div className="text-gray-300 text-xs">{hour.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-white opacity-80 mb-2">时区</label>
            <select
              value={editProfile.birthTimeZone}
              onChange={(e) => setEditProfile(prev => ({...prev, birthTimeZone: e.target.value}))}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
            >
              <option value="+08:00">北京时间 (UTC+8)</option>
              <option value="+09:00">日本时间 (UTC+9)</option>
              <option value="+07:00">泰国时间 (UTC+7)</option>
              <option value="+00:00">格林威治时间 (UTC+0)</option>
              <option value="-05:00">美东时间 (UTC-5)</option>
              <option value="-08:00">美西时间 (UTC-8)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white opacity-80 mb-2">农历生日 (可选)</label>
            <input
              type="text"
              value={editProfile.lunarBirthday || ''}
              onChange={(e) => setEditProfile(prev => ({...prev, lunarBirthday: e.target.value}))}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
              placeholder="例如：庚午年五月初八"
            />
          </div>
          <div>
            <label className="block text-white opacity-80 mb-2">所在地</label>
            <input
              type="text"
              value={editProfile.location}
              onChange={(e) => setEditProfile(prev => ({...prev, location: e.target.value}))}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
              placeholder="请输入所在地"
            />
          </div>
          <div>
            <label className="block text-white opacity-80 mb-2">个人简介</label>
            <textarea
              value={editProfile.bio}
              onChange={(e) => setEditProfile(prev => ({...prev, bio: e.target.value}))}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
              rows={4}
              placeholder="请输入个人简介"
            />
          </div>
        </div>
      </div>

      {/* 保存按钮 */}
      <button
        onClick={handleSaveProfile}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
      >
        {loading ? '保存中...' : '保存资料'}
      </button>
    </div>
  );

  // 设置模式渲染（专注于八字相关信息）
  const renderSettingsMode = () => (
    <div className="zen-card">
      <h3 className="text-lg font-semibold mb-6 text-white">八字信息设置</h3>
      
      <div className="space-y-6">
        {/* 真实姓名 */}
        <div>
          <label className="block text-white opacity-80 mb-2">真实姓名 *</label>
          <input
            type="text"
            value={editProfile.realName}
            onChange={(e) => setEditProfile(prev => ({...prev, realName: e.target.value}))}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
            placeholder="请输入真实姓名（用于八字计算）"
          />
          <p className="text-xs text-gray-400 mt-1">真实姓名用于准确的命理分析</p>
        </div>

        {/* 性别 */}
        <div>
          <label className="block text-white opacity-80 mb-2">性别 *</label>
          <select
            value={editProfile.gender}
            onChange={(e) => setEditProfile(prev => ({...prev, gender: e.target.value as any}))}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          >
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="other">其他</option>
          </select>
        </div>

        {/* 出生日期 */}
        <div>
          <label className="block text-white opacity-80 mb-2">出生日期 *</label>
          <input
            type="date"
            value={editProfile.birthday}
            onChange={(e) => setEditProfile(prev => ({...prev, birthday: e.target.value}))}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
          />
        </div>

        {/* 出生时间 */}
        <div>
          <label className="block text-white opacity-80 mb-2">出生时间 *</label>
          <div className="flex space-x-2 items-center">
            <input
              type="time"
              value={editProfile.birthTime}
              onChange={(e) => setEditProfile(prev => ({...prev, birthTime: e.target.value}))}
              className="flex-1 p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
            />
            <button
              onClick={() => setShowTimeHelper(!showTimeHelper)}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              时辰
            </button>
          </div>
          {editProfile.birthTime && (
            <p className="text-sm text-blue-400 mt-2">
              对应时辰：{getTraditionalHour(editProfile.birthTime)}
            </p>
          )}
        </div>

        {/* 时辰帮助 */}
        {showTimeHelper && (
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <h4 className="text-white font-semibold mb-3">传统时辰对照表</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {TRADITIONAL_HOURS.map((hour) => (
                <div
                  key={hour.key}
                  className="flex justify-between items-center p-2 rounded bg-gray-600 hover:bg-gray-500 cursor-pointer"
                  onClick={() => {
                    const timeRange = hour.key.split('-');
                    const startTime = timeRange[0];
                    setEditProfile(prev => ({...prev, birthTime: startTime}));
                    setShowTimeHelper(false);
                  }}
                >
                  <span className="text-yellow-400 font-medium">{hour.name}</span>
                  <span className="text-gray-300">{hour.key}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 出生地 */}
        <div>
          <label className="block text-white opacity-80 mb-2">出生地 *</label>
          <input
            type="text"
            value={editProfile.location}
            onChange={(e) => setEditProfile(prev => ({...prev, location: e.target.value}))}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
            placeholder="请输入出生地（城市级别）"
          />
          <p className="text-xs text-gray-400 mt-1">出生地用于确定真太阳时和地理坐标</p>
        </div>

        {/* 农历生日 */}
        <div>
          <label className="block text-white opacity-80 mb-2">农历生日 (可选)</label>
          <input
            type="text"
            value={editProfile.lunarBirthday || ''}
            onChange={(e) => setEditProfile(prev => ({...prev, lunarBirthday: e.target.value}))}
            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
            placeholder="例如：庚午年五月初八"
          />
          <p className="text-xs text-gray-400 mt-1">农历信息有助于更准确的命理分析</p>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="mt-8 space-y-3">
        <button
          onClick={() => {
            handleSaveProfile();
            // 保存后自动返回个人资料页面
            setTimeout(() => {
              setCurrentMode('profile');
              setIsEditing(false);
              const url = new URL(window.location.href);
              url.searchParams.delete('page');
              window.history.pushState({}, '', url.toString());
            }, 1500);
          }}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存八字信息'}
        </button>
        
        <button
          onClick={() => {
            setCurrentMode('profile');
            setIsEditing(false);
            setEditProfile(profile); // 重置编辑状态
            const url = new URL(window.location.href);
            url.searchParams.delete('page');
            window.history.pushState({}, '', url.toString());
          }}
          className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all"
        >
          取消
        </button>
      </div>
    </div>
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
          {currentMode === 'settings' && (
            <button
              onClick={() => {
                setCurrentMode('profile');
                setIsEditing(false);
                const url = new URL(window.location.href);
                url.searchParams.delete('page');
                window.history.pushState({}, '', url.toString());
              }}
              className="mb-4 flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← 返回个人资料
            </button>
          )}
          <h1 className="text-3xl font-bold text-white mb-2">
            {currentMode === 'settings' ? '八字设置' : '个人资料'}
          </h1>
          <p className="text-white opacity-80">
            {currentMode === 'settings' ? '设置您的详细出生信息' : '管理您的个人信息'}
          </p>
        </motion.div>

        {/* 消息提示 */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-4 p-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-500 bg-opacity-20 border border-green-500 text-green-400'
                  : 'bg-red-500 bg-opacity-20 border border-red-500 text-red-400'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 主要内容 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {loading && !isEditing ? (
            <div className="zen-card text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-white opacity-80">加载中...</p>
            </div>
          ) : currentMode === 'settings' ? renderSettingsMode() : isEditing ? renderEditMode() : renderViewMode()}
        </motion.div>
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
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">修改密码</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white opacity-80 mb-2">当前密码</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
                    placeholder="请输入当前密码"
                  />
                </div>
                <div>
                  <label className="block text-white opacity-80 mb-2">新密码</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
                    placeholder="请输入新密码"
                  />
                </div>
                <div>
                  <label className="block text-white opacity-80 mb-2">确认新密码</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500"
                    placeholder="请再次输入新密码"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? '修改中...' : '确认'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage; 