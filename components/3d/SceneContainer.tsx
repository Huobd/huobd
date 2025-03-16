'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { usePathname, useRouter } from 'next/navigation';
import * as THREE from 'three';
import { ClickEffect } from './ClickEffect';

interface SceneContainerProps {
  children: React.ReactNode;
}

// 定义点击事件类型
interface ThreeEvent extends THREE.Event {
  clientX: number;
  clientY: number;
  stopPropagation: () => void;
}

// 粒子系统组件
function ParticleSystem() {
  const particlesRef = useRef<THREE.Points>(null);
  const positionsRef = useRef<THREE.BufferAttribute | null>(null);
  
  // 初始化粒子位置
  useEffect(() => {
    if (!particlesRef.current) return;
    
    const positions = new Float32Array(6000);
    for (let i = 0; i < 6000; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 20;
    }
    
    // 创建缓冲属性
    const bufferAttribute = new THREE.BufferAttribute(positions, 3);
    particlesRef.current.geometry.setAttribute('position', bufferAttribute);
    positionsRef.current = bufferAttribute;
  }, []);
  
  // 动画粒子
  useFrame((state) => {
    if (!particlesRef.current || !positionsRef.current) return;
    
    // 获取时间
    const time = state.clock.getElapsedTime() * 0.2;
    const positions = positionsRef.current.array;
    
    // 更新每个粒子位置
    for (let i = 0; i < positions.length; i += 3) {
      // 添加微小的随机运动
      positions[i + 1] += Math.sin(time + i) * 0.003;
      positions[i] += Math.cos(time + i * 0.1) * 0.003;
      
      // 如果粒子移动太远，将其重置
      if (Math.abs(positions[i]) > 10) positions[i] *= 0.95;
      if (Math.abs(positions[i + 1]) > 10) positions[i + 1] *= 0.95;
      if (Math.abs(positions[i + 2]) > 10) positions[i + 2] *= 0.95;
    }
    
    // 标记需要更新
    positionsRef.current.needsUpdate = true;
    
    // 轻微旋转粒子系统
    particlesRef.current.rotation.y += 0.0005;
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry />
      <pointsMaterial 
        size={0.08} 
        color="#ffffff" 
        sizeAttenuation 
        transparent 
        opacity={0.7}
      />
    </points>
  );
}

// 场景容器组件
function SceneContainer({ children }: SceneContainerProps) {
  const pathname = usePathname();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [clickEffects, setClickEffects] = useState<{ position: THREE.Vector3; id: number; color: THREE.Color }[]>([]);
  const canvasRef = useRef(null);
  
  // 用于生成唯一ID
  const [nextId, setNextId] = useState(0);
  
  // 监听鼠标移动以实现视差效果
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 计算归一化的鼠标位置
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // 计算相机位置 - 根据页面不同调整视图，修复类型错误
  const getCameraPosition = (): [number, number, number] => {
    if (pathname === '/') {
      return [0, 0, 8]; // 首页相机位置
    } else if (pathname.startsWith('/posts/')) {
      return [0, 0, 6]; // 文章详情页相机位置
    } else {
      return [0, 0, 7]; // 其他页面相机位置
    }
  };
  
  // 当背景被点击时创建一个新的效果
  const handleCanvasClick = useCallback((event: any) => {
    // 检查点击事件中是否已经处理过（由卡片点击触发）
    if (event.stopPropagation) {
      if (event._stopped) return; // 如果已被处理，不创建效果
      event._stopped = true; // 标记此事件已被处理
    }
    
    console.log('Canvas clicked at', event.clientX, event.clientY);
    
    // 如果是标签点击，不创建效果
    if (event.object && event.object.userData && event.object.userData.type === 'TagCloud') {
      return;
    }
    
    // 将点击位置从屏幕坐标转换为3D空间坐标
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // 创建一个新的点击效果
    const newEffect = {
      position: new THREE.Vector3(x * 10, y * 5, -5),
      id: nextId,
      color: new THREE.Color(
        0.5 + Math.random() * 0.5, 
        0.5 + Math.random() * 0.5, 
        0.5 + Math.random() * 0.5
      )
    };
    
    // 更新ID
    setNextId(prevId => prevId + 1);
    
    // 添加到效果列表
    setClickEffects(prev => [...prev, newEffect]);
    
    // 3秒后移除效果
    setTimeout(() => {
      setClickEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
    }, 3000);
  }, [nextId]);

  return (
    <Canvas
      ref={canvasRef}
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%'
      }}
      camera={{ 
        position: getCameraPosition(),
        fov: 75,  // 增大视场角以显示更多内容
        near: 0.1,
        far: 100
      }}
      gl={{ 
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new THREE.Color('#000000'));
        console.log('Canvas created, scene:', scene);
      }}
      onClick={handleCanvasClick}
      // 降低轨道控制干扰，使用类型断言解决类型问题
      raycaster={
        {
          computeOffsets: (_: any, __: any) => ({
            offsetX: 0,
            offsetY: 0
          })
        } as any
      }
    >
      {/* 添加静态粒子背景 */}
      <ParticleSystem />
      
      {/* 简化轨道控制 - 减少控制限制，使标签云更容易浏览 */}
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.2}
        maxPolarAngle={Math.PI * 0.7}
        minPolarAngle={Math.PI * 0.3}
        dampingFactor={0.05}
        enableDamping={true}
        makeDefault
      />
      
      {/* 渲染子元素 */}
      {children}
      
      {/* 渲染所有当前活跃的点击效果 */}
      {clickEffects.map(effect => (
        <ClickEffect 
          key={effect.id} 
          position={effect.position} 
          color={effect.color} 
        />
      ))}
    </Canvas>
  );
}

export default SceneContainer; 