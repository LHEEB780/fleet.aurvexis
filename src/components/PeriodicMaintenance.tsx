import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Truck, 
  Settings, 
  Trash2, 
  Edit, 
  RefreshCw, 
  Bell, 
  Check, 
  X, 
  FileText, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Wrench,
  DollarSign,
  SlidersHorizontal,
  ArrowUpDown,
  Package,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle, InventoryItem, User } from '../types';
import { vehicles as staticVehicles, inventory as staticInventory } from '../data';
import { useLanguage } from '../services/LanguageContext';
import ContextualHelp from './ContextualHelp';

export interface PeriodicSchedule {
  id: string;
  vehicleId: string;
  title: string;
  type: 'time' | 'mileage' | 'both';
  intervalDays?: number;
  intervalMileage?: number;
  lastDoneDate?: string;
  lastDoneMileage?: number;
  dueDate: string;
  dueMileage?: number;
  status: 'active' | 'due-soon' | 'overdue' | 'paused';
  notes?: string;
  category: 'mechanical' | 'electrical' | 'cooling' | 'hydraulic' | 'bodywork';
}

const INITIAL_SCHEDULES: PeriodicSchedule[] = [
  {
    id: 'p-1',
    vehicleId: '1',
    title: 'تغيير زيت المحرك وباقة الفلاتر الدورية',
    type: 'mileage',
    intervalMileage: 10000,
    lastDoneDate: '2026-03-20',
    lastDoneMileage: 40000,
    dueMileage: 50000,
    dueDate: '2026-06-20',
    status: 'active',
    category: 'mechanical',
    notes: 'استخدام زيت معتمد لزيادة مرونة المحرك وتقليل استهلاك الوقود.'
  },
  {
    id: 'p-2',
    vehicleId: '2',
    title: 'معايرة ميزان الإطارات وفحص عمق المداس للمحاور',
    type: 'time',
    intervalDays: 90,
    lastDoneDate: '2026-02-15',
    dueDate: '2026-05-15', // Overdue relative to current time 2026-05-23
    status: 'overdue',
    category: 'mechanical',
    notes: 'فحص ميكانيكي لسلامة الإطارات العشرة وتجنب التآكل المتسارع.'
  },
  {
    id: 'p-3',
    vehicleId: '3',
    title: 'فحص واختبار فعالية منظومة الفرامل والصيانة الوقائية لها',
    type: 'time',
    intervalDays: 90,
    lastDoneDate: '2026-02-28',
    dueDate: '2026-05-29', // Due soon (in 6 days)
    status: 'due-soon',
    category: 'hydraulic',
    notes: 'يتضمن تغيير قماشات الفرامل والتأكد من مستوى زيت الهيدروليك.'
  },
  {
    id: 'p-4',
    vehicleId: '4',
    title: 'تنظيف وغسيل فلاتر التكييف ومروحة التبريد المساعدة',
    type: 'both',
    intervalDays: 30,
    intervalMileage: 3000,
    lastDoneDate: '2026-05-01',
    lastDoneMileage: 15200,
    dueDate: '2026-05-31',
    dueMileage: 18200,
    status: 'active',
    category: 'cooling',
    notes: 'صيانة وقائية لضمان عمل رافعة الشغل دون توقف في فترات الصيف الحرجة.'
  }
];

export const getCatColorClass = (cat: string) => {
  switch (cat) {
    case 'mechanical': return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-120/40';
    case 'electrical': return 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border border-violet-120/40';
    case 'cooling': return 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-450 border border-sky-120/40';
    case 'hydraulic': return 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-120/40';
    case 'bodywork': return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-120/40';
    default: return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
  }
};

export const getCatLabel = (cat: string) => {
  switch (cat) {
    case 'mechanical': return '⚙️ ميكانيكا';
    case 'electrical': return '⚡ كهرباء';
    case 'cooling': return '❄️ تبريد';
    case 'hydraulic': return '💧 هيدروليك';
    case 'bodywork': return '🛠️ سمكرة';
    default: return 'عام';
  }
};

export default function PeriodicMaintenance({ user }: { user?: User }) {
  const { language } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('fleet_vehicles_v2');
    return saved ? JSON.parse(saved) : staticVehicles;
  });

  const [schedules, setSchedules] = useState<PeriodicSchedule[]>(() => {
    const saved = localStorage.getItem('fleet_periodic_schedules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading periodic schedules', e);
      }
    }
    return INITIAL_SCHEDULES;
  });

  // Inventory and Notifications State
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('fleet_inventory_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading inventory for notifications', e);
      }
    }
    return staticInventory;
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('notify_enabled_periodic') === 'true';
    }
    return false;
  });

  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [notificationToast, setNotificationToast] = useState<{message: string; type: 'success' | 'info' | 'warning'} | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning') => {
    setNotificationToast({ message, type });
    setTimeout(() => {
      setNotificationToast(null);
    }, 4500);
  };

  const triggerBrowserNotification = (title: string, body: string) => {
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          dir: 'rtl'
        });
      } catch (err) {
        console.warn('Native notification failed, falling back', err);
      }
    }
  };

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      localStorage.setItem('notify_enabled_periodic', 'false');
      showToast('تم إيقاف إشعارات المتصفح بنجاح', 'info');
    } else {
      if (!('Notification' in window)) {
        showToast('متصفحك الحالي لا يدعم إشعارات سطح المكتب المتقدمة', 'warning');
        return;
      }
      
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          localStorage.setItem('notify_enabled_periodic', 'true');
          showToast('🔔 تم تفعيل إشعارات المتصفح بنجاح!', 'success');
          
          try {
            new Notification('لوحة الصيانة الدورية الوقائية', {
              body: 'لقد قمت بتفعيل الإشعارات بنجاح. ستتلقى تنبيهات دورية عند استحقاق الفحوصات.',
              dir: 'rtl'
            });
          } catch (e) {
            console.log(e);
          }
        } else {
          showToast('تم رفض إذن الإشعارات من قبل المتصفح. يرجى تفعيله من شريط العنوان.', 'warning');
        }
      } catch (err) {
        console.error('Error requesting notification permission', err);
        // Fallback simulation
        setNotificationsEnabled(true);
        localStorage.setItem('notify_enabled_periodic', 'true');
        showToast('🔔 تم تفعيل الإشعارات بنجاح (وضع المحاكاة)', 'success');
      }
    }
  };

  // Sync inventory list on load / change
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('fleet_inventory_v2');
      if (saved) {
        try {
          setInventoryItems(JSON.parse(saved));
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Custom events inside application
    window.addEventListener('inventory-updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('inventory-updated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.tab === 'periodic-maintenance') {
        if (customEvent.detail.item) {
          setSearchTerm(customEvent.detail.item);
          setStatusFilter('all');
          setCategoryFilter('all');
          setVehicleFilter('all');
        } else if (customEvent.detail.overdueOnly) {
          setStatusFilter('overdue');
          setSearchTerm('');
          setCategoryFilter('all');
          setVehicleFilter('all');
        }
      }
    };
    window.addEventListener('notification-navigate', handleNavigate);
    return () => window.removeEventListener('notification-navigate', handleNavigate);
  }, []);

  // Notifications automatic trigger
  useEffect(() => {
    if (notificationsEnabled) {
      const overdueCount = schedules.filter(s => s.status === 'overdue').length;
      const lowStockCount = inventoryItems.filter(i => i.quantity <= i.minQuantity).length;
      
      if (overdueCount > 0 || lowStockCount > 0) {
        const title = '⚠️ تنبيهات حرجة في نظام الصيانة';
        const body = `لديك عدد ${overdueCount} صيانات متأخرة الموعد، وعدد ${lowStockCount} أصناف قطع غيار قاربت على النفاد من المستودع.`;
        triggerBrowserNotification(title, body);
      }
    }
  }, [schedules, inventoryItems, notificationsEnabled]);

  // Filters state
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(() => new Date(2026, 4, 1));
  const [selectedCalendarSchedule, setSelectedCalendarSchedule] = useState<PeriodicSchedule | null>(null);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<Date | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'due-soon' | 'overdue' | 'paused'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'mechanical' | 'electrical' | 'cooling' | 'hydraulic' | 'bodywork'>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'vehicleName' | 'category' | 'status'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Trigger State for Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  // Trigger State for completion modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeTarget, setCompleteTarget] = useState<PeriodicSchedule | null>(null);

  // Complete Form inputs
  const [completionData, setCompletionData] = useState({
    date: new Date().toISOString().split('T')[0],
    odometer: '',
    cost: '',
    workshopId: 'WS-1',
    notes: '',
    createWorkOrder: true
  });

  // Custom Form states for Add/Edit
  const [formData, setFormData] = useState({
    vehicleId: '1',
    title: '',
    type: 'time' as PeriodicSchedule['type'],
    intervalDays: 90,
    intervalMileage: 10000,
    lastDoneDate: new Date().toISOString().split('T')[0],
    lastDoneMileage: 50000,
    dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueMileage: 60000,
    category: 'mechanical' as PeriodicSchedule['category'],
    notes: ''
  });

  // Persist schedules automatically and notify on changes
  useEffect(() => {
    localStorage.setItem('fleet_periodic_schedules', JSON.stringify(schedules));
    window.dispatchEvent(new Event('schedules-updated'));
    window.dispatchEvent(new Event('storage'));
  }, [schedules]);

  // Recalculate status dynamically based on current date (2026-05-23)
  const systemDate = new Date('2026-05-23');

  const updatedSchedulesWithStatus = useMemo(() => {
    return schedules.map(sched => {
      if (sched.status === 'paused') return sched;

      const dueDateObj = new Date(sched.dueDate);
      const diffTime = dueDateObj.getTime() - systemDate.getTime();
      const diffDays = Math.ceil(diffTime / (1024 * 60 * 60 * 1000));

      let calculatedStatus: PeriodicSchedule['status'] = 'active';

      if (diffDays <= 0) {
        calculatedStatus = 'overdue';
      } else if (diffDays <= 7) {
        calculatedStatus = 'due-soon';
      }

      return {
        ...sched,
        status: calculatedStatus
      };
    });
  }, [schedules]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = updatedSchedulesWithStatus.length;
    const active = updatedSchedulesWithStatus.filter(s => s.status === 'active').length;
    const dueSoon = updatedSchedulesWithStatus.filter(s => s.status === 'due-soon').length;
    const overdue = updatedSchedulesWithStatus.filter(s => s.status === 'overdue').length;
    const paused = updatedSchedulesWithStatus.filter(s => s.status === 'paused').length;

    return { total, active, dueSoon, overdue, paused };
  }, [updatedSchedulesWithStatus]);

  // Active Alerts Memo (Maintenance reminders + low parts quantities)
  const activeSchedulesAlerts = useMemo(() => {
    return updatedSchedulesWithStatus.filter(s => {
      if (dismissedAlerts.includes(`sched-${s.id}`)) return false;
      return s.status === 'overdue' || s.status === 'due-soon';
    });
  }, [updatedSchedulesWithStatus, dismissedAlerts]);

  const activeInventoryAlerts = useMemo(() => {
    return inventoryItems.filter(i => {
      if (dismissedAlerts.includes(`inv-${i.id}`)) return false;
      return i.quantity <= i.minQuantity;
    });
  }, [inventoryItems, dismissedAlerts]);

  const hasAnyAlerts = activeSchedulesAlerts.length > 0 || activeInventoryAlerts.length > 0;

  // Search, Filter and Sort List with Advanced Options
  const filteredList = useMemo(() => {
    // 1. Filter elements
    const filtered = updatedSchedulesWithStatus.filter(sched => {
      // Find associated vehicle
      const vehicle = vehicles.find(v => v.id === sched.vehicleId);
      const vName = vehicle?.name || '';
      const vPlate = vehicle?.plateNumber || '';
      
      const textMatch = 
        sched.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vPlate.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = statusFilter === 'all' || sched.status === statusFilter;
      const catMatch = categoryFilter === 'all' || sched.category === categoryFilter;
      const vehicleMatch = vehicleFilter === 'all' || sched.vehicleId === vehicleFilter;

      return textMatch && statusMatch && catMatch && vehicleMatch;
    });

    // 2. Sort elements
    return [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'vehicleName') {
        const vehicleA = vehicles.find(v => v.id === a.vehicleId);
        const vehicleB = vehicles.find(v => v.id === b.vehicleId);
        const nameA = vehicleA?.name || '';
        const nameB = vehicleB?.name || '';
        comparison = nameA.localeCompare(nameB, 'ar', { sensitivity: 'base' });
      } else if (sortBy === 'category') {
        const specA = getCatLabel(a.category);
        const specB = getCatLabel(b.category);
        comparison = specA.localeCompare(specB, 'ar', { sensitivity: 'base' });
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else {
        // Default: dueDate (closest first)
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [updatedSchedulesWithStatus, searchTerm, statusFilter, categoryFilter, vehicleFilter, sortBy, sortOrder, vehicles]);

  // Open Vehicle Detail Sheets
  const triggerOpenVehicle = (vehicleId: string) => {
    // We send a decoupled routing custom event that is captured in AppLayout/Vehicles
    window.dispatchEvent(new CustomEvent('open-vehicle-history', { 
      detail: { vehicleId } 
    }));
  };

  // Submit Handler for Add/Edit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.vehicleId) return;

    if (isEditing && selectedScheduleId) {
      setSchedules(prev => prev.map(sched => {
        if (sched.id === selectedScheduleId) {
          return {
            ...sched,
            vehicleId: formData.vehicleId,
            title: formData.title,
            type: formData.type,
            intervalDays: formData.type !== 'mileage' ? Number(formData.intervalDays) : undefined,
            intervalMileage: formData.type !== 'time' ? Number(formData.intervalMileage) : undefined,
            lastDoneDate: formData.lastDoneDate,
            lastDoneMileage: Number(formData.lastDoneMileage) || undefined,
            dueDate: formData.dueDate,
            dueMileage: formData.dueMileage ? Number(formData.dueMileage) : undefined,
            category: formData.category,
            notes: formData.notes
          };
        }
        return sched;
      }));
    } else {
      const newSched: PeriodicSchedule = {
        id: 'p-' + Math.random().toString(36).substring(2, 9),
        vehicleId: formData.vehicleId,
        title: formData.title,
        type: formData.type,
        intervalDays: formData.type !== 'mileage' ? Number(formData.intervalDays) : undefined,
        intervalMileage: formData.type !== 'time' ? Number(formData.intervalMileage) : undefined,
        lastDoneDate: formData.lastDoneDate,
        lastDoneMileage: Number(formData.lastDoneMileage) || undefined,
        dueDate: formData.dueDate,
        dueMileage: formData.dueMileage ? Number(formData.dueMileage) : undefined,
        status: 'active',
        category: formData.category,
        notes: formData.notes
      };
      setSchedules(prev => [newSched, ...prev]);
    }

    // Reset fields and close modal
    setShowAddModal(false);
    setIsEditing(false);
    setSelectedScheduleId(null);
  };

  // Switch edit values from selected item
  const handleEditIntent = (sched: PeriodicSchedule) => {
    setSelectedScheduleId(sched.id);
    setIsEditing(true);
    setFormData({
      vehicleId: sched.vehicleId,
      title: sched.title,
      type: sched.type,
      intervalDays: sched.intervalDays || 90,
      intervalMileage: sched.intervalMileage || 10000,
      lastDoneDate: sched.lastDoneDate || new Date().toISOString().split('T')[0],
      lastDoneMileage: sched.lastDoneMileage || 0,
      dueDate: sched.dueDate,
      dueMileage: sched.dueMileage || 0,
      category: sched.category,
      notes: sched.notes || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف جدول هذا التذكير الدوري نهائياً؟')) {
      setSchedules(prev => prev.filter(s => s.id !== id));
    }
  };

  const handlePauseToggle = (id: string) => {
    setSchedules(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: s.status === 'paused' ? 'active' : 'paused'
        };
      }
      return s;
    }));
  };

  // Mark Completed - trigger action input popup
  const handleMarkCompletedIntent = (sched: PeriodicSchedule) => {
    const matchedVehicle = vehicles.find(v => v.id === sched.vehicleId);
    setCompleteTarget(sched);
    setCompletionData({
      date: new Date().toISOString().split('T')[0],
      odometer: matchedVehicle?.loadingCapacity ? '45000' : '50000', // Auto-filled guesses based on types
      cost: '250',
      workshopId: 'WS-1',
      notes: 'تم إنجاز الصيانة الدورية واختبار جودة الدفع بامتياز وكفاءة تشغيلية.',
      createWorkOrder: true
    });
    setShowCompleteModal(true);
  };

  // Submit Completion and calculate next maintenance cycle automatically
  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeTarget) return;

    const matchedVehicle = vehicles.find(v => v.id === completeTarget.vehicleId);

    // Calculate dates & mileage targets
    const nextDueDateObj = new Date(completionData.date);
    const setDayInterval = completeTarget.intervalDays || 90;
    nextDueDateObj.setDate(nextDueDateObj.getDate() + setDayInterval);
    const calculatedNextDueDate = nextDueDateObj.toISOString().split('T')[0];

    const currentOdo = Number(completionData.odometer) || completeTarget.lastDoneMileage || 50000;
    const mileageInterval = completeTarget.intervalMileage || 10000;
    const calculatedNextOdo = currentOdo + mileageInterval;

    // 1. Process custom maintenance order generation if checked
    if (completionData.createWorkOrder) {
      const savedOrdersRaw = localStorage.getItem('fleet_maintenance_orders_v2');
      let currentOrders = [];
      if (savedOrdersRaw) {
        try { currentOrders = JSON.parse(savedOrdersRaw); } catch (e) { }
      }

      const orderNo = 'WO-P' + Math.floor(10000 + Math.random() * 90000);
      const newOrderDraft = {
        id: 'ord_' + Math.random().toString(36).substring(2, 9),
        vehicleId: completeTarget.vehicleId,
        orderNumber: orderNo,
        date: completionData.date,
        description: `[صيانة دورية] ${completeTarget.title} - ${completionData.notes}`,
        category: completeTarget.category,
        status: 'completed',
        priority: 'medium',
        cost: Number(completionData.cost) || 0,
        partsUsed: ['زيوت وفلاتر الصيانة الوقائية'],
        workshopId: completionData.workshopId,
        progress: 100,
        lastUpdate: completionData.date,
        chiefNotes: `تم إغلاق البلاغ عبر إكمال نظام التذكيرات المجدول لمكننة العدادات.`
      };

      localStorage.setItem('fleet_maintenance_orders_v2', JSON.stringify([newOrderDraft, ...currentOrders]));
    }

    // 2. Update the Vehicle's lastMaintenance field
    const updatedVehicles = vehicles.map(v => {
      if (v.id === completeTarget.vehicleId) {
        return {
          ...v,
          lastMaintenance: completionData.date
        };
      }
      return v;
    });
    setVehicles(updatedVehicles);
    localStorage.setItem('fleet_vehicles_v2', JSON.stringify(updatedVehicles));

    // 3. Shift the schedule item dynamically to the next due values!
    setSchedules(prev => prev.map(s => {
      if (s.id === completeTarget.id) {
        return {
          ...s,
          lastDoneDate: completionData.date,
          lastDoneMileage: currentOdo,
          dueDate: calculatedNextDueDate,
          dueMileage: completeTarget.type !== 'time' ? calculatedNextOdo : undefined,
          status: 'active'
        };
      }
      return s;
    }));

    // Reset modals
    setShowCompleteModal(false);
    setCompleteTarget(null);

    // Create custom notification dispatch to dashboard/alerts
    window.dispatchEvent(new CustomEvent('maintenance-completed-toast', {
      detail: { 
        title: completeTarget.title,
        vehicleName: matchedVehicle?.name || 'المركبة'
      }
    }));
  };

  // Calendar View Rendering
  const renderCalendar = () => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();

    const ARABIC_MONTHS = [
      'يناير (كانون الثاني)', 'فبراير (شباط)', 'مارس (آذار)', 'أبريل (نيسان)', 'مايو (أيار)', 'يونيو (حزيران)',
      'يوليو (تموز)', 'أغسطس (آب)', 'سبتمبر (أيلول)', 'أكتوبر (تشرين الأول)', 'نوفمبر (تشرين الثاني)', 'ديسمبر (كانون الأول)'
    ];

    const ENGLISH_MONTHS = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNamesAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const dayNames = language === 'ar' ? dayNamesAr : dayNamesEn;
    const monthName = language === 'ar' ? ARABIC_MONTHS[month] : ENGLISH_MONTHS[month];

    // Days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // First day of current month (0 = Sun, 1 = Mon ... 6 = Sat)
    const firstDayIndex = new Date(year, month, 1).getDay();

    const calendarCells: (Date | null)[] = [];
    
    // Fill empty offset cells
    for (let i = 0; i < firstDayIndex; i++) {
      calendarCells.push(null);
    }

    // Fill days of month
    for (let d = 1; d <= daysInMonth; d++) {
      calendarCells.push(new Date(year, month, d));
    }

    // Previous month / Next month handlers
    const prevMonth = () => {
      setCurrentCalendarMonth(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
      setCurrentCalendarMonth(new Date(year, month + 1, 1));
    };

    const pad = (n: number) => n.toString().padStart(2, '0');

    return (
      <div className="space-y-4" dir="rtl">
        {/* Calendar Controller Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-805 border border-slate-200/80 dark:border-slate-850 rounded-xl transition-all cursor-pointer shadow-3xs text-slate-705 dark:text-slate-350"
              title={language === 'ar' ? 'الوقت الفعلي للشهر السابق' : 'Previous Month'}
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-805 border border-slate-200/80 dark:border-slate-850 rounded-xl transition-all cursor-pointer shadow-3xs text-slate-705 dark:text-slate-350"
              title={language === 'ar' ? 'الوقت الفعلي للشهر التالي' : 'Next Month'}
            >
              <ChevronLeft size={16} />
            </button>
            
            <span className="text-sm font-black text-slate-850 dark:text-white px-2">
              {monthName} {year}
            </span>
            
            {/* Quick jump to System Date button */}
            {(year !== 2026 || month !== 4) && (
              <button
                type="button"
                onClick={() => setCurrentCalendarMonth(new Date(2026, 4, 1))}
                className="text-[10px] font-black text-brand-blue-600 dark:text-brand-blue-400 hover:underline px-2 cursor-pointer"
              >
                {language === 'ar' ? '💡 الرجوع للشهر الحالي للتشغيل (مايو 2026)' : '💡 Back to Current Month (May 2026)'}
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap text-[9.5px] font-extrabold text-slate-505">
            {/* Small Legend */}
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 bg-indigo-505 rounded-lg"></span>
              <span>⚙️ ميكانيكا</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 bg-violet-505 rounded-lg"></span>
              <span>⚡ كهرباء</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 bg-sky-505 rounded-lg"></span>
              <span>❄️ تبريد</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 bg-rose-505 rounded-lg"></span>
              <span>💧 هيدروليك</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 bg-amber-505 rounded-lg"></span>
              <span>🛠️ سمكرة</span>
            </span>
          </div>
        </div>

        {/* Days Name Header Grid */}
        <div className="grid grid-cols-7 gap-1 border-b border-slate-100 dark:border-slate-800 pb-2 text-center">
          {dayNames.map((name, idx) => (
            <div key={idx} className="text-[11px] font-black text-slate-400 dark:text-slate-505 py-1 uppercase tracking-wider">
              {name}
            </div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-1.5 md:gap-2.5 border border-slate-50 dark:border-slate-900 rounded-3xl p-1 bg-slate-50/20 dark:bg-slate-950/20">
          {calendarCells.map((dayDate, cellIdx) => {
            if (!dayDate) {
              return (
                <div 
                  key={`empty-${cellIdx}`} 
                  className="min-h-[85px] md:min-h-[115px] bg-slate-100/10 dark:bg-slate-900/15 rounded-2xl border border-dashed border-slate-200/20 dark:border-slate-800/10" 
                />
              );
            }

            const dateStr = `${dayDate.getFullYear()}-${pad(dayDate.getMonth() + 1)}-${pad(dayDate.getDate())}`;
            const daySchedules = filteredList.filter(s => s.dueDate === dateStr);
            const isToday = dateStr === '2026-05-23'; // Matches system Date
            
            // Format check for selected day
            const isCalendarSelected = selectedCalendarDay && `${selectedCalendarDay.getFullYear()}-${pad(selectedCalendarDay.getMonth() + 1)}-${pad(selectedCalendarDay.getDate())}` === dateStr;

            return (
              <div
                key={`day-${cellIdx}`}
                className={`min-h-[95px] md:min-h-[125px] p-2 bg-white dark:bg-[#111625] hover:bg-slate-50/50 dark:hover:bg-slate-905/70 rounded-2xl border transition-all duration-200 flex flex-col justify-between group overflow-hidden relative cursor-pointer ${
                  isToday 
                    ? 'border-brand-blue-500 dark:border-brand-blue-400 shadow-md ring-1 ring-brand-blue-500/20 bg-brand-blue-500/5' 
                    : 'border-slate-100 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-800 hover:shadow-2xs'
                }`}
                onClick={(e) => {
                  // Prevent selection if clicked on badges
                  if (e.target !== e.currentTarget && (e.target as HTMLElement).closest('.schedule-badge')) {
                    return;
                  }
                  
                  // Empty space click: open Add Schedule or schedule day details
                  if (user?.role !== 'viewer') {
                    // Pre-fill form with this day and open Add Modal!
                    setFormData({
                      vehicleId: vehicles[0]?.id || '1',
                      title: '',
                      type: 'time',
                      intervalDays: 90,
                      intervalMileage: 10000,
                      lastDoneDate: dateStr,
                      lastDoneMileage: 50000,
                      dueDate: dateStr,
                      dueMileage: 60000,
                      category: 'mechanical',
                      notes: ''
                    });
                    setIsEditing(false);
                    setShowAddModal(true);
                  }
                }}
              >
                {/* Header info in cell */}
                <div className="flex items-center justify-between mb-1.5 z-10">
                  <span className={`text-[10px] md:text-[11px] font-black w-5.5 h-5.5 rounded-full flex items-center justify-center ${
                    isToday 
                      ? 'bg-brand-blue-500 text-white' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {dayDate.getDate()}
                  </span>
                  
                  {isToday && (
                    <span className="text-[8px] font-black bg-brand-blue-500 text-white px-1 py-0.5 rounded leading-none shrink-0 uppercase tracking-widest animate-pulse">
                      {language === 'ar' ? 'اليوم' : 'Today'}
                    </span>
                  )}
                  
                  {daySchedules.length > 0 && !isToday && (
                    <span className="w-1.5 h-1.5 bg-brand-blue-505 dark:bg-indigo-400 rounded-full" />
                  )}
                </div>

                {/* Badges container */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[75px] custom-scrollbar pr-0.5 z-10 pointer-events-auto">
                  {daySchedules.slice(0, 3).map((sched, sIdx) => {
                    const matchedVehicle = vehicles.find(v => v.id === sched.vehicleId);
                    
                    // Simple category background color matching
                    let catColor = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200';
                    if (sched.category === 'mechanical') catColor = 'bg-[#6366f1] hover:bg-[#4f46e5] text-white';
                    else if (sched.category === 'electrical') catColor = 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white';
                    else if (sched.category === 'cooling') catColor = 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white';
                    else if (sched.category === 'hydraulic') catColor = 'bg-[#f43f5e] hover:bg-[#e11d48] text-white';
                    else if (sched.category === 'bodywork') catColor = 'bg-[#f59e0b] hover:bg-[#d97706] text-white';

                    let statusDot = 'bg-[#34d399]';
                    if (sched.status === 'overdue') statusDot = 'bg-[#ef4444]';
                    else if (sched.status === 'due-soon') statusDot = 'bg-[#f59e0b]';
                    else if (sched.status === 'paused') statusDot = 'bg-[#64748b]';

                    return (
                      <div
                        key={sched.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCalendarSchedule(sched);
                        }}
                        className={`schedule-badge flex items-center justify-between text-[8px] md:text-[9.5px] font-black px-1.5 py-0.5 rounded-lg border border-transparent cursor-pointer transition-all ${catColor} shadow-3xs truncate`}
                        title={`${matchedVehicle?.name || 'المركبة'}: ${sched.title}`}
                      >
                        <div className="flex items-center gap-1 truncate w-full">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot}`} />
                          <span className="truncate max-w-[85%] text-right">
                            {matchedVehicle?.name ? `${matchedVehicle.name} • ` : ''}{sched.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {daySchedules.length > 3 && (
                    <div 
                      className="text-[8px] font-black text-slate-400 dark:text-slate-500 text-center py-0.5"
                    >
                      {language === 'ar' ? `+ ${daySchedules.length - 3} متبقي` : `+ ${daySchedules.length - 3} more`}
                    </div>
                  )}
                  
                  {daySchedules.length === 0 && user?.role !== 'viewer' && (
                    <div className="w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center pt-2 transition-opacity pointer-events-none">
                      <span className="text-[10px] font-black text-brand-blue-500 flex items-center gap-1 bg-brand-blue-50 dark:bg-brand-blue-950/25 px-1.5 py-0.5 rounded-md">
                        <Plus size={10} />
                        <span>{language === 'ar' ? 'إضافة' : 'Add'}</span>
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Background Grid Accent on Hover */}
                <div className="absolute inset-0 bg-slate-50/0 group-hover:bg-slate-50/10 dark:group-hover:bg-slate-900/5 transition-colors pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* Modal/Flyout for selected Calendar task details */}
        <AnimatePresence>
          {selectedCalendarSchedule && (() => {
            const sched = selectedCalendarSchedule;
            const matchedVehicle = vehicles.find(v => v.id === sched.vehicleId);
            const isOverdue = sched.status === 'overdue';
            const isDueSoon = sched.status === 'due-soon';
            
            return (
              <div 
                className="fixed inset-0 bg-slate-950/65 backdrop-blur-3xs z-[100] flex items-center justify-center p-4 text-right"
                onClick={() => setSelectedCalendarSchedule(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-2xl w-full max-w-md text-right relative space-y-4"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button 
                    onClick={() => setSelectedCalendarSchedule(null)}
                    className="absolute top-4 left-4 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-full transition-colors cursor-pointer text-slate-500 dark:text-slate-400"
                  >
                    <X size={15} />
                  </button>

                  {/* Header Title */}
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-850">
                    <span className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-black mb-2 ${getCatColorClass(sched.category)}`}>
                      {getCatLabel(sched.category)}
                    </span>
                    <h3 className="text-xs md:text-sm font-black text-slate-850 dark:text-white leading-normal pr-1">{sched.title}</h3>
                  </div>

                  {/* Content details */}
                  <div className="space-y-2.5 text-xs">
                    {/* Vehicle info block */}
                    {matchedVehicle && (
                      <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-100/50 dark:border-slate-850">
                        {matchedVehicle.image && (
                          <img 
                            src={matchedVehicle.image} 
                            alt={matchedVehicle.name} 
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-150 dark:border-slate-800"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div>
                          <span className="block font-black text-xs text-slate-700 dark:text-white leading-tight mb-1">{matchedVehicle.name}</span>
                          <span className="inline-block font-mono text-[9.5px] font-bold px-2 py-0.5 bg-indigo-50/65 dark:bg-indigo-950/40 text-brand-blue-600 dark:text-brand-blue-400 rounded-md border border-indigo-120/30">
                            {matchedVehicle.plateNumber}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Cycle settings */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-650 dark:text-slate-350">
                      <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-105/40 dark:border-slate-800/60 space-y-0.5 text-right">
                        <span className="block text-[8px] text-slate-400 font-extrabold uppercase">طريقة وفترة التكرار</span>
                        <span className="block text-slate-800 dark:text-slate-150">
                          {sched.type === 'time' ? `كل ${sched.intervalDays} يوم` : sched.type === 'mileage' ? `كل ${sched.intervalMileage?.toLocaleString()} كم` : `كل ${sched.intervalDays} يوم أو ${sched.intervalMileage?.toLocaleString()} كم`}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-105/40 dark:border-slate-800/60 space-y-0.5 text-right">
                        <span className="block text-[8px] text-slate-400 font-extrabold uppercase">تاريخ وموعد الاستحقاق</span>
                        <span className="block text-slate-800 dark:text-slate-150 font-mono">
                          {sched.dueDate} {(isOverdue || isDueSoon) && (
                            <span className={isOverdue ? 'text-rose-500 font-black' : 'text-amber-500 font-black'}>
                              ({sched.status === 'overdue' ? 'متأخر' : 'قريباً'})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* notes */}
                    {sched.notes && (
                      <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100/50 dark:border-slate-800/60 text-[10.5px] leading-relaxed dark:text-slate-400 text-right">
                        <span className="block text-[8.5px] text-slate-400 font-extrabold mb-1">تعليمات وتوجيهات الصيانة:</span>
                        <p>{sched.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions buttons under permission check */}
                  {user?.role !== 'viewer' ? (
                    <div className="pt-3 border-t border-slate-150 dark:border-slate-850 flex items-center justify-end gap-2">
                      {user?.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            handleDelete(sched.id);
                            setSelectedCalendarSchedule(null);
                          }}
                          className="px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-red-500 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>حذف</span>
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => {
                          handleEditIntent(sched);
                          setSelectedCalendarSchedule(null);
                        }}
                        className="px-4 py-2 bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-705 dark:text-slate-250 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit size={13} />
                        <span>تعديل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleMarkCompletedIntent(sched);
                          setSelectedCalendarSchedule(null);
                        }}
                        className="px-5 py-2 bg-brand-blue-500 hover:bg-brand-blue-600 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand-blue-500/15"
                      >
                        <Check size={13} />
                        <span>إنجاز الصيانة</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center pt-2 text-[10px] text-slate-400 font-bold">
                      {language === 'ar' ? 'نمط العرض فقط لا يتيح لك تعديل الصيانة الوقائية' : 'Viewer account mode does not allow scheduling updates'}
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div id="periodic-maintenance-section" className="space-y-6 text-right" dir="rtl">
      
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="p-2.5 bg-brand-blue-500/10 text-brand-blue-600 dark:text-[#34d399] rounded-2xl flex items-center justify-center shrink-0">
                <Calendar size={22} />
              </span>
              <span>
                {language === 'ar' ? 'لوحة وجدولة الصيانة الدورية الوقائية' : 'Preventive Maintenance Scheduler'}
              </span>
            </h1>
            <ContextualHelp 
              id="periodic-maintenance"
              titleAr="جدول الصيانات الوقائية الدورية"
              titleEn="Preventive Maintenance Calendar"
              explanationAr="تقويم ذكي لتحديد حزم مهام الصيانة المتكررة (مثل تغيير الزيت، معايرة الإطارات، فحص الفرامل) استناداً إلى مرور فترات زمنية أو تحقيق مسافات مقطوعة محددة بالأودوميتر."
              explanationEn="An intelligent scheduler for setting up recurring maintenance actions (e.g. oil changes, tire rotations, brake safety tests) based on time duration or odometer thresholds."
              benefitsAr={[
                "أتمتة وحساب منبهات اقتراب موعد الفحوصات الدورية الفنية تلقائياً.",
                "تقليص احتمالات توقف الشاحنات على الطرق ومفاجآت الأعطال بنسبة 60%.",
                "ربط الصيانات الديجيتال وسجلات الخدمة بمخزون قطع الغيار والعتاد بدقة."
              ]}
              benefitsEn={[
                "Automates alarms based on dynamic time elapsed and engine odometer checks.",
                "Saves downtime by preventing critical wear-and-tear failures mid-transit.",
                "Directly matches future periodic part requirements to stock reserves."
              ]}
              tipsAr={[
                "قم بضبط قيم التنبيه الاستباقي بمسافة 500 كم قبل الموعد الفعلي لضمان جدولة العمل اليدوي بمرونة."
              ]}
              tipsEn={[
                "Configure safety margins (like 500 km or 7 days) to prepare technicians and parts beforehand."
              ]}
              language={language}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xl">
            {language === 'ar' 
              ? 'تقويم ذكي ومكننة للمسافات المقطوعة والتوريدات الميدانية. يتيح لك تتبع مواعيد استبدال الزيوت، معايرة الإطارات، والفحص الدوري للفرامل لضمان الجاهزية القصوى للأسطول.' 
              : 'Smart calendar mapping service times, engine running hours, and fleet-wide spare supplies.'}
          </p>
        </div>

        {user?.role !== 'viewer' && (
          <button
            id="add-maintenance-btn"
            onClick={() => {
              setIsEditing(false);
              setFormData({
                vehicleId: vehicles[0]?.id || '1',
                title: '',
                type: 'time',
                intervalDays: 90,
                intervalMileage: 10000,
                lastDoneDate: new Date().toISOString().split('T')[0],
                lastDoneMileage: 50000,
                dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                dueMileage: 60000,
                category: 'mechanical',
                notes: ''
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-5 py-3 h-fit text-xs font-black text-white bg-linear-to-r from-brand-blue-600 to-indigo-650 hover:opacity-95 active:scale-[98%] rounded-[1.65rem] transition-all shadow-lg hover:shadow-xl shadow-brand-blue-500/20 hover:shadow-brand-blue-500/25 shrink-0 self-start sm:self-center bg-brand-blue-500 cursor-pointer"
          >
            <Plus size={16} />
            <span>إنشاء تذكير / صيانة مجدولة</span>
          </button>
        )}
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {[
          { 
            label: 'إجمالي التذكيرات', 
            val: metrics.total, 
            desc: 'جداول الخدمة النشطة والمؤرشفة', 
            icon: <Calendar size={15} />, 
            bg: 'bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/30 dark:to-sky-900/10 border-sky-300 dark:border-sky-800 border-r-4 border-r-sky-600 dark:border-r-sky-400',
            text: 'text-sky-950 dark:text-sky-50',
            labelColor: 'text-sky-900 dark:text-sky-200',
            descColor: 'text-sky-800 dark:text-sky-350',
            iconBg: 'bg-white dark:bg-sky-900/80 shadow-xs border border-sky-150 dark:border-sky-850',
            iconColor: 'text-sky-700 dark:text-sky-300'
          },
          { 
            label: 'المتأخر فواته', 
            val: metrics.overdue, 
            desc: 'آليات تخطت الفترة أو المسافة المسموحة', 
            icon: <AlertTriangle size={15} />, 
            bg: 'bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/10 border-red-300 dark:border-red-800 border-r-4 border-r-red-600 dark:border-r-red-400',
            text: 'text-red-955 dark:text-red-50',
            labelColor: 'text-red-900 dark:text-red-200',
            descColor: 'text-red-800 dark:text-red-350',
            iconBg: 'bg-white dark:bg-red-900/80 shadow-xs border border-red-150 dark:border-red-850',
            iconColor: 'text-red-700 dark:text-red-300',
            pulse: metrics.overdue > 0
          },
          { 
            label: 'يستحق قريباً', 
            val: metrics.dueSoon, 
            desc: 'في غضون 7 أيام أو أقل من المستهدف', 
            icon: <Clock size={15} />, 
            bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/10 border-amber-300 dark:border-amber-800 border-r-4 border-r-amber-600 dark:border-r-amber-400',
            text: 'text-amber-955 dark:text-amber-50',
            labelColor: 'text-amber-905 dark:text-amber-200',
            descColor: 'text-amber-800 dark:text-amber-350',
            iconBg: 'bg-white dark:bg-amber-900/80 shadow-xs border border-amber-150 dark:border-amber-850',
            iconColor: 'text-amber-700 dark:text-amber-300'
          },
          { 
            label: 'نشط وآمن', 
            val: metrics.active, 
            desc: 'صيانات مجدولة مستقرة الفهارس', 
            icon: <CheckCircle size={15} />, 
            bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/10 border-emerald-300 dark:border-emerald-800 border-r-4 border-r-emerald-600 dark:border-r-emerald-400',
            text: 'text-emerald-955 dark:text-emerald-50',
            labelColor: 'text-emerald-905 dark:text-emerald-200',
            descColor: 'text-emerald-800 dark:text-emerald-350',
            iconBg: 'bg-white dark:bg-emerald-900/80 shadow-xs border border-emerald-150 dark:border-emerald-850',
            iconColor: 'text-emerald-700 dark:text-emerald-300'
          },
          { 
            label: 'إيقاف مؤقت', 
            val: metrics.paused, 
            desc: 'تذكيرات تم تعطيلها لآليات متوقفة', 
            icon: <X size={15} />, 
            bg: 'bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/30 dark:to-slate-800/15 border-slate-300 dark:border-slate-800 border-r-4 border-r-slate-500 dark:border-r-slate-400',
            text: 'text-slate-900 dark:text-slate-100',
            labelColor: 'text-slate-750 dark:text-slate-300',
            descColor: 'text-slate-650 dark:text-slate-400/80',
            iconBg: 'bg-white dark:bg-slate-800/80 shadow-xs border border-slate-200 dark:border-slate-705',
            iconColor: 'text-slate-600 dark:text-slate-400'
          },
        ].map((item, i) => (
          <div 
            key={i} 
            className={`p-4 rounded-2xl border ${item.bg} shadow-md hover:shadow-lg transition-all duration-300 -translate-y-[1px] hover:-translate-y-[3px] flex flex-col justify-between group`}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className={`text-[10px] font-black leading-none block tracking-wide ${item.labelColor}`}>{item.label}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${item.iconBg} ${item.iconColor} ${item.pulse ? 'animate-bounce border border-rose-300 text-rose-500' : ''}`}>
                {item.icon}
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-black font-mono leading-none ${item.text}`}>{item.val}</span>
              <span className={`text-[9.5px] font-bold block ${item.labelColor}`}>جدول</span>
            </div>
            <span className={`text-[8.5px] font-bold block mt-1.5 line-clamp-1 ${item.descColor}`}>{item.desc}</span>
          </div>
        ))}
      </div>

      {/* Toast floating notify */}
      <AnimatePresence>
        {notificationToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-6 z-50 max-w-sm p-4 rounded-2xl shadow-2xl border flex items-center gap-3 text-right backdrop-blur-md ${
              notificationToast.type === 'success' 
                ? 'bg-emerald-500/90 dark:bg-emerald-950/90 text-white border-emerald-400 dark:border-emerald-800'
                : notificationToast.type === 'warning'
                ? 'bg-rose-500/90 dark:bg-rose-950/90 text-white border-rose-400 dark:border-rose-800'
                : 'bg-brand-blue-500/90 dark:bg-brand-blue-950/90 text-white border-brand-blue-400 dark:border-brand-blue-800'
            }`}
          >
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Bell size={16} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black leading-relaxed">{notificationToast.message}</p>
            </div>
            <button 
              type="button" 
              onClick={() => setNotificationToast(null)} 
              className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Alerts Hub & Browser Notify Controller */}
      <div className="bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
        
        {/* Toggle panel controller */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3.5 border-b border-slate-150/50 dark:border-slate-800/60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue-500/10 text-brand-blue-500 flex items-center justify-center shrink-0">
              <Bell size={18} className={notificationsEnabled ? 'animate-bounce' : ''} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>جهاز المراقبة الوقائية وإشعار نفاد قطع الغيار</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                تتبع مواعيد استحقاق الصيانات الدورية الحرجة (المتأخر والعاجل) بالتوازي مع تنبيهات ذكية لانخفاض ونفاد مستويات قطع الغيار بالمستودع.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleNotifications}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                notificationsEnabled
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              <Bell size={13} className={notificationsEnabled ? 'animate-pulse' : ''} />
              <span>{notificationsEnabled ? 'إشعارات المتصفح نشطة ✓' : 'تفعيل إشعارات المتصفح'}</span>
            </button>
          </div>
        </div>

        {/* Alerts Center Grid */}
        {!hasAnyAlerts ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 bg-slate-50/40 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200/60 dark:border-slate-800/60">
            <div className="w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
              <Check className="scale-110" size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-850 dark:text-slate-200">الوضعية اللوجستية والتشغيلية ممتازة</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                لا توجد صيانات وقائية متخطية لتواريخ الاستحقاق أو قطع غيار تحت تراجع المخزون الحرج.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Column A: Maintenance schedules awaiting attention */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-lg border border-rose-100 dark:border-rose-900/30 flex items-center gap-1.5">
                  <Clock size={11} />
                  <span>تنبيه الاستحقاقات الوقائية ({activeSchedulesAlerts.length})</span>
                </span>
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-555">إجراء صيانة وشيك</span>
              </div>

              {activeSchedulesAlerts.length === 0 ? (
                <div className="p-4 bg-slate-50/20 dark:bg-slate-950/10 text-center rounded-xl text-[10px] text-slate-400">
                  لا توجد تذكيرات مستحقة أو متأخرة الموعد حالياً.
                </div>
              ) : (
                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {activeSchedulesAlerts.map(sched => {
                    const matchedVehicle = vehicles.find(v => v.id === sched.vehicleId);
                    const isOverdue = sched.status === 'overdue';
                    
                    return (
                      <div 
                        key={sched.id}
                        className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          isOverdue 
                            ? 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-100 dark:border-rose-950/30' 
                            : 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-100 dark:border-amber-950/30'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`mt-0.5 p-1 rounded-lg ${isOverdue ? 'bg-rose-100/65 text-rose-600' : 'bg-amber-100/65 text-amber-600'}`}>
                            <AlertTriangle size={12} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-slate-800 dark:text-slate-105 leading-none">{sched.title}</span>
                              <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                                {matchedVehicle?.name} {matchedVehicle?.plateNumber !== 'لا يوجد' && `(${matchedVehicle?.plateNumber})`}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                              {isOverdue 
                                ? `⚠️ تجاوز موعد الصيانة! الاستحقاق: ${sched.dueDate}`
                                : `⚙️ اقترب الاستحقاق: ${sched.dueDate}`}
                              {sched.dueMileage && ` / عند العداد: ${sched.dueMileage.toLocaleString()} كم`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setCompleteTarget(sched);
                              setCompletionData(p => ({
                                ...p,
                                odometer: sched.dueMileage ? sched.dueMileage.toString() : '',
                                cost: ''
                              }));
                              setShowCompleteModal(true);
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[10px] font-black text-brand-blue-600 dark:text-brand-blue-400 rounded-lg cursor-pointer transition-all"
                          >
                            إنجاز
                          </button>
                          <button
                            type="button"
                            onClick={() => setDismissedAlerts(prev => [...prev, `sched-${sched.id}`])}
                            className="p-1 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-all"
                            title="تجاهل"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Column B: Depleted inventory alerts */}
            <div className="space-y-2.5 lg:border-r lg:border-slate-150/50 lg:dark:border-slate-850 lg:pr-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-red-650 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2.5 py-1 rounded-lg border border-red-100 dark:border-red-900/30 flex items-center gap-1.5">
                  <Package size={11} />
                  <span>إنذار نفاد مخزون قطع الغيار ({activeInventoryAlerts.length})</span>
                </span>
                <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500">تموين ومستودع</span>
              </div>

              {activeInventoryAlerts.length === 0 ? (
                <div className="p-4 bg-slate-50/20 dark:bg-slate-950/10 text-center rounded-xl text-[10px] text-slate-400">
                  لا توجد أصناف منخفضة المخزون بالمخرن حالياً.
                </div>
              ) : (
                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {activeInventoryAlerts.map(item => {
                    const isFullyOut = item.quantity === 0;
                    
                    return (
                      <div 
                        key={item.id}
                        className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          isFullyOut
                            ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-150/70 dark:border-rose-950/40' 
                            : 'bg-amber-50/30 dark:bg-amber-950/5 border-amber-150/40 dark:border-amber-950/20'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`mt-0.5 p-1 rounded-lg ${isFullyOut ? 'bg-rose-100 text-rose-600' : 'bg-amber-100/60 text-amber-600'}`}>
                            <ShieldAlert size={12} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-slate-800 dark:text-slate-100 leading-none">{item.name}</span>
                              <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-450 dark:text-slate-400">
                                {item.partNumber}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                              <span>المخزون الحالي:</span>
                              <strong className={`font-black ${isFullyOut ? 'text-rose-600' : 'text-amber-600'}`}>
                                {isFullyOut ? 'نفاد تام! (0 قطعة)' : `${item.quantity} قطع`}
                              </strong>
                              <span>/</span>
                              <span>الأمان: {item.minQuantity} قطع</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-black ${
                            isFullyOut 
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400' 
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          }`}>
                            {isFullyOut ? 'نفاد حرج 🔴' : 'طلب توريد ⚠️'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setDismissedAlerts(prev => [...prev, `inv-${item.id}`])}
                            className="p-1 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-all"
                            title="تجاهل"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Filter and Content Card */}
      <div className="bg-white dark:bg-[#0f1422] border border-slate-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-xs space-y-5">
        
        {/* Toggle between List View and Calendar View */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-brand-blue-500 rounded-full"></span>
            <h3 className="text-sm font-black text-slate-850 dark:text-white">
              {language === 'ar' ? 'نمط استعراض وجدولة المهام الوقائية' : 'Maintenance Visualization & Scheduling Mode'}
            </h3>
          </div>
          
          <div className="flex items-center bg-slate-50 dark:bg-slate-150 border border-slate-200/60 dark:border-slate-850 p-1 rounded-2xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xs border border-slate-100 dark:border-slate-800'
                  : 'text-slate-500 hover:text-slate-705 dark:text-slate-400 dark:hover:text-slate-250'
              }`}
            >
              <SlidersHorizontal size={13} className="shrink-0" />
              <span>{language === 'ar' ? 'عرض جدول القائمة' : 'List Table'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-brand-blue-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-705 dark:text-slate-400 dark:hover:text-slate-250'
              }`}
            >
              <Calendar size={13} className="shrink-0" />
              <span>{language === 'ar' ? 'عرض التقويم التفاعلي' : 'Calendar Grid'}</span>
            </button>
          </div>
        </div>
        
        {/* Filters bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث برقم لوحة المركبة، الاسم، أو مسمى الصيانة الدورية..."
              className="w-full pr-10 pl-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl outline-none focus:border-brand-blue-500 font-bold dark:text-white transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Category selection */}
            <div className="relative">
              <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400">
                <Filter size={11} />
              </span>
              <select
                value={categoryFilter}
                onChange={(e: any) => setCategoryFilter(e.target.value)}
                className="appearance-none pr-8.5 pl-7 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl outline-none font-bold dark:text-white cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
              >
                <option value="all">التخصص الفني: الكل</option>
                <option value="mechanical">⚙️ ميكانيكا وصيانة</option>
                <option value="electrical">⚡ كهرباء وإلكترونيات</option>
                <option value="cooling">❄️ تبريد وتكييف</option>
                <option value="hydraulic">💧 أنظمة هيدروليك</option>
                <option value="bodywork">🛠️ سمكرة وهيكل</option>
              </select>
              <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown size={11} />
              </span>
            </div>

            {/* Status selection */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="appearance-none pr-4 pl-7 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl outline-none font-bold dark:text-white cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
              >
                <option value="all">حالة السريان: الكل</option>
                <option value="active">● نشط وآمن</option>
                <option value="due-soon">● يستحق قريباً</option>
                <option value="overdue">● متأخر للاستحقاق</option>
                <option value="paused">● موقوف مؤقتاً</option>
              </select>
              <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown size={11} />
              </span>
            </div>

            {/* Advanced Filters Toggle Button */}
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(prev => !prev)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-black rounded-xl transition-all border cursor-pointer ${
                isAdvancedOpen 
                  ? 'bg-brand-blue-500 text-white border-brand-blue-500 shadow-sm' 
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-305 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <SlidersHorizontal size={12} />
              <span>تصفية وفرز متقدم</span>
              {(vehicleFilter !== 'all' || sortBy !== 'dueDate' || sortOrder !== 'asc') && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {isAdvancedOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-150/60 dark:border-slate-800 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Filter by Target Vehicle */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-550 dark:text-slate-400 block">التصفية حسب لوحة أو اسم المركبة:</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400">
                      <Truck size={13} />
                    </span>
                    <select
                      value={vehicleFilter}
                      onChange={(e) => setVehicleFilter(e.target.value)}
                      className="w-full appearance-none pr-8.5 pl-4 py-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl outline-none font-bold dark:text-white cursor-pointer hover:border-slate-300 transition-all"
                    >
                      <option value="all">كل المركبات بالأسطول</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.plateNumber !== 'لا يوجد' ? v.plateNumber : 'بلاد رقم'})
                        </option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown size={11} />
                    </span>
                  </div>
                </div>

                {/* Sort criteria */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-550 dark:text-slate-400 block">ترتيب وجدولة المواعيد حسب:</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-slate-400">
                      <ArrowUpDown size={13} />
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="w-full appearance-none pr-8.5 pl-4 py-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl outline-none font-bold dark:text-white cursor-pointer hover:border-slate-300 transition-all"
                    >
                      <option value="dueDate">📅 تاريخ الاستحقاق القادم</option>
                      <option value="vehicleName">🚚 اسم المركبة أبجدياً (أ-ي)</option>
                      <option value="category">⚙️ التخصص الفني للصيانة</option>
                      <option value="status">● حالة الاستحقاق والوضعية</option>
                    </select>
                    <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown size={11} />
                    </span>
                  </div>
                </div>

                {/* Sort order configuration */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-550 dark:text-slate-400 block">إتجاه الترتيب (تصاعدي / تنازلي):</label>
                  <div className="flex gap-2 h-[38px] items-center">
                    <button
                      type="button"
                      onClick={() => setSortOrder('asc')}
                      className={`flex-1 h-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        sortOrder === 'asc'
                          ? 'bg-brand-blue-500 text-white border border-brand-blue-500 shadow-xs'
                          : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-350 border border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-50'
                      }`}
                    >
                      <span>تصاعدي</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortOrder('desc')}
                      className={`flex-1 h-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        sortOrder === 'desc'
                          ? 'bg-brand-blue-500 text-white border border-brand-blue-500 shadow-xs'
                          : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-350 border border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-50'
                      }`}
                    >
                      <span>تنازلي</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Active filters chips preview */}
              {(vehicleFilter !== 'all' || sortBy !== 'dueDate' || sortOrder !== 'asc' || categoryFilter !== 'all' || statusFilter !== 'all' || searchTerm !== '') && (
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/40 dark:border-slate-800/60">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold ml-1">شروط الفرز والتصفية المطبقة حالياً:</span>
                    {vehicleFilter !== 'all' && (
                      <span className="px-2.5 py-1 bg-brand-blue-50 dark:bg-brand-blue-950/30 text-brand-blue-600 dark:text-brand-blue-400 rounded-lg text-[9.5px] font-black flex items-center gap-1">
                        <span>المركبة: {vehicles.find(v => v.id === vehicleFilter)?.name}</span>
                        <button type="button" onClick={() => setVehicleFilter('all')} className="hover:text-rose-500 p-0.5">×</button>
                      </span>
                    )}
                    {sortBy !== 'dueDate' && (
                      <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9.5px] font-black flex items-center gap-1">
                        <span>الترتيب: {sortBy === 'vehicleName' ? 'اسم المركبة' : sortBy === 'category' ? 'التخصص الفني' : 'الحالة'}</span>
                        <button type="button" onClick={() => setSortBy('dueDate')} className="hover:text-rose-500 p-0.5">×</button>
                      </span>
                    )}
                    {categoryFilter !== 'all' && (
                      <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-lg text-[9.5px] font-black flex items-center gap-1">
                        <span>التخصص: {getCatLabel(categoryFilter)}</span>
                        <button type="button" onClick={() => setCategoryFilter('all')} className="hover:text-rose-500 p-0.5">×</button>
                      </span>
                    )}
                    {statusFilter !== 'all' && (
                      <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9.5px] font-black flex items-center gap-1">
                        <span>حالة السريان: {statusFilter === 'active' ? 'نشط وآمن' : statusFilter === 'due-soon' ? 'يستحق قريباً' : statusFilter === 'overdue' ? 'متأخر' : 'موقوف'}</span>
                        <button type="button" onClick={() => setStatusFilter('all')} className="hover:text-rose-500 p-0.5">×</button>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('all');
                      setStatusFilter('all');
                      setVehicleFilter('all');
                      setSortBy('dueDate');
                      setSortOrder('asc');
                    }}
                    className="text-[10px] font-extrabold text-rose-500 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    إعادة تعيين كافة الفلاتر والفرز
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Schedules Table/Deck list */}
        {viewMode === 'list' ? (
          <>
            {filteredList.length === 0 ? (
          <div className="py-12 border border-dashed border-slate-150 dark:border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
            <Calendar size={38} className="text-slate-300 dark:text-slate-650 animate-bounce mb-3" />
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">لم يتم العثور على جداول الصيانة الدورية المطابقة</h4>
            <p className="text-[10px] mt-1 text-slate-500 max-w-sm">
              حاول تخفيف حدة شروط الفلترة أو قم بمسح مربع البحث للعثور على عناصر التقويم الدوري.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-550 text-[10px] font-black uppercase tracking-wider">
                  <th className="py-3 px-4">تفاصيل وعنوان الصيانة الدورية</th>
                  <th className="py-3 px-4">المركبة / الآلية المرتبطة</th>
                  <th className="py-3 px-4">دورة التكرار المجدولة</th>
                  <th className="py-3 px-4">الاستحقاق القادم</th>
                  <th className="py-3 px-4">آخر إنجاز سابق</th>
                  <th className="py-3 px-4">الوضعية الحالية</th>
                  <th className="py-3 px-4 text-left">أوامر المعالجة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60">
                {filteredList.map((sched) => {
                  const matchedVehicle = vehicles.find(v => v.id === sched.vehicleId);
                  
                  // Calculate days left relative to (2026-05-23)
                  const dueDateObj = new Date(sched.dueDate);
                  const diffTime = dueDateObj.getTime() - systemDate.getTime();
                  const remainingDays = Math.ceil(diffTime / (1024 * 60 * 60 * 1000));

                  return (
                    <tr 
                      key={sched.id}
                      className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
                    >
                      {/* Name and title */}
                      <td className="py-4 px-4 min-w-[200px]">
                        <div className="flex items-start gap-2.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black shrink-0 ${getCatColorClass(sched.category)}`}>
                            {getCatLabel(sched.category)}
                          </span>
                          <div>
                            <span className="block font-black text-xs text-slate-800 dark:text-white leading-snug group-hover:text-brand-blue-600 dark:group-hover:text-[#34d399] transition-colors">{sched.title}</span>
                            {sched.notes && <p className="text-[9.5px] text-slate-450 dark:text-slate-450 line-clamp-1 mt-0.5 max-w-[250px]" title={sched.notes}>{sched.notes}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Associated Vehicle */}
                      <td className="py-4 px-4">
                        {matchedVehicle ? (
                          <div 
                            onClick={() => triggerOpenVehicle(matchedVehicle.id)}
                            className="flex items-center gap-2 cursor-pointer group/v hover:opacity-85"
                          >
                            {matchedVehicle.image && (
                              <img 
                                src={matchedVehicle.image} 
                                alt={matchedVehicle.name} 
                                className="w-8 h-8 rounded-lg object-cover bg-slate-100 border border-slate-200/50 dark:border-slate-800 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <div>
                              <span className="block font-bold text-xs text-slate-700 dark:text-slate-200 leading-none mb-1 group-hover/v:underline">{matchedVehicle.name}</span>
                              <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-slate-150/40 dark:border-slate-700 tracking-wider">
                                {matchedVehicle.plateNumber}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-bold">غير مدرج بالأسطول</span>
                        )}
                      </td>

                      {/* Repetition Cycle details */}
                      <td className="py-4 px-4 font-mono text-xs">
                        {sched.type === 'time' && (
                          <span className="text-slate-700 dark:text-slate-350 font-bold">كل {sched.intervalDays} يوماً</span>
                        )}
                        {sched.type === 'mileage' && (
                          <span className="text-slate-750 dark:text-slate-300 font-black">كل {sched.intervalMileage?.toLocaleString()} كم</span>
                        )}
                        {sched.type === 'both' && (
                          <div className="text-right">
                            <span className="block text-slate-755 dark:text-slate-300 font-bold">كل {sched.intervalDays} يوم</span>
                            <span className="block text-[10px] text-slate-450 dark:text-slate-500 font-medium">أو {sched.intervalMileage?.toLocaleString()} كم</span>
                          </div>
                        )}
                      </td>

                      {/* Target/Next Due date and remaining tracker */}
                      <td className="py-4 px-4">
                        <div className="text-right">
                          <span className="block font-mono font-black text-xs text-slate-800 dark:text-slate-200">{sched.dueDate}</span>
                          {sched.dueMileage && (
                            <span className="block font-mono text-[10px] text-slate-450 dark:text-slate-500 font-bold">عند عداد {sched.dueMileage.toLocaleString()} كم</span>
                          )}
                          
                          {sched.status !== 'paused' && (
                            remainingDays <= 0 ? (
                              <span className="text-[9px] font-extrabold text-rose-500 block mt-0.5">⚠️ متجاوز الموعد بـ {Math.abs(remainingDays)} يوم</span>
                            ) : remainingDays <= 7 ? (
                              <span className="text-[9px] font-extrabold text-amber-500 block mt-0.5">🕒 يستحق بعد {remainingDays} أيام</span>
                            ) : (
                              <span className="text-[9px] font-semibold text-emerald-500 block mt-0.5">✓ متبقي {remainingDays} يوم</span>
                            )
                          )}
                        </div>
                      </td>

                      {/* Last Done maintenance */}
                      <td className="py-4 px-4">
                        {sched.lastDoneDate ? (
                          <div className="text-right font-mono">
                            <span className="block text-xs text-slate-500 dark:text-slate-400 font-bold">{sched.lastDoneDate}</span>
                            {sched.lastDoneMileage && (
                              <span className="block text-[10.5px] text-slate-400 dark:text-slate-500">{sched.lastDoneMileage.toLocaleString()} كم</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold">فحص المصنع التأسيسي</span>
                        )}
                      </td>

                      {/* Status Indicator */}
                      <td className="py-4 px-4">
                        {sched.status === 'paused' ? (
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-[10px] font-black inline-flex items-center gap-1">
                            <span>●</span> موقوف مؤقتاً
                          </span>
                        ) : remainingDays <= 0 ? (
                          <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/40 rounded-xl text-[10px] font-black inline-flex items-center gap-1">
                            <span>●</span> فوات الاستحقاق
                          </span>
                        ) : remainingDays <= 7 ? (
                          <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-655 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 rounded-xl text-[10px] font-black inline-flex items-center gap-1">
                            <span>●</span> يستحق قريباً
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 rounded-xl text-[10px] font-black inline-flex items-center gap-1">
                            <span>●</span> نشط ومجدول
                          </span>
                        )}
                      </td>

                      {/* Inline Actions */}
                      <td className="py-4 px-4 text-left">
                        <div className="inline-flex gap-2.5 justify-end">
                          {user?.role !== 'viewer' ? (
                            <>
                              <button
                                onClick={() => handleMarkCompletedIntent(sched)}
                                title="تحديث وإنجاز الصيانة للتذكير الحالي"
                                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-[#34d399] px-2.5 py-1.5 rounded-lg text-[10.5px] font-black flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Check size={13} />
                                <span>إنجاز الصيانة</span>
                              </button>

                              <button
                                onClick={() => handleEditIntent(sched)}
                                title="تعديل جدول التذكير"
                                className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-550 dark:text-slate-405 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit size={12} />
                              </button>

                              <button
                                onClick={() => handlePauseToggle(sched.id)}
                                title={sched.status === 'paused' ? 'إعادة سريان التذكير' : 'إيقاف التذكير مؤقتاً'}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  sched.status === 'paused' 
                                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-500' 
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-105'
                                }`}
                              >
                                <RefreshCw size={11} className={sched.status !== 'paused' ? 'opacity-80' : 'animate-spin-slow'} />
                              </button>

                              {user?.role === 'admin' && (
                                <button
                                  onClick={() => handleDelete(sched.id)}
                                  title="حذف التذكير نهائياً"
                                  className="p-1.5 bg-slate-50 dark:bg-slate-800/60 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">عرض فقط 👁️</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
          </>
        ) : (
          renderCalendar()
        )}
      </div>

      {/* MODAL 1: ADD / EDIT SCHEDULE MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl p-6 overflow-hidden max-h-[92vh] flex flex-col text-right"
            >
              {/* Head */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {isEditing ? 'تعديل جدول الصيانة الوقائية والمواعيد' : 'إنشاء جدول صيانة دورية مخصص'}
                    </h3>
                    <p className="text-[10px] text-slate-405 dark:text-slate-500">تجديد الفاصل الزمني للآليات لتقليص الأثر التشغيلي المعيب</p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setIsEditing(false);
                    setSelectedScheduleId(null);
                  }}
                  className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-705 rounded-xl cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form Scroll Container */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                
                {/* Vehicle Target Selector */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1.5">المركبة أو الآلية التشغيلية المستهدفة:</label>
                  <select
                    value={formData.vehicleId}
                    onChange={(e) => setFormData(p => ({ ...p, vehicleId: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.plateNumber !== 'لا يوجد' ? v.plateNumber : 'رقم لوحة: معدة ميدانية'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1.5">مسمى الصيانة الدورية / التذكير:</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="مثال: تبديل زيت الهايدروليك لروافع الشغل"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Category */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1.5">تتبع القسم / التصنيف:</label>
                    <select
                      value={formData.category}
                      onChange={(e: any) => setFormData(p => ({ ...p, category: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white"
                    >
                      <option value="mechanical">⚙️ ميكانيكا وصيانة عامة</option>
                      <option value="electrical">⚡ كهرباء وإلكترونيات</option>
                      <option value="cooling">❄️ أنظمة تبريد وتكييف</option>
                      <option value="hydraulic">💧 هيدروليكية وروافع</option>
                      <option value="bodywork">🛠️ سمكرة وتعديل الهيكل</option>
                    </select>
                  </div>

                  {/* Interval Target Type */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1.5">طريقة الاحتساب والاستهداف:</label>
                    <select
                      value={formData.type}
                      onChange={(e: any) => setFormData(p => ({ ...p, type: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white"
                    >
                      <option value="time">📅 دورة فترية (بالأيام والتواريخ)</option>
                      <option value="mileage">📟 دورة عدادات (حسب الكيلومتراجات)</option>
                      <option value="both">⚖️ مزدوج (أيهما يسبق الآخر)</option>
                    </select>
                  </div>
                </div>

                {/* Variable Interval Settings */}
                <div className="bg-slate-50/70 dark:bg-slate-955 p-3.5 rounded-2xl border border-slate-150/40 dark:border-slate-850/80 space-y-3">
                  
                  {formData.type !== 'mileage' && (
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1">دورة التكرار المجدولة (كل كم يوم؟):</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={formData.intervalDays}
                          onChange={(e) => {
                            const days = Number(e.target.value);
                            // Auto estimate next due date from last date
                            const baseDate = new Date(formData.lastDoneDate);
                            baseDate.setDate(baseDate.getDate() + days);
                            setFormData(p => ({ 
                              ...p, 
                              intervalDays: days,
                              dueDate: baseDate.toISOString().split('T')[0]
                            }));
                          }}
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1">تاريخ الاستحقاق المحتمل القادم:</label>
                        <input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData(p => ({ ...p, dueDate: e.target.value }))}
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {formData.type !== 'time' && (
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1">تكرار العدادات المستهدف (كم كم؟):</label>
                        <input
                          type="number"
                          min="100"
                          required
                          value={formData.intervalMileage}
                          onChange={(e) => {
                            const mil = Number(e.target.value);
                            const nextDueMil = Number(formData.lastDoneMileage) + mil;
                            setFormData(p => ({ 
                              ...p, 
                              intervalMileage: mil,
                              dueMileage: nextDueMil
                            }));
                          }}
                          placeholder="مثال: 10000"
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1">تتم الصيانة عند العداد (كم):</label>
                        <input
                          type="number"
                          value={formData.dueMileage}
                          onChange={(e) => setFormData(p => ({ ...p, dueMileage: Number(e.target.value) }))}
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 border-t border-slate-250/25 dark:border-slate-800/40 pt-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1">آخر موعد صيانة سابقة فعالة:</label>
                      <input
                        type="date"
                        value={formData.lastDoneDate}
                        onChange={(e) => setFormData(p => ({ ...p, lastDoneDate: e.target.value }))}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-1">قراءة العداد لآخر صيانة (إن وجد):</label>
                      <input
                        type="number"
                        value={formData.lastDoneMileage}
                        onChange={(e) => setFormData(p => ({ ...p, lastDoneMileage: Number(e.target.value) }))}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes and description input */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1.5">ملاحظات توجيهية للفنيين (اختياري):</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                    placeholder="بيانات المواد المستخدمة، اللزوجة، الضمانات المصنعية..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none focus:border-brand-blue-500"
                  />
                </div>

                {/* Submit area */}
                <div className="pt-3 flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setIsEditing(false);
                      setSelectedScheduleId(null);
                    }}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    إلغاء التعديل
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    {isEditing ? 'حفظ تعديلات الجدول' : 'إضافة الجدول والبدء بالتتبع'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: COMPLETE AND CYCLE RESET MODAL */}
      <AnimatePresence>
        {showCompleteModal && completeTarget && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl p-6 overflow-hidden max-h-[92vh] flex flex-col text-right"
            >
              {/* Head */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-[#34d399] rounded-xl flex items-center justify-center">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">باقة توثيق وإنجاز دورة صيانة</h3>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500">إغلاق التذكير المنتهي وإطلاق دورة الاستحقاق الدورية القادمة</p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setShowCompleteModal(false);
                    setCompleteTarget(null);
                  }}
                  className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Form detail */}
              <form onSubmit={handleCompleteSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                
                {/* Visual context info */}
                <div className="bg-slate-50/80 dark:bg-slate-955 border border-slate-150/40 dark:border-slate-800/80 p-3.5 rounded-2xl">
                  <span className="block text-[9.5px] font-black text-slate-400 mb-1">صيانة مستهدفة للإنجاز:</span>
                  <h4 className="font-black text-xs text-slate-850 dark:text-white leading-tight">{completeTarget.title}</h4>
                  
                  <div className="flex gap-4 mt-2 text-[10px] text-slate-500 font-bold">
                    <span>التردد: {completeTarget.type === 'time' ? `كل ${completeTarget.intervalDays} يوم` : `كل ${completeTarget.intervalMileage?.toLocaleString()} كم`}</span>
                    <span>تاريخ الفرض: {completeTarget.dueDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Completion date */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1.5">تاريخ الإنجاز والتركيب الفعلي:</label>
                    <input
                      type="date"
                      required
                      value={completionData.date}
                      onChange={(e) => setCompletionData(p => ({ ...p, date: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold dark:text-white"
                    />
                  </div>

                  {/* Completion mileage */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1.5">قراءة العداد عند الإغلاق (كم):</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={completionData.odometer}
                      onChange={(e) => setCompletionData(p => ({ ...p, odometer: e.target.value }))}
                      placeholder="امثلة: 45000"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Total Cost */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1.5">تكلفة الصيانة والمشتريات (ر.س):</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-xs font-bold text-slate-400">ر.س</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={completionData.cost}
                        onChange={(e) => setCompletionData(p => ({ ...p, cost: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Workshop Executed */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1.5">الورشة الفنية المنفذة:</label>
                    <select
                      value={completionData.workshopId}
                      onChange={(e) => setCompletionData(p => ({ ...p, workshopId: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white"
                    >
                      <option value="WS-15">ورشة الميكانيك المركزي والصيانة الثقيلة</option>
                      <option value="WS-2">ورشة الإلكترونيات والأنظمة الكهربائية الحديثة</option>
                      <option value="WS-3">ورشة صيانة الهيدروليك والروافع والشبكات</option>
                    </select>
                  </div>
                </div>

                {/* Notes and feedback */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1.2">أهم الملاحظات الفنية المسجلة:</label>
                  <textarea
                    rows={2}
                    value={completionData.notes}
                    onChange={(e) => setCompletionData(p => ({ ...p, notes: e.target.value }))}
                    placeholder="اكتب مواد مستهلكة أو عيوباً تم تجاوزها أثناء فحص السلامة..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none focus:border-brand-blue-500"
                  />
                </div>

                {/* Auto Workorder creation option */}
                <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <input
                    id="auto-create-order-cb"
                    type="checkbox"
                    checked={completionData.createWorkOrder}
                    onChange={(e) => setCompletionData(p => ({ ...p, createWorkOrder: e.target.checked }))}
                    className="w-4 h-4 text-emerald-500 border-slate-300 rounded focus:ring-emerald-400"
                  />
                  <label htmlFor="auto-create-order-cb" className="text-[11px] font-black text-slate-700 dark:text-slate-300 cursor-pointer">
                    إنشاء وإضافة أمر ميكانيكي (Work Order) تلقائي لهذا التاريخ بسجل المركبة
                  </label>
                </div>

                {/* Submit */}
                <div className="pt-3.5 flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCompleteModal(false);
                      setCompleteTarget(null);
                    }}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    تثبيت الإنجاز وجدولة الدورة التالية
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
