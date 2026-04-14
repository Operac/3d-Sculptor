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

export const CoinViewer: React.FC<CoinViewerProps> = ({ imageSrc, settings, useAdvancedMaterials, onGeometryGenerated }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    mesh: THREE.Mesh | null;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 80);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(1, 1, 2);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0xffffff, 0.8);
    fillLight.position.set(-5, -5, 5);
    scene.add(fillLight);

    sceneRef.current = { scene, camera, renderer, controls, mesh: null };

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      // Keep directional light following camera for consistent highlights
      mainLight.position.copy(camera.position);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const { camera, renderer } = sceneRef.current;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const updateMesh = async () => {
      if (!sceneRef.current || !imageSrc) return;
      
      setLoading(true);
      setError(null);

      try {
        const geometry = await generateCoinGeometry(imageSrc, settings);
        
        if (sceneRef.current.mesh) {
          sceneRef.current.scene.remove(sceneRef.current.mesh);
          sceneRef.current.mesh.geometry.dispose();
          if (Array.isArray(sceneRef.current.mesh.material)) {
            sceneRef.current.mesh.material.forEach(m => m.dispose());
          } else {
            sceneRef.current.mesh.material.dispose();
          }
        }

        const createMaterial = (mat: any) => {
          if (useAdvancedMaterials) {
            return new THREE.MeshStandardMaterial({
              color: new THREE.Color(mat.color),
              metalness: mat.metallic,
              roughness: mat.roughness,
              side: THREE.DoubleSide,
            });
          } else {
            // Use a neutral "clay" gray when advanced materials are off
            return new THREE.MeshPhongMaterial({
              color: new THREE.Color('#888888'),
              shininess: 30,
              side: THREE.DoubleSide,
            });
          }
        };

        const materials = [
          createMaterial(settings.rimMaterial),
          createMaterial(settings.faceMaterial),
          createMaterial(settings.backMaterial),
        ];

        const mesh = new THREE.Mesh(geometry, materials);
        sceneRef.current.scene.add(mesh);
        sceneRef.current.mesh = mesh;

        if (onGeometryGenerated) {
          onGeometryGenerated(geometry);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to generate 3D model. Please check the image format.');
      } finally {
        setLoading(false);
      }
    };

    updateMesh();
  }, [imageSrc, settings, useAdvancedMaterials, onGeometryGenerated]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 shadow-2xl">
      <div ref={containerRef} className="w-full h-full" />
      
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-neutral-300 font-medium">Sculpting 3D Coin...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 p-6 text-center">
          <p className="text-red-400 font-medium mb-2">Error</p>
          <p className="text-neutral-300">{error}</p>
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] text-neutral-400 uppercase tracking-widest pointer-events-none">
        Interactive 3D Preview
      </div>
    </div>
  );
};
