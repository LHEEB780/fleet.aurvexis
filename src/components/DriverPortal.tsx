import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Truck, 
  ClipboardCheck, 
  Wrench, 
  AlertTriangle, 
  Award, 
  MapPin, 
  Clock, 
  Gauge, 
  Droplet, 
  ShieldCheck, 
  TrendingUp, 
  Send, 
  FileText, 
  Signature, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Camera,
  LogOut,
  Calendar,
  Shield,
  ChevronDown
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { useLanguage } from '../services/LanguageContext';
import { User as AppUser, UserRole, Vehicle, Driver } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface DriverPortalProps {
  user: AppUser;
  onLogout: () => void;
  isDarkMode: boolean;
  onRoleChange?: (role: UserRole) => void;
}

export default function DriverPortal({ user, onLogout, isDarkMode, onRoleChange }: DriverPortalProps) {
  const { language, t, dir } = useLanguage();
  
  // Tabs: 'home' | 'checklist' | 'report' | 'history'
  const [activeSubTab, setActiveSubTab] = useState<'home' | 'checklist' | 'report' | 'history'>('home');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  
  // Mock Driver States
  const [safetyScore, setSafetyScore] = useState(94);
  const [totalTrips, setTotalTrips] = useState(184);
  const [odometer, setOdometer] = useState(124850);
  const [fuelLevel, setFuelLevel] = useState(82);
  const [isDriving, setIsDriving] = useState(false);
  const [activeTripMinutes, setActiveTripMinutes] = useState(0);
  
  // Checklist State
  const [checklistType, setChecklistType] = useState<'pre' | 'post'>('pre');
  const [inspectedVehicle, setInspectedVehicle] = useState('toyota-hilux');
  const [checklistValues, setChecklistValues] = useState({
    brakes: 'ok',
    engine: 'ok',
    tires: 'ok',
    lights: 'ok',
    cleanliness: 'ok',
    fluids: 'ok',
  });
  const [checklistNotes, setChecklistNotes] = useState('');
  const [signatureName, setSignatureName] = useState(user.name);
  const [checklistSubmitted, setChecklistSubmitted] = useState(false);
  
  // Fault Report State
  const [reportCategory, setReportCategory] = useState('mechanical');
  const [reportPriority, setReportPriority] = useState('medium');
  const [reportDesc, setReportDesc] = useState('');
  const [reportVehicle, setReportVehicle] = useState('toyota-hilux');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [obdCode, setObdCode] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [obdError, setObdError] = useState('');
  
  // History of Submitted records (initialized with some mock logs)
  const [submittedHandovers, setSubmittedHandovers] = useState<any[]>([
    {
      id: 'HO-9812',
      date: '2026-05-29',
      type: 'pre',
      vehicle: 'تويوتا هيلوكس HD - [ب ل ط ٧٧٦]',
      status: 'approved',
      notes: 'المركبة نظيفة وجاهزة للمسار اليومي.'
    },
    {
      id: 'HO-9743',
      date: '2026-05-28',
      type: 'post',
      vehicle: 'تويوتا هيلوكس HD - [ب ل ط ٧٧٦]',
      status: 'approved',
      notes: 'تم إعادة السيارة مع نقص بسيط في ضغط الإطار الخلفي الأيمن.'
    }
  ]);
  
  const [submittedFaults, setSubmittedFaults] = useState<any[]>(() => {
    const saved = localStorage.getItem('driver_submitted_faults');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'FLT-4432',
        date: '2026-05-25',
        category: 'electrical',
        vehicle: 'تويوتا هيلوكس HD - [ب ل ط ٧٧٦]',
        priority: 'low',
        status: 'resolved',
        desc: 'مصباح الضباب الأمامي الأيمن لا يعمل بشكل مستمر.',
        resolution: 'تم استبدال المصباح التالف بآخر جديد في ورشة الصيانة المركزية.'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('driver_submitted_faults', JSON.stringify(submittedFaults));
  }, [submittedFaults]);

  // Trip simulator clock interval
  useEffect(() => {
    let timer: any;
    if (isDriving) {
      timer = setInterval(() => {
        setActiveTripMinutes(prev => prev + 1);
        setOdometer(prev => prev + 1);
        if (Math.random() > 0.7) {
          setFuelLevel(prev => Math.max(prev - 1, 5));
        }
        // Randomly simulate slight fluctuations in safety score as a fun dashboard mechanic
        if (Math.random() > 0.9) {
          setSafetyScore(prev => Math.max(70, Math.min(100, prev + (Math.random() > 0.5 ? 1 : -1))));
        }
      }, 3000); // 3 seconds = 1 virtual minute
    } else {
      setActiveTripMinutes(0);
    }
    return () => clearInterval(timer);
  }, [isDriving]);

  // Radar chart data reflecting the safety performance
  const performanceData = [
    { subject: language === 'ar' ? 'الالتزام بالسرعة' : 'Speed Limit', score: safetyScore },
    { subject: language === 'ar' ? 'الفرامل الآمنة' : 'Safe Braking', score: 91 },
    { subject: language === 'ar' ? 'التسارع الهادئ' : 'Gentle Accel', score: 95 },
    { subject: language === 'ar' ? 'سلامة الآلية' : 'Vehicle Care', score: 88 },
    { subject: language === 'ar' ? 'اقتصاد الوقود' : 'Fuel Economy', score: 84 },
    { subject: language === 'ar' ? 'الالتزام بالمسار' : 'Route Adherence', score: 96 }
  ];

  const handleStartTrip = () => {
    setIsDriving(prev => !prev);
    if (!isDriving) {
      setTotalTrips(prev => prev + 1);
    }
  };

  const handleChecklistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newHO = {
      id: 'HO-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().split('T')[0],
      type: checklistType,
      vehicle: inspectedVehicle === 'toyota-hilux' ? 'تويوتا هيلوكس HD - [ب ل ط ٧٧٦]' : 'مرسيدس أكتروس ثقيل - [م ط ر ٠١٢]',
      status: 'pending',
      notes: checklistNotes || (language === 'ar' ? 'تم الفحص بنجاح بدون مشاكل حرجة.' : 'Inspected successfully with no critical issues.')
    };
    setSubmittedHandovers([newHO, ...submittedHandovers]);
    setChecklistSubmitted(true);
    setTimeout(() => {
      setChecklistSubmitted(false);
      setActiveSubTab('history');
      // Reset form
      setChecklistNotes('');
    }, 2000);
  };

  const handleFaultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDesc.trim()) return;
    
    if (obdCode.trim() !== '') {
      const obdPattern = /^[pPcCbBuU][0-9]{4}$/;
      if (!obdPattern.test(obdCode.trim())) {
        setObdError(
          language === 'ar'
            ? 'كود عطل OBD-II غير صالح. يجب أن يتكون من حرف واحد (P, C, B, U) متبوعاً بـ 4 أرقام (مثال: P0300, P0171).'
            : 'Invalid OBD-II trouble code. Must start with one letter (P, C, B, U) followed by 4 digits (e.g., P0300, P0171).'
        );
        return;
      }
    }
    setObdError('');
    
    const faultId = 'FLT-' + Math.floor(1000 + Math.random() * 9000);
    const orderId = 'WO-' + Date.now();

    const newFault = {
      id: faultId,
      date: new Date().toISOString().split('T')[0],
      category: reportCategory,
      vehicle: reportVehicle === 'toyota-hilux' ? 'تويوتا هيلوكس HD - [ب ل ط ٧٧٦]' : 'مرسيدس أكتروس ثقيل - [م ط ر ٠١٢]',
      priority: reportPriority,
      status: 'pending',
      desc: reportDesc,
      photo: attachedPhoto,
      obdCode: obdCode.trim().toUpperCase(),
      symptom: selectedSymptom,
      orderId: orderId
    };

    // Construct MaintenanceOrder
    const newOrder: any = {
      id: orderId,
      vehicleId: reportVehicle,
      orderNumber: 'WO-2026-' + Math.floor(100 + Math.random() * 900),
      date: new Date().toISOString().split('T')[0],
      description: reportDesc,
      category: (reportCategory === 'tires' || reportCategory === 'brakes' ? reportCategory : 'mechanical') as any,
      status: 'pending',
      priority: reportPriority as any,
      progress: 0,
      milestones: [],
      isArchived: false,
      lastUpdate: new Date().toISOString(),
      obdCode: obdCode.trim().toUpperCase() || undefined,
      symptom: selectedSymptom || undefined,
      photoUrl: attachedPhoto || undefined
    };

    // Save maintenance order locally in fleet_maintenance_orders_v2
    const savedOrdersRaw = localStorage.getItem('fleet_maintenance_orders_v2');
    let currentOrders: any[] = [];
    if (savedOrdersRaw) {
      try {
        currentOrders = JSON.parse(savedOrdersRaw);
      } catch (err) {
        console.warn('Failed to parse existing orders:', err);
      }
    }
    const updatedOrders = [newOrder, ...currentOrders];
    localStorage.setItem('fleet_maintenance_orders_v2', JSON.stringify(updatedOrders));

    // Save to Firebase (Cloud Firestore) if available
    try {
      const { saveDocument, db: firestoreDb } = await import('../services/firebase');
      if (firestoreDb) {
        await saveDocument('maintenance_orders', orderId, newOrder);
        await saveDocument('fault_reports', faultId, newFault);
        console.log('Successfully saved new maintenance order and fault report to Firebase Firestore');
      }
    } catch (err) {
      console.warn('Firestore direct write failed, relies on auto-sync backup:', err);
    }
    
    setSubmittedFaults([newFault, ...submittedFaults]);
    setReportSubmitted(true);

    // Dispatch storage event to alert other components
    window.dispatchEvent(new Event('storage'));

    setTimeout(() => {
      setReportSubmitted(false);
      setActiveSubTab('history');
      // Reset form
      setReportDesc('');
      setAttachedPhoto(null);
      setObdCode('');
      setSelectedSymptom('');
    }, 2000);
  };

  const simulatePhotoUpload = () => {
    // Generate a beautiful mock base64/placeholder vector image for car maintenance
    const mockImages = [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=300&h=200',
      'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=80&w=300&h=200',
      'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=300&h=200'
    ];
    const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];
    setAttachedPhoto(randomImg);
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] dark:bg-[#080b11] text-slate-900 dark:text-slate-100 pb-16 font-sans">
      
      {/* Driver Portal Top Bar Header */}
      <div className="bg-white dark:bg-[#0f1422] border-b border-slate-100 dark:border-slate-850 px-4 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/20"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0f1422]" />
            </div>
            <div className="text-right">
              <h1 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{user.name}</span>
                <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-[9px] font-black">
                  {language === 'ar' ? 'سائق متاح' : 'Available Driver'}
                </span>
              </h1>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">{user.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-left hidden sm:block">
              <span className="block text-[8px] text-slate-400 font-black uppercase tracking-wider">{language === 'ar' ? 'بوابة السائق الفنية' : 'Driver Portal Live'}</span>
              <span className="block text-[10px] text-slate-600 dark:text-slate-400 font-mono font-bold">UTC: 2026-05-30</span>
            </div>

            {/* Quick Access / Mode Changer (Demo Only inside Driver Portal) */}
            {onRoleChange && (
              <div className="relative">
                <button 
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="h-10 flex items-center justify-center gap-1.5 px-3 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/90 dark:hover:bg-slate-700/95 border border-slate-200/40 dark:border-slate-700/60 rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
                >
                  <Shield size={14} className="text-brand-blue-600" />
                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 hidden md:block">
                    {language === 'ar' ? 'تبديل الصلاحية' : 'Change Role'}
                  </span>
                  <ChevronDown size={12} className={`text-slate-400 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {roleDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setRoleDropdownOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`absolute top-12 w-52 bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 rounded-2xl shadow-xl z-30 p-2 overflow-hidden ${
                          dir === 'rtl' ? 'left-0' : 'right-0'
                        }`}
                      >
                        <p className={`px-3 py-2 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-550 ${
                          dir === 'rtl' ? 'text-right' : 'text-left'
                        }`}>
                          {language === 'ar' ? 'تبديل الصلاحيات الفورية' : 'Instant Role Simulation'}
                        </p>
                        {[
                          { id: 'admin', labelAr: '🔑 مدير الصيانة (كامل الصلاحيات)', labelEn: '🔑 Maintenance Admin (Full)' },
                          { id: 'technician', labelAr: '🔧 فني ميكانيك أول', labelEn: '🔧 Lead Technician' },
                          { id: 'viewer', labelAr: '👁️ مراقب جودة ونظام (معاينة)', labelEn: '👁️ Quality Observer (Read-only)' },
                          { id: 'driver', labelAr: '🚛 سائق نقل ثقيل (البوابة الحالية)', labelEn: '🚛 Heavy Truck Driver (Active)' }
                        ].map((r) => (
                          <button
                            key={r.id}
                            onClick={() => {
                              onRoleChange(r.id as UserRole);
                              setRoleDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-[11px] font-black rounded-xl transition-colors ${
                              dir === 'rtl' ? 'text-right' : 'text-left'
                            } ${
                              user.role === r.id 
                                ? 'bg-brand-blue-50 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {language === 'ar' ? r.labelAr : r.labelEn}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            <button
              onClick={onLogout}
              className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-1"
              title={language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            >
              <LogOut size={14} />
              <span className="text-[10px] font-black hidden sm:inline">{language === 'ar' ? 'خروج' : 'Exit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Driver Welcome Banner */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full -translate-x-6 translate-y-6" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 text-right">
              <span className="px-2 py-0.5 bg-white/20 text-white rounded-full text-[9px] font-black uppercase tracking-wider">
                {language === 'ar' ? 'نظام تفتيش الأسطول الفوري' : 'Fleet Inspect System'}
              </span>
              <h2 className="text-lg font-black mt-1">
                {language === 'ar' ? `أهلاً بك مجدداً، خالد الكعبي` : `Welcome back, Khaled Al-Kaabi`}
              </h2>
              <p className="text-xs text-white/95 font-medium leading-relaxed max-w-md">
                {language === 'ar' 
                  ? 'بوابتك الذكية لإكمال فحوصات المركبة اليومية، الإبلاغ الفوري عن أعطال الطريق، ومتابعة مؤشر سلامة القيادة الخاص بك.' 
                  : 'Your intelligent hub to complete daily vehicle handovers, report roadside maintenance issues, and track driving metrics.'}
              </p>
            </div>
            
            {/* Driving Session Control Widget */}
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center gap-4 shrink-0 text-right">
              <div>
                <span className="block text-[9px] text-white/80 font-black">{language === 'ar' ? 'الحالة الحركية' : 'Movement Status'}</span>
                {isDriving ? (
                  <div className="flex items-center gap-1.5 mt-0.5 text-emerald-300 font-black text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{language === 'ar' ? 'جاري قيادة الرحلة...' : 'Driving Route...'}</span>
                  </div>
                ) : (
                  <span className="block text-xs font-black text-slate-100 mt-0.5">{language === 'ar' ? 'متوقف / جاهز' : 'Parked / Ready'}</span>
                )}
                {isDriving && (
                  <span className="block text-[9px] font-mono text-emerald-200 mt-0.5">
                    {language === 'ar' ? `المدة الحالية: ${activeTripMinutes} دقيقة` : `Duration: ${activeTripMinutes} min`}
                  </span>
                )}
              </div>
              <button
                onClick={handleStartTrip}
                className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                  isDriving 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/10' 
                    : 'bg-white text-indigo-950 hover:bg-indigo-50 shadow-white/10'
                }`}
              >
                <Play size={12} className={isDriving ? 'animate-pulse' : ''} />
                <span>
                  {isDriving 
                    ? (language === 'ar' ? 'إنهاء الرحلة' : 'End Route') 
                    : (language === 'ar' ? 'ابدأ رحلة قيادة' : 'Start Route')
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Portal Sub Navigation Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex bg-white dark:bg-[#0f1422] p-1.5 rounded-2xl border border-slate-100 dark:border-slate-850/80 shadow-sm font-sans">
          {[
            { id: 'home', labelAr: 'لوحة القيادة والمؤشرات', labelEn: 'Dashboard & Metrics', icon: <Award size={15} /> },
            { id: 'checklist', labelAr: 'فحص واستلام الآلية', labelEn: 'Vehicle Inspection', icon: <ClipboardCheck size={15} /> },
            { id: 'report', labelAr: 'إبلاغ عن عطل فني', labelEn: 'Report Vehicle Fault', icon: <Wrench size={15} /> },
            { id: 'history', labelAr: 'سجل فحوصاتي وبلاغاتي', labelEn: 'My Activity Logs', icon: <FileText size={15} /> },
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as any);
                }}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-3xs' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
                <span className="sm:hidden text-[9px]">{language === 'ar' ? tab.labelAr.split(' ')[0] : tab.labelEn.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area Rendering with Animations */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: HOME & DRIVER DASHBOARD */}
          {activeSubTab === 'home' && (
            <motion.div
              key="driver-home-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right"
            >
              {/* Column 1 & 2: Stats & Performance */}
              <div className="md:col-span-2 space-y-6">
                
                {/* 1. Quick Info stats grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-[#0f1422] p-4 rounded-3xl border border-slate-100 dark:border-slate-850/80 shadow-2xs flex flex-col justify-between">
                    <div className="text-slate-400 dark:text-slate-500 flex items-center justify-between">
                      <span className="text-[10px] font-black">{language === 'ar' ? 'عداد المسافة' : 'Odometer'}</span>
                      <Gauge size={14} className="text-indigo-500" />
                    </div>
                    <div className="mt-3">
                      <span className="block text-base font-black font-mono text-slate-800 dark:text-white">
                        {odometer.toLocaleString()}
                      </span>
                      <span className="block text-[8px] text-slate-400 font-bold uppercase mt-0.5">{language === 'ar' ? 'كيلومتر' : 'KM'}</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#0f1422] p-4 rounded-3xl border border-slate-100 dark:border-slate-850/80 shadow-2xs flex flex-col justify-between">
                    <div className="text-slate-400 dark:text-slate-500 flex items-center justify-between">
                      <span className="text-[10px] font-black">{language === 'ar' ? 'مستوى الوقود' : 'Fuel Level'}</span>
                      <Droplet size={14} className="text-amber-500" />
                    </div>
                    <div className="mt-3">
                      <div className="flex items-end justify-between">
                        <span className="block text-base font-black font-mono text-slate-800 dark:text-white">{fuelLevel}%</span>
                        <div className="w-1.5 h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1 flex flex-col justify-end">
                          <div 
                            className={`w-full rounded-full transition-all duration-500 ${fuelLevel < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                            style={{ height: `${fuelLevel}%` }}
                          />
                        </div>
                      </div>
                      <span className="block text-[8px] text-slate-400 font-bold uppercase mt-0.5">
                        {fuelLevel < 20 ? (language === 'ar' ? 'تزود بالوقود!' : 'Refuel Required!') : (language === 'ar' ? 'مستقر' : 'Stable')}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#0f1422] p-4 rounded-3xl border border-slate-100 dark:border-slate-850/80 shadow-2xs flex flex-col justify-between">
                    <div className="text-slate-400 dark:text-slate-500 flex items-center justify-between">
                      <span className="text-[10px] font-black">{language === 'ar' ? 'الرحلات الكلية' : 'Total Trips'}</span>
                      <TrendingUp size={14} className="text-emerald-500" />
                    </div>
                    <div className="mt-3">
                      <span className="block text-base font-black font-mono text-slate-800 dark:text-white">{totalTrips}</span>
                      <span className="block text-[8px] text-slate-400 font-bold uppercase mt-0.5">{language === 'ar' ? 'رحلة مأمنة' : 'Completed'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Driving performance radar chart */}
                <div className="bg-white dark:bg-[#0f1422] p-5 rounded-3xl border border-slate-100 dark:border-slate-850/80 shadow-2xs">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-850/80 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                        <Award size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-850 dark:text-white">
                          {language === 'ar' ? 'تحليل سلوك القيادة الآمنة' : 'Safe Driving Behavior Analysis'}
                        </h3>
                        <p className="text-[9.5px] text-slate-400 font-semibold">{language === 'ar' ? 'مستخلص من تفاعلات الحساسات والتسارع' : 'Calculated from live telemetrics'}</p>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="block text-[9px] text-slate-400 font-black uppercase">{language === 'ar' ? 'مؤشر السلامة الكلي' : 'Safety Index Score'}</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{safetyScore}/100</span>
                    </div>
                  </div>

                  <div className="h-[250px] w-full flex items-center justify-center font-sans">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 10, fontWeight: 'bold' }} 
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
                        <Radar 
                          name="Khaled" 
                          dataKey="score" 
                          stroke="#10b981" 
                          fill="#10b981" 
                          fillOpacity={0.25} 
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 text-[10px] text-slate-550 dark:text-slate-400 font-semibold leading-relaxed mt-2 flex items-start gap-2">
                    <Sparkles size={14} className="text-emerald-500 shrink-0 mt-0.5 animate-spin-slow" />
                    <div>
                      {language === 'ar' 
                        ? 'مستوى قيادتك في المنطقة الخضراء الممتازة (A+). تم تسجيل التزام تام بحد السرعة القانونية في آخر ٤٥ رحلة. مكافأة السلامة الشهرية مستحقة تلقائياً.'
                        : 'Your driving safety rating is in the excellent green zone (A+). No speeding or aggressive braking infractions recorded in your last 45 trips.'}
                    </div>
                  </div>
                </div>

              </div>

              {/* Column 3: Assigned Vehicle Information card */}
              <div className="space-y-6">
                
                {/* Vehicle specifications card */}
                <div className="bg-white dark:bg-[#0f1422] p-5 rounded-3xl border border-slate-100 dark:border-slate-850/80 shadow-2xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-500" />
                  
                  <h3 className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-850/80 mb-4">
                    <Truck size={14} className="text-slate-400" />
                    <span>{language === 'ar' ? 'المركبة المخصصة لك' : 'Your Assigned Vehicle'}</span>
                  </h3>

                  <div className="text-center pb-4">
                    <img 
                      src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=300" 
                      alt="Toyota Hilux" 
                      className="w-full h-28 object-cover rounded-2xl border border-slate-100 dark:border-slate-850 mb-3"
                    />
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      {language === 'ar' ? 'تويوتا هيلوكس بيك آب HD' : 'Toyota Hilux Heavy Duty'}
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black mt-1">
                      {language === 'ar' ? 'لوحة: ب ل ط ٧٧٦' : 'Plate: B-L-T 776'}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs font-sans">
                    <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-slate-50 dark:border-slate-900">
                      <span className="text-slate-400 font-semibold">{language === 'ar' ? 'الحالة الميكانيكية' : 'Mechanical State'}</span>
                      <span className="font-extrabold text-emerald-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {language === 'ar' ? 'ممتازة' : 'Excellent'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-slate-50 dark:border-slate-900">
                      <span className="text-slate-400 font-semibold">{language === 'ar' ? 'تأمين الترخيص' : 'License Expiry'}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">2027-11-20</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-semibold">{language === 'ar' ? 'الصيانة الوقائية القادمة' : 'Next PM Limit'}</span>
                      <span className="font-bold text-amber-500 font-mono">128,000 KM</span>
                    </div>
                  </div>
                </div>

                {/* Live System Safety notice card */}
                <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 p-4 rounded-3xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs">
                    <ShieldCheck size={14} />
                    <span>{language === 'ar' ? 'تعليمات السلامة الصيفية' : 'Summer Safety Mandate'}</span>
                  </div>
                  <p className="text-[10px] text-slate-650 dark:text-slate-400 font-semibold leading-relaxed">
                    {language === 'ar' 
                      ? 'بسبب ارتفاع درجات الحرارة ميدانياً، يرجى فحص ضغط الإطارات يومياً قبل التحرك، والتحقق من عدم انخفاض سائل التبريد بالرادياتير لضمان سلامتك وسلاسة النقل.'
                      : 'Due to high summer temperatures, please check tire pressure daily and ensure engine coolant levels are stable before commencing any intercity freight trip.'}
                  </p>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: DIGITAL VEHICLE HANDOVER CHECKLIST */}
          {activeSubTab === 'checklist' && (
            <motion.div
              key="driver-checklist-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-xl mx-auto bg-white dark:bg-[#0f1422] p-6 rounded-[2rem] border border-slate-100 dark:border-slate-850/80 shadow-sm text-right"
            >
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-850 mb-5">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <ClipboardCheck size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">
                    {language === 'ar' ? 'طلب فحص وتسليم المركبة فنيّاً' : 'Digital Vehicle Inspection Checklist'}
                  </h3>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">{language === 'ar' ? 'سجل الفحص قبل الرحلة (استلام العجلات) أو بعد الرحلة (إعادة)' : 'Log pre-trip or post-trip vehicle health report'}</p>
                </div>
              </div>

              {checklistSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-sm font-black text-slate-850 dark:text-white">
                    {language === 'ar' ? 'تم تقديم سجل الفحص بنجاح!' : 'Inspection Log Submitted Successfully!'}
                  </h4>
                  <p className="text-xs text-slate-450 font-semibold max-w-xs mx-auto">
                    {language === 'ar' 
                      ? 'تم تسجيل فحص العجلات في قاعدة البيانات وتم إخطار قسم الصيانة المركزية فوراً.' 
                      : 'Your checklist is logged in our central database and transmitted to workshops dispatch.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleChecklistSubmit} className="space-y-4 font-sans">
                  
                  {/* Select parameters */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                        {language === 'ar' ? 'نوع الفحص المعتمد' : 'Inspection Timing'}
                      </label>
                      <div className="grid grid-cols-2 gap-1 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setChecklistType('pre')}
                          className={`py-1.5 rounded-lg text-[10px] font-black text-center transition-all ${checklistType === 'pre' ? 'bg-white dark:bg-[#0f1422] text-emerald-600 shadow-3xs' : 'text-slate-500'}`}
                        >
                          {language === 'ar' ? 'قبل الانطلاق' : 'Pre-Trip'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setChecklistType('post')}
                          className={`py-1.5 rounded-lg text-[10px] font-black text-center transition-all ${checklistType === 'post' ? 'bg-white dark:bg-[#0f1422] text-amber-600 shadow-3xs' : 'text-slate-500'}`}
                        >
                          {language === 'ar' ? 'بعد العودة' : 'Post-Trip'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                        {language === 'ar' ? 'المركبة المفحوصة' : 'Vehicle Selected'}
                      </label>
                      <select
                        value={inspectedVehicle}
                        onChange={(e) => setInspectedVehicle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-[11px] font-black dark:text-white"
                      >
                        <option value="toyota-hilux">تويوتا هيلوكس HD [ب ل ط ٧٧٦]</option>
                        <option value="mercedes-actros">مرسيدس أكتروس ثقيل [م ط ر ٠١٢]</option>
                      </select>
                    </div>
                  </div>

                  {/* Checklist Items Table list */}
                  <div className="space-y-2 border-t border-b border-slate-100 dark:border-slate-850 py-4 my-2">
                    <span className="block text-[10.5px] font-black text-slate-500 dark:text-slate-400 pb-2">
                      {language === 'ar' ? 'عناصر الفحص الإلزامية:' : 'Mandatory Inspection Checks:'}
                    </span>
                    
                    {[
                      { key: 'brakes', labelAr: 'الفرامل والفرامل اليدوية (Brakes)', labelEn: 'Brakes & Parking Brake' },
                      { key: 'engine', labelAr: 'محرك المركبة وصوت التشغيل (Engine)', labelEn: 'Engine Sound & Driveability' },
                      { key: 'tires', labelAr: 'ضغط الإطارات وسلامة العجلات (Tires)', labelEn: 'Tires & Wheels Pressure' },
                      { key: 'lights', labelAr: 'المصابيح الأمامية والخلفية والإشارات (Lights)', labelEn: 'Lights & Indicators' },
                      { key: 'fluids', labelAr: 'سائل التبريد وزيوت المحرك (Fluids/Oil)', labelEn: 'Coolant & Engine Oils' },
                      { key: 'cleanliness', labelAr: 'نظافة الصالون الداخلي والهيكل (Clean)', labelEn: 'Interior Cleanliness' }
                    ].map((item) => {
                      const currentVal = (checklistValues as any)[item.key];
                      return (
                        <div key={item.key} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                          <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300">
                            {language === 'ar' ? item.labelAr : item.labelEn}
                          </span>
                          
                          <div className="flex gap-1 bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300/40">
                            <button
                              type="button"
                              onClick={() => setChecklistValues({ ...checklistValues, [item.key]: 'ok' })}
                              className={`px-2 py-1 rounded-md text-[9px] font-black transition-all ${currentVal === 'ok' ? 'bg-emerald-500 text-white shadow-3xs' : 'text-slate-500'}`}
                            >
                              {language === 'ar' ? 'سليم' : 'Pass'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setChecklistValues({ ...checklistValues, [item.key]: 'fail' })}
                              className={`px-2 py-1 rounded-md text-[9px] font-black transition-all ${currentVal === 'fail' ? 'bg-rose-500 text-white shadow-3xs' : 'text-slate-500'}`}
                            >
                              {language === 'ar' ? 'خلل' : 'Fail'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Inspector Notes */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                      {language === 'ar' ? 'ملاحظات إضافية أو تلفيات جديدة' : 'Additional Notes / Reported Damage'}
                    </label>
                    <textarea
                      rows={2}
                      value={checklistNotes}
                      onChange={(e) => setChecklistNotes(e.target.value)}
                      placeholder={language === 'ar' ? 'اكتب أي ملاحظة عن حالة المركبة هنا...' : 'Enter vehicle condition notes here...'}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none dark:text-white"
                    />
                  </div>

                  {/* Digital Signature */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-850/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-505 dark:text-slate-300 font-black text-[10.5px]">
                      <Signature size={14} className="text-emerald-500" />
                      <span>{language === 'ar' ? 'التوقيع الرقمي وإقرار المسؤولية' : 'Digital Signature & Custody Agreement'}</span>
                    </div>
                    
                    <p className="text-[9px] text-slate-400 leading-normal font-semibold">
                      {language === 'ar'
                        ? 'بإدخال اسمك أدناه، أنت تقر بأنك قمت بفحص المركبة ميدانياً وأنك مسؤول عن سلامتها وعهدتها طوال فترة نوبة عملك المقررة.'
                        : 'By typing your name below, you certify that you have physically inspected the vehicle and agree to custody conditions.'}
                    </p>

                    <input 
                      type="text"
                      required
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0f1422] border border-slate-150 dark:border-slate-800 rounded-xl text-xs font-black font-mono tracking-wider dark:text-white"
                    />
                  </div>

                  {/* Submit Action */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-emerald-500/15 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ClipboardCheck size={14} />
                    <span>{language === 'ar' ? 'تقديم تقرير الفحص والعهد' : 'Submit Checklist & Sign Custody'}</span>
                  </button>

                </form>
              )}
            </motion.div>
          )}

          {/* TAB 3: ROADSIDE FAULT REPORTING */}
          {activeSubTab === 'report' && (
            <motion.div
              key="driver-report-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-xl mx-auto bg-white dark:bg-[#0f1422] p-6 rounded-[2rem] border border-slate-100 dark:border-slate-850/80 shadow-sm text-right"
            >
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-850 mb-5">
                <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">
                    {language === 'ar' ? 'الإبلاغ الفوري عن عطل أو طلب صيانة' : 'Report Roadside Fault / Maintenance Ticket'}
                  </h3>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">{language === 'ar' ? 'أرسل بلاغ عطل فني مباشر لغرفة عمليات الصيانة والورش فور حدوثه' : 'Submit instant fault notifications to workshops room'}</p>
                </div>
              </div>

              {reportSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-500 mx-auto animate-bounce">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-sm font-black text-slate-850 dark:text-white">
                    {language === 'ar' ? 'تم تسجيل بلاغ العطل بنجاح!' : 'Maintenance Ticket Created!'}
                  </h4>
                  <p className="text-xs text-slate-450 font-semibold max-w-xs mx-auto">
                    {language === 'ar' 
                      ? 'تم بث البلاغ بنجاح للورشة الميدانية الأقرب وتم توجيه فني لفحص العطل.' 
                      : 'Ticket successfully broadcasted to nearby workshops. Dispatch team notified.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFaultSubmit} className="space-y-4 font-sans">
                  
                  {/* Vehicle selection & Category */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                        {language === 'ar' ? 'المركبة المتأثرة بالعطل' : 'Affected Vehicle'}
                      </label>
                      <select
                        value={reportVehicle}
                        onChange={(e) => setReportVehicle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-[11px] font-black dark:text-white"
                      >
                        <option value="toyota-hilux">تويوتا هيلوكس HD [ب ل ط ٧٧٦]</option>
                        <option value="mercedes-actros">مرسيدس أكتروس ثقيل [م ط ر ٠١٢]</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                        {language === 'ar' ? 'تصنيف العطل المبدئي' : 'Fault Category'}
                      </label>
                      <select
                        value={reportCategory}
                        onChange={(e) => setReportCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-[11px] font-black dark:text-white"
                      >
                        <option value="mechanical">{language === 'ar' ? 'خلل ميكانيكي / محرك' : 'Mechanical / Engine'}</option>
                        <option value="electrical">{language === 'ar' ? 'كهرباء / بطارية / إضاءة' : 'Electrical / Battery'}</option>
                        <option value="cooling">{language === 'ar' ? 'تبريد / تكييف' : 'Cooling / AC'}</option>
                        <option value="tires">{language === 'ar' ? 'الإطارات والعجلات' : 'Tires & Wheels'}</option>
                        <option value="brakes">{language === 'ar' ? 'الفرامل والفرامل اليدوية' : 'Brakes System'}</option>
                      </select>
                    </div>
                  </div>

                  {/* OBD-II Fault Code & Direct Symptoms Selector */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-850/60">
                    <div className="space-y-1">
                      <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5 flex items-center gap-1">
                        <Sparkles size={11} className="text-indigo-500 animate-pulse" />
                        <span>{language === 'ar' ? 'كود عطل OBD-II الموحد (٥ خانات)' : 'OBD-II Fault Code (5 chars)'}</span>
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        value={obdCode}
                        onChange={(e) => {
                          setObdCode(e.target.value);
                          if (obdError) setObdError('');
                        }}
                        placeholder="e.g. P0300, P0171"
                        className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-[11px] font-black font-mono tracking-wider text-slate-800 dark:text-white uppercase outline-none transition-all ${
                          obdError 
                            ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' 
                            : 'border-slate-200 dark:border-slate-850 focus:border-emerald-500'
                        }`}
                      />
                      {obdError ? (
                        <span className="block text-[8px] text-rose-500 font-bold leading-normal mt-0.5 animate-pulse">
                          {obdError}
                        </span>
                      ) : (
                        <span className="block text-[8px] text-slate-450 font-semibold leading-normal mt-0.5">
                          {language === 'ar' ? 'مثال: P0300 أو P0171 (اختياري)' : 'e.g., P0300 or P0171 (optional)'}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                        {language === 'ar' ? 'الأعراض المباشرة المشهودة (Direct Observed)' : 'Direct Observed Symptoms'}
                      </label>
                      <select
                        value={selectedSymptom}
                        onChange={(e) => setSelectedSymptom(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-[11px] font-black text-slate-800 dark:text-white"
                      >
                        <option value="" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-black">{language === 'ar' ? '-- اختر العَرَض الرئيسي --' : '-- Select Symptom --'}</option>
                        <option value="overheating" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-black">{language === 'ar' ? '🔥 حرارة زائدة بالرادياتير' : '🔥 Engine Overheating'}</option>
                        <option value="noise" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-black">{language === 'ar' ? '🔊 أصوات غريبة / طقطقة محرك' : '🔊 Strange Noise / Knocking'}</option>
                        <option value="vibration" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-black">{language === 'ar' ? '📳 اهتزاز شديد أثناء الحركة' : '📳 Heavy Steering Vibration'}</option>
                        <option value="leak" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-black">{language === 'ar' ? '💧 تسريب سوائل/زيت أسفل المركبة' : '💧 Fluid/Oil Leakage'}</option>
                        <option value="power_loss" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-black">{language === 'ar' ? '📉 ضعف عزم وتسارع السيارة' : '📉 Severe Power Loss'}</option>
                        <option value="battery" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-black">{language === 'ar' ? '🔋 صعوبة تشغيل المحرك (ضعف بطارية)' : '🔋 Engine Crank Hesitation'}</option>
                      </select>
                      <span className="block text-[8px] text-slate-450 font-semibold leading-normal mt-0.5">
                        {language === 'ar' ? 'حدد العرض لتسهيل الفحص الأولي' : 'Select to assist preliminary diagnostic'}
                      </span>
                    </div>
                  </div>

                  {/* Priority level */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                      {language === 'ar' ? 'مستوى خطورة العطل وتأثيره' : 'Criticality & Urgency'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'low', labelAr: 'منخفضة (طبيعي)', labelEn: 'Low (Routine)', color: 'border-slate-200 text-slate-650' },
                        { id: 'medium', labelAr: 'متوسطة (عاجل)', labelEn: 'Medium (Urgent)', color: 'border-amber-500/30 text-amber-600' },
                        { id: 'high', labelAr: 'قصوى (توقف كلي!)', labelEn: 'High (Critical STOP)', color: 'border-rose-500/30 text-rose-600' },
                      ].map((item) => {
                        const isSelected = reportPriority === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setReportPriority(item.id)}
                            className={`p-2.5 rounded-xl text-[10.5px] font-black border text-center transition-all cursor-pointer ${
                              isSelected 
                                ? item.id === 'high' 
                                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm' 
                                  : item.id === 'medium'
                                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                  : 'bg-brand-blue-500 text-white border-brand-blue-500 shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800'
                            }`}
                          >
                            <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="space-y-1 font-sans">
                    <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                      {language === 'ar' ? 'وصف المشكلة بالتفصيل' : 'Problem Description'} <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={reportDesc}
                      onChange={(e) => {
                        setReportDesc(e.target.value);
                      }}
                      placeholder={language === 'ar' ? 'اشرح بالتفصيل ماذا حدث وموقعك التقريبي إن أمكن...' : 'Describe what happened and your current location...'}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none dark:text-white"
                    />
                  </div>

                  {/* Capture/Attach Photo Simulator */}
                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                      {language === 'ar' ? 'إرفاق صورة للعطل فوتوغرافية (اختياري)' : 'Attach Fault Photograph (Optional)'}
                    </label>
                    
                    <div className="flex gap-3 items-center">
                      <button
                        type="button"
                        onClick={simulatePhotoUpload}
                        className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
                      >
                        <Camera size={14} className="text-slate-500" />
                        <span>{language === 'ar' ? 'التقاط / رفع صورة العطل' : 'Simulate Camera Shot'}</span>
                      </button>

                      {attachedPhoto && (
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-750">
                          <img src={attachedPhoto} alt="Fault preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setAttachedPhoto(null)}
                            className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-[8px] font-black hover:bg-rose-600/90"
                          >
                            {language === 'ar' ? 'حذف' : 'Del'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Send Ticket Button */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-rose-500/15 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send size={14} />
                    <span>{language === 'ar' ? 'إرسال بلاغ العطل للورشة' : 'Transmit Ticket & Notify Workshop'}</span>
                  </button>

                </form>
              )}
            </motion.div>
          )}

          {/* TAB 4: MY ACTIVITY LOGS / HISTORY */}
          {activeSubTab === 'history' && (
            <motion.div
              key="driver-history-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 text-right"
            >
              
              {/* 1. Handovers checklist logs */}
              <div className="bg-white dark:bg-[#0f1422] p-5 rounded-3xl border border-slate-100 dark:border-slate-850/80 shadow-2xs">
                <h3 className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-850/80 mb-4">
                  <ClipboardCheck size={14} className="text-emerald-500" />
                  <span>{language === 'ar' ? 'سجل فحوصات واستلام المركبة السابق' : 'My Previous Vehicle Inspection Logs'}</span>
                </h3>

                <div className="space-y-3">
                  {submittedHandovers.map((record, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-850 flex justify-between items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black text-slate-850 dark:text-white">{record.vehicle}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${record.type === 'pre' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                            {record.type === 'pre' ? (language === 'ar' ? 'قبل الانطلاق' : 'Pre-Trip') : (language === 'ar' ? 'بعد العودة' : 'Post-Trip')}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold">{record.notes}</p>
                        <span className="block text-[8.5px] text-slate-400 font-mono">{record.date}</span>
                      </div>

                      <div className="text-left">
                        <span className="block text-[8px] text-slate-450 font-black uppercase tracking-wider">{language === 'ar' ? 'الرقم المرجعي' : 'Ref Code'}</span>
                        <span className="block text-[10px] text-slate-700 dark:text-slate-350 font-mono font-black">{record.id}</span>
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[8.5px] font-black mt-1 ${record.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                          <span>{record.status === 'approved' ? (language === 'ar' ? 'معتمد' : 'Approved') : (language === 'ar' ? 'قيد المراجعة' : 'Pending')}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Reported faults logs */}
              <div className="bg-white dark:bg-[#0f1422] p-5 rounded-3xl border border-slate-100 dark:border-slate-850/80 shadow-2xs">
                <h3 className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-850/80 mb-4">
                  <AlertTriangle size={14} className="text-rose-500" />
                  <span>{language === 'ar' ? 'بلاغات الأعطال ومتابعة تذاكر الصيانة' : 'My Reported Roadside Faults History'}</span>
                </h3>

                <div className="space-y-3">
                  {submittedFaults.map((record, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2.5">
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-0.5">
                          <h4 className="text-[11px] font-black text-slate-850 dark:text-white flex items-center gap-2">
                            <span>{record.vehicle}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${
                              record.priority === 'high' ? 'bg-rose-500/10 text-rose-600' : record.priority === 'medium' ? 'bg-amber-500/10 text-amber-600' : 'bg-slate-250 text-slate-600'
                            }`}>
                              {record.priority === 'high' ? (language === 'ar' ? 'طوارئ' : 'Critical') : record.priority === 'medium' ? (language === 'ar' ? 'عاجل' : 'Urgent') : (language === 'ar' ? 'اعتيادي' : 'Routine')}
                            </span>
                          </h4>
                          <span className="block text-[8.5px] text-slate-400 font-mono">{record.date}</span>
                        </div>

                        <div className="text-left shrink-0">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-black">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>
                              {record.status === 'resolved' ? (language === 'ar' ? 'تم الإصلاح' : 'Resolved') : (language === 'ar' ? 'قيد الفحص بالورشة' : 'Workshop Diagnosing')}
                            </span>
                          </span>
                        </div>
                      </div>

                      {(record.obdCode || record.symptom) && (
                        <div className="flex flex-wrap gap-1.5 pb-0.5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {record.obdCode && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg text-[9px] font-black font-mono">
                              📟 OBD-II: {record.obdCode}
                            </span>
                          )}
                          {record.symptom && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-[9px] font-black">
                              ⚠️ {
                                record.symptom === 'overheating' ? (language === 'ar' ? 'حرارة زائدة بالرادياتير' : 'Engine Overheating') :
                                record.symptom === 'noise' ? (language === 'ar' ? 'أصوات غريبة / طقطقة محرك' : 'Strange Noise / Knocking') :
                                record.symptom === 'vibration' ? (language === 'ar' ? 'اهتزاز شديد أثناء الحركة' : 'Heavy Steering Vibration') :
                                record.symptom === 'leak' ? (language === 'ar' ? 'تسريب سوائل/زيت أسفل المركبة' : 'Fluid/Oil Leakage') :
                                record.symptom === 'power_loss' ? (language === 'ar' ? 'ضعف عزم وتسارع السيارة' : 'Severe Power Loss') :
                                record.symptom === 'battery' ? (language === 'ar' ? 'صعوبة تشغيل المحرك (بطارية)' : 'Engine Crank Hesitation') :
                                record.symptom
                              }
                            </span>
                          )}
                        </div>
                      )}

                      <div className="text-[10px] text-slate-650 dark:text-slate-300 font-semibold bg-white dark:bg-[#0f1422] p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="font-extrabold text-slate-500 text-[9px] mb-0.5">{language === 'ar' ? 'وصف العطل المبلغ:' : 'Reported description:'}</div>
                        "{record.desc}"
                      </div>

                      {record.resolution && (
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10">
                          <div className="font-extrabold text-emerald-600 text-[9px] mb-0.5">{language === 'ar' ? 'قرار وإجراء الصيانة فنيّاً:' : 'Maintenance Action Taken:'}</div>
                          ✓ {record.resolution}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
