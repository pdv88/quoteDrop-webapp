import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShape({ position, color, speed, rotationSpeed }: { position: [number, number, number], color: string, speed: number, rotationSpeed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * rotationSpeed;
    meshRef.current.rotation.y = time * rotationSpeed * 0.5;
  });

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.1} 
          metalness={0.8}
          envMapIntensity={1.5}
        />
      </mesh>
    </Float>
  );
}

function GlassCube({ position }: { position: [number, number, number] }) {
    const meshRef = useRef<THREE.Mesh>(null);
  
    useFrame((state) => {
      if (!meshRef.current) return;
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.x = time * 0.2;
      meshRef.current.rotation.z = time * 0.1;
    });
  
    return (
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef} position={position}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshPhysicalMaterial 
            color="#ffffff" 
            roughness={0} 
            metalness={0.1}
            transmission={0.9} // Glass effect
            thickness={1}
            envMapIntensity={2}
          />
        </mesh>
      </Float>
    );
  }

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#2dd4bf" />
        
        <group position={[2, 0, 0]}>
            <FloatingShape position={[-1, 2, -2]} color="#14b8a6" speed={1.5} rotationSpeed={0.5} />
            <FloatingShape position={[3, -1, -4]} color="#0d9488" speed={2} rotationSpeed={0.3} />
            <FloatingShape position={[-3, -2, -1]} color="#99f6e4" speed={1} rotationSpeed={0.4} />
            <GlassCube position={[1, 0, 0]} />
        </group>

        <Environment preset="city" />
        <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
      </Canvas>
    </div>
  );
}
