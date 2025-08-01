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
  Avatar,
  message,
  Popconfirm,
  Typography,
  Badge,
  Tooltip,
  InputNumber,
  Image,
  Timeline,
  Divider,
  Spin,
  Alert
} from 'antd'
import {
  GiftOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarOutlined,
  ShoppingOutlined,
  CodeOutlined,
  TrophyOutlined,
  HeartOutlined,
  UploadOutlined,
  DownloadOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  ThunderboltOutlined,
  WifiOutlined
} from '@ant-design/icons'
import { Helmet } from 'react-helmet-async'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { 
  braceletService, 
  Bracelet, 
  ActivationCode, 
  MeritRecord, 
  UserBracelet,
  BraceletInfo 
} from '@services/braceletService'
import { getLocalIPAddress, generateTestBaseURL } from '@utils/networkUtils'

const { Search } = Input
const { Option } = Select
const { Text } = Typography
const { TabPane } = Tabs
const { TextArea } = Input

const ContentManagement: React.FC = () => {
  // 数据状态
  const [bracelets, setBracelets] = useState<Bracelet[]>([])
  const [activationCodes, setActivationCodes] = useState<ActivationCode[]>([])
  const [meritRecords, setMeritRecords] = useState<MeritRecord[]>([])
  const [userBracelets, setUserBracelets] = useState<UserBracelet[]>([])
  
  // 加载状态
  const [loading, setLoading] = useState({
    bracelets: false,
    codes: false,
    merits: false,
    userBracelets: false,
    saving: false
  })
  
  // 搜索和筛选状态
  const [searchText, setSearchText] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  
  // 分页状态
  const [pagination, setPagination] = useState({
    bracelets: { page: 1, pageSize: 10, total: 0 },
    codes: { page: 1, pageSize: 10, total: 0 },
    merits: { page: 1, pageSize: 10, total: 0 },
    userBracelets: { page: 1, pageSize: 10, total: 0 }
  })
  
  // 统计数据
  const [statistics, setStatistics] = useState({
    bracelet: {
      totalBracelets: 0,
      activeBracelets: 0,
      totalSales: 0,
      totalRevenue: 0
    },
    merit: {
      totalMeritEarned: 0,
      totalMeritSpent: 0,
      activeUsers: 0,
      dailyPracticeCount: 0
    }
  })
  
  // 模态框状态
  const [braceletModalVisible, setBraceletModalVisible] = useState(false)
  const [batchCodeModalVisible, setBatchCodeModalVisible] = useState(false)
  const [userBraceletModalVisible, setUserBraceletModalVisible] = useState(false)
  const [selectedBracelet, setSelectedBracelet] = useState<Bracelet | null>(null)
  const [selectedUserBracelet, setSelectedUserBracelet] = useState<UserBracelet | null>(null)
  
  const [form] = Form.useForm()
  const [batchForm] = Form.useForm()
  const [userBraceletForm] = Form.useForm()

  // 初始化数据加载
  useEffect(() => {
    loadAllData()
  }, [])

  // 加载所有数据
  const loadAllData = async () => {
    await Promise.all([
      loadBracelets(),
      loadActivationCodes(),
      loadMeritRecords(),
      loadUserBracelets(),
      loadStatistics()
    ])
  }

  // 加载手串列表
  const loadBracelets = async () => {
    setLoading(prev => ({ ...prev, bracelets: true }))
    try {
      const response = await braceletService.bracelet.list({
        page: pagination.bracelets.page,
        pageSize: pagination.bracelets.pageSize,
        search: searchText || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        type: selectedType !== 'all' ? selectedType : undefined
      })
      setBracelets(response.data)
      setPagination(prev => ({
        ...prev,
        bracelets: { ...prev.bracelets, total: response.total }
      }))
    } catch (error) {
      message.error('加载手串列表失败')
      console.error('Load bracelets error:', error)
    } finally {
      setLoading(prev => ({ ...prev, bracelets: false }))
    }
  }

  // 加载激活码列表
  const loadActivationCodes = async () => {
    setLoading(prev => ({ ...prev, codes: true }))
    try {
      const response = await braceletService.activationCode.list({
        page: pagination.codes.page,
        pageSize: pagination.codes.pageSize
      })
      setActivationCodes(response.data)
      setPagination(prev => ({
        ...prev,
        codes: { ...prev.codes, total: response.total }
      }))
    } catch (error) {
      message.error('加载激活码列表失败')
      console.error('Load activation codes error:', error)
    } finally {
      setLoading(prev => ({ ...prev, codes: false }))
    }
  }

  // 加载功德记录
  const loadMeritRecords = async () => {
    setLoading(prev => ({ ...prev, merits: true }))
    try {
      const response = await braceletService.meritRecord.list({
        page: pagination.merits.page,
        pageSize: pagination.merits.pageSize
      })
      setMeritRecords(response.data)
      setPagination(prev => ({
        ...prev,
        merits: { ...prev.merits, total: response.total }
      }))
    } catch (error) {
      message.error('加载功德记录失败')
      console.error('Load merit records error:', error)
    } finally {
      setLoading(prev => ({ ...prev, merits: false }))
    }
  }

  // 加载用户手串绑定
  const loadUserBracelets = async () => {
    setLoading(prev => ({ ...prev, userBracelets: true }))
    try {
      const response = await braceletService.userBracelet.list({
        page: pagination.userBracelets.page,
        pageSize: pagination.userBracelets.pageSize
      })
      setUserBracelets(response.data)
      setPagination(prev => ({
        ...prev,
        userBracelets: { ...prev.userBracelets, total: response.total }
      }))
    } catch (error) {
      message.error('加载用户手串绑定失败')
      console.error('Load user bracelets error:', error)
    } finally {
      setLoading(prev => ({ ...prev, userBracelets: false }))
    }
  }

  // 加载统计数据
  const loadStatistics = async () => {
    try {
      const [braceletStats, meritStats] = await Promise.all([
        braceletService.statistics.getBraceletStats(),
        braceletService.statistics.getMeritStats()
      ])
      
      setStatistics({
        bracelet: braceletStats,
        merit: meritStats
      })
    } catch (error) {
      console.error('Load statistics error:', error)
    }
  }

  // 监听搜索和筛选变化
  useEffect(() => {
    loadBracelets()
  }, [pagination.bracelets.page, pagination.bracelets.pageSize, searchText, selectedStatus, selectedType])

  // 处理手串保存
  const handleSaveBracelet = async (values: any) => {
    setLoading(prev => ({ ...prev, saving: true }))
    try {
      if (selectedBracelet) {
        // 编辑
        await braceletService.bracelet.update(selectedBracelet.id, values)
        message.success('手串更新成功')
      } else {
        // 新增
        await braceletService.bracelet.create(values)
        message.success('手串添加成功')
      }
      
      setBraceletModalVisible(false)
      setSelectedBracelet(null)
      form.resetFields()
      await loadBracelets()
      await loadStatistics()
    } catch (error) {
      message.error('保存手串失败')
      console.error('Save bracelet error:', error)
    } finally {
      setLoading(prev => ({ ...prev, saving: false }))
    }
  }

  // 处理手串删除
  const handleDeleteBracelet = async (braceletId: string) => {
    try {
      await braceletService.bracelet.delete(braceletId)
      message.success('手串删除成功')
      await loadBracelets()
      await loadStatistics()
    } catch (error) {
      message.error('删除手串失败')
      console.error('Delete bracelet error:', error)
    }
  }

  // 处理批量生成激活码
  const handleBatchGenerateCodes = async (values: any) => {
    setLoading(prev => ({ ...prev, saving: true }))
    try {
      const { braceletId, quantity, expiresAt } = values
      
      const codes = await braceletService.activationCode.batchGenerate({
        braceletId,
        quantity,
        expiresAt: dayjs(expiresAt).toISOString()
      })
      
      message.success(`成功生成 ${codes.length} 个激活码`)
      setBatchCodeModalVisible(false)
      batchForm.resetFields()
      await loadActivationCodes()
    } catch (error) {
      message.error('生成激活码失败')
      console.error('Generate codes error:', error)
    } finally {
      setLoading(prev => ({ ...prev, saving: false }))
    }
  }

  // 处理用户手串能量更新
  const handleUpdateUserBraceletEnergy = async (userBraceletId: string, energyLevel: number) => {
    try {
      await braceletService.userBracelet.updateEnergy(userBraceletId, energyLevel)
      message.success('能量等级更新成功')
      await loadUserBracelets()
    } catch (error) {
      message.error('更新能量等级失败')
      console.error('Update energy error:', error)
    }
  }

  // 显示NFC信息
  const showNFCInfo = async (activationCode: ActivationCode) => {
    try {
      setLoading(prev => ({ ...prev, saving: true }))
      
      // 生成NFC URL信息
      const nfcData = await braceletService.activationCode.generateNFCURL({
        chipId: activationCode.chipId || 'CHIP-UNKNOWN',
        braceletId: activationCode.braceletId,
        braceletName: activationCode.braceletName
      })
      
      // 状态管理
      let editableBaseURL = nfcData.nfcURL.split('/verify')[0]
      let currentNFCURL = nfcData.nfcURL
      
      // 创建可编辑的Modal组件
      const NFCInfoModal = () => {
        const [baseURL, setBaseURL] = React.useState(editableBaseURL)
        const [finalURL, setFinalURL] = React.useState(currentNFCURL)
        
        // 获取URL参数部分
        const urlParams = currentNFCURL.split('/verify')[1]
        
        // 更新完整URL
        const updateFinalURL = (newBaseURL: string) => {
          const cleanBaseURL = newBaseURL.replace(/\/$/, '') // 移除末尾斜杠
          const newURL = `${cleanBaseURL}/verify${urlParams}`
          setFinalURL(newURL)
        }
        
        // 自动获取本机IP地址
        const getLocalIP = async () => {
          try {
            const detectedIP = await getLocalIPAddress()
            return generateTestBaseURL(detectedIP.split('//')[1])
          } catch {
            return generateTestBaseURL()
          }
        }
        
        return (
          <div style={{ padding: '16px 0' }}>
            <Divider orientation="left" style={{ margin: '16px 0' }}>基本信息</Divider>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>激活码：</Text>
                <br />
                <Text copyable code>{activationCode.code}</Text>
              </Col>
              <Col span={12}>
                <Text strong>芯片ID：</Text>
                <br />
                <Text copyable code>{activationCode.chipId || 'N/A'}</Text>
              </Col>
              <Col span={24}>
                <Text strong>手串名称：</Text>
                <br />
                <Text>{activationCode.braceletName}</Text>
              </Col>
            </Row>

            <Divider orientation="left" style={{ margin: '16px 0' }}>🌐 基础URL配置</Divider>
            <div style={{ marginBottom: 16 }}>
              <Text strong>基础地址 (可编辑用于测试)：</Text>
              <br />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Input 
                  value={baseURL}
                  onChange={(e) => {
                    setBaseURL(e.target.value)
                    updateFinalURL(e.target.value)
                  }}
                  placeholder="https://yourapp.com 或 http://192.168.1.100:3002"
                  style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }}
                />
                <Button 
                  onClick={async () => {
                    const localIP = await getLocalIP()
                    setBaseURL(localIP)
                    updateFinalURL(localIP)
                  }}
                  size="small"
                >
                  🔄 本机IP
                </Button>
              </div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                💡 提示：修改此地址可以指向您的测试服务器或本机IP
              </div>
            </div>

            <Divider orientation="left" style={{ margin: '16px 0' }}>📱 NFC URL</Divider>
            <div style={{ marginBottom: 16 }}>
              <Text strong>写入NFC芯片的URL：</Text>
              <br />
              <Input.TextArea 
                value={finalURL} 
                readOnly 
                rows={3}
                style={{ 
                  marginTop: 8, 
                  fontFamily: 'monospace', 
                  fontSize: 12,
                  background: '#f6ffed',
                  border: '1px solid #b7eb8f'
                }}
              />
              <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button 
                  size="small" 
                  onClick={() => {
                    navigator.clipboard.writeText(finalURL)
                    message.success('NFC URL已复制到剪贴板')
                  }}
                >
                  📋 复制URL
                </Button>
                <Button 
                  size="small"
                  type="primary"
                  onClick={() => {
                    window.open(finalURL, '_blank')
                  }}
                >
                  🧪 测试链接
                </Button>
              </div>
                         </div>

            <Divider orientation="left" style={{ margin: '16px 0' }}>📄 QR码</Divider>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Image 
                src={nfcData.qrCode} 
                width={150} 
                height={150}
                style={{ border: '1px solid #d9d9d9', borderRadius: 8 }}
              />
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                扫描此二维码可直接打开验证页面
              </Text>
            </div>

            <Divider orientation="left" style={{ margin: '16px 0' }}>NFC写入指南</Divider>
            <Alert
              message="📱 如何将URL写入NFC芯片"
              description={
                <div style={{ fontSize: 13 }}>
                  <div style={{ marginBottom: 12 }}>
                    <strong>📥 第一步：下载NFC写入工具</strong>
                    <br />
                    • Android: NFC Tools (推荐), TagWriter
                    <br />
                    • iOS: NFC Tools, NFC TagWriter
                  </div>
                  
                  <div style={{ marginBottom: 12 }}>
                    <strong>⚙️ 第二步：配置写入参数</strong>
                    <br />
                    • 打开NFC写入应用
                    <br />
                    • 选择数据类型: <code>URL / 网址</code>
                    <br />
                    • URL类型: <code>https://</code>
                  </div>
                  
                  <div style={{ marginBottom: 12 }}>
                    <strong>📋 第三步：粘贴完整URL</strong>
                    <br />
                    • 复制上方完整的NFC URL
                    <br />
                    • 粘贴到写入工具的URL输入框
                    <br />
                    • ⚠️ 确保参数完整，不要遗漏！
                  </div>
                  
                  <div style={{ marginBottom: 12 }}>
                    <strong>🔧 第四步：执行写入</strong>
                    <br />
                    • 点击"写入"或"Write"按钮
                    <br />
                    • 将手机靠近手串NFC芯片 (&lt;2cm)
                    <br />
                    • 保持靠近直到出现"写入成功"提示
                  </div>
                  
                  <div style={{ marginBottom: 8 }}>
                    <strong>✅ 第五步：测试验证</strong>
                    <br />
                    • 手机靠近手串 → 弹出链接提示 → 点击打开 → 验证成功
                  </div>
                  
                  <div style={{ 
                    background: '#fff7e6', 
                    border: '1px solid #ffd591', 
                    borderRadius: 4, 
                    padding: 8, 
                    marginTop: 12 
                  }}>
                    <strong>💡 推荐芯片规格:</strong> NTAG213/215 (容量&gt;180bytes)
                  </div>
                </div>
              }
              type="info"
              showIcon
              style={{ fontSize: 13 }}
            />

            <Divider orientation="left" style={{ margin: '16px 0' }}>技术信息</Divider>
            <Row gutter={[16, 8]}>
              <Col span={24}>
                <Text strong>安全哈希：</Text>
                <br />
                <Text code style={{ fontSize: 11 }}>{nfcData.securityHash}</Text>
              </Col>
              <Col span={24}>
                <Text strong>NDEF记录结构：</Text>
                <br />
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: 8, 
                  borderRadius: 4, 
                  fontSize: 11,
                  margin: '4px 0'
                }}>
                  {JSON.stringify(nfcData.nfcRecord, null, 2)}
                </pre>
              </Col>
            </Row>
          </div>
        )
      }
      
      Modal.info({
        title: '📱 NFC信息管理',
        width: 700,
        content: <NFCInfoModal />,
        onOk() {
          // 可以在这里添加额外的操作
        }
      })
      
    } catch (error) {
      message.error('获取NFC信息失败')
      console.error('Show NFC info error:', error)
    } finally {
      setLoading(prev => ({ ...prev, saving: false }))
    }
  }

  // 手串表格列定义
  const braceletColumns: ColumnsType<Bracelet> = [
    {
      title: '手串信息',
      key: 'info',
      width: 280,
      render: (_, bracelet) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image 
            src={bracelet.image} 
            width={60} 
            height={60}
            style={{ borderRadius: 6 }}
            preview={false}
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMCAyMEM0My4yNTQ4IDIwIDQ0IDIxLjc5MDkgNDQgMjZWMzRDNDQgMzguMjA5MSA0My4yNTQ4IDQwIDMwIDQwQzE2Ljc0NTIgNDAgMTYgMzguMjA5MSAxNiAzNFYyNkMxNiAyMS43OTA5IDE2Ljc0NTIgMjAgMzAgMjBaIiBmaWxsPSIjODc4N0E0Ii8+Cjx0ZXh0IHg9IjMwIiB5PSI0OCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjODc4N0E0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7miYvkuLI8L3RleHQ+Cjwvc3ZnPgo="
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>
              {bracelet.name}
            </div>
            <div style={{ color: '#666', fontSize: 12, marginBottom: 2 }}>
              {bracelet.material} · {bracelet.beadCount}颗
            </div>
            <div style={{ fontSize: 12, color: '#999' }}>
              {bracelet.scriptures.join(' · ')}
            </div>
            {bracelet.consecrationInfo && (
              <div style={{ fontSize: 10, color: '#52c41a', marginTop: 2 }}>
                ✨ {bracelet.consecrationInfo.temple} - {bracelet.consecrationInfo.master}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => {
        const typeConfig = {
          premium: { color: 'red', text: '高级' },
          standard: { color: 'blue', text: '标准' },
          basic: { color: 'green', text: '基础' }
        }
        const config = typeConfig[type as keyof typeof typeConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '价格/功德',
      key: 'price',
      width: 100,
      render: (_, bracelet) => (
        <div>
          <div style={{ fontWeight: 'bold', color: '#ff4d4f', fontSize: 13 }}>
            ¥{bracelet.price}
          </div>
          <div style={{ fontSize: 12, color: '#1890ff' }}>
            {bracelet.meritPoints} 功德
          </div>
        </div>
      )
    },
    {
      title: '库存/销量',
      key: 'stock',
      width: 100,
      render: (_, bracelet) => (
        <div>
          <div style={{ 
            color: bracelet.inStock > 0 ? '#52c41a' : '#ff4d4f',
            fontWeight: 'bold',
            fontSize: 13
          }}>
            库存: {bracelet.inStock}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            销量: {bracelet.totalSold}
          </div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const statusConfig = {
          active: { color: 'green', text: '正常' },
          inactive: { color: 'orange', text: '下架' },
          soldout: { color: 'red', text: '缺货' }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (time: string) => dayjs(time).format('MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      fixed: 'right',
      render: (_, bracelet) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedBracelet(bracelet)
                form.setFieldsValue({
                  ...bracelet,
                  scriptures: bracelet.scriptures,
                  consecrationTemple: bracelet.consecrationInfo?.temple,
                  consecrationMaster: bracelet.consecrationInfo?.master,
                  consecrationVideo: bracelet.consecrationInfo?.videoUrl
                })
                setBraceletModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title="生成激活码">
            <Button
              size="small"
              icon={<CodeOutlined />}
              onClick={() => {
                batchForm.setFieldValue('braceletId', bracelet.id)
                setBatchCodeModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个手串吗？"
              onConfirm={() => handleDeleteBracelet(bracelet.id)}
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

  // 激活码表格列定义
  const codeColumns: ColumnsType<ActivationCode> = [
    {
      title: '激活码',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (code: string) => (
        <Text copyable style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {code}
        </Text>
      )
    },
    {
      title: '芯片ID',
      dataIndex: 'chipId',
      key: 'chipId',
      width: 120,
      render: (chipId?: string) => chipId ? (
        <Text copyable style={{ fontFamily: 'monospace', fontSize: 11 }}>
          {chipId}
        </Text>
      ) : '-'
    },
    {
      title: '关联手串',
      dataIndex: 'braceletName',
      key: 'braceletName',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const statusConfig = {
          unused: { color: 'blue', text: '未使用', icon: <ClockCircleOutlined /> },
          used: { color: 'green', text: '已使用', icon: <CheckCircleOutlined /> },
          expired: { color: 'red', text: '已过期', icon: <ExclamationCircleOutlined /> }
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        )
      }
    },
    {
      title: '使用用户',
      dataIndex: 'username',
      key: 'username',
      width: 100,
      render: (username?: string) => username || '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (time: string) => dayjs(time).format('MM-DD HH:mm')
    },
    {
      title: '使用时间',
      dataIndex: 'usedAt',
      key: 'usedAt',
      width: 110,
      render: (time?: string) => time ? dayjs(time).format('MM-DD HH:mm') : '-'
    },
    {
      title: '过期时间',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 110,
      render: (time: string) => {
        const isExpired = dayjs(time).isBefore(dayjs())
        return (
          <span style={{ color: isExpired ? '#ff4d4f' : '#52c41a' }}>
            {dayjs(time).format('MM-DD HH:mm')}
          </span>
        )
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, activationCode) => (
        <Space size="small">
          <Tooltip title="查看NFC信息">
            <Button
              size="small"
              icon={<WifiOutlined />}
              onClick={() => showNFCInfo(activationCode)}
            />
          </Tooltip>
          <Tooltip title="复制激活码">
            <Button
              size="small"
              icon={<CodeOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(activationCode.code)
                message.success('激活码已复制到剪贴板')
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  // 功德记录表格列定义
  const meritColumns: ColumnsType<MeritRecord> = [
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      width: 100,
      render: (username: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Avatar size="small" icon={<UserOutlined />} />
          {username}
        </div>
      )
    },
    {
      title: '行为',
      dataIndex: 'action',
      key: 'action',
      width: 120
    },
    {
      title: '功德变化',
      dataIndex: 'points',
      key: 'points',
      width: 100,
      render: (points: number, record) => (
        <span style={{ 
          color: record.type === 'earn' ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold',
          fontSize: 14
        }}>
          {record.type === 'earn' ? '+' : ''}{points}
        </span>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '关联手串',
      dataIndex: 'braceletId',
      key: 'braceletId',
      width: 100,
      render: (braceletId?: string) => {
        if (!braceletId) return '-'
        const bracelet = bracelets.find(b => b.id === braceletId)
        return bracelet ? (
          <Tag color="blue" style={{ fontSize: 11 }}>
            {bracelet.name}
          </Tag>
        ) : '-'
      }
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 130,
      render: (time: string) => dayjs(time).format('MM-DD HH:mm:ss')
    }
  ]

  // 用户手串绑定表格列定义
  const userBraceletColumns: ColumnsType<UserBracelet> = [
    {
      title: '用户信息',
      key: 'userInfo',
      width: 150,
      render: (_, userBracelet) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 13 }}>
              {userBracelet.username}
            </div>
            <div style={{ fontSize: 11, color: '#666' }}>
              ID: {userBracelet.userId}
            </div>
          </div>
        </div>
      )
    },
    {
      title: '手串',
      key: 'bracelet',
      width: 120,
      render: (_, userBracelet) => {
        const bracelet = bracelets.find(b => b.id === userBracelet.braceletId)
        return bracelet ? (
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 12 }}>{bracelet.name}</div>
            <div style={{ fontSize: 11, color: '#666' }}>{bracelet.material}</div>
          </div>
        ) : '-'
      }
    },
    {
      title: '芯片ID',
      dataIndex: 'chipId',
      key: 'chipId',
      width: 120,
      render: (chipId: string) => (
        <Text copyable style={{ fontFamily: 'monospace', fontSize: 11 }}>
          {chipId}
        </Text>
      )
    },
    {
      title: '能量等级',
      dataIndex: 'energyLevel',
      key: 'energyLevel',
      width: 100,
      render: (energyLevel: number, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 40,
            height: 6,
            background: '#f0f0f0',
            borderRadius: 3,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${energyLevel}%`,
              height: '100%',
              background: energyLevel >= 80 ? '#52c41a' : energyLevel >= 50 ? '#faad14' : '#ff4d4f',
              borderRadius: 3
            }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 'bold' }}>{energyLevel}%</span>
          <Button
            size="small"
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              const newLevel = prompt('请输入新的能量等级 (0-100):', energyLevel.toString())
              if (newLevel && !isNaN(Number(newLevel))) {
                const level = Math.max(0, Math.min(100, Number(newLevel)))
                handleUpdateUserBraceletEnergy(record.id, level)
              }
            }}
          />
        </div>
      )
    },
    {
      title: '修持统计',
      key: 'practiceStats',
      width: 120,
      render: (_, userBracelet) => (
        <div>
          <div style={{ fontSize: 12 }}>
            总计: <strong>{userBracelet.totalPracticeCount}</strong>次
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            今日: {userBracelet.dailyPracticeCount}次
          </div>
          <div style={{ fontSize: 12, color: '#1890ff' }}>
            连续: {userBracelet.practiceStreak}天
          </div>
        </div>
      )
    },
    {
      title: '绑定时间',
      dataIndex: 'bindingDate',
      key: 'bindingDate',
      width: 110,
      render: (time: string) => dayjs(time).format('MM-DD HH:mm')
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActiveDate',
      key: 'lastActiveDate',
      width: 110,
      render: (time: string) => {
        const isRecent = dayjs().diff(dayjs(time), 'hours') < 24
        return (
          <span style={{ color: isRecent ? '#52c41a' : '#666' }}>
            {dayjs(time).format('MM-DD HH:mm')}
          </span>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <Badge 
          status={isActive ? 'success' : 'default'} 
          text={isActive ? '活跃' : '不活跃'}
        />
      )
    }
  ]

  return (
    <>
      <Helmet>
        <title>内容管理 - Divine Friend 管理后台</title>
      </Helmet>

      <div className="page-header">
        <h1>内容管理</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#666', margin: 0 }}>管理手串商品、激活码和功德积分系统</p>
          <Button 
            icon={<SyncOutlined />} 
            onClick={loadAllData}
            loading={Object.values(loading).some(Boolean)}
          >
            刷新数据
          </Button>
        </div>
      </div>

      <Tabs defaultActiveKey="bracelets">
        {/* 手串管理 */}
        <TabPane tab="手串管理" key="bracelets">
          {/* 统计卡片 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="手串总数"
                  value={statistics.bracelet.totalBracelets}
                  prefix={<GiftOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="在售商品"
                  value={statistics.bracelet.activeBracelets}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总销量"
                  value={statistics.bracelet.totalSales}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="销售总额"
                  value={statistics.bracelet.totalRevenue}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 搜索和操作 */}
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={6}>
                <Search
                  placeholder="搜索手串名称"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={4}>
                <Select
                  value={selectedType}
                  onChange={setSelectedType}
                  style={{ width: '100%' }}
                  placeholder="手串类型"
                >
                  <Option value="all">全部类型</Option>
                  <Option value="premium">高级</Option>
                  <Option value="standard">标准</Option>
                  <Option value="basic">基础</Option>
                </Select>
              </Col>
              <Col xs={24} sm={4}>
                <Select
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  style={{ width: '100%' }}
                  placeholder="商品状态"
                >
                  <Option value="all">全部状态</Option>
                  <Option value="active">正常</Option>
                  <Option value="inactive">下架</Option>
                  <Option value="soldout">缺货</Option>
                </Select>
              </Col>
              <Col xs={24} sm={10}>
                <Space style={{ float: 'right' }}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setSelectedBracelet(null)
                      form.resetFields()
                      setBraceletModalVisible(true)
                    }}
                  >
                    新增手串
                  </Button>
                  <Button icon={<DownloadOutlined />}>
                    导出数据
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* 手串列表 */}
          <Card>
            <Table
              columns={braceletColumns}
              dataSource={bracelets}
              rowKey="id"
              loading={loading.bracelets}
              pagination={{
                current: pagination.bracelets.page,
                pageSize: pagination.bracelets.pageSize,
                total: pagination.bracelets.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
                onChange: (page, pageSize) => {
                  setPagination(prev => ({
                    ...prev,
                    bracelets: { ...prev.bracelets, page, pageSize }
                  }))
                }
              }}
              scroll={{ x: 1400 }}
            />
          </Card>
        </TabPane>

        {/* 激活码管理 */}
        <TabPane tab="激活码管理" key="codes">
          {/* 激活码统计 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="激活码总数"
                  value={activationCodes.length}
                  prefix={<CodeOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="未使用"
                  value={activationCodes.filter(c => c.status === 'unused').length}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="已使用"
                  value={activationCodes.filter(c => c.status === 'used').length}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="已过期"
                  value={activationCodes.filter(c => c.status === 'expired').length}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>

          <Card>
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              <Space>
                <Button 
                  icon={<SyncOutlined />}
                  onClick={loadActivationCodes}
                  loading={loading.codes}
                >
                  刷新
                </Button>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setBatchCodeModalVisible(true)}
                >
                  批量生成激活码
                </Button>
              </Space>
            </div>

            <Table
              columns={codeColumns}
              dataSource={activationCodes}
              rowKey="id"
              loading={loading.codes}
              pagination={{
                current: pagination.codes.page,
                pageSize: pagination.codes.pageSize,
                total: pagination.codes.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
                onChange: (page, pageSize) => {
                  setPagination(prev => ({
                    ...prev,
                    codes: { ...prev.codes, page, pageSize }
                  }))
                }
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </TabPane>

        {/* 功德积分 */}
        <TabPane tab="功德积分" key="merit">
          {/* 功德统计 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总获得功德"
                  value={statistics.merit.totalMeritEarned}
                  prefix={<HeartOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总消费功德"
                  value={statistics.merit.totalMeritSpent}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="活跃用户数"
                  value={statistics.merit.activeUsers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="今日修持"
                  value={statistics.merit.dailyPracticeCount}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="功德积分记录">
            <Table
              columns={meritColumns}
              dataSource={meritRecords}
              rowKey="id"
              loading={loading.merits}
              pagination={{
                current: pagination.merits.page,
                pageSize: pagination.merits.pageSize,
                total: pagination.merits.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
                onChange: (page, pageSize) => {
                  setPagination(prev => ({
                    ...prev,
                    merits: { ...prev.merits, page, pageSize }
                  }))
                }
              }}
              scroll={{ x: 900 }}
            />
          </Card>
        </TabPane>

        {/* 用户手串绑定 */}
        <TabPane tab="用户绑定" key="user-bracelets">
          <Card title="用户手串绑定管理">
            <Table
              columns={userBraceletColumns}
              dataSource={userBracelets}
              rowKey="id"
              loading={loading.userBracelets}
              pagination={{
                current: pagination.userBracelets.page,
                pageSize: pagination.userBracelets.pageSize,
                total: pagination.userBracelets.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
                onChange: (page, pageSize) => {
                  setPagination(prev => ({
                    ...prev,
                    userBracelets: { ...prev.userBracelets, page, pageSize }
                  }))
                }
              }}
              scroll={{ x: 1100 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 手串编辑模态框 */}
      <Modal
        title={selectedBracelet ? "编辑手串" : "新增手串"}
        open={braceletModalVisible}
        onCancel={() => {
          setBraceletModalVisible(false)
          setSelectedBracelet(null)
          form.resetFields()
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveBracelet}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="手串名称"
                name="name"
                rules={[{ required: true, message: '请输入手串名称' }]}
              >
                <Input placeholder="输入手串名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="类型"
                name="type"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select placeholder="选择手串类型">
                  <Option value="basic">基础</Option>
                  <Option value="standard">标准</Option>
                  <Option value="premium">高级</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="描述"
                name="description"
                rules={[{ required: true, message: '请输入描述' }]}
              >
                <TextArea rows={3} placeholder="输入手串描述" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="材质"
                name="material"
                rules={[{ required: true, message: '请输入材质' }]}
              >
                <Input placeholder="如：小叶紫檀" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="珠子数量"
                name="beadCount"
                rules={[{ required: true, message: '请输入珠子数量' }]}
              >
                <InputNumber min={1} placeholder="如：108" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="价格(元)"
                name="price"
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber min={0} placeholder="价格" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="功德积分"
                name="meritPoints"
                rules={[{ required: true, message: '请输入功德积分' }]}
              >
                <InputNumber min={0} placeholder="功德积分" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="库存数量"
                name="inStock"
                rules={[{ required: true, message: '请输入库存数量' }]}
              >
                <InputNumber min={0} placeholder="库存数量" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="选择状态">
                  <Option value="active">正常</Option>
                  <Option value="inactive">下架</Option>
                  <Option value="soldout">缺货</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="包含经文"
                name="scriptures"
                rules={[{ required: true, message: '请选择包含的经文' }]}
              >
                <Select mode="multiple" placeholder="选择包含的经文">
                  <Option value="心经">心经</Option>
                  <Option value="金刚经">金刚经</Option>
                  <Option value="大悲咒">大悲咒</Option>
                  <Option value="楞严咒">楞严咒</Option>
                  <Option value="往生咒">往生咒</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Divider>开光信息</Divider>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="开光寺院"
                name="consecrationTemple"
              >
                <Input placeholder="如：灵隐寺" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="主持法师"
                name="consecrationMaster"
              >
                <Input placeholder="如：慧明法师" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="开光视频URL"
                name="consecrationVideo"
              >
                <Input placeholder="输入开光仪式视频链接" />
              </Form.Item>
            </Col>
          </Row>
          
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setBraceletModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading.saving}>
                保存
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* 批量生成激活码模态框 */}
      <Modal
        title="批量生成激活码"
        open={batchCodeModalVisible}
        onCancel={() => {
          setBatchCodeModalVisible(false)
          batchForm.resetFields()
        }}
        footer={null}
      >
        <Form
          form={batchForm}
          layout="vertical"
          onFinish={handleBatchGenerateCodes}
        >
          <Form.Item
            label="选择手串"
            name="braceletId"
            rules={[{ required: true, message: '请选择手串' }]}
          >
            <Select placeholder="选择要生成激活码的手串">
              {bracelets.map(bracelet => (
                <Option key={bracelet.id} value={bracelet.id}>
                  {bracelet.name} ({bracelet.material} · {bracelet.beadCount}颗)
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="生成数量"
            name="quantity"
            rules={[{ required: true, message: '请输入生成数量' }]}
          >
            <InputNumber min={1} max={1000} placeholder="输入生成数量" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            label="过期时间"
            name="expiresAt"
            rules={[{ required: true, message: '请选择过期时间' }]}
          >
            <DatePicker 
              showTime 
              placeholder="选择过期时间" 
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().endOf('day')}
            />
          </Form.Item>
          
          <Alert
            message="提示"
            description="生成的激活码将包含自动生成的NFC芯片ID，用户可通过激活码或NFC感应进行验证"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setBatchCodeModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading.saving}>
                生成激活码
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </>
  )
}

export default ContentManagement 