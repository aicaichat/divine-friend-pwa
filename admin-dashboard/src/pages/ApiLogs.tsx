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
  message,
  Typography,
  Badge,
  Tooltip,
  Radio,
  Switch,
  Divider,
  List,
  Avatar,
  Timeline,
  Alert
} from 'antd'
import {
  EyeOutlined,
  SearchOutlined,
  DownloadOutlined,
  FilterOutlined,
  LineChartOutlined,
  PieChartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  MobileOutlined,
  DesktopOutlined,
  BugOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FireOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  StarOutlined
} from '@ant-design/icons'
import { Helmet } from 'react-helmet-async'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts'

const { Search } = Input
const { Option } = Select
const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { RangePicker } = DatePicker

// 页面访问记录类型
interface PageView {
  id: string
  userId?: string
  username?: string
  page: string
  title: string
  url: string
  referrer: string
  userAgent: string
  device: 'mobile' | 'desktop' | 'tablet'
  browser: string
  os: string
  ip: string
  location: string
  duration: number
  timestamp: string
  sessionId: string
}

// API请求日志类型
interface ApiLog {
  id: string
  method: string
  endpoint: string
  statusCode: number
  responseTime: number
  userId?: string
  userAgent: string
  ip: string
  requestBody?: string
  responseBody?: string
  error?: string
  timestamp: string
}

// 用户行为事件类型
interface UserEvent {
  id: string
  userId?: string
  username?: string
  event: string
  page: string
  element?: string
  value?: string | number
  properties: Record<string, any>
  timestamp: string
}

// 模拟数据
const mockPageViews: PageView[] = [
  {
    id: '1',
    userId: 'user1',
    username: '张三',
    page: 'home',
    title: '首页',
    url: '/',
    referrer: 'https://google.com',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    device: 'mobile',
    browser: 'Safari',
    os: 'iOS',
    ip: '192.168.1.100',
    location: '北京市',
    duration: 180,
    timestamp: '2024-01-20 14:30:00',
    sessionId: 'session-001'
  },
  {
    id: '2',
    userId: 'user2',
    username: '李四',
    page: 'today',
    title: '今日运势',
    url: '/today',
    referrer: '/',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    device: 'desktop',
    browser: 'Chrome',
    os: 'Windows',
    ip: '192.168.1.101',
    location: '上海市',
    duration: 240,
    timestamp: '2024-01-20 14:25:00',
    sessionId: 'session-002'
  },
  {
    id: '3',
    userId: 'user1',
    username: '张三',
    page: 'growth',
    title: '成长修炼',
    url: '/growth',
    referrer: '/today',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    device: 'mobile',
    browser: 'Safari',
    os: 'iOS',
    ip: '192.168.1.100',
    location: '北京市',
    duration: 360,
    timestamp: '2024-01-20 14:35:00',
    sessionId: 'session-001'
  }
]

const mockApiLogs: ApiLog[] = [
  {
    id: '1',
    method: 'POST',
    endpoint: '/api/calculate-daily-fortune',
    statusCode: 200,
    responseTime: 450,
    userId: 'user1',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    ip: '192.168.1.100',
    timestamp: '2024-01-20 14:30:15'
  },
  {
    id: '2',
    method: 'GET',
    endpoint: '/api/user/profile',
    statusCode: 200,
    responseTime: 120,
    userId: 'user2',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    ip: '192.168.1.101',
    timestamp: '2024-01-20 14:25:30'
  },
  {
    id: '3',
    method: 'POST',
    endpoint: '/api/scripture/study',
    statusCode: 500,
    responseTime: 3000,
    userId: 'user1',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    ip: '192.168.1.100',
    error: 'Database connection timeout',
    timestamp: '2024-01-20 14:35:45'
  }
]

const mockUserEvents: UserEvent[] = [
  {
    id: '1',
    userId: 'user1',
    username: '张三',
    event: 'click',
    page: 'home',
    element: 'fortune-button',
    properties: { buttonText: '查看今日运势', position: 'center' },
    timestamp: '2024-01-20 14:30:10'
  },
  {
    id: '2',
    userId: 'user2',
    username: '李四',
    event: 'scroll',
    page: 'today',
    value: 80,
    properties: { scrollDepth: '80%', pageHeight: 1200 },
    timestamp: '2024-01-20 14:26:00'
  },
  {
    id: '3',
    userId: 'user1',
    username: '张三',
    event: 'form_submit',
    page: 'profile',
    element: 'bazi-form',
    properties: { formValid: true, fields: ['year', 'month', 'day', 'hour'] },
    timestamp: '2024-01-20 14:32:20'
  }
]

// 页面访问趋势数据
const pageViewTrend = [
  { time: '00:00', views: 45, users: 12 },
  { time: '04:00', views: 23, users: 8 },
  { time: '08:00', views: 89, users: 34 },
  { time: '12:00', views: 156, users: 67 },
  { time: '16:00', views: 234, users: 89 },
  { time: '20:00', views: 345, users: 123 },
  { time: '24:00', views: 198, users: 76 }
]

// 页面分布数据
const pageDistribution = [
  { name: '首页', value: 45, color: '#8884d8' },
  { name: '今日运势', value: 30, color: '#82ca9d' },
  { name: '成长修炼', value: 15, color: '#ffc658' },
  { name: '神仙对话', value: 8, color: '#ff7300' },
  { name: '个人设置', value: 2, color: '#00ff88' }
]

// 设备分布数据
const deviceDistribution = [
  { name: '移动端', value: 70, color: '#8884d8' },
  { name: '桌面端', value: 25, color: '#82ca9d' },
  { name: '平板', value: 5, color: '#ffc658' }
]

const ApiLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('page-analytics')
  
  // 页面分析状态
  const [pageViews, setPageViews] = useState<PageView[]>(mockPageViews)
  const [selectedDateRange, setSelectedDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  
  // API日志状态
  const [apiLogs, setApiLogs] = useState<ApiLog[]>(mockApiLogs)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // 用户行为状态
  const [userEvents, setUserEvents] = useState<UserEvent[]>(mockUserEvents)
  const [selectedUser, setSelectedUser] = useState<string>('all')
  
  // 搜索状态
  const [searchText, setSearchText] = useState('')

  // 统计数据
  const analyticsStats = {
    totalViews: pageViews.length,
    uniqueUsers: new Set(pageViews.map(pv => pv.userId).filter(Boolean)).size,
    avgDuration: Math.round(pageViews.reduce((sum, pv) => sum + pv.duration, 0) / pageViews.length),
    bounceRate: 23.5,
    apiRequests: apiLogs.length,
    apiErrors: apiLogs.filter(log => log.statusCode >= 400).length,
    avgResponseTime: Math.round(apiLogs.reduce((sum, log) => sum + log.responseTime, 0) / apiLogs.length)
  }

  // 页面访问表格列
  const pageViewColumns: ColumnsType<PageView> = [
    {
      title: '用户',
      key: 'user',
      width: 120,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 'bold' }}>
              {record.username || '匿名用户'}
            </div>
            <div style={{ fontSize: 10, color: '#666' }}>
              {record.location}
            </div>
          </div>
        </div>
      )
    },
    {
      title: '页面',
      key: 'page',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.title}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.url}</div>
        </div>
      )
    },
    {
      title: '设备',
      dataIndex: 'device',
      key: 'device',
      width: 80,
      render: (device: string) => {
        const deviceConfig = {
          mobile: { icon: <MobileOutlined />, color: '#52c41a' },
          desktop: { icon: <DesktopOutlined />, color: '#1890ff' },
          tablet: { icon: <MobileOutlined />, color: '#faad14' }
        }
        const config = deviceConfig[device as keyof typeof deviceConfig]
        return (
          <Tooltip title={device}>
            <Tag color={config.color} icon={config.icon}>
              {device}
            </Tag>
          </Tooltip>
        )
      }
    },
    {
      title: '停留时间',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration: number) => (
        <span>{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</span>
      )
    },
    {
      title: '访问时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp: string) => dayjs(timestamp).format('MM-DD HH:mm:ss')
    }
  ]

  // API日志表格列
  const apiLogColumns: ColumnsType<ApiLog> = [
    {
      title: '请求',
      key: 'request',
      render: (_, record) => (
        <div>
          <Tag color={record.method === 'GET' ? 'blue' : record.method === 'POST' ? 'green' : 'orange'}>
            {record.method}
          </Tag>
          <Text code style={{ marginLeft: 8 }}>{record.endpoint}</Text>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'statusCode',
      key: 'statusCode',
      width: 80,
      render: (statusCode: number) => {
        const isError = statusCode >= 400
        return (
          <Tag color={isError ? 'red' : statusCode >= 300 ? 'orange' : 'green'}>
            {statusCode}
          </Tag>
        )
      }
    },
    {
      title: '响应时间',
      dataIndex: 'responseTime',
      key: 'responseTime',
      width: 100,
      render: (responseTime: number) => (
        <span style={{ color: responseTime > 1000 ? '#ff4d4f' : responseTime > 500 ? '#faad14' : '#52c41a' }}>
          {responseTime}ms
        </span>
      )
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
      render: (ip: string) => <Text code>{ip}</Text>
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp: string) => dayjs(timestamp).format('MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button 
          size="small" 
          icon={<EyeOutlined />}
          onClick={() => {
            Modal.info({
              title: '请求详情',
              width: 600,
              content: (
                <div>
                  <p><strong>请求方法:</strong> {record.method}</p>
                  <p><strong>接口:</strong> {record.endpoint}</p>
                  <p><strong>状态码:</strong> {record.statusCode}</p>
                  <p><strong>响应时间:</strong> {record.responseTime}ms</p>
                  {record.error && (
                    <Alert 
                      message="错误信息" 
                      description={record.error} 
                      type="error" 
                      style={{ marginTop: 16 }}
                    />
                  )}
                </div>
              )
            })
          }}
        />
      )
    }
  ]

  // 用户行为表格列
  const userEventColumns: ColumnsType<UserEvent> = [
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      width: 100,
      render: (username: string) => username || '匿名用户'
    },
    {
      title: '事件',
      dataIndex: 'event',
      key: 'event',
      width: 100,
      render: (event: string) => {
        const eventConfig = {
          click: { color: 'blue', icon: <ThunderboltOutlined /> },
          scroll: { color: 'green', icon: <EyeOutlined /> },
          form_submit: { color: 'orange', icon: <CheckCircleOutlined /> },
          page_view: { color: 'purple', icon: <GlobalOutlined /> }
        }
        const config = eventConfig[event as keyof typeof eventConfig] || { color: 'default', icon: <StarOutlined /> }
        return (
          <Tag color={config.color} icon={config.icon}>
            {event}
          </Tag>
        )
      }
    },
    {
      title: '页面',
      dataIndex: 'page',
      key: 'page',
      width: 100
    },
    {
      title: '元素',
      dataIndex: 'element',
      key: 'element',
      width: 120,
      render: (element: string) => element ? <Text code>{element}</Text> : '-'
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      width: 80,
      render: (value: string | number) => value || '-'
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp: string) => dayjs(timestamp).format('MM-DD HH:mm:ss')
    }
  ]

  return (
    <>
      <Helmet>
        <title>API日志与访问分析 - Divine Friend 管理后台</title>
      </Helmet>

      <div className="page-header">
        <h1>API日志与访问分析</h1>
        <p style={{ color: '#666' }}>页面访问统计、用户行为分析和API请求监控</p>
      </div>

      {/* 统计概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="页面访问量"
              value={analyticsStats.totalViews}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="独立用户"
              value={analyticsStats.uniqueUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均停留"
              value={analyticsStats.avgDuration}
              suffix="秒"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="API错误率"
              value={((analyticsStats.apiErrors / analyticsStats.apiRequests) * 100).toFixed(1)}
              suffix="%"
              prefix={<BugOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* 页面分析 */}
        <TabPane tab={<span><LineChartOutlined />页面分析</span>} key="page-analytics">
          {/* 趋势图表 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={16}>
              <Card title="访问趋势" extra={<RangePicker />}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={pageViewTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="views" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="页面分布" style={{ marginBottom: 16 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pageDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* 页面访问列表 */}
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Search
                    placeholder="搜索页面或用户"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="设备类型"
                    style={{ width: '100%' }}
                    allowClear
                  >
                    <Option value="mobile">移动端</Option>
                    <Option value="desktop">桌面端</Option>
                    <Option value="tablet">平板</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={24} md={10}>
                  <Space style={{ float: 'right' }}>
                    <Button icon={<FilterOutlined />}>
                      高级筛选
                    </Button>
                    <Button icon={<DownloadOutlined />}>
                      导出数据
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>
            
            <Table
              columns={pageViewColumns}
              dataSource={pageViews}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                  `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
              }}
            />
          </Card>
        </TabPane>

        {/* API日志 */}
        <TabPane tab={<span><GlobalOutlined />API日志</span>} key="api-logs">
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Search
                  placeholder="搜索接口或IP"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="状态码"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: '100%' }}
                >
                  <Option value="all">全部状态</Option>
                  <Option value="2xx">成功 (2xx)</Option>
                  <Option value="4xx">客户端错误 (4xx)</Option>
                  <Option value="5xx">服务器错误 (5xx)</Option>
                </Select>
              </Col>
              <Col xs={24} sm={24} md={10}>
                <Space style={{ float: 'right' }}>
                  <Button icon={<FilterOutlined />}>
                    高级筛选
                  </Button>
                  <Button icon={<DownloadOutlined />}>
                    导出日志
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Card>
            <Table
              columns={apiLogColumns}
              dataSource={apiLogs.filter(log => {
                const matchesSearch = log.endpoint.toLowerCase().includes(searchText.toLowerCase()) ||
                                     log.ip.includes(searchText)
                const matchesStatus = statusFilter === 'all' || 
                                     (statusFilter === '2xx' && log.statusCode >= 200 && log.statusCode < 300) ||
                                     (statusFilter === '4xx' && log.statusCode >= 400 && log.statusCode < 500) ||
                                     (statusFilter === '5xx' && log.statusCode >= 500)
                return matchesSearch && matchesStatus
              })}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                  `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
              }}
            />
          </Card>
        </TabPane>

        {/* 用户行为 */}
        <TabPane tab={<span><UserOutlined />用户行为</span>} key="user-behavior">
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={16}>
              <Card title="设备分布">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deviceDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="热门事件">
                <List
                  size="small"
                  dataSource={[
                    { event: '点击查看运势', count: 156, icon: <ThunderboltOutlined /> },
                    { event: '完成八字设置', count: 89, icon: <CheckCircleOutlined /> },
                    { event: '开始修炼', count: 67, icon: <HeartOutlined /> },
                    { event: '分享运势', count: 34, icon: <StarOutlined /> },
                    { event: '激活手串', count: 23, icon: <FireOutlined /> }
                  ]}
                  renderItem={(item, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={item.icon} size="small" />}
                        title={`${index + 1}. ${item.event}`}
                        description={`${item.count} 次`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          <Card>
            <div style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Search
                    placeholder="搜索用户或事件"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="选择用户"
                    value={selectedUser}
                    onChange={setSelectedUser}
                    style={{ width: '100%' }}
                  >
                    <Option value="all">全部用户</Option>
                    <Option value="user1">张三</Option>
                    <Option value="user2">李四</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={24} md={10}>
                  <Space style={{ float: 'right' }}>
                    <Button icon={<FilterOutlined />}>
                      事件筛选
                    </Button>
                    <Button icon={<DownloadOutlined />}>
                      导出分析
                    </Button>
                  </Space>
                </Col>
              </Row>
            </div>

            <Table
              columns={userEventColumns}
              dataSource={userEvents.filter(event => {
                const matchesSearch = event.event.toLowerCase().includes(searchText.toLowerCase()) ||
                                     (event.username && event.username.toLowerCase().includes(searchText.toLowerCase()))
                const matchesUser = selectedUser === 'all' || event.userId === selectedUser
                return matchesSearch && matchesUser
              })}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                  `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
              }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </>
  )
}

export default ApiLogs 