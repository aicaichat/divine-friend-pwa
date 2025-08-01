import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import { HelmetProvider } from 'react-helmet-async'

import Sidebar from '@components/layout/Sidebar'
import Header from '@components/layout/Header'
import Dashboard from '@pages/Dashboard'
import UserManagement from '@pages/UserManagement'
import FortuneAnalytics from '@pages/FortuneAnalytics'
import SystemSettings from '@pages/SystemSettings'
import SystemMonitor from '@pages/SystemMonitor'
import ApiLogs from '@pages/ApiLogs'
import ContentManagement from '@pages/ContentManagement'
import LoginPage from '@pages/Login'
import { useAuthStore } from '@store/authStore'
import { useLayoutStore } from '@store/layoutStore'

const { Content } = Layout

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore()
  const { 
    getSidebarWidth, 
    setIsMobile, 
    isMobile, 
    showMobileOverlay, 
    setShowMobileOverlay 
  } = useLayoutStore()

  // 响应式监听
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }

    // 初始化检查
    handleResize()
    
    // 添加监听器
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [setIsMobile])

  if (!isAuthenticated) {
    return (
      <HelmetProvider>
        <LoginPage />
      </HelmetProvider>
    )
  }

  return (
    <HelmetProvider>
      <Layout style={{ minHeight: '100vh', position: 'relative' }}>
        <Sidebar />
        
        {/* 移动端遮罩层 */}
        {isMobile && showMobileOverlay && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 99,
              transition: 'opacity 0.3s ease'
            }}
            onClick={() => setShowMobileOverlay(false)}
          />
        )}
        
        <Layout style={{ 
          marginLeft: getSidebarWidth(),
          transition: 'margin-left 0.2s ease'
        }}>
          <Header />
          <Content>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/analytics" element={<FortuneAnalytics />} />
              <Route path="/content" element={<ContentManagement />} />
              <Route path="/logs" element={<ApiLogs />} />
              <Route path="/monitor" element={<SystemMonitor />} />
              <Route path="/settings" element={<SystemSettings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </HelmetProvider>
  )
}

export default App
