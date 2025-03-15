import { getPostsByTag, getAllTags } from '@/lib/markdown';
import TagClientPage from '@/components/TagClientPage';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// 添加动态配置
export const dynamic = 'force-dynamic';

// 生成静态页面参数
export async function generateStaticParams() {
  const tags = await getAllTags();
  
  return tags.map((tag) => ({
    tag,
  }));
}

// 生成元数据
export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  return {
    title: `${params.tag} - 3D创意博客`,
    description: `浏览所有关于${params.tag}的文章`,
  };
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  try {
    // 在服务器组件中获取数据
    const tag = decodeURIComponent(params.tag);
    const posts = await getPostsByTag(tag);
    
    if (posts.length === 0) {
      notFound();
    }
    
    // 将数据传递给客户端组件进行渲染
    return <TagClientPage tag={tag} posts={posts} />;
  } catch (error) {
    // 如果标签不存在，返回404页面
    notFound();
  }
} 