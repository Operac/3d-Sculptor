// ────────────────────────────────────────────────────────────────────────────
// Template-mode merger:
//   • Load a Blender-baked STL coin/plaque template (rim + text + empty centre)
//   • Generate a portrait disc from a user image (reusing generateCoinGeometry
//     in "portrait-only" mode — no rim, no text, very thin base)
//   • Position the portrait at the template centre at the correct Z so it sits
//     on the field surface, scaled to a fixed fraction of the template diameter
//   • Return the merged BufferGeometry ready for preview + STL export
//
// This is the "import your coin template, just put the image in" workflow.
// The hard problem (crisp vector text) is solved in Blender by the user; we
// stick to what we do well (AI portrait depth → heightmap mesh).
// ────────────────────────────────────────────────────────────────────────────

import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CoinSettings, COIN_PRESET, LARGE_PLAQUE_PRESET, generateCoinGeometry } from './coinGenerator';

export type TemplateCoinKind = 'pocket' | 'plaque';

export interface TemplateAnalysis {
  /** Diameter inferred from XY bounding box (mm) — assumes a circular template */
  diameter: number;
  /** Centre of the template in XY (mm) */
  centreX: number;
  centreY: number;
  /** Highest Z value in the template (top of rim, mm) */
  topZ: number;
  /** Lowest Z value in the template (back of base, mm) */
  bottomZ: number;
  /** Total thickness (mm) */
  thickness: number;
}

/** Load an STL from a File / Blob into a BufferGeometry. */
export function loadTemplateSTL(file: File | Blob): Promise<THREE.BufferGeometry> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read template STL file'));
    reader.onload = () => {
      try {
        const buffer = reader.result as ArrayBuffer;
        const loader = new STLLoader();
        const geo = loader.parse(buffer);
        // STLLoader produces a non-indexed geometry with `position` (and
        // sometimes `normal`).  Index it so downstream merging is consistent
        // with the portrait disc (which we will also index).
        const indexed = mergeVertices(geo, 1e-4);
        if (!indexed.attributes.normal) indexed.computeVertexNormals();
        resolve(indexed);
      } catch (e) {
        reject(e);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

/** Inspect a template's bounding box to infer its physical dimensions. */
export function analyzeTemplate(geometry: THREE.BufferGeometry): TemplateAnalysis {
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox;
  if (!bb) throw new Error('Template has no bounding box (empty geometry?)');
  const sizeX = bb.max.x - bb.min.x;
  const sizeY = bb.max.y - bb.min.y;
  const diameter = Math.max(sizeX, sizeY); // circular templates: max(x,y) = diameter
  return {
    diameter,
    centreX: (bb.max.x + bb.min.x) / 2,
    centreY: (bb.max.y + bb.min.y) / 2,
    topZ:    bb.max.z,
    bottomZ: bb.min.z,
    thickness: bb.max.z - bb.min.z,
  };
}

/** Heuristic: if the template thickness is ≤ 6 mm, treat as pocket coin;
 *  otherwise plaque.  User can override in the UI. */
export function guessCoinKind(thickness: number): TemplateCoinKind {
  return thickness <= 6 ? 'pocket' : 'plaque';
}

/** Per-spec defaults for portrait sizing & placement.  These come straight
 *  from the foundry V1 doc:
 *    • Pocket coin: portrait 60–65 % of face, relief 0.8–1.2 mm, rim 1 mm
 *    • Large plaque: portrait 60–65 % of face, relief 4–6 mm, rim 3–4 mm
 *  We pick mid-of-range defaults; user tweaks via sliders. */
export interface TemplatePortraitDefaults {
  portraitDiameterFrac: number; // 0..1 fraction of template diameter
  portraitReliefMm: number;      // peak relief above the field
  fieldOffsetFromTopMm: number;  // distance from template top Z down to field surface
}

export function defaultsForKind(kind: TemplateCoinKind): TemplatePortraitDefaults {
  if (kind === 'plaque') {
    return {
      portraitDiameterFrac: 0.62,
      portraitReliefMm:     5.0,  // mid of 4–6 mm plaque portrait spec
      fieldOffsetFromTopMm: 4.0,  // plaque rim height
    };
  }
  // pocket
  return {
    portraitDiameterFrac: 0.62,
    portraitReliefMm:     1.0,    // mid of 0.8–1.2 mm pocket portrait spec
    fieldOffsetFromTopMm: 1.0,    // pocket rim height
  };
}

/** Generate a thin portrait disc by reusing generateCoinGeometry with rim
 *  and text disabled — gives us just the depth-mapped portrait surface on a
 *  flat back. */
export async function generatePortraitDisc(opts: {
  imageSrc: string;
  diameterMm: number;
  portraitReliefMm: number;
  kind: TemplateCoinKind;
  signal?: AbortSignal;
  onProgress?: (msg: string) => void;
}): Promise<THREE.BufferGeometry> {
  const base = opts.kind === 'plaque' ? LARGE_PLAQUE_PRESET : COIN_PRESET;
  const portraitOnlySettings: CoinSettings = {
    ...base,
    diameter:        opts.diameterMm,
    showRim:         false,           // template provides the rim
    rimWidth:        0,
    rimHeight:       0,
    fieldRecess:     0,
    baseHeight:      0.4,             // very thin back so we can sit on the field
    maxRelief:       opts.portraitReliefMm,
    isDoubleFaced:   false,           // portrait is single-sided; template has its own back
    topText:         '',              // text is in the template
    bottomText:      '',
    signatureText:   '',
    medallionRingEnabled: false,
  };
  // Adapt onProgress: generateCoinGeometry(onWarnings, onProgress) — we route
  // warnings to console and forward progress strings to the caller.
  return generateCoinGeometry(
    opts.imageSrc,
    portraitOnlySettings,
    (warnings) => {
      if (warnings.length > 0) console.warn('Portrait disc warnings:', warnings);
    },
    opts.onProgress,
    opts.signal,
  );
}

/** Position the portrait disc on the template's field and merge.
 *  The portrait disc has Z=0 at its back and extends to Z=baseHeight+relief
 *  in the +Z direction.  We translate it so its BACK sits at the template's
 *  field-Z level (templateTopZ − fieldOffsetFromTopMm).  A small Z bias keeps
 *  the disc back from coinciding with the field plane (would cause Z-fighting
 *  if the surfaces were exactly coplanar). */
export function mergeTemplateWithPortrait(
  template: THREE.BufferGeometry,
  portrait: THREE.BufferGeometry,
  analysis: TemplateAnalysis,
  defaults: TemplatePortraitDefaults,
  userZOffsetMm = 0,
  userXYOffset: { x: number; y: number } = { x: 0, y: 0 },
): THREE.BufferGeometry {
  const fieldZ = analysis.topZ - defaults.fieldOffsetFromTopMm;
  // Portrait's own back is at Z=0 in its local coords.  Push slightly above
  // field (0.05 mm) so the meshes don't sit exactly coplanar.
  const portraitZTranslate = fieldZ + 0.05 + userZOffsetMm;

  const positionedPortrait = portrait.clone();
  positionedPortrait.translate(
    analysis.centreX + userXYOffset.x,
    analysis.centreY + userXYOffset.y,
    portraitZTranslate,
  );

  // Strip extra attributes the template doesn't have so mergeGeometries
  // doesn't return null on attribute-set mismatch.
  const templateAttrs = new Set(Object.keys(template.attributes));
  for (const key of Object.keys(positionedPortrait.attributes)) {
    if (!templateAttrs.has(key)) positionedPortrait.deleteAttribute(key);
  }
  const portraitAttrs = new Set(Object.keys(positionedPortrait.attributes));
  // Remove any extra attrs from the template too (rare, but keep symmetry).
  const cleanTemplate = template.clone();
  for (const key of Object.keys(cleanTemplate.attributes)) {
    if (!portraitAttrs.has(key)) cleanTemplate.deleteAttribute(key);
  }

  const merged = mergeGeometries([cleanTemplate, positionedPortrait], false);
  if (!merged) {
    console.error('Template merge failed: attribute layouts differ',
      Object.keys(cleanTemplate.attributes), Object.keys(positionedPortrait.attributes));
    return cleanTemplate;
  }
  // Recompute normals on the merged result so portrait + template shading is consistent.
  merged.computeVertexNormals();
  return merged;
}
