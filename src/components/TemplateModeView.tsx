// ────────────────────────────────────────────────────────────────────────────
// TemplateModeView — the second app mode.  User uploads a Blender-baked STL
// (rim + text + empty middle) and a portrait image; we generate the portrait
// disc and merge it into the template centre.  No coin-from-scratch logic.
// ────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Upload, Download, RefreshCcw, Image as ImageIcon, FileBox } from 'lucide-react';
import { GeometryViewer } from './GeometryViewer';
import {
  loadTemplateSTL,
  analyzeTemplate,
  guessCoinKind,
  defaultsForKind,
  generatePortraitDisc,
  mergeTemplateWithPortrait,
  TemplateAnalysis,
  TemplateCoinKind,
} from '../lib/templateMerger';
import { exportToSTL } from '../lib/coinGenerator';

export const TemplateModeView: React.FC = () => {
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateGeo,  setTemplateGeo]  = useState<THREE.BufferGeometry | null>(null);
  const [analysis,     setAnalysis]     = useState<TemplateAnalysis | null>(null);
  const [imageSrc,     setImageSrc]     = useState<string | null>(null);

  const [kind,         setKind]         = useState<TemplateCoinKind>('pocket');
  const [zOffsetMm,    setZOffsetMm]    = useState(0);
  const [scaleAdjust,  setScaleAdjust]  = useState(1.0); // multiplier on default 0.62

  const [mergedGeo,    setMergedGeo]    = useState<THREE.BufferGeometry | null>(null);
  const [busy,         setBusy]         = useState(false);
  const [busyMsg,      setBusyMsg]      = useState('');
  const [error,        setError]        = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // ── Load STL when template file changes
  useEffect(() => {
    if (!templateFile) {
      setTemplateGeo(null);
      setAnalysis(null);
      return;
    }
    setBusy(true);
    setBusyMsg('Loading template STL…');
    setError(null);
    loadTemplateSTL(templateFile)
      .then(geo => {
        setTemplateGeo(geo);
        const a = analyzeTemplate(geo);
        setAnalysis(a);
        // Auto-guess kind from thickness
        const guessedKind = guessCoinKind(a.thickness);
        setKind(guessedKind);
        setBusy(false);
      })
      .catch(err => {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
        setBusy(false);
      });
  }, [templateFile]);

  // ── (Re)generate merged geometry whenever inputs change
  useEffect(() => {
    if (!templateGeo || !analysis || !imageSrc) {
      setMergedGeo(null);
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    setBusy(true);
    setError(null);

    (async () => {
      try {
        const defaults = defaultsForKind(kind);
        const portraitDiameter = analysis.diameter * defaults.portraitDiameterFrac * scaleAdjust;

        setBusyMsg('Generating portrait depth from image…');
        const portrait = await generatePortraitDisc({
          imageSrc,
          diameterMm:        portraitDiameter,
          portraitReliefMm:  defaults.portraitReliefMm,
          kind,
          signal,
          onProgress: (msg) => { if (!signal.aborted) setBusyMsg(msg); },
        });
        if (signal.aborted) return;

        setBusyMsg('Merging portrait into template…');
        const merged = mergeTemplateWithPortrait(
          templateGeo,
          portrait,
          analysis,
          defaults,
          zOffsetMm,
          { x: 0, y: 0 },
        );
        portrait.dispose();
        if (!signal.aborted) {
          setMergedGeo(merged);
          setBusy(false);
        }
      } catch (err) {
        if (signal.aborted) return;
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
        setBusy(false);
      }
    })();

    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [templateGeo, analysis, imageSrc, kind, zOffsetMm, scaleAdjust]);

  const handleTemplatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setTemplateFile(f);
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setImageSrc(ev.target.result as string);
    };
    reader.readAsDataURL(f);
  };

  const handleExport = () => {
    if (mergedGeo) {
      exportToSTL(mergedGeo, '3d_coin_sculptor_from_template.stl', 0);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0">
      {/* Viewer */}
      <div className="flex-1 relative bg-[#0b0b0b] min-h-[400px]">
        <GeometryViewer
          geometry={mergedGeo}
          color="#FFD700"
          metalness={0.85}
          roughness={0.25}
          loadingMessage={
            !templateFile     ? 'Upload a coin template STL to begin'
            : !imageSrc       ? 'Now upload a portrait image'
            : busy            ? busyMsg
            : 'Ready'
          }
        />
        {busy && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-amber-300 text-xs px-3 py-2 rounded-md border border-amber-500/30">
            {busyMsg}
          </div>
        )}
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-900/80 text-red-200 text-xs px-3 py-2 rounded-md border border-red-500/40 max-w-md">
            {error}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-[380px] border-l border-white/[0.06] bg-[#0a0a0a] p-5 overflow-y-auto space-y-5">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wider uppercase mb-1">Import Template</h2>
          <p className="text-xs text-neutral-500">
            Upload a Blender-baked STL with text + rim already in it. We add the
            portrait into the empty centre.
          </p>
        </div>

        {/* Step 1: STL */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            1. Coin Template (STL)
          </label>
          <label className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg cursor-pointer hover:border-amber-500/40 transition">
            <FileBox className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-neutral-300 truncate">
              {templateFile ? templateFile.name : 'Choose STL file…'}
            </span>
            <input type="file" accept=".stl" onChange={handleTemplatePick} className="hidden" />
          </label>
          {analysis && (
            <div className="text-[10px] text-neutral-500 grid grid-cols-2 gap-x-2 gap-y-0.5 pl-1">
              <span>Diameter:</span>     <span className="text-neutral-300">{analysis.diameter.toFixed(1)} mm</span>
              <span>Thickness:</span>    <span className="text-neutral-300">{analysis.thickness.toFixed(1)} mm</span>
              <span>Top Z:</span>        <span className="text-neutral-300">{analysis.topZ.toFixed(2)} mm</span>
              <span>Detected as:</span>  <span className="text-amber-400">{kind === 'plaque' ? 'Large plaque' : 'Pocket coin'}</span>
            </div>
          )}
        </div>

        {/* Step 2: Image */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            2. Portrait Image
          </label>
          <label className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg cursor-pointer hover:border-amber-500/40 transition">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-neutral-300 truncate">
              {imageSrc ? 'Image loaded' : 'Choose photo (JPG/PNG)…'}
            </span>
            <input type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
          </label>
          {imageSrc && (
            <img src={imageSrc} alt="" className="mt-2 w-full max-h-32 object-contain rounded border border-white/[0.06] bg-black/40" />
          )}
        </div>

        {/* Step 3: Adjustments */}
        <div className="space-y-3 pt-2 border-t border-white/[0.05]">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            3. Fine-Tune
          </label>

          {/* Coin kind override */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Type</div>
            <div className="grid grid-cols-2 gap-2">
              {(['pocket', 'plaque'] as TemplateCoinKind[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    kind === k
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-white/[0.03] border-white/[0.06] text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {k === 'pocket' ? 'Pocket Coin' : 'Large Plaque'}
                </button>
              ))}
            </div>
          </div>

          {/* Scale */}
          <div>
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
              <span>Portrait Size</span>
              <span className="text-neutral-300">{(defaultsForKind(kind).portraitDiameterFrac * scaleAdjust * 100).toFixed(0)}% of coin</span>
            </div>
            <input
              type="range" min={0.7} max={1.2} step={0.02}
              value={scaleAdjust}
              onChange={(e) => setScaleAdjust(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Z offset */}
          <div>
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
              <span>Z Offset</span>
              <span className="text-neutral-300">{zOffsetMm.toFixed(2)} mm</span>
            </div>
            <input
              type="range" min={-2} max={2} step={0.05}
              value={zOffsetMm}
              onChange={(e) => setZOffsetMm(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-[10px] text-neutral-600 mt-1">
              Negative = lower into field. Positive = raise above field.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-3 border-t border-white/[0.05]">
          <button
            onClick={handleExport}
            disabled={!mergedGeo || busy}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-500 text-black text-sm font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-400 transition"
          >
            <Download className="w-4 h-4" />
            Export Merged STL
          </button>
          <button
            onClick={() => {
              setTemplateFile(null);
              setImageSrc(null);
              setMergedGeo(null);
              setError(null);
              setZOffsetMm(0);
              setScaleAdjust(1.0);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-neutral-400 text-xs hover:text-white hover:border-white/20 transition"
          >
            <RefreshCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </aside>
    </div>
  );
};
