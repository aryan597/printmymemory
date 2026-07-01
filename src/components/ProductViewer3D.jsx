import { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center, Html } from '@react-three/drei';
import { Loader2, RotateCcw, Maximize2 } from 'lucide-react';

function Model({ url }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <Loader2 size={24} className="animate-spin text-accent" />
        <p className="text-text-muted text-xs whitespace-nowrap">Loading 3D model...</p>
      </div>
    </Html>
  );
}

export default function ProductViewer3D({ modelUrl, className = '' }) {
  const controlsRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const resetCamera = () => {
    controlsRef.current?.reset();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!modelUrl) return null;

  return (
    <div
      ref={containerRef}
      className={`relative bg-bg-elevated rounded-2xl overflow-hidden border border-border-subtle ${className}`}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <Environment preset="city" />

        {/* Model */}
        <Suspense fallback={<LoadingFallback />}>
          <Model url={modelUrl} />
        </Suspense>

        {/* Controls */}
        <OrbitControls
          ref={controlsRef}
          enableZoom
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.5}
          minDistance={1}
          maxDistance={8}
        />
      </Canvas>

      {/* Overlay controls */}
      <div className="absolute bottom-3 right-3 flex gap-2" aria-label="3D viewer controls">
        <button
          onClick={resetCamera}
          className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/70 hover:text-white transition-colors"
          title="Reset view"
          aria-label="Reset camera"
        >
          <RotateCcw size={14} />
        </button>
        <button
          onClick={toggleFullscreen}
          className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/70 hover:text-white transition-colors"
          title="Fullscreen"
          aria-label="Toggle fullscreen"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Hint */}
      <div className="absolute bottom-3 left-3 text-[10px] text-white/40 font-medium select-none">
        Drag to rotate · Scroll to zoom
      </div>
    </div>
  );
}
