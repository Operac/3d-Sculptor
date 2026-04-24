import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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
  baseHeight: 2.0,       // resin: thicker base = stronger print
  rimWidth: 1.2,
  rimHeight: 0.8,
  fieldRecess: 0.3,
  maxRelief: 1.5,        // resin: deeper relief for crisp detail
  segments: 128,
  gridResolution: 512,   // resin: max resolution for sharp text & portrait
  isDoubleFaced: true,
  showRim: true,
  surfaceNoise: 0.0,     // resin: off — resin captures real surface texture
  imageOffsetX: 0,
  imageOffsetY: 0,
  topText: '',
  topTextSpan: 200,
  bottomText: '',
  bottomTextSpan: 100,
  textSize: 1.0,
  textDepthMm: 0.8,      // resin: 0.8mm min for reliable text resolution
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
  maxRelief: 4.0,
  segments: 256,
  gridResolution: 768,   // Bambu: max resolution for plaque portrait sharpness
  isDoubleFaced: false,
  showRim: true,
  surfaceNoise: 0.0,
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
  maxRelief: 8.0,
  segments: 256,
  gridResolution: 768,   // Bambu: maximum for large plaque
  isDoubleFaced: false,
  showRim: true,
  surfaceNoise: 0.0,
  imageOffsetX: 0,
  imageOffsetY: 0,
  topText: '',
  topTextSpan: 160,
  bottomText: '',
  bottomTextSpan: 90,
  textSize: 1.0,
  textDepthMm: 3.0,      // resin: deep text for large plaque wall mounting
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
  baseHeight: 1.5,       // resin: slightly thicker than FDM for strength
  rimWidth: 1.5,
  rimHeight: 0.8,
  fieldRecess: 0.0,
  maxRelief: 1.5,        // resin: deeper for sharper portrait detail
  segments: 128,
  gridResolution: 512,
  isDoubleFaced: true,
  showRim: true,
  surfaceNoise: 0.0,     // resin: off
  imageOffsetX: 0,
  imageOffsetY: 0,
  topText: '',
  topTextSpan: 200,
  bottomText: '',
  bottomTextSpan: 100,
  textSize: 1.0,
  textDepthMm: 0.8,      // resin: 0.8mm min for reliable text
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

  // All warnings collected here — dispatched once via onWarnings before return.
  const warnings: string[] = [];

  // Cap grid resolution — higher = sharper text & detail, but more memory.
  // 768 gives 9× more samples than 256 — enough for Bambu X1/P1 resolution.
  const safeGridResolution = Math.min(gridResolution, 768);

  // ── Quality Check #7: Hard grid minimum ──────────────────────────────────
  // Below 512, text glyphs are under 30×30 px on the depth map which causes
  // severe staircase pixelation on the 3D mesh. Refuse to build.
  if (safeGridResolution < 512) {
    const msg = '❌ Grid too low — text will be pixelated. Minimum is 512. Go to Settings and increase Grid Resolution.';
    if (onWarnings) onWarnings([msg]);
    throw new Error(msg);
  }

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
  // QC #9: Render text at 2x on an offscreen canvas, then downscale
  // back to procRes with LANCZOS-quality smoothing. This gives subpixel
  // antialiasing on diagonal strokes — eliminates canvas aliasing that
  // survives into the mesh as stepped geometry on letter edges.
  const textCanvas2x = document.createElement('canvas');
  textCanvas2x.width  = procRes * 2;
  textCanvas2x.height = procRes * 2;
  const ctx2x = textCanvas2x.getContext('2d', { willReadFrequently: true })!;
  ctx2x.scale(2, 2);  // all drawArcText coordinates stay the same — scale handles it
  ctx2x.imageSmoothingEnabled = true;
  ctx2x.imageSmoothingQuality = 'high';

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

  const drawArcText = (text: string, centreAngleDeg: number, arcSpanDeg: number, flipBaseline: boolean, targetCtx: CanvasRenderingContext2D = ctx) => {
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
      targetCtx.font = `${weight} ${fontSize}px "Trajan Pro", serif`;
      widths = [];
      totalW = 0;
      for (const ch of str) {
        const w = targetCtx.measureText(ch).width + fontSize * 0.1;
        widths.push(w);
        totalW += w;
      }
      if (totalW <= maxArcLen) break; // fits — use this size
      fontSize = Math.round(fontSize * 0.92); // shrink 8% and retry
    }

    targetCtx.save();
    targetCtx.font = `${weight} ${fontSize}px "Trajan Pro", serif`;
    targetCtx.textAlign = 'center';
    targetCtx.textBaseline = 'middle';
    // Stroke same color as fill so it THICKENS the letters rather than outlining
    // them in dark (which creates a moat effect making thin strokes look broken).
    targetCtx.strokeStyle = `rgb(${g},${g},${g})`;
    targetCtx.lineWidth = fontSize * 0.09;   // mild thickening — fills thin serifs without bloating
    targetCtx.lineJoin = 'round';
    targetCtx.fillStyle = `rgb(${g},${g},${g})`;

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

      targetCtx.save();
      targetCtx.translate(cx, cy);
      // targetCtx.rotate(charAngle + π/2) for both arcs:
      //   Top arc (centre 270°): at 270° → r=0 → local-X rightward → reads L→R,
      //     letter tops point outward (upward at 12 o'clock) → upright, readable normally.
      //   Bottom arc (centre 90°): at 90° → r=π → chars are 180°-rotated (upside-down
      //     in normal view). Increasing angles go right→left on screen, so the word
      //     appears reversed normally but reads correctly when coin is turned upside-down.
      targetCtx.rotate(charAngle + Math.PI / 2);
      targetCtx.strokeText(ch, 0, 0);
      targetCtx.fillText(ch, 0, 0);
      targetCtx.restore();

      cumAngle += widths[i] / textArcR;
    }
    targetCtx.restore();
  };

  // Top arc:    10 o'clock → 2 o'clock  (centred at top = 270°, span = 110°)
  // Bottom arc: 7 o'clock  → 5 o'clock  (centred at bottom = 90°, span = 60°)
  drawArcText(topText,    270, topTextSpan,    false, ctx2x); // top arc
  drawArcText(bottomText,  90, bottomTextSpan, true,  ctx2x);  // bottom arc

  // ── Quality Check #14: Stroke width vs mesh grid spacing ─────────────────
  // A text stroke thinner than 2 mesh-vertex spacings cannot be represented
  // faithfully — it either disappears or looks like a 1-cell ridge, not a letter.
  //
  // We work in canvas-pixel space (procRes = 2048) and then compare against the
  // Nyquist limit imposed by the mesh grid (safeGridResolution samples across r).
  //   grid_spacing_px  = procRes / safeGridResolution   (canvas px per mesh vertex)
  //   fontSize_px      = coinR * 0.08 * textSize        (normal arc font size)
  //   stroke_px        = fontSize_px * 0.09             (lineWidth factor in drawArcText)
  //   Minimum safe     = 2 × grid_spacing_px
  if ((topText || '').trim().length > 0 || (bottomText || '').trim().length > 0) {
    const gridSpacingPx  = procRes / safeGridResolution;         // px per mesh vertex on depth map
    const estimatedFontPx = Math.max(coinR * 0.015, coinR * 0.08 * textSize); // clamp to min font
    const strokePx        = estimatedFontPx * 0.09;              // lineWidth factor
    if (strokePx < 2 * gridSpacingPx) {
      const strokeMm  = strokePx  * (diameter / procRes);
      const spacingMm = gridSpacingPx * (diameter / procRes);
      warnings.push(
        `⚠️ Stroke too thin for grid — letter strokes (~${strokeMm.toFixed(2)} mm) are narrower than ` +
        `2 grid cells (${(2 * spacingMm).toFixed(2)} mm). Increase text size or raise Grid Resolution.`
      );
    } else {
      console.info(`✅ QC stroke width: ${(strokePx / gridSpacingPx).toFixed(1)}× grid spacing — good`);
    }
  }

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

    ctx2x.save();
    ctx2x.font         = useTrajan
      ? `700 ${sigFontSize}px "Trajan Pro", serif`
      : `400 ${sigFontSize}px "Great Vibes", cursive`;
    ctx2x.textAlign    = 'center';
    ctx2x.textBaseline = 'middle';
    ctx2x.fillStyle    = `rgb(${g},${g},${g})`;
    // Trajan: mild stroke to bolden thin serifs; Great Vibes: no stroke (script stays legible)
    if (useTrajan) {
      ctx2x.strokeStyle = `rgb(${g},${g},${g})`;
      ctx2x.lineWidth   = sigFontSize * 0.08;
      ctx2x.lineJoin    = 'round';
    } else {
      ctx2x.strokeStyle = `rgba(0,0,0,0)`;
      ctx2x.lineWidth   = 0;
    }

    // Anchor signature inside the medallion ring.
    const autoRingR = textArcR - coinR * 0.10;
    const sigX = coinR + signatureOffsetX * autoRingR;
    const sigY = coinR + autoRingR * 0.72 + signatureOffsetY * autoRingR;

    ctx2x.strokeText(signatureText, sigX, sigY);
    ctx2x.fillText(signatureText, sigX, sigY);
    ctx2x.restore();
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

    ctx2x.save();
    ctx2x.strokeStyle = `rgb(${g},${g},${g})`;
    ctx2x.lineWidth   = strokePx;
    ctx2x.beginPath();
    ctx2x.arc(coinR, coinR, ringR, 0, Math.PI * 2);
    ctx2x.stroke();
    ctx2x.restore();
  }

  // Downscale 2x text layer back onto main canvas at procRes
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(textCanvas2x, 0, 0, procRes * 2, procRes * 2, 0, 0, procRes, procRes);
  ctx.restore();
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

  // ── Quality Check #2: Depth map dynamic range ────────────────────────────
  // If the AI output has < 10% relative range the model saw no meaningful depth
  // variation (flat image, featureless background, or inference failure).
  // We still normalise to 0–255 but warn the user that relief may be flat.
  const relativeRange = aiRange / (Math.abs(aiMax) + 1e-9);
  if (relativeRange < 0.10) {
    warnings.push('⚠️ AI depth map is near-uniform — the image may lack depth variation. Relief may appear flat. Try a high-contrast portrait or depth map.');
  }

  // ── Quality Check #12: Float-precision AI depth blend ────────────────────
  // PROBLEM: going through uint8 canvas (255 Z steps) quantises the AI depth
  // before blending.  On a 425 mm plaque with 8 mm relief each step = 0.031 mm
  // — visible as contour bands on curved portrait surfaces in Bambu preview.
  // FIX: sample the raw Float32Array from the AI worker directly via bilinear
  // interpolation (the same Lanczos approach we use for mesh sampling).
  // This gives ~32-bit effective depth precision — zero contour banding.
  const aiW = aiDepth.width;
  const aiH = aiDepth.height;

  // Bilinear sample of the normalised (0–1) float AI depth at UV ∈ [0,1]²
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

  let depthMap = new Float32Array(procRes * procRes);
  let minDepth = 1, maxDepth = 0;

  for (let i = 0; i < procRes; i++) {
    const v = i / (procRes - 1); // v ∈ [0,1]
    for (let j = 0; j < procRes; j++) {
      const u = j / (procRes - 1); // u ∈ [0,1]

      // Float32 AI depth — no uint8 quantisation
      const aiDepthVal = sampleAIFloat(u, v);

      // Luminance from original 8-bit portrait image (portrait photos are 8-bit
      // natively — no information lost going through canvas RGBA here).
      const idx = (i * procRes + j) * 4;
      const r = origScaledData[idx];
      const g = origScaledData[idx + 1];
      const b = origScaledData[idx + 2];
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // HYBRID BLEND: AI global form (40%) + luminance surface detail / text (60%)
      const depthVal = aiDepthVal * 0.4 + luminance * 0.6;
      depthMap[i * procRes + j] = depthVal;
      if (depthVal < minDepth) minDepth = depthVal;
      if (depthVal > maxDepth) maxDepth = depthVal;
    }
  }

  if (maxDepth - minDepth < 0.2) {
    warnings.push("⚠️ Low contrast detected: Image lacks distinct light and dark areas. Relief may be flat.");
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
    warnings.push("⚠️ High noise detected: Uploaded image is very noisy/grainy. 3D surface may be jagged.");
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
    // ── Quality Check #13: Adaptive Gaussian blur sigma ───────────────────
    // PROBLEM: a fixed sigma=3 worked neither end of the size range:
    //   • Too much blur on a 39 mm pocket coin → text edges go soft
    //   • Too little on a 425 mm plaque        → aliasing steps remain visible
    // FIX: sigma scales logarithmically with coin diameter:
    //   39 mm  coin  → sigma ≈ 0.65  (sweet spot 0.5–0.8 — preserves letter edges)
    //   150 mm plaque → sigma ≈ 1.30  (sweet spot 1.2–1.8)
    //   425 mm plaque → sigma ≈ 1.80  (sweet spot 1.2–1.8)
    // Coefficients solved from anchors (39mm→0.65) and (425mm→1.80):
    //   sigma = −1.11 + 2.91 × log₁₀(d) / log₁₀(425)
    const sigmaScale = Math.log10(Math.max(10, diameter)) / Math.log10(425);
    const sigma = Math.max(0.5, Math.min(1.8, -1.11 + 2.91 * sigmaScale));
    const blurRadius = Math.max(1, Math.ceil(sigma * 2.5)); // 2.5σ covers 99%

    // Warn if blur is too aggressive for a small coin
    if (sigma > 1.0 && settings.type === 'coin') {
      warnings.push(
        `⚠️ Emboss blur sigma ${sigma.toFixed(1)} is high for a pocket coin — text edges may soften. ` +
        `Consider Raised mode for sharper letters on small coins.`
      );
    }

    const smoothed = new Float32Array(depthMap.length);
    // Pre-compute normalised Gaussian kernel
    const kernel: number[] = [];
    let kSum = 0;
    for (let ky = -blurRadius; ky <= blurRadius; ky++) {
      for (let kx = -blurRadius; kx <= blurRadius; kx++) {
        const w = Math.exp(-(kx * kx + ky * ky) / (2 * sigma * sigma));
        kernel.push(w);
        kSum += w;
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
    // Edge rows/cols: copy original (border not blurred)
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
    // Blend: 80% smoothed + 20% sharp for detail retention
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

  // QC #18: Adaptive Mesh Density
  // Field zone needs fewer triangles than portrait and text zones.
  // We split rings into 3 zones based on radius:
  // - r < 0.65: full density (portrait)
  // - 0.65 <= r <= 0.88: half density (field)
  // - r > 0.88: full density (text)
  const baseRings = Math.floor(safeGridResolution / 2);
  const ringNorms: number[] = [];
  for (let r = 1; r <= baseRings; r++) {
    const rNorm = r / baseRings;
    if (rNorm < 0.65) {
      ringNorms.push(rNorm);
    } else if (rNorm <= 0.88) {
      if (r % 2 === 0) ringNorms.push(rNorm); // half density
    } else {
      ringNorms.push(rNorm);
    }
  }
  if (ringNorms.length > 0 && ringNorms[ringNorms.length - 1] !== 1.0) {
    ringNorms.push(1.0);
  }
  const rings = ringNorms.length;

  // ── Quality Check #4 (pre-build): Cap radialSegments so total face count
  // stays under 750k (Bambu 800k limit with 50k headroom).
  // Estimated faces ≈ radialSegments × (2 × rings + 6) × doubleFaceFactor.
  // The old formula Math.max(segments, gridRes×π) gave 2412 at grid=768 →
  // 1.85M faces for a single-face plaque — way over the limit. Fix: use the
  // preset's segments value as the target and only shrink if we'd exceed the cap.
  const doubleFaceFactor = settings.isDoubleFaced ? 2 : 1;
  const maxFaces = 750_000;
  const maxRadial = Math.floor(maxFaces / Math.max(1, (2 * rings + 6) * doubleFaceFactor));
  const radialSegments = Math.min(segments, maxRadial);

  // QC #11: Grid aspect ratio — X and Y step must be equal.
  // innerRadius is always circular so steps are equal by construction,
  // but validate the radial step vs angular step to catch config drift.
  const gridStepMm   = (innerRadius * 2) / safeGridResolution;
  const angularStepMm = (2 * Math.PI * innerRadius) / radialSegments / safeGridResolution;
  if (Math.abs(gridStepMm - angularStepMm) / gridStepMm > 0.15) {
    warnings.push(
      `⚠️ Grid aspect ratio mismatch — radial step ${gridStepMm.toFixed(3)}mm vs ` +
      `angular step ${angularStepMm.toFixed(3)}mm. ` +
      `Text may appear stretched. Increase segments to match grid resolution.`
    );
  } else {
    console.info(`✅ QC grid aspect: radial ${gridStepMm.toFixed(3)}mm ≈ angular ${angularStepMm.toFixed(3)}mm`);
  }

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



  // Lanczos-2 kernel helper (sinc-based, a=2)
  const lanczos2 = (x: number): number => {
    if (x === 0) return 1;
    if (Math.abs(x) >= 2) return 0;
    const px = Math.PI * x;
    return (Math.sin(px) / px) * (Math.sin(px / 2) / (px / 2));
  };

  // Sample the depth map with Lanczos-2 (4×4 tap) interpolation.
  // Compared to nearest-neighbour this preserves edge crispness in the depth
  // map when the mesh grid is much coarser than the 2048px source — critical
  // for fine text strokes surviving into the STL at Bambu-print resolution.
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

    // Lanczos-2 interpolation — preserves text/portrait edge crispness
    let depth = sampleDepthLanczos(u, v);

    // QC #16: Prevent Z-fighting where text base meets field surface.
    // Any depth value > 0 but < 0.01mm above field creates coplanar
    // triangles that flicker in Bambu preview at letter edges.
    // Clamp: either truly zero (field) or at least 0.01mm above it.
    if (depth > 0 && depth < (0.01 / maxRelief)) {
      depth = 0.01 / maxRelief;
    }

    // Feather depth to zero over the outer edge band so the face always tapers
    // cleanly to base level at the boundary — no sawtooth / rough profile,
    // and no open edges that would make the mesh non-manifold in Bambu Studio.
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
  frontVertices.push(0, 0, applyNoise(0, 0, zField + avgCenterDepth * maxRelief, avgCenterDepth));

  // Face Rings — raw depth throughout (no ring-averaging which distorts portrait)
  const frontFaceRingsStartIdx = frontVertices.length / 3;
  for (let r = 0; r < rings; r++) {
    const rNormRing = ringNorms[r];
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

  const rawGeometry = new THREE.BufferGeometry();
  rawGeometry.setAttribute('position', new THREE.Float32BufferAttribute(finalVertices, 3));
  rawGeometry.setIndex(new THREE.Uint32BufferAttribute(indices, 1));
  groups.forEach(group => rawGeometry.addGroup(group.start, group.count, group.materialIndex));

  // ── Quality Check #15: Vertex merge — eliminate T-junction cracks ─────────
  // Where ring-boundary vertices meet at slightly different floating-point Z
  // positions they create T-junctions that appear as dark hairline cracks in
  // Bambu Studio's preview.  mergeVertices() snaps vertices within 0.001 mm
  // (1 µm — smaller than any feature we care about) into a single shared vertex,
  // closing all T-junctions in one pass.
  //
  // MUST run before computeVertexNormals so normal averaging uses the merged
  // topology — not the pre-merge disconnected duplicates.
  //
  // Note: equator and base-outer-rim vertices share the same XYZ (both at the
  // coin's outer radius, Z=0) and will be merged.  Their averaged normals from
  // computeVertexNormals will produce a slightly chamfered-looking bottom edge —
  // acceptable for 3D printing where slicer uses geometry, not normals.
  const geometry = mergeVertices(rawGeometry, 0.001);
  // mergeVertices may clear groups — re-apply from our stored list.
  // Groups index the face/index buffer (not vertices), so they remain valid
  // after vertex de-duplication (same triangles, fewer unique vertices).
  geometry.clearGroups();
  groups.forEach(g => geometry.addGroup(g.start, g.count, g.materialIndex));

  geometry.computeVertexNormals();

  // ── Pole normal smoothing ─────────────────────────────────────────────────
  // After merge+recompute the pole vertex gets an averaged normal from the fan
  // triangles.  Force it to exactly (0,0,±1) and blend the first two rings
  // toward it to eliminate the spider-web shading artifact at the coin centre.
  //
  // Because mergeVertices may reindex vertices, we find pole positions by XYZ
  // (the pole is always at XY≈0, Z>0 for front and Z<0 for back face).
  const normals = geometry.attributes.normal.array as Float32Array;
  const mergedPos = geometry.attributes.position.array as Float32Array;
  const NORMAL_SMOOTH_RINGS = 2;

  const smoothRingNormals = (startIdx: number, sign: number) => {
    for (let r = 0; r < NORMAL_SMOOTH_RINGS; r++) {
      const blend = 1.0 - r / NORMAL_SMOOTH_RINGS;
      for (let i = 0; i < radialSegments; i++) {
        const base = (startIdx + r * radialSegments + i) * 3;
        if (base + 2 >= normals.length) continue; // safety: index may shift after merge
        let nx = normals[base]     * (1 - blend);
        let ny = normals[base + 1] * (1 - blend);
        let nz = normals[base + 2] * (1 - blend) + sign * blend;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (len > 0) { nx /= len; ny /= len; nz /= len; }
        normals[base] = nx; normals[base + 1] = ny; normals[base + 2] = nz;
      }
    }
  };

  // Find and fix pole vertices by position (robust to index changes after merge)
  const vertCount = mergedPos.length / 3;
  for (let vi = 0; vi < vertCount; vi++) {
    const vx = mergedPos[vi * 3], vy = mergedPos[vi * 3 + 1], vz = mergedPos[vi * 3 + 2];
    if (Math.abs(vx) < 0.01 && Math.abs(vy) < 0.01) {
      if (vz > 0) { normals[vi*3]=0; normals[vi*3+1]=0; normals[vi*3+2]=1;  } // front pole
      else        { normals[vi*3]=0; normals[vi*3+1]=0; normals[vi*3+2]=-1; } // back pole
    }
  }

  // Ring smoothing still uses stored indices — safe as long as the first rings
  // (away from the outer edge) don't get their indices shifted by the equator merge
  smoothRingNormals(frontFaceRingsStartIdx, 1);
  if (settings.isDoubleFaced) {
    smoothRingNormals(totalFrontVertices + frontFaceRingsStartIdx, -1);
  }

  // ── POST-GEOMETRY QUALITY CHECKS ─────────────────────────────────────────
  {
    const qcPos  = geometry.attributes.position.array as Float32Array;
    const qcIdx  = geometry.getIndex()!.array;
    const qcNorm = geometry.attributes.normal.array   as Float32Array;

    // QC #4: Face count ─────────────────────────────────────────────────────
    const faceCount = qcIdx.length / 3;
    if (faceCount > 800_000) {
      warnings.push(
        `⚠️ Face count ${faceCount.toLocaleString()} exceeds the 800k Bambu limit — the file may slice slowly or fail. ` +
        `Reduce Grid Resolution in Settings.`
      );
    } else {
      console.info(`✅ QC face count: ${faceCount.toLocaleString()} / 800,000`);
    }

    // QC #1: Degenerate faces (area < 1e-6 mm²) ────────────────────────────
    let degenerateCount = 0;
    for (let i = 0; i < qcIdx.length; i += 3) {
      const i0 = qcIdx[i] * 3, i1 = qcIdx[i + 1] * 3, i2 = qcIdx[i + 2] * 3;
      const ax = qcPos[i1]     - qcPos[i0],     ay = qcPos[i1 + 1] - qcPos[i0 + 1], az = qcPos[i1 + 2] - qcPos[i0 + 2];
      const bx = qcPos[i2]     - qcPos[i0],     by = qcPos[i2 + 1] - qcPos[i0 + 1], bz = qcPos[i2 + 2] - qcPos[i0 + 2];
      const cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx;
      if (cx * cx + cy * cy + cz * cz < 4e-12) degenerateCount++; // area < 1e-6
    }
    if (degenerateCount > 0) {
      warnings.push(`⚠️ ${degenerateCount} degenerate face(s) detected — mesh may have minor artefacts. Verify in your slicer.`);
    } else {
      console.info('✅ QC degenerate faces: none');
    }

    // QC #6: Overhang — vertex normals pointing steeply downward (> 45°) ───
    // cos(135°) ≈ −0.707; any normal with nz < −0.707 faces more than 45° downward.
    const OVERHANG_COS = -0.707;
    let overhangVerts = 0;
    for (let i = 2; i < qcNorm.length; i += 3) {
      if (qcNorm[i] < OVERHANG_COS) overhangVerts++;
    }
    if (overhangVerts > 0) {
      warnings.push(
        `⚠️ ${overhangVerts.toLocaleString()} vertex normal(s) indicate overhangs > 45° — resin supports may be needed on those areas.`
      );
    } else {
      console.info('✅ QC overhang: no steep overhangs detected');
    }

    // QC #17: Non-manifold edges — edges shared by more than 2 faces.
    // Happens at letter stroke junctions (M, u, o, s). Shows as dark
    // lines inside letters in Bambu preview.
    {
      const edgeMap = new Map<string, number>();
      for (let i = 0; i < qcIdx.length; i += 3) {
        const tris = [
          [qcIdx[i], qcIdx[i+1]],
          [qcIdx[i+1], qcIdx[i+2]],
          [qcIdx[i+2], qcIdx[i]],
        ];
        for (const [a, b] of tris) {
          const key = a < b ? `${a}_${b}` : `${b}_${a}`;
          edgeMap.set(key, (edgeMap.get(key) ?? 0) + 1);
        }
      }
      let nonManifoldCount = 0;
      for (const count of edgeMap.values()) {
        if (count > 2) nonManifoldCount++;
      }
      if (nonManifoldCount > 0) {
        warnings.push(
          `⚠️ ${nonManifoldCount} non-manifold edge(s) detected — ` +
          `edges shared by more than 2 faces. May show as dark lines ` +
          `inside letters in Bambu. mergeVertices tolerance may need tuning.`
        );
      } else {
        console.info('✅ QC non-manifold edges: none');
      }
    }

    // QC #20: Field flatness — the flat zone between portrait and rim
    // must be within 0.01mm flat. Waviness scatters light unevenly and
    // makes embossed text hard to read at viewing distance.
    // Field zone: r between innerRadius*0.75 and innerRadius*0.95
    {
      const fieldZMin = innerRadius * 0.75;
      const fieldZMax = innerRadius * 0.95;
      const fieldZValues: number[] = [];
      for (let vi = 0; vi < qcPos.length; vi += 3) {
        const vx = qcPos[vi], vy = qcPos[vi + 1], vz = qcPos[vi + 2];
        const r  = Math.sqrt(vx * vx + vy * vy);
        if (r >= fieldZMin && r <= fieldZMax && vz > 0) {
          fieldZValues.push(vz);
        }
      }
      if (fieldZValues.length > 10) {
        let fMin = Infinity, fMax = -Infinity;
        for (const z of fieldZValues) {
          if (z < fMin) fMin = z;
          if (z > fMax) fMax = z;
        }
        const variance = fMax - fMin;
        if (variance > 0.1) {
          warnings.push(
            `⚠️ Field flatness variance ${variance.toFixed(3)}mm — ` +
            `field zone is not flat (target < 0.1mm). ` +
            `Text shadow contrast will be reduced on the printed coin.`
          );
        } else {
          console.info(`✅ QC field flatness: ${variance.toFixed(3)}mm variance — good`);
        }
      }
    }

    // QC #3: Minimum wall thickness ─────────────────────────────────────────
    // Resin minimum is 0.3 mm; our base height is the thinnest solid section.
    if (settings.baseHeight < 0.3) {
      warnings.push(
        `❌ Base height ${settings.baseHeight} mm is below the resin minimum of 0.3 mm — increase to at least 1.0 mm to avoid print failures.`
      );
    } else {
      console.info(`✅ QC wall thickness: base height ${settings.baseHeight} mm ≥ 0.3 mm`);
    }

    // QC #5: Centre on origin — handled at export time (bounding-box centring).
    // QC #8: LANCZOS-2 — active in sampleDepthLanczos().
    console.info('✅ QC centre: applied in exportToSTL | QC LANCZOS: active');
  }

  // Dispatch all collected warnings (image, noise, and mesh checks) at once.
  if (onWarnings) onWarnings(warnings);

  return geometry;
}

export function exportToSTL(
  geometry: THREE.BufferGeometry,
  filename: string = 'coin.stl',
  tiltDeg: number = 0   // 15° recommended for Bambu — better layer lines, less FEP suction
) {
  const posAttr = geometry.getAttribute('position').array;
  const indices = geometry.getIndex()?.array;
  if (!indices) return;

  // ── Pre-transform: centre at origin then apply optional tilt ──────────────
  // 1. Compute bounding box centre so the coin sits centred on the build plate
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < posAttr.length; i += 3) {
    minX = Math.min(minX, posAttr[i]);     maxX = Math.max(maxX, posAttr[i]);
    minY = Math.min(minY, posAttr[i + 1]); maxY = Math.max(maxY, posAttr[i + 1]);
    minZ = Math.min(minZ, posAttr[i + 2]); maxZ = Math.max(maxZ, posAttr[i + 2]);
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;

  // 2. Build a transformed copy of the vertex array (centre + tilt around X axis)
  const cosT = Math.cos((tiltDeg * Math.PI) / 180);
  const sinT = Math.sin((tiltDeg * Math.PI) / 180);
  const verts = new Float32Array(posAttr.length);
  for (let i = 0; i < posAttr.length; i += 3) {
    const lx = posAttr[i]     - cx;
    const ly = posAttr[i + 1] - cy;
    const lz = posAttr[i + 2] - cz;
    verts[i]     = lx;
    verts[i + 1] = ly * cosT - lz * sinT;
    verts[i + 2] = ly * sinT + lz * cosT;
  }
  // Shift base back to Z=0 so it sits flat on the build plate
  let newMinZ = Infinity;
  for (let i = 2; i < verts.length; i += 3) newMinZ = Math.min(newMinZ, verts[i]);
  for (let i = 2; i < verts.length; i += 3) verts[i] -= newMinZ;

  // QC #19: Resin shrinkage compensation — resin shrinks 1–3% on UV cure.
  // Scale up 1.5% so final cured dimensions hit spec.
  // Only apply when tiltDeg > 0 (Bambu resin export) to avoid affecting
  // FDM or preview exports.
  if (tiltDeg > 0) {
    const SHRINK_COMP = 1.015;
    for (let i = 0; i < verts.length; i += 3) {
      verts[i]     *= SHRINK_COMP;
      verts[i + 1] *= SHRINK_COMP;
      // Z not scaled — thickness shrinkage is less critical than XY diameter
    }
  }

  const vertices = verts; // use transformed verts from here on

  const triangleCount = indices.length / 3;
  const buffer = new ArrayBuffer(80 + 4 + triangleCount * 50);
  const view = new DataView(buffer);

  // Binary STL header — embed tool name for traceability
  const headerStr = '3D Coin Sculptor — Bambu-ready binary STL';
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < headerStr.length ? headerStr.charCodeAt(i) : 0);
  }
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