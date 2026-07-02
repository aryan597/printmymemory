import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useProgress, PointerLockControls, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, N8AO } from '@react-three/postprocessing';
import * as THREE from 'three';

const MODEL_URL = '/models/shop.glb';
const WHATSAPP = '919471725271';
const EYE = 1.6;
const SPEED = 3.2;
const RADIUS = 0.35;

// ---- simple AABB colliders (x1, y1, x2, y2 in Blender floor-plan coords) ----
const COLLIDERS = [
  [-7.3, -4.75, -1.0, -4.45], // front wall left (window + pillars)
  [1.0, -4.75, 7.3, -4.45],   // front wall right
  [-7.3, 4.4, 7.3, 4.8],      // back wall
  [-7.3, -4.75, -6.9, 4.6],   // left wall
  [6.9, -4.75, 7.3, 4.6],     // right wall
  [-5.85, -1.1, -4.65, 4.1],  // aisle 1
  [-2.35, -1.1, -1.15, 4.1],  // aisle 2
  [1.15, -1.1, 2.35, 4.1],    // aisle 3
  [4.65, -1.1, 5.85, 4.1],    // aisle 4
  [3.7, -2.9, 5.5, -1.9],     // printer table
  [-5.95, -3.75, -5.25, -3.05], // kiosk
];
const BOUNDS = { minX: -13.5, maxX: 13.5, minY: -15.0, maxY: 4.3 };

function collides(x, y) {
  if (x < BOUNDS.minX || x > BOUNDS.maxX || y < BOUNDS.minY || y > BOUNDS.maxY) return true;
  for (const [x1, y1, x2, y2] of COLLIDERS) {
    if (x > x1 - RADIUS && x < x2 + RADIUS && y > y1 - RADIUS && y < y2 + RADIUS) return true;
  }
  return false;
}

function prettyName(nodeName) {
  const base = nodeName.replace(/^PRODUCT_/, '').replace(/\.\d+$/, '');
  return base.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const CATEGORY_INFO = [
  {
    re: /dog|cat-|bird|rabbit|fish|elephant|dino/,
    category: 'Pets & Animals',
    price: 449,
    blurb: 'A charming animal miniature, 3D printed layer by layer in premium PLA+. A lovely gift for pet parents — or send us a photo of YOUR pet and we\'ll sculpt a custom miniature.',
  },
  {
    re: /anime|knight|wizard|dragon|robot|bust|trophy|chess/,
    category: 'Figurines',
    price: 499,
    blurb: 'Collectible figurine printed in high-detail resin-smooth finish. Display-ready out of the box. Custom characters and poses available on request.',
  },
  {
    re: /phone|lamp-desk|pen-holder|cable|keychain|retro-car|plane-|rocket/,
    category: 'Desk & Tech',
    price: 349,
    blurb: 'Functional desk gear that actually gets used daily. Printed strong in PETG/PLA+ with clean tolerances. Custom colors available with our AMS multi-color system.',
  },
  {
    re: /kitchen|bag-clip|bottle|wall-hook|coaster|toothbrush|soap|vase|planter|potted|cardboard|lithophane/,
    category: 'Kitchen & Home',
    price: 399,
    blurb: 'Practical home upgrades, printed to order. Food-adjacent items use food-safe PLA. Pick your colors to match your space.',
  },
];

function productInfo(rawName) {
  const base = rawName.replace(/^PRODUCT_/, '').replace(/\.\d+$/, '');
  const info = CATEGORY_INFO.find((c) => c.re.test(base)) || CATEGORY_INFO[1];
  return { label: prettyName(rawName), ...info };
}

// ---------------- Scene ----------------
const CENTER = new THREE.Vector2(0, 0);

function ShopScene({ onProductHover, onProductClick, onKioskClick }) {
  const { scene } = useGLTF(MODEL_URL);
  const { camera } = useThree();
  const fanRef = useRef(null);
  const hoverTimer = useRef(0);
  const raycaster = useMemo(() => {
    const r = new THREE.Raycaster();
    r.far = 5; // only products within reach
    return r;
  }, []);

  useEffect(() => {
    const lights = [];
    const BAKED = new Set(['Floor', 'Ceiling', 'Wall_Back', 'Wall_Left', 'Wall_Right']);
    scene.traverse((o) => {
      if (o.isLight) lights.push(o); // Blender-exported lights are way too strong in three.js
      if (o.isMesh) {
        o.castShadow = false;
        o.receiveShadow = false;
        if (BAKED.has(o.name)) {
          // lighting is baked into the texture - render it as-is, untouched by runtime lights
          o.material = new THREE.MeshBasicMaterial({ map: o.material.map });
        }
        if (o.name.startsWith('Kiosk_')) o.userData.kiosk = true;
        let p = o;
        while (p && !p.name.startsWith('PRODUCT_')) p = p.parent;
        if (p) o.userData.productName = p.name;
      }
      if (o.name === 'Fan_Root') fanRef.current = o;
    });
    lights.forEach((l) => l.parent?.remove(l));
  }, [scene]);

  const raycastCenter = useCallback(() => {
    raycaster.setFromCamera(CENTER, camera);
    const hits = raycaster.intersectObjects(scene.children, true);
    for (const h of hits) {
      if (h.object.userData.productName) return { kind: 'product', name: h.object.userData.productName };
      if (h.object.userData.kiosk) return { kind: 'kiosk' };
      if (h.object.isMesh) return null; // something solid blocks the view first
    }
    return null;
  }, [raycaster, camera, scene]);

  useEffect(() => {
    const onClick = () => {
      if (!document.pointerLockElement) return;
      const hit = raycastCenter();
      if (hit?.kind === 'product') onProductClick(hit.name);
      else if (hit?.kind === 'kiosk') onKioskClick();
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [raycastCenter, onProductClick, onKioskClick]);

  useFrame((_, dt) => {
    if (fanRef.current) fanRef.current.rotation.y += dt * 5; // glTF is Y-up
    hoverTimer.current += dt;
    if (hoverTimer.current > 0.12) {
      hoverTimer.current = 0;
      if (document.pointerLockElement) {
        const hit = raycastCenter();
        if (hit?.kind === 'product') onProductHover(prettyName(hit.name));
        else if (hit?.kind === 'kiosk') onProductHover('Order Tracking Kiosk');
        else onProductHover(null);
      }
    }
  });

  return <primitive object={scene} />;
}

// ---------------- Player movement ----------------
function Player({ enabled }) {
  const { camera } = useThree();
  const keys = useRef({});

  useEffect(() => {
    camera.position.set(0, EYE, 10.5); // start on the street
    const dn = (e) => (keys.current[e.code] = true);
    const up = (e) => (keys.current[e.code] = false);
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', dn);
      window.removeEventListener('keyup', up);
    };
  }, [camera]);

  useFrame((_, dt) => {
    if (!enabled.current) return;
    const k = keys.current;
    const fwd = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
    const strafe = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0);
    if (!fwd && !strafe) return;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0; dir.normalize();
    const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));
    const move = dir.multiplyScalar(fwd).add(side.multiplyScalar(strafe)).normalize().multiplyScalar(SPEED * dt);
    const nx = camera.position.x + move.x;
    const nz = camera.position.z + move.z;
    if (!collides(nx, -nz)) {
      camera.position.x = nx;
      camera.position.z = nz;
    } else if (!collides(nx, -camera.position.z)) {
      camera.position.x = nx;
    } else if (!collides(camera.position.x, -nz)) {
      camera.position.z = nz;
    }
    camera.position.y = EYE;
  });
  return null;
}

// ---------------- Product detail viewer ----------------
function ProductViewer({ rawName }) {
  const { scene } = useGLTF(MODEL_URL);
  const obj = useMemo(() => {
    const src = scene.getObjectByName(rawName);
    if (!src) return null;
    const clone = src.clone(true);
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);
    const group = new THREE.Group();
    group.add(clone);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    group.scale.setScalar(1.5 / Math.max(size.x, size.y, size.z, 1e-6));
    return group;
  }, [scene, rawName]);

  if (!obj) return null;
  return (
    <Canvas camera={{ position: [1.4, 0.9, 1.6], fov: 40 }} gl={{ antialias: true }}>
      <color attach="background" args={['#101018']} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 2]} intensity={1.4} />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#aaccff" />
      <primitive object={obj} />
      <OrbitControls autoRotate autoRotateSpeed={2.5} enablePan={false} minDistance={0.8} maxDistance={4} />
    </Canvas>
  );
}

function ProductModal({ rawName, onClose }) {
  const navigate = useNavigate();
  const info = productInfo(rawName);
  const waText = encodeURIComponent(
    `Hi PrintMyMemory! I was browsing your 3D shop and I'd like to order: ${info.label} (${info.category}). Please share colors & sizes available.`
  );

  useEffect(() => {
    document.exitPointerLock?.();
  }, []);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-4xl h-[80%] rounded-2xl bg-[#12121a] border border-white/10 overflow-hidden flex flex-col md:flex-row">
        {/* 3D viewer */}
        <div className="flex-1 min-h-[300px] relative">
          <ProductViewer rawName={rawName} />
          <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/40 text-xs pointer-events-none">
            drag to rotate · scroll to zoom
          </p>
        </div>
        {/* details */}
        <div className="w-full md:w-80 p-6 flex flex-col text-white border-t md:border-t-0 md:border-l border-white/10">
          <span className="self-start px-2.5 py-1 rounded-full bg-pink-500/15 text-pink-300 text-xs mb-3">
            {info.category}
          </span>
          <h2 className="text-2xl font-semibold mb-2">{info.label}</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-4">{info.blurb}</p>
          <ul className="text-white/50 text-sm space-y-1.5 mb-6">
            <li>• Printed to order in Bangalore</li>
            <li>• PLA+ / PETG, multi-color AMS available</li>
            <li>• Sizes: 10 cm / 15 cm / custom</li>
            <li>• Free shipping on orders over ₹999</li>
          </ul>
          <p className="text-3xl font-bold mb-5">
            From ₹{info.price}
          </p>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${waText}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 transition-colors text-center text-sm font-semibold"
          >
            Order on WhatsApp
          </a>
          <button
            className="w-full py-2.5 mt-2 rounded-xl bg-pink-500/90 hover:bg-pink-400 transition-colors text-sm"
            onClick={() => navigate('/customize')}
          >
            Customize this print
          </button>
          <button
            className="w-full py-2.5 mt-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm"
            onClick={onClose}
          >
            ← Back to the shop
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Loading screen ----------------
function LoadingScreen() {
  const { progress, active } = useProgress();
  if (!active && progress >= 100) return null;
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#0a0a12]">
      <p className="text-4xl md:text-6xl text-pink-400 italic mb-6" style={{ fontFamily: 'cursive' }}>
        Print My Memory
      </p>
      <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-pink-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-3 text-white/50 text-sm">Opening the shop… {Math.round(progress)}%</p>
    </div>
  );
}

// ---------------- Page ----------------
export default function Shop3D() {
  const navigate = useNavigate();
  const [locked, setLocked] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null); // raw PRODUCT_ node name
  const [muted, setMuted] = useState(false);
  const enabledRef = useRef(false);
  const audioRef = useRef(null);

  const hour = new Date().getHours();
  const isNight = hour >= 19 || hour < 6;
  const isClosed = hour >= 0 && hour < 5;

  useEffect(() => {
    const a = new Audio('/audio/ambience.mp3');
    a.loop = true;
    a.volume = 0.35;
    audioRef.current = a;
    return () => a.pause();
  }, []);

  useEffect(() => {
    enabledRef.current = locked && !selected;
    const a = audioRef.current;
    if (!a) return;
    if (locked && !muted) a.play().catch(() => {});
    else if (!locked && !selected) a.pause();
  }, [locked, muted, selected]);

  const skyColor = isNight ? '#070a18' : '#87b5d9';

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 64px)' }}>
      <Canvas
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ fov: 70, near: 0.1, far: 80 }}
      >
        <color attach="background" args={[skyColor]} />
        <fog attach="fog" args={[skyColor, 25, 70]} />
        <ambientLight intensity={isNight ? 0.3 : 0.7} color={isNight ? '#8899ff' : '#ffffff'} />
        <directionalLight
          position={[6, 12, 8]}
          intensity={isNight ? 0.15 : 1.0}
          color={isNight ? '#aabbff' : '#fff2dd'}
        />
        {[[-4, 2], [0, 2], [4, 2], [-4, -2.5], [0, -2.5], [4, -2.5]].map(([x, z], i) => (
          <pointLight key={i} position={[x, 3.3, z]} intensity={14} distance={9} decay={2} color="#ffe0bb" />
        ))}
        {isNight && [[-8, 8.5], [0, 8.5], [8, 8.5]].map(([x, z], i) => (
          <pointLight key={`s${i}`} position={[x, 4.2, z]} intensity={20} distance={12} decay={2} color="#ffcc88" />
        ))}
        <Suspense fallback={null}>
          <ShopScene
            onProductHover={setHovered}
            onProductClick={setSelected}
            onKioskClick={() => { document.exitPointerLock?.(); navigate('/orders'); }}
          />
        </Suspense>
        <Player enabled={enabledRef} />
        {!selected && <PointerLockControls onLock={() => setLocked(true)} onUnlock={() => setLocked(false)} />}
        <EffectComposer>
          <N8AO aoRadius={0.4} intensity={2.5} distanceFalloff={1} />
          <Bloom luminanceThreshold={1.2} intensity={0.5} mipmapBlur />
          <Vignette eskil={false} offset={0.15} darkness={0.7} />
        </EffectComposer>
      </Canvas>

      <LoadingScreen />

      {/* beta badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 text-white/80 text-xs pointer-events-none">
        <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-black font-bold text-[10px]">BETA</span>
        Print My Memory · 3D Shop
      </div>

      {locked && !selected && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div className={`w-1.5 h-1.5 rounded-full ${hovered ? 'bg-pink-400 scale-150' : 'bg-white/70'} transition-transform`} />
        </div>
      )}

      {locked && hovered && !selected && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-black/70 text-white text-sm pointer-events-none">
          {hovered} — click to view
        </div>
      )}

      {!locked && !selected && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 cursor-pointer"
          onClick={(e) => e.currentTarget.parentElement.querySelector('canvas')?.requestPointerLock?.()}
        >
          <p className="text-3xl md:text-5xl text-pink-400 italic mb-4" style={{ fontFamily: 'cursive' }}>
            Print My Memory
          </p>
          {isClosed && (
            <p className="text-amber-300 mb-3 text-sm">
              Psst… it&apos;s past midnight, we&apos;re technically closed. But come on in.
            </p>
          )}
          <p className="text-white/80">Click to enter the shop</p>
          <p className="text-white/40 text-sm mt-2">WASD / arrows to walk · mouse to look · Esc to leave</p>
        </div>
      )}

      {selected && <ProductModal rawName={selected} onClose={() => setSelected(null)} />}

      <button
        className="absolute bottom-6 right-6 z-20 px-3 py-2 rounded-full bg-black/60 text-white/80 text-sm"
        onClick={() => setMuted((m) => !m)}
      >
        {muted ? '🔇 Sound off' : '🔊 Sound on'}
      </button>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
