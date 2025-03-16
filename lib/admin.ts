'use server';

import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import type { Post } from '@/types';

// 简单的管理密码验证（实际项目中应使用更安全的方式）
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

/**
 * 管理员登录
 * @param password 密码
 * @returns 登录结果
 */
export async function login(password: string): Promise<{ success: boolean; message?: string }> {
  if (password === ADMIN_PASSWORD) {
    cookies().set('admin_logged_in', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24小时
      path: '/',
    });
    
    return { success: true };
  }
  
  return { success: false, message: '密码不正确' };
}

/**
 * 管理员注销
 */
export async function logout(): Promise<{ success: boolean }> {
  cookies().delete('admin_logged_in');
  return { success: true };
}

/**
 * 保存文章
 * @param post 文章数据
 * @returns 保存结果
 */
export async function savePost(post: Post): Promise<{ success: boolean; message?: string }> {
  // 检查是否登录
  if (!cookies().has('admin_logged_in')) {
    return { success: false, message: '未授权操作' };
  }
  
  try {
    const postsDirectory = path.join(process.cwd(), 'public', 'posts');
    
    // 确保目录存在
    if (!fs.existsSync(postsDirectory)) {
      fs.mkdirSync(postsDirectory, { recursive: true });
    }
    
    // 构建文件路径
    const filePath = path.join(postsDirectory, `${post.slug}.md`);
    
    // 检查文件是否已存在（如果是新文章）
    if (fs.existsSync(filePath)) {
      // 实际项目中可能需要检查是否允许覆盖或提供版本控制
      console.log(`文件已存在，将覆盖: ${filePath}`);
    }
    
    // 构建Markdown内容，包含frontmatter
    const content = `---
title: "${post.title}"
date: "${post.date}"
excerpt: "${post.excerpt || ""}"
tags: [${post.tags.map(tag => `"${tag}"`).join(', ')}]
---

${post.content}`;
    
    // 写入文件
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`文章保存成功: ${filePath}`);
    return { success: true };
  } catch (error) {
    console.error('保存文章时出错:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : '保存文章时发生未知错误'
    };
  }
} 