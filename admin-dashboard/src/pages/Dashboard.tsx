import React, { useEffect, useState } from 'react'
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Progress, 
  Table, 
  Tag, 
  Space,
  Segmented,
  Empty,
  Spin
} from 'antd'
import {
  UserOutlined,
  StarOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  RiseOutlined,
  AlertOutlined
} from '@ant-design/icons'
import { Helmet } from 'react-helmet-async'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// 模拟数据
const mockStats = {
  totalUsers: 15678,
  activeUsers: 8234,
  todayRegistrations: 156,
  totalFortuneCalculations: 45231,
  todayCalculations: 892,
  avgResponseTime: 1.2,
  cacheHitRate: 85.6,
  systemLoad: {
    cpu: 65,
    memory: 72,
    disk: 43
  },
  errorRate: 0.8
}

const mockUserGrowth = [
  { date: '1月', users: 1200, newUsers: 120 },
  { date: '2月', users: 1890, newUsers: 180 },
  { date: '3月', users: 2800, newUsers: 220 },
  { date: '4月', users: 3950, newUsers: 280 },
  { date: '5月', users: 5200, newUsers: 350 },
  { date: '6月', users: 6800, newUsers: 420 },
  { date: '7月', users: 8500, newUsers: 480 }
]

const mockFortuneData = [
  { time: '00:00', calculations: 45 },
  { time: '04:00', calculations: 12 },
  { time: '08:00', calculations: 156 },
  { time: '12:00', calculations: 234 },
  { time: '16:00', calculations: 189 },
  { time: '20:00', calculations: 298 },
  { time: '24:00', calculations: 167 }
]

const mockApiUsage = [
  { name: '运势计算', value: 45, color: '#667eea' },
  { name: '用户注册', value: 23, color: '#84fab0' },
  { name: '数据查询', value: 18, color: '#ffd89b' },
  { name: '内容获取', value: 14, color: '#a8edea' }
]

const mockRecentActivities = [
  {
    id: 1,
    user: '用户张三',
    action: '计算今日运势',
    time: '2分钟前',
    status: 'success'
  },
  {
    id: 2,
    user: '用户李四',
    action: '激活手串',
    time: '5分钟前',
    status: 'success'
  },
  {
    id: 3,
    user: '系统',
    action: 'API响应超时',
    time: '8分钟前',
    status: 'error'
  },
  {
    id: 4,
    user: '用户王五',
    action: '查看经文',
    time: '12分钟前',
    status: 'success'
  },
  {
    id: 5,
    user: '用户赵六',
    action: '设置八字信息',
    time: '15分钟前',
    status: 'success'
  }
]

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<string>('7d')

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 400 
      }}>
        <Spin size="large" />
      </div>
    )
  }

  const activityColumns = [
    {
      title: '用户/系统',
      dataIndex: 'user',
      key: 'user',
      width: 120
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action'
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      )
    }
  ]

  return (
    <>
      <Helmet>
        <title>仪表盘 - Divine Friend 管理后台</title>
      </Helmet>

      <div className="page-header">
        <h1>仪表盘</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <div style={{ color: '#666' }}>
            实时监控系统运行状态和关键指标
          </div>
          <Segmented
            options={[
              { label: '今日', value: '1d' },
              { label: '7天', value: '7d' },
              { label: '30天', value: '30d' }
            ]}
            value={timeRange}
            onChange={setTimeRange}
          />
        </div>
      </div>

      {/* 核心指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="总用户数"
              value={mockStats.totalUsers}
              prefix={<UserOutlined />}
              suffix="人"
            />
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              今日新增: +{mockStats.todayRegistrations}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="活跃用户"
              value={mockStats.activeUsers}
              prefix={<RiseOutlined />}
              suffix="人"
            />
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              活跃率: {((mockStats.activeUsers / mockStats.totalUsers) * 100).toFixed(1)}%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="运势计算"
              value={mockStats.totalFortuneCalculations}
              prefix={<StarOutlined />}
              suffix="次"
            />
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              今日: +{mockStats.todayCalculations}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="平均响应"
              value={mockStats.avgResponseTime}
              prefix={<ClockCircleOutlined />}
              suffix="秒"
              precision={1}
            />
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              缓存命中率: {mockStats.cacheHitRate}%
            </div>
          </Card>
        </Col>
      </Row>

      {/* 系统负载 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="系统负载" style={{ height: 200 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>CPU使用率</span>
                  <span>{mockStats.systemLoad.cpu}%</span>
                </div>
                <Progress percent={mockStats.systemLoad.cpu} strokeColor="#667eea" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>内存使用率</span>
                  <span>{mockStats.systemLoad.memory}%</span>
                </div>
                <Progress percent={mockStats.systemLoad.memory} strokeColor="#84fab0" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>磁盘使用率</span>
                  <span>{mockStats.systemLoad.disk}%</span>
                </div>
                <Progress percent={mockStats.systemLoad.disk} strokeColor="#ffd89b" />
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="用户增长趋势" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={mockUserGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#667eea" 
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 详细分析 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="今日运势计算分布" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mockFortuneData}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calculations" fill="#667eea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="API使用分布" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={mockApiUsage}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {mockApiUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 实时活动 */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="实时活动" extra={<Tag color="green">实时更新</Tag>}>
            <Table
              columns={activityColumns}
              dataSource={mockRecentActivities}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default Dashboard 