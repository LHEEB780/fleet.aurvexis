import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Navigation, 
  ChevronRight, 
  ArrowRight, 
  Search, 
  Filter, 
  Fuel, 
  Gauge, 
  FileText, 
  Plus, 
  Play, 
  Pause, 
  RotateCcw,
  CheckSquare,
  Building2,
  Package,
  Layers,
  Sparkles,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../services/LanguageContext';
import { DriverTrip } from '../../types';

interface DriverTripsLogProps {
  trips: DriverTrip[];
  activeTrip: DriverTrip | null;
  onSelectActiveTrip: (trip: DriverTrip) => void;
  onUpdateTripStatus: (tripId: string, status: DriverTrip['status'], note?: string) => void;
  onAddNewTrip: (newTrip: DriverTrip) => void;
}

export default function DriverTripsLog({
  trips,
  activeTrip,
  onSelectActiveTrip,
  onUpdateTripStatus,
  onAddNewTrip
}: DriverTripsLogProps) {
  const { language, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');
  const [searchTerm, setSearchTerm] = useState('');

  const filterTrips = (statusList: string[]) => {
    return trips.filter(t => {
      const matchStatus = statusList.includes(t.status);
      const matchSearch = searchTerm.trim() === '' ||
        t.tripCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.origin.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  };

  const upcomingTrips = filterTrips(['scheduled']);
  const completedTrips = filterTrips(['completed', 'delivered']);

  // Summary Metrics
  const totalCompletedDistance = trips
    .filter(t => t.status === 'completed' || t.status === 'delivered')
    .reduce((sum, t) => sum + (t.totalDistanceKm || 0), 0);

  const totalTonsCarried = trips
    .reduce((sum, t) => sum + (t.cargoWeightTons || 0), 0);

  return (
    <div className="space-y-6" dir={dir}>
      
      {/* Top Metrics Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#0f1422] p-4 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black">{language === 'ar' ? 'إجمالي الرحلات' : 'Total Missions'}</span>
            <Truck size={15} className="text-indigo-500" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{trips.length}</span>
            <span className="block text-[8px] text-slate-400 font-bold uppercase">{language === 'ar' ? 'رحلة مسجلة' : 'Recorded'}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f1422] p-4 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black">{language === 'ar' ? 'المسافة المنجزة' : 'Total Distance'}</span>
            <Gauge size={15} className="text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{totalCompletedDistance.toLocaleString()}</span>
            <span className="block text-[8px] text-slate-400 font-bold uppercase">{language === 'ar' ? 'كيلومتر (KM)' : 'Kilometers'}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f1422] p-4 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black">{language === 'ar' ? 'إجمالي الحمولات' : 'Cargo Transported'}</span>
            <Package size={15} className="text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{totalTonsCarried}</span>
            <span className="block text-[8px] text-slate-400 font-bold uppercase">{language === 'ar' ? 'طن حمولة' : 'Tons'}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f1422] p-4 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black">{language === 'ar' ? 'الالتزام بالمواعيد' : 'On-Time Rate'}</span>
            <Sparkles size={15} className="text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">98.4%</span>
            <span className="block text-[8px] text-slate-400 font-bold uppercase">{language === 'ar' ? 'تقييم ممتاز' : 'Grade A'}</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter Header */}
      <div className="bg-white dark:bg-[#0f1422] p-3 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl w-full sm:w-auto">
          {[
            { id: 'active', labelAr: 'الرحلة الحالية 🚚', labelEn: 'Active Trip 🚚' },
            { id: 'upcoming', labelAr: `المجدولة من الإدارة (${upcomingTrips.length})`, labelEn: `Dispatched (${upcomingTrips.length})` },
            { id: 'completed', labelAr: `السجل وإثبات التسليم POD (${completedTrips.length})`, labelEn: `Delivered POD (${completedTrips.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-3xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {language === 'ar' ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ar' ? 'بحث في الرحلات أو الوجهة...' : 'Search trips or destination...'}
            className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Tab 1: Active Trip Details */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeTrip ? (
            <div className="bg-white dark:bg-[#0f1422] rounded-[2.5rem] p-6 border border-purple-500/30 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700" />

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-black">
                      {activeTrip.tripCode}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black">
                      {activeTrip.projectName}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                    {language === 'ar' ? `${activeTrip.origin} ➔ ${activeTrip.destination}` : `${activeTrip.originEn} ➔ ${activeTrip.destinationEn}`}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {activeTrip.status === 'in_progress' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl text-xs font-black">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                      <span>{language === 'ar' ? 'الرحلة قيد التنفيذ والملاحة' : 'In Progress & Navigating'}</span>
                    </span>
                  ) : activeTrip.status === 'paused' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 rounded-2xl text-xs font-black">
                      <span>{language === 'ar' ? 'متوقف لاستراحة مؤقتة ☕' : 'Paused for Rest ☕'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-2xl text-xs font-black">
                      <span>{language === 'ar' ? 'مجدولة وجاهزة للانطلاق' : 'Scheduled & Ready'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Trip Key Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400">{language === 'ar' ? 'نوع الحمولة والوزن:' : 'Cargo & Weight:'}</span>
                  <p className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1">
                    <Package size={13} className="text-amber-500" />
                    <span>{activeTrip.cargoType} ({activeTrip.cargoWeightTons} {language === 'ar' ? 'طن' : 'Tons'})</span>
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400">{language === 'ar' ? 'المركبة المخصصة:' : 'Allocated Vehicle:'}</span>
                  <p className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1">
                    <Truck size={13} className="text-purple-500" />
                    <span>{activeTrip.vehiclePlate}</span>
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400">{language === 'ar' ? 'المسافة الكلية المخططة:' : 'Total Distance:'}</span>
                  <p className="text-xs font-black text-purple-600 dark:text-purple-400 font-mono">
                    {activeTrip.totalDistanceKm} KM
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-400">{language === 'ar' ? 'وقت الانطلاق والوصول المتوقع:' : 'Schedule Timing:'}</span>
                  <p className="text-xs font-black text-slate-800 dark:text-white font-mono">
                    {activeTrip.departureTime.split(' ')[1] || '08:00'} ➔ {activeTrip.estimatedArrival.split(' ')[1] || '12:30'}
                  </p>
                </div>
              </div>

              {/* Waypoints Flow */}
              <div className="space-y-2">
                <span className="block text-xs font-black text-slate-700 dark:text-slate-300">
                  {language === 'ar' ? 'محطات ونقاط التوقف على المسار (Waypoints):' : 'Route Waypoints & Milestones:'}
                </span>

                <div className="space-y-2">
                  {activeTrip.waypoints.map((wp, idx) => (
                    <div key={wp.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                          wp.status === 'reached' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 dark:text-white">
                            {language === 'ar' ? wp.name : wp.nameEn}
                          </h4>
                          <span className="text-[9px] text-slate-400 font-semibold uppercase">{wp.type}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${
                        wp.status === 'reached' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {wp.status === 'reached' ? (language === 'ar' ? 'تم العبور ✓' : 'Reached ✓') : (language === 'ar' ? 'قيد الانتظار' : 'Pending')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {activeTrip.status !== 'in_progress' ? (
                  <button
                    onClick={() => onUpdateTripStatus(activeTrip.id, 'in_progress', 'بدء قيادة الرحلة')}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play size={14} />
                    <span>{language === 'ar' ? 'بدء تحرك الرحلة الآن 🟢' : 'Start Trip Now 🟢'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateTripStatus(activeTrip.id, 'paused', 'استراحة مؤقتة')}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Pause size={14} />
                    <span>{language === 'ar' ? 'أخذ استراحة سائق ☕' : 'Take Break ☕'}</span>
                  </button>
                )}

                <button
                  onClick={() => onUpdateTripStatus(activeTrip.id, 'delivered', 'تم تسليم الحمولة بنجاح')}
                  className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 active:scale-95 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>{language === 'ar' ? 'تسليم الشحنة في الموقع 📦' : 'Deliver Cargo 📦'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0f1422] p-8 rounded-3xl border border-slate-100 dark:border-slate-850 text-center space-y-3">
              <Truck size={36} className="text-slate-300 mx-auto" />
              <h4 className="text-sm font-black text-slate-800 dark:text-white">
                {language === 'ar' ? 'لا توجد رحلة نشطة حالياً' : 'No Active Mission in Progress'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {language === 'ar' ? 'يمكنك اختيار رحلة من قائمة الرحلات المجدولة أو إنشاء مهمة نقل جديدة.' : 'Select a scheduled mission or create a new self-dispatch mission.'}
              </p>
              <button
                onClick={() => setActiveTab('upcoming')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black"
              >
                {language === 'ar' ? 'استعراض الرحلات المجدولة' : 'View Upcoming Trips'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Upcoming Scheduled Trips */}
      {activeTab === 'upcoming' && (
        <div className="space-y-3">
          {upcomingTrips.length === 0 ? (
            <div className="bg-white dark:bg-[#0f1422] p-8 rounded-3xl border border-slate-100 dark:border-slate-850 text-center space-y-2">
              <Calendar size={32} className="text-slate-300 mx-auto" />
              <h4 className="text-xs font-black text-slate-800 dark:text-white">
                {language === 'ar' ? 'لا توجد رحلات مجدولة إضافية حالياً' : 'No upcoming scheduled trips found'}
              </h4>
            </div>
          ) : (
            upcomingTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white dark:bg-[#0f1422] p-5 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs hover:border-indigo-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md text-[9px] font-black">
                      {trip.tripCode}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {trip.departureTime}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {trip.projectName} • {trip.origin} ➔ {trip.destination}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-semibold">
                    <span>📦 {trip.cargoType} ({trip.cargoWeightTons} طن)</span>
                    <span>🛣️ {trip.totalDistanceKm} KM</span>
                    <span>🚛 {trip.vehiclePlate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectActiveTrip(trip);
                      onUpdateTripStatus(trip.id, 'in_progress', 'تم بدء الرحلة من المجدولة');
                      setActiveTab('active');
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20 active:scale-95"
                  >
                    <Play size={13} />
                    <span>{language === 'ar' ? 'تفعيل وبدء الرحلة' : 'Activate & Start'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Completed Trips History Archive */}
      {activeTab === 'completed' && (
        <div className="space-y-3">
          {completedTrips.length === 0 ? (
            <div className="bg-white dark:bg-[#0f1422] p-8 rounded-3xl border border-slate-100 dark:border-slate-850 text-center space-y-2">
              <CheckCircle2 size={32} className="text-slate-300 mx-auto" />
              <h4 className="text-xs font-black text-slate-800 dark:text-white">
                {language === 'ar' ? 'لم يتم العثور على سجل رحلات سابقة' : 'No completed trips in archive'}
              </h4>
            </div>
          ) : (
            completedTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white dark:bg-[#0f1422] p-4.5 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-800 dark:text-white">{trip.tripCode}</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-md text-[9px] font-black">
                      {language === 'ar' ? 'مكتملة ومسلّمة ✓' : 'Completed ✓'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{trip.departureTime}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white">
                    {trip.projectName} • {trip.origin} ➔ {trip.destination}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {language === 'ar' ? `المسافة: ${trip.totalDistanceKm} كم • الحمولة: ${trip.cargoWeightTons} طن • استهلاك الوقود: ~${trip.fuelConsumedLiters || 38} لتر` : `Distance: ${trip.totalDistanceKm} km • Cargo: ${trip.cargoWeightTons} tons`}
                  </p>
                </div>

                <div className="text-left">
                  <span className="block text-[8px] text-slate-400 font-black uppercase">{language === 'ar' ? 'المستلم المعتمد' : 'Receipt'}</span>
                  <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">{trip.recipientName || 'إدارة الموقع الميداني'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Centralized Dispatch Live Sync Notice */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 dark:from-[#0d1224] dark:via-[#14122d] dark:to-[#0d1224] rounded-3xl p-4.5 border-2 border-indigo-200/90 dark:border-indigo-800/60 shadow-md shadow-indigo-100/60 dark:shadow-none flex flex-col sm:flex-row items-center justify-between gap-4 text-xs transition-all">
        <div className="flex items-center gap-3.5 text-slate-900 dark:text-white w-full sm:w-auto">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
            <Sparkles size={20} className="text-amber-300" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm block">
                {language === 'ar' ? 'الرحلات والمهمات تصدر وتُسند مركزياً من الإدارة' : 'Missions are centrally dispatched by Management'}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white dark:bg-indigo-500/30 dark:text-indigo-300 text-[10px] font-black shadow-xs">
                {language === 'ar' ? 'توصية وتوجيه ذكي' : 'Smart Dispatch'}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-indigo-200 font-semibold leading-relaxed">
              {language === 'ar' ? 'تظهر أي رحلة جديدة تسندها الإدارة في حسابك فوراً مع خط السير والتوجيه الملاحي المباشر.' : 'Any dispatched trip appears here immediately with turn-by-turn navigation.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-600 dark:border-emerald-500/40 rounded-full text-xs font-black shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white dark:bg-emerald-400"></span>
            </span>
            <span>{language === 'ar' ? 'متزامن لحظياً ✓' : 'Live Synced ✓'}</span>
          </span>
        </div>
      </div>

    </div>
  );
}
