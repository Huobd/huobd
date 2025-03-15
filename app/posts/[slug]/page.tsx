import { getPost, getPosts } from '@/lib/markdown';
import PostClientPage from '@/components/PostClientPage';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// 设置动态配置
export const dynamic = 'force-dynamic';

// 生成静态页面参数
export async function generateStaticParams() {
  const posts = await getPosts();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// 生成元数据
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post = await getPost(params.slug);
    
    return {
      title: `${post.title} - 3D创意博客`,
      description: post.excerpt,
    };
  } catch (error) {
    return {
      title: '文章不存在 - 3D创意博客',
      description: '找不到请求的文章',
    };
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  try {
    // 在服务器组件中获取文章数据
    const post = await getPost(params.slug);
    
    // 将数据传递给客户端组件进行渲染
    return <PostClientPage post={post} />;
  } catch (error) {
    // 如果文章不存在，返回404页面
    notFound();
  }
} 