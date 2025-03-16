import { Object3DProps } from '@react-three/fiber';
import { Group } from 'three';

declare module 'framer-motion-3d' {
  export interface MotionGroupProps extends Object3DProps {
    ref?: React.RefObject<Group> | ((instance: Group | null) => void);
    // 其他需要的类型定义
  }
} 