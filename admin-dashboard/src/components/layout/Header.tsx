import React from 'react'
import { Layout, Dropdown, Avatar, Badge, Button, Space, Typography } from 'antd'
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  MenuOutlined
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAuthStore } from '@store/authStore'
import { useLayoutStore } from '@store/layoutStore'

const { Header: AntHeader } = Layout
const { Text } = Typography

const Header: React.FC = () => {
  const { user, logout } = useAuthStore()
  const { isMobile, toggleSidebar } = useLayoutStore()

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账户设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: '帮助中心',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
      danger: true,
    },
  ]

  const notificationMenuItems: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            系统维护通知
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            系统将于今晚23:00进行维护，预计1小时
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            2小时前
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            新用户注册激增
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            今日新增用户较昨日增长156%
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            4小时前
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            API响应时间异常
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            运势计算API平均响应时间超过5秒
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            1天前
          </div>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'viewAll',
      label: (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <Button type="link" size="small">
            查看所有通知
          </Button>
        </div>
      ),
    },
  ]

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      {/* 左侧区域 */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* 移动端菜单按钮 */}
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={toggleSidebar}
            style={{
              marginRight: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40
            }}
          />
        )}
        <div>
          <Text style={{ fontSize: 18, fontWeight: 600, color: '#1f2937' }}>
            管理后台
          </Text>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: -2 }}>
            {new Date().toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </div>
        </div>
      </div>

      {/* 右侧区域 */}
      <Space size={16}>
        {/* 系统状态指示器 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '4px 12px',
          background: '#f0f9ff',
          borderRadius: 16,
          border: '1px solid #e0f2fe'
        }}>
          <div style={{
            width: 8,
            height: 8,
            background: '#10b981',
            borderRadius: '50%',
            marginRight: 6,
            animation: 'pulse 2s infinite'
          }} />
          <Text style={{ fontSize: 12, color: '#065f46' }}>
            系统正常
          </Text>
        </div>

        {/* 通知 */}
        <Dropdown
          menu={{ items: notificationMenuItems }}
          trigger={['click']}
          placement="bottomRight"
          overlayStyle={{ width: 320 }}
        >
          <Badge count={3} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40
              }}
            />
          </Badge>
        </Dropdown>

        {/* 用户菜单 */}
        <Dropdown 
          menu={{ items: userMenuItems }} 
          trigger={['click']}
          placement="bottomRight"
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: 8,
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
          >
            <Avatar
              size={32}
              src={user?.avatar}
              icon={<UserOutlined />}
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                marginRight: 8
              }}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ 
                fontSize: 14, 
                fontWeight: 500, 
                color: '#1f2937',
                lineHeight: 1.2
              }}>
                {user?.username || '管理员'}
              </div>
              <div style={{ 
                fontSize: 12, 
                color: '#6b7280',
                lineHeight: 1.2
              }}>
                {user?.role === 'admin' ? '超级管理员' : '操作员'}
              </div>
            </div>
          </div>
        </Dropdown>
      </Space>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </AntHeader>
  )
}

export default Header
