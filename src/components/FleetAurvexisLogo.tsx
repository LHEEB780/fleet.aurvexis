import React, { useState } from 'react';
import { Sparkles, Download, Check, ShieldCheck, Eye, Layers, Palette, FileCode, Image as ImageIcon, Sun, Moon, Copy } from 'lucide-react';
import officialLogoImg from '../assets/images/fleet_aurvexis_brand_logo_1787051487788.jpg';
import secondaryLogoImg from '../assets/images/fleet_aurvexis_modern_emblem_1787051502459.jpg';

interface FleetAurvexisLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  showText?: boolean;
  showSubtitle?: boolean;
  customText?: string;
  customSubtitle?: string;
  className?: string;
  enableModalOnPress?: boolean;
  useVector?: boolean;
  isDarkBg?: boolean;
}

/**
 * World-Class Precision Vector SVG Emblem for FleetAurvexis
 * Built with mathematical elegance, combining the stylized 'F' and 'A' speed monogram,
 * aerodynamic fleet velocity wings, and an intelligent AI core shield.
 */
export function FleetAurvexisVectorEmblem({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} drop-shadow-[0_6px_20px_rgba(79,70,229,0.4)]`}
    >
      <defs>
        {/* Luxury Obsidian Backdrop */}
        <linearGradient id="bgGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="50%" stopColor="#090D16" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Primary Sapphire & Indigo Gradient */}
        <linearGradient id="primaryShield" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="25%" stopColor="#6366F1" />
          <stop offset="70%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>

        {/* Electric Violet / Magenta Velocity Wing */}
        <linearGradient id="violetWing" x1="180" y1="30" x2="30" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="40%" stopColor="#9333EA" />
          <stop offset="80%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* Luminous Cyber Cyan Accent */}
        <linearGradient id="cyanStreak" x1="40" y1="60" x2="160" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="50%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* Core Quantum Jewel */}
        <radialGradient id="coreJewel" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#38BDF8" />
          <stop offset="75%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#0F172A" />
        </radialGradient>

        {/* Soft Glow */}
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Hexagonal Shield Container */}
      <rect width="200" height="200" rx="46" fill="url(#bgGrad)" />
      
      {/* Outer Polished Bevel Stroke */}
      <rect x="2" y="2" width="196" height="196" rx="44" stroke="url(#primaryShield)" strokeWidth="2.5" strokeOpacity="0.45" />

      {/* Modern Telemetry Sub-Rings */}
      <circle cx="100" cy="100" r="78" stroke="#6366F1" strokeWidth="1.5" strokeDasharray="6 8" strokeOpacity="0.25" />
      <circle cx="100" cy="100" r="64" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.2" />

      {/* Stylized Interlocking "F" & "A" Aerodynamic Wings */}
      <g filter="url(#softGlow)">
        {/* Forward Supersonic Wing (Fleet Speed) */}
        <path 
          d="M36 128 C 40 70, 85 40, 146 38 C 118 60, 92 88, 80 138 C 64 146, 42 142, 36 128 Z" 
          fill="url(#primaryShield)" 
        />
        
        {/* Sweeping Ascending Arch (Aurvexis AI Connectivity) */}
        <path 
          d="M164 72 C 160 130, 115 160, 54 162 C 82 140, 108 112, 120 62 C 136 54, 158 58, 164 72 Z" 
          fill="url(#violetWing)" 
        />

        {/* Central Dynamic Speed Chevron / Monogram Bar */}
        <path 
          d="M68 98 L132 98 C138 98, 142 102, 138 106 L124 116 C120 119, 115 119, 110 116 L64 106 C60 102, 63 98, 68 98 Z" 
          fill="url(#cyanStreak)" 
        />
      </g>

      {/* Precision Micro Mechanics & AI Nodes */}
      <g stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round">
        <line x1="100" y1="24" x2="100" y2="36" stroke="#38BDF8" strokeWidth="3" />
        <line x1="100" y1="164" x2="100" y2="176" stroke="#C084FC" strokeWidth="3" />
        <line x1="24" y1="100" x2="36" y2="100" stroke="#38BDF8" strokeWidth="3" />
        <line x1="164" y1="100" x2="176" y2="100" stroke="#A855F7" strokeWidth="3" />
      </g>

      {/* Central High-Tech Reactor Core */}
      <circle cx="100" cy="100" r="26" fill="#090D16" stroke="url(#cyanStreak)" strokeWidth="2.5" />
      <circle cx="100" cy="100" r="18" fill="url(#coreJewel)" />
      <circle cx="94" cy="94" r="5" fill="#FFFFFF" fillOpacity="0.9" />

      {/* Quantum Sparkles */}
      <circle cx="50" cy="50" r="3" fill="#38BDF8" />
      <circle cx="150" cy="50" r="3" fill="#C084FC" />
      <circle cx="150" cy="150" r="3" fill="#818CF8" />
      <circle cx="50" cy="150" r="3" fill="#34D399" />
    </svg>
  );
}

export default function FleetAurvexisLogo({
  size = 'md',
  showText = true,
  showSubtitle = true,
  customText,
  customSubtitle,
  className = '',
  enableModalOnPress = true,
  useVector = false,
  isDarkBg = false
}: FleetAurvexisLogoProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAssetIndex, setActiveAssetIndex] = useState<0 | 1 | 2>(0);
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  // Size mappings
  const sizeMap = {
    sm: { icon: 'w-10 h-10', text: 'text-base', sub: 'text-[9.5px]', gap: 'gap-2.5' },
    md: { icon: 'w-13 h-13 sm:w-14 sm:h-14', text: 'text-lg sm:text-xl', sub: 'text-[11px]', gap: 'gap-3.5' },
    lg: { icon: 'w-16 h-16 sm:w-20 sm:h-20', text: 'text-2xl sm:text-3xl', sub: 'text-xs', gap: 'gap-4' },
    xl: { icon: 'w-24 h-24 sm:w-28 sm:h-28', text: 'text-3xl sm:text-4xl', sub: 'text-sm', gap: 'gap-5' },
    '2xl': { icon: 'w-32 h-32 sm:w-36 sm:h-36', text: 'text-4xl sm:text-5xl', sub: 'text-base', gap: 'gap-6' },
    hero: { icon: 'w-40 h-40 sm:w-48 sm:h-48', text: 'text-5xl sm:text-6xl', sub: 'text-lg', gap: 'gap-7' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const brandTitle = customText || 'FleetAurvexis';
  const brandSub = customSubtitle || 'Intelligent Fleet & AI Diagnostics';

  const assets = [
    {
      title: 'الهوية الرسمية الفاخرة (Titanium Sapphire)',
      type: 'image',
      src: officialLogoImg,
      desc: 'التصميم المعتمد الذي يدمج أجنحة حركة الأسطول السريعة مع درع الحماية السحابي والهندسة الميكانيكية.'
    },
    {
      title: 'الهوية السيبرانية الحديثة (Cyber Velocity)',
      type: 'image',
      src: secondaryLogoImg,
      desc: 'نسخة رقمية نيون بلمسات التليماتكس ومعالجة إشارات OBD-II والتشخيص التنبؤي.'
    },
    {
      title: 'الرمز المتجهي النقي (Ultra Sharp Vector)',
      type: 'vector',
      src: null,
      desc: 'شعار متجهي SVG غير محدود الدقة صالح للطباعة الضخمة والشاشات عالية الكثافة (Retina/4K).'
    }
  ];

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const downloadVectorSvg = () => {
    const svgCode = `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="bgGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#0F172A"/><stop offset="50%" stop-color="#090D16"/><stop offset="100%" stop-color="#020617"/></linearGradient>
<linearGradient id="primaryShield" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#38BDF8"/><stop offset="25%" stop-color="#6366F1"/><stop offset="70%" stop-color="#4F46E5"/><stop offset="100%" stop-color="#1E1B4B"/></linearGradient>
<linearGradient id="violetWing" x1="180" y1="30" x2="30" y2="170" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#C084FC"/><stop offset="40%" stop-color="#9333EA"/><stop offset="80%" stop-color="#4F46E5"/><stop offset="100%" stop-color="#06B6D4"/></linearGradient>
<linearGradient id="cyanStreak" x1="40" y1="60" x2="160" y2="140" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#22D3EE"/><stop offset="50%" stop-color="#67E8F9"/><stop offset="100%" stop-color="#3B82F6"/></linearGradient>
<radialGradient id="coreJewel" cx="40%" cy="35%" r="65%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="35%" stop-color="#38BDF8"/><stop offset="75%" stop-color="#4F46E5"/><stop offset="100%" stop-color="#0F172A"/></radialGradient>
</defs>
<rect width="200" height="200" rx="46" fill="url(#bgGrad)"/>
<rect x="2" y="2" width="196" height="196" rx="44" stroke="url(#primaryShield)" stroke-width="2.5" stroke-opacity="0.45"/>
<circle cx="100" cy="100" r="78" stroke="#6366F1" stroke-width="1.5" stroke-dasharray="6 8" stroke-opacity="0.25"/>
<circle cx="100" cy="100" r="64" stroke="#38BDF8" stroke-width="1" stroke-opacity="0.2"/>
<path d="M36 128 C 40 70, 85 40, 146 38 C 118 60, 92 88, 80 138 C 64 146, 42 142, 36 128 Z" fill="url(#primaryShield)"/>
<path d="M164 72 C 160 130, 115 160, 54 162 C 82 140, 108 112, 120 62 C 136 54, 158 58, 164 72 Z" fill="url(#violetWing)"/>
<path d="M68 98 L132 98 C138 98, 142 102, 138 106 L124 116 C120 119, 115 119, 110 116 L64 106 C60 102, 63 98, 68 98 Z" fill="url(#cyanStreak)"/>
<circle cx="100" cy="100" r="26" fill="#090D16" stroke="url(#cyanStreak)" stroke-width="2.5"/>
<circle cx="100" cy="100" r="18" fill="url(#coreJewel)"/>
<circle cx="94" cy="94" r="5" fill="#FFFFFF" fill-opacity="0.9"/>
</svg>`;
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FleetAurvexis-Official-Logo-Vector.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedFormat('svg');
    setTimeout(() => setDownloadedFormat(null), 2500);
  };

  const downloadActiveJpg = (imgSrc: string, name: string) => {
    const a = document.createElement('a');
    a.href = imgSrc;
    a.download = `${name}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadedFormat('jpg');
    setTimeout(() => setDownloadedFormat(null), 2500);
  };

  return (
    <>
      <div 
        className={`inline-flex items-center ${currentSize.gap} ${className} ${enableModalOnPress ? 'cursor-pointer group' : ''}`}
        onClick={() => enableModalOnPress && setIsModalOpen(true)}
      >
        {/* High-Resolution Emblem Container */}
        <div className={`relative ${currentSize.icon} shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl group-hover:shadow-indigo-500/50 group-hover:scale-105 transition-all duration-300 border-2 border-indigo-400/50 bg-[#090D16]`}>
          <img
            src={officialLogoImg}
            alt="FleetAurvexis Logo"
            className="w-full h-full object-cover select-none"
            referrerPolicy="no-referrer"
          />
          {/* Subtle Outer Cyber Glow */}
          <div className="absolute inset-0 ring-1 ring-inset ring-white/20 pointer-events-none rounded-2xl sm:rounded-3xl" />
        </div>

        {/* High-Contrast Bold Typography */}
        {showText && (
          <div className="flex flex-col select-none text-right justify-center">
            <div className="flex items-center gap-2">
              <span className={`font-black font-sans tracking-tight leading-tight ${currentSize.text} ${
                isDarkBg 
                  ? 'text-white group-hover:text-cyan-300 drop-shadow-sm' 
                  : 'text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 drop-shadow-xs'
              } transition-colors`}>
                {brandTitle}
              </span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
            </div>

            {showSubtitle && (
              <span className={`font-extrabold tracking-wider uppercase mt-0.5 leading-none ${currentSize.sub} ${
                isDarkBg 
                  ? 'text-purple-200/90' 
                  : 'text-indigo-700 dark:text-indigo-300'
              }`}>
                {brandSub}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Brand Identity & Logo Inspection & High-Def Download Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700/90 text-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative space-y-6 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
                  <Palette size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span>الهوية التجارية الرسمية - FleetAurvexis</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                      ORIGINAL 2026
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">نظام الأصول البصرية المعتمدة بدقة فائقة وشعار تجاري عالمي</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-black transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Asset Style Switcher Tabs */}
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              {assets.map((asset, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveAssetIndex(idx as 0 | 1 | 2)}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer truncate ${
                    activeAssetIndex === idx
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {asset.title.split('(')[0]}
                </button>
              ))}
            </div>

            {/* Showcase Stage with Theme Toggle */}
            <div className={`relative rounded-3xl border transition-all duration-300 p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 overflow-hidden shadow-2xl ${
              previewTheme === 'dark' 
                ? 'bg-gradient-to-b from-[#090D16] via-[#0e1629] to-[#090D16] border-indigo-500/30 text-white' 
                : 'bg-gradient-to-b from-slate-100 via-white to-slate-100 border-slate-300 text-slate-900'
            }`}>
              
              {/* Background Ambient Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
              
              {/* Top controls */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <button
                  onClick={() => setPreviewTheme(previewTheme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition"
                  title="تبديل الخلفية للمعاينة"
                >
                  {previewTheme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-400" />}
                  <span className="text-[10px] font-bold">{previewTheme === 'dark' ? 'معاينة خلفية فاتحة' : 'معاينة خلفية داكنة'}</span>
                </button>
              </div>

              {/* Central Master Logo Display */}
              <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.5)] border-2 border-indigo-400/60 relative group bg-[#090D16] p-1">
                {assets[activeAssetIndex].type === 'vector' ? (
                  <FleetAurvexisVectorEmblem className="w-full h-full" />
                ) : (
                  <img 
                    src={assets[activeAssetIndex].src!} 
                    alt="FleetAurvexis Master Brand Logo" 
                    className="w-full h-full object-cover rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-3xl sm:text-4xl font-black tracking-wide flex items-center justify-center gap-2">
                  <span>FleetAurvexis</span>
                  <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-pulse" />
                </h4>
                <p className={`text-xs sm:text-sm font-bold max-w-md mx-auto ${
                  previewTheme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'
                }`}>
                  {assets[activeAssetIndex].desc}
                </p>
              </div>

              {/* Color System Swatches with Instant Copy */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {[
                  { hex: '#4F46E5', name: 'Royal Indigo' },
                  { hex: '#8B5CF6', name: 'Electric Violet' },
                  { hex: '#06B6D4', name: 'Cyber Cyan' },
                  { hex: '#0F172A', name: 'Obsidian Slate' }
                ].map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => handleCopyColor(color.hex)}
                    className="flex items-center gap-2 bg-slate-950/90 hover:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono transition cursor-pointer group shadow-sm"
                  >
                    <span className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0" style={{ backgroundColor: color.hex }} />
                    <span className="text-slate-200">{color.hex}</span>
                    {copiedColor === color.hex ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={11} className="text-slate-500 group-hover:text-slate-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Design Spec Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/90 space-y-1">
                <span className="text-[11px] text-cyan-400 font-black block">1. الأجنحة الديناميكية (F):</span>
                <span className="text-slate-300 font-medium text-[11.5px]">ترمز لحركة وسرعة وانسيابية المركبات على شبكات الطرق السريعة.</span>
              </div>
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/90 space-y-1">
                <span className="text-[11px] text-indigo-400 font-black block">2. درع الحماية (Aurvexis):</span>
                <span className="text-slate-300 font-medium text-[11.5px]">يعكس حوكمة الصيانة الوقائية والسلامة التشغيلية للأساطيل.</span>
              </div>
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/90 space-y-1">
                <span className="text-[11px] text-purple-400 font-black block">3. النواة الذكية (AI Core):</span>
                <span className="text-slate-300 font-medium text-[11.5px]">تمثل المحرك السحابي للتحليل التنبؤي ومعالجة أكواد الأعطال.</span>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (activeAssetIndex === 2) {
                    downloadVectorSvg();
                  } else {
                    downloadActiveJpg(
                      assets[activeAssetIndex].src!,
                      activeAssetIndex === 0 ? 'FleetAurvexis-Official-Brand-Logo-2026' : 'FleetAurvexis-Cyber-Emblem-2026'
                    );
                  }
                }}
                className="py-3 px-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 active:scale-98 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {downloadedFormat ? (
                  <>
                    <Check size={16} className="text-emerald-300" />
                    <span>تم حفظ الشعار بنجاح ✓</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={16} />
                    <span>تحميل الشعار المختار بدقة فائقة HD</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={downloadVectorSvg}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-98 text-white font-black text-xs rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCode size={16} className="text-cyan-400" />
                <span>تحميل ملف Vector SVG (طباعة بجودة غير محدودة)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
