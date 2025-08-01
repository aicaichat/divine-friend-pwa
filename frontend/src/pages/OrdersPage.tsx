import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Order {
  id: string;
  type: 'bracelet' | 'blessing' | 'consultation';
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  amount: number;
  date: string;
  image: string;
  description?: string;
}

interface OrdersPageProps {
  onNavigate?: (page: string) => void;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'completed' | 'cancelled'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // 模拟订单数据
  const mockOrders: Order[] = [
    {
      id: 'order001',
      type: 'bracelet',
      title: '小叶紫檀开光手串',
      status: 'completed',
      amount: 299,
      date: '2024-07-20',
      image: '📿',
      description: '已开光加持，具有平安保佑功效'
    },
    {
      id: 'order002',
      type: 'blessing',
      title: '文殊菩萨智慧加持',
      status: 'processing',
      amount: 88,
      date: '2024-07-25',
      image: '🙏',
      description: '大师正在为您进行智慧加持仪式'
    },
    {
      id: 'order003',
      type: 'consultation',
      title: '大师八字详批',
      status: 'pending',
      amount: 168,
      date: '2024-07-27',
      image: '📋',
      description: '等待大师排期进行详细分析'
    },
    {
      id: 'order004',
      type: 'bracelet',
      title: '沉香108颗佛珠',
      status: 'cancelled',
      amount: 588,
      date: '2024-07-15',
      image: '📿',
      description: '用户主动取消订单'
    },
    {
      id: 'order005',
      type: 'blessing',
      title: '观音菩萨平安加持',
      status: 'completed',
      amount: 128,
      date: '2024-07-10',
      image: '🙏',
      description: '加持完成，护佑平安健康'
    }
  ];

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
    }, 1000);
  }, []);

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'processing': return '#4169E1';
      case 'completed': return '#32CD32';
      case 'cancelled': return '#DC143C';
      default: return '#808080';
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'processing': return '处理中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知状态';
    }
  };

  // 获取分类图标
  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'bracelet': return '📿';
      case 'blessing': return '🙏';
      case 'consultation': return '📋';
      default: return '📦';
    }
  };

  // 筛选订单
  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  // 状态统计
  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            width: '60px',
            height: '60px',
            border: '3px solid rgba(255, 215, 0, 0.3)',
            borderTop: '3px solid #FFD700',
            borderRadius: '50%'
          }}
        />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '2rem 1rem',
      paddingBottom: '6rem'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* 头部 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '2rem',
            textAlign: 'center'
          }}
        >
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: '0.5rem'
          }}>
            我的订单
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1rem'
          }}>
            查看您的购买记录和订单状态
          </p>

          {/* 返回按钮 */}
          <motion.button
            onClick={() => onNavigate?.('profile')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            ← 返回设置
          </motion.button>
        </motion.div>

        {/* 状态筛选标签 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            marginBottom: '2rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '1rem',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {[
              { key: 'all', label: '全部', count: statusCounts.all },
              { key: 'pending', label: '待处理', count: statusCounts.pending },
              { key: 'processing', label: '处理中', count: statusCounts.processing },
              { key: 'completed', label: '已完成', count: statusCounts.completed },
              { key: 'cancelled', label: '已取消', count: statusCounts.cancelled }
            ].map((tab) => (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: 'none',
                  background: activeTab === tab.key 
                    ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: activeTab === tab.key ? '#000' : '#FFF',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {tab.label} ({tab.count})
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 订单列表 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ fontSize: '2.5rem' }}>{order.image}</div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h3 style={{ 
                          color: '#FFFFFF', 
                          fontSize: '1.1rem', 
                          fontWeight: '600',
                          margin: 0
                        }}>
                          {order.title}
                        </h3>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          background: `${getStatusColor(order.status)}20`,
                          color: getStatusColor(order.status),
                          border: `1px solid ${getStatusColor(order.status)}40`
                        }}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      
                      {order.description && (
                        <p style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.9rem',
                          marginBottom: '0.75rem',
                          lineHeight: 1.4
                        }}>
                          {order.description}
                        </p>
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                          {order.date}
                        </span>
                        <span style={{ 
                          color: '#FFD700', 
                          fontSize: '1.2rem', 
                          fontWeight: '700' 
                        }}>
                          ¥{order.amount}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        {order.status === 'pending' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #ff4757, #ff3838)',
                              color: '#FFFFFF',
                              fontSize: '0.9rem',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            取消订单
                          </motion.button>
                        )}
                        {order.status === 'processing' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #3742fa, #2f3542)',
                              color: '#FFFFFF',
                              fontSize: '0.9rem',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            查看进度
                          </motion.button>
                        )}
                        {order.status === 'completed' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #2ed573, #1dd1a1)',
                              color: '#FFFFFF',
                              fontSize: '0.9rem',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            再次购买
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#FFFFFF',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          订单详情
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '15px',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
                <h3 style={{ color: '#FFFFFF', marginBottom: '0.5rem' }}>
                  暂无{activeTab === 'all' ? '' : getStatusText(activeTab)}订单
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '2rem' }}>
                  {activeTab === 'all' ? '您还没有任何订单记录' : `没有找到${getStatusText(activeTab)}的订单`}
                </p>
                <motion.button
                  onClick={() => onNavigate?.('treasure')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '25px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    color: '#000',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  去逛逛法宝
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrdersPage; 