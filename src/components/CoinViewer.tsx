import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CoinSettings, generateCoinGeometry } from '../lib/coinGenerator';
import { Loader2 } from 'lucide-react';

interface CoinViewerProps {
  imageSrc: string;
  settings: CoinSettings;
  useAdvancedMaterials: boolean;
  onGeometryGenerated?: (geometry: THREE.BufferGeometry) => void;
}

export const CoinViewer: React.FC<CoinViewerProps> = ({
  imageSrc,
  settings,
  useAdvancedMaterials,
  onGeometryGenerated,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading]         = useState(true);
  const [loadingText, setLoadingText] = useState('Sculpting 3D Coin...');
  const [error, setError]             = useState<string | null>(null);
  const [warnings, setWarnings]       = useState<string[]>([]);

  const rafIdRef     = useRef<number>(0);
  const abortCtrlRef = useRef<AbortController | null>(null);

  // Stable ref for the optional callback — avoids re-triggering the geometry
  // effect every time the parent re-renders with a new function reference.
  const onGeomRef = useRef(onGeometryGenerated);
  useEffect(() => { onGeomRef.current = onGeometryGenerated; }, [onGeometryGenerated]);

  const sceneRef = useRef<{
    scene:    THREE.Scene;
    camera:   THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    mesh:     THREE.Mesh | null;
  } | null>(null);

  // ── Scene init — runs once ─────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene  = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1, 50000, // far plane large enough for 425mm plaques at auto-fit distance
    );
    camera.position.set(0, 0, 80);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    // ── Lighting ──────────────────────────────────────────────────────────────
    // CRITICAL: lights must be FIXED in world space, NOT follow the camera.
    // Relief is only visible when light rakes across the surface at an angle.
    // If the main light follows the camera, the surface always looks flat.

    // Soft ambient — lifts shadows so dark areas aren't pure black
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    // Primary raking light — upper-left, creates shadows that reveal relief
    const keyLight = new THREE.DirectionalLight(0xfff8e7, 3.0);
    keyLight.position.set(-50, 60, 50);
    keyLight.castShadow = false;
    scene.add(keyLight);

    // Secondary fill — lower-right, softer, prevents pure black shadows
    const fillLight = new THREE.DirectionalLight(0xddeeff, 1.0);
    fillLight.position.set(50, -30, 40);
    scene.add(fillLight);

    // Rim light — back edge highlight, helps define coin silhouette
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(0, 0, -100);
    scene.add(rimLight);

    // Top light — adds definition to the top edge
    const topLight = new THREE.DirectionalLight(0xffffff, 0.4);
    topLight.position.set(0, 80, 0);
    scene.add(topLight);

    sceneRef.current = { scene, camera, renderer, controls, mesh: null };

    // Animate loop — store RAF id so it can be cancelled on unmount
    const animate = () => {
      rafIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ResizeObserver handles both window resize and container resize (e.g. panel drag)
    const ro = new ResizeObserver(() => {
      if (!sceneRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      sceneRef.current.camera.aspect = w / h;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(w, h);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      if (abortCtrlRef.current) abortCtrlRef.current.abort();
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement);
    };
  }, []); // intentionally empty — scene initialised once

  // ── Geometry generation — re-runs when inputs change ──────────────────────
  useEffect(() => {
    if (!sceneRef.current || !imageSrc) return;

    if (abortCtrlRef.current) abortCtrlRef.current.abort();
    abortCtrlRef.current = new AbortController();
    const { signal } = abortCtrlRef.current;

    setLoading(true);
    setError(null);
    setWarnings([]);

    const run = async () => {
      try {
        const geometry = await generateCoinGeometry(
          imageSrc,
          settings,
          (w)   => { if (!signal.aborted) setWarnings(w); },
          (msg) => { if (!signal.aborted) setLoadingText(msg); },
          signal,
        );

        if (signal.aborted) return;

        const { scene, mesh: oldMesh } = sceneRef.current!;

        // Dispose old mesh
        if (oldMesh) {
          scene.remove(oldMesh);
          oldMesh.geometry.dispose();
          const mats = Array.isArray(oldMesh.material) ? oldMesh.material : [oldMesh.material];
          mats.forEach(m => m.dispose());
        }

        // Build materials
        // Always use MeshStandardMaterial — it responds correctly to the fixed
        // directional lights and shows relief through specular highlights.
        // MeshPhongMaterial with following-camera lights looked flat.
        const makeMat = (mat: CoinSettings['rimMaterial']) =>
          new THREE.MeshStandardMaterial({
            color:     new THREE.Color(useAdvancedMaterials ? mat.color : '#aaaaaa'),
            metalness: useAdvancedMaterials ? mat.metallic  : 0.3,
            roughness: useAdvancedMaterials ? mat.roughness : 0.6,
            side:      THREE.FrontSide, // DoubleSide not needed and doubles shading cost
          });

        const mesh = new THREE.Mesh(geometry, [
          makeMat(settings.rimMaterial),
          makeMat(settings.faceMaterial),
          makeMat(settings.backMaterial),
        ]);

        scene.add(mesh);
        sceneRef.current!.mesh = mesh;

        // ── Auto-fit camera to coin size ──────────────────────────────────────
        // Compute bounding sphere so the full coin is always in frame regardless
        // of diameter (pocket coin = 39mm, large plaque = 425mm).
        geometry.computeBoundingSphere();
        const bs = geometry.boundingSphere!;
        const fovRad = (sceneRef.current!.camera.fov * Math.PI) / 180;
        const aspect = sceneRef.current!.camera.aspect;
        const fitFov = Math.min(fovRad, fovRad * aspect); // account for portrait viewports
        const camDist = (bs.radius * 2.2) / Math.tan(fitFov / 2);

        // Keep near/far planes well outside the geometry at any size
        sceneRef.current!.camera.near = camDist * 0.001;
        sceneRef.current!.camera.far  = camDist * 10;
        sceneRef.current!.camera.updateProjectionMatrix();

        // For plaques / large designs → straight front-on view (no tilt)
        // For coins → slight tilt so rim depth is visible
        const isLarge = settings.type === 'plaque' || settings.diameter >= 150;
        const tiltY = isLarge ? 0 : bs.radius * 0.15;

        sceneRef.current!.camera.position.set(0, tiltY, camDist);
        sceneRef.current!.camera.lookAt(0, 0, 0);
        sceneRef.current!.controls.target.set(0, 0, 0);
        sceneRef.current!.controls.update();

        if (!signal.aborted) onGeomRef.current?.(geometry);
      } catch (err) {
        if (signal.aborted) return;
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to generate 3D model.');
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    run();
  // onGeometryGenerated intentionally omitted — accessed via ref
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc, settings, useAdvancedMaterials]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 shadow-2xl">
      <div ref={containerRef} className="w-full h-full" />

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-neutral-300 font-medium">{loadingText}</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 p-6 text-center">
          <p className="text-red-400 font-medium mb-2">Error</p>
          <p className="text-neutral-300 text-sm">{error}</p>
        </div>
      )}

      {warnings.length > 0 && !loading && !error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-20 pointer-events-none">
          <div className="bg-orange-500/10 backdrop-blur-md border border-orange-500/20 rounded-xl p-3 shadow-2xl">
            <p className="text-[10px] font-bold uppercase text-orange-400 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Image Quality Warning
            </p>
            <ul className="space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className="text-xs text-orange-200/80 leading-snug">• {w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] text-neutral-400 uppercase tracking-widest pointer-events-none">
        Interactive 3D Preview
      </div>
    </div>
  );
};