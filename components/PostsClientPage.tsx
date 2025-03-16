'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Post } from '@/types';
import FloatingNav from './ui/FloatingNav';

// 延迟加载3D场景容器
const LazySceneContainer = lazy(() => import('./3d/SceneContainer'));

// 3D背景场景组件
function PostsScene() {
  return (
    <>
      {/* 添加环境光和背景 */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* 添加粒子效果 */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1000}
            array={new Float32Array(3000).map(() => (Math.random() - 0.5) * 15)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#ffffff" sizeAttenuation transparent opacity={0.6} />
      </points>
    </>
  );
}

interface PostsClientPageProps {
  posts: Post[];
  activeTag?: string;
}

export default function PostsClientPage({ posts = [], activeTag }: PostsClientPageProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true); // 添加加载状态
  
  // 确保posts是数组
  const postsArray = Array.isArray(posts) ? posts : [];
  
  // 获取所有标签
  const getAllTags = (): string[] => {
    if (!Array.isArray(postsArray) || postsArray.length === 0) {
      return [];
    }
    
    const allTags = postsArray
      .filter(post => post.tags && Array.isArray(post.tags) && post.tags.length > 0)
      .flatMap(post => post.tags as string[]);
    
    // 去重并排序 (修复TypeScript错误)
    const uniqueTags = Array.from(new Set(allTags));
    return uniqueTags.sort();
  };
  
  const allTags = getAllTags();
  
  // 调试日志
  useEffect(() => {
    console.log('PostsClientPage 组件接收到的posts数据:', postsArray);
    console.log('是否为数组:', Array.isArray(postsArray));
    console.log('数据长度:', postsArray.length);
    console.log('数据类型:', typeof postsArray);
    console.log('第一个元素:', postsArray[0]);
    
    // 初始化时立即过滤文章，避免闪烁
    filterPosts(postsArray, searchTerm, activeTag);
    
    // 数据加载完成
    setIsLoading(false);
  }, [postsArray]); // 仅在posts数据变化时执行
  
  // 单独提取过滤逻辑为函数，便于复用
  const filterPosts = (posts: Post[], term: string, tag?: string) => {
    if (!Array.isArray(posts)) {
      console.error('posts不是数组类型:', posts);
      setFilteredPosts([]);
      return;
    }
    
    const results = posts.filter(post => {
      if (!post || typeof post !== 'object') return false;
      
      const matchesSearch = !term || (
        (post.title && typeof post.title === 'string' && 
         post.title.toLowerCase().includes(term.toLowerCase())) ||
        (post.excerpt && typeof post.excerpt === 'string' && 
         post.excerpt.toLowerCase().includes(term.toLowerCase()))
      );
      
      const matchesTag = !tag || (
        post.tags && 
        Array.isArray(post.tags) && 
        post.tags.some(t => t.toLowerCase() === decodeURIComponent(tag).toLowerCase())
      );
      
      return matchesSearch && matchesTag;
    });
    
    setFilteredPosts(results);
  };
  
  // 当搜索词变化时更新过滤结果
  useEffect(() => {
    filterPosts(postsArray, searchTerm, activeTag);
  }, [searchTerm]);
  
  return (
    <div className="min-h-screen relative">
      {/* 3D背景 */}
      <div className="fixed inset-0 -z-10">
        <Suspense fallback={<div className="w-full h-full bg-gradient-to-b from-gray-900 to-blue-900" />}>
          <LazySceneContainer>
            <PostsScene />
          </LazySceneContainer>
        </Suspense>
      </div>
      
      {/* 悬浮导航 */}
      <FloatingNav defaultExpanded={false} />
      
      <main className="container mx-auto px-4 py-8 mt-8">
        {/* 页面标题和搜索栏 */}
        <div className="relative bg-gradient-to-b from-blue-900/50 to-gray-900 py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                博客文章
              </motion.h1>
              
              {/* 当前标签筛选 */}
              {activeTag && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-6"
                >
                  <span className="bg-blue-500/30 text-blue-200 px-4 py-2 rounded-full inline-flex items-center">
                    <span className="mr-2">标签:</span>
                    <span className="font-medium">{decodeURIComponent(activeTag)}</span>
                    <button 
                      onClick={() => window.location.href = '/posts'}
                      className="ml-2 bg-blue-400/20 hover:bg-blue-400/40 rounded-full w-5 h-5 inline-flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </span>
                </motion.div>
              )}
              
              {/* 搜索框 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-md mx-auto relative"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="搜索文章..."
                    className="w-full px-5 py-3 bg-gray-800/50 border border-gray-700 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* 标签列表 */}
            {!activeTag && allTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap justify-center gap-2 mb-8"
              >
                {allTags.map((tag, index) => (
                  <a 
                    key={index} 
                    href={`/posts?tag=${encodeURIComponent(tag)}`}
                    className="bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white px-3 py-1 rounded-full text-sm transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/posts?tag=${encodeURIComponent(tag)}`;
                    }}
                  >
                    {tag}
                  </a>
                ))}
              </motion.div>
            )}
          </div>
        </div>
        
        {/* 文章列表 */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {isLoading ? (
            // 加载状态显示
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <h3 className="text-xl font-medium text-gray-400">加载中...</h3>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.slug || `post-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <a 
                    href={`/posts/${post.slug}`} 
                    key={post.slug || `link-${index}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/posts/${post.slug}`;
                    }}
                  >
                    <div className="bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700 rounded-xl overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="text-sm text-gray-400">
                            {post.date ? new Date(post.date).toLocaleDateString('zh-CN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : '无日期'}
                          </div>
                        </div>
                        <h2 className="text-xl font-bold mb-3 text-white">{post.title || '无标题'}</h2>
                        {post.excerpt && (
                          <p className="text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p>
                        )}
                        {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-auto">
                            {post.tags.map((tag, tagIndex) => (
                              <span 
                                key={tagIndex}
                                className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full text-xs"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  window.location.href = `/posts?tag=${encodeURIComponent(tag)}`;
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium text-gray-400">未找到文章</h3>
              <p className="text-gray-500 mt-2">
                尝试不同的搜索关键词或{" "}
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    if (activeTag) {
                      router.push('/posts');
                    }
                  }}
                  className="text-blue-400 hover:text-blue-300"
                >
                  查看所有文章
                </button>
              </p>
            </div>
          )}
        </div>
        
        {/* 返回主页按钮 */}
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <Link href="/">
            <span className="inline-block px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors">
              ← 返回主页
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}