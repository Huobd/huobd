'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navItems = [
    { label: '首页', path: '/' },
    { label: '文章列表', path: '/posts' },
    { label: '标签', path: '/tags' },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
      className={`fixed top-0 left-0 right-0 z-50 py-4 px-6 transition-all duration-500 ${
        scrolled 
          ? 'glass-effect' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link 
          href="/" 
          className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--apple-pink))] via-[rgb(var(--apple-purple))] to-[rgb(var(--apple-blue))]"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Spatial Blog
          </motion.div>
        </Link>
        
        <nav className="hidden md:flex space-x-7">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <NavLink key={item.path} href={item.path} isActive={isActive}>
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        
        <div className="md:hidden">
          <button 
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            className="glass-button p-2 rounded-xl hover:bg-white/10"
            onClick={toggleMenu}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              className="w-6 h-6"
            >
              {menuOpen ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 移动端菜单 */}
      {menuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="md:hidden mt-4 py-4 glass-effect rounded-2xl"
        >
          <nav className="flex flex-col space-y-4 px-6">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              
              return (
                <MobileNavLink key={item.path} href={item.path} isActive={isActive} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </MobileNavLink>
              );
            })}
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}

function NavLink({ href, children, isActive }: { href: string; children: React.ReactNode; isActive: boolean }) {
  return (
    <Link 
      href={href} 
      className={`text-gray-200 hover:text-white transition-colors duration-200 relative group ${
        isActive ? 'font-medium' : ''
      }`}
    >
      <span>{children}</span>
      {isActive && (
        <motion.span
          layoutId="nav-active"
          className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[rgb(var(--apple-pink))] to-[rgb(var(--apple-purple))] transition-all duration-300 group-hover:w-full"
          transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
        />
      )}
    </Link>
  );
}

function MobileNavLink({ href, isActive, onClick, children }: { href: string; isActive: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`text-white py-2 px-4 rounded-xl hover:bg-white/10 transition-colors duration-200 block ${
        isActive ? 'font-medium' : ''
      }`}
    >
      {children}
    </Link>
  );
} 