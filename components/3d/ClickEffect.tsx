'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ClickEffectProps {
  position: THREE.Vector3;
  color: THREE.Color;
}

export function ClickEffect({ position, color }: ClickEffectProps) {
  // 创建粒子系统的引用
  const groupRef = useRef<THREE.Group>(null);
  const startTimeRef = useRef(Date.now());
  const particlesRef = useRef<THREE.Points>(null);
  
  // 设置初始位置
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(position);
    }
  }, [position]);
  
  // 创建粒子数据
  useEffect(() => {
    if (!particlesRef.current) return;
    
    const particleCount = 30;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // 随机位置（从中心向外的小偏移）
      positions[i * 3] = (Math.random() - 0.5) * 0.2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      
      // 随机大小
      sizes[i] = Math.random() * 0.5 + 0.5;
    }
    
    // 设置位置和大小属性
    particlesRef.current.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    
    particlesRef.current.geometry.setAttribute(
      'size',
      new THREE.BufferAttribute(sizes, 1)
    );
    
    // 重置时间
    startTimeRef.current = Date.now();
  }, []);
  
  // 动画粒子
  useFrame(() => {
    if (!particlesRef.current || !groupRef.current) return;
    
    const elapsedTime = (Date.now() - startTimeRef.current) / 1000;
    const lifeTime = 2; // 效果持续2秒
    
    if (elapsedTime > lifeTime) {
      // 效果结束后隐藏
      groupRef.current.visible = false;
      return;
    }
    
    // 获取位置数据
    const positions = particlesRef.current.geometry.attributes.position;
    const positionArray = positions.array as Float32Array;
    
    // 更新每个粒子的位置
    for (let i = 0; i < positionArray.length; i += 3) {
      // 向外扩散
      positionArray[i] *= 1.05;
      positionArray[i + 1] *= 1.05;
      positionArray[i + 2] *= 1.05;
      
      // 添加重力效果
      positionArray[i + 1] -= 0.01;
    }
    
    // 标记需要更新
    positions.needsUpdate = true;
    
    // 随着时间的推移降低不透明度
    if (particlesRef.current.material instanceof THREE.PointsMaterial) {
      particlesRef.current.material.opacity = 1 - (elapsedTime / lifeTime);
    }
  });
  
  return (
    <group ref={groupRef} userData={{ type: 'ClickEffect' }}>
      {/* 粒子系统 */}
      <points ref={particlesRef}>
        <bufferGeometry />
        <pointsMaterial
          size={1}
          sizeAttenuation
          transparent
          depthWrite={false}
          color={color}
          opacity={1}
        />
      </points>
      
      {/* 中心发光球 */}
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
    </group>
  );
} 