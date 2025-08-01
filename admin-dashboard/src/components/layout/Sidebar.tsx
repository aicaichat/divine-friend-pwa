import React from 'react'
import { Layout, Menu, theme } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  UserOutlined,
  BarChartOutlined,
  FileTextOutlined,
  AuditOutlined,
  MonitorOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons'
import { useLayoutStore } from '@store/layoutStore'

const { Sider } = Layout

const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, isMobile, showMobileOverlay } = useLayoutStore()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  // 菜单项配置
  const menuItems = [
    {
      key: '/dashboard',
      label: '仪表盘',
      icon: <DashboardOutlined />,
      path: '/dashboard'
    },
    {
      key: '/users',
      label: '用户管理',
      icon: <UserOutlined />,
      path: '/users'
    },
    {
      key: '/analytics',
      label: '运势分析',
      icon: <BarChartOutlined />,
      path: '/analytics'
    },
    {
      key: '/content',
      label: '内容管理',
      icon: <FileTextOutlined />,
      path: '/content'
    },
    {
      key: '/logs',
      label: 'API日志',
      icon: <AuditOutlined />,
      path: '/logs'
    },
    {
      key: '/monitor',
      label: '系统监控',
      icon: <MonitorOutlined />,
      path: '/monitor'
    },
    {
      key: '/settings',
      label: '系统设置',
      icon: <SettingOutlined />,
      path: '/settings'
    }
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const selectedKeys = [location.pathname]

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={sidebarCollapsed}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: isMobile ? (showMobileOverlay ? 0 : -240) : 0,
        top: 0,
        bottom: 0,
        background: colorBgContainer,
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
        transition: isMobile ? 'left 0.3s ease' : 'width 0.2s ease',
        zIndex: isMobile ? 100 : 'auto'
      }}
      width={240}
      collapsedWidth={80}
    >
      {/* Logo区域 */}
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
        padding: sidebarCollapsed ? '0' : '0 24px',
        borderBottom: '1px solid #f0f0f0',
        background: colorBgContainer
      }}>
        {sidebarCollapsed ? (
          <div style={{
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold'
          }}>
            ✨
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 16,
              fontWeight: 'bold',
              marginRight: 12
            }}>
              ✨
            </div>
            <div>
              <div style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                color: '#1f2937',
                lineHeight: 1.2
              }}>
                Divine Friend
              </div>
              <div style={{ 
                fontSize: 12, 
                color: '#6b7280',
                lineHeight: 1.2
              }}>
                管理后台
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 折叠按钮 */}
      <div style={{
        position: 'absolute',
        top: 16,
        right: -12,
        zIndex: 1000,
        background: '#fff',
        border: '1px solid #d9d9d9',
        borderRadius: '50%',
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        color: '#667eea'
      }} onClick={toggleSidebar}>
        {sidebarCollapsed ? <MenuUnfoldOutlined style={{ fontSize: 12 }} /> : <MenuFoldOutlined style={{ fontSize: 12 }} />}
      </div>

      {/* 菜单 */}
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        onClick={handleMenuClick}
        style={{
          border: 'none',
          marginTop: 8
        }}
        items={menuItems.map(item => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          style: {
            margin: '4px 8px',
            borderRadius: 6,
            height: 40,
            lineHeight: '40px'
          }
        }))}
      />

      {/* 底部信息 */}
      {!sidebarCollapsed && (
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          padding: 12,
          background: '#f8fafc',
          borderRadius: 8,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
            系统版本
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
            v1.0.0
          </div>
        </div>
      )}
    </Sider>
  )
}

export default Sidebar
