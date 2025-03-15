/** @type {import('next').NextConfig} */
const nextConfig = {
  // 开启React严格模式
  reactStrictMode: true,
  // App Router在Next.js 14中已是默认功能，无需experimental选项
  // 图像域名白名单配置（如果需要使用外部图像）
  images: {
    domains: [],
  },
  // 确保服务器组件能够正确处理node_modules中的模块
  transpilePackages: ['three']
};

module.exports = nextConfig; 