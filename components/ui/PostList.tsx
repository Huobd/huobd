'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Post } from '@/types';

type PostListProps = {
  posts: Post[];
};

export default function PostList({ posts }: PostListProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="glass-effect-light py-12 px-6 text-center rounded-3xl">
        <p className="text-lg text-white/80">暂无文章</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {posts.map((post, index) => (
        <PostCard key={post.slug} post={post} index={index} />
      ))}
    </div>
  );
}

function PostCard({ post, index }: { post: Post; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1.0]
      }}
      whileHover={{ y: -5 }}
    >
      <Link href={`/posts/${post.slug}`} className="block h-full">
        <div className="glass-effect p-6 rounded-3xl h-full border border-white/5 hover:border-white/10 transition-all duration-500 hover:shadow-[0_15px_30px_-15px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col h-full">
            <h3 className="text-xl font-semibold text-white mb-2 apple-title">
              {post.title}
            </h3>
            
            <div className="flex flex-wrap items-center text-sm text-gray-400 mb-4 gap-2">
              <time dateTime={post.date} className="bg-white/5 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                {new Date(post.date).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="bg-[rgba(var(--apple-purple),0.2)] text-[rgb(var(--apple-purple))] px-3 py-1 rounded-full text-xs backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <p className="text-gray-300 text-sm flex-grow leading-relaxed">
              {post.excerpt || (post.content ? post.content.substring(0, 120) : '')}...
            </p>
            
            <div className="mt-5 pt-4 border-t border-white/10">
              <span className="text-[rgb(var(--apple-teal))] text-sm font-medium inline-flex items-center group-hover:translate-x-1 transition-transform duration-300">
                阅读全文
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
} 