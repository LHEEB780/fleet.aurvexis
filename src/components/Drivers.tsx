import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  User, 
  Check, 
  X, 
  Edit, 
  Trash2, 
  IdCard, 
  Truck, 
  AlertTriangle, 
  Phone, 
  Building2, 
  Calendar,
  Sparkles,
  RefreshCw,
  Clock,
  UserCheck,
  UserX,
  UserMinus,
  TrendingUp,
  Award,
  ShieldAlert,
  Wrench,
  LayoutGrid,
  List
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
import { Driver, Vehicle, User as AppUser } from '../types';
import { vehicles as initialVehicles } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import ContextualHelp from './ContextualHelp';

// Anchor System Date is 2026-05-30T19:20:00Z
const SYSTEM_ANCHOR_DATE = '2026-05-30';

interface DriversProps {
  user: AppUser;
}

const getDriverMetrics = (driverId: string, driverName?: string) => {
  const defaultMetricsMap: Record<string, {
    accidents: number;
    maintenanceIncidents: number;
    totalTrips: number;
    radarData: { subject: string; subjectEn: string; score: number }[];
  }> = {
    'd1': {
      accidents: 0,
      maintenanceIncidents: 1,
      totalTrips: 184,
      radarData: [
        { subject: 'الالتزام بالسرعة', subjectEn: 'Speed Compliance', score: 95 },
        { subject: 'الفرامل الآمنة', subjectEn: 'Safe Braking', score: 90 },
        { subject: 'قواعد المرور', subjectEn: 'Traffic Rules', score: 98 },
        { subject: 'سلامة الآلية', subjectEn: 'Vehicle Care', score: 85 },
        { subject: 'اقتصاد الوقود', subjectEn: 'Fuel Economy', score: 82 },
        { subject: 'انتظام الجدول', subjectEn: 'Schedule Adherence', score: 94 }
      ]
    },
    'd2': {
      accidents: 2,
      maintenanceIncidents: 5,
      totalTrips: 342,
      radarData: [
        { subject: 'الالتزام بالسرعة', subjectEn: 'Speed Compliance', score: 62 },
        { subject: 'الفرامل الآمنة', subjectEn: 'Safe Braking', score: 68 },
        { subject: 'قواعد المرور', subjectEn: 'Traffic Rules', score: 58 },
        { subject: 'سلامة الآلية', subjectEn: 'Vehicle Care', score: 70 },
        { subject: 'اقتصاد الوقود', subjectEn: 'Fuel Economy', score: 60 },
        { subject: 'انتظام الجدول', subjectEn: 'Schedule Adherence', score: 84 }
      ]
    },
    'd3': {
      accidents: 1,
      maintenanceIncidents: 3,
      totalTrips: 215,
      radarData: [
        { subject: 'الالتزام بالسرعة', subjectEn: 'Speed Compliance', score: 78 },
        { subject: 'الفرامل الآمنة', subjectEn: 'Safe Braking', score: 82 },
        { subject: 'قواعد المرور', subjectEn: 'Traffic Rules', score: 72 },
        { subject: 'سلامة الآلية', subjectEn: 'Vehicle Care', score: 76 },
        { subject: 'اقتصاد الوقود', subjectEn: 'Fuel Economy', score: 74 },
        { subject: 'انتظام الجدول', subjectEn: 'Schedule Adherence', score: 80 }
      ]
    },
    'd4': {
      accidents: 0,
      maintenanceIncidents: 2,
      totalTrips: 92,
      radarData: [
        { subject: 'الالتزام بالسرعة', subjectEn: 'Speed Compliance', score: 90 },
        { subject: 'الفرامل الآمنة', subjectEn: 'Safe Braking', score: 86 },
        { subject: 'قواعد المرور', subjectEn: 'Traffic Rules', score: 92 },
        { subject: 'سلامة الآلية', subjectEn: 'Vehicle Care', score: 80 },
        { subject: 'اقتصاد الوقود', subjectEn: 'Fuel Economy', score: 85 },
        { subject: 'انتظام الجدول', subjectEn: 'Schedule Adherence', score: 88 }
      ]
    },
    'd5': {
      accidents: 0,
      maintenanceIncidents: 0,
      totalTrips: 112,
      radarData: [
        { subject: 'الالتزام بالسرعة', subjectEn: 'Speed Compliance', score: 98 },
        { subject: 'الفرامل الآمنة', subjectEn: 'Safe Braking', score: 95 },
        { subject: 'قواعد المرور', subjectEn: 'Traffic Rules', score: 99 },
        { subject: 'سلامة الآلية', subjectEn: 'Vehicle Care', score: 94 },
        { subject: 'اقتصاد الوقود', subjectEn: 'Fuel Economy', score: 90 },
        { subject: 'انتظام الجدول', subjectEn: 'Schedule Adherence', score: 96 }
      ]
    }
  };

  if (defaultMetricsMap[driverId]) {
    return defaultMetricsMap[driverId];
  }

  // Generate deterministic mock metrics for custom drivers
  const nameHash = (driverName || driverId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const scoreFactor = (nameHash % 25) + 70; // 70 to 95
  const accidents = nameHash % 3 === 0 ? 1 : 0;
  const maintenanceIncidents = nameHash % 4;
  const totalTrips = 50 + (nameHash % 150);

  return {
    accidents,
    maintenanceIncidents,
    totalTrips,
    radarData: [
      { subject: 'الالتزام بالسرعة', subjectEn: 'Speed Compliance', score: scoreFactor },
      { subject: 'الفرامل الآمنة', subjectEn: 'Safe Braking', score: Math.round(scoreFactor * 0.95) },
      { subject: 'قواعد المرور', subjectEn: 'Traffic Rules', score: (Math.round(scoreFactor * 1.02) % 30) + 70 },
      { subject: 'سلامة الآلية', subjectEn: 'Vehicle Care', score: Math.round(scoreFactor * 0.88) },
      { subject: 'اقتصاد الوقود', subjectEn: 'Fuel Economy', score: Math.round(scoreFactor * 0.9) },
      { subject: 'انتظام الجدول', subjectEn: 'Schedule Adherence', score: (Math.round(scoreFactor * 1.01) % 30) + 70 }
    ]
  };
};

const REAL_HUMAN_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1620122303020-43ec4b6cf7f8?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=200&h=200',
];

export const getRealAvatarByName = (name: string) => {
  if (!name) return REAL_HUMAN_AVATARS[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return REAL_HUMAN_AVATARS[sum % REAL_HUMAN_AVATARS.length];
};

const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'd1',
    name: 'سالم عبد الرحمن الدوسري',
    identityNumber: '1098472918',
    licenseNumber: 'LCR-9048128',
    licenseType: 'خفيف',
    licenseExpiry: '2027-10-14',
    phone: '0509874521',
    department: 'قسم الآليات',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
    assignedVehicleId: '1',
    joinDate: '2023-04-10'
  },
  {
    id: 'd2',
    name: 'فهد بن مساعد المرشدي',
    identityNumber: '1038472194',
    licenseNumber: 'HVL-2094857',
    licenseType: 'ثقيل',
    licenseExpiry: '2026-06-15', // Expires in about half a month (Critical!)
    phone: '0551234789',
    department: 'قسم الآليات',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200',
    assignedVehicleId: '2',
    joinDate: '2022-01-18'
  },
  {
    id: 'd3',
    name: 'عبد الله عمر الحربي',
    identityNumber: '1058274932',
    licenseNumber: 'PBL-4029481',
    licenseType: 'عمومي',
    licenseExpiry: '2025-12-01', // Expired!
    phone: '0562234123',
    department: 'قسم الاستثمار',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200',
    assignedVehicleId: '3',
    joinDate: '2021-08-01'
  },
  {
    id: 'd4',
    name: 'عادل منصور القحطاني',
    identityNumber: '1074829381',
    licenseNumber: 'CST-7182938',
    licenseType: 'إنشائي',
    licenseExpiry: '2028-09-22',
    phone: '0543345566',
    department: 'قسم الشؤون الهندسية',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1620122303020-43ec4b6cf7f8?auto=format&fit=crop&q=80&w=200&h=200',
    assignedVehicleId: '4',
    joinDate: '2024-05-12'
  },
  {
    id: 'd5',
    name: 'سلطان صلاح الغامدي',
    identityNumber: '1104829104',
    licenseNumber: 'LCR-8120482',
    licenseType: 'خفيف',
    licenseExpiry: '2029-01-05',
    phone: '0507722119',
    department: 'قسم الآليات',
    status: 'vacation',
    avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=200&h=200',
    assignedVehicleId: undefined,
    joinDate: '2025-02-15'
  }
];

export default function Drivers({ user }: DriversProps) {
  const { language, dir, t } = useLanguage();
  const [selectedDetailDriver, setSelectedDetailDriver] = useState<Driver | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Load drivers state from localStorage
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('fleet_drivers_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((driver: Driver) => {
            if (!driver.avatar || driver.avatar.includes('api.dicebear.com') || driver.avatar.includes('dicebear')) {
              return {
                ...driver,
                avatar: getRealAvatarByName(driver.name),
              };
            }
            return driver;
          });
        }
      } catch(e) {}
    }
    return INITIAL_DRIVERS;
  });

  // Load vehicles to show link opportunities
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('fleet_vehicles_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return initialVehicles;
  });

  // Save drivers list dynamically
  useEffect(() => {
    localStorage.setItem('fleet_drivers_v2', JSON.stringify(drivers));
  }, [drivers]);

  // Keep vehicles read in sync with any global changes
  const reloadVehicles = () => {
    const saved = localStorage.getItem('fleet_vehicles_v3');
    if (saved) {
      try { setVehicles(JSON.parse(saved)); } catch(e) {}
    }
  };

  useEffect(() => {
    window.addEventListener('storage', reloadVehicles);
    return () => window.removeEventListener('storage', reloadVehicles);
  }, []);

  // UI state filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [licenseFilter, setLicenseFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modals / forms state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  
  // New Driver Form Inputs
  const [formInputs, setFormInputs] = useState({
    name: '',
    identityNumber: '',
    phone: '',
    licenseNumber: '',
    licenseType: 'خفيف',
    licenseExpiry: '',
    department: 'قسم الآليات',
    status: 'active' as 'active' | 'suspended' | 'vacation',
    assignedVehicleId: '',
    avatarSeed: '',
    driverRole: 'driver' as 'driver' | 'dispatcher' | 'both',
    movementAuthNumber: '',
    movementAuthExpiry: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Helper: check license expiry status
  // Returns: 'expired' (before current date), 'critical' (within 90 days), or 'valid'
  const getLicenseStatus = (expiryDateStr: string) => {
    if (!expiryDateStr) return 'valid';
    const expiry = new Date(expiryDateStr);
    const anchor = new Date(SYSTEM_ANCHOR_DATE);
    
    if (expiry < anchor) {
      return 'expired';
    }
    
    // Check remaining days
    const diffTime = expiry.getTime() - anchor.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 90) {
      return 'critical';
    }
    
    return 'valid';
  };

  // Helper: check dispatch authority status
  const getAuthStatus = (expiryDateStr?: string) => {
    if (!expiryDateStr) return 'valid';
    const expiry = new Date(expiryDateStr);
    const anchor = new Date(SYSTEM_ANCHOR_DATE);
    if (expiry < anchor) return 'expired';
    const diffTime = expiry.getTime() - anchor.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 90) return 'critical';
    return 'valid';
  };

  // Helper: format days remaining or expired
  const getLicenseRemainingLabel = (expiryDateStr: string) => {
    if (!expiryDateStr) return '';
    const expiry = new Date(expiryDateStr);
    const anchor = new Date(SYSTEM_ANCHOR_DATE);
    
    if (expiry < anchor) {
      const diffTime = anchor.getTime() - expiry.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `منتهية منذ ${diffDays} يوم`;
    } else {
      const diffTime = expiry.getTime() - anchor.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) {
        return `تنتهي خلال ${diffDays} يوم ⚠️`;
      }
      return `صالحة لـ ${diffDays} يوم`;
    }
  };

  // Helper: format authority remaining label
  const getAuthRemainingLabel = (expiryDateStr?: string) => {
    if (!expiryDateStr) return 'غير محدد';
    const expiry = new Date(expiryDateStr);
    const anchor = new Date(SYSTEM_ANCHOR_DATE);
    if (expiry < anchor) {
      const diffTime = anchor.getTime() - expiry.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `منتهٍ منذ ${diffDays} يوم`;
    } else {
      const diffTime = expiry.getTime() - anchor.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) {
        return `ينتهي خلال ${diffDays} يوم ⚠️`;
      }
      return `صالح لـ ${diffDays} يوم`;
    }
  };

  // KPI calculations
  const totalDriversCount = drivers.length;
  const activeCount = drivers.filter(d => d.status === 'active').length;
  const dispatchersCount = drivers.filter(d => d.driverRole === 'dispatcher' || d.driverRole === 'both').length;
  const unassignedCount = drivers.filter(d => !d.assignedVehicleId).length;
  
  const criticalLicensesCount = drivers.filter(d => {
    const licStat = getLicenseStatus(d.licenseExpiry);
    const authStat = d.driverRole !== 'driver' ? getAuthStatus(d.movementAuthExpiry) : 'valid';
    return licStat === 'expired' || licStat === 'critical' || authStat === 'expired' || authStat === 'critical';
  }).length;

  // Search/Filters execution
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.identityNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    const matchesLicense = licenseFilter === 'all' || driver.licenseType === licenseFilter;
    const matchesRole = 
      roleFilter === 'all' || 
      (roleFilter === 'driver' && (driver.driverRole === 'driver' || driver.driverRole === 'both' || !driver.driverRole)) ||
      (roleFilter === 'dispatcher' && (driver.driverRole === 'dispatcher' || driver.driverRole === 'both')) ||
      (roleFilter === 'both' && driver.driverRole === 'both');

    return matchesSearch && matchesStatus && matchesLicense && matchesRole;
  });

  // Open modal for Adding
  const handleOpenAdd = () => {
    if (user.role === 'viewer') return;
    setEditingDriver(null);
    setFormInputs({
      name: '',
      identityNumber: '',
      phone: '',
      licenseNumber: '',
      licenseType: 'خفيف',
      licenseExpiry: '',
      department: 'قسم الآليات',
      status: 'active',
      assignedVehicleId: '',
      avatarSeed: `seed-${Math.floor(Math.random() * 10000)}`,
      driverRole: 'driver',
      movementAuthNumber: '',
      movementAuthExpiry: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (driver: Driver) => {
    if (user.role === 'viewer') return;
    setEditingDriver(driver);
    setFormInputs({
      name: driver.name,
      identityNumber: driver.identityNumber,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      licenseType: driver.licenseType,
      licenseExpiry: driver.licenseExpiry,
      department: driver.department,
      status: driver.status,
      assignedVehicleId: driver.assignedVehicleId || '',
      avatarSeed: driver.name, // placeholder seed fallback
      driverRole: driver.driverRole || 'driver',
      movementAuthNumber: driver.movementAuthNumber || '',
      movementAuthExpiry: driver.movementAuthExpiry || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Delete Driver action
  const handleDeleteDriver = (id: string, name: string) => {
    if (user.role === 'viewer') return;
    if (window.confirm(`هل أنت متأكد من حذف السائق "${name}" من سجلات المنظومة نهائياً؟`)) {
      // Find driver to check if linked to vehicle
      const deletedDriver = drivers.find(d => d.id === id);
      const vehicleIdToRelease = deletedDriver?.assignedVehicleId;

      const updatedDrivers = drivers.filter(d => d.id !== id);
      setDrivers(updatedDrivers);

      // If driver was assigned to a vehicle, clean assignedDriverId on that vehicle
      if (vehicleIdToRelease) {
        const updatedVehicles = vehicles.map(v => {
          if (v.id === vehicleIdToRelease) {
            return { ...v, assignedDriverId: undefined };
          }
          return v;
        });
        setVehicles(updatedVehicles);
        localStorage.setItem('fleet_vehicles_v3', JSON.stringify(updatedVehicles));
      }
    }
  };

  // Release/Unlink vehicle link directly
  const handleUnlinkVehicle = (driverId: string, vehicleId: string) => {
    if (user.role === 'viewer') return;

    // Remove link from driver
    const updatedDrivers = drivers.map(d => {
      if (d.id === driverId) {
        return { ...d, assignedVehicleId: undefined };
      }
      return d;
    });
    setDrivers(updatedDrivers);

    // Remove link from vehicle
    const updatedVehicles = vehicles.map(v => {
      if (v.id === vehicleId) {
        return { ...v, assignedDriverId: undefined };
      }
      return v;
    });
    setVehicles(updatedVehicles);
    localStorage.setItem('fleet_vehicles_v3', JSON.stringify(updatedVehicles));
  };

  // Submit Handler for Add / Edit Driver Modal
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.role === 'viewer') return;

    // Simple validations
    const errors: Record<string, string> = {};
    if (!formInputs.name.trim()) errors.name = 'الاسم الكامل مطلوب';
    if (!formInputs.identityNumber.trim()) errors.identityNumber = 'رقم الهوية / الإقامة مطلوب';
    if (!formInputs.phone.trim()) errors.phone = 'رقم الجوال مطلوب';
    if (!formInputs.licenseNumber.trim()) errors.licenseNumber = 'رقم رخصة القيادة مطلوب';
    if (!formInputs.licenseExpiry) errors.licenseExpiry = 'تاريخ انتهاء الرخصة مطلوب';

    if (formInputs.driverRole !== 'driver') {
      if (!formInputs.movementAuthNumber.trim()) {
        errors.movementAuthNumber = 'رقم قرار التفويض بالحركة مطلوب';
      }
      if (!formInputs.movementAuthExpiry) {
        errors.movementAuthExpiry = 'تاريخ انتهاء قرار التفويض مطلوب';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const linkedVehicleId = formInputs.assignedVehicleId || undefined;
    const oldVehicleId = editingDriver?.assignedVehicleId;

    if (editingDriver) {
      // Edit mode
      const updatedDrivers = drivers.map(d => {
        if (d.id === editingDriver.id) {
          return {
            ...d,
            name: formInputs.name,
            identityNumber: formInputs.identityNumber,
            phone: formInputs.phone,
            licenseNumber: formInputs.licenseNumber,
            licenseType: formInputs.licenseType,
            licenseExpiry: formInputs.licenseExpiry,
            department: formInputs.department,
            status: formInputs.status,
            assignedVehicleId: linkedVehicleId,
            driverRole: formInputs.driverRole,
            movementAuthNumber: formInputs.driverRole !== 'driver' ? formInputs.movementAuthNumber : undefined,
            movementAuthExpiry: formInputs.driverRole !== 'driver' ? formInputs.movementAuthExpiry : undefined
          };
        }
        return d;
      });
      setDrivers(updatedDrivers);

      // Synced Vehicles Database adjustment
      let updatedVehicles = [...vehicles];
      
      // If the vehicle assignment changed:
      if (oldVehicleId !== linkedVehicleId) {
        // Clear previous vehicle driver link
        if (oldVehicleId) {
          updatedVehicles = updatedVehicles.map(v => 
            v.id === oldVehicleId ? { ...v, assignedDriverId: undefined } : v
          );
        }
        // Save new vehicle driver link
        if (linkedVehicleId) {
          // If another driver was previously assigned to this new vehicle, clear their link in drivers
          const currentOccupantIndex = updatedDrivers.findIndex(d => d.assignedVehicleId === linkedVehicleId && d.id !== editingDriver.id);
          if (currentOccupantIndex > -1) {
            // Unlink from other driver
            setDrivers(prev => prev.map((d, idx) => {
              if (idx === currentOccupantIndex) {
                return { ...d, assignedVehicleId: undefined };
              }
              return d;
            }));
          }

          updatedVehicles = updatedVehicles.map(v => 
            v.id === linkedVehicleId ? { ...v, assignedDriverId: editingDriver.id } : v
          );
        }
      }

      setVehicles(updatedVehicles);
      localStorage.setItem('fleet_vehicles_v3', JSON.stringify(updatedVehicles));

    } else {
      // Add mode
      const newDriverId = `d_${Date.now()}`;
      const newDriver: Driver = {
        id: newDriverId,
        name: formInputs.name,
        identityNumber: formInputs.identityNumber,
        phone: formInputs.phone,
        licenseNumber: formInputs.licenseNumber,
        licenseType: formInputs.licenseType,
        licenseExpiry: formInputs.licenseExpiry,
        department: formInputs.department,
        status: formInputs.status,
        avatar: getRealAvatarByName(formInputs.name),
        assignedVehicleId: linkedVehicleId,
        joinDate: SYSTEM_ANCHOR_DATE,
        driverRole: formInputs.driverRole,
        movementAuthNumber: formInputs.driverRole !== 'driver' ? formInputs.movementAuthNumber : undefined,
        movementAuthExpiry: formInputs.driverRole !== 'driver' ? formInputs.movementAuthExpiry : undefined
      };

      const updatedDrivers = [newDriver, ...drivers];
      setDrivers(updatedDrivers);

      // Sync vehicle if associated inside creation state
      if (linkedVehicleId) {
        const updatedVehicles = vehicles.map(v => {
          if (v.id === linkedVehicleId) {
            return { ...v, assignedDriverId: newDriverId };
          }
          return v;
        });
        setVehicles(updatedVehicles);
        localStorage.setItem('fleet_vehicles_v3', JSON.stringify(updatedVehicles));
      }
    }

    setIsModalOpen(false);
  };

  // Smart Recommender to find fitting driver for a vehicle based on License suitability
  const getLicenseTypeColor = (type: string) => {
    switch (type) {
      case 'ثقيل': return 'bg-[#ea580c]/10 text-[#ea580c] border-[#ea580c]/20';
      case 'عمومي': return 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20';
      case 'إنشائي': return 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20';
      default: return 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20'; // خفيف
    }
  };

  return (
    <div className="space-y-6" id="drivers-management-canvas">
      {/* Dynamic Modal for Adding / Editing driver */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto" dir="rtl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#0f1422] rounded-[2rem] border border-slate-100 dark:border-slate-800 p-5 sm:p-6 w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh] my-auto overflow-hidden"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 left-5 p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 rounded-full cursor-pointer transition-all z-10"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 mb-4 shrink-0">
                <div className="p-2.5 bg-purple-600 text-white rounded-xl">
                  <IdCard size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                     {editingDriver ? 'تعديل وتحديث بيانات الموظف' : 'تسجيل وتوثيق سائق أو مفوض حركة جديد'}
                  </h3>
                  <p className="text-[10px] text-slate-505 dark:text-slate-400">
                    توثيق رخص القيادة وتفويضات الحركة الميدانية المعتمدة من الجهات المختصة بالمنظومة
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col min-h-0 text-right">
                <div className="flex-1 overflow-y-auto pr-1 pl-1 py-1 space-y-4 max-h-[55vh] md:max-h-[50vh] min-h-0">
                  
                  {/* Operational Role Selection */}
                  <div className="bg-purple-500/5 dark:bg-purple-950/20 p-3 rounded-2xl border border-purple-500/10 space-y-2">
                    <label className="text-[10.5px] font-black text-purple-800 dark:text-purple-400 block">
                      الصفة التشغيلية والدور بالمنظومة:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormInputs({ ...formInputs, driverRole: 'driver' })}
                        className={`py-2 text-[10px] font-black rounded-xl border transition-all cursor-pointer text-center ${
                          formInputs.driverRole === 'driver'
                            ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50'
                        }`}
                      >
                        سائق فقط
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormInputs({ ...formInputs, driverRole: 'dispatcher' })}
                        className={`py-2 text-[10px] font-black rounded-xl border transition-all cursor-pointer text-center ${
                          formInputs.driverRole === 'dispatcher'
                            ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50'
                        }`}
                      >
                        مفوض حركة فقط
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormInputs({ ...formInputs, driverRole: 'both' })}
                        className={`py-2 text-[10px] font-black rounded-xl border transition-all cursor-pointer text-center ${
                          formInputs.driverRole === 'both'
                            ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50'
                        }`}
                      >
                        سائق ومفوض معاً
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-650 dark:text-slate-350">
                        الاسم الكامل للسائق:<span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text"
                        className="w-full px-3 py-2 text-xs font-bold leading-normal outline-none bg-slate-50 dark:bg-slate-900 border border-slate-150 rounded-xl focus:border-brand-blue-500 text-slate-900 dark:text-white"
                        placeholder="نايف الحربي"
                        value={formInputs.name}
                        onChange={(e) => setFormInputs({ ...formInputs, name: e.target.value })}
                      />
                      {formErrors.name && (
                        <p className="text-[9.5px] text-rose-500 font-bold">{formErrors.name}</p>
                      )}
                    </div>

                  {/* Identity number */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-650 dark:text-slate-350">
                      رقم الهوية الوطنية / الإقامة:<span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text"
                      maxLength={10}
                      className="w-full px-3 py-2 text-xs font-bold font-mono outline-none bg-slate-50 dark:bg-slate-900 border border-slate-150 rounded-xl focus:border-brand-blue-500 text-slate-900 dark:text-white"
                      placeholder="10XXXXXXXX"
                      value={formInputs.identityNumber}
                      onChange={(e) => setFormInputs({ ...formInputs, identityNumber: e.target.value.replace(/\D/g, '') })}
                    />
                    {formErrors.identityNumber && (
                      <p className="text-[9.5px] text-rose-500 font-bold">{formErrors.identityNumber}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-650 dark:text-slate-350">
                      رقم الجوال:<span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 text-xs font-bold font-mono outline-none bg-slate-50 dark:bg-slate-900 border border-slate-150 rounded-xl focus:border-brand-blue-500 text-slate-900 dark:text-white"
                      placeholder="05XXXXXXXX"
                      value={formInputs.phone}
                      onChange={(e) => setFormInputs({ ...formInputs, phone: e.target.value })}
                    />
                    {formErrors.phone && (
                      <p className="text-[9.5px] text-rose-500 font-bold">{formErrors.phone}</p>
                    )}
                  </div>

                  {/* License Number */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-650 dark:text-slate-350">
                      رقم رخصة القيادة المعتمدة:<span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 text-xs font-bold font-mono outline-none bg-slate-50 dark:bg-slate-900 border border-slate-150 rounded-xl focus:border-brand-blue-500 text-slate-900 dark:text-white"
                      placeholder="LCR-XXXXXX"
                      value={formInputs.licenseNumber}
                      onChange={(e) => setFormInputs({ ...formInputs, licenseNumber: e.target.value })}
                    />
                    {formErrors.licenseNumber && (
                      <p className="text-[9.5px] text-rose-500 font-bold">{formErrors.licenseNumber}</p>
                    )}
                  </div>

                  {/* License Type */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-650 dark:text-slate-350">
                      فئة رخصة القيادة:
                    </label>
                    <select
                      className="w-full px-3 py-2 text-xs font-bold outline-none bg-slate-50 dark:bg-slate-900 border border-slate-150 rounded-xl focus:border-brand-blue-500 text-slate-950 dark:text-white"
                      value={formInputs.licenseType}
                      onChange={(e) => setFormInputs({ ...formInputs, licenseType: e.target.value })}
                    >
                      <option value="خفيف">درجة أولى - عمومي خفيف (ملاكي/بيك أب)</option>
                      <option value="ثقيل">درجة ثانية - نقل ثقيل (رأسي/قاطرة ومقطورة)</option>
                      <option value="عمومي">درجة ثالثة - عمومي ركاب وباصات</option>
                      <option value="إنشائي">درجة رابعة - معدات هندسية وإنشائية</option>
                    </select>
                  </div>

                  {/* License Expiry */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-650 dark:text-slate-350">
                      تاريخ انتهاء الرخصة:<span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2 text-xs font-bold outline-none bg-slate-50 dark:bg-slate-900 border border-slate-150 rounded-xl focus:border-brand-blue-500 text-slate-950 dark:text-white"
                      value={formInputs.licenseExpiry}
                      onChange={(e) => setFormInputs({ ...formInputs, licenseExpiry: e.target.value })}
                    />
                    {formErrors.licenseExpiry && (
                      <p className="text-[9.5px] text-rose-500 font-bold">{formErrors.licenseExpiry}</p>
                    )}
                  </div>

                  {/* Department */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-650 dark:text-slate-350">
                      القسم الفني والتشغيلي:
                    </label>
                    <select
                      className="w-full px-3 py-2 text-xs font-bold outline-none bg-slate-50 dark:bg-slate-900 border border-slate-150 rounded-xl focus:border-brand-blue-500 text-slate-950 dark:text-white"
                      value={formInputs.department}
                      onChange={(e) => setFormInputs({ ...formInputs, department: e.target.value })}
                    >
                      <option value="قسم الآليات">قسم الآليات العامة</option>
                      <option value="قسم الاستثمار">قسم الاستثمار والتشغيل</option>
                      <option value="قسم الشؤون الهندسية">شعبة المشروعات الهندسية</option>
                      <option value="قسم الطوارئ">شعبة الطوارئ والتدخل العاجل</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-650 dark:text-slate-350">
                      الحالة الميدانية التشغيلية:
                    </label>
                    <select
                      className="w-full px-3 py-2 text-xs font-bold outline-none bg-slate-50 dark:bg-slate-900 border border-slate-150 rounded-xl focus:border-brand-blue-500 text-slate-950 dark:text-white"
                      value={formInputs.status}
                      onChange={(e) => setFormInputs({ ...formInputs, status: e.target.value as any })}
                    >
                      <option value="active">جاهز ومستعد للعمل (نشط ميدانياً)</option>
                      <option value="suspended">موقوف مؤقتاً بالمنظومة</option>
                      <option value="vacation">في إجازة رسمية / مجدولة</option>
                    </select>
                  </div>

                  {/* Assigned Vehicle */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-slate-650 dark:text-slate-350">
                      ارتباط المركبة المخصصة حالياً:
                    </label>
                    <select
                      className="w-full px-3 py-2 text-xs font-bold outline-none bg-slate-50 dark:bg-slate-900 border border-slate-150 rounded-xl focus:border-brand-blue-500 text-slate-950 dark:text-white"
                      value={formInputs.assignedVehicleId}
                      onChange={(e) => setFormInputs({ ...formInputs, assignedVehicleId: e.target.value })}
                    >
                      <option value="">-- بدون مركبة (سائق شاغر) --</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.plateNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dispatcher fields - shown only if role includes dispatcher */}
                  {formInputs.driverRole !== 'driver' && (
                    <div className="sm:col-span-2 p-4 bg-purple-500/5 dark:bg-purple-950/25 rounded-2xl border border-dashed border-purple-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 animate-fadeIn text-right">
                      <div className="sm:col-span-2 text-[10.5px] font-black text-purple-800 dark:text-purple-400">
                        وثائق قرار التفويض بالحركة الصادرة:
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-650 dark:text-slate-350">
                          رقم قرار التفويض بالحركة:<span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-xs font-bold outline-none bg-white dark:bg-slate-900 border border-slate-200 rounded-xl focus:border-purple-500 text-slate-950 dark:text-white"
                          placeholder="AUTH-2026-0XX"
                          value={formInputs.movementAuthNumber}
                          onChange={(e) => setFormInputs({ ...formInputs, movementAuthNumber: e.target.value })}
                        />
                        {formErrors.movementAuthNumber && (
                          <p className="text-[9.5px] text-rose-500 font-bold">{formErrors.movementAuthNumber}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-650 dark:text-slate-350">
                          تاريخ انتهاء قرار التفويض:<span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 text-xs font-bold outline-none bg-white dark:bg-slate-900 border border-slate-200 rounded-xl focus:border-purple-500 text-slate-950 dark:text-white font-mono"
                          value={formInputs.movementAuthExpiry}
                          onChange={(e) => setFormInputs({ ...formInputs, movementAuthExpiry: e.target.value })}
                        />
                        {formErrors.movementAuthExpiry && (
                          <p className="text-[9.5px] text-rose-500 font-bold">{formErrors.movementAuthExpiry}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions Footer */}
                <div className="flex items-center justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-purple-500/15 flex items-center gap-1"
                  >
                    <Check size={14} />
                    <span>تأكيد الإجراء وحفظ السجل</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 text-white p-6 rounded-[2rem] border border-purple-900/40 shadow-xl relative overflow-hidden" dir="rtl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-right relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/15 border border-purple-500/20 rounded-full text-purple-300 text-[10px] font-black mb-1.5">
            <Sparkles size={11} className="animate-pulse text-purple-400" />
            <span>وحدة تفويض السائقين والحركة الميدانية 360</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-black text-white">
              قاعدة تسجيل وإدارة السائقين والمفوضين بالحركة
            </h2>
            <ContextualHelp 
              id="drivers"
              titleAr="إدارة السائقين والتفويضات"
              titleEn="Drivers & Authorizations Panel"
              explanationAr="بوابة تنظيمية تفصيلية لتوثيق رخص القيادة وتفويض المهام الميدانية ومراقبة سجل الحوادث والسلامة ومؤشرات قياس السلوك الفني للسائقين والمفوضين بالحركة."
              explanationEn="A complete tracking system logging driving license compliance, vehicle operational keys, accident histories, and automated safety/behavior radar diagrams."
              benefitsAr={[
                "مراقبة دقيقة لتواريخ انتهاء رخص القيادة وتفويضات الحركة.",
                "تقييم رقمي فوري لأداء السائقين والمفوضين ميدانياً.",
                "نظام رادار جرافي فني لتقييم كفاءة السياقة وتفادي المخاطر."
              ]}
              benefitsEn={[
                "Ensures absolute compliance of all physical driver license periods.",
                "Triggers behavioral scores dynamically from maintenance frequencies.",
                "Provides unique visual radar diagrams displaying technician-specific road capabilities."
              ]}
              tipsAr={[
                "استخدم المخطط البياني للرادار الدائري بالأسفل لمراجعة ورصد مهارة السياقة الوقائية لكل قائد شاحنة قبل إصدار تفويضات طويلة المدى."
              ]}
              tipsEn={[
                "Inspect the Behavior Radar diagram below prior to initiating high-importance operations."
              ]}
              language={language}
            />
          </div>
          <p className="text-xs text-purple-200/70 block pt-0.5 max-w-xl">
            {t('منظومة السيطرة الشاملة لتسجيل رخص القيادة وتفويضات الحركة الميدانية، ومراقبة فترات الصلاحية للأذونات ومؤشرات كفاءة السلوك المهني.')}
          </p>
        </div>

        {user.role !== 'viewer' && (
          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto relative z-10 border border-purple-500/30"
          >
            <Plus size={15} />
            <span>{t('إضافة موظف (سائق/مفوض)')}</span>
          </button>
        )}
      </div>

      {/* KPI Stats Widgets Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" dir="rtl">
        {/* KPI 1 - Total Registered (Sajeel/Employees) */}
        <div className="p-5 rounded-2xl border shadow-xs bg-purple-50/40 dark:bg-purple-950/15 border-purple-200/80 dark:border-purple-900 hover:border-purple-300/80 flex items-center justify-between group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="space-y-1.5 text-right">
            <p className="text-[11px] font-black tracking-wide uppercase text-purple-800 dark:text-purple-300">
              {language === 'ar' ? 'إجمالي السائقين والمفوضين' : 'Total Personnel Database'}
            </p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black leading-none tracking-tight font-sans text-purple-950 dark:text-purple-100">{totalDriversCount}</h3>
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[9px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 font-sans shrink-0 direction-ltr">
                <span>▲</span>
                <span>+1</span>
              </div>
            </div>
            <span className="text-[9.5px] text-purple-600 dark:text-purple-400/80 block font-bold">
              {language === 'ar' ? 'سجلات السائقين وتفويضات الحركة' : 'Drivers & dispatchers logs'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md hover:shadow-purple-500/15 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <IdCard size={22} className="drop-shadow-sm" />
          </div>
        </div>

        {/* KPI 2 - Approved Dispatchers */}
        <div className="p-5 rounded-2xl border shadow-xs bg-violet-50/40 dark:bg-violet-950/15 border-violet-200/80 dark:border-violet-900 hover:border-violet-300/80 flex items-center justify-between group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="space-y-1.5 text-right">
            <p className="text-[11px] font-black tracking-wide uppercase text-violet-800 dark:text-violet-300">
              {language === 'ar' ? 'المفوضون بالحركة المعتمدون' : 'Active Approved Dispatchers'}
            </p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black leading-none tracking-tight font-sans text-violet-950 dark:text-violet-100">{dispatchersCount}</h3>
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[9px] font-black bg-violet-500/10 text-violet-600 dark:text-violet-400 font-sans shrink-0 direction-ltr">
                <span>▲</span>
                <span>+2</span>
              </div>
            </div>
            <span className="text-[9.5px] text-violet-600 dark:text-violet-400/80 block font-bold">
              {language === 'ar' ? 'بأرقام قرارات تفويض صالحة' : 'With validated authority code'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center text-white shadow-md hover:shadow-violet-500/15 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <Award size={22} className="drop-shadow-sm" />
          </div>
        </div>

        {/* KPI 3 - Active Field Drivers */}
        <div className="p-5 rounded-2xl border shadow-xs bg-indigo-50/40 dark:bg-indigo-950/15 border-indigo-200/80 dark:border-indigo-900 hover:border-indigo-300/80 flex items-center justify-between group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="space-y-1.5 text-right">
            <p className="text-[11px] font-black tracking-wide uppercase text-indigo-800 dark:text-indigo-300">
              {language === 'ar' ? 'السائقون النشطون بالميدان' : 'Active Duty Field Drivers'}
            </p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black leading-none tracking-tight font-sans text-indigo-950 dark:text-indigo-100">{activeCount}</h3>
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[9px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-sans shrink-0 direction-ltr">
                <span>▲</span>
                <span>+4</span>
              </div>
            </div>
            <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400/80 block font-bold">
              {language === 'ar' ? 'جاهزون لتلقي أوامر التشغيل' : 'Ready for dispatch operations'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md hover:shadow-indigo-500/15 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <UserCheck size={22} className="drop-shadow-sm" />
          </div>
        </div>

        {/* KPI 4 - Expiries Warnings (Rox & Authorizations) */}
        <div className="p-5 rounded-2xl border shadow-xs bg-rose-50/40 dark:bg-rose-950/15 border-rose-200/80 dark:border-rose-900 hover:border-rose-300/80 flex items-center justify-between group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="space-y-1.5 text-right">
            <p className="text-[11px] font-black tracking-wide uppercase text-rose-800 dark:text-rose-300">
              {language === 'ar' ? 'رخص وتفويضات حرجة / منتهية' : 'Critical / Expired Licenses'}
            </p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black leading-none tracking-tight font-sans text-rose-950 dark:text-rose-100">{criticalLicensesCount}</h3>
              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[9px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 font-sans shrink-0 direction-ltr">
                <span>▲</span>
                <span>+12</span>
              </div>
            </div>
            <span className="text-[9.5px] text-rose-600 dark:text-rose-400/80 block font-bold">
              {language === 'ar' ? 'تنتهي خلال 90 يوم أو منتهية فعلياً ⚠️' : 'Expires under 90 days or expired ⚠️'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-orange-500 flex items-center justify-center text-white shadow-md hover:shadow-rose-500/15 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <AlertTriangle size={22} className="drop-shadow-sm" />
          </div>
        </div>
      </div>

      {/* Advanced Filters Block */}
      <div className="bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-100 dark:border-slate-800/80 p-4 space-y-4" dir="rtl">
        {/* Role Quick Filtering Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 ml-2">الدور والصفة:</span>
          <div className="flex flex-wrap gap-1.5 bg-slate-100/60 dark:bg-slate-900 p-1 rounded-2xl">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all cursor-pointer ${
                roleFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              الكل ({drivers.length})
            </button>
            <button
              onClick={() => setRoleFilter('driver')}
              className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all cursor-pointer ${
                roleFilter === 'driver'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              السائقين ({drivers.filter(d => !d.driverRole || d.driverRole === 'driver' || d.driverRole === 'both').length})
            </button>
            <button
              onClick={() => setRoleFilter('dispatcher')}
              className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all cursor-pointer ${
                roleFilter === 'dispatcher'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              المفوضين بالحركة ({drivers.filter(d => d.driverRole === 'dispatcher' || d.driverRole === 'both').length})
            </button>
            <button
              onClick={() => setRoleFilter('both')}
              className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all cursor-pointer ${
                roleFilter === 'both'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              الجمع بين الدورين ({drivers.filter(d => d.driverRole === 'both').length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search box (Col: 6) */}
          <div className="md:col-span-6 relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              className="w-full pr-10 pl-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 hover:border-slate-200 focus:border-purple-500 rounded-2xl text-xs font-bold outline-none text-slate-800 dark:text-white transition-all placeholder-slate-400"
              placeholder="ابحث باسم الموظف، رقم الهوية، رقم الرخصة القيادية أو رقم الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter Dropdown (Col: 3) */}
          <div className="md:col-span-3 flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 px-3 py-1 bg-transparent">
            <Filter size={13} className="text-slate-400 shrink-0" />
            <span className="text-[10px] font-black text-slate-400 shrink-0">الحالة الميدانية:</span>
            <select
              className="w-full bg-transparent border-none outline-none font-bold text-xs text-slate-700 dark:text-slate-300 py-1.5 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">كل الحالات الميدانية</option>
              <option value="active">نشط ميدانياً (جاهز)</option>
              <option value="suspended">موقوف/مستبعد بالمنظومة</option>
              <option value="vacation">في إجازة رسمية</option>
            </select>
          </div>

          {/* License Filter (Col: 3) */}
          <div className="md:col-span-3 flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 px-3 py-1 bg-transparent">
            <IdCard size={13} className="text-slate-400 shrink-0" />
            <span className="text-[10px] font-black text-slate-400 shrink-0">فئة الرخصة القيادية:</span>
            <select
              className="w-full bg-transparent border-none outline-none font-bold text-xs text-slate-700 dark:text-slate-300 py-1.5 cursor-pointer"
              value={licenseFilter}
              onChange={(e) => setLicenseFilter(e.target.value)}
            >
              <option value="all">كل فئات رخص القيادة</option>
              <option value="خفيف">درجة أولى (خفيف)</option>
              <option value="ثقيل">درجة ثانية (نقل ثقيل/أكتروس)</option>
              <option value="عمومي">درجة ثالثة (باصات وركاب)</option>
              <option value="إنشائي">درجة رابعة (معدات هندسية)</option>
            </select>
          </div>
        </div>

        {searchTerm || statusFilter !== 'all' || licenseFilter !== 'all' || roleFilter !== 'all' ? (
          <div className="mt-3 text-[10.5px] font-bold text-slate-400 flex items-center justify-between px-1">
            <span>
              عثرنا على <span className="text-purple-600 dark:text-purple-400 font-sans">{filteredDrivers.length}</span> نتيجة تطابق فلاتر البحث الحالية من إجمالي {totalDriversCount} موظف.
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setLicenseFilter('all');
                setRoleFilter('all');
              }}
              className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <RefreshCw size={10} />
              <span>إعادة تهيئة الفلاتر</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Main Drivers List / Grid View */}
      {filteredDrivers.length === 0 ? (
        <div className="bg-white dark:bg-[#0f1422] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-12 text-center space-y-3" dir="rtl">
          <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-450 mx-auto shadow-inner border border-slate-100 dark:border-slate-800">
            <UserX size={26} className="text-slate-350" />
          </div>
          <h4 className="text-xs font-black text-slate-700 dark:text-slate-200">
            عذراً، لم نعثر على أي سائقين يطابقون محددات الاستعلام الخاصة بك.
          </h4>
          <p className="text-[10px] text-slate-400 max-w-md mx-auto">
            يرجى تعديل مصطلح البحث أو اختيار فئة ترخيص بديلة، أو قم بإضافة وتوثيق سجل سائق جديد بالضغط على الزر العلوي.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" dir="rtl">
          {filteredDrivers.map(driver => {
            const linkedVehicle = vehicles.find(v => v.id === driver.assignedVehicleId);
            const licStatus = getLicenseStatus(driver.licenseExpiry);
            const licDaysLabel = getLicenseRemainingLabel(driver.licenseExpiry);

            const roleVal = driver.driverRole || 'driver';
            const authStatus = roleVal !== 'driver' ? getAuthStatus(driver.movementAuthExpiry) : 'valid';
            const authLabel = roleVal !== 'driver' ? getAuthRemainingLabel(driver.movementAuthExpiry) : '';

            // Set background color for license state indicator
            let licBadgeColor = 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 border-purple-200/50';
            let licExpiryBar = 'bg-purple-500';
            if (licStatus === 'expired') {
              licBadgeColor = 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-200/50 animate-pulse';
              licExpiryBar = 'bg-rose-500';
            } else if (licStatus === 'critical') {
              licBadgeColor = 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200/50';
              licExpiryBar = 'bg-amber-500';
            }

            // Driver status styling
            let statusBadge = (
              <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                <span>{language === 'ar' ? 'نشط ومستعد' : 'Active Duty'}</span>
              </span>
            );
            if (driver.status === 'suspended') {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span>{language === 'ar' ? 'موقوف مؤقتاً' : 'Suspended'}</span>
                </span>
              );
            } else if (driver.status === 'vacation') {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{language === 'ar' ? 'في إجازة' : 'On Leave'}</span>
                </span>
              );
            }

            let driverColorStripe = 'border-r-[6px] border-r-purple-500 hover:border-r-purple-600';
            if (driver.status === 'suspended') {
              driverColorStripe = 'border-r-[6px] border-r-rose-500 hover:border-r-rose-600';
            } else if (driver.status === 'vacation') {
              driverColorStripe = 'border-r-[6px] border-r-amber-500 hover:border-r-amber-600';
            }

            // Role Badge styling
            let roleBadge = (
              <span className="px-2 py-0.5 rounded-lg text-[8px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-700">
                سائق
              </span>
            );
            if (roleVal === 'dispatcher') {
              roleBadge = (
                <span className="px-2 py-0.5 rounded-lg text-[8px] font-black bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  مفوض حركة
                </span>
              );
            } else if (roleVal === 'both') {
              roleBadge = (
                <span className="px-2 py-0.5 rounded-lg text-[8px] font-black bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  سائق ومفوض
                </span>
              );
            }

            // --- GRID VIEW LAYOUT BRANCH ---
            return (
              <div 
                key={driver.id}
                onClick={() => setSelectedDetailDriver(driver)}
                className={`bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-150/60 dark:border-slate-800/80 p-4 shadow-xs hover:shadow-md transition-all duration-300 hover:border-purple-500/30 dark:hover:border-purple-500/30 relative overflow-hidden flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 ${driverColorStripe}`}
              >
                {/* Horizontal status line at top */}
                <div className={`absolute top-0 right-0 left-0 h-1 md:h-1.5 ${licExpiryBar}`} />

                <div className="space-y-3">
                  {/* Top card info: Avatar + Name + Core badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-11 h-11 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 dark:bg-[#151c2e] dark:border-slate-850 shrink-0 shadow-xs">
                        <img 
                          src={driver.avatar} 
                          alt={driver.name} 
                          className="w-full h-full object-cover scale-[1.05]"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <div className="text-right min-w-0">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {driver.name}
                        </h4>
                        <div className="text-[10px] text-slate-450 dark:text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                          <Building2 size={10} className="text-slate-405 shrink-0" />
                          <span className="truncate">{driver.department}</span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {roleBadge}
                    </div>
                  </div>

                  {/* Simplified Info Badges Grid */}
                  <div className="grid grid-cols-2 gap-1.5 text-right pt-2 border-t border-slate-50 dark:border-slate-850/60">
                    <div className="bg-slate-50/70 dark:bg-slate-900/60 p-1.5 px-2 rounded-xl border border-slate-100/50 dark:border-slate-850">
                      <span className="text-[8px] text-slate-400 block leading-tight font-bold font-sans">الحالة الميدانية:</span>
                      <div className="mt-0.5 truncate scale-[0.9] origin-right">
                        {statusBadge}
                      </div>
                    </div>
                    <div className="bg-slate-50/70 dark:bg-slate-900/60 p-1.5 px-2 rounded-xl border border-slate-100/50 dark:border-slate-850">
                      <span className="text-[8px] text-slate-400 block leading-tight font-bold font-sans">فئة رخصة القيادة:</span>
                      <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded border text-[8px] font-black truncate max-w-full ${getLicenseTypeColor(driver.licenseType)}`}>
                        {driver.licenseType}
                      </span>
                    </div>
                  </div>

                  {/* Dispatcher authorization document segment if applicable */}
                  {roleVal !== 'driver' && (
                    <div className="bg-purple-500/5 dark:bg-purple-950/20 p-2 rounded-xl border border-purple-500/10 space-y-1 text-right">
                      <div className="flex items-center justify-between text-[8px] font-black text-purple-800 dark:text-purple-400">
                        <span className="flex items-center gap-0.5">
                          <Award size={10} />
                          <span>قرار تفويض الحركة:</span>
                        </span>
                        <span className="font-mono">{driver.movementAuthNumber || 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[8px] text-slate-400">
                        <span>تاريخ الصلاحية:</span>
                        <span className={`font-black ${
                          authStatus === 'expired' ? 'text-rose-500' : authStatus === 'critical' ? 'text-amber-500' : 'text-purple-600'
                        }`}>{authLabel}</span>
                      </div>
                    </div>
                  )}

                  {/* Connected Vehicle Row */}
                  <div className="flex items-center justify-between text-right bg-slate-50/40 dark:bg-slate-900/30 p-2 rounded-xl border border-dotted border-slate-200/60 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 font-bold">الآلية المخصصة:</span>
                    {linkedVehicle ? (
                      <span className="text-[9.5px] font-black text-slate-700 dark:text-slate-200 flex items-center gap-1 truncate max-w-[130px]">
                        <Truck size={10} className="text-purple-600 shrink-0" />
                        <span className="truncate">{linkedVehicle.name}</span>
                      </span>
                    ) : (
                      <span className="text-[9px] text-amber-600 font-black flex items-center gap-1.5">
                        <AlertTriangle size={10} className="text-amber-500" />
                        <span>بدون مركبة حالياً</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer interact hint & Admin tools */}
                <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-850/40 pt-2.5 mt-3 self-end w-full">
                  <span className="text-[9px] text-purple-600 dark:text-purple-400 font-black group-hover:underline flex items-center gap-1 select-none">
                    <span>عرض التفاصيل والتقارير 🔍</span>
                  </span>

                  {user.role !== 'viewer' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(driver);
                        }}
                        className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-350 hover:text-purple-600 dark:hover:text-purple-400 text-[9px] font-black rounded-lg transition-all flex items-center gap-0.5 cursor-pointer border border-slate-150/50 dark:border-slate-800"
                        title="تعديل سجل الموظف"
                      >
                        <Edit size={10} />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDriver(driver.id, driver.name);
                        }}
                        className="p-1 px-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/15 text-rose-500 hover:text-rose-600 text-[9px] font-black rounded-lg transition-all flex items-center gap-0.5 cursor-pointer border border-rose-100/50 dark:border-rose-950/30"
                        title="حذف السجل نهائياً"
                      >
                        <Trash2 size={10} />
                        <span>حذف</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 360-degree Driver Detail and Radar Chart Modal */}
      <AnimatePresence>
        {selectedDetailDriver && (() => {
          const metrics = getDriverMetrics(selectedDetailDriver.id, selectedDetailDriver.name);
          const licStatus = getLicenseStatus(selectedDetailDriver.licenseExpiry);
          const linkedVehicle = vehicles.find(v => v.id === selectedDetailDriver.assignedVehicleId);
          const licDaysLabel = getLicenseRemainingLabel(selectedDetailDriver.licenseExpiry);
          
          // Safety grade description based on metrics
          let safetyGrade = 'امتياز (A+)';
          if (metrics.accidents > 1) {
            safetyGrade = 'ضعيف (C-)';
          } else if (metrics.accidents === 1) {
            safetyGrade = 'مقبول (B)';
          } else if (metrics.maintenanceIncidents > 2) {
            safetyGrade = 'جيد (B+)';
          } else if (metrics.maintenanceIncidents > 0) {
            safetyGrade = 'جيد جداً (A)';
          }

          let licBadgeColor = 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 border-purple-200/50';
          if (licStatus === 'expired') {
            licBadgeColor = 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-200/50 animate-pulse';
          } else if (licStatus === 'critical') {
            licBadgeColor = 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200/50';
          }

          return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-start justify-center p-3 sm:p-4 overflow-y-auto" dir={dir}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white dark:bg-[#0f1422] rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-slate-850 p-5 sm:p-8 w-full max-w-4xl shadow-2xl relative overflow-hidden my-4 md:my-8"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedDetailDriver(null)}
                  className="absolute top-5 left-5 p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-805 text-slate-500 rounded-full cursor-pointer transition-all z-10"
                >
                  <X size={16} />
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6 text-right">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-inner flex-shrink-0">
                      <img src={selectedDetailDriver.avatar} alt={selectedDetailDriver.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                          {selectedDetailDriver.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                          selectedDetailDriver.status === 'active' 
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                            : selectedDetailDriver.status === 'vacation'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {selectedDetailDriver.status === 'active' 
                            ? (language === 'ar' ? 'نشط ميدانياً' : 'Active Duty') 
                            : selectedDetailDriver.status === 'vacation'
                            ? (language === 'ar' ? 'في إجازة رسمية' : 'On Leave')
                            : (language === 'ar' ? 'موقوف إدارياً' : 'Suspended')}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-450 dark:text-slate-400 font-bold mt-1">
                        {language === 'ar' ? 'القسم التشغيلي: ' : 'Department: '} {selectedDetailDriver.department}
                      </p>
                    </div>
                  </div>

                  <div className="text-right md:text-left flex flex-col md:items-end gap-1.5 self-start md:self-auto">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold font-sans">
                      {language === 'ar' ? 'الهوية والترخيص الرقمي' : 'Digital License & Identity'}
                    </span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 font-mono">
                      ID: {selectedDetailDriver.identityNumber} | Lic: {selectedDetailDriver.licenseNumber}
                    </span>
                  </div>
                </div>

                {/* Subtitle */}
                <div className="mb-6 flex items-center gap-1.5 justify-start text-purple-600 dark:text-purple-400">
                  <Award size={16} />
                  <span className="text-xs font-black uppercase tracking-wider">
                    {language === 'ar' ? 'التقرير السلوكي والتحليلي 360 للأخلاقيات المرورية والأعطال' : '360 Traffic Behavior & Incident Analytics Portal'}
                  </span>
                </div>

                {/* Two-Column Matrix Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: KPI Highlights (5 out of 12) */}
                  <div className="lg:col-span-5 space-y-4">
                    
                    {/* Grade & General Assessment */}
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-[#111827] dark:to-[#171029] p-4 rounded-[1.8rem] border border-purple-100/40 dark:border-purple-950/60 flex items-center justify-between text-right">
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider block">
                          {language === 'ar' ? 'تصنيف السلامة والمهارة الميداني' : 'Overall Safety Score'}
                        </span>
                        <h4 className="text-base font-black text-purple-950 dark:text-white leading-tight">
                          {language === 'ar' ? `السلوك العام: ${safetyGrade}` : `Overall Behavior: ${safetyGrade}`}
                        </h4>
                        <p className="text-[9px] text-purple-700/80 dark:text-purple-400/80">
                          {language === 'ar' ? 'يتم احتساب التصنيف تلقائياً بناءً على الحوادث والأعطال ومعدلات السرعة.' : 'Calculated automatically based on telematics telemetry, speeding logs, and repairs.'}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-purple-500/20">
                        {safetyGrade.includes('امتياز') || safetyGrade.includes('A') ? 'A' : safetyGrade.includes('B') ? 'B' : 'C'}
                      </div>
                    </div>

                    {/* Stats Cards Row */}
                    <div className="grid grid-cols-2 gap-3 text-right">
                      {/* Trips Completed */}
                      <div className="bg-slate-50 dark:bg-[#121829] p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-bold">
                          {language === 'ar' ? 'الرحلات المكتملة' : 'Trips Completed'}
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-black font-mono text-slate-800 dark:text-white">{metrics.totalTrips}</span>
                          <span className="text-[9px] text-slate-455 font-bold">{language === 'ar' ? 'مهمة' : 'Missions'}</span>
                        </div>
                        <span className="text-[8.5px] text-slate-455 block mt-1">
                          {language === 'ar' ? 'منذ الالتحاق بالأسطول' : 'Since joining'}
                        </span>
                      </div>

                      {/* License Validity */}
                      <div className="bg-slate-50 dark:bg-[#121829] p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 block font-bold">
                          {language === 'ar' ? 'صلاحية رخصة القيادة' : 'License Status'}
                        </span>
                        <div className="flex items-baseline gap-1 mt-1 font-sans">
                          <span className={`text-[11px] font-black truncate leading-none ${
                            licStatus === 'expired' ? 'text-rose-500' : licStatus === 'critical' ? 'text-amber-500' : 'text-purple-500'
                          }`}>
                            {licStatus === 'expired' 
                              ? (language === 'ar' ? 'منتهية الصلاحية ⛔' : 'Expired ⛔') 
                              : licStatus === 'critical' 
                              ? (language === 'ar' ? 'حرجة (قرب انتهاء)' : 'Critical Expiry') 
                              : (language === 'ar' ? 'صالحة وسارية 👍' : 'Valid & Active')}
                          </span>
                        </div>
                        <span className="text-[8.5px] text-slate-455 block mt-1 font-mono">
                          {selectedDetailDriver.licenseExpiry}
                        </span>
                      </div>
                    </div>

                    {/* Documents & Personal Details */}
                    <div className="bg-slate-50 dark:bg-[#121829] p-4 rounded-3xl border border-slate-100 dark:border-slate-800 text-right space-y-3">
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-wider block">
                        {language === 'ar' ? 'الوثائق الثبوتية وبيانات الاتصال 📋' : 'Identity Documents & Contact Info 📋'}
                      </span>
                      
                      <div className="grid grid-cols-2 gap-3 text-right">
                        <div>
                          <span className="text-[8px] text-slate-400 block font-bold">رقم الجوال:</span>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 font-mono select-all">
                            {selectedDetailDriver.phone}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-400 block font-bold font-sans">رقم الهوية الوطنية:</span>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 font-mono select-all">
                            {selectedDetailDriver.identityNumber}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800/60 grid grid-cols-2 gap-3 text-right">
                        <div>
                          <span className="text-[8px] text-slate-400 block font-bold">رقم رخصة القيادة:</span>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 font-mono select-all">
                            {selectedDetailDriver.licenseNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-400 block font-bold font-sans">رخصة القيادة:</span>
                          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded border text-[9px] font-black ${getLicenseTypeColor(selectedDetailDriver.licenseType)}`}>
                            {language === 'ar' ? `رخصة ${selectedDetailDriver.licenseType}` : `Lic: ${selectedDetailDriver.licenseType}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dispatcher Authorization Details if registered as dispatcher */}
                    {selectedDetailDriver.driverRole && selectedDetailDriver.driverRole !== 'driver' && (
                      <div className="bg-purple-500/5 dark:bg-purple-950/10 p-4 rounded-3xl border border-purple-500/10 text-right space-y-2.5">
                        <span className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-wider block">
                          {language === 'ar' ? 'وثيقة قرار التفويض بالحركة المعتمدة 📄' : 'Movement Authorization Key 📄'}
                        </span>
                        <div className="flex items-center justify-between gap-2 p-2.5 px-3 bg-purple-500/10 dark:bg-purple-950/20 rounded-xl border border-purple-500/20">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-purple-600 text-white rounded-lg">
                              <Award size={12} />
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-black text-slate-800 dark:text-white block leading-none">
                                {selectedDetailDriver.movementAuthNumber || 'غير محدد'}
                              </span>
                              <span className="text-[9px] text-purple-600 dark:text-purple-400 block mt-1 leading-none font-bold">
                                {getAuthRemainingLabel(selectedDetailDriver.movementAuthExpiry)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Operational Vehicle Assignment */}
                    <div className="bg-slate-50 dark:bg-[#121829] p-4 rounded-3xl border border-slate-100 dark:border-slate-800 text-right space-y-2.5">
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-wider block">
                        {language === 'ar' ? 'المركبة التشغيلية المعينة 🚛' : 'Assigned Fleet Vehicle 🚛'}
                      </span>

                      {linkedVehicle ? (
                        <div className="flex items-center justify-between gap-2 p-2 px-3 bg-purple-500/5 dark:bg-purple-950/20 rounded-xl border border-purple-100/50 dark:border-purple-950">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-purple-600 text-white rounded-lg">
                              <Truck size={12} />
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-black text-slate-800 dark:text-white block leading-none">
                                {linkedVehicle.name}
                              </span>
                              <span className="text-[9px] text-slate-455 font-mono block mt-1 leading-none">
                                لوحة: {linkedVehicle.plateNumber} | {linkedVehicle.type}
                              </span>
                            </div>
                          </div>

                          {user.role !== 'viewer' && (
                            <button
                              type="button"
                              onClick={() => {
                                handleUnlinkVehicle(selectedDetailDriver.id, linkedVehicle.id);
                              }}
                              className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-500 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 rounded-lg text-[9px] font-black cursor-pointer transition-all"
                              title="فك ارتباط السائق بالمركبة"
                            >
                              {language === 'ar' ? 'فك الارتباط' : 'Unlink'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-500/5 rounded-xl border border-dashed border-amber-200/50 dark:border-amber-955/20 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                            <AlertTriangle size={12} />
                            <span>{language === 'ar' ? 'لا يوجد مركبة مخصصة حالياً بالسجل' : 'No operational vehicle linked'}</span>
                          </div>
                          {user.role !== 'viewer' && (
                            <button
                              onClick={() => {
                                setSelectedDetailDriver(null);
                                handleOpenEdit(selectedDetailDriver);
                              }}
                              className="text-[9.5px] text-purple-600 hover:underline font-black cursor-pointer"
                            >
                              {language === 'ar' ? 'تعيين المركبة ➕' : 'Assign ➕'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Col - Analytics & Behavior (Span 7) */}
                  <div className="lg:col-span-7 space-y-4 text-right">

                    {/* Accidents Highlight Card (Accident History Rate) */}
                    <div className={`p-4 rounded-3xl border ${
                      metrics.accidents === 0 
                        ? 'bg-emerald-500/5 border-emerald-100/50 dark:border-emerald-950 text-right' 
                        : metrics.accidents === 1
                        ? 'bg-amber-500/5 border-amber-100/50 dark:border-amber-950 text-right'
                        : 'bg-rose-500/5 border-rose-100/50 dark:border-rose-950 text-right animate-pulse'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                          {language === 'ar' ? 'تاريخ الحوادث المرورية' : 'Accident History Record'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-black ${
                          metrics.accidents === 0 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : metrics.accidents === 1
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {metrics.accidents === 0 ? (language === 'ar' ? 'سجل آمن نظيف' : 'Zero Incidents') : (language === 'ar' ? 'مسجل قيد المتابعة' : 'Logged')}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-black font-mono">{metrics.accidents}</span>
                        <span className="text-[10px] text-slate-550 dark:text-slate-400 font-black">
                          {language === 'ar' ? 'حوادث مرورية مسجلة بالمرور' : 'Accidents registered'}
                        </span>
                      </div>

                      <div className="mt-2 text-[9px] text-slate-450 dark:text-slate-400">
                        {metrics.accidents === 0 ? (
                          <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                            ✔ {language === 'ar' ? 'السائق يمتلك سجل قيادة مثالي خالي تماماً من أي بلاغات حوادث مرورية تشغيلية.' : 'Excellent safe-driving habits. No road safety accidents standardly recorded.'}
                          </p>
                        ) : metrics.accidents === 1 ? (
                          <p className="text-amber-600 dark:text-amber-400 font-bold">
                            ⚠ {language === 'ar' ? 'تنبيه: يوجد حادث مروري مسجل بالسابق. يرجى توجيه السائق لتجنب الأخطاء الميدانية.' : 'Notice: 1 historic accident recorded. Safety training recommended.'}
                          </p>
                        ) : (
                          <p className="text-rose-600 dark:text-rose-450 font-black font-bold">
                            🚨 {language === 'ar' ? 'تحذير: السائق يمتلك معدل حوادث حرج يتجاوز الحد المسموح به للشركة. يخضع لتقييم اللجنة الأمنية.' : 'Alert: Critical accident history. Exceeds standard safety boundaries.'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Visual 360 Behavioral Radar Chart */}
                    <div className="bg-slate-50 dark:bg-[#121829] p-4 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-3">

                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-wider block text-right">
                        {language === 'ar' ? 'مخطط رادار المهارة والسلوك الميداني 📊' : 'Behavioral & Telematics Skill Radar 📊'}
                      </span>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metrics.radarData.map(item => ({
                            subject: language === 'ar' ? item.subject : item.subjectEn,
                            score: item.score,
                            fullMark: 100
                          }))}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
                            <Radar 
                              name={language === 'ar' ? 'كفاءة قيادة السائق' : 'Driver Telemetry Rating'} 
                              dataKey="score" 
                              stroke="#a855f7" 
                              fill="#c084fc" 
                              fillOpacity={0.25} 
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Radar details description / Summary Footer */}
                    <div className="bg-white dark:bg-[#0f1422] p-3 rounded-2xl border border-slate-100 dark:border-slate-805 text-right space-y-2">
                      <h5 className="text-[10px] font-black text-purple-600 dark:text-purple-400 flex items-center gap-1.5 justify-start">
                        <ShieldAlert size={12} className="text-purple-500" />
                        <span>{language === 'ar' ? 'توصيات وملاحظات المراقب الفني للرحلات' : 'Operational Officer Recommendations'}</span>
                      </h5>
                      <p className="text-[9.5px] text-slate-655 dark:text-slate-400 leading-relaxed text-right">
                        {metrics.accidents === 0 && metrics.maintenanceIncidents === 0 ? (
                          language === 'ar' 
                            ? 'سائق متميز وملتزم للغاية بمعايير الحماية البيئية وصحة المحركات. يوصى بإدراجه في قائمه المكافآت ربع السنوية وتعيينه مرشداً تدريبياً للسائقين الجدد.' 
                            : 'Top fleet asset with remarkable safety culture and machine durability standards. Recommend for the quarterly performance bonus.'
                        ) : metrics.accidents > 1 ? (
                          language === 'ar' 
                            ? 'نظراً لتكرار الحوادث والمخالفات، يرجى سحب تصريح قيادة المركبات الثقيلة لديه فوراً وإدراجه في دورة تدريبية مكثفة بالتعاون مع هيئة المرور.' 
                            : 'Given critical incident metrics, temporarily restrict from heavy trucks operations and schedule mandatory road safety reassessment.'
                        ) : (
                          language === 'ar' 
                            ? 'أداء السائق متوسط وضمن نطاق العمل الطبيعي. لوحظ بعض التراجع الخفيف في كفاءة وقود الرحلة نتيجة توقف المحرك المفرط بالخمول. نوصي بتحديث توجيهات الحركة.' 
                            : 'Performance is well within acceptable margins. Minor fuel economy issues logged due to idle engine states. Retraining on start-stop policies suggested.'
                        )}
                      </p>
                    </div>

                  </div>

                </div>

                {/* Modal actions footer */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-5 mt-6 flex flex-wrap justify-between items-center gap-3 text-right">
                  {/* Left items: direct admin controls inside modal */}
                  {user.role !== 'viewer' ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const driverToEdit = selectedDetailDriver;
                          setSelectedDetailDriver(null);
                          handleOpenEdit(driverToEdit);
                        }}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
                        title="تعديل سجل هذا السائق"
                      >
                        <Edit size={12} />
                        <span>{language === 'ar' ? 'تعديل السجل ✏️' : 'Edit File ✏️'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const driverToDelete = selectedDetailDriver;
                          setSelectedDetailDriver(null);
                          handleDeleteDriver(driverToDelete.id, driverToDelete.name);
                        }}
                        className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
                        title="حذف السائق نهائياً"
                      >
                        <Trash2 size={12} />
                        <span>{language === 'ar' ? 'حذف السجل 🗑️' : 'Delete File 🗑️'}</span>
                      </button>
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Right items: exporting & active exits */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isExporting}
                      onClick={() => {
                        setIsExporting(true);
                        setTimeout(() => {
                          setIsExporting(false);
                          const downloadMsg = language === 'ar' ? 'تم تحميل ملف التقرير الفني القيادي القياسي بنجاح!' : 'Technical driver evaluation summary document ready for download!';
                          const notifyDiv = document.createElement('div');
                          notifyDiv.className = "fixed bottom-5 right-5 z-[100] bg-purple-600 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-2 animate-bounce border border-purple-500 text-xs font-black dir-rtl";
                          notifyDiv.innerHTML = `<span>✔ ${downloadMsg}</span>`;
                          document.body.appendChild(notifyDiv);
                          setTimeout(() => notifyDiv.remove(), 4000);
                        }, 1500);
                      }}
                      className="px-4 py-2.5 bg-indigo-55 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-slate-900 dark:text-indigo-400 dark:hover:bg-slate-800 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Award size={13} className={isExporting ? "animate-spin" : ""} />
                      <span>{isExporting ? (language === 'ar' ? 'جاري تحضير PDF...' : 'Compiling PDF...') : (language === 'ar' ? 'تصدير التقرير الميداني PDF 💾' : 'Export Profile as PDF 💾')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDetailDriver(null)}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950 hover:opacity-90 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                    >
                      {language === 'ar' ? 'إغلاق نافذة المراقبة' : 'Exit Analytics Window'}
                    </button>
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
