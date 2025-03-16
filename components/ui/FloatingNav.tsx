'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { getAllTags } from '@/lib/markdown'; // 导入获取所有标签的函数
import { useRouter } from 'next/navigation';

interface FloatingNavProps {
  defaultExpanded?: boolean; // 添加默认展开属性
}

export default function FloatingNav({ defaultExpanded = false }: FloatingNavProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [hovered, setHovered] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [showTagCloud, setShowTagCloud] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const lastScrollY = useRef(0);
  const debugInfoRef = useRef<HTMLDivElement | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  
  // 导航项 - 移除了发布文章选项
  const navItems = [
    { path: '/', label: '首页', icon: '🏠', color: 'from-purple-400 to-blue-500' },
    { path: '/posts', label: '文章列表', icon: '📚', color: 'from-pink-400 to-red-500' },
    { path: '#tags', label: '标签', icon: '🏷️', color: 'from-green-400 to-teal-500', special: 'tags' },
  ];
  
  // 获取所有标签
  useEffect(() => {
    let isMounted = true;
    let loadingTimeout: NodeJS.Timeout;
    
    async function fetchTags() {
      if (!showTagCloud) return; // 只在显示标签云时加载标签
      
      try {
        // 设置最小加载时间，避免闪烁
        loadingTimeout = setTimeout(() => {
          if (isMounted) setLoadingTags(true);
        }, 300);
        
        setTagError(null);
        console.log('开始获取标签...');
        
        const allTags = await getAllTags();
        console.log('获取到标签数据:', allTags);
        
        if (isMounted) {
          clearTimeout(loadingTimeout);
          
          if (Array.isArray(allTags)) {
            setTags(allTags);
          } else {
            console.error('标签数据不是数组:', allTags);
            setTags([]);
            setTagError('标签数据格式错误');
          }
          setLoadingTags(false);
        }
      } catch (error) {
        console.error('获取标签失败:', error);
        if (isMounted) {
          clearTimeout(loadingTimeout);
          setTags([]);
          setTagError('获取标签失败，请稍后再试');
          setLoadingTags(false);
        }
      }
    }
    
    fetchTags();
    
    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
    };
  }, [showTagCloud]); // 当标签云显示状态变化时重新获取
  
  // 点击外部区域关闭菜单和标签云
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        if (isExpanded) {
          setIsExpanded(false);
        }
        if (showTagCloud) {
          setShowTagCloud(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, showTagCloud]);
  
  // 当路由变化时关闭菜单和标签云
  useEffect(() => {
    setIsExpanded(false);
    setShowTagCloud(false);
  }, [pathname]);

  // 处理滚动隐藏/显示逻辑
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current + 20) {
        setIsVisible(false);
        setIsExpanded(false);
        setShowTagCloud(false);
      } else if (currentScrollY < lastScrollY.current - 20) {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 在组件挂载时检查是否为首页，如果是则默认展开
  useEffect(() => {
    const isHomePage = pathname === '/';
    setIsExpanded(isHomePage); // 如果是首页，则默认展开
  }, [pathname]);

  // 调试信息
  useEffect(() => {
    if (!showDebug) return;
    
    const debugInfo = document.createElement('div');
    debugInfo.id = 'nav-debug-info';
    debugInfo.style.position = 'fixed';
    debugInfo.style.bottom = '10px';
    debugInfo.style.left = '10px';
    debugInfo.style.backgroundColor = 'rgba(0,0,0,0.7)';
    debugInfo.style.color = 'white';
    debugInfo.style.padding = '10px';
    debugInfo.style.borderRadius = '5px';
    debugInfo.style.zIndex = '9999';
    debugInfo.style.fontSize = '12px';
    debugInfo.style.fontFamily = 'monospace';
    debugInfo.textContent = `路径: ${pathname}, 展开: ${isExpanded}, 标签云: ${showTagCloud}, 标签数: ${tags.length}`;
    
    // 安全地添加到DOM
    if (document.body && !document.getElementById('nav-debug-info')) {
      document.body.appendChild(debugInfo);
      debugInfoRef.current = debugInfo;
    }
    
    return () => {
      // 安全地从DOM移除
      if (debugInfoRef.current && document.body.contains(debugInfoRef.current)) {
        document.body.removeChild(debugInfoRef.current);
      }
    };
  }, [pathname, isExpanded, showTagCloud, showDebug, tags.length]);
  
  // 处理标签点击
  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.preventDefault(); // 阻止默认行为
    e.stopPropagation(); // 阻止事件冒泡
    
    setShowTagCloud(false);
    
    // 使用window.location直接跳转，避免Next.js路由问题
    window.location.href = `/posts?tag=${encodeURIComponent(tag)}`;
  };
  
  // 处理导航项点击
  const handleNavItemClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    if (item.special === 'tags') {
      e.preventDefault();
      setShowTagCloud(!showTagCloud);
    }
  };
  
  // 处理导航项悬停
  const handleNavItemHover = (item: typeof navItems[0]) => {
    setHovered(item.path);
    if (item.special === 'tags') {
      setShowTagCloud(true);
    }
  };
  
  // 处理导航项悬停结束
  const handleNavItemHoverEnd = (item: typeof navItems[0]) => {
    setHovered(null);
    // 不立即关闭标签云，让用户有时间移动到标签云上
  };
  
  // 获取标签颜色
  const getTagColor = (tag: string): string => {
    const colors = [
      'from-pink-500 to-rose-500',
      'from-purple-500 to-indigo-500',
      'from-blue-500 to-cyan-500',
      'from-teal-500 to-green-500',
      'from-amber-500 to-yellow-500',
      'from-orange-500 to-red-500',
    ];
    
    // 使用标签的hash值来确定颜色，保证同一标签总是相同颜色
    const hashCode = tag.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hashCode) % colors.length];
  };
  
  return (
    <>
      <div 
        ref={navRef}
        className={`fixed left-6 md:left-10 z-50 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} 
        style={{ top: 'calc(50% - 100px)' }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="relative"
        >
          {/* 主菜单按钮 */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg flex items-center justify-center text-white hover:shadow-purple-500/30 transition-all hover:scale-110"
            style={{ boxShadow: '0 10px 20px rgba(147, 51, 234, 0.2)' }}
          >
            <span className="sr-only">打开导航</span>
            <motion.div
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                {isExpanded ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.div>
          </button>

          {/* 菜单项 - 只显示图标 */}
          <motion.div
            animate={{
              opacity: isExpanded ? 1 : 0,
              y: isExpanded ? 0 : 20,
              scale: isExpanded ? 1 : 0.8,
            }}
            transition={{ duration: 0.2 }}
            className={`absolute left-0 bottom-full mb-4 space-y-2 ${isExpanded ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            {navItems.map((item) => (
              <div key={item.path}>
                {item.special === 'tags' ? (
                  <motion.div
                    className={`flex items-center justify-center w-14 h-14 md:w-14 md:h-14 rounded-full transition-all cursor-pointer
                      ${showTagCloud 
                        ? 'bg-gradient-to-r ' + item.color + ' text-white' 
                        : 'bg-gray-800/50 hover:bg-white/10 text-white'
                      }`}
                    onHoverStart={() => handleNavItemHover(item)}
                    onHoverEnd={() => handleNavItemHoverEnd(item)}
                    onClick={(e) => handleNavItemClick(item, e)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="sr-only">{item.label}</span>
                  </motion.div>
                ) : (
                  <Link href={item.path}>
                    <motion.div
                      className={`flex items-center justify-center w-14 h-14 md:w-14 md:h-14 rounded-full transition-all
                        ${pathname === item.path 
                          ? 'bg-gradient-to-r ' + item.color + ' text-white' 
                          : 'bg-gray-800/50 hover:bg-white/10 text-white'
                        }`}
                      onHoverStart={() => setHovered(item.path)}
                      onHoverEnd={() => setHovered(null)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="sr-only">{item.label}</span>
                    </motion.div>
                  </Link>
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
      
      {/* 全屏标签云 */}
      <AnimatePresence>
        {showTagCloud && (
          <motion.div 
            className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* 背景模糊 */}
            <motion.div 
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTagCloud(false)}
            />
            
            {/* 标签云容器 */}
            <motion.div 
              className="relative w-full h-full max-w-7xl mx-auto p-8 flex items-center justify-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, type: 'spring' }}
            >
              {/* 标题 */}
              <motion.h2
                className="absolute top-8 left-0 right-0 text-center text-3xl md:text-4xl font-bold text-white"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                  探索标签
                </span>
              </motion.h2>
              
              {/* 关闭按钮 */}
              <motion.button
                className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                onClick={() => setShowTagCloud(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
              
              {/* 标签云 */}
              <div className="w-full h-full flex items-center justify-center">
                {loadingTags ? (
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-4"></div>
                    <p className="text-white">加载标签中...</p>
                  </div>
                ) : tagError ? (
                  <div className="text-center text-white">
                    <p className="text-xl text-red-400">{tagError}</p>
                    <button 
                      onClick={() => {
                        setTagError(null);
                        setShowTagCloud(true); // 触发重新加载
                      }}
                      className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white"
                    >
                      重试
                    </button>
                  </div>
                ) : tags.length > 0 ? (
                  <div className="flex flex-wrap justify-center items-center gap-4 max-w-4xl">
                    {tags.map((tag, index) => (
                      <motion.div
                        key={tag}
                        className={`bg-gradient-to-r ${getTagColor(tag)} px-4 py-2 rounded-full text-white font-medium shadow-lg cursor-pointer hover:shadow-xl transition-all`}
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.03,
                          type: 'spring',
                          stiffness: 200
                        }}
                        whileHover={{ 
                          scale: 1.05, 
                          boxShadow: '0 0 15px rgba(255,255,255,0.3)' 
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleTagClick(tag, e)}
                        style={{ 
                          fontSize: `${Math.max(1, Math.min(2, 1 + tag.length * 0.05))}rem`,
                        }}
                      >
                        {tag}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-white">
                    <p className="text-xl">暂无标签</p>
                    <p className="mt-2 text-gray-400">发布文章并添加标签后将在这里显示</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}