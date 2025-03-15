/**
 * 文章数据类型定义
 */
export interface Post {
  /**
   * 文章的唯一标识符，也用于URL
   */
  slug: string;
  
  /**
   * 文章标题
   */
  title: string;
  
  /**
   * 发布日期，ISO格式字符串
   */
  date: string;
  
  /**
   * 文章摘要
   */
  excerpt?: string;
  
  /**
   * 文章标签
   */
  tags: string[];
  
  /**
   * 文章内容（可选），只在文章详情页面使用
   */
  content: string;
} 