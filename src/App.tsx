import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Upload, 
  Settings2, 
  Download, 
  RotateCcw,
  Info,
  ChevronRight,
  ChevronDown,
  X,
  Layout,
  Palette,
  Eye,
  EyeOff
} from 'lucide-react';
import { CoinViewer } from './components/CoinViewer';
import { TemplateModeView } from './components/TemplateModeView';
import { CoinSettings, DEFAULT_SETTINGS, COIN_PRESET, PLAQUE_PRESET, LARGE_PLAQUE_PRESET, POCKET_2_PRESET, exportToSTL } from './lib/coinGenerator';
import * as THREE from 'three';

type AppMode = 'create' | 'template';

// Use a high-quality placeholder for the default image
const DEFAULT_IMAGE = "https://picsum.photos/seed/coin-demo/1024/1024";

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('create');
  const [imageSrc, setImageSrc] = useState<string>(DEFAULT_IMAGE);
  const [settings, setSettings] = useState<CoinSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeMaterialPart, setActiveMaterialPart] = useState<'rim' | 'face' | 'back' | 'all'>('all');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          // Reset position offsets so prior adjustments don't bleed into the new image
          setSettings(prev => ({ ...prev, imageOffsetX: 0, imageOffsetY: 0 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [useAdvancedMaterials, setUseAdvancedMaterials] = useState(true);

  const updateSetting = (key: keyof CoinSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateMaterialSetting = (key: keyof CoinSettings['material'], value: any) => {
    setSettings(prev => {
      if (activeMaterialPart === 'all') {
        return {
          ...prev,
          material: { ...prev.material, [key]: value },
          rimMaterial: { ...prev.rimMaterial, [key]: value },
          faceMaterial: { ...prev.faceMaterial, [key]: value },
          backMaterial: { ...prev.backMaterial, [key]: value },
        };
      } else {
        const partKey = `${activeMaterialPart}Material` as keyof CoinSettings;
        const currentPartMat = prev[partKey] as any;
        return {
          ...prev,
          useSeparateMaterials: true,
          [partKey]: { ...currentPartMat, [key]: value }
        };
      }
    });
  };

  const setPreset = (type: 'coin' | 'plaque' | 'large-plaque' | 'pocket-2') => {
    if (type === 'coin') setSettings(COIN_PRESET);
    else if (type === 'plaque') setSettings(PLAQUE_PRESET);
    else if (type === 'large-plaque') setSettings(LARGE_PLAQUE_PRESET);
    else if (type === 'pocket-2') setSettings(POCKET_2_PRESET);
  };

  const resetSettings = () => {
    if (settings.diameter === 425) setSettings(LARGE_PLAQUE_PRESET);
    else if (settings.diameter === 39 && settings.material.type === 'silver') setSettings(POCKET_2_PRESET);
    else if (settings.type === 'coin') setSettings(COIN_PRESET);
    else setSettings(PLAQUE_PRESET);
  };

  const [tiltForBambu, setTiltForBambu] = useState(false);

  const handleExport = () => {
    if (geometryRef.current) {
      const label = settings.type === 'plaque' ? 'plaque' : 'coin';
      exportToSTL(geometryRef.current, `3d_coin_sculptor_${label}.stl`, tiltForBambu ? 15 : 0);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-neutral-200 font-sans selection:bg-amber-500/30 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 ring-1 ring-amber-400/30">
              <Coins className="w-5 h-5 text-black" />
            </div>
            <div className="hidden sm:flex flex-col -space-y-0.5">
              <h1 className="font-bold text-sm tracking-tight text-white leading-none">3D Coin Sculptor</h1>
              <span className="text-[10px] text-amber-400/70 tracking-wide font-medium">Coin · Medallion · Plaque Designer</span>
            </div>
            <h1 className="font-bold text-sm tracking-tight text-white sm:hidden">Sculptor</h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">Upload Image</span>
            </button>
            {/* Bambu tilt toggle */}
            <button
              onClick={() => setTiltForBambu(v => !v)}
              title="Pre-tilt 15° for Bambu — better layer lines, less FEP suction"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${tiltForBambu ? 'bg-blue-500/20 border-blue-500/60 text-blue-300' : 'bg-white/[0.03] border-white/[0.06] text-neutral-500 hover:border-white/20 hover:text-neutral-300'}`}
            >
              <span>⟳</span>
              <span>15° Tilt</span>
            </button>
            <button
              onClick={handleExport}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-4 py-2 rounded-lg text-xs font-bold hover:from-amber-400 hover:to-yellow-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export STL</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button
              onClick={() => setIsMobileSettingsOpen(true)}
              className="lg:hidden p-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mode picker — choose between building from scratch or importing a template */}
      <div className="border-b border-white/[0.06] bg-black/40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex gap-1 py-2">
          <button
            onClick={() => setAppMode('create')}
            className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition ${
              appMode === 'create'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-white/[0.03] border-white/[0.06] text-neutral-400 hover:text-white hover:border-white/20'
            }`}
          >
            🪙 Create Your Coin
          </button>
          <button
            onClick={() => setAppMode('template')}
            className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition ${
              appMode === 'template'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-white/[0.03] border-white/[0.06] text-neutral-400 hover:text-white hover:border-white/20'
            }`}
          >
            📥 Import Template + Add Image
          </button>
        </div>
      </div>

      {appMode === 'template' ? (
        <TemplateModeView />
      ) : (
      <>
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Viewer */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* 3D Viewer */}
          <div className="flex-1 min-h-[420px] lg:min-h-0 relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/60">
            <CoinViewer
              imageSrc={imageSrc}
              settings={settings}
              useAdvancedMaterials={useAdvancedMaterials}
              onGeometryGenerated={(geo) => { geometryRef.current = geo; }}
            />
          </div>

          {/* Feature strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: '🖼️', label: 'Portrait Relief',   desc: 'AI depth from any image' },
              { icon: '🔤', label: 'Arc Inscription',   desc: 'Top & bottom arc text' },
              { icon: '🪙', label: 'Raised or Engraved', desc: '3 sculpting modes' },
              { icon: '📦', label: 'STL Export',         desc: 'Print or cast ready' },
            ].map(f => (
              <div key={f.label} className="bg-neutral-900/60 border border-white/[0.06] rounded-xl p-3 flex flex-col gap-1">
                <span className="text-xl leading-none">{f.icon}</span>
                <span className="text-[11px] font-semibold text-white mt-1">{f.label}</span>
                <span className="text-[10px] text-neutral-500">{f.desc}</span>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="bg-neutral-900/40 border border-white/[0.06] rounded-2xl p-5">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              How It Works
            </h2>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { n: '1', title: 'Upload a portrait',  body: 'Use a high-contrast photo or grayscale depth map. Brighter = higher relief.' },
                { n: '2', title: 'Configure the design', body: 'Choose a preset, add arc text, set relief depth and signature font.' },
                { n: '3', title: 'Export & print',      body: 'Download the STL file and send it straight to your 3D printer or foundry.' },
              ].map(s => (
                <li key={s.n} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{s.n}</span>
                  <div>
                    <p className="text-xs font-semibold text-white mb-0.5">{s.title}</p>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right Column: Controls (Hidden on mobile, shown in drawer) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-5">
          <SettingsPanel 
            imageSrc={imageSrc}
            settings={settings}
            isSettingsOpen={isSettingsOpen}
            setIsSettingsOpen={setIsSettingsOpen}
            handleImageUpload={handleImageUpload}
            updateSetting={updateSetting}
            updateMaterialSetting={updateMaterialSetting}
            activeMaterialPart={activeMaterialPart}
            setActiveMaterialPart={setActiveMaterialPart}
            resetSettings={resetSettings}
            setPreset={setPreset}
            fileInputRef={fileInputRef}
            useAdvancedMaterials={useAdvancedMaterials}
            setUseAdvancedMaterials={setUseAdvancedMaterials}
          />
        </div>
      </main>

      {/* Mobile Settings Drawer */}
      <AnimatePresence>
        {isMobileSettingsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSettingsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#0a0a0a] border-l border-white/10 z-[70] lg:hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="font-semibold text-white">Settings</h2>
                <button onClick={() => setIsMobileSettingsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <SettingsPanel 
                  imageSrc={imageSrc}
                  settings={settings}
                  isSettingsOpen={true}
                  setIsSettingsOpen={() => {}}
                  handleImageUpload={handleImageUpload}
                  updateSetting={updateSetting}
                  updateMaterialSetting={updateMaterialSetting}
                  activeMaterialPart={activeMaterialPart}
                  setActiveMaterialPart={setActiveMaterialPart}
                  resetSettings={resetSettings}
                  setPreset={setPreset}
                  fileInputRef={fileInputRef}
                  hideHeader
                  useAdvancedMaterials={useAdvancedMaterials}
                  setUseAdvancedMaterials={setUseAdvancedMaterials}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      </>
      )}

      {/* Footer */}
      <footer className="border-t border-white/[0.04] bg-black/40 py-4 px-6 mt-auto">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-neutral-600">
            © {new Date().getFullYear()} 3D Coin Sculptor — Online Coin, Medallion &amp; Plaque Designer
          </p>
          <p className="text-[10px] text-neutral-700">
            Design · Export STL · 3D Print · Bronze Cast
          </p>
        </div>
      </footer>
    </div>
  );
}

interface SettingsPanelProps {
  imageSrc: string;
  settings: CoinSettings;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateSetting: (key: keyof CoinSettings, value: any) => void;
  updateMaterialSetting: (key: keyof CoinSettings['material'], value: any) => void;
  activeMaterialPart: 'rim' | 'face' | 'back' | 'all';
  setActiveMaterialPart: (part: 'rim' | 'face' | 'back' | 'all') => void;
  resetSettings: () => void;
  setPreset: (type: 'coin' | 'plaque' | 'large-plaque' | 'pocket-2') => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  hideHeader?: boolean;
  useAdvancedMaterials: boolean;
  setUseAdvancedMaterials: (use: boolean) => void;
}

function SettingsPanel({ 
  imageSrc, 
  settings, 
  isSettingsOpen, 
  setIsSettingsOpen, 
  handleImageUpload, 
  updateSetting, 
  updateMaterialSetting,
  activeMaterialPart,
  setActiveMaterialPart,
  resetSettings,
  setPreset,
  fileInputRef,
  hideHeader,
  useAdvancedMaterials,
  setUseAdvancedMaterials
}: SettingsPanelProps) {
  return (
    <div className="space-y-4">
      {/* Model Type */}
      <section className="bg-neutral-900/80 border border-white/[0.07] rounded-2xl p-5 shadow-xl shadow-black/30">
        <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Layout className="w-3.5 h-3.5" />
          Choose a Preset
        </h2>

        {/* Font quick-reference */}
        <div className="mb-3 flex flex-col gap-1 px-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-neutral-500 uppercase tracking-wider">Primary Plaque (Large)</span>
            <span className="text-[9px] font-semibold text-amber-400/80 tracking-wide">Trajan Semibold</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-neutral-500 uppercase tracking-wider">Replica Pocket Coins</span>
            <span className="text-[9px] font-semibold text-amber-400/80 tracking-wide">Trajan Bold</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setPreset('coin')}
            className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex flex-col items-center gap-1 border ${settings.type === 'coin' && settings.diameter !== 425 && !(settings.diameter === 39 && settings.material.type === 'silver') ? 'bg-white/10 border-white/30 text-white shadow-lg' : 'bg-white/[0.03] border-white/[0.06] text-neutral-500 hover:text-neutral-300 hover:border-white/15'}`}
          >
            <span className="text-lg">🪙</span>
            <span>Pocket Coin</span>
            <span className="text-[8px] font-normal opacity-60 normal-case">38 mm</span>
          </button>
          <button
            onClick={() => setPreset('plaque')}
            className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex flex-col items-center gap-1 border ${settings.type === 'plaque' && settings.diameter !== 425 ? 'bg-white/10 border-white/30 text-white shadow-lg' : 'bg-white/[0.03] border-white/[0.06] text-neutral-500 hover:text-neutral-300 hover:border-white/15'}`}
          >
            <span className="text-lg">🏅</span>
            <span>Plaque</span>
            <span className="text-[8px] font-normal opacity-60 normal-case">150 mm</span>
          </button>
          <button
            onClick={() => setPreset('large-plaque')}
            className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex flex-col items-center gap-1 border ${settings.diameter === 425 ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-lg shadow-amber-500/10' : 'bg-white/[0.03] border-white/[0.06] text-neutral-500 hover:text-neutral-300 hover:border-white/15'}`}
          >
            <span className="text-lg">🏆</span>
            <span>Primary Plaque</span>
            <span className="text-[8px] font-normal opacity-70">425mm · Large Design</span>
          </button>
          <button
            onClick={() => setPreset('pocket-2')}
            className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex flex-col items-center gap-1 border ${settings.diameter === 39 && settings.material.type === 'silver' ? 'bg-white/10 border-white/30 text-white shadow-lg' : 'bg-white/[0.03] border-white/[0.06] text-neutral-500 hover:text-neutral-300 hover:border-white/15'}`}
          >
            <span className="text-lg">🎖️</span>
            <span>Replica Pocket</span>
            <span className="text-[8px] font-normal opacity-60 normal-case">39 mm · Bold</span>
          </button>
        </div>

        {/* Replica Pocket Coin info card */}
        {settings.diameter === 39 && settings.material.type === 'silver' && (
          <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Replica Pocket Coin Specs</span>
              </div>
              <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">Trajan Bold</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
              <div className="text-neutral-500 uppercase tracking-tight">Diameter</div>
              <div className="text-neutral-300 font-medium">38–40mm</div>
              <div className="text-neutral-500 uppercase tracking-tight">Thickness</div>
              <div className="text-neutral-300 font-medium">3–4mm max</div>
              <div className="text-neutral-500 uppercase tracking-tight">Relief Depth</div>
              <div className="text-neutral-300 font-medium">0.8–1.2mm</div>
              <div className="text-neutral-500 uppercase tracking-tight">Min Text Height</div>
              <div className="text-neutral-300 font-medium">3–4mm</div>
            </div>
          </div>
        )}

        {/* Primary Plaque info card */}
        {settings.diameter === 425 && (
          <div className="mt-4 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Primary Plaque — Large Design</span>
              <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">Trajan Semibold</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex flex-col">
                <span className="text-[9px] text-amber-400/60 uppercase">Dimensions</span>
                <span className="text-[10px] text-amber-300 font-medium">425mm Ø · 6mm Base</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-amber-400/60 uppercase">Relief</span>
                <span className="text-[10px] text-amber-300 font-medium">10mm Max · 15mm Rim</span>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-500/10">
              <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1.5 tracking-wider">Design Guidelines</span>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-amber-400/80">Primary Text Height</span>
                  <span className="text-[10px] text-amber-300 font-mono">25–30mm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-amber-400/80">Secondary Text Height</span>
                  <span className="text-[10px] text-amber-300 font-mono">15–20mm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-amber-400/80">Text Margin from Edge</span>
                  <span className="text-[10px] text-amber-300 font-mono">15–20mm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-amber-400/80">Recommended Font</span>
                  <span className="text-[10px] text-amber-300 font-mono">Trajan Semibold</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Image Upload */}
      <section className="bg-neutral-900/80 border border-white/[0.07] rounded-2xl p-5 shadow-xl shadow-black/30">
        <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Upload className="w-3.5 h-3.5" />
          Source Image
        </h2>
        
        <div className="relative group mb-4">
            <div className="aspect-square w-full rounded-xl overflow-hidden border-2 border-dashed border-white/10 group-hover:border-blue-500/50 transition-colors bg-black/40 relative">
              <img
                src={imageSrc}
                alt="Preview"
                className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <Upload className="w-8 h-8 text-neutral-500 mb-2 group-hover:text-blue-400 transition-colors" />
                <p className="text-xs text-neutral-400 font-medium">Click to upload depth map</p>
                <p className="text-[10px] text-neutral-500 mt-1">JPG, PNG, GIF, BMP, WebP up to 5MB</p>
              </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 w-full h-full cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-3 p-4 bg-black/40 rounded-xl border border-white/5">
          <h3 className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider flex items-center gap-2">
            <Info className="w-3 h-3" />
            For Best Results
          </h3>
          <ul className="space-y-2">
            <li className="flex gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <p className="text-[10px] text-neutral-500 leading-relaxed">
                <span className="text-neutral-300 font-medium">Use Depth Maps:</span> Images where brightness represents height. White is the highest point, black is the base.
              </p>
            </li>
            <li className="flex gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <p className="text-[10px] text-neutral-500 leading-relaxed">
                <span className="text-neutral-300 font-medium">High Contrast:</span> Ensure your subject is clearly separated from a solid black background.
              </p>
            </li>
            <li className="flex gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <p className="text-[10px] text-neutral-500 leading-relaxed">
                <span className="text-neutral-300 font-medium">Avoid Photos:</span> Standard photos create "noisy" relief. Use processed grayscale maps for clean results.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* Material Settings */}
      <section className="bg-neutral-900/80 border border-white/[0.07] rounded-2xl p-5 shadow-xl shadow-black/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
            <Palette className="w-3.5 h-3.5" />
            Material
          </h2>
          <button 
            onClick={() => setUseAdvancedMaterials(!useAdvancedMaterials)}
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded transition-all ${useAdvancedMaterials ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-neutral-500'}`}
          >
            {useAdvancedMaterials ? 'Advanced On' : 'Advanced Off'}
          </button>
        </div>
        
        {useAdvancedMaterials ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Target Part</span>
              <div className="grid grid-cols-4 gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                {(['all', 'rim', 'face', 'back'] as const).map((part) => (
                  <button
                    key={part}
                    onClick={() => setActiveMaterialPart(part)}
                    className={`py-1.5 rounded text-[9px] font-bold uppercase transition-all ${activeMaterialPart === part ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    {part}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'gold', label: 'Gold', color: '#FFD700', m: 0.9, r: 0.2 },
                { id: 'silver', label: 'Silver', color: '#C0C0C0', m: 0.9, r: 0.2 },
                { id: 'bronze', label: 'Bronze', color: '#CD7F32', m: 0.8, r: 0.4 },
                { id: 'custom', label: 'Custom', color: '#888888', m: 0.5, r: 0.5 },
              ].map((mat) => {
                const currentMat = activeMaterialPart === 'all' ? settings.material : (settings[`${activeMaterialPart}Material` as keyof CoinSettings] as any);
                return (
                  <button
                    key={mat.id}
                    onClick={() => {
                      updateMaterialSetting('type', mat.id);
                      if (mat.id !== 'custom') {
                        updateMaterialSetting('color', mat.color);
                        updateMaterialSetting('metallic', mat.m);
                        updateMaterialSetting('roughness', mat.r);
                      }
                    }}
                    className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${currentMat.type === mat.id ? 'bg-blue-500/10 border-blue-500/50 text-white' : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10'}`}
                  >
                    <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: mat.id === 'custom' ? currentMat.color : mat.color }} />
                    <span className="text-[10px] font-medium uppercase tracking-wider">{mat.label}</span>
                  </button>
                );
              })}
            </div>

            {(() => {
              const currentMat = activeMaterialPart === 'all' ? settings.material : (settings[`${activeMaterialPart}Material` as keyof CoinSettings] as any);
              return (
                <>
                  {currentMat.type === 'custom' && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Color</span>
                      <input 
                        type="color" 
                        value={currentMat.color}
                        onChange={(e) => updateMaterialSetting('color', e.target.value)}
                        className="w-8 h-8 rounded bg-transparent cursor-pointer"
                      />
                      <span className="text-xs font-mono text-neutral-500">{currentMat.color}</span>
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <SettingSlider 
                      label="Metallic" 
                      value={currentMat.metallic} 
                      min={0} max={1} step={0.01}
                      onChange={(v) => updateMaterialSetting('metallic', v)}
                    />
                    <SettingSlider 
                      label="Roughness" 
                      value={currentMat.roughness} 
                      min={0} max={1} step={0.01}
                      onChange={(v) => updateMaterialSetting('roughness', v)}
                    />
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="py-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
            <p className="text-xs text-neutral-500">Advanced materials disabled.</p>
          </div>
        )}
      </section>

      {/* Settings */}
      <section className="bg-neutral-900/80 border border-white/[0.07] rounded-2xl overflow-hidden shadow-xl shadow-black/30">
        {!hideHeader && (
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Parameters</span>
            </div>
            {isSettingsOpen
              ? <ChevronDown className="w-4 h-4 text-neutral-600" />
              : <ChevronRight className="w-4 h-4 text-neutral-600" />}
          </button>
        )}

        <AnimatePresence initial={false}>
          {isSettingsOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 pb-6 space-y-6 pt-4"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-neutral-400">Double Faced</span>
                    <span className="text-[10px] text-neutral-600">Mirror design on back</span>
                  </div>
                  <button 
                    onClick={() => updateSetting('isDoubleFaced', !settings.isDoubleFaced)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${settings.isDoubleFaced ? 'bg-blue-500' : 'bg-neutral-700'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.isDoubleFaced ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-neutral-400">Show Rim</span>
                    <span className="text-[10px] text-neutral-600">Enable border edge</span>
                  </div>
                  <button 
                    onClick={() => updateSetting('showRim', !settings.showRim)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${settings.showRim ? 'bg-blue-500' : 'bg-neutral-700'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.showRim ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-white">Sculpting Mode</span>
                    <p className="text-[10px] text-neutral-500">How should the design appear?</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => updateSetting('reliefStyle', 'elevated')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${settings.reliefStyle === 'elevated' ? 'bg-blue-500/20 border-blue-500 text-white' : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <ChevronRight className="w-5 h-5 -rotate-90" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Raised</span>
                    </button>
                    <button
                      onClick={() => updateSetting('reliefStyle', 'emboss')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${settings.reliefStyle === 'emboss' ? 'bg-amber-500/20 border-amber-500 text-white' : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <span className="text-base">⬡</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Emboss</span>
                    </button>
                    <button
                      onClick={() => updateSetting('reliefStyle', 'embedded')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${settings.reliefStyle === 'embedded' ? 'bg-blue-500/20 border-blue-500 text-white' : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <ChevronRight className="w-5 h-5 rotate-90" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Engraved</span>
                    </button>
                  </div>

                  <div className="h-px bg-white/5 my-1" />

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-neutral-400 font-medium">Subject is lighter than background</span>
                      <button
                        onClick={() => updateSetting('reliefStyle', settings.reliefStyle === 'elevated' ? 'embedded' : 'elevated')}
                        className="text-[10px] text-blue-400 hover:underline font-medium"
                      >
                        Flip Polarity
                      </button>
                    </div>
                    <p className="text-[9px] text-neutral-600 leading-tight italic">
                      Tip: If your face/text looks like a hole, click "Flip Polarity" or switch modes.
                    </p>
                  </div>
                </div>

                <SettingSlider 
                  label="Base Height" 
                  value={settings.baseHeight} 
                  min={0.5} max={20} step={0.1} unit="mm"
                  onChange={(v) => updateSetting('baseHeight', v)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <SettingSlider 
                    label="Rim Width" 
                    value={settings.rimWidth} 
                    min={0.1} max={30} step={0.1} unit="mm"
                    onChange={(v) => updateSetting('rimWidth', v)}
                  />
                  <SettingSlider 
                    label="Rim Height" 
                    value={settings.rimHeight} 
                    min={0.1} max={10} step={0.1} unit="mm"
                    onChange={(v) => updateSetting('rimHeight', v)}
                  />
                </div>
                <SettingSlider 
                  label="Diameter" 
                  value={settings.diameter} 
                  min={10} max={500} step={1} unit="mm"
                  onChange={(v) => updateSetting('diameter', v)}
                />
                <div className="space-y-1 pt-2">
                  <SettingSlider 
                    label="Elevation Level" 
                    value={settings.maxRelief} 
                    min={0.1} max={50} step={0.1} unit="mm"
                    onChange={(v) => updateSetting('maxRelief', v)}
                  />
                  <div className="flex justify-between px-1">
                    <span className="text-[9px] text-neutral-600 uppercase tracking-widest">Subtle</span>
                    <span className="text-[9px] text-neutral-600 uppercase tracking-widest">Extreme</span>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <SettingSlider
                    label="Surface Texture"
                    value={settings.surfaceNoise}
                    min={0} max={0.5} step={0.01}
                    onChange={(v) => updateSetting('surfaceNoise', v)}
                  />
                  <div className="flex justify-between px-1">
                    <span className="text-[9px] text-neutral-600 uppercase tracking-widest">Subtle</span>
                    <span className="text-[9px] text-neutral-600 uppercase tracking-widest">Extreme</span>
                  </div>
                </div>

                {/* Text Overlay */}
                <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">Text Overlay</span>
                    <span className="text-[9px] text-amber-400/80 font-semibold tracking-wide">
                      {settings.textFont === 'bold' ? 'Trajan Bold' : 'Trajan Semibold'}
                    </span>
                  </div>

                  {/* Top arc */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-neutral-500 uppercase tracking-wider w-20 shrink-0">Top Arc</span>
                      <span className="text-[9px] text-neutral-600">10 → 2 o'clock</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. IN HONOUR OF SERVICE · EST. 2024"
                      value={settings.topText}
                      onChange={(e) => updateSetting('topText', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                      style={{ fontFamily: '"Trajan Pro", serif', letterSpacing: '0.05em' }}
                    />
                  </div>

                  {/* Bottom arc */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-neutral-500 uppercase tracking-wider w-20 shrink-0">Bottom Arc</span>
                      <span className="text-[9px] text-neutral-600">7 → 5 o'clock</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. COURAGE · UNITY · EXCELLENCE"
                      value={settings.bottomText}
                      onChange={(e) => updateSetting('bottomText', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                      style={{ fontFamily: '"Trajan Pro", serif', letterSpacing: '0.05em' }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <SettingSlider
                      label="Text Size"
                      value={settings.textSize}
                      min={0.4} max={2.0} step={0.05}
                      onChange={(v) => updateSetting('textSize', v)}
                    />
                    <SettingSlider
                      label="Text Depth"
                      value={settings.textDepthMm}
                      min={0.2} max={5.0} step={0.1} unit="mm"
                      onChange={(v) => updateSetting('textDepthMm', v)}
                    />
                  </div>

                  {/* Signature */}
                  <div className="space-y-1 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-neutral-500 uppercase tracking-wider w-20 shrink-0">Signature</span>
                      <span className="text-[9px] text-neutral-600">centred below portrait · optional</span>
                    </div>
                    {/* Signature Font picker */}
                    <p className="text-[9px] text-neutral-500 font-semibold uppercase tracking-wider mt-1">Font Style</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => updateSetting('signatureFont', 'great-vibes')}
                        className={`py-2 px-2 rounded-lg border flex flex-col items-center gap-0.5 transition-all ${settings.signatureFont === 'great-vibes' ? 'bg-amber-500/20 border-amber-500 text-white' : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10'}`}
                      >
                        <span style={{ fontFamily: '"Great Vibes", cursive', fontSize: '16px' }}>Cursive</span>
                        <span className="text-[8px] opacity-60 normal-case">Great Vibes script</span>
                      </button>
                      <button
                        onClick={() => updateSetting('signatureFont', 'trajan')}
                        className={`py-2 px-2 rounded-lg border flex flex-col items-center gap-0.5 transition-all ${settings.signatureFont === 'trajan' ? 'bg-amber-500/20 border-amber-500 text-white' : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10'}`}
                      >
                        <span style={{ fontFamily: '"Trajan Pro", serif', fontSize: '12px', fontWeight: 700 }} className="uppercase tracking-wider">Trajan Pro</span>
                        <span className="text-[8px] opacity-60 normal-case">Best for 3D printing</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Opeyemi Racheal"
                      value={settings.signatureText}
                      onChange={(e) => updateSetting('signatureText', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                      style={{ fontFamily: settings.signatureFont === 'trajan' ? '"Trajan Pro", serif' : '"Great Vibes", cursive' }}
                    />
                    <SettingSlider
                      label="Signature Size"
                      value={settings.signatureSize}
                      min={0.4} max={2.0} step={0.05}
                      onChange={(v) => updateSetting('signatureSize', v)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <SettingSlider
                        label="◀ ▶ Position"
                        value={settings.signatureOffsetX}
                        min={-1.0} max={1.0} step={0.02}
                        displayValue={settings.signatureOffsetX === 0 ? 'centre' : `${settings.signatureOffsetX > 0 ? '+' : ''}${settings.signatureOffsetX.toFixed(2)}`}
                        onChange={(v) => updateSetting('signatureOffsetX', v)}
                      />
                      <SettingSlider
                        label="▲ ▼ Position"
                        value={settings.signatureOffsetY}
                        min={-1.0} max={1.0} step={0.02}
                        displayValue={settings.signatureOffsetY === 0 ? 'centre' : `${settings.signatureOffsetY > 0 ? '+' : ''}${settings.signatureOffsetY.toFixed(2)}`}
                        onChange={(v) => updateSetting('signatureOffsetY', v)}
                      />
                    </div>
                  </div>

                  {/* Portrait Medallion Ring */}
                  <div className="space-y-2 pt-1 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-neutral-500 uppercase tracking-wider">Portrait Ring</span>
                        <span className="text-[9px] text-neutral-600">border circle between portrait &amp; text</span>
                      </div>
                      {/* Toggle */}
                      <button
                        onClick={() => updateSetting('medallionRingEnabled', !settings.medallionRingEnabled)}
                        className={`relative w-9 h-5 rounded-full transition-colors ${settings.medallionRingEnabled ? 'bg-amber-500' : 'bg-neutral-700'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.medallionRingEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    {settings.medallionRingEnabled && (
                      <div className="space-y-2 pl-1">
                        <p className="text-[9px] text-neutral-600 italic">Position auto-calculated between portrait and text arc.</p>
                        <SettingSlider
                          label="Ring Width"
                          value={settings.medallionRingWidthMm}
                          min={0.5} max={4.0} step={0.1} unit="mm"
                          onChange={(v) => updateSetting('medallionRingWidthMm', v)}
                        />
                        <SettingSlider
                          label="Ring Depth"
                          value={settings.medallionRingDepthMm}
                          min={0.2} max={4.0} step={0.1} unit="mm"
                          onChange={(v) => updateSetting('medallionRingDepthMm', v)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Arc span controls */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                    <SettingSlider
                      label="Top Span"
                      value={settings.topTextSpan}
                      min={60} max={330} step={5}
                      displayValue={`${settings.topTextSpan}°`}
                      onChange={(v) => updateSetting('topTextSpan', v)}
                    />
                    <SettingSlider
                      label="Bot Span"
                      value={settings.bottomTextSpan}
                      min={40} max={180} step={5}
                      displayValue={`${settings.bottomTextSpan}°`}
                      onChange={(v) => updateSetting('bottomTextSpan', v)}
                    />
                  </div>

                  <p className="text-[9px] text-neutral-600 leading-tight italic">
                    Wider span = larger font for same text. Re-generate after editing.
                  </p>
                </div>

                <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider block">Image Tuning</span>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">Invert Image</label>
                    <button
                      onClick={() => updateSetting('invertImage', !settings.invertImage)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${settings.invertImage ? 'bg-blue-500' : 'bg-neutral-700'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.invertImage ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                  
                  <SettingSlider
                    label="Contrast"
                    value={settings.imageContrast}
                    min={0.1} max={3.0} step={0.1}
                    onChange={(v) => updateSetting('imageContrast', v)}
                  />

                  <SettingSlider
                    label="Brightness"
                    value={settings.imageBrightness}
                    min={-1.0} max={1.0} step={0.05}
                    onChange={(v) => updateSetting('imageBrightness', v)}
                  />
                  
                  <p className="text-[9px] text-neutral-600 leading-tight italic">
                    Use these to fix faint text or inverted colors (e.g. text going inwards instead of outwards).
                  </p>
                </div>

                <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider block">Image Position</span>

                  {/* Horizontal slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">Horizontal</label>
                      <span className="text-xs font-mono text-blue-400">{settings.imageOffsetX.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={-0.5} max={0.5} step={0.01}
                      value={settings.imageOffsetX}
                      onChange={(e) => updateSetting('imageOffsetX', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between px-1">
                      <span className="text-[9px] text-neutral-500 uppercase tracking-widest">◀ Left</span>
                      <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Right ▶</span>
                    </div>
                  </div>

                  {/* Vertical slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">Vertical</label>
                      <span className="text-xs font-mono text-blue-400">{settings.imageOffsetY.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={-0.5} max={0.5} step={0.01}
                      value={settings.imageOffsetY}
                      onChange={(e) => updateSetting('imageOffsetY', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between px-1">
                      <span className="text-[9px] text-neutral-500 uppercase tracking-widest">▲ Up</span>
                      <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Down ▼</span>
                    </div>
                  </div>

                  <p className="text-[9px] text-neutral-600 leading-tight italic">
                    Use these if the portrait or text appears off-centre on the coin.
                  </p>
                </div>

                <SettingSlider
                  label="Resolution"
                  value={settings.gridResolution}
                  min={512} max={768} step={128}
                  onChange={(v) => updateSetting('gridResolution', v)}
                />
              </div>

              <button 
                onClick={resetSettings}
                className="w-full py-2 rounded-lg border border-white/10 text-xs font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Preset
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

interface SettingSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  displayValue?: string;
  onChange: (val: number) => void;
}

function SettingSlider({ label, value, min, max, step, unit, displayValue, onChange }: SettingSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">{label}</label>
        <span className="text-xs font-mono text-blue-400">{displayValue ?? `${value}${unit ?? ''}`}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}
