import React, { useState, useEffect, useMemo, useRef } from 'react';
import VehiclePeriodicTab from './VehiclePeriodicTab';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie,
  CartesianGrid
} from 'recharts';
import { 
  X, 
  History, 
  DollarSign, 
  Wrench, 
  Calendar,
  FileText,
  ChevronRight,
  CircleDot,
  Fuel,
  Cpu,
  ShieldCheck,
  Weight,
  Info,
  Tag,
  MapPin,
  ClipboardList,
  Fingerprint,
  Truck,
  Car,
  Bus,
  Shield,
  Eye,
  Upload,
  Image as ImageIcon,
  Film,
  Plus,
  Check,
  Star,
  RefreshCw,
  AlertTriangle,
  Play,
  Pause,
  Trash2,
  ArrowUpRight,
  Download,
  User as UserIcon,
  ExternalLink,
  ChevronLeft,
  Settings,
  Activity,
  Search,
  ChevronDown,
  Filter,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle, Technician, User } from '../types';
import VehicleQrModal from './VehicleQrModal';
import QRCode from 'qrcode';
import { maintenanceOrders as staticOrders } from '../data';
import { getRealAvatarByName } from './Drivers';

// Define layout-specific extended models
interface SupplierPart {
  id: string;
  name: string;
  partNumber: string;
  supplier: string;
  warrantyMonths: number;
  qty: number;
  unitPrice: number;
  notes?: string;
  newPartImage?: string;
  wornPartImage?: string;
}

interface AttachmentFile {
  id: string;
  name: string;
  url: string; // Base64 dynamic / standard image
  type: 'invoice' | 'photo' | 'video';
  size: string;
  uploadedAt: string;
}

interface RichMaintenanceOrder {
  id: string;
  vehicleId: string;
  orderNumber: string;
  date: string;
  description: string;
  category: 'mechanical' | 'electrical' | 'cooling' | 'hydraulic' | 'bodywork' | 'tires' | 'brakes';
  status: 'pending' | 'in-progress' | 'completed';
  technicianId?: string;
  priority: 'low' | 'medium' | 'high';
  cost?: number;
  partsUsed?: string[];
  isArchived?: boolean;
  workshopId?: string;
  progress?: number;
  milestones?: { title: string; checked: boolean }[];
  lastUpdate?: string;
  
  // Custom-crafted fields for deep analytical tracking
  supplierParts?: SupplierPart[];
  attachments?: AttachmentFile[];
  qualityRating?: number;
  chiefNotes?: string;
  warrantyCertificate?: string;
}

const VEHICLE_ICONS: Record<string, { component: React.ComponentType<{ size?: number; className?: string }>; label: string; bg: string; text: string }> = {
  truck: { component: Truck, label: 'شاحنة نقل / نقل ثقيل', bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-600 dark:text-indigo-400' },
  car: { component: Car, label: 'سيارة خفيفة / ملاكي', bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-450' },
  bus: { component: Bus, label: 'حافلة ركاب / نقل جماعي', bg: 'bg-sky-50 dark:bg-sky-950/20', text: 'text-sky-600 dark:text-sky-400' },
  wrench: { component: Wrench, label: 'مركبة خدمات / صيانة ورشية', bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-450' },
  shield: { component: Shield, label: 'أمن وطوارئ / رصد أمني', bg: 'bg-violet-50 dark:bg-violet-950/20', text: 'text-violet-600 dark:text-violet-400' },
  cpu: { component: Cpu, label: 'آلية ذكية / معدة إلكترونية', bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400' },
};

interface VehicleHistoryProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  user?: User;
}

export default function VehicleHistory({ vehicle, onClose, user }: VehicleHistoryProps) {
  // Navigation setup
  const [activeTab, setActiveTab] = useState<'specs' | 'history' | 'periodic' | 'finance'>('specs');
  const [financeSubTab, setFinanceSubTab ] = useState<'bills' | 'parts'>('bills');
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [showQrModal, setShowQrModal] = useState(false);
  const [localQrUrl, setLocalQrUrl] = useState<string>('');

  useEffect(() => {
    if (vehicle) {
      const origin = window.location.origin + window.location.pathname;
      const qrUrl = `${origin}?vehicleId=${vehicle.id}`;
      QRCode.toDataURL(qrUrl, {
        width: 256,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then((url) => {
          setLocalQrUrl(url);
        })
        .catch((err) => {
          console.error('[Local QR Generation] Failed:', err);
        });
    }
  }, [vehicle]);
  
  // State for specs interactive dashboard
  const [selectedTire, setSelectedTire] = useState<'FL' | 'FR' | 'ML' | 'MR' | 'RL' | 'RR'>('FL');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isRefilling, setIsRefilling] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationSuccess, setCalibrationSuccess] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationSuccess, setRotationSuccess] = useState(false);

  const [tireStats, setTireStats] = useState<Record<string, { label: string; pressure: number; temp: number; tread: number; status: 'excellent' | 'normal' | 'low' | 'high'; alignment: string; sensor: string }>>({
    FL: { label: 'أمامي أيسر (توجيه)', pressure: 34, temp: 29, tread: 85, status: 'excellent', alignment: 'موافق من الميزان بالكامل', sensor: 'سليم ومفعل' },
    FR: { label: 'أمامي أيمن (توجيه)', pressure: 29, temp: 31, tread: 82, status: 'low', alignment: 'انحياز بسيط (+0.03)', sensor: 'سليم ومفعل' },
    ML: { label: 'أوسط أيسر (دفع حمولة)', pressure: 35, temp: 28, tread: 90, status: 'excellent', alignment: 'موافق', sensor: 'سليم ومفعل' },
    MR: { label: 'أوسط أيمن (دفع حمولة)', pressure: 35, temp: 28, tread: 90, status: 'excellent', alignment: 'موافق', sensor: 'سليم ومفعل' },
    RL: { label: 'خلفي أيسر (دفع أساسي)', pressure: 35, temp: 27, tread: 94, status: 'excellent', alignment: 'موافق ومحاذي', sensor: 'سليم ومفعل' },
    RR: { label: 'خلفي أيمن (دفع أساسي)', pressure: 33, temp: 30, tread: 91, status: 'normal', alignment: 'موافق ومحاذي', sensor: 'سليم ومفعل' },
  });

  const handleRefillTires = () => {
    setIsRefilling(true);
    setTimeout(() => {
      setTireStats(prev => {
        const reset: any = {};
        Object.keys(prev).forEach(k => {
          reset[k] = { ...prev[k], pressure: 35, status: 'excellent', temp: 25 };
        });
        return reset;
      });
      setIsRefilling(false);
    }, 1200);
  };

  const handleCalibrateSensors = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setTireStats(prev => {
        const updated: any = {};
        Object.keys(prev).forEach(k => {
          updated[k] = { ...prev[k], alignment: 'معايرة ليزرية تامة 100%', sensor: 'تمت التهيئة والمعايرة' };
        });
        return updated;
      });
      setIsCalibrating(false);
      setCalibrationSuccess(true);
      setTimeout(() => setCalibrationSuccess(false), 2500);
    }, 1200);
  };

  const handleRotateTires = () => {
    setIsRotating(true);
    setTimeout(() => {
      setTireStats(prev => ({
        ...prev,
        FL: { ...prev.FL, tread: prev.RL.tread, pressure: prev.RL.pressure },
        FR: { ...prev.FR, tread: prev.RR.tread, pressure: prev.RR.pressure },
        RL: { ...prev.RL, tread: prev.FL.tread, pressure: prev.FL.pressure },
        RR: { ...prev.RR, tread: prev.FR.tread, pressure: prev.FR.pressure },
      }));
      setIsRotating(false);
      setRotationSuccess(true);
      setTimeout(() => setRotationSuccess(false), 2500);
    }, 1200);
  };

  const copyToClipboard = (text: string, designation: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(designation);
    setTimeout(() => setCopiedText(null), 2000);
  };
  
  // Real-time Database state synchronized with localstorage key: fleet_maintenance_orders_v2
  const [orders, setOrders] = useState<RichMaintenanceOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Filter keys for history
  const [historySearch, setHistorySearch] = useState('');
  const [historyCategory, setHistoryCategory] = useState<string>('all');
  const [historyTechnician, setHistoryTechnician] = useState<string>('all');
  const [historyWorkshop, setHistoryWorkshop] = useState<string>('all');

  // Dynamically loaded technicians & workshops for filtering
  const [techniciansList, setTechniciansList] = useState<Technician[]>([]);
  const [workshopsList, setWorkshopsList] = useState<any[]>([]);

  const [driversList, setDriversList] = useState<any[]>([]);
  useEffect(() => {
    const savedDrivers = localStorage.getItem('fleet_drivers_v2');
    if (savedDrivers) {
      try {
        const parsed = JSON.parse(savedDrivers);
        if (Array.isArray(parsed)) {
          const migrated = parsed.map((driver: any) => {
            if (!driver.avatar || driver.avatar.includes('api.dicebear.com') || driver.avatar.includes('dicebear')) {
              return {
                ...driver,
                avatar: getRealAvatarByName(driver.name),
              };
            }
            return driver;
          });
          setDriversList(migrated);
        } else {
          setDriversList([]);
        }
      } catch (e) {}
    }
  }, [vehicle]);

  const assignedDriver = useMemo(() => {
    if (!vehicle) return null;
    return driversList.find((d: any) => d.assignedVehicleId === vehicle.id || d.id === vehicle.assignedDriverId);
  }, [driversList, vehicle]);

  useEffect(() => {
    // Load technicians from localStorage or fallback
    const savedTechs = localStorage.getItem('fleet_technicians_v2');
    if (savedTechs) {
      try {
        setTechniciansList(JSON.parse(savedTechs));
      } catch (e) {
        console.error("Error loading technicians for history filter", e);
      }
    } else {
      // Import static fallback
      import('../data').then((module) => {
        setTechniciansList(module.technicians || []);
      });
    }

    // Load workshops from localStorage or fallback
    const savedWorkshops = localStorage.getItem('fleet_workshops');
    if (savedWorkshops) {
      try {
        setWorkshopsList(JSON.parse(savedWorkshops));
      } catch (e) {
        console.error("Error loading workshops for history filter", e);
      }
    } else {
      setWorkshopsList([
        { id: 'WS-1', name: 'ورشة الميكانيك المركزي والصيانة الثقيلة' },
        { id: 'WS-2', name: 'وحدة الأنظمة الكهربائية والبرمجة والعدسات' },
        { id: 'WS-3', name: 'ورشة الأنظمة الهيدروليكية والأذرعة الميكانيكية' }
      ]);
    }
  }, []);

  // Simulated live file upload
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingType, setUploadingType] = useState<'invoice' | 'photo' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Part adding modal & inputs (simulating editing and expanding materials in-app)
  const [showAddPart, setShowAddPart] = useState(false);
  const [newPart, setNewPart] = useState({
    name: '',
    partNumber: '',
    supplier: '',
    warrantyMonths: 12,
    qty: 1,
    unitPrice: 150,
    notes: '',
    newPartImage: '',
    wornPartImage: ''
  });

  // Photo viewer state inside history
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoPlayId, setVideoPlayId] = useState<string | null>(null);
  const [videoPercent, setVideoPercent] = useState<Record<string, number>>({});

  // Loading maintenance orders in an advanced error-tolerant structure
  useEffect(() => {
    if (!vehicle) return;
    
    const saved = localStorage.getItem('fleet_maintenance_orders_v2');
    let loadedOrders: RichMaintenanceOrder[] = [];
    
    if (saved) {
      try {
        loadedOrders = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse fleet maintenance orders", e);
        loadedOrders = [...staticOrders];
      }
    } else {
      loadedOrders = [...staticOrders];
    }

    // High fidelity seed injector: If none of the loaded orders have supplierParts, 
    // inject rich manager metadata into completed orders to make it gorgeous!
    let changed = false;
    const enrichedOrders = loadedOrders.map(order => {
      // Check if it belongs to this vehicle and is completed, and doesn't have supplier parts
      if (order.vehicleId === vehicle.id && order.status === 'completed' && !order.supplierParts) {
        changed = true;
        
        // Custom generator based on description
        const seedParts: SupplierPart[] = [];
        const seedAttachments: AttachmentFile[] = [];
        let rating = 5;
        let notes = '';

        if (order.description.includes('إطارات')) {
          seedParts.push(
            {
              id: `${order.id}-p1`,
              name: 'إطارات ميشلان المقاومة للحرارة العالية 22.5',
              partNumber: 'MIC-315-80R225',
              supplier: 'مجموعة الموزع الحصري للإطارات المحدودة',
              warrantyMonths: 24,
              qty: order.partsUsed?.length || 2,
              unitPrice: 450
            },
            {
              id: `${order.id}-p2`,
              name: 'صمامات ضغط هواء مع الحساسات المصاحبة',
              partNumber: 'TPMS-VAL-901',
              supplier: 'شركة الاستيراد الوطنية لقطع الغيار',
              warrantyMonths: 12,
              qty: 4,
              unitPrice: 75
            }
          );
          seedAttachments.push(
            {
              id: `${order.id}-att1`,
              name: 'فاتورة الشراء الضريبية - رقم INV-94821',
              url: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400',
              type: 'invoice',
              size: '1.2 MB',
              uploadedAt: order.date
            },
            {
              id: `${order.id}-att2`,
              name: 'صورة الإطار التالف والشق بمحيط السير',
              url: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=400',
              type: 'photo',
              size: '890 KB',
              uploadedAt: order.date
            }
          );
          rating = 5;
          notes = 'تم تركيب طقم الإطارات على محاور الدفع وضبط القياس بالليزر لدرجة الصفر المطلق. الضمان يمتد لسنتين ضد العيوب المصنعية للكاوتشوك.';
        } else if (order.description.includes('زيت') || order.description.includes('صيانة دورية')) {
          seedParts.push(
            {
              id: `${order.id}-p3`,
              name: 'زيت محرك تويوتا تخليقي بالكامل 5W-30',
              partNumber: 'TYT-OIL-5W30-4L',
              supplier: 'مورد معتمد - بترومين السعودية',
              warrantyMonths: 3,
              qty: 2,
              unitPrice: 140
            },
            {
              id: `${order.id}-p4`,
              name: 'فلتر زيت أصلي (سيفون محرك)',
              partNumber: 'TYT-FIL-91023',
              supplier: 'الشركة العربية لقطع غيار ميكانيك',
              warrantyMonths: 6,
              qty: 1,
              unitPrice: 65
            }
          );
          seedAttachments.push(
            {
              id: `${order.id}-att3`,
              name: 'إيصال دفع نقدي وتقرير الفحص المجهري',
              url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400',
              type: 'invoice',
              size: '450 KB',
              uploadedAt: order.date
            },
            {
              id: `${order.id}-att4`,
              name: 'صورة الفلتر الجديد المستبدل قبل وضعه',
              url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400',
              type: 'photo',
              size: '1.1 MB',
              uploadedAt: order.date
            }
          );
          rating = 4;
          notes = 'تغيير الزيت بعد تجاوز العداد 20 ألف كم. تم غسيل تجويف المحرك وشفط الرواسب المعدنية بدقة. الضغط والحرارية ممتازين.';
        } else {
          // General maintenance seed
          seedParts.push(
            {
              id: `${order.id}-p_gen_1`,
              name: 'قطع تصفية السيستم ومحابس الدفع الهيدروليكي',
              partNumber: 'HYD-VAL-X01',
              supplier: 'ورشة الأمل المتخصصة ومخرطة الرياض السريعة',
              warrantyMonths: 18,
              qty: 1,
              unitPrice: 320
            }
          );
          seedAttachments.push(
            {
              id: `${order.id}-att_gen_1`,
              name: 'أمر الشغل الرسمي ونسخة فاتورة المورد',
              url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=400',
              type: 'invoice',
              size: '2.1 MB',
              uploadedAt: order.date
            }
          );
          rating = 5;
          notes = 'تم الانتهاء من فحص واختبار التوصيلات بضغط عالي والنتيجة آمنة وتشغيلية بالأسطول.';
        }

        return {
          ...order,
          supplierParts: seedParts,
          attachments: seedAttachments,
          qualityRating: rating,
          chiefNotes: notes
        };
      }
      return order;
    });

    if (changed) {
      localStorage.setItem('fleet_maintenance_orders_v2', JSON.stringify(enrichedOrders));
      setOrders(enrichedOrders);
    } else {
      setOrders(loadedOrders);
    }
  }, [vehicle, reloadTrigger]);

  // Sync state back to localStorage on modification 
  const persistOrders = (updated: RichMaintenanceOrder[]) => {
    setOrders(updated);
    localStorage.setItem('fleet_maintenance_orders_v2', JSON.stringify(updated));
  };

  // Memoized lists of matching history orders for this current vehicle 
  const vehicleHistory = useMemo(() => {
    if (!vehicle) return [];
    
    return orders
      .filter(order => order.vehicleId === vehicle.id)
      .filter(order => {
        // Search filter
        const query = historySearch.trim().toLowerCase();
        if (query) {
          const matchNo = order.orderNumber.toLowerCase().includes(query);
          const matchDesc = order.description.toLowerCase().includes(query);
          if (!matchNo && !matchDesc) return false;
        }
        // Category filter
        if (historyCategory !== 'all' && order.category !== historyCategory) return false;
        
        // Technician filter
        if (historyTechnician !== 'all' && order.technicianId !== historyTechnician) return false;
        
        // Workshop filter
        if (historyWorkshop !== 'all' && order.workshopId !== historyWorkshop) return false;

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, vehicle, historySearch, historyCategory, historyTechnician, historyWorkshop]);

  // Overall financial summary
  const totalCost = useMemo(() => {
    return vehicleHistory.reduce((sum, order) => sum + (order.cost || 0), 0);
  }, [vehicleHistory]);

  // Memoized calculations for the financial tab
  const financialData = useMemo(() => {
    if (!vehicle) return {
      completedOrders: [],
      totalSpending: 0,
      totalPartsCost: 0,
      totalLaborCost: 0,
      categoryCosts: {
        mechanical: 0,
        electrical: 0,
        cooling: 0,
        hydraulic: 0,
        bodywork: 0,
      },
      allParts: [],
      averageOrderCost: 0
    };

    const completedOrders = orders.filter(
      order => order.vehicleId === vehicle.id && order.status === 'completed'
    );

    let totalSpending = 0;
    let totalPartsCost = 0;
    const categoryCosts: Record<string, number> = {
      mechanical: 0,
      electrical: 0,
      cooling: 0,
      hydraulic: 0,
      bodywork: 0,
    };

    const allParts: Array<SupplierPart & { orderNumber: string; orderDate: string; id: string }> = [];

    completedOrders.forEach(order => {
      // If the order has explicit parts, but cost is not set, total is parts cost
      let orderPartsCost = 0;
      if (order.supplierParts) {
        order.supplierParts.forEach((part, partIdx) => {
          const partTotal = part.qty * part.unitPrice;
          orderPartsCost += partTotal;
          allParts.push({
            ...part,
            orderNumber: order.orderNumber,
            orderDate: order.date,
            id: `${order.id}-${part.id || 'part'}-${partIdx}`
          });
        });
      }

      const orderTotal = order.cost !== undefined ? order.cost : orderPartsCost;
      totalSpending += orderTotal;

      if (order.category && categoryCosts[order.category] !== undefined) {
        categoryCosts[order.category] += orderTotal;
      }

      totalPartsCost += orderPartsCost;
    });

    const totalLaborCost = Math.max(0, totalSpending - totalPartsCost);

    return {
      completedOrders,
      totalSpending,
      totalPartsCost,
      totalLaborCost,
      categoryCosts,
      allParts,
      averageOrderCost: completedOrders.length ? Math.round(totalSpending / completedOrders.length) : 0
    };
  }, [orders, vehicle]);

  const activeOrder = useMemo(() => {
    if (!selectedOrderId) return vehicleHistory[0] || null;
    return vehicleHistory.find(o => o.id === selectedOrderId) || vehicleHistory[0] || null;
  }, [selectedOrderId, vehicleHistory]);

  if (!vehicle) return null;

  // Fuel type labels
  const getFuelTypeArabic = (fuel?: string) => {
    switch (fuel) {
      case 'diesel': return 'ديزل (سرعات ثقيلة)';
      case 'gasoline': return 'بنزين (وقود خفيف)';
      case 'electric': return 'كهربائي بالكامل (صديق للبيئة)';
      case 'hybrid': return 'هجين سعة مدمجة';
      default: return 'ديزل';
    }
  };

  const getWarrantyStatus = (orderDateStr: string, warrantyMonths: number) => {
    if (!orderDateStr || !warrantyMonths) return { label: 'بدون ضمان', active: false };
    const orderDate = new Date(orderDateStr);
    const expiryDate = new Date(orderDate.getFullYear(), orderDate.getMonth() + warrantyMonths, orderDate.getDate());
    const currentDate = new Date('2026-06-02');
    const active = expiryDate > currentDate;
    
    if (active) {
      const diffTime = Math.abs(expiryDate.getTime() - currentDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 30) {
        const months = Math.floor(diffDays / 30);
        return { label: `ساري (${months} شهر متبقي)`, active: true };
      }
      return { label: `ساري (${diffDays} يوم متبقي)`, active: true };
    } else {
      return { label: 'منتهي الصلاحية ⚠️', active: false };
    }
  };

  // Category tags translations
  const categoryNames: Record<string, { label: string; color: string }> = {
    mechanical: { label: 'ميكانيكا وصيانة عامة', color: 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400' },
    electrical: { label: 'كهرباء وإلكترونيات غامرة', color: 'text-violet-600 bg-violet-50 border-violet-100 dark:bg-violet-950/40 dark:text-violet-400' },
    cooling: { label: 'أنظمة تبريد وتكييف', color: 'text-sky-600 bg-sky-50 border-sky-100 dark:bg-sky-950/40 dark:text-sky-400' },
    hydraulic: { label: 'أنظمة هيدروليكية وروافع', color: 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/40 dark:text-rose-450' },
    bodywork: { label: 'سمكرة وتعديل هيكل خارجي', color: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/40 dark:text-amber-450' }
  };

  // Status indicators mapping
  const statusBadges: Record<string, { label: string; color: string; ring: string }> = {
    completed: { label: 'منجز بالكامل ومختبر', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:text-emerald-450', ring: 'ring-emerald-400/20' },
    'in-progress': { label: 'تحت أعمال التصليح حالياً', color: 'bg-amber-500/10 text-amber-600 border-amber-300 dark:text-amber-400', ring: 'ring-amber-400/20' },
    pending: { label: 'مجدول في انتظار الفحص', color: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300', ring: 'ring-slate-400/10' }
  };

  // Action: Simulated upload triggering
  const triggerFileUpload = (type: 'invoice' | 'photo' | 'video') => {
    setUploadingType(type);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingType || !activeOrder) return;

    // Direct simulated progress loader
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 150);

    setTimeout(() => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        // Build new attachment model
        const newAttachment: AttachmentFile = {
          id: 'uploaded_' + Math.random().toString(36).substring(2, 9),
          name: file.name,
          url: base64String,
          type: uploadingType,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          uploadedAt: new Date().toISOString().split('T')[0]
        };

        // Persist globally inside fleet_maintenance_orders_v2
        const updatedOrders = orders.map(ord => {
          if (ord.id === activeOrder.id) {
            const currentAttachments = ord.attachments || [];
            return {
              ...ord,
              attachments: [...currentAttachments, newAttachment]
            };
          }
          return ord;
        });

        persistOrders(updatedOrders);
        setUploadProgress(null);
        setUploadingType(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      
      // Keep safety fallback: Use mock visual attachments if upload fails or is an unsupported video etc.
      try {
        if (file.type.startsWith('image/') || file.type.startsWith('application/pdf') || file.type.startsWith('text/')) {
          reader.readAsDataURL(file);
        } else {
          // Mock URL fallback for videos or zip to avoid large data limits in LocalStorage
          const fallbackAttachment: AttachmentFile = {
            id: 'uploaded_' + Math.random().toString(36).substring(2, 9),
            name: file.name,
            url: file.type.startsWith('video/') 
              ? 'https://assets.mixkit.co/videos/preview/mixkit-mechanic-repairing-part-of-a-car-40899-large.mp4' 
              : 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400',
            type: uploadingType,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            uploadedAt: new Date().toISOString().split('T')[0]
          };

          const updatedOrders = orders.map(ord => {
            if (ord.id === activeOrder.id) {
              const currentAttachments = ord.attachments || [];
              return {
                ...ord,
                attachments: [...currentAttachments, fallbackAttachment]
              };
            }
            return ord;
          });

          persistOrders(updatedOrders);
          setUploadProgress(null);
          setUploadingType(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      } catch (err) {
        setUploadProgress(null);
        setUploadingType(null);
      }
    }, 1200);
  };

  // Action: Add Part to this active maintenance order
  const handleAddPartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || !newPart.name) return;

    const partModel: SupplierPart = {
      id: 'part_' + Math.random().toString(36).substring(2, 9),
      name: newPart.name,
      partNumber: newPart.partNumber || 'GEN-PART-' + Math.floor(1000 + Math.random() * 9000),
      supplier: newPart.supplier || 'مورد السوق العام للسيارات والمعدات',
      warrantyMonths: Number(newPart.warrantyMonths),
      qty: Number(newPart.qty),
      unitPrice: Number(newPart.unitPrice),
      notes: newPart.notes,
      newPartImage: newPart.newPartImage,
      wornPartImage: newPart.wornPartImage
    };

    const addedCost = partModel.qty * partModel.unitPrice;

    const updatedOrders = orders.map(ord => {
      if (ord.id === activeOrder.id) {
        const partsList = ord.supplierParts || [];
        const namesList = ord.partsUsed || [];
        return {
          ...ord,
          cost: (ord.cost || 0) + addedCost,
          partsUsed: [...namesList, partModel.name],
          supplierParts: [...partsList, partModel]
        };
      }
      return ord;
    });

    persistOrders(updatedOrders);
    
    // Reset inputs
    setNewPart({
      name: '',
      partNumber: '',
      supplier: '',
      warrantyMonths: 12,
      qty: 1,
      unitPrice: 150,
      notes: '',
      newPartImage: '',
      wornPartImage: ''
    });
    setShowAddPart(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'newPartImage' | 'wornPartImage') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPart(prev => ({
        ...prev,
        [fieldName]: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  // Action: Delete attachment 
  const handleDeleteAttachment = (attId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المرفق القانوني نهائياً؟')) return;
    if (!activeOrder) return;

    const updatedOrders = orders.map(ord => {
      if (ord.id === activeOrder.id) {
        const currentAtt = ord.attachments || [];
        return {
          ...ord,
          attachments: currentAtt.filter(a => a.id !== attId)
        };
      }
      return ord;
    });

    persistOrders(updatedOrders);
  };

  // Live video player simulator
  const toggleLiveVideo = (id: string) => {
    if (videoPlayId === id) {
      setVideoPlayId(null);
    } else {
      setVideoPlayId(id);
      
      // Simulate ticking video seconds
      if (!videoPercent[id]) {
        setVideoPercent(prev => ({ ...prev, [id]: 0 }));
      }
      
      const interval = setInterval(() => {
        setVideoPercent(prev => {
          if (prev[id] >= 100) {
            clearInterval(interval);
            return { ...prev, [id]: 100 };
          }
          return { ...prev, [id]: prev[id] + 5 };
        });
      }, 300);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-center justify-center p-2 sm:p-4 text-right overflow-y-auto" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 15 }}
          className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800 my-auto max-h-[96vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-white dark:bg-slate-900 sticky top-0 z-10 shrink-0">
            <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-indigo-500 to-brand-blue-600 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
                <ClipboardList size={20} className="animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 xs:gap-2">
                  <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-black text-slate-900 dark:text-white leading-tight flex flex-wrap items-center gap-1.5 min-w-0">
                    <span className="truncate">تفاصيل ومواصفات المركبة الفنية</span>
                  </h2>
                  <span className="inline-flex self-start xs:self-auto px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono tracking-wider shrink-0">
                    {vehicle.status === 'active' ? '● تعمل بنشاط' : vehicle.status === 'maintenance' ? '🔧 في الورشة' : '⚠️ متوقفة لخلل'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 flex-wrap">
                  <span className="text-[10px] sm:text-xs font-black text-indigo-650 dark:text-indigo-400 font-mono tracking-wider bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/40">{vehicle.plateNumber}</span>
                  <span className="w-[1px] bg-slate-200 dark:bg-slate-700 h-2.5" />
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-300 truncate max-w-[120px] sm:max-w-none">{vehicle.name}</span>
                  <span className="w-[1px] bg-slate-200 dark:bg-slate-700 h-2.5" />
                  <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-400">{vehicle.type}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowQrModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-650 text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 animate-fade-in"
                title="توليد وتنزيل رمز الصيانة QR للمركبة"
              >
                <QrCode size={13} />
                <span className="hidden sm:inline">بطاقة ملصق QR</span>
              </button>

              <button 
                onClick={onClose}
                className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-350 rounded-xl transition-all cursor-pointer shrink-0 animate-fade-in"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Hidden file input for simulated attachments upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }}
            accept="image/*,application/pdf,video/*"
          />

          {/* Navigation Tab Bar */}
          <div className="flex px-4 sm:px-5 md:px-6 border-b border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/30 shrink-0 overflow-x-auto overflow-y-hidden select-none whitespace-nowrap scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveTab('specs')}
              className={`py-3 sm:py-3.5 px-4 sm:px-5 font-black text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'specs' 
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-450 font-black' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <Settings size={14} className="shrink-0" />
              <span>المواصفات الفنية العميقة والإطارات</span>
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 sm:py-3.5 px-4 sm:px-5 font-black text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'history' 
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-450 font-black' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <History size={14} className="shrink-0" />
              <span>مركز الفواتير وسجل الصيانة الشامل ({vehicleHistory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('periodic')}
              className={`py-3 sm:py-3.5 px-4 sm:px-5 font-black text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'periodic' 
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-450 font-black' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <Calendar size={14} className="shrink-0" />
              <span>جدولة الصيانة الدورية والتذكيرات</span>
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('finance')}
                className={`py-3 sm:py-3.5 px-4 sm:px-5 font-black text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === 'finance' 
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-450 font-black' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <DollarSign size={14} className="shrink-0 text-amber-500 dark:text-amber-400" />
                <span className="flex items-center gap-1">
                  <span>التقرير المالي والتكاليف</span>
                  <span className="text-[9px] bg-amber-500/10 text-amber-600 px-1 py-0.5 rounded font-mono">🔒 الإدارة</span>
                </span>
              </button>
            )}
          </div>

          {/* Core Body Container - Fully Responsive */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-[300px]">
            <AnimatePresence mode="wait">
              {activeTab === 'specs' && (
                <motion.div
                  key="specs-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="space-y-6 text-right"
                >
                  {/* Top Combined Panel: Identity & Bento Grid info */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Right Panel: Identity Card & Animated Core Engine Pulse (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                      {/* Visual frame card */}
                      <div className="relative overflow-hidden rounded-3xl border border-slate-150 dark:border-slate-800 bg-linear-to-b from-slate-50 to-slate-100/50 dark:from-slate-905 dark:to-slate-900 p-5 shadow-xs flex flex-col justify-between min-h-[260px] group">
                        
                        {/* Interactive Sparkles / Grid lines */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
                        
                        <div className="relative flex items-center justify-between z-10">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">ID: {vehicle.id}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-sans">فحص الهيكل نشط</span>
                        </div>

                        {/* Image or vector graphic */}
                        <div className="my-4 flex items-center justify-center relative min-h-[140px] z-10 select-none">
                          {vehicle.image ? (
                            <div className="w-full h-32 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-sm relative group bg-white dark:bg-slate-950">
                              <img 
                                src={vehicle.image} 
                                alt={vehicle.name} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            </div>
                          ) : (
                            (() => {
                              const iconConfig = vehicle.iconName && VEHICLE_ICONS[vehicle.iconName] 
                                ? VEHICLE_ICONS[vehicle.iconName] 
                                : { component: Truck, label: 'آلية نقل ثقيل', bg: 'bg-indigo-50/50', text: 'text-indigo-600' };
                              
                              const IconComp = iconConfig.component;
                              return (
                                <div className="flex flex-col items-center justify-center">
                                  <div className="relative p-5 rounded-full bg-linear-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-slate-900 shadow-inner mb-3">
                                    <div className="absolute inset-0 rounded-full border border-dashed border-indigo-400/40 animate-spin-slow" />
                                    <IconComp size={48} className="text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <span className="text-[11px] font-black text-slate-550 dark:text-slate-400 tracking-wide">{iconConfig.label}</span>
                                </div>
                              );
                            })()
                          )}
                        </div>

                        {/* Department Terminals */}
                        <div className="relative mt-2 p-3 bg-white dark:bg-slate-950 border border-slate-150/70 dark:border-slate-800 rounded-2xl flex items-center justify-between text-right z-10 shadow-3xs">
                          <div>
                            <span className="text-[8px] font-black text-slate-405 dark:text-slate-500 block leading-none">الإدارة المشغلة للآلية</span>
                            <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 mt-1.5 block leading-none">{vehicle.department}</span>
                          </div>
                          <div className="text-left">
                            <span className="text-[8px] font-black text-slate-405 dark:text-slate-500 block leading-none">القسم الميداني المباشر</span>
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1.5 block font-mono leading-none">{vehicle.subDepartment}</span>
                          </div>
                        </div>
                      </div>

                      {/* Diagnostic Oscilloscope wave / RPM speed gauge */}
                      <div className="p-4 bg-slate-900 text-white rounded-3xl border border-slate-800 flex flex-col gap-3 relative overflow-hidden shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9.5px] font-black text-slate-300">إشارات المحرك الحيوية والنبض الفني</span>
                          </div>
                          <span className="text-[9px] font-black font-sans text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">98% ممتاز</span>
                        </div>

                        {/* Oscilloscope Graphic */}
                        <div className="h-16 flex items-end justify-center gap-[3px] py-1 border-b border-slate-800 relative">
                          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                            <span className="text-[10px] font-mono tracking-widest text-[#4f5e71]">DIAGNOSTIC UNIT ACTIVE</span>
                          </div>
                          {[25, 45, 12, 78, 92, 35, 40, 62, 10, 5, 88, 60, 48, 75, 95, 20, 32, 55, 80, 15, 68, 90, 42, 28, 74].map((h, i) => (
                            <motion.div 
                              key={i} 
                              className="w-[3px] bg-linear-to-t from-cyan-400 to-indigo-500 rounded-full"
                              animate={{ height: [`${h}%`, `${Math.min(95, Math.max(10, h + (i % 2 === 0 ? 15 : -15)))}%`, `${h}%`] }}
                              transition={{ duration: 1.5 + (i % 3) * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                          ))}
                        </div>

                        {/* Metrics specs HUD info */}
                        <div className="grid grid-cols-3 gap-2 text-center text-slate-300">
                          <div>
                            <span className="text-[8px] text-slate-400 block pb-0.5">حالة الاشتعال</span>
                            <span className="text-[10px] font-mono font-black text-cyan-400">14.2 V</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 block pb-0.5">دورة الدقيقة</span>
                            <span className="text-[10px] font-mono font-black text-indigo-400">820 RPM</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 block pb-0.5">حرارة المحرك</span>
                            <span className="text-[10px] font-mono font-black text-rose-455">88°C</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive QR Code & Sticker Badge Card */}
                      <div className="p-5 bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-150 dark:border-slate-800 flex flex-col gap-3 relative overflow-hidden shadow-xs text-center">
                        <div className="absolute top-0 right-0 left-0 h-1 bg-amber-500" />
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">ملصق QR التعريفي</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 font-sans flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            جاهز للمسح
                          </span>
                        </div>

                        {/* QR Image Frame */}
                        <div className="my-2 flex flex-col items-center justify-center">
                          <div className="bg-white p-2 rounded-2xl border border-slate-150 shadow-xs relative flex items-center justify-center w-36 h-36 select-none group">
                            {localQrUrl ? (
                              <img src={localQrUrl} alt="Vehicle QR Code" className="w-full h-full object-contain" />
                            ) : (
                              <div className="text-[10px] text-slate-400 font-bold animate-pulse">جاري التوليد...</div>
                            )}
                          </div>
                          
                          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 mt-2">
                            امسح الرمز التعريفي للوصول الفوري لسجل الصيانة
                          </span>
                        </div>

                        {/* Mini Print/Download buttons inside the sidebar details */}
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => setShowQrModal(true)}
                            className="h-8.5 flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all font-bold text-[10.5px] cursor-pointer shadow-xs"
                          >
                            <QrCode size={12} />
                            <span>طباعة الملصق</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!localQrUrl) return;
                              const link = document.createElement('a');
                              link.href = localQrUrl;
                              link.download = `QR_${vehicle.plateNumber.replace(/\s+/g, '_')}.png`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="h-8.5 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-850 dark:text-slate-200 rounded-xl transition-all font-bold text-[10.5px] cursor-pointer"
                          >
                            <Download size={12} />
                            <span>تنزيل الرمز</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Left Panel: Specifications Bento Box (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          { 
                            id: 'chassis',
                            icon: <Fingerprint size={16} />, 
                            label: 'رقم هيكل الشاصي الأساسي', 
                            val: vehicle.chassisNumber || 'MHRJT12G59048375', 
                            color: 'text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50', 
                            copyable: true 
                          },
                          { 
                            id: 'engine',
                            icon: <Cpu size={16} />, 
                            label: 'رقم ورمز المحرك الميكانيكي', 
                            val: vehicle.engineNumber || '2TR-FE-912837', 
                            color: 'text-sky-600 bg-sky-50/50 dark:bg-sky-950/40 dark:text-sky-450 border-sky-100 dark:border-sky-900/50', 
                            copyable: true 
                          },
                          { 
                            id: 'fuel',
                            icon: <Fuel size={16} />, 
                            label: 'نوع الوقود ومنظومة الدفع', 
                            val: getFuelTypeArabic(vehicle.fuelType), 
                            color: 'text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
                            customIndicator: (
                              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[78%] rounded-full animate-pulse" />
                              </div>
                            )
                          },
                          { 
                            id: 'payload',
                            icon: <Weight size={16} />, 
                            label: 'الحمولة المسموحة القصوى', 
                            val: vehicle.loadingCapacity || '1.2 طن الفئة أ', 
                            color: 'text-purple-600 bg-purple-50/50 dark:bg-purple-950/40 dark:text-purple-400 border-purple-100 dark:border-purple-900/50',
                            customIndicator: (
                              <div className="flex items-center gap-1.5 mt-2">
                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-purple-500 h-full w-[65%] rounded-full" />
                                </div>
                                <span className="text-[8px] font-black text-purple-600 dark:text-purple-400">65% معتدل</span>
                              </div>
                            )
                          },
                          { 
                            id: 'insurance',
                            icon: <ShieldCheck size={16} />, 
                            label: 'صلاحية ووثيقة التأمين والترخيص', 
                            val: vehicle.insuranceExpiry || '2027-02-15', 
                            color: 'text-rose-600 bg-rose-50/50 dark:bg-rose-950/40 dark:text-rose-450 border-rose-100 dark:border-rose-900/50',
                            expiredWarning: true
                          },
                          { 
                            id: 'year',
                            icon: <Calendar size={16} />, 
                            label: 'سنة وموديل التصنيع الفني', 
                            val: `موديل ${vehicle.modelYear || '2023'} المعتمد`, 
                            color: 'text-amber-600 bg-amber-50/50 dark:bg-amber-950/40 dark:text-amber-450 border-amber-100 dark:border-amber-900/50',
                            customIndicator: (
                              <div className="text-[9px] text-amber-600 dark:text-amber-400 font-extrabold mt-1.5">أصلية فحص دوري مجاز</div>
                            )
                          },
                        ].map((spec) => {
                          const isCopied = copiedText === spec.id;
                          return (
                            <div 
                              key={spec.id} 
                              className="bg-white dark:bg-slate-900 border border-slate-150/70 dark:border-slate-800 p-4 rounded-3xl flex flex-col justify-between transition-all hover:scale-[1.01] hover:border-indigo-300 dark:hover:border-slate-700 hover:shadow-xs relative"
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${spec.color} border`}>
                                  {spec.icon}
                                </div>
                                
                                {spec.copyable && (
                                  <button
                                    onClick={() => copyToClipboard(spec.val, spec.id)}
                                    className={`px-2 py-1 text-[8px] font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                                      isCopied 
                                        ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                  >
                                    {isCopied ? <Check size={8} /> : null}
                                    <span>{isCopied ? 'تم النسخ' : 'نسخ رقم'}</span>
                                  </button>
                                )}
                              </div>

                              <div className="text-right mt-3 overflow-hidden min-w-0">
                                <span className="text-[9.5px] font-black text-slate-400 dark:text-slate-500 block leading-none mb-1.5">{spec.label}</span>
                                <span className="text-xs font-black text-slate-850 dark:text-white block font-mono capitalize truncate">{spec.val}</span>
                              </div>

                              {spec.customIndicator}
                              
                              {spec.expiredWarning && (
                                <div className="mt-2 flex items-center gap-1 text-[8px] font-black text-emerald-600 dark:text-emerald-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                                  <span>تأمين ساري ومسجل رسمياً</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Driver Assignment Block (Digitized Digital ID Card) */}
                      {assignedDriver ? (
                        <div className="relative overflow-hidden rounded-3xl border border-indigo-150 dark:border-slate-800 bg-linear-to-r from-indigo-50/70 via-white to-brand-blue-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900/50 p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5 text-right group">
                          
                          {/* Grid Background Overlay */}
                          <div className="absolute inset-0 bg-[radial-gradient(#80808007_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                          {/* Left Security Badge Emblem */}
                          <div className="absolute top-2 left-6 text-[8px] font-black tracking-widest text-indigo-400/30 uppercase select-none hidden md:block">OFFICIAL PERMIT BADGE</div>
                          
                          <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                            <div className="w-16 h-16 overflow-hidden rounded-2xl border-2 border-indigo-150 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-md shrink-0 relative group">
                              <img 
                                src={assignedDriver.avatar} 
                                alt={assignedDriver.name} 
                                className="w-full h-full object-cover scale-[1.05] transition-transform duration-300 group-hover:scale-110" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute bottom-0 inset-x-0 h-1 bg-emerald-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-indigo-650 dark:text-indigo-400 bg-indigo-550/10 px-2 py-0.5 rounded-lg border border-indigo-550/20">السائق المفوض رسمياً</span>
                                <span className="text-[8.5px] text-slate-450 dark:text-slate-500 font-bold">رخصة سارية الصلاحية</span>
                              </div>
                              <h4 className="text-sm md:text-base font-black text-slate-900 dark:text-white mt-1.5 leading-none flex items-center gap-2">
                                <span>{assignedDriver.name}</span>
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 px-1 py-0.2 rounded font-black font-sans">معتمد</span>
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-1 leading-normal">
                                رقـم الهويـة الوطنيـة: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{assignedDriver.identityNumber}</span> | فئة الترخيـص: <span className="font-black text-indigo-650 dark:text-indigo-400">{assignedDriver.licenseType}</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-4 md:mt-0 pt-3 md:pt-0 border-t border-slate-200/50 md:border-none relative z-10 font-sans">
                            <div className="text-right">
                              <span className="text-[8.5px] text-slate-400 block font-semibold">رقم الاتصال الميداني:</span>
                              <span className="text-xs md:text-sm font-black text-slate-800 dark:text-slate-250 font-mono tracking-wide mt-0.5 block">{assignedDriver.phone}</span>
                            </div>

                            {/* Digital QR Code Badge Simulation & Hand-signed Graphic Mock */}
                            <div className="flex items-center gap-3">
                              <div className="text-left hidden xs:block">
                                <span className="text-[7.5px] text-slate-400 block pb-0.5 italic text-center">لجنة السلامة والجودة</span>
                                <svg width="70" height="22" className="text-indigo-500/40 dark:text-indigo-400/30 overflow-visible opacity-85" viewBox="0 0 100 30" fill="none" stroke="currentColor">
                                  <path d="M5,15 Q25,5 45,20 T85,10 M15,5 Q55,25 95,15" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                              </div>
                              
                              <div className="w-12 h-12 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-205 dark:border-slate-805 shadow-3xs flex flex-col gap-0.5 items-center justify-center relative select-none shrink-0" title="رمز التفويض المشفر">
                                <div className="grid grid-cols-4 gap-[2px] w-full h-full opacity-70">
                                  {[1,0,1,1,0,1,0,1,1,1,0,0,1,0,1,1].map((val, idx) => (
                                    <div key={idx} className={`rounded-sm ${val === 1 ? 'bg-slate-850 dark:bg-slate-200' : 'bg-transparent'}`} />
                                  ))}
                                </div>
                                <div className="absolute inset-0 bg-transparent flex items-center justify-center p-3">
                                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-lg shadow-sm border border-white" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-150/70 dark:border-slate-800/80 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between text-right gap-4 transition-all hover:border-slate-305 dark:hover:border-slate-705">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                              <UserIcon size={18} />
                            </div>
                            <div>
                              <span className="text-[9.5px] font-black text-slate-405 block">السائق المسؤول عن الآلية:</span>
                              <span className="text-xs font-black text-slate-500 block mt-1">شاغر - لا يوجد سائق معين حالياً لطلب التشغيل</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 max-w-xs text-center sm:text-left leading-relaxed">
                            💡 يمكنك تعيين وتفويض سائق مرخص فئة مناسبة لهذه المركبة مباشرة بالذهاب لقسم <b>إدارة السائقين والتفويضات</b> في القائمة الجانبية.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tires, Wheels, and Suspension Diagnostics Unit (Redesigned Interactive Console) */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[2rem] p-5 md:p-6 space-y-6 shadow-xs">
                    
                    {/* Header bar with controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-800 pb-4">
                      <div className="flex items-center gap-3 text-right">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-inner shrink-0 border border-indigo-100 dark:border-indigo-900/30">
                          <Activity size={18} className="animate-spin-slow" />
                        </div>
                        <div>
                          <h4 className="text-xs md:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                            <span>لوحة مراقبة الإطارات والحاقن الذكي</span>
                            <span className="px-2 py-0.2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 text-[8.5px] font-black rounded-md border border-emerald-500/20 font-sans">تيليماتكس نشط</span>
                          </h4>
                          <p className="text-[10px] text-slate-505 dark:text-slate-400 mt-1 leading-none">مستشعرات ضغط الهواء لجميع المحاور الميكانيكية بالآلية وسجل تآكل النقشة</p>
                        </div>
                      </div>

                      {/* Interactive Live Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                        
                        <button
                          type="button"
                          onClick={handleRefillTires}
                          disabled={isRefilling}
                          className={`px-3 py-1.5 text-[10px] font-black rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs ${
                            isRefilling
                              ? 'bg-slate-100 text-slate-400 border-slate-205 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-650 border-indigo-150 dark:bg-indigo-950/30 dark:hover:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-809'
                          }`}
                        >
                          <RefreshCw size={11} className={isRefilling ? 'animate-spin' : ''} />
                          <span>{isRefilling ? 'جاري ضخ النيتروجين...' : 'تعبئة هواء (نيتروجين)'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleCalibrateSensors}
                          disabled={isCalibrating}
                          className={`px-3 py-1.5 text-[10px] font-black rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs ${
                            isCalibrating
                              ? 'bg-slate-100 text-slate-400 border-slate-205 cursor-not-allowed dark:bg-slate-800'
                              : calibrationSuccess
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-650 dark:text-slate-300 border-slate-200/80 dark:border-slate-700'
                          }`}
                        >
                          <Check size={11} className={isCalibrating ? 'animate-pulse' : ''} />
                          <span>{isCalibrating ? 'جاري معايرة الليزر...' : calibrationSuccess ? '✓ تمت معايرة الميزان' : 'معايرة الحساسات'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleRotateTires}
                          disabled={isRotating}
                          className={`px-3 py-1.5 text-[10px] font-black rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs ${
                            isRotating
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800'
                              : rotationSuccess
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-655 dark:text-slate-300 border-slate-205 dark:border-slate-700'
                          }`}
                        >
                          <RefreshCw size={11} className={isRotating ? 'animate-spin' : ''} />
                          <span>{isRotating ? 'جاري التدوير...' : rotationSuccess ? '✓ تم تدوير الإطارات' : 'تدوير الإطارات'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Interactive Tire Inspection Grid Panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      
                      {/* Left Side: 2D Interactive Chassis Schema Overlay (7 cols) */}
                      <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/60 rounded-3xl relative overflow-hidden min-h-[340px]">
                        
                        <div className="absolute inset-0 bg-radial-grid opacity-10 pointer-events-none" />
                        
                        <span className="text-[9.5px] font-black text-slate-400 dark:text-slate-550 mb-6 tracking-widest uppercase block text-center">انقر على أي إطار لعرض تقرير الحساسات المباشر</span>
                        
                        <div className="relative w-44 py-6 px-12 flex flex-col gap-10">
                          
                          {/* Left-Right Axle Line Guides */}
                          <div className="absolute inset-x-0 top-[44px] h-[1px] bg-slate-200 dark:bg-slate-800/80 pointer-events-none" />
                          {((vehicle.tireCount ?? 4) > 4) && (
                            <div className="absolute inset-x-0 top-[110px] h-[1px] bg-slate-200 dark:bg-slate-800/80 pointer-events-none" />
                          )}
                          <div className="absolute inset-x-0 bottom-[44px] h-[1px] bg-slate-200 dark:bg-slate-800/80 pointer-events-none" />

                          {/* Center Driveshaft vector graphic representation */}
                          <div className="absolute top-10 bottom-10 left-[48%] w-1.5 bg-linear-to-b from-slate-200 via-slate-350 to-slate-200 dark:from-slate-800 dark:via-slate-650 dark:to-slate-800 rounded-full" />
                          
                          {/* Front Axle */}
                          <div className="flex justify-between items-center w-full relative z-10">
                            {/* Left Front (FL) */}
                            <button
                              type="button"
                              onClick={() => setSelectedTire('FL')}
                              className={`w-6 h-12 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                selectedTire === 'FL' 
                                  ? 'bg-indigo-600 text-white border-indigo-400 ring-4 ring-indigo-500/20 scale-105 shadow-md shadow-indigo-600/30' 
                                  : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-300'
                              }`}
                              title={tireStats['FL'].label}
                            >
                              {selectedTire === 'FL' && <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping absolute top-0.5" />}
                              <span className="text-[6.5px] font-mono leading-none font-bold">FL</span>
                              <span className="text-[8px] font-black font-mono leading-none mt-1">{tireStats['FL'].pressure}</span>
                            </button>
                            
                            {/* Differential Core Housing representation */}
                            <div className="w-6 h-6 bg-slate-250 border border-slate-305 dark:bg-slate-800 dark:border-slate-700 rounded-full flex items-center justify-center shadow-xs">
                              <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-pulse" />
                            </div>
                            
                            {/* Right Front (FR) */}
                            <button
                              type="button"
                              onClick={() => setSelectedTire('FR')}
                              className={`w-6 h-12 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                selectedTire === 'FR' 
                                  ? 'bg-indigo-600 text-white border-indigo-400 ring-4 ring-indigo-500/20 scale-105 shadow-md shadow-indigo-600/30' 
                                  : tireStats['FR'].status === 'low'
                                    ? 'bg-amber-500/20 border-amber-500 hover:border-amber-600 text-amber-600 dark:text-amber-400 animate-pulse'
                                    : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-300'
                              }`}
                              title={tireStats['FR'].label}
                            >
                              {selectedTire === 'FR' && <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping absolute top-0.5" />}
                              <span className="text-[6.5px] font-mono leading-none font-bold">FR</span>
                              <span className="text-[8px] font-black font-mono leading-none mt-1">{tireStats['FR'].pressure}</span>
                            </button>
                          </div>

                          {/* Middle/Dual Axles (Trucks or Busses) */}
                          {((vehicle.tireCount ?? 4) > 4) && (
                            <div className="flex justify-between items-center w-full relative z-10">
                              <div className="flex gap-[3px] -ml-5">
                                {/* ML Tire Left Inside */}
                                <div className="w-5 h-12 bg-slate-950 border border-slate-800 rounded-sm" />
                                {/* ML Tire Left Outside */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedTire('ML')}
                                  className={`w-6 h-12 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                    selectedTire === 'ML' 
                                      ? 'bg-indigo-600 text-white border-indigo-400 ring-4 ring-indigo-500/20 scale-105 shadow-md' 
                                      : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-300'
                                  }`}
                                  title={tireStats['ML'].label}
                                >
                                  <span className="text-[6.5px] font-mono leading-none font-bold">ML</span>
                                  <span className="text-[8px] font-black font-mono leading-none mt-1">{tireStats['ML'].pressure}</span>
                                </button>
                              </div>

                              {/* Center Drive Gear */}
                              <div className="w-5 h-5 bg-slate-350 dark:bg-slate-700 rounded-md" />

                              <div className="flex gap-[3px] -mr-5">
                                {/* MR Tire Right Outside */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedTire('MR')}
                                  className={`w-6 h-12 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                    selectedTire === 'MR' 
                                      ? 'bg-indigo-600 text-white border-indigo-400 ring-4 ring-indigo-500/25 scale-105 shadow-md' 
                                      : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-300'
                                  }`}
                                  title={tireStats['MR'].label}
                                >
                                  <span className="text-[6.5px] font-mono leading-none font-bold">MR</span>
                                  <span className="text-[8px] font-black font-mono leading-none mt-1">{tireStats['MR'].pressure}</span>
                                </button>
                                {/* MR Tire Right Inside */}
                                <div className="w-5 h-12 bg-slate-950 border border-slate-800 rounded-sm" />
                              </div>
                            </div>
                          )}

                          {/* Rear Axle */}
                          <div className="flex justify-between items-center w-full relative z-10">
                            {/* Left Rear (RL) */}
                            <button
                              type="button"
                              onClick={() => setSelectedTire('RL')}
                              className={`w-6 h-12 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                selectedTire === 'RL' 
                                  ? 'bg-indigo-600 text-white border-indigo-400 ring-4 ring-indigo-500/20 scale-105 shadow-md shadow-indigo-600/30' 
                                  : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-300'
                              }`}
                              title={tireStats['RL'].label}
                            >
                              {selectedTire === 'RL' && <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping absolute top-0.5" />}
                              <span className="text-[6.5px] font-mono leading-none font-bold">RL</span>
                              <span className="text-[8px] font-black font-mono leading-none mt-1">{tireStats['RL'].pressure}</span>
                            </button>

                            {/* Differential axle core box */}
                            <div className="w-7 h-5 bg-slate-300 dark:bg-slate-800 rounded-md border border-slate-400/50 flex items-center justify-center shadow-xs">
                              <span className="text-[7px] font-medium font-sans text-slate-500 dark:text-slate-400">4x4</span>
                            </div>

                            {/* Right Rear (RR) */}
                            <button
                              type="button"
                              onClick={() => setSelectedTire('RR')}
                              className={`w-6 h-12 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                selectedTire === 'RR' 
                                  ? 'bg-indigo-600 text-white border-indigo-400 ring-4 ring-indigo-500/20 scale-105 shadow-md shadow-indigo-600/30' 
                                  : 'bg-slate-900 border-slate-700 hover:border-slate-505 text-slate-300'
                              }`}
                              title={tireStats['RR'].label}
                            >
                              {selectedTire === 'RR' && <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping absolute top-0.5" />}
                              <span className="text-[6.5px] font-mono leading-none font-bold">RR</span>
                              <span className="text-[8px] font-black font-mono leading-none mt-1">{tireStats['RR'].pressure}</span>
                            </button>
                          </div>
                        </div>

                        {/* Tire Type Labels Legend */}
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[9.5px] font-black text-slate-500">
                          <span className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200">
                            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm block" />
                            <span>المحور النشط المختار</span>
                          </span>
                          <span className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200">
                            <span className="w-2.5 h-2.5 bg-amber-500/80 rounded-sm block" />
                            <span>يحتاج للتحقق / ضغط منخفض</span>
                          </span>
                          <span className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200">
                            <span className="w-2.5 h-2.5 bg-slate-900/90 rounded-sm block" />
                            <span>محور نقل العزم (الدفع)</span>
                          </span>
                        </div>
                      </div>

                      {/* Right Side: Selected Tire Telemetry Diagnostic HUD Panel (5 cols) */}
                      <div className="lg:col-span-5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/60 p-5 rounded-3xl min-h-[340px] flex flex-col justify-between">
                        
                        {/* Upper Section */}
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3 mb-4">
                            <div>
                              <span className="text-[8px] font-black text-indigo-650 dark:text-indigo-400 uppercase font-mono tracking-widest block">SENSOR TELEMETRY</span>
                              <h5 className="font-black text-slate-900 dark:text-white text-xs md:text-sm mt-0.5 flex items-center gap-1">{tireStats[selectedTire].label}</h5>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 font-sans">حساس نشط</span>
                          </div>

                          {/* Pressure circular Gauge Representation */}
                          <div className="flex items-center gap-4 py-2">
                            {/* Circular gauge mock using simple SVG */}
                            <div className="relative w-20 h-20 shrink-0">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="transparent" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
                                <circle 
                                  cx="18" 
                                  cy="18" 
                                  r="16" 
                                  fill="transparent" 
                                  stroke={tireStats[selectedTire].status === 'low' ? '#f59e0b' : '#3b82f6'} 
                                  strokeWidth="3.5" 
                                  strokeDasharray={`${(tireStats[selectedTire].pressure / 50) * 100}, 100`} 
                                  className="transition-all duration-1000"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-sm font-black font-mono text-slate-800 dark:text-white leading-none">{tireStats[selectedTire].pressure}</span>
                                <span className="text-[8px] text-slate-400 mt-0.5">PSI</span>
                              </div>
                            </div>

                            <div className="flex-1 text-right space-y-1.5">
                              <div>
                                <span className="text-[8px] text-slate-400 block leading-none">مستوى سلامة الإطار والضغط</span>
                                <span className={`text-[11px] font-black mt-1 inline-block px-1.5 py-0.2 rounded ${
                                  tireStats[selectedTire].status === 'low' 
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                }`}>
                                  {tireStats[selectedTire].status === 'low' ? 'تنبيه: ضغط هواء منخفض' : 'مثالي وآمن للسرعات العالية'}
                                </span>
                              </div>
                              <p className="text-[9.5px] text-slate-500 dark:text-slate-400 leading-normal">يحافظ الضغط المتوازن (35 PSI) على ثبات المركبة ويقلل التآكل الكلي بنسبة تصل إلى 15%.</p>
                            </div>
                          </div>

                          {/* Core Sensor Diagnostics Stats Sheet */}
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between items-center text-xs py-1.5 border-b border-dashed border-slate-200 dark:border-slate-800">
                              <span className="text-slate-400">درجة حرارة الإطار المكتشفة</span>
                              <span className="font-mono font-black text-slate-800 dark:text-slate-200">{tireStats[selectedTire].temp}°C</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs py-1.5 border-b border-dashed border-slate-200 dark:border-slate-800">
                              <span className="text-slate-400">نقشة وعمق ممشى الكاوتشوك</span>
                              <div className="flex items-center gap-1.5 text-right font-sans">
                                <span className="font-mono font-black text-slate-850 dark:text-slate-200">{tireStats[selectedTire].tread}%</span>
                                <div className="w-16 bg-slate-200 dark:bg-slate-805 h-1.5 rounded-full overflow-hidden block">
                                  <div className="bg-indigo-505 h-full rounded-full" style={{ width: `${tireStats[selectedTire].tread}%` }} />
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs py-1.5 border-b border-dashed border-slate-200 dark:border-slate-800 font-sans">
                              <span className="text-slate-400">توازن ومحاذاة زوايا الميزان</span>
                              <span className="font-medium text-slate-800 dark:text-slate-200">{tireStats[selectedTire].alignment}</span>
                            </div>

                            <div className="flex justify-between items-center text-xs py-1.5">
                              <span className="text-slate-400">حالة المستشعر الرقمي اللاسلكي</span>
                              <span className="font-black text-xs text-emerald-600 dark:text-emerald-450 flex items-center gap-1 font-sans">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse block" />
                                <span>{tireStats[selectedTire].sensor}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Diagnostic Health Summary Text */}
                        <div className="mt-4 p-3 bg-indigo-50/40 dark:bg-indigo-950/25 rounded-2xl border border-indigo-100/40 dark:border-indigo-900/30 text-[10px] text-indigo-950 dark:text-indigo-300 leading-normal flex items-start gap-1.5">
                          <Info size={13} className="shrink-0 text-indigo-550 mt-0.5" />
                          <p>
                            يتم تحديث مستشعرات TPMS بشكل دوري. في حال انخفاض الضغط عن 30 PSI يرجى ضخ النيتروجين فوراً لتجنب مخاطر انساخ الإطار أثناء التشغيل الثقيل.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="history-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
                >
                  {/* Left Drawer Area - List of historic orders (4 cols) */}
                  <div className="lg:col-span-12 xl:col-span-5 border border-slate-100 dark:border-slate-800 rounded-3xl p-4.5 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col space-y-4 max-h-[680px]">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <History size={14} className="text-indigo-550" />
                          <span>جدول أرشيف البلاغات</span>
                        </span>
                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl font-mono text-[10px] font-black border border-indigo-100/40 dark:border-indigo-900/30">
                          إجمالي: {totalCost.toLocaleString()} ر.س
                        </span>
                      </div>
                      
                      {/* Sub-search filters inside the lists */}
                      <div className="flex gap-2 relative">
                        <div className="relative flex-1">
                          <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                            <Search size={13} />
                          </span>
                          <input
                            type="text"
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                            placeholder="بحث برقم الأمر WO أو الوصف..."
                            className="w-full pr-9 pl-3 py-2 text-xs bg-white dark:bg-slate-805 border border-slate-200/80 dark:border-slate-700/80 rounded-xl outline-none focus:border-indigo-500 font-bold dark:text-white transition-all shadow-xs"
                          />
                        </div>
                        <div className="relative shrink-0">
                          <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400">
                            <Filter size={11} />
                          </span>
                          <select
                            value={historyCategory}
                            onChange={(e) => setHistoryCategory(e.target.value)}
                            className="appearance-none pr-6.5 pl-6 py-2 text-xs bg-white dark:bg-slate-805 border border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 rounded-xl outline-none font-bold dark:text-white cursor-pointer transition-all shadow-xs"
                          >
                            <option value="all">الأقسام: الكل</option>
                            <option value="mechanical">⚙️ ميكانيكا</option>
                            <option value="electrical">⚡ كهرباء</option>
                            <option value="cooling">❄️ تبريد</option>
                            <option value="hydraulic">💧 هيدروليك</option>
                            <option value="bodywork">🛠️ سمكرة</option>
                          </select>
                          <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400">
                            <ChevronDown size={11} />
                          </span>
                        </div>
                      </div>

                      {/* Technician & Workshop filters */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400">
                            <UserIcon size={11} />
                          </span>
                          <select
                            value={historyTechnician}
                            onChange={(e) => setHistoryTechnician(e.target.value)}
                            className="w-full appearance-none pr-6.5 pl-6 py-1.5 text-[10.5px] bg-white dark:bg-slate-805 border border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 rounded-xl outline-none font-bold dark:text-white cursor-pointer transition-all shadow-xs"
                          >
                            <option value="all">الفني: الكل</option>
                            {techniciansList.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                          <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400">
                            <ChevronDown size={10} />
                          </span>
                        </div>

                        <div className="relative">
                          <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400">
                            <Wrench size={10} />
                          </span>
                          <select
                            value={historyWorkshop}
                            onChange={(e) => setHistoryWorkshop(e.target.value)}
                            className="w-full appearance-none pr-6.5 pl-6 py-1.5 text-[10.5px] bg-white dark:bg-slate-805 border border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 rounded-xl outline-none font-bold dark:text-white cursor-pointer transition-all shadow-xs"
                          >
                            <option value="all">الورشة: الكل</option>
                            {workshopsList.map(w => (
                              <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                          </select>
                          <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400">
                            <ChevronDown size={10} />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Highly interactive list */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                      {vehicleHistory.map((order) => {
                        const isSelected = order.id === activeOrder?.id;
                        const specColor = categoryNames[order.category]?.color || 'text-slate-500 bg-slate-100';
                        const specLabel = categoryNames[order.category]?.label || order.category;
                        
                        return (
                          <div
                            key={order.id}
                            onClick={() => setSelectedOrderId(order.id)}
                            className={`p-4 rounded-[1.25rem] border transition-all duration-300 text-right cursor-pointer group flex flex-col justify-between gap-3 relative overflow-hidden ${
                              isSelected 
                                ? 'bg-indigo-500/5 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-450 border-r-4 border-r-indigo-550 dark:border-r-indigo-400 shadow-sm shadow-indigo-600/5' 
                                : 'bg-white dark:bg-slate-800/80 border-slate-150/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-850 hover:-translate-x-1 dark:text-slate-100'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-right flex-1 min-w-0">
                                <span className={`text-[9.5px] font-black tracking-wider block font-mono ${
                                  isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                                }`}>
                                  {order.orderNumber}
                                </span>
                                <h3 className={`font-black text-xs mt-1 leading-snug truncate ${
                                  isSelected ? 'text-indigo-950 dark:text-slate-50 font-extrabold' : 'text-slate-800 dark:text-slate-100'
                                }`}>
                                  {order.description}
                                </h3>
                              </div>
                              <span className={`px-2.5 py-1 rounded-xl text-[9.5px] font-black shrink-0 border border-current/10 ${specColor}`}>
                                {specLabel}
                              </span>
                            </div>

                            {/* Tech and workshop info badge row */}
                            <div className="flex flex-wrap gap-1.5 mt-0.5 text-[9.5px] font-bold">
                              {order.technicianId && (
                                <span className="bg-slate-50/20 dark:bg-slate-900/40 border border-slate-150/40 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 rounded-lg px-2 py-0.5 flex items-center gap-1 shrink-0">
                                  <span>👤 {techniciansList.find(t => t.id === order.technicianId)?.name || 'فني الصيانة'}</span>
                                </span>
                              )}
                              {order.workshopId && (
                                <span className="bg-slate-50/20 dark:bg-slate-900/40 border border-slate-150/40 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 rounded-lg px-2 py-0.5 flex items-center gap-1 shrink-0 truncate max-w-[155px]" title={workshopsList.find(w => w.id === order.workshopId)?.name}>
                                  <span>🏢 {workshopsList.find(w => w.id === order.workshopId)?.name || 'الورشة'}</span>
                                </span>
                              )}
                            </div>

                            <div className={`flex items-center justify-between border-t border-dashed pt-3 mt-1 ${
                              isSelected ? 'border-indigo-105 dark:border-indigo-900/30' : 'border-slate-100 dark:border-slate-800/50'
                            }`}>
                              <span className="text-[10.5px] font-bold font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1.5 leading-none">
                                <Calendar size={11} className="opacity-60" />
                                {order.date}
                              </span>
                              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 leading-none">
                                <span className="text-[13px] font-black">
                                  {(order.cost || 0).toLocaleString()}
                                </span>
                                <span className="text-[9.5px] font-black opacity-85">ر.س</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {vehicleHistory.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-650">
                          <History size={28} className="opacity-30 animate-spin-slow" />
                          <p className="text-xs font-black mt-2">لا يوجد سجل صيانة يطابق الفلترة</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Detail Pane Area - Complete details with Attachments and Upload Tooling (8 cols) */}
                  <div className="lg:col-span-7 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 bg-white dark:bg-slate-900 flex flex-col space-y-6">
                    {activeOrder ? (
                      <div className="space-y-6">
                        
                        {/* Title Section with basic statuses */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                          <div>
                            <span className="text-[10px] font-black text-indigo-500 block font-mono mb-1">{activeOrder.orderNumber}</span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">{activeOrder.description}</h3>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                              تم التحديث بواسطة فريق التفتيش الفني لـ FleetAurvexis في: {activeOrder.date}
                            </p>
                          </div>
                          <div className="self-start sm:self-auto flex items-center gap-1.5">
                            <span className={`px-3 py-1 text-[10px] font-black rounded-lg border flex items-center gap-1.5 ${statusBadges[activeOrder.status]?.color}`}>
                              <CircleDot size={8} className="animate-pulse" />
                              {statusBadges[activeOrder.status]?.label}
                            </span>
                          </div>
                        </div>

                        {/* Chief quality diagnostic notes */}
                        <div className="bg-gradient-to-l from-indigo-500/5 to-transparent p-4 rounded-2xl border border-indigo-150/30">
                          <div className="flex items-center gap-1.5 text-indigo-650 dark:text-indigo-400 mb-2">
                            <Info size={14} />
                            <span className="text-xs font-black">التقرير التشخيصي والتوصيات الفنية:</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                            {activeOrder.chiefNotes || 'بانتظار تفريغ تقرير المهندس الفني المسؤول. تم الماصفة الأولية للسيارة بالكامل.'}
                          </p>
                          
                          {/* Quality stars */}
                          {activeOrder.qualityRating && (
                            <div className="flex items-center gap-1 mt-3">
                              <span className="text-[10.5px] text-slate-400 font-bold ml-1.5">تقييم جودة الصيانة:</span>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={13} 
                                  className={`${i < (activeOrder.qualityRating ?? 5) ? 'text-amber-500 fill-amber-500' : 'text-slate-200 dark:text-slate-700'}`} 
                                  id={`quality-star-${i}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Technician and Workshop Assigned info Panel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-50/50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                              <UserIcon size={18} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mb-0.5">الفني المسؤول عن البلاغ:</span>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                                {techniciansList.find(t => t.id === activeOrder.technicianId)?.name || `فني #${activeOrder.technicianId || 'غير معيّن'}`}
                              </span>
                            </div>
                          </div>

                          <div className="bg-slate-50/50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <Wrench size={18} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mb-0.5">الورشة / مركز الصيانة:</span>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate block" title={workshopsList.find(w => w.id === activeOrder.workshopId)?.name}>
                                {workshopsList.find(w => w.id === activeOrder.workshopId)?.name || `ورشة #${activeOrder.workshopId || 'المركزية'}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Spark Plug / Replacement Materials list & suppliers */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-slate-900 dark:text-white font-black text-xs">
                              <Wrench size={12} />
                              <span>بيان قطع الغيار والموردين ودرجة القياس</span>
                            </div>
                            
                            {user?.role !== 'viewer' && (
                              <button
                                onClick={() => setShowAddPart(!showAddPart)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Plus size={10} />
                                <span>إضافة مادة/قطعة</span>
                              </button>
                            )}
                          </div>

                          {/* Expansion Input Subform to append items */}
                          <AnimatePresence>
                            {showAddPart && (
                              <motion.form 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                onSubmit={handleAddPartSubmit}
                                className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-150/70 overflow-hidden space-y-3"
                              >
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400">اسم قطعة الغيار / المكون:</label>
                                    <input 
                                      type="text"
                                      value={newPart.name}
                                      onChange={(e) => setNewPart({...newPart, name: e.target.value})}
                                      required
                                      placeholder="مثال: دينامو ميتسوبيشي أصلي"
                                      className="w-full px-2.5 py-1.5 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none font-bold"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400">المورد المعتمد للقطعة:</label>
                                    <input 
                                      type="text"
                                      value={newPart.supplier}
                                      onChange={(e) => setNewPart({...newPart, supplier: e.target.value})}
                                      placeholder="مثال: شركة تويوتا عبداللطيف جميل"
                                      className="w-full px-2.5 py-1.5 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none font-bold"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400">الرقم التسلسلي OEM:</label>
                                    <input 
                                      type="text"
                                      value={newPart.partNumber}
                                      onChange={(e) => setNewPart({...newPart, partNumber: e.target.value})}
                                      placeholder="مثال: OEM-9480132"
                                      className="w-full px-2.5 py-1.5 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none font-bold"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <div className="space-y-0.5">
                                      <label className="text-[9px] font-black text-slate-400">الكمية:</label>
                                      <input 
                                        type="number"
                                        min="1"
                                        value={newPart.qty}
                                        onChange={(e) => setNewPart({...newPart, qty: Number(e.target.value)})}
                                        className="w-full px-2 py-1.5 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 rounded-lg font-bold"
                                      />
                                    </div>
                                    <div className="space-y-0.5">
                                      <label className="text-[9px] font-black text-slate-400">سعر المفرد:</label>
                                      <input 
                                        type="number"
                                        min="1"
                                        value={newPart.unitPrice}
                                        onChange={(e) => setNewPart({...newPart, unitPrice: Number(e.target.value)})}
                                        className="w-full px-2 py-1.5 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 rounded-lg font-bold"
                                      />
                                    </div>
                                  </div>
                                  
                                  {/* Notes field */}
                                  <div className="col-span-2 space-y-1">
                                    <label className="text-[9px] font-black text-slate-400">ملاحظات قطعة الغيار والتفاصيل التشغيلية:</label>
                                    <textarea
                                      value={newPart.notes}
                                      onChange={(e) => setNewPart({...newPart, notes: e.target.value})}
                                      placeholder="مثال: تم التأكد من مواءمة العوازل الحرارية والمحور الدوار..."
                                      rows={2}
                                      className="w-full px-2.5 py-1.5 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none font-bold"
                                    />
                                  </div>

                                  {/* Replaced & New part picture upload placeholders */}
                                  <div className="col-span-2 grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-700/40">
                                    <div className="space-y-1">
                                      <label className="text-[9.5px] font-black text-slate-500 dark:text-slate-400 block mb-1">📸 صورة قطعة الغيار الجديدة:</label>
                                      <div className="relative border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-xl p-2.5 flex flex-col items-center justify-center cursor-pointer text-center group transition-colors min-h-[85px]">
                                        {newPart.newPartImage ? (
                                          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                                            <img src={newPart.newPartImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            <button
                                              type="button"
                                              onClick={() => setNewPart(prev => ({ ...prev, newPartImage: '' }))}
                                              className="absolute top-1 right-1 px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[8px] font-black shadow-md z-10"
                                            >
                                              إزالة
                                            </button>
                                          </div>
                                        ) : (
                                          <>
                                            <ImageIcon className="text-emerald-500 mb-1" size={16} />
                                            <span className="text-[9px] font-black text-emerald-650 dark:text-emerald-450 block">انقر لرفع صورة الجديد</span>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) => handleImageUpload(e, 'newPartImage')}
                                              className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[9.5px] font-black text-slate-500 dark:text-slate-400 block mb-1">🛠️ صورة قطعة المستهلك المستخرجة:</label>
                                      <div className="relative border border-dashed border-amber-300 dark:border-amber-800 bg-amber-500/5 hover:bg-amber-500/10 rounded-xl p-2.5 flex flex-col items-center justify-center cursor-pointer text-center group transition-colors min-h-[85px]">
                                        {newPart.wornPartImage ? (
                                          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                                            <img src={newPart.wornPartImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            <button
                                              type="button"
                                              onClick={() => setNewPart(prev => ({ ...prev, wornPartImage: '' }))}
                                              className="absolute top-1 right-1 px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[8px] font-black shadow-md z-10"
                                            >
                                              إزالة
                                            </button>
                                          </div>
                                        ) : (
                                          <>
                                            <Wrench className="text-amber-500 mb-1" size={16} />
                                            <span className="text-[9px] font-black text-amber-655 dark:text-amber-450 block">انقر لرفع المستهلك</span>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) => handleImageUpload(e, 'wornPartImage')}
                                              className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-end gap-1.5 pt-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setShowAddPart(false)}
                                    className="px-3 py-1 text-[10px] font-black text-slate-500 hover:text-slate-700 cursor-pointer"
                                  >
                                    إلغاء
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-4 py-1 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 hover:opacity-90 text-white rounded-lg text-[10px] font-black cursor-pointer"
                                  >
                                    إضافة وحفظ
                                  </button>
                                </div>
                              </motion.form>
                            )}
                          </AnimatePresence>

                          {/* Data Table of elements */}
                          <div className="overflow-x-auto border border-slate-150/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-850 shadow-xs">
                            <table className="w-full text-right text-[11.5px] font-bold border-collapse">
                              <thead>
                                <tr className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-450 dark:text-slate-400 border-b border-slate-150 dark:border-slate-800">
                                  <th className="pr-4 py-3 text-right font-black">قطعة الغيار الكلية</th>
                                  <th className="py-3 text-right font-black">المورد والمصنع</th>
                                  <th className="py-3 text-center font-black">الكمية</th>
                                  <th className="py-3 text-left font-black">السعر المفرد</th>
                                  <th className="py-3 text-left pl-4 font-black">المجموع الكلي</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                                {activeOrder.supplierParts && activeOrder.supplierParts.length > 0 ? (
                                  activeOrder.supplierParts.map((p, pIdx) => (
                                    <tr key={p.id ? `act-part-${p.id}-${pIdx}` : `act-part-${pIdx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                      <td className="pr-4 py-3.5 text-slate-900 dark:text-slate-100 font-extrabold max-w-[250px]">
                                        <div className="flex flex-col space-y-1">
                                          <span className="block text-xs font-black text-slate-800 dark:text-white leading-tight">{p.name}</span>
                                          <span className="block text-[9px] font-black text-slate-400 dark:text-slate-500 font-mono tracking-wider">{p.partNumber}</span>
                                          
                                          {p.notes && (
                                            <span className="inline-flex items-center gap-1.5 text-[9.5px] bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 p-2 rounded-xl mt-1.5 border border-slate-150/40 leading-normal max-w-[230px] whitespace-pre-wrap font-bold">
                                              📝 {p.notes}
                                            </span>
                                          )}
                                          
                                          <div className="flex flex-wrap gap-1.5 mt-2">
                                            {p.newPartImage && (
                                              <button 
                                                type="button"
                                                onClick={() => setPhotoPreview(p.newPartImage!)}
                                                className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-450 font-black px-2 py-1 rounded-lg border border-emerald-500/15 cursor-pointer shadow-xs transition-colors"
                                              >
                                                👁️ صورة الجديد
                                              </button>
                                            )}
                                            {p.wornPartImage && (
                                              <button 
                                                type="button"
                                                onClick={() => setPhotoPreview(p.wornPartImage!)}
                                                className="inline-flex items-center gap-1 text-[9px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-450 font-black px-2 py-1 rounded-lg border border-amber-500/15 cursor-pointer shadow-xs transition-colors"
                                              >
                                                👁️ صورة المستهلك
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="text-slate-505 dark:text-slate-400 font-semibold py-3.5 max-w-[150px] truncate leading-normal">
                                        {p.supplier}
                                      </td>
                                      <td className="py-3.5 text-center">
                                        <span className="inline-block px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-black rounded-lg border border-slate-200/40 dark:border-slate-700/50 shadow-inner">
                                          {p.qty}x
                                        </span>
                                      </td>
                                      <td className="text-left font-mono text-slate-500 dark:text-slate-400 py-3.5 whitespace-nowrap">
                                        {p.unitPrice?.toLocaleString()} ر.س
                                      </td>
                                      <td className="text-left font-mono font-black text-indigo-650 dark:text-indigo-400 pl-4 py-3.5 whitespace-nowrap">
                                        {(p.qty * p.unitPrice).toLocaleString()} ر.س
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={5} className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs font-bold leading-normal">
                                      لم يتم ربط قائمة موردين تفصيلية لهذا العطل بعد.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Visual digital attachments: Receipts, Photos and Videos list */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Shield size={12} className="text-indigo-500" />
                            <span>المرفقات ووثائق الصيانة والمستندات القانونية</span>
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Invoices and receipts */}
                            <div className="bg-slate-50/70 dark:bg-slate-800/20 border border-slate-150 p-3.5 rounded-2xl flex flex-col justify-between">
                              <span className="text-[10px] font-black text-indigo-650 dark:text-indigo-400 block mb-2">📄 الوصولات والفواتير الضريبية</span>
                              
                              <div className="space-y-2 flex-1">
                                {activeOrder.attachments?.filter(a => a.type === 'invoice').map((invoice, invIdx) => (
                                  <div key={invoice.id ? `inv-${invoice.id}-${invIdx}` : `inv-${invIdx}`} className="p-2 bg-white dark:bg-slate-900 border border-slate-150 rounded-xl flex items-center justify-between text-[10px]">
                                    <div className="overflow-hidden min-w-0 pr-1 text-right">
                                      <span className="font-extrabold text-slate-800 dark:text-slate-200 block truncate" title={invoice.name}>{invoice.name}</span>
                                      <span className="text-[8px] text-slate-400 block font-mono mt-0.5">{invoice.size}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <a 
                                        href={invoice.url} 
                                        download={invoice.name}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded"
                                        title="تحميل"
                                      >
                                        <Download size={10} />
                                      </a>
                                      {user?.role !== 'viewer' && (
                                        <button 
                                          onClick={() => handleDeleteAttachment(invoice.id)}
                                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                        >
                                          <Trash2 size={10} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}

                                {activeOrder.attachments?.filter(a => a.type === 'invoice').length === 0 && (
                                  <span className="text-[9px] text-slate-400 block py-3 text-center">لا توجد فواتير ضريبية</span>
                                )}
                              </div>

                              {user?.role !== 'viewer' && (
                                <button
                                  type="button"
                                  onClick={() => triggerFileUpload('invoice')}
                                  className="w-full mt-3 py-1 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 hover:opacity-90 text-white rounded-lg text-[9px] font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Upload size={10} />
                                  <span>رفع إيصال / فاتورة</span>
                                </button>
                              )}
                            </div>

                            {/* Images Gallery */}
                            <div className="bg-slate-50/70 dark:bg-slate-800/20 border border-slate-150 p-3.5 rounded-2xl flex flex-col justify-between">
                              <span className="text-[10px] font-black text-rose-600 dark:text-rose-450 block mb-2">📸 صور العطل أو القطعة تفصيلياً</span>
                              
                              <div className="space-y-2 flex-1">
                                <div className="grid grid-cols-2 gap-1.5">
                                  {activeOrder.attachments?.filter(a => a.type === 'photo').map((photo, phIdx) => (
                                    <div key={photo.id ? `photo-${photo.id}-${phIdx}` : `photo-${phIdx}`} className="relative group rounded-lg overflow-hidden border border-slate-150 aspect-video bg-black flex items-center justify-center">
                                      <img 
                                        src={photo.url} 
                                        alt="صورة الصيانة" 
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                      />
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity">
                                        <button 
                                          onClick={() => setPhotoPreview(photo.url)}
                                          className="p-1 bg-white text-slate-800 rounded hover:text-indigo-600"
                                        >
                                          <Eye size={10} />
                                        </button>
                                        {user?.role !== 'viewer' && (
                                          <button 
                                            onClick={() => handleDeleteAttachment(photo.id)}
                                            className="p-1 bg-red-650 text-white rounded hover:bg-red-700"
                                          >
                                            <Trash2 size={10} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {activeOrder.attachments?.filter(a => a.type === 'photo').length === 0 && (
                                  <span className="text-[9px] text-slate-400 block py-4 text-center">لا توجد صور توثيقية</span>
                                )}
                              </div>

                              {user?.role !== 'viewer' && (
                                <button
                                  type="button"
                                  onClick={() => triggerFileUpload('photo')}
                                  className="w-full mt-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Upload size={10} />
                                  <span>رفع صورة توضيحية</span>
                                </button>
                              )}
                            </div>

                            {/* Videos Documentation */}
                            <div className="bg-slate-50/70 dark:bg-slate-800/20 border border-slate-150 p-3.5 rounded-2xl flex flex-col justify-between">
                              <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 block mb-2">🎥 مقاطع الفيديو والتوثيق المرئي</span>
                              
                              <div className="space-y-2 flex-1">
                                {activeOrder.attachments?.filter(a => a.type === 'video').map((video, vidIdx) => {
                                  const isPlaying = videoPlayId === video.id;
                                  const prc = videoPercent[video.id] || 0;
                                  
                                  return (
                                    <div key={video.id ? `vid-${video.id}-${vidIdx}` : `vid-${vidIdx}`} className="p-2 bg-white dark:bg-slate-900 border border-slate-150 rounded-xl relative overflow-hidden flex flex-col gap-1.5 text-[10px]">
                                      <div className="flex items-center justify-between">
                                        <span className="font-extrabold text-slate-800 dark:text-slate-200 block truncate max-w-[100px]">{video.name}</span>
                                        {user?.role !== 'viewer' && (
                                          <button 
                                            onClick={() => handleDeleteAttachment(video.id)}
                                            className="text-rose-500 hover:text-rose-700 p-0.5"
                                          >
                                            <Trash2 size={10} />
                                          </button>
                                        )}
                                      </div>
                                      
                                      {/* Stylized video player simulator */}
                                      <div className="relative aspect-video bg-indigo-950/90 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center text-white p-2">
                                        {isPlaying ? (
                                          <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=300')` }} />
                                        ) : null}

                                        <div className="absolute inset-x-2 bottom-2 flex flex-col gap-1 z-10">
                                          {/* Simple custom timeline bar */}
                                          <div className="w-full h-1 bg-white/25 rounded-full overflow-hidden">
                                            <div className="h-full bg-sky-400 transition-all duration-300" style={{ width: `${prc}%` }} />
                                          </div>
                                        </div>

                                        <button 
                                          type="button"
                                          onClick={() => toggleLiveVideo(video.id)}
                                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-10 transition-all"
                                        >
                                          {isPlaying && prc < 100 ? <Pause size={12} /> : <Play size={12} className="mr-0.5" />}
                                        </button>
                                      </div>

                                      <span className="text-[7.5px] text-slate-400 self-end">مدة اللقطة: 0:14 د</span>
                                    </div>
                                  );
                                })}

                                {activeOrder.attachments?.filter(a => a.type === 'video').length === 0 && (
                                  <span className="text-[9px] text-slate-400 block py-4 text-center">لا توجد مقاطع فيديو</span>
                                )}
                              </div>

                              {user?.role !== 'viewer' && (
                                <button
                                  type="button"
                                  onClick={() => triggerFileUpload('video')}
                                  className="w-full mt-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[9px] font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Upload size={10} />
                                  <span>رفع فيديو معاينة</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Simulated uploading visual loader feedback */}
                          {uploadProgress !== null && (
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-dashed border-indigo-300 flex items-center gap-3 animate-pulse">
                              <RefreshCw size={14} className="text-indigo-600 animate-spin" />
                              <div className="flex-1 text-right">
                                <span className="text-[10px] font-black text-indigo-750 block">جاري تشفير وضغط الملف بأعلى جودة للاستيراد السحابي...</span>
                                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full mt-1 overflow-hidden">
                                  <div className="h-full bg-indigo-650 transition-all" style={{ width: `${uploadProgress}%` }} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <History size={36} className="opacity-20 animate-bounce" />
                        <p className="text-xs font-black mt-2">اختر بلاغ صيانة مفعلاً من القائمة الجانبية للتفصيل الميداني</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'finance' && user?.role === 'admin' && (
                <motion.div
                  key="finance-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6"
                >
                  {/* Top Notification / Title block */}
                  <div className="bg-amber-50 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-950/20 p-4 rounded-3xl flex items-center gap-3" dir="rtl">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">دفتر القيود المالية وتكاليف الصيانة للفئة الفائقة</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold mt-0.5">
                        هذه البيانات سرية للغاية ومقيدة لمستوى الإدارة والمحاسبة والتشغيل اللوجستي فقط. لا يمكن لعامة سائقي الأسطول ولا لجهات الفحص الميداني الاطلاع عليها.
                      </p>
                    </div>
                  </div>

                  {/* High Level Bento Statistics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" dir="rtl">
                    {/* Stat CARD 1: Total Spending */}
                    <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 p-4.5 rounded-[1.5rem] flex items-center justify-between shadow-xs">
                      <div className="text-right">
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 block mb-1">إجمالي تكاليف الصيانة الكلية</span>
                        <div className="flex items-baseline gap-1 justify-start">
                          <span className="text-xl sm:text-2xl font-black text-emerald-750 dark:text-emerald-300 font-sans tracking-tight">
                            {financialData.totalSpending.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-650 dark:text-emerald-400 font-sans">ر.س</span>
                        </div>
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/10">
                        <DollarSign size={20} />
                      </div>
                    </div>

                    {/* Stat CARD 2: Total Spare Parts */}
                    <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 p-4.5 rounded-[1.5rem] flex items-center justify-between shadow-xs">
                      <div className="text-right">
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 block mb-1">تكلفة مشتريات قطع الغيار</span>
                        <div className="flex items-baseline gap-1 justify-start">
                          <span className="text-xl sm:text-2xl font-black text-amber-750 dark:text-amber-300 font-sans tracking-tight">
                            {financialData.totalPartsCost.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-extrabold text-amber-650 dark:text-amber-400 font-sans">ر.س</span>
                        </div>
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/10">
                        <Settings size={18} />
                      </div>
                    </div>

                    {/* Stat CARD 3: Labor Cost */}
                    <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/15 p-4.5 rounded-[1.5rem] flex items-center justify-between shadow-xs">
                      <div className="text-right">
                        <span className="text-[10px] font-black text-blue-650 dark:text-blue-400 block mb-1">أجور الأيدي العاملة والصيانة</span>
                        <div className="flex items-baseline gap-1 justify-start">
                          <span className="text-xl sm:text-2xl font-black text-blue-750 dark:text-blue-300 font-sans tracking-tight">
                            {financialData.totalLaborCost.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 font-sans">ر.س</span>
                        </div>
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/10">
                        <Wrench size={18} />
                      </div>
                    </div>

                    {/* Stat CARD 4: Avg Order Cost */}
                    <div className="bg-slate-500/5 dark:bg-slate-500/10 border border-slate-500/15 p-4.5 rounded-[1.5rem] flex items-center justify-between shadow-xs">
                      <div className="text-right">
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 block mb-1">متوسط تكلفة كرت الصيانة</span>
                        <div className="flex items-baseline gap-1 justify-start">
                          <span className="text-xl sm:text-2xl font-black text-slate-750 dark:text-slate-300 font-sans tracking-tight">
                            {financialData.averageOrderCost.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 font-sans">ر.س</span>
                        </div>
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 shadow-sm shadow-slate-500/5">
                        <Activity size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Financial Charts Section */}
                  {financialData.completedOrders.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" dir="rtl">
                      {/* Left: cost split donut chart */}
                      <div className="lg:col-span-5 bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800/80 p-5 rounded-[1.5rem] flex flex-col justify-between shadow-xs min-h-[300px]">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 dark:text-white mb-1 text-right">توزيع تكاليف الصيانة: اليد العاملة ضد قطع الغيار</h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold text-right leading-normal">يكشف النسبة المئوية للمصروف في القطع مقابل أجرة التشغيل والفحوصات.</p>
                        </div>
                        
                        <div className="h-44 w-full relative flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'مشتريات قطع الغيار', value: financialData.totalPartsCost },
                                  { name: 'أجور اليد الفنية', value: financialData.totalLaborCost }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={65}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                <Cell fill="#f59e0b" />
                                <Cell fill="#3b82f6" />
                              </Pie>
                              <Tooltip 
                                formatter={(value: any) => [`${Number(value).toLocaleString()} ر.س`, 'التكلفة']}
                                contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          
                          {/* Inner summary stats absolute centered */}
                          <div className="absolute flex flex-col items-center">
                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-550">الإجمالي</span>
                            <span className="text-xs font-black text-slate-800 dark:text-white font-sans">{financialData.totalSpending.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-6 text-[10px] font-black pt-2 border-t border-slate-100 dark:border-slate-800/60 leading-none">
                          <span className="flex items-center gap-1.5 text-amber-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span>قطع الغيار ({financialData.totalSpending ? Math.round((financialData.totalPartsCost / financialData.totalSpending) * 100) : 0}%)</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-blue-500">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            <span>أجور فنية ({financialData.totalSpending ? Math.round((financialData.totalLaborCost / financialData.totalSpending) * 100) : 0}%)</span>
                          </span>
                        </div>
                      </div>

                      {/* Right: cost categories bar chart */}
                      <div className="lg:col-span-7 bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800/80 p-5 rounded-[1.5rem] flex flex-col justify-between shadow-xs min-h-[300px]">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 dark:text-white mb-1 text-right">مصروفات الصيانة مقسمة حسب الأنظمة الميكانيكية والكهربائية</h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold text-right leading-normal">يتابع حجم التكاليف الكلية شاملة لكل فئة لتقرير جودة وكفاءة عمل المركبة.</p>
                        </div>

                        <div className="h-44 w-full mt-3">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={Object.entries(financialData.categoryCosts).map(([cat, val]) => {
                                const catNames: Record<string, string> = {
                                  mechanical: 'ميكانيكا',
                                  electrical: 'كهرباء',
                                  cooling: 'أنظمة تبريد',
                                  hydraulic: 'هيدروليك',
                                  bodywork: 'هياكل/سمكرة'
                                };
                                return {
                                  name: catNames[cat] || cat,
                                  'التكلفة الكلية (ر.س)': val
                                };
                              })}
                              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis 
                                tick={{ fontSize: 9, fontWeight: 'bold', fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <Tooltip 
                                formatter={(value: any) => [`${Number(value).toLocaleString()} ر.س`, 'التكلفة الكلية']}
                                contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                              />
                              <Bar dataKey="التكلفة الكلية (ر.س)" radius={[6, 6, 0, 0]}>
                                {Object.entries(financialData.categoryCosts).map((entry, index) => {
                                  const colors = ['#6366f1', '#8b5cf6', '#0ea5e9', '#f43f5e', '#f59e0b'];
                                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                })}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="h-3" />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-950/20 border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-3xl flex flex-col items-center justify-center text-center">
                      <DollarSign size={36} className="text-slate-400 mb-2 animate-pulse" />
                      <h4 className="text-xs font-black text-slate-850 dark:text-white leading-tight">لم يتم العثور على قيود الصيانة المكتملة</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold max-w-sm mt-1 leading-normal">
                        عند قيامك بإنجاز بلاغات صيانة في شاشة الصيانة وتعيين أسعار لقطع الغيار وتكلفة الصيانة، سيقوم كاشف النظام التلقائي بإدراجها في التقرير المالي هنا.
                      </p>
                    </div>
                  )}

                  {/* Financial Ledger Tabbed Interface (Bills ledger vs Component ledger) */}
                  <div className="border border-slate-100 dark:border-slate-800/80 rounded-[1.5rem] overflow-hidden bg-white dark:bg-[#0f1422] shadow-xs" dir="rtl">
                    {/* Header Controls */}
                    <div className="bg-slate-50/70 dark:bg-slate-900/60 p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight">سجل قيود الحسابات ودفاتر الدفع المعتمدة للكلفة</h4>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-0.5 leading-normal">تبديل الرؤية بين فواتير الأوامر الشاملة وقائمة قطع الغيار المستحقة للضمان والجدولة.</p>
                      </div>
                      
                      {/* Control buttons */}
                      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/40 shrink-0">
                        <button
                          type="button"
                          onClick={() => setFinanceSubTab('bills')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            financeSubTab === 'bills'
                              ? 'bg-white dark:bg-[#151c2e] text-[#2563eb] shadow-xs border border-slate-200/10'
                              : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350'
                          }`}
                        >
                          💸 فواتير الأوامر ({financialData.completedOrders.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setFinanceSubTab('parts')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            financeSubTab === 'parts'
                              ? 'bg-white dark:bg-[#151c2e] text-[#2563eb] shadow-xs border border-slate-200/10'
                              : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350'
                          }`}
                        >
                          🚚 بنود قطع الغيار المعتمدة ({financialData.allParts.length})
                        </button>
                      </div>
                    </div>

                    {/* Table Container list */}
                    <div className="overflow-x-auto">
                      {financeSubTab === 'bills' ? (
                        <table className="w-full text-right text-[11px] font-bold border-collapse">
                          <thead>
                            <tr className="bg-slate-50/55 dark:bg-slate-900/40 text-slate-450 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                              <th className="pr-5 py-3 font-black text-slate-900 dark:text-white text-right">رقم الفاتورة والتاريخ</th>
                              <th className="py-3 font-black text-slate-900 dark:text-white text-right">عنوان بلاغ الصيانة والفئة</th>
                              <th className="py-3 font-black text-slate-900 dark:text-white text-right">تكلفة بنود قطع الغيار</th>
                              <th className="py-3 font-black text-slate-900 dark:text-white text-right">أجور الورشة والصيانة</th>
                              <th className="py-3 font-black text-slate-900 dark:text-white text-left pl-5">التكلفة الإجمالية للفاتورة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-sans">
                            {financialData.completedOrders.length > 0 ? (
                              financialData.completedOrders.map((ord) => {
                                const orderPartsCost = ord.supplierParts ? ord.supplierParts.reduce((sum, p) => sum + (p.qty * p.unitPrice), 0) : 0;
                                const laborCost = Math.max(0, (ord.cost !== undefined ? ord.cost : orderPartsCost) - orderPartsCost);
                                const total = ord.cost !== undefined ? ord.cost : orderPartsCost;

                                return (
                                  <tr key={ord.id} className="hover:bg-slate-55/70 dark:hover:bg-slate-800/10 transition-colors">
                                    <td className="pr-5 py-3.5">
                                      <span className="block text-slate-800 dark:text-slate-150 font-extrabold font-mono text-[11.5px]">{ord.orderNumber}</span>
                                      <span className="block text-[9.5px] font-extrabold text-slate-450 dark:text-slate-550 font-mono tracking-wide mt-0.5">{ord.date}</span>
                                    </td>
                                    <td className="py-3.5">
                                      <span className="block text-slate-900 dark:text-white text-xs truncate max-w-[240px] font-black">{ord.description}</span>
                                      <span className="inline-block mt-1">
                                        {(() => {
                                          const catInfo = categoryNames[ord.category] || { label: ord.category, color: 'text-slate-500 bg-slate-50' };
                                          return (
                                            <span className={`px-2 py-0.5 rounded text-[8.5px] font-black border ${catInfo.color}`}>
                                              {catInfo.label}
                                            </span>
                                          );
                                        })()}
                                      </span>
                                    </td>
                                    <td className="py-3.5 text-slate-700 dark:text-slate-350 font-mono">
                                      {orderPartsCost.toLocaleString()} ر.س
                                    </td>
                                    <td className="py-3.5 text-slate-700 dark:text-slate-350 font-mono">
                                      {laborCost.toLocaleString()} ر.س
                                    </td>
                                    <td className="py-3.5 pl-5 text-left text-xs font-black text-emerald-600 dark:text-emerald-450 font-mono">
                                      {total.toLocaleString()} ر.س
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500 font-extrabold">
                                  لا توجد فواتير صيانة منجزة مسلجة لهذه المركبة حتى الآن.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      ) : (
                        <table className="w-full text-right text-[11px] font-bold border-collapse">
                          <thead>
                            <tr className="bg-slate-50/55 dark:bg-slate-900/40 text-slate-450 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                              <th className="pr-5 py-3 font-black text-slate-900 dark:text-white text-right">اسم القطعة ورمز القطعة</th>
                              <th className="py-3 font-black text-slate-900 dark:text-white text-right">أمر صيانة الأسطول والمورد</th>
                              <th className="py-3 font-black text-slate-900 dark:text-white text-center">الكمية</th>
                              <th className="py-3 font-black text-slate-900 dark:text-white text-right">السعر المفرد</th>
                              <th className="py-3 font-black text-slate-900 dark:text-white text-right">المجموع الكلي</th>
                              <th className="py-3 font-black text-slate-900 dark:text-white text-left pl-5">حالة ضمان البند من المورد</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-sans">
                            {financialData.allParts.length > 0 ? (
                              financialData.allParts.map((p, pIdx) => {
                                const partTotal = p.qty * p.unitPrice;
                                const wInfo = getWarrantyStatus(p.orderDate, p.warrantyMonths);

                                return (
                                  <tr key={p.id ? `fin-part-${p.id}-${pIdx}` : `fin-part-${pIdx}`} className="hover:bg-slate-55/70 dark:hover:bg-slate-800/10 transition-all font-sans">
                                    <td className="pr-5 py-3.5">
                                      <span className="block text-slate-850 dark:text-slate-100 font-extrabold text-xs">{p.name}</span>
                                      <span className="block text-[9.5px] font-black text-slate-400 dark:text-slate-550 font-mono tracking-wider mt-0.5">{p.partNumber}</span>
                                    </td>
                                    <td className="py-3.5">
                                      <span className="block text-slate-100 dark:text-slate-200 text-[10px] font-mono leading-none font-extrabold">أمر شغل: {p.orderNumber}</span>
                                      <span className="block text-[9.5px] font-bold text-slate-450 dark:text-slate-500 mt-1">{p.supplier}</span>
                                    </td>
                                    <td className="py-3.5 text-center">
                                      <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 font-mono text-[10px] rounded font-black">
                                        {p.qty}x
                                      </span>
                                    </td>
                                    <td className="py-3.5 text-slate-650 dark:text-slate-350 font-mono">
                                      {p.unitPrice.toLocaleString()} ر.س
                                    </td>
                                    <td className="py-3.5 text-slate-900 dark:text-slate-100 font-extrabold font-mono text-xs">
                                      {partTotal.toLocaleString()} ر.س
                                    </td>
                                    <td className="py-3.5 pl-5 text-left">
                                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black border ${
                                        wInfo.active 
                                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15' 
                                          : 'bg-rose-500/10 text-rose-550 border-rose-500/15'
                                      }`}>
                                        {wInfo.active ? '✔️' : '⚠️'} {wInfo.label}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 font-extrabold">
                                  لا توجد بنود قطع غيار مسجلة لهذه المركبة حتى الآن.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'periodic' && (
                <motion.div
                  key="periodic-tab"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6"
                >
                  <VehiclePeriodicTab 
                    vehicleId={vehicle.id} 
                    onRecordAdded={() => setReloadTrigger(prev => prev + 1)} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dynamic Image Overlay Modal for inspection */}
          <AnimatePresence>
            {photoPreview && (
              <div 
                className="fixed inset-0 bg-black/90 backdrop-blur-xs z-[70] flex items-center justify-center p-4 cursor-zoom-out"
                onClick={() => setPhotoPreview(null)}
              >
                <div className="relative max-w-full max-h-[85vh] overflow-hidden rounded-2xl border-2 border-white/20">
                  <img src={photoPreview} alt="نظرة مجهرية على العيب أو القطعة" className="object-contain" referrerPolicy="no-referrer" />
                  <button 
                    onClick={() => setPhotoPreview(null)}
                    className="absolute top-3 right-3 p-2 bg-black/80 hover:bg-black text-white hover:text-rose-500 rounded-full cursor-pointer transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Vehicle QR Code Generator Modal */}
          <VehicleQrModal 
            vehicle={vehicle}
            isOpen={showQrModal}
            onClose={() => setShowQrModal(false)}
            language={user?.role === 'admin' ? 'ar' : 'ar'}
          />

          {/* Footer Copyright and stamp */}
          <div className="p-4 md:p-5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 text-center sm:text-right">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500">
              جميع حقوق الأصول وسجل الملكية والضمان والوصولات محفوظة للمؤسسة الرسمية - نظام الميكانيك © 2026
            </p>
            <div className="flex items-center gap-1 text-[9px] font-black text-indigo-505 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 pl-2.5 py-0.5 rounded-full">
              <ShieldCheck size={11} className="text-emerald-500" />
              <span>نظام تدقيق الجودة ISO 9001</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
