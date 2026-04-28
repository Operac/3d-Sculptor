// ── CoinGenerator.ts ───────────────────────────────────────────────────────
// Generates the final 3D coin/plaque mesh from a portrait image and text.
// Vector text is placed on a flat field → Blender‑grade sharpness.
// ────────────────────────────────────────────────────────────────────────────

import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { loadTrajanFont, buildArcTextGeometry, buildFlatTextGeometry } from './arcTextGeometry';

export type ModelType = 'coin' | 'plaque';
export type ReliefStyle = 'elevated' | 'embedded' | 'emboss';
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
  imageOffsetX: number;
  imageOffsetY: number;
  imageContrast: number;
  imageBrightness: number;
  invertImage: boolean;
  topText: string;
  topTextSpan: number;
  bottomText: string;
  bottomTextSpan: number;
  textSize: number;
  textDepthMm: number;
  textFont: 'semibold' | 'bold';
  signatureText: string;
  signatureFont: 'great-vibes' | 'trajan';
  signatureSize: number;
  signatureOffsetX: number;
  signatureOffsetY: number;
  medallionRingEnabled: boolean;
  medallionRingRadius: number;
  medallionRingWidthMm: number;
  medallionRingDepthMm: number;
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
   baseHeight: 2.0,
   rimWidth: 1.2,
   rimHeight: 1.0,
   fieldRecess: 0.3,
   maxRelief: 1.5,
   segments: 768,
   gridResolution: 768,
   isDoubleFaced: true,
   showRim: true,
   surfaceNoise: 0.0,
   imageOffsetX: 0,
   imageOffsetY: 0,
   imageContrast: 1.0,
   imageBrightness: 0.0,
   invertImage: false,
   topText: '',
   topTextSpan: 200,
   bottomText: '',
   bottomTextSpan: 100,
   textSize: 2.0,
   textDepthMm: 1.0,
   textFont: 'semibold',
   signatureText: '',
   signatureFont: 'great-vibes',
   signatureSize: 1.0,
   signatureOffsetX: 0,
   signatureOffsetY: 0,
   medallionRingEnabled: false,
   medallionRingRadius: 0.62,
   medallionRingWidthMm: 1.0,
   medallionRingDepthMm: 1.5,
   material: { type: 'gold', metallic: 0.9, roughness: 0.2, color: '#FFD700' },
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
  maxRelief: 4.0,
  segments: 512,
  gridResolution: 768,
  isDoubleFaced: false,
  showRim: true,
  surfaceNoise: 0.0,
  imageOffsetX: 0,
  imageOffsetY: 0,
  imageContrast: 1.0,
  imageBrightness: 0.0,
  invertImage: false,
  topText: '',
  topTextSpan: 160,
  bottomText: '',
  bottomTextSpan: 90,
  textSize: 1.0,
  textDepthMm: 2.0,
  textFont: 'semibold',
  signatureText: '',
  signatureFont: 'great-vibes',
  signatureSize: 1.0,
  signatureOffsetX: 0,
  signatureOffsetY: 0,
  medallionRingEnabled: false,
  medallionRingRadius: 0.62,
  medallionRingWidthMm: 1.5,
  medallionRingDepthMm: 1.5,
  material: { type: 'bronze', metallic: 0.8, roughness: 0.4, color: '#CD7F32' },
  useSeparateMaterials: false,
  rimMaterial: { type: 'bronze', metallic: 0.8, roughness: 0.4, color: '#CD7F32' },
  faceMaterial: { type: 'bronze', metallic: 0.8, roughness: 0.4, color: '#CD7F32' },
  backMaterial: { type: 'bronze', metallic: 0.8, roughness: 0.4, color: '#CD7F32' },
};

export const LARGE_PLAQUE_PRESET: CoinSettings = {
  type: 'plaque',
  reliefStyle: 'elevated',
  diameter: 425,
  baseHeight: 5.5,
  rimWidth: 12.0,
  rimHeight: 4.0,
  fieldRecess: 0.0,
  maxRelief: 8.0,
  segments: 512,
  gridResolution: 768,
  isDoubleFaced: false,
  showRim: true,
  surfaceNoise: 0.0,
  imageOffsetX: 0,
  imageOffsetY: 0,
  imageContrast: 1.0,
  imageBrightness: 0.0,
  invertImage: false,
  topText: '',
  topTextSpan: 160,
  bottomText: '',
  bottomTextSpan: 90,
  textSize: 0.70,
  textDepthMm: 3.0,
  textFont: 'semibold',
  signatureText: '',
  signatureFont: 'great-vibes',
  signatureSize: 1.0,
  signatureOffsetX: 0,
  signatureOffsetY: 0,
  medallionRingEnabled: true,
  medallionRingRadius: 0.62,
  medallionRingWidthMm: 2.0,
  medallionRingDepthMm: 1.5,
  material: { type: 'bronze', metallic: 0.8, roughness: 0.4, color: '#CD7F32' },
  useSeparateMaterials: false,
  rimMaterial: { type: 'bronze', metallic: 0.8, roughness: 0.4, color: '#CD7F32' },
  faceMaterial: { type: 'bronze', metallic: 0.8, roughness: 0.4, color: '#CD7F32' },
  backMaterial: { type: 'bronze', metallic: 0.8, roughness: 0.4, color: '#CD7F32' },
};

export const POCKET_2_PRESET: CoinSettings = {
  type: 'coin',
  reliefStyle: 'elevated',
  diameter: 39,
  baseHeight: 2.0,
  rimWidth: 1.5,
  rimHeight: 1.0,
  fieldRecess: 0.0,
  maxRelief: 1.5,
  segments: 512,
  gridResolution: 768,
  isDoubleFaced: true,
  showRim: true,
  surfaceNoise: 0.0,
  imageOffsetX: 0,
  imageOffsetY: 0,
  imageContrast: 1.0,
  imageBrightness: 0.0,
  invertImage: false,
  topText: '',
  topTextSpan: 200,
  bottomText: '',
  bottomTextSpan: 100,
  textSize: 1.0,
  textDepthMm: 1.0,
  textFont: 'bold',
  signatureText: '',
  signatureFont: 'great-vibes',
  signatureSize: 1.0,
  signatureOffsetX: 0,
  signatureOffsetY: 0,
  medallionRingEnabled: false,
  medallionRingRadius: 0.62,
  medallionRingWidthMm: 0.8,
  medallionRingDepthMm: 0.4,
  material: { type: 'silver', metallic: 0.9, roughness: 0.2, color: '#C0C0C0' },
  useSeparateMaterials: false,
  rimMaterial: { type: 'silver', metallic: 0.9, roughness: 0.2, color: '#C0C0C0' },
  faceMaterial: { type: 'silver', metallic: 0.9, roughness: 0.2, color: '#C0C0C0' },
  backMaterial: { type: 'silver', metallic: 0.9, roughness: 0.2, color: '#C0C0C0' },
};

export const DEFAULT_SETTINGS: CoinSettings = COIN_PRESET;

export async function generateCoinGeometry(
  imageSrc: string,
  settings: CoinSettings,
  onWarnings?: (warnings: string[]) => void,
  onProgress?: (progress: string) => void,
  signal?: AbortSignal
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
    imageOffsetX = 0,
    imageOffsetY = 0,
    imageContrast = 1.0,
    imageBrightness = 0.0,
    invertImage = false,
    topText = '',
    topTextSpan = 200,
    bottomText = '',
    bottomTextSpan = 100,
    textSize = 1.0,
    textDepthMm = 2.5,
    textFont = 'bold',
    signatureText = '',
    signatureSize = 1.0,
    signatureOffsetX = 0,
    signatureOffsetY = 0,
    medallionRingEnabled = false,
    medallionRingRadius = 0.62,
    medallionRingWidthMm = 2.0,
    medallionRingDepthMm = 1.5,
    signatureFont,
  } = settings;

  const warnings: string[] = [];

  // Cap grid resolution
  const safeGridResolution = Math.min(gridResolution, 768);
  if (safeGridResolution < 512) {
    const msg = '❌ Grid too low — text will be pixelated. Minimum is 512. Go to Settings and increase Grid Resolution.';
    if (onWarnings) onWarnings([msg]);
    throw new Error(msg);
  }

  const radius = diameter / 2;
  const innerRadius = showRim ? radius - rimWidth : radius;
  const zField = baseHeight - fieldRecess;
  const zRim = showRim ? baseHeight + rimHeight : zField;

  // Load Trajan font (cached)
  const fontPromise = loadTrajanFont();

  // ── Decide early if vector text can be used ─────────────────────────────
  let useVectorText = false;
  try {
    const font = await fontPromise;
    useVectorText = !!font;
  } catch (_) {}

  if (onProgress) onProgress("Initializing Image Data...");
  if (signal?.aborted) throw new Error('Operation cancelled');

  // Validate image format
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
  if (imageSrc.startsWith('data:')) {
    const mimeType = imageSrc.split(';')[0].split(':')[1];
    if (!supportedFormats.includes(mimeType)) {
      throw new Error(`Unsupported image format. Please use one of: JPG, PNG, GIF, BMP, or WebP.`);
    }
  }

  const img = new Image();
  if (!imageSrc.startsWith('data:') && !imageSrc.startsWith('blob:')) {
    img.crossOrigin = 'anonymous';
  }
  img.src = imageSrc;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error("Failed to load image. Ensure the file is a valid image in one of these formats: JPG, PNG, GIF, BMP, or WebP."));
  });

  const procRes = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = procRes;
  canvas.height = procRes;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fit image to cover square
  const imgAspect = img.width / img.height;
  let drawW = procRes;
  let drawH = procRes;
  let offsetX = 0;
  let offsetY = 0;
  if (imgAspect > 1) {
    drawW = procRes * imgAspect;
    offsetX = (procRes - drawW) / 2;
  } else {
    drawH = procRes / imgAspect;
    offsetY = (procRes - drawH) / 2;
  }
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, procRes, procRes);

  const userOffsetXpx = imageOffsetX * procRes;
  const userOffsetYpx = imageOffsetY * procRes;
  ctx.drawImage(img, offsetX - userOffsetXpx, offsetY - userOffsetYpx, drawW, drawH);

  // Pre-load canvas fonts (fallback)
  try {
    await Promise.all([
      document.fonts.load(`600 48px "Trajan Pro"`),
      document.fonts.load(`700 48px "Trajan Pro"`),
      document.fonts.load(`400 48px "Great Vibes"`),
    ]);
  } catch (_) {}

  // ── 2x canvas for hi‑res text (used only if vector text unavailable) ───
  const textCanvas2x = document.createElement('canvas');
  textCanvas2x.width  = procRes * 2;
  textCanvas2x.height = procRes * 2;
  const ctx2x = textCanvas2x.getContext('2d', { willReadFrequently: true })!;
  ctx2x.scale(2, 2);
  ctx2x.imageSmoothingEnabled = true;
  ctx2x.imageSmoothingQuality = 'high';

  const coinR = procRes / 2;
  const realRadius = diameter / 2;
  const pxPerMm = coinR / realRadius;
  const innerFaceMm = showRim ? diameter - 2 * rimWidth : diameter;
  const innerFacePx = innerFaceMm * pxPerMm;
  const textArcR = (innerRadius + (showRim ? rimWidth * 0.5 : 0)) * pxPerMm;
  const strokeFactor = 0.08;
  const weight = textFont === 'bold' ? '700' : '600';
  const g = Math.round(Math.min(255, (textDepthMm / maxRelief / 0.6) * 255));

  // Draw arc text on canvas (only if vector text is NOT available)
  const drawArcText = (str: string, centreAngleDeg: number, spanDegrees: number, _isBottom: boolean, targetCtx: CanvasRenderingContext2D) => {
    if (!str || str.trim().length === 0) return;

    let fontSize = Math.max(coinR * 0.015, innerFacePx * 0.20 * textSize);
    let widths: number[];
    let totalW: number;

    while (true) {
      targetCtx.font = `${weight} ${fontSize}px "Trajan Pro", serif`;
      widths = [];
      totalW = 0;
      for (let i = 0; i < str.length; i++) {
        const w = targetCtx.measureText(str[i]).width;
        widths.push(w);
        totalW += w;
      }
      const maxArcLen = (textArcR * spanDegrees * Math.PI) / 180;
      if (totalW <= maxArcLen) break;
      fontSize = Math.round(fontSize * 0.92);
    }

    targetCtx.save();
    targetCtx.font = `${weight} ${fontSize}px "Trajan Pro", serif`;
    targetCtx.textAlign = 'center';
    targetCtx.textBaseline = 'middle';
    targetCtx.strokeStyle = `rgb(${g},${g},${g})`;
    targetCtx.lineWidth = fontSize * strokeFactor;
    targetCtx.lineJoin   = 'miter';
    targetCtx.lineCap    = 'butt';
    targetCtx.miterLimit = 2;
    targetCtx.fillStyle = `rgb(${g},${g},${g})`;

    const centreRad = (centreAngleDeg * Math.PI) / 180;
    const totalArcAngle = totalW / textArcR;
    const startAngle = centreRad - totalArcAngle / 2;

    let cumAngle = startAngle;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const halfAngle = widths[i] / 2 / textArcR;
      const charAngle = cumAngle + halfAngle;

      const cx = coinR + Math.cos(charAngle) * textArcR;
      const cy = coinR + Math.sin(charAngle) * textArcR;

      targetCtx.save();
      targetCtx.translate(cx, cy);
      targetCtx.rotate(charAngle + Math.PI / 2);
      targetCtx.strokeText(ch, 0, 0);
      targetCtx.fillText(ch, 0, 0);
      targetCtx.restore();

      cumAngle += widths[i] / textArcR;
    }
    targetCtx.restore();
  };

  // ── KEY CHANGE: skip canvas text if vector will be used ─────────────────
  if (!useVectorText) {
    if (topText) {
      drawArcText(topText, 270, topTextSpan, false, ctx2x);
    }
    if (bottomText) {
      drawArcText(bottomText, 90, bottomTextSpan, true, ctx2x);
    }
  }

  // Signature (canvas fallback for Great Vibes; vector handled later)
  const sigUseVector = (useVectorText && signatureFont === 'trajan');
  if (signatureText && signatureText.trim().length > 0 && !sigUseVector) {
    const targetDepthNorm = Math.min(1.0, textDepthMm / Math.max(0.1, maxRelief));
    const sigLuminance    = Math.min(1.0, targetDepthNorm / 0.6);
    const gSig            = Math.round(sigLuminance * 255);
    const sigFontSize     = Math.round(coinR * 0.09 * signatureSize);

    ctx2x.save();
    ctx2x.font         = `400 ${sigFontSize}px "Great Vibes", cursive`;
    ctx2x.textAlign    = 'center';
    ctx2x.textBaseline = 'middle';
    ctx2x.fillStyle    = `rgb(${gSig},${gSig},${gSig})`;
    ctx2x.strokeStyle  = `rgba(0,0,0,0)`;
    ctx2x.lineWidth    = 0;

    const autoRingR = textArcR - coinR * 0.13;
    const sigX = coinR + signatureOffsetX * autoRingR;
    const sigY = coinR + autoRingR * 0.72 + signatureOffsetY * autoRingR;

    ctx2x.strokeText(signatureText, sigX, sigY);
    ctx2x.fillText(signatureText, sigX, sigY);
    ctx2x.restore();
  }

  // Medallion ring (always canvas, depth goes into heightmap)
  if (medallionRingEnabled) {
    const ringR = textArcR - coinR * 0.13;
    const targetNorm  = Math.min(1.0, medallionRingDepthMm / Math.max(0.1, maxRelief));
    const ringLum     = Math.min(1.0, targetNorm / 0.6);
    const gRing       = Math.round(ringLum * 255);
    const strokePx    = Math.max(1, medallionRingWidthMm * pxPerMm);

    ctx2x.save();
    ctx2x.strokeStyle = `rgb(${gRing},${gRing},${gRing})`;
    ctx2x.lineWidth   = strokePx;
    ctx2x.beginPath();
    ctx2x.arc(coinR, coinR, ringR, 0, Math.PI * 2);
    ctx2x.stroke();
    ctx2x.restore();
  }

  // Merge 2x canvas back to 1x
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.globalCompositeOperation = 'lighten';
  ctx.drawImage(textCanvas2x, 0, 0, procRes * 2, procRes * 2, 0, 0, procRes, procRes);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  const origScaledData = ctx.getImageData(0, 0, procRes, procRes).data;

  // AI depth input (1024²)
  const aiInputSize = 1024;
  const aiInputCanvas = document.createElement('canvas');
  aiInputCanvas.width = aiInputSize;
  aiInputCanvas.height = aiInputSize;
  const aiInputCtx = aiInputCanvas.getContext('2d')!;
  aiInputCtx.imageSmoothingEnabled = true;
  aiInputCtx.imageSmoothingQuality = 'high';
  aiInputCtx.drawImage(canvas, 0, 0, procRes, procRes, 0, 0, aiInputSize, aiInputSize);
  const squaredImageSrc = aiInputCanvas.toDataURL('image/jpeg', 0.95);

  if (onProgress) onProgress("Initializing AI Depth Model...");
  if (signal?.aborted) throw new Error('Operation cancelled');

  const aiDepth: { data: Float32Array | Uint8Array, width: number, height: number } = await new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./depthWorker', import.meta.url), { type: 'module' });
    let resolved = false;
    let abortHandler: (() => void) | null = null;

    abortHandler = () => {
      worker.terminate();
      if (!resolved) {
        resolved = true;
        reject(new Error('Operation cancelled'));
      }
    };
    if (signal) signal.addEventListener('abort', abortHandler);

    worker.onmessage = (e) => {
      if (resolved) return;
      if (e.data.type === 'progress' && onProgress && !signal?.aborted) {
        const prog = e.data.data;
        if (prog.status === 'downloading') onProgress(`Downloading Model: ${prog.file} (${Math.round(prog.progress)}%)`);
        else if (prog.status === 'ready') onProgress("Model Ready. Processing Image...");
      } else if (e.data.type === 'status' && onProgress && !signal?.aborted) {
        onProgress(e.data.message);
      } else if (e.data.type === 'done') {
        resolved = true;
        if (signal && abortHandler) signal.removeEventListener('abort', abortHandler);
        resolve(e.data.depth);
        worker.terminate();
      } else if (e.data.type === 'error') {
        resolved = true;
        if (signal && abortHandler) signal.removeEventListener('abort', abortHandler);
        reject(new Error(e.data.error));
        worker.terminate();
      }
    };

    worker.onerror = (err) => {
      if (!resolved) {
        resolved = true;
        if (signal && abortHandler) signal.removeEventListener('abort', abortHandler);
        reject(err);
        worker.terminate();
      }
    };

    worker.postMessage({ type: 'load' });
    worker.postMessage({ type: 'estimate', imageSrc: squaredImageSrc });
  });

  if (onProgress) onProgress("Blending AI Depth & Surface Details...");

  // Normalize AI depth
  let aiMin = Infinity, aiMax = -Infinity;
  for (let i = 0; i < aiDepth.data.length; i++) {
    const v = aiDepth.data[i];
    if (v < aiMin) aiMin = v;
    if (v > aiMax) aiMax = v;
  }
  const aiRange = aiMax - aiMin || 1;
  const relativeRange = aiRange / (Math.abs(aiMax) + 1e-9);
  if (relativeRange < 0.10) {
    warnings.push('⚠️ AI depth map is near-uniform — the image may lack depth variation. Relief may appear flat. Try a high-contrast portrait or depth map.');
  }

  const aiW = aiDepth.width;
  const aiH = aiDepth.height;

  // Bilinear sample of float AI depth
  const sampleAIFloat = (u: number, v: number): number => {
    const fx = Math.max(0, Math.min(aiW - 1, u * (aiW - 1)));
    const fy = Math.max(0, Math.min(aiH - 1, v * (aiH - 1)));
    const x0 = Math.floor(fx), x1 = Math.min(aiW - 1, x0 + 1);
    const y0 = Math.floor(fy), y1 = Math.min(aiH - 1, y0 + 1);
    const tx = fx - x0, ty = fy - y0;
    const n00 = (aiDepth.data[y0 * aiW + x0] - aiMin) / aiRange;
    const n10 = (aiDepth.data[y0 * aiW + x1] - aiMin) / aiRange;
    const n01 = (aiDepth.data[y1 * aiW + x0] - aiMin) / aiRange;
    const n11 = (aiDepth.data[y1 * aiW + x1] - aiMin) / aiRange;
    return n00*(1-tx)*(1-ty) + n10*tx*(1-ty) + n01*(1-tx)*ty + n11*tx*ty;
  };

  // Blend AI depth + luminance
  const aiWeight  = relativeRange < 0.10 ? 0.15 : 0.40;
  const lumWeight = 1.0 - aiWeight;

  let depthMap = new Float32Array(procRes * procRes);
  let minDepth = 1, maxDepth = 0;

  for (let i = 0; i < procRes; i++) {
    const v = i / (procRes - 1);
    for (let j = 0; j < procRes; j++) {
      const u = j / (procRes - 1);
      const aiDepthVal = sampleAIFloat(u, v);
      const idx = (i * procRes + j) * 4;
      const r = origScaledData[idx], g = origScaledData[idx+1], b = origScaledData[idx+2];
      let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      if (invertImage) luminance = 1.0 - luminance;
      luminance = (luminance - 0.5) * imageContrast + 0.5 + imageBrightness;
      luminance = Math.max(0, Math.min(1, luminance));

      const depthVal = aiDepthVal * aiWeight + luminance * lumWeight;
      depthMap[i * procRes + j] = depthVal;
      if (depthVal < minDepth) minDepth = depthVal;
      if (depthVal > maxDepth) maxDepth = depthVal;
    }
  }

  // Portrait background leveling
  {
    const bgSamples: number[] = [];
    const bgStep = Math.max(1, Math.floor(procRes / 150));
    for (let sy = 0; sy < procRes; sy += bgStep) {
      for (let sx = 0; sx < procRes; sx += bgStep) {
        const dx = (sx - coinR) / coinR;
        const dy = (sy - coinR) / coinR;
        const br = Math.sqrt(dx * dx + dy * dy);
        if (br >= 0.50 && br <= 0.62) bgSamples.push(depthMap[sy * procRes + sx]);
      }
    }
    if (bgSamples.length > 10) {
      bgSamples.sort((a, b) => a - b);
      const bgLevel = bgSamples[Math.floor(bgSamples.length * 0.25)];
      if (bgLevel > 0.05) {
        for (let i = 0; i < procRes; i++) {
          for (let j = 0; j < procRes; j++) {
            const dx = (j - coinR) / coinR;
            const dy = (i - coinR) / coinR;
            const pr = Math.sqrt(dx * dx + dy * dy);
            if (pr < 0.68) {
              const ti = i * procRes + j;
              depthMap[ti] = Math.max(0, depthMap[ti] - bgLevel);
            }
          }
        }
        console.info(`✅ Portrait background leveled — subtracted bg depth ${bgLevel.toFixed(3)}`);
      }
    }
  }

  // Zero out very small values
  for (let i = 0; i < depthMap.length; i++) {
    if (depthMap[i] < 0.02) depthMap[i] = 0;
  }

  // Gaussian smoothing
  {
    const gSigma = 1.5, gR = 2;
    const gKernel: number[] = [];
    let gKSum = 0;
    for (let ky = -gR; ky <= gR; ky++) {
      for (let kx = -gR; kx <= gR; kx++) {
        const w = Math.exp(-(kx * kx + ky * ky) / (2 * gSigma * gSigma));
        gKernel.push(w); gKSum += w;
      }
    }
    for (let i = 0; i < gKernel.length; i++) gKernel[i] /= gKSum;

    const smoothed = new Float32Array(depthMap.length);
    for (let y = gR; y < procRes - gR; y++) {
      for (let x = gR; x < procRes - gR; x++) {
        let s = 0, ki = 0;
        for (let ky = -gR; ky <= gR; ky++) {
          for (let kx = -gR; kx <= gR; kx++) {
            s += depthMap[(y + ky) * procRes + (x + kx)] * gKernel[ki++];
          }
        }
        smoothed[y * procRes + x] = s;
      }
    }
    for (let x = 0; x < procRes; x++) {
      for (let r = 0; r < gR; r++) {
        smoothed[r * procRes + x]                 = depthMap[r * procRes + x];
        smoothed[(procRes - 1 - r) * procRes + x] = depthMap[(procRes - 1 - r) * procRes + x];
      }
    }
    for (let y = 0; y < procRes; y++) {
      for (let r = 0; r < gR; r++) {
        smoothed[y * procRes + r]                 = depthMap[y * procRes + r];
        smoothed[y * procRes + (procRes - 1 - r)] = depthMap[y * procRes + (procRes - 1 - r)];
      }
    }
    depthMap.set(smoothed);
  }

  // If vector text is available, we skip the canvas‑based text mask entirely.
  // The heightmap stays flat in the text band, so extruded letters sit on a clean field.
  // Hoisted so the mesh-sampler block (around line 950) can read it.
  // When useVectorText is true, this stays as an empty Float32Array (all zeros).
  const textMask = new Float32Array(procRes * procRes);

  if (!useVectorText) {
    // Build text mask from the 2x canvas layer
    const textLayerCanvas = document.createElement('canvas');
    textLayerCanvas.width  = procRes;
    textLayerCanvas.height = procRes;
    const textLayerCtx = textLayerCanvas.getContext('2d')!;
    textLayerCtx.imageSmoothingEnabled = true;
    textLayerCtx.imageSmoothingQuality = 'high';
    textLayerCtx.drawImage(textCanvas2x, 0, 0, procRes * 2, procRes * 2, 0, 0, procRes, procRes);
    const textLayerRaw = textLayerCtx.getImageData(0, 0, procRes, procRes).data;

    const textDepthTarget = Math.min(1.0, textDepthMm / Math.max(0.1, maxRelief));
    for (let ti = 0; ti < procRes * procRes; ti++) {
      const tLum = (0.299 * textLayerRaw[ti*4] + 0.587 * textLayerRaw[ti*4+1] + 0.114 * textLayerRaw[ti*4+2]) / 255;
      if (tLum > 0.12) textMask[ti] = textDepthTarget;
    }

    // Override depth map with text mask (makes canvas text crisp)
    for (let ti = 0; ti < depthMap.length; ti++) {
      if (textMask[ti] > depthMap[ti]) depthMap[ti] = textMask[ti];
    }

    // Final text application after all filtering
    {
      const textDepthTargetFinal = Math.min(1.0, textDepthMm / Math.max(0.1, maxRelief));
      const finalTextNorm = Math.min(0.97, textDepthTargetFinal * 1.1);
      for (let ti = 0; ti < depthMap.length; ti++) {
        if (textMask[ti] > 0.04) {
          const t = Math.min(1.0, textMask[ti] / Math.max(0.01, textDepthTargetFinal));
          depthMap[ti] = t * finalTextNorm;
        }
      }
    }
  }

  // Portrait radial fade
  {
    const fadeStart = 0.55;
    const fadeEnd   = 0.70;
    for (let i = 0; i < procRes; i++) {
      for (let j = 0; j < procRes; j++) {
        const dx = (j - coinR) / coinR;
        const dy = (i - coinR) / coinR;
        const r = Math.sqrt(dx * dx + dy * dy);
        if (r > fadeStart) {
          const fade = r >= fadeEnd ? 0.0
            : (Math.cos((r - fadeStart) / (fadeEnd - fadeStart) * Math.PI) + 1.0) * 0.5;
          depthMap[i * procRes + j] *= fade;
        }
      }
    }
  }

  // Light normalization
  const sorted = new Float32Array(depthMap).sort();
  const p2 = sorted[Math.floor(sorted.length * 0.02)]; 
  const p98 = sorted[Math.floor(sorted.length * 0.98)];
  const range = p98 - p2 + 1e-6;
  for (let i = 0; i < depthMap.length; i++) {
    let t = Math.max(0, Math.min(1, (depthMap[i] - p2) / range));
    depthMap[i] = t;
  }

  // Emboss smoothing
  if (settings.reliefStyle === 'emboss') {
    const sigmaScale = Math.log10(Math.max(10, diameter)) / Math.log10(425);
    const sigma = Math.max(0.5, Math.min(1.8, -1.11 + 2.91 * sigmaScale));
    const blurRadius = Math.max(1, Math.ceil(sigma * 2.5));
    if (sigma > 1.0 && settings.type === 'coin') {
      warnings.push(`⚠️ Emboss blur sigma ${sigma.toFixed(1)} is high for a pocket coin — text edges may soften. Consider Raised mode for sharper letters on small coins.`);
    }
    const smoothed = new Float32Array(depthMap.length);
    const kernel: number[] = [];
    let kSum = 0;
    for (let ky = -blurRadius; ky <= blurRadius; ky++) {
      for (let kx = -blurRadius; kx <= blurRadius; kx++) {
        const w = Math.exp(-(kx * kx + ky * ky) / (2 * sigma * sigma));
        kernel.push(w); kSum += w;
      }
    }
    for (let i = 0; i < kernel.length; i++) kernel[i] /= kSum;
    for (let y = blurRadius; y < procRes - blurRadius; y++) {
      for (let x = blurRadius; x < procRes - blurRadius; x++) {
        let sum = 0, ki = 0;
        for (let ky = -blurRadius; ky <= blurRadius; ky++) {
          for (let kx = -blurRadius; kx <= blurRadius; kx++) {
            sum += depthMap[(y + ky) * procRes + (x + kx)] * kernel[ki++];
          }
        }
        smoothed[y * procRes + x] = sum;
      }
    }
    for (let x = 0; x < procRes; x++) {
      for (let br = 0; br < blurRadius; br++) {
        smoothed[br * procRes + x]               = depthMap[br * procRes + x];
        smoothed[(procRes - 1 - br) * procRes + x] = depthMap[(procRes - 1 - br) * procRes + x];
      }
    }
    for (let y = 0; y < procRes; y++) {
      for (let br = 0; br < blurRadius; br++) {
        smoothed[y * procRes + br]               = depthMap[y * procRes + br];
        smoothed[y * procRes + (procRes - 1 - br)] = depthMap[y * procRes + (procRes - 1 - br)];
      }
    }
    for (let i = 0; i < depthMap.length; i++) depthMap[i] = 0.80 * smoothed[i] + 0.20 * depthMap[i];
  }

  // Invert for embedded style
  for (let i = 0; i < depthMap.length; i++) {
    if (depthMap[i] < 0.01) depthMap[i] = 0;
    if (settings.reliefStyle === 'embedded') depthMap[i] = 1.0 - depthMap[i];
  }

  // Re‑apply circular mask
  const centerX = procRes / 2, centerY = procRes / 2, maxRadius = procRes / 2;
  for (let y = 0; y < procRes; y++) {
    for (let x = 0; x < procRes; x++) {
      const dx = x - centerX, dy = y - centerY;
      if (Math.sqrt(dx*dx + dy*dy) > maxRadius) depthMap[y * procRes + x] = 0;
    }
  }

  // Z‑fighting lift
  {
    const minLiftNorm = Math.min(0.05, 0.01 / Math.max(0.1, maxRelief));
    for (let i = 0; i < depthMap.length; i++) {
      if (depthMap[i] > 0 && depthMap[i] < minLiftNorm) depthMap[i] = minLiftNorm;
    }
  }

  // ── Auto‑detect content circle radius ─────────────────────────────────
  let contentFrac = 1.0;
  {
    const N_PROBE  = 12;
    const probeR   = Math.round(maxRadius * 0.98);
    let bgLumSum   = 0;
    for (let a = 0; a < N_PROBE; a++) {
      const ang = (a / N_PROBE) * Math.PI * 2;
      const px  = Math.min(procRes - 1, Math.max(0, Math.round(centerX + Math.cos(ang) * probeR)));
      const py  = Math.min(procRes - 1, Math.max(0, Math.round(centerY + Math.sin(ang) * probeR)));
      const ii  = (py * procRes + px) * 4;
      bgLumSum += (0.299 * origScaledData[ii] + 0.587 * origScaledData[ii+1] + 0.114 * origScaledData[ii+2]) / 255;
    }
    const bgAvgLum = bgLumSum / N_PROBE;
    if (bgAvgLum > 0.85) {
      const edgeThreshold = Math.max(0.55, bgAvgLum - 0.15);
      const N_SCAN = 64;
      const radii: number[] = [];
      for (let a = 0; a < N_SCAN; a++) {
        const ang  = (a / N_SCAN) * Math.PI * 2;
        const cosA = Math.cos(ang), sinA = Math.sin(ang);
        for (let r = probeR; r >= Math.round(maxRadius * 0.25); r -= 1) {
          const px = Math.min(procRes - 1, Math.max(0, Math.round(centerX + cosA * r)));
          const py = Math.min(procRes - 1, Math.max(0, Math.round(centerY + sinA * r)));
          const ii = (py * procRes + px) * 4;
          const lum = (0.299 * origScaledData[ii] + 0.587 * origScaledData[ii+1] + 0.114 * origScaledData[ii+2]) / 255;
          if (lum < edgeThreshold) { radii.push(r); break; }
        }
      }
      if (radii.length >= N_SCAN * 0.5) {
        radii.sort((a, b) => a - b);
        const p90 = radii[Math.floor(radii.length * 0.90)];
        contentFrac = Math.min(1.0, Math.max(0.5, (p90 + maxRadius * 0.02) / maxRadius));
      }
    }
  }

  // Clamp content fraction for arc text
  if ((topText || '').trim().length > 0 || (bottomText || '').trim().length > 0) {
    const halfCapHeight = innerFacePx * 0.20 * 0.35;
    const outerCharEdgePx = textArcR + halfCapHeight;
    const minFracForText = (outerCharEdgePx / coinR) / 0.97;
    if (contentFrac < minFracForText) {
      console.info(`contentFrac clamped ${contentFrac.toFixed(3)} → ${minFracForText.toFixed(3)}`);
      contentFrac = minFracForText;
    }
  }

  // Adaptive mesh density
  const baseRings = Math.floor(safeGridResolution / 2);
  const ringNorms: number[] = [];
  for (let r = 1; r <= baseRings; r++) {
    const rNorm = r / baseRings;
    if (rNorm < 0.65) ringNorms.push(rNorm);
    else if (rNorm <= 0.88) { if (r % 2 === 0) ringNorms.push(rNorm); }
    else ringNorms.push(rNorm);
  }
  if (ringNorms.length > 0 && ringNorms[ringNorms.length - 1] !== 1.0) ringNorms.push(1.0);
  const rings = ringNorms.length;

  const doubleFaceFactor = settings.isDoubleFaced ? 2 : 1;
  const maxFaces = 750_000;
  const maxRadial = Math.floor(maxFaces / Math.max(1, (2 * rings + 6) * doubleFaceFactor));
  const radialSegments = Math.min(segments, maxRadial);

  const outerAngularStepMm = (2 * Math.PI * innerRadius) / radialSegments;
  if (outerAngularStepMm > 0.5 || radialSegments < 90) {
    warnings.push(`⚠️ Rim smoothness: outer angular step ${outerAngularStepMm.toFixed(3)}mm — increase Segments for a smoother coin edge.`);
  }

  // ── Mesh Construction ─────────────────────────────────────────────────
  // Helper to sample depth map with Lanczos‑2 (for portrait)
  const lanczos2 = (x: number): number => {
    if (x === 0) return 1;
    if (Math.abs(x) >= 2) return 0;
    const px = Math.PI * x;
    return (Math.sin(px) / px) * (Math.sin(px / 2) / (px / 2));
  };

  const sampleDepthLanczos = (u: number, v: number): number => {
    const x0 = Math.floor(u);
    const y0 = Math.floor(v);
    let sum = 0, weight = 0;
    for (let dy = -1; dy <= 2; dy++) {
      const wy = lanczos2(v - (y0 + dy));
      if (wy === 0) continue;
      for (let dx = -1; dx <= 2; dx++) {
        const wx = lanczos2(u - (x0 + dx));
        if (wx === 0) continue;
        const px = Math.max(0, Math.min(procRes - 1, x0 + dx));
        const py = Math.max(0, Math.min(procRes - 1, y0 + dy));
        const w = wx * wy;
        sum += depthMap[py * procRes + px] * w;
        weight += w;
      }
    }
    return weight > 0 ? Math.max(0, sum / weight) : 0;
  };

  const getDepthAt = (wx: number, wy: number) => {
    const dist = Math.sqrt(wx * wx + wy * wy);
    if (dist > innerRadius) return 0;
    const rNorm = dist / innerRadius;

    let angle = Math.atan2(wy, wx);
    if (angle < 0) angle += 2 * Math.PI;

    const sampledRadius = 0.5 * contentFrac;
    const tx = 0.5 + Math.cos(angle) * rNorm * sampledRadius;
    const ty = 0.5 - Math.sin(angle) * rNorm * sampledRadius;

    const u = tx * (procRes - 1);
    const v = ty * (procRes - 1);
    if (u < 0 || u >= procRes || v < 0 || v >= procRes) return 0;

    // For text band we use winner‑takes‑all from textMask if we have one,
    // but with vector text the mask is empty, so this falls back to Lanczos.
    const ui = Math.round(u);
    const vi = Math.round(v);
    let depth: number;
    if (rNorm > 0.78 && !useVectorText) {
      // Canvas text: scan window for plateau
      let maxText = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const sx = Math.max(0, Math.min(procRes - 1, ui + dx));
          const sy = Math.max(0, Math.min(procRes - 1, vi + dy));
          const sIdx = sy * procRes + sx;
          if (textMask[ sIdx ] > maxText) maxText = textMask[ sIdx ];
        }
      }
      depth = maxText > 0 ? maxText : sampleDepthLanczos(u, v);
    } else {
      depth = sampleDepthLanczos(u, v);
    }

    // Feather edges
    const FEATHER_START = 0.985;
    if (rNorm > FEATHER_START) {
      const t = 1 - (rNorm - FEATHER_START) / (1 - FEATHER_START);
      depth *= t * t * (3 - 2 * t);
    }

    if (depth > 0 && depth < (0.01 / maxRelief)) depth = 0.01 / maxRelief;
    return depth;
  };

  const applyNoise = (x: number, y: number, z: number, depth: number, innerRadius: number) => {
    if (surfaceNoise <= 0) return z;
    if (depth < 0.02) return z;
    const n1 = Math.sin(x * 137 + y * 189) * Math.cos(x * 211 - y * 163);
    const n2 = Math.sin(x * 271 - y * 233) * Math.cos(x * 197 + y * 307);
    const combined = (n1 * 0.6 + n2 * 0.4);
    const r = Math.sqrt(x * x + y * y);
    const fade = Math.min(1.0, r / (innerRadius * 0.15));
    return z + combined * surfaceNoise * 0.3 * fade;
  };

  // Build vertices/indices
  const totalFrontVertices = 1 + rings * radialSegments + radialSegments + radialSegments + radialSegments + 1;
  const totalVertices = settings.isDoubleFaced ? totalFrontVertices * 2 : totalFrontVertices;
  const vertices = new Float32Array(totalVertices * 3);
  const indices: number[] = [];
  const groups: { start: number, count: number, materialIndex: number }[] = [];
  let vertexIndex = 0;
  const setVertex = (x: number, y: number, z: number) => {
    vertices[vertexIndex++] = x;
    vertices[vertexIndex++] = y;
    vertices[vertexIndex++] = z;
  };

  // Front center pole
  const frontCenterIdx = 0;
  let avgCenterDepth = 0;
  let centerCount = 0;
  const sampleRings = Math.min(3, rings);
  for (let r = 0; r < sampleRings; r++) {
    for (let i = 0; i < radialSegments; i++) {
      const angle = (i / radialSegments) * Math.PI * 2;
      const ringRadius = ringNorms[r] * innerRadius;
      avgCenterDepth += getDepthAt(ringRadius * Math.cos(angle), ringRadius * Math.sin(angle));
      centerCount++;
    }
  }
  avgCenterDepth /= centerCount;
  setVertex(0, 0, applyNoise(0, 0, zField + avgCenterDepth * maxRelief, avgCenterDepth, innerRadius));

  // Face rings
  const frontFaceRingsStartIdx = 1;
  for (let r = 0; r < rings; r++) {
    const ringRadius = ringNorms[r] * innerRadius;
    for (let i = 0; i < radialSegments; i++) {
      const angle = (i / radialSegments) * Math.PI * 2;
      const x = ringRadius * Math.cos(angle);
      const y = ringRadius * Math.sin(angle);
      const depth = getDepthAt(x, y);
      setVertex(x, y, applyNoise(x, y, zField + depth * maxRelief, depth, innerRadius));
    }
  }

  // Outer rim
  const frontOuterRimIdx = frontFaceRingsStartIdx + rings * radialSegments;
  for (let i = 0; i < radialSegments; i++) {
    const angle = (i / radialSegments) * Math.PI * 2;
    setVertex(radius * Math.cos(angle), radius * Math.sin(angle), zRim);
  }

  // Equator
  const equatorIdx = frontOuterRimIdx + radialSegments;
  for (let i = 0; i < radialSegments; i++) {
    const angle = (i / radialSegments) * Math.PI * 2;
    setVertex(radius * Math.cos(angle), radius * Math.sin(angle), 0);
  }

  // Base outer rim (Z=0)
  const baseOuterRimIdx = equatorIdx + radialSegments;
  for (let i = 0; i < radialSegments; i++) {
    const angle = (i / radialSegments) * Math.PI * 2;
    setVertex(radius * Math.cos(angle), radius * Math.sin(angle), 0);
  }

  // Base center
  const baseCenterIdx = baseOuterRimIdx + radialSegments;
  setVertex(0, 0, 0);

  // Indices: front face
  for (let i = 0; i < radialSegments; i++) {
    const next = (i + 1) % radialSegments;
    indices.push(frontCenterIdx, frontFaceRingsStartIdx + i, frontFaceRingsStartIdx + next);
  }
  for (let r = 0; r < rings - 1; r++) {
    const r1 = frontFaceRingsStartIdx + r * radialSegments;
    const r2 = frontFaceRingsStartIdx + (r + 1) * radialSegments;
    for (let i = 0; i < radialSegments; i++) {
      const next = (i + 1) % radialSegments;
      indices.push(r1 + i, r2 + next, r1 + next);
      indices.push(r1 + i, r2 + i, r2 + next);
    }
  }
  const lastRingStart = frontFaceRingsStartIdx + (rings - 1) * radialSegments;
  for (let i = 0; i < radialSegments; i++) {
    const next = (i + 1) % radialSegments;
    indices.push(lastRingStart + i, frontOuterRimIdx + next, lastRingStart + next);
    indices.push(lastRingStart + i, frontOuterRimIdx + i, frontOuterRimIdx + next);
  }

  // Outer edge drop
  for (let i = 0; i < radialSegments; i++) {
    const next = (i + 1) % radialSegments;
    indices.push(frontOuterRimIdx + i, equatorIdx + next, frontOuterRimIdx + next);
    indices.push(frontOuterRimIdx + i, equatorIdx + i, equatorIdx + next);
  }

  // Base plate
  const singleFaceBaseIndices: number[] = [];
  for (let i = 0; i < radialSegments; i++) {
    const next = (i + 1) % radialSegments;
    singleFaceBaseIndices.push(baseCenterIdx, baseOuterRimIdx + next, baseOuterRimIdx + i);
  }

  // Compose final mesh
  if (settings.isDoubleFaced) {
    const frontVertexCount = vertexIndex / 3;
    for (let i = 0; i < frontVertexCount; i++) {
      const x = vertices[i * 3];
      const y = vertices[i * 3 + 1];
      const z = vertices[i * 3 + 2];
      setVertex(-x, y, -z);
    }
    const mirroredIndices: number[] = [];
    const mirrorOffset = frontVertexCount;
    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i], b = indices[i+1], c = indices[i+2];
      mirroredIndices.push(mirrorOffset + c, mirrorOffset + b, mirrorOffset + a);
    }
    groups.push({ start: 0, count: indices.length, materialIndex: 0 });
    groups.push({ start: indices.length, count: mirroredIndices.length, materialIndex: 2 });
    for (const val of indices) indices.push(val);
    for (const val of mirroredIndices) indices.push(val);
  } else {
    groups.push({ start: 0, count: indices.length, materialIndex: 0 });
    groups.push({ start: indices.length, count: singleFaceBaseIndices.length, materialIndex: 2 });
    for (const val of indices) indices.push(val);
    for (const val of singleFaceBaseIndices) indices.push(val);
  }

  let geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices.slice(0, vertexIndex), 3));
  geometry.setIndex(new THREE.Uint32BufferAttribute(indices, 1));
  groups.forEach(g => geometry.addGroup(g.start, g.count, g.materialIndex));

  // Merge vertices & compute normals
  geometry = mergeVertices(geometry, 0.001);
  geometry.clearGroups();
  groups.forEach(g => geometry.addGroup(g.start, g.count, g.materialIndex));
  geometry.computeVertexNormals();

  // Pole normal smoothing
  {
    const normals = geometry.attributes.normal.array as Float32Array;
    const pos = geometry.attributes.position.array as Float32Array;
    const vertCount = pos.length / 3;
    for (let vi = 0; vi < vertCount; vi++) {
      const vx = pos[vi * 3], vy = pos[vi * 3 + 1], vz = pos[vi * 3 + 2];
      if (Math.abs(vx) < 0.01 && Math.abs(vy) < 0.01) {
        normals[vi*3]=0; normals[vi*3+1]=0; normals[vi*3+2] = (vz > 0 ? 1 : -1);
      }
    }
    const smoothRingNormals = (start: number, sign: number) => {
      for (let r = 0; r < 2; r++) {
        const blend = 1.0 - r / 2;
        for (let i = 0; i < radialSegments; i++) {
          const base = (start + r * radialSegments + i) * 3;
          let nx = normals[base]   * (1 - blend);
          let ny = normals[base+1] * (1 - blend);
          let nz = normals[base+2] * (1 - blend) + sign * blend;
          const len = Math.sqrt(nx*nx+ny*ny+nz*nz);
          if (len > 0) { nx /= len; ny /= len; nz /= len; }
          normals[base]=nx; normals[base+1]=ny; normals[base+2]=nz;
        }
      }
    };
    smoothRingNormals(frontFaceRingsStartIdx, 1);
    if (settings.isDoubleFaced) smoothRingNormals(totalFrontVertices + frontFaceRingsStartIdx, -1);
  }

  // ── Vector text (if available) ─────────────────────────────────────────
  if (useVectorText) {
    const font = await fontPromise;
    if (font) {
      const innerFaceMm   = radius - (showRim ? rimWidth : 0);
      const noRimBorderMm = Math.max(radius * 0.11, 6);
      const edgeClearMm   = showRim ? innerFaceMm * 0.095 : noRimBorderMm;
      const arcRadiusMm   = innerFaceMm - edgeClearMm;
      const fontSizeMm    = innerFaceMm * 0.20 * textSize;
      const letterSpacing = fontSizeMm * 0.22;

      const frontTextGeoms: THREE.BufferGeometry[] = [];

      if (topText.trim()) {
        const g = buildArcTextGeometry(font, {
          text: topText,
          arcRadius: arcRadiusMm,
          centreAngleDeg: 90,
          arcSpanDeg: topTextSpan,
          fontSizeMm,
          letterSpacingMm: letterSpacing,
          textDepthMm,
          faceZ: zField,
          flipBaseline: false,
        });
        if (g.attributes.position) frontTextGeoms.push(g);
      }
      if (bottomText.trim()) {
        const g = buildArcTextGeometry(font, {
          text: bottomText,
          arcRadius: arcRadiusMm,
          centreAngleDeg: -90,
          arcSpanDeg: bottomTextSpan,
          fontSizeMm,
          letterSpacingMm: letterSpacing,
          textDepthMm,
          faceZ: zField,
          flipBaseline: true,
        });
        if (g.attributes.position) frontTextGeoms.push(g);
      }
      // Signature if vector
      if (signatureFont === 'trajan' && signatureText.trim()) {
        const sigFontSizeMm = radius * 0.09 * signatureSize;
        const autoRingMm = arcRadiusMm - radius * 0.13;
        const sigCentreX = signatureOffsetX * autoRingMm;
        const sigBaselineY = -(autoRingMm * 0.72 + signatureOffsetY * autoRingMm);
        const sigGeo = buildFlatTextGeometry(font, {
          text: signatureText,
          centreX: sigCentreX,
          baselineY: sigBaselineY,
          fontSizeMm: sigFontSizeMm,
          letterSpacingMm: sigFontSizeMm * 0.05,
          textDepthMm,
          faceZ: zField,
        });
        if (sigGeo.attributes.position) frontTextGeoms.push(sigGeo);
      }

      // Mirror to back if double‑faced
      const backTextGeoms: THREE.BufferGeometry[] = [];
      if (settings.isDoubleFaced) {
        for (const g of frontTextGeoms) {
          const back = g.clone();
          back.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, -1));
          back.translate(0, 0, -2 * zField);
          const pos = back.attributes.position;
          if (pos) {
            const arr = pos.array as Float32Array;
            for (let i = 0; i < arr.length; i += 9) {
              for (let j = 0; j < 3; j++) {
                const t = arr[i + 3 + j];
                arr[i + 3 + j] = arr[i + 6 + j];
                arr[i + 6 + j] = t;
              }
            }
            pos.needsUpdate = true;
          }
          back.computeVertexNormals();
          backTextGeoms.push(back);
        }
      }

      const allTextGeoms = [...frontTextGeoms, ...backTextGeoms];
      if (allTextGeoms.length > 0) {
        const coinAttrs = new Set(Object.keys(geometry.attributes));
        const cleanFront: THREE.BufferGeometry[] = [];
        const cleanBack:  THREE.BufferGeometry[] = [];
        let frontTriCount = 0, backTriCount = 0;

        for (const g of frontTextGeoms) {
          for (const key of Object.keys(g.attributes)) {
            if (!coinAttrs.has(key)) g.deleteAttribute(key);
          }
          const merged = mergeVertices(g, 1e-4);
          metadata: { merged.computeVertexNormals(); }
          (merged as any).index = null; // non‑indexed for mergeGeometries
          frontTriCount += merged.attributes.position.count / 9;
          cleanFront.push(merged);
        }
        for (const g of backTextGeoms) {
          for (const key of Object.keys(g.attributes)) {
            if (!coinAttrs.has(key)) g.deleteAttribute(key);
          }
          const merged = mergeVertices(g, 1e-4);
          merged.computeVertexNormals();
          (merged as any).index = null;
          backTriCount += merged.attributes.position.count / 9;
          cleanBack.push(merged);
        }

        const mergedAll = mergeGeometries([geometry, ...cleanFront, ...cleanBack], false);
        if (mergedAll) {
          mergedAll.clearGroups();
          const coinIndexCount = geometry.index ? geometry.index.count : 0;
          const frontMatIdx = settings.useSeparateMaterials ? (geometry.groups[1]?.materialIndex ?? 1) : 0;
          const backMatIdx  = settings.useSeparateMaterials ? (geometry.groups[2]?.materialIndex ?? 2) : 0;
          for (const grp of geometry.groups) mergedAll.addGroup(grp.start, grp.count, grp.materialIndex);
          if (frontTriCount > 0) mergedAll.addGroup(coinIndexCount, frontTriCount, frontMatIdx);
          if (backTriCount  > 0) mergedAll.addGroup(coinIndexCount + frontTriCount, backTriCount, backMatIdx);
          geometry.copy(mergedAll);
          geometry.boundingBox = null;
          geometry.boundingSphere = null;
        }
      }
    }
  }

  // ── Quality checks ─────────────────────────────────────────────────────
  {
    const qcPos  = geometry.attributes.position.array as Float32Array;
    const qcIdx  = geometry.getIndex()!.array;
    const faceCount = qcIdx.length / 3;
    if (faceCount > 800_000) warnings.push(`⚠️ Face count ${faceCount.toLocaleString()} exceeds Bambu limit.`);

    // Degenerate face removal
    let degenCount = 0;
    for (let i = 0; i < qcIdx.length; i += 3) {
      const i0 = qcIdx[i]*3, i1 = qcIdx[i+1]*3, i2 = qcIdx[i+2]*3;
      const ax = qcPos[i1] - qcPos[i0], ay = qcPos[i1+1] - qcPos[i0+1], az = qcPos[i1+2] - qcPos[i0+2];
      const bx = qcPos[i2] - qcPos[i0], by = qcPos[i2+1] - qcPos[i0+1], bz = qcPos[i2+2] - qcPos[i0+2];
      const cx = ay*bz - az*by, cy = az*bx - ax*bz, cz = ax*by - ay*bx;
      if (cx*cx+cy*cy+cz*cz < 4e-12) degenCount++;
    }
    if (degenCount > 0) {
      const newIdx: number[] = [];
      geometry.clearGroups();
      for (const grp of groups) {
        const newStart = newIdx.length;
        let newCount = 0;
        for (let i = grp.start; i < grp.start + grp.count; i += 3) {
          const a = qcIdx[i], b = qcIdx[i+1], c = qcIdx[i+2];
          const i0 = a*3, i1 = b*3, i2 = c*3;
          const ax = qcPos[i1] - qcPos[i0], ay = qcPos[i1+1] - qcPos[i0+1], az = qcPos[i1+2] - qcPos[i0+2];
          const bx = qcPos[i2] - qcPos[i0], by = qcPos[i2+1] - qcPos[i0+1], bz = qcPos[i2+2] - qcPos[i0+2];
          const cx = ay*bz - az*by, cy = az*bx - ax*bz, cz = ax*by - ay*bx;
          if (cx*cx+cy*cy+cz*cz >= 4e-12) {
            newIdx.push(a, b, c);
            newCount += 3;
          }
        }
        if (newCount > 0) geometry.addGroup(newStart, newCount, grp.materialIndex);
      }
      geometry.setIndex(newIdx);
      geometry.computeVertexNormals();
      warnings.push(`[auto-fixed] Removed ${degenCount} degenerate face(s).`);
    }
  }

  if (onWarnings) onWarnings(warnings);
  return geometry;
}

// ── STL export (unchanged) ────────────────────────────────────────────────
export function exportToSTL(geometry: THREE.BufferGeometry, filename: string = 'coin.stl', tiltDeg: number = 0) {
  const posAttr = geometry.getAttribute('position').array;
  const indices = geometry.getIndex()?.array;
  if (!indices) return;

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < posAttr.length; i += 3) {
    minX = Math.min(minX, posAttr[i]); maxX = Math.max(maxX, posAttr[i]);
    minY = Math.min(minY, posAttr[i+1]); maxY = Math.max(maxY, posAttr[i+1]);
    minZ = Math.min(minZ, posAttr[i+2]); maxZ = Math.max(maxZ, posAttr[i+2]);
  }
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, cz = (minZ + maxZ) / 2;

  const cosT = Math.cos((tiltDeg * Math.PI) / 180);
  const sinT = Math.sin((tiltDeg * Math.PI) / 180);
  const verts = new Float32Array(posAttr.length);
  for (let i = 0; i < posAttr.length; i += 3) {
    const lx = posAttr[i] - cx, ly = posAttr[i+1] - cy, lz = posAttr[i+2] - cz;
    verts[i]   = lx;
    verts[i+1] = ly * cosT - lz * sinT;
    verts[i+2] = ly * sinT + lz * cosT;
  }
  let newMinZ = Infinity;
  for (let i = 2; i < verts.length; i += 3) newMinZ = Math.min(newMinZ, verts[i]);
  for (let i = 2; i < verts.length; i += 3) verts[i] -= newMinZ;

  if (tiltDeg > 0) {
    const SHRINK = 1.015;
    for (let i = 0; i < verts.length; i += 3) {
      verts[i]   *= SHRINK;
      verts[i+1] *= SHRINK;
    }
  }

  const triangleCount = indices.length / 3;
  const buffer = new ArrayBuffer(84 + triangleCount * 50);
  const view = new DataView(buffer);
  const headerStr = '3D Coin Sculptor — Bambu-ready binary STL';
  for (let i = 0; i < 80; i++) view.setUint8(i, i < headerStr.length ? headerStr.charCodeAt(i) : 0);
  view.setUint32(80, triangleCount, true);
  let offset = 84;
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i], i1 = indices[i+1], i2 = indices[i+2];
    const v0x = verts[i0*3], v0y = verts[i0*3+1], v0z = verts[i0*3+2];
    const v1x = verts[i1*3], v1y = verts[i1*3+1], v1z = verts[i1*3+2];
    const v2x = verts[i2*3], v2y = verts[i2*3+1], v2z = verts[i2*3+2];
    const ax = v1x - v0x, ay = v1y - v0y, az = v1z - v0z;
    const bx = v2x - v0x, by = v2y - v0y, bz = v2z - v0z;
    let nx = ay*bz - az*by, ny = az*bx - ax*bz, nz = ax*by - ay*bx;
    const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
    if (len > 0) { nx /= len; ny /= len; nz /= len; }
    view.setFloat32(offset, nx, true); offset += 4;
    view.setFloat32(offset, ny, true); offset += 4;
    view.setFloat32(offset, nz, true); offset += 4;
    view.setFloat32(offset, v0x, true); offset += 4;
    view.setFloat32(offset, v0y, true); offset += 4;
    view.setFloat32(offset, v0z, true); offset += 4;
    view.setFloat32(offset, v1x, true); offset += 4;
    view.setFloat32(offset, v1y, true); offset += 4;
    view.setFloat32(offset, v1z, true); offset += 4;
    view.setFloat32(offset, v2x, true); offset += 4;
    view.setFloat32(offset, v2y, true); offset += 4;
    view.setFloat32(offset, v2z, true); offset += 4;
    view.setUint16(offset, 0, true); offset += 2;
  }
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}