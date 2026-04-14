import * as THREE from 'three';

export type ModelType = 'coin' | 'plaque';
export type ReliefStyle = 'elevated' | 'embedded';
export type MaterialType = 'gold' | 'silver' | 'bronze' | 'custom';

export interface MaterialSettings {
  type: MaterialType;
  metallic: number;
  roughness: number;
  color: string;
}

export interface CoinSettings {
  type: ModelType;
  reliefStyle: ReliefStyle;
  diameter: number;
  baseHeight: number;
  rimWidth: number;
  rimHeight: number;
  fieldRecess: number;
  maxRelief: number;
  segments: number;
  gridResolution: number;
  isDoubleFaced: boolean;
  showRim: boolean;
  surfaceNoise: number;
  material: MaterialSettings;
  useSeparateMaterials: boolean;
  rimMaterial: MaterialSettings;
  faceMaterial: MaterialSettings;
  backMaterial: MaterialSettings;
}

export const COIN_PRESET: CoinSettings = {
  type: 'coin',
  reliefStyle: 'elevated',
  diameter: 39,
  baseHeight: 1.2,
  rimWidth: 1.0,
  rimHeight: 0.8,
  fieldRecess: 0.4,
  maxRelief: 1.0,
  segments: 128,
  gridResolution: 512,
  isDoubleFaced: true,
  showRim: true,
  surfaceNoise: 0.05,
  material: {
    type: 'gold',
    metallic: 0.9,
    roughness: 0.2,
    color: '#FFD700',
  },
  useSeparateMaterials: false,
  rimMaterial: { type: 'gold', metallic: 0.9, roughness: 0.2, color: '#FFD700' },
  faceMaterial: { type: 'gold', metallic: 0.9, roughness: 0.2, color: '#FFD700' },
  backMaterial: { type: 'gold', metallic: 0.9, roughness: 0.2, color: '#FFD700' },
};

export const PLAQUE_PRESET: CoinSettings = {
  type: 'plaque',
  reliefStyle: 'elevated',
  diameter: 150,
  baseHeight: 4.0,
  rimWidth: 8.0,
  rimHeight: 2.5,
  fieldRecess: 0.0,
  maxRelief: 3.0,
  segments: 256,
  gridResolution: 512,
  isDoubleFaced: false,
  showRim: true,
  surfaceNoise: 0.1,
  material: {
    type: 'bronze',
    metallic: 0.8,
    roughness: 0.4,
    color: '#CD7F32',
  },
  useSeparateMaterials: false,
  rimMaterial: { type: 'bronze', metallic: 0.8, roughness: 0.4, color: '#CD7F32' },
  faceMaterial: { type: 'bronze', metallic: 0.8, roughness: 0.4, color: '#CD7F32' },
  backMaterial: { type: 'bronze', metallic: 0.8, roughness: 0.4, color: '#CD7F32' },
};

export const LARGE_PLAQUE_PRESET: CoinSettings = {
  type: 'plaque',
  reliefStyle: 'elevated',
  diameter: 425,
  baseHeight: 6.0,
  rimWidth: 15.0,
  rimHeight: 4.0,
  fieldRecess: 0.0,
  maxRelief: 10.0,
  segments: 512,
  gridResolution: 1024,
  isDoubleFaced: false,
  showRim: true,
  surfaceNoise: 0.15,
  material: {
    type: 'bronze',
    metallic: 0.8,
    roughness: 0.4,
    color: '#CD7F32',
  },
  useSeparateMaterials: false,
  rimMaterial: { type: 'bronze', metallic: 0.8, roughness: 0.4, color: '#CD7F32' },
  faceMaterial: { type: 'bronze', metallic: 0.8, roughness: 0.4, color: '#CD7F32' },
  backMaterial: { type: 'bronze', metallic: 0.8, roughness: 0.4, color: '#CD7F32' },
};

export const POCKET_2_PRESET: CoinSettings = {
  type: 'coin',
  reliefStyle: 'elevated',
  diameter: 39,
  baseHeight: 1.5,
  rimWidth: 1.5,
  rimHeight: 1.0,
  fieldRecess: 0.5,
  maxRelief: 1.2,
  segments: 128,
  gridResolution: 512,
  isDoubleFaced: true,
  showRim: true,
  surfaceNoise: 0.05,
  material: {
    type: 'silver',
    metallic: 0.9,
    roughness: 0.2,
    color: '#C0C0C0',
  },
  useSeparateMaterials: false,
  rimMaterial: { type: 'silver', metallic: 0.9, roughness: 0.2, color: '#C0C0C0' },
  faceMaterial: { type: 'silver', metallic: 0.9, roughness: 0.2, color: '#C0C0C0' },
  backMaterial: { type: 'silver', metallic: 0.9, roughness: 0.2, color: '#C0C0C0' },
};

export const DEFAULT_SETTINGS: CoinSettings = COIN_PRESET;

export async function generateCoinGeometry(
  imageSrc: string,
  settings: CoinSettings
): Promise<THREE.BufferGeometry> {
  const {
    diameter,
    baseHeight,
    rimWidth,
    rimHeight,
    fieldRecess,
    maxRelief,
    segments,
    gridResolution,
    showRim,
    surfaceNoise,
  } = settings;

  const radius = diameter / 2;
  const innerRadius = showRim ? radius - rimWidth : radius;
  const zField = baseHeight - fieldRecess;
  const zRim = showRim ? baseHeight + rimHeight : zField;

  // 1. Load image and get depth data
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const procRes = 2048; 
  canvas.width = procRes;
  canvas.height = procRes;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  
  // Center and scale image to fit square canvas while maintaining aspect ratio
  const aspect = img.width / img.height;
  let drawW = procRes;
  let drawH = procRes;
  let offsetX = 0;
  let offsetY = 0;
  
  if (aspect > 1) {
    drawH = procRes / aspect;
    offsetY = (procRes - drawH) / 2;
  } else {
    drawW = procRes * aspect;
    offsetX = (procRes - drawW) / 2;
  }
  
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, procRes, procRes);
  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  
  const imageData = ctx.getImageData(0, 0, procRes, procRes);
  const data = imageData.data;

  let depthMap = new Float32Array(procRes * procRes);
  for (let i = 0; i < data.length; i += 4) {
    const gray = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
    depthMap[i / 4] = gray;
  }

  // 1. Initial Smoothing (5x5 Box Blur) to kill sensor noise
  const initialDenoise = new Float32Array(procRes * procRes);
  for (let y = 2; y < procRes - 2; y++) {
    for (let x = 2; x < procRes - 2; x++) {
      let sum = 0;
      for (let ky = -2; ky <= 2; ky++) {
        for (let kx = -2; kx <= 2; kx++) {
          sum += depthMap[(y + ky) * procRes + (x + kx)];
        }
      }
      initialDenoise[y * procRes + x] = sum / 25;
    }
  }
  depthMap.set(initialDenoise);

  // 2. Median Filter (3x3) - 2 passes
  for (let pass = 0; pass < 2; pass++) {
    const medianFiltered = new Float32Array(procRes * procRes);
    for (let y = 1; y < procRes - 1; y++) {
      for (let x = 1; x < procRes - 1; x++) {
        const neighbors = [];
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            neighbors.push(depthMap[(y + ky) * procRes + (x + kx)]);
          }
        }
        neighbors.sort((a, b) => a - b);
        medianFiltered[y * procRes + x] = neighbors[4];
      }
    }
    depthMap.set(medianFiltered);
  }

  // 3. Median Filter (5x5) - 1 pass (Aggressive outlier removal)
  const median5x5 = new Float32Array(procRes * procRes);
  for (let y = 2; y < procRes - 2; y++) {
    for (let x = 2; x < procRes - 2; x++) {
      const neighbors = [];
      for (let ky = -2; ky <= 2; ky++) {
        for (let kx = -2; kx <= 2; kx++) {
          neighbors.push(depthMap[(y + ky) * procRes + (x + kx)]);
        }
      }
      neighbors.sort((a, b) => a - b);
      median5x5[y * procRes + x] = neighbors[12];
    }
  }
  depthMap.set(median5x5);

  // 4. Normalization (S-Curve)
  const sorted = new Float32Array(depthMap).sort();
  const p5 = sorted[Math.floor(sorted.length * 0.05)]; 
  const p98 = sorted[Math.floor(sorted.length * 0.98)];
  const range = p98 - p5 + 1e-6;

  for (let i = 0; i < depthMap.length; i++) {
    let t = Math.max(0, Math.min(1, (depthMap[i] - p5) / range));
    if (t < 0.02) t = 0;
    const scurve = t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
    depthMap[i] = scurve * 0.1 + t * 0.9; // Slightly reduced S-curve to prevent contrast spikes
  }

  // 5. Slope Limiting (Applied AFTER normalization for consistency)
  const slopeLimited = new Float32Array(procRes * procRes);
  slopeLimited.set(depthMap);
  const maxSlope = 0.01; // Very strict: max 1% depth change per pixel
  for (let y = 1; y < procRes - 1; y++) {
    for (let x = 1; x < procRes - 1; x++) {
      const idx = y * procRes + x;
      const neighbors = [
        depthMap[idx - 1],
        depthMap[idx + 1],
        depthMap[idx - procRes],
        depthMap[idx + procRes]
      ];
      let val = depthMap[idx];
      for (const n of neighbors) {
        if (val > n + maxSlope) val = n + maxSlope;
      }
      slopeLimited[idx] = val;
    }
  }
  depthMap.set(slopeLimited);

  // 5b. Second Slope Limiting Pass (Reverse order to propagate constraints fully)
  const slopeLimited2 = new Float32Array(procRes * procRes);
  slopeLimited2.set(depthMap);
  for (let y = procRes - 2; y >= 1; y--) {
    for (let x = procRes - 2; x >= 1; x--) {
      const idx = y * procRes + x;
      const neighbors = [
        depthMap[idx - 1],
        depthMap[idx + 1],
        depthMap[idx - procRes],
        depthMap[idx + procRes]
      ];
      let val = depthMap[idx];
      for (const n of neighbors) {
        if (val > n + maxSlope) val = n + maxSlope;
      }
      slopeLimited2[idx] = val;
    }
  }
  depthMap.set(slopeLimited2);

  // 6. Final Despike and Smooth
  const despiked = new Float32Array(procRes * procRes);
  despiked.set(depthMap);
  for (let y = 1; y < procRes - 1; y++) {
    for (let x = 1; x < procRes - 1; x++) {
      const idx = y * procRes + x;
      const val = depthMap[idx];
      let avg = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          if (ky === 0 && kx === 0) continue;
          avg += depthMap[(y + ky) * procRes + (x + kx)];
        }
      }
      avg /= 8;
      if (val > avg + 0.02) {
        despiked[idx] = avg + 0.005;
      }
    }
  }
  depthMap.set(despiked);

  const finalSmooth = new Float32Array(procRes * procRes);
  for (let y = 1; y < procRes - 1; y++) {
    for (let x = 1; x < procRes - 1; x++) {
      let sum = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          sum += depthMap[(y + ky) * procRes + (x + kx)];
        }
      }
      finalSmooth[y * procRes + x] = sum / 9;
    }
  }
  depthMap.set(finalSmooth);

  for (let i = 0; i < depthMap.length; i++) {
    let val = depthMap[i];
    if (val < 0.01) val = 0;
    if (settings.reliefStyle === 'embedded') val = 1.0 - val;
    depthMap[i] = val;
  }

  const vertices: number[] = [];
  const indices: number[] = [];
  const groups: { start: number, count: number, materialIndex: number }[] = [];

  const radialSegments = Math.max(segments, Math.floor(gridResolution * Math.PI));
  const rings = Math.floor(gridResolution / 2);

  const getDepthAt = (wx: number, wy: number) => {
    // Map to innerRadius instead of radius to fix spacing and centering
    const u = ((wx / innerRadius + 1.0) * 0.5) * (procRes - 1);
    const v = ((-wy / innerRadius + 1.0) * 0.5) * (procRes - 1);
    
    if (u < 0 || u >= procRes || v < 0 || v >= procRes) return 0;

    const x = Math.floor(u);
    const y = Math.floor(v);
    const u_ratio = u - x;
    const v_ratio = v - y;
    const x1 = Math.max(0, Math.min(procRes - 1, x));
    const x2 = Math.max(0, Math.min(procRes - 1, x + 1));
    const y1 = Math.max(0, Math.min(procRes - 1, y));
    const y2 = Math.max(0, Math.min(procRes - 1, y + 1));
    return (depthMap[y1 * procRes + x1] * (1 - u_ratio) + depthMap[y1 * procRes + x2] * u_ratio) * (1 - v_ratio) +
           (depthMap[y2 * procRes + x1] * (1 - u_ratio) + depthMap[y2 * procRes + x2] * u_ratio) * v_ratio;
  };

  const applyNoise = (x: number, y: number, z: number) => {
    if (surfaceNoise <= 0) return z;
    // Multi-layered high-frequency noise for "cast metal" texture
    const n1 = Math.sin(x * 150 + y * 150) * Math.cos(x * 120 - y * 180);
    const n2 = Math.sin(x * 300 - y * 250) * Math.cos(x * 280 + y * 320);
    const combined = (n1 * 0.6 + n2 * 0.4);
    return z + combined * surfaceNoise * 0.3;
  };

  // 1. BUILD VERTICES
  
  // We will build the coin in layers from front to back
  // Layer 1: Front Face (Center to Relief Edge)
  const frontCenterIdx = vertices.length / 3;
  const centerDepth = getDepthAt(0, 0);
  vertices.push(0, 0, applyNoise(0, 0, zField + centerDepth * maxRelief));

  const frontFaceRingsStartIdx = vertices.length / 3;
  for (let r = 1; r <= rings; r++) {
    const ringRadius = (r / rings) * innerRadius;
    for (let i = 0; i < radialSegments; i++) {
      const angle = (i / radialSegments) * Math.PI * 2;
      const x = ringRadius * Math.cos(angle);
      const y = ringRadius * Math.sin(angle);
      const depth = getDepthAt(x, y);
      vertices.push(x, y, applyNoise(x, y, zField + depth * maxRelief));
    }
  }

  // Layer 2: Front Rim (Inner Edge to Outer Edge)
  const frontInnerRimIdx = vertices.length / 3;
  for (let i = 0; i < radialSegments; i++) {
    const angle = (i / radialSegments) * Math.PI * 2;
    vertices.push(innerRadius * Math.cos(angle), innerRadius * Math.sin(angle), zRim);
  }

  const frontOuterRimIdx = vertices.length / 3;
  for (let i = 0; i < radialSegments; i++) {
    const angle = (i / radialSegments) * Math.PI * 2;
    vertices.push(radius * Math.cos(angle), radius * Math.sin(angle), zRim);
  }

  // Layer 3: Back Rim (Outer Edge to Inner Edge)
  const zBackRim = settings.isDoubleFaced ? -zRim : 0;
  const zBackField = settings.isDoubleFaced ? -zField : 0;

  const backOuterRimIdx = vertices.length / 3;
  for (let i = 0; i < radialSegments; i++) {
    const angle = (i / radialSegments) * Math.PI * 2;
    vertices.push(radius * Math.cos(angle), radius * Math.sin(angle), zBackRim);
  }

  const backInnerRimIdx = vertices.length / 3;
  for (let i = 0; i < radialSegments; i++) {
    const angle = (i / radialSegments) * Math.PI * 2;
    vertices.push(innerRadius * Math.cos(angle), innerRadius * Math.sin(angle), zBackRim);
  }

  // Layer 4: Back Face (Relief Edge to Center)
  const backFaceRingsStartIdx = vertices.length / 3;
  if (settings.isDoubleFaced) {
    for (let r = rings; r >= 1; r--) {
      const ringRadius = (r / rings) * innerRadius;
      for (let i = 0; i < radialSegments; i++) {
        const angle = (i / radialSegments) * Math.PI * 2;
        const x = ringRadius * Math.cos(angle);
        const y = ringRadius * Math.sin(angle);
        const depth = getDepthAt(x, y);
        vertices.push(x, y, applyNoise(x, y, zBackField - depth * maxRelief));
      }
    }
  }
  
  const backCenterIdx = vertices.length / 3;
  if (settings.isDoubleFaced) {
    vertices.push(0, 0, applyNoise(0, 0, zBackField - getDepthAt(0, 0) * maxRelief));
  } else {
    vertices.push(0, 0, 0);
  }

  // 2. BUILD INDICES & GROUPS

  // Group 0: Rim & Side Walls
  const group0Start = indices.length;
  for (let i = 0; i < radialSegments; i++) {
    const next = (i + 1) % radialSegments;

    // Front Rim Top (+Z normal)
    indices.push(frontInnerRimIdx + i, frontOuterRimIdx + next, frontInnerRimIdx + next);
    indices.push(frontInnerRimIdx + i, frontOuterRimIdx + i, frontOuterRimIdx + next);

    // Outer Side Wall (Outward normal)
    indices.push(frontOuterRimIdx + i, backOuterRimIdx + next, frontOuterRimIdx + next);
    indices.push(frontOuterRimIdx + i, backOuterRimIdx + i, backOuterRimIdx + next);

    // Back Rim Top (if double faced) (-Z normal)
    if (settings.isDoubleFaced) {
      indices.push(backOuterRimIdx + i, backInnerRimIdx + next, backOuterRimIdx + next);
      indices.push(backOuterRimIdx + i, backInnerRimIdx + i, backInnerRimIdx + next);
    }
  }
  groups.push({ start: group0Start, count: indices.length - group0Start, materialIndex: 0 });

  // Group 1: Front Face
  const group1Start = indices.length;
  // Center Fan (+Z normal)
  for (let i = 0; i < radialSegments; i++) {
    const next = (i + 1) % radialSegments;
    indices.push(frontCenterIdx, frontFaceRingsStartIdx + i, frontFaceRingsStartIdx + next);
  }
  // Rings (+Z normal)
  for (let r = 0; r < rings - 1; r++) {
    const r1 = frontFaceRingsStartIdx + r * radialSegments;
    const r2 = frontFaceRingsStartIdx + (r + 1) * radialSegments;
    for (let i = 0; i < radialSegments; i++) {
      const next = (i + 1) % radialSegments;
      indices.push(r1 + i, r2 + next, r1 + next);
      indices.push(r1 + i, r2 + i, r2 + next);
    }
  }
  // Inner Rim Wall (Inward normal)
  const frontLastRingStart = frontFaceRingsStartIdx + (rings - 1) * radialSegments;
  for (let i = 0; i < radialSegments; i++) {
    const next = (i + 1) % radialSegments;
    indices.push(frontInnerRimIdx + i, frontInnerRimIdx + next, frontLastRingStart + next);
    indices.push(frontInnerRimIdx + i, frontLastRingStart + next, frontLastRingStart + i);
  }
  groups.push({ start: group1Start, count: indices.length - group1Start, materialIndex: 1 });

  // Group 2: Back Face
  const group2Start = indices.length;
  if (settings.isDoubleFaced) {
    // Back Relief Edge to Inner Rim (Inward normal)
    for (let i = 0; i < radialSegments; i++) {
      const next = (i + 1) % radialSegments;
      indices.push(backInnerRimIdx + i, backFaceRingsStartIdx + next, backInnerRimIdx + next);
      indices.push(backInnerRimIdx + i, backFaceRingsStartIdx + i, backFaceRingsStartIdx + next);
    }
    // Back Rings (-Z normal)
    for (let r = 0; r < rings - 1; r++) {
      const r1 = backFaceRingsStartIdx + r * radialSegments;
      const r2 = backFaceRingsStartIdx + (r + 1) * radialSegments;
      for (let i = 0; i < radialSegments; i++) {
        const next = (i + 1) % radialSegments;
        indices.push(r1 + i, r2 + next, r1 + next);
        indices.push(r1 + i, r2 + i, r2 + next);
      }
    }
    // Back Center Fan (-Z normal)
    const backLastRingStart = backFaceRingsStartIdx + (rings - 1) * radialSegments;
    for (let i = 0; i < radialSegments; i++) {
      const next = (i + 1) % radialSegments;
      indices.push(backCenterIdx, backLastRingStart + next, backLastRingStart + i);
    }
  } else {
    // Flat Back (-Z normal)
    for (let i = 0; i < radialSegments; i++) {
      const next = (i + 1) % radialSegments;
      indices.push(backCenterIdx, backOuterRimIdx + next, backOuterRimIdx + i);
    }
  }
  groups.push({ start: group2Start, count: indices.length - group2Start, materialIndex: 2 });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  groups.forEach(group => geometry.addGroup(group.start, group.count, group.materialIndex));
  geometry.computeVertexNormals();
  return geometry;
}

export function exportToSTL(geometry: THREE.BufferGeometry, filename: string = 'coin.stl') {
  const vertices = geometry.getAttribute('position').array;
  const indices = geometry.getIndex()?.array;
  if (!indices) return;
  
  const triangleCount = indices.length / 3;
  const buffer = new ArrayBuffer(80 + 4 + triangleCount * 50);
  const view = new DataView(buffer);
  for (let i = 0; i < 80; i++) view.setUint8(i, 0);
  view.setUint32(80, triangleCount, true);

  let offset = 84;
  for (let i = 0; i < indices.length; i += 3) {
    // Normal (placeholder)
    for (let j = 0; j < 3; j++) view.setFloat32(offset + j * 4, 0, true);
    offset += 12;

    for (let j = 0; j < 3; j++) {
      const idx = indices[i + j];
      view.setFloat32(offset, vertices[idx * 3], true);
      view.setFloat32(offset + 4, vertices[idx * 3 + 1], true);
      view.setFloat32(offset + 8, vertices[idx * 3 + 2], true);
      offset += 12;
    }
    view.setUint16(offset, 0, true);
    offset += 2;
  }

  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
