import { getPosts } from '@/lib/markdown';
import PostsClientPage from '@/components/PostsClientPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '文章列表 - 茂宇的人生博客',
  description: '浏览所有博客文章，按标签或关键词筛选',
};

// 标记页面是服务端渲染的
export const dynamic = 'force-dynamic';

// 文章列表页面，支持通过标签筛选
export default async function PostsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // 获取所有文章
  const posts = await getPosts();
  
  // 确保posts是数组
  const postsArray = Array.isArray(posts) ? posts : [];
  
  console.log('PostsPage: 获取到 posts 数据，长度:', postsArray.length);
  
  // 获取标签筛选参数
  const tagFilter = searchParams.tag as string | undefined;
  
  // 如果有标签参数，筛选包含该标签的文章
  const filteredPosts = tagFilter 
    ? postsArray.filter(post => 
        post.tags && 
        Array.isArray(post.tags) &&
        post.tags.some(tag => 
          tag.toLowerCase() === decodeURIComponent(tagFilter).toLowerCase()
        )
      )
    : postsArray;
  
  return (
    <div>
      <PostsClientPage 
        posts={filteredPosts} 
        activeTag={tagFilter} 
      />
    </div>
  );
} 