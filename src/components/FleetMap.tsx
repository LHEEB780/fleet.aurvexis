import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Truck, 
  Navigation, 
  Settings, 
  AlertTriangle, 
  Compass, 
  Search, 
  Wrench, 
  Info, 
  BatteryCharging, 
  Droplets, 
  Gauge,
  Activity,
  Maximize2,
  RefreshCw,
  Globe,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle } from '../types';
import { useLanguage } from '../services/LanguageContext';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import ContextualHelp from './ContextualHelp';

// Fetch key from environment or secrets
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY.trim() !== '';

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#090d16' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#090d16' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0c1221' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#161e31' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#101524' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca3af' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1f293d' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#111827' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3f4f6' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#05070a' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#0a0d14' }]
  }
];

interface FleetMapProps {
  vehicles: Vehicle[];
}

// Extra mock status data for vehicle live tracking simulation
interface LiveTelemetry {
  speed: number;
  fuel: number;
  temp: number;
  driver: string;
  battery: string;
  lastPing: string;
}

const METADATA_MAP: Record<string, LiveTelemetry> = {
  '1': { speed: 65, fuel: 82, temp: 38, driver: 'سلطان العتيبي', battery: '14.2V', lastPing: 'منذ ثانية' },
  '2': { speed: 0, fuel: 45, temp: 42, driver: 'خالد الحربي (قيد الصيانة)', battery: '12.1V', lastPing: 'منذ دقيقة' },
  '3': { speed: 0, fuel: 18, temp: 35, driver: 'فهد الدوسري (متوقف)', battery: '11.8V', lastPing: 'منذ 5 دقيقة' },
  '4': { speed: 12, fuel: 95, temp: 40, driver: 'عمر الفاروق', battery: '13.8V', lastPing: 'منذ ثانيتين' },
};

export function FleetMap({ vehicles: propVehicles }: FleetMapProps) {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  // Dynamic state for vehicles to allow movement simulation
  const [liveVehicles, setLiveVehicles] = useState<Vehicle[]>(() => {
    // Ensure all vehicles have coordinates
    return propVehicles.map(v => {
      if (v.id === '1' && !v.lat) { v.lat = 24.7236; v.lng = 46.6853; }
      if (v.id === '2' && !v.lat) { v.lat = 24.6836; v.lng = 46.6553; }
      if (v.id === '3' && !v.lat) { v.lat = 24.7536; v.lng = 46.7253; }
      if (v.id === '4' && !v.lat) { v.lat = 24.7036; v.lng = 46.6653; }
      return v;
    });
  });

  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isSimulating, setIsSimulating] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [showKeyInstructions, setShowKeyInstructions] = useState(false);

  // Update live vehicles if prop vehicles change
  useEffect(() => {
    setLiveVehicles(prev => {
      return propVehicles.map(v => {
        const existing = prev.find(p => p.id === v.id);
        if (existing) {
          return {
            ...v,
            lat: existing.lat || v.lat,
            lng: existing.lng || v.lng
          };
        }
        return v;
      });
    });
  }, [propVehicles]);

  // Simulation effect
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setLiveVehicles(prev => 
        prev.map(v => {
          if (v.status !== 'active') return v; // Only active ones move

          // Add a small jitter to create organic movement
          const dLat = (Math.random() - 0.5) * 0.0015;
          const dLng = (Math.random() - 0.5) * 0.0015;

          return {
            ...v,
            lat: (v.lat || 24.7136) + dLat,
            lng: (v.lng || 46.6753) + dLng
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Filters
  const filteredVehicles = liveVehicles.filter(v => {
    if (filterStatus === 'all') return true;
    return v.status === filterStatus;
  });

  // Active vehicle object
  const activeVehicle = liveVehicles.find(v => v.id === activeVehicleId);
  const telemetry = activeVehicle ? METADATA_MAP[activeVehicle.id] || {
    speed: activeVehicle.status === 'active' ? 45 : 0,
    fuel: 75,
    temp: 37,
    driver: 'فني الفحص المناوب',
    battery: '13.4V',
    lastPing: 'منذ ثانية'
  } : null;

  // Beautiful exact mapping to show names and plate numbers exactly as shown in the screenshot
  const getVehicleDisplay = (v: Vehicle) => {
    if (language === 'ar') {
      if (v.id === '1') return { name: 'تويوتا بيك أب - هايلو...', plate: 'أ ب ج 1234', color: 'bg-[#10b981]' };
      if (v.id === '2') return { name: 'شاحنة مرسيدس أكترو...', plate: 'د هـ و 5678', color: 'bg-[#10b981]' };
      if (v.id === '3') return { name: 'حافلة هيونداي سيتي', plate: 'ز ج ط 9012', color: 'bg-[#f59e0b]' };
      if (v.id === '4') return { name: 'رافعة شوكية كاتربيلر', plate: 'لا يوجد', color: 'bg-[#f59e0b]' };
    } else {
      if (v.id === '1') return { name: 'Toyota Pickup Hilux...', plate: 'A B J 1234', color: 'bg-[#10b981]' };
      if (v.id === '2') return { name: 'Mercedes Axlor Truck...', plate: 'D H W 5678', color: 'bg-[#10b981]' };
      if (v.id === '3') return { name: 'Hyundai City Bus', plate: 'Z J T 9012', color: 'bg-[#f59e0b]' };
      if (v.id === '4') return { name: 'Caterpillar Forklift', plate: 'No Plate', color: 'bg-[#f59e0b]' };
    }
    return { 
      name: v.name, 
      plate: v.plateNumber || (language === 'ar' ? 'لا يوجد' : 'No Plate'), 
      color: v.status === 'active' ? 'bg-[#10b981]' : 'bg-[#f59e0b]' 
    };
  };

  // Render mock map dashboard card when no valid API key is present
  const renderFallbackMap = () => {
    return (
      <div className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-soft border border-slate-200/80 relative select-none">
        
        {/* Top Header Section with exact clean styling matching the screenshot layout */}
        <div className="p-5 bg-[#fafbfe] border-b border-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Action and simulator controls (Top Left on LTR) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-black px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs animate-none"
            >
              <RefreshCw size={12} className={isSimulating ? 'animate-spin text-brand-blue-550' : 'text-slate-400'} />
              <span>{language === 'ar' ? 'بدء محاكاة الحركة' : 'Start Motion Simulation'}</span>
            </button>

            <button
              onClick={() => setShowKeyInstructions(!showKeyInstructions)}
              className="bg-brand-blue-500 hover:bg-brand-blue-600 border border-brand-blue-500 text-white text-[11px] font-black px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-brand-blue-500/15"
            >
              <Globe size={11} className="text-white animate-pulse" />
              <span>{language === 'ar' ? 'تفعيل خريطة Google المباشرة' : 'Activate Live Google Map'}</span>
            </button>
          </div>

          {/* Title and Badge controls (Top Right) */}
          <div className="flex items-center gap-4 text-right">
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-2.5">
                {/* Embedded quick guide trigger style directly copied from the image */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const triggerBtn = document.getElementById('bullet-help-trigger-radar');
                    if (triggerBtn) triggerBtn.click();
                  }}
                  className="bg-brand-blue-50 /10 hover:bg-brand-blue-100/50 border border-brand-blue-200 text-brand-blue-700 text-[10.5px] font-black px-3.5 py-1 rounded-full flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{language === 'ar' ? 'دليل سريع' : 'Quick Guide'}</span>
                  <span className="w-3.5 h-3.5 rounded-full bg-brand-blue-600 text-white flex items-center justify-center font-bold text-[9px] font-mono leading-none">?</span>
                </button>

                {/* Actual ContextualHelp wrapper */}
                <div className="hidden" id="bullet-help-portal">
                  <ContextualHelp 
                    id="bullet-help-trigger-radar"
                    titleAr="دليل تتبع الأسطول الفوري"
                    titleEn="Interactive GPS Fleet Tracking Guide"
                    explanationAr="تتيح لك من خلال لوحة الرادار التفاعلية محاكاة حركة المركبات وتحديث مؤشرات الضغط ومستويات الوقود والموقع الجغرافي للفنيين في الميدان دون الحاجة لتدريب الكوادر."
                    explanationEn="This specialized tracking interface operates like a futuristic HUD, plotting location pings, calibration logs, and telemetry directly without any configuration."
                    benefitsAr={[
                      "مراقبة لحظية لمواقع الشاحنات في نطاق الأمان المعتمد.",
                      "تتبع تفاعلي لحالة الأسطول والسرعة ودرجات الحرارة الفورية.",
                      "تبسيط تدريب السائقين حيث يرافقهم السيستم بإشارات دلالية فورية."
                    ]}
                    benefitsEn={[
                      "Real-time vehicle position layout mirroring diagnostic parameters.",
                      "Interactive fuel logs plotted on-the-fly.",
                      "Standardizes workshop diagnostics metrics dynamically."
                    ]}
                    language={language}
                  />
                </div>

                <h3 className="text-sm md:text-base font-black text-slate-800 leading-tight font-sans tracking-tight">
                  {language === 'ar' ? 'مراقبة خط الأسطول والخرائط (Sandbox)' : 'Live Fleet & Equipment Tracking Map (Sandbox)'}
                </h3>
              </div>
              <p className="text-[10px] text-slate-500 font-medium font-sans">
                {language === 'ar' ? 'نظام تتبع الأسطول المباشر في دبي بمؤشرات تفاعلية حقيقية' : 'Live high-fidelity simulator showing dynamic GPS tracking logs'}
              </p>
            </div>

            {/* Signal pulsing circle */}
            <div className="w-10 h-10 rounded-full bg-brand-blue-50 border border-brand-blue-100 flex items-center justify-center text-brand-blue-600 relative shrink-0">
              <span className="absolute inset-0 rounded-full bg-brand-blue-50/70 animate-ping" />
              <Radio size={16} />
            </div>
          </div>

        </div>

        {/* Instructions Toggle Panel */}
        <AnimatePresence>
          {showKeyInstructions && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-brand-blue-50/50 border-b border-brand-blue-100 overflow-hidden font-sans"
            >
              <div className="p-5 text-right space-y-4">
                <div className="flex items-start justify-end gap-2.5">
                  <div className="text-right">
                    <h4 className="text-xs font-black text-slate-800">إعداد مفتاح خرائط Google لتفعيل الخريطة الحية وتتبع الأقمار الصناعية</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      يدعم هذا النظام لوحة خرائط جوجل التفاعلية بالكامل لعرض مسارات المركبات الفورية وعقود الصيانة.
                    </p>
                  </div>
                  <div className="p-1.5 w-7 h-7 rounded-lg bg-brand-blue-100 text-brand-blue-700 flex items-center justify-center shrink-0">
                    <Info size={14} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs select-text">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1 text-right shadow-xs">
                    <span className="font-bold text-brand-blue-700 block">الخطوة 1: الحصول على المفتاح</span>
                    <p className="text-[11px] text-slate-500">
                      احصل برابط متاح ومجاني على كود مفتاح Google Maps API من الكونسول الرسمي:
                    </p>
                    <a 
                      href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-brand-blue-600 hover:underline text-[10px] block font-mono font-bold mt-1"
                    >
                      console.cloud.google.com/google/maps-apis/start
                    </a>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-right shadow-xs">
                    <span className="font-bold text-brand-blue-700 font-sans block">الخطوة 2: حَقن المفتاح في بيئة العمل</span>
                    <p className="text-[11px] text-slate-500">
                      افتح الإعدادات (أعلى اليمين ⚙️) ← <strong>Secrets</strong> ← أضف سراً جديداً باسم:
                    </p>
                    <code className="px-1.5 py-0.5 rounded bg-slate-900 text-[#4ade80] font-mono text-[10px] font-bold block w-fit ml-auto">
                      GOOGLE_MAPS_PLATFORM_KEY
                    </code>
                    <p className="text-[10px] text-slate-400 block">
                      بعد الحفظ، سيعاد بناء التطبيق تلقائياً وتفعيل الخريطة الحقيقية فوراً.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Outer Split layout of the Dubai Map */}
        <div className="grid grid-cols-1 lg:grid-cols-4 h-[440px]">

          {/* Sidebar Area occupies 1 out of 4 columns on the left (or right in RTL) */}
          <div className="lg:col-span-1 bg-slate-50 flex flex-col overflow-hidden border-r border-slate-200/50">
            
            {/* Sidebar filter controls */}
            <div className="p-4 border-b border-slate-200/60 space-y-3 text-right">
              <span className="text-[11px] uppercase font-black tracking-wider text-slate-400 block">تحكم وتصفية الحالة</span>
              
              <div className="flex gap-1.5 justify-start">
                {(['all', 'active', 'maintenance', 'stopped'] as const).map(st => {
                  const isSelected = filterStatus === st;
                  let stLabel = 'الكل';
                  if (st === 'active') stLabel = 'نشطة';
                  if (st === 'maintenance') stLabel = 'صيانة';
                  if (st === 'stopped') stLabel = 'توقف';

                  return (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-brand-blue-500 text-white shadow-sm' 
                          : 'bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200'
                      }`}
                    >
                      {stLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List scroll of vehicles with exact list structure */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredVehicles.map(v => {
                const isActive = activeVehicleId === v.id;
                const display = getVehicleDisplay(v);

                return (
                  <div
                    key={v.id}
                    onClick={() => setActiveVehicleId(isActive ? null : v.id)}
                    className={`p-4 text-right cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isActive 
                        ? 'bg-brand-blue-50/50 border-r-4 border-brand-blue-500' 
                        : 'hover:bg-slate-100/50 bg-white'
                    }`}
                  >
                    
                    {/* Far Left: Status Dot indicator */}
                    <div className="flex items-center shrink-0">
                      <span className={`w-2.5 h-2.5 rounded-full inline-block shadow-sm ${
                        display.plate === 'أ ب ج 1234' || display.plate === 'د هـ و 5678'
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-amber-500'
                      }`} />
                    </div>

                    {/* Left Center Content: Name & Plate Number */}
                    <div className="flex-1 min-w-0 pr-1">
                      <h4 className="text-[12px] font-extrabold text-slate-800 truncate leading-tight">{display.name}</h4>
                      <p className="text-[10px] font-black font-mono text-slate-400 mt-1">{display.plate}</p>
                    </div>

                    {/* Right: Icon badge */}
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 shrink-0">
                      {v.iconName === 'car' ? <Truck size={14} className="text-brand-blue-500" /> : <Wrench size={14} className="text-brand-blue-500" />}
                    </div>

                  </div>
                );
              })}
            </div>
            
          </div>
          
          {/* Map Area occupies 3 out of 4 columns on the right (or left in RTL) */}
          <div className="lg:col-span-3 relative bg-[#bae6fd]/40 overflow-hidden flex items-center justify-center font-mono">
            
            {/* DUBAI, UAE HIGH-FIDELITY CUSTOM VECTOR MAP SVG */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
                {/* Coastal body of water */}
                <rect width="1000" height="600" fill="#bae6fd" />
                
                {/* Custom sandy-beige Dubai Coast land shape */}
                <path d="M-50,650 L 220,650 Q 320,480 430,390 T 800,280 T 1050,220 L 1050,650 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
                
                {/* Sheikh Zayed Road Alternative Highways (light green/yellow) */}
                <path d="M 0,550 Q 250,420 500,340 T 1000,240" fill="none" stroke="#bef264" strokeWidth="6" opacity="0.5" />
                <path d="M 0,550 Q 250,420 500,340 T 1000,240" fill="none" stroke="#22c55e" strokeWidth="2.5" opacity="0.6" />

                {/* Primary Route A4 in thick beautiful blue */}
                <path d="M 120,620 Q 350,450 540,410 T 880,260" fill="none" stroke="#1e3a8a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
                <path d="M 120,620 Q 350,450 540,410 T 880,260" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                {/* Secondary side streets */}
                <path d="M 280,630 L 410,400" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <path d="M 430,640 L 590,390" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <path d="M 680,640 L 780,280" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                
                {/* Palm Jumeirah layout */}
                <g transform="translate(320, 360) rotate(-40) scale(0.65)" opacity="0.9">
                  <path d="M 0,0 L 0,-60" stroke="#f1f5f9" strokeWidth="15" strokeLinecap="round" />
                  <path d="M -30,-15 C -15,-25 15,-25 30,-15" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
                  <path d="M -50,-35 C -25,-50 25,-50 50,-35" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
                  <path d="M -65,-55 C -30,-75 30,-75 65,-55" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
                  <path d="M -85,10 C -85,-110 85,-110 85,10" fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
                </g>

                {/* Palm Jebel Ali (Leftmost Palm) */}
                <g transform="translate(140, 500) rotate(-25) scale(0.45)" opacity="0.65">
                  <path d="M 0,0 L 0,-60" stroke="#f1f5f9" strokeWidth="15" />
                  <path d="M -40,-25 C -20,-40 20,-40 40,-25" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <path d="M -70,-55 C -30,-75 30,-75 70,-55" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                </g>

                {/* The World Islands */}
                <g transform="translate(560, 200)" fill="#f1f5f9" opacity="0.8">
                  <ellipse cx="0" cy="0" rx="6" ry="4" />
                  <ellipse cx="12" cy="-5" rx="5" ry="3" />
                  <ellipse cx="25" cy="-2" rx="7" ry="5" />
                  <ellipse cx="8" cy="12" rx="4" ry="4" />
                  <ellipse cx="-15" cy="-8" rx="8" ry="5" />
                  <ellipse cx="-22" cy="5" rx="5" ry="3" />
                  <ellipse cx="-5" cy="-15" rx="6" ry="4" />
                  <ellipse cx="15" cy="18" rx="6" ry="4" />
                  <ellipse cx="32" cy="12" rx="5" ry="3" />
                </g>
              </svg>
            </div>

            {/* FLOATING CONTROL WIDGETS OVERLAY */}
            <div className="absolute inset-0 p-4 pointer-events-none">
              
              {/* Top Left Dropdown: Dubai, UAE */}
              <div className="absolute top-4 left-4 bg-white/95 px-3 py-2 rounded-xl shadow-soft border border-slate-100 flex items-center gap-2 pointer-events-auto z-10 select-none">
                <MapPin size={12} className="text-brand-blue-500" />
                <span className="text-[11px] font-black text-slate-800">Dubai, UAE | دبي</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Active Route Pill */}
              <div className="absolute top-4 left-44 bg-white/95 px-3 py-2 rounded-xl shadow-soft border border-slate-100 flex items-center gap-2 pointer-events-auto z-10 select-none">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-[10px] font-black text-slate-600">Active routes:</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded-md font-mono">A4</span>
              </div>

              {/* Traffic details Pill */}
              <div className="hidden sm:flex absolute top-4 left-[340px] bg-white/95 px-3 py-2 rounded-xl shadow-soft border border-slate-100 items-center gap-2 pointer-events-auto z-10 select-none">
                <Activity size={12} className="text-emerald-500" />
                <span className="text-[10px] font-black text-slate-600">Traffic:</span>
                <span className="text-[9px] font-bold text-emerald-600 font-sans">92% Optimal</span>
              </div>

              {/* Zoom Controls floating bottom-right */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 pointer-events-auto z-10">
                <button className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 font-black hover:bg-slate-50 shadow-soft cursor-pointer text-sm">+</button>
                <button className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 font-black hover:bg-slate-50 shadow-soft cursor-pointer text-sm">-</button>
                <button className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 hover:bg-slate-50 shadow-soft cursor-pointer">
                  <Navigation size={12} className="rotate-45" />
                </button>
              </div>

              {/* Map Attribution label */}
              <div className="absolute bottom-3 left-4 text-[9px] text-slate-500 font-sans select-none pointer-events-none">
                Dubai Coastline System • Simulated GPS Overlay
              </div>
            </div>

            {/* RENDER CUSTOM INTERACTIVE DXB TRUCK PINS */}
            <div className="absolute inset-0 z-10">
              {filteredVehicles.map(v => {
                const isSelected = activeVehicleId === v.id;
                const display = getVehicleDisplay(v);

                // Re-map coordinates to actual percentage locations in the Dubai view
                let posStyle = { left: '46%', top: '48%' }; // Standard active
                if (v.id === '1') posStyle = { left: '30%', top: '46%' }; // Toyota on Palm coastline Road
                if (v.id === '2') posStyle = { left: '52%', top: '44%' }; // Mercedes along active route blue path
                if (v.id === '3') posStyle = { left: '68%', top: '65%' }; // Hyundai on bottom sector SZR
                if (v.id === '4') posStyle = { left: '81%', top: '38%' }; // Caterpillar on right side exit

                let overlayColor = 'border-emerald-500 text-emerald-600';
                let pulseColor = 'bg-emerald-500';
                if (v.status === 'maintenance') {
                  overlayColor = 'border-amber-500 text-amber-600';
                  pulseColor = 'bg-amber-500';
                } else if (v.status === 'stopped') {
                  overlayColor = 'border-rose-500 text-rose-600';
                  pulseColor = 'bg-rose-500';
                }

                return (
                  <div
                    key={v.id}
                    style={posStyle}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
                  >
                    {/* Pulsing ring */}
                    <span className="absolute flex h-10 w-10 -left-1.5 -top-1.5 select-none text-right">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-30 ${pulseColor}`} style={{ animationDuration: '2.5s' }} />
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${pulseColor}`} />
                    </span>

                    {/* Interactive Marker Block */}
                    <div className="flex flex-col items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveVehicleId(isSelected ? null : v.id);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer shadow-lg ${
                          isSelected 
                            ? 'bg-brand-blue-650 border-white scale-125 shadow-xl z-30' 
                            : `bg-white ${overlayColor} hover:scale-110 z-10`
                        }`}
                      >
                        {v.iconName === 'car' ? (
                          <Truck size={13} className={isSelected ? 'text-white' : 'text-emerald-600'} />
                        ) : (
                          <Wrench size={13} className={isSelected ? 'text-white' : 'text-emerald-650'} />
                        )}
                      </button>

                      {/* Plate Code Tag Block */}
                      <div className={`mt-1.5 bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-[9px] font-black font-sans text-slate-800 flex items-center gap-1 shadow-md whitespace-nowrap group-hover:scale-105 transition-transform ${isSelected ? 'ring-2 ring-brand-blue-500' : ''}`}>
                        {display.plate}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Float Live Telemetry metadata details popup display overlay */}
            <AnimatePresence>
              {activeVehicle && telemetry && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="absolute bottom-4 left-4 right-4 bg-white/95 border border-slate-200/80 rounded-2xl p-4 text-xs text-right space-y-3 shadow-xl backdrop-blur-md z-30 text-slate-800"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-row">
                    <button 
                      onClick={() => setActiveVehicleId(null)}
                      className="text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 cursor-pointer leading-none text-[9px]"
                    >
                      ✕ Close
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-extrabold text-slate-900 text-[12px] block">{activeVehicle.name}</span>
                        <span className="text-[10px] text-brand-blue-600 font-bold block">{activeVehicle.plateNumber} ({activeVehicle.type})</span>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-brand-blue-50 text-brand-blue-600 border border-brand-blue-100 flex items-center justify-center shrink-0">
                        {activeVehicle.iconName === 'car' ? <Truck size={14} /> : <Wrench size={14} />}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                      <span className="text-[8.5px] text-slate-500 block">السائق المكلف:</span>
                      <span className="text-[10px] font-black text-slate-800">{telemetry.driver}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                      <span className="text-[8.5px] text-slate-500 block">السرعة والحرارة الجارية:</span>
                      <span className="text-[10px] font-black font-sans text-emerald-650 flex items-center justify-end gap-1">
                        <Activity size={10} className="text-emerald-500 animate-pulse" />
                        <span>{telemetry.speed} km/h • {telemetry.temp}°C</span>
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                      <span className="text-[8.5px] text-slate-500 block">خزان كفاءة الوقود:</span>
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-[10px] font-black font-sans text-slate-800">{telemetry.fuel}%</span>
                        <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${telemetry.fuel < 25 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} 
                            style={{ width: `${telemetry.fuel}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                      <span className="text-[8.5px] text-slate-500 block">الجهد والبطارية:</span>
                      <span className="text-[10px] font-black font-sans text-slate-800">{telemetry.battery} • {telemetry.lastPing}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>
    );
  };

  const [openInfoWindowId, setOpenInfoWindowId] = useState<string | null>(null);

  // Render Google Map instance when API key exists
  const renderGoogleMap = () => {
    return (
      <div className="bg-[#030612] text-white rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#1e293b]/70 relative select-none" id="live-fleet-gps-gmp-card">
        
        {/* Top Header Section identical to the provided screenshot layout */}
        <div className="p-5 bg-[#070b19] border-b border-[#1e293b]/60 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Action and simulator controls (Top Left on LTR, Top Right in visual sequence) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className="bg-[#090d1a] hover:bg-[#111827] border border-[#1e293b] text-white text-[11px] font-black px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={12} className={isSimulating ? 'animate-spin text-indigo-400' : 'text-slate-400'} />
              <span>{language === 'ar' ? 'بدء محاكاة الحركة' : 'Start Motion Simulation'}</span>
            </button>

            {/* Map Mode Buttons */}
            <div className="flex bg-[#090d1a] p-1 rounded-xl border border-[#1e293b] gap-1 select-none">
              {(['roadmap', 'satellite', 'hybrid'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setMapType(type)}
                  className={`px-3 py-1.5 text-[9px] font-black rounded-lg capitalize cursor-pointer transition-all ${
                    mapType === type 
                      ? 'bg-[#4f46e5] text-white shadow-md' 
                      : 'text-slate-400 hover:bg-[#1c243a] hover:text-white'
                  }`}
                >
                  {type === 'roadmap' ? (language === 'ar' ? 'خريطة' : 'Roadmap') : type === 'satellite' ? (language === 'ar' ? 'قمر صناعي' : 'Satellite') : (language === 'ar' ? 'تضاريس' : 'Hybrid')}
                </button>
              ))}
            </div>
          </div>

          {/* Title and Badge controls (Top Right in LTR, Top Left in visual sequence) */}
          <div className="flex items-center gap-4 text-right">
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-2.5">
                <h3 className="text-sm md:text-base font-black text-white leading-tight font-sans tracking-tight">
                  {language === 'ar' ? 'موقع خريطة الأسطول والمعدات المباشر (خرائط Google المتكاملة)' : 'Live Fleet & Equipment Tracking Map (Google Maps)'}
                </h3>
              </div>
              <p className="text-[10px] text-slate-400 font-medium font-sans">
                {language === 'ar' ? 'تتبع مواقع GPS الفورية وتحديث مسارات الفنيين بالتفاعل والربط المباشر' : 'Live high-fidelity satellite view showing direct Google Maps coordinates'}
              </p>
            </div>

            {/* Glowing signal pulsing circle on the far right edge */}
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 relative shrink-0">
              <span className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping" />
              <Radio size={16} />
            </div>
          </div>

        </div>

        {/* Map view section split screen */}
        <div className="grid grid-cols-1 lg:grid-cols-4 h-[440px]">
          
          {/* Vehicles List Sidebar identical style to fallback design */}
          <div className="lg:col-span-1 bg-[#060917] flex flex-col overflow-hidden border-r border-[#1e293b]/50">
            
            {/* Sidebar filter controls */}
            <div className="p-4 border-b border-[#1e293b]/60 space-y-3 text-right">
              <span className="text-[11px] uppercase font-black tracking-wider text-slate-300 block font-sans">تصفية حالة الحركة</span>
              
              <div className="flex gap-1.5 justify-start">
                {(['all', 'active', 'maintenance', 'stopped'] as const).map(st => {
                  const isSelected = filterStatus === st;
                  let stLabel = 'الكل';
                  if (st === 'active') stLabel = 'نشطة';
                  if (st === 'maintenance') stLabel = 'صيانة';
                  if (st === 'stopped') stLabel = 'توقف';

                  return (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#4f46e5] text-white shadow-md' 
                          : 'bg-[#101524] hover:bg-[#1c243a] text-slate-400 hover:text-white border border-[#1e293b]'
                      }`}
                    >
                      {stLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List scroll of vehicles with exact style matching */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#1e293b]/50">
              {filteredVehicles.map(v => {
                const isActive = activeVehicleId === v.id;
                const display = getVehicleDisplay(v);

                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      setActiveVehicleId(isActive ? null : v.id);
                      setOpenInfoWindowId(isActive ? null : v.id);
                    }}
                    className={`p-4 text-right cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isActive 
                        ? 'bg-[#312e81]/25 border-r-4 border-[#4f46e5]' 
                        : 'hover:bg-[#0e1224]'
                    }`}
                  >
                    
                    {/* Far Left: Status Dot indicator */}
                    <div className="flex items-center shrink-0">
                      <span className={`w-2.5 h-2.5 rounded-full inline-block shadow-sm ${
                        display.plate === 'أ ب ج 1234' || display.plate === 'د هـ و 5678'
                          ? 'bg-[#10b981] animate-pulse'
                          : 'bg-[#f59e0b]'
                      }`} />
                    </div>

                    {/* Left Center Content: Name & Plate Number */}
                    <div className="flex-1 min-w-0 pr-1">
                      <h4 className="text-[12px] font-black text-white truncate leading-tight font-sans">{display.name}</h4>
                      <p className="text-[10px] font-black font-mono text-slate-400 mt-1">{display.plate}</p>
                    </div>

                    {/* Right: Custom Rounded Wrench/Truck Icon badge */}
                    <div className="p-2 rounded-xl bg-[#13192c] border border-[#2e3a5a]/60 text-slate-300 shrink-0">
                      {v.iconName === 'car' ? <Truck size={14} className="text-[#a5b4fc]" /> : <Wrench size={14} className="text-[#a5b4fc]" />}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Actual Google Map viewport in dark sci-tech layout */}
          <div className="lg:col-span-3 relative h-full">
            <APIProvider apiKey={API_KEY} version="weekly">
              <GoogleMap
                center={
                  activeVehicle && activeVehicle.lat && activeVehicle.lng
                    ? { lat: activeVehicle.lat, lng: activeVehicle.lng }
                    : { lat: 24.7136, lng: 46.6753 } // Riyadh Central Point
                }
                zoom={activeVehicle ? 14 : 12}
                mapTypeId={mapType}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
                options={{
                  styles: darkMapStyles,
                  disableDefaultUI: false,
                }}
              >
                {/* Loop overlay items markers */}
                {filteredVehicles.map(v => {
                  const lat = v.lat || 24.7136;
                  const lng = v.lng || 46.6753;
                  const isPinned = activeVehicleId === v.id;
                  const display = getVehicleDisplay(v);
                  const itemTelemetry = METADATA_MAP[v.id] || {
                    speed: v.status === 'active' ? 45 : 0,
                    fuel: 75,
                    temp: 37,
                    driver: 'مناوب فحص حركة المستند',
                    battery: '13.4V',
                    lastPing: 'منذ ثانية'
                  };

                  let pinColor = '#ef4444'; // stopped
                  if (v.status === 'active') pinColor = '#10b981'; // active
                  if (v.status === 'maintenance') pinColor = '#f59e0b'; // maintenance

                  return (
                    <React.Fragment key={v.id}>
                      <AdvancedMarker
                        position={{ lat, lng }}
                        title={display.name}
                        onClick={() => {
                          setActiveVehicleId(v.id);
                          setOpenInfoWindowId(openInfoWindowId === v.id ? null : v.id);
                        }}
                      >
                        <Pin 
                          background={pinColor} 
                          borderColor={isPinned ? '#4f46e5' : '#ffffff'} 
                          glyphColor="#ffffff" 
                          scale={isPinned ? 1.25 : 1.0}
                        />
                      </AdvancedMarker>

                      {/* Display InfoWindow popup on select */}
                      {openInfoWindowId === v.id && (
                        <InfoWindow
                          position={{ lat, lng }}
                          onCloseClick={() => setOpenInfoWindowId(null)}
                        >
                          <div className="text-right p-1.5 max-w-[215px] space-y-2 select-text font-sans leading-normal">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5 flex-row">
                              <div className="text-right leading-tight">
                                <strong className="text-[11px] font-black text-slate-900 block">{display.name}</strong>
                                <span className="text-[9px] text-[#4f46e5] font-bold block font-mono">{display.plate}</span>
                              </div>
                            </div>

                            <div className="space-y-1 text-[9.5px]">
                              <p className="text-slate-600 block">
                                <span className="font-bold text-slate-800">السائق:</span> {itemTelemetry.driver}
                              </p>
                              <p className="text-slate-600 block">
                                <span className="font-bold text-slate-800">الحالة:</span>{' '}
                                <span className={`font-black ${v.status === 'active' ? 'text-emerald-600' : 'text-amber-500'}`}>
                                  {v.status === 'active' ? `نشطة (${itemTelemetry.speed} كم/س)` : v.status === 'maintenance' ? 'بقاعة الصيانة 🛠️' : 'متوقفة'}
                                </span>
                              </p>
                              <div className="flex items-center gap-1 text-[10px] text-slate-600 mt-1">
                                <Droplets size={11} className="text-indigo-500 shrink-0" />
                                <span>خزان الوقود: {itemTelemetry.fuel}%</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-600">
                                <BatteryCharging size={11} className="text-amber-500 shrink-0" />
                                <span>جهد الكابل: {itemTelemetry.battery}</span>
                              </div>
                            </div>
                          </div>
                        </InfoWindow>
                      )}
                    </React.Fragment>
                  );
                })}
              </GoogleMap>
            </APIProvider>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {hasValidKey ? renderGoogleMap() : renderFallbackMap()}
    </div>
  );
}
