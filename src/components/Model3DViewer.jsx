import { Suspense, Component } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Bounds, Center, Html } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box, Download, Rotate3d } from 'lucide-react';

const MODEL_COLOR = '#b39ddb';

function extOf(url) {
  return (url || '').split('?')[0].split('#')[0].split('.').pop().toLowerCase();
}

function StlModel({ url }) {
  const geom = useLoader(STLLoader, url);
  geom.computeVertexNormals();
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color={MODEL_COLOR} roughness={0.55} metalness={0.1} />
    </mesh>
  );
}

function PlyModel({ url }) {
  const geom = useLoader(PLYLoader, url);
  geom.computeVertexNormals();
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color={MODEL_COLOR} roughness={0.55} metalness={0.1} flatShading />
    </mesh>
  );
}

function ObjModel({ url }) {
  const obj = useLoader(OBJLoader, url);
  return <primitive object={obj} />;
}

function ThreeMfModel({ url }) {
  const obj = useLoader(ThreeMFLoader, url);
  return <primitive object={obj} />;
}

function GltfModel({ url }) {
  const gltf = useLoader(GLTFLoader, url);
  return <primitive object={gltf.scene} />;
}

function ModelSwitch({ url, ext }) {
  switch (ext) {
    case 'stl': return <StlModel url={url} />;
    case 'ply': return <PlyModel url={url} />;
    case 'obj': return <ObjModel url={url} />;
    case '3mf': return <ThreeMfModel url={url} />;
    case 'glb':
    case 'gltf': return <GltfModel url={url} />;
    default: return null;
  }
}

// Any load/parse failure falls back to a download card instead of crashing.
class ViewerErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

function DownloadCard({ url, note, embedded }) {
  const name = decodeURIComponent((url || '').split('/').pop() || '3D model');
  return (
    <div className={`${embedded ? 'w-full h-full' : 'aspect-[4/5] rounded-2xl border border-border-subtle'} bg-bg-card flex flex-col items-center justify-center gap-3 p-6 text-center`}>
      <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
        <Box size={26} className="text-accent" />
      </div>
      <div>
        <p className="text-white text-sm font-semibold">Interactive preview not available</p>
        <p className="text-text-muted text-xs mt-0.5 break-all">{note || name}</p>
      </div>
    </div>
  );
}

export default function Model3DViewer({ url }) {
  if (!url) return null;
  const ext = extOf(url);
  const previewable = ['stl', 'obj', '3mf', 'glb', 'gltf', 'ply'].includes(ext);

  // Formats we can't render in-browser (e.g. .step, .zip) → download only.
  if (!previewable) {
    return <DownloadCard url={url} note={`.${ext.toUpperCase()} file`} />;
  }

  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-bg-card border-2 border-border">
      <ViewerErrorBoundary fallback={<DownloadCard url={url} />}>
        <Canvas camera={{ position: [0, 0, 120], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.75} />
          <directionalLight position={[10, 12, 8]} intensity={1.3} />
          <directionalLight position={[-8, -4, -10]} intensity={0.4} />
          <Suspense
            fallback={
              <Html center>
                <div className="flex flex-col items-center gap-2 text-text-muted">
                  <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                  <span className="text-xs">Loading 3D…</span>
                </div>
              </Html>
            }
          >
            <Bounds fit clip observe margin={1.25}>
              <Center>
                <ModelSwitch url={url} ext={ext} />
              </Center>
            </Bounds>
          </Suspense>
          <OrbitControls makeDefault enablePan={false} minDistance={10} maxDistance={600} />
        </Canvas>
      </ViewerErrorBoundary>

      {/* Hint */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full glass text-white/80 text-[11px] font-medium pointer-events-none">
        <Rotate3d size={12} /> Drag to rotate
      </div>
    </div>
  );
}
