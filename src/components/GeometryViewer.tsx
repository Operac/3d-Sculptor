// ────────────────────────────────────────────────────────────────────────────
// GeometryViewer — renders a pre-built BufferGeometry (no internal generation).
// Used by template mode: the merged template+portrait geometry is built outside
// and passed in.  Mirrors the CoinViewer's lighting and camera setup so the
// look matches between modes.
// ────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface GeometryViewerProps {
  /** The geometry to render (already built, in mm).  Pass null to clear. */
  geometry: THREE.BufferGeometry | null;
  /** Material color (hex like '#FFD700') */
  color?: string;
  metalness?: number;
  roughness?: number;
  /** Loading message shown when geometry is null */
  loadingMessage?: string;
}

export const GeometryViewer: React.FC<GeometryViewerProps> = ({
  geometry,
  color = '#aaaaaa',
  metalness = 0.7,
  roughness = 0.35,
  loadingMessage = 'Waiting for inputs…',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene:    THREE.Scene;
    camera:   THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    mesh:     THREE.Mesh | null;
  } | null>(null);
  const rafIdRef = useRef<number>(0);

  // Init scene once
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(
      45, container.clientWidth / container.clientHeight, 0.1, 50000,
    );
    camera.position.set(0, 0, 80);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const key  = new THREE.DirectionalLight(0xfff8e7, 3.0); key.position.set(-50, 60, 50); scene.add(key);
    const fill = new THREE.DirectionalLight(0xddeeff, 1.0); fill.position.set(50, -30, 40); scene.add(fill);
    const rim  = new THREE.DirectionalLight(0xffffff, 0.6); rim.position.set(0, 0, -100); scene.add(rim);
    const top  = new THREE.DirectionalLight(0xffffff, 0.4); top.position.set(0, 80, 0); scene.add(top);

    sceneRef.current = { scene, camera, renderer, controls, mesh: null };

    const animate = () => {
      rafIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

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
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  // Update mesh when geometry, color, or material props change
  useEffect(() => {
    if (!sceneRef.current) return;
    const { scene, camera, controls, mesh: oldMesh } = sceneRef.current;

    if (oldMesh) {
      scene.remove(oldMesh);
      oldMesh.geometry.dispose();
      const mats = Array.isArray(oldMesh.material) ? oldMesh.material : [oldMesh.material];
      mats.forEach(m => m.dispose());
    }
    sceneRef.current.mesh = null;

    if (!geometry) return;

    const material = new THREE.MeshStandardMaterial({
      color:     new THREE.Color(color),
      metalness,
      roughness,
      side:      THREE.FrontSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    sceneRef.current.mesh = mesh;

    // Auto-fit camera to the geometry's bounding sphere.
    geometry.computeBoundingSphere();
    const sphere = geometry.boundingSphere;
    if (sphere) {
      const fov = camera.fov * (Math.PI / 180);
      const dist = sphere.radius / Math.sin(fov / 2) * 1.4;
      camera.position.set(sphere.center.x, sphere.center.y, sphere.center.z + dist);
      camera.lookAt(sphere.center);
      controls.target.copy(sphere.center);
      controls.update();
    }
  }, [geometry, color, metalness, roughness]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {!geometry && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-neutral-400 text-sm pointer-events-none">
          {loadingMessage}
        </div>
      )}
    </div>
  );
};
