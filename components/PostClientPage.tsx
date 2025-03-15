'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SceneContainer from './3d/SceneContainer';
import FloatingNav from './ui/FloatingNav';
import { Post } from '@/types';

// 简单的3D场景组件
function PostScene() {
  return (
    <>
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
    </>
  );
}

interface PostClientPageProps {
  post: Post & { content: string };
}

export default function PostClientPage({ post }: PostClientPageProps) {
  const sceneRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen relative">
      {/* 3D背景 */}
      <div ref={sceneRef} className="fixed inset-0 -z-10">
        <SceneContainer>
          <PostScene />
        </SceneContainer>
      </div>

      {/* 悬浮导航 */}
      <FloatingNav />

      <main className="relative z-10 container mx-auto px-4 py-8 mt-16">
        <div className="max-w-3xl mx-auto">
          {/* 返回按钮 */}
          <div className="mb-6">
            <Link href="/" className="text-gray-400 hover:text-white inline-flex items-center transition-colors">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回首页
            </Link>
          </div>

          {/* 文章标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center text-gray-400 gap-4 mb-6">
              <time dateTime={post.date} className="inline-flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {new Date(post.date).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>

              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link 
                        href={`/tags/${tag}`} 
                        key={tag}
                        className="text-sm hover:text-white transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* 文章内容 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="glass-effect p-8 rounded-3xl">
              <div 
                className="prose prose-invert max-w-none prose-img:rounded-xl prose-headings:text-white prose-a:text-[rgb(var(--apple-teal))]"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 