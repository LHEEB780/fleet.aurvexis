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
  originTitle?: string;
  originLat?: number;
  originLng?: number;
  isModal?: boolean;
  onClose?: () => void;
  height?: string | number;
  allowExternalAppLaunch?: boolean;
  isInsideFullscreen?: boolean;
}

export const WazeEmbeddedNavigator: React.FC<WazeEmbeddedNavigatorProps> = ({
  lat = 24.7136,
  lng = 46.6753,
  zoom = 13,
  destinationTitle,
  destinationSubtitle,
  originTitle,
  originLat,
  originLng,
  isModal = false,
  onClose,
  height = '520px',
  allowExternalAppLaunch = true,
  isInsideFullscreen = false
}) => {
  const { language, dir } = useLanguage();
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

  // Official Waze Live Map iframe URL with pinned destination
  const encodedDesc = encodeURIComponent(destinationTitle || (language === 'ar' ? 'وجهة تسليم الشحنة' : 'Freight Delivery Site'));
  const wazeIframeUrl = `https://embed.waze.com/iframe?zoom=${currentZoom}&lat=${activeLat}&lon=${activeLng}&pin=1&desc=${encodedDesc}&ct=livemap`;

  // Native Waze mobile deep link (instant turn-by-turn route navigation from user's current GPS to destination)
  const wazeAppUrl = `https://waze.com/ul?ll=${activeLat},${activeLng}&navigate=yes`;

  // Google Maps Directions link fallback
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${activeLat},${activeLng}&travelmode=driving`;

  const handleRefresh = () => {
    setIsReloading(true);
    setTimeout(() => setIsReloading(false), 500);
  };

  const content = (
    <div className={`flex flex-col bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative ${isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'w-full'}`}>
      
      {/* Top Bar / Header (Hidden when inside DriverLiveMap fullscreen mode) */}
      {!isInsideFullscreen && (
        <div className="px-3 sm:px-4 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          
          {/* Left: Branding & Info */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#33ccff] flex items-center justify-center text-slate-950 font-black shadow-md shadow-[#33ccff]/25 shrink-0">
              <span className="text-xs font-mono font-black">W</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  {language === 'ar' ? 'ملاحة ويز المباشرة (Waze Live)' : 'Waze Live Navigation'}
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
      )}

      {/* Prominent Direct Route Navigation Action Card */}
      <div 
        className={`${isInsideFullscreen ? 'pt-14 pb-2 px-3 bg-slate-950/95 border-b border-slate-800' : 'p-3 sm:p-4 bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border-b border-cyan-500/20'} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 transition-all`} 
        dir={dir}
      >
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-black text-cyan-300">
            <Navigation size={13} className="animate-spin-slow shrink-0 text-cyan-400" />
            <span>{language === 'ar' ? 'المسار المحدد للشاحنة:' : 'Designated Route:'}</span>
          </div>
          <div className="text-[11px] sm:text-xs text-slate-200 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-400">
              {originTitle ? (language === 'ar' ? `من: ${originTitle}` : `From: ${originTitle}`) : (language === 'ar' ? 'من: موقعك الحالي' : 'From: Current Location')}
            </span>
            <span>➔</span>
            <span className="font-black text-cyan-300 px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/30">
              {destinationTitle || (language === 'ar' ? 'وجهة التسليم' : 'Destination Site')}
            </span>
          </div>
        </div>

        {/* Action Buttons to Launch Immediate Navigation */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <a
            href={wazeAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${isInsideFullscreen ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs'} rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:from-[#0096c7] hover:to-[#023e8a] active:scale-95 text-white font-black transition-all flex items-center gap-1.5 shadow-md shadow-cyan-950/50 cursor-pointer`}
            title={language === 'ar' ? 'بدء الملاحة الحية فوراً في ويز مع التوجيه الصوتي' : 'Start live turn-by-turn navigation in Waze'}
          >
            <Car size={14} />
            <span>{language === 'ar' ? 'ابدأ الملاحة في Waze 🚗' : 'Navigate in Waze 🚗'}</span>
            <ExternalLink size={11} className="opacity-70" />
          </a>

          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${isInsideFullscreen ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-2 text-xs'} rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-bold transition-all flex items-center gap-1.5 cursor-pointer`}
            title={language === 'ar' ? 'فتح المسار في خرائط Google' : 'Open Route in Google Maps'}
          >
            <MapPin size={12} className="text-rose-400" />
            <span className="hidden sm:inline">{language === 'ar' ? 'خرائط Google' : 'Google Maps'}</span>
          </a>
        </div>
      </div>

      {/* Real-time Community Banner (Hidden in compact fullscreen mode) */}
      {!isInsideFullscreen && (
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
      )}

      {/* Embedded Waze Live Map iFrame (The Core Implementation Requested by User) */}
      <div 
        className="relative w-full overflow-hidden bg-slate-950 flex-1" 
        style={{ height: isInsideFullscreen ? 'calc(100vh - 54px)' : (isFullscreen ? 'calc(100vh - 85px)' : height) }}
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
