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
  Switch,
  Slider,
  InputNumber,
  Divider,
  Timeline,
  Badge,
  Tooltip,
  Alert
} from 'antd'
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  SettingOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  StarOutlined,
  ThunderboltOutlined,
  BulbOutlined
} from '@ant-design/icons'
import { Helmet } from 'react-helmet-async'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker
const { TabPane } = Tabs

// 运势记录类型定义
interface FortuneRecord {
  id: string
  userId: string
  username: string
  algorithm: string
  accuracy: number
  processingTime: number
  cacheHit: boolean
  timestamp: string
  result: {
    fortune: string
    advice: string
    rating: number
  }
}

// 算法统计类型
interface AlgorithmStats {
  name: string
  usage: number
  accuracy: number
  avgTime: number
  color: string
}

// 模拟数据
const mockFortuneRecords: FortuneRecord[] = [
  {
    id: '1',
    userId: 'u001',
    username: '张三',
    algorithm: 'master_blind_school',
    accuracy: 95,
    processingTime: 1200,
    cacheHit: false,
    timestamp: '2024-01-20 14:30:00',
    result: {
      fortune: '今日财运亨通，事业有成',
      advice: '宜投资理财，忌冲动决策',
      rating: 4.5
    }
  },
  {
    id: '2',
    userId: 'u002',
    username: '李四',
    algorithm: 'blind_school',
    accuracy: 88,
    processingTime: 800,
    cacheHit: true,
    timestamp: '2024-01-20 13:45:00',
    result: {
      fortune: '感情运势平稳，人际和谐',
      advice: '宜主动沟通，忌消极等待',
      rating: 4.0
    }
  }
]

const mockAlgorithmStats: AlgorithmStats[] = [
  { name: '大师级盲派', usage: 45, accuracy: 94, avgTime: 1150, color: '#ff4d4f' },
  { name: '盲派理论', usage: 35, accuracy: 87, avgTime: 850, color: '#1890ff' },
  { name: '传统八字', usage: 20, accuracy: 82, avgTime: 600, color: '#52c41a' }
]

const mockTrendData = [
  { date: '01-16', requests: 145, accuracy: 89, avgTime: 920 },
  { date: '01-17', requests: 189, accuracy: 91, avgTime: 880 },
  { date: '01-18', requests: 203, accuracy: 93, avgTime: 950 },
  { date: '01-19', requests: 187, accuracy: 90, avgTime: 870 },
  { date: '01-20', requests: 234, accuracy: 94, avgTime: 1020 }
]

const FortuneAnalytics: React.FC = () => {
  const [records, setRecords] = useState<FortuneRecord[]>(mockFortuneRecords)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('all')
  const [configModalVisible, setConfigModalVisible] = useState(false)
  const [cacheModalVisible, setCacheModalVisible] = useState(false)
  const [form] = Form.useForm()

  // 算法配置状态
  const [algorithmConfig, setAlgorithmConfig] = useState({
    masterBlindEnabled: true,
    blindSchoolEnabled: true,
    traditionalEnabled: false,
    cacheEnabled: true,
    cacheTTL: 3600,
    accuracyThreshold: 85,
    timeoutLimit: 5000
  })

  // 过滤记录
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.username.toLowerCase().includes(searchText.toLowerCase())
    const matchesAlgorithm = selectedAlgorithm === 'all' || record.algorithm === selectedAlgorithm
    return matchesSearch && matchesAlgorithm
  })

  // 统计数据
  const stats = {
    totalRequests: records.length,
    avgAccuracy: Math.round(records.reduce((sum, r) => sum + r.accuracy, 0) / records.length),
    avgProcessingTime: Math.round(records.reduce((sum, r) => sum + r.processingTime, 0) / records.length),
    cacheHitRate: Math.round((records.filter(r => r.cacheHit).length / records.length) * 100)
  }

  // 表格列定义
  const columns: ColumnsType<FortuneRecord> = [
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      width: 100
    },
    {
      title: '算法',
      dataIndex: 'algorithm',
      key: 'algorithm',
      width: 120,
      render: (algorithm: string) => {
        const algorithmMap: Record<string, { text: string; color: string }> = {
          master_blind_school: { text: '大师级盲派', color: 'red' },
          blind_school: { text: '盲派理论', color: 'blue' },
          traditional: { text: '传统八字', color: 'green' }
        }
        const config = algorithmMap[algorithm] || { text: algorithm, color: 'default' }
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '准确度',
      dataIndex: 'accuracy',
      key: 'accuracy',
      width: 100,
      render: (accuracy: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress
            percent={accuracy}
            size="small"
            status={accuracy >= 90 ? 'success' : accuracy >= 80 ? 'normal' : 'exception'}
            showInfo={false}
            style={{ width: 60 }}
          />
          <span style={{ fontSize: 12 }}>{accuracy}%</span>
        </div>
      )
    },
    {
      title: '处理时间',
      dataIndex: 'processingTime',
      key: 'processingTime',
      width: 100,
      render: (time: number) => (
        <span style={{ color: time > 1000 ? '#ff4d4f' : '#52c41a' }}>
          {time}ms
        </span>
      )
    },
    {
      title: '缓存',
      dataIndex: 'cacheHit',
      key: 'cacheHit',
      width: 80,
      render: (hit: boolean) => (
        <Badge 
          status={hit ? 'success' : 'default'} 
          text={hit ? '命中' : '未命中'} 
        />
      )
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 140,
      render: (time: string) => dayjs(time).format('MM-DD HH:mm:ss')
    },
    {
      title: '运势结果',
      key: 'result',
      render: (_, record) => (
        <div style={{ maxWidth: 200 }}>
          <div style={{ fontSize: 12, fontWeight: 'bold' }}>
            {record.result.fortune}
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
            {record.result.advice}
          </div>
          <div style={{ marginTop: 4 }}>
            <Rate disabled defaultValue={record.result.rating} style={{ fontSize: 12 }} />
          </div>
        </div>
      )
    }
  ]

  const COLORS = ['#ff4d4f', '#1890ff', '#52c41a', '#faad14', '#722ed1']

  return (
    <>
      <Helmet>
        <title>运势分析 - Divine Friend 管理后台</title>
      </Helmet>

      <div className="page-header">
        <h1>运势分析</h1>
        <p style={{ color: '#666' }}>监控和分析Bazi运势计算系统的性能与准确性</p>
      </div>

      {/* 概览统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总请求数"
              value={stats.totalRequests}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均准确度"
              value={stats.avgAccuracy}
              suffix="%"
              prefix={<StarOutlined />}
              valueStyle={{ color: stats.avgAccuracy >= 90 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均处理时间"
              value={stats.avgProcessingTime}
              suffix="ms"
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: stats.avgProcessingTime <= 1000 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="缓存命中率"
              value={stats.cacheHitRate}
              suffix="%"
              prefix={<FireOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="overview">
        {/* 概览统计 */}
        <TabPane tab="数据概览" key="overview">
          <Row gutter={[16, 16]}>
            {/* 趋势图表 */}
            <Col xs={24} lg={16}>
              <Card title="请求量与准确度趋势" extra={
                <Space>
                  <Button icon={<ReloadOutlined />} size="small">刷新</Button>
                  <Button icon={<DownloadOutlined />} size="small">导出</Button>
                </Space>
              }>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="requests" fill="#1890ff" name="请求数" />
                    <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#52c41a" name="准确度%" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* 算法分布 */}
            <Col xs={24} lg={8}>
              <Card title="算法使用分布">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockAlgorithmStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="usage"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {mockAlgorithmStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 算法管理 */}
        <TabPane tab="算法配置" key="algorithms">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="算法性能对比" extra={
                <Button 
                  type="primary" 
                  icon={<SettingOutlined />}
                  onClick={() => setConfigModalVisible(true)}
                >
                  配置参数
                </Button>
              }>
                <Table
                  dataSource={mockAlgorithmStats}
                  rowKey="name"
                  pagination={false}
                  columns={[
                    {
                      title: '算法名称',
                      dataIndex: 'name',
                      key: 'name',
                      render: (name: string, record) => (
                        <Tag color={record.color}>{name}</Tag>
                      )
                    },
                    {
                      title: '使用率',
                      dataIndex: 'usage',
                      key: 'usage',
                      render: (usage: number) => `${usage}%`
                    },
                    {
                      title: '准确度',
                      dataIndex: 'accuracy',
                      key: 'accuracy',
                      render: (accuracy: number) => (
                        <Progress 
                          percent={accuracy} 
                          size="small" 
                          status={accuracy >= 90 ? 'success' : 'normal'}
                        />
                      )
                    },
                    {
                      title: '平均时间',
                      dataIndex: 'avgTime',
                      key: 'avgTime',
                      render: (time: number) => `${time}ms`
                    }
                  ]}
                />
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="算法状态">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>大师级盲派</span>
                    <Switch checked={algorithmConfig.masterBlindEnabled} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>盲派理论</span>
                    <Switch checked={algorithmConfig.blindSchoolEnabled} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>传统八字</span>
                    <Switch checked={algorithmConfig.traditionalEnabled} />
                  </div>
                  <Divider />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>缓存系统</span>
                    <Switch checked={algorithmConfig.cacheEnabled} />
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 计算记录 */}
        <TabPane tab="计算记录" key="records">
          <Card>
            {/* 搜索筛选 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
              <Col xs={24} sm={8}>
                <Search
                  placeholder="搜索用户名"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={setSearchText}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={6}>
                <Select
                  value={selectedAlgorithm}
                  onChange={setSelectedAlgorithm}
                  style={{ width: '100%' }}
                  placeholder="算法类型"
                >
                  <Option value="all">全部算法</Option>
                  <Option value="master_blind_school">大师级盲派</Option>
                  <Option value="blind_school">盲派理论</Option>
                  <Option value="traditional">传统八字</Option>
                </Select>
              </Col>
              <Col xs={24} sm={10}>
                <Space style={{ float: 'right' }}>
                  <RangePicker />
                  <Button icon={<SearchOutlined />}>高级搜索</Button>
                </Space>
              </Col>
            </Row>

            {/* 记录表格 */}
            <Table
              columns={columns}
              dataSource={filteredRecords}
              rowKey="id"
              loading={loading}
              pagination={{
                total: filteredRecords.length,
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                  `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </TabPane>

        {/* 缓存管理 */}
        <TabPane tab="缓存管理" key="cache">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="缓存统计" extra={
                <Space>
                  <Button 
                    icon={<SettingOutlined />}
                    onClick={() => setCacheModalVisible(true)}
                  >
                    缓存设置
                  </Button>
                  <Button danger icon={<ReloadOutlined />}>
                    清空缓存
                  </Button>
                </Space>
              }>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Statistic title="缓存命中率" value={78} suffix="%" />
                  </Col>
                  <Col span={8}>
                    <Statistic title="缓存条目" value={1254} />
                  </Col>
                  <Col span={8}>
                    <Statistic title="内存使用" value={45.6} suffix="MB" />
                  </Col>
                </Row>
                
                <Divider />
                
                <Timeline>
                  <Timeline.Item color="green">
                    <div>缓存系统启动</div>
                    <div style={{ fontSize: 12, color: '#666' }}>2024-01-20 00:00:00</div>
                  </Timeline.Item>
                  <Timeline.Item color="blue">
                    <div>缓存清理完成 - 清理过期条目 156 个</div>
                    <div style={{ fontSize: 12, color: '#666' }}>2024-01-20 12:00:00</div>
                  </Timeline.Item>
                  <Timeline.Item>
                    <div>缓存命中率达到 80%</div>
                    <div style={{ fontSize: 12, color: '#666' }}>2024-01-20 14:30:00</div>
                  </Timeline.Item>
                </Timeline>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="系统警告">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Alert
                    message="缓存内存使用较高"
                    description="建议定期清理过期缓存"
                    type="warning"
                    showIcon
                    icon={<ExclamationCircleOutlined />}
                  />
                  <Alert
                    message="算法响应正常"
                    description="所有算法运行稳定"
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                  />
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* 算法配置模态框 */}
      <Modal
        title="算法参数配置"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={algorithmConfig}
          onFinish={(values) => {
            setAlgorithmConfig(values)
            setConfigModalVisible(false)
          }}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item label="准确度阈值 (%)" name="accuracyThreshold">
                <Slider
                  min={70}
                  max={100}
                  marks={{
                    70: '70%',
                    80: '80%',
                    90: '90%',
                    100: '100%'
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="超时限制 (ms)" name="timeoutLimit">
                <InputNumber min={1000} max={10000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="缓存TTL (秒)" name="cacheTTL">
                <InputNumber min={300} max={86400} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setConfigModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                保存配置
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 缓存设置模态框 */}
      <Modal
        title="缓存系统设置"
        open={cacheModalVisible}
        onCancel={() => setCacheModalVisible(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>启用缓存系统</span>
            <Switch checked={algorithmConfig.cacheEnabled} />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>缓存生存时间 (TTL)</div>
            <Slider
              min={300}
              max={86400}
              value={algorithmConfig.cacheTTL}
              marks={{
                300: '5分钟',
                1800: '30分钟',
                3600: '1小时',
                86400: '24小时'
              }}
            />
          </div>
          <Button type="primary" danger block>
            清空所有缓存
          </Button>
        </Space>
      </Modal>
    </>
  )
}

export default FortuneAnalytics 