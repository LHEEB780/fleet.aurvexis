import React, { useState } from 'react';
import { 
  Navigation, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  AlertTriangle, 
  Car, 
  MapPin, 
  ShieldCheck, 
  Radio, 
  Compass, 
  Sparkles,
  X,
  Layers
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';

interface WazeEmbeddedNavigatorProps {
  lat?: number;
  lng?: number;
  zoom?: number;
  destinationTitle?: string;
  destinationSubtitle?: string;
  isModal?: boolean;
  onClose?: () => void;
  height?: string | number;
  allowExternalAppLaunch?: boolean;
}

export const WazeEmbeddedNavigator: React.FC<WazeEmbeddedNavigatorProps> = ({
  lat = 24.7136,
  lng = 46.6753,
  zoom = 13,
  destinationTitle,
  destinationSubtitle,
  isModal = false,
  onClose,
  height = '520px',
  allowExternalAppLaunch = true
}) => {
  const { language } = useLanguage();
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [isReloading, setIsReloading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePreset, setActivePreset] = useState<'riyadh' | 'jeddah' | 'dammam' | 'custom'>('custom');

  // Popular operational hubs in Saudi Arabia
  const cityPresets = [
    { id: 'riyadh', nameAr: 'الرياض (المركز الرئيسي)', nameEn: 'Riyadh Hub', lat: 24.7136, lng: 46.6753 },
    { id: 'jeddah', nameAr: 'جدة (الميناء والمستودعات)', nameEn: 'Jeddah Logistics', lat: 21.4858, lng: 39.1925 },
    { id: 'dammam', nameAr: 'الدمام (المنطقة الشرقية)', nameEn: 'Dammam Depot', lat: 26.4207, lng: 50.0888 }
  ];

  // Active coordinates
  const activeLat = activePreset === 'custom' ? lat : (cityPresets.find(p => p.id === activePreset)?.lat || lat);
  const activeLng = activePreset === 'custom' ? lng : (cityPresets.find(p => p.id === activePreset)?.lng || lng);

  // Official Waze Live Map iframe URL
  const wazeIframeUrl = `https://embed.waze.com/iframe?zoom=${currentZoom}&lat=${activeLat}&lon=${activeLng}&ct=livemap`;

  // Native Waze mobile deep link (fallback for turn-by-turn voice navigation on mobile devices)
  const wazeAppUrl = `https://waze.com/ul?ll=${activeLat},${activeLng}&navigate=yes`;

  const handleRefresh = () => {
    setIsReloading(true);
    setTimeout(() => setIsReloading(false), 500);
  };

  const content = (
    <div className={`flex flex-col bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative ${isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'w-full'}`}>
      
      {/* Top Bar / Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        
        {/* Left: Branding & Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#33ccff] flex items-center justify-center text-slate-950 font-black shadow-md shadow-[#33ccff]/25 shrink-0">
            <span className="text-xs font-mono font-black">W</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                {language === 'ar' ? 'خريطة ويز المباشرة (Waze Live Map)' : 'Waze Live Navigation Map'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {language === 'ar' ? 'حركة المرور الحية' : 'Live Traffic'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
              {destinationTitle ? (
                <>
                  <span className="text-cyan-400 font-bold">{destinationTitle}</span>
                  {destinationSubtitle && <span className="text-slate-500 mr-1.5">({destinationSubtitle})</span>}
                </>
              ) : (
                language === 'ar' 
                  ? 'تتبع حوادث السير، الازدحام، الكاميرات والإغلاقات في الوقت الفعلي داخل التطبيق' 
                  : 'Real-time road hazards, speed traps, jams, and live community alerts'
              )}
            </p>
          </div>
        </div>

        {/* Right: Quick Presets & Control Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* City Presets */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-[10px]">
            <button
              onClick={() => setActivePreset('custom')}
              className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                activePreset === 'custom' ? 'bg-[#33ccff] text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'ar' ? 'الموقع الحالي' : 'Current'}
            </button>
            {cityPresets.map(preset => (
              <button
                key={preset.id}
                onClick={() => setActivePreset(preset.id as any)}
                className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  activePreset === preset.id ? 'bg-[#33ccff] text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'ar' ? preset.nameAr.split(' ')[0] : preset.nameEn.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Refresh Iframe */}
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title={language === 'ar' ? 'تحديث الخريطة' : 'Refresh Map'}
          >
            <RefreshCw size={14} className={isReloading ? 'animate-spin text-[#33ccff]' : ''} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title={isFullscreen ? (language === 'ar' ? 'إنهاء ملء الشاشة' : 'Exit Fullscreen') : (language === 'ar' ? 'ملء الشاشة' : 'Fullscreen')}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* External App Launch for phone turn-by-turn */}
          {allowExternalAppLaunch && (
            <a
              href={wazeAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-[#33ccff]/15 hover:bg-[#33ccff]/25 text-[#33ccff] hover:text-[#55ddff] border border-[#33ccff]/40 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title={language === 'ar' ? 'فتح في تطبيق ويز على الهاتف للتوجيه الصوتي' : 'Open in mobile Waze app for voice guidance'}
            >
              <ExternalLink size={12} />
              <span className="hidden md:inline">{language === 'ar' ? 'توجيه صوتي بالهاتف' : 'Open Waze App'}</span>
            </a>
          )}

          {/* Close Modal Button if modal mode */}
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/40 transition-colors cursor-pointer"
              title={language === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Real-time Community Banner */}
      <div className="bg-indigo-950/60 px-4 py-1.5 border-b border-indigo-900/40 flex items-center justify-between text-[11px] text-slate-300 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Car size={13} className="text-[#33ccff] shrink-0" />
          <span>
            {language === 'ar' 
              ? 'معروض ومدمج داخل التطبيق مثل مشغل الفيديو تماماً • يمكنك استعراض حركة السير والتكبير والتحريك مباشرة'
              : 'Embedded seamlessly inside the application • Pan, zoom, and inspect live traffic alerts right here'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> {language === 'ar' ? 'ازدحام شديد' : 'Heavy Jam'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> {language === 'ar' ? 'تباطؤ مروري' : 'Moderate'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {language === 'ar' ? 'طريق سالك' : 'Clear'}
          </span>
        </div>
      </div>

      {/* Embedded Waze Live Map iFrame (The Core Implementation Requested by User) */}
      <div 
        className="relative w-full overflow-hidden bg-slate-950" 
        style={{ height: isFullscreen ? 'calc(100vh - 85px)' : height }}
      >
        {!isReloading ? (
          <iframe
            src={wazeIframeUrl}
            width="100%"
            height="100%"
            allowFullScreen
            title="Waze Live Map Embedded Navigation"
            className="w-full h-full border-0 outline-none"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-slate-950 text-slate-400">
            <RefreshCw size={24} className="animate-spin text-[#33ccff]" />
            <p className="text-xs font-bold">{language === 'ar' ? 'جاري تحديث خريطة ويز المباشرة...' : 'Updating Waze Live Map...'}</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-2">
          <Radio size={11} className="text-[#33ccff] animate-pulse" />
          <span>{language === 'ar' ? 'تحديثات حركة السير فورية ومدعومة بمجتمع Waze العالمي' : 'Real-time updates powered by Waze Community'}</span>
        </div>
        <div>
          <span>{language === 'ar' ? 'الإحداثيات:' : 'Coords:'} {activeLat.toFixed(4)}, {activeLng.toFixed(4)}</span>
        </div>
      </div>

    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div className="w-full max-w-5xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
export default WazeEmbeddedNavigator;
