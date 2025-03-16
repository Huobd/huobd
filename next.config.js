/** @type {import('next').NextConfig} */
const nextConfig = {
  // 开启React严格模式
  reactStrictMode: true,
  
  // 图像域名白名单配置
  images: {
    domains: ['via.placeholder.com'], // 允许示例图片
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // 处理3D库的转译
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', 'framer-motion-3d'],
  
  // 优化构建输出
  output: 'standalone',
  
  // 确保能兼容旧版浏览器
  swcMinify: true,
  
  // 生产环境禁用sourcemaps减小构建体积
  productionBrowserSourceMaps: false,
  
  // 实验性功能
  experimental: {
    // 优化字体加载
    optimizeFonts: true,
    // 使用SWC提高构建性能
    swcPlugins: []
  }
};

module.exports = nextConfig; 