import * as THREE from 'three';

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
  topText: string;        // text on top arc (10→2 o'clock)
  topTextSpan: number;    // arc span in degrees for top text (60–330)
  bottomText: string;     // text on bottom arc (7→5 o'clock)
  bottomTextSpan: number; // arc span in degrees for bottom text (40–180)
  textSize: number;       // 0.5 – 2.0, relative font size
  textDepthMm: number;    // target relief height for text in mm (e.g. 2.5)
  textFont: 'semibold' | 'bold';
  signatureText: string;   // optional signature text
  signatureFont: 'great-vibes' | 'trajan'; // Great Vibes cursive OR Trajan Pro (better for 3D print)
  signatureSize: number;   // 0.5 – 2.0, relative signature size
  signatureOffsetX: number; // -1.0 – 1.0, horizontal nudge (fraction of face radius)
  signatureOffsetY: number; // -1.0 – 1.0, vertical nudge (fraction of face radius)
  medallionRingEnabled: boolean;  // draw portrait border ring in code
  medallionRingRadius: number;    // 0.40–0.90, fraction of face radius
  medallionRingWidthMm: number;   // stroke width in mm (e.g. 1.5)
  medallionRingDepthMm: number;   // target relief depth for ring (e.g. 1.5)
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
  baseHeight: 1.5,
  rimWidth: 1.0,
  rimHeight: 0.5,
  fieldRecess: 0.4,
  maxRelief: 1.0,
  segments: 128,
  gridResolution: 256,
  isDoubleFaced: true,
  showRim: true,
  surfaceNoise: 0.05,
  imageOffsetX: 0,
  imageOffsetY: 0,
  topText: '',
  topTextSpan: 200,
  bottomText: '',
  bottomTextSpan: 100,
  textSize: 1.0,
  textDepthMm: 0.4,
  textFont: 'bold',
  signatureText: '',
  signatureFont: 'great-vibes',
  signatureSize: 1.0,
  signatureOffsetX: 0,
  signatureOffsetY: 0,
  medallionRingEnabled: false,
  medallionRingRadius: 0.62,
  medallionRingWidthMm: 1.0,
  medallionRingDepthMm: 1.5,
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
  gridResolution: 256,
  isDoubleFaced: false,
  showRim: true,
  surfaceNoise: 0.1,
  imageOffsetX: 0,
  imageOffsetY: 0,
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
  baseHeight: 5.5,
  rimWidth: 12.0,
  rimHeight: 4.0,
  fieldRecess: 0.0,
  maxRelief: 6.0,
  segments: 256,
  gridResolution: 256,
  isDoubleFaced: false,
  showRim: true,
  surfaceNoise: 0.15,
  imageOffsetX: 0,
  imageOffsetY: 0,
  topText: '',
  topTextSpan: 160,
  bottomText: '',
  bottomTextSpan: 90,
  textSize: 1.0,
  textDepthMm: 2.5,
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
  baseHeight: 1.2,
  rimWidth: 1.5,
  rimHeight: 0.7,
  fieldRecess: 0.0,
  maxRelief: 1.0,
  segments: 128,
  gridResolution: 256,
  isDoubleFaced: true,
  showRim: true,
  surfaceNoise: 0.05,
  imageOffsetX: 0,
  imageOffsetY: 0,
  topText: '',
  topTextSpan: 200,
  bottomText: '',
  bottomTextSpan: 100,
  textSize: 1.0,
  textDepthMm: 0.4,
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
  } = settings;

  // Limit gridResolution to prevent excessive memory usage and stack overflow
  const safeGridResolution = Math.min(gridResolution, 256);

  const radius = diameter / 2;
  const innerRadius = showRim ? radius - rimWidth : radius;
  const zField = baseHeight - fieldRecess;
  const zRim = showRim ? baseHeight + rimHeight : zField;

  // 1. Get AI Depth Data
  if (onProgress) onProgress("Initializing Image Data...");

  // Check if operation was cancelled
  if (signal?.aborted) {
    throw new Error('Operation cancelled');
  }

  // Validate image format before loading
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
  if (imageSrc.startsWith('data:')) {
    const mimeType = imageSrc.split(';')[0].split(':')[1];
    if (!supportedFormats.includes(mimeType)) {
      throw new Error(`Unsupported image format. Please use one of: JPG, PNG, GIF, BMP, or WebP.`);
    }
  }

  const img = new Image();
  // Only set crossOrigin for remote images (prevents iOS/Safari from throwing CORS errors on local blobs)
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
  
  // Enable high-quality image scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // COVER mode – scale image to fill the square, cropping overflow
  const imgAspect = img.width / img.height;
  let drawW = procRes;
  let drawH = procRes;
  let offsetX = 0;
  let offsetY = 0;

  if (imgAspect > 1) {
    // Wider than tall → scale height to fill, width overflows (crop sides)
    drawW = procRes * imgAspect;
    offsetX = (procRes - drawW) / 2;
  } else {
    // Taller than wide → scale width to fill, height overflows (crop top/bottom)
    drawH = procRes / imgAspect;
    offsetY = (procRes - drawH) / 2;
  }

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, procRes, procRes);

  // Apply imageOffset to the draw position so the portrait shifts on canvas.
  // Offsets are normalised (0.1 = 10% of canvas). We SUBTRACT so the slider
  // direction matches the label: positive X = portrait moves RIGHT (image left),
  // negative Y = portrait moves UP (image down), matching "▲ Up" on left side.
  const userOffsetXpx = imageOffsetX * procRes;
  const userOffsetYpx = imageOffsetY * procRes;
  ctx.drawImage(img, offsetX - userOffsetXpx, offsetY - userOffsetYpx, drawW, drawH);

  // ── FONT PRE-LOAD ─────────────────────────────────────────────────────────
  // Ensure Trajan Pro and Great Vibes are ready before canvas text drawing.
  // Without this, ctx.measureText returns widths for the fallback font and
  // the arc text stacks all glyphs at the same angle (effectively invisible).
  try {
    await Promise.all([
      document.fonts.load(`600 48px "Trajan Pro"`),
      document.fonts.load(`700 48px "Trajan Pro"`),
      document.fonts.load(`400 48px "Great Vibes"`),
    ]);
  } catch (_) {
    // Font load failed – canvas will fall back to serif/cursive, text still renders
  }

  // ── TEXT OVERLAY (TWO ARC SYSTEM) ─────────────────────────────────────────
  // Renders topText on the 10→2 o'clock arc and bottomText on the 7→5 o'clock arc.
  // Gray level is calibrated so the text relief matches textDepthMm after blending.
  //
  // Depth blend formula: depth = aiDepth*0.4 + luminance*0.6
  // For text pixels, aiDepth ≈ 0 (AI sees no 3D in a rendered glyph).
  // So: luminance needed = (textDepthMm/maxRelief) / 0.6
  const coinR = procRes / 2;
  const realRadius = diameter / 2; // mm
  const pxPerMm = coinR / realRadius;

  // Text arc radius: place text just inside the rim on every coin size.
  // Using a fixed 17 mm clearance breaks on small coins (39 mm pocket coin has
  // only 19.5 mm face radius — 17 mm clearance would push text to the centre).
  // Instead: start from the inner face edge (minus rim) and step inward ~5%.
  const rimWidthPx = (showRim ? rimWidth : 0) * pxPerMm;
  const innerFacePx = coinR - rimWidthPx;           // px radius of inner coin face
  // When rim is hidden we still need a meaningful edge clearance so text doesn't
  // crowd the coin boundary.  With rim shown the rim itself acts as the border;
  // without rim we substitute a virtual border of ~8% of the coin radius (or at
  // least 6 mm on large formats) so text sits comfortably inside on all sizes.
  const noRimBorder = Math.max(coinR * 0.11, 8 * pxPerMm);
  const edgeClearance = showRim ? coinR * 0.05 : noRimBorder;
  const textArcR = innerFacePx - edgeClearance;     // gap inside the face edge

  const drawArcText = (text: string, centreAngleDeg: number, arcSpanDeg: number, flipBaseline: boolean) => {
    if (!text || !text.trim()) return;
    const str = text.trim().toUpperCase();
    const weight = textFont === 'bold' ? '700' : '600';

    // Calibrate gray so text renders at textDepthMm
    const targetDepthNorm = Math.min(1.0, textDepthMm / Math.max(0.1, maxRelief));
    const textLuminance = Math.min(1.0, targetDepthNorm / 0.6);
    const g = Math.round(textLuminance * 255);

    // Max arc length the text is allowed to occupy (90% of the designated span)
    const maxArcAngleRad = (arcSpanDeg * 0.90 * Math.PI) / 180;
    const maxArcLen = maxArcAngleRad * textArcR;

    // Start at the ideal font size then shrink until text fits within arcSpanDeg.
    let fontSize = Math.round(Math.min(innerFacePx * 0.10, coinR * 0.08) * textSize);
    const minFontSize = Math.round(coinR * 0.015); // never go below ~1.5% of radius
    let widths: number[] = [];
    let totalW = 0;

    while (fontSize >= minFontSize) {
      ctx.font = `${weight} ${fontSize}px "Trajan Pro", serif`;
      widths = [];
      totalW = 0;
      for (const ch of str) {
        const w = ctx.measureText(ch).width + fontSize * 0.1;
        widths.push(w);
        totalW += w;
      }
      if (totalW <= maxArcLen) break; // fits — use this size
      fontSize = Math.round(fontSize * 0.92); // shrink 8% and retry
    }

    ctx.save();
    ctx.font = `${weight} ${fontSize}px "Trajan Pro", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Stroke same color as fill so it THICKENS the letters rather than outlining
    // them in dark (which creates a moat effect making thin strokes look broken).
    ctx.strokeStyle = `rgb(${g},${g},${g})`;
    ctx.lineWidth = fontSize * 0.09;   // mild thickening — fills thin serifs without bloating
    ctx.lineJoin = 'round';
    ctx.fillStyle = `rgb(${g},${g},${g})`;

    // Distribute characters evenly across the arc span
    const centreRad = (centreAngleDeg * Math.PI) / 180;

    const totalArcLen = totalW;
    const totalArcAngle = totalArcLen / textArcR;
    const startAngle = centreRad - totalArcAngle / 2;

    let cumAngle = startAngle;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const halfAngle = widths[i] / 2 / textArcR;
      const charAngle = cumAngle + halfAngle;

      const cx = coinR + Math.cos(charAngle) * textArcR;
      const cy = coinR + Math.sin(charAngle) * textArcR;

      ctx.save();
      ctx.translate(cx, cy);
      // ctx.rotate(charAngle + π/2) for both arcs:
      //   Top arc (centre 270°): at 270° → r=0 → local-X rightward → reads L→R,
      //     letter tops point outward (upward at 12 o'clock) → upright, readable normally.
      //   Bottom arc (centre 90°): at 90° → r=π → chars are 180°-rotated (upside-down
      //     in normal view). Increasing angles go right→left on screen, so the word
      //     appears reversed normally but reads correctly when coin is turned upside-down.
      ctx.rotate(charAngle + Math.PI / 2);
      ctx.strokeText(ch, 0, 0);
      ctx.fillText(ch, 0, 0);
      ctx.restore();

      cumAngle += widths[i] / textArcR;
    }
    ctx.restore();
  };

  // Top arc:    10 o'clock → 2 o'clock  (centred at top = 270°, span = 110°)
  // Bottom arc: 7 o'clock  → 5 o'clock  (centred at bottom = 90°, span = 60°)
  drawArcText(topText,    270, topTextSpan,    false); // top arc
  drawArcText(bottomText,  90, bottomTextSpan, true);  // bottom arc

  // ── SIGNATURE ─────────────────────────────────────────────────────────────
  // Font choice:
  //   'great-vibes' → flowing cursive (Great Vibes 400) — elegant but thin
  //   'trajan'      → Trajan Pro Bold — thick strokes, great for 3D printing
  if (signatureText && signatureText.trim().length > 0) {
    const targetDepthNorm = Math.min(1.0, textDepthMm / Math.max(0.1, maxRelief));
    const sigLuminance    = Math.min(1.0, targetDepthNorm / 0.6);
    const g               = Math.round(sigLuminance * 255);
    const sigFontSize     = Math.round(coinR * 0.09 * signatureSize);
    const useTrajan       = settings.signatureFont === 'trajan';

    ctx.save();
    ctx.font         = useTrajan
      ? `700 ${sigFontSize}px "Trajan Pro", serif`
      : `400 ${sigFontSize}px "Great Vibes", cursive`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = `rgb(${g},${g},${g})`;
    // Trajan: mild stroke to bolden thin serifs; Great Vibes: no stroke (script stays legible)
    if (useTrajan) {
      ctx.strokeStyle = `rgb(${g},${g},${g})`;
      ctx.lineWidth   = sigFontSize * 0.08;
      ctx.lineJoin    = 'round';
    } else {
      ctx.strokeStyle = `rgba(0,0,0,0)`;
      ctx.lineWidth   = 0;
    }

    // Anchor signature inside the medallion ring.
    const autoRingR = textArcR - coinR * 0.10;
    const sigX = coinR + signatureOffsetX * autoRingR;
    const sigY = coinR + autoRingR * 0.72 + signatureOffsetY * autoRingR;

    ctx.strokeText(signatureText, sigX, sigY);
    ctx.fillText(signatureText, sigX, sigY);
    ctx.restore();
  }

  // ── PORTRAIT MEDALLION BORDER RING ────────────────────────────────────────
  // A precise circular border ring drawn in code between the portrait area and
  // the text arc. Calibrated depth so the raised ring reads as a crisp boundary
  // line in the bronze casting (similar to a traditional coin's inner circle).
  //
  // Gray level: same formula as text — luminance = (depthMm/maxRelief) / 0.6
  // For casting: ring at ~1.5mm sits clearly above the field but below portrait.
  if (medallionRingEnabled) {
    // Auto-position: sit 10% of face radius inside the text arc so the ring
    // always falls cleanly between the portrait and the text band, regardless
    // of coin size or how much text is on the arc.
    const ringR = textArcR - coinR * 0.10;
    const targetNorm  = Math.min(1.0, medallionRingDepthMm / Math.max(0.1, maxRelief));
    const ringLum     = Math.min(1.0, targetNorm / 0.6);
    const g           = Math.round(ringLum * 255);
    const strokePx    = Math.max(1, medallionRingWidthMm * pxPerMm);

    ctx.save();
    ctx.strokeStyle = `rgb(${g},${g},${g})`;
    ctx.lineWidth   = strokePx;
    ctx.beginPath();
    ctx.arc(coinR, coinR, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // ──────────────────────────────────────────────────────────────────────────

  const origScaledData = ctx.getImageData(0, 0, procRes, procRes).data;

  // IMPORTANT: Export this exactly-squared, cropped image as the NEW source for AI
  // Use maximum resolution (1024) to preserve detail across the entire surface
  // This eliminates the resolution loss on the hemispheres
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

  // Check if operation was cancelled before starting AI processing
  if (signal?.aborted) {
    throw new Error('Operation cancelled');
  }

  const aiDepth: { data: Float32Array | Uint8Array, width: number, height: number } = await new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./depthWorker', import.meta.url), { type: 'module' });
    let resolved = false;
    let abortHandler: (() => void) | null = null;

    // Handle abortion
    abortHandler = () => {
      worker.terminate();
      if (!resolved) {
        resolved = true;
        reject(new Error('Operation cancelled'));
      }
    };
    if (signal) {
      signal.addEventListener('abort', abortHandler);
    }

    worker.onmessage = (e) => {
      if (resolved) return; // Ignore messages after resolution

      if (e.data.type === 'progress') {
        if (onProgress && !signal?.aborted) {
          const prog = e.data.data;
          if (prog.status === 'downloading') {
            onProgress(`Downloading Model: ${prog.file} (${Math.round(prog.progress)}%)`);
          } else if (prog.status === 'ready') {
            onProgress("Model Ready. Processing Image...");
          }
        }
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

  // FIX: Transpose the depth data if it's rotated 90 degrees
  // REMOVE THIS ENTIRE BLOCK - IT'S LIKELY BREAKING ALIGNMENT
  /*
  if (aiDepth.width === aiDepth.height) {
    // For square depth maps, check if we need to transpose
    // by creating a transposed copy
    const transposed = new Float32Array(aiDepth.width * aiDepth.height);
    for (let y = 0; y < aiDepth.height; y++) {
      for (let x = 0; x < aiDepth.width; x++) {
        transposed[x * aiDepth.height + y] = aiDepth.data[y * aiDepth.width + x];
      }
    }
    // Replace the data with transposed version
    aiDepth.data = transposed;
  }
  */

  if (onProgress) onProgress("Blending AI Depth & Surface Details...");

  // Normalize AI depth array
  let aiMin = Infinity, aiMax = -Infinity;
  for (let i = 0; i < aiDepth.data.length; i++) {
    const v = aiDepth.data[i];
    if (v < aiMin) aiMin = v;
    if (v > aiMax) aiMax = v;
  }
  
  const aiRange = aiMax - aiMin || 1;
  const aiCanvas = document.createElement('canvas');
  aiCanvas.width = aiDepth.width;
  aiCanvas.height = aiDepth.height;
  const aiCtx = aiCanvas.getContext('2d')!;
  const aiImgData = aiCtx.createImageData(aiDepth.width, aiDepth.height);
  
  for (let i = 0; i < aiDepth.data.length; i++) {
    const norm = (aiDepth.data[i] - aiMin) / aiRange;
    const val = norm * 255;
    aiImgData.data[i * 4] = val;
    aiImgData.data[i * 4 + 1] = val;
    aiImgData.data[i * 4 + 2] = val;
    aiImgData.data[i * 4 + 3] = 255;
  }
  aiCtx.putImageData(aiImgData, 0, 0);

  // Draw AI Depth map to scale. Note: It's ALREADY 1:1 match with our canvas because we sent the squared image!
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, procRes, procRes);
  ctx.drawImage(aiCanvas, 0, 0, procRes, procRes);
  const aiScaledData = ctx.getImageData(0, 0, procRes, procRes).data;

  let depthMap = new Float32Array(procRes * procRes);
  let minDepth = 1, maxDepth = 0;
  
  for (let i = 0; i < aiScaledData.length; i += 4) {
    const aiDepthVal = aiScaledData[i] / 255;
    
    // Calculate luminance of the original image (Rec. 601)
    const r = origScaledData[i];
    const g = origScaledData[i + 1];
    const b = origScaledData[i + 2];
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // HYBRID BLEND:
    // AI provides global 3D form (40%), Luminance provides surface detail like Text/Facial features (60%)
    let depthVal = aiDepthVal * 0.4 + luminance * 0.6;
    
    depthMap[i / 4] = depthVal;
    if (depthVal < minDepth) minDepth = depthVal;
    if (depthVal > maxDepth) maxDepth = depthVal;
  }

  const warnings: string[] = [];
  if (maxDepth - minDepth < 0.2) {
    warnings.push("Low contrast detected: Image lacks distinct light and dark areas. Relief may be flat.");
  }

  // Clean up: zero out very small depth values to ensure truly flat areas
  // This prevents noise from being applied to flat regions
  const noiseThreshold = 0.02; // Only consider values above this as having actual relief
  for (let i = 0; i < depthMap.length; i++) {
    if (depthMap[i] < noiseThreshold) {
      depthMap[i] = 0;
    }
  }

  // Light denoising only - preserve detail by reducing filter passes
  const initialDenoise = new Float32Array(procRes * procRes);
  let totalNoise = 0;
  for (let y = 1; y < procRes - 1; y++) {
    for (let x = 1; x < procRes - 1; x++) {
      let sum = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          sum += depthMap[(y + ky) * procRes + (x + kx)];
        }
      }
      const avg = sum / 9;
      initialDenoise[y * procRes + x] = avg;
      totalNoise += Math.abs(depthMap[y * procRes + x] - avg);
    }
  }
  // Copy edge pixels
  for (let x = 0; x < procRes; x++) {
    initialDenoise[x] = depthMap[x];
    initialDenoise[(procRes - 1) * procRes + x] = depthMap[(procRes - 1) * procRes + x];
  }
  for (let y = 0; y < procRes; y++) {
    initialDenoise[y * procRes] = depthMap[y * procRes];
    initialDenoise[y * procRes + procRes - 1] = depthMap[y * procRes + procRes - 1];
  }
  
  const noiseLevel = totalNoise / ((procRes - 2) * (procRes - 2));
  if (noiseLevel > 0.04) {
    warnings.push("High noise detected: Uploaded image is very noisy/grainy. 3D surface may be jagged.");
  }

  if (onWarnings) {
    onWarnings(warnings.length > 0 ? warnings : []);
  }

  depthMap.set(initialDenoise);

  // Skip median filters entirely - they soften edges and blur detail

  // Light normalization (reduced S-curve to preserve more contrast)
  const sorted = new Float32Array(depthMap).sort();
  const p2 = sorted[Math.floor(sorted.length * 0.02)]; 
  const p98 = sorted[Math.floor(sorted.length * 0.98)];
  const range = p98 - p2 + 1e-6;

  for (let i = 0; i < depthMap.length; i++) {
    let t = Math.max(0, Math.min(1, (depthMap[i] - p2) / range));
    depthMap[i] = t; // Linear normalization - no S-curve to preserve detail
  }

  // Slope limiting removed — the two-pass (forward + reverse) approach created
  // visible horizontal seam lines across the coin face where the passes met.

  // ── EMBOSS smoothing ─────────────────────────────────────────────────────
  // Emboss mode applies a gentle Gaussian blur to the depth map so that
  // transitions between high and low areas are rounded/bevelled rather than
  // sharp — giving the classic soft-pressed look of embossed coins/plaques.
  if (settings.reliefStyle === 'emboss') {
    const smoothed = new Float32Array(depthMap.length);
    const sigma = 3;
    const radius = 5;
    // Pre-compute kernel weights
    const kernel: number[] = [];
    let kSum = 0;
    for (let ky = -radius; ky <= radius; ky++) {
      for (let kx = -radius; kx <= radius; kx++) {
        const w = Math.exp(-(kx * kx + ky * ky) / (2 * sigma * sigma));
        kernel.push(w);
        kSum += w;
      }
    }
    for (let i = 0; i < kernel.length; i++) kernel[i] /= kSum;

    for (let y = radius; y < procRes - radius; y++) {
      for (let x = radius; x < procRes - radius; x++) {
        let sum = 0, ki = 0;
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            sum += depthMap[(y + ky) * procRes + (x + kx)] * kernel[ki++];
          }
        }
        smoothed[y * procRes + x] = sum;
      }
    }
    // Edge rows/cols: copy original
    for (let x = 0; x < procRes; x++) {
      for (let r = 0; r < radius; r++) {
        smoothed[r * procRes + x] = depthMap[r * procRes + x];
        smoothed[(procRes - 1 - r) * procRes + x] = depthMap[(procRes - 1 - r) * procRes + x];
      }
    }
    for (let y = 0; y < procRes; y++) {
      for (let r = 0; r < radius; r++) {
        smoothed[y * procRes + r] = depthMap[y * procRes + r];
        smoothed[y * procRes + (procRes - 1 - r)] = depthMap[y * procRes + (procRes - 1 - r)];
      }
    }
    // Blend: 80% smoothed + 20% sharp for some detail retention
    for (let i = 0; i < depthMap.length; i++) {
      depthMap[i] = 0.80 * smoothed[i] + 0.20 * depthMap[i];
    }
  }

  for (let i = 0; i < depthMap.length; i++) {
    let val = depthMap[i];
    if (val < 0.01) val = 0;
    // Emboss is raised (same as elevated), just with softened transitions
    if (settings.reliefStyle === 'embedded') val = 1.0 - val;
    depthMap[i] = val;
  }

  // === RE-APPLY CIRCULAR MASK (AFTER ALL FILTERING) ===
  const centerX = procRes / 2;
  const centerY = procRes / 2;
  const maxRadius = procRes / 2;

  for (let y = 0; y < procRes; y++) {
    for (let x = 0; x < procRes; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > maxRadius) {
        depthMap[y * procRes + x] = 0;
      }
    }
  }

  // === AUTO-DETECT CONTENT CIRCLE RADIUS ===
  // Goal: if the image has a white/bright margin around the coin design, zoom
  // the texture sampling so only the coin body fills the coin face — no flat
  // outer ring from the blank border.
  //
  // Algorithm:
  //  1. Probe 12 points at r=98% of maxRadius to measure background brightness.
  //  2. If avg lum > 0.85 → white border detected.
  //     Compute adaptive edge threshold = bgLum - 0.15 (catches the coin body
  //     boundary even when the metal is a medium gray/gold, not just dark text).
  //  3. Scan 64 angles from outside inward; record first radius where lum < threshold.
  //  4. Sort collected radii and take the 90th-percentile value.
  //     (p90 = coin boundary; the lower 10% that overshot to text rings are ignored.)
  //  5. contentFrac = p90 / maxRadius + 2% margin, clamped 0.5–1.0.
  //  6. Dark/fill-frame images → contentFrac stays 1.0.
  let contentFrac = 1.0;

  {
    // --- Step 1: measure outer background brightness ---
    const N_PROBE  = 12;
    const probeR   = Math.round(maxRadius * 0.98); // very close to edge, definitely background
    let bgLumSum   = 0;
    for (let a = 0; a < N_PROBE; a++) {
      const ang = (a / N_PROBE) * Math.PI * 2;
      const px  = Math.min(procRes - 1, Math.max(0, Math.round(centerX + Math.cos(ang) * probeR)));
      const py  = Math.min(procRes - 1, Math.max(0, Math.round(centerY + Math.sin(ang) * probeR)));
      const ii  = (py * procRes + px) * 4;
      bgLumSum += (0.299 * origScaledData[ii] + 0.587 * origScaledData[ii + 1] + 0.114 * origScaledData[ii + 2]) / 255;
    }
    const bgAvgLum = bgLumSum / N_PROBE;

    if (bgAvgLum > 0.85) {
      // Bright background → set an ADAPTIVE threshold: 15 % below background.
      // This catches the coin body boundary (medium gray/gold, lum ~0.7–0.85)
      // without needing to go all the way to dark text (lum ~0.3).
      const edgeThreshold = Math.max(0.55, bgAvgLum - 0.15);

      const N_SCAN = 64;
      const radii: number[] = [];

      for (let a = 0; a < N_SCAN; a++) {
        const ang  = (a / N_SCAN) * Math.PI * 2;
        const cosA = Math.cos(ang);
        const sinA = Math.sin(ang);
        // scan from the measured probe radius inward, 1-pixel steps
        for (let r = probeR; r >= Math.round(maxRadius * 0.25); r -= 1) {
          const px  = Math.min(procRes - 1, Math.max(0, Math.round(centerX + cosA * r)));
          const py  = Math.min(procRes - 1, Math.max(0, Math.round(centerY + sinA * r)));
          const ii  = (py * procRes + px) * 4;
          const lum = (0.299 * origScaledData[ii] + 0.587 * origScaledData[ii + 1] + 0.114 * origScaledData[ii + 2]) / 255;
          if (lum < edgeThreshold) {
            radii.push(r);
            break;
          }
        }
      }

      // Need at least half the angles to have hit something
      if (radii.length >= N_SCAN * 0.5) {
        // Sort and take 90th percentile — this is the coin BOUNDARY radius.
        // The lower 10 % (angles that overshot past bright metal into dark text)
        // are ignored, preventing contentFrac from being pulled too small.
        radii.sort((a, b) => a - b);
        const p90 = radii[Math.floor(radii.length * 0.90)];

        // Add 2% margin so the very rim of the coin body isn't clipped off
        contentFrac = Math.min(1.0, Math.max(0.5, (p90 + maxRadius * 0.02) / maxRadius));
      }
    }
    // Dark background or fill-frame: contentFrac stays 1.0
  }

  const radialSegments = Math.max(segments, Math.floor(safeGridResolution * Math.PI));
  const rings = Math.floor(safeGridResolution / 2);

  // Pre-calculate vertex count to use typed arrays instead of regular arrays
  // This avoids stack overflow from spread operators on large arrays
  const frontCenterCount = 1;
  const frontFaceRingsCount = rings * radialSegments;
  const frontOuterRimCount = radialSegments;
  const equatorCount = radialSegments;
  const baseOuterRimCount = radialSegments;
  const baseCenterCount = 1;
  const totalFrontVertices = frontCenterCount + frontFaceRingsCount + frontOuterRimCount + equatorCount + baseOuterRimCount + baseCenterCount;
  const totalVertices = settings.isDoubleFaced ? totalFrontVertices * 2 : totalFrontVertices;

  // Use Float32Array for better performance and to avoid stack overflow
  const vertices = new Float32Array(totalVertices * 3);
  const indices: number[] = [];
  const groups: { start: number, count: number, materialIndex: number }[] = [];

  // Helper to set vertex at index
  let vertexIndex = 0;
  const setVertex = (x: number, y: number, z: number) => {
    vertices[vertexIndex++] = x;
    vertices[vertexIndex++] = y;
    vertices[vertexIndex++] = z;
  };



  // Bilinear interpolation for sharp, predictable results
  const getDepthAt = (wx: number, wy: number) => {
    const dist = Math.sqrt(wx * wx + wy * wy);
    if (dist > innerRadius) return 0;

    const rNorm = dist / innerRadius;

    let angle = Math.atan2(wy, wx);
    if (angle < 0) angle += 2 * Math.PI;

    // contentFrac shrinks the texture radius so the auto-detected content
    // circle fills the coin face exactly — dark image margins are never sampled.
    // imageOffsetX/Y are applied at draw time (portrait shifted on canvas), so
    // the sampling centre stays at (0.5, 0.5).
    const sampledRadius = 0.5 * contentFrac;
    const tx = 0.5 + Math.cos(angle) * rNorm * sampledRadius;
    const ty = 0.5 - Math.sin(angle) * rNorm * sampledRadius; // Y flipped

    const u = tx * (procRes - 1);
    const v = ty * (procRes - 1);

    if (u < 0 || u >= procRes || v < 0 || v >= procRes) return 0;

    const x = Math.round(u);
    const y = Math.round(v);
    let depth = depthMap[y * procRes + x];

    // Feather depth to zero over the outer edge band so the face always tapers
    // cleanly to base level at the boundary. This gives the outer wall a uniform
    // height to drop from — no sawtooth / rough profile.
    const FEATHER_START = 0.985;
    if (rNorm > FEATHER_START) {
      const t = 1 - (rNorm - FEATHER_START) / (1 - FEATHER_START);
      depth *= t * t * (3 - 2 * t); // smoothstep to 0
    }

    return depth;
  };

  const applyNoise = (x: number, y: number, z: number, depth: number) => {
    if (surfaceNoise <= 0) return z;
    // Only apply surface noise to areas with actual relief depth
    // This prevents roughness on flat areas of the coin
    const noiseThreshold = 0.02; // Must match the threshold used in depth cleanup
    if (depth < noiseThreshold) return z;
    
    // Multi-layered noise for "cast metal" texture.
    // Frequencies are intentionally non-orthogonal so they don't alias into
    // radial lines near the centre pole.
    const n1 = Math.sin(x * 137 + y * 189) * Math.cos(x * 211 - y * 163);
    const n2 = Math.sin(x * 271 - y * 233) * Math.cos(x * 197 + y * 307);
    const combined = (n1 * 0.6 + n2 * 0.4);

    // Fade out noise over the inner 15% of the face radius so the dense
    // centre fan never shows noise-driven radial lines.
    const r = Math.sqrt(x * x + y * y);
    const fade = Math.min(1.0, r / (innerRadius * 0.15));

    return z + combined * surfaceNoise * 0.3 * fade;
  };

  // 1. BUILD FRONT HALF MESH FIRST
  
  const frontVertices: number[] = [];
  const frontIndices: number[] = [];

  // Face Center — average first 3 rings to stabilise the pole vertex height
  const frontCenterIdx = frontVertices.length / 3;
  let avgCenterDepth = 0;
  let centerCount = 0;
  for (let r = 1; r <= 3; r++) {
    for (let i = 0; i < radialSegments; i++) {
      const angle = (i / radialSegments) * Math.PI * 2;
      const ringRadius = (r / rings) * innerRadius;
      avgCenterDepth += getDepthAt(ringRadius * Math.cos(angle), ringRadius * Math.sin(angle));
      centerCount++;
    }
  }
  avgCenterDepth /= centerCount;
  frontVertices.push(0, 0, applyNoise(0, 0, zField + avgCenterDepth * maxRelief, avgCenterDepth));

  // Face Rings — raw depth throughout (no ring-averaging which distorts portrait)
  const frontFaceRingsStartIdx = frontVertices.length / 3;
  for (let r = 1; r <= rings; r++) {
    const rNormRing = r / rings;
    const ringRadius = rNormRing * innerRadius;
    for (let i = 0; i < radialSegments; i++) {
      const angle = (i / radialSegments) * Math.PI * 2;
      const x = ringRadius * Math.cos(angle);
      const y = ringRadius * Math.sin(angle);
      const depth = getDepthAt(x, y);
      frontVertices.push(x, y, applyNoise(x, y, zField + depth * maxRelief, depth));
    }
  }

  // Outer Rim (Top Edge)
  const frontOuterRimIdx = frontVertices.length / 3;
  for (let i = 0; i < radialSegments; i++) {
    const angle = (i / radialSegments) * Math.PI * 2;
    frontVertices.push(radius * Math.cos(angle), radius * Math.sin(angle), zRim);
  }

  // Outer Equator (Z=0)
  const equatorIdx = frontVertices.length / 3;
  for (let i = 0; i < radialSegments; i++) {
    const angle = (i / radialSegments) * Math.PI * 2;
    frontVertices.push(radius * Math.cos(angle), radius * Math.sin(angle), 0);
  }

  // Flat Base (Z=0, underneath the face exactly sealing at innerRadius)
  // We need to seal the equator to Z=0 for a watertight flat-backed coin
  const baseOuterRimIdx = frontVertices.length / 3;
  for (let i = 0; i < radialSegments; i++) {
    const angle = (i / radialSegments) * Math.PI * 2;
    frontVertices.push(radius * Math.cos(angle), radius * Math.sin(angle), 0);
  }
  const baseCenterIdx = frontVertices.length / 3;
  frontVertices.push(0, 0, 0);

  // BUILD INDICES FOR FRONT HALF
  // Face Center Fan (+Z normal)
  for (let i = 0; i < radialSegments; i++) {
    const next = (i + 1) % radialSegments;
    frontIndices.push(frontCenterIdx, frontFaceRingsStartIdx + i, frontFaceRingsStartIdx + next);
  }
  // Face Rings (+Z normal)
  for (let r = 0; r < rings - 1; r++) {
    const r1 = frontFaceRingsStartIdx + r * radialSegments;
    const r2 = frontFaceRingsStartIdx + (r + 1) * radialSegments;
    for (let i = 0; i < radialSegments; i++) {
      const next = (i + 1) % radialSegments;
      frontIndices.push(r1 + i, r2 + next, r1 + next);
      frontIndices.push(r1 + i, r2 + i, r2 + next);
    }
  }
  // Rim Top — face edge connects directly to outer rim (no inner wall, creates a bevel)
  const frontLastRingStart = frontFaceRingsStartIdx + (rings - 1) * radialSegments;
  for (let i = 0; i < radialSegments; i++) {
    const next = (i + 1) % radialSegments;
    frontIndices.push(frontLastRingStart + i, frontOuterRimIdx + next, frontLastRingStart + next);
    frontIndices.push(frontLastRingStart + i, frontOuterRimIdx + i, frontOuterRimIdx + next);
  }

  // Outer Edge Drop to Equator (+XY normal out)
  for (let i = 0; i < radialSegments; i++) {
    const next = (i + 1) % radialSegments;
    frontIndices.push(frontOuterRimIdx + i, equatorIdx + next, frontOuterRimIdx + next);
    frontIndices.push(frontOuterRimIdx + i, equatorIdx + i, equatorIdx + next);
  }

  // Base Plate (if single-faced, this fills Z=0)
  const singleFaceBaseIndices: number[] = [];
  for (let i = 0; i < radialSegments; i++) {
    const next = (i + 1) % radialSegments;
    singleFaceBaseIndices.push(baseCenterIdx, baseOuterRimIdx + next, baseOuterRimIdx + i); // -Z normal
  }


  // 2. COMPOSE FINAL MESH
  // Copy frontVertices to the main vertices array using setVertex
  for (let i = 0; i < frontVertices.length; i += 3) {
    setVertex(frontVertices[i], frontVertices[i+1], frontVertices[i+2]);
  }

  if (settings.isDoubleFaced) {
    // Pure Z Negation Mirrored Back - copy all front vertices with mirrored Z
    const frontVertexCount = vertexIndex / 3;
    for (let i = 0; i < frontVertexCount; i++) {
      const x = vertices[i * 3];
      const y = vertices[i * 3 + 1];
      const z = vertices[i * 3 + 2];
      setVertex(-x, y, -z);  // MIRROR X AND Z so text reads correctly from back
    }

    // Mirror indices (inverted winding C, B, A to maintain outward normals for negative Z)
    const mirroredIndices: number[] = [];
    const mirrorOffset = frontVertexCount;
    for (let i = 0; i < frontIndices.length; i += 3) {
      const a = frontIndices[i];
      const b = frontIndices[i+1];
      const c = frontIndices[i+2];
      mirroredIndices.push(mirrorOffset + c, mirrorOffset + b, mirrorOffset + a);
    }
    
    groups.push({ start: 0, count: frontIndices.length, materialIndex: 0 }); // Front
    groups.push({ start: frontIndices.length, count: mirroredIndices.length, materialIndex: 2 }); // Back
    
    // Use loop-based copy instead of spread operator
    for (let i = 0; i < frontIndices.length; i++) indices.push(frontIndices[i]);
    for (let i = 0; i < mirroredIndices.length; i++) indices.push(mirroredIndices[i]);

  } else {
    // Standard Flat Backed Coin
    groups.push({ start: 0, count: frontIndices.length, materialIndex: 0 }); // Front and Rim
    groups.push({ start: frontIndices.length, count: singleFaceBaseIndices.length, materialIndex: 2 }); // Flat Back

    // Use loop-based copy instead of spread operator
    for (let i = 0; i < frontIndices.length; i++) indices.push(frontIndices[i]);
    for (let i = 0; i < singleFaceBaseIndices.length; i++) indices.push(singleFaceBaseIndices[i]);
  }

  // Trim the vertices array to only include used vertices
  const finalVertices = vertices.slice(0, vertexIndex);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(finalVertices, 3));
  geometry.setIndex(new THREE.Uint32BufferAttribute(indices, 1));
  groups.forEach(group => geometry.addGroup(group.start, group.count, group.materialIndex));
  geometry.computeVertexNormals();

  // Smooth out normals in the centre fan to eliminate the spider-web shading.
  // computeVertexNormals() gives the pole (centre vertex) a normal that is the
  // average of all the fan triangle normals — which is (0,0,1) for a flat face
  // but can tilt radially when depth varies.  We force the centre to exactly
  // (0,0,1) and then blend the first NORMAL_SMOOTH_RINGS rings toward it so
  // the shading transitions gradually rather than flipping per-triangle.
  const normals = geometry.attributes.normal.array as Float32Array;
  const NORMAL_SMOOTH_RINGS = 2; // gentle blend — just enough to smooth the pole seam

  const smoothRingNormals = (startIdx: number, sign: number) => {
    // startIdx = frontFaceRingsStartIdx (front) or its back-face equivalent
    for (let r = 0; r < NORMAL_SMOOTH_RINGS; r++) {
      // blend factor: 1.0 for ring 0 (fully flat), 0 at ring NORMAL_SMOOTH_RINGS (fully computed)
      const blend = 1.0 - r / NORMAL_SMOOTH_RINGS;
      for (let i = 0; i < radialSegments; i++) {
        const base = (startIdx + r * radialSegments + i) * 3;
        let nx = normals[base]     * (1 - blend);       // toward 0
        let ny = normals[base + 1] * (1 - blend);       // toward 0
        let nz = normals[base + 2] * (1 - blend) + sign * blend; // toward ±1
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (len > 0) { nx /= len; ny /= len; nz /= len; }
        normals[base] = nx; normals[base + 1] = ny; normals[base + 2] = nz;
      }
    }
  };

  // Front face
  normals[0] = 0; normals[1] = 0; normals[2] = 1; // pole vertex
  smoothRingNormals(frontFaceRingsStartIdx, 1);

  // Back face (mirrored)
  if (settings.isDoubleFaced) {
    const backCenterIdx = totalFrontVertices * 3;
    normals[backCenterIdx] = 0; normals[backCenterIdx + 1] = 0; normals[backCenterIdx + 2] = -1;
    smoothRingNormals(totalFrontVertices + frontFaceRingsStartIdx, -1);
  }

  return geometry;
}

export function exportToSTL(geometry: THREE.BufferGeometry, filename: string = 'coin.stl') {
  const vertices = geometry.getAttribute('position').array;
  const indices = geometry.getIndex()?.array;
  if (!indices) return;
  
  const triangleCount = indices.length / 3;
  const buffer = new ArrayBuffer(80 + 4 + triangleCount * 50);
  const view = new DataView(buffer);
  
  // 80 byte blank header
  for (let i = 0; i < 80; i++) view.setUint8(i, 0);
  view.setUint32(80, triangleCount, true);

  let offset = 84;
  for (let i = 0; i < indices.length; i += 3) {
    const idx0 = indices[i];
    const idx1 = indices[i + 1];
    const idx2 = indices[i + 2];

    const v0x = vertices[idx0 * 3];
    const v0y = vertices[idx0 * 3 + 1];
    const v0z = vertices[idx0 * 3 + 2];

    const v1x = vertices[idx1 * 3];
    const v1y = vertices[idx1 * 3 + 1];
    const v1z = vertices[idx1 * 3 + 2];

    const v2x = vertices[idx2 * 3];
    const v2y = vertices[idx2 * 3 + 1];
    const v2z = vertices[idx2 * 3 + 2];

    // Compute Face Normal (Counter Clockwise rule)
    const ax = v1x - v0x;
    const ay = v1y - v0y;
    const az = v1z - v0z;

    const bx = v2x - v0x;
    const by = v2y - v0y;
    const bz = v2z - v0z;

    let nx = ay * bz - az * by;
    let ny = az * bx - ax * bz;
    let nz = ax * by - ay * bx;

    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (len > 0) {
      nx /= len;
      ny /= len;
      nz /= len;
    }

    // Write Normal (12 bytes)
    view.setFloat32(offset, nx, true);
    view.setFloat32(offset + 4, ny, true);
    view.setFloat32(offset + 8, nz, true);
    offset += 12;

    // Write Vertices (36 bytes)
    view.setFloat32(offset, v0x, true);
    view.setFloat32(offset + 4, v0y, true);
    view.setFloat32(offset + 8, v0z, true);
    offset += 12;

    view.setFloat32(offset, v1x, true);
    view.setFloat32(offset + 4, v1y, true);
    view.setFloat32(offset + 8, v1z, true);
    offset += 12;

    view.setFloat32(offset, v2x, true);
    view.setFloat32(offset + 4, v2y, true);
    view.setFloat32(offset + 8, v2z, true);
    offset += 12;

    // Write Attribute Byte Count (2 bytes)
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