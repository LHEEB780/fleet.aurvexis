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
  Pause,
  RotateCcw,
  Sparkles,
  Camera,
  LogOut,
  Calendar,
  Shield,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeftRight,
  MoveHorizontal,
  Navigation,
  Building2,
  Package,
  Layers,
  Phone,
  ShieldAlert,
  Fuel,
  Compass
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
import { User as AppUser, UserRole, Vehicle, Driver, DriverTrip, DriverAssignedProject } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import DriverLiveMap from './driver/DriverLiveMap';
import DriverTripsLog from './driver/DriverTripsLog';
import DriverAssignedProjects from './driver/DriverAssignedProjects';

interface DriverPortalProps {
  user: AppUser;
  onLogout: () => void;
  isDarkMode: boolean;
  onRoleChange?: (role: UserRole) => void;
}

// Initial Mock Trips for Driver
const INITIAL_TRIPS: DriverTrip[] = [
  {
    id: 'TRIP-8821',
    tripCode: 'TRIP-2026-8821',
    projectId: 'PRJ-NEOM-01',
    projectName: 'مشروع نيوم - البنية التحتية والممرات اللوجستية',
    projectNameEn: 'Neom Infrastructure Logistics Corridor',
    origin: 'مستودع الرياض المركزي اللوجستي',
    originEn: 'Central Riyadh Freight Logistics Hub',
    destination: 'مشروع نيوم - قطاع B-4 الإنشائي',
    destinationEn: 'Neom Project Site B-4',
    cargoType: 'حديد تسليح وخرسانة مسبقة الصنع',
    cargoTypeEn: 'Rebar & Precast Concrete Elements',
    cargoWeightTons: 22,
    vehiclePlate: 'ب ل ط ٧٧٦',
    vehicleModel: 'تويوتا هيلوكس HD بيك آب نقل ثقيل',
    status: 'in_progress',
    departureTime: '2026-05-30 07:30',
    estimatedArrival: '2026-05-30 14:15',
    startOdometer: 124850,
    totalDistanceKm: 142,
    waypoints: [
      { id: 'wp-1', name: 'مستودع الرياض المركزي (تحميل الحمولة)', nameEn: 'Riyadh Central Depot', type: 'origin', status: 'reached', lat: 24.71, lng: 46.67 },
      { id: 'wp-2', name: 'تقاطع طريق الخرج (مسار الشاحنات)', nameEn: 'Al-Kharj Freight Junction', type: 'checkpoint', status: 'reached', lat: 24.68, lng: 46.71 },
      { id: 'wp-3', name: 'محطة الميزان المحوري ونقطة التفتيش', nameEn: 'Axle Weigh Station & Inspection', type: 'checkpoint', status: 'pending', lat: 24.63, lng: 46.78 },
      { id: 'wp-4', name: 'مشروع نيوم - بوابة الاستلام والتفريغ B-4', nameEn: 'Neom Receiving Gate B-4', type: 'destination', status: 'pending', lat: 24.55, lng: 46.89 }
    ]
  },
  {
    id: 'TRIP-8822',
    tripCode: 'TRIP-2026-8822',
    projectId: 'PRJ-METRO-04',
    projectName: 'مشروع مترو الرياض - خط الإمداد والمحطات المركزية',
    projectNameEn: 'Riyadh Metro Supply Route',
    origin: 'ميناء الجاف - مستودعات الإمداد',
    originEn: 'Dry Port Logistics Warehouses',
    destination: 'محطة العليا المركزية للمترو',
    destinationEn: 'Olaya Metro Central Station Site',
    cargoType: 'كابلات كهربائية ضغط عالي وأجهزة تحكم',
    cargoTypeEn: 'High Voltage Cables & Controls',
    cargoWeightTons: 14,
    vehiclePlate: 'ب ل ط ٧٧٦',
    vehicleModel: 'تويوتا هيلوكس HD بيك آب',
    status: 'scheduled',
    departureTime: '2026-05-31 08:00',
    estimatedArrival: '2026-05-31 11:30',
    startOdometer: 124992,
    totalDistanceKm: 48,
    waypoints: [
      { id: 'wp-1', name: 'ميناء الجاف', nameEn: 'Dry Port', type: 'origin', status: 'pending', lat: 24.73, lng: 46.75 },
      { id: 'wp-2', name: 'محطة العليا', nameEn: 'Olaya Station', type: 'destination', status: 'pending', lat: 24.70, lng: 46.68 }
    ]
  },
  {
    id: 'TRIP-8819',
    tripCode: 'TRIP-2026-8819',
    projectId: 'PRJ-REDSEA-02',
    projectName: 'مشروع البحر الأحمر السياحي - نقل المواد الفندقية',
    projectNameEn: 'Red Sea Destination Project',
    origin: 'مستودع ينبع الإقليمي',
    originEn: 'Yanbu Regional Depot',
    destination: 'منتجع أمالا الفندقي الشمالي',
    destinationEn: 'Amaala Northern Resort Gate',
    cargoType: 'مواد عزل وتجهيزات معمارية',
    cargoTypeEn: 'Architectural Supplies',
    cargoWeightTons: 16,
    vehiclePlate: 'ب ل ط ٧٧٦',
    vehicleModel: 'تويوتا هيلوكس HD بيك آب',
    status: 'completed',
    departureTime: '2026-05-28 06:00',
    estimatedArrival: '2026-05-28 13:00',
    completedTime: '2026-05-28 12:45',
    startOdometer: 124500,
    endOdometer: 124850,
    totalDistanceKm: 350,
    fuelConsumedLiters: 42,
    recipientName: 'م. فهد السديري (مدير موقع أمالا)',
    waypoints: [
      { id: 'wp-1', name: 'مستودع ينبع', nameEn: 'Yanbu Depot', type: 'origin', status: 'reached', lat: 24.08, lng: 38.06 },
      { id: 'wp-2', name: 'منتجع أمالا', nameEn: 'Amaala Resort', type: 'destination', status: 'reached', lat: 25.12, lng: 37.20 }
    ]
  }
];

// Initial Mock Projects Assigned to Driver
const INITIAL_PROJECTS: DriverAssignedProject[] = [
  {
    id: 'PRJ-NEOM-01',
    code: 'NEOM-LOG-2026',
    name: 'مشروع نيوم - البنية التحتية والممرات اللوجستية',
    nameEn: 'Neom Infrastructure Logistics Corridor',
    client: 'شركة نيوم المساهمة المغلقة',
    clientEn: 'NEOM Joint Stock Co.',
    location: 'منطقة تبوك - قطاع الإنشاءات B-4 اللوجستي',
    locationEn: 'Tabuk Region - Sector B-4',
    priority: 'high',
    status: 'active',
    description: 'توفير خدمات النقل الثقيل ونقل شحنات الحديد والخرسانة المسلحة والمعدات الخاصة بمشروعات البنية التحتية بالقطاع الشمالي.',
    descriptionEn: 'Heavy logistics transport of rebar, precast units, and engineering machinery for North Infrastructure zone.',
    startDate: '2026-01-15',
    endDate: '2026-12-31',
    allocatedVehicle: 'تويوتا هيلوكس HD [ب ل ط ٧٧٦]',
    projectManagerName: 'م. راشد القحطاني',
    projectManagerPhone: '+966 55 889 0011',
    tasks: [
      { id: 'tsk-1', title: 'استلام إذن النقل وبوليصة الشحن من مستودع الرياض', titleEn: 'Receive dispatch slip & consignment notes', completed: true, dueDate: '2026-05-30' },
      { id: 'tsk-2', title: 'فحص ميزان المحاور بنقطة التفتيش المعتمدة', titleEn: 'Perform axle weight check at weigh station', completed: false, dueDate: '2026-05-30' },
      { id: 'tsk-3', title: 'تسليم المواد لمسؤول الموقع والتوقيع على إشعار الاستلام', titleEn: 'Unload cargo & obtain signed proof of receipt', completed: false, dueDate: '2026-05-30' },
      { id: 'tsk-4', title: 'إعادة شهادة الاستلام وتسجيل قراءة العداد بعد الإفراغ', titleEn: 'Return delivery receipt & log final odometer', completed: false, dueDate: '2026-05-30' }
    ]
  },
  {
    id: 'PRJ-METRO-04',
    code: 'R-METRO-04',
    name: 'مشروع مترو الرياض - خط الإمداد والمحطات المركزية',
    nameEn: 'Riyadh Metro Supply Route',
    client: 'الهيئة الملكية لمدينة الرياض',
    clientEn: 'Royal Commission for Riyadh City',
    location: 'طريق الملك فهد - تقاطع العليا',
    locationEn: 'King Fahd Rd - Olaya Junction',
    priority: 'medium',
    status: 'active',
    description: 'نقل التجهيزات الكهربائية ومستلزمات الصيانة الوقائية لمحطات المترو الرئيسية.',
    descriptionEn: 'Transport electrical control equipment and spare inventory for major transit hubs.',
    startDate: '2026-03-01',
    endDate: '2026-10-30',
    allocatedVehicle: 'تويوتا هيلوكس HD [ب ل ط ٧٧٦]',
    projectManagerName: 'م. أحمد التميمي',
    projectManagerPhone: '+966 50 334 7788',
    tasks: [
      { id: 'tsk-201', title: 'استلام صناديق الكابلات من ميناء الجاف', titleEn: 'Pick up cable crates from Dry Port', completed: false, dueDate: '2026-05-31' },
      { id: 'tsk-202', title: 'التفريغ في المستودع الفرعي لمحطة العليا', titleEn: 'Offload at Olaya station sub-warehouse', completed: false, dueDate: '2026-05-31' }
    ]
  },
  {
    id: 'PRJ-REDSEA-02',
    code: 'REDSEA-DEV',
    name: 'مشروع البحر الأحمر السياحي - نقل المواد الإنشائية',
    nameEn: 'Red Sea Destination Project',
    client: 'شركة البحر الأحمر للتطوير (RSG)',
    clientEn: 'Red Sea Global (RSG)',
    location: 'الساحل الغربي - أمالا والوجه',
    locationEn: 'West Coast - Amaala & Al Wajh',
    priority: 'normal',
    status: 'active',
    description: 'نقل مواد التشطيب الصديقة للبيئة ومعدات الطاقة الشمسية لمنتجعات الجزر المستدامة.',
    descriptionEn: 'Transport eco-friendly finishings and solar equipment for island resorts.',
    startDate: '2026-02-10',
    endDate: '2026-11-20',
    allocatedVehicle: 'تويوتا هيلوكس HD [ب ل ط ٧٧٦]',
    projectManagerName: 'م. فهد السديري',
    projectManagerPhone: '+966 54 990 1212',
    tasks: [
      { id: 'tsk-301', title: 'إتمام دورة السلامة البيئية لنقل مواد مشروع البحر الأحمر', titleEn: 'Pass eco-safety freight compliance training', completed: true, dueDate: '2026-05-20' },
      { id: 'tsk-302', title: 'تسليم شحنة الألواح الشمسية لمنتجع أمالا', titleEn: 'Deliver solar batch to Amaala Resort', completed: true, dueDate: '2026-05-28' }
    ]
  }
];

export default function DriverPortal({ user, onLogout, isDarkMode, onRoleChange }: DriverPortalProps) {
  const { language, t, dir } = useLanguage();
  
  // Tabs: 'home' | 'map' | 'trips' | 'projects' | 'checklist' | 'report' | 'history'
  const [activeSubTab, setActiveSubTab] = useState<'home' | 'map' | 'trips' | 'projects' | 'checklist' | 'report' | 'history'>('home');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  
  // Driver Trips State (Persisted with Live Cross-Tab & Admin Sync)
  const [trips, setTrips] = useState<DriverTrip[]>(() => {
    const saved = localStorage.getItem('fleet_driver_trips');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_TRIPS;
  });

  useEffect(() => {
    localStorage.setItem('fleet_driver_trips', JSON.stringify(trips));
  }, [trips]);

  // Real-time synchronization listener when Admin dispatches trips
  useEffect(() => {
    const handleStorageChange = (e?: StorageEvent) => {
      const saved = localStorage.getItem('fleet_driver_trips');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTrips(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Driver Projects State (Persisted)
  const [projects, setProjects] = useState<DriverAssignedProject[]>(() => {
    const saved = localStorage.getItem('fleet_driver_projects');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return INITIAL_PROJECTS;
  });

  useEffect(() => {
    localStorage.setItem('fleet_driver_projects', JSON.stringify(projects));
  }, [projects]);

  // Selected Active Trip (find in_progress or first scheduled)
  const activeTrip = trips.find(t => t.status === 'in_progress') || trips[0] || null;

  // Tabs scroll & horizontal indicator state
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hasInteractedWithTabs, setHasInteractedWithTabs] = useState(false);

  const updateTabScrollIndicators = () => {
    if (tabsContainerRef.current) {
      const el = tabsContainerRef.current;
      const scrollLeft = Math.abs(el.scrollLeft);
      const maxScroll = el.scrollWidth - el.clientWidth;
      
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < maxScroll - 10);
    }
  };

  useEffect(() => {
    updateTabScrollIndicators();
    const el = tabsContainerRef.current;
    if (el) {
      el.addEventListener('scroll', updateTabScrollIndicators);
      window.addEventListener('resize', updateTabScrollIndicators);
      return () => {
        el.removeEventListener('scroll', updateTabScrollIndicators);
        window.removeEventListener('resize', updateTabScrollIndicators);
      };
    }
  }, []);

  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeEl = tabsContainerRef.current.querySelector(`[data-tab-id="${activeSubTab}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeSubTab]);

  const scrollTabs = (direction: 'prev' | 'next') => {
    setHasInteractedWithTabs(true);
    if (tabsContainerRef.current) {
      const isRtl = dir === 'rtl';
      const offset = (direction === 'next' ? (isRtl ? -180 : 180) : (isRtl ? 180 : -180));
      tabsContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Mock Driver States
  const [safetyScore, setSafetyScore] = useState(94);
  const [odometer, setOdometer] = useState(124850);
  const [fuelLevel, setFuelLevel] = useState(82);
  const [isDriving, setIsDriving] = useState(activeTrip?.status === 'in_progress');
  const [activeTripMinutes, setActiveTripMinutes] = useState(24);
  
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
  
  // History of Submitted records (initialized with mock logs)
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
        if (Math.random() > 0.9) {
          setSafetyScore(prev => Math.max(70, Math.min(100, prev + (Math.random() > 0.5 ? 1 : -1))));
        }
      }, 3000);
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
    const nextDrivingState = !isDriving;
    setIsDriving(nextDrivingState);
    if (activeTrip) {
      handleUpdateTripStatus(activeTrip.id, nextDrivingState ? 'in_progress' : 'paused');
    }
  };

  const handleUpdateTripStatus = (tripId: string, status: DriverTrip['status'], note?: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          status,
          driverNotes: note || t.driverNotes,
          completedTime: (status === 'completed' || status === 'delivered') ? new Date().toISOString().replace('T', ' ').substring(0, 16) : t.completedTime
        };
      }
      return t;
    }));
    if (status === 'in_progress') {
      setIsDriving(true);
    } else if (status === 'completed' || status === 'delivered' || status === 'paused') {
      setIsDriving(false);
    }
  };

  const handleAddNewTrip = (newTrip: DriverTrip) => {
    setTrips(prev => [newTrip, ...prev]);
  };

  const handleToggleProjectTask = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(tsk => tsk.id === taskId ? { ...tsk, completed: !tsk.completed } : tsk)
        };
      }
      return p;
    }));
  };

  const handleNavigateToProject = (project: DriverAssignedProject) => {
    // Check if trip exists for this project, otherwise create or activate it
    const existingTrip = trips.find(t => t.projectId === project.id);
    if (existingTrip) {
      handleUpdateTripStatus(existingTrip.id, 'in_progress');
    }
    setActiveSubTab('map');
  };

  const handleTriggerSOS = async (reason: string, location: string) => {
    const sosTicket = {
      id: 'SOS-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      category: 'emergency',
      vehicle: 'تويوتا هيلوكس HD - [ب ل ط ٧٧٦]',
      priority: 'high',
      status: 'pending',
      desc: `[نداء استغاثة وطوارئ عاجل]: ${reason} - الموقع: ${location}`,
      symptom: 'accident'
    };

    setSubmittedFaults(prev => [sosTicket, ...prev]);
    try {
      const { saveDocument, db: firestoreDb } = await import('../services/firebase');
      if (firestoreDb) {
        await saveDocument('fault_reports', sosTicket.id, sosTicket);
      }
    } catch (e) {}
  };

  const handleChecklistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newHO = {
      id: 'HO-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().split('T')[0],
      type: checklistType,
      vehicle: inspectedVehicle === 'toyota-hilux' ? 'تويوتا هيلوكس HD - [ب ل ط ٧٧٦]' : 'مرسيدس أكتروس ثقيل - [م ط ر ٠١٢]',
      status: 'approved',
      notes: checklistNotes || (language === 'ar' ? 'تم الفحص بنجاح بدون مشاكل حرجة.' : 'Inspected successfully with no critical issues.')
    };
    setSubmittedHandovers([newHO, ...submittedHandovers]);
    setChecklistSubmitted(true);
    setTimeout(() => {
      setChecklistSubmitted(false);
      setActiveSubTab('history');
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

    try {
      const { saveDocument, db: firestoreDb } = await import('../services/firebase');
      if (firestoreDb) {
        await saveDocument('maintenance_orders', orderId, newOrder);
        await saveDocument('fault_reports', faultId, newFault);
      }
    } catch (err) {
      console.warn('Firestore write backup:', err);
    }
    
    setSubmittedFaults([newFault, ...submittedFaults]);
    setReportSubmitted(true);
    window.dispatchEvent(new Event('storage'));

    setTimeout(() => {
      setReportSubmitted(false);
      setActiveSubTab('history');
      setReportDesc('');
      setAttachedPhoto(null);
      setObdCode('');
      setSelectedSymptom('');
    }, 2000);
  };

  const simulatePhotoUpload = () => {
    const mockImages = [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=300&h=200',
      'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&q=80&w=300&h=200',
      'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=300&h=200'
    ];
    const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];
    setAttachedPhoto(randomImg);
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] dark:bg-[#080b11] text-slate-900 dark:text-slate-100 pb-16 font-sans" dir={dir}>
      
      {/* Driver Portal Top Bar Header */}
      <div className="bg-white dark:bg-[#0f1422] border-b border-slate-100 dark:border-slate-850 px-4 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
                  {language === 'ar' ? 'سائق نقل ثقيل معتمد' : 'Certified Heavy Driver'}
                </span>
              </h1>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">{user.title || 'سائق أسطول النقل والمشاريع'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-left hidden sm:block">
              <span className="block text-[8px] text-slate-400 font-black uppercase tracking-wider">{language === 'ar' ? 'بوابة السائق الميدانية' : 'Driver Portal Live'}</span>
              <span className="block text-[10px] text-slate-600 dark:text-slate-400 font-mono font-bold">2026-05-30 • GPS Live</span>
            </div>

            {/* Quick Access / Mode Changer */}
            {onRoleChange && (
              <div className="relative">
                <button 
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="h-10 flex items-center justify-center gap-1.5 px-3 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/90 dark:hover:bg-slate-700/95 border border-slate-200/40 dark:border-slate-700/60 rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
                >
                  <Shield size={14} className="text-indigo-600 dark:text-indigo-400" />
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
                          { id: 'admin', labelAr: '🔑 مدير الصيانة والأسطول', labelEn: '🔑 Fleet Admin' },
                          { id: 'technician', labelAr: '🔧 فني ميكانيك أول', labelEn: '🔧 Lead Technician' },
                          { id: 'viewer', labelAr: '👁️ مراقب جودة ونظام (معاينة)', labelEn: '👁️ Quality Observer' },
                          { id: 'driver', labelAr: '🚛 سائق نقل ثقيل (البوابة الحالية)', labelEn: '🚛 Heavy Driver (Active)' }
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
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' 
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

      {/* Driver Welcome Hero Banner - Corporate FleetAurvexis Purple/Violet Gradient */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden border border-purple-500/30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl translate-y-12 -translate-x-12 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 text-right">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-[10px] font-black uppercase tracking-wider border border-purple-400/30">
                  {language === 'ar' ? 'بوابة النقل الثقيل والمشاريع' : 'Heavy Freight & Project Portal'}
                </span>
                <span className="px-2 py-0.5 bg-violet-500/20 text-violet-200 border border-violet-400/30 rounded-full text-[10px] font-black">
                  {user.name}
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[9px] font-bold">
                  {language === 'ar' ? 'متزامن مع الإدارة ✓' : 'Admin Synced ✓'}
                </span>
              </div>
              <h2 className="text-xl font-black mt-1 text-white">
                {language === 'ar' ? `مرحباً بك، الكابتن خالد الكعبي 🚛` : `Welcome, Captain Khaled Al-Kaabi 🚛`}
              </h2>
              <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-xl">
                {language === 'ar' 
                  ? 'منصتك الميدانية المتكاملة: تتبع مسارك عبر الخريطة الحية، متابعة سجل الرحلات والمشاريع المسندة، إتمام الفحص اليومي وطلب الدعم الفوري.' 
                  : 'Your live field cockpit: live GPS navigation, assigned project work orders, trip missions log, and digital safety checks.'}
              </p>
            </div>
            
            {/* Driving Session Control Widget */}
            <div className="bg-slate-900/70 backdrop-blur-md p-4 rounded-3xl border border-purple-500/30 flex items-center gap-4 shrink-0 text-right shadow-lg">
              <div>
                <span className="block text-[9.5px] text-purple-200 font-black">{language === 'ar' ? 'حالة القيادة الحالية' : 'Driving Status'}</span>
                {isDriving ? (
                  <div className="flex items-center gap-1.5 mt-0.5 text-emerald-300 font-black text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{language === 'ar' ? 'الرحلة جارية على الطريق...' : 'Navigating on Route...'}</span>
                  </div>
                ) : (
                  <span className="block text-xs font-black text-slate-200 mt-0.5">{language === 'ar' ? 'متوقف / في الاستراحة' : 'Parked / On Standby'}</span>
                )}
                {isDriving && (
                  <span className="block text-[9px] font-mono text-purple-300 mt-0.5">
                    {language === 'ar' ? `الوقت المنقضي: ${activeTripMinutes} دقيقة` : `Elapsed: ${activeTripMinutes} min`}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  onClick={handleStartTrip}
                  className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                    isDriving 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
                  }`}
                >
                  {isDriving ? <Pause size={13} /> : <Play size={13} />}
                  <span>
                    {isDriving 
                      ? (language === 'ar' ? 'أخذ استراحة ☕' : 'Pause / Break') 
                      : (language === 'ar' ? 'بدء الرحلة 🟢' : 'Start Route')
                    }
                  </span>
                </button>

                <button
                  onClick={() => setActiveSubTab('map')}
                  className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/35 text-purple-200 border border-purple-500/30 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Navigation size={11} className="text-purple-300" />
                  <span>{language === 'ar' ? 'فتح الخريطة' : 'Open Map'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Portal 7 Sub-Navigation Tabs Bar with Horizontal Scroll Hints */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        {/* Helper Header & Animated Swipe Indicator */}
        <div className="flex items-center justify-between px-2 mb-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold">
            <Layers size={13} className="text-purple-500" />
            <span>{language === 'ar' ? 'المهام والأقسام الميدانية' : 'Field Mission Sections'}</span>
            <span className="px-1.5 py-0.2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded text-[9.5px] font-mono font-black">
              7
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 rounded-full text-[10px] font-black border border-purple-500/20">
            <ChevronsLeftRight size={13} className="animate-pulse text-purple-500" />
            <span>{language === 'ar' ? 'اسحب الشريط للمزيد من الخيارات ↔' : 'Swipe bar for more tabs ↔'}</span>
          </div>
        </div>

        {/* Scrollable Tabs Wrapper with Edge Fades & Action Controls */}
        <div className="relative group">
          
          {/* Right Scroll Arrow Button */}
          {canScrollRight && (
            <button
              onClick={() => scrollTabs(dir === 'rtl' ? 'prev' : 'next')}
              className={`absolute top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/95 text-purple-600 dark:text-purple-300 shadow-lg border border-purple-500/30 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all ${
                dir === 'rtl' ? '-left-2' : '-right-2'
              }`}
              title={language === 'ar' ? 'تمرير للمزيد' : 'Scroll right'}
            >
              {dir === 'rtl' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          )}

          {/* Left Scroll Arrow Button */}
          {canScrollLeft && (
            <button
              onClick={() => scrollTabs(dir === 'rtl' ? 'next' : 'prev')}
              className={`absolute top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/95 text-purple-600 dark:text-purple-300 shadow-lg border border-purple-500/30 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all ${
                dir === 'rtl' ? '-right-2' : '-left-2'
              }`}
              title={language === 'ar' ? 'تمرير للسابق' : 'Scroll left'}
            >
              {dir === 'rtl' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}

          {/* Left Edge Fade Gradient */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-[#0f1422] to-transparent rounded-l-3xl z-10 opacity-70" />

          {/* Right Edge Fade Gradient */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-[#0f1422] to-transparent rounded-r-3xl z-10 opacity-70" />

          {/* Scrollable Container with Smooth Touch Scrolling & Snap */}
          <div 
            ref={tabsContainerRef}
            onScroll={() => {
              updateTabScrollIndicators();
              if (!hasInteractedWithTabs) setHasInteractedWithTabs(true);
            }}
            className="flex bg-white dark:bg-[#0f1422] p-2 rounded-3xl border border-slate-100 dark:border-slate-850/80 shadow-sm font-sans overflow-x-auto no-scrollbar gap-2 scroll-smooth snap-x snap-mandatory"
          >
            {[
              { id: 'home', labelAr: 'لوحة القيادة', labelEn: 'Dashboard', icon: <Award size={15} /> },
              { id: 'map', labelAr: 'الخريطة والتتبع 🗺️', labelEn: 'Live Map 🗺️', icon: <Navigation size={15} /> },
              { id: 'trips', labelAr: 'سجل الرحلات 🚚', labelEn: 'Trips Log 🚚', icon: <Truck size={15} /> },
              { id: 'projects', labelAr: 'المشاريع المسندة 🏗️', labelEn: 'Assigned Projects 🏗️', icon: <Building2 size={15} /> },
              { id: 'checklist', labelAr: 'فحص واستلام الآلية', labelEn: 'Vehicle Inspection', icon: <ClipboardCheck size={15} /> },
              { id: 'report', labelAr: 'إبلاغ عن عطل', labelEn: 'Report Fault', icon: <Wrench size={15} /> },
              { id: 'history', labelAr: 'سجل الأنشطة', labelEn: 'Activity History', icon: <FileText size={15} /> },
            ].map((tab) => {
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-tab-id={tab.id}
                  onClick={() => {
                    setActiveSubTab(tab.id as any);
                    setHasInteractedWithTabs(true);
                  }}
                  className={`shrink-0 snap-start min-w-[130px] md:min-w-[145px] flex items-center justify-center gap-2 py-3 px-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400/30' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50/70 dark:hover:bg-purple-950/30 border border-transparent hover:border-purple-200/50 dark:hover:border-purple-800/30'
                  }`}
                >
                  <span className={isActive ? 'text-purple-200' : 'text-slate-400 dark:text-slate-500'}>
                    {tab.icon}
                  </span>
                  <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
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
                      <Gauge size={14} className="text-purple-500" />
                    </div>
                    <div className="mt-3">
                      <span className="block text-base font-black font-mono text-slate-800 dark:text-white">
                        {odometer.toLocaleString()}
                      </span>
                      <span className="block text-[8.5px] text-slate-450 font-bold uppercase tracking-wider">{language === 'ar' ? 'كيلومتر تراكمي' : 'Total KM'}</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#0f1422] p-4 rounded-3xl border border-slate-100 dark:border-slate-850/80 shadow-2xs flex flex-col justify-between">
                    <div className="text-slate-400 dark:text-slate-500 flex items-center justify-between">
                      <span className="text-[10px] font-black">{language === 'ar' ? 'مستوى خزان الوقود' : 'Fuel Tank'}</span>
                      <Droplet size={14} className="text-indigo-500" />
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center gap-1">
                        <span className="text-base font-black font-mono text-slate-800 dark:text-white">
                          {fuelLevel}%
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <span className="block text-[8.5px] text-slate-450 font-bold uppercase tracking-wider">{language === 'ar' ? 'ديزل نظيف' : 'Diesel Level'}</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#0f1422] p-4 rounded-3xl border border-slate-100 dark:border-slate-850/80 shadow-2xs flex flex-col justify-between">
                    <div className="text-slate-400 dark:text-slate-500 flex items-center justify-between">
                      <span className="text-[10px] font-black">{language === 'ar' ? 'سجل الرحلات' : 'Total Trips'}</span>
                      <Truck size={14} className="text-purple-500" />
                    </div>
                    <div className="mt-3">
                      <span className="block text-base font-black font-mono text-slate-800 dark:text-white">
                        {trips.length}
                      </span>
                      <span className="block text-[8.5px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
                        {language === 'ar' ? 'رحلات مسندة ومكتملة' : 'Missions'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Active Trip Quick Card & Map Shortcut */}
                {activeTrip && (
                  <div className="bg-white dark:bg-[#0f1422] p-5 rounded-3xl border border-purple-500/30 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
                          <Navigation size={18} />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-slate-900 dark:text-white">
                            {language === 'ar' ? 'الرحلة النشطة الحالية' : 'Current Active Mission'}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-semibold">{activeTrip.projectName}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveSubTab('map')}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-purple-600/20"
                      >
                        <Compass size={13} />
                        <span>{language === 'ar' ? 'عرض بالخريطة الحية' : 'View on Live Map'}</span>
                      </button>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs">
                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold">{language === 'ar' ? 'خط السير المعتمد:' : 'Route:'}</span>
                        <span className="font-black text-slate-800 dark:text-white mt-0.5 block">
                          {activeTrip.origin} ➔ {activeTrip.destination}
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="block text-[9px] text-slate-400 font-bold">{language === 'ar' ? 'الحمولة والوزن:' : 'Cargo:'}</span>
                        <span className="font-black text-purple-600 dark:text-purple-400 mt-0.5 block">
                          {activeTrip.cargoType} ({activeTrip.cargoWeightTons} طن)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Safety Performance Radar Chart */}
                <div className="bg-white dark:bg-[#0f1422] p-5 rounded-3xl border border-slate-100 dark:border-slate-850/80 shadow-2xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                    <div>
                      <h3 className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-1.5">
                        <TrendingUp size={15} className="text-purple-500" />
                        <span>{language === 'ar' ? 'مؤشر كفاءة القيادة والسلامة الميدانية' : 'Driving & Field Safety Radar'}</span>
                      </h3>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">{language === 'ar' ? 'يتم التقييم آلياً عبر مجسات التتبع والسرعة والفرملة' : 'Telemetry calculated automatically via onboard sensors'}</p>
                    </div>
                    <div className="text-left">
                      <span className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">{safetyScore}%</span>
                      <span className="block text-[8px] text-slate-400 font-black uppercase">{language === 'ar' ? 'الدرجة التراكمية' : 'Score'}</span>
                    </div>
                  </div>

                  <div className="h-64 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={performanceData}>
                        <PolarGrid stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 8 }} />
                        <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Column 3: Vehicle Assigned Details & Quick Actions */}
              <div className="space-y-6">
                
                {/* Assigned Vehicle Card */}
                <div className="bg-white dark:bg-[#0f1422] p-5 rounded-3xl border border-slate-100 dark:border-slate-850/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                    <h3 className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-1.5">
                      <Truck size={14} className="text-purple-500" />
                      <span>{language === 'ar' ? 'المركبة المسندة حالياً' : 'Assigned Vehicle'}</span>
                    </h3>
                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded text-[9px] font-black">
                      {language === 'ar' ? 'جاهزة للعمل' : 'Operational'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="h-28 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-200/50 dark:border-slate-800">
                      <img 
                        src="https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400&h=200" 
                        alt="Assigned vehicle" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                        <div className="text-white">
                          <h4 className="text-xs font-black">تويوتا هيلوكس HD بيك آب</h4>
                          <span className="text-[9px] font-mono text-purple-300">لوحة: [ب ل ط ٧٧٦]</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-850">
                        <span className="text-slate-400 font-bold">{language === 'ar' ? 'الموقع الحالي:' : 'Location:'}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">مستودع الرياض المركزي</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-850">
                        <span className="text-slate-400 font-bold">{language === 'ar' ? 'تاريخ الفحص الدوري:' : 'Periodic Check:'}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">2026-06-15</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400 font-bold">{language === 'ar' ? 'إطارات وسوائل:' : 'Tires & Fluids:'}</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">{language === 'ar' ? 'سليمة ومعايرة ✓' : 'Inspected OK ✓'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Action Navigation Buttons */}
                <div className="bg-white dark:bg-[#0f1422] p-5 rounded-3xl border border-slate-100 dark:border-slate-850/80 shadow-2xs space-y-2.5">
                  <h3 className="text-xs font-black text-slate-850 dark:text-white mb-2">
                    {language === 'ar' ? 'إجراءات السائق السريعة' : 'Driver Quick Operations'}
                  </h3>

                  <button
                    onClick={() => setActiveSubTab('map')}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white rounded-2xl text-xs font-black transition-all flex items-center justify-between group cursor-pointer border border-slate-100 dark:border-slate-850 shadow-3xs"
                  >
                    <div className="flex items-center gap-2">
                      <Navigation size={15} className="text-purple-500 group-hover:text-white" />
                      <span>{language === 'ar' ? 'فتح خريطة الملاحة الحية' : 'Open Live GPS Map'}</span>
                    </div>
                    <span className="text-[9px] opacity-60">➔</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('trips')}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white rounded-2xl text-xs font-black transition-all flex items-center justify-between group cursor-pointer border border-slate-100 dark:border-slate-850 shadow-3xs"
                  >
                    <div className="flex items-center gap-2">
                      <Truck size={15} className="text-purple-500 group-hover:text-white" />
                      <span>{language === 'ar' ? 'سجل الرحلات والمهمات' : 'Trips & Missions Log'}</span>
                    </div>
                    <span className="text-[9px] opacity-60">➔</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('projects')}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white rounded-2xl text-xs font-black transition-all flex items-center justify-between group cursor-pointer border border-slate-100 dark:border-slate-850 shadow-3xs"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 size={15} className="text-purple-500 group-hover:text-white" />
                      <span>{language === 'ar' ? 'المشاريع المسندة وأوامر العمل' : 'Assigned Projects'}</span>
                    </div>
                    <span className="text-[9px] opacity-60">➔</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('checklist')}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white rounded-2xl text-xs font-black transition-all flex items-center justify-between group cursor-pointer border border-slate-100 dark:border-slate-850 shadow-3xs"
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardCheck size={15} className="text-purple-500 group-hover:text-white" />
                      <span>{language === 'ar' ? 'فحص واستلام الآلية اليومي' : 'Vehicle Inspection Check'}</span>
                    </div>
                    <span className="text-[9px] opacity-60">➔</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('report')}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 hover:bg-gradient-to-r hover:from-rose-600 hover:to-purple-600 hover:text-white rounded-2xl text-xs font-black transition-all flex items-center justify-between group cursor-pointer border border-slate-100 dark:border-slate-850 shadow-3xs"
                  >
                    <div className="flex items-center gap-2">
                      <Wrench size={15} className="text-rose-500 group-hover:text-white" />
                      <span>{language === 'ar' ? 'الإبلاغ عن عطل فني طارئ' : 'Report Roadside Fault'}</span>
                    </div>
                    <span className="text-[9px] opacity-60">➔</span>
                  </button>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 2: LIVE DRIVER MAP & NAVIGATION */}
          {activeSubTab === 'map' && (
            <motion.div
              key="driver-map-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DriverLiveMap
                activeTrip={activeTrip}
                onUpdateTripStatus={(status, note) => {
                  if (activeTrip) {
                    handleUpdateTripStatus(activeTrip.id, status, note);
                  }
                }}
                onTriggerSOS={handleTriggerSOS}
                isDarkMode={isDarkMode}
              />
            </motion.div>
          )}

          {/* TAB 3: TRIPS & MISSIONS LOG */}
          {activeSubTab === 'trips' && (
            <motion.div
              key="driver-trips-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DriverTripsLog
                trips={trips}
                activeTrip={activeTrip}
                onSelectActiveTrip={(trip) => {
                  handleUpdateTripStatus(trip.id, 'in_progress');
                }}
                onUpdateTripStatus={handleUpdateTripStatus}
                onAddNewTrip={handleAddNewTrip}
              />
            </motion.div>
          )}

          {/* TAB 4: ASSIGNED PROJECTS & WORK ORDERS */}
          {activeSubTab === 'projects' && (
            <motion.div
              key="driver-projects-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DriverAssignedProjects
                projects={projects}
                onToggleTask={handleToggleProjectTask}
                onNavigateToProject={handleNavigateToProject}
              />
            </motion.div>
          )}

          {/* TAB 5: VEHICLE INSPECTION CHECKLIST */}
          {activeSubTab === 'checklist' && (
            <motion.div
              key="driver-checklist-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-xl mx-auto bg-white dark:bg-[#0f1422] p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-850/80 shadow-sm text-right"
            >
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-850 mb-5">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <ClipboardCheck size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">
                    {language === 'ar' ? 'استمارة فحص واستلام المركبة الميدانية' : 'Vehicle Handover & Custody Inspection'}
                  </h3>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">{language === 'ar' ? 'تأكد من سلامة المعايير قبل الانطلاق في نوبة العمل أو عند إعادتها' : 'Inspect critical points prior to dispatching or return'}</p>
                </div>
              </div>

              {checklistSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-sm font-black text-slate-850 dark:text-white">
                    {language === 'ar' ? 'تم اعتماد تقرير الفحص بنجاح!' : 'Inspection Certified Successfully!'}
                  </h4>
                  <p className="text-xs text-slate-450 font-semibold max-w-xs mx-auto">
                    {language === 'ar' ? 'تم ترحيل البيانات وحفظ العهدة في السجل الرقمي المركزي للأسطول.' : 'Data recorded into central fleet management database.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleChecklistSubmit} className="space-y-4 font-sans">
                  
                  {/* Type Selector (Pre-Trip / Post-Trip) */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setChecklistType('pre')}
                      className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                        checklistType === 'pre' ? 'bg-white dark:bg-[#0f1422] text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      {language === 'ar' ? '☀️ استلام قبل الانطلاق (Pre-Trip)' : '☀️ Pre-Trip Handover'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setChecklistType('post')}
                      className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                        checklistType === 'post' ? 'bg-white dark:bg-[#0f1422] text-amber-500 shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      {language === 'ar' ? '🌙 تسليم بعد العودة (Post-Trip)' : '🌙 Post-Trip Return'}
                    </button>
                  </div>

                  {/* Vehicle Selector */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                      {language === 'ar' ? 'حدد المركبة المراد فحصها' : 'Select Target Vehicle'}
                    </label>
                    <select
                      value={inspectedVehicle}
                      onChange={(e) => setInspectedVehicle(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-black dark:text-white"
                    >
                      <option value="toyota-hilux">تويوتا هيلوكس HD - [ب ل ط ٧٧٦] (مسندة لك)</option>
                      <option value="mercedes-actros">مرسيدس أكتروس نقل ثقيل - [م ط ر ٠١٢]</option>
                    </select>
                  </div>

                  {/* Inspection Points Grid */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block">
                      {language === 'ar' ? 'قائمة الفحص الميداني الإلزامي:' : 'Mandatory Inspection Items:'}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { key: 'brakes', labelAr: '1. الفرامل ودواسة التوقف', labelEn: '1. Brake Pads & Pedal' },
                        { key: 'tires', labelAr: '2. ضغط الإطارات والاحتياطي', labelEn: '2. Tire Pressure & Spare' },
                        { key: 'fluids', labelAr: '3. زيت المحرك وسوائل التبريد', labelEn: '3. Engine Oil & Coolant' },
                        { key: 'lights', labelAr: '4. الأضواء وإشارات الانعطاف', labelEn: '4. Headlights & Indicators' },
                        { key: 'engine', labelAr: '5. سلامة صوت وعزم المحرك', labelEn: '5. Engine Performance' },
                        { key: 'cleanliness', labelAr: '6. نظافة القمرة والزجاج', labelEn: '6. Cabin Cleanliness' },
                      ].map((item) => (
                        <div key={item.key} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300">
                            {language === 'ar' ? item.labelAr : item.labelEn}
                          </span>

                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setChecklistValues({ ...checklistValues, [item.key]: 'ok' })}
                              className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                                (checklistValues as any)[item.key] === 'ok'
                                  ? 'bg-emerald-500 text-white shadow-3xs'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}
                            >
                              {language === 'ar' ? 'سليم ✓' : 'OK'}
                            </button>

                            <button
                              type="button"
                              onClick={() => setChecklistValues({ ...checklistValues, [item.key]: 'issue' })}
                              className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                                (checklistValues as any)[item.key] === 'issue'
                                  ? 'bg-rose-500 text-white shadow-3xs'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}
                            >
                              {language === 'ar' ? 'ملاحظة ⚠️' : 'Issue'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes Area */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                      {language === 'ar' ? 'ملاحظات الفحص الإضافية (اختياري)' : 'Inspection Notes (Optional)'}
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
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-300 font-black text-[10.5px]">
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
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ClipboardCheck size={14} />
                    <span>{language === 'ar' ? 'تقديم تقرير الفحص والعهد' : 'Submit Checklist & Sign Custody'}</span>
                  </button>

                </form>
              )}
            </motion.div>
          )}

          {/* TAB 6: ROADSIDE FAULT REPORTING */}
          {activeSubTab === 'report' && (
            <motion.div
              key="driver-report-pane"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-xl mx-auto bg-white dark:bg-[#0f1422] p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-850/80 shadow-sm text-right"
            >
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-850 mb-5">
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
                  <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto animate-bounce">
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
                        <span>{language === 'ar' ? 'كود عطل OBD-II (٥ خانات)' : 'OBD-II Fault Code'}</span>
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
                          {language === 'ar' ? 'مثال: P0300 (اختياري)' : 'e.g., P0300 (optional)'}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                        {language === 'ar' ? 'الأعراض المشهودة' : 'Observed Symptoms'}
                      </label>
                      <select
                        value={selectedSymptom}
                        onChange={(e) => setSelectedSymptom(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-[11px] font-black text-slate-800 dark:text-white"
                      >
                        <option value="" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-black">{language === 'ar' ? '-- اختر العَرَض --' : '-- Select Symptom --'}</option>
                        <option value="overheating" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-black">{language === 'ar' ? '🔥 حرارة زائدة بالرادياتير' : '🔥 Engine Overheating'}</option>
                        <option value="noise" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-black">{language === 'ar' ? '🔊 أصوات غريبة / طقطقة محرك' : '🔊 Strange Noise / Knocking'}</option>
                        <option value="vibration" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-black">{language === 'ar' ? '📳 اهتزاز شديد أثناء الحركة' : '📳 Heavy Steering Vibration'}</option>
                        <option value="leak" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-black">{language === 'ar' ? '💧 تسريب سوائل/زيت' : '💧 Fluid/Oil Leakage'}</option>
                        <option value="power_loss" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-black">{language === 'ar' ? '📉 ضعف عزم وتسارع' : '📉 Severe Power Loss'}</option>
                        <option value="battery" className="text-slate-900 dark:text-white bg-white dark:bg-slate-900 font-black">{language === 'ar' ? '🔋 صعوبة تشغيل المحرك' : '🔋 Engine Crank Hesitation'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Priority level */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 block pb-0.5">
                      {language === 'ar' ? 'مستوى خطورة العطل وتأثيره' : 'Criticality & Urgency'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'low', labelAr: 'منخفضة (طبيعي)', labelEn: 'Low (Routine)' },
                        { id: 'medium', labelAr: 'متوسطة (عاجل)', labelEn: 'Medium (Urgent)' },
                        { id: 'high', labelAr: 'قصوى (توقف كلي!)', labelEn: 'High (Critical STOP)' },
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
                                  : 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
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
                      onChange={(e) => setReportDesc(e.target.value)}
                      placeholder={language === 'ar' ? 'اشرح بالتفصيل ماذا حدث وموقعك التقريبي إن أمكن...' : 'Describe what happened and your current location...'}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none dark:text-white"
                    />
                  </div>

                  {/* Photo Attachment */}
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

          {/* TAB 7: MY ACTIVITY LOGS / HISTORY */}
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
