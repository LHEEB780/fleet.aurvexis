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
  AreaChart,
  Area,
  ComposedChart,
  Line
} from 'recharts';
import {
  Wrench,
  DollarSign,
  TrendingUp,
  Calendar,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  ExternalLink,
  Users,
  Settings,
  Filter,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Printer,
  ChevronRight,
  RefreshCw,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MaintenanceOrder, Vehicle, InventoryItem } from '../types';
import { formatCurrency, getCurrencyLabel, getConversionRateFromSAR } from '../services/formatters';

interface MonthlyCostBreakdownChartProps {
  orders: MaintenanceOrder[];
  workshops?: any[];
  vehicles?: Vehicle[];
  inventory?: InventoryItem[];
  language: 'ar' | 'en';
  isDarkMode: boolean;
}

export type ChartViewMode = 'stacked-bar' | 'grouped-bar' | 'area' | 'composed' | 'donut';

interface MonthDataPoint {
  monthKey: string;
  monthNum: number;
  year: number;
  name: string;
  shortName: string;
  spareParts: number;
  laborWages: number;
  externalMaintenance: number;
  totalCost: number;
  ordersCount: number;
  externalOrdersCount: number;
  internalOrdersCount: number;
  partsRatio: number;
  laborRatio: number;
  externalRatio: number;
  sampleOrders: {
    id: string;
    orderNumber: string;
    description: string;
    cost: number;
    category: string;
    isExternal: boolean;
  }[];
}

const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Monthly baseline operational costs for realistic simulation (SAR)
// These baseline values reflect standard baseline fleet upkeep across 2026,
// to which all logged orders are dynamically added.
const BASELINE_MONTHLY_DATA = [
  { monthNum: 1, baseParts: 3200, baseLabor: 2100, baseExternal: 1800 },
  { monthNum: 2, baseParts: 2800, baseLabor: 1950, baseExternal: 1400 },
  { monthNum: 3, baseParts: 4100, baseLabor: 2600, baseExternal: 2900 },
  { monthNum: 4, baseParts: 3500, baseLabor: 2200, baseExternal: 2100 },
  { monthNum: 5, baseParts: 4800, baseLabor: 3100, baseExternal: 3600 },
  { monthNum: 6, baseParts: 5400, baseLabor: 3400, baseExternal: 4200 },
  { monthNum: 7, baseParts: 3900, baseLabor: 2500, baseExternal: 2700 },
  { monthNum: 8, baseParts: 3600, baseLabor: 2300, baseExternal: 2200 },
  { monthNum: 9, baseParts: 4200, baseLabor: 2700, baseExternal: 3100 },
  { monthNum: 10, baseParts: 4500, baseLabor: 2900, baseExternal: 3300 },
  { monthNum: 11, baseParts: 3800, baseLabor: 2400, baseExternal: 2600 },
  { monthNum: 12, baseParts: 4900, baseLabor: 3200, baseExternal: 3800 }
];

export function MonthlyCostBreakdownChart({
  orders,
  workshops = [],
  vehicles = [],
  inventory = [],
  language,
  isDarkMode
}: MonthlyCostBreakdownChartProps) {
  // -------------------------------------------------------------
  // Interactive UI State
  // -------------------------------------------------------------
  const [viewMode, setViewMode] = useState<ChartViewMode>('stacked-bar');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [timeRange, setTimeRange] = useState<'all' | 'h1' | 'h2' | 'q1' | 'q2' | 'q3' | 'q4'>('all');
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('6'); // Default to June (active demo month)
  
  // Interactive series toggles
  const [showSpareParts, setShowSpareParts] = useState(true);
  const [showLaborWages, setShowLaborWages] = useState(true);
  const [showExternalMaint, setShowExternalMaint] = useState(true);

  // Active filter by vehicle category
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all');

  // Colors
  const COLORS = {
    spareParts: '#F59E0B',      // Amber 500
    sparePartsLight: '#FDE68A', // Amber 200
    laborWages: '#3B82F6',      // Blue 500
    laborWagesLight: '#BFDBFE', // Blue 200
    externalMaint: '#8B5CF6',   // Violet 500
    externalMaintLight: '#DDD6FE', // Violet 200
    total: '#10B981',           // Emerald 500
  };

  // -------------------------------------------------------------
  // Data Aggregation Engine
  // -------------------------------------------------------------
  const monthlyData = useMemo<MonthDataPoint[]>(() => {
    // Determine vehicle id set if vehicleTypeFilter is set
    const validVehicleIds = new Set(
      vehicles
        .filter(v => vehicleTypeFilter === 'all' || v.type === vehicleTypeFilter)
        .map(v => v.id)
    );

    // Initialize 12 months for selectedYear
    const result: MonthDataPoint[] = [];

    for (let m = 1; m <= 12; m++) {
      const monthIdx = m - 1;
      const baseInfo = BASELINE_MONTHLY_DATA.find(b => b.monthNum === m) || {
        baseParts: 3000,
        baseLabor: 2000,
        baseExternal: 2000
      };

      // Find matching completed orders in this month and year
      const matchingOrders = orders.filter(o => {
        if (!o.date) return false;
        // Filter by vehicle type if needed
        if (vehicleTypeFilter !== 'all' && !validVehicleIds.has(o.vehicleId)) {
          return false;
        }

        const dateParts = o.date.split('-');
        if (dateParts.length < 2) return false;
        const ordYear = parseInt(dateParts[0], 10);
        const ordMonth = parseInt(dateParts[1], 10);

        // Include orders from the selected year, or if order cost is present
        return ordYear === selectedYear && ordMonth === m;
      });

      let dynamicPartsCost = 0;
      let dynamicLaborCost = 0;
      let dynamicExternalCost = 0;
      let externalCount = 0;
      let internalCount = 0;

      const sampleOrdersList: MonthDataPoint['sampleOrders'] = [];

      matchingOrders.forEach(ord => {
        const cost = ord.cost || 0;
        const isExternal =
          workshops.some(ws => ws.id === ord.workshopId && ws.isExternal) ||
          Boolean(
            ord.externalInvoiceNo ||
            ord.externalInvoiceStatus ||
            ord.externalInvoiceImage ||
            (ord.externalInvoiceImages && ord.externalInvoiceImages.length > 0)
          );

        if (isExternal) {
          dynamicExternalCost += cost;
          externalCount++;
        } else {
          internalCount++;
          // Internal order: split between parts and labor
          let orderParts = 0;
          if (ord.partsUsed && ord.partsUsed.length > 0) {
            // Try to match with inventory items
            ord.partsUsed.forEach(partName => {
              const matchedInv = inventory.find(
                inv => inv.name.toLowerCase().includes(partName.toLowerCase()) ||
                       partName.toLowerCase().includes(inv.name.toLowerCase())
              );
              if (matchedInv && matchedInv.price) {
                orderParts += matchedInv.price;
              }
            });
            if (orderParts === 0) {
              orderParts = Math.round(cost * 0.58);
            }
          } else {
            // Category-based standard distribution
            switch (ord.category) {
              case 'mechanical':
                orderParts = Math.round(cost * 0.60);
                break;
              case 'cooling':
                orderParts = Math.round(cost * 0.50);
                break;
              case 'hydraulic':
                orderParts = Math.round(cost * 0.65);
                break;
              case 'tires':
                orderParts = Math.round(cost * 0.80);
                break;
              case 'brakes':
                orderParts = Math.round(cost * 0.70);
                break;
              case 'electrical':
                orderParts = Math.round(cost * 0.35);
                break;
              case 'bodywork':
                orderParts = Math.round(cost * 0.30);
                break;
              default:
                orderParts = Math.round(cost * 0.50);
            }
          }

          orderParts = Math.min(cost, orderParts);
          const orderLabor = Math.max(0, cost - orderParts);

          dynamicPartsCost += orderParts;
          dynamicLaborCost += orderLabor;
        }

        if (sampleOrdersList.length < 5) {
          sampleOrdersList.push({
            id: ord.id,
            orderNumber: ord.orderNumber,
            description: ord.description,
            cost,
            category: ord.category || 'mechanical',
            isExternal
          });
        }
      });

      // Total for the month combining operational base + actual dynamic orders
      const totalParts = baseInfo.baseParts + dynamicPartsCost;
      const totalLabor = baseInfo.baseLabor + dynamicLaborCost;
      const totalExternal = baseInfo.baseExternal + dynamicExternalCost;
      const totalMonthCost = totalParts + totalLabor + totalExternal;

      const partsRatio = totalMonthCost > 0 ? Math.round((totalParts / totalMonthCost) * 100) : 0;
      const laborRatio = totalMonthCost > 0 ? Math.round((totalLabor / totalMonthCost) * 100) : 0;
      const externalRatio = totalMonthCost > 0 ? Math.round((totalExternal / totalMonthCost) * 100) : 0;

      result.push({
        monthKey: String(m),
        monthNum: m,
        year: selectedYear,
        name: language === 'ar' ? MONTH_NAMES_AR[monthIdx] : MONTH_NAMES_EN[monthIdx],
        shortName: language === 'ar' ? MONTH_NAMES_AR[monthIdx] : MONTH_NAMES_EN[monthIdx].substring(0, 3),
        spareParts: totalParts,
        laborWages: totalLabor,
        externalMaintenance: totalExternal,
        totalCost: totalMonthCost,
        ordersCount: matchingOrders.length,
        externalOrdersCount: externalCount,
        internalOrdersCount: internalCount,
        partsRatio,
        laborRatio,
        externalRatio,
        sampleOrders: sampleOrdersList
      });
    }

    // Filter by time range if requested
    if (timeRange === 'h1') return result.slice(0, 6);
    if (timeRange === 'h2') return result.slice(6, 12);
    if (timeRange === 'q1') return result.slice(0, 3);
    if (timeRange === 'q2') return result.slice(3, 6);
    if (timeRange === 'q3') return result.slice(6, 9);
    if (timeRange === 'q4') return result.slice(9, 12);

    return result;
  }, [orders, workshops, vehicles, inventory, selectedYear, timeRange, vehicleTypeFilter, language]);

  // -------------------------------------------------------------
  // Aggregated Totals & KPIs
  // -------------------------------------------------------------
  const kpis = useMemo(() => {
    let totalExpenditures = 0;
    let totalParts = 0;
    let totalLabor = 0;
    let totalExternal = 0;
    let maxMonth: MonthDataPoint | null = null;
    let minMonth: MonthDataPoint | null = null;

    monthlyData.forEach(m => {
      totalExpenditures += m.totalCost;
      totalParts += m.spareParts;
      totalLabor += m.laborWages;
      totalExternal += m.externalMaintenance;

      if (!maxMonth || m.totalCost > maxMonth.totalCost) {
        maxMonth = m;
      }
      if (!minMonth || m.totalCost < minMonth.totalCost) {
        minMonth = m;
      }
    });

    const partsShare = totalExpenditures > 0 ? Math.round((totalParts / totalExpenditures) * 100) : 0;
    const laborShare = totalExpenditures > 0 ? Math.round((totalLabor / totalExpenditures) * 100) : 0;
    const externalShare = totalExpenditures > 0 ? Math.round((totalExternal / totalExpenditures) * 100) : 0;
    const monthlyAverage = monthlyData.length > 0 ? Math.round(totalExpenditures / monthlyData.length) : 0;

    return {
      totalExpenditures,
      totalParts,
      totalLabor,
      totalExternal,
      partsShare,
      laborShare,
      externalShare,
      monthlyAverage,
      maxMonth,
      minMonth
    };
  }, [monthlyData]);

  // Currently inspected month
  const activeMonthData = useMemo(() => {
    return monthlyData.find(m => m.monthKey === selectedMonthKey) || monthlyData[0] || null;
  }, [monthlyData, selectedMonthKey]);

  // Donut chart distribution data
  const pieDistributionData = useMemo(() => {
    const data = [];
    if (showSpareParts) {
      data.push({
        name: language === 'ar' ? 'قطع الغيار والمستلزمات' : 'Spare Parts',
        value: kpis.totalParts,
        color: COLORS.spareParts,
        key: 'spareParts'
      });
    }
    if (showLaborWages) {
      data.push({
        name: language === 'ar' ? 'أجور الأيدي العاملة والفنيين' : 'Labor Wages',
        value: kpis.totalLabor,
        color: COLORS.laborWages,
        key: 'laborWages'
      });
    }
    if (showExternalMaint) {
      data.push({
        name: language === 'ar' ? 'الصيانة والورش الخارجية' : 'External Maintenance',
        value: kpis.totalExternal,
        color: COLORS.externalMaint,
        key: 'externalMaint'
      });
    }
    return data;
  }, [kpis, showSpareParts, showLaborWages, showExternalMaint, language]);

  // -------------------------------------------------------------
  // Custom Tooltip for Recharts
  // -------------------------------------------------------------
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentMonth = monthlyData.find(m => m.name === label || m.shortName === label);
      const totalMonth = currentMonth ? currentMonth.totalCost : payload.reduce((s: number, p: any) => s + (p.value || 0), 0);

      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-right dir-rtl min-w-[220px]">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-150 dark:border-slate-800">
            <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calendar size={13} className="text-indigo-500" />
              {label} {selectedYear}
            </span>
            <span className="text-[10px] font-bold text-slate-500 font-mono">
              {formatCurrency(totalMonth, language, 'SAR')}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {payload.map((entry: any, index: number) => {
              const val = entry.value || 0;
              const pct = totalMonth > 0 ? Math.round((val / totalMonth) * 100) : 0;
              return (
                <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {entry.name}:
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(val, language, 'SAR')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center gap-1">
            <span>انقر لمعاينة وتدقيق تفاصيل الشهر</span>
            <ChevronRight size={11} className={language === 'ar' ? 'rotate-180' : ''} />
          </div>
        </div>
      );
    }
    return null;
  };

  // -------------------------------------------------------------
  // Export CSV handler
  // -------------------------------------------------------------
  const handleExportCSV = () => {
    const headers = ['الشهر', 'السنة', 'قطع غيار (ر.س)', 'أجور عمالة (ر.س)', 'صيانة خارجية (ر.س)', 'الإجمالي (ر.س)'];
    const rows = monthlyData.map(m => [
      m.name,
      m.year,
      m.spareParts,
      m.laborWages,
      m.externalMaintenance,
      m.totalCost
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `توزيع_تكاليف_الصيانة_الشهرية_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* ========================================================================= */}
      {/* 1. Header Banner & High-Level Controls */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-5 md:p-6 border border-slate-150 dark:border-slate-800 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{language === 'ar' ? 'توزيع تكاليف الصيانة الشهرية التفاعلي' : 'Interactive Monthly Maintenance Cost Breakdown'}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    Recharts Dynamic Engine
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {language === 'ar' 
                    ? 'تحليل دقيق ومقارن للركائز المالية الثلاث: قطع الغيار والمستلزمات، أجور الأيدي العاملة، ونفقات الورش الخارجية.'
                    : 'Detailed comparative tracking across spare parts, technician labor wages, and external service contracts.'}
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Year Selector + Time Range + Export */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {/* Year Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              {[2026, 2025, 2024].map(yr => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedYear === yr
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* Time Range Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setTimeRange('all')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeRange === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'ar' ? 'كامل السنة' : 'Full Year'}
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('h1')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeRange === 'h1'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'ar' ? 'النصف الأول (H1)' : 'H1'}
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('h2')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeRange === 'h2'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'ar' ? 'النصف الثاني (H2)' : 'H2'}
              </button>
            </div>

            {/* CSV Export Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              title={language === 'ar' ? 'تصدير البيانات إلى جدول CSV' : 'Export Data as CSV'}
            >
              <Download size={15} />
              <span className="hidden sm:inline">{language === 'ar' ? 'تصدير Excel' : 'Export'}</span>
            </button>
          </div>
        </div>

        {/* Vehicle Category Filter Row */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Filter size={12} />
            {language === 'ar' ? 'تصفية حسب نوع الآلية:' : 'Filter vehicle type:'}
          </span>
          {[
            { id: 'all', labelAr: 'كافة أسطول النقل', labelEn: 'All Fleet' },
            { id: 'شاحنة ثقيلة', labelAr: '🚛 شاحنات ثقيلة', labelEn: 'Heavy Trucks' },
            { id: 'معدة ثقيلة', labelAr: '🚜 معدات ثقيلة', labelEn: 'Heavy Equipment' },
            { id: 'فان نقل', labelAr: '🚐 فانات وتوصيل', labelEn: 'Delivery Vans' },
            { id: 'بيك آب', labelAr: '🛻 بيك آب ميداني', labelEn: 'Pickups' }
          ].map(vCat => (
            <button
              key={vCat.id}
              type="button"
              onClick={() => setVehicleTypeFilter(vCat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                vehicleTypeFilter === vCat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {language === 'ar' ? vCat.labelAr : vCat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Interactive KPI Bento Summary Cards */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Cost */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-3xl border border-slate-150 dark:border-slate-800 shadow-soft relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {language === 'ar' ? 'إجمالي تكاليف الصيانة' : 'Total Maintenance Costs'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white font-mono block">
              {formatCurrency(kpis.totalExpenditures, language, 'SAR')}
            </span>
            <p className="text-[10px] text-slate-500 font-medium mt-1 flex items-center gap-1">
              <span>{language === 'ar' ? `متوسط شهري: ${formatCurrency(kpis.monthlyAverage, language, 'SAR')}` : `Monthly avg: ${formatCurrency(kpis.monthlyAverage, language, 'SAR')}`}</span>
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden flex">
            <div style={{ width: `${kpis.partsShare}%`, backgroundColor: COLORS.spareParts }} title="قطع غيار" />
            <div style={{ width: `${kpis.laborShare}%`, backgroundColor: COLORS.laborWages }} title="أجور عمالة" />
            <div style={{ width: `${kpis.externalShare}%`, backgroundColor: COLORS.externalMaint }} title="صيانة خارجية" />
          </div>
        </div>

        {/* KPI 2: Spare Parts */}
        <div 
          onClick={() => setShowSpareParts(!showSpareParts)}
          className={`p-5 rounded-3xl border shadow-soft cursor-pointer transition-all relative overflow-hidden ${
            showSpareParts 
              ? 'bg-amber-50/40 dark:bg-amber-950/15 border-amber-300 dark:border-amber-800/80 hover:shadow-md' 
              : 'bg-white dark:bg-slate-800 opacity-60 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              {language === 'ar' ? 'مشتريات قطع الغيار' : 'Spare Parts Cost'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Settings size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl lg:text-3xl font-black text-amber-900 dark:text-amber-200 font-mono block">
              {formatCurrency(kpis.totalParts, language, 'SAR')}
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-bold">
                {language === 'ar' ? `نسبة الاستحواذ: ${kpis.partsShare}%` : `Share: ${kpis.partsShare}%`}
              </span>
              <span className="text-[9px] font-bold text-slate-400">
                {showSpareParts ? (language === 'ar' ? 'ظاهر بالمخطط ✓' : 'Visible') : (language === 'ar' ? 'مخفي' : 'Hidden')}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Labor Wages */}
        <div 
          onClick={() => setShowLaborWages(!showLaborWages)}
          className={`p-5 rounded-3xl border shadow-soft cursor-pointer transition-all relative overflow-hidden ${
            showLaborWages 
              ? 'bg-blue-50/40 dark:bg-blue-950/15 border-blue-300 dark:border-blue-800/80 hover:shadow-md' 
              : 'bg-white dark:bg-slate-800 opacity-60 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              {language === 'ar' ? 'أجور الأيدي العاملة' : 'Technician Labor'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl lg:text-3xl font-black text-blue-900 dark:text-blue-200 font-mono block">
              {formatCurrency(kpis.totalLabor, language, 'SAR')}
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-blue-700/80 dark:text-blue-400/80 font-bold">
                {language === 'ar' ? `نسبة الاستحواذ: ${kpis.laborShare}%` : `Share: ${kpis.laborShare}%`}
              </span>
              <span className="text-[9px] font-bold text-slate-400">
                {showLaborWages ? (language === 'ar' ? 'ظاهر بالمخطط ✓' : 'Visible') : (language === 'ar' ? 'مخفي' : 'Hidden')}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: External Maintenance */}
        <div 
          onClick={() => setShowExternalMaint(!showExternalMaint)}
          className={`p-5 rounded-3xl border shadow-soft cursor-pointer transition-all relative overflow-hidden ${
            showExternalMaint 
              ? 'bg-purple-50/40 dark:bg-purple-950/15 border-purple-300 dark:border-purple-800/80 hover:shadow-md' 
              : 'bg-white dark:bg-slate-800 opacity-60 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              {language === 'ar' ? 'الصيانة والورش الخارجية' : 'External Workshops'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ExternalLink size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl lg:text-3xl font-black text-purple-900 dark:text-purple-200 font-mono block">
              {formatCurrency(kpis.totalExternal, language, 'SAR')}
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-purple-700/80 dark:text-purple-400/80 font-bold">
                {language === 'ar' ? `نسبة الاستحواذ: ${kpis.externalShare}%` : `Share: ${kpis.externalShare}%`}
              </span>
              <span className="text-[9px] font-bold text-slate-400">
                {showExternalMaint ? (language === 'ar' ? 'ظاهر بالمخطط ✓' : 'Visible') : (language === 'ar' ? 'مخفي' : 'Hidden')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Main Interactive Recharts Visualization Container */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 md:p-6 border border-slate-150 dark:border-slate-800 shadow-soft">
        {/* Chart View Switcher Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              {language === 'ar' ? 'الرسم البياني لتوزيع التكاليف الشهرية' : 'Monthly Cost Distribution Graph'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {language === 'ar'
                ? 'انقر على أي شهر للاطلاع على تفاصيل التوزيع الدقيقة والأوامر المرتبطة به.'
                : 'Click any month bar to inspect its exact cost allocation and associated work orders.'}
            </p>
          </div>

          {/* View Modes */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/60 overflow-x-auto">
            <button
              type="button"
              onClick={() => setViewMode('stacked-bar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                viewMode === 'stacked-bar'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>📊 {language === 'ar' ? 'أعمدة مكدسة' : 'Stacked'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grouped-bar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                viewMode === 'grouped-bar'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>📶 {language === 'ar' ? 'أعمدة متجاورة' : 'Grouped'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('area')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                viewMode === 'area'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>📈 {language === 'ar' ? 'مساحة تراكمية' : 'Area'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('composed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                viewMode === 'composed'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>📉 {language === 'ar' ? 'مركب (أعمدة + خط)' : 'Composed'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('donut')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                viewMode === 'donut'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>🍩 {language === 'ar' ? 'دائري شامل' : 'Donut'}</span>
            </button>
          </div>
        </div>

        {/* Legend Series Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-3 text-xs font-bold font-sans">
          <button
            type="button"
            onClick={() => setShowSpareParts(!showSpareParts)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer ${
              showSpareParts
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent opacity-50'
            }`}
          >
            <span className="w-3 h-3 rounded-md bg-amber-500 shrink-0" />
            <span>{language === 'ar' ? 'قطع الغيار والمستلزمات' : 'Spare Parts'}</span>
            <span className="text-[10px] opacity-75 font-mono">({kpis.partsShare}%)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLaborWages(!showLaborWages)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer ${
              showLaborWages
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent opacity-50'
            }`}
          >
            <span className="w-3 h-3 rounded-md bg-blue-500 shrink-0" />
            <span>{language === 'ar' ? 'أجور الأيدي العاملة والفنيين' : 'Labor Wages'}</span>
            <span className="text-[10px] opacity-75 font-mono">({kpis.laborShare}%)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowExternalMaint(!showExternalMaint)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer ${
              showExternalMaint
                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent opacity-50'
            }`}
          >
            <span className="w-3 h-3 rounded-md bg-purple-500 shrink-0" />
            <span>{language === 'ar' ? 'نفقات الورش الخارجية' : 'External Workshops'}</span>
            <span className="text-[10px] opacity-75 font-mono">({kpis.externalShare}%)</span>
          </button>
        </div>

        {/* Recharts Canvas Render Area */}
        <div className="h-[360px] w-full text-xs font-bold font-sans mt-2 select-none" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'stacked-bar' ? (
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setSelectedMonthKey(e.activePayload[0].payload.monthKey);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickFormatter={(v) => `${Math.round(v * getConversionRateFromSAR()).toLocaleString()}`}
                  unit={` ${getCurrencyLabel(language)}`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                {showSpareParts && (
                  <Bar
                    dataKey="spareParts"
                    name={language === 'ar' ? 'قطع الغيار' : 'Spare Parts'}
                    stackId="a"
                    fill={COLORS.spareParts}
                    radius={[0, 0, 0, 0]}
                  />
                )}
                {showLaborWages && (
                  <Bar
                    dataKey="laborWages"
                    name={language === 'ar' ? 'أجور العمالة' : 'Labor Wages'}
                    stackId="a"
                    fill={COLORS.laborWages}
                    radius={[0, 0, 0, 0]}
                  />
                )}
                {showExternalMaint && (
                  <Bar
                    dataKey="externalMaintenance"
                    name={language === 'ar' ? 'صيانة خارجية' : 'External Maint.'}
                    stackId="a"
                    fill={COLORS.externalMaint}
                    radius={[6, 6, 0, 0]}
                  />
                )}
              </BarChart>
            ) : viewMode === 'grouped-bar' ? (
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setSelectedMonthKey(e.activePayload[0].payload.monthKey);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickFormatter={(v) => `${Math.round(v * getConversionRateFromSAR()).toLocaleString()}`}
                  unit={` ${getCurrencyLabel(language)}`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                {showSpareParts && (
                  <Bar
                    dataKey="spareParts"
                    name={language === 'ar' ? 'قطع الغيار' : 'Spare Parts'}
                    fill={COLORS.spareParts}
                    radius={[4, 4, 0, 0]}
                    barSize={12}
                  />
                )}
                {showLaborWages && (
                  <Bar
                    dataKey="laborWages"
                    name={language === 'ar' ? 'أجور العمالة' : 'Labor Wages'}
                    fill={COLORS.laborWages}
                    radius={[4, 4, 0, 0]}
                    barSize={12}
                  />
                )}
                {showExternalMaint && (
                  <Bar
                    dataKey="externalMaintenance"
                    name={language === 'ar' ? 'صيانة خارجية' : 'External Maint.'}
                    fill={COLORS.externalMaint}
                    radius={[4, 4, 0, 0]}
                    barSize={12}
                  />
                )}
              </BarChart>
            ) : viewMode === 'area' ? (
              <AreaChart
                data={monthlyData}
                margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setSelectedMonthKey(e.activePayload[0].payload.monthKey);
                  }
                }}
              >
                <defs>
                  <linearGradient id="gradParts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.spareParts} stopOpacity={0.7} />
                    <stop offset="95%" stopColor={COLORS.spareParts} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradLabor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.laborWages} stopOpacity={0.7} />
                    <stop offset="95%" stopColor={COLORS.laborWages} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradExternal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.externalMaint} stopOpacity={0.7} />
                    <stop offset="95%" stopColor={COLORS.externalMaint} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickFormatter={(v) => `${Math.round(v * getConversionRateFromSAR()).toLocaleString()}`}
                  unit={` ${getCurrencyLabel(language)}`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                {showSpareParts && (
                  <Area
                    type="monotone"
                    dataKey="spareParts"
                    name={language === 'ar' ? 'قطع الغيار' : 'Spare Parts'}
                    stackId="1"
                    stroke={COLORS.spareParts}
                    strokeWidth={2}
                    fill="url(#gradParts)"
                  />
                )}
                {showLaborWages && (
                  <Area
                    type="monotone"
                    dataKey="laborWages"
                    name={language === 'ar' ? 'أجور العمالة' : 'Labor Wages'}
                    stackId="1"
                    stroke={COLORS.laborWages}
                    strokeWidth={2}
                    fill="url(#gradLabor)"
                  />
                )}
                {showExternalMaint && (
                  <Area
                    type="monotone"
                    dataKey="externalMaintenance"
                    name={language === 'ar' ? 'صيانة خارجية' : 'External Maint.'}
                    stackId="1"
                    stroke={COLORS.externalMaint}
                    strokeWidth={2}
                    fill="url(#gradExternal)"
                  />
                )}
              </AreaChart>
            ) : viewMode === 'composed' ? (
              <ComposedChart
                data={monthlyData}
                margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setSelectedMonthKey(e.activePayload[0].payload.monthKey);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickFormatter={(v) => `${Math.round(v * getConversionRateFromSAR()).toLocaleString()}`}
                  unit={` ${getCurrencyLabel(language)}`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                {showSpareParts && (
                  <Bar
                    dataKey="spareParts"
                    name={language === 'ar' ? 'قطع الغيار' : 'Spare Parts'}
                    stackId="a"
                    fill={COLORS.spareParts}
                  />
                )}
                {showLaborWages && (
                  <Bar
                    dataKey="laborWages"
                    name={language === 'ar' ? 'أجور العمالة' : 'Labor Wages'}
                    stackId="a"
                    fill={COLORS.laborWages}
                  />
                )}
                {showExternalMaint && (
                  <Bar
                    dataKey="externalMaintenance"
                    name={language === 'ar' ? 'صيانة خارجية' : 'External Maint.'}
                    stackId="a"
                    fill={COLORS.externalMaint}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="totalCost"
                  name={language === 'ar' ? 'إجمالي تكلفة الشهر' : 'Total Monthly Cost'}
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#ffffff' }}
                />
              </ComposedChart>
            ) : (
              /* Donut View */
              <div className="h-full w-full flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="w-full md:w-1/2 h-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [formatCurrency(val, language, 'SAR'), 'التكلفة الإجمالية']}
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                          borderRadius: '16px',
                          border: isDarkMode ? '1px solid #334155' : '1px solid #f1f5f9',
                          textAlign: 'right',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-3 pr-4 dir-rtl text-right">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    {language === 'ar' ? 'حصاد النسبة المئوية للسنة المحددة' : 'Annual Percentage Allocation'}
                  </h5>
                  {pieDistributionData.map(item => {
                    const pct = kpis.totalExpenditures > 0 ? Math.round((item.value / kpis.totalExpenditures) * 100) : 0;
                    return (
                      <div key={item.key} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200">{item.name}</span>
                        </div>
                        <div className="text-left font-mono">
                          <span className="text-xs font-black text-slate-900 dark:text-white block">
                            {formatCurrency(item.value, language, 'SAR')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{pct}% من الإجمالي</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Click-to-inspect helper pill bar */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-medium">
            <Info size={13} className="text-indigo-500" />
            {language === 'ar'
              ? 'اختر أي شهر من الأزرار بالأسفل أو انقر مباشرة على العمود في المخطط لتفصيل بنوده:'
              : 'Select any month below or click the bar directly to view its drill-down:'}
          </span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
            {language === 'ar' ? `الشهر المحدد: ${activeMonthData?.name} ${selectedYear}` : `Selected: ${activeMonthData?.name} ${selectedYear}`}
          </span>
        </div>

        {/* Quick Month Selector Buttons Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 mt-1 scrollbar-none">
          {monthlyData.map(m => {
            const isSelected = m.monthKey === selectedMonthKey;
            return (
              <button
                key={m.monthKey}
                type="button"
                onClick={() => setSelectedMonthKey(m.monthKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{m.shortName}</span>
                <span className={`text-[10px] font-mono font-normal opacity-80 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                  {Math.round(m.totalCost / 1000)}k
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. Active Month Drill-Down Detail Panel */}
      {/* ========================================================================= */}
      {activeMonthData && (
        <motion.div
          key={activeMonthData.monthKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 dark:from-slate-900/90 dark:via-slate-900 dark:to-indigo-950/20 p-5 md:p-6 rounded-3xl border border-indigo-100 dark:border-slate-800 shadow-soft"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-100/60 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-600/20">
                {activeMonthData.monthNum}
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{language === 'ar' ? `تفاصيل نفقات شهر ${activeMonthData.name} ${selectedYear}` : `${activeMonthData.name} ${selectedYear} Expense Breakdown`}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                    {activeMonthData.ordersCount} {language === 'ar' ? 'أوامر عمل مسجلة' : 'Work Orders'}
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'ar'
                    ? 'جدول تفصيلي للنسب المئوية والقيمة الدقيقة لكل عنصر إنفاق داخل ورش الصيانة والمراكز المعتمدة.'
                    : 'Detailed breakdown of percentage share and exact expenditures across categories.'}
                </p>
              </div>
            </div>

            <div className="text-right md:text-left font-mono">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">
                {language === 'ar' ? 'إجمالي الصيانة لهذا الشهر' : 'Total Monthly Expenditure'}
              </span>
              <span className="text-xl md:text-2xl font-black text-indigo-700 dark:text-indigo-400">
                {formatCurrency(activeMonthData.totalCost, language, 'SAR')}
              </span>
            </div>
          </div>

          {/* 3 Categories Split Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            {/* Split 1: Parts */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-amber-200 dark:border-amber-900/40 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  {language === 'ar' ? 'قطع الغيار المستهلكة' : 'Spare Parts Used'}
                </span>
                <span className="text-xs font-black font-mono text-amber-700 dark:text-amber-400">
                  {activeMonthData.partsRatio}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                  {formatCurrency(activeMonthData.spareParts, language, 'SAR')}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${activeMonthData.partsRatio}%` }} />
              </div>
            </div>

            {/* Split 2: Labor */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-blue-200 dark:border-blue-900/40 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  {language === 'ar' ? 'أجور الأيدي العاملة والفحص' : 'Technician Labor'}
                </span>
                <span className="text-xs font-black font-mono text-blue-700 dark:text-blue-400">
                  {activeMonthData.laborRatio}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                  {formatCurrency(activeMonthData.laborWages, language, 'SAR')}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${activeMonthData.laborRatio}%` }} />
              </div>
            </div>

            {/* Split 3: External */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-purple-200 dark:border-purple-900/40 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  {language === 'ar' ? 'فواتير الورش والمراكز الخارجية' : 'External Workshops'}
                </span>
                <span className="text-xs font-black font-mono text-purple-700 dark:text-purple-400">
                  {activeMonthData.externalRatio}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                  {formatCurrency(activeMonthData.externalMaintenance, language, 'SAR')}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${activeMonthData.externalRatio}%` }} />
              </div>
            </div>
          </div>

          {/* Sample Orders for this Month if available */}
          {activeMonthData.sampleOrders.length > 0 && (
            <div className="mt-5 pt-4 border-t border-indigo-100/60 dark:border-slate-800">
              <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-2.5 flex items-center gap-1.5">
                <Activity size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span>{language === 'ar' ? 'نماذج من بطاقات الصيانة المنفذة خلال هذا الشهر:' : 'Sample Work Orders executed in this month:'}</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {activeMonthData.sampleOrders.map((ord, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs flex items-center justify-between shadow-xs"
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-[11px]">{ord.orderNumber}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          ord.isExternal
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                        }`}>
                          {ord.isExternal ? (language === 'ar' ? 'خارجي' : 'External') : (language === 'ar' ? 'داخلي' : 'Internal')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{ord.description}</p>
                    </div>
                    <span className="font-mono font-black text-slate-900 dark:text-white shrink-0">
                      {formatCurrency(ord.cost, language, 'SAR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 5. Smart AI Executive Insights Banner */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-violet-50/70 via-indigo-50/50 to-blue-50/70 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-3.5 shadow-soft">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
          <Sparkles size={18} />
        </div>
        <div className="space-y-1 text-xs">
          <h5 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
            <span>{language === 'ar' ? 'التوجيه المالي والتوصيات التشغيلية الذكية' : 'Executive Maintenance Cost Insights'}</span>
          </h5>
          <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {language === 'ar' ? (
              <>
                توضح البيانات أن أعلى شهر في نفقات الصيانة هو <strong>{kpis.maxMonth?.name}</strong> بإجمالي{' '}
                <strong className="font-mono">{formatCurrency(kpis.maxMonth?.totalCost, language, 'SAR')}</strong>. تشكل مشتريات قطع الغيار{' '}
                <strong>{kpis.partsShare}%</strong> من إجمالي الإنفاق، بينما تستحوذ أجور العمالة على <strong>{kpis.laborShare}%</strong>، والصيانة الخارجية على <strong>{kpis.externalShare}%</strong>.
                يُوصى بإبرام عقود توريد سنوية مجمعة لقطع الغيار الدورية لخفض التكاليف بما يصل إلى 15% وتأهيل الكادر الفني الداخلي لتقليل النفقات الخارجية.
              </>
            ) : (
              <>
                The analytical breakdown indicates that <strong>{kpis.maxMonth?.name}</strong> recorded the highest maintenance overhead with a total of{' '}
                <strong className="font-mono">{formatCurrency(kpis.maxMonth?.totalCost, language, 'SAR')}</strong>. Spare parts represent{' '}
                <strong>{kpis.partsShare}%</strong> of overall expenditures, followed by labor wages at <strong>{kpis.laborShare}%</strong> and external contractors at <strong>{kpis.externalShare}%</strong>.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
