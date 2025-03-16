'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Post } from '@/types';
import FloatingNav from './ui/FloatingNav';
import { Html } from '@react-three/drei';

// 延迟加载3D场景容器
const LazySceneContainer = lazy(() => import('./3d/SceneContainer'));

// 3D场景组件 - 根据标签显示不同的3D元素
function TagScene({ tag }: { tag: string }) {
  return (
    <>
      {/* 基础光照 */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* 根据标签显示不同颜色的3D元素 */}
      <mesh position={[0, 0, -10]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          color={getTagColor(tag)} 
          opacity={0.1} 
          transparent
        />
      </mesh>
      
      {/* 中心标签文字 */}
      <group position={[0, 0, -5]}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial 
            color={getTagColor(tag)} 
            roughness={0.3}
            metalness={0.8}
            opacity={0.7}
            transparent
          />
        </mesh>
        <Html position={[0, 0, 1.6]} center>
          <div className="tag-title bg-black/30 backdrop-blur-md px-5 py-3 rounded-xl text-white text-xl font-bold border border-gray-500/30">
            {`#${tag}`}
          </div>
        </Html>
      </group>
      
      {/* 粒子效果 */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1000}
            array={new Float32Array(3000).map(() => (Math.random() - 0.5) * 20)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.05} 
          color={getTagColor(tag)}
          sizeAttenuation 
          transparent 
          opacity={0.6} 
        />
      </points>
    </>
  );
}

// 获取标签颜色
function getTagColor(tag: string): string {
  const tagColors: Record<string, string> = {
    '设计': '#f72585',
    '创意': '#7209b7',
    'UI/UX': '#3a0ca3',
    '思维方式': '#4361ee',
    '产品设计': '#4cc9f0',
    '3D': '#52b788',
    '交互': '#fb8500',
    'WebGL': '#023e8a',
    '用户体验': '#e63946',
    'Three.js': '#ff5e7d',
  };
  
  // 返回匹配的颜色或默认颜色
  return tagColors[tag] || '#4cc9f0';
}

interface TagClientPageProps {
  tag: string;
  posts: Post[];
}

export default function TagClientPage({ tag, posts }: TagClientPageProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* 3D场景背景 */}
      <div className="fixed inset-0 -z-10">
        <Suspense fallback={<div className="w-full h-full bg-gradient-to-b from-gray-900 to-blue-900" />}>
          <LazySceneContainer>
            <TagScene tag={tag} />
          </LazySceneContainer>
        </Suspense>
      </div>
      
      {/* 导航 */}
      <FloatingNav />
      
      {/* 主内容 */}
      <main className="container mx-auto px-4 py-12 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* 标题 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <Link 
              href="/posts" 
              className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              返回所有文章
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500">
              标签: {tag}
            </h1>
            <p className="text-gray-400 mt-4 text-lg">
              找到 {posts.length} 篇相关文章
            </p>
          </motion.div>
          
          {/* 文章列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.div 
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/posts/${post.slug}`}>
                  <div className="bg-gray-800/40 hover:bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 h-full">
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-3 text-white">{post.title}</h2>
                      <p className="text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          {new Date(post.date).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full text-xs">
                          阅读全文
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 