import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, 
  MapPin, 
  Truck, 
  Compass, 
  Maximize2, 
  Minimize2,
  Layers, 
  Radio, 
  AlertTriangle, 
  Phone, 
  Wrench, 
  Fuel, 
  Coffee, 
  CheckCircle2, 
  Clock, 
  Gauge, 
  Route, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Sun,
  Moon,
  CloudSun,
  Shield,
  Eye,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  ZoomIn,
  ZoomOut,
  Crosshair,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../services/LanguageContext';
import { DriverTrip, DriverWaypoint } from '../../types';

interface DriverLiveMapProps {
  activeTrip: DriverTrip | null;
  onUpdateTripStatus: (status: DriverTrip['status'], note?: string) => void;
  onTriggerSOS: (reason: string, location: string) => void;
  isDarkMode: boolean;
}

// Sample points of interest along the route
const NEARBY_SERVICES = [
  { id: 'ws-1', nameAr: 'ورشة أسطول الرياض المركزية', nameEn: 'Riyadh Central Fleet Workshop', type: 'workshop', distKm: 3.4, lat: 24.718, lng: 46.702, phone: '+966 11 405 8899' },
  { id: 'fs-1', nameAr: 'محطة أرامكو ديزل للشاحنات (طريق الخرج)', nameEn: 'Aramco Heavy Diesel Station', type: 'station', distKm: 1.8, lat: 24.695, lng: 46.721, phone: '+966 11 498 2211' },
  { id: 'rs-1', nameAr: 'استراحة ونقطة راحة السائقين الدولية', nameEn: 'Highway Drivers Oasis & Rest', type: 'rest', distKm: 7.2, lat: 24.662, lng: 46.745, phone: '+966 50 123 4567' },
  { id: 'ws-2', nameAr: 'مركز الفحص السريع وميزان المحاور', nameEn: 'Rapid Axle Scale & Inspection', type: 'checkpoint', distKm: 11.5, lat: 24.630, lng: 46.780, phone: '+966 11 223 9900' }
];

export default function DriverLiveMap({
  activeTrip,
  onUpdateTripStatus,
  onTriggerSOS,
  isDarkMode
}: DriverLiveMapProps) {
  const { language, dir } = useLanguage();

  // Map Modes: 'standard' | 'satellite' | 'night'
  const [mapMode, setMapMode] = useState<'standard' | 'satellite' | 'night'>(isDarkMode ? 'night' : 'standard');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSimulatingDrive, setIsSimulatingDrive] = useState(activeTrip?.status === 'in_progress');
  const [progressPercent, setProgressPercent] = useState(38); // Route progress %
  const [currentSpeed, setCurrentSpeed] = useState(74); // KM/H
  const [selectedPOI, setSelectedPOI] = useState<any | null>(null);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosReason, setSosReason] = useState('');
  const [sosDispatched, setSosDispatched] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryRecipient, setDeliveryRecipient] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isHoveringMap, setIsHoveringMap] = useState(false);

  // Keyboard shortcut listener to exit fullscreen on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Lock body scroll when in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Simulation interval for vehicle movement along the route
  useEffect(() => {
    let interval: any;
    if (isSimulatingDrive) {
      interval = setInterval(() => {
        setProgressPercent(prev => {
          if (prev >= 98) {
            setIsSimulatingDrive(false);
            return 100;
          }
          return Number((prev + 0.35).toFixed(2));
        });
        // Realistic fluctuating speed
        setCurrentSpeed(Math.floor(70 + Math.random() * 12));
      }, 1000);
    } else {
      setCurrentSpeed(0);
    }
    return () => clearInterval(interval);
  }, [isSimulatingDrive]);

  // Turn by turn navigation current instruction
  const getNavInstruction = () => {
    if (progressPercent < 20) {
      return {
        icon: <ArrowUp size={22} className="text-emerald-400" />,
        textAr: 'واصل السير مباشرة على طريق الملك فهد باتجاه المخرج 14',
        textEn: 'Continue straight on King Fahd Rd toward Exit 14',
        dist: '2.4 كم',
        distEn: '2.4 km'
      };
    } else if (progressPercent < 55) {
      return {
        icon: <CornerUpRight size={22} className="text-amber-400" />,
        textAr: 'انعطف يميناً نحو الطريق الدائري الجنوبي (مسار الشاحنات الثقيلة)',
        textEn: 'Turn right onto Southern Ring Rd (Heavy Freight Lane)',
        dist: '850 م',
        distEn: '850 m'
      };
    } else if (progressPercent < 85) {
      return {
        icon: <ArrowUp size={22} className="text-indigo-400" />,
        textAr: 'اتجه مباشرة نحو محطة الوزن المحوري ونقطة تفتيش الموقع',
        textEn: 'Head straight to Axle Weigh Station & Site Checkpoint',
        dist: '5.1 كم',
        distEn: '5.1 km'
      };
    } else {
      return {
        icon: <CornerUpLeft size={22} className="text-emerald-400" />,
        textAr: 'اقتربت من الوجهة: انعطف يساراً للدخول إلى بوابة مشروع التسليم',
        textEn: 'Approaching Destination: Turn left into Project Gate',
        dist: '300 م',
        distEn: '300 m'
      };
    }
  };

  const currentNav = getNavInstruction();

  const handleStartResume = () => {
    setIsSimulatingDrive(true);
    onUpdateTripStatus('in_progress', language === 'ar' ? 'بدأ السائق التحرك على المسار' : 'Driver started driving route');
  };

  const handlePauseBreak = () => {
    setIsSimulatingDrive(false);
    onUpdateTripStatus('paused', language === 'ar' ? 'توقف السائق لاستراحة قصيرة' : 'Driver paused for rest break');
  };

  const handleArrivedAtDestination = () => {
    setIsSimulatingDrive(false);
    setProgressPercent(100);
    onUpdateTripStatus('at_destination', language === 'ar' ? 'وصلت المركبة لبوابة موقع المشروع' : 'Vehicle arrived at project site');
    setShowDeliveryModal(true);
  };

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTripStatus('delivered', language === 'ar' ? `تم تسليم الشحنة للمستلم: ${deliveryRecipient || 'مسؤول الموقع'}` : `Cargo handed over to: ${deliveryRecipient || 'Site Manager'}`);
    setShowDeliveryModal(false);
  };

  const handleDispatchSOS = () => {
    if (!sosReason.trim()) return;
    setSosDispatched(true);
    onTriggerSOS(sosReason, `Lat: 24.7136, Lng: 46.6753 (طريق الرياض السريع - كم 42)`);
    setTimeout(() => {
      setSosDispatched(false);
      setSosModalOpen(false);
      setSosReason('');
    }, 2500);
  };

  // SVG Coordinates for the Route Path
  // Path from (50, 240) to (550, 70)
  const routePoints = [
    { x: 60, y: 250, labelAr: 'مستودع الانطلاق', labelEn: 'Origin Depot', reached: progressPercent >= 5 },
    { x: 180, y: 220, labelAr: 'تقاطع الشاحنات', labelEn: 'Freight Junction', reached: progressPercent >= 30 },
    { x: 300, y: 150, labelAr: 'ميزان المحاور', labelEn: 'Axle Weigh Station', reached: progressPercent >= 60 },
    { x: 440, y: 110, labelAr: 'نقطة تفتيش الموقع', labelEn: 'Site Checkpoint', reached: progressPercent >= 85 },
    { x: 540, y: 65, labelAr: 'موقع التسليم النهائي', labelEn: 'Destination Site', reached: progressPercent >= 100 }
  ];

  // Calculate truck position on SVG based on progressPercent
  const getTruckCoordinates = (pct: number) => {
    const t = Math.min(100, Math.max(0, pct)) / 100;
    // Cubic bezier or multi-segment approximation
    const startX = 60;
    const startY = 250;
    const endX = 540;
    const endY = 65;
    
    // Smooth parametric curve
    const x = startX + (endX - startX) * t + Math.sin(t * Math.PI) * 25;
    const y = startY + (endY - startY) * t - Math.sin(t * Math.PI) * 35;
    return { x, y };
  };

  const truckPos = getTruckCoordinates(progressPercent);

  return (
    <div id="map-container" className={isFullscreen ? "fixed inset-0 z-[99999] w-screen h-screen bg-slate-950 overflow-hidden m-0 p-0 rounded-none flex flex-col" : "space-y-4"} dir={dir}>
      {/* Top Map Control Bar - ONLY shown in Normal (Non-Fullscreen) Mode */}
      {!isFullscreen && (
        <div className="bg-white dark:bg-[#0f1422] p-4 rounded-3xl border border-slate-100 dark:border-slate-850/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
              <Navigation size={20} className={isSimulatingDrive ? 'animate-spin-slow' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{language === 'ar' ? 'خريطة التتبع والملاحة الحية' : 'Live Driver GPS & Route Navigator'}</span>
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-[9.5px] font-black">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                  <span>{isSimulatingDrive ? (language === 'ar' ? 'متصل ومتحرك' : 'Live In Motion') : (language === 'ar' ? 'متوقف / جاهز' : 'Standby / Parked')}</span>
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-semibold mt-0.5">
                {activeTrip 
                  ? (language === 'ar' ? `المسار: ${activeTrip.origin} ➔ ${activeTrip.destination}` : `Route: ${activeTrip.originEn} ➔ ${activeTrip.destinationEn}`)
                  : (language === 'ar' ? 'مسار نقل ثقيل: مستودع الرياض ➔ مشروع نيوم اللوجستي' : 'Heavy Freight: Riyadh Depot ➔ Neom Logistics Site')}
              </p>
            </div>
          </div>

          {/* View Mode, Zoom & Fullscreen Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Zoom Controls */}
            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.2))}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                title={language === 'ar' ? 'تكبير (+)' : 'Zoom In (+)'}
              >
                <ZoomIn size={15} />
              </button>
              <span className="text-[9px] font-mono font-black text-slate-400 px-1">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.8))}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                title={language === 'ar' ? 'تصغير (-)' : 'Zoom Out (-)'}
              >
                <ZoomOut size={15} />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                title={language === 'ar' ? 'إعادة ضبط العرض' : 'Reset Zoom'}
              >
                <Crosshair size={15} />
              </button>
            </div>

            {/* Map Layer Switcher */}
            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => setMapMode('standard')}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                  mapMode === 'standard' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-3xs' : 'text-slate-500'
                }`}
              >
                {language === 'ar' ? 'طرق' : 'Road'}
              </button>
              <button
                onClick={() => setMapMode('satellite')}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                  mapMode === 'satellite' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-3xs' : 'text-slate-500'
                }`}
              >
                {language === 'ar' ? 'قمر صناعي' : 'Satellite'}
              </button>
              <button
                onClick={() => setMapMode('night')}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                  mapMode === 'night' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-3xs' : 'text-slate-500'
                }`}
              >
                {language === 'ar' ? 'ليلي' : 'Night'}
              </button>
            </div>

            {/* Voice Prompt Toggle */}
            <button
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isVoiceEnabled 
                  ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 shadow-3xs' 
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
              title={language === 'ar' ? 'التوجيه الصوتي' : 'Voice Navigation'}
            >
              {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* SOS Emergency Button */}
            <button
              onClick={() => setSosModalOpen(true)}
              className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-2xl text-xs font-black transition-all shadow-md shadow-rose-500/20 flex items-center gap-1.5 cursor-pointer animate-pulse"
            >
              <ShieldAlert size={15} />
              <span>{language === 'ar' ? 'طوارئ SOS' : 'Emergency SOS'}</span>
            </button>

            {/* Fullscreen Expand Button */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="map-fullscreen-trigger px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white rounded-2xl text-xs font-black transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer"
              title={language === 'ar' ? 'تكبير الخريطة لكامل الشاشة' : 'Expand Fullscreen'}
            >
              <Maximize2 size={15} />
              <span>{language === 'ar' ? 'ملء الشاشة ⛶' : 'Fullscreen ⛶'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Map Screen & Canvas Frame */}
      <div 
        onClick={(e) => {
          // If clicked directly on canvas outside buttons and not fullscreen, toggle fullscreen
          if (!isFullscreen) {
            const target = e.target as HTMLElement;
            if (!target.closest('button') && !target.closest('a') && !target.closest('.no-fullscreen-trigger')) {
              setIsFullscreen(true);
            }
          }
        }}
        onMouseEnter={() => setIsHoveringMap(true)}
        onMouseLeave={() => setIsHoveringMap(false)}
        className={`relative overflow-hidden bg-slate-950 select-none transition-all ${
          isFullscreen 
            ? 'w-full h-full flex-1 rounded-none border-none' 
            : 'h-[520px] md:h-[620px] w-full rounded-[2.5rem] border border-purple-500/20 shadow-xl cursor-pointer group'
        }`}
      >
        {/* Click to expand hint overlay when not in fullscreen */}
        {!isFullscreen && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity">
            <span className="px-4 py-2 bg-slate-900/90 backdrop-blur-md text-white border border-purple-500/40 rounded-full text-[11px] font-black flex items-center gap-2 shadow-xl">
              <Maximize2 size={13} className="text-purple-400 animate-pulse" />
              <span>{language === 'ar' ? 'اضغط لتكبير الخريطة على كامل الشاشة 🔍' : 'Click to view Fullscreen 🔍'}</span>
            </span>
          </div>
        )}

        {/* FULLSCREEN EXCLUSIVE FLOATING HEADER BAR & MINIMIZE BUTTON */}
        {isFullscreen && (
          <div className="absolute top-4 inset-x-4 z-40 flex items-center justify-between gap-3 pointer-events-none">
            {/* Left/Start: Dedicated High-Visibility Minimize Button */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreen(false);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 active:scale-95 text-white font-black text-xs md:text-sm rounded-2xl shadow-2xl shadow-rose-950/50 border border-rose-400/40 flex items-center gap-2 cursor-pointer transition-all"
                title={language === 'ar' ? 'تصغير الخريطة والرجوع (ESC)' : 'Exit Fullscreen (ESC)'}
              >
                <Minimize2 size={18} />
                <span>{language === 'ar' ? 'تصغير الشاشة ✕' : 'Minimize (ESC) ✕'}</span>
              </button>

              {/* Speed HUD on Fullscreen Top */}
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-2xl text-white shadow-xl">
                <Gauge size={16} className="text-purple-400" />
                <div>
                  <span className="block text-[8.5px] text-slate-400 font-bold uppercase">{language === 'ar' ? 'السرعة الحالية' : 'Live Speed'}</span>
                  <span className="block text-xs font-black text-emerald-400 font-mono">
                    {currentSpeed} <span className="text-[9px] text-slate-300">KM/H</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right/End: Quick Floating Map Style & Zoom Toggles */}
            <div className="pointer-events-auto flex items-center gap-2">
              {/* Zoom In / Out */}
              <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl flex items-center gap-1 border border-purple-500/30 shadow-xl">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomLevel(prev => Math.min(prev + 0.25, 2.2));
                  }}
                  className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
                  title={language === 'ar' ? 'تكبير (+)' : 'Zoom In (+)'}
                >
                  <ZoomIn size={16} />
                </button>
                <span className="text-[9.5px] font-mono font-black text-purple-300 px-1">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomLevel(prev => Math.max(prev - 0.25, 0.8));
                  }}
                  className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
                  title={language === 'ar' ? 'تصغير (-)' : 'Zoom Out (-)'}
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomLevel(1);
                  }}
                  className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
                  title={language === 'ar' ? 'إعادة ضبط' : 'Reset'}
                >
                  <Crosshair size={16} />
                </button>
              </div>

              {/* Map Layer Switcher in Fullscreen */}
              <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl flex items-center gap-1 border border-purple-500/30 shadow-xl hidden md:flex">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMapMode('standard');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[10.5px] font-black transition-all cursor-pointer ${
                    mapMode === 'standard' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'ar' ? 'طرق' : 'Road'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMapMode('satellite');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[10.5px] font-black transition-all cursor-pointer ${
                    mapMode === 'satellite' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'ar' ? 'قمر صناعي' : 'Satellite'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMapMode('night');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[10.5px] font-black transition-all cursor-pointer ${
                    mapMode === 'night' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'ar' ? 'ليلي' : 'Night'}
                </button>
              </div>

              {/* Emergency SOS in Fullscreen */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSosModalOpen(true);
                }}
                className="px-3.5 py-2.5 bg-rose-500/90 hover:bg-rose-500 text-white rounded-2xl text-xs font-black transition-all shadow-xl flex items-center gap-1 cursor-pointer"
              >
                <ShieldAlert size={15} />
                <span className="hidden sm:inline">{language === 'ar' ? 'طوارئ' : 'SOS'}</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Map Background Layers based on Map Mode (Zoom transform applied) */}
        <div 
          className="absolute inset-0 transition-transform duration-300 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {mapMode === 'standard' && (
            <div className="absolute inset-0 bg-[#e8ece9] dark:bg-[#111927]">
              {/* Grid Lines simulating city grid */}
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px]" />
              {/* Main Road Highway Lines */}
              <div className="absolute top-1/2 left-0 right-0 h-10 bg-amber-100/60 dark:bg-slate-800/80 -rotate-12 transform origin-center border-y border-amber-300/40 dark:border-slate-700/60" />
              <div className="absolute top-1/4 bottom-1/4 left-1/3 w-8 bg-slate-200 dark:bg-slate-850/60 rotate-45 transform origin-center border-x border-slate-300 dark:border-slate-750" />
            </div>
          )}

          {mapMode === 'satellite' && (
            <div className="absolute inset-0 bg-[#192b1a]">
              {/* Terrain Texture */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950 via-[#102414] to-[#0a140d]" />
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>
          )}

          {mapMode === 'night' && (
            <div className="absolute inset-0 bg-[#080d19]">
              {/* High Tech Cyber Highway Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-950/60 via-[#070b14] to-[#04060a]" />
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:28px_28px]" />
            </div>
          )}

          {/* Dynamic Vector Route Line and Checkpoints (SVG Canvas) */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 320" preserveAspectRatio="none">
            <defs>
              {/* Route Gradient in Purple / Indigo / Violet */}
              <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.95" />
              </linearGradient>
              {/* Glow Filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* Planned Road Base Line */}
            <path
              d="M 60 250 Q 200 280 300 160 T 540 65"
              fill="none"
              stroke={mapMode === 'night' ? '#1e293b' : '#cbd5e1'}
              strokeWidth="10"
              strokeLinecap="round"
            />

            {/* Active Navigation Trace Line */}
            <path
              d="M 60 250 Q 200 280 300 160 T 540 65"
              fill="none"
              stroke="url(#routeGlow)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="6 4"
              filter="url(#glow)"
              className="animate-pulse"
            />

            {/* Completed Segment of Route */}
            <path
              d={`M 60 250 Q 200 280 ${truckPos.x} ${truckPos.y}`}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Route Checkpoint Nodes */}
            {routePoints.map((pt, i) => (
              <g key={i} className="cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={pt.reached ? 7 : 5}
                  fill={pt.reached ? '#8b5cf6' : mapMode === 'night' ? '#334155' : '#94a3b8'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                {pt.reached && (
                  <circle cx={pt.x} cy={pt.y} r="12" fill="#8b5cf6" opacity="0.3" className="animate-ping" />
                )}
                {/* Text Tag */}
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  textAnchor="middle"
                  fill={mapMode === 'night' ? '#e2e8f0' : '#1e293b'}
                  fontSize="9"
                  fontWeight="bold"
                  className="select-none drop-shadow-md"
                >
                  {language === 'ar' ? pt.labelAr : pt.labelEn}
                </text>
              </g>
            ))}
          </svg>

          {/* Live Truck Moving Marker (Calculated Coordinates) */}
          <motion.div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ 
              left: `${(truckPos.x / 600) * 100}%`, 
              top: `${(truckPos.y / 320) * 100}%` 
            }}
            animate={{ scale: isSimulatingDrive ? [1, 1.08, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          >
            {/* Radar Waves */}
            <div className="absolute -inset-3 bg-purple-500/30 rounded-full animate-ping" />
            <div className="absolute -inset-1.5 bg-purple-500/40 rounded-full animate-pulse" />
            
            {/* Truck Icon Capsule */}
            <div className="relative w-11 h-11 bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-700 text-white rounded-2xl shadow-2xl flex items-center justify-center border-2 border-purple-300 dark:border-purple-800 transform rotate-12">
              <Truck size={20} className={isSimulatingDrive ? 'animate-bounce' : ''} />
              
              {/* Speed Badge */}
              <span className="absolute -bottom-2 -right-1 px-1.5 py-0.2 bg-slate-900 text-purple-300 font-mono text-[8px] font-black rounded-md border border-purple-500/50 shadow-sm">
                {currentSpeed} <span className="text-[6px]">KM/H</span>
              </span>
            </div>

            {/* Hover / Tooltip on Driver's Truck */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-3 py-1.5 rounded-xl text-[10px] font-black whitespace-nowrap shadow-xl border border-purple-500/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <span>{language === 'ar' ? 'موقعك الحالي - شاحنة تويوتا HD' : 'Current Location - Toyota HD'}</span>
              <span className="block text-[8px] text-purple-300 font-mono">24.7136° N, 46.6753° E</span>
            </div>
          </motion.div>

          {/* Nearby Support Points of Interest (POIs) Markers on Map */}
          {NEARBY_SERVICES.map((poi, idx) => {
            const positions = [
              { top: '35%', left: '22%' },
              { top: '65%', left: '42%' },
              { top: '25%', left: '68%' },
              { top: '75%', left: '78%' }
            ];
            const pos = positions[idx % positions.length];

            return (
              <div
                key={poi.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPOI(poi);
                }}
                style={{ top: pos.top, left: pos.left }}
                className="absolute z-15 -translate-x-1/2 -translate-y-1/2 cursor-pointer group no-fullscreen-trigger"
              >
                <div className={`p-2 rounded-xl text-white shadow-lg border border-white/40 transition-transform group-hover:scale-115 ${
                  poi.type === 'workshop' ? 'bg-amber-600' : poi.type === 'station' ? 'bg-indigo-600' : poi.type === 'rest' ? 'bg-purple-600' : 'bg-violet-600'
                }`}>
                  {poi.type === 'workshop' && <Wrench size={13} />}
                  {poi.type === 'station' && <Fuel size={13} />}
                  {poi.type === 'rest' && <Coffee size={13} />}
                  {poi.type === 'checkpoint' && <CheckCircle2 size={13} />}
                </div>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-slate-900/90 text-white rounded text-[8px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {language === 'ar' ? poi.nameAr : poi.nameEn} ({poi.distKm} km)
                </span>
              </div>
            );
          })}
        </div>

        {/* Top-Right Weather & Road Condition Floating Pill (Only in normal view) */}
        {!isFullscreen && (
          <div className="absolute top-4 right-4 z-20 bg-slate-900/80 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl border border-purple-500/20 flex items-center gap-3 text-xs shadow-lg no-fullscreen-trigger">
            <div className="flex items-center gap-1.5 text-amber-400 font-black">
              <Sun size={15} />
              <span>34°C</span>
            </div>
            <span className="w-1 h-3 bg-white/20 rounded-full" />
            <div className="text-[10px] font-semibold text-slate-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span>{language === 'ar' ? 'الطريق سالك ومفتوح' : 'Highway Clear'}</span>
            </div>
          </div>
        )}

        {/* Turn-by-Turn Instruction Banner (Interactive GPS style) */}
        <div className={`absolute z-20 bg-slate-900/90 backdrop-blur-md text-white p-3 md:p-3.5 rounded-2xl border border-purple-500/30 shadow-2xl space-y-1 no-fullscreen-trigger ${
          isFullscreen ? 'top-20 left-4 right-4 md:right-auto md:max-w-sm' : 'top-4 left-4 max-w-xs md:max-w-sm'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30 shrink-0">
              {currentNav.icon}
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[9px] text-purple-300 font-mono font-black uppercase tracking-wider">
                {language === 'ar' ? `بعد ${currentNav.dist}` : `In ${currentNav.distEn}`}
              </span>
              <p className="text-xs font-black leading-tight mt-0.5 truncate">
                {language === 'ar' ? currentNav.textAr : currentNav.textEn}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Floating Navigation Status Bar */}
        <div className="absolute bottom-4 inset-x-4 z-20 bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-3xl border border-purple-500/25 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 no-fullscreen-trigger">
          
          {/* Progress Metrics */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono font-black text-sm border border-purple-500/30">
                {progressPercent}%
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 font-bold uppercase">{language === 'ar' ? 'إنجاز المسار' : 'Route Completion'}</span>
                <span className="block text-xs font-black text-white">
                  {Math.round((progressPercent / 100) * 142)} / 142 <span className="text-[10px] text-slate-400">KM</span>
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10 hidden sm:block" />

            <div>
              <span className="block text-[9px] text-slate-400 font-bold uppercase">{language === 'ar' ? 'الوقت المتبقي ETA' : 'Estimated Arrival'}</span>
              <span className="block text-xs font-black text-purple-300 font-mono">
                {Math.max(5, Math.round((1 - progressPercent / 100) * 85))} {language === 'ar' ? 'دقيقة' : 'mins'}
              </span>
            </div>

            {/* Quick Speed Meter HUD in Fullscreen */}
            {isFullscreen && (
              <>
                <div className="h-8 w-px bg-white/10 hidden sm:block" />
                <div className="hidden sm:flex items-center gap-2">
                  <Gauge size={16} className="text-purple-400" />
                  <div>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase">{language === 'ar' ? 'السرعة الحالية' : 'Live Speed'}</span>
                    <span className="block text-xs font-black text-emerald-400 font-mono">
                      {currentSpeed} <span className="text-[9px] text-slate-400">KM/H</span>
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Real-time Trip Actions: Start / Pause / Arrived / Deliver */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {!isSimulatingDrive ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartResume();
                }}
                className="flex-1 md:flex-initial px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white rounded-2xl text-xs font-black transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play size={14} />
                <span>{language === 'ar' ? 'مواصلة التحرك' : 'Drive / Resume'}</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePauseBreak();
                }}
                className="flex-1 md:flex-initial px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl text-xs font-black transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Pause size={14} />
                <span>{language === 'ar' ? 'استراحة مؤقتة' : 'Take Break'}</span>
              </button>
            )}

            {progressPercent >= 90 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleArrivedAtDestination();
                }}
                className="flex-1 md:flex-initial px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 active:scale-95 text-white rounded-2xl text-xs font-black transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-1.5 cursor-pointer animate-bounce"
              >
                <CheckCircle2 size={14} />
                <span>{language === 'ar' ? 'وصلت للموقع (تسليم)' : 'Arrived (Handover)'}</span>
              </button>
            )}

            {/* Quick exit fullscreen button on bottom bar if in fullscreen */}
            {isFullscreen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreen(false);
                }}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all cursor-pointer"
                title={language === 'ar' ? 'تصغير الخريطة' : 'Minimize Map'}
              >
                <Minimize2 size={15} />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Selected POI Details Modal / Drawer */}
      <AnimatePresence>
        {selectedPOI && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="p-4 bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl text-white ${
                selectedPOI.type === 'workshop' ? 'bg-amber-500' : selectedPOI.type === 'station' ? 'bg-indigo-600' : 'bg-purple-600'
              }`}>
                {selectedPOI.type === 'workshop' ? <Wrench size={18} /> : selectedPOI.type === 'station' ? <Fuel size={18} /> : <Coffee size={18} />}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? selectedPOI.nameAr : selectedPOI.nameEn}
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {language === 'ar' ? `المسافة عن موقعك: ${selectedPOI.distKm} كم` : `Distance: ${selectedPOI.distKm} km`} • {selectedPOI.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${selectedPOI.phone}`}
                className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl transition-all text-xs font-black flex items-center gap-1 shadow-sm"
              >
                <Phone size={13} />
                <span className="hidden sm:inline">{language === 'ar' ? 'اتصال مباشر' : 'Call'}</span>
              </a>
              <button
                onClick={() => setSelectedPOI(null)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency SOS Distress Modal */}
      <AnimatePresence>
        {sosModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#0f1422] max-w-md w-full rounded-3xl p-6 border-2 border-rose-500/40 shadow-2xl space-y-4 text-right"
              dir={dir}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-500/10 text-rose-600 rounded-2xl animate-pulse">
                  <ShieldAlert size={26} />
                </div>
                <div>
                  <h3 className="text-base font-black text-rose-600">
                    {language === 'ar' ? '🚨 إرسال نداء استغاثة وطوارئ (SOS)' : '🚨 Broadcast Emergency Distress (SOS)'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    {language === 'ar' ? 'يتم إرسال إحداثيات موقعك الحي فوراً لغرفة العمليات المركزية' : 'Transmits your live GPS coordinates directly to Fleet Command'}
                  </p>
                </div>
              </div>

              {sosDispatched ? (
                <div className="py-6 text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {language === 'ar' ? 'تم استلام نداء الاستغاثة بنجاح!' : 'Distress Beacon Received!'}
                  </h4>
                  <p className="text-xs text-slate-400 font-semibold">
                    {language === 'ar' ? 'فريق الدعم الميداني والونش في طريقه إليك الآن.' : 'Support team & roadside assistance dispatched to your coordinates.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-200/50 dark:border-rose-900/30 text-[11px] text-rose-800 dark:text-rose-300 font-semibold">
                    📍 {language === 'ar' ? 'الإحداثيات الحالية: طريق الرياض السريع (كيلو 42) - Lat: 24.7136, Lng: 46.6753' : 'Current GPS: Highway KM 42 (24.7136, 46.6753)'}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                      {language === 'ar' ? 'نوع الطارئ أو العطل الميداني:' : 'Emergency / Breakdown Reason:'}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'accident', ar: 'حادث مروري', en: 'Accident' },
                        { id: 'engine_stop', ar: 'توقف مفاجئ للمحرك', en: 'Engine Stalled' },
                        { id: 'tire_burst', ar: 'انفجار إطار مفاجئ', en: 'Tire Blowout' },
                        { id: 'medical', ar: 'حالة صحية طارئة', en: 'Medical Need' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSosReason(language === 'ar' ? item.ar : item.en)}
                          className={`p-2 rounded-xl text-[10.5px] font-bold border transition-all cursor-pointer ${
                            sosReason === (language === 'ar' ? item.ar : item.en)
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          {language === 'ar' ? item.ar : item.en}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleDispatchSOS}
                      className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-rose-600/20 cursor-pointer"
                    >
                      {language === 'ar' ? 'إرسال البلاغ فوراً' : 'Broadcast SOS Now'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSosModalOpen(false)}
                      className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs rounded-2xl hover:bg-slate-200 cursor-pointer"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cargo Handover & Delivery Confirmation Modal */}
      <AnimatePresence>
        {showDeliveryModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#0f1422] max-w-md w-full rounded-3xl p-6 border border-purple-500/40 shadow-2xl space-y-4 text-right"
              dir={dir}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {language === 'ar' ? '📦 إثبات تسليم الشحنة والمهمة' : '📦 Proof of Cargo Delivery'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    {language === 'ar' ? 'سجل بيانات مستلم الشحنة في الموقع لإتمام الرحلة رسمياً' : 'Record recipient details to finalize this freight mission'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleConfirmDelivery} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    {language === 'ar' ? 'اسم المستلم في الموقع / المهندس المسؤول:' : 'Recipient / Site Engineer Name:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryRecipient}
                    onChange={(e) => setDeliveryRecipient(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: م. فهد الشمري (مشرف الاستلام)' : 'e.g. Eng. Fahad Al-Shammari'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                    {language === 'ar' ? 'ملاحظات التسليم والحمولة:' : 'Delivery & Cargo Notes:'}
                  </label>
                  <textarea
                    rows={2}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder={language === 'ar' ? 'تم تفريغ الحمولة سليمة دون أي أضرار...' : 'Cargo unloaded safely without damage...'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-purple-600/25 cursor-pointer"
                  >
                    {language === 'ar' ? 'تأكيد التسليم وإنهاء الرحلة ✅' : 'Confirm Delivery & Complete ✅'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeliveryModal(false)}
                    className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs rounded-2xl hover:bg-slate-200 cursor-pointer"
                  >
                    {language === 'ar' ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
