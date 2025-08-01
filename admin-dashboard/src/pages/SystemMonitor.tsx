import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Alert,
  Timeline,
  List,
  Button,
  Space,
  Tabs,
  Badge,
  Tooltip,
  Descriptions,
  Switch
} from 'antd'
import {
  ServerOutlined,
  DatabaseOutlined,
  CloudOutlined,
  SecurityScanOutlined,
  BarChartOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  MonitorOutlined,
  ThunderboltOutlined,
  HddOutlined,
  WifiOutlined
} from '@ant-design/icons'
import { Helmet } from 'react-helmet-async'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { TabPane } = Tabs

// 系统状态类型
interface SystemStatus {
  cpu: number
  memory: number
  disk: number
  network: number
  uptime: string
  activeUsers: number
  totalRequests: number
  errorRate: number
}

// 性能指标类型
interface PerformanceMetric {
  timestamp: string
  cpu: number
  memory: number
  network: number
  requests: number
}

// 服务器信息类型
interface ServerInfo {
  id: string
  name: string
  status: 'online' | 'offline' | 'warning'
  cpu: number
  memory: number
  disk: number
  lastUpdate: string
  services: string[]
}

// 日志条目类型
interface LogEntry {
  id: string
  level: 'info' | 'warning' | 'error'
  message: string
  source: string
  timestamp: string
  details?: string
}

// 模拟数据
const mockSystemStatus: SystemStatus = {
  cpu: 45,
  memory: 62,
  disk: 78,
  network: 85,
  uptime: '15天 8小时 23分钟',
  activeUsers: 1247,
  totalRequests: 58394,
  errorRate: 0.8
}

const mockPerformanceData: PerformanceMetric[] = [
  { timestamp: '00:00', cpu: 35, memory: 58, network: 75, requests: 120 },
  { timestamp: '04:00', cpu: 28, memory: 55, network: 68, requests: 89 },
  { timestamp: '08:00', cpu: 52, memory: 65, network: 82, requests: 156 },
  { timestamp: '12:00', cpu: 48, memory: 68, network: 88, requests: 203 },
  { timestamp: '16:00', cpu: 65, memory: 72, network: 95, requests: 245 },
  { timestamp: '20:00', cpu: 42, memory: 63, network: 78, requests: 178 }
]

const mockServers: ServerInfo[] = [
  {
    id: '1',
    name: 'Web Server 01',
    status: 'online',
    cpu: 45,
    memory: 62,
    disk: 78,
    lastUpdate: '2024-01-20 16:30:00',
    services: ['nginx', 'docker', 'node']
  },
  {
    id: '2',
    name: 'Database Server',
    status: 'online',
    cpu: 32,
    memory: 85,
    disk: 45,
    lastUpdate: '2024-01-20 16:29:00',
    services: ['mysql', 'redis', 'mongodb']
  },
  {
    id: '3',
    name: 'API Server 01',
    status: 'warning',
    cpu: 78,
    memory: 89,
    disk: 67,
    lastUpdate: '2024-01-20 16:25:00',
    services: ['flask', 'gunicorn', 'celery']
  }
]

const mockLogs: LogEntry[] = [
  {
    id: '1',
    level: 'error',
    message: 'API请求超时',
    source: 'api-server-01',
    timestamp: '2024-01-20 16:30:15',
    details: 'GET /api/fortune timeout after 5000ms'
  },
  {
    id: '2',
    level: 'warning',
    message: 'CPU使用率过高',
    source: 'web-server-01',
    timestamp: '2024-01-20 16:25:30',
    details: 'CPU usage: 78%'
  },
  {
    id: '3',
    level: 'info',
    message: '数据库连接池扩容',
    source: 'database-server',
    timestamp: '2024-01-20 16:20:45',
    details: 'Pool size increased to 50'
  }
]

const SystemMonitor: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(mockSystemStatus)
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>(mockPerformanceData)
  const [servers, setServers] = useState<ServerInfo[]>(mockServers)
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [loading, setLoading] = useState(false)

  // 自动刷新
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        // 模拟数据更新
        setSystemStatus(prev => ({
          ...prev,
          cpu: Math.max(20, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
          memory: Math.max(30, Math.min(95, prev.memory + (Math.random() - 0.5) * 8))
        }))
      }, 5000)
    }
    return () => interval && clearInterval(interval)
  }, [autoRefresh])

  // 服务器表格列定义
  const serverColumns: ColumnsType<ServerInfo> = [
    {
      title: '服务器名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          online: { color: 'green', text: '在线' },
          offline: { color: 'red', text: '离线' },
          warning: { color: 'orange', text: '警告' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Badge status={config.color as any} text={config.text} />
      }
    },
    {
      title: 'CPU',
      dataIndex: 'cpu',
      key: 'cpu',
      width: 120,
      render: (cpu: number) => (
        <Progress
          percent={cpu}
          size="small"
          status={cpu > 80 ? 'exception' : cpu > 60 ? 'normal' : 'success'}
        />
      )
    },
    {
      title: '内存',
      dataIndex: 'memory',
      key: 'memory',
      width: 120,
      render: (memory: number) => (
        <Progress
          percent={memory}
          size="small"
          status={memory > 85 ? 'exception' : memory > 70 ? 'normal' : 'success'}
        />
      )
    },
    {
      title: '磁盘',
      dataIndex: 'disk',
      key: 'disk',
      width: 120,
      render: (disk: number) => (
        <Progress
          percent={disk}
          size="small"
          status={disk > 90 ? 'exception' : disk > 75 ? 'normal' : 'success'}
        />
      )
    },
    {
      title: '服务',
      dataIndex: 'services',
      key: 'services',
      render: (services: string[]) => (
        <div>
          {services.map(service => (
            <Tag key={service} size="small">{service}</Tag>
          ))}
        </div>
      )
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
      width: 140,
      render: (time: string) => dayjs(time).format('MM-DD HH:mm:ss')
    }
  ]

  // 日志表格列定义
  const logColumns: ColumnsType<LogEntry> = [
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: string) => {
        const levelConfig = {
          info: { color: 'blue', text: '信息' },
          warning: { color: 'orange', text: '警告' },
          error: { color: 'red', text: '错误' }
        }
        const config = levelConfig[level as keyof typeof levelConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message'
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 150
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 140,
      render: (time: string) => dayjs(time).format('MM-DD HH:mm:ss')
    }
  ]

  const refreshData = () => {
    setLoading(true)
    // 模拟数据刷新
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  return (
    <>
      <Helmet>
        <title>系统监控 - Divine Friend 管理后台</title>
      </Helmet>

      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>系统监控</h1>
            <p style={{ color: '#666' }}>实时监控系统性能和服务器状态</p>
          </div>
          <Space>
            <span>自动刷新</span>
            <Switch checked={autoRefresh} onChange={setAutoRefresh} />
            <Button icon={<ReloadOutlined />} onClick={refreshData} loading={loading}>
              刷新
            </Button>
          </Space>
        </div>
      </div>

      <Tabs defaultActiveKey="overview">
        {/* 系统概览 */}
        <TabPane tab="系统概览" key="overview">
          {/* 关键指标 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="CPU使用率"
                  value={systemStatus.cpu}
                  suffix="%"
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: systemStatus.cpu > 80 ? '#ff4d4f' : '#52c41a' }}
                />
                <Progress
                  percent={systemStatus.cpu}
                  size="small"
                  status={systemStatus.cpu > 80 ? 'exception' : 'success'}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="内存使用率"
                  value={systemStatus.memory}
                  suffix="%"
                  prefix={<HddOutlined />}
                  valueStyle={{ color: systemStatus.memory > 85 ? '#ff4d4f' : '#52c41a' }}
                />
                <Progress
                  percent={systemStatus.memory}
                  size="small"
                  status={systemStatus.memory > 85 ? 'exception' : 'success'}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="磁盘使用率"
                  value={systemStatus.disk}
                  suffix="%"
                  prefix={<DatabaseOutlined />}
                  valueStyle={{ color: systemStatus.disk > 90 ? '#ff4d4f' : '#52c41a' }}
                />
                <Progress
                  percent={systemStatus.disk}
                  size="small"
                  status={systemStatus.disk > 90 ? 'exception' : 'success'}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="网络带宽"
                  value={systemStatus.network}
                  suffix="%"
                  prefix={<WifiOutlined />}
                  valueStyle={{ color: systemStatus.network > 90 ? '#ff4d4f' : '#52c41a' }}
                />
                <Progress
                  percent={systemStatus.network}
                  size="small"
                  status={systemStatus.network > 90 ? 'exception' : 'success'}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
          </Row>

          {/* 系统信息 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="系统运行时间"
                  value={systemStatus.uptime}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="在线用户"
                  value={systemStatus.activeUsers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总请求数"
                  value={systemStatus.totalRequests}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="错误率"
                  value={systemStatus.errorRate}
                  suffix="%"
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: systemStatus.errorRate > 2 ? '#ff4d4f' : '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 性能趋势图 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="性能趋势" extra={
                <Button icon={<SettingOutlined />} size="small">配置</Button>
              }>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="cpu" stackId="1" stroke="#ff4d4f" fill="#ff4d4f" name="CPU%" />
                    <Area type="monotone" dataKey="memory" stackId="2" stroke="#1890ff" fill="#1890ff" name="内存%" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="服务状态">
                <List
                  size="small"
                  dataSource={[
                    { name: 'Web服务', status: 'running', icon: <CheckCircleOutlined style={{ color: '#52c41a' }} /> },
                    { name: '数据库', status: 'running', icon: <CheckCircleOutlined style={{ color: '#52c41a' }} /> },
                    { name: 'Redis缓存', status: 'running', icon: <CheckCircleOutlined style={{ color: '#52c41a' }} /> },
                    { name: 'API服务', status: 'warning', icon: <WarningOutlined style={{ color: '#faad14' }} /> },
                    { name: '监控服务', status: 'running', icon: <CheckCircleOutlined style={{ color: '#52c41a' }} /> }
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 服务器 */}
        <TabPane tab="服务器" key="servers">
          <Card title="服务器列表" extra={
            <Button icon={<PlusOutlined />} type="primary">添加服务器</Button>
          }>
            <Table
              columns={serverColumns}
              dataSource={servers}
              rowKey="id"
              pagination={{
                total: servers.length,
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                  `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
              }}
            />
          </Card>
        </TabPane>

        {/* 日志 */}
        <TabPane tab="日志" key="logs">
          <Card title="系统日志" extra={
            <Space>
              <Button icon={<DownloadOutlined />}>导出</Button>
              <Button icon={<ReloadOutlined />} onClick={refreshData}>刷新</Button>
            </Space>
          }>
            <Table
              columns={logColumns}
              dataSource={logs}
              rowKey="id"
              expandable={{
                expandedRowRender: record => (
                  <div style={{ padding: 16, backgroundColor: '#fafafa' }}>
                    <strong>详细信息：</strong>
                    <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 12 }}>
                      {record.details || '无详细信息'}
                    </div>
                  </div>
                ),
                rowExpandable: record => !!record.details
              }}
              pagination={{
                total: logs.length,
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                  `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
              }}
            />
          </Card>
        </TabPane>

        {/* 告警 */}
        <TabPane tab="告警" key="alerts">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="活跃告警">
                <Timeline>
                  <Timeline.Item color="red">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <strong>API服务器CPU使用率过高</strong>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          服务器 api-server-01 CPU使用率达到 78%
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: '#666' }}>5分钟前</span>
                    </div>
                  </Timeline.Item>
                  <Timeline.Item color="orange">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <strong>数据库连接数过高</strong>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          当前连接数: 45/50，建议扩容
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: '#666' }}>12分钟前</span>
                    </div>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <strong>备份任务完成</strong>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          数据库备份已成功完成
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: '#666' }}>1小时前</span>
                    </div>
                  </Timeline.Item>
                  <Timeline.Item>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <strong>系统巡检完成</strong>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          定期系统健康检查已完成
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: '#666' }}>2小时前</span>
                    </div>
                  </Timeline.Item>
                </Timeline>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="告警规则">
                <List
                  size="small"
                  dataSource={[
                    { name: 'CPU使用率 > 80%', enabled: true },
                    { name: '内存使用率 > 85%', enabled: true },
                    { name: '磁盘使用率 > 90%', enabled: true },
                    { name: 'API响应时间 > 2s', enabled: true },
                    { name: '错误率 > 5%', enabled: false }
                  ]}
                  renderItem={item => (
                    <List.Item>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span style={{ fontSize: 12 }}>{item.name}</span>
                        <Switch size="small" checked={item.enabled} />
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </>
  )
}

export default SystemMonitor 