import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Search,
  ChevronRight,
  ChevronLeft,
  User as UserIcon,
  Wrench,
  Truck,
  Filter,
  X,
  Archive,
  Database,
  Sparkles,
  Settings2,
  Calendar,
  DollarSign,
  ClipboardList,
  RefreshCw,
  Zap,
  RotateCcw,
  Loader2,
  Check,
  Building2,
  Package,
  Layers,
  ArrowRight,
  Kanban,
  ListFilter,
  TrendingUp,
  Sliders,
  AlertTriangle,
  Activity,
  LayoutGrid,
  List,
  Mic,
  MicOff,
  Volume2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Camera,
  History,
  UploadCloud
} from 'lucide-react';
import { maintenanceOrders as initialMaintenanceOrders, vehicles as staticVehicles, technicians as staticTechnicians } from '../data';
import { User, MaintenanceOrder, Vehicle, Technician, InventoryItem, hasGranularPermission } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { generateAIPERepairSteps } from '../services/aiService';
import VoiceNoteField from './VoiceNoteField';
import DigitalSafetyInspection from './DigitalSafetyInspection';
import TechnicalInspectionChecklist from './TechnicalInspectionChecklist';
import CameraCapture from './CameraCapture';
import { useLanguage } from '../services/LanguageContext';
import ContextualHelp from './ContextualHelp';
import SmartDiagnostic from './SmartDiagnostic';
import { notifyNewMaintenanceOrder } from '../services/browserNotifications';
import { safeSetItem } from '../utils/storage';

const SYSTEM_ANCHOR_DATE = '2026-05-19';

const PriorityBadge = ({ priority }: { priority: 'low' | 'medium' | 'high' }) => {
  const configs = {
    low: { label: 'منخفضة (اعتيادي)', classes: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
    medium: { label: 'متوسطة (عاجل)', classes: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
    high: { label: 'طارئة (متوقفة)', classes: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 font-black animate-pulse' },
  };
  const config = configs[priority];
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border border-current ${config.classes}`}>
      {config.label}
    </span>
  );
};

// Helper: Calculate age in years relative to 2026-05-19
const getOrderAgeInYears = (dateStr: string): number => {
  const orderDate = new Date(dateStr);
  const now = new Date(SYSTEM_ANCHOR_DATE);
  const diffTime = now.getTime() - orderDate.getTime();
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, diffYears);
};

// Helper: Calculate age in days relative to 2026-05-19
const getOrderAgeInDays = (dateStr: string): number => {
  const orderDate = new Date(dateStr);
  const now = new Date(SYSTEM_ANCHOR_DATE);
  const diffTime = now.getTime() - orderDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return Math.max(0, diffDays);
};

interface MaintenanceProps {
  user: User;
  openAddOnLoad?: boolean;
  onAddOpenHandled?: () => void;
}

export default function Maintenance({ user, openAddOnLoad, onAddOpenHandled }: MaintenanceProps) {
  const { language } = useLanguage();
  // --- STATE FOR SYSTEM SYSTEM-WIDE LINKAGES ---
  
  // 1. Maintenance Orders
  const [orders, setOrders] = useState<MaintenanceOrder[]>(() => {
    const saved = localStorage.getItem('fleet_maintenance_orders_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return initialMaintenanceOrders;
  });

  // 2. Vehicles List Status Link
  const [localVehicles, setLocalVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('fleet_vehicles_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return staticVehicles;
  });

  // 3. Technicians List Tasks Link
  const [localTechnicians, setLocalTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem('fleet_technicians_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((t: any) => {
            const initMatch = staticTechnicians.find(it => it.id === t.id);
            return {
              ...t,
              name: initMatch ? initMatch.name : t.name,
              avatar: initMatch ? initMatch.avatar : t.avatar,
            };
          });
        }
      } catch (e) { }
    }
    return staticTechnicians;
  });

  // 4. Workshops List Load Link
  const [localWorkshops, setLocalWorkshops] = useState<any[]>(() => {
    const saved = localStorage.getItem('fleet_workshops');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((ws: any) => ({
            ...ws,
            currentVehicles: Array.isArray(ws.currentVehicles) ? ws.currentVehicles : [],
            equipment: Array.isArray(ws.equipment) ? ws.equipment : ['معدات يدوية أساسية'],
          }));
        }
      } catch (e) { }
    }
    return [
      { id: 'WS-1', name: 'ورشة الميكانيك المركزي والصيانة الثقيلة', specialization: 'mechanical', capacity: 15, activeBays: 8, currentVehicles: ['شاحنة مرسيدس أكتروس'], status: 'operational', kpiFtr: '94.2%', avgTurnaround: '5.8 ساعات', location: 'المبنى أ' },
      { id: 'WS-2', name: 'وحدة الأنظمة الكهربائية والبرمجة والعدسات', specialization: 'electrical', capacity: 8, activeBays: 6, currentVehicles: ['تويوتا بيك أب - هايلوكس'], status: 'operational', kpiFtr: '96.8%', avgTurnaround: '2.5 ساعة', location: 'المبنى ب' },
      { id: 'WS-3', name: 'ورشة الأنظمة الهيدروليكية والأذرعة الميكانيكية', specialization: 'hydraulic', capacity: 10, activeBays: 10, currentVehicles: [], status: 'at-capacity', kpiFtr: '91.0%', avgTurnaround: '8.4 ساعات', location: 'المبنى ج' },
      { id: 'WS-4', name: 'وحدة السمكرة الذكية وتجفيف الدهانات الحرارية', specialization: 'bodywork', capacity: 5, activeBays: 2, currentVehicles: ['حافلة هيونداي سيتي'], status: 'operational', kpiFtr: '98.5%', avgTurnaround: '12.0 ساعة', location: 'المبنى د' },
      { id: 'WS-5', name: 'شعبة أنظمة التبريد المتكاملة وتكييف الحافلات', specialization: 'cooling', capacity: 6, activeBays: 1, currentVehicles: [], status: 'maintenance', kpiFtr: '92.4%', avgTurnaround: '4.1 ساعات', location: 'المبنى أ - فرعي' }
    ];
  });

  // 5. Inventory Spare Parts Stock Link
  const [localInventory, setLocalInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('fleet_inventory_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      { id: 'i1', name: 'فلتر زيت هايلوكس', partNumber: 'TOY-1234-F', quantity: 45, minQuantity: 10, category: 'فلاتر' },
      { id: 'i2', name: 'وسادات فرامل أمامية أكتروس', partNumber: 'MB-5678-B', quantity: 5, minQuantity: 8, category: 'فرامل' },
      { id: 'i3', name: 'إطار شاحنة 22.5', partNumber: 'TIR-0099', quantity: 12, minQuantity: 4, category: 'إطارات' }
    ];
  });

  // --- PERSIST OTHER MODULE STATES GLOBALLY SAFELY ---
  useEffect(() => {
    safeSetItem('fleet_maintenance_orders_v2', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    safeSetItem('fleet_vehicles_v2', JSON.stringify(localVehicles));
  }, [localVehicles]);

  useEffect(() => {
    safeSetItem('fleet_technicians_v2', JSON.stringify(localTechnicians));
  }, [localTechnicians]);

  useEffect(() => {
    safeSetItem('fleet_workshops', JSON.stringify(localWorkshops));
  }, [localWorkshops]);

  useEffect(() => {
    safeSetItem('fleet_inventory_v2', JSON.stringify(localInventory));
  }, [localInventory]);

  // Project Manager Visual Toggles & View Mode
  const [managerMode, setManagerMode] = useState<'kanban' | 'list' | 'calendar' | 'diagnostic'>('kanban'); // 'kanban' style Gantt Project manager view is default
  
  // State for interactive Calendar month/year navigation
  const [currentCalDate, setCurrentCalDate] = useState(() => new Date(SYSTEM_ANCHOR_DATE));

  // Archiving states
  const [archiveYears, setArchiveYears] = useState<number>(() => {
    const saved = localStorage.getItem('fleet_archive_years');
    return saved ? parseFloat(saved) : 2.0;
  });
  const [includeArchivedInSearch, setIncludeArchivedInSearch] = useState<boolean>(false);
  
  // Project Search & Filters
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | 'all'>('all');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | 'all'>('all');
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<string | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed' | 'archived'>('all');

  // Modals / Detail Overlays
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
  
  const [draftMilestones, setDraftMilestones] = useState<{ title: string; checked: boolean }[]>([]);
  const [newMilestoneText, setNewMilestoneText] = useState<Record<string, string>>({});
  const [isGeneratingSteps, setIsGeneratingSteps] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const openNewOrderModal = (initialDate?: string) => {
    setNewOrder({
      vehicleId: '',
      description: '',
      category: 'mechanical',
      priority: 'medium',
      technicianId: '',
      workshopId: '',
      status: 'pending',
      date: initialDate || SYSTEM_ANCHOR_DATE,
      cost: '',
      partsRequested: [],
      techNotes: '',
      photoUrl: ''
    });
    setDraftMilestones([
      { title: '📋 الاستلام والفرز الأولي وتوصيل جهاز تشخيص الأعطال بجهاز الكمبيوتر المعياري', checked: false },
      { title: '📦 فحص المخزون الفني الفوري وتخصيص قطع الغيار للآلية المصابة في الرفوف', checked: false },
      { title: '🔧 فك الأجزاء المتأثرة وبدء الإصلاحات الميكانيكية أو الكهربائية المناسبة بالورشة', checked: false },
      { title: '🧪 اختبار تجريبي كامل وتسيير على خط سير آمن لمعاينة عوامل السلامة والأمان', checked: false },
      { title: '🚚 تنظيف الممر وغسيل الآلية وصقل العيوب وتسليمها للاعتماد والتشغيل النهائي', checked: false }
    ]);
    setIsAddModalOpen(true);
  };
  
  // Automated Inventory Update Prompt when completing a Maintenance Order
  const [isInventoryPromptOpen, setIsInventoryPromptOpen] = useState(false);
  const [promptOrderId, setPromptOrderId] = useState<string | null>(null);
  const [selectedPartsToDeduct, setSelectedPartsToDeduct] = useState<Array<{ partId: string; quantity: number }>>([{ partId: '', quantity: 1 }]);
  
  // State for delete confirmation modal
  const [orderIdToDelete, setOrderIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (openAddOnLoad) {
      openNewOrderModal();
      onAddOpenHandled?.();
    }
  }, [openAddOnLoad, onAddOpenHandled]);

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.tab === 'maintenance') {
        if (customEvent.detail.item) {
          setSearchTerm(customEvent.detail.item);
          setStatusFilter('all');
          setSelectedVehicleId('all');
          setSelectedTechnicianId('all');
          setSelectedWorkshopId('all');
        }
      }
    };
    window.addEventListener('notification-navigate', handleNavigate);
    return () => window.removeEventListener('notification-navigate', handleNavigate);
  }, []);

  const [selectedOrder, setSelectedOrder] = useState<MaintenanceOrder | null>(null);
  const [isSimulatingArchive, setIsSimulatingArchive] = useState(false);
  const [isArchiving30Days, setIsArchiving30Days] = useState(false);
  // Collapsible Filter lists state (default closed/folded with purple gradient arrow)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [quickArchiveToast, setQuickArchiveToast] = useState<string | null>(null);

  const handleQuickArchiveOrder = async (orderId: string) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { 
          ...o, 
          isArchived: true, 
          lastUpdate: SYSTEM_ANCHOR_DATE 
        };
      }
      return o;
    });
    setOrders(updated);
    localStorage.setItem('fleet_maintenance_orders_v2', JSON.stringify(updated));

    // Save to Firebase Firestore if online/available
    try {
      const targetOrder = updated.find(o => o.id === orderId);
      if (targetOrder) {
        const { saveDocument, db: firestoreDb } = await import('../services/firebase');
        if (firestoreDb) {
          await saveDocument('maintenance_orders', orderId, targetOrder);
        }
      }
    } catch (err) {
      console.warn('Firebase quick archive error:', err);
    }

    setQuickArchiveToast(language === 'en' 
      ? 'Task archived and moved to archive successfully! 📦' 
      : 'تمت الأرشفة السريعة ونقل المهمة إلى الأرشيف لتنظيف الواجهة بنجاح! 📦'
    );
    setTimeout(() => setQuickArchiveToast(null), 4000);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
    }
  };

  const handleQuickArchiveAllCompleted = async () => {
    const toArchive = orders.filter(o => o.status === 'completed' && !isOrderArchived(o));
    if (toArchive.length === 0) {
      alert(language === 'en' ? 'No completed tasks found to archive.' : 'لا توجد مهام منتهية غير مؤرشفة حالياً.');
      return;
    }

    const updated = orders.map(o => {
      if (o.status === 'completed' && !isOrderArchived(o)) {
        return { 
          ...o, 
          isArchived: true, 
          lastUpdate: SYSTEM_ANCHOR_DATE 
        };
      }
      return o;
    });

    setOrders(updated);
    localStorage.setItem('fleet_maintenance_orders_v2', JSON.stringify(updated));

    try {
      const { saveDocument, db: firestoreDb } = await import('../services/firebase');
      if (firestoreDb) {
        for (const order of toArchive) {
          const archivedOrder = { ...order, isArchived: true, lastUpdate: SYSTEM_ANCHOR_DATE };
          await saveDocument('maintenance_orders', order.id, archivedOrder);
        }
      }
    } catch (err) {
      console.warn('Firebase quick archive all error:', err);
    }

    setQuickArchiveToast(language === 'en'
      ? `Successfully quick-archived (${toArchive.length}) completed tasks! 📦`
      : `تمت الأرشفة السريعة لعدد (${toArchive.length}) من المهام المنتهية وتنظيف الواجهة بنجاح! 📦`
    );
    setTimeout(() => setQuickArchiveToast(null), 4500);
  };

  const archiveCompletedTasksOlderThan30Days = async () => {
    setIsArchiving30Days(true);
    
    // Find all completed orders older than 30 days that are not already archived
    const toArchive = orders.filter(o => 
      o.status === 'completed' && 
      !o.isArchived && 
      getOrderAgeInDays(o.date) > 30
    );

    if (toArchive.length === 0) {
      alert(language === 'en' 
        ? 'No completed maintenance tasks older than 30 days are currently unarchived.'
        : 'لا توجد مهام صيانة مكتملة منذ أكثر من 30 يوماً غير مؤرشفة حالياً.'
      );
      setIsArchiving30Days(false);
      return;
    }

    const updatedOrders = orders.map(o => {
      const ageInDays = getOrderAgeInDays(o.date);
      if (o.status === 'completed' && ageInDays > 30 && !o.isArchived) {
        return { ...o, isArchived: true, lastUpdate: SYSTEM_ANCHOR_DATE };
      }
      return o;
    });

    setOrders(updatedOrders);
    localStorage.setItem('fleet_maintenance_orders_v2', JSON.stringify(updatedOrders));

    // Save each to database (Cloud Firestore) if available
    try {
      const { saveDocument, db: firestoreDb } = await import('../services/firebase');
      if (firestoreDb) {
        for (const order of toArchive) {
          const archivedOrder = { ...order, isArchived: true, lastUpdate: SYSTEM_ANCHOR_DATE };
          await saveDocument('maintenance_orders', order.id, archivedOrder);
        }
      }
    } catch (err) {
      console.warn('Firebase sync error during 30 days archival:', err);
    }

    setIsArchiving30Days(false);
    alert(language === 'en'
      ? `Successfully archived (${toArchive.length}) completed tasks older than 30 days in the database.`
      : `تم بنجاح أرشفة عدد (${toArchive.length}) من مشاريع الصيانة المكتملة منذ أكثر من 30 يوماً في قاعدة البيانات.`
    );
  };

  const restoreOrderFromArchive = async (orderId: string) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { 
          ...o, 
          isArchived: false, 
          date: SYSTEM_ANCHOR_DATE, // Reset date to system anchor date so it is active
          lastUpdate: SYSTEM_ANCHOR_DATE 
        };
      }
      return o;
    });
    setOrders(updated);
    localStorage.setItem('fleet_maintenance_orders_v2', JSON.stringify(updated));

    // Save to Firebase Firestore if online/available
    try {
      const targetOrder = updated.find(o => o.id === orderId);
      if (targetOrder) {
        const { saveDocument, db: firestoreDb } = await import('../services/firebase');
        if (firestoreDb) {
          await saveDocument('maintenance_orders', orderId, targetOrder);
        }
      }
    } catch (err) {
      console.warn('Firebase restore order sync error:', err);
    }

    alert(language === 'en'
      ? 'The project was successfully restored and returned to the active maintenance list.'
      : 'تم استرجاع المشروع بنجاح وإعادته إلى قائمة الصيانة النشطة.'
    );
    setSelectedOrder(null); // Close details view if open
  };

  // New Order Form state
  const [newOrder, setNewOrder] = useState({
    vehicleId: '',
    description: '',
    category: 'mechanical' as 'mechanical' | 'electrical' | 'cooling' | 'hydraulic' | 'bodywork',
    priority: 'medium' as 'low' | 'medium' | 'high',
    technicianId: '',
    workshopId: '',
    status: 'pending' as 'pending' | 'in-progress' | 'completed',
    date: SYSTEM_ANCHOR_DATE,
    cost: '',
    partsRequested: [] as { partId: string; quantity: number }[],
    techNotes: '',
    photoUrl: ''
  });

  // Form helper: tracking spare parts dynamic assignment
  const [partToAdd, setPartToAdd] = useState('');
  const [partQtyToAdd, setPartQtyToAdd] = useState(1);

  // Archive status checker
  const isOrderArchived = (order: MaintenanceOrder): boolean => {
    if (order.isArchived) return true;
    if (order.status !== 'completed') return false;
    if (archiveYears === 0) return false;
    return getOrderAgeInYears(order.date) >= archiveYears;
  };

  const archivedOrders = orders.filter(o => isOrderArchived(o));
  const activeOrders = orders.filter(o => !isOrderArchived(o));
  const archivedCount = archivedOrders.length;
  const activeCount = activeOrders.length;

  const estimatedQueryTime = archiveYears === 0 
    ? "38.5 ms" 
    : `${Math.max(0.3, 0.3 + (activeCount * 0.1)).toFixed(1)} ms`;

  // Standard Milestone steps default
  const DEFAULT_MILESTONES = [
    { title: '📋 الفرز الأولي وتشخيص الأعطال بالكمبيوتر', checked: false },
    { title: '📦 تأمين قطع الغيار وتثبيت الحجز من المستودعات', checked: false },
    { title: '🔧 التفكيك والمباشرة الفنية في منصة الورشة', checked: false },
    { title: '🧪 الفحص الميداني واختبار عوامل السلامة والأداء', checked: false },
    { title: '🚚 غسيل الآلية وتسليمها للاعتماد التشغيلي النهائي', checked: false }
  ];

  // Apply filters to maintenance orders
  const filteredOrders = orders.filter(order => {
    const vehicle = localVehicles.find(v => v.id === order.vehicleId);
    const orderIsArchived = isOrderArchived(order);

    if (statusFilter === 'archived') {
      if (!orderIsArchived) return false;
    } else {
      if (orderIsArchived) {
        if (!searchTerm || !includeArchivedInSearch) {
          return false;
        }
      } else {
        if (statusFilter !== 'all' && order.status !== statusFilter) {
          return false;
        }
      }
    }

    if (selectedVehicleId !== 'all' && order.vehicleId !== selectedVehicleId) return false;
    if (selectedTechnicianId !== 'all' && order.technicianId !== selectedTechnicianId) return false;
    if (selectedWorkshopId !== 'all' && order.workshopId !== selectedWorkshopId) return false;
    if (selectedPriority !== 'all' && order.priority !== selectedPriority) return false;
    if (selectedCategory !== 'all' && order.category !== selectedCategory) return false;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchVehicle = vehicle?.name.toLowerCase().includes(searchLower) || 
                           vehicle?.plateNumber.toLowerCase().includes(searchLower);
      const matchOrder = order.orderNumber.toLowerCase().includes(searchLower) || 
                         order.description.toLowerCase().includes(searchLower) ||
                         (order.partsUsed && order.partsUsed.some(p => p.toLowerCase().includes(searchLower)));
      if (!matchVehicle && !matchOrder) return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSelectedVehicleId('all');
    setSelectedTechnicianId('all');
    setSelectedWorkshopId('all');
    setSelectedPriority('all');
    setSelectedCategory('all');
    setStatusFilter('all');
    setSearchTerm('');
  };

  // --- SYSTEM-WIDE CENTRAL INTEGRATION LOGIC ---
  const applySystemWideIntegrations = (
    updatedOrder: MaintenanceOrder,
    action: 'created' | 'updated' | 'deleted'
  ) => {
    const { vehicleId, technicianId, workshopId, status, milestones, progress } = updatedOrder;
    const vehicleName = localVehicles.find(v => v.id === vehicleId)?.name || 'مركبة غير محددة';

    // 1. Vehicle Integration: Update system condition
    setLocalVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        let nextStatus = v.status;
        if (action === 'deleted') {
          nextStatus = 'active';
        } else {
          nextStatus = status === 'completed' ? 'active' : 'maintenance';
        }
        return {
          ...v,
          status: nextStatus,
          lastMaintenance: status === 'completed' ? updatedOrder.date : v.lastMaintenance
        };
      }
      return v;
    }));

    // 2. Workshop Integration: Manage capacity and active bays load
    setLocalWorkshops(prev => prev.map(ws => {
      // Clean up vehicle name from any workshop queue first
      let currentVehs = Array.isArray(ws.currentVehicles) ? [...ws.currentVehicles] : [];
      currentVehs = currentVehs.filter((name: string) => name !== vehicleName);

      if (action !== 'deleted' && ws.id === workshopId) {
        // If the task is active (pending or in-progress), insert vehicle into workshop queue
        if (status !== 'completed') {
          if (!currentVehs.includes(vehicleName)) {
            currentVehs.push(vehicleName);
          }
        }
      }

      const activeBays = currentVehs.length;
      const calculatedStatus = activeBays >= ws.capacity ? 'at-capacity' : (activeBays === 0 ? 'maintenance' : 'operational');

      return {
        ...ws,
        currentVehicles: currentVehs,
        activeBays,
        status: calculatedStatus === 'maintenance' && ws.status !== 'maintenance' ? 'operational' : calculatedStatus
      };
    }));

    // 3. Technician Integration: Synchronize workload
    setLocalTechnicians(prev => prev.map(t => {
      if (action !== 'deleted' && t.id === technicianId) {
        const isCurrentlyActive = status !== 'completed';
        return {
          ...t,
          activeTasks: isCurrentlyActive ? Math.max(1, t.activeTasks + 1) : Math.max(0, t.activeTasks - 1),
          status: isCurrentlyActive ? 'busy' as const : 'available' as const
        };
      }
      return t;
    }));
  };

  // Core Add Order Handler with Logistics Integration
  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.vehicleId || !newOrder.description) {
      alert('الرجاء تعبئة البيانات الأساسية وخط السير للبلاغ.');
      return;
    }

    // Process Spare Parts logistics checkout
    const partsUsedNames: string[] = [];
    setLocalInventory(prev => prev.map(item => {
      const checkReq = newOrder.partsRequested.find(p => p.partId === item.id);
      if (checkReq) {
        partsUsedNames.push(`${item.name} (عدد ${checkReq.quantity})`);
        return {
          ...item,
          quantity: Math.max(0, item.quantity - checkReq.quantity)
        };
      }
      return item;
    }));

    const activeMilestones = draftMilestones.length > 0 ? draftMilestones : [
      { title: '📋 الاستلام والفرز الأولي وتشخيص الأعطال بالكمبيوتر', checked: false },
      { title: '📦 تأمين قطع الغيار وتثبيت الحجز من المستودعات', checked: false },
      { title: '🔧 التفكيك والمباشرة الفنية في منصة الورشة', checked: false },
      { title: '🧪 الفحص الميداني واختبار عوامل السلامة والأداء', checked: false },
      { title: '🚚 غسيل الآلية وتسليمها للاعتماد التشغيلي النهائي', checked: false }
    ];

    const matchedMilestones = activeMilestones.map((mst, idx) => {
      if (newOrder.status === 'completed') {
        return { ...mst, checked: true };
      }
      if (newOrder.status === 'in-progress' && idx < 2) {
        return { ...mst, checked: true };
      }
      return mst;
    });

    const activeMstCount = matchedMilestones.filter(m => m.checked).length;
    const computedProgress = matchedMilestones.length > 0 ? Math.round((activeMstCount / matchedMilestones.length) * 100) : 0;

    const brandNewOrder: MaintenanceOrder = {
      id: `WO-${Date.now()}`,
      vehicleId: newOrder.vehicleId,
      orderNumber: `WO-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: newOrder.date,
      description: newOrder.description,
      category: newOrder.category,
      status: newOrder.status,
      technicianId: newOrder.technicianId || undefined,
      workshopId: newOrder.workshopId || undefined,
      priority: newOrder.priority,
      cost: newOrder.cost ? parseFloat(newOrder.cost) : undefined,
      partsUsed: partsUsedNames.length > 0 ? partsUsedNames : undefined,
      isArchived: false,
      progress: computedProgress,
      milestones: matchedMilestones,
      lastUpdate: SYSTEM_ANCHOR_DATE,
      techNotes: newOrder.techNotes || '',
      photoUrl: newOrder.photoUrl || undefined
    };

    // Update maintenance orders list
    setOrders(prev => [brandNewOrder, ...prev]);
    setIsAddModalOpen(false);

    // Trigger instant browser push notification for technicians & managers
    const matchedVehForOrder = localVehicles.find(v => v.id === brandNewOrder.vehicleId);
    const orderVehName = matchedVehForOrder ? `${matchedVehForOrder.name} (${matchedVehForOrder.plateNumber})` : `مركبة #${brandNewOrder.vehicleId}`;
    notifyNewMaintenanceOrder({
      orderId: brandNewOrder.orderNumber || brandNewOrder.id,
      vehicleName: orderVehName,
      description: brandNewOrder.description,
      priority: brandNewOrder.priority
    }).catch(err => console.log('New maintenance push skipped:', err));

    // Run system-wide integrations for vehicle, workshop and tech queues
    applySystemWideIntegrations(brandNewOrder, 'created');

    // Handle offline status check and queue storing
    const isOffline = !navigator.onLine;
    if (isOffline) {
      const offlineQueueRaw = localStorage.getItem('fleet_offline_maintenance_queue') || '[]';
      try {
        const offlineQueue = JSON.parse(offlineQueueRaw);
        offlineQueue.push(brandNewOrder);
        localStorage.setItem('fleet_offline_maintenance_queue', JSON.stringify(offlineQueue));
      } catch (e) {
        console.error('Failed to append to offline maintenance queue:', e);
      }

      // Dispatch to Service Worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'REGISTER_OFFLINE_RECORD',
          record: brandNewOrder
        });

        // Register Background Sync if available
        navigator.serviceWorker.ready.then((reg) => {
          if ('sync' in reg) {
            (reg as any).sync.register('sync-maintenance').catch((err: any) => {
              console.warn('Sync registration failed:', err);
            });
          }
        });
      }

      // Notify App layout to show progress status
      window.dispatchEvent(new CustomEvent('maintenance-offline-added', {
        detail: { record: brandNewOrder }
      }));

      alert(language === 'ar'
        ? 'تم حفظ بلاغ الصيانة الجديد محلياً بنجاح! سيتم رفعه تلقائياً للسحاب عند الاتصال بالشبكة.'
        : 'Maintenance order registered locally in offline mode! It will auto-sync with the cloud on reconnection.'
      );
    } else {
      // Direct Firebase FireStore save proxy if online
      import('../services/firebase').then(({ saveDocument, db }) => {
        if (db) {
          saveDocument('maintenance_orders', brandNewOrder.id, brandNewOrder)
            .catch(err => console.warn('Online direct sync cloud save-warn:', err));
        }
      }).catch(e => console.warn('Firebase lazy load skip:', e));

      alert(language === 'ar'
        ? 'تم بنجاح ربط وتسجيل المشروع وتعديل طاقات الورش وصلاحية الشاحنة فوراً حياً سحابياً.'
        : 'Successfully registered the maintenance order and adjusted workshop loads live in the cloud.'
      );
    }

    // Reset Form
    setNewOrder({
      vehicleId: '',
      description: '',
      category: 'mechanical',
      priority: 'medium',
      technicianId: '',
      workshopId: '',
      status: 'pending',
      date: SYSTEM_ANCHOR_DATE,
      cost: '',
      partsRequested: [],
      techNotes: '',
      photoUrl: ''
    });
    setPartToAdd('');
    setPartQtyToAdd(1);
  };

  // Create work order from AI Smart Diagnostics
  const handleSmartDiagnosticOrder = (partialOrder: Partial<MaintenanceOrder>) => {
    const brandNewOrder: MaintenanceOrder = {
      id: `WO-${Date.now()}`,
      vehicleId: partialOrder.vehicleId || '',
      orderNumber: `WO-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: SYSTEM_ANCHOR_DATE,
      description: partialOrder.description || '',
      category: partialOrder.category || 'mechanical',
      status: 'in-progress',
      technicianId: partialOrder.technicianId,
      workshopId: partialOrder.workshopId,
      priority: partialOrder.priority || 'medium',
      cost: partialOrder.cost,
      partsUsed: partialOrder.partsUsed,
      isArchived: false,
      progress: partialOrder.progress || 20,
      milestones: partialOrder.milestones,
      lastUpdate: SYSTEM_ANCHOR_DATE,
      techNotes: partialOrder.techNotes || '',
    };

    // Deduct stock of matched suggested parts if possible
    if (partialOrder.partsUsed && partialOrder.partsUsed.length > 0) {
      setLocalInventory(prev => prev.map(item => {
        const isMatch = partialOrder.partsUsed?.some(partName => 
          item.name.toLowerCase().includes(partName.toLowerCase()) || 
          partName.toLowerCase().includes(item.name.toLowerCase())
        );
        if (isMatch && item.quantity > 0) {
          return {
            ...item,
            quantity: Math.max(0, item.quantity - 1)
          };
        }
        return item;
      }));
    }

    setOrders(prev => [brandNewOrder, ...prev]);
    applySystemWideIntegrations(brandNewOrder, 'created');
    setManagerMode('kanban');

    // Dispatch status change custom event
    const matchedVeh = localVehicles.find(v => v.id === brandNewOrder.vehicleId);
    const vehName = matchedVeh ? `${matchedVeh.name} (${matchedVeh.plateNumber})` : `مركبة #${brandNewOrder.vehicleId}`;
    window.dispatchEvent(new CustomEvent('maintenance-order-status-changed', {
      detail: {
        orderId: brandNewOrder.id,
        oldStatus: 'pending',
        newStatus: 'in-progress',
        descriptionAr: brandNewOrder.description,
        descriptionEn: brandNewOrder.description,
        vehicleName: vehName
      }
    }));
  };

  // Switch Kanban project columns dynamically
  const moveOrderKanbanStatus = (orderId: string, nextStatus: 'pending' | 'in-progress' | 'completed') => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder && targetOrder.status !== nextStatus) {
      const matchedVeh = localVehicles.find(v => v.id === targetOrder.vehicleId);
      const vehName = matchedVeh ? `${matchedVeh.name} (${matchedVeh.plateNumber})` : `مركبة #${targetOrder.vehicleId}`;
      window.dispatchEvent(new CustomEvent('maintenance-order-status-changed', {
        detail: {
          orderId,
          oldStatus: targetOrder.status,
          newStatus: nextStatus,
          descriptionAr: targetOrder.description,
          descriptionEn: targetOrder.description,
          vehicleName: vehName
        }
      }));
    }

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        // Automatically request updating the spare parts from inventory if transitioning to completed
        if (nextStatus === 'completed' && o.status !== 'completed') {
          setPromptOrderId(orderId);
          setSelectedPartsToDeduct([{ partId: '', quantity: 1 }]);
          setIsInventoryPromptOpen(true);
        }

        // Adjust milestones checklist logically
        const currentMilestones = o.milestones && o.milestones.length > 0 ? [...o.milestones] : [...DEFAULT_MILESTONES];
        const updated = currentMilestones.map((m, idx) => {
          if (nextStatus === 'completed') return { ...m, checked: true };
          if (nextStatus === 'pending') return { ...m, checked: false };
          if (nextStatus === 'in-progress' && idx < 2) return { ...m, checked: true };
          return m;
        });

        const activeMstCount = updated.filter(m => m.checked).length;
        const progress = Math.round((activeMstCount / DEFAULT_MILESTONES.length) * 100);

        const merged: MaintenanceOrder = { 
          ...o, 
          status: nextStatus,
          milestones: updated,
          progress,
          lastUpdate: SYSTEM_ANCHOR_DATE
        };

        // Fire real-time integration triggers to other modules
        applySystemWideIntegrations(merged, 'updated');

        // Sync visual details modal if open
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(merged);
        }

        return merged;
      }
      return o;
    }));
  };

  // Toggle checklist milestone internally
  const handleToggleMilestone = (orderId: string, index: number) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const milestones = o.milestones ? [...o.milestones] : [...DEFAULT_MILESTONES];
        milestones[index] = { ...milestones[index], checked: !milestones[index].checked };
        
        // Recompute progress percentage
        const activeCount = milestones.filter(m => m.checked).length;
        const progress = Math.round((activeCount / milestones.length) * 100);
        
        // Dynamic status mapping based on checklist milestones completed
        let status = o.status;
        if (progress === 100) {
          status = 'completed';
        } else if (progress > 0 && progress < 100) {
          status = 'in-progress';
        } else if (progress === 0) {
          status = 'pending';
        }

        // Automatically request updating the spare parts from inventory if transitioning to completed
        if (status === 'completed' && o.status !== 'completed') {
          setPromptOrderId(orderId);
          setSelectedPartsToDeduct([{ partId: '', quantity: 1 }]);
          setIsInventoryPromptOpen(true);
        }

        const updated: MaintenanceOrder = { 
          ...o, 
          milestones, 
          progress, 
          status,
          lastUpdate: SYSTEM_ANCHOR_DATE 
        };

        // Fire state synchronization
        applySystemWideIntegrations(updated, 'updated');

        if (status !== o.status) {
          const matchedVeh = localVehicles.find(v => v.id === o.vehicleId);
          const vehName = matchedVeh ? `${matchedVeh.name} (${matchedVeh.plateNumber})` : `مركبة #${o.vehicleId}`;
          window.dispatchEvent(new CustomEvent('maintenance-order-status-changed', {
            detail: {
              orderId,
              oldStatus: o.status,
              newStatus: status,
              descriptionAr: o.description,
              descriptionEn: o.description,
              vehicleName: vehName
            }
          }));
        }

        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updated);
        }

        return updated;
      }
      return o;
    }));
  };

  const handleUpdateMilestones = (orderId: string, milestones: { title: string; checked: boolean }[]) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const activeCount = milestones.filter(m => m.checked).length;
        const progress = milestones.length > 0 ? Math.round((activeCount / milestones.length) * 100) : 0;
        
        let status = o.status;
        if (progress === 100) {
          status = 'completed';
        } else if (progress > 0 && progress < 100) {
          status = 'in-progress';
        } else if (progress === 0) {
          status = 'pending';
        }

        const updated: MaintenanceOrder = {
          ...o,
          milestones,
          progress,
          status,
          lastUpdate: SYSTEM_ANCHOR_DATE
        };

        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updated);
        }

        applySystemWideIntegrations(updated, 'updated');

        if (status !== o.status) {
          const matchedVeh = localVehicles.find(v => v.id === o.vehicleId);
          const vehName = matchedVeh ? `${matchedVeh.name} (${matchedVeh.plateNumber})` : `مركبة #${o.vehicleId}`;
          window.dispatchEvent(new CustomEvent('maintenance-order-status-changed', {
            detail: {
              orderId,
              oldStatus: o.status,
              newStatus: status,
              descriptionAr: o.description,
              descriptionEn: o.description,
              vehicleName: vehName
            }
          }));
        }

        return updated;
      }
      return o;
    }));
  };

  // Helper controls for interactive inventory deduction prompt on order completion
  const handleAddDeductRow = () => {
    setSelectedPartsToDeduct(prev => [...prev, { partId: '', quantity: 1 }]);
  };

  const handleRemoveDeductRow = (index: number) => {
    setSelectedPartsToDeduct(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateDeductRow = (index: number, partId: string, quantity: number) => {
    setSelectedPartsToDeduct(prev => prev.map((item, i) => i === index ? { partId, quantity } : item));
  };

  const handleDeductInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptOrderId) return;

    const validDeductions = selectedPartsToDeduct.filter(d => d.partId && d.quantity > 0);

    if (validDeductions.length === 0) {
      alert('تم إغلاق الأمر بنجاح دون أي تعديل في المخزون لعدم تحديد قطع مستعملة.');
      setIsInventoryPromptOpen(false);
      setPromptOrderId(null);
      return;
    }

    // Process local inventory deduction
    const partsUsedNames: string[] = [];
    setLocalInventory(prev => prev.map(item => {
      const deduction = validDeductions.find(d => d.partId === item.id);
      if (deduction) {
        partsUsedNames.push(`${item.name} (عدد ${deduction.quantity})`);
        return {
          ...item,
          quantity: Math.max(0, item.quantity - deduction.quantity)
        };
      }
      return item;
    }));

    // Update partsUsed of the completed maintenance order
    setOrders(prev => prev.map(o => {
      if (o.id === promptOrderId) {
        const existingParts = o.partsUsed || [];
        const combined = [...existingParts, ...partsUsedNames];
        const updated = {
          ...o,
          partsUsed: combined
        };
        if (selectedOrder && selectedOrder.id === promptOrderId) {
          setSelectedOrder(updated);
        }
        return updated;
      }
      return o;
    }));

    setIsInventoryPromptOpen(false);
    setPromptOrderId(null);
    alert('تم بنجاح تحديث وجرد كميات المخازن فورياً، وتسجيل قطع الغيار المستهلكة في تفاصيل الأمر.');
  };

  // Delete project and free up system entities
  const handleRemoveOrder = (orderId: string) => {
    const findOrder = orders.find(o => o.id === orderId);
    if (!findOrder) return;
    setOrderIdToDelete(orderId);
  };

  const confirmRemoveOrder = () => {
    if (!orderIdToDelete) return;
    const findOrder = orders.find(o => o.id === orderIdToDelete);
    if (!findOrder) {
      setOrderIdToDelete(null);
      return;
    }

    setOrders(prev => prev.filter(o => o.id !== orderIdToDelete));
    setSelectedOrder(null);
    applySystemWideIntegrations(findOrder, 'deleted');

    // Create a critical audit log entry and store in localStorage
    try {
      const newLog = {
        id: 'crit-log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: user.name || 'مستخدم النظام',
        role: (user.role as string) === 'admin' ? 'مدير نظام' : (user.role as string) === 'fleet_manager' ? 'مدير حركة' : (user.role as string) === 'technician' ? 'فني صيانة' : 'مشاهد ومراقب',
        action: 'حذف سجل صيانة',
        category: 'maintenance',
        ipAddress: '197.82.16.42',
        status: 'نجاح',
        details: `قام بحذف وإلغاء أمر الصيانة رقم #${findOrder.id} لمركبة لوحة: ${findOrder.plateNumber || 'غير محدد'} (${findOrder.type || 'صيانة'})`
      };
      const savedLogs = localStorage.getItem('saas_critical_audit_logs');
      const logsArray = savedLogs ? JSON.parse(savedLogs) : [];
      logsArray.unshift(newLog);
      localStorage.setItem('saas_critical_audit_logs', JSON.stringify(logsArray));
    } catch (e) {
      console.error('Error logging critical operation:', e);
    }

    setOrderIdToDelete(null);
    alert(language === 'en'
      ? 'Maintenance tracking has been removed and consumed assets returned successfully.'
      : 'تم إزالة تتبع الصيانة وإرجاع الأصول المستهلكة بنجاح.'
    );
  };

  // Database database maintain action simulation
  const runArchivalMaintenance = () => {
    setIsSimulatingArchive(true);
    setTimeout(() => {
      setIsSimulatingArchive(false);
      alert(`صيانة جدول الأرشيف اكتملت!\n\nتم فرز وتصنيف مشاريع الصيانة القديمة التي مر عليها أكثر من (${archiveYears}) سنة بالكامل.`);
    }, 1100);
  };

  // Aggregate project statistics
  const completedProjects = orders.filter(o => o.status === 'completed' && !isOrderArchived(o));
  const totalFinancialCost = orders.reduce((acc, order) => acc + (order.cost || 0), 0);
  const activeBudgetCost = activeOrders.reduce((acc, order) => acc + (order.cost || 0), 0);

  if (isAddModalOpen) {
    return (
      <div className="space-y-6 text-right animate-in fade-in duration-305" dir="rtl" id="new-maintenance-project-form">
        <div className="bg-slate-50/50 dark:bg-slate-900/10 p-4 md:p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800 space-y-6 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue-600/10 text-brand-blue-600 flex items-center justify-center border border-brand-blue-200/20 shrink-0">
                <Wrench size={24} className="animate-pulse" />
              </div>
              <div className="text-right">
                <h1 className="text-lg font-black text-slate-900 dark:text-white">تخطيط وتدشين أمر صيانة جديد</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  قم بملء حقول الاستمارة أدناه لتدشين أمر صيانة متكامل يغذي جرد الورش، وجداول الفنيين، وتتبع كفاءة الأسطول بشكل فوري وتلقائي.
                </p>
              </div>
            </div>
            
            <button 
              type="button"
              onClick={() => setIsAddModalOpen(false)} 
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-705 dark:text-slate-300 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border border-slate-200 dark:border-slate-700 self-start md:self-auto shadow-xs"
            >
              <X size={14} />
              <span>تراجع وإلغاء ×</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 md:p-8 shadow-soft">
            <form onSubmit={handleAddOrder} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Vehicle Selector with Search Bar */}
                <div className="space-y-1 relative" id="vehicle-select-container">
                  <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">المركبة / الآلية المشتكية:<span className="text-rose-500">*</span></label>
                  
                  {/* Dropdown Trigger */}
                  <div 
                    onClick={() => setIsVehicleDropdownOpen(!isVehicleDropdownOpen)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-705 rounded-xl text-[12px] font-black flex items-center justify-between cursor-pointer select-none hover:border-indigo-550 dark:hover:border-indigo-500 transition-colors"
                  >
                    <span className={newOrder.vehicleId ? "text-slate-900 dark:text-white" : "text-slate-450 dark:text-slate-400"}>
                      {newOrder.vehicleId ? (
                        (() => {
                          const matched = localVehicles.find(v => v.id === newOrder.vehicleId);
                          return matched ? `${matched.name} (${matched.plateNumber}) • ${matched.status === 'active' ? 'نشطة' : 'متوقفة أو بالصيانة'}` : "مركبة غير معروفة";
                        })()
                      ) : (
                        "اختر المركبة من الأسطول..."
                      )}
                    </span>
                    <span className={`text-[10px] text-slate-400 dark:text-slate-500 transform transition-transform duration-200 ${isVehicleDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                  </div>

                  {/* Dropdown Overlay / Portal Box */}
                  {isVehicleDropdownOpen && (
                    <>
                      {/* Back-drop layer to close on clicking outside */}
                      <div className="fixed inset-0 z-40" onClick={() => setIsVehicleDropdownOpen(false)} />
                      
                      <div className="absolute right-0 left-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* Search Bar Input */}
                        <div className="p-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-950/20">
                          <Search size={14} className="text-slate-450 dark:text-slate-500" />
                          <input
                            type="text"
                            placeholder="ابحث بالاسم، الموديل، أو رقم اللوحة..."
                            value={vehicleSearchQuery}
                            onChange={(e) => setVehicleSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent border-0 p-1 text-[11px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-0 placeholder-slate-450 dark:placeholder-slate-550"
                            autoFocus
                          />
                          {vehicleSearchQuery && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setVehicleSearchQuery(''); }}
                              className="text-[10px] text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>

                        {/* Options List */}
                        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                          {(() => {
                            const filtered = localVehicles.filter(v => {
                              const q = vehicleSearchQuery.trim().toLowerCase();
                              if (!q) return true;
                              return (
                                v.name.toLowerCase().includes(q) ||
                                v.plateNumber.toLowerCase().includes(q) ||
                                (v.status === 'active' ? 'نشطة' : 'متوقفة أو بالصيانة').toLowerCase().includes(q)
                              );
                            });

                            if (filtered.length === 0) {
                              return (
                                <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                                  لا توجد مركبات مطابقة للبحث
                                </div>
                              );
                            }

                            return filtered.map(v => (
                              <div
                                key={v.id}
                                onClick={() => {
                                  setNewOrder(prev => ({ ...prev, vehicleId: v.id }));
                                  setIsVehicleDropdownOpen(false);
                                  setVehicleSearchQuery('');
                                }}
                                className={`p-3 text-[12px] font-medium transition-colors cursor-pointer flex items-center justify-between hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20 ${
                                  newOrder.vehicleId === v.id 
                                    ? 'bg-indigo-50/80 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold' 
                                    : 'text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <div className="flex flex-col gap-0.5 text-right">
                                  <span className="font-bold">{v.name}</span>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{v.plateNumber}</span>
                                </div>
                                <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-lg ${
                                  v.status === 'active' 
                                    ? 'bg-emerald-550/10 text-emerald-500' 
                                    : 'bg-amber-550/10 text-amber-500'
                                }`}>
                                  {v.status === 'active' ? 'نشطة' : 'متوقفة أو بالصيانة'}
                                </span>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Workshop Location Assignment */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">الورشة الفنية المعنية بالعمل:<span className="text-rose-500">*</span></label>
                  <select
                    value={newOrder.workshopId}
                    required
                    onChange={(e) => setNewOrder(prev => ({ ...prev, workshopId: e.target.value }))}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-705 rounded-xl text-[12px] font-black"
                  >
                    <option value="">اختر الورشة المتاحة لتسكين الآلية...</option>
                    {localWorkshops.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.activeBays} فجوات صيانة مأخوذة من {w.capacity})</option>
                    ))}
                  </select>
                </div>

                {/* Category of repairs */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">تصنيف الإصلاحات:</label>
                  <select
                    value={newOrder.category}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-705 rounded-xl text-[12px] font-black"
                  >
                    <option value="mechanical">صيانة ميكانيكية وتفكيك</option>
                    <option value="electrical">كهرباء وأنظمة رقمية</option>
                    <option value="cooling">تبريد وتبريد حافلات</option>
                    <option value="hydraulic">أنظمة هيدروليكية وروافع</option>
                    <option value="bodywork">حدادة وسمكرة وهيكل ليزر</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">أولوية الاستعجال:</label>
                  <select
                    value={newOrder.priority}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-855 border border-slate-200/60 dark:border-slate-705 rounded-xl text-[12px] font-black"
                  >
                    <option value="low">منخفضة - عادي</option>
                    <option value="medium">متوسطة - عاجل</option>
                    <option value="high">طارئة - متوقفة ميدانياً</option>
                  </select>
                </div>

                {/* Date of intake */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">تاريخ تسجيل البلاغ:</label>
                  <input 
                    type="date"
                    required
                    value={newOrder.date}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-855 border border-slate-200/60 dark:border-slate-705 rounded-xl text-[12px] font-black font-mono text-right"
                  />
                </div>

                {/* Estimated Cost budget */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">تكلفة الصيانة التقديرية (SAR):</label>
                  <input 
                    type="number"
                    placeholder="0.00"
                    value={newOrder.cost}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, cost: e.target.value }))}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-855 border border-slate-200/60 dark:border-slate-705 rounded-xl text-[12px] font-black font-mono text-left"
                  />
                </div>

                {/* Assign Technician */}
                <div className="md:col-span-2 lg:col-span-3 space-y-1">
                  <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">الفني المعين (يرتبط بجدول ساعات المندوب):</label>
                  <select
                    value={newOrder.technicianId}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, technicianId: e.target.value }))}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-855 border border-slate-200/60 dark:border-slate-705 rounded-xl text-[12px] font-black"
                  >
                    <option value="">لا تعين أحداً (يترك معلق للتوزيع)</option>
                    {localTechnicians.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (عدد المهام الحالية لديه: {t.activeTasks} مهام)</option>
                    ))}
                  </select>
                </div>

                {/* Logistics parts checkout area */}
                <div className="md:col-span-2 lg:col-span-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-dashed border-slate-250 dark:border-slate-800 space-y-3">
                  <span className="text-[11px] uppercase font-black text-brand-blue-600 block">سحب وتخصيص قطع غيار للطلب من جرد المخزن:</span>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <select
                      value={partToAdd}
                      onChange={(e) => setPartToAdd(e.target.value)}
                      className="w-full sm:flex-1 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    >
                      <option value="">اختر قطعة الغيار...</option>
                      {localInventory.map(item => (
                        <option key={item.id} value={item.id}>{item.name} ({item.partNumber}) • متوفر {item.quantity} قطع</option>
                      ))}
                    </select>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                      <input 
                        type="number" 
                        min={1}
                        value={partQtyToAdd} 
                        onChange={(e) => setPartQtyToAdd(parseInt(e.target.value) || 1)}
                        className="w-16 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-center"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          if (!partToAdd) return;
                          const foundPart = localInventory.find(i => i.id === partToAdd);
                          if (!foundPart) return;
                          
                          if (foundPart.quantity < partQtyToAdd) {
                            alert(`خطأ: المخزون المتوفر من (${foundPart.name}) غير كافٍ! المتوفر فقط هو ${foundPart.quantity} قطع.`);
                            return;
                          }

                          // Register parts reserved in local form variable
                          const existsIdx = newOrder.partsRequested.findIndex(p => p.partId === partToAdd);
                          if (existsIdx > -1) {
                            const copy = [...newOrder.partsRequested];
                            copy[existsIdx].quantity += partQtyToAdd;
                            setNewOrder(prev => ({ ...prev, partsRequested: copy }));
                          } else {
                            setNewOrder(prev => ({
                              ...prev,
                              partsRequested: [...prev.partsRequested, { partId: partToAdd, quantity: partQtyToAdd }]
                            }));
                          }
                          setPartToAdd('');
                          setPartQtyToAdd(1);
                        }}
                        className="px-3 py-1.5 bg-brand-blue-600 hover:bg-brand-blue-700 text-white rounded-lg text-xs font-black cursor-pointer whitespace-nowrap"
                      >
                        إدراج وحجز
                      </button>
                    </div>
                  </div>

                  {/* Listing of reserved parts within current draft */}
                  {newOrder.partsRequested.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-black text-slate-400 block pb-0.5">السلع المحجوزة التي ستخصم فور التأكيد:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {newOrder.partsRequested.map((req, ridx) => {
                          const origPart = localInventory.find(item => item.id === req.partId);
                          return (
                            <div key={ridx} className="bg-white dark:bg-slate-850 border border-slate-105 dark:border-slate-700 px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[10px] font-extrabold pr-2 text-slate-800 dark:text-slate-200">
                              <span>{origPart?.name} x {req.quantity}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setNewOrder(prev => ({
                                    ...prev,
                                    partsRequested: prev.partsRequested.filter((_, i) => i !== ridx)
                                  }));
                                }}
                                className="text-rose-500 hover:text-rose-600 font-black cursor-pointer bg-slate-50 dark:bg-slate-800 p-0.5 rounded"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Complaint description text */}
                <div className="md:col-span-2 lg:col-span-3 space-y-1">
                  <label className="text-[11px] font-black text-slate-700 dark:text-slate-300">ملاحظات السائق وشرح عيوب السير:<span className="text-rose-500">*</span></label>
                  <textarea
                    required
                    value={newOrder.description}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="اشرح بدقة وبلاغ كلي ما يشتكيه الميكانيكي أو السائق أثناء سير الشاحنة..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-705 rounded-xl text-[12px] font-extrabold"
                  />
                </div>

                {/* Technician Voice Notes field */}
                <div className="md:col-span-2 lg:col-span-3">
                  <VoiceNoteField
                    value={newOrder.techNotes || ''}
                    onChange={(val) => setNewOrder(prev => ({ ...prev, techNotes: val }))}
                    label="ملاحظات سجل الصيانة الفنية الصوتي (الميكروفون):"
                    placeholder="انقر على الميكروفون لتسجيل التقرير الفني الصوتي الفوري أو اكتب الملاحظات يدوياً بالمنظومة..."
                    rows={2}
                  />
                </div>

                {/* Defect camera capture */}
                <div className="md:col-span-2 lg:col-span-3">
                  <CameraCapture
                    photoUrl={newOrder.photoUrl}
                    onPhotoCaptured={(url) => setNewOrder(prev => ({ ...prev, photoUrl: url }))}
                    onPhotoCleared={() => setNewOrder(prev => ({ ...prev, photoUrl: '' }))}
                  />
                </div>

                {/* Interactive AI Milestone Steps configuration straight inside form */}
                <div className="md:col-span-2 lg:col-span-3 space-y-2.5 border-t border-dashed border-slate-105 dark:border-slate-800/80 pt-3.5">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div>
                      <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 block">خطوات الصيانة والتشخيص المقررة:</span>
                      <span className="text-[8px] text-slate-400 block leading-tight">يمكنك تعديلها يدوياً أو استخدام الذكاء الاصطناعي لتوليد خطوات دقيقة جداً ومخصصة تلقائياً.</span>
                    </div>
                    <button
                      type="button"
                      disabled={isGeneratingSteps || !newOrder.description.trim()}
                      onClick={async () => {
                        if (!newOrder.description.trim()) {
                          alert("الرجاء كتابة وصف معقول للعطل أولاً للتمكن من تحليله بالذكاء الاصطناعي.");
                          return;
                        }
                        setIsGeneratingSteps(true);
                        try {
                          const customSteps = await generateAIPERepairSteps(newOrder.category, newOrder.description);
                          setDraftMilestones(customSteps.map(st => ({ title: st, checked: false })));
                        } catch (e) {
                          alert("فشل توليد الخطوات، يرجى المحاولة لاحقاً.");
                        } finally {
                          setIsGeneratingSteps(false);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 border cursor-pointer transition-all shrink-0 ${
                        !newOrder.description.trim()
                          ? 'bg-slate-50 text-slate-400 border-slate-100 opacity-60'
                          : 'bg-brand-blue-50 text-brand-blue-600 hover:bg-brand-blue-100 border-brand-blue-105 dark:bg-brand-blue-500/15 dark:text-brand-blue-400 dark:border-brand-blue-500/30'
                      }`}
                    >
                      {isGeneratingSteps ? (
                        <>
                          <span className="animate-spin inline-block mr-0.5">⌛</span>
                          جاري تخطيط...
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          توليد بالذكاء الاصطناعي
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto p-1 bg-slate-100/50 dark:bg-slate-900/45 rounded-2xl border border-slate-150 dark:border-slate-800">
                    {draftMilestones.map((mst, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-slate-105 dark:border-slate-800 text-xs shadow-xs">
                        <span className="font-mono text-[9px] text-slate-400 font-bold shrink-0">0{idx + 1}.</span>
                        <input 
                          type="text"
                          value={mst.title}
                          onChange={(e) => {
                            const copy = [...draftMilestones];
                            copy[idx].title = e.target.value;
                            setDraftMilestones(copy);
                          }}
                          className="flex-1 text-[11px] font-black bg-transparent border-none focus:ring-0 p-0 text-slate-850 dark:text-slate-150 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDraftMilestones(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="text-rose-500 hover:text-rose-600 shrink-0 px-2 text-sm font-black cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-105 dark:border-slate-800/80 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-705 dark:text-slate-300 rounded-xl text-xs font-black transition-all"
                >
                  تراجع
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-blue-600 hover:bg-brand-blue-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all hover:scale-[1.01]"
                >
                  رسم وتدشين المشروع
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir="rtl" id="technicians-table">
      
      {/* Page Header with Elegant Purple Gradient */}
      <div className="relative p-6 md:p-8 bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 rounded-3xl text-white shadow-2xl border border-purple-800/35 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] -ml-20 -mb-20"></div>
        
        <div className="relative space-y-6">
          {/* Title and Description block */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-purple-300 uppercase">
                <Sparkles size={11} className="animate-spin text-purple-400" />
                <span>إدارة دورة صيانة الأسطول المتكاملة</span>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                  <Wrench size={32} className="text-purple-300 animate-pulse" />
                  <span>{language === 'ar' ? 'إدارة أوامر الصيانة والبلاغات' : 'Maintenance Tickets Desk'}</span>
                </h1>
                <ContextualHelp 
                  id="maintenance-orders"
                  titleAr="إدارة أوامر وتوجيهات الصيانة"
                  titleEn="Maintenance Work Orders"
                  explanationAr="نظام متكامل لإصدار وتعديل وأرشفة بطاقات الصيانة الفورية والوقائية للسيارات والمعدات لضمان بقائها عاملة بكامل طاقتها."
                  explanationEn="A complete scheduling dashboard for issuing, updating, and archiving instant and scheduled mechanical work orders for active vehicles."
                  benefitsAr={[
                    "استقبل بلاغات السائقين المباشرة (صوتية وكودية).",
                    "ربط بلاغات الأعطال بالميكانيكي المسؤول وتحديد قطع الغيار فورا.",
                    "عرض بطاقات العمل في نظام كانبان التفاعلي لمتابعة جاهزية ورش الإصلاح."
                  ]}
                  benefitsEn={[
                    "Capture active hardware issues (with raw driver voice note links).",
                    "Dispatch tasks to designated mechanics and reserve specific stock parts.",
                    "Track progress across Kanban columns for clear shop-floor scheduling."
                  ]}
                  tipsAr={[
                    "استخدم التبديل بين وضعين 'كانبان' و'قائمة' الفنيين لتسهيل قراءة المهام وسهولة مراجعتها."
                  ]}
                  tipsEn={[
                    "Switch to the list or kanban perspective for alternate work order overview layouts."
                  ]}
                  language={language}
                />
              </div>
              <p className="text-xs text-purple-100/70 max-w-2xl">
                {language === 'ar' 
                  ? 'مخطط محترف بنظام مدير المشروعات المترابط تماماً ببيانات الآليات، طاقات الورش، تتبع الفنيين، والتحكم بمخارات الدعم.' 
                  : 'Professional scheduler synced with fleet registries, workshops, active mechanics, and safety gates.'}
              </p>
            </div>

            {/* Action Controls & Display Tabs Toggle */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch lg:items-center gap-3 shrink-0">
              <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex items-center w-full sm:w-auto gap-1">
                <button
                  onClick={() => setManagerMode('kanban')}
                  className={`flex-1 sm:flex-none px-3 py-2.5 sm:px-4 sm:py-1.5 rounded-xl text-[10.5px] sm:text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    managerMode === 'kanban' 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                      : 'text-purple-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Kanban size={13} />
                  <span>{language === 'ar' ? 'لوحة المشاريع (Kanban)' : 'Kanban Board'}</span>
                </button>
                <button
                  onClick={() => setManagerMode('list')}
                  className={`flex-1 sm:flex-none px-3 py-2.5 sm:px-4 sm:py-1.5 rounded-xl text-[10.5px] sm:text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    managerMode === 'list' 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                      : 'text-purple-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ClipboardList size={13} />
                  <span>{language === 'ar' ? 'قائمة المشاريع' : 'Projects List'}</span>
                </button>
              </div>

              {user.role !== 'viewer' && (
                <button 
                  onClick={() => openNewOrderModal()}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-0 sm:h-11 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl sm:rounded-xl text-xs font-black shadow-md hover:shadow-lg active:scale-[98%] transition-all cursor-pointer border border-purple-400/20 whitespace-nowrap"
                >
                  <Plus size={15} />
                  <span>{language === 'ar' ? 'تخطيط وتدشين صيانة' : 'Plan Maintenance'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top-Level Professional KPI Stats widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'إجمالي الموازنة المعتمدة', 
            val: `${totalFinancialCost.toLocaleString()} ر.س`, 
            desc: 'لكافة أوامر الصيانة المنفذة والقديمة', 
            icon: <DollarSign size={18} className="text-emerald-600 dark:text-emerald-400" />, 
            bg: 'bg-emerald-100/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-300',
            text: 'text-emerald-950 dark:text-emerald-100',
            labelColor: 'text-emerald-800 dark:text-emerald-300',
            descColor: 'text-emerald-700/85 dark:text-emerald-400/80',
            iconBg: 'bg-white/90 dark:bg-emerald-900/60 shadow-xs'
          },
          { 
            label: 'عمليات جارية ميدانياً', 
            val: `${orders.filter(o => o.status === 'in-progress' && !isOrderArchived(o)).length} ورش صيانة`, 
            desc: 'شاحنات تحت التفكيك والإصلاح حالياً', 
            icon: <Activity size={18} className="text-amber-600 dark:text-amber-400" />, 
            bg: 'bg-amber-100/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40 hover:border-amber-300',
            text: 'text-amber-950 dark:text-amber-100',
            labelColor: 'text-amber-800 dark:text-amber-300',
            descColor: 'text-amber-700/85 dark:text-amber-400/80',
            iconBg: 'bg-white/90 dark:bg-amber-900/60 shadow-xs'
          },
          { 
            label: 'بانتظار دورة التشخيص', 
            val: `${orders.filter(o => o.status === 'pending' && !isOrderArchived(o)).length} بلاغات آليات`, 
            desc: 'قسم التوجيه واستقبال البلاغات روتين', 
            icon: <Clock size={18} className="text-rose-600 dark:text-rose-400 animate-pulse" />, 
            bg: 'bg-rose-100/85 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40 hover:border-rose-300',
            text: 'text-rose-950 dark:text-rose-100',
            labelColor: 'text-rose-800 dark:text-rose-300',
            descColor: 'text-rose-700/85 dark:text-rose-400/80',
            iconBg: 'bg-white/90 dark:bg-rose-900/60 shadow-xs'
          },
          { 
            label: 'مخزون الدعم المتوفر', 
            val: `${localInventory.reduce((acc, c) => acc + c.quantity, 0)} قطعة`, 
            desc: `من خلال ${localInventory.length} أصناف طوارئ مسجلة`, 
            icon: <Package size={18} className="text-sky-600 dark:text-sky-400" />, 
            bg: 'bg-sky-100/80 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/40 hover:border-sky-300',
            text: 'text-sky-950 dark:text-sky-100',
            labelColor: 'text-sky-800 dark:text-sky-300',
            descColor: 'text-sky-700/85 dark:text-sky-400/80',
            iconBg: 'bg-white/90 dark:bg-sky-900/60 shadow-xs'
          },
        ].map((st, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border ${st.bg} shadow-md hover:shadow-lg transition-all duration-300 -translate-y-[1px] hover:-translate-y-[3px] flex items-center justify-between group`}>
            <div className="space-y-1 text-right">
              <span className={`text-[10px] font-black block tracking-wide ${st.labelColor}`}>{st.label}</span>
              <span className={`text-base font-black font-mono leading-none block ${st.text}`}>{st.val}</span>
              <span className={`text-[8px] font-bold block ${st.descColor}`}>{st.desc}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${st.iconBg}`}>
              {st.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 4. INLINE: REGISTER NEW DETAILED MAINTENANCE PROJECT WORK_FLOW */}
      <AnimatePresence>
        {false && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-soft">
              <div className="pb-3 mb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-brand-blue-500 animate-pulse"></span>
                    تخطيط وتدشين أمر صيانة جديد
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">سيتم فور الاعتماد تحديث جرد الورش، صلاحية تحرك الآلية، وحساب ساعات العمل المتبقية للفنيين.</p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="px-2.5 py-1 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <X size={12} />
                  <span>تراجع وإلغاء ×</span>
                </button>
              </div>

              <form onSubmit={handleAddOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Vehicle Selector (Updates vehicle state system-wide on fire) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-700 dark:text-slate-300">المركبة / الآلية المشتكية:<span className="text-rose-500">*</span></label>
                    <select
                      value={newOrder.vehicleId}
                      required
                      onChange={(e) => setNewOrder(prev => ({ ...prev, vehicleId: e.target.value }))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-705 rounded-xl text-[11px] font-bold"
                    >
                      <option value="">اختر المركبة من الأسطول...</option>
                      {localVehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.plateNumber}) • {v.status === 'active' ? 'نشطة' : 'متوقفة أو بالصيانة'}</option>
                      ))}
                    </select>
                  </div>

                  {/* Workshop Location Assignment */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-700 dark:text-slate-300">الورشة الفنية المعنية بالعمل:<span className="text-rose-500">*</span></label>
                    <select
                      value={newOrder.workshopId}
                      required
                      onChange={(e) => setNewOrder(prev => ({ ...prev, workshopId: e.target.value }))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-855 border border-slate-200/60 dark:border-slate-705 rounded-xl text-[11px] font-bold text-slate-900 dark:text-white"
                    >
                      <option value="">اختر الورشة المتاحة لتسكين الآلية...</option>
                      {localWorkshops.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.isExternal ? '🔮 ورشة خارجية: ' : '🏢 '}
                          {w.name} {w.isExternal ? '' : `(${w.activeBays} / ${w.capacity} مركبة حالياً)`}
                        </option>
                      ))}
                    </select>
                    {(() => {
                      const chosenWs = localWorkshops.find(w => w.id === newOrder.workshopId);
                      if (chosenWs && chosenWs.isExternal) {
                        return (
                          <div className="mt-1 bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/10 p-1.5 rounded-lg text-[9px] text-purple-700 dark:text-purple-400 font-bold leading-tight">
                            ⚙️ تم اختيار ورشة خارجية معتمدة (صيانة تعاقدية). سيتيح النظام تتبع رقم الفاتورة الخارجية وتكلفتها والتسوية المالية تلقائياً من صفحة تفاصيل الطلب.
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* Category of repairs */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-700 dark:text-slate-300">تصنيف الإصلاحات:</label>
                    <select
                      value={newOrder.category}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-855 border border-slate-200/60 dark:border-slate-705 rounded-xl text-[11px] font-bold"
                    >
                      <option value="mechanical">صيانة ميكانيكية وتفكيك</option>
                      <option value="electrical">كهرباء وأنظمة رقمية</option>
                      <option value="cooling">تبريد وتبريد حافلات</option>
                      <option value="hydraulic">أنظمة هيدروليكية وروافع</option>
                      <option value="bodywork">حدادة وسمكرة وهيكل ليزر</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-700 dark:text-slate-300">أولوية الاستعجال:</label>
                    <select
                      value={newOrder.priority}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-855 border border-slate-200/60 dark:border-slate-705 rounded-xl text-[11px] font-bold"
                    >
                      <option value="low">منخفضة - عادي</option>
                      <option value="medium">متوسطة - عاجل</option>
                      <option value="high">طارئة - متوقفة ميدانياً</option>
                    </select>
                  </div>

                  {/* Date of intake */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-700 dark:text-slate-300">تاريخ تسجيل البلاغ:</label>
                    <input 
                      type="date"
                      required
                      value={newOrder.date}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-855 border border-slate-200/60 dark:border-slate-705 rounded-xl text-[11px] font-bold font-mono text-right"
                    />
                  </div>

                  {/* Estimated Cost budget */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-700 dark:text-slate-300">تكلفة الصيانة التقديرية (SAR):</label>
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={newOrder.cost}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, cost: e.target.value }))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-855 border border-slate-200/60 dark:border-slate-705 rounded-xl text-[11px] font-bold font-mono text-left"
                    />
                  </div>

                  {/* Assign Technician */}
                  <div className="md:col-span-2 lg:col-span-3 space-y-1">
                    <label className="text-[10px] font-black text-slate-700 dark:text-slate-300">الفني المعين (يرتبط بجدول ساعات المندوب):</label>
                    <select
                      value={newOrder.technicianId}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, technicianId: e.target.value }))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-855 border border-slate-200/60 dark:border-slate-705 rounded-xl text-[11px] font-bold"
                    >
                      <option value="">لا تعين أحداً (يترك معلق للتوزيع)</option>
                      {localTechnicians.map(t => (
                        <option key={t.id} value={t.id}>{t.name} (عدد المهام الحالية لديه: {t.activeTasks} مهام)</option>
                      ))}
                    </select>
                  </div>

                  {/* Logistics parts checkout area */}
                  <div className="md:col-span-2 lg:col-span-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-dashed border-slate-250 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-black text-brand-blue-600 block">سحب وتخصيص قطع غيار للطلب من جرد المخزن:</span>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <select
                        value={partToAdd}
                        onChange={(e) => setPartToAdd(e.target.value)}
                        className="w-full sm:flex-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      >
                        <option value="">اختر قطعة الغيار...</option>
                        {localInventory.map(item => (
                          <option key={item.id} value={item.id}>{item.name} ({item.partNumber}) • متوفر {item.quantity} قطع</option>
                        ))}
                      </select>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                        <input 
                          type="number" 
                          min={1}
                          value={partQtyToAdd} 
                          onChange={(e) => setPartQtyToAdd(parseInt(e.target.value) || 1)}
                          className="w-16 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-center"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            if (!partToAdd) return;
                            const foundPart = localInventory.find(i => i.id === partToAdd);
                            if (!foundPart) return;
                            
                            if (foundPart.quantity < partQtyToAdd) {
                              alert(`خطأ: المخزون المتوفر من (${foundPart.name}) غير كافٍ! المتوفر فقط هو ${foundPart.quantity} قطع.`);
                              return;
                            }

                            // Register parts reserved in local form variable
                            const existsIdx = newOrder.partsRequested.findIndex(p => p.partId === partToAdd);
                            if (existsIdx > -1) {
                              const copy = [...newOrder.partsRequested];
                              copy[existsIdx].quantity += partQtyToAdd;
                              setNewOrder(prev => ({ ...prev, partsRequested: copy }));
                            } else {
                              setNewOrder(prev => ({
                                ...prev,
                                partsRequested: [...prev.partsRequested, { partId: partToAdd, quantity: partQtyToAdd }]
                              }));
                            }
                            setPartToAdd('');
                            setPartQtyToAdd(1);
                          }}
                          className="px-3 py-1.5 bg-brand-blue-600 hover:bg-brand-blue-700 text-white rounded-lg text-xs font-black cursor-pointer whitespace-nowrap"
                        >
                          إدراج وحجز
                        </button>
                      </div>
                    </div>

                    {/* Listing of reserved parts within current draft */}
                    {newOrder.partsRequested.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[9px] font-black text-slate-400 block pb-0.5">السلع المحجوزة التي ستخصم فور التأكيد:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {newOrder.partsRequested.map((req, ridx) => {
                            const origPart = localInventory.find(item => item.id === req.partId);
                            return (
                              <div key={ridx} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1.5 text-[10px] font-extrabold pr-2 text-slate-800 dark:text-slate-200">
                                <span>{origPart?.name} x {req.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewOrder(prev => ({
                                      ...prev,
                                      partsRequested: prev.partsRequested.filter((_, i) => i !== ridx)
                                    }));
                                  }}
                                  className="text-rose-500 hover:text-rose-600 font-black cursor-pointer bg-slate-50 p-0.5 rounded"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Complaint description text */}
                  <div className="md:col-span-2 lg:col-span-3 space-y-1">
                    <label className="text-[10px] font-black text-slate-700 dark:text-slate-300">ملاحظات السائق وشرح عيوب السير:<span className="text-rose-500">*</span></label>
                    <textarea
                      required
                      value={newOrder.description}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      placeholder="اشرح بدقة وبلاغ كلي ما يشتكيه الميكانيكي أو السائق أثناء سير الشاحنة..."
                      className="w-full p-2 bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-705 rounded-xl text-[11px] font-bold"
                    />
                  </div>

                  {/* Technician Voice Notes field */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <VoiceNoteField
                      value={newOrder.techNotes || ''}
                      onChange={(val) => setNewOrder(prev => ({ ...prev, techNotes: val }))}
                      label="ملاحظات سجل الصيانة الفنية الصوتي (الميكروفون):"
                      placeholder="انقر على الميكروفون لتسجيل التقرير الفني الصوتي الفوري أو اكتب الملاحظات يدوياً بالمنظومة..."
                      rows={2}
                    />
                  </div>

                  {/* Defect camera capture */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <CameraCapture
                      photoUrl={newOrder.photoUrl}
                      onPhotoCaptured={(url) => setNewOrder(prev => ({ ...prev, photoUrl: url }))}
                      onPhotoCleared={() => setNewOrder(prev => ({ ...prev, photoUrl: '' }))}
                    />
                  </div>

                  {/* Interactive AI Milestone Steps configuration straight inside form */}
                  <div className="md:col-span-2 lg:col-span-3 space-y-1.5 border-t border-dashed border-slate-100 dark:border-slate-800/80 pt-2.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <div>
                        <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 block">خطوات الصيانة والتشخيص المقررة:</span>
                        <span className="text-[7.5px] text-slate-400 block leading-tight">يمكنك تعديلها يدوياً أو استخدام الذكاء الاصطناعي لتوليد خطوات دقيقة جداً ومخصصة تلقائياً.</span>
                      </div>
                      <button
                        type="button"
                        disabled={isGeneratingSteps || !newOrder.description.trim()}
                        onClick={async () => {
                          if (!newOrder.description.trim()) {
                            alert("الرجاء كتابة وصف معقول للعطل أولاً للتمكن من تحليله بالذكاء الاصطناعي.");
                            return;
                          }
                          setIsGeneratingSteps(true);
                          try {
                            const customSteps = await generateAIPERepairSteps(newOrder.category, newOrder.description);
                            setDraftMilestones(customSteps.map(st => ({ title: st, checked: false })));
                          } catch (e) {
                            alert("فشل توليد الخطوات، يرجى المحاولة لاحقاً.");
                          } finally {
                            setIsGeneratingSteps(false);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 border cursor-pointer transition-all shrink-0 ${
                          !newOrder.description.trim()
                            ? 'bg-slate-50 text-slate-400 border-slate-100 opacity-60'
                            : 'bg-brand-blue-50 text-brand-blue-600 hover:bg-brand-blue-100 border-brand-blue-105 dark:bg-brand-blue-500/15 dark:text-brand-blue-400 dark:border-brand-blue-500/30'
                        }`}
                      >
                        {isGeneratingSteps ? (
                          <>
                            <span className="animate-spin inline-block mr-0.5">⌛</span>
                            جاري تخطيط...
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            توليد بالذكاء الاصطناعي
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto p-1 bg-slate-105/50 dark:bg-slate-900/45 rounded-2xl border border-slate-150 dark:border-slate-800">
                      {draftMilestones.map((mst, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-755 text-xs shadow-xs">
                          <span className="font-mono text-[9px] text-slate-400 font-bold shrink-0">0{idx + 1}.</span>
                          <input 
                            type="text"
                            value={mst.title}
                            onChange={(e) => {
                              const copy = [...draftMilestones];
                              copy[idx].title = e.target.value;
                              setDraftMilestones(copy);
                            }}
                            className="flex-1 text-[11px] font-extrabold bg-transparent border-none focus:ring-0 p-0 text-slate-850 dark:text-slate-150 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setDraftMilestones(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="text-rose-500 hover:text-rose-600 shrink-0 px-1 text-sm font-black cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-105 dark:border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-bold"
                  >
                    تراجع
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-brand-blue-600 hover:bg-brand-blue-700 text-white rounded-xl text-[11px] font-black shadow-md cursor-pointer"
                  >
                    رسم وتدشين المشروع
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Collapsible Filter Lists & Quick Archive Bar */}
      <div className="space-y-3 mb-5">
        
        {/* Top Control Strip: Toggle 3 Filter Lists + Quick Archive Button + Active Filter Chips */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-150/60 dark:border-slate-800 shadow-soft flex flex-wrap items-center justify-between gap-3">
          
          {/* Right side: Purple Gradient Toggle Button for the 3 Filter lists */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsFiltersOpen(prev => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer font-black text-xs select-none border border-white/20"
              title="فتح أو إغلاق قوائم الفلترة والتخصيص الثلاث"
            >
              <Sliders size={13} className="text-purple-200" />
              <span>{isFiltersOpen ? 'طي وإغلاق قوائم الفلترة' : 'فتح قوائم الفلترة والتخصيص (٣ قوائم)'}</span>
              <div className={`p-1 bg-white/25 rounded-full backdrop-blur-xs transition-transform duration-300 ${isFiltersOpen ? 'rotate-180' : 'rotate-0'}`}>
                <ChevronDown size={13} className="text-white" strokeWidth={3} />
              </div>
            </button>

            {/* Quick Archive for All Completed Tasks Button (الأرشفة السريعة للمهام المنتهية) */}
            {(() => {
              const completedUnarchivedCount = orders.filter(o => o.status === 'completed' && !isOrderArchived(o)).length;
              return completedUnarchivedCount > 0 ? (
                <button
                  type="button"
                  onClick={handleQuickArchiveAllCompleted}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100/90 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-black text-xs border border-purple-200/70 dark:border-purple-800/70 transition-all shadow-xs cursor-pointer select-none"
                  title="أرشفة سريعة لكافة المهام المنتهية بنقرة واحدة لتنظيف الواجهة الرئيسية"
                >
                  <Archive size={13} className="text-purple-600 dark:text-purple-400" />
                  <span>الأرشفة السريعة للمنتهية ({completedUnarchivedCount}) 📦</span>
                </button>
              ) : null;
            })()}
          </div>

          {/* Left side: Quick active filters indicators when collapsed */}
          <div className="flex items-center gap-2 flex-wrap text-right" dir="rtl">
            {(statusFilter !== 'all' || selectedVehicleId !== 'all' || selectedTechnicianId !== 'all' || selectedWorkshopId !== 'all' || selectedPriority !== 'all') ? (
              <div className="flex items-center gap-2 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-xl border border-amber-500/20 text-[11px] font-black">
                <span>تصفية مخصصة نشطة</span>
                <button 
                  type="button" 
                  onClick={clearFilters}
                  className="text-[10px] text-rose-500 hover:text-rose-600 dark:text-rose-400 font-extrabold underline cursor-pointer"
                >
                  تصفير الكل
                </button>
              </div>
            ) : (
              <span className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500 hidden sm:inline-block">
                القوائم مطوية لتوفير مساحة العمل — اضغط على السهم البنفسجي لفتحها
              </span>
            )}
          </div>
        </div>

        {/* Collapsible Container for the 3 Filter lists */}
        <AnimatePresence>
          {isFiltersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.99 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.99 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden space-y-4 pt-1"
            >
              {/* Status filtering widgets (1. Horizontal Process Tabs) */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-150/60 dark:border-slate-800 shadow-soft">
                <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-100 dark:border-slate-800/80 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 rounded-full bg-brand-blue-500 block"></span>
                    <span className="text-[11px] font-black text-slate-800 dark:text-slate-300">القائمة ١: مسار المشروع وحالات الإنجاز</span>
                  </div>
                  
                  <span className="text-[10px] font-bold text-slate-400">
                    اختر الحالة لعرض المشاريع التابعة لها
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {[
                    { id: 'all', label: 'المشاريع النشطة والوافدة', icon: <FileText size={11} />, count: activeCount, color: 'text-brand-blue-500', bg: 'bg-brand-blue-500/10' },
                    { id: 'pending', label: 'التشخيص وتلقي الأعطال', icon: <Clock size={11} />, count: orders.filter(o => o.status === 'pending' && !isOrderArchived(o)).length, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                    { id: 'in-progress', label: 'عمليات الصيانة الجارية', icon: <AlertCircle size={11} />, count: orders.filter(o => o.status === 'in-progress' && !isOrderArchived(o)).length, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { id: 'completed', label: 'مكتملة ومستلمة بالخدمة', icon: <CheckCircle2 size={11} />, count: orders.filter(o => o.status === 'completed' && !isOrderArchived(o)).length, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { id: 'archived', label: 'مستندات الأرشيف المغلق', icon: <Archive size={11} />, count: archivedCount, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                  ].map((filter) => {
                    const isActive = statusFilter === filter.id;
                    return (
                      <button 
                        key={filter.id}
                        onClick={() => setStatusFilter(filter.id as any)}
                        className={`w-full flex items-center justify-between py-1.5 px-2.5 rounded-xl transition-all border cursor-pointer ${
                          isActive 
                            ? 'bg-brand-blue-50/70 dark:bg-brand-blue-955 text-brand-blue-700 dark:text-brand-blue-400 font-extrabold border-brand-blue-150/50 dark:border-brand-blue-800/60 shadow-xs' 
                            : 'border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-855 text-slate-600 dark:text-slate-350 bg-slate-50/20 dark:bg-slate-905'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className={`p-1 rounded-md transition-colors shrink-0 ${isActive ? 'bg-brand-blue-500 text-white' : `${filter.bg} ${filter.color}`}`}>
                            {filter.icon}
                          </div>
                          <span className="text-[10.5px] font-black text-right whitespace-nowrap">{filter.label}</span>
                        </div>
                        <span className={`text-[9.5px] font-black px-1.5 py-0.5 rounded-full border shrink-0 ${
                          isActive 
                            ? 'bg-brand-blue-105/60 dark:bg-brand-blue-900/60 border-brand-blue-200/40 dark:border-brand-blue-800/60 text-brand-blue-800 dark:text-brand-blue-300' 
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-450'
                        }`}>
                          {filter.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Column selectors & Database Archiving in split layout side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-fadeIn">
                
                {/* 2. Dropdown selectors (takes 3/4 layout) */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-150/60 dark:border-slate-800 shadow-soft">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3.5 px-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-3.5 rounded-full bg-indigo-500 block"></span>
                      <span className="text-[11.5px] font-black text-slate-850 dark:text-slate-300 flex items-center gap-1.5">
                        <Sliders size={13} className="text-indigo-500" />
                        <span>القائمة ٢: تصفية وتخصيص دقيق للمشاريع</span>
                      </span>
                    </div>
                    <button 
                      onClick={clearFilters} 
                      className="text-[10px] font-extrabold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-350 transition-colors flex items-center gap-1 cursor-pointer bg-rose-50 dark:bg-rose-950/20 px-2.5 py-1 rounded-lg border border-rose-100 dark:border-rose-900/50"
                    >
                      تصفير الفلاتر
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                    
                    {/* Vehicle Search selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                        <Truck size={11} className="text-slate-400" />
                        <span>المركبة المستطلعة</span>
                      </label>
                      <div className="relative">
                        <select 
                          value={selectedVehicleId} 
                          onChange={(e) => setSelectedVehicleId(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors focus:ring-2 focus:ring-indigo-550/15 focus:border-indigo-500"
                        >
                          <option value="all">كافة مركبات الأسطول</option>
                          {localVehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Workshop Search selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                        <Wrench size={11} className="text-slate-400" />
                        <span>الورشة الفنية المخصصة</span>
                      </label>
                      <div className="relative">
                        <select 
                          value={selectedWorkshopId} 
                          onChange={(e) => setSelectedWorkshopId(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors focus:ring-2 focus:ring-indigo-550/15 focus:border-indigo-500"
                        >
                          <option value="all">كافة فروع وصالات الصيانة</option>
                          {localWorkshops.map(ws => (
                            <option key={ws.id} value={ws.id}>{ws.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Technician Search selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                        <UserIcon size={11} className="text-slate-400" />
                        <span>فني الصيانة المسؤول</span>
                      </label>
                      <div className="relative">
                        <select 
                          value={selectedTechnicianId} 
                          onChange={(e) => setSelectedTechnicianId(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors focus:ring-2 focus:ring-indigo-550/15 focus:border-indigo-500"
                        >
                          <option value="all">المدراء والفنيين المعينين</option>
                          {localTechnicians.map(t => (
                            <option key={t.id} value={t.id}>{t.name} - {t.role}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Priority selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                        <AlertTriangle size={11} className="text-slate-400" />
                        <span>مستوى خطورة العطل</span>
                      </label>
                      <div className="relative">
                        <select 
                          value={selectedPriority} 
                          onChange={(e) => setSelectedPriority(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors focus:ring-2 focus:ring-indigo-550/15 focus:border-indigo-500"
                        >
                          <option value="all">جميع درجات الخطورة</option>
                          <option value="low">منخفضة عادي</option>
                          <option value="medium">متوسط الاستعجال</option>
                          <option value="high">طارئة وخطيرة جداً</option>
                        </select>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 3. Database & Logistics Archiving module */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-150/60 dark:border-slate-800 shadow-soft flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/80 mb-2">
                    <span className="w-1.5 h-3.5 rounded-full bg-emerald-500 block"></span>
                    <div className="flex items-center gap-1 text-slate-900 dark:text-white font-black text-xs">
                      <Database size={13} className="text-emerald-500" />
                      <span>القائمة ٣: أرشيف الإصلاحات</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 items-center mb-2">
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold text-slate-400 block">فترة الأرشفة:</span>
                      <select
                        value={archiveYears}
                        onChange={(e) => setArchiveYears(parseFloat(e.target.value))}
                        className="w-full p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-lg text-[9px] font-black text-slate-800 dark:text-slate-200 outline-none"
                      >
                        <option value={0.5}>٦ أشهر</option>
                        <option value={1}>سنة</option>
                        <option value={2}>سنتين</option>
                        <option value={0}>إيقاف</option>
                      </select>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-955 p-1.5 rounded-xl border border-slate-100 dark:border-slate-850 text-center">
                      <span className="text-[9px] text-slate-405 block">المؤرشفة</span>
                      <span className="text-[10px] font-black text-slate-700 dark:text-slate-200">
                        {archivedCount} مشروع
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    <button
                      onClick={runArchivalMaintenance}
                      disabled={isSimulatingArchive}
                      className="w-full text-[9px] font-black py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200/50 dark:border-slate-700 transition-all cursor-pointer block text-center"
                    >
                      {isSimulatingArchive ? 'جاري الصيانة...' : 'تحسين جدول الفهرس'}
                    </button>
                    {user.role === 'admin' ? (
                      <button
                        onClick={archiveCompletedTasksOlderThan30Days}
                        disabled={isArchiving30Days}
                        className="w-full text-[9px] font-black py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200/50 dark:border-indigo-800 transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        {isArchiving30Days ? <Loader2 size={10} className="animate-spin" /> : <Archive size={10} />}
                        <span>أرشفة المكتملة (+30 يوم)</span>
                      </button>
                    ) : (
                      <div className="text-[8px] text-center text-slate-400 font-bold bg-slate-50 dark:bg-slate-905 p-1 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                        أرشفة الـ 30 يوماً مخصصة للإدارة
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Floating Toast Notification for Quick Archiving */}
      <AnimatePresence>
        {quickArchiveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-purple-500/40 backdrop-blur-md flex items-center gap-2 font-black text-xs select-none text-right"
            dir="rtl"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white shrink-0">
              <Archive size={11} />
            </div>
            <span>{quickArchiveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Main Body: Full width list / Kanban board! */}
      <div className="space-y-4">
        
        {/* Main Search input bar with quick options */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-705 shadow-soft space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 bg-slate-50/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                <Search className="text-slate-400" size={15} />
                <input 
                  type="text" 
                  placeholder="البحث برقم أمر الصيانة، البلاغ، اسم الشاحنة والمعدات، أو ميزة القطع المستهدفة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 dark:text-white flex-1"
                />
              </div>

              {/* View Mode Selector (طريقة العرض) matching image style */}
              <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0 select-none" dir="rtl">
                <span className="text-[9.5px] font-black text-[#5a718f] dark:text-slate-450">طريقة العرض:</span>
                <div className="flex items-center bg-slate-50/80 dark:bg-slate-950 p-[3px] rounded-full border border-slate-300 dark:border-slate-600 select-none shadow-xs">
                  <button
                    type="button"
                    onClick={() => setManagerMode('list')}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] transition-all cursor-pointer ${
                      managerMode === 'list'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-black'
                        : 'text-[#425a7a] hover:text-slate-700 dark:hover:text-slate-300 font-bold'
                    }`}
                  >
                    <List size={10} />
                    <span>القائمة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setManagerMode('kanban')}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] transition-all cursor-pointer ${
                      managerMode === 'kanban'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-black'
                        : 'text-[#425a7a] hover:text-slate-700 dark:hover:text-slate-300 font-bold'
                    }`}
                  >
                    <LayoutGrid size={10} />
                    <span>الشبكة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setManagerMode('calendar')}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] transition-all cursor-pointer ${
                      managerMode === 'calendar'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-black'
                        : 'text-[#425a7a] hover:text-slate-700 dark:hover:text-slate-300 font-bold'
                    }`}
                  >
                    <Calendar size={10} />
                    <span>التقويم</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setManagerMode('diagnostic')}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] transition-all cursor-pointer ${
                      managerMode === 'diagnostic'
                        ? 'bg-brand-blue-600 text-white shadow-xs font-black'
                        : 'text-violet-600 dark:text-violet-400 hover:text-slate-700 dark:hover:text-slate-300 font-bold'
                    }`}
                  >
                    <Sparkles size={10} className="animate-pulse" />
                    <span>التشخيص الذكي 🪄</span>
                  </button>
                </div>
              </div>
            </div>
            {searchTerm && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-[10px]">
                <span className="text-slate-400">تصفية ذكية للمشروعات الجارية</span>
                <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-black cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={includeArchivedInSearch} 
                    onChange={(e) => setIncludeArchivedInSearch(e.target.checked)}
                    className="rounded text-brand-blue-600 cursor-pointer h-3 w-3" 
                  />
                  <span>تفتيش في ملفات الأرشيف المغلقة ({archivedCount})</span>
                </label>
              </div>
            )}
          </div>

          {/* Quick Critical Alerts for stock logic */}
          <div className="flex flex-col gap-1.5">
            {localInventory
              .filter(item => item.quantity <= item.minQuantity && !dismissedAlerts.includes(item.id))
              .map(item => (
                <div 
                  key={item.id} 
                  className="bg-rose-50/70 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-xl border border-rose-150 dark:border-rose-900/40 flex items-center justify-between text-[9.5px] font-black leading-snug animate-fadeIn"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={12} className="text-rose-500 shrink-0" />
                    <span>تنبيه اللوجستيات: مخزون {item.name} ({item.partNumber}) منخفض بالمخازن! ({item.quantity} قطع متوفرة).</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="underline hover:text-rose-700 dark:hover:text-rose-300 cursor-pointer text-[9px]">طلب تأمين</span>
                    <button 
                      onClick={() => setDismissedAlerts(prev => [...prev, item.id])}
                      className="p-0.5 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors cursor-pointer"
                      title="إخفاء التنبيه"
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* RENDERING SCREEN: ARCHIVE HISTORY OR KANBAN OR LIST */}
          {statusFilter === 'archived' ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-150/60 dark:border-slate-800 p-6 shadow-soft space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center border border-indigo-100/30 shrink-0">
                    <Archive size={22} />
                  </div>
                  <div className="text-right">
                    <h2 className="text-base font-black text-slate-900 dark:text-white">سجل الأرشيف وقاعدة البيانات المغلقة</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      مستودع إداري للمشاريع المكتملة والمؤرشفة تلقائياً أو يدوياً لمرور أكثر من 30 يوماً عليها.
                    </p>
                  </div>
                </div>

                {/* Quick Stats & Action inside the Archive Panel */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 px-4 py-2 rounded-2xl border border-indigo-100/20 text-right">
                    <span className="text-[10px] text-indigo-400 block font-bold">إجمالي المشاريع المؤرشفة:</span>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">{archivedCount} مشروع</span>
                  </div>

                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-2 rounded-2xl border border-emerald-100/20 text-right">
                    <span className="text-[10px] text-emerald-400 block font-bold">بانتظار الأرشفة (+30 يوماً):</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {orders.filter(o => o.status === 'completed' && !o.isArchived && getOrderAgeInDays(o.date) > 30).length} مشروع
                    </span>
                  </div>

                  {user.role === 'admin' && (
                    <button
                      onClick={archiveCompletedTasksOlderThan30Days}
                      disabled={isArchiving30Days}
                      className="px-4 py-2.5 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 hover:opacity-90 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isArchiving30Days ? <Loader2 size={13} className="animate-spin" /> : <Database size={13} />}
                      <span>تفعيل الأرشفة الذكية (+30 يوم)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Archived Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black h-10">
                      <th className="p-3 rounded-r-xl">شفرة المشروع</th>
                      <th className="p-3">الآلية / الشاحنة</th>
                      <th className="p-3">نوع الخلل وصيانة العيب</th>
                      <th className="p-3">تاريخ الإكمال</th>
                      <th className="p-3">المدة بالأرشيف</th>
                      <th className="p-3">التكلفة الإجمالية</th>
                      <th className="p-3 rounded-l-xl text-left">خيارات الاسترجاع (الإدارة)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                          لا توجد مشاريع مؤرشفة تطابق معايير البحث والفلترة المحددة.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => {
                        const veh = localVehicles.find(v => v.id === order.vehicleId);
                        const ageInDays = Math.round(getOrderAgeInDays(order.date));

                        return (
                          <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                            <td className="p-3 font-mono font-black text-slate-900 dark:text-white">
                              {order.orderNumber}
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-800 dark:text-slate-200">{veh?.name || 'آلية غير معروفة'}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{veh?.plateNumber || ''}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-slate-700 dark:text-slate-300 max-w-xs truncate" title={order.description}>
                                {order.description}
                              </div>
                              <span className="inline-block px-1.5 py-0.2 rounded-md text-[9px] font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 mt-1">
                                {order.category}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-slate-500 dark:text-slate-400">
                              {order.date}
                            </td>
                            <td className="p-3">
                              <span className="font-mono font-black text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-lg text-[10px]">
                                {ageInDays} يوماً
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                              {order.cost ? `${order.cost} ر.س` : 'غير محدد'}
                            </td>
                            <td className="p-3 text-left">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-black transition-all cursor-pointer"
                                >
                                  عرض التفاصيل
                                </button>
                                {user.role === 'admin' ? (
                                  <button
                                    onClick={() => restoreOrderFromArchive(order.id)}
                                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer animate-pulse"
                                    title="استرجاع السجل إلى المشاريع النشطة"
                                  >
                                    <RotateCcw size={10} />
                                    <span>استرجاع</span>
                                  </button>
                                ) : (
                                  <span className="text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800/40 px-2 py-1 rounded-md">
                                    للإدارة فقط
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : managerMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Column 1: PENDING TRIAGE */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <Clock size={12} className="animate-spin" />
                    <span>تلقي البلاغات والتشخيص</span>
                  </span>
                  <span className="font-mono text-xs font-black text-slate-400">
                    {filteredOrders.filter(o => o.status === 'pending').length}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[75vh] scrollbar-thin">
                  <AnimatePresence mode="popLayout">
                    {filteredOrders.filter(o => o.status === 'pending').map(order => (
                      <ProjectCard 
                        key={order.id} 
                        order={order} 
                        vehicles={localVehicles}
                        technicians={localTechnicians}
                        workshops={localWorkshops}
                        allOrders={orders}
                        onClick={() => setSelectedOrder(order)}
                        onMove={(next) => moveOrderKanbanStatus(order.id, next)}
                      />
                    ))}
                  </AnimatePresence>
                  {filteredOrders.filter(o => o.status === 'pending').length === 0 && (
                    <div className="text-center py-10 bg-white dark:bg-slate-850/30 rounded-2xl border border-dashed border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold">لا يوجد مركبات بانتظار التشخيص الفني.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: IN-PROGRESS REPAIRS */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <Wrench size={12} className="animate-pulse" />
                    <span>عمليات الصيانة والتركيب</span>
                  </span>
                  <span className="font-mono text-xs font-black text-slate-400">
                    {filteredOrders.filter(o => o.status === 'in-progress').length}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[75vh] scrollbar-thin">
                  <AnimatePresence mode="popLayout">
                    {filteredOrders.filter(o => o.status === 'in-progress').map(order => (
                      <ProjectCard 
                        key={order.id} 
                        order={order} 
                        vehicles={localVehicles}
                        technicians={localTechnicians}
                        workshops={localWorkshops}
                        allOrders={orders}
                        onClick={() => setSelectedOrder(order)}
                        onMove={(next) => moveOrderKanbanStatus(order.id, next)}
                      />
                    ))}
                  </AnimatePresence>
                  {filteredOrders.filter(o => o.status === 'in-progress').length === 0 && (
                    <div className="text-center py-10 bg-white dark:bg-slate-850/30 rounded-2xl border border-dashed border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold">لا يوجد مهام صيانة نشطة الآن بالورش الفنية.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: QUALITY ASSURANCE & COMPLETED */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <CheckCircle2 size={12} />
                    <span>الاعتماد والجاهزية والاستلام</span>
                  </span>
                  <span className="font-mono text-xs font-black text-slate-400">
                    {filteredOrders.filter(o => o.status === 'completed').length}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[75vh] scrollbar-thin">
                  <AnimatePresence mode="popLayout">
                    {filteredOrders.filter(o => o.status === 'completed').map(order => (
                      <ProjectCard 
                        key={order.id} 
                        order={order} 
                        vehicles={localVehicles}
                        technicians={localTechnicians}
                        workshops={localWorkshops}
                        allOrders={orders}
                        onClick={() => setSelectedOrder(order)}
                        onMove={(next) => moveOrderKanbanStatus(order.id, next)}
                        onArchive={handleQuickArchiveOrder}
                      />
                    ))}
                  </AnimatePresence>
                  {filteredOrders.filter(o => o.status === 'completed').length === 0 && (
                    <div className="text-center py-10 bg-white dark:bg-slate-850/30 rounded-2xl border border-dashed border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold">لا يوجد مشاريع مكتملة حديثاً ومسرحة للعمل.</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : managerMode === 'list' ? (
            // RENDERING SCREEN: STANDARD LIST VIEW TABLE
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-705 overflow-hidden">
              <div className="overflow-x-auto">
                <table id="maintenance-orders-table" className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black h-10">
                      <th className="p-3">شفرة المشروع</th>
                      <th className="p-3">الآلية المشتكية</th>
                      <th className="p-3">العيب والخلل</th>
                      <th className="p-3">الورشة الفنية والموقع</th>
                      <th className="p-3">الفني المسؤول</th>
                      <th className="p-3">التقدم الفعلي</th>
                      <th className="p-3">الخطة التقديرية</th>
                      <th className="p-3 text-left">التكلفة</th>
                      <th className="p-3 text-center">أرشفة سريعة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => {
                      const veh = localVehicles.find(v => v.id === order.vehicleId);
                      const tech = localTechnicians.find(t => t.id === order.technicianId);
                      const ws = localWorkshops.find(w => w.id === order.workshopId);
                      const progress = order.progress || 0;
                      
                      // Status colors config (Trello-inspired clear colored backgrounds and borders)
                      const statusColors: Record<string, { bg: string; hoverBg: string; borderRight: string; text: string; mute: string }> = {
                        completed: {
                          bg: "bg-emerald-50/70 dark:bg-emerald-950/20",
                          hoverBg: "hover:bg-emerald-100/80 dark:hover:bg-emerald-950/30",
                          borderRight: "border-r-[5px] border-r-emerald-500",
                          text: "text-emerald-950 dark:text-emerald-50",
                          mute: "text-emerald-750 dark:text-emerald-300"
                        },
                        'in-progress': {
                          bg: "bg-amber-50/70 dark:bg-amber-950/20",
                          hoverBg: "hover:bg-amber-100/80 dark:hover:bg-amber-950/30",
                          borderRight: "border-r-[5px] border-r-amber-400",
                          text: "text-amber-950 dark:text-amber-50",
                          mute: "text-amber-750 dark:text-amber-300"
                        },
                        pending: {
                          bg: "bg-rose-50/70 dark:bg-rose-950/20",
                          hoverBg: "hover:bg-rose-100/80 dark:hover:bg-rose-950/30",
                          borderRight: "border-r-[5px] border-r-rose-450",
                          text: "text-rose-950 dark:text-rose-50",
                          mute: "text-rose-750 dark:text-rose-350"
                        }
                      };

                      const colorConfig = statusColors[order.status] || {
                        bg: "bg-slate-50/50 dark:bg-slate-900/10",
                        hoverBg: "hover:bg-slate-100/50 dark:hover:bg-slate-900/20",
                        borderRight: "border-r-[5px] border-r-slate-300",
                        text: "text-slate-800 dark:text-slate-200",
                        mute: "text-slate-400 dark:text-slate-555"
                      };

                      const isArchivedItem = isOrderArchived(order);

                      return (
                        <tr 
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className={`border-b last:border-none border-slate-100 dark:border-slate-800/60 transition-all duration-200 cursor-pointer ${colorConfig.bg} ${colorConfig.hoverBg} ${colorConfig.borderRight} ${colorConfig.text}`}
                        >
                          <td className="p-3 font-black text-brand-blue-600 dark:text-brand-blue-400 font-mono">{order.orderNumber}</td>
                          <td className="p-3">
                            <span className="font-extrabold block">{veh?.name}</span>
                            <span className="text-[10px] font-mono opacity-80 block mt-0.5">{veh?.plateNumber}</span>
                          </td>
                          <td className="p-3 font-bold max-w-xs truncate opacity-90">{order.description}</td>
                          <td className="p-3 font-black">{ws?.name || 'ميداني خارجي'}</td>
                          <td className="p-3">
                            {tech ? (
                              <span className="font-extrabold">{tech.name} ({tech.role})</span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 font-bold block">لم يعين أحد</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 w-16 bg-slate-200/50 dark:bg-slate-900/60 h-1.5 rounded-full overflow-hidden block">
                                <div className="bg-brand-blue-500 h-full rounded-full" style={{ width: `${progress}%` }} />
                              </div>
                              <span className="font-mono text-[10px] font-black">{progress}%</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <PriorityBadge priority={order.priority} />
                          </td>
                          <td className="p-3 text-left font-mono font-black">
                            {order.cost ? `${order.cost.toLocaleString()} ر.س` : 'معلق'}
                          </td>
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            {order.status === 'completed' && !isArchivedItem ? (
                              <button
                                type="button"
                                onClick={() => handleQuickArchiveOrder(order.id)}
                                className="text-[10px] font-black px-2.5 py-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-200/70 dark:border-purple-800/70 cursor-pointer flex items-center gap-1 mx-auto transition-all shadow-xs"
                                title="أرشفة سريعة للمهمة المنتهية بنقرة واحدة"
                              >
                                <Archive size={11} className="text-purple-600 dark:text-purple-400" />
                                <span>أرشفة 📦</span>
                              </button>
                            ) : isArchivedItem ? (
                              <span className="text-[9px] font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200/40">مؤرشف</span>
                            ) : (
                              <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={9} className="text-center py-20 text-slate-400 font-bold">
                          لا يوجد مشاريع صيانة تطابق عناصر تصفية البحث المحددة.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : managerMode === 'diagnostic' ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-150/60 dark:border-slate-800 shadow-soft">
              <SmartDiagnostic 
                vehicles={localVehicles}
                technicians={localTechnicians}
                inventory={localInventory}
                workshops={localWorkshops}
                onAddOrder={handleSmartDiagnosticOrder}
                onCancel={() => setManagerMode('kanban')}
              />
            </div>
          ) : (
            /* RENDERING SCREEN: INTERACTIVE CALENDAR VIEW */
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150/60 dark:border-slate-800 shadow-soft">
              {/* Calendar Header with Navigation and Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-blue-50 dark:bg-brand-blue-500/10 text-brand-blue-600 dark:text-brand-blue-400 flex items-center justify-center font-bold">
                    <Calendar size={18} />
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>تقويم جدولة صيانة الأسطول</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">تفاعلي</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">اضغط على أي يوم لجدولة بلاغ أو مهمة صيانة جديدة لهذه المركبات.</p>
                  </div>
                </div>

                {/* Navigation and Date Controls */}
                <div className="flex items-center gap-2 self-end sm:self-auto" dir="rtl">
                  <button
                    onClick={() => {
                      const prevMonth = new Date(currentCalDate.getFullYear(), currentCalDate.getMonth() - 1, 1);
                      setCurrentCalDate(prevMonth);
                    }}
                    className="p-1.5 md:p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 transition-colors"
                    title="الشهر السابق"
                  >
                    <ChevronRight size={16} />
                  </button>

                  <div className="bg-slate-50 dark:bg-slate-955 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-center min-w-[130px]">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                      {(() => {
                        const monthsAr = [
                          'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                          'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
                        ];
                        return monthsAr[currentCalDate.getMonth()];
                      })()}{' '}
                      {currentCalDate.getFullYear()}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      const nextMonth = new Date(currentCalDate.getFullYear(), currentCalDate.getMonth() + 1, 1);
                      setCurrentCalDate(nextMonth);
                    }}
                    className="p-1.5 md:p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-955 dark:hover:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 transition-colors"
                    title="الشهر التالي"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <button
                    onClick={() => setCurrentCalDate(new Date(SYSTEM_ANCHOR_DATE))}
                    className="px-3 py-2 bg-brand-blue-50 hover:bg-brand-blue-100 dark:bg-brand-blue-500/15 dark:hover:bg-brand-blue-500/25 text-brand-blue-700 dark:text-brand-blue-400 text-[10px] font-black rounded-xl transition-all cursor-pointer border border-brand-blue-100/30"
                  >
                    اليوم الحالي
                  </button>
                </div>
              </div>

              {/* Calendar Grid Header (Weeks) */}
              <div className="grid grid-cols-7 gap-1.5 mb-2 text-center" dir="rtl">
                {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day, idx) => (
                  <div key={idx} className="py-2 text-[10.5px] font-black text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid Days */}
              <div className="grid grid-cols-7 gap-1.5 md:gap-2.5 min-h-[460px]" dir="rtl">
                {(() => {
                  const calendarDaysArray = [];
                  const year = currentCalDate.getFullYear();
                  const month = currentCalDate.getMonth();

                  // Helpers
                  const getFormatDateStr = (y: number, m: number, d: number) => {
                    const pad = (n: number) => n.toString().padStart(2, '0');
                    return `${y}-${pad(m + 1)}-${pad(d)}`;
                  };

                  const getOrdersForDate = (dateStr: string) => {
                    return filteredOrders.filter(o => o.date === dateStr);
                  };

                  const firstDay = new Date(year, month, 1);
                  const startDayIndex = firstDay.getDay(); // Sunday is 0
                  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
                  const daysInPrevMonth = new Date(year, month, 0).getDate();

                  // 1. Previous Month Padding days
                  for (let i = startDayIndex - 1; i >= 0; i--) {
                    const prevD = daysInPrevMonth - i;
                    const prevM = month === 0 ? 11 : month - 1;
                    const prevY = month === 0 ? year - 1 : year;
                    const dateStr = getFormatDateStr(prevY, prevM, prevD);
                    calendarDaysArray.push({
                      dayNum: prevD,
                      isCurrentMonth: false,
                      dateStr,
                      orders: getOrdersForDate(dateStr)
                    });
                  }

                  // 2. Current Month days
                  for (let d = 1; d <= daysInCurrentMonth; d++) {
                    const dateStr = getFormatDateStr(year, month, d);
                    calendarDaysArray.push({
                      dayNum: d,
                      isCurrentMonth: true,
                      dateStr,
                      orders: getOrdersForDate(dateStr)
                    });
                  }

                  // 3. Next Month Padding days (to fill 42 cells)
                  const remainingCells = 42 - calendarDaysArray.length;
                  for (let d = 1; d <= remainingCells; d++) {
                    const nextM = month === 11 ? 0 : month + 1;
                    const nextY = month === 11 ? year + 1 : year;
                    const dateStr = getFormatDateStr(nextY, nextM, d);
                    calendarDaysArray.push({
                      dayNum: d,
                      isCurrentMonth: false,
                      dateStr,
                      orders: getOrdersForDate(dateStr)
                    });
                  }

                  return calendarDaysArray.map((cell, index) => {
                    const isToday = cell.dateStr === SYSTEM_ANCHOR_DATE;
                    return (
                      <div
                        key={index}
                        onClick={(e) => {
                          // Allow clicking cell to add new order, but skip if clicked inside an order pill
                          if ((e.target as HTMLElement).closest('.order-pill')) return;
                          openNewOrderModal(cell.dateStr);
                        }}
                        className={`group relative flex flex-col justify-between p-1.5 md:p-2.5 rounded-2xl border transition-all duration-200 h-full overflow-hidden text-right cursor-pointer select-none min-h-[75px] ${
                          cell.isCurrentMonth
                            ? isToday
                              ? 'bg-brand-blue-50/25 border-brand-blue-400 dark:bg-brand-blue-500/5 dark:border-brand-blue-500/50 shadow-soft'
                              : 'bg-slate-50/20 dark:bg-slate-905 border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-50/60 dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-705 shadow-xs'
                            : 'bg-slate-100/20 dark:bg-slate-950/20 text-slate-350 dark:text-slate-650 border-slate-100/60 dark:border-slate-900/60 hover:bg-slate-50/30'
                        }`}
                      >
                        {/* Day indicator & Quick Add trigger */}
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] md:text-sm font-black transition-colors ${
                            cell.isCurrentMonth
                              ? isToday
                                ? 'text-brand-blue-600 dark:text-brand-blue-400'
                                : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                              : 'text-slate-350 dark:text-slate-650'
                          }`}>
                            {cell.dayNum}
                          </span>
                          
                          {/* Indicator for current system date */}
                          {isToday && (
                            <span className="text-[7.5px] font-black px-1.5 py-0.2 rounded-md bg-brand-blue-600 dark:bg-brand-blue-500 text-white select-none animate-pulse">
                              اليوم
                            </span>
                          )}

                          {/* Quick add button on hover */}
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-blue-500 hover:text-brand-blue-600 font-bold text-xs" title="جدولة صيانة جديدة">+</span>
                        </div>

                        {/* List of Orders for this day */}
                        <div className="flex-grow mt-1 space-y-1 overflow-y-auto max-h-[60px] scrollbar-none">
                          {cell.orders.map((order) => {
                            const veh = localVehicles.find(v => v.id === order.vehicleId);
                            // Colors based on priority
                            let priorityColorsStr = "bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-450 border-sky-100 dark:border-sky-900/50";
                            let statusDotColor = "bg-sky-500";
                            if (order.priority === 'high') {
                              priorityColorsStr = "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/55";
                              statusDotColor = "bg-rose-500";
                            } else if (order.priority === 'medium') {
                              priorityColorsStr = "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/55";
                              statusDotColor = "bg-amber-500";
                            }

                            return (
                              <div
                                key={order.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                }}
                                className="order-pill flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[8px] md:text-[9.5px] font-black leading-tight cursor-pointer transition-all duration-150 hover:scale-[1.01] active:scale-95 whitespace-nowrap overflow-hidden text-ellipsis shadow-xs mb-0.5"
                                title={`${order.orderNumber}: ${veh?.name || ''} - ${order.description}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor}`}></span>
                                <span className="font-mono tracking-tight shrink-0">{order.orderNumber}</span>
                                <span className="truncate flex-1">({veh?.name || 'مجهول'})</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Legend Summary Indicators */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-500">مفتاح الأولويات:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shrink-0"></span>
                    <span className="font-bold text-slate-650 dark:text-slate-400">طارئ وخطير جداً (High)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shrink-0"></span>
                    <span className="font-bold text-slate-650 dark:text-slate-400">متوسط الاستعجال (Medium)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block shrink-0"></span>
                    <span className="font-bold text-slate-650 dark:text-slate-400">منخفض عادي (Low)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-500">أيام الشهر الملونة:</span>
                  <span className="font-medium bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">أيام الشهر الحالي</span>
                  <span className="font-medium opacity-50 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-200 text-slate-600 dark:text-slate-450">أيام الأشهر الأخرى</span>
                </div>
              </div>
            </div>
          )}

        </div>

      {/* AUTOMATED WORKFLOW MODAL: SPARE PARTS INVENTORY UPDATER ON COMPLETION */}
      <AnimatePresence>
        {isInventoryPromptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsInventoryPromptOpen(false);
                setPromptOrderId(null);
              }} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" 
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white dark:bg-slate-850 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-10"
              dir="rtl"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-150 dark:border-slate-800 bg-amber-500/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Package size={18} className="animate-bounce" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">تحديث رصيد قطع الغيار المستخدمة</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">تم إكمال العمل بنجاح. يرجى تدوين وخصم القطع المستهلكة من المخازن.</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsInventoryPromptOpen(false);
                    setPromptOrderId(null);
                  }} 
                  className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleDeductInventorySubmit} className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                {selectedPartsToDeduct.map((row, idx) => (
                  <div key={idx} className="flex gap-2 items-end border-b border-dashed border-slate-100 dark:border-slate-800 pb-3" id={`deduct-row-${idx}`}>
                    
                    {/* Part Selector */}
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">اسم قطعة الغيار:</label>
                      <select
                        value={row.partId}
                        onChange={(e) => {
                          const copy = [...selectedPartsToDeduct];
                          copy[idx].partId = e.target.value;
                          setSelectedPartsToDeduct(copy);
                        }}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-705 rounded-xl text-xs"
                      >
                        <option value="">اختر القطعة...</option>
                        {localInventory.map(part => (
                          <option key={part.id} value={part.id}>{part.name} (متوفر {part.quantity} قطعة)</option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity Selector */}
                    <div className="w-24 space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">الكمية المستهلكة:</label>
                      <input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) => {
                          const copy = [...selectedPartsToDeduct];
                          copy[idx].quantity = parseInt(e.target.value) || 1;
                          setSelectedPartsToDeduct(copy);
                        }}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-705 rounded-xl text-xs text-center font-mono"
                      />
                    </div>

                    {/* Remove row button */}
                    {selectedPartsToDeduct.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPartsToDeduct(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl mb-0.5 cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                ))}

                {/* Add new deduction row */}
                <button
                  type="button"
                  onClick={() => setSelectedPartsToDeduct(prev => [...prev, { partId: '', quantity: 1 }])}
                  className="w-full py-2 border border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-blue-400 dark:hover:border-brand-blue-500 rounded-xl text-xs text-slate-500 hover:text-brand-blue-500 transition-all font-bold cursor-pointer"
                >
                  + إضافة قطعة أخرى مستهلكة
                </button>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInventoryPromptOpen(false);
                      setPromptOrderId(null);
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-bold"
                  >
                    تجاوز بدون خصم قطع الغيار
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                  >
                    تأكيد الخصم الإجباري والصرف
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION MODAL: DELETE MAINTENANCE RECORD */}
      <AnimatePresence>
        {orderIdToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setOrderIdToDelete(null)} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" 
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white dark:bg-slate-850 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[101]"
              dir="rtl"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-150 dark:border-slate-800 bg-rose-500/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} className="animate-pulse" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-black text-rose-700 dark:text-rose-400">
                      {language === 'en' ? 'Confirm Deleting Maintenance Record' : 'تأكيد حذف وتفكيك أمر الصيانة'}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {language === 'en' ? 'Prevent accidental data loss' : 'إجراء إداري هام وحساس للغاية'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setOrderIdToDelete(null)} 
                  className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 text-right">
                <p className="text-xs text-slate-605 dark:text-slate-350 leading-relaxed font-bold">
                  {language === 'en' 
                    ? 'Are you sure you want to completely dismantle and delete this maintenance order?' 
                    : 'هل أنت متأكد تماماً من رغبتك في تفكيك وحذف أمر الصيانة هذا نهائياً من النظام؟'
                  }
                </p>
                
                <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/10 rounded-2xl border border-rose-100 dark:border-rose-900/40 text-[11px] text-rose-600 dark:text-rose-400 leading-relaxed font-medium">
                  <strong>⚠️ {language === 'en' ? 'System warnings:' : 'تنبيهات النظام:'}</strong>
                  <ul className="list-disc list-inside mt-1.5 space-y-1">
                    <li>{language === 'en' ? 'The vehicle condition status will be reset back to active.' : 'سيتم إعادة تعيين حالة المركبة المرتبطة تلقائياً لتصبح نشطة.'}</li>
                    <li>{language === 'en' ? 'Technicians schedule load and workshop slots will be freed.' : 'سيتم تفريغ جداول الفنيين وإلغاء حجز فجوة الصيانة بالورشة.'}</li>
                    <li>{language === 'en' ? 'This action is permanent and cannot be undone.' : 'هذا الإجراء نهائي ولا يمكن استرجاع هذه البيانات في المستقبل.'}</li>
                  </ul>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setOrderIdToDelete(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black cursor-pointer transition-colors"
                >
                  {language === 'en' ? 'Cancel' : 'تراجع وإلغاء'}
                </button>
                <button
                  type="button"
                  onClick={confirmRemoveOrder}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-600/10 hover:scale-[1.01] transition-all cursor-pointer"
                >
                  {language === 'en' ? 'Yes, Delete Record' : 'نعم، احذف وفكك البلاغ'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MODAL / DETAILS DRAWER: INTERACTIVE TIMELINE STEP CHECKLIST (The ultimate Project Milestone views) */}
      <AnimatePresence>
        {selectedOrder && (() => {
          const veh = localVehicles.find(v => v.id === selectedOrder.vehicleId);
          const tech = localTechnicians.find(t => t.id === selectedOrder.technicianId);
          const ws = localWorkshops.find(w => w.id === selectedOrder.workshopId);
          const archived = isOrderArchived(selectedOrder);
          const progress = selectedOrder.progress || 0;
          const milestones = selectedOrder.milestones && selectedOrder.milestones.length > 0 
            ? selectedOrder.milestones 
            : DEFAULT_MILESTONES;

          const moveStepUp = (currentIndex: number) => {
            if (currentIndex === 0) return;
            const updated = [...milestones];
            const temp = updated[currentIndex];
            updated[currentIndex] = updated[currentIndex - 1];
            updated[currentIndex - 1] = temp;
            handleUpdateMilestones(selectedOrder.id, updated);
          };

          const moveStepDown = (currentIndex: number) => {
            if (currentIndex === milestones.length - 1) return;
            const updated = [...milestones];
            const temp = updated[currentIndex];
            updated[currentIndex] = updated[currentIndex + 1];
            updated[currentIndex + 1] = temp;
            handleUpdateMilestones(selectedOrder.id, updated);
          };

          return (
            <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden" dir="rtl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 15 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.98, y: 15 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="flex-1 max-w-6xl w-full mx-auto bg-white dark:bg-slate-900 md:shadow-2xl md:my-5 md:rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
              >
                {/* Full-screen Workspace Clear Header */}
                <div className="px-6 py-5 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-905">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedOrder(null)} 
                      className="flex items-center gap-2 px-4 py-2 bg-brand-blue-50/80 hover:bg-brand-blue-100 text-brand-blue-600 dark:bg-brand-blue-500/15 dark:text-brand-blue-400 dark:hover:bg-brand-blue-500/25 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-xs border border-brand-blue-100/30"
                    >
                      <ArrowRight size={14} className="scale-x-[-1]" />
                      <span>عودة للوحة المشاريع والورش</span>
                    </button>
                    <div className="h-6 w-[1.5px] bg-slate-250 dark:bg-slate-850 block" />
                    <div>
                      <span className="text-[11px] font-black text-slate-400 block tracking-wide">المنسق الفني المستقل لمشروع الصيانة</span>
                      <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">{selectedOrder.orderNumber}</h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)} 
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-805 rounded-xl cursor-pointer transition-all"
                  >
                    <X size={22} />
                  </button>
                </div>

                {/* Content area: Two major columns for layout and readability */}
                <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
                  
                  {/* Archived status message */}
                  {archived && (
                    <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 p-4 rounded-2xl border border-violet-250/30 text-xs leading-normal font-black text-violet-600 dark:text-violet-400">
                      هذا المشروع تم إقفاله وإدراجه بالأرشيف لمرور أكثر من {getOrderAgeInYears(selectedOrder.date).toFixed(1)} سنة على تبييته في سجلات المنظومة.
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
                    
                    {/* RIGHT COLUMN: CORE MILESTONE PROCESSES (LG: Col 7) */}
                    <div className="lg:col-span-7 space-y-5">
                      
                      {/* Comprehensive progress bar tracker */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl space-y-3.5 border border-slate-150/65 dark:border-slate-800">
                        {(() => {
                          const progressVal = selectedOrder.progress || 0;
                          let colorClass = "from-rose-500 via-orange-500 to-amber-550"; // Late
                          let label = "⏳ قيد التشخيص البدائي وتحديد الأعطال الفنية في الورشة";
                          let textClass = "text-rose-600 dark:text-rose-455 text-[11px] md:text-xs";
                          let bgClass = "bg-rose-500/10";
                          if (progressVal === 100) {
                            colorClass = "from-emerald-500 to-teal-400"; // Completed
                            label = "✨ مكتمل ومفحوص بالكامل (جاهز للاستلام والتسليم الفوري)";
                            textClass = "text-emerald-600 dark:text-emerald-400 text-[11px] md:text-xs";
                            bgClass = "bg-emerald-500/10";
                          } else if (progressVal >= 35) {
                            colorClass = "from-amber-400 via-brand-blue-500 to-indigo-500"; // Good
                            label = "⚡ جاري العمل الفني والمهني (في خط سير مناسب ومتابع)";
                            textClass = "text-brand-blue-600 dark:text-brand-blue-400 text-[11px] md:text-xs";
                            bgClass = "bg-brand-blue-500/10";
                          }
                          return (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-500">منظومة تعقب نسبة الإنجاز:</span>
                                <span className="font-mono text-sm md:text-base font-black text-brand-blue-600 dark:text-brand-blue-400">{progressVal}%</span>
                              </div>
                              {/* Visual Progress bar */}
                              <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden block relative shadow-inner">
                                <div className={`bg-gradient-to-l ${colorClass} h-full rounded-full transition-all duration-300`} style={{ width: `${progressVal}%` }} />
                              </div>
                              <div className={`px-4 py-2 rounded-xl font-bold ${textClass} ${bgClass} text-center flex items-center justify-center gap-2 shadow-xs`}>
                                {label}
                              </div>
                            </div>
                          );
                        })()}
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>تاريخ البداية: {selectedOrder.date}</span>
                          <span>آخر تحديث للحالة: {selectedOrder.lastUpdate || SYSTEM_ANCHOR_DATE}</span>
                        </div>
                      </div>

                      {/* Steps & Milestones View list */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                          <span className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <span className="w-2 h-4 bg-brand-blue-500 rounded-full"></span>
                            <span>مسار المشروع وخطوات العمل:</span>
                          </span>
                          
                          {user.role !== 'viewer' && (
                            <button
                              type="button"
                              disabled={isGeneratingSteps}
                              onClick={async () => {
                                setIsGeneratingSteps(true);
                                try {
                                  const generated = await generateAIPERepairSteps(selectedOrder.category, selectedOrder.description);
                                  handleUpdateMilestones(selectedOrder.id, generated.map(st => ({ title: st, checked: false })));
                                } catch (e) {
                                  alert("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي لإعادة التخطيط.");
                                } finally {
                                  setIsGeneratingSteps(false);
                                }
                              }}
                              className="text-[11px] font-black text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1.5 cursor-pointer bg-amber-500/10 px-3 py-1.5 rounded-xl transition-all hover:scale-[1.02] border border-amber-550/20"
                            >
                              {isGeneratingSteps ? "⏳ جاري الكتابة..." : "🪄 صياغة بالذكاء الاصطناعي"}
                            </button>
                          )}
                        </div>

                        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                          {milestones.map((mst, idx) => {
                            const isBeingDragged = draggedIndex === idx;
                            const isDraggedOver = dragOverIndex === idx;

                            return (
                              <div 
                                key={idx}
                                draggable={user.role !== 'viewer'}
                                onDragStart={(e) => {
                                  if (user.role === 'viewer') return;
                                  setDraggedIndex(idx);
                                  e.dataTransfer.effectAllowed = 'move';
                                }}
                                onDragOver={(e) => {
                                  if (user.role === 'viewer') return;
                                  e.preventDefault();
                                  if (draggedIndex !== null && draggedIndex !== idx) {
                                    setDragOverIndex(idx);
                                  }
                                }}
                                onDragEnter={(e) => {
                                  if (user.role === 'viewer') return;
                                  e.preventDefault();
                                }}
                                onDragLeave={() => {
                                  setDragOverIndex(null);
                                }}
                                onDragEnd={() => {
                                  setDraggedIndex(null);
                                  setDragOverIndex(null);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  if (user.role === 'viewer') return;
                                  if (draggedIndex === null || draggedIndex === idx) return;
                                  
                                  const updated = [...milestones];
                                  const itemToMove = updated[draggedIndex];
                                  updated.splice(draggedIndex, 1);
                                  updated.splice(idx, 0, itemToMove);
                                  
                                  handleUpdateMilestones(selectedOrder.id, updated);
                                  setDraggedIndex(null);
                                  setDragOverIndex(null);
                                }}
                                className={`bg-white dark:bg-slate-800 border rounded-2xl p-4 flex items-center justify-between gap-3 text-xs font-black transition-all shadow-sm ${
                                  isBeingDragged 
                                    ? 'opacity-30 border-dashed border-indigo-400 dark:border-indigo-600 bg-slate-50 dark:bg-slate-900/45 scale-95' 
                                    : isDraggedOver
                                      ? 'border-brand-blue-400 dark:border-brand-blue-500 bg-brand-blue-50/10 dark:bg-brand-blue-950/20 scale-[1.01]' 
                                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-350 dark:hover:border-slate-600'
                                }`}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {/* Drag / Sorting controls first on the right in Arabic right-to-left layout */}
                                  {user.role !== 'viewer' && (
                                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                                      {/* Up/Down buttons for mobile view / tactile click sorting */}
                                      <div className="flex flex-col items-center justify-center -space-y-1">
                                        <button
                                          type="button"
                                          disabled={idx === 0}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            moveStepUp(idx);
                                          }}
                                          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-20 disabled:hover:text-slate-450 p-0.5 rounded transition-transform active:scale-75 cursor-pointer"
                                          title="تحريك لأعلى"
                                        >
                                          <ChevronUp size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={idx === milestones.length - 1}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            moveStepDown(idx);
                                          }}
                                          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-20 disabled:hover:text-slate-450 p-0.5 rounded transition-transform active:scale-75 cursor-pointer"
                                          title="تحريك لأسفل"
                                        >
                                          <ChevronDown size={14} />
                                        </button>
                                      </div>
                                      
                                      {/* Grip drag handle icon for desktops */}
                                      <div 
                                        className="text-slate-350 dark:text-slate-600 hover:text-indigo-500 p-1 rounded-lg cursor-grab active:cursor-grabbing transition-colors hidden sm:block"
                                        title="اسحب لمبادلة خطوات الصيانة"
                                      >
                                        <GripVertical size={15} />
                                      </div>
                                    </div>
                                  )}

                                  {/* Toggle checkbox */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (user.role === 'viewer') return;
                                      handleToggleMilestone(selectedOrder.id, idx);
                                    }}
                                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                                      mst.checked 
                                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                                        : 'border-slate-350 dark:border-slate-500 hover:border-emerald-500'
                                    }`}
                                  >
                                    {mst.checked && <Check size={14} strokeWidth={3} />}
                                  </button>
                                  
                                  {/* Interactive Step Title */}
                                  <input 
                                    type="text"
                                    value={mst.title}
                                    disabled={user.role === 'viewer'}
                                    onChange={(e) => {
                                      const updated = [...milestones];
                                      updated[idx].title = e.target.value;
                                      handleUpdateMilestones(selectedOrder.id, updated);
                                    }}
                                    className={`flex-1 text-xs font-bold bg-transparent border-none p-0 focus:ring-0 text-slate-800 dark:text-slate-100 outline-none ${
                                      mst.checked ? 'line-through opacity-50 text-emerald-800 dark:text-emerald-500' : ''
                                    }`}
                                  />
                                </div>

                                {/* Delete step */}
                                {user.role !== 'viewer' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = milestones.filter((_, i) => i !== idx);
                                      handleUpdateMilestones(selectedOrder.id, updated);
                                    }}
                                    className="text-rose-500 hover:text-rose-600 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg shrink-0 font-bold transition-all"
                                    title="حذف هذه الخطوة"
                                  >
                                    <X size={15} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Add manual milestone step */}
                        {user.role !== 'viewer' && (
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="+ إضافة خطوة عمل جديدة يدويًا..."
                              value={newMilestoneText[selectedOrder.id] || ''}
                              onChange={(e) => setNewMilestoneText(prev => ({ ...prev, [selectedOrder.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const text = newMilestoneText[selectedOrder.id] || '';
                                  if (!text.trim()) return;
                                  const updated = [...milestones, { title: text.trim(), checked: false }];
                                  handleUpdateMilestones(selectedOrder.id, updated);
                                  setNewMilestoneText(prev => ({ ...prev, [selectedOrder.id]: '' }));
                                }
                              }}
                              className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const text = newMilestoneText[selectedOrder.id] || '';
                                if (!text.trim()) return;
                                const updated = [...milestones, { title: text.trim(), checked: false }];
                                handleUpdateMilestones(selectedOrder.id, updated);
                                setNewMilestoneText(prev => ({ ...prev, [selectedOrder.id]: '' }));
                              }}
                              className="px-4 py-2.5 bg-brand-blue-600 hover:bg-brand-blue-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                            >
                              إضافة
                            </button>
                          </div>
                        )}

                      </div>

                      {/* Integrated Technician Voice Notes with Mic / Realtime update */}
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-150/65 dark:border-slate-800 space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="min-w-[10px] h-6 bg-indigo-500 rounded-full"></div>
                          <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
                            تقرير الصيانة الفنية الصوتي الفوري (STT)
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-400 block leading-tight">
                          هذا الحقل للتقرير الفني يسمح للفنيين بتسجيل ملاحظاتهم صوتياً عبر الميكروفون وتحويلها إلى نص تلقائياً لتسهيل الأعمال وتوثيق دورة الصيانة بدقة.
                        </p>
                        <VoiceNoteField
                          disabled={user.role === 'viewer'}
                          value={selectedOrder.techNotes || ''}
                          onChange={(val) => {
                            setOrders(prev => prev.map(o => {
                              if (o.id === selectedOrder.id) {
                                const updated = { ...o, techNotes: val, lastUpdate: SYSTEM_ANCHOR_DATE };
                                setSelectedOrder(updated);
                                return updated;
                              }
                              return o;
                            }));
                          }}
                          label=""
                          placeholder="تكلم أو اكتب هنا التقرير التشخيصي الفني لإنهاء دورة التوثيق..."
                        />
                        {selectedOrder.techNotes && (
                          <div className="flex items-center gap-1 text-[9px] text-emerald-650 dark:text-emerald-400 font-bold justify-end">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                            <span>تم حفظ التقرير تلقائياً وتحديث سجل الصيانة للآلية</span>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* LEFT COLUMN: VEHICLE & TECH & DETAILS (LG: Col 5) */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-6">

                      {/* Workshop & Tech Summary */}
                      <div className="space-y-2">
                        <span className="text-xs font-black text-slate-500 block">الفني والورشة الحاضنة للمشروع:</span>
                        <div className="space-y-2.5">
                          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center gap-3 shadow-xs">
                            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
                              <Building2 size={18} />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-bold block">الورشة الحاضنة للصيانة:</span>
                              <h4 className="text-sm font-black text-slate-905 dark:text-white leading-none mt-1">{ws?.name || 'ميداني خارجي'}</h4>
                              <span className="text-[10px] text-slate-405 block mt-1">{ws?.location || 'الطوارئ والعمل الدوار'}</span>
                            </div>
                          </div>

                          {tech ? (
                            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-center justify-between shadow-xs">
                              <div className="flex items-center gap-3">
                                <img src={tech.avatar} alt="tech" className="w-8 h-8 rounded-xl shrink-0 object-cover" />
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold block">الفني الجدير بالمسؤولية:</span>
                                  <h4 className="text-sm font-black text-slate-905 dark:text-white leading-none mt-1">{tech.name}</h4>
                                  <span className="text-[10px] text-slate-405 block mt-1">{tech.role} • تواصل {tech.phone}</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-black text-amber-500 bg-amber-50 dark:bg-amber-550/10 px-2.5 py-1 rounded-full shrink-0">
                                نشط ({tech.activeTasks} مهام)
                              </span>
                            </div>
                          ) : (
                            <div className="p-4 bg-slate-50 dark:bg-slate-905 rounded-2xl text-center text-xs text-slate-405 font-bold border border-dashed border-slate-200 dark:border-slate-800/85">
                              لا يوجد فني مكلف حتى الآن. يمكنك تعيين فني لقيادة الورشة والعمل.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* External Workshop Invoice & Financial Tracking Panel */}
                      {ws?.isExternal && (
                        <div className="p-4 bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 dark:border-purple-500/15 rounded-2xl space-y-3 border-dashed">
                          <div className="flex items-center justify-between border-b border-purple-500/10 pb-2">
                            <span className="text-xs font-black text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                              <span>📋</span>
                              <span>بيانات الصيانة الخارجية والمالية</span>
                            </span>
                            <span className="text-[9px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-black">
                              ورشة صيانة خارجية
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {/* Invoice Number */}
                            <div className="space-y-1 text-right">
                              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">رقم الفاتورة الخارجية:</label>
                              <input
                                type="text"
                                value={selectedOrder.externalInvoiceNo || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setOrders(prev => prev.map(o => {
                                    if (o.id === selectedOrder.id) {
                                      const updated = { ...o, externalInvoiceNo: val, lastUpdate: SYSTEM_ANCHOR_DATE };
                                      setSelectedOrder(updated);
                                      return updated;
                                    }
                                    return o;
                                  }));
                                }}
                                placeholder="مثال: INV-2026-08"
                                className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl font-mono text-right outline-none focus:border-purple-500/50"
                              />
                            </div>

                            {/* Invoice Cost */}
                            <div className="space-y-1 text-right">
                              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">التكلفة الفعلية (ر.س):</label>
                              <input
                                type="number"
                                value={selectedOrder.cost || ''}
                                onChange={(e) => {
                                  const val = e.target.value ? parseFloat(e.target.value) : undefined;
                                  setOrders(prev => prev.map(o => {
                                    if (o.id === selectedOrder.id) {
                                      const updated = { ...o, cost: val, lastUpdate: SYSTEM_ANCHOR_DATE };
                                      setSelectedOrder(updated);
                                      return updated;
                                    }
                                    return o;
                                  }));
                                }}
                                placeholder="مثال: 4500"
                                className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl font-mono text-right outline-none focus:border-purple-500/50"
                              />
                            </div>
                          </div>

                          {/* Invoice Status Selector */}
                          <div className="space-y-1 text-right">
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">حالة التسوية والفوترة:</label>
                            <select
                              value={selectedOrder.externalInvoiceStatus || 'pending_invoice'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setOrders(prev => prev.map(o => {
                                  if (o.id === selectedOrder.id) {
                                    const updated = { ...o, externalInvoiceStatus: val as any, lastUpdate: SYSTEM_ANCHOR_DATE };
                                    setSelectedOrder(updated);
                                    return updated;
                                  }
                                  return o;
                                }));
                              }}
                              className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl font-bold cursor-pointer outline-none focus:border-purple-500/50 text-slate-900 dark:text-white"
                            >
                              <option value="pending_invoice">⏳ بانتظار إصدار الفاتورة من الورشة</option>
                              <option value="received_unpaid">💵 تم استلام الفاتورة - بانتظار السداد</option>
                              <option value="paid">✅ تم السداد المالي بالكامل وإغلاق القيد</option>
                            </select>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="p-4 bg-slate-50 dark:bg-slate-905 border border-slate-150 dark:border-slate-850 rounded-2xl text-right">
                          <span className="text-[10px] text-slate-400 font-bold block pb-1">مجموع التكاليف المقدرة:</span>
                          <span className="text-sm md:text-base font-black text-slate-900 dark:text-white block font-mono">
                            {selectedOrder.cost ? `${selectedOrder.cost.toLocaleString()} ر.س` : 'معلقة للتقدير المالي'}
                          </span>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-905 border border-slate-150 dark:border-slate-850 rounded-2xl text-right">
                          <span className="text-[10px] text-slate-400 block pb-1 font-bold">قطع الغيار المقيدة بالصرف:</span>
                          <span className="text-xs font-black text-slate-705 dark:text-slate-300 block truncate leading-relaxed">
                            {selectedOrder.partsUsed && selectedOrder.partsUsed.length > 0
                              ? selectedOrder.partsUsed.join(' • ')
                              : 'لم تصرف قطع مسجلة'}
                          </span>
                        </div>
                      </div>

                      {/* --- START OF 4 SMART MECHANIC ADDITIONS --- */}
                      <div className="border-t border-slate-150 dark:border-slate-800/80 pt-5 space-y-4 text-right" dir="rtl">
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 block flex items-center gap-1">
                          <Wrench size={14} />
                          <span>{language === 'ar' ? 'التحديثات والمميزات الـ 4 المتقدمة للفني والورشة:' : '4 Advanced Technician & Workshop Additions:'}</span>
                        </span>

                        {/* POINT 1: Detailed Technical Notes with Auto-Save */}
                        <div className="space-y-1 bg-white dark:bg-[#121829]/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-black text-slate-450 block">
                            {language === 'ar' ? '✍️ ملاحظات وتقرير الفني التفصيلي (حفظ تلقائي):' : '✍️ Detailed Tech Notes (Auto-save):'}
                          </span>
                          <textarea
                            value={selectedOrder.techNotes || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOrders(prev => prev.map(o => {
                                if (o.id === selectedOrder.id) {
                                  const updated = { ...o, techNotes: val, lastUpdate: SYSTEM_ANCHOR_DATE };
                                  setSelectedOrder(updated);
                                  return updated;
                                }
                                return o;
                              }));
                            }}
                            placeholder={language === 'ar' ? 'اكتب ملاحظات الفحص، الأجزاء المفكوكة، حالة الإصلاح، أو تفاصيل الأعطال التفصيلية هنا...' : 'Write inspection details, disassembled parts, repair state, or detailed fault notes here...'}
                            className="w-full p-2 text-[11px] font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-indigo-500/50 text-slate-700 dark:text-slate-300"
                            rows={2}
                          />
                        </div>

                        {/* POINT 2: Field Fault and Inspection Photo Upload (Drag & Drop or Click) */}
                        <div className="space-y-1.5 bg-white dark:bg-[#121829]/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-black text-slate-450 block flex items-center gap-1">
                            <Camera size={13} className="text-indigo-500" />
                            <span>{language === 'ar' ? '📸 صور معاينة الأعطال والموقع الميداني (سحب وإفلات أو نقر):' : '📸 Field Fault & Inspection Photos (Drag & Drop or Click):'}</span>
                          </span>
                          
                          <div 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const file = e.dataTransfer.files?.[0];
                              if (file && file.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  const val = reader.result as string;
                                  setOrders(prev => prev.map(o => {
                                    if (o.id === selectedOrder.id) {
                                      const updated = { ...o, photoUrl: val, lastUpdate: SYSTEM_ANCHOR_DATE };
                                      setSelectedOrder(updated);
                                      return updated;
                                    }
                                    return o;
                                  }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="border border-dashed border-slate-205 dark:border-slate-800 hover:border-indigo-500 rounded-xl p-3 text-center transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-950/20 relative"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    const val = reader.result as string;
                                    setOrders(prev => prev.map(o => {
                                      if (o.id === selectedOrder.id) {
                                        const updated = { ...o, photoUrl: val, lastUpdate: SYSTEM_ANCHOR_DATE };
                                        setSelectedOrder(updated);
                                        return updated;
                                      }
                                      return o;
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}
                          >
                            {selectedOrder.photoUrl ? (
                              <div className="space-y-2">
                                <img src={selectedOrder.photoUrl} alt="Inspection preview" className="max-h-28 mx-auto rounded-lg border border-slate-200 dark:border-slate-850 shadow-xs" referrerPolicy="no-referrer" />
                                <div className="flex items-center justify-center gap-2">
                                  <span className="text-[9px] text-slate-400 font-bold">{language === 'ar' ? 'تم تحميل الصورة بنجاح' : 'Image loaded successfully'}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOrders(prev => prev.map(o => {
                                        if (o.id === selectedOrder.id) {
                                          const updated = { ...o, photoUrl: undefined, lastUpdate: SYSTEM_ANCHOR_DATE };
                                          setSelectedOrder(updated);
                                          return updated;
                                        }
                                        return o;
                                      }));
                                    }}
                                    className="text-rose-500 hover:text-rose-600 font-black text-[9px] px-2 py-0.5 bg-rose-50 dark:bg-rose-950/40 rounded-md border border-rose-100 dark:border-rose-900/30"
                                  >
                                    {language === 'ar' ? 'حذف الصورة' : 'Delete Photo'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="py-2 space-y-1">
                                <UploadCloud size={18} className="mx-auto text-slate-400 animate-bounce" />
                                <p className="text-[10px] font-black text-slate-600 dark:text-slate-350">{language === 'ar' ? 'اسحب وأفلت صورة المعاينة هنا، أو انقر للتصفح' : 'Drag & drop inspection photo here, or click to browse'}</p>
                                <p className="text-[8px] text-slate-400 font-bold">{language === 'ar' ? 'يدعم صيغ الصور (PNG, JPG)' : 'Supports images (PNG, JPG)'}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* POINT 3: Direct Inline Part Request & Dispatch */}
                        <div className="space-y-1.5 bg-white dark:bg-[#121829]/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-black text-slate-450 block flex items-center gap-1">
                            <Package size={13} className="text-emerald-500" />
                            <span>{language === 'ar' ? '⚙️ طلب وصرف قطع غيار مباشر لهذه المهمة (خصم فوري):' : '⚙️ Direct Spare Parts Dispatch (Instant Stock Deduction):'}</span>
                          </span>

                          {selectedOrder.partsUsed && selectedOrder.partsUsed.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {selectedOrder.partsUsed.map((partName, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                                  <span>{partName}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedParts = (selectedOrder.partsUsed || []).filter((_, pIdx) => pIdx !== idx);
                                      setOrders(prev => prev.map(o => {
                                        if (o.id === selectedOrder.id) {
                                          const updated = { ...o, partsUsed: updatedParts, lastUpdate: SYSTEM_ANCHOR_DATE };
                                          setSelectedOrder(updated);
                                          return updated;
                                        }
                                        return o;
                                      }));
                                    }}
                                    className="text-emerald-700 hover:text-rose-500 font-bold ml-1 text-xs"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[9px] text-slate-400 font-bold mb-2">{language === 'ar' ? 'لم يتم صرف قطع غيار مسجلة للمهمة بعد.' : 'No registered parts issued yet.'}</p>
                          )}

                          <select
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) {
                                const item = localInventory.find(i => i.id === val);
                                if (item) {
                                  if (item.quantity <= 0) {
                                    alert(language === 'ar' ? 'عذراً، هذه القطعة غير متوفرة في المستودع حالياً!' : 'Sorry, this part is currently out of stock!');
                                    return;
                                  }
                                  const currentParts = selectedOrder.partsUsed || [];
                                  if (currentParts.includes(`${item.name} (${item.partNumber})`)) {
                                    alert(language === 'ar' ? 'هذه القطعة مضافة بالفعل!' : 'This part is already added!');
                                    return;
                                  }
                                  const updatedParts = [...currentParts, `${item.name} (${item.partNumber})`];
                                  
                                  setOrders(prev => prev.map(o => {
                                    if (o.id === selectedOrder.id) {
                                      const updated = { ...o, partsUsed: updatedParts, lastUpdate: SYSTEM_ANCHOR_DATE };
                                      setSelectedOrder(updated);
                                      return updated;
                                    }
                                    return o;
                                  }));

                                  setLocalInventory(prev => prev.map(invItem => {
                                    if (invItem.id === item.id) {
                                      return { ...invItem, quantity: Math.max(0, invItem.quantity - 1) };
                                    }
                                    return invItem;
                                  }));
                                }
                              }
                            }}
                            className="w-full text-[10px] font-bold p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg outline-none text-slate-700 dark:text-slate-350 cursor-pointer"
                          >
                            <option value="">{language === 'ar' ? '-- اختر قطعة من المستودع لصرفها فوراً للورشة --' : '-- Choose a part from inventory to issue instantly --'}</option>
                            {localInventory.map(item => (
                              <option key={item.id} value={item.id} disabled={item.quantity <= 0}>
                                {item.name} ({item.partNumber}) - {language === 'ar' ? 'متوفر' : 'Stock'}: {item.quantity} {item.quantity <= 0 ? '❌' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* POINT 4: Vehicle Historical Maintenance Logs */}
                        <div className="space-y-1.5 bg-white dark:bg-[#121829]/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-black text-slate-450 block flex items-center gap-1">
                            <History size={13} className="text-blue-500" />
                            <span>{language === 'ar' ? '📋 سجل صيانة المركبة التاريخي وسوابق الأعطال:' : '📋 Vehicle Historical Maintenance & Defect Logs:'}</span>
                          </span>

                          {(() => {
                            const previousOrders = orders.filter(o => o.vehicleId === selectedOrder.vehicleId && o.id !== selectedOrder.id);
                            const mockHistories = [
                              { id: 'h1', date: '2026-04-12', desc: language === 'ar' ? 'فحص دوري واستبدال زيت المحرك والفلتر التصفوي' : 'Periodic inspection and replacement of engine oil and filter', tech: 'م. خالد الحربي', status: 'completed' },
                              { id: 'h2', date: '2026-05-18', desc: language === 'ar' ? 'معايرة ضغط الفرامل الهيدروليكية الأمامية' : 'Calibration of front hydraulic brake pressure', tech: 'م. أحمد الرشيد', status: 'completed' }
                            ];

                            const displayHistory = previousOrders.length > 0 
                              ? previousOrders.map(po => ({
                                  id: po.id,
                                  date: po.date,
                                  desc: po.description,
                                  tech: po.technicianId === '201' ? 'الفني أحمد حميد' : 'فني الورشة ب',
                                  status: po.status
                                }))
                              : mockHistories;

                            return (
                              <div className="space-y-1 max-h-32 overflow-y-auto divide-y divide-slate-150 dark:divide-slate-800/40 text-right">
                                {displayHistory.map((hist) => (
                                  <div key={hist.id} className="py-1.5 first:pt-0 last:pb-0 text-[10px] flex items-start justify-between gap-2">
                                    <div className="space-y-0.5">
                                      <span className="font-bold text-slate-700 dark:text-slate-300 block">{hist.desc}</span>
                                      <div className="flex items-center gap-2 text-[8px] text-slate-400 font-bold">
                                        <span>📅 {hist.date}</span>
                                        <span>•</span>
                                        <span>👤 {hist.tech}</span>
                                      </div>
                                    </div>
                                    <span className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-black shrink-0">
                                      {language === 'ar' ? 'مكتمل' : 'Completed'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      {/* --- END OF 4 SMART MECHANIC ADDITIONS --- */}

                      {/* Digital Safety Inspection Checklist & Verification */}
                      <div className="space-y-3.5 border-t border-slate-150 dark:border-slate-800/80 pt-5">
                        <span className="text-xs font-black text-slate-500 block">🛡️ رقابة وتأكيد الأمان والسلامة والجودة الرقمية:</span>
                        <DigitalSafetyInspection 
                          order={selectedOrder} 
                          vehicle={veh} 
                          user={user} 
                          language={language === 'en' ? 'en' : 'ar'} 
                        />
                      </div>

                      {/* Technical Inspection Component Checklist with status سليم/يحتاج صيانة/مستبدل and photos */}
                      <div className="space-y-3.5 border-t border-slate-150 dark:border-slate-800/80 pt-5">
                        <TechnicalInspectionChecklist
                          order={selectedOrder}
                          vehicle={veh}
                          user={user}
                          language={language === 'en' ? 'en' : 'ar'}
                        />
                      </div>

                      {user.role !== 'viewer' && (
                        <div className="border-t border-slate-150 dark:border-slate-800 pt-5 space-y-3">
                          <span className="text-xs font-black text-slate-405 block">صلاحيات التحكم الإدارية الفورية:</span>
                          
                          <div className="flex gap-2.5">
                            {archived ? (
                              user.role === 'admin' ? (
                                <button
                                  type="button"
                                  onClick={() => restoreOrderFromArchive(selectedOrder.id)}
                                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.01]"
                                >
                                  <RotateCcw size={15} />
                                  <span>استرجاع وإلغاء الأرشفة الفوري</span>
                                </button>
                              ) : (
                                <div className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 text-center text-[10px] font-bold rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                  خيار استرجاع الأرشيف مخصص لمدير قسم الصيانة والإدارة العليا فقط.
                                </div>
                              )
                            ) : (
                              <>
                                {selectedOrder.status !== 'completed' ? (
                                  <button
                                    type="button"
                                    onClick={() => moveOrderKanbanStatus(selectedOrder.id, 'completed')}
                                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.01]"
                                  >
                                    <CheckCircle2 size={15} />
                                    <span>إكمال وإغلاق المشروع</span>
                                  </button>
                                ) : (
                                  <div className="flex-1 flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleQuickArchiveOrder(selectedOrder.id);
                                        setSelectedOrder(null);
                                      }}
                                      className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.01]"
                                    >
                                      <Archive size={15} />
                                      <span>أرشفة سريعة للمهمة المنتهية</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveOrderKanbanStatus(selectedOrder.id, 'in-progress')}
                                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                                    >
                                      إعادة تنشيط
                                    </button>
                                  </div>
                                )}

                                {hasGranularPermission('delete-maintenance-record', user.role) && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOrder(selectedOrder.id)}
                                    className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 text-xs font-black rounded-xl cursor-pointer"
                                  >
                                    تفكيك وإزالة
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                    </div>

                  </div>

                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>


    </div>
  );
}

// Sub Component: ProjectCard inside Kanban Columns (Gantt-like manager card style)
interface ProjectCardProps {
  key?: any;
  order: MaintenanceOrder;
  vehicles: Vehicle[];
  technicians: Technician[];
  workshops: any[];
  allOrders?: MaintenanceOrder[];
  onClick: () => void;
  onMove: (next: 'pending' | 'in-progress' | 'completed') => void;
  onArchive?: (orderId: string) => void;
}

const SparklineTrend = ({ data }: { data: number[] }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const width = 80;
  const height = 18;
  const padding = 2;
  
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const currentVal = data[data.length - 1];
  const firstVal = data[0];
  const isUp = currentVal > firstVal;
  const strokeColor = isUp ? '#ef4444' : '#10b981'; // Cost increase is red (rose), optimization is green
  const fillColor = isUp ? 'rgba(239, 68, 68, 0.04)' : 'rgba(16, 185, 129, 0.04)';

  const areaPoints = `${padding},${height} ${points} ${width - padding},${height}`;

  return (
    <div className="flex items-center gap-1.5" dir="ltr">
      <svg width={width} height={height} className="overflow-visible">
        <polygon points={areaPoints} fill={fillColor} />
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <circle cx={width - padding} cy={height - padding - ((currentVal - min) / range) * (height - padding * 2)} r="2" fill={strokeColor} />
      </svg>
      <div className="text-[8px] font-black font-sans leading-none flex flex-col items-start justify-center text-left">
        <span className={isUp ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
          {isUp ? '▲' : '▼'} {Math.round(((currentVal - firstVal) / (firstVal || 1)) * 100)}%
        </span>
        <span className="text-slate-400 dark:text-slate-450 mt-0.5 font-mono">{currentVal.toLocaleString()} ر.س</span>
      </div>
    </div>
  );
};

function ProjectCard({ order, vehicles, technicians, workshops, allOrders, onClick, onMove, onArchive }: ProjectCardProps) {
  const veh = vehicles.find(v => v.id === order.vehicleId);
  const tech = technicians.find(t => t.id === order.technicianId);
  const ws = workshops.find(w => w.id === order.workshopId);
  const progress = order.progress || 0;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -15 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      onClick={onClick}
      className="maintenance-card bg-white dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs hover:border-brand-blue-300 dark:hover:border-slate-700 hover:shadow-soft transition-all cursor-pointer group space-y-2.5 relative"
    >
      <div className="flex items-start justify-between gap-1.5">
        <div>
          <span className="text-[9px] font-black font-mono text-brand-blue-600">{order.orderNumber}</span>
          <h4 className="text-xs font-black text-slate-900 dark:text-white leading-none mt-0.5">{veh?.name}</h4>
          <span className="text-[9px] font-mono text-slate-450 block mt-1">{veh?.plateNumber}</span>
        </div>
        <PriorityBadge priority={order.priority} />
      </div>

      <p className="text-[10px] text-slate-500 font-bold dark:text-slate-400 line-clamp-2 leading-normal">
        {order.description}
      </p>

      {/* Sparkline Cost Trend Grid */}
      {(() => {
        const realCosts = (allOrders || [])
          .filter(o => o.vehicleId === order.vehicleId && o.cost !== undefined)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map(o => o.cost as number);

        let costHistory = realCosts;
        if (costHistory.length < 2) {
          const charSum = order.vehicleId.split('').reduce((sum, h) => sum + h.charCodeAt(0), 0) || 5;
          const baseSeed = (charSum % 5) * 200 + 400; 
          const step = 60 + (charSum % 3) * 30; 
          costHistory = [
            baseSeed,
            baseSeed + step * (charSum % 2 === 0 ? 1 : -1),
            baseSeed - Math.round(step / 2),
            order.cost || (baseSeed + Math.round(step * 1.2))
          ];
        }

        return (
          <div className="py-1.5 px-2 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100/50 dark:border-slate-800/40 flex items-center justify-between gap-1" dir="rtl">
            <span className="text-[8.5px] font-black text-slate-400 dark:text-slate-500 select-none">اتجاه تكاليف المركبة</span>
            <SparklineTrend data={costHistory} />
          </div>
        );
      })()}

      {/* Assigned Workshop & location mini indicator */}
      {ws && (
        <div className="flex items-center gap-1 text-[9px] font-medium text-slate-450 dark:text-slate-500 leading-none">
          <Building2 size={11} className="shrink-0" />
          <span className="truncate">{ws.name}</span>
        </div>
      )}

      {/* Visual progress bar representation */}
      {(() => {
        const progressValVal = order.progress || 0;
        let colorClass = "from-rose-500 via-orange-500 to-amber-550"; // Late
        let label = "متأخر / قيد البدء";
        let textClass = "text-rose-500 dark:text-rose-455";
        if (progressValVal === 100) {
          colorClass = "from-emerald-500 to-teal-400"; // Completed
          label = "مكتمل ومفحوص";
          textClass = "text-emerald-600 dark:text-emerald-400";
        } else if (progressValVal >= 35) {
          colorClass = "from-amber-400 via-brand-blue-500 to-indigo-505"; // Good
          label = "عمل جاري ومستمر";
          textClass = "text-brand-blue-600 dark:text-brand-blue-400";
        }
        return (
          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between text-[8px] font-black text-slate-400">
              <span className={`font-extrabold ${textClass}`}>{label}</span>
              <span className="font-mono">{progressValVal}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full overflow-hidden block">
              <div className={`bg-gradient-to-l ${colorClass} h-full rounded-full transition-all duration-300`} style={{ width: `${progressValVal}%` }} />
            </div>
          </div>
        );
      })()}

      <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/60 pt-2 pb-0.5 shrink-0">
        <div>
          {tech ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <img src={tech.avatar} alt="tech" className="w-4.5 h-4.5 rounded-full object-cover" />
              <span className="text-[8px] font-black text-slate-700 dark:text-slate-350">{tech.name}</span>
              {order.techNotes && (
                <span className="inline-flex items-center gap-0.5 text-[8px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-1.2 py-0.2 rounded border border-indigo-200/40" title="تتضمن تقريراً صوتياً للورشة">
                  <Mic size={8} />  
                  <span>تقرير صوتي</span>
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-slate-400 font-bold">غير مخصص فني</span>
              {order.techNotes && (
                <span className="inline-flex items-center gap-0.5 text-[8px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-1.2 py-0.2 rounded border border-indigo-200/40" title="تتضمن تقريراً صوتياً للورشة">
                  <Mic size={8} />  
                  <span>تقرير صوتي</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quick status change buttons inside card */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {order.status === 'pending' && (
            <button 
              onClick={() => onMove('in-progress')}
              className="text-[8px] font-black px-1.5 py-0.5 bg-brand-blue-50 hover:bg-brand-blue-105 text-brand-blue-600 rounded cursor-pointer"
            >
              مباشرة العمل ←
            </button>
          )}
          {order.status === 'in-progress' && (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => onMove('pending')}
                className="text-[8px] font-black px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded cursor-pointer"
              >
                تحديث
              </button>
              <button 
                onClick={() => onMove('completed')}
                className="text-[8px] font-black px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded cursor-pointer"
              >
                اعتماد الاستلام ✔
              </button>
            </div>
          )}
          {order.status === 'completed' && (
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-black border border-emerald-200/50 text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                جاهز بالخدمة ✔
              </span>
              {onArchive && (
                <button
                  type="button"
                  onClick={() => onArchive(order.id)}
                  className="text-[8px] font-black px-1.5 py-0.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/60 rounded border border-purple-200/60 dark:border-purple-800/60 cursor-pointer flex items-center gap-0.5 shadow-2xs"
                  title="أرشفة سريعة للمهمة المنتهية"
                >
                  <Archive size={8} />
                  <span>أرشفة</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
