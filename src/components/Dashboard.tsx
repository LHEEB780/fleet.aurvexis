import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  Plus, 
  ArrowDownRight, 
  Zap, 
  ShieldAlert, 
  MapPin, 
  ClipboardList, 
  Flame, 
  UserCheck, 
  Cpu, 
  RefreshCw, 
  FolderLock, 
  Eye, 
  Activity, 
  Calendar, 
  Layers, 
  Sparkles, 
  Award, 
  Database, 
  Search, 
  Check, 
  Building2, 
  Package, 
  FileBarChart2, 
  Info, 
  BookOpen, 
  X,
  Sliders,
  Settings,
  EyeOff,
  MoveUp,
  MoveDown,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Play,
  Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  vehicles as staticVehicles, 
  maintenanceOrders as staticOrders, 
  technicians as staticTechnicians,
  inventory as staticInventory
} from '../data';
import { User, MaintenanceOrder, Vehicle, Technician, InventoryItem } from '../types';
import { useLanguage } from '../services/LanguageContext';
import { FleetMap } from './FleetMap';
import { TechnicalPerformanceReport } from './TechnicalPerformanceReport';
import ContextualHelp from './ContextualHelp';
import LanguageSwitcher from './LanguageSwitcher';
import { SignaturePad } from './SignaturePad';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  gradientClass: string;
  iconBgGlow: string;
  trendBg: string;
  trendText: string;
  cardBg: string;
  cardBorder: string;
  textColor: string;
  labelColor: string;
}

const StatCard = ({ 
  label, 
  value, 
  icon, 
  trend, 
  trendUp, 
  gradientClass, 
  iconBgGlow, 
  trendBg, 
  trendText,
  cardBg,
  cardBorder,
  textColor,
  labelColor
}: StatCardProps) => (
  <div className={`p-5 rounded-2xl border shadow-xs flex items-center justify-between group hover:border-transparent transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${cardBg} ${cardBorder} ${iconBgGlow}`}>
    <div className="space-y-2 text-right">
      <p className={`text-[11px] font-black tracking-wide uppercase ${labelColor}`}>{label}</p>
      <div className="flex items-center gap-2">
        <h3 className={`text-2xl font-black leading-none tracking-tight font-sans select-all ${textColor}`}>{value}</h3>
        {trend && (
          <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[9px] font-black ${trendBg} ${trendText} font-sans shrink-0 direction-ltr`}>
            <span>{trendUp ? '▲' : '▼'}</span>
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
    
    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradientClass} flex items-center justify-center text-white shadow-md shadow-slate-100 dark:shadow-none group-hover:scale-110 group-hover:rotate-3 transition-colors duration-300 relative overflow-hidden`}>
      {/* Dynamic light reflex */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-full blur-[2px] -mr-2 -mt-2" />
      {icon}
    </div>
  </div>
);

const ARABIC_MONTH_NAMES = [
  'يناير/كانون الثاني',
  'فبراير/شباط',
  'مارس/آذار',
  'أبريل/نيسان',
  'مايو/أيار',
  'يونيو/حزيران',
  'يوليو/تموز',
  'أغسطس/آب',
  'سبتمبر/أيلول',
  'أكتوبر/تشرين الأول',
  'نوفمبر/تشرين الثاني',
  'ديسمبر/كانون الأول'
];

const ENGLISH_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ARABIC_WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ENGLISH_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface MaintenanceCalendarProps {
  orders: MaintenanceOrder[];
  vehicles: Vehicle[];
  technicians: Technician[];
  language: 'ar' | 'en';
  onNavigateToMaintenance?: () => void;
}

export function MaintenanceCalendar({
  orders,
  vehicles,
  technicians,
  language,
  onNavigateToMaintenance
}: MaintenanceCalendarProps) {
  // June 3, 2026 is the contextual default date
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(5); // 0-based index: 5 is June
  const [selectedDateStr, setSelectedDateStr] = useState('2026-06-03');

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(prev => prev - 1);
    } else {
      setMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(prev => prev + 1);
    } else {
      setMonth(prev => prev + 1);
    }
  };

  const handleSelectToday = () => {
    setYear(2026);
    setMonth(5);
    setSelectedDateStr('2026-06-03');
  };

  const calendarDays = useMemo(() => {
    const days = [];
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonthIndex = month === 0 ? 11 : month - 1;
    const totalDaysPrev = new Date(prevMonthYear, prevMonthIndex + 1, 0).getDate();

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dNum = totalDaysPrev - i;
      const dateStr = `${prevMonthYear}-${String(prevMonthIndex + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
      days.push({
        day: dNum,
        isCurrentMonth: false,
        dateStr,
        year: prevMonthYear,
        month: prevMonthIndex
      });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        isCurrentMonth: true,
        dateStr,
        year,
        month
      });
    }

    const remaining = 42 - days.length;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonthIndex = month === 11 ? 0 : month + 1;
    for (let i = 1; i <= remaining; i++) {
      const dateStr = `${nextMonthYear}-${String(nextMonthIndex + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i,
        isCurrentMonth: false,
        dateStr,
        year: nextMonthYear,
        month: nextMonthIndex
      });
    }

    return days;
  }, [year, month]);

  const getOrdersForDate = (dateStr: string) => {
    return orders.filter(order => order.date === dateStr);
  };

  const selectedDateOrders = useMemo(() => {
    return getOrdersForDate(selectedDateStr);
  }, [orders, selectedDateStr]);

  const priorityArMap = {
    high: 'عالية الحجم/طارئة 🚨',
    medium: 'متوسطة الخطورة ⚠️',
    low: 'منخفضة خطورة 🟢'
  };

  const priorityEnMap = {
    high: 'High Priority 🚨',
    medium: 'Medium Priority ⚠️',
    low: 'Low Priority 🟢'
  };

  const statusArMap = {
    pending: 'قيد الانتظار',
    'in-progress': 'تحت الصيانة المعيارية',
    completed: 'جاهزة للخدمة'
  };

  const statusEnMap = {
    pending: 'Pending Bureau',
    'in-progress': 'In-Progress Shop',
    completed: 'Completed Fleet'
  };

  const categoriesArMap: Record<string, string> = {
    mechanical: 'ميكانيك ثقيل',
    electrical: 'كهرباء وأنظمة',
    cooling: 'أنظمة تبريد',
    hydraulic: 'ذراع وهيدروليك',
    bodywork: 'سمكرة ودهان'
  };

  const activeMonthName = language === 'ar' ? ARABIC_MONTH_NAMES[month] : ENGLISH_MONTH_NAMES[month];
  const weekdaysList = language === 'ar' ? ARABIC_WEEKDAYS : ENGLISH_WEEKDAYS;

  const tCalendar = {
    title: language === 'ar' ? 'تقويم وبوابة الصيانة المجدولة تفاعلياً' : 'Scheduled Maintenance Interactive Calendar',
    subtitle: language === 'ar' ? 'استعرض خطط وجداول الصيانة التنبؤية والتوزيع الزمني اليومي للآليات' : 'Evaluate active fleet timelines, scheduled preventative mechanics and logistics',
    today: language === 'ar' ? 'اليوم' : 'Today',
    noTasksTitle: language === 'ar' ? 'يوم عمل ممتد وخالٍ من الأعطال' : 'Clear Repair Docket',
    noTasksDesc: language === 'ar' ? 'لا توجد أعمال صيانة مجدولة لهذا اليوم. الأسطول يسجل جاهزية كاملة!' : 'All vehicles are fully operational on this selected route date.',
    scheduleBtn: language === 'ar' ? '+ إضافة صيانة وقائية' : '+ Schedule Preventative',
    selectedDayTasks: language === 'ar' ? 'سجل المهام المفتوحة' : 'Open Maintenance Docket',
    priority: language === 'ar' ? 'الأولوية:' : 'Priority:',
    tech: language === 'ar' ? 'الفني الهندسي:' : 'Staff Repair:',
    vehicle: language === 'ar' ? 'الآلية المجدولة:' : 'Vehicle Target:',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-150/80 dark:border-slate-800/90 p-5 space-y-6 shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-brand-blue-500/15" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-4">
        <div className={`space-y-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1 px-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-brand-blue-500 shrink-0">
              <Calendar size={16} />
            </span>
            <h3 className="text-xs font-black text-slate-850 dark:text-slate-100 leading-none">
              {tCalendar.title}
            </h3>
            <ContextualHelp 
              id="dashboard-calendar"
              titleAr="تقويم الصيانة المجدولة"
              titleEn="Scheduled Maintenance Calendar"
              explanationAr="بوابة برمجية تفاعلية لعرض وجدولة فترات الصيانة خطوة بخطوة، تتبع جاهزية الأسطول، رصد التواريخ المهمة، وإضافة مهام صيانة وقائية جديدة لتجنب التوقفات المفاجئة."
              explanationEn="An interactive planning board designed to draft, dispatch and audit recurring preventative maintenance tickets directly aligned with fleet operational readiness."
              benefitsAr={[
                "عرض بظلال لونية (أصفر/أحمر/أزرق) يوضح فوراً درجات خطورة وعجلة حالات الدعم الفنية لكل يوم.",
                "تبسيط مراقبة فترات الصلاحيات للآليات الثقيلة.",
                "تسهيل التفاعل وحجز وجدولة مهام الصيانة الوقائية."
              ]}
              benefitsEn={[
                "Displays priority-colored indicators representing technical emergencies scheduled each day.",
                "Simplifies monitoring active operational periods for high-importance equipment.",
                "Saves preventative planning time via simple pop-up wizard overlays."
              ]}
              tipsAr={[
                "انقر على أي رقم يوم في التقويم لتصفية وعرض بطاقات العمل المفتوحة والنشطة للآليات والمهندسين المسندين جانبيّاً."
              ]}
              tipsEn={[
                "Simply click any date square to filter assigned technician lists and check detailed mechanical schedules."
              ]}
              language={language}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            {tCalendar.subtitle}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSelectToday}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-black rounded-lg transition-all cursor-pointer"
          >
            {language === 'ar' ? 'اليوم الحالي' : 'Jump to Today'}
          </button>

          <div className="flex items-center border border-slate-200/50 dark:border-slate-805 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/40 p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 px-1.5 hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 rounded-lg transition-all cursor-pointer text-xs"
              title="الشهر السابق"
            >
              ◀
            </button>
            <div className="px-3 text-center min-w-[120px]">
              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 block">
                {activeMonthName}
              </span>
              <span className="text-[9px] font-mono text-slate-400 block tracking-wider">
                {year}
              </span>
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 px-1.5 hover:bg-white dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 rounded-lg transition-all cursor-pointer text-xs"
              title="الشهر التالي"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center font-sans">
            {weekdaysList.map((dayLabel, idx) => (
              <span key={idx} className="text-[9.5px] font-black text-slate-450 dark:text-slate-500 py-1 uppercase">
                {dayLabel}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayObj, cellIdx) => {
              const dayOrders = getOrdersForDate(dayObj.dateStr);
              const hasOrders = dayOrders.length > 0;
              const isSelected = selectedDateStr === dayObj.dateStr;
              const isToday = dayObj.dateStr === '2026-06-03';

              const highCount = dayOrders.filter(o => o.priority === 'high').length;
              const mediumCount = dayOrders.filter(o => o.priority === 'medium').length;
              const lowCount = dayOrders.filter(o => o.priority === 'low').length;

              return (
                <button
                  key={cellIdx}
                  type="button"
                  onClick={() => setSelectedDateStr(dayObj.dateStr)}
                  className={`relative h-12 rounded-xl border flex flex-col items-center justify-between p-1.5 transition-all outline-none cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-tr from-brand-blue-500 to-indigo-600 text-white border-transparent shadow-md'
                      : !dayObj.isCurrentMonth
                      ? 'bg-slate-50/40 dark:bg-slate-950/10 border-slate-100/50 dark:border-slate-850 text-slate-300 dark:text-slate-700 opacity-40 hover:opacity-100'
                      : isToday
                      ? 'bg-slate-50 dark:bg-slate-950 border-brand-blue-500 dark:border-brand-blue-500 text-slate-850 dark:text-slate-100 font-extrabold'
                      : 'bg-white dark:bg-[#121829] hover:bg-indigo-50/20 dark:hover:bg-slate-805 border-slate-150/60 dark:border-slate-800 text-slate-750'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-extrabold font-sans leading-none">
                      {dayObj.day}
                    </span>
                    {isToday && (
                      <span className={`text-[6.5px] px-1 rounded-sm leading-none font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-brand-blue-500 text-white animate-pulse'}`}>
                        {language === 'ar' ? 'اليوم' : 'Today'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-0.5 h-1.5 w-full">
                    {hasOrders ? (
                      <>
                        {Array.from({ length: highCount }).map((_, i) => (
                          <span key={`h-${i}`} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />
                        ))}
                        {Array.from({ length: mediumCount }).map((_, i) => (
                          <span key={`m-${i}`} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-400'}`} />
                        ))}
                        {Array.from({ length: lowCount }).map((_, i) => (
                          <span key={`l-${i}`} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-teal-500'}`} />
                        ))}
                      </>
                    ) : (
                      <span className="h-0.5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-start gap-3 text-[9px] text-slate-450 font-bold">
            <span className="block">{language === 'ar' ? 'فئات خطورة المواعيد:' : 'Docket Legend:'}</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
              <span>{language === 'ar' ? 'صيانة طارئة / خلل حرج (خلل بالأجندة)' : 'Critical Issue'}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              <span>{language === 'ar' ? 'صيانة دورية عادية' : 'Medium Repair'}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
              <span>{language === 'ar' ? 'صيانة وقائية خفيفة' : 'Light Routine'}</span>
            </span>
          </div>
        </div>

        <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150/60 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between min-h-[290px]">
          <div className="space-y-3">
            <div className="border-b border-slate-200/50 dark:border-slate-800 pb-2">
              <span className="text-[8.5px] uppercase font-black text-brand-blue-500 block">
                {tCalendar.selectedDayTasks}
              </span>
              <h4 className="text-[11.5px] font-black text-slate-800 dark:text-slate-200 mt-0.5 font-sans leading-none">
                {selectedDateStr}
              </h4>
            </div>

            <div className="space-y-3 max-h-[210px] overflow-y-auto pr-0.5 custom-scrollbar">
              {selectedDateOrders.length === 0 ? (
                <div className="text-center py-8 space-y-2 animate-fadeIn">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={15} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-slate-700 dark:text-slate-350">
                      {tCalendar.noTasksTitle}
                    </p>
                    <p className="text-[8.5px] text-slate-400 leading-normal max-w-[170px] mx-auto">
                      {tCalendar.noTasksDesc}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedDateOrders.map((ord) => {
                    const vehicle = vehicles.find(v => v.id === ord.vehicleId);
                    const tech = technicians.find(t => t.id === ord.technicianId);

                    let priColor = 'bg-slate-100 text-slate-550 dark:bg-slate-800';
                    if (ord.priority === 'high') {
                      priColor = 'bg-rose-500/10 text-rose-500 dark:bg-rose-950/20';
                    } else if (ord.priority === 'medium') {
                      priColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-950/20';
                    } else if (ord.priority === 'low') {
                      priColor = 'bg-teal-500/10 text-teal-605 dark:text-teal-400 dark:bg-teal-950/20';
                    }

                    let statusStyle = 'bg-slate-100 text-slate-500';
                    if (ord.status === 'completed') {
                      statusStyle = 'bg-emerald-500/10 text-emerald-500';
                    } else if (ord.status === 'in-progress') {
                      statusStyle = 'bg-amber-500/10 text-amber-500';
                    }

                    return (
                      <div
                        key={ord.id}
                        className="bg-white dark:bg-[#121829] border border-slate-150/65 dark:border-slate-850 p-3 rounded-xl shadow-xs space-y-2 hover:border-brand-blue-500/30 transition-all duration-150 text-right animate-fadeIn"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-black text-brand-blue-500 font-mono">
                            {ord.orderNumber}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-black ${priColor}`}>
                            {language === 'ar' ? priorityArMap[ord.priority] : priorityEnMap[ord.priority]}
                          </span>
                        </div>

                        <p className="text-[10px] font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
                          {ord.description}
                        </p>

                        <div className="space-y-1 text-[8px] border-t border-slate-100 dark:border-slate-800/80 pt-2 text-right">
                          {vehicle && (
                            <div className="flex items-center justify-start gap-1">
                              <span className="text-slate-400 font-bold">{tCalendar.vehicle}</span>
                              <span className="font-extrabold text-slate-700 dark:text-slate-200">
                                {vehicle.name} <span className="font-mono text-[7px] text-slate-405">({vehicle.plateNumber})</span>
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-start gap-1">
                            <span className="text-slate-400 font-bold">{tCalendar.tech}</span>
                            <span className="font-bold text-slate-705 dark:text-slate-300">
                              {tech ? tech.name : (language === 'ar' ? 'بانتظار التعيين' : 'Needs Assigning')}
                            </span>
                          </div>

                          <div className="flex items-center justify-start gap-1.5 pt-1">
                            <span className="px-1 py-0.5 rounded text-[7px] font-black uppercase bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500">
                              {categoriesArMap[ord.category] || ord.category}
                            </span>
                            <span className={`px-1 py-0.5 rounded text-[7px] font-black uppercase ${statusStyle}`}>
                              {language === 'ar' ? statusArMap[ord.status] : statusEnMap[ord.status]}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {onNavigateToMaintenance && (
            <button
              type="button"
              onClick={onNavigateToMaintenance}
              className="mt-3 w-full py-1.5 bg-brand-blue-500 hover:bg-brand-blue-600 text-white font-black text-[9px] rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1 shadow-xs"
            >
              <Plus size={10} strokeWidth={3} />
              <span>{tCalendar.scheduleBtn}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface MonthlyMaintenanceComparisonProps {
  orders: MaintenanceOrder[];
  language: 'ar' | 'en';
}

export function MonthlyMaintenanceComparison({ orders, language }: MonthlyMaintenanceComparisonProps) {
  // June 2026 is our current month context
  const currentMonthLabel = language === 'ar' ? 'يونيو 2026' : 'June 2026';
  const [isModalOpen, setIsModalOpen] = useState(false);

  const juneOrders = useMemo(() => {
    return orders.filter(o => o.date && o.date.startsWith('2026-06'));
  }, [orders]);

  const routineOrders = useMemo(() => {
    return juneOrders.filter(o => o.priority === 'low' || o.priority === 'medium');
  }, [juneOrders]);

  const emergencyOrders = useMemo(() => {
    return juneOrders.filter(o => o.priority === 'high');
  }, [juneOrders]);

  const routineTotal = routineOrders.length;
  const routineCompleted = routineOrders.filter(o => o.status === 'completed').length;
  const routineRate = routineTotal > 0 ? Math.round((routineCompleted / routineTotal) * 100) : 0;

  const emergencyTotal = emergencyOrders.length;
  const emergencyCompleted = emergencyOrders.filter(o => o.status === 'completed').length;
  const emergencyRate = emergencyTotal > 0 ? Math.round((emergencyCompleted / emergencyTotal) * 100) : 0;

  // Transform data for double-bar chart
  // This shows the quantitative numbers: Total vs. Completed
  const barChartData = useMemo(() => {
    return [
      {
        name: language === 'ar' ? 'صيانة روتينية / دورية' : 'Routine Maint.',
        [language === 'ar' ? 'إجمالي المخطط' : 'Total Planned']: routineTotal,
        [language === 'ar' ? 'المنجز الفعلي' : 'Actual Completed']: routineCompleted,
        rate: routineRate,
      },
      {
        name: language === 'ar' ? 'صيانة طارئة / حرجة' : 'Emergency Maint.',
        [language === 'ar' ? 'إجمالي المخطط' : 'Total Planned']: emergencyTotal,
        [language === 'ar' ? 'المنجز الفعلي' : 'Actual Completed']: emergencyCompleted,
        rate: emergencyRate,
      }
    ];
  }, [routineTotal, routineCompleted, routineRate, emergencyTotal, emergencyCompleted, emergencyRate, language]);

  return (
    <div className={`bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150/80 dark:border-slate-800 shadow-soft space-y-4 ${language === 'ar' ? 'text-right' : 'text-left'} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-brand-blue-500/15`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xs font-black text-slate-850 dark:text-slate-100 flex items-center gap-1.5 leading-none">
              <span className="p-1 px-1 bg-brand-blue-50 dark:bg-brand-blue-950/40 text-brand-blue-500 rounded-lg shrink-0">
                <Activity size={14} />
              </span>
              <span>{language === 'ar' ? 'نسب إنجاز الصيانة الدورية مقابل الطارئة' : 'Routine vs. Emergency Completion Index'}</span>
            </h3>

             <ContextualHelp 
              id="routine-vs-emergency"
              titleAr="جدوى الصيانة الدورية والطارئة"
              titleEn="Routine vs. Emergency ROI"
              explanationAr="دراسة مقارنة ذكية بين فاعلية الالتزام بالصيانات الدورية الوقائية والحد من الاستجابة المتأخرة للأعطال الطارئة والمفاجئة في ساحة العمل الفني."
              explanationEn="A comparative audit tracing compliance rates of structured proactive checkups versus high-overhead reaction repairs."
              benefitsAr={[
                "تمكين التتبع اللحظي لجدوى الاستثمارات الوقائية والحد من الهدر المالي.",
                "تقليل الأعطال الطارئة المفاجئة بنسبة تصل إلى 35% عند بلوغ معدل التزام يفوق 85%.",
                "تحسين التخطيط اللوجيستي وجدول حيازة قطع الغيار وسعة مربعات العمل."
              ]}
              benefitsEn={[
                "Brings real-time visibility into planned maintenance efficiency trends.",
                "Drives down catastrophic mechanical failures up to 35% under standard compliance.",
                "Refines resource balancing for bay slots and local supply parts logs."
              ]}
              tipsAr={[
                "انقر على أي عينة في الأعمدة لرصد الفروقات المباشرة ومعالجة تكرار عطل معين."
              ]}
              tipsEn={[
                "We recommend maintaining routine rate above 85% to assure absolute driver safety scores."
              ]}
              language={language}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            {language === 'ar' ? `التحليل التفاعلي لمعدلات ونسب تقدم إغلاق المهام الميدانية لشهر ${currentMonthLabel}` : `Dynamic comparison of active repair closures for ${currentMonthLabel}`}
          </p>
        </div>
        <span className="text-[9px] font-black bg-brand-blue-500/10 text-brand-blue-500 px-2 py-0.5 rounded-lg shrink-0 w-fit align-middle">
          {currentMonthLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
        {/* Statistics highlights side panel */}
        <div className="space-y-3 lg:col-span-1">
          {/* Routine Rate Card */}
          <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-805 p-3 rounded-2xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-450 font-black">
                {language === 'ar' ? 'معدل الصيانة الدورية المنجزة' : 'Routine Maint. Success'}
              </span>
              <span className="w-2 h-2 rounded-full bg-brand-blue-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black font-sans text-brand-blue-500">
                {routineRate}%
              </span>
              <span className="text-[8.5px] text-slate-400 font-bold font-sans">
                ({routineCompleted} / {routineTotal} {language === 'ar' ? 'مغلق' : 'closed'})
              </span>
            </div>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="bg-brand-blue-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(routineRate, 2)}%` }} 
              />
            </div>
          </div>

          {/* Emergency Rate Card */}
          <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-805 p-3 rounded-2xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-405 font-black">
                {language === 'ar' ? 'معدل الصيانة الطارئة المستجابة' : 'Emergency Maint. Success'}
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black font-sans text-rose-500">
                {emergencyRate}%
              </span>
              <span className="text-[8.5px] text-slate-400 font-bold font-sans">
                ({emergencyCompleted} / {emergencyTotal} {language === 'ar' ? 'مغلق' : 'closed'})
              </span>
            </div>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(emergencyRate, 2)}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Visual Chart using Recharts */}
        <div className="lg:col-span-2 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  fontSize: '10px', 
                  borderRadius: '12px', 
                  textAlign: 'right', 
                  direction: 'rtl',
                  backgroundColor: '#0f172a',
                  color: '#f8fafc',
                  border: '0px'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '5px' }} />
              <Bar 
                dataKey={language === 'ar' ? 'إجمالي المخطط' : 'Total Planned'} 
                fill="#94a3b8" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={22} 
              />
              <Bar 
                dataKey={language === 'ar' ? 'المنجز الفعلي' : 'Actual Completed'} 
                fill="#10b981" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={22} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Article Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with elegant blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              id="article-backdrop"
            />

            {/* Modal Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={`relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col ${language === 'ar' ? 'text-right' : 'text-left'} z-10`}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              id="article-modal-card"
            >
              {/* Header */}
              <div className="sticky top-0 bg-slate-50 dark:bg-slate-950 p-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-brand-blue-50 dark:bg-brand-blue-950/40 text-brand-blue-500 rounded-xl shrink-0">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">
                      {language === 'ar' ? 'الدليل والجدوى التشغيلية: الدورية مقابل الطارئة' : 'Operational Guide: Routine vs. Emergency'}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                      {language === 'ar' ? 'دراسة تفصيلية لزيادة كفاءة الأسطول وخفض مصاريف التشغيل' : 'Detailed breakdown for fleet optimization and cost cutting'}
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-all cursor-pointer"
                  id="close-article-btn"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Article Body */}
              <div className="overflow-y-auto p-6 md:p-8 space-y-7 text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed max-h-[calc(85vh-120px)] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {language === 'ar' ? (
                  <>
                    {/* Introduction Summary Panel */}
                    <div className="p-4.5 bg-brand-blue-50/50 dark:bg-brand-blue-950/20 border-r-4 border-brand-blue-500 rounded-l-2xl rounded-r-sm space-y-2 text-right">
                      <p className="text-slate-700 dark:text-slate-250 font-black text-xs md:text-sm leading-relaxed">
                        تعتبر الموازنة الصحية بين أعمال الصيانة الاستباقية والطارئة حجر الزاوية في خفض تكاليف التشغيل بنسبة تصل إلى <span className="text-brand-blue-500 font-sans font-black">40%</span> وإطالة عمر الأصول البلدية. يوضح هذا الدليل التحليلي الفروقات التشغيلية العميقة وأثرها المباشر على ميزانية إدارتكم.
                      </p>
                    </div>

                    {/* Section 1: Definition Cards */}
                    <section className="space-y-3">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-150/5 text-right pb-1.5">
                        <span className="p-1 bg-brand-blue-50 dark:bg-brand-blue-950 text-brand-blue-500 rounded-lg"><Layers size={13} /></span>
                        <span>1. الفروقات الجوهرية والتعريف المفهومي</span>
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed pb-1">
                        يقسم نشاط الصيانة للأسطول لفرعين رئيسيين يصنعان فرقًا حاسمًا في جودة التخطيط والتحكم المالي:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-500/[0.02] hover:bg-emerald-500/[0.04] dark:bg-emerald-500/[0.03] dark:hover:bg-emerald-500/[0.06] border border-emerald-500/15 dark:border-emerald-500/20 p-4 rounded-2xl space-y-2.5 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full">
                              وقائي ومخطط
                            </span>
                            <span className="text-base">⚙️</span>
                          </div>
                          <h5 className="font-black text-slate-800 dark:text-slate-200 text-xs">الصيانة الدوريّة الوقائيّة (Routine Preventive)</h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                            تتم بشكل استباقي بناءً على جدول زمني أو قراءة عداد المسافات (مثل: فحص فحمات المكابح، تغيير الفلاتر والزيوت والسيور، ومعايرة ضغط الإطار). وتتميز كلفها بأنها منخفضة ومدروسة ميزانياتها مسبقاً، وتتم برتم هادئ أثناء وقوف السيارة اليومي لتفادي أي عطل مفاجئ يسبب توقف خط الخدمة.
                          </p>
                        </div>

                        <div className="bg-rose-500/[0.02] hover:bg-rose-500/[0.04] dark:bg-rose-500/[0.03] dark:hover:bg-rose-500/[0.06] border border-rose-500/15 dark:border-rose-500/20 p-4 rounded-2xl space-y-2.5 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-full">
                              طارئ وتفاعلي
                            </span>
                            <span className="text-base">🚨</span>
                          </div>
                          <h5 className="font-black text-slate-800 dark:text-slate-200 text-xs">الصيانة الطارئة الإسعافيّة (Emergency Reactive)</h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                            تحدث كاستجابة فورية للأعطال والحوادث المفاجئة بميدان العمل (مثل: تلف المحرك فجأة على الطريق السريع، أو عطل علبة التروس). كلفها التشغيلية والمالية مدمرة، وتتم خارج الورشة في ظروف مستعجلة تؤخر تسليم الخدمة، وتستلزم خدمات السحب الفورية (السطحات).
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Section 2: ROI Highlight Bento Card */}
                    <section className="space-y-3">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-150/5 text-right pb-1.5">
                        <span className="p-1 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-lg"><Award size={13} /></span>
                        <span>2. الجدوى المالية المباشرة (الوقاية توفر حتى 10 أضعاف!)</span>
                      </h4>
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-805 space-y-4">
                        <div className="flex flex-col md:flex-row items-center gap-4 text-right">
                          <div className="text-center shrink-0 w-full md:w-32 py-3 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 dark:border-rose-500/20 rounded-xl">
                            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold">معدل فرق التكلفة</span>
                            <span className="text-xl md:text-2xl font-black font-sans text-rose-500">4x - 10x</span>
                            <span className="block text-[8px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">زيادة هائلة بالطارئة</span>
                          </div>
                          <div className="space-y-1.5 flex-1">
                            <h5 className="font-black text-slate-800 dark:text-slate-200 text-xs leading-none">لماذا ترتفع فاتورة الصيانة الطارئة بشكل مفرط؟</h5>
                            <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                              تشير الأرقام والتقارير العالمية أن الصيانة الطارئة تكلّف الإدارة بين <strong className="text-rose-500 font-sans">4 إلى 10 أضعاف</strong> الصيانة الروتينية الوقائية لنفس المشكلة! تكاليف سحب المركبة (السطحات)، ورسوم الإصلاح الفوري بالميدان، وشراء قطع الغيار بأسعار مرتفعة دون متاجرة مسبقة تصنع استنزافاً مالياً حاداً ومفاجئاً للموازنات.
                            </p>
                          </div>
                        </div>

                        {/* Cost breakdown factors */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5 border-t border-slate-150/5">
                          <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800 text-right space-y-1">
                            <span className="text-[10px] font-black text-rose-500">🚚 كلفة السحب والوقوف</span>
                            <p className="text-[10px] text-slate-400 font-semibold">سطحات نقل طارئة بالمواكبة مع أجور تعطل السائق وامتناع المركبة عن العمل.</p>
                          </div>
                          <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800 text-right space-y-1">
                            <span className="text-[10px] font-black text-rose-500">🏷️ التسعير الطارئ للقطع</span>
                            <p className="text-[10px] text-slate-400 font-semibold">الشراء العاجل الفوري يمنع فرصة المقارنة بعقود التوريد وإلحاق خصومات شراء الكميات.</p>
                          </div>
                          <div className="bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800 text-right space-y-1">
                            <span className="text-[10px] font-black text-rose-500">⏳ استنزاف جهد الفنيين</span>
                            <p className="text-[10px] text-slate-400 font-semibold">اضطرار ورش الصيانة للعمل الإضافي اللحظي العاجل على حساب الخطط المقرة مسبقاً.</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Section 3: Why Measure: Pillars of strategic dashboard */}
                    <section className="space-y-4">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-150/5 text-right pb-1.5">
                        <span className="p-1 bg-brand-blue-50 dark:bg-brand-blue-950 text-brand-blue-500 rounded-lg"><Activity size={13} /></span>
                        <span>3. لماذا يراقب هذا المؤشر في لوحة القيادة بمستوى عالٍ؟</span>
                      </h4>
                      
                      <div className="space-y-4">
                        {/* Pillar A */}
                        <div className="flex gap-3 text-right">
                          <div className="w-6 h-6 rounded-full bg-brand-blue-500/10 text-brand-blue-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">💡</div>
                          <div className="space-y-1">
                            <h5 className="font-extrabold text-slate-800 dark:text-slate-150 text-xs">
                              الانتقال التام من وضعية "رجل الإطفاء" إلى "التخطيط الاستراتيجي"
                            </h5>
                            <p className="text-[11px] text-slate-450 leading-relaxed font-semibold">
                              تغيير الفلسفة الإدارية من مكافحة أزمات المركبات اليومية المفاجئة (انتظار الكارثة التشغيلية ثم محاولة إنقاذها بموارد وصحب مضاعف) إلى منهجية وقائية علمية مستدامة تضمن الهدوء والاستقرار لبيئة العمل.
                            </p>
                          </div>
                        </div>

                        {/* Pillar B */}
                        <div className="flex gap-3 text-right">
                          <div className="w-6 h-6 rounded-full bg-brand-blue-500/10 text-brand-blue-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">🛡️</div>
                          <div className="space-y-1">
                            <h5 className="font-extrabold text-slate-800 dark:text-slate-150 text-xs">
                              الأمن المالي وحماية موازنة التشغيل البلدية
                            </h5>
                            <p className="text-[11px] text-slate-450 leading-relaxed font-semibold">
                              التحكم الحازم والصارم بفاتورة كلفة قطع الغيار وساعات عمل الورش، مما يحرر ميزانيات ضخمة كانت تذهب هدراً نتيجة الإهمال، وتوجيهها لتنمية كفاءة الأسطول العام والتوسعات الطموحة.
                            </p>
                          </div>
                        </div>

                        {/* Pillar C */}
                        <div className="flex gap-3 text-right">
                          <div className="w-6 h-6 rounded-full bg-brand-blue-500/10 text-brand-blue-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">🎯</div>
                          <div className="space-y-1">
                            <h5 className="font-extrabold text-slate-800 dark:text-slate-150 text-xs">
                              إكساب الأسطول "صفة الاعتمادية الاستراتيجية الكاملة" (Reliability SLA)
                            </h5>
                            <p className="text-[11px] text-slate-450 leading-relaxed font-semibold">
                              بث الأمان التام لدى قادة الميدان لضمان خروج ودخول المركبات لمهمات النظافة والأشغال والبلديات بمقتضى مواعيد حركة دقيقة بلا مفاجآت معيبة بالشارع العام تؤخر الخدمة العامة.
                            </p>
                          </div>
                        </div>

                        {/* Pillar D */}
                        <div className="flex gap-3 text-right">
                          <div className="w-6 h-6 rounded-full bg-brand-blue-500/10 text-brand-blue-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">❤️</div>
                          <div className="space-y-1">
                            <h5 className="font-extrabold text-slate-800 dark:text-slate-150 text-xs">
                              تحسين فائق في سلامة السائقين والعنصر البشري
                            </h5>
                            <p className="text-[11px] text-slate-450 leading-relaxed font-semibold">
                              الأعطال الفجائية كمسامير العجل التالفة أو ضعف الفرامل المفاجئ أثناء القيادة بالميدان تهدد الأرواح قبل الأصول، والفحص الدوري يقي العنصر البشري أخطار الطرق المميتة.
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Section 4: Target roadmap */}
                    <section className="bg-brand-blue-500/5 dark:bg-brand-blue-950/20 border border-brand-blue-500/10 dark:border-brand-blue-950/40 p-4.5 rounded-2xl text-right space-y-2">
                      <div className="flex items-center gap-1.5 text-brand-blue-500">
                        <Sparkles size={14} className="shrink-0" />
                        <h5 className="font-black text-xs">أهداف خارطة الطريق المثالية (المعايير العالمية):</h5>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                        الأسطول المحكوم بدقة متناهية يستهدف معدل إنجاز صيانة روتينية مخطط لها يتخطى الـ <strong className="text-emerald-500 font-sans">%85</strong> من إجمالي الحجم التشغيلي، وضغط حدوث الأعطال الميدانية الطارئة الحرجة لأقل من <strong className="text-rose-500 font-sans">%15</strong>. لوحتكم التفاعلية ترشدك لدرجة التموضع الحقيقي للتحول لتلك الغاية المأمولة خطوة بخطوة.
                      </p>
                    </section>
                  </>
                ) : (
                  <>
                    {/* Introduction Summary Panel */}
                    <div className="p-4.5 bg-brand-blue-50/50 dark:bg-brand-blue-950/20 border-l-4 border-brand-blue-500 rounded-r-2xl rounded-l-sm space-y-2 text-left">
                      <p className="text-slate-700 dark:text-slate-250 font-black text-xs md:text-sm leading-relaxed">
                        Maintaining a healthy balance between proactive preventive works and emergency repairs is the cornerstone to cutting operational costs by up to <span className="text-brand-blue-500 font-sans font-black">40%</span> and prolonging active asset lifetimes.
                      </p>
                    </div>

                    {/* Section 1: Definition Cards */}
                    <section className="space-y-3">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-150/5 text-left pb-1.5">
                        <span className="p-1 bg-brand-blue-50 dark:bg-brand-blue-950 text-brand-blue-500 rounded-lg"><Layers size={13} /></span>
                        <span>1. Core Paradigm Differences</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-500/[0.02] hover:bg-emerald-500/[0.04] dark:bg-emerald-500/[0.03] dark:hover:bg-emerald-500/[0.06] border border-emerald-500/15 dark:border-emerald-500/20 p-4 rounded-2xl space-y-2 transition-all">
                          <strong className="text-emerald-600 dark:text-emerald-400 text-xs block">
                            ⚙️ Routine Preventive Maintenance
                          </strong>
                          <span className="text-[11px] block text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                            Proactive tasks scheduled according to wear timelines or odometers (oil & filter swaps, brake pads check, tire pressure diagnostics). Keeps fleets healthy at fractional costs during default idle hours.
                          </span>
                        </div>

                        <div className="bg-rose-500/[0.02] hover:bg-rose-500/[0.04] dark:bg-rose-500/[0.03] dark:hover:bg-rose-500/[0.06] border border-rose-500/15 dark:border-rose-500/20 p-4 rounded-2xl space-y-2 transition-all">
                          <strong className="text-rose-600 dark:text-rose-400 text-xs block">
                            🚨 Emergency Reactive Maintenance
                          </strong>
                          <span className="text-[11px] block text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                            Immediate work triggered in response to unforeseen roadside failures (transmission snap, cooling liquid leak). Creates chaotic operational bottlenecks and increases tow expenditures.
                          </span>
                        </div>
                      </div>
                    </section>

                    {/* Section 2: ROI Focus */}
                    <section className="space-y-3">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-150/5 text-left pb-1.5">
                        <span className="p-1 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-lg"><Award size={13} /></span>
                        <span>2. Financial Impact (Save 4X to 10X!)</span>
                      </h4>
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-805 space-y-3.5">
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold font-sans">
                          Every unexpected breakdown costs <strong className="text-rose-500 font-sans">4 to 10 times more</strong> than a proactive preventative checkup. Prompt parts delivery surcharges, road-assistance support crew logistics, and rapid tow actions accumulate massive budget hemorrhages without early intervention dashboards.
                        </p>
                      </div>
                    </section>

                    {/* Section 3: Why Measure */}
                    <section className="space-y-3">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-150/5 text-left pb-1.5">
                        <span className="p-1 bg-brand-blue-50 dark:bg-brand-blue-950 text-brand-blue-500 rounded-lg"><Activity size={13} /></span>
                        <span>3. Key Strategic Pillars</span>
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-left">
                          <span className="text-base">💡</span>
                          <div>
                            <h5 className="font-extrabold text-slate-800 dark:text-slate-150 text-xs text-left">Eradicating the Firefighter Mindset:</h5>
                            <p className="text-[11px] text-slate-450 leading-relaxed">Transition from frantic emergency responders to foresight-driven decision-makers, keeping crew schedules optimized and predictable.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 text-left">
                          <span className="text-base">🛡️</span>
                          <div>
                            <h5 className="font-extrabold text-slate-800 dark:text-slate-150 text-xs text-left">Ensuring Fleet SLA & Dependability:</h5>
                            <p className="text-[11px] text-slate-450 leading-relaxed">Ensure vehicles leave the depots exactly as scheduled without high probabilities of roadside stoppages that harm public municipal services.</p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-100 dark:border-slate-850 flex justify-end z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 hover:bg-brand-blue-600 active:bg-brand-blue-700 bg-brand-blue-500 text-white font-black text-xs rounded-xl transition-all shadow-md cursor-pointer"
                  id="close-article-footer-btn"
                >
                  {language === 'ar' ? 'فهمت، مذهل' : 'Understood, Awesome'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SparePartsConsumptionWidgetProps {
  inventory: InventoryItem[];
  language: 'ar' | 'en';
  orders?: MaintenanceOrder[];
  vehicles?: Vehicle[];
}

export function SparePartsConsumptionWidget({ inventory, language, orders = [], vehicles = [] }: SparePartsConsumptionWidgetProps) {
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'vehicles'>('inventory');

  // Compute stats
  const lowStockItems = useMemo(() => {
    return inventory.filter(item => item.quantity <= item.minQuantity);
  }, [inventory]);

  const totalPartsValue = useMemo(() => {
    return inventory.reduce((acc, item) => acc + (item.quantity * (item.price || 50)), 0);
  }, [inventory]);

  // Mock consumption data for the past few weeks
  const consumptionData = useMemo(() => {
    return [
      { name: language === 'ar' ? 'فلتر جير' : 'Gear Filter', value: 34, color: '#2563eb' },
      { name: language === 'ar' ? 'بطاريات 12v' : '12V Battery', value: 12, color: '#ea580c' },
      { name: language === 'ar' ? 'سائل فرامل' : 'Brake Fluid', value: 48, color: '#10b981' },
      { name: language === 'ar' ? 'مساعدين هيدروليك' : 'Hydraulic Struts', value: 18, color: '#ec4899' },
      { name: language === 'ar' ? 'أقراص فرامل' : 'Brake Rotors', value: 29, color: '#f43f5e' },
      { name: language === 'ar' ? 'زيت محرك 15W40' : 'Engine Oil 15W40', value: 65, color: '#8b5cf6' },
    ].sort((a, b) => b.value - a.value);
  }, [language]);

  // Aggregated parts consumption rate per vehicle
  const vehiclePartsData = useMemo(() => {
    const list = orders || [];
    const vList = vehicles || [];

    const counts: Record<string, { 
      vehicleId: string;
      name: string;
      plate: string;
      mechanical: number;
      electrical: number;
      cooling: number;
      hydraulic: number;
      bodywork: number;
      total: number;
    }> = {};

    // Initialize counts with vehicles list to match names
    vList.forEach(v => {
      counts[v.id] = {
        vehicleId: v.id,
        name: v.name,
        plate: v.plateNumber,
        mechanical: 0,
        electrical: 0,
        cooling: 0,
        hydraulic: 0,
        bodywork: 0,
        total: 0
      };
    });

    // Populate counts from maintenance orders
    list.forEach(order => {
      if (order.partsUsed && order.partsUsed.length > 0) {
        if (!counts[order.vehicleId]) {
          const matchedVeh = vList.find(v => v.id === order.vehicleId);
          counts[order.vehicleId] = {
            vehicleId: order.vehicleId,
            name: matchedVeh?.name || `مركبة #${order.vehicleId}`,
            plate: matchedVeh?.plateNumber || '',
            mechanical: 0,
            electrical: 0,
            cooling: 0,
            hydraulic: 0,
            bodywork: 0,
            total: 0
          };
        }
        
        const numParts = order.partsUsed.length;
        const cat = order.category || 'mechanical';
        counts[order.vehicleId][cat] += numParts;
        counts[order.vehicleId].total += numParts;
      }
    });

    // Convert to array, keep only vehicles that consumed any parts to keep the chart legible,
    // then sort descending and get top 8 vehicles
    return Object.values(counts)
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [orders, vehicles]);

  // Find top consuming vehicle for smart insights
  const topConsumingVehicle = useMemo(() => {
    if (vehiclePartsData.length === 0) return null;
    return vehiclePartsData[0];
  }, [vehiclePartsData]);

  const handleQuickReorder = (partName: string) => {
    setReorderSuccess(partName);
    setTimeout(() => setReorderSuccess(null), 3000);
  };

  const tSub = {
    tabInventory: language === 'ar' ? 'مستويات المخزون والطلب السريع' : 'Inventory Stocks & Quick Action',
    tabVehicles: language === 'ar' ? 'تحليلات استهلاك المركبات والتنبؤ 📊' : 'Vehicle Spares & Predictions 📊',
    chartTitle: language === 'ar' ? 'معدل استهلاك قطع الغيار لكل مركبة حسب نوع الصيانة' : 'Spare Parts Consumption Rate per Vehicle by Category',
    totalText: language === 'ar' ? 'الإجمالي' : 'Total',
    predictiveHeader: language === 'ar' ? 'الدعم التنبئي والذكاء اللوجيستي' : 'Predictive Logistics & Smart Forecasting',
    highestConsuming: language === 'ar' ? 'المركبة الأكثر طلباً لقطع الغيار' : 'Vehicle with Highest Spares Demand',
    alertOverhaul: language === 'ar' ? 'تنبيه: تتطلب صيانة وقائية شاملة قريباً لتجنب استنزاف قطع غيار إضافية.' : 'Alert: Requires deep checkups to prevent further part overhead.',
    criticalPrediction: language === 'ar' ? 'توصيات التنبؤ والتخزين التلقائي الذكي' : 'Forecasting & Automated Storage Action',
    predictionTip1: language === 'ar' ? '💡 بناءً على رتم الاستهلاك للمركبات، يوصى بزيادة عتبة الأمان لقطع الهيدروليك والمكابح بنسبة 15% لمجابهة الطلب المتوقع.' : '💡 Based on mechanical wear velocity, we recommend increasing the safety threshold of hydraulic and brake spares by 15%.',
    predictionTip2: language === 'ar' ? '💡 يلاحظ تكرار استبدال الفلاتر والزيوت؛ يفضل مراجعة عقود الزيوت لضمان كفاءة التزييت وتقليل معدل الاستهلاك الدفتري لقطع الأسطول.' : '💡 High volume of filter restocks detected. Review fuel/oil lubricants standard to maximize lifetime and reduce fleet consumption.',
  };

  return (
    <div className={`bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150/85 dark:border-slate-800 shadow-soft space-y-5 ${language === 'ar' ? 'text-right' : 'text-left'} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-brand-blue-500/15 animate-fadeIn`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 bg-brand-blue-50 dark:bg-brand-blue-950/40 text-brand-blue-500 rounded-lg shrink-0">
              <Package size={14} />
            </span>
            <h3 className="text-xs font-black text-slate-850 dark:text-slate-100">
              {language === 'ar' ? 'معدل استهلاك قطع الغيار وصحة مستويات المخزون' : 'Spare Parts Consumption & Critical Stock'}
            </h3>
            <ContextualHelp 
              id="parts-consumption-help"
              titleAr="مراقبة استهلاك قطع الغيار والمخزون الحرج"
              titleEn="Inventory & Spare Parts Analytics"
              explanationAr="لوحة تحليلية ذكية تتبع توزيع استهلاك مخزون قطع الغيار والوصول السريع إلى المواد منخفضة الكمية لتجنب توقف الآليات الطارئ."
              explanationEn="An analytical widget assessing supply-chain readiness, materials velocity, and real-time triggers for items hitting safety stock margins."
              benefitsAr={[
                "متابعة دورة استهلاك الزيوت والفلاتر والمكابح والبطاريات بشكل بياني دقيق.",
                "رصد فوري لـ (القطع منخفضة المخزون) لتأمينها قبل نفادها كلياً.",
                "توفير كلفة الشراء التراكمية وسوء التهيئة اللوجستية بنسبة 25%."
              ]}
              benefitsEn={[
                "Accurately monitors usage lifespans of engine oils, belts, brake components, and batteries.",
                "Instantly flags items dropping below pre-set replenishment thresholds.",
                "Safeguards against critical fleet downtime from missing workshop spares."
              ]}
              language={language}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-medium font-bold">
            {language === 'ar' ? 'متابعة دورة حياة مخازن الصيانة والقطع الاستهلاكية وتنبؤات المخزون' : 'Supply chain analytical tracker for workshop repair assets and inventory prediction'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-450 px-2.5 py-1 rounded-lg">
            {language === 'ar' ? `${lowStockItems.length} عجز أو نقص قطع ⚠️` : `${lowStockItems.length} Low Stock Spares ⚠️`}
          </span>
        </div>
      </div>

      {/* Segmented Navigation Subtabs */}
      <div className="flex border-b border-slate-150/60 dark:border-slate-800 pb-0.5 gap-4">
        <button
          type="button"
          onClick={() => setActiveSubTab('inventory')}
          className={`pb-2 text-xs font-black relative transition-all cursor-pointer ${
            activeSubTab === 'inventory' 
              ? 'text-brand-blue-500' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'
          }`}
        >
          {tSub.tabInventory}
          {activeSubTab === 'inventory' && (
            <motion.div layoutId="partsActiveLine" className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-blue-500 rounded-full" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('vehicles')}
          className={`pb-2 text-xs font-black relative transition-all cursor-pointer ${
            activeSubTab === 'vehicles' 
              ? 'text-brand-blue-500' 
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'
          }`}
        >
          {tSub.tabVehicles}
          {activeSubTab === 'vehicles' && (
            <motion.div layoutId="partsActiveLine" className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-blue-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Mini KPIs Grid - always visible for high-level awareness */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-slate-50 dark:bg-[#0c101c] border border-slate-100 dark:border-slate-800/80 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] text-slate-400 block font-bold">{language === 'ar' ? 'تنوع عناصر المخزون' : 'Active SKUs'}</span>
            <span className="text-xs font-black text-slate-850 dark:text-slate-100 font-sans">{inventory.length} SKU</span>
          </div>
          <Layers size={15} className="text-brand-blue-500" />
        </div>

        <div className="p-3 bg-slate-50 dark:bg-[#0c101c] border border-slate-100 dark:border-slate-800/80 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] text-slate-400 block font-bold">{language === 'ar' ? 'القيمة التقديرية للمخازن' : 'Estimated Stock Value'}</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-sans">{totalPartsValue.toLocaleString('ar-AE')} {language === 'ar' ? 'ر.س' : 'SAR'}</span>
          </div>
          <Database size={15} className="text-emerald-500" />
        </div>

        <div className="p-3 bg-slate-50 dark:bg-[#0c101c] border border-slate-100 dark:border-slate-800/80 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] text-slate-400 block font-bold">{language === 'ar' ? 'نسبة الجاهزية للتوزيع' : 'Supply Readiness Rate'}</span>
            <span className="text-xs font-black text-violet-600 dark:text-violet-400 font-sans">87.4%</span>
          </div>
          <Zap size={15} className="text-violet-500 animate-pulse" />
        </div>
      </div>

      {/* Conditionally render Tab Layouts */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'inventory' ? (
          <motion.div
            key="inventoryTab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-4"
          >
            {/* Recharts Bar Chart */}
            <div className="lg:col-span-3 border border-slate-100 dark:border-slate-800/60 p-4 rounded-2xl space-y-3">
              <h4 className="text-[10px] font-black text-slate-700 dark:text-slate-350">
                {language === 'ar' ? 'القطع الأكثر طلباً ومعدلات التوزيع (خلال شهر)' : 'High-Velocity Consumed Spares (Last 30 days)'}
              </h4>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consumptionData} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                    <CartesianGrid strokeDasharray="3 3" stroke="#101726" className="hidden dark:block" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={8} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={8} width={80} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        fontSize: '9px', 
                        borderRadius: '8px', 
                        textAlign: 'right', 
                        direction: 'rtl',
                        backgroundColor: '#111827',
                        color: '#fff',
                        border: '0px'
                      }} 
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {consumptionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Low Stock Items Action Card */}
            <div className="lg:col-span-2 border border-slate-100 dark:border-slate-800/60 p-4 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-750 dark:text-slate-350 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                  <span>{language === 'ar' ? 'مذكرة تأمين مخزون فوريّة' : 'Replenishment Action Required'}</span>
                </h4>
                
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {lowStockItems.length === 0 ? (
                    <p className="text-[9.5px] text-slate-450 italic text-center py-4">{language === 'ar' ? 'لا توجد قطع غيار حرجة حالياً.' : 'No replenishment alerts.'}</p>
                  ) : (
                    lowStockItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-between text-[9.5px]">
                        <div className="text-right">
                          <p className="font-extrabold text-slate-800 dark:text-slate-200">{item.name}</p>
                          <p className="text-[8.5px] text-slate-450 font-mono">الكمية: {item.quantity} / الأدنى: {item.minQuantity}</p>
                        </div>

                        <button
                          onClick={() => handleQuickReorder(item.name)}
                          className="px-2 py-1 bg-brand-blue-500 hover:bg-brand-blue-600 text-white font-black rounded-lg text-[8.5px] transition-all cursor-pointer focus:outline-none"
                        >
                          {language === 'ar' ? 'طلب فوري ⚡' : 'Refill ⚡'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <AnimatePresence>
                {reorderSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-[9px] text-center font-bold"
                  >
                    {language === 'ar' 
                      ? `✔️ تم إرسال طلب تموين فوري لـ ${reorderSuccess}!` 
                      : `✔️ Refill order placed for ${reorderSuccess}!`}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="vehiclesTab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-4"
          >
            {/* Recharts Stacked Horizontal Bar Chart for Vehicle parts consumption */}
            <div className="lg:col-span-3 border border-slate-105 dark:border-slate-800/60 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-slate-700 dark:text-slate-350">
                  {tSub.chartTitle}
                </h4>
                <span className="text-[8.5px] font-mono text-slate-400">
                  {language === 'ar' ? 'عرض أعلى 8 مركبات استهلاكاً' : 'Showing top 8 consumed units'}
                </span>
              </div>

              {vehiclePartsData.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                  <Package size={28} className="text-slate-300 dark:text-slate-650 mb-2 animate-bounce animate-duration-1000" />
                  <p className="text-[10px] font-black text-slate-450 italic">
                    {language === 'ar' ? 'لم يتم العثور على سجلات استهلاك لقطع الغيار على المركبات حالياً.' : 'No spares consumption records logged for any vehicle yet.'}
                  </p>
                </div>
              ) : (
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vehiclePartsData} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#101726" className="hidden dark:block" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={8} tickLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={8} width={85} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          fontSize: '9px', 
                          borderRadius: '12px', 
                          textAlign: 'right', 
                          direction: 'rtl',
                          backgroundColor: '#0f172a',
                          color: '#f8fafc',
                          border: '0px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Legend wrapperStyle={{ fontSize: '7.5px', paddingTop: '4px' }} height={22} iconSize={8} />
                      <Bar dataKey="mechanical" stackId="parts" name={language === 'ar' ? '⚙️ ميكانيكي' : '⚙️ Mechanical'} fill="#6366f1" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="electrical" stackId="parts" name={language === 'ar' ? '⚡ كهربائي' : '⚡ Electrical'} fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="cooling" stackId="parts" name={language === 'ar' ? '❄️ تبريد' : '❄️ Cooling'} fill="#0ea5e9" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="hydraulic" stackId="parts" name={language === 'ar' ? '💧 هيدروليكي' : '💧 Hydraulic'} fill="#f43f5e" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="bodywork" stackId="parts" name={language === 'ar' ? '🛠️ سمكرة' : '🛠️ Bodywork'} fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* AI/Predictive Analytics Side Block for Forecasting Inventory */}
            <div className="lg:col-span-2 border border-slate-105 dark:border-slate-800/60 p-4 rounded-2xl flex flex-col justify-between space-y-4 bg-slate-50/40 dark:bg-slate-950/20">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-brand-blue-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                  <Sparkles size={11} className="text-violet-500 shrink-0" />
                  <span>{tSub.predictiveHeader}</span>
                </h4>

                {topConsumingVehicle ? (
                  <div className="space-y-2">
                    <span className="text-[8px] text-slate-400 block font-bold leading-none">{tSub.highestConsuming}:</span>
                    <div className="p-2.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/15 text-slate-800 dark:text-slate-150">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black">{topConsumingVehicle.name}</span>
                        <span className="text-[9px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md font-sans">
                          {topConsumingVehicle.total} {language === 'ar' ? 'قطع مستهلكة' : 'parts consumed'}
                        </span>
                      </div>
                      <p className="text-[8.5px] text-amber-650 dark:text-amber-400 font-semibold leading-normal mt-1.5">
                        {tSub.alertOverhaul}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[9px] text-slate-450 italic">{language === 'ar' ? 'لا توجد بيانات كافية لرصد المركبات مرتفعة الاستهلاك.' : 'Insufficient data to suggest overhaul flags.'}</p>
                )}

                <div className="space-y-2">
                  <span className="text-[8px] text-slate-400 block font-bold leading-none">{tSub.criticalPrediction}:</span>
                  <div className="space-y-1.5 text-[8.5px] leading-relaxed text-slate-500 dark:text-slate-400 font-semibold pr-0.5">
                    <p className="p-1 px-1.5 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/10 border-r-2 border-indigo-500">
                      {tSub.predictionTip1}
                    </p>
                    <p className="p-1 px-1.5 rounded-lg bg-violet-50/40 dark:bg-violet-950/10 border-r-2 border-violet-500">
                      {tSub.predictionTip2}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-[8.5px] text-slate-400 italic text-center font-bold">
                {language === 'ar' ? '💡 يساعد الدعم الفني في خفض التكلفة الرأسمالية للتشغيل بنسبة 25%' : '💡 Preventive analysis saves up to 25% of annual parts overhead'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DashboardProps {
  user: User;
  onNavigateToMaintenance?: () => void;
  onNavigateToVehicles?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export default function Dashboard({ user, onNavigateToMaintenance, onNavigateToVehicles, onNavigateToTab }: DashboardProps) {
  const { language, t } = useLanguage();

  // Load state from localStorage to operate with real application databases
  const [orders, setOrders] = useState<MaintenanceOrder[]>(() => {
    const saved = localStorage.getItem('fleet_maintenance_orders_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as MaintenanceOrder[];
        const hasNewJuneCompleted = parsed.some(o => o.id === '113' || o.id === '114');
        if (!hasNewJuneCompleted) {
          const missing = staticOrders.filter(so => !parsed.some(o => o.id === so.id));
          if (missing.length > 0) {
            const combined = [...parsed, ...missing];
            localStorage.setItem('fleet_maintenance_orders_v2', JSON.stringify(combined));
            return combined;
          }
        }
        return parsed;
      } catch (e) {
        return staticOrders;
      }
    }
    return staticOrders;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('fleet_vehicles_v2');
    return saved ? JSON.parse(saved) : staticVehicles;
  });

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem('fleet_technicians_v2');
    return saved ? JSON.parse(saved) : staticTechnicians;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('fleet_inventory_v2');
    return saved ? JSON.parse(saved) : staticInventory;
  });

  const upcomingSchedules = useMemo(() => {
    const saved = localStorage.getItem('fleet_periodic_schedules');
    let schedules: any[] = [];
    if (saved) {
      try {
        schedules = JSON.parse(saved);
      } catch (e) {
        schedules = [];
      }
    } else {
      schedules = [
        { id: 'p-1', vehicleId: '1', title: 'تغيير زيت المحرك وباقة الفلاتر الدورية', dueDate: '2026-06-20', status: 'active' },
        { id: 'p-2', vehicleId: '2', title: 'معايرة ميزان الإطارات وفحص عمق المداس للمحاور', dueDate: '2026-05-15', status: 'overdue' },
        { id: 'p-3', vehicleId: '3', title: 'فحص واختبار فعالية منظومة الفرامل والصيانة الوقائية لها', dueDate: '2026-05-29', status: 'due-soon' },
        { id: 'p-4', vehicleId: '4', title: 'تنظيف وغسيل فلاتر التكييف ومروحة التبريد المساعدة', dueDate: '2026-05-31', status: 'active' }
      ];
    }

    const systemDate = new Date('2026-05-23');
    
    return schedules.filter(sched => {
      if (sched.status === 'paused') return false;
      const dueDateObj = new Date(sched.dueDate);
      const diffTime = dueDateObj.getTime() - systemDate.getTime();
      const diffHours = diffTime / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 48;
    });
  }, []);

  // --- DASHBOARD WIDGET CONFIGURATION SYSTEM ---
  const [widgetConfigs, setWidgetConfigs] = useState<Array<{
    id: string;
    titleAr: string;
    titleEn: string;
    visible: boolean;
    order: number;
  }>>(() => {
    const saved = localStorage.getItem('fleet_dashboard_widget_configurations_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const ids = parsed.map((item: any) => item.id);
          const defaultItems = [
            { id: 'stats', titleAr: 'مؤشرات الأداء وإحصائيات السريعة', titleEn: 'Quick Stats & KPIs', visible: true, order: 0 },
            { id: 'gps_map', titleAr: 'الخريطة الحية وتتبع الأسطول الميداني', titleEn: 'Live GPS Fleet Map Tracker', visible: true, order: 1 },
            { id: 'calendar', titleAr: 'تقويم ومواعيد الصيانة المجهّزة', titleEn: 'Scheduled Maintenance Calendar', visible: true, order: 2 },
            { id: 'analytics', titleAr: 'التحليل والمقارنة الشهرية للصيانة', titleEn: 'Monthly Maintenance Analytics', visible: true, order: 3 },
            { id: 'spare_parts', titleAr: 'معدل استهلاك قطع الغيار والمخزون الحرج', titleEn: 'Spare Parts Consumption & Critical Stock', visible: true, order: 4 },
            { id: 'departments', titleAr: 'الأقسام والشعب الفنية للتشغيل', titleEn: 'Fleet & Operational Divisions', visible: true, order: 5 },
            { id: 'critical_status', titleAr: 'المركبات الحرجة وحالات التوقف العاجل', titleEn: 'Critical Vehicles & Downtime Status', visible: true, order: 6 },
            { id: 'tech_report', titleAr: 'تقرير الأداء الفني وتوزيع الأعطال', titleEn: 'Technical Performance Report', visible: true, order: 7 },
          ];
          const missing = defaultItems.filter(item => !ids.includes(item.id));
          if (missing.length > 0) {
            const combined = [...parsed, ...missing.map((item, idx) => ({ ...item, order: parsed.length + idx }))];
            return combined.sort((a, b) => a.order - b.order);
          }
          return parsed.sort((a, b) => a.order - b.order);
        }
      } catch (e) {
        console.warn('Error reading dashboard widget config:', e);
      }
    }
    return [
      { id: 'stats', titleAr: 'مؤشرات الأداء وإحصائيات السريعة', titleEn: 'Quick Stats & KPIs', visible: true, order: 0 },
      { id: 'gps_map', titleAr: 'الخريطة الحية وتتبع الأسطول الميداني', titleEn: 'Live GPS Fleet Map Tracker', visible: true, order: 1 },
      { id: 'calendar', titleAr: 'تقويم ومواعيد الصيانة المجهّزة', titleEn: 'Scheduled Maintenance Calendar', visible: true, order: 2 },
      { id: 'analytics', titleAr: 'التحليل والمقارنة الشهرية للصيانة', titleEn: 'Monthly Maintenance Analytics', visible: true, order: 3 },
      { id: 'spare_parts', titleAr: 'معدل استهلاك قطع الغيار والمخزون الحرج', titleEn: 'Spare Parts Consumption & Critical Stock', visible: true, order: 4 },
      { id: 'departments', titleAr: 'الأقسام والشعب الفنية للتشغيل', titleEn: 'Fleet & Operational Divisions', visible: true, order: 5 },
      { id: 'critical_status', titleAr: 'المركبات الحرجة وحالات التوقف العاجل', titleEn: 'Critical Vehicles & Downtime Status', visible: true, order: 6 },
      { id: 'tech_report', titleAr: 'تقرير الأداء الفني وتوزيع الأعطال', titleEn: 'Technical Performance Report', visible: true, order: 7 },
    ];
  });

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Helper functions for customizer
  const toggleWidgetVisibility = (id: string) => {
    const updated = widgetConfigs.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    setWidgetConfigs(updated);
    localStorage.setItem('fleet_dashboard_widget_configurations_v2', JSON.stringify(updated));
    triggerToast(language === 'ar' ? 'تم تحديث مظهر الأداة!' : 'Widget appearance updated!');
  };

  const moveWidgetUp = (index: number) => {
    if (index === 0) return;
    const updated = [...widgetConfigs];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    
    const reordered = updated.map((w, idx) => ({ ...w, order: idx }));
    setWidgetConfigs(reordered);
    localStorage.setItem('fleet_dashboard_widget_configurations_v2', JSON.stringify(reordered));
  };

  const moveWidgetDown = (index: number) => {
    if (index === widgetConfigs.length - 1) return;
    const updated = [...widgetConfigs];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    
    const reordered = updated.map((w, idx) => ({ ...w, order: idx }));
    setWidgetConfigs(reordered);
    localStorage.setItem('fleet_dashboard_widget_configurations_v2', JSON.stringify(reordered));
  };

  const resetWidgetConfig = () => {
    const defaultList = [
      { id: 'stats', titleAr: 'مؤشرات الأداء وإحصائيات السريعة', titleEn: 'Quick Stats & KPIs', visible: true, order: 0 },
      { id: 'gps_map', titleAr: 'الخريطة الحية وتتبع الأسطول الميداني', titleEn: 'Live GPS Fleet Map Tracker', visible: true, order: 1 },
      { id: 'calendar', titleAr: 'تقويم ومواعيد الصيانة المجهّزة', titleEn: 'Scheduled Maintenance Calendar', visible: true, order: 2 },
      { id: 'analytics', titleAr: 'التحليل والمقارنة الشهرية للصيانة', titleEn: 'Monthly Maintenance Analytics', visible: true, order: 3 },
      { id: 'spare_parts', titleAr: 'معدل استهلاك قطع الغيار والمخزون الحرج', titleEn: 'Spare Parts Consumption & Critical Stock', visible: true, order: 4 },
      { id: 'departments', titleAr: 'الأقسام والشعب الفنية للتشغيل', titleEn: 'Fleet & Operational Divisions', visible: true, order: 5 },
      { id: 'critical_status', titleAr: 'المركبات الحرجة وحالات التوقف العاجل', titleEn: 'Critical Vehicles & Downtime Status', visible: true, order: 6 },
      { id: 'tech_report', titleAr: 'تقرير الأداء الفني وتوزيع الأعطال', titleEn: 'Technical Performance Report', visible: true, order: 7 },
    ];
    setWidgetConfigs(defaultList);
    localStorage.setItem('fleet_dashboard_widget_configurations_v2', JSON.stringify(defaultList));
    triggerToast(language === 'ar' ? 'تمت إعادة تعيين ترتيب وهيئة لوحة القيادة الافتراضية!' : 'Dashboard layout reset to default!');
  };

  // Technician Work Status indicator check
  const [techWorkStatus, setTechWorkStatus] = useState<'available' | 'busy' | 'away'>('available');
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  // Toolbox Verification Check list
  const [toolsAudit, setToolsAudit] = useState([
    { id: '1', name: 'مفك براغي هيدروليكي معاير أوتوماتيكياً', checked: true },
    { id: '2', name: 'جهاز تشخيص الحساسات اللاسلكي OBD3', checked: true },
    { id: '3', name: 'رافعة بلي لقمة المغناطيس', checked: false },
    { id: '4', name: 'طقم كشاف تسريب الفريون بالأشعة البنفسجية', checked: true },
  ]);

  // Toast / Status update confirmation state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick materials order form inside Bay section
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partOrderQty, setPartOrderQty] = useState(1);
  const [partOrderSuccess, setPartOrderSuccess] = useState(false);

  // Active Filter for Report Viewer role
  const [reportCategory, setReportCategory] = useState<string>('all');
  const [reportPriority, setReportPriority] = useState<string>('all');

  // Trigger Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync back state changes to localStorage
  const saveOrdersToLocalStorage = (newOrders: MaintenanceOrder[]) => {
    setOrders(newOrders);
    localStorage.setItem('fleet_maintenance_orders_v2', JSON.stringify(newOrders));
  };

  // 1. Handling updates and completions inside fields for the technician role
  const handleMilestoneToggle = (orderId: string, milestoneIndex: number) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        const milestones = o.milestones ? [...o.milestones] : [
          { title: 'التشخيص الأولي وفحص الدوائر', checked: false },
          { title: 'فك الأجزاء المتأثرة والتصوير', checked: false },
          { title: 'تركيب قطع الغيار المستلمة', checked: false },
          { title: 'اختبار السلامة الفنية والمعايرة', checked: false },
        ];
        
        milestones[milestoneIndex] = {
          ...milestones[milestoneIndex],
          checked: !milestones[milestoneIndex].checked
        };

        // Calculate automatic progress based on checked milestones
        const checkedCount = milestones.filter(m => m.checked).length;
        const progress = Math.round((checkedCount / milestones.length) * 100);

        return { ...o, milestones, progress };
      }
      return o;
    });
    saveOrdersToLocalStorage(updated);
    triggerToast('تم تحديث إنجاز المهمة والنسبة المئوية بنجاح!');
  };

  const handleProgressChange = (orderId: string, value: number) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, progress: value };
      }
      return o;
    });
    saveOrdersToLocalStorage(updated);
  };

  const handleCompleteOrder = (orderId: string) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { 
          ...o, 
          status: 'completed' as const, 
          progress: 100,
          lastUpdate: new Date().toISOString().split('T')[0]
        };
      }
      return o;
    });
    saveOrdersToLocalStorage(updated);
    triggerToast('تم فحص وإنهاء أمر الصيانة، وتم تحويل الآلية للخدمة!');
  };

  // Toggle tool audit
  const handleToggleTool = (toolId: string) => {
    setToolsAudit(prev => prev.map(t => t.id === toolId ? { ...t, checked: !t.checked } : t));
  };

  // Quick request material
  const handleRequestPartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId) return;
    const part = inventory.find(i => i.id === selectedPartId);
    if (!part) return;

    setPartOrderSuccess(true);
    triggerToast(`تم إرسال طلب تأمين عاجل: (${partOrderQty}) وحدة من ${part.name}`);
    setTimeout(() => {
      setPartOrderSuccess(false);
      setSelectedPartId('');
    }, 3000);
  };

  // Calculate high-level summary metadata
  const totalVehiclesCount = vehicles.length;
  const underMaintenanceCount = vehicles.filter(v => v.status === 'maintenance').length;
  const activeOrdersCount = orders.filter(o => o.status === 'in-progress' || o.status === 'pending').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;

  // Let's check which view to display
  // ============================================
  // VIEW: TECHNICIAN DASHBOARD VIEW
  // ============================================
  if (user.role === 'technician') {
    // Find orders assigned to this technician
    // Since our user is "احمد" (technician id 201), we can filter orders for technicianId === '201'
    const techOrders = orders.filter(o => o.technicianId === '201' && o.status !== 'completed');

    const getEstimatedDuration = (order: MaintenanceOrder) => {
      if (order.estimatedDuration) {
        return order.estimatedDuration;
      }
      const desc = order.description.toLowerCase();
      if (desc.includes('فحص دوري') || desc.includes('معايرة') || desc.includes('فحص فني') || desc.includes('periodic') || desc.includes('inspection')) {
        return language === 'ar' ? 'ساعة ونصف' : '1.5 hours';
      }
      if (desc.includes('تبديل زيت') || desc.includes('تغيير زيت') || desc.includes('تيل الفرامل') || desc.includes('oil') || desc.includes('brakes')) {
        return language === 'ar' ? 'ساعة واحدة' : '1 hour';
      }
      if (desc.includes('تسريب') || desc.includes('خزان') || desc.includes('leak') || desc.includes('tank')) {
        return language === 'ar' ? 'ساعتان' : '2 hours';
      }
      if (desc.includes('ناقل الحركة') || desc.includes('عطل جسيم') || desc.includes('توضيب') || desc.includes('transmission')) {
        return language === 'ar' ? '4 ساعات' : '4 hours';
      }
      if (desc.includes('حساسات') || desc.includes('كهرب') || desc.includes('sensor') || desc.includes('electrical')) {
        return language === 'ar' ? '3 ساعات' : '3 hours';
      }
      // priority default fallback
      if (order.priority === 'high') {
        return language === 'ar' ? '3 ساعات' : '3 hours';
      } else if (order.priority === 'medium') {
        return language === 'ar' ? 'ساعتان' : '2 hours';
      } else {
        return language === 'ar' ? 'ساعة واحدة' : '1 hour';
      }
    };

    const tQuickDailyList = {
      title: language === 'ar' ? 'قائمة مهام يومية سريعة' : 'Quick Daily To-Do List',
      subtitle: language === 'ar' ? `المهام الموكلة إليك لليوم (${'2026-06-03'})` : `Your assigned tasks for today (${'2026-06-03'})`,
      completedLabel: language === 'ar' ? 'مهام منجزة لليوم:' : "Today's Completed Tasks:",
      noTasksTitle: language === 'ar' ? 'يوم عمل مريح وهادئ!' : 'A Quiet, Clear Workday!',
      noTasksDesc: language === 'ar' ? 'لا توجد أي مهام صيانة موكلة إليك لهذا اليوم. أسطولك بأمان!' : 'No maintenance tasks are assigned to you for today. Great job!',
      priorityLabel: language === 'ar' ? 'المرتبة:' : 'Priority:',
      vehicleLabel: language === 'ar' ? 'المركبة:' : 'Vehicle:',
      estDurationLabel: language === 'ar' ? 'الوقت المتوقع:' : 'Est. Duration:',
      completeTask: language === 'ar' ? 'أكمل المهمة' : 'Complete Task',
      reopenTask: language === 'ar' ? 'إعادة فتح' : 'Reopen',
      statusCompleted: language === 'ar' ? 'مكتملة' : 'Completed',
      statusInProgress: language === 'ar' ? 'قيد العمل' : 'In-Progress',
      statusPending: language === 'ar' ? 'قيد الانتظار' : 'Pending',
      progressTitle: language === 'ar' ? 'معدل إنجاز اليوم:' : "Today's Progress Rate:",
      helpTitle: language === 'ar' ? 'دليل قائمة المهام اليومية السريعة' : 'Quick Daily To-Do List Guide',
      helpExplanation: language === 'ar' 
        ? 'لوحة مبسطة وسريعة تمكن الفنيين من الاطلاع الفوري على المهام الحرجة والاعتيادية الموكلة إليهم لليوم المحدد لتسريع الإنجاز والتركيز على جدول العمل اليومي.'
        : 'A simplified list that allows technicians to quickly view and manage critical or routine maintenance tasks assigned to them for today, helping them stay focused.',
      helpBenefits: language === 'ar'
        ? [
            'رؤية مركزة تمنع التشتت عبر عرض مهام اليوم فقط.',
            'تحديث سريع لحالة المهمة بنقرة واحدة.',
            'مؤشر تقدم لحظي يعكس جودة وإنجاز العمل الفني.'
          ]
        : [
            'A focused view that prevents distraction by displaying only today\'s tasks.',
            'Quick one-click status toggle.',
            'Real-time progress indicator reflecting your work quality.'
          ]
    };
    
    // Find matching workshop
    const assignedWorkshop = {
      id: 'WS-1',
      name: 'ورشة الميكانيك المركزي والصيانة الثقيلة (الصالة أ)',
      bay: 'ممر رقم 8 (رافعة مجهّزة)',
      location: 'الضلع الشمالي لساحة المجمع العام',
      supervisor: 'م. سفيان عبدالحميد (أبو أحمد)',
      specialization: 'ميكانيك ثقيل وتعامد هيدروليكي',
    };

    return (
      <div className={`space-y-6 ${language === 'ar' ? 'text-right' : 'text-left'} animate-fadeIn`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Alerts & Notifications */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-5 left-5 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2.5 border border-slate-700/50"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs font-black">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header with quick professional status */}
        <div className="bg-gradient-to-l from-slate-50 via-slate-100/40 to-slate-50 dark:from-slate-900 dark:to-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-[2rem] text-slate-800 dark:text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-brand-blue-50 dark:bg-brand-blue-950/40 text-brand-blue-600 dark:text-brand-blue-400 rounded-md text-[9px] font-black uppercase tracking-wider">لوحة الفحص الميداني</span>
              <ContextualHelp 
                id="technician-dash"
                titleAr="لوحة الفحص الميداني للفنيين"
                titleEn="Technician Field Diagnostics Board"
                explanationAr="بوابة برمجية متخصصة للفنيين لتمكينهم من استعراض المهام الجارية المسندة إليهم، وتتبع مستويات جاهزيتهم الفنية، وتحديث مراحل إصلاح المركبات لحظة بلحظة."
                explanationEn="A specialized workspace for field mechanics to inspect active work tickets, monitor personal task queues, and log progress status."
                benefitsAr={[
                  "تحديث ومزامنة خطوات الإصلاح الميدانية (فحص، فك، تركيب، جودة).",
                  "تغيير الحالة التشغيلية الفورية للفني (متوفر، مشغول، استراحة) لإرشاد المخططين تلقائياً.",
                  "الوصول السريع لدليل أدوات الصيانة ومطابقتها قبل بدء العمل التشغيلي."
                ]}
                benefitsEn={[
                  "Update field repair milestones instantly (Inspect, Disassemble, Reassemble, Quality control).",
                  "Toggle real-time availability to keep coordinators informed automatically.",
                  "Access custom tooling checklist validation step prior to initiating tasks."
                ]}
                tipsAr={[
                  "احرص على تحديث حالتك إلى 'متوفر' عند إنهاء مهامك السابقة لكي تتمكن اللوحة الذكية من تعيين المركبات الطارئة لك فوريّاً."
                ]}
                tipsEn={[
                  "Keep your availability toggled on to receive new repair tickets instantly."
                ]}
                language={language}
              />
              <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">مرحبا بك</span>
            </div>
            <h1 className="text-base font-black tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <span>{user.name}</span>
              <span className="text-slate-300 dark:text-slate-705">|</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{user.title}</span>
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">تابع العمل الهندسي المعين لك، حدّث نسب الإنجاز، وأغلق المهام المنجزة يدوياً لتزامن مستند الاستلام.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <LanguageSwitcher />
            <div className="flex items-center gap-3 bg-slate-100/80 dark:bg-slate-950/80 p-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-xs w-full sm:w-auto shrink-0">
              <div className="text-right">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block">حالتك الميدانية الحالية:</span>
                <span className="text-[11px] font-black">
                  {techWorkStatus === 'available' && <span className="text-emerald-600 dark:text-emerald-400">🟢 جاهز ونشط للعمل المباشر</span>}
                  {techWorkStatus === 'busy' && <span className="text-amber-600 dark:text-amber-400">🛠️ مشغول بصيانة مركبة</span>}
                  {techWorkStatus === 'away' && <span className="text-rose-600 dark:text-rose-400">☕ خارج الورشة (استراحة)</span>}
                </span>
              </div>

              <div className="flex gap-1 bg-slate-200/60 dark:bg-slate-950 p-1 rounded-xl border border-slate-300/45 dark:border-slate-800/40">
                {(['available', 'busy', 'away'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setTechWorkStatus(st)}
                    className={`px-2 py-1 text-[9px] font-black rounded-lg transition-all cursor-pointer ${
                      techWorkStatus === st 
                        ? 'bg-white dark:bg-slate-800 text-brand-blue-700 dark:text-white border border-slate-200/50 dark:border-slate-700/40 shadow-xs animate-fadeIn' 
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {st === 'available' ? 'متوفر' : st === 'busy' ? 'مشغول' : 'استراحة'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick status card counters for active technician context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-linear-to-br from-blue-50 to-indigo-50/60 dark:from-blue-950/30 dark:to-indigo-950/15 p-4.5 rounded-2xl border border-blue-100/80 dark:border-blue-900/30 shadow-xs flex items-center justify-between hover:shadow-md hover:border-blue-400/40 transition-all duration-300">
            <div className="space-y-1">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-black block">المهام الجارية المكلف بها</span>
              <span className="text-2xl font-black font-sans text-blue-900 dark:text-blue-100">{techOrders.length}</span>
            </div>
            <div className="p-3 bg-linear-to-tr from-blue-500 to-indigo-500 text-white rounded-xl shadow-xs shadow-blue-500/10">
              <ClipboardList size={18} />
            </div>
          </div>

          <div className="bg-linear-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/15 p-4.5 rounded-2xl border border-amber-100/80 dark:border-amber-900/30 shadow-xs flex items-center justify-between hover:shadow-md hover:border-amber-400/40 transition-all duration-300">
            <div className="space-y-1">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-black block">ممر الصيانة المعين</span>
              <span className="text-xs font-black text-amber-900 dark:text-amber-100">{assignedWorkshop.bay}</span>
            </div>
            <div className="p-3 bg-linear-to-tr from-amber-500 to-orange-500 text-white rounded-xl shadow-xs shadow-amber-500/10">
              <Building2 size={18} />
            </div>
          </div>

          <div className="bg-linear-to-br from-emerald-50 to-teal-50/60 dark:from-emerald-950/30 dark:to-teal-950/15 p-4.5 rounded-2xl border border-emerald-100/80 dark:border-emerald-900/30 shadow-xs flex items-center justify-between hover:shadow-md hover:border-emerald-400/40 transition-all duration-300">
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black block">معدل الإنجاز الشخصي للشهر</span>
              <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-200 flex items-center gap-1">
                <Award size={13} className="text-emerald-500 shrink-0" />
                <span>94.8% كفاءة إصلاح (ممتاز)</span>
              </span>
            </div>
            <div className="p-3 bg-linear-to-tr from-emerald-500 to-teal-500 text-white rounded-xl shadow-xs shadow-emerald-500/10">
              <Award size={18} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Column (2/3): Highlighted Active Repair orders */}
          <div className="lg:col-span-2 space-y-4">
            {/* Quick Daily To-Do List for Technicians */}
            <div className="bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 p-5 rounded-3xl border border-indigo-100/50 dark:border-indigo-950/20 shadow-soft space-y-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="p-1 bg-indigo-500/10 text-indigo-500 rounded-lg shrink-0">
                      <ClipboardList size={15} />
                    </span>
                    <h3 className="text-xs font-black text-slate-850 dark:text-slate-100 leading-none">
                      {tQuickDailyList.title}
                    </h3>
                    <ContextualHelp 
                      id="tech-daily-todo"
                      titleAr={tQuickDailyList.helpTitle}
                      titleEn={tQuickDailyList.helpTitle}
                      explanationAr={tQuickDailyList.helpExplanation}
                      explanationEn={tQuickDailyList.helpExplanation}
                      benefitsAr={tQuickDailyList.helpBenefits}
                      benefitsEn={tQuickDailyList.helpBenefits}
                      language={language}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {tQuickDailyList.subtitle}
                  </p>
                </div>

                {/* Today's Stats badge */}
                {(() => {
                  const todayTasks = orders.filter(o => o.technicianId === '201' && o.date === '2026-06-03');
                  const completedToday = todayTasks.filter(o => o.status === 'completed').length;
                  const totalToday = todayTasks.length;
                  const progressPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 100;
                  const isFullyCompleted = progressPct === 100;

                  return totalToday > 0 ? (
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-950 p-3 px-4 rounded-2xl border border-indigo-100/60 dark:border-slate-800 shrink-0 shadow-md">
                      <div className="text-right space-y-0.5">
                        <span className="text-[9.5px] text-slate-400 block font-bold tracking-wide">{tQuickDailyList.completedLabel}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-13px font-black text-slate-800 dark:text-slate-100 font-sans">
                            {completedToday} / {totalToday}
                          </span>
                          <span className={`text-[10px] font-black font-sans px-2 py-0.5 rounded-full transition-colors duration-300 ${
                            isFullyCompleted 
                              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' 
                              : 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10'
                          }`}>
                            {progressPct}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Premium Horizontal Progress Bar Track */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <div className="w-28 md:w-36 h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden shrink-0 relative shadow-inner border border-slate-200/20 dark:border-slate-800/60">
                          {/* Progress Fill */}
                          <div 
                            className={`h-full rounded-full transition-all duration-750 ease-out relative ${
                              isFullyCompleted 
                                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400' 
                                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          >
                            {/* Animated light streak for active states */}
                            {!isFullyCompleted && (
                              <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.25)_40%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0)_60%)] bg-[length:200%_100%] animate-shimmer" style={{ animation: 'shimmer 2.5s infinite linear' }} />
                            )}
                          </div>
                        </div>
                        {/* Dynamic encouragement micro-label */}
                        <span className="text-[8px] font-bold text-left text-slate-400">
                          {isFullyCompleted 
                            ? (language === 'ar' ? 'عمل رائع وبطل! 🎉' : 'Heroic work! 🎉')
                            : (language === 'ar' ? 'مستمرون بالإنجاز...' : 'Keep crushing it...')}
                        </span>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Mini Summary Counters at the top of the list */}
              {(() => {
                const todayTasks = orders.filter(o => o.technicianId === '201' && o.date === '2026-06-03');
                if (todayTasks.length === 0) return null;

                const totalCount = todayTasks.length;
                const completedCount = todayTasks.filter(o => o.status === 'completed').length;
                const remainingCount = totalCount - completedCount;

                return (
                  <div className="grid grid-cols-3 gap-3 bg-slate-50/50 dark:bg-slate-950/40 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    {/* Total Tasks */}
                    <div className="text-center p-2 rounded-xl bg-white dark:bg-[#121829] border border-slate-100 dark:border-slate-800/60 shadow-xs space-y-0.5">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-bold leading-none">
                        {language === 'ar' ? 'إجمالي مهام اليوم' : 'Total Tasks'}
                      </span>
                      <span className="text-[14px] font-black text-indigo-600 dark:text-indigo-400 font-sans block leading-none">
                        {totalCount}
                      </span>
                    </div>

                    {/* Completed Today */}
                    <div className="text-center p-2 rounded-xl bg-white dark:bg-[#121829] border border-slate-100 dark:border-slate-800/60 shadow-xs space-y-0.5">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-bold leading-none">
                        {language === 'ar' ? 'المنجزة اليوم' : 'Completed Today'}
                      </span>
                      <span className="text-[14px] font-black text-emerald-600 dark:text-emerald-400 font-sans block leading-none">
                        {completedCount}
                      </span>
                    </div>

                    {/* Remaining */}
                    <div className="text-center p-2 rounded-xl bg-white dark:bg-[#121829] border border-slate-100 dark:border-slate-800/60 shadow-xs space-y-0.5">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-bold leading-none">
                        {language === 'ar' ? 'المتبقية للعمل' : 'Remaining Tasks'}
                      </span>
                      <span className={`text-[14px] font-black font-sans block leading-none ${remainingCount > 0 ? 'text-amber-600 dark:text-amber-400 animate-pulse' : 'text-slate-500'}`}>
                        {remainingCount}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Today's Tasks List */}
              {(() => {
                const todayTasks = orders.filter(o => o.technicianId === '201' && o.date === '2026-06-03');

                if (todayTasks.length === 0) {
                  return (
                    <div className="text-center py-6 space-y-2.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-150 dark:border-slate-850">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                        <CheckCircle2 size={18} className="animate-pulse" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10.5px] font-black text-slate-705 dark:text-slate-300">
                          {tQuickDailyList.noTasksTitle}
                        </p>
                        <p className="text-[9px] text-slate-400 max-w-[260px] mx-auto leading-normal">
                          {tQuickDailyList.noTasksDesc}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {todayTasks.map((order) => {
                      const vehicle = vehicles.find(v => v.id === order.vehicleId);
                      const isCompleted = order.status === 'completed';

                      let priBg = 'bg-slate-100 text-slate-500 dark:bg-slate-800';
                      let priText = 'أولوية منخفضة';
                      if (order.priority === 'high') {
                        priBg = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/10';
                        priText = language === 'ar' ? 'أولوية قصوى 🚨' : 'High Priority 🚨';
                      } else if (order.priority === 'medium') {
                        priBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10';
                        priText = language === 'ar' ? 'أولوية متوسطة ⚠️' : 'Medium Priority ⚠️';
                      } else {
                        priText = language === 'ar' ? 'أولوية اعتيادية' : 'Low Priority';
                      }

                      const isExpanded = !!expandedTasks[order.id];

                      return (
                        <div
                          key={order.id}
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;
                            setExpandedTasks(prev => ({ ...prev, [order.id]: !prev[order.id] }));
                          }}
                          className={`group relative p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 text-right cursor-pointer select-none ${
                            isCompleted 
                              ? 'bg-emerald-500/[0.01] hover:bg-emerald-500/[0.03] border-emerald-500/20 dark:border-emerald-500/10 opacity-75' 
                              : isExpanded
                              ? 'bg-indigo-50/10 dark:bg-[#151d33] border-indigo-200 dark:border-slate-700 shadow-sm'
                              : 'bg-white hover:bg-indigo-50/10 dark:bg-[#121829] border-slate-150/70 dark:border-slate-850 hover:border-indigo-200 dark:hover:border-slate-700/60 shadow-xs'
                          }`}
                        >
                          {/* Inner glowing background indicator */}
                          <div className={`absolute top-0 right-0 w-1.5 h-full rounded-r-2xl ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`} />

                          <div className="space-y-2 pr-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black text-slate-400 font-mono tracking-wider">{order.orderNumber}</span>
                              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black ${priBg}`}>
                                {priText}
                              </span>
                            </div>

                            <h4 className={`text-xs font-black text-slate-850 dark:text-slate-100 leading-snug transition-all ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                              {order.description}
                            </h4>

                            <div className="flex flex-wrap gap-2 items-center pt-1.5">
                              {vehicle && (
                                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 dark:text-slate-450 font-medium bg-slate-50 dark:bg-slate-900/60 p-1 px-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                  <Truck size={11} className="text-slate-400" />
                                  <span>{tQuickDailyList.vehicleLabel}</span>
                                  <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {vehicle.name}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-1 text-[9px] text-amber-700 dark:text-amber-300 font-medium bg-amber-500/[0.04] p-1 px-1.5 rounded-lg border border-amber-500/10 font-bold shrink-0">
                                <Clock size={11} className="text-amber-500" />
                                <span>{tQuickDailyList.estDurationLabel}</span>
                                <span className="font-black text-amber-600 dark:text-amber-400">{getEstimatedDuration(order)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Accordion Expanded Panel */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-2 pt-3 border-t border-dashed border-slate-150 dark:border-slate-800 space-y-3 overflow-hidden text-right"
                              >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] leading-normal">
                                  {/* Failure description */}
                                  <div className="space-y-1 sm:col-span-2">
                                    <span className="text-slate-400 font-bold block">
                                      {language === 'ar' ? 'وصف العطل التفصيلي:' : 'Failure Description:'}
                                    </span>
                                    <p className="text-slate-700 dark:text-slate-300 font-medium bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                      {order.description} {order.techNotes ? `- ${order.techNotes}` : ''}
                                    </p>
                                  </div>

                                  {/* Complete plate number */}
                                  {vehicle && (
                                    <div className="space-y-1">
                                      <span className="text-slate-400 font-bold block">
                                        {language === 'ar' ? 'رقم لوحة المركبة الكامل:' : 'Full Vehicle Plate Number:'}
                                      </span>
                                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 p-1.5 px-2 rounded-lg border border-slate-100 dark:border-slate-800 block text-center">
                                        {vehicle.plateNumber}
                                      </span>
                                    </div>
                                  )}

                                  {/* Task start date */}
                                  <div className="space-y-1">
                                    <span className="text-slate-400 font-bold block">
                                      {language === 'ar' ? 'تاريخ بدء المهمة:' : 'Task Start Date:'}
                                    </span>
                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 p-1.5 px-2 rounded-lg border border-slate-100 dark:border-slate-800 block text-center">
                                      {order.date}
                                    </span>
                                  </div>
                                </div>

                                {/* Digital Signature Pad for documentation & responsibility */}
                                <div className="bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                  <SignaturePad
                                    savedSignature={order.signature}
                                    onSave={(signatureDataUrl) => {
                                      const updated = orders.map(o => {
                                        if (o.id === order.id) {
                                          return {
                                            ...o,
                                            signature: signatureDataUrl
                                          };
                                        }
                                        return o;
                                      });
                                      saveOrdersToLocalStorage(updated);
                                    }}
                                    onClear={() => {
                                      const updated = orders.map(o => {
                                        if (o.id === order.id) {
                                          return {
                                            ...o,
                                            signature: undefined
                                          };
                                        }
                                        return o;
                                      });
                                      saveOrdersToLocalStorage(updated);
                                    }}
                                    language={language}
                                  />
                                </div>

                                {/* Start / Pause Actions Control Panel */}
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                                  {!isCompleted && (
                                    order.status === 'pending' ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = orders.map(o => {
                                            if (o.id === order.id) {
                                              return {
                                                ...o,
                                                status: 'in-progress' as const,
                                                progress: 25,
                                                lastUpdate: new Date().toISOString().split('T')[0]
                                              };
                                            }
                                            return o;
                                          });
                                          saveOrdersToLocalStorage(updated);
                                          triggerToast(language === 'ar' ? 'تم بدء العمل على المهمة بنجاح!' : 'Task work started successfully!');
                                        }}
                                        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                                      >
                                        <Play size={12} fill="currentColor" />
                                        <span>{language === 'ar' ? 'بدء العمل' : 'Start Work'}</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = orders.map(o => {
                                            if (o.id === order.id) {
                                              return {
                                                ...o,
                                                status: 'pending' as const,
                                                progress: 0,
                                                lastUpdate: new Date().toISOString().split('T')[0]
                                              };
                                            }
                                            return o;
                                          });
                                          saveOrdersToLocalStorage(updated);
                                          triggerToast(language === 'ar' ? 'تم إيقاف المهمة مؤقتاً بنجاح!' : 'Task paused successfully!');
                                        }}
                                        className="bg-slate-500 hover:bg-slate-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                                      >
                                        <Pause size={12} fill="currentColor" />
                                        <span>{language === 'ar' ? 'إيقاف مؤقت' : 'Pause Task'}</span>
                                      </button>
                                    )
                                  )}

                                  {/* Complete / Reopen Action button in Accordion */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isCompleted) {
                                        // Reopen
                                        const updated = orders.map(o => {
                                          if (o.id === order.id) {
                                            return {
                                              ...o,
                                              status: 'in-progress' as const,
                                              progress: 50,
                                              lastUpdate: new Date().toISOString().split('T')[0]
                                            };
                                          }
                                          return o;
                                        });
                                        saveOrdersToLocalStorage(updated);
                                        triggerToast(language === 'ar' ? 'تمت إعادة فتح المهمة وتعيين التقدم إلى 50%!' : 'Task reopened and set to 50% progress!');
                                      } else {
                                        // Complete - Require signature
                                        if (!order.signature) {
                                          triggerToast(
                                            language === 'ar'
                                              ? 'يرجى رسم التوقيع الرقمي في المربع المخصص أدناه أولاً لتوثيق وتحمل مسؤولية الصيانة!'
                                              : 'Please draw your digital signature in the box below first to document and take responsibility for the maintenance!'
                                          );
                                          return;
                                        }
                                        handleCompleteOrder(order.id);
                                      }
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                                      isCompleted
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200'
                                        : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-xs shadow-indigo-500/10'
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <>
                                        <RotateCcw size={12} />
                                        <span>{tQuickDailyList.reopenTask}</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 size={12} />
                                        <span>{tQuickDailyList.completeTask}</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 pr-2 mt-1">
                            <div className="flex items-center gap-1.5">
                              {isCompleted ? (
                                <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 size={12} />
                                  <span>{tQuickDailyList.statusCompleted}</span>
                                </span>
                              ) : order.status === 'in-progress' ? (
                                <span className="flex items-center gap-1 text-[9px] font-black text-amber-600 dark:text-amber-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  <span>{tQuickDailyList.statusInProgress}</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[9px] font-black text-slate-500 dark:text-slate-450">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                  <span>{tQuickDailyList.statusPending}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 group-hover:text-indigo-500 transition-colors">
                              <span>{isExpanded ? (language === 'ar' ? 'إخفاء التفاصيل' : 'Hide Details') : (language === 'ar' ? 'عرض التفاصيل والتحكم' : 'Details & Control')}</span>
                              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Decorative separator line */}
              <div className="border-t border-slate-150/60 dark:border-slate-850/70 pt-2" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Flame size={16} className="text-orange-500 shrink-0" />
                <h2 className="text-sm font-black text-slate-900 dark:text-white">{language === 'ar' ? 'مهام الصيانة الميدانية النشطة الجارية الآن' : 'Active Field Maintenance Tasks'}</h2>
                <ContextualHelp 
                  id="dashboard-active-tasks"
                  titleAr="مهام الصيانة الميدانية النشطة"
                  titleEn="Active Field Maintenance Tasks"
                  explanationAr="ممر تشغيلي يعرض المهام وبطاقات الإصلاح المفتوحة حالياً في ساحة المشروع، متضمناً مؤشرات ونقاط تقدم العمل خطوة بخطوة."
                  explanationEn="A live board showing open work tickets currently pending or ongoing in mechanical slots, detailing progress milestones step by step."
                  benefitsAr={[
                    "رصد فوري لنسب الانجاز وأسماء الشاحنات والفنيين المكلفين فوريّاً.",
                    "سهولة متابعة الخطوات الفنية الأربع المعتمدة (فحص، فك، تركيب، جودة).",
                    "إمكانية إكمال وإغلاق المهام فوريّاً لتحديث سجل الورشة والأعطال."
                  ]}
                  benefitsEn={[
                    "Real-time monitoring of progress rates, assigned technicians, and trucks.",
                    "Tracks the four approved engineering stages (Inspect, Disassemble, Reassemble, Quality control).",
                    "Completes work tickets to immediately update the main database metrics."
                  ]}
                  tipsAr={[
                    "اضغط 'عرض التفاصيل والخطوات الفنية' لتفقد تقدم أوامر المهام والموافقة على مراحل الفحص والصيانة دورياً."
                  ]}
                  tipsEn={[
                    "Click 'Show Details & Technical Milestones' to manually confirm each progress stage of repair jobs."
                  ]}
                  language={language}
                />
              </div>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-lg text-slate-500 font-bold font-sans">
                {techOrders.length} مهمة متبقية
              </span>
            </div>

            {techOrders.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl text-center border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <CheckCircle2 size={36} className="text-emerald-500 mx-auto animate-pulse" />
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">أنت الآن خالٍ من أي مهام صيانة معلقة!</h3>
                <p className="text-[10px] text-slate-400">ممتاز، لقد أنهيت كافة المهام المكلف بها في الممر رقم 8. يمكنك أخذ قسط من الراحة أو adoption مهام مستوردة جديدة.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {techOrders.map((order) => {
                  const vehicle = vehicles.find(v => v.id === order.vehicleId);
                  const orderMilestones = order.milestones || [
                    { title: 'التشخيص الأولي وفحص الدوائر الإلكترونية والكهربية', checked: false },
                    { title: 'فك الأجزاء المتأثرة التآكلية وتوثيقها', checked: false },
                    { title: 'تركيب وتوصيل قطع الصيانة الجديدة وتثبيتها', checked: false },
                    { title: 'اختبار المعايرة الميكانيكية والتحميل على المحركات', checked: false },
                  ];

                  return (
                    <div 
                      key={order.id} 
                      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150/80 dark:border-slate-800/90 shadow-soft space-y-4 hover:border-brand-blue-500/30 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[8.5px] font-black ${
                              order.priority === 'high' 
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/10' 
                                : order.priority === 'medium'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              {order.priority === 'high' ? 'أولوية قصوى عاجلة 🚨' : order.priority === 'medium' ? 'أولوية متوسطة' : 'أولوية اعتيادية'}
                            </span>
                            <span className="text-[11px] font-black text-rose-500 font-sans tracking-wide">{order.orderNumber}</span>
                          </div>
                          <h3 className="text-xs font-black text-slate-905 dark:text-slate-205 mt-1">{order.description}</h3>
                        </div>

                        {vehicle && (
                          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-100 dark:border-slate-850 shrink-0">
                            <div className="w-8 h-8 rounded-lg bg-brand-blue-500/10 text-brand-blue-500 flex items-center justify-center shrink-0">
                              <Truck size={14} />
                            </div>
                            <div className="text-right">
                              <span className="text-[9.5px] font-black block text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{vehicle.name}</span>
                              <span className="text-[8px] font-mono text-slate-400 block">{vehicle.plateNumber}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Milestone checks */}
                      <div className="space-y-2">
                        <span className="text-[9.5px] font-black text-slate-500 block">خطوات الفحص والمعايرة الميدانية للورشة:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {orderMilestones.map((milestone, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleMilestoneToggle(order.id, idx)}
                              className={`flex items-start gap-2 p-2 rounded-xl border text-right transition-all cursor-pointer ${
                                milestone.checked 
                                  ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400' 
                                  : 'bg-slate-50/40 dark:bg-slate-950/20 border-slate-100 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-100/30'
                              }`}
                            >
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                                milestone.checked 
                                  ? 'bg-emerald-500 text-white border-transparent' 
                                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                              }`}>
                                {milestone.checked && <Check size={10} strokeWidth={3} />}
                              </div>
                              <span className="text-[9px] font-black leading-tight">{milestone.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Interactive slide bar with percentage */}
                      <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
                        <div className="flex items-center justify-between text-[9.5px] font-black">
                          <span className="text-slate-450">نسبة تقدم الإصلاح والجاهزية الفنية:</span>
                          <span className="text-brand-blue-600 dark:text-brand-blue-400 font-mono text-xs">{order.progress || 0}%</span>
                        </div>
                        {/* Dynamic multi-color progress indicator inside dashboard card controls */}
                        {(() => {
                          const progressVal = order.progress || 0;
                          let colorClass = "from-rose-500 via-orange-500 to-amber-550"; // Late
                          let label = "متأخر / قيد التشخيص";
                          let textClass = "text-rose-600 dark:text-rose-455";
                          let bgClass = "bg-rose-500/10";
                          if (progressVal === 100) {
                            colorClass = "from-emerald-500 to-teal-400"; // Completed
                            label = "مكتمل وجاهز للتسليم المعياري";
                            textClass = "text-emerald-600 dark:text-emerald-400";
                            bgClass = "bg-emerald-500/10";
                          } else if (progressVal >= 35) {
                            colorClass = "from-amber-400 via-brand-blue-500 to-indigo-505"; // Good
                            label = "عمل جاري ومستمر (جيد)";
                            textClass = "text-brand-blue-600 dark:text-brand-blue-400";
                            bgClass = "bg-brand-blue-500/10";
                          }
                          return (
                            <div className="space-y-1">
                              <div className="w-full bg-slate-200 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden block">
                                <div className={`h-full bg-gradient-to-l ${colorClass} transition-all duration-300`} style={{ width: `${progressVal}%` }} />
                              </div>
                              <div className={`px-2 py-0.5 rounded-md text-[8px] font-black ${textClass} ${bgClass} text-center`}>
                                {label}
                              </div>
                            </div>
                          );
                        })()}
                        <div className="flex items-center gap-3">
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="5"
                            value={order.progress || 0}
                            onChange={(e) => handleProgressChange(order.id, parseInt(e.target.value))}
                            className="flex-1 accent-brand-blue-500 h-1 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleProgressChange(order.id, Math.max(0, (order.progress || 0) - 10))}
                              className="w-6 h-6 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black hover:bg-slate-50 active:scale-95 transition-all text-center flex items-center justify-center cursor-pointer select-none"
                            >
                              -
                            </button>
                            <button 
                              onClick={() => handleProgressChange(order.id, Math.min(100, (order.progress || 0) + 10))}
                              className="w-6 h-6 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black hover:bg-slate-50 active:scale-95 transition-all text-center flex items-center justify-center cursor-pointer select-none"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[8.5px] text-slate-400 font-bold">آخر إجراء: {order.lastUpdate || order.date}</span>
                        
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleCompleteOrder(order.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9.5px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm shadow-emerald-500/10"
                          >
                            <CheckCircle2 size={12} />
                            <span>تأكيد الاكتمال والإغلاق</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column (1/3): Specialities, Tool cupboard audit, Request items */}
          <div className="space-y-5">
            {/* Bay Location & supervisor details */}
            <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-150/60 dark:border-slate-800/80 shadow-soft space-y-3.5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-brand-blue-500/15">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 rounded-full bg-brand-blue-500 block"></span>
                <span className="text-[11px] font-black text-slate-850 dark:text-slate-305 flex items-center gap-1">
                  <Building2 size={13} className="text-brand-blue-500" />
                  <span>معلومات الممر والصالة المشتركة</span>
                </span>
              </div>

              <div className="space-y-2.5 text-[10.5px]">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
                  <span className="text-[8.5px] text-slate-400 block">المنشأة المخصصة:</span>
                  <span className="font-extrabold">{assignedWorkshop.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-50/65 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-850 space-y-0.5">
                    <span className="text-[8px] text-slate-400 block">رقم الممر:</span>
                    <span className="font-extrabold text-blue-500">{assignedWorkshop.bay}</span>
                  </div>
                  <div className="p-2 bg-slate-50/65 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-850 space-y-0.5">
                    <span className="text-[8px] text-slate-400 block">المشرف المباشر:</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-300 truncate block">{assignedWorkshop.supervisor}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[9px] text-slate-400 leading-normal">
                  <MapPin size={10} className="shrink-0 text-slate-450" />
                  <span>الموقع الجغرافي: {assignedWorkshop.location}</span>
                </div>
              </div>
            </div>

            {/* Cabinet checklist (Interactive Tool Audit) */}
            <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-150/60 dark:border-slate-800/80 shadow-soft space-y-3.5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-amber-500/15">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 rounded-full bg-amber-500 block"></span>
                  <span className="text-[11px] font-black text-slate-850 dark:text-slate-300 flex items-center gap-1">
                    <Wrench size={12} className="text-amber-500" />
                    <span>خزانة الممر الكهروميكانيكية</span>
                  </span>
                </div>
                <span className="text-[8.5px] bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border text-slate-450 font-bold">تدقيق المعدات</span>
              </div>

              <p className="text-[9px] text-slate-400 leading-normal">
                برجاء التأكيد وتدقيق الأدوات الثقيلة المعارة إليك لتجنب غرامات جرد الأصول اليومي.
              </p>

              <div className="space-y-1.5">
                {toolsAudit.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToggleTool(tool.id)}
                    className="w-full flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/50 dark:hover:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800/50 text-right cursor-pointer text-[9.5px] transition-all"
                  >
                    <span className={`font-semibold ${tool.checked ? 'text-slate-700 dark:text-slate-200 line-through opacity-60' : 'text-slate-800 dark:text-slate-100'}`}>
                      {tool.name}
                    </span>
                    <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      tool.checked 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {tool.checked ? 'متوفرة بالخزانة ☑️' : 'خارجة / عهدة ⚠️'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick materials order list for the bay */}
            <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-150/60 dark:border-slate-800/80 shadow-soft space-y-3.5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-500/15">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 rounded-full bg-emerald-500 block"></span>
                <span className="text-[11px] font-black text-slate-855 dark:text-slate-300 flex items-center gap-1">
                  <Package size={13} className="text-emerald-500" />
                  <span>طلب تجهيز وتعدين قطع للممر</span>
                </span>
              </div>

              <p className="text-[9.5px] text-slate-400 leading-normal">
                اطلب تسليم مباشر للممر من أمناء السجل لإصدارها في الأرشيف فورياً دون الذهاب للمستودعات.
              </p>

              <form onSubmit={handleRequestPartSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[8.5px] font-bold text-slate-400 block">المادة أو قطعة الغيار المطلوبة:</label>
                  <select
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none font-bold text-slate-700 dark:text-slate-300"
                    required
                  >
                    <option value="">-- حدد قطعة الغيار المطلوبة --</option>
                    {inventory.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.partNumber}) - متوفر ({item.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[8.5px] font-bold text-slate-400 block">الكمية المطلوبة:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={partOrderQty}
                    onChange={(e) => setPartOrderQty(parseInt(e.target.value) || 1)}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none font-bold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full text-[10px] py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <Package size={12} />
                  <span>إرسال طلب تجهيز قطعة الغيار</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // VIEW: AUDITOR / VIEWER DASHBOARD VIEW
  // ============================================
  if (user.role === 'viewer') {
    // Generate reports of the vehicles categories
    const mechanicalCount = orders.filter(o => o.category === 'mechanical').length;
    const electricalCount = orders.filter(o => o.category === 'electrical').length;
    const coolingCount = orders.filter(o => o.category === 'cooling').length;
    const hydraulicCount = orders.filter(o => o.category === 'hydraulic').length;
    const bodyworkCount = orders.filter(o => o.category === 'bodywork').length;

    // Report Charts database mapping
    const categoryChartData = [
      { name: 'ميكانيك', value: mechanicalCount },
      { name: 'كهرباء', value: electricalCount },
      { name: 'تبريد', value: coolingCount },
      { name: 'هيدروليك', value: hydraulicCount },
      { name: 'سمكرة', value: bodyworkCount },
    ];

    const departmentVehiclesData = [
      { name: 'قسم الآليات', 'معدل التشغيل': 94, 'قيد الإصلاح': 2, 'متوقفة': 1 },
      { name: 'الشؤون الهندسية', 'معدل التشغيل': 88, 'قيد الإصلاح': 1, 'متوقفة': 0 },
      { name: 'قسم الاستثمار', 'معدل التشغيل': 75, 'قيد الإصلاح': 1, 'متوقفة': 2 },
    ];

    // Read-only report view lists
    const filteredReportOrders = orders.filter(o => {
      if (reportCategory !== 'all' && o.category !== reportCategory) return false;
      if (reportPriority !== 'all' && o.priority !== reportPriority) return false;
      return true;
    });

    const categoriesAr: Record<string, string> = {
      mechanical: 'صيانة ميكانيكية',
      electrical: 'صيانة كهربائية',
      cooling: 'أنظمة تبريد',
      hydraulic: 'أنظمة هيدروليكية',
      bodywork: 'سمكرة ودهان'
    };

    return (
      <div className={`space-y-6 ${language === 'ar' ? 'text-right' : 'text-left'} animate-fadeIn font-sans`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Header section with distinct read-only metadata badge */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-violet-600 text-white rounded-full text-[8.5px] font-black flex items-center gap-1">
                <FolderLock size={10} />
                <span>وضع العرض والتدقيق (قراءة فقط)</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-400 font-bold">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-2 flex-wrap">
              <span>بوابة المراقبة الفنية وتقارير جودة وصحة الأسطول</span>
              <ContextualHelp 
                id="viewer-dash"
                titleAr="بوابة المراقبة والتدقيق الفني"
                titleEn="Fleet Quality & Audit Controls"
                explanationAr="بوابة حصرية مخصصة لمراقبي الجودة ومديري التشغيل لاستعراض ومتابعة المؤشرات والتقارير الفنية للورش والآليات وقراءات MTBF ومعايير جودة العمليات."
                explanationEn="A specialized portal crafted for quality assurance officers to investigate status summaries, trace overall equipment effectiveness (OEE), and review MTBF indices."
                benefitsAr={[
                  "تتبع حي لموقع المركبات وحالتها الميدانية الحالية عبر الخرائط الجغرافية الفورية.",
                  "مراجعة إحصائيات ضغط العمل للورش والطاقة الاستيعابية لمربعات الصيانة.",
                  "تقييم دقيق لمؤشرات جودة الإصلاح من المرة الأولى وعمل مقارنات شهرية لتأكيد التحسن."
                ]}
                benefitsEn={[
                  "Trace instant geographical locations and live health indicators of assets.",
                  "Verify real-time workloads and active bays bottleneck distributions.",
                  "Monitor long-term FTR metrics and contrast performance across monthly intervals."
                ]}
                tipsAr={[
                  "انقر فوق أي أيقونة أو خلية بالخرائط المباشرة أو الرسوم البيانية لتحديث الفلاتر التفاعلية الجارية."
                ]}
                tipsEn={[
                  "Extract deep diagnostic insights by combining multiple graphical filters on the fly."
                ]}
                language={language}
              />
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
              أهلاً بك، {user.name} ({user.title}). يمنحك هذا الموديل وصولاً مستنداً فائقاً لمتابعة المؤشرات والتقارير الفنية للورش والآليات وقراءات MTBF.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <LanguageSwitcher />
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-soft shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-pulse"></span>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">حالة خادم التزامن السحابي:</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 font-sans">تحديث حي ومزامنة فورية ✔️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live GPS Fleet Map & Position Tracking */}
        <FleetMap vehicles={vehicles} />

        {/* Interactive Scheduled Maintenance Calendar View */}
        <MaintenanceCalendar 
          orders={orders}
          vehicles={vehicles}
          technicians={technicians}
          language={language}
          onNavigateToMaintenance={onNavigateToMaintenance}
        />

        {/* Monthly Maintenance Comparison Recharts Chart */}
        <MonthlyMaintenanceComparison 
          orders={orders}
          language={language}
        />

        {/* Dynamic Health Indexes (Read-only Dashboard) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-black">معدل سلامة الأسطول العام</span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-500 font-black px-1.5 py-0.5 rounded-lg">رائع</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-sans text-emerald-500">92.4%</span>
                <span className="text-[10px] text-slate-455 font-sans">+1.2% من الشهر الفائت</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92.4%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f1422] p-4.5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-black">متوسط الوقت بين الأعطال (MTBF)</span>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-500 font-black px-1.5 py-0.5 rounded-lg font-sans">46 يوماً</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-sans text-indigo-500">46 يوم</span>
                <span className="text-[10px] text-slate-455 font-sans">+3 أيام تحسن وقائي</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f1422] p-4.5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-black">جاهزية قطع الغيار بالمخازن</span>
              <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black px-1.5 py-0.5 rounded-lg">مستقر</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-sans text-amber-500">89.1%</span>
                <span className="text-[10px] text-slate-455 font-sans">-2.1% خروج القطع الصيفية</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '89.1%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f1422] p-4.5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-black">معدل رضاء الصيانة الفورية (FTR)</span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-500 font-black px-1.5 py-0.5 rounded-lg">ممتاز</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-sans text-emerald-600 dark:text-emerald-400">94.8%</span>
                <span className="text-[10px] text-slate-455 font-sans">+0.5% لشعبة الميكانيك</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: '94.8%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section using Recharts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart A: Fleet readiness and capacity analysis */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150/60 dark:border-slate-800 shadow-soft space-y-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-brand-blue-500/15">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-205 flex items-center gap-1.5">
                <FileBarChart2 size={14} className="text-brand-blue-500" />
                <span>تحليل جاهزية وحالة الآليات حسب قسم التشغيل</span>
              </h3>
              <span className="text-[8.5px] font-bold text-slate-400">إحصائيات الأقسام الثلاثة</span>
            </div>

            <div className="h-64 pr-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentVehiclesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: '10px', 
                      borderRadius: '12px', 
                      textAlign: 'right', 
                      direction: 'rtl',
                      backgroundColor: '#0f172a',
                      color: '#f8fafc',
                      border: '0px'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '9px', paddingBottom: '5px' }} />
                  <Bar dataKey="معدل التشغيل" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="قيد الإصلاح" fill="#ea580c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="متوقفة" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart B: Maintenance orders category breakdown */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150/60 dark:border-slate-800 shadow-soft space-y-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-rose-500/15">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-205 flex items-center gap-1.5">
                <Activity size={14} className="text-orange-500" />
                <span>توزع وبلاء الأعطال حسب الفئة الفنية</span>
              </h3>
              <span className="text-[8.5px] font-bold text-slate-400">تحليل الأخطاء والاهتراء</span>
            </div>

            <div className="h-64 pr-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={categoryChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: '10px', 
                      borderRadius: '12px', 
                      textAlign: 'right', 
                      direction: 'rtl',
                      backgroundColor: '#0f172a',
                      color: '#f8fafc',
                      border: '0px'
                    }} 
                  />
                  <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" name="عدد الأعطال" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Fleet health audit checklist report section (Read-only reports) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150/60 dark:border-slate-800 shadow-soft space-y-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-indigo-500/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/25 text-indigo-500 rounded-xl">
                <FileBarChart2 size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white">جدول تدقيق ومطابقة أوامر الصيانة (تقرير جرد الحالة)</h3>
                <p className="text-[9.5px] text-slate-405">يتيح وضع المراقب مراجعة شاملة لتقدم الإغلاق، كلفة الصيانات، وهويات الفنيين المسؤولين.</p>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="p-1.5 bg-slate-50 dark:bg-[#151d30] border border-slate-200 dark:border-slate-800 text-[10px] font-black rounded-lg text-slate-755 dark:text-slate-300 outline-none cursor-pointer"
                >
                  <option value="all">كافة الفئات الفنية</option>
                  <option value="mechanical">ميكانيك ثقيل</option>
                  <option value="electrical">كهرباء وأنظمة</option>
                  <option value="cooling">أنظمة تبريد</option>
                  <option value="hydraulic">ذراع وهيدروليك</option>
                  <option value="bodywork">سمكرة ودهان</option>
                </select>

                <select
                  value={reportPriority}
                  onChange={(e) => setReportPriority(e.target.value)}
                  className="p-1.5 bg-slate-50 dark:bg-[#151d30] border border-slate-200 dark:border-slate-800 text-[10px] font-black rounded-lg text-slate-755 dark:text-slate-300 outline-none cursor-pointer"
                >
                  <option value="all">كل درجات الخطورة</option>
                  <option value="high">طارئة وحرجة جداً</option>
                  <option value="medium">متوسطة الأولوية</option>
                  <option value="low">منخفضة عادي</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850">
                  <th className="py-2.5 px-4 font-black text-slate-450 text-[10px]">كود الأمر</th>
                  <th className="py-2.5 px-4 font-black text-slate-450 text-[10px]">نوع ووصف العطل</th>
                  <th className="py-2.5 px-4 font-black text-slate-450 text-[10px]">الآلية المستهدفة</th>
                  <th className="py-2.5 px-4 font-black text-slate-450 text-[10px]">الفني المسؤول</th>
                  <th className="py-2.5 px-4 font-black text-slate-450 text-[10px]">مستوى الخطورة</th>
                  <th className="py-2.5 px-4 font-black text-slate-450 text-[10px]">الحالة الفنية</th>
                  <th className="py-2.5 px-4 font-black text-slate-450 text-[10px] text-left">التكلفة التقديرية</th>
                  <th className="py-2.5 px-4 font-black text-slate-450 text-[10px] text-center">الإنجاز الميداني</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredReportOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[10.5px] text-slate-455 font-bold">لا يوجد مستندات أوامر تطابق فلترة البحث المختارة.</td>
                  </tr>
                ) : (
                  filteredReportOrders.map((ord) => {
                    const vehicle = vehicles.find(v => v.id === ord.vehicleId);
                    const tech = technicians.find(t => t.id === ord.technicianId);

                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-extrabold text-[#2563eb] dark:text-[#60a5fa]">{ord.orderNumber}</td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-slate-830 dark:text-slate-200 block">{ord.description}</span>
                            <span className="text-[8.5px] text-slate-400 font-bold block">{categoriesAr[ord.category] || ord.category}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-705 dark:text-slate-300 block">{vehicle ? vehicle.name : 'معدة مجهولة'}</span>
                          <span className="text-[8.5px] font-mono text-slate-400 block">{vehicle ? vehicle.plateNumber : '-'}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-bold">
                          {tech ? `👤 ${tech.name}` : '❌ لم يعين بعد'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-black ${
                            ord.priority === 'high' 
                              ? 'bg-rose-500/10 text-rose-500' 
                              : ord.priority === 'medium' 
                              ? 'bg-amber-500/10 text-amber-500' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {ord.priority === 'high' ? 'عالية خطيرة' : ord.priority === 'medium' ? 'متوسطة' : 'عادية'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-black ${
                            ord.status === 'completed' 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : ord.status === 'in-progress' 
                              ? 'bg-amber-500/10 text-amber-500' 
                              : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {ord.status === 'completed' ? 'منتهية' : ord.status === 'in-progress' ? 'قيد العمل' : 'معطلة'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-left font-mono font-black text-slate-800 dark:text-slate-200">
                          {ord.cost ? `${ord.cost.toLocaleString()} د.أ` : 'غير مسعر'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {(() => {
                            const progressVal = ord.progress || 0;
                            let colorClass = "from-rose-500 via-orange-500 to-amber-550"; // Late
                            let textClass = "text-rose-500 dark:text-rose-450";
                            if (progressVal === 100) {
                              colorClass = "from-emerald-500 to-teal-400"; // Completed
                              textClass = "text-emerald-500 dark:text-emerald-400";
                            } else if (progressVal >= 35) {
                              colorClass = "from-amber-400 via-brand-blue-500 to-indigo-500"; // Good
                              textClass = "text-brand-blue-600 dark:text-brand-blue-400";
                            }
                            return (
                              <div className="flex items-center justify-end gap-2">
                                <span className={`font-mono text-[9px] font-black ${textClass}`}>{progressVal}%</span>
                                <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0 block">
                                  <div 
                                    className={`h-full rounded-full bg-gradient-to-l ${colorClass} transition-all duration-300`} 
                                    style={{ width: `${progressVal}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Informative Report Footnote */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850 flex items-center gap-2 text-slate-455 leading-normal">
          <Info size={14} className="text-[#2563eb] shrink-0" />
          <p className="text-[9.5px]">
            <strong>تنويه تدقيق:</strong> هذا الجدول والمؤشرات الإجرائية أعلاه هي ملفات قراءة فقط للمراقبين والمفتشين الأمنيين. لحقن أو تعديل أوامر الصيانة، يرجى التبديل لنمط (مدير نظام) أو (فني ورشة) من بوابة التبويب والتسجيل.
          </p>
        </div>
      </div>
    );
  }

  const departments = [
    { 
      name: language === 'ar' ? 'قسم الآليات' : 'Transport Fleet Dept', 
      sub: language === 'ar' ? '3 شعب فنية' : '3 Tech Units', 
      vehicles: 45, 
      icon: <Truck className="text-brand-blue-500" /> 
    },
    { 
      name: language === 'ar' ? 'قسم الشؤون الهندسية' : 'Engineering Affairs', 
      sub: language === 'ar' ? '2 شعبة' : '2 Units', 
      vehicles: 28, 
      icon: <Wrench className="text-brand-green-500" /> 
    },
    { 
      name: language === 'ar' ? 'قسم الاستثمار' : 'Investment Operations', 
      sub: language === 'ar' ? '4 شعب تشغيلية' : '4 Ops Units', 
      vehicles: 32, 
      icon: <Truck className="text-brand-blue-500" /> 
    },
  ];

  return (
    <div className={`space-y-8 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {language === 'ar' ? 'لوحة المعلومات والتحكم العام' : 'Dashboard Panel'}
            </h1>
            <ContextualHelp 
              id="dashboard"
              titleAr="لوحة تحكم الأسطول المركزية"
              titleEn="Central Fleet Dashboard"
              explanationAr="لوحة تحليلات شاملة تتيح مراقبة وتتبع حالة كافة مركبات ومعدات الأسطول، وحساب الجاهزية التشغيلية اليومية، وتوفر الورش الفنية في الوقت الحقيقي."
              explanationEn="A complete analytical cockpit to inspect and control the status of all fleet vehicles, instantly calculated operational availability, and workshop load in real-time."
              benefitsAr={[
                "رؤية 360 درجة لجميع تفاصيل الصيانة والتكلفة الإجمالية في شاشة واحدة.",
                "معالجة سريعة لطلبات الخدمة المعلقة وتتبع ذكي لمؤشرات استهلاك الوقود والانبعاثات.",
                "مراقبة الإنتاجية الإجمالية للمشغلين والفنيين والورش بشكل فوري."
              ]}
              benefitsEn={[
                "Full 360-degree control over active work tickets and spare inventory values under a single view.",
                "Fast-track processing for waiting tasks with native real-time status telemetry.",
                "Monitor technician allocation levels and average repair cycles."
              ]}
              tipsAr={[
                "انقر على بطاقات الأرقام الكبيرة في الأعلى لتصفية الأسطول حسب الحالة والتركيز السريع على التنبيهات النشطة."
              ]}
              tipsEn={[
                "Click on any top metric card to instantly filter elements and isolate high-priority fleet warnings."
              ]}
              language={language}
            />
          </div>
          <p className="text-xs text-slate-505 dark:text-slate-400">
            {language === 'ar' 
              ? `مرحباً ${user.name}، إليك حالة وطاقة حركة الأسطول اليوم.` 
              : `Hello ${user.name}, here is the current fleet activity status.`}
          </p>
        </div>

        <LanguageSwitcher />
      </div>

      {/* Quick Actions (إجراءات سريعة) */}
      <div className="bg-slate-50/70 dark:bg-slate-950/45 p-4.5 rounded-3xl border border-slate-150/60 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-right flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-blue-500/10 text-brand-blue-500 shrink-0 font-bold">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-row-reverse md:flex-row justify-end md:justify-start">
              <h3 className="text-xs font-black text-slate-850 dark:text-slate-100 leading-none">
                {language === 'ar' ? 'منصة الإجراءات السريعة والتحكم' : 'Quick Actions Hub'}
              </h3>
              <ContextualHelp 
                id="quick-actions"
                titleAr="منصة الإجراءات السريعة"
                titleEn="Quick Actions Hub"
                explanationAr="قسم تفاعلي يتيح لك تنفيذ العمليات اليومية الأكثر تكراراً في ميكانيك بنقرة واحدة سريعة مع القدرة على تخصيص وترتيب واجهتك."
                explanationEn="A fast-access panel allowing you to launch high-frequency operational features and open the modular widget customization dashboard."
                benefitsAr={[
                  "توفير 40% من وقت الوصول للبطاقات الفنية الصعبة.",
                  "الوصول السريع لـ (محرر لوحة القيادة) لترتيب وتصفية أدواتك كيفما تحب.",
                  "واجهات تتبع ذكية للسرعة والفعالية في إغلاق الإشعارات الحية."
                ]}
                benefitsEn={[
                  "Saves up to 40% time searching for diagnostic screens.",
                  "Access 'Dashboard Widget Manager' to drag-and-drop or select your daily widgets view.",
                  "Aesthetic controls optimized for field coordinators and administrative leaders."
                ]}
                language={language}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Dashboard Customization Trigger Button */}
          <button 
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black rounded-xl shadow-md shadow-amber-500/15 transition-all text-xs cursor-pointer focus:outline-none"
          >
            <Sliders size={13} strokeWidth={2.5} />
            <span>{language === 'ar' ? 'تخصيص لوحة القيادة ⚙️' : 'Customize Dashboard ⚙️'}</span>
          </button>

          <button 
            type="button"
            onClick={onNavigateToMaintenance}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue-500 hover:bg-brand-blue-600 font-black text-white rounded-xl shadow-md shadow-brand-blue-500/15 transition-all text-xs cursor-pointer focus:outline-none"
          >
            <Wrench size={13} strokeWidth={2.5} />
            <span>{language === 'ar' ? 'إضافة صيانة فورية 🛠️' : 'Add Immediate Maintenance'}</span>
          </button>

          <button 
            type="button"
            onClick={onNavigateToVehicles}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-black rounded-xl shadow-xs transition-all text-xs cursor-pointer focus:outline-none"
          >
            <Truck size={13} strokeWidth={2.5} />
            <span>{language === 'ar' ? 'إضافة مركبة جديدة 🚚' : 'Add New Vehicle'}</span>
          </button>
        </div>
      </div>

      {/* UPCOMING PERIODIC MAINTENANCE ALERTS (WITHIN 48 HOURS) */}
      <AnimatePresence>
        {upcomingSchedules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 border border-amber-200 dark:border-amber-800/65 bg-gradient-to-r from-amber-50/95 via-amber-50/50 to-white dark:from-amber-950/25 dark:via-amber-950/10 dark:to-slate-900 rounded-2xl p-5 shadow-sm text-right relative overflow-hidden"
            dir="rtl"
          >
            {/* Glowing amber accent bar */}
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-amber-500 animate-pulse" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0 border border-amber-300/30 shadow-xs">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex flex-wrap items-center gap-2">
                    <span>{language === 'ar' ? 'تنبيه صيانة وقائية ذكي: مركبات تقترب من موعد صيانتها (خلال ٤٨ ساعة) ⚠️' : 'Smart PM Alert: Vehicles Approaching Maintenance (Within 48h) ⚠️'}</span>
                    <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-500/25 text-amber-800 dark:text-amber-300 text-[10px] font-black rounded-full select-none animate-pulse">
                      {upcomingSchedules.length} {language === 'ar' ? 'تنبيهات نشطة' : 'Active alerts'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                    {language === 'ar' 
                      ? 'تم رصد المواعيد المجدولة التالية للصيانة الدورية خلال الـ ٤٨ ساعة القادمة. يرجى التنسيق مع شعبة الصيانة والفنيين الميدانيين لتجهيز قطع الغيار وبدء العمل.'
                      : 'The following vehicles are scheduled for critical PM within 48 hours. Please coordinate with field mechanics and workshop dispatchers to mobilize spare parts.'}
                  </p>
                </div>
              </div>

              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('periodic-maintenance')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black rounded-xl text-xs shadow-xs hover:shadow-md hover:shadow-amber-500/20 transition-all self-start md:self-center cursor-pointer whitespace-nowrap"
                >
                  {language === 'ar' ? 'إدارة خطط وجداول الصيانة 📅' : 'Manage PM Calendar 📅'}
                </button>
              )}
            </div>

            {/* List of vehicles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
              {upcomingSchedules.map(sched => {
                const vehicle = vehicles.find(v => v.id === sched.vehicleId) || { name: `مركبة #${sched.vehicleId}`, plateNumber: '---', type: 'شاحنة' };
                const systemDate = new Date('2026-05-23');
                const dueDateObj = new Date(sched.dueDate);
                const diffHours = Math.round((dueDateObj.getTime() - systemDate.getTime()) / (1000 * 60 * 60));

                return (
                  <div 
                    key={sched.id}
                    className="border border-amber-200/50 dark:border-amber-850 bg-white dark:bg-slate-900/60 p-4 rounded-xl flex flex-col justify-between hover:border-amber-350 dark:hover:border-amber-700/60 transition-all hover:shadow-xs group relative overflow-hidden"
                  >
                    {/* Tiny visual progress bar of remaining hours */}
                    <div className="absolute bottom-0 right-0 left-0 h-1 bg-slate-100 dark:bg-slate-800">
                      <div 
                        className="h-full bg-amber-500" 
                        style={{ width: `${Math.min(100, (diffHours / 48) * 100)}%` }}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black">
                            🚚
                          </div>
                          <div className="text-right">
                            <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 line-clamp-1">
                              {vehicle.name}
                            </h5>
                            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                              {vehicle.plateNumber}
                            </span>
                          </div>
                        </div>

                        {/* Remaining hours badge */}
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/15 text-[10px] font-black flex items-center gap-1 shrink-0 animate-pulse">
                          <Clock size={11} />
                          <span>
                            {language === 'ar' ? `متبقي ${diffHours} ساعة` : `${diffHours}h left`}
                          </span>
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-50 dark:border-slate-800 text-right space-y-1">
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
                          {language === 'ar' ? 'الخدمة الوقائية المطلوبة' : 'Required PM Service'}
                        </span>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-350 line-clamp-2 leading-relaxed">
                          {sched.title}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3.5 mt-2 flex items-center justify-between gap-2 border-t border-dashed border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        📅 {sched.dueDate}
                      </span>
                      
                      <button
                        onClick={() => {
                          if (onNavigateToTab) {
                            onNavigateToTab('periodic-maintenance');
                            setTimeout(() => {
                              window.dispatchEvent(new CustomEvent('notification-navigate', { detail: { tab: 'periodic-maintenance', item: vehicle.id } }));
                            }, 100);
                          }
                        }}
                        className="text-[10.5px] font-extrabold text-indigo-650 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{language === 'ar' ? 'معاينة وجدولة العمل 🛠️' : 'Schedule Action 🛠️'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DYNAMIC WIDGETS LAYOUT RENDERER */}
      <div className="space-y-8">
        {widgetConfigs
          .filter(widget => widget.visible)
          .map((widget) => {
            switch (widget.id) {
              case 'stats':
                return (
                  <div key={widget.id} className="animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatCard 
                        label={t('dashboard.totalVehicles')} 
                        value={totalVehiclesCount} 
                        icon={<Truck size={20} className="text-white shrink-0" />}
                        trend="+12"
                        trendUp={true}
                        gradientClass="from-brand-blue-500 to-[#38bdf8]"
                        iconBgGlow="hover:shadow-brand-blue-500/15"
                        trendBg="bg-brand-blue-50 dark:bg-brand-blue-950/40"
                        trendText="text-brand-blue-600 dark:text-[#38bdf8]"
                        cardBg="bg-sky-100/80 dark:bg-sky-950/50"
                        cardBorder="border-sky-200 dark:border-sky-800/80 hover:border-sky-300/80"
                        textColor="text-sky-950 dark:text-sky-100"
                        labelColor="text-sky-800 dark:text-sky-300"
                      />
                      <StatCard 
                        label={t('dashboard.underMaintenance')} 
                        value={underMaintenanceCount} 
                        icon={<Wrench size={20} className="text-white shrink-0" />}
                        trend="-2"
                        trendUp={false}
                        gradientClass="from-[#ea580c] to-[#fbbf24]"
                        iconBgGlow="hover:shadow-amber-500/15"
                        trendBg="bg-amber-50 dark:bg-amber-950/40"
                        trendText="text-amber-600 dark:text-amber-400"
                        cardBg="bg-amber-100/85 dark:bg-amber-950/50"
                        cardBorder="border-amber-200 dark:border-amber-800/80 hover:border-amber-300/80"
                        textColor="text-amber-950 dark:text-amber-100"
                        labelColor="text-amber-805 dark:text-amber-300"
                      />
                      <StatCard 
                        label={language === 'ar' ? 'صيانة مكتملة' : 'Completed Repairs'} 
                        value={completedOrdersCount} 
                        icon={<CheckCircle2 size={20} className="text-white shrink-0" />}
                        trend="+34"
                        trendUp={true}
                        gradientClass="from-brand-green-500 to-[#4ade80]"
                        iconBgGlow="hover:shadow-brand-green-500/15"
                        trendBg="bg-brand-green-50 dark:bg-emerald-950/40"
                        trendText="text-brand-green-600 dark:text-brand-green-400"
                        cardBg="bg-emerald-100/80 dark:bg-emerald-950/50"
                        cardBorder="border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-300/80"
                        textColor="text-emerald-950 dark:text-emerald-100"
                        labelColor="text-emerald-800 dark:text-emerald-300"
                      />
                      <StatCard 
                        label={language === 'ar' ? 'مهام صيانة معلقة وجارية' : 'Pending Tasks'} 
                        value={activeOrdersCount} 
                        icon={<Clock size={20} className="text-white shrink-0" />}
                        trend="+1"
                        trendUp={false}
                        gradientClass="from-[#d946ef] to-[#ec4899]"
                        iconBgGlow="hover:shadow-fuchsia-500/15"
                        trendBg="bg-fuchsia-50 dark:bg-fuchsia-950/30"
                        trendText="text-fuchsia-600 dark:text-fuchsia-400"
                        cardBg="bg-[#fae8ff] dark:bg-fuchsia-950/40"
                        cardBorder="border-fuchsia-200 dark:border-fuchsia-900/80 hover:border-fuchsia-300/80"
                        textColor="text-fuchsia-950 dark:text-fuchsia-100"
                        labelColor="text-fuchsia-800 dark:text-fuchsia-300"
                      />
                    </div>
                  </div>
                );
              case 'gps_map':
                return (
                  <div key={widget.id} className="animate-fadeIn">
                    <FleetMap vehicles={vehicles} />
                  </div>
                );
              case 'calendar':
                return (
                  <div key={widget.id} className="animate-fadeIn">
                    <MaintenanceCalendar 
                      orders={orders}
                      vehicles={vehicles}
                      technicians={technicians}
                      language={language}
                      onNavigateToMaintenance={onNavigateToMaintenance}
                    />
                  </div>
                );
              case 'analytics':
                return (
                  <div key={widget.id} className="animate-fadeIn">
                    <MonthlyMaintenanceComparison 
                      orders={orders}
                      language={language}
                    />
                  </div>
                );
              case 'spare_parts':
                return (
                  <div key={widget.id} className="animate-fadeIn">
                    <SparePartsConsumptionWidget 
                      inventory={inventory}
                      language={language}
                      orders={orders}
                      vehicles={vehicles}
                    />
                  </div>
                );
              case 'departments':
                return (
                  <div key={widget.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-brand-blue-500/15 animate-fadeIn">
                    <h2 className="text-base font-black text-slate-900 dark:text-white mb-4">
                      {language === 'ar' ? 'الأقسام والشعب الهندسية والفنية' : 'Technical & Operational Divisions'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
                      {departments.map((dept, index) => (
                        <motion.div 
                          key={index}
                          whileHover={{ y: -4 }}
                          onClick={() => {
                            if (onNavigateToTab) {
                              if (index === 0) onNavigateToTab('vehicles');
                              else if (index === 1) onNavigateToTab('maintenance');
                              else if (index === 2) onNavigateToTab('saas-billing');
                            }
                          }}
                          className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-brand-blue-300 dark:hover:border-brand-blue-700/60 transition-all duration-300 group cursor-pointer"
                        >
                          <div className="flex items-center gap-4 mb-4 flex-row">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:bg-brand-blue-50 dark:group-hover:bg-brand-blue-900/30 transition-colors">
                              {dept.icon}
                            </div>
                            <div className="text-right">
                              <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">{dept.name}</h3>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{dept.sub}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-800">
                            <div className="flex -space-x-2 rtl:space-x-reverse">
                              {[1,2,3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-750" />
                              ))}
                            </div>
                            <span className="text-xs font-black text-brand-blue-700 dark:text-brand-blue-400">
                              {dept.vehicles} {language === 'ar' ? 'مركبة نشطة' : 'Vehicles'}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              case 'critical_status':
                return (
                  <div key={widget.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-brand-blue-500/15 animate-fadeIn">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-black text-base text-slate-900 dark:text-white">
                        {language === 'ar' ? 'حالات المركبات العاجلة والحرجة' : 'Critical Vehicles Status'}
                      </h2>
                      <button 
                        onClick={() => onNavigateToTab?.('vehicles')}
                        className="text-xs text-brand-blue-600 dark:text-brand-blue-400 font-bold cursor-pointer hover:underline"
                      >
                        {language === 'ar' ? 'عرض ممر الفحص كليّاً ←' : 'Inspect Depot Queue ←'}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {vehicles.filter(v => v.status !== 'active').slice(0, 4).map((vehicle) => (
                        <div key={vehicle.id} className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/65 dark:bg-[#0c101c] dark:hover:bg-[#101524] border border-slate-100 dark:border-slate-850 transition-colors cursor-pointer">
                          <div className={`w-2.5 h-10 rounded-full shrink-0 ${
                            vehicle.status === 'maintenance' ? 'bg-orange-500' : 'bg-rose-500'
                          }`} />
                          <div className="flex-1 min-w-0 pr-1 text-right">
                            <p className="font-extrabold text-xs text-slate-855 dark:text-white truncate">{vehicle.name}</p>
                            <p className="text-[10px] text-slate-450 truncate font-mono">{vehicle.plateNumber}</p>
                          </div>
                          <div className={`text-[9px] font-black px-2.5 py-1 rounded-lg shrink-0 ${
                            vehicle.status === 'maintenance' 
                              ? 'bg-orange-500/10 text-orange-600 dark:text-orange-450' 
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-450'
                          }`}>
                            {vehicle.status === 'maintenance' 
                              ? (language === 'ar' ? 'صيانة طارئة' : 'Repair') 
                              : (language === 'ar' ? 'متوقفة كلياً' : 'Stopped')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              case 'tech_report':
                return (
                  <div key={widget.id} className="animate-fadeIn">
                    <TechnicalPerformanceReport 
                      orders={orders}
                      language={language}
                    />
                  </div>
                );
              default:
                return null;
            }
          })}
      </div>

      {/* DYNAMIC DASHBOARD WIDGET CONFIGURATION CONTROL DRAWER */}
      <AnimatePresence>
        {isCustomizerOpen && (
          <div className="fixed inset-0 z-55 overflow-hidden flex justify-end" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Backdrop with elegant blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCustomizerOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs cursor-pointer"
            />

            {/* Panel Sheet */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`relative w-full max-w-md bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-805 shadow-2xl h-full flex flex-col z-10 ${language === 'ar' ? 'text-right' : 'text-left'} font-sans`}
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                    <Sliders size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-sm">
                      {language === 'ar' ? 'محرر ومخصص لوحة القيادة' : 'Dashboard Widget Manager'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {language === 'ar' ? 'رتّب واختر أدوات وعناصر شاشتك الرئيسية' : 'Reorder & choose widgets showing on your main screen'}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsCustomizerOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-705 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850 text-[10.5px] text-slate-500 leading-relaxed font-bold">
                  💡 {language === 'ar' 
                    ? 'قم بتشغيل أو إيقاف الأداة باستخدام مفتاح التشغيل، واستخدم أزرار الأسهم لنقلها للأعلى أو الأسفل وتنسيق المظهر المناسب لمهامك اليومية.'
                    : 'Use the eye toggle to show or hide a widget, and click the up/down arrows to perfectly arrange their display order.'}
                </div>

                <div className="space-y-2.5">
                  {widgetConfigs.map((widget, index) => {
                    const title = language === 'ar' ? widget.titleAr : widget.titleEn;
                    return (
                      <div 
                        key={widget.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                          widget.visible 
                            ? 'bg-white dark:bg-[#101524] border-slate-150/70 dark:border-slate-800 shadow-xs' 
                            : 'bg-slate-50/50 dark:bg-[#0c0f1a]/45 border-slate-100 dark:border-slate-850 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 pr-1">
                          {/* Widget Icon indicator */}
                          <div className={`p-2 rounded-xl border ${
                            widget.visible 
                              ? 'bg-brand-blue-500/10 text-brand-blue-500 border-brand-blue-500/20' 
                              : 'bg-slate-150 dark:bg-slate-800 text-slate-450 border-transparent'
                          }`}>
                            {widget.id === 'stats' && <Layers size={14} />}
                            {widget.id === 'gps_map' && <MapPin size={14} />}
                            {widget.id === 'calendar' && <Calendar size={14} />}
                            {widget.id === 'analytics' && <FileBarChart2 size={14} />}
                            {widget.id === 'spare_parts' && <Package size={14} />}
                            {widget.id === 'departments' && <Building2 size={14} />}
                            {widget.id === 'critical_status' && <AlertTriangle size={14} />}
                          </div>

                          <div className="text-right">
                            <p className="font-extrabold text-[11px] text-slate-850 dark:text-slate-200 leading-tight">{title}</p>
                            <p className="text-[8.5px] text-slate-400 font-mono mt-0.5">ID: {widget.id}</p>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Arrow Controls */}
                          <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-850">
                            <button
                              disabled={index === 0}
                              onClick={() => moveWidgetUp(index)}
                              className={`p-1 rounded-md transition-all ${
                                index === 0 
                                  ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' 
                                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 cursor-pointer'
                              }`}
                            >
                              <MoveUp size={12} />
                            </button>
                            <button
                              disabled={index === widgetConfigs.length - 1}
                              onClick={() => moveWidgetDown(index)}
                              className={`p-1 rounded-md transition-all ${
                                index === widgetConfigs.length - 1 
                                  ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' 
                                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 cursor-pointer'
                              }`}
                            >
                              <MoveDown size={12} />
                            </button>
                          </div>

                          {/* Visibility toggle */}
                          <button
                            onClick={() => toggleWidgetVisibility(widget.id)}
                            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                              widget.visible 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20' 
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-405 hover:bg-rose-500/20'
                            }`}
                            title={widget.visible ? 'إخفاء الأداة' : 'إظهار الأداة'}
                          >
                            {widget.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/20 flex items-center justify-between gap-3">
                <button
                  onClick={resetWidgetConfig}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-750 dark:text-slate-300 font-bold rounded-xl text-[10px] transition-all cursor-pointer focus:outline-none"
                >
                  <RotateCcw size={12} />
                  <span>{language === 'ar' ? 'تعيين الافتراضي' : 'Reset defaults'}</span>
                </button>

                <button
                  onClick={() => setIsCustomizerOpen(false)}
                  className="px-5 py-2 hover:bg-brand-blue-650 bg-brand-blue-500 text-white font-black rounded-xl text-[10.5px] transition-all shadow-md cursor-pointer focus:outline-none"
                >
                  {language === 'ar' ? 'حفظ وتطبيق الخيارات' : 'Apply changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
