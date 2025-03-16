import { Object3DProps } from '@react-three/fiber';
import { Group } from 'three';

declare module 'framer-motion-3d' {
  export interface MotionGroupProps extends Object3DProps {
    ref?: ((instance: any) => void) | React.MutableRefObject<any> | null;
    variants?: any;
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    whileFocus?: any;
    whileDrag?: any;
    whileInView?: any;
  }
  
  export const motion: {
    group: React.ForwardRefExoticComponent<MotionGroupProps & React.RefAttributes<Group>>;
    mesh: React.ForwardRefExoticComponent<MotionGroupProps & React.RefAttributes<THREE.Mesh>>;
  };
} 