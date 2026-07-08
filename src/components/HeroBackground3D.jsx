import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, CanvasTexture } from 'three';

const reduceMotion = typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Soft radial dot → glowing point sprite.
function makeDotTexture() {
  const s = 64;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,180,120,0.85)');
  g.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return new CanvasTexture(c);
}

// A sphere of shining points, slowly drifting.
function PointSphere() {
  const ref = useRef();
  const { geometry, texture } = useMemo(() => {
    const N = 1600;
    const R = 2.5;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const positions = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const jitter = 0.9 + Math.random() * 0.2; // slight shell thickness
      positions[i * 3] = Math.cos(theta) * r * R * jitter;
      positions[i * 3 + 1] = y * R * jitter;
      positions[i * 3 + 2] = Math.sin(theta) * r * R * jitter;
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return { geometry: geo, texture: makeDotTexture() };
  }, []);

  useFrame((_, delta) => {
    if (reduceMotion || !ref.current) return;
    ref.current.rotation.y += delta * 0.08;
    ref.current.rotation.x += delta * 0.02;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.16}
        map={texture}
        color="#ffb27a"
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

export default function HeroBackground3D() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <PointSphere />
    </Canvas>
  );
}
