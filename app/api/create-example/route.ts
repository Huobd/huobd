import { createExamplePost } from '@/lib/markdown';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const success = await createExamplePost();
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: '示例文章创建成功，请刷新页面查看' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: '示例文章创建失败，请查看服务器日志' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('创建示例文章API错误:', error);
    return NextResponse.json({ 
      success: false, 
      message: '服务器错误: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}

// 设置为动态渲染
export const dynamic = 'force-dynamic'; 