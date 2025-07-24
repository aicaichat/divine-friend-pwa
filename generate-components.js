#!/usr/bin/env node

/**
 * 交个神仙朋友 PWA - React组件自动生成器
 * Divine Friend PWA - React Component Generator
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 组件模板
const templates = {
  // 基础功能组件模板
  component: (name, description) => `import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

/**
 * ${description}
 * @param props - 组件属性
 */
export const ${name}: React.FC<${name}Props> = ({ 
  className,
  children,
  ...props 
}) => {
  return (
    <motion.div
      className={cn(
        "zen-${name.toLowerCase()}",
        "relative",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

${name}.displayName = '${name}';

export default ${name};`,

  // 页面组件模板
  page: (name, description) => `import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTitle } from '@/hooks/useTitle';
import { PageLayout } from '@/components/layout/PageLayout';

/**
 * ${description}
 */
export const ${name}Page: React.FC = () => {
  useTitle('${description}');

  return (
    <>
      <Helmet>
        <title>${description} - 交个神仙朋友</title>
        <meta name="description" content="${description}" />
      </Helmet>
      
      <PageLayout>
        <motion.div
          className="zen-${name.toLowerCase()}-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-8">
              <h1 className="text-display-large zen-deity-shine mb-4">
                ${description}
              </h1>
              <p className="text-body-large text-zen-shadow">
                ${description}页面内容
              </p>
            </header>

            <main>
              {/* TODO: 实现${description}功能 */}
              <div className="zen-card zen-card-deity p-8 text-center">
                <p className="text-body-medium">
                  ${description}功能正在开发中...
                </p>
              </div>
            </main>
          </div>
        </motion.div>
      </PageLayout>
    </>
  );
};

export default ${name}Page;`,

  // Hook 模板
  hook: (name, description) => `import { useState, useEffect, useCallback } from 'react';

interface Use${name}Return {
  // TODO: 定义返回类型
  data: any;
  loading: boolean;
  error: string | null;
}

/**
 * ${description}
 * @returns Hook返回值
 */
export const use${name} = (): Use${name}Return => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: 实现Hook逻辑
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 实现数据获取逻辑
      const result = await fetch('/api/data');
      const data = await result.json();
      setData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error
  };
};`,

  // Service 模板
  service: (name, description) => `import { api } from './api';
import { ApiResponse } from '@/types/api';

/**
 * ${description}
 */
export class ${name}Service {
  
  /**
   * 获取数据
   */
  static async getData(): Promise<ApiResponse<any>> {
    try {
      const response = await api.get('/${name.toLowerCase()}');
      return {
        success: true,
        data: response.data,
        message: '获取成功'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : '获取失败'
      };
    }
  }

  /**
   * 创建数据
   */
  static async createData(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/${name.toLowerCase()}', data);
      return {
        success: true,
        data: response.data,
        message: '创建成功'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : '创建失败'
      };
    }
  }

  /**
   * 更新数据
   */
  static async updateData(id: string, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await api.put(\`/${name.toLowerCase()}/\${id}\`, data);
      return {
        success: true,
        data: response.data,
        message: '更新成功'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : '更新失败'
      };
    }
  }

  /**
   * 删除数据
   */
  static async deleteData(id: string): Promise<ApiResponse<any>> {
    try {
      await api.delete(\`/${name.toLowerCase()}/\${id}\`);
      return {
        success: true,
        data: null,
        message: '删除成功'
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : '删除失败'
      };
    }
  }
}`,

  // Store 模板 (Zustand)
  store: (name, description) => `import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ${name}State {
  // 状态定义
  data: any[];
  loading: boolean;
  error: string | null;
  
  // 操作方法
  setData: (data: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * ${description} Store
 */
export const use${name}Store = create<${name}State>()(
  devtools(
    (set, get) => ({
      // 初始状态
      data: [],
      loading: false,
      error: null,

      // 操作方法
      setData: (data) => set({ data }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      reset: () => set({ 
        data: [], 
        loading: false, 
        error: null 
      }),
    }),
    {
      name: '${name.toLowerCase()}-store',
    }
  )
);`,

  // 类型定义模板
  types: (name, description) => `/**
 * ${description} 相关类型定义
 */

export interface ${name} {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  // TODO: 添加更多属性
}

export interface ${name}CreateInput {
  name: string;
  // TODO: 添加创建时需要的字段
}

export interface ${name}UpdateInput {
  name?: string;
  // TODO: 添加更新时可选的字段
}

export interface ${name}Filter {
  name?: string;
  // TODO: 添加筛选条件
}

export interface ${name}Response {
  data: ${name}[];
  total: number;
  page: number;
  pageSize: number;
}`,

  // 测试文件模板
  test: (name, description) => `import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ${name} } from './${name}';

// Mock dependencies
vi.mock('@/services/api');

describe('${name}', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染组件', () => {
    render(<${name} />);
    
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('应该处理用户交互', async () => {
    render(<${name} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('成功')).toBeInTheDocument();
    });
  });

  it('应该处理错误状态', async () => {
    // TODO: 添加错误处理测试
  });

  it('应该处理加载状态', () => {
    // TODO: 添加加载状态测试
  });
});`
};

// 特殊组件模板
const specialTemplates = {
  // 神仙朋友组件
  'DeityFriend': (name) => `import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '@/hooks/useAI';
import { cn } from '@/utils/cn';

interface DeityFriendProps {
  userId: string;
  className?: string;
}

export const DeityFriend: React.FC<DeityFriendProps> = ({ 
  userId, 
  className 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const { sendMessage, messages, loading } = useAI();

  useEffect(() => {
    // 初始化神仙朋友
    const initDeity = async () => {
      const greeting = await sendMessage('请根据用户信息给出今日问候');
      setCurrentMessage(greeting);
    };

    initDeity();
  }, [userId]);

  return (
    <motion.div
      className={cn(
        "zen-deity-friend",
        "zen-card zen-card-deity",
        "relative overflow-hidden",
        "p-6",
        className
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* 神仙头像 */}
      <div className="zen-avatar zen-avatar-deity mb-4 mx-auto w-24 h-24">
        <motion.img
          src="/images/deity-avatar.png"
          alt="神仙朋友"
          className="zen-avatar-image"
          animate={{ 
            scale: isActive ? [1, 1.1, 1] : 1,
            rotate: isActive ? [0, 5, -5, 0] : 0
          }}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
        />
      </div>

      {/* 对话气泡 */}
      <AnimatePresence>
        {currentMessage && (
          <motion.div
            className="zen-blessing-bubble"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-zen-wisdom text-center">
              {currentMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 交互按钮 */}
      <div className="flex justify-center mt-4 space-x-2">
        <motion.button
          className="zen-button zen-button-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsActive(!isActive)}
          disabled={loading}
        >
          {loading ? '思考中...' : '与神仙对话'}
        </motion.button>
      </div>

      {/* 神圣光效 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="zen-particles">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="zen-particle zen-particle-gold"
              style={{
                position: 'absolute',
                left: \`\${Math.random() * 100}%\`,
                top: \`\${Math.random() * 100}%\`,
              }}
              animate={{
                y: [-20, -40, -20],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DeityFriend;`,

  // 运势分析组件
  'FortuneAnalysis': (name) => `import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFortuneStore } from '@/stores/fortuneStore';
import { cn } from '@/utils/cn';

interface FortuneAnalysisProps {
  baziData: any;
  className?: string;
}

export const FortuneAnalysis: React.FC<FortuneAnalysisProps> = ({
  baziData,
  className
}) => {
  const { fortune, loading, fetchFortune } = useFortuneStore();
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  useEffect(() => {
    if (baziData) {
      fetchFortune(baziData);
    }
  }, [baziData]);

  const elements = [
    { name: '木', value: fortune?.wood || 0, color: 'wood' },
    { name: '火', value: fortune?.fire || 0, color: 'fire' },
    { name: '土', value: fortune?.earth || 0, color: 'earth' },
    { name: '金', value: fortune?.metal || 0, color: 'metal' },
    { name: '水', value: fortune?.water || 0, color: 'water' },
  ];

  if (loading) {
    return (
      <div className="zen-card p-6 text-center">
        <div className="zen-splash-loader mx-auto mb-4"></div>
        <p className="text-body-medium">正在分析您的运势...</p>
      </div>
    );
  }

  return (
    <div className={cn("zen-fortune-analysis", className)}>
      {/* 五行雷达图 */}
      <div className="zen-card p-6 mb-6">
        <h3 className="text-title-large text-center mb-6">五行能量分析</h3>
        
        <div className="zen-wuxing-radar relative w-64 h-64 mx-auto mb-6">
          <div className="zen-wuxing-rotate absolute inset-0 rounded-full opacity-20">
            <div className="gradient-energy-flow w-full h-full rounded-full"></div>
          </div>
          
          {elements.map((element, index) => {
            const angle = (index * 72) - 90; // 从顶部开始，每个元素间隔72度
            const radian = (angle * Math.PI) / 180;
            const radius = 100;
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;
            
            return (
              <motion.div
                key={element.name}
                className={cn(
                  "absolute w-8 h-8 rounded-full cursor-pointer",
                  "flex items-center justify-center",
                  "text-sm font-semibold",
                  \`text-fortune-\${element.color}\`
                )}
                style={{
                  left: \`calc(50% + \${x}px - 16px)\`,
                  top: \`calc(50% + \${y}px - 16px)\`,
                  backgroundColor: \`var(--\${element.color}-spring)\`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.2 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedElement(element.name)}
              >
                {element.name}
              </motion.div>
            );
          })}
        </div>

        {/* 选中元素详情 */}
        {selectedElement && (
          <motion.div
            className="zen-card zen-card-fortune p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h4 className="text-title-medium mb-2">{selectedElement}行详解</h4>
            <p className="text-body-small">
              {fortune?.details?.[selectedElement] || '正在获取详细解析...'}
            </p>
          </motion.div>
        )}
      </div>

      {/* 今日运势 */}
      <div className="zen-card p-6">
        <h3 className="text-title-large text-center mb-4">今日运势</h3>
        <div className="space-y-4">
          <div className="zen-progress">
            <div 
              className="zen-progress-bar"
              style={{ width: \`\${fortune?.todayScore || 0}%\` }}
            ></div>
          </div>
          <p className="text-body-medium text-center">
            {fortune?.todayAdvice || '愿您今日吉祥如意，心想事成。'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FortuneAnalysis;`,

  // 求卦组件
  'DivinationCast': (name) => `import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceMotion } from '@/hooks/useDeviceMotion';
import { cn } from '@/utils/cn';

interface DivinationCastProps {
  onResult: (hexagram: any) => void;
  className?: string;
}

export const DivinationCast: React.FC<DivinationCastProps> = ({
  onResult,
  className
}) => {
  const [isShaking, setIsShaking] = useState(false);
  const [coins, setCoins] = useState([
    { id: 1, value: 'yin', spinning: false },
    { id: 2, value: 'yang', spinning: false },
    { id: 3, value: 'yin', spinning: false },
  ]);
  const [castCount, setCastCount] = useState(0);
  const [results, setResults] = useState<string[]>([]);
  const shakeThreshold = 15;
  const { acceleration } = useDeviceMotion();

  // 检测摇动
  React.useEffect(() => {
    if (!acceleration) return;

    const { x, y, z } = acceleration;
    const totalAcceleration = Math.sqrt(x * x + y * y + z * z);

    if (totalAcceleration > shakeThreshold && !isShaking) {
      handleShake();
    }
  }, [acceleration, isShaking]);

  const handleShake = () => {
    if (isShaking || castCount >= 6) return;

    setIsShaking(true);
    
    // 铜钱旋转动画
    const newCoins = coins.map(coin => ({
      ...coin,
      spinning: true
    }));
    setCoins(newCoins);

    // 2秒后显示结果
    setTimeout(() => {
      const newResult = Math.random() > 0.5 ? 'yang' : 'yin';
      const newResults = [...results, newResult];
      setResults(newResults);
      setCastCount(prev => prev + 1);

      // 停止旋转，显示结果
      const finalCoins = coins.map(coin => ({
        ...coin,
        spinning: false,
        value: newResult
      }));
      setCoins(finalCoins);
      setIsShaking(false);

      // 如果完成6次投掷，生成卦象
      if (newResults.length === 6) {
        generateHexagram(newResults);
      }
    }, 2000);
  };

  const generateHexagram = (results: string[]) => {
    // 生成卦象逻辑
    const hexagram = {
      lines: results,
      name: '测试卦',
      description: '这是一个测试卦象',
      advice: '请根据实际情况调整决策',
    };
    onResult(hexagram);
  };

  const resetCast = () => {
    setCoins([
      { id: 1, value: 'yin', spinning: false },
      { id: 2, value: 'yang', spinning: false },
      { id: 3, value: 'yin', spinning: false },
    ]);
    setCastCount(0);
    setResults([]);
  };

  return (
    <div className={cn("zen-divination-cast", className)}>
      <div className="zen-card p-8 text-center">
        <h3 className="text-title-large mb-6">古法求卦</h3>
        
        {/* 投掷说明 */}
        <div className="mb-8">
          <p className="text-body-medium mb-2">
            摇动手机或点击按钮投掷铜钱
          </p>
          <p className="text-caption text-zen-shadow">
            第 {castCount + 1} / 6 次投掷
          </p>
        </div>

        {/* 铜钱显示 */}
        <div className="flex justify-center space-x-4 mb-8">
          {coins.map((coin) => (
            <motion.div
              key={coin.id}
              className={cn(
                "zen-coin",
                "w-16 h-16 rounded-full",
                "flex items-center justify-center",
                "text-xl font-bold",
                "border-2 border-divine-gold",
                coin.spinning ? "zen-divination-spin" : ""
              )}
              style={{
                background: coin.value === 'yang' 
                  ? 'linear-gradient(45deg, var(--divine-gold), var(--earth-center))' 
                  : 'linear-gradient(45deg, var(--earth-stone), var(--zen-shadow))',
                color: coin.value === 'yang' ? 'var(--cosmos-void)' : 'var(--zen-mist)'
              }}
              animate={coin.spinning ? {
                rotateY: [0, 180, 360],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{
                duration: 0.5,
                repeat: coin.spinning ? Infinity : 0
              }}
            >
              {coin.spinning ? '?' : (coin.value === 'yang' ? '阳' : '阴')}
            </motion.div>
          ))}
        </div>

        {/* 卦象构建显示 */}
        {results.length > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h4 className="text-title-medium mb-4">卦象构建</h4>
            <div className="flex flex-col items-center space-y-2">
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  className={cn(
                    "w-16 h-2 rounded",
                    result === 'yang' ? "bg-divine-gold" : "bg-zen-shadow"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: 64 }}
                  transition={{ delay: index * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* 操作按钮 */}
        <div className="space-y-4">
          {castCount < 6 ? (
            <motion.button
              className="zen-button zen-button-primary"
              onClick={handleShake}
              disabled={isShaking}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isShaking ? '投掷中...' : '点击投掷'}
            </motion.button>
          ) : (
            <motion.button
              className="zen-button zen-button-secondary"
              onClick={resetCast}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              重新求卦
            </motion.button>
          )}
        </div>

        {/* 摇动提示 */}
        <AnimatePresence>
          {isShaking && (
            <motion.div
              className="zen-pwa-gesture-hint show"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              铜钱正在旋转...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DivinationCast;`
};

// 工具函数
function toPascalCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

// 主要生成函数
async function generateComponent() {
  console.log('🌟 交个神仙朋友 PWA - React组件生成器');
  console.log('=====================================\n');

  // 获取组件类型
  const componentType = await new Promise((resolve) => {
    rl.question(`请选择组件类型：
1. component - 基础组件
2. page - 页面组件  
3. hook - 自定义Hook
4. service - API服务
5. store - 状态管理
6. types - 类型定义
7. special - 特殊组件 (神仙朋友/运势分析/求卦等)

请输入选项 (1-7): `, resolve);
  });

  const types = {
    '1': 'component',
    '2': 'page', 
    '3': 'hook',
    '4': 'service',
    '5': 'store',
    '6': 'types',
    '7': 'special'
  };

  const selectedType = types[componentType];
  if (!selectedType) {
    console.log('❌ 无效的选项，请重新运行程序');
    rl.close();
    return;
  }

  // 获取组件名称
  const componentName = await new Promise((resolve) => {
    rl.question('请输入组件名称 (PascalCase): ', resolve);
  });

  if (!componentName) {
    console.log('❌ 组件名称不能为空');
    rl.close();
    return;
  }

  const name = toPascalCase(componentName);

  // 获取组件描述
  const description = await new Promise((resolve) => {
    rl.question('请输入组件描述: ', resolve);
  });

  // 特殊组件处理
  if (selectedType === 'special') {
    const specialType = await new Promise((resolve) => {
      rl.question(`请选择特殊组件类型：
1. DeityFriend - 神仙朋友组件
2. FortuneAnalysis - 运势分析组件  
3. DivinationCast - 求卦组件
4. BlessingSender - 祝福发送组件
5. NFCReader - NFC读取组件

请输入选项 (1-5): `, resolve);
    });

    const specialTypes = {
      '1': 'DeityFriend',
      '2': 'FortuneAnalysis',
      '3': 'DivinationCast',
      '4': 'BlessingSender',
      '5': 'NFCReader'
    };

    const specialName = specialTypes[specialType];
    if (specialName && specialTemplates[specialName]) {
      const content = specialTemplates[specialName](name);
      const filePath = `frontend/src/components/features/${specialName.toLowerCase()}/${specialName}.tsx`;
      createFile(filePath, content);
      
      // 创建索引文件
      const indexContent = `export { ${specialName} } from './${specialName}';\nexport default ${specialName};`;
      createFile(`frontend/src/components/features/${specialName.toLowerCase()}/index.ts`, indexContent);
      
      console.log(`✅ 特殊组件 ${specialName} 创建成功！`);
      console.log(`📁 文件位置: ${filePath}`);
      rl.close();
      return;
    }
  }

  // 生成内容
  let content = '';
  let filePath = '';
  let indexContent = '';

  switch (selectedType) {
    case 'component':
      content = templates.component(name, description);
      filePath = `frontend/src/components/ui/${name}/${name}.tsx`;
      indexContent = `export { ${name} } from './${name}';\nexport default ${name};`;
      break;
      
    case 'page':
      content = templates.page(name, description);
      filePath = `frontend/src/pages/${name.toLowerCase()}/${name}Page.tsx`;
      indexContent = `export { ${name}Page } from './${name}Page';\nexport default ${name}Page;`;
      break;
      
    case 'hook':
      content = templates.hook(name, description);
      filePath = `frontend/src/hooks/use${name}.ts`;
      break;
      
    case 'service':
      content = templates.service(name, description);
      filePath = `frontend/src/services/${name.toLowerCase()}Service.ts`;
      break;
      
    case 'store':
      content = templates.store(name, description);
      filePath = `frontend/src/stores/${name.toLowerCase()}Store.ts`;
      break;
      
    case 'types':
      content = templates.types(name, description);
      filePath = `frontend/src/types/${name.toLowerCase()}.ts`;
      break;
  }

  // 创建文件
  createFile(filePath, content);
  
  // 创建索引文件（如果需要）
  if (indexContent) {
    const indexPath = path.join(path.dirname(filePath), 'index.ts');
    createFile(indexPath, indexContent);
  }

  // 生成测试文件
  const shouldCreateTest = await new Promise((resolve) => {
    rl.question('是否生成测试文件？(y/n): ', (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });

  if (shouldCreateTest) {
    const testContent = templates.test(name, description);
    const testPath = filePath.replace(/\.(tsx?|ts)$/, '.test.tsx');
    createFile(testPath, testContent);
    console.log(`✅ 测试文件创建成功: ${testPath}`);
  }

  console.log(`\n✅ ${selectedType} ${name} 创建成功！`);
  console.log(`📁 文件位置: ${filePath}`);
  
  if (indexContent) {
    console.log(`📁 索引文件: ${path.join(path.dirname(filePath), 'index.ts')}`);
  }

  console.log('\n🌟 愿你的组件如禅意般优雅！');
  rl.close();
}

// 运行生成器
generateComponent().catch(console.error); 