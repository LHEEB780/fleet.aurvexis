import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Bell, 
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
  Maximize2, 
  Minimize2, 
  ShieldAlert,
  Volume2
} from 'lucide-react';
import { Vehicle } from '../types';
import { vehicles as staticVehicles } from '../data';
import { useLanguage } from '../services/LanguageContext';
import { 
  sendBrowserNotification, 
  playNotificationSound,
  getNotificationSettings
} from '../services/browserNotifications';
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

interface MaintenancePushNotificationCornerProps {
  onNavigateToTab?: (tab: string) => void;
  systemDateOverride?: string; // Optional test override
}

// Fallback initial periodic schedules if localStorage is empty
const DEFAULT_SCHEDULES = [
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

export const MaintenancePushNotificationCorner: React.FC<MaintenancePushNotificationCornerProps> = ({
  onNavigateToTab,
  systemDateOverride
}) => {
  const { language, dir } = useLanguage();
  const isRtl = dir === 'rtl';

  const [items, setItems] = useState<ApproachingMaintenanceItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);
  const [calendarAddedToast, setCalendarAddedToast] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close calendar menu on outside click
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
    }
  }, [calendarMenuOpen]);

  // Scan & calculate approaching periodic maintenance
  const scanApproachingMaintenance = () => {
    // 1. Get vehicles list
    const vehiclesRaw = localStorage.getItem('fleet_vehicles_v3') || localStorage.getItem('fleet_vehicles_v2');
    let vehiclesList: Vehicle[] = staticVehicles;
    if (vehiclesRaw) {
      try {
        vehiclesList = JSON.parse(vehiclesRaw);
      } catch (e) {}
    }

    // 2. Get periodic schedules
    const schedulesRaw = localStorage.getItem('fleet_periodic_schedules');
    let schedulesList: any[] = DEFAULT_SCHEDULES;
    if (schedulesRaw) {
      try {
        const parsed = JSON.parse(schedulesRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          schedulesList = parsed;
        }
      } catch (e) {}
    }

    // 3. Determine reference date
    // Note: The simulated fleet context operates around late May 2026 (e.g. 2026-05-23),
    // or systemDateOverride if provided, with seamless fallback.
    const refDate = systemDateOverride ? new Date(systemDateOverride) : new Date('2026-05-23T09:00:00');
    const refTimestamp = refDate.getTime();

    const detected: ApproachingMaintenanceItem[] = [];

    schedulesList.forEach((sched: any) => {
      if (sched.status === 'paused') return;

      const v = vehiclesList.find(item => item.id === String(sched.vehicleId)) || {
        name: `مركبة #${sched.vehicleId}`,
        plateNumber: '',
        type: 'مركبة أسطول'
      };

      const dueDateObj = new Date(sched.dueDate + 'T09:00:00');
      const diffMs = dueDateObj.getTime() - refTimestamp;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

      // Overdue condition
      if (sched.status === 'overdue' || diffDays < 0) {
        detected.push({
          id: sched.id,
          vehicleId: sched.vehicleId,
          vehicleName: v.name,
          plateNumber: v.plateNumber,
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
          vehicleId: sched.vehicleId,
          vehicleName: v.name,
          plateNumber: v.plateNumber,
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
          vehicleId: sched.vehicleId,
          vehicleName: v.name,
          plateNumber: v.plateNumber,
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

    setItems(detected);

    // Trigger native browser notification and sound chime on first load if new items exist
    if (detected.length > 0) {
      const notifiedStr = localStorage.getItem('fleet_corner_pms_dispatched') || '[]';
      let notifiedIds: string[] = [];
      try {
        notifiedIds = JSON.parse(notifiedStr);
      } catch (e) {}

      const unnotified = detected.find(item => !notifiedIds.includes(item.id));
      if (unnotified) {
        // Mark as dispatched
        notifiedIds.push(unnotified.id);
        localStorage.setItem('fleet_corner_pms_dispatched', JSON.stringify(notifiedIds));

        // Trigger native push & audio chime
        const isOverdue = unnotified.status === 'overdue';
        const titleText = isOverdue
          ? `⚠️ تنبيه صيانة دورية متأخرة: ${unnotified.vehicleName}`
          : `⏰ اقتراب موعد صيانة دورية: ${unnotified.vehicleName}`;
        
        const bodyText = `الخدمة: ${unnotified.serviceTitle}\nتاريخ الاستحقاق: ${unnotified.dueDate}\nيرجى إضافة التذكير إلى التقويم وحجز موعد الورشة.`;

        sendBrowserNotification({
          titleAr: titleText,
          titleEn: titleText,
          bodyAr: bodyText,
          bodyEn: bodyText,
          category: 'periodic_due',
          priority: isOverdue ? 'urgent' : 'high',
          sound: isOverdue ? 'urgent' : 'alert'
        }).catch(() => {});
      }
    }
  };

  useEffect(() => {
    scanApproachingMaintenance();

    // Listen to updates from other tabs / storage
    const handleStorage = () => scanApproachingMaintenance();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('fleet-periodic-updated', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('fleet-periodic-updated', handleStorage);
    };
  }, [systemDateOverride]);

  if (items.length === 0 || !isVisible) {
    return null;
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

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  const handleSnooze = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(true);
  };

  // Convert current item to calendar event details
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

  const triggerSuccessToast = (msg: string) => {
    playNotificationSound('success');
    setCalendarAddedToast(msg);
    setTimeout(() => {
      setCalendarAddedToast(null);
    }, 4500);
  };

  const handleNavigateToService = () => {
    if (onNavigateToTab) {
      onNavigateToTab('periodic-maintenance');
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

  // Status visual attributes
  const isOverdue = currentItem.status === 'overdue';
  const isDueSoon = currentItem.status === 'due-soon';

  const statusBadge = isOverdue ? {
    bg: 'bg-rose-600 text-white',
    text: language === 'ar' ? `متأخر منذ ${Math.abs(currentItem.daysLeft)} أيام` : `Overdue by ${Math.abs(currentItem.daysLeft)} days`,
    icon: <AlertTriangle size={13} className="shrink-0 animate-bounce" />,
    ring: 'border-rose-500/50 shadow-rose-950/20'
  } : isDueSoon ? {
    bg: 'bg-amber-500 text-slate-950 font-black',
    text: language === 'ar' 
      ? (currentItem.daysLeft === 0 ? 'مستحق اليوم ⚡' : currentItem.daysLeft === 1 ? 'مستحق غداً ⏰' : `مستحق خلال ${currentItem.daysLeft} يوم`)
      : `Due in ${currentItem.daysLeft} days`,
    icon: <Clock size={13} className="shrink-0 animate-pulse" />,
    ring: 'border-amber-500/50 shadow-amber-950/20'
  } : {
    bg: 'bg-indigo-600 text-white',
    text: language === 'ar' ? `مستحق خلال ${currentItem.daysLeft} أيام` : `Due in ${currentItem.daysLeft} days`,
    icon: <Calendar size={13} className="shrink-0" />,
    ring: 'border-indigo-500/40 shadow-indigo-950/20'
  };

  return (
    <div 
      className={`fixed bottom-4 sm:bottom-6 ${isRtl ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-50 transition-all duration-300 pointer-events-auto`}
      dir={dir}
    >
      <AnimatePresence mode="wait">
        {/* Minimized Floating Pill State */}
        {isMinimized ? (
          <motion.button
            key="minimized-pill"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-full shadow-2xl border-2 border-indigo-500/60 hover:border-indigo-400 hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-xl group"
            title={language === 'ar' ? 'انقر لتوسيع تنبيه الصيانة الدورية' : 'Click to expand maintenance reminder'}
          >
            <div className="relative">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block animate-ping absolute -top-0.5 -right-0.5" />
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block" />
            </div>
            <div className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center text-indigo-300">
              <Bell size={13} className="animate-pulse" />
            </div>
            <div className="text-right font-sans">
              <p className="text-xs font-black tracking-tight leading-none text-white">
                {language === 'ar' ? `تنبيه صيانة دورية (${items.length})` : `Maintenance Due (${items.length})`}
              </p>
              <span className="text-[10px] text-indigo-300 font-bold leading-none">
                {currentItem.vehicleName}
              </span>
            </div>
            <Maximize2 size={13} className="text-slate-400 group-hover:text-white transition-colors mr-1" />
          </motion.button>
        ) : (
          /* Full Expanded Corner Card */
          <motion.div
            key="expanded-card"
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`w-[360px] sm:w-[410px] max-w-[calc(100vw-2rem)] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl border transition-all duration-300 ${
              isOverdue 
                ? 'bg-slate-900/95 dark:bg-slate-900/98 border-rose-500/50 shadow-rose-950/40 text-white' 
                : 'bg-slate-900/95 dark:bg-slate-900/98 border-indigo-500/40 shadow-indigo-950/40 text-white'
            }`}
          >
            {/* Top Accent Glowing Bar */}
            <div className={`h-1.5 w-full ${isOverdue ? 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400'}`} />

            {/* Header: Title, Counter & Controls */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2 bg-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOverdue ? 'bg-rose-400' : 'bg-amber-400'}`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOverdue ? 'bg-rose-500' : 'bg-amber-500'}`} />
                </span>
                
                <div className="flex items-center gap-1.5 min-w-0">
                  <h4 className="text-xs font-black text-white truncate">
                    {language === 'ar' ? 'تنبيه موعد صيانة دورية وشيك' : 'Approaching Periodic Maintenance'}
                  </h4>
                  {items.length > 1 && (
                    <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-indigo-200 shrink-0">
                      {currentIndex + 1}/{items.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Carousel previous / next */}
                {items.length > 1 && (
                  <div className="flex items-center gap-0.5 bg-black/30 rounded-lg p-0.5 border border-white/10">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title={language === 'ar' ? 'التنبيه السابق' : 'Previous'}
                    >
                      {isRtl ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title={language === 'ar' ? 'التنبيه التالي' : 'Next'}
                    >
                      {isRtl ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
                    </button>
                  </div>
                )}

                {/* Minimize Pill Button */}
                <button
                  type="button"
                  onClick={handleSnooze}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={language === 'ar' ? 'تصغير للشاشة' : 'Minimize'}
                >
                  <Minimize2 size={13} />
                </button>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                  title={language === 'ar' ? 'إغلاق التنبيه' : 'Dismiss'}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Notification Body Content */}
            <div className="p-4 space-y-3.5">
              {/* Vehicle & Status Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
                    isOverdue 
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  }`}>
                    <Truck size={20} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-sm font-black text-white truncate leading-snug">
                      {currentItem.vehicleName}
                    </h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      {currentItem.plateNumber && (
                        <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 bg-white/10 text-indigo-200 rounded border border-white/10 tracking-wide">
                          {currentItem.plateNumber}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 truncate">
                        {currentItem.vehicleType || (language === 'ar' ? 'مركبة أسطول' : 'Fleet Vehicle')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Countdown Pill */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black shrink-0 border border-white/15 shadow-sm ${statusBadge.bg}`}>
                  {statusBadge.icon}
                  <span>{statusBadge.text}</span>
                </div>
              </div>

              {/* Maintenance Task Box */}
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catBadge.color}`}>
                    {catBadge.label}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-300 font-bold">
                    <Calendar size={12} className="text-indigo-400" />
                    <span>{language === 'ar' ? 'الاستحقاق:' : 'Due Date:'}</span>
                    <span className="font-mono text-white font-black">{currentItem.dueDate}</span>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-100 leading-relaxed">
                  {currentItem.serviceTitle}
                </p>

                {currentItem.notes && (
                  <p className="text-[11px] text-slate-400 line-clamp-1 border-t border-white/5 pt-1 mt-1">
                    {currentItem.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons: Add to Calendar & Open Details */}
              <div className="space-y-2 pt-0.5">
                {/* Primary: Add to Calendar Button with Interactive Dropdown/Flyout */}
                <div className="relative" ref={menuRef}>
                  <div className="flex items-stretch rounded-xl shadow-lg border border-purple-400/30 overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all">
                    {/* Main Action: Instant Google Calendar */}
                    <button
                      type="button"
                      onClick={handleAddToGoogleCalendar}
                      className="flex-1 py-2.5 px-3.5 flex items-center justify-center gap-2 text-white text-xs font-black hover:bg-white/10 active:scale-[0.99] transition-all cursor-pointer select-none"
                    >
                      <CalendarPlus size={15} className="text-cyan-300 animate-pulse shrink-0" />
                      <span>{language === 'ar' ? 'إضافة التذكير إلى التقويم' : 'Add Reminder to Calendar'}</span>
                    </button>

                    {/* Dropdown Options Toggle */}
                    <button
                      type="button"
                      onClick={() => setCalendarMenuOpen(!calendarMenuOpen)}
                      className="px-2.5 border-r border-white/20 hover:bg-white/15 text-white/90 transition-colors flex items-center justify-center cursor-pointer"
                      title={language === 'ar' ? 'خيارات التقويم (Google / Apple / Outlook)' : 'Calendar Options'}
                    >
                      <span className="text-[10px] font-bold">▼</span>
                    </button>
                  </div>

                  {/* Calendar Provider Dropup Menu */}
                  <AnimatePresence>
                    {calendarMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        className="absolute bottom-full mb-2 left-0 right-0 bg-slate-900/98 backdrop-blur-2xl border border-indigo-500/40 rounded-2xl shadow-2xl p-2 z-50 space-y-1"
                      >
                        <div className="px-2.5 py-1.5 text-[10.5px] font-bold text-slate-400 border-b border-white/10 flex items-center justify-between">
                          <span>{language === 'ar' ? 'اختر تطبيق التقويم المفضل:' : 'Select Calendar App:'}</span>
                          <Sparkles size={11} className="text-indigo-400" />
                        </div>

                        {/* Google Calendar */}
                        <button
                          type="button"
                          onClick={handleAddToGoogleCalendar}
                          className="w-full text-right px-3 py-2 rounded-xl hover:bg-indigo-600/30 text-white flex items-center justify-between text-xs font-bold transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center text-[11px] font-bold">G</span>
                            <span>Google Calendar (مباشر)</span>
                          </div>
                          <ExternalLink size={12} className="text-slate-400 group-hover:text-white" />
                        </button>

                        {/* Apple / Outlook (.ics file) */}
                        <button
                          type="button"
                          onClick={handleDownloadIcs}
                          className="w-full text-right px-3 py-2 rounded-xl hover:bg-indigo-600/30 text-white flex items-center justify-between text-xs font-bold transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-bold">iCal</span>
                            <span>Apple Calendar / ملف تقويم (.ics)</span>
                          </div>
                          <Download size={12} className="text-slate-400 group-hover:text-white" />
                        </button>

                        {/* Microsoft Outlook Web */}
                        <button
                          type="button"
                          onClick={handleAddToOutlook}
                          className="w-full text-right px-3 py-2 rounded-xl hover:bg-indigo-600/30 text-white flex items-center justify-between text-xs font-bold transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px] font-bold">O</span>
                            <span>Microsoft Outlook Web</span>
                          </div>
                          <ExternalLink size={12} className="text-slate-400 group-hover:text-white" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Secondary Button: Open Periodic Maintenance Page */}
                <button
                  type="button"
                  onClick={handleNavigateToService}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 hover:border-white/20 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Wrench size={13} className="text-indigo-400" />
                  <span>{language === 'ar' ? 'عرض جدول الصيانة الدورية في النظام' : 'Open Periodic Maintenance Schedule'}</span>
                </button>
              </div>

              {/* Calendar Added Feedback Toast */}
              <AnimatePresence>
                {calendarAddedToast && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2"
                  >
                    <Check size={14} className="shrink-0 text-emerald-400" />
                    <span className="flex-1">{calendarAddedToast}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Quick Switch / Help Footer */}
              <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Volume2 size={11} className="text-indigo-400" />
                  {language === 'ar' ? 'تنبيه دفع صوتي وبصري مفعل' : 'Push & Chime Active'}
                </span>
                <button
                  type="button"
                  onClick={handleSnooze}
                  className="hover:text-indigo-300 transition-colors underline cursor-pointer"
                >
                  {language === 'ar' ? 'تذكير لاحقاً' : 'Remind me later'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MaintenancePushNotificationCorner;
