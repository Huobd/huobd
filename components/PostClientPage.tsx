'use client';

import { Suspense, lazy, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import FloatingNav from '@/components/ui/FloatingNav';
import type { Post } from '@/types';
import Image from 'next/image';

// 延迟加载3D背景
const LazySceneContainer = lazy(() => import('@/components/3d/SceneContainer'));

// 简单的动态背景
function ArticleBackground() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <fog attach="fog" args={['#000000', 8, 30]} />
      
      {/* 粒子背景 */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2000}
            array={new Float32Array(6000).map(() => (Math.random() - 0.5) * 20)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#ffffff" sizeAttenuation transparent opacity={0.4} />
      </points>
    </>
  );
}

interface PostClientPageProps {
  post: Post;
  isLoading?: boolean;
  error?: string;
}

export default function PostClientPage({ post, isLoading = false, error }: PostClientPageProps) {
  const router = useRouter();
  const [contentLoaded, setContentLoaded] = useState(false);
  
  // 添加状态检测设备性能
  const [is3DEnabled, setIs3DEnabled] = useState(true);
  
  // 检测设备性能，在低端设备上禁用3D效果
  useEffect(() => {
    // 简单的性能检测
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isLowEndDevice = isMobile && window.navigator.hardwareConcurrency <= 4;
    
    setIs3DEnabled(!isLowEndDevice);
  }, []);
  
  // 确保内容加载完成
  useEffect(() => {
    if (post && post.content) {
      console.log('文章内容加载完成，长度:', post.content.length);
      setContentLoaded(true);
    }
  }, [post]);
  
  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-gray-300">加载文章中...</p>
        </div>
      </div>
    );
  }
  
  // 显示错误状态
  if (error) {
    return (
      <div className="min-h-screen relative bg-gray-900">
        {/* 3D背景 */}
        <div className="fixed inset-0 -z-10">
          <SceneContainer>
            <ArticleBackground />
          </SceneContainer>
        </div>
        
        {/* 悬浮导航 */}
        <FloatingNav />
        
        <div className="min-h-screen flex items-center justify-center text-white p-4">
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">加载文章失败</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <button 
              onClick={() => window.location.href = '/posts'}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              返回文章列表
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 显示文章不存在状态
  if (!post || !post.title) {
    return (
      <div className="min-h-screen relative bg-gray-900">
        {/* 3D背景 */}
        <div className="fixed inset-0 -z-10">
          <SceneContainer>
            <ArticleBackground />
          </SceneContainer>
        </div>
        
        {/* 悬浮导航 */}
        <FloatingNav />
        
        <div className="min-h-screen flex items-center justify-center text-white p-4">
          <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6 max-w-md text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">文章不存在</h2>
            <p className="text-gray-300 mb-4">找不到请求的文章，可能已被删除或移动</p>
            <button 
              onClick={() => window.location.href = '/posts'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              浏览所有文章
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 显示文章内容
  return (
    <div className="min-h-screen relative bg-gray-900">
      {/* 3D背景 - 添加Suspense和懒加载 */}
      <div className="fixed inset-0 -z-10">
        {is3DEnabled ? (
          <Suspense fallback={<div className="w-full h-full bg-gray-900" />}>
            <LazySceneContainer>
              <ArticleBackground />
            </LazySceneContainer>
          </Suspense>
        ) : (
          // 降级为简单渐变背景
          <div className="w-full h-full bg-gradient-to-b from-gray-900 to-blue-900" />
        )}
      </div>
      
      {/* 悬浮导航 */}
      <FloatingNav />
      
      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* 返回按钮 */}
          <a 
            href="/posts" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/posts';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            返回文章列表
          </a>
          
          {/* 文章卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/40 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-700 shadow-xl"
          >
            {/* 文章头部 */}
            <div className="p-8 relative border-b border-gray-700">
              <div className="flex items-center text-gray-400 text-sm mb-4">
                {post.date && (
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">{post.title}</h1>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <a 
                      key={tag} 
                      href={`/posts?tag=${encodeURIComponent(tag)}`}
                      className="bg-blue-900/30 hover:bg-blue-800/40 text-blue-300 px-3 py-1 rounded-full text-sm transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/posts?tag=${encodeURIComponent(tag)}`;
                      }}
                    >
                      {tag}
                    </a>
                  ))}
                </div>
              )}
            </div>
            
            {/* 文章内容 */}
            <div className="p-8">
              {contentLoaded ? (
                <div 
                  className="prose prose-invert prose-blue max-w-none prose-img:rounded-xl prose-headings:font-bold prose-pre:bg-gray-800/50 prose-pre:border prose-pre:border-gray-700"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* 返回顶部按钮 */}
          <div className="text-center mt-12">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white px-4 py-2 rounded-full inline-flex items-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              返回顶部
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 