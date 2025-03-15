'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Post } from '@/types';
import SceneContainer from './3d/SceneContainer';
import FloatingNav from './ui/FloatingNav';

// 3D场景组件 - 根据标签显示不同的3D元素
function TagScene({ tag }: { tag: string }) {
  return (
    <>
      {/* 基础光照 */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* 添加粒子效果作为背景 */}
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
      
      {/* 根据标签显示不同的3D场景元素 */}
      {tag === '技术' && (
        <mesh position={[0, 0, -5]}>
          <octahedronGeometry args={[2, 0]} />
          <meshStandardMaterial color="#6366f1" wireframe />
        </mesh>
      )}
      
      {tag === '设计' && (
        <mesh position={[0, 0, -5]}>
          <torusGeometry args={[2, 0.5, 16, 100]} />
          <meshStandardMaterial color="#ec4899" wireframe />
        </mesh>
      )}
      
      {tag === '思考' && (
        <mesh position={[0, 0, -5]}>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial color="#8b5cf6" wireframe />
        </mesh>
      )}
      
      {/* 默认3D元素 */}
      {!['技术', '设计', '思考'].includes(tag) && (
        <mesh position={[0, 0, -5]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#10b981" wireframe />
        </mesh>
      )}
    </>
  );
}

interface TagClientPageProps {
  tag: string;
  posts: Post[];
}

export default function TagClientPage({ tag, posts }: TagClientPageProps) {
  return (
    <div className="min-h-screen relative">
      {/* 3D背景 */}
      <div className="fixed inset-0 -z-10">
        <SceneContainer>
          <TagScene tag={tag} />
        </SceneContainer>
      </div>
      
      {/* 悬浮导航 */}
      <FloatingNav />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 mt-16"
        >
          <span className="text-sm font-medium text-gray-400 mb-2 block">标签</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">#{tag}</h1>
          <p className="text-xl text-gray-300 max-w-xl mx-auto">
            {posts.length} 篇相关文章
          </p>
        </motion.div>
        
        {/* 文章列表 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-6 flex justify-between items-center">
            <Link href="/tags" className="text-gray-400 hover:text-white transition-colors">
              ← 所有标签
            </Link>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
            <div className="grid gap-6">
              {posts.map((post, index) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <Link 
                    href={`/posts/${post.slug}`}
                    className="block p-4 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                    <p className="text-gray-300 mb-2">{post.excerpt}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {post.tags && post.tags.map(postTag => (
                          <span 
                            key={postTag} 
                            className={`px-2 py-1 text-xs rounded-full ${
                              postTag === tag 
                                ? 'bg-white/20 text-white font-medium' 
                                : 'bg-white/10 text-gray-300'
                            }`}
                          >
                            {postTag}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(post.date).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
} 