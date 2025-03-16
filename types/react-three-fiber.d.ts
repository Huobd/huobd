import { Vector2 } from 'three';
import { ReactThreeFiber } from '@react-three/fiber';

declare module '@react-three/fiber' {
  // 扩展Canvas组件的属性类型
  interface Props {
    // 重新定义raycaster类型以支持computeOffsets属性
    raycaster?: ReactThreeFiber.Object3DNode<THREE.Raycaster, typeof THREE.Raycaster> & {
      computeOffsets?: (event: any, state: any) => {
        offsetX: number;
        offsetY: number;
      };
      // 其他可能的属性
      enabled?: boolean;
      params?: {
        Mesh?: {
          threshold: number;
          useBVH: boolean;
        };
        Line?: {
          threshold: number;
        };
        LOD?: {
          threshold: number;
        };
        Points?: {
          threshold: number;
        };
        Sprite?: {
          threshold: number;
        };
      };
    };
  }
} 