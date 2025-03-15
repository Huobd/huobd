'use server';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import type { Post } from '@/types';

// 文章和图片目录路径
const postsDirectory = path.join(process.cwd(), 'public', 'posts');
const imagesDirectory = path.join(process.cwd(), 'public/images');

// 确保目录存在
if (!fs.existsSync(imagesDirectory)) {
  fs.mkdirSync(imagesDirectory, { recursive: true });
}

if (!fs.existsSync(postsDirectory)) {
  fs.mkdirSync(postsDirectory, { recursive: true });
}

/**
 * 获取所有文章的元数据和内容
 * @returns 所有文章的数组
 */
export async function getPosts(): Promise<Post[]> {
  try {
    // 检查目录是否存在
    if (!fs.existsSync(postsDirectory)) {
      console.log(`posts目录不存在，路径: ${postsDirectory}`);
      return [];
    }
    
    // 读取目录中的所有文件
    const fileNames = fs.readdirSync(postsDirectory);
    console.log(`找到 ${fileNames.length} 个文件`);
    
    if (fileNames.length === 0) {
      // 如果没有文件，返回空数组
      return [];
    }
    
    const allPostsData = fileNames
      .filter(fileName => {
        // 只处理.md文件
        return fileName.endsWith('.md');
      })
      .map(fileName => {
        // 移除文件扩展名，用作slug
        const slug = fileName.replace(/\.md$/, '');
        
        // 读取Markdown文件
        const fullPath = path.join(postsDirectory, fileName);
        
        try {
          const fileContents = fs.readFileSync(fullPath, 'utf8');
          
          // 使用gray-matter解析Markdown中的元数据
          const matterResult = matter(fileContents);
          
          // 确保标签是数组
          const tags = Array.isArray(matterResult.data.tags) 
            ? matterResult.data.tags 
            : matterResult.data.tags 
              ? [matterResult.data.tags] 
              : [];
          
          // 返回包含元数据的对象
          return {
            slug,
            title: matterResult.data.title || slug,
            date: matterResult.data.date ? new Date(matterResult.data.date).toISOString() : new Date().toISOString(),
            excerpt: matterResult.data.excerpt || '',
            tags: tags,
            content: matterResult.content
          };
        } catch (error) {
          console.error(`处理文件时出错: ${fullPath}`, error);
          return null;
        }
      })
      .filter(Boolean) // 过滤掉处理失败的文件
      .sort((a, b) => {
        // 根据日期排序，最新的文章排在前面
        if (a && b) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return 0;
      });
    
    return allPostsData as Post[];
  } catch (error) {
    console.error('获取文章列表时出错:', error);
    return [];
  }
}

/**
 * 处理Markdown内容为HTML
 * @param markdown Markdown格式的文本
 * @returns 转换后的HTML字符串
 */
async function processMarkdown(markdown: string): Promise<string> {
  try {
    // 图片路径修正
    let processedMarkdown = markdown.replace(/!\[(.*?)\]\(\.\/images\/(.*?)\)/g, '![$1](/images/$2)');
    
    // 使用remark处理Markdown为HTML
    const result = await remark()
      .use(html, { sanitize: false }) // 不进行HTML净化，保留原始标签
      .process(processedMarkdown);
    
    return result.toString();
  } catch (error) {
    console.error('处理Markdown时出错:', error);
    return '<p>内容加载失败</p>';
  }
}

/**
 * 获取单篇文章的数据
 * @param slug 文章的唯一标识
 * @returns 文章对象或null
 */
export async function getPost(slug: string): Promise<Post | null> {
  console.log(`调用getPost，获取文章: ${slug}`);
  
  try {
    // 检查文章文件是否存在
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
      console.log(`文章 ${slug}.md 不存在`);
      
      // 如果是示例文章，返回硬编码内容
      if (slug.startsWith('example-')) {
        return await getExamplePost(slug);
      }
      
      return null;
    }
    
    // 读取文章内容
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    console.log(`读取文章文件成功，文件大小: ${fileContents.length} 字节`);
    
    // 解析文章元数据和内容
    const { data, content } = matter(fileContents);
    console.log(`解析文章内容成功，元数据:`, data);
    
    // 处理Markdown内容为HTML
    const processedContent = await processMarkdown(content);
    console.log(`Markdown处理后内容长度: ${processedContent.length}`);
    
    // 返回文章对象
    return {
      slug,
      title: data.title || '无标题',
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      excerpt: data.excerpt || content.substr(0, 150) + '...',
      tags: data.tags || [],
      content: processedContent, // 完整的HTML内容
    };
  } catch (error) {
    console.error(`获取文章 ${slug} 时出错:`, error);
    return null;
  }
}

/**
 * 获取示例文章
 * @param slug 示例文章的标识
 * @returns 示例文章对象
 */
async function getExamplePost(slug: string): Promise<Post | null> {
  // 定义示例文章
  const examplePosts: Record<string, Post> = {
    'example-1': {
      slug: 'example-1',
      title: '创意设计思维',
      date: new Date().toISOString(),
      excerpt: '探索设计思维如何改变我们的创作方式',
      tags: ['设计', '创意', 'UI/UX', '思维方式', '产品设计'],
      content: `
<h1>创意设计思维</h1>

<h2>探索设计思维的力量</h2>

<p>设计思维是一种以人为本的创新方法，它基于设计师的工作方式，将人们的需求、技术可能性和商业成功的要求结合起来。</p>

<h3>关键原则</h3>

<ol>
<li><strong>以人为本</strong>：深入理解用户需求和痛点</li>
<li><strong>迭代设计</strong>：快速原型和测试改进</li>
<li><strong>跨学科合作</strong>：融合不同领域的专业知识</li>
</ol>

<h3>实际应用</h3>

<p>在现代产品开发中，设计思维已成为解决复杂问题的重要框架。通过共情、定义、构思、原型和测试这五个步骤，团队可以创造出更具创新性和用户价值的解决方案。</p>

<pre><code class="language-javascript">// 设计思维过程示例代码
function designThinkingProcess(problem) {
  const insights = empathize(problem);
  const definition = define(insights);
  const ideas = ideate(definition);
  const prototype = createPrototype(ideas);
  return test(prototype);
}
</code></pre>

<p><img src="https://via.placeholder.com/800x400" alt="设计思维流程"></p>

<blockquote>
<p>"设计思维不仅仅是一种方法，它是一种思维方式，一种看待世界和解决问题的视角。"</p>
</blockquote>

<p>在未来，随着技术的进步和用户期望的不断提高，设计思维将继续演化，但其核心—以人为本的创新—将始终不变。</p>
      `
    },
    'example-2': {
      slug: 'example-2',
      title: '3D交互体验',
      date: new Date().toISOString(),
      excerpt: '下一代Web体验的潜力与挑战',
      tags: ['3D', '交互', 'WebGL', '用户体验', 'Three.js'],
      content: `
<h1>3D交互体验：下一代Web体验</h1>

<h2>网页设计的新维度</h2>

<p>随着WebGL和Three.js等技术的成熟，3D交互已经从高端游戏和专业应用领域走向主流网站设计。这种转变为用户体验带来了全新的可能性。</p>

<h3>技术基础</h3>

<ul>
<li><strong>WebGL</strong>：浏览器中的底层3D图形API</li>
<li><strong>Three.js</strong>：简化3D开发的JavaScript库</li>
<li><strong>React Three Fiber</strong>：React生态系统中的3D渲染解决方案</li>
</ul>

<h3>创造沉浸式体验</h3>

<p>3D技术允许设计师创造更具沉浸感和互动性的网站体验，从产品展示到数据可视化，再到虚拟展厅，都能带来显著的用户体验提升。</p>

<pre><code class="language-javascript">// 基本Three.js场景设置
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 添加3D对象
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
</code></pre>

<p><img src="https://via.placeholder.com/800x400" alt="3D交互示例"></p>

<h3>挑战与解决方案</h3>

<p>尽管3D交互带来了丰富的可能性，但也面临性能优化、跨设备兼容性和无障碍访问等挑战。设计师和开发者需要考虑:</p>

<ol>
<li>渐进增强，确保基本功能在所有设备上可用</li>
<li>资源优化和缓动加载策略</li>
<li>提供替代访问方式，确保包容性</li>
</ol>

<p>未来，随着设备性能提升和5G网络普及，3D交互将成为网页设计的标准元素，创造更加丰富和个性化的数字体验。</p>
      `
    },
    'example-3': {
      slug: 'example-3',
      title: '沉浸式叙事',
      date: new Date().toISOString(),
      excerpt: '通过技术构建更有力的故事体验',
      tags: ['体验', '叙事', '内容创作', '故事', '沉浸感'],
      content: `
<h1>沉浸式叙事：技术与故事的完美结合</h1>

<h2>重新定义数字故事讲述</h2>

<p>沉浸式叙事将传统的线性讲述方式转变为多层次、多感官的体验，让受众不再是被动的信息接收者，而是故事世界的主动探索者。</p>

<h3>关键技术要素</h3>

<ul>
<li><strong>交互式媒体</strong>：允许用户直接参与故事发展</li>
<li><strong>空间音频</strong>：创造身临其境的声音环境</li>
<li><strong>数据驱动叙事</strong>：根据用户行为定制内容</li>
</ul>

<h3>成功案例分析</h3>

<p>近年来，从新闻报道到品牌营销，从数字艺术到教育内容，沉浸式叙事已经展现出强大的传播力和感染力。</p>

<pre><code class="language-css">/* 沉浸式页面的基本样式 */
.immersive-container {
  height: 100vh;
  overflow-x: hidden;
  perspective: 1px;
}

.parallax-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.parallax-background {
  transform: translateZ(-1px) scale(2);
}

.content-layer {
  transform: translateZ(0);
  padding: 50vh 20% 20vh;
}
</code></pre>

<p><img src="https://via.placeholder.com/800x400" alt="沉浸式叙事示例"></p>

<h3>构建有效的沉浸式体验</h3>

<ol>
<li><strong>明确目标与核心信息</strong>：技术应服务于故事本身</li>
<li><strong>考虑接入点与流程</strong>：设计自然的用户旅程</li>
<li><strong>平衡控制与探索</strong>：给予用户足够自由但不失方向</li>
<li><strong>情感共鸣</strong>：利用多感官体验触发深层连接</li>
</ol>

<blockquote>
<p>"最好的沉浸式叙事不是炫耀技术，而是让技术变得透明，让故事本身闪耀。"</p>
</blockquote>

<p>随着元宇宙概念的发展，沉浸式叙事将继续演变，模糊物理和数字体验的界限，创造更加个人化和变革性的内容体验。</p>
      `
    }
  };
  
  if (examplePosts[slug]) {
    console.log(`返回示例文章: ${slug}`);
    return examplePosts[slug];
  }
  
  return null;
}

/**
 * 获取所有文章中的标签
 * @returns 所有标签的数组
 */
export async function getAllTags(): Promise<string[]> {
  try {
    const posts = await getPosts();
    
    if (!Array.isArray(posts) || posts.length === 0) {
      console.log('没有找到文章或文章数组为空');
      return [];
    }
    
    // 从所有文章中提取标签
    const allTags = posts
      .filter(post => post.tags && Array.isArray(post.tags) && post.tags.length > 0)
      .flatMap(post => post.tags);
    
    // 去重并排序
    const uniqueTags = Array.from(new Set(allTags));
    return uniqueTags.sort();
  } catch (error) {
    console.error('获取所有标签时出错:', error);
    return [];
  }
}

/**
 * 按标签获取文章
 * @param tag 标签名称
 * @returns 包含指定标签的文章数组
 */
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getPosts();
  
  // 按标签筛选文章
  return posts.filter(post => post.tags && post.tags.includes(tag));
}

/**
 * 创建示例文章
 * @returns 操作结果
 */
export async function createExamplePost(): Promise<{ success: boolean }> {
  try {
    const examplePost = `---
title: 欢迎来到我的3D博客空间
date: ${new Date().toISOString()}
excerpt: 这是一篇示例文章，展示了Markdown的各种格式和用法。
tags: [示例, Markdown, 3D博客]
---

# 欢迎来到我的3D博客空间

这是一个使用Next.js 14和React Three Fiber构建的创意3D博客系统。在这个空间中，你可以探索各种思想和创意，享受沉浸式的阅读体验。

![3D博客空间示例](example-space.jpg)

## Markdown的强大功能

这个博客系统支持所有标准的Markdown语法:

### 列表示例

无序列表:
- 项目1
- 项目2
- 项目3

有序列表:
1. 第一步
2. 第二步
3. 第三步

### 代码示例

这是一段行内代码 \`const greeting = "Hello, World!"\`

这是一个代码块:

\`\`\`javascript
function welcome() {
  console.log("欢迎来到3D博客空间!");
  return {
    message: "探索无限可能",
    author: "你的名字"
  };
}
\`\`\`

### 引用

> 想象力比知识更重要。知识是有限的，而想象力概括着世界的一切，推动着进步，并且是知识进化的源泉。
> — 阿尔伯特·爱因斯坦

## 3D交互体验

这个博客系统的独特之处在于它的3D交互体验。你可以在虚拟空间中导航，与内容元素交互，享受传统博客无法提供的沉浸感。

### 技术栈

- Next.js 14
- React Three Fiber
- Framer Motion
- TypeScript
- TailwindCSS

## 下一步是什么?

尝试添加更多的文章，探索3D空间，自定义你的博客外观和交互方式!

祝你使用愉快!`;

    fs.writeFileSync(path.join(postsDirectory, 'welcome.md'), examplePost);
    return { success: true };
  } catch (error) {
    console.error('创建示例文章时出错:', error);
    return { success: false };
  }
}
