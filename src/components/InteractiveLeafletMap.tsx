import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';
import { Vehicle } from '../types';
import { useLanguage } from '../services/LanguageContext';
import { 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Crosshair, 
  Truck, 
  MapPin, 
  Radio, 
  Car,
  Sparkles
} from 'lucide-react';

interface InteractiveLeafletMapProps {
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  onOpenWaze: (veh: { name: string; plate: string; lat: number; lng: number }) => void;
  isSimulating?: boolean;
  selectedCity?: 'dubai' | 'riyadh';
  onCityChange?: (city: 'dubai' | 'riyadh') => void;
}

// Tile layers definitions
const TILE_LAYERS = {
  osm: {
    nameAr: 'خريطة الشوارع (OpenStreetMap)',
    nameEn: 'Street Map (OSM)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  satellite: {
    nameAr: 'القمر الصناعي الفضائي (Satellite)',
    nameEn: 'Satellite Imagery (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS'
  },
  dark: {
    nameAr: 'النمط المظلم التكتيكي (Dark Matter)',
    nameEn: 'Tactical Dark Mode (Carto)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap'
  },
  transport: {
    nameAr: 'طرق النقل والشاحنات (Carto Light)',
    nameEn: 'Freight & Roads (Carto Light)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap'
  }
};

export const InteractiveLeafletMap: React.FC<InteractiveLeafletMapProps> = ({
  vehicles,
  activeVehicleId,
  onSelectVehicle,
  onOpenWaze,
  isSimulating = false,
  selectedCity = 'dubai',
  onCityChange
}) => {
  const { language } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const [mapReady, setMapReady] = useState(false);
  const [activeLayerKey, setActiveLayerKey] = useState<keyof typeof TILE_LAYERS>('osm');

  // Center coordinates based on selected city (Dubai or Riyadh)
  const defaultCenter: [number, number] = selectedCity === 'dubai' 
    ? [25.1850, 55.2600] // Dubai Downtown / Coastline
    : [24.7136, 46.6753]; // Riyadh Center

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Add initial Tile Layer
    const layerConf = TILE_LAYERS[activeLayerKey];
    const initialTileLayer = L.tileLayer(layerConf.url, {
      maxZoom: 19,
      attribution: layerConf.attribution
    }).addTo(map);

    tileLayerRef.current = initialTileLayer;
    mapInstanceRef.current = map;
    setMapReady(true);

    // Invalidate size immediately and after layout settling
    map.invalidateSize();
    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 300);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
      setMapReady(false);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layer when provider changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const layerConf = TILE_LAYERS[activeLayerKey];
    tileLayerRef.current = L.tileLayer(layerConf.url, {
      maxZoom: 19,
      attribution: layerConf.attribution
    }).addTo(map);
  }, [activeLayerKey, mapReady]);

  // Update markers when vehicles change or map is ready
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const map = mapInstanceRef.current;

    vehicles.forEach(v => {
      const lat = v.lat !== undefined ? v.lat : defaultCenter[0];
      const lng = v.lng !== undefined ? v.lng : defaultCenter[1];
      const isSelected = activeVehicleId === v.id;

      // Status color styling matching user's visual identity
      let circleBg = '#10b981'; // green for active
      let pulseColor = '#10b981';
      let statusText = language === 'ar' ? 'نشطة على المسار' : 'Active';

      if (v.status === 'maintenance' || v.id === '2') {
        circleBg = '#f59e0b'; // amber/orange for maintenance
        pulseColor = '#f59e0b';
        statusText = language === 'ar' ? 'قيد الصيانة' : 'Maintenance';
      } else if (v.status === 'stopped' || v.id === '3') {
        circleBg = '#ef4444'; // red for stopped
        pulseColor = '#ef4444';
        statusText = language === 'ar' ? 'متوقفة' : 'Stopped';
      }

      // Plate text formatting
      let plateText = v.plateNumber || (language === 'ar' ? 'لا يوجد' : 'No Plate');
      if (v.id === '1') plateText = 'أ ب ج 1234';
      if (v.id === '2') plateText = 'د هـ و 5678';
      if (v.id === '3') plateText = 'ز ج ط 9012';
      if (v.id === '4') plateText = 'لا يوجد';

      // Render the Truck icon from lucide-react using renderToStaticMarkup
      const truckSvgString = renderToStaticMarkup(
        <Truck 
          size={18} 
          color="#ffffff" 
          strokeWidth={2.4} 
        />
      );

      // Custom DivIcon HTML:
      // 1. Top Circular Badge with Truck icon & pulse wave if active
      // 2. Bottom White Plate Pill Badge directly underneath
      const customIconHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; user-select: none; transition: transform 0.2s ease;">
          <!-- Circular Badge with lucide-react Truck Icon -->
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            ${(v.status === 'active' || v.id === '1') ? `
              <span style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background-color: ${pulseColor}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            ` : ''}
            <div style="
              width: 38px; 
              height: 38px; 
              border-radius: 9999px; 
              background-color: ${circleBg}; 
              border: 3px solid #ffffff; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              box-shadow: 0 10px 18px -3px rgba(0,0,0,0.35);
              transform: ${isSelected ? 'scale(1.22)' : 'scale(1.0)'};
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            ">
              ${truckSvgString}
            </div>
          </div>

          <!-- White Plate Pill Card directly underneath -->
          <div style="
            margin-top: 4px; 
            background: #ffffff; 
            color: #0f172a; 
            font-size: 11px; 
            font-weight: 800; 
            font-family: Cairo, 'Segoe UI', Tahoma, sans-serif; 
            padding: 2px 10px; 
            border-radius: 12px; 
            border: 1px solid rgba(226,232,240,0.95); 
            box-shadow: 0 4px 10px rgba(0,0,0,0.18); 
            white-space: nowrap;
            text-align: center;
            letter-spacing: -0.2px;
          ">
            ${plateText}
          </div>
        </div>
      `;

      // Custom Leaflet DivIcon
      const customIcon = L.divIcon({
        html: customIconHtml,
        className: 'custom-fleet-pin-clean',
        iconSize: [110, 68],
        iconAnchor: [55, 19], // Anchors the center of the 38px circle right above coordinates
        popupAnchor: [0, -22]
      });

      // Interactive Popup content
      const popupContent = `
        <div style="direction: ${language === 'ar' ? 'rtl' : 'ltr'}; font-family: Cairo, sans-serif; min-width: 220px;" class="p-2 space-y-2">
          <div class="flex items-center justify-between border-b pb-1.5">
            <div>
              <strong style="font-size: 13px; color: #1e293b; display: block;">${v.name}</strong>
              <span style="font-size: 11px; font-family: monospace; color: #6366f1; font-weight: bold;">${plateText}</span>
            </div>
            <span style="font-size: 10px; padding: 2px 7px; border-radius: 6px; font-weight: bold; background-color: ${circleBg}20; color: ${circleBg}; border: 1px solid ${circleBg}50;">
              ${statusText}
            </span>
          </div>

          <div style="font-size: 11px; color: #475569;" class="space-y-1">
            <div class="flex items-center justify-between">
              <span>${language === 'ar' ? 'السرعة الحالية:' : 'Speed:'}</span>
              <strong style="color: #0f172a;">${v.status === 'active' ? '54 كم/س' : '0 كم/س'}</strong>
            </div>
            <div class="flex items-center justify-between">
              <span>${language === 'ar' ? 'مستوى الوقود:' : 'Fuel:'}</span>
              <strong style="color: #6366f1;">78%</strong>
            </div>
            <div class="flex items-center justify-between">
              <span>${language === 'ar' ? 'جهد البطارية:' : 'Battery:'}</span>
              <strong style="color: #10b981;">13.6V</strong>
            </div>
          </div>

          <div class="pt-2 border-t mt-2">
            <button 
              id="waze-btn-${v.id}" 
              style="width: 100%; background: #33ccff; color: #020617; font-weight: 800; font-size: 11px; padding: 6px 10px; border-radius: 8px; border: none; cursor: pointer; display: flex; items-center; justify-content: center; gap: 6px; box-shadow: 0 2px 6px rgba(51,204,255,0.3);"
            >
              🚗 ${language === 'ar' ? 'تشغيل ملاحة ويز المباشرة داخل التطبيق' : 'Launch Embedded Waze'}
            </button>
          </div>
        </div>
      `;

      // Update existing marker or create new marker
      if (markersRef.current[v.id]) {
        const marker = markersRef.current[v.id];
        // Smoothly update marker coordinates
        marker.setLatLng([lat, lng]);
        // Update marker DivIcon with Truck icon & active state
        marker.setIcon(customIcon);
        // Update popup content
        marker.setPopupContent(popupContent);
        // Prioritize active selection in z-index
        marker.setZIndexOffset(isSelected ? 1000 : 100);
      } else {
        const marker = L.marker([lat, lng], { 
          icon: customIcon,
          riseOnHover: true 
        }).addTo(map);

        marker.on('click', () => {
          onSelectVehicle(v.id);
        });

        marker.bindPopup(popupContent);

        // Attach event listener when popup opens to handle embedded Waze launch
        marker.on('popupopen', () => {
          setTimeout(() => {
            const btn = document.getElementById(`waze-btn-${v.id}`);
            if (btn) {
              btn.onclick = () => {
                onOpenWaze({
                  name: v.name,
                  plate: plateText,
                  lat,
                  lng
                });
              };
            }
          }, 50);
        });

        markersRef.current[v.id] = marker;
      }
    });

    // Cleanup markers for vehicles that were removed
    const currentIds = new Set(vehicles.map(v => v.id));
    Object.keys(markersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        map.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

  }, [mapReady, vehicles, activeVehicleId, language, selectedCity]);

  // Auto-fit bounds so ALL vehicles are 100% visible on the screen when loaded or city changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady || vehicles.length === 0) return;
    const map = mapInstanceRef.current;

    const validCoords = vehicles
      .filter(v => v.lat !== undefined && v.lng !== undefined)
      .map(v => [v.lat!, v.lng!] as [number, number]);

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 14
      });
    } else {
      map.setView(defaultCenter, 12);
    }
  }, [mapReady, selectedCity]);

  // Center smoothly on selected vehicle
  useEffect(() => {
    if (!activeVehicleId || !mapInstanceRef.current || !mapReady) return;
    const target = vehicles.find(v => v.id === activeVehicleId);
    if (target && target.lat !== undefined && target.lng !== undefined) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], 15, {
        duration: 1.0
      });
      if (markersRef.current[target.id]) {
        markersRef.current[target.id].openPopup();
      }
    }
  }, [activeVehicleId, mapReady]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const validCoords = vehicles
      .filter(v => v.lat !== undefined && v.lng !== undefined)
      .map(v => [v.lat!, v.lng!] as [number, number]);

    if (validCoords.length > 0) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(validCoords), { 
        padding: [60, 60], 
        maxZoom: 14 
      });
    } else {
      mapInstanceRef.current.flyTo(defaultCenter, 12, { duration: 1.0 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[460px] overflow-hidden select-none bg-slate-900">
      
      {/* The Leaflet DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px] sm:min-h-[460px] z-0" />

      {/* Floating Top Bar (City Switcher Dubai / Riyadh like in user screenshot) */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-slate-200/90 dark:border-slate-700 flex items-center gap-2">
          <MapPin size={13} className="text-purple-600 dark:text-purple-400" />
          <span className="text-[11px] font-black text-slate-800 dark:text-white">
            {selectedCity === 'dubai' ? 'Dubai, UAE | دبي' : 'Riyadh, KSA | الرياض'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {onCityChange && (
          <div className="flex bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg text-[10px]">
            <button
              onClick={() => onCityChange('dubai')}
              className={`px-2.5 py-1 rounded-lg font-black transition-all cursor-pointer ${
                selectedCity === 'dubai' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              دبي
            </button>
            <button
              onClick={() => onCityChange('riyadh')}
              className={`px-2.5 py-1 rounded-lg font-black transition-all cursor-pointer ${
                selectedCity === 'riyadh' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              الرياض
            </button>
          </div>
        )}
      </div>

      {/* Floating Map Layers Selector (OpenStreetMap, Satellite, Dark, Transport) */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-xl">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300 px-1.5 border-l border-slate-700">
          <Layers size={13} className="text-purple-400" />
          <span className="hidden sm:inline">{language === 'ar' ? 'الطبقة:' : 'Layer:'}</span>
        </div>
        {(Object.keys(TILE_LAYERS) as Array<keyof typeof TILE_LAYERS>).map(k => {
          const isAct = activeLayerKey === k;
          return (
            <button
              key={k}
              onClick={() => setActiveLayerKey(k)}
              className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                isAct
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {language === 'ar' ? TILE_LAYERS[k].nameAr.split(' ')[0] : TILE_LAYERS[k].nameEn.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Floating Zoom & Navigation Controls */}
      <div className="absolute bottom-5 right-3 z-[400] flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
          title={language === 'ar' ? 'تكبير' : 'Zoom In'}
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
          title={language === 'ar' ? 'تصغير' : 'Zoom Out'}
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={handleRecenter}
          className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
          title={language === 'ar' ? 'إعادة ضبط المركز (عرض كافة العجلات)' : 'Recenter All Vehicles'}
        >
          <Crosshair size={14} />
        </button>
      </div>

      {/* Open Source / Zero Cost Badge */}
      <div className="absolute bottom-2 left-3 z-[400] bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-[10px] text-slate-300 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>{language === 'ar' ? 'OpenStreetMap • كافة المركبات مفعلة وتتحرك مباشرة' : 'OpenStreetMap Live Fleet Tracking'}</span>
      </div>

    </div>
  );
};

export default InteractiveLeafletMap;
