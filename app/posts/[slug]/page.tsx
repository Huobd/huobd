import { getPost, getPosts } from '@/lib/markdown';
import PostClientPage from '@/components/PostClientPage';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Post } from '@/types';

// 修改配置，使用ISR而不是完全动态渲染
export const revalidate = 3600; // 1小时刷新一次

// 生成静态页面参数
export async function generateStaticParams() {
  try {
    const posts = await getPosts();
    
    if (!Array.isArray(posts) || posts.length === 0) {
      console.log('没有找到文章或文章数组为空');
      return [];
    }
    
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('生成静态参数时出错:', error);
    return [];
  }
}

// 生成元数据
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post = await getPost(params.slug);
    
    if (!post) {
      return {
        title: '文章不存在 - 3D创意博客',
        description: '找不到请求的文章',
      };
    }
    
    const safePost = post;
    
    return {
      title: `${safePost.title} - 3D创意博客`,
      description: safePost.excerpt || safePost.title,
    };
  } catch (error) {
    console.error(`生成元数据时出错，文章: ${params.slug}`, error);
    return {
      title: '文章加载错误 - 3D创意博客',
      description: '加载文章时发生错误',
    };
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  console.log(`渲染文章页面，slug: ${params.slug}`);
  
  try {
    // 在服务器组件中获取文章数据
    const post = await getPost(params.slug);
    
    if (!post) {
      console.log(`文章不存在: ${params.slug}`);
      notFound();
    }
    
    console.log(`文章获取成功: ${post.title}, 内容长度: ${post.content.length}`);
    
    // 将数据传递给客户端组件进行渲染
    return <PostClientPage post={post} />;
  } catch (error) {
    console.error(`获取文章时出错: ${params.slug}`, error);
    
    // 创建一个空的文章对象，以满足类型要求
    const emptyPost: Post = {
      slug: params.slug,
      title: '加载失败',
      date: new Date().toISOString(),
      content: '',
      tags: []
    };
    
    // 如果文章不存在，返回错误页面
    return <PostClientPage 
      post={emptyPost} 
      error={`加载文章时出错: ${error instanceof Error ? error.message : '未知错误'}`} 
    />;
  }
} 