import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  Wrench, 
  ShieldCheck, 
  Cpu, 
  FileText, 
  Activity, 
  Clock, 
  Users, 
  Plus, 
  Filter, 
  RotateCcw, 
  RefreshCw,
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Zap, 
  Droplets, 
  Thermometer, 
  Layers,
  Sparkles,
  Briefcase,
  Sliders,
  TrendingUp,
  ChevronLeft,
  LayoutGrid,
  LayoutList,
  Edit,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  Legend 
} from 'recharts';
import { vehicles as staticVehicles, maintenanceOrders as staticOrders, technicians as staticTechnicians } from '../data';
import { Vehicle, MaintenanceOrder, Technician, User } from '../types';
import { useLanguage } from '../services/LanguageContext';
import ContextualHelp from './ContextualHelp';

interface Workshop {
  id: string;
  name: string;
  specialization: 'mechanical' | 'electrical' | 'cooling' | 'hydraulic' | 'bodywork';
  supervisor: string;
  capacity: number;
  activeBays: number;
  currentVehicles: string[];
  status: 'operational' | 'at-capacity' | 'maintenance';
  equipment: string[];
  kpiFtr: string; // First Time Right repair rate
  avgTurnaround: string; // Average hours
  location: string;
}

const INITIAL_WORKSHOPS: Workshop[] = [
  {
    id: 'WS-1',
    name: 'ورشة الميكانيك المركزي والصيانة الثقيلة',
    specialization: 'mechanical',
    supervisor: 'م. سفيان عبدالحميد (أبو أحمد)',
    capacity: 15,
    activeBays: 8,
    currentVehicles: ['شاحنة مرسيدس أكتروس', 'رافعة شوكية كاتربيلر'],
    status: 'operational',
    equipment: ['رافعة هيدروليكية عملاقة (25 طن)', 'جهاز تصفير المحركات OBD2', 'مكبس هيدروليكي 50 طن', 'مفك نيوماتيكي ضخم'],
    kpiFtr: '94.2%',
    avgTurnaround: '5.8 ساعات',
    location: 'الزاوية الشمالية للمجمع العام (المبنى أ)',
  },
  {
    id: 'WS-2',
    name: 'وحدة الأنظمة الكهربائية والبرمجة والعدسات',
    specialization: 'electrical',
    supervisor: 'م. عمار سليم',
    capacity: 8,
    activeBays: 6,
    currentVehicles: ['تويوتا بيك أب - هايلوكس'],
    status: 'operational',
    equipment: ['جهاز تشخيص أعطال Autel Maxisys', 'جهاز فحص البطاريات المتطور', 'مقياس إلكتروني متكامل للضفائر', 'منصة معايرة الحساسات والرادارات'],
    kpiFtr: '96.8%',
    avgTurnaround: '2.5 ساعة',
    location: 'الصالة الداخلية الوسطى (المبنى ب)',
  },
  {
    id: 'WS-3',
    name: 'ورشة الأنظمة الهيدروليكية والأذرعة الميكانيكية',
    specialization: 'hydraulic',
    supervisor: 'المهندس ياسر فواز',
    capacity: 10,
    activeBays: 10,
    currentVehicles: [],
    status: 'at-capacity',
    equipment: ['جهاز قياس ضغط زيت الهيدروليك الرقمي', 'منصة خرط وتصنيع ليات الضغط العالي', 'وحدة فحص المحابس والصمامات الترددية'],
    kpiFtr: '91.0%',
    avgTurnaround: '8.4 ساعات',
    location: 'ساحة الدعم الهندسي المفتوحة (المبنى ج)',
  },
  {
    id: 'WS-4',
    name: 'وحدة السمكرة الذكية وتجفيف الدهانات الحرارية',
    specialization: 'bodywork',
    supervisor: 'الخبير جهاد طلال',
    capacity: 5,
    activeBays: 2,
    currentVehicles: ['حافلة هيونداي سيتي'],
    status: 'operational',
    equipment: ['كابينة طلاء حرارية مغلقة ومظلمة الكمبيوتر', 'جهاز سحب الهياكل الليزري (شاسيهات)', 'مسدس صقل وتجفيف أوتوماتيكي بكفاءة هواء'],
    kpiFtr: '98.5%',
    avgTurnaround: '12.0 ساعة',
    location: 'الضلع الشرقي للمجمع الميداني (المبنى د)',
  },
  {
    id: 'WS-5',
    name: 'شعبة أنظمة التبريد المتكاملة وتكييف الحافلات',
    specialization: 'cooling',
    supervisor: 'الفني المتخصص رائد ناصر',
    capacity: 6,
    activeBays: 1,
    currentVehicles: [],
    status: 'maintenance',
    equipment: ['محطة سحب وإعادة تدوير غاز الفريون R134a', 'جهاز كشف تسريب الفريون بالأشعة فوق البنفسجية', 'مكبس كباسي مخصص للمكيفات'],
    kpiFtr: '92.4%',
    avgTurnaround: '4.1 ساعات',
    location: 'جوار خزان المياه الرئيسي (المبنى أ - فرعي)',
  }
];

const SpecIcon = ({ spec, size = 18 }: { spec: Workshop['specialization']; size?: number }) => {
  switch (spec) {
    case 'electrical': return <Zap size={size} className="text-brand-yellow-500" />;
    case 'mechanical': return <Wrench size={size} className="text-brand-blue-500" />;
    case 'cooling': return <Thermometer size={size} className="text-rose-500" />;
    case 'hydraulic': return <Droplets size={size} className="text-sky-500" />;
    case 'bodywork': return <Layers size={size} className="text-emerald-500" />;
    default: return <Building2 size={size} />;
  }
};

const specText: Record<Workshop['specialization'], string> = {
  mechanical: 'ميكانيك ثقيل',
  electrical: 'كهرباء وإلكترونيات',
  hydraulic: 'هيدروليك وروافع',
  bodywork: 'سمكرة ودهانات ليزرية',
  cooling: 'تبريد وتكييف الهواء'
};

const statusMeta: Record<Workshop['status'], { label: string; color: string; bg: string; dot: string }> = {
  operational: { 
    label: '🟢 تعمل بكفاءة تامة وجاهزة للاستقبال', 
    color: 'text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300', 
    bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-150 dark:border-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 shadow-xs shadow-emerald-500/5', 
    dot: 'bg-emerald-500 animate-pulse' 
  },
  'at-capacity': { 
    label: '⚠️ نشطة بالكامل - مستنفذة للطاقة الاستيعابية', 
    color: 'text-amber-700 dark:text-amber-400 group-hover:text-amber-800 dark:group-hover:text-amber-300', 
    bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-150 dark:border-amber-900/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 shadow-xs shadow-amber-500/5', 
    dot: 'bg-amber-500 animate-bounce' 
  },
  maintenance: { 
    label: '🔧 تحت أعمال الصيانة والتحديث الفني الكلي', 
    color: 'text-rose-700 dark:text-rose-400 group-hover:text-rose-800 dark:group-hover:text-rose-300', 
    bg: 'bg-rose-50 dark:bg-rose-950/20 border-rose-150 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 shadow-xs shadow-rose-500/5', 
    dot: 'bg-rose-500 animate-pulse' 
  }
};

// دالة فحص وتصحيح لمنطق عرض 'نسبة إشغال مسارات الورش' لمنع الأخطاء وتأمين سلامة العرض والبيانات
export function validateAndSanitizeWorkshops(data: any[] | null | undefined): Workshop[] {
  if (!data || !Array.isArray(data)) return [];
  return data.map((ws: any) => {
    // 1. التحقق من السعة الكلية وتصحيحها إذا كانت مفقودة، فارغة، أو غير صالحة أو صفر لتجنب خطأ القسمة على صفر
    let capacity = Number(ws.capacity);
    if (isNaN(capacity) || capacity <= 0) {
      capacity = 5; // قيمة افتراضية آمنة تمنع القسمة على صفر
    }

    // 2. التحقق من عدد المسارات النشطة وتصحيحها إذا كانت مفقودة أو غير صالحة
    let activeBays = Number(ws.activeBays);
    if (isNaN(activeBays) || activeBays < 0) {
      activeBays = 0; // مسار افتراضي آمن
    }

    // 3. ضمان عدم تجاوز المسارات النشطة للسعة الكلية المتاحة
    if (activeBays > capacity) {
      activeBays = capacity;
    }

    return {
      ...ws,
      id: ws.id || `WS-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: ws.name || 'ورشة غير مسمى',
      specialization: ['mechanical', 'electrical', 'cooling', 'hydraulic', 'bodywork'].includes(ws.specialization)
        ? ws.specialization
        : 'mechanical',
      supervisor: ws.supervisor || 'غير محدد',
      capacity,
      activeBays,
      currentVehicles: Array.isArray(ws.currentVehicles) ? ws.currentVehicles : [],
      status: ['operational', 'at-capacity', 'maintenance'].includes(ws.status) ? ws.status : 'operational',
      equipment: Array.isArray(ws.equipment) ? ws.equipment : ['معدات يدوية أساسية'],
      kpiFtr: ws.kpiFtr || '100%',
      avgTurnaround: ws.avgTurnaround || 'غير محدد بعد',
      location: ws.location || 'غير محدد',
    };
  });
}

export default function Workshops({ user }: { user?: User }) {
  const { language, t } = useLanguage();
  const [workshops, setWorkshops] = useState<Workshop[]>(() => {
    const saved = localStorage.getItem('fleet_workshops');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return validateAndSanitizeWorkshops(parsed);
        }
      } catch (e) {
        console.error('Error parsing fleet_workshops', e);
      }
    }
    return validateAndSanitizeWorkshops(INITIAL_WORKSHOPS);
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const savedVehicles = localStorage.getItem('fleet_vehicles_v2');
    return savedVehicles ? JSON.parse(savedVehicles) : staticVehicles;
  });

  const [maintenanceOrders, setMaintenanceOrders] = useState<MaintenanceOrder[]>(() => {
    const saved = localStorage.getItem('fleet_maintenance_orders_v2');
    return saved ? JSON.parse(saved) : staticOrders;
  });

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem('fleet_technicians_v2');
    return saved ? JSON.parse(saved) : staticTechnicians;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [specFilter, setSpecFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'icons'>('grid');
  const [sortByLoad, setSortByLoad] = useState<boolean>(false);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  
  // Custom states for adding workshops
  const [newWs, setNewWs] = useState({
    name: '',
    specialization: 'mechanical' as Workshop['specialization'],
    supervisor: '',
    capacity: 6,
    equipmentString: '',
    location: '',
  });

  // Custom states for allocating vehicle
  const [allocatingVehicle, setAllocatingVehicle] = useState('');
  const [allocatingTargetWsId, setAllocatingTargetWsId] = useState('');

  // States for diagnostic and data integrity self-healing system
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [integrityStatus, setIntegrityStatus] = useState<'clean' | 'repaired' | 'idle'>('idle');

  const runIntegrityDiagnostic = () => {
    const logs: string[] = [];
    logs.push(`[${new Date().toLocaleTimeString()}] جاري بدء فحص سلامة بيانات مسارات الورش ومعدلات الإشغال...`);
    
    let corruptedCount = 0;
    const sanitized = workshops.map(ws => {
      let isCorrupted = false;
      let capacity = ws.capacity;
      let activeBays = ws.activeBays;

      if (typeof capacity !== 'number' || isNaN(capacity) || capacity <= 0) {
        logs.push(`⚠️ خلل كشف: الورشة "${ws.name}" تحتوي على سعة غير صالحة (${ws.capacity}). تم تصحيحها تلقائياً إلى القيمة الافتراضية 5.`);
        capacity = 5;
        isCorrupted = true;
      }

      if (typeof activeBays !== 'number' || isNaN(activeBays) || activeBays < 0) {
        logs.push(`⚠️ خلل كشف: الورشة "${ws.name}" تحتوي على مسارات نشطة غير صالحة (${ws.activeBays}). تم تصحيحها تلقائياً إلى 0.`);
        activeBays = 0;
        isCorrupted = true;
      }

      if (activeBays > capacity) {
        logs.push(`⚠️ تعارض كشف: الورشة "${ws.name}" تسجل مسارات نشطة (${activeBays}) تتجاوز سعة الورشة الكلية (${capacity}). تم تصحيح المسارات لتطابق السعة.`);
        activeBays = capacity;
        isCorrupted = true;
      }

      if (isCorrupted) {
        corruptedCount++;
        return {
          ...ws,
          capacity,
          activeBays
        };
      }
      return ws;
    });

    if (corruptedCount > 0) {
      setWorkshops(sanitized);
      localStorage.setItem('fleet_workshops', JSON.stringify(sanitized));
      setIntegrityStatus('repaired');
      logs.push(`✅ تم إصلاح وتهيئة ${corruptedCount} من حقول بيانات الورش التالفة تلقائياً بنجاح!`);
    } else {
      setIntegrityStatus('clean');
      logs.push(`💚 فحص سليم: كافة بيانات المسارات وسعات الإشغال متطابقة وتعمل بسلامة 100%.`);
    }

    setDiagnosticLogs(logs);
  };

  const simulateCorruptData = () => {
    // محاكاة إدخال بيانات تالفة (سعة صفر، ومسارات سالبة أو فائضة) لاختبار نظام الحماية الذاتي
    const corruptedList = workshops.map((ws, i) => {
      if (i === 0) {
        return {
          ...ws,
          capacity: 0, // سعة صفرية لتجربة القسمة على صفر
          activeBays: -2 // مسارات نشطة سالبة
        };
      }
      if (i === 1) {
        return {
          ...ws,
          capacity: 4,
          activeBays: 10 // مسارات نشطة تفوق السعة
        };
      }
      return ws;
    });
    setWorkshops(corruptedList);
    setIntegrityStatus('idle');
    setDiagnosticLogs([
      `[${new Date().toLocaleTimeString()}] 🧪 تم محاكاة بيانات تالفة في قاعدة البيانات (سعة صفرية ومسارات فائضة وسالبة)!`,
      `لاحظ كيف أن واجهات العرض تظل تعمل بأمان وتصحح القيم تلقائياً في الخلفية لمنع أي توقف أو أخطاء شاشة.`,
      `انقر على "تشغيل الفحص الذاتي وإصلاح البيانات" لحفظ النسخة السليمة في قاعدة البيانات المحلية.`
    ]);
  };

  // Edit Workshop States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWs, setEditingWs] = useState<{
    id: string;
    name: string;
    specialization: Workshop['specialization'];
    supervisor: string;
    capacity: number;
    equipmentString: string;
    location: string;
  } | null>(null);

  const handleStartEdit = (ws: Workshop) => {
    setEditingWs({
      id: ws.id,
      name: ws.name,
      specialization: ws.specialization,
      supervisor: ws.supervisor,
      capacity: ws.capacity,
      location: ws.location,
      equipmentString: (ws.equipment || []).join(', ')
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWs) return;

    if (!editingWs.name || !editingWs.supervisor || !editingWs.location) {
      alert('الرجاء تعبئة كافة الحقول المطلوبة لبيان الورشة!');
      return;
    }

    setWorkshops(prev => prev.map(ws => {
      if (ws.id === editingWs.id) {
        return {
          ...ws,
          name: editingWs.name,
          specialization: editingWs.specialization,
          supervisor: editingWs.supervisor,
          capacity: Number(editingWs.capacity) || 5,
          activeBays: Math.min(ws.activeBays, Number(editingWs.capacity) || 5),
          location: editingWs.location,
          equipment: editingWs.equipmentString 
            ? editingWs.equipmentString.split(',').map(s => s.trim()).filter(Boolean)
            : ['معدات يدوية أساسية']
        };
      }
      return ws;
    }));

    setIsEditModalOpen(false);
    setEditingWs(null);
  };

  const handleDeleteWorkshop = (wsId: string, wsName: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف بيانات الورشة (${wsName}) نهائياً؟`)) {
      setWorkshops(prev => prev.filter(ws => ws.id !== wsId));
    }
  };

  useEffect(() => {
    localStorage.setItem('fleet_workshops', JSON.stringify(workshops));
  }, [workshops]);

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.tab === 'workshops' && customEvent.detail.search) {
        setSearchTerm(customEvent.detail.search);
      }
    };
    window.addEventListener('notification-navigate', handleNavigate);
    return () => window.removeEventListener('notification-navigate', handleNavigate);
  }, []);

  const handleAddWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWs.name || !newWs.supervisor || !newWs.location) {
      alert('الرجاء تعبئة كافة الحقول المطلوبة لبيان الورشة!');
      return;
    }

    const created: Workshop = {
      id: `WS-${Date.now()}`,
      name: newWs.name,
      specialization: newWs.specialization,
      supervisor: newWs.supervisor,
      capacity: Number(newWs.capacity) || 5,
      activeBays: 0,
      currentVehicles: [],
      status: 'operational',
      equipment: newWs.equipmentString 
        ? newWs.equipmentString.split(',').map(s => s.trim()).filter(Boolean)
        : ['معدات يدوية أساسية'],
      kpiFtr: '100%',
      avgTurnaround: 'غير محدد بعد',
      location: newWs.location
    };

    setWorkshops(prev => [...prev, created]);
    setIsAddModalOpen(false);
    setNewWs({
      name: '',
      specialization: 'mechanical',
      supervisor: '',
      capacity: 6,
      equipmentString: '',
      location: ''
    });
  };

  const handleAllocateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingVehicle || !allocatingTargetWsId) {
      alert('الرجاء اختيار المركبة والورشة المستهدفة للتسكين الميداني!');
      return;
    }

    setWorkshops(prev => prev.map(ws => {
      if (ws.id === allocatingTargetWsId) {
        if (ws.currentVehicles.includes(allocatingVehicle)) return ws;
        const newVehicleList = [...ws.currentVehicles, allocatingVehicle];
        return {
          ...ws,
          currentVehicles: newVehicleList,
          activeBays: Math.min(ws.capacity, ws.activeBays + 1),
          status: newVehicleList.length >= ws.capacity ? 'at-capacity' : ws.status
        };
      }
      return ws;
    }));

    setIsAllocateModalOpen(false);
    alert('تم تسكين المركبة بالورشة المحددة وتحديث الطاقة الاستيعابية حالاً.');
  };

  // Calculate average operational efficiency (First Time Right) per specialization
  const specFtrData = useMemo(() => {
    const specs: { id: Workshop['specialization']; name: string; label: string; color: string; hoverColor: string }[] = [
      { id: 'mechanical', name: 'ميكانيك ثقيل', label: 'ميكانيك', color: '#3b82f6', hoverColor: '#2563eb' },
      { id: 'electrical', name: 'كهرباء وإلكترونيات', label: 'كهرباء', color: '#eab308', hoverColor: '#ca8a04' },
      { id: 'hydraulic', name: 'هيدروليك وروافع', label: 'هيدروليك', color: '#06b6d4', hoverColor: '#0891b2' },
      { id: 'cooling', name: 'تبريد وتكييف الهواء', label: 'تبريد', color: '#10b981', hoverColor: '#059669' },
      { id: 'bodywork', name: 'سمكرة ودهان للهياكل', label: 'سمكرة', color: '#ec4899', hoverColor: '#db2777' }
    ];

    return specs.map(spec => {
      const filtered = workshops.filter(w => w.specialization === spec.id);
      let avgFtr = 0;
      if (filtered.length > 0) {
        const sum = filtered.reduce((acc, curr) => {
          const val = parseFloat(curr.kpiFtr.replace('%', '')) || 0;
          return acc + val;
        }, 0);
        avgFtr = Math.round(sum / filtered.length);
      } else {
        if (spec.id === 'mechanical') avgFtr = 94;
        if (spec.id === 'electrical') avgFtr = 91;
        if (spec.id === 'hydraulic') avgFtr = 96;
        if (spec.id === 'cooling') avgFtr = 89;
        if (spec.id === 'bodywork') avgFtr = 92;
      }
      return {
        ...spec,
        ftr: avgFtr,
        count: filtered.length
      };
    });
  }, [workshops]);

  // Calculate system-wide occupation rate statistics for workshops
  const { totalBays, occupiedBays, occupationRate } = useMemo(() => {
    const total = workshops.reduce((acc, curr) => acc + curr.capacity, 0);
    const occupied = workshops.reduce((acc, curr) => acc + curr.activeBays, 0);
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { totalBays: total, occupiedBays: occupied, occupationRate: rate };
  }, [workshops]);

  // Filter workshops based on search term, specialization, and status
  const filteredWorkshops = useMemo(() => {
    let result = workshops.filter(ws => {
      const matchesSearch = 
        ws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ws.supervisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ws.location && ws.location.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSpec = specFilter === 'all' || ws.specialization === specFilter;
      const matchesStatus = statusFilter === 'all' || ws.status === statusFilter;
      return matchesSearch && matchesSpec && matchesStatus;
    });

    if (sortByLoad) {
      result = [...result].sort((a, b) => {
        const capA = Number(a.capacity) || 5;
        const capB = Number(b.capacity) || 5;
        const actA = Number(a.activeBays) || 0;
        const actB = Number(b.activeBays) || 0;
        const loadA = capA > 0 ? (actA / capA) : 0;
        const loadB = capB > 0 ? (actB / capB) : 0;
        return loadB - loadA; // descending order
      });
    }

    return result;
  }, [workshops, searchTerm, specFilter, statusFilter, sortByLoad]);

  const toggleWorkshopStatus = (wsId: string) => {
    setWorkshops(prev => prev.map(ws => {
      if (ws.id === wsId) {
        const statuses: Workshop['status'][] = ['operational', 'at-capacity', 'maintenance'];
        const currentIndex = statuses.indexOf(ws.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        return {
          ...ws,
          status: statuses[nextIndex]
        };
      }
      return ws;
    }));
  };

  const handleRemoveVehicleFromWorkshop = (wsId: string, vehicleName: string) => {
    setWorkshops(prev => prev.map(ws => {
      if (ws.id === wsId) {
        const updatedVehicles = ws.currentVehicles.filter(v => v !== vehicleName);
        return {
          ...ws,
          currentVehicles: updatedVehicles,
          activeBays: Math.max(0, ws.activeBays - 1),
          status: ws.status === 'at-capacity' ? 'operational' : ws.status
        };
      }
      return ws;
    }));
    alert(`تم تخريج المركبة ${vehicleName} بنجاح من الورشة المحددة.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header with Professional KPI Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0f1422] p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-brand-blue-50 dark:bg-brand-blue-900/40 text-brand-blue-600 dark:text-brand-blue-400 rounded-xl flex items-center justify-center border border-brand-blue-100/30">
              <Building2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {t('إدارة الورش والمربعات التشغيلية')}
                  <span className="text-[10px] font-black tracking-widest text-[#34d399] uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10 shrink-0">
                    {t('مدير المشروع')}
                  </span>
                </h1>
                <ContextualHelp 
                  id="workshops"
                  titleAr="منظومة إدارة الورش"
                  titleEn="Workshops Management Console"
                  explanationAr="لوحة تحكم فنية ترصد الطاقات الاستيعابية لمربعات العمل (ميكانيك، كهرباء، هيدروليك)، ومستوى الأجهزة والمعدات التشغيلية ومؤشرات نجاح الإصلاح من المرة الأولى."
                  explanationEn="A workspace control panel measuring mechanic capacity, live electrical and hydraulic bay pressures, work tool reserves, and First-Time-Right (FTR) quality ratios."
                  benefitsAr={[
                    "تسكين وتخريج الآليات بمرونة لتقليل الاختناقات الميدانية وزمن الانتظار.",
                    "توجيه المهام تلقائياً للورش المتخصصة بالأعطال الإنشائية أو الكهربائية.",
                    "رصد مؤشرات الكفاءة ومعايير جودة عمل طاقم الصيانة."
                  ]}
                  benefitsEn={[
                    "Allows fast allocation and checkout procedures to prevent bay choke points.",
                    "Guides incoming mechanical versus electrical defects to their targeted specialty lines automatically.",
                    "Tracks turnaround velocity and overall bay utilization percentages."
                  ]}
                  tipsAr={[
                    "استخدم ميزة 'تسكين مركبة بالورشة' للبدء في حجز مربع صيانة شاغر وإسناده إلى فني مختص فوريّاً."
                  ]}
                  tipsEn={[
                    "Check the live heatmap below for low workload bays to efficiently route emergency vehicle repairs."
                  ]}
                  language={language}
                />
              </div>
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 text-right">{t('تتبع توزيع الأصول، الطاقات الاستيعابية، كفاءة الرافعات والعدد الفنية المتخصصة داخل المجمّع العام لميكانيك 360.')}</p>
            </div>
          </div>
        </div>
        
        {/* PM Quick Actions */}
        <div className="flex items-center gap-2.5 self-end md:self-center">
          <button
            onClick={() => {
              setShowDiagnostics(prev => !prev);
              if (!showDiagnostics) {
                runIntegrityDiagnostic();
              }
            }}
            className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border ${
              showDiagnostics 
                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-transparent text-slate-700 dark:text-slate-200'
            }`}
            title="فحص وتصحيح بيانات إشغال الورش تلقائياً"
          >
            <ShieldCheck size={14} className={showDiagnostics ? "text-indigo-500 animate-pulse" : "text-slate-500"} />
            <span>{t('تشخيص سلامة المسارات')}</span>
          </button>

          <button
            onClick={() => setSortByLoad(prev => !prev)}
            className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border ${
              sortByLoad 
                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-transparent text-slate-700 dark:text-slate-200'
            }`}
            title="فرز تنازلي حسب نسبة إشغال الورش"
          >
            <RefreshCw size={14} className={sortByLoad ? "animate-spin text-amber-500" : "text-slate-500"} />
            <span>{t('الترتيب التلقائي حسب نسبة الإشغال')}</span>
          </button>

          {user?.role !== 'viewer' && (
            <button
              onClick={() => setIsAllocateModalOpen(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Activity size={14} className="text-brand-blue-500" />
              <span>{t('تسكين مركبة بالورشة')}</span>
            </button>
          )}
          
          {user?.role === 'admin' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-brand-blue-600 hover:bg-brand-blue-700 text-white text-xs font-black rounded-xl shadow-lg shadow-brand-blue-500/15 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus size={14} />
              <span>{t('تأسيس ورشة جديدة')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Self-Healing Diagnostic Panel */}
      <AnimatePresence>
        {showDiagnostics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-slate-900 via-[#10162a] to-slate-900 text-white rounded-3xl p-5 border border-indigo-500/20 shadow-xl space-y-4 font-sans text-right">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-550/20 text-indigo-400 rounded-lg">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">نظام التشخيص الفوري الذاتي وحماية سلامة البيانات</h3>
                    <p className="text-[10px] text-slate-400">يقوم تلقائياً بفحص اتساق البيانات، وإصلاح تالفها، وتجنب أخطاء القسمة على صفر أو القيم الناقصة بالمسارات.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={simulateCorruptData}
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-[10.5px] font-black text-rose-400 transition-all cursor-pointer"
                  >
                    🧪 محاكاة بيانات تالفة للتجربة
                  </button>
                  <button
                    type="button"
                    onClick={runIntegrityDiagnostic}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-[10.5px] font-black text-white transition-all shadow-md shadow-emerald-600/15 cursor-pointer"
                  >
                    🚀 تشغيل الفحص الذاتي وإصلاح البيانات
                  </button>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-xs font-bold">
                <span>الحالة الحالية لقاعدة البيانات:</span>
                {integrityStatus === 'clean' && (
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">💚 سليمة وبدون أخطاء (100% متطابقة)</span>
                )}
                {integrityStatus === 'repaired' && (
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md animate-pulse">🛠️ تم الإصلاح التلقائي وتأمين القيم</span>
                )}
                {integrityStatus === 'idle' && (
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">⚠️ في انتظار بدء الفحص الفني</span>
                )}
              </div>

              {/* Console Logs */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-3.5 space-y-1.5 font-mono text-[10.5px] text-right text-slate-300 max-h-48 overflow-y-auto no-scrollbar">
                {diagnosticLogs.length > 0 ? (
                  diagnosticLogs.map((log, index) => (
                    <div key={index} className={`leading-relaxed ${log.includes('⚠️') ? 'text-amber-400' : log.includes('✅') || log.includes('💚') ? 'text-emerald-400' : 'text-slate-350'}`}>
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-center py-2">لا توجد سجلات حالياً. انقر على تشغيل الفحص لبدء المراقبة الذاتية.</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Broad Basic Information Stats Box - Critical for Project Manager */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl border bg-indigo-100/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/40 hover:border-indigo-300 shadow-md hover:shadow-lg transition-all duration-300 -translate-y-[1px] hover:-translate-y-[3px] flex items-center justify-between group">
          <div className="space-y-1.5 text-right">
            <span className="text-[10px] font-black text-indigo-800 dark:text-indigo-300 block leading-none">{t('إجمالي الورش القائمة بالميدان')}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-indigo-955 dark:text-indigo-100">{workshops.length}</span>
              <span className="text-[10px] text-indigo-750 dark:text-indigo-400">{t('وحدات تتبع مدمجة')}</span>
            </div>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-0.5 mt-1 bg-white/60 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-md w-fit">
              <CheckCircle2 size={10} /> 100% {t('جاهزية اتصالات الاستشعار')}
            </span>
          </div>
          <div className="w-12 h-12 bg-white/90 dark:bg-indigo-905/60 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs shrink-0 transition-transform duration-300 group-hover:scale-110">
            <Building2 size={22} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl border bg-amber-100/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40 hover:border-amber-300 shadow-md hover:shadow-lg transition-all duration-300 -translate-y-[1px] hover:-translate-y-[3px] flex items-center justify-between group">
          <div className="space-y-1.5 text-right">
            <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 block leading-none">{t('معدل انشغال خطوط الفحص')}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-955 dark:text-indigo-100">{occupationRate}%</span>
              <span className="text-[10px] text-amber-750 dark:text-amber-450">({occupiedBays} {t('من أصل')} {totalBays} {t('مسارات')})</span>
            </div>
            <span className="text-[9px] text-amber-900/95 dark:text-amber-300 font-extrabold flex items-center gap-0.5 mt-1 bg-white/60 dark:bg-amber-950/20 px-1.5 py-0.5 rounded-md w-fit">
              {t('طاقة استيعابية تشغيلية متوازنة')}
            </span>
          </div>
          <div className="w-12 h-12 bg-white/90 dark:bg-amber-905/60 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs shrink-0 transition-transform duration-300 group-hover:scale-110">
            <Activity size={22} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl border bg-emerald-100/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-300 shadow-md hover:shadow-lg transition-all duration-300 -translate-y-[1px] hover:-translate-y-[3px] flex items-center justify-between group">
          <div className="space-y-1.5 text-right">
            <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 block leading-none">{t('مؤشر جودة نجاح الإصلاح الأول FTR')}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-955 dark:text-indigo-100">93.9%</span>
              <span className="text-[10px] text-emerald-750 dark:text-emerald-400">{t('إجمالي الورش')}</span>
            </div>
            <span className="text-[9px] text-emerald-700 dark:text-emerald-355 font-extrabold flex items-center gap-0.5 mt-1 bg-white/60 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-md w-fit">
              <TrendingUp size={10} /> +1.2% {t('تحسن في الأداء الربع سنوي')}
            </span>
          </div>
          <div className="w-12 h-12 bg-white/90 dark:bg-emerald-905/60 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs shrink-0 transition-transform duration-300 group-hover:scale-110">
            <Wrench size={22} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl border bg-violet-100/80 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900/40 hover:border-violet-300 shadow-md hover:shadow-lg transition-all duration-300 -translate-y-[1px] hover:-translate-y-[3px] flex items-center justify-between group">
          <div className="space-y-1.5 text-right">
            <span className="text-[10px] font-black text-violet-800 dark:text-violet-300 block leading-none">{t('متوسط دورة إقامة المركبة بالمسار')}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-violet-955 dark:text-indigo-100">5.9 س</span>
              <span className="text-[10px] text-violet-750 dark:text-violet-400">{t('من الفحص للتخريج الميداني')}</span>
            </div>
            <span className="text-[9px] text-violet-700/90 dark:text-violet-305 font-medium block mt-1 bg-white/60 dark:bg-violet-905/20 px-1.5 py-0.5 rounded-md w-fit">{t('تحديث ديناميكي كل 12 ساعة')}</span>
          </div>
          <div className="w-12 h-12 bg-white/90 dark:bg-violet-905/60 rounded-2xl flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-xs shrink-0 transition-transform duration-300 group-hover:scale-110">
            <Clock size={22} />
          </div>
        </div>

      </div>

      {/* FTR Operational Efficiency Distribution Chart Card */}
      <div className="bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3.5 border-b border-slate-150/50 dark:border-slate-800/60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{t('توزيع كفاءة العمليات (First Time Right) عبر الأقسام التقنية')}</span>
                  <span className="hidden sm:inline-block text-[9.5px] font-black tracking-widest text-[#34d399] uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10 shrink-0">{t('مؤشر كفاءة الإصلاح الأمني FTR')}</span>
                </h2>
                <ContextualHelp 
                  id="workshops-ftr"
                  titleAr="مؤشر نجاح الإصلاح من المرة الأولى"
                  titleEn="First Time Right (FTR) Metric"
                  explanationAr="مقياس جودة تشغيلي يقيس النسبة المئوية للمركبات التي تم إصلاحها بنجاح تام من المرة الأولى للفحص دون الحاجة لإعادة الخدمة أو مواجهة تكرار لنفس العطل."
                  explanationEn="A core quality metric tracing the percentage of repairs completed successfully on the first attempt, preventing redundant labor cycles or repetitive vehicle recalls."
                  benefitsAr={[
                    "توفير زمن الفنيين وقطع الغيار بنسبة تصل إلى 25%.",
                    "تعزيز سلامة وموثوقية المركبات على الطرق السريعة.",
                    "تقييم مباشر لمهارة وقدرة موظفي التشخيص الفني بالورشة."
                  ]}
                  benefitsEn={[
                    "Optimizes technician schedules and preserves spare parts.",
                    "Boosts absolute road safety index scores.",
                    "Enables clear quality rating audits for each diagnostics engineer."
                  ]}
                  tipsAr={[
                    "إذا انخفض مؤشر FTR عن 90% في قسم معين، ننصح بجدولة دورة تدريبية سريعة للفنيين على استخدام أجهزة فحص الأعطال الحديثة."
                  ]}
                  tipsEn={[
                    "If FTR slips below 90% in any bay, schedule training for advanced computational diagnostics tools."
                  ]}
                  language={language}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                رصد فوري لنسب نجاح المهام الفنية من المرة الأولى للفحص والتشخيص الفعلي في كل قسم. انقر على أي عمود بالرسم البياني لتصفية الورش تلقائياً والمطابقة الفورية.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] font-black bg-slate-50/80 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-150 dark:border-slate-900 shrink-0">
            <span className="text-slate-400">مستهدف الجودة العام:</span>
            <span className="text-[#34d399] font-black" dir="ltr">≥ 90.0%</span>
          </div>
        </div>

        {/* Chart Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Recharts BarChart container */}
          <div className="lg:col-span-8 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={specFtrData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barSize={32}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
                <XAxis 
                  dataKey="label" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                />
                <YAxis 
                  domain={[70, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(100, 116, 139, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950/95 dark:bg-[#080d1a]/95 text-white p-3.5 rounded-2xl border border-slate-800 shadow-xl text-xs space-y-1 text-right" dir="rtl">
                          <p className="font-extrabold">{data.name}</p>
                          <p className="text-[#34d399] font-black font-mono">الكفاءة: {data.ftr}% FTR</p>
                          <p className="text-slate-400 font-bold">عدد الورش: {data.count}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="ftr"
                  onClick={(data) => {
                    const id = data?.id || data?.payload?.id;
                    if (id) {
                      setSpecFilter(prev => prev === id ? 'all' : id);
                    }
                  }}
                  radius={[6, 6, 0, 0]}
                >
                  {specFtrData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="cursor-pointer transition-all duration-300 hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Quick Metrics & Highlights Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="space-y-1">
              <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider animate-fade-in">
                ترتيب أقسام كفاءة الإصلاح الأول (FTR)
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">معدل نجاح المهام الفنية من المحاولة الأولى</p>
            </div>

            <div className="space-y-2">
              {specFtrData.map((entry) => (
                <button 
                  key={entry.id}
                  onClick={() => setSpecFilter(prev => prev === entry.id ? 'all' : entry.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                    specFilter === entry.id 
                      ? 'bg-brand-blue-50/50 dark:bg-brand-blue-950/20 border-brand-blue-200/50 dark:border-brand-blue-800/50' 
                      : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[10px] font-extrabold text-[#1d2939] dark:text-slate-200">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-bold text-slate-400">{entry.count} ورش</span>
                    <span className="text-xs font-black" style={{ color: entry.color }} dir="ltr">
                      {entry.ftr}%
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-2.5 bg-brand-blue-50/10 dark:bg-brand-blue-900/10 border border-brand-blue-100/30 dark:border-slate-800/60 rounded-xl text-[10px] text-slate-550 dark:text-slate-400 leading-relaxed">
              💡 <strong>فحص الأثر الميداني:</strong> انقر على اسم القسم أو عمود بالرسم البياني لتنبيه وضبط الفلاتر لمراجعة ورشه الإنشائية سريعاً.
            </div>
        </div>
        </div>
      </div>

      {/* --- WORKLOAD HEATMAP --- */}
      <div className="bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3.5 border-b border-slate-150/50 dark:border-slate-800/60 font-sans">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <Activity size={20} className="animate-pulse text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>الخريطة الحرارية لمؤشر ضغط العمل والترشيح التفاعلي (Heatmap)</span>
                  <span className="hidden sm:inline-block text-[9.5px] font-black tracking-widest text-[#f59e0b] uppercase bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/10 shrink-0">مستوى الإشغال الميداني</span>
                </h2>
                <ContextualHelp 
                  id="workshops-heatmap"
                  titleAr="الخريطة الحرارية لضغط العمل"
                  titleEn="Workload Density Heatmap"
                  explanationAr="خريطة بصرية تفاعلية توضح مدى إشغال مربعات الصيانة المختلفة (ممتلئ تماماً، ضغط متوسط، أو يحوي مساحة شاغرة) لمساعدتك في التوجيه السريع للأعطال الطارئة والتوظيف الأمثل."
                  explanationEn="An interactive, color-coded visual grid displaying real-time space utilization across mechanical, electrical, and body bays for smarter repair dispatching and employee tracking."
                  benefitsAr={[
                    "توزيع متكافئ وسلسل لمهام الصيانة لتجنب الضغط على ورشة دون غيرها.",
                    "الرصد الآني والحراري المباشر للطاقة الاستيعابية للأسطول بالمشروع.",
                    "الكشف الفوري عن الفنيين المتاحين لكل تخصص بكبسة زر واحدة."
                  ]}
                  benefitsEn={[
                    "Ensures balanced workloads across different mechanical departments.",
                    "Provides instantaneous tracking of open slot capabilities.",
                    "Brings up lists of idle specialists for rapid assignment on the fly."
                  ]}
                  tipsAr={[
                    "انقر على أي خلية أو ورشة ملونة في الخريطة لتصفية جدول الورش بالأسفل فوريّاً وعرض التفاصيل الفنية وطواقم العمل وسعة المربعات."
                  ]}
                  tipsEn={[
                    "Click on any cell in the heatmap grid to immediately filter data lists and isolate specific worker logs."
                  ]}
                  language={language}
                />
              </div>
              <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-1 leading-relaxed">
                رصد فوري لدرجة ضغط وسعة الورش ملوّنة حرارياً (🔴 ضغط عمل حرج، 🟡 ضغط متوسط، 🟢 متاح ومستقر) مع الكشف التلقائي عن الفنيين المتاحين للعمل فوريّاً. انقر على أي ورشة لتصفيتها بالجدول أدناه.
              </p>
            </div>
          </div>

          {/* Color Code Legend */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-900 text-[10px] font-bold">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span className="text-slate-600 dark:text-slate-400">🔴 حرج (≥75%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span className="text-slate-600 dark:text-slate-400">🟡 متوسط (35-74%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-600 dark:text-slate-400">🟢 منخفض (&lt;35%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
              <span className="text-slate-600 dark:text-slate-400">🔧 صيانة المرفق</span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 font-sans">
          {workshops.map((ws) => {
            const safeCap = Number(ws.capacity) || 5;
            const safeAct = Math.min(Math.max(0, Number(ws.activeBays) || 0), safeCap);
            const occupancyRate = safeCap > 0 ? Math.round((safeAct / safeCap) * 100) : 0;
            const shopActiveOrders = maintenanceOrders.filter(
              (o) => o.workshopId === ws.id && o.status !== 'completed'
            );
            const activeOrdersCount = shopActiveOrders.length;

            // Determine pressure status code
            let pressureLevel: 'critical' | 'moderate' | 'low' | 'maintenance' = 'low';
            if (ws.status === 'maintenance') {
              pressureLevel = 'maintenance';
            } else if (occupancyRate >= 75 || ws.status === 'at-capacity' || activeOrdersCount >= 3) {
              pressureLevel = 'critical';
            } else if (occupancyRate >= 35 || activeOrdersCount >= 1) {
              pressureLevel = 'moderate';
            }

            // Find available technicians for this workshop's specialization
            const availableTechs = technicians.filter(
              (t) => t.specialization === ws.specialization && t.status === 'available'
            );

            let levelLabel = '';
            let statusColorLine = 'bg-emerald-500';

            switch (pressureLevel) {
              case 'critical':
                statusColorLine = 'bg-rose-500';
                levelLabel = '🔴 ضغط حرج';
                break;
              case 'moderate':
                statusColorLine = 'bg-amber-500';
                levelLabel = '🟡 ضغط متوسط';
                break;
              case 'low':
                statusColorLine = 'bg-emerald-500';
                levelLabel = '🟢 عبء منخفض';
                break;
              case 'maintenance':
                statusColorLine = 'bg-slate-400';
                levelLabel = '🔧 خط الصيانة';
                break;
            }

            // Interactive filter check
            const isCurrentlyFiltered = searchTerm === ws.name;

            return (
              <div
                key={ws.id}
                onClick={() => {
                  // Toggle filter on click
                  if (searchTerm === ws.name) {
                    setSearchTerm('');
                  } else {
                    setSearchTerm(ws.name);
                  }
                }}
                className={`bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-105 dark:border-slate-805/80 p-3 sm:p-4 pb-3 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 aspect-square select-none ${
                  isCurrentlyFiltered ? 'ring-2 ring-brand-blue-500 border-transparent scale-[1.02]' : ''
                }`}
              >
                {/* Horizontal status line at top */}
                <div className={`absolute top-0 right-0 left-0 h-0.5 ${statusColorLine}`} />

                {/* Cell Corner Indicator (Glow) */}
                {pressureLevel === 'critical' && (
                  <span className="absolute top-2.5 left-2.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                  </span>
                )}

                <div className="space-y-1.5 flex-1 flex flex-col justify-between min-h-0">
                  {/* Top card info: Icon + Name + Specialty classification */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9.5 h-9.5 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 dark:bg-[#151c2e] dark:border-slate-850 shrink-0 shadow-xs flex items-center justify-center">
                      <div className="w-full h-full flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50">
                        <SpecIcon spec={ws.specialization} size={16} />
                      </div>
                    </div>
                    
                    <div className="text-right flex-1 min-w-0">
                      <h3 className="text-[11px] sm:text-[12.5px] font-black text-slate-900 dark:text-white truncate group-hover:text-brand-blue-500 transition-colors leading-tight" title={ws.name}>
                        {ws.name}
                      </h3>
                      <div className="text-[8.5px] sm:text-[9.5px] text-slate-455 dark:text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                        <MapPin size={8} className="text-slate-450 shrink-0" />
                        <span className="truncate">{ws.location ? (ws.location.split('(')[0] || '').trim() : 'غير محدد'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sub-specialty classification text badge */}
                  <div className="flex items-center justify-between text-[8.5px] sm:text-[9.5px] font-bold text-slate-500 dark:text-slate-405 gap-1 border-t border-slate-50 dark:border-slate-850/40 pt-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">التخصص الفني:</span>
                    <span className="text-[9.5px] font-black tracking-wider uppercase bg-slate-50 dark:bg-slate-900/60 px-1.5 py-0.5 rounded-md min-w-[50px] text-center">
                      {specText[ws.specialization]}
                    </span>
                  </div>

                  {/* Capacity Plate styled as a real plate */}
                  <div className="relative">
                    <div className="inline-flex bg-slate-50 dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-black font-mono text-slate-800 dark:text-slate-200 tracking-wider text-center w-full justify-center items-center shadow-inner select-none h-6 truncate">
                      معدل الصيانة: {ws.avgTurnaround}
                    </div>
                  </div>

                  {/* 4 Dashboard cells (Status, Tasks, Capacity, KPI) */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {/* Cell 1: Occupancy State */}
                    <div className="bg-slate-50/70 dark:bg-slate-905/60 p-1 px-1.5 rounded-lg border border-slate-105/10 dark:border-slate-850">
                      <span className="text-[7.5px] sm:text-[8px] text-slate-405 block leading-tight font-bold">نسبة الإشغال:</span>
                      <div className="mt-0.5 text-[9.5px] sm:text-[10.5px] font-black font-mono text-brand-blue-600 dark:text-brand-blue-400">
                        {occupancyRate}%
                      </div>
                    </div>
                    {/* Cell 2: In-shop volume */}
                    <div className="bg-slate-50/70 dark:bg-[#131b31]/40 p-1 px-1.5 rounded-lg border border-slate-105/10 dark:border-slate-850">
                      <span className="text-[7.5px] sm:text-[8px] text-slate-405 block leading-tight font-bold">المهام الجارية:</span>
                      <div className="mt-0.5 text-[9.5px] sm:text-[10.5px] font-black text-rose-600 dark:text-rose-450 flex items-center gap-0.5">
                        <Wrench size={8} className="w-1.5 h-1.5 shrink-0" />
                        <span>{activeOrdersCount} طلب</span>
                      </div>
                    </div>
                    {/* Cell 3: KPI first-run success rate */}
                    <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-1 px-1.5 rounded-lg border border-emerald-500/10 dark:border-emerald-500/20">
                      <span className="text-[7.5px] sm:text-[8px] text-emerald-600 dark:text-emerald-400 block leading-tight font-bold">كفاءة المرفق FTR:</span>
                      <div className="mt-0.5 text-[9.5px] sm:text-[10.5px] font-black text-emerald-700 dark:text-emerald-500 flex items-center gap-0.5">
                        <Activity size={8} className="text-emerald-500 shrink-0" />
                        <span>{ws.kpiFtr}</span>
                      </div>
                    </div>
                    {/* Cell 4: Available Techs */}
                    <div className="bg-brand-blue-500/5 dark:bg-brand-blue-500/10 p-1 px-1.5 rounded-lg border border-brand-blue-500/10 dark:border-brand-blue-500/20">
                      <span className="text-[7.5px] sm:text-[8px] text-brand-blue-600 dark:text-brand-blue-405 block leading-tight font-bold">فنيون متاحون:</span>
                      <div className="mt-0.5 text-[9.5px] sm:text-[10.5px] font-black text-brand-blue-650 dark:text-brand-blue-400 flex items-center gap-0.5">
                        <Users size={8} className="text-brand-blue-500 shrink-0" />
                        <span>{availableTechs.length} شاغر</span>
                      </div>
                    </div>
                  </div>

                  {/* Occupancy progress bar at bottom */}
                  <div className="pt-1.5 space-y-1">
                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden block">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          pressureLevel === 'critical' 
                            ? 'bg-rose-500' 
                            : pressureLevel === 'moderate' 
                              ? 'bg-amber-500' 
                              : pressureLevel === 'low' 
                                ? 'bg-emerald-500' 
                                : 'bg-slate-400'
                        }`}
                        style={{ width: `${occupancyRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Alert Row & Matching Tag indicator */}
                  <div className="flex items-center justify-between text-[9px] font-extrabold border-t border-slate-50 dark:border-slate-850/45 pt-1.5">
                    <span className={pressureLevel === 'critical' ? 'text-rose-500 font-extrabold flex items-center gap-1 animate-pulse' : 'text-slate-500 dark:text-slate-400'}>
                      {levelLabel}
                    </span>
                    <span className="text-[8.5px] text-slate-400 dark:text-slate-500 font-medium">
                      {isCurrentlyFiltered ? 'تصفية نشطة 🔒' : 'انقر للتصفية 🔍'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PM Smart Filtering Control Bar */}
      <div className="bg-white dark:bg-[#0f1422] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-4 justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-sm flex-1">
          <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
            <Search size={14} />
          </span>
          <input 
            type="text"
            placeholder="البحث باسم الورشة، المشرف، الموقع الإنشائي..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-brand-blue-500 rounded-lg transition-all outline-none text-xs font-bold dark:text-white"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-start md:justify-end shrink-0 overflow-x-auto pb-1 md:pb-0">
          
          <div className="flex items-center gap-1">
            <Filter size={12} className="text-slate-400 shrink-0" />
            <span className="text-[10px] font-black text-slate-400 ml-1">التخصص:</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 p-1 rounded-lg">
            {['all', 'mechanical', 'electrical', 'hydraulic', 'cooling', 'bodywork'].map((spec) => (
              <button
                key={spec}
                onClick={() => setSpecFilter(spec)}
                className={`px-3 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer_btn ${
                  specFilter === spec
                    ? 'bg-brand-blue-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {spec === 'all' ? 'الكل' : specText[spec as Workshop['specialization']]}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Status filter dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1 px-2.5 bg-slate-50 dark:bg-slate-900 border-none text-[10px] font-black rounded-lg text-slate-650 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="all">كل حالات النشاط</option>
            <option value="operational">نشطة ومتاحة</option>
            <option value="at-capacity">مكتملة ومزدحمة</option>
            <option value="maintenance">تحت الصيانة</option>
          </select>

          {/* Reset Filters */}
          {(searchTerm || specFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSpecFilter('all');
                setStatusFilter('all');
              }}
              className="p-1.5 text-slate-400 hover:text-brand-blue-600 dark:hover:text-brand-blue-450 rounded-lg bg-slate-100 dark:bg-slate-800 transition-all cursor-pointer flex items-center gap-1"
              title="إعادة ضبط الفلاتر"
            >
              <RotateCcw size={12} />
              <span className="text-[9px] font-black">تصفير</span>
            </button>
          )}

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-850" />

          {/* View Mode Toggle Buttons - Custom design matching user spec */}
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <span className="text-[11px] font-bold text-slate-550 dark:text-slate-400">
              طريقة العرض:
            </span>
            <div className="flex items-center border border-slate-900 dark:border-slate-800 bg-[#f8fafc]/90 dark:bg-slate-950/40 p-0.5 rounded-full shadow-3xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`py-1 px-3.5 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-[0_1.5px_3px_rgba(0,0,0,0.08)] font-black'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-705 dark:hover:text-slate-350'
                }`}
                title="عرض كبطاقات تفصيلية"
              >
                <span className="text-[10.5px] font-black">الشبكة</span>
                <LayoutGrid size={11} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('icons')}
                className={`py-1 px-3.5 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                  viewMode === 'icons'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-[0_1.5px_3px_rgba(0,0,0,0.08)] font-black'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-750 dark:hover:text-slate-350'
                }`}
                title="عرض كقائمة مبسطة"
              >
                <span className="text-[10.5px] font-black">القائمة</span>
                <LayoutList size={11} />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Main Grid displaying Physical Workshop Layout and details */}
      <div className={viewMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "grid grid-cols-1 gap-2.5"}>
        <AnimatePresence>
          {filteredWorkshops.map((ws) => {
            const meta = statusMeta[ws.status];

            const specColors: Record<string, string> = {
              mechanical: 'border-r-[6px] border-r-blue-500 hover:bg-blue-500/5',
              electrical: 'border-r-[6px] border-r-amber-500 hover:bg-amber-500/5',
              hydraulic: 'border-r-[6px] border-r-fuchsia-500 hover:bg-fuchsia-500/5',
              cooling: 'border-r-[6px] border-r-cyan-500 hover:bg-cyan-500/5',
              bodywork: 'border-r-[6px] border-r-emerald-500 hover:bg-emerald-500/5',
            };
            const specStripe = specColors[ws.specialization] || 'border-r-[6px] border-r-brand-blue-500';

            if (viewMode === 'icons') {
              return (
                <motion.div
                  key={ws.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-white dark:bg-[#0f1422] rounded-[1.25rem] border border-slate-105 dark:border-slate-800/85 hover:shadow-lg transition-all p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative group cursor-pointer ${specStripe}`}
                  onClick={() => setSelectedWorkshop(ws)}
                >
                  {/* Workshop Icon, Name, Specialization */}
                  <div className="flex items-center gap-3 min-w-[200px] max-w-full md:max-w-[260px] truncate">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800/80 group-hover:bg-brand-blue-50/50 dark:group-hover:bg-brand-blue-950/20 transition-all shadow-inner group-hover:scale-105 shrink-0">
                      <SpecIcon spec={ws.specialization} size={18} />
                    </div>
                    <div className="space-y-0.5 truncate">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-brand-blue-500 transition-colors truncate" title={ws.name}>
                        {ws.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-slate-500 font-bold">
                        <span>{specText[ws.specialization]}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><MapPin size={8} /> {ws.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Supervisor */}
                  <div className="flex items-center gap-1.5 min-w-[130px] shrink-0">
                    <span className="text-[10px] text-slate-400 font-extrabold">المشرف المسؤول:</span>
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">👤 {ws.supervisor}</span>
                  </div>

                  {/* Occupied bays progress / capacity with nice mini bar */}
                  {(() => {
                    const safeCap = Number(ws.capacity) || 5;
                    const safeAct = Math.min(Math.max(0, Number(ws.activeBays) || 0), safeCap);
                    const pct = safeCap > 0 ? Math.round((safeAct / safeCap) * 100) : 0;
                    return (
                      <div className="flex flex-col gap-1 min-w-[130px] shrink-0">
                        <div className="flex items-center justify-between text-[9px] font-black">
                          <span className="text-slate-400">إشغال الممرات:</span>
                          <span className="text-slate-700 dark:text-slate-350 font-mono">{safeAct} / {safeCap} ممر</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="bg-brand-blue-50 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {/* FTR Rate KPI */}
                  <div className="flex items-center gap-1.5 min-w-[70px] shrink-0 text-[10px] font-black">
                    <span className="text-slate-400">كفاءة الفحص:</span>
                    <span className="text-emerald-500 font-mono">{ws.kpiFtr}</span>
                  </div>

                  {/* Vehicles currently in the shop */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-[150px] overflow-hidden justify-start md:justify-center">
                    <span className="text-[9px] font-black text-slate-400 shrink-0">الآليات بالورشة:</span>
                    <div className="flex gap-1 overflow-x-auto py-0.5 no-scrollbar">
                      {ws.currentVehicles.length > 0 ? (
                        ws.currentVehicles.map((vh, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-brand-blue-50/50 dark:bg-[#151d30] text-brand-blue-600 dark:text-brand-blue-400 rounded-md text-[8px] font-black border border-brand-blue-100/10 shrink-0">
                            {vh}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">شاغرة ومتاحة</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 md:self-center" onClick={(e) => e.stopPropagation()}>
                    {user?.role === 'admin' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(ws)}
                          className="p-1.5 px-2.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/45 rounded-xl text-[9px] font-black text-amber-600 dark:text-amber-400 cursor-pointer transition-colors"
                          title="تعديل بيانات الورشة"
                        >
                          تعديل ✍️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWorkshop(ws.id, ws.name)}
                          className="p-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/40 dark:hover:bg-rose-900/45 rounded-xl text-[9px] font-black text-rose-600 dark:text-rose-400 cursor-pointer transition-colors"
                          title="حذف بيانات الورشة"
                        >
                          حذف 🗑️
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleWorkshopStatus(ws.id)}
                          className={`text-[9px] font-black px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all duration-200 hover:scale-[1.03] ${meta.bg} ${meta.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                          <span>{meta.label}</span>
                        </button>
                      </>
                    ) : null}

                    {user?.role !== 'viewer' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAllocatingTargetWsId(ws.id);
                          setIsAllocateModalOpen(true);
                        }}
                        className="p-1.5 px-3 bg-brand-blue-50 hover:bg-brand-blue-105 dark:bg-brand-blue-95/40 dark:hover:bg-brand-blue-90/45 rounded-xl text-[9px] font-black text-brand-blue-600 dark:text-brand-blue-400 cursor-pointer transition-colors"
                        title="تسكين آلية جديدة"
                      >
                        تسكين آلية 🔓
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">عرض فقط 👁️</span>
                    )}
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={ws.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-105 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between ${specStripe}`}
              >
                {/* Workshop Header section */}
                <div className="p-6 border-b border-slate-50 dark:border-slate-850 space-y-3 bg-slate-50/30 dark:bg-slate-950/10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                        <SpecIcon spec={ws.specialization} size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">{ws.name}</h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-bold flex items-center gap-1">
                          <MapPin size={10} className="text-slate-450" />
                          <span>{ws.location}</span>
                        </p>
                      </div>
                    </div>
                    {/* Status Badge */}
                    <button
                      onClick={() => toggleWorkshopStatus(ws.id)}
                      className={`text-[9px] font-black shrink-0 px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all duration-300 ease-in-out hover:scale-[1.03] active:scale-95 cursor-pointer ${meta.bg} ${meta.color}`}
                      title="اضغط للتغيير السريع لحالة النشاط"
                    >
                      <span className={`w-2 h-2 rounded-full shadow-xs ${meta.dot}`} />
                      <span className="tracking-tight">{meta.label}</span>
                    </button>
                  </div>

                  {/* Core KPI micro-metrics inside each workshop card */}
                  <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block">نسبة الفحص الأولاد (FTR)</span>
                      <span className="text-xs font-black text-emerald-500 mt-0.5 block">{ws.kpiFtr}</span>
                    </div>
                    <div className="text-center border-x border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block">دورة الصيانة الوسيطة</span>
                      <span className="text-xs font-black text-brand-blue-500 mt-0.5 block">{ws.avgTurnaround}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block">معدل الإشغال الجاري</span>
                      <span className="text-xs font-black text-purple-500 mt-0.5 block">{ws.activeBays} / {ws.capacity}</span>
                    </div>
                  </div>
                </div>

                {/* Supervisor, Equipment List & Active Vehicles */}
                <div className="p-6 space-y-4">
                  
                  {/* Supervisor */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                      <Briefcase size={12} />
                      <span>المشرف الفني المسؤول:</span>
                    </span>
                    <span className="font-extrabold text-[#34d399] dark:text-emerald-400">{ws.supervisor}</span>
                  </div>

                  {/* Equipment list */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-505 block">الأدوات والمعدات المتاحة بالموقع:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {ws.equipment.map((eq, i) => (
                        <span 
                          key={i}
                          className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-150/50 dark:border-slate-800/60 rounded-md text-[9px] font-bold text-slate-650 dark:text-slate-350"
                        >
                          ⚙️ {eq}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Vehicles in the Shop */}
                  <div className="pt-2 border-t border-slate-100/60 dark:border-slate-850/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">المركبات القابعة بالخدمة الفنية حالياً ({ws.currentVehicles.length}):</span>
                      {ws.currentVehicles.length === 0 && (
                        <span className="text-[9px] text-emerald-500 font-black">متاحة لاستقبال الآليات 🟢</span>
                      )}
                    </div>

                    {ws.currentVehicles.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ws.currentVehicles.map((vhName, keyIdx) => (
                          <div 
                            key={keyIdx}
                            className="bg-brand-blue-50/30 dark:bg-brand-blue-950/10 p-2 rounded-xl border border-brand-blue-100/20 text-right flex items-center justify-between"
                          >
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 truncate max-w-[130px]">{vhName}</span>
                            <button
                              onClick={() => handleRemoveVehicleFromWorkshop(ws.id, vhName)}
                              className="text-[9px] font-black text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 p-1 px-1.5 rounded-md cursor-pointer transition-colors"
                              title="تخريج الآلية وتأكيد الجاهزية"
                            >
                              تخريج وسحب 🔓
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 dark:text-slate-550 italic leading-none pt-1">لا يوجد أي مركبات داخل الورشة في الوقت الراهن.</p>
                    )}
                  </div>

                </div>

                {/* Footer Controls for Workshop Item */}
                <div className="p-4 px-6 bg-slate-50/40 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-slate-400">مكود برقم أصل: {ws.id}</span>
                  <div className="flex items-center gap-1.5">
                    {user?.role === 'admin' ? (
                      <>
                        <button
                          onClick={() => handleStartEdit(ws)}
                          className="p-1 px-2.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-955/40 dark:hover:bg-amber-900/45 rounded-md text-[9px] font-black text-amber-600 dark:text-amber-400 cursor-pointer flex items-center gap-1 transition-colors"
                          title="تعديل بيانات الورشة"
                        >
                          <span>تعديل ✍️</span>
                        </button>
                        <button
                          onClick={() => handleDeleteWorkshop(ws.id, ws.name)}
                          className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/40 dark:hover:bg-rose-900/45 rounded-md text-[9px] font-black text-rose-600 dark:text-rose-400 cursor-pointer flex items-center gap-1 transition-colors"
                          title="حذف بيانات الورشة"
                        >
                          <span>حذف 🗑️</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWorkshop(ws);
                            toggleWorkshopStatus(ws.id);
                          }}
                          className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md text-[9px] font-black text-slate-655 dark:text-slate-300 cursor-pointer"
                        >
                          تغيير الحالة الدائرية
                        </button>
                      </>
                    ) : null}

                    {user?.role !== 'viewer' ? (
                      <button
                        onClick={() => {
                          setAllocatingTargetWsId(ws.id);
                          setIsAllocateModalOpen(true);
                        }}
                        className="p-1 px-2.5 bg-brand-blue-50 hover:bg-brand-blue-101 dark:bg-brand-blue-951/40 dark:hover:bg-brand-blue-901/45 rounded-md text-[9px] font-black text-brand-blue-600 dark:text-brand-blue-400 cursor-pointer"
                      >
                        إسناد آلية مخصصة
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">عرض فقط 👁️</span>
                    )}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredWorkshops.length === 0 && (
          <div className="col-span-full bg-white dark:bg-[#0f1422] p-12 text-center rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
            <Building2 className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={40} />
            <p className="text-xs font-black text-slate-700 dark:text-slate-300">عذراً، لم نعثر على أي ورشة تطابق معايير وتصفية البحث الحالية.</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">تأكد من كتابة اسم الورشة بشكل صحيح أو اختر تصفية تخصص بديلة.</p>
          </div>
        )}
      </div>

      {/* MODAL 1: Add Workshop Form */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-950/72 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f1422] w-full max-w-lg rounded-[2.2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl text-right"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-brand-blue-600" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">تأسيس وترخيص ورشة أو معمل فني جديد</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 rounded-xl cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleAddWorkshop} className="p-6 space-y-4">
                
                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1.5">اسم الورشة أو النطاق التشغيلي <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ورشة فحص الإلكترونيات المتنقلة"
                    value={newWs.name}
                    onChange={(e) => setNewWs({ ...newWs, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-brand-blue-500 rounded-xl outline-none text-xs font-bold dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1.5">تخصص الورشة الأساسي</label>
                    <select
                      value={newWs.specialization}
                      onChange={(e) => setNewWs({ ...newWs, specialization: e.target.value as Workshop['specialization'] })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-black dark:text-white"
                    >
                      <option value="mechanical">ميكانيك شاحنات</option>
                      <option value="electrical">كهرباء وأنظمة رقمية</option>
                      <option value="hydraulic">أنظمة هيدروليكية وروافع</option>
                      <option value="cooling">تبريد وتكييف الهواء</option>
                      <option value="bodywork">سمكرة ودهانات ليزرية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1.5">القدرة الاستيعابية (الممرات) <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={40}
                      value={newWs.capacity}
                      onChange={(e) => setNewWs({ ...newWs, capacity: parseInt(e.target.value) || 5 })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:bg-white rounded-xl outline-none text-xs font-bold dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1.5">المشرف الفني المسؤول أو رئيس الورشة <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الخبير مازن عبدالملك"
                    value={newWs.supervisor}
                    onChange={(e) => setNewWs({ ...newWs, supervisor: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:bg-white rounded-xl outline-none text-xs font-bold dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1.5">موقع الورشة داخل المجمّع الإنشائي <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: المبنى ب - القريب من بوابة الحركة الشرقية"
                    value={newWs.location}
                    onChange={(e) => setNewWs({ ...newWs, location: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:bg-white rounded-xl outline-none text-xs font-bold dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1.5">الأجهزة والعدد المتوفرة (تفصل بينها بفواصل ,)</label>
                  <textarea
                    rows={2}
                    placeholder="جهاز كشف OBD2, مكبس تيل الفرامل, رافعة علوية"
                    value={newWs.equipmentString}
                    onChange={(e) => setNewWs({ ...newWs, equipmentString: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:bg-white rounded-xl outline-none text-xs font-bold dark:text-white"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex gap-2.5 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-xl text-xs font-black cursor-pointer"
                  >
                    إلغاء الأمر
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brand-blue-600 hover:bg-brand-blue-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                  >
                    تأكيد تأسيس الورشة
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Edit Workshop Form */}
      <AnimatePresence>
        {isEditModalOpen && editingWs && (
          <div className="fixed inset-0 bg-slate-950/72 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f1422] w-full max-w-lg rounded-[2.2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl text-right"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit size={18} className="text-amber-600" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">تعديل بيانات الورشة تشغيلياً</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingWs(null);
                  }}
                  className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 rounded-xl cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                
                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1.5">اسم الورشة أو النطاق التشغيلي <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ورشة فحص الإلكترونيات المتنقلة"
                    value={editingWs.name}
                    onChange={(e) => setEditingWs({ ...editingWs, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 rounded-xl outline-none text-xs font-bold dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1.5">تخصص الورشة الأساسي</label>
                    <select
                      value={editingWs.specialization}
                      onChange={(e) => setEditingWs({ ...editingWs, specialization: e.target.value as Workshop['specialization'] })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-black dark:text-white"
                    >
                      <option value="mechanical">ميكانيك شاحنات</option>
                      <option value="electrical">كهرباء وأنظمة رقمية</option>
                      <option value="hydraulic">أنظمة هيدروليكية وروافع</option>
                      <option value="cooling">تبريد وتكييف الهواء</option>
                      <option value="bodywork">سمكرة ودهانات ليزرية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1.5">القدرة الاستيعابية (الممرات) <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={40}
                      value={editingWs.capacity}
                      onChange={(e) => setEditingWs({ ...editingWs, capacity: parseInt(e.target.value) || 5 })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:bg-white rounded-xl outline-none text-xs font-bold dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1.5">المشرف الفني المسؤول أو رئيس الورشة <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الخبير مازن عبدالملك"
                    value={editingWs.supervisor}
                    onChange={(e) => setEditingWs({ ...editingWs, supervisor: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:bg-white rounded-xl outline-none text-xs font-bold dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1.5">موقع الورشة داخل المجمّع الإنشائي <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: المبنى ب - القريب من بوابة الحركة الشرقية"
                    value={editingWs.location}
                    onChange={(e) => setEditingWs({ ...editingWs, location: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:bg-white rounded-xl outline-none text-xs font-bold dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1.5">الأجهزة والعدد المتوفرة (تفصل بينها بفواصل ,)</label>
                  <textarea
                    rows={2}
                    placeholder="جهاز كشف OBD2, مكبس تيل الفرامل, رافعة علوية"
                    value={editingWs.equipmentString}
                    onChange={(e) => setEditingWs({ ...editingWs, equipmentString: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:bg-white rounded-xl outline-none text-xs font-bold dark:text-white"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex gap-2.5 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingWs(null);
                    }}
                    className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-xl text-xs font-black cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                  >
                    حفظ التعديلات
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Allocate Vehicle to Workshop */}
      <AnimatePresence>
        {isAllocateModalOpen && (
          <div className="fixed inset-0 bg-slate-950/72 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0f1422] w-full max-w-md rounded-[2.2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl text-right"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-brand-blue-600" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">تسكين وإدخال آلية للخدمة في الورشة</h3>
                </div>
                <button
                  onClick={() => setIsAllocateModalOpen(false)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 rounded-xl cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleAllocateVehicle} className="p-6 space-y-4">
                
                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1.5">اختر الورشة المستهدفة <span className="text-rose-500">*</span></label>
                  <select
                    value={allocatingTargetWsId}
                    required
                    onChange={(e) => setAllocatingTargetWsId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-black dark:text-white"
                  >
                    <option value="">-- اختر الورشة المستهدفة --</option>
                    {workshops.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.currentVehicles.length} / {w.capacity} مركبة حالياً)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1.5">اختر المركبة أو المعدة <span className="text-rose-500">*</span></label>
                  <select
                    value={allocatingVehicle}
                    required
                    onChange={(e) => setAllocatingVehicle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-black dark:text-white"
                  >
                    <option value="">-- اختر المركبة النشطة --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.name}>
                        {v.name} -  ({v.plateNumber})
                      </option>
                    ))}
                    <option value="معدة ثقيلة مخصصة">معدة ثقيلة مخصصة</option>
                    <option value="مولد كهربائي متنقل">مولد كهربائي متنقل</option>
                    <option value="مضخة إسفلت هيدروليكية">مضخة إسفلت هيدروليكية</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex gap-2.5 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAllocateModalOpen(false)}
                    className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-xl text-xs font-black cursor-pointer"
                  >
                    إلغاء الأمر
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brand-blue-600 hover:bg-brand-blue-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                  >
                    تسكين الآلية بالمسار
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
