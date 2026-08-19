import React, { useState, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Truck, 
  Calendar, 
  Tag, 
  MapPin,
  ChevronDown,
  Wrench,
  DollarSign,
  Upload,
  X,
  Sparkles,
  Info,
  Cpu,
  ShieldCheck,
  Weight,
  CircleDot,
  Check,
  Fuel,
  Image as ImageIcon,
  Car,
  Bus,
  Shield,
  Scan,
  QrCode,
  LayoutGrid,
  List,
  Trash2,
  AlertTriangle,
  Edit,
  Receipt,
  ClipboardCheck,
  FileText,
  Loader2,
  CheckSquare,
  Square,
  CheckCheck,
  MousePointerClick,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Edit3,
  RefreshCw,
  FileCheck,
  FileX
} from 'lucide-react';
import { vehicles as initialVehicles } from '../data';
import { VehicleStatus, Vehicle, User, hasGranularPermission } from '../types';
import VehicleHistory from './VehicleHistory';
import VehicleQrModal from './VehicleQrModal';
import { maintenanceOrders, technicians as initialTechnicians } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../services/LanguageContext';
import ContextualHelp from './ContextualHelp';
import { 
  downloadFleetAssetTemplate, 
  downloadFleetAssetCsvTemplate, 
  fileToBase64, 
  parseFleetFileClientSide,
  parseAndValidateCsvRows,
  revalidateRow,
  autoFixAllRows,
  ProcessedCsvRow
} from '../services/universalFileParser';

// Definitions for custom selectable icons for vehicles with matching eye-friendly colors
export const VEHICLE_ICONS: Record<string, { component: React.ComponentType<{ size?: number; className?: string }>; label: string; bg: string; text: string }> = {
  truck: { component: Truck, label: 'شاحنة نقل / نقل ثقيل', bg: 'bg-brand-blue-50 dark:bg-brand-blue-900/10', text: 'text-brand-blue-600 dark:text-brand-blue-400' },
  car: { component: Car, label: 'سيارة خفيفة / ملاكي', bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-450' },
  bus: { component: Bus, label: 'حافلة ركاب / نقل جماعي', bg: 'bg-sky-50 dark:bg-sky-950/20', text: 'text-sky-600 dark:text-sky-400' },
  wrench: { component: Wrench, label: 'مركبة خدمات / صيانة ورشية', bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-450' },
  shield: { component: Shield, label: 'أمن وطوارئ / رصد أمني', bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-600 dark:text-indigo-400' },
  cpu: { component: Cpu, label: 'آلية ذكية / معدة إلكترونية', bg: 'bg-violet-50 dark:bg-violet-950/20', text: 'text-violet-600 dark:text-violet-400' },
};

export const DOCUMENT_TYPES_METADATA: Record<string, {
  labelAr: string;
  labelEn: string;
  shortLabelAr: string;
  shortLabelEn: string;
  descriptionAr: string;
  descriptionEn: string;
  colorClass: string;
  bgClass: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = {
  spare_parts_invoice: {
    labelAr: 'فاتورة صيانة وشراء قطع غيار',
    labelEn: 'Spare Parts & Maintenance Invoice',
    shortLabelAr: 'فاتورة شراء',
    shortLabelEn: 'Invoice',
    descriptionAr: 'مستند مالي للموردين لشراء قطع الغيار والقطع الاستهلاكية لربطها بجدول النفقات.',
    descriptionEn: 'Financial supplier invoice for parts and consumable purchases integrated with expenses.',
    colorClass: 'text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/5',
    bgClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    icon: Receipt
  },
  periodic_inspection: {
    labelAr: 'تقرير فحص دوري سنوي / فني',
    labelEn: 'Periodic Annual / Technical Inspection',
    shortLabelAr: 'تقرير فحص',
    shortLabelEn: 'Inspection',
    descriptionAr: 'تقرير فحص سلامة وتدقيق فني شامل للمركبة دون فواتير مالية أو تكاليف مباشرة.',
    descriptionEn: 'Technical safety audit and comprehensive vehicle diagnostics with zero direct expenses.',
    colorClass: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    bgClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    icon: ClipboardCheck
  },
  external_workshop_receipt: {
    labelAr: 'إيصال صيانة ورشة خارجية',
    labelEn: 'External Workshop Repair Receipt',
    shortLabelAr: 'إيصال ورشة',
    shortLabelEn: 'Receipt',
    descriptionAr: 'إيصال ورشة خارجية للأعمال الميكانيكية، والخدمات السريعة، وأجور الأيدي العاملة.',
    descriptionEn: 'External workshop receipt for labor, quick-service actions, and mechanical repairs.',
    colorClass: 'text-indigo-600 dark:text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
    bgClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    icon: Wrench
  }
};

export const VEHICLE_CLASSIFICATIONS: Record<string, {
  key: string;
  labelAr: string;
  labelEn: string;
  colorClass: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = {
  truck: {
    key: 'truck',
    labelAr: 'شاحنات',
    labelEn: 'Trucks',
    colorClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40',
    icon: Truck
  },
  heavy_equipment: {
    key: 'heavy_equipment',
    labelAr: 'معدات ثقيلة',
    labelEn: 'Heavy Equipment',
    colorClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
    icon: Wrench
  },
  service_car: {
    key: 'service_car',
    labelAr: 'سيارات خدمة',
    labelEn: 'Service Cars',
    colorClass: 'bg-teal-50 dark:bg-teal-950/40 text-teal-750 dark:text-teal-400 border-teal-200 dark:border-teal-800/40',
    icon: Cpu
  },
  light_vehicle: {
    key: 'light_vehicle',
    labelAr: 'مركبات خفيفة',
    labelEn: 'Light Vehicles',
    colorClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/40',
    icon: Car
  },
  public_transport: {
    key: 'public_transport',
    labelAr: 'نقل جماعي',
    labelEn: 'Public Transport',
    colorClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/40',
    icon: Bus
  }
};

export const getVehicleClassification = (vehicle: Vehicle): string => {
  if (vehicle.classification && VEHICLE_CLASSIFICATIONS[vehicle.classification]) {
    return vehicle.classification;
  }
  
  const typeLower = (vehicle.type || '').toLowerCase();
  const nameLower = (vehicle.name || '').toLowerCase();
  
  if (typeLower.includes('ثقيلة') || typeLower.includes('هندسية') || nameLower.includes('رافعة') || nameLower.includes('معدة')) {
    return 'heavy_equipment';
  }
  if (typeLower.includes('شاحنة') || nameLower.includes('شاحنة') || nameLower.includes('صهريج')) {
    return 'truck';
  }
  if (typeLower.includes('حافلة') || typeLower.includes('نقل جماعي') || nameLower.includes('حافلة') || nameLower.includes('باص')) {
    return 'public_transport';
  }
  if (typeLower.includes('خدمة') || nameLower.includes('خدمة') || nameLower.includes('ميدانية') || nameLower.includes('دورية')) {
    return 'service_car';
  }
  return 'light_vehicle';
};

const StatusBadge = ({ status }: { status: VehicleStatus }) => {
  const configs = {
    active: { label: 'فعالة', classes: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500 animate-pulse' },
    maintenance: { label: 'تحت الصيانة', classes: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20', dot: 'bg-amber-500 animate-bounce' },
    stopped: { label: 'متوقفة', classes: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-455 border-rose-500/20', dot: 'bg-rose-500 animate-ping' },
  };
  const config = configs[status] || configs.active;
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border flex items-center gap-1.5 leading-none shadow-2xs ${config.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

interface VehiclesProps {
  user: User;
  openAddOnLoad?: boolean;
  onAddOpenHandled?: () => void;
}

// Pre-defined elegant preset images for heavy duty as choices
const PRESET_IMAGES = [
  { label: 'بيك أب خفيف', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600' },
  { label: 'شاحنة مرسيدس ثقيلة', url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=600' },
  { label: 'حافلة نقل جماعي بريميوم', url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=600' },
  { label: 'رافعة شوكية كاتربيلر', url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=600' }
];

// Deterministic 6-month maintenance trend data generator for dynamic sparklines
const getSparklineData = (vehicleId: string) => {
  const numId = parseInt(vehicleId, 10) || 1;
  const baseVal = numId === 1 ? 250 : numId === 2 ? 850 : numId === 3 ? 420 : 180;
  
  const months = [
    { name: 'ديسمبر', cost: Math.round(baseVal * (0.85 + Math.sin(numId + 1) * 0.2)) },
    { name: 'يناير', cost: Math.round(baseVal * (1.1 + Math.cos(numId + 2) * 0.25)) },
    { name: 'فبراير', cost: Math.round(baseVal * (0.95 + Math.sin(numId + 3) * 0.15)) },
    { name: 'مارس', cost: Math.round(baseVal * (1.3 + Math.cos(numId + 4) * 0.35)) },
    { name: 'أبريل', cost: Math.round(baseVal * (0.75 + Math.sin(numId + 5) * 0.2)) },
    { name: 'مايو', cost: Math.round(baseVal * (1.15 + Math.cos(numId + 6) * 0.3)) },
  ];

  // Try to read and overlay real logged orders if they exist to reflect dynamic updates instantly
  try {
    const savedOrdersRaw = localStorage.getItem('fleet_maintenance_orders_v2');
    if (savedOrdersRaw) {
      const parsedOrders = JSON.parse(savedOrdersRaw);
      parsedOrders.forEach((o: any) => {
        if (o.vehicleId === vehicleId && o.status === 'completed' && o.cost) {
          const orderDate = new Date(o.date);
          const monthIndex = orderDate.getMonth();
          const year = orderDate.getFullYear();
          
          if (year === 2026) {
            if (monthIndex === 0) months[1].cost += o.cost; // Jan
            if (monthIndex === 1) months[2].cost += o.cost; // Feb
            if (monthIndex === 2) months[3].cost += o.cost; // Mar
            if (monthIndex === 3) months[4].cost += o.cost; // Apr
            if (monthIndex === 4) months[5].cost += o.cost; // May
          } else if (year === 2025 && monthIndex === 11) {
            months[0].cost += o.cost; // Dec
          }
        }
      });
    }
  } catch (e) {
    console.error("Error computing dynamic sparkline costs", e);
  }

  return months;
};

// Deterministic and dynamic next maintenance schedule calculator based on maintenance order history & base values
const getNextMaintenanceInfo = (vehicleId: string, baseLastMaintenance: string) => {
  let lastDateStr = baseLastMaintenance || '2024-05-01';
  try {
    const saved = localStorage.getItem('fleet_maintenance_orders_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      const vehicleCompleted = parsed
        .filter((o: any) => o.vehicleId === vehicleId && o.status === 'completed')
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      if (vehicleCompleted.length > 0) {
        lastDateStr = vehicleCompleted[0].date;
      }
    }
  } catch (e) {
    console.error(e);
  }

  const lastDate = new Date(lastDateStr);
  const nextDate = new Date(lastDate);
  nextDate.setMonth(nextDate.getMonth() + 6);

  // Since local current time is May 22, 2026, align dates to stay relevant and interactive
  const today = new Date('2026-05-22');
  while (nextDate < today) {
    nextDate.setMonth(nextDate.getMonth() + 6);
  }

  const diffTime = nextDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Is approaching if less than 15 days, or vehicle 1 specifically
  const isApproaching = diffDays <= 15 || vehicleId === '1';

  return {
    date: nextDate.toISOString().split('T')[0],
    daysRemaining: diffDays === 0 ? 1 : diffDays,
    isApproaching,
  };
};

// Deterministic 30-day fuel consumption data generator for sparklines
export const get30DayFuelData = (vehicleId: string) => {
  const numId = parseInt(vehicleId, 10) || 1;
  const baseFuel = numId % 2 === 0 ? 34 : 22; // Average daily consumption in liters
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const dayVal = baseFuel + Math.sin((numId + i) * 0.7) * (baseFuel * 0.22) + Math.cos((numId * i) * 0.3) * (baseFuel * 0.08);
    data.push({ day: 30 - i, value: parseFloat(Math.max(5, dayVal).toFixed(1)) });
  }
  return data;
};

// Deterministic 30-day tire pressure data generator for sparklines
export const get30DayTireData = (vehicleId: string) => {
  const numId = parseInt(vehicleId, 10) || 1;
  const basePsi = numId % 2 === 0 ? 35 : 32; // base PSI rating for tires
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const noise = Math.sin((numId + i) * 0.4) * 1.2 + Math.cos(i * 0.8) * 0.4;
    const psiVal = basePsi + noise;
    data.push({ day: 30 - i, value: parseFloat(psiVal.toFixed(1)) });
  }
  return data;
};

export default function Vehicles({ user, openAddOnLoad, onAddOpenHandled }: VehiclesProps) {
  const { language, t } = useLanguage();
  const [vehicleList, setVehicleList] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('fleet_vehicles_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const uniqueList: Vehicle[] = [];
          const seen = new Set<string>();
          for (const item of parsed) {
            if (item && item.id && !seen.has(item.id)) {
              seen.add(item.id);
              uniqueList.push(item);
            }
          }
          return uniqueList;
        }
      } catch (e) {}
    }
    return initialVehicles;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [trendMetric, setTrendMetric] = useState<'fuel' | 'tire'>('fuel');
  const [selectedVehicleForHistory, setSelectedVehicleForHistory] = useState<Vehicle | null>(null);
  const [selectedVehicleForQr, setSelectedVehicleForQr] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<{ id: string; name: string; plateNumber?: string; type?: string } | null>(null);

  // Multi-select & Long-press state for batch deletion
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);

  const handlePressStart = (vehicleId: string) => {
    isLongPressTriggeredRef.current = false;
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
    longPressTimeoutRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(60);
        } catch (e) {}
      }
      setIsSelectionMode(true);
      setSelectedVehicleIds((prev) => {
        if (prev.includes(vehicleId)) return prev;
        return [...prev, vehicleId];
      });
    }, 500); // 500ms long-press threshold
  };

  const handlePressEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  const toggleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicleIds((prev) => 
      prev.includes(vehicleId) ? prev.filter(id => id !== vehicleId) : [...prev, vehicleId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedVehicleIds.length === filteredVehicles.length) {
      setSelectedVehicleIds([]);
    } else {
      setSelectedVehicleIds(filteredVehicles.map(v => v.id));
    }
  };

  const handleExitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedVehicleIds([]);
    setIsBatchDeleteModalOpen(false);
  };

  const handleConfirmBatchDelete = () => {
    if (selectedVehicleIds.length === 0) return;
    const count = selectedVehicleIds.length;
    const idsToDeleteSet = new Set(selectedVehicleIds);
    
    const updated = vehicleList.filter(v => !idsToDeleteSet.has(v.id));
    setVehicleList(updated);
    localStorage.setItem('fleet_vehicles_v3', JSON.stringify(updated));
    localStorage.setItem('fleet_vehicles_v2', JSON.stringify(updated));

    // Also unlink from any drivers in localStorage
    try {
      const savedDrivers = localStorage.getItem('fleet_drivers_v2');
      if (savedDrivers) {
        const parsed = JSON.parse(savedDrivers);
        const updatedDrivers = parsed.map((d: any) => {
          if (d.assignedVehicleId && idsToDeleteSet.has(d.assignedVehicleId)) {
            const { assignedVehicleId, ...rest } = d;
            return rest;
          }
          return d;
        });
        localStorage.setItem('fleet_drivers_v2', JSON.stringify(updatedDrivers));
      }
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('vehiclesUpdated', { detail: { vehicles: updated } }));
    } catch(e) {
      console.error(e);
    }

    setIsBatchDeleteModalOpen(false);
    setIsSelectionMode(false);
    setSelectedVehicleIds([]);

    // Nice transient visual notification toast
    const notifyDiv = document.createElement('div');
    notifyDiv.className = "fixed bottom-5 right-5 z-[130] bg-rose-600 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-2 border border-rose-500 text-xs font-black";
    notifyDiv.style.direction = "rtl";
    notifyDiv.innerHTML = `<span>✔ تم حذف ${count} مركبة/عجلة بنجاح من قاعدة البيانات!</span>`;
    document.body.appendChild(notifyDiv);
    setTimeout(() => {
      if (document.body.contains(notifyDiv)) {
        notifyDiv.remove();
      }
    }, 4000);
  };

  // Add vehicle modal controls
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkOption, setBulkOption] = useState<1 | 2>(1);
  const [generationCount, setGenerationCount] = useState<number>(500);
  const [generationYears, setGenerationYears] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationLog, setGenerationLog] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewVehicles, setPreviewVehicles] = useState<Vehicle[]>([]);
  const [isPreviewingCsv, setIsPreviewingCsv] = useState(false);
  const [processedCsvRows, setProcessedCsvRows] = useState<ProcessedCsvRow[]>([]);
  const [csvParsingProgress, setCsvParsingProgress] = useState<number>(0);
  const [csvCurrentRow, setCsvCurrentRow] = useState<number>(0);
  const [csvTotalRows, setCsvTotalRows] = useState<number>(0);
  const [csvProcessingStatus, setCsvProcessingStatus] = useState<string>('');
  const [csvStatusFilter, setCsvStatusFilter] = useState<'all' | 'valid' | 'error' | 'warning'>('all');
  const [editingCsvRow, setEditingCsvRow] = useState<ProcessedCsvRow | null>(null);
  const [editRowForm, setEditRowForm] = useState<{
    name: string;
    plateNumber: string;
    department: string;
    type: string;
    modelYear: string;
    fuelType: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
    chassisNumber: string;
  }>({
    name: '',
    plateNumber: '',
    department: '',
    type: 'مركبة خفيفة',
    modelYear: '2023',
    fuelType: 'diesel',
    chassisNumber: ''
  });

  // Smart Input Assistant state
  const [isSmartInputModalOpen, setIsSmartInputModalOpen] = useState(false);
  const [smartInputVehicleId, setSmartInputVehicleId] = useState('');
  const [smartInputFile, setSmartInputFile] = useState<File | null>(null);
  const [smartInputDragActive, setSmartInputDragActive] = useState(false);
  const [isSmartInputExtracting, setIsSmartInputExtracting] = useState(false);
  const [smartInputProgress, setSmartInputProgress] = useState(0);
  const [smartInputLog, setSmartInputLog] = useState('');
  const [proactiveDocType, setProactiveDocType] = useState<string>('');
  const [extractedOrder, setExtractedOrder] = useState<any | null>(null);
  const smartInputFileInputRef = useRef<HTMLInputElement>(null);

  const [expandedVehicleIds, setExpandedVehicleIds] = useState<Record<string, boolean>>({});
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [tempChassisValue, setTempChassisValue] = useState('');

  const toggleExpand = (vehicleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedVehicleIds(prev => ({
      ...prev,
      [vehicleId]: !prev[vehicleId]
    }));
  };

  const handleSaveChassis = (vehicleId: string) => {
    if (!tempChassisValue.trim()) {
      alert(language === 'ar' ? 'الرجاء إدخال رقم هيكل صحيح!' : 'Please enter a valid chassis number!');
      return;
    }
    const targetVehicle = vehicleList.find(v => v.id === vehicleId);
    const updated = vehicleList.map(v => v.id === vehicleId ? { ...v, chassisNumber: tempChassisValue.trim() } : v);
    setVehicleList(updated);
    localStorage.setItem('fleet_vehicles_v3', JSON.stringify(updated));

    // Create a critical audit log entry and store in localStorage
    try {
      const newLog = {
        id: 'crit-log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: user.name || 'مستخدم النظام',
        role: (user.role as string) === 'admin' ? 'مدير نظام' : (user.role as string) === 'fleet_manager' ? 'مدير حركة' : (user.role as string) === 'technician' ? 'فني صيانة' : 'مشاهد ومراقب',
        action: 'تعديل رقم هيكل المركبة',
        category: 'vehicles',
        ipAddress: '197.82.16.42',
        status: 'نجاح',
        details: `قام بتعديل مواصفات ورقم هيكل المركبة لوحة: ${targetVehicle?.plateNumber || 'غير محدد'} (${targetVehicle?.type || 'شاحنة'}) إلى: ${tempChassisValue.trim()}`
      };
      const savedLogs = localStorage.getItem('saas_critical_audit_logs');
      const logsArray = savedLogs ? JSON.parse(savedLogs) : [];
      logsArray.unshift(newLog);
      localStorage.setItem('saas_critical_audit_logs', JSON.stringify(logsArray));
    } catch (e) {
      console.error('Error logging critical vehicle edit:', e);
    }

    setEditingVehicleId(null);
    alert(language === 'ar' ? 'تم تحديث رقم الهيكل بنجاح!' : 'Chassis number updated successfully!');
  };

  const getLatestMaintenanceOrderAndTech = (vehicleId: string) => {
    let ordersList = [...maintenanceOrders];
    try {
      const savedOrders = localStorage.getItem('fleet_maintenance_orders_v2');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed)) {
          ordersList = [...parsed];
        }
      }
    } catch (e) {
      console.error(e);
    }

    const vehicleOrders = ordersList.filter(o => o.vehicleId === vehicleId);
    if (vehicleOrders.length === 0) return null;

    // Sort by date descending (latest first)
    const sorted = vehicleOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestOrder = sorted[0];

    // Find technician
    let techName = '';
    let techPhone = '';
    if (latestOrder.technicianId) {
      try {
        const savedTechs = localStorage.getItem('fleet_technicians_v2');
        let techsList = [];
        if (savedTechs) {
          techsList = JSON.parse(savedTechs);
        }
        if (!Array.isArray(techsList) || techsList.length === 0) {
          techsList = initialTechnicians;
        }
        const tech = techsList.find((t: any) => t.id === latestOrder.technicianId);
        if (tech) {
          techName = tech.name;
          techPhone = tech.phone || '';
        }
      } catch (e) {
        console.error(e);
      }
    }

    return {
      ...latestOrder,
      techName,
      techPhone,
    };
  };

  React.useEffect(() => {
    if (openAddOnLoad) {
      setIsAddModalOpen(true);
      if (onAddOpenHandled) {
        onAddOpenHandled();
      }
    }
  }, [openAddOnLoad, onAddOpenHandled]);

  const handleDeleteVehicle = (id: string, name: string, plateNumber?: string, type?: string) => {
    setVehicleToDelete({ id, name, plateNumber, type });
  };

  const confirmDeleteVehicle = () => {
    if (!vehicleToDelete) return;
    const { id, name } = vehicleToDelete;
    
    const updated = vehicleList.filter(v => v.id !== id);
    setVehicleList(updated);
    localStorage.setItem('fleet_vehicles_v3', JSON.stringify(updated));
    localStorage.setItem('fleet_vehicles_v2', JSON.stringify(updated));
    
    // Also unlink from any drivers in localStorage
    try {
      const savedDrivers = localStorage.getItem('fleet_drivers_v2');
      if (savedDrivers) {
        const parsed = JSON.parse(savedDrivers);
        const updatedDrivers = parsed.map((d: any) => {
          if (d.assignedVehicleId === id) {
            const { assignedVehicleId, ...rest } = d;
            return rest;
          }
          return d;
        });
        localStorage.setItem('fleet_drivers_v2', JSON.stringify(updatedDrivers));
      }
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('vehiclesUpdated', { detail: { vehicles: updated } }));
    } catch(e) {
      console.error(e);
    }
    
    setVehicleToDelete(null);
    
    // Nice transient visual notification toast
    const notifyDiv = document.createElement('div');
    notifyDiv.className = "fixed bottom-5 right-5 z-[100] bg-rose-600 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-2 border border-rose-500 text-xs font-black";
    notifyDiv.style.direction = "rtl";
    notifyDiv.innerHTML = `<span>✔ تم حذف سجل الآلية "${name}" بنجاح من المنظومة!</span>`;
    document.body.appendChild(notifyDiv);
    setTimeout(() => {
      if (document.body.contains(notifyDiv)) {
        notifyDiv.remove();
      }
    }, 4000);
  };

  React.useEffect(() => {
    localStorage.setItem('fleet_vehicles_v3', JSON.stringify(vehicleList));
  }, [vehicleList]);

  React.useEffect(() => {
    const handleBarcodeScanned = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.plateNumber) {
        setSearchTerm(customEvent.detail.plateNumber);
        
        // If a matching vehicle exists, auto-open its detailed history/specs popup!
        const match = vehicleList.find(
          v => v.plateNumber === customEvent.detail.plateNumber || 
               v.name.includes(customEvent.detail.plateNumber)
        );
        if (match) {
          setSelectedVehicleForHistory(match);
        }
      }
    };
    const handleVehicleIdScanned = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.vehicleId) {
        const match = vehicleList.find(v => v.id === customEvent.detail.vehicleId);
        if (match) {
          setSelectedVehicleForHistory(match);
        }
      }
    };
    window.addEventListener('barcode-scanned', handleBarcodeScanned);
    window.addEventListener('vehicle-id-scanned', handleVehicleIdScanned);
    return () => {
      window.removeEventListener('barcode-scanned', handleBarcodeScanned);
      window.removeEventListener('vehicle-id-scanned', handleVehicleIdScanned);
    };
  }, [vehicleList]);

  React.useEffect(() => {
    const pendingPlate = localStorage.getItem('scanned_plate_from_qr');
    const pendingId = localStorage.getItem('scanned_vehicle_id_from_qr');
    
    if (pendingPlate) {
      const match = vehicleList.find(v => v.plateNumber === pendingPlate);
      if (match) {
        setSelectedVehicleForHistory(match);
        setSearchTerm(pendingPlate);
      }
      localStorage.removeItem('scanned_plate_from_qr');
    } else if (pendingId) {
      const match = vehicleList.find(v => v.id === pendingId);
      if (match) {
        setSelectedVehicleForHistory(match);
        setSearchTerm(match.plateNumber);
      }
      localStorage.removeItem('scanned_vehicle_id_from_qr');
    }
  }, [vehicleList]);
  
  const [currentStep, setCurrentStep] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    type: 'مركبة خفيفة',
    classification: 'light_vehicle',
    plateNumber: '',
    department: 'قسم الآليات',
    subDepartment: 'شعبة الحركة',
    status: 'active' as VehicleStatus,
    image: '',
    iconName: '', // Custom selected icon identifier
    
    // Tech specs
    chassisNumber: '',
    modelYear: '2023',
    fuelType: 'diesel' as 'diesel' | 'gasoline' | 'electric' | 'hybrid',
    loadingCapacity: '',
    engineNumber: '',
    insuranceExpiry: '',

    // Wheel details
    tireCount: 4,
    tireSize: '265/65R17',
    tirePressure: '35 PSI',
    tireStatus: 'ممتاز',
    tireBrand: 'Michelin'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Search & Filter implementation
  const filteredVehicles = vehicleList.filter(v => {
    const classificationKey = getVehicleClassification(v);
    const classificationMeta = VEHICLE_CLASSIFICATIONS[classificationKey];
    const searchLower = searchTerm.trim().toLowerCase();
    
    const matchesSearch = !searchLower || 
      v.name.toLowerCase().includes(searchLower) || 
      v.plateNumber.toLowerCase().includes(searchLower) ||
      (v.type && v.type.toLowerCase().includes(searchLower)) ||
      (classificationMeta && (
        classificationMeta.labelAr.toLowerCase().includes(searchLower) ||
        classificationMeta.labelEn.toLowerCase().includes(searchLower)
      ));
      
    if (!matchesSearch) return false;
    
    // Status Filter
    if (statusFilter !== 'all') {
      if (v.status !== statusFilter) return false;
    }
    
    // Classification Filter
    if (classificationFilter !== 'all') {
      if (classificationKey !== classificationFilter) return false;
    }
    
    return true;
  });

  // Photo handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const isPlateDuplicate = formData.plateNumber.trim() !== '' && 
    vehicleList.some(v => v.plateNumber.trim().toLowerCase() === formData.plateNumber.trim().toLowerCase());

  const isChassisDuplicate = formData.chassisNumber.trim() !== '' && 
    vehicleList.some(v => v.chassisNumber && v.chassisNumber.trim().toLowerCase() === formData.chassisNumber.trim().toLowerCase());

  // Step Validation
  const validateStep = (step: number) => {
    const errors: Record<string, string> = { ...formErrors };
    
    if (step === 1) {
      delete errors.name;
      delete errors.plateNumber;
      if (!formData.name.trim()) {
        errors.name = 'اسم المركبة مطلوب';
      }
      if (!formData.plateNumber.trim()) {
        errors.plateNumber = 'رقم لوحة المركبة مطلوب';
      } else {
        const isDuplicateVal = vehicleList.some(
          v => v.plateNumber.trim().toLowerCase() === formData.plateNumber.trim().toLowerCase()
        );
        if (isDuplicateVal) {
          errors.plateNumber = 'رقم لوحة المركبة هذا مكرر ومسجل بالفعل!';
        }
      }
    }
    
    if (step === 2) {
      delete errors.chassisNumber;
      if (formData.chassisNumber.trim()) {
        const isDuplicateChassisVal = vehicleList.some(
          v => v.chassisNumber && v.chassisNumber.trim().toLowerCase() === formData.chassisNumber.trim().toLowerCase()
        );
        if (isDuplicateChassisVal) {
          errors.chassisNumber = 'رقم الهيكل هذا مكرر ومسجل مسبقاً لمركبة أخرى!';
        }
      }
    }
    
    setFormErrors(errors);
    
    if (step === 1) {
      return !errors.name && !errors.plateNumber;
    }
    if (step === 2) {
      return !errors.chassisNumber;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    const newVehicle: Vehicle = {
      id: String(Date.now()),
      name: formData.name,
      type: formData.type,
      classification: formData.classification,
      plateNumber: formData.plateNumber,
      department: formData.department,
      subDepartment: formData.subDepartment,
      status: formData.status,
      lastMaintenance: new Date().toISOString().split('T')[0],
      image: formData.iconName ? undefined : (formData.image || PRESET_IMAGES[0].url),
      iconName: formData.iconName || undefined,
      
      chassisNumber: formData.chassisNumber || 'CH-' + Math.floor(100000 + Math.random() * 900000),
      modelYear: formData.modelYear,
      fuelType: formData.fuelType,
      loadingCapacity: formData.loadingCapacity || 'غير محدد',
      engineNumber: formData.engineNumber || 'ENG-' + Math.floor(100000 + Math.random() * 900000),
      insuranceExpiry: formData.insuranceExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      
      tireCount: Number(formData.tireCount),
      tireSize: formData.tireSize,
      tirePressure: formData.tirePressure,
      tireStatus: formData.tireStatus,
      tireBrand: formData.tireBrand
    };

    setVehicleList([newVehicle, ...vehicleList]);
    
    // Reset Form
    setFormData({
      name: '',
      type: 'مركبة خفيفة',
      classification: 'light_vehicle',
      plateNumber: '',
      department: 'قسم الآليات',
      subDepartment: 'شعبة الحركة',
      status: 'active',
      image: '',
      iconName: '',
      chassisNumber: '',
      modelYear: '2023',
      fuelType: 'diesel',
      loadingCapacity: '',
      engineNumber: '',
      insuranceExpiry: '',
      tireCount: 4,
      tireSize: '265/65R17',
      tirePressure: '35 PSI',
      tireStatus: 'ممتاز',
      tireBrand: 'Michelin'
    });
    setFormErrors({});
    setCurrentStep(1);
    setIsAddModalOpen(false);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDragOverFile = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const processUploadedFile = async (file: File) => {
    setUploadedFile(file);
    setIsPreviewingCsv(true);
    setCsvParsingProgress(0);
    setCsvCurrentRow(0);
    setCsvTotalRows(0);
    setCsvProcessingStatus(language === 'ar' ? 'بدء فحص وتدقيق بنية الملف وتصنيف الصفوف...' : 'Starting spreadsheet inspection and row classification...');
    
    try {
      const rows = await parseAndValidateCsvRows(file, language, (prog, current, total, log) => {
        setCsvParsingProgress(prog);
        setCsvCurrentRow(current);
        setCsvTotalRows(total);
        setCsvProcessingStatus(log);
      });

      setProcessedCsvRows(rows);
      setPreviewVehicles(rows.filter(r => r.status === 'valid' || r.status === 'warning').map(r => r.vehicle));
    } catch (err) {
      console.warn("Error parsing fleet file:", err);
      setProcessedCsvRows([]);
      setPreviewVehicles([]);
    } finally {
      setIsPreviewingCsv(false);
    }
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleStartEditCsvRow = (row: ProcessedCsvRow) => {
    setEditingCsvRow(row);
    setEditRowForm({
      name: row.vehicle.name && !row.vehicle.name.includes('غير مسمى') && !row.vehicle.name.includes('Unnamed') ? row.vehicle.name : '',
      plateNumber: row.vehicle.plateNumber && !row.vehicle.plateNumber.includes('مفقودة') && !row.vehicle.plateNumber.includes('NO-PLATE') ? row.vehicle.plateNumber : '',
      department: row.vehicle.department || '',
      type: row.vehicle.type || (language === 'ar' ? 'مركبة خفيفة' : 'Light Vehicle'),
      modelYear: row.vehicle.modelYear || '2023',
      fuelType: (row.vehicle.fuelType as any) || 'diesel',
      chassisNumber: row.vehicle.chassisNumber || ''
    });
  };

  const handleSaveRowCorrection = () => {
    if (!editingCsvRow) return;

    const updatedVehicle = {
      ...editingCsvRow.vehicle,
      name: editRowForm.name.trim() || (language === 'ar' ? `أصل مصحح #${editingCsvRow.rowNumber}` : `Corrected Asset #${editingCsvRow.rowNumber}`),
      plateNumber: editRowForm.plateNumber.trim() || (language === 'ar' ? `لوحة مصححة #${editingCsvRow.rowNumber}` : `FIXED-${editingCsvRow.rowNumber}`),
      department: editRowForm.department.trim() || (language === 'ar' ? 'العمليات الميدانية' : 'Field Operations'),
      type: editRowForm.type,
      modelYear: editRowForm.modelYear.trim() || '2023',
      fuelType: editRowForm.fuelType,
      chassisNumber: editRowForm.chassisNumber.trim() || editingCsvRow.vehicle.chassisNumber
    };

    const revalidated = revalidateRow({
      ...editingCsvRow,
      vehicle: updatedVehicle
    }, language);

    setProcessedCsvRows(prev => {
      const nextRows = prev.map(r => r.id === editingCsvRow.id ? revalidated : r);
      setPreviewVehicles(nextRows.filter(r => r.status === 'valid' || r.status === 'warning').map(r => r.vehicle));
      return nextRows;
    });

    setEditingCsvRow(null);
  };

  const handleAutoFixAllCsvRows = () => {
    const fixed = autoFixAllRows(processedCsvRows, language);
    setProcessedCsvRows(fixed);
    setPreviewVehicles(fixed.map(r => r.vehicle));
  };

  const handleDeleteProcessedCsvRow = (id: string) => {
    setProcessedCsvRows(prev => {
      const nextRows = prev.filter(r => r.id !== id);
      setPreviewVehicles(nextRows.filter(r => r.status === 'valid' || r.status === 'warning').map(r => r.vehicle));
      return nextRows;
    });
  };

  const handleRemovePreviewVehicle = (id: string) => {
    handleDeleteProcessedCsvRow(id);
  };

  const handleDirectBulkRegister = (vehiclesToRegister: Vehicle[]) => {
    if (!vehiclesToRegister || vehiclesToRegister.length === 0) return;
    
    const updatedVehicles = [...vehiclesToRegister, ...vehicleList];
    setVehicleList(updatedVehicles);
    localStorage.setItem('fleet_vehicles_v3', JSON.stringify(updatedVehicles));
    
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('fleet-data-synced'));

    try {
      const newLog = {
        id: 'crit-log-bulk-direct-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: user.name || 'مستخدم النظام',
        role: (user.role as string) === 'admin' ? 'مدير نظام' : (user.role as string) === 'fleet_manager' ? 'مدير حركة' : 'مشاهد ومراقب',
        action: 'تسجيل جماعي لملف أصول CSV',
        category: 'vehicles',
        ipAddress: '197.82.16.42',
        status: 'نجاح',
        details: `تم بنجاح تسجيل وإدراج ${vehiclesToRegister.length} أصل ومركبة مباشرة في الأسطول من ملف (${uploadedFile?.name || 'CSV'}).`
      };
      const savedLogs = localStorage.getItem('saas_critical_audit_logs');
      const logsArray = savedLogs ? JSON.parse(savedLogs) : [];
      logsArray.unshift(newLog);
      localStorage.setItem('saas_critical_audit_logs', JSON.stringify(logsArray));
    } catch (e) {}

    setIsBulkModalOpen(false);
    setUploadedFile(null);
    setPreviewVehicles([]);
    
    alert(
      language === 'ar'
        ? `✅ تم تسجيل وإدراج ${vehiclesToRegister.length} مركبة وأصل بنجاح في قاعدة بيانات الأسطول!`
        : `✅ Successfully registered ${vehiclesToRegister.length} fleet assets from CSV!`
    );
  };

  const executeBulkDataGeneration = (count: number, years: number) => {
    const arabicNames = [
      'شاحنة مرسيدس أكتروس ثقيلة', 'تويوتا هيلوكس بيك أب', 'حافلة هيونداي سيتي', 'سيارة فورد رينجر ميدانية',
      'رافعة شوكية كاتربيلر ثقيلة', 'سيارة نيسان باترول أمنية', 'سيارة شيفروليه سيلفرادو نقل',
      'صهريج مياه مرسيدس', 'ضاغطة نفايات هينو', 'معدة صيانة هيدروليكية كوماتسو'
    ];
    const englishNames = [
      'Mercedes Actros Heavy Truck', 'Toyota Hilux Pickup', 'Hyundai City Bus', 'Ford Ranger Patrol',
      'Caterpillar Forklift Heavy Duty', 'Nissan Patrol Security', 'Chevrolet Silverado Utility',
      'Mercedes Water Tanker', 'Hino Garbage Compactor', 'Komatsu Hydraulic Lifter'
    ];
    const typesAr = ['معدة ثقيلة', 'مركبة خفيفة', 'نقل جماعي', 'معدة هندسية', 'معدات قاطرة مقطورة'];
    const icons = ['truck', 'car', 'bus', 'wrench', 'shield', 'cpu'];
    const departmentsAr = ['قسم الآليات', 'شعبة الحركة', 'قسم الصيانة والمشاريع', 'العمليات اللوجستية'];
    const subDepartmentsAr = ['شعبة الحركة', 'شعبة الصيانة', 'مراقبة الجودة', 'فريق الطوارئ الميداني'];
    const letters = 'أبجدوزحطيكلمنصعفصقرشت';
    const brands = ['Michelin', 'Bridgestone', 'Continental', 'Goodyear', 'Yokohama', 'Dunlop'];
    const sizes = ['315/80R22.5', '265/65R17', '275/70R22.5', '250-15 solid', '295/80R22.5'];

    const newVehicles: Vehicle[] = [];
    const newOrders: any[] = [];

    let existingVehicles = [...vehicleList];
    let existingOrders: any[] = [];
    try {
      const savedOrders = localStorage.getItem('fleet_maintenance_orders_v2');
      if (savedOrders) {
        existingOrders = JSON.parse(savedOrders);
      } else {
        existingOrders = [...maintenanceOrders];
      }
    } catch(e) {}

    const today = new Date('2026-05-22');

    for (let i = 0; i < count; i++) {
      const id = 'bulk-v-' + (100 + i) + '-' + Date.now().toString().slice(-4);
      const nameIndex = i % arabicNames.length;
      const name = language === 'ar' ? `${arabicNames[nameIndex]} #${i + 1}` : `${englishNames[nameIndex]} #${i + 1}`;
      
      const plateNumber = `${letters[i % letters.length]} ${letters[(i + 1) % letters.length]} ${letters[(i + 2) % letters.length]} ${1000 + (i * 7) % 9000}`;
      const type = typesAr[i % typesAr.length];
      const iconName = icons[i % icons.length];
      const dept = departmentsAr[i % departmentsAr.length];
      const subDept = subDepartmentsAr[i % subDepartmentsAr.length];
      const status = i % 15 === 0 ? 'maintenance' : i % 25 === 0 ? 'stopped' : 'active';
      const tireCount = i % 3 === 0 ? 10 : i % 5 === 0 ? 6 : i % 7 === 0 ? 18 : 4;
      
      const vehicle: Vehicle = {
        id,
        name,
        type,
        plateNumber,
        department: dept,
        subDepartment: subDept,
        status: status as any,
        lastMaintenance: new Date(today.getTime() - (i * 5 * 24 * 60 * 60 * 1000) % (120 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        iconName,
        chassisNumber: 'MHR' + Math.random().toString(36).substring(2, 12).toUpperCase(),
        engineNumber: 'ENG-' + Math.floor(100000 + Math.random() * 900000),
        modelYear: String(2025 - (i % 8)),
        fuelType: i % 4 === 0 ? 'gasoline' : i % 10 === 0 ? 'electric' : 'diesel',
        loadingCapacity: i % 3 === 0 ? '20 طن' : '2.5 طن',
        insuranceExpiry: new Date(today.getTime() + (180 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        tireCount,
        tireSize: sizes[i % sizes.length],
        tirePressure: tireCount > 6 ? '115 PSI' : '35 PSI',
        tireStatus: i % 12 === 0 ? 'يحتاج استبدال' : i % 8 === 0 ? 'متوسط' : 'ممتاز',
        tireBrand: brands[i % brands.length],
        lat: 24.7136 + (Math.sin(i) * 0.15),
        lng: 46.6753 + (Math.cos(i) * 0.15)
      };

      newVehicles.push(vehicle);

      // Generate history
      const orderCount = 3 + (i % 5);
      for (let j = 0; j < orderCount; j++) {
        const orderId = 'bulk-wo-' + i + '-' + j + '-' + Date.now().toString().slice(-3);
        const orderNum = `WO-B${2024 + (j % years)}-${1000 + i + j}`;
        
        const dateOffsetDays = (j * 120 + (i * j) % 30) % (years * 365);
        const orderDate = new Date(today.getTime() - (dateOffsetDays * 24 * 60 * 60 * 1000));
        
        const arDescriptions = [
          'تغيير إطارات المحور الخلفي وضبط زوايا الاتزان',
          'صيانة وقائية دورية للمحرك وتبديل الفلاتر الأساسية والزيوت',
          'فحص شامل للفرامل الأمامية وتبطين المكابح',
          'معالجة تهريب هيدروليكي في الأذرع ومكابس الضغط الهيدروليكي',
          'استبدال البطارية وتصفية الحساسات الكهربائية للمركبة',
          'إصلاح شامل لمنظومة التبريد (الرديتر) وفحص خراطيم المياه'
        ];
        
        const enDescriptions = [
          'Rear axle tire replacement and wheel alignment',
          'Preventive engine maintenance including filters & oil change',
          'Complete front brakes inspection and brake pad relining',
          'Fixed hydraulic leak in lift arms and high pressure pistons',
          'Battery replacement and full electrical sensor diagnostics',
          'Radiator cooling system overhaul and coolant hose inspection'
        ];

        const partsList = [
          ['إطارات 22.5', 'حلقة مانع تسرب'],
          ['زيت محرك 15W-40', 'فلتر زيت أصلي', 'فلتر ديزل'],
          ['أقمشة فرامل أمامي', 'سائل فرامل دوت 4'],
          ['حلقة هيدروليكية مانعة للتسرب', 'زيت هيدروليك لزوجة 46'],
          ['بطارية 12 فولت 70 أمبير', 'شمعات احتراق بلاتينيوم'],
          ['خراطيم تبريد معززة', 'سائل رديتر أخضر']
        ];

        const descIndex = (i + j) % arDescriptions.length;

        newOrders.push({
          id: orderId,
          vehicleId: id,
          orderNumber: orderNum,
          date: orderDate.toISOString().split('T')[0],
          description: language === 'ar' ? arDescriptions[descIndex] : enDescriptions[descIndex],
          category: descIndex === 0 ? 'mechanical' : descIndex === 4 ? 'electrical' : descIndex === 3 ? 'hydraulic' : 'mechanical',
          status: 'completed',
          technicianId: String(201 + (i % 3)),
          priority: j % 3 === 0 ? 'high' : 'medium',
          cost: 150 + ((i + j) * 115) % 3800,
          partsUsed: partsList[descIndex]
        });
      }
    }

    const combinedVehicles = [...newVehicles, ...existingVehicles];
    const combinedOrders = [...newOrders, ...existingOrders];

    setVehicleList(combinedVehicles);
    localStorage.setItem('fleet_vehicles_v3', JSON.stringify(combinedVehicles));
    localStorage.setItem('fleet_maintenance_orders_v2', JSON.stringify(combinedOrders));
    
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('fleet-data-synced'));

    try {
      const newLog = {
        id: 'crit-log-bulk-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: user.name || 'مستخدم النظام',
        role: (user.role as string) === 'admin' ? 'مدير نظام' : (user.role as string) === 'fleet_manager' ? 'مدير حركة' : 'مشاهد ومراقب',
        action: 'توليد واستيراد أصول جماعي',
        category: 'vehicles',
        ipAddress: '197.82.16.42',
        status: 'نجاح',
        details: `قام باستيراد وتوليد ${count} أصل ومركبة بالروبوت الذكي مع سجل تشغيلي تاريخي كامل لـ ${years} سنوات بنقرة واحدة.`
      };
      const savedLogs = localStorage.getItem('saas_critical_audit_logs');
      const logsArray = savedLogs ? JSON.parse(savedLogs) : [];
      logsArray.unshift(newLog);
      localStorage.setItem('saas_critical_audit_logs', JSON.stringify(logsArray));
    } catch (e) {}
  };

  const handleAiBulkImport = async (file: File) => {
    if (!file) return;
    setIsGenerating(true);
    setGenerationProgress(10);
    setGenerationLog(language === 'ar' ? `تحليل ملف استيراد الأصول: ${file.name}...` : `Parsing asset file: ${file.name}...`);
    
    try {
      setGenerationProgress(25);
      setGenerationLog(language === 'ar' ? 'استخراج وتحليل مصفوفة البيانات الثنائية ومطابقة الجداول...' : 'Reading binary data stream and parsing workbook sheets...');
      
      let parsedVehicles: any[] = [];
      let parsedOrders: any[] = [];

      try {
        const fileBase64Str = await fileToBase64(file);
        
        setGenerationProgress(40);
        setGenerationLog(language === 'ar' ? 'الاتصال بمحرك الذكاء الاصطناعي لمطابقة الأعمدة وتدقيق مواصفات الإطارات والمحركات...' : 'Connecting to AI Engine to map headers and validate specs...');
        
        const response = await fetch('/api/ai/bulk-import-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            fileBase64: fileBase64Str,
            fileName: file.name,
            language 
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          parsedVehicles = data.vehicles || [];
          parsedOrders = data.maintenanceOrders || [];
        }
      } catch (networkOrApiErr) {
        console.warn("Backend bulk import API failed, switching to in-browser parsing engine:", networkOrApiErr);
      }

      // If backend returned empty or network failed, parse directly on client with XLSX
      if (!parsedVehicles || parsedVehicles.length === 0) {
        setGenerationLog(language === 'ar' ? 'تشغيل المعالج الذكي المدمج لتحليل وهيكلة بطاقات الأصول محلياً...' : 'Running in-browser intelligent asset engine...');
        const clientParsed = await parseFleetFileClientSide(file, language);
        parsedVehicles = clientParsed.vehicles || [];
        parsedOrders = clientParsed.maintenanceOrders || [];
      }

      setGenerationProgress(70);
      setGenerationLog(language === 'ar' ? 'جاري تصنيف الأصول وتوزيع الفئات وتوليد سجل تشغيلي لـ 3 سنوات بأثر رجعي...' : 'Classifying archetypes and generating 3-year retroactive archive...');
      
      setGenerationProgress(85);
      setGenerationLog(language === 'ar' ? 'مزامنة وحفظ الأصول وسجلات الصيانة في قاعدة البيانات...' : 'Saving parsed assets and maintenance orders to database...');
      
      // Prepend new vehicles to list
      const updatedVehicles = [...parsedVehicles, ...vehicleList];
      setVehicleList(updatedVehicles);
      localStorage.setItem('fleet_vehicles_v3', JSON.stringify(updatedVehicles));
      
      // Load existing orders, merge and save
      let existingOrders = [];
      try {
        const savedOrders = localStorage.getItem('fleet_maintenance_orders_v2');
        if (savedOrders) {
          existingOrders = JSON.parse(savedOrders);
        } else {
          existingOrders = [...maintenanceOrders];
        }
      } catch (e) {}
      
      const updatedOrders = [...parsedOrders, ...existingOrders];
      localStorage.setItem('fleet_maintenance_orders_v2', JSON.stringify(updatedOrders));
      
      // Sync events
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('fleet-data-synced'));
      
      // Audit log
      try {
        const newLog = {
          id: 'crit-log-bulk-ai-' + Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: user.name || 'مستخدم النظام',
          role: (user.role as string) === 'admin' ? 'مدير نظام' : (user.role as string) === 'fleet_manager' ? 'مدير حركة' : 'مشاهد ومراقب',
          action: 'استيراد ومطابقة ذكاء اصطناعي جماعي',
          category: 'vehicles',
          ipAddress: '197.82.16.42',
          status: 'نجاح',
          details: `قام باستيراد ومزامنة ${parsedVehicles.length} أصل حقيقي من ملف (${file.name})، وقام الذكاء الاصطناعي بمطابقة الرؤوس بدقة وتوليد سجل صيانة لـ 3 سنوات بأثر رجعي يشمل ${parsedOrders.length} طلب صيانة مع التكاليف والمواصفات الميكانيكية.`
        };
        const savedLogs = localStorage.getItem('saas_critical_audit_logs');
        const logsArray = savedLogs ? JSON.parse(savedLogs) : [];
        logsArray.unshift(newLog);
        localStorage.setItem('saas_critical_audit_logs', JSON.stringify(logsArray));
      } catch (e) {}
      
      setGenerationProgress(100);
      setGenerationLog(language === 'ar' ? 'تمت المزامنة وحفظ البيانات بنجاح!' : 'Data synced and saved successfully!');
      
      setTimeout(() => {
        setIsGenerating(false);
        setIsBulkModalOpen(false);
        setUploadedFile(null);
        alert(
          language === 'ar'
            ? `تم بنجاح استيراد ومطابقة ${parsedVehicles.length} أصل ومركبة من ملفك (${file.name})، وتوليد أرشيف تشغيلي كامل وصيانة متطابق لـ 3 سنوات ماضية يشمل ${parsedOrders.length} طلب صيانة تفصيلي مع قطع الغيار والتكاليف!`
            : `Import complete: successfully parsed and loaded ${parsedVehicles.length} real assets with 3-year operation log history containing ${parsedOrders.length} work orders!`
        );
      }, 1200);
      
    } catch (err: any) {
      console.error(err);
      setIsGenerating(false);
      setUploadedFile(null);
      alert(
        language === 'ar'
          ? `عذراً، تعذر معالجة هذا الملف. يرجى التأكد من اختيار ملف Excel (.xlsx / .xls) أو CSV يحتوي على أعمدة للأصول أو المركبات.`
          : `Failed to import: Make sure the file is a valid Excel (.xlsx / .xls) or CSV with asset columns.`
      );
    }
  };

  const autoClassifyFile = (file: File) => {
    setSmartInputFile(file);
    const nameLower = file.name.toLowerCase();
    if (nameLower.includes("invoice") || nameLower.includes("parts") || nameLower.includes("قطع") || nameLower.includes("فاتورة") || nameLower.includes("شراء") || nameLower.includes("صيانة")) {
      setProactiveDocType('spare_parts_invoice');
    } else if (nameLower.includes("inspect") || nameLower.includes("report") || nameLower.includes("فحص") || nameLower.includes("تقرير") || nameLower.includes("دوري")) {
      setProactiveDocType('periodic_inspection');
    } else {
      setProactiveDocType('external_workshop_receipt');
    }
  };

  const handleSmartInputExtract = async () => {
    if (!smartInputVehicleId) {
      alert(language === 'ar' ? 'الرجاء اختيار المركبة أولاً!' : 'Please select a vehicle first!');
      return;
    }
    if (!smartInputFile) {
      alert(language === 'ar' ? 'الرجاء رفع ملف أو مستند صيانة أولاً!' : 'Please upload a maintenance document or image first!');
      return;
    }

    const selectedVehicle = vehicleList.find(v => v.id === smartInputVehicleId);
    setIsSmartInputExtracting(true);
    setSmartInputProgress(15);
    setSmartInputLog(language === 'ar' ? 'جاري قراءة وتشفير ملف المستند...' : 'Loading and encoding document file...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64Str = e.target?.result as string;
        setSmartInputProgress(45);
        setSmartInputLog(language === 'ar' ? 'جاري تحليل المستند واستدعاء خوادم الاستخلاص بالذكاء الاصطناعي...' : 'Analyzing document and calling AI extraction API...');

        const response = await fetch('/api/ai/extract-maintenance-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64Str,
            fileName: smartInputFile.name,
            fileType: smartInputFile.type,
            language,
            vehicleName: selectedVehicle ? `${selectedVehicle.name} (${selectedVehicle.plateNumber})` : 'General',
            documentTypeHint: proactiveDocType
          })
        });

        setSmartInputProgress(80);
        setSmartInputLog(language === 'ar' ? 'جاري التعرف الذكي على الحقول والأسعار وتأريخ الصيانة...' : 'Intelligently mapping repair fields, costs, and dates...');

        if (!response.ok) {
          throw new Error('Failed to connect to AI extraction service');
        }

        const data = await response.json();
        
        setSmartInputProgress(100);
        setSmartInputLog(language === 'ar' ? 'اكتمل استخلاص البيانات بنجاح!' : 'Extraction completed successfully!');

        // If the user selected or we proactive-classified a type, we can apply it to the extracted data
        let finalDocType = proactiveDocType || data.documentType || 'external_workshop_receipt';
        let updatedData = { ...data, documentType: finalDocType };
        
        // Align label and status based on finalDocType
        if (finalDocType === 'spare_parts_invoice') {
          updatedData.documentTypeLabelAr = 'فاتورة قطع غيار';
          updatedData.documentTypeLabelEn = 'Spare parts invoice';
          updatedData.externalInvoiceStatus = 'paid';
          if (!updatedData.externalInvoiceNo) {
            updatedData.externalInvoiceNo = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
          }
        } else if (finalDocType === 'periodic_inspection') {
          updatedData.documentTypeLabelAr = 'تقرير فحص دوري';
          updatedData.documentTypeLabelEn = 'Periodic inspection report';
          updatedData.cost = 0;
          updatedData.partsUsed = [];
          updatedData.externalInvoiceStatus = '';
          updatedData.externalInvoiceNo = '';
        } else {
          updatedData.documentType = 'external_workshop_receipt';
          updatedData.documentTypeLabelAr = 'إيصال ورشة خارجية';
          updatedData.documentTypeLabelEn = 'External workshop receipt';
          updatedData.externalInvoiceStatus = 'paid';
          if (!updatedData.externalInvoiceNo) {
            updatedData.externalInvoiceNo = `REC-${Math.floor(100000 + Math.random() * 900000)}`;
          }
        }

        setTimeout(() => {
          setExtractedOrder({
            ...updatedData,
            vehicleId: smartInputVehicleId
          });
          setIsSmartInputExtracting(false);
        }, 1000);

      } catch (err) {
        console.error(err);
        setIsSmartInputExtracting(false);
        alert(
          language === 'ar'
            ? 'فشل استخلاص البيانات من المستند بالذكاء الاصطناعي، يرجى المحاولة لاحقاً.'
            : 'AI extraction failed. Please try again later.'
        );
      }
    };
    reader.readAsDataURL(smartInputFile);
  };

  const handleDocumentTypeChange = (newType: string) => {
    if (!extractedOrder) return;

    let updated = { ...extractedOrder, documentType: newType };

    if (newType === 'spare_parts_invoice') {
      updated.documentTypeLabelAr = 'فاتورة قطع غيار';
      updated.documentTypeLabelEn = 'Spare parts invoice';
      updated.externalInvoiceStatus = 'paid';
      if (!updated.externalInvoiceNo) {
        updated.externalInvoiceNo = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
      }
      updated.techNotes = language === 'ar' 
        ? "فاتورة قطع غيار معتمدة وتم إدخال البنود تلقائياً." 
        : "Approved parts invoice, items populated automatically.";
    } else if (newType === 'periodic_inspection') {
      updated.documentTypeLabelAr = 'تقرير فحص دوري';
      updated.documentTypeLabelEn = 'Periodic inspection report';
      updated.cost = 0;
      updated.partsUsed = [];
      updated.externalInvoiceStatus = '';
      updated.externalInvoiceNo = '';
      updated.techNotes = language === 'ar' 
        ? "فحص دوري ناجح ومطابق لمعايير السلامة والأمان للأسطول." 
        : "Successful periodic safety inspection and compliance check.";
    } else {
      // external_workshop_receipt
      updated.documentTypeLabelAr = 'إيصال ورشة خارجية';
      updated.documentTypeLabelEn = 'External workshop receipt';
      updated.externalInvoiceStatus = 'paid';
      if (!updated.externalInvoiceNo) {
        updated.externalInvoiceNo = `REC-${Math.floor(100000 + Math.random() * 900000)}`;
      }
      updated.techNotes = language === 'ar' 
        ? "إصلاح وصيانة خارجية مبرهنة بإيصال مالي معتمد." 
        : "External repair supported by an official financial receipt.";
    }

    setExtractedOrder(updated);
  };

  const handleSaveExtractedOrder = () => {
    if (!extractedOrder) return;

    let existingOrders = [];
    try {
      const savedOrders = localStorage.getItem('fleet_maintenance_orders_v2');
      if (savedOrders) {
        existingOrders = JSON.parse(savedOrders);
      } else {
        existingOrders = [...maintenanceOrders];
      }
    } catch (e) {
      existingOrders = [...maintenanceOrders];
    }

    let partsArray = [];
    if (typeof extractedOrder.partsUsed === 'string') {
      partsArray = (extractedOrder.partsUsed as string).split(',').map(p => p.trim()).filter(Boolean);
    } else if (Array.isArray(extractedOrder.partsUsed)) {
      partsArray = extractedOrder.partsUsed;
    }

    const newOrder = {
      id: 'doc-wo-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      vehicleId: extractedOrder.vehicleId,
      orderNumber: extractedOrder.orderNumber || `WO-DOC-${Date.now().toString().slice(-4)}`,
      date: extractedOrder.date || new Date().toISOString().split('T')[0],
      description: extractedOrder.description,
      category: extractedOrder.category || 'mechanical',
      status: 'completed',
      technicianId: extractedOrder.technicianId || '201',
      priority: extractedOrder.priority || 'medium',
      cost: Number(extractedOrder.cost) || 0,
      partsUsed: partsArray,
      // Classified document fields
      documentType: extractedOrder.documentType || 'external_workshop_receipt',
      documentTypeLabelAr: extractedOrder.documentTypeLabelAr || 'إيصال ورشة خارجية',
      documentTypeLabelEn: extractedOrder.documentTypeLabelEn || 'External workshop receipt',
      externalInvoiceNo: extractedOrder.externalInvoiceNo || '',
      externalInvoiceStatus: extractedOrder.externalInvoiceStatus || 'paid',
      techNotes: extractedOrder.techNotes || ''
    };

    const updatedOrders = [newOrder, ...existingOrders];
    localStorage.setItem('fleet_maintenance_orders_v2', JSON.stringify(updatedOrders));

    const selectedVehicle = vehicleList.find(v => v.id === extractedOrder.vehicleId);
    if (selectedVehicle) {
      const vLastMaint = selectedVehicle.lastMaintenance;
      if (!vLastMaint || new Date(newOrder.date) > new Date(vLastMaint)) {
        const updatedVehicles = vehicleList.map(v => 
          v.id === selectedVehicle.id ? { ...v, lastMaintenance: newOrder.date } : v
        );
        setVehicleList(updatedVehicles);
        localStorage.setItem('fleet_vehicles_v3', JSON.stringify(updatedVehicles));
      }
    }

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('fleet-data-synced'));

    try {
      const newLog = {
        id: 'crit-log-doc-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: user.name || 'مستخدم النظام',
        role: (user.role as string) === 'admin' ? 'مدير نظام' : (user.role as string) === 'fleet_manager' ? 'مدير حركة' : 'مشاهد ومراقب',
        action: 'استخلاص صيانة وأرشفة مستند ذكي',
        category: 'vehicles',
        ipAddress: '197.82.16.42',
        status: 'نجاح',
        details: `قام باستخلاص وربط وثيقة صيانة تاريخية من نوع (${newOrder.documentTypeLabelAr}) بالذكاء الاصطناعي للمركبة: ${selectedVehicle?.name || ''} (${selectedVehicle?.plateNumber || ''}). رقم الطلب: ${newOrder.orderNumber} بتكلفة $${newOrder.cost}.`
      };
      const savedLogs = localStorage.getItem('saas_critical_audit_logs');
      const logsArray = savedLogs ? JSON.parse(savedLogs) : [];
      logsArray.unshift(newLog);
      localStorage.setItem('saas_critical_audit_logs', JSON.stringify(logsArray));
    } catch (e) {}

    alert(
      language === 'ar'
        ? `تم بنجاح حفظ وتأشير طلب الصيانة رقم ${newOrder.orderNumber} كـ (${newOrder.documentTypeLabelAr}) وربطه بملف المركبة تاريخياً!`
        : `Successfully saved work order ${newOrder.orderNumber} as (${newOrder.documentTypeLabelEn}) and linked it to vehicle history!`
    );

    setExtractedOrder(null);
    setSmartInputFile(null);
    setSmartInputVehicleId('');
    setIsSmartInputModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Vehicle History / Details Modal */}
      <VehicleHistory 
        vehicle={selectedVehicleForHistory} 
        onClose={() => setSelectedVehicleForHistory(null)} 
        user={user}
      />

      {/* Vehicle QR Code Generator Modal */}
      <VehicleQrModal 
        vehicle={selectedVehicleForQr}
        isOpen={selectedVehicleForQr !== null}
        onClose={() => setSelectedVehicleForQr(null)}
        language={language}
      />

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
                <span>إدارة المعدات والأسطول الذكي</span>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                  <Truck size={32} className="text-purple-300 animate-pulse" />
                  <span>{language === 'ar' ? 'إدارة المعدات والمركبات' : 'Fleet & Equipment Desk'}</span>
                </h1>
                <ContextualHelp 
                  id="fleet-vehicles"
                  titleAr="مستودع أسطول المركبات"
                  titleEn="Fleet & Equipment Desk"
                  explanationAr="لوحة مركزية لتسجيل وتعديل وفلترة كافة شاحنات وآليات النقل والسيارات الخفيفة النشطة في أسطولك."
                  explanationEn="A master repository designed to track, audit, and filter all heavy duty trucks, mechanical machinery, and standard operational cars."
                  benefitsAr={[
                    "متابعة استهلاك الوقود اللحظي ومعدلات الكفاءة الإجمالية.",
                    "مراقبة مستوى سلامة وضغط الإطارات لكل محور عجلات صامت وعامل.",
                    "عرض فوري لتراخيص وتواريخ انتهاء الوثائق والتأمين."
                  ]}
                  benefitsEn={[
                    "Real-time monitoring of fuel indices and live idle statuses.",
                    "Accurate multi-axle tire pressures tracking to enhance safety.",
                    "Never miss mandatory license, registration, or lease renewals again."
                  ]}
                  tipsAr={[
                    "يمكنك النقر على أي مركبة لفتح السجل التاريخي الشامل وملفها الميكانيكي الكامل."
                  ]}
                  tipsEn={[
                    "Click on any vehicle card to open its absolute historic maintenance files."
                  ]}
                  language={language}
                />
              </div>
              <p className="text-xs text-purple-100/70 max-w-2xl">
                {language === 'ar' 
                  ? 'سجل كامل بجميع الأصول التابعة للمؤسسة تفصيلياً مع الإطارات والبيانات المتقدمة.' 
                  : 'Detailed inventory log spanning key components, live pressures, and operational status.'}
              </p>
            </div>

            {user.role === 'admin' && (
              <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch lg:items-center gap-2.5 shrink-0">
                <button 
                  id="bulk-import-vehicle-btn"
                  onClick={() => setIsBulkModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 h-11 bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/30 rounded-xl font-black shadow-sm active:scale-[98%] transition-all text-xs cursor-pointer w-full lg:w-auto"
                >
                  <FileSpreadsheet size={16} className="text-purple-300 shrink-0" />
                  <span>{language === 'ar' ? 'استيراد وتسجيل الأصول (CSV / Excel)' : 'Bulk CSV / Fleet Import'}</span>
                </button>
                <button 
                  id="smart-input-assistant-btn"
                  onClick={() => setIsSmartInputModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 h-11 bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/30 rounded-xl font-black shadow-sm active:scale-[98%] transition-all text-xs cursor-pointer w-full lg:w-auto"
                >
                  <Wrench size={14} className="text-purple-300 shrink-0" />
                  <span>{language === 'ar' ? 'مساعد الإدخال الذكي' : 'Smart Input Assistant'}</span>
                </button>
                <button 
                  id="add-vehicle-btn"
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-5 h-11 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-black shadow-md hover:shadow-lg active:scale-[98%] transition-all text-xs cursor-pointer w-full lg:w-auto border border-purple-400/20"
                >
                  <Plus size={16} className="shrink-0" />
                  <span>{t('إضافة مركبة تفصيلياً')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="relative w-full">
          <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
            <Search size={14} />
          </span>
          <input 
            type="text"
            placeholder="البحث بواسطة اسم المركبة أو رقم اللوحة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-16 py-2 bg-slate-50 dark:bg-slate-900 border border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-50/50 rounded-xl transition-all outline-none text-[13px] dark:text-white font-medium"
          />
          <div className="absolute inset-y-0 left-2 flex items-center gap-1">
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="تصفية التصفح"
              >
                <X size={13} />
              </button>
            )}
            <button 
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-barcode-scanner'))}
              className="p-1 px-1.5 bg-brand-blue-50 dark:bg-brand-blue-900/40 text-brand-blue-500 dark:text-brand-blue-450 hover:text-brand-blue-600 rounded-md transition-all cursor-pointer flex items-center gap-1 hover:scale-105"
              title="تفعيل قارئ واستشعار الباركود"
            >
              <Scan size={13} />
              <span className="text-[9px] font-black hidden sm:inline">Scan</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="space-y-3.5">
          {/* Status filter row */}
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 md:w-24 shrink-0">{language === 'ar' ? 'الحالة:' : 'Status:'}</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/80 gap-1 flex-1">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer text-center ${statusFilter === 'all' ? 'bg-white dark:bg-slate-800 text-brand-blue-600 dark:text-brand-blue-400 shadow-xs' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'}`}
              >
                الكل
              </button>
              <button 
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer text-center ${statusFilter === 'active' ? 'bg-white dark:bg-slate-800 text-brand-green-500 dark:text-brand-green-400 shadow-xs' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'}`}
              >
                فعالة
              </button>
              <button 
                onClick={() => setStatusFilter('maintenance')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer text-center ${statusFilter === 'maintenance' ? 'bg-white dark:bg-slate-800 text-brand-yellow-600 dark:text-brand-yellow-400 shadow-xs' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'}`}
              >
                تحت الصيانة
              </button>
              <button 
                onClick={() => setStatusFilter('stopped')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer text-center ${statusFilter === 'stopped' ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'}`}
              >
                {language === 'ar' ? 'متوقفة' : 'Stopped'}
              </button>
            </div>
          </div>

          {/* Classification filter row */}
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400 md:w-24 shrink-0">{language === 'ar' ? 'التصنيف المجموعي:' : 'Classification:'}</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/80 gap-1 flex-1">
              <button 
                onClick={() => setClassificationFilter('all')}
                className={`px-2.5 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer text-center ${classificationFilter === 'all' ? 'bg-white dark:bg-slate-800 text-brand-blue-600 dark:text-brand-blue-400 shadow-xs' : 'text-slate-450 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'}`}
              >
                {language === 'ar' ? 'الكل' : 'All'}
              </button>
              {Object.entries(VEHICLE_CLASSIFICATIONS).map(([key, meta]) => {
                const IconComponent = meta.icon;
                return (
                  <button 
                    key={key}
                    onClick={() => setClassificationFilter(key)}
                    className={`px-2 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${classificationFilter === key ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-450 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'}`}
                  >
                    <IconComponent size={11} className="shrink-0" />
                    <span>{language === 'ar' ? meta.labelAr : meta.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* View Mode & Multi-Select Toolbar row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 md:w-24 shrink-0">{language === 'ar' ? 'طريقة العرض:' : 'View Mode:'}</span>
              <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/80 gap-1 flex-1 max-w-xs">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-brand-blue-650 dark:text-brand-blue-400 shadow-xs' : 'text-slate-400 dark:text-slate-550 hover:text-slate-600 dark:hover:text-slate-400'}`}
                  title="عرض الشبكة الكاملة"
                >
                  <LayoutGrid size={12} />
                  <span>{language === 'ar' ? 'الشبكة' : 'Grid'}</span>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-brand-blue-650 dark:text-brand-blue-405 shadow-xs' : 'text-slate-400 dark:text-slate-550 hover:text-slate-600 dark:hover:text-slate-400'}`}
                  title="عرض القائمة التفصيلية"
                >
                  <List size={12} />
                  <span>{language === 'ar' ? 'القائمة' : 'List'}</span>
                </button>
              </div>
            </div>

            {/* Quick multi-select activation toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isSelectionMode) {
                    handleExitSelectionMode();
                  } else {
                    setIsSelectionMode(true);
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                  isSelectionMode 
                    ? 'bg-brand-blue-600 border-brand-blue-500 text-white shadow-md shadow-brand-blue-600/25' 
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={language === 'ar' ? 'تفعيل وضع التحديد المتعدد (أو اضغط مطولاً على أي عجلة/مركبة)' : 'Toggle multi-select mode (or long-press any card)'}
              >
                <CheckSquare size={13} className={isSelectionMode ? 'text-white' : 'text-brand-blue-500'} />
                <span>{isSelectionMode ? (language === 'ar' ? 'إلغاء وضع التحديد' : 'Exit Multi-Select') : (language === 'ar' ? 'تحديد متعدد / حذف جماعي' : 'Multi-Select')}</span>
                {isSelectionMode && selectedVehicleIds.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-white text-brand-blue-700 rounded-full font-black text-[10px]">
                    {selectedVehicleIds.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Helper Banner when Multi-select Mode is active */}
      {isSelectionMode && (
        <div className="bg-brand-blue-500/10 border border-brand-blue-500/30 rounded-2xl p-3 px-4 flex items-center justify-between gap-3 text-xs text-brand-blue-800 dark:text-brand-blue-300">
          <div className="flex items-center gap-2 font-bold">
            <MousePointerClick size={16} className="text-brand-blue-600 dark:text-brand-blue-400 shrink-0" />
            <span>
              {language === 'ar' 
                ? 'وضع التحديد المتعدد مفعّل: انقر على أي عجلة/مركبة لتحديدها أو إلغاء تحديدها، ثم استخدم شريط التحكم بالأسفل للحذف الجماعي.' 
                : 'Multi-select mode active: Click any card to toggle selection, then use the bottom action bar for batch deletion.'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="px-3 py-1 bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-black text-[11px] rounded-lg transition-all shrink-0 cursor-pointer shadow-xs"
          >
            {selectedVehicleIds.length === filteredVehicles.length ? (language === 'ar' ? 'إلغاء تحديد الكل' : 'Deselect All') : (language === 'ar' ? 'تحديد الكل' : 'Select All')}
          </button>
        </div>
      )}

      {/* Vehicles Grid and List Dual-View Control */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredVehicles.map((vehicle) => {
            const totalCost = maintenanceOrders
              .filter(o => o.vehicleId === vehicle.id && o.status === 'completed')
              .reduce((sum, o) => sum + (o.cost || 0), 0);

            const nextMaint = getNextMaintenanceInfo(vehicle.id, vehicle.lastMaintenance);
            const isSelected = selectedVehicleIds.includes(vehicle.id);

            let statusColorLineStyle = 'border-r-[6px] border-r-emerald-500';
            if (vehicle.status === 'maintenance') {
              statusColorLineStyle = 'border-r-[6px] border-r-amber-500';
            } else if (vehicle.status === 'stopped') {
              statusColorLineStyle = 'border-r-[6px] border-r-rose-500';
            }

            return (
              <div 
                id={`vehicle-card-${vehicle.id}`}
                key={vehicle.id}
                onTouchStart={() => handlePressStart(vehicle.id)}
                onTouchEnd={handlePressEnd}
                onTouchMove={handlePressEnd}
                onMouseDown={(e) => {
                  if (e.button === 0) handlePressStart(vehicle.id);
                }}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onClick={(e) => {
                  if (isLongPressTriggeredRef.current) {
                    isLongPressTriggeredRef.current = false;
                    return;
                  }
                  if (isSelectionMode) {
                    e.stopPropagation();
                    toggleVehicleSelection(vehicle.id);
                  } else {
                    setSelectedVehicleForHistory(vehicle);
                  }
                }}
                className={`bg-white dark:bg-[#0f1422] rounded-2xl border p-3 sm:p-4 pb-3 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 select-none ${
                  isSelected 
                    ? 'ring-2 ring-brand-blue-500 border-brand-blue-500 bg-brand-blue-50/20 dark:bg-brand-blue-950/20 shadow-md' 
                    : 'border-slate-105 dark:border-slate-805/80'
                } ${expandedVehicleIds[vehicle.id] ? 'h-auto min-h-[420px]' : 'aspect-square'} ${statusColorLineStyle}`}
              >
                {/* Selection Checkbox indicator (Visible in selection mode or on hover) */}
                <div 
                  className={`absolute top-2.5 left-2.5 z-10 transition-all ${
                    isSelectionMode || isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-95'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelectionMode) setIsSelectionMode(true);
                    toggleVehicleSelection(vehicle.id);
                  }}
                  title={isSelected ? (language === 'ar' ? 'إلغاء التحديد' : 'Deselect') : (language === 'ar' ? 'تحديد' : 'Select')}
                >
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-brand-blue-600 text-white shadow-xs' 
                      : 'bg-white/95 dark:bg-slate-900/95 border border-slate-300 dark:border-slate-700 text-transparent hover:border-brand-blue-400 shadow-3xs'
                  }`}>
                    <Check size={12} strokeWidth={3} className={isSelected ? 'block' : 'hidden'} />
                  </div>
                </div>

                {/* Horizontal status line at top */}
                <div className={`absolute top-0 right-0 left-0 h-0.5 ${
                  vehicle.status === 'maintenance' ? 'bg-amber-500' : vehicle.status === 'stopped' ? 'bg-rose-500' : 'bg-emerald-500'
                }`} />

                <div className="space-y-1.5 flex-1 flex flex-col justify-between min-h-0">
                  {/* Top card info: Icon/Avatar + Name + Core badge */}
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-9.5 h-9.5 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 dark:bg-[#151c2e] dark:border-slate-850 shrink-0 shadow-xs flex items-center justify-center">
                        {vehicle.iconName && VEHICLE_ICONS[vehicle.iconName] ? (
                          (() => {
                             const iconConfig = VEHICLE_ICONS[vehicle.iconName];
                             const IconComp = iconConfig.component;
                             return (
                               <div className={`w-full h-full flex items-center justify-center ${iconConfig.bg}`}>
                                 <IconComp size={16} className={iconConfig.text} />
                               </div>
                             );
                          })()
                        ) : vehicle.image ? (
                          <img 
                            src={vehicle.image} 
                            alt={vehicle.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Truck size={14} className="text-slate-400" />
                        )}
                      </div>
                      
                      <div className="text-right flex-1 min-w-0">
                        <h3 className="text-[11px] sm:text-[12.5px] font-black text-slate-900 dark:text-white truncate group-hover:text-brand-blue-500 transition-colors leading-tight">
                          {vehicle.name}
                        </h3>
                        <div className="text-[8.5px] sm:text-[9.5px] text-slate-455 dark:text-slate-500 font-bold flex flex-wrap items-center gap-1 mt-0.5">
                          <span className="truncate">{vehicle.type}</span>
                          {(() => {
                            const cKey = getVehicleClassification(vehicle);
                            const cMeta = VEHICLE_CLASSIFICATIONS[cKey];
                            if (!cMeta) return null;
                            const ClassificationIcon = cMeta.icon;
                            return (
                              <span className={`inline-flex items-center gap-0.5 px-1 py-0.25 rounded text-[7.5px] font-black border uppercase shrink-0 ${cMeta.colorClass}`}>
                                <ClassificationIcon size={8} />
                                <span>{language === 'ar' ? cMeta.labelAr : cMeta.labelEn}</span>
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Quick QR code button on bento card */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVehicleForQr(vehicle);
                      }}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-[#151c2e] dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 border border-slate-100 dark:border-slate-850 transition-all cursor-pointer shadow-3xs shrink-0"
                      title={language === 'ar' ? 'عرض بطاقة ملصق QR للصيانة' : 'View Operational QR Pass'}
                    >
                      <QrCode size={12} />
                    </button>
                  </div>

                  {/* Info row with department & last maintenance date */}
                  <div className="flex items-center justify-between text-[8.5px] sm:text-[9.5px] font-bold text-slate-500 dark:text-slate-405 gap-1 border-t border-slate-50 dark:border-slate-850/40 pt-1.5">
                    <div className="flex items-center gap-0.5 min-w-0">
                      <MapPin size={10} className="text-slate-450 shrink-0" />
                      <span className="truncate">{vehicle.department}</span>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Calendar size={10} className="text-slate-450" />
                      <span>صنع {vehicle.modelYear || '2022'}</span>
                    </div>
                  </div>

                  {/* Plate Card styled as a gorgeous real plate */}
                  <div className="relative">
                    <div className="inline-flex bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black font-mono text-slate-800 dark:text-slate-200 tracking-wider text-center w-full justify-center items-center shadow-inner select-none h-6.5">
                      {vehicle.plateNumber}
                    </div>
                  </div>

                  {/* Status badges & Dynamic alert row */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <div className="bg-slate-50/70 dark:bg-slate-900/60 p-1 px-1.5 rounded-lg border border-slate-105/10 dark:border-slate-850">
                      <span className="text-[7.5px] sm:text-[8px] text-slate-405 block leading-tight font-bold">الحالة:</span>
                      <div className="mt-0.5 flex items-center scale-[0.78] origin-right">
                        <StatusBadge status={vehicle.status} />
                      </div>
                    </div>
                    <div className="bg-slate-50/70 dark:bg-[#131b31]/40 p-1 px-1.5 rounded-lg border border-slate-105/10 dark:border-slate-850">
                      <span className="text-[7.5px] sm:text-[8px] text-slate-405 block leading-tight font-bold">الكلفة:</span>
                      <div className="mt-0.5 text-[9.5px] sm:text-[10.5px] font-black text-brand-blue-600 dark:text-brand-blue-400 flex items-center gap-0.5">
                        <DollarSign size={9} className="w-1.5 h-1.5 shrink-0" />
                        <span>{totalCost.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="bg-amber-500/5 dark:bg-amber-500/10 p-1 px-1.5 rounded-lg border border-amber-500/10 dark:border-amber-500/20">
                      <span className="text-[7.5px] sm:text-[8px] text-amber-600 dark:text-amber-400 block leading-tight font-bold">وقود:</span>
                      <div className="mt-0.5 text-[9.5px] sm:text-[10.5px] font-black text-amber-700 dark:text-amber-500 flex items-center gap-0.5" dir="rtl">
                        <Fuel size={9} className="text-amber-550 shrink-0" />
                        <span className="truncate">{get30DayFuelData(vehicle.id)[29].value} لتر</span>
                      </div>
                    </div>
                    <div className="bg-brand-blue-500/5 dark:bg-brand-blue-500/10 p-1 px-1.5 rounded-lg border border-brand-blue-500/10 dark:border-brand-blue-500/20">
                      <span className="text-[7.5px] sm:text-[8px] text-brand-blue-600 dark:text-brand-blue-405 block leading-tight font-bold">الإطارات:</span>
                      <div className="mt-0.5 text-[9.5px] sm:text-[10.5px] font-black text-brand-blue-650 dark:text-brand-blue-400 flex items-center gap-0.5" dir="rtl">
                        <CircleDot size={9} className="text-brand-blue-500 shrink-0" />
                        <span className="truncate">{get30DayTireData(vehicle.id)[29].value} PSI</span>
                      </div>
                    </div>
                  </div>

                  {/* Next Scheduled Maintenance Alert */}
                  {nextMaint.isApproaching && (
                    <div className="bg-rose-50 dark:bg-rose-955/10 text-rose-600 dark:text-rose-455 p-1 px-1.5 rounded border border-rose-100/30 dark:border-rose-950/20 flex items-center justify-between text-[7.5px] sm:text-[8px] font-black leading-none shrink-0 border-r-[3px] border-r-rose-400">
                      <span className="flex items-center gap-0.5">
                        <span className="w-1 h-1 bg-rose-500 rounded-full animate-pulse" />
                        <span>الصيانة متبقي {nextMaint.daysRemaining} يوم</span>
                      </span>
                    </div>
                  )}

                  {/* Expanded inline maintenance status and details */}
                  <AnimatePresence>
                    {expandedVehicleIds[vehicle.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-right text-[11px] space-y-2 overflow-hidden w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-slate-800 dark:text-slate-200">
                              {language === 'ar' ? 'حالة آخر صيانة:' : 'Latest Maintenance Status:'}
                            </span>
                            {(() => {
                              const latest = getLatestMaintenanceOrderAndTech(vehicle.id);
                              if (!latest) {
                                return <span className="text-slate-450 dark:text-slate-500 font-bold">{language === 'ar' ? 'لا يوجد صيانة مسجلة' : 'No recorded orders'}</span>;
                              }
                              
                              let badgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
                              let label = language === 'ar' ? 'قيد الانتظار' : 'Pending';
                              if (latest.status === 'in-progress') {
                                badgeClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
                                label = language === 'ar' ? 'تحت العمل' : 'In Progress';
                              } else if (latest.status === 'completed') {
                                badgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
                                label = language === 'ar' ? 'مكتملة' : 'Completed';
                              }
                              return <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${badgeClass}`}>{label}</span>;
                            })()}
                          </div>

                          {(() => {
                            const latest = getLatestMaintenanceOrderAndTech(vehicle.id);
                            if (!latest) return null;
                            return (
                              <div className="space-y-1 text-[10.5px]">
                                <div className="flex justify-between text-slate-500 dark:text-slate-400 font-bold">
                                  <span>{language === 'ar' ? 'رقم الطلب:' : 'Order No:'}</span>
                                  <span className="font-mono text-slate-700 dark:text-slate-300">{latest.orderNumber}</span>
                                </div>
                                <div className="flex justify-between text-slate-500 dark:text-slate-400 font-bold">
                                  <span>{language === 'ar' ? 'تاريخ البدء:' : 'Start Date:'}</span>
                                  <span className="font-mono text-slate-700 dark:text-slate-300">{latest.date}</span>
                                </div>
                                <div className="text-slate-750 dark:text-slate-300 mt-1 p-1 px-1.5 bg-white dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 font-bold">
                                  <span className="text-slate-400 text-[9px] block mb-0.5">{language === 'ar' ? 'الوصف الفني للمشكلة/العمل:' : 'Work Description:'}</span>
                                  {latest.description}
                                </div>
                                {latest.techName && (
                                  <div className="flex justify-between text-slate-550 dark:text-slate-400 font-bold pt-1 border-t border-slate-100/40 dark:border-slate-800/40">
                                    <span>{language === 'ar' ? 'الفني المسؤول:' : 'Technician:'}</span>
                                    <span className="text-brand-blue-600 dark:text-brand-blue-405">{latest.techName}</span>
                                  </div>
                                )}
                                {latest.cost && (
                                  <div className="flex justify-between text-slate-550 dark:text-slate-400 font-bold">
                                    <span>{language === 'ar' ? 'التكلفة الإجمالية:' : 'Total Cost:'}</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-black">{latest.cost.toLocaleString()} $</span>
                                  </div>
                                )}
                                {latest.partsUsed && latest.partsUsed.length > 0 && (
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold pt-1">
                                    <span>{language === 'ar' ? 'قطع الغيار المستخدمة:' : 'Parts Used:'}</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {latest.partsUsed.map((part: string, i: number) => (
                                        <span key={i} className="px-1.5 py-0.5 bg-slate-200/50 dark:bg-slate-800 text-[9px] rounded text-slate-600 dark:text-slate-400">
                                          {part}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Additional health specs */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                          <div className="bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                            <span className="text-slate-400 block mb-0.5">{language === 'ar' ? 'نوع الوقود:' : 'Fuel:'}</span>
                            <span className="text-slate-750 dark:text-slate-300">{vehicle.fuelType === 'diesel' ? (language === 'ar' ? 'ديزل' : 'Diesel') : (language === 'ar' ? 'بنزين' : 'Gasoline')}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                            <span className="text-slate-400 block mb-0.5">{language === 'ar' ? 'الحمولة القصوى:' : 'Capacity:'}</span>
                            <span className="text-slate-750 dark:text-slate-300 truncate">{vehicle.loadingCapacity || 'N/A'}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                            <span className="text-slate-400 block mb-0.5">{language === 'ar' ? 'رقم الهيكل (الشاصيه):' : 'Chassis No:'}</span>
                            <span className="text-slate-750 dark:text-slate-300 font-mono truncate">{vehicle.chassisNumber || 'N/A'}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                            <span className="text-slate-400 block mb-0.5">{language === 'ar' ? 'تأمين المركبة حتى:' : 'Insurance:'}</span>
                            <span className="text-slate-750 dark:text-slate-300 font-mono text-[9px] truncate">{vehicle.insuranceExpiry || 'N/A'}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer Details CTA & Admin Controls */}
                <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-850/40 pt-1.5 mt-1.5 self-end w-full shrink-0 gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(vehicle.id, e)}
                      className="p-1 px-1.5 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/20 dark:hover:bg-violet-955/40 text-violet-700 dark:text-violet-400 text-[8.5px] font-extrabold rounded-md transition-all flex items-center gap-0.5 cursor-pointer border border-violet-100/30 shrink-0"
                      title={expandedVehicleIds[vehicle.id] ? "تقليص التفاصيل" : "توسيع تفاصيل الصيانة"}
                    >
                      <ChevronDown size={10} className={`transform transition-transform duration-200 ${expandedVehicleIds[vehicle.id] ? 'rotate-180' : ''}`} />
                      <span>{expandedVehicleIds[vehicle.id] ? (language === 'ar' ? 'تقليص' : 'Collapse') : (language === 'ar' ? 'توسيع' : 'Expand')}</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVehicleForQr(vehicle);
                      }}
                      className="p-1 px-1.5 bg-brand-blue-50/80 hover:bg-brand-blue-100 dark:bg-brand-blue-900/20 text-brand-blue-650 dark:text-brand-blue-400 text-[8.5px] font-extrabold rounded-md transition-all flex items-center gap-0.5 cursor-pointer border border-brand-blue-100/30 shrink-0"
                      title="تحميل وطباعة ملصق الرمز السريع QR للمركبة"
                    >
                      <QrCode size={10} className="shrink-0" />
                      <span>كود QR</span>
                    </button>
                  </div>

                  {(user.role === 'admin' || (user.role as string) === 'fleet_manager' || hasGranularPermission('edit-vehicle-data', user.role) || (user.role as string) !== 'viewer') && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVehicle(vehicle.id, vehicle.name, vehicle.plateNumber, vehicle.type);
                      }}
                      className="p-1 px-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/15 text-rose-500 hover:text-rose-600 text-[8.5px] font-extrabold rounded-md transition-all flex items-center gap-0.5 cursor-pointer border border-rose-100/50 dark:border-rose-955/35"
                      title={language === 'ar' ? 'حذف الآلية نهائياً' : 'Delete asset'}
                    >
                      <Trash2 size={9} className="shrink-0" />
                      <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Highly Optimized, Polished list/table view for clarity and high definition */
        <div className="bg-white dark:bg-[#0f1422] rounded-[1.5rem] border border-slate-150 dark:border-slate-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-55/70 dark:bg-slate-950/70 border-b border-slate-150 dark:border-slate-800/80 text-slate-450 dark:text-slate-400 text-[11.5px] font-black tracking-wide">
                  <th className="py-4 px-3 text-center font-black w-10">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="p-1 rounded-md text-slate-400 hover:text-brand-blue-600 transition-colors cursor-pointer"
                      title={language === 'ar' ? 'تحديد / إلغاء تحديد الكل' : 'Select / Deselect all'}
                    >
                      {selectedVehicleIds.length === filteredVehicles.length && filteredVehicles.length > 0 ? (
                        <CheckSquare size={16} className="text-brand-blue-600 dark:text-brand-blue-400" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-5 text-right font-black">المركبة والمواصفات الأساسية</th>
                  <th className="py-4 px-5 text-right font-black">رقم اللوحة المعتمد</th>
                  <th className="py-4 px-4 text-right font-black">تبعية القسم الفنية</th>
                  <th className="py-4 px-4 text-center font-black">استهلاك الوقود</th>
                  <th className="py-4 px-4 text-center font-black">ضغط الإطارات</th>
                  <th className="py-4 px-3 text-center font-black">حالة الأسطول التشغيلية</th>
                  <th className="py-4 px-3 text-center font-black">إجمالي نفقات الصيانة</th>
                  <th className="py-4 px-4 text-center font-black">الموعد المستقبلي القادم</th>
                  <th className="py-4 px-5 text-center font-black">تفصيل السجلات الفنية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-bold font-mono">
                      لا يوجد مركبات تطابق معايير وثوابت البحث الحالية.
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((vehicle) => {
                    const totalCost = maintenanceOrders
                      .filter(o => o.vehicleId === vehicle.id && o.status === 'completed')
                      .reduce((sum, o) => sum + (o.cost || 0), 0);
                    const nextMaint = getNextMaintenanceInfo(vehicle.id, vehicle.lastMaintenance);
                    const isSelected = selectedVehicleIds.includes(vehicle.id);

                    let statusLineStyle = 'border-r-[6px] border-r-emerald-500 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10';
                    if (vehicle.status === 'maintenance') {
                      statusLineStyle = 'border-r-[6px] border-r-amber-500 hover:bg-amber-500/5 dark:hover:bg-amber-500/10';
                    } else if (vehicle.status === 'stopped') {
                      statusLineStyle = 'border-r-[6px] border-r-rose-500 hover:bg-rose-500/5 dark:hover:bg-rose-500/10';
                    }

                    return (
                      <React.Fragment key={vehicle.id}>
                        <tr 
                          onTouchStart={() => handlePressStart(vehicle.id)}
                          onTouchEnd={handlePressEnd}
                          onTouchMove={handlePressEnd}
                          onMouseDown={(e) => {
                            if (e.button === 0) handlePressStart(vehicle.id);
                          }}
                          onMouseUp={handlePressEnd}
                          onMouseLeave={handlePressEnd}
                          onClick={(e) => {
                            if (isLongPressTriggeredRef.current) {
                              isLongPressTriggeredRef.current = false;
                              return;
                            }
                            if (isSelectionMode) {
                              e.stopPropagation();
                              toggleVehicleSelection(vehicle.id);
                            } else {
                              setSelectedVehicleForHistory(vehicle);
                            }
                          }}
                          className={`transition-all duration-200 cursor-pointer group select-none ${
                            isSelected 
                              ? 'bg-brand-blue-50/60 dark:bg-brand-blue-950/40 ring-1 ring-brand-blue-400/40' 
                              : 'hover:bg-indigo-50/40 dark:hover:bg-slate-800/40'
                          } ${statusLineStyle}`}
                        >
                          {/* Selection Checkbox */}
                          <td className="py-4.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                if (!isSelectionMode) setIsSelectionMode(true);
                                toggleVehicleSelection(vehicle.id);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-brand-blue-600 transition-colors cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare size={16} className="text-brand-blue-600 dark:text-brand-blue-400" />
                              ) : (
                                <Square size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400" />
                              )}
                            </button>
                          </td>

                          {/* Vehicle Identity */}
                          <td className="py-4.5 px-5">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={(e) => toggleExpand(vehicle.id, e)}
                                className="p-1.5 text-slate-400 hover:text-slate-605 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer shrink-0"
                                title={expandedVehicleIds[vehicle.id] ? "تقليص التفاصيل" : "توسيع تفاصيل الصيانة"}
                              >
                                <ChevronDown size={14} className={`transform transition-transform duration-200 ${expandedVehicleIds[vehicle.id] ? 'rotate-180' : ''}`} />
                              </button>

                              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-50 dark:bg-slate-950 border border-slate-100/60 dark:border-slate-800/80 flex items-center justify-center">
                              {vehicle.iconName && VEHICLE_ICONS[vehicle.iconName] ? (
                                (() => {
                                  const iconConfig = VEHICLE_ICONS[vehicle.iconName];
                                  const IconComp = iconConfig.component;
                                  return (
                                    <div className={`w-full h-full flex items-center justify-center ${iconConfig.bg}`}>
                                      <IconComp size={16} className={iconConfig.text} />
                                    </div>
                                  );
                                })()
                              ) : vehicle.image ? (
                                <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <Truck size={15} className="text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-black text-slate-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors leading-normal">
                                {vehicle.name}
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                                {(() => {
                                  const cKey = getVehicleClassification(vehicle);
                                  const cMeta = VEHICLE_CLASSIFICATIONS[cKey];
                                  if (!cMeta) return null;
                                  const ClassificationIcon = cMeta.icon;
                                  return (
                                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.25 rounded text-[8px] font-black border uppercase shrink-0 ${cMeta.colorClass}`}>
                                      <ClassificationIcon size={8} />
                                      <span>{language === 'ar' ? cMeta.labelAr : cMeta.labelEn}</span>
                                    </span>
                                  );
                                })()}
                                <span>{vehicle.type} • صنع {vehicle.modelYear || '2022'} • {vehicle.tireCount || 4} عجلات ({vehicle.tireStatus || 'ممتاز'})</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* License Plate Plate */}
                        <td className="py-4.5 px-5">
                          <span className="inline-block bg-slate-900/5 dark:bg-slate-950/80 border border-slate-105 dark:border-slate-800 px-3 py-1 rounded-xl text-[11px] font-black font-mono text-slate-905 dark:text-slate-150 tracking-widest bg-clip-border">
                            {vehicle.plateNumber}
                          </span>
                        </td>

                        {/* Department info */}
                        <td className="py-4.5 px-4">
                          <div className="text-xs font-black text-slate-800 dark:text-slate-200">{vehicle.department}</div>
                          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">{vehicle.subDepartment}</div>
                        </td>

                        {/* Fuel Consumption Column */}
                        <td className="py-4 px-4 text-center text-xs">
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 text-amber-650 dark:text-amber-400 font-black">
                            <Fuel size={11} className="text-amber-550 shrink-0" />
                            <span>{get30DayFuelData(vehicle.id)[29].value} لتر/يوم</span>
                          </div>
                        </td>

                        {/* Tire Pressure Column */}
                        <td className="py-4 px-4 text-center text-xs">
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-brand-blue-500/5 dark:bg-brand-blue-500/10 border border-brand-blue-500/15 text-brand-blue-600 dark:text-brand-blue-400 font-black">
                            <CircleDot size={10} className="text-brand-blue-500 shrink-0" />
                            <span>{get30DayTireData(vehicle.id)[29].value} PSI</span>
                          </div>
                        </td>

                        {/* Status badges */}
                        <td className="py-4.5 px-3 text-center">
                          <div className="inline-flex justify-center">
                            <StatusBadge status={vehicle.status} />
                          </div>
                        </td>

                        {/* Approved Cost Spendings */}
                        <td className="py-4.5 px-3 text-center">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                            <DollarSign size={10} className="shrink-0" />
                            <span>{totalCost.toLocaleString()}</span>
                          </div>
                        </td>

                        {/* Warning/Schedule */}
                        <td className="py-4.5 px-4 text-center">
                          {nextMaint.isApproaching ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-450 text-[9px] font-extrabold border border-rose-500/15 animate-pulse">
                                مستحق الصيانة
                              </span>
                              <span className="text-[8.5px] font-black text-rose-500 mt-0.5 font-mono">متبقي {nextMaint.daysRemaining} يوم</span>
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-center">
                              <span className="text-xs font-black text-slate-700 dark:text-slate-300 font-mono">{nextMaint.date}</span>
                              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 mt-0.5">مجدولة اعتيادي</span>
                            </div>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-4.5 px-5 text-center">
                          <div className="inline-flex justify-center items-center gap-2">
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVehicleForHistory(vehicle);
                              }}
                              className="px-3.5 py-1.5 bg-brand-blue-50 hover:bg-brand-blue-100 dark:bg-brand-blue-900/30 dark:hover:bg-brand-blue-900/50 text-brand-blue-700 dark:text-brand-blue-300 font-extrabold text-[10.5px] rounded-xl transition-all border border-brand-blue-100 dark:border-brand-blue-900/40 cursor-pointer"
                            >
                              تفاصيل السجلات كاملة
                            </button>

                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedVehicleForQr(vehicle);
                              }}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-955/40 text-amber-700 dark:text-amber-400 font-extrabold text-[10.5px] rounded-xl transition-all border border-amber-150 dark:border-amber-900/30 cursor-pointer flex items-center gap-1 shrink-0"
                              title="توليد وتنزيل رمز الصيانة QR للمركبة"
                            >
                              <QrCode size={12} />
                              <span>رمز QR</span>
                            </button>

                            {(user.role === 'admin' || (user.role as string) === 'fleet_manager' || hasGranularPermission('edit-vehicle-data', user.role) || (user.role as string) !== 'viewer') && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteVehicle(vehicle.id, vehicle.name, vehicle.plateNumber, vehicle.type);
                                }}
                                className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-500 hover:text-rose-600 rounded-xl transition-all border border-rose-100/50 dark:border-rose-955/35 cursor-pointer"
                                title={language === 'ar' ? 'حذف الآلية نهائياً' : 'Delete asset'}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {expandedVehicleIds[vehicle.id] && (
                        <tr className="bg-slate-50/50 dark:bg-[#111727]/40 border-b border-slate-100 dark:border-slate-800/60">
                          <td colSpan={10} className="py-4 px-6 text-right">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                              {/* Column 1: Last Maintenance Details */}
                              <div className="space-y-2 bg-white dark:bg-[#0c101d] p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
                                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/60 pb-2">
                                  <span className="font-black text-xs text-slate-800 dark:text-slate-200">
                                    {language === 'ar' ? 'تفاصيل آخر صيانة مجدولة:' : 'Latest Scheduled Maintenance:'}
                                  </span>
                                  {(() => {
                                    const latest = getLatestMaintenanceOrderAndTech(vehicle.id);
                                    if (!latest) {
                                      return <span className="text-[10px] text-slate-400 font-bold">{language === 'ar' ? 'لا يوجد صيانة مسجلة' : 'No recorded orders'}</span>;
                                    }
                                    let badgeClass = 'bg-amber-550/10 text-amber-600 dark:text-amber-400';
                                    let label = language === 'ar' ? 'قيد الانتظار' : 'Pending';
                                    if (latest.status === 'in-progress') {
                                      badgeClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
                                      label = language === 'ar' ? 'تحت العمل' : 'In Progress';
                                    } else if (latest.status === 'completed') {
                                      badgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
                                      label = language === 'ar' ? 'مكتملة' : 'Completed';
                                    }
                                    return <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${badgeClass}`}>{label}</span>;
                                  })()}
                                </div>

                                {(() => {
                                  const latest = getLatestMaintenanceOrderAndTech(vehicle.id);
                                  if (!latest) return <div className="text-slate-450 text-xs py-2">{language === 'ar' ? 'لم يتم تسجيل أي عمليات صيانة لهذه المركبة بعد.' : 'No maintenance recorded for this vehicle yet.'}</div>;
                                  return (
                                    <div className="space-y-1.5 text-xs">
                                      <div className="flex justify-between text-slate-500 dark:text-slate-400 font-bold">
                                        <span>{language === 'ar' ? 'رقم أمر العمل:' : 'Work Order:'}</span>
                                        <span className="font-mono text-slate-700 dark:text-slate-300">{latest.orderNumber}</span>
                                      </div>
                                      <div className="flex justify-between text-slate-500 dark:text-slate-400 font-bold">
                                        <span>{language === 'ar' ? 'تاريخ البدء:' : 'Start Date:'}</span>
                                        <span className="font-mono text-slate-700 dark:text-slate-300">{latest.date}</span>
                                      </div>
                                      {latest.techName && (
                                        <div className="flex justify-between text-slate-500 dark:text-slate-400 font-bold">
                                          <span>{language === 'ar' ? 'الفني المختص:' : 'Assigned Tech:'}</span>
                                          <span className="text-brand-blue-600 dark:text-brand-blue-400 font-black">{latest.techName}</span>
                                        </div>
                                      )}
                                      {latest.cost && (
                                        <div className="flex justify-between text-slate-500 dark:text-slate-400 font-bold">
                                          <span>{language === 'ar' ? 'التكلفة الإجمالية:' : 'Total Cost:'}</span>
                                          <span className="text-emerald-600 dark:text-emerald-400 font-black">{latest.cost.toLocaleString()} $</span>
                                        </div>
                                      )}
                                      <div className="text-slate-750 dark:text-slate-300 mt-1.5 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/85 font-medium text-[11px] leading-relaxed">
                                        <span className="text-slate-400 text-[9px] font-black block mb-0.5">{language === 'ar' ? 'الوصف الفني الكامل:' : 'Full Technical Description:'}</span>
                                        {latest.description}
                                      </div>
                                      {latest.partsUsed && latest.partsUsed.length > 0 && (
                                        <div className="text-[11px] text-slate-500 dark:text-slate-405 font-bold pt-1.5">
                                          <span>{language === 'ar' ? 'قطع الغيار المستهلكة:' : 'Parts Consumed:'}</span>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {latest.partsUsed.map((part: string, i: number) => (
                                              <span key={i} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded text-slate-600 dark:text-slate-400 font-semibold">
                                                {part}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Column 2: Advanced Technical Specs */}
                              <div className="space-y-2.5 bg-white dark:bg-[#0c101d] p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
                                <div className="font-black text-xs text-slate-800 dark:text-slate-200 border-b border-slate-50 dark:border-slate-800/60 pb-2">
                                  {language === 'ar' ? 'مواصفات المركبة الهيكلية والتأمين:' : 'Chassis Specs & Insurance:'}
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                                  <div className="p-2 bg-slate-50/60 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between min-h-[58px]">
                                    <div>
                                      <span className="text-slate-400 block mb-0.5 text-[10px]">{language === 'ar' ? 'رقم الهيكل (الشاصيه):' : 'Chassis Number:'}</span>
                                      {editingVehicleId === vehicle.id ? (
                                        <input
                                          type="text"
                                          value={tempChassisValue}
                                          onChange={(e) => setTempChassisValue(e.target.value)}
                                          className="text-xs font-mono p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-900 dark:text-white rounded-lg w-full outline-none focus:border-brand-blue-500"
                                        />
                                      ) : (
                                        <span className="text-slate-750 dark:text-slate-300 font-mono text-[11px] truncate block">{vehicle.chassisNumber || 'N/A'}</span>
                                      )}
                                    </div>
                                    {hasGranularPermission('edit-vehicle-data', user.role) && (
                                      <div className="mt-1 flex justify-end gap-1">
                                        {editingVehicleId === vehicle.id ? (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => handleSaveChassis(vehicle.id)}
                                              className="text-[9px] px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded cursor-pointer"
                                            >
                                              {language === 'ar' ? 'حفظ' : 'Save'}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setEditingVehicleId(null)}
                                              className="text-[9px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded cursor-pointer"
                                            >
                                              {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                            </button>
                                          </>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingVehicleId(vehicle.id);
                                              setTempChassisValue(vehicle.chassisNumber || '');
                                            }}
                                            className="text-[9px] text-brand-blue-600 dark:text-brand-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer font-black"
                                          >
                                            <Edit size={10} />
                                            <span>{language === 'ar' ? 'تعديل البيانات' : 'Edit'}</span>
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-2 bg-slate-50/60 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                                    <span className="text-slate-400 block mb-0.5 text-[10px]">{language === 'ar' ? 'نوع الوقود:' : 'Fuel Type:'}</span>
                                    <span className="text-slate-750 dark:text-slate-300 block">{vehicle.fuelType === 'diesel' ? (language === 'ar' ? 'ديزل' : 'Diesel') : (language === 'ar' ? 'بنزين' : 'Gasoline')}</span>
                                  </div>
                                  <div className="p-2 bg-slate-50/60 dark:bg-slate-950 rounded-xl border border-slate-105 dark:border-slate-850">
                                    <span className="text-slate-400 block mb-0.5 text-[10px]">{language === 'ar' ? 'الحمولة القصوى:' : 'Max Payload Capacity:'}</span>
                                    <span className="text-slate-750 dark:text-slate-300 block truncate">{vehicle.loadingCapacity || 'N/A'}</span>
                                  </div>
                                  <div className="p-2 bg-slate-50/60 dark:bg-slate-950 rounded-xl border border-slate-105 dark:border-slate-850">
                                    <span className="text-slate-400 block mb-0.5 text-[10px]">{language === 'ar' ? 'انتهاء رخصة التأمين:' : 'Insurance Expiry:'}</span>
                                    <span className="text-slate-750 dark:text-slate-300 font-mono text-[11px] block">{vehicle.insuranceExpiry || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Column 3: Maintenance Metrics & Next Alert */}
                              <div className="space-y-3 bg-white dark:bg-[#0c101d] p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
                                <div>
                                  <div className="font-black text-xs text-slate-800 dark:text-slate-200 border-b border-slate-50 dark:border-slate-800/60 pb-2">
                                    {language === 'ar' ? 'مؤشرات الصيانة الوقائية والتحذيرات:' : 'Preventative Indicators & Alerts:'}
                                  </div>
                                  <div className="mt-2.5 space-y-2 text-xs font-semibold">
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-500 dark:text-slate-405">{language === 'ar' ? 'تاريخ آخر فحص دوري:' : 'Last Inspection Date:'}</span>
                                      <span className="font-mono text-slate-700 dark:text-slate-300">{vehicle.lastMaintenance}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-500 dark:text-slate-405">{language === 'ar' ? 'ضغط الإطارات المناسب:' : 'Target Tire Pressure:'}</span>
                                      <span className="text-brand-blue-600 dark:text-brand-blue-400 font-black">36-38 PSI</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3">
                                  {nextMaint.isApproaching ? (
                                    <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                                      <div className="font-black flex items-center gap-1.5 mb-1">
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                                        <span>{language === 'ar' ? 'تنبيه: صيانة عاجلة مقتربة' : 'Alert: Upcoming Maintenance'}</span>
                                      </div>
                                      <p className="text-[11px] font-medium leading-relaxed">
                                        {language === 'ar' 
                                          ? `المركبة بحاجة لصيانة وقائية خلال ${nextMaint.daysRemaining} أيام لتفادي تدهور الكفاءة.`
                                          : `Vehicle requires preventative check within ${nextMaint.daysRemaining} days to preserve operating condition.`}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
                                      <div className="font-black flex items-center gap-1.5 mb-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                        <span>{language === 'ar' ? 'الحالة التشغيلية ممتازة' : 'Excellent Status'}</span>
                                      </div>
                                      <p className="text-[11px] font-medium leading-relaxed">
                                        {language === 'ar' 
                                          ? 'جميع المؤشرات ومستويات القياس طبيعية ولا توجد إجراءات وقائية مطلوبة حالياً.'
                                          : 'All parameters, systems, and metrics are normal. No immediate action required.'}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Multi-step Professional Add Vehicle Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-blue-50 dark:bg-brand-blue-900/30 text-brand-blue-600 dark:text-brand-blue-400 rounded-xl flex items-center justify-center">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">إضافة مركبة / معدة جديدة للمجموع</h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">إدخال المواصفات الكاملة للمركبة ونظام الإطارات والبيانات المعتمدة</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setCurrentStep(1);
                  }}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-xl transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Progress Steps Indicator */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-around text-xs">
                <button 
                  onClick={() => currentStep > 1 && setCurrentStep(1)}
                  className={`flex items-center gap-2 font-black transition-all ${currentStep === 1 ? 'text-brand-blue-600 dark:text-brand-blue-400 scale-[102%]' : 'text-slate-400'}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${currentStep === 1 ? 'bg-brand-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>1</span>
                  <span>البيانات الأساسية والصورة</span>
                </button>
                <div className="flex-1 h-[2px] bg-slate-200 dark:bg-slate-800 mx-4 max-w-[50px]" />
                <button 
                  onClick={() => currentStep > 2 && setCurrentStep(2)}
                  className={`flex items-center gap-2 font-black transition-all ${currentStep === 2 ? 'text-brand-blue-600 dark:text-brand-blue-400 scale-[102%]' : 'text-slate-400'}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${currentStep === 2 ? 'bg-brand-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>2</span>
                  <span>المواصفات الفنية للتشغيل</span>
                </button>
                <div className="flex-1 h-[2px] bg-slate-200 dark:bg-slate-800 mx-4 max-w-[50px]" />
                <button 
                  onClick={() => currentStep > 3 && setCurrentStep(3)}
                  className={`flex items-center gap-2 font-black transition-all ${currentStep === 3 ? 'text-brand-blue-600 dark:text-brand-blue-400 scale-[102%]' : 'text-slate-400'}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${currentStep === 3 ? 'bg-brand-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>3</span>
                  <span>بيانات العجلات والإطارات</span>
                </button>
              </div>

              {/* Form Content Steps */}
              <form onSubmit={handleSaveVehicle} className="flex-1 overflow-y-auto p-6 max-h-[60vh] space-y-5">
                
                {currentStep === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">اسم المركبة / الطراز *</label>
                        <input 
                          type="text" 
                          placeholder="مثال: شاحنة فولفو FH16" 
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full p-2.5 bg-slate-50 dark:bg-slate-950 border ${formErrors.name ? 'border-brand-red-400' : 'border-slate-105 dark:border-slate-800'} rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-brand-blue-100 outline-none transition-all text-xs font-medium dark:text-white`}
                        />
                        {formErrors.name && <span className="text-[10px] text-brand-red-500 font-bold mt-1 block">{formErrors.name}</span>}
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">رقم لوحة المركبة *</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="مثال: أ ب ج 1234" 
                            value={formData.plateNumber}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData(prev => ({ ...prev, plateNumber: val }));
                              setFormErrors(prev => {
                                const next = { ...prev };
                                if (!val.trim()) {
                                  next.plateNumber = 'رقم لوحة المركبة مطلوب';
                                } else {
                                  const isDuplicate = vehicleList.some(v => v.plateNumber.trim().toLowerCase() === val.trim().toLowerCase());
                                  if (isDuplicate) {
                                    next.plateNumber = 'رقم لوحة المركبة هذا مكرر ومسجل بالفعل!';
                                  } else {
                                    delete next.plateNumber;
                                  }
                                }
                                return next;
                              });
                            }}
                            className={`w-full p-2.5 pl-10 bg-slate-50 dark:bg-slate-950 border ${
                              isPlateDuplicate || formErrors.plateNumber ? 'border-rose-500 focus:ring-rose-200' : 
                              formData.plateNumber.trim() ? 'border-emerald-500 focus:ring-emerald-100' : 'border-slate-105 dark:border-slate-800'
                            } rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 outline-none transition-all text-xs font-semibold dark:text-white`}
                          />
                          {formData.plateNumber.trim() !== '' && (
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold">
                              {isPlateDuplicate ? (
                                <span className="text-rose-500" title="مكرر ❌">❌</span>
                              ) : (
                                <span className="text-emerald-500" title="متاح ✓">✓</span>
                              )}
                            </span>
                          )}
                        </div>
                        {isPlateDuplicate ? (
                          <span className="text-[10px] text-rose-500 font-extrabold mt-1 block animate-pulse">
                            ⚠️ تنبيه: رقم اللوحة مسجل مسبقاً بالنظام لمركبة أخرى! يرجى التحقق.
                          </span>
                        ) : formErrors.plateNumber ? (
                          <span className="text-[10px] text-rose-500 font-bold mt-1 block">{formErrors.plateNumber}</span>
                        ) : formData.plateNumber.trim() !== '' ? (
                          <span className="text-[10px] text-emerald-500 font-bold mt-1 block">
                            ✓ رقم اللوحة متاح وجاهز للتسجيل.
                          </span>
                        ) : null}
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">تصنيف نوع المركبة</label>
                        <select 
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-800 outline-none text-xs font-bold dark:text-white"
                        >
                          <option value="مركبة خفيفة">مركبة خفيفة</option>
                          <option value="معدة ثقيلة">معدة ثقيلة</option>
                          <option value="نقل جماعي">نقل جماعي</option>
                          <option value="معدة هندسية">معدة هندسية</option>
                          <option value="سيارة إسعاف وطوارئ">سيارة إسعاف وطوارئ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">{language === 'ar' ? 'التصنيف المجموعي للمركبة' : 'Vehicle Group Classification'}</label>
                        <select 
                          value={formData.classification}
                          onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-800 outline-none text-xs font-bold dark:text-white"
                        >
                          {Object.entries(VEHICLE_CLASSIFICATIONS).map(([key, meta]) => (
                            <option key={key} value={key}>
                              {language === 'ar' ? meta.labelAr : meta.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">الحالة التشغيلية الحالية</label>
                        <select 
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-800 outline-none text-xs font-bold dark:text-white"
                        >
                          <option value="active">فعالة (Active)</option>
                          <option value="maintenance">تحت الصيانة (Under Maintenance)</option>
                          <option value="stopped">متوقفة بالكامل (Stopped)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">القسم المسؤول</label>
                        <input 
                          type="text" 
                          placeholder="مثال: قسم الآليات والنقليات" 
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-800 outline-none text-xs font-medium dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">الشعبة الفرعية</label>
                        <input 
                          type="text" 
                          placeholder="مثال: شعبة الصيانة السريعة" 
                          value={formData.subDepartment}
                          onChange={(e) => setFormData({ ...formData, subDepartment: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-800 outline-none text-xs font-medium dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Display Representation Mode Selector */}
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300">طريقة العرض والتمييز الفني للمركبة:</label>
                      <div className="bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, iconName: 'truck', image: '' }));
                          }}
                          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                            formData.iconName
                              ? 'bg-white dark:bg-slate-800 text-brand-blue-600 dark:text-brand-blue-400 shadow-sm'
                              : 'text-slate-450 dark:text-slate-500'
                          }`}
                        >
                          أيقونة مخصصة (موحدة ومنظمة)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, iconName: '', image: '' }));
                          }}
                          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                            !formData.iconName
                              ? 'bg-white dark:bg-slate-800 text-brand-blue-600 dark:text-brand-blue-400 shadow-sm'
                              : 'text-slate-450 dark:text-slate-500'
                          }`}
                        >
                          تحميل صورة أو اختيار مقترح
                        </button>
                      </div>
                    </div>

                    {/* Image Upload Component or Icon Grid */}
                    <div>
                      {formData.iconName ? (
                        <div className="space-y-3">
                          <label className="block text-xs font-black text-slate-705 dark:text-slate-300">اختر الأيقونة الفنية المعبرة للمركبة:</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {Object.entries(VEHICLE_ICONS).map(([key, iconConfig]) => {
                              const IconC = iconConfig.component;
                              const isSelected = formData.iconName === key;
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, iconName: key }))}
                                  className={`p-4 rounded-2xl border transition-all text-right flex flex-col items-center justify-center gap-2 cursor-pointer ${
                                    isSelected
                                      ? 'border-brand-blue-500 bg-brand-blue-50/50 dark:bg-brand-blue-900/30 scale-[102%] shadow-sm'
                                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-slate-200'
                                  }`}
                                >
                                  <div className={`p-3 rounded-xl ${iconConfig.bg}`}>
                                    <IconC size={22} className={iconConfig.text} />
                                  </div>
                                  <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 text-center">{iconConfig.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">صورة المركبة / المعدة الفنية</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Drag and drop Area */}
                            <div 
                              onDragOver={handleDragOver}
                              onDrop={handleDrop}
                              onClick={() => fileInputRef.current?.click()}
                              className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-blue-500 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/30 cursor-pointer text-center group transition-colors"
                            >
                              <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef} 
                                onChange={handleFileChange}
                                className="hidden" 
                              />
                              <Upload className="text-slate-400 group-hover:text-brand-blue-500 transition-colors mb-2" size={24} />
                              <p className="text-xs font-black text-slate-900 dark:text-slate-200">اسحب وأفلت صورة المركبة هنا</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">أو انقر لتصفح ملفات جهازك المحلي</p>
                            </div>
                            
                            {/* Image Preview or Presets Select */}
                            <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-4 bg-slate-50/30 dark:bg-slate-950/20 flex flex-col gap-3 justify-center">
                              {formData.image ? (
                                <div className="relative h-28 rounded-xl overflow-hidden border border-slate-150 dark:border-slate-800">
                                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                  <button 
                                    type="button" 
                                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 block">أو اختر من المعرض المقترح للمركبات:</span>
                                  <div className="grid grid-cols-2 gap-2">
                                    {PRESET_IMAGES.map((preset, index) => (
                                      <button 
                                        key={index}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, image: preset.url }))}
                                        className="px-2 py-1 bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded border border-slate-100 dark:border-slate-700 hover:border-brand-blue-500 transition-colors text-right truncate cursor-pointer"
                                      >
                                        {preset.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      )}
                    </div>

                    {/* Barcode Generator Card */}
                    <div className="bg-slate-55 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-150 dark:border-slate-800/80 mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <QrCode className="text-brand-blue-500" size={16} />
                          <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">ملصق الباركود التعريفي المخصص للطباعة</h4>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-slate-900/60 px-2 py-0.5 rounded-full">نظام ترميز الأصول</span>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-[#0f1422] p-4 rounded-xl border border-slate-150/50 dark:border-slate-800/60 shadow-xs">
                        {/* Live barcode render */}
                        <div className="bg-white p-3 border border-slate-200 rounded-xl flex flex-col items-center select-none shadow-xs shrink-0">
                          <span className="text-[8px] text-slate-500 font-bold mb-1 tracking-wider leading-none">MECHANIC-360 ASSET TAG</span>
                          <div className="flex gap-[1.2px] h-[34px] items-center px-1 overflow-hidden">
                            {Array.from({ length: 22 }).map((_, i) => {
                              const charCode = (formData.plateNumber || 'M-360').charCodeAt(i % (formData.plateNumber || 'M-360').length) || 65;
                              const isThick = (charCode + i) % 3 === 0;
                              const isSpacer = i > 0 && i % 5 === 0;
                              return (
                                <div 
                                  key={i} 
                                  className={`${isSpacer ? 'w-[2.5px]' : isThick ? 'w-[2px]' : 'w-[1px]'} bg-slate-900 rounded-sm h-8 shrink-0`} 
                                />
                              );
                            })}
                          </div>
                          <span className="text-[10px] font-black tracking-widest font-mono text-slate-800 mt-1">
                            *{formData.plateNumber || 'M-360'}*
                          </span>
                        </div>

                        {/* Text details & print action */}
                        <div className="flex-1 text-right space-y-2">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            سيتم طباعة ملصق باركود مرمز برقم لوحة الترخيص أو رمز التتبع الخاص بالمركبة (<span className="font-mono font-black text-slate-850 dark:text-white bg-slate-100 dark:bg-slate-900 px-1 rounded">{formData.plateNumber || 'أدخل اللوحة...'}</span>) تلقائياً لتسهيل البحث والاستشعار لاحقاً.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (!formData.plateNumber) {
                                alert('الرجاء كتابة رقم لوحة المركبة أولاً لتوليد الملصق والباركود المخصص!');
                                return;
                              }
                              // Simulate print order
                              const prevText = document.getElementById('print-label-text');
                              if (prevText) {
                                prevText.innerText = 'جاري إرسال التكليف للطابعة...';
                                setTimeout(() => {
                                  prevText.innerText = 'تم إرسال أمر الطباعة بنجاح! 🖨️';
                                  setTimeout(() => {
                                    prevText.innerText = 'طباعة ملصق الباركود (Zebra)';
                                  }, 2000);
                                }, 1200);
                              }
                            }}
                            className="px-3.5 py-1.5 bg-brand-blue-50 hover:bg-brand-blue-100 dark:bg-brand-blue-950/40 dark:hover:bg-brand-blue-900/40 border border-brand-blue-100/30 text-brand-blue-600 dark:text-brand-blue-400 rounded-lg text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>🖨️</span>
                            <span id="print-label-text">طباعة ملصق الباركود (Zebra)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">رقم الهيكل (الشاصي)</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="على سبيل المثال: MHRJT12G..." 
                            value={formData.chassisNumber}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData(prev => ({ ...prev, chassisNumber: val }));
                              setFormErrors(prev => {
                                const next = { ...prev };
                                if (val.trim()) {
                                  const isDuplicate = vehicleList.some(v => v.chassisNumber && v.chassisNumber.trim().toLowerCase() === val.trim().toLowerCase());
                                  if (isDuplicate) {
                                    next.chassisNumber = 'رقم الهيكل هذا مكرر ومسجل مسبقاً لمركبة أخرى!';
                                  } else {
                                    delete next.chassisNumber;
                                  }
                                } else {
                                  delete next.chassisNumber;
                                }
                                return next;
                              });
                            }}
                            className={`w-full p-2.5 pl-10 bg-slate-50 dark:bg-slate-950 border ${
                              isChassisDuplicate || formErrors.chassisNumber ? 'border-rose-500 focus:ring-rose-200' : 
                              formData.chassisNumber.trim() ? 'border-emerald-500 focus:ring-emerald-100' : 'border-slate-105 dark:border-slate-800'
                            } rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 outline-none transition-all text-xs font-mono font-bold dark:text-white`}
                          />
                          {formData.chassisNumber.trim() !== '' && (
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold">
                              {isChassisDuplicate ? (
                                <span className="text-rose-500" title="مكرر ❌">❌</span>
                              ) : (
                                <span className="text-emerald-500" title="متاح ✓">✓</span>
                              )}
                            </span>
                          )}
                        </div>
                        {isChassisDuplicate ? (
                          <span className="text-[10px] text-rose-500 font-extrabold mt-1 block animate-pulse">
                            ⚠️ تنبيه: رقم الهيكل مكرر ومسجل بالفعل في النظام لمركبة أخرى!
                          </span>
                        ) : formErrors.chassisNumber ? (
                          <span className="text-[10px] text-rose-500 font-bold mt-1 block">{formErrors.chassisNumber}</span>
                        ) : formData.chassisNumber.trim() !== '' ? (
                          <span className="text-[10px] text-emerald-500 font-bold mt-1 block">
                            ✓ رقم الهيكل متاح وصالح للتسجيل.
                          </span>
                        ) : null}
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">رقم المحرك</label>
                        <input 
                          type="text" 
                          placeholder="على سبيل المثال: OM501LA..." 
                          value={formData.engineNumber}
                          onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-800 outline-none text-xs font-mono font-bold dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">نوع الوقود ومنظومة المحرك</label>
                        <select 
                          value={formData.fuelType}
                          onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as any })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-800 outline-none text-xs font-bold dark:text-white"
                        >
                          <option value="diesel">ديزل (Diesel)</option>
                          <option value="gasoline">بنزين (Gasoline)</option>
                          <option value="electric">كهربائي بالكامل (Electric)</option>
                          <option value="hybrid">هجين (Hybrid)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">الحمولة القصوى المعتمدة</label>
                        <input 
                          type="text" 
                          placeholder="مثال: 20 طن / 1200 كغم" 
                          value={formData.loadingCapacity}
                          onChange={(e) => setFormData({ ...formData, loadingCapacity: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-800 outline-none text-xs font-medium dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">سنة الصنع والموديل</label>
                        <select 
                          value={formData.modelYear}
                          onChange={(e) => setFormData({ ...formData, modelYear: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-800 outline-none text-xs font-bold dark:text-white"
                        >
                          {Array.from({ length: 15 }, (_, i) => String(2026 - i)).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">تاريخ انتهاء التأمين</label>
                        <input 
                          type="date" 
                          value={formData.insuranceExpiry}
                          onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-800 outline-none text-xs font-semibold dark:text-white"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-brand-blue-50/50 dark:bg-brand-blue-900/10 p-4 rounded-2xl border border-brand-blue-100 dark:border-brand-blue-900/30 flex items-start gap-3">
                      <Info className="text-brand-blue-600 dark:text-brand-blue-400 mt-0.5" size={16} />
                      <p className="text-xs font-bold text-brand-blue-800 dark:text-brand-blue-300 leading-relaxed">
                        الرجاء إدخال البيانات المعتمدة لضغط الهواء وجهة تصنيع الإطارات وحالتها الحالية للمركبة للمتابعة والمراقبة الذكية عبر لوحة القيادة.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">عدد العجلات الكلي (إطارات التشغيل)</label>
                        <select 
                          value={formData.tireCount}
                          onChange={(e) => setFormData({ ...formData, tireCount: Number(e.target.value) })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-800 outline-none text-xs font-bold dark:text-white"
                        >
                          <option value={4}>4 عجلات (سيارات / بيك أب / شوكية)</option>
                          <option value={6}>6 عجلات ( حافلات / شاحنات متوسطة)</option>
                          <option value={10}>10 عجلات ( شاحنات نقل ثقيل وتريلات)</option>
                          <option value={12}>12 عجلات (معدات قاطرة مقطورة)</option>
                          <option value={18}>18 عجلات (شاحنات نقل عملاقة مسافات طويلة)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">مقاس الإطار (Tire Size)</label>
                        <input 
                          type="text" 
                          placeholder="مثال: 315/80R22.5" 
                          value={formData.tireSize}
                          onChange={(e) => setFormData({ ...formData, tireSize: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-800 outline-none text-xs font-sans font-bold dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">ضغط الهواء الموصى به</label>
                        <input 
                          type="text" 
                          placeholder="مثال: 120 PSI" 
                          value={formData.tirePressure}
                          onChange={(e) => setFormData({ ...formData, tirePressure: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-800 outline-none text-xs font-bold dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">ماركة الإطار المصنعة</label>
                        <input 
                          type="text" 
                          placeholder="مثال: Michelin / Bridgestone" 
                          value={formData.tireBrand}
                          onChange={(e) => setFormData({ ...formData, tireBrand: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-800 outline-none text-xs font-bold dark:text-white"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">الحالة الراهنة للإطارات وعجلات التشغيل</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {['ممتاز', 'جيد جداً', 'جيد', 'متوسط', 'يحتاج استبدال'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setFormData({ ...formData, tireStatus: status })}
                              className={`p-2.5 rounded-xl text-xs font-black border transition-all ${
                                formData.tireStatus === status 
                                  ? 'bg-brand-blue-600 text-white border-brand-blue-600 shadow-sm' 
                                  : 'bg-slate-50 dark:bg-slate-950 border-slate-105 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

              </form>

              {/* Modal Footer Controls */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 text-xs transition-all cursor-pointer"
                    >
                      السابق
                    </button>
                  ) : (
                    <div />
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setCurrentStep(1);
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 text-xs transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-5 py-2.5 bg-brand-blue-600 text-white rounded-xl font-bold hover:bg-brand-blue-700 text-xs transition-all cursor-pointer"
                    >
                      المتابعة للتالي
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSaveVehicle}
                      className="px-5 py-2.5 bg-brand-green-600 text-white rounded-xl font-bold hover:bg-brand-green-700 text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check size={14} />
                      <span>إدخال وحفظ المركبة</span>
                    </button>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}

        {isBulkModalOpen && (
          <div className="fixed inset-0 z-[120] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              {/* Modal Header */}
              <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
                    <FileSpreadsheet size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{language === 'ar' ? 'استيراد وفحص وتدقيق الأصول الجماعي (CSV / Excel)' : 'Bulk Asset Import & Verification Center (CSV / Excel)'}</span>
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[10px] font-black rounded-lg border border-purple-200 dark:border-purple-800">
                        {language === 'ar' ? 'فحص ومعاينة حية' : 'Live Validation'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {language === 'ar' ? 'رفع ملفات الأصول وتدقيق الصفوف وتصحيح الأخطاء قبل الاعتماد النهائي' : 'Upload fleet files, review row validation status, and correct errors before registration'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!isGenerating && !isPreviewingCsv) {
                      setIsBulkModalOpen(false);
                      setUploadedFile(null);
                      setProcessedCsvRows([]);
                      setPreviewVehicles([]);
                      setEditingCsvRow(null);
                    }
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
                  disabled={isGenerating || isPreviewingCsv}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
                {/* Guide & Template download banner */}
                <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-purple-500/10 dark:from-purple-950/30 dark:to-indigo-950/20 p-4.5 rounded-2xl border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                      <Sparkles size={15} className="text-purple-600 dark:text-purple-400 shrink-0" />
                      <span>{language === 'ar' ? 'قوالب ونماذج استيراد الأصول المعتمدة' : 'Official Fleet Import Spreadsheets & Templates'}</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                      {language === 'ar'
                        ? 'يمكنك تحميل نموذج CSV أو Excel وتعبئته ببيانات شاحناتك أو سياراتك ومولداتك ثم رفعه للفحص الفوري.'
                        : 'Download standard CSV or Excel template, fill it with your vehicles or heavy machinery, and upload for instant inspection.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => downloadFleetAssetCsvTemplate(language)}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      <Download size={14} />
                      <span>{language === 'ar' ? 'تحميل نموذج CSV 📥' : 'Download CSV (.csv) 📥'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadFleetAssetTemplate(language)}
                      className="px-3.5 py-2 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-slate-750 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      <Download size={14} />
                      <span>{language === 'ar' ? 'نموذج Excel (.xlsx) 📥' : 'Download Excel (.xlsx) 📥'}</span>
                    </button>
                  </div>
                </div>

                {isGenerating ? (
                  /* Generation status page */
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-600 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={20} className="text-purple-600 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1.5 max-w-md">
                      <h4 className="text-sm font-black text-slate-800 dark:text-white">
                        {language === 'ar' ? 'جاري معالجة وتسجيل الأصول وتوليد الأرشيف التاريخي...' : 'Processing & registering fleet assets with AI historical archive...'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold animate-pulse">
                        {generationLog}
                      </p>
                    </div>
                    <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-purple-600 h-full rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${generationProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-xs font-black text-purple-600 dark:text-purple-400 font-mono">{generationProgress}%</span>
                  </div>
                ) : (
                  /* Upload and Status List Center */
                  <div className="space-y-5">
                    {/* Drag and Drop Zone (shown when no file is uploaded) */}
                    {!uploadedFile ? (
                      <div
                        onDragOver={handleDragOverFile}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDropFile}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                          dragActive 
                            ? 'border-purple-500 bg-purple-500/5' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-purple-400 hover:bg-slate-50/50 dark:hover:bg-slate-950/10'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xlsx,.xls,.tsv,.txt"
                          className="hidden"
                          onChange={handleFileInputChange}
                        />
                        <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl text-purple-600 dark:text-purple-400 transition-colors">
                          <Upload size={28} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-slate-800 dark:text-white">
                            {language === 'ar' ? 'اسحب ملف بيانات الأسطول (CSV أو Excel) هنا أو انقر للتصفح' : 'Drag & drop fleet CSV / Excel spreadsheet here or click to browse'}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {language === 'ar' ? 'يدعم ملفات CSV المفصولة بفواصل، وملفات Excel (.xlsx / .xls)، مع تدقيق وفحص مباشر لكل صف' : 'Supports CSV, Excel workbooks (.xlsx, .xls), with live row-by-row status and validation'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Live Inspection, Progress Bar, & Status List */
                      <div className="space-y-5">
                        {/* File status bar */}
                        <div className="flex flex-wrap items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                              <FileSpreadsheet size={20} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{uploadedFile.name}</span>
                                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[10.5px] font-black rounded-md border border-purple-200 dark:border-purple-800">
                                  {language === 'ar' ? `إجمالي ${processedCsvRows.length} صف` : `${processedCsvRows.length} Total Rows`}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.name.endsWith('.csv') ? 'CSV File' : 'Spreadsheet File'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleAutoFixAllCsvRows}
                              className="px-3 py-1.5 text-xs text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/50 hover:bg-purple-200 dark:hover:bg-purple-900/60 font-black rounded-lg border border-purple-200 dark:border-purple-800 transition-all flex items-center gap-1.5 cursor-pointer"
                              title={language === 'ar' ? 'إصلاح وتعبئة الحقول الناقصة تلقائياً' : 'Auto-fix missing fields'}
                            >
                              <Sparkles size={13} className="text-purple-600" />
                              <span>{language === 'ar' ? 'إصلاح ذكي لجميع الأخطاء' : 'Smart Auto-Fix All'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setUploadedFile(null);
                                setProcessedCsvRows([]);
                                setPreviewVehicles([]);
                                setEditingCsvRow(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                              }}
                              className="px-3 py-1.5 text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-bold bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-300 transition-all cursor-pointer"
                            >
                              {language === 'ar' ? 'استبدال الملف' : 'Change File'}
                            </button>
                          </div>
                        </div>

                        {/* Upload & Row Validation Progress Bar */}
                        {isPreviewingCsv ? (
                          <div className="p-6 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-200 dark:border-purple-900/50 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Loader2 size={16} className="text-purple-600 animate-spin" />
                                <span className="text-xs font-black text-purple-900 dark:text-purple-200">
                                  {language === 'ar' ? 'جاري قراءة وفحص بنية الصفوف في الملف...' : 'Parsing and inspecting rows...'}
                                </span>
                              </div>
                              <span className="text-xs font-black font-mono text-purple-700 dark:text-purple-300">
                                {csvParsingProgress}%
                              </span>
                            </div>

                            {/* Progress bar line */}
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                              <motion.div
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: `${csvParsingProgress}%` }}
                                transition={{ duration: 0.2 }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                              <span>{csvProcessingStatus}</span>
                              {csvTotalRows > 0 && (
                                <span className="font-mono">{csvCurrentRow} / {csvTotalRows} {language === 'ar' ? 'صف' : 'rows'}</span>
                              )}
                            </div>
                          </div>
                        ) : processedCsvRows.length > 0 ? (
                          <div className="space-y-4">
                            {/* Validation Metric Summary Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {/* Total Card */}
                              <div 
                                onClick={() => setCsvStatusFilter('all')}
                                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                                  csvStatusFilter === 'all'
                                    ? 'bg-purple-500/10 border-purple-500/40 shadow-sm ring-2 ring-purple-500/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-slate-500">{language === 'ar' ? 'إجمالي الصفوف' : 'Total Rows'}</span>
                                  <FileSpreadsheet size={16} className="text-purple-600" />
                                </div>
                                <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-1">
                                  {processedCsvRows.length}
                                </div>
                              </div>

                              {/* Valid Card */}
                              <div 
                                onClick={() => setCsvStatusFilter('valid')}
                                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                                  csvStatusFilter === 'valid'
                                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm ring-2 ring-emerald-500/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{language === 'ar' ? 'سليمة وجاهزة' : 'Valid & Ready'}</span>
                                  <CheckCircle2 size={16} className="text-emerald-500" />
                                </div>
                                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                                  {processedCsvRows.filter(r => r.status === 'valid').length}
                                </div>
                              </div>

                              {/* Errors Card */}
                              <div 
                                onClick={() => setCsvStatusFilter('error')}
                                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                                  csvStatusFilter === 'error'
                                    ? 'bg-rose-500/10 border-rose-500/40 shadow-sm ring-2 ring-rose-500/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">{language === 'ar' ? 'تحتوي أخطاء' : 'Has Errors'}</span>
                                  <AlertCircle size={16} className="text-rose-500" />
                                </div>
                                <div className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
                                  {processedCsvRows.filter(r => r.status === 'error').length}
                                </div>
                              </div>

                              {/* Warnings Card */}
                              <div 
                                onClick={() => setCsvStatusFilter('warning')}
                                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                                  csvStatusFilter === 'warning'
                                    ? 'bg-amber-500/10 border-amber-500/40 shadow-sm ring-2 ring-amber-500/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{language === 'ar' ? 'تنبيهات غير حرجة' : 'Warnings'}</span>
                                  <AlertTriangle size={16} className="text-amber-500" />
                                </div>
                                <div className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                                  {processedCsvRows.filter(r => r.status === 'warning').length}
                                </div>
                              </div>
                            </div>

                            {/* Filter Tabs & Quick Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                                <button
                                  type="button"
                                  onClick={() => setCsvStatusFilter('all')}
                                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                                    csvStatusFilter === 'all'
                                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                  }`}
                                >
                                  {language === 'ar' ? `الكل (${processedCsvRows.length})` : `All (${processedCsvRows.length})`}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCsvStatusFilter('valid')}
                                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                                    csvStatusFilter === 'valid'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                  }`}
                                >
                                  <CheckCircle2 size={13} />
                                  <span>{language === 'ar' ? `السليمة (${processedCsvRows.filter(r => r.status === 'valid').length})` : `Valid (${processedCsvRows.filter(r => r.status === 'valid').length})`}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCsvStatusFilter('error')}
                                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                                    csvStatusFilter === 'error'
                                      ? 'bg-rose-600 text-white shadow-xs'
                                      : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                  }`}
                                >
                                  <AlertCircle size={13} />
                                  <span>{language === 'ar' ? `أخطاء (${processedCsvRows.filter(r => r.status === 'error').length})` : `Errors (${processedCsvRows.filter(r => r.status === 'error').length})`}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCsvStatusFilter('warning')}
                                  className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                                    csvStatusFilter === 'warning'
                                      ? 'bg-amber-500 text-white shadow-xs'
                                      : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                  }`}
                                >
                                  <AlertTriangle size={13} />
                                  <span>{language === 'ar' ? `تنبيهات (${processedCsvRows.filter(r => r.status === 'warning').length})` : `Warnings (${processedCsvRows.filter(r => r.status === 'warning').length})`}</span>
                                </button>
                              </div>

                              <span className="text-[11px] text-slate-400 font-semibold">
                                {language === 'ar' ? 'انقر على "تصحيح الخطأ" لتعديل أي حقل مفقود مباشرة' : 'Click "Fix Error" to correct missing or invalid fields directly'}
                              </span>
                            </div>

                            {/* Status List & Row Table */}
                            <div className="max-h-72 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-inner">
                              <table className="w-full text-xs text-right divide-y divide-slate-100 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-950/60 text-[11px] font-black text-slate-600 dark:text-slate-400 sticky top-0 z-10">
                                  <tr>
                                    <th className="p-2.5 text-right w-12">#</th>
                                    <th className="p-2.5 text-right w-28">{language === 'ar' ? 'حالة التدقيق' : 'Validation Status'}</th>
                                    <th className="p-2.5 text-right">{language === 'ar' ? 'اسم الأصل / المركبة' : 'Asset / Vehicle'}</th>
                                    <th className="p-2.5 text-right">{language === 'ar' ? 'رقم اللوحة / الرمز' : 'Plate / Code'}</th>
                                    <th className="p-2.5 text-right">{language === 'ar' ? 'القسم والتصنيف' : 'Department & Type'}</th>
                                    <th className="p-2.5 text-right">{language === 'ar' ? 'سنة الصنع / الوقود' : 'Year / Fuel'}</th>
                                    <th className="p-2.5 text-right">{language === 'ar' ? 'ملاحظات وتفاصيل الفحص' : 'Validation Notes / Error Reason'}</th>
                                    <th className="p-2.5 text-center w-24">{language === 'ar' ? 'الإجراء' : 'Actions'}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                                  {processedCsvRows
                                    .filter(row => {
                                      if (csvStatusFilter === 'valid') return row.status === 'valid';
                                      if (csvStatusFilter === 'error') return row.status === 'error';
                                      if (csvStatusFilter === 'warning') return row.status === 'warning';
                                      return true;
                                    })
                                    .map((row) => {
                                      const isRowError = row.status === 'error';
                                      const isRowWarning = row.status === 'warning';

                                      return (
                                        <tr 
                                          key={row.id} 
                                          className={`transition-colors ${
                                            isRowError 
                                              ? 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/70 dark:hover:bg-rose-950/30' 
                                              : isRowWarning 
                                                ? 'bg-amber-50/30 dark:bg-amber-950/15 hover:bg-amber-50/60 dark:hover:bg-amber-950/25'
                                                : 'hover:bg-purple-50/30 dark:hover:bg-slate-800/40'
                                          }`}
                                        >
                                          {/* Row Number */}
                                          <td className="p-2.5 text-slate-400 font-mono text-[11px]">{row.rowNumber}</td>

                                          {/* Status Badge */}
                                          <td className="p-2.5 whitespace-nowrap">
                                            {row.status === 'valid' ? (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10.5px] font-black border border-emerald-200 dark:border-emerald-800">
                                                <CheckCircle2 size={12} className="text-emerald-600" />
                                                <span>{language === 'ar' ? 'سليم وجاهز' : 'Valid'}</span>
                                              </span>
                                            ) : row.status === 'error' ? (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10.5px] font-black border border-rose-200 dark:border-rose-800 animate-pulse">
                                                <AlertCircle size={12} className="text-rose-600" />
                                                <span>{language === 'ar' ? 'يوجد خطأ' : 'Error'}</span>
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10.5px] font-black border border-amber-200 dark:border-amber-800">
                                                <AlertTriangle size={12} className="text-amber-600" />
                                                <span>{language === 'ar' ? 'تنبيه' : 'Warning'}</span>
                                              </span>
                                            )}
                                          </td>

                                          {/* Asset Name */}
                                          <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                                            <div className="flex items-center gap-1.5">
                                              <span>{row.vehicle.name}</span>
                                              {(!row.vehicle.name || row.vehicle.name.includes('غير مسمى') || row.vehicle.name.includes('Unnamed')) && (
                                                <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[9.5px] rounded font-bold">{language === 'ar' ? 'فارغ' : 'Missing'}</span>
                                              )}
                                            </div>
                                          </td>

                                          {/* Plate Number */}
                                          <td className="p-2.5 font-mono text-purple-700 dark:text-purple-300 font-black">
                                            <div className="flex items-center gap-1.5">
                                              <span>{row.vehicle.plateNumber}</span>
                                              {(row.vehicle.plateNumber.includes('مفقودة') || row.vehicle.plateNumber.includes('NO-PLATE')) && (
                                                <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[9.5px] rounded font-bold">{language === 'ar' ? 'مفقود' : 'Required'}</span>
                                              )}
                                            </div>
                                          </td>

                                          {/* Department & Type */}
                                          <td className="p-2.5 text-slate-600 dark:text-slate-300 text-[11px]">
                                            <div>{row.vehicle.department}</div>
                                            <div className="text-[10px] text-slate-400">{row.vehicle.type}</div>
                                          </td>

                                          {/* Year & Fuel */}
                                          <td className="p-2.5 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                                            <div>{row.vehicle.modelYear}</div>
                                            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-sans">{row.vehicle.fuelType}</div>
                                          </td>

                                          {/* Validation Notes & Reason */}
                                          <td className="p-2.5 text-[11px]">
                                            {row.errors.length > 0 ? (
                                              <div className="space-y-0.5 text-rose-600 dark:text-rose-400 font-bold">
                                                {row.errors.map((err, errIdx) => (
                                                  <div key={errIdx} className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                                    <span>{err}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : row.warnings.length > 0 ? (
                                              <div className="space-y-0.5 text-amber-600 dark:text-amber-400">
                                                {row.warnings.map((warn, warnIdx) => (
                                                  <div key={warnIdx} className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                                    <span>{warn}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <span className="text-emerald-600 dark:text-emerald-400 text-[10.5px]">
                                                {language === 'ar' ? 'تم الفحص ومطابقة الحقول بنجاح' : 'All required fields verified'}
                                              </span>
                                            )}
                                          </td>

                                          {/* Actions: Edit / Fix and Delete */}
                                          <td className="p-2.5 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1">
                                              <button
                                                type="button"
                                                onClick={() => handleStartEditCsvRow(row)}
                                                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-lg text-[11px] font-black border border-purple-200 dark:border-purple-800 flex items-center gap-1 cursor-pointer transition-colors"
                                                title={language === 'ar' ? 'تصحيح وتعديل بيانات الصف' : 'Fix row details'}
                                              >
                                                <Edit3 size={12} />
                                                <span>{language === 'ar' ? 'تصحيح' : 'Fix'}</span>
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() => handleDeleteProcessedCsvRow(row.id)}
                                                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                                title={language === 'ar' ? 'حذف هذا الصف من الاستيراد' : 'Remove row'}
                                              >
                                                <Trash2 size={13} />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </div>

                            {/* Dual action registration buttons */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const readyVehicles = processedCsvRows.filter(r => r.status !== 'error').map(r => r.vehicle);
                                  handleDirectBulkRegister(readyVehicles);
                                }}
                                disabled={processedCsvRows.filter(r => r.status !== 'error').length === 0}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black transition-all text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
                              >
                                <Check size={16} />
                                <span>
                                  {language === 'ar'
                                    ? `اعتماد وتسجيل الصفوف السليمة فقط (${processedCsvRows.filter(r => r.status !== 'error').length} أصل) ✅`
                                    : `Register Valid Rows Only (${processedCsvRows.filter(r => r.status !== 'error').length} Assets) ✅`}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleAiBulkImport(uploadedFile)}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-black transition-all text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
                              >
                                <Sparkles size={15} className="animate-pulse" />
                                <span>
                                  {language === 'ar'
                                    ? 'تسجيل ذكي + توليد سجل صيانة تاريخي لـ 3 سنوات (AI) 🚀'
                                    : 'Smart Import + 3-Year Maintenance Archive (AI) 🚀'}
                                </span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 text-center text-slate-400 space-y-1">
                            <p className="text-xs font-bold">{language === 'ar' ? 'لم يتم العثور على أصول صالحة في الملف المرفوع' : 'No valid assets found in uploaded file'}</p>
                            <p className="text-[11px]">{language === 'ar' ? 'يرجى التأكد من مطابقة الملف لنموذج CSV الاسترشادي' : 'Please check template headers and re-upload'}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
                <div className="text-[11px] text-slate-400 font-semibold hidden sm:block">
                  {language === 'ar' ? 'نظام FleetAurvexis لإدارة وتدقيق ومزامنة الأصول الجماعية' : 'FleetAurvexis Bulk Asset Verification & Management System'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkModalOpen(false);
                    setUploadedFile(null);
                    setProcessedCsvRows([]);
                    setPreviewVehicles([]);
                    setEditingCsvRow(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition-all cursor-pointer"
                  disabled={isGenerating || isPreviewingCsv}
                >
                  {language === 'ar' ? 'إلغاء وإغلاق' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Inline Row Correction Modal */}
        {editingCsvRow && (
          <div className="fixed inset-0 z-[130] overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[1.8rem] border border-purple-200 dark:border-purple-800 shadow-2xl overflow-hidden flex flex-col"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Edit3 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black">
                      {language === 'ar' ? `تصحيح وتعديل بيانات الصف رقم #${editingCsvRow.rowNumber}` : `Edit & Correct Row #${editingCsvRow.rowNumber}`}
                    </h4>
                    <p className="text-[10.5px] text-purple-100">
                      {language === 'ar' ? 'قم بتصحيح الحقول لتتحول حالة الصف فوراً إلى "سليم وجاهز للتسجيل"' : 'Fix the required fields to immediately validate this row'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCsvRow(null)}
                  className="p-1.5 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Current Errors list */}
                {editingCsvRow.errors.length > 0 && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 space-y-1">
                    <span className="text-[11px] font-black text-rose-700 dark:text-rose-300 flex items-center gap-1">
                      <AlertCircle size={13} />
                      <span>{language === 'ar' ? 'الأخطاء المطلوب تصحيحها:' : 'Errors to resolve:'}</span>
                    </span>
                    <ul className="text-xs text-rose-600 dark:text-rose-400 list-disc list-inside font-semibold">
                      {editingCsvRow.errors.map((e, idx) => (
                        <li key={idx}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Form fields */}
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-black text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'ar' ? 'اسم الأصل / المركبة *' : 'Asset / Vehicle Name *'}
                    </label>
                    <input
                      type="text"
                      value={editRowForm.name}
                      onChange={(e) => setEditRowForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={language === 'ar' ? 'مثال: شاحنة مرسيدس أكتروس 3340 قلاب' : 'e.g. Mercedes Actros 3340 Dump Truck'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-black text-slate-700 dark:text-slate-300 mb-1">
                        {language === 'ar' ? 'رقم اللوحة / الرمز *' : 'Plate / Code *'}
                      </label>
                      <input
                        type="text"
                        value={editRowForm.plateNumber}
                        onChange={(e) => setEditRowForm(prev => ({ ...prev, plateNumber: e.target.value }))}
                        placeholder={language === 'ar' ? 'مثال: أ ب ج 1234 أو GEN-500' : 'e.g. ABC 1234 or GEN-500'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold font-mono focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-black text-slate-700 dark:text-slate-300 mb-1">
                        {language === 'ar' ? 'سنة الصنع' : 'Model Year'}
                      </label>
                      <input
                        type="text"
                        value={editRowForm.modelYear}
                        onChange={(e) => setEditRowForm(prev => ({ ...prev, modelYear: e.target.value }))}
                        placeholder="2023"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold font-mono focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-black text-slate-700 dark:text-slate-300 mb-1">
                        {language === 'ar' ? 'القسم الإداري' : 'Department'}
                      </label>
                      <input
                        type="text"
                        value={editRowForm.department}
                        onChange={(e) => setEditRowForm(prev => ({ ...prev, department: e.target.value }))}
                        placeholder={language === 'ar' ? 'مثال: العمليات الميدانية' : 'e.g. Field Operations'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-black text-slate-700 dark:text-slate-300 mb-1">
                        {language === 'ar' ? 'التصنيف' : 'Category'}
                      </label>
                      <select
                        value={editRowForm.type}
                        onChange={(e) => setEditRowForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      >
                        <option value="معدة ثقيلة">{language === 'ar' ? 'معدة ثقيلة' : 'Heavy Equipment'}</option>
                        <option value="مركبة خفيفة">{language === 'ar' ? 'مركبة خفيفة' : 'Light Vehicle'}</option>
                        <option value="نقل جماعي">{language === 'ar' ? 'نقل جماعي / حافلة' : 'Public Transport'}</option>
                        <option value="معدة هندسية">{language === 'ar' ? 'معدة هندسية / مولد' : 'Engineering Equipment'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-black text-slate-700 dark:text-slate-300 mb-1">
                        {language === 'ar' ? 'نوع الوقود' : 'Fuel Type'}
                      </label>
                      <select
                        value={editRowForm.fuelType}
                        onChange={(e) => setEditRowForm(prev => ({ ...prev, fuelType: e.target.value as any }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      >
                        <option value="diesel">{language === 'ar' ? 'ديزل (Diesel)' : 'Diesel'}</option>
                        <option value="gasoline">{language === 'ar' ? 'بنزين (Gasoline)' : 'Gasoline'}</option>
                        <option value="electric">{language === 'ar' ? 'كهرباء (Electric)' : 'Electric'}</option>
                        <option value="hybrid">{language === 'ar' ? 'هجين (Hybrid)' : 'Hybrid'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-black text-slate-700 dark:text-slate-300 mb-1">
                        {language === 'ar' ? 'رقم الشاسيه / الهيكل' : 'Chassis / VIN'}
                      </label>
                      <input
                        type="text"
                        value={editRowForm.chassisNumber}
                        onChange={(e) => setEditRowForm(prev => ({ ...prev, chassisNumber: e.target.value }))}
                        placeholder="CHS-2025-XXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold font-mono focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCsvRow(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveRowCorrection}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <Check size={15} />
                  <span>{language === 'ar' ? 'حفظ وتصحيح الصف فوراً' : 'Save & Validate Row'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isSmartInputModalOpen && (
          <div className="fixed inset-0 z-[120] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              {/* Modal Header */}
              <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Wrench size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white">
                      {language === 'ar' ? 'مساعد الإدخال الذكي للصيانة' : 'Smart Input Assistant for Maintenance'}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                      {language === 'ar' 
                        ? 'استخلاص فواتير وتقارير الصيانة وتأريخها تلقائياً للمركبة' 
                        : 'Automatically extract and link retroactive maintenance logs from documents'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!isSmartInputExtracting) {
                      setIsSmartInputModalOpen(false);
                      setExtractedOrder(null);
                      setSmartInputFile(null);
                      setSmartInputVehicleId('');
                    }
                  }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 dark:text-slate-300">
                {extractedOrder ? (
                  /* Extracted order preview & editing */
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-start gap-3">
                      <Sparkles size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-450">
                          {language === 'ar' ? 'اكتمل الاستخلاص والتصنيف بنجاح!' : 'Extraction & Classification Complete!'}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                          {language === 'ar' 
                            ? 'تم قراءة المستند وتصنيفه ذكياً. يرجى مراجعة وتعديل أي تفاصيل، وتغيير نوع المستند إذا لزم الأمر للتحديث التلقائي للحقول.'
                            : 'The document was intelligently read and classified. Review or adjust details below. Modifying the document type will auto-update field defaults.'}
                        </p>
                      </div>
                    </div>

                     {/* Document Classification */}
                    <div className="p-4 bg-indigo-5/20 dark:bg-slate-950/40 rounded-2xl border border-indigo-100/40 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-black text-indigo-950 dark:text-indigo-300">
                          {language === 'ar' ? 'تصنيف وثيقة الصيانة المستخلصة:' : 'Extracted Maintenance Document Classification:'}
                        </label>
                        <span className="text-[10px] bg-indigo-600/10 text-indigo-700 dark:text-indigo-400 font-black px-2 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1">
                          <Sparkles size={10} className="animate-pulse" />
                          <span>{language === 'ar' ? 'مؤكّد بالذكاء الاصطناعي' : 'AI Confirmed'}</span>
                        </span>
                      </div>
                      
                      <div className="flex gap-3">
                        {extractedOrder.documentType && DOCUMENT_TYPES_METADATA[extractedOrder.documentType] && (
                          <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${DOCUMENT_TYPES_METADATA[extractedOrder.documentType].colorClass}`}>
                            {React.createElement(DOCUMENT_TYPES_METADATA[extractedOrder.documentType].icon, {
                              size: 24
                            })}
                          </div>
                        )}
                        <div className="flex-1">
                          <select
                            value={extractedOrder.documentType || 'external_workshop_receipt'}
                            onChange={(e) => handleDocumentTypeChange(e.target.value)}
                            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-bold focus:border-indigo-500 dark:text-white cursor-pointer"
                          >
                            <option value="spare_parts_invoice">{language === 'ar' ? 'فاتورة شراء قطع غيار (مستند مالي للمورد)' : 'Spare parts purchase invoice (Supplier financial log)'}</option>
                            <option value="periodic_inspection">{language === 'ar' ? 'تقرير فحص دوري سنوي (تقييم فني وتأكيد سلامة)' : 'Periodic annual inspection report (Technical safety audit)'}</option>
                            <option value="external_workshop_receipt">{language === 'ar' ? 'إيصال صيانة ورشة خارجية (خدمات وإصلاحات)' : 'External workshop service receipt (Repair & labor services)'}</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Order Number */}
                      <div>
                        <label className="block text-xs font-black text-slate-755 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'رقم طلب العمل (المستخلص):' : 'Work Order Number:'}
                        </label>
                        <input
                          type="text"
                          value={extractedOrder.orderNumber || ''}
                          onChange={(e) => setExtractedOrder({ ...extractedOrder, orderNumber: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl outline-none text-xs font-bold focus:bg-white dark:focus:bg-slate-800 dark:text-white"
                        />
                      </div>

                      {/* Date */}
                      <div>
                        <label className="block text-xs font-black text-slate-755 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'تاريخ الصيانة التاريخي:' : 'Historical Service Date:'}
                        </label>
                        <input
                          type="date"
                          value={extractedOrder.date || ''}
                          onChange={(e) => setExtractedOrder({ ...extractedOrder, date: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl outline-none text-xs font-bold focus:bg-white dark:focus:bg-slate-800 dark:text-white"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-xs font-black text-slate-755 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'تصنيف الصيانة المكتشف:' : 'Detected Service Category:'}
                        </label>
                        <select
                          value={extractedOrder.category || 'mechanical'}
                          onChange={(e) => setExtractedOrder({ ...extractedOrder, category: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl outline-none text-xs font-bold focus:bg-white dark:focus:bg-slate-800 dark:text-white"
                        >
                          <option value="mechanical">{language === 'ar' ? 'صيانة ميكانيكية' : 'Mechanical Service'}</option>
                          <option value="electrical">{language === 'ar' ? 'صيانة كهربائية' : 'Electrical Service'}</option>
                          <option value="cooling">{language === 'ar' ? 'تبريد وتكييف' : 'Cooling & AC'}</option>
                          <option value="hydraulic">{language === 'ar' ? 'أنظمة هيدروليكية' : 'Hydraulic Systems'}</option>
                          <option value="bodywork">{language === 'ar' ? 'هيكل وسمكرة' : 'Bodywork'}</option>
                          <option value="tires">{language === 'ar' ? 'إطارات وعجلات' : 'Tires & Wheels'}</option>
                          <option value="brakes">{language === 'ar' ? 'مكابح وفرامل' : 'Brake Systems'}</option>
                        </select>
                      </div>

                      {/* Cost */}
                      <div>
                        <label className="block text-xs font-black text-slate-755 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'التكلفة الإجمالية المكتشفة ($ USD):' : 'Extracted Cost ($ USD):'}
                        </label>
                        <input
                          type="number"
                          value={extractedOrder.cost || 0}
                          onChange={(e) => setExtractedOrder({ ...extractedOrder, cost: Number(e.target.value) })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl outline-none text-xs font-bold focus:bg-white dark:focus:bg-slate-800 dark:text-white"
                        />
                      </div>

                      {/* Invoice Number (for financial docs) */}
                      {extractedOrder.documentType !== 'periodic_inspection' && (
                        <div>
                          <label className="block text-xs font-black text-slate-755 dark:text-slate-300 mb-1">
                            {language === 'ar' ? 'رقم الفاتورة / الإيصال المكتشف:' : 'Extracted Invoice/Receipt No:'}
                          </label>
                          <input
                            type="text"
                            value={extractedOrder.externalInvoiceNo || ''}
                            onChange={(e) => setExtractedOrder({ ...extractedOrder, externalInvoiceNo: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl outline-none text-xs font-bold focus:bg-white dark:focus:bg-slate-800 dark:text-white"
                            placeholder="INV-XXXXX"
                          />
                        </div>
                      )}

                      {/* Invoice Status (for financial docs) */}
                      {extractedOrder.documentType !== 'periodic_inspection' && (
                        <div>
                          <label className="block text-xs font-black text-slate-755 dark:text-slate-300 mb-1">
                            {language === 'ar' ? 'حالة الفاتورة المستخلصة:' : 'Extracted Invoice Status:'}
                          </label>
                          <select
                            value={extractedOrder.externalInvoiceStatus || 'paid'}
                            onChange={(e) => setExtractedOrder({ ...extractedOrder, externalInvoiceStatus: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl outline-none text-xs font-bold focus:bg-white dark:focus:bg-slate-800 dark:text-white"
                          >
                            <option value="paid">{language === 'ar' ? 'مدفوعة ومسواة' : 'Paid & Settled'}</option>
                            <option value="received_unpaid">{language === 'ar' ? 'مستلمة ولم تدفع' : 'Received (Unpaid)'}</option>
                            <option value="pending_invoice">{language === 'ar' ? 'بانتظار الفاتورة الرسمية' : 'Pending Invoice'}</option>
                          </select>
                        </div>
                      )}

                      {/* Tech */}
                      <div>
                        <label className="block text-xs font-black text-slate-755 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'الفني أو المهندس المنفذ:' : 'Assigned Technician:'}
                        </label>
                        <select
                          value={extractedOrder.technicianId || '201'}
                          onChange={(e) => setExtractedOrder({ ...extractedOrder, technicianId: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl outline-none text-xs font-bold focus:bg-white dark:focus:bg-slate-800 dark:text-white"
                        >
                          <option value="201">{language === 'ar' ? 'المهندس عادل الحربي' : 'Eng. Adel Al-Harbi'}</option>
                          <option value="202">{language === 'ar' ? 'المهندس أحمد المصري' : 'Eng. Ahmed El-Masry'}</option>
                          <option value="203">{language === 'ar' ? 'الفني سليم غانم' : 'Tech. Salim Ghanem'}</option>
                        </select>
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="block text-xs font-black text-slate-755 dark:text-slate-300 mb-1">
                          {language === 'ar' ? 'مستوى الأهمية / الأولوية:' : 'Priority Level:'}
                        </label>
                        <select
                          value={extractedOrder.priority || 'medium'}
                          onChange={(e) => setExtractedOrder({ ...extractedOrder, priority: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl outline-none text-xs font-bold focus:bg-white dark:focus:bg-slate-800 dark:text-white"
                        >
                          <option value="low">{language === 'ar' ? 'منخفضة' : 'Low'}</option>
                          <option value="medium">{language === 'ar' ? 'متوسطة' : 'Medium'}</option>
                          <option value="high">{language === 'ar' ? 'مرتفعة (حرجة)' : 'High (Critical)'}</option>
                        </select>
                      </div>
                    </div>

                    {/* Smart Audit Notes */}
                    <div>
                      <label className="block text-xs font-black text-slate-755 dark:text-slate-300 mb-1">
                        {language === 'ar' ? 'ملاحظات الفحص والتوثيق المكتشفة:' : 'Extracted Verification & Smart Notes:'}
                      </label>
                      <input
                        type="text"
                        value={extractedOrder.techNotes || ''}
                        onChange={(e) => setExtractedOrder({ ...extractedOrder, techNotes: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl outline-none text-xs font-bold focus:bg-white dark:focus:bg-slate-800 dark:text-white"
                        placeholder={language === 'ar' ? 'مثال: فحص دوري ناجح ومطابق لمعايير الأمان.' : 'e.g., Periodic test passed successfully.'}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-black text-slate-755 dark:text-slate-300 mb-1">
                        {language === 'ar' ? 'وصف أعمال الصيانة والإصلاح التفصيلي:' : 'Detailed Repair Actions Description:'}
                      </label>
                      <textarea
                        value={extractedOrder.description || ''}
                        onChange={(e) => setExtractedOrder({ ...extractedOrder, description: e.target.value })}
                        rows={3}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl outline-none text-xs font-bold focus:bg-white dark:focus:bg-slate-800 dark:text-white resize-none"
                      />
                    </div>

                    {/* Spare Parts Used */}
                    <div>
                      <label className="block text-xs font-black text-slate-755 dark:text-slate-300 mb-1">
                        {language === 'ar' ? 'قطع الغيار المستهلكة (مفصولة بفاصلة):' : 'Spare Parts Consumed (comma-separated):'}
                      </label>
                      <input
                        type="text"
                        value={Array.isArray(extractedOrder.partsUsed) ? extractedOrder.partsUsed.join(', ') : extractedOrder.partsUsed || ''}
                        onChange={(e) => setExtractedOrder({ ...extractedOrder, partsUsed: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl outline-none text-xs font-bold focus:bg-white dark:focus:bg-slate-800 dark:text-white"
                        placeholder={language === 'ar' ? 'مثال: فحمات مكابح، فلتر زيت، زيت محرك' : 'e.g., Brake pads, Oil filter, Engine oil'}
                      />
                    </div>
                  </div>
                ) : (
                  /* Initial upload & vehicle selection screen */
                  <div className="space-y-4">
                    {/* Dropdown vehicle list */}
                    <div>
                      <label className="block text-xs font-black text-slate-755 dark:text-slate-300 mb-2">
                        {language === 'ar' ? '1. اختر المركبة لربط مستند الصيانة بها:' : '1. Select Vehicle to Link Maintenance Log:'}
                      </label>
                      <select
                        disabled={isSmartInputExtracting}
                        value={smartInputVehicleId}
                        onChange={(e) => setSmartInputVehicleId(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-800 outline-none text-xs font-bold dark:text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="">{language === 'ar' ? '--- اختر مركبة من أسطول المؤسسة ---' : '--- Choose a vehicle from inventory ---'}</option>
                        {vehicleList.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.name} ({v.plateNumber}) - {v.type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Drag-and-Drop file area */}
                    <div>
                      <label className="block text-xs font-black text-slate-755 dark:text-slate-300 mb-2">
                        {language === 'ar' ? '2. ارفع صورة أو ملف PDF للفاتورة أو تقرير الصيانة:' : '2. Upload Receipt, Invoice, or Workshop PDF/Image:'}
                      </label>
                      <div
                        onDragOver={(e) => {
                          if (isSmartInputExtracting) return;
                          e.preventDefault();
                          setSmartInputDragActive(true);
                        }}
                        onDragLeave={() => setSmartInputDragActive(false)}
                        onDrop={(e) => {
                          if (isSmartInputExtracting) return;
                          e.preventDefault();
                          setSmartInputDragActive(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) autoClassifyFile(file);
                        }}
                        onClick={() => {
                          if (isSmartInputExtracting) return;
                          smartInputFileInputRef.current?.click();
                        }}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center space-y-3 ${
                          isSmartInputExtracting
                            ? 'border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/5 cursor-not-allowed opacity-60'
                            : smartInputDragActive 
                              ? 'border-indigo-500 bg-indigo-500/5 cursor-pointer' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50/50 dark:hover:bg-slate-950/10 cursor-pointer'
                        }`}
                      >
                        <input
                          ref={smartInputFileInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          disabled={isSmartInputExtracting}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) autoClassifyFile(file);
                          }}
                        />
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-slate-400 hover:text-indigo-500 transition-colors">
                          <Upload size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-white">
                            {smartInputFile ? smartInputFile.name : (language === 'ar' ? 'اسحب ملف فاتورة الصيانة هنا أو انقر للتصفح' : 'Drag & drop invoice document here or click to browse')}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            {language === 'ar' ? 'يدعم الصور (PNG, JPG) ومستندات الورش والتقارير بصيغة PDF' : 'Supports images or PDF document formats'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {smartInputFile && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl border border-indigo-500/20 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-indigo-500 ${isSmartInputExtracting ? 'animate-spin' : 'animate-ping'}`} />
                            <span className="text-xs font-black text-slate-800 dark:text-white">
                              {isSmartInputExtracting
                                ? (language === 'ar' ? 'جاري التحليل واستخلاص البيانات...' : 'AI is Extracting Data...')
                                : (language === 'ar' ? 'جاهز للاستخلاص والمزامنة الذكية' : 'Ready for AI Extraction')}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {(smartInputFile.size / 1024).toFixed(1)} KB
                          </span>
                        </div>

                        {/* Proactive Intelligent Classification UI */}
                        {proactiveDocType && DOCUMENT_TYPES_METADATA[proactiveDocType] && (
                          <div className={`p-4 rounded-xl border flex flex-col gap-2.5 transition-all ${DOCUMENT_TYPES_METADATA[proactiveDocType].colorClass}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {React.createElement(DOCUMENT_TYPES_METADATA[proactiveDocType].icon, {
                                  size: 18,
                                  className: "shrink-0"
                                })}
                                <span className="text-xs font-black">
                                  {language === 'ar' 
                                    ? `التصنيف التلقائي الذكي: ${DOCUMENT_TYPES_METADATA[proactiveDocType].labelAr}`
                                    : `Predicted Auto-Type: ${DOCUMENT_TYPES_METADATA[proactiveDocType].labelEn}`}
                                </span>
                              </div>
                              <span className="text-[9px] bg-white/60 dark:bg-slate-900/40 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide border border-current/10">
                                {language === 'ar' ? 'تصنيف استباقي' : 'Proactive AI'}
                              </span>
                            </div>
                            
                            <p className="text-[10px] opacity-80 leading-relaxed font-semibold">
                              {language === 'ar' 
                                ? DOCUMENT_TYPES_METADATA[proactiveDocType].descriptionAr
                                : DOCUMENT_TYPES_METADATA[proactiveDocType].descriptionEn}
                            </p>

                            <div className="pt-2 border-t border-current/10 space-y-1.5">
                              <label className="block text-[10px] font-bold opacity-90">
                                {language === 'ar' ? 'هل تود تعديل نوع المستند يدوياً قبل الحفظ؟' : 'Modify document type manually before saving?'}
                              </label>
                              <div className="grid grid-cols-3 gap-1.5">
                                {Object.entries(DOCUMENT_TYPES_METADATA).map(([typeKey, meta]) => (
                                  <button
                                    key={typeKey}
                                    type="button"
                                    disabled={isSmartInputExtracting}
                                    onClick={() => setProactiveDocType(typeKey)}
                                    className={`py-1.5 px-2 rounded-lg text-[9px] font-black border transition-all cursor-pointer truncate ${
                                      proactiveDocType === typeKey
                                        ? 'bg-slate-900 text-white border-transparent shadow-sm dark:bg-white dark:text-slate-900'
                                        : 'bg-white/40 dark:bg-slate-900/10 hover:bg-white/60 border-current/15'
                                    } ${isSmartInputExtracting ? 'opacity-60 cursor-not-allowed' : ''}`}
                                  >
                                    {language === 'ar' ? meta.shortLabelAr : meta.shortLabelEn}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={isSmartInputExtracting}
                          onClick={handleSmartInputExtract}
                          className={`w-full py-3.5 text-white rounded-xl font-black transition-all text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                            isSmartInputExtracting 
                              ? 'bg-indigo-400 dark:bg-indigo-850 cursor-not-allowed opacity-80' 
                              : 'bg-indigo-600 hover:bg-indigo-750 hover:scale-[101%] active:scale-95'
                          }`}
                        >
                          {isSmartInputExtracting ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Sparkles size={15} className="animate-pulse" />
                          )}
                          <span>
                            {isSmartInputExtracting 
                              ? (language === 'ar' ? 'جاري تحليل واستخلاص المستند بالذكاء الاصطناعي...' : 'AI is reading and parsing document...')
                              : (language === 'ar' ? 'بدء استخلاص البيانات بالذكاء الاصطناعي ✨' : 'Run AI Document Extraction ✨')}
                          </span>
                        </button>

                        {/* Live progress details and bar */}
                        {isSmartInputExtracting && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 mt-2">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-slate-500 dark:text-slate-400 animate-pulse">{smartInputLog}</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-mono">{smartInputProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-indigo-600 h-full transition-all duration-300 rounded-full" 
                                style={{ width: `${smartInputProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
                {extractedOrder ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setExtractedOrder(null)}
                      className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs transition-all cursor-pointer"
                    >
                      {language === 'ar' ? 'إعادة المحاولة / مستند آخر' : 'Retry / Another File'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveExtractedOrder}
                      className="px-5 py-2.5 bg-brand-green-600 hover:bg-brand-green-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check size={14} />
                      <span>{language === 'ar' ? 'حفظ ومزامنة الطلب بالسجل' : 'Save & Sync Order to History'}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSmartInputModalOpen(false);
                      setSmartInputFile(null);
                      setSmartInputVehicleId('');
                    }}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-600 rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    {language === 'ar' ? 'إلغاء وإغلاق' : 'Close'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Custom In-App Confirmation Modal for deleting an asset (Replaces window.confirm for 100% iframe reliability) */}
        {vehicleToDelete && (
          <div 
            id="delete-vehicle-modal-backdrop"
            className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setVehicleToDelete(null)}
          >
            <motion.div
              id="delete-vehicle-modal-dialog"
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white dark:bg-[#0f1422] border border-rose-200 dark:border-rose-900/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden"
              style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle top danger accent glow */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-100 dark:bg-rose-955/30 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0 border border-rose-200/60 dark:border-rose-900/40 shadow-xs">
                  <AlertTriangle size={24} className="animate-pulse" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {language === 'ar' ? 'تأكيد حذف الآلية نهائياً' : 'Confirm Asset Deletion'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {language === 'ar' 
                      ? 'هل أنت متأكد من رغبتك في حذف هذا السجل نهائياً من قاعدة بيانات الأسطول؟' 
                      : 'Are you sure you want to permanently remove this asset from the fleet database?'}
                  </p>
                </div>
              </div>

              {/* Asset Badge Card */}
              <div className="my-5 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {language === 'ar' ? 'اسم الآلية / المعدة:' : 'Asset Name:'}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[200px]">
                    {vehicleToDelete.name}
                  </span>
                </div>
                {vehicleToDelete.plateNumber && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800/60">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {language === 'ar' ? 'رقم اللوحة / الرمز الفني:' : 'Plate / Serial Number:'}
                    </span>
                    <span className="font-mono text-xs font-black text-brand-blue-650 dark:text-brand-blue-400 px-2 py-0.5 bg-brand-blue-50 dark:bg-brand-blue-900/20 rounded-md">
                      {vehicleToDelete.plateNumber}
                    </span>
                  </div>
                )}
                {vehicleToDelete.type && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800/60">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {language === 'ar' ? 'تصنيف الأصل:' : 'Asset Class:'}
                    </span>
                    <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                      {vehicleToDelete.type}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/25 border border-amber-200/60 dark:border-amber-900/30 rounded-xl mb-5 flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                <Info size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  {language === 'ar' 
                    ? 'سيتم إلغاء ربط السائقين المعينين وتحديث جداول التشغيل فوراً.' 
                    : 'Assigned drivers will be unlinked and fleet schedules updated immediately.'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5">
                <button
                  id="cancel-delete-vehicle-btn"
                  type="button"
                  onClick={() => setVehicleToDelete(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء الأمر' : 'Cancel'}
                </button>
                <button
                  id="confirm-delete-vehicle-btn"
                  type="button"
                  onClick={confirmDeleteVehicle}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-rose-600/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>{language === 'ar' ? 'تأكيد الحذف النهائي' : 'Permanently Delete'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Floating Bottom Action Bar for Multi-Selection Mode */}
        {isSelectionMode && (
          <motion.div
            id="multi-select-floating-bar"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] max-w-2xl w-[92%] sm:w-auto bg-slate-900/95 dark:bg-[#0b101d]/95 backdrop-blur-md text-white border border-slate-700/80 dark:border-slate-700/60 rounded-2xl shadow-2xl p-3 px-4 flex flex-wrap items-center justify-between sm:justify-center gap-3 sm:gap-4"
            style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-brand-blue-500 text-white font-black text-xs shadow-xs">
                {selectedVehicleIds.length}
              </span>
              <span className="text-xs font-bold text-slate-200">
                {language === 'ar' 
                  ? (selectedVehicleIds.length === 1 ? 'عجلة/مركبة واحدة محددة' : `${selectedVehicleIds.length} عجلات/مركبات محددة`)
                  : `${selectedVehicleIds.length} item(s) selected`}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700/60"
              >
                <CheckCheck size={14} className="text-brand-blue-400" />
                <span>{selectedVehicleIds.length === filteredVehicles.length ? (language === 'ar' ? 'إلغاء تحديد الكل' : 'Deselect All') : (language === 'ar' ? 'تحديد الكل' : 'Select All')}</span>
              </button>

              <button
                type="button"
                onClick={handleExitSelectionMode}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-700/60"
              >
                {language === 'ar' ? 'إلغاء التحديد' : 'Cancel'}
              </button>

              {(user.role === 'admin' || (user.role as string) === 'fleet_manager' || hasGranularPermission('edit-vehicle-data', user.role) || (user.role as string) !== 'viewer') && (
                <button
                  id="batch-delete-trigger-btn"
                  type="button"
                  disabled={selectedVehicleIds.length === 0}
                  onClick={() => setIsBatchDeleteModalOpen(true)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg ${
                    selectedVehicleIds.length === 0
                      ? 'bg-rose-900/40 text-rose-300/40 border border-rose-900/30 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 cursor-pointer active:scale-95'
                  }`}
                >
                  <Trash2 size={14} />
                  <span>
                    {language === 'ar' 
                      ? `حذف المحدد (${selectedVehicleIds.length})` 
                      : `Delete Selected (${selectedVehicleIds.length})`}
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Batch Delete Confirmation Modal */}
        {isBatchDeleteModalOpen && (
          <div 
            id="batch-delete-modal-backdrop"
            className="fixed inset-0 z-[130] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsBatchDeleteModalOpen(false)}
          >
            <motion.div
              id="batch-delete-modal-dialog"
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white dark:bg-[#0f1422] border border-rose-200 dark:border-rose-900/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
              style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top danger glow */}
              <div className="absolute -top-12 -left-12 w-36 h-36 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start gap-4 shrink-0 mb-4">
                <div className="p-3 bg-rose-100 dark:bg-rose-955/30 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0 border border-rose-200/60 dark:border-rose-900/40 shadow-xs">
                  <AlertTriangle size={26} className="animate-pulse" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {language === 'ar' 
                      ? `تأكيد حذف (${selectedVehicleIds.length}) مركبات / عجلات دفعة واحدة` 
                      : `Confirm Batch Deletion (${selectedVehicleIds.length} assets)`}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {language === 'ar' 
                      ? 'هل أنت متأكد من رغبتك في حذف جميع المركبات والعجلات المحددة نهائياً من قاعدة بيانات الأسطول؟ هذا الإجراء دائم ولا يمكن التراجع عنه.' 
                      : 'Are you sure you want to permanently remove all selected vehicles from the fleet database? This action cannot be undone.'}
                  </p>
                </div>
              </div>

              {/* List of selected vehicles */}
              <div className="my-2 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/80 dark:bg-slate-900/60 overflow-y-auto max-h-56 divide-y divide-slate-100 dark:divide-slate-800/80 shrink-1">
                {vehicleList
                  .filter(v => selectedVehicleIds.includes(v.id))
                  .map(v => (
                    <div key={v.id} className="py-2 flex items-center justify-between gap-2 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <Truck size={13} className="text-slate-500 dark:text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{v.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{v.department} • {v.type}</div>
                        </div>
                      </div>
                      {v.plateNumber && (
                        <span className="font-mono text-[11px] font-black text-brand-blue-650 dark:text-brand-blue-400 px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shrink-0">
                          {v.plateNumber}
                        </span>
                      )}
                    </div>
                  ))}
              </div>

              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/25 border border-amber-200/60 dark:border-amber-900/30 rounded-xl my-3 flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300 font-medium shrink-0">
                <Info size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  {language === 'ar' 
                    ? 'سيتم إلغاء تعيين السائقين المرتبطين بهذه المركبات وتحديث مؤشرات وجداول الأسطول فوراً.' 
                    : 'Assigned drivers will be unlinked and all related fleet records updated immediately.'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  id="cancel-batch-delete-btn"
                  type="button"
                  onClick={() => setIsBatchDeleteModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء الأمر' : 'Cancel'}
                </button>
                <button
                  id="confirm-batch-delete-btn"
                  type="button"
                  onClick={handleConfirmBatchDelete}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-rose-600/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>
                    {language === 'ar' 
                      ? `تأكيد حذف (${selectedVehicleIds.length}) مركبة نهائياً` 
                      : `Permanently Delete (${selectedVehicleIds.length}) Assets`}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
