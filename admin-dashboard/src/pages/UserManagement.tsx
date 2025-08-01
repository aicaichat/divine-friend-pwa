import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  Statistic,
  Row,
  Col,
  Tabs,
  Progress,
  Avatar,
  Drawer,
  message,
  Popconfirm,
  Typography,
  Badge,
  Tooltip
} from 'antd'
import {
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarOutlined,
  CalendarOutlined,
  SettingOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { Helmet } from 'react-helmet-async'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { Title, Text } = Typography
const { TabPane } = Tabs

// 用户数据类型定义
interface User {
  id: string
  username: string
  email: string
  phone: string
  avatar: string
  status: 'active' | 'inactive' | 'banned'
  baziSetup: boolean
  braceletActivated: boolean
  fortuneCount: number
  meritPoints: number
  studyDays: number
  chatMessages: number
  lastLoginTime: string
  registrationTime: string
  location: string
  vipLevel: number
  accountBalance: number
}

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: '1',
    username: '张三',
    email: 'zhangsan@example.com',
    phone: '138****1234',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    status: 'active',
    baziSetup: true,
    braceletActivated: true,
    fortuneCount: 45,
    meritPoints: 1250,
    studyDays: 28,
    chatMessages: 156,
    lastLoginTime: '2024-01-20 14:30:00',
    registrationTime: '2024-01-01 10:00:00',
    location: '北京市',
    vipLevel: 2,
    accountBalance: 299.80
  },
  {
    id: '2',
    username: '李四',
    email: 'lisi@example.com',
    phone: '139****5678',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    status: 'active',
    baziSetup: true,
    braceletActivated: false,
    fortuneCount: 23,
    meritPoints: 890,
    studyDays: 15,
    chatMessages: 89,
    lastLoginTime: '2024-01-19 16:45:00',
    registrationTime: '2024-01-05 15:30:00',
    location: '上海市',
    vipLevel: 1,
    accountBalance: 99.50
  },
  {
    id: '3',
    username: '王五',
    email: 'wangwu@example.com',
    phone: '137****9012',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    status: 'inactive',
    baziSetup: false,
    braceletActivated: false,
    fortuneCount: 8,
    meritPoints: 320,
    studyDays: 5,
    chatMessages: 23,
    lastLoginTime: '2024-01-15 09:20:00',
    registrationTime: '2024-01-10 11:15:00',
    location: '广州市',
    vipLevel: 0,
    accountBalance: 0.00
  }
]

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userDetailVisible, setUserDetailVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [form] = Form.useForm()

  // 过滤用户数据
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchText.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchText.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  // 统计数据
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    baziSetup: users.filter(u => u.baziSetup).length,
    braceletActivated: users.filter(u => u.braceletActivated).length
  }

  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: '用户信息',
      key: 'userInfo',
      width: 200,
      render: (_, user) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar 
            src={user.avatar} 
            icon={<UserOutlined />}
            size={40}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 14 }}>{user.username}</div>
            <div style={{ color: '#666', fontSize: 12 }}>{user.email}</div>
          </div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          active: { color: 'green', text: '活跃' },
          inactive: { color: 'orange', text: '不活跃' },
          banned: { color: 'red', text: '已封禁' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '八字设置',
      dataIndex: 'baziSetup',
      key: 'baziSetup',
      width: 100,
      render: (setup: boolean) => (
        <Badge 
          status={setup ? 'success' : 'default'} 
          text={setup ? '已设置' : '未设置'} 
        />
      )
    },
    {
      title: '手串激活',
      dataIndex: 'braceletActivated',
      key: 'braceletActivated',
      width: 100,
      render: (activated: boolean) => (
        <Badge 
          status={activated ? 'processing' : 'default'} 
          text={activated ? '已激活' : '未激活'} 
        />
      )
    },
    {
      title: '活跃数据',
      key: 'activity',
      width: 150,
      render: (_, user) => (
        <div>
          <div style={{ fontSize: 12, color: '#666' }}>
            运势: {user.fortuneCount} | 功德: {user.meritPoints}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            修炼: {user.studyDays}天 | 对话: {user.chatMessages}
          </div>
        </div>
      )
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 120,
      render: (time: string) => dayjs(time).format('MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, user) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedUser(user)
                setUserDetailVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedUser(user)
                form.setFieldsValue(user)
                setEditModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个用户吗？"
              onConfirm={() => handleDeleteUser(user.id)}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ]

  const handleDeleteUser = async (userId: string) => {
    try {
      setUsers(prev => prev.filter(user => user.id !== userId))
      message.success('用户删除成功')
    } catch (error) {
      message.error('删除失败，请重试')
    }
  }

  const handleEditUser = async (values: any) => {
    try {
      if (selectedUser) {
        setUsers(prev => 
          prev.map(user => 
            user.id === selectedUser.id ? { ...user, ...values } : user
          )
        )
        message.success('用户信息更新成功')
        setEditModalVisible(false)
        setSelectedUser(null)
        form.resetFields()
      }
    } catch (error) {
      message.error('更新失败，请重试')
    }
  }

  return (
    <>
      <Helmet>
        <title>用户管理 - Divine Friend 管理后台</title>
      </Helmet>

      <div className="page-header">
        <h1>用户管理</h1>
        <p style={{ color: '#666' }}>管理和监控系统中的所有用户账户</p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={stats.active}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="八字设置率"
              value={Math.round((stats.baziSetup / stats.total) * 100)}
              suffix="%"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="手串激活率"
              value={Math.round((stats.braceletActivated / stats.total) * 100)}
              suffix="%"
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索用户名或邮箱"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={setSearchText}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
              placeholder="用户状态"
            >
              <Option value="all">全部状态</Option>
              <Option value="active">活跃</Option>
              <Option value="inactive">不活跃</Option>
              <Option value="banned">已封禁</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={10}>
            <Space style={{ float: 'right' }}>
              <Button type="primary" icon={<PlusOutlined />}>
                新增用户
              </Button>
              <Button icon={<SearchOutlined />}>
                高级搜索
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 用户列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 用户详情抽屉 */}
      <Drawer
        title="用户详情"
        placement="right"
        width={600}
        open={userDetailVisible}
        onClose={() => setUserDetailVisible(false)}
      >
        {selectedUser && (
          <div>
            {/* 基本信息 */}
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={24} style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Avatar src={selectedUser.avatar} size={80} />
                  <div style={{ marginTop: 8, fontSize: 18, fontWeight: 'bold' }}>
                    {selectedUser.username}
                  </div>
                </Col>
                <Col span={12}>
                  <div><MailOutlined /> 邮箱</div>
                  <div style={{ color: '#666' }}>{selectedUser.email}</div>
                </Col>
                <Col span={12}>
                  <div><PhoneOutlined /> 手机</div>
                  <div style={{ color: '#666' }}>{selectedUser.phone}</div>
                </Col>
                <Col span={12}>
                  <div><EnvironmentOutlined /> 地区</div>
                  <div style={{ color: '#666' }}>{selectedUser.location}</div>
                </Col>
                <Col span={12}>
                  <div><ClockCircleOutlined /> 注册时间</div>
                  <div style={{ color: '#666' }}>
                    {dayjs(selectedUser.registrationTime).format('YYYY-MM-DD')}
                  </div>
                </Col>
              </Row>
            </Card>

            {/* 功能状态 */}
            <Card title="功能状态" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>八字设置</div>
                  <Badge 
                    status={selectedUser.baziSetup ? 'success' : 'default'} 
                    text={selectedUser.baziSetup ? '已设置' : '未设置'} 
                  />
                </Col>
                <Col span={12}>
                  <div>手串激活</div>
                  <Badge 
                    status={selectedUser.braceletActivated ? 'processing' : 'default'} 
                    text={selectedUser.braceletActivated ? '已激活' : '未激活'} 
                  />
                </Col>
                <Col span={12}>
                  <div>VIP等级</div>
                  <Tag color="gold">VIP{selectedUser.vipLevel}</Tag>
                </Col>
                <Col span={12}>
                  <div>账户余额</div>
                  <div style={{ color: '#52c41a', fontWeight: 'bold' }}>
                    ¥{selectedUser.accountBalance.toFixed(2)}
                  </div>
                </Col>
              </Row>
            </Card>

            {/* 活跃数据 */}
            <Card title="活跃数据" size="small">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic title="运势查询" value={selectedUser.fortuneCount} suffix="次" />
                </Col>
                <Col span={12}>
                  <Statistic title="功德积分" value={selectedUser.meritPoints} />
                </Col>
                <Col span={12}>
                  <Statistic title="修炼天数" value={selectedUser.studyDays} suffix="天" />
                </Col>
                <Col span={12}>
                  <Statistic title="对话消息" value={selectedUser.chatMessages} suffix="条" />
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Drawer>

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          setSelectedUser(null)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditUser}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="用户名"
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="邮箱"
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="输入邮箱地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="手机号"
                name="phone"
                rules={[{ required: true, message: '请输入手机号' }]}
              >
                <Input placeholder="输入手机号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="选择用户状态">
                  <Option value="active">活跃</Option>
                  <Option value="inactive">不活跃</Option>
                  <Option value="banned">已封禁</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="地区"
                name="location"
              >
                <Input placeholder="输入所在地区" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="VIP等级"
                name="vipLevel"
              >
                <Select placeholder="选择VIP等级">
                  <Option value={0}>普通用户</Option>
                  <Option value={1}>VIP1</Option>
                  <Option value={2}>VIP2</Option>
                  <Option value={3}>VIP3</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setEditModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </>
  )
}

export default UserManagement 