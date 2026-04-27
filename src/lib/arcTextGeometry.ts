// ────────────────────────────────────────────────────────────────────────────
// True vector arc-text geometry — Blender-quality crisp text.
//
// Replaces the heightmap-based text pipeline (drawArcText → textMask →
// nearest-sample mesh hits) with REAL EXTRUDED POLYGON GEOMETRY built from
// the Trajan Pro font's vector outlines via opentype.js.
//
// Why this exists:
//   The heightmap path was capped by mesh angular sampling at the text arc
//   (~7 px / 0.27 mm at 768 segments).  Letter strokes sampled at that rate
//   either staircased (nearest), wave-rang (Lanczos), or smeared (bilinear).
//   Vector geometry has NO sampling — letter walls are mathematically vertical
//   and infinitely sharp because they are real triangles in the mesh.
//
// What this produces:
//   For each character: outer outline → THREE.Shape, holes (B/O/R/etc inner
//   counters) → shape.holes.  ExtrudeGeometry gives the prism with vertical
//   walls.  Each character is rotated to follow the arc tangent and
//   translated to its position on the arc circle.  All character geometries
//   are merged and returned as one BufferGeometry ready to be unioned with
//   the coin mesh.
// ────────────────────────────────────────────────────────────────────────────

import * as THREE from 'three';
import opentype from 'opentype.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

let cachedFont: opentype.Font | null = null;
let fontLoadPromise: Promise<opentype.Font> | null = null;

/** Load Trajan Pro Bold once, cached for subsequent calls. */
export async function loadTrajanFont(): Promise<opentype.Font> {
  if (cachedFont) return cachedFont;
  if (fontLoadPromise) return fontLoadPromise;
  fontLoadPromise = opentype.load('/fonts/TrajanPro-Bold.ttf').then((font) => {
    cachedFont = font;
    return font;
  });
  return fontLoadPromise;
}

export interface ArcTextOptions {
  text: string;
  /** Mid-radius of the text arc, in mm (centre of glyph cap-height) */
  arcRadius: number;
  /** Centre angle of the arc in degrees, THREE coords (0=+X, 90=+Y) */
  centreAngleDeg: number;
  /** Maximum angular span text can occupy, in degrees */
  arcSpanDeg: number;
  /** Font cap-height in mm (i.e. visible character height) */
  fontSizeMm: number;
  /** Letter-spacing in mm added between glyphs */
  letterSpacingMm: number;
  /** Extrusion depth in mm (text relief above the coin face) */
  textDepthMm: number;
  /** Z-coordinate of the coin face the text sits on, in mm */
  faceZ: number;
  /** Bottom arc: characters orient outward-down so they read right-side-up
   *  when the coin is rotated 180°.  Top arc (false): characters point outward-up. */
  flipBaseline: boolean;
}

/** Build a single merged BufferGeometry for arc text. */
export function buildArcTextGeometry(
  font: opentype.Font,
  opts: ArcTextOptions,
): THREE.BufferGeometry {
  const {
    text,
    arcRadius,
    centreAngleDeg,
    arcSpanDeg,
    fontSizeMm,
    letterSpacingMm,
    textDepthMm,
    faceZ,
    flipBaseline,
  } = opts;
  if (!text || !text.trim()) return new THREE.BufferGeometry();
  const str = text.trim().toUpperCase();

  // opentype.js draws glyphs at a given font size where Y points DOWN (canvas
  // convention).  We want UP, and the visual cap-height should equal fontSizeMm.
  // For Trajan Pro, ascender ≈ unitsPerEm × 0.72; cap-height ≈ unitsPerEm × 0.66.
  // Using full em as a conservative size means cap-height ≈ fontSizeMm × 0.92.
  // We compensate so the visible cap-height matches the requested size.
  const os2 = font.tables.os2 as unknown as { sCapHeight?: number } | undefined;
  const capHeightRatio = os2?.sCapHeight ? os2.sCapHeight / font.unitsPerEm : 0.66;
  const emSize = fontSizeMm / capHeightRatio;

  // Layout: shrink emSize until the whole word fits the arc span.
  const maxArcLen = (arcSpanDeg * 0.92 * Math.PI / 180) * arcRadius;
  let scale = emSize;
  let widths: number[] = [];
  let totalW = 0;
  for (let pass = 0; pass < 8; pass++) {
    widths = [];
    totalW = 0;
    for (const ch of str) {
      const glyph = font.charToGlyph(ch);
      const w = (glyph.advanceWidth ?? 500) * (scale / font.unitsPerEm) + letterSpacingMm;
      widths.push(w);
      totalW += w;
    }
    if (totalW <= maxArcLen) break;
    scale *= 0.92;
  }

  // Distribute across arc.
  const totalArcAngle = totalW / arcRadius;
  const centreRad = (centreAngleDeg * Math.PI) / 180;
  const startAngle = centreRad - totalArcAngle / 2;

  const charGeoms: THREE.BufferGeometry[] = [];
  let cumAngle = startAngle;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const halfAngle = widths[i] / 2 / arcRadius;
    const charAngle = cumAngle + halfAngle;
    cumAngle += widths[i] / arcRadius;

    // Build shapes for this glyph.
    const glyph = font.charToGlyph(ch);
    if (!glyph || !glyph.path || glyph.unicode === undefined) continue;
    const otPath = glyph.getPath(0, 0, scale);
    const shapes = openTypePathToShapes(otPath);
    if (shapes.length === 0) continue;

    // Each character builds an ExtrudeGeometry per shape, then we merge,
    // then we orient + translate to the arc position.
    const perCharGeoms: THREE.BufferGeometry[] = [];
    for (const shape of shapes) {
      const g = new THREE.ExtrudeGeometry(shape, {
        depth: textDepthMm,
        bevelEnabled: false,
        curveSegments: 6, // glyph beziers — 6 is plenty for letter-scale curves
      });
      perCharGeoms.push(g);
    }
    const charGeo = perCharGeoms.length === 1
      ? perCharGeoms[0]
      : (mergeGeometries(perCharGeoms, false) ?? perCharGeoms[0]);

    // 1. opentype draws Y-DOWN; we need Y-UP → flip Y.
    charGeo.scale(1, -1, 1);

    // 2. Centre horizontally on the character's advance width so the arc
    //    distributes letters by their geometric centres.
    charGeo.translate(-widths[i] / 2, 0, 0);

    // 3. For BOTTOM arc: rotate 180° around X so the character faces down
    //    (so it reads correctly when the coin is flipped).  Same as flipBaseline.
    if (flipBaseline) {
      charGeo.rotateX(Math.PI);
    }

    // 4. Rotate the character so its baseline lies along the arc tangent
    //    and its "up" points outward from the coin centre.
    //    For top arc (centreAngleDeg ≈ 90°/π/2 in THREE coords):
    //      charAngle ≈ π/2, we want "up" = +Y → rotation = charAngle - π/2.
    //    For bottom arc (centreAngleDeg ≈ -90°/-π/2):
    //      after the X-flip above, the same rotation formula puts the chars
    //      reading clockwise around the bottom — which displays mirrored on
    //      screen but reads correctly when the coin is rotated 180°.
    charGeo.rotateZ(charAngle - Math.PI / 2);

    // 5. Translate to the position on the arc circle (XY plane, at faceZ).
    charGeo.translate(
      arcRadius * Math.cos(charAngle),
      arcRadius * Math.sin(charAngle),
      faceZ,
    );

    charGeoms.push(charGeo);
  }

  if (charGeoms.length === 0) return new THREE.BufferGeometry();
  const merged = mergeGeometries(charGeoms, false);
  return merged ?? charGeoms[0];
}

/**
 * Convert an opentype.Path (sequence of M/L/C/Q/Z commands) into one or more
 * THREE.Shape objects.  Each closed subpath becomes either a Shape (CCW after
 * Y-flip = solid outer) or a hole on the most-recently-added shape that
 * contains it (CW after Y-flip = inner counter).
 */
function openTypePathToShapes(otPath: opentype.Path): THREE.Shape[] {
  // First pass: split commands into subpaths.
  type Sub = { commands: opentype.PathCommand[] };
  const subs: Sub[] = [];
  let cur: Sub | null = null;
  for (const c of otPath.commands) {
    if (c.type === 'M') {
      cur = { commands: [c] };
      subs.push(cur);
    } else if (cur) {
      cur.commands.push(c);
    }
  }

  // Build a THREE.Path for each subpath, plus its signed area (positive after
  // Y-flip = CCW = solid outer; negative = hole).
  const built: { path: THREE.Path; area: number; bbox: THREE.Box2 }[] = [];
  for (const s of subs) {
    const p = new THREE.Path();
    let firstX = 0, firstY = 0;
    let started = false;
    const samples: THREE.Vector2[] = [];
    for (const c of s.commands) {
      switch (c.type) {
        case 'M':
          p.moveTo(c.x, c.y);
          firstX = c.x; firstY = c.y;
          started = true;
          samples.push(new THREE.Vector2(c.x, c.y));
          break;
        case 'L':
          p.lineTo(c.x, c.y);
          samples.push(new THREE.Vector2(c.x, c.y));
          break;
        case 'Q':
          p.quadraticCurveTo(c.x1, c.y1, c.x, c.y);
          samples.push(new THREE.Vector2(c.x, c.y));
          break;
        case 'C':
          p.bezierCurveTo(c.x1, c.y1, c.x2, c.y2, c.x, c.y);
          samples.push(new THREE.Vector2(c.x, c.y));
          break;
        case 'Z':
          if (started) {
            p.lineTo(firstX, firstY);
            samples.push(new THREE.Vector2(firstX, firstY));
          }
          break;
      }
    }
    if (samples.length < 3) continue;

    // Signed area BEFORE Y-flip (Y-down).  In Y-down, outer contours of TTF
    // glyphs are clockwise (negative shoelace).  After our scale(1,-1,1) flip,
    // they become CCW (positive) which is what THREE.Shape expects for outers.
    // So: rawArea < 0 here ⇒ outer shape; rawArea > 0 ⇒ hole.
    let rawArea = 0;
    for (let k = 0; k < samples.length; k++) {
      const a = samples[k];
      const b = samples[(k + 1) % samples.length];
      rawArea += a.x * b.y - b.x * a.y;
    }
    rawArea *= 0.5;
    const flippedArea = -rawArea; // post-Y-flip area

    const bbox = new THREE.Box2();
    for (const v of samples) bbox.expandByPoint(v);

    built.push({ path: p, area: flippedArea, bbox });
  }

  // Assemble shapes: each positive-area path is an outer Shape; each
  // negative-area path becomes a hole on the smallest enclosing outer.
  const shapes: { shape: THREE.Shape; bbox: THREE.Box2 }[] = [];
  for (const b of built) {
    if (b.area > 0) {
      const s = new THREE.Shape(b.path.getPoints());
      shapes.push({ shape: s, bbox: b.bbox });
    }
  }
  for (const b of built) {
    if (b.area <= 0) {
      // Find smallest-area outer shape that contains this hole's bbox.
      let host: { shape: THREE.Shape; bbox: THREE.Box2 } | null = null;
      let bestArea = Infinity;
      for (const s of shapes) {
        if (
          s.bbox.containsBox(b.bbox)
        ) {
          const a = (s.bbox.max.x - s.bbox.min.x) * (s.bbox.max.y - s.bbox.min.y);
          if (a < bestArea) {
            host = s;
            bestArea = a;
          }
        }
      }
      if (host) {
        host.shape.holes.push(new THREE.Path(b.path.getPoints()));
      } else {
        // Orphan hole: treat as filled outer to avoid lost geometry.
        shapes.push({ shape: new THREE.Shape(b.path.getPoints()), bbox: b.bbox });
      }
    }
  }

  return shapes.map((s) => s.shape);
}
