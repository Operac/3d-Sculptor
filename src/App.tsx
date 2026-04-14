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
import { CoinSettings, DEFAULT_SETTINGS, COIN_PRESET, PLAQUE_PRESET, LARGE_PLAQUE_PRESET, POCKET_2_PRESET, exportToSTL } from './lib/coinGenerator';
import * as THREE from 'three';

// Use a high-quality placeholder for the default image
const DEFAULT_IMAGE = "https://picsum.photos/seed/mao-coin/1024/1024"; 

export default function App() {
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
    else if (settings.diameter === 39 && settings.maxRelief === 1.2) setSettings(POCKET_2_PRESET);
    else if (settings.type === 'coin') setSettings(COIN_PRESET);
    else setSettings(PLAQUE_PRESET);
  };

  const handleExport = () => {
    if (geometryRef.current) {
      exportToSTL(geometryRef.current, 'mao_pocket_coin.stl');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-blue-500/30 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-semibold text-base sm:text-lg tracking-tight text-white hidden sm:block">3D Coin Sculptor</h1>
            <h1 className="font-semibold text-base tracking-tight text-white sm:hidden">Sculptor</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload</span>
            </button>
            <div className="h-4 w-px bg-white/10" />
            <button 
              onClick={handleExport}
              className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/10"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export STL</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button 
              onClick={() => setIsMobileSettingsOpen(true)}
              className="lg:hidden p-2 text-neutral-400 hover:text-white transition-colors"
            >
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Viewer */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex-1 min-h-[400px] lg:min-h-0 relative">
            <CoinViewer 
              imageSrc={imageSrc} 
              settings={settings} 
              useAdvancedMaterials={useAdvancedMaterials}
              onGeometryGenerated={(geo) => { geometryRef.current = geo; }}
            />
          </div>

          {/* Info Card */}
          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-5 flex gap-4 items-start">
            <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
              <Info className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white mb-1">How it works</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                This tool transforms your 2D image into a 3D relief. Lighter areas of the image are extruded higher, while darker areas remain closer to the coin base. For best results, use a high-contrast grayscale depth map.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Controls (Hidden on mobile, shown in drawer) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-6">
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
    <div className="space-y-6">
      {/* Model Type */}
      <section className="bg-neutral-900 border border-white/5 rounded-2xl p-6">
        <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
          <Layout className="w-4 h-4 text-neutral-400" />
          Model Type
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => setPreset('coin')}
            className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${settings.type === 'coin' && settings.diameter !== 425 ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-white/5 text-neutral-500 hover:text-neutral-300'}`}
          >
            Coin (38mm)
          </button>
          <button 
            onClick={() => setPreset('plaque')}
            className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${settings.type === 'plaque' && settings.diameter !== 425 ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-white/5 text-neutral-500 hover:text-neutral-300'}`}
          >
            Plaque (150mm)
          </button>
          <button 
            onClick={() => setPreset('large-plaque')}
            className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${settings.diameter === 425 ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-neutral-500 hover:text-neutral-300'}`}
          >
            Large (425mm)
          </button>
          <button 
            onClick={() => setPreset('pocket-2')}
            className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${settings.diameter === 39 && settings.maxRelief === 1.2 ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-white/5 text-neutral-500 hover:text-neutral-300'}`}
          >
            Pocket 2 (39mm)
          </button>
        </div>

        {settings.diameter === 39 && settings.maxRelief === 1.2 && (
          <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Pocket 2 Specs</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
              <div className="text-neutral-500 uppercase tracking-tight">Diameter</div>
              <div className="text-neutral-300 font-medium">38-40mm</div>
              <div className="text-neutral-500 uppercase tracking-tight">Thickness</div>
              <div className="text-neutral-300 font-medium">3-4mm max</div>
              <div className="text-neutral-500 uppercase tracking-tight">Relief Depth</div>
              <div className="text-neutral-300 font-medium">0.8-1.2mm</div>
              <div className="text-neutral-500 uppercase tracking-tight">Typography</div>
              <div className="text-neutral-300 font-medium">Min 3-4mm height</div>
            </div>
          </div>
        )}
        {settings.diameter === 425 && (
          <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-400 block mb-1.5 tracking-wider">Large Plaque Specifications</span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="flex flex-col">
                  <span className="text-[9px] text-blue-400/60 uppercase">Dimensions</span>
                  <span className="text-[10px] text-blue-300 font-medium">425mm Ø • 6mm Base</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-blue-400/60 uppercase">Relief</span>
                  <span className="text-[10px] text-blue-300 font-medium">10mm Max • 15mm Rim</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-blue-500/10">
              <span className="text-[10px] font-bold uppercase text-blue-400 block mb-1.5 tracking-wider">Design Guidelines</span>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-blue-400/80">Primary Text Height</span>
                  <span className="text-[10px] text-blue-300 font-mono">25–30mm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-blue-400/80">Secondary Text Height</span>
                  <span className="text-[10px] text-blue-300 font-mono">15–20mm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-blue-400/80">Text Margin from Edge</span>
                  <span className="text-[10px] text-blue-300 font-mono">15–20mm</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Image Upload */}
      <section className="bg-neutral-900 border border-white/5 rounded-2xl p-6">
        <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-neutral-400" />
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
              <p className="text-[10px] text-neutral-500 mt-1">PNG, JPG up to 5MB</p>
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
      <section className="bg-neutral-900 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-neutral-400" />
            Material Properties
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
      <section className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden">
        {!hideHeader && (
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-neutral-400" />
              <span className="text-sm font-medium text-white">Parameters</span>
            </div>
            {isSettingsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
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
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => updateSetting('reliefStyle', 'elevated')}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${settings.reliefStyle === 'elevated' ? 'bg-blue-500/20 border-blue-500 text-white' : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <ChevronRight className="w-5 h-5 -rotate-90" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Raised (3D)</span>
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
                <SettingSlider 
                  label="Resolution" 
                  value={settings.gridResolution} 
                  min={64} max={1024} step={32}
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
  onChange: (val: number) => void;
}

function SettingSlider({ label, value, min, max, step, unit, onChange }: SettingSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">{label}</label>
        <span className="text-xs font-mono text-blue-400">{value}{unit}</span>
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
