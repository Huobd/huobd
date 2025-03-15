/**
 * 文章类型定义
 */
export type { Post } from '@/types';

/**
 * 3D文章对象属性
 */
export type Article3DObject = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  title: string;
  content?: string;
};

/**
 * 3D场景配置
 */
export type SceneConfig = {
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  environmentPreset: string;
  lightIntensity: number;
}; 