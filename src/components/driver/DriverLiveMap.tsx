import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';
import { 
  Navigation, 
  MapPin, 
  Truck, 
  Compass, 
  Maximize2, 
  Minimize2,
  Layers, 
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
  Shield,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  ZoomIn,
  ZoomOut,
  Crosshair,
  X,
  Globe,
  Car,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../services/LanguageContext';
import { DriverTrip, DriverWaypoint } from '../../types';
import { WazeEmbeddedNavigator } from '../WazeEmbeddedNavigator';

interface DriverLiveMapProps {
  activeTrip: DriverTrip | null;
  onUpdateTripStatus: (status: DriverTrip['status'], note?: string) => void;
  onTriggerSOS: (reason: string, location: string) => void;
  isDarkMode: boolean;
}

// Tile layers definitions for OpenStreetMap engine
const TILE_LAYERS = {
  osm: {
    nameAr: 'خريطة الشوارع (OpenStreetMap)',
    nameEn: 'Street Map (OSM)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  satellite: {
    nameAr: 'القمر الصناعي (Satellite)',
    nameEn: 'Satellite (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  },
  dark: {
    nameAr: 'الوضع الليلي (Dark Matter)',
    nameEn: 'Dark Mode (Carto)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap'
  },
  transport: {
    nameAr: 'طرق الشاحنات والنقل (Freight)',
    nameEn: 'Freight & Transport',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap'
  }
};

// Default Route Waypoints if none provided in active trip
const DEFAULT_ROUTE_WAYPOINTS: DriverWaypoint[] = [
  { id: 'wp-1', name: 'مستودع الرياض المركزي (تحميل الحمولة)', nameEn: 'Riyadh Central Depot', type: 'origin', status: 'reached', lat: 24.7136, lng: 46.6753, time: '07:30' },
  { id: 'wp-2', name: 'تقاطع طريق الخرج (مسار الشاحنات الثقيلة)', nameEn: 'Al-Kharj Freight Junction', type: 'checkpoint', status: 'reached', lat: 24.6850, lng: 46.7200, time: '08:45' },
  { id: 'wp-3', name: 'محطة الميزان المحوري ونقطة التفتيش', nameEn: 'Axle Weigh Station & Inspection', type: 'checkpoint', status: 'pending', lat: 24.6300, lng: 46.7800, time: '10:15' },
  { id: 'wp-4', name: 'بوابة مشروع التسليم والتفريغ B-4', nameEn: 'Destination Site Gate B-4', type: 'destination', status: 'pending', lat: 24.5500, lng: 46.8900, time: '14:15' }
];

// Sample points of interest along the route
const NEARBY_SERVICES = [
  { id: 'ws-1', nameAr: 'ورشة أسطول الرياض المركزية', nameEn: 'Riyadh Central Fleet Workshop', type: 'workshop', distKm: 3.4, lat: 24.6980, lng: 46.7020, phone: '+966 11 405 8899' },
  { id: 'fs-1', nameAr: 'محطة أرامكو ديزل للشاحنات (طريق الخرج)', nameEn: 'Aramco Heavy Diesel Station', type: 'station', distKm: 1.8, lat: 24.6650, lng: 46.7350, phone: '+966 11 498 2211' },
  { id: 'rs-1', nameAr: 'استراحة ونقطة راحة السائقين الدولية', nameEn: 'Highway Drivers Oasis & Rest', type: 'rest', distKm: 7.2, lat: 24.6420, lng: 46.7650, phone: '+966 50 123 4567' }
];

export default function DriverLiveMap({
  activeTrip,
  onUpdateTripStatus,
  onTriggerSOS,
  isDarkMode
}: DriverLiveMapProps) {
  const { language, dir } = useLanguage();

  // Map Engine Choice: 'osm' (OpenStreetMap) | 'waze' (Waze Live)
  const [selectedMapEngine, setSelectedMapEngine] = useState<'osm' | 'waze'>('osm');

  // Leaflet Layer Choice for OpenStreetMap
  const [activeLayerKey, setActiveLayerKey] = useState<keyof typeof TILE_LAYERS>(isDarkMode ? 'dark' : 'osm');
  
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSimulatingDrive, setIsSimulatingDrive] = useState(activeTrip?.status === 'in_progress');
  const [progressPercent, setProgressPercent] = useState(38); // Route progress %
  const [currentSpeed, setCurrentSpeed] = useState(74); // KM/H
  
  // Modals & States
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosReason, setSosReason] = useState('');
  const [sosDispatched, setSosDispatched] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryRecipient, setDeliveryRecipient] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Leaflet DOM and Instance references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routeGlowLineRef = useRef<L.Polyline | null>(null);
  const waypointMarkersRef = useRef<L.Marker[]>([]);
  const poiMarkersRef = useRef<L.Marker[]>([]);
  const truckMarkerRef = useRef<L.Marker | null>(null);

  // Active Trip Waypoints
  const waypoints = (activeTrip && activeTrip.waypoints && activeTrip.waypoints.length > 0)
    ? activeTrip.waypoints
    : DEFAULT_ROUTE_WAYPOINTS;

  // Destination coordinates for Waze & Map centering
  const destinationWaypoint = waypoints[waypoints.length - 1] || waypoints[0];
  const originWaypoint = waypoints[0];

  // Helper to calculate truck GPS position along waypoints polyline
  const calculateTruckGps = (pct: number): [number, number] => {
    if (waypoints.length === 0) return [24.7136, 46.6753];
    if (waypoints.length === 1) return [waypoints[0].lat, waypoints[0].lng];

    const clampedPct = Math.max(0, Math.min(100, pct)) / 100;
    
    // Segment-based linear interpolation
    const totalSegments = waypoints.length - 1;
    const scaledIndex = clampedPct * totalSegments;
    const segmentIndex = Math.min(Math.floor(scaledIndex), totalSegments - 1);
    const segmentFactor = scaledIndex - segmentIndex;

    const p1 = waypoints[segmentIndex];
    const p2 = waypoints[segmentIndex + 1];

    const lat = p1.lat + (p2.lat - p1.lat) * segmentFactor;
    const lng = p1.lng + (p2.lng - p1.lng) * segmentFactor;

    return [lat, lng];
  };

  const truckGps = calculateTruckGps(progressPercent);

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

  // Simulation interval for truck movement
  useEffect(() => {
    let interval: any;
    if (isSimulatingDrive) {
      interval = setInterval(() => {
        setProgressPercent(prev => {
          if (prev >= 99) {
            setIsSimulatingDrive(false);
            return 100;
          }
          return Number((prev + 0.35).toFixed(2));
        });
        // Realistic fluctuating speed (65 - 82 KM/H)
        setCurrentSpeed(Math.floor(68 + Math.random() * 12));
      }, 1000);
    } else {
      setCurrentSpeed(0);
    }
    return () => clearInterval(interval);
  }, [isSimulatingDrive]);

  // Turn-by-turn guidance text based on progress
  const getNavInstruction = () => {
    if (progressPercent < 25) {
      return {
        icon: <ArrowUp size={22} className="text-emerald-400" />,
        textAr: 'واصل السير مباشرة على طريق الشاحنات الرئيسي باتجاه المخرج 14',
        textEn: 'Continue straight on freight corridor toward Exit 14',
        dist: '2.4 كم',
        distEn: '2.4 km'
      };
    } else if (progressPercent < 60) {
      return {
        icon: <CornerUpRight size={22} className="text-amber-400" />,
        textAr: 'انعطف يميناً نحو الطريق الدائري الجنوبي ومسار محطة الوزن المحوري',
        textEn: 'Turn right onto Southern Ring Rd toward Axle Scale lane',
        dist: '850 م',
        distEn: '850 m'
      };
    } else if (progressPercent < 88) {
      return {
        icon: <ArrowUp size={22} className="text-indigo-400" />,
        textAr: 'اتجه مباشرة نحو نقطة تفتيش الموقع وبوابة الدخول الإلزامية',
        textEn: 'Head straight to Site Checkpoint & mandatory entry gate',
        dist: '3.1 كم',
        distEn: '3.1 km'
      };
    } else {
      return {
        icon: <CornerUpLeft size={22} className="text-emerald-400" />,
        textAr: 'اقتربت من الوجهة: انعطف يساراً للدخول إلى رصيف تفريغ الحمولة',
        textEn: 'Approaching Destination: Turn left into unloading dock',
        dist: '300 م',
        distEn: '300 m'
      };
    }
  };

  const currentNav = getNavInstruction();

  // Trip action handlers
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
    onTriggerSOS(sosReason, `Lat: ${truckGps[0].toFixed(4)}, Lng: ${truckGps[1].toFixed(4)} (طريق الشاحنات - كم 42)`);
    setTimeout(() => {
      setSosDispatched(false);
      setSosModalOpen(false);
      setSosReason('');
    }, 2500);
  };

  // Re-center map view on truck
  const handleRecenterTruck = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(truckGps, 13, { animate: true });
  };

  // ==========================================
  // LEAFLET OPENSTREETMAP INITIALIZATION & SYNC
  // ==========================================
  useEffect(() => {
    // Only initialize Leaflet if OpenStreetMap engine is active
    if (selectedMapEngine !== 'osm') return;
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      return;
    }

    const initialCenter = truckGps;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    const layerConf = TILE_LAYERS[activeLayerKey];
    tileLayerRef.current = L.tileLayer(layerConf.url, {
      maxZoom: 19,
      attribution: layerConf.attribution
    }).addTo(map);

    mapInstanceRef.current = map;

    // Draw Route Polyline
    const routeCoords: [number, number][] = waypoints.map(wp => [wp.lat, wp.lng]);
    
    // Outer glow polyline
    routeGlowLineRef.current = L.polyline(routeCoords, {
      color: '#818cf8',
      weight: 8,
      opacity: 0.45,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Inner core route polyline
    routePolylineRef.current = L.polyline(routeCoords, {
      color: '#4f46e5',
      weight: 4.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Draw Waypoint Markers
    waypointMarkersRef.current = [];
    waypoints.forEach((wp, index) => {
      const isOrigin = index === 0;
      const isDestination = index === waypoints.length - 1;
      
      let badgeColor = isOrigin ? '#10b981' : isDestination ? '#6366f1' : '#f59e0b';
      let iconEmoji = isOrigin ? '🏁' : isDestination ? '📍' : '⚖️';

      const waypointIcon = L.divIcon({
        className: 'custom-driver-waypoint-marker',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
            <div style="background:${badgeColor}; color:#fff; width:34px; height:34px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:0 6px 14px rgba(0,0,0,0.35); border:2.5px solid #fff;">
              ${iconEmoji}
            </div>
            <div style="margin-top:3px; background:#0f172a; color:#fff; font-size:10px; font-weight:800; padding:2px 7px; border-radius:8px; white-space:nowrap; border:1px solid rgba(255,255,255,0.2); box-shadow:0 4px 8px rgba(0,0,0,0.3);">
              ${language === 'ar' ? wp.name : wp.nameEn}
            </div>
          </div>
        `,
        iconSize: [34, 52],
        iconAnchor: [17, 52]
      });

      const marker = L.marker([wp.lat, wp.lng], { icon: waypointIcon }).addTo(map);
      marker.bindPopup(`
        <div style="text-align:${dir === 'rtl' ? 'right' : 'left'}; font-family:Cairo, sans-serif; min-width:180px;">
          <h4 style="font-weight:900; margin:0 0 4px; font-size:13px; color:#0f172a;">${language === 'ar' ? wp.name : wp.nameEn}</h4>
          <p style="margin:0 0 4px; font-size:11px; color:#64748b;">${language === 'ar' ? `المحطة ${index + 1} من ${waypoints.length}` : `Milestone ${index + 1} of ${waypoints.length}`}</p>
          <div style="display:flex; align-items:center; gap:6px; font-size:10.5px; font-weight:700; color:#10b981;">
            <span>⏱️ ${wp.time || '10:00 AM'}</span>
            <span>•</span>
            <span>${wp.status === 'reached' ? (language === 'ar' ? 'تم المرور ✓' : 'Reached ✓') : (language === 'ar' ? 'محطة قادمة' : 'Upcoming')}</span>
          </div>
        </div>
      `);
      waypointMarkersRef.current.push(marker);
    });

    // Draw Nearby POIs (Gas, Workshop, Rest)
    poiMarkersRef.current = [];
    NEARBY_SERVICES.forEach((service) => {
      const isFuel = service.type === 'station';
      const isRest = service.type === 'rest';
      const bg = isFuel ? '#0284c7' : isRest ? '#8b5cf6' : '#d97706';
      const emoji = isFuel ? '⛽' : isRest ? '☕' : '🔧';

      const poiIcon = L.divIcon({
        className: 'custom-poi-marker',
        html: `
          <div style="background:${bg}; color:#fff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; box-shadow:0 4px 10px rgba(0,0,0,0.3); border:2px solid #fff; cursor:pointer;">
            ${emoji}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const poiMarker = L.marker([service.lat, service.lng], { icon: poiIcon }).addTo(map);
      poiMarker.bindPopup(`
        <div style="text-align:${dir === 'rtl' ? 'right' : 'left'}; font-family:Cairo, sans-serif;">
          <strong style="color:#0f172a; font-size:12px; display:block;">${language === 'ar' ? service.nameAr : service.nameEn}</strong>
          <span style="color:#64748b; font-size:10.5px;">${language === 'ar' ? `المسافة: ${service.distKm} كم` : `Distance: ${service.distKm} km`}</span>
          <div style="margin-top:4px;">
            <a href="tel:${service.phone}" style="display:inline-block; padding:3px 8px; background:#6366f1; color:#fff; text-decoration:none; border-radius:6px; font-size:10px; font-weight:800;">
              📞 ${language === 'ar' ? 'اتصال مباشر' : 'Call'}
            </a>
          </div>
        </div>
      `);
      poiMarkersRef.current.push(poiMarker);
    });

    // Create Initial Truck Marker
    const truckIconHtml = `
      <div style="position:relative; display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
        <!-- Pulsing radar halo -->
        <span style="position:absolute; width:52px; height:52px; border-radius:50%; background:#6366f1; opacity:0.35; animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;"></span>
        
        <!-- Truck capsule -->
        <div style="width:42px; height:42px; border-radius:14px; background:linear-gradient(135deg, #4f46e5, #7c3aed); border:3px solid #fff; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 22px rgba(79,70,229,0.45); color:#fff; font-size:20px;">
          🚛
        </div>

        <!-- Speed tag -->
        <div style="margin-top:4px; background:#0f172a; color:#10b981; font-size:10px; font-weight:900; font-family:monospace; padding:1px 8px; border-radius:8px; border:1px solid #10b981; white-space:nowrap; box-shadow:0 4px 10px rgba(0,0,0,0.4);">
          ${currentSpeed} KM/H
        </div>
      </div>
    `;

    const truckIcon = L.divIcon({
      className: 'custom-truck-live-marker',
      html: truckIconHtml,
      iconSize: [42, 60],
      iconAnchor: [21, 30]
    });

    truckMarkerRef.current = L.marker(truckGps, { icon: truckIcon, zIndexOffset: 1000 }).addTo(map);

    // Initial resize trigger
    setTimeout(() => map.invalidateSize(), 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [selectedMapEngine]);

  // Update Leaflet tile layer when layer changes
  useEffect(() => {
    if (!mapInstanceRef.current || selectedMapEngine !== 'osm') return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const layerConf = TILE_LAYERS[activeLayerKey];
    tileLayerRef.current = L.tileLayer(layerConf.url, {
      maxZoom: 19,
      attribution: layerConf.attribution
    }).addTo(map);
  }, [activeLayerKey, selectedMapEngine]);

  // Update Truck Marker Position along Route as progressPercent updates
  useEffect(() => {
    if (!mapInstanceRef.current || !truckMarkerRef.current || selectedMapEngine !== 'osm') return;

    truckMarkerRef.current.setLatLng(truckGps);

    // Update Speed in truck icon html
    const truckIconHtml = `
      <div style="position:relative; display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
        ${isSimulatingDrive ? `
          <span style="position:absolute; width:52px; height:52px; border-radius:50%; background:#6366f1; opacity:0.35; animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;"></span>
        ` : ''}
        <div style="width:42px; height:42px; border-radius:14px; background:linear-gradient(135deg, #4f46e5, #7c3aed); border:3px solid #fff; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 22px rgba(79,70,229,0.45); color:#fff; font-size:20px;">
          🚛
        </div>
        <div style="margin-top:4px; background:#0f172a; color:#10b981; font-size:10px; font-weight:900; font-family:monospace; padding:1px 8px; border-radius:8px; border:1px solid #10b981; white-space:nowrap; box-shadow:0 4px 10px rgba(0,0,0,0.4);">
          ${currentSpeed} KM/H
        </div>
      </div>
    `;

    truckMarkerRef.current.setIcon(
      L.divIcon({
        className: 'custom-truck-live-marker',
        html: truckIconHtml,
        iconSize: [42, 60],
        iconAnchor: [21, 30]
      })
    );
  }, [truckGps[0], truckGps[1], currentSpeed, isSimulatingDrive, selectedMapEngine]);

  // Invalidate map size on fullscreen toggle
  useEffect(() => {
    if (mapInstanceRef.current && selectedMapEngine === 'osm') {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }
  }, [isFullscreen, selectedMapEngine]);

  return (
    <div 
      id="map-container" 
      className={isFullscreen ? "fixed inset-0 z-[99999] w-screen h-screen bg-slate-950 overflow-hidden m-0 p-0 rounded-none flex flex-col" : "space-y-4"} 
      dir={dir}
    >
      {/* Top Map Engine Selector & Mission Status Bar */}
      <div className={`bg-white dark:bg-[#0f1422] p-3 sm:p-4 rounded-3xl border border-slate-100 dark:border-slate-850/80 shadow-2xs space-y-3 ${isFullscreen ? 'hidden' : ''}`}>
        
        {/* Row 1: Trip Header, Live Fleet Status & Speed Badge */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shrink-0 border border-purple-500/20">
              <Navigation size={20} className={isSimulatingDrive ? 'animate-spin-slow' : ''} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? 'خريطة التتبع والملاحة الحية' : 'Live Driver GPS Navigation'}
                </h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                  isSimulatingDrive 
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSimulatingDrive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                  <span>{isSimulatingDrive ? (language === 'ar' ? 'متصل ومتحرك' : 'Live In Motion') : (language === 'ar' ? 'متوقف / جاهز' : 'Standby / Parked')}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                {activeTrip 
                  ? (language === 'ar' ? `المسار المحدد: ${activeTrip.origin} ➔ ${activeTrip.destination}` : `Designated Route: ${activeTrip.originEn} ➔ ${activeTrip.destinationEn}`)
                  : (language === 'ar' ? 'المسار المحدد: مستودع الرياض المركزي ➔ موقع التسليم' : 'Designated Route: Riyadh Depot ➔ Project Destination')}
              </p>
            </div>
          </div>

          {/* Quick HUD Speedometer */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs font-mono font-black text-slate-700 dark:text-slate-200">
            <Gauge size={15} className="text-purple-500" />
            <span>{currentSpeed} KM/H</span>
          </div>
        </div>

        {/* Row 2: Ergonomic Buttons Toolbar with Optimal Mobile & Desktop Layout */}
        <div className="pt-2.5 border-t border-slate-150/70 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          
          {/* 1. Dual Engine Tabs (OpenStreetMap vs Waze Live) */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 gap-1 w-full sm:w-auto">
            {/* OpenStreetMap Button */}
            <button
              type="button"
              onClick={() => setSelectedMapEngine('osm')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedMapEngine === 'osm'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Globe size={15} className={selectedMapEngine === 'osm' ? 'text-white' : 'text-purple-500'} />
              <span>{language === 'ar' ? 'مسار الشاحنة (OSM)' : 'Truck Route (OSM)'}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                selectedMapEngine === 'osm' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                0 ر.س
              </span>
            </button>

            {/* Waze Live Navigation Button */}
            <button
              type="button"
              onClick={() => setSelectedMapEngine('waze')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 sm:px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedMapEngine === 'waze'
                  ? 'bg-gradient-to-r from-[#0099ff] to-[#0077cc] text-white shadow-md shadow-[#0088cc]/30 ring-1 ring-cyan-400/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
            >
              <Car size={15} className={selectedMapEngine === 'waze' ? 'text-white' : 'text-[#0088cc]'} />
              <span>{language === 'ar' ? 'ملاحة ويز (Waze)' : 'Waze Live'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>

          {/* 2. Fast Actions Group: SOS Emergency & Fullscreen Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* SOS Emergency Button - High Visibility Beacon Style */}
            <button
              type="button"
              onClick={() => setSosModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-rose-600/30 border border-rose-400/40 flex items-center justify-center gap-2 cursor-pointer"
              title={language === 'ar' ? 'طلب نجدة واستغاثة طارئة' : 'Emergency SOS Dispatch'}
            >
              <ShieldAlert size={16} className="text-white animate-bounce" />
              <span>{language === 'ar' ? 'طوارئ واستغاثة SOS' : 'Emergency SOS'}</span>
            </button>

            {/* Fullscreen Expand Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 font-black text-xs rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              title={language === 'ar' ? 'تكبير الخريطة لكامل الشاشة' : 'Expand Fullscreen'}
            >
              <Maximize2 size={15} className="text-purple-600 dark:text-purple-400" />
              <span className="hidden xs:inline">{language === 'ar' ? 'ملء الشاشة' : 'Fullscreen'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Map Frame */}
      <div 
        className={`relative overflow-hidden bg-slate-950 select-none transition-all ${
          isFullscreen 
            ? 'w-full h-full flex-1 rounded-none border-none' 
            : 'h-[540px] md:h-[620px] w-full rounded-[2.5rem] border border-purple-500/20 shadow-xl'
        }`}
      >
        {/* Fullscreen Floating Cockpit Header - Sleek, Compact & Perfectly Organized */}
        {isFullscreen && (
          <div className="absolute top-2.5 inset-x-2.5 sm:inset-x-4 z-[1000] pointer-events-none">
            <div className="max-w-2xl mx-auto bg-slate-950/90 backdrop-blur-xl border border-purple-500/35 rounded-2xl shadow-2xl p-1.5 flex items-center justify-between gap-1.5 pointer-events-auto">
              
              {/* Left/Start: Minimize/Exit Button & Speed Indicator */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="px-2.5 py-1.5 bg-rose-600/90 hover:bg-rose-600 active:scale-95 text-white font-black text-[11px] rounded-xl shadow-sm border border-rose-400/40 flex items-center gap-1 cursor-pointer transition-all"
                  title={language === 'ar' ? 'تصغير الخريطة والرجوع' : 'Minimize (ESC)'}
                >
                  <Minimize2 size={13} />
                  <span>{language === 'ar' ? 'تصغير' : 'Exit'}</span>
                </button>

                <div className="flex items-center gap-1 px-2 py-1 bg-slate-900 rounded-xl border border-slate-800 text-[10.5px] font-mono font-black text-emerald-400">
                  <Gauge size={12} className="text-purple-400" />
                  <span>{currentSpeed} <span className="text-[9px] text-slate-400 font-sans">KM/H</span></span>
                </div>
              </div>

              {/* Center: Sleek Compact Engine Switcher */}
              <div className="flex items-center gap-0.5 bg-slate-900/90 p-0.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedMapEngine('osm')}
                  className={`px-2 py-1 rounded-lg text-[10.5px] font-black transition-all cursor-pointer ${
                    selectedMapEngine === 'osm'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'ar' ? 'مسار الشاحنة' : 'OSM'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMapEngine('waze')}
                  className={`px-2 py-1 rounded-lg text-[10.5px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                    selectedMapEngine === 'waze'
                      ? 'bg-[#0088cc] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{language === 'ar' ? 'ويز' : 'Waze'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              </div>

              {/* Right/End: Quick SOS Pill */}
              <button
                type="button"
                onClick={() => setSosModalOpen(true)}
                className="px-2.5 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 text-white font-black text-[11px] rounded-xl shadow-sm border border-rose-400/40 flex items-center gap-1 cursor-pointer shrink-0"
                title={language === 'ar' ? 'طلب نجدة واستغاثة' : 'Emergency SOS'}
              >
                <ShieldAlert size={13} className="animate-bounce" />
                <span>{language === 'ar' ? 'طوارئ' : 'SOS'}</span>
              </button>

            </div>
          </div>
        )}

        {/* Turn-by-Turn Instruction Banner (Shows on OpenStreetMap only when no modal is active) */}
        {selectedMapEngine === 'osm' && !sosModalOpen && !showDeliveryModal && (
          <div className={`absolute left-2.5 right-2.5 z-30 pointer-events-none transition-all duration-300 ${isFullscreen ? 'top-13' : 'top-3'}`}>
            <div className={`max-w-lg mx-auto bg-slate-900/90 backdrop-blur-md border border-purple-500/35 rounded-xl shadow-xl flex items-center justify-between gap-2 text-white pointer-events-auto ${isFullscreen ? 'p-2' : 'p-3'}`}>
              <div className="flex items-center gap-2 min-w-0">
                <div className={`${isFullscreen ? 'w-7 h-7 rounded-lg' : 'w-9 h-9 rounded-xl'} bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0`}>
                  {currentNav.icon}
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-purple-300 font-black uppercase tracking-wider block">
                    {language === 'ar' ? 'التوجيه القادم' : 'Upcoming Turn'}
                  </span>
                  <p className={`${isFullscreen ? 'text-[11px]' : 'text-xs'} font-black text-white truncate`}>
                    {language === 'ar' ? currentNav.textAr : currentNav.textEn}
                  </p>
                </div>
              </div>
              <div className="text-end shrink-0 ps-2 border-s border-slate-700/80">
                <span className={`${isFullscreen ? 'text-[11px]' : 'text-xs'} font-black text-emerald-400 font-mono block`}>
                  {language === 'ar' ? currentNav.dist : currentNav.distEn}
                </span>
                <span className="text-[8.5px] text-slate-400 font-bold block">
                  {language === 'ar' ? 'المسافة' : 'Distance'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ENGINE 1: OPENSTREETMAP INTERACTIVE LEAFLET MAP */}
        {selectedMapEngine === 'osm' && (
          <div className="w-full h-full relative">
            {/* The Actual Leaflet Map Canvas */}
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Floating Layer Selector Controls (Bottom-Start) */}
            <div className={`absolute start-3 z-[400] transition-all ${isFullscreen ? 'bottom-3' : 'bottom-5'}`}>
              <div className="bg-slate-950/85 backdrop-blur-md p-1 rounded-xl flex items-center gap-1 border border-purple-500/30 shadow-lg">
                <button
                  type="button"
                  onClick={() => setActiveLayerKey('osm')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    activeLayerKey === 'osm' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {language === 'ar' ? 'شوارع' : 'Street'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLayerKey('satellite')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    activeLayerKey === 'satellite' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {language === 'ar' ? 'أقمار' : 'Sat'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLayerKey('dark')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    activeLayerKey === 'dark' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {language === 'ar' ? 'ليلي' : 'Night'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLayerKey('transport')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                    activeLayerKey === 'transport' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {language === 'ar' ? 'شاحنات' : 'Freight'}
                </button>
              </div>
            </div>

            {/* Floating Zoom & Recenter Controls (Bottom-End) */}
            <div className={`absolute end-3 z-[400] flex items-center gap-1.5 transition-all ${isFullscreen ? 'bottom-3' : 'bottom-5'}`}>
              <button
                type="button"
                onClick={handleRecenterTruck}
                className="px-2.5 py-1.5 bg-slate-950/85 hover:bg-slate-900 text-purple-400 hover:text-white rounded-xl border border-purple-500/30 shadow-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-black"
                title={language === 'ar' ? 'التمركز على موقع الشاحنة الحالي' : 'Recenter on Truck'}
              >
                <Crosshair size={13} />
                <span>{language === 'ar' ? 'تمركز' : 'Recenter'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ENGINE 2: WAZE LIVE MAP DIRECT INLINE EMBED */}
        {selectedMapEngine === 'waze' && (
          <div className="w-full h-full bg-slate-950 flex flex-col">
            <WazeEmbeddedNavigator
              isModal={false}
              isInsideFullscreen={isFullscreen}
              height="100%"
              lat={destinationWaypoint.lat}
              lng={destinationWaypoint.lng}
              destinationTitle={activeTrip ? (language === 'ar' ? activeTrip.destination : activeTrip.destinationEn) : (language === 'ar' ? 'موقع تسليم الشحنة' : 'Freight Delivery Site')}
              destinationSubtitle={activeTrip ? activeTrip.tripCode : undefined}
              originTitle={activeTrip ? (language === 'ar' ? activeTrip.origin : activeTrip.originEn) : (language === 'ar' ? 'مستودع الرياض المركزي' : 'Riyadh Central Depot')}
              originLat={originWaypoint.lat}
              originLng={originWaypoint.lng}
            />
          </div>
        )}
      </div>

      {/* Driver Trip Progress & Action Controls Bar */}
      <div className={`bg-white dark:bg-[#0f1422] p-4 rounded-3xl border border-slate-100 dark:border-slate-850/80 shadow-2xs space-y-3 ${isFullscreen ? 'hidden' : ''}`}>
        
        {/* Progress Bar & Realtime Stats */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Gauge size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                {language === 'ar' ? 'عداد السرعة اللحظي' : 'Live Speedometer'}
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                {currentSpeed} <span className="text-xs text-slate-400">KM/H</span>
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-md min-w-[200px] space-y-1">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-slate-700 dark:text-slate-300">
                {language === 'ar' ? 'إنجاز مسار الرحلة' : 'Route Completion'}
              </span>
              <span className="text-purple-600 dark:text-purple-400 font-mono">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Buttons: Start, Pause, Deliver */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isSimulatingDrive ? (
              <button
                type="button"
                onClick={handleStartResume}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Play size={14} />
                <span>{language === 'ar' ? 'بدء / استئناف القيادة' : 'Start / Resume'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePauseBreak}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Pause size={14} />
                <span>{language === 'ar' ? 'استراحة مؤقتة' : 'Take Break'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleArrivedAtDestination}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>{language === 'ar' ? 'تأكيد الوصول والتسليم' : 'Arrived & Deliver'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency SOS Modal via React Portal to Document Body */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {sosModalOpen && (
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[999999] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-[#0f1422] max-w-md w-full rounded-3xl p-6 border border-rose-500/40 shadow-2xl space-y-4 text-right"
                dir={dir}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl">
                    <ShieldAlert size={26} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {language === 'ar' ? '🚨 بلاغ طارئ واستغاثة فورية (SOS)' : '🚨 Emergency SOS Dispatch'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold">
                      {language === 'ar' ? 'سيتم إرسال إحداثيات الشاحنة فوراً لغرفة العمليات المركزية' : 'Coordinates will be broadcast immediately to fleet operations'}
                    </p>
                  </div>
                </div>

                {sosDispatched ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                    <CheckCircle2 size={32} className="mx-auto text-emerald-500 animate-bounce" />
                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                      {language === 'ar' ? 'تم استلام بلاغك وإرسال فرقة الدعم والصيانة فوراً للموقع!' : 'SOS Received! Dispatch rescue team heading to your GPS position.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px]">
                      <span className="text-slate-400 font-bold block">{language === 'ar' ? 'موقع الشاحنة اللحظي:' : 'Live Truck GPS:'}</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        Lat: {truckGps[0].toFixed(4)}, Lng: {truckGps[1].toFixed(4)} ({language === 'ar' ? 'طريق الشاحنات - كم 42' : 'Freight Way - Km 42'})
                      </span>
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
        </AnimatePresence>,
        document.body
      )}

      {/* Cargo Handover & Delivery Confirmation Modal via React Portal to Document Body */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showDeliveryModal && (
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[999999] flex items-center justify-center p-4">
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
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
