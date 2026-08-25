import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Send, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Building2, 
  Package, 
  Layers, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Phone, 
  Sparkles,
  RefreshCw,
  FileCheck,
  ShieldAlert,
  Compass,
  ArrowRight,
  ChevronRight,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../services/LanguageContext';
import { DriverTrip, DriverWaypoint, User as AppUser, Driver, Vehicle } from '../types';

interface TripDispatchManagementProps {
  user: AppUser;
  onNavigateToMap?: () => void;
}

const DEFAULT_DRIVERS = [
  { id: 'u-driver', name: 'خالد الكعبي', role: 'سائق نقل ثقيل معتمد', phone: '+966 50 123 4567', plate: 'ب ل ط ٧٧٦', vehicle: 'تويوتا هيلوكس HD بيك آب' },
  { id: 'd1', name: 'سالم عبد الرحمن الدوسري', role: 'سائق خفيف ومعاينة', phone: '+966 50 987 4521', plate: 'أ ب ج ١٢٣', vehicle: 'تويوتا برادو دفع رباعي' },
  { id: 'd2', name: 'فهد بن مساعد المرشدي', role: 'سائق شاحنات ومقطورات ثقيلة', phone: '+966 55 123 4789', plate: 'د هـ و ٤٥٦', vehicle: 'مرسيدس أكتروس ثقيل' },
  { id: 'd3', name: 'عبد الله عمر الحربي', role: 'سائق نقل عمومي', phone: '+966 56 223 4123', plate: 'ح ط ي ٧٨٩', vehicle: 'إيسوزو دينا لنقل المهمات' },
  { id: 'd4', name: 'عادل منصور القحطاني', role: 'مشغل معدات وآليات إنشائية', phone: '+966 54 887 9900', plate: 'س ع ف ٣٢١', vehicle: 'كتربلر رافعة شوكية ثقيلة' }
];

const DEFAULT_PROJECTS = [
  { id: 'PRJ-NEOM-01', name: 'مشروع نيوم - البنية التحتية والممرات اللوجستية', client: 'شركة نيوم المساهمة', dest: 'مشروع نيوم - قطاع B-4 الإنشائي' },
  { id: 'PRJ-METRO-04', name: 'مشروع مترو الرياض - خط الإمداد والمحطات', client: 'الهيئة الملكية لمدينة الرياض', dest: 'محطة العليا المركزية للمترو' },
  { id: 'PRJ-REDSEA-02', name: 'مشروع البحر الأحمر السياحي - نقل المواد', client: 'شركة البحر الأحمر للتطوير', dest: 'منتجع أمالا الفندقي الشمالي' },
  { id: 'PRJ-SUDAIR-03', name: 'مشروع حقل توربينات الطاقة الهوائية بسدير', client: 'الشركة السعودية للكهرباء', dest: 'موقع توربينات حقل سدير' }
];

export default function TripDispatchManagement({ user, onNavigateToMap }: TripDispatchManagementProps) {
  const { language, dir } = useLanguage();
  
  // Trips state synced with driver portal
  const [trips, setTrips] = useState<DriverTrip[]>(() => {
    const saved = localStorage.getItem('fleet_driver_trips');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedTripDetails, setSelectedTripDetails] = useState<DriverTrip | null>(null);

  // Form State for Dispatching
  const [selectedDriverId, setSelectedDriverId] = useState(DEFAULT_DRIVERS[0].id);
  const [selectedProjectId, setSelectedProjectId] = useState(DEFAULT_PROJECTS[0].id);
  const [origin, setOrigin] = useState('مستودع الرياض المركزي اللوجستي');
  const [destination, setDestination] = useState(DEFAULT_PROJECTS[0].dest);
  const [cargoType, setCargoType] = useState('حديد تسليح وخرسانة مسبقة الصنع');
  const [cargoWeightTons, setCargoWeightTons] = useState(20);
  const [departureTime, setDepartureTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d.toISOString().replace('T', ' ').substring(0, 16);
  });
  const [estimatedArrival, setEstimatedArrival] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 6);
    return d.toISOString().replace('T', ' ').substring(0, 16);
  });
  const [urgency, setUrgency] = useState<'normal' | 'express' | 'hazardous'>('normal');
  const [startOdometer, setStartOdometer] = useState(124850);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  // Auto update destination when project changes
  const handleProjectSelectChange = (projId: string) => {
    setSelectedProjectId(projId);
    const p = DEFAULT_PROJECTS.find(item => item.id === projId);
    if (p) {
      setDestination(p.dest);
    }
  };

  // Sync with localStorage & Firestore
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('fleet_driver_trips');
      if (saved) {
        try { setTrips(JSON.parse(saved)); } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const saveTrips = (updatedTrips: DriverTrip[]) => {
    setTrips(updatedTrips);
    localStorage.setItem('fleet_driver_trips', JSON.stringify(updatedTrips));
    window.dispatchEvent(new Event('storage'));

    // Optional firestore backup
    import('../services/firebase').then(({ saveDocument, db }) => {
      if (db) {
        saveDocument('dispatch_logs', 'latest_trips_state', {
          updatedAt: new Date().toISOString(),
          tripsCount: updatedTrips.length,
          trips: updatedTrips
        }).catch(err => console.warn('Firestore backup trip err:', err));
      }
    }).catch(() => {});
  };

  const handleDispatchTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedDriver = DEFAULT_DRIVERS.find(d => d.id === selectedDriverId) || DEFAULT_DRIVERS[0];
    const project = DEFAULT_PROJECTS.find(p => p.id === selectedProjectId) || DEFAULT_PROJECTS[0];

    const newTripId = 'TRIP-' + Math.floor(1000 + Math.random() * 9000);
    const newTripCode = 'TRIP-2026-' + Math.floor(1000 + Math.random() * 9000);

    const waypoints: DriverWaypoint[] = [
      {
        id: 'wp-1',
        name: origin,
        nameEn: 'Origin Freight Hub',
        type: 'origin',
        status: 'reached',
        lat: 24.71,
        lng: 46.67,
        time: departureTime
      },
      {
        id: 'wp-2',
        name: 'نقطة الميزان المحوري وفحص الأوزان المعتمدة',
        nameEn: 'Axle Weight Station',
        type: 'checkpoint',
        status: 'pending',
        lat: 24.65,
        lng: 46.73
      },
      {
        id: 'wp-3',
        name: destination,
        nameEn: 'Receiving Site Gate',
        type: 'destination',
        status: 'pending',
        lat: 24.55,
        lng: 46.89
      }
    ];

    const newTrip: DriverTrip = {
      id: newTripId,
      tripCode: newTripCode,
      projectId: project.id,
      projectName: project.name,
      projectNameEn: project.name,
      origin: origin,
      originEn: origin,
      destination: destination,
      destinationEn: destination,
      cargoType: cargoType,
      cargoTypeEn: cargoType,
      cargoWeightTons: Number(cargoWeightTons),
      vehiclePlate: assignedDriver.plate,
      vehicleModel: assignedDriver.vehicle,
      status: 'scheduled',
      departureTime: departureTime,
      estimatedArrival: estimatedArrival,
      startOdometer: Number(startOdometer),
      totalDistanceKm: 165,
      waypoints: waypoints,
      urgency: urgency,
      assignedDriverId: assignedDriver.id,
      assignedDriverName: assignedDriver.name,
      dispatchedBy: user.name || 'مدير العمليات اللوجستية',
      dispatchDate: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updated = [newTrip, ...trips];
    saveTrips(updated);

    setDispatchSuccess(true);
    setTimeout(() => {
      setDispatchSuccess(false);
      setIsDispatchModalOpen(false);
    }, 1400);
  };

  const handleCancelTrip = (tripId: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من إلغاء أمر الرحلة هذا؟' : 'Are you sure you want to cancel this trip order?')) {
      const updated = trips.map(t => t.id === tripId ? { ...t, status: 'cancelled' as const } : t);
      saveTrips(updated);
    }
  };

  const handleDeleteTrip = (tripId: string) => {
    if (window.confirm(language === 'ar' ? 'حذف هذا السجل نهائياً؟' : 'Permanently delete this trip log?')) {
      const updated = trips.filter(t => t.id !== tripId);
      saveTrips(updated);
    }
  };

  // Filter trips
  const filteredTrips = trips.filter(t => {
    const matchSearch = searchTerm.trim() === '' ||
      t.tripCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.assignedDriverName && t.assignedDriverName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.origin.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const scheduledCount = trips.filter(t => t.status === 'scheduled').length;
  const inProgressCount = trips.filter(t => t.status === 'in_progress').length;
  const completedCount = trips.filter(t => t.status === 'completed' || t.status === 'delivered').length;

  return (
    <div className="space-y-6 text-right" dir={dir}>
      
      {/* Top Header Card - FleetAurvexis Brand Obsidian Gradient */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] rounded-3xl p-6 text-white border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles size={12} className="text-cyan-400" />
                <span>{language === 'ar' ? 'غرفة عمليات وإسناد الرحلات المركزية' : 'Central Fleet Dispatch & Assignment'}</span>
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-full">
                {language === 'ar' ? 'متزامن لحظياً مع تطبيق السائق ✓' : 'Live Synced with Driver App ✓'}
              </span>
            </div>

            <h2 className="text-xl font-black mt-2">
              {language === 'ar' ? 'جدولة وإسناد المهام والرحلات الميدانية للسائقين' : 'Driver Mission Dispatch & Route Assignment'}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {language === 'ar'
                ? 'تقوم الإدارة هنا بإنشاء وجدولة الرحلات اللوجستية وتعيين السائق والشاحنة المحددة وخط السير. تظهر الرحلة فوراً في هاتف وبوابة السائق للبدء والتتبع الميداني وإثبات التسليم.'
                : 'Management dispatches freight missions, assigns certified drivers and vehicles. Orders appear in real-time in the driver cockpit for navigation and digital proof of delivery.'}
            </p>
          </div>

          <button
            onClick={() => setIsDispatchModalOpen(true)}
            className="px-5 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 active:scale-98 border border-indigo-400/30"
          >
            <Send size={15} className="text-cyan-300" />
            <span>{language === 'ar' ? 'إرسال وجدولة رحلة جديدة لسائق' : 'Dispatch New Trip to Driver'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0f1422] p-4 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-black">{language === 'ar' ? 'إجمالي أوامر الرحلات' : 'Total Orders'}</span>
            <Package size={16} className="text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{trips.length}</span>
            <span className="text-[10px] text-slate-450 font-bold">{language === 'ar' ? 'مهمة مسجلة' : 'missions'}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f1422] p-4 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-black">{language === 'ar' ? 'رحلات جارية على الطريق' : 'In Progress'}</span>
            <Navigation size={16} className="text-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{inProgressCount}</span>
            <span className="text-[10px] text-emerald-500 font-bold">{language === 'ar' ? 'شاحنة نشطة الآن' : 'trucks active'}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f1422] p-4 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-black">{language === 'ar' ? 'رحلات مجدولة بانتظار الانطلاق' : 'Scheduled'}</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-amber-500">{scheduledCount}</span>
            <span className="text-[10px] text-slate-450 font-bold">{language === 'ar' ? 'مجدولة قادمة' : 'upcoming'}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f1422] p-4 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-black">{language === 'ar' ? 'تم التسليم وإثبات الوصول' : 'Delivered & POD'}</span>
            <CheckCircle2 size={16} className="text-cyan-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400">{completedCount}</span>
            <span className="text-[10px] text-cyan-500 font-bold">{language === 'ar' ? 'مكتملة وموقعة' : 'delivered'}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0f1422] p-4 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ar' ? 'بحث برقم الرحلة، المشروع، اسم السائق، أو الوجهة...' : 'Search trip code, driver, project...'}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'all', labelAr: 'الكل', labelEn: 'All' },
            { id: 'in_progress', labelAr: 'جارية على الطريق 🚛', labelEn: 'In Progress 🚛' },
            { id: 'scheduled', labelAr: 'مجدولة ⏳', labelEn: 'Scheduled ⏳' },
            { id: 'completed', labelAr: 'مكتملة ومسلمة ✓', labelEn: 'Delivered ✓' },
            { id: 'cancelled', labelAr: 'ملغاة ❌', labelEn: 'Cancelled ❌' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              {language === 'ar' ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Dispatched Trips List Table / Cards */}
      <div className="space-y-3.5">
        {filteredTrips.length === 0 ? (
          <div className="bg-white dark:bg-[#0f1422] p-10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Truck size={36} className="mx-auto text-slate-400 opacity-40" />
            <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">
              {language === 'ar' ? 'لا توجد رحلات تطابق البحث' : 'No trips match the current filter'}
            </h4>
            <p className="text-xs text-slate-450 max-w-md mx-auto">
              {language === 'ar' ? 'يمكنك إنشاء رحلة جديدة وتعيينها لأي سائق في الأسطول مباشرة.' : 'Dispatch a new trip to assign it to any fleet driver.'}
            </p>
            <button
              onClick={() => setIsDispatchModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition cursor-pointer"
            >
              {language === 'ar' ? '+ إسناد رحلة الآن' : '+ Dispatch Trip Now'}
            </button>
          </div>
        ) : (
          filteredTrips.map(trip => {
            const isLive = trip.status === 'in_progress';
            const isDone = trip.status === 'completed' || trip.status === 'delivered';
            const isWait = trip.status === 'scheduled';
            const isCancelled = trip.status === 'cancelled';

            return (
              <div 
                key={trip.id}
                className="bg-white dark:bg-[#0f1422] p-5 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs hover:border-indigo-500/30 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-850">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${
                      isLive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      isDone ? 'bg-cyan-500/10 text-cyan-600' :
                      isWait ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                    }`}>
                      <Truck size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-slate-900 dark:text-white">{trip.tripCode}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                          isLive ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 animate-pulse' :
                          isDone ? 'bg-cyan-500/20 text-cyan-600' :
                          isWait ? 'bg-amber-500/20 text-amber-600' : 'bg-rose-500/20 text-rose-600'
                        }`}>
                          {trip.status === 'in_progress' ? (language === 'ar' ? 'جارية على الطريق 🚛' : 'In Transit') :
                           trip.status === 'scheduled' ? (language === 'ar' ? 'مجدولة بانتظار السائق ⏳' : 'Scheduled') :
                           trip.status === 'completed' || trip.status === 'delivered' ? (language === 'ar' ? 'تم التسليم بنجاح ✓' : 'Delivered') :
                           (language === 'ar' ? 'ملغاة ❌' : 'Cancelled')}
                        </span>
                        {trip.urgency === 'hazardous' && (
                          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded text-[9px] font-black flex items-center gap-1">
                            <ShieldAlert size={10} />
                            <span>{language === 'ar' ? 'مواد خطرة' : 'Hazardous'}</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-black text-slate-700 dark:text-slate-200 mt-0.5">
                        {trip.projectName}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => setSelectedTripDetails(trip)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 hover:text-indigo-600 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>{language === 'ar' ? 'التفاصيل ونقاط المسار' : 'Details'}</span>
                    </button>

                    {!isDone && !isCancelled && (
                      <button
                        onClick={() => handleCancelTrip(trip.id)}
                        className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 text-rose-600 rounded-xl font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>{language === 'ar' ? 'إلغاء الأمر' : 'Cancel'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Route and Driver Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">{language === 'ar' ? 'السائق المسند والمركبة:' : 'Assigned Driver & Truck:'}</span>
                    <div className="flex items-center gap-2">
                      <User size={13} className="text-indigo-500" />
                      <span className="font-black text-slate-800 dark:text-white">
                        {trip.assignedDriverName || 'خالد الكعبي (سائق معتمد)'}
                      </span>
                    </div>
                    <span className="block text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                      {trip.vehicleModel} [{trip.vehiclePlate}]
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-850/80 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">{language === 'ar' ? 'خط السير الميداني:' : 'Logistics Route:'}</span>
                    <div className="space-y-0.5 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold truncate">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                        <span className="truncate">{trip.origin}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-white font-black truncate">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate">{trip.destination}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-850/80 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">{language === 'ar' ? 'مواصفات الشحنة والوقت:' : 'Cargo & Departure:'}</span>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{trip.cargoType}</span>
                      <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded font-black text-[10px]">
                        {trip.cargoWeightTons} طن
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-450 flex items-center gap-1 font-mono">
                      <Clock size={11} />
                      <span>{trip.departureTime} ➔ {trip.estimatedArrival}</span>
                    </div>
                  </div>
                </div>

                {/* Live Delivery / Driver Notes Notification Banner if available */}
                {trip.driverNotes && (
                  <div className="p-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/50 rounded-2xl text-[11px] flex items-center justify-between text-indigo-900 dark:text-indigo-200">
                    <div className="flex items-center gap-1.5">
                      <FileCheck size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span><strong>{language === 'ar' ? 'ملاحظة السائق الميدانية:' : 'Driver Note:'}</strong> {trip.driverNotes}</span>
                    </div>
                    {trip.recipientName && (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        {language === 'ar' ? `المستلم: ${trip.recipientName}` : `Recipient: ${trip.recipientName}`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: DISPATCH NEW TRIP TO DRIVER */}
      <AnimatePresence>
        {isDispatchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f1422] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Send size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {language === 'ar' ? 'إرسال وجدولة رحلة جديدة لسائق' : 'Dispatch New Freight Trip'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      {language === 'ar' ? 'سيتم تعيين الشاحنة والمسار وإرسال الإشعار فوراً لحساب السائق' : 'Trip order will be instantly pushed to driver portal'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {dispatchSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {language === 'ar' ? 'تم إرسال وجدولة الرحلة للسائق بنجاح!' : 'Mission Dispatched to Driver Successfully!'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {language === 'ar' ? 'أصبحت المهمة ظاهرة الآن في بوابة وهاتف السائق وتطبيق الملاحة.' : 'Available in real-time in driver cockpit.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDispatchTripSubmit} className="space-y-4">
                  
                  {/* Select Driver & Project */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <User size={13} className="text-indigo-500" />
                        <span>{language === 'ar' ? 'اختيار السائق المعين للرحلة:' : 'Assign Driver:'}</span>
                      </label>
                      <select
                        value={selectedDriverId}
                        onChange={(e) => setSelectedDriverId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                      >
                        {DEFAULT_DRIVERS.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.role}) - [{d.plate}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Building2 size={13} className="text-indigo-500" />
                        <span>{language === 'ar' ? 'المشروع التابع للرحلة:' : 'Assigned Project:'}</span>
                      </label>
                      <select
                        value={selectedProjectId}
                        onChange={(e) => handleProjectSelectChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                      >
                        {DEFAULT_PROJECTS.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Origin and Destination */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'نقطة الانطلاق والتحميل (Origin):' : 'Origin / Loading Depot:'}
                      </label>
                      <input
                        type="text"
                        required
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'وجهة التسليم والتفريغ (Destination):' : 'Destination Site:'}
                      </label>
                      <input
                        type="text"
                        required
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* Cargo Details & Weight */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'نوع ومواصفات الشحنة المنقولة:' : 'Cargo Spec:'}
                      </label>
                      <input
                        type="text"
                        required
                        value={cargoType}
                        onChange={(e) => setCargoType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'الوزن (طن):' : 'Weight (Tons):'}
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={65}
                        value={cargoWeightTons}
                        onChange={(e) => setCargoWeightTons(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* Departure & Arrival Times */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'موعد الانطلاق المجدول:' : 'Departure Time:'}
                      </label>
                      <input
                        type="text"
                        required
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'زمن الوصول المتوقع (ETA):' : 'Estimated Arrival:'}
                      </label>
                      <input
                        type="text"
                        required
                        value={estimatedArrival}
                        onChange={(e) => setEstimatedArrival(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                        {language === 'ar' ? 'درجة الأولوية / الخطورة:' : 'Urgency Level:'}
                      </label>
                      <select
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="normal">{language === 'ar' ? 'نقل قياسي اعتيادي' : 'Normal Freight'}</option>
                        <option value="express">{language === 'ar' ? 'عاجل فوري (Express)' : 'Express / Priority'}</option>
                        <option value="hazardous">{language === 'ar' ? 'مواد خطرة وتحتاج تصريح' : 'Hazardous Materials'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Send size={15} />
                      <span>{language === 'ar' ? 'إرسال أمر الرحلة إلى السائق الآن' : 'Dispatch Order to Driver'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDispatchModalOpen(false)}
                      className="px-5 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-2xl cursor-pointer"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: TRIP DETAILS & WAYPOINTS */}
      <AnimatePresence>
        {selectedTripDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f1422] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                <div>
                  <span className="text-[10px] font-mono text-indigo-500 font-bold">{selectedTripDetails.tripCode}</span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{selectedTripDetails.projectName}</h3>
                </div>
                <button
                  onClick={() => setSelectedTripDetails(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Waypoints Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Compass size={14} className="text-indigo-500" />
                  <span>{language === 'ar' ? 'محطات المسار ونقاط التفتيش:' : 'Waypoints & Checkpoints:'}</span>
                </h4>
                <div className="space-y-2">
                  {selectedTripDetails.waypoints.map((wp, idx) => (
                    <div key={wp.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          wp.status === 'reached' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-black text-slate-800 dark:text-white block">{wp.name}</span>
                          <span className="text-[9.5px] text-slate-450">{wp.type}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        wp.status === 'reached' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {wp.status === 'reached' ? (language === 'ar' ? 'تم الوصول ✓' : 'Reached') : (language === 'ar' ? 'قيد الانتظار' : 'Pending')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedTripDetails(null)}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-xs rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
