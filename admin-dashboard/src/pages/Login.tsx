import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Row, Col } from 'antd'
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from '@store/authStore'

const { Title, Text } = Typography

interface LoginForm {
  username: string
  password: string
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      const success = await login(values.username, values.password)
      if (success) {
        message.success('登录成功！')
      } else {
        message.error('用户名或密码错误')
      }
    } catch (error) {
      message.error('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>登录 - Divine Friend 管理后台</title>
        <meta name="description" content="Divine Friend PWA 管理后台登录页面" />
      </Helmet>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Row justify="center" style={{ width: '100%', maxWidth: 1200 }}>
          <Col xs={24} sm={20} md={16} lg={12} xl={8}>
            <Card
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                borderRadius: 16,
                border: 'none'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{
                  width: 64,
                  height: 64,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 24,
                  color: 'white'
                }}>
                  ✨
                </div>
                <Title level={2} style={{ margin: 0, color: '#1f2937' }}>
                  Divine Friend
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  管理后台系统
                </Text>
              </div>

              <Form
                name="login"
                onFinish={onFinish}
                autoComplete="off"
                size="large"
                layout="vertical"
              >
                <Form.Item
                  label="用户名"
                  name="username"
                  rules={[
                    { required: true, message: '请输入用户名' },
                    { min: 3, message: '用户名至少3个字符' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#667eea' }} />}
                    placeholder="请输入用户名"
                    autoComplete="username"
                  />
                </Form.Item>

                <Form.Item
                  label="密码"
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6个字符' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#667eea' }} />}
                    placeholder="请输入密码"
                    autoComplete="current-password"
                    iconRender={(visible) => (
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    )}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={{
                      height: 48,
                      fontSize: 16,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none'
                    }}
                  >
                    {loading ? '登录中...' : '登录'}
                  </Button>
                </Form.Item>

                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    演示账号: admin / admin123
                  </Text>
                </div>
              </Form>

              <div style={{
                marginTop: 24,
                padding: 16,
                background: '#f8fafc',
                borderRadius: 8,
                textAlign: 'center'
              }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Divine Friend PWA 管理后台 v1.0.0
                  <br />
                  专业的八字命理应用管理系统
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default LoginPage 