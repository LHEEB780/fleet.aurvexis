import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend,
  Line,
  ComposedChart,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  Wrench, 
  Activity, 
  BarChart3, 
  PieChart as PieIcon,
  User,
  Calendar,
  Layers
} from 'lucide-react';
import { MaintenanceOrder } from '../types';

interface TechnicalPerformanceReportProps {
  orders: MaintenanceOrder[];
  language: 'ar' | 'en';
}

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const MONTHS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function TechnicalPerformanceReport({ orders, language }: TechnicalPerformanceReportProps) {
  // Tabs System
  const [activeTab, setActiveTab] = useState<'distribution' | 'monthly-completion' | 'yearly-breakdowns'>('distribution');
  
  // Interactive Filters
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'30days' | 'all'>('30days');
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  // Compute reference date and 30 days range for the main distribution tab
  const referenceDate = useMemo(() => {
    if (!orders || orders.length === 0) return new Date('2026-06-24');
    const dates = orders.map(o => new Date(o.date).getTime()).filter(t => !isNaN(t));
    if (dates.length === 0) return new Date('2026-06-24');
    return new Date(Math.max(...dates));
  }, [orders]);

  const thirtyDaysAgo = useMemo(() => {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - 30);
    return d;
  }, [referenceDate]);

  // Filter orders for the current category distribution tab
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (timeRange === 'all') return orders;
    return orders.filter(o => {
      const orderDate = new Date(o.date);
      return orderDate >= thirtyDaysAgo && orderDate <= referenceDate;
    });
  }, [orders, thirtyDaysAgo, referenceDate, timeRange]);

  // Calculate category distribution (Current distribution tab)
  const distributionData = useMemo(() => {
    const counts: Record<string, number> = {
      mechanical: 0,
      electrical: 0,
      cooling: 0,
      hydraulic: 0,
      bodywork: 0,
    };

    filteredOrders.forEach(o => {
      const cat = o.category || 'mechanical';
      if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts.mechanical++;
      }
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return [
      { 
        id: 'mechanical', 
        name: language === 'ar' ? 'ميكانيكي' : 'Mechanical', 
        value: counts.mechanical, 
        percentage: total > 0 ? Math.round((counts.mechanical / total) * 100) : 0,
        color: '#3b82f6', // Bright Blue
        description: language === 'ar' ? 'المحركات، الفرامل ونواقل الحركة' : 'Engines, brakes & transmissions'
      },
      { 
        id: 'electrical', 
        name: language === 'ar' ? 'كهربائي' : 'Electrical', 
        value: counts.electrical, 
        percentage: total > 0 ? Math.round((counts.electrical / total) * 100) : 0,
        color: '#eab308', // Warm Amber
        description: language === 'ar' ? 'التوصيلات، الحساسات والبطاريات' : 'Wiring, sensors & batteries'
      },
      { 
        id: 'cooling', 
        name: language === 'ar' ? 'تبريد' : 'Cooling', 
        value: counts.cooling, 
        percentage: total > 0 ? Math.round((counts.cooling / total) * 100) : 0,
        color: '#06b6d4', // Cyan
        description: language === 'ar' ? 'أنظمة التبريد والرديتر والمكيف' : 'Cooling systems & radiators'
      },
      { 
        id: 'hydraulic', 
        name: language === 'ar' ? 'هيدروليك' : 'Hydraulic', 
        value: counts.hydraulic, 
        percentage: total > 0 ? Math.round((counts.hydraulic / total) * 100) : 0,
        color: '#a855f7', // Purple
        description: language === 'ar' ? 'المكابس، الرافعات وخزانات الضغط' : 'Pistons, hoists & fluid lines'
      },
      { 
        id: 'bodywork', 
        name: language === 'ar' ? 'هيكل' : 'Bodywork', 
        value: counts.bodywork, 
        percentage: total > 0 ? Math.round((counts.bodywork / total) * 100) : 0,
        color: '#f43f5e', // Rose
        description: language === 'ar' ? 'الشاسيه، الصدمات والطلاء الخارجي' : 'Chassis, dents & exterior paint'
      }
    ].sort((a, b) => b.value - a.value); // Sort by prevalence
  }, [filteredOrders, language]);

  // Compute overall statistics for the distribution tab
  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const critical = filteredOrders.filter(o => o.priority === 'high').length;
    const completed = filteredOrders.filter(o => o.status === 'completed').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 100;

    const mostCommon = distributionData[0]?.value > 0 ? distributionData[0] : null;

    return {
      total,
      critical,
      completionRate,
      mostCommon
    };
  }, [filteredOrders, distributionData]);

  // Technicians static list for filter
  const techniciansList = useMemo(() => {
    return [
      { id: 'all', name: language === 'ar' ? 'جميع الفنيين' : 'All Technicians' },
      { id: '201', name: language === 'ar' ? 'أحمد حميد رشيد' : 'Ahmed Hameed' },
      { id: '202', name: language === 'ar' ? 'محمد خالد' : 'Mohammed Khaled' },
      { id: '203', name: language === 'ar' ? 'سالم حسن' : 'Salem Hassan' },
      { id: '204', name: language === 'ar' ? 'فهد العتيبي' : 'Fahad Al-Otaibi' }
    ];
  }, [language]);

  // Years list for filter
  const yearsList = useMemo(() => {
    return [
      { id: 'all', name: language === 'ar' ? 'جميع السنوات' : 'All Years' },
      { id: '2026', name: '2026' },
      { id: '2025', name: '2025' },
      { id: '2024', name: '2024' }
    ];
  }, [language]);

  // Calculate Monthly Completion Rate of Technicians
  const monthlyCompletionData = useMemo(() => {
    const data = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      monthName: language === 'ar' ? MONTHS_AR[i] : MONTHS_EN[i],
      total: 0,
      completed: 0,
    }));

    orders.forEach(order => {
      if (!order.date) return;
      const parts = order.date.split('-');
      if (parts.length < 2) return;

      const year = parts[0];
      const monthVal = parseInt(parts[1], 10);
      if (isNaN(monthVal) || monthVal < 1 || monthVal > 12) return;
      const monthIdx = monthVal - 1;

      // Filter by year if applicable
      if (selectedYear !== 'all' && year !== selectedYear) return;

      // Filter by technician if applicable
      if (selectedTechnicianId !== 'all' && order.technicianId !== selectedTechnicianId) return;

      data[monthIdx].total++;
      if (order.status === 'completed') {
        data[monthIdx].completed++;
      }
    });

    return data.map(d => ({
      ...d,
      rateKey: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
      [language === 'ar' ? 'معدل الإنجاز (%)' : 'Completion Rate (%)']: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
      [language === 'ar' ? 'المهام الكلية' : 'Total Tasks']: d.total,
      [language === 'ar' ? 'المهام المكتملة' : 'Completed Tasks']: d.completed,
    }));
  }, [orders, selectedYear, selectedTechnicianId, language]);

  // Calculate Monthly Breakdown Distribution during the year
  const yearlyFaultDistribution = useMemo(() => {
    const categories = [
      { key: 'mechanical', label: language === 'ar' ? 'ميكانيكي' : 'Mechanical', color: '#3b82f6' },
      { key: 'electrical', label: language === 'ar' ? 'كهربائي' : 'Electrical', color: '#eab308' },
      { key: 'cooling', label: language === 'ar' ? 'تبريد' : 'Cooling', color: '#06b6d4' },
      { key: 'hydraulic', label: language === 'ar' ? 'هيدروليك' : 'Hydraulic', color: '#a855f7' },
      { key: 'bodywork', label: language === 'ar' ? 'هيكل' : 'Bodywork', color: '#f43f5e' }
    ];

    const data = Array.from({ length: 12 }, (_, i) => {
      const item: any = {
        monthIndex: i,
        monthName: language === 'ar' ? MONTHS_AR[i] : MONTHS_EN[i],
        total: 0
      };
      categories.forEach(cat => {
        item[cat.label] = 0;
      });
      return item;
    });

    orders.forEach(order => {
      if (!order.date) return;
      const parts = order.date.split('-');
      if (parts.length < 2) return;

      const year = parts[0];
      const monthVal = parseInt(parts[1], 10);
      if (isNaN(monthVal) || monthVal < 1 || monthVal > 12) return;
      const monthIdx = monthVal - 1;

      // Filter by year if applicable
      if (selectedYear !== 'all' && year !== selectedYear) return;

      const catKey = order.category || 'mechanical';
      const catObj = categories.find(c => c.key === catKey) || categories[0];
      
      data[monthIdx][catObj.label]++;
      data[monthIdx].total++;
    });

    return {
      data,
      categories
    };
  }, [orders, selectedYear, language]);

  // Custom Pie Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 shadow-xl text-xs space-y-1 text-right" dir="rtl">
          <p className="font-extrabold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color || data.payload?.color }} />
            {data.name}
          </p>
          <p className="text-slate-300">
            {language === 'ar' ? 'عدد الأعطال:' : 'Faults count:'} <span className="font-mono font-bold text-white">{data.value}</span>
          </p>
          <p className="text-slate-400 text-[10px]">
            {language === 'ar' ? 'النسبة المئوية:' : 'Percentage:'} <span className="font-mono">{data.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Monthly Completion Tooltip
  const MonthlyCompletionTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const completionRate = payload.find((p: any) => p.dataKey === (language === 'ar' ? 'معدل الإنجاز (%)' : 'Completion Rate (%)'))?.value ?? 0;
      const totalTasks = payload.find((p: any) => p.dataKey === (language === 'ar' ? 'المهام الكلية' : 'Total Tasks'))?.value ?? 0;
      const completedTasks = payload.find((p: any) => p.dataKey === (language === 'ar' ? 'المهام المكتملة' : 'Completed Tasks'))?.value ?? 0;

      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 shadow-xl text-xs space-y-2 text-right" dir="rtl">
          <p className="font-black border-b border-slate-800 pb-1 text-indigo-400">{label}</p>
          <div className="space-y-1">
            <p className="flex justify-between gap-6">
              <span className="text-slate-400">{language === 'ar' ? 'معدل الإنجاز:' : 'Completion Rate:'}</span>
              <span className="font-black text-emerald-400 font-sans">{completionRate}%</span>
            </p>
            <p className="flex justify-between gap-6">
              <span className="text-slate-400">{language === 'ar' ? 'المهام الكلية الموكلة:' : 'Total Assigned:'}</span>
              <span className="font-bold text-white font-sans">{totalTasks}</span>
            </p>
            <p className="flex justify-between gap-6">
              <span className="text-slate-400">{language === 'ar' ? 'المهام المنجزة:' : 'Completed Tasks:'}</span>
              <span className="font-bold text-sky-400 font-sans">{completedTasks}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Yearly Breakdown Tooltip
  const YearlyBreakdownTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const activePayload = payload.filter((p: any) => p.value > 0);
      const total = activePayload.reduce((sum: number, p: any) => sum + p.value, 0);

      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 shadow-xl text-xs space-y-2 text-right" dir="rtl">
          <p className="font-black border-b border-slate-800 pb-1 text-indigo-400">
            {label} {selectedYear !== 'all' ? `(${selectedYear})` : ''}
          </p>
          {activePayload.length === 0 ? (
            <p className="text-slate-400 text-[10px]">{language === 'ar' ? 'لا توجد أعطال مسجلة' : 'No recorded breakdowns'}</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {activePayload.map((p: any, idx: number) => (
                <p key={idx} className="flex justify-between gap-6 items-center">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill || p.color }} />
                    {p.name}
                  </span>
                  <span className="font-bold text-white font-sans">{p.value} {language === 'ar' ? 'عطل' : 'fault(s)'}</span>
                </p>
              ))}
              <div className="border-t border-slate-800 pt-1.5 mt-1 flex justify-between font-black text-white text-[11px]">
                <span>{language === 'ar' ? 'إجمالي الأعطال:' : 'Total Faults:'}</span>
                <span className="font-mono text-emerald-400">{total}</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="technical-performance-report-widget" className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-soft animate-fadeIn text-right" dir="rtl">
      {/* Header section with title and global info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-blue-50 dark:bg-brand-blue-950/30 flex items-center justify-center text-brand-blue-600 dark:text-brand-blue-400 shadow-sm shrink-0">
            <Activity size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{language === 'ar' ? 'مركز التحليلات والتقارير الفنية للتشغيل' : 'Technical Analytics & Operational Reports'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold">
              {language === 'ar' 
                ? 'لوحة تفاعلية متكاملة لتحليل الأداء الإداري ومعدلات إنجاز الفنيين وتوزيع أعطال المركبات بالأسطول' 
                : 'Interactive management dashboard for technician resolution rates and fleet breakdown logs'
              }
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap bg-slate-50 dark:bg-slate-950 p-1 rounded-2xl border border-slate-100 dark:border-slate-850 gap-1 w-full md:w-auto self-start">
          <button
            id="tab-distribution"
            onClick={() => setActiveTab('distribution')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
              activeTab === 'distribution' 
                ? 'bg-white dark:bg-slate-900 text-brand-blue-600 dark:text-brand-blue-400 shadow-sm border border-slate-150/40 dark:border-slate-800' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers size={13} />
            <span>{language === 'ar' ? 'الأعطال الأخيرة' : 'Recent Faults'}</span>
          </button>
          <button
            id="tab-monthly-completion"
            onClick={() => setActiveTab('monthly-completion')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
              activeTab === 'monthly-completion' 
                ? 'bg-white dark:bg-slate-900 text-brand-blue-600 dark:text-brand-blue-400 shadow-sm border border-slate-150/40 dark:border-slate-800' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User size={13} />
            <span>{language === 'ar' ? 'إنجاز الفنيين الشهري' : 'Monthly Tech Success'}</span>
          </button>
          <button
            id="tab-yearly-breakdowns"
            onClick={() => setActiveTab('yearly-breakdowns')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
              activeTab === 'yearly-breakdowns' 
                ? 'bg-white dark:bg-slate-900 text-brand-blue-600 dark:text-brand-blue-400 shadow-sm border border-slate-150/40 dark:border-slate-800' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar size={13} />
            <span>{language === 'ar' ? 'توزيع أعطال العام' : 'Yearly Fault Distribution'}</span>
          </button>
        </div>
      </div>

      {/* ----------------- TAB 1: CURRENT DISTRIBUTION ----------------- */}
      {activeTab === 'distribution' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/20 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              {language === 'ar' ? 'تصفية نطاق توزيع الأعطال الفني:' : 'Filter technical fault scope:'}
            </div>
            
            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              {/* Chart Type Toggle */}
              <div className="bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center gap-1">
                <button
                  id="chart-toggle-pie"
                  onClick={() => setChartType('pie')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    chartType === 'pie' 
                      ? 'bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-100 dark:border-slate-800' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title={language === 'ar' ? 'مخطط دائري' : 'Pie Chart'}
                >
                  <PieIcon size={14} />
                </button>
                <button
                  id="chart-toggle-bar"
                  onClick={() => setChartType('bar')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    chartType === 'bar' 
                      ? 'bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-100 dark:border-slate-800' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title={language === 'ar' ? 'مخطط شريطي' : 'Bar Chart'}
                >
                  <BarChart3 size={14} />
                </button>
              </div>

              {/* Time Range Filter */}
              <div className="bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center gap-1">
                <button
                  id="time-range-30days"
                  onClick={() => setTimeRange('30days')}
                  className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                    timeRange === '30days' 
                      ? 'bg-slate-50 dark:bg-slate-900 text-brand-blue-600 dark:text-brand-blue-400 shadow-xs border border-slate-100 dark:border-slate-800' 
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {language === 'ar' ? 'آخر 30 يوماً' : '30 Days'}
                </button>
                <button
                  id="time-range-all"
                  onClick={() => setTimeRange('all')}
                  className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                    timeRange === 'all' 
                      ? 'bg-slate-50 dark:bg-slate-900 text-brand-blue-600 dark:text-brand-blue-400 shadow-xs border border-slate-100 dark:border-slate-800' 
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {language === 'ar' ? 'الكل' : 'All-Time'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Chart */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center border border-slate-50 dark:border-slate-800/50 p-4 rounded-2xl bg-slate-50/[0.3] dark:bg-slate-950/20 h-64 relative overflow-hidden">
              {stats.total === 0 ? (
                <div className="text-center space-y-2 p-6">
                  <AlertTriangle size={32} className="text-slate-300 dark:text-slate-700 mx-auto animate-bounce" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {language === 'ar' ? 'لا توجد بيانات صيانة مسجلة للفترة المحددة' : 'No maintenance orders found in this period'}
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'pie' ? (
                    <PieChart>
                      <Pie
                        data={distributionData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {distributionData.filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  ) : (
                    <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#101726" className="hidden dark:block" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}

              {/* Center Text for Pie Chart */}
              {chartType === 'pie' && stats.total > 0 && (
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? 'المجموع' : 'Total'}</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white font-sans">{stats.total}</span>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">{language === 'ar' ? 'حالة صيانة' : 'orders'}</span>
                </div>
              )}
            </div>

            {/* Progress tracks on the right */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span>{language === 'ar' ? 'مؤشر تكرار الأعطال والمستوى التشغيلي' : 'Fault Recurrence & Structural Severity'}</span>
              </h3>

              <div className="space-y-3.5">
                {distributionData.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-md" style={{ backgroundColor: item.color }} />
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{item.name}</span>
                        <span className="text-[9.5px] text-slate-450 font-bold hidden sm:inline">• {item.description}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-sans">
                        <span className="font-extrabold text-slate-900 dark:text-white">{item.value}</span>
                        <span className="text-slate-400">({item.percentage}%)</span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: MONTHLY COMPLETION OF TECHNICIANS ----------------- */}
      {activeTab === 'monthly-completion' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Interactive Filters Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            {/* Tech filter dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold block uppercase tracking-wide">
                {language === 'ar' ? 'الفني المختص:' : 'Assigned Technician:'}
              </label>
              <select
                id="select-tech-filter"
                value={selectedTechnicianId}
                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                className="w-full bg-white dark:bg-[#121829] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-750 dark:text-slate-200 focus:ring-1 focus:ring-brand-blue-500 outline-none cursor-pointer"
              >
                {techniciansList.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Year filter dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold block uppercase tracking-wide">
                {language === 'ar' ? 'السنة المحددة:' : 'Selected Year:'}
              </label>
              <select
                id="select-year-filter"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-white dark:bg-[#121829] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-750 dark:text-slate-200 focus:ring-1 focus:ring-brand-blue-500 outline-none cursor-pointer"
              >
                {yearsList.map(y => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
            </div>

            {/* Stats Summary for filters */}
            <div className="flex flex-col justify-end">
              <div className="bg-indigo-500/[0.03] border border-indigo-500/10 p-2 px-3 rounded-xl flex items-center justify-between text-xs font-bold text-indigo-650 dark:text-indigo-400 leading-none h-[34px]">
                <span>{language === 'ar' ? 'إجمالي المهام المصنفة:' : 'Categorized Tasks:'}</span>
                <span className="font-sans font-black bg-indigo-500/10 px-2 py-1 rounded-md">
                  {monthlyCompletionData.reduce((sum, d) => sum + d.total, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Recharts Composed Chart (Bar + Line) */}
          <div className="border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl bg-slate-50/[0.1] dark:bg-slate-950/10">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-emerald-500" />
              <span>
                {language === 'ar' 
                  ? 'مؤشر أداء الإنجاز الشهري للعمليات الفنية (%)' 
                  : 'Monthly Technical Performance & SLA Completion Ratio (%)'
                }
              </span>
            </h3>

            <div className="h-64 w-full">
              {monthlyCompletionData.every(d => d.total === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                  <AlertTriangle size={28} className="text-amber-500 animate-pulse" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {language === 'ar' ? 'لا توجد مهام صيانة موكلة لهذا الفني في السنة المحددة' : 'No maintenance tasks assigned to this technician in this year'}
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyCompletionData} margin={{ top: 10, right: -10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                    <CartesianGrid strokeDasharray="3 3" stroke="#101726" className="hidden dark:block" />
                    <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#10b981" fontSize={9} tickLine={false} domain={[0, 100]} unit="%" label={{ value: language === 'ar' ? 'معدل الإنجاز (%)' : 'SLA %', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#10b981', fontSize: '8px', fontWeight: 'bold' } }} />
                    <YAxis yAxisId="right" stroke="#6366f1" fontSize={9} tickLine={false} orientation="right" label={{ value: language === 'ar' ? 'عدد المهام' : 'Tasks Count', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#6366f1', fontSize: '8px', fontWeight: 'bold' } }} />
                    <Tooltip content={<MonthlyCompletionTooltip />} />
                    <Bar yAxisId="right" dataKey={language === 'ar' ? 'المهام الكلية' : 'Total Tasks'} fill="#818cf8" fillOpacity={0.15} stroke="#6366f1" strokeWidth={1} radius={[3, 3, 0, 0]} maxBarSize={25} />
                    <Line yAxisId="left" type="monotone" dataKey={language === 'ar' ? 'معدل الإنجاز (%)' : 'Completion Rate (%)'} stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Grid summary cards for months */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {monthlyCompletionData.map((d, idx) => {
              if (d.total === 0) return null;
              return (
                <div key={idx} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#121829] shadow-xs text-center space-y-1">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 block">{d.monthName}</span>
                  <span className="text-base font-sans font-black text-slate-850 dark:text-white block">{d.rateKey}%</span>
                  <span className="text-[8.5px] font-bold text-slate-400 block">
                    {language === 'ar' ? `${d.completed} من ${d.total} مكتمل` : `${d.completed} of ${d.total} done`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- TAB 3: YEARLY BREAKDOWNS DISTRIBUTION ----------------- */}
      {activeTab === 'yearly-breakdowns' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Filters Panel */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              {language === 'ar' ? 'اختر السنة لتتبع دورة حياة وتوزيع الأعطال على مدار الأشهر:' : 'Choose Year to track breakdown lifecycles:'}
            </div>

            <div className="w-full sm:w-48">
              <select
                id="select-year-yearly-breakdown"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-white dark:bg-[#121829] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-750 dark:text-slate-200 focus:ring-1 focus:ring-brand-blue-500 outline-none cursor-pointer"
              >
                {yearsList.map(y => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stacked Recharts Bar Chart */}
          <div className="border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl bg-slate-50/[0.1] dark:bg-slate-950/10">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
              <Layers size={14} className="text-indigo-500" />
              <span>
                {language === 'ar' 
                  ? 'رسم بياني لتوزيع وتكرار أعطال المركبات التراكمية شهرياً' 
                  : 'Cumulative Monthly Breakdown of Fleet Vehicle Breakdowns'
                }
              </span>
            </h3>

            <div className="h-64 w-full">
              {yearlyFaultDistribution.data.every(d => d.total === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                  <AlertTriangle size={28} className="text-rose-500 animate-pulse" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {language === 'ar' ? 'لا توجد أعطال مسجلة في السنة المحددة' : 'No recorded breakdowns in this selected year'}
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyFaultDistribution.data} margin={{ top: 10, right: -10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                    <CartesianGrid strokeDasharray="3 3" stroke="#101726" className="hidden dark:block" />
                    <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<YearlyBreakdownTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }} />
                    {yearlyFaultDistribution.categories.map((cat, index) => (
                      <Bar
                        key={cat.key}
                        dataKey={cat.label}
                        stackId="a"
                        fill={cat.color}
                        maxBarSize={25}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Color Guides and Explanations */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {yearlyFaultDistribution.categories.map((cat, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-100 dark:border-slate-855 bg-slate-50/[0.4] dark:bg-[#121829]/50 flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-md shrink-0 block" style={{ backgroundColor: cat.color }} />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 block leading-tight">{cat.label}</span>
                  <span className="text-[8.5px] font-semibold text-slate-400 block leading-tight">
                    {language === 'ar' ? 'تتبع فئات الأعطال' : 'Breakdown logs tracking'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Panel Footer (Unchanged to maintain consistency, styled beautifully) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/60">
        {/* KPI 1: Total cases */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Wrench size={13} />
            <span className="text-[9px] font-black uppercase tracking-wider">{language === 'ar' ? 'إجمالي الحالات' : 'Total Handled'}</span>
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white font-sans">{stats.total}</p>
          <span className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
            {language === 'ar' ? 'أوامر عمل مسجلة وموثقة' : 'Recorded workshop requests'}
          </span>
        </div>

        {/* KPI 2: Most common */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl">
          <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 mb-1">
            <AlertTriangle size={13} />
            <span className="text-[9px] font-black uppercase tracking-wider">{language === 'ar' ? 'الأكثر شيوعاً' : 'Most Prevailing'}</span>
          </div>
          <p className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">
            {stats.mostCommon ? stats.mostCommon.name : (language === 'ar' ? 'لا يوجد' : 'None')}
          </p>
          <span className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5 font-sans">
            {stats.mostCommon 
              ? (language === 'ar' ? `معدل تكرار ${stats.mostCommon.percentage}%` : `Occurrence rate ${stats.mostCommon.percentage}%`)
              : (language === 'ar' ? 'بيانات غير كافية' : 'Insufficient statistics')
            }
          </span>
        </div>

        {/* KPI 3: High priority */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl">
          <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400 mb-1">
            <ShieldAlert size={13} />
            <span className="text-[9px] font-black uppercase tracking-wider">{language === 'ar' ? 'أعطال حرجة' : 'Critical Faults'}</span>
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white font-sans">{stats.critical}</p>
          <span className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
            {language === 'ar' ? 'تتطلب تدخلاً عاجلاً وفورياً' : 'Urgent priority action'}
          </span>
        </div>

        {/* KPI 4: Completion rate */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl">
          <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400 mb-1">
            <CheckCircle size={13} />
            <span className="text-[9px] font-black uppercase tracking-wider">{language === 'ar' ? 'نسبة الإنجاز كلياً' : 'SLA Resolution'}</span>
          </div>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-sans">{stats.completionRate}%</p>
          <span className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
            {language === 'ar' ? 'معدل إغلاق تذاكر الصيانة' : 'Resolved order clearance ratio'}
          </span>
        </div>
      </div>
    </div>
  );
}
