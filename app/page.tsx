import ClientPage from '@/components/ClientPage';
import { getPosts } from '@/lib/markdown';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '麻糖的博客',
  description: '风虽大都绕过了我的灵魂',
};

// 确保页面是动态渲染的，使脚本正确初始化
export const dynamic = 'force-dynamic';

export default async function Home() {
  // 获取博客文章数据，用于漂浮展示
  const posts = await getPosts();
  
  return (
    <>
      {/* 传递文章数据用于3D漂浮展示 */}
      <ClientPage posts={posts} />
    </>
  );
}
