'use client';

import { useRef, useEffect, useState, RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, Float, Text, OrbitControls, useTexture, Sparkles } from '@react-three/drei';
import { Vector3, Group, Mesh, MathUtils, Color } from 'three';
import { motion } from 'framer-motion-3d';
import { useAnimation } from 'framer-motion';
import { Post } from '@/lib/types';

type BlogHomeSceneProps = {
  posts: Post[];
};

export default function BlogHomeScene({ posts = [] }: BlogHomeSceneProps) {
  const { camera, pointer, viewport } = useThree();
  const orbitControlsRef = useRef<any>(null);
  const groupRef = useRef<Group>(null);

  // 根据鼠标位置微调相机
  useFrame((state) => {
    if (orbitControlsRef.current) {
      // 限制相机移动范围
      orbitControlsRef.current.target.y = MathUtils.clamp(orbitControlsRef.current.target.y, -2, 2);
      
      // 添加轻微的呼吸动画
      if (groupRef.current) {
        groupRef.current.rotation.y = MathUtils.lerp(
          groupRef.current.rotation.y,
          pointer.x * 0.1,
          0.02
        );
        groupRef.current.rotation.x = MathUtils.lerp(
          groupRef.current.rotation.x,
          pointer.y * 0.05,
          0.02
        );
      }
    }
  });

  return (
    <>
      {/* 控制相机 */}
      <OrbitControls
        ref={orbitControlsRef}
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.3}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 3}
        dampingFactor={0.05}
        enableDamping={true}
      />

      {/* 环境光和背景 */}
      <Environment preset="night" />
      <fog attach="fog" args={['#000000', 8, 30]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c77dff" />

      {/* 主场景内容 */}
      <group ref={groupRef}>
        {/* 闪光效果 */}
        <Sparkles 
          count={200} 
          scale={[20, 10, 20]} 
          size={0.5} 
          speed={0.2} 
          opacity={0.2} 
          color="#ffffff"
        />
        
        {/* 背景粒子 */}
        <Stars />

        {/* 文章卡片 */}
        <ArticleCards posts={posts} />
      </group>
    </>
  );
}

function Stars() {
  const starsRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0003;
      starsRef.current.rotation.x += 0.0001;
    }
  });

  return (
    <group ref={starsRef}>
      {Array.from({ length: 300 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50,
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial 
            color={
              i % 30 === 0 
                ? '#c77dff' 
                : i % 25 === 0 
                  ? '#48cae4'
                  : i % 15 === 0
                    ? '#ff5e7d'
                    : '#ffffff'
            } 
            transparent
            opacity={Math.random() * 0.5 + 0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function ArticleCards({ posts }: { posts: Post[] }) {
  return (
    <group>
      {posts.slice(0, 6).map((post, i) => {
        // 计算位置，形成更动态的图案
        const angle = (Math.PI * 2 * i) / 6;
        const radius = 5;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        const y = Math.sin(i * 0.5) * 0.5;

        return (
          <Float
            key={post.slug}
            speed={1.5} // 动画速度
            rotationIntensity={0.2} // 旋转强度
            floatIntensity={0.6} // 浮动强度
          >
            <ArticleCard
              post={post}
              position={[x, y, z]}
              rotation={[0, -angle, 0]}
              index={i}
            />
          </Float>
        );
      })}
    </group>
  );
}

// 定义缺失的variants变量
const cardVariants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.3 }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

function ArticleCard({
  post,
  position,
  rotation,
  index,
}: {
  post: Post;
  position: [number, number, number];
  rotation: [number, number, number];
  index: number;
}) {
  // 使用useState保存引用，而不是useRef，避免read-only问题
  const [cardNode, setCardNode] = useState<Group | null>(null);
  const animationControls = useAnimation();
  
  // 使用节点状态而不是ref
  useEffect(() => {
    if (cardNode) {
      // 如果需要可以在这里添加动画逻辑
    }
  }, [cardNode]);

  // 获取标签颜色
  const getTagColor = (tag?: string) => {
    if (!tag) return '#9d4edd';
    
    const tagColors: {[key: string]: string} = {
      '3D博客': '#9d4edd',
      'Three.js': '#0096c7',
      '教程': '#f72585',
      'Markdown': '#40916c',
      '示例': '#fca311'
    };
    
    return tagColors[tag] || '#9d4edd';
  };

  const firstTag = post.tags && post.tags.length > 0 ? post.tags[0] : undefined;
  const cardColor = getTagColor(firstTag);

  return (
    <motion.group
      // 使用类型断言解决类型问题，避免直接修改ref.current
      ref={(node: any) => setCardNode(node)}
      position={position}
      rotation={rotation}
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
    >
      {/* 卡片背景 */}
      <mesh position={[0, 0, -0.05]} receiveShadow castShadow>
        <boxGeometry args={[2.4, 1.4, 0.1]} />
        <meshStandardMaterial 
          color={cardColor}
          metalness={0.8}
          roughness={0.2}
          opacity={0.85}
          transparent 
        />
      </mesh>

      {/* 卡片圆角边框 - 模拟磨砂玻璃效果 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 1.2, 0.05]} />
        <meshStandardMaterial 
          color="#1e293b"
          metalness={0.3}
          roughness={0.8}
          opacity={0.9}
          transparent 
        />
      </mesh>

      {/* 卡片标题 - 更新Text组件API */}
      <Text
        position={[0, 0.2, 0.1]}
        fontSize={0.15}
        maxWidth={2}
        lineHeight={1.2}
        textAlign="center"
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={-0.02}
      >
        {post.title}
      </Text>

      {/* 卡片日期和标签 - 更新Text组件API */}
      <Text
        position={[0, -0.2, 0.1]}
        fontSize={0.09}
        maxWidth={2}
        lineHeight={1.2}
        textAlign="center"
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {new Date(post.date).toLocaleDateString('zh-CN').substring(5)}
        {post.tags && post.tags.length > 0 && ` · ${post.tags[0]}`}
      </Text>
    </motion.group>
  );
} 