/**
 * StarfieldCanvas.tsx
 * Canvas R3F fixo no fundo da tela — totalmente desacoplado do scroll DOM.
 * Exibe: campo estelar dourado + geometrias flutuantes que reagem ao mouse.
 */
import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

/* ─── Partículas douradas flutuando ─── */
function GoldDust({ count = 80 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const dummy = new THREE.Object3D();

  // Gera posições aleatórias uma única vez
  const positions = useRef(
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 30,
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 15 - 3,
      speed: 0.1 + Math.random() * 0.3,
      offset: Math.random() * Math.PI * 2,
      scale: 0.03 + Math.random() * 0.07,
    }))
  );

  useFrame(({ clock }) => {
    positions.current.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(clock.elapsedTime * 0.3 + p.offset) * 0.5,
        p.y + Math.cos(clock.elapsedTime * p.speed + p.offset) * 0.8,
        p.z
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#C6A85A" transparent opacity={0.6} />
    </instancedMesh>
  );
}

/* ─── Cubo wireframe 3D flutuante no fundo ─── */
function FloatingGeometry({
  position,
  rotSpeed = [0.1, 0.15, 0.05],
  scale = 1,
  opacity = 0.15,
}: {
  position: [number, number, number];
  rotSpeed?: [number, number, number];
  scale?: number;
  opacity?: number;
}) {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    mesh.current.rotation.x += rotSpeed[0] * delta;
    mesh.current.rotation.y += rotSpeed[1] * delta;
    mesh.current.rotation.z += rotSpeed[2] * delta;
  });

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#C6A85A" wireframe transparent opacity={opacity} />
    </mesh>
  );
}

/* ─── Câmera que segue o mouse suavemente ─── */
function MouseCamera() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * -2;
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame(() => {
    // Lerp suave para o mouse atual
    target.current.x += (mouse.current.x - target.current.x) * 0.05;
    target.current.y += (mouse.current.y - target.current.y) * 0.05;
    camera.position.x = target.current.x * 0.8;
    camera.position.y = target.current.y * 0.5;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ─── Componente Exportado ─── */
export default function StarfieldCanvas() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 40%, #0a0802 0%, #0A0A0A 100%)",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 70 }}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
        dpr={isMobile ? 1 : [1, 1.5]}
      >
        {/* Campo estelar de fundo */}
        <Stars
          radius={80}
          depth={60}
          count={isMobile ? 2000 : 4000}
          factor={3}
          saturation={0.1}
          fade
          speed={0.5}
        />

        {/* Partículas douradas */}
        <GoldDust count={isMobile ? 30 : 80} />

        {/* Geometrias wireframe no fundo */}
        <FloatingGeometry position={[5, 2, -6]} rotSpeed={[0.05, 0.1, 0.03]} scale={1.8} opacity={0.12} />
        <FloatingGeometry position={[-6, -3, -8]} rotSpeed={[0.08, 0.06, 0.1]} scale={2.5} opacity={0.08} />
        <FloatingGeometry position={[3, -5, -4]} rotSpeed={[0.12, 0.04, 0.08]} scale={1.2} opacity={0.1} />
        <FloatingGeometry position={[-4, 4, -10]} rotSpeed={[0.03, 0.12, 0.06]} scale={3} opacity={0.06} />

        {/* Câmera segue o mouse */}
        {!isMobile && <MouseCamera />}
      </Canvas>
    </div>
  );
}
