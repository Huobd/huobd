'use client';

import { useRef, useEffect, useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import FloatingNav from '@/components/ui/FloatingNav';
import type { Post } from '@/types';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Html } from '@react-three/drei';

// 延迟加载3D场景容器
const LazySceneContainer = lazy(() => import('@/components/3d/SceneContainer'));

// 3D创意标签组件
function CreativeTags({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const groupRef = useRef<THREE.Group>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // 从所有文章中提取不重复的标签
  const extractTags = (): string[] => {
    const allTags = posts
      .filter(post => post.tags && post.tags.length > 0)
      .flatMap(post => post.tags as string[]);
    
    // 去重（修复类型错误）
    return Array.from(new Set(allTags));
  };
  
  const tags = extractTags();
  
  // 标签颜色映射
  const getTagColor = (tag: string): string => {
    const colors = [
      '#f472b6', // 粉红
      '#a78bfa', // 紫色
      '#38bdf8', // 蓝色
      '#22d3ee', // 青色
      '#4ade80', // 绿色
      '#facc15', // 黄色
      '#fb923c', // 橙色
      '#f87171'  // 红色
    ];
    
    // 使用标签的hash值来确定颜色，保证同一标签总是相同颜色
    const hashCode = tag.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hashCode) % colors.length];
  };
  
  // 缓慢旋转效果
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
    }
  });
  
  // 处理标签点击 - 使用更安全的导航方式
  const handleTagClick = (tag: string) => {
    // 防止重复点击和导航
    if (isNavigating) return;
    
    console.log(`点击标签: ${tag}`);
    setIsNavigating(true);
    
    // 使用window.location直接导航，避免React Router冲突
    window.location.href = `/posts?tag=${encodeURIComponent(tag)}`;
  };
  
  // 打印调试信息
  useEffect(() => {
    console.log(`提取到${tags.length}个标签:`, tags);
  }, [tags]);
  
  return (
    <>
      {/* 基础光照 */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c77dff" />
      <fog attach="fog" args={['#000000', 8, 30]} />
      
      {/* 标签云容器 */}
      <group ref={groupRef} position={[0, 0, 0]} userData={{ type: 'TagCloud' }}>
        {tags.map((tag, index) => {
          // 以球形分布标签，但更接近屏幕中央
          const phi = Math.acos(-1 + (2 * index) / Math.max(tags.length, 1));
          const theta = Math.sqrt(Math.max(tags.length, 1) * Math.PI) * phi;
          
          // 计算球面坐标，减小半径使标签更集中
          const radius = 4;
          const x = radius * Math.cos(theta) * Math.sin(phi);
          const y = radius * Math.sin(theta) * Math.sin(phi);
          const z = radius * Math.cos(phi);
          
          // 计算旋转，使标签面向球心
          const position = new THREE.Vector3(x, y, z);
          const lookAt = new THREE.Vector3(0, 0, 0);
          const matrix = new THREE.Matrix4().lookAt(position, lookAt, new THREE.Vector3(0, 1, 0));
          const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix);
          
          return (
            <group
              key={`tag-${index}`}
              position={[x, y, z]}
              quaternion={quaternion}
              userData={{ type: 'Tag', tagName: tag }}
              onClick={(e) => {
                e.stopPropagation();
                // 避免事件冒泡
                if (e.stopped) return;
                e.stopped = true; 
                
                handleTagClick(tag);
              }}
            >
              {/* 标签背景 */}
              <mesh userData={{ type: 'TagBackground' }}>
                <planeGeometry args={[2 + tag.length * 0.15, 1]} />
                <meshStandardMaterial 
                  color={getTagColor(tag)}
                  metalness={0.2}
                  roughness={0.7}
                  emissive={getTagColor(tag)}
                  emissiveIntensity={0.2}
                  side={THREE.DoubleSide}
                  transparent
                  opacity={0.9}
                />
              </mesh>
              
              {/* 标签文字 - 移除自定义字体 */}
              <Text
                position={[0, 0, 0.05]}
                fontSize={0.4}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                userData={{ type: 'TagText' }}
              >
                {tag}
              </Text>
              
              {/* 简化交互方式，避免使用Html组件 */}
              <mesh
                position={[0, 0, 0.1]} 
                userData={{ type: 'TagHitArea' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTagClick(tag);
                }}
              >
                <planeGeometry args={[2.5 + tag.length * 0.2, 1.5]} />
                <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
              </mesh>
            </group>
          );
        })}
      </group>
      
      {/* 如果没有标签，显示提示 */}
      {tags.length === 0 && (
        <Text
          position={[0, 0, 0]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          暂无标签
        </Text>
      )}
    </>
  );
}

interface ClientPageProps {
  posts: Post[];
}

export default function ClientPage({ posts }: ClientPageProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [showEffect, setShowEffect] = useState(false);

  // 打印调试信息
  useEffect(() => {
    console.log('ClientPage mounted, posts length:', posts.length);
    // 延迟显示效果，确保页面完全加载
    const timer = setTimeout(() => setShowEffect(true), 1000);
    return () => clearTimeout(timer);
  }, [posts.length]);
  
  // 准备示例标签数据（如果没有文章）
  const displayPosts = posts && posts.length > 0 ? posts : [
    {
      slug: 'example-1',
      title: '创意设计思维',
      date: new Date().toISOString(),
      excerpt: '探索设计思维如何改变我们的创作方式',
      tags: ['设计', '创意', 'UI/UX', '思维方式', '产品设计']
    },
    {
      slug: 'example-2',
      title: '3D交互体验',
      date: new Date().toISOString(),
      excerpt: '下一代Web体验的潜力与挑战',
      tags: ['3D', '交互', 'WebGL', '用户体验', 'Three.js']
    },
    {
      slug: 'example-3',
      title: '沉浸式叙事',
      date: new Date().toISOString(),
      excerpt: '通过技术构建更有力的故事体验',
      tags: ['体验', '叙事', '内容创作', '故事', '沉浸感']
    }
  ] as Post[];

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* 3D场景容器，固定在背景 */}
      <div ref={sceneRef} className="canvas-container absolute inset-0" style={{ zIndex: 0 }}>
        <Suspense fallback={<div className="w-full h-full bg-gradient-to-b from-gray-900 to-blue-900" />}>
          <LazySceneContainer>
            <CreativeTags posts={displayPosts} />
          </LazySceneContainer>
        </Suspense>
      </div>

      {/* 悬浮导航按钮 */}
      <FloatingNav defaultExpanded={true} />
      
      {/* 内容区域 */}
      <div className="relative z-10 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-4xl mx-auto mt-16 md:mt-24"
        >
          <h1 className="text-4xl md:text-7xl font-bold text-center mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              茂宇的人生博客
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-center mb-12 text-gray-300">
            你无需经常提醒自己为什么不应该等待， 别等待就对了
          </p>
          
          <div className="flex justify-center mt-16">
            <motion.a 
              href="/posts"
              className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full border border-white/20 text-white font-medium transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              浏览所有文章
            </motion.a>
          </div>
          
          {/* 提示信息 */}
          {showEffect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="text-center mt-10 text-white/70 text-sm backdrop-blur-sm py-2 px-4 rounded-full bg-white/5 mx-auto inline-block"
            >
              ✨ 点击漂浮的标签，浏览相关主题文章 ✨
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
} 