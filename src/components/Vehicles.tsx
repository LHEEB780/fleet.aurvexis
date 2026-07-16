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
  Edit
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

// Definitions for custom selectable icons for vehicles with matching eye-friendly colors
export const VEHICLE_ICONS: Record<string, { component: React.ComponentType<{ size?: number; className?: string }>; label: string; bg: string; text: string }> = {
  truck: { component: Truck, label: 'شاحنة نقل / نقل ثقيل', bg: 'bg-brand-blue-50 dark:bg-brand-blue-900/10', text: 'text-brand-blue-600 dark:text-brand-blue-400' },
  car: { component: Car, label: 'سيارة خفيفة / ملاكي', bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-450' },
  bus: { component: Bus, label: 'حافلة ركاب / نقل جماعي', bg: 'bg-sky-50 dark:bg-sky-950/20', text: 'text-sky-600 dark:text-sky-400' },
  wrench: { component: Wrench, label: 'مركبة خدمات / صيانة ورشية', bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-450' },
  shield: { component: Shield, label: 'أمن وطوارئ / رصد أمني', bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-600 dark:text-indigo-400' },
  cpu: { component: Cpu, label: 'آلية ذكية / معدة إلكترونية', bg: 'bg-violet-50 dark:bg-violet-950/20', text: 'text-violet-600 dark:text-violet-400' },
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
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialVehicles;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [trendMetric, setTrendMetric] = useState<'fuel' | 'tire'>('fuel');
  const [selectedVehicleForHistory, setSelectedVehicleForHistory] = useState<Vehicle | null>(null);
  const [selectedVehicleForQr, setSelectedVehicleForQr] = useState<Vehicle | null>(null);

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

  const handleDeleteVehicle = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف المركبة "${name}" نهائياً من سجلات الأسطول؟`)) {
      const updated = vehicleList.filter(v => v.id !== id);
      setVehicleList(updated);
      
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
          window.dispatchEvent(new Event('storage'));
        }
      } catch(e) {
        console.error(e);
      }
      
      // Nice transient visual notification toast
      const notifyDiv = document.createElement('div');
      notifyDiv.className = "fixed bottom-5 right-5 z-[100] bg-rose-600 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-2 border border-rose-500 text-xs font-black";
      notifyDiv.style.direction = "rtl";
      notifyDiv.innerHTML = `<span>✔ تم حذف سجل المركبة بنجاح!</span>`;
      document.body.appendChild(notifyDiv);
      setTimeout(() => notifyDiv.remove(), 4000);
    }
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
    const matchesSearch = v.name.includes(searchTerm) || v.plateNumber.includes(searchTerm);
    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return v.status === 'active';
    if (statusFilter === 'maintenance') return v.status === 'maintenance';
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

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
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

  const handleAiBulkImport = (file: File) => {
    if (!file) return;
    setIsGenerating(true);
    setGenerationProgress(10);
    setGenerationLog(language === 'ar' ? `تحليل ملف استيراد الأصول: ${file.name}...` : `Parsing asset file: ${file.name}...`);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        setGenerationProgress(30);
        setGenerationLog(language === 'ar' ? 'الاتصال بخوادم الذكاء الاصطناعي ومطابقة رؤوس الأعمدة وتدقيق البيانات...' : 'Connecting to AI servers to match headers and clean data...');
        
        const response = await fetch('/api/ai/bulk-import-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText: text, language })
        });
        
        setGenerationProgress(65);
        setGenerationLog(language === 'ar' ? 'جاري تصنيف المركبات ومطابقة الفئات وتوليد سجل تشغيلي لـ 3 سنوات...' : 'Sorting vehicles, aligning types, and generating a 3-year retroactive archive...');
        
        if (!response.ok) {
          throw new Error('Failed to connect to bulk import API');
        }
        
        const data = await response.json();
        const parsedVehicles = data.vehicles || [];
        const parsedOrders = data.maintenanceOrders || [];
        
        if (parsedVehicles.length === 0) {
          throw new Error('No vehicles found or parsed from file content');
        }
        
        setGenerationProgress(85);
        setGenerationLog(language === 'ar' ? 'مزامنة وحفظ المركبات والبيانات بقاعدة البيانات...' : 'Saving parsed details and orders to database...');
        
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
            details: `قام باستيراد ومزامنة ${parsedVehicles.length} مركبة حقيقية من الملف المرفوع، وقام الذكاء الاصطناعي بمطابقة الرؤوس وتوزيع البيانات وتوليد سجل صيانة لـ 3 سنوات بأثر رجعي يشمل ${parsedOrders.length} طلب صيانة مع التكاليف والمحاور بشكل منطقي متطابق.`
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
              ? `تم بنجاح استيراد ومطابقة ${parsedVehicles.length} مركبة حقيقية من ملفك بواسطة الذكاء الاصطناعي، وتوليد أرشيف تشغيلي كامل وصيانة متطابق لـ 3 سنوات ماضية يشمل ${parsedOrders.length} طلب صيانة تفصيلي مع قطع الغيار والتكاليف!`
              : `Import complete: successfully parsed and loaded ${parsedVehicles.length} real vehicles with 3-year operation log history containing ${parsedOrders.length} work orders!`
          );
        }, 1200);
        
      } catch (err: any) {
        console.error(err);
        setIsGenerating(false);
        setUploadedFile(null);
        alert(
          language === 'ar'
            ? `عذراً، فشل الذكاء الاصطناعي في تحليل هذا الملف. تأكد من أن الملف نصي أو CSV ويحتوي على بيانات واضحة للمركبات.`
            : `Failed to import: AI model could not map file content. Make sure it is a valid text or CSV format.`
        );
      }
    };
    reader.readAsText(file);
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

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {language === 'ar' ? 'إدارة المعدات والمركبات' : 'Fleet & Equipment Desk'}
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
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'ar' 
              ? 'سجل كامل بجميع الأصول التابعة للمؤسسة تفصيلياً مع الإطارات والبيانات المتقدمة.' 
              : 'Detailed inventory log spanning key components, live pressures, and operational status.'}
          </p>
        </div>
        {user.role === 'admin' && (
          <div className="flex flex-wrap items-center gap-2">
            <button 
              id="bulk-import-vehicle-btn"
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-violet-600/10 hover:bg-violet-600/20 text-violet-750 dark:text-violet-300 border border-violet-500/25 rounded-xl font-bold shadow-sm active:scale-[98%] transition-all text-xs cursor-pointer"
            >
              <Sparkles size={14} className="animate-pulse text-violet-500" />
              <span>{language === 'ar' ? 'الاستيراد والإنشاء الجماعي للأصول' : 'Smart Bulk Import & Creation'}</span>
            </button>
            <button 
              id="add-vehicle-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-brand-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-brand-blue-700 active:scale-[98%] transition-all text-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>{t('إضافة مركبة تفصيلياً')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft">
        <div className="relative flex-1 min-w-[150px]">
          <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
            <Search size={14} />
          </span>
          <input 
            type="text"
            placeholder="البحث بواسطة اسم المركبة أو رقم اللوحة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-16 py-1.5 bg-slate-50 dark:bg-slate-900 border border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-50/50 rounded-lg transition-all outline-none text-[13px] dark:text-white font-medium"
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
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400 dark:text-slate-500 font-bold">الحالة:</span>
          <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-205 dark:border-slate-800">
            <button 
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${statusFilter === 'all' ? 'bg-white dark:bg-slate-800 text-brand-blue-600 dark:text-brand-blue-400 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
            >
              الكل
            </button>
            <button 
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${statusFilter === 'active' ? 'bg-white dark:bg-slate-800 text-brand-green-500 dark:text-brand-green-400 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
            >
              فعالة
            </button>
            <button 
              onClick={() => setStatusFilter('maintenance')}
              className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${statusFilter === 'maintenance' ? 'bg-white dark:bg-slate-800 text-brand-yellow-600 dark:text-brand-yellow-400 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
            >
              تحت الصيانة
            </button>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400 dark:text-slate-500 font-bold">طريقة العرض:</span>
          <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-205 dark:border-slate-800">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-brand-blue-650 dark:text-brand-blue-400 shadow-sm' : 'text-slate-400 dark:text-slate-550'}`}
              title="عرض الشبكة الكاملة"
            >
              <LayoutGrid size={12} />
              <span className="mr-1">الشبكة</span>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-brand-blue-650 dark:text-brand-blue-405 shadow-sm' : 'text-slate-400 dark:text-slate-550'}`}
              title="عرض القائمة التفصيلية"
            >
              <List size={12} />
              <span className="mr-1">{language === 'ar' ? 'القائمة' : 'List'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Vehicles Grid and List Dual-View Control */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredVehicles.map((vehicle) => {
            const totalCost = maintenanceOrders
              .filter(o => o.vehicleId === vehicle.id && o.status === 'completed')
              .reduce((sum, o) => sum + (o.cost || 0), 0);

            const nextMaint = getNextMaintenanceInfo(vehicle.id, vehicle.lastMaintenance);

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
                onClick={() => setSelectedVehicleForHistory(vehicle)}
                className={`bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-105 dark:border-slate-805/80 p-3 sm:p-4 pb-3 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 ${expandedVehicleIds[vehicle.id] ? 'h-auto min-h-[420px]' : 'aspect-square'} ${statusColorLineStyle}`}
              >
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
                        <div className="text-[8.5px] sm:text-[9.5px] text-slate-455 dark:text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                          <span className="truncate">{vehicle.type}</span>
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

                  {user.role === 'admin' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteVehicle(vehicle.id, vehicle.name);
                      }}
                      className="p-1 px-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/15 text-rose-500 hover:text-rose-600 text-[8.5px] font-extrabold rounded-md transition-all flex items-center gap-0.5 cursor-pointer border border-rose-100/50 dark:border-rose-955/35"
                      title="حذف المركبة"
                    >
                      <Trash2 size={9} className="shrink-0" />
                      <span>حذف</span>
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
                    <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-bold font-mono">
                      لا يوجد مركبات تطابق معايير وثوابت البحث الحالية.
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((vehicle) => {
                    const totalCost = maintenanceOrders
                      .filter(o => o.vehicleId === vehicle.id && o.status === 'completed')
                      .reduce((sum, o) => sum + (o.cost || 0), 0);
                    const nextMaint = getNextMaintenanceInfo(vehicle.id, vehicle.lastMaintenance);

                    let statusLineStyle = 'border-r-[6px] border-r-emerald-500 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10';
                    if (vehicle.status === 'maintenance') {
                      statusLineStyle = 'border-r-[6px] border-r-amber-500 hover:bg-amber-500/5 dark:hover:bg-amber-500/10';
                    } else if (vehicle.status === 'stopped') {
                      statusLineStyle = 'border-r-[6px] border-r-rose-500 hover:bg-rose-500/5 dark:hover:bg-rose-500/10';
                    }

                    return (
                      <React.Fragment key={vehicle.id}>
                        <tr 
                          onClick={() => setSelectedVehicleForHistory(vehicle)}
                          className={`transition-all duration-200 cursor-pointer group hover:bg-indigo-50/40 dark:hover:bg-slate-800/40 hover:shadow-xs ${statusLineStyle}`}
                        >
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
                              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                                {vehicle.type} • صنع {vehicle.modelYear || '2022'} • {vehicle.tireCount || 4} عجلات ({vehicle.tireStatus || 'ممتاز'})
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

                            {user.role === 'admin' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteVehicle(vehicle.id, vehicle.name);
                                }}
                                className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-500 hover:text-rose-600 rounded-xl transition-all border border-rose-100/50 dark:border-rose-955/35 cursor-pointer"
                                title="حذف المركبة"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {expandedVehicleIds[vehicle.id] && (
                        <tr className="bg-slate-50/50 dark:bg-[#111727]/40 border-b border-slate-100 dark:border-slate-800/60">
                          <td colSpan={9} className="py-4 px-6 text-right">
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
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[1.8rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
              {/* Modal Header */}
              <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-600 dark:text-violet-400">
                    <Sparkles size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {language === 'ar' ? 'الاستيراد والإنشاء الجماعي الذكي للأصول والبيانات' : 'Smart Bulk Asset Import & Data Creation'}
                    </h3>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                      {language === 'ar' ? 'رفع ملفات الأساطيل الكبيرة أو توليد سجل تشغيلي تاريخي بالكامل لـ 3 سنوات' : 'Import large fleets or generate comprehensive 3-year historical archives'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !isGenerating && setIsBulkModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
                  disabled={isGenerating}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
                {/* Quick Guide explaining this feature */}
                <div className="bg-violet-500/10 dark:bg-violet-500/15 p-4.5 rounded-2xl border border-violet-500/20 space-y-2.5">
                  <h4 className="text-xs font-black text-violet-850 dark:text-violet-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-violet-500 shrink-0" />
                    <span>{language === 'ar' ? 'الدليل السريع: ميزة المزامنة والمحاكاة للأساطيل بالذكاء الاصطناعي' : 'Quick Guide: Fleet Sync & AI Simulation Feature'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                    {language === 'ar' 
                      ? 'تتيح هذه الميزة الفائقة للمؤسسات رفع أي ملف بيانات حقيقي للمركبات والأساطيل (حتى وإن كانت الأعمدة غير مرتبة أو عشوائية). يقوم الذكاء الاصطناعي بقراءة وتصنيف الحقول لبناء قراءة صحيحة، مع توليد سجل تشغيلي وصيانة شامل بأثر رجعي يمتد لـ 3 سنوات كاملة تناسب طبيعة عمل كل آلية.'
                      : 'This feature allows you to upload raw fleet spreadsheets (even with messy or random columns). The AI will parse and align them correctly, while generating tailored, retroactive 3-year operating and workshop records matching each vehicle\'s type.'}
                  </p>
                </div>

                {isGenerating ? (
                  /* Generation status page */
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-600 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={20} className="text-violet-600 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1.5 max-w-md">
                      <h4 className="text-sm font-black text-slate-800 dark:text-white">
                        {language === 'ar' ? 'جاري معالجة ومطابقة البيانات بالذكاء الاصطناعي...' : 'Processing & mapping fleet logs via AI...'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold animate-pulse">
                        {generationLog}
                      </p>
                    </div>
                    <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-violet-600 h-full rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${generationProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-xs font-black text-violet-600 dark:text-violet-400 font-mono">{generationProgress}%</span>
                  </div>
                ) : (
                  /* Options page */
                  <div className="space-y-6">
                    {/* Option 1 view: Drag and Drop */}
                    <div className="space-y-4">
                      <div
                        onDragOver={handleDragOverFile}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDropFile}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                          dragActive 
                            ? 'border-violet-500 bg-violet-500/5' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-violet-400 hover:bg-slate-50/50 dark:hover:bg-slate-950/10'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xlsx,.xls,.txt"
                          className="hidden"
                          onChange={handleFileInputChange}
                        />
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-slate-400 group-hover:text-violet-500 transition-colors">
                          <Upload size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-white">
                            {uploadedFile ? uploadedFile.name : (language === 'ar' ? 'اسحب ملف بيانات الأسطول الحقيقي هنا أو انقر للتصفح' : 'Drag & drop real fleet spreadsheet here or click to browse')}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            {language === 'ar' ? 'يدعم ملفات Excel أو CSV أو ملفات النصوص غير المرتبة' : 'Supports Excel, CSV, or raw unstructured text dumps'}
                          </p>
                        </div>
                      </div>

                      {uploadedFile && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4.5 bg-violet-500/5 dark:bg-violet-500/10 rounded-2xl border border-violet-500/20 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
                              <span className="text-xs font-black text-slate-800 dark:text-white">
                                {language === 'ar' ? 'جاهز للمطابقة الذكية والمزامنة' : 'Ready for AI Mapping & Sync'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              {(uploadedFile.size / 1024).toFixed(1)} KB
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAiBulkImport(uploadedFile)}
                            className="w-full py-3.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl font-black transition-all text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer hover:scale-[101%] active:scale-95"
                          >
                            <Sparkles size={15} className="animate-pulse" />
                            <span>
                              {language === 'ar' 
                                ? 'مزامنة وبدء معالجة الذكاء الاصطناعي الذكية ومحاكاة 3 سنوات ماضية 🚀' 
                                : 'Sync & Begin AI Mapping with Retroactive 3-Year Archive 🚀'}
                            </span>
                          </button>
                        </motion.div>
                      )}

                      <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-semibold">
                        <span className="text-slate-550">{language === 'ar' ? 'تحميل الهيكل المعتمد للنموذج الاسترشادي:' : 'Download reference schema spreadsheet template:'}</span>
                        <a 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            alert(language === 'ar' ? 'تم تنزيل النموذج المعتمد (fleet_template.xlsx) بنجاح!' : 'Fleet template (fleet_template.xlsx) downloaded successfully!');
                          }}
                          className="text-violet-600 dark:text-violet-400 hover:underline font-black flex items-center gap-1 cursor-pointer"
                        >
                          <span>fleet_template.xlsx</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-600 rounded-xl font-bold text-xs transition-all cursor-pointer"
                  disabled={isGenerating}
                >
                  {language === 'ar' ? 'إلغاء وإغلاق' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
