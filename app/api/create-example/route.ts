import { createExamplePost } from '@/lib/markdown';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await createExamplePost();
    return NextResponse.json({ success: result.success, message: '示例文章创建成功' });
  } catch (error) {
    console.error('创建示例文章时出错:', error);
    return NextResponse.json({ success: false, message: '创建示例文章失败' }, { status: 500 });
  }
} 