# 茂宇的人生博客

一个基于Next.js 14打造的创意3D个人博客系统，使用本地Markdown文件作为内容源，无需后端服务器。

## 项目概述

这个博客系统打破了传统博客的平面界面设计，将内容呈现在一个沉浸式的3D空间中。读者可以在虚拟空间中探索文章，享受独特的阅读体验。

## 核心特性

### 3D交互体验
- 使用Three.js/React Three Fiber创建沉浸式3D空间
- 文章以3D对象形式展示在虚拟空间中
- 流畅的相机动画和过渡效果
- 可自定义的主题和环境

### 内容管理
- 直接从本地Markdown文件加载文章
- 支持Markdown的所有标准格式（标题、列表、代码块等）
- 前置元数据支持（标题、日期、标签等）
- 自动生成文章目录

### 技术架构
- 基于Next.js 14的App Router构建
- 使用Server Components优化性能
- 通过静态站点生成(SSG)实现无后端部署
- 响应式设计，适配各种设备

## 用户体验

1. **首页空间**: 进入博客后，用户将看到一个3D空间，其中包含多个代表不同文章或分类的交互元素。
2. **导航**: 用户可以自由移动或点击导航到特定文章区域。
3. **阅读体验**: 选择文章后，内容将以创新的3D方式呈现，同时保持良好的可读性。
4. **互动元素**: 特殊文章可能包含3D模型或交互式元素，增强内容表现力。

## 技术实现

本项目使用以下技术栈:
- Next.js 14 (App Router)
- TypeScript
- React Three Fiber/Three.js (3D渲染)
- gray-matter (Markdown元数据解析)
- remark/rehype (Markdown转HTML)
- TailwindCSS (样式)
- Framer Motion (过渡动画)

## 项目结构

```
/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 根布局组件
│   ├── page.tsx            # 首页
│   ├── posts/[slug]/       # 文章页面动态路由
│   └── tags/[tag]/         # 标签页面动态路由
├── components/             # React组件
│   ├── 3d/                 # 3D相关组件
│   └── ui/                 # UI组件
├── lib/                    # 工具函数
│   ├── markdown.ts         # Markdown处理
│   └── three-utils.ts      # Three.js工具函数
├── public/                 # 静态资源
│   ├── models/             # 3D模型
│   ├── images/             # 图片资源
│   └── posts/              # Markdown文章 (部署到Vercel时必须放在public下)
└── styles/                 # 样式文件
```

## 开发路线图

1. 项目初始化和基础架构搭建
2. Markdown解析和文章展示功能实现
3. 3D空间和基础交互实现
4. 视觉设计和主题开发
5. 性能优化和交互体验提升
6. 部署和文档完善 

## 项目安装

1. 克隆项目后，安装依赖：

```bash
npm install
```

2. 安装Markdown处理所需的依赖：

```bash
npm install remark remark-html
```

3. 启动开发服务器：

```bash
npm run dev
```

## 使用说明

访问 http://localhost:3000 浏览博客主页。

## Vercel部署说明

### 重要提示：文章目录位置

在部署到Vercel时，由于Vercel的无服务器环境限制，**Markdown文章必须放在`public/posts`目录下**，而不是根目录的`posts`目录下。这是因为Vercel的服务器函数无法直接访问项目根目录的文件系统。

### 部署步骤

1. 确保你的Markdown文章已移动到`public/posts`目录下
2. 在Vercel控制台创建新项目
3. 连接到你的GitHub仓库
4. 部署设置中无需特殊配置
5. 点击"Deploy"按钮

### 初始化内容

部署完成后，如果没有任何文章，可以通过访问`/api/create-example`来创建一篇示例文章。

### 常见问题排查

1. 如果部署后看不到文章，检查浏览器控制台是否有错误信息
2. 确认Markdown文件是否正确放置在`public/posts`目录下
3. 通过`/api/create-example`创建示例文章，测试系统功能
