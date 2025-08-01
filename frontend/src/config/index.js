// 配置入口文件
import devConfig from './development.js';
import prodConfig from './production.js';

// 根据环境选择配置
const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

// 环境变量覆盖
if (process.env.VITE_API_BASE_URL) {
  config.API_BASE_URL = process.env.VITE_API_BASE_URL;
}

if (process.env.VITE_APP_DOMAIN) {
  config.APP_DOMAIN = process.env.VITE_APP_DOMAIN;
}

export default config; 