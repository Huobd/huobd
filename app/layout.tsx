import './globals.css';
import { Inter, Roboto_Mono } from 'next/font/google';
import type { Metadata } from 'next';

// 加载Inter字体
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// 加载Roboto Mono字体
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

// 站点元数据
export const metadata: Metadata = {
  title: '麻糖的博客',
  description: '风虽大，都绕过了我的灵魂',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark scroll-smooth">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
} 
