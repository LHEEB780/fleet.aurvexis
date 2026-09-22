import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  AlertTriangle, 
  Clock, 
  Truck, 
  Wrench, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  ExternalLink, 
  Download, 
  Check, 
  CalendarPlus, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Vehicle } from '../types';
import { vehicles as staticVehicles } from '../data';
import { useLanguage } from '../services/LanguageContext';
import { playNotificationSound } from '../services/browserNotifications';
import { 
  CalendarEventDetails, 
  openGoogleCalendar, 
  downloadIcsCalendarFile, 
  openOutlookCalendar 
} from '../utils/calendarReminder';

export interface ApproachingMaintenanceItem {
  id: string;
  vehicleId: string;
  vehicleName: string;
  plateNumber?: string;
  vehicleType?: string;
  serviceTitle: string;
  category: string;
  dueDate: string;
  status: 'overdue' | 'due-soon' | 'approaching';
  daysLeft: number;
  hoursLeft: number;
  notes?: string;
  urgency: 'critical' | 'high' | 'medium';
}

// Fallback periodic schedules
export const DEFAULT_SCHEDULES = [
  {
    id: 'p-1',
    vehicleId: '1',
    title: 'تغيير زيت المحرك وباقة الفلاتر الدورية',
    category: 'mechanical',
    dueDate: '2026-05-20', // Overdue relative to 2026-05-23
    status: 'overdue',
    notes: 'صيانة وقائية دورية لمركبة الهايلوكس تشمل تبديل الزيت وفحص دورة الفرامل وضغط الإطارات.'
  },
  {
    id: 'p-2',
    vehicleId: '2',
    title: 'معايرة ميزان الإطارات وفحص عمق المداس للمحاور',
    category: 'mechanical',
    dueDate: '2026-05-15',
    status: 'overdue',
    notes: 'فحص ميكانيكي لسلامة الإطارات العشرة وتجنب التآكل المتسارع.'
  },
  {
    id: 'p-3',
    vehicleId: '3',
    title: 'فحص واختبار فعالية منظومة الفرامل والصيانة الوقائية لها',
    category: 'hydraulic',
    dueDate: '2026-05-29',
    status: 'due-soon',
    notes: 'يتضمن تغيير قماشات الفرامل والتأكد من مستوى زيت الهيدروليك.'
  },
  {
    id: 'p-4',
    vehicleId: '4',
    title: 'تنظيف وغسيل فلاتر التكييف ومروحة التبريد المساعدة',
    category: 'cooling',
    dueDate: '2026-05-31',
    status: 'active',
    notes: 'صيانة وقائية لضمان عمل رافعة الشغل دون توقف في فترات الصيف الحرجة.'
  }
];

/**
 * Helper to check if a vehicle belongs to the driver (Captain Khaled Al-Kaabi)
 */
export function isDriverAssignedVehicle(vehicleId: string, vehicleName?: string, plateNumber?: string): boolean {
  const vId = String(vehicleId).toLowerCase();
  const vName = (vehicleName || '').toLowerCase();
  const vPlate = (plateNumber || '').toLowerCase().replace(/\s+/g, '');

  return (
    vId === '1' ||
    vId === 'toyota-hilux' ||
    vId === 'u-driver' ||
    vPlate.includes('٧٧٦') ||
    vPlate.includes('776') ||
    vPlate.includes('1234') ||
    vPlate.includes('أبج') ||
    vName.includes('هايلوكس') ||
    vName.includes('هيلوكس') ||
    vName.includes('hilux') ||
    vName.includes('بيك آب')
  );
}

/**
 * Scans approaching and overdue periodic maintenance items
 */
export function scanMaintenanceAlerts(options?: {
  filterDriverVehicle?: boolean;
  systemDateOverride?: string;
}): ApproachingMaintenanceItem[] {
  const filterDriver = options?.filterDriverVehicle || false;
  
  // 1. Get vehicles list
  let vehiclesList: Vehicle[] = staticVehicles;
  if (typeof window !== 'undefined') {
    const vehiclesRaw = localStorage.getItem('fleet_vehicles_v3') || localStorage.getItem('fleet_vehicles_v2');
    if (vehiclesRaw) {
      try {
        const parsed = JSON.parse(vehiclesRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          vehiclesList = parsed;
        }
      } catch (e) {}
    }
  }

  // 2. Get periodic schedules
  let schedulesList: any[] = DEFAULT_SCHEDULES;
  if (typeof window !== 'undefined') {
    const schedulesRaw = localStorage.getItem('fleet_periodic_schedules');
    if (schedulesRaw) {
      try {
        const parsed = JSON.parse(schedulesRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If driver vehicle schedule p-1 isn't in parsed, merge default p-1
          const hasP1 = parsed.some((s: any) => String(s.vehicleId) === '1' || s.id === 'p-1');
          if (!hasP1) {
            schedulesList = [...parsed, DEFAULT_SCHEDULES[0]];
          } else {
            schedulesList = parsed;
          }
        }
      } catch (e) {}
    }
  }

  // 3. Determine reference date
  const refDate = options?.systemDateOverride 
    ? new Date(options.systemDateOverride) 
    : new Date('2026-05-23T09:00:00');
  const refTimestamp = refDate.getTime();

  const detected: ApproachingMaintenanceItem[] = [];

  schedulesList.forEach((sched: any) => {
    if (sched.status === 'paused') return;

    const v = vehiclesList.find(item => String(item.id) === String(sched.vehicleId)) || {
      id: String(sched.vehicleId),
      name: String(sched.vehicleId) === '1' ? 'تويوتا بيك أب - هايلوكس HD' : `مركبة #${sched.vehicleId}`,
      plateNumber: String(sched.vehicleId) === '1' ? 'ب ل ط ٧٧٦' : '',
      type: 'مركبة أسطول'
    };

    // If driver filtering is enabled, check if vehicle belongs to the driver
    if (filterDriver) {
      const isMine = isDriverAssignedVehicle(sched.vehicleId, v.name, v.plateNumber);
      if (!isMine) return; // Ignore any other vehicles completely
    }

    const dueDateObj = new Date(sched.dueDate + 'T09:00:00');
    const diffMs = dueDateObj.getTime() - refTimestamp;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

    // Overdue condition
    if (sched.status === 'overdue' || diffDays < 0) {
      detected.push({
        id: sched.id,
        vehicleId: String(sched.vehicleId),
        vehicleName: String(sched.vehicleId) === '1' && filterDriver ? 'تويوتا هيلوكس HD (مركبتك المسندة)' : v.name,
        plateNumber: String(sched.vehicleId) === '1' ? (v.plateNumber || 'ب ل ط ٧٧٦') : v.plateNumber,
        vehicleType: v.type,
        serviceTitle: sched.title,
        category: sched.category || 'mechanical',
        dueDate: sched.dueDate,
        status: 'overdue',
        daysLeft: diffDays,
        hoursLeft: diffHours,
        notes: sched.notes,
        urgency: 'critical'
      });
    } 
    // Due soon condition (within 48 hours or status === 'due-soon')
    else if (sched.status === 'due-soon' || (diffDays >= 0 && diffDays <= 2)) {
      detected.push({
        id: sched.id,
        vehicleId: String(sched.vehicleId),
        vehicleName: String(sched.vehicleId) === '1' && filterDriver ? 'تويوتا هيلوكس HD (مركبتك المسندة)' : v.name,
        plateNumber: String(sched.vehicleId) === '1' ? (v.plateNumber || 'ب ل ط ٧٧٦') : v.plateNumber,
        vehicleType: v.type,
        serviceTitle: sched.title,
        category: sched.category || 'mechanical',
        dueDate: sched.dueDate,
        status: 'due-soon',
        daysLeft: diffDays,
        hoursLeft: diffHours,
        notes: sched.notes,
        urgency: 'high'
      });
    } 
    // Approaching within 7 days
    else if (diffDays > 2 && diffDays <= 8) {
      detected.push({
        id: sched.id,
        vehicleId: String(sched.vehicleId),
        vehicleName: String(sched.vehicleId) === '1' && filterDriver ? 'تويوتا هيلوكس HD (مركبتك المسندة)' : v.name,
        plateNumber: String(sched.vehicleId) === '1' ? (v.plateNumber || 'ب ل ط ٧٧٦') : v.plateNumber,
        vehicleType: v.type,
        serviceTitle: sched.title,
        category: sched.category || 'mechanical',
        dueDate: sched.dueDate,
        status: 'approaching',
        daysLeft: diffDays,
        hoursLeft: diffHours,
        notes: sched.notes,
        urgency: 'medium'
      });
    }
  });

  // Sort by urgency: critical first, then high, then medium
  const urgencyOrder = { critical: 0, high: 1, medium: 2 };
  detected.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency] || a.daysLeft - b.daysLeft);

  return detected;
}

export interface MaintenanceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ApproachingMaintenanceItem[];
  filterDriverVehicle?: boolean;
  onNavigateToTab?: (tab: string) => void;
  viewedAlertIds?: string[];
  onMarkAllAsRead?: () => void;
  onResetUnread?: () => void;
}

/**
 * Maintenance Alert Modal Dialog (shown ONLY when clicking the Alert Triangle)
 */
export const MaintenanceAlertModal: React.FC<MaintenanceAlertModalProps> = ({
  isOpen,
  onClose,
  items,
  filterDriverVehicle = false,
  onNavigateToTab,
  viewedAlertIds = [],
  onMarkAllAsRead,
  onResetUnread
}) => {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);
  const [calendarAddedToast, setCalendarAddedToast] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close calendar dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setCalendarMenuOpen(false);
      }
    };
    if (calendarMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [calendarMenuOpen]);

  // Prevent background page from scrolling or jumping when modal is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  // Handle all-clear / zero alerts state
  if (items.length === 0) {
    return createPortal(
      <div 
        className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md overflow-y-auto overscroll-contain p-3 sm:p-4 flex items-center justify-center animate-in fade-in duration-200"
        onClick={onClose}
        dir={dir}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md my-auto flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl border bg-slate-900/98 border-emerald-500/40 shadow-emerald-950/50 text-white"
        >
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {language === 'ar' ? 'جميع مواعيد الصيانة الدورية منتظمة ومكتملة' : 'All Periodic Maintenance on Schedule'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                {language === 'ar' 
                  ? 'لا توجد حالياً أي مواعيد صيانة متأخرة أو وشيكة الاستحقاق. كافة المركبات تعمل بكفاءة وفق الخطة الزمنية المعتمدة.'
                  : 'There are no overdue or pending maintenance alerts. All fleet vehicles are fully operational according to schedule.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateToTab) {
                    onNavigateToTab(filterDriverVehicle ? 'history' : 'periodic-maintenance');
                  } else {
                    window.dispatchEvent(new CustomEvent('switch-app-tab', { detail: 'periodic-maintenance' }));
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-md transition-all cursor-pointer"
              >
                {language === 'ar' ? 'عرض جدول الصيانة الدورية' : 'View Maintenance Schedule'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>,
      document.body
    );
  }

  const currentItem = items[currentIndex] || items[0];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % items.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
  };

  const getCalendarEventDetails = (item: ApproachingMaintenanceItem): CalendarEventDetails => {
    return {
      id: item.id,
      title: item.serviceTitle,
      serviceTitle: item.serviceTitle,
      vehicleName: item.vehicleName,
      plateNumber: item.plateNumber,
      dueDate: item.dueDate,
      dueTime: '09:00',
      durationMinutes: 120,
      category: item.category,
      location: 'ورشة الصيانة المركزية - Fleet Aurvexis',
      notes: item.notes
    };
  };

  const triggerSuccessToast = (msg: string) => {
    playNotificationSound('success');
    setCalendarAddedToast(msg);
    setTimeout(() => {
      setCalendarAddedToast(null);
    }, 4000);
  };

  const handleAddToGoogleCalendar = () => {
    const event = getCalendarEventDetails(currentItem);
    openGoogleCalendar(event);
    setCalendarMenuOpen(false);
    triggerSuccessToast(language === 'ar' ? 'تم فتح تقويم Google بنجاح 📅' : 'Google Calendar opened successfully 📅');
  };

  const handleDownloadIcs = () => {
    const event = getCalendarEventDetails(currentItem);
    downloadIcsCalendarFile(event);
    setCalendarMenuOpen(false);
    triggerSuccessToast(language === 'ar' ? 'تم تحميل ملف التقويم (.ics) لـ Apple/Outlook 📥' : 'Calendar file (.ics) downloaded 📥');
  };

  const handleAddToOutlook = () => {
    const event = getCalendarEventDetails(currentItem);
    openOutlookCalendar(event);
    setCalendarMenuOpen(false);
    triggerSuccessToast(language === 'ar' ? 'تم فتح تقويم Outlook بنجاح 📅' : 'Outlook Calendar opened successfully 📅');
  };

  const handleNavigateToService = () => {
    onClose();
    if (onNavigateToTab) {
      onNavigateToTab(filterDriverVehicle ? 'history' : 'periodic-maintenance');
    } else {
      window.dispatchEvent(new CustomEvent('switch-app-tab', { detail: 'periodic-maintenance' }));
    }
  };

  // Category Icon & Label
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'hydraulic':
        return { label: language === 'ar' ? 'هيدروليك وفرامل' : 'Hydraulic & Brakes', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40' };
      case 'electrical':
        return { label: language === 'ar' ? 'كهرباء وحساسات' : 'Electrical', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40' };
      case 'cooling':
        return { label: language === 'ar' ? 'تبريد وتكييف' : 'Cooling & AC', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/40' };
      case 'mechanical':
      default:
        return { label: language === 'ar' ? 'ميكانيكا ومحركات' : 'Mechanical', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40' };
    }
  };

  const catBadge = getCategoryBadge(currentItem.category);
  const isOverdue = currentItem.status === 'overdue';
  const isDueSoon = currentItem.status === 'due-soon';

  const statusBadge = isOverdue ? {
    bg: 'bg-rose-600 text-white',
    text: language === 'ar' ? `متأخر منذ ${Math.abs(currentItem.daysLeft)} أيام` : `Overdue by ${Math.abs(currentItem.daysLeft)} days`,
    icon: <AlertTriangle size={13} className="shrink-0 animate-bounce" />,
  } : isDueSoon ? {
    bg: 'bg-amber-500 text-slate-950 font-black',
    text: language === 'ar' 
      ? (currentItem.daysLeft === 0 ? 'مستحق اليوم ⚡' : currentItem.daysLeft === 1 ? 'مستحق غداً ⏰' : `مستحق خلال ${currentItem.daysLeft} يوم`)
      : `Due in ${currentItem.daysLeft} days`,
    icon: <Clock size={13} className="shrink-0 animate-pulse" />,
  } : {
    bg: 'bg-indigo-600 text-white',
    text: language === 'ar' ? `مستحق خلال ${currentItem.daysLeft} أيام` : `Due in ${currentItem.daysLeft} days`,
    icon: <Calendar size={13} className="shrink-0" />,
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md overflow-y-auto overscroll-contain p-3 sm:p-4 flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
      dir={dir}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg my-auto max-h-[88vh] flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl border transition-all ${
          isOverdue 
            ? 'bg-slate-900/98 border-rose-500/40 shadow-rose-950/50 text-white' 
            : 'bg-slate-900/98 border-purple-500/40 shadow-purple-950/50 text-white'
        }`}
      >
        {/* Top Accent Subtle Bar */}
        <div className={`h-1 w-full shrink-0 ${isOverdue ? 'bg-rose-500/80' : 'bg-slate-600'}`} />

        {/* Header: Title, Counter & Close (pinned at top of modal) */}
        <div className="shrink-0 px-4 py-3 sm:px-5 sm:py-3.5 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-900/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOverdue ? 'bg-rose-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOverdue ? 'bg-rose-500' : 'bg-amber-500'}`} />
            </span>
            
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-sm font-black text-white truncate">
                {filterDriverVehicle
                  ? (language === 'ar' ? 'تنبيه صيانة لمركبتك المسندة' : 'Assigned Vehicle Maintenance Alert')
                  : (language === 'ar' ? 'تنبيه موعد صيانة دورية وشيك' : 'Approaching Periodic Maintenance')}
              </h3>
              {items.length > 1 && (
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 shrink-0">
                  {currentIndex + 1} / {items.length}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Carousel prev / next if multiple items */}
            {items.length > 1 && (
              <div className="flex items-center gap-0.5 bg-black/40 rounded-xl p-0.5 border border-white/10">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title={language === 'ar' ? 'التنبيه السابق' : 'Previous'}
                >
                  {isRtl ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title={language === 'ar' ? 'التنبيه التالي' : 'Next'}
                >
                  {isRtl ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
                </button>
              </div>
            )}

            {/* Dismiss / Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-rose-500/30 text-slate-300 hover:text-rose-200 transition-colors cursor-pointer"
              title={language === 'ar' ? 'إغلاق النافذة' : 'Close Window'}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-3.5 sm:p-5 space-y-3 sm:space-y-3.5 overscroll-contain">
          {/* Vehicle & Urgency Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
                isOverdue 
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                <Truck size={22} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm sm:text-base font-black text-white truncate">
                  {currentItem.vehicleName}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  {currentItem.plateNumber && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-white/10 text-slate-200 rounded-md border border-white/10 tracking-wider">
                      {currentItem.plateNumber}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 truncate">
                    {currentItem.vehicleType || (language === 'ar' ? 'مركبة أسطول' : 'Fleet Vehicle')}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Pill & Read/Unread State Indicator */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-black border border-white/15 shadow-sm ${statusBadge.bg}`}>
                {statusBadge.icon}
                <span>{statusBadge.text}</span>
              </div>
              {!viewedAlertIds.includes(currentItem.id) ? (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  <span>{language === 'ar' ? 'جديد • غير مقروء' : 'New • Unread'}</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-400/40 text-purple-300 bg-purple-950/30 flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-purple-400" />
                  <span>{language === 'ar' ? 'مقروء سابقاً' : 'Viewed'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Maintenance Task Information Box */}
          <div className="p-3.5 sm:p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[10.5px] font-black px-2 py-0.5 rounded-md border ${catBadge.color}`}>
                {catBadge.label}
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-300 font-bold">
                <Calendar size={13} className="text-slate-400" />
                <span>{language === 'ar' ? 'الاستحقاق:' : 'Due Date:'}</span>
                <span className="font-mono text-white font-black">{currentItem.dueDate}</span>
              </div>
            </div>

            <h5 className="text-xs sm:text-sm font-black text-white leading-relaxed pt-0.5">
              {currentItem.serviceTitle}
            </h5>

            {currentItem.notes && (
              <p className="text-xs text-slate-300 leading-relaxed border-t border-white/10 pt-2 mt-1">
                {currentItem.notes}
              </p>
            )}
          </div>

          {/* Actions: Full Purple Gradient Primary Button */}
          <div className="space-y-2 pt-0.5">
            {/* Primary: Add to Calendar - Full Purple Gradient ("البنفسجي المتدرج كامل زر") */}
            <div className="relative" ref={menuRef}>
              <div className="flex items-stretch rounded-xl sm:rounded-2xl shadow-lg shadow-purple-950/50 border border-purple-400/40 overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 transition-all">
                <button
                  type="button"
                  onClick={handleAddToGoogleCalendar}
                  className="flex-1 py-2.5 sm:py-3 px-3.5 sm:px-4 flex items-center justify-center gap-2 text-white text-xs font-black hover:bg-white/10 active:scale-[0.99] transition-all cursor-pointer select-none"
                >
                  <CalendarPlus size={16} className="text-purple-200 shrink-0" />
                  <span>{language === 'ar' ? 'إضافة التذكير إلى التقويم' : 'Add Reminder to Calendar'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCalendarMenuOpen(!calendarMenuOpen)}
                  className="px-3 border-r border-white/20 hover:bg-white/20 text-white transition-colors flex items-center justify-center cursor-pointer"
                  title={language === 'ar' ? 'خيارات التقويم (Google / Apple / Outlook)' : 'Calendar Options'}
                >
                  <span className="text-[10px] font-bold">▼</span>
                </button>
              </div>

              {/* Calendar Dropup Menu */}
              <AnimatePresence>
                {calendarMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    className="absolute bottom-full mb-2 left-0 right-0 bg-slate-900/98 backdrop-blur-2xl border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1"
                  >
                    <div className="px-3 py-1.5 text-xs font-bold text-slate-400 border-b border-white/10 flex items-center justify-between">
                      <span>{language === 'ar' ? 'اختر تطبيق التقويم:' : 'Select Calendar App:'}</span>
                      <Sparkles size={12} className="text-slate-400" />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddToGoogleCalendar}
                      className="w-full text-right px-3.5 py-2.5 rounded-xl hover:bg-slate-800 text-white flex items-center justify-between text-xs font-bold transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-800 text-blue-400 flex items-center justify-center text-xs font-bold border border-slate-700">G</span>
                        <span>Google Calendar (مباشر)</span>
                      </div>
                      <ExternalLink size={13} className="text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadIcs}
                      className="w-full text-right px-3.5 py-2.5 rounded-xl hover:bg-slate-800 text-white flex items-center justify-between text-xs font-bold transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-800 text-emerald-400 flex items-center justify-center text-xs font-bold border border-slate-700">iCal</span>
                        <span>Apple Calendar / ملف تقويم (.ics)</span>
                      </div>
                      <Download size={13} className="text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={handleAddToOutlook}
                      className="w-full text-right px-3.5 py-2.5 rounded-xl hover:bg-slate-800 text-white flex items-center justify-between text-xs font-bold transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-800 text-cyan-400 flex items-center justify-center text-xs font-bold border border-slate-700">O</span>
                        <span>Microsoft Outlook Web</span>
                      </div>
                      <ExternalLink size={13} className="text-slate-400" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Secondary: Open Section - Subdued button */}
            <button
              type="button"
              onClick={handleNavigateToService}
              className="w-full py-2.5 px-4 rounded-xl sm:rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 active:bg-slate-750 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Wrench size={14} className="text-slate-400" />
              <span>
                {filterDriverVehicle
                  ? (language === 'ar' ? 'عرض سجل الفحص الميداني والصيانة' : 'View Vehicle Maintenance Record')
                  : (language === 'ar' ? 'عرض جدول الصيانة الدورية في النظام' : 'Open Periodic Maintenance Schedule')}
              </span>
            </button>
          </div>

          {/* Calendar Added Toast */}
          <AnimatePresence>
            {calendarAddedToast && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2"
              >
                <Check size={16} className="shrink-0 text-emerald-400" />
                <span className="flex-1">{calendarAddedToast}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Note (pinned at bottom of modal) */}
        <div className="shrink-0 px-4 py-2.5 sm:px-5 sm:py-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-medium bg-slate-900/90 gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-purple-300 font-bold">
            <CheckCircle2 size={13} className="text-purple-400 shrink-0" />
            <span>
              {language === 'ar' 
                ? 'الحالات: بنفسجي متدرج (غير مقروء) • إطار بنفسجي (مقروء) • أبيض (لا توجد تنبيهات)' 
                : 'States: Gradient (Unread) • Outline (Read) • Neutral (All Clear)'}
            </span>
          </span>
          <div className="flex items-center gap-2">
            {onResetUnread && (
              <button
                type="button"
                onClick={onResetUnread}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer text-[10.5px] font-bold border border-white/10"
                title={language === 'ar' ? 'إعادة ضبط التنبيهات كغير مقروءة لاختبار الزر المتدرج' : 'Reset alerts as unread to test gradient state'}
              >
                {language === 'ar' ? 'تعيين كغير مقروء' : 'Mark as Unread'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 rounded-lg transition-colors cursor-pointer font-bold text-xs"
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export interface MaintenanceAlertTriangleButtonProps {
  filterDriverVehicle?: boolean;
  onNavigateToTab?: (tab: string) => void;
  className?: string;
}

/**
 * Maintenance Alert Triangle Button in the top header:
 * - State 1 (New / Unread): Full Gradient Purple ("لون بنفسجي متدرج كامل الزر")
 * - State 2 (Old / Read): Purple Outline ("إطار باللون البنفسجي")
 * - State 3 (All Clear / 0 alerts): Calm Neutral White ("أبيض هادئ")
 * - Compact & sleek sizing (أصغر حجماً وتناسقاً)
 */
export const MaintenanceAlertTriangleButton: React.FC<MaintenanceAlertTriangleButtonProps> = ({
  filterDriverVehicle = false,
  onNavigateToTab,
  className = ''
}) => {
  const { language } = useLanguage();
  const [items, setItems] = useState<ApproachingMaintenanceItem[]>([]);
  const [viewedAlertIds, setViewedAlertIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const storageKey = filterDriverVehicle ? 'fleet_driver_alerts_viewed_ids' : 'fleet_alerts_viewed_ids';

  const refreshAlerts = () => {
    const detected = scanMaintenanceAlerts({ filterDriverVehicle });
    setItems(detected);

    try {
      const savedStr = localStorage.getItem(storageKey);
      const viewedIds: string[] = savedStr ? JSON.parse(savedStr) : [];
      setViewedAlertIds(viewedIds);
    } catch (e) {
      setViewedAlertIds([]);
    }
  };

  useEffect(() => {
    refreshAlerts();

    const handleUpdate = () => refreshAlerts();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('fleet-periodic-updated', handleUpdate);
    window.addEventListener('maintenance-alerts-refresh', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('fleet-periodic-updated', handleUpdate);
      window.removeEventListener('maintenance-alerts-refresh', handleUpdate);
    };
  }, [filterDriverVehicle]);

  const unreadItems = items.filter(item => !viewedAlertIds.includes(item.id));
  const unreadCount = unreadItems.length;
  const totalCount = items.length;
  const hasUnread = unreadCount > 0;

  // 3 Color States:
  // 1) 'unread': Unread alerts exist -> Full purple gradient button ("لون بنفسجي متدرج كامل الزر")
  // 2) 'read': All current alerts viewed -> Purple outline button ("إطار باللون البنفسجي")
  // 3) 'all-clear': No alerts pending (0 alerts) -> Clean neutral white/slate button ("أبيض هادئ")
  const stateMode: 'unread' | 'read' | 'all-clear' = 
    hasUnread 
      ? 'unread' 
      : totalCount > 0 
        ? 'read' 
        : 'all-clear';

  const handleClick = () => {
    // 1. If there are unread items, immediately mark all as read and switch to State 2 (purple outline)
    if (hasUnread) {
      try {
        const savedStr = localStorage.getItem(storageKey);
        let currentViewed: string[] = savedStr ? JSON.parse(savedStr) : [];
        items.forEach(item => {
          if (!currentViewed.includes(item.id)) {
            currentViewed.push(item.id);
          }
        });
        localStorage.setItem(storageKey, JSON.stringify(currentViewed));
        setViewedAlertIds(currentViewed);
      } catch (e) {}
    }

    // 2. Open the modal dialog
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        type="button"
        id={filterDriverVehicle ? 'driver-maintenance-alert-triangle-btn' : 'fleet-maintenance-alert-triangle-btn'}
        onClick={handleClick}
        className={`h-7.5 sm:h-8 px-2 sm:px-2.5 flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl transition-all cursor-pointer shrink-0 active:scale-95 relative ${
          stateMode === 'unread'
            ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/50 shadow-md shadow-purple-600/30 ring-1 ring-purple-400/40'
            : stateMode === 'read'
              ? 'bg-white dark:bg-slate-900 hover:bg-purple-50/70 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-2 border-purple-600 dark:border-purple-400 shadow-xs'
              : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 shadow-2xs'
        } ${className}`}
        title={
          stateMode === 'unread'
            ? (language === 'ar' 
                ? `يوجد ${unreadCount} تنبيه صيانة جديد غير مقروء (إجمالي ${totalCount}) - انقر للعرض` 
                : `${unreadCount} new unread maintenance alerts (${totalCount} total) - Click to view`)
            : stateMode === 'read'
              ? (language === 'ar' 
                  ? `تنبيهات صيانة دورية (${totalCount}) - تم الاطلاع عليها مسبقاً` 
                  : `Maintenance alerts (${totalCount}) - Previously viewed`)
              : (language === 'ar'
                  ? 'جدول الصيانة منتظم (لا توجد تنبيهات معلقة) - انقر للمراجعة'
                  : 'Maintenance on schedule (0 alerts) - Click to review')
        }
      >
        <AlertTriangle 
          size={13.5} 
          className={`shrink-0 ${
            stateMode === 'unread' 
              ? 'text-white animate-bounce' 
              : stateMode === 'read' 
                ? 'text-purple-600 dark:text-purple-400' 
                : 'text-slate-400 dark:text-slate-500'
          }`} 
        />
        <span className={`text-[10px] sm:text-[10.5px] font-black leading-none ${
          stateMode === 'unread' 
            ? 'text-white' 
            : stateMode === 'read' 
              ? 'text-purple-700 dark:text-purple-300' 
              : 'text-slate-600 dark:text-slate-400'
        }`}>
          {totalCount}
        </span>

        {/* Pulsating dot indicator strictly when there are unread alerts */}
        {stateMode === 'unread' && (
          <span className="absolute -top-1 -right-1 sm:-top-0.5 sm:-right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 border border-white dark:border-slate-900"></span>
          </span>
        )}
      </button>

      {/* Alert Modal Dialog */}
      <MaintenanceAlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        items={items}
        filterDriverVehicle={filterDriverVehicle}
        onNavigateToTab={onNavigateToTab}
        viewedAlertIds={viewedAlertIds}
        onMarkAllAsRead={() => {
          try {
            const allIds = items.map(it => it.id);
            localStorage.setItem(storageKey, JSON.stringify(allIds));
            setViewedAlertIds(allIds);
          } catch (e) {}
        }}
        onResetUnread={() => {
          try {
            localStorage.removeItem(storageKey);
            setViewedAlertIds([]);
          } catch (e) {}
        }}
      />
    </>
  );
};

// Backwards-compatible export - notice it DOES NOT auto-render any intrusive popup!
export const MaintenancePushNotificationCorner: React.FC<{
  onNavigateToTab?: (tab: string) => void;
  systemDateOverride?: string;
  isOpen?: boolean;
  onClose?: () => void;
}> = ({ onNavigateToTab, isOpen = false, onClose = () => {} }) => {
  const [items, setItems] = useState<ApproachingMaintenanceItem[]>([]);

  useEffect(() => {
    setItems(scanMaintenanceAlerts());
  }, []);

  if (!isOpen) return null;

  return (
    <MaintenanceAlertModal
      isOpen={isOpen}
      onClose={onClose}
      items={items}
      onNavigateToTab={onNavigateToTab}
    />
  );
};

export default MaintenancePushNotificationCorner;
